import fs from "node:fs";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const videoPath = "scratch/spain_college_swim_5m/spain_college_swim_15s_pilot.mp4";
const auditDir = "scratch/spain_college_swim_5m/audit_final";
fs.mkdirSync(auditDir, { recursive: true });

// 1. Extract audio and check silence with ffmpeg silencedetect
const silenceDetect = execSync(`ffmpeg -i ${videoPath} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const silenceMatches = silenceDetect.match(/silence_start/g) || [];

// 2. Extract audio into mp3
const audioPath = `${auditDir}/audio.mp3`;
execSync(`ffmpeg -y -i ${videoPath} -vn -c:a libmp3lame -b:a 192k ${audioPath}`);
const audioBase64 = fs.readFileSync(audioPath).toString("base64");

// 3. Extract keyframes
const timestamps = [1.0, 4.5, 8.0, 11.0, 13.5];
const frameParts = [];
for (let i = 0; i < timestamps.length; i++) {
  const t = timestamps[i];
  const framePath = `${auditDir}/frame_${t.toFixed(1)}.jpg`;
  execSync(`ffmpeg -y -ss ${t} -i ${videoPath} -vframes 1 -q:v 2 ${framePath}`);
  const fData = fs.readFileSync(framePath).toString("base64");
  frameParts.push({ inlineData: { mimeType: "image/jpeg", data: fData } });
  frameParts.push({ text: `Keyframe at timestamp t=${t}s` });
}

// 4. Send to Gemini 2.5 Pro for full audit
console.log("Sending multimodal video/audio audit to gemini-2.5-pro...");
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{
      role: "user",
      parts: [
        ...frameParts,
        { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
        {
          text: `You are an elite music video director and forensic QA auditor. Audit this 15.484s music video pilot ("Sol de Fuga"):
1. [AUDIO CONTINUITY]: Listen to the full audio. Does the music play continuously from 0:00 to 0:15.48? Is there ANY silence or audio cutoff after 10s?
2. [LIP SYNC AUDIT]: In Shot 2 (t=3.871s to 11.613s, see frames at 4.5s, 8.0s, 11.0s), is Maya singing the lyrics "Sunrise hits the villa walls, no turning back..."? Does the vocal timing match her visual presence?
3. [VISUAL & BIOMETRIC CONTINUITY]: Assess the visual quality of the drone shot (1.0s), Maya's close-up (4.5s-11.0s), and the pool jump splash (13.5s).
4. [FINAL VERDICT]: PASS or FAIL with explicit evidence.`
        }
      ]
    }]
  })
});

const data = await res.json();
const auditText = data.candidates?.[0]?.content?.parts?.[0]?.text;
console.log("=== GEMINI 2.5 PRO FORENSIC AUDIT ===");
console.log(auditText);

fs.writeFileSync(`${auditDir}/audit_verdict.md`, `# FORENSIC MULTIMODAL AUDIT VERDICT\n\n- Silence Detected: ${silenceMatches.length}\n\n${auditText}`);
