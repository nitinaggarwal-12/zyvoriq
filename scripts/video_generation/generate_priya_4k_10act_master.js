const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏛️ Assembling 10-Act True 4K (3840x2160) 60 FPS Master Keynote for Priya...');

const out4K = 'public/assets/video/priya_4k_10act_master.mp4';
const speechAudio = 'public/assets/audio/priya_10min_master_speech.wav';

// The 10 distinct keynote scenes:
const scenes = [
  'scratch/keynote_10min/veo_act1.mp4',
  'scratch/keynote_10min/rendered_act1_scene1.mp4',
  'scratch/keynote_10min/veo_act2.mp4',
  'scratch/keynote_10min/rendered_act2_scene1.mp4',
  'scratch/keynote_10min/veo_act3.mp4',
  'scratch/keynote_10min/rendered_act3_scene1.mp4',
  'scratch/keynote_10min/veo_act4.mp4',
  'scratch/keynote_10min/rendered_act4_scene1.mp4',
  'scratch/keynote_10min/veo_act5.mp4',
  'scratch/keynote_10min/rendered_act5_scene1.mp4'
];

let inputArgs = '';
let filterChain = '';

scenes.forEach((s, idx) => {
  inputArgs += `-i ${s} `;
  filterChain += `[${idx}:v]scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,fps=60,setsar=1[v${idx}]; `;
});

// Chain 9 optical crossfades across the 10 acts:
let currentOut = 'v0';
let currentOffset = 5.5;

for (let i = 1; i < scenes.length; i++) {
  const nextOut = (i === scenes.length - 1) ? 'vfinal' : `x${i}`;
  filterChain += `[${currentOut}][v${i}]xfade=transition=fade:duration=0.5:offset=${currentOffset.toFixed(1)}[${nextOut}]; `;
  currentOut = nextOut;
  currentOffset += 5.5;
}

const ffmpegCmd = `ffmpeg -y ${inputArgs} -i ${speechAudio} ` +
  `-filter_complex "${filterChain}" ` +
  `-map "[vfinal]" -map 10:a -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -shortest ${out4K}`;

console.log('🚀 Executing 4K 60 FPS 10-Act Encoding Pipeline on Cloudtop...');
execSync(ffmpegCmd, { stdio: 'inherit' });

const stats = fs.statSync(out4K);
console.log(`🎉 Successfully generated 10-Act 4K Master Video: ${out4K} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
