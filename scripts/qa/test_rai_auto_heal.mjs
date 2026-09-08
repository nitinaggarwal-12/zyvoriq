import assert from "node:assert/strict";

function stripSpeakerPrefixes(text) {
  if (!text || typeof text !== "string") return text;
  const PRESERVED_DIRECTIVES = new Set([
    "CAMERA", "EYELINE", "LIGHTING", "FRAMING", "WARDROBE", "STYLE", "ACTION",
    "AUDIO", "MUSIC", "PROPS", "LOCATION", "SCENE", "SET", "ATMOSPHERE",
    "SHOT", "LENS", "FOCUS", "COLOR", "COMPOSITION", "SPEED", "GRADE", "TONE", "MOOD"
  ]);
  return text.replace(/(?:^|\n|\b)([A-Z][A-Za-z0-9_]*(?:\s+[A-Z][A-Za-z0-9_]*)?):(?=\s)/g, (match, prefix) => {
    const norm = prefix.trim().toUpperCase();
    if (PRESERVED_DIRECTIVES.has(norm) || norm.startsWith("STUDIO1") || norm.includes("LOCK") || norm.includes("RULE") || norm.includes("MODE") || norm.includes("TRACKING")) {
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
    apply: (p) => p.replace(/"[^"]*"/g, "").replace(/'[^']*'/g, ""),
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

// Test 2: Clean prompt with camera grammar should NOT match any rules
const cleanPrompt = `STUDIO1 IDENTITY LOCK [renjiro]: Master swordsman Renjiro stands among ancient bamboo stalks. Eyeline: screen left. Camera: low angle 24mm tracking. STUDIO1 ENVIRONMENT LOCK: misty forest. The current spoken beat is: Silence before the storm.`;
const res2 = simulateRaiAutoHeal(cleanPrompt);
assert(!res2.changed, "Clean prompt should NOT change");
assert.equal(res2.matchedRules.length, 0, "No rules should match clean prompt");
assert.equal(res2.healedPrompt, cleanPrompt, "Prompt should remain identical");
console.log("✓ Test 2 Passed: Clean prompt with STUDIO1 directives and Eyeline untouched.");

// Test 3: Reference decision logic
function decideTemporalReference({ charId, depCharId, hasSafetyHistory, hasRefBuffer }) {
  if (!hasRefBuffer) return false;
  const isSameCharacter = Boolean(charId && depCharId && charId === depCharId);
  if (charId && hasSafetyHistory) return false;
  if (charId && !isSameCharacter) return false;
  return true;
}

// 3a: Environment to Character cut (shot_03 bamboo -> shot_04 renjiro)
assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: null, hasSafetyHistory: false, hasRefBuffer: true }),
  false,
  "Must omit non-matching temporal frame when transitioning from environment to character"
);

// 3b: Shot/reverse-shot character cut (shot_04 renjiro -> shot_05 kaede)
assert.equal(
  decideTemporalReference({ charId: "kaede", depCharId: "renjiro", hasSafetyHistory: false, hasRefBuffer: true }),
  false,
  "Must omit non-matching temporal frame when transitioning between different characters"
);

// 3c: Same character continuous shot (shot_04 renjiro -> shot_05 renjiro)
assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: "renjiro", hasSafetyHistory: false, hasRefBuffer: true }),
  true,
  "Must include temporal frame for same character continuity"
);

// 3d: Same character continuous shot but on safety retry
assert.equal(
  decideTemporalReference({ charId: "renjiro", depCharId: "renjiro", hasSafetyHistory: true, hasRefBuffer: true }),
  false,
  "Must omit temporal frame on safety retry as fallback isolation"
);

// 3e: Environment to Environment continuous shot
assert.equal(
  decideTemporalReference({ charId: null, depCharId: null, hasSafetyHistory: false, hasRefBuffer: true }),
  true,
  "Must include temporal frame for environment-to-environment shots"
);

console.log("✓ Test 3 Passed: Temporal reference decisions match multi-character and safety fallback rules.");
console.log("🎉 ALL RAI AUTO-HEAL TESTS PASSED!");
