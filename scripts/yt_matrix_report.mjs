#!/usr/bin/env node
/**
 * Turns scratch/yt_matrix/report.json into a readable analysis.
 *
 * Reports effects per factor. Topic is unique per reel by request, so topic
 * variance is a genuine confound: with n=4-8 per arm these are directional
 * signals, not significance tests, and are labelled that way rather than
 * dressed up as proof.
 */
import fs from "node:fs";

const REPORT = process.argv[2] || "scratch/yt_matrix/report.json";
const rows = JSON.parse(fs.readFileSync(REPORT, "utf-8"));

const done = rows.filter((r) => r.verdict !== "PIPELINE_ERROR");
const errored = rows.filter((r) => r.verdict === "PIPELINE_ERROR");

const CODES = ["IDENTITY_DISCONTINUITY", "VISIBLE_AI_GENERATION", "WARDROBE_DISCONTINUITY",
  "SILENT_MOUTH_OVER_LYRICS", "PHANTOM_VOCAL_MOUTHING", "VOCAL_LEAD_IN_TOO_LONG", "LYRIC_LINE_UNSUNG"];

const rate = (set, code) => {
  if (!set.length) return "-";
  const n = set.filter((r) => r.failures.includes(code)).length;
  return `${n}/${set.length}`;
};

function group(key) {
  const m = new Map();
  for (const r of done) {
    const k = String(r[key]);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
}

function table(title, key) {
  console.log(`\n### ${title}`);
  const hdr = ["arm", "n", "PASS", ...CODES.map((c) => c.replace(/_/g, " ").toLowerCase().slice(0, 22))];
  const lines = [hdr.join(" | "), hdr.map(() => "---").join(" | ")];
  for (const [k, set] of group(key)) {
    const pass = set.filter((r) => r.verdict === "PASS").length;
    lines.push([k, set.length, `${pass}/${set.length}`, ...CODES.map((c) => rate(set, c))].join(" | "));
  }
  console.log(lines.join("\n"));
}

console.log(`# YT Matrix Report\n`);
console.log(`${rows.length} reels attempted | ${done.length} produced an audit | ${errored.length} pipeline errors`);
const pass = done.filter((r) => r.verdict === "PASS").length;
console.log(`**PASS: ${pass}/${done.length}**`);

table("By anchor cadence (identity hypothesis)", "cadence");
table("By Veo tier (generation-quality hypothesis)", "tier");
table("By clock source", "clock");

console.log(`\n### Per reel`);
const h = ["#", "id", "verdict", "shots", "lines", "waste%", "wall s", "failures"];
console.log(h.join(" | ") + "\n" + h.map(() => "---").join(" | "));
for (const r of rows.sort((a, b) => a.index - b.index)) {
  console.log([r.index, r.id, r.verdict, r.shots, r.lyricLines, r.plannedWastePct,
    r.wallSec, r.failures.join(", ") || (r.error ? r.error.slice(0, 60) : "-")].join(" | "));
}

if (errored.length) {
  console.log(`\n### Pipeline errors (no audit produced)`);
  for (const r of errored) console.log(`- **${r.id}**: ${r.error || "unknown"}`);
}

const totalVeo = done.reduce((n, r) => n + (r.shots || 0), 0);
console.log(`\n_Veo generations: ~${totalVeo} across ${done.length} reels. Wall clock: ${Math.round(rows.reduce((n, r) => n + r.wallSec, 0) / 60)} cumulative minutes (concurrency 3)._`);
