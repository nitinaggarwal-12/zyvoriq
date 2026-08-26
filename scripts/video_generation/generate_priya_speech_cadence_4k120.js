const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏛️ Assembling Semantic Speech-Transition Variable Cuts for Priya in 4K @ 120 FPS...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// Exact Speech-Transition Timestamps:
// Cut 1 (0.00s - 5.12s = 5.12s): "Hello everyone! I'm Priya, Global Transformation CTO." -> Wide 35mm
// Cut 2 (5.12s - 12.65s = 7.53s): "Traditional enterprise content pipelines take 14 long days and over $140,000." -> Mid 50mm
// Cut 3 (12.65s - 19.45s = 6.80s): "With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—" -> Close-Up 70mm
// Cut 4 (19.45s - 26.50s = 7.05s): "backed by Veritas cryptographic consensus and Ed25519 provenance!" -> Hero 24mm

const clipSources = [
  { file: 'scratch/keynote_10min/veo_act1.mp4', ss: 0.0, t: 5.12 },
  { file: 'scratch/keynote_10min/veo_act2.mp4', ss: 0.0, t: 7.53 },
  { file: 'scratch/keynote_10min/veo_act4.mp4', ss: 0.0, t: 6.80 },
  { file: 'scratch/keynote_10min/veo_act5.mp4', ss: 0.0, t: 7.05 }
];

let inputArgs = '';
let filterChain = '';
let concatInputs = '';

clipSources.forEach((clip, idx) => {
  inputArgs += `-ss ${clip.ss} -t ${clip.t} -i ${clip.file} `;
  filterChain += `[${idx}:v]scale=3840:2160:flags=lanczos:force_original_aspect_ratio=increase,crop=3840:2160,fps=120,setsar=1[v${idx}]; `;
  concatInputs += `[v${idx}]`;
});

filterChain += `${concatInputs}concat=n=4:v=1:a=0[vfinal]`;

const ffmpegCmd = `ffmpeg -y ${inputArgs} -i ${audioPath} ` +
  `-filter_complex "${filterChain}" ` +
  `-map "[vfinal]" -map 4:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing Speech-Cadence Variable 4K 120 FPS Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);

const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames -of json ${outMaster}`).toString();
console.log('📊 Verified Speech-Cadence 4K 120 FPS Output Stream Properties:', probe);
console.log(`🎉 Successfully rendered Speech-Cadence 4K 120 FPS Master: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
