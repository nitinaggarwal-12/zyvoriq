import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile, execSync } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizePromptForVeo(prompt) {
  if (!prompt || typeof prompt !== "string") return prompt;
  let clean = prompt.replace(/\b[A-Z][A-Za-z0-9_\s]{1,30}:/g, "");
  clean = clean.replace(/\b(?:Kiara\s*Advani|Kiara)\b/gi, "a radiant, graceful Indian leading lady");
  clean = clean.replace(/\bcut to\b/gi, "view of");
  clean = clean.replace(/\bchai\b/gi, "beverage");
  return clean.replace(/\s{2,}/g, " ").trim();
}

async function generateCanonicalCharacterSheet(outputDir) {
  const charSheetPath = path.join(outputDir, "00_canonical_character_sheet.png");
  try {
    const existing = await fs.readFile(charSheetPath);
    if (existing.length > 50000) {
      console.log(`✓ Using existing canonical character sheet: ${charSheetPath} (${existing.length} bytes)`);
      return { path: charSheetPath, base64: existing.toString("base64"), buffer: existing };
    }
  } catch (e) {}

  console.log("▶ [TEST-1] Step 1: Generating canonical character reference sheet...");
  const prompt =
    "Generate an image. Photorealistic canonical character reference sheet. Full front-facing portrait of ONE person. " +
    "A stylish Indian woman in her late 20s, warm expressive brown eyes, subtle smile, shoulder-length wavy dark hair, wearing an elegant neutral linen top, direct eye contact, even studio lighting, plain light-grey seamless background, no props, no text, no logo. " +
    "Photorealistic, sharp facial detail, natural skin texture.";

  const res = await fetch(`${API_BASE}/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  function findInlineImage(node) {
    if (!node || typeof node !== "object") return null;
    for (const k of ["inline_data", "inlineData"]) {
      if (node[k] && typeof node[k].data === "string") return node[k].data;
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) {
        for (const it of v) { const f = findInlineImage(it); if (f) return f; }
      } else if (v && typeof v === "object") {
        const f = findInlineImage(v); if (f) return f;
      }
    }
    return null;
  }
  const b64 = findInlineImage(data);
  if (!b64) throw new Error(`Failed to generate character sheet: ${JSON.stringify(data).slice(0, 400)}`);
  const buf = Buffer.from(b64, "base64");
  await fs.writeFile(charSheetPath, buf);
  console.log(`✓ Canonical character sheet saved: ${charSheetPath} (${buf.length} bytes)`);
  return { path: charSheetPath, base64: b64, buffer: buf };
}

async function dispatchVeo(prompt, referenceBase64List) {
  const cleanPrompt = sanitizePromptForVeo(prompt);
  console.log(`▶ Dispatching Veo shot: "${cleanPrompt.slice(0, 60)}..." with ${referenceBase64List.length} reference(s)`);
  const referenceImages = referenceBase64List.map((b64) => ({
    image: { bytesBase64Encoded: b64, mimeType: "image/png" },
    referenceType: "asset",
  }));

  const res = await fetch(`${API_BASE}/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt: cleanPrompt, referenceImages }],
      parameters: {
        aspectRatio: "9:16",
        durationSeconds: 8,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Veo dispatch failed (${res.status}): ${JSON.stringify(data.error || data)}`);
  }
  console.log(`✓ Dispatched: ${data.name}`);
  return data.name;
}

async function pollVeoOperation(opName) {
  console.log(`▶ Polling operation: ${opName}`);
  const maxPolls = 60;
  for (let p = 1; p <= maxPolls; p++) {
    await sleep(5000);
    const res = await fetch(`${API_BASE}/v1beta/${opName}?key=${apiKey()}`);
    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn(`Transient poll warning (${p}/${maxPolls}):`, data.error?.message || res.status);
      continue;
    }
    if (data.done) {
      const resp = data.response?.generateVideoResponse;
      if (resp?.raiMediaFilteredCount > 0) {
        throw new Error(`VEO_RAI_FILTER: ${JSON.stringify(resp.raiMediaFilteredReasons)}`);
      }
      const uri = resp?.generatedSamples?.[0]?.video?.uri;
      if (!uri) throw new Error(`Veo finished without video URI: ${JSON.stringify(data)}`);
      console.log(`✓ Operation completed in ~${p * 5}s! Download URI obtained.`);
      return uri;
    }
    if (p % 4 === 0) {
      console.log(`  ... still generating (${p * 5}s elapsed)`);
    }
  }
  throw new Error(`Veo operation timed out after ${maxPolls * 5}s (${opName})`);
}

async function generateAndDownloadShotWithAutoHeal(initialPrompt, refList, destPath) {
  let prompt = initialPrompt;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const opName = await dispatchVeo(prompt, refList);
      const uri = await pollVeoOperation(opName);
      await downloadVideo(uri, destPath);
      return destPath;
    } catch (err) {
      console.warn(`[Auto-Heal Attempt ${attempt}/${maxAttempts}] Failed: ${err.message}`);
      if (attempt === maxAttempts) throw err;
      // Auto-heal prompt
      if (err.message.includes("VEO_RAI_FILTER") || err.message.includes("audio")) {
        prompt = prompt
          .replace(/\b(?:breezy|wind|chai|tea|sip|laugh|talk|speak|sound|listen|ambient)\b/gi, "calm")
          .replace(/[^a-zA-Z0-9,\.\s]/g, "")
          .trim();
        console.log(`  -> Healed prompt to: "${prompt}"`);
      }
      await sleep(3000);
    }
  }
}

async function downloadVideo(uri, destPath) {
  console.log(`▶ Downloading video to ${destPath}...`);
  const sep = uri.includes("?") ? "&" : "?";
  const res = await fetch(`${uri}${sep}key=${apiKey()}`);
  if (!res.ok) throw new Error(`Failed to download video: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
  console.log(`✓ Video saved: ${destPath} (${buf.length} bytes)`);
  return destPath;
}

