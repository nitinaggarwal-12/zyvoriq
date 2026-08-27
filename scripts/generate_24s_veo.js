const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function launchAndPollShot(prompt, shotName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 [${shotName}] Launching Veo 3.1 (Attempt ${attempt}/${maxRetries})...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { aspectRatio: '16:9', durationSeconds: 8 }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      const opName = data.name;
      console.log(`  📋 [${shotName}] Operation Created: ${opName}`);

      // Poll
      for (let i = 0; i < 60; i++) {
        await sleep(6000);
        const opRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
        const op = await opRes.json();
        if (op.error) throw new Error(JSON.stringify(op.error));
        if (op.done) {
          const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
          const vidRes = await fetch(`${uri}&key=${key}`);
          const vidBuf = Buffer.from(await vidRes.arrayBuffer());
          const outPath = `scratch/${shotName}.mp4`;
          fs.mkdirSync('scratch', { recursive: true });
          fs.writeFileSync(outPath, vidBuf);
          console.log(`  💾 Downloaded ${shotName} (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
          return outPath;
        } else {
          process.stdout.write('.');
        }
      }
      throw new Error(`Polling timed out for ${shotName}`);
    } catch (err) {
      console.warn(`⚠️ [${shotName}] Attempt ${attempt} failed: ${err.message}. Retrying in 4s...`);
      await sleep(4000);
    }
  }
  throw new Error(`Failed ${shotName} after ${maxRetries} attempts`);
}

async function main() {
  console.log("=========================================================================");
  console.log("🎬 CREATING 24-SECOND 3-ACT KEYNOTE BROADCAST (SHOT 1 + SHOT 2 + SHOT 3)");
  console.log("=========================================================================");

  // Shot 1: Wide Keynote Opening (0-8s)
  const prompt1 = "Cinematic 4K broadcast video of a professional female executive keynote speaker in a sharp navy blazer standing at center stage delivering the opening part of her keynote presentation, welcoming the audience with natural arm gestures, high-tech conference stage with blue lighting";
  
  // Shot 2: Dynamic Medium Shot (8-16s)
  const prompt2 = "Cinematic 4K broadcast medium shot of the same female executive in a navy blazer on stage, passionately presenting key insights with precise hand articulation, dynamic keynote arena background";

  // Shot 3: Close-Up Executive Conclusion (16-24s)
  const prompt3 = "Cinematic 4K broadcast close-up of the same female executive speaking with high conviction directly into camera, smiling warmly and delivering a confident concluding statement with hands clasped, soft stage bokeh";

  const downloadedFiles = await Promise.all([
    launchAndPollShot(prompt1, "shot_1_opening"),
    launchAndPollShot(prompt2, "shot_2_presentation"),
    launchAndPollShot(prompt3, "shot_3_conclusion")
  ]);

  console.log("\n🎬 Concat all 3 native Veo shots into master 24.0s broadcast video...");
  execSync(`scp ${downloadedFiles.join(' ')} nitinagga.c.googlers.com:~/zyvoriq/scratch/`);
  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    ffmpeg -y -i scratch/shot_1_opening.mp4 -i scratch/shot_2_presentation.mp4 -i scratch/shot_3_conclusion.mp4 \\
      -filter_complex '[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]' \\
      -map '[v]' -map '[a]' \\
      -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \\
      -c:a aac -b:a 320k -ar 48000 \\
      -movflags +faststart \\
      public/assets/video/veo_priya_24s_master.mp4
  "`);

  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/veo_priya_24s_master.mp4 public/assets/video/`);
  console.log("🎉 24-SECOND MASTER VEO BROADCAST READY: public/assets/video/veo_priya_24s_master.mp4");
}

main().catch(console.error);
