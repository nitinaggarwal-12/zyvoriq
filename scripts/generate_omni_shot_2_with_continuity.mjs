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
const SHOT1_REF_IMAGE = path.join(BASE_DIR, "omni_qa/frame_08.jpg");
const SHOT1_PREVIEW = path.join(BASE_DIR, "shot_1_preview.mp4");
const SHOT2_RAW_VIDEO = path.join(BASE_DIR, "shot_2_raw.mp4");
const SHOT2_PREVIEW = path.join(BASE_DIR, "shot_2_preview.mp4");
const COMBINED_PREVIEW = path.join(BASE_DIR, "shot_1_and_2_continuity_master.mp4");
const REPORT_PATH = path.join(BASE_DIR, "shot_2_continuity_report.md");

async function main() {
  console.log("========================================================================");
  console.log("🎬 GOOGLE GEMINI OMNI: SHOT 2 GENERATION WITH ZERO-DELAY VOCAL ONSET");
  console.log("========================================================================\n");

  if (!fs.existsSync(SHOT1_REF_IMAGE)) {
    console.error(`❌ Reference image from Shot 1 not found at ${SHOT1_REF_IMAGE}`);
    process.exit(1);
  }

  const refImageBuf = fs.readFileSync(SHOT1_REF_IMAGE);
  const refImageB64 = refImageBuf.toString("base64");
  console.log(`✅ Loaded Shot 1 ready-stance reference frame (${Math.round(refImageBuf.length / 1024)} KB) for continuity.`);

  // Generation Prompt for Shot 2 (5.625s - 11.250s)
  // Lyrics: "Dhol vajje zor naal, nachdi stage, yellow linen top, we turnin' the page!"
  const shot2Prompt = `High-energy 9:16 vertical concert music video clip (5.625 seconds) of the EXACT SAME 21-year-old South Asian lead female singer (Jasleen) shown in the reference image. She maintains identical wardrobe: Danish buttercup-yellow structured linen halter crop top, wide-leg ecru trousers, dark wavy hair, radiant smile.
CRITICAL IMMEDIATE VOCAL ATTACK (0.0 SECONDS): The performer begins singing immediately on the very first frame (0.0s). Her lips physically part on frame 0 to articulately attack the opening consonant 'Dh-' of 'Dhol', singing directly into the camera with zero delay, zero idle smiling, and zero latency: 'Dhol vajje zor naal, nachdi stage, yellow linen top, we turnin\' the page!'. She executes an energetic rhythmic neck roll and shoulder bounce on the 128 BPM Punjabi dhol beat, pointing directly to her yellow linen top as she sings the words. Concert stage with blue and violet neon arrays, cyan laser cones, concert haze, and reflective black floor. Native high-energy singing vocals mixed with driving Punjabi Dhol drums and modern dance pop synths. 24fps high resolution, strictly zero on-screen text, zero subtitles, zero watermarks.`;

  console.log("\n🚀 Dispatching Shot 2 to Gemini Omni 1.1 Flash via Interactions API...");
  console.log(`   Conditioned on Shot 1 ready-stance reference image (closed lips).`);
  console.log(`   Lyrics: "Dhol vajje zor naal, nachdi stage, yellow linen top, we turnin' the page!"\n`);

  const startTime = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-omni-1.1-flash",
      input: [
        { type: "text", text: shot2Prompt },
        { type: "image", data: refImageB64, mime_type: "image/jpeg" }
      ]
    })
  });

  console.log(`   API response status: HTTP ${res.status}`);
  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ Gemini Omni dispatch failed:", errText);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`   Interaction ID: ${data.id}`);
  console.log(`   Tokens: total=${data.usage?.total_tokens}, video_output=${data.usage?.output_tokens_by_modality?.[0]?.tokens}`);

  // Find video in steps
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
    console.error("❌ No video buffer found in response:", JSON.stringify(data).slice(0, 500));
    process.exit(1);
  }

  fs.writeFileSync(SHOT2_RAW_VIDEO, videoBuffer);
  console.log(`✅ Saved Shot 2 raw video: ${SHOT2_RAW_VIDEO} (${Math.round(videoBuffer.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);

  // Downbeat Quantization with FFmpeg: Trim to 5.625s with 100ms tail fadeout
  console.log("\n✂️ Downbeat Quantization with FFmpeg (5.625s @ 128 BPM)...");
  execSync(`ffmpeg -y -i ${SHOT2_RAW_VIDEO} -t 5.625 -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -af "afade=t=out:st=5.525:d=0.10" ${SHOT2_PREVIEW}`, { stdio: "inherit" });
  console.log(`✅ Saved Shot 2 preview: ${SHOT2_PREVIEW}`);

  // Extract QA frames for Shot 2
  const shot2QaDir = path.join(BASE_DIR, "shot_2_qa");
  fs.mkdirSync(shot2QaDir, { recursive: true });
  execSync(`ffmpeg -y -i ${SHOT2_PREVIEW} -vf "fps=2" ${shot2QaDir}/frame_%02d.jpg`, { stdio: "pipe" });
  console.log(`✅ Extracted QA frames to ${shot2QaDir}/`);

  // Concat Shot 1 + Shot 2 into an 11.25s continuous reel cut
  if (fs.existsSync(SHOT1_PREVIEW)) {
    console.log("\n🔗 Concatenating Shot 1 + Shot 2 into Continuous 11.25s Master Cut...");
    const concatListPath = path.join(BASE_DIR, "shots_1_2_concat.txt");
    fs.writeFileSync(concatListPath, `file '${path.resolve(SHOT1_PREVIEW)}'\nfile '${path.resolve(SHOT2_PREVIEW)}'\n`);
    execSync(`ffmpeg -y -f concat -safe 0 -i ${concatListPath} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k ${COMBINED_PREVIEW}`, { stdio: "inherit" });
    console.log(`🎉 2-Shot Continuity Master Created: ${COMBINED_PREVIEW}`);
  }

  // Multimodal Forensic Verification with Gemini 2.5 Pro
  console.log("\n🔍 Performing Multimodal Forensic Audit with Gemini 2.5 Pro...");
  const s2Buf = fs.readFileSync(SHOT2_PREVIEW);
  const s2B64 = s2Buf.toString("base64");

  const auditPrompt = `Perform an objective multimodal forensic audit of Shot 2 for our Punjabi pop music video reel.
Performer Profile: 21-year-old Punjabi college girl (Jasleen) in buttercup-yellow halter crop top, wide-leg ecru trousers, long wavy dark hair.
Target Lyrics: "Dhol vajje zor naal, nachdi stage, yellow linen top, we turnin' the page!"
Target Duration: 5.625s (3 musical bars @ 128 BPM).

Audit and evaluate:
1. Biometric & Character Continuity: Does she match the lead singer from Shot 1?
2. Wardrobe & Hair Continuity: Is the yellow halter top and ecru trouser styling preserved?
3. Lip-Sync & Viseme Alignment: Do her visible mouth movements accurately track the Punjabi/English lyrics?
4. Audio & Musical Fidelity: Is the Bhangra rhythm and singing vocal crisp and well-mixed?
5. Clean Screen: Zero on-screen subtitles, watermarks, or text artifacts?
6. Overall Verdict: APPROVED or REJECTED with a numeric score (0-100%).`;

  try {
    const auditRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: auditPrompt },
            { inlineData: { mimeType: "video/mp4", data: s2B64 } }
          ]
        }]
      })
    });
    const auditData = await auditRes.json();
    const auditText = auditData?.candidates?.[0]?.content?.parts?.[0]?.text || "Audit text unavailable";
    console.log("\n========================================================================");
    console.log("🔍 FORENSIC AUDIT VERDICT:");
    console.log("========================================================================");
    console.log(auditText);

    fs.writeFileSync(REPORT_PATH, `# 🎬 Shot 2 Forensic & Continuity Audit Report\n\n${auditText}\n`);
    console.log(`\n✅ Saved audit report to ${REPORT_PATH}`);
  } catch (err) {
    console.error("⚠️ Audit failed:", err.message);
  }

  console.log("\n========================================================================");
  console.log("🎉 SHOT 2 CONTINUITY PIPELINE COMPLETE!");
  console.log("========================================================================");
}

main().catch(console.error);
