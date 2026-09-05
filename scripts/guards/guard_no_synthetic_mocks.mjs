#!/usr/bin/env node
/**
 * Guard 2: Anti-Synthetic Mock & Tone Generator Linter
 * Deterministic quality gate: Fails with exit code 1 if Web Audio oscillators,
 * robotic window.speechSynthesis pitch-shifts, or canvas recorder loops are detected
 * masquerading as production audio/video engines in app/ or lib/.
 */

import fs from "fs";
import path from "path";

const PROHIBITED_PATTERNS = [
  {
    name: "SYNTHETIC_CINEMA_SOUNDTRACK_PROXY",
    regex: /createOscillator\(\)[\s\S]{0,150}(sawtooth|sine)[\s\S]{0,150}(siren|score|orchestra|bassOsc|soundtrack|trailer)/gi,
    description: "Web Audio oscillators cannot be used as substitute cinema scores or orchestral soundtracks."
  },
  {
    name: "ROBOTIC_SPEECH_SYNTHESIS_HACK",
    regex: /speechSynthesis\.speak\([\s\S]{0,120}pitch\s*=\s*(1\.[1-9]|0\.[3-9])/g,
    description: "window.speechSynthesis with pitch shifts cannot be used as character voice actors."
  },
  {
    name: "CANVAS_MEDIARECORDER_COMPILER_HACK",
    regex: /canvas\.captureStream\([\s\S]{0,100}new\s+MediaRecorder\(/g,
    description: "Canvas captureStream + MediaRecorder cannot be used to fake a cinema motion picture compiler."
  }
];

export function scanCodebaseForSyntheticMocks(options = {}) {
  const { isSelfTest = false, targetDirs = ["app", "lib"] } = options;

  console.log("🛡️ [Guard 2: Anti-Synthetic Mocks] Scanning codebase for synthetic audio/video proxies...");

  const violations = [];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
          walkDir(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".mjs") || entry.name.endsWith(".js"))) {
        // Skip the guard scripts themselves and test fixtures
        if (fullPath.includes("scripts/guards/")) continue;
        const content = fs.readFileSync(fullPath, "utf8");

        for (const pattern of PROHIBITED_PATTERNS) {
          pattern.regex.lastIndex = 0;
          if (pattern.regex.test(content)) {
            violations.push({
              file: fullPath,
              rule: pattern.name,
              description: pattern.description
            });
          }
        }
      }
    }
  }

  for (const dir of targetDirs) {
    walkDir(path.resolve(process.cwd(), dir));
  }

  if (violations.length > 0) {
    console.error("\n❌ PROHIBITED SYNTHETIC MOCK DETECTED IN PRODUCTION CODE:");
    for (const v of violations) {
      console.error(`   - [${v.rule}] ${v.file}`);
      console.error(`     Details: ${v.description}`);
    }
    console.error("\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n");
    if (!isSelfTest) {
      process.exit(1);
    }
    return { passed: false, violations };
  }

  console.log("✅ [Guard 2: Anti-Synthetic Mocks] PASSED: Zero synthetic oscillators, speech hacks, or canvas recorders found.\n");
  return { passed: true, violations: [] };
}

// Self-Test Falsification Probe
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 2 Self-Test (Falsification Probe)...");

  // Create temporary mock violation file
  const testDir = path.resolve(process.cwd(), "scratch/guard2_test");
  fs.mkdirSync(testDir, { recursive: true });
  const testBadFile = path.join(testDir, "bad_synth.ts");
  fs.writeFileSync(testBadFile, `
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    // masterScore soundtrack synthesizer
  `);

  const badResult = scanCodebaseForSyntheticMocks({ isSelfTest: true, targetDirs: ["scratch/guard2_test"] });
  fs.rmSync(testDir, { recursive: true, force: true });

  if (badResult.passed || badResult.violations.length === 0) {
    console.error("❌ Self-Test FAILED: Guard 2 failed to catch synthetic oscillator pattern!");
    process.exit(1);
  }
  console.log("   ✓ Prohibited oscillator pattern correctly rejected.");

  // Clean scan
  const cleanResult = scanCodebaseForSyntheticMocks({ isSelfTest: true, targetDirs: ["app/studio/cinema"] });
  if (!cleanResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 2 incorrectly failed on clean codebase!");
    process.exit(1);
  }
  console.log("   ✓ Clean codebase verified.");
  console.log("🎉 Guard 2 Self-Test Completed Successfully!\n");
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  scanCodebaseForSyntheticMocks();
}
