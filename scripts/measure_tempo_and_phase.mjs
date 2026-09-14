#!/usr/bin/env node
/**
 * Measures BPM *and* beat phase of an audio file.
 *
 * The previous pipeline measured tempo but assumed the first beat sat at t=0.
 * That is only true by luck. Selecting a 30s window out of a longer song makes
 * phase essential: if the window does not start on a downbeat, every cut in the
 * video is off the grid no matter how precisely the bar length is computed.
 *
 * Onset-envelope autocorrelation for period, then a pulse-train correlation
 * across one beat period for phase.
 *
 * Usage: node scripts/measure_tempo_and_phase.mjs <remoteAudioPath> [analyseSec]
 *   remoteAudioPath is a path on Cloudtop (ffmpeg does not exist on the Mac).
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const HOST = "nitinagga.c.googlers.com";
const SRC = process.argv[2];
const SECS = parseFloat(process.argv[3] || "60");
const SR = 8000, HOP = 64;
if (!SRC) { console.error("usage: measure_tempo_and_phase.mjs <remoteAudioPath> [seconds]"); process.exit(1); }

const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 });
const tmpLocal = "/tmp/tempo_env.pcm";
sh(`ssh -o ConnectTimeout=20 ${HOST} 'ffmpeg -y -v error -i ${SRC} -t ${SECS} -ac 1 -ar ${SR} -f s16le /tmp/tempo_env.pcm'`);
sh(`scp -q ${HOST}:/tmp/tempo_env.pcm ${tmpLocal}`);

const buf = fs.readFileSync(tmpLocal);
const n = buf.length / 2;
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(i * 2) / 32768;

// Onset envelope: frame RMS, then half-wave rectified first difference. The
// rectification matters - we want energy INCREASES (attacks), not decays.
const FRAMES = Math.floor(n / HOP);
const energy = new Float32Array(FRAMES);
for (let f = 0; f < FRAMES; f++) {
  let s = 0; for (let i = 0; i < HOP; i++) { const v = x[f * HOP + i]; s += v * v; }
  energy[f] = Math.sqrt(s / HOP);
}
const onset = new Float32Array(FRAMES);
for (let f = 1; f < FRAMES; f++) onset[f] = Math.max(0, energy[f] - energy[f - 1]);

// zero-mean so autocorrelation is not dominated by the DC component
let mean = 0; for (let f = 0; f < FRAMES; f++) mean += onset[f];
mean /= FRAMES;
const o = new Float32Array(FRAMES);
for (let f = 0; f < FRAMES; f++) o[f] = onset[f] - mean;

const fps = SR / HOP;                       // onset frames per second
const minBpm = 70, maxBpm = 180;
const lagMin = Math.floor(fps * 60 / maxBpm);
const lagMax = Math.ceil(fps * 60 / minBpm);

let best = { score: -Infinity, lag: 0 };
for (let lag = lagMin; lag <= lagMax; lag++) {
  let s = 0;
  for (let f = 0; f + lag < FRAMES; f++) s += o[f] * o[f + lag];
  s /= (FRAMES - lag);
  if (s > best.score) best = { score: s, lag };
}

// Parabolic interpolation around the peak for sub-frame precision.
const y = l => { let s = 0; for (let f = 0; f + l < FRAMES; f++) s += o[f] * o[f + l]; return s / (FRAMES - l); };
const y0 = y(best.lag - 1), y1 = best.score, y2 = y(best.lag + 1);
const denom = (y0 - 2 * y1 + y2);
const delta = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
const lagF = best.lag + delta;
const beatSec = lagF / fps;
const bpm = 60 / beatSec;

// Phase: slide a pulse train of one-beat spacing across a single beat period
// and take the offset with the most onset energy underneath it.
let bestPhase = { score: -Infinity, off: 0 };
const steps = Math.max(1, Math.round(lagF));
for (let s0 = 0; s0 < steps; s0++) {
  let s = 0, k = 0;
  for (let f = s0; f < FRAMES; f += lagF) { s += onset[Math.round(f)] || 0; k++; }
  if (k > 0 && s / k > bestPhase.score) bestPhase = { score: s / k, off: s0 };
}
const phaseSec = bestPhase.off / fps;

// Downbeats every 4 beats from the detected phase.
const barSec = beatSec * 4;
const downbeats = [];
for (let t = phaseSec; t < SECS && downbeats.length < 40; t += barSec) downbeats.push(+t.toFixed(4));

const out = {
  source: SRC, analysed_sec: SECS,
  bpm: +bpm.toFixed(2), beat_sec: +beatSec.toFixed(5), bar_sec: +barSec.toFixed(5),
  first_beat_offset_sec: +phaseSec.toFixed(4),
  downbeats_sec: downbeats
};
console.log(JSON.stringify(out, null, 2));
fs.writeFileSync("/tmp/tempo_phase.json", JSON.stringify(out, null, 2));
