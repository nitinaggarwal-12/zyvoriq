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

const OUT_DIR = "scratch/thriller_fantasy_concepts";
fs.mkdirSync(OUT_DIR, { recursive: true });

const CONCEPTS = [
  {
    id: "01_eclipse_alchemist_vespera",
    title: "1. The Eclipse Alchemist (Vespera)",
    fileName: "01_eclipse_alchemist_vespera.png",
    prompt: "Cinematic 4K full-body character concept art and environment painting. Character: Vespera, a striking 23-year-old rogue alchemist with sleek silver-white hair, porcelain skin, sharp determined eyes, wearing an intricate high-collared tailored obsidian black leather trench coat embroidered with glowing neon cyan alchemical runes and silver filigree. She wields dual translucent liquid-mercury daggers emitting faint blue mist. Location: Suspended on the stone balcony of a colossal gothic dark-stone cathedral floating high above the clouds. In the dramatic sky behind her, a colossal total solar eclipse casts a dark violet and magenta corona flare. Glowing runes etched into the cathedral stone floor. 35mm anamorphic cinematic lighting, 8k resolution, photorealistic fantasy masterpiece."
  },
  {
    id: "02_abyssal_siren_nerida",
    title: "2. Siren of the Abyssal Rift (Nerida)",
    fileName: "02_abyssal_siren_nerida.png",
    prompt: "Cinematic 4K full-body character concept art and environment painting. Character: Nerida, an ethereal aquatic siren priestess with flowing iridescent dark sapphire hair, luminous aqua-cyan glowing eyes, and shimmering turquoise fish scales glistening along her cheekbones, collarbones, and slender arms. She wears a flowing gown woven from deep-ocean bioluminescent sea-silk, translucent azure fin-like silk frills, and pearl shell armor. Location: An ancient sunken Atlantean temple at the bottom of an 8,000-meter deep oceanic trench. Massive cyclopean stone arches and carved pillars encrusted with glowing violet and blue bioluminescent coral. Giant glowing deep-sea manta rays and jellyfish floating in the dark turquoise water behind her. Underwater cinematic volumetric god rays, hyper-detailed, photorealistic fantasy masterpiece."
  },
  {
    id: "03_chrono_thief_renata",
    title: "3. Chronos: The Time-Thief (Renata Chronos)",
    fileName: "03_chrono_thief_renata.png",
    prompt: "Cinematic 4K full-body character concept art and environment painting. Character: Renata Chronos, a charismatic 22-year-old steampunk time-thief with wind-tousled auburn hair, wearing polished brass-and-leather aviator goggles perched on her head. She wears a high-fashion Victorian steampunk leather duster coat, emerald green silk vest, tailored brown trousers, and knee-high leather boots. On her right arm is an intricate clockwork gauntlet with spinning gold gears, holding a glowing emerald-crystal pocket watch. Location: The interior of an infinite mechanical clock tower at midnight. Colossal interlocking bronze cogs, suspended pendulum blades, and giant Roman numeral clock faces with glowing emerald light filtering through frozen mid-air glass shards. Dramatic atmospheric steam and golden clockwork lighting, 35mm cinematic depth of field, 8k resolution."
  },
  {
    id: "04_valkyrie_astrid",
    title: "4. Valkyrie: The Ashen Gate (Astrid Iron-Feather)",
    fileName: "04_valkyrie_astrid.png",
    prompt: "Cinematic 4K full-body character concept art and environment painting. Character: Astrid Iron-Feather, a fierce Norse warrior Valkyrie with platinum blonde braided hair, piercing ice-blue eyes, and battle-ready warpaint on her cheekbones. She is clad in ornate blackened iron scale armor with fur mantle shoulders, silver raven-feather motifs, and a ceremonial winged silver helm. She grips a tall spear made of crackling glacial frost and starlight. Location: A windswept volcanic glacier in Iceland during winter. Black volcanic basalt cliffs, smoking geothermal vents, and snow-dusted ice peaks under an ominous, vibrant green and purple Aurora Borealis (Northern Lights) illuminating the night sky. Swirling snow blizzard particles, epic cinematic scale, photorealistic fantasy masterpiece."
  },
  {
    id: "05_midnight_tarot_selene",
    title: "5. Midnight Tarot (Madame Selene)",
    fileName: "05_midnight_tarot_selene.png",
    prompt: "Cinematic 4K full-body character concept art and environment painting. Character: Madame Selene, an enigmatic Victorian ringmistress and mystic with jet-black raven hair styled in vintage waves, porcelain skin, and dark crimson lips, wearing a gold crystal monocle over her left eye. She wears an exquisite Victorian velvet emerald-green corset gown, a black satin cape with peacock feather lining, and a tilted black silk top hat adorned with raven feathers. Her gloved hands gracefully fan floating antique silver-and-gold tarot cards that hover with faint spectral blue flames. Location: A foggy Victorian cobblestone alley at midnight outside a mysterious antique carnival. In the background, an ornate vintage carousel with shadowy mechanical horses glowing under amber gas lamps, shrouded in swirling violet mist. Rich moody atmosphere, 35mm cinematic lens, hyper-detailed fantasy art."
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
  console.log("🎬 GENERATING 5 THRILLER-FANTASY CONCEPT ANCHORS & ENVIRONMENTS");
  console.log("========================================================================");

  for (const concept of CONCEPTS) {
    try {
      await generateConcept(concept);
    } catch (e) {
      console.error(`❌ Error on ${concept.id}:`, e.message);
    }
  }

  console.log("\n========================================================================");
  console.log("🎉 ALL 5 CONCEPT ANCHORS CREATED IN " + OUT_DIR);
  console.log("========================================================================");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
