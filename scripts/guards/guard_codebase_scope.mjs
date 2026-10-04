import fs from "node:fs";
import path from "node:path";

console.log("=================================================================");
console.log("🛡️ ZYVORIQ GUARD: CODEBASE SCOPE, ASSETS, MODELS & CLOUD TARGET");
console.log("=================================================================");

const SCAN_DIRS = ["app", "components", "lib"];
const BANNED_MODEL_IDS = [
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
  "imagen-3.0-generate-002",
  "veo-3.1-generate-001",
];
const BANNED_CLOUD_PATTERNS = [
  /\.up\.railway\.app/i,
  /\.railway\.internal/i,
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = SCAN_DIRS.flatMap((d) => walk(d));
const assetRegex = /["'`](\/(?:assets|renders)\/[a-zA-Z0-9_\-\/.]+?\.(?:mp4|mp3|wav|jpg|jpeg|png|webp|svg))(?:\?[^"'`]*)?["'`]/g;

let totalAssetRefs = 0;
const missingAssets = [];
const modelViolations = [];
const cloudViolations = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");

  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    totalAssetRefs++;
    const relPath = match[1];
    const diskPath = path.join("public", relPath);
    if (!fs.existsSync(diskPath)) {
      missingAssets.push({ file, asset: relPath });
    }
  }

  for (const badModel of BANNED_MODEL_IDS) {
    if (content.includes(badModel)) {
      modelViolations.push({ file, model: badModel });
    }
  }

  for (const pattern of BANNED_CLOUD_PATTERNS) {
    if (pattern.test(content)) {
      cloudViolations.push({ file, pattern: pattern.toString() });
    }
  }
}

console.log(`  ✓ Scanned ${allFiles.length} source files across app/, components/, lib/`);
console.log(`  ✓ Audited ${totalAssetRefs} static media references (Missing: ${missingAssets.length})`);
console.log(`  ✓ Audited model IDs (Retired/Invalid: ${modelViolations.length})`);
console.log(`  ✓ Audited Cloud Run / GCLB target compliance (Railway leaks: ${cloudViolations.length})`);

if (missingAssets.length > 0 || modelViolations.length > 0 || cloudViolations.length > 0) {
  for (const m of missingAssets) console.error(`  ❌ Missing asset in ${m.file}: ${m.asset}`);
  for (const v of modelViolations) console.error(`  ❌ Retired model ID in ${v.file}: ${v.model}`);
  for (const c of cloudViolations) console.error(`  ❌ Banned Railway reference in ${c.file}: ${c.pattern}`);
  process.exit(1);
}

console.log("✅ CODEBASE SCOPE GUARD PASSED (100% COMPLIANT)");
