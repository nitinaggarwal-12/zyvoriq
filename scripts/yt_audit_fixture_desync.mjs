#!/usr/bin/env node
/**
 * FALSIFIABILITY FIXTURE: leading lip/vocal dead zone.
 *
 * This is the fixture that did not exist when SILENT_MOUTH_OVER_LYRICS was
 * first claimed to be covered. The user found the defect by watching the reel
 * for ninety seconds while the gate reported PASS, so the gate is not trusted
 * again until it is observed FAILING on the exact master that contained it.
 *
 * Subject: production yt_1e1d20c0-d5c5-4930-8707-f73ca4b8482f. Its audio was
 * cut from the Lyria song at windowStart=0.048s, so song time minus 0.048
 * gives master time. Lyrics run from master t=1.862s but shot 1 holds a closed
 * mouth until the cut at t=3.85s -> a ~2s silent stretch under vocals.
 *
 * Expected verdict: FAIL, including SILENT_MOUTH_OVER_LYRICS.
 */
import fs from "node:fs";
import path from "node:path";
import { runOmniSyncAudit } from "./yt_audit.mjs";

const HOST = "nitinagga.c.googlers.com";
const PID = "yt_1e1d20c0-d5c5-4930-8707-f73ca4b8482f";
const REMOTE = `zyvoriq/scratch/yt/${PID}`;
const WINDOW_START = 0.048;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("GEMINI_API_KEY missing"); process.exit(2); }

const timeline = JSON.parse(fs.readFileSync(`scratch/yt/${PID}/timeline.json`, "utf-8"));
const toSec = (s) => { const [m, r] = String(s).split(":"); return Number(m) * 60 + Number(r); };

// The Lyria clock, rebased onto the master timebase and clipped to the master.
const MASTER_DUR = 24;
const lyricLines = timeline.transcription
  .map((l) => ({ text: l.text, start: toSec(l.start) - WINDOW_START, end: toSec(l.end) - WINDOW_START }))
  .filter((l) => l.end > 0 && l.start < MASTER_DUR)
  .map((l) => ({ ...l, start: Math.max(0, l.start), end: Math.min(MASTER_DUR, l.end) }));

console.log("Lyric clock on master timebase:");
for (const l of lyricLines) console.log(`  ${l.start.toFixed(3)}-${l.end.toFixed(3)}s  "${l.text}"`);
console.log("");

const localDir = path.resolve("scratch/yt_fixtures/desync");
fs.mkdirSync(localDir, { recursive: true });

const res = await runOmniSyncAudit({
  apiKey,
  host: HOST,
  remoteMaster: `${REMOTE}/master.mp4`,
  remoteFramesDir: `zyvoriq/scratch/yt_fixtures/desync_frames`,
  localDir,
  targetDuration: MASTER_DUR,
  windowStart: WINDOW_START,
  timeline,
  lyricLines,
  topic: "Mumbai monsoon",
  genre: "MUSIC_VIDEO",
});

console.log("\n=== FIXTURE RESULT ===");
console.log("verdict:", res.verdict);
console.log("failures:", JSON.stringify(res.failures, null, 2));

const codes = (res.failures || []).map((f) => f.code);
if (res.verdict !== "FAIL") {
  console.error("\nFIXTURE DID NOT FAIL -> the gate is still blind. Do not trust it.");
  process.exit(1);
}
if (!codes.includes("SILENT_MOUTH_OVER_LYRICS")) {
  console.error(`\nFAILED, but not for the right reason. Got [${codes.join(", ")}].`);
  console.error("The leading dead zone must be named explicitly, not caught incidentally.");
  process.exit(1);
}
console.log("\nOK: gate detected SILENT_MOUTH_OVER_LYRICS on the known-bad master.");
