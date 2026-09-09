import assert from "node:assert/strict";
import { planStudio1Sync } from "../../lib/studio1/planner.ts";

console.log("🎵 Running Omni Directorial MUSIC_VIDEO & Lip-Sync QA Verification Suite...");

// 1. Test: Music Video Genre Auto-Detection
const musicVideoInput = {
  topic: "Deep space astronaut suit reflection, nebula flare music video with singer performing",
  requestedDurationSec: 34,
  scriptText: `Lost among the stars tonight, floating in the neon light.
Every breath a quiet beat, where the earth and cosmos meet.
Golden visor catches fire, burning with our deep desire.
Through the endless dark we roam, melody will lead us home.
Galaxy awakens now, to the rhythm we avow.`
};

const manifest = planStudio1Sync(musicVideoInput);

console.log("  ✓ Manifest ID:", manifest.id);
console.log("  ✓ Detected Genre:", manifest.creativeBible.genre);
assert.equal(manifest.creativeBible.genre, "MUSIC_VIDEO", "Topic with music video must auto-infer MUSIC_VIDEO genre");

// 2. Test: Casting for Music Video has unobstructed mouth/lips for lip-sync
const cast = manifest.continuity.characters;
assert.ok(cast.length >= 1, "Music video must cast at least 1 lead performer");
const leadSinger = cast[0];
console.log("  ✓ Lead Performer:", leadSinger.name);
const features = (leadSinger.appearance?.face || "") + " " + (leadSinger.appearance?.description || "") + " " + (leadSinger.biometricDNA?.facialFeatures || "");
assert.ok(features.toLowerCase().includes("lips"), "Performer features must emphasize visible lips for vocal delivery");

// 3. Test: Staging has on-camera singing close-ups facing camera
const closeUps = manifest.shots.filter(s => s.visualIntent.includes("HERO_CLOSE_UP") || s.continuityIn.eyeline === "camera");
console.log(`  ✓ Performance Shots with direct/expressive eyeline: ${closeUps.length} of ${manifest.shots.length}`);
assert.ok(closeUps.length >= 2, "Music video must feature multiple hero singing performance close-ups");

// 4. Test: Shot generation prompts contain music video performance and lip-sync lock
const shot1Prompt = manifest.shots[0].generationPrompt;
assert.ok(shot1Prompt.includes("MUSIC VIDEO PERFORMANCE & LIP-SYNC"), "Shot prompt must include MUSIC VIDEO PERFORMANCE & LIP-SYNC lock");
assert.ok(shot1Prompt.includes("unobstructed") || shot1Prompt.includes("lips"), "Prompt must instruct unobstructed mouth/lips");

// 5. Test: Music score plan is configured for continuous musical master
assert.ok(manifest.musicPlan.sections[0].intent.includes("music video"), "Music plan must be configured with high-energy music video score");
console.log("  ✓ Music Score Plan Intent:", manifest.musicPlan.sections[0].intent);

// 6. Test: Explicit Genre Override
const explicitInput = {
  topic: "Deep space astronaut suit reflection, nebula flare",
  genre: "MUSIC_VIDEO",
  requestedDurationSec: 34,
  scriptText: `Lost in cosmic starlight glow.
Feel the rhythm start to flow.
Reflections on the visor shine.
In this melody divine.
Echoes across space and time.`
};

const explicitManifest = planStudio1Sync(explicitInput);
assert.equal(explicitManifest.creativeBible.genre, "MUSIC_VIDEO", "Explicit genre=MUSIC_VIDEO must be respected even with space topic");
console.log("  ✓ Explicit genre override respected for space topic:", explicitManifest.creativeBible.genre);

console.log("\n🎉 ALL MUSIC_VIDEO & LIP-SYNC QA VERIFICATIONS PASSED 100%!\n");
