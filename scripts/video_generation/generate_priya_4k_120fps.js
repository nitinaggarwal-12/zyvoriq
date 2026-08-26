const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏛️ Encoding Priya Master Video to True 4K (3840x2160) at 120 FPS...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// 4 Clean Keynote Director Angles cut exactly at sentence pauses:
// Render with Lanczos 4K (3840x2160) and 120 FPS high-framerate stream:
const ffmpegCmd = `ffmpeg -y \
  -ss 0.0 -t 5.2 -i scratch/keynote_10min/veo_act1.mp4 \
  -ss 0.0 -t 7.2 -i scratch/keynote_10min/veo_act2.mp4 \
  -ss 0.0 -t 7.4 -i scratch/keynote_10min/veo_act4.mp4 \
  -ss 0.0 -t 6.7 -i scratch/keynote_10min/veo_act5.mp4 \
  -i ${audioPath} \
  -filter_complex "\
    [0:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v0]; \
    [1:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v1]; \
    [2:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v2]; \
    [3:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v3]; \
    [v0][v1][v2][v3]concat=n=4:v=1:a=0[vfinal] \
  " \
  -map "[vfinal]" -map 4:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing 4K 120 FPS Encoding Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);

const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate -of json ${outMaster}`).toString();
console.log('📊 Verified 4K 120 FPS Output Stream Properties:', probe);
console.log(`🎉 Successfully rendered 4K 120 FPS Master: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
