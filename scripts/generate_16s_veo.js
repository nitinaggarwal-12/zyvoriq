const fs = require('fs');
const { execSync } = require('child_process');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function launchShot(prompt, shotName) {
  console.log(`🚀 Launching Veo 3.1 for ${shotName}...`);
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
  console.log(`  📋 ${shotName} Operation: ${data.name}`);
  return data.name;
}

async function poll(opName, shotName) {
  console.log(`⏳ Polling ${shotName} (${opName})...`);
  for (let i = 0; i < 60; i++) {
    await sleep(6000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
    const op = await res.json();
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
  throw new Error(`${shotName} timed out`);
}

async function main() {
  console.log("=================================================================");
  console.log("🎬 CREATING 16-SECOND MULTI-SHOT VEO 3.1 BROADCAST (SHOT 1 + SHOT 2)");
  console.log("=================================================================");

  // Shot 1: Wide Keynote Opening (0-8s)
  const prompt1 = "Cinematic 4K broadcast video of a professional female executive keynote speaker in a sharp navy blazer on a high-tech stage delivering the opening part of her keynote presentation, speaking clearly and directly to the audience with natural facial expressions and synchronized speech audio";
  
  // Shot 2: Medium Close-Up Concluding Gesture (8-16s)
  const prompt2 = "Cinematic 4K broadcast medium close-up of the same professional female executive keynote speaker in a navy blazer on stage, continuing her presentation with assertive hand gestures, smiling confidently and concluding with a warm professional nod";

  const op1 = await launchShot(prompt1, "shot_1_wide");
  const op2 = await launchShot(prompt2, "shot_2_closeup");

  const [vid1, vid2] = await Promise.all([
    poll(op1, "shot_1_wide"),
    poll(op2, "shot_2_closeup")
  ]);

  console.log("\n🎬 Concat both 8s native Veo shots into master 16.0s broadcast video...");
  // Use Cloudtop ffmpeg for high-quality broadcast concat
  execSync(`scp ${vid1} ${vid2} nitinagga.c.googlers.com:~/zyvoriq/scratch/`);
  execSync(`ssh nitinagga.c.googlers.com "
    cd ~/zyvoriq
    ffmpeg -y -i scratch/shot_1_wide.mp4 -i scratch/shot_2_closeup.mp4 \\
      -filter_complex '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]' \\
      -map '[v]' -map '[a]' \\
      -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \\
      -c:a aac -b:a 320k -ar 48000 \\
      -movflags +faststart \\
      public/assets/video/veo_priya_16s_master.mp4
  "`);

  execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/veo_priya_16s_master.mp4 public/assets/video/`);
  console.log("🎉 16-SECOND MASTER VEO BROADCAST READY: public/assets/video/veo_priya_16s_master.mp4");
}

main().catch(console.error);
