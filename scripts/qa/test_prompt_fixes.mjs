import assert from "node:assert";

const PRESERVED_DIRECTIVES = new Set([
  "CAMERA", "EYELINE", "LIGHTING", "FRAMING", "WARDROBE", "STYLE", "ACTION",
  "AUDIO", "MUSIC", "PROPS", "LOCATION", "SCENE", "SET", "ATMOSPHERE",
  "SHOT", "LENS", "FOCUS", "COLOR", "COMPOSITION", "SPEED", "GRADE", "TONE", "MOOD",
  "HERO_CLOSE_UP", "CLOSE_UP", "EXTREME_CLOSE_UP", "MEDIUM_SHOT", "WIDE_SHOT",
  "EXTREME_WIDE_SHOT", "OVER_THE_SHOULDER", "POINT_OF_VIEW", "DUTCH_ANGLE",
  "DUTCH_ANGLE_LOW", "TWO_SHOT", "INSERT_SHOT", "ESTABLISHING_SHOT", "ESTABLISHING_WIDE",
  "AERIAL_SHOT", "MASTER_SHOT", "CUTAWAY", "REVERSE_ANGLE"
]);

function stripSpeakerPrefixes(text) {
  if (!text || typeof text !== "string") return text;
  return text.replace(/(?:^|\n|\b)([A-Z][A-Za-z0-9_]*(?:\s+[A-Z][A-Za-z0-9_]*)?):(?=\s)/g, (match, prefix) => {
    const norm = prefix.trim().toUpperCase();
    if (
      PRESERVED_DIRECTIVES.has(norm) ||
      norm.startsWith("STUDIO1") ||
      norm.includes("LOCK") ||
      norm.includes("RULE") ||
      norm.includes("MODE") ||
      norm.includes("TRACKING") ||
      norm.includes("SHOT") ||
      norm.includes("CLOSE") ||
      norm.includes("ANGLE") ||
      norm.includes("VIEW") ||
      norm.includes("AUDIO") ||
      norm.includes("DIALOGUE") ||
      norm.includes("LANGUAGE") ||
      norm.includes("BEAT") ||
      norm.includes("SCENE") ||
      norm.includes("SETTING") ||
      norm.includes("CONTINUITY") ||
      norm.includes("TONE") ||
      norm.includes("GENRE")
    ) {
      return match;
    }
    if (/\b(?:is|are|was|were|at|in|on|to|for|with|by|from|about)\b/i.test(prefix)) {
      return match;
    }
    return "";
  });
}

