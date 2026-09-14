#!/usr/bin/env node
/**
 * FALSIFIABILITY FIXTURE — CROSS_CUT_RESET_LOOP.
 *
 * A gate that has never been observed to fail is an assertion, not a gate.
 *
 * scratch/yt_perfect/master.mp4 is a real master that scored PASS on all sixteen
 * pre-existing checks while containing a textbook Frame-0 Reset Trap: shots 1, 3
 * and 5 were each conditioned on the same static anchor plate, so all three open
 * on a near-identical frame (measured 38 dB, ceiling 25 dB) and all three ignore
 * the singing directive in favour of the plate's closed-mouth smile.
 *
 * This fixture points the new check at that master and requires it to FAIL with
 * CROSS_CUT_RESET_LOOP. Exit 0 means the gate correctly rejected a bad master.
 */
import fs from "node:fs";
import { runOmniSyncAudit } from "./yt_audit.mjs";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY not set"); process.exit(1); }

const WORK = "scratch/yt_perfect";
const plan = JSON.parse(fs.readFileSync(`${WORK}/shotplan.json`, "utf-8"));
const cutTimes = plan.map((s) => s.startSec);
const timeline = JSON.parse(fs.readFileSync(`${WORK}/timeline.json`, "utf-8"));

console.log(`Fixture: auditing a master known to contain a reset loop.`);
console.log(`  shot boundaries: ${cutTimes.map((t) => t.toFixed(2)).join(", ")}`);

const res = await runOmniSyncAudit({
  apiKey: API_KEY,
  host: "nitinagga.c.googlers.com",
  remoteMaster: `~/zyvoriq/${WORK}/master.mp4`,
  remoteFramesDir: `~/zyvoriq/${WORK}/fixture_frames`,
  localDir: `${WORK}/fixture_out`,
  targetDuration: 24,
  windowStart: 0,
  timeline,
  lyricLines: [],          // isolate the deterministic half; vision checks need no lyrics
  cutTimes,
  topic: "reset-loop fixture",
  genre: "MUSIC_VIDEO",
});

const codes = (res.failures || []).map((f) => f.code);
console.log(`\nVerdict: ${res.pass ? "PASS" : "FAIL"}  failures=[${codes.join(", ")}]`);

if (!codes.includes("CROSS_CUT_RESET_LOOP")) {
  console.error(
    "\nFIXTURE FAILED: the gate did NOT report CROSS_CUT_RESET_LOOP on a master " +
    "whose shots 1/3/5 open at 38 dB against a 25 dB ceiling. The check is blind."
  );
  process.exit(1);
}
console.log("\nFIXTURE PASSED: the gate correctly rejected the reset loop.");
