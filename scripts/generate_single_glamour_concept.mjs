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

const OUT_DIR = "scratch/glamour_thriller_concepts";
fs.mkdirSync(OUT_DIR, { recursive: true });

const filePath = path.join(OUT_DIR, "01_neon_coven_seraphina.png");

const prompt = `Cinematic 4K full-body fashion portrait and environment painting. Character: Seraphina Vance, an ultra-glamorous 24-year-old billionaire heiress and modern shadow sorceress with glossy brunette waves, flawless porcelain skin, smoky diamond cat-eye makeup, and hypnotic amethyst eyes. Dress: A show-stopping haute couture backless liquid-platinum chainmail evening gown with a daring thigh-high slit, diamond-encrusted body chains, and black velvet opera gloves. Subtle wisps of dark telekinetic starlight swirl gracefully around her manicured fingertips, crackling with violet energy. Location: An ultra-luxury glass-walled Manhattan penthouse rooftop terrace at midnight. In the background, the iconic illuminated New York City skyline, Central Park, glowing neon city lights, champagne flutes on marble tables, and dramatic purple thunderstorm lightning illuminating the clouds above. Ultra-high glamour, red carpet Met Gala aesthetic, 35mm cinematic lighting, photorealistic masterpiece.`;

console.log("🎨 Generating single glamour thriller concept on Cloudtop...");
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
  throw new Error("No image data returned for Seraphina anchor");
}

const imgBuf = Buffer.from(imageBase64, "base64");
fs.writeFileSync(filePath, imgBuf);
console.log(`✅ Saved ${filePath} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
