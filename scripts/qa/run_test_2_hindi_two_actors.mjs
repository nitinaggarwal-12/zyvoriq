import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function wavFromPcm(pcm) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24);
  h.writeUInt32LE(48000, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function synthesizeHindiDialogue(outputDir) {
  console.log("▶ [TEST-2] Step 1: Synthesizing Hindi dialogue with Gemini 3.1 TTS...");
  const script = "नमस्ते कबीर, तुम यहाँ कैसे? - नमस्ते कियारा, मैं तुम्हारा ही इंतज़ार कर रहा था।";
  const prompt = [
    "Synthesize natural Hindi conversational dialogue for the transcript below. Do not speak instructions.",
    "Performance direction: warm natural Hindi conversational tone, expressive intonation.",
    "TRANSCRIPT START",
    script,
    "TRANSCRIPT END"
  ].join("\n");

  const res = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-3.1-flash-tts-preview",
      input: prompt,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: "Aoede" }] }
    })
  });
  const data = await res.json();
  function findAudio(node) {
    if (!node || typeof node !== "object") return null;
    if (node.type === "audio" && typeof node.data === "string") return node.data;
    for (const k of ["audio", "data", "bytesBase64Encoded"]) {
      if (typeof node[k] === "string" && node[k].length > 100) return node[k];
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) {
        for (const it of v) { const f = findAudio(it); if (f) return f; }
      } else if (v && typeof v === "object") {
        const f = findAudio(v); if (f) return f;
      }
    }
    return null;
  }
  const b64 = findAudio(data);
  if (!b64) throw new Error(`No TTS audio generated: ${JSON.stringify(data).slice(0, 400)}`);
  const pcm = Buffer.from(b64, "base64");
  const wav = wavFromPcm(pcm);
  const audioPath = path.join(outputDir, "00_hindi_dialogue.wav");
  await fs.writeFile(audioPath, wav);
  console.log(`✓ Hindi dialogue audio saved: ${audioPath} (${wav.length} bytes)`);
  return { path: audioPath, wav, script };
}

