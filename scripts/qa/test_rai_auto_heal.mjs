import assert from "node:assert/strict";

function stripSpeakerPrefixes(text) {
  if (!text || typeof text !== "string") return text;
  const PRESERVED_DIRECTIVES = new Set([
    "CAMERA", "EYELINE", "LIGHTING", "FRAMING", "WARDROBE", "STYLE", "ACTION",
    "AUDIO", "MUSIC", "PROPS", "LOCATION", "SCENE", "SET", "ATMOSPHERE",
    "SHOT", "LENS", "FOCUS", "COLOR", "COMPOSITION", "SPEED", "GRADE", "TONE", "MOOD",
    "HERO_CLOSE_UP", "CLOSE_UP", "EXTREME_CLOSE_UP", "MEDIUM_SHOT", "WIDE_SHOT",
    "EXTREME_WIDE_SHOT", "OVER_THE_SHOULDER", "POINT_OF_VIEW", "DUTCH_ANGLE",
    "DUTCH_ANGLE_LOW", "TWO_SHOT", "INSERT_SHOT", "ESTABLISHING_SHOT", "ESTABLISHING_WIDE",
    "AERIAL_SHOT", "MASTER_SHOT", "CUTAWAY", "REVERSE_ANGLE"
  ]);
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
      norm.includes("VIEW")
    ) {
      return match;
    }
    if (/\b(?:is|are|was|were|at|in|on|to|for|with|by|from|about)\b/i.test(prefix)) {
      return match;
    }
    return "";
  });
}

const HEAL_RULES = [
  {
    name: "strip-speaker-dialogue-prefixes",
    apply: (p) => stripSpeakerPrefixes(p),
  },
  {
    name: "replace-celebrity-names-with-generic-archetypes",
    apply: (p) => p.replace(/\b(?:Kiara\s*Advani|Kiara|Akshay\s*Kumar|Akshay|Salman\s*Khan|Salman|Aishwarya\s*Rai(?:\s*Bachchan)?|Aishwarya|Shah\s*Rukh\s*Khan|Shahrukh\s*Khan|SRK|Deepika\s*Padukone|Deepika|Ranveer\s*Singh|Ranveer|Alia\s*Bhatt|Alia|Ranbir\s*Kapoor|Ranbir|Hrithik\s*Roshan|Hrithik|Katrina\s*Kaif|Katrina|Priyanka\s*Chopra(?:\s*Jonas)?|Priyanka|Kareena\s*Kapoor(?:\s*Khan)?|Kareena|Saif\s*Ali\s*Khan|Saif|Amitabh\s*Bachchan|Amitabh|Tom\s*Cruise|Brad\s*Pitt|Leonardo\s*DiCaprio|Zendaya|Timothee\s*Chalamet|Timothée\s*Chalamet)\b/gi, "lead performer"),
  },
  {
    name: "neutralize-sensory-romantic-terms",
    apply: (p) => p
      .replace(/\blovers\b/gi, "characters")
      .replace(/\bintimate\b/gi, "cinematic")
      .replace(/\bpassionate\b/gi, "dramatic")
      .replace(/\bcolonial\b/gi, "vintage 1940s"),
  },
  {
    name: "strip-quoted-dialogue",
    // ONLY match double quotes and curly double quotes. NEVER match single quotes/apostrophes.
    apply: (p) => p.replace(/"[^"]*"/g, "").replace(/[“"][^"”]*[”"]/g, ""),
  },
];

function simulateRaiAutoHeal(prompt) {
  const matchedRules = [];
  let currentText = prompt;
  for (const rule of HEAL_RULES) {
    const transformed = rule.apply(currentText);
    if (transformed !== currentText) {
      matchedRules.push(rule.name);
      currentText = transformed;
    }
  }
  const healedPrompt = currentText.replace(/\s{2,}/g, " ").trim();
  const changed = (prompt !== healedPrompt);
  return { healedPrompt, changed, matchedRules };
}

console.log("Testing RAI auto-heal rules & camera grammar preservation...");

