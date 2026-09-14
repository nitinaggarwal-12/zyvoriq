#!/usr/bin/env node
/**
 * Measures the ACTUAL tempo of the generated master.
 * The cut grid depends entirely on BPM; assuming the prompted value would
 * silently break downbeat alignment if Lyria delivered a different tempo.
 * Onset-envelope autocorrelation over decoded PCM.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 });
const HOST = "nitinagga.c.googlers.com";
const RDIR = "~/zyvoriq/scratch/coastal_synthpop_30s";
const LOCAL = "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s";
const SR = 8000;

// mono 8kHz PCM of the first 40s
sh(`ssh ${HOST} 'ffmpeg -y -v error -i ${RDIR}/lyria_master.mp3 -t 40 -ac 1 -ar ${SR} -f s16le ${RDIR}/env.pcm'`);
sh(`scp -q ${HOST}:${RDIR}/env.pcm ${LOCAL}/env.pcm`);

const buf = fs.readFileSync(`${LOCAL}/env.pcm`);
const n = buf.length / 2;
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = buf.readInt16LE(i * 2) / 32768;

// onset envelope: frame energy, then half-wave rectified first difference
const HOP = 64, FRAMES = Math.floor(n / HOP);
const energy = new Float32Array(FRAMES);
for (let f = 0; f < FRAMES; f++) {
  let s = 0; for (let i = 0; i < HOP; i++) { const v = x[f * HOP + i]; s += v * v; }
  energy[f] = Math.sqrt(s / HOP);
}
const onset = new Float32Array(FRAMES);
for (let f = 1; f < FRAMES; f++) onset[f] = Math.max(0, energy[f] - energy[f - 1]);
let mean = 0; for (const v of onset) mean += v; mean /= FRAMES;
for (let f = 0; f < FRAMES; f++) onset[f] -= mean;

const fps = SR / HOP;                       // envelope frames per second
const best = { bpm: 0, score: -Infinity };
for (let bpm = 60; bpm <= 180; bpm += 0.1) {
  const lag = Math.round((60 / bpm) * fps);
  if (lag < 2 || lag >= FRAMES / 2) continue;
  let s = 0, c = 0;
  for (let f = 0; f + lag < FRAMES; f++) { s += onset[f] * onset[f + lag]; c++; }
  const score = s / c;
  if (score > best.score) { best.score = score; best.bpm = bpm; }
}
// resolve octave ambiguity into a danceable range
let bpm = best.bpm;
while (bpm < 90) bpm *= 2;
while (bpm > 180) bpm /= 2;

const bar = (60 / bpm) * 4;
console.log("measured_bpm      : " + bpm.toFixed(2));
console.log("prompted_bpm      : 118");
console.log("delta             : " + (bpm - 118).toFixed(2) + " bpm");
console.log("bar_sec           : " + bar.toFixed(4));
console.log("3_bar_shot_sec    : " + (bar * 3).toFixed(4));
console.log("4x3bar + remainder: " + (bar * 12).toFixed(4) + " + " + (30 - bar * 12).toFixed(4));
fs.writeFileSync(`${LOCAL}/measured_tempo.json`, JSON.stringify({
  measured_bpm: Number(bpm.toFixed(2)), prompted_bpm: 118,
  bar_sec: Number(bar.toFixed(4)),
  shot_durations: [bar*3, bar*3, bar*3, bar*3, 30 - bar*12].map(d => Number(d.toFixed(4)))
}, null, 2));
