#!/usr/bin/env node
/**
 * Guard 5: Pre-Flight Platform Capability Gate
 * Deterministic quality gate: Fails with exit code 1 if a workflow attempts to generate
 * production media without required system binaries (ffmpeg, ffprobe) or API credentials,
 * strictly prohibiting silent synthetic fallback to canvas/oscillator proxies.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "path";

const execFileAsync = promisify(execFile);

async function checkBinary(name) {
  try {
    await execFileAsync(name, ["-version"], { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export async function verifyPlatformCapabilities(options = {}) {
  const { isSelfTest = false, mockBlockers = null } = options;

  console.log("⚙️ [Guard 5: Platform Capabilities] Inspecting system generation readiness...");

  const blockers = [];
  if (mockBlockers !== null) {
    blockers.push(...mockBlockers);
  } else {
    const ffmpeg = await checkBinary("ffmpeg");
    const ffprobe = await checkBinary("ffprobe");
    const geminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

    if (!ffmpeg) blockers.push("ffmpeg (CLI binary missing or blocked by endpoint security)");
    if (!ffprobe) blockers.push("ffprobe (CLI binary missing or blocked by endpoint security)");
    if (!geminiKey) blockers.push("GEMINI_API_KEY (Environment variable missing for Veo/TTS generation)");
  }

  if (blockers.length > 0) {
    console.error("\n❌ PRE-FLIGHT PLATFORM CAPABILITY FAILURE:");
    console.error("   Production media generation cannot execute due to missing platform dependencies:");
    for (const b of blockers) {
      console.error(`   - Blocked by: ${b}`);
    }
    console.error("\n⚠️ STRICT PROTOCOL ENFORCEMENT:");
    console.error("   Silent degradation to canvas Ken Burns hacks or Web Audio oscillators is STRICTLY FORBIDDEN.");
    console.error("   The workflow MUST stop and report these blockers to the user.\n");
    console.error("💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n");
    if (!isSelfTest) {
      process.exit(1);
    }
    return { productionReady: false, blockers };
  }

  console.log("✅ [Guard 5: Platform Capabilities] PASSED: All production binaries and keys verified.\n");
  return { productionReady: true, blockers: [] };
}

// Self-Test Falsification Probe
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 5 Self-Test (Falsification Probe)...");

  // Probe 1: Mock missing ffmpeg (Negative Control)
  verifyPlatformCapabilities({ isSelfTest: true, mockBlockers: ["ffmpeg (Santa blocked)"] }).then(res => {
    if (res.productionReady || res.blockers.length === 0) {
      console.error("❌ Self-Test FAILED: Guard 5 failed to halt on missing binary!");
      process.exit(1);
    }
    console.log("   ✓ Missing binary blocker correctly halted generation.");

    // Probe 2: All capabilities present (Positive Control)
    return verifyPlatformCapabilities({ isSelfTest: true, mockBlockers: [] }).then(cleanRes => {
      if (!cleanRes.productionReady) {
        console.error("❌ Self-Test FAILED: Guard 5 rejected clean capabilities!");
        process.exit(1);
      }
      console.log("   ✓ Clean capabilities correctly approved.");
      console.log("🎉 Guard 5 Self-Test Completed Successfully!\n");
      process.exit(0);
    });
  });
} else if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  verifyPlatformCapabilities();
}
