import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY found!");
  process.exit(1);
}

const BASE_DIR = "scratch/malibu_baywatch_5m";
const ANCHOR_DIR = path.join(BASE_DIR, "anchors");
fs.mkdirSync(ANCHOR_DIR, { recursive: true });

const MASTER_AUDIO_PATH = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const LYRICS_JSON_PATH = path.join(BASE_DIR, "lyrics_timestamps.json");
const CHLOE_ANCHOR_PATH = path.join(ANCHOR_DIR, "01_chloe_lead_anchor.png");

async function generateMasterSoundtrack() {
  console.log("========================================================================");
  console.log("🎵 [STEP 1/2] GENERATING GOOGLE DEEPMIND LYRIA 3.5 MASTER SOUNDTRACK");
  console.log("========================================================================");

  const prompt = "Compose a high-energy 126 BPM Nu-Disco / California Beach Pop summer song arrangement for Malibu Red. Key: A major. Instruments: Funk bass guitar, Nile Rodgers rhythm guitar, punchy dance drums, brass stabs, lifeguard whistle, ocean surf sound. Lyrics: Eyes on the horizon, sun burning gold / Watching every wave, we never let go / Malibu Red, saving every beat / California sun shining down on the street.";

  console.log("🚀 Invoking models/lyria-3.5 on Cloudtop...");
  const startTime = Date.now();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/lyria-3.5:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Lyria API error (HTTP ${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  let audioBase64 = null;
  let lyricsText = "";

  for (const part of parts) {
    if (part.inlineData?.data) {
      audioBase64 = part.inlineData.data;
    }
    if (part.text) {
      lyricsText += part.text + "\n";
    }
  }

  if (!audioBase64) {
    throw new Error("Lyria response did not contain audio inlineData!");
  }

  const audioBuf = Buffer.from(audioBase64, "base64");
  fs.writeFileSync(MASTER_AUDIO_PATH, audioBuf);
  console.log(`✅ Saved Lyria Master Audio: ${MASTER_AUDIO_PATH} (${Math.round(audioBuf.length / 1024)} KB, ${audioBuf.length} bytes) in ${Math.round((Date.now() - startTime) / 1000)}s`);

  fs.writeFileSync(LYRICS_JSON_PATH, JSON.stringify({
    title: "Malibu Red (Guardians of the Surf)",
    genre: "Nu-Disco / California Beach Pop",
    bpm: 126,
    key: "A major",
    rawArrangement: lyricsText.trim(),
    generatedAt: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Saved Timestamped Lyrics Manifest: ${LYRICS_JSON_PATH}`);

  // Measure exact duration
  const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_AUDIO_PATH}`).toString().trim();
  console.log(`⏱️ Verified Lyria Master Track Duration: ${probeOut} seconds`);
}

async function generateChloeAnchor() {
  console.log("\n========================================================================");
  console.log("🎨 [STEP 2/2] GENERATING CHLOE LEAD CHARACTER BIOMETRIC ANCHOR");
  console.log("========================================================================");

  const prompt = "Cinematic 35mm photograph of Chloe, a stunning 22-year-old California lifeguard, sun-kissed athletic physique, sandy-blonde beach waves, wearing an iconic scarlet-red lifeguard one-piece swimsuit with white lifeguard whistle on yellow lanyard around neck. Standing proudly by the wooden railing of Malibu yellow lifeguard tower #14 overlooking the sparkling turquoise Pacific Ocean and crashing white surf at sunset golden hour. Radiant confident smile, closed-lip ready stance, golden sun rim lighting, 24fps film still.";

  console.log("🚀 Invoking models/gemini-2.5-flash-image on Cloudtop...");
  const startTime = Date.now();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Anchor image generation failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  let imageBase64 = null;
  for (const part of parts) {
    if (part.inlineData?.data) {
      imageBase64 = part.inlineData.data;
      break;
    }
  }

  if (!imageBase64) {
    throw new Error("No image data returned for Chloe anchor");
  }

  const imgBuf = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(CHLOE_ANCHOR_PATH, imgBuf);
  console.log(`✅ Saved Chloe Lead Anchor: ${CHLOE_ANCHOR_PATH} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
}

async function main() {
  await generateMasterSoundtrack();
  await generateChloeAnchor();
  console.log("\n========================================================================");
  console.log("🎉 PHASE 1 FOUNDATIONAL ASSETS (LYRIA MASTER + CHLOE ANCHOR) READY!");
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Phase 1 failed:", err);
  process.exit(1);
});
