import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateCanonicalCharacterSheet(outputDir) {
  console.log("▶ [TEST-1] Step 1: Generating canonical character reference sheet...");
  const prompt =
    "Generate an image. Photorealistic canonical character reference sheet. Full front-facing portrait of ONE person. " +
    "A stylish Indian woman in her late 20s named Kiara, warm expressive brown eyes, subtle smile, shoulder-length wavy dark hair, wearing an elegant neutral linen top, direct eye contact, even studio lighting, plain light-grey seamless background, no props, no text, no logo. " +
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
  const charSheetPath = path.join(outputDir, "00_canonical_character_sheet.png");
  await fs.writeFile(charSheetPath, buf);
  console.log(`✓ Canonical character sheet saved: ${charSheetPath} (${buf.length} bytes)`);
  return { path: charSheetPath, base64: b64, buffer: buf };
}

async function dispatchVeoWithReference(prompt, refBase64) {
  console.log(`▶ Dispatching Veo shot: "${prompt.slice(0, 60)}..."`);
  const instance = {
    prompt,
    referenceImages: [
      {
        image: { bytesBase64Encoded: refBase64, mimeType: "image/png" },
        referenceType: "asset",
      },
    ],
  };
  const res = await fetch(`${API_BASE}/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [instance],
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
      const uri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
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

async function extractKeyframesAndComparison(shot1Path, shot2Path, charSheetPath, outputDir) {
  console.log("▶ Extracting keyframes and generating visual comparison matrix...");
  const frame1Path = path.join(outputDir, "shot1_frame_2s.png");
  const frame2Path = path.join(outputDir, "shot2_frame_2s.png");
  const comparisonPath = path.join(outputDir, "01_test1_identity_across_cut_matrix.png");

  // Extract at 2.5s from each video
  await execFileAsync("ffmpeg", ["-y", "-ss", "2.5", "-i", shot1Path, "-frames:v", "1", "-vf", "scale=540:960", frame1Path]);
  await execFileAsync("ffmpeg", ["-y", "-ss", "2.5", "-i", shot2Path, "-frames:v", "1", "-vf", "scale=540:960", frame2Path]);

  // Scale character sheet to 540:960
  const charSheetScaled = path.join(outputDir, "canonical_sheet_scaled.png");
  await execFileAsync("ffmpeg", ["-y", "-i", charSheetPath, "-vf", "scale=540:960:force_original_aspect_ratio=increase,crop=540:960", charSheetScaled]);

  // Create 3-column comparison panel: [Canonical Reference | Shot 1: Indoor Bookstore | Shot 2: Outdoor Sunset Terrace]
  await execFileAsync("ffmpeg", [
    "-y",
    "-i", charSheetScaled,
    "-i", frame1Path,
    "-i", frame2Path,
    "-filter_complex",
    "[0:v]drawtext=text='CANONICAL ANCHOR':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=40:box=1:boxcolor=black@0.7[v0];" +
    "[1:v]drawtext=text='SHOT 1: BOOKSTORE (CUT 1)':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=40:box=1:boxcolor=black@0.7[v1];" +
    "[2:v]drawtext=text='SHOT 2: SUNSET TERRACE (CUT 2)':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=40:box=1:boxcolor=black@0.7[v2];" +
    "[v0][v1][v2]hstack=inputs=3[out]",
    "-map", "[out]",
    comparisonPath
  ]);

  console.log(`✓ 3-Panel Identity Across Cut Comparison saved: ${comparisonPath}`);
  return { frame1Path, frame2Path, comparisonPath };
}

async function main() {
  const outputDir = path.resolve(process.cwd(), "scratch/test_1_identity_cut");
  await fs.mkdir(outputDir, { recursive: true });

  console.log("================================================================================");
  console.log("TEST-1: IDENTITY ACROSS A CUT (Independent Chains via Reference Images)");
  console.log("================================================================================");

  // 1. Generate or load canonical character sheet
  const charSheet = await generateCanonicalCharacterSheet(outputDir);

  // 2. Dispatch Shot 1 (Cozy Bookstore Cafe)
  const prompt1 =
    "A cinematic portrait of the Indian woman from the reference image, sitting inside a cozy sunlit wooden bookstore cafe in Mumbai, holding an open vintage book, looking up at camera with a gentle warm smile, soft natural lighting, photorealistic 9:16 vertical composition.";
  const op1 = await dispatchVeoWithReference(prompt1, charSheet.base64);

  // 3. Dispatch Shot 2 (Completely different location: Outdoor Sunset Terrace)
  const prompt2 =
    "A cinematic cut to the same Indian woman from the reference image, now standing on a lush outdoor rooftop terrace garden in Mumbai at sunset, holding a glass of iced chai, gentle breeze in her hair, golden hour glow, looking warmly toward camera, photorealistic 9:16 vertical composition.";
  const op2 = await dispatchVeoWithReference(prompt2, charSheet.base64);

  // 4. Poll both operations in parallel
  console.log("▶ Awaiting diffusion completion for both shots in parallel...");
  const [uri1, uri2] = await Promise.all([
    pollVeoOperation(op1),
    pollVeoOperation(op2),
  ]);

  // 5. Download both videos
  const shot1Path = path.join(outputDir, "shot1_bookstore.mp4");
  const shot2Path = path.join(outputDir, "shot2_sunset_terrace.mp4");
  await Promise.all([
    downloadVideo(uri1, shot1Path),
    downloadVideo(uri2, shot2Path),
  ]);

  // 6. Extract keyframes and side-by-side comparison
  const analysis = await extractKeyframesAndComparison(shot1Path, shot2Path, charSheet.path, outputDir);

  console.log("================================================================================");
  console.log("🎉 TEST-1 COMPLETED SUCCESSFULLY!");
  console.log(`Artifacts available at: ${outputDir}`);
  console.log(`Comparison Matrix: file://${analysis.comparisonPath}`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("TEST-1 ERROR:", err);
  process.exit(1);
});
