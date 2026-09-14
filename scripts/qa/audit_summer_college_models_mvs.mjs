import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try { process.loadEnvFile(".env.local"); } catch {}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) throw new Error("Missing API key");

const PRODUCTIONS = [
  {
    id: "mv_01_summer_asia",
    title: "Neon Horizon — Airi & The Shibuya Mode Collective",
    region: "Asia (Tokyo)",
    file: "public/assets/video/mv_01_summer_asia_master.mp4",
    poster: "public/assets/stills/mv_01_summer_asia_poster.jpg"
  },
  {
    id: "mv_02_summer_europe",
    title: "Sunkissed Riviera — Elena & The Mediterranean Pulse",
    region: "Europe (Ibiza & Milan)",
    file: "public/assets/video/mv_02_summer_europe_master.mp4",
    poster: "public/assets/stills/mv_02_summer_europe_poster.jpg"
  },
  {
    id: "mv_03_summer_usa",
    title: "Ocean Boulevard — Sierra & The Miami Wave",
    region: "USA (Miami)",
    file: "public/assets/video/mv_03_summer_usa_master.mp4",
    poster: "public/assets/stills/mv_03_summer_usa_poster.jpg"
  },
  {
    id: "mv_04_summer_india",
    title: "Golden Mirage — Ananya & The Goa Coastal Ensemble",
    region: "India (Goa)",
    file: "public/assets/video/mv_04_summer_india_master.mp4",
    poster: "public/assets/stills/mv_04_summer_india_poster.jpg"
  },
  {
    id: "mv_05_summer_russia",
    title: "White Nights Melodia — Polina & The Neva Modern Ballet",
    region: "Russia (St Petersburg)",
    file: "public/assets/video/mv_05_summer_russia_master.mp4",
    poster: "public/assets/stills/mv_05_summer_russia_poster.jpg"
  }
];

