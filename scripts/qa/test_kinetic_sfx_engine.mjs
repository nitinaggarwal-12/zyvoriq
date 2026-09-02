/**
 * 🧪 PHASE 4: AUTO-SFX & KINETIC EMOJIS ENGINE TEST SUITE
 */

import assert from "node:assert/strict";
import {
  autoGenerateKineticEmojis,
  getActiveEmojiAtTime,
  EMOJI_KEYWORD_DICTIONARY
} from "../../lib/reel/kineticEmoji.ts";

console.log("================================================================================");
console.log("🚀 EXECUTING PHASE 4 AUTO-SFX & KINETIC EMOJIS VALIDATION SUITE");
console.log("================================================================================\n");

// 1. Mock 6-Scene Production Plan with High-Impact Viral Keywords
const mockShots = [
  { id: "shot_01", editorialDurationSec: 4.0, scriptText: "Stop ignoring this one crazy mistake if you want to grow." },
  { id: "shot_02", editorialDurationSec: 4.0, scriptText: "Most creators rely on generic algorithms and loose focus." },
  { id: "shot_03", editorialDurationSec: 5.0, scriptText: "Instead, automate your habits with smart thinking." },
  { id: "shot_04", editorialDurationSec: 4.5, scriptText: "Look at your financial revenue and profit chart soaring." },
  { id: "shot_05", editorialDurationSec: 4.0, scriptText: "When you execute with rocket speed to scale," },
  { id: "shot_06", editorialDurationSec: 4.5, scriptText: "Your content quality achieves elite mastery like a king." }
];

console.log("🧪 TEST 1: Script-Driven Kinetic Emoji Extraction...");
const emojis = autoGenerateKineticEmojis(mockShots);
console.log(`  ✓ Generated ${emojis.length} Kinetic Emoji triggers for 6-shot sequence`);
assert.ok(emojis.length > 0, "Kinetic emojis should be generated for viral script keywords");

emojis.forEach((e, i) => {
  console.log(`    [${i + 1}] Beat ${e.sceneIndex + 1} (${e.emoji} ${e.label}): "${e.keyword}" @ ${e.startSec.toFixed(1)}s (Anim: ${e.animation}, SFX: ${e.sfx})`);
  assert.ok(e.startSec >= 0, "startSec must be >= 0");
  assert.ok(e.durationSec > 0, "durationSec must be > 0");
  assert.ok(e.emoji.length > 0, "emoji must be valid character");
});
console.log("  ✅ Test 1 Passed!\n");

console.log("🧪 TEST 2: Active Emoji Temporal Collision & Lookup Matrix...");
// Shot 1 starts at 0s, emoji triggers at t=0.8s (duration 1.4s -> ends 2.2s)
const emojiAtT1 = getActiveEmojiAtTime(emojis, 1.2);
console.log(`  ✓ Lookup at t=1.2s: ${emojiAtT1 ? `Active (${emojiAtT1.emoji} ${emojiAtT1.label} - SFX: ${emojiAtT1.sfx})` : "None"}`);
assert.ok(emojiAtT1 !== null, "Expected active emoji at t=1.2s");

// At t=3.0s, emoji should be inactive
const emojiAtT3 = getActiveEmojiAtTime(emojis, 3.0);
console.log(`  ✓ Lookup at t=3.0s: ${emojiAtT3 ? `Active (${emojiAtT3.emoji})` : "None (Clean Rest Phase)"}`);
assert.equal(emojiAtT3, null, "Expected rest period between beat animations");
console.log("  ✅ Test 2 Passed!\n");

console.log("🧪 TEST 3: Emoji Keyword Dictionary & SFX Mapping Integrity...");
console.log(`  ✓ Available presets: ${EMOJI_KEYWORD_DICTIONARY.length}`);
const validSFX = ["whoosh", "ding", "cash_chime", "bass_drop", "pop", "riser", "glitch"];
EMOJI_KEYWORD_DICTIONARY.forEach(dict => {
  console.log(`    • ${dict.emoji} ${dict.label} (Anim: ${dict.animation}, SFX: ${dict.sfx}) -> Keywords: [${dict.keywords.slice(0, 4).join(", ")}...]`);
  assert.ok(validSFX.includes(dict.sfx), `SFX type ${dict.sfx} must be valid`);
  assert.ok(dict.keywords.length > 0, "Dictionary entry must have keywords");
});
console.log("  ✅ Test 3 Passed!\n");

console.log("================================================================================");
console.log("🎉 ALL PHASE 4 AUTO-SFX & KINETIC EMOJIS TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