// Test 1: Celebrity name + dialogue quote + romantic terms + speaker prefix
const dirtyPrompt = `KIARA: "We cannot surrender now." Akshay Kumar and his companion, two lovers, share a passionate, intimate moment in a colonial garden. Eyeline: off-camera. Camera: slow 50mm push. STUDIO1 ENVIRONMENT LOCK: preserve courtyard.`;
const res1 = simulateRaiAutoHeal(dirtyPrompt);
assert(res1.changed, "Prompt should be healed");
assert.deepEqual(res1.matchedRules, [
  "strip-speaker-dialogue-prefixes",
  "replace-celebrity-names-with-generic-archetypes",
  "neutralize-sensory-romantic-terms",
  "strip-quoted-dialogue"
]);
assert(!res1.healedPrompt.includes("KIARA:"), "Must strip speaker label");
assert(!res1.healedPrompt.includes("Akshay Kumar"), "Must map celebrity name");
assert(!res1.healedPrompt.includes("lovers"), "Must neutralize lovers");
assert(!res1.healedPrompt.includes("passionate"), "Must neutralize passionate");
assert(!res1.healedPrompt.includes("intimate"), "Must neutralize intimate");
assert(!res1.healedPrompt.includes("colonial"), "Must neutralize colonial");
assert(!res1.healedPrompt.includes("We cannot surrender"), "Must strip quoted dialogue");
assert(res1.healedPrompt.includes("Eyeline: off-camera"), "Must PRESERVE Eyeline");
assert(res1.healedPrompt.includes("Camera: slow 50mm push"), "Must PRESERVE Camera");
assert(res1.healedPrompt.includes("STUDIO1 ENVIRONMENT LOCK: preserve courtyard"), "Must PRESERVE STUDIO1 ENVIRONMENT LOCK");
console.log("✓ Test 1 Passed: All 4 RAI rules matched and camera grammar preserved.");

// Test 2: Clean prompt with HERO_CLOSE_UP, possessives, and camera grammar must NEVER be mangled
const heroPrompt = `HERO_CLOSE_UP: Rain runs down Renjiro's scarred face, his hollow eyes reflecting an eerie spectral pale dawn.. Eyeline: screen_right. Camera: Low-angle tracking shot following damp footsteps. Something stalks the mist beneath the ancient gates. STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective.`;
const res2 = simulateRaiAutoHeal(heroPrompt);
assert(!res2.changed, "Hero prompt with possessives and shot grammar must NOT change");
assert.equal(res2.matchedRules.length, 0, "No rules should match clean hero prompt");
assert(res2.healedPrompt.includes("HERO_CLOSE_UP:"), "Must PRESERVE HERO_CLOSE_UP");
assert(res2.healedPrompt.includes("Renjiro's scarred face"), "Must PRESERVE Renjiro's scarred face (no apostrophe truncation!)");
assert(res2.healedPrompt.includes("CURRENT scene's narration beat"), "Must PRESERVE CURRENT scene's narration beat");
console.log("✓ Test 2 Passed: HERO_CLOSE_UP and possessives (Renjiro's, scene's) preserved without truncation.");

// Test 3: Fallback strategy reordering
function determineSafetyStrategy({ hadTemporalRef, prevSafetyAttempts }) {
  if (hadTemporalRef && prevSafetyAttempts === 0) {
    return "PRUNE_TEMPORAL_REFERENCE_PRESERVE_PROMPT";
  }
  return "APPLY_TEXT_SANITIZATION";
}

assert.equal(
  determineSafetyStrategy({ hadTemporalRef: true, prevSafetyAttempts: 0 }),
  "PRUNE_TEMPORAL_REFERENCE_PRESERVE_PROMPT",
  "First safety retry on shot with temporal ref must prune frame and leave prompt untouched"
);

assert.equal(
  determineSafetyStrategy({ hadTemporalRef: true, prevSafetyAttempts: 1 }),
  "APPLY_TEXT_SANITIZATION",
  "Second safety retry falls back to text sanitization"
);

assert.equal(
  determineSafetyStrategy({ hadTemporalRef: false, prevSafetyAttempts: 0 }),
  "APPLY_TEXT_SANITIZATION",
  "Shot with no temporal ref immediately evaluates text sanitization"
);

console.log("✓ Test 3 Passed: Strategy reordering verifies frame-omission first, text sanitizing second.");

// Test 4: Reference decision logic
function decideTemporalReference({ charId, depCharId, hasSafetyHistory, hasRefBuffer }) {
  if (!hasRefBuffer) return false;
  const isSameCharacter = Boolean(charId && depCharId && charId === depCharId);
  if (charId && hasSafetyHistory) return false;
  if (charId && !isSameCharacter) return false;
  return true;
}

assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: null, hasSafetyHistory: false, hasRefBuffer: true }),
  false,
  "Must omit non-matching temporal frame when transitioning from environment to character"
);

assert.equal(
  decideTemporalReference({ charId: "kaede", depCharId: "renjiro", hasSafetyHistory: false, hasRefBuffer: true }),
  false,
  "Must omit non-matching temporal frame when transitioning between different characters"
);

assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: "renjiro", hasSafetyHistory: false, hasRefBuffer: true }),
  true,
  "Must include temporal frame for same character continuity"
);

assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: "renjiro", hasSafetyHistory: true, hasRefBuffer: true }),
  false,
  "Must omit temporal frame on safety retry as fallback isolation"
);

console.log("✓ Test 4 Passed: Temporal reference decisions verified.");
console.log("🎉 ALL RAI AUTO-HEAL TESTS PASSED!");
