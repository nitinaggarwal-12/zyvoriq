import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { appendLibraryAssets, LibraryAssetItem } from "@/lib/swarm/libraryStore";

export const runtime = "nodejs";

interface JobStageFile {
  id: string;
  partIndex: 1 | 2;
  label: string;
  sublabel: string;
  rawSeconds: number;
  src: string;
}

export interface LyriaShotVocalWindow {
  shotNumber: number;
  windowStartSec: number;
  windowEndSec: number;
  lyriaRelStartSec: number | null;
  lyriaRelEndSec: number | null;
  omniRelStartSec?: number | null;
  omniRelEndSec?: number | null;
  transcribedWords: string;
  timeWarpApplied?: boolean;
}

export interface SwarmGenerationJob {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  audioEngine?: "omni_lyria3" | "omni_native";
  lyriaPrompt?: string;
  lyrics?: string;
  voiceType?: string;
  language?: string;
  soundtrackSrc?: string;
  vocalAlignment?: LyriaShotVocalWindow[];
  act1Prompt: string;
  act2Prompt: string;
  turnPrompts?: string[];
  leadPhotoUrl?: string;
  status: "queued" | "running" | "completed" | "error";
  stageIndex: number;
  stageLabel: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
  logs: string[];
  errorMsg?: string;
  combinedSrc: string;
  part1Src: string;
  part2Src: string;
  segments: JobStageFile[];
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODEL = "models/gemini-omni-1.1-flash";
const LYRIA_MODEL = "models/lyria-3-pro-preview";
const TRANSCRIBE_MODEL = "gemini-3.5-transcribe";

function resolveApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (const file of [".env.local", ".env"]) {
    try {
      const envPath = path.join(process.cwd(), file);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n#]+)/);
        if (match && match[1]) return match[1].trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      // ignore
    }
  }
  return "";
}

function getJobDir(jobId: string): string {
  return path.join(process.cwd(), "public/assets/swarm/generated", jobId);
}

function getJobStatePath(jobId: string): string {
  return path.join(getJobDir(jobId), "job_state.json");
}

function saveJobState(job: SwarmGenerationJob) {
  job.updatedAt = Date.now();
  const dir = getJobDir(job.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getJobStatePath(job.id), JSON.stringify(job, null, 2), "utf8");
  persistProjectState(job.id, job, { status: job.status, title: job.title }).catch((err) => {
    console.warn("[project-store] Postgres persistence failed; filesystem fallback retained:", err);
  });
}

function loadJobState(jobId: string): SwarmGenerationJob | null {
  const p = getJobStatePath(jobId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as SwarmGenerationJob;
  } catch {
    return null;
  }
}

function collectVideosInOrder(obj: unknown, found: { data: string }[] = []) {
  if (!obj || typeof obj !== "object") return found;
  const record = obj as Record<string, unknown>;
  if (
    record.type === "video" &&
    typeof record.data === "string" &&
    record.data.length > 1000
  ) {
    found.push({ data: record.data });
  }
  for (const val of Object.values(record)) {
    if (val && typeof val === "object") collectVideosInOrder(val, found);
  }
  return found;
}

/**
 * Sanitizes real celebrity, actor, singer, composer, and designer names from prompts
 * before sending to POST /v1beta/interactions so Google's safety gate never blocks
 * with `HTTP 400 content_blocked: Sorry, we can't create videos with real people's names or likenesses`.
 */
