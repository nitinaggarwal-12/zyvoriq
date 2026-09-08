import assert from "node:assert";
import {
  decide,
  createInitialSupervisorState,
} from "../../lib/reel/scriptSupervisor.ts";

console.log("🎬 Testing Script Supervisor (lib/reel/scriptSupervisor.ts)...");

const CANONICAL_HERO_URI = "https://cdn.zyvoriq.com/assets/characters/romantic_hero.png";
const CANONICAL_HEROINE_URI = "https://cdn.zyvoriq.com/assets/characters/romantic_heroine.png";

// Helper to create a test ReelShot fixture
function makeShot(overrides = {}) {
  return {
    id: overrides.id || "shot_01",
    sceneId: overrides.sceneId || "scene_01",
    order: overrides.order || 1,
    editorialStartSec: 0,
    editorialDurationSec: 6.0,
    generationDurationSec: 6,
    trimInSec: 0,
    trimOutSec: 6.0,
    scriptText: overrides.scriptText || "Test script narration beat",
    visualIntent: "Medium close-up test",
    generationPrompt: "Test generation prompt",
    continuityIn: {
      characterId: overrides.characterId !== undefined ? overrides.characterId : "romantic_hero",
      character: overrides.character || "Romantic hero in black overcoat",
      environment: overrides.environment || "Alpine snow peak with dramatic clouds",
      wardrobe: overrides.wardrobe || "Tailored wool overcoat",
      eyeline: overrides.eyeline || "screen_right",
      referenceFrameUrl: overrides.referenceFrameUrl,
    },
    continuityOut: {},
    transitionOut: { type: "hard-cut", durationSec: 0 },
    dependsOnShotIds: [],
    status: "PLANNED",
    canonicalReferenceImages: overrides.canonicalReferenceImages,
    asset: overrides.asset,
    ...overrides,
  };
}

// Test 1: First appearance of character attaches canonical reference and emits IDENTITY LOCK
{
  const state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
  });
  const shot = makeShot({ id: "shot_01", characterId: "romantic_hero" });

  const decision = decide(state, shot, "quality");

  assert.strictEqual(decision.shotId, "shot_01");
  assert.strictEqual(decision.characterId, "romantic_hero");
  assert.strictEqual(decision.canonicalReferenceUris.length, 1);
  assert.strictEqual(decision.canonicalReferenceUris[0], CANONICAL_HERO_URI);
  assert.ok(
    decision.clauses.some(c => c.includes("IDENTITY LOCK [romantic_hero]")),
    "Must emit IDENTITY LOCK for first character appearance with attached canonical URI"
  );
  assert.strictEqual(decision.temporalAnchorShotId, null, "First shot has no temporal anchor");
  assert.strictEqual(decision.temporalAnchorUrl, null);
  assert.strictEqual(decision.updatedState.lastShotByCharacter["romantic_hero"], "shot_01");
  assert.strictEqual(decision.updatedState.lastShotId, "shot_01");
  console.log("  ✓ Test 1 Passed: First character appearance attaches canonical reference & emits IDENTITY LOCK");
}

// Test 2: Invariant enforcement: No canonical reference attached -> NO IDENTITY LOCK clause emitted
{
  const state = createInitialSupervisorState(); // empty canonical URIs
  const shot = makeShot({ id: "shot_01", characterId: "unregistered_char" });

  const decision = decide(state, shot, "quality");

  assert.strictEqual(decision.canonicalReferenceUris.length, 0);
  assert.ok(
    !decision.clauses.some(c => c.includes("IDENTITY LOCK")),
    "Invariant violated: emitted IDENTITY LOCK without attached canonicalReferenceUris!"
  );
  assert.ok(
    decision.clauses.some(c => c.includes("PERFORMER GUIDANCE [unregistered_char]")),
    "Must fall back to descriptive performer guidance without claiming attached canonical reference"
  );
  console.log("  ✓ Test 2 Passed: Invariant enforced — NO IDENTITY LOCK emitted when canonical URI is missing");
}

