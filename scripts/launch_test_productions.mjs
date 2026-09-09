import crypto from "node:crypto";
import { reelProductionStore } from "../lib/reel/productionStore.ts";
import { reelProductionControl } from "../lib/reel/productionControl.ts";
import { operationKey, reelOperationQueue } from "../lib/reel/operationQueue.ts";
import { planStudio1 } from "../lib/studio1/planner.ts";

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function launchProduction(config) {
  console.log(`\n======================================================`);
  console.log(`[Launch] Planning production: "${config.topic}" (Genre: ${config.genre}, Duration: ${config.requestedDurationSec}s)`);
  console.log(`======================================================`);

  const manifest = await planStudio1({
    topic: config.topic,
    platform: config.platform || "Instagram Reels",
    aspectRatio: config.aspectRatio || "9:16",
    requestedDurationSec: config.requestedDurationSec,
    genre: config.genre,
    language: config.language,
  });

  if (config.genre) {
    manifest.genre = config.genre;
    if (manifest.creativeBible) {
      manifest.creativeBible.genre = config.genre;
    }
  }

  console.log(`[Plan Completed]`);
  console.log(`- Production ID: ${manifest.id}`);
  console.log(`- Genre: ${manifest.genre}`);
  console.log(`- Audio Strategy: ${manifest.creationIntent?.audioStrategy || "default"}`);
  console.log(`- Shots planned: ${manifest.shots.length}`);
  console.log(`- Characters:`, manifest.characters?.map(c => `${c.name} (${c.id})`));
  console.log(`- Sample shot prompt 1:`, manifest.shots[0]?.generationPrompt.slice(0, 160) + "...");
  console.log(`- Sample shot prompt 2:`, manifest.shots[1]?.generationPrompt.slice(0, 160) + "...");

  const production = await reelProductionStore.create(manifest);
  console.log(`[Saved to Database] Revision: ${production.revision}`);

  const control = await reelProductionControl.register(production.id, config.priority || 0);
  const activeControl = await reelProductionControl.requireActive(production.id);

  const fp = fingerprint({ script: manifest.masterScript, tone: manifest.tone, language: manifest.language, studio1: true });
  const idempotencyKey = operationKey({
    productionId: production.id,
    generationToken: activeControl.generationToken,
    kind: "NARRATION",
    manifestRevision: production.revision,
    fingerprint: fp,
  });

  const operation = await reelOperationQueue.enqueue({
    productionId: production.id,
    kind: "NARRATION",
    idempotencyKey,
    payload: {
      manifestRevision: production.revision,
      generationToken: activeControl.generationToken,
      semanticFingerprint: fp,
      studio1: true,
      language: manifest.language,
      genre: manifest.genre,
    },
  });

  console.log(`[Enqueued Narration Operation] ID: ${operation.id}, Status: ${operation.status}`);
  return { productionId: production.id, manifest, operation };
}

async function main() {
  console.log("[Test Suite] Initiating Multi-Theme Test Generations...");

  // 1. Production A: 3-Minute Hindi Pop Music Video (30 shots, 180s)
  const prodA = await launchProduction({
    topic: "3m Hindi Pop Music Video: High-octane modern Bollywood Desi Pop dance anthem, punchy 808 club beat, autotuned Hindi pop lyrics with open vowels, neon laser catwalk arena stage, charismatic pop star singing and dancing",
    genre: "MUSIC_VIDEO",
    requestedDurationSec: 180,
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    priority: 10,
  });

  // 2. Production B: Sci-Fi Cyberpunk Action Reel (5 shots, 30s)
  const prodB = await launchProduction({
    topic: "Neo-Tokyo Cyberpunk Heist: High-tech cybernetic courier dashes across rain-soaked neo-Tokyo rooftops beneath towering holographic billboards, leaping between neon skyscraper gantries",
    genre: "SCI_FI_CYBERPUNK",
    requestedDurationSec: 30,
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    priority: 5,
  });

  console.log("\n======================================================");
  console.log("Both productions launched successfully!");
  console.log(`Production A (Hindi Pop Music Video): ${prodA.productionId}`);
  console.log(`Production B (Cyberpunk Sci-Fi Action): ${prodB.productionId}`);
  console.log("======================================================");
}

main().catch(err => {
  console.error("FATAL Launch Error:", err);
  process.exit(1);
});
