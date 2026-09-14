#!/usr/bin/env node
/**
 * COASTAL SYNTH-POP 30s - STAGES 1..5 RUNNER (omni_guard v5.1.5)
 * Stage 0 (Omni 1.1 director) must already have produced the plan.
 */
import fs from "node:fs";
import path from "node:path";
import {
  generateLyriaMaster, generateAnchor, dispatchVeo, receipt,
  PROD_ID, WORK, REMOTE_HOST, REMOTE_DIR, sh, remote, log, LEDGER
} from "./produce_coastal_synthpop_30s.mjs";

const PLAN = JSON.parse(fs.readFileSync(path.join(WORK, "omni_directorial_plan.json"), "utf-8"));

// Stage 0 receipt is a hard precondition for any generative spend.
const s0 = path.join(WORK, "provenance", "stage0.receipts.jsonl");
const s0ok = fs.existsSync(s0) && fs.readFileSync(s0, "utf-8").split("\n")
  .filter(Boolean).map(JSON.parse).some(r => r.http_status === 200);
if (!s0ok) { console.error("HALT: no Stage 0 director receipt with http_status 200."); process.exit(1); }
log(`✅ Stage 0 receipt verified. Production ${PROD_ID}\n`);

const shotsDir = path.join(WORK, "shots"), framesDir = path.join(WORK, "frames");
[shotsDir, framesDir, path.join(WORK, "anchors")].forEach(d => fs.mkdirSync(d, { recursive: true }));

// Stage 0b casting lock is equally a precondition. Without it the anchor model
// and Veo each invent their own performer, which is exactly how the first cut
// ended up with two visibly different women across the five shots.
if (!PLAN.anchor_prompt || !PLAN.casting_descriptor || !PLAN.identity_lock_block) {
  console.error("HALT: plan has no casting lock. Run scripts/omni_casting_stage0b.mjs first.");
  process.exit(1);
}
for (const s of PLAN.shots) {
  if (!s.veo_prompt.startsWith(PLAN.identity_lock_block)) {
    console.error(`HALT: shot ${s.index} prompt is missing the identity lock block.`);
    process.exit(1);
  }
}
log(`✅ Casting lock present (${PLAN.casting_descriptor.length} chars) and injected into all ${PLAN.shots.length} shot prompts.`);

// ---------------------------------------------------- Stage 1: Lyria master
const masterAudio = path.join(WORK, "lyria_master.mp3");
if (!fs.existsSync(masterAudio) || fs.statSync(masterAudio).size < 50000) {
  log("🎼 STAGE 1 - DeepMind Lyria 3.5 master soundtrack");
  await generateLyriaMaster(masterAudio);
} else log(`🎼 STAGE 1 - reusing existing master (${fs.statSync(masterAudio).size} bytes)`);

// ---------------------------------------------------- Stage 2: anchor plate
const anchor = path.join(WORK, "anchors", "dancer_anchor.png");
if (!fs.existsSync(anchor) || fs.statSync(anchor).size < 20000) {
  log("\n📸 STAGE 2 - Gemini 2.5 Flash Image biometric anchor plate");
  await generateAnchor(anchor, PLAN.anchor_prompt);
} else log(`\n📸 STAGE 2 - reusing existing anchor (${fs.statSync(anchor).size} bytes)`);

