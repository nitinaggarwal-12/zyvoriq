import assert from "node:assert";
import { reelProductionStore } from "../../lib/reel/productionStore.ts";
import { deleteProductionAssets } from "../../lib/reel/assetStore.ts";

console.log("🛡️ Testing Production Store Split-Brain Elimination & Durable Deletion...");

const TEST_DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:pncyiYBLwkzpdbCTqOySjcmAofiHjLLL@altaria.proxy.rlwy.net:35535/railway";
process.env.DATABASE_URL = TEST_DATABASE_URL;

async function runPostgresTests() {
  const testId = "studio1_test_splitbrain_" + Date.now();
  const manifest = {
    id: testId,
    topic: "Split Brain Prevention Test",
    genre: "CYBERPUNK",
    tone: "urgent",
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec: 30,
    masterScript: "This is a durability test verifying zero split-brain and durable deletion.",
    creativeBible: {
      visualStyle: "High contrast cinematic neon",
      cameraLanguage: "Anamorphic close-up",
      directorIntent: "Verify store durability",
      colorPalette: "Cyan and amber",
    },
    shots: [
      {
        id: "shot_01",
        order: 1,
        editorialStartSec: 0,
        editorialDurationSec: 6.0,
        generationDurationSec: 6,
        trimInSec: 0,
        trimOutSec: 6.0,
        scriptText: "This is a durability test verifying zero split-brain.",
        visualIntent: "Neon cyber alleyway",
        generationPrompt: "Cinematic alleyway with reflections",
        continuityIn: {},
        continuityOut: {},
        transitionOut: { type: "hard-cut", durationSec: 0 },
        dependsOnShotIds: [],
        status: "PLANNED",
      },
    ],
    audio: { timingSource: "pending" },
    captions: { timingSource: "draft", cues: [], safeZoneProfile: "instagram-reels" },
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    studio1: {
      environmentContinuity: true,
      projectTitle: "Split Brain Test",
      basePrompts: {},
      subjectModes: {},
      clipOptions: {},
      generationRound: 1,
    },
  };

  // 1. Create in Postgres
  console.log("    Creating test production " + testId + "...");
  const created = await reelProductionStore.create(manifest);
  assert.strictEqual(created.id, testId);
  assert.strictEqual(created.revision, 1);
  console.log("    ✓ Created production " + testId + " (revision " + created.revision + ")");

  // 2. Read from Postgres
  console.log("    Fetching production " + testId + "...");
  const fetched = await reelProductionStore.get(testId);
  assert.ok(fetched, "Must find newly created production");
  assert.strictEqual(fetched.id, testId);
  assert.strictEqual(fetched.manifest.topic, manifest.topic);
  console.log("    ✓ Fetched production " + testId);

  // 3. List contains production
  console.log("    Listing productions...");
  const list = await reelProductionStore.list(50);
  assert.ok(list.some(p => p.id === testId), "List must include the newly created production");
  console.log("    ✓ Verified production in list (count: " + list.length + ")");

  // 4. Update with revision check
  console.log("    Updating production revision...");
  const updatedManifest = { ...fetched.manifest, topic: "Split Brain Prevention Test (Updated)" };
  const updated = await reelProductionStore.replace(testId, updatedManifest, 1);
  assert.strictEqual(updated.revision, 2);
  assert.strictEqual(updated.manifest.topic, "Split Brain Prevention Test (Updated)");
  console.log("    ✓ Successfully replaced production to revision " + updated.revision);

  // 5. Delete production
  console.log("    Deleting production " + testId + "...");
  await reelProductionStore.delete(testId, 2);
  console.log("    ✓ Deleted production from store");

  // 6. Verify production is physically gone from Postgres
  const postDelete = await reelProductionStore.get(testId);
  assert.strictEqual(postDelete, null, "Deleted production must return null on get()");

  const postList = await reelProductionStore.list(50);
  assert.ok(!postList.some(p => p.id === testId), "Deleted production must NOT appear in list()");
  console.log("    ✓ Confirmed production is 100% gone from Postgres");

  // 7. Idempotent deletion
  console.log("    Verifying idempotent deletion...");
  await reelProductionStore.delete(testId);
  console.log("    ✓ Second delete succeeded idempotently without error");

  // 8. Verify deleteProductionAssets does not throw for non-existent assets
  await deleteProductionAssets(testId);
  console.log("    ✓ deleteProductionAssets cleanly handled non-existent files");

  console.log("\n✅ All Production Store Split-Brain & Durability Tests PASSED!\n");
}

runPostgresTests().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
