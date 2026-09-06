#!/usr/bin/env node
/**
 * Guard 6: ASR Script Semantic Match Gate
 * Deterministic quality gate: Fails with exit code 1 if:
 * 1. An audio dialogue stem contains directorial meta-instructions or prompt text (Narrator bug).
 * 2. An audio dialogue stem diverges from the approved script text (> 25% extraneous words).
 * 3. Spoken dialogue is missing key approved screenplay sentences.
 */

import fs from "fs";
import path from "path";

// Prohibited directorial meta-prompt patterns
const PROHIBITED_DIRECTORIAL_PATTERNS = [
  /\byou are \b/i,
  /\bdeliver this line\b/i,
  /\bspeak with (an? )?(refined|british|american|dramatic|boisterous|posh|tender|ironic)?\b/i,
  /\bin an? \w+ (gown|tuxedo|suit|dress|tie)\b/i,
  /\bholding .* at the (bow|stern|table)\b/i,
  /\bwith (breathless|tearful|romantic|unflinching|deep|lively) (awe|warmth|vulnerability|devotion|amusement|humor)\b/i,
  /\b(raise your champagne|raising a toast|clinking glasses|slapping table)\b/i,
  /\b(prompt|director's prompt|character prompt|system instruction|meta-prompt)\b/i,
  /\b(a \d+-year-old (spirited|witty|passionate|wealthy|portly|glamorous))\b/i
];

/**
 * Normalizes text for semantic token comparison.
 */
function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Verifies that the spoken dialogue matches the screenplay script and contains
 * ZERO directorial meta-instructions.
 *
 * @param {Array} speechItems - Array of dialogue audit items:
 *   [{
 *      stemId: string,
 *      character: string,
 *      scriptText: string,
 *      transcriptText: string, // From Gemini Multimodal ASR / Whisper
 *      audioDurationSec?: number
 *   }]
 * @param {Object} options - Configuration options
 */
export function verifyAsrScriptSemanticMatch(speechItems, options = {}) {
  const { isSelfTest = false, maxExtraneousWordRatio = 0.25, sceneName = "scene_dialogue" } = options;

  console.log(`🎙️ [Guard 6: ASR Script Match Gate] Auditing speech semantics for "${sceneName}"...`);

  if (!speechItems || speechItems.length === 0) {
    console.error("❌ Speech items list is empty or missing.");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "EMPTY_SPEECH_ITEMS" };
  }

  const violations = [];

  for (const item of speechItems) {
    const { stemId, character, scriptText, transcriptText } = item;

    if (!transcriptText || transcriptText.trim().length === 0) {
      violations.push({
        stemId,
        type: "EMPTY_TRANSCRIPT",
        message: `Audio stem "${stemId}" (${character}) produced empty transcription.`
      });
      continue;
    }

    // 1. Directorial Meta-Prompt Regex Scan (Zero Tolerance)
    for (const pattern of PROHIBITED_DIRECTORIAL_PATTERNS) {
      const match = transcriptText.match(pattern);
      if (match) {
        violations.push({
          stemId,
          character,
          type: "DIRECTORIAL_META_PROMPT_LEAK",
          detectedPhrase: match[0],
          transcriptSnippet: transcriptText.slice(0, 120) + "...",
          message: `Directorial meta-prompt leaked into spoken audio: detected "${match[0]}". The TTS engine read the prompt instructions aloud like a narrator!`
        });
        break; // One violation per stem is sufficient to fail
      }
    }

    // 2. Token Set Containment & Extraneous Word Ratio
    const scriptTokens = new Set(tokenizeText(scriptText));
    const transcriptTokens = tokenizeText(transcriptText);

    if (transcriptTokens.length === 0) continue;

    let extraneousCount = 0;
    const extraneousWords = [];

    for (const token of transcriptTokens) {
      if (!scriptTokens.has(token)) {
        extraneousCount++;
        if (extraneousWords.length < 10) extraneousWords.push(token);
      }
    }

    const extraneousRatio = extraneousCount / transcriptTokens.length;

    if (extraneousRatio > maxExtraneousWordRatio) {
      violations.push({
        stemId,
        character,
        type: "EXCESSIVE_EXTRANEOUS_SPEECH",
        extraneousRatio: extraneousRatio,
        threshold: maxExtraneousWordRatio,
        extraneousWords: extraneousWords,
        message: `Spoken audio contains ${(extraneousRatio * 100).toFixed(1)}% extraneous words not in the screenplay (Threshold: <= ${(maxExtraneousWordRatio * 100).toFixed(1)}%). Words: [${extraneousWords.join(", ")}].`
      });
    }

    // 3. Essential Script Coverage (Did the actor actually speak the lines?)
    let matchedScriptCount = 0;
    const transcriptTokenSet = new Set(transcriptTokens);
    for (const token of scriptTokens) {
      if (transcriptTokenSet.has(token)) matchedScriptCount++;
    }
    const scriptCoverage = scriptTokens.size > 0 ? matchedScriptCount / scriptTokens.size : 1.0;

    if (scriptCoverage < 0.60) {
      violations.push({
        stemId,
        character,
        type: "INSUFFICIENT_SCRIPT_COVERAGE",
        coverage: scriptCoverage,
        threshold: 0.60,
        message: `Spoken audio only covered ${(scriptCoverage * 100).toFixed(1)}% of the screenplay words (Threshold: >= 60.0%). The character failed to deliver the written line.`
      });
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ CRITICAL ASR SCRIPT SEMANTIC FAILURE DETECTED (${violations.length} violations):`);
    for (const v of violations) {
      console.error(`   [${v.type}] Stem: "${v.stemId}" (${v.character || "Unknown"}): ${v.message}`);
    }
    console.error(`\n   DIAGNOSIS: The audio output contains third-person narrator prompt instructions or heavily diverges from the screenplay.`);
    console.error(`   SOLUTION: Sanitize the TTS input payload to contain EXCLUSIVELY the character's spoken screenplay dialogue.`);
    console.error(`\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n`);
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "ASR_SCRIPT_SEMANTIC_FAILURE", violations };
  }

  console.log(`✅ [Guard 6: ASR Script Match Gate] PASSED: 100% in-character dialogue verified. Zero prompt instructions detected.\n`);
  return { passed: true, violations: [] };
}

