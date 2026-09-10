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

const OUT_DIR = "scratch/turkish_belly_dancer_spain";
fs.mkdirSync(OUT_DIR, { recursive: true });

const filePath = path.join(OUT_DIR, "01_leyla_turkish_dancer_anchor.png");

const prompt = `Cinematic 4K full-body dance portrait and environment painting. Character: Leyla, an alluring and radiant 22-year-old Turkish belly dancer with glowing olive-bronze skin, captivating dark hazel almond-shaped eyes with dramatic winged eyeliner, a graceful captivating smile, and waist-length glossy black hair adorned with a delicate gold forehead jewel chain. Wardrobe: An exquisite haute couture Turkish Oryantal belly dance costume: a dazzling ruby-red and molten-gold embroidered bedlah bra top and matching sculpted hip belt encrusted with shimmering Swarovski crystals, cascading gold bead fringe, and delicate Turkish coin accents. A flowing, breezy sheer crimson silk-chiffon split skirt with high side slits that billows with movement, sheer arm cuffs with floating silk ribbons, and ornate gold filigree bangles and anklets. Location: An opulent luxury Andalusian palace hotel courtyard in Spain (Seville / Granada). Hand-carved Moorish horseshoe arches, intricate blue and turquoise azulejo tilework, a central carved marble fountain with splashing water, fragrant blooming bougainvillea climbing the walls, and warm ambient glowing brass lanterns casting dancing candlelit shadows. Warm twilight Mediterranean evening atmosphere, 35mm cinematic lighting, 8k resolution, photorealistic masterpiece.`;

console.log("🎨 Generating Turkish Belly Dancer in Spanish Hotel Anchor on Cloudtop...");
const startTime = Date.now();

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  })
});

if (!res.ok) {
  throw new Error(`Failed to generate: HTTP ${res.status} ${await res.text()}`);
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
  throw new Error("No image data returned for Turkish belly dancer anchor");
}

const imgBuf = Buffer.from(imageBase64, "base64");
fs.writeFileSync(filePath, imgBuf);
console.log(`✅ Saved ${filePath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
