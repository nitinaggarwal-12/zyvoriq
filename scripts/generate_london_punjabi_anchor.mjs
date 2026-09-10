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

const filePath = path.join(OUT_DIR, "01_simran_london_stage_anchor.png");

const prompt = `Cinematic 4K full-body concert portrait and environment painting. Character: Simran, a vibrant, charismatic 21-year-old modern British-Punjabi college student and pop performer with radiant warm skin, sparkling brown eyes, infectious confident smile, and glossy long dark hair in loose bouncy waves. Wardrobe: An ultra-chic contemporary Indo-Western college fusion concert outfit: a dazzling electric magenta and molten-gold embroidered cropped corset top featuring intricate traditional Punjabi mirror-work and modern athletic cutouts, paired with high-waisted royal violet and gold wide-leg silk trousers with side-stripe embroidery, and stylish white designer stage platform sneakers. She wears sparkling traditional gold jhumka earrings and a sleek wireless singer headset microphone. Location: Main concert stage at a sold-out London arena (Indigo at The O2 London). Behind her, massive ultra-wide LED stage backdrops display dynamic London and Punjabi neon visuals, golden and cyan concert laser beams cut through atmospheric stage haze, CO2 pyrotechnic cryo jets blast upward, and an enthusiastic crowd waves glowing lights. Vibrant, glamorous modern college energy, 35mm concert cinematography, 8k resolution, photorealistic masterpiece.`;

console.log("🎨 Generating High-Energy Modern College Punjabi Girl London Stage Anchor on Cloudtop...");
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
  throw new Error("No image data returned for London Punjabi anchor");
}

const imgBuf = Buffer.from(imageBase64, "base64");
fs.writeFileSync(filePath, imgBuf);
console.log(`✅ Saved ${filePath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
