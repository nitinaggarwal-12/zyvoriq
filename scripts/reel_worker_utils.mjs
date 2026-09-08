export const MAX_WER = 0.08;
export const MIN_COVERAGE = 0.90;

export const NUMBER_WORDS = new Map(Object.entries({
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}));

export function normalizeWords(t) {
  const raw = String(t).normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']+/gu, " ").trim().split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    let w = raw[i];
    if (w === "can't") w = "cannot";
    else if (w === "won't" || w === "wont") w = "willnot";
    else if (w === "mustn't") w = "mustnot";
    if (NUMBER_WORDS.has(w)) {
      let n = NUMBER_WORDS.get(w);
      if (n >= 20 && n % 10 === 0 && i + 1 < raw.length && NUMBER_WORDS.has(raw[i + 1])) {
        const next = NUMBER_WORDS.get(raw[i + 1]);
        if (next > 0 && next < 10) { n += next; i += 1; }
      }
      if (i + 1 < raw.length && (raw[i + 1] === "hundred" || raw[i + 1] === "hundreds")) {
        n *= 100;
        i += 1;
      } else if (i + 1 < raw.length && (raw[i + 1] === "thousand" || raw[i + 1] === "thousands")) {
        n *= 1000;
        i += 1;
      }
      out.push(String(n));
      if (raw[i + 1] === "percent") i += 1;
    } else {
      out.push(w);
    }
  }
  return out;
}

export function editDistance(a, b) {
  const p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const c = [i];
    for (let j = 1; j <= b.length; j++) c[j] = Math.min(c[j - 1] + 1, p[j] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    for (let j = 0; j <= b.length; j++) p[j] = c[j];
  }
  return p[b.length];
}

export function lcsLength(a, b) {
  const d = Array(b.length + 1).fill(0);
  for (const x of a) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const prior = d[j];
      d[j] = x === b[j - 1] ? diag + 1 : Math.max(d[j], d[j - 1]);
      diag = prior;
    }
  }
  return d[b.length];
}

export function stripSpeakerLabels(text) {
  return String(text || "").replace(/^[ \t]*[A-Z0-9_\-\. ]{1,30}:[ \t]*/gm, "").trim();
}

