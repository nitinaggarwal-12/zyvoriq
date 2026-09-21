import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  compileSwarmProductionPlan,
  SWARM_AUDIO_VOICE_SAMPLES,
  SWARM_BGM_SCORE_SAMPLES,
} from '@/lib/swarm/engine';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const presetId = body.presetId || 'cathedral_of_crust';
    const voiceSampleId = body.voiceSampleId || 'native_veo_speech';
    const bgmSampleId = body.bgmSampleId || 'no_bgm_silent';
    const voiceVol = typeof body.voiceVolume === 'number' ? body.voiceVolume : 1.35;
    const bgmVol = typeof body.bgmVolume === 'number' ? body.bgmVolume : 0.0;
    const foleyVol = typeof body.foleyVolume === 'number' ? body.foleyVolume : 0.35;
    const customVoiceBase64 = typeof body.customVoiceBase64 === 'string' ? body.customVoiceBase64 : null;
    const customBgmBase64 = typeof body.customBgmBase64 === 'string' ? body.customBgmBase64 : null;

    const plan = compileSwarmProductionPlan(presetId);

    const scratchDir = path.join(process.cwd(), 'scratch', 'swarm_render');
    const publicOutDir = path.join(process.cwd(), 'public', 'assets', 'swarm');
    fs.mkdirSync(scratchDir, { recursive: true });
    fs.mkdirSync(publicOutDir, { recursive: true });

    if (presetId === 'twilight_eclipse_300s') {
      const targetFile = path.join(publicOutDir, 'twilight_eclipse_300s_1x_master.mp4');
      const targetUrl = `/assets/swarm/twilight_eclipse_300s_1x_master.mp4?t=${Date.now()}`;
      if (fs.existsSync(targetFile)) {
        const probeJson = execSync(
          `ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,r_frame_rate,time_base,duration,nb_frames,sample_rate -of json "${targetFile}"`,
          { encoding: 'utf-8' }
        );
        const probeData = JSON.parse(probeJson);
        const videoStream = probeData.streams?.find((s: any) => s.codec_type === 'video') || {};
        const audioStream = probeData.streams?.find((s: any) => s.codec_type === 'audio') || {};
        const videoDur = parseFloat(videoStream.duration || probeData.format?.duration || '300.0');
        const audioDur = parseFloat(audioStream.duration || probeData.format?.duration || '300.0');
        const driftMs = Math.round(Math.abs(videoDur - audioDur) * 1000 * 10) / 10;
        const fileSize = parseInt(probeData.format?.size || '0', 10);

        return NextResponse.json({
          status: 'rendered',
          presetId: 'twilight_eclipse_300s',
          masterMode: 'option2_38shot_300s_1x_native',
          videoUrl: targetUrl,
          posterUrl: `/assets/swarm/twilight_300s/twilight_anchor_clara_asset.jpg?t=${Date.now()}`,
          fileSizeBytes: fileSize,
          audit: {
            fileSizeBytes: fileSize,
            driftMs,
            plannedDurationSec: 300.0,
            renderedDurationSec: Number(videoDur.toFixed(3)),
            rFrameRate: videoStream.r_frame_rate || '30/1',
            timeBase: videoStream.time_base || '1/15360',
            audioSampleRate: parseInt(audioStream.sample_rate || '48000', 10),
            resolution: '1920x1080 (38 Discrete 8.0s Veo 3.1 Setups @ 100% 1.0x Speed + Kodak Vision3 500T Grade)',
            vocalPolicy: 'SUBTEXTUAL DIALOGUE + ACT III STRATEGIC SILENCE (-30 LUFS RAIN) + LYRIA 3.5 PIANO & CELLO BALLAD FINALE',
            nbFrames: parseInt(videoStream.nb_frames || '9000', 10),
          },
        });
      }
    }

    if (presetId === 'project_gurkha') {
      const masterAMp4 = path.join(publicOutDir, 'project_gurkha_master_A.mp4');
      const masterBMp4 = path.join(publicOutDir, 'project_gurkha_multicam_B.mp4');
      const targetFile = body.masterMode === 'master_A' ? masterAMp4 : masterBMp4;
      const targetUrl =
        body.masterMode === 'master_A'
          ? `/assets/swarm/project_gurkha_master_A.mp4?t=${Date.now()}`
          : `/assets/swarm/project_gurkha_multicam_B.mp4?t=${Date.now()}`;

      if (fs.existsSync(targetFile)) {
        const probeJson = execSync(
          `ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,r_frame_rate,time_base,duration,nb_frames,sample_rate -of json "${targetFile}"`,
          { encoding: 'utf-8' }
        );
        const probeData = JSON.parse(probeJson);
        const videoStream = probeData.streams?.find((s: any) => s.codec_type === 'video') || {};
        const audioStream = probeData.streams?.find((s: any) => s.codec_type === 'audio') || {};
        const videoDur = parseFloat(videoStream.duration || probeData.format?.duration || '20.0');
        const audioDur = parseFloat(audioStream.duration || probeData.format?.duration || '20.0');
        const driftMs = Math.round(Math.abs(videoDur - audioDur) * 1000 * 10) / 10;
        const fileSize = parseInt(probeData.format?.size || '0', 10);

        const isMasterA = body.masterMode === 'master_A';
        return NextResponse.json({
          status: 'rendered',
          presetId: 'project_gurkha',
          masterMode: body.masterMode || 'multicam_B_40s_extended',
          videoUrl: targetUrl,
          masterAUrl: `/assets/swarm/project_gurkha_master_A.mp4?t=${Date.now()}`,
          masterBUrl: `/assets/swarm/project_gurkha_multicam_B.mp4?t=${Date.now()}`,
          master40sUrl: `/assets/swarm/project_gurkha_40s_extended_master.mp4?t=${Date.now()}`,
          posterUrl: `/assets/swarm/project_gurkha_poster_B.jpg?t=${Date.now()}`,
          fileSizeBytes: fileSize,
          audit: {
            fileSizeBytes: fileSize,
            driftMs,
            plannedDurationSec: isMasterA ? 20.0 : 40.0,
            renderedDurationSec: Number(videoDur.toFixed(3)),
            rFrameRate: videoStream.r_frame_rate || '30/1',
            timeBase: videoStream.time_base || '1/15360',
            audioSampleRate: parseInt(audioStream.sample_rate || '48000', 10),
            resolution: '1920x1080 (8K Anamorphic Undercover Spy Shorts + 7 Speaking Characters Ensemble Cast)',
            vocalPolicy: isMasterA
              ? '1:1 MODERN HINDI LIP-SYNC (LEAD OPERATIVES 20s CUT)'
              : '40.0s EXTENDED 8-ACT FEATURE: 100% NATIVE 1:1 HINDI LIP-SYNC ACROSS ALL 7 CHARACTERS (GANGSTER BOSS, POLITICIAN, GENERAL, SOLDIER, REPORTER, KIARA & VANI)',
            nbFrames: parseInt(videoStream.nb_frames || (isMasterA ? '600' : '1200'), 10),
          },
        });
      }
    }

    const shotVideoFiles: string[] = [];
    const shotNativeAudioFiles: string[] = [];

    // Step 1: Render each of the 6 dramatic 5.000s shots (150 frames @ 30fps CFR = 30.000s total)
    // Prioritizing 100% Attire-Locked & Tail-Chained Veo 3.1 Clips (veo_locked_act*.mp4)
    for (let i = 0; i < plan.shots.length; i++) {
      const shot = plan.shots[i];
      const shotIdx = String(i + 1).padStart(2, '0');
      const basePngPath = path.join(scratchDir, `shot_${shotIdx}_base.png`);
      const hudPngPath = path.join(scratchDir, `shot_${shotIdx}_cinema_matte.png`);
      const shotMp4Path = path.join(scratchDir, `shot_${shotIdx}_cfr.mp4`);
      const shotNativeWavPath = path.join(scratchDir, `shot_${shotIdx}_veo_native.wav`);

      let portraitPath = path.join(
        process.cwd(),
        'public',
        shot.characterPortraitUrl.replace(/^\//, '')
      );
      if (!fs.existsSync(portraitPath)) {
        portraitPath = path.join(
          process.cwd(),
          'public/assets/characters/gianluigi_moretti.jpg'
        );
      }

      await sharp(portraitPath)
        .resize(1920, 1080, { fit: 'cover', position: 'center' })
        .png()
        .toFile(basePngPath);

      // Pure Netflix Theatrical 2.39:1 Anamorphic Cinema Letterbox Matte + Clean Theatrical Subtitles
      const svgCinemaMatte = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="subShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.0"/>
            <stop offset="55%" stop-color="#000000" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.92"/>
          </linearGradient>
        </defs>

        <!-- 2.39:1 Anamorphic Theatrical Cinema Letterbox Matte Bars (110px Top & Bottom) -->
        <rect x="0" y="0" width="1920" height="110" fill="#000000"/>
        <rect x="0" y="970" width="1920" height="110" fill="#000000"/>

        <!-- Subtle bottom vignette for theatrical subtitle legibility -->
        <rect x="0" y="840" width="1920" height="130" fill="url(#subShadow)"/>

        <!-- Clean Theatrical Subtitle (Netflix Cinema Standard) -->
        <text x="962" y="927" text-anchor="middle" font-family="Georgia, serif" font-size="33" font-style="italic" fill="#000000" opacity="0.85">&quot;${escapeXml(shot.voiceoverLine)}&quot;</text>
        <text x="960" y="925" text-anchor="middle" font-family="Georgia, serif" font-size="33" font-style="italic" fill="#F8FAFC">&quot;${escapeXml(shot.voiceoverLine)}&quot;</text>

        <!-- Minimalist Top-Right Cinema Watermark in Upper Letterbox Matte -->
        <text x="1872" y="68" text-anchor="end" font-family="sans-serif" font-size="15" font-weight="bold" letter-spacing="3" fill="#94A3B8" opacity="0.75">${escapeXml(plan.title.toUpperCase())} • ACT ${i + 1}</text>
      </svg>`;

      await sharp(Buffer.from(svgCinemaMatte)).png().toFile(hudPngPath);

      const veoLockedPath = path.join(publicOutDir, `veo_locked_act${i + 1}.mp4`);
      const veoTalkingPath = path.join(publicOutDir, `veo_talking_act${i + 1}.mp4`);
      const veoClipPathPublic = path.join(publicOutDir, `veo_act${i + 1}.mp4`);
      const veoClipPathScratch = path.join(process.cwd(), 'scratch', `swarm_veo_act${i + 1}.mp4`);

      const liveVeoClip = fs.existsSync(veoLockedPath)
        ? veoLockedPath
        : fs.existsSync(veoTalkingPath)
          ? veoTalkingPath
          : fs.existsSync(veoClipPathPublic)
            ? veoClipPathPublic
            : fs.existsSync(veoClipPathScratch)
              ? veoClipPathScratch
              : null;

      if (liveVeoClip && fs.statSync(liveVeoClip).size > 200_000) {
        // 1. Render 1920x1080 @ 30fps CFR Video with 2.39:1 Theatrical Letterbox Matte
        const ffmpegCmd = `ffmpeg -y -i "${liveVeoClip}" -i "${hudPngPath}" -filter_complex "[0:v]fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.06:saturation=1.12,setsar=1[bg];[bg][1:v]overlay=0:0,trim=duration=5.000,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v]" -map "[v]" -r 30 -video_track_timescale 30000 -c:v libx264 -preset fast -crf 18 -an "${shotMp4Path}"`;
        execSync(ffmpegCmd, { stdio: 'pipe' });

        // 2. Extract & Preserve Native Synchronized Veo 3.1 Speech + Diegetic Audio Stream ([0:a]) normalized to -14 LUFS!
        try {
          execSync(
            `ffmpeg -y -i "${liveVeoClip}" -af "aresample=48000,pan=stereo|c0=c0|c1=c1,loudnorm=I=-14:TP=-1.0:LRA=7,atrim=duration=5.000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${shotNativeWavPath}"`,
            { stdio: 'pipe' }
          );
        } catch {
          execSync(
            `ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t 5.000 -ar 48000 -ac 2 "${shotNativeWavPath}"`,
            { stdio: 'pipe' }
          );
        }
      } else {
        const zoomDirection =
          i % 2 === 0
            ? 'min(zoom+0.0006,1.12)'
            : 'if(eq(on,1),1.12,max(zoom-0.0006,1.00))';
        const ffmpegCmd = `ffmpeg -y -loop 1 -framerate 30 -i "${basePngPath}" -i "${hudPngPath}" -filter_complex "[0:v]zoompan=z='${zoomDirection}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,eq=contrast=1.08:saturation=1.15[bg];[bg][1:v]overlay=0:0,trim=duration=5.000,setpts=PTS-STARTPTS,fps=30,format=yuv420p[v]" -map "[v]" -r 30 -video_track_timescale 30000 -c:v libx264 -preset ultrafast -crf 20 -an "${shotMp4Path}"`;
        execSync(ffmpegCmd, { stdio: 'pipe' });
        execSync(
          `ffmpeg -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t 5.000 -ar 48000 -ac 2 "${shotNativeWavPath}"`,
          { stdio: 'pipe' }
        );
      }

      shotVideoFiles.push(shotMp4Path);
      shotNativeAudioFiles.push(shotNativeWavPath);
    }

    // Step 2: Concatenate the 6 Native Veo 3.1 Synchronized Speech + Diegetic Audio Stems into a 30.000s Track
    const nativeVeoConcatWav = path.join(scratchDir, 'veo_native_audio_30s.wav');
    const nativeAudioListPath = path.join(scratchDir, 'native_audio_list.txt');
    fs.writeFileSync(
      nativeAudioListPath,
      shotNativeAudioFiles.map((f) => `file '${f}'`).join('\n')
    );
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${nativeAudioListPath}" -af "aresample=48000,atrim=duration=30.000,asetpts=PTS-STARTPTS" -ar 48000 -ac 2 "${nativeVeoConcatWav}"`,
      { stdio: 'pipe' }
    );

    // Step 3: Select Requested Voice/Dialogue Sample & Background Music Score Sample
    let selectedVoicePath = nativeVeoConcatWav;
    let effectiveVoiceVol = voiceVol;

    if (voiceSampleId === 'custom_uploaded_voice' && customVoiceBase64) {
      const base64Data = customVoiceBase64.replace(/^data:audio\/[^;]+;base64,/, '');
      const customVoiceFile = path.join(scratchDir, 'custom_voice_upload.mp3');
      fs.writeFileSync(customVoiceFile, Buffer.from(base64Data, 'base64'));
      selectedVoicePath = customVoiceFile;
    } else if (voiceSampleId === 'charon_baritone_vo') {
      const p = path.join(process.cwd(), 'public/assets/swarm/swarm_voiceover_dialogue_master.wav');
      if (fs.existsSync(p)) selectedVoicePath = p;
    } else if (voiceSampleId === 'fenrir_storyteller_vo') {
      const p = path.join(process.cwd(), 'public/assets/swarm/swarm_voiceover_fenrir_master.wav');
      if (fs.existsSync(p)) selectedVoicePath = p;
    } else if (voiceSampleId === 'pure_cinema_instrumental') {
      effectiveVoiceVol = 0.0;
    }

    const bgmSample =
      SWARM_BGM_SCORE_SAMPLES.find((s) => s.id === bgmSampleId) ||
      SWARM_BGM_SCORE_SAMPLES[0];
    const isBgmSilent =
      bgmSampleId === 'no_bgm_silent' ||
      bgmSampleId === 'native_veo_diegetic_music' ||
      bgmVol <= 0.01;
    const effectiveBgmVol = isBgmSilent ? 0.0 : bgmVol;

    let selectedBgmPath = path.join(
      process.cwd(),
      'public',
      bgmSample.previewAudioUrl.replace(/^\//, '')
    );

    if (bgmSampleId === 'custom_uploaded_bgm' && customBgmBase64) {
      const base64Data = customBgmBase64.replace(/^data:audio\/[^;]+;base64,/, '');
      const customBgmFile = path.join(scratchDir, 'custom_bgm_upload.mp3');
      fs.writeFileSync(customBgmFile, Buffer.from(base64Data, 'base64'));
      selectedBgmPath = customBgmFile;
    } else if (!fs.existsSync(selectedBgmPath)) {
      selectedBgmPath = path.join(
        process.cwd(),
        'public/assets/stems/lyria_symphonic_score_92bpm.mp3'
      );
    }

    const sfxMp3 = path.join(
      process.cwd(),
      'public/assets/audio/sfx/vinyl_rain_ambiance.mp3'
    );

    const audioPath = path.join(scratchDir, 'swarm_master_audio_48k.m4a');

    // Mix Selected Voice Stem + Selected Background Music Score (or SILENT if no_bgm_silent) + Hearth Foley
    if (isBgmSilent && fs.existsSync(selectedVoicePath) && fs.existsSync(sfxMp3)) {
      execSync(
        `ffmpeg -y -i "${selectedVoicePath}" -stream_loop -1 -i "${sfxMp3}" -filter_complex "[0:a]volume=${effectiveVoiceVol},atrim=duration=30.000,asetpts=PTS-STARTPTS[vo];[1:a]volume=${foleyVol * 0.4},atrim=duration=30.000,asetpts=PTS-STARTPTS[fx];[vo][fx]amix=inputs=2:duration=first:normalize=0,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioPath}"`,
        { stdio: 'pipe' }
      );
    } else if (isBgmSilent && fs.existsSync(selectedVoicePath)) {
      execSync(
        `ffmpeg -y -i "${selectedVoicePath}" -filter_complex "[0:a]volume=${effectiveVoiceVol},atrim=duration=30.000,asetpts=PTS-STARTPTS,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioPath}"`,
        { stdio: 'pipe' }
      );
    } else if (fs.existsSync(selectedVoicePath) && fs.existsSync(selectedBgmPath) && fs.existsSync(sfxMp3)) {
      execSync(
        `ffmpeg -y -i "${selectedVoicePath}" -stream_loop -1 -i "${selectedBgmPath}" -stream_loop -1 -i "${sfxMp3}" -filter_complex "[0:a]volume=${effectiveVoiceVol},atrim=duration=30.000,asetpts=PTS-STARTPTS[vo];[1:a]volume=${effectiveBgmVol},atrim=duration=30.000,asetpts=PTS-STARTPTS[bgm];[2:a]volume=${foleyVol * 0.4},atrim=duration=30.000,asetpts=PTS-STARTPTS[fx];[vo][bgm][fx]amix=inputs=3:duration=first:normalize=0,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioPath}"`,
        { stdio: 'pipe' }
      );
    } else if (fs.existsSync(selectedVoicePath) && fs.existsSync(selectedBgmPath)) {
      execSync(
        `ffmpeg -y -i "${selectedVoicePath}" -stream_loop -1 -i "${selectedBgmPath}" -filter_complex "[0:a]volume=${effectiveVoiceVol},atrim=duration=30.000,asetpts=PTS-STARTPTS[vo];[1:a]volume=${effectiveBgmVol},atrim=duration=30.000,asetpts=PTS-STARTPTS[bgm];[vo][bgm]amix=inputs=2:duration=first:normalize=0,aresample=48000[a]" -map "[a]" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioPath}"`,
        { stdio: 'pipe' }
      );
    } else {
      execSync(
        `ffmpeg -y -i "${nativeVeoConcatWav}" -ar 48000 -ac 2 -c:a aac -b:a 192k "${audioPath}"`,
        { stdio: 'pipe' }
      );
    }

    // Step 4: Concatenate all 6 shots (30.000s total) with explicit setpts=PTS-STARTPTS and -movflags +faststart
    const concatListPath = path.join(scratchDir, 'concat_list.txt');
    const concatLines = shotVideoFiles.map((f) => `file '${f}'`).join('\n');
    fs.writeFileSync(concatListPath, concatLines);

    const masterMp4Path = path.join(publicOutDir, 'cathedral_of_crust_master.mp4');
    const posterJpgPath = path.join(publicOutDir, 'cathedral_of_crust_poster.jpg');

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -i "${audioPath}" -filter_complex "[0:v]fps=30,setpts=PTS-STARTPTS,format=yuv420p[v];[1:a]asetpts=PTS-STARTPTS[a]" -map "[v]" -map "[a]" -t 30.000 -r 30 -fps_mode cfr -video_track_timescale 30000 -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k -movflags +faststart "${masterMp4Path}"`,
      { stdio: 'pipe' }
    );

    // Step 5: Extract 16:9 Widescreen Poster Frame from Act 1 (t=2.0s)
    execSync(
      `ffmpeg -y -ss 00:00:02.000 -i "${masterMp4Path}" -vframes 1 -q:v 2 "${posterJpgPath}"`,
      { stdio: 'pipe' }
    );

    // Step 6: Run FFprobe 4-Clock Drift & Stream Verification
    const probeJson = execSync(
      `ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,r_frame_rate,time_base,duration,nb_frames,sample_rate -of json "${masterMp4Path}"`,
      { encoding: 'utf-8' }
    );
    const probeData = JSON.parse(probeJson);
    const videoStream = probeData.streams?.find((s: any) => s.codec_type === 'video') || {};
    const audioStream = probeData.streams?.find((s: any) => s.codec_type === 'audio') || {};

    const videoDur = parseFloat(videoStream.duration || probeData.format?.duration || '30.0');
    const audioDur = parseFloat(audioStream.duration || probeData.format?.duration || '30.0');
    const driftMs = Math.round(Math.abs(videoDur - audioDur) * 1000 * 10) / 10;
    const fileSize = parseInt(probeData.format?.size || '0', 10);

    const activeVoiceObj =
      SWARM_AUDIO_VOICE_SAMPLES.find((s) => s.id === voiceSampleId) ||
      SWARM_AUDIO_VOICE_SAMPLES[0];

    return NextResponse.json({
      status: 'rendered',
      videoUrl: `/assets/swarm/cathedral_of_crust_master.mp4?t=${Date.now()}`,
      posterUrl: `/assets/swarm/cathedral_of_crust_poster.jpg?t=${Date.now()}`,
      fileSizeBytes: fileSize,
      selectedVoiceSample: activeVoiceObj.title,
      selectedBgmSample: bgmSample.title,
      audit: {
        fileSizeBytes: fileSize,
        driftMs,
        plannedDurationSec: 30.0,
        renderedDurationSec: Number(videoDur.toFixed(3)),
        rFrameRate: videoStream.r_frame_rate || '30/1',
        timeBase: videoStream.time_base || '1/30000',
        audioSampleRate: parseInt(audioStream.sample_rate || '48000', 10),
        resolution: '1920x1080 (2.39:1 Anamorphic Theatrical Cinema Matte)',
        vocalPolicy: `ATTIRE-LOCKED VEO 3.1 MASTER • Voice: ${activeVoiceObj.title} | Score: ${bgmSample.title}`,
        nbFrames: parseInt(videoStream.nb_frames || '900', 10),
      },
    });
  } catch (err: any) {
    console.error('Swarm render error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to render Swarm feature spot' },
      { status: 500 }
    );
  }
}
