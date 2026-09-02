/**
 * 🧪 PHASE 3: SMART B-ROLL & VISUAL CUTAWAY ENGINE TEST SUITE
 */

import assert from "node:assert/strict";
import {
  autoGenerateBRollCutaways,
  getActiveBRollAtTime,
  buildFFmpegBRollFilter,
  BROLL_PRESET_LIBRARY
} from "../../lib/reel/broll.ts";

console.log("================================================================================");
console.log("🚀 EXECUTING PHASE 3 SMART B-ROLL & CUTAWAY ENGINE VALIDATION SUITE");
console.log("================================================================================\n");

// 1. Mock 6-Scene Production Plan
const mockShots = [
  { id: "shot_01", editorialDurationSec: 4.0, scriptText: "Stop ignoring this one critical rule if you want to grow." },
  { id: "shot_02", editorialDurationSec: 4.0, scriptText: "Most creators rely on generic algorithms and loose focus." },
  { id: "shot_03", editorialDurationSec: 5.0, scriptText: "Instead, automate your habits with deep concentration." },
  { id: "shot_04", editorialDurationSec: 4.5, scriptText: "Look at this financial growth chart scaling exponentially." },
  { id: "shot_05", editorialDurationSec: 4.0, scriptText: "When you execute with velocity like a cheetah sprinting," },
  { id: "shot_06", editorialDurationSec: 4.5, scriptText: "Your content quality achieves unmatched craftsmanship." }
];

console.log("🧪 TEST 1: Script-Driven B-Roll Cutaway Extraction...");
const brolls = autoGenerateBRollCutaways(mockShots);
console.log(`  ✓ Generated ${brolls.length} B-Roll cutaways for 6-shot sequence`);
assert.ok(brolls.length > 0, "B-Roll cutaways should be generated for multi-scene narrative");

brolls.forEach((b, i) => {
  console.log(`    [${i + 1}] Beat ${b.sceneIndex + 1} (${b.type}): "${b.keyword}" @ ${b.startSec.toFixed(1)}s (${b.durationSec.toFixed(1)}s)`);
  assert.ok(b.startSec >= 0, "startSec must be >= 0");
  assert.ok(b.durationSec > 0, "durationSec must be > 0");
  assert.ok(b.brollUrl.length > 0, "brollUrl must be valid string");
});
console.log("  ✅ Test 1 Passed!\n");

console.log("🧪 TEST 2: Active B-Roll Temporal Collision & Lookup Matrix...");
// Shot 2 starts at t=4.0s. Cutaway starts at t=4.5s (duration 2.5s -> ends 7.0s)
const brollAtT5 = getActiveBRollAtTime(brolls, 5.0);
console.log(`  ✓ Lookup at t=5.0s: ${brollAtT5 ? `Active (${brollAtT5.keyword} - ${brollAtT5.type})` : "None"}`);
assert.ok(brollAtT5 !== null, "Expected active B-roll at t=5.0s");

// At t=0.2s (Scene 1 primary hook), no B-roll should interrupt the opening face hook
const brollAtT0 = getActiveBRollAtTime(brolls, 0.2);
console.log(`  ✓ Lookup at t=0.2s: ${brollAtT0 ? `Active (${brollAtT0.keyword})` : "None (Clean Hook Preservation)"}`);
assert.equal(brollAtT0, null, "Hook scene should preserve clean A-Roll face contact");
console.log("  ✅ Test 2 Passed!\n");

console.log("🧪 TEST 3: FFmpeg Multi-Track Video Filter Graph Compilation...");
const ffmpegFilter = buildFFmpegBRollFilter(brolls, 1080, 1920);
console.log(`  ✓ Compiled Filter Graph:\n    "${ffmpegFilter.slice(0, 120)}..."`);
assert.ok(ffmpegFilter.includes("overlay="), "Filter graph must contain overlay directives");
assert.ok(ffmpegFilter.includes("scale=1080:1920") || ffmpegFilter.includes("scale=420:746"), "Filter graph must include scaled dimensions");
console.log("  ✅ Test 3 Passed!\n");

console.log("🧪 TEST 4: Stock Preset Library Integrity Check...");
console.log(`  ✓ Available presets: ${BROLL_PRESET_LIBRARY.length}`);
BROLL_PRESET_LIBRARY.forEach(p => {
  console.log(`    • [${p.category}] ${p.title} (${p.keywords.join(", ")})`);
  assert.ok(p.videoUrl.endsWith(".mp4"), "Preset URL must be mp4 video");
  assert.ok(p.keywords.length > 0, "Preset must have keywords");
});
console.log("  ✅ Test 4 Passed!\n");

console.log("================================================================================");
console.log("🎉 ALL PHASE 3 SMART B-ROLL & CUTAWAYS TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
