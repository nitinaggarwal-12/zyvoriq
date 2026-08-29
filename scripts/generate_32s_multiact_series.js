const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found in .env.local");
  process.exit(1);
}
const apiKey = match[1].trim();

const MULTI_ACT_32S_TRACKS = [
  {
    seriesId: "track_fantasy_starlight_wyrm_32s",
    title: "Citadel of the Starlight Wyrm (32s 4-Act Master)",
    subtitle: "4-Act 32s Cinematic High Fantasy Epic · Arcane Spires to Celestial Wyrm Climax",
    category: "fantasy_scifi",
    character: "🏰 Elena Rostova (Arcane Chronicler)",
    acts: [
      {
        actNumber: 1,
        actName: "Act 1: Awakening of the Floating Runes",
        prompt: "Cinematic 4K wide aerial shot of ancient floating gothic castle spires with glowing blue runes carving into stone at sunset, volumetric golden mist, 24fps motion",
        fileName: "veo_fantasy_32s_act1.mp4",
        startTime: 0,
        endTime: 8
      },
      {
        actNumber: 2,
        actName: "Act 2: Flight of the Crystalline Dragon",
        prompt: "Cinematic 4K dynamic tracking shot of a magnificent crystalline dragon flying through floating castle towers, flapping prismatic wings, photorealistic lighting, 24fps motion",
        fileName: "veo_fantasy_32s_act2.mp4",
        startTime: 8,
        endTime: 16
      },
      {
        actNumber: 3,
        actName: "Act 3: Lightning Storm on Celestial Peaks",
        prompt: "Cinematic 4K thunderstorm over floating mountain peaks with purple arcane lightning striking floating obsidian monoliths, dramatic clouds, 24fps motion",
        fileName: "veo_fantasy_32s_act3.mp4",
        startTime: 16,
        endTime: 24
      },
      {
        actNumber: 4,
        actName: "Act 4: Oath of the Starlight Wardens",
        prompt: "Cinematic 4K wide camera pullback from golden cathedral balcony overlooking endless celestial galaxy sky with starlight auroras, epic cinematic lighting, 24fps motion",
        fileName: "veo_fantasy_32s_act4.mp4",
        startTime: 24,
        endTime: 32
      }
    ]
  },
  {
    seriesId: "track_gaming_nexus_32s",
    title: "Grand Finals: Nexus Arena Championship (32s 4-Act Master)",
    subtitle: "4-Act 32s Tactical Esports Arena Championship · Stadium Walkout to Victory Confetti",
    category: "gaming",
    character: "🎮 Aoi Takahashi (Esports Caster)",
    acts: [
      {
        actNumber: 1,
        actName: "Act 1: Stadium Walkout & Crowd Roar",
        prompt: "Cinematic 4K wide stadium camera sweeping over a futuristic esports arena filled with 50000 cheering fans holding cyan lightsticks, laser light show, 24fps motion",
        fileName: "veo_gaming_32s_act1.mp4",
        startTime: 0,
        endTime: 8
      },
      {
        actNumber: 2,
        actName: "Act 2: Holographic Draft & Battle Stage",
        prompt: "Cinematic 4K shot of two esports teams on glass stage pods with giant 3D holographic dragon avatar floating above the arena floor, intense neon arena lighting",
        fileName: "veo_gaming_32s_act2.mp4",
        startTime: 8,
        endTime: 16
      },
      {
        actNumber: 3,
        actName: "Act 3: The 5v5 Team Fight Climax",
        prompt: "Cinematic 4K fast dynamic camera tracking through a futuristic battle arena with explosive energy spells and lasers colliding, high adrenaline motion blur, 24fps",
        fileName: "veo_gaming_32s_act3.mp4",
        startTime: 16,
        endTime: 24
      },
      {
        actNumber: 4,
        actName: "Act 4: Trophy Ceremony & Confetti Shower",
        prompt: "Cinematic 4K shot of winning esports champions lifting glowing gold trophy on podium with golden confetti rain and pyrotechnics exploding in stadium, 24fps motion",
        fileName: "veo_gaming_32s_act4.mp4",
        startTime: 24,
        endTime: 32
      }
    ]
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderAct(act) {
  const filePath = path.resolve(process.cwd(), "public/assets/video", act.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
    console.log(`⏩ [${act.actName}] Already exists (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB): ${act.fileName}`);
    return true;
  }

  console.log(`\n🎬 Dispathing [${act.actName}] to Google Veo 3.1...`);
  console.log(`   Prompt: "${act.prompt}"`);

  const modelName = "veo-3.1-fast-generate-preview";

  try {
    const dispatchRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: act.prompt }],
          parameters: { aspectRatio: "16:9", durationSeconds: 8 }
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
          console.log(`   🎉 Render Complete! Downloading Act MP4...`);
          const dlRes = await fetch(`${videoUri}&key=${apiKey}`);
          const ab = await dlRes.arrayBuffer();
          const buf = Buffer.from(ab);

          if (buf.length > 50000) {
            fs.writeFileSync(filePath, buf);
            console.log(`   ✅ Saved Act MP4: ${act.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
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

async function runMultiAct() {
  console.log("================================================================================");
  console.log("🚀 STARTING 32-SECOND MULTI-ACT VEO 3.1 CINEMATIC COMPOSITION ENGINE");
  console.log("================================================================================\n");

  for (const track of MULTI_ACT_32S_TRACKS) {
    console.log(`\n==============================================================================`);
    console.log(`🌟 PRODUCING 32s SERIES: "${track.title}" (4 Acts)`);
    console.log(`==============================================================================`);

    for (const act of track.acts) {
      await renderAct(act);
      await sleep(3000);
    }
  }

  console.log("\n🏁 32-Second Multi-Act Generation Run Complete!");
}

runMultiAct().catch(console.error);
