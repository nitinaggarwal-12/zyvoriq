import assert from "node:assert";
import { planStudio1, planStudio1Sync, WORDS_PER_SECOND, MAX_WORDS_PER_SHOT, MAX_SHOT_DURATION_SEC, splitScriptIntoBudgetedUnits } from "../../lib/studio1/planner.ts";

console.log("Testing Studio1 Narration Budgeting & Scene Splitting...");

// Test 1: Short script below cap does not split unnecessarily
{
  const input = {
    topic: "Focus Routine",
    scriptText: "Start with one small task. Notice what changes today.",
    requestedDurationSec: 15
  };
  const manifest = planStudio1Sync(input);
  assert.ok(manifest.shots.length >= 2, "Expected at least 2 shots");
  for (const shot of manifest.shots) {
    const words = shot.scriptText.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= MAX_WORDS_PER_SHOT, `Shot ${shot.id} word count ${words} <= ${MAX_WORDS_PER_SHOT}`);
    assert.ok(shot.editorialDurationSec <= 8.0, `Shot ${shot.id} duration ${shot.editorialDurationSec} <= 8.0s`);
  }
  console.log("  ✓ Short script test passed");
}

// Test 2: Long run-on sentence exceeding 8s cap is split at semantic boundaries
{
  const longSentence = "The real reason your workflow constantly breaks down is that you assume every single decision requires a brand new meeting instead of looking at the visible data right in front of you.";
  const input = {
    topic: "Workflow Optimization",
    scriptText: longSentence,
    requestedDurationSec: 25
  };
  const manifest = planStudio1Sync(input);
  console.log(`  Split long run-on into ${manifest.shots.length} budgeted scenes`);
  assert.ok(manifest.shots.length >= 3, `Expected at least 3 scenes, got ${manifest.shots.length}`);
  for (const shot of manifest.shots) {
    const words = shot.scriptText.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= MAX_WORDS_PER_SHOT, `Shot ${shot.id} has ${words} words, must be <= ${MAX_WORDS_PER_SHOT}`);
    assert.ok(shot.editorialDurationSec <= MAX_SHOT_DURATION_SEC, `Shot ${shot.id} editorial dur ${shot.editorialDurationSec} <= ${MAX_SHOT_DURATION_SEC}`);
    assert.ok(shot.generationDurationSec <= 8, `Generation duration ${shot.generationDurationSec} fits Veo bucket`);
  }
  console.log("  ✓ Long run-on sentence test passed");
}

// Test 3: Multi-speaker dialogue splits at speaker transitions and stays under budget
{
  const dialogue = "MEERA: Is this really you? After all this time? KABIR: My dear Meera, I searched for you across every city and every station, and nothing could keep us apart again!";
  const input = {
    topic: "Monsoon Reunion",
    scriptText: dialogue,
    requestedDurationSec: 20
  };
  const manifest = planStudio1Sync(input);
  console.log(`  Split dialogue into ${manifest.shots.length} budgeted scenes`);
  assert.ok(manifest.shots.length >= 3, `Expected at least 3 scenes, got ${manifest.shots.length}`);
  for (const shot of manifest.shots) {
    const words = shot.scriptText.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= MAX_WORDS_PER_SHOT, `Shot ${shot.id} word count ${words} <= ${MAX_WORDS_PER_SHOT}`);
    assert.ok(shot.editorialDurationSec <= 8.0, `Shot ${shot.id} duration ${shot.editorialDurationSec} <= 8.0s`);
  }
  console.log("  ✓ Multi-speaker dialogue budgeting test passed");
}

// Test 4: Boundaries and chronological start times are mathematically contiguous
{
  const input = {
    topic: "Productivity Arc",
    scriptText: "Step one: audit your morning. Step two: eliminate the noise. Step three: focus on one deliverable. Step four: review the output at sunset.",
    requestedDurationSec: 24
  };
  const manifest = planStudio1Sync(input);
  let expectedCursor = 0;
  for (let i = 0; i < manifest.shots.length; i++) {
    const s = manifest.shots[i];
    assert.strictEqual(s.order, i + 1, `Order mismatch at shot ${s.id}`);
    assert.ok(Math.abs(s.editorialStartSec - expectedCursor) < 0.001, `Start sec mismatch at shot ${s.id}: ${s.editorialStartSec} vs ${expectedCursor}`);
    expectedCursor += s.editorialDurationSec;
  }
  assert.strictEqual(manifest.continuity.boundaries.length, manifest.shots.length - 1, "Boundary count must equal shot count - 1");
  console.log("  ✓ Chronological continuity and boundary alignment test passed");
}

// Test 5: Dynamic narration generation via async planStudio1 (no canned sentence pool)
{
  const input = {
    topic: "high alpine climber reaching sunlit peak, wind in jacket",
    requestedDurationSec: 25
  };
  const manifest = await planStudio1(input);
  assert.ok(manifest.shots.length >= 2, "Expected at least 2 shots generated dynamically");
  assert.ok(manifest.masterScript.length > 10, "Expected non-empty dynamic script");
  assert.ok(!manifest.masterScript.includes("Here is what deserves a closer look"), "Must not contain canned sentence pool phrases");
  assert.ok(!manifest.masterScript.includes("The obvious reaction is only the surface"), "Must not contain canned generic phrases");
  for (const shot of manifest.shots) {
    const words = shot.scriptText.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= MAX_WORDS_PER_SHOT, `Dynamic shot ${shot.id} word count ${words} <= ${MAX_WORDS_PER_SHOT}`);
    assert.ok(shot.editorialDurationSec <= 8.0, `Dynamic shot ${shot.id} duration ${shot.editorialDurationSec} <= 8.0s`);
  }
  console.log("  ✓ Dynamic Gemini narration generation test passed (zero canned filler)");
}

console.log("🎉 ALL STUDIO1 NARRATION BUDGETING TESTS PASSED!");
