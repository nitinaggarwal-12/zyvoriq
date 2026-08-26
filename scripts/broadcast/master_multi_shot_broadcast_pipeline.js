const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const imgB64 = fs.readFileSync('public/assets/avatars/priya.jpg').toString('base64');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ACT_PROMPTS = [
  {
    act: 1,
    id: "veo_act1",
    prompt: "Cinematic 4K keynote video of executive Priya Sharma standing on stage in dark navy blazer, smiling warmly and confidently, gesturing expansively with both hands toward the tech audience, dynamic keynote stage lighting and arena background",
    durationSec: 6
  },
  {
    act: 2,
    id: "veo_act2",
    prompt: "Cinematic 4K medium close-up video of Priya Sharma on the keynote stage, gesturing assertively with her right hand to emphasize security architecture, looking directly into the camera with confident executive presence, keynote LED screen behind her",
    durationSec: 6
  },
  {
    act: 3,
    id: "veo_act3",
    prompt: "Cinematic 4K video of Priya Sharma pacing smoothly across the keynote stage, smiling enthusiastically, pointing toward the holographic architecture display with expressive hand gestures, arena spotlights illuminating the stage",
    durationSec: 6
  },
  {
    act: 4,
    id: "veo_act4",
    prompt: "Cinematic 4K close-up of Priya Sharma speaking with high conviction and precision, subtle hand gestures underscoring cryptographic integrity, clear stage lighting and deep blue background",
    durationSec: 6
  },
  {
    act: 5,
    id: "veo_act5",
    prompt: "Cinematic 4K wide shot of Priya Sharma standing tall at center stage, opening her hands to the full audience in closing keynote posture, vibrant auditorium lighting and enthusiastic keynote atmosphere",
    durationSec: 6
  }
];

async function startVeoGeneration(actConfig) {
  console.log(`🚀 [Act ${actConfig.act}] Initiating Veo 3.1 Diffusion Generation for: ${actConfig.id}...`);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{
        prompt: actConfig.prompt,
        image: {
          bytesBase64Encoded: imgB64,
          mimeType: "image/jpeg"
        }
      }],
      parameters: {
        aspectRatio: "16:9",
        durationSeconds: actConfig.durationSec,
        personGeneration: "ALLOW_ADULT"
      }
    })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Veo API Error for ${actConfig.id}: ${JSON.stringify(data.error)}`);
  }
  console.log(`  📋 Operation Created: ${data.name}`);
  return { id: actConfig.id, act: actConfig.act, opName: data.name };
}

async function pollOperation(opInfo) {
  console.log(`⏳ Polling ${opInfo.id} (${opInfo.opName})...`);
  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(6000);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opInfo.opName}?key=${key}`);
      const op = await res.json();

      if (op.error) throw new Error(`Veo Error on ${opInfo.id}: ${JSON.stringify(op.error)}`);
      if (op.done) {
        console.log(`🎉 [Act ${opInfo.act}] Veo 3.1 Diffusion COMPLETE for ${opInfo.id}!`);
        const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          const vidRes = await fetch(`${videoUri}&key=${key}`);
          const vidBuf = Buffer.from(await vidRes.arrayBuffer());
          const outPath = `scratch/keynote_10min/${opInfo.id}.mp4`;
          fs.writeFileSync(outPath, vidBuf);
          console.log(`  💾 Saved raw MP4 to ${outPath} (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
          return outPath;
        }
      } else {
        process.stdout.write(`.`);
      }
    } catch (e) {
      console.warn(`\n⚠️ Poll warning on ${opInfo.id}:`, e.message);
    }
  }
  throw new Error(`Timeout polling ${opInfo.id}`);
}

async function main() {
  console.log('🎬 Starting Multi-Shot Master Keynote Video Generation with Veo 3.1 & Cross-Dissolves...');
  fs.mkdirSync('scratch/keynote_10min', { recursive: true });

  // 1. Trigger all 5 Veo operations in parallel
  const activeOps = [];
  for (const act of ACT_PROMPTS) {
    const op = await startVeoGeneration(act);
    activeOps.push(op);
    await sleep(1000);
  }

  // 2. Poll all operations concurrently
  console.log('\n⏳ Waiting for all 5 unique Veo 3.1 shots to complete...');
  const results = await Promise.all(activeOps.map(op => pollOperation(op)));
  console.log('\n🎉 ALL 5 UNIQUE VEO 3.1 KEYNOTE SHOTS GENERATED SUCCESSFULLY!');
  fs.writeFileSync('scratch/keynote_10min/veo_shots_manifest.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
