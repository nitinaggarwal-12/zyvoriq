const assert = require("node:assert/strict");
const { syncStudio1TimelineToNarration } = require("../../.tmp-reel-v2/studio1/timelineSync.js");

function shot(id, scriptText, duration = 6) {
  return {
    id,
    order: Number(id.replace(/\D/g, "")) || 1,
    editorialStartSec: 0,
    editorialDurationSec: duration,
    generationDurationSec: 6,
    trimInSec: 0,
    trimOutSec: duration,
    scriptText,
    visualIntent: scriptText,
    generationPrompt: scriptText,
    continuityIn: {},
    continuityOut: { action: "continue" },
    transitionOut: { type: "hard-cut", durationSec: 0 },
    dependsOnShotIds: [],
    status: "GENERATED",
    asset: { videoUrl: `/shot-${id}.mp4`, actualDurationSec: duration },
    qa: { warnings: [], failures: [] },
  };
}

function manifest() {
  return {
    id: "studio1_test",
    version: 2,
    createdAt: new Date(0).toISOString(),
    status: "ROUGH_CUT_READY",
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec: 6,
    plannedDurationSec: 6,
    topic: "test",
    tone: "documentary",
    masterScript: "alpha beta gamma delta epsilon zeta",
    creativeBible: {
      visualStyle: "test",
      characterLock: "test",
      wardrobeLock: "test",
      environmentLock: "test",
      cameraLanguage: "test",
      colorLanguage: "test",
    },
    audio: {
      masterClock: "narration",
      narrationUrl: "/narration.wav",
      actualDurationSec: 5.5,
      timingSource: "actual-alignment",
      alignmentValidation: { expectedWords: 6, actualWords: 6, wer: 0, coverage: 1, passed: true },
      wordTimings: [
        { word: "alpha", startSec: 0.1, endSec: 0.5 },
        { word: "beta", startSec: 0.6, endSec: 1.0 },
        { word: "gamma", startSec: 1.7, endSec: 2.0 },
        { word: "delta", startSec: 2.1, endSec: 2.4 },
        { word: "epsilon", startSec: 3.8, endSec: 4.1 },
        { word: "zeta", startSec: 4.5, endSec: 5.2 },
      ],
    },
    shots: [
      shot("scene1", "alpha beta"),
      shot("scene2", "gamma delta epsilon"),
      shot("scene3", "zeta"),
    ],
    qa: { minimumReadyScore: 90, passed: false, warnings: [], failures: [] },
  };
}

const m = manifest();
const result = syncStudio1TimelineToNarration(m);
assert.deepEqual(result.boundaryTimesSec, [0, 1.35, 4.3, 5.5]);
assert.deepEqual(result.sceneDurationsSec, [1.35, 2.95, 1.2]);
assert.equal(result.alignmentCoverage, 1);
assert.equal(m.studio1.timelineSync.version, 2);
assert.equal(m.studio1.timelineSync.capacityPolicy, "no-cross-scene-redistribution");
assert.notEqual(m.shots[0].editorialDurationSec, m.shots[1].editorialDurationSec, "scene slots must follow narration, not equal division");
assert.equal(Number(m.shots.reduce((sum, s) => sum + s.editorialDurationSec, 0).toFixed(6)), 5.5);

const tooShort = manifest();
tooShort.shots[0].asset.actualDurationSec = 1.0;
assert.throws(
  () => syncStudio1TimelineToNarration(tooShort),
  /will not shift narration time into other scenes.*scene 1 requires 1\.35s but clip provides 1\.00s/,
);

console.log("Studio1 timeline sync QA passed");
