#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const videoPath = process.argv[2];
if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("[gate_video_optical_flow] Missing video path");
  process.exit(1);
}
const rawLuma = execSync(`ffmpeg -v error -i "${videoPath}" -vf "scale=64:36,format=gray" -f rawvideo pipe:1`, { maxBuffer: 25 * 1024 * 1024 });
const fb = 64 * 36;
const totalF = Math.floor(rawLuma.length / fb);
let sumDiff = 0;
for (let f = 1; f < totalF; f++) {
  let diff = 0;
  for (let i = 0; i < fb; i++) diff += Math.abs(rawLuma[f * fb + i] - rawLuma[(f - 1) * fb + i]);
  sumDiff += diff / fb;
}
const meanFlow = totalF > 1 ? sumDiff / (totalF - 1) : 0;
if (meanFlow < 0.15) {
  console.error(`[gate_video_optical_flow] FAIL: Static slideshow / frozen video detected (meanFlow=${meanFlow.toFixed(3)})`);
  process.exit(1);
}
console.log(JSON.stringify({ gate: "gate_video_optical_flow", passed: true, meanFlow: Number(meanFlow.toFixed(3)) }));
