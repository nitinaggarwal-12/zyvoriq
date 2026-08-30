import { ReelProductionManifest } from "./types";

export interface ReelAuditResult {
  passed: boolean;
  score: number;
  warnings: string[];
  failures: string[];
}

const finalQaStates = new Set(["AUDITING", "APPROVAL_REQUIRED", "READY"]);

export function auditReelManifest(manifest: ReelProductionManifest): ReelAuditResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!manifest.shots.length) failures.push("Production has no shots.");
  if (manifest.audio.masterClock === "narration") {
    if (!manifest.audio.narrationUrl) failures.push("Speech-led production has no persisted narration artifact.");
    if (!manifest.audio.actualDurationSec || manifest.audio.actualDurationSec <= 0) failures.push("Speech-led production has no measured narration duration.");
    if (manifest.audio.timingSource !== "actual-alignment") {
      failures.push("Speech-led production has no actual narration alignment; heuristic timing is not accepted as sync evidence.");
    }
    if (!manifest.audio.wordTimings?.length) failures.push("Speech-led production has no word-level alignment evidence.");
  }

  let expectedStart = 0;
  for (let i = 0; i < manifest.shots.length; i++) {
    const shot = manifest.shots[i];
    if (Math.abs(shot.editorialStartSec - expectedStart) > 0.08) {
      failures.push(`${shot.id} starts at ${shot.editorialStartSec}s but canonical timeline expects ${expectedStart.toFixed(2)}s.`);
    }
    if (shot.editorialDurationSec <= 0) failures.push(`${shot.id} has a non-positive editorial duration.`);
    if (shot.trimOutSec <= shot.trimInSec) failures.push(`${shot.id} has an invalid trim window.`);
    if (shot.trimOutSec > shot.generationDurationSec + 0.05) failures.push(`${shot.id} editorial trim exceeds its requested source generation duration.`);
    if (shot.asset?.actualDurationSec !== undefined && shot.trimOutSec > shot.asset.actualDurationSec + 0.05) {
      failures.push(`${shot.id} editorial trim exceeds its probed source duration.`);
    }
    if (!shot.continuityIn.camera || !shot.continuityOut.camera) warnings.push(`${shot.id} is missing camera continuity state.`);
    if (!shot.continuityIn.environment || !shot.continuityOut.environment) warnings.push(`${shot.id} is missing environment continuity state.`);

    if (["GENERATED", "AUDITING", "PASSED"].includes(shot.status) && !shot.asset?.videoUrl) {
      failures.push(`${shot.id} is ${shot.status} without a video artifact.`);
    }
    if (shot.status === "PASSED") {
      if (!shot.asset?.actualDurationSec) failures.push(`${shot.id} is PASSED without measured source duration.`);
      if (shot.qa?.failures?.length) failures.push(`${shot.id} is PASSED but still contains QA failures.`);
      if (shot.qa?.score === undefined) failures.push(`${shot.id} is PASSED without a QA score.`);
    }

    for (const dep of shot.dependsOnShotIds) {
      const dependency = manifest.shots.find(s => s.id === dep);
      if (!dependency) failures.push(`${shot.id} depends on missing shot ${dep}.`);
      else if (shot.asset?.videoUrl && !dependency.asset?.videoUrl) failures.push(`${shot.id} has media while dependency ${dep} has no media.`);
    }

    expectedStart += shot.editorialDurationSec;
  }

  if (Math.abs(expectedStart - manifest.plannedDurationSec) > 0.12) {
    failures.push(`Timeline duration ${expectedStart.toFixed(2)}s does not match manifest planned duration ${manifest.plannedDurationSec}s.`);
  }
  if (manifest.audio.actualDurationSec && Math.abs(manifest.audio.actualDurationSec - manifest.plannedDurationSec) > 0.25) {
    failures.push(`Narration duration ${manifest.audio.actualDurationSec.toFixed(2)}s does not match canonical timeline ${manifest.plannedDurationSec.toFixed(2)}s.`);
  }

  if (manifest.outputs?.narratedRoughCut) {
    if (Math.abs(manifest.outputs.narratedRoughCut.actualDurationSec - manifest.plannedDurationSec) > 0.25) {
      failures.push("Persisted narrated rough cut does not match the canonical timeline duration.");
    }
  }

  if (finalQaStates.has(manifest.status)) {
    if (!manifest.outputs?.master?.videoUrl) failures.push(`${manifest.status} production has no persisted master output.`);
    if (!manifest.shots.every(s => s.status === "PASSED")) failures.push(`${manifest.status} production contains one or more shots that have not passed QA.`);
  }

  if (manifest.status === "READY") {
    if (!manifest.qa.passed) failures.push("Production is READY while the master QA gate is not passed.");
    if ((manifest.qa.overallScore ?? 0) < manifest.qa.minimumReadyScore) failures.push("Production is READY below the minimum master quality score.");
  }

  const penalty = failures.length * 18 + warnings.length * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));
  return { passed: failures.length === 0, score, warnings, failures };
}
