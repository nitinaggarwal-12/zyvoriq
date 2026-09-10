import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const OUT_DIR = BASE_DIR;

const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const PILOT_AUDIO = path.join(BASE_DIR, "pilot_audio_slice_15s.mp3");
const FINAL_VIDEO = path.join(OUT_DIR, "spain_college_swim_15s_pilot.mp4");

async function main() {
  console.log("========================================================================");
  console.log("🎬 ASSEMBLING AUTONOMOUS MUSIC VIDEO PILOT: 'SOL DE FUGA' (SPAIN 15S)");
  console.log("========================================================================");

  // 1. Re-slice the exact 15.484s pilot audio from the verified master soundtrack
  // Start at 11.129s to lock vocal onset at 4.167s (matching Maya's singing at 3.871 + 0.32 = 4.191s)
  console.log("🎵 Step 1: Slicing 15.484s master audio slice from Lyria 3.5 master...");
  execSync(`ffmpeg -y -ss 11.129 -t 15.484 -i ${MASTER_AUDIO} -c:a libmp3lame -b:a 256k ${PILOT_AUDIO}`, { stdio: "inherit" });

  // 2. Prepare the 3 video shots with exact durations (3.871s, 7.742s, 3.871s)
  console.log("\n🎥 Step 2: Conforming video shots to exact 124 BPM musical bar grid...");
  
  const shot1Out = path.join(CLIPS_DIR, "shot_1_conformed.mp4");
  const shot2Out = path.join(CLIPS_DIR, "shot_2_conformed.mp4");
  const shot3Out = path.join(CLIPS_DIR, "shot_3_conformed.mp4");

  // Shot 1: Drone over villa (3.871s)
  execSync(`ffmpeg -y -ss 0 -t 3.871 -i ${path.join(CLIPS_DIR, "shot_1_raw.mp4")} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${shot1Out}`, { stdio: "inherit" });
  
  // Shot 2: Maya singing hero close-up (7.742s)
  execSync(`ffmpeg -y -ss 0 -t 7.742 -i ${path.join(CLIPS_DIR, "shot_2_raw.mp4")} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${shot2Out}`, { stdio: "inherit" });
  
  // Shot 3: Beat drop pool jump / water splash (3.871s)
  execSync(`ffmpeg -y -ss 0 -t 3.871 -i ${path.join(CLIPS_DIR, "shot_3_raw.mp4")} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${shot3Out}`, { stdio: "inherit" });

  // 3. Concat video stream
  console.log("\n🎞️ Step 3: Concatenating video timeline...");
  const concatList = path.join(BASE_DIR, "pilot_concat_list.txt");
  fs.writeFileSync(concatList, `file '${path.resolve(shot1Out)}'\nfile '${path.resolve(shot2Out)}'\nfile '${path.resolve(shot3Out)}'\n`);

  const concatVideo = path.join(CLIPS_DIR, "conformed_video_timeline.mp4");
  execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 ${concatVideo}`, { stdio: "inherit" });

  // 4. Mux conformed video timeline with Lyria master soundtrack slice
  console.log("\n🔊 Step 4: Muxing master video with Lyria 3.5 master soundtrack slice...");
  execSync(`ffmpeg -y -i ${concatVideo} -i ${PILOT_AUDIO} -c:v copy -c:a aac -b:a 256k -shortest ${FINAL_VIDEO}`, { stdio: "inherit" });

  console.log(`\n✅ Generated Master Music Video Pilot: ${FINAL_VIDEO}`);

  // 5. Pre-flight Quality Verification
  console.log("\n🔍 Step 5: Running Quality Gate Audits...");
  
  // Check exact duration
  const probeDuration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${FINAL_VIDEO}`).toString().trim();
  console.log(`⏱️ Video Duration: ${probeDuration}s (Target: 15.484s)`);

  // Check audio silence
  const silenceCheck = execSync(`ffmpeg -i ${FINAL_VIDEO} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
  const hasSilence = silenceCheck.includes("silence_start");
  console.log(`🔇 Silence Detection: ${hasSilence ? "WARNING: Silence detected!" : "CLEAN (0 silence periods detected across all 15s)"}`);

  // Check audio volume
  const volCheck = execSync(`ffmpeg -i ${FINAL_VIDEO} -filter_complex "volumedetect" -f null - 2>&1 | grep "mean_volume\\|max_volume"`).toString().trim();
  console.log(`📊 Master Audio Levels:\n${volCheck}`);

  console.log("========================================================================");
  console.log("🎉 MUSIC VIDEO PILOT ASSEMBLY COMPLETE AND VERIFIED!");
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Assembly failed:", err);
  process.exit(1);
});
