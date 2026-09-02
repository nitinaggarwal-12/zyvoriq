import assert from "node:assert";
import {
  PREDICTED_TRENDS_RADAR,
  calculateVOI,
  get7DayPredictedTrends,
  transpileResearchPaperToReel,
  mutateContrarianScript,
  applyNicheTransposition
} from "../../lib/reel/trendRadarEngine.js";

console.log("================================================================================");
console.log("🚀 EXECUTING 7-DAY ADVANCE PREDICTIVE TREND RADAR QA TEST SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// TEST 1: Viral Opportunity Index (VOI) Mathematical Algorithm
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Testing VOI Mathematical Calculation Engine...");
const voiGreenfield = calculateVOI(9, 1450, "greenfield_zero", "stage_1_incubation");
assert.ok(voiGreenfield >= 90, `Greenfield incubation must produce VOI >= 90, got: ${voiGreenfield}`);

const voiSaturated = calculateVOI(4, 50, "saturated", "stage_4_saturated");
assert.ok(voiSaturated < 50, `Saturated late-stage must produce VOI < 50, got: ${voiSaturated}`);

console.log(`  ✓ Greenfield High-Velocity VOI: ${voiGreenfield}/100`);
console.log(`  ✓ Saturated Late-Stage VOI: ${voiSaturated}/100`);
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// TEST 2: Multi-Platform Mining Ingestion Telemetry
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Testing Multi-Platform Ingestion & 7-Day Forecast Calendar...");
const allTrends = get7DayPredictedTrends();
assert.ok(allTrends.length >= 5, "Must have at least 5 predicted trends in radar database");

// Verify source platform coverage
const sources = allTrends.map(t => t.sourceTier);
assert.ok(sources.includes("elite_academia"), "Includes Elite Academic ArXiv/Stanford source");
assert.ok(sources.includes("github_intel"), "Includes GitHub Deep Telemetry source");
assert.ok(sources.includes("linkedin_pulse"), "Includes LinkedIn Professional Pulse source");
assert.ok(sources.includes("search_vacuum"), "Includes Search & Intent Vacuum source");
assert.ok(sources.includes("culture_incubator"), "Includes Reddit culture incubator source");

console.log(`  ✓ Ingested ${allTrends.length} multi-platform trends:`);
allTrends.forEach(t => {
  console.log(`    • [${t.peakForecastDay}] ${t.title.slice(0, 45)}... (VOI: ${t.voiScore}/100, Src: ${t.sourcePlatform})`);
});
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// TEST 3: Academic Paper / ArXiv Transpiler
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Testing Academic Paper Omni-Modal Transpiler...");
const transpiled = transpileResearchPaperToReel(
  "Dynamic Mixture-of-Depths Transformer for Edge AI",
  "We propose a dynamic compute routing architecture that reduces active parameters by 52% while matching SOTA reasoning benchmarks on MATH and SWE-bench.",
  "SWE-bench (74.2%)"
);

assert.ok(transpiled.reel60s.hook.includes("Dynamic Mixture-of-Depths"), "Transpiled 60s hook references topic");
assert.strictEqual(transpiled.reel60s.scriptBeats.length, 4, "Generated 4 kinetic script beats");
assert.strictEqual(transpiled.linkedinCarousel.slides.length, 5, "Generated 5-slide LinkedIn PDF carousel");
assert.ok(transpiled.executivePodcast.openingHook.length > 10, "Generated Executive podcast opening hook");

console.log(`  ✓ 60s Reel Hook: "${transpiled.reel60s.hook}"`);
console.log(`  ✓ LinkedIn Carousel: ${transpiled.linkedinCarousel.title} (${transpiled.linkedinCarousel.slideCount} slides)`);
console.log(`  ✓ Executive Podcast Topic: "${transpiled.executivePodcast.topic}"`);
console.log("  ✅ Test 3 Passed!");

// -----------------------------------------------------------------------------
// TEST 4: Contrarian Script Mutation (Anti-Duplicate Guard)
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 4: Testing Dynamic Script Mutation & Contrarian Angle Engine...");
const contrarian = mutateContrarianScript("AI Scale", "bigger models are always better");
assert.ok(contrarian.contrarianHook.includes("Everyone is saying"), "Contrarian hook created");
assert.strictEqual(contrarian.debatePoints.length, 3, "Created 3 non-consensus debate points");

console.log(`  ✓ Contrarian Hook: "${contrarian.contrarianHook}"`);
contrarian.debatePoints.forEach((p, i) => console.log(`    • Debate ${i + 1}: ${p}`));
console.log("  ✅ Test 4 Passed!");

// -----------------------------------------------------------------------------
// TEST 5: Niche-Lens Transposition
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 5: Testing Niche-Lens Transposition (B2B SaaS, Real Estate, Finance)...");
const sampleTrend = allTrends[0];
const b2bNiche = applyNicheTransposition(sampleTrend, "b2b_saas");
const financeNiche = applyNicheTransposition(sampleTrend, "personal_finance");

assert.ok(b2bNiche.transposedTitle.startsWith("For B2B SaaS Founders:"), "B2B SaaS prefix applied");
assert.ok(financeNiche.transposedTitle.startsWith("For Wealth & Personal Finance:"), "Finance prefix applied");

console.log(`  ✓ B2B SaaS Transposition: "${b2bNiche.transposedTitle}"`);
console.log(`  ✓ Wealth Transposition: "${financeNiche.transposedTitle}"`);
console.log("  ✅ Test 5 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL 5 PREDICTIVE TREND RADAR QA TESTS PASSED WITH 100% ACCURACY!");
console.log("================================================================================\n");
