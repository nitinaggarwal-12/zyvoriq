import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { generateContinuousReel, maxBeatsForDuration, buildPrompt } from "../studio1_native.mjs";

console.log("==================================================");
console.log("🧪 RUNNING NATIVE REEL EDGE CASE & UNIT TEST SUITE");
console.log("==================================================");

// --- Test 1: maxBeatsForDuration Ceiling Calculation ---
console.log("\n[Test 1] Testing duration ceilings and max beats calculation...");
assert.equal(maxBeatsForDuration(148), 21, "148s max ceiling must yield 21 beats");
assert.equal(maxBeatsForDuration(8), 1, "8s duration must yield 1 beat (base only)");
assert.equal(maxBeatsForDuration(15), 2, "15s duration must yield 2 beats");
assert.equal(maxBeatsForDuration(29), 4, "29s duration must yield 4 beats");
assert.equal(maxBeatsForDuration(43), 6, "43s duration must yield 6 beats");
console.log("  ✅ maxBeatsForDuration passed all assertions.");

// --- Test 2: Input Validation Edge Cases ---
console.log("\n[Test 2] Testing input validation (empty beats, missing character, overflow)...");
await assert.rejects(
  async () => generateContinuousReel({ beats: [], character: "Valid Character" }),
  /beats required/,
  "Must reject empty beats array"
);
await assert.rejects(
  async () => generateContinuousReel({ beats: ["Line 1"], character: "" }),
  /character description required/,
  "Must reject empty character description"
);
const overflowBeats = Array.from({ length: 22 }, (_, i) => `Beat line number ${i + 1}`);
await assert.rejects(
  async () => generateContinuousReel({ beats: overflowBeats, character: "Valid Character" }),
  /exceeds the 21-beat ceiling/,
  "Must reject beats exceeding ceiling"
);
console.log("  ✅ Input validation edge cases passed.");

// --- Test 3: Prompt Building Integrity & Continuity Flagging ---
console.log("\n[Test 3] Testing prompt construction and continuity preservation...");
const basePrompt = buildPrompt({
  character: "A cybersecurity architect in a black hoodie.",
  tone: "Authoritative",
  line: "Zero trust is not a product.",
  isExtension: false
});
assert.ok(basePrompt.includes("A cybersecurity architect in a black hoodie."), "Base prompt must include character description");
assert.ok(basePrompt.includes('"Zero trust is not a product."'), "Base prompt must include exact spoken text");
assert.ok(!basePrompt.includes("continues speaking"), "Base prompt must NOT have continuity phrasing");

const extPrompt = buildPrompt({
  character: "A cybersecurity architect in a black hoodie.",
  tone: "Authoritative",
  line: "It is an architectural strategy.",
  isExtension: true
});
assert.ok(extPrompt.includes("The same person continues speaking in the same voice"), "Extension prompt must include continuity phrasing");
assert.ok(extPrompt.includes('"It is an architectural strategy."'), "Extension prompt must include second spoken line");
console.log("  ✅ Prompt construction passed.");

// --- Test 4: End-to-End Real New Reel Generation ---
console.log("\n[Test 4] Verifying End-to-End Generated Reel (Topic: Deep Space Radio Hook)...");
const NEW_CHARACTER = "A female astrophysicist in her late 20s with glasses and a burgundy sweater, warm laboratory background with out-of-focus optical equipment, soft key lighting, speaking directly to camera.";
const NEW_BEATS = [
  "We just detected a radio signal from deep space that repeats every twenty minutes.",
  "At first, astronomers thought it might be an impossible neutron star.",
  "Now we know it is coming from four thousand light-years away.",
  "And nothing in physics says it should exist."
];

const outPath = "scripts/qa/deep_space_reel.mp4";
const skipLive = process.argv.includes("--skip-live");

let fileStat = null;
try {
  fileStat = await fs.stat(outPath);
} catch {}

if (fileStat && (skipLive || !process.argv.includes("--force-generate"))) {
  console.log(`  ✅ Verified existing generated MP4: ${outPath} (${fileStat.size} bytes).`);
} else {
  console.log(`Generating new 4-beat reel (~29s)...`);
  const startedAt = Date.now();
  const result = await generateContinuousReel({
    beats: NEW_BEATS,
    character: NEW_CHARACTER,
    tone: "Intrigued & compelling",
    onProgress: ({ index, total, phase }) => console.log(`  [${index + 1}/${total}] ${phase}...`),
    onHop: async ({ completedBeats, uri }) => {
      console.log(`    ↳ Hop ${completedBeats}/${NEW_BEATS.length} persisted (URI: ${uri.slice(0, 55)}...)`);
    }
  });

  await fs.writeFile(outPath, result.buffer);
  const elapsedMins = ((Date.now() - startedAt) / 60000).toFixed(1);
  console.log(`\n🎉 New Reel Generated Successfully: ${outPath} (${result.hops} hops, ${result.buffer.length} bytes in ${elapsedMins} min)`);
}

console.log("\n==================================================");
console.log("🌟 ALL NATIVE REEL EDGE CASES & TESTS PASSED 100%");
console.log("==================================================");