async function transcribeWithVocabularyBiasing(wav, script, outputDir) {
  console.log("▶ [TEST-2] Step 2: Transcribing Hindi dialogue with vocabulary biasing...");
  const upInit = await fetch(`${API_BASE}/upload/v1beta/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey(),
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(wav.length),
      "X-Goog-Upload-Header-Content-Type": "audio/wav",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ file: { display_name: "test2-hindi.wav" } })
  });
  const upUrl = upInit.headers.get("x-goog-upload-url");
  const upRes = await fetch(upUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(wav.length),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": "audio/wav"
    },
    body: new Uint8Array(wav)
  });
  const upData = await upRes.json();
  const uri = upData.file?.uri || upData.uri;

  const vocabList = ["Namaste", "Kiara", "Kabir", "नमस्ते", "कियारा", "कबीर"];
  const trRes = await fetch(`${API_BASE}/v1beta/interactions`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-3.5-transcribe",
      input: [
        { type: "text", text: `Pronunciation and vocabulary biasing: ${vocabList.join(", ")}` },
        { type: "audio", uri, mime_type: "audio/wav" }
      ],
      generation_config: {
        transcription_config: { mode: { type: "verbatim", timestamp_granularities: ["word"] } }
      }
    })
  });
  const trData = await trRes.json();
  function offsetToSec(o) {
    if (o === null || o === undefined) return null;
    if (typeof o === "number") return o;
    if (typeof o === "string") {
      if (o.endsWith("s")) return Number(o.slice(0, -1));
      return Number(o);
    }
    return null;
  }
  const timings = [];
  const visit = (n) => {
    if (!n || typeof n !== "object") return;
    const s = offsetToSec(n.start_offset ?? n.startOffset);
    let e = offsetToSec(n.end_offset ?? n.endOffset);
    const w = n.word ?? n.text;
    if (typeof w === "string" && w.trim() && s !== null) {
      timings.push({ word: w.trim(), startSec: s, endSec: e ?? s + 0.2 });
    }
    for (const c of Object.values(n)) {
      if (Array.isArray(c)) c.forEach(visit);
      else if (c && typeof c === "object") visit(c);
    }
  };
  visit(trData);
  console.log(`✓ Hindi transcription completed: ${timings.length} word timestamps.`);
  const transcriptPath = path.join(outputDir, "01_transcription_timings.json");
  await fs.writeFile(transcriptPath, JSON.stringify(timings, null, 2));
  return timings;
}

async function generateTwoActorShot(outputDir) {
  console.log("▶ [TEST-2] Step 3: Generating two-character Hindi scene with Google Veo 3.1...");
  const prompt =
    "A cinematic medium two-shot of a handsome Indian man in a navy shirt and an elegant Indian woman in a peach top, sitting facing each other at a charming outdoor cafe table in Colaba Mumbai. The woman speaks expressively with natural mouth movement, and the man listens attentively and smiles as he responds, warm evening golden-hour light, shallow depth of field, photorealistic 9:16 vertical composition.";

  const res = await fetch(`${API_BASE}/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        aspectRatio: "9:16",
        durationSeconds: 8,
        negativePrompt: "split screen, cartoon, watermark, distorted faces, closed eyes"
      }
    })
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Veo dispatch failed: ${JSON.stringify(data.error || data)}`);
  const opName = data.name;
  console.log(`✓ Dispatched two-character Veo shot: ${opName}`);

  const maxPolls = 60;
  let videoUri = null;
  for (let p = 1; p <= maxPolls; p++) {
    await sleep(5000);
    const pollRes = await fetch(`${API_BASE}/v1beta/${opName}?key=${apiKey()}`);
    const pollData = await pollRes.json();
    if (pollData.done) {
      videoUri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      console.log(`✓ Veo video diffusion completed in ~${p * 5}s!`);
      break;
    }
    if (p % 4 === 0) console.log(`  ... generating two-actor video (${p * 5}s elapsed)`);
  }
  if (!videoUri) throw new Error("Veo two-actor video generation timed out");

  const sep = videoUri.includes("?") ? "&" : "?";
  const vFetch = await fetch(`${videoUri}${sep}key=${apiKey()}`);
  const vBuf = Buffer.from(await vFetch.arrayBuffer());
  const rawVideoPath = path.join(outputDir, "02_two_actors_raw.mp4");
  await fs.writeFile(rawVideoPath, vBuf);
  console.log(`✓ Downloaded raw Veo video: ${rawVideoPath} (${vBuf.length} bytes)`);
  return rawVideoPath;
}

async function compositeAndAnalyze(videoPath, audioPath, timings, outputDir) {
  console.log("▶ [TEST-2] Step 4: Compositing Hindi audio onto video and analyzing lip sync...");
  const finalVideoPath = path.join(outputDir, "03_two_actors_hindi_master.mp4");
  const contactSheetPath = path.join(outputDir, "04_lip_sync_contact_sheet.png");

  // Mux audio with video
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", videoPath,
    "-i", audioPath,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    finalVideoPath
  ]);

  // Extract a 4-frame contact sheet showing temporal speech progression at 1.0s, 2.5s, 4.0s, 5.5s
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", finalVideoPath,
    "-vf", "select='eq(n\\,24)+eq(n\\,60)+eq(n\\,96)+eq(n\\,132)',scale=540:960,tile=2x2",
    "-frames:v", "1",
    contactSheetPath
  ]);

  console.log(`✓ Master Hindi Two-Actor Video: ${finalVideoPath}`);
  console.log(`✓ Lip-Sync Contact Sheet: ${contactSheetPath}`);
  return { finalVideoPath, contactSheetPath };
}

async function main() {
  const outputDir = path.resolve(process.cwd(), "scratch/test_2_hindi_two_actors");
  await fs.mkdir(outputDir, { recursive: true });

  console.log("================================================================================");
  console.log("TEST-2: ISOLATE HINDI & TWO ACTORS (Dialogue, Lip Sync, Dual-Face Stability)");
  console.log("================================================================================");

  const tts = await synthesizeHindiDialogue(outputDir);
  const timings = await transcribeWithVocabularyBiasing(tts.wav, tts.script, outputDir);
  const rawVideo = await generateTwoActorShot(outputDir);
  const master = await compositeAndAnalyze(rawVideo, tts.path, timings, outputDir);

  console.log("================================================================================");
  console.log("🎉 TEST-2 COMPLETED SUCCESSFULLY!");
  console.log(`Final Master: file://${master.finalVideoPath}`);
  console.log(`Contact Sheet: file://${master.contactSheetPath}`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("TEST-2 ERROR:", err);
  process.exit(1);
});
