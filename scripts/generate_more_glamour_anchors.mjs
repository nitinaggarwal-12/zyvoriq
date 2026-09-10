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

const OUT_DIR = "scratch/more_glamour_anchors";
fs.mkdirSync(OUT_DIR, { recursive: true });

const concepts = [
  {
    id: "01_elena_monaco_superyacht",
    title: "Elena — Monaco Superyacht Golden Hour Glamour",
    prompt: `Cinematic 4K full-body fashion portrait and environment photography. Character: Elena, an extraordinarily glamorous 24-year-old European fashion icon with glowing sun-kissed golden skin, striking hazel-green eyes with subtle smokey cat-eye makeup, a confident captivating smile, and glossy honey-caramel wavy hair gently wind-swept by sea breeze. Wardrobe: Haute couture emerald-green liquid-silk satin backless halter gown with a daring cowl neckline, a hip-high slit revealing strappy metallic gold stiletto heels, accessorized with a luxury emerald-and-diamond serpent choker necklace, thin gold bangles, and oversized tortoiseshell designer sunglasses resting atop her hair. Location: The teak wood sun deck of an ultra-luxurious 250-foot superyacht moored in the deep blue waters of Monaco harbor (Port Hercule) during golden hour sunset. In the background: the pastel cliffside palaces and luxury villas of Monte Carlo, glittering superyachts, crystal-clear Mediterranean sea with orange and rose sunset reflections, a low marble cocktail table with an ice bucket and crystal champagne flutes. Cinematic 35mm lighting, warm golden glow, ultra-detailed textures, photorealistic Vogue editorial masterpiece.`
  },
  {
    id: "02_zara_dubai_sky_terrace",
    title: "Zara — Dubai Sky Penthouse Royal Desert Glamour",
    prompt: `Cinematic 4K full-body fashion portrait and environment photography. Character: Zara, a breathtaking 23-year-old Middle Eastern high-fashion model with luminous bronze skin, striking obsidian almond-shaped eyes framed with dramatic Arabian kohl winged eyeliner, chiseled cheekbones, nude-gloss lips, and sleek waist-length jet-black hair woven with delicate 24K gold foil thread accents. Wardrobe: An imperial molten-gold metallic plissé pleated cape gown with sculptural structured shoulders, a dramatic cutaway midriff connected by an intricate diamond-cut gold body chain, a floor-sweeping pleated metallic skirt that billows in the warm desert breeze with a soaring leg slit, paired with mirrored gold stiletto heels and sculpted gold filigree cuff bracelets. Location: An ultra-modern open-air sky terrace infinity pool of a penthouse skyscraper in Dubai at twilight. Sunken circular marble fire pit lounge inside the infinity pool, water reflecting the violet and amber dusk sky. In the vast distance, the golden-red desert dunes merge seamlessly with the futuristic illuminated glass towers of Dubai. 35mm cinematic lighting, dramatic fire glow and cool twilight contrast, photorealistic Harper's Bazaar cover editorial.`
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

console.log("🎉 All glamour anchors generated successfully!");
