import assert from "node:assert/strict";
import {
  isCertifiedStudio1RoughCut,
  suppressUncertifiedStudio1Outputs,
} from "../../lib/studio1/fullReelCertification.mjs";

function semanticSync(overrides = {}) {
  return {
    version: 2,
    source: "transcript-scene-alignment",
    globalExactRatio: 0.92,
    boundariesSec: [0, 3.1, 7],
    boundaryAnchors: [{ fromShotId: "s1", toShotId: "s2", beforeWord: "beta", afterWord: "gamma", boundarySec: 3.1 }],
    sceneAlignment: [
      { shotId: "s1", scriptWordCount: 2, mappedWordCount: 2, exactWordCount: 2, coverage: 1, exactRatio: 1 },
      { shotId: "s2", scriptWordCount: 2, mappedWordCount: 2, exactWordCount: 2, coverage: 1, exactRatio: 1 },
    ],
    ...overrides,
  };
}

function production({ sync = semanticSync(), qa, rough = true } = {}) {
  return {
    id: "studio1_cert_test",
    revision: 7,
    manifest: {
      id: "studio1_cert_test",
      status: "MIXING",
      shots: [
        { id: "s1", status: "GENERATED", asset: { videoUrl: "/s1.mp4", actualDurationSec: 4 } },
        { id: "s2", status: "GENERATED", asset: { videoUrl: "/s2.mp4", actualDurationSec: 4 } },
      ],
      audio: { narrationUrl: "/narration.wav", alignmentValidation: { passed: true } },
      studio1: { timelineSync: sync },
      outputs: rough ? {
        narratedRoughCut: {
          videoUrl: "/reel.mp4",
          timelineQa: qa ?? {
            timingContract: "narration-master-clock",
            passed: true,
            maxBoundaryDriftMs: 16.7,
            maxAllowedBoundaryDriftMs: 50,
          },
        },
        master: { videoUrl: "/master.mp4" },
      } : {},
    },
  };
}

assert.equal(isCertifiedStudio1RoughCut(production({ qa: undefined }).manifest), true, "complete semantic + render evidence should certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ version: 1 }) }).manifest), false, "legacy timeline version must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ source: "actual-narration-word-timings" }) }).manifest), false, "non-semantic timing source must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ globalExactRatio: 0.69 }) }).manifest), false, "weak global transcript match must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ boundaryAnchors: [] }) }).manifest), false, "missing semantic boundary anchors must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ sceneAlignment: [semanticSync().sceneAlignment[0]] }) }).manifest), false, "missing per-scene alignment evidence must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ sync: semanticSync({ sceneAlignment: [
  { shotId: "s1", scriptWordCount: 4, mappedWordCount: 2, exactWordCount: 2, coverage: 0.5, exactRatio: 0.5 },
  semanticSync().sceneAlignment[1],
] }) }).manifest), false, "weak per-scene semantic mapping must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ qa: { timingContract: "narration-master-clock", passed: false, maxBoundaryDriftMs: 10, maxAllowedBoundaryDriftMs: 50 } }).manifest), false, "failed render QA must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ qa: { timingContract: "narration-master-clock", passed: true, maxBoundaryDriftMs: 60, maxAllowedBoundaryDriftMs: 50 } }).manifest), false, "excessive frame-boundary drift must not certify");
assert.equal(isCertifiedStudio1RoughCut(production({ qa: { timingContract: "wrong-clock", passed: true, maxBoundaryDriftMs: 10, maxAllowedBoundaryDriftMs: 50 } }).manifest), false, "wrong render clock must not certify");

const legacy = production({ sync: semanticSync({ version: 1 }) });
const suppressed = suppressUncertifiedStudio1Outputs(legacy);
assert.notEqual(suppressed, legacy, "legacy response view should be cloned, never mutate durable state");
assert.equal(suppressed.manifest.outputs?.narratedRoughCut, undefined, "legacy narrated rough cut must be suppressed");
assert.equal(suppressed.manifest.outputs?.master, undefined, "legacy master derived from stale rough cut must be suppressed");
assert.equal(suppressed.manifest.status, "ROUGH_CUT_READY", "complete legacy project should be rebuild-ready");
assert.equal(suppressed.manifest.studio1.outputCertification.state, "LEGACY_REBUILD_REQUIRED");
assert.equal(legacy.manifest.outputs.narratedRoughCut.videoUrl, "/reel.mp4", "durable legacy record must remain unchanged");

const certified = production();
assert.equal(suppressUncertifiedStudio1Outputs(certified), certified, "certified production should pass through unchanged");

console.log("Studio1 full Reel certification QA passed");
