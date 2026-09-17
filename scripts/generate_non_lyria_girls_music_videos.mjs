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
if (!API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'swarm');
const SCRATCH_DIR = path.join(process.cwd(), 'scratch', 'chandigarh_london_modern_pop');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// -----------------------------------------------------------------------------
// STEP 1: Generate Master Anchor Plate (Chandigarh Top Models in London Outdoors)
// -----------------------------------------------------------------------------
async function generateMasterAnchorPlate() {
  const anchorPath = path.join(OUT_DIR, 'chandigarh_london_girls_anchor.jpg');
  if (fs.existsSync(anchorPath) && fs.statSync(anchorPath).size > 50000) {
    console.log('✅ Using existing Master Anchor Plate:', anchorPath);
    return anchorPath;
  }

  console.log('🎨 [Imagen 3] Generating Master Anchor Plate: Fair Punjabi Top Models from Chandigarh in London Outdoors (Short Skirts & Crop Tops)...');
  const prompt =
    'Ultra-photorealistic 8k cinematic medium-wide two-shot of two fair-complexioned glamorous 22-year-old Punjabi female top models from Chandigarh (Simran and Kiara) standing side-by-side outdoors in Central London with Tower Bridge and iconic red double-decker London buses in the sunny golden-hour background. Simran (left) has long glossy dark wavy hair and wears a chic white-and-silver designer fitted crop top and a stylish pleated mini short skirt with fashionable ankle boots. Kiara (right) has sleek dark hair and wears a matching black-and-gold designer fitted crop top and a stylish pleated mini short skirt. Both have radiant fair North Indian features, expressive eyes, and confident pop star smiles looking directly into the camera lens. Shot on ARRI Alexa 65, 50mm anamorphic prime lens, crisp natural outdoor London sunlight.';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          outputOptions: { mimeType: 'image/jpeg' },
        },
      }),
    }
  );

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    throw new Error(`Imagen 3 failed: ${JSON.stringify(data).slice(0, 300)}`);
  }

  fs.writeFileSync(anchorPath, Buffer.from(b64, 'base64'));
  console.log(`✅ Saved Master Anchor Plate (${(fs.statSync(anchorPath).size / 1024).toFixed(1)} KB): ${anchorPath}`);
  return anchorPath;
}

// -----------------------------------------------------------------------------
// STEP 2: Generate Non-Lyria Hindi/Punjabi MODERN POP Female Duet Singing Vocals
// -----------------------------------------------------------------------------
async function generateNonLyriaModernPopVocals() {
  const vocalMasterWav = path.join(OUT_DIR, 'chandigarh_london_modern_pop_vocals_15s.wav');
  if (fs.existsSync(vocalMasterWav) && fs.statSync(vocalMasterWav).size > 100000) {
    console.log('✅ Using existing Non-Lyria Modern Pop Vocal Track:', vocalMasterWav);
    return vocalMasterWav;
  }

  console.log('🎤 [Gemini 2.5 Flash Multimodal] Synthesizing Non-Lyria Modern Pop Hindi/Punjabi Female Duet Singing Vocals...');

  const lines = [
    {
      voice: 'Kore',
      text: 'चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!',
      out: path.join(SCRATCH_DIR, 'pop_line1.wav'),
    },
    {
      voice: 'Aoede',
      text: 'शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!',
      out: path.join(SCRATCH_DIR, 'pop_line2.wav'),
    },
    {
      voice: 'Kore',
      text: 'नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!',
      out: path.join(SCRATCH_DIR, 'pop_line3.wav'),
    },
  ];

  for (const item of lines) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Sing this modern Hindi Punjabi urban pop song lyric with sleek, glamorous modern female pop star singing cadence, catchy melodic hooks, and crisp rhythm: "${item.text}"`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: item.voice },
              },
            },
          },
        }),
      }
    );

    const data = await res.json();
    const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      throw new Error(`TTS failed for ${item.voice}: ${JSON.stringify(data).slice(0, 300)}`);
    }

    const rawPcmPath = `${item.out}.pcm`;
    fs.writeFileSync(rawPcmPath, Buffer.from(inlineData.data, 'base64'));
    // Convert 24kHz signed 16-bit PCM to 48kHz stereo WAV with modern pop stereo vocal doubling & shimmer
    execSync(
      `ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${rawPcmPath}" -af "aresample=48000,pan=stereo|c0=c0|c1=c0,aecho=0.8:0.88:30:0.20,volume=1.65,apad=whole_dur=5.0,atrim=duration=5.0,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${item.out}"`,
      { stdio: 'pipe' }
    );
  }

  const listTxt = path.join(SCRATCH_DIR, 'vocal_concat.txt');
  fs.writeFileSync(listTxt, lines.map((l) => `file '${l.out}'`).join('\n'));
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listTxt}" -af "atrim=duration=15.000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${vocalMasterWav}"`,
    { stdio: 'pipe' }
  );

  console.log(`✅ Generated Non-Lyria Modern Pop Vocal Master (15.0s): ${vocalMasterWav}`);
  return vocalMasterWav;
}

