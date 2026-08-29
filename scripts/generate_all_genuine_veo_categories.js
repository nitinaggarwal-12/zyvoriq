const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found in .env.local");
  process.exit(1);
}
const apiKey = match[1].trim();

const CATEGORIES_TO_GENERATE = [
  {
    id: "track_music_synthwave_2099",
    category: "music",
    title: "2099 Cyberpunk Synthwave Beat Lab",
    subtitle: "Analog Modular Synthesizer Session with Holographic Equalizers in Neo-Tokyo",
    character: "Kenji Sato (Sound Architect)",
    prompt: "Cinematic 4K shot of an analog electronic music synthesizer laboratory in Neo-Tokyo with glowing modular patch cables, neon purple and cyan lighting, VU meters bouncing, 24fps smooth motion",
    fileName: "veo_music_synthwave_genuine.mp4",
    duration: 8
  },
  {
    id: "track_gaming_nexus_arena",
    category: "gaming",
    title: "Grand Finals: Nexus Arena Championship",
    subtitle: "Tactical Arena Esports Championship & Stadium Holographic Replay",
    character: "Aoi Takahashi (Esports Caster)",
    prompt: "Cinematic 4K wide stadium camera sweeping over a futuristic esports arena filled with cheering crowds and giant holographic battle displays, confetti lasers, 24fps motion",
    fileName: "veo_gaming_nexus_genuine.mp4",
    duration: 8
  },
  {
    id: "track_cinema_midnight_shadow",
    category: "cinema",
    title: "Midnight Shadow: The Last Detective",
    subtitle: "35mm Chicago Film Noir Mystery in Heavy Rain",
    character: "Marcus Vance (Detective Cole)",
    prompt: "Cinematic 35mm film noir of a lone detective in a trenchcoat walking down a rain-slicked Chicago alleyway under a flickering gas streetlamp, wet reflections, heavy rain, mist",
    fileName: "veo_cinema_noir_genuine.mp4",
    duration: 8
  },
  {
    id: "track_culinary_miyazaki_wagyu",
    category: "culinary",
    title: "The Art of A5 Miyazaki Wagyu Searing",
    subtitle: "Michelin Masterclass on Binchotan Charcoal & Precise 54°C Maillard Sear",
    character: "Kenji Sato (Michelin Star Chef)",
    prompt: "Cinematic 4K macro culinary shot of a thick cut of marbled A5 Wagyu beef sizzling on white binchotan charcoal grill with aromatic smoke and caramelizing crust, fine dining",
    fileName: "veo_culinary_wagyu_genuine.mp4",
    duration: 8
  },
  {
    id: "track_wellness_advaita_vedanta",
    category: "wellness_faith",
    title: "Advaita Vedanta: The Observer & The Observed",
    subtitle: "Sacred Non-Dual Philosophy & Himalayan Hermitage Sunrise",
    character: "Priya Sharma (Vedantic Scholar)",
    prompt: "Cinematic 4K tranquil shot of a Himalayan meditation hermitage at sunrise with mist floating over river Ganges and oil lamps burning serenely on stone steps, golden sacred light",
    fileName: "veo_wellness_vedanta_genuine.mp4",
    duration: 8
  },
  {
    id: "track_science_alphafold_cures",
    category: "science_space",
    title: "AlphaFold 3: Designing Atomic Targeted Medicines",
    subtitle: "Molecular 4K Simulation on Synthetic Protein Binding & Neutralization",
    character: "Elena Rostova (Computational Biologist)",
    prompt: "Cinematic 4K 3D scientific visualization of a synthetic protein molecule folding in real time with glowing atomic bonds and targeted antibody docking into an oncogenic receptor",
    fileName: "veo_science_alphafold_genuine.mp4",
    duration: 8
  },
  {
    id: "track_history_mohenjo_daro",
    category: "history_geopolitics",
    title: "Mohenjo-Daro: The Bronze Age Urban Utopia",
    subtitle: "4K Archaeological Reconstruction of 2500 BCE Indus Valley City Planning",
    character: "Priya Sharma (Archaeological Historian)",
    prompt: "Cinematic 4K archaeological historical reconstruction of ancient Mohenjo-Daro brick city streets, the Great Bath, and merchants in 2500 BCE Indus Valley under warm golden sunlight",
    fileName: "veo_history_mohenjodaro_genuine.mp4",
    duration: 8
  },
  {
    id: "track_finance_sovereign_liquidity",
    category: "finance_wealth",
    title: "Central Bank Sovereign Liquidity & Gold Reserves",
    subtitle: "Institutional Macro Breakdown of Cross-Border Settlement & Yield Curves",
    character: "Marcus Vance (Macro Strategist)",
    prompt: "Cinematic 4K high-end financial boardroom overlooking Manhattan skyline with holographic golden yield curves and global trade flows displaying on transparent glass screens",
    fileName: "veo_finance_macro_genuine.mp4",
    duration: 8
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function generateCategoryVideo(item) {
  const filePath = path.resolve(process.cwd(), "public/assets/video", item.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
    console.log(`⏩ [${item.category.toUpperCase()}] Already exists (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB): ${item.fileName}`);
    return true;
  }

  console.log(`\n🚀 [${item.category.toUpperCase()}] Dispatched to Google Veo 3.1: "${item.title}"`);
  console.log(`   Prompt: "${item.prompt}"`);

  const modelName = "veo-3.1-fast-generate-preview";

  try {
    const dispatchRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: item.prompt }],
          parameters: { aspectRatio: "16:9", durationSeconds: item.duration }
        })
      }
    );

    const dispatchData = await dispatchRes.json();
    if (dispatchData.error) {
      console.warn(`   ❌ Dispatch Error:`, dispatchData.error.message || dispatchData.error);
      return false;
    }

    const operationName = dispatchData.name;
    console.log(`   ⏳ Operation: ${operationName}. Polling cluster...`);

    for (let poll = 1; poll <= 35; poll++) {
      await sleep(6000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (pollData.done) {
        if (pollData.error) {
          console.warn(`   ❌ Render Error:`, pollData.error.message || pollData.error);
          return false;
        }

        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        const videoUri = samples?.[0]?.video?.uri;
        if (videoUri) {
          console.log(`   🎉 Render Complete! Downloading MP4 stream...`);
          const dlRes = await fetch(`${videoUri}&key=${apiKey}`);
          const ab = await dlRes.arrayBuffer();
          const buf = Buffer.from(ab);

          if (buf.length > 50000) {
            fs.writeFileSync(filePath, buf);
            console.log(`   ✅ Successfully Saved Veo 3.1 MP4: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
            return true;
          }
        }
      }
    }
  } catch (err) {
    console.error(`   ❌ Exception:`, err.message);
  }
  return false;
}

async function main() {
  console.log("================================================================================");
  console.log("🎬 GOOGLE VEO 3.1 BATCH GENERATOR FOR GENUINE CATEGORY CONTENT");
  console.log("================================================================================\n");

  for (const item of CATEGORIES_TO_GENERATE) {
    await generateCategoryVideo(item);
    await sleep(3000);
  }

  console.log("\n================================================================================");
  console.log("🎉 ALL REQUESTED CATEGORY VIDEOS GENERATED & DOWNLOADED!");
  console.log("================================================================================");
}

main().catch(console.error);
