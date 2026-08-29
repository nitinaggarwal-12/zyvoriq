const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found");
  process.exit(1);
}
const apiKey = match[1].trim();

const ACT_VIDEOS_TO_RENDER = [
  // Hindi Sufi Romantic
  {
    fileName: "veo_hindi_sufi_act2.mp4",
    prompt: "Cinematic 4K Bollywood human music video of showers of orange and yellow marigold flower petals raining down in slow motion in a Mughal marble palace courtyard, woman in swirling saffron silk lehenga dancing, 24fps motion"
  },
  {
    fileName: "veo_hindi_sufi_act3.mp4",
    prompt: "Cinematic 4K shot of an Indian classical musical duo playing acoustic sitar and tabla in a candlelit Mughal haveli courtyard at dusk, passionate expressions, warm golden candle flame lighting, 24fps motion"
  },
  {
    fileName: "veo_hindi_sufi_act4.mp4",
    prompt: "Cinematic 4K romantic pullback shot of an Indian couple standing by glowing antique brass lanterns in a royal palace balcony looking at the evening twilight sky, 24fps motion"
  },

  // Hindi Desi Hip-Hop
  {
    fileName: "veo_hindi_hiphop_act2.mp4",
    prompt: "Cinematic 4K urban music video shot of vintage yellow Mumbai Premier Padmini taxi cabs with red and blue smoke flares erupting on a wet city street at night, neon reflections, 24fps motion"
  },
  {
    fileName: "veo_hindi_hiphop_act3.mp4",
    prompt: "Cinematic 4K dynamic action shot of Mumbai street B-boy dancers executing acrobatic breakdance headspins on rain-soaked asphalt with water splashing, intense street lighting, 24fps motion"
  },
  {
    fileName: "veo_hindi_hiphop_act4.mp4",
    prompt: "Cinematic 4K wide shot of an Indian hip hop artist dropping his microphone on Marine Drive promenade with the illuminated Bandra-Worli Sea Link bridge glowing in the foggy midnight background, 24fps motion"
  },

  // Human Live Concert
  {
    fileName: "veo_music_human_act2.mp4",
    prompt: "Cinematic 4K live concert stage shot of an electronic band keyboardist and drummer playing intensely with vibrant cyan and magenta laser beams cutting through stage haze, 24fps motion"
  },
  {
    fileName: "veo_music_human_act3.mp4",
    prompt: "Cinematic 4K close up shot of a rock lead guitarist playing an electric guitar solo in intense purple stage spotlights with sweat and passion, lens flares, 24fps motion"
  },
  {
    fileName: "veo_music_human_act4.mp4",
    prompt: "Cinematic 4K wide camera pullback from a rooftop stage over Tokyo skyline at dawn, singer waving both arms to the cheering crowd as golden morning sunlight breaks through the clouds, 24fps motion"
  },

  // Anime Cyber Idol
  {
    fileName: "veo_music_anime_act2.mp4",
    prompt: "Vibrant 4K anime music video shot of a colorful anime pop idol with twin pigtails jumping across floating geometric crystal platforms in deep space, glowing neon particle trails, 24fps motion"
  },
  {
    fileName: "veo_music_anime_act3.mp4",
    prompt: "Dynamic 4K anime explosion shot of brilliant supernova rainbow light and sparkling gold stars bursting behind an anime cyber idol on stage, Studio Trigger sakuga style, 24fps motion"
  },
  {
    fileName: "veo_music_anime_act4.mp4",
    prompt: "Cinematic 4K anime outro shot of a cute anime idol making a double heart hand gesture and winking into camera with glittering starlight auroras and cosmic nebulae in background, 24fps motion"
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderAct(item) {
  const filePath = path.resolve(process.cwd(), "public/assets/video", item.fileName);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
    console.log(`⏩ [${item.fileName}] Already exists (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  }

  console.log(`\n🎬 Dispatching [${item.fileName}] to Google Veo 3.1...`);
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
            console.log(`   ✅ Saved Act Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
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
  console.log("🚀 STARTING DEDICATED CONTINUOUS ACT VIDEO RENDERING (HINDI & MUSIC VIDEOS)");
  console.log("================================================================================\n");

  for (const item of ACT_VIDEOS_TO_RENDER) {
    await renderAct(item);
    await sleep(2000);
  }

  console.log("\n🏁 All Continuous Act Videos Finished!");
}

main().catch(console.error);
