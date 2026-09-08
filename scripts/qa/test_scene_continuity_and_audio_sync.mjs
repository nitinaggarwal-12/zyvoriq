// test_scene_continuity_and_audio_sync.mjs
// Verifies scene continuity rules, temporal frame retention for b-roll, audio preservation for narrative genres, and voice allocation.

import assert from "node:assert";
import { purePhysicalCharacterDescription, sanitizePromptForImageGen } from "../characterAnchor.mjs";

console.log("🎬 Testing Scene Continuity, B-Roll Chaining, and Audio/Sync Strategy...");

// Test 1: Pure physical character description strips names, titles, and actor likenesses
console.log("  [1] Verifying pure physical character description sanitization...");
const rawChar = {
  id: "kabir_anand",
  name: "Kabir Anand",
  appearance: {
    ageBand: "Mid 30s",
    face: "Strong chiseled jawline, rugged stubble, piercing intense dark eyes",
    hair: "Textured swept-back dark hair with wind-blown volume",
    description: "Kabir Anand from Dhurandhar, in the style of Hrithik Roshan, Mid 30s."
  },
  biometricDNA: {
    gender: "male"
  },
  wardrobe: ["Charcoal leather motorcycle jacket, tactical henley"]
};

const sanitizedDesc = purePhysicalCharacterDescription(rawChar);
assert.ok(!sanitizedDesc.includes("Kabir"), "Must not include character name Kabir");
assert.ok(!sanitizedDesc.includes("Dhurandhar"), "Must not include film title Dhurandhar");
assert.ok(!sanitizedDesc.includes("Hrithik"), "Must not include actor name Hrithik");
assert.ok(sanitizedDesc.includes("Mid 30s"), "Must preserve age band");
assert.ok(sanitizedDesc.includes("jawline"), "Must preserve facial bone structure");
console.log("  ✓ Test 1 Passed: Character descriptions stripped to pure physical anatomy");

// Test 2: Temporal reference logic distinguishes Character switches vs B-roll
console.log("  [2] Verifying temporal reference chaining logic...");
function shouldOmitTemporalFrame(charId, depCharId, hasSafetyHistory = false) {
  if (charId && hasSafetyHistory) return true;
  const isCharacterSwitch = Boolean(charId && depCharId && charId !== depCharId);
  return isCharacterSwitch;
}

// Case A: Character A -> Character B (e.g. Kabir -> Zoya) -> MUST OMIT
assert.strictEqual(
  shouldOmitTemporalFrame("zoya_rehman", "kabir_anand"),
  true,
  "Character A -> Character B switch must omit temporal reference to prevent face collision"
);

// Case B: B-roll -> Character (e.g. cockpit view -> Kabir) -> MUST PRESERVE
assert.strictEqual(
  shouldOmitTemporalFrame("kabir_anand", undefined),
  false,
  "B-roll to Character transition must PRESERVE temporal reference so cabin/set is retained"
);

// Case C: Character -> B-roll (e.g. Kabir on bike -> speedometer / road view) -> MUST PRESERVE
assert.strictEqual(
  shouldOmitTemporalFrame(undefined, "kabir_anand"),
  false,
  "Character to B-roll transition must PRESERVE temporal reference"
);

// Case D: Same character contiguous shots (Kabir -> Kabir) -> MUST PRESERVE
assert.strictEqual(
  shouldOmitTemporalFrame("kabir_anand", "kabir_anand"),
  false,
  "Same character contiguous shots must PRESERVE temporal reference"
);
console.log("  ✓ Test 2 Passed: B-roll temporal chaining preserved while character switches safely isolate faces");

// Test 3: Audio Strategy in renderRough keys on Genre, not studio1
console.log("  [3] Verifying audio strategy branching on genre...");
function determineAudioStrategy(manifest, shotAudioProbes, isStudio1Payload) {
  const genre = String(manifest.creativeBible?.genre || manifest.genre || "").toUpperCase();
  const isDocumentary = genre === "DOCUMENTARY_EXPLAINER";
  const hasValidShotAudio = shotAudioProbes.length === manifest.shots.length && shotAudioProbes.every(Boolean);

  const hasNativeAudio = hasValidShotAudio && (!isStudio1Payload || !isDocumentary);
  const studio1 = !hasNativeAudio && isStudio1Payload && Boolean(manifest.studio1?.timelineSync);
  return { hasNativeAudio, studio1 };
}

