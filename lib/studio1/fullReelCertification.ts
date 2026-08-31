import type { ReelProductionManifest } from "@/lib/reel/types";

export type Studio1TimelineQa = {
  version?: number;
  timingContract?: string;
  passed?: boolean;
  maxBoundaryDriftMs?: number;
  maxAllowedBoundaryDriftMs?: number;
};

export function isCertifiedStudio1RoughCut(manifest: ReelProductionManifest) {
  const roughCut = manifest.outputs?.narratedRoughCut as (typeof manifest.outputs.narratedRoughCut & { timelineQa?: Studio1TimelineQa }) | undefined;
  const qa = roughCut?.timelineQa;
  const allowed = Number(qa?.maxAllowedBoundaryDriftMs ?? 50);
  const drift = Number(qa?.maxBoundaryDriftMs ?? Number.POSITIVE_INFINITY);
  return Boolean(
    roughCut?.videoUrl &&
    Number((manifest as any).studio1?.timelineSync?.version || 0) >= 2 &&
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
    reason: "Stored Full Reel predates narration-master-clock render QA and must be rebuilt before playback/download.",
  };
  if (clone.manifest.outputs) {
    delete clone.manifest.outputs.narratedRoughCut;
    delete clone.manifest.outputs.master;
  }
  const complete = clone.manifest.shots.length > 0 && clone.manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  if (complete && clone.manifest.audio?.narrationUrl && clone.manifest.audio?.alignmentValidation?.passed) clone.manifest.status = "ROUGH_CUT_READY";
  return clone;
}