// ---------------------------------------------------- Cloudtop workspace
log("\n🔗 syncing to Cloudtop");
remote(`mkdir -p ${REMOTE_DIR}/shots ${REMOTE_DIR}/frames`);
sh(`scp -q "${masterAudio}" ${REMOTE_HOST}:${REMOTE_DIR}/lyria_master.mp3`);
const adur = remote(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${REMOTE_DIR}/lyria_master.mp3`);
log(`  master audio duration: ${Number(adur).toFixed(3)}s`);

// ---------------------------------------------------- Stage 4: Veo + chaining
log("\n🎬 STAGE 4 - Veo 3.1 image-conditioned render (sequential tail-frame chaining)");
let conditionImage = anchor;
const shotMeta = [];
// crop box per shot index, measured by the letterbox tripwire below
const cropBoxes = {};

for (const s of PLAN.shots) {
  const i = s.index;
  const out = path.join(shotsDir, `shot_0${i}.mp4`);
  // Veo 3.1 accepts a DISCRETE set of durations. It rejects 7 with
  // "out of bound ... between 4 and 8" even though 7 lies in that range, so the
  // usable values are {4,6,8}. Pick the smallest that covers the target, then
  // trim to the exact bar length - minimising discarded surplus.
  const reqSec = [4, 6, 8].find(d => d >= s.duration_sec) ?? 8;

  if (fs.existsSync(out) && fs.statSync(out).size > 200000) {
    log(`  shot ${i}: reusing existing (${fs.statSync(out).size} bytes)`);
  } else {
    log(`  shot ${i}/5  target ${s.duration_sec}s  conditioned on ${path.basename(conditionImage)}`);
    await dispatchVeo(i, s.veo_prompt, conditionImage, reqSec, out);
  }

  // ---- LETTERBOX TRIPWIRE -------------------------------------------------
  // The first cut shipped with black bars over ~43% of every frame and the
  // automated audit still returned PASS, because nothing measured the active
  // picture area. cropdetect reports the bounding box of non-black pixels; if
  // Veo padded the frame it shows up here immediately. Running it per shot means
  // a bad conditioning plate costs one shot instead of five.
  sh(`scp -q "${out}" ${REMOTE_HOST}:${REMOTE_DIR}/shots/shot_0${i}.mp4`);
  const cd = remote(
    `ffmpeg -hide_banner -ss 1 -i ${REMOTE_DIR}/shots/shot_0${i}.mp4 -vf cropdetect=24:2:0 -frames:v 60 -f null - 2>&1 ` +
    `| grep -o 'crop=[0-9:]*' | tail -1`
  ).trim();
  const [cw, ch, cx, cy] = cd.replace("crop=", "").split(":").map(Number);
  const probe = remote(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${REMOTE_DIR}/shots/shot_0${i}.mp4`).trim();
  const [fw, fh] = probe.split(",").map(Number);
  const coverage = (cw * ch) / (fw * fh);
  log(`    frame ${fw}x${fh}  active picture ${cd}  coverage ${(coverage * 100).toFixed(1)}%`);
  if (coverage < 0.97) {
    throw new Error(
      `Shot ${i} is letterboxed: active picture ${cw}x${ch} inside ${fw}x${fh} = ${(coverage * 100).toFixed(1)}% coverage. ` +
      `The conditioning image aspect ratio is almost certainly wrong. Halting before further Veo spend.`
    );
  }

  // Even a well-framed Veo shot comes back with a couple of rows of near-black
  // at the edges. Rather than scaling the padded frame (which would either keep
  // the bars or stretch the picture), take the largest TRUE 9:16 rectangle that
  // fits inside the detected active area and crop to exactly that. Derived per
  // shot from what was measured, not hardcoded.
  let tw, th;
  if (cw / ch > 9 / 16) { th = ch; tw = Math.round(ch * 9 / 16); }
  else { tw = cw; th = Math.round(cw * 16 / 9); }
  tw -= tw % 2; th -= th % 2;
  const fx = cx + Math.floor((cw - tw) / 2), fy = cy + Math.floor((ch - th) / 2);
  cropBoxes[i] = `${tw}:${th}:${fx}:${fy}`;
  log(`    9:16 crop box -> ${cropBoxes[i]}`);

  // Tail frame for the NEXT shot. Conditioning shot N+1 on the anchor instead
  // would reset Frame 0 to the opening pose and create a visible loop at each cut.
  if (i < PLAN.shots.length) {
    const tail = `${REMOTE_DIR}/frames/shot_0${i}_tail.jpg`;
    remote(`ffmpeg -y -v error -sseof -0.1 -i ${REMOTE_DIR}/shots/shot_0${i}.mp4 -vframes 1 -q:v 2 ${tail}`);
    const localTail = path.join(framesDir, `shot_0${i}_tail.jpg`);
    sh(`scp -q ${REMOTE_HOST}:${tail} "${localTail}"`);
    conditionImage = localTail;
    log(`    tail frame -> ${path.basename(localTail)} (conditions shot ${i + 1})`);
  }
  shotMeta.push({ index: i, path: out, target: s.duration_sec });
}

// ---------------------------------------------------- Stage 5: master on Cloudtop
log("\n🎞️  STAGE 5 - optical post + master (Cloudtop ffmpeg)");
for (const m of shotMeta) sh(`scp -q "${m.path}" ${REMOTE_HOST}:${REMOTE_DIR}/shots/shot_0${m.index}.mp4`);

