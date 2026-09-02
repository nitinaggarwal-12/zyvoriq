import assert from "node:assert";
import {
  FEATURED_REMIX_TEMPLATES,
  encodeRemixRecipe,
  decodeRemixRecipe,
  generateRemixShareUrl
} from "../../lib/reel/remixEngine.js";
import {
  VIRAL_SUBTITLE_PRESETS,
  getSubtitlePreset
} from "../../lib/reel/viralSubtitles.js";
import {
  SAMPLE_REDDIT_STORIES,
  generateRedditStory
} from "../../lib/reel/redditStoryEngine.js";

console.log("================================================================================");
console.log("🚀 EXECUTING TIER 2 VIRAL SUITE MULTI-MODAL QA TEST SUITE");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// TEST 1: "Remix This Reel" Recipe Serialization & Cloning Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 1: Testing Remix Recipe Encoding, Decoding & Deep Links...");
assert.strictEqual(FEATURED_REMIX_TEMPLATES.length, 3, "Featured templates library verified");

const sampleRecipe = FEATURED_REMIX_TEMPLATES[0];
const token = encodeRemixRecipe(sampleRecipe);
assert.ok(token.length > 20, "Generated Base64 remix token");

const decoded = decodeRemixRecipe(token);
assert.ok(decoded, "Decoded recipe successfully");
assert.strictEqual(decoded.title, sampleRecipe.title);
assert.strictEqual(decoded.personaId, sampleRecipe.personaId);
assert.strictEqual(decoded.subtitleStyle, "hormozi_bold");
assert.strictEqual(decoded.dopamineConfig.presetId, "minecraft_parkour");

const shareUrl = generateRemixShareUrl(sampleRecipe);
assert.ok(shareUrl.includes("https://zyvoriq.ai/studio?remix="), "Generated valid remix URL");

console.log(`  ✓ Encoded Recipe Token (${token.length} chars)`);
console.log(`  ✓ Decoded Recipe: "${decoded.title}" (Persona: ${decoded.personaId})`);
console.log(`  ✓ Shareable URL: ${shareUrl.slice(0, 60)}...`);
console.log("  ✅ Test 1 Passed!");

// -----------------------------------------------------------------------------
// TEST 2: Ultra-Kinetic Subtitle Presets (Hormozi, MrBeast, Ali Abdaal)
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 2: Testing Ultra-Kinetic Subtitle Styling Engine...");
assert.strictEqual(VIRAL_SUBTITLE_PRESETS.length, 6, "Must have 6 creator subtitle presets");

const hormozi = getSubtitlePreset("hormozi_bold");
assert.strictEqual(hormozi.activeWordColor, "#facc15", "Hormozi style uses bold yellow");
assert.strictEqual(hormozi.textTransform, "uppercase", "Hormozi uses uppercase punch");

const mrbeast = getSubtitlePreset("mrbeast_glow");
assert.strictEqual(mrbeast.activeWordColor, "#ef4444", "MrBeast style uses neon red");

const abdaal = getSubtitlePreset("ali_abdaal_clean");
assert.strictEqual(abdaal.activeWordColor, "#38bdf8", "Ali Abdaal uses sky blue");

console.log("  ✓ Hormozi Bold Yellow Pop (#facc15) verified");
console.log("  ✓ MrBeast Red Neon Glow (#ef4444) verified");
console.log("  ✓ Ali Abdaal Minimalist Sky Blue (#38bdf8) verified");
console.log("  ✅ Test 2 Passed!");

// -----------------------------------------------------------------------------
// TEST 3: Reddit & iMessage Chat Bubble Story Engine
// -----------------------------------------------------------------------------
console.log("\n🧪 TEST 3: Testing Reddit & iMessage Chat Bubble Story Generator...");
assert.strictEqual(SAMPLE_REDDIT_STORIES.length, 2, "Sample Reddit stories library verified");

const horrorStory = generateRedditStory("Footsteps in the attic at 2 AM", "scary_mystery");
assert.strictEqual(horrorStory.subreddit, "r/nosleep");
assert.strictEqual(horrorStory.messages.length, 4, "Generated 4-bubble conversation tree");
assert.strictEqual(horrorStory.messages[0].sender, "them");
assert.strictEqual(horrorStory.ambientAudio, "rain_thunder");

const dramaStory = generateRedditStory("AITA for not inviting my stepbrother to dinner?", "aita_drama");
assert.strictEqual(dramaStory.subreddit, "r/AmItheAsshole");
assert.strictEqual(dramaStory.ambientAudio, "dark_drone");

console.log(`  ✓ Horror Story generated: "${horrorStory.title}" (${horrorStory.messages.length} chat bubbles, ${horrorStory.ambientAudio})`);
console.log(`  ✓ Relationship Drama generated: "${dramaStory.title}" (${dramaStory.messages.length} chat bubbles, ${dramaStory.ambientAudio})`);
console.log("  ✅ Test 3 Passed!");

console.log("\n================================================================================");
console.log("🎉 ALL TIER 2 VIRAL SUITE TESTS PASSED (100% SUCCESS)!");
console.log("================================================================================");
