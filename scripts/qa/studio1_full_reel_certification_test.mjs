import assert from "node:assert/strict";

function certifiedRoughCut(production) {
  const qa = production?.manifest?.outputs?.narratedRoughCut?.timelineQa;
  const allowed = Number(qa?.maxAllowedBoundaryDriftMs ?? 50);
  const drift = Number(qa?.maxBoundaryDriftMs ?? Number.POSITIVE_INFINITY);
  return Boolean(
    production?.manifest?.outputs?.narratedRoughCut?.videoUrl &&
    Number(production?.manifest?.studio1?.timelineSync?.version || 0) >= 2 &&
    qa?.timingContract === "narration-master-clock" &&
    qa?.passed === true &&
    Number.isFinite(drift) &&
    drift <= allowed
  );
}

const base = {
  manifest: {
    studio1: { timelineSync: { version: 2 } },
    outputs: { narratedRoughCut: { videoUrl: "/reel.mp4" } },
  },
};

assert.equal(certifiedRoughCut(base), false, "legacy rough cuts without render QA must never be treated as fixed");
assert.equal(certifiedRoughCut({ manifest: { ...base.manifest, studio1: { timelineSync: { version: 1 } }, outputs: { narratedRoughCut: { videoUrl: "/reel.mp4", timelineQa: { timingContract: "narration-master-clock", passed: true, maxBoundaryDriftMs: 10, maxAllowedBoundaryDriftMs: 50 } } } } }), false, "legacy timeline sync must not certify");
assert.equal(certifiedRoughCut({ manifest: { ...base.manifest, outputs: { narratedRoughCut: { videoUrl: "/reel.mp4", timelineQa: { timingContract: "narration-master-clock", passed: false, maxBoundaryDriftMs: 10, maxAllowedBoundaryDriftMs: 50 } } } } }), false, "failed QA must not certify");
assert.equal(certifiedRoughCut({ manifest: { ...base.manifest, outputs: { narratedRoughCut: { videoUrl: "/reel.mp4", timelineQa: { timingContract: "narration-master-clock", passed: true, maxBoundaryDriftMs: 60, maxAllowedBoundaryDriftMs: 50 } } } } }), false, "boundary drift above contract must not certify");
assert.equal(certifiedRoughCut({ manifest: { ...base.manifest, outputs: { narratedRoughCut: { videoUrl: "/reel.mp4", timelineQa: { timingContract: "narration-master-clock", passed: true, maxBoundaryDriftMs: 16.7, maxAllowedBoundaryDriftMs: 50 } } } } }), true, "only exact-sync QA passing rough cuts certify");

console.log("Studio1 full Reel certification QA passed");
