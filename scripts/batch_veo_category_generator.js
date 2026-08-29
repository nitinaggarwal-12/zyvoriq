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

const CATEGORY_PROMPTS = [
  {
    id: "track_fantasy_starlight_wyrm",
    category: "fantasy_scifi",
    title: "Citadel of the Starlight Wyrm",
    subtitle: "High Fantasy Arcane Spires & Crystalline Dragon Flight",
    character: "Elena Rostova (Arcane Chronicler)",
    prompt: "Cinematic 4K fantasy aerial shot of a magnificent crystalline dragon flying through floating golden arcane castle spires in a sunset sky, volumetric clouds, photorealistic lighting, 24fps smooth motion",
    fileName: "veo_fantasy_dragon_master.mp4",
    duration: 8
  },
  {
    id: "track_music_synthwave_2099",
    category: "music",
    title: "2099 Cyberpunk Synthwave Beat Lab",
    subtitle: "Analog Modular Synthesizer Session & Holographic Audio",
    character: "Kenji Sato (Sound Architect)",
    prompt: "Cinematic 4K shot of an analog electronic music synthesizer laboratory in Neo-Tokyo with glowing modular patch cables, neon purple and cyan lighting, VU meters bouncing, 24fps motion",
    fileName: "veo_music_synthwave_master.mp4",
    duration: 8
  },
  {
    id: "track_gaming_nexus_arena",
    category: "gaming",
    title: "Grand Finals: Nexus Arena Championship",
    subtitle: "Tactical Arena Esports Championship & Stadium Replay",
    character: "Aoi Takahashi (Esports Caster)",
    prompt: "Cinematic 4K wide stadium camera sweeping over a futuristic esports arena filled with cheering crowds and giant holographic battle displays, confetti lasers, 24fps motion",
    fileName: "veo_gaming_nexus_master.mp4",
    duration: 8
  },
  {
    id: "track_cinema_midnight_shadow",
    category: "cinema",
    title: "Midnight Shadow: The Last Detective",
    subtitle: "35mm Chicago Film Noir Mystery in Heavy Rain",
    character: "Marcus Vance (Detective Cole)",
    prompt: "Cinematic 35mm film noir of a lone detective in a trenchcoat walking down a rain-slicked Chicago alleyway under a flickering gas streetlamp, wet reflections, heavy rain, mist",
    fileName: "veo_cinema_noir_master.mp4",
    duration: 8
  },
  {
    id: "track_culinary_miyazaki_wagyu",
    category: "culinary",
    title: "The Art of A5 Miyazaki Wagyu Searing",
    subtitle: "Michelin Masterclass on Binchotan Charcoal & Maillard Sear",
    character: "Kenji Sato (Michelin Star Chef)",
    prompt: "Cinematic 4K macro culinary shot of a thick cut of marbled A5 Wagyu beef sizzling on white binchotan charcoal grill with aromatic smoke and caramelizing crust, fine dining",
    fileName: "veo_culinary_wagyu_master.mp4",
    duration: 8
  },
  {
    id: "track_wellness_advaita_vedanta",
    category: "wellness_faith",
    title: "Advaita Vedanta: The Observer & The Observed",
    subtitle: "Sacred Non-Dual Philosophy & Himalayan Hermitage Dawn",
    character: "Priya Sharma (Vedantic Scholar)",
    prompt: "Cinematic 4K tranquil shot of a Himalayan meditation hermitage at sunrise with mist floating over river Ganges and oil lamps burning serenely on stone steps, golden sacred light",
    fileName: "veo_wellness_vedanta_master.mp4",
    duration: 8
  },
  {
    id: "track_science_alphafold_cures",
    category: "science_space",
    title: "AlphaFold 3: Designing Atomic Targeted Medicines",
    subtitle: "Molecular 4K Simulation on Synthetic Protein Binding",
    character: "Elena Rostova (Computational Biologist)",
    prompt: "Cinematic 4K 3D scientific visualization of a synthetic protein molecule folding in real time with glowing atomic bonds and targeted antibody docking into an oncogenic receptor",
    fileName: "veo_science_alphafold_master.mp4",
    duration: 8
  },
  {
    id: "track_history_mohenjo_daro",
    category: "history_geopolitics",
    title: "Mohenjo-Daro: The Bronze Age Urban Utopia",
    subtitle: "4K Archaeological Reconstruction of 2500 BCE Indus Valley",
    character: "Priya Sharma (Archaeological Historian)",
    prompt: "Cinematic 4K archaeological historical reconstruction of ancient Mohenjo-Daro brick city streets, the Great Bath, and merchants in 2500 BCE Indus Valley under warm golden sunlight",
    fileName: "veo_history_mohenjodaro_master.mp4",
    duration: 8
  },
  {
    id: "track_finance_sovereign_liquidity",
    category: "finance_wealth",
    title: "Central Bank Sovereign Liquidity & Gold Reserves",
    subtitle: "Institutional Macro Breakdown of Cross-Border Settlement",
    character: "Marcus Vance (Macro Strategist)",
    prompt: "Cinematic 4K high-end financial boardroom overlooking Manhattan skyline with holographic golden yield curves and global trade flows displaying on transparent glass screens",
    fileName: "veo_finance_macro_master.mp4",
    duration: 8
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderCategory(item) {
  console.log(`\n🎬 [${item.category.toUpperCase()}] Starting Generation: "${item.title}"`);
  console.log(`   Prompt: "${item.prompt}"`);

  const models = ["veo-3.1-fast-generate-preview", "veo-3.1-generate-preview"];

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`   Attempt ${attempt} with model: ${modelName}...`);
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
          console.warn(`   ⚠️ Dispatch Warning (${modelName}):`, dispatchData.error.message || dispatchData.error);
          await sleep(5000);
          continue;
        }

        const operationName = dispatchData.name;
        console.log(`   ⏳ Dispatched: ${operationName}. Polling for completion...`);

        for (let poll = 1; poll <= 30; poll++) {
          await sleep(6000);
          const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
          const pollData = await pollRes.json();

          if (pollData.done) {
            if (pollData.error) {
              console.warn(`   ⚠️ Veo GPU Cluster returned error:`, pollData.error.message || pollData.error);
              break; // Try next model or attempt
            }

            const samples = pollData.response?.generateVideoResponse?.generatedSamples;
            const videoUri = samples?.[0]?.video?.uri;
            if (videoUri) {
              console.log(`   🎉 Video Rendered! Downloading stream...`);
              const vidRes = await fetch(`${videoUri}&key=${apiKey}`);
              const ab = await vidRes.arrayBuffer();
              const buf = Buffer.from(ab);

              if (buf.length > 50000) {
                const outPath = path.resolve(process.cwd(), "public/assets/video", item.fileName);
                fs.writeFileSync(outPath, buf);
                console.log(`   ✅ Saved Genuine Veo 3.1 Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
                return true;
              }
            }
          }
        }
      } catch (err) {
        console.warn(`   ⚠️ Error during attempt ${attempt}:`, err.message);
        await sleep(5000);
      }
    }
  }
  return false;
}

async function runBatch() {
  console.log("================================================================================");
  console.log("🚀 STARTING AUTOMATED VEO 3.1 BACKGROUND MULTI-CATEGORY GENERATOR");
  console.log(`   Queue Size: ${CATEGORY_PROMPTS.length} Distinct Visual Categories`);
  console.log("================================================================================\n");

  for (const item of CATEGORY_PROMPTS) {
    const success = await renderCategory(item);
    if (success) {
      console.log(`✨ Successfully generated and verified ${item.title}`);
    } else {
      console.log(`⏩ Skipping ${item.title} for now; will retry in subsequent pass.`);
    }
    await sleep(4000); // polite pause between jobs
  }

  console.log("\n🏁 Batch Generation Run Complete!");
}

runBatch().catch(console.error);
