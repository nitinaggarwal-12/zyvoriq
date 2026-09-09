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
1. CELEBRITY & LIKENESS: Replace ANY real-world celebrity names (actors, singers, politicians) with descriptive archetypes (e.g. "Riya Sen" -> "a stylish, energetic South Asian female college performer").
2. AUDIO & SLANG SAFETY: Replace colloquial idioms containing literal violence, weapons, or fire (e.g. Hindi "aag laga de" -> "dhoom macha de" or "toofaan macha de", "kill it" -> "rock it") with safe, high-energy festival/pop alternatives.
3. PRESERVE INTENT: Retain 100% of the character's singing performance, musical choreography, visual setting, camera angles, and wardrobe continuity. Do NOT mute the character or convert singing to ambient foley.
4. MUSIC VIDEO QUALITY ENHANCEMENT: For MUSIC_VIDEO genre, ensure:
   - Feminine vocal archetype: Bright, high-register female pop-star melodic singing voice with expressive vibrato and autotuned sheen.
   - Traditional Punjabi instrumentation: Traditional high-pitched Punjabi Tumbi riff driving the melody, acoustic Dhol syncopations (dagga bass + tilli snap), deep 808 club sub-bass.
   - Live stage musicians: Staged live Punjabi Dhol drummers visible flanking the stage/runway behind the performers.
   - Kinetic speed ramping: Dynamic speed ramps on downbeats (slow-motion on gestures, fast snap on kicks).
5. LENGTH: Keep total prompt strictly under 220 words. Strip redundant boilerplate.

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
1. If rejection is AUDIO-RELATED:
   - Identify the flagged lyrics, dialogue line, or colloquialism.
   - Rewrite the lyrics to express the exact same confidence, swagger, and musical theme without using any flagged trigger words.
   - Keep the performer actively singing and dancing on camera! Do NOT delete the vocal performance unless explicitly told.
2. If rejection is LIKENESS/SAFETY-RELATED:
   - Convert any remaining proper nouns or celebrity likenesses into rich visual descriptive archetypes.
3. Ensure prompt length is under 220 words.
4. Output format: Return ONLY valid JSON with keys:
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
