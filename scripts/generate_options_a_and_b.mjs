import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {}

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!key) {
  console.error("No API key found");
  process.exit(1);
}

const BASE_DIR = "scratch/chandigarh_denmark_production";
const JAL_IMG = path.join(BASE_DIR, "visual_previews/jasleen_wardrobe_concept_1788995993348.jpg");
const STAGE_IMG = path.join(BASE_DIR, "visual_previews/stage_band_orchestra_1788996006210.jpg");
const MASTER_AUDIO = path.join(BASE_DIR, "lyria_master_audio.mp3");

async function dispatchVeo(prompt, imagePath, durationSeconds = 6) {
  const imgBuf = fs.readFileSync(imagePath);
  const imgB64 = imgBuf.toString("base64");

  const models = ["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"];
  for (const model of models) {
    try {
      console.log(`[Veo] Dispatching on ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{
            prompt,
            image: { bytesBase64Encoded: imgB64, mimeType: "image/jpeg" }
          }],
          parameters: {
            aspectRatio: "9:16",
            durationSeconds,
            sampleCount: 1
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.name) {
        return { operationName: data.name, model };
      }
      console.warn(`[Veo] ${model} returned error:`, data.error?.message || data);
    } catch (e) {
      console.warn(`[Veo] ${model} call error:`, e.message);
    }
  }
  throw new Error("Failed to dispatch Veo operation.");
}

async function pollVeo(operationName) {
  console.log(`[Veo] Polling operation: ${operationName}`);
  for (let poll = 1; poll <= 40; poll++) {
    await new Promise(r => setTimeout(r, 6000));
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${key}`);
    const data = await res.json();
    if (data.done) {
      if (data.error) throw new Error(`Veo operation failed: ${JSON.stringify(data.error)}`);
      const uri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error("No video URI in response");
      console.log(`[Veo] Complete! URI: ${uri}`);
      return uri;
    }
    process.stdout.write(".");
  }
  throw new Error("Veo operation timed out.");
}

async function downloadVideo(uri, destPath) {
  console.log(`\n[Download] Fetching ${uri}...`);
  const res = await fetch(`${uri}&key=${key}`);
  if (!res.ok) throw new Error(`Failed to download: HTTP ${res.status}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
  console.log(`[Download] Saved to ${destPath} (${Math.round(ab.byteLength / 1024)} KB)`);
}

async function main() {
  console.log("========================================================================");
  console.log("🎬 GOOGLE OMNI: DUAL REMEDIATION PIPELINE (OPTION A & OPTION B)");
  console.log("========================================================================\n");

  const optionADir = path.join(BASE_DIR, "option_a");
  const optionBDir = path.join(BASE_DIR, "option_b");
  fs.mkdirSync(optionADir, { recursive: true });
  fs.mkdirSync(optionBDir, { recursive: true });

  // -------------------------------------------------------------------------
  // 1. EXECUTE OPTION A: Continuous Singing Enforcement
  // -------------------------------------------------------------------------
  console.log(">>> [Phase 1: Option A] Continuous Singing Re-roll <<<");
  const promptOptionA = `The young South Asian female lead performer struts forward on a glossy wet reflective black concert stage runway in a buttercup-yellow structured linen halter crop top and tailored ecru wide-leg trousers, singing continuously directly into camera with radiant charisma and energetic mouth articulation. Her mouth remains actively singing with visible teeth and fluid vowel/consonant movement throughout the entire clip, never closing or sealing her lips into a static smile; at 3.8 seconds she actively belts 'Copenhagen vich party' with wide vocal projection. Flanking her on illuminated tiered risers, Punjabi Dhol drummers in orange turbans and a live brass section play with explosive energy. Warm amber key spotlighting, piercing cyan laser cones, wet reflective floor reflections. 9:16 vertical cinema, 24fps smooth motion, zero on-screen text.`;

  const opA = await dispatchVeo(promptOptionA, JAL_IMG, 6);
  const uriA = await pollVeo(opA.operationName);
  const rawPathA = path.join(optionADir, "shot_1_opt_a_raw.mp4");
  await downloadVideo(uriA, rawPathA);

  // Trim and Mux Option A
  const trimmedVidA = path.join(optionADir, "video_5625.mp4");
  const audioA = path.join(optionADir, "audio_5625.wav");
  const finalA = path.join(BASE_DIR, "shot_1_option_a_continuous_singing.mp4");

  execSync(`ffmpeg -y -i ${rawPathA} -ss 0 -t 5.625 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an ${trimmedVidA}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${MASTER_AUDIO} -ss 0 -t 5.625 -af "afade=t=out:st=5.475:d=0.15" ${audioA}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -i ${trimmedVidA} -i ${audioA} -c:v copy -c:a aac -b:a 192k ${finalA}`, { stdio: "pipe" });
  console.log(`✅ Option A complete: ${finalA}`);

  // Extract Option A inspection frames
  const f40A = path.join(optionADir, "frame_t4.0s.jpg");
  const f45A = path.join(optionADir, "frame_t4.5s.jpg");
  execSync(`ffmpeg -y -ss 00:00:04.000 -i ${finalA} -vframes 1 -q:v 2 ${f40A}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss 00:00:04.500 -i ${finalA} -vframes 1 -q:v 2 ${f45A}`, { stdio: "pipe" });

  // -------------------------------------------------------------------------
  // 2. EXECUTE OPTION B: 3.75s Singer + 1.875s Punjabi Dhol Cutaway
  // -------------------------------------------------------------------------
  console.log("\n>>> [Phase 2: Option B] Commercial Music Video Cutaway (Beat Drop) <<<");
  // Clip 1: Flawless Singer (0.0s to 3.75s) from Shot 1 raw
  const singerPartB = path.join(optionBDir, "part1_singer_375.mp4");
  const originalRaw = path.join(BASE_DIR, "shot_1_raw.mp4");
  execSync(`ffmpeg -y -i ${originalRaw} -ss 0 -t 3.75 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an ${singerPartB}`, { stdio: "pipe" });
  console.log(`   Spliced Clip 1 (Jasleen Singer, 0.0s-3.75s)`);

  // Clip 2: Live Punjabi Dhol Drummers on Risers
  const promptDhol = `Dynamic low-angle medium shot of two charismatic Punjabi Dhol drummers in crisp white kurta shirts and vibrant bright orange turbans energetically striking their traditional wooden Dhol drums on an illuminated concert riser. Fast rhythmic hand movements with curved wooden dagga sticks and thin tilli sticks, striking the drumheads with explosive power on the 128 BPM beat drop. Cyan laser cones and warm amber spotlights slice through atmospheric concert haze, specular water droplet spray splashing off the drum surface. 9:16 vertical cinema, 24fps smooth motion, zero on-screen text.`;

  const opDhol = await dispatchVeo(promptDhol, STAGE_IMG, 4);
  const uriDhol = await pollVeo(opDhol.operationName);
  const rawDholPath = path.join(optionBDir, "dhol_raw.mp4");
  await downloadVideo(uriDhol, rawDholPath);

  // Trim Dhol to exactly 1.875s (1 musical bar @ 128 BPM)
  const dholPartB = path.join(optionBDir, "part2_dhol_1875.mp4");
  execSync(`ffmpeg -y -i ${rawDholPath} -ss 0 -t 1.875 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an ${dholPartB}`, { stdio: "pipe" });

  // Concat Clip 1 (3.75s) + Clip 2 (1.875s) = 5.625s
  const concatList = path.join(optionBDir, "concat.txt");
  fs.writeFileSync(concatList, `file '${path.resolve(singerPartB)}'\nfile '${path.resolve(dholPartB)}'\n`);

  const concatenatedVideo = path.join(optionBDir, "concatenated_5625.mp4");
  execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an ${concatenatedVideo}`, { stdio: "pipe" });

  // Mux with Lyria master audio
  const finalB = path.join(BASE_DIR, "shot_1_option_b_drummer_cutaway.mp4");
  execSync(`ffmpeg -y -i ${concatenatedVideo} -i ${audioA} -c:v copy -c:a aac -b:a 192k ${finalB}`, { stdio: "pipe" });
  console.log(`✅ Option B complete: ${finalB}`);

  // Extract Option B inspection frames
  const fSingerB = path.join(optionBDir, "frame_t3.5s_singer.jpg");
  const fDholB = path.join(optionBDir, "frame_t4.0s_dhol.jpg");
  execSync(`ffmpeg -y -ss 00:00:03.500 -i ${finalB} -vframes 1 -q:v 2 ${fSingerB}`, { stdio: "pipe" });
  execSync(`ffmpeg -y -ss 00:00:04.200 -i ${finalB} -vframes 1 -q:v 2 ${fDholB}`, { stdio: "pipe" });

  // -------------------------------------------------------------------------
  // 3. MULTIMODAL COMPARISON WITH GEMINI 2.5 PRO
  // -------------------------------------------------------------------------
  console.log("\n🔍 Running Side-by-Side Multimodal Evaluation with Gemini 2.5 Pro...");
  const f40AB64 = fs.readFileSync(f40A).toString("base64");
  const f45AB64 = fs.readFileSync(f45A).toString("base64");
  const fSingerBB64 = fs.readFileSync(fSingerB).toString("base64");
  const fDholBB64 = fs.readFileSync(fDholB).toString("base64");

  const comparisonPrompt = `You are Google Omni Chief Directorial Quality Auditor.
Evaluate and compare two candidate remediation solutions for Shot 1 of the "Chandigarh to Copenhagen" Punjabi dance video reel:

Audio Context (0.0s to 5.625s @ 128 BPM):
- 0.0s - 3.8s: "Chandigarh di kudi, vibes check kar lai!"
- 3.8s - 5.625s: "Copenhagen vich party, set kar lai!"

Option A (Continuous Singing Re-roll):
- Performer stays on camera for the full 5.625s.
- Attached Frames: Frame A1 (t=4.0s during "Copenhagen") and Frame A2 (t=4.5s during "vich party").
- Evaluate: Did her mouth stay actively open and articulating, or did it revert to smiling? What is the viseme fidelity?

Option B (The Commercial Cutaway):
- Slices performer at t=3.75s (end of first phrase) and cuts to the live Punjabi Dhol drummers on illuminated risers for the remaining 1.875s beat drop.
- Attached Frames: Frame B1 (t=3.5s Jasleen singing) and Frame B2 (t=4.2s Dhol drummers striking beat).
- Evaluate: Editorial pacing, rhythmic energy on the beat drop, and elimination of lip-sync drift.

Compare:
1. Lip-Sync & Viseme Integrity (Score A vs Score B).
2. Directorial & Cinematic Energy (Which feels more like an authentic MTV / YouTube top-charting Indian music video?).
3. Continuity & Polish.
4. Definitive Directorial Recommendation.`;

  let comparisonText = "";
  try {
    const compRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: comparisonPrompt },
            { text: "\n### Option A - Frame t=4.0s:" },
            { inlineData: { mimeType: "image/jpeg", data: f40AB64 } },
            { text: "\n### Option A - Frame t=4.5s:" },
            { inlineData: { mimeType: "image/jpeg", data: f45AB64 } },
            { text: "\n### Option B - Frame t=3.5s (Jasleen singing):" },
            { inlineData: { mimeType: "image/jpeg", data: fSingerBB64 } },
            { text: "\n### Option B - Frame t=4.2s (Live Dhol Drummers):" },
            { inlineData: { mimeType: "image/jpeg", data: fDholBB64 } }
          ]
        }]
      })
    });
    const compData = await compRes.json();
    comparisonText = compData?.candidates?.[0]?.content?.parts?.[0]?.text || "Comparison unavailable";
  } catch (e) {
    comparisonText = `Comparison error: ${e.message}`;
  }

  const report = `# 🎬 Google Omni Side-by-Side Directorial Evaluation: Option A vs. Option B

**Production ID**: \`studio1_600e0145-2c24-4637-9a55-d2e5dbca545a\`  
**Clip**: \`Shot 1 (0.0s to 5.625s @ 128.0 BPM)\`  
**Audio Track**: DeepMind Lyria 128 BPM Master  
**Timestamp**: ${new Date().toISOString()}

---

## 🎥 Candidate Video Deliverables

### Option A: Continuous Singing Re-roll (100% Performer On-Camera)
* **Description**: Lead singer Jasleen held center stage for the entire 5.625s with prompt-enforced continuous vocal articulation.
* **Deliverable Video**: [\`shot_1_option_a_continuous_singing.mp4\`](file://${path.resolve(finalA)})
* **Frame at t=4.0s**: [\`frame_t4.0s.jpg\`](file://${path.resolve(f40A)})
* **Frame at t=4.5s**: [\`frame_t4.5s.jpg\`](file://${path.resolve(f45A)})

### Option B: Commercial Music Video Cutaway (Singer + Dhol Beat Drop)
* **Description**: Slices Jasleen's flawless vocal delivery at t=3.75s (*"Chandigarh di kudi, vibes check kar lai!"*), cutting dynamically to the live Punjabi Dhol drummers on illuminated risers striking the beat drop at t=3.75s to 5.625s.
* **Deliverable Video**: [\`shot_1_option_b_drummer_cutaway.mp4\`](file://${path.resolve(finalB)})
* **Frame at t=3.5s (Singer)**: [\`frame_t3.5s_singer.jpg\`](file://${path.resolve(fSingerB)})
* **Frame at t=4.2s (Dhol Drummers)**: [\`frame_t4.0s_dhol.jpg\`](file://${path.resolve(fDholB)})

---

## 🔍 Forensic Directorial Comparison (Gemini 2.5 Pro)
${comparisonText}
`;

  const reportPath = path.join(BASE_DIR, "options_a_vs_b_comparison_report.md");
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Comparison report saved to ${reportPath}`);
  console.log("\n========================================================================");
  console.log("🎉 DUAL REMEDIATION COMPLETE");
  console.log("========================================================================");
}

main().catch(console.error);
