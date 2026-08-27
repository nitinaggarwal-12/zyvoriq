const { execSync } = require('child_process');

console.log("=============================================================================");
console.log("🛡️ BUILDING STRICT ZERO-OVERLAP SEQUENTIAL AUDIO CONCATENATION");
console.log("=============================================================================");

execSync(`ssh nitinagga.c.googlers.com "
  cd ~/zyvoriq
  mkdir -p scratch/sequential_acts

  # Act 1: Aoi speaks (Right pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_1_aoi.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_1_audio.wav

  # Act 2: Ren speaks (Left pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_2_ren.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_2_audio.wav

  # Act 3: Aoi speaks (Right pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_3_aoi.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_3_audio.wav

  # Act 4: Ren speaks (Left pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_4_ren.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.35,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_4_audio.wav

  # Act 5: Aoi speaks (Right pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_5_aoi.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_5_audio.wav

  # Act 6: Ren speaks (Left pan) -> Exactly 8.000s
  ffmpeg -y -i scratch/line_6_ren.wav \
    -af 'silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.2,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=500|500,apad=pad_dur=8,atrim=0:8.0' \
    -ar 48000 scratch/sequential_acts/act_6_audio.wav

  # Act 7: Aoi then Ren (No overlap inside act) -> Exactly 8.000s
  ffmpeg -y \
    -i scratch/line_7a_aoi.wav \
    -i scratch/line_7b_ren.wav \
    -filter_complex '
      [0:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.1,pan=stereo|c0=0.2*c0|c1=0.95*c0,adelay=400|400,atrim=0:3.2[a7a];
      [1:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.15,pan=stereo|c0=0.95*c0|c1=0.2*c0,adelay=3600|3600,atrim=0:7.5[a7b];
      [a7a][a7b]amix=inputs=2:duration=longest[a7mix];
      [a7mix]apad=pad_dur=8,atrim=0:8.0[a7out]
    ' -map '[a7out]' -ar 48000 scratch/sequential_acts/act_7_audio.wav

  # Check durations of all 7 act audios
  sox --version 2>/dev/null || true
  for f in scratch/sequential_acts/act_*_audio.wav; do
    ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \\\$f
  done

  # 2. Sequentially CONCATENATE the 7 isolated audio acts (7 x 8.0s = 56.000s)
  ffmpeg -y \
    -i scratch/sequential_acts/act_1_audio.wav \
    -i scratch/sequential_acts/act_2_audio.wav \
    -i scratch/sequential_acts/act_3_audio.wav \
    -i scratch/sequential_acts/act_4_audio.wav \
    -i scratch/sequential_acts/act_5_audio.wav \
    -i scratch/sequential_acts/act_6_audio.wav \
    -i scratch/sequential_acts/act_7_audio.wav \
    -filter_complex '[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[vconcat];[vconcat]aecho=0.8:0.85:25:0.18[clean_dialogue]' \
    -map '[clean_dialogue]' -ar 48000 -t 56.00 scratch/sequential_dialogue_master.wav

  # 3. Dynamic Audio Mastering with Meditative Zen Ambient Background
  ffmpeg -y \
    -i scratch/sequential_dialogue_master.wav \
    -i scratch/cinematic_anime_score.wav \
    -filter_complex '
      [0:a]volume=1.5[v];
      [1:a]volume=0.28[m];
      [v][m]amix=inputs=2:duration=first[aout];
      [aout]alimiter=limit=0.95:attack=5:release=50[limited]
    ' -map '[limited]' -t 56.00 -ar 48000 scratch/final_clean_conversational_audio.wav

  # 4. Final Clean Video Mux
  ffmpeg -y \
    -i scratch/synced_dialogue_video.mp4 \
    -i scratch/final_clean_conversational_audio.wav \
    -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -preset fast -crf 25 -pix_fmt yuv420p \
    -c:a aac -b:a 320k -ar 48000 \
    -t 56.00 -movflags +faststart \
    public/assets/video/ren_and_aoi_conversation_synced.mp4

  ls -lh public/assets/video/ren_and_aoi_conversation_synced.mp4
"`);

execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4 public/assets/video/`);
execSync(`cp public/assets/video/ren_and_aoi_conversation_synced.mp4 /Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/`);
execSync(`open /Users/nitinagga/Documents/zyvoriq/public/assets/video/ren_and_aoi_conversation_synced.mp4`);

console.log("🎉 100% STRICT SEQUENTIAL ZERO-OVERLAP MASTER READY & OPENED!");
