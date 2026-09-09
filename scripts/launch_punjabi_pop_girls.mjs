import crypto from "node:crypto";
import { reelProductionStore } from "../lib/reel/productionStore.ts";
import { reelProductionControl } from "../lib/reel/productionControl.ts";
import { operationKey, reelOperationQueue } from "../lib/reel/operationQueue.ts";
import { planStudio1 } from "../lib/studio1/planner.ts";

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function main() {
  const config = {
    topic: "Modern Punjabi Pop Music Video: 2 trendy, stylish Indian Punjabi college girls (Simran and Harleen) singing, dancing, and performing high-energy Punjabi Pop and modern urban Bhangra choreography together with full music, driving dhol beats, chrome microphones, vibrant college campus festival stage, cold spark pyrotechnics, and cheering college crowd.",
    genre: "MUSIC_VIDEO",
    requestedDurationSec: 30,
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    language: "hinglish-roman",
    priority: 10,
  };

  console.log(`\n======================================================`);
  console.log(`[Launch] Planning production: "${config.topic}"`);
  console.log(`Duration: ${config.requestedDurationSec}s | Genre: ${config.genre}`);
  console.log(`======================================================`);

  const manifest = await planStudio1({
    topic: config.topic,
    platform: config.platform,
    aspectRatio: config.aspectRatio,
    requestedDurationSec: config.requestedDurationSec,
    genre: config.genre,
    language: config.language,
  });

  manifest.genre = config.genre;
  if (manifest.creativeBible) {
    manifest.creativeBible.genre = config.genre;
  }
  manifest.creationIntent = manifest.creationIntent || {};
  manifest.creationIntent.audioStrategy = "native";
  manifest.audioStrategy = "native";

  console.log(`\n[Plan Completed & Pre-Flight Verified]`);
  console.log(`- Production ID: ${manifest.id}`);
  console.log(`- Genre: ${manifest.genre}`);
  console.log(`- Audio Strategy: ${manifest.audioStrategy}`);
  console.log(`- Planned Duration: ${manifest.plannedDurationSec}s`);
  console.log(`- Shots planned: ${manifest.shots.length}`);
  for (const s of manifest.shots) {
    console.log(`  * [${s.id}] Dur: ${s.editorialDurationSec}s | Char: ${s.continuityIn?.characterId || "none"}`);
    console.log(`    Prompt: "${s.generationPrompt.slice(0, 140)}..."`);
  }

  const production = await reelProductionStore.create(manifest);
  console.log(`\n[Saved to Database] Production ${production.id} (Revision ${production.revision})`);

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
      audioStrategy: "native",
    },
  });

  console.log(`[Enqueued Narration Operation] ID: ${operation.id}, Status: ${operation.status}`);
  console.log(`\n======================================================`);
  console.log(`Production ${manifest.id} is now queued for dedicated Railway worker!`);
  console.log(`Direct Studio URL: https://zyvoriq.up.railway.app/studio?id=${manifest.id}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error("FATAL Launch Error:", err);
  process.exit(1);
});
