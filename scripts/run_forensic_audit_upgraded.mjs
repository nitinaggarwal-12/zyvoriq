import fs from 'fs';
import path from 'path';

try {
  process.loadEnvFile('.env.local');
} catch {}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const API_BASE = "https://generativelanguage.googleapis.com";

async function analyzeAudioWithGemini(audioPath) {
  console.log(`[audit] Analyzing audio with Gemini 2.5 Flash: ${audioPath}...`);
  const audioBytes = fs.readFileSync(audioPath);
  const base64Audio = audioBytes.toString("base64");

  const prompt = `You are a professional music producer, sound engineer, and forensic audiovisual auditor.
Perform a strict, rigorous forensic audit of this audio file from an UPGRADED 38-second Indian Pop Music Video featuring Punjabi college performers.

Analyze and report in detail:
1. VOCALS & SINGING:
   - What vocal tone, register, and gender are heard? Is there a bright feminine pop-star melody?
   - What language/dialect is heard (Punjabi, Hindi, English/Hinglish)?
   - Transcribe all lyrics or vocal phrases heard, with timestamps if possible.
   - How is the vocal expression (vibrato, energy, pitch accuracy, autotuned sheen)?
2. MUSIC & INSTRUMENTATION:
   - Identify specific traditional and modern instruments heard (Punjabi Dhol drums with dagga bass and tilli snap, high-pitched Punjabi Tumbi hook/riffs, 808 club sub-bass, electronic percussion).
   - How does the beat progression, tempo (approx 128 BPM), and rhythm syncopation feel?
   - Is there a drop, breakdown, or rhythm switch?
3. BENCHMARK COMPARISON & UPGRADE VERIFICATION:
   - Compared to the previous baseline (which had lower-register spoken vocals and lacked live Tumbi/Dhol riffs), did this audio succeed in incorporating authentic Punjabi pop instrumentation and female vocal energy?
4. AUDIO DEFECTS & ARTIFACTS:
   - Any silence gaps, transition pops/clicks between shot boundaries?
   - Any digital clipping, distortion, or garble?
5. QUALITY SCORE:
   - Vocals Score: 1-10
   - Music & Instrumentation Score: 1-10
   - Mix & Mastering Score: 1-10
   - Overall Audio Verdict: (EXCELLENT / GOOD / ACCEPTABLE / DEFECTIVE)
`;

  const url = `${API_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "audio/mp3",
                data: base64Audio
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

async function analyzeFramesWithGemini(framePaths) {
  console.log(`[audit] Analyzing 5 video frames with Gemini 2.5 Flash Vision...`);
  const parts = [
    {
      text: `You are a Hollywood visual effects supervisor, commercial music video director, and forensic quality auditor.
Perform a rigorous forensic quality audit on these 5 sequential video frames extracted from an UPGRADED 38-second Punjabi Pop Music Video (Shot 1 at 4s, Shot 2 at 12s, Shot 3 at 20s, Shot 4 at 28s, Shot 5 at 35s).

Evaluate with high scrutiny:
1. STAGED LIVE DHOL DRUMMERS & BACKGROUND MUSICIANS:
   - Are live Punjabi Dhol drummers visible on stage/runway? Describe their attire (turbans/pagri, waistcoats), positions, and instruments.
   - Did this successfully solve the "ghost musicians" blindspot from previous iterations?
2. MULTI-PERFORMER DANCE & CHOREOGRAPHY COHESION:
   - Inspect Shot 2 (12s), Shot 4 (28s), and Shot 5 (35s): Are both female performers (Simran in magenta lehenga / metallic blue jacket, Harleen in cyan/turquoise salwar / backup dancers) performing together?
   - How is the body language, choreography poses, and interaction?
3. ARTICULATION & LIP SYNC:
   - Are the singers' mouths, lips, and facial expressions visibly articulating lyrics with teeth and mouth cavity visible?
   - Any digital artifacts, mouth melting, or distortion?
4. PRODUCTION DESIGN & STAGE COHERENCE:
   - Concert lighting: Cold-spark pyrotechnics, stage trusses, magenta/cyan volumetric rim lights, moving head spotlights, festival crowd with glowsticks.
   - Stage architecture continuity across shots (runway, concert stage, LED wall).
5. ARTIFACTS / ANOMALIES:
   - Any hallucinated text, floating geometry, or anatomical flaws?
6. QUALITY SCORE:
   - Character Continuity: 1-10
   - Live Musician & Staging Score: 1-10
   - Choreography & Dance Score: 1-10
   - Production Design & Lighting Score: 1-10
   - Overall Visual Verdict: (EXCELLENT / GOOD / ACCEPTABLE / DEFECTIVE)
`
    }
  ];

  for (let i = 0; i < framePaths.length; i++) {
    const p = framePaths[i];
    const b64 = fs.readFileSync(p).toString("base64");
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: b64
      }
    });
  }

  const url = `${API_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.2 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

async function main() {
  const baseDir = path.resolve("scratch/eval_punjabi_girls_upgraded");
  const audioMp3 = path.join(baseDir, "punjabi_pop_upgraded_audio.mp3");

  const frames = [
    path.join(baseDir, "frame_01_shot1_4s.jpg"),
    path.join(baseDir, "frame_02_shot2_12s.jpg"),
    path.join(baseDir, "frame_03_shot3_20s.jpg"),
    path.join(baseDir, "frame_04_shot4_28s.jpg"),
    path.join(baseDir, "frame_05_shot5_35s.jpg")
  ];

  const audioAudit = await analyzeAudioWithGemini(audioMp3);
  console.log("\n================ UPGRADED AUDIO FORENSIC AUDIT ================\n");
  console.log(audioAudit);

  const visualAudit = await analyzeFramesWithGemini(frames);
  console.log("\n================ UPGRADED VISUAL FORENSIC AUDIT ================\n");
  console.log(visualAudit);

  fs.writeFileSync(
    path.join(baseDir, "forensic_audit_results.json"),
    JSON.stringify({ audioAudit, visualAudit, auditedAt: new Date().toISOString() }, null, 2)
  );

  const mdReport = `# 🔬 Forensic Multimodal Audit: Upgraded Punjabi Pop Music Video (38s)

**Production ID**: \`studio1_89a4f017-93c2-49a0-8d9d-0a42f352faa6\`
**Date**: ${new Date().toISOString()}
**Model**: Google Veo 3.1 + Gemini 2.5 Flash Multimodal Audio & Vision Auditor
**Timing Contract**: \`native-shot-audio-master\` (128 BPM Quantized)

---

## 🎧 Audio Forensic Audit (Gemini 2.5 Flash Audio)

${audioAudit}

---

## 👁️ Visual & Choreography Forensic Audit (Gemini 2.5 Flash Vision)

${visualAudit}

---
`;

  fs.writeFileSync(path.join(baseDir, "forensic_visual_audit_upgraded.md"), mdReport);
  console.log(`[audit] Forensic audit complete. Saved to ${path.join(baseDir, "forensic_visual_audit_upgraded.md")}`);
}

main().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