// Test 3: Contiguous shot of same character in same scene with quality tier attaches temporal frame
{
  let state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
  });
  // Simulate shot_01 already completed with a rendered frame
  state.lastShotByCharacter["romantic_hero"] = "shot_01";
  state.lastShotId = "shot_01";
  state.lastSceneId = "scene_01";
  state.shotFrames["shot_01"] = {
    videoUrl: "https://cdn.zyvoriq.com/video/shot_01.mp4",
    lastFrameUrl: "https://cdn.zyvoriq.com/frames/shot_01_last.png",
  };

  const shot2 = makeShot({ id: "shot_02", sceneId: "scene_01", characterId: "romantic_hero" });
  const decision = decide(state, shot2, "quality");

  assert.strictEqual(decision.shotId, "shot_02");
  assert.strictEqual(decision.characterId, "romantic_hero");
  assert.strictEqual(decision.temporalAnchorShotId, "shot_01");
  assert.strictEqual(decision.temporalAnchorUrl, "https://cdn.zyvoriq.com/frames/shot_01_last.png");
  assert.ok(
    decision.clauses.some(c => c.includes("TEMPORAL CONTINUITY: Action flows continuously from preceding shot shot_01")),
    "Must emit TEMPORAL CONTINUITY clause when temporal frame is attached"
  );
  assert.ok(
    decision.clauses.some(c => c.includes("IDENTITY LOCK [romantic_hero]")),
    "Must also preserve IDENTITY LOCK on contiguous shot"
  );
  console.log("  ✓ Test 3 Passed: Contiguous shot of same character attaches temporal frame & emits TEMPORAL CONTINUITY");
}

// Test 4: Return of character after cutaway re-anchors to canonical reference and forbids cross-character temporal frame
{
  let state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
    romantic_heroine: [CANONICAL_HEROINE_URI],
  });
  // Timeline:
  // shot_01: romantic_hero
  // shot_02: romantic_heroine (cutaway / reaction shot)
  // shot_03: romantic_hero returns!
  state.lastShotByCharacter["romantic_hero"] = "shot_01";
  state.lastShotByCharacter["romantic_heroine"] = "shot_02";
  state.lastShotId = "shot_02"; // preceding shot showed romantic_heroine
  state.lastSceneId = "scene_01";
  state.shotFrames["shot_02"] = {
    lastFrameUrl: "https://cdn.zyvoriq.com/frames/shot_02_heroine_last.png",
  };

  const shot3 = makeShot({ id: "shot_03", sceneId: "scene_01", characterId: "romantic_hero" });
  const decision = decide(state, shot3, "quality");

  assert.strictEqual(decision.characterReturn, true, "characterReturn must be true after cutaway");
  assert.strictEqual(decision.canonicalReferenceUris.length, 1);
  assert.strictEqual(decision.canonicalReferenceUris[0], CANONICAL_HERO_URI);
  assert.strictEqual(
    decision.temporalAnchorShotId,
    null,
    "CRITICAL: Must NEVER use preceding shot_02 (heroine) as temporal frame for hero — prevents morphing!"
  );
  assert.strictEqual(decision.temporalAnchorUrl, null);
  assert.ok(
    !decision.clauses.some(c => c.includes("TEMPORAL CONTINUITY")),
    "Must NOT emit TEMPORAL CONTINUITY across different characters"
  );
  assert.ok(
    decision.clauses.some(c => c.includes("CHARACTER RETURN [romantic_hero]")),
    "Must emit CHARACTER RETURN clause to guide re-anchoring"
  );
  assert.strictEqual(decision.updatedState.lastShotByCharacter["romantic_hero"], "shot_03");
  console.log("  ✓ Test 4 Passed: Character return after cutaway re-anchors to canonical reference without cross-character bleed");
}

