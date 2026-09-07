import crypto from "node:crypto";
import { getAssetStoreCapability, writeAsset } from "./assetStore";
import type { WordTiming } from "./types";

const API_BASE = "https://generativelanguage.googleapis.com";
const SAMPLE_RATE = 24000;
const CHANNELS = 1;
const SAMPLE_WIDTH = 2;

function apiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Gemini narration is not configured: GEMINI_API_KEY is missing");
  return key;
}

function wavFromPcm(pcm: Buffer) {
  const header = Buffer.alloc(44);
  const byteRate = SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH;
  const blockAlign = CHANNELS * SAMPLE_WIDTH;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(SAMPLE_WIDTH * 8, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function findAudioData(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const key of ["output_audio", "outputAudio"]) {
    const candidate = obj[key] as any;
    if (candidate && typeof candidate.data === "string") return candidate.data;
  }
  if ((obj.type === "audio" || obj.mime_type === "audio/L16" || obj.mimeType === "audio/L16") && typeof obj.data === "string") {
    return obj.data;
  }
  for (const child of Object.values(obj)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findAudioData(item);
        if (found) return found;
      }
    } else if (child && typeof child === "object") {
      const found = findAudioData(child);
      if (found) return found;
    }
  }
  return null;
}

function offsetToSec(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/s$/i, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === "object") {
    const obj = value as any;
    const seconds = Number(obj.seconds || 0);
    const nanos = Number(obj.nanos || obj.nanoseconds || 0);
    if (Number.isFinite(seconds) && Number.isFinite(nanos)) return seconds + nanos / 1e9;
  }
  return null;
}

function extractWordTimings(value: unknown): WordTiming[] {
  const timings: WordTiming[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const type = String(obj.type || obj.annotationType || "");
    const start = offsetToSec(obj.start_offset ?? obj.startOffset);
    const end = offsetToSec(obj.end_offset ?? obj.endOffset);
    const word = obj.word ?? obj.text;
    if ((type === "word_info" || (start !== null && end !== null)) && typeof word === "string" && start !== null && end !== null) {
      timings.push({
        word: word.trim(),
        startSec: Number(start.toFixed(3)),
        endSec: Number(end.toFixed(3)),
        speaker: typeof obj.speaker === "string" ? obj.speaker : undefined,
      });
    }
    for (const child of Object.values(obj)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  };
  visit(value);
  return timings.filter(t => t.word && t.endSec >= t.startSec).sort((a, b) => a.startSec - b.startSec || a.endSec - b.endSec);
}

async function generatePcm(text: string, tone: string) {
  const key = apiKey();
  const model = process.env.ZYVORIQ_TTS_MODEL || "gemini-3.1-flash-tts-preview";
  const voice = process.env.ZYVORIQ_TTS_VOICE || "Kore";
  const prompt = [
    "Synthesize speech for the transcript below. Do not speak these instructions.",
    `Performance direction: ${tone}. Natural social-video delivery, clear articulation, no added words.`,
    "TRANSCRIPT START",
    text,
    "TRANSCRIPT END",
  ].join("\n");

  const response = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input: prompt,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice }] },
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`Gemini TTS failed (${response.status}): ${JSON.stringify(json).slice(0, 500)}`);
  const base64 = findAudioData(json);
  if (!base64) throw new Error("Gemini TTS returned no audio payload");
  return { pcm: Buffer.from(base64, "base64"), model, voice };
}

async function uploadForTranscription(wav: Buffer, displayName: string) {
  const key = apiKey();
  const start = await fetch(`${API_BASE}/upload/v1beta/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": key,
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(wav.length),
      "X-Goog-Upload-Header-Content-Type": "audio/wav",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayName } }),
  });
  if (!start.ok) throw new Error(`Gemini file upload initialization failed (${start.status})`);
  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("Gemini file upload did not return an upload URL");

  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(wav.length),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": "audio/wav",
    },
    body: new Uint8Array(wav),
  });
  const json = await upload.json();
  if (!upload.ok) throw new Error(`Gemini file upload failed (${upload.status}): ${JSON.stringify(json).slice(0, 400)}`);
  const uri = json?.file?.uri || json?.uri;
  if (!uri) throw new Error("Gemini file upload returned no file URI");
  return { uri: String(uri), name: String(json?.file?.name || json?.name || "") };
}

function extractBiasedVocabularyFromText(text: string, extraVocab: string[] = []): string[] {
  const vocab = new Set<string>(extraVocab.filter(Boolean));
  const matches = text.match(/\b[A-Z][a-zA-Z0-9']{2,}\b/g) || [];
  for (const m of matches) {
    if (!["The", "This", "That", "When", "What", "Where", "With", "Then", "From", "Into"].includes(m)) {
      vocab.add(m);
    }
  }
  return Array.from(vocab).filter(Boolean);
}

async function transcribeWithWordTimings(uri: string, biasedVocabulary: string[] = []) {
  const key = apiKey();
  const input: Array<{ type: "audio" | "text"; uri?: string; mime_type?: string; text?: string }> = [];
  if (biasedVocabulary.length) {
    input.push({ type: "text", text: `Pronunciation and vocabulary biasing: ${biasedVocabulary.join(", ")}` });
  }
  input.push({ type: "audio", uri, mime_type: "audio/wav" });

  const response = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-3.5-transcribe",
      input,
      generation_config: { transcription_config: { mode: { type: "verbatim", timestamp_granularities: ["word"] } } },
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`Gemini transcription failed (${response.status}): ${JSON.stringify(json).slice(0, 500)}`);
  const timings = extractWordTimings(json);
  if (!timings.length) throw new Error("Gemini transcription returned no word-level timestamps; alignment cannot be claimed");
  return timings;
}

export async function generateAlignedNarration(input: {
  productionId: string;
  text: string;
  tone: string;
  biasedVocabulary?: string[];
}) {
  if (!input.text.trim()) throw new Error("Cannot synthesize empty narration");
  const storage = getAssetStoreCapability();
  if (!storage.configured || !storage.durable) {
    throw new Error("Real narration requires durable asset storage. Configure ZYVORIQ_ASSET_ROOT or attach a Railway volume before generation.");
  }
  apiKey();

  const { pcm, model, voice } = await generatePcm(input.text, input.tone);
  if (!pcm.length) throw new Error("Gemini TTS returned an empty PCM stream");
  const durationSec = pcm.length / (SAMPLE_RATE * CHANNELS * SAMPLE_WIDTH);
  const wav = wavFromPcm(pcm);
  const uploaded = await uploadForTranscription(wav, `zyvoriq-${input.productionId}-narration.wav`);
  const vocab = extractBiasedVocabularyFromText(input.text, input.biasedVocabulary);
  const wordTimings = await transcribeWithWordTimings(uploaded.uri, vocab);
  const digest = crypto.createHash("sha256").update(wav).digest("hex").slice(0, 16);
  const asset = await writeAsset(`reels/${input.productionId}/narration-${digest}.wav`, wav);

  return {
    narrationUrl: asset.url,
    actualDurationSec: Number(durationSec.toFixed(3)),
    wordTimings,
    provider: "google-gemini",
    model,
    voice,
  };
}
