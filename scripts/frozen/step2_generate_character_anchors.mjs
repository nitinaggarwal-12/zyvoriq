import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const BASE_DIR = "scratch/frozen_glacier_whispers";
const ANCHORS_DIR = path.join(BASE_DIR, "anchors");
fs.mkdirSync(ANCHORS_DIR, { recursive: true });

async function generateImage(prompt, outPath, label) {
  console.log(`🎨 Generating ${label}...`);
  const startTime = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to generate ${label}: HTTP ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  let imageBase64 = null;
  for (const part of parts) {
    if (part.inlineData?.data) {
      imageBase64 = part.inlineData.data;
      break;
    }
  }

  if (!imageBase64) {
    throw new Error(`No image data returned for ${label}: ${JSON.stringify(data).slice(0, 300)}`);
  }

  const imgBuf = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(outPath, imgBuf);
  console.log(`✅ Saved ${outPath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
}

async function main() {
  console.log("========================================================================");
  console.log("🎨 [STEP 2/5] GENERATING BIOMETRIC CHARACTER REFERENCE ANCHORS");
  console.log("========================================================================");

  const freyaPath = path.join(ANCHORS_DIR, "01_freya_ice_queen_anchor.png");
  const freyaPrompt = `Cinematic 16:9 full-body character portrait. Character: Freya, a majestic Scandinavian Nordic Ice Queen standing gracefully inside an arctic crystalline glacier cavern overlooking a stormy fjord.
Costume: Luminescent pure white ice-crystal gown, semi-sheer gossamer capelets draping from her shoulders with sparkling crystalline frost patterns, geometric ice-blue snowflake embroidery on the fitted bodice, long flowing skirt with a high slit revealing silver ice-crystal boots.
Biometrics: Radiant porcelain skin, gentle confident expression, piercing icy-blue eyes, loose platinum-blonde hair falling in natural waves over her left shoulder.
Lighting: Cool cinematic blue and violet ambient lighting, 8k resolution, photorealistic masterpiece, strictly zero on-screen text.`;
  await generateImage(freyaPrompt, freyaPath, "Anchor 1: Freya (The Ice Queen)");

  const astridPath = path.join(ANCHORS_DIR, "02_astrid_autumn_princess_anchor.png");
  const astridPrompt = `Cinematic 16:9 full-body character portrait. Character: Astrid, a spirited Nordic Autumn Princess standing beside a rustic carved wooden archway with golden leaves.
Costume: Tailored deep charcoal-black traveling dress with intricate dark teal and gold Nordic embroidery along the collar and hem, rich royal-magenta satin-lined woolen traveling cloak draped over one shoulder, ornate brass-buckled belt, rugged dark brown leather boots.
Biometrics: Warm hazel-green eyes, sun-kissed complexion with light freckles, auburn-chestnut hair styled in an elegant half-up crown braid, bright determined smile.
Lighting: Warm golden hour sunlight mixing with cool mountain air, 8k resolution, photorealistic masterpiece, strictly zero on-screen text.`;
  await generateImage(astridPrompt, astridPath, "Anchor 2: Astrid (The Autumn Princess)");

  console.log("🖼️ Building Composite Reference Sheet (00_frozen_composite_anchor.png)...");
  const compositePath = path.join(ANCHORS_DIR, "00_frozen_composite_anchor.png");
  execSync(`ffmpeg -y -i ${freyaPath} -i ${astridPath} -filter_complex "[0:v]scale=960:540[v0];[1:v]scale=960:540[v1];[v0][v1]hstack=inputs=2[out]" -map "[out]" ${compositePath}`);
  console.log(`✅ Saved Composite Reference Anchor: ${compositePath} (${Math.round(fs.statSync(compositePath).size / 1024)} KB)`);

  console.log("\n🎉 STEP 2 COMPLETE: Character Reference Sheet Locked and Ready!");
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
