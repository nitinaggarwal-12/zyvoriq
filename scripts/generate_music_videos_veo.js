const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found");
  process.exit(1);
}
const apiKey = match[1].trim();

const MUSIC_VIDEOS = [
  {
    id: "track_music_human_live_30s",
    title: "Neon Horizons: Shibuya Rooftop Live Performance",
    fileName: "veo_music_human_live_master.mp4",
    prompt: "Cinematic 4K live concert music video of a charismatic human female singer with a vintage microphone and live band performing on a rain-slicked Tokyo skyscraper rooftop stage at night, neon lights, purple lens flares, 24fps motion"
  },
  {
    id: "track_music_anime_idol_30s",
    title: "Starlight Symphony: Cosmic Anime Idol Concert",
    fileName: "veo_music_anime_idol_master.mp4",
    prompt: "Vibrant 4K cinematic Japanese anime music video of a glowing holographic anime pop idol singing with dual glowing energy microphones on a floating cosmic crystal stage, Studio Trigger style, dynamic anime speed lines, particle effects, 24fps motion"
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderMusicVideo(item) {
  const filePath = path.resolve(process.cwd(), "public/assets/video", item.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
    console.log(`⏩ [${item.title}] Already exists (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB): ${item.fileName}`);
    return true;
  }

  console.log(`\n🎵 Dispatching [${item.title}] to Google Veo 3.1...`);
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
          console.log(`   🎉 Render Complete! Downloading MP4 stream...`);
          const dlRes = await fetch(`${videoUri}&key=${apiKey}`);
          const ab = await dlRes.arrayBuffer();
          const buf = Buffer.from(ab);

          if (buf.length > 50000) {
            fs.writeFileSync(filePath, buf);
            console.log(`   ✅ Successfully Saved Music Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
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
  console.log("🎸 SYNTHESIZING 30s HUMAN & ANIMATION MUSIC VIDEOS VIA VEO 3.1");
  console.log("================================================================================\n");

  for (const item of MUSIC_VIDEOS) {
    await renderMusicVideo(item);
    await sleep(3000);
  }

  console.log("\n🏁 Music Video Generation Complete!");
}

main().catch(console.error);
