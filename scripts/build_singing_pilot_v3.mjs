import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const FINAL_VIDEO = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

console.log("========================================================================");
console.log("🎬 BUILDING SINGING MUSIC VIDEO PILOT: AUDIBLE VOCALS AT 4.0s + CONTINUOUS BED");
console.log("========================================================================");

// Golden hour color grading filter
const goldenHourFilter = "colorbalance=rs=0.25:gs=0.12:bs=-0.25:rm=0.30:gm=0.15:bm=-0.30:rh=0.15:gh=0.08:bh=-0.15,eq=contrast=1.15:saturation=1.20:gamma_r=1.08:gamma_b=0.92";

// 1. Prepare video shots with exact durations (total = 15.484s = 8 musical bars @ 124 BPM)
// Shot 1: Drone over sea and villa (4.000s)
const s1 = path.join(CLIPS_DIR, "s1_4s.mp4");
execSync(`ffmpeg -y -ss 0 -t 4.000 -i ${CLIPS_DIR}/shot_1_raw.mp4 -vf "${goldenHourFilter}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${s1}`);

// Shot 2: Maya hero singing at pool edge (7.742s, from 4.000s to 11.742s)
const s2 = path.join(CLIPS_DIR, "s2_7s7.mp4");
execSync(`ffmpeg -y -ss 0 -t 7.742 -i ${CLIPS_DIR}/shot_2_raw.mp4 -vf "${goldenHourFilter}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${s2}`);

// Shot 3: Maya dive into pool at golden hour (3.742s, from 11.742s to 15.484s)
const s3 = path.join(CLIPS_DIR, "s3_3s7.mp4");
execSync(`ffmpeg -y -ss 0 -t 3.742 -i ${CLIPS_DIR}/shot_3_maya_dive_golden_hour.mp4 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${s3}`);

// Concat video timeline
const concatList = path.join(BASE_DIR, "singing_concat_v3.txt");
fs.writeFileSync(concatList, `file '${path.resolve(s1)}'\nfile '${path.resolve(s2)}'\nfile '${path.resolve(s3)}'\n`);

const concatVideo = path.join(CLIPS_DIR, "singing_timeline_v3.mp4");
execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 ${concatVideo}`);

// 2. Prepare Audio:
// Track 1: Continuous background music bed for exactly 15.484s (seeking 0.90s for immediate attack)
const bedWav = path.join(BASE_DIR, "bed_continuous_15s.wav");
execSync(`ffmpeg -y -ss 0.90 -t 15.484 -i ${MASTER_AUDIO} -c:a pcm_s16le ${bedWav}`);

// Track 2: Maya's native singing vocal (7.742s)
// Contains: "Sunrise hits the villa walls, no turning back. No me llamas I won't call, we're off the track."
const mayaVocal = path.join(BASE_DIR, "maya_native_vocal_7s7.wav");
execSync(`ffmpeg -y -ss 0 -t 7.742 -i ${CLIPS_DIR}/shot_2_raw.mp4 -vn -c:a pcm_s16le ${mayaVocal}`);

// Track 3: Beat drop surge for the dive (from 11.742s to 15.484s = 3.742s)
const diveSurge = path.join(BASE_DIR, "dive_surge_4s.wav");
execSync(`ffmpeg -y -ss 15.0 -t 4.0 -i ${MASTER_AUDIO} -c:a pcm_s16le ${diveSurge}`);

// 3. Audio Mixing:
// - 0s to 4s: Background bed plays loud and clear under the sea drone
// - At 4s: Maya's singing vocal starts articulately ("Sunrise hits the villa walls..."), bed is ducked to 0.35
// - At 11.742s: Beat drop surges as Maya dives into the water
const finalMix = path.join(BASE_DIR, "final_broadcast_audio.wav");
const mixFilter = [
  `[0:a]volume=0.55[bed]`,
  `[1:a]adelay=4000|4000,volume=1.45[vox]`,
  `[2:a]adelay=11742|11742,volume=1.0[surge]`,
  `[bed][vox][surge]amix=inputs=3:duration=first:dropout_transition=0[out]`
].join(";");

execSync(`ffmpeg -y -i ${bedWav} -i ${mayaVocal} -i ${diveSurge} -filter_complex "${mixFilter}" -map "[out]" -c:a pcm_s16le ${finalMix}`);

// 4. Mux into Final Video
execSync(`ffmpeg -y -i ${concatVideo} -i ${finalMix} -c:v copy -c:a aac -b:a 256k -shortest ${FINAL_VIDEO}`);

console.log("\n✅ Generated Master Music Video Pilot:", FINAL_VIDEO);

// 5. Verify duration, silence, and volume
const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${FINAL_VIDEO}`).toString().trim();
console.log("⏱️ Duration:", dur, "(Target: 15.484s)");

const silenceCheck = execSync(`ffmpeg -i ${FINAL_VIDEO} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const hasSilence = silenceCheck.includes("silence_start");
console.log("🔇 Silence check:", hasSilence ? "WARNING: Silence detected!" : "CLEAN (0 silence intervals found)");

const vol = execSync(`ffmpeg -i ${FINAL_VIDEO} -filter_complex "volumedetect" -f null - 2>&1 | grep "mean_volume\\|max_volume"`).toString().trim();
console.log("📊 Volume Levels:\n", vol);
