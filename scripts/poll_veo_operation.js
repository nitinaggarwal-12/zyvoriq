const fs = require('fs');

const key = fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
const opName = process.argv[2] || "models/veo-3.1-generate-preview/operations/cryndo12hm8i";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function poll() {
  console.log(`⏳ Polling Google Veo 3.1 Operation: ${opName}...`);
  for (let attempt = 1; attempt <= 60; attempt++) {
    await sleep(6000);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${opName}?key=${key}`);
      const op = await res.json();

      if (op.error) {
        console.error('❌ Veo Generation Error:', JSON.stringify(op.error, null, 2));
        process.exit(1);
      }

      if (op.done) {
        console.log('\n🎉 Google Veo 3.1 Generation COMPLETED!');
        const videoUri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (videoUri) {
          console.log(`📥 Downloading video stream from ${videoUri.substring(0, 60)}...`);
          const vidRes = await fetch(`${videoUri}&key=${key}`);
          const vidBuf = Buffer.from(await vidRes.arrayBuffer());
          const outPath = `public/assets/video/veo_priya_v31.mp4`;
          fs.writeFileSync(outPath, vidBuf);
          console.log(`💾 Saved brand new Veo 3.1 video to ${outPath} (${(vidBuf.length / 1024 / 1024).toFixed(2)} MB)`);
          process.exit(0);
        } else {
          console.error('No video URI in response:', JSON.stringify(op.response, null, 2));
          process.exit(1);
        }
      } else {
        process.stdout.write(`.`);
      }
    } catch (e) {
      console.warn(`\n⚠️ Poll warning:`, e.message);
    }
  }
  console.error('\n⏱️ Timeout waiting for Veo operation');
  process.exit(1);
}

poll();
