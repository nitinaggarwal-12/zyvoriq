#!/usr/bin/env node
/**
 * YT MATRIX RUNNER - 20 unique reels, one factor isolated at a time.
 *
 * WHY A MATRIX AND NOT 20 ARBITRARY REELS
 * ---------------------------------------
 * The sync defect is fixed and verified. The blocker is now IDENTITY_DISCONTINUITY
 * and VISIBLE_AI_GENERATION. Generating 20 reels on one configuration would buy
 * 20 instances of the same failure and teach nothing. Each arm therefore varies
 * exactly one factor so the resulting audits are comparable.
 *
 * FACTORS
 *   clock    whisperx+demucs (measured word timings) vs gemini-2.5-pro (estimated)
 *   cadence  how often the chain re-anchors to the identity plate.
 *            1 = every shot re-anchors (max identity lock, risks the frame-0
 *            reset loop GEMINI.md forbids), 4 = long chain (max drift).
 *   tier     veo-3.1 fast / lite / full. fast+lite carry the matrix; full is
 *            reserved for reference reels so the comparison is affordable.
 *
 * Topic is unique per reel by request. Topic variance is a real confound and is
 * reported as such - arms are balanced across it rather than pretending it is
 * controlled.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CONCURRENCY = Number(process.env.MATRIX_CONCURRENCY || 3);
const DURATION = Number(process.env.MATRIX_DURATION || 16);
const OUT = "scratch/yt_matrix";
const REPORT = path.join(OUT, "report.json");

const TOPICS = [
  "neon tokyo street crossing in the rain at midnight",
  "mumbai monsoon rooftop at night with neon city lights",
  "desert music festival at golden hour, dust and warm light",
  "seoul night market with glowing signs and street style",
  "paris rooftop at sunrise with soft morning light",
  "rio carnival street parade with feathers and drums",
  "iceland black sand beach under storm clouds",
  "havana courtyard on a warm afternoon with pastel walls",
  "lagos street party with bold colour and high energy",
  "swiss alpine cable car in snow and bright sun",
  "venice canal at dusk with lanterns on the water",
  "marrakech rooftop at night lit by lanterns",
  "new york subway platform with motion blur and city grit",
  "bali rice terrace on a misty morning",
  "london underground escalator at rush hour",
  "cape town clifftop in ocean wind at sunset",
  "istanbul spice bazaar in warm lamplight",
  "sydney harbour at night with fireworks reflections",
  "kyoto bamboo grove with green light filtering through",
  "dubai rooftop pool with a glittering night skyline",
];

// cadence x tier grid (16), clock control (2), full-tier reference (2)
const ARMS = [];
let t = 0;
for (const tier of ["fast", "lite"]) {
  for (const cadence of [1, 2, 3, 4]) {
    for (let rep = 0; rep < 2; rep++) {
      ARMS.push({ topic: TOPICS[t++], clock: "whisperx", tier, cadence, purpose: "cadence x tier" });
    }
  }
}
ARMS.push({ topic: TOPICS[t++], clock: "pro", tier: "fast", cadence: 2, purpose: "clock control" });
ARMS.push({ topic: TOPICS[t++], clock: "pro", tier: "fast", cadence: 2, purpose: "clock control" });
ARMS.push({ topic: TOPICS[t++], clock: "whisperx", tier: "full", cadence: 1, purpose: "full-tier reference" });
ARMS.push({ topic: TOPICS[t++], clock: "whisperx", tier: "full", cadence: 1, purpose: "full-tier reference" });

ARMS.forEach((a, i) => {
  a.index = i + 1;
  a.id = `m${String(i + 1).padStart(2, "0")}_${a.clock}_${a.tier}_c${a.cadence}`;
  a.work = path.join(OUT, a.id);
});

fs.mkdirSync(OUT, { recursive: true });

function runArm(arm) {
  return new Promise((resolve) => {
    fs.mkdirSync(arm.work, { recursive: true });
    const logPath = path.join(arm.work, "run.log");
    const logFd = fs.openSync(logPath, "w");
    const started = Date.now();
    const child = spawn("node", [
      "scripts/yt_pipeline.mjs",
      "--topic", arm.topic,
      "--duration", String(DURATION),
      "--work", arm.work,
      "--clock", arm.clock,
      "--veo-tier", arm.tier,
      "--anchor-cadence", String(arm.cadence),
      "--label", arm.id,
    ], { stdio: ["ignore", logFd, logFd], env: process.env });

    child.on("exit", (code) => {
      fs.closeSync(logFd);
      const wallSec = Math.round((Date.now() - started) / 1000);
      let audit = null;
      const auditPath = path.join(arm.work, "audit.json");
      if (fs.existsSync(auditPath)) {
        try { audit = JSON.parse(fs.readFileSync(auditPath, "utf-8")); } catch {}
      }
      const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf-8") : "";
      const lastErr = (log.match(/^(?:Error|FATAL|TypeError):.*$/m) || [null])[0];
      const result = {
        ...arm,
        exitCode: code,
        wallSec,
        masterExists: fs.existsSync(path.join(arm.work, "master.mp4")),
        verdict: audit?.verdict ?? (code === 0 ? "UNKNOWN" : "PIPELINE_ERROR"),
        failures: (audit?.failures || []).map((f) => f.code),
        failureDetail: (audit?.failures || []).map((f) => `${f.code}: ${f.detail}`),
        clockEngine: (log.match(/Clock: (\S+)/) || [])[1] || null,
        lyricLines: Number((log.match(/Lyria clock: (\d+) lyric/) || [])[1] || 0),
        plannedWastePct: Number((log.match(/surplus ([\d.]+)%/) || [])[1] || 0),
        shots: (log.match(/^\s+shot \d+ /gm) || []).length,
        error: lastErr,
      };
      console.log(`[${arm.index}/20] ${arm.id} -> ${result.verdict} (${wallSec}s)` +
        (result.failures.length ? ` [${result.failures.join(", ")}]` : "") +
        (lastErr ? ` ${lastErr.slice(0, 90)}` : ""));
      resolve(result);
    });
  });
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < ARMS.length) {
    const arm = ARMS[cursor++];
    results.push(await runArm(arm));
    fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));
  }
}

console.log(`YT MATRIX: ${ARMS.length} reels, ${DURATION}s each, concurrency ${CONCURRENCY}`);
console.table(ARMS.map((a) => ({ id: a.id, clock: a.clock, tier: a.tier, cadence: a.cadence, purpose: a.purpose })));
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
fs.writeFileSync(REPORT, JSON.stringify(results, null, 2));
results.sort((a, b) => a.index - b.index);
console.log("\n===== MATRIX COMPLETE =====");
console.log(`report: ${REPORT}`);
const pass = results.filter((r) => r.verdict === "PASS").length;
console.log(`PASS ${pass}/${results.length}`);
