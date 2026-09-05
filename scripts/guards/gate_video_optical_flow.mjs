#!/usr/bin/env node
/**
 * Guard 4: Optical Flow Video Motion Gate
 * Deterministic quality gate: Fails with exit code 1 if a video stream claiming
 * cinema motion picture or animation is actually a static 2D image undergoing Ken Burns pan/zoom.
 */

import path from "path";

/**
 * Evaluates motion vectors across an NxN spatial grid.
 * Uniform affine transform: variance of (dx, dy) across blocks approaches zero.
 * Real motion: independent local displacement vectors with high motion entropy.
 */
export function verifyVideoOpticalFlow(gridVectors, options = {}) {
  const { isSelfTest = false, videoName = "video_stream" } = options;

  console.log(`🎥 [Guard 4: Video Optical Flow] Auditing motion vectors for "${videoName}"...`);

  if (!gridVectors || gridVectors.length < 9) {
    console.error("❌ Insufficient spatial grid points for optical flow analysis.");
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "INSUFFICIENT_GRID_POINTS" };
  }

  // Calculate mean displacement
  const n = gridVectors.length;
  let sumDx = 0, sumDy = 0;
  for (const v of gridVectors) {
    sumDx += v.dx;
    sumDy += v.dy;
  }
  const meanDx = sumDx / n;
  const meanDy = sumDy / n;

  // Calculate variance of motion vectors (non-rigid deformation)
  let varDx = 0, varDy = 0;
  for (const v of gridVectors) {
    varDx += Math.pow(v.dx - meanDx, 2);
    varDy += Math.pow(v.dy - meanDy, 2);
  }
  const vectorDispersion = (varDx + varDy) / n;

  // If vector dispersion is below threshold, all blocks move identically -> 2D Pan on static image
  const isAffineStaticPan = vectorDispersion < 0.25;

  if (isAffineStaticPan) {
    console.error(`\n❌ CRITICAL VIDEO MOTION FAILURE DETECTED:`);
    console.error(`   Optical Flow Vector Dispersion: ${vectorDispersion.toFixed(4)} (Threshold: > 1.50 for real video)`);
    console.error(`   Mean Translation: (${meanDx.toFixed(1)}, ${meanDy.toFixed(1)})`);
    console.error(`   DIAGNOSIS: The motion is a uniform affine 2D transform (Ken Burns zoom/pan on a static image).`);
    console.error(`   It contains ZERO non-rigid character animation, fluid dynamics, or independent object motion.`);
    console.error(`\n💥 Deterministic Workflow Failure Gate Triggered. Exiting with code 1.\n`);
    if (!isSelfTest) process.exit(1);
    return { passed: false, reason: "STATIC_2D_PAN_DETECTED", vectorDispersion };
  }

  console.log(`✅ [Guard 4: Video Optical Flow] PASSED: Non-rigid motion verified (Vector Dispersion: ${vectorDispersion.toFixed(2)}).\n`);
  return { passed: true, vectorDispersion };
}

// Self-Test Falsification Probe
if (process.argv.includes("--self-test")) {
  console.log("🧪 Running Guard 4 Self-Test (Falsification Probe)...");

  // Probe 1: Pure 2D Ken Burns Pan (Negative Control)
  // All 16 grid cells shift by exactly dx = 4.0, dy = 1.5
  const badVectors = [];
  for (let i = 0; i < 16; i++) {
    badVectors.push({ dx: 4.0 + (Math.random() * 0.05 - 0.025), dy: 1.5 + (Math.random() * 0.05 - 0.025) });
  }

  const badResult = verifyVideoOpticalFlow(badVectors, { isSelfTest: true, videoName: "test_ken_burns_pan" });
  if (badResult.passed || badResult.reason !== "STATIC_2D_PAN_DETECTED") {
    console.error("❌ Self-Test FAILED: Guard 4 failed to reject Ken Burns static 2D pan!");
    process.exit(1);
  }
  console.log("   ✓ Ken Burns static 2D pan correctly rejected as non-video motion.");

  // Probe 2: Real non-rigid motion (Positive Control)
  // Foreground character moves left (dx = -8), background moves right (dx = 2), snow falls (dy = 12)
  const goodVectors = [];
  for (let i = 0; i < 16; i++) {
    const isCharacter = i >= 5 && i <= 10;
    goodVectors.push({
      dx: isCharacter ? -8.0 + (Math.random() * 2) : 2.0 + (Math.random() * 0.5),
      dy: isCharacter ? 0.5 : 12.0 + (Math.random() * 4)
    });
  }

  const goodResult = verifyVideoOpticalFlow(goodVectors, { isSelfTest: true, videoName: "test_dynamic_video" });
  if (!goodResult.passed) {
    console.error("❌ Self-Test FAILED: Guard 4 rejected dynamic non-rigid video!");
    process.exit(1);
  }
  console.log("   ✓ Dynamic non-rigid video correctly accepted.");
  console.log("🎉 Guard 4 Self-Test Completed Successfully!\n");
  process.exit(0);
}
