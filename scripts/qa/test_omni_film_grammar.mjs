import assert from "node:assert/strict";
import fs from "node:fs";
import { planReel } from "../../lib/reel/planner.ts";
import { planStudio1Sync } from "../../lib/studio1/planner.ts";
import { ensureCharacterSheet } from "../characterAnchor.mjs";

console.log("🎬 Testing Google Omni Film Grammar & Multi-Character Staging...");

// Test 1: Historical Biopic (Oppenheimer & Groves) with Shot / Reverse-Shot
{
  const script = `OPPENHEIMER: 5:30 in the morning, Jornada del Muerto holds its breath.
GROVES: The storm finally broke just past the southern ridge.
OPPENHEIMER: When zero approaches, physics either answers or abandons us.
GROVES: Ten seconds on the master switch, Robert.`;

  const input = {
    topic: "Oppenheimer Trinity Test dawn",
    requestedDurationSec: 25,
    scriptText: script
  };

  const manifest = planStudio1Sync(input);

  assert.equal(manifest.creativeBible.genre, "HISTORICAL_BIOPIC", "Genre must be classified as HISTORICAL_BIOPIC");
  assert.ok(manifest.continuity.characters.length >= 2, "Must cast multiple characters from dialogue tags");
  
  const charIds = manifest.continuity.characters.map(c => c.id);
  assert.ok(charIds.includes("oppenheimer"), "Must contain oppenheimer character");
  assert.ok(charIds.includes("groves"), "Must contain groves character");

  // Verify shot-reverse-shot eyelines and character assignments
  assert.equal(manifest.shots[0].continuityIn.characterId, "oppenheimer");
  assert.equal(manifest.shots[1].continuityIn.characterId, "groves");
  
  assert.equal(manifest.shots[0].continuityIn.eyeline, "screen_right", "Oppenheimer eyeline must look screen_right");
  assert.equal(manifest.shots[1].continuityIn.eyeline, "screen_left", "Groves eyeline must look screen_left (counter-angle)");

  // Verify no presenter talking to camera in historical biopic
  for (const shot of manifest.shots) {
    assert.notEqual(shot.continuityIn.eyeline, "camera", "Drama / Biopic shots must not look directly into camera lens");
    assert.ok(
      shot.generationPrompt.includes("IDENTITY LOCK [lead_performer]") ||
      shot.generationPrompt.includes("IDENTITY LOCK [") ||
      shot.generationPrompt.includes("SUBJECT RULE: Pure cinematic action"),
      "Generation prompt must lock to specific actor or pure action"
    );
    assert.ok(
      !shot.generationPrompt.includes("same presenter stays visibly present at the edge of frame or gesturing"),
      "Generation prompt must not contain legacy explainer presenter gestures"
    );
  }

  console.log("  ✓ Test 1 Passed: Historical Biopic multi-character shot/reverse-shot staging verified");
}

// Test 2: Bollywood Action (Dhurandhar) with Stunts and Kinetic Coverage
{
  const script = `RAW operative breaches the heavily guarded alpine compound perimeter.
Tactical convoy ambushed on treacherous winding mountain pass.
Close-quarters combat erupts inside the darkened concrete tunnel.
High-speed extraction helicopter lifts off under heavy enemy fire.`;

  const input = {
    topic: "Dhurandhar Bollywood Action Thriller",
    requestedDurationSec: 25,
    scriptText: script
  };

  const manifest = planStudio1Sync(input);

  assert.equal(manifest.creativeBible.genre, "BOLLYWOOD_ACTION", "Genre must be classified as BOLLYWOOD_ACTION");

  // Verify presence of pure kinetic action shots (no person on camera)
  const actionShots = manifest.shots.filter(s => !s.continuityIn.characterId);
  assert.ok(actionShots.length > 0, "Action movies must include pure stunt/vehicle shots with no person on camera");
  
  for (const shot of actionShots) {
    assert.ok(
      shot.generationPrompt.includes("SUBJECT RULE: Pure cinematic action"),
      "Action shot prompt must contain SUBJECT RULE for pure action"
    );
    assert.ok(
      !shot.generationPrompt.includes("IDENTITY LOCK"),
      "Action shots with no character must not contain an identity lock"
    );
  }

  console.log("  ✓ Test 2 Passed: Bollywood Action kinetic stunt and non-person coverage verified");
}

// Test 3: Multi-Character Reference Anchoring
{
  const testManifest = {
    creativeBible: { genre: "HISTORICAL_BIOPIC" },
    shots: [
      { continuityIn: { characterId: "actor_a" } },
      { continuityIn: { characterId: "actor_b" } },
      { continuityIn: {} }, // pure action shot
    ],
    characters: [
      { id: "actor_a", appearance: { description: "Lead Actor A" }, wardrobe: ["Suit"], canonicalReferenceImages: [] },
      { id: "actor_b", appearance: { description: "Lead Actor B" }, wardrobe: ["Uniform"], canonicalReferenceImages: [] }
    ],
    continuity: {
      characters: [
        { id: "actor_a", appearance: { description: "Lead Actor A" }, wardrobe: ["Suit"], canonicalReferenceImages: [] },
        { id: "actor_b", appearance: { description: "Lead Actor B" }, wardrobe: ["Uniform"], canonicalReferenceImages: [] }
      ]
    }
  };

  const generatedImages = [];
  const fakeWriteAsset = async (path, buf) => {
    generatedImages.push(path);
    return { url: `/assets/${path}` };
  };

  // Temporarily mock generateImage for offline deterministic test
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [{
        content: {
          parts: [{
            inlineData: {
              data: Buffer.from("fake_png").toString("base64"),
              mimeType: "image/png"
            }
          }]
        }
      }]
    })
  });

  const prevKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test_key";
  try {
    await ensureCharacterSheet(testManifest, "prod_multi_test", fakeWriteAsset);
    assert.equal(generatedImages.length, 2, "Must generate unique reference sheets for both actor_a and actor_b");
    assert.ok(generatedImages.some(p => p.includes("actor_a")), "Must generate reference for actor_a");
    assert.ok(generatedImages.some(p => p.includes("actor_b")), "Must generate reference for actor_b");
    assert.equal(testManifest.continuity.characters[0].canonicalReferenceImages.length, 1);
    assert.equal(testManifest.continuity.characters[1].canonicalReferenceImages.length, 1);
    console.log("  ✓ Test 3 Passed: Multi-character canonical sheet generation and registry sync verified");
  } finally {
    globalThis.fetch = originalFetch;
    if (prevKey) process.env.GEMINI_API_KEY = prevKey;
    else delete process.env.GEMINI_API_KEY;
  }
}

