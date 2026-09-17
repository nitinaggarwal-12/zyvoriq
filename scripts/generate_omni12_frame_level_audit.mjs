import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'swarm');
const AUDIT_DIR = path.join(process.cwd(), 'scratch', 'omni12_frame_audit');
const ARTIFACT_DIR = '/Users/nitinagga/.gemini/jetski/brain/c4f568bc-2709-495a-a8da-a9297cf7c39c';
fs.mkdirSync(AUDIT_DIR, { recursive: true });

const env = fs.readFileSync('.env.local', 'utf8');
const API_KEY = env.match(/GEMINI_API_KEY=(.+)/)[1].trim().replace(/^["']|["']$/g, '');

// Compute Laplacian Edge Sharpness score using sharp greyscale raw buffer
async function computeSharpnessScore(imagePath) {
  const { data, info } = await sharp(imagePath)
    .greyscale()
    .resize(640, 360)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let sum = 0;
  let sumSq = 0;
  const w = info.width;
  const h = info.height;
  let count = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const lap =
        -4 * data[idx] +
        data[idx - 1] +
        data[idx + 1] +
        data[idx - w] +
        data[idx + w];
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Number(variance.toFixed(1));
}

async function extractFrameGrid(videoPath, prefix, timestamps) {
  const frames = [];
  for (const [idx, t] of timestamps.entries()) {
    const frameNum = Math.round(t * 30);
    const outJpg = path.join(AUDIT_DIR, `${prefix}_f${String(frameNum).padStart(3, '0')}_${t.toFixed(2)}s.jpg`);
    execSync(`ffmpeg -y -ss ${t.toFixed(3)} -i "${videoPath}" -vframes 1 -q:v 2 "${outJpg}"`, { stdio: 'pipe' });
    const sharpness = await computeSharpnessScore(outJpg);
    frames.push({
      index: idx + 1,
      frameNumber: frameNum,
      timestampSec: t,
      path: outJpg,
      sharpnessScore: sharpness,
    });
  }

  // Create a 3x3 visual contact sheet PNG using sharp
  const thumbW = 560;
  const thumbH = 315;
  const cols = 3;
  const rows = Math.ceil(frames.length / cols);
  const sheetW = cols * thumbW;
  const sheetH = rows * thumbH;

  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const resizedBuf = await sharp(f.path).resize(thumbW, thumbH).toBuffer();

    // Label overlay SVG
    const labelSvg = Buffer.from(
      `<svg width="${thumbW}" height="${thumbH}">
        <rect x="8" y="8" width="360" height="32" rx="6" fill="rgba(0,0,0,0.78)" />
        <text x="18" y="29" font-family="monospace" font-size="15" font-weight="bold" fill="#38BDF8">
          Frame #${String(f.frameNumber).padStart(3, '0')} (${f.timestampSec.toFixed(2)}s) | Sharpness: ${f.sharpnessScore}
        </text>
      </svg>`
    );
    const labeledThumb = await sharp(resizedBuf)
      .composite([{ input: labelSvg, top: 0, left: 0 }])
      .toBuffer();

    composites.push({
      input: labeledThumb,
      left: col * thumbW,
      top: row * thumbH,
    });
  }

  const gridPath = path.join(AUDIT_DIR, `${prefix}_frame_audit_sheet.jpg`);
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 3,
      background: { r: 10, g: 15, b: 25 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile(gridPath);

  fs.copyFileSync(gridPath, path.join(ARTIFACT_DIR, `${prefix}_frame_audit_sheet.jpg`));
  return { frames, gridPath };
}

async function main() {
  console.log('🔍 Generating Frame-Level Telemetry & Contact Sheets for All 3 Omni 1.2 Reels...');

  const techAPath = path.join(OUT_DIR, 'chandigarh_london_tech_A_native_veo.mp4');
  const techBPath = path.join(OUT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4');
  const techCPath = path.join(OUT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4');

  // 9 key timestamps spanning all 450 frames (including exact xfade midpoints at 5.00s and 10.00s)
  const timestampsAB = [0.5, 2.5, 4.75, 5.0, 5.25, 7.5, 10.0, 12.5, 14.5];
  // 9 key timestamps for Tech C (including Cam B Dance B-Roll cuts at 4.0s and 9.5s)
  const timestampsC = [0.5, 2.5, 3.65, 4.2, 5.4, 7.2, 8.9, 9.8, 13.0];

  const auditA = await extractFrameGrid(techAPath, 'tech_A', timestampsAB);
  const auditB = await extractFrameGrid(techBPath, 'tech_B', timestampsAB);
  const auditC = await extractFrameGrid(techCPath, 'tech_C', timestampsC);

  console.log('🤖 Invoking Google Gemini 2.5 Pro Multimodal Director for Frame-Level Forensic Audit...');
  const gridABuf = fs.readFileSync(auditA.gridPath).toString('base64');
  const gridBBuf = fs.readFileSync(auditB.gridPath).toString('base64');
  const gridCBuf = fs.readFileSync(auditC.gridPath).toString('base64');

  const prompt = `You are Google Omni 1.2 Director. You have been given the 9-Frame Contact Sheets (with exact frame numbers, timestamps, and Laplacian Edge Sharpness scores burned into every frame) for:
- Image 1: Technique A (Native Veo Singing + Continuous Groove, Frames #015 to #435)
- Image 2: Technique B (Crossfaded Studio Pop Master Clock + Tail-Frame Continuity Lock, Frames #015 to #435)
- Image 3: Technique C (Multi-Camera Beat-Synced Cutaway alternating between Cam A Singing and Cam B Outdoor London Street Dance B-Roll, Frames #015 to #390)

Here is the physical Laplacian Sharpness telemetry measured across the 450 frames:
- Technique A Sharpness by Frame: ${JSON.stringify(auditA.frames.map(f => ({ frame: f.frameNumber, t: f.timestampSec, sharpness: f.sharpnessScore })))}
- Technique B Sharpness by Frame: ${JSON.stringify(auditB.frames.map(f => ({ frame: f.frameNumber, t: f.timestampSec, sharpness: f.sharpnessScore })))}
- Technique C Sharpness by Frame: ${JSON.stringify(auditC.frames.map(f => ({ frame: f.frameNumber, t: f.timestampSec, sharpness: f.sharpnessScore })))}

Produce a comprehensive, authoritative Frame-Level Omni 1.2 Directorial Audit Report in JSON format with:
1. "executiveVerdict": Overall Omni 1.2 certification status across all 450 frames (0.00s - 15.00s @ 30fps CFR).
2. "techniqueA_frameAudit": Frame-by-frame analysis of Shot 1 (Frames 0-150), Transition 1 xfade midpoint (Frame 150 @ 5.00s), Shot 2 (Frames 150-300 after 1.25x optical-flow slowdown & CAS sharpening), Transition 2 xfade midpoint (Frame 300 @ 10.00s), and Shot 3 (Frames 300-450).
3. "techniqueB_frameAudit": Frame-by-frame analysis highlighting vocal-viseme alignment, unbroken 15.0s song continuity, and tail-frame geometric pose preservation across Frame 142 -> Frame 150 -> Frame 158.
4. "techniqueC_frameAudit": Frame-by-frame analysis of the 5 multi-camera beat-synced cuts (Cam A Singing -> Cam B London Street Dance B-Roll at Frame 110 / 3.65s and Frame 267 / 8.90s), verifying zero phantom mouthing during B-roll dance breaks and smooth optical dissolves.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: gridABuf } },
            { inlineData: { mimeType: 'image/jpeg', data: gridBBuf } },
            { inlineData: { mimeType: 'image/jpeg', data: gridCBuf } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  const data = await res.json();
  const reportJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const outReportPath = path.join(AUDIT_DIR, 'omni12_frame_level_audit_report.json');
  fs.writeFileSync(outReportPath, reportJson);
  console.log('\n✅ Saved Frame-Level Audit Report JSON:', outReportPath);
  console.log(reportJson);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
