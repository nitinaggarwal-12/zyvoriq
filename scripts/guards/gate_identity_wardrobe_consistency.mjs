#!/usr/bin/env node
/**
 * GATE - IDENTITY & WARDROBE CONSISTENCY (multimodal)
 * ==================================================
 * The first cut of the coastal reel passed every numeric gate with zero
 * warnings while showing two visibly different women in different outfits.
 * Loudness, PSNR, downbeat offset and duration are all necessary and none of
 * them can see a face. This gate closes that hole by actually looking at the
 * frames.
 *
 * It extracts one frame per shot from the master, sends them together with the
 * canonical casting descriptor and wardrobe lock to a vision model, and asks
 * for a per-frame verdict plus a cross-frame same-person judgement.
 *
 * Usage: node scripts/guards/gate_identity_wardrobe_consistency.mjs <workdir>
 * Exit 0 = pass, 1 = fail. Writes identity_audit.json into the workdir.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY / GOOGLE_API_KEY not set"); process.exit(1); }

// --- configuration -----------------------------------------------------
// Everything that used to be hardcoded to the first coastal reel is now a
// flag, because a gate that only runs against one production is not a gate.
//   node gate_identity_wardrobe_consistency.mjs <workdir> [options]
//     --plan     <file>  shot list, relative to workdir (default omni_directorial_plan.json)
//     --lock     <file>  casting/wardrobe lock source  (default = --plan)
//     --master   <file>  master video, relative to workdir (default master_30s.mp4)
//     --remote   <dir>   Cloudtop workdir (default ~/zyvoriq/scratch/<basename of workdir>)
const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const positional = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));

const WORK = path.resolve(positional[0] || "/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s");
const HOST = "nitinagga.c.googlers.com";
const REMOTE = flag("remote", `~/zyvoriq/scratch/${path.basename(WORK)}`);
const MASTER = flag("master", "master_30s.mp4");
const PLAN_FILE = flag("plan", "omni_directorial_plan.json");
const LOCK_FILE = flag("lock", PLAN_FILE);
const MODEL = "models/gemini-2.5-pro";

const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const rx = c => sh(`ssh -o ConnectTimeout=20 ${HOST} '${c.replace(/'/g, "'\\''")}'`);

const readPlan = f => {
  const p = path.isAbsolute(f) ? f : path.join(WORK, f);
  if (!fs.existsSync(p)) { console.error(`FATAL: no such plan file: ${p}`); process.exit(1); }
  return JSON.parse(fs.readFileSync(p, "utf-8"));
};
const plan = readPlan(PLAN_FILE);
// The casting/wardrobe lock may live in a different plan to the shot list:
// v2 reuses the v1 casting so the performer is not re-rolled between cuts.
const lock = LOCK_FILE === PLAN_FILE ? plan : readPlan(LOCK_FILE);
if (!lock.casting_descriptor) { console.error(`FATAL: ${LOCK_FILE} has no casting_descriptor (run stage 0b).`); process.exit(1); }

// One frame per shot, sampled at the shot's midpoint so we catch the settled
// look rather than a motion-blurred transition frame.
const frameDir = path.join(WORK, "identity_frames");
fs.mkdirSync(frameDir, { recursive: true });
let acc = 0;
const samples = [];
for (const s of plan.shots) {
  // Prefer the plan's own absolute timings when it has them (v2 windows a
  // longer song, so cumulative duration is not the same as start_sec).
  const t = Number.isFinite(s.start_sec) && Number.isFinite(s.end_sec)
    ? (s.start_sec + s.end_sec) / 2
    : acc + s.duration_sec / 2;
  // `singing` drives the conditional mouth check below. When a plan does not
  // declare it we must not invent a value: unknown means "do not assert".
  samples.push({ shot: s.index, t: +t.toFixed(3), singing: typeof s.singing === "boolean" ? s.singing : null });
  acc += s.duration_sec;
}

console.log(`Extracting one frame per shot from ${MASTER} (ffmpeg runs on Cloudtop)...`);
const parts = [];
for (const smp of samples) {
  const remoteJpg = `${REMOTE}/identity_${smp.shot}.jpg`;
  rx(`ffmpeg -y -v error -ss ${smp.t} -i ${REMOTE}/${MASTER} -vframes 1 -q:v 2 ${remoteJpg}`);
  const local = path.join(frameDir, `shot_${String(smp.shot).padStart(2, "0")}_t${smp.t}.jpg`);
  sh(`scp -q ${HOST}:${remoteJpg} "${local}"`);
  parts.push({ shot: smp.shot, t: smp.t, singing: smp.singing, file: local });
  const tag = smp.singing === null ? "singing unknown" : smp.singing ? "SINGING" : "instrumental";
  console.log(`  shot ${smp.shot} @ ${smp.t}s (${tag}) -> ${path.basename(local)}`);
}

const QUESTION = `You are a forensic continuity supervisor reviewing ${parts.length} frames from a single 30-second music video. They are supplied in shot order: ${parts.map(p => p.shot).join(", ")}.

The production locked ONE performer and ONE outfit. Here is the contract.

CASTING LOCK:
${lock.casting_descriptor}

WARDROBE LOCK:
${lock.wardrobe}

Examine the frames closely and answer strictly as JSON, no markdown fence:
{
  "same_person_across_all_frames": true|false,
  "identity_confidence": 0.0-1.0,
  "identity_notes": "specific observable evidence - hair style and colour, face shape, jawline, visible freckles or marks, build. Cite which frames differ and how.",
  "wardrobe_consistent_across_all_frames": true|false,
  "wardrobe_notes": "describe the garment actually visible in EACH frame by number. Flag any change of colour, garment type or silhouette.",
  "casting_lock_contradicted": true|false,
  "casting_lock_contradiction_evidence": "only features that are VISIBLE and DISAGREE with the lock",
  "casting_details_not_verifiable": ["features the lock names that are simply too small or occluded to judge at this framing"],
  "matches_wardrobe_lock": true|false,
  "letterboxing_or_black_bars_visible": true|false,
  "jewellery_consistent_across_all_frames": true|false,
  "jewellery_notes": "describe the necklace in EACH frame by number - gauge (fine chain vs chunky/thick), metal colour, pendant or none. This production has repeatedly drifted here, so be pedantic.",
  "plastic_or_airbrushed_skin": true|false,
  "horizon_level_in_all_frames": true|false,
  "per_frame": [{"shot":1,"garment":"...","hair":"...","mouth_articulating":true|false,"expression":"...","concerns":"..."}],
  "verdict": "PASS"|"FAIL",
  "blocking_defects": ["..."]
}

Be strict and literal. If two frames show people you would not identify as the same individual in a line-up, say false. Report only what is visible; do not assume continuity.

IMPORTANT distinction for the casting lock. These frames are mostly full-body at distance, so fine details such as a small freckle cluster, eye colour or a tooth gap are often simply not resolvable. That is NOT a defect.
- Set "casting_lock_contradicted" true ONLY when a feature is clearly visible AND clearly disagrees with the lock (for example the lock says a single heavy braid and the frame shows loose flowing hair).
- If a feature is merely too small, blurred or occluded to judge, list it under "casting_details_not_verifiable" and do NOT treat it as a contradiction.`;

const body = {
  contents: [{
    parts: [
      { text: QUESTION },
      ...parts.map(p => ({
        inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(p.file).toString("base64") }
      }))
    ]
  }],
  generationConfig: { temperature: 0 }
};

console.log(`\nSubmitting ${parts.length} frames to ${MODEL} ...`);
const t0 = Date.now();
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body), signal: AbortSignal.timeout(300000)
});
const txt = await res.text();

// Receipt it like every other model call - this gate is itself a model invocation.
// Receipt path differs by production layout: v1 uses a provenance/ directory,
// v2 writes a flat provenance.jsonl. Appending into a path whose parent is a
// regular file throws ENOTDIR, so resolve it rather than assume.
const provDir = path.join(WORK, "provenance");
const receiptPath = fs.existsSync(provDir) && fs.statSync(provDir).isDirectory()
  ? path.join(provDir, "gates.receipts.jsonl")
  : path.join(WORK, "gate_receipts.jsonl");
fs.appendFileSync(receiptPath, JSON.stringify({
  stage: "gate_identity_wardrobe_consistency", model: MODEL,
  endpoint: `${MODEL}:generateContent`, http_status: res.status,
  request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"),
  response_bytes: txt.length, started_at: new Date(t0).toISOString(), duration_ms: Date.now() - t0
}) + "\n");

if (!res.ok) { console.error(`FATAL: vision audit HTTP ${res.status}: ${txt.slice(0, 400)}`); process.exit(1); }

let out = JSON.parse(txt)?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("") || "";
out = out.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();

let verdict;
try { verdict = JSON.parse(out); }
catch { console.error("FATAL: vision model did not return parseable JSON:\n" + out.slice(0, 1200)); process.exit(1); }

fs.writeFileSync(path.join(WORK, "identity_audit.json"),
  JSON.stringify({ model: MODEL, frames: parts.map(p => ({ shot: p.shot, t: p.t, file: p.file })), verdict }, null, 2));

console.log("\n=== IDENTITY / WARDROBE VISION AUDIT ===");
const line = (c, m) => console.log("  " + (c ? "PASS " : "FAIL ") + m);
line(verdict.same_person_across_all_frames, `same person across all ${parts.length} frames (confidence ${verdict.identity_confidence})`);
line(!verdict.casting_lock_contradicted, "no visible feature contradicts the casting lock");
if (verdict.casting_lock_contradicted) console.log("       evidence: " + (verdict.casting_lock_contradiction_evidence || ""));
if (verdict.casting_details_not_verifiable?.length)
  console.log("       (not resolvable at this framing, not counted as defects: " + verdict.casting_details_not_verifiable.join("; ") + ")");
line(verdict.wardrobe_consistent_across_all_frames, `wardrobe consistent across all ${parts.length} frames`);
line(verdict.matches_wardrobe_lock, "wardrobe matches the wardrobe lock");
line(!verdict.letterboxing_or_black_bars_visible, "no letterboxing / black bars");
line(verdict.jewellery_consistent_across_all_frames !== false, "jewellery consistent (gauge and metal) across all frames");

// --- mouth articulation, conditional on the vocal timeline -------------
// This used to be an unconditional "mouth closed in all frames" assertion.
// That is correct ONLY for an instrumental window. Applied to a music video
// it inverts the goal: it rewards a performer who never sings, which is
// exactly how the first cut passed every gate and was rejected on sight.
// A closed mouth is a defect during vocals; an open mouth is a defect during
// instrumentals. The rule is conditional, so the gate must be too.
const byShot = new Map((verdict.per_frame || []).map(f => [f.shot, f]));
const judged = parts
  .map(p => ({ ...p, obs: byShot.get(p.shot) }))
  .filter(p => p.obs && typeof p.obs.mouth_articulating === "boolean");

const phantom = judged.filter(p => p.singing === false && p.obs.mouth_articulating);
const singingShots = judged.filter(p => p.singing === true);
const silentDuringVocals = singingShots.filter(p => !p.obs.mouth_articulating);
const unknownSinging = parts.filter(p => p.singing === null).length;

if (unknownSinging === parts.length) {
  console.log("  SKIP  mouth articulation - plan declares no per-shot `singing` flag, nothing to assert against");
} else {
  line(phantom.length === 0,
    `no phantom mouthing on instrumental shots (${phantom.length} offending: ${phantom.map(p => p.shot).join(", ") || "none"})`);
  // Not every singing shot shows an open mouth at its exact midpoint - a
  // consonant or a breath between lines is legitimately closed. The failure
  // we care about is a performer who never articulates at all.
  const anyArticulation = singingShots.length === 0 || singingShots.length > silentDuringVocals.length;
  line(anyArticulation,
    `performer visibly articulates on singing shots (${singingShots.length - silentDuringVocals.length}/${singingShots.length})`);
}
line(!verdict.plastic_or_airbrushed_skin, "skin is not plastic / airbrushed");
line(verdict.horizon_level_in_all_frames, "horizon level in all frames");

console.log("\n  identity_notes: " + (verdict.identity_notes || ""));
console.log("  wardrobe_notes: " + (verdict.wardrobe_notes || ""));
if (verdict.jewellery_notes) console.log("  jewellery_notes: " + verdict.jewellery_notes);
if (Array.isArray(verdict.per_frame)) {
  console.log("\n  per-frame:");
  for (const f of verdict.per_frame) {
    const expected = parts.find(p => p.shot === f.shot)?.singing;
    const tag = expected === null || expected === undefined ? "" :
      ` | expect ${expected ? "singing" : "instrumental"}, mouth ${f.mouth_articulating ? "open" : "closed"}`;
    console.log(`    shot ${f.shot}: ${f.garment} | ${f.hair} | ${f.expression || "-"}${tag} | ${f.concerns || "-"}`);
  }
}
if (verdict.blocking_defects?.length) {
  console.log("\n  BLOCKING DEFECTS:");
  for (const d of verdict.blocking_defects) console.log("    - " + d);
}

// Deliberately does NOT gate on verdict.verdict: the model tends to return FAIL
// when it merely could not confirm a detail. Gate on the specific observable
// conditions instead, each of which is a genuine, visible defect.
const pass =
  verdict.same_person_across_all_frames &&
  !verdict.casting_lock_contradicted &&
  verdict.wardrobe_consistent_across_all_frames &&
  verdict.matches_wardrobe_lock &&
  !verdict.letterboxing_or_black_bars_visible &&
  verdict.jewellery_consistent_across_all_frames !== false &&
  !verdict.plastic_or_airbrushed_skin &&
  verdict.horizon_level_in_all_frames &&
  phantom.length === 0 &&
  (singingShots.length === 0 || singingShots.length > silentDuringVocals.length);

console.log(`\n${pass ? "GATE PASS" : "GATE FAIL"} - report: ${path.join(WORK, "identity_audit.json")}`);
process.exit(pass ? 0 : 1);
