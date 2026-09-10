import fs from "node:fs";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Extract 5 frames per second for first 3 seconds of shot_2_raw.mp4
const outDir = "scratch/spain_college_swim_5m/maya_lip_frames";
fs.mkdirSync(outDir, { recursive: true });
execSync(`ffmpeg -y -ss 0 -t 3 -i scratch/spain_college_swim_5m/clips/shot_2_raw.mp4 -vf "fps=5" ${outDir}/frame_%03d.jpg`);

const frameFiles = fs.readdirSync(outDir).filter(f => f.endsWith(".jpg")).sort();
console.log(`Extracted ${frameFiles.length} frames.`);

// Convert frames to base64 parts
const parts = [];
for (let i = 0; i < frameFiles.length; i++) {
  const f = frameFiles[i];
  const sec = (i * 0.2).toFixed(2);
  const data = fs.readFileSync(`${outDir}/${f}`).toString("base64");
  parts.push({
    inlineData: { mimeType: "image/jpeg", data }
  });
  parts.push({
    text: `Frame ${i + 1} at timestamp ${sec}s`
  });
}

parts.push({
  text: "Look at Maya's mouth/lips across these frames (0.0s to 3.0s). At what exact frame and timestamp does her mouth open to begin singing the first word 'Sunrise'?"
});

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts }]
  })
});

const data = await res.json();
console.log("Maya Lip Timing Audit:\n", data.candidates?.[0]?.content?.parts?.[0]?.text);
