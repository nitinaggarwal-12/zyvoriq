#!/usr/bin/env node
/**
 * Empirically Calibrated Frame-by-Frame Motion Velocity & Native 24/1 Cadence Gate
 * Ground-truth calibration on 64x36 luma frames of Veo 3.1 footage:
 *   - Native 1.000x 24/1 CFR Veo clips : meanStep ~= 1.21, p90Step ~= 1.80
 *   - 1.450x setpts CFR-baked warp     : meanStep ~= 1.73, p90Step ~= 3.35
 *   - Warped 30fps master reel         : meanStep ~= 2.92, p90Step ~= 5.17
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const videoPath = process.argv[2];
if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("[gate_motion_velocity_cadence] Missing or invalid video path");
  process.exit(1);
}

const raw = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate,avg_frame_rate,nb_read_frames -count_frames -of json "${videoPath}"`, { encoding: "utf8" });
const st = JSON.parse(raw).streams?.[0] || {};
if (st.r_frame_rate !== st.avg_frame_rate) {
  console.error(`[gate_motion_velocity_cadence] FAIL: VFR cadence detected (${st.r_frame_rate} vs ${st.avg_frame_rate})`);
  process.exit(1);
}
if (st.r_frame_rate !== "24/1") {
  console.error(`[gate_motion_velocity_cadence] FAIL: Non-native frame rate detected (r_frame_rate=${st.r_frame_rate}, expected 24/1 CFR). Causes 24->30fps pulldown judder.`);
  process.exit(1);
}

const rawLuma = execSync(`ffmpeg -v error -i "${videoPath}" -vf "scale=64:36,format=gray" -f rawvideo pipe:1`, { maxBuffer: 64 * 1024 * 1024 });
const fb = 64 * 36;
const totalF = Math.floor(rawLuma.length / fb);

const frameSteps = [];
for (let f = 1; f < totalF; f++) {
  let diff = 0;
  for (let i = 0; i < fb; i++) diff += Math.abs(rawLuma[f * fb + i] - rawLuma[(f - 1) * fb + i]);
  const meanStep = diff / fb;
  if (meanStep < 28.0) frameSteps.push(meanStep);
}

const meanVel = frameSteps.length ? frameSteps.reduce((a, b) => a + b, 0) / frameSteps.length : 0;
const sorted = [...frameSteps].sort((a, b) => a - b);
const p90Vel = sorted.length ? sorted[Math.floor(sorted.length * 0.9)] : 0;

if (p90Vel > 2.65 || meanVel > 2.25) {
  console.error(`[gate_motion_velocity_cadence] FAIL: Speed-warped frame velocity detected (meanVel=${meanVel.toFixed(3)}, p90Vel=${p90Vel.toFixed(3)}; ceiling mean<=2.25, p90<=2.65). Video has been artificially accelerated via setpts.`);
  process.exit(1);
}

if (meanVel < 0.35 && totalF > 24) {
  console.error(`[gate_motion_velocity_cadence] FAIL: Motion velocity too low (meanVel=${meanVel.toFixed(3)} < 0.35). Video is frozen or near-static.`);
  process.exit(1);
}

console.log(JSON.stringify({
  gate: "gate_motion_velocity_cadence",
  passed: true,
  r_frame_rate: st.r_frame_rate,
  frames: totalF,
  meanLumaVelocity: Number(meanVel.toFixed(3)),
  p90LumaVelocity: Number(p90Vel.toFixed(3))
}));
