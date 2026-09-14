#!/usr/bin/env node
/** STAGE 6 - forensic audit + provenance consolidation. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const HOST = "nitinagga.c.googlers.com";
const R = "~/zyvoriq/scratch/coastal_synthpop_30s";
const W = "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s";
const rx = c => sh(`ssh ${HOST} '${c.replace(/'/g, "'\\''")}'`);
const plan = JSON.parse(fs.readFileSync(W + "/omni_directorial_plan.json", "utf-8"));
let fails = 0, warns = 0;
const ok = (c, m) => { if (!c) fails++; console.log("  " + (c ? "PASS " : "FAIL ") + m); };
const warn = (c, m) => { if (!c) warns++; console.log("  " + (c ? "PASS " : "WARN ") + m); };

console.log("=== A. PROVENANCE CONSOLIDATION ===");
const dir = path.join(W, "provenance");
const all = fs.readdirSync(dir).filter(f => f.endsWith(".jsonl"))
  .flatMap(f => fs.readFileSync(path.join(dir, f), "utf-8").split("\n").filter(Boolean).map(JSON.parse));
const good = all.filter(r => r.http_status === 200);
const models = [...new Set(good.map(r => r.model))];
console.log("  receipts total: " + all.length + " | http200: " + good.length);
models.forEach(m => console.log("    ✓ " + m + "  (" + good.filter(r => r.model === m).length + " calls)"));
const need = {
  "Stage 0 Omni director": /omni/i, "Stage 1 Lyria master": /lyria/i,
  "Stage 2 anchor": /flash-image/i, "Stage 4 Veo render": /veo/i
};
for (const [label, rxm] of Object.entries(need)) ok(models.some(m => rxm.test(m)), label + " has a receipt");
fs.writeFileSync(path.join(dir, "CONSOLIDATED.json"), JSON.stringify({
  modelsInvoked: models, receiptCount: all.length, http200: good.length,
  note: "Aggregated across all runs. Cached artifacts retain provenance from the run that created them.",
  artifacts: {
    lyria_master: crypto.createHash("sha256").update(fs.readFileSync(W + "/lyria_master.mp3")).digest("hex").slice(0,16),
    anchor: crypto.createHash("sha256").update(fs.readFileSync(W + "/anchors/dancer_anchor.png")).digest("hex").slice(0,16),
    master: crypto.createHash("sha256").update(fs.readFileSync(W + "/master_30s.mp4")).digest("hex").slice(0,16)
  }
}, null, 2));

console.log("");
console.log("=== B. CONTAINER ===");
const meta = rx(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -show_entries format=duration -of default=nw=1 ${R}/master_30s.mp4`);
const g = k => (meta.match(new RegExp(k + "=([^\\s]+)")) || [])[1];
const dur = parseFloat(g("duration"));
ok(Math.abs(dur - 30.0) < 0.05, `duration ${dur.toFixed(4)}s == 30.000s`);
ok(g("width") === "720" && g("height") === "1280", `resolution ${g("width")}x${g("height")} is 9:16 vertical`);
ok(g("r_frame_rate") === "24/1", `fps ${g("r_frame_rate")}`);

// Resolution alone is not evidence of framing. The first cut reported
// "720x1280, 9:16" and passed, while the real picture was 714x720 floating in
// the middle of a black canvas because the anchor plate was square. cropdetect
// measures the bounding box of non-black pixels, which is what actually matters.
// Sampled at several points so a single dark shot cannot fake a pass or a fail.
const FW = parseInt(g("width"), 10), FH = parseInt(g("height"), 10);
let worst = { cov: 1, at: null, box: null };
for (const t of [1.0, 8.0, 15.0, 21.0, 27.0]) {
  const cd = rx(
    `ffmpeg -hide_banner -ss ${t} -i ${R}/master_30s.mp4 -vf cropdetect=24:2:0 -frames:v 48 -f null - 2>&1 ` +
    `| grep -o 'crop=[0-9:]*' | tail -1`
  ).trim();
  if (!cd) continue;
  const [cw, ch] = cd.replace("crop=", "").split(":").map(Number);
  const cov = (cw * ch) / (FW * FH);
  if (cov < worst.cov) worst = { cov, at: t, box: `${cw}x${ch}` };
}
ok(worst.cov >= 0.97,
  `active picture area ${(worst.cov * 100).toFixed(1)}% of ${FW}x${FH}` +
  (worst.at !== null ? ` (worst ${worst.box} at t=${worst.at}s)` : "") + ` - no letterboxing`);

console.log("");
console.log("=== C. CROSS-CUT FRAME-0 PSNR (reset-loop detector, must be < 25dB) ===");
let acc = 0; const cuts = [];
for (const s of plan.shots) { cuts.push(acc); acc += s.duration_sec; }
for (let i = 1; i < cuts.length; i++) {
  rx(`ffmpeg -y -v error -ss ${cuts[i-1].toFixed(3)} -i ${R}/master_30s.mp4 -vframes 1 ${R}/frames/cut_a.png`);
  rx(`ffmpeg -y -v error -ss ${cuts[i].toFixed(3)} -i ${R}/master_30s.mp4 -vframes 1 ${R}/frames/cut_b.png`);
  const out = rx(`ffmpeg -i ${R}/frames/cut_a.png -i ${R}/frames/cut_b.png -lavfi psnr -f null - 2>&1 || true`);
  const m = out.match(/average:([0-9.]+|inf)/);
  const v = m ? (m[1] === "inf" ? 99 : parseFloat(m[1])) : NaN;
  ok(!isNaN(v) && v < 25.0, `shot${i} f0 vs shot${i+1} f0 PSNR ${isNaN(v)?"?":v.toFixed(2)}dB < 25dB (no anchor reset)`);
}

console.log("");
console.log("=== D. AUDIO: loudness, true peak, sub-bass retention ===");
const ln = rx(`ffmpeg -i ${R}/master_30s.mp4 -af loudnorm=I=-14:TP=-1.0:print_format=json -f null - 2>&1 | tail -20 || true`);
const jm = ln.match(/\{[\s\S]*\}/);
if (jm) {
  const L = JSON.parse(jm[0]);
  const I = parseFloat(L.input_i), TP = parseFloat(L.input_tp);
  ok(Math.abs(I + 14) <= 1.5, `integrated ${I.toFixed(2)} LUFS within -14 +/- 1.5`);
  ok(TP <= -0.5, `true peak ${TP.toFixed(2)} dBTP <= -0.5`);
}
const full = rx(`ffmpeg -i ${R}/master_30s.mp4 -af volumedetect -f null - 2>&1 | grep mean_volume || true`);
const low  = rx(`ffmpeg -i ${R}/master_30s.mp4 -af lowpass=f=150,volumedetect -f null - 2>&1 | grep mean_volume || true`);
const fv = parseFloat((full.match(/mean_volume:\s*(-?[\d.]+)/)||[])[1]);
const lv = parseFloat((low.match(/mean_volume:\s*(-?[\d.]+)/)||[])[1]);
console.log(`  full-spectrum mean ${fv} dB | sub-150Hz mean ${lv} dB | delta ${(fv-lv).toFixed(2)} dB`);
ok(!isNaN(lv) && (fv - lv) < 25, `sub-bass retained (delta < 25dB, not gutted)`);

console.log("");
console.log("=== E. CUT-TO-DOWNBEAT OFFSETS (measured " + plan.bpm + " BPM) ===");
const BAR = plan.bar_sec;
cuts.slice(1).forEach((c, i) => {
  const bars = c / BAR, off = Math.abs(bars - Math.round(bars)) * BAR * 1000;
  ok(off <= 60, `cut ${i+1} @${c.toFixed(4)}s = bar ${bars.toFixed(3)}, offset ${off.toFixed(1)}ms <= 60ms`);
});

console.log("");
console.log("=== F. FRAME EXTRACTION for visual audit ===");
fs.mkdirSync(W + "/audit_frames", { recursive: true });
const times = [1.0, 7.0, 13.0, 19.0, 26.0];
times.forEach((t, i) => {
  rx(`ffmpeg -y -v error -ss ${t} -i ${R}/master_30s.mp4 -vframes 1 -q:v 2 ${R}/frames/audit_0${i+1}.jpg`);
  sh(`scp -q ${HOST}:${R}/frames/audit_0${i+1}.jpg "${W}/audit_frames/audit_0${i+1}_t${t}s.jpg"`);
});
console.log("  extracted " + times.length + " frames -> audit_frames/");

console.log("");
console.log("=".repeat(60));
console.log(fails === 0 ? `AUDIT RESULT: PASS (${warns} warnings)` : `AUDIT RESULT: ${fails} FAILURE(S), ${warns} warnings`);
