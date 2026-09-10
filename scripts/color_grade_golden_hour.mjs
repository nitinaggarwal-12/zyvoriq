import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const FINAL_VIDEO = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

const goldenHourFilter = "colorbalance=rs=0.25:gs=0.12:bs=-0.25:rm=0.30:gm=0.15:bm=-0.30:rh=0.15:gh=0.08:bh=-0.15,eq=contrast=1.15:saturation=1.20:gamma_r=1.08:gamma_b=0.92";

const s1Graded = path.join(CLIPS_DIR, "s1_graded.mp4");
const s2Graded = path.join(CLIPS_DIR, "s2_graded.mp4");
const s3Raw = path.join(CLIPS_DIR, "s3_dive.mp4");

console.log("Color grading Shot 1 to sunset golden hour...");
execSync(`ffmpeg -y -i ${CLIPS_DIR}/s1_drone.mp4 -vf "${goldenHourFilter}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p ${s1Graded}`);

console.log("Color grading Shot 2 to sunset golden hour...");
execSync(`ffmpeg -y -i ${CLIPS_DIR}/s2_maya.mp4 -vf "${goldenHourFilter}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p ${s2Graded}`);

// Re-concat the three graded shots
const concatList = path.join(BASE_DIR, "graded_concat.txt");
fs.writeFileSync(concatList, `file '${path.resolve(s1Graded)}'\nfile '${path.resolve(s2Graded)}'\nfile '${path.resolve(s3Raw)}'\n`);

const concatVideo = path.join(CLIPS_DIR, "graded_timeline.mp4");
execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 ${concatVideo}`);

// Mux with Lyria master intro (0.58s seek for immediate attack, 15.484s duration)
const introAudio = path.join(BASE_DIR, "lyria_intro_15s.wav");
execSync(`ffmpeg -y -i ${concatVideo} -i ${introAudio} -c:v copy -c:a aac -b:a 256k -shortest ${FINAL_VIDEO}`);

console.log("✅ Color-Graded Master Video Generated:", FINAL_VIDEO);
