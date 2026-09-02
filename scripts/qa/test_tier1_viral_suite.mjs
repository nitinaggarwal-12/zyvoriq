import assert from "node:assert";
import {
  DOPAMINE_PRESETS,
  DEFAULT_DOPAMINE_CONFIG,
  buildDopamineFFmpegFilter
} from "../../lib/reel/dopamineSplitScreen.js";
import {
  UGC_SAMPLE_PRODUCTS,
  generateUgcAdCampaign
} from "../../lib/reel/ugcAdEngine.js";
import {
  analyzeViralRetention
} from "../../lib/reel/retentionPredictor.js";

console.log("================================================================================");
console.log("🚀 EXECUTING TIER 1 VIRAL SUITE MULTI-MODAL QA TEST SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// TEST 1: Dopamine Split-Screen & ASMR Brainrot Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Testing Dopamine Split-Screen Presets & FFmpeg Filter Graphs...");
assert.strictEqual(DOPAMINE_PRESETS.length, 6, "Must have 6 dopamine presets");

const parkour = DOPAMINE_PRESETS.find(p => p.id === "minecraft_parkour");
assert.ok(parkour, "Minecraft Parkour preset exists");
assert.strictEqual(parkour.fps, 60, "Parkour is 60 FPS");
assert.strictEqual(parkour.duckingDb, -22, "Narration ducking is -22dB");

// Test 50/50 vertical stack filter
const splitFilter = buildDopamineFFmpegFilter({
  enabled: true,
  presetId: "minecraft_parkour",
  layout: "50_50_split",
  asmrVolume: 25,
  audioDuckingEnabled: true,
  borderGlowColor: "#ec4899"
}, 1080, 1920);

assert.ok(splitFilter.videoFilter.includes("vstack=inputs=2"), "Filter uses vstack for 50/50 split");
assert.ok(splitFilter.videoFilter.includes("crop=1080:960"), "Filter crops to 960px half-height");
assert.ok(splitFilter.audioFilter.includes("sidechaincompress"), "Audio ducking uses sidechain compression");
console.log("  ✓ 50/50 Dopamine Split video & ducked audio filter verified");

// Test Corner PiP layout
const pipFilter = buildDopamineFFmpegFilter({
  enabled: true,
  presetId: "asmr_kinetic_sand",
  layout: "pip_bottom_right",
  asmrVolume: 35,
  audioDuckingEnabled: false,
  borderGlowColor: "#ec4899"
}, 1080, 1920);

assert.ok(pipFilter.videoFilter.includes("overlay=main_w-"), "PiP uses overlay filter");
console.log("  ✓ Floating Corner PiP filter graph verified");
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// TEST 2: TikTok Shop & Amazon Affiliate UGC Product Ad Factory
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Testing 1-Click UGC Product Ad Generator...");
assert.strictEqual(UGC_SAMPLE_PRODUCTS.length, 3, "Sample products library verified");

const sample = UGC_SAMPLE_PRODUCTS[0];
const campaign = generateUgcAdCampaign(sample);

assert.strictEqual(campaign.productName, "AuraGlow 4K Lumina Ring Light");
assert.strictEqual(campaign.scenes.length, 4, "Must generate 4-scene conversion framework");
assert.strictEqual(campaign.scenes[0].type, "curiosity_hook");
assert.strictEqual(campaign.scenes[1].type, "feature_demo");
assert.strictEqual(campaign.scenes[2].type, "social_proof");
assert.strictEqual(campaign.scenes[3].type, "urgency_cta");
assert.ok(campaign.starRatingText.includes("4.9/5.0"), "Star rating rendered correctly");
assert.ok(campaign.suggestedTags.includes("#tiktokmademebuyit"), "Viral hashtag included");
assert.ok(campaign.avatarPersonaId === "aria-thorne", "Matched tech persona Aria Thorne");

console.log(`  ✓ UGC Campaign: "${campaign.suggestedTitle}" (${campaign.totalDurationSec}s)`);
console.log(`  ✓ Conversion Framework: Hook -> Demo -> Social Proof -> Urgency CTA`);
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// TEST 3: AI Viral Retention & Drop-Off Heatmap Simulator
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Testing AI Viral Retention & Drop-Off Heatmap Engine...");
const baseAnalysis = analyzeViralRetention({
  hookText: "Stop ignoring this immediately if you want to grow",
  totalDurationSec: 25,
  scenesCount: 4,
  kineticEmojiTimings: [1.2, 5.5, 12.0],
  brollTimings: [5.0, 18.0],
  dopamineSplitEnabled: false
});

assert.ok(baseAnalysis.timelineCurve.length >= 25, "Calculated second-by-second curve");
assert.ok(baseAnalysis.hookScore >= 90, "Strong warning hook receives 90+ score");
assert.ok(baseAnalysis.overallViralScore >= 70, "Overall viral score calculated");
assert.ok(Array.isArray(baseAnalysis.recommendations), "Auto-fix recommendations generated");

// Test Dopamine Boost Retention
const dopamineAnalysis = analyzeViralRetention({
  hookText: "Stop ignoring this immediately if you want to grow",
  totalDurationSec: 25,
  scenesCount: 4,
  kineticEmojiTimings: [1.2, 5.5, 12.0],
  brollTimings: [5.0, 18.0],
  dopamineSplitEnabled: true
});

assert.ok(
  dopamineAnalysis.overallViralScore > baseAnalysis.overallViralScore,
  "Dopamine split-screen increases overall viral retention score"
);
console.log(`  ✓ Base Viral Score: ${baseAnalysis.overallViralScore}/100 -> Dopamine Boost: ${dopamineAnalysis.overallViralScore}/100`);
console.log(`  ✓ 0-3s Hook Retention: ${dopamineAnalysis.hookScore}%`);
console.log(`  ✓ Auto-Fix Recommendations: ${baseAnalysis.recommendations.length} action items`);
console.log("  ✅ Test 3 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL TIER 1 VIRAL SUITE TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================");
