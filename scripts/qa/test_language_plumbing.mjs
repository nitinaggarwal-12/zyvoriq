import assert from "node:assert";
import { planReel, resolveLanguage } from "../../lib/reel/planner.ts";
import { planStudio1Sync } from "../../lib/studio1/planner.ts";
import { validateTranscript, extractBiasedVocabulary } from "../reel_worker_utils.mjs";

console.log("⚡ Testing Language Plumbing Quality Gates...");

// 1. Test Language Resolution
assert.strictEqual(resolveLanguage("hinglish-roman"), "hinglish-roman", "Explicit hinglish-roman must be preserved");
assert.strictEqual(resolveLanguage("hi-devanagari"), "hi-devanagari", "Explicit hi-devanagari must be preserved");
assert.strictEqual(resolveLanguage(undefined, "make a Hindi reel about street food"), "hinglish-roman", "Hindi in topic must resolve to hinglish-roman");
assert.strictEqual(resolveLanguage(undefined, "Desi wedding dholak beats"), "hinglish-roman", "Desi in topic must resolve to hinglish-roman");
assert.strictEqual(resolveLanguage(undefined, "High octane stunts", undefined, "BOLLYWOOD_ACTION"), "hinglish-roman", "BOLLYWOOD_ACTION genre must resolve to hinglish-roman");
assert.strictEqual(resolveLanguage(undefined, "Alpine musical duet in snow", undefined, "BOLLYWOOD_ROMANCE"), "hinglish-roman", "BOLLYWOOD_ROMANCE genre must resolve to hinglish-roman");
assert.strictEqual(resolveLanguage(undefined, "Cyberpunk neon runner in Shinjuku"), "en", "Neutral topic must default to en");
console.log("  ✓ Test 1 Passed: Language resolution correctly handles explicit, keyword-inferred, and genre-inferred cases");

// 2. Test Manifest & Shot Prompts with Hinglish
const hinglishInput = {
  topic: "Meera Dholak and Kabir Dance Battle",
  scriptText: "MEERA: Jab beat drop hogi, pavement hilega!\nKABIR: Toh dekhte hain kisme kitna dum hai!\nMEERA: Chalo shuru karte hain!",
  aspectRatio: "9:16",
  requestedDurationSec: 15,
  language: "hinglish-roman",
};

const hinglishManifest = planStudio1Sync(hinglishInput);
assert.strictEqual(hinglishManifest.language, "hinglish-roman", "Manifest language must be hinglish-roman");

for (const shot of hinglishManifest.shots) {
  assert(
    shot.generationPrompt.includes("AUDIO & DIALOGUE LANGUAGE: Hinglish (Hindi-English blend in Roman script)"),
    `Shot ${shot.id} prompt must include Hinglish audio directive. Prompt: ${shot.generationPrompt}`
  );
  assert(
    shot.generationPrompt.includes("VERBATIM SCENE SETTING"),
    `Shot ${shot.id} must preserve scene setting alongside audio language directive`
  );
}
console.log("  ✓ Test 2 Passed: Hinglish language preserved on manifest and propagated to every shot prompt");

// 3. Test Manifest & Shot Prompts with Devanagari Hindi
const hindiInput = {
  topic: "रामायण कथा",
  scriptText: "राम: धर्म की रक्षा ही हमारा परम कर्तव्य है।\nलक्ष्मण: भ्राता, हम सदैव आपके साथ हैं।",
  aspectRatio: "9:16",
  requestedDurationSec: 12,
  language: "hi-devanagari",
};

const hindiManifest = planStudio1Sync(hindiInput);
assert.strictEqual(hindiManifest.language, "hi-devanagari", "Manifest language must be hi-devanagari");

for (const shot of hindiManifest.shots) {
  assert(
    shot.generationPrompt.includes("AUDIO & DIALOGUE LANGUAGE: Hindi (Devanagari)"),
    `Shot ${shot.id} prompt must include Hindi Devanagari audio directive`
  );
}
console.log("  ✓ Test 3 Passed: Hindi Devanagari language preserved and propagated to shot prompts");

// 4. Test Auto-inference from topic
const autoHindiManifest = planStudio1Sync({
  topic: "Make a Hindi reel about street food in Old Delhi",
  scriptText: "Chandni Chowk ke paranthe ka swaad hi alag hai.\nHar ek bite mein asli Dilli ka jaika milega.",
  aspectRatio: "9:16",
  requestedDurationSec: 12,
});
assert.strictEqual(autoHindiManifest.language, "hinglish-roman", "Topic with 'Hindi reel' must auto-resolve language to hinglish-roman");
assert(autoHindiManifest.shots[0].generationPrompt.includes("AUDIO & DIALOGUE LANGUAGE: Hinglish"), "Auto-resolved Hinglish must inject into shot prompts");
console.log("  ✓ Test 4 Passed: 'Make a Hindi reel' in topic auto-resolves to Hinglish without explicit selector");

// 5. Test validateTranscript WER tolerance for Hinglish
const expectedHinglish = "yeh beat sun kar crowd bilkul pagal ho gaya yaar";
// Simulated ASR output with slight phonetic differences: "ye" instead of "yeh", "yar" instead of "yaar"
const actualTokens = ["ye", "beat", "sun", "kar", "crowd", "bilkul", "pagal", "ho", "gaya", "yar"];
let curTime = 0;
const mockTimings = actualTokens.map(word => {
  const t = { word, startSec: curTime, endSec: curTime + 0.3 };
  curTime += 0.35;
  return t;
});

// Should FAIL under English mode (strict WER <= 0.10)
let englishThrew = false;
try {
  validateTranscript(expectedHinglish, mockTimings, curTime, "en");
} catch (e) {
  englishThrew = true;
}
assert(englishThrew, "English mode must reject WER > 0.10");

// Should PASS under Hinglish mode (WER <= 0.20)
const hinglishValidation = validateTranscript(expectedHinglish, mockTimings, curTime, "hinglish-roman");
assert(hinglishValidation.passed, "Hinglish mode must pass phonetic transliteration variations (WER <= 0.20)");
assert(hinglishValidation.wer <= 0.20, `Hinglish WER was ${hinglishValidation.wer}`);
console.log("  ✓ Test 5 Passed: validateTranscript accepts Hinglish transliteration variations under relaxed WER 0.20");

// 6. Test extractBiasedVocabulary for proper nouns and Indian names
const mockManifest = {
  topic: "Meera Dholak and Kabir Dance Battle in Old Delhi",
  masterScript: "MEERA: Chalo shuru karte hain!\nKABIR: Aaj beat rukegi nahi!",
  characters: [{ name: "Priya Sharma" }]
};
const biasedVocab = extractBiasedVocabulary(mockManifest);
assert(biasedVocab.includes("Meera"), "Biased vocabulary must include Meera from topic");
assert(biasedVocab.includes("Kabir"), "Biased vocabulary must include Kabir from topic");
assert(biasedVocab.includes("Dholak"), "Biased vocabulary must include Dholak from topic");
assert(biasedVocab.includes("Priya"), "Biased vocabulary must include Priya from character name");
assert(biasedVocab.includes("Sharma"), "Biased vocabulary must include Sharma from character name");
console.log("  ✓ Test 6 Passed: extractBiasedVocabulary correctly extracts Indian names and topic terms");

console.log("🎉 ALL LANGUAGE PLUMBING QA TESTS PASSED!");
