import crypto from "node:crypto";
import { reelProductionStore } from "../lib/reel/productionStore.ts";
import { reelProductionControl } from "../lib/reel/productionControl.ts";
import { operationKey, reelOperationQueue } from "../lib/reel/operationQueue.ts";
import { planStudio1 } from "../lib/studio1/planner.ts";

try {
  process.loadEnvFile(".env.local");
} catch {}

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function main() {
  const config = {
    topic: "Alpha: Covert Operatives — Two elite athletic South Asian female covert operatives (Tara and Zoya) in tactical athletic beachwear and gear harnesses on a sunlit alpine mountain lake ridge with pine trees, standing powerful, fearless, and heroic, executing high-stakes tactical reconnaissance with sisterhood chemistry and razor-sharp precision.",
    genre: "BOLLYWOOD_ACTION",
    requestedDurationSec: 30,
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    language: "hinglish-roman",
    priority: 50,
  };

  console.log(`\n======================================================`);
  console.log(`👑 [Omni 1.1 Director] Planning new Alpha Reel on localhost...`);
  console.log(`Topic: "${config.topic}"`);
  console.log(`Duration: ${config.requestedDurationSec}s | Genre: ${config.genre}`);
  console.log(`======================================================`);

  // Stage 1: Google Omni 1.1 as Bollywood Top Producer, Screenwriter & Director
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

  // Enforce the two female lead operatives character definitions
  manifest.characters = [
    {
      id: "operative_tara",
      name: "Tara",
      role: "lead",
      biometricDNA: {
        gender: "female",
        ageBand: "mid to late 20s",
        facialFeatures: "Chiseled South Asian bone structure, luminous intense almond eyes, radiant confident expression, athletic posture",
        hair: "Lustrous dark wavy hair tied back in an athletic tactical high ponytail with soft windblown strands"
      },
      wardrobe: {
        costume: "High-performance teal and navy athletic tactical two-piece swim set with matte-black modular tactical harness and utility gear",
        accessories: "Tactical gear backpack with matte straps, waterproof field watch, confident athletic stance"
      },
      voiceProfile: "Melodic, commanding and confident South Asian female voice"
    },
    {
      id: "operative_zoya",
      name: "Zoya",
      role: "lead",
      biometricDNA: {
        gender: "female",
        ageBand: "mid to late 20s",
        facialFeatures: "Striking South Asian facial features, determined sharp gaze, radiant warm smile, athletic build",
        hair: "Dark styled hair in a chic athletic bun with framing face strands"
      },
      wardrobe: {
        costume: "High-performance matte-black athletic tactical two-piece swim set with tactical webbing straps and utility buckle",
        accessories: "Tactical gear shoulder pack, rugged tactical wrist band, fearless posture"
      },
      voiceProfile: "Warm, sharp, and charismatic South Asian female voice"
    }
  ];

  console.log(`\n✅ [Omni 1.1 Master Plan Architecture Completed]`);
  console.log(`- Production ID: ${manifest.id}`);
  console.log(`- Genre: ${manifest.genre}`);
  console.log(`- Audio Strategy: ${manifest.audioStrategy}`);
  console.log(`- Planned Duration: ${manifest.plannedDurationSec}s`);
  console.log(`- Shots Planned: ${manifest.shots.length}`);
  for (const s of manifest.shots) {
    console.log(`  * [${s.id}] ${s.editorialDurationSec}s | Grammar: ${s.shotGrammar || "DYNAMIC"} | Char: ${s.continuityIn?.characterId || "tara/zoya"}`);
    console.log(`    Dialogue/Beat: "${(s.scriptText || s.dialogue || "").slice(0, 100)}"`);
  }

  // Save production manifest to database
  const production = await reelProductionStore.create(manifest);
  console.log(`\n💾 [Database Saved] Production ${production.id} (Revision ${production.revision})`);

  // Register production control with highest priority
  const control = await reelProductionControl.register(production.id, config.priority || 50);
  const activeControl = await reelProductionControl.requireActive(production.id);

  // Enqueue Narration / Stage 1 Operation
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

  console.log(`🚀 [Enqueued Narration Operation] ID: ${operation.id}, Status: ${operation.status}`);
  console.log(`\n======================================================`);
  console.log(`🎉 ALPHA REEL QUEUED SUCCESSFULLY FOR LOCALHOST!`);
  console.log(`Localhost Studio URL: http://localhost:3000/?continueReel=${production.id}`);
  console.log(`Localhost My Reels URL: http://localhost:3000/my-reels?reel=${production.id}`);
  console.log(`Production ID: ${production.id}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error("FATAL Launch Error:", err);
  process.exit(1);
});
