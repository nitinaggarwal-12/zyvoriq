const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎬 Assembling 3-Cut Golden Ratio Keynote for Priya in 4K @ 120 FPS...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// 3 Major Keynote Acts matched exactly to the 3 spoken thoughts:
// Thought 1 (0.0s - 7.5s): Introduction & Role -> Wide Stage Entrance
// Thought 2 (7.5s - 16.5s): Problem & 90-Second Solution -> Mid-Shot Keynote Assertion
// Thought 3 (16.5s - 26.5s): Veritas Cryptographic Proof -> Close-Up Final Conviction

const ffmpegCmd = `ffmpeg -y \
  -ss 0.0 -t 7.5 -i scratch/keynote_10min/veo_act1.mp4 \
  -ss 0.0 -t 9.0 -i scratch/keynote_10min/veo_act2.mp4 \
  -ss 0.0 -t 10.0 -i scratch/keynote_10min/veo_act4.mp4 \
  -i ${audioPath} \
  -filter_complex "\
    [0:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v0]; \
    [1:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v1]; \
    [2:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v2]; \
    [v0][v1][v2]concat=n=3:v=1:a=0[vfinal] \
  " \
  -map "[vfinal]" -map 3:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing 3-Cut 4K 120 FPS Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);

const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames -of json ${outMaster}`).toString();
console.log('📊 Verified 3-Cut 4K 120 FPS Output Stream Properties:', probe);
console.log(`🎉 Successfully rendered 3-Cut 4K 120 FPS Master: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
