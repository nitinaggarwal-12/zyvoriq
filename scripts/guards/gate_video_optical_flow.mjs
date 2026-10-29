#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const videoPath = process.argv[2];
if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("[gate_video_optical_flow] Missing video path");
  process.exit(1);
}
const rawLuma = execSync(`ffmpeg -v error -i "${videoPath}" -vf "scale=64:36,format=gray" -f rawvideo pipe:1`, { maxBuffer: 64 * 1024 * 1024 });
const fb = 64 * 36;
const totalF = Math.floor(rawLuma.length / fb);
const steps = [];
for (let f = 1; f < totalF; f++) {
  let diff = 0;
  for (let i = 0; i < fb; i++) diff += Math.abs(rawLuma[f * fb + i] - rawLuma[(f - 1) * fb + i]);
  const s = diff / fb;
  if (s < 25.0) steps.push(s);
}
const meanFlow = steps.length ? steps.reduce((a, b) => a + b, 0) / steps.length : 0;
const stdFlow = steps.length ? Math.sqrt(steps.reduce((a, b) => a + (b - meanFlow) ** 2, 0) / steps.length) : 0;

if (meanFlow < 0.15) {
  console.error(`[gate_video_optical_flow] FAIL: Static slideshow / frozen video detected (meanFlow=${meanFlow.toFixed(3)})`);
  process.exit(1);
}

// Synthetic Ken-Burns zoompan on a single still image exhibits unnaturally uniform step velocity (mean < 1.50 && std < 0.38)
if (meanFlow < 1.50 && stdFlow < 0.38 && totalF >= 48) {
  console.error(`[gate_video_optical_flow] FAIL: Static slideshow / synthetic zoompan detected (meanFlow=${meanFlow.toFixed(3)}, stdFlow=${stdFlow.toFixed(3)} < 0.38)`);
  process.exit(1);
}

console.log(JSON.stringify({ gate: "gate_video_optical_flow", passed: true, meanFlow: Number(meanFlow.toFixed(3)), stdFlow: Number(stdFlow.toFixed(3)) }));
