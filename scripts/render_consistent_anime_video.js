const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SHOTS = [
  {
    name: "act_1_dojo_doubt",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act1_aoi_ren_dojo_1787868700687.jpg",
    prompt: "Subtle cinematic anime motion: Female apprentice Aoi speaks with doubt, breathing gently, as wise master Sensei Ren nods attentively. Soft morning dust motes floating in sunlight through shoji screens."
  },
  {
    name: "act_2_oubaitori_garden",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act2_ren_garden_1787868721998.jpg",
    prompt: "Subtle cinematic anime motion: Sensei Ren gestures peacefully towards the garden as pink sakura petals flutter through the air, female apprentice Aoi listening intently beside him."
  },
  {
    name: "act_3_kaizen_focus",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act3_aoi_sword_1787868734529.jpg",
    prompt: "Subtle cinematic anime motion: Female warrior Aoi holds her wooden training blade steady with determined eyes, hair blowing gently in the breeze as glowing sakura petals drift past."
  },
  {
    name: "act_4_kintsugi_wisdom",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act4_ren_kintsugi_1787868747520.jpg",
    prompt: "Subtle cinematic anime motion: Sensei Ren holds the ceramic tea bowl as gold kintsugi cracks shimmer gently with golden light particles, Aoi leaning forward in awe."
  },
  {
    name: "act_5_gaman_strike",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act5_aoi_gaman_strike_1787868761138.jpg",
    prompt: "Cinematic anime motion: Female apprentice Aoi completes her decisive wooden sword strike, clothing fluttering in the wind, green bamboo stalks swaying gracefully behind her in the morning breeze."
  },
  {
    name: "act_6_ikigai_warmth",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act6_ren_ikigai_warmth_1787868774895.jpg",
    prompt: "Subtle cinematic anime motion: Sensei Ren speaks with a serene wise smile, glowing with warm golden morning sunlight as cherry blossom petals drift past."
  },
  {
    name: "act_7_shared_bow",
    imagePath: "/Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/act7_ren_aoi_bow_1787868788249.jpg",
    prompt: "Cinematic anime motion: Sensei Ren and female apprentice Aoi bow deeply to each other with mutual respect in the temple courtyard as the radiant golden sun rises and cherry petals fall gently."
  }
];

async function launchShot(shot) {
  const imgBase64 = fs.readFileSync(shot.imagePath).toString('base64');
  console.log(`🚀 [${shot.name}] Launching Veo 3.1 image-to-video (8s)...`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{
        prompt: shot.prompt,
        image: {
          bytesBase64Encoded: imgBase64,
          mimeType: 'image/jpeg'
        }
      }],
      parameters: {
        aspectRatio: '16:9',
        durationSeconds: 8
      }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return { ...shot, opName: data.name };
}

async function pollShot(shot) {
  console.log(`⏳ Polling [${shot.name}] (${shot.opName})...`);
  for (let i = 0; i < 90; i++) {
    await sleep(6000);
    const opRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${shot.opName}?key=${key}`);
    const op = await opRes.json();
    if (op.error) throw new Error(`Error in ${shot.name}: ${JSON.stringify(op.error)}`);
    if (op.done) {
      const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (videoUri) {
        const vidRes = await fetch(`${videoUri}&key=${key}`);
        const vidBuf = Buffer.from(await vidRes.arrayBuffer());
        const outPath = `scratch/consistent_anime/${shot.name}.mp4`;
        fs.mkdirSync('scratch/consistent_anime', { recursive: true });
        fs.writeFileSync(outPath, vidBuf);
        console.log(`\n  ✅ [${shot.name}] Downloaded (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
        return outPath;
      } else {
        const rai = op.response?.generateVideoResponse?.raiMediaFilteredReasons?.[0] || 'Unknown filter';
        throw new Error(`[${shot.name}] Filtered: ${rai}`);
      }
    } else {
      process.stdout.write('.');
    }
  }
  throw new Error(`Timeout polling ${shot.name}`);
}

async function main() {
  console.log("=============================================================================");
  console.log("🎌 RENDERING 7 CHARACTER-LOCKED VEO 3.1 VIDEO ACTS (SENSEI REN & AOI)");
  console.log("=============================================================================");

  const launched = [];
  for (const shot of SHOTS) {
    const info = await launchShot(shot);
    launched.push(info);
    await sleep(1500); // staggering requests
  }

  console.log("\n📡 All 7 Veo 3.1 jobs submitted. Polling in parallel...");
  const results = await Promise.all(launched.map(pollShot));

  console.log("\n🎬 All 7 acts rendered! Assembling on Cloudtop...");
  execSync(`scp scratch/consistent_anime/*.mp4 nitinagga.c.googlers.com:~/zyvoriq/scratch/consistent_anime/`);

  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    mkdir -p scratch/consistent_anime

    # 1. Concat all 7 acts into 56.00s continuous visual
    ffmpeg -y \
      -i scratch/consistent_anime/act_1_dojo_doubt.mp4 \
      -i scratch/consistent_anime/act_2_oubaitori_garden.mp4 \
      -i scratch/consistent_anime/act_3_kaizen_focus.mp4 \
      -i scratch/consistent_anime/act_4_kintsugi_wisdom.mp4 \
      -i scratch/consistent_anime/act_5_gaman_strike.mp4 \
      -i scratch/consistent_anime/act_6_ikigai_warmth.mp4 \
      -i scratch/consistent_anime/act_7_shared_bow.mp4 \
      -filter_complex '[0:v][1:v][2:v][3:v][4:v][5:v][6:v]concat=n=7:v=1:a=0[v]' \
      -map '[v]' \
      -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
      scratch/consistent_anime/visual_56s_master.mp4

    # 2. Mux with Japanese Audio Track by default
    ffmpeg -y \
      -i scratch/consistent_anime/visual_56s_master.mp4 \
      -i public/assets/audio/anime_dubs/dub_ja.mp3 \
      -map 0:v:0 -map 1:a:0 \
      -c:v copy -c:a aac -b:a 320k \
      -t 56.00 -movflags +faststart \
      public/assets/video/ren_and_aoi_conversation_synced.mp4

    ls -lh public/assets/video/ren_and_aoi_conversation_synced.mp4
  "`);

  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4 public/assets/video/`);
  execSync(`cp public/assets/video/ren_and_aoi_conversation_synced.mp4 /Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/`);

  console.log("\n🎉 100% CHARACTER-CONTINUOUS ANIME MASTER COMPLETED & SYNCED!");
}

main().catch(err => {
  console.error("❌ Generation error:", err);
  process.exit(1);
});
