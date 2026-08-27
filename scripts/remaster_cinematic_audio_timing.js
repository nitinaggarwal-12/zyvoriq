const { execSync } = require('child_process');

console.log("=============================================================================");
console.log("🌸 REMASTERING 6 MULTILINGUAL DUBS WITH 850ms VISUAL ESTABLISHING WINDOWS");
console.log("=============================================================================");

execSync(`ssh nitinagga.c.googlers.com "
  cd ~/zyvoriq
  mkdir -p public/assets/audio/anime_dubs

  LANGS=('ja' 'en' 'es' 'fr' 'de' 'hi')
  for L in \"\${LANGS[@]}\"; do
    echo \"🎬 Precision Timing Master for [\$L]...\"
    
    # Act 1: Aoi speaks from 0.85s to ~6.5s (850ms visual establishing buffer after 0.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_1.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act1_v2.wav

    # Act 2: Ren speaks from 8.85s to ~14.8s (850ms visual establishing buffer after 8.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_2.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act2_v2.wav

    # Act 3: Aoi speaks from 16.85s to ~22.5s (850ms visual establishing buffer after 16.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_3.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act3_v2.wav

    # Act 4: Ren speaks from 24.85s to ~30.8s (850ms visual establishing buffer after 24.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_4.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act4_v2.wav

    # Act 5: Aoi speaks from 32.85s to ~38.5s (850ms visual establishing buffer after 32.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_5.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act5_v2.wav

    # Act 6: Ren speaks from 40.85s to ~46.8s (850ms visual establishing buffer after 40.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_6.wav -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=850|850,apad=pad_dur=8,atrim=0:8.0' -ar 48000 scratch/multilingual/\${L}_act6_v2.wav

    # Act 7: Aoi speaks 49.0s to 51.5s, Ren responds 52.2s to 54.8s (1000ms buffer after 48.0s cut)
    ffmpeg -y -i scratch/multilingual/\${L}_7a.wav -i scratch/multilingual/\${L}_7b.wav -filter_complex '
      [0:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.1,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=1000|1000,atrim=0:3.6[a7a];
      [1:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=4000|4000,atrim=0:7.6[a7b];
      [a7a][a7b]amix=inputs=2:duration=longest[a7mix];
      [a7mix]apad=pad_dur=8,atrim=0:8.0[a7out]
    ' -map '[a7out]' -ar 48000 scratch/multilingual/\${L}_act7_v2.wav

    # Concat all 7 sequential acts with zero cross-cut bleed
    ffmpeg -y \
      -i scratch/multilingual/\${L}_act1_v2.wav \
      -i scratch/multilingual/\${L}_act2_v2.wav \
      -i scratch/multilingual/\${L}_act3_v2.wav \
      -i scratch/multilingual/\${L}_act4_v2.wav \
      -i scratch/multilingual/\${L}_act5_v2.wav \
      -i scratch/multilingual/\${L}_act6_v2.wav \
      -i scratch/multilingual/\${L}_act7_v2.wav \
      -filter_complex '[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[vconcat];[vconcat]aecho=0.8:0.85:25:0.18[clean_dialogue]' \
      -map '[clean_dialogue]' -ar 48000 -t 56.00 scratch/multilingual/\${L}_dialogue_v2.wav

    # Mix Dialogue with Ambient Zen Score
    ffmpeg -y \
      -i scratch/multilingual/\${L}_dialogue_v2.wav \
      -i scratch/cinematic_anime_score.wav \
      -filter_complex '[0:a]volume=1.5[v];[1:a]volume=0.28[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]' \
      -map '[limited]' -t 56.00 -ar 48000 public/assets/audio/anime_dubs/dub_\${L}.mp3

    ls -lh public/assets/audio/anime_dubs/dub_\${L}.mp3
  done

  # Re-mux default video with Japanese master
  ffmpeg -y \
    -i scratch/consistent_anime/visual_56s_master.mp4 \
    -i public/assets/audio/anime_dubs/dub_ja.mp3 \
    -map 0:v:0 -map 1:a:0 \
    -c:v copy -c:a aac -b:a 320k \
    -t 56.00 -movflags +faststart \
    public/assets/video/ren_and_aoi_conversation_synced.mp4
"`);

execSync(`scp -r nitinagga.c.googlers.com:~/zyvoriq/public/assets/audio/anime_dubs/* public/assets/audio/anime_dubs/`);
execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4 public/assets/video/`);
console.log("🎉 ALL 6 DUBS AND MASTER VIDEO REMASTERED WITH ACCURATE TIMING BUFFERS!");
