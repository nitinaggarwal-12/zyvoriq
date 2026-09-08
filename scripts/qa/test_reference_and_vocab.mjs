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

// 1. Test prompt sanitization and word clamping
function sanitizePromptForVeo(prompt) {
  if (!prompt || typeof prompt !== "string") return prompt;
  let clean = stripSpeakerPrefixes(prompt);
  const celebrityMap = [
    { pattern: /\b(?:Kiara\s*Advani|Kiara)\b/gi, replacement: "a radiant, graceful Indian leading lady" },
    { pattern: /\b(?:Akshay\s*Kumar|Akshay)\b/gi, replacement: "a handsome, athletic charismatic Indian leading man" },
    { pattern: /\b(?:Shah\s*Rukh\s*Khan|Shahrukh\s*Khan|SRK)\b/gi, replacement: "a charming, iconic romantic leading man with dimples" },
  ];
  for (const { pattern, replacement } of celebrityMap) {
    clean = clean.replace(pattern, replacement);
  }
  const words = clean.split(/\s+/);
  if (words.length > 700) {
    clean = words.slice(0, 700).join(" ");
  }
  return clean.replace(/\s{2,}/g, " ").trim();
}

console.log("Testing sanitizePromptForVeo...");
const rawPrompt = "KIARA: Kiara is looking at the rain in Mumbai with SRK. Camera: slow 35mm pan. Eyeline: off-camera left. STUDIO1 ENVIRONMENT LOCK: maintain temple courtyard. The current spoken beat is: Destiny calls. KINETIC_TRACKING: Steadicam follow. " + "word ".repeat(800);
const cleaned = sanitizePromptForVeo(rawPrompt);
assert(!cleaned.includes("KIARA:"), "Must strip speaker label");
assert(cleaned.includes("Camera:"), "Must PRESERVE Camera directive");
assert(cleaned.includes("Eyeline:"), "Must PRESERVE Eyeline directive");
assert(cleaned.includes("STUDIO1 ENVIRONMENT LOCK:"), "Must PRESERVE STUDIO1 ENVIRONMENT LOCK directive");
assert(cleaned.includes("The current spoken beat is:"), "Must PRESERVE spoken beat context");
assert(cleaned.includes("KINETIC_TRACKING:"), "Must PRESERVE KINETIC_TRACKING directive");
assert(cleaned.includes("a radiant, graceful Indian leading lady"), "Must map Kiara");
assert(cleaned.includes("a charming, iconic romantic leading man with dimples"), "Must map SRK");
const wordCount = cleaned.split(/\s+/).length;
assert(wordCount <= 700, `Word count must be <= 700, got ${wordCount}`);
console.log(`✓ sanitizePromptForVeo passed (speaker stripped, camera grammar preserved, word count clamped to ${wordCount})`);

// 2. Test vocabulary biasing extraction
function extractBiasedVocabulary(manifest) {
  const vocab = new Set();
  const characters = Array.isArray(manifest.characters) && manifest.characters.length
    ? manifest.characters
    : (manifest.continuity?.characters || []);
  for (const c of characters) {
    if (c.name) vocab.add(c.name.trim());
  }
  if (manifest.topic) {
    for (const w of manifest.topic.split(/\s+/)) {
      const clean = w.replace(/[^\p{L}\p{N}]/gu, "").trim();
      if (clean.length > 2) vocab.add(clean);
    }
  }
  if (manifest.masterScript) {
    const matches = manifest.masterScript.match(/\b[A-Z][a-zA-Z0-9']{2,}\b/g) || [];
    for (const m of matches) {
      if (!["The", "This", "That", "When", "What", "Where", "With", "Then", "From", "Into"].includes(m)) {
        vocab.add(m);
      }
    }
  }
  return Array.from(vocab).filter(Boolean);
}

console.log("Testing extractBiasedVocabulary...");
const manifestSample = {
  topic: "Mumbai Monsoon Reunion at Cafe Leopold",
  characters: [{ name: "Kiara" }, { name: "Kabir" }],
  masterScript: "Namaste Mumbai! Kiara meets Kabir at Colaba for cutting chai.",
};
const vocab = extractBiasedVocabulary(manifestSample);
assert(vocab.includes("Kiara"), "Should include character Kiara");
assert(vocab.includes("Kabir"), "Should include character Kabir");
assert(vocab.includes("Namaste"), "Should include Hindi term Namaste");
assert(vocab.includes("Colaba"), "Should include location Colaba");
assert(vocab.includes("Leopold"), "Should include topic entity Leopold");
console.log("✓ extractBiasedVocabulary passed:", vocab);

// 3. Test canonical reference synchronization
function referenceUrl(value) {
  if (typeof value === "string") return value;
  if (value && typeof value.url === "string") return value.url;
  return "";
}

function syncCanonicalReference(manifest, charId, saved) {
  const compatibility = Array.isArray(manifest.characters) ? manifest.characters : [];
  let compat = compatibility.find(c => c.id === charId);
  if (!compat) {
    const source = manifest.continuity?.characters?.find(c => c.id === charId);
    if (source) {
      compat = structuredClone(source);
      compatibility.push(compat);
      manifest.characters = compatibility;
    }
  }
  if (compat) {
    const existing = Array.isArray(compat.canonicalReferenceImages)
      ? compat.canonicalReferenceImages.map(referenceUrl).filter(Boolean)
      : [];
    if (!existing.includes(saved.url)) {
      existing.push(saved.url);
    }
    compat.canonicalReferenceImages = existing.slice(0, 3).map(url => ({ url, digest: saved.digest }));
  }

  const canonical = manifest.continuity?.characters?.find(c => c.id === charId);
  if (canonical) {
    const existing = Array.isArray(canonical.canonicalReferenceImages)
      ? canonical.canonicalReferenceImages.map(referenceUrl).filter(Boolean)
      : [];
    if (!existing.includes(saved.url)) {
      existing.push(saved.url);
    }
    canonical.canonicalReferenceImages = existing.slice(0, 3);
  }
}

console.log("Testing syncCanonicalReference (up to 3 references)...");
const testManifest = {
  characters: [{ id: "char_1", canonicalReferenceImages: [] }],
  continuity: { characters: [{ id: "char_1", canonicalReferenceImages: [] }] }
};
syncCanonicalReference(testManifest, "char_1", { url: "/url1.png", digest: "d1" });
syncCanonicalReference(testManifest, "char_1", { url: "/url2.png", digest: "d2" });
syncCanonicalReference(testManifest, "char_1", { url: "/url3.png", digest: "d3" });
syncCanonicalReference(testManifest, "char_1", { url: "/url4.png", digest: "d4" }); // Should cap to 3

assert.equal(testManifest.characters[0].canonicalReferenceImages.length, 3, "Should cap to 3 in characters");
assert.equal(testManifest.continuity.characters[0].canonicalReferenceImages.length, 3, "Should cap to 3 in continuity");
assert.equal(testManifest.continuity.characters[0].canonicalReferenceImages[0], "/url1.png");
assert.equal(testManifest.continuity.characters[0].canonicalReferenceImages[2], "/url3.png");
console.log("✓ syncCanonicalReference passed with 3-reference cap");

console.log("ALL UNIT TESTS PASSED.");
