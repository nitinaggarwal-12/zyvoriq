/**
 * Prompt Verification & Autonomous Auto-Correction Engine
 * 
 * Provides:
 * 1. Pre-Flight Verification: Scans and pre-emptively heals prompts before sending to Veo.
 * 2. In-Flight Self-Repair: Intelligently rewrites rejected prompts using the exact model rejection telemetry.
 */

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || "";
}

export async function verifyPromptPreFlight(prompt, context = {}) {
  if (!prompt || typeof prompt !== "string") {
    return { verifiedPrompt: prompt, wasRewritten: false, reasons: [] };
  }

  const key = getApiKey();
  if (!key) {
    const words = prompt.split(/\s+/);
    if (words.length > 250) {
      return { verifiedPrompt: words.slice(0, 250).join(" "), wasRewritten: true, reasons: ["static-word-clamp"] };
    }
    return { verifiedPrompt: prompt, wasRewritten: false, reasons: [] };
  }

  const systemInstruction = `You are a Google Veo 3.1 Directorial Prompt Linter & Safety Compliance Specialist.
Your goal is to inspect a video generation prompt and ensure it will 100% pass Google Veo's safety, likeness, and system limits without being rejected.

Strict Rules:
1. CELEBRITY, LIKENESS & PERSONAL NAMES: Google Veo's safety filter aggressively flags ANY personal first or last names (including character names like Simran, Harleen, Ananya, Riya, Rahul, Pooja, etc.) and celebrity names (e.g. Shakira, Beyonce) as potential real people or celebrity references. You MUST replace ALL personal names and character names with generic descriptive archetypes (e.g. "Simran" -> "the lead South Asian female college performer", "Harleen" -> "the co-performer", "Simran and Harleen" -> "two energetic South Asian female college performers", "Shakira style" -> "energetic Latin-pop dance style with expressive hip isolations"). Ensure NO proper personal or celebrity names remain anywhere in the final prompt text.
2. AUDIO & SLANG SAFETY: Replace colloquial idioms containing literal violence, weapons, or fire (e.g. Hindi "aag laga de" -> "dhoom macha de" or "toofaan macha de", "kill it" -> "rock it") with safe, high-energy festival/pop alternatives.
3. PRESERVE INTENT: Retain 100% of the character's singing performance, musical choreography, visual setting, camera angles, and wardrobe continuity. Do NOT mute the character or convert singing to ambient foley.
4. MUSIC VIDEO QUALITY ENHANCEMENT: For MUSIC_VIDEO genre, ensure:
   - Vocal archetype: Bright, high-register melodic singing voice with expressive vibrato and autotuned pop sheen.
   - Dynamic rhythm & instrumentation: Rich percussion (e.g. driving Dhol beats, Latin timbales, acoustic brass stabs, or flamenco guitars matching the song arrangement) and sub-bass groove.
   - Live stage musicians & dancers: Staged live percussionists/drummers or dancers visible on stage/runway behind the performers.
   - Kinetic speed ramping: Dynamic speed ramps on downbeats (slow-motion on hair-flips and dance isolations, fast snaps on rhythm drops).
   - CRITICAL CONTINUITY PRESERVATION: Retain the exact environment continuity description (stage lighting, wet stage reflections, pyrotechnics) and character wardrobe attributes.
5. LENGTH: Keep total prompt strictly under 210 words. Strip redundant filler to ensure all continuity locks fit within Veo's limit.

Output format: Return ONLY valid JSON with keys:
{
  "verifiedPrompt": string,
  "wasRewritten": boolean,
  "reasons": string[]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `INSPECT AND VERIFY THIS VEO PROMPT:\n\n${prompt}\n\nGenre: ${context.genre || "N/A"}, Character: ${context.characterName || "N/A"}` }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[prompt-verifier] Pre-flight check warning (status: ${res.status}): ${errText.slice(0, 150)}`);
      return { verifiedPrompt: prompt, wasRewritten: false, reasons: [] };
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return { verifiedPrompt: prompt, wasRewritten: false, reasons: [] };

    const parsed = JSON.parse(rawText);
    return {
      verifiedPrompt: parsed.verifiedPrompt || prompt,
      wasRewritten: Boolean(parsed.wasRewritten),
      reasons: parsed.reasons || []
    };
  } catch (err) {
    console.warn(`[prompt-verifier] Error during pre-flight check: ${err?.message || err}`);
    return { verifiedPrompt: prompt, wasRewritten: false, reasons: [] };
  }
}

