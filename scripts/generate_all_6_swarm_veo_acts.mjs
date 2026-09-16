import fs from "node:fs";
import path from "node:path";
import { generateVeoVideoBytes } from "../lib/ai/veoService.ts";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const ACTS = [
  {
    act: 1,
    file: "scratch/swarm_veo_act1.mp4",
    prompt:
      "Cinematic 16:9 widescreen commercial shot, Master Italian Pizzaiolo in a Neapolitan volcanic brick bakery tossing fine white flour across a dark marble table in slow motion, warm 2200K wood-fired oven glow in background, 35mm film grain, mouth closed, non-vocal acting",
  },
  {
    act: 2,
    file: "scratch/swarm_veo_act2.mp4",
    prompt:
      "Cinematic 16:9 widescreen close-up, artisan baker hands gently kneading and stretching fermented pizza dough on a flour-dusted marble counter, warm Neapolitan wood-fire glow in background, 35mm film grain",
  },
  {
    act: 3,
    file: "scratch/swarm_veo_act3.mp4",
    prompt:
      "Cinematic 16:9 widescreen macro shot, chef hands crushing vibrant red San Marzano tomatoes into a copper bowl, rich tomato sauce splashing in slow motion, fresh green basil leaves, warm dramatic studio lighting, 35mm film grain",
  },
  {
    act: 4,
    file: "scratch/swarm_veo_act4.mp4",
    prompt:
      "Cinematic 16:9 widescreen shot, Italian baker sliding a raw Neapolitan pizza on a copper peel into a roaring wood-fired brick oven, golden oak flames curling across the vaulted ceiling, glowing embers flying, slow motion",
  },
  {
    act: 5,
    file: "scratch/swarm_veo_act5.mp4",
    prompt:
      "Cinematic 16:9 macro shot inside a roaring wood-fired brick pizza oven, pizza crust puffing up and blistering with leopard-spotted char marks, fresh mozzarella cheese bubbling and melting in orange firelight, slow motion",
  },
  {
    act: 6,
    file: "scratch/swarm_veo_act6.mp4",
    prompt:
      "Cinematic 16:9 widescreen hero shot, Italian baker pulling a steaming crispy Neapolitan Margherita pizza from a brick oven onto a wooden board, drizzling golden olive oil over bubbling cheese and fresh basil leaves, warm lighting",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateActWithRetry(item, maxRetries = 3) {
  const outPath = path.join(process.cwd(), item.file);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 500_000) {
    console.log(`[Act ${item.act}] Already exists (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB), skipping.`);
    return outPath;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Act ${item.act}] (Attempt ${attempt}/${maxRetries}) Dispatching to Google Veo 3.1...`);
      const res = await generateVeoVideoBytes(item.prompt, {
        aspectRatio: "16:9",
        durationSeconds: 6,
        modelTier: "fast",
      });
      fs.writeFileSync(outPath, res.buffer);
      console.log(`✅ [Act ${item.act}] COMPLETED! Saved ${outPath} (${(res.buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      return outPath;
    } catch (err) {
      console.warn(`⚠️ [Act ${item.act}] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`Waiting 5 seconds before retry...`);
        await sleep(5000);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log("=== Launching Sequential Veo 3.1 Live-Action Generation for All 6 Acts ===");
  for (const item of ACTS) {
    await generateActWithRetry(item);
  }
  console.log("=== ALL 6 LIVE-ACTION VEO 3.1 ACTS GENERATED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
