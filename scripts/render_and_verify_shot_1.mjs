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

const BASE_DIR = "scratch/chandigarh_denmark_production";
const REF_IMAGE_PATH = path.join(BASE_DIR, "visual_previews/jasleen_wardrobe_concept_1788995993348.jpg");
const AUDIO_PATH = path.join(BASE_DIR, "lyria_master_audio.mp3");
const RAW_VIDEO_PATH = path.join(BASE_DIR, "shot_1_raw.mp4");
const TRIMMED_VIDEO_PATH = path.join(BASE_DIR, "shot_1_video_5625.mp4");
const TRIMMED_AUDIO_PATH = path.join(BASE_DIR, "shot_1_audio_5625.wav");
const FINAL_PREVIEW_PATH = path.join(BASE_DIR, "shot_1_preview.mp4");
const REPORT_PATH = path.join(BASE_DIR, "shot_1_forensic_report.md");

async function main() {
  console.log("========================================================================");
  console.log("🎬 GOOGLE OMNI & VEO 3.1: SHOT 1 GENERATION & MULTIMODAL AUDIT");
  console.log("========================================================================\n");

  if (!fs.existsSync(REF_IMAGE_PATH)) {
    console.error(`❌ Reference image not found at ${REF_IMAGE_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(AUDIO_PATH)) {
    console.error(`❌ Master audio not found at ${AUDIO_PATH}`);
    process.exit(1);
  }

  const refImageBuf = fs.readFileSync(REF_IMAGE_PATH);
  const refImageB64 = refImageBuf.toString("base64");
  console.log(`✅ Loaded reference image (${Math.round(refImageBuf.length / 1024)} KB) for visual conditioning.`);

  // Generation Prompt for Shot 1 (0.0s - 5.625s)
  const shot1Prompt = `The young South Asian female lead performer struts forward on a glossy wet reflective black concert stage runway with radiant charisma and a confident smile, singing the intro hook directly into the camera. She executes a rhythmic shoulder-bounce on the 128 BPM dhol beat, her dark wavy hair moving dynamically. Flanking her on illuminated tiered risers in the background, live Punjabi Dhol drummers in orange turbans and white shirts and a live Scandinavian brass section play with explosive energy. Warm amber key spotlighting, piercing cyan laser cones slicing through atmospheric haze, and glossy water puddle reflections. High-fashion Indian pop music video aesthetic. 9:16 vertical cinema, 24fps smooth motion, zero on-screen text, zero subtitles.`;

  console.log("\n🚀 Dispatching Shot 1 to Google Veo 3.1 with image conditioning...");
  console.log(`   Prompt: "${shot1Prompt.slice(0, 120)}..."`);

  const candidateModels = ["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"];
  let operationName = null;
  let usedModel = "";

  for (const model of candidateModels) {
    try {
      console.log(`   Attempting dispatch on ${model}...`);
      const dispatchRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [
              {
                prompt: shot1Prompt,
                image: { bytesBase64Encoded: refImageB64, mimeType: "image/jpeg" }
              }
            ],
            parameters: {
              aspectRatio: "9:16",
              durationSeconds: 6,
              sampleCount: 1
            }
          })
        }
      );

      const dispatchData = await dispatchRes.json();
      if (dispatchRes.ok && dispatchData.name) {
        operationName = dispatchData.name;
        usedModel = model;
        console.log(`   ✅ Dispatched successfully! Operation: ${operationName}`);
        break;
      } else {
        console.warn(`   ⚠️ ${model} returned error:`, dispatchData.error?.message || dispatchData);
      }
    } catch (e) {
      console.warn(`   ⚠️ ${model} call failed:`, e.message);
    }
  }

  if (!operationName) {
    console.error("❌ Failed to initiate Veo 3.1 video synthesis.");
    process.exit(1);
  }

  // Poll for completion
  console.log("\n⏳ Polling Veo operation for render completion...");
  let videoUri = null;
  const maxPolls = 40;
  for (let poll = 1; poll <= maxPolls; poll++) {
    await new Promise((r) => setTimeout(r, 6000));
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${key}`);
    const pollData = await pollRes.json();

    if (pollData.done) {
      if (pollData.error) {
        console.error("❌ Veo operation finished with error:", pollData.error);
        process.exit(1);
      }
      const samples = pollData.response?.generateVideoResponse?.generatedSamples;
      videoUri = samples?.[0]?.video?.uri;
      console.log(`\n🎉 Veo 3.1 Render Complete on poll ${poll}! Video URI: ${videoUri}`);
      break;
    } else {
      process.stdout.write(`.`);
    }
  }

  if (!videoUri) {
    console.error("\n❌ Veo operation timed out without video URI.");
    process.exit(1);
  }

  // Download raw video
  console.log(`\n📥 Downloading raw video from Google Storage...`);
  const vidRes = await fetch(`${videoUri}&key=${key}`);
  if (!vidRes.ok) {
    console.error(`❌ Failed to download video stream: HTTP ${vidRes.status}`);
    process.exit(1);
  }
  const vidArrayBuf = await vidRes.arrayBuffer();
  fs.writeFileSync(RAW_VIDEO_PATH, Buffer.from(vidArrayBuf));
  console.log(`✅ Saved raw video to ${RAW_VIDEO_PATH} (${Math.round(vidArrayBuf.byteLength / 1024)} KB)`);

  // Splicing & Muxing with FFmpeg
  console.log(`\n✂️ Muxing Shot 1 Video and Lyria Master Audio with FFmpeg...`);
  // Trim video exactly to 5.625s (3 musical bars @ 128 BPM)
  execSync(`ffmpeg -y -i ${RAW_VIDEO_PATH} -ss 0 -t 5.625 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an ${TRIMMED_VIDEO_PATH}`, { stdio: "inherit" });
  
  // Trim Lyria master audio exactly to 5.625s with 0.15s gentle tail crossfade
  execSync(`ffmpeg -y -i ${AUDIO_PATH} -ss 0 -t 5.625 -af "afade=t=out:st=5.475:d=0.15" ${TRIMMED_AUDIO_PATH}`, { stdio: "inherit" });

  // Mux video & audio into final preview
  execSync(`ffmpeg -y -i ${TRIMMED_VIDEO_PATH} -i ${TRIMMED_AUDIO_PATH} -c:v copy -c:a aac -b:a 192k ${FINAL_PREVIEW_PATH}`, { stdio: "inherit" });
  console.log(`✅ Final synchronized preview created: ${FINAL_PREVIEW_PATH}`);

  // Extract 3 QA frames for multimodal forensic inspection
  console.log(`\n📸 Extracting QA frames for Multimodal Forensic Audit...`);
  const frame1Path = path.join(BASE_DIR, "shot_1_frame_01.jpg");
  const frame2Path = path.join(BASE_DIR, "shot_1_frame_02.jpg");
  const frame3Path = path.join(BASE_DIR, "shot_1_frame_03.jpg");

  execSync(`ffmpeg -y -ss 00:00:01.000 -i ${FINAL_PREVIEW_PATH} -vframes 1 -q:v 2 ${frame1Path}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss 00:00:03.000 -i ${FINAL_PREVIEW_PATH} -vframes 1 -q:v 2 ${frame2Path}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss 00:00:05.000 -i ${FINAL_PREVIEW_PATH} -vframes 1 -q:v 2 ${frame3Path}`, { stdio: "pipe" });
  console.log(`✅ Extracted 3 QA frames at t=1.0s, t=3.0s, and t=5.0s.`);

  // Multimodal Forensic Verification with Gemini 2.5 Pro
  console.log(`\n🔍 Performing Multimodal Forensic Audit with Gemini 2.5 Pro...`);
  const f1B64 = fs.readFileSync(frame1Path).toString("base64");
  const f2B64 = fs.readFileSync(frame2Path).toString("base64");
  const f3B64 = fs.readFileSync(frame3Path).toString("base64");

  const auditPrompt = `You are Google Omni Directorial Quality Auditor. Perform a rigorous forensic inspection of these 3 video frames generated for Shot 1 (0.0s to 5.625s) of our Punjabi music video reel.
Conditioning Image Reference: Jasleen in buttercup-yellow Danish structured linen halter crop top, wide-leg ecru trousers, silver Sikh kadha, bare feet with ghungroos.
Generated Frames: Frame 1 (t=1.0s), Frame 2 (t=3.0s), Frame 3 (t=5.0s).

Evaluate and rate:
1. Performer Biometrics & Charisma: Does she match the 21-year-old Punjabi college girl profile, high cheekbones, radiant smile, dark wavy hair?
2. Wardrobe Continuity: Is she wearing the buttercup-yellow structured linen halter top and wide-leg ecru trousers? Zero salwar kameez?
3. Staged Live Band & Orchestra: Are the Punjabi Dhol drummers in orange turbans and Scandinavian brass section visible on illuminated risers in the background?
4. Lighting & Stage Ambience: Are cyan laser cones, amber key spotlights, and wet reflective stage reflections present?
5. Subtitle & Text Audit: Is there ANY on-screen generated text, watermark, or subtitle present? (Must be strictly NO TEXT).
6. Final Verdict: APPROVED or REJECTED.

Format your response in structured Markdown with quantitative scores (0-100%).`;

  let auditText = "";
  try {
    const auditRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: auditPrompt },
                { inlineData: { mimeType: "image/jpeg", data: refImageB64 } },
                { inlineData: { mimeType: "image/jpeg", data: f1B64 } },
                { inlineData: { mimeType: "image/jpeg", data: f2B64 } },
                { inlineData: { mimeType: "image/jpeg", data: f3B64 } }
              ]
            }
          ]
        })
      }
    );

    const auditData = await auditRes.json();
    auditText = auditData?.candidates?.[0]?.content?.parts?.[0]?.text || "Audit text unavailable";
    console.log("✅ Forensic Audit Completed!");
  } catch (e) {
    auditText = `Audit failed: ${e.message}`;
  }

  // Write markdown report
  const fullReport = `# 🎬 Google Omni Forensic Audit: Shot 1 Video & Audio Master

**Production ID**: \`studio1_600e0145-2c24-4637-9a55-d2e5dbca545a\`  
**Shot**: \`Shot 1 (Establishing Runway Catwalk)\`  
**Duration**: \`5.625s\` (Exact 3 Musical Bars at 128.0 BPM)  
**Video Model Physically Invoked**: \`${usedModel}\`  
**Audio Model Physically Invoked**: \`models/lyria-3-clip-preview\`  
**Director & Forensic Auditor**: \`gemini-2.5-pro\`  
**Timestamp**: ${new Date().toISOString()}

---

## 🎥 Deliverable Assets
* **Master Muxed Preview**: [\`shot_1_preview.mp4\`](file://${path.resolve(FINAL_PREVIEW_PATH)})
* **Frame 1 (t=1.0s)**: [\`shot_1_frame_01.jpg\`](file://${path.resolve(frame1Path)})
* **Frame 2 (t=3.0s)**: [\`shot_1_frame_02.jpg\`](file://${path.resolve(frame2Path)})
* **Frame 3 (t=5.0s)**: [\`shot_1_frame_03.jpg\`](file://${path.resolve(frame3Path)})

---

## 🔍 Forensic Multimodal Audit Verdict (Gemini 2.5 Pro)
${auditText}
`;

  fs.writeFileSync(REPORT_PATH, fullReport);
  console.log(`✅ Forensic report saved to ${REPORT_PATH}`);
  console.log("\n========================================================================");
  console.log("🎉 SHOT 1 PIPELINE COMPLETE");
  console.log("========================================================================");
}

main().catch(console.error);
