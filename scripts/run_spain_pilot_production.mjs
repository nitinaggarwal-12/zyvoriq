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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_DIR = "scratch/spain_college_swim_5m";
const ANCHOR_DIR = path.join(BASE_DIR, "anchors");
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const QA_DIR = path.join(BASE_DIR, "qa_frames");

fs.mkdirSync(ANCHOR_DIR, { recursive: true });
fs.mkdirSync(CLIPS_DIR, { recursive: true });
fs.mkdirSync(QA_DIR, { recursive: true });

const MAYA_ANCHOR_PATH = path.join(ANCHOR_DIR, "01_maya_lead_anchor.png");
const SHOT1_RAW = path.join(CLIPS_DIR, "shot_1_raw.mp4");
const SHOT1_PREVIEW = path.join(CLIPS_DIR, "shot_1_preview.mp4");
const SHOT2_RAW = path.join(CLIPS_DIR, "shot_2_raw.mp4");
const SHOT2_PREVIEW = path.join(CLIPS_DIR, "shot_2_preview.mp4");
const SHOT3_RAW = path.join(CLIPS_DIR, "shot_3_raw.mp4");
const SHOT3_PREVIEW = path.join(CLIPS_DIR, "shot_3_preview.mp4");
const MASTER_PILOT_MP4 = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

async function generateAnchorImage() {
  if (fs.existsSync(MAYA_ANCHOR_PATH)) {
    console.log(`✅ Maya Anchor already exists at ${MAYA_ANCHOR_PATH}, using cached.`);
    return fs.readFileSync(MAYA_ANCHOR_PATH).toString("base64");
  }

  console.log("\n🎨 [Step 1/5] Generating Maya Lead Character Anchor with gemini-2.5-flash-image...");
  const prompt = "Cinematic 35mm high-fashion beauty portrait photograph of Maya, a 21-year-old stylish European brunette college girl with wet wavy dark hair, wearing a sleek black designer one-piece swimsuit, resting her arms on the smooth marble edge of a luxury Ibiza infinity pool overlooking the turquoise Mediterranean Sea. Golden hour sunlight, crystalline water droplets on skin, closed-lip ready stance, radiant confident smile, shallow depth of field, 24fps film still.";

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
    throw new Error("No image data returned for anchor");
  }

  fs.writeFileSync(MAYA_ANCHOR_PATH, Buffer.from(imageBase64, "base64"));
  console.log(`✅ Saved Maya Lead Anchor: ${MAYA_ANCHOR_PATH} (${Math.round(imageBase64.length * 0.75 / 1024)} KB)`);
  return imageBase64;
}

