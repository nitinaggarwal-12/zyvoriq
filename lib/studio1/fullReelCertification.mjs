function hasSemanticTimelineEvidence(manifest) {
  const shots = Array.isArray(manifest?.shots) ? manifest.shots : [];
  const sync = manifest?.studio1?.timelineSync;
  const scenes = Array.isArray(sync?.sceneAlignment) ? sync.sceneAlignment : [];
  const anchors = Array.isArray(sync?.boundaryAnchors) ? sync.boundaryAnchors : [];
  const boundaries = Array.isArray(sync?.boundariesSec) ? sync.boundariesSec : [];
  const isSemanticSource = sync?.source === "transcript-scene-alignment" || sync?.source === "cross-script-proportional-alignment";
  if (
    Number(sync?.version || 0) < 2 ||
    !isSemanticSource ||
    Number(sync?.globalExactRatio || 0) < 0.70 ||
    scenes.length !== shots.length ||
    anchors.length !== Math.max(0, shots.length - 1) ||
    boundaries.length !== shots.length + 1
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

export function isCertifiedStudio1RoughCut(manifest) {
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const qa = roughCut?.timelineQa;
  const allowed = Number(qa?.maxAllowedBoundaryDriftMs ?? 50);
  const drift = Number(qa?.maxBoundaryDriftMs ?? Number.POSITIVE_INFINITY);
  const validContract = qa?.timingContract === "narration-master-clock" || qa?.timingContract === "native-shot-audio-master";
  if (!roughCut?.videoUrl || !validContract || qa?.passed !== true || !Number.isFinite(drift) || drift > allowed) {
    return false;
  }
  if (qa?.timingContract === "native-shot-audio-master") {
    return true;
  }
  return hasSemanticTimelineEvidence(manifest);
}

export function suppressUncertifiedStudio1Outputs(stored) {
  const roughCut = stored?.manifest?.outputs?.narratedRoughCut;
  if (!roughCut?.videoUrl || isCertifiedStudio1RoughCut(stored?.manifest)) return stored;

  const clone = structuredClone(stored);
  const studio1 = (clone.manifest.studio1 ||= {});
  studio1.outputCertification = {
    state: "LEGACY_REBUILD_REQUIRED",
    suppressedVideoUrl: roughCut.videoUrl,
    reason: "Stored Full Reel lacks complete transcript-scene semantic timing and narration-master-clock render certification; rebuild before playback/download.",
  };
  if (clone.manifest.outputs) {
    delete clone.manifest.outputs.narratedRoughCut;
    delete clone.manifest.outputs.master;
  }
  const shots = Array.isArray(clone.manifest.shots) ? clone.manifest.shots : [];
  const complete = shots.length > 0 && shots.every(shot => Boolean(shot?.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  if (complete && clone.manifest.audio?.narrationUrl && clone.manifest.audio?.alignmentValidation?.passed) clone.manifest.status = "ROUGH_CUT_READY";
  delete clone.manifest.artifact;
  delete clone.manifest.artifacts;
  return clone;
}
