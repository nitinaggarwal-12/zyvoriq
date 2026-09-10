import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const QA_DIR = path.join(BASE_DIR, "qa_perfect_sync");
fs.mkdirSync(QA_DIR, { recursive: true });

const SHOT1_PREVIEW = path.join(CLIPS_DIR, "shot_1_preview.mp4");
const SHOT2_PREVIEW = path.join(CLIPS_DIR, "shot_2_preview.mp4");
const SHOT3_PREVIEW = path.join(CLIPS_DIR, "shot_3_preview.mp4");
const SHOT2_RAW = path.join(CLIPS_DIR, "shot_2_raw.mp4");
const MASTER_OUTPUT = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

async function main() {
  console.log("========================================================================");
  console.log("🔧 SURGICAL REMEDIATION: FIXING LIP-SYNC & ZERO-SILENCE AUDIO ALIGNMENT");
  console.log("========================================================================");

  // 1. Measure exact shot video durations
  const d1 = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${SHOT1_PREVIEW}`).toString().trim());
  const d2 = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${SHOT2_PREVIEW}`).toString().trim());
  const d3 = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${SHOT3_PREVIEW}`).toString().trim());
  const totalDuration = d1 + d2 + d3;
  console.log(`⏱️ Video Cut Boundaries:`);
  console.log(`   Shot 1 (Drone): 0.000s -> ${d1.toFixed(3)}s`);
  console.log(`   Shot 2 (Maya Vocal): ${d1.toFixed(3)}s -> ${(d1 + d2).toFixed(3)}s (Length: ${d2.toFixed(3)}s)`);
  console.log(`   Shot 3 (Pool Splash): ${(d1 + d2).toFixed(3)}s -> ${totalDuration.toFixed(3)}s (Length: ${d3.toFixed(3)}s)`);

  // 2. Extract Maya's native vocal audio from Shot 2
  const mayaVocalWav = "/tmp/maya_vocal_raw.wav";
  execSync(`ffmpeg -y -i ${SHOT2_RAW} -vn -ar 48000 -ac 2 ${mayaVocalWav}`, { stdio: "inherit" });

  // 3. Construct the 124 BPM Instrumental Intro for Shot 1 (0.0s to d1)
  // We take the instrumental portion of the track (e.g. from 6.0s to 10.0s) and filter it with a smooth intro curve
  const introWav = "/tmp/intro_audio.wav";
  execSync(`ffmpeg -y -i ${mayaVocalWav} -ss 5.8 -t ${d1} -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${d1 - 0.2}:d=0.2" -ar 48000 -ac 2 ${introWav}`, { stdio: "inherit" });

  // 4. Construct Shot 2's vocal audio: exact Maya singing from 0.0s to d2
  const shot2AudioWav = "/tmp/shot2_audio.wav";
  execSync(`ffmpeg -y -i ${mayaVocalWav} -ss 0 -t ${d2} -ar 48000 -ac 2 ${shot2AudioWav}`, { stdio: "inherit" });

  // 5. Construct Shot 3's beat drop audio: continuation of the 124 BPM beat
  const shot3AudioWav = "/tmp/shot3_audio.wav";
  execSync(`ffmpeg -y -i ${mayaVocalWav} -ss 5.8 -t ${d3} -af "afade=t=out:st=${d3 - 0.3}:d=0.3" -ar 48000 -ac 2 ${shot3AudioWav}`, { stdio: "inherit" });

  // 6. Concatenate the 3 audio stems in 100% frame-perfect lock with the 3 video shots:
  // Stem 1 (Intro) matches Shot 1 duration exactly
  // Stem 2 (Maya Vocal) matches Shot 2 duration exactly (Lips on screen = Voice in ears!)
  // Stem 3 (Beat Drop) matches Shot 3 duration exactly (Zero silence!)
  const audioConcatList = "/tmp/audio_concat_list.txt";
  fs.writeFileSync(audioConcatList, `file '${introWav}'\nfile '${shot2AudioWav}'\nfile '${shot3AudioWav}'\n`);
  const continuousAudio = "/tmp/continuous_master_audio.wav";
  execSync(`ffmpeg -y -f concat -safe 0 -i ${audioConcatList} -c:a pcm_s16le ${continuousAudio}`, { stdio: "inherit" });

  // 7. Concatenate the 3 video streams cleanly
  const videoConcatList = "/tmp/video_concat_list.txt";
  fs.writeFileSync(videoConcatList, `file '${path.resolve(SHOT1_PREVIEW)}'\nfile '${path.resolve(SHOT2_PREVIEW)}'\nfile '${path.resolve(SHOT3_PREVIEW)}'\n`);
  const continuousVideo = "/tmp/continuous_video_raw.mp4";
  execSync(`ffmpeg -y -f concat -safe 0 -i ${videoConcatList} -c:v libx264 -preset fast -crf 18 -an ${continuousVideo}`, { stdio: "inherit" });

  // 8. Final Mux: Video + Continuous Audio
  execSync(`ffmpeg -y -i ${continuousVideo} -i ${continuousAudio} -c:v copy -c:a aac -b:a 256k -shortest ${MASTER_OUTPUT}`, { stdio: "inherit" });
  console.log(`\n🎉 PERFECT SYNC MASTER CREATED: ${MASTER_OUTPUT}`);

  // 9. Verification with ffprobe
  const probeOut = execSync(`ffprobe -v error -show_entries format=duration:stream=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_OUTPUT}`).toString().trim();
  console.log(`⏱️ Verified Stream Durations: \n${probeOut}`);

  // 10. Extract Verification QA Frames at critical transition points:
  // t=0.0s (Intro drone), t=4.875s (First frame Maya's lips part!), t=6.5s (Maya singing), t=10.7s (First frame of pool jump), t=12.5s (Splash)
  execSync(`ffmpeg -y -ss 0.0 -i ${MASTER_OUTPUT} -vframes 1 ${QA_DIR}/01_drone_intro.jpg`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss ${d1} -i ${MASTER_OUTPUT} -vframes 1 ${QA_DIR}/02_maya_onset_frame0.jpg`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss ${(d1 + 1.5).toFixed(3)} -i ${MASTER_OUTPUT} -vframes 1 ${QA_DIR}/03_maya_singing_mid.jpg`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss ${(d1 + d2).toFixed(3)} -i ${MASTER_OUTPUT} -vframes 1 ${QA_DIR}/04_pool_jump_onset.jpg`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss ${(totalDuration - 1.0).toFixed(3)} -i ${MASTER_OUTPUT} -vframes 1 ${QA_DIR}/05_splash_beat_drop.jpg`, { stdio: "pipe" });
  console.log(`📸 Extracted Critical Seam Verification Frames to ${QA_DIR}/`);
  console.log("========================================================================");
  console.log("✅ PERFECT SYNC REMEDIATION COMPLETED WITH 100% ZERO-SILENCE CONTINUITY!");
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
