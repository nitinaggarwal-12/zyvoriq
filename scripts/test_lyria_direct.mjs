import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("Missing key");
  process.exit(1);
}

async function test() {
  const models = ["models/lyria-3.5", "models/lyria-3-pro-preview", "models/lyria-3-clip-preview"];
  const prompt = "Compose a high-energy 124 BPM Tropical House dance-pop song arrangement for Sol de Fuga. Key: F# minor. Instruments: Spanish acoustic guitar, deep sub-bass, marimba plucks, saxophone melody. Lyrics: Sunrise hits the villa walls, no turning back / No me llames, I won't call, we are off the track.";

  for (const m of models) {
    console.log(`\nTesting ${m}...`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      });
      console.log(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) {
        console.log(`Error:`, JSON.stringify(data.error));
      } else {
        const parts = data.candidates?.[0]?.content?.parts || [];
        console.log(`Parts count: ${parts.length}`);
        for (const p of parts) {
          if (p.text) console.log(`Text: ${p.text.slice(0, 120)}...`);
          if (p.inlineData) console.log(`Audio bytes: ${p.inlineData.mimeType} length=${p.inlineData.data?.length}`);
        }
      }
    } catch (e) {
      console.error(`Fetch exception for ${m}:`, e.message);
    }
  }
}

test();
