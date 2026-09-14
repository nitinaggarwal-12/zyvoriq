import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PRODUCTION_ID = "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985";
const WORK_DIR = path.join(process.cwd(), "scratch", "yt", PRODUCTION_ID);
const PUB_DIR = path.join(process.cwd(), "public", "renders", "yt", PRODUCTION_ID);
fs.mkdirSync(PUB_DIR, { recursive: true });

console.log("=== 1. Building 16.71s Tightened 4-Shot Master (0.56s gaps) ===");
const tightSilent = path.join(WORK_DIR, "tight_silent.mp4");
const tightNativeWav = path.join(WORK_DIR, "tight_native.wav");
const songPath = path.join(WORK_DIR, "song.mp3");

const native16Out = path.join(PUB_DIR, "master_native_16s_tight.mp4");
execFileSync("ffmpeg", [
  "-y",
  "-i", tightSilent,
  "-i", tightNativeWav,
  "-filter_complex", "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[aout]",
  "-map", "0:v:0",
  "-map", "[aout]",
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-shortest",
  native16Out
], { stdio: "ignore" });

const hybrid16Out = path.join(PUB_DIR, "master_hybrid_16s_tight.mp4");
execFileSync("ffmpeg", [
  "-y",
  "-i", tightSilent,
  "-i", tightNativeWav,
  "-i", songPath,
  "-filter_complex",
  `[1:a]volume=1.0[voc];[2:a]atrim=0:16.71,asetpts=PTS-STARTPTS,volume=0.32[bed];[voc][bed]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`,
  "-map", "0:v:0", "-map", "[aout]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
  "-shortest",
  hybrid16Out
], { stdio: "ignore" });

console.log("Saved master_native_16s_tight.mp4 (16.71s) and master_hybrid_16s_tight.mp4 (16.71s)");

console.log("=== 2. Saving dedicated 24.00s Non-Stop 6-Shot Master files ===");
const native24Src = path.join(PUB_DIR, "master_native.mp4");
const hybrid24Src = path.join(PUB_DIR, "master_hybrid.mp4");
const native24Out = path.join(PUB_DIR, "master_native_24s_nonstop.mp4");
const hybrid24Out = path.join(PUB_DIR, "master_hybrid_24s_nonstop.mp4");
fs.copyFileSync(native24Src, native24Out);
fs.copyFileSync(hybrid24Src, hybrid24Out);
console.log("Saved master_native_24s_nonstop.mp4 (24.00s) and master_hybrid_24s_nonstop.mp4 (24.00s)");
