// Studio1 Option C: continuous native-audio reel generation.
//
// Instead of (script -> TTS -> per-shot Veo clips -> trim/retime -> concat),
// this generates ONE continuous video: a base clip, then Veo scene extensions
// chained from it. Veo speaks the dialogue itself, so:
//   - lip sync is generated, not approximated
//   - one voice throughout (validated: voice/identity hold across the seam)
//   - no TTS, no transcript alignment, no trim/retime/pad, no ffmpeg concat
//
// Wire format below uses REST API.
// Note the video object takes `{ uri: videoUri }`.

const API_BASE = "https://generativelanguage.googleapis.com";
const DEFAULT_MODEL = process.env.ZYVORIQ_VEO_MODEL || "veo-3.1-generate-preview";

// Extension requires 720p input. Do not raise without re-testing extension.
const RESOLUTION = "720p";
const ASPECT_RATIO = "9:16";
const BASE_DURATION_SEC = 8;
const EXTENSION_DURATION_SEC = 7;   // each hop adds ~7s
const MAX_TOTAL_SEC = 148;          // hard API ceiling
const POLL_INTERVAL_MS = 10000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

import fs from "node:fs";
import path from "node:path";

const apiKey = () => {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/) || content.match(/GOOGLE_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        process.env.GEMINI_API_KEY = match[1].trim();
        return process.env.GEMINI_API_KEY;
      }
    }
  } catch {}
  throw new Error("GEMINI_API_KEY is required");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Beats after the first must fit an extension hop. */
export function maxBeatsForDuration(totalSec = MAX_TOTAL_SEC) {
  return 1 + Math.floor((Math.min(totalSec, MAX_TOTAL_SEC) - BASE_DURATION_SEC) / EXTENSION_DURATION_SEC);
}

/**
 * The character block is repeated verbatim in every prompt. Drift in this
 * wording is the main cause of identity drift across hops.
 */
export function buildPrompt({ character, tone, line, isExtension }) {
  const continuity = isExtension
    ? "The same person continues speaking in the same voice, tone and pace, with no cut and no change of framing."
    : "";
  return [
    character,
    continuity,
    `Performance: ${tone}. Natural social-video delivery, clear articulation.`,
    `She says, speaking the following words exactly and nothing else: "${line}"`,
    "Do not render captions, subtitles, logos or any text inside the video.",
  ].filter(Boolean).join(" ");
}

async function dispatch(body, model) {
  const r = await fetch(`${API_BASE}/v1beta/models/${model}:predictLongRunning?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Veo dispatch failed (${r.status}): ${await r.text()}`);
  const { name } = await r.json();
  if (!name) throw new Error("Veo dispatch returned no operation name");
  return name;
}

async function poll(name, label) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const r = await fetch(`${API_BASE}/v1beta/${name}?key=${apiKey()}`);
    if (!r.ok) throw new Error(`Veo poll failed (${r.status})`);
    const op = await r.json();
    if (op.error) throw new Error(`${label} failed: ${JSON.stringify(op.error)}`);
    if (!op.done) continue;
    const uri =
      op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
      op.response?.generatedVideos?.[0]?.video?.uri ||
      op.response?.videos?.[0]?.uri;
    if (!uri) throw new Error(`${label}: no video uri in response: ${JSON.stringify(op.response)}`);
    return uri;
  }
  throw new Error(`${label} timed out after ${POLL_TIMEOUT_MS / 60000} minutes`);
}

async function generateBase({ prompt, model }) {
  const name = await dispatch({
    instances: [{ prompt }],
    parameters: {
      aspectRatio: ASPECT_RATIO,
      resolution: RESOLUTION,
      durationSeconds: BASE_DURATION_SEC,
    },
  }, model);
  return { name, uri: await poll(name, "base") };
}

