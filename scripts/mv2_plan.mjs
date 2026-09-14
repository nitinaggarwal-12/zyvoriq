#!/usr/bin/env node
/**
 * MUSIC VIDEO v2 - MEASURE-FIRST DIRECTOR
 * =======================================
 * The v1 pipeline planned shots, then made music, then discovered the tempo was
 * 5.6 BPM off what it had assumed. Here the song is generated and MEASURED
 * first, and the shot grid is computed from the measurement. Omni 1.1 directs
 * the creative content of each shot but never sets durations or timings -
 * those are arithmetic and it got them wrong last time.
 *
 * Fixes the five defects the viewer identified in v1:
 *   "isn't singing"        -> every shot carries the EXACT lyric words playing
 *                             during it, with an explicit instruction to sing
 *                             them to camera.
 *   "0.75 playback speed"  -> v1 contained NO tempo information at all. Every
 *                             prompt now states the BPM, the beat duration, how
 *                             many beats the shot spans, and demands movement
 *                             accents land on the beat.
 *   "expressionless"       -> v1 said "mouth closed, focused expression". Each
 *                             shot now gets a directed emotion and explicit
 *                             micro-expression beats.
 *   "no song"              -> Lyria now generates a real vocal song (verified
 *                             by listening, not by assuming).
 *   "clearly AI"           -> handheld camera weave, motion blur, shorter takes
 *                             (9 shots not 5), lens imperfection, and skin
 *                             texture language.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const WORK = "/Users/nitinagga/Documents/zyvoriq/scratch/mv_v2";
const OMNI = "models/gemini-omni-1.1-flash";
const LEDGER = path.join(WORK, "provenance.jsonl");

const BPM = 120.63, BAR = 1.98949;
const WINDOW_START = 8.1259;           // a measured downbeat, just before the vocal enters
const TOTAL = 30.0;

// Lyric lines in ABSOLUTE song time, from the listening analysis.
const LYRICS_ABS = [
  [8.31, 9.91, "Golden hour on my skin"],
  [10.39, 12.01, "Feel the summer coming in"],
  [12.58, 14.20, "Every heartbeat, every high"],
  [14.60, 16.22, "We were dancing through the sky"],
  [16.63, 18.13, "Don't let go, don't slow down"],
  [18.60, 20.16, "We're the only ones in town"],
  [20.63, 22.20, "Turn it up and let it burn"],
  [22.60, 24.16, "It's our summer, it's our turn"],
  [24.57, 26.00, "Golden hour on my skin"],
  [26.37, 27.96, "Feel the summer coming in"],
  [28.40, 30.00, "Every heartbeat, every high"],
  [30.40, 32.00, "We were dancing through the sky"],
  [32.40, 34.00, "Don't let go, don't slow down"],
  [34.40, 36.00, "We're the only ones in town"],
  [36.40, 38.00, "Turn it up and let it burn"]
];
const LYRICS = LYRICS_ABS
  .map(([s, e, t]) => [+(s - WINDOW_START).toFixed(3), +(e - WINDOW_START).toFixed(3), t])
  .filter(([s, e]) => e > 0 && s < TOTAL);

// Shot grid in BARS. Varying 2/1 bar lengths - uniform 6s takes were a large
// part of why v1 read as stock footage rather than a music video.
const BAR_PLAN = [2, 2, 1, 2, 1, 2, 2, 2, 1];
const shots = [];
let tCur = 0;
BAR_PLAN.forEach((bars, i) => {
  const isLast = i === BAR_PLAN.length - 1;
  const start = tCur;
  const end = isLast ? TOTAL : +(tCur + bars * BAR).toFixed(4);   // last shot absorbs the remainder
  const dur = +(end - start).toFixed(4);
  const lines = LYRICS.filter(([s, e]) => e > start + 0.15 && s < end - 0.15);
  shots.push({
    index: i + 1, start_sec: +start.toFixed(4), end_sec: +end.toFixed(4),
    duration_sec: dur, bars, beats: +(dur / (BAR / 4)).toFixed(2),
    lyrics: lines.map(([s, e, t]) => ({ start: +(s - start).toFixed(2), end: +(e - start).toFixed(2), text: t })),
    singing: lines.length > 0
  });
  tCur = end;
});

fs.mkdirSync(WORK, { recursive: true });
fs.writeFileSync(path.join(WORK, "shot_grid.json"), JSON.stringify({ bpm: BPM, bar_sec: BAR, window_start: WINDOW_START, total: TOTAL, shots }, null, 2));

console.log(`Shot grid: ${shots.length} shots, ${shots.reduce((a, s) => a + s.duration_sec, 0).toFixed(4)}s total`);
for (const s of shots) {
  console.log(`  shot ${s.index}: ${s.start_sec.toFixed(3)}-${s.end_sec.toFixed(3)}s (${s.duration_sec.toFixed(3)}s, ${s.bars} bar, ${s.beats} beats) ${s.singing ? "SINGING" : "instrumental"}`);
  for (const l of s.lyrics) console.log(`        ${l.start}-${l.end}s  "${l.text}"`);
}

// ---------------------------------------------------------------- Omni direct
async function callOmni(prompt, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const t0 = Date.now(), startedAt = new Date().toISOString();
    const body = { model: OMNI, input: prompt };
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions?key=${API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(240000)
      });
      const txt = await res.text();
      fs.appendFileSync(LEDGER, JSON.stringify({
        stage: "stage0_omni_director_v2", label, attempt, model: OMNI, endpoint: "v1beta/interactions",
        http_status: res.status, request_sha256: crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"),
        response_bytes: txt.length, started_at: startedAt, duration_ms: Date.now() - t0
      }) + "\n");
      if (res.status === 429 || res.status >= 500) throw new Error(`transient HTTP ${res.status}`);
      if (!res.ok) throw Object.assign(new Error(`Omni HTTP ${res.status}: ${txt.slice(0, 300)}`), { fatal: true });
      const out = JSON.parse(txt).steps?.find(s => s.type === "model_output")?.content?.[0]?.text;
      if (!out) throw new Error("no model_output");
      console.log(`\n  OK ${label}: ${out.length} chars in ${Math.round((Date.now() - t0) / 1000)}s`);
      return out;
    } catch (e) {
      if (e.fatal || attempt === 3) throw e;
      console.log(`  retry ${attempt}: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * 2 ** (attempt - 1)));
    }
  }
}

const casting = JSON.parse(fs.readFileSync("/Users/nitinagga/Documents/zyvoriq/scratch/coastal_synthpop_30s/omni_directorial_plan.json", "utf-8"));

const BRIEF = `You are Google Omni 1.1, sole director of a 30 second VERTICAL 9:16 summer synth-pop music video.

THE SONG IS ALREADY RECORDED AND MEASURED. You are directing to a locked edit. Tempo ${BPM} BPM, bar = ${BAR.toFixed(4)}s, beat = ${(BAR / 4).toFixed(4)}s.

THE PERFORMER (fixed, do not redescribe): ${casting.casting_descriptor}
WARDROBE (fixed): ${casting.wardrobe}
LOCATION: sunlit Mediterranean coastal terrace overlooking the sea, golden hour.

THE PREVIOUS ATTEMPT FAILED REVIEW. Verbatim feedback: "the model isnt singing, its running at .75 playback speed, totally expressionless, no song, only background music and clearly visible AI generation". Your direction must fix all of it:
- She SINGS. She is a performer delivering a song to camera, not a dancer ignoring it.
- Movement must read at ${BPM} BPM. Direct sharp, weighted accents that land ON the beat. No floating, no languid drifting, no slow-motion feel.
- She must be EXPRESSIVE. Give every shot a specific emotion and specific micro-expression beats (a grin breaking, eyes widening, a brow lift, a laugh, a look away and back).
- It must not look AI-generated. Direct handheld camera with natural weave and breath, motion blur on fast movement, imperfect framing.

Here is the LOCKED shot grid. Durations and lyrics are FINAL - do not change them.
${shots.map(s => `SHOT ${s.index}: ${s.duration_sec.toFixed(3)}s (${s.beats} beats). ${s.singing ? "SHE SINGS: " + s.lyrics.map(l => `"${l.text}" at ${l.start}-${l.end}s into the shot`).join(" then ") : "INSTRUMENTAL - mouth closed, dance only"}`).join("\n")}

Return STRICT JSON ONLY, no markdown fence:
{
  "concept": "one sentence",
  "shots": [
    {
      "index": 1,
      "shot_size": "e.g. MEDIUM_CLOSE_UP | WIDE | MEDIUM_FULL - vary these, a music video is not one focal length",
      "camera": "handheld movement description, must state the horizon stays level",
      "emotion": "the specific feeling she is projecting in this shot",
      "micro_expressions": "2-3 concrete facial beats, timed loosely within the shot",
      "choreography": "movement description with explicit beat accents, e.g. 'hip accent on beats 1 and 3, hair flick on beat 4'",
      "singing_direction": "how she delivers the line - to camera, eyes closed, head thrown back, etc. If instrumental, say mouth closed and what she does instead",
      "start_pose": "continuing from the previous shot's end pose",
      "end_pose": "where she finishes"
    }
  ]
}
Exactly ${shots.length} shots. Vary shot size and energy across them - build to the biggest moment. Do not mention wardrobe or facial features; those are locked elsewhere.`;

console.log("\nSTAGE 0 - Omni 1.1 directing to the locked edit...");
let raw = await callOmni(BRIEF, "shot_direction");
fs.writeFileSync(path.join(WORK, "omni_raw.txt"), raw);

function extractJson(s) {
  s = s.replace(/^[\s\S]*?```(?:json)?\s*/i, m => /```/.test(m) ? "" : m).replace(/```[\s\S]*$/, "");
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  return a >= 0 && b > a ? s.slice(a, b + 1) : s;
}
let plan;
try { plan = JSON.parse(extractJson(raw)); }
catch {
  console.log("  direct parse failed - asking Omni to transcode its own answer to strict JSON");
  raw = await callOmni(`Convert the following directorial notes into STRICT JSON matching exactly this schema, no markdown, no commentary:\n{"concept":"","shots":[{"index":1,"shot_size":"","camera":"","emotion":"","micro_expressions":"","choreography":"","singing_direction":"","start_pose":"","end_pose":""}]}\n\nNOTES:\n${raw}`, "schema_reformat");
  plan = JSON.parse(extractJson(raw));
}

if (!Array.isArray(plan.shots) || plan.shots.length !== shots.length) {
  console.error(`HALT: Omni returned ${plan.shots?.length} shots, expected ${shots.length}`);
  process.exit(1);
}

// Merge Omni's creative direction onto the measured grid. Timings come from the
// grid, never from Omni.
plan.bpm = BPM; plan.bar_sec = BAR; plan.window_start = WINDOW_START; plan.total_sec = TOTAL;
plan.shots = plan.shots.map((o, i) => ({ ...shots[i], ...o, index: shots[i].index, duration_sec: shots[i].duration_sec }));
fs.writeFileSync(path.join(WORK, "plan.json"), JSON.stringify(plan, null, 2));

console.log(`\nCONCEPT: ${plan.concept}`);
for (const s of plan.shots) {
  console.log(`\n  SHOT ${s.index} (${s.duration_sec.toFixed(2)}s, ${s.shot_size})`);
  console.log(`    emotion : ${s.emotion}`);
  console.log(`    micro   : ${s.micro_expressions}`);
  console.log(`    choreo  : ${s.choreography}`);
  console.log(`    singing : ${s.singing_direction}`);
}
console.log(`\nplan -> ${path.join(WORK, "plan.json")}`);
