import crypto from "node:crypto";
import { reelProductionStore } from "../lib/reel/productionStore.ts";
import { reelProductionControl } from "../lib/reel/productionControl.ts";
import { operationKey, reelOperationQueue } from "../lib/reel/operationQueue.ts";
import { planStudio1 } from "../lib/studio1/planner.ts";

function fingerprint(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function main() {
  console.log("🎬 ====================================================================");
  console.log("🎬 GOOGLE OMNI DIRECTORIAL: Modern Hindi Pop Music Video Production");
  console.log("🎬 Cast: 2 Modern Indian College Girls (Ananya Sharma & Riya Sen)");
  console.log("🎬 Theme: Campus Festival Stage, Full Desi Pop Music, Singing & Dance");
  console.log("🎬 ====================================================================\n");

  const topic = "Modern Hindi Pop Music Video: 2 modern Indian college girls (Ananya Sharma and Riya Sen) singing, dancing, and performing synchronized Bollywood Desi Pop dance choreography together with full music, background student crowd, stage pyrotechnics, and vibrant campus festival lighting.";

  const manifest = await planStudio1({
    topic,
    genre: "MUSIC_VIDEO",
    requestedDurationSec: 32,
    platform: "Instagram Reels",
    aspectRatio: "9:16",
    language: "hinglish-roman",
  });

  manifest.genre = "MUSIC_VIDEO";
  if (manifest.creativeBible) {
    manifest.creativeBible.genre = "MUSIC_VIDEO";
  }

  // Refine character casting with rich biometric DNA and unobstructed singing articulation
  const leadId = manifest.continuity?.characters?.[0]?.id || manifest.characters?.[0]?.id || "ananya_pop";
  const coLeadId = manifest.continuity?.characters?.[1]?.id || manifest.characters?.[1]?.id || "riya_pop";

  manifest.characters = [
    {
      id: leadId,
      name: "Ananya Sharma",
      archetype: "PERFORMER",
      role: "lead_singer_dancer",
      appearance: {
        description: "20-year-old modern Indian college girl and lead pop vocalist. Warm golden complexion, sharp chiseled jawline, expressive almond brown eyes, sleek high ponytail with silver elastic ring, gold hoop earrings. Wardrobe: trendy oversized pastel lilac varsity jacket over a white ribbed crop top and high-waisted beige utility cargo pants.",
        face: "Expressive warm brown eyes, radiant smile, completely unobstructed mouth, lips, and jawline for clear visible singing articulation",
      },
      biometricDNA: {
        hairColor: "Jet black with sleek styling",
        eyeColor: "Warm expressive brown",
        skinTone: "Warm golden Indian",
        distinguishingFeatures: "Gold hoop earrings, sleek high ponytail",
      },
    },
    {
      id: coLeadId,
      name: "Riya Sen",
      archetype: "PERFORMER",
      role: "co_lead_singer_dancer",
      appearance: {
        description: "20-year-old modern Indian college girl and energetic dance partner. Glowing dusky complexion, dimpled cheeks, sparkling hazel eyes, shoulder-length wavy layered hair with subtle honey highlights. Wardrobe: electric neon-green cropped bomber jacket over a black graphic baby tee and distressed denim skirt with chunky white platform sneakers.",
        face: "Dimpled cheeks, playful expressive hazel eyes, completely unobstructed mouth, lips, and jawline for clear visible singing articulation",
      },
      biometricDNA: {
        hairColor: "Caramel honey highlighted wavy hair",
        eyeColor: "Expressive hazel brown",
        skinTone: "Radiant dusky Indian",
        distinguishingFeatures: "Dimpled smile, neon-green bomber jacket",
      },
    },
  ];

  console.log(`[Omni Plan Compiled]`);
  console.log(`- Production ID: ${manifest.id}`);
  console.log(`- Genre: ${manifest.genre}`);
  console.log(`- Shots: ${manifest.shots.length}`);
  console.log(`- Cast:`, manifest.characters.map(c => `${c.name} (${c.id})`));

  // Save to Postgres
  const production = await reelProductionStore.create(manifest);
  console.log(`\n[Database] Production persisted. Revision: ${production.revision}`);

  // Register high priority (20) so the worker prioritizes it immediately
  const control = await reelProductionControl.register(production.id, 20);
  const activeControl = await reelProductionControl.requireActive(production.id);
  console.log(`[Database] Production control registered with priority: 20`);

  // Enqueue Narration
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

  console.log(`[Database] Narration operation enqueued: ${operation.id} (${operation.status})`);
  console.log(`\n🚀 PRODUCTION LAUNCHED! ID: ${manifest.id}`);
  console.log(`👉 Deep-link API: https://zyvoriq.up.railway.app/api/studio1/productions/${manifest.id}`);
  console.log(`👉 My Reels Gallery: https://zyvoriq.up.railway.app/my-reels`);
}

main().catch(err => {
  console.error("❌ Launch failed:", err);
  process.exit(1);
});