async function extend({ prompt, videoUri, model }) {
  let attempts = 0;
  while (attempts < 4) {
    try {
      const name = await dispatch({
        instances: [{ prompt, video: { uri: videoUri } }],
        parameters: {
          aspectRatio: ASPECT_RATIO,
          resolution: RESOLUTION,
        },
      }, model);
      return { name, uri: await poll(name, "extend") };
    } catch (err) {
      if (err.message.includes("processed") && attempts < 3) {
        attempts++;
        await sleep(3500);
        continue;
      }
      throw err;
    }
  }
}

/** Download the final combined video as a Buffer. */
export async function downloadVideo(uri) {
  const sep = uri.includes("?") ? "&" : "?";
  const r = await fetch(`${uri}${sep}key=${apiKey()}`);
  if (!r.ok) throw new Error(`Veo download failed (${r.status})`);
  return Buffer.from(await r.arrayBuffer());
}

/**
 * Generate one continuous reel.
 *
 * beats: array of spoken lines, one per hop. First becomes the 8s base,
 *        each subsequent line extends by ~7s.
 * Returns { uri, buffer, hops, approxDurationSec, operationNames }.
 *
 * IMPORTANT: Veo stores videos for 2 days and each hop must reference the
 * previous result, so the chain must run to completion in one pass. A partial
 * chain cannot be resumed after the storage window lapses.
 */
export async function generateContinuousReel({ beats, character, tone, model = DEFAULT_MODEL, checkpoint, onProgress, onHop }) {
  if (!Array.isArray(beats) || beats.length === 0) throw new Error("beats required");
  if (!character) throw new Error("character description required");
  const limit = maxBeatsForDuration();
  if (beats.length > limit) throw new Error(`${beats.length} beats exceeds the ${limit}-beat ceiling (${MAX_TOTAL_SEC}s)`);

  const operationNames = [];
  const startIndex = checkpoint?.completedBeats ? checkpoint.completedBeats : 0;
  let uri = checkpoint?.uri || null;

  for (let i = startIndex; i < beats.length; i++) {
    const line = beats[i];
    const isExtension = i > 0;
    const prompt = buildPrompt({ character, tone: tone || "Confident & conversational", line, isExtension });
    onProgress?.({ index: i, total: beats.length, phase: isExtension ? "extend" : "base" });

    const res = isExtension
      ? await extend({ prompt, videoUri: uri, model })
      : await generateBase({ prompt, model });

    operationNames.push(res.name);
    uri = res.uri; // each extension returns the FULL combined video
    await onHop?.({ completedBeats: i + 1, uri, index: i });
  }

  return {
    uri,
    buffer: await downloadVideo(uri),
    hops: beats.length,
    resumedFrom: startIndex,
    approxDurationSec: BASE_DURATION_SEC + (beats.length - 1) * EXTENSION_DURATION_SEC,
    operationNames,
  };
}

// ---- CLI: node scripts/studio1_native.mjs beats.json out.mp4 ----
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , beatsPath, outPath = "reel.mp4"] = process.argv;
  if (!beatsPath) {
    console.error(`usage: GEMINI_API_KEY=... node scripts/studio1_native.mjs beats.json [out.mp4]

beats.json:
{
  "character": "A woman in her early 30s with dark curly hair tied back, wearing a plain navy t-shirt, against a plain light grey seamless studio backdrop, soft even frontal lighting, medium shot, speaking directly to camera.",
  "tone": "Confident & conversational",
  "beats": ["First spoken line.", "Second spoken line.", "Third spoken line."]
}`);
    process.exit(1);
  }
  const fs = await import("node:fs/promises");
  const cfg = JSON.parse(await fs.readFile(beatsPath, "utf8"));
  const result = await generateContinuousReel({
    ...cfg,
    onProgress: ({ index, total, phase }) => console.log(`[${index + 1}/${total}] ${phase}...`),
  });
  await fs.writeFile(outPath, result.buffer);
  console.log(`saved ${outPath} (${result.hops} hops, ~${result.approxDurationSec}s)`);
}