// Test 4: Documentary Explainer Preservation
{
  const script = `Welcome to the breakdown of neural network architectures.
Let us examine how transformer attention matrices compute weights.
Notice the residual connections preserving gradient flow across layers.`;

  const input = {
    topic: "Explain how transformer neural networks work tutorial",
    requestedDurationSec: 20,
    scriptText: script
  };

  const manifest = planStudio1Sync(input);
  assert.equal(manifest.creativeBible.genre, "DOCUMENTARY_EXPLAINER", "Tutorial should be classified as DOCUMENTARY_EXPLAINER");
  assert.equal(manifest.continuity.characters[0].id, "character_presenter", "Explainer can use presenter");
  console.log("  ✓ Test 4 Passed: Documentary Explainer format cleanly preserved for educational tutorials");
}

// Test 5: Explicit Genre Override Test
{
  const input = {
    topic: "A conversation in a small quiet room",
    requestedDurationSec: 20,
    scriptText: `First operative delivers the encrypted dossier.
Second operative checks the perimeter from the fire escape.
Both operatives confirm the extraction window is now open.`,
    genre: "BOLLYWOOD_ACTION"
  };

  const manifest = planStudio1Sync(input);
  assert.equal(manifest.creativeBible.genre, "BOLLYWOOD_ACTION", "Explicit genre BOLLYWOOD_ACTION must override default topic inference");
  assert.equal(manifest.shots[0].continuityIn.characterId, "action_hero");
  console.log("  ✓ Test 5 Passed: Explicit genre override cleanly accepted and enforced");
}

// Test 6: Bollywood Romance Swiss Musical with Violin and Chiffon Staging
{
  const script = `Snow-capped Swiss alpine peaks glisten in morning golden light.
Hero in dark wool coat raises his acoustic wooden violin under ancient stone arches.
Heroine in vibrant translucent chiffon saree spins gracefully as mountain breeze catches her dupatta.
Both leads meet at the center of the alpine terrace for a lyrical duet in the crisp air.
Hero gazes across the terrace as golden hour lens flare washes over the mountain horizon.`;

  const input = {
    topic: "Hindi music video with hero and heroine singing and dancing in Switzerland",
    requestedDurationSec: 30,
    scriptText: script
  };

  const manifest = planStudio1Sync(input);

  assert.equal(manifest.creativeBible.genre, "BOLLYWOOD_ROMANCE", "Swiss romance topic must auto-infer BOLLYWOOD_ROMANCE");
  assert.equal(manifest.language, "hinglish-roman", "Bollywood romance must auto-resolve language to hinglish-roman");

  // Verify cast
  const cast = manifest.continuity.characters;
  assert.ok(cast.length >= 2, "Bollywood romance must cast at least hero and heroine");
  const hero = cast.find(c => c.id === "romantic_hero");
  const heroine = cast.find(c => c.id === "romantic_heroine");
  assert.ok(hero, "Must cast romantic_hero");
  assert.ok(heroine, "Must cast romantic_heroine");
  const heroAccessories = (hero.accessories || []).join(" ").toLowerCase() + " " + (hero.wardrobe || []).join(" ").toLowerCase();
  const heroineWardrobe = (heroine.wardrobe || []).join(" ").toLowerCase();
  assert.ok(heroAccessories.includes("violin"), "Romantic hero must have violin");
  assert.ok(heroineWardrobe.includes("chiffon"), "Romantic heroine must wear chiffon saree");

  // Verify film grammar and shot staging
  assert.ok(manifest.shots[0].visualIntent.startsWith("ESTABLISHING_WIDE"), "Shot 1 must be establishing wide");
  assert.equal(manifest.shots[0].continuityIn.characterId, undefined, "Establishing wide has no character on camera");
  assert.equal(manifest.shots[1].continuityIn.characterId, "romantic_hero", "Shot 2 must feature romantic hero");
  assert.equal(manifest.shots[2].continuityIn.characterId, "romantic_heroine", "Shot 3 must feature romantic heroine");
  assert.ok(manifest.shots[3].visualIntent.startsWith("MEDIUM_TWO_SHOT"), "Shot 4 must be duet two-shot");

  // Verify visual style optics and atmosphere
  const vs = manifest.creativeBible.visualStyle.toLowerCase();
  assert.ok(vs.includes("cadence") || vs.includes("alexa") || vs.includes("anamorphic") || vs.includes("cinematic"), "Optics must specify cinematic lens and cadence");
  assert.ok(vs.includes("chiffon"), "Visual style must include chiffon fabric and alpine elements");

  console.log("  ✓ Test 6 Passed: Bollywood Romance Yash Chopra Swiss musical grammar, casting, and duet staging verified");
}

console.log("🎉 ALL OMNI FILM GRAMMAR QA TESTS PASSED!");
