import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const BASE_DIR = "scratch/frozen_glacier_whispers";
const ANCHORS_DIR = path.join(BASE_DIR, "anchors");
const MASTER_AUDIO_PATH = path.join(BASE_DIR, "master_soundtrack.mp3");
const LYRICS_JSON_PATH = path.join(BASE_DIR, "lyrics_timestamps.json");

fs.mkdirSync(ANCHORS_DIR, { recursive: true });

async function generateMasterSoundtrack() {
  console.log("========================================================================");
  console.log("🎵 [STEP 1/5] GENERATING DEEPMIND LYRIA 3.5 MASTER SOUNDTRACK");
  console.log("========================================================================");

  const prompt = `Compose a full, cinematic, high-energy orchestral pop power ballad inspired by Frozen II (Into the Unknown / Show Yourself).
Tempo: 124 BPM. Key: D minor transitioning to triumphant D major.
Structure:
[0:00 - 0:06] Ethereal high-soprano siren call motif: "Ah-ah-oh-oh! Ah-ah-oh-oh!" over shimmering crystalline celesta and soft French horns.
[0:06 - 0:18] Verse 1: Driving cello ostinato and acoustic piano with passionate female belted vocal: "I hear you calling through the frozen night, a secret whispering in crystal light! Into the deep where the glaciers stand, show yourself in this frozen land!"
[0:18 - 0:30] Chorus Climax: Full 60-piece symphonic strings, thundering Taiko drums, triumphant brass fanfare, and soaring belted vocal: "Into the unknown! Into the crystal sea! Show yourself, set the spirits free! Under northern skies the glaciers rise, into the unknown we fly!"
High fidelity broadcast mastering, continuous acoustic bed, zero silence, crisp dynamic range.`;

  console.log("🚀 Invoking models/lyria-3.5...");
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
  console.log(`✅ Saved Lyria Master Audio: ${MASTER_AUDIO_PATH} (${Math.round(audioBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);

  fs.writeFileSync(LYRICS_JSON_PATH, JSON.stringify({
    title: "Glacier of Whispers (Into the Unknown / Show Yourself Tribute)",
    movieInspiration: "Frozen II",
    genre: "Epic Orchestral-Pop Power Ballad",
    bpm: 124,
    key: "D minor / D major",
    vocalMotifs: ["Ah-ah-oh-oh siren call", "Into the unknown belted chorus"],
    rawArrangement: lyricsText.trim(),
    generatedAt: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Saved Lyrics Manifest: ${LYRICS_JSON_PATH}`);

  const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_AUDIO_PATH}`).toString().trim();
  console.log(`⏱️ Verified Master Audio Duration: ${probeOut}s`);

  // Detect and trim pre-roll and tail silence automatically
  const silenceDetectOut = execSync(`ffmpeg -i ${MASTER_AUDIO_PATH} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
  let startTrim = 0;
  let endTrim = parseFloat(probeOut);

  const startMatch = silenceDetectOut.match(/silence_end: ([0-9.]+)/);
  if (startMatch && parseFloat(startMatch[1]) < 3.0) {
    startTrim = parseFloat(startMatch[1]);
    console.log(`✂️ Trimming pre-roll silence of ${startTrim.toFixed(3)}s...`);
  }

  const endMatches = [...silenceDetectOut.matchAll(/silence_start: ([0-9.]+)/g)];
  if (endMatches.length > 0) {
    const lastSilenceStart = parseFloat(endMatches[endMatches.length - 1][1]);
    if (lastSilenceStart > endTrim - 5.0) {
      endTrim = lastSilenceStart;
      console.log(`✂️ Trimming tail silence from ${endTrim.toFixed(3)}s...`);
    }
  }

  if (startTrim > 0 || endTrim < parseFloat(probeOut)) {
    const trimmedPath = path.join(BASE_DIR, "master_soundtrack_clean.mp3");
    execSync(`ffmpeg -y -ss ${startTrim} -to ${endTrim} -i ${MASTER_AUDIO_PATH} -c:a libmp3lame -b:a 256k ${trimmedPath}`);
    fs.copyFileSync(trimmedPath, MASTER_AUDIO_PATH);
    fs.unlinkSync(trimmedPath);
    const newDur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_AUDIO_PATH}`).toString().trim();
    console.log(`⏱️ Trimmed Master Audio Duration: ${newDur}s`);
  }

  // Verify Zero Silence
  const silenceCheck = execSync(`ffmpeg -i ${MASTER_AUDIO_PATH} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
  if (silenceCheck.includes("silence_start")) {
    throw new Error("❌ Digital silence still detected in master audio!");
  }
  console.log("✅ Zero Silence verified on master soundtrack (100% continuous music bed).");
}