export async function repairRejectedPrompt(
  rejectedPrompt,
  rejectionReason,
  context = {}
) {
  const key = getApiKey();
  if (!key) {
    return {
      repairedPrompt: rejectedPrompt.replace(/"[^"]+"/g, "").replace(/\s{2,}/g, " ").trim(),
      fixApplied: "fallback-static-strip"
    };
  }

  const systemInstruction = `You are a Surgical AI Prompt Repair Agent for Google Veo 3.1.
A video generation prompt was REJECTED by Veo's safety or audio filters.
Your job is to diagnose the rejection reason and surgically rewrite the prompt so it complies 100%, while PRESERVING ALL CREATIVE VALUE.

Strict Guidelines:
1. If rejection mentions "third-party content", copyright, trademarks, or proprietary terms:
   - IMMEDIATELY REMOVE all verbatim spoken lyrics, quotes, and rhyming song lines.
   - Replace any lyrics with pure visual performance description: "Performer actively sings with dynamic lip-sync, visible teeth, open mouth visemes, and expressive facial delivery."
   - Replace trademarked brands: "Arri Alexa", "Panavision", "Cooke", "Sony" -> "cinema camera, anamorphic lens".
   - Replace industry terms: "Bollywood" -> "South Asian cinema", "808" -> "club sub-bass".
   - Ensure ZERO quoted text or dialogue remains in the prompt.
2. If rejection is AUDIO-RELATED:
   - Identify the flagged lyrics, dialogue line, or colloquialism.
   - Replace with generic visual singing and performance descriptions.
   - Keep the performer actively singing and dancing on camera! Do NOT delete the vocal performance unless explicitly told.
3. If rejection is LIKENESS/SAFETY-RELATED:
   - Convert any remaining proper nouns or celebrity likenesses into rich visual descriptive archetypes.
4. Ensure prompt length is under 210 words.
5. Output format: Return ONLY valid JSON with keys:
{
  "repairedPrompt": string,
  "fixApplied": string
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{
            text: `REPAIR THIS REJECTED VEO PROMPT:

REJECTED PROMPT:
${rejectedPrompt}

REJECTION TELEMETRY / REASON:
${rejectionReason}

Genre: ${context.genre || "N/A"}, Character: ${context.characterName || "N/A"}`
          }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Repair agent HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      repairedPrompt: parsed.repairedPrompt || rejectedPrompt,
      fixApplied: parsed.fixApplied || "surgical-ai-repair"
    };
  } catch (err) {
    console.warn(`[prompt-verifier] Error during prompt repair: ${err?.message || err}`);
    return {
      repairedPrompt: rejectedPrompt.replace(/"[^"]+"/g, "").replace(/\s{2,}/g, " ").trim(),
      fixApplied: "fallback-error-strip"
    };
  }
}

/**
 * Root-Level User Prompt Sanitizer & Semantic Enricher
 * 
 * Intercepts raw user prompts at Step 0 before any downstream model (Omni, Lyria, Veo)
 * is called. Eliminates celebrity likeness filters, sensitive demographic phrasing,
 * and violence/fire idioms, transforming them into rich cinematic and acoustic directives.
 */
export async function sanitizeAndEnrichUserPrompt(rawPrompt, options = {}) {
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return { sanitizedTopic: "", originalTopic: "", wasRewritten: false, reasons: [] };
  }

  let text = rawPrompt.trim();
  let wasRewritten = false;
  const reasons = [];

  // 1. Celebrity and likeness replacements
  const celebrityMap = [
    {
      pattern: /\bshakira(?:\s+style)?\b/gi,
      replacement: "Latin-Pop dance superstar renowned for rapid hip isolations, bellydance shimmies, barefoot wet-stage power catwalking, and Latin-Arabic-Desi vocal delivery",
      reason: "celebrity-likeness-shakira"
    },
    {
      pattern: /\bbeyonce(?:\s+style)?\b/gi,
      replacement: "commanding pop-diva performance with precision choreography, power vocals, and brass stabs",
      reason: "celebrity-likeness-beyonce"
    },
    {
      pattern: /\bdua lipa(?:\s+style)?\b/gi,
      replacement: "modern retro disco-pop star with sleek rhythm movements and deep vocal tones",
      reason: "celebrity-likeness-dualipa"
    },
    {
      pattern: /\btaylor swift(?:\s+style)?\b/gi,
      replacement: "acoustic pop-country storytelling singer-songwriter performance",
      reason: "celebrity-likeness-taylorswift"
    },
    {
      pattern: /\bshahrukh khan|srk\b/gi,
      replacement: "charismatic romantic cinema icon with open-arm gestures and intense emotional gaze",
      reason: "celebrity-likeness-srk"
    },
    {
      pattern: /\bbadshah\b/gi,
      replacement: "urban Desi hip-hop anthem performer with high-energy club cadence",
      reason: "celebrity-likeness-badshah"
    },
    {
      pattern: /\bdiljit(?:\s+dosanjh)?\b/gi,
      replacement: "energetic Punjabi folk-pop superstar with traditional Bhangra vocal agility",
      reason: "celebrity-likeness-diljit"
    }
  ];

  for (const entry of celebrityMap) {
    if (entry.pattern.test(text)) {
      text = text.replace(entry.pattern, entry.replacement);
      wasRewritten = true;
      reasons.push(entry.reason);
    }
  }

  // 2. Demographic and sensitive wording normalization
  const demographicMap = [
    {
      pattern: /\b(?:indian\s+)?(?:college\s+girls|school\s+girls)\b/gi,
      replacement: "young South Asian female university dance performers",
      reason: "demographic-safety-college-girls"
    },
    {
      pattern: /\bindian\s+girls\b/gi,
      replacement: "South Asian female performers",
      reason: "demographic-normalization"
    },
    {
      pattern: /\bdanging\b/gi,
      replacement: "dancing",
      reason: "typo-correction-dancing"
    }
  ];

  for (const entry of demographicMap) {
    if (entry.pattern.test(text)) {
      text = text.replace(entry.pattern, entry.replacement);
      wasRewritten = true;
      reasons.push(entry.reason);
    }
  }

  // 3. Slang and literal fire/violence idioms
  const slangMap = [
    { pattern: /\baag laga\w*\b/gi, replacement: "dhoom macha", reason: "slang-fire-de-risk" },
    { pattern: /\bkill(?:ing)?\s+it\b/gi, replacement: "rocking the stage", reason: "slang-violence-de-risk" },
    { pattern: /\bon fire\b/gi, replacement: "electrifying", reason: "slang-fire-de-risk" }
  ];

  for (const entry of slangMap) {
    if (entry.pattern.test(text)) {
      text = text.replace(entry.pattern, entry.replacement);
      wasRewritten = true;
      reasons.push(entry.reason);
    }
  }

  // 4. Clean formatting
  text = text.replace(/\s{2,}/g, " ").trim();

  return {
    sanitizedTopic: text,
    originalTopic: rawPrompt,
    wasRewritten,
    reasons
  };
}

