const { execSync } = require('child_process');

console.log("=============================================================================");
console.log("🌸 MASTERING FULL 56.0s DUAL-CHARACTER CONVERSATION WITH LONGEST DURATION");
console.log("=============================================================================");

execSync(`ssh nitinagga.c.googlers.com "
  cd ~/zyvoriq

  # 1. Build timed multi-actor conversational track with full 56.0s duration
  # Aoi (Right pan 0.9 c1), Ren (Left pan 0.9 c0)
  ffmpeg -y \
    -i scratch/dialogue/line_1_aoi.wav \
    -i scratch/dialogue/line_2_ren.wav \
    -i scratch/dialogue/line_3_aoi.wav \
    -i scratch/dialogue/line_4_ren.wav \
    -i scratch/dialogue/line_5_aoi.wav \
    -i scratch/dialogue/line_6_ren.wav \
    -i scratch/dialogue/line_7a_aoi.wav \
    -i scratch/dialogue/line_7b_ren.wav \
    -filter_complex '
      [0:a]adelay=600|600,pan=stereo|c0=0.25*c0|c1=0.95*c0,volume=1.6[a1];
      [1:a]adelay=8500|8500,pan=stereo|c0=0.95*c0|c1=0.25*c0,volume=1.6[a2];
      [2:a]adelay=16500|16500,pan=stereo|c0=0.25*c0|c1=0.95*c0,volume=1.6[a3];
      [3:a]adelay=24500|24500,pan=stereo|c0=0.95*c0|c1=0.25*c0,volume=1.6[a4];
      [4:a]adelay=32500|32500,pan=stereo|c0=0.25*c0|c1=0.95*c0,volume=1.6[a5];
      [5:a]adelay=40500|40500,pan=stereo|c0=0.95*c0|c1=0.25*c0,volume=1.6[a6];
      [6:a]adelay=48500|48500,pan=stereo|c0=0.25*c0|c1=0.95*c0,volume=1.6[a7a];
      [7:a]adelay=51500|51500,pan=stereo|c0=0.95*c0|c1=0.25*c0,volume=1.6[a7b];
      [a1][a2][a3][a4][a5][a6][a7a][a7b]amix=inputs=8:duration=longest:dropout_transition=0[voices];
      [voices]aecho=0.8:0.88:35:0.25[voices_room]
    ' -map '[voices_room]' -t 56.0 -ar 48000 scratch/dialogue_master_stereo.wav

  # 2. Master Dialogue + Music with Dynamic Limiter
  ffmpeg -y \
    -i scratch/dialogue_master_stereo.wav \
    -i scratch/cinematic_anime_score.wav \
    -filter_complex '
      [0:a]volume=1.4[v];
      [1:a]volume=0.35[m];
      [v][m]amix=inputs=2:duration=first[aout];
      [aout]alimiter=limit=0.95:attack=5:release=50[limited]
    ' -map '[limited]' -t 56.0 -ar 48000 scratch/conversational_audio_master.wav

  # 3. Final Master Video Mux
  ffmpeg -y \
    -i scratch/duo_anime_story_video.mp4 \
    -i scratch/conversational_audio_master.wav \
    -map 0:v:0 -map 1:a:0 \
    -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p \
    -c:a aac -b:a 320k -ar 48000 \
    -t 56.00 -movflags +faststart \
    public/assets/video/ren_and_aoi_conversation_1min.mp4

  ls -lh public/assets/video/ren_and_aoi_conversation_1min.mp4
"`);

execSync(`scp nitinagga.c.googlers.com:~/zyvoriq/public/assets/video/ren_and_aoi_conversation_1min.mp4 public/assets/video/`);
execSync(`cp public/assets/video/ren_and_aoi_conversation_1min.mp4 /Users/nitinagga/.gemini/jetski/brain/a23b3dfc-a646-4f35-a290-887798aac2f1/`);
execSync(`open /Users/nitinagga/Documents/zyvoriq/public/assets/video/ren_and_aoi_conversation_1min.mp4`);

console.log("🎉 100% COMPLETE 56.0s DUAL-ACTOR CONVERSATIONAL ANIME STORY MASTER READY & OPENED!");