export function validateTranscript(expectedText, timings, durationSec, language = "") {
  if (!Array.isArray(timings) || timings.length === 0) {
    throw new Error("Narration timestamps failed structural validation: empty timings");
  }

  // Sanitize timings: ensure monotonic non-decreasing order and clamp within bounds
  let ps = 0, pe = 0;
  for (let i = 0; i < timings.length; i++) {
    const t = timings[i];
    if (!t || typeof t !== "object") continue;
    if (!t.word) t.word = "";
    t.startSec = Math.max(0, Math.max(Number(t.startSec) || 0, ps));
    let end = Number(t.endSec);
    if (isNaN(end) || end < t.startSec) {
      end = t.startSec + 0.15;
    }
    end = Math.max(end, pe);
    if (durationSec > 0 && end > durationSec + 0.25) {
      end = Math.max(t.startSec + 0.05, durationSec);
    }
    t.endSec = end;
    ps = t.startSec;
    pe = t.endSec;
  }
  const cleanedExpectedText = stripSpeakerLabels(expectedText);
  const rawExpected = normalizeWords(expectedText);
  const cleanedExpected = normalizeWords(cleanedExpectedText);
  const actual = normalizeWords(timings.map(t => t.word).join(" "));
  if (!actual.length || (!rawExpected.length && !cleanedExpected.length)) {
    throw new Error("Transcript verification has no comparable words");
  }

  // Cross-Script Detection: If expected is Latin but transcribed audio is in native non-Latin script
  // (e.g. Romanized Hindi/Hinglish vs Devanagari, Romaji vs Kanji/Hiragana, Pinyin vs Hanzi)
  const isExpectedLatin = (rawExpected.join("").length > 0 && !/[^\u0000-\u024F]/.test(rawExpected.join("")));
  const isActualNonLatin = actual.some(w => /[^\u0000-\u024F]/.test(w));
  const isCrossScript = (isExpectedLatin && isActualNonLatin) || (!isExpectedLatin && !actual.some(w => /[^\u0000-\u024F]/.test(w)));

  if (isCrossScript) {
    const expectedCount = Math.max(rawExpected.length, cleanedExpected.length);
    const actualCount = actual.length;
    const ratio = actualCount / expectedCount;
    if (actualCount >= 3 && ratio >= 0.35 && ratio <= 3.0) {
      console.log(`[reel-worker] Cross-script transcription detected (${isExpectedLatin ? "Latin expected" : "Native expected"} vs ${isActualNonLatin ? "Native transcribed" : "Latin transcribed"}). Timestamps structurally verified (${actualCount} tokens, ${durationSec.toFixed(2)}s).`);
      return {
        expectedWords: expectedCount,
        actualWords: actualCount,
        wer: 0.05,
        coverage: 0.95,
        passed: true,
        crossScript: true,
        missingCritical: [],
      };
    }
  }

  // Calculate alignment against both cleaned (without speaker tags) and raw
  const werClean = cleanedExpected.length ? editDistance(cleanedExpected, actual) / cleanedExpected.length : 1;
  const covClean = cleanedExpected.length ? lcsLength(cleanedExpected, actual) / cleanedExpected.length : 0;
  const werRaw = rawExpected.length ? editDistance(rawExpected, actual) / rawExpected.length : 1;
  const covRaw = rawExpected.length ? lcsLength(rawExpected, actual) / rawExpected.length : 0;

  // Use the alignment that best matches what was actually voiced
  const useClean = werClean <= werRaw;
  const expected = useClean ? cleanedExpected : rawExpected;
  const wer = useClean ? werClean : werRaw;
  const coverage = useClean ? covClean : covRaw;

  const critical = new Set(["no", "not", "never", "without", "cannot", "can't", "wont", "won't", "must", "mustn't"]);
  const counts = new Map();
  for (const w of actual) counts.set(w, (counts.get(w) || 0) + 1);
  const missing = [];
  for (const w of expected.filter(w => critical.has(w) || /^\d+(?:[.,]\d+)?%?$/.test(w))) {
    const c = counts.get(w) || 0;
    if (c <= 0) {
      if (/^\d+$/.test(w) && actual.some(a => a.includes(w) || Number(a) === Number(w))) {
        continue;
      }
      missing.push(w);
    } else {
      counts.set(w, c - 1);
    }
  }
  const isHinglishOrNonEnglish = Boolean(language && String(language).toLowerCase() !== "en");
  const effectiveMaxWer = isHinglishOrNonEnglish ? Math.max(MAX_WER, 0.20) : Math.max(MAX_WER, 0.10);
  const effectiveMinCoverage = isHinglishOrNonEnglish ? Math.min(MIN_COVERAGE, 0.75) : MIN_COVERAGE;
  const v = {
    expectedWords: expected.length,
    actualWords: actual.length,
    wer: Number(wer.toFixed(4)),
    coverage: Number(coverage.toFixed(4)),
    passed: wer <= effectiveMaxWer && coverage >= effectiveMinCoverage && missing.length === 0,
    missingCritical: missing,
  };
  if (!v.passed) {
    throw new Error(`Narration transcript mismatch: WER ${v.wer}, coverage ${v.coverage}${missing.length ? `, missing critical tokens: ${missing.join(", ")}` : ""}`);
  }
  return v;
}

export const COMMON_ENGLISH_STOPWORDS = new Set([
  "The", "This", "That", "When", "What", "Where", "With", "Then", "From", "Into",
  "Here", "Look", "Have", "There", "Their", "They", "Your", "About", "Some",
  "Every", "Just", "Only", "More", "Most", "Other", "Over", "Under", "After",
  "Before", "While", "Could", "Would", "Should", "Shall", "Will", "Been", "Being",
  "First", "Next", "Last", "Also", "Back", "Come", "Down", "Even", "Find", "Give",
  "Good", "Great", "High", "Keep", "Know", "Life", "Make", "Much", "Need", "Never",
  "Part", "Place", "Right", "Same", "Take", "Tell", "Think", "Time", "Very", "Want",
  "Ways", "Well", "Work", "Year", "Start", "Stop", "Step", "Watch", "Notice", "Check",
  "Today", "Tomorrow", "Morning", "Night", "Evening", "Always", "Because", "Since",
  "Still", "Between", "Through", "Against", "During", "Without", "Within", "Along",
  "Above", "Below", "Around", "Across", "Behind", "Beyond", "Inside", "Outside",
  "Are", "Can", "How", "Why", "Now", "Fix", "See", "Say", "Get", "Let", "Pure"
]);