const durs = PLAN.shots.map(s => s.duration_sec);
const crops = PLAN.shots.map(s => cropBoxes[s.index]);
if (crops.some(c => !c)) { console.error("HALT: missing crop box for a shot - tripwire did not run."); process.exit(1); }
const script = `#!/bin/bash
set -e
cd ${REMOTE_DIR.replace("~", "$HOME")}
D=(${durs.join(" ")})
# Per-shot 9:16 crop boxes measured by the letterbox tripwire. Cropping to the
# active picture BEFORE scaling is what removes Veo's residual black edges; the
# previous chain scaled the padded frame and carried the bars into the master.
C=(${crops.join(" ")})
for i in 1 2 3 4 5; do
  d=\${D[\$((i-1))]}
  c=\${C[\$((i-1))]}
  ffmpeg -y -v error -i shots/shot_0\$i.mp4 -t \$d \\
    -vf "crop=\$c,scale=720:1280,fps=24,setsar=1" \\
    -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p trimmed_\$i.mp4
done
: > concat.txt
for i in 1 2 3 4 5; do echo "file 'trimmed_\$i.mp4'" >> concat.txt; done
ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy silent_cut.mp4

# 35mm grain + subtle chromatic aberration + Rec.709. No highpass on the audio:
# the full sub-bass spectrum must survive (Rule 34).
#
# AUDIO CHAIN - do not simplify this to loudnorm alone. loudnorm's TP= is a
# target for its internal gain solve, not a hard ceiling: single-pass loudnorm
# at TP=-1.0 measured +0.70 dBTP on this exact source, i.e. clipping. A real
# limiter has to sit behind it.
#   alimiter level=0    -> MUST be set. alimiter defaults to level=true, which
#                          auto-normalises the result back UP and previously
#                          made the master louder (-12.04 LUFS) instead of safer.
#   limit=0.708         -> -3.0 dBFS ceiling, lands around -2.4 dBTP true peak.
#   aresample=48000     -> resample last so the limiter works at source rate.
ffmpeg -y -v error -i silent_cut.mp4 -i lyria_master.mp3 \\
  -filter_complex "[0:v]noise=alls=7:allf=t+u,eq=saturation=1.04:contrast=1.02,format=yuv420p[v]; \\
                   [1:a]afade=t=out:st=29.0:d=1.0,loudnorm=I=-14:TP=-2.0:LRA=11,alimiter=level=0:limit=0.708:attack=5:release=50,aresample=48000[a]" \\
  -map "[v]" -map "[a]" -t 30.0 \\
  -c:v libx264 -preset slow -crf 18 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 \\
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart master_30s.mp4

echo "---RESULT---"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,width,height,r_frame_rate,sample_rate -of default=nw=1 master_30s.mp4
`;
fs.writeFileSync(path.join(WORK, "master.sh"), script);
sh(`scp -q "${path.join(WORK, "master.sh")}" ${REMOTE_HOST}:${REMOTE_DIR}/master.sh`);
remote(`chmod +x ${REMOTE_DIR}/master.sh`);
const res = remote(`${REMOTE_DIR}/master.sh`);
log(res);

sh(`scp -q ${REMOTE_HOST}:${REMOTE_DIR}/master_30s.mp4 "${path.join(WORK, "master_30s.mp4")}"`);
const finalPath = path.join(WORK, "master_30s.mp4");
log(`\n✅ MASTER: ${finalPath} (${fs.statSync(finalPath).size} bytes)`);

// real poster extracted from our own render (Rule 36)
remote(`ffmpeg -y -v error -ss 2.0 -i ${REMOTE_DIR}/master_30s.mp4 -vframes 1 -q:v 2 ${REMOTE_DIR}/poster.jpg`);
sh(`scp -q ${REMOTE_HOST}:${REMOTE_DIR}/poster.jpg "${path.join(WORK, "poster.jpg")}"`);
log(`✅ POSTER: poster.jpg (extracted from this render, not a stock still)`);

// modelsInvoked DERIVED from receipts, never hand-authored
const receipts = [
  ...fs.readFileSync(s0, "utf-8").split("\n").filter(Boolean).map(JSON.parse),
  ...(fs.existsSync(LEDGER) ? fs.readFileSync(LEDGER, "utf-8").split("\n").filter(Boolean).map(JSON.parse) : [])
];
const modelsInvoked = [...new Set(receipts.filter(r => r.http_status === 200).map(r => r.model))];
fs.writeFileSync(path.join(WORK, "production_manifest.json"), JSON.stringify({
  productionId: PROD_ID, durationSec: 30.0, bpm: PLAN.bpm, aspectRatio: "9:16",
  shots: PLAN.shots.map(s => ({ index: s.index, duration: s.duration_sec })),
  modelsInvoked, receiptCount: receipts.length,
  derivedFrom: "provenance receipts - not hand-authored"
}, null, 2));
log("\n📋 modelsInvoked (derived from receipts): " + modelsInvoked.join(", "));
log("   total receipts: " + receipts.length);
