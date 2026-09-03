import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error('❌ No GEMINI_API_KEY or GOOGLE_API_KEY found in .env.local');
  process.exit(1);
}
const apiKey = match[1].trim();

const PERSONA_VEO_SPECS = [
  {
    id: 1,
    name: "Persona 1: Kids & Family 3D Animation",
    fileName: "persona1_pixar_kids_reel.mp4",
    aspectRatio: "16:9",
    durationSeconds: 6,
    prompt: "High quality Pixar 3D animated CGI scene of a charming little robot with glowing blue eyes exploring a mystical garden on the moon with a friendly baby dragon puppy, soft subsurface scattering, warm cinematic lighting, 24fps Pixar animation"
  },
  {
    id: 2,
    name: "Persona 2: Shonen Anime & Manga",
    fileName: "persona2_anime_shonen_reel.mp4",
    aspectRatio: "16:9",
    durationSeconds: 6,
    prompt: "Cinematic Ufotable Shonen anime combat scene of a dynamic anime sword master with electric blue aura striking with a glowing katana on a rainy temple roof at night, dynamic lightning sparks, cell-shaded Japanese anime aesthetic, 24fps fluid motion"
  },
  {
    id: 3,
    name: "Persona 3: Viral Influencer",
    fileName: "persona3_viral_influencer_reel.mp4",
    aspectRatio: "9:16",
    durationSeconds: 6,
    prompt: "High energy 9:16 vertical TikTok reel video of an expressive young tech creator talking enthusiastically to camera in a modern RGB-lit studio, holding a sleek glowing gadget, cinematic depth of field, authentic video, 24fps"
  },
  {
    id: 4,
    name: "Persona 4: E-Commerce UGC Ads",
    fileName: "persona4_ugc_ecommerce_reel.mp4",
    aspectRatio: "9:16",
    durationSeconds: 6,
    prompt: "Authentic 9:16 vertical smartphone POV video of a young woman in a bright sunlit bathroom unboxing a luxury frosted glass cosmetic serum bottle and applying a glowing dropper drop to her cheek with a happy smile, genuine UGC ad aesthetic, 24fps"
  },
  {
    id: 5,
    name: "Persona 5: Mature Cinema & Noir",
    fileName: "persona5_arthouse_cinema_reel.mp4",
    aspectRatio: "16:9",
    durationSeconds: 6,
    prompt: "Arthouse cinema noir 35mm film scene of a weary detective in a wool trenchcoat standing under a buzzing neon sign in the heavy rain at midnight, cigarette smoke swirling in streetlamp light, anamorphic lens flare, Kodak 35mm film grain, A24 aesthetic"
  },
  {
    id: 6,
    name: "Persona 6: Heritage & Mythology",
    fileName: "persona6_heritage_mythology_reel.mp4",
    aspectRatio: "16:9",
    durationSeconds: 6,
    prompt: "Majestic cinematic epic mythology scene of Prince Arjuna and Lord Krishna on an ornate golden war chariot at dawn, celestial divine golden aura, floating embers, epic ancient lore atmosphere, historical cinema masterpiece, 24fps"
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderVeoPersona(spec) {
  const outPath = path.resolve(process.cwd(), 'public/assets/video', spec.fileName);
  console.log(`\n================================================================`);
  console.log(`🎬 [Google Veo 3.1 | ${spec.name}]`);
  console.log(`   Output: ${spec.fileName} (${spec.aspectRatio})`);
  console.log(`   Prompt: "${spec.prompt}"`);

  const modelName = 'veo-3.1-fast-generate-preview';
  const bodyPayload = {
    instances: [{ prompt: spec.prompt }],
    parameters: {
      aspectRatio: spec.aspectRatio,
      durationSeconds: spec.durationSeconds
    }
  };

  try {
    const dispatchRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      }
    );

    const dispatchData = await dispatchRes.json();
    if (dispatchData.error) {
      console.warn(`   ❌ Dispatch Error:`, dispatchData.error.message || dispatchData.error);
      return false;
    }

    const operationName = dispatchData.name;
    console.log(`   ⏳ Veo Long-Running Operation: ${operationName}`);

    // Poll until complete (up to 40 polls * 5s = 200s)
    for (let poll = 1; poll <= 40; poll++) {
      await sleep(5000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (poll % 2 === 0 || pollData.done) {
        console.log(`   [Poll ${poll}/40] Elapsed: ${poll * 5}s, Done: ${!!pollData.done}`);
      }

      if (pollData.done) {
        if (pollData.error) {
          console.warn(`   ❌ Render Error:`, pollData.error.message || pollData.error);
          return false;
        }

        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        const videoUri = samples?.[0]?.video?.uri;
        if (videoUri) {
          console.log(`   🎉 Render Succeeded! Downloading genuine Veo 3.1 MP4 video stream...`);
          const dlRes = await fetch(`${videoUri}&key=${apiKey}`);
          const ab = await dlRes.arrayBuffer();
          const buf = Buffer.from(ab);

          if (buf.length > 50000) {
            fs.writeFileSync(outPath, buf);
            console.log(`   ✅ SAVED REAL VEO VIDEO: ${spec.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
            return true;
          }
        } else {
          console.warn(`   ⚠️ No sample URI in response:`, JSON.stringify(pollData.response));
          return false;
        }
      }
    }
  } catch (err) {
    console.error(`   ❌ Exception:`, err.message);
  }
  return false;
}

async function main() {
  console.log('================================================================');
  console.log('🚀 GENERATING GENUINE GOOGLE VEO 3.1 AI VIDEO REELS FOR ALL PERSONAS');
  console.log('================================================================');

  const results = [];
  for (const spec of PERSONA_VEO_SPECS) {
    const ok = await renderVeoPersona(spec);
    results.push({ id: spec.id, name: spec.name, file: spec.fileName, ok });
    await sleep(2000);
  }

  console.log('\n================================================================');
  console.log('📊 REAL VEO 3.1 GENERATION SUMMARY:');
  results.forEach(r => console.log(`   ${r.name} -> ${r.file}: ${r.ok ? '✅ SUCCEEDED' : '❌ FAILED'}`));
  console.log('================================================================');
}

main().catch(console.error);
