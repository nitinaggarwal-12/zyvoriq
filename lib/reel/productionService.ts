import { auditReelManifest } from "./audit";
import { planReel, type PlanReelInput } from "./planner";
import { reelProductionStore, type StoredReelProduction } from "./productionStore";
import type { AlignmentValidation, ReelProductionManifest, ReelProductionStatus, ReelRenderedOutput, WordTiming } from "./types";

const allowedTransitions: Record<ReelProductionStatus, ReelProductionStatus[]> = {
  PLANNING: ["SCRIPT_READY", "FAILED"],
  SCRIPT_READY: ["AUDIO_GENERATING", "FAILED"],
  AUDIO_GENERATING: ["AUDIO_READY", "FAILED"],
  AUDIO_READY: ["SHOTS_PLANNED", "FAILED"],
  SHOTS_PLANNED: ["VIDEO_GENERATING", "FAILED"],
  VIDEO_GENERATING: ["ROUGH_CUT_READY", "FAILED"],
  ROUGH_CUT_READY: ["MIXING", "FAILED"],
  MIXING: ["MASTER_RENDERING", "FAILED"],
  MASTER_RENDERING: ["AUDITING", "FAILED"],
  AUDITING: ["REPAIRING", "APPROVAL_REQUIRED", "READY", "FAILED"],
  REPAIRING: ["VIDEO_GENERATING", "ROUGH_CUT_READY", "AUDITING", "FAILED"],
  APPROVAL_REQUIRED: ["READY", "REPAIRING", "FAILED"],
  READY: [],
  FAILED: ["PLANNING", "SCRIPT_READY", "AUDIO_GENERATING", "VIDEO_GENERATING", "ROUGH_CUT_READY", "REPAIRING"],
};

function assertTransition(from: ReelProductionStatus, to: ReelProductionStatus) {
  if (!allowedTransitions[from].includes(to)) throw new Error(`Invalid production transition ${from} -> ${to}`);
}

function validateWordTimings(wordTimings: WordTiming[], actualDurationSec: number) {
  if (!Array.isArray(wordTimings) || wordTimings.length === 0) throw new Error("Actual word-level narration alignment is required");
  let previousStart = -1;
  let previousEnd = -1;
  for (const timing of wordTimings) {
    if (!timing.word?.trim()) throw new Error("Narration alignment contains an empty word");
    if (!Number.isFinite(timing.startSec) || !Number.isFinite(timing.endSec)) throw new Error("Narration alignment contains a non-finite timestamp");
    if (timing.startSec < 0 || timing.endSec < timing.startSec) throw new Error(`Invalid narration timing for ${timing.word}`);
    if (timing.startSec + 0.001 < previousStart || timing.endSec + 0.001 < previousEnd) throw new Error("Narration word timestamps are not monotonic");
    if (timing.endSec > actualDurationSec + 0.25) throw new Error(`Narration timing for ${timing.word} exceeds actual waveform duration`);
    previousStart = timing.startSec;
    previousEnd = timing.endSec;
  }
}

function assertAlignmentValidation(validation?: AlignmentValidation) {
  if (!validation?.passed) throw new Error("Narration transcript has not passed transcript-vs-script verification");
  if (!Number.isFinite(validation.wer) || !Number.isFinite(validation.coverage)) throw new Error("Narration transcript verification metrics are invalid");
  if (validation.wer > 0.12 || validation.coverage < 0.94) throw new Error(`Narration transcript verification is outside policy: WER ${validation.wer}, coverage ${validation.coverage}`);
}

function assertNarrationArtifact(manifest: ReelProductionManifest) {
  if (!manifest.audio.narrationUrl) throw new Error("Narration artifact URL is required");
  if (!manifest.audio.actualDurationSec || manifest.audio.actualDurationSec <= 0) throw new Error("Actual narration duration is required");
  if (manifest.audio.timingSource !== "actual-alignment") throw new Error("Actual narration alignment is required");
  validateWordTimings(manifest.audio.wordTimings || [], manifest.audio.actualDurationSec);
  assertAlignmentValidation(manifest.audio.alignmentValidation);
}

function replanAgainstNarration(manifest: ReelProductionManifest, actualDurationSec: number) {
  const replanned = planReel({ topic: manifest.topic, tone: manifest.tone, platform: manifest.platform, requestedDurationSec: actualDurationSec, scriptText: manifest.masterScript });
  manifest.plannedDurationSec = replanned.plannedDurationSec;
  manifest.shots = replanned.shots;
  manifest.creativeBible = replanned.creativeBible;
}

