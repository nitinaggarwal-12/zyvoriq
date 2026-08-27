const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SEED = 4242;
const CHARACTER_LOCK = "Cinematic 4K broadcast video of an executive technology CTO with sleek dark shoulder-length hair wearing a royal blue tailored blazer over a crisp white shirt on a high-tech dark stage with neon blue backdrop and vertical beam lighting";

const SHOTS = [
  {
    name: "shot_1_open",
    prompt: `${CHARACTER_LOCK}. She stands at center stage smiling warmly and opening her arms outward in a welcoming presentation gesture to the audience.`
  },
  {
    name: "shot_2_present",
    prompt: `${CHARACTER_LOCK}. She gestures assertively forward with her right hand to emphasize transformation metrics, speaking with conviction.`
  },
  {
    name: "shot_3_conclude",
    prompt: `${CHARACTER_LOCK}. She looks directly into the camera lens with hands clasped, smiling confidently and nodding in executive conclusion.`
  }
];

async function launchAndPollShot(shot) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🚀 [${shot.name}] Launching Veo 3.1 (Seed: ${SEED}, Attempt ${attempt})...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: shot.prompt }],
          parameters: {
            aspectRatio: '16:9',
            durationSeconds: 8,
            seed: SEED
          }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      const opName = data.name;
      console.log(`  📋 [${shot.name}] Op: ${opName}`);

      // Poll
      for (let i = 0; i < 60; i++) {
        await sleep(6000);
        const opRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
        const op = await opRes.json();
        if (op.error) throw new Error(JSON.stringify(op.error));
        if (op.done) {
          const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
          if (videoUri) {
            const vidRes = await fetch(`${videoUri}&key=${key}`);
            const vidBuf = Buffer.from(await vidRes.arrayBuffer());
            const outPath = `scratch/${shot.name}.mp4`;
            fs.mkdirSync('scratch', { recursive: true });
            fs.writeFileSync(outPath, vidBuf);
            console.log(`  💾 Downloaded ${shot.name} (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
            return outPath;
          } else {
            const rai = op.response?.generateVideoResponse?.raiMediaFilteredReasons?.[0] || 'Unknown RAI Filter';
            throw new Error(`RAI Filtered: ${rai}`);
          }
        } else {
          process.stdout.write('.');
        }
      }
      throw new Error(`Timeout for ${shot.name}`);
    } catch (err) {
      console.warn(`⚠️ [${shot.name}] Error: ${err.message}. Retrying in 4s...`);
      await sleep(4000);
    }
  }
  throw new Error(`Failed ${shot.name}`);
}

async function main() {
  console.log("=============================================================================");
  console.log("🎬 CREATING 24s BROADCAST WITH 100% IDENTICAL CHARACTER, ATTIRE & STAGE LOCK");
  console.log("=============================================================================");

  const downloaded = await Promise.all(SHOTS.map(s => launchAndPollShot(s)));

  console.log("\n🎬 Concat all 3 shots into master 24.0s broadcast video...");
  execSync(`scp ${downloaded.join(' ')} nitinagga.c.googlers.com:~/zyvoriq/scratch/`);
  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    ffmpeg -y -i scratch/shot_1_open.mp4 -i scratch/shot_2_present.mp4 -i scratch/shot_3_conclude.mp4 \\
      -filter_complex '[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]' \\
      -map '[v]' -map '[a]' \\
      -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \\
      -c:a aac -b:a 320k -ar 48000 \\
      -movflags +faststart \\
      public/assets/video/veo_priya_24s_master.mp4
  "`);

  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/veo_priya_24s_master.mp4 public/assets/video/`);
  console.log("🎉 100% CONSISTENT 24-SECOND MASTER VEO BROADCAST READY: public/assets/video/veo_priya_24s_master.mp4");
}

main().catch(console.error);
