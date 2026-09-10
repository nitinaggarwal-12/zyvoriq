import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const FINAL_VIDEO = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

// 1. Slice exact 15.484s intro audio from Lyria Master (0.000 to 15.484s)
const introAudio = path.join(BASE_DIR, "lyria_intro_15s.wav");
execSync(`ffmpeg -y -ss 0 -t 15.484 -i ${MASTER_AUDIO} -c:a pcm_s16le ${introAudio}`);

// 2. Conform the 3 golden hour shots:
// Shot 1: Drone over villa at golden hour (4.500s)
const s1 = path.join(CLIPS_DIR, "s1_drone.mp4");
execSync(`ffmpeg -y -ss 0 -t 4.500 -i ${CLIPS_DIR}/shot_1_raw.mp4 -c:v libx264 -preset fast -crf 18 -r 24 -an ${s1}`);

// Shot 2: Maya hero at pool edge at golden hour (6.000s)
const s2 = path.join(CLIPS_DIR, "s2_maya.mp4");
execSync(`ffmpeg -y -ss 0 -t 6.000 -i ${CLIPS_DIR}/shot_2_raw.mp4 -c:v libx264 -preset fast -crf 18 -r 24 -an ${s2}`);

// Shot 3: Maya diving into pool at golden hour (4.984s)
const s3 = path.join(CLIPS_DIR, "s3_dive.mp4");
execSync(`ffmpeg -y -ss 0 -t 4.984 -i ${CLIPS_DIR}/shot_3_maya_dive_golden_hour.mp4 -c:v libx264 -preset fast -crf 18 -r 24 -an ${s3}`);

// 3. Concat video stream
const concatList = path.join(BASE_DIR, "golden_hour_concat.txt");
fs.writeFileSync(concatList, `file '${path.resolve(s1)}'\nfile '${path.resolve(s2)}'\nfile '${path.resolve(s3)}'\n`);

const concatVideo = path.join(CLIPS_DIR, "golden_hour_video.mp4");
execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 ${concatVideo}`);

// 4. Mux with Lyria master intro soundtrack
execSync(`ffmpeg -y -i ${concatVideo} -i ${introAudio} -c:v copy -c:a aac -b:a 256k -shortest ${FINAL_VIDEO}`, { stdio: "inherit" });

console.log("✅ Final Master Video Generated:", FINAL_VIDEO);

const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${FINAL_VIDEO}`).toString().trim();
console.log("⏱️ Duration:", dur);

const silence = execSync(`ffmpeg -i ${FINAL_VIDEO} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const hasSilence = silence.includes("silence_start");
console.log("🔇 Silence:", hasSilence ? "WARNING" : "CLEAN (0 silence)");
