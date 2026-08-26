const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏛️ Assembling 5-Cut Benchmark Keynote for Priya in 4K (3840x2160) @ 120 FPS...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// 5 Balanced Keynote Acts across the 26.5s audio duration (each ~5.3s):
const clipSources = [
  { file: 'scratch/keynote_10min/veo_act1.mp4', ss: 0.0, t: 5.3 },
  { file: 'scratch/keynote_10min/veo_act2.mp4', ss: 0.0, t: 5.3 },
  { file: 'scratch/keynote_10min/veo_act3.mp4', ss: 0.0, t: 5.3 },
  { file: 'scratch/keynote_10min/veo_act4.mp4', ss: 0.0, t: 5.3 },
  { file: 'scratch/keynote_10min/veo_act5.mp4', ss: 0.0, t: 5.3 }
];

let inputArgs = '';
let filterChain = '';
let concatInputs = '';

clipSources.forEach((clip, idx) => {
  inputArgs += `-ss ${clip.ss} -t ${clip.t} -i ${clip.file} `;
  filterChain += `[${idx}:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v${idx}]; `;
  concatInputs += `[v${idx}]`;
});

filterChain += `${concatInputs}concat=n=5:v=1:a=0[vfinal]`;

const ffmpegCmd = `ffmpeg -y ${inputArgs} -i ${audioPath} ` +
  `-filter_complex "${filterChain}" ` +
  `-map "[vfinal]" -map 5:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing 5-Cut 4K 120 FPS Master Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);

const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames -of json ${outMaster}`).toString();
console.log('📊 Verified 5-Cut 4K 120 FPS Output Stream Properties:', probe);
console.log(`🎉 Successfully rendered 5-Cut 4K 120 FPS Master: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
