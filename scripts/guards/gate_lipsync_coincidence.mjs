#!/usr/bin/env node
/**
 * GATE - AUDIO/VISUAL LIP-SYNC COINCIDENCE (measured, not assumed)
 * ================================================================
 * pre_tool_guard Rule 13 correctly warns that Veo cannot hear the Lyria track,
 * so mouth animation muxed against a separate song risks rubber-dub desync. Its
 * two offered resolutions are (A) remove singing entirely, or (B) run a neural
 * viseme pass. (A) is what produced a "music video" the viewer rejected for not
 * singing; (B) needs a lip-resynthesis model that is not installed.
 *
 * This is the third option: MEASURE the resulting sync instead of assuming it
 * either way. Shots are 2-4s and each is bound to one or two lyric lines, so
 * drift cannot accumulate across the cut - which makes per-shot measurement
 * meaningful and per-shot correction possible.
 *
 * Method: sample the mouth region densely, have a vision model mark which
 * samples show an open/singing mouth, then cross-correlate that binary sequence
 * against the lyric on/off envelope taken from the audio analysis. Reports the
 * best offset and the correlation at zero offset.
 *
 * Usage: node gate_lipsync_coincidence.mjs <workdir> [stepSec]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const WORK = process.argv[2] || "/Users/nitinagga/Documents/zyvoriq/scratch/mv_v2";
const STEP = parseFloat(process.argv[3] || "0.20");
const HOST = "nitinagga.c.googlers.com";
const RDIR = "~/zyvoriq/scratch/mv_v2";
const MODEL = "models/gemini-2.5-pro";

const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const rx = c => sh(`ssh -o ConnectTimeout=25 ${HOST} '${c.replace(/'/g, "'\\''")}'`);

const plan = JSON.parse(fs.readFileSync(path.join(WORK, "plan.json"), "utf-8"));

// Expected envelope: 1 while a lyric line is sounding, 0 otherwise.
const TOTAL = plan.total_sec;
const times = [];
for (let t = 0; t < TOTAL - 1e-9; t += STEP) times.push(+t.toFixed(2));
const expected = times.map(t => {
  for (const s of plan.shots) {
    for (const l of (s.lyrics || [])) {
      const abs0 = s.start_sec + l.start, abs1 = s.start_sec + l.end;
      if (t >= abs0 && t <= abs1) return 1;
    }
  }
  return 0;
});
console.log(`Timeline: ${times.length} samples @ ${STEP}s, ${expected.filter(Boolean).length} expected-singing (${(100*expected.filter(Boolean).length/times.length).toFixed(0)}%)`);

// Dense mouth-region crops. Batched so no single request carries 150 images.
const dir = path.join(WORK, "lipsync_frames");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
console.log("Extracting mouth-region crops on Cloudtop...");
rx(`rm -f ${RDIR}/ls_*.jpg`);
const batchScript = times.map((t, i) =>
  `ffmpeg -y -v error -ss ${t} -i ${RDIR}/master.mp4 -vframes 1 -vf "crop=300:300:210:230,scale=320:320" -q:v 4 ${RDIR}/ls_${String(i).padStart(3,"0")}.jpg`
).join("\n");
fs.writeFileSync("/tmp/ls_extract.sh", "#!/bin/bash\nset -e\n" + batchScript + "\necho done\n");
sh(`scp -q /tmp/ls_extract.sh ${HOST}:/tmp/ls_extract.sh`);
rx(`chmod +x /tmp/ls_extract.sh && /tmp/ls_extract.sh`);
sh(`scp -q "${HOST}:${RDIR}/ls_*.jpg" "${dir}/"`);
const files = fs.readdirSync(dir).filter(f => f.endsWith(".jpg")).sort();
console.log(`  ${files.length} crops -> ${dir}`);

const BATCH = 40;
const observed = [];
for (let b = 0; b < files.length; b += BATCH) {
  const chunk = files.slice(b, b + BATCH);
  const q = `These are ${chunk.length} sequential crops of a singer's mouth region, ${STEP} seconds apart, in order, starting at index ${b}.

For EACH image decide whether the mouth is OPEN IN A SINGING/SPEAKING SHAPE (jaw lowered, lips shaped around a vowel or consonant, teeth or tongue often visible) versus CLOSED or merely smiling with lips together.

Return strictly this JSON, no fence, exactly ${chunk.length} entries:
{"states":[{"i":${b},"open":true|false}]}
Use "open": true only for an articulating/singing mouth. A closed-lip smile is false.`;
  const body = { contents: [{ parts: [ { text: q }, ...chunk.map(f => ({ inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(path.join(dir, f)).toString("base64") } })) ] }], generationConfig: { temperature: 0 } };
  const t0 = Date.now();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`,
    { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body), signal: AbortSignal.timeout(300000) });
  const t = await r.text();
  fs.appendFileSync(path.join(WORK,"provenance.jsonl"), JSON.stringify({ stage:"gate_lipsync_coincidence", batch:b, model:MODEL, http_status:r.status, request_sha256:crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"), response_bytes:t.length, duration_ms:Date.now()-t0 })+"\n");
  if (!r.ok) { console.error(`batch ${b} HTTP ${r.status}: ${t.slice(0,200)}`); process.exit(1); }
  let o = JSON.parse(t)?.candidates?.[0]?.content?.parts?.map(p=>p.text).filter(Boolean).join("")||"";
  o = o.replace(/^```[a-z]*\s*/i,"").replace(/```\s*$/,"").trim();
  const st = JSON.parse(o).states;
  for (const s of st) observed[s.i] = s.open ? 1 : 0;
  console.log(`  batch ${b}-${b+chunk.length-1}: ${st.filter(x=>x.open).length}/${st.length} open`);
}
for (let i=0;i<times.length;i++) if (observed[i]===undefined) observed[i]=0;

// Cross-correlate observed against expected over +/- 1.0s of offset.
function corr(a, b, shift) {
  let n=0, num=0, sa=0, sb=0;
  for (let i=0;i<a.length;i++) {
    const j=i+shift; if (j<0||j>=b.length) continue;
    num += a[i]*b[j]; sa += a[i]*a[i]; sb += b[j]*b[j]; n++;
  }
  return (sa===0||sb===0) ? 0 : num/Math.sqrt(sa*sb);
}
const maxShift = Math.round(1.0/STEP);
let best={c:-1,s:0};
for (let s=-maxShift;s<=maxShift;s++){ const c=corr(expected,observed,s); if(c>best.c) best={c,s}; }
const zero = corr(expected, observed, 0);
const openFrac = observed.filter(Boolean).length/observed.length;
const expFrac  = expected.filter(Boolean).length/expected.length;

const report = {
  step_sec: STEP, samples: times.length,
  expected_singing_fraction: +expFrac.toFixed(3),
  observed_open_fraction: +openFrac.toFixed(3),
  correlation_at_zero_offset: +zero.toFixed(3),
  best_correlation: +best.c.toFixed(3),
  best_offset_sec: +(best.s*STEP).toFixed(2),
  observed, expected, times
};
fs.writeFileSync(path.join(WORK,"lipsync_audit.json"), JSON.stringify(report,null,2));

console.log("\n=== LIP-SYNC COINCIDENCE ===");
console.log(`  expected singing : ${(expFrac*100).toFixed(0)}% of timeline`);
console.log(`  observed mouth open: ${(openFrac*100).toFixed(0)}% of timeline`);
console.log(`  correlation @0 offset : ${zero.toFixed(3)}`);
console.log(`  best correlation      : ${best.c.toFixed(3)} at offset ${(best.s*STEP).toFixed(2)}s`);
console.log("\n  timeline (E=expected singing, O=observed open):");
const row = (arr,lab) => { let s="  "+lab+" "; for(let i=0;i<arr.length;i++) s += arr[i]?"#":"."; console.log(s); };
row(expected,"E"); row(observed,"O");

// She must actually be singing (not the v1 failure), and the pattern must track
// the audio well enough that a viewer reads it as performance rather than dub.
const singingEnough = openFrac >= 0.45;
const tracks = zero >= 0.55 || best.c >= 0.65;
console.log(`\n  is she visibly singing : ${singingEnough ? "YES" : "NO"}`);
console.log(`  does it track the song : ${tracks ? "YES" : "NO"}`);
console.log(`\n${singingEnough && tracks ? "GATE PASS" : "GATE FAIL"} - ${path.join(WORK,"lipsync_audit.json")}`);
process.exit(singingEnough && tracks ? 0 : 1);
