#!/usr/bin/env node
/**
 * Two-sided proof that OMNI_SYNC_AUDIT is a real gate:
 *   BAD  master (the reel the user rejected: 32.0s vs 24s target, -22 LUFS, 96 kHz) -> must FAIL
 *   GOOD master (same content, re-mastered to spec)                                  -> deterministic checks must all clear
 * Exits non-zero if the gate does not behave as required.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { runOmniSyncAudit } from "./yt_audit.mjs";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("FATAL: GEMINI_API_KEY not set"); process.exit(1); }
const HOST = "nitinagga.c.googlers.com";
const RBASE = "~/zyvoriq/scratch/audit_selftest";

// The source reel is SLICE_OF_LIFE narration, not a sung track, so the vocal
// timeline is declared instrumental. That is the honest input for this fixture.
const timeline = { has_sung_vocals: false, first_vocal_onset_sec: null };

const cases = [
  { name: "BAD  (rejected live reel)", remote: "~/zyvoriq/scratch/live_reel/reel.mp4", dir: "scratch/audit_selftest_bad",  target: 24 },
  { name: "GOOD (re-mastered to spec)", remote: `${RBASE}/good_master.mp4`,            dir: "scratch/audit_selftest_good", target: 24 },
];

const results = {};
for (const c of cases) {
  fs.mkdirSync(c.dir, { recursive: true });
  console.log(`\n===== ${c.name} =====`);
  const r = await runOmniSyncAudit({
    apiKey: API_KEY, host: HOST,
    remoteMaster: c.remote,
    remoteFramesDir: `${RBASE}/frames_${c.dir.split("_").pop()}`,
    localDir: c.dir, targetDuration: c.target,
    windowStart: 0, timeline,
    topic: "selftest fixture", genre: "SELFTEST",
  });
  results[c.name] = r;
  console.log(`  VERDICT: ${r.verdict}  codes=[${r.failures.map(f => f.code).join(", ") || "none"}]`);
}

const bad = results["BAD  (rejected live reel)"];
const good = results["GOOD (re-mastered to spec)"];
const badCodes = new Set(bad.failures.map(f => f.code));
const goodCodes = new Set(good.failures.map(f => f.code));
const DETERMINISTIC = ["DURATION_DRIFT", "RESOLUTION_MISMATCH", "FPS_MISMATCH", "SAMPLE_RATE_MISMATCH",
  "LOUDNESS_OUT_OF_SPEC", "TRUE_PEAK_OVER", "AUDIO_SPECTRUM_GUTTED", "DIGITAL_SILENCE"];

const assertions = [];
const check = (label, cond, detail) => { assertions.push({ label, ok: !!cond, detail }); console.log(`${cond ? "  OK  " : "  XX  "} ${label} :: ${detail}`); };

console.log("\n===== ASSERTIONS =====");
check("gate FAILS the rejected reel", bad.verdict === "FAIL", `verdict=${bad.verdict}`);
check("gate catches the 32s-vs-24s drift", badCodes.has("DURATION_DRIFT"), [...badCodes].join(",") || "none");
check("gate catches the loudness deficit", badCodes.has("LOUDNESS_OUT_OF_SPEC"), `lufs=${bad.master_measured.lufs}`);
check("gate catches the 96kHz sample rate", badCodes.has("SAMPLE_RATE_MISMATCH"), `sr=${bad.master_measured.sampleRate}`);
check("gate clears ALL deterministic checks on the conformant master",
  DETERMINISTIC.every(c => !goodCodes.has(c)),
  `remaining=[${DETERMINISTIC.filter(c => goodCodes.has(c)).join(",") || "none"}]`);
check("gate actually reached Omni (not skipped)", bad.omni_http_status === 200 && good.omni_http_status === 200,
  `bad=${bad.omni_http_status} good=${good.omni_http_status}`);
check("Omni returned per-frame observations", Array.isArray(good.omni_vision?.frames) && good.omni_vision.frames.length > 0,
  `frames=${good.omni_vision?.frames?.length ?? 0}`);

console.log("\n--- GOOD master vision verdict (reported honestly, not asserted away) ---");
console.log(JSON.stringify({
  verdict: good.verdict,
  identity_continuity: good.omni_vision?.identity_continuity,
  wardrobe_continuity: good.omni_vision?.wardrobe_continuity,
  ai_artifact_severity: good.omni_vision?.ai_artifact_severity,
  artifact_notes: good.omni_vision?.artifact_notes,
  failures: good.failures,
}, null, 2));

// CASE 3: the leading lip/vocal dead zone the user found by watching the reel.
// Delegated to the standalone fixture so there is exactly one definition of it.
// This is the case that did NOT exist when sync was first reported "fixed";
// the old per-line check scores 6/6 on this same master.
console.log("\n===== CASE 3: leading desync fixture =====");
let desyncOk = false, desyncDetail = "not run";
try {
  execFileSync("node", ["scripts/yt_audit_fixture_desync.mjs"], { stdio: "inherit", env: process.env });
  desyncOk = true; desyncDetail = "fixture exited 0 (gate failed the known-bad master for the right reason)";
} catch (e) {
  desyncDetail = `fixture exited ${e.status} - the gate no longer detects the leading dead zone`;
}
check("gate FAILS the leading lip/vocal dead zone", desyncOk, desyncDetail);

fs.writeFileSync("scratch/audit_selftest_report.json", JSON.stringify({ assertions, bad, good }, null, 2));
const failed = assertions.filter(a => !a.ok);
console.log(`\nSELFTEST: ${failed.length === 0 ? "PASS" : "FAIL"} (${assertions.length - failed.length}/${assertions.length})`);
process.exit(failed.length === 0 ? 0 : 1);
