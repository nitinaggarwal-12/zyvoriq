const fs = require("fs");
const path = require("path");

// Load API key from .env.local
const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/) || envContent.match(/GOOGLE_API_KEY=([^\r\n]+)/);
if (match) {
  process.env.GEMINI_API_KEY = match[1].trim();
}

async function testVeo() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🚀 Testing Google Veo 3.1 API Call...");
  console.log("   API Key Available:", !!apiKey);

  const prompt = "Cinematic 4K fantasy aerial shot of a magnificent crystalline dragon flying through floating golden arcane castle spires in a sunset sky, volumetric clouds, photorealistic lighting, 24fps smooth motion";
  const modelName = "veo-3.1-fast-generate-preview";

  console.log(`   Prompt: "${prompt}"`);
  console.log(`   Model: ${modelName}`);

  const dispatchRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { aspectRatio: "16:9", durationSeconds: 6 }
      })
    }
  );

  const dispatchData = await dispatchRes.json();
  console.log("   Dispatch Response:", JSON.stringify(dispatchData, null, 2));

  if (dispatchData.error) {
    console.error("❌ Veo Dispatch Failed:", dispatchData.error);
    return;
  }

  const operationName = dispatchData.name;
  console.log(`\n⏳ Operation Started: ${operationName}`);
  console.log("   Polling for video synthesis completion...");

  for (let poll = 1; poll <= 25; poll++) {
    await new Promise(r => setTimeout(r, 6000));
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
    const pollData = await pollRes.json();
    console.log(`   [Poll ${poll}/25] Status:`, pollData.done ? "DONE" : "IN_PROGRESS");

    if (pollData.done) {
      if (pollData.error) {
        console.error("❌ Veo Render Error:", pollData.error);
        return;
      }
      const samples = pollData.response?.generateVideoResponse?.generatedSamples;
      const videoUri = samples?.[0]?.video?.uri;
      console.log(`🎉 Veo Render Complete! Video URI: ${videoUri}`);

      if (videoUri) {
        console.log("📥 Downloading synthesized MP4...");
        const vidRes = await fetch(`${videoUri}&key=${apiKey}`);
        const ab = await vidRes.arrayBuffer();
        const buf = Buffer.from(ab);

        const outPath = path.resolve(process.cwd(), "public/assets/video/veo_fantasy_starlight_wyrm_6s.mp4");
        fs.writeFileSync(outPath, buf);
        console.log(`✅ Saved Veo 3.1 MP4 to: ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
      }
      break;
    }
  }
}

testVeo().catch(console.error);