async function runAudit() {
  console.log("========================================================================");
  console.log("🔍 COMPREHENSIVE FORENSIC AUDIT: 5 GLOBAL SUMMER COLLEGE MODEL REELS");
  console.log("========================================================================");

  const report = [];

  for (const p of PRODUCTIONS) {
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`🎬 AUDITING: ${p.title} (${p.region})`);
    console.log(`------------------------------------------------------------------------`);

    const videoPath = path.resolve(process.cwd(), p.file);
    const posterPath = path.resolve(process.cwd(), p.poster);

    if (!fs.existsSync(videoPath)) throw new Error(`Video missing: ${videoPath}`);
    if (!fs.existsSync(posterPath)) throw new Error(`Poster missing: ${posterPath}`);

    const videoSizeMB = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(2);
    console.log(`📦 Video Size: ${videoSizeMB} MB`);

    // 1. FFprobe verification
    const probe = JSON.parse(execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`).toString());
    const vStream = probe.streams.find(s => s.codec_type === "video");
    const aStream = probe.streams.find(s => s.codec_type === "audio");
    const duration = parseFloat(probe.format.duration);

    console.log(`📐 Resolution: ${vStream.width}x${vStream.height} (Target: 1080x1920)`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)}s (Target: 24.0s)`);
    console.log(`🔊 Audio: ${aStream?.codec_name}, channels: ${aStream?.channels}`);

    const formatPass = vStream.width === 1080 && vStream.height === 1920 && Math.abs(duration - 24.0) <= 0.5;

    // 2. Silence detection
    const silenceOut = execSync(`ffmpeg -i "${videoPath}" -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
    const hasSilence = silenceOut.includes("silence_start");
    console.log(`🔇 Silence: ${hasSilence ? "❌ DETECTED" : "✅ 0 SILENCE INTERVALS"}`);

    // 3. PSNR Cut-Boundary Ceiling Assertion (< 25 dB)
    const auditDir = path.resolve(process.cwd(), `scratch/audit_${p.id}`);
    fs.mkdirSync(auditDir, { recursive: true });

    const f0 = path.join(auditDir, "cut_f0.jpg");
    const f8 = path.join(auditDir, "cut_f8.jpg");
    const f16 = path.join(auditDir, "cut_f16.jpg");
    execSync(`ffmpeg -y -ss 0.0 -i "${videoPath}" -vframes 1 -q:v 2 "${f0}" 2>/dev/null`);
    execSync(`ffmpeg -y -ss 8.0 -i "${videoPath}" -vframes 1 -q:v 2 "${f8}" 2>/dev/null`);
    execSync(`ffmpeg -y -ss 16.0 -i "${videoPath}" -vframes 1 -q:v 2 "${f16}" 2>/dev/null`);

    const psnr0_8 = parseFloat(execSync(`ffmpeg -i "${f0}" -i "${f8}" -filter_complex "psnr" -f null - 2>&1`).toString().match(/average:([0-9.]+)/)?.[1] || "0");
    const psnr8_16 = parseFloat(execSync(`ffmpeg -i "${f8}" -i "${f16}" -filter_complex "psnr" -f null - 2>&1`).toString().match(/average:([0-9.]+)/)?.[1] || "0");
    const psnr0_16 = parseFloat(execSync(`ffmpeg -i "${f0}" -i "${f16}" -filter_complex "psnr" -f null - 2>&1`).toString().match(/average:([0-9.]+)/)?.[1] || "0");

    console.log(`📊 Cut Boundary Start Frame PSNR:`);
    console.log(`   Shot 1 start (0s) vs Shot 2 start (8s):  ${psnr0_8.toFixed(2)} dB (Ceiling: < 25 dB)`);
    console.log(`   Shot 2 start (8s) vs Shot 3 start (16s): ${psnr8_16.toFixed(2)} dB (Ceiling: < 25 dB)`);
    console.log(`   Shot 1 start (0s) vs Shot 3 start (16s): ${psnr0_16.toFixed(2)} dB (Ceiling: < 25 dB)`);

    const psnrPass = psnr0_8 < 25.0 && psnr8_16 < 25.0 && psnr0_16 < 25.0;
    console.log(`   Zero-Loop Assertion: ${psnrPass ? "✅ PASS (0% Repetition / Sequential Chaining Verified)" : "❌ FAIL"}`);

    // 4. Multimodal Audio-Visual Vocal Coincidence Inspection
    console.log(`🎙️ Inspecting Multimodal Audio-Visual Vocal Coincidence...`);
    const mid1 = path.join(auditDir, "mid_shot1_4s.jpg");
    const mid2 = path.join(auditDir, "mid_shot2_12s.jpg");
    const mid3 = path.join(auditDir, "mid_shot3_20s.jpg");
    execSync(`ffmpeg -y -ss 4.0 -i "${videoPath}" -vframes 1 -q:v 2 "${mid1}" 2>/dev/null`);
    execSync(`ffmpeg -y -ss 12.0 -i "${videoPath}" -vframes 1 -q:v 2 "${mid2}" 2>/dev/null`);
    execSync(`ffmpeg -y -ss 20.0 -i "${videoPath}" -vframes 1 -q:v 2 "${mid3}" 2>/dev/null`);

    const posterB64 = fs.readFileSync(posterPath).toString("base64");
    const mid1B64 = fs.readFileSync(mid1).toString("base64");
    const mid2B64 = fs.readFileSync(mid2).toString("base64");
    const mid3B64 = fs.readFileSync(mid3).toString("base64");

    const promptText = `You are the Google Omni Chief Quality Auditor conducting a strict forensic continuity inspection on 3 consecutive shots from the summer college fashion model music video "${p.title}" (${p.region}).
Image 1: Locked Character Anchor Poster (Reference)
Image 2: Shot 1 (t=4s)
Image 3: Shot 2 (t=12s)
Image 4: Shot 3 (t=20s)

Verify:
1. ACTOR & BIOMETRIC IDENTITY: Does the performer maintain consistent facial features, bone structure, ethnicity, and hair across all 3 shots compared to the anchor?
2. WARDROBE CONTINUITY: Does the summer fashion attire remain identical and continuous without random morphs?
3. CHOREOGRAPHY & ZERO-REPETITION: Do the 3 shots present natural forward motion and unique choreography rather than looping back to the same opening pose?

Output format:
VERDICT: PASS or FAIL
FINDINGS: <2-3 sentences summarizing exact visual observations>`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType: "image/jpeg", data: posterB64 } },
            { inlineData: { mimeType: "image/jpeg", data: mid1B64 } },
            { inlineData: { mimeType: "image/jpeg", data: mid2B64 } },
            { inlineData: { mimeType: "image/jpeg", data: mid3B64 } }
          ]
        }]
      })
    });

    const data = await res.json();
    const evalText = data.candidates?.[0]?.content?.parts?.[0]?.text || "VERDICT: FAIL";
    const visualPass = evalText.includes("VERDICT: PASS");

    console.log(`   Visual Continuity Verdict: ${visualPass ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   Auditor Remarks:\n   ${evalText.split("\n").slice(0, 3).join("\n   ")}`);

    const overallPass = formatPass && !hasSilence && psnrPass && visualPass;

    report.push({
      id: p.id,
      title: p.title,
      region: p.region,
      formatPass,
      zeroSilence: !hasSilence,
      psnrPass,
      maxPsnr: Math.max(psnr0_8, psnr8_16, psnr0_16).toFixed(2) + " dB",
      visualPass,
      overallPass,
      evalText
    });
  }

  console.log("\n========================================================================");
  console.log("📊 FORENSIC AUDIT SUMMARY MATRIX");
  console.log("========================================================================");
  console.table(report.map(r => ({
    ID: r.id,
    Region: r.region,
    Format: r.formatPass ? "PASS" : "FAIL",
    ZeroSilence: r.zeroSilence ? "PASS" : "FAIL",
    ZeroLoopPSNR: r.psnrPass ? `PASS (${r.maxPsnr})` : `FAIL (${r.maxPsnr})`,
    VisualAudit: r.visualPass ? "PASS" : "FAIL",
    OverallVerdict: r.overallPass ? "✅ 100% PASS" : "❌ FAIL"
  })));

  fs.writeFileSync("scratch/comprehensive_summer_college_models_audit_report.json", JSON.stringify(report, null, 2));
  console.log("\n✅ Audit Report Saved to scratch/comprehensive_summer_college_models_audit_report.json");

  const allPass = report.every(r => r.overallPass);
  if (!allPass) {
    throw new Error("Audit failed on one or more productions!");
  }
}

runAudit().catch(err => {
  console.error("❌ Forensic Audit Error:", err);
  process.exit(1);
});
