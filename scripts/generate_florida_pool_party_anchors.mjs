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

const OUT_DIR = "scratch/florida_pool_party";
fs.mkdirSync(OUT_DIR, { recursive: true });

const concepts = [
  {
    id: "01_simran_florida_pool_singer",
    title: "Simran — Florida Pool Party Lead Singer & Host",
    prompt: `Cinematic 4K full-body photography. Character: Simran, an energetic and gorgeous 22-year-old Indian Punjabi pop singer, sun-kissed glowing skin, radiant joyful smile, holding a wireless stage microphone near her mouth, mid-performance. Wardrobe: Vibrant summer pool party outfit: a bright mango-yellow crochet halter bralette with subtle mirror embroidery, breezy white high-waisted linen shorts with golden rope tie belt, stylish pink-tinted festival sunglasses pushed up on her voluminous wavy ponytail, gold hoop earrings and bangles. Location: Raised wooden DJ stage deck overlooking an ultra-luxury mega-mansion pool party in Miami, Florida. Behind her: a colossal turquoise resort pool with clear splashing water, palm trees swaying against a clear sunny blue summer sky, colorful inflatable floats, and enthusiastic VIP partygoers dancing with drinks. 35mm cinematic lighting, sunny Florida summer vibes, razor-sharp 8k, photorealistic masterpiece.`
  },
  {
    id: "02_elena_florida_pool_glamour",
    title: "Elena — Florida Pool Sunken Lounge Glamour",
    prompt: `Cinematic 4K full-body fashion photography. Character: Elena, an extraordinarily glamorous 24-year-old European beauty with sun-bronzed skin, hazel eyes, honey-caramel beach waves, and an alluring relaxed smile. Wardrobe: Ultra-luxury resort chic: an emerald-green designer cut-out monokini with gold ring hardware, paired with a matching sheer emerald-silk sarong slit high on the hip, oversized designer tortoiseshell cat-eye sunglasses, layered gold chain necklaces and bangles. Location: Lounging and gracefully dancing on the submerged white marble sun-shelf inside the shallow crystal-clear turquoise pool of a Miami mega-mansion. Holding a crystal glass of sparkling rosé, gentle water ripples around her ankles, luxury white daybeds, towering royal palm trees, and art deco Florida mansion architecture in the background. Sunkissed summer golden hour lighting, photorealistic Vogue Resort editorial.`
  },
  {
    id: "03_leyla_florida_pool_bellydance",
    title: "Leyla — Florida Poolside Turkish Belly Dancer",
    prompt: `Cinematic 4K full-body dance photography. Character: Leyla, an alluring 22-year-old Turkish dancer with glowing olive-bronze skin, captivating hazel almond eyes, captivating smile, and glossy raven-black hair adorned with a gold forehead chain. Wardrobe: High-end resort edition Turkish belly dance costume: a radiant ruby-red and molten-gold embroidered bikini bedlah top with dangling gold coin tassels, a low-slung matching crystal coin belt, a translucent sheer crimson chiffon beach split skirt billowingly catching the summer breeze, barefoot on the wet white pool tiles with golden chime anklets. Location: Performing dynamic fluid dance isolations on the edge of the infinity pool at a Miami Florida luxury estate. Clear turquoise water splashing dynamically at her feet, tropical lush hibiscus flowers, palm trees, and summer sunshine reflecting on the water. 35mm cinematic action dance photography, photorealistic 8k.`
  },
  {
    id: "04_yasmina_florida_pool_cabana",
    title: "Yasmina — Florida VIP Cabana Pageant Elegance",
    prompt: `Cinematic 4K full-body fashion photography. Character: Yasmina, a breathtaking 22-year-old Lebanese beauty queen with glowing warm olive skin, mesmerizing almond hazel eyes, radiant smile, and long espresso-brown Hollywood beach waves. Wardrobe: Royal sapphire-blue metallic bikini paired with a floor-length sheer sapphire-blue crystal-embroidered resort duster kaftan that billows dramatically in the warm Florida breeze, sapphire drop earrings, and oversized vintage sunglasses. Location: Standing and dancing inside an exclusive VIP poolside cabana of a private Florida Keys waterfront estate. Billowing sheer white linen drapes, plush white sectional daybeds with tropical printed cushions, chilled champagne in silver ice buckets, overlooking the sparkling turquoise pool and Florida coastline with yachts. Warm summer sunshine, 35mm cinematic lighting, photorealistic pageant queen luxury.`
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

console.log("🎉 All Florida pool party anchors generated successfully!");
