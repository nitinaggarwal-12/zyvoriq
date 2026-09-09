import fs from 'fs';
import path from 'path';

try {
  process.loadEnvFile('.env.local');
} catch {}

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const API_BASE = "https://generativelanguage.googleapis.com";
const MODEL = "gemini-2.5-pro"; // Strict Google Omni Directorial model

async function runOmniMultimodalForensicAudit(options) {
  const { framesDir, audioPath, productionId } = options;
  console.log(`[omni-audit] Starting Multimodal Forensic Audit with ${MODEL}...`);
  console.log(`[omni-audit] Production ID: ${productionId}`);
  console.log(`[omni-audit] Reading audio: ${audioPath}`);

  const audioBytes = fs.readFileSync(audioPath);
  const base64Audio = audioBytes.toString("base64");

  const frameFiles = [
    { name: "Shot 1 (4s - Intro / Runway)", file: "shot1_4s.jpg" },
    { name: "Shot 2 (12s - Singing Hook / Verse)", file: "shot2_12s.jpg" },
    { name: "Shot 3 (20s - Two-Shot Hip Shimmy)", file: "shot3_20s.jpg" },
    { name: "Shot 4 (28s - Floor Isolation / Dhol)", file: "shot4_28s.jpg" },
    { name: "Shot 5 (36s - Climax Pirouette / Pyro)", file: "shot5_36s.jpg" },
  ];

  const parts = [];

  // Directive for Omni
  parts.push({
    text: `You are Google Omni, the sole executive director, master choreographer, sound engineer, and forensic quality auditor for Zyvoriq Studios.

You are conducting a strict, uncompromising MULTIMODAL FORENSIC AUDIT of a brand-new 40-second Latin-Indian Pop Fusion commercial music video reel (Production ID: ${productionId}).
Attached are:
1. The 40-second master audio track (audio/mp3).
2. Five sequential high-resolution 1080x1920 video frames captured at 4s, 12s, 20s, 28s, and 36s.

Perform a rigorous, forensic audit across all 6 directorial dimensions. Cross-reference what you HEAR in the audio with what you SEE in the frames:

### 1. VISEME & SINGING LIP-SYNC ARTICULATION:
- Listen to the audio: At what timestamps is feminine pop singing active? What lyrics/phonemes are articulated?
- Inspect Shot 2 (12s) and Shot 3 (20s): Are the performers' mouths actively articulating open vowels (-aa, -ee, -oo)? Are teeth and oral cavity visibly articulated, or is there mouth melting / static closed lips?
- Cross-modal check: Does the physical mouth shape in the frames match the singing heard in the audio stem?

### 2. CHARACTER BIOMETRICS & CONTINUITY:
- Character casting: Priya (lead vocalist/dancer) and Riya (co-performer).
- Inspect Shot 1 through Shot 5: Are their facial features, skin tone, hair styling, and turquoise sequin stage outfits consistent across scene cuts?
- Did any character drift into a completely different person or morph unrecognizably?

### 3. KINETIC ANATOMY & DANCE PHYSICS:
- Inspect dance movements: Hip isolations, bellydance shimmies, barefoot floor work on the wet stage, and 360-degree pirouette spins.
- Inspect hands, fingers, legs, and feet: Are there any liquid limb tears, extra fingers, or rubber distortions?

### 4. STAGED LIVE INSTRUMENTATION:
- In the audio: Listen for the 128 BPM Punjabi Dhol drums (dagga bass and tilli snap) and high-pitched Tumbi hook.
- In the visual frames: Are live Punjabi Dhol drummers physically present on stage behind or alongside the performers? Describe their attire (turbans, vests), drums, and stage positioning.
- Did this successfully eliminate the "ghost musicians" flaw?

### 5. AUDIO PRODUCTION, MIX & LOUDNESS:
- Listen to the balance between the feminine vocal melody and the 128 BPM Dhol & Tumbi rhythm.
- Are there any silence gaps, clicks/pops at shot boundaries (every 8 seconds: 8s, 16s, 24s, 32s)?
- EBU R128 Loudness compliance: Does the mix feel balanced at -24 LUFS without harsh distortion?

### 6. SCORING & FORENSIC VERDICT:
Provide rigorous scores from 0 to 100 for each:
- Viseme & Lip-Sync Score: [0-100]
- Biometric Continuity Score: [0-100]
- Kinetic Anatomy & Dance Score: [0-100]
- Live Musician Staging Score: [0-100]
- Audio Mix & Mastering Score: [0-100]
- Overall Production Score: [0-100]

Overall Forensic Verdict: (EXCELLENT / APPROVED / NEEDS_REPAIR / REJECTED)

If any score is below 85, specify the exact shot and root defect, and provide the exact repair prompt for that shot.`
  });

  // Attach master audio
  parts.push({
    inlineData: {
      mimeType: "audio/mp3",
      data: base64Audio
    }
  });

  // Attach sequential video frames
  for (const f of frameFiles) {
    const framePath = path.join(framesDir, f.file);
    if (!fs.existsSync(framePath)) {
      console.warn(`[omni-audit] Warning: Frame file not found: ${framePath}`);
      continue;
    }
    const frameBytes = fs.readFileSync(framePath);
    console.log(`[omni-audit] Attaching ${f.name} (${f.file}, ${frameBytes.length} bytes)...`);
    parts.push({
      text: `--- FRAME: ${f.name} (File: ${f.file}) ---`
    });
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: frameBytes.toString("base64")
      }
    });
  }

  console.log(`[omni-audit] Sending multimodal payload to ${MODEL}...`);
  const url = `${API_BASE}/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  
  const startTime = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  const durationMs = Date.now() - startTime;
  console.log(`[omni-audit] API responded in ${(durationMs / 1000).toFixed(2)}s. Status: ${res.status}`);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const auditReport = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!auditReport) {
    throw new Error("No response text from Omni multimodal audit");
  }

  return {
    model: MODEL,
    productionId,
    durationMs,
    auditReport,
    timestamp: new Date().toISOString()
  };
}

async function main() {
  const framesDir = path.resolve("scratch/shakira_production");
  const audioPath = path.join(framesDir, "master_audio.mp3");
  const productionId = "studio1_c16b9f4c-c6ad-455d-bb36-e34ce9b7885d";

  const result = await runOmniMultimodalForensicAudit({
    framesDir,
    audioPath,
    productionId
  });

  console.log("\n================================================================================");
  console.log("            GOOGLE OMNI (gemini-2.5-pro) MULTIMODAL FORENSIC AUDIT             ");
  console.log("================================================================================\n");
  console.log(result.auditReport);
  console.log("\n================================================================================\n");

  const outPath = path.join(framesDir, "omni_multimodal_forensic_report.md");
  fs.writeFileSync(outPath, `# 🎬 Google Omni Multimodal Forensic Audit

**Production ID**: \`${productionId}\`
**Directorial Model**: \`${result.model}\`
**Audit Timestamp**: \`${result.timestamp}\`
**Response Time**: \`${(result.durationMs / 1000).toFixed(2)}s\`

---

${result.auditReport}
`);

  console.log(`[omni-audit] Report saved to ${outPath}`);
}

main().catch(err => {
  console.error("Omni audit error:", err);
  process.exit(1);
});
