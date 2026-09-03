import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error('❌ No GEMINI_API_KEY found');
  process.exit(1);
}
const apiKey = match[1].trim();

const ACTS = [
  {
    act: 1,
    fileName: 'veo_hindi_comedy_act1.mp4',
    prompt: 'Cinematic 9:16 vertical video of an Indian husband in a yellow polo shirt sitting on a cozy living room sofa, talking warmly and expressively with hands folded pleading for morning tea, cheerful comedic expressions, photorealistic motion picture, 24fps motion',
    imageFile: 'public/assets/images/hindi_comedy/scene_1_husband_sofa.jpg'
  },
  {
    act: 2,
    fileName: 'veo_hindi_comedy_act2.mp4',
    prompt: 'Cinematic 9:16 vertical video of an Indian wife in an emerald-green embroidered kurti standing at a modern kitchen doorway, talking with sharp witty sarcasm, crossing arms and raising an eyebrow with head movement, 24fps motion picture',
    imageFile: 'public/assets/images/hindi_comedy/scene_2_wife_sarcasm.jpg'
  },
  {
    act: 3,
    fileName: 'veo_hindi_comedy_act3.mp4',
    prompt: 'Cinematic 9:16 vertical video of an Indian husband and wife in their living room having a funny lively conversation, husband sitting on sofa looking sheepish while wife leans forward smiling and gesturing playfully, 24fps motion picture',
    imageFile: 'public/assets/images/hindi_comedy/scene_3_couple_reaction.jpg'
  },
  {
    act: 4,
    fileName: 'veo_hindi_comedy_act4.mp4',
    prompt: 'Cinematic 9:16 vertical video of an Indian man in a kitchen apron boiling hot steaming chai on a gas stove with a ladle, smiling happily as his wife beside him gives a thumbs up, rising tea steam, 24fps motion picture',
    imageFile: 'public/assets/images/hindi_comedy/scene_4_husband_making_chai.jpg'
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderAct(item) {
  const outPath = path.resolve(process.cwd(), 'public/assets/video', item.fileName);
  console.log(`\n================================================================`);
  console.log(`🎬 [Google Veo 3.1 Act ${item.act}] Dispatching Video Generation...`);
  console.log(`   File:   ${item.fileName}`);
  console.log(`   Prompt: "${item.prompt}"`);

  const modelName = 'veo-3.1-fast-generate-preview';
  let bodyPayload = {
    instances: [{ prompt: item.prompt }],
    parameters: {
      aspectRatio: '9:16',
      durationSeconds: 6
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
    console.log(`   ⏳ Operation: ${operationName}`);

    for (let poll = 1; poll <= 30; poll++) {
      await sleep(5000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (poll % 2 === 0 || pollData.done) {
        console.log(`   [Poll ${poll}/30] Elapsed: ${poll * 5}s, Done: ${!!pollData.done}`);
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
            console.log(`   ✅ Saved Veo 3.1 Act ${item.act} Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
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
  console.log('🚀 GENERATING ALL 4 GENUINE GOOGLE VEO 3.1 MOTION PICTURE VIDEO ACTS');
  console.log('================================================================');

  const results = [];
  for (const item of ACTS) {
    const ok = await renderAct(item);
    results.push({ act: item.act, ok });
    await sleep(2000);
  }

  console.log('\n================================================================');
  console.log('📊 VEO 3.1 GENERATION SUMMARY:');
  results.forEach(r => console.log(`   Act ${r.act}: ${r.ok ? '✅ SUCCEEDED' : '❌ FAILED'}`));
  console.log('================================================================');
}

main().catch(console.error);