// Test 5: No-person / landscape shot emits SUBJECT RULE, never attaches character reference, never emits IDENTITY LOCK
{
  const state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
  });
  state.lastShotId = "shot_01";
  state.lastShotByCharacter["romantic_hero"] = "shot_01";

  const shotLandscape = makeShot({
    id: "shot_02",
    characterId: null, // No character on camera
    environment: "Grand sweeping panoramic view of royal palace courtyard at dusk",
  });

  const decision = decide(state, shotLandscape, "fast");

  assert.strictEqual(decision.characterId, null);
  assert.strictEqual(decision.canonicalReferenceUris.length, 0, "No-person shot must have 0 canonical reference URIs");
  assert.ok(
    !decision.clauses.some(c => c.includes("IDENTITY LOCK")),
    "No-person shot must NEVER emit IDENTITY LOCK"
  );
  assert.ok(
    decision.clauses.some(c => c.includes("SUBJECT RULE: Pure cinematic action, stunt, environment master")),
    "Must emit SUBJECT RULE for no-person shot"
  );
  assert.strictEqual(decision.updatedState.lastShotId, "shot_02");
  assert.strictEqual(decision.updatedState.lastShotByCharacter["romantic_hero"], "shot_01", "Hero last shot unchanged");
  console.log("  ✓ Test 5 Passed: No-person / landscape shot emits SUBJECT RULE with zero character reference attachment");
}

// Test 6: Scene transition drops temporal frame from previous scene and emits SCENE TRANSITION
{
  let state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
  });
  state.lastShotId = "shot_03";
  state.lastSceneId = "scene_01"; // Old scene: Palace Courtyard
  state.lastShotByCharacter["romantic_hero"] = "shot_03";
  state.shotFrames["shot_03"] = {
    lastFrameUrl: "https://cdn.zyvoriq.com/frames/shot_03_courtyard.png",
  };

  // Shot 04 cuts to scene_02: High Mountain Peak
  const shotNewScene = makeShot({
    id: "shot_04",
    sceneId: "scene_02",
    characterId: "romantic_hero",
    environment: "Snow-capped alpine ridge under bright alpine sunshine",
  });

  const decision = decide(state, shotNewScene, "quality");

  assert.strictEqual(decision.sceneTransition, true, "sceneTransition must be true when sceneId changes");
  assert.strictEqual(
    decision.temporalAnchorShotId,
    null,
    "CRITICAL: Must NEVER chain temporal frame across scene boundary — prevents set environment bleed!"
  );
  assert.strictEqual(decision.temporalAnchorUrl, null);
  assert.ok(
    !decision.clauses.some(c => c.includes("TEMPORAL CONTINUITY")),
    "Must NOT emit TEMPORAL CONTINUITY across a scene cut"
  );
  assert.ok(
    decision.clauses.some(c => c.includes("SCENE TRANSITION [scene_02]")),
    "Must emit SCENE TRANSITION clause for new scene"
  );
  assert.strictEqual(decision.updatedState.lastSceneId, "scene_02");
  console.log("  ✓ Test 6 Passed: Scene transition drops temporal frame from previous scene (zero set bleed)");
}

// Test 7: Pure function idempotency and immutability: calling decide() twice produces identical outputs and leaves state intact
{
  const state = createInitialSupervisorState({
    romantic_hero: [CANONICAL_HERO_URI],
  });
  state.lastShotId = "shot_01";
  state.lastSceneId = "scene_01";
  state.lastShotByCharacter["romantic_hero"] = "shot_01";

  const shot = makeShot({ id: "shot_02", sceneId: "scene_01", characterId: "romantic_hero" });

  const stateCloneBefore = structuredClone(state);
  const decision1 = decide(state, shot, "fast");
  const decision2 = decide(state, shot, "fast");

  assert.deepStrictEqual(decision1, decision2, "decide() must be completely idempotent");
  assert.deepStrictEqual(state, stateCloneBefore, "decide() must NOT mutate input state");
  console.log("  ✓ Test 7 Passed: Pure function idempotency & immutability verified");
}

console.log("🎉 ALL SCRIPT SUPERVISOR QA TESTS PASSED!");
