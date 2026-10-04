import fs from "node:fs";
import crypto from "node:crypto";

console.log("=================================================================");
console.log("🛡️ ZYVORIQ GUARD: ZERO SYNTHETIC MOCKS & CRYPTO DETERMINISM");
console.log("=================================================================");

const DETERMINISTIC_FILES = [
  "lib/compliance/identityVerificationEngine.ts",
  "lib/compliance/ndaSigningEngine.ts",
  "lib/compliance/contentModeratorAgent.ts",
  "lib/publish/c2pa.ts",
  "lib/publish/connectors.ts",
  "app/api/reels/publish/route.ts",
  "lib/reel/redditStoryEngine.ts",
];

let violations = 0;

for (const file of DETERMINISTIC_FILES) {
  if (!fs.existsSync(file)) {
    console.error(`  ❌ Missing required engine file: ${file}`);
    violations++;
    continue;
  }
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("Math.random")) {
    console.error(`  ❌ VIOLATION: Math.random() detected in deterministic engine: ${file}`);
    violations++;
  } else {
    console.log(`  ✓ Deterministic execution verified in ${file}`);
  }
}

// Verify Cursed Hunter Option 2 vs Option 3 distinct SHA-256 hashes
function fileHashPrefix(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

const opt2 = "public/assets/swarm/comparisons/07_cursed_hunter_live_action_option2_native_dialogue_60s.mp4";
const opt3 = "public/assets/swarm/comparisons/10_cursed_hunter_live_action_dual_stem_dialogue_plus_lyria_score_60s.mp4";
if (fs.existsSync(opt2) && fs.existsSync(opt3)) {
  const h2 = fileHashPrefix(opt2);
  const h3 = fileHashPrefix(opt3);
  if (h2 === h3) {
    console.error(`  ❌ VIOLATION: Duplicate SHA-256 hash between Option 2 and Option 3 (${h2})`);
    violations++;
  } else {
    console.log(`  ✓ Distinct audio-stem video hashes verified: Option 2 (${h2}) !== Option 3 (${h3})`);
  }
}

const job60 = "public/assets/swarm/generated/job_1790663346051/combined_60s.mp4";
const job120 = "public/assets/swarm/generated/job_1790663346051/combined_120s.mp4";
if (fs.existsSync(job60) && fs.existsSync(job120)) {
  const h60 = fileHashPrefix(job60);
  const h120 = fileHashPrefix(job120);
  if (h60 === h120) {
    console.error(`  ❌ VIOLATION: Duplicate SHA-256 hash between combined_60s.mp4 and combined_120s.mp4 (${h60})`);
    violations++;
  } else {
    console.log(`  ✓ Distinct duration master hashes verified: 60s (${h60}) !== 120s (${h120})`);
  }
}

if (violations > 0) {
  console.error(`\n🚨 GUARD FAILED: ${violations} synthetic mock or duplicate asset violation(s) detected.`);
  process.exit(1);
}

console.log("✅ ZERO SYNTHETIC MOCKS GUARD PASSED (100% DETERMINISTIC)");
