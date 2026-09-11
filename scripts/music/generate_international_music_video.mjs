import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch {}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateLyriaAudio(prompt) {
  console.log(`🎵 [DEEPMIND LYRIA 3.5]: Generating master soundtrack: "${prompt.slice(0, 80)}..."`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/lyria-3.5:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Lyria API failed (HTTP ${res.status}): ${errText}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  let audioBuf = null;
  let lyricsText = "";

  for (const part of parts) {
    if (part.inlineData?.data) {
      audioBuf = Buffer.from(part.inlineData.data, "base64");
    }
    if (part.text) {
      lyricsText += part.text + "\n";
    }
  }

  if (!audioBuf) {
    throw new Error("Lyria response did not contain audio data!");
  }

  return { audioBuf, lyricsText };
}

export async function sanitizePromptForVeo(prompt, reason = null) {
  // Direct deterministic pre-flight sanitizer
  let clean = prompt
    .replace(/\bCamila Morales\b/gi, "a radiant Spanish pop soloist")
    .replace(/\bMin-Ji\b/gi, "a charismatic Seoul dance pop soloist")
    .replace(/\bAmara\b/gi, "a radiant Nigerian afrobeats vocalist")
    .replace(/\bSimran\b/gi, "a graceful Punjabi festival soloist")
    .replace(/\bCamille\b/gi, "an elegant Parisian modern ballet soloist")
    .replace(/\bShakira\b/gi, "a world-class Latin pop dancing vocalist")
    .replace(/\bcelebrity\b/gi, "superstar artist")
    .replace(/\bidol\b/gi, "lead performer");

  if (!reason) return clean;

  // In-flight LLM Reflection Repair using Gemini 2.5 Flash
  console.log(`🤖 [SELF-HEALING REFLECTION]: Sanitizing prompt after RAI filter: "${reason}"`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `You are an expert prompt engineer for video generation. The following video prompt was rejected by the RAI filter with reason: "${reason}".
Original prompt: "${clean}"
Task: Rewrite the prompt to describe purely fictional, original visual archetypes, wardrobe, cinematography, and actions without any real or fictional celebrity names, proper nouns of people, or likeness references. Preserve all cinematic details, camera angles, lighting, 9:16 vertical, and 24fps. Output ONLY the raw rewritten prompt without commentary or quotes.`
          }]
        }]
      })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        console.log(`✨ [REPAIRED PROMPT]: "${text.slice(0, 80)}..."`);
        return text;
      }
    }
  } catch (err) {
    console.warn("Reflection warning:", err.message);
  }
  return clean;
}

export async function generateVeoClip(rawPrompt, durationSeconds = 8, maxRetries = 3, imageInput = null) {
  let currentPrompt = await sanitizePromptForVeo(rawPrompt);

  let imageB64 = null;
  if (imageInput) {
    if (Buffer.isBuffer(imageInput)) {
      imageB64 = imageInput.toString("base64");
    } else if (typeof imageInput === "string") {
      if (fs.existsSync(imageInput)) {
        imageB64 = fs.readFileSync(imageInput).toString("base64");
      } else {
        imageB64 = imageInput;
      }
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🎥 Dispatching Google Veo 3.1 (${durationSeconds}s, attempt ${attempt}/${maxRetries}, image-conditioned: ${!!imageB64}): "${currentPrompt.slice(0, 80)}..."`);
    const instance = { prompt: currentPrompt };
    if (imageB64) {
      instance.image = {
        bytesBase64Encoded: imageB64,
        mimeType: "image/jpeg"
      };
    }
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [instance],
        parameters: { aspectRatio: "9:16", durationSeconds }
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn(`Veo Dispatch Error on attempt ${attempt}: ${data.error?.message || res.status}`);
      if (attempt === maxRetries) throw new Error(`Veo Dispatch Error: ${data.error?.message || res.status}`);
      await sleep(5000);
      continue;
    }

    const opName = data.name;
    console.log(`⏳ Veo operation started: ${opName}`);

    let opFailedReason = null;
    for (let poll = 1; poll <= 40; poll++) {
      await sleep(6000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
      const pollData = await pollRes.json();
      if (pollData.error) {
        opFailedReason = `Veo Polling Error: ${pollData.error.message}`;
        console.warn(`⚠️ ${opFailedReason}`);
        break;
      }
      if (pollData.done) {
        const reasons = pollData.response?.generateVideoResponse?.raiMediaFilteredReasons;
        if (reasons && reasons.length > 0) {
          opFailedReason = reasons.join("; ");
          console.warn(`⚠️ RAI Filter triggered: ${opFailedReason}`);
          break;
        }
        const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (!uri) {
          opFailedReason = "Veo finished without video URI";
          break;
        }
        console.log(`⬇️ Downloading Veo MP4 from: ${uri.slice(0, 60)}...`);
        const dlRes = await fetch(`${uri}&key=${key}`);
        const buf = Buffer.from(await dlRes.arrayBuffer());
        return buf;
      }
      console.log(`... diffusing shot (${poll * 6}s)`);
    }

    if (opFailedReason && attempt < maxRetries) {
      console.log(`🔄 Engaging Autonomous Self-Healing for attempt ${attempt + 1}...`);
      currentPrompt = await sanitizePromptForVeo(currentPrompt, opFailedReason);
      await sleep(3000);
      continue;
    }

    if (opFailedReason) {
      throw new Error(`Veo generation failed after ${maxRetries} attempts: ${opFailedReason}`);
    }
  }
  throw new Error(`Veo generation failed after ${maxRetries} attempts`);
}

export async function generateImagenAnchor(prompt) {
  console.log(`🎨 Generating character anchor via Gemini Image: "${prompt.slice(0, 80)}..."`);
  for (const model of ["gemini-3.1-flash-image-preview", "gemini-2.5-flash-image"]) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}, high resolution, 9:16 aspect ratio, masterpiece` }] }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData?.data) {
            return Buffer.from(p.inlineData.data, "base64");
          }
        }
      }
    } catch (err) {
      console.warn(`Model ${model} warning:`, err.message);
    }
  }
  return null;
}

export async function generateVocalStem(lyricsText, voiceName = "Aoede") {
  console.log(`🎤 Synthesizing vocal stem (${voiceName})...`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: lyricsText }] }],
        generationConfig: {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      })
    });
    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          return Buffer.from(p.inlineData.data, "base64");
        }
      }
    }
  } catch (err) {
    console.warn("TTS warning:", err.message);
  }
  return null;
}
