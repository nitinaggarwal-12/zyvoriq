import assert from "node:assert";
import {
  TRENDING_MEME_LIBRARY,
  autoDetectMemeCutaways
} from "../../lib/reel/autoMemeEngine.js";
import {
  DUBBING_LANGUAGES,
  synthesizeDubbedTrack
} from "../../lib/reel/globalDubber.js";
import {
  TRENDING_AUDIO_TRACKS,
  quantizeToNearestBeat,
  beatAlignShots
} from "../../lib/reel/beatSyncEngine.js";
import {
  RISKY_TRIGGER_WORDS,
  scanDemonetizationArmor
} from "../../lib/reel/demonetizationArmor.js";

console.log("================================================================================");
console.log("🚀 EXECUTING TIER 3 VIRAL SUITE MULTI-MODAL QA TEST SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// TEST 1: Auto-Meme & Reaction Cutaway Injector
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Testing Auto-Meme & Reaction Cutaway Injector...");
assert.strictEqual(TRENDING_MEME_LIBRARY.length, 5, "Must have 5 trending meme presets");

const sampleShots = [
  { id: "shot_1", scriptText: "Stop ignoring this immediately if you want to grow." },
  { id: "shot_2", scriptText: "The real reason you struggle has almost nothing to do with effort." },
  { id: "shot_3", scriptText: "What if everything you were told about focus is suspicious and impossible?" },
  { id: "shot_4", scriptText: "You will regret making this massive mistake." }
];

const detectedMemes = autoDetectMemeCutaways(sampleShots);
assert.ok(detectedMemes.length >= 2, "Detected at least 2 meme punchlines in script");

const rockMeme = detectedMemes.find(m => m.memeId === "the_rock_eyebrow");
assert.ok(rockMeme, "Detected 'the_rock_eyebrow' meme on suspicious/impossible keywords");
assert.strictEqual(rockMeme.sfx, "vine_boom", "Meme uses vine_boom sound effect");

console.log(`  ✓ Detected ${detectedMemes.length} Meme Reaction triggers:`);
detectedMemes.forEach(m => console.log(`    • [${m.timestampSec}s] ${m.title} (SFX: ${m.sfx})`));
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// TEST 2: 1-Click "MrBeast Global Dubber" & Lip-Sync Phonemes
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Testing 1-Click Global Dubber & Neural Voice Synthesis...");
assert.strictEqual(DUBBING_LANGUAGES.length, 10, "Top 10 global dubbing markets verified");

const dubSpanish = synthesizeDubbedTrack("Stop ignoring 3 habits quietly killing your focus", "es-ES", "Aria Thorne");
assert.strictEqual(dubSpanish.languageCode, "es-ES");
assert.strictEqual(dubSpanish.pitchPreservationScore, 98, "98% original pitch preserved");
assert.ok(dubSpanish.lipSyncPhonemesCount > 30, "Generated phoneme sync count");
assert.ok(dubSpanish.dubbedAudioUrl.endsWith(".mp3"), "Dubbed MP3 audio path generated");

console.log(`  ✓ Dubbed Track: ${dubSpanish.languageName} (${dubSpanish.durationSec}s, ${dubSpanish.lipSyncPhonemesCount} phonemes)`);
console.log(`  ✓ Pitch Preservation: ${dubSpanish.pitchPreservationScore}%`);
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// TEST 3: Trending Audio Sync & Beat-Matched Auto-Cutter
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Testing Trending Audio BPM Quantization & Beat-Sync...");
assert.strictEqual(TRENDING_AUDIO_TRACKS.length, 3, "Trending tracks library verified");

const phonkTrack = TRENDING_AUDIO_TRACKS[0];
assert.strictEqual(phonkTrack.bpm, 130, "Phonk track is 130 BPM");

const rawTime = 3.5;
const snapped = quantizeToNearestBeat(rawTime, phonkTrack);
assert.strictEqual(snapped, 3.69, "Snapped 3.5s to nearest 130BPM downbeat (3.69s)");

const alignedShots = beatAlignShots(sampleShots, phonkTrack);
assert.strictEqual(alignedShots.length, sampleShots.length, "All shots re-timed");
assert.ok(alignedShots[0].editorialDurationSec > 0, "Shot duration quantized");

console.log(`  ✓ BPM Quantization: ${rawTime}s -> ${snapped}s on ${phonkTrack.title}`);
console.log(`  ✓ Quantized ${alignedShots.length} Scene Cuts to Phonk downbeats`);
console.log("  ✅ Test 3 Passed!");

// -----------------------------------------------------------------------------
// TEST 4: "Demonetization Armor" (AI Auto-Censor & Comedic Bleeper)
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 4: Testing Demonetization Armor Scanner & 1000Hz TV Bleeper...");
const riskyScript = "Stop ignoring 3 habits quietly killing your focus before you die of stress and hate your job";
const armorResult = scanDemonetizationArmor(riskyScript);

assert.ok(armorResult.flaggedItems.length >= 2, "Detected sensitive trigger words ('killing', 'die', 'hate')");
assert.ok(armorResult.censoredMasterScript.includes("[BLEEP: stopping]"), "Replaced 'killing' with safe substitute");

const first7sItem = armorResult.flaggedItems.find(f => f.isFirst7Seconds);
assert.ok(first7sItem, "Flagged high-risk trigger in critical 0-7s opening window");

console.log(`  ✓ Flagged ${armorResult.flaggedItems.length} trigger words (Safety Score: ${armorResult.overallSafetyScore}/100)`);
console.log(`  ✓ Armored Script: "${armorResult.censoredMasterScript.slice(0, 60)}..."`);
console.log("  ✅ Test 4 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL TIER 3 VIRAL SUITE TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================");
