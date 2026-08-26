const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎬 Assembling Clean Broadcast Multi-Camera Keynote for Priya (Zero Ghosting)...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// Check exact duration of priya.wav
const durationStr = execSync(`ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
const totalDuration = parseFloat(durationStr) || 26.5;
console.log(`⏱️ Audio duration: ${totalDuration.toFixed(2)} seconds`);

// 4 Clean Keynote Director Angles cut exactly at sentence pauses:
// Cut 1: 0.0s - 5.2s (5.2s) -> Wide Stage Entrance
// Cut 2: 5.2s - 12.4s (7.2s) -> Medium Keynote Assertion
// Cut 3: 12.4s - 19.8s (7.4s) -> Close-Up Conviction
// Cut 4: 19.8s - 26.5s (6.7s) -> Wide Keynote Finale

const ffmpegCmd = `ffmpeg -y \
  -ss 0.0 -t 5.2 -i scratch/keynote_10min/veo_act1.mp4 \
  -ss 0.0 -t 7.2 -i scratch/keynote_10min/veo_act2.mp4 \
  -ss 0.0 -t 7.4 -i scratch/keynote_10min/veo_act4.mp4 \
  -ss 0.0 -t 6.7 -i scratch/keynote_10min/veo_act5.mp4 \
  -i ${audioPath} \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=60,setsar=1[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=60,setsar=1[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=60,setsar=1[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=60,setsar=1[v3]; \
    [v0][v1][v2][v3]concat=n=4:v=1:a=0[vfinal] \
  " \
  -map "[vfinal]" -map 4:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing Instant Broadcast Cuts Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);
console.log(`🎉 Successfully rendered Clean Broadcast Cuts for Priya: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
