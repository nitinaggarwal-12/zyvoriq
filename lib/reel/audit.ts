import { QualityGateId, ReelProductionManifest } from "./types";

export interface ReelAuditResult {
  passed: boolean;
  score: number;
  warnings: string[];
  failures: string[];
}

const MAX_TRANSCRIPT_WER = 0.06;
const MIN_TRANSCRIPT_COVERAGE = 0.97;
const finalQaStates = new Set(["AUDITING", "APPROVAL_REQUIRED", "READY"]);
const REQUIRED_V2_GATES: QualityGateId[] = [
  "QG-TRANSCRIPT-01", "QG-CAP-01", "QG-PERF-01", "QG-LIP-01", "QG-EMO-01",
  "QG-BND-01", "QG-OBJ-01", "QG-VIS-01", "QG-AUD-01", "QG-SEM-01", "QG-WHOLE-01",
];

function gateMayBeNotApplicable(manifest: ReelProductionManifest, gateId: QualityGateId) {
  if (gateId === "QG-OBJ-01") {
    return !manifest.shots.some(shot => (shot.continuityIn.objectStates?.length || 0) > 0 || (shot.continuityOut.objectStates?.length || 0) > 0 || (shot.continuityIn.props?.length || 0) > 0 || (shot.continuityOut.props?.length || 0) > 0);
  }
  if (["QG-PERF-01", "QG-LIP-01", "QG-EMO-01"].includes(gateId)) {
    return !manifest.continuity?.performanceTracks.some(track => track.mode === "persistent-performer" || track.mode === "shot-conditioned");
  }
  if (gateId === "QG-BND-01") return (manifest.continuity?.boundaries.length || 0) === 0;
  return false;
}

function validatePassingGate(manifest: ReelProductionManifest, gateId: QualityGateId, failures: string[]) {
  const gate = manifest.qa.gates?.[gateId];
  if (!gate) {
    failures.push(`${gateId} is missing from the V2 quality-gate registry.`);
    return;
  }
  if (gate.status === "NOT_APPLICABLE") {
    if (!gateMayBeNotApplicable(manifest, gateId)) failures.push(`${gateId} cannot be NOT_APPLICABLE for this production.`);
    return;
  }
  if (gate.status !== "PASSED") {
    failures.push(`${gateId} is ${gate.status}; final QA requires explicit passing evidence.`);
    return;
  }
  if (!gate.evaluator?.trim()) failures.push(`${gateId} is PASSED without an evaluator identity.`);
  if (!gate.evaluatedAt) failures.push(`${gateId} is PASSED without an evaluation timestamp.`);
  if (!gate.evidenceRefs?.length) failures.push(`${gateId} is PASSED without evidence references.`);
  if (!Number.isFinite(gate.score) || !Number.isFinite(gate.threshold)) failures.push(`${gateId} is PASSED without a numeric score and threshold.`);
  else if ((gate.score as number) < (gate.threshold as number)) failures.push(`${gateId} is marked PASSED below its configured threshold.`);
}

