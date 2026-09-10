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

const CONCEPTS = [
  {
    id: "01_neon_coven_manhattan_2026",
    title: "1. The Neon Coven (Manhattan Penthouse Gala · Today 2026)",
    fileName: "01_neon_coven_seraphina.png",
    prompt: "Cinematic 4K full-body fashion portrait and environment painting. Character: Seraphina Vance, an ultra-glamorous 24-year-old billionaire heiress and modern shadow sorceress with glossy brunette waves, flawless porcelain skin, smoky diamond cat-eye makeup, and hypnotic amethyst eyes. Dress: A show-stopping haute couture backless liquid-platinum chainmail evening gown with a daring thigh-high slit, diamond-encrusted body chains, and black velvet opera gloves. Subtle wisps of dark telekinetic starlight swirl gracefully around her manicured fingertips, crackling with violet energy. Location: An ultra-luxury glass-walled Manhattan penthouse rooftop terrace at midnight. In the background, the iconic illuminated New York City skyline, Central Park, glowing neon city lights, champagne flutes on marble tables, and dramatic purple thunderstorm lightning illuminating the clouds above. Ultra-high glamour, red carpet Met Gala aesthetic, 35mm cinematic lighting, photorealistic masterpiece."
  },
  {
    id: "02_cipher_silk_monaco_2031",
    title: "2. Cipher & Silk (Monaco High-Stakes Casino · 2031 +5 Years)",
    fileName: "02_cipher_silk_elena.png",
    prompt: "Cinematic 4K full-body fashion portrait and environment painting. Character: Elena Rostova, a sophisticated international operative and psionic crystal-mage with honey-blonde hair in an elegant chignon, radiant sun-kissed skin, and emerald-green eyes with subtle cybernetic contact lens hud reflections. Dress: A futuristic haute couture emerald-green liquid silk gown with an asymmetrical gold chrome neckline, a delicate gold cybernetic spine brace jewelry piece, and diamond ear cuffs. Hovering around her hands are glowing holographic playing cards and crystalline shards that refract ambient neon light. Location: A private cliffside Monte Carlo Monaco glass casino terrace at midnight overlooking the Mediterranean Sea. Luxury superyachts with glowing neon hulls anchored in the harbor, illuminated infinity pool, floating holographic chandeliers, and French Riviera coastline. High-fashion Vogue editorial meets James Bond sci-fi thriller, 8k resolution, photorealistic masterpiece."
  },
  {
    id: "03_solar_empress_dubai_2031",
    title: "3. The Solar Empress (Dubai Mega-Tower Sunset · 2031 +5 Years)",
    fileName: "03_solar_empress_amira.png",
    prompt: "Cinematic 4K full-body fashion portrait and environment painting. Character: Amira Al-Mansoor, a royal solar sorceress and global fashion icon with luminous warm bronze skin, striking amber-gold eyes, and waist-length dark wavy hair blowing in the warm desert breeze. Dress: An avant-garde haute couture sculptural molten-gold pleated lamé gown that shines like liquid sunlight, featuring an architectural high neck, plunging bodice, and sweeping golden train, adorned with solid gold serpent arm torcs and diamond body jewelry. Sparks of radiant golden solar plasma swirl effortlessly between her hands. Location: A private helipad lounge atop a 100-story futuristic Dubai skyscraper at sunset. Panoramic views of futuristic Dubai mega-towers, the turquoise Arabian Gulf, and golden desert dunes in the distance, with warm sunset golden hour lens flares reflecting off polished marble and gold accents. Ultra-luxury high glamour, Harper's Bazaar cover aesthetic, 35mm cinematic realism."
  },
  {
    id: "04_cyber_siren_tokyo_2031",
    title: "4. The Cyber Siren (Tokyo Shibuya Sky Runway · 2031 +5 Years)",
    fileName: "04_cyber_siren_aoi.png",
    prompt: "Cinematic 4K full-body fashion portrait and environment painting. Character: Aoi Takahashi, a world-famous pop idol supermodel and sonic illusionist with sleek iridescent silver-lavender hair, razor-sharp cheekbones, glossy lips, and electric sapphire eyes. Dress: A cutting-edge haute couture luminescent iridescent white-and-silver latex structured evening dress with sheer holographic organza sleeves that glow faintly with soundwave frequency patterns, paired with chrome stiletto boots. She holds an elegant micro-laser microphone wand emitting soft neon pink audio shockwaves. Location: An open-air glass observation deck atop Shibuya Sky in Tokyo at night during a futuristic rainstorm. Reflective wet glass floor mirroring giant glowing neon billboards, holographic anime projections, and the sprawling sea of Tokyo neon lights far below. High-energy cyberpunk glamour, Vogue Runway aesthetic, cinematic 8k resolution."
  }
];

async function generateConcept(concept) {
  const filePath = path.join(OUT_DIR, concept.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
    console.log(`⏭️ Already exists: ${concept.fileName} (${Math.round(fs.statSync(filePath).size / 1024)} KB)`);
    return;
  }

  console.log(`\n🎨 Generating: ${concept.title}...`);
  const startTime = Date.now();

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: concept.prompt }] }]
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to generate ${concept.fileName}: HTTP ${res.status} ${await res.text()}`);
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
    throw new Error(`No image data returned for ${concept.fileName}`);
  }

  const imgBuf = Buffer.from(imageBase64, "base64");
  fs.writeFileSync(filePath, imgBuf);
  console.log(`✅ Saved ${concept.fileName} (${Math.round(imgBuf.length / 1024)} KB) in ${Math.round((Date.now() - startTime) / 1000)}s`);
}

async function main() {
  console.log("========================================================================");
  console.log("🎬 GENERATING 4 HIGH-GLAMOUR THRILLER-FANTASY CONCEPTS (TODAY / +5 YEARS)");
  console.log("========================================================================");

  for (const concept of CONCEPTS) {
    try {
      await generateConcept(concept);
    } catch (e) {
      console.error(`❌ Error on ${concept.id}:`, e.message);
    }
  }

  console.log("\n========================================================================");
  console.log("🎉 ALL 4 GLAMOUR CONCEPTS GENERATED IN " + OUT_DIR);
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