function sanitizePromptForVeo(prompt, options = {}) {
  if (!prompt || typeof prompt !== "string") return prompt;
  const { audioStrategy = "native", isAudioFilterRetry = false } = options;
  const shouldStripDialogue = audioStrategy === "tts_dub" || isAudioFilterRetry;

  let clean = stripSpeakerPrefixes(prompt);
  clean = clean.replace(/STUDIO1 IDENTITY LOCK \[([^\]]+)\]:/gi, "IDENTITY LOCK [$1]:");
  clean = clean.replace(/The canonical character reference for [^,.]+(?:,\s*|\.\s*)/gi, "The canonical character reference for the performer, ");

  const preservedTags = [];
  clean = clean.replace(/\[[a-zA-Z0-9_-]+\]/g, (match) => {
    preservedTags.push(match);
    return `__PRESERVED_TAG_${preservedTags.length - 1}__`;
  });

  clean = clean.replace(/__PRESERVED_TAG_(\d+)__/g, (_, idx) => preservedTags[Number(idx)] || "");

  if (shouldStripDialogue) {
    const applyRule = (name, regex, replacement = "") => {
      const before = clean;
      clean = clean.replace(regex, replacement);
      if (clean !== before) {
        console.log(`[reel-worker] [sanitizer-rule] Rule "${name}" applied.`);
      }
    };

    applyRule("strip_audio_language_directive", /\bAUDIO\s*&?\s*DIALOGUE\s*LANGUAGE:[^.\n]+(?:\.|\$)/gi, "");
    applyRule("strip_native_character_dialogue_line", /\bNative character dialogue[^.\n]+(?:\.|\$)/gi, "");
    applyRule("strip_spoken_beat_line", /\bThe current spoken beat is:[^.\n]+(?:\.|\$)/gi, "");
    applyRule("strip_double_quoted_dialogue", /"[^"\r\n]{2,}"/g, "");
    applyRule("strip_vocalization_tags", /\((?:Softly|Playfully|Passionately|Gently|Whispering|Singing|Vocalizing)[^)]*\)/gi, "");
    applyRule("strip_ambient_soundscape_stub", /Pure cinematic ambient atmosphere and background soundscape\./gi, "");

    clean = clean.replace(/\s{2,}/g, " ").trim();
    clean += " AUDIO DIRECTIVE: Pure ambient environmental foley and natural atmospheric soundscape only. Zero spoken dialogue, zero character vocals, zero singing, zero lyrics.";
  } else {
    clean = clean.replace(/"([^"]+)"/g, "$1");
    clean = clean.replace(/AUDIO DIRECTIVE:\s*Pure ambient environmental foley[^.]*(?:\.|\$)/gi, "");
    clean = clean.replace(/Zero spoken dialogue, zero character vocals, zero singing, zero lyrics\.?/gi, "");
    clean = clean.replace(/\s{2,}/g, " ").trim();
    if (!clean.includes("AUDIO DIRECTIVE:")) {
      clean += " AUDIO DIRECTIVE: Synchronized native character dialogue, expressive vocal delivery, natural lip-sync, and ambient environmental foley.";
    }
  }

  return clean.replace(/\s{2,}/g, " ").trim();
}

console.log("=== RUNNING PROMPT FIX TESTS ===");

const testPromptB = "STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective. Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration. Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip.";
const outB = sanitizePromptForVeo(testPromptB, { audioStrategy: "tts_dub" });
assert.ok(outB.includes("Do not spend the opening seconds"), "FAILED: Do not spend the opening seconds was deleted!");
assert.ok(outB.includes("CURRENT scene's"), "FAILED: CURRENT scene's possessive was corrupted!");
console.log("PASS: Fix B - Possessive apostrophes preserved and negative instructions not inverted!");

const testPromptC = "AUDIO & DIALOGUE LANGUAGE: Native character dialogue and vocalizations must be in hi. The current spoken beat is: Tujhse judaa hokar. Some visual action.";
const outC_dub = sanitizePromptForVeo(testPromptC, { audioStrategy: "tts_dub" });
assert.ok(!outC_dub.includes("Native character dialogue"), "FAILED: Native character dialogue survived in tts_dub!");
assert.ok(!outC_dub.includes("AUDIO & DIALOGUE LANGUAGE:"), "FAILED: AUDIO & DIALOGUE LANGUAGE survived in tts_dub!");
assert.ok(outC_dub.includes("AUDIO DIRECTIVE: Pure ambient"), "FAILED: foley directive missing in tts_dub!");
console.log("PASS: Fix C (tts_dub) - Complete removal of language directive and dialogue without partial leftovers!");

const outC_native = sanitizePromptForVeo(testPromptC, { audioStrategy: "native" });
assert.ok(outC_native.includes("AUDIO & DIALOGUE LANGUAGE:"), "FAILED: AUDIO & DIALOGUE LANGUAGE was stripped in native mode!");
assert.ok(outC_native.includes("Native character dialogue"), "FAILED: Native character dialogue was stripped in native mode!");
assert.ok(outC_native.includes("The current spoken beat is:"), "FAILED: Spoken beat was stripped in native mode!");
assert.ok(!outC_native.includes("Zero spoken dialogue"), "FAILED: Zero spoken dialogue appeared in native mode!");
assert.ok(outC_native.includes("AUDIO DIRECTIVE: Synchronized native character dialogue"), "FAILED: native audio directive missing!");
console.log("PASS: Fix A (native) - Preserves character dialogue, spoken beat, and native audio directive!");

console.log("ALL PROMPT TESTS PASSED 100%!");
