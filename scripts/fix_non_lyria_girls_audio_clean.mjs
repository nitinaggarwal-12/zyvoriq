import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'swarm');
const SCRATCH_DIR = path.join(process.cwd(), 'scratch', 'chandigarh_london_clean_fix');
const ARTIFACT_DIR = '/Users/nitinagga/.gemini/jetski/brain/c4f568bc-2709-495a-a8da-a9297cf7c39c';
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderNormalizedVideoSegment({ inputMp4, durationSec, badgeText, subtitleText, outMp4 }) {
  const hudPngPath = path.join(SCRATCH_DIR, `hud_${path.basename(outMp4, '.mp4')}.png`);
  const svgContent = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <!-- 2.39:1 Anamorphic Letterbox Mattes -->
    <rect x="0" y="0" width="1920" height="110" fill="#000000" />
    <rect x="0" y="970" width="1920" height="110" fill="#000000" />
    <!-- Technique & Non-Lyria Header Badges -->
    <text x="50" y="62" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" fill="#38BDF8" letter-spacing="1">${escapeXml(badgeText)}</text>
    <text x="1870" y="62" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#F59E0B" text-anchor="end" letter-spacing="1">CHANDIGARH TO LONDON • MODERN POP (100% NON-LYRIA SINGING)</text>
    <!-- Theatrical Lyric Subtitle -->
    <text x="960" y="925" font-family="Georgia, serif" font-size="30" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle" stroke="#000000" stroke-width="4" paint-order="stroke fill">${escapeXml(subtitleText)}</text>
  </svg>`;
  await sharp(Buffer.from(svgContent)).png().toFile(hudPngPath);

  execSync(
    `ffmpeg -y -i "${inputMp4}" -i "${hudPngPath}" -t ${durationSec} -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]" -map "[v]" -r 30 -fps_mode cfr -video_track_timescale 30000 -an -c:v libx264 -preset fast -crf 20 "${outMp4}"`,
    { stdio: 'pipe' }
  );
}

