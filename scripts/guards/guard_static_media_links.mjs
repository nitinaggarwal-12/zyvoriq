#!/usr/bin/env node
/**
 * Static media link guard.
 *
 * Scans app/components/lib source for hardcoded `/assets/**` media references
 * and fails if the referenced file does not physically exist under `public/`.
 *
 * This exists because four `CANONICAL_SHOWCASES` entries in MyReelsLibrary.tsx
 * shipped with `status: "READY"` while pointing at .mp4 masters that were never
 * rendered, producing 404s in every video player that mounted them.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const ASSET_RE = /["'`](\/assets\/[A-Za-z0-9_\-./]+\.(?:mp4|mov|webm|mp3|wav|m4a|jpg|jpeg|png|webp|gif|svg|vtt|srt))["'`]/g;

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...walk(full));
    } else if (SCAN_EXT.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

const missing = [];
let refCount = 0;
const seen = new Set();

for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const source = fs.readFileSync(file, "utf8");
    const lines = source.split("\n");
    lines.forEach((line, index) => {
      // Skip dynamic paths — they resolve at runtime and cannot be statically checked.
      if (line.includes("${")) return;
      for (const match of line.matchAll(ASSET_RE)) {
        const url = match[1];
        refCount++;
        const key = `${url}`;
        const onDisk = path.join(ROOT, "public", url);
        if (!fs.existsSync(onDisk)) {
          if (seen.has(key)) continue;
          seen.add(key);
          missing.push({ url, file: path.relative(ROOT, file), line: index + 1 });
        }
      }
    });
  }
}

console.log(`[guard:links] scanned ${refCount} static /assets references across ${SCAN_DIRS.join(", ")}`);

// `scratch/` is gitignored, so it is never present in the Railway build context.
// A /scratch/ URL can appear to work locally (it used to resolve through a
// public/scratch symlink) while serving a 404 HTML page to every real user.
const SCRATCH_RE = /["'`](\/scratch\/[A-Za-z0-9_\-./]+)["'`]/g;
const scratchRefs = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const match of line.matchAll(SCRATCH_RE)) {
        scratchRefs.push({ url: match[1], file: path.relative(ROOT, file), line: index + 1 });
      }
    });
  }
}

if (scratchRefs.length) {
  console.error(`\n🚨 ${scratchRefs.length} reference(s) point at gitignored scratch/ and will 404 in production:\n`);
  for (const s of scratchRefs) {
    console.error(`  ${s.url}\n    → ${s.file}:${s.line}`);
  }
  console.error("\nServe the asset from public/assets/ instead.\n");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Anchor integrity: every "/#section" target used by a nav link or a
// next.config.mjs redirect must correspond to a real id="section" rendered by
// some component. The entire navbar once pointed at five ids that did not
// exist, silently dumping users at the top of the homepage.
// ---------------------------------------------------------------------------
const declaredIds = new Set();
const ID_RE = /\bid=["'`]([A-Za-z0-9_-]+)["'`]/g;
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    for (const m of fs.readFileSync(file, "utf8").matchAll(ID_RE)) declaredIds.add(m[1]);
  }
}

// Only navigation contexts count. A bare `#...` string is just as likely to be
// a hex colour ("#ffffff") or a social hashtag ("#viral"), neither of which is
// a page anchor.
const ANCHOR_RE = /(?:href=|destination:\s*|action:\s*["'`]link:)["'`](?:\/)?#([A-Za-z][A-Za-z0-9_-]*)["'`]/g;
const anchorRefs = [];
const anchorSources = [...SCAN_DIRS.map((d) => path.join(ROOT, d))];
const anchorFiles = anchorSources.flatMap((d) => walk(d));
anchorFiles.push(path.join(ROOT, "next.config.mjs"));

for (const file of anchorFiles) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    for (const m of line.matchAll(ANCHOR_RE)) {
      const anchor = m[1];
      if (!declaredIds.has(anchor)) {
        anchorRefs.push({ anchor, file: path.relative(ROOT, file), line: index + 1 });
      }
    }
  });
}

if (anchorRefs.length) {
  console.error(`\n🚨 ${anchorRefs.length} in-page anchor link(s) target an id that no component renders:\n`);
  for (const a of anchorRefs) {
    console.error(`  #${a.anchor}\n    → ${a.file}:${a.line}`);
  }
  console.error("\nPoint the link at a section id that actually exists.\n");
  process.exit(1);
}

console.log(`[guard:links] verified in-page anchors against ${declaredIds.size} rendered element ids`);

if (missing.length) {
  console.error(`\n🚨 ${missing.length} static media reference(s) have no file on disk:\n`);
  for (const m of missing) {
    console.error(`  ${m.url}\n    → ${m.file}:${m.line}`);
  }
  console.error(
    "\nFix by rendering the asset, correcting the path, or removing the entry.\n" +
    "Never point a UI entry at a master that was never generated.\n"
  );
  process.exit(1);
}

console.log("✓ PASS: every hardcoded /assets media reference resolves to a real file on disk.");
