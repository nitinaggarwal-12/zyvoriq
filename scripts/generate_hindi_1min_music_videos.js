const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found in .env.local");
  process.exit(1);
}
const apiKey = match[1].trim();

const HINDI_MUSIC_VIDEOS = [
  {
    id: "track_hindi_sufi_romantic_60s",
    title: "Kesariya Raaste: Sufi Soul in Old Delhi",
    fileName: "veo_hindi_sufi_song_master.mp4",
    prompt: "Cinematic 4K Bollywood human music video of an Indian couple singing in an ancient Mughal palace courtyard at golden sunset, marigold flowers falling in slow motion, swirling saffron silk dupattas, acoustic sitar and guitar, warm golden hour lighting, emotional expressions, 24fps motion"
  },
  {
    id: "track_hindi_desi_hiphop_60s",
    title: "Gully Raftaar: Mumbai Monsoon Beats",
    fileName: "veo_hindi_desi_hiphop_master.mp4",
    prompt: "Cinematic 4K urban human music video of a charismatic Indian street rapper with sunglasses performing with his crew on a rain-drenched Mumbai street at night, neon reflections on wet asphalt, yellow taxi cabs, colorful smoke flares, 24fps motion"
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderVideo(item) {
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
            console.log(`   ✅ Successfully Saved 1-Min Hindi Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
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
  console.log("🇮🇳 SYNTHESIZING 1-MINUTE HINDI HUMAN MUSIC VIDEOS VIA VEO 3.1");
  console.log("================================================================================\n");

  for (const item of HINDI_MUSIC_VIDEOS) {
    await renderVideo(item);
    await sleep(3000);
  }

  console.log("\n🏁 Hindi 1-Minute Music Video Generation Complete!");
}

main().catch(console.error);
