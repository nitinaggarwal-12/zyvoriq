import assert from "node:assert/strict";
import {
  RESOLUTION_PRESETS,
  estimateFileSizeMb
} from "../../lib/reel/videoExporter.ts";
import {
  generatePodcastEpisode,
  PODCAST_FORMAT_CONFIG,
  DURATION_TIER_CONFIG
} from "../../lib/multimodal/podcastEngine.ts";
import {
  generateCarouselDeck,
  SLIDE_THEMES
} from "../../lib/multimodal/carouselEngine.ts";
import {
  generateSongComposition
} from "../../lib/multimodal/songEngine.ts";
import {
  generateEpisodicStory
} from "../../lib/multimodal/storyEngine.ts";
import { PRESET_PERSONAS } from "../../lib/reel/personas.ts";

console.log("================================================================================");
console.log("🚀 EXECUTING MULTI-MODAL STUDIO ENGINE & PODCAST FIRESIDE CHAT VALIDATION SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// 1. Multi-Resolution Video Export Suite
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Multi-Resolution Video Export Profiles & Downscaling Calculations...");
assert.strictEqual(RESOLUTION_PRESETS.length, 4, "Must provide 4 resolution presets");
const res1080 = RESOLUTION_PRESETS.find(p => p.id === "1080p");
const res720 = RESOLUTION_PRESETS.find(p => p.id === "720p");
const res480 = RESOLUTION_PRESETS.find(p => p.id === "480p");
const res360 = RESOLUTION_PRESETS.find(p => p.id === "360p");

assert.ok(res1080 && res1080.width === 1080 && res1080.height === 1920, "1080p must be 1080x1920");
assert.ok(res720 && res720.width === 720 && res720.height === 1280, "720p must be 720x1280");
assert.ok(res480 && res480.width === 480 && res480.height === 854, "480p must be 480x854");
assert.ok(res360 && res360.width === 360 && res360.height === 640, "360p must be 360x640");

const size1080 = estimateFileSizeMb(30, "1080p");
const size720 = estimateFileSizeMb(30, "720p");
const size480 = estimateFileSizeMb(30, "480p");
const size360 = estimateFileSizeMb(30, "360p");

assert.ok(size1080 > size720, "1080p must be larger than 720p");
assert.ok(size720 > size480, "720p must be larger than 480p");
assert.ok(size480 > size360, "480p must be larger than 360p");
console.log(`  ✓ 30s Reel Estimated Sizes: 1080p (${size1080} MB) → 720p (${size720} MB) → 480p (${size480} MB) → 360p (${size360} MB)`);
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// 2. Podcast & Fireside Chat Multi-Host Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Podcast Engine (Fireside Chat, 2-Host Debate, Executive Roundtable)...");

// Test 2A: Fireside Chat (1-on-1 Interview)
const fireside = generatePodcastEpisode("Self-Correcting Autonomous Coding", "fireside_chat", "quick_bite", [PRESET_PERSONAS[0], PRESET_PERSONAS[3]]);
assert.strictEqual(fireside.format, "fireside_chat", "Should format as fireside chat");
assert.strictEqual(fireside.dialogueTurns.length, 6, "Fireside quick bite should have 6 turns");
assert.ok(fireside.dialogueTurns[0].role === "moderator", "First turn must be moderator");
assert.ok(fireside.dialogueTurns[1].role === "guest", "Second turn must be guest");
console.log(`  ✓ Fireside Chat generated: "${fireside.title}" (${fireside.totalDurationSec}s)`);

// Test 2B: Executive Roundtable (4 Speakers)
const roundtable = generatePodcastEpisode(
  "Quantum Computing Security Posture",
  "executive_roundtable",
  "quick_bite",
  [PRESET_PERSONAS[0], PRESET_PERSONAS[1], PRESET_PERSONAS[2], PRESET_PERSONAS[3]]
);
assert.strictEqual(roundtable.format, "executive_roundtable", "Should format as executive roundtable");
assert.strictEqual(roundtable.hosts.length, 4, "Roundtable should feature 4 speakers");
const speakerIds = new Set(roundtable.dialogueTurns.map(t => t.speakerId));
assert.ok(speakerIds.size >= 3, "Roundtable must include at least 3 distinct speaker turns");
console.log(`  ✓ Executive Roundtable generated: 4 Speakers (${roundtable.hosts.map(h => h.name.split(" ")[0]).join(", ")})`);

// Test 2C: Turn-Taking Non-Collision Temporal Check
for (let i = 0; i < fireside.dialogueTurns.length - 1; i++) {
  const current = fireside.dialogueTurns[i];
  const next = fireside.dialogueTurns[i + 1];
  assert.ok(
    current.startSec + current.durationSec <= next.startSec + 0.05,
    `Turn ${i + 1} (${current.speakerName}) overlaps with Turn ${i + 2} (${next.speakerName})`
  );
}
console.log("  ✓ Verified temporal turn-taking non-collision across all speakers");
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// 3. Visual Carousel & Slide Deck Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Multi-Slide Carousel & Presentation Deck Generation...");
const deck = generateCarouselDeck("The 80/20 Leverage Rule", "4:5_portrait", "cyber_dark");
assert.strictEqual(deck.slides.length, 6, "Carousel deck should have 6 slides");
assert.strictEqual(deck.slides[0].slideType, "hook_cover", "Slide 1 must be hook cover");
assert.strictEqual(deck.slides[5].slideType, "cta_outro", "Slide 6 must be CTA outro");
assert.ok(Object.keys(SLIDE_THEMES).includes("cyber_dark"), "Slide themes must contain cyber_dark");
assert.ok(Object.keys(SLIDE_THEMES).includes("emerald_growth"), "Slide themes must contain emerald_growth");
console.log(`  ✓ Generated 6-card ${deck.format} Carousel Deck with theme: ${SLIDE_THEMES[deck.theme].name}`);
console.log("  ✅ Test 3 Passed!");

// -----------------------------------------------------------------------------
// 4. Song Lyrics & Composition Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 4: Song Lyrics, Verse-Chorus Meter & Rhyme Scheme Analysis...");
const song = generateSongComposition("Electric Neon Horizon", "synthwave_pop");
assert.ok(song.sections.length >= 5, "Song should have at least 5 structured sections");
const chorus = song.sections.find(s => s.type === "chorus");
assert.ok(chorus, "Song must have a chorus section");
assert.ok(["ABAB", "AABB"].includes(chorus.rhymeScheme), "Chorus must have a valid rhyme scheme");
assert.strictEqual(song.tempoBpm, 124, "Synthwave BPM must be 124");
console.log(`  ✓ Song Composition: "${song.title}" (${song.musicalKey}, ${song.tempoBpm} BPM, ${song.sections.length} sections)`);
console.log("  ✅ Test 4 Passed!");

// -----------------------------------------------------------------------------
// 5. Long-Form Story & Novel Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 5: Long-Form Story, Character Lore & Episodic Chapters...");
const story = generateEpisodicStory("The Quantum Key", "Sci-Fi Cyberpunk");
assert.strictEqual(story.characters.length, 2, "Story should introduce 2 core characters");
assert.strictEqual(story.chapters.length, 2, "Story should have 2 episodic chapters");
assert.ok(story.totalWordCount > 80, "Story chapters must contain substantive narrative text");
assert.ok(story.chapters[0].cliffhanger.length > 0, "Chapter 1 must feature a cliffhanger ending");
console.log(`  ✓ Story "${story.title}" (${story.characters.map(c => c.name).join(" & ")}, ${story.totalWordCount} words)`);
console.log("  ✅ Test 5 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL MULTI-MODAL & FIRESIDE PODCAST SUITE TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================\n");
