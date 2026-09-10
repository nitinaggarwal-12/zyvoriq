import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("No API key found");
  process.exit(1);
}

const dir = "scratch/chandigarh_denmark_production/lip_sync_audit";
const timestamps = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

async function main() {
  console.log("🔍 Loading 10 extracted face frames for Gemini 2.5 Pro multimodal inspection...");
  const parts = [];

  const prompt = `# Google Omni Directorial Protocol: Audio-Visual Sync & Lip Articulation Forensic Audit

You are Google Omni's Chief Audio-Visual Synchronization and Forensic Multimodal Auditor.
Your task is to conduct a forensic frame-by-frame inspection of the lead performer's mouth, lips, jaw, and oral articulation across 10 sequential face close-ups extracted from Shot 1 (Timecode 0.0s to 5.625s) of the "Chandigarh to Copenhagen" Punjabi dance video reel.

## Audio Soundtrack Context
The audio soundtrack playing during Shot 1 contains the following master lyrics from Google DeepMind Lyria:
- [0.0s - 3.8s]: "Chandigarh di kudi, vibes check kar lai!"
- [3.8s - 5.625s]: "Copenhagen vich party, set kar lai!"

Tempo: 128.0 BPM (1 bar = 1.875s). Lead vocalist style: High-energy rhythmic Punjabi pop singing.

## Instructions
Examine the 10 sequential face crops attached below (Frame 1 at t=0.5s through Frame 10 at t=5.0s).

For EACH frame:
1. State the exact timecode and corresponding lyric syllable playing at that instant.
2. Characterize the physical visual state of the mouth (e.g. lips sealed/closed, parted with upper teeth visible, wide vowel opening, closed smile, puckered/rounded).
3. Determine whether the visual mouth state corresponds physiologically to the expected phonetic viseme:
   - "Chan-di-garh" (Open vowel /a/, alveolar /d/)
   - "di ku-di" (Rounded vowel /u/, dental /d/)
   - "vibes" (Labiodental /v/ or bilabial /b/, diphthong /ai/)
   - "check" (Affricate /tʃ/, front vowel /e/)
   - "kar lai" (Open vowel /a/, diphthong /ai/)
   - "Co-pen-ha-gen" (Rounded /o/, bilabial closure /p/, open /a/)
   - "vich par-ty" (Labiodental /v/, bilabial /p/)
   - "set kar lai" (Sibilant /s/, open vowel /a/)
4. Classify each frame into one of four Sync Tiers:
   - **TIER 1 (Literal Micro-Phonetic Lip Sync)**: Visemes exhibit active, direct phoneme tracking (teeth visible on sibilants, mouth rounding on 'o'/'u', open jaw on 'a').
   - **TIER 2 (Performance Cadence Sync)**: Mouth is open, active, smiling, and rhythmically articulating with natural performance energy aligned to musical phrasing, but with soft or generalized consonant closure.
   - **TIER 3 (Viseme Divergence / Desync)**: Mouth is shut tight, inert, or closed while high-volume singing vocals are projecting.
   - **TIER 4 (Contradictory Articulation)**: Mouth is clearly articulating completely different words or erratic AI warping.

Provide:
1. Comprehensive Timestamp Breakdown Table (Frames 1-10).
2. Forensic Viseme Continuity Analysis across the 5.625s window.
3. Audio-Visual Alignment Assessment (Does the cadence of her performance match the 128 BPM tempo?).
4. Final Quality Gate Score (0-100%) and Production Recommendation.`;

  parts.push({ text: prompt });

  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i];
    const frameFile = path.join(dir, `face_${(i + 1).toString().padStart(2, "0")}_t${t.toFixed(1)}s.jpg`);
    if (!fs.existsSync(frameFile)) {
      console.error(`Missing frame file: ${frameFile}`);
      continue;
    }
    const buf = fs.readFileSync(frameFile);
    parts.push({ text: `\n### Frame ${i + 1} (Timecode: t = ${t.toFixed(1)}s)` });
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: buf.toString("base64")
      }
    });
  }

  console.log("📡 Transmitting frames to Google Gemini 2.5 Pro multimodal auditor...");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Gemini API Error: ${res.status}: ${err}`);
    process.exit(1);
  }

  const data = await res.json();
  const reportText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reportText) {
    console.error("No report text received:", data);
    process.exit(1);
  }

  const reportPath = "scratch/chandigarh_denmark_production/lip_sync_forensic_report.md";
  fs.writeFileSync(reportPath, reportText);
  console.log(`✅ Forensic lip-sync report saved to ${reportPath}`);
}

main().catch(console.error);