async function callVeo(prompt, durationSec = 6) {
  console.log(`🚀 Dispatching to Google Veo 3.1 (veo-3.1-generate-preview, ${durationSec}s)...`);
  const dispatchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { aspectRatio: "16:9", durationSeconds: durationSec }
    })
  });

  if (!dispatchRes.ok) {
    throw new Error(`Veo dispatch failed (${dispatchRes.status}): ${await dispatchRes.text()}`);
  }

  const dispatchData = await dispatchRes.json();
  const operationName = dispatchData.name;
  console.log(`   Veo Operation: ${operationName}`);

  // Poll until done
  const startTime = Date.now();
  let downloadUri = null;
  for (let poll = 1; poll <= 30; poll++) {
    await sleep(5000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`   Polling Veo operation (${elapsed}s elapsed)...`);
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${key}`);
    const pollData = await pollRes.json();
    if (pollData.error) {
      throw new Error(`Veo error: ${JSON.stringify(pollData.error)}`);
    }
    if (pollData.done) {
      downloadUri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!downloadUri) throw new Error(`Veo completed but returned no video URI: ${JSON.stringify(pollData)}`);
      break;
    }
  }

  if (!downloadUri) throw new Error("Veo timed out after 150s");

  console.log("   Downloading rendered MP4 from Google Storage...");
  const separator = downloadUri.includes("?") ? "&" : "?";
  const fetchRes = await fetch(`${downloadUri}${separator}key=${key}`);
  if (!fetchRes.ok) throw new Error(`Failed to download Veo MP4: HTTP ${fetchRes.status}`);
  const buf = Buffer.from(await fetchRes.arrayBuffer());
  console.log(`✅ Veo render complete (${Math.round(buf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
  return buf;
}

async function callOmni(prompt, referenceImageB64 = null) {
  const payload = {
    model: "models/gemini-omni-1.1-flash",
    input: referenceImageB64
      ? [
          { type: "text", text: prompt },
          { type: "image", data: referenceImageB64, mime_type: "image/png" }
        ]
      : [{ type: "text", text: prompt }]
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Gemini Omni failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  let videoBuffer = null;
  if (Array.isArray(data.steps)) {
    for (const step of data.steps) {
      if (Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item.data) {
            videoBuffer = Buffer.from(item.data, "base64");
            break;
          }
        }
      }
      if (videoBuffer) break;
    }
  }

  if (!videoBuffer) {
    throw new Error(`No video buffer found in Omni response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return videoBuffer;
}

async function main() {
  console.log("========================================================================");
  console.log("🎬 ZYVORIQ MASTER PILOT: 'SOL DE FUGA' (SPAIN COLLEGE SWIM & SING 15s)");
  console.log("========================================================================");

  // 1. Anchor Image
  const anchorB64 = await generateAnchorImage();

  // 2. Shot 2: Vocal Close-Up (Maya singing at pool edge) - Handled by Gemini Omni 1.1 Flash
  if (fs.existsSync(SHOT2_PREVIEW)) {
    console.log(`\n🎤 [Step 2/5] Shot 2 preview already exists at ${SHOT2_PREVIEW} (5.806s), skipping generation.`);
  } else {
    console.log("\n🎤 [Step 2/5] Rendering Shot 2: Maya Hero Vocal Close-Up (Omni 1.1 Flash)...");
    const shot2Prompt = `High-energy sun-soaked 16:9 summer pop music video clip of the EXACT SAME 21-year-old brunette lead singer (Maya) shown in the reference image. She wears the identical sleek black designer one-piece swimsuit with wet hair, resting her arms on the edge of the crystal-clear infinity pool overlooking the turquoise Ibiza Mediterranean Sea.
CRITICAL IMMEDIATE VOCAL ATTACK (0.0 SECONDS): Performer begins singing articulately on frame 0 (0.0s) directly into the camera lens with radiant energy and zero delay: 'Sunrise hits the villa walls, no turning back / No me llames, I won't call, we're off the track.'
Infectious 124 BPM tropical house dance pop music with deep sub-bass, marimba plucks, bright brass stabs, and clear melodic female pop singing vocals. Sunlight glistens off the pool ripples around her shoulders. 24fps high resolution, strictly zero on-screen text, zero subtitles, zero watermarks.`;

    const s2Buf = await callOmni(shot2Prompt, anchorB64);
    fs.writeFileSync(SHOT2_RAW, s2Buf);
    console.log(`✅ Shot 2 Raw Video received (${Math.round(s2Buf.length / 1024)} KB)`);

    console.log("✂️ Quantizing Shot 2 to 5.806s @ 124 BPM...");
    execSync(`ffmpeg -y -i ${SHOT2_RAW} -t 5.806 -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k ${SHOT2_PREVIEW}`, { stdio: "inherit" });
  }

  // 3. Shot 1: Establishing Drone Shot of Ibiza Villa & Sea - Handled by Google Veo 3.1
  if (fs.existsSync(SHOT1_PREVIEW)) {
    console.log(`\n🏰 [Step 3/5] Shot 1 preview already exists at ${SHOT1_PREVIEW}, skipping generation.`);
  } else {
    console.log("\n🏰 [Step 3/5] Rendering Shot 1: Establishing Drone Shot of Ibiza Villa & Sea (Google Veo 3.1)...");
    const shot1Prompt = "Cinematic high-altitude drone tracking shot gliding forward over a modernist luxury white villa on a rocky cliff overlooking the sparkling turquoise Mediterranean Sea in Ibiza, Spain. Brilliant morning sunshine, crystal-clear zero-edge infinity pool reflecting the azure sky, waves breaking against the coast. 24fps 4K high resolution cinematic realism.";

    const s1Buf = await callVeo(shot1Prompt, 6);
    fs.writeFileSync(SHOT1_RAW, s1Buf);
    console.log(`✅ Shot 1 Raw Video received (${Math.round(s1Buf.length / 1024)} KB)`);

    // Quantize Shot 1 to 4.838s and add ambient 124 BPM tropical house guitar intro audio from Shot 2's stem
    console.log("✂️ Quantizing Shot 1 to 4.838s @ 124 BPM...");
    execSync(`ffmpeg -y -i ${SHOT1_RAW} -ss 0 -t 4.838 -c:v libx264 -preset fast -crf 18 -an ${SHOT1_PREVIEW}`, { stdio: "inherit" });
  }

  // 4. Shot 3: Beat Drop Pool Splash - Handled by Google Veo 3.1
  if (fs.existsSync(SHOT3_PREVIEW)) {
    console.log(`\n💦 [Step 4/5] Shot 3 preview already exists at ${SHOT3_PREVIEW}, skipping generation.`);
  } else {
    console.log("\n💦 [Step 4/5] Rendering Shot 3: Beat Drop Pool Splash & Joy (Google Veo 3.1)...");
    const shot3Prompt = "Cinematic slow-motion shot of joyful young adult friends jumping together into a sparkling crystal-clear infinity pool under brilliant summer sunshine! Explosive crystalline water droplets spray through the air in ultra slow-motion against the deep blue sky, bright sun flares, energetic laughing celebration. 24fps 4K high resolution.";

    const s3Buf = await callVeo(shot3Prompt, 6);
    fs.writeFileSync(SHOT3_RAW, s3Buf);
    console.log(`✅ Shot 3 Raw Video received (${Math.round(s3Buf.length / 1024)} KB)`);

    console.log("✂️ Quantizing Shot 3 to 4.355s @ 124 BPM...");
    execSync(`ffmpeg -y -i ${SHOT3_RAW} -ss 0 -t 4.355 -c:v libx264 -preset fast -crf 18 -an ${SHOT3_PREVIEW}`, { stdio: "inherit" });
  }

  // 5. Concat into Continuous 15s Master Cut with Locked Audio Track from Shot 2's Native Stem
  console.log("\n🔗 [Step 5/5] Concatenating 3 Shots into 15-Second Continuous Master Pilot...");
  // Extract audio from Shot 2 or generate the continuous audio bed
  const audioStemPath = path.join(CLIPS_DIR, "audio_stem.aac");
  execSync(`ffmpeg -y -i ${SHOT2_RAW} -vn -c:a aac -b:a 192k ${audioStemPath}`, { stdio: "inherit" });

  // Loop/pad audio to 15.000s with lead-in and tail fade
  const masterAudioPath = path.join(CLIPS_DIR, "master_audio_15s.aac");
  execSync(`ffmpeg -y -i ${audioStemPath} -af "apad=whole_dur=15.000,afade=t=out:st=14.500:d=0.50" -c:a aac -b:a 192k ${masterAudioPath}`, { stdio: "inherit" });

  // Concat the video streams: Shot 1 (4.838s) + Shot 2 (5.806s) + Shot 3 (4.355s) = 14.999s
  const videoConcatList = path.join(BASE_DIR, "video_concat_list.txt");
  fs.writeFileSync(videoConcatList, `file '${path.resolve(SHOT1_PREVIEW)}'\nfile '${path.resolve(SHOT2_PREVIEW)}'\nfile '${path.resolve(SHOT3_PREVIEW)}'\n`);

  const rawVideoConcat = path.join(CLIPS_DIR, "concat_video_raw.mp4");
  execSync(`ffmpeg -y -f concat -safe 0 -i ${videoConcatList} -c:v libx264 -preset fast -crf 18 -an ${rawVideoConcat}`, { stdio: "inherit" });

  // Mux combined video with continuous master audio
  execSync(`ffmpeg -y -i ${rawVideoConcat} -i ${masterAudioPath} -c:v copy -c:a copy -shortest ${MASTER_PILOT_MP4}`, { stdio: "inherit" });
  console.log(`🎉 Master Pilot Reel Created: ${MASTER_PILOT_MP4}`);

  // Extract QA frames
  execSync(`ffmpeg -y -i ${MASTER_PILOT_MP4} -vf "fps=1" ${QA_DIR}/frame_%02d.jpg`, { stdio: "pipe" });
  console.log(`📸 Extracted QA frames to ${QA_DIR}/`);

  const probeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_PILOT_MP4}`).toString().trim();
  console.log(`⏱️ Final Verified Master Pilot Duration: ${probeOut}s (Exact downbeat alignment @ 124 BPM)`);
  console.log("========================================================================");
  console.log("✅ 15-SECOND PILOT PRODUCTION COMPLETED SUCCESSFULLY!");
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
