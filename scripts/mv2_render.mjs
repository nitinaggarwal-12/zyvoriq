#!/usr/bin/env node
/**
 * MUSIC VIDEO v2 - RENDER
 * =======================
 * Builds Veo prompts that carry everything Veo cannot hear, then renders,
 * verifies and masters. Pathway B: Veo's own generated audio is DISCARDED and
 * the Lyria master is laid over the cut, so the performance is mimed to the
 * real song exactly as a real music video is shot to playback.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ROOT = "/Users/nitinagga/Documents/zyvoriq";
const WORK = path.join(ROOT, "scratch", "mv_v2");
const HOST = "nitinagga.c.googlers.com";
const RDIR = "~/zyvoriq/scratch/mv_v2";
const LEDGER = path.join(WORK, "provenance.jsonl");

const sh = c => execFileSync("bash", ["-lc", c], { encoding: "utf-8", maxBuffer: 1 << 28 }).trim();
const rx = c => sh(`ssh -o ConnectTimeout=25 ${HOST} '${c.replace(/'/g, "'\\''")}'`);
const log = (...a) => console.log(...a);
const receipt = (o) => fs.appendFileSync(LEDGER, JSON.stringify(o) + "\n");

const plan = JSON.parse(fs.readFileSync(path.join(WORK, "plan.json"), "utf-8"));
const v1 = JSON.parse(fs.readFileSync(path.join(ROOT, "scratch/coastal_synthpop_30s/omni_directorial_plan.json"), "utf-8"));
const BPM = plan.bpm, BEAT = plan.bar_sec / 4;

[path.join(WORK, "shots"), path.join(WORK, "frames"), path.join(WORK, "anchors")].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ---------------------------------------------------------------- prompt build
// Locks proven in v1: identity, wardrobe, accessories. Reused byte-identically
// so the performer is the same woman who already passed the identity gate.
// v1's lock named the garments but never pinned their LENGTH or exact SHADE.
// Across a 9-link tail-frame chain Veo drifted the skirt from mid-length to a
// mini and bleached the pastel yellow to near-white. Both are now explicit.
const LOCK = v1.identity_lock_block +
  "GARMENT GEOMETRY LOCK - the skirt is MID-LENGTH: it falls WELL BELOW THE KNEE, around mid-calf, " +
  "tiered and full. It is NOT a mini skirt, NOT short, NOT above the knee, NOT a tennis skirt. " +
  "COLOUR LOCK - both pieces are a soft PASTEL YELLOW, clearly and visibly yellow like primrose or " +
  "butter. They are NOT white, NOT cream, NOT ivory, NOT bleached out. The yellow stays saturated " +
  "and identical in every shot. ";

function buildPrompt(s) {
  const lyricText = s.lyrics?.length
    ? s.lyrics.map(l => `from ${l.start}s to ${l.end}s she sings the words "${l.text}"`).join(", then ")
    : null;

  // Everything Veo cannot infer from the conditioning image or the audio it
  // never hears. v1 omitted ALL of this, which is why the result was a silent,
  // expressionless, slow-motion-looking dance loop.
  const performance = lyricText
    ? `SHE IS SINGING. This is a live vocal performance to camera: ${lyricText}. Her lips, jaw and tongue clearly articulate those exact words - visible mouth shapes forming the consonants and vowels, teeth and tongue visible on open vowels, an expressive singing mouth. She is a singer performing, not a dancer. ${s.singing_direction} `
    : `Her mouth stays CLOSED - no singing and no lip movement in this shot. ${s.singing_direction} `;

  const tempo =
    `TEMPO LOCK - the music is ${BPM.toFixed(1)} BPM, one beat every ${BEAT.toFixed(3)} seconds. This ${s.duration_sec.toFixed(2)} second shot spans ${s.beats} beats. ` +
    `Her movement is FAST, sharp and percussive, visibly driven by that tempo. ${s.choreography} ` +
    `Accents must land crisply on the beat with real weight and momentum. ABSOLUTELY NO slow motion, NO languid floating, NO dreamy drifting, NO half-speed movement - full natural speed, energetic and athletic. `;

  const emotion =
    `EXPRESSION - she is ${s.emotion}. Her face is alive and constantly changing: ${s.micro_expressions} ` +
    `Eyes engaged and bright with genuine feeling. She is NEVER blank, NEVER deadpan, NEVER vacant. `;

  // Anti-AI-tell language. v1 only fought waxy skin and lost on all the others.
  const realism =
    `SHOT ON REAL CAMERA - ${s.shot_size.replace(/_/g, " ").toLowerCase()}. ${s.camera} ` +
    `HANDHELD: the frame breathes and weaves slightly with the operator's body, tiny natural corrections, never a locked-off tripod. ` +
    `Natural MOTION BLUR on fast limbs, hair and fabric. Real physics with weight, momentum and inertia - hair and skirt settle with proper follow-through. ` +
    `Photorealistic skin with VISIBLE NATURAL TEXTURE: pores, fine peach fuzz, freckles, faint shine of real perspiration in the heat, natural micro-imperfections. ` +
    `NO airbrushing, NO AI skin smoothing, NO waxy plastic CGI sheen, NO beauty filter, NO uncanny doll-like stillness. ` +
    `Camera upright with ZERO roll, horizon level. Vertical 9:16 framing. 35mm film, Kodak Portra 400 grain, subtle chromatic aberration and a touch of lens flare from the low sun, Rec.709 colour. `;

  // Terminal rider. The ACCESSORY LOCK is stated in LOCK, which sits at
  // character 0 of a ~4400 character prompt and is demonstrably too weak
  // there: shots 2 and 3 rendered a chunky chain despite it. Veo weights the
  // tail of a long prompt far more heavily, so the single detail that keeps
  // drifting gets restated last, immediately before generation.
  const rider =
    ` FINAL CHECK before you render: the necklace is ONE fine, thread-thin gold chain sitting close at the base of her throat - ` +
    `if you are about to draw a thick, chunky, chained or rope-like necklace, draw the thin delicate chain instead. ` +
    `The skirt is mid-calf and flowing, not a mini. The fabric is pastel yellow, not white or cream.`;

  return LOCK + performance + tempo + emotion + realism +
    `Continuity: ${s.start_pose} She finishes: ${s.end_pose}` + rider;
}

for (const s of plan.shots) s.veo_prompt = buildPrompt(s);
fs.writeFileSync(path.join(WORK, "plan.json"), JSON.stringify(plan, null, 2));
log(`Built ${plan.shots.length} Veo prompts (avg ${Math.round(plan.shots.reduce((a, s) => a + s.veo_prompt.length, 0) / plan.shots.length)} chars)\n`);

// ---------------------------------------------------------------- anchor
function pngDim(b) { return (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null; }

const anchor = path.join(WORK, "anchors", "anchor.png");
if (!fs.existsSync(anchor) || fs.statSync(anchor).size < 20000) {
  // A NEW anchor: v1's plate was a neutral, closed-mouth stare, and Veo
  // inherited that deadness into every shot. This one is mid-performance.
  const ap = LOCK +
    "Ultra-photorealistic full-body VERTICAL 9:16 photograph of this woman mid-song on a sunlit Mediterranean " +
    "coastal terrace overlooking the sea at golden hour. She is SINGING - mouth open mid-word, an expressive " +
    "singing mouth with teeth visible, caught mid-phrase. Her face is radiant and joyful, eyes bright and " +
    "engaged with the camera, a genuine grin breaking. Dynamic dance posture, weight shifted, arms in motion, " +
    "hair braid swinging with momentum. VISIBLE NATURAL SKIN TEXTURE: pores, peach fuzz, freckles, faint sheen " +
    "of perspiration; NO airbrushing, NO smoothing, NO waxy CGI sheen, NO beauty filter. " +
    "Handheld camera feel, natural motion blur on the moving arm. Camera upright, ZERO roll, horizon level. " +
    "TALL VERTICAL 9:16 PORTRAIT FRAME - full body from the top of her head to her sandals inside the frame, " +
    "nothing cropped, no black bars, no square framing. 35mm film, Kodak Portra 400 grain, shallow depth of " +
    "field, subtle chromatic aberration and low-sun lens flare, Rec.709 colour.";
  const model = "models/gemini-2.5-flash-image";
  const t0 = Date.now(), startedAt = new Date().toISOString();
  const body = { contents: [{ parts: [{ text: ap }] }], generationConfig: { imageConfig: { aspectRatio: "9:16" } } };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(180000) });
  const t = await r.text();
  receipt({ stage: "stage2_anchor", model, endpoint: `${model}:generateContent`, http_status: r.status, request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"), response_bytes: t.length, started_at: startedAt, duration_ms: Date.now() - t0 });
  if (!r.ok) throw new Error(`anchor HTTP ${r.status}: ${t.slice(0, 300)}`);
  const img = (JSON.parse(t)?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!img) throw new Error("anchor: no image");
  const buf = Buffer.from(img.inlineData.data, "base64");
  const d = pngDim(buf);
  if (!d || Math.abs(d.w / d.h - 9 / 16) > 0.02) throw new Error(`anchor not 9:16: ${d?.w}x${d?.h}`);
  fs.writeFileSync(anchor, buf);
  log(`Anchor: ${d.w}x${d.h}, ${buf.length} bytes`);
} else log(`Anchor: reusing (${fs.statSync(anchor).size} bytes)`);

// ---------------------------------------------------------------- Veo
async function veo(i, prompt, condPath, reqSec, out) {
  const img = fs.readFileSync(condPath).toString("base64");
  const mime = condPath.endsWith(".png") ? "image/png" : "image/jpeg";
  for (const m of ["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"]) {
    const t0 = Date.now(), startedAt = new Date().toISOString();
    const body = { instances: [{ prompt, image: { bytesBase64Encoded: img, mimeType: mime } }],
      parameters: { aspectRatio: "9:16", durationSeconds: reqSec, personGeneration: "allow_adult" } };
    try {
      const dr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:predictLongRunning?key=${API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
      const dt = await dr.text();
      if (!dr.ok) { receipt({ stage: `stage4_veo_${i}`, model: m, http_status: dr.status, error: dt.slice(0, 200), started_at: startedAt, duration_ms: Date.now() - t0 }); log(`    ${m} HTTP ${dr.status}`); continue; }
      const op = JSON.parse(dt).name;
      for (let k = 0; k < 60; k++) {
        await new Promise(r => setTimeout(r, 10000));
        const pj = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/${op}?key=${API_KEY}`, { signal: AbortSignal.timeout(60000) })).json();
        if (!pj.done) continue;
        if (pj.error) { log(`    op error: ${JSON.stringify(pj.error).slice(0, 160)}`); break; }
        const uri = pj.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (!uri) { log("    no uri"); break; }
        const vb = Buffer.from(await (await fetch(`${uri}&key=${API_KEY}`, { signal: AbortSignal.timeout(300000) })).arrayBuffer());
        fs.writeFileSync(out, vb);
        receipt({ stage: `stage4_veo_${i}`, model: m, endpoint: `${m}:predictLongRunning`, http_status: 200, request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"), response_bytes: vb.length, started_at: startedAt, duration_ms: Date.now() - t0, operation: op });
        log(`    shot ${i}: ${vb.length} bytes in ${Math.round((Date.now() - t0) / 1000)}s`);
        return;
      }
    } catch (e) { log(`    ${m}: ${e.message}`); }
  }
  throw new Error(`shot ${i} failed on all Veo models`);
}

rx(`mkdir -p ${RDIR}/shots ${RDIR}/frames`);
log("\nSTAGE 4 - Veo render (tail-frame chained)");
let cond = anchor;
const crops = {};
for (const s of plan.shots) {
  const i = s.index, out = path.join(WORK, "shots", `s${i}.mp4`);
  const req = [4, 6, 8].find(d => d >= s.duration_sec) ?? 8;
  if (fs.existsSync(out) && fs.statSync(out).size > 200000) log(`  shot ${i}: reusing`);
  else { log(`  shot ${i}/${plan.shots.length} target ${s.duration_sec.toFixed(2)}s <- ${path.basename(cond)}`); await veo(i, s.veo_prompt, cond, req, out); }

  sh(`scp -q "${out}" ${HOST}:${RDIR}/shots/s${i}.mp4`);
  const cd = rx(`ffmpeg -hide_banner -ss 0.5 -i ${RDIR}/shots/s${i}.mp4 -vf cropdetect=24:2:0 -frames:v 40 -f null - 2>&1 | grep -o 'crop=[0-9:]*' | tail -1`).trim();
  const [cw, ch, cx, cy] = cd.replace("crop=", "").split(":").map(Number);
  const [fw, fh] = rx(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${RDIR}/shots/s${i}.mp4`).trim().split(",").map(Number);
  const cov = (cw * ch) / (fw * fh);
  if (cov < 0.97) throw new Error(`shot ${i} letterboxed: ${(cov * 100).toFixed(1)}%`);
  let tw, th;
  if (cw / ch > 9 / 16) { th = ch; tw = Math.round(ch * 9 / 16); } else { tw = cw; th = Math.round(cw * 16 / 9); }
  tw -= tw % 2; th -= th % 2;
  crops[i] = `${tw}:${th}:${cx + Math.floor((cw - tw) / 2)}:${cy + Math.floor((ch - th) / 2)}`;
  log(`    coverage ${(cov * 100).toFixed(1)}%  crop ${crops[i]}`);

  if (i < plan.shots.length) {
    // CHAIN LENGTH IS BOUNDED. Conditioning every shot on its predecessor lets
    // small wardrobe/colour errors compound; over 9 links that produced a skirt
    // that shortened and a yellow that bleached white. Conditioning every shot
    // on the anchor instead is the opposite failure - it resets the pose each
    // cut and creates a visible loop. So: chain in runs of CHAIN_MAX, then
    // re-anchor. Drift can never accumulate over more than CHAIN_MAX links.
    const CHAIN_MAX = 3;
    if (i % CHAIN_MAX === 0) {
      cond = anchor;
      log(`    re-anchoring shot ${i + 1} (chain bounded at ${CHAIN_MAX})`);
    } else {
      const tt = Math.max(0.1, s.duration_sec - 0.05).toFixed(3);
      rx(`ffmpeg -y -v error -ss ${tt} -i ${RDIR}/shots/s${i}.mp4 -vframes 1 -q:v 2 ${RDIR}/frames/s${i}_tail.jpg`);
      const lt = path.join(WORK, "frames", `s${i}_tail.jpg`);
      sh(`scp -q ${HOST}:${RDIR}/frames/s${i}_tail.jpg "${lt}"`);
      cond = lt;
    }
  }
}

// ---------------------------------------------------------------- master
log("\nSTAGE 5 - master");
sh(`scp -q "${path.join(WORK, "song_full.mp3")}" ${HOST}:${RDIR}/song_full.mp3`);
const durs = plan.shots.map(s => s.duration_sec);
const cropArr = plan.shots.map(s => crops[s.index]);
const N = plan.shots.length;

const script = `#!/bin/bash
set -e
cd ${RDIR.replace("~", "$HOME")}
D=(${durs.join(" ")})
C=(${cropArr.join(" ")})
for i in $(seq 1 ${N}); do
  d=\${D[$((i-1))]}; c=\${C[$((i-1))]}
  # -an: Veo's own generated audio is discarded. The performance is mimed to the
  # Lyria master, which is the single source of sound (Pathway B).
  ffmpeg -y -v error -i shots/s$i.mp4 -t $d -vf "crop=$c,scale=720:1280,fps=24,setsar=1" \\
    -an -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p t_$i.mp4
done
: > concat.txt
for i in $(seq 1 ${N}); do echo "file 't_$i.mp4'" >> concat.txt; done
ffmpeg -y -v error -f concat -safe 0 -i concat.txt -c copy silent.mp4

# Audio window starts on a MEASURED downbeat so every cut lands on the grid.
ffmpeg -y -v error -ss ${plan.window_start} -t 30.0 -i song_full.mp3 -c copy song_30s.mp3

ffmpeg -y -v error -i silent.mp4 -i song_30s.mp3 \\
  -filter_complex "[0:v]noise=alls=6:allf=t+u,eq=saturation=1.05:contrast=1.03,format=yuv420p[v]; \\
                   [1:a]afade=t=out:st=29.2:d=0.8,loudnorm=I=-14:TP=-2.0:LRA=11,alimiter=level=0:limit=0.708:attack=5:release=50,aresample=48000[a]" \\
  -map "[v]" -map "[a]" -t 30.0 \\
  -c:v libx264 -preset slow -crf 18 -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 \\
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart master.mp4
ffmpeg -y -v error -ss 1.2 -i master.mp4 -vframes 1 -q:v 2 poster.jpg
echo "---RESULT---"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,width,height,r_frame_rate -of default=nw=1 master.mp4
`;
fs.writeFileSync(path.join(WORK, "master.sh"), script);
sh(`scp -q "${path.join(WORK, "master.sh")}" ${HOST}:${RDIR}/master.sh`);
rx(`chmod +x ${RDIR}/master.sh`);
log(rx(`${RDIR}/master.sh`));
sh(`scp -q ${HOST}:${RDIR}/master.mp4 "${path.join(WORK, "master.mp4")}"`);
sh(`scp -q ${HOST}:${RDIR}/song_30s.mp3 "${path.join(WORK, "song_30s.mp3")}"`);
sh(`scp -q ${HOST}:${RDIR}/poster.jpg "${path.join(WORK, "poster.jpg")}"`);
log(`\nMASTER: ${path.join(WORK, "master.mp4")} (${fs.statSync(path.join(WORK, "master.mp4")).size} bytes)`);