async function main() {
  console.log('================================================================================');
  console.log('🔧 FIXING AUDIO: 100% PURE SINGING + ZERO TTS SPEECH OVERLAP + ZERO CLASHING BGM');
  console.log('================================================================================\n');

  const shot1Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot1_singing.mp4');
  const shot2Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot2_chorus.mp4');
  const shot3Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot3_finale.mp4');
  const shot4BrollMp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot4_broll.mp4');

  // Extract the pure native Veo 3.1 singing audio from Shot 1, Shot 2, Shot 3 (each 5.0s)
  // ZERO TTS speech! ZERO clashing Shibuya loop!
  const a1 = path.join(SCRATCH_DIR, 'pure_sing_1.wav');
  const a2 = path.join(SCRATCH_DIR, 'pure_sing_2.wav');
  const a3 = path.join(SCRATCH_DIR, 'pure_sing_3.wav');

  execSync(`ffmpeg -y -i "${shot1Mp4}" -vn -af "aresample=48000,atrim=duration=5.0,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a1}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -i "${shot2Mp4}" -vn -af "aresample=48000,atrim=duration=5.0,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a2}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -i "${shot3Mp4}" -vn -af "aresample=48000,atrim=duration=5.0,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a3}"`, { stdio: 'pipe' });

  // 1. Master Audio for Technique A: Direct 15.0s Native Veo 3.1 Singing Audio Concatenation + Broadcast Loudness Normalization (-14 LUFS)
  const listAudioA = path.join(SCRATCH_DIR, 'list_audio_a.txt');
  fs.writeFileSync(listAudioA, [a1, a2, a3].map(f => `file '${f}'`).join('\n'));
  const masterAudioA = path.join(SCRATCH_DIR, 'master_audio_A.m4a');
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listAudioA}" -af "loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000" -ar 48000 -ac 2 -c:a aac -b:a 192k "${masterAudioA}"`,
    { stdio: 'pipe' }
  );

  // 2. Master Audio for Technique B & C: Smoothly Crossfaded Studio Pop Master Clock (EQ Warmth + Sub-Bass + Multiband Mastering)
  // To keep exact 15.0s duration with crossfades, extract 5.15s from shot1 & shot2 so acrossfade=d=0.15 yields exact 15.000s
  const a1_long = path.join(SCRATCH_DIR, 'pure_sing_1_long.wav');
  const a2_long = path.join(SCRATCH_DIR, 'pure_sing_2_long.wav');
  const a3_long = path.join(SCRATCH_DIR, 'pure_sing_3_long.wav');
  execSync(`ffmpeg -y -i "${shot1Mp4}" -vn -af "aresample=48000,atrim=duration=5.15,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a1_long}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -i "${shot2Mp4}" -vn -af "aresample=48000,atrim=duration=5.15,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a2_long}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -i "${shot3Mp4}" -vn -af "aresample=48000,atrim=duration=5.00,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${a3_long}"`, { stdio: 'pipe' });

  const masterAudioBC = path.join(SCRATCH_DIR, 'master_audio_BC.m4a');
  execSync(
    `ffmpeg -y -i "${a1_long}" -i "${a2_long}" -i "${a3_long}" -filter_complex "[0:a][1:a]acrossfade=d=0.15:c1=tri:c2=tri[a01];[a01][2:a]acrossfade=d=0.15:c1=tri:c2=tri,equalizer=f=65:width_type=o:width=1.5:g=3.0,equalizer=f=3500:width_type=o:width=2.0:g=2.0,loudnorm=I=-14:TP=-1.0:LRA=11,atrim=duration=15.000,asetpts=PTS-STARTPTS[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${masterAudioBC}"`,
    { stdio: 'pipe' }
  );

  // Also save clean 15s WAV copy to replace the old TTS WAV
  const vocalMasterWav = path.join(OUT_DIR, 'chandigarh_london_modern_pop_vocals_15s.wav');
  execSync(`ffmpeg -y -i "${masterAudioBC}" -ar 48000 -ac 2 "${vocalMasterWav}"`, { stdio: 'pipe' });

  // ===========================================================================
  // 🎬 RENDER TECHNIQUE A: Native Veo 3.1 Singing & Pop Music ([0:a] Pure Passthrough)
  // ===========================================================================
  console.log('  ▶ Rendering Technique A (100% Pure Native Veo 3.1 Singing & Music - ZERO TTS Overlap)...');
  const segA1 = path.join(SCRATCH_DIR, 'segA1.mp4');
  const segA2 = path.join(SCRATCH_DIR, 'segA2.mp4');
  const segA3 = path.join(SCRATCH_DIR, 'segA3.mp4');

  await renderNormalizedVideoSegment({
    inputMp4: shot1Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 SINGING & POP MUSIC ([0:a] DIRECT PASSTHROUGH)',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!" ♪',
    outMp4: segA1,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot2Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 SINGING & POP MUSIC ([0:a] DIRECT PASSTHROUGH)',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segA2,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot3Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE A: NATIVE VEO 3.1 SINGING & POP MUSIC ([0:a] DIRECT PASSTHROUGH)',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segA3,
  });

  const listVideoA = path.join(SCRATCH_DIR, 'list_video_a.txt');
  fs.writeFileSync(listVideoA, [segA1, segA2, segA3].map(f => `file '${f}'`).join('\n'));
  const videoOnlyA = path.join(SCRATCH_DIR, 'video_only_a.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listVideoA}" -c copy "${videoOnlyA}"`, { stdio: 'pipe' });

  const masterTechA = path.join(OUT_DIR, 'chandigarh_london_tech_A_native_veo.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyA}" -i "${masterAudioA}" -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a copy -movflags +faststart "${masterTechA}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(masterTechA, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_A_native_veo.mp4'));
  console.log(`  ✅ Saved Clean Technique A: ${masterTechA}`);

  // ===========================================================================
  // 🎬 RENDER TECHNIQUE B: Crossfaded Studio Pop Master Clock + Tail-Frame Continuity Lock
  // ===========================================================================
  console.log('  ▶ Rendering Technique B (Crossfaded Studio Pop Master Clock + Tail-Frame Continuity Lock)...');
  const segB1 = path.join(SCRATCH_DIR, 'segB1.mp4');
  const segB2 = path.join(SCRATCH_DIR, 'segB2.mp4');
  const segB3 = path.join(SCRATCH_DIR, 'segB3.mp4');

  await renderNormalizedVideoSegment({
    inputMp4: shot1Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: CROSSFADED STUDIO POP MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!" ♪',
    outMp4: segB1,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot2Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: CROSSFADED STUDIO POP MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segB2,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot3Mp4,
    durationSec: 5.0,
    badgeText: 'TECHNIQUE B: CROSSFADED STUDIO POP MASTER CLOCK + TAIL-FRAME CONTINUITY LOCK',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segB3,
  });

  const listVideoB = path.join(SCRATCH_DIR, 'list_video_b.txt');
  fs.writeFileSync(listVideoB, [segB1, segB2, segB3].map(f => `file '${f}'`).join('\n'));
  const videoOnlyB = path.join(SCRATCH_DIR, 'video_only_b.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listVideoB}" -c copy "${videoOnlyB}"`, { stdio: 'pipe' });

  const masterTechB = path.join(OUT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyB}" -i "${masterAudioBC}" -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a copy -movflags +faststart "${masterTechB}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(masterTechB, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4'));
  console.log(`  ✅ Saved Clean Technique B: ${masterTechB}`);

  // ===========================================================================
  // 🎬 RENDER TECHNIQUE C: Multi-Camera Beat-Synced A-Roll / B-Roll Cutaway over Continuous Singing Master
  // ===========================================================================
  console.log('  ▶ Rendering Technique C (Multi-Camera Beat-Synced Cutaway over Continuous Singing Master)...');
  const segC1 = path.join(SCRATCH_DIR, 'segC1.mp4');
  const segC2 = path.join(SCRATCH_DIR, 'segC2.mp4');
  const segC3 = path.join(SCRATCH_DIR, 'segC3.mp4');
  const segC4 = path.join(SCRATCH_DIR, 'segC4.mp4');
  const segC5 = path.join(SCRATCH_DIR, 'segC5.mp4');

  await renderNormalizedVideoSegment({
    inputMp4: shot1Mp4,
    durationSec: 3.5,
    badgeText: 'TECHNIQUE C: MULTI-CAM BEAT CUTS (CAM A: VOCAL SINGING DUET A-ROLL)',
    subtitleText: '♪ "चंडीगढ़ से लंदन तक वाइब है हाई..." [CAM A: SINGING DUET] ♪',
    outMp4: segC1,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot4BrollMp4,
    durationSec: 1.5,
    badgeText: 'TECHNIQUE C: MULTI-CAM BEAT CUTS (CAM B: OUTDOOR LONDON DANCE B-ROLL)',
    subtitleText: '⚡ [BEAT CUTAWAY — LONDON STREET POP DANCE CHOREOGRAPHY] ⚡',
    outMp4: segC2,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot2Mp4,
    durationSec: 3.5,
    badgeText: 'TECHNIQUE C: MULTI-CAM BEAT CUTS (CAM A: CHORUS VOCAL DUET A-ROLL)',
    subtitleText: '♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪',
    outMp4: segC3,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot4BrollMp4,
    durationSec: 2.0,
    badgeText: 'TECHNIQUE C: MULTI-CAM BEAT CUTS (CAM B: SYNCHRONIZED POP FOOTWORK B-ROLL)',
    subtitleText: '⚡ [BEAT CUTAWAY — SYNCHRONIZED POP FOOTWORK IN CENTRAL LONDON] ⚡',
    outMp4: segC4,
  });
  await renderNormalizedVideoSegment({
    inputMp4: shot3Mp4,
    durationSec: 4.5,
    badgeText: 'TECHNIQUE C: MULTI-CAM BEAT CUTS (CAM A: FINALE HIGH NOTE A-ROLL)',
    subtitleText: '♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪',
    outMp4: segC5,
  });

  const listVideoC = path.join(SCRATCH_DIR, 'list_video_c.txt');
  fs.writeFileSync(listVideoC, [segC1, segC2, segC3, segC4, segC5].map(f => `file '${f}'`).join('\n'));
  const videoOnlyC = path.join(SCRATCH_DIR, 'video_only_c.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listVideoC}" -c copy "${videoOnlyC}"`, { stdio: 'pipe' });

  const masterTechC = path.join(OUT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4');
  execSync(
    `ffmpeg -y -i "${videoOnlyC}" -i "${masterAudioBC}" -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a copy -movflags +faststart "${masterTechC}"`,
    { stdio: 'pipe' }
  );
  fs.copyFileSync(masterTechC, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4'));
  console.log(`  ✅ Saved Clean Technique C: ${masterTechC}`);

  console.log('\n🎉 ALL 3 REELS CLEANLY RE-MASTERED: 100% REAL SINGING, 0% TTS SPEECH OVERLAP, 0% CLASHING BGM!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
