import type { ReelProductionManifest } from "../reel/types";

export type Studio1TimelineQa = {
  version?: number;
  timingContract?: string;
  passed?: boolean;
  maxBoundaryDriftMs?: number;
  maxAllowedBoundaryDriftMs?: number;
};

type SceneAlignmentEvidence = {
  scriptWordCount?: number;
  mappedWordCount?: number;
  exactWordCount?: number;
  coverage?: number;
  exactRatio?: number;
};

type NarratedRoughCutWithQa = NonNullable<NonNullable<ReelProductionManifest["outputs"]>["narratedRoughCut"]> & {
  timelineQa?: Studio1TimelineQa;
};

function hasSemanticTimelineEvidence(manifest: ReelProductionManifest) {
  const sync = (manifest as any).studio1?.timelineSync;
  const scenes = Array.isArray(sync?.sceneAlignment) ? sync.sceneAlignment as SceneAlignmentEvidence[] : [];
  const anchors = Array.isArray(sync?.boundaryAnchors) ? sync.boundaryAnchors : [];
  const boundaries = Array.isArray(sync?.boundariesSec) ? sync.boundariesSec : [];
  if (
    Number(sync?.version || 0) < 2 ||
    sync?.source !== "transcript-scene-alignment" ||
    Number(sync?.globalExactRatio || 0) < 0.70 ||
    scenes.length !== manifest.shots.length ||
    anchors.length !== Math.max(0, manifest.shots.length - 1) ||
    boundaries.length !== manifest.shots.length + 1
  ) return false;

  return scenes.every(scene => {
    const wordCount = Number(scene.scriptWordCount || 0);
    const mapped = Number(scene.mappedWordCount || 0);
    const exact = Number(scene.exactWordCount || 0);
    const coverage = Number(scene.coverage || 0);
    const exactRatio = Number(scene.exactRatio || 0);
    return wordCount > 0 && (wordCount < 3
      ? mapped >= 1 && exact >= 1
      : coverage >= 0.75 && exactRatio >= 0.55);
  });
}

export function isCertifiedStudio1RoughCut(manifest: ReelProductionManifest) {
  const roughCut = manifest.outputs?.narratedRoughCut as NarratedRoughCutWithQa | undefined;
  const qa = roughCut?.timelineQa;
  const allowed = Number(qa?.maxAllowedBoundaryDriftMs ?? 50);
  const drift = Number(qa?.maxBoundaryDriftMs ?? Number.POSITIVE_INFINITY);
  return Boolean(
    roughCut?.videoUrl &&
    hasSemanticTimelineEvidence(manifest) &&
    qa?.timingContract === "narration-master-clock" &&
    qa?.passed === true &&
    Number.isFinite(drift) &&
    drift <= allowed
  );
}

export function suppressUncertifiedStudio1Outputs<T extends { manifest: ReelProductionManifest }>(stored: T): T {
  const roughCut = stored.manifest.outputs?.narratedRoughCut;
  if (!roughCut?.videoUrl || isCertifiedStudio1RoughCut(stored.manifest)) return stored;

  const clone = structuredClone(stored);
  const studio1 = ((clone.manifest as any).studio1 ||= {});
  studio1.outputCertification = {
    state: "LEGACY_REBUILD_REQUIRED",
    suppressedVideoUrl: roughCut.videoUrl,
    reason: "Stored Full Reel lacks complete transcript-scene semantic timing and narration-master-clock render certification; rebuild before playback/download.",
  };
  if (clone.manifest.outputs) {
    delete clone.manifest.outputs.narratedRoughCut;
    delete clone.manifest.outputs.master;
  }
  const complete = clone.manifest.shots.length > 0 && clone.manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  if (complete && clone.manifest.audio?.narrationUrl && clone.manifest.audio?.alignmentValidation?.passed) clone.manifest.status = "ROUGH_CUT_READY";
  return clone;
}
