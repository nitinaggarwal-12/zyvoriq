import assert from "node:assert/strict";
import fs from "node:fs";
import { buildOpeningFramePrompt, ensureCharacterSheet } from "../characterAnchor.mjs";

const shot = {
  id: "shot_02",
  scriptText: "The route gets steeper as the climber moves above the icefall.",
  visualIntent: "Presenter explains the dangerous transition while pointing to the route.",
  dependsOnShotIds: ["shot_01"],
  continuityIn: {
    characterId: "character_presenter",
    environment: "Maintain the established physical set and lighting.",
  },
};

const prompt = buildOpeningFramePrompt({ creativeBible: {} }, shot, {
  hasCanonical: true,
  hasEnvironmentReference: true,
});
assert.match(prompt, /frame 0\.000/i, "opening frame must be explicitly tied to the current scene start");
assert.match(prompt, /SEMANTIC ONSET LOCK/i, "semantic onset must be a hard opening-frame contract");
assert.match(prompt, /The route gets steeper/i, "opening frame must be grounded in the current spoken beat");
assert.match(prompt, /previous-scene frame is authoritative/i, "previous scene must be authoritative for the environment");
assert.match(prompt, /Do NOT copy the canonical identity sheet's plain studio background/i, "identity sheet background must never override the established set");
assert.match(prompt, /Do not replace it with a living room/i, "environment contract must explicitly reject invented replacement sets");

const existingUrl = "/api/reels/assets/reels/test/character/presenter.png";
const manifest = {
  characters: [{
    id: "character_presenter",
    canonicalReferenceImages: [{ url: existingUrl, digest: "abc" }],
  }],
  continuity: {
    characters: [{
      id: "character_presenter",
      canonicalReferenceImages: [],
    }],
  },
};
let writeCalls = 0;
await ensureCharacterSheet(manifest, "studio1_test", async () => {
  writeCalls += 1;
  throw new Error("existing canonical reference should not regenerate");
});
assert.equal(writeCalls, 0, "existing canonical identity must be reused");
assert.deepEqual(manifest.continuity.characters[0].canonicalReferenceImages, [existingUrl], "canonical identity evidence must stay synchronized into the typed continuity registry");

const planner = fs.readFileSync("lib/studio1/planner.ts", "utf8");
assert.match(planner, /STUDIO1 SEMANTIC ONSET LOCK/, "Studio1 Veo prompt must require a semantic-ready first frame");
assert.match(planner, /previous-scene visual reference supplied by the worker is authoritative for the set/, "Studio1 prompt must make the prior scene authoritative for environment continuity");
assert.match(planner, /Do not spend the opening seconds establishing the room/, "Studio1 prompt must prohibit visual lead-in that trails narration");
assert.match(planner, /shot\.dependsOnShotIds = meta\.environmentContinuity && previous \? \[previous\.id\] : \[\]/, "environment continuity must remain a sequential dependency chain");

const anchor = fs.readFileSync("scripts/characterAnchor.mjs", "utf8");
assert.match(anchor, /dependencyLastFrame\(manifest, shot, readAsset\)/, "opening-frame generation must consume the previous generated clip");
assert.match(anchor, /hasEnvironmentReference: Boolean\(environmentFrame\)/, "environment evidence must be passed into opening-frame composition");
assert.match(anchor, /preserving previous scene frame/, "presenter fallback must preserve the real previous set rather than reverting to the plain identity sheet");

console.log("Studio1 continuity + semantic onset QA passed");