async function generateCharacterAnchors() {
  console.log("\n========================================================================");
  console.log("🎨 [STEP 2/5] GENERATING BIOMETRIC CHARACTER REFERENCE ANCHORS");
  console.log("========================================================================");

  // Character 1: Freya (The Ice Queen)
  const freyaPrompt = `Full-body 16:9 cinematic character reference portrait of Freya, the majestic Ice Queen, inspired by Elsa in Frozen II.
She stands poised inside an ornate crystalline ice cavern overlooking a glacial fjord.
Costume: Pure luminescent white ice-crystal gown, semi-sheer gossamer capelets draping gracefully from her shoulders with sparkling crystalline frost patterns, subtle geometric ice-blue snowflake embroidery across the fitted bodice and flowing skirt with a high slit revealing silver ice-crystal boots.
Biometrics: Piercing glacial-blue eyes, radiant porcelain skin with a gentle determined smile, loose platinum-blonde hair falling in natural waves over her left shoulder.
Lighting: Cool cinematic blue and violet ambient glow with soft golden rim light. Hyper-detailed textures, photorealistic 8K render, strictly zero on-screen text.`;

  // Character 2: Astrid (The Autumn Princess)
  const astridPrompt = `Full-body 16:9 cinematic character reference portrait of Astrid, the Autumn Princess, inspired by Anna in Frozen II.
She stands beside a rustic carved Nordic archway with golden autumnal leaves.
Costume: Tailored deep charcoal-black traveling dress with intricate dark teal and gold Nordic soutache embroidery along the collar and hemline, rich royal-magenta satin-lined woolen traveling cloak draped over one shoulder, ornate brass-buckled belt, rugged brown leather traveling boots.
Biometrics: Warm hazel-green eyes, radiant sun-kissed complexion with light freckles, auburn-chestnut hair styled in an elegant half-up crown braid.
Lighting: Warm golden hour sunlight mixing with cool Nordic mountain air. Photorealistic 8K render, strictly zero on-screen text.`;

  // Generate Character 1
  console.log("🎨 Generating Anchor 1: Freya (The Ice Queen)...");
  const freyaRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt: freyaPrompt }],
      parameters: { sampleCount: 1, aspectRatio: "16:9" }
    })
  });
  const freyaData = await freyaRes.json();
  const freyaB64 = freyaData.predictions?.[0]?.bytesBase64Encoded;
  if (!freyaB64) throw new Error("Failed to generate Freya anchor: " + JSON.stringify(freyaData).slice(0, 200));
  const freyaPath = path.join(ANCHORS_DIR, "01_freya_ice_queen_anchor.png");
  fs.writeFileSync(freyaPath, Buffer.from(freyaB64, "base64"));
  console.log(`✅ Saved ${freyaPath}`);

  // Generate Character 2
  console.log("🎨 Generating Anchor 2: Astrid (The Autumn Princess)...");
  const astridRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt: astridPrompt }],
      parameters: { sampleCount: 1, aspectRatio: "16:9" }
    })
  });
  const astridData = await astridRes.json();
  const astridB64 = astridData.predictions?.[0]?.bytesBase64Encoded;
  if (!astridB64) throw new Error("Failed to generate Astrid anchor: " + JSON.stringify(astridData).slice(0, 200));
  const astridPath = path.join(ANCHORS_DIR, "02_astrid_autumn_princess_anchor.png");
  fs.writeFileSync(astridPath, Buffer.from(astridB64, "base64"));
  console.log(`✅ Saved ${astridPath}`);

  // Create Side-by-Side Composite Reference Sheet
  console.log("🖼️ Building Composite Multi-Character Anchor Sheet (00_frozen_composite_anchor.png)...");
  const compositePath = path.join(ANCHORS_DIR, "00_frozen_composite_anchor.png");
  execSync(`ffmpeg -y -i ${freyaPath} -i ${astridPath} -filter_complex "[0:v]scale=960:540[v0];[1:v]scale=960:540[v1];[v0][v1]hstack=inputs=2[out]" -map "[out]" ${compositePath}`);
  console.log(`✅ Saved Composite Reference Anchor: ${compositePath} (${Math.round(fs.statSync(compositePath).size / 1024)} KB)`);
}

async function main() {
  await generateMasterSoundtrack();
  await generateCharacterAnchors();
  console.log("\n🎉 STEP 1 & STEP 2 COMPLETE: Master Audio & Character Reference Sheet Locked!");
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
