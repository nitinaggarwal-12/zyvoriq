import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'swarm');
const SCRATCH_DIR = path.join(process.cwd(), 'scratch', 'omni12_director_remediated');
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

async function createSubtitlePng(text, outPng) {
  const svg = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <text x="960" y="925" font-family="Georgia, serif" font-size="31" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle" stroke="#000000" stroke-width="4" paint-order="stroke fill">${escapeXml(text)}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPng);
  return outPng;
}

async function createLetterboxHeaderPng(badgeText, outPng) {
  const svg = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="1920" height="105" fill="#000000" />
    <rect x="0" y="975" width="1920" height="105" fill="#000000" />
    <text x="50" y="60" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" fill="#38BDF8" letter-spacing="1">${escapeXml(badgeText)}</text>
    <text x="1870" y="60" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#F59E0B" text-anchor="end" letter-spacing="1">OMNI 1.2 CERTIFIED • EQUALIZED RESOLUTION &amp; PACE</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPng);
  return outPng;
}

async function main() {
  console.log('================================================================================');
  console.log('🎬 EXECUTING GOOGLE OMNI 1.2 DIRECTOR REMEDIATION (GEMINI 2.5 PRO PRESCRIPTION)');
  console.log('   1. Resolution Equalization: CAS + Unsharp Mask on Shots 2, 3, & 4 to match Shot 1');
  console.log('   2. Pace Normalization: 1.25x Optical Flow Slowdown (minterpolate) on Shots 2, 3, & 4');
  console.log('   3. Continuity Lock: Unbroken 15.0s Song Master + 0.50s Butter-Smooth xfade Dissolves');
  console.log('================================================================================\n');

  const shot1Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot1_singing.mp4');
  const shot2Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot2_chorus.mp4');
  const shot3Mp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot3_finale.mp4');
  const shot4BrollMp4 = path.join(OUT_DIR, 'chandigarh_london_pop_shot4_broll.mp4');
  const continuousPopInstMp3 = path.join(process.cwd(), 'public/renders/yt/yt_spain_pool_party_omni_hybrid/song.mp3');

  // ---------------------------------------------------------------------------
  // STEP 1: Build Unbroken 15.0s Continuous Audio Masters (100% Continuous Flow)
  // ---------------------------------------------------------------------------
  console.log('🎵 [Step 1] Building Unbroken 15.0s Audio Masters with 0.50s Equal-Power Crossfades...');
  const vocalFilter = 'highpass=f=230,lowpass=f=7500,equalizer=f=2500:width_type=o:width=1.5:g=3.5,acompressor=threshold=-18dB:ratio=3:attack=10:release=100,aresample=48000';

  const voc1 = path.join(SCRATCH_DIR, 'voc1.wav');
  const voc2 = path.join(SCRATCH_DIR, 'voc2.wav');
  const voc3 = path.join(SCRATCH_DIR, 'voc3.wav');

  // Extract 5.50s from Shot 1, 5.50s from Shot 2, 5.00s from Shot 3 -> with two 0.50s crossfades = 15.000s exact!
  execSync(`ffmpeg -y -ss 0.35 -t 5.50 -i "${shot1Mp4}" -vn -af "${vocalFilter},asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${voc1}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.00 -t 5.50 -i "${shot2Mp4}" -vn -af "${vocalFilter},asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${voc2}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.00 -t 5.00 -i "${shot3Mp4}" -vn -af "${vocalFilter},asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${voc3}"`, { stdio: 'pipe' });

  const continuousVocalsWav = path.join(SCRATCH_DIR, 'continuous_vocals_15s.wav');
  execSync(
    `ffmpeg -y -i "${voc1}" -i "${voc2}" -i "${voc3}" -filter_complex "[0:a][1:a]acrossfade=d=0.50:c1=esin:c2=esin[v01];[v01][2:a]acrossfade=d=0.50:c1=esin:c2=esin,atrim=duration=15.000,asetpts=PTS-STARTPTS[v]" -map "[v]" -ar 48000 -ac 2 "${continuousVocalsWav}"`,
    { stdio: 'pipe' }
  );

  // Master Song for Technique B & C: Unbroken 15.0s Modern Pop Instrumental + Smoothly Crossfaded Female Singing
  const continuousMasterSongM4a = path.join(SCRATCH_DIR, 'continuous_master_song_15s.m4a');
  execSync(
    `ffmpeg -y -i "${continuousVocalsWav}" -i "${continuousPopInstMp3}" -filter_complex "[0:a]volume=1.65[voc];[1:a]atrim=duration=15.000,asetpts=PTS-STARTPTS,volume=0.85[inst];[voc][inst]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${continuousMasterSongM4a}"`,
    { stdio: 'pipe' }
  );

  // Master Song for Technique A: Native Veo Audio with 0.50s Equal-Power Crossfades + Continuous Pop Beat Glue
  const raw1 = path.join(SCRATCH_DIR, 'raw1.wav');
  const raw2 = path.join(SCRATCH_DIR, 'raw2.wav');
  const raw3 = path.join(SCRATCH_DIR, 'raw3.wav');
  execSync(`ffmpeg -y -ss 0.35 -t 5.50 -i "${shot1Mp4}" -vn -af "aresample=48000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${raw1}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.00 -t 5.50 -i "${shot2Mp4}" -vn -af "aresample=48000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${raw2}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.00 -t 5.00 -i "${shot3Mp4}" -vn -af "aresample=48000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${raw3}"`, { stdio: 'pipe' });

  const techAAudioM4a = path.join(SCRATCH_DIR, 'techA_audio_15s.m4a');
  execSync(
    `ffmpeg -y -i "${raw1}" -i "${raw2}" -i "${raw3}" -i "${continuousPopInstMp3}" -filter_complex "[0:a][1:a]acrossfade=d=0.50:c1=esin:c2=esin[r01];[r01][2:a]acrossfade=d=0.50:c1=esin:c2=esin,volume=1.35[veo];[3:a]atrim=duration=15.000,asetpts=PTS-STARTPTS,volume=0.55[glue];[veo][glue]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${techAAudioM4a}"`,
    { stdio: 'pipe' }
  );

  // ---------------------------------------------------------------------------
  // STEP 2: Apply Omni 1.2 Resolution & Pacing Equalization to Video Clips
  // ---------------------------------------------------------------------------
  console.log('🎥 [Step 2] Applying Omni 1.2 Optical Flow 1.25x Pace Slowdown + CAS/Unsharp Resolution Matching...');
  const v1 = path.join(SCRATCH_DIR, 'v1_baseline.mp4');
  const v2 = path.join(SCRATCH_DIR, 'v2_equalized.mp4');
  const v3 = path.join(SCRATCH_DIR, 'v3_equalized.mp4');
  const v4 = path.join(SCRATCH_DIR, 'v4_equalized.mp4');

  // Shot 1 is the baseline (native graceful pace + 8K anchor clarity), lightly polished for 1080p 30fps
  execSync(
    `ffmpeg -y -ss 0.35 -t 5.50 -i "${shot1Mp4}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,unsharp=5:5:0.3:5:5:0.0,fps=30,format=yuv420p" -an -c:v libx264 -preset fast -crf 17 "${v1}"`,
    { stdio: 'pipe' }
  );

  // Shot 2, Shot 3, Shot 4: Apply Omni 1.2 Prescription:
  // - setpts=1.25*PTS (slows down frantic motion by 25% to match Shot 1's graceful pace)
  // - minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir (optical flow interpolation for silky 30fps motion)
  // - unsharp=5:5:0.85:5:5:0.0,cas=strength=0.35,eq=contrast=1.04:saturation=1.05 (restores generation-loss edge sharpness to match Shot 1)
  const omniEqualizeFilter = 'setpts=1.25*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,unsharp=5:5:0.85:5:5:0.0,cas=strength=0.35,eq=contrast=1.04:saturation=1.05,format=yuv420p';

  console.log('  ⏳ Optical-flow retiming & sharpening Shot 2 (Chorus)...');
  execSync(
    `ffmpeg -y -i "${shot2Mp4}" -vf "${omniEqualizeFilter}" -t 5.50 -an -c:v libx264 -preset fast -crf 17 "${v2}"`,
    { stdio: 'pipe' }
  );

  console.log('  ⏳ Optical-flow retiming & sharpening Shot 3 (Finale)...');
  execSync(
    `ffmpeg -y -i "${shot3Mp4}" -vf "${omniEqualizeFilter}" -t 5.00 -an -c:v libx264 -preset fast -crf 17 "${v3}"`,
    { stdio: 'pipe' }
  );

  console.log('  ⏳ Optical-flow retiming & sharpening Shot 4 (Dance B-Roll)...');
  execSync(
    `ffmpeg -y -i "${shot4BrollMp4}" -vf "${omniEqualizeFilter}" -t 6.00 -an -c:v libx264 -preset fast -crf 17 "${v4}"`,
    { stdio: 'pipe' }
  );

  // Subtitle PNGs
  const sub1Png = await createSubtitlePng('♪ "चंडीगढ़ से लंदन तक वाइब है हाई, मॉडर्न पॉप बीट पे चमके ये स्काई!" ♪', path.join(SCRATCH_DIR, 'sub1.png'));
  const sub2Png = await createSubtitlePng('♪ "शॉर्ट स्कर्ट क्रॉप टॉप स्टाइल सुपर कूल, लंदन की स्ट्रीट्स पे हम करें रूल!" ♪', path.join(SCRATCH_DIR, 'sub2.png'));
  const sub3Png = await createSubtitlePng('♪ "नियोन लाइट्स और ये पॉप वाली बीट, चंडीगढ़ गर्ल्स का स्वैग सबसे स्वीट!" ♪', path.join(SCRATCH_DIR, 'sub3.png'));

  async function finalizeMasterReel({ smoothVideoMp4, audioM4a, badgeText, outMasterMp4 }) {
    const headerPng = await createLetterboxHeaderPng(badgeText, path.join(SCRATCH_DIR, `hdr_${path.basename(outMasterMp4, '.mp4')}.png`));
    execSync(
      `ffmpeg -y -i "${smoothVideoMp4}" -i "${headerPng}" -loop 1 -t 15 -i "${sub1Png}" -loop 1 -t 15 -i "${sub2Png}" -loop 1 -t 15 -i "${sub3Png}" -i "${audioM4a}" -filter_complex "` +
      `[2:v]fade=t=in:st=0.2:d=0.40:alpha=1,fade=t=out:st=4.6:d=0.40:alpha=1[s1];` +
      `[3:v]fade=t=in:st=5.0:d=0.40:alpha=1,fade=t=out:st=9.8:d=0.40:alpha=1[s2];` +
      `[4:v]fade=t=in:st=10.2:d=0.40:alpha=1,fade=t=out:st=14.6:d=0.40:alpha=1[s3];` +
      `[0:v][1:v]overlay=0:0[v_hdr];` +
      `[v_hdr][s1]overlay=0:0:enable='between(t,0.1,5.0)'[v_s1];` +
      `[v_s1][s2]overlay=0:0:enable='between(t,5.0,10.2)'[v_s2];` +
      `[v_s2][s3]overlay=0:0:enable='between(t,10.2,15.0)',format=yuv420p[v_out]` +
      `" -map "[v_out]" -map 5:a:0 -r 30 -fps_mode cfr -c:v libx264 -crf 22 -preset veryfast -c:a copy -t 15.000 -movflags +faststart "${outMasterMp4}"`,
      { stdio: 'pipe' }
    );
  }

  // ===========================================================================
  // 🎬 STEP 3: Assemble 0.50s Butter-Smooth xfade Sequences & Render All 3 Reels
  // ===========================================================================
  console.log('  ▶ [Technique A & B] Assembling 0.50s xfade Sequence (5.50s + 5.50s - 0.50s + 5.00s - 0.50s = 15.000s)...');
  const xfadeVideoAB = path.join(SCRATCH_DIR, 'xfade_video_AB.mp4');
  // Offset 1 = 5.50 - 0.50 = 5.00s
  // Offset 2 = 5.00 + 5.50 - 0.50 = 10.00s
  execSync(
    `ffmpeg -y -i "${v1}" -i "${v2}" -i "${v3}" -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.50:offset=5.00[v01];[v01][2:v]xfade=transition=fade:duration=0.50:offset=10.00,format=yuv420p[v]" -map "[v]" -r 30 -c:v libx264 -preset fast -crf 17 "${xfadeVideoAB}"`,
    { stdio: 'pipe' }
  );

  const masterTechA = path.join(OUT_DIR, 'chandigarh_london_tech_A_native_veo.mp4');
  await finalizeMasterReel({
    smoothVideoMp4: xfadeVideoAB,
    audioM4a: techAAudioM4a,
    badgeText: 'TECHNIQUE A: OMNI 1.2 EQUALIZED PACE & RESOLUTION + NATIVE VEO SINGING',
    outMasterMp4: masterTechA,
  });
  fs.copyFileSync(masterTechA, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_A_native_veo.mp4'));
  console.log(`  ✅ Saved Omni-Remediated Technique A: ${masterTechA}`);

  const masterTechB = path.join(OUT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4');
  await finalizeMasterReel({
    smoothVideoMp4: xfadeVideoAB,
    audioM4a: continuousMasterSongM4a,
    badgeText: 'TECHNIQUE B: OMNI 1.2 EQUALIZED PACE & RESOLUTION + UNBROKEN 15S SONG MASTER',
    outMasterMp4: masterTechB,
  });
  fs.copyFileSync(masterTechB, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_B_viseme_master.mp4'));
  console.log(`  ✅ Saved Omni-Remediated Technique B: ${masterTechB}`);

  // Technique C: Multi-Camera Beat-Synced Smooth xfade Cutaway with Equalized Resolution & Pace
  console.log('  ▶ [Technique C] Assembling Multi-Camera Smooth xfade Cutaway with Equalized Pace & Sharpness...');
  const c1 = path.join(SCRATCH_DIR, 'c1.mp4');
  const c2 = path.join(SCRATCH_DIR, 'c2.mp4');
  const c3 = path.join(SCRATCH_DIR, 'c3.mp4');
  const c4 = path.join(SCRATCH_DIR, 'c4.mp4');
  const c5 = path.join(SCRATCH_DIR, 'c5.mp4');

  execSync(`ffmpeg -y -ss 0.0 -t 3.85 -i "${v1}" -c copy "${c1}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.0 -t 2.10 -i "${v4}" -c copy "${c2}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.0 -t 3.85 -i "${v2}" -c copy "${c3}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 2.2 -t 2.25 -i "${v4}" -c copy "${c4}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 0.0 -t 4.35 -i "${v3}" -c copy "${c5}"`, { stdio: 'pipe' });

  const xfadeVideoC = path.join(SCRATCH_DIR, 'xfade_video_C.mp4');
  execSync(
    `ffmpeg -y -i "${c1}" -i "${c2}" -i "${c3}" -i "${c4}" -i "${c5}" -filter_complex "` +
    `[0:v][1:v]xfade=transition=smoothleft:duration=0.35:offset=3.50[vc1];` +
    `[vc1][2:v]xfade=transition=smoothright:duration=0.35:offset=5.25[vc2];` +
    `[vc2][3:v]xfade=transition=smoothleft:duration=0.35:offset=8.75[vc3];` +
    `[vc3][4:v]xfade=transition=fade:duration=0.35:offset=10.65,format=yuv420p[v]` +
    `" -map "[v]" -r 30 -c:v libx264 -preset fast -crf 17 "${xfadeVideoC}"`,
    { stdio: 'pipe' }
  );

  const masterTechC = path.join(OUT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4');
  await finalizeMasterReel({
    smoothVideoMp4: xfadeVideoC,
    audioM4a: continuousMasterSongM4a,
    badgeText: 'TECHNIQUE C: OMNI 1.2 MULTI-CAM BEAT DISSOLVES + EQUALIZED PACE & RESOLUTION',
    outMasterMp4: masterTechC,
  });
  fs.copyFileSync(masterTechC, path.join(ARTIFACT_DIR, 'chandigarh_london_tech_C_multicam_beatcut.mp4'));
  console.log(`  ✅ Saved Omni-Remediated Technique C: ${masterTechC}`);

  // Extract updated poster frames from the newly equalized videos
  execSync(`ffmpeg -y -ss 2.0 -i "${masterTechA}" -vframes 1 -q:v 2 "${path.join(OUT_DIR, 'chandigarh_london_frame_tech_A.jpg')}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 6.5 -i "${masterTechB}" -vframes 1 -q:v 2 "${path.join(OUT_DIR, 'chandigarh_london_frame_tech_B.jpg')}"`, { stdio: 'pipe' });
  execSync(`ffmpeg -y -ss 4.2 -i "${masterTechC}" -vframes 1 -q:v 2 "${path.join(OUT_DIR, 'chandigarh_london_frame_tech_C_broll.jpg')}"`, { stdio: 'pipe' });
  fs.copyFileSync(path.join(OUT_DIR, 'chandigarh_london_frame_tech_B.jpg'), path.join(ARTIFACT_DIR, 'chandigarh_london_frame_tech_B.jpg'));
  fs.copyFileSync(path.join(OUT_DIR, 'chandigarh_london_frame_tech_C_broll.jpg'), path.join(ARTIFACT_DIR, 'chandigarh_london_frame_tech_C_broll.jpg'));

  console.log('\n🎉 GOOGLE OMNI 1.2 DIRECTOR REMEDIATION COMPLETE ACROSS ALL 3 REELS!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