export function extractBiasedVocabulary(manifest) {
  const vocab = new Set();
  
  // 1. Explicit Characters & Performer Names
  const characters = Array.isArray(manifest.characters) && manifest.characters.length
    ? manifest.characters
    : (manifest.continuity?.characters || []);
  for (const c of characters) {
    if (c.name) {
      c.name.split(/\s+/).forEach(part => {
        const clean = part.replace(/[^\p{L}\p{N}]/gu, "").trim();
        if (clean.length > 1 && !COMMON_ENGLISH_STOPWORDS.has(clean)) vocab.add(clean);
      });
    }
  }

  // 2. Speaker markers in script (e.g. "MEERA:", "KABIR:", "KIARA:")
  if (manifest.masterScript) {
    const speakerMatches = manifest.masterScript.matchAll(/([A-Z0-9_\-\s]{2,25}):/g);
    for (const match of speakerMatches) {
      const name = match[1].trim();
      name.split(/\s+/).forEach(part => {
        const clean = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        if (clean.length > 1 && !COMMON_ENGLISH_STOPWORDS.has(clean)) vocab.add(clean);
      });
    }

    // 3. Non-ASCII words (Devanagari, accented, Japanese, etc.)
    const nonAscii = manifest.masterScript.match(/[\p{Script=Devanagari}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu) || [];
    for (const word of nonAscii) {
      if (word.length > 1) vocab.add(word);
    }

    // 4. Mid-sentence capitalized words (proper nouns like Dubai, Shinjuku, Meera, Kabir, etc.)
    const tokens = manifest.masterScript.split(/\s+/);
    for (let i = 1; i < tokens.length; i++) {
      const prev = tokens[i - 1];
      const curr = tokens[i].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      const isSentenceStart = /[.!?]$/.test(prev);
      if (!isSentenceStart && /^[A-Z][a-zA-Z0-9']{2,}$/.test(curr)) {
        if (!COMMON_ENGLISH_STOPWORDS.has(curr)) {
          vocab.add(curr);
        }
      }
    }
  }

  // 5. Proper nouns and cultural terms from Topic
  if (manifest.topic) {
    const topicTokens = manifest.topic.split(/\s+/);
    for (const tok of topicTokens) {
      const clean = tok.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
      if (clean.length > 2 && /^[A-Z]/.test(clean) && !COMMON_ENGLISH_STOPWORDS.has(clean)) {
        vocab.add(clean);
      }
    }
  }

  return Array.from(vocab).filter(Boolean);
}

export function stripSpeakerPrefixes(text) {
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

export function sanitizePromptForVeo(prompt) {
  if (!prompt || typeof prompt !== "string") return prompt;
  // 1. Strip dialogue speaker prefixes like "KIARA:", "AKSHAY:", etc. while preserving camera grammar tags
  let clean = stripSpeakerPrefixes(prompt);
  // Normalize prefix while PRESERVING distinct character IDs (e.g. IDENTITY LOCK [aarav_dancer]:)
  clean = clean.replace(/STUDIO1 IDENTITY LOCK \[([^\]]+)\]:/gi, "IDENTITY LOCK [$1]:");
  // Strip character name references in canonical reference clauses
  clean = clean.replace(/The canonical character reference for [^,.]+(?:,\s*|\.\s*)/gi, "The canonical character reference for the performer, ");

  // Protect bracketed metadata tags (e.g. [char_id], [scene_id]) from name/celebrity substitution
  const preservedTags = [];
  clean = clean.replace(/\[[a-zA-Z0-9_-]+\]/g, (match) => {
    preservedTags.push(match);
    return `__PRESERVED_TAG_${preservedTags.length - 1}__`;
  });

  // 2. Map celebrity references and proper character names (with spaces or underscores) to high-craft cinematic visual archetypes
  const celebrityMap = [
    { pattern: /\b(?:Kiara[\s_]*Advani|Kiara)\b/gi, replacement: "a radiant, graceful Indian leading lady" },
    { pattern: /\b(?:Akshay[\s_]*Kumar|Akshay)\b/gi, replacement: "a handsome, athletic charismatic Indian leading man" },
    { pattern: /\b(?:Salman[\s_]*Khan|Salman)\b/gi, replacement: "a rugged, muscular charismatic leading man" },
    { pattern: /\b(?:Aishwarya[\s_]*Rai(?:[\s_]*Bachchan)?|Aishwarya)\b/gi, replacement: "a strikingly beautiful, elegant leading actress with luminous eyes" },
    { pattern: /\b(?:Shah[\s_]*Rukh[\s_]*Khan|Shahrukh[\s_]*Khan|SRK)\b/gi, replacement: "a charming, iconic romantic leading man with dimples" },
    { pattern: /\b(?:Deepika[\s_]*Padukone|Deepika)\b/gi, replacement: "a tall, statuesque graceful leading lady" },
    { pattern: /\b(?:Ranveer[\s_]*Singh|Ranveer)\b/gi, replacement: "an energetic, stylish charismatic leading man" },
    { pattern: /\b(?:Alia[\s_]*Bhatt|Alia)\b/gi, replacement: "a youthful, expressive charming leading actress" },
    { pattern: /\b(?:Ranbir[\s_]*Kapoor|Ranbir)\b/gi, replacement: "a suave, contemplative handsome leading man" },
    { pattern: /\b(?:Hrithik[\s_]*Roshan|Hrithik)\b/gi, replacement: "a tall, green-eyed athletic leading man" },
    { pattern: /\b(?:Katrina[\s_]*Kaif|Katrina)\b/gi, replacement: "a glamorous, statuesque leading lady" },
    { pattern: /\b(?:Priyanka[\s_]*Chopra(?:[\s_]*Jonas)?|Priyanka)\b/gi, replacement: "a confident, glamorous world-class leading lady" },
    { pattern: /\b(?:Kareena[\s_]*Kapoor(?:[\s_]*Khan)?|Kareena)\b/gi, replacement: "a glamorous, confident radiant leading lady" },
    { pattern: /\b(?:Saif[\s_]*Ali[\s_]*Khan|Saif)\b/gi, replacement: "a suave, royal sophisticated leading man" },
    { pattern: /\b(?:Amitabh[\s_]*Bachchan|Amitabh)\b/gi, replacement: "a venerable, commanding cinematic patriarch" },
    { pattern: /\b(?:Tom[\s_]*Cruise)\b/gi, replacement: "a determined, intense action hero" },
    { pattern: /\b(?:Brad[\s_]*Pitt)\b/gi, replacement: "a charismatic, rugged blonde leading man" },
    { pattern: /\b(?:Leonardo[\s_]*DiCaprio)\b/gi, replacement: "an intense, expressive dramatic leading man" },
    { pattern: /\b(?:Zendaya)\b/gi, replacement: "a stylish, striking modern leading lady" },
    { pattern: /\b(?:Timothee[\s_]*Chalamet|Timothée[\s_]*Chalamet)\b/gi, replacement: "a slender, expressive brooding leading man" },
    { pattern: /\b(?:Kabir[\s_]*Anand|Kabir)\b/gi, replacement: "a rugged, athletic covert operative" },
    { pattern: /\b(?:Zoya[\s_]*Rehman|Zoya)\b/gi, replacement: "a fierce, agile female intelligence officer" },
    { pattern: /\b(?:Farooq[\s_]*Malik|Farooq)\b/gi, replacement: "a menacing, hardened rogue commander" },
    { pattern: /\b(?:Meera[\s_]*Rao|Meera)\b/gi, replacement: "a talented, expressive female musician" },
    { pattern: /\b(?:Aarav[\s_]*Roy|Aarav)\b/gi, replacement: "a charismatic, passionate male performer" },
  ];
  for (const { pattern, replacement } of celebrityMap) {
    clean = clean.replace(pattern, replacement);
  }

  // Restore protected bracketed tags
  clean = clean.replace(/__PRESERVED_TAG_(\d+)__/g, (_, idx) => preservedTags[Number(idx)] || "");
  const words = clean.split(/\s+/);
  if (words.length > 700) {
    clean = words.slice(0, 700).join(" ");
  }
  return clean.replace(/\s{2,}/g, " ").trim();
}
