import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error('❌ No GEMINI_API_KEY found');
  process.exit(1);
}
const apiKey = match[1].trim();

const VEO_SCENES = [
  {
    act: 1,
    fileName: 'veo_hindi_comedy_act1.mp4',
    imageFile: 'public/assets/images/hindi_comedy/scene_1_husband_sofa.jpg',
    durationSeconds: 6,
    prompt: 'Cinematic 9:16 vertical video of the North Indian man named Rajesh in the mustard-yellow polo shirt on the sofa speaking warmly and playfully with folded hands and expressive facial motion asking for tea, realistic human motion, 24fps motion picture'
  },
  {
    act: 2,
    fileName: 'veo_hindi_comedy_act2.mp4',
    imageFile: 'public/assets/images/hindi_comedy/scene_2_wife_sarcasm.jpg',
    durationSeconds: 6,
    prompt: 'Cinematic 9:16 vertical video of the North Indian woman named Simran in the emerald-green kurti standing at the doorway talking with deadpan witty sarcasm, raising eyebrow and crossing arms with subtle head tilt, realistic human motion, 24fps motion picture'
  },
  {
    act: 3,
    fileName: 'veo_hindi_comedy_act3.mp4',
    imageFile: 'public/assets/images/hindi_comedy/scene_3_couple_reaction.jpg',
    durationSeconds: 6,
    prompt: 'Cinematic 9:16 vertical video of the husband Rajesh in yellow polo and wife Simran in green kurti interacting in the living room, husband looking caught with sheepish smile while wife laughs and points playfully, realistic couple motion, 24fps motion picture'
  },
  {
    act: 4,
    fileName: 'veo_hindi_comedy_act4.mp4',
    imageFile: 'public/assets/images/hindi_comedy/scene_4_husband_making_chai.jpg',
    durationSeconds: 6,
    prompt: 'Cinematic 9:16 vertical video of the husband wearing the chai master apron stirring hot steaming tea on the stove and turning to smile proudly at his wife who gives a thumbs up, bubbling tea, realistic kitchen motion, 24fps motion picture'
  }
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function renderVeoAct(item) {
  const outPath = path.resolve(process.cwd(), 'public/assets/video', item.fileName);
  console.log(`\n================================================================`);
  console.log(`🎬 [Veo 3.1 Act ${item.act}] Dispatching Image-to-Video generation...`);
  console.log(`   Source Image: ${item.imageFile}`);
  console.log(`   Target File:  ${item.fileName} (${item.durationSeconds}s @ 9:16)`);
  console.log(`   Prompt:       "${item.prompt}"`);

  const imgB64 = fs.readFileSync(path.resolve(process.cwd(), item.imageFile)).toString('base64');
  const modelName = 'veo-3.1-fast-generate-preview';

  try {
    const dispatchRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: item.prompt,
            image: {
              bytesBase64Encoded: imgB64,
              mimeType: 'image/jpeg'
            }
          }],
          parameters: {
            aspectRatio: '9:16',
            durationSeconds: item.durationSeconds
          }
        })
      }
    );

    const dispatchData = await dispatchRes.json();
    if (dispatchData.error) {
      console.warn(`   ❌ Dispatch Error:`, dispatchData.error.message || dispatchData.error);
      return false;
    }

    const operationName = dispatchData.name;
    console.log(`   ⏳ Operation Created: ${operationName}`);
    console.log(`   🔄 Polling Google Veo 3.1 diffusion cluster...`);

    for (let poll = 1; poll <= 40; poll++) {
      await sleep(6000);
      const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollRes.json();

      if (poll % 3 === 0 || pollData.done) {
        console.log(`   [Poll ${poll}/40] elapsed: ${poll * 6}s, done: ${!!pollData.done}`);
      }

      if (pollData.done) {
        if (pollData.error) {
          console.warn(`   ❌ Veo Render Error:`, pollData.error.message || pollData.error);
          return false;
        }

        const samples = pollData.response?.generateVideoResponse?.generatedSamples;
        const videoUri = samples?.[0]?.video?.uri;
        if (videoUri) {
          console.log(`   🎉 Veo Render Succeeded! Downloading genuine motion picture MP4 stream...`);
          const dlRes = await fetch(`${videoUri}&key=${apiKey}`);
          const ab = await dlRes.arrayBuffer();
          const buf = Buffer.from(ab);

          if (buf.length > 50000) {
            fs.writeFileSync(outPath, buf);
            console.log(`   ✅ Saved Genuine Veo 3.1 Act Video: ${item.fileName} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
            return true;
          }
        }
      }
    }
  } catch (err) {
    console.error(`   ❌ Exception during Veo generation:`, err.message);
  }
  return false;
}

async function main() {
  console.log('================================================================');
  console.log('🚀 GOOGLE VEO 3.1 CONTINUOUS HINDI COMEDY REEL GENERATION PIPELINE');
  console.log('================================================================\n');

  for (const item of VEO_SCENES) {
    const success = await renderVeoAct(item);
    if (!success) {
      console.warn(`⚠️ Act ${item.act} encountered an issue. Continuing to next act...`);
    }
    await sleep(2000);
  }

  console.log('\n🏁 All 4 Veo 3.1 Act Videos Processed!');
}

main().catch(console.error);
