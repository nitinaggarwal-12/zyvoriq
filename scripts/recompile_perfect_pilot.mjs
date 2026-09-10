import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const SHOT1_RAW = path.join(CLIPS_DIR, "shot_1_raw.mp4");
const SHOT2_RAW = path.join(CLIPS_DIR, "shot_2_raw.mp4");
const SHOT3_RAW = path.join(CLIPS_DIR, "shot_3_raw.mp4");
const MASTER_OUTPUT = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

async function main() {
  console.log("========================================================================");
  console.log("🎬 ZERO-SILENCE MASTER RECOMPILER & FORENSIC GATEKEEPER (124.0 BPM)");
  console.log("========================================================================");

  const BAR2 = 3.871;
  const BAR4 = 7.742;
  const TOTAL = BAR2 + BAR4 + BAR2; // 15.484s

  console.log(`⏱️ Strict 8-Bar Pacing Grid:`);
  console.log(`   Shot 1 (Drone Intro):  0.000s -> ${BAR2.toFixed(3)}s`);
  console.log(`   Shot 2 (Maya Vocal):   ${BAR2.toFixed(3)}s -> ${(BAR2 + BAR4).toFixed(3)}s (Length: ${BAR4.toFixed(3)}s)`);
  console.log(`   Shot 3 (Pool Splash):  ${(BAR2 + BAR4).toFixed(3)}s -> ${TOTAL.toFixed(3)}s (Length: ${BAR2.toFixed(3)}s)`);

  // 1. Prepare Video Cuts
  const s1Trim = "/tmp/shot1_trim.mp4";
  const s2Trim = "/tmp/shot2_trim.mp4";
  const s3Trim = "/tmp/shot3_trim.mp4";

  execSync(`ffmpeg -y -ss 0 -i ${SHOT1_RAW} -t ${BAR2} -c:v libx264 -preset fast -crf 18 -an ${s1Trim}`, { stdio: "inherit" });
  execSync(`ffmpeg -y -ss 0 -i ${SHOT2_RAW} -t ${BAR4} -c:v libx264 -preset fast -crf 18 -an ${s2Trim}`, { stdio: "inherit" });
  execSync(`ffmpeg -y -ss 0 -i ${SHOT3_RAW} -t ${BAR2} -c:v libx264 -preset fast -crf 18 -an ${s3Trim}`, { stdio: "inherit" });

  const vList = "/tmp/v_concat_list.txt";
  fs.writeFileSync(vList, `file '${s1Trim}'\nfile '${s2Trim}'\nfile '${s3Trim}'\n`);
  const vMaster = "/tmp/master_video_raw.mp4";
  execSync(`ffmpeg -y -f concat -safe 0 -i ${vList} -c:v copy ${vMaster}`, { stdio: "inherit" });

  // 2. Extract Maya's native vocal audio
  const mayaAudio = "/tmp/maya_vocal_extracted.wav";
  execSync(`ffmpeg -y -i ${SHOT2_RAW} -vn -ar 48000 -ac 2 ${mayaAudio}`, { stdio: "inherit" });

  // 3. Construct Continuous 15.484s Audio using PRE-INPUT SEEKING (-ss before -i):
  // Part A (0.0s - 3.871s): Instrumental intro using marimba/synth rhythm from seconds 6.0-9.871 of mayaAudio
  const introAudio = "/tmp/intro_audio_fixed.wav";
  execSync(`ffmpeg -y -ss 6.0 -t ${BAR2} -i ${mayaAudio} -af "lowpass=f=2500,afade=t=in:st=0:d=0.5" -ar 48000 -ac 2 ${introAudio}`, { stdio: "inherit" });

  // Part B (3.871s - 11.613s): Maya's exact vocal track from 0.0s to 7.742s
  const vocalAudio = "/tmp/vocal_audio_fixed.wav";
  execSync(`ffmpeg -y -ss 0 -t ${BAR4} -i ${mayaAudio} -ar 48000 -ac 2 ${vocalAudio}`, { stdio: "inherit" });

  // Part C (11.613s - 15.484s): Energetic beat drop using full-frequency groove from seconds 6.0-9.871
  const dropAudio = "/tmp/drop_audio_fixed.wav";
  execSync(`ffmpeg -y -ss 6.0 -t ${BAR2} -i ${mayaAudio} -af "volume=1.1,afade=t=out:st=3.5:d=0.371" -ar 48000 -ac 2 ${dropAudio}`, { stdio: "inherit" });

  // 4. Concatenate Audio Stems
  const aList = "/tmp/a_concat_list.txt";
  fs.writeFileSync(aList, `file '${introAudio}'\nfile '${vocalAudio}'\nfile '${dropAudio}'\n`);
  const aMaster = "/tmp/master_audio_continuous.wav";
  execSync(`ffmpeg -y -f concat -safe 0 -i ${aList} -c:a pcm_s16le ${aMaster}`, { stdio: "inherit" });

  // 5. Mux Video + Continuous Audio
  execSync(`ffmpeg -y -i ${vMaster} -i ${aMaster} -c:v copy -c:a aac -b:a 256k -shortest ${MASTER_OUTPUT}`, { stdio: "inherit" });
  console.log(`\n🎉 MASTER PILOT REEL CREATED: ${MASTER_OUTPUT}`);

  // 6. MANDATORY AUTOMATED SILENCE AUDIT GATE (Must find 0.0s silence)
  console.log("\n🛡️ [FORENSIC GATE 1] Executing Automated FFmpeg Silence Detection Audit...");
  const silenceOutput = execSync(`ffmpeg -i ${MASTER_OUTPUT} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
  const silenceMatches = silenceOutput.match(/silence_start/g);
  if (silenceMatches && silenceMatches.length > 0) {
    console.error("❌ QUALITY GATE FAILED: Audio silence detected in master output!");
    console.error(silenceOutput);
    process.exit(1);
  }
  console.log("✅ QUALITY GATE 1 PASSED: Zero silence detected across all 15.484 seconds!");

  // 7. MANDATORY MULTIMODAL FORENSIC AUDIT (Gemini 2.5 Pro)
  console.log("\n🛡️ [FORENSIC GATE 2] Executing Multimodal Audio-Visual Alignment Audit with Gemini 2.5 Pro...");
  const vidB64 = fs.readFileSync(MASTER_OUTPUT).toString("base64");
  const auditRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "video/mp4", data: vidB64 } },
          { text: "Perform an objective audio-visual forensic audit of this 15-second music video reel.\nAudit criteria:\n1. Audio Continuity: Is music playing continuously from 0.0s to 15.4s with zero dropouts or silence?\n2. Lip-Sync Locking: In Shot 2 (around 3.8s to 11.6s), does Maya's mouth articulation match the audible words 'Sunrise hits the villa walls...' in exact synchronization?\n3. Cut Timing: Do the transitions between Shot 1 (drone), Shot 2 (vocal), and Shot 3 (splash) feel rhythmically natural?\n4. Issue an explicit PASS or FAIL verdict with numeric score (0-100%)." }
        ]
      }]
    })
  });

  const auditData = await auditRes.json();
  const auditText = auditData.candidates?.[0]?.content?.parts?.[0]?.text || "No audit response";
  console.log("\n📋 GEMINI 2.5 PRO FORENSIC VERDICT:\n");
  console.log(auditText);

  const reportPath = path.join(BASE_DIR, "forensic_audit_report.md");
  fs.writeFileSync(reportPath, auditText);
  console.log(`\n✅ Audit report saved to ${reportPath}`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
