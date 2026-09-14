#!/usr/bin/env node
/**
 * GUARD INSTALLER / DRIFT DETECTOR
 * =================================
 * ROOT CAUSE THIS FIXES:
 * The agent runtime loads lifecycle hooks from ~/.gemini/config/plugins/zyvoriq_guard/.
 * Editing <repo>/plugins/zyvoriq_guard/ has ZERO runtime effect. Rules 13 & 14 were
 * authored into the repo copy and silently never loaded - the governance update was
 * a complete no-op while reporting success.
 *
 * Usage:
 *   node scripts/guards/sync_guard_plugins.mjs           # install repo -> runtime
 *   node scripts/guards/sync_guard_plugins.mjs --check   # fail if drifted (CI gate)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const REPO_SRC = path.resolve(process.cwd(), "plugins", "zyvoriq_guard");
const RUNTIME_DST = path.join(os.homedir(), ".gemini", "config", "plugins", "zyvoriq_guard");
const checkOnly = process.argv.includes("--check");

function sha(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 12);
}

function walk(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, base, acc);
    else acc.push(path.relative(base, full));
  }
  return acc;
}

if (!fs.existsSync(REPO_SRC)) {
  console.error("FATAL: repo guard source not found at " + REPO_SRC);
  process.exit(1);
}

const files = walk(REPO_SRC);
const drift = [];
const skipped = [];

// hooks.json is the SINGLE SOURCE OF TRUTH at ~/.gemini/config/hooks.json and
// every other location is a symlink to it. Copying it here would resolve the
// symlink and write a regular file into the runtime path - silently recreating
// the exact shadow-config problem that consolidation removed. Ownership of
// this file belongs to guard_single_hooks_source.mjs, not to this sync.
const NEVER_SYNC = new Set(["hooks.json"]);

for (const rel of files) {
  if (NEVER_SYNC.has(path.basename(rel))) { skipped.push(rel); continue; }

  const src = path.join(REPO_SRC, rel);
  const dst = path.join(RUNTIME_DST, rel);
  const srcHash = sha(src);
  const dstHash = fs.existsSync(dst) ? sha(dst) : null;

  if (srcHash !== dstHash) {
    drift.push({ rel, srcHash, dstHash: dstHash || "MISSING" });
    if (!checkOnly) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      try { fs.chmodSync(dst, 0o755); } catch {}
    }
  }
}

console.log("=".repeat(72));
console.log("ZYVORIQ GUARD INSTALL-PATH INTEGRITY  (Rule 15)");
console.log("=".repeat(72));
console.log("  repo source : " + REPO_SRC);
console.log("  runtime dst : " + RUNTIME_DST);
console.log("  files       : " + files.length);

if (drift.length === 0) {
  console.log("\nSTATUS: IN SYNC - runtime guards match repo exactly.\n");
  process.exit(0);
}

console.log("\nDRIFT DETECTED (" + drift.length + " file(s)):");
for (const d of drift) console.log("   - " + d.rel + "   repo=" + d.srcHash + "  runtime=" + d.dstHash);

if (checkOnly) {
  console.error("\nFAIL: Runtime guards are STALE. Repo edits are NOT in effect.");
  console.error("Run: npm run guard:sync\n");
  process.exit(1);
}

console.log("\nSTATUS: SYNCED - " + drift.length + " file(s) installed to runtime. Guards are now live.\n");
