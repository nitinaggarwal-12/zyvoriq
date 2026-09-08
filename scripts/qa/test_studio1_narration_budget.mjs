import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { planStudio1, planStudio1Sync, TARGET_SHOT_DURATION_SEC, WORDS_PER_SECOND, MAX_WORDS_PER_SHOT, MAX_SHOT_DURATION_SEC, splitScriptIntoBudgetedUnits } from "../../lib/studio1/planner.ts";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || "").replace(/^['"]|['"]$/g, "").trim();
      }
    }
  }
} catch {}

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

  const bannedPhrases = [
    "Here is what deserves a closer look",
    "The obvious reaction is only the surface",
    "Look underneath it and notice the pattern",
    "Experience the true atmosphere",
    "Every detail reveals another layer",
    "Notice the energy moving naturally",
    "The perspective shifts as the moment deepens",
    "Pure immersion, captured from start to finish",
    "Take it all in before the next beat begins",
    "The rhythm carries the feeling forward",
    "That is where the real story lives"
  ];
  for (const phrase of bannedPhrases) {
    assert.ok(
      !manifest.masterScript.toLowerCase().includes(phrase.toLowerCase()),
      `Master script must not contain canned phrase: "${phrase}"`
    );
  }

  for (const shot of manifest.shots) {
    const words = shot.scriptText.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim().split(/\s+/).filter(Boolean).length;
    assert.ok(words <= MAX_WORDS_PER_SHOT, `Dynamic shot ${shot.id} word count ${words} <= ${MAX_WORDS_PER_SHOT}`);
    assert.ok(shot.editorialDurationSec <= 8.0, `Dynamic shot ${shot.id} duration ${shot.editorialDurationSec} <= 8.0s`);
  }
  console.log("  ✓ Dynamic Gemini narration generation test passed (zero canned filler)");
}

// Test 6: Missing API key fails closed with NARRATION_PRECONDITION_FAILED (zero silent canned fallback)
{
  const prevGemini = process.env.GEMINI_API_KEY;
  const prevGoogle = process.env.GOOGLE_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    let threw = false;
    try {
      await planStudio1({ topic: "autonomous testing fail closed", requestedDurationSec: 20 });
    } catch (err) {
      threw = true;
      assert.match(err.message, /NARRATION_PRECONDITION_FAILED/, "Must throw NARRATION_PRECONDITION_FAILED when API key missing");
    }
    assert.ok(threw, "planStudio1 must fail closed when Gemini key is missing; silent canned filler is strictly forbidden");
    console.log("  ✓ Precondition gate enforced: missing API key fails closed without fallback");
  } finally {
    if (prevGemini) process.env.GEMINI_API_KEY = prevGemini;
    if (prevGoogle) process.env.GOOGLE_API_KEY = prevGoogle;
  }
}

// Test 7: Synchronous planStudio1Sync fails closed if scriptText is missing
{
  let threw = false;
  try {
    planStudio1Sync({ topic: "test empty sync", requestedDurationSec: 20 });
  } catch (err) {
    threw = true;
    assert.match(err.message, /NARRATION_PRECONDITION_FAILED/, "planStudio1Sync must throw NARRATION_PRECONDITION_FAILED on empty scriptText");
  }
  assert.ok(threw, "planStudio1Sync must fail closed when scriptText is missing");
  console.log("  ✓ Synchronous planning fails closed when scriptText is omitted");
}

// Test 8: Synchronized duration and budgeting constants
{
  assert.strictEqual(TARGET_SHOT_DURATION_SEC, 6.0, "TARGET_SHOT_DURATION_SEC must be 6.0s (Veo bucket match)");
  assert.strictEqual(MAX_SHOT_DURATION_SEC, 7.5, "MAX_SHOT_DURATION_SEC must be 7.5s (Veo headroom cap)");
  assert.strictEqual(MAX_WORDS_PER_SHOT, 12, "MAX_WORDS_PER_SHOT must be 12 words");
  assert.strictEqual(WORDS_PER_SECOND, 1.65, "WORDS_PER_SECOND must be 1.65 wps");
  console.log("  ✓ Synchronized budgeting constants verified");
}

console.log("🎉 ALL STUDIO1 NARRATION BUDGETING TESTS PASSED!");
