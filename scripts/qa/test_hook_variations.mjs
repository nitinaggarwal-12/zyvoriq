/**
 * 🧪 PHASE 5: 1-CLICK A/B HOOK VARIATIONS ENGINE TEST SUITE
 */

import assert from "node:assert/strict";
import {
  generateHookSuite,
  swapHookInShots
} from "../../lib/reel/hookVariations.ts";

console.log("================================================================================");
console.log("🚀 EXECUTING PHASE 5 1-CLICK A/B HOOK VARIATIONS VALIDATION SUITE");
console.log("================================================================================\n");

const topic = "3 habits quietly killing your focus";

console.log("🧪 TEST 1: Procedural Viral Hook Suite Generation...");
const suite = generateHookSuite(topic, 3.5);
console.log(`  ✓ Generated Hook Suite for topic: "${suite.topic}"`);
console.log(`  ✓ Variants Count: ${suite.variants.length}`);
assert.equal(suite.variants.length, 3, "Must generate exactly 3 hook variations");

suite.variants.forEach((v, i) => {
  console.log(`    [${i + 1}] ${v.label} (${v.badge})`);
  console.log(`        Script: "${v.scriptText}"`);
  console.log(`        Camera: ${v.cameraMotion} · Score: ${v.testedRetentionScore}%`);
  assert.ok(v.scriptText.length > 10, "Script text must be substantive");
  assert.ok(v.veoPrompt.includes("9:16"), "Veo prompt must specify 9:16 vertical framing");
  assert.ok(v.testedRetentionScore >= 80, "Retention score must be high converting (>=80%)");
});
console.log("  ✅ Test 1 Passed!\n");

console.log("🧪 TEST 2: Downstream Body Narrative & Scene Preservation...");
const mockShots = [
  { id: "shot_01", editorialDurationSec: 3.5, scriptText: "Original hook text.", cameraMotion: "Static Punch" },
  { id: "shot_02", editorialDurationSec: 4.0, scriptText: "Scene 2: Core problem breakdown.", cameraMotion: "Pan Left" },
  { id: "shot_03", editorialDurationSec: 5.0, scriptText: "Scene 3: Deep work method.", cameraMotion: "Zoom In" },
  { id: "shot_04", editorialDurationSec: 4.5, scriptText: "Scene 4: Final viral CTA.", cameraMotion: "Dolly Out" }
];

const selectedHookB = suite.variants[1]; // Negative Warning
const updatedShots = swapHookInShots(mockShots, selectedHookB);

console.log(`  ✓ Scene 1 Updated: "${updatedShots[0].scriptText}"`);
assert.equal(updatedShots[0].scriptText, selectedHookB.scriptText, "Scene 1 script must match selected Hook B");
assert.equal(updatedShots[0].cameraMotion, selectedHookB.cameraMotion, "Scene 1 camera motion must match Hook B");

// Verify downstream scenes are completely untouched
console.log("  ✓ Verifying Scenes 2..4 integrity...");
assert.equal(updatedShots[1].scriptText, mockShots[1].scriptText, "Scene 2 must be preserved");
assert.equal(updatedShots[2].scriptText, mockShots[2].scriptText, "Scene 3 must be preserved");
assert.equal(updatedShots[3].scriptText, mockShots[3].scriptText, "Scene 4 must be preserved");
assert.equal(updatedShots.length, mockShots.length, "Total shot count must remain identical");
console.log("  ✅ Test 2 Passed!\n");

console.log("================================================================================");
console.log("🎉 ALL PHASE 5 1-CLICK A/B HOOK VARIATIONS TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
