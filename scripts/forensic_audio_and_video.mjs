import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try { process.loadEnvFile(".env.local"); } catch {}
const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const AUDIOS = [
  { id: "mv_01", path: "scratch/productions/mv_01_fuego_y_arena/lyria_24s.mp3", video: "public/assets/video/mv_01_fuego_y_arena_master.mp4" },
  { id: "mv_02", path: "scratch/productions/mv_02_supernova_velocity/lyria_24s.mp3", video: "public/assets/video/mv_02_supernova_velocity_master.mp4" },
  { id: "mv_03", path: "scratch/productions/mv_03_lagos_midnight_sun/lyria_24s.mp3", video: "public/assets/video/mv_03_lagos_midnight_sun_master.mp4" },
  { id: "mv_04", path: "scratch/productions/mv_04_nachle_dholna/lyria_24s.mp3", video: "public/assets/video/mv_04_nachle_dholna_master.mp4" },
  { id: "mv_05", path: "scratch/productions/mv_05_lumiere_damour/master_soundtrack.mp3", video: "public/assets/video/mv_05_lumiere_damour_master.mp4" }
];

async function run() {
  for (const item of AUDIOS) {
    console.log(`\n======================================================`);
    console.log(`🔍 AUDITING AUDIO: ${item.id}`);
    console.log(`======================================================`);

    const audioBuf = fs.readFileSync(item.path);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "audio/mp3", data: audioBuf.toString("base64") } },
            { text: `Analyze this 24.0s music audio track:
1. When (start second) does human vocal singing/lyrics start? (e.g. 0.0s, 3.5s, 8.0s, never?)
2. Is the section from 0.0s to 8.0s purely instrumental or does it contain singing?
3. What words/lyrics are sung across each 8-second chunk: (0s-8s, 8s-16s, 16s-24s)?` }
          ]
        }]
      })
    });
    const d = await res.json();
    console.log(d.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(d));
  }
}

run().catch(console.error);
