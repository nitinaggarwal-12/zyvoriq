import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found!");
  process.exit(1);
}

const BASE_DIR = "scratch/malibu_baywatch_5m";
const VIDEO_PATH = path.join(BASE_DIR, "malibu_baywatch_15s_pilot.mp4");
const AUDIT_DIR = path.join(BASE_DIR, "audit");
fs.mkdirSync(AUDIT_DIR, { recursive: true });

console.log("========================================================================");
console.log("🔍 ZYVORIQ FORENSIC MULTIMODAL AUDIT: 'MALIBU RED' 15s PILOT");
console.log("========================================================================");

if (!fs.existsSync(VIDEO_PATH)) {
  console.error(`❌ Video not found at ${VIDEO_PATH}`);
  process.exit(1);
}

// 1. Check Silence Detection
console.log("\n[1/4] Running Deep Silence Detection (-40dB, 0.3s)...");
const silenceDetect = execSync(`ffmpeg -i "${VIDEO_PATH}" -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const silenceMatches = silenceDetect.match(/silence_start/g) || [];
console.log(`   Silence intervals detected: ${silenceMatches.length}`);

// 2. Extract Audio into high-fidelity uncompressed WAV
console.log("\n[2/4] Extracting High-Fidelity Audio Track for Multimodal Listening...");
const audioPath = path.join(AUDIT_DIR, "pilot_audio.wav");
execSync(`ffmpeg -y -i "${VIDEO_PATH}" -vn -ar 48000 -ac 2 -c:a pcm_s16le "${audioPath}"`);
const audioBase64 = fs.readFileSync(audioPath).toString("base64");
console.log(`✅ Audio extracted: ${audioPath} (${Math.round(fs.statSync(audioPath).size / 1024)} KB)`);

// 3. Extract Keyframes across all 3 shots
console.log("\n[3/4] Extracting Keyframes across 8-Bar Timeline...");
const timestamps = [1.5, 4.5, 7.5, 10.5, 13.5];
const frameDescriptions = [
  "Shot 1 (t=1.5s): Establishing Drone over Malibu Beach & Lifeguard Tower 14",
  "Shot 2 (t=4.5s): Chloe Vocal Attack Onset ('Eyes on the horizon...')",
  "Shot 2 (t=7.5s): Chloe Singing & Dancing ('...sun burning gold!')",
  "Shot 2 (t=10.5s): Chloe Climax Chorus ('Watching every wave...')",
  "Shot 3 (t=13.5s): High-Octane Jet Ski Rescue Surf Launch Splash"
];

const frameParts = [];
for (let i = 0; i < timestamps.length; i++) {
  const t = timestamps[i];
  const framePath = path.join(AUDIT_DIR, `frame_${t.toFixed(1)}s.jpg`);
  execSync(`ffmpeg -y -ss ${t} -i "${VIDEO_PATH}" -vframes 1 -q:v 2 "${framePath}"`);
  const fData = fs.readFileSync(framePath).toString("base64");
  frameParts.push({ inlineData: { mimeType: "image/jpeg", data: fData } });
  frameParts.push({ text: `[Keyframe ${i + 1}/5]: ${frameDescriptions[i]}` });
}
console.log(`✅ Extracted ${timestamps.length} keyframes into ${AUDIT_DIR}/`);

// 4. Send to Gemini 2.5 Pro Multimodal
console.log("\n[4/4] Sending Multimodal Audio + Frames to gemini-2.5-pro for Rigorous Inspection...");
const auditPrompt = `You are Google Omni Director and Chief QA Forensic Auditor. You are performing an unsparing multimodal audit of this 15.24s pilot music video ("Malibu Red: Guardians of the Surf").

Listen carefully to the embedded 48kHz audio track from start to finish, and examine the 5 sequential keyframes:

1. [AUDIO CONTINUITY & ZERO-SILENCE AUDIT]:
   - Does the music play continuously from 0:00.000 across all 3 scenes?
   - Is there ANY dead silence or dropouts within the video?
   - Does the audio resolve with a smooth musical release and fadeout at the end?

2. [SINGING VOCAL AUDIBILITY & LIP-SYNC AUDIT]:
   - In Shot 2 (t=3.810s - 11.428s, see frames at 4.5s, 7.5s, 10.5s), does Chloe's lead female singing vocal enter audibly and prominently above the music bed?
   - Transcribe verbatim the lyrics sung by the female vocalist during Shot 2. Do they correspond to "Eyes on the horizon... sun burning gold... watching every wave..."?
   - Does her facial expression, mouth articulation, and energetic dancing in Shot 2 match the rhythm and singing vocals?

3. [BIOMETRIC & VISUAL CONTINUITY AUDIT]:
   - Does Chloe maintain character identity (athletic blonde lifeguard in scarlet red one-piece swimsuit)?
   - Is the Malibu golden hour beach aesthetic preserved across the drone establishing shot, the tower close-up, and the jet ski rescue?

4. [FINAL COMPREHENSIVE VERDICT]:
   - State strictly: PASS or FAIL.
   - List explicit forensic evidence supporting your verdict.`;

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{
      role: "user",
      parts: [
        { inlineData: { mimeType: "audio/wav", data: audioBase64 } },
        ...frameParts,
        { text: auditPrompt }
      ]
    }]
  })
});

if (!res.ok) {
  const err = await res.text();
  throw new Error(`Gemini 2.5 Pro Audit failed (${res.status}): ${err}`);
}

const data = await res.json();
const auditText = data.candidates?.[0]?.content?.parts?.[0]?.text;

console.log("\n========================================================================");
console.log("📋 GEMINI 2.5 PRO FORENSIC AUDIT VERDICT");
console.log("========================================================================");
console.log(auditText);

const reportMd = `# FORENSIC MULTIMODAL AUDIT: "MALIBU RED" 15s PILOT
- **Date**: ${new Date().toISOString()}
- **Duration**: 15.239s (8 bars @ 126.0 BPM)
- **Silence Detection (-40dB, 0.3s)**: ${silenceMatches.length} intervals detected
- **Master Audio Source**: \`scratch/malibu_baywatch_5m/master_soundtrack_5min.mp3\`

## Director's Verdict & Forensic Inspection
${auditText}
`;

fs.writeFileSync(path.join(AUDIT_DIR, "forensic_audit_report.md"), reportMd);
console.log(`\n✅ Audit report saved: ${path.join(AUDIT_DIR, "forensic_audit_report.md")}`);