export const reelProductionService = {
  async create(input: PlanReelInput): Promise<StoredReelProduction> {
    const manifest = planReel(input);
    manifest.status = "SCRIPT_READY";
    return reelProductionStore.create(manifest);
  },

  async get(id: string) { return reelProductionStore.get(id); },
  async list(limit?: number) { return reelProductionStore.list(limit); },

  async transition(id: string, to: ReelProductionStatus, expectedRevision?: number) {
    const stored = await reelProductionStore.get(id);
    if (!stored) throw new Error(`Production ${id} not found`);
    const manifest = structuredClone(stored.manifest);
    assertTransition(manifest.status, to);
    if (to === "AUDIO_READY" || to === "SHOTS_PLANNED") assertNarrationArtifact(manifest);
    if (to === "ROUGH_CUT_READY") {
      const missing = manifest.shots.filter(s => !s.asset?.videoUrl || !["GENERATED", "PASSED"].includes(s.status));
      if (missing.length) throw new Error(`Cannot mark rough cut ready; ${missing.length} shot(s) have no generated artifact`);
    }
    if (to === "READY") {
      const result = auditReelManifest(manifest);
      if (!result.passed) throw new Error(`Cannot mark production READY: ${result.failures.join(" | ")}`);
      if (!manifest.qa.passed || (manifest.qa.overallScore ?? 0) < manifest.qa.minimumReadyScore) throw new Error("Cannot mark production READY until the master QA gate passes");
      if (!manifest.outputs?.master?.videoUrl) throw new Error("Cannot mark production READY without a persisted master output");
    }
    manifest.status = to;
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async attachNarration(input: {
    id: string; narrationUrl: string; actualDurationSec: number; timingSource: "actual-alignment"; wordTimings: WordTiming[]; alignmentValidation: AlignmentValidation; provider?: string; model?: string; voice?: string; expectedRevision?: number;
  }) {
    const stored = await reelProductionStore.get(input.id);
    if (!stored) throw new Error(`Production ${input.id} not found`);
    if (!input.narrationUrl.trim()) throw new Error("narrationUrl is required");
    if (!Number.isFinite(input.actualDurationSec) || input.actualDurationSec <= 0) throw new Error("actualDurationSec must be positive");
    if (stored.manifest.status !== "AUDIO_GENERATING") throw new Error(`Narration can only be attached while AUDIO_GENERATING; production is ${stored.manifest.status}`);
    validateWordTimings(input.wordTimings, input.actualDurationSec);
    assertAlignmentValidation(input.alignmentValidation);
    const manifest = structuredClone(stored.manifest);
    replanAgainstNarration(manifest, input.actualDurationSec);
    manifest.audio.narrationUrl = input.narrationUrl;
    manifest.audio.actualDurationSec = input.actualDurationSec;
    manifest.audio.timingSource = input.timingSource;
    manifest.audio.wordTimings = input.wordTimings;
    manifest.audio.alignmentValidation = input.alignmentValidation;
    manifest.audio.provider = input.provider;
    manifest.audio.model = input.model;
    manifest.audio.voice = input.voice;
    manifest.status = "AUDIO_READY";
    return reelProductionStore.replace(input.id, manifest, input.expectedRevision ?? stored.revision);
  },

  async attachShotAsset(input: { id: string; shotId: string; videoUrl: string; actualDurationSec: number; operationName?: string; provider?: string; model?: string; expectedRevision?: number; }) {
    const stored = await reelProductionStore.get(input.id);
    if (!stored) throw new Error(`Production ${input.id} not found`);
    if (!input.videoUrl.trim()) throw new Error("videoUrl is required");
    if (!Number.isFinite(input.actualDurationSec) || input.actualDurationSec <= 0) throw new Error("actualDurationSec must be positive");
    if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(stored.manifest.status)) throw new Error(`Shot assets cannot be attached while production is ${stored.manifest.status}`);
    const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(s => s.id === input.shotId);
    if (!shot) throw new Error(`Shot ${input.shotId} not found`);
    if (shot.status !== "PLANNED" && shot.status !== "FAILED") throw new Error(`Shot ${input.shotId} cannot accept a new asset while ${shot.status}`);
    for (const dependencyId of shot.dependsOnShotIds) {
      const dependency = manifest.shots.find(s => s.id === dependencyId);
      if (!dependency?.asset?.videoUrl || !["GENERATED", "PASSED"].includes(dependency.status)) throw new Error(`Shot ${input.shotId} dependency ${dependencyId} is not generated`);
    }
    if (shot.trimOutSec > input.actualDurationSec + 0.05) throw new Error(`Shot ${input.shotId} trimOut ${shot.trimOutSec}s exceeds actual source duration ${input.actualDurationSec}s`);
    shot.asset = { videoUrl: input.videoUrl, actualDurationSec: input.actualDurationSec, operationName: input.operationName, provider: input.provider, model: input.model };
    shot.status = "GENERATED";
    if (manifest.status === "SHOTS_PLANNED") manifest.status = "VIDEO_GENERATING";
    if (manifest.shots.every(s => Boolean(s.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(s.status))) manifest.status = "ROUGH_CUT_READY";
    return reelProductionStore.replace(input.id, manifest, input.expectedRevision ?? stored.revision);
  },

  async attachNarratedRoughCut(input: { id: string; output: ReelRenderedOutput; expectedRevision?: number; }) {
    const stored = await reelProductionStore.get(input.id);
    if (!stored) throw new Error(`Production ${input.id} not found`);
    if (stored.manifest.status !== "ROUGH_CUT_READY") throw new Error(`Narrated rough cut can only be attached from ROUGH_CUT_READY; production is ${stored.manifest.status}`);
    if (input.output.kind !== "narrated-rough-cut" || !input.output.videoUrl) throw new Error("A persisted narrated rough-cut output is required");
    const masterDuration = stored.manifest.audio.actualDurationSec;
    if (!masterDuration || Math.abs(input.output.actualDurationSec - masterDuration) > 0.08) throw new Error("Narrated rough-cut duration does not match the actual narration master");
    const manifest = structuredClone(stored.manifest);
    manifest.outputs = { ...(manifest.outputs || {}), narratedRoughCut: input.output };
    manifest.status = "MIXING";
    return reelProductionStore.replace(input.id, manifest, input.expectedRevision ?? stored.revision);
  },

  async applyManifestAudit(id: string, expectedRevision?: number) {
    const stored = await reelProductionStore.get(id);
    if (!stored) throw new Error(`Production ${id} not found`);
    const manifest = structuredClone(stored.manifest);
    const result = auditReelManifest(manifest);
    manifest.qa.overallScore = result.score;
    manifest.qa.passed = result.passed && result.score >= manifest.qa.minimumReadyScore;
    manifest.qa.warnings = result.warnings;
    manifest.qa.failures = result.failures;
    if (manifest.status === "AUDITING") manifest.status = manifest.qa.passed ? "APPROVAL_REQUIRED" : "REPAIRING";
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
};
