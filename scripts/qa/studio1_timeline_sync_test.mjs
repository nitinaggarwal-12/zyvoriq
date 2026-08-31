import assert from "node:assert/strict";
import {
  buildStudio1RenderPlan,
  buildStudio1VisualFilter,
  computeStudio1NarrationTimeline,
  synchronizeStudio1ManifestTimeline,
} from "../studio1_timeline_sync.mjs";

function timings(words, starts, ends) {
  return words.map((word, index) => ({ word, startSec: starts[index], endSec: ends[index] }));
}

function shot(id, scriptText, assetDurationSec = null) {
  return {
    id,
    order: 1,
    editorialStartSec: 0,
    editorialDurationSec: 1,
    generationDurationSec: 6,
    trimInSec: 0,
    trimOutSec: 1,
    scriptText,
    visualIntent: id,
    generationPrompt: id,
    continuityIn: {},
    continuityOut: {},
    transitionOut: { type: "hard-cut", durationSec: 0 },
    dependsOnShotIds: [],
    status: assetDurationSec ? "GENERATED" : "PLANNED",
    ...(assetDurationSec ? { asset: { videoUrl: `/asset/${id}.mp4`, actualDurationSec: assetDurationSec } } : {}),
  };
}

function manifest(shots, wordTimings, durationSec) {
  return {
    id: "studio1_test",
    version: 2,
    createdAt: new Date(0).toISOString(),
    status: "SHOTS_PLANNED",
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec: durationSec,
    plannedDurationSec: durationSec,
    topic: "test",
    tone: "documentary",
    masterScript: shots.map(item => item.scriptText).join(" "),
    creativeBible: { visualStyle: "", characterLock: "", wardrobeLock: "", environmentLock: "", cameraLanguage: "", colorLanguage: "" },
    audio: {
      masterClock: "narration",
      narrationUrl: "/asset/narration.wav",
      actualDurationSec: durationSec,
      timingSource: "actual-alignment",
      wordTimings,
      alignmentValidation: { expectedWords: wordTimings.length, actualWords: wordTimings.length, wer: 0, coverage: 1, passed: true },
    },
    shots,
    qa: { minimumReadyScore: 90, passed: false, warnings: [], failures: [] },
    studio1: {},
  };
}

// Lincoln-class regression fixture: equal word counts but deliberately uneven spoken pacing.
{
  const shots = [
    shot("s1", "one two three four"),
    shot("s2", "five six seven eight"),
    shot("s3", "nine ten eleven twelve"),
    shot("s4", "thirteen fourteen fifteen sixteen"),
    shot("s5", "seventeen eighteen nineteen zero"),
  ];
  const words = shots.flatMap(item => item.scriptText.split(" "));
  const starts = [0.10,0.65,1.20,1.80, 4.90,5.35,6.00,6.55, 10.80,11.35,12.15,13.00, 17.15,17.65,18.10,18.70, 21.80,22.25,23.00,23.65];
  const ends   = [0.45,1.00,1.55,2.15, 5.20,5.70,6.30,6.90, 11.15,11.70,12.50,13.35, 17.45,17.95,18.40,19.00, 22.10,22.55,23.30,24.00];
  const timeline = computeStudio1NarrationTimeline({ shots, timings: timings(words, starts, ends), durationSec: 27.76 });
  assert.equal(timeline.version, 2);
  assert.equal(timeline.sceneDurationsSec.length, 5);
  assert.notDeepEqual(timeline.sceneDurationsSec.map(value => Number(value.toFixed(1))), [5.6, 5.6, 5.6, 5.6, 5.4]);
  assert.equal(Number(timeline.sceneDurationsSec.reduce((sum, value) => sum + value, 0).toFixed(2)), 27.76);
  assert.equal(timeline.boundaryAnchors.length, 4);
  assert.ok(timeline.boundariesSec[1] < timeline.boundariesSec[2]);
  assert.ok(timeline.boundariesSec[2] < timeline.boundariesSec[3]);
}

// Planning must select Veo source buckets from exact narration slots, before generation.
{
  const shots = [shot("p1", "alpha beta"), shot("p2", "gamma delta")];
  const wordTimings = timings(["alpha","beta","gamma","delta"], [0.1,1.0,4.8,5.6], [0.5,1.4,5.2,6.0]);
  const value = manifest(shots, wordTimings, 7.0);
  synchronizeStudio1ManifestTimeline(value, { mode: "plan" });
  assert.equal(value.studio1.timelineSync.version, 2);
  assert.equal(value.shots[0].generationDurationSec, 6);
  assert.equal(value.shots[1].generationDurationSec, 4);
  assert.equal(value.shots[0].trimOutSec, value.shots[0].editorialDurationSec);
}

// A modest shortfall is adapted locally; later semantic boundaries never move.
{
  const shots = [shot("r1", "alpha beta", 4.0), shot("r2", "gamma delta", 3.0), shot("r3", "epsilon zeta", 3.0)];
  const wordTimings = timings(["alpha","beta","gamma","delta","epsilon","zeta"], [0.1,1.0,3.8,4.4,6.7,7.4], [0.5,1.4,4.1,4.8,7.0,7.8]);
  const value = manifest(shots, wordTimings, 9.0);
  synchronizeStudio1ManifestTimeline(value, { mode: "render" });
  const semanticEnds = value.shots.map(item => Number((item.editorialStartSec + item.editorialDurationSec).toFixed(6)));
  const plan = buildStudio1RenderPlan(value);
  assert.equal(plan.scenes.length, 3);
  assert.ok(plan.scenes.some(scene => scene.retimeFactor > 1 || scene.padSec > 0));
  assert.deepEqual(value.shots.map(item => Number((item.editorialStartSec + item.editorialDurationSec).toFixed(6))), semanticEnds);
  assert.ok(plan.maxBoundaryDriftMs <= 50);
  const filter = buildStudio1VisualFilter(value.shots[0], plan.scenes[0]);
  assert.match(filter, /trim=end_frame=/);
  assert.match(filter, /fps=30/);
}

// Unsafe extension must fail closed; it must never redistribute the deficit to another scene.
{
  const shots = [shot("x1", "alpha beta", 1.5), shot("x2", "gamma delta", 6.0)];
  const wordTimings = timings(["alpha","beta","gamma","delta"], [0.1,1.3,4.8,5.4], [0.5,1.8,5.1,5.8]);
  const value = manifest(shots, wordTimings, 7.0);
  assert.throws(
    () => synchronizeStudio1ManifestTimeline(value, { mode: "render" }),
    /selective regeneration/,
  );
}

// Per-scene transcript divergence must fail instead of falling back to proportional timing.
{
  const shots = [shot("m1", "alpha beta gamma"), shot("m2", "completely unrelated words")];
  const wordTimings = timings(["alpha","beta","gamma","delta","epsilon","zeta"], [0,0.5,1,2,2.5,3], [0.3,0.8,1.3,2.3,2.8,3.3]);
  assert.throws(
    () => computeStudio1NarrationTimeline({ shots, timings: wordTimings, durationSec: 4 }),
    /align|diverge/,
  );
}

console.log("Studio1 exact timeline QA passed");