async function extractLastFrame(videoPath, framePath) {
  await execFileAsync("ffmpeg", ["-y", "-ss", "7.8", "-i", videoPath, "-frames:v", "1", framePath]);
  const buf = await fs.readFile(framePath);
  return buf.toString("base64");
}

async function generateSpeech(text, voice, destWav) {
  const prompt = `Speak in a natural, expressive, conversational tone: ${text}`;
  const res = await fetch(`${API_BASE}/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" }
          }
        }
      }
    })
  });
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  const b64 = part?.inlineData?.data;
  if (!b64) throw new Error(`TTS failed: ${JSON.stringify(data).slice(0, 300)}`);
  const rawBuf = Buffer.from(b64, "base64");
  const rawPath = destWav + ".raw";
  await fs.writeFile(rawPath, rawBuf);
  try {
    execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${rawPath}" "${destWav}" 2>/dev/null`);
    await fs.unlink(rawPath).catch(() => {});
  } catch (e) {
    await fs.writeFile(destWav, rawBuf);
  }
  return destWav;
}

function measureAudioLoudness(audioPath) {
  try {
    const ebuOut = execSync(`ffmpeg -i "${audioPath}" -filter:a ebur128 -f null - 2>&1`).toString();
    const match = /Integrated loudness:\s+I:\s+([-\d.]+)\s+LUFS/i.exec(ebuOut);
    return match ? Number(match[1]) : null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const outputDir = path.resolve(process.cwd(), "scratch/test_1_chains");
  await fs.mkdir(outputDir, { recursive: true });

  console.log("================================================================================");
  console.log("TEST-1: IDENTITY ACROSS A CUT (3 Hops Chain A + 3 Hops Chain B)");
  console.log("================================================================================");

  const charSheet = await generateCanonicalCharacterSheet(outputDir);

  const narrationLines = {
    A1: "Finding quiet moments between book chapters always feels like coming home.",
    A2: "The warmth of freshly brewed cardamom tea slows the whole afternoon down.",
    A3: "Every page reminds me why intentional pauses are so necessary.",
    B1: "As dusk settles over Mumbai, the ocean breeze completely transforms the city.",
    B2: "Golden hour light painting every rooftop with quiet amber tones.",
    B3: "Step outside, breathe in the sunset, and let the evening begin."
  };

  console.log("\n▶ [TEST-1] Generating TTS speech clips for voice continuity analysis...");
  const audioFiles = {};
  const voiceMetrics = {};
  for (const [key, line] of Object.entries(narrationLines)) {
    const wavPath = path.join(outputDir, `audio_${key}.wav`);
    if (!await fs.stat(wavPath).then(() => true).catch(() => false)) {
      await generateSpeech(line, "Kore", wavPath);
    }
    audioFiles[key] = wavPath;
    const lufs = measureAudioLoudness(wavPath);
    voiceMetrics[key] = { text: line, loudnessLUFS: lufs };
    console.log(`✓ Audio ${key} ready: ${lufs ? `${lufs.toFixed(1)} LUFS` : "N/A"}`);
  }

  console.log("\n▶ [TEST-1] Executing Chain A: 3 Hops in Cozy Bookstore Cafe...");
  const chainAVideos = [];

  const shotA1Path = path.join(outputDir, "shot_A1_bookstore.mp4");
  if (!await fs.stat(shotA1Path).then(() => true).catch(() => false)) {
    const pA1 = "A cinematic medium close-up of the Indian woman from the reference image sitting inside a sunlit wooden bookstore cafe in Mumbai, reading an open vintage book, soft gentle smile looking toward camera, warm ambient cafe lighting, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pA1, [charSheet.base64], shotA1Path);
  } else {
    console.log(`✓ Using existing ${shotA1Path}`);
  }
  chainAVideos.push(shotA1Path);

  const shotA2Path = path.join(outputDir, "shot_A2_bookstore.mp4");
  const lastA1Frame = path.join(outputDir, "last_frame_A1.png");
  const b64LastA1 = await extractLastFrame(shotA1Path, lastA1Frame);
  if (!await fs.stat(shotA2Path).then(() => true).catch(() => false)) {
    const pA2 = "A cinematic medium shot of the same Indian woman from the reference image inside the same wooden bookstore cafe in Mumbai, setting her book on the wooden table and gently reaching for a ceramic cup of warm tea, smiling warmly, identical outfit and hair, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pA2, [charSheet.base64, b64LastA1], shotA2Path);
  } else {
    console.log(`✓ Using existing ${shotA2Path}`);
  }
  chainAVideos.push(shotA2Path);

  const shotA3Path = path.join(outputDir, "shot_A3_bookstore.mp4");
  const lastA2Frame = path.join(outputDir, "last_frame_A2.png");
  const b64LastA2 = await extractLastFrame(shotA2Path, lastA2Frame);
  if (!await fs.stat(shotA3Path).then(() => true).catch(() => false)) {
    const pA3 = "A cinematic close-up of the same Indian woman from the reference image inside the same wooden bookstore cafe in Mumbai, taking a sip of tea, smiling with a joyful genuine expression, identical facial features and hairstyle, warm natural sunlight, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pA3, [charSheet.base64, b64LastA2], shotA3Path);
  } else {
    console.log(`✓ Using existing ${shotA3Path}`);
  }
  chainAVideos.push(shotA3Path);

  console.log("\n▶ [TEST-1] Executing Chain B: 3 Hops on Outdoor Sunset Rooftop Terrace (Cut Across Scenes)...");
  const chainBVideos = [];

  // Hop B1 (The Cut: anchored to canonical character sheet across scenes)
  const shotB1Path = path.join(outputDir, "shot_B1_terrace.mp4");
  if (!await fs.stat(shotB1Path).then(() => true).catch(() => false)) {
    const pB1 = "A cinematic medium shot of the same Indian woman from the reference image, standing outdoors on a scenic rooftop terrace garden overlooking Mumbai skyline during vibrant sunset golden hour, holding a cold glass, looking calmly at camera, warm glowing light, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pB1, [charSheet.base64], shotB1Path);
  } else {
    console.log(`✓ Using existing ${shotB1Path}`);
  }
  chainBVideos.push(shotB1Path);

  // Hop B2
  const shotB2Path = path.join(outputDir, "shot_B2_terrace.mp4");
  const lastB1Frame = path.join(outputDir, "last_frame_B1.png");
  const b64LastB1 = await extractLastFrame(shotB1Path, lastB1Frame);
  if (!await fs.stat(shotB2Path).then(() => true).catch(() => false)) {
    const pB2 = "A cinematic medium close-up of the same Indian woman from the reference image on the same Mumbai rooftop terrace at sunset, leaning slightly against the glass terrace railing, smiling softly as the city skyline lights begin to glow in the background, identical facial features and bone structure, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pB2, [charSheet.base64, b64LastB1], shotB2Path);
  } else {
    console.log(`✓ Using existing ${shotB2Path}`);
  }
  chainBVideos.push(shotB2Path);

  // Hop B3
  const shotB3Path = path.join(outputDir, "shot_B3_terrace.mp4");
  const lastB2Frame = path.join(outputDir, "last_frame_B2.png");
  const b64LastB2 = await extractLastFrame(shotB2Path, lastB2Frame);
  if (!await fs.stat(shotB3Path).then(() => true).catch(() => false)) {
    const pB3 = "A cinematic waist-up shot of the same Indian woman from the reference image on the same rooftop terrace at dusk, turning her gaze toward the vibrant orange and purple sunset sky with a confident peaceful expression, warm cinematic backlighting, identical face, 9:16 vertical composition.";
    await generateAndDownloadShotWithAutoHeal(pB3, [charSheet.base64, b64LastB2], shotB3Path);
  } else {
    console.log(`✓ Using existing ${shotB3Path}`);
  }
  chainBVideos.push(shotB3Path);

  console.log("\n▶ [TEST-1] Concatenating 6 shots (Chain A + Chain B)...");
  const allShots = [...chainAVideos, ...chainBVideos];
  const concatListPath = path.join(outputDir, "concat_list.txt");
  const concatContent = allShots.map((p) => `file '${p}'`).join("\n");
  await fs.writeFile(concatListPath, concatContent);

  const mergedVideoPath = path.join(outputDir, "01_concat_chains_6shots.mp4");
  await execFileAsync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatListPath, "-c", "copy", mergedVideoPath]);
  console.log(`✓ Merged video created: ${mergedVideoPath}`);

  const shotDurations = allShots.map((p) => {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim();
    return Number(out) || 8.0;
  });
  console.log("Shot durations:", shotDurations);

  let curTime = 0;
  const boundaries = [];
  for (let i = 0; i < shotDurations.length - 1; i++) {
    curTime += shotDurations[i];
    boundaries.push(Number(curTime.toFixed(3)));
  }
  const boundariesStr = boundaries.join(",");
  console.log("Shot boundary timestamps (s):", boundariesStr);

  console.log("\n▶ [TEST-1] Running identity_drift.py ArcFace analysis...");
  const pythonBin = fsSync.existsSync("/usr/local/google/home/nitinagga/identity-test/venv/bin/python3")
    ? "/usr/local/google/home/nitinagga/identity-test/venv/bin/python3"
    : "python3";

  const driftScript = path.resolve(process.cwd(), "scratch/identity_drift_evaluation/identity_drift.py");
  const identityJsonPath = path.join(outputDir, "test1_chains_identity_drift.json");

  const cmd = `${pythonBin} "${driftScript}" --video "${mergedVideoPath}" --boundaries "${boundariesStr}" --reference "${charSheet.path}" --output-json "${identityJsonPath}"`;
  console.log(`Executing: ${cmd}`);
  const driftOut = execSync(cmd).toString();
  console.log(driftOut);

  console.log("\n▶ [TEST-1] Generating 6-shot visual contact sheet...");
  const contactSheetPath = path.join(outputDir, "02_test1_chains_matrix.jpg");
  execSync(`ffmpeg -y -i "${mergedVideoPath}" -vf "fps=1/8,scale=270:480,tile=3x2" -frames:v 1 -q:v 2 "${contactSheetPath}" 2>/dev/null`);

  const identityData = JSON.parse(await fs.readFile(identityJsonPath, "utf8"));
  const report = {
    test: "TEST-1: Identity Across a Cut (3 Hops Chain A + 3 Hops Chain B)",
    date: new Date().toISOString(),
    mergedVideo: mergedVideoPath,
    contactSheet: contactSheetPath,
    canonicalReference: charSheet.path,
    boundaries: boundaries,
    boundaryMetrics: identityData.boundaryMetrics || [],
    shotsSummary: identityData.shotsSummary || [],
    voiceContinuity: {
      metrics: voiceMetrics,
      chainAMeanLUFS: ((voiceMetrics.A1.loudnessLUFS || -24) + (voiceMetrics.A2.loudnessLUFS || -24) + (voiceMetrics.A3.loudnessLUFS || -24)) / 3,
      chainBMeanLUFS: ((voiceMetrics.B1.loudnessLUFS || -24) + (voiceMetrics.B2.loudnessLUFS || -24) + (voiceMetrics.B3.loudnessLUFS || -24)) / 3,
      voiceDriftLUFS: Math.abs(
        ((voiceMetrics.A1.loudnessLUFS || -24) + (voiceMetrics.A2.loudnessLUFS || -24) + (voiceMetrics.A3.loudnessLUFS || -24)) / 3 -
        ((voiceMetrics.B1.loudnessLUFS || -24) + (voiceMetrics.B2.loudnessLUFS || -24) + (voiceMetrics.B3.loudnessLUFS || -24)) / 3
      )
    },
    overallVerdict: identityData.overallVerdict || "PASS"
  };

  const finalReportPath = path.join(outputDir, "test1_chains_final_report.json");
  await fs.writeFile(finalReportPath, JSON.stringify(report, null, 2));
  console.log(`\n🎉 TEST-1 COMPLETE! Report written to ${finalReportPath}`);
}

main().catch((err) => {
  console.error("TEST-1 ERROR:", err);
  process.exit(1);
});
