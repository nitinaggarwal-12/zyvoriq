import assert from "node:assert";
import { planReel } from "../../lib/reel/planner.ts";
import { planStudio1Sync } from "../../lib/studio1/planner.ts";

console.log("⚡ Testing Prompt Assembly Quality Gates...");

const reelInput = {
  topic: "Meera Dholak and Aarav Dance Street Battle",
  scriptText: "MEERA: When the city sleeps, our rhythm claims the pavement.\nAARAV: Then feel the pulse through the soles of your feet.\nMEERA: The tempo doubles now.",
  aspectRatio: "9:16",
  requestedDurationSec: 15,
};

const manifest = planReel(reelInput);

assert(manifest.scenes && Object.keys(manifest.scenes).length > 0, "Manifest must include scenes dictionary");
assert(manifest.shots[0].sceneId, "Shot 0 must have sceneId");
assert(manifest.shots[0].generationPrompt.includes(`VERBATIM SCENE SETTING [${manifest.shots[0].sceneId}]:`), "Prompt must contain VERBATIM SCENE SETTING");

for (const shot of manifest.shots) {
  assert(!shot.generationPrompt.includes("2.39:1"), `9:16 prompt must NOT include 2.39:1 aspect ratio. Found in ${shot.id}`);
  assert(shot.generationPrompt.includes("9:16"), `9:16 prompt must include 9:16 framing. Missing in ${shot.id}`);
}
console.log("  ✓ Test 1 Passed: Aspect ratio harmonized (zero 2.39:1 in 9:16 reels) & shared scene environment locked");

const studio1Manifest = planStudio1Sync(reelInput);
const promptShot01 = studio1Manifest.shots[0].generationPrompt;
const promptShot02 = studio1Manifest.shots[1].generationPrompt;

assert(promptShot01.includes("IDENTITY LOCK [meera]"), `Shot 1 must preserve distinct character tag [meera]. Prompt: ${promptShot01}`);
assert(!promptShot01.includes("IDENTITY LOCK [lead_performer]"), "Shot 1 must NOT collapse to lead_performer");

assert(promptShot02.includes("IDENTITY LOCK [aarav]"), `Shot 2 must preserve distinct character tag [aarav]. Prompt: ${promptShot02}`);
assert(!promptShot02.includes("IDENTITY LOCK [lead_performer]"), "Shot 2 must NOT collapse to lead_performer");

assert(
  !promptShot01.includes("The previous-scene visual reference supplied by the worker is authoritative for the set"),
  "Shot 01 must NOT reference an authoritative previous-scene visual reference when no previous shot exists"
);

console.log("  ✓ Test 2 Passed: Distinct identity locks preserved per character & shot 01 omits previous-scene reference");

const idLockMatches02 = promptShot02.match(/IDENTITY LOCK/g) || [];
assert.strictEqual(idLockMatches02.length, 1, `Prompt must contain exactly ONE identity lock block, found ${idLockMatches02.length}`);

console.log("  ✓ Test 3 Passed: Studio 1 prompt assembly is strictly idempotent (zero stacked identity locks)");

console.log("🎉 ALL PROMPT ASSEMBLY QA TESTS PASSED!");
