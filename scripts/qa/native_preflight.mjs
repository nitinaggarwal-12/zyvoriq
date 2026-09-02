#!/usr/bin/env node
// Preflight for Option C. Run from the repo root.
//
//   1. Long chain     GEMINI_API_KEY=... node scripts/qa/native_preflight.mjs long
//   2. Resume         GEMINI_API_KEY=... node scripts/qa/native_preflight.mjs resume
//                     (fails on purpose after 2 hops, then re-run the SAME command)
//   3. Real script    GEMINI_API_KEY=... node scripts/qa/native_preflight.mjs real
//
// Each mode writes an mp4 plus a .checkpoint.json while running, and prints a
// probe of the result so you can check duration / resolution / fps.

import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { generateContinuousReel, maxBeatsForDuration } from "../studio1_native.mjs";

const execFileAsync = promisify(execFile);
const mode = process.argv[2] || "long";

const CHARACTER =
  "A woman in her early 30s with dark curly hair tied back, wearing a plain navy " +
  "t-shirt, against a plain light grey seamless studio backdrop, soft even frontal " +
  "lighting, medium shot, speaking directly to camera.";

// 6 hops ~= 43s. Plain declarative lines: isolates drift from script complexity.
const LONG_BEATS = [
  "Mars is the fourth planet from the sun, and it is far colder than most people imagine.",
  "The average surface temperature is about minus sixty degrees celsius.",
  "That is colder than any winter ever recorded on Earth.",
  "The thin atmosphere cannot hold on to heat at all.",
  "Sunlight arrives, warms the surface, and the heat escapes almost immediately.",
  "So Mars is not cold because it is far away. It is cold because it cannot keep what it gets.",
];

// A realistic planner-shaped script: hook, question, emphasis, CTA.
// This is the one that tests whether Veo speaks awkward beats cleanly.
const REAL_BEATS = [
  "Okay, so why is the sky blue? Most people get this completely wrong.",
  "It is not because the sky is reflecting the ocean. That is a myth.",
  "Sunlight looks white, but it is actually every colour mixed together.",
  "When it hits our atmosphere, blue light scatters far more than red light.",
  "So blue bounces around the whole sky, and that is what reaches your eyes.",
  "Follow for more things you were taught wrong at school.",
];

const CONFIGS = {
  long:   { beats: LONG_BEATS, out: "preflight_long.mp4",   failAt: null },
  resume: { beats: LONG_BEATS, out: "preflight_resume.mp4", failAt: 2 },
  real:   { beats: REAL_BEATS, out: "preflight_real.mp4",   failAt: null },
};

const cfg = CONFIGS[mode];
if (!cfg) throw new Error(`unknown mode "${mode}" — use long, resume or real`);

const ckptPath = `${cfg.out}.checkpoint.json`;
let checkpoint;
try {
  checkpoint = JSON.parse(await fs.readFile(ckptPath, "utf8"));
  console.log(`resuming: ${checkpoint.completedBeats} of ${cfg.beats.length} beats already done\n`);
} catch { /* fresh run */ }

console.log(`mode: ${mode}`);
console.log(`beats: ${cfg.beats.length} (ceiling ${maxBeatsForDuration()})`);
console.log(`expected: ~${8 + (cfg.beats.length - 1) * 7}s, ~${cfg.beats.length * 75}s of wall time\n`);

const started = Date.now();
let result;
try {
  result = await generateContinuousReel({
    beats: cfg.beats,
    character: CHARACTER,
    tone: "Confident & conversational",
    checkpoint,
    onProgress: ({ index, total, phase }) =>
      console.log(`[${index + 1}/${total}] ${phase}...`),
    onHop: async ({ completedBeats, uri, index }) => {
      await fs.writeFile(ckptPath, JSON.stringify({ completedBeats, uri, savedAt: new Date().toISOString() }, null, 2));
      // Simulated crash, to prove the checkpoint actually resumes.
      if (cfg.failAt && !checkpoint && index + 1 === cfg.failAt) {
        throw new Error(`SIMULATED FAILURE after hop ${cfg.failAt} — re-run the same command to resume`);
      }
    },
  });
} catch (err) {
  console.error(`\n${err.message}`);
  if (String(err.message).includes("SIMULATED")) {
    console.log(`\ncheckpoint written to ${ckptPath}. Re-run:\n  GEMINI_API_KEY=... node scripts/qa/native_preflight.mjs ${mode}`);
    process.exit(0);
  }
  console.log(`\nA checkpoint may exist at ${ckptPath} — re-running resumes from there.`);
  process.exit(1);
}

await fs.writeFile(cfg.out, result.buffer);
await fs.rm(ckptPath, { force: true });

const mins = ((Date.now() - started) / 60000).toFixed(1);
console.log(`\nsaved ${cfg.out} — ${result.hops} hops, resumed from beat ${result.resumedFrom + 1}, ${mins} min`);

try {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate,nb_frames",
    "-show_entries", "format=duration,size",
    "-of", "default=noprint_wrappers=1",
    cfg.out,
  ]);
  console.log(`\n${stdout.trim()}`);
} catch {
  console.log("\n(ffprobe not found — skipping probe)");
}

console.log(`
Now watch ${cfg.out} and judge:

  VOICE     same narrator from first word to last?
  IDENTITY  compare the opening second against the closing second
  LIP SYNC  still tight on the final hop?
  SEAMS     ~every 7s. Any jump, flicker or pause?
${mode === "real" ? "  DELIVERY  does she speak the questions and the CTA naturally, no ad-libbing?\n" : ""}
Any failure here is cheaper to find now than after the pipeline is rewritten.
`);
