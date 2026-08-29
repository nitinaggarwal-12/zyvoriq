const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (!match) {
  console.error("❌ No GEMINI_API_KEY found");
  process.exit(1);
}
const apiKey = match[1].trim();

async function generateMongolVideo() {
  console.log("🚀 Dispatching 4K Mongol Steppe Cavalry Warfare to Google Veo 3.1...");
  const prompt = "Cinematic 4K wide tracking shot of thousands of Mongolian horse archers galloping across the golden steppes under dramatic storm clouds, leather armor, composite bows, horses kicking up dust, epic historical battle cinema, 24fps motion";
  const modelName = "veo-3.1-fast-generate-preview";

  const dispatchRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { aspectRatio: "16:9", durationSeconds: 8 }
      })
    }
  );

  const dispatchData = await dispatchRes.json();
  if (dispatchData.error) {
    console.error("Dispatch Error:", dispatchData.error);
    return;
  }

  const op = dispatchData.name;
  console.log(`⏳ Operation: ${op}. Polling Veo cluster...`);

  for (let poll = 1; poll <= 35; poll++) {
    await new Promise(r => setTimeout(r, 6000));
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${op}?key=${apiKey}`);
    const pollData = await pollRes.json();

    if (pollData.done) {
      if (pollData.error) {
        console.error("Render error:", pollData.error);
        return;
      }
      const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (uri) {
        console.log("🎉 Render Complete! Downloading MP4...");
        const dlRes = await fetch(uri + "&key=" + apiKey);
        const ab = await dlRes.arrayBuffer();
        const buf = Buffer.from(ab);
        const outPath = path.resolve(process.cwd(), "public/assets/video/veo_mongol_steppe_warfare_master.mp4");
        fs.writeFileSync(outPath, buf);
        console.log(`✅ Saved Veo 3.1 Master Video: ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
        break;
      }
    }
  }
}

generateMongolVideo().catch(console.error);