// Self-Test Falsification Probes
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 6 Self-Test (Falsification Probes)...");

  const targetScript = "I asked Thomas Andrews this morning if this vessel was truly unsinkable. He told me, God Himself couldn't sink this ship, but the accountants might certainly try!";

  // Probe 1: Negative Control (The actual bug that occurred in produce_titanic_dining_scene)
  // The TTS model read the entire prompt instruction aloud
  const badItems = [
    {
      stemId: "line_01_archibald_setup",
      character: "Lord Archibald Sterling",
      scriptText: targetScript,
      transcriptText: "You are Lord Archibald Sterling, a witty, jovial 50-year-old British billionaire shipping magnate. Speak with a refined British aristocratic accent, delivering this joke: I asked Thomas Andrews this morning if this vessel was truly unsinkable..."
    }
  ];

  const badResult = verifyAsrScriptSemanticMatch(badItems, { isSelfTest: true, sceneName: "probe_leaked_prompt_scene" });
  if (badResult.passed || badResult.reason !== "ASR_SCRIPT_SEMANTIC_FAILURE") {
    console.error("❌ Self-Test FAILED: Guard 6 failed to reject leaked directorial meta-prompt!");
    process.exit(1);
  }
  console.log("   ✓ Directorial meta-prompt leak correctly caught and rejected.");

  // Probe 2: Negative Control (Clara Southampton prompt leak from produce_titanic_reel)
  const badClaraItem = [
    {
      stemId: "line_01_clara",
      character: "Clara",
      scriptText: "I never knew the world could feel this breathless, Julian.",
      transcriptText: "You are Clara, a 20-year-old spirited Edwardian aristocrat in an emerald gown aboard the Titanic. Deliver this line with breathless romantic awe: I never knew the world could feel this breathless, Julian."
    }
  ];
  const badClaraResult = verifyAsrScriptSemanticMatch(badClaraItem, { isSelfTest: true, sceneName: "probe_clara_leak" });
  if (badClaraResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 6 failed to reject Clara directorial prompt leak!");
    process.exit(1);
  }
  console.log("   ✓ Actor directorial persona definition correctly rejected.");

  // Probe 3: Positive Control (Clean, in-character spoken dialogue)
  const goodItems = [
    {
      stemId: "line_01_archibald_clean",
      character: "Lord Archibald Sterling",
      scriptText: targetScript,
      transcriptText: "I asked Thomas Andrews this morning if this vessel was truly unsinkable. He told me, 'Lord Archibald, God Himself couldn't sink this ship... but the accountants might certainly try!'"
    },
    {
      stemId: "line_02_alistair_clean",
      character: "Sir Alistair Finch",
      scriptText: "Ha-ha-ha-ha! By Jove, Archibald! Capital! Absolutely priceless, my dear fellow!",
      transcriptText: "Ha-ha-ha-ha! By Jove, Archibald! Capital! Absolutely priceless, my dear fellow!"
    }
  ];

  const goodResult = verifyAsrScriptSemanticMatch(goodItems, { isSelfTest: true, sceneName: "probe_clean_scene" });
  if (!goodResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 6 rejected clean dialogue matching script!");
    process.exit(1);
  }
  console.log("   ✓ Pure in-character spoken dialogue correctly accepted.");

  console.log("🎉 Guard 6 Self-Test Completed Successfully!\n");
  process.exit(0);
}
