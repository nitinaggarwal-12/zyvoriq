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

const OUT_DIR = "scratch/punjabi_london_stage";
fs.mkdirSync(OUT_DIR, { recursive: true });

const filePath = path.join(OUT_DIR, "02_simran_london_summer_outdoor.png");

const prompt = `Cinematic 4K full-body concert portrait and environment painting. Character: Simran, a gorgeous, high-energy 21-year-old modern British-Punjabi college student and pop performer with radiant sun-kissed golden skin, infectious joyful laugh, sparkling brown eyes, and wind-blown wavy dark hair styled in a chic high ponytail with face-framing tendrils. Wardrobe for hot summer outdoor festival: An ultra-chic, breathable modern Indo-Western summer outfit: an airy marigold-yellow and sunset-tangerine silk-cotton cropped halter bralette top with delicate Punjabi mirror-work and breezy tie-back detail, paired with high-waisted lightweight breezy flared ivory-and-gold dhoti-shorts with embroidered side borders and playful gold cowrie shell tassels, designed for effortless dancing in hot weather. She wears rose-gold tinted festival sunglasses perched in her hair, lightweight gold Punjabi jhumka earrings, stacked bohemian wrist bangles, and stylish white canvas sneakers. Location: Main outdoor summer festival stage in London on a hot, sunny 30°C summer afternoon (Hyde Park Summer Festival / Southbank Open-Air Stage). Brilliant blue summer sky, London skyline and Big Ben / London Eye visible in the warm hazy distance, colorful festival flags fluttering, cooling water mist nozzles spraying a fine glittering rainbow mist over a massive cheering crowd dancing in summer festival attire. Natural vibrant summer sunlight, 35mm cinematic lens, 8k resolution, photorealistic masterpiece.`;

console.log("🎨 Generating Hot Summer Outdoor London Stage Punjabi Anchor on Cloudtop...");
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
  throw new Error("No image data returned for summer London Punjabi anchor");
}

const imgBuf = Buffer.from(imageBase64, "base64");
fs.writeFileSync(filePath, imgBuf);
console.log(`✅ Saved ${filePath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