export function auditReelManifest(manifest: ReelProductionManifest): ReelAuditResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!manifest.shots.length) failures.push("Production has no shots.");
  if (manifest.version === 2) {
    if (!manifest.continuity?.characters.length) failures.push("Manifest V2 has no Character Bible.");
    if (!manifest.continuity?.environments.length) failures.push("Manifest V2 has no Environment Bible.");
    if (!manifest.continuity?.performanceTracks.length) failures.push("Manifest V2 has no Performance Track.");
    if ((manifest.continuity?.boundaries.length || 0) !== Math.max(0, manifest.shots.length - 1)) failures.push("Manifest V2 boundary graph does not cover every adjacent shot boundary.");
    if (!manifest.captions) failures.push("Manifest V2 has no caption track.");
    if (!manifest.musicPlan?.continuousAcrossVisualCuts) warnings.push("Manifest V2 has no continuous-across-cuts music plan.");
  }

  if (manifest.audio.masterClock === "narration") {
    if (!manifest.audio.narrationUrl) failures.push("Speech-led production has no persisted narration artifact.");
    if (!manifest.audio.actualDurationSec || manifest.audio.actualDurationSec <= 0) failures.push("Speech-led production has no measured narration duration.");
    if (manifest.audio.timingSource !== "actual-alignment") failures.push("Speech-led production has no actual narration alignment; heuristic timing is not accepted as sync evidence.");
    if (!manifest.audio.wordTimings?.length) failures.push("Speech-led production has no word-level alignment evidence.");
    if (!manifest.audio.alignmentValidation?.passed) failures.push("Speech-led production has no passing transcript-vs-script verification evidence.");
    if ((manifest.audio.alignmentValidation?.wer ?? 1) > MAX_TRANSCRIPT_WER) failures.push("Narration word-error-rate exceeds the accepted transcript policy.");
    if ((manifest.audio.alignmentValidation?.coverage ?? 0) < MIN_TRANSCRIPT_COVERAGE) failures.push("Narration transcript coverage is below the accepted policy.");
    if (manifest.audio.alignmentValidation?.missingCritical?.length) failures.push(`Narration is missing critical transcript tokens: ${manifest.audio.alignmentValidation.missingCritical.join(", ")}.`);
    if (manifest.version === 2) {
      if (!manifest.audio.speechMap) failures.push("Manifest V2 has no SpeechMap derived from the actual narration waveform.");
      else {
        if (Math.abs(manifest.audio.speechMap.durationSec - (manifest.audio.actualDurationSec || 0)) > 0.002) failures.push("SpeechMap duration does not match the actual narration master.");
        if (!manifest.audio.speechMap.words.length) failures.push("SpeechMap has no aligned words.");
      }
      if (manifest.captions?.timingSource !== "actual-alignment") failures.push("Caption track is not compiled from actual speech alignment.");
      if (!manifest.captions?.cues.length) failures.push("Caption track has no cues.");
    }
  }

  let expectedStart = 0;
  for (const shot of manifest.shots) {
    if (Math.abs(shot.editorialStartSec - expectedStart) > 0.008) failures.push(`${shot.id} starts at ${shot.editorialStartSec}s but canonical timeline expects ${expectedStart.toFixed(6)}s.`);
    if (shot.editorialDurationSec <= 0) failures.push(`${shot.id} has a non-positive editorial duration.`);
    if (shot.trimOutSec <= shot.trimInSec) failures.push(`${shot.id} has an invalid trim window.`);
    if (shot.trimOutSec > shot.generationDurationSec + 0.05) failures.push(`${shot.id} editorial trim exceeds its requested source generation duration.`);
    if (shot.asset?.actualDurationSec !== undefined && shot.trimOutSec > shot.asset.actualDurationSec + 0.05) failures.push(`${shot.id} editorial trim exceeds its probed source duration.`);
    if (!shot.continuityIn.camera || !shot.continuityOut.camera) warnings.push(`${shot.id} is missing camera continuity state.`);
    if (!shot.continuityIn.environment || !shot.continuityOut.environment) warnings.push(`${shot.id} is missing environment continuity state.`);
    if (["GENERATED", "AUDITING", "PASSED"].includes(shot.status) && !shot.asset?.videoUrl) failures.push(`${shot.id} is ${shot.status} without a video artifact.`);
    if (shot.status === "PASSED") {
      if (!shot.asset?.actualDurationSec) failures.push(`${shot.id} is PASSED without measured source duration.`);
      if (shot.qa?.failures?.length) failures.push(`${shot.id} is PASSED but still contains QA failures.`);
      if (shot.qa?.score === undefined) failures.push(`${shot.id} is PASSED without a QA score.`);
    }
    for (const dep of shot.dependsOnShotIds) {
      const dependency = manifest.shots.find(s => s.id === dep);
      if (!dependency) failures.push(`${shot.id} depends on missing shot ${dep}.`);
      else if (shot.asset?.videoUrl && !dependency.asset?.videoUrl) failures.push(`${shot.id} has media while dependency ${dep} has no media.`);
      if (shot.asset?.videoUrl && dependency?.asset?.videoUrl && !shot.continuityIn.referenceFrameUrl) failures.push(`${shot.id} has a continuity dependency but no persisted provider conditioning reference frame.`);
    }
    expectedStart += shot.editorialDurationSec;
  }

  if (manifest.version === 2 && manifest.continuity) {
    for (const boundary of manifest.continuity.boundaries) {
      const from = manifest.shots.find(s => s.id === boundary.fromShotId);
      const to = manifest.shots.find(s => s.id === boundary.toShotId);
      if (!from || !to) { failures.push(`${boundary.id} points to a missing shot.`); continue; }
      const expectedBoundaryTime = from.editorialStartSec + from.editorialDurationSec;
      if (Math.abs(boundary.fromTimeSec - expectedBoundaryTime) > 0.008 || Math.abs(boundary.toTimeSec - to.editorialStartSec) > 0.008) failures.push(`${boundary.id} timing does not match the canonical edit timeline.`);
      if (finalQaStates.has(manifest.status) && !boundary.evaluation?.passed) failures.push(`${boundary.id} has no passing boundary-continuity evaluation.`);
    }
  }

  if (Math.abs(expectedStart - manifest.plannedDurationSec) > 0.008) failures.push(`Timeline duration ${expectedStart.toFixed(6)}s does not match manifest planned duration ${manifest.plannedDurationSec}s.`);
  if (manifest.audio.actualDurationSec && Math.abs(manifest.audio.actualDurationSec - manifest.plannedDurationSec) > 0.002) failures.push(`Narration duration ${manifest.audio.actualDurationSec.toFixed(6)}s does not match canonical timeline ${manifest.plannedDurationSec.toFixed(6)}s.`);
  if (manifest.outputs?.narratedRoughCut && manifest.audio.actualDurationSec && Math.abs(manifest.outputs.narratedRoughCut.actualDurationSec - manifest.audio.actualDurationSec) > 0.08) failures.push("Persisted narrated rough cut does not match the actual narration master duration.");

  if (finalQaStates.has(manifest.status)) {
    if (!manifest.outputs?.master?.videoUrl) failures.push(`${manifest.status} production has no persisted master output.`);
    if (!manifest.shots.every(s => s.status === "PASSED")) failures.push(`${manifest.status} production contains one or more shots that have not passed QA.`);
    if (manifest.version === 2) for (const gateId of REQUIRED_V2_GATES) validatePassingGate(manifest, gateId, failures);
  }

  if (manifest.status === "READY") {
    if (!manifest.qa.passed) failures.push("Production is READY while the master QA gate is not passed.");
    if ((manifest.qa.overallScore ?? 0) < manifest.qa.minimumReadyScore) failures.push("Production is READY below the minimum master quality score.");
  }

  const penalty = failures.length * 18 + warnings.length * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));
  return { passed: failures.length === 0, score, warnings, failures };
}
