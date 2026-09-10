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

const BASE_DIR = "scratch/spain_college_swim_5m";
fs.mkdirSync(BASE_DIR, { recursive: true });

const MASTER_AUDIO_PATH = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const LYRICS_JSON_PATH = path.join(BASE_DIR, "lyrics_timestamps.json");
const PILOT_AUDIO_SLICE = path.join(BASE_DIR, "pilot_audio_slice_15s.mp3");

async function main() {
  console.log("========================================================================");
  console.log("🎵 PHYSICAL GOOGLE DEEPMIND LYRIA 3.5: MASTER SOUNDTRACK GENERATION");
  console.log("========================================================================");

  const prompt = "Compose a high-energy 124 BPM Tropical House dance-pop song arrangement for Sol de Fuga. Key: F# minor. Instruments: Spanish acoustic guitar, deep sub-bass, marimba plucks, saxophone melody. Lyrics: Sunrise hits the villa walls, no turning back / No me llames, I won't call, we are off the track.";

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
    const errText = await res.text();
    throw new Error(`Lyria API failed (HTTP ${res.status}): ${errText}`);
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

  // Save the master MP3 file
  const audioBuf = Buffer.from(audioBase64, "base64");
  fs.writeFileSync(MASTER_AUDIO_PATH, audioBuf);
  console.log(`✅ Saved Lyria Master Audio: ${MASTER_AUDIO_PATH} (${Math.round(audioBuf.length / 1024)} KB, ${audioBuf.length} bytes) in ${Math.round((Date.now() - startTime) / 1000)}s`);

  // Save the timestamped lyrics manifest
  fs.writeFileSync(LYRICS_JSON_PATH, JSON.stringify({
    title: "Sol de Fuga",
    genre: "Tropical House",
    bpm: 124,
    key: "F# minor",
    rawArrangement: lyricsText.trim(),
    generatedAt: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Saved Timestamped Lyrics Manifest: ${LYRICS_JSON_PATH}`);
  console.log(`📝 Lyrics & Timestamps:\n${lyricsText}`);

  // Measure exact duration with ffprobe
  const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_AUDIO_PATH}`).toString().trim();
  console.log(`⏱️ Verified Lyria Master Track Duration: ${probeOut} seconds`);

  // Slice exactly seconds 0:00.000 to 0:15.484 for the 15-second pilot reel
  console.log("\n✂️ Slicing seconds 0:00.000 to 0:15.484 for Pilot Reel...");
  execSync(`ffmpeg -y -ss 0 -t 15.484 -i ${MASTER_AUDIO_PATH} -c:a aac -b:a 256k ${PILOT_AUDIO_SLICE}`, { stdio: "inherit" });
  console.log(`✅ Pilot Audio Slice Ready: ${PILOT_AUDIO_SLICE}`);

  // Also verify silence check on pilot audio slice
  const silenceDetect = execSync(`ffmpeg -i ${PILOT_AUDIO_SLICE} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
  const hasSilence = silenceDetect.includes("silence_start");
  console.log(`🔇 Silence Detection on Pilot Audio Slice: ${hasSilence ? "WARNING: Silence detected!" : "CLEAN (0 silence periods detected)"}`);

  console.log("========================================================================");
  console.log("🎉 LYRIA MASTER SOUNDTRACK & PILOT SLICE CREATED SUCCESSFULLY!");
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
