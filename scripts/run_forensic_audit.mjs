import fs from 'fs';
import path from 'path';

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
Perform a strict, rigorous forensic audit of this audio file from a generated 40-second Indian Pop Music Video featuring Punjabi college performers.

Analyze and report in detail:
1. VOCALS & SINGING:
   - Are there singing vocals, spoken dialogue, chants, or background shouts?
   - What language/dialect is heard (Punjabi, Hindi, English/Hinglish, or vocalise)?
   - Transcribe all lyrics or vocal phrases heard, with timestamps if possible.
   - Are the vocals melodic, pitch-accurate, autotuned, or muffled?
2. MUSIC & PRODUCTION:
   - Describe the instrumentation and genre (Dhol, EDM synth, 808 bass, club beats, electronic percussion).
   - How is the beat progression, energy curve, and tempo?
   - Is there a drop or rhythm switch?
3. AUDIO DEFECTS & ARTIFACTS:
   - Are there any volume dips, silence gaps, clicks/pops at scene transitions (~8s, ~16s, ~24s, ~32s)?
   - Any digital clipping, harsh distortion, phase cancellation, or AI acoustic garble?
4. QUALITY SCORE:
   - Vocals Score: 1-10
   - Music Score: 1-10
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
      text: `You are a Hollywood visual effects supervisor and film director.
Perform a forensic quality audit on these 5 sequential video frames extracted from a 40-second Punjabi Pop Music Video (Shot 1 at 4s, Shot 2 at 12s, Shot 3 at 20s, Shot 4 at 28s, Shot 5 at 36s).

Characters:
- Character 1 ("Simran"): South Asian female, ponytail hair, metallic top, pink cropped jacket, white cargo pants.
- Character 2 ("Harleen"): South Asian female, wavy hair with braids, turquoise/gold varsity jacket, pleated skirt.

Evaluate with high scrutiny:
1. CHARACTER IDENTITY & BIOMETRIC CONTINUITY:
   - Does Simran maintain consistent facial features, skin tone, hair, and wardrobe between Shot 1, Shot 3, and Shot 5?
   - Does Harleen maintain consistent features and wardrobe between Shot 2 and Shot 4?
2. ARTICULATION & LIP SYNC READINESS:
   - Are the performers' mouths, teeth, and lips clearly visible and positioned as if actively vocalizing/singing?
   - Any distortion around mouth, teeth melting, or jaw drift?
3. CHOREOGRAPHY & BODY KINETICS:
   - How are the dance poses, gestures (microphone holding, Bhangra claps, hand poses)?
   - Any anatomical anomalies (extra fingers, rubber limbs, unnatural hand geometry)?
4. CINEMATOGRAPHY & LIGHTING:
   - Lighting coherence (cold-spark pyrotechnics, stage trusses, magenta/cyan spotlights, LED backdrop screens).
   - Set coherence across shots (open-air festival stage, runway, crowd cheering with glowsticks).
5. VERDICT:
   - Strengths
   - Subtle Defects / Observations
   - Visual Quality Score (1-10)
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
  const baseDir = path.resolve("scratch/eval_punjabi_girls");
  const audioMp3 = path.join(baseDir, "punjabi_pop_audio.mp3");

  const frames = [
    path.join(baseDir, "frame_01_shot1_4s.jpg"),
    path.join(baseDir, "frame_02_shot2_12s.jpg"),
    path.join(baseDir, "frame_03_shot3_20s.jpg"),
    path.join(baseDir, "frame_04_shot4_28s.jpg"),
    path.join(baseDir, "frame_05_shot5_36s.jpg")
  ];

  const audioAudit = await analyzeAudioWithGemini(audioMp3);
  console.log("\n================ AUDIO FORENSIC AUDIT ================\n");
  console.log(audioAudit);

  const visualAudit = await analyzeFramesWithGemini(frames);
  console.log("\n================ VISUAL FORENSIC AUDIT ================\n");
  console.log(visualAudit);

  // Write full audit result to a JSON file
  fs.writeFileSync(
    path.join(baseDir, "forensic_audit_results.json"),
    JSON.stringify({ audioAudit, visualAudit, auditedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`[audit] Forensic audit complete. Saved to ${path.join(baseDir, "forensic_audit_results.json")}`);
}

main().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
