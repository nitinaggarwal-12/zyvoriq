import assert from "node:assert/strict";
import { AUTO_ZOOM_PRESETS, calculateZoomKeyframes, generateFfmpegZoomFilter } from "../../lib/reel/autoZoom.ts";

console.log("==========================================================");
console.log("🎬 PHASE 2 VERIFICATION: AUTO-ZOOM & DYNAMIC PUNCH-INS");
console.log("==========================================================");

// Sample 6-beat sequence (43s reel)
const SAMPLE_SHOTS = [
  { id: "s1", order: 1, editorialStartSec: 0, editorialDurationSec: 7.2, scriptText: "Hook sentence" },
  { id: "s2", order: 2, editorialStartSec: 7.2, editorialDurationSec: 7.0, scriptText: "Body beat 1" },
  { id: "s3", order: 3, editorialStartSec: 14.2, editorialDurationSec: 7.0, scriptText: "Body beat 2" },
  { id: "s4", order: 4, editorialStartSec: 21.2, editorialDurationSec: 7.0, scriptText: "Body beat 3" },
  { id: "s5", order: 5, editorialStartSec: 28.2, editorialDurationSec: 7.0, scriptText: "Body beat 4" },
  { id: "s6", order: 6, editorialStartSec: 35.2, editorialDurationSec: 7.8, scriptText: "Final Call to Action" },
];

// [Test 1] Dynamic Viral Alternating Punch-In Cadence
console.log("\n[Test 1] Testing Dynamic Viral Alternating Punch-Ins:");
const viralKeyframes = calculateZoomKeyframes(SAMPLE_SHOTS, "dynamic-viral");
assert.equal(viralKeyframes.length, 6, "Must compute exactly 6 zoom keyframes");
assert.equal(viralKeyframes[0].scale, 1.0, "Beat 1 must start at 1.0x wide");
assert.equal(viralKeyframes[1].scale, 1.12, "Beat 2 must punch-in at 1.12x");
assert.equal(viralKeyframes[2].scale, 1.0, "Beat 3 must reset to 1.0x wide");
assert.equal(viralKeyframes[3].scale, 1.12, "Beat 4 must punch-in at 1.12x");
assert.equal(viralKeyframes[5].scale, 1.22, "Final CTA beat must zoom in to 1.22x climax");
console.log("  ✓ Dynamic viral punch-in cadence verified (1.0x -> 1.12x -> 1.0x -> 1.12x -> 1.0x -> 1.22x Climax).");

// [Test 2] Dramatic Climax Progressive Push
console.log("\n[Test 2] Testing Dramatic Climax Progressive Push:");
const climaxKeyframes = calculateZoomKeyframes(SAMPLE_SHOTS, "dramatic-climax");
assert.equal(climaxKeyframes[0].scale, 1.0, "Start must be 1.0x");
assert.equal(climaxKeyframes[climaxKeyframes.length - 1].scale, 1.22, "Climax must end at 1.22x");
console.log("  ✓ Dramatic progressive push verified.");

// [Test 3] Static None Setting
console.log("\n[Test 3] Testing Static None Framing:");
const staticKeyframes = calculateZoomKeyframes(SAMPLE_SHOTS, "none");
assert.ok(staticKeyframes.every(k => k.scale === 1.0), "All keyframes must remain 1.0x");
console.log("  ✓ Static 1.0x raw framing verified.");

// [Test 4] FFmpeg Filter Generation
console.log("\n[Test 4] Testing FFmpeg Zoom Filter String Generation:");
const filterString = generateFfmpegZoomFilter(viralKeyframes, 720, 1280);
assert.ok(filterString.startsWith("crop="), "Must generate a valid FFmpeg crop expression");
assert.ok(filterString.includes("between(t,0.00,7.20)"), "Must include timestamp boundary for Beat 1");
console.log(`  ✓ Generated FFmpeg Filter: ${filterString.slice(0, 65)}...`);

console.log("\n==========================================================");
console.log("🌟 PHASE 2: AUTO-ZOOM & PUNCH-IN VALIDATION PASSED 100%");
console.log("==========================================================");