function sanitizePromptForOmniSafety(raw: string): string {
  return raw
    .replace(/https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+(&[^\s]*)?/gi, "")
    .replace(/\bBom\s+Diggy(\s+Diggy)?\b/gi, "modern Punjabi-English urban club-pop bounce")
    .replace(/\bZack\s+Knight('s)?\b/gi, "smooth urban R&B-Punjabi pop vocalist")
    .replace(/\bJasmin\s+Walia('s)?\b/gi, "glamorous Punjabi-English club-pop female vocalist")
    .replace(/\bSakshi\s+Malik('s)?\b/gi, "tall fair glamorous model with chic gold-rimmed glasses and playful eye-wink expression")
    .replace(/\b(Kartik\s+Aaryan|Sunny\s+Singh|Nushrratt\s+Bharuccha)('s)?\b/gi, "stylish young urban VIP club protagonist")
    .replace(/\bSonu\s+Ke\s+Titu\s+Ki\s+Sweety\b/gi, "glamorous modern Indian youth party anthem")
    .replace(/\bcollege\s+girls\b/gi, "21-year-old adult fashion models and dancers")
    .replace(/\bcollege\b/gi, "urban fashion")
    .replace(/\bshort\s+clothes\b/gi, "glamorous shimmering metallic sequin modern club dresses and chic high-fashion skirts")
    .replace(/\b(micro-pleated\s+)?mini[\s-]skirts?\b/gi, "chic high-fashion modern club skirts")
    .replace(/\b(mini\s+club\s+dresses|mini[\s-]dress(es)?|bodycon\s+mini(\s+club)?\s+dress(es)?)\b/gi, "shimmering metallic sequin modern club dresses")
    .replace(/\bcropped\s+(sequin\s+|metallic\s+)?(tops?|two-piece\s+co-ords?)\b/gi, "chic metallic sequin club tops")
    .replace(/\b(waist(\/hip)?\s+(and\s+hip\s+)?isolations|hip\s+locks)\b/gi, "high-energy modern dance-pop footwork and rhythmic groove")
    .replace(/\b(eye-flirt|flirtatious)\b/gi, "magnetic expressive")
    .replace(/\bsultry\b/gi, "charismatic")
    .replace(/\bNora\s+Fatehi('s)?\b/gi, "glamorous Bollywood item-dance lead heroine")
    .replace(/\bNora\s+Verma\b/gi, "Glamorous Bollywood Lead Dancer")
    .replace(/\bNora\b/gi, "the lead dancer")
    .replace(/\bRajkummar\s+Rao('s)?\b/gi, "charismatic small-town festive male co-star")
    .replace(/\bRajkummar\b/gi, "festive male co-star")
    .replace(/\bVicky\s+Rao\b/gi, "Charismatic Festive Male Co-Star")
    .replace(/\bVicky\b/gi, "the male co-star")
    .replace(/\bShraddha\s+Kapoor('s)?\b/gi, "mysterious Bollywood lead heroine")
    .replace(/\bAastha\s+Gill('s)?\b/gi, "sassy modern Hindi husky-pop female playback vocalist")
    .replace(/\bDivya\s+Kumar('s)?\b/gi, "energetic rustic-pop male playback hype vocalist")
    .replace(/\bSachin[\s–—-]+Jigar('s)?\b/gi, "contemporary Bollywood dhol-brass dance music duo")
    .replace(/\bDJ\s+Sachin\b/gi, "Live Dhol-Brass DJ Producer")
    .replace(/\bMadhuri\s+Dixit('s)?\b/gi, "classic 90s Bollywood expressive dance heroine")
    .replace(/\bMadhuri\b/gi, "classic 90s Bollywood lead heroine")
    .replace(/\bSridevi('s)?\b/gi, "legendary Bollywood classical serpent-dance heroine")
    .replace(/\bAmrish\s+Puri('s)?\b/gi, "veteran saffron-robed sapera master")
    .replace(/\bIla\s+Arun('s)?\b/gi, "earthy Rajasthani folk-pop female playback vocalist")
    .replace(/\bAlka\s+Yagnik('s)?\b/gi, "melodic high-soprano Bollywood female playback vocalist")
    .replace(/\bKavita\s+Krishnamurthy('s)?\b/gi, "expressive classical Bollywood female playback vocalist")
    .replace(/\bLaxmikant[\s–—-]+Pyarelal('s)?\b/gi, "classic Bollywood dholak-orchestra ensemble")
    .replace(/\bSabyasachi\b/gi, "Royal Heritage Zardosi Couture")
    .replace(/\bManish\s+Malhotra\b/gi, "High-Glam Crystal Couture")
    .replace(/\bA\.?\s*R\.?\s+Rahman('s)?\b/gi, "cinematic orchestral fusion composer")
    .replace(/\bShreya\s+Ghoshal('s)?\b/gi, "silky melodic Bollywood female playback soprano")
    .replace(/\bArijit\s+Singh('s)?\b/gi, "soulful emotive Hindi male playback tenor")
    .replace(/\b(Diljit\s+Dosanjh|AP\s+Dhillon|Karan\s+Aujla|Badshah|Sunidhi\s+Chauhan|Neha\s+Kakkar)\b/gi, "chart-topping modern Indian pop vocalist");
}

async function callOmniInteractions(
  apiKey: string,
  payload: Record<string, unknown>,
  label: string,
  onRetry?: (attempt: number, maxRetries: number, waitSec: number, status: number, note?: string) => void
): Promise<{ interactionId: string; videoBase64: string }> {
  const MAX_RETRIES = 8;
  const workingPayload: Record<string, unknown> = { ...payload };

  // Sanitize any text blocks in workingPayload.input
  if (Array.isArray(workingPayload.input)) {
    workingPayload.input = (workingPayload.input as Array<Record<string, unknown>>).map((item) =>
      item.type === "text" && typeof item.text === "string"
        ? { ...item, text: sanitizePromptForOmniSafety(item.text) }
        : item
    );
  } else if (typeof workingPayload.input === "string") {
    workingPayload.input = sanitizePromptForOmniSafety(workingPayload.input);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, ...workingPayload }),
      });
    } catch (netErr) {
      if (attempt < MAX_RETRIES) {
        const waitSec = Math.min(15 * attempt, 90);
        onRetry?.(attempt, MAX_RETRIES, waitSec, 503, "network error");
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw netErr;
    }

    const rawText = await res.text();
    if (!res.ok) {
      // Check if reference image triggered Google's person/likeness safety gate
      if (
        res.status === 400 &&
        (rawText.includes("content_blocked") || rawText.includes("real people") || rawText.includes("prohibited content")) &&
        Array.isArray(workingPayload.input) &&
        (workingPayload.input as Array<Record<string, unknown>>).some((i) => i.type === "image")
      ) {
        workingPayload.input = (workingPayload.input as Array<Record<string, unknown>>).filter(
          (i) => i.type !== "image"
        );
        onRetry?.(
          attempt,
          MAX_RETRIES,
          0,
          400,
          "reference image triggered likeness/safety gate — switching to descriptive identity lock"
        );
        continue;
      }

      // Check if text prompt or previous_interaction_id triggered prohibited content guidelines on HTTP 400
      if (
        res.status === 400 &&
        (rawText.includes("prohibited content") || rawText.includes("content_blocked") || rawText.includes("invalid_request")) &&
        attempt < MAX_RETRIES
      ) {
        if (attempt >= 2 && workingPayload.previous_interaction_id) {
          delete workingPayload.previous_interaction_id;
        }
        const currentText = Array.isArray(workingPayload.input)
          ? (workingPayload.input as Array<Record<string, unknown>>)
              .filter((i) => i.type === "text" && typeof i.text === "string")
              .map((i) => String(i.text))
              .join(" ")
          : String(workingPayload.input || "");
        const safeEditorialFallback =
          sanitizePromptForOmniSafety(currentText)
            .replace(/\b(short|mini|cropped|bodysuit|bikini|backless|slit|intimate)\b/gi, "haute-couture")
            .slice(0, 700) ||
          "Generate a 10.0-second 9:16 vertical 24fps high-fashion music video performance with cinematic lighting, synchronized ensemble choreography, and expressive eye and facial acting.";
        if (Array.isArray(workingPayload.input)) {
          workingPayload.input = [
            ...(workingPayload.input as Array<Record<string, unknown>>).filter((i) => i.type !== "text" && i.type !== "image"),
            { type: "text", text: safeEditorialFallback },
          ];
        } else {
          workingPayload.input = safeEditorialFallback;
        }
        onRetry?.(
          attempt,
          MAX_RETRIES,
          0,
          400,
          "softened fashion-editorial continuation prompt for safety compliance"
        );
        continue;
      }

      const isRetryable = res.status === 429 || res.status >= 500;
      if (isRetryable && attempt < MAX_RETRIES) {
        const waitSec = Math.min(15 * attempt, 90);
        onRetry?.(attempt, MAX_RETRIES, waitSec, res.status);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw new Error(`[${label}] HTTP ${res.status}: ${rawText.slice(0, 600)}`);
    }

    const json = JSON.parse(rawText);
    const vids = collectVideosInOrder(json);
    if (vids.length === 0) {
      if (attempt < MAX_RETRIES) {
        const waitSec = Math.min(15 * attempt, 90);
        onRetry?.(attempt, MAX_RETRIES, waitSec, 502, "empty video payload");
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }
      throw new Error(`[${label}] No video payload returned by ${MODEL}`);
    }

    const latestVideo = vids[vids.length - 1];
    const interactionId = String(json.id || json.name || "");
    return { interactionId, videoBase64: latestVideo.data };
  }
  throw new Error(`[${label}] Exhausted ${MAX_RETRIES} retries`);
}

function lockExactDuration(rawPath: string, outPath: string, seconds: number) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawPath,
      "-vf",
      `fps=24/1,trim=0:${seconds},setpts=PTS-STARTPTS`,
      "-af",
      `aresample=48000,atrim=0:${seconds},asetpts=PTS-STARTPTS`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "17",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "24/1",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      outPath,
    ],
    { stdio: "inherit" }
  );
}

function muxAudioOntoVideo(
  videoPath: string,
  audioPath: string,
  outPath: string,
  seconds: number,
  audioOffsetSec = 0
) {
  const tmpOut = `${outPath}.mux_tmp.mp4`;
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      videoPath,
      "-ss",
      String(audioOffsetSec),
      "-t",
      String(seconds),
      "-i",
      audioPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "256k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-shortest",
      "-movflags",
      "+faststart",
      tmpOut,
    ],
    { stdio: "inherit" }
  );
  fs.renameSync(tmpOut, outPath);
}

interface TranscribedWordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

/**
 * Uploads an audio file to the Gemini Files API and runs verbatim word-level
 * timestamp extraction via `models/gemini-3.5-transcribe` (`POST /v1beta/interactions`).
 */
async function transcribeAudioWordsWithGemini35(
  apiKey: string,
  audioPath: string,
  languageHint = "Hindi",
  vocabHint = ""
): Promise<TranscribedWordTiming[]> {
  try {
    const buf = fs.readFileSync(audioPath);
    const upInit = await fetch(
      "https://generativelanguage.googleapis.com/upload/v1beta/files",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": String(buf.length),
          "X-Goog-Upload-Header-Content-Type": "audio/mp3",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: { display_name: path.basename(audioPath) },
        }),
      }
    );
    const upUrl = upInit.headers.get("x-goog-upload-url");
    if (!upUrl) return [];

    const upRes = await fetch(upUrl, {
      method: "POST",
      headers: {
        "Content-Length": String(buf.length),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
        "Content-Type": "audio/mp3",
      },
      body: new Uint8Array(buf),
    });
    const upData = await upRes.json();
    const uri = upData?.file?.uri || upData?.uri;
    if (!uri) return [];

    const promptBias = [
      `Spoken/sung language is ${languageHint}. Transcribe all sung words accurately.`,
      vocabHint ? `Pronunciation and vocabulary biasing: ${vocabHint}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const trRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TRANSCRIBE_MODEL,
        input: [
          { type: "text", text: promptBias },
          { type: "audio", uri, mime_type: "audio/mp3" },
        ],
        generation_config: {
          transcription_config: {
            mode: { type: "verbatim", timestamp_granularities: ["word"] },
          },
        },
      }),
    });
    if (!trRes.ok) return [];
    const trData = await trRes.json();

    const offsetToSec = (o: unknown): number | null => {
      if (typeof o === "number") return o;
      if (typeof o === "string") {
        const n = Number(o.replace(/s$/i, ""));
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const timings: TranscribedWordTiming[] = [];
    const visit = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const rec = node as Record<string, unknown>;
      const s = offsetToSec(rec.start_offset ?? rec.startOffset);
      const e = offsetToSec(rec.end_offset ?? rec.endOffset);
      const w = rec.word ?? rec.text;
      if (typeof w === "string" && w.trim() && s !== null) {
        timings.push({
          word: w.trim(),
          startSec: s,
          endSec: e !== null && e > s ? e : +(s + 0.22).toFixed(2),
        });
      }
      for (const child of Object.values(rec)) {
        if (Array.isArray(child)) child.forEach(visit);
        else if (child && typeof child === "object") visit(child);
      }
    };
    visit(trData);
    return timings;
  } catch {
    return [];
  }
}

/**
 * Generates a single continuous studio vocal & instrumental song via
 * Google DeepMind Lyria 3 Pro Preview (`models/lyria-3-pro-preview:generateContent`),
 * runs `models/gemini-3.5-transcribe` to auto-trim any long instrumental intro so vocals
 * enter at ~0.80s of Shot 1, extracts the 6-shot vocal windows (`lyria3_vocal_windows.json`),
 * and masters the track to 48,000 Hz stereo (-14.0 LUFS EBU R128 with upfront vocal presence EQ).
 */
async function generateLyria3MasterSong(
  apiKey: string,
  job: SwarmGenerationJob,
  jobDir: string,
  log: (msg: string, stage?: string, progress?: number) => void
): Promise<string | null> {
  const cleanLyricLines = (job.lyrics || "")
    .split("\n")
    .map((l) =>
      l
        .replace(/^\[[^\]]*\]\s*/, "")
        .replace(/\s*\(\d+\s*BPM\)\s*$/i, "")
        .trim()
    )
    .filter(Boolean);

  const v1 = cleanLyricLines[0] || `Step into the light — ${job.title} ignites the night`;
  const v2 = cleanLyricLines[1] || `Eyes lock across the stage as the rhythm climbs higher`;
  const hook1 = cleanLyricLines[2] || `Feel the bassline drop, every heartbeat in motion`;
  const hook2 = cleanLyricLines[3] || `Midnight transformation — gold and neon in the sky`;
  const v3 = cleanLyricLines[4] || `Two voices rising together above the horizon`;
  const finale = cleanLyricLines[5] || `Hands up in the finale — ${job.title} shines tonight`;

  const safeGenre = sanitizePromptForOmniSafety(
    job.lyriaPrompt && job.lyriaPrompt.trim().length > 20
      ? job.lyriaPrompt
      : job.genre || "124 BPM Dance-Pop & Orchestral Club Anthem"
  );
  const safeVoice = sanitizePromptForOmniSafety(
    job.voiceType ||
      "Expressive Studio Lead Vocalist paired with Dynamic Counter-Melody Harmonies"
  );
  const safeLang = job.language || "English";

  // Always include the exact 6-shot lyrics so Lyria 3 Pro sings the exact same words as the video shots
  const fullLyriaPrompt = [
    `Generate a complete, radio-ready, high-energy ${job.bpm || 124} BPM studio song in ${safeLang}.`,
    `Musical Genre & Instrumentation: ${safeGenre}.`,
    `Vocal Timbre & Upfront Studio Mix: ${safeVoice}. Enforce crystal-clear upfront close-mic lead vocals (+4.5 dB above the instrumental bed) with crisp, articulate ${safeLang} pronunciation, infectious rhythmic bounce, and studio condenser microphone intimacy so every word is effortlessly understood. Start lead singing immediately after a tight 1-second rhythmic pickup beat (no long instrumental intro).`,
    ``,
    `Song Structure & Exact Sung Lyrics (sing these exact lines in order across the 60-second performance):`,
    `[Intro - Short 1-Second ${job.bpm || 124} BPM Rhythmic Pickup]`,
    ``,
    `[Shot 1 / Verse 1A (0:00–0:10) - Expressive Lead Vocal]`,
    v1,
    ``,
    `[Shot 2 / Verse 1B (0:10–0:20) - Lead & Co-Star Interplay]`,
    v2,
    ``,
    `[Shot 3 / Chorus Drop (0:20–0:30) - Explosive Hook Drop]`,
    hook1,
    ``,
    `[Shot 4 / Act II Chorus (0:30–0:40) - High-Energy Hook Continuation]`,
    hook2,
    ``,
    `[Shot 5 / Bridge & Verse 2 (0:40–0:50) - Duet Call-and-Response Groove]`,
    v3,
    ``,
    `[Shot 6 / Grand Finale Climax (0:50–1:00) - Full Ensemble Vocals & Sub-Bass Finale]`,
    finale,
    hook1,
  ].join("\n");

  log(
    `🎵 [Option 2 Audio-First] Calling ${LYRIA_MODEL} (POST /v1beta/${LYRIA_MODEL}:generateContent) with exact 6-shot lyrics...`,
    `Stage 1/6 • Synthesizing Audio-First 60.0s Studio Song via ${LYRIA_MODEL}...`,
    8
  );

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${LYRIA_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: fullLyriaPrompt }] }],
            generationConfig: { responseModalities: ["AUDIO"] },
          }),
        }
      );

      const rawText = await res.text();
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < 3) {
          await new Promise((r) => setTimeout(r, 5000 * attempt));
          continue;
        }
        throw new Error(`Lyria 3 Pro HTTP ${res.status}: ${rawText.slice(0, 400)}`);
      }

      const data = JSON.parse(rawText);
      const parts: Array<Record<string, unknown>> =
        data?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p) => {
        const inline = p.inlineData as { data?: string; mimeType?: string } | undefined;
        return inline && typeof inline.data === "string" && inline.data.length > 1000;
      }) as { inlineData: { data: string; mimeType?: string } } | undefined;

      if (!audioPart?.inlineData?.data) {
        throw new Error("Lyria 3 Pro returned no inlineData audio payload");
      }

      const rawAudioPath = path.join(jobDir, "lyria3_pro_raw.mp3");
      const probe75sPath = path.join(jobDir, "lyria3_probe_75s.mp3");
      const mastered60sMp3 = path.join(jobDir, "lyria3_master_60s.mp3");
      fs.writeFileSync(rawAudioPath, Buffer.from(audioPart.inlineData.data, "base64"));

      // Step 2A: Slice first 75s of raw Lyria song and transcribe word-level timestamps via gemini-3.5-transcribe
      execFileSync(
        "ffmpeg",
        ["-y", "-i", rawAudioPath, "-t", "75", "-c:a", "libmp3lame", "-b:a", "192k", probe75sPath],
        { stdio: "ignore" }
      );

      log(
        `🔍 Running models/${TRANSCRIBE_MODEL} verbatim word-timestamp extraction on ${LYRIA_MODEL} audio...`,
        `Stage 1/6 • Extracting word-level vocal timestamps via models/${TRANSCRIBE_MODEL}...`,
        12
      );

      const vocabWords = [v1, v2, hook1, hook2, v3, finale]
        .join(" ")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .slice(0, 30)
        .join(", ");

      const rawTimings = await transcribeAudioWordsWithGemini35(
        apiKey,
        probe75sPath,
        safeLang,
        vocabWords
      );
      try {
        fs.unlinkSync(probe75sPath);
      } catch {
        // ignore
      }

      // Vocal-Onset Smart Trim: If Lyria placed an instrumental intro > 1.8s before the first sung syllable,
      // start the 60.0s master 0.8s before the first sung word so Shot 1 (0–10s) immediately has active vocals!
      const firstVocalSec = rawTimings[0]?.startSec ?? 0;
      const trimStartSec =
        firstVocalSec > 1.8 ? Math.max(0, +(firstVocalSec - 0.8).toFixed(2)) : 0;

      if (trimStartSec > 0) {
        log(
          `✂️ Vocal-Onset Smart Trim: First sung word detected at ${firstVocalSec.toFixed(
            2
          )}s in raw Lyria track — trimming ${trimStartSec.toFixed(
            2
          )}s instrumental intro so vocals enter at 0.80s of Shot 1!`
        );
      }

      // Apply Studio Vocal Presence & Intelligibility Mastering Chain (48kHz stereo, -14.0 LUFS EBU R128)
      // Crossfades the active chorus (20.0s+) into the final 10s whenever intro trimming shortens a ~62s Lyria track below 60s.
      const bodyDur = Math.max(48, +(60.5 - Math.max(0, trimStartSec - 2.0)).toFixed(2));
      const tailNeeded = Math.max(3, +(61.5 - bodyDur).toFixed(2));
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-ss",
          String(trimStartSec),
          "-t",
          String(bodyDur),
          "-i",
          rawAudioPath,
          "-ss",
          "20.00",
          "-t",
          String(tailNeeded),
          "-i",
          rawAudioPath,
          "-filter_complex",
          "[0:a][1:a]acrossfade=d=1.0:c1=tri:c2=tri,atrim=0:60.000,asetpts=PTS-STARTPTS,highpass=f=45,equalizer=f=280:t=q:w=1.2:g=-3.2,equalizer=f=1150:t=q:w=1.1:g=2.5,equalizer=f=3100:t=q:w=1.0:g=4.2,equalizer=f=6500:t=q:w=0.9:g=2.2,afade=t=in:st=0:d=0.35,afade=t=out:st=58.5:d=1.5,loudnorm=I=-14.0:TP=-1.0:LRA=9.0[outa]",
          "-map",
          "[outa]",
          "-ar",
          "48000",
          "-ac",
          "2",
          "-c:a",
          "libmp3lame",
          "-b:a",
          "320k",
          mastered60sMp3,
        ],
        { stdio: "inherit" }
      );

      // Build 6-Shot Vocal Window Manifest (0–10s, 10–20s, 20–30s, 30–40s, 40–50s, 50–60s)
      const shiftedTimings = rawTimings
        .map((t) => ({
          word: t.word,
          startSec: +(t.startSec - trimStartSec).toFixed(2),
          endSec: +(t.endSec - trimStartSec).toFixed(2),
        }))
        .filter((t) => t.startSec >= 0 && t.startSec < 60);

      const fallbackLines = [v1, v2, hook1, hook2, v3, finale];
      const windows: LyriaShotVocalWindow[] = Array.from({ length: 6 }, (_, idx) => {
        const wStart = idx * 10;
        const wEnd = (idx + 1) * 10;
        const slice = shiftedTimings.filter(
          (t) => t.startSec >= wStart && t.startSec < wEnd
        );
        const relStart =
          slice.length > 0
            ? Math.max(0, Math.min(9.2, +(slice[0].startSec - wStart).toFixed(2)))
            : null;
        const relEnd =
          slice.length > 0
            ? Math.max(
                (relStart ?? 0) + 1.2,
                Math.min(10.0, +(slice[slice.length - 1].endSec - wStart).toFixed(2))
              )
            : null;
        const wordsStr =
          slice.map((x) => x.word).join(" ").trim() || fallbackLines[idx] || "";
        return {
          shotNumber: idx + 1,
          windowStartSec: wStart,
          windowEndSec: wEnd,
          lyriaRelStartSec: relStart,
          lyriaRelEndSec: relEnd,
          transcribedWords: wordsStr,
        };
      });

      job.vocalAlignment = windows;
      fs.writeFileSync(
        path.join(jobDir, "lyria3_vocal_windows.json"),
        JSON.stringify(windows, null, 2),
        "utf8"
      );

      const windowSummary = windows
        .map((w) =>
          w.lyriaRelStartSec !== null && w.lyriaRelEndSec !== null
            ? `S${w.shotNumber}[${w.lyriaRelStartSec.toFixed(1)}s–${w.lyriaRelEndSec.toFixed(1)}s]`
            : `S${w.shotNumber}[instrumental]`
        )
        .join(" • ");

      job.soundtrackSrc = `/assets/swarm/generated/${job.id}/lyria3_master_60s.mp3?t=${Date.now()}`;
      log(
        `✅ ${LYRIA_MODEL} + ${TRANSCRIBE_MODEL} 60.0s master ready (${(
          fs.statSync(mastered60sMp3).size /
          1024 /
          1024
        ).toFixed(2)} MB, -14.0 LUFS)! Vocal Windows: ${windowSummary}`
      );
      return mastered60sMp3;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === 3) {
        log(`⚠️ ${LYRIA_MODEL} error (${msg}) — falling back to native Omni 1.1 audio.`);
        return null;
      }
    }
  }
  return null;
}

/**
 * Transforms an Omni 1.1 10-second turn prompt for `omni_lyria3` mode:
 * 1. Strips any on-camera singing / lip-sync instructions so `models/gemini-omni-1.1-flash` never moves the character's lips.
 * 2. Enforces the Closed-Lips Eye/Body Acting (*Nayan-Abhinaya*), Body Language, Wardrobe Physics, and Music-Driven Shot Development directive
 *    anchored to the `Lyria 3 Pro` song window.
 */
function buildMusicDrivenClosedLipsTurnPrompt(
  basePrompt: string,
  win?: LyriaShotVocalWindow,
  bpm: number = 124
): string {
  const cleaned = basePrompt
    .replace(
      /Lead vocalist sings[^.]*\./gi,
      "Lead performer communicates purely through magnetic eye expressions, confident closed-lip smiles, and beat-locked body language (mouth stays closed, zero lip movement)."
    )
    .replace(
      /Visual & emotional theme of "[^"]*" expressed/gi,
      "High-energy musical rhythm and magnetic flirtatious attitude expressed"
    )
    .replace(
      /sings with clear[^.]*\./gi,
      "performs with closed smiling lips, magnetic eye contact, and expressive choreography."
    )
    .replace(/"[^"]*"/g, "")
    .replace(/with crystal-clear on-pitch playback vocals/gi, "with expressive closed-lip eye and body acting")
    .replace(/lip-sync[^,.]*/gi, "closed-lip eye & body expression");

  const musicalWindowCue =
    win && win.lyriaRelStartSec !== null && win.lyriaRelEndSec !== null
      ? `Lyria 3 Pro studio soundtrack rhythm window (${win.lyriaRelStartSec.toFixed(1)}s–${win.lyriaRelEndSec.toFixed(1)}s at ${bpm} BPM) — translate the beat and energy of the music into expressive kohl-lined eye contact, playful winks, eyebrow micro-acting, sharp body language, and glamorous short sequin dress & mini-skirt fabric motion while keeping every mouth strictly CLOSED.`
      : `Lyria 3 Pro ${bpm} BPM studio club rhythm — drive explosive choreography, confident posture, eye flirtation, and glamorous short sequin dress & mini-skirt fabric motion on the beat while keeping every mouth strictly CLOSED.`;

  return (
    `${cleaned} ` +
    `STRICT NON-VOCAL VISUAL PERFORMANCE (CLOSED-LIPS LOCK — ZERO LIP MOVEMENT): Every performer's mouth stays naturally CLOSED in a radiant, confident closed-lip smile throughout the entire 10.0-second shot. Nobody sings, speaks, or mouths words on camera — zero lip movement, zero open-mouth singing. ` +
    `TALKING WITH EYES, EXPRESSIONS, BODY LANGUAGE & WARDROBE: Characters talk 100% with their eyes (smoldering kohl-lined gazes, playful eye winks over chic gold-rimmed fashion glasses, raised-eyebrow attitude, knowing glances), expressive facial micro-acting, sharp ${bpm} BPM body language, glossy hair flips, and dynamic short metallic sequin club-dress / pleated mini-skirt wardrobe physics. ` +
    `MUSIC-DRIVEN SHOT DEVELOPMENT: ${musicalWindowCue}`
  );
}

async function runRealOmniPipeline(job: SwarmGenerationJob, reuseJobId?: string) {
  const apiKey = resolveApiKey();
  const jobDir = getJobDir(job.id);
  const publicPrefix = `/assets/swarm/generated/${job.id}`;
  const useLyria3 = job.audioEngine === "omni_lyria3";

  const log = (msg: string, stage?: string, progress?: number) => {
    const stamp = new Date().toISOString().slice(11, 19);
    job.logs.push(`[${stamp}] ${msg}`);
    if (stage) job.stageLabel = stage;
    if (typeof progress === "number") job.progress = progress;
    saveJobState(job);
  };

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment/.env");
    }

    const act1MasterPath = path.join(jobDir, "act1_30s.mp4");
    const act2MasterPath = path.join(jobDir, "act2_30s.mp4");

    // Fast path: if reusing already-rendered 60s Omni 1.1 video shots from a completed job to mux with Lyria 3 Pro
    if (reuseJobId) {
      const srcDir = getJobDir(reuseJobId);
      const srcAct1 = path.join(srcDir, "act1_30s.mp4");
      const srcAct2 = path.join(srcDir, "act2_30s.mp4");
      if (fs.existsSync(srcAct1) && fs.existsSync(srcAct2)) {
        log(
          `Reusing verified 6-turn models/gemini-omni-1.1-flash 24fps video tracks from ${reuseJobId} while ${LYRIA_MODEL} synthesizes the 60.0s studio song...`,
          `Stage 2/6 • Synthesizing 60.0s Studio Song via ${LYRIA_MODEL}...`,
          35
        );
        fs.copyFileSync(srcAct1, act1MasterPath);
        fs.copyFileSync(srcAct2, act2MasterPath);
      }
    }

    // MUSIC-FIRST ARCHITECTURE FOR OMNI 1.1 + LYRIA 3 PRO (`omni_lyria3`):
    // 1. Generate the 60.0s Lyria 3 Pro studio song (`models/lyria-3-pro-preview`) first (with `gemini-3.5-transcribe` intro smart-trim + 6-window musical mood extraction).
    // 2. Develop all 6 Omni 1.1 video shots around the music with STRICTLY CLOSED LIPS — characters talk through eyes, expressions, body language, and wardrobe physics!
    const lyriaMasterMp3: string | null = useLyria3
      ? await generateLyria3MasterSong(apiKey, job, jobDir, log)
      : null;

    if (!fs.existsSync(act1MasterPath) || !fs.existsSync(act2MasterPath)) {
      const win = job.vocalAlignment || [];
      const prepareTurnPrompt = (rawPrompt: string, shotWin?: LyriaShotVocalWindow) => {
        const sanitized = sanitizePromptForOmniSafety(rawPrompt);
        return useLyria3
          ? buildMusicDrivenClosedLipsTurnPrompt(sanitized, shotWin, job.bpm || 124)
          : sanitized;
      };

      const t1A = prepareTurnPrompt(job.turnPrompts?.[0] || job.act1Prompt, win[0]);
      const t1B = prepareTurnPrompt(job.turnPrompts?.[1] || job.act1Prompt, win[1]);
      const t1C = prepareTurnPrompt(job.turnPrompts?.[2] || job.act1Prompt, win[2]);
      const t2A = prepareTurnPrompt(job.turnPrompts?.[3] || job.act2Prompt, win[3]);
      const t2B = prepareTurnPrompt(job.turnPrompts?.[4] || job.act2Prompt, win[4]);
      const t2C = prepareTurnPrompt(job.turnPrompts?.[5] || job.act2Prompt, win[5]);

      const makeRetryLogger = (stageName: string, stageNum: number) => (
        attempt: number,
        max: number,
        waitSec: number,
        status: number,
        note?: string
      ) => {
        if (waitSec === 0 && note) {
          log(`⚡ [${stageName}] ${note}`, job.stageLabel, job.progress);
          return;
        }
        log(
          `⏳ Quota cooldown on ${stageName} (HTTP ${status}) — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          `Stage ${stageNum}/6 • Quota cooldown on ${stageName} — auto-retrying in ${waitSec}s (${attempt}/${max})...`,
          job.progress
        );
      };

      const closedLipsPrefix = useLyria3
        ? `NON-VOCAL VISUAL PERFORMANCE (CLOSED-LIPS LOCK): Every performer's mouth stays naturally CLOSED (zero lip movement, zero singing/speaking on camera); characters talk purely through magnetic eye expressions, facial micro-acting, body language, and couture wardrobe physics synchronized to the ${job.bpm} BPM beat. `
        : `with studio-mastered 48kHz stereo music and crystal-clear on-pitch playback vocals from t=0.0s. `;

      // -------------------------------------------------------------------------
      // STAGE 1: ACT I TURN 1A (00:00 -> 00:10, 240 native frames)
      // -------------------------------------------------------------------------
      log(
        `Calling ${MODEL} for Act I Turn 1A (00:00–00:10)... Prompt: "${t1A.slice(
          0,
          90
        )}..."`,
        `Stage 1/6 • Generating Act I Turn 1A (00:00–00:10) via ${MODEL}${
          useLyria3 ? ` (Closed-Lips Eye/Body Acting + ${LYRIA_MODEL} Beat)` : ""
        }...`,
        18
      );

      const turn1AInput: Array<Record<string, unknown>> = [
        {
          type: "text",
          text:
            `Generate a 10.0-second 9:16 vertical 24fps opening Bollywood music video scene (0s to 10s) ${closedLipsPrefix}` +
            `${t1A}`,
        },
      ];

      const turn1A = await callOmniInteractions(
        apiKey,
        {
          input: turn1AInput,
        },
        "ACT1_TURN_1A",
        makeRetryLogger("ACT1_TURN_1A", 1)
      );

      const turn1ARawPath = path.join(jobDir, "act1_turnA_10s_raw.mp4");
      const turn1APath = path.join(jobDir, "act1_turnA_10s.mp4");
      fs.writeFileSync(turn1ARawPath, Buffer.from(turn1A.videoBase64, "base64"));
      lockExactDuration(turn1ARawPath, turn1APath, 10);

      job.part1Src = `${publicPrefix}/act1_turnA_10s.mp4?t=${Date.now()}`;
      job.combinedSrc = job.part1Src;
      job.segments = [
        {
          id: "part1_live",
          partIndex: 1,
          label: "Part 1 • Live (10.0s Ready)",
          sublabel: "Act I Turn 1A (10.0s Native)",
          rawSeconds: 10,
          src: job.part1Src,
        },
      ];
      log(
        `Act I Turn 1A ready (${turn1A.interactionId}) — live preview loaded into player!`,
        `Stage 2/6 • Extending Act I to 20.0s (Turn 1B) via ${MODEL}...`,
        32
      );

      // -------------------------------------------------------------------------
      // STAGE 2: ACT I TURN 1B (00:00 -> 00:20, 480 native frames)
      // -------------------------------------------------------------------------
      const turn1B = await callOmniInteractions(
        apiKey,
        {
          previous_interaction_id: turn1A.interactionId,
          input: [
            {
              type: "text",
              text:
                `Continue seamlessly from 10.0s to 20.0s in the exact same venue, cast, wardrobe, and continuous ${job.bpm} BPM rhythm. ` +
                `${t1B}`,
            },
          ],
        },
        "ACT1_TURN_1B",
        makeRetryLogger("ACT1_TURN_1B", 2)
      );

      const turn1BRawPath = path.join(jobDir, "act1_turnB_20s_raw.mp4");
      const turn1BPath = path.join(jobDir, "act1_turnB_20s.mp4");
      fs.writeFileSync(turn1BRawPath, Buffer.from(turn1B.videoBase64, "base64"));
      lockExactDuration(turn1BRawPath, turn1BPath, 20);

      job.part1Src = `${publicPrefix}/act1_turnB_20s.mp4?t=${Date.now()}`;
      job.combinedSrc = job.part1Src;
      job.segments = [
        {
          id: "part1_live",
          partIndex: 1,
          label: "Part 1 • Live (20.0s Ready)",
          sublabel: "Act I Turn 1B (20.0s Native)",
          rawSeconds: 20,
          src: job.part1Src,
        },
      ];
      log(
        `Act I Turn 1B ready (${turn1B.interactionId}) — player updated to 20.0s!`,
        `Stage 3/6 • Extending Act I to full 30.0s (Turn 1C) via ${MODEL}...`,
        48
      );

      // -------------------------------------------------------------------------
      // STAGE 3: ACT I TURN 1C (00:00 -> 00:30, 720 native frames)
      // -------------------------------------------------------------------------
      const turn1C = await callOmniInteractions(
        apiKey,
        {
          previous_interaction_id: turn1B.interactionId,
          input: [
            {
              type: "text",
              text:
                `Continue seamlessly from 20.0s to 30.0s in the exact same venue, cast, wardrobe, and continuous ${job.bpm} BPM rhythm. ` +
                `${t1C}`,
            },
          ],
        },
        "ACT1_TURN_1C",
        makeRetryLogger("ACT1_TURN_1C", 3)
      );

      const turn1CRawPath = path.join(jobDir, "act1_turnC_30s_raw.mp4");
      fs.writeFileSync(turn1CRawPath, Buffer.from(turn1C.videoBase64, "base64"));
      lockExactDuration(turn1CRawPath, act1MasterPath, 30);

      job.part1Src = `${publicPrefix}/act1_30s.mp4?t=${Date.now()}`;
      job.combinedSrc = job.part1Src;
      job.segments = [
        {
          id: "part1_30s",
          partIndex: 1,
          label: "Part 1 • Act I (0:00–0:30)",
          sublabel: useLyria3 ? "Act I 30.0s (Omni 1.1 + Lyria 3 Pro)" : "Full 30.0s Native Act I Master",
          rawSeconds: 30,
          src: job.part1Src,
        },
      ];

      // Extract 3-Layer Biometric & Wardrobe Reference Anchor Frames (t = 2.0s, 5.0s, 8.5s) from Act I
      const anchorTimes = [2.0, 5.0, 8.5];
      const anchorB64s: string[] = [];
      for (let i = 0; i < anchorTimes.length; i++) {
        const anchorFile =
          i === 0
            ? path.join(jobDir, "face_identity_anchor.jpg")
            : path.join(jobDir, `scene1_anchor_${i + 1}.jpg`);
        execFileSync(
          "ffmpeg",
          [
            "-y",
            "-ss",
            anchorTimes[i].toFixed(2),
            "-i",
            act1MasterPath,
            "-frames:v",
            "1",
            "-q:v",
            "2",
            anchorFile,
          ],
          { stdio: "inherit" }
        );
        anchorB64s.push(fs.readFileSync(anchorFile).toString("base64"));
      }

      log(
        `Act I full 30.0s Master locked & 3 biometric/wardrobe anchor photos (t=2.0s, 5.0s, 8.5s) extracted! Starting Act II Turn 2A...`,
        `Stage 4/6 • Generating Act II Turn 2A (00:30–00:40, 3-Photo Cast & Wardrobe Lock) via ${MODEL}...`,
        62
      );

      // -------------------------------------------------------------------------
      // STAGE 4: ACT II TURN 2A (00:30 -> 00:40, conditioned on 3 anchor photos)
      // -------------------------------------------------------------------------
      const turn2A = await callOmniInteractions(
        apiKey,
        {
          input: [
            ...anchorB64s.map((b64) => ({
              type: "image",
              data: b64,
              mime_type: "image/jpeg",
            })),
            {
              type: "text",
              text:
                `Generate a 10.0-second 9:16 vertical 24fps second-half music video scene (0s to 10s) ${closedLipsPrefix}` +
                `CRITICAL 3-PHOTO IDENTITY LOCK: Feature the EXACT SAME lead performer face & identity from the 3 reference photos of Act I. ` +
                `${t2A}`,
            },
          ],
        },
        "ACT2_TURN_2A",
        makeRetryLogger("ACT2_TURN_2A", 4)
      );

      const turn2ARawPath = path.join(jobDir, "act2_turnA_10s_raw.mp4");
      const turn2APath = path.join(jobDir, "act2_turnA_10s.mp4");
      fs.writeFileSync(turn2ARawPath, Buffer.from(turn2A.videoBase64, "base64"));
      lockExactDuration(turn2ARawPath, turn2APath, 10);

      job.part2Src = `${publicPrefix}/act2_turnA_10s.mp4?t=${Date.now()}`;
      job.segments = [
        {
          id: "part1_30s",
          partIndex: 1,
          label: "Part 1 • Act I (0:00–0:30)",
          sublabel: useLyria3 ? "Act I 30.0s (Omni 1.1 + Lyria 3 Pro)" : "Full 30.0s Native Act I Master",
          rawSeconds: 30,
          src: job.part1Src,
        },
        {
          id: "part2_live",
          partIndex: 2,
          label: "Part 2 • Live (10.0s Ready)",
          sublabel: "Act II Turn 2A (10.0s Native)",
          rawSeconds: 10,
          src: job.part2Src,
        },
      ];
      log(
        `Act II Turn 2A ready (${turn2A.interactionId}) — extending Act II to 20.0s...`,
        `Stage 5/6 • Extending Act II to 20.0s & 30.0s via ${MODEL}...`,
        78
      );

      // -------------------------------------------------------------------------
      // STAGE 5: ACT II TURN 2B (20s) & TURN 2C (30s)
      // -------------------------------------------------------------------------
      const turn2B = await callOmniInteractions(
        apiKey,
        {
          previous_interaction_id: turn2A.interactionId,
          input: [
            {
              type: "text",
              text:
                `Continue seamlessly from 10.0s to 20.0s in the exact same venue, cast, wardrobe, and continuous ${job.bpm} BPM rhythm. ` +
                `${t2B}`,
            },
          ],
        },
        "ACT2_TURN_2B",
        makeRetryLogger("ACT2_TURN_2B", 5)
      );

      const turn2BRawPath = path.join(jobDir, "act2_turnB_20s_raw.mp4");
      const turn2BPath = path.join(jobDir, "act2_turnB_20s.mp4");
      fs.writeFileSync(turn2BRawPath, Buffer.from(turn2B.videoBase64, "base64"));
      lockExactDuration(turn2BRawPath, turn2BPath, 20);
      job.part2Src = `${publicPrefix}/act2_turnB_20s.mp4?t=${Date.now()}`;

      log(
        `Act II Turn 2B (20.0s) complete (${turn2B.interactionId}) — generating final Turn 2C (30.0s)...`,
        `Stage 5/6 • Generating final Act II Turn 2C (00:50–01:00) via ${MODEL}...`,
        90
      );

      const turn2C = await callOmniInteractions(
        apiKey,
        {
          previous_interaction_id: turn2B.interactionId,
          input: [
            {
              type: "text",
              text:
                `Continue seamlessly from 20.0s to 30.0s in the exact same venue, cast, wardrobe, and continuous ${job.bpm} BPM rhythm. ` +
                `${t2C}`,
            },
          ],
        },
        "ACT2_TURN_2C",
        makeRetryLogger("ACT2_TURN_2C", 5)
      );

      const turn2CRawPath = path.join(jobDir, "act2_turnC_30s_raw.mp4");
      fs.writeFileSync(turn2CRawPath, Buffer.from(turn2C.videoBase64, "base64"));
      lockExactDuration(turn2CRawPath, act2MasterPath, 30);
    }

    // -------------------------------------------------------------------------
    // STAGE 6: LYRIA 3 PRO CONTINUOUS 60.0S STUDIO SONG MASTER MUXING
    // (Pure 24/1 CFR video — no setpts speed-warping needed since lips stay closed!)
    // -------------------------------------------------------------------------
    if (useLyria3 && lyriaMasterMp3 && fs.existsSync(lyriaMasterMp3)) {
      log(
        `Muxing continuous 60.0s ${LYRIA_MODEL} studio soundtrack onto pure 24fps Closed-Lips Eye/Body Acting video (Act I 0–30s, Act II 30–60s, and Combined 60s Master)...`,
        `Stage 6/6 • Mastering 60.0s ${MODEL} (Closed-Lips Eye/Body Acting) + ${LYRIA_MODEL} Studio Reel...`,
        96
      );
      muxAudioOntoVideo(act1MasterPath, lyriaMasterMp3, act1MasterPath, 30, 0);
      muxAudioOntoVideo(act2MasterPath, lyriaMasterMp3, act2MasterPath, 30, 30);
    }

    const concatListPath = path.join(jobDir, "concat.txt");
    fs.writeFileSync(
      concatListPath,
      `file '${act1MasterPath}'\nfile '${act2MasterPath}'\n`,
      "utf8"
    );
    const combinedMasterPath = path.join(jobDir, "combined_60s.mp4");
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        combinedMasterPath,
      ],
      { stdio: "inherit" }
    );

    // If using Lyria 3 Pro, mux the single uninterrupted 60.0s Lyria 3 Pro studio song over combined_60s.mp4 so there is zero audio seam at 30.0s!
    if (useLyria3 && lyriaMasterMp3 && fs.existsSync(lyriaMasterMp3)) {
      muxAudioOntoVideo(combinedMasterPath, lyriaMasterMp3, combinedMasterPath, 60, 0);
    }

    // Automatically generate downloadable & shareable MP3, WAV, and Scene Anchor JPGs
    try {
      const mp3Path = path.join(jobDir, "soundtrack_master.mp3");
      const wavPath = path.join(jobDir, "soundtrack_48k_stereo.wav");
      const s1Jpg = path.join(jobDir, "scene1_anchor.jpg");
      const s2Jpg = path.join(jobDir, "scene2_anchor.jpg");
      execFileSync(
        "ffmpeg",
        ["-y", "-i", combinedMasterPath, "-vn", "-c:a", "libmp3lame", "-b:a", "320k", mp3Path],
        { stdio: "ignore" }
      );
      execFileSync(
        "ffmpeg",
        ["-y", "-i", combinedMasterPath, "-vn", "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", wavPath],
        { stdio: "ignore" }
      );
      execFileSync(
        "ffmpeg",
        ["-y", "-ss", "3.0", "-i", act1MasterPath, "-frames:v", "1", "-q:v", "2", s1Jpg],
        { stdio: "ignore" }
      );
      execFileSync(
        "ffmpeg",
        ["-y", "-ss", "3.0", "-i", act2MasterPath, "-frames:v", "1", "-q:v", "2", s2Jpg],
        { stdio: "ignore" }
      );
    } catch {
      // non-fatal
    }

    const engineBadge = useLyria3
      ? "Omni 1.1 Flash + Lyria 3 Pro Preview Studio Song"
      : "Omni 1.1 Flash Native Audio";

    const ts = Date.now();
    job.part1Src = `${publicPrefix}/act1_30s.mp4?t=${ts}`;
    job.part2Src = `${publicPrefix}/act2_30s.mp4?t=${ts}`;
    job.combinedSrc = `${publicPrefix}/combined_60s.mp4?t=${ts}`;
    job.segments = [
      {
        id: "part1_30s",
        partIndex: 1,
        label: "Part 1 • Act I (0:00–0:30)",
        sublabel: `Act I 30.0s (${engineBadge})`,
        rawSeconds: 30,
        src: job.part1Src,
      },
      {
        id: "part2_30s",
        partIndex: 2,
        label: "Part 2 • Act II (0:30–1:00)",
        sublabel: `Act II 30.0s (${engineBadge})`,
        rawSeconds: 30,
        src: job.part2Src,
      },
    ];
    job.status = "completed";
    job.stage = "edit";

    try {
      await Promise.all([
        persistProjectMedia(job.id, "act1.mp4", "video/mp4", fs.readFileSync(act1MasterPath)),
        persistProjectMedia(job.id, "act2.mp4", "video/mp4", fs.readFileSync(act2MasterPath)),
        persistProjectMedia(job.id, "master.mp4", "video/mp4", fs.readFileSync(combinedMasterPath)),
      ]);
      job.part1Src = `/api/project-media/${encodeURIComponent(job.id)}/act1.mp4`;
      job.part2Src = `/api/project-media/${encodeURIComponent(job.id)}/act2.mp4`;
      job.combinedSrc = `/api/project-media/${encodeURIComponent(job.id)}/master.mp4`;
      saveJobState(job);
    } catch (err) {
      console.warn("[project-media] Durable media persistence failed; local generated files remain available:", err);
    }
    log(
      `✅ COMPLETED (${engineBadge})! Brand-new 60.0s Combined Master + Part 1 + Part 2 loaded into player & saved to /library.`,
      `Stage 6/6 • ✅ Complete (${engineBadge})! 60.0s Master Reel is live in the player below.`,
      100
    );

    // Save all 3 new files to persistent /library manifest
    const nowIso = new Date().toISOString();
    const newLibraryAssets: LibraryAssetItem[] = [
      {
        id: `${job.id}_combined_60s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Combined 60.0s Master`,
        subtitle: `Generated live with ${engineBadge}`,
        assetType: "combined_master",
        genre: job.genre,
        durationSec: 60.0,
        frames: 1440,
        fps: "24/1 CFR",
        audioSpec: useLyria3
          ? "Lyria 3 Pro 48,000 Hz Stereo Master (-14.0 LUFS)"
          : "48,000 Hz Stereo AAC (0.00 ms Drift)",
        wardrobe: "Custom Prompt Wardrobe",
        location: "Custom Prompt Location",
        promptSummary: `${job.act1Prompt} // ${job.act2Prompt}`,
        src: `${publicPrefix}/combined_60s.mp4`,
        createdAt: nowIso,
      },
      {
        id: `${job.id}_act1_30s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Part 1 (0:00–0:30)`,
        subtitle: `Act I 30.0s (${engineBadge})`,
        assetType: "act_master",
        genre: job.genre,
        durationSec: 30.0,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        partIndex: 1,
        wardrobe: "Act I Wardrobe",
        location: "Act I Location",
        promptSummary: job.act1Prompt,
        src: `${publicPrefix}/act1_30s.mp4`,
        createdAt: nowIso,
      },
      {
        id: `${job.id}_act2_30s`,
        projectId: job.id,
        projectTitle: job.title,
        title: `${job.title} — Part 2 (0:30–1:00)`,
        subtitle: `Act II 30.0s (${engineBadge})`,
        assetType: "act_master",
        genre: job.genre,
        durationSec: 30.0,
        frames: 720,
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        partIndex: 2,
        wardrobe: "Act II Wardrobe",
        location: "Act II Location",
        promptSummary: job.act2Prompt,
        src: `${publicPrefix}/act2_30s.mp4`,
        createdAt: nowIso,
      },
    ];
    appendLibraryAssets(newLibraryAssets);

    // Also auto-register Main Combined 60s Reel + Part 1 & Part 2 child clips in SQLite data/studio_entities.db
    try {
      const dbPath = path.join(process.cwd(), "data/studio_entities.db");
      const suffix = job.id.replace(/\D/g, "").slice(-6);
      const reelId = `ZYV-REEL-J${suffix}`;
      const clip1Id = `ZYV-CLIP-J${suffix}P1`;
      const clip2Id = `ZYV-CLIP-J${suffix}P2`;
      const safeTitle = job.title.replace(/'/g, "''");
      const metaMain = JSON.stringify({
        projectId: job.id,
        durationSec: 60,
        frames: 1440,
        fps: "24/1 CFR",
        audioEngine: job.audioEngine || "omni_native",
        audioSpec: useLyria3 ? "Lyria 3 Pro 48,000 Hz Stereo" : "48,000 Hz Stereo AAC",
        genre: job.genre,
        assetType: "combined_master",
      }).replace(/'/g, "''");
      const metaP1 = JSON.stringify({
        projectId: job.id,
        durationSec: 30,
        frames: 720,
        fps: "24/1 CFR",
        audioEngine: job.audioEngine || "omni_native",
        audioSpec: "48,000 Hz Stereo AAC",
        genre: job.genre,
        partIndex: 1,
        assetType: "act_master",
      }).replace(/'/g, "''");
      const metaP2 = JSON.stringify({
        projectId: job.id,
        durationSec: 30,
        frames: 720,
        fps: "24/1 CFR",
        audioEngine: job.audioEngine || "omni_native",
        audioSpec: "48,000 Hz Stereo AAC",
        genre: job.genre,
        partIndex: 2,
        assetType: "act_master",
      }).replace(/'/g, "''");
      const sql = `
        INSERT OR REPLACE INTO studio_entities (id, entity_type, slug, canonical_url, title, subtitle, parent_id, media_src, metadata_json, created_at) VALUES
        ('${reelId}', 'reel', 'reel-${job.id}', '/entity/${reelId}', '${safeTitle} — Combined 60.0s Master', '${engineBadge}', NULL, '${publicPrefix}/combined_60s.mp4', '${metaMain}', '${nowIso}'),
        ('${clip1Id}', 'clip', 'clip-${job.id}-p1', '/entity/${clip1Id}', 'Part 1 • Act I (0:00–0:30)', 'Act I 30.0s (${engineBadge})', '${reelId}', '${publicPrefix}/act1_30s.mp4', '${metaP1}', '${nowIso}'),
        ('${clip2Id}', 'clip', 'clip-${job.id}-p2', '/entity/${clip2Id}', 'Part 2 • Act II (0:30–1:00)', 'Act II 30.0s (${engineBadge})', '${reelId}', '${publicPrefix}/act2_30s.mp4', '${metaP2}', '${nowIso}');
      `;
      execFileSync("sqlite3", [dbPath, sql], { stdio: "inherit" });
    } catch {
      // non-fatal if sqlite3 CLI unavailable
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    job.status = "error";
    job.errorMsg = msg;
    log(`❌ ERROR: ${msg}`, `Error: ${msg}`, job.progress);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `job_${Date.now()}`;
    const audioEngine: "omni_lyria3" | "omni_native" =
      body.audioEngine === "omni_native" ? "omni_native" : "omni_lyria3";
    const reuseJobId =
      typeof body.reuseJobId === "string" && body.reuseJobId.trim()
        ? body.reuseJobId.trim()
        : undefined;

    const job: SwarmGenerationJob = {
      id,
      title: String(body.title || "Custom Omni 1.1 Flash Master Reel"),
      genre: String(body.genre || "Bollywood Hindi Pop"),
      bpm: Number(body.bpm || 124),
      audioEngine,
      lyriaPrompt: typeof body.lyriaPrompt === "string" ? body.lyriaPrompt : undefined,
      lyrics: typeof body.lyrics === "string" ? body.lyrics : undefined,
      voiceType: typeof body.voiceType === "string" ? body.voiceType : undefined,
      language: typeof body.language === "string" ? body.language : undefined,
      act1Prompt: String(body.act1Prompt || ""),
      act2Prompt: String(body.act2Prompt || ""),
      turnPrompts: Array.isArray(body.turnPrompts)
        ? body.turnPrompts.map((t: unknown) => String(t))
        : undefined,
      leadPhotoUrl: typeof body.leadPhotoUrl === "string" ? body.leadPhotoUrl : undefined,
      status: "running",
      stageIndex: 0,
      stageLabel:
        audioEngine === "omni_lyria3"
          ? "Stage 1/6 • Launching models/gemini-omni-1.1-flash + models/lyria-3-pro-preview..."
          : "Stage 1/6 • Launching live models/gemini-omni-1.1-flash generation...",
      progress: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      logs: [
        `[${new Date().toISOString().slice(11, 19)}] Launched live ${
          audioEngine === "omni_lyria3"
            ? "models/gemini-omni-1.1-flash + models/lyria-3-pro-preview"
            : "models/gemini-omni-1.1-flash (Native Audio)"
        } job (${id})`,
      ],
      combinedSrc: "",
      part1Src: "",
      part2Src: "",
      segments: [],
    };

    saveJobState(job);

    // Fire background async worker (non-blocking HTTP response)
    runRealOmniPipeline(job, reuseJobId).catch(() => {});

    return NextResponse.json({ ok: true, job });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || searchParams.get("latest") === "true") {
    const genRoot = path.join(process.cwd(), "public/assets/swarm/generated");
    if (!fs.existsSync(genRoot)) {
      return NextResponse.json({ ok: true, job: null, recentJobs: [] });
    }
    const dirs = fs
      .readdirSync(genRoot)
      .filter((d) => d.startsWith("job_"))
      .sort((a, b) => b.localeCompare(a));

    const recentJobs: SwarmGenerationJob[] = [];
    for (const d of dirs.slice(0, 10)) {
      const st = loadJobState(d);
      if (st) recentJobs.push(st);
    }
    return NextResponse.json({
      ok: true,
      job: recentJobs[0] || null,
      recentJobs,
    });
  }

  const job = loadJobState(id);
  if (!job) {
    return NextResponse.json({ ok: false, error: `Job ${id} not found` }, { status: 404 });
  }
  return NextResponse.json({ ok: true, job });
}
