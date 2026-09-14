#!/usr/bin/env node
/**
 * GATE - TEMPORAL MOUTH ARTICULATION
 * ==================================
 * A single mid-shot frame cannot distinguish the two cases that matter:
 *   (a) the mouth opens briefly through physical exertion or a breath - normal,
 *       expected in dance, and not a defect;
 *   (b) the mouth articulates continuously, changing shape frame to frame as if
 *       forming words - phantom mouthing, which is a hard reject because the
 *       soundtrack carries no vocals for those lips to belong to.
 * Telling them apart requires a time series, so this gate samples densely
 * across a window and judges the sequence rather than any one frame.
 *
 * Usage: node gate_temporal_mouth_articulation.mjs <startSec> <endSec> [stepSec]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const WORK = "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s";
const HOST = "nitinagga.c.googlers.com";
const REMOTE = "~/zyvoriq/scratch/coastal_synthpop_30s";
const MODEL = "models/gemini-2.5-pro";

const START = parseFloat(process.argv[2] ?? "17.5");
const END = parseFloat(process.argv[3] ?? "30.0");
const STEP = parseFloat(process.argv[4] ?? "0.75");

const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const rx = c => sh(`ssh -o ConnectTimeout=20 ${HOST} '${c.replace(/'/g, "'\\''")}'`);

const dir = path.join(WORK, "mouth_frames");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

// Crop tightly to the upper-centre of the frame so the mouth occupies enough
// pixels to judge. A full-body 720x1280 frame renders the lips at ~20px tall,
// which is why the single-frame audit could only say "slightly parted".
const times = [];
for (let t = START; t <= END + 1e-9; t += STEP) times.push(+t.toFixed(2));

console.log(`Sampling ${times.length} frames from ${START}s to ${END}s every ${STEP}s (face-cropped)...`);
const files = [];
for (const t of times) {
  const r = `${REMOTE}/mouth_${t}.jpg`;
  rx(`ffmpeg -y -v error -ss ${t} -i ${REMOTE}/master_30s.mp4 -vframes 1 -vf "crop=380:380:170:180,scale=512:512" -q:v 2 ${r}`);
  const l = path.join(dir, `t_${String(t).padStart(6, "0")}.jpg`);
  sh(`scp -q ${HOST}:${r} "${l}"`);
  files.push({ t, l });
}
rx(`rm -f ${REMOTE}/mouth_*.jpg`);
console.log(`  extracted ${files.length} face crops -> ${dir}`);

const QUESTION = `These are ${files.length} sequential face crops from a dance video, sampled every ${STEP} seconds from ${START}s to ${END}s, in chronological order. The soundtrack is PURELY INSTRUMENTAL - there are no vocals anywhere in it, so the performer must never look like she is singing or speaking.

For each frame judge the mouth state, then judge the SEQUENCE as a whole.

Distinguish carefully:
- EXERTION/BREATH: mouth opens in a relaxed, static or slowly-changing way - a held open mouth, a breath, a grin, a neutral parted jaw during physical effort. Normal for dance. NOT a defect.
- ARTICULATION: mouth shape changes rapidly and distinctly between consecutive frames in the way lips do when forming consonants and vowels - lip rounding, lip closure then release, teeth-on-lip, tongue visible, corners pulling in and out. This is phantom mouthing and IS a defect.

Answer strictly as JSON, no markdown fence:
{
  "frames": [{"index":0,"approx_time_sec":${START},"mouth":"closed|parted|open|wide","note":"short"}],
  "fraction_frames_mouth_open_or_wide": 0.0-1.0,
  "articulation_detected": true|false,
  "articulation_evidence": "cite specific consecutive frame indices and the shape changes seen, or state that shapes are static/slowly varying",
  "reads_as_singing_to_a_viewer": true|false,
  "assessment": "EXERTION_ONLY|ARTICULATION|AMBIGUOUS",
  "recommendation": "ACCEPT|REGENERATE",
  "reasoning": "2-3 sentences"
}`;

const body = {
  contents: [{
    parts: [
      { text: QUESTION },
      ...files.map(f => ({ inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(f.l).toString("base64") } }))
    ]
  }],
  generationConfig: { temperature: 0 }
};

console.log(`Submitting to ${MODEL} ...`);
const t0 = Date.now();
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body), signal: AbortSignal.timeout(300000)
});
const txt = await res.text();
fs.appendFileSync(path.join(WORK, "provenance", "gates.receipts.jsonl"), JSON.stringify({
  stage: "gate_temporal_mouth_articulation", model: MODEL, endpoint: `${MODEL}:generateContent`,
  http_status: res.status, request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"),
  response_bytes: txt.length, started_at: new Date(t0).toISOString(), duration_ms: Date.now() - t0,
  window: [START, END], step: STEP
}) + "\n");
if (!res.ok) { console.error(`FATAL HTTP ${res.status}: ${txt.slice(0, 400)}`); process.exit(1); }

let out = JSON.parse(txt)?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("") || "";
out = out.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();
let v; try { v = JSON.parse(out); } catch { console.error("Unparseable:\n" + out.slice(0, 1500)); process.exit(1); }

fs.writeFileSync(path.join(WORK, "mouth_audit.json"), JSON.stringify({ model: MODEL, window: [START, END], step: STEP, verdict: v }, null, 2));

console.log("\n=== TEMPORAL MOUTH ARTICULATION ===");
for (const f of v.frames || []) console.log(`  t=${String(f.approx_time_sec).padStart(6)}s  ${String(f.mouth).padEnd(7)}  ${f.note || ""}`);
console.log(`\n  frames open/wide : ${((v.fraction_frames_mouth_open_or_wide ?? 0) * 100).toFixed(0)}%`);
console.log(`  articulation     : ${v.articulation_detected}`);
console.log(`  evidence         : ${v.articulation_evidence}`);
console.log(`  reads as singing : ${v.reads_as_singing_to_a_viewer}`);
console.log(`  assessment       : ${v.assessment}`);
console.log(`  recommendation   : ${v.recommendation}`);
console.log(`  reasoning        : ${v.reasoning}`);

const pass = !v.articulation_detected && !v.reads_as_singing_to_a_viewer && v.assessment !== "ARTICULATION";
console.log(`\n${pass ? "GATE PASS - exertion only, not phantom mouthing" : "GATE FAIL - phantom mouthing risk"}`);
process.exit(pass ? 0 : 1);
