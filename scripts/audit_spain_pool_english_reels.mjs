import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      content.split('\n').forEach((line) => {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m) {
          const key = m[1];
          let val = (m[2] || '').trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
    }
  }
}
loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'swarm');
const SCRATCH_DIR = path.join(process.cwd(), 'scratch', 'spain_pool_audit');
const ARTIFACT_DIR = '/Users/nitinagga/.gemini/jetski/brain/c4f568bc-2709-495a-a8da-a9297cf7c39c';
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

async function buildContactSheet(mp4Path, sheetName) {
  const times = [1.0, 4.2, 6.0, 9.2, 11.5, 14.0];
  const frameBufs = [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const fPath = path.join(SCRATCH_DIR, `${sheetName}_t${i}.jpg`);
    execSync(`ffmpeg -y -ss ${t} -i "${mp4Path}" -vframes 1 -q:v 2 "${fPath}"`, { stdio: 'pipe' });
    const resized = await sharp(fPath).resize(640, 360).toBuffer();
    frameBufs.push({ input: resized, left: (i % 3) * 640, top: Math.floor(i / 3) * 360 });
  }
  const outSheet = path.join(OUT_DIR, `${sheetName}.jpg`);
  await sharp({
    create: { width: 1920, height: 720, channels: 3, background: { r: 10, g: 15, b: 25 } },
  })
    .composite(frameBufs)
    .jpeg({ quality: 92 })
    .toFile(outSheet);
  fs.copyFileSync(outSheet, path.join(ARTIFACT_DIR, `${sheetName}.jpg`));
  console.log(`✅ Created Contact Sheet: ${outSheet}`);
  return outSheet;
}

async function auditVideoWithGemini(mp4Path, label) {
  console.log(`🔍 Running Gemini 2.5 Pro Multimodal Lip-Sync & Audio Audit on ${label}...`);
  const videoB64 = fs.readFileSync(mp4Path).toString('base64');
  const prompt = `You are Google Omni Director performing a Forensic Audio-Visual Quality Audit on this 15-second 16:9 English Summer Pop Music Video Reel (${label}) set in a luxury Ibiza swimming pool in Spain.
Evaluate the following:
1. Lip Sync & Vocal Coincidence: Do the two European fashion models (Elena with brunette hair on the left, Valentina with wavy blonde hair on the right) visibly articulate English singing lyrics synchronized with the female pop vocals?
2. Audio Clarity & Single Song Stream: Is the audio a clean, upbeat English summer dance-pop / tropical house song with zero overlapping TTS speech or colliding background songs?
3. Character Biometric & Scene Continuity: Do Elena (left, white silk halter top) and Valentina (right, coral-red silk halter top) maintain consistent facial identity across the 15-second reel inside the sparkling turquoise swimming pool with friends splashing water in the background?
Respond strictly in JSON format with keys: { "matchesLyrics": boolean, "isCleanAudio": boolean, "biometricConsistency": boolean, "lipSyncScoreOutOf10": number, "audioQualityScoreOutOf10": number, "summary": string }`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'video/mp4',
                  data: videoB64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(txt);
  console.log(`📊 Audit Result for ${label}:`, parsed);
  return parsed;
}

async function main() {
  const masterA = path.join(OUT_DIR, 'spain_pool_english_master_A.mp4');
  const multicamB = path.join(OUT_DIR, 'spain_pool_english_multicam_B.mp4');

  await buildContactSheet(masterA, 'spain_pool_master_A_audit_sheet');
  await buildContactSheet(multicamB, 'spain_pool_multicam_B_audit_sheet');

  const auditA = await auditVideoWithGemini(masterA, 'Master A (Continuous 1:1 Lip-Sync)');
  const auditB = await auditVideoWithGemini(multicamB, 'Master B (Multi-Cam Pool Party Cutaway)');

  const reportPath = path.join(SCRATCH_DIR, 'spain_pool_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ auditA, auditB }, null, 2));
  console.log(`✅ Saved Forensic Audit Report to ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