// -----------------------------------------------------------------------------
// STEP 3: Generate 4 Sequential Attire-Locked Veo 3.1 Clips (Outdoors in London)
// -----------------------------------------------------------------------------
async function generateVeoShot({ shotName, prompt, conditioningImagePath }) {
  const outMp4 = path.join(OUT_DIR, `${shotName}.mp4`);
  if (fs.existsSync(outMp4) && fs.statSync(outMp4).size > 400000) {
    console.log(`✅ Using existing Veo 3.1 clip: ${outMp4}`);
    return outMp4;
  }

  console.log(`🎥 [Veo 3.1] Generating ${shotName} conditioned on ${path.basename(conditioningImagePath)}...`);
  const imgB64 = fs.readFileSync(conditioningImagePath).toString('base64');

  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [
          {
            prompt,
            image: {
              bytesBase64Encoded: imgB64,
              mimeType: 'image/jpeg',
            },
          },
        ],
        parameters: {
          aspectRatio: '16:9',
          durationSeconds: 6,
        },
      }),
    }
  );

  const startData = await startRes.json();
  const opName = startData?.name;
  if (!opName) {
    throw new Error(`Veo start failed: ${JSON.stringify(startData).slice(0, 300)}`);
  }

  console.log(`⏳ Polling Veo operation ${opName}...`);
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(5000);
    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${API_KEY}`
    );
    const pollData = await pollRes.json();
    if (pollData.done) {
      const videoUri =
        pollData?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (!videoUri) {
        throw new Error(`Veo finished without video URI: ${JSON.stringify(pollData).slice(0, 300)}`);
      }
      const dlRes = await fetch(`${videoUri}&key=${API_KEY}`);
      const arrayBuf = await dlRes.arrayBuffer();
      fs.writeFileSync(outMp4, Buffer.from(arrayBuf));
      console.log(`✅ Saved ${shotName}.mp4 (${(fs.statSync(outMp4).size / 1024 / 1024).toFixed(2)} MB)`);
      return outMp4;
    }
  }
  throw new Error(`Timeout waiting for ${shotName}`);
}

function extractTailFrame(videoPath, outJpgPath) {
  execSync(
    `ffmpeg -y -sseof -0.15 -i "${videoPath}" -vframes 1 -q:v 2 "${outJpgPath}"`,
    { stdio: 'pipe' }
  );
  return outJpgPath;
}

async function main() {
  console.log('================================================================================');
  console.log('💃 GENERATING 3 NON-LYRIA MODERN POP HINDI/PUNJABI REELS IN LONDON OUTDOORS');
  console.log('   Same Chandigarh Top Models (Simran & Kiara) • Short Skirts & Crop Tops');
  console.log('   Same Modern Pop Song & Synth-Pop Beat (124 BPM) • 3 Distinct Techniques');
  console.log('================================================================================\n');

  const anchorPath = await generateMasterAnchorPlate();
  const vocalMasterWav = await generateNonLyriaModernPopVocals();
  // Modern Pop 124 BPM Synth-Pop & Crisp Electronic Bass Groove (Zero Dhol / Zero Folk)
  const modernPopBeatMp3 = path.join(process.cwd(), 'public/assets/stems/lyria_shibuya_pop_124bpm.mp3');

  // Shot 1 (0-5s): Modern Pop Singing & Dancing Verse 1 in London Outdoors
  const shot1Mp4 = await generateVeoShot({
    shotName: 'chandigarh_london_pop_shot1_singing',
    conditioningImagePath: anchorPath,
    prompt:
      'Keep exact same two fair-complexioned glamorous 22-year-old Punjabi female top models from Chandigarh (Simran in white-and-silver fitted crop top and pleated mini short skirt on left; Kiara in black-and-gold fitted crop top and pleated mini short skirt on right) outdoors in Central London with Tower Bridge and red double-decker buses in background. Both girls look directly into the camera lens, singing passionately in Hindi/Punjabi with moving lips while performing sleek modern urban pop dance choreography: "Chandigarh se London tak vibe hai high, modern pop beat pe chamke ye sky!" Bright golden-hour London sunlight, 50mm anamorphic lens.',
  });
  const tail1Jpg = extractTailFrame(shot1Mp4, path.join(SCRATCH_DIR, 'tail_shot1.jpg'));

  // Shot 2 (5-10s): Synchronized Modern Pop Chorus Dance Routine + Singing in London (Conditioned on tail1Jpg)
  const shot2Mp4 = await generateVeoShot({
    shotName: 'chandigarh_london_pop_shot2_chorus',
    conditioningImagePath: tail1Jpg,
    prompt:
      'Keep exact same two fair Punjabi female top models (Simran in white-and-silver crop top and pleated short skirt; Kiara in black-and-gold crop top and pleated short skirt) outdoors on the sunny London street promenade. Synchronized sleek modern urban pop dance choreography, confident body rolls and synchronized arm waves while singing directly to the camera lens with moving lips: "Short skirt crop top style super cool, London ki streets pe hum karein rule!" Smooth tracking camera movement.',
  });
  const tail2Jpg = extractTailFrame(shot2Mp4, path.join(SCRATCH_DIR, 'tail_shot2.jpg'));

  // Shot 3 (10-15s): Finale Singing & Supermodel Pop Star Pose in London (Conditioned on tail2Jpg)
  const shot3Mp4 = await generateVeoShot({
    shotName: 'chandigarh_london_pop_shot3_finale',
    conditioningImagePath: tail2Jpg,
    prompt:
      'Keep exact same two fair Punjabi female top models (Simran in white-and-silver crop top and short skirt; Kiara in black-and-gold crop top and short skirt) outdoors in London. Both step forward toward the camera lens singing the catchy modern pop finale hook with moving lips and striking a glamorous synchronized supermodel pop star pose: "Neon lights aur ye pop wali beat, Chandigarh girls ka swag sabse sweet!" Sunny London skyline background.',
  });
  const tail3Jpg = extractTailFrame(shot3Mp4, path.join(SCRATCH_DIR, 'tail_shot3.jpg'));

  // Shot 4 (Pure Outdoor London Modern Pop Dance B-Roll Cutaway for Technique C - Mouth Closed Non-Vocal Dance)
  const shot4DanceBrollMp4 = await generateVeoShot({
    shotName: 'chandigarh_london_pop_shot4_broll',
    conditioningImagePath: anchorPath,
    prompt:
      'Keep exact same two fair Punjabi female top models from Chandigarh (Simran in white-and-silver crop top and pleated mini short skirt; Kiara in black-and-gold crop top and pleated mini short skirt) outdoors in Central London. Pure high-energy synchronized modern urban pop dance choreography, sleek hip-hop pop footwork and hair flips on the London street, smiling radiantly with mouths closed, no singing, non-vocal dance performance. Wide low-angle cinema camera.',
  });

  console.log('\n🎬 Assembling the 3 Distinct Non-Lyria Modern Pop Music Video Reels (15.000s @ 30fps CFR)...');

  function escapeXml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async function renderNormalizedSegment({ inputMp4, durationSec, subtitleText, badgeText, outMp4 }) {
    const hudPngPath = `${outMp4}.hud.png`;
    const svgContent = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <!-- 2.39:1 Anamorphic Letterbox Matte Bars -->
      <rect x="0" y="0" width="1920" height="110" fill="#000000" />
      <rect x="0" y="970" width="1920" height="110" fill="#000000" />
      <!-- Technique & Non-Lyria Header Badges -->
      <text x="50" y="62" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" fill="#38BDF8" letter-spacing="1">${escapeXml(badgeText)}</text>
      <text x="1870" y="62" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#F59E0B" text-anchor="end" letter-spacing="1">CHANDIGARH TO LONDON • MODERN POP (124 BPM • 100% NON-LYRIA)</text>
      <!-- Theatrical Lyric Subtitle -->
      <text x="960" y="925" font-family="Georgia, serif" font-size="30" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle" stroke="#000000" stroke-width="4" paint-order="stroke fill">${escapeXml(subtitleText)}</text>
    </svg>`;
    await sharp(Buffer.from(svgContent)).png().toFile(hudPngPath);

    execSync(
      `ffmpeg -y -i "${inputMp4}" -i "${hudPngPath}" -t ${durationSec} -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -r 30 -fps_mode cfr -video_track_timescale 30000 -an -c:v libx264 -preset fast -crf 18 "${outMp4}"`,
      { stdio: 'pipe' }
    );
  }

  // Extract native Veo audio from Shots 1, 2, 3
  const veoAudio1 = path.join(SCRATCH_DIR, 'veo_a1.wav');
  const veoAudio2 = path.join(SCRATCH_DIR, 'veo_a2.wav');
  const veoAudio3 = path.join(SCRATCH_DIR, 'veo_a3.wav');
  [
    [shot1Mp4, veoAudio1],
    [shot2Mp4, veoAudio2],
    [shot3Mp4, veoAudio3],
  ].forEach(([src, dst]) => {
    execSync(
      `ffmpeg -y -i "${src}" -vn -af "aresample=48000,apad=whole_dur=5.0,atrim=duration=5.0,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${dst}"`,
      { stdio: 'pipe' }
    );
  });

  const veoNativeConcatWav = path.join(SCRATCH_DIR, 'veo_native_concat_15s.wav');
  const veoNativeList = path.join(SCRATCH_DIR, 'veo_native_list.txt');
  fs.writeFileSync(veoNativeList, [veoAudio1, veoAudio2, veoAudio3].map((f) => `file '${f}'`).join('\n'));
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${veoNativeList}" -ar 48000 -ac 2 "${veoNativeConcatWav}"`,
    { stdio: 'pipe' }
  );

  // ===========================================================================
  // 🎬 TECHNIQUE A: Native Veo 3.1 On-Camera Singing ([0:a]) + Modern Synth-Pop Groove (124 BPM)
  // ===========================================================================
  console.log('  ▶ [Technique A] Rendering Native Veo 3.1 On-Camera Singing + 124 BPM Modern Synth-Pop...');
  const segA1 = path.join(SCRATCH_DIR, 'segA1.mp4');
  const segA2 = path.join(SCRATCH_DIR, 'segA2.mp4');
  const segA3 = path.join(SCRATCH_DIR, 'segA3.mp4');

  await renderNormalizedSegment({
    inputMp4: shot1Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 ON-CAMERA SINGING ([0:a]) + 124 BPM MODERN POP',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!" ♪',
    outMp4: segA1,
  });
  await renderNormalizedSegment({
    inputMp4: shot2Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 ON-CAMERA SINGING ([0:a]) + 124 BPM MODERN POP',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segA2,
  });
  await renderNormalizedSegment({
    inputMp4: shot3Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 ON-CAMERA SINGING ([0:a]) + 124 BPM MODERN POP',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segA3,
  });

  const listA = path.join(SCRATCH_DIR, 'listA.txt');
  fs.writeFileSync(listA, [segA1, segA2, segA3].map((f) => `file '${f}'`).join('\n'));
  const videoOnlyA = path.join(SCRATCH_DIR, 'videoOnlyA.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listA}" -c copy "${videoOnlyA}"`, { stdio: 'pipe' });

  // Mix Native Veo Singing ([0:a]) + Hindi/Punjabi Modern Pop Vocals + 124 BPM Modern Synth-Pop Beat
  const audioA = path.join(SCRATCH_DIR, 'audioA.m4a');
  execSync(
    `ffmpeg -y -i "${veoNativeConcatWav}" -i "${vocalMasterWav}" -stream_loop -1 -i "${modernPopBeatMp3}" -filter_complex "[0:a]volume=1.35,atrim=duration=15.0,asetpts=PTS-STARTPTS[veo];[1:a]volume=1.25,atrim=duration=15.0,asetpts=PTS-STARTPTS[duet];[2:a]volume=0.65,atrim=duration=15.0,asetpts=PTS-STARTPTS[beat];[veo][duet][beat]amix=inputs=3:duration=first:normalize=0,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioA}"`,
    { stdio: 'pipe' }
  );

  const masterTechA = path.join(OUT_DIR, 'chandigarh_london_tech_A_native_veo.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyA}" -i "${audioA}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -movflags +faststart "${masterTechA}"`,
    { stdio: 'pipe' }
  );
  console.log(`  ✅ Saved Technique A Master: ${masterTechA}`);

  // ===========================================================================
  // 🎬 TECHNIQUE B: Studio Master Modern Pop Duet Vocal Clock + Tail-Frame Continuity Lock
  // ===========================================================================
  console.log('  ▶ [Technique B] Rendering Studio Master Modern Pop Duet Vocal Clock + Tail-Frame Lock...');
  const segB1 = path.join(SCRATCH_DIR, 'segB1.mp4');
  const segB2 = path.join(SCRATCH_DIR, 'segB2.mp4');
  const segB3 = path.join(SCRATCH_DIR, 'segB3.mp4');

  await renderNormalizedSegment({
    inputMp4: shot1Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: STUDIO MODERN POP VOCAL MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!" ♪',
    outMp4: segB1,
  });
  await renderNormalizedSegment({
    inputMp4: shot2Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: STUDIO MODERN POP VOCAL MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segB2,
  });
  await renderNormalizedSegment({
    inputMp4: shot3Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: STUDIO MODERN POP VOCAL MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segB3,
  });

  const listB = path.join(SCRATCH_DIR, 'listB.txt');
  fs.writeFileSync(listB, [segB1, segB2, segB3].map((f) => `file '${f}'`).join('\n'));
  const videoOnlyB = path.join(SCRATCH_DIR, 'videoOnlyB.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listB}" -c copy "${videoOnlyB}"`, { stdio: 'pipe' });

  const audioB = path.join(SCRATCH_DIR, 'audioB.m4a');
  execSync(
    `ffmpeg -y -i "${vocalMasterWav}" -stream_loop -1 -i "${modernPopBeatMp3}" -filter_complex "[0:a]volume=1.55,atrim=duration=15.0,asetpts=PTS-STARTPTS[voc];[1:a]volume=0.78,atrim=duration=15.0,asetpts=PTS-STARTPTS[bgm];[voc][bgm]amix=inputs=2:duration=first:normalize=0,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioB}"`,
    { stdio: 'pipe' }
  );

  const masterTechB = path.join(OUT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyB}" -i "${audioB}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -movflags +faststart "${masterTechB}"`,
    { stdio: 'pipe' }
  );
  console.log(`  ✅ Saved Technique B Master: ${masterTechB}`);

  // ===========================================================================
  // 🎬 TECHNIQUE C: Multi-Camera 124 BPM Modern Pop Beat-Synced Cutaway (Vocal A-Roll + Dance B-Roll)
  // ===========================================================================
  console.log('  ▶ [Technique C] Rendering Multi-Camera 124 BPM Modern Pop Beat-Synced A-Roll / B-Roll Cutaway...');
  const segC1 = path.join(SCRATCH_DIR, 'segC1.mp4');
  const segC2 = path.join(SCRATCH_DIR, 'segC2.mp4');
  const segC3 = path.join(SCRATCH_DIR, 'segC3.mp4');
  const segC4 = path.join(SCRATCH_DIR, 'segC4.mp4');
  const segC5 = path.join(SCRATCH_DIR, 'segC5.mp4');

  await renderNormalizedSegment({
    inputMp4: shot1Mp4,
    durationSec: 3.5,
    badgeText: 'TECHNIQUE C: 124 BPM MODERN POP BEAT CUTS (CAM A: VOCAL SINGING A-ROLL)',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई..." [CAM A: SINGING DUET] ♪',
    outMp4: segC1,
  });
  await renderNormalizedSegment({
    inputMp4: shot4DanceBrollMp4,
    durationSec: 1.5,
    badgeText: 'TECHNIQUE C: 124 BPM MODERN POP BEAT CUTS (CAM B: URBAN POP DANCE B-ROLL)',
    subtitleText: '⚡ [124 BPM SYNTH-POP DROP — LONDON STREET DANCE BREAK] ⚡',
    outMp4: segC2,
  });
  await renderNormalizedSegment({
    inputMp4: shot2Mp4,
    durationSec: 3.5,
    badgeText: 'TECHNIQUE C: 124 BPM MODERN POP BEAT CUTS (CAM A: CHORUS VOCAL DUET)',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segC3,
  });
  await renderNormalizedSegment({
    inputMp4: shot4DanceBrollMp4,
    durationSec: 2.0,
    badgeText: 'TECHNIQUE C: 124 BPM MODERN POP BEAT CUTS (CAM B: WIDE DANCE CHOREOGRAPHY)',
    subtitleText: '⚡ [124 BPM BASS DROP — SYNCHRONIZED POP FOOTWORK CUTAWAY] ⚡',
    outMp4: segC4,
  });
  await renderNormalizedSegment({
    inputMp4: shot3Mp4,
    durationSec: 4.5,
    badgeText: 'TECHNIQUE C: 124 BPM MODERN POP BEAT CUTS (CAM A: FINALE HIGH NOTE)',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segC5,
  });

  const listC = path.join(SCRATCH_DIR, 'listC.txt');
  fs.writeFileSync(listC, [segC1, segC2, segC3, segC4, segC5].map((f) => `file '${f}'`).join('\n'));
  const videoOnlyC = path.join(SCRATCH_DIR, 'videoOnlyC.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listC}" -c copy "${videoOnlyC}"`, { stdio: 'pipe' });

  const masterTechC = path.join(OUT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyC}" -i "${audioB}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -movflags +faststart "${masterTechC}"`,
    { stdio: 'pipe' }
  );
  console.log(`  ✅ Saved Technique C Master: ${masterTechC}`);

  // Extract poster & comparison frames
  const frameA = path.join(OUT_DIR, 'chandigarh_london_frame_tech_A.jpg');
  const frameB = path.join(OUT_DIR, 'chandigarh_london_frame_tech_B.jpg');
  const frameC_Aroll = path.join(OUT_DIR, 'chandigarh_london_frame_tech_C_aroll.jpg');
  const frameC_Broll = path.join(OUT_DIR, 'chandigarh_london_frame_tech_C_broll.jpg');

  execSync(`ffmpeg -y -ss 2.0 -i "${masterTechA}" -vframes 1 -q:v 2 "${frameA}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 6.5 -i "${masterTechB}" -vframes 1 -q:v 2 "${frameB}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 1.5 -i "${masterTechC}" -vframes 1 -q:v 2 "${frameC_Aroll}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 4.2 -i "${masterTechC}" -vframes 1 -q:v 2 "${frameC_Broll}"`, { stdio: 'pipe' });

  console.log('\n🎉 ALL 3 NON-LYRIA MODERN POP HINDI/PUNJABI CHANDIGARH-TO-LONDON REELS GENERATED!');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
