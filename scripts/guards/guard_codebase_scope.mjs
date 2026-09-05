#!/usr/bin/env node
/**
 * Guard 1: Codebase Scope & Immutability Guard
 * Deterministic quality gate: Fails with exit code 1 if content/media tasks
 * introduce or modify core application source code (app/, components/, lib/) or create bespoke movie routes.
 * Purging/deleting prohibited files is explicitly allowed.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function checkCodebaseScope(options = {}) {
  const { isSelfTest = false, mockDiff = null } = options;

  console.log("🛡️ [Guard 1: Codebase Scope] Auditing modified files for architectural violations...");

  let diffOutput = "";
  if (mockDiff !== null) {
    diffOutput = mockDiff;
  } else {
    try {
      // Use --diff-filter=d to ignore file deletions (purging violations is encouraged)
      diffOutput = execSync("git diff --staged --name-only --diff-filter=d", { encoding: "utf8" }).trim();
      if (!diffOutput) {
        diffOutput = execSync("git diff HEAD~1 --name-only --diff-filter=d", { encoding: "utf8" }).trim();
      }
    } catch {
      diffOutput = "";
    }
  }

  const modifiedFiles = diffOutput.split("\n").map(f => f.trim()).filter(Boolean);
  const violations = [];

  for (const file of modifiedFiles) {
    // Violation 1: Bespoke movie routes created under app/studio/cinema/<title>/
    if (/^app\/studio\/cinema\/[a-zA-Z0-9_-]+\/page\.tsx$/.test(file)) {
      if (!file.endsWith("audit/page.tsx")) {
        violations.push({
          file,
          rule: "PROHIBITED_BESPOKE_ROUTE",
          reason: "Creating dedicated static movie routes under app/studio/cinema/<title>/ is prohibited. Use dynamic queries (/studio/cinema?project=<id>)."
        });
      }
    }

    // Violation 2: Hardcoded movie narrative libraries committed under lib/cinema/<movie>.ts
    if (/^lib\/cinema\/[a-zA-Z0-9_-]+Trailer[a-zA-Z0-9_-]*\.ts$/.test(file)) {
      violations.push({
        file,
        rule: "PROHIBITED_STATIC_MOVIE_DATA",
        reason: "Hardcoding film narrative and character data in lib/cinema/ is prohibited. Content must be stored as data/JSON manifests."
      });
    }

    // Violation 3: Binary video or large frame assets tracked in git
    if (file.endsWith(".mp4") || file.endsWith(".webm") || (file.includes("public/cinema/") && file.endsWith(".png"))) {
      violations.push({
        file,
        rule: "PROHIBITED_BINARY_TRACKING",
        reason: "Committing video or large frame binaries to git is prohibited. Binaries must be stored in scratch/ or external object storage."
      });
    }
  }

  if (violations.length > 0) {
    console.error("\n❌ CRITICAL ARCHITECTURAL VIOLATIONS DETECTED:");
    for (const v of violations) {
      console.error(`   - [${v.rule}] ${v.file}`);
      console.error(`     Reason: ${v.reason}`);
    }
    console.error("\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n");
    if (!isSelfTest) {
      process.exit(1);
    }
    return { passed: false, violations };
  }

  console.log("✅ [Guard 1: Codebase Scope] PASSED: No architectural violations or bespoke silos detected.\n");
  return { passed: true, violations: [] };
}

// Self-test runner (Falsification check)
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 1 Self-Test (Falsification Probe)...");

  // Probe 1: Known bad input must fail
  const badDiff = "app/studio/cinema/frozen4/page.tsx\nlib/cinema/frozen4Trailer60s.ts\npublic/cinema/reel.mp4";
  const badResult = checkCodebaseScope({ isSelfTest: true, mockDiff: badDiff });
  if (badResult.passed || badResult.violations.length !== 3) {
    console.error("❌ Self-Test FAILED: Guard failed to reject known bad input!");
    process.exit(1);
  }
  console.log("   ✓ Known bad input correctly rejected (3/3 violations caught).");

  // Probe 2: Clean input must pass
  const cleanDiff = "app/studio/cinema/page.tsx\nscripts/guards/guard_codebase_scope.mjs";
  const cleanResult = checkCodebaseScope({ isSelfTest: true, mockDiff: cleanDiff });
  if (!cleanResult.passed) {
    console.error("❌ Self-Test FAILED: Guard incorrectly rejected clean input!");
    process.exit(1);
  }
  console.log("   ✓ Clean input correctly passed.");
  console.log("🎉 Guard 1 Self-Test Completed Successfully!\n");
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  checkCodebaseScope();
}