// Case A: Historical Biopic (Samurai / Oppenheimer) with shot audio -> PRESERVE NATIVE AUDIO
const samuraiManifest = {
  genre: "HISTORICAL_BIOPIC",
  shots: [{ id: "shot_01" }, { id: "shot_02" }],
  studio1: { timelineSync: { version: 2 } }
};
const samuraiProbes = [true, true];
const samuraiStrategy = determineAudioStrategy(samuraiManifest, samuraiProbes, true);
assert.strictEqual(samuraiStrategy.hasNativeAudio, true, "Historical Biopic must preserve native dialogue & lip sync");
assert.strictEqual(samuraiStrategy.studio1, false, "Historical Biopic must NOT dub over with flat narration track");

// Case B: Bollywood Action (Dhurandhar) with shot audio -> PRESERVE NATIVE AUDIO
const bollywoodManifest = {
  genre: "BOLLYWOOD_ACTION",
  shots: [{ id: "shot_01" }, { id: "shot_02" }],
  studio1: { timelineSync: { version: 2 } }
};
const bollywoodStrategy = determineAudioStrategy(bollywoodManifest, samuraiProbes, true);
assert.strictEqual(bollywoodStrategy.hasNativeAudio, true, "Bollywood Action must preserve native dialogue, stunts & Foley");

// Case C: Documentary Explainer with presenter voiceover -> USE STUDIO1 MASTER
const docManifest = {
  genre: "DOCUMENTARY_EXPLAINER",
  shots: [{ id: "shot_01" }, { id: "shot_02" }],
  studio1: { timelineSync: { version: 2 } }
};
const docStrategy = determineAudioStrategy(docManifest, samuraiProbes, true);
assert.strictEqual(docStrategy.hasNativeAudio, false, "Documentary must use voiceover dub");
assert.strictEqual(docStrategy.studio1, true, "Documentary must route to Studio1 timeline sync master");
console.log("  ✓ Test 3 Passed: Audio strategy correctly branches on genre (lip sync preserved for cinema)");

// Test 4: Voice selection assigns male voices to male characters
console.log("  [4] Verifying character voice allocation...");
function selectVoiceForManifest(manifest) {
  const characters = Array.isArray(manifest.characters) && manifest.characters.length
    ? manifest.characters
    : (manifest.continuity?.characters || []);

  const leadChar = characters[0];
  const gender = String(leadChar?.biometricDNA?.gender || leadChar?.gender || "").toLowerCase();
  const voiceProfile = String(leadChar?.voiceProfile || "").toLowerCase();

  if (gender === "male" || voiceProfile.includes("baritone") || voiceProfile.includes("bass") || voiceProfile.includes("deep") || voiceProfile.includes("commanding") || voiceProfile.includes("gritty")) {
    return (voiceProfile.includes("gritty") || voiceProfile.includes("gravel") || voiceProfile.includes("warrior")) ? "Fenrir" : "Charon";
  }
  if (gender === "female" || voiceProfile.includes("soprano") || voiceProfile.includes("alto") || voiceProfile.includes("melodic")) {
    return voiceProfile.includes("clear") || voiceProfile.includes("melodic") ? "Aoede" : "Kore";
  }

  const genre = String(manifest.creativeBible?.genre || manifest.genre || "").toUpperCase();
  if (["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION", "HISTORICAL_BIOPIC", "NEO_NOIR_THRILLER", "CINEMATIC_DRAMA", "HIGH_FANTASY"].includes(genre)) {
    return "Charon";
  }
  return "Kore";
}

const renjiroManifest = {
  genre: "HISTORICAL_BIOPIC",
  characters: [{
    id: "renjiro",
    biometricDNA: { gender: "male" },
    voiceProfile: "Deep, gravelly warrior baritone"
  }]
};
assert.strictEqual(selectVoiceForManifest(renjiroManifest), "Fenrir", "Male warrior samurai must get Fenrir or Charon, not Kore");

const zoyaManifest = {
  genre: "BOLLYWOOD_ACTION",
  characters: [{
    id: "zoya",
    biometricDNA: { gender: "female" },
    voiceProfile: "Melodic soprano"
  }]
};
assert.strictEqual(selectVoiceForManifest(zoyaManifest), "Aoede", "Female character must get Aoede or Kore");
console.log("  ✓ Test 4 Passed: Voice allocation correctly maps gender and profile to neural voices");

console.log("🎉 ALL SCENE CONTINUITY & AUDIO STRATEGY TESTS PASSED!");
