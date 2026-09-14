#!/usr/bin/env node
/**
 * GUARD: SINGLE HOOKS SOURCE
 * ==========================
 * Enforces the architectural invariant: there is exactly ONE hooks.json
 * system-wide, at ~/.gemini/config/hooks.json. Every other location must be
 * either absent or a symlink pointing at it.
 *
 * WHY THIS EXISTS
 * ---------------
 * Before consolidation there were 11 hooks.json files on the Mac and 5 more on
 * Cloudtop. They had drifted to different schema versions, and because the old
 * resolver walked upward from cwd, a stale shadow copy could silently win and
 * govern a project with rules its author never saw. Cloudtop's
 * Documents/zyvoriq/.gemini/hooks.json did exactly that.
 *
 * Symlinks (not committed copies) are used deliberately: a repo-committed
 * symlink to an absolute home path breaks across the Mac<->Cloudtop boundary,
 * so links are created per-machine and this guard is what keeps CI honest.
 *
 * USAGE
 *   node scripts/guards/guard_single_hooks_source.mjs          # report + exit 1 on drift
 *   node scripts/guards/guard_single_hooks_source.mjs --fix    # relink offenders
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = os.homedir();
const CANONICAL = path.join(HOME, ".gemini", "config", "hooks.json");
const FIX = process.argv.includes("--fix");

// Other plugins legitimately ship their own hooks.json. Only omni_guard is
// subject to the single-source rule.
const EXEMPT = [/googlecloudtools\.datacloud_telemetry/];

const SEARCH_ROOTS = [
  path.join(HOME, "Documents"),
  path.join(HOME, ".gemini", "config", "plugins")
];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".venv", "__pycache__"]);

function walk(dir, out = [], depth = 0) {
  if (depth > 6) return out;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out, depth + 1);
    } else if (e.name === "hooks.json") {
      out.push(full);
    }
  }
  return out;
}

function main() {
  if (!fs.existsSync(CANONICAL)) {
    console.error("FAIL: canonical hooks.json is missing at " + CANONICAL);
    process.exit(1);
  }

  let canonicalVersion = "unparseable";
  try { canonicalVersion = JSON.parse(fs.readFileSync(CANONICAL, "utf-8")).version; }
  catch (e) {
    console.error("FAIL: canonical hooks.json is not valid JSON: " + e.message);
    process.exit(1);
  }

  console.log("Canonical : " + CANONICAL);
  console.log("Version   : " + canonicalVersion);
  console.log("");

  const found = SEARCH_ROOTS.flatMap(r => walk(r));
  const offenders = [];
  let linked = 0, exempt = 0;

  for (const f of found) {
    if (path.resolve(f) === path.resolve(CANONICAL)) continue;
    if (EXEMPT.some(rx => rx.test(f))) { exempt++; continue; }

    const isLink = fs.lstatSync(f).isSymbolicLink();
    const target = isLink ? path.resolve(path.dirname(f), fs.readlinkSync(f)) : null;

    if (isLink && target === path.resolve(CANONICAL)) { linked++; continue; }

    if (isLink) offenders.push({ file: f, why: "symlink points elsewhere -> " + target });
    else offenders.push({ file: f, why: "SHADOW COPY (regular file)" });
  }

  console.log("Conforming symlinks : " + linked);
  console.log("Exempt (other plugin): " + exempt);
  console.log("Offenders            : " + offenders.length);

  if (offenders.length === 0) {
    console.log("");
    console.log("PASS: exactly one hooks.json governs the system.");
    process.exit(0);
  }

  console.log("");
  for (const o of offenders) {
    let ver = "?";
    try { ver = JSON.parse(fs.readFileSync(o.file, "utf-8")).version || "none"; } catch {}
    console.log("  [" + o.why + "] v" + ver);
    console.log("    " + o.file);
  }

  if (!FIX) {
    console.log("");
    console.log("FAIL: shadow hooks.json detected. A shadow copy can silently override the");
    console.log("canonical ruleset for a project, governing it with rules nobody reviewed.");
    console.log("Re-run with --fix to relink, or delete the offending files.");
    process.exit(1);
  }

  console.log("");
  for (const o of offenders) {
    const bk = o.file + ".shadow_backup";
    try {
      if (!fs.lstatSync(o.file).isSymbolicLink()) fs.copyFileSync(o.file, bk);
      fs.rmSync(o.file);
      fs.symlinkSync(CANONICAL, o.file);
      console.log("  RELINKED " + o.file);
    } catch (e) {
      console.log("  FAILED   " + o.file + " : " + e.message);
    }
  }
  console.log("");
  console.log("Relinked " + offenders.length + " file(s). Re-run without --fix to verify.");
  process.exit(0);
}

main();
