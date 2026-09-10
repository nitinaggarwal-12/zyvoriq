import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const OUT_DIR = "scratch/pageant_glamour_anchors";
fs.mkdirSync(OUT_DIR, { recursive: true });

const concepts = [
  {
    id: "01_victoria_miss_universe_stage",
    title: "Victoria — Miss Universe Grand Stage (Nordic Diamond)",
    prompt: `Cinematic 4K full-body fashion portrait and environment photography. Character: Victoria, an ethereal and breathtaking 21-year-old Danish beauty queen inspired by Miss Universe 2024, with flawless porcelain skin, piercing icy-blue eyes, sculpted Nordic features, a radiant triumphant smile, and voluminous platinum-blonde Hollywood waves crowned with an exquisite diamond-and-pearl pageant crown. Wardrobe: Haute couture blush-pink and crystalline evening gown: an intricately encrusted corset bodice shimmering with thousands of Swarovski crystals, iridescent sequins, and delicate silver beadwork, paired with a fitted mermaid skirt that flows into a floor-sweeping crystalline train, and an ethereal sheer silk-tulle capelet billowing behind her shoulders. Location: The grand final stage of the Miss Universe pageant. High-gloss black mirrored catwalk reflecting golden runway spotlights, colossal curved LED backdrop displays glowing with golden nebula visuals, vertical cold-spark pyrotechnic fountains showering golden sparks in the background, cheering arena audience silhouettes with waving flags. 35mm cinematic lighting, ultra-sharp 8k pageant broadcast camera quality, majestic glamour editorial.`
  },
  {
    id: "02_chidimma_miss_universe_stage",
    title: "Chidimma — Miss Universe Grand Stage (Golden Empress)",
    prompt: `Cinematic 4K full-body fashion portrait and environment photography. Character: Chidimma, a majestic and statuesque 23-year-old African beauty queen inspired by Miss Universe Nigeria 2024, with flawless glowing deep ebony skin, striking sculpted cheekbones, radiant almond eyes with golden bronze eyeshadow, a commanding regal smile, and sleek braided updo adorned with delicate gold filigree hair cuffs. Wardrobe: An imperial molten-gold architectural gown: metallic gold sculpted corset bodice adorned with hand-stitched African geometric beadwork, shimmering gold crystal fringes that dance with movement, a hip-high slit revealing metallic gold strappy heels, and an asymmetrical pleated gold lamé cape that cascades dramatically from one shoulder to the floor. Location: The Miss Universe grand coronation runway catwalk. Mirrored black stage with warm amber uplighting, dramatic sweeping laser beams, vertical cryogenic smoke effects, and grand LED screens displaying golden sunburst graphics. Photorealistic 8k, dramatic lighting, international pageant queen perfection.`
  },
  {
    id: "03_yasmina_miss_world_stage",
    title: "Yasmina — Miss World Grand Gala (Levantine Sapphire)",
    prompt: `Cinematic 4K full-body fashion portrait and environment photography. Character: Yasmina, a radiant 22-year-old Lebanese beauty queen inspired by Miss World 2024, with glowing warm olive-toned skin, mesmerizing almond-shaped hazel-green eyes with classic winged eyeliner, glossy nude lips, a warm captivating smile, and waist-length glossy espresso-brown waves with soft Hollywood curls. Wardrobe: An opulent royal sapphire-blue haute couture sheer illusion evening gown, hand-embroidered with intricate celestial starburst patterns of deep blue, cobalt, and diamond crystals, a plunging sweetheart neckline with delicate sheer mesh, a high side leg slit, paired with sapphire drop chandelier earrings and a delicate silver pageant tiara. Location: The Miss World grand coronation ballroom stage in Mumbai; opulent gilded arches, hanging crystal chandeliers, ambient warm violet and gold gala stage lighting, floral arrangements of white orchids and blue hydrangeas along the runway, cheering arena gala audience. 35mm cinematic lighting, photorealistic Vogue and pageant broadcast masterpiece.`
  }
];

async function generateAnchor(concept) {
  const filePath = path.join(OUT_DIR, `${concept.id}.png`);
  console.log(`🎨 Generating ${concept.title}...`);
  const startTime = Date.now();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: concept.prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to generate ${concept.id}: HTTP ${res.status} ${await res.text()}`);
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
    throw new Error(`No image data returned for ${concept.id}`);
  }

  const imgBuf = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filePath, imgBuf);
  console.log(`✅ Saved ${filePath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
  return filePath;
}

for (const concept of concepts) {
  try {
    await generateAnchor(concept);
  } catch (err) {
    console.error(`❌ Error generating ${concept.id}:`, err);
  }
}

console.log("🎉 All pageant glamour anchors generated successfully!");
