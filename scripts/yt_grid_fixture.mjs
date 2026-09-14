#!/usr/bin/env node
// FIXTURE: point the shot-grid guards at a recorded bad grid and require them
// to reject it.
//
// WHY THIS EXISTS. Six times in a row on this pipeline, automation reported a
// clean run and direct inspection then found a defect. Run #3 was the sharpest
// case: it produced three uniform 8s shots whose vocal directives spanned
// instrumental gaps and reused a lyric line, and scored a full 16/16 PASS. The
// reason was not a bug in any single gate - it was that no gate measured the
// thing that had been lost, and nobody had ever watched the gates fail.
//
// So the guards do not get to be trusted on the strength of their source code.
// scripts/fixtures/grid_run3_uniform_regression.json is the real shot plan that
// run #3 produced, regenerated through the current code path with --allow-uniform
// so the grid is preserved exactly. If a future change stops these guards from
// catching it, this fixture fails.
//
// Exit 0 = the guards correctly rejected the bad grid.
// Exit 1 = the guards have gone blind; do not trust a PASS from them.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkLyricFocus, describeLyricFocus, PHRASE_GAP_MAX, SILENT_MOUTH_BUDGET } from "./lib/grid_guards.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const badPath = process.argv[2] || path.join(here, "fixtures", "grid_run3_uniform_regression.json");
const bad = JSON.parse(fs.readFileSync(badPath, "utf-8"));

console.log(`Fixture grid: ${badPath}`);
console.log(`  ${bad.length} shot(s): ${bad.map((s) => `${s.durationSec}s`).join(", ")}`);

const res = checkLyricFocus(bad, { phraseGapMax: PHRASE_GAP_MAX });
const reasons = describeLyricFocus(res, PHRASE_GAP_MAX);
for (const r of reasons) console.log(`  [FAIL] ${r}`);

let failures = 0;
const expect = (name, cond, detail) => {
  console.log(`  ${cond ? "[ok]  " : "[MISS]"} ${name}${detail ? ` - ${detail}` : ""}`);
  if (!cond) failures++;
};

// Run #3's shot 3 spans the 17.08s -> 19.18s instrumental gap.
expect("disjoint directive detected", res.disjoint.length > 0,
  res.disjoint.map((d) => `shot ${d.index} gap ${d.gap.toFixed(2)}s`).join(", ") || "nothing found");
// Run #3's "Feel the beat..." line was handed to both shot 2 and shot 3.
expect("reused lyric line detected", res.reused.length > 0,
  res.reused.map((r) => `shots ${r.first}+${r.second}`).join(", ") || "nothing found");
expect("worst gap exceeds the limit", res.worstGap > PHRASE_GAP_MAX,
  `${res.worstGap.toFixed(2)}s vs ${PHRASE_GAP_MAX}s`);
expect("a human-readable reason is produced", reasons.length > 0);

// NEGATIVE CONTROL. A guard that rejects everything is as useless as one that
// rejects nothing, and is much harder to notice. Give it a clean grid - the same
// lyrics, one line per shot, no gaps - and require silence.
const clean = [
  { index: 1, durationSec: 4, lyric: "a", lyricParts: [{ text: "a", start: 0.0, end: 3.9 }] },
  { index: 2, durationSec: 4, lyric: "b", lyricParts: [{ text: "b", start: 4.0, end: 7.9 }] },
  { index: 3, durationSec: 4, lyric: "c / d", lyricParts: [{ text: "c", start: 8.0, end: 9.8 }, { text: "d", start: 10.0, end: 11.9 }] },
];
const cleanRes = checkLyricFocus(clean, { phraseGapMax: PHRASE_GAP_MAX });
expect("clean grid passes (no false positive)",
  cleanRes.disjoint.length === 0 && cleanRes.reused.length === 0,
  `${cleanRes.disjoint.length} disjoint, ${cleanRes.reused.length} reused`);

// A sung sentence that WhisperX split across breaths must NOT be rejected: that
// false positive is what the first version of this guard actually did.
const breaths = [
  { index: 1, durationSec: 4.9, lyric: "Golden light on the terracotta / tiles catch your eye / and it's taking me miles",
    lyricParts: [
      { text: "Golden light on the terracotta", start: 0.50, end: 2.10 },
      { text: "tiles catch your eye", start: 2.45, end: 3.40 },
      { text: "and it's taking me miles", start: 3.80, end: 5.30 },
    ] },
];
const breathRes = checkLyricFocus(breaths, { phraseGapMax: PHRASE_GAP_MAX });
expect("breath-split phrase accepted (no false positive)", breathRes.disjoint.length === 0,
  `worst gap ${breathRes.worstGap.toFixed(2)}s`);

// SECOND RECORDED GRID: run #4.
//
// This one matters because the guards above reported it CLEAN. Its shot 2 spans
// 3.447-8.888s, is only 35% sung, and is therefore planned as an instrumental -
// yet it carries the lyric "terra cotta floor." The gap measure could not see
// it: a shot holding a single lyric line has no intra-shot gap to measure. The
// hole was found by reading a grid, not by a failing test, which is exactly the
// pattern this fixture exists to break.
const r4Path = path.join(here, "fixtures", "grid_run4_silent_mouth.json");
if (fs.existsSync(r4Path)) {
  const r4 = JSON.parse(fs.readFileSync(r4Path, "utf-8"));
  const r4res = checkLyricFocus(r4, {});
  console.log(`\nFixture grid: ${r4Path}`);
  for (const r of describeLyricFocus(r4res)) console.log(`  [FAIL] ${r}`);
  expect("silent-mouth-over-lyrics shot detected", r4res.mismatched.length > 0,
    r4res.mismatched.map((m) => `shot ${m.index} ${m.sungSec.toFixed(2)}s sung`).join(", ") || "nothing found");
  expect("run #4's gap/reuse checks stay quiet (the hole was specific)",
    r4res.disjoint.length === 0 && r4res.reused.length === 0,
    `${r4res.disjoint.length} disjoint, ${r4res.reused.length} reused`);
} else {
  console.log(`\n[skip] ${r4Path} not present`);
}

// NEGATIVE CONTROL for the new check: a genuinely instrumental shot, with no
// lyric at all, must not be flagged.
const instrumental = [
  { index: 1, durationSec: 4, singing: false, lyric: "", lyricParts: [] },
  { index: 2, durationSec: 4, singing: true, lyric: "a", sungFraction: 0.9, lyricParts: [{ text: "a", start: 4.0, end: 7.6 }] },
];
const instRes = checkLyricFocus(instrumental, {});
expect("truly instrumental shot not flagged", instRes.mismatched.length === 0);

// And a shot with a trace of lyric under the budget must not be flagged either.
const trace = [
  { index: 1, durationSec: 6, singing: false, sungFraction: 0.05, lyric: "oh",
    lyricParts: [{ text: "oh", start: 0.1, end: 0.4 }] },
];
expect(`trace lyric under the ${SILENT_MOUTH_BUDGET}s budget not flagged`,
  checkLyricFocus(trace, {}).mismatched.length === 0);

if (failures) {
  console.error(`\nFIXTURE FAILED: ${failures} expectation(s) unmet. The grid guards cannot be trusted.`);
  process.exit(1);
}
console.log("\nFIXTURE PASSED: the guards rejected run #3's grid and accepted the clean ones.");
