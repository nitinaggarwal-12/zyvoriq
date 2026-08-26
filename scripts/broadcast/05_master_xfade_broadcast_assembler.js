const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎬 Mastering 10-Minute Broadcast with 5 Unique Veo 3.1 Shots & 0.8s Cinematic Cross-Dissolves...');

const scenes = [
  { id: 'act1_scene1', type: 'A_ROLL', title: 'Executive Hook', video: 'scratch/keynote_10min/veo_act1.mp4' },
  { id: 'act1_scene2', type: 'B_ROLL', title: 'Global Hybrid Topology', bg: '#041326', text: 'GLOBAL HYBRID CLOUD TOPOLOGY\\nSub-Millisecond Multi-Region Sync' },
  { id: 'act2_scene1', type: 'A_ROLL', title: 'Zero-Trust Security', video: 'scratch/keynote_10min/veo_act2.mp4' },
  { id: 'act2_scene2', type: 'B_ROLL', title: 'Cloud Armor Edge Defense', bg: '#061a23', text: 'CLOUD ARMOR ZERO-TRUST INGRESS\\n1.4M req/s WAF & DDoS Anomaly Defense' },
  { id: 'act3_scene1', type: 'A_ROLL', title: 'Autonomous Swarms', video: 'scratch/keynote_10min/veo_act3.mp4' },
  { id: 'act3_scene2', type: 'B_ROLL', title: 'Recursive Swarm DAG', bg: '#100b24', text: 'AUTONOMOUS MULTI-AGENT SWARM MESH\\nRecursive DAG Decomposition & Execution' },
  { id: 'act4_scene1', type: 'A_ROLL', title: 'Veritas Provenance', video: 'scratch/keynote_10min/veo_act4.mp4' },
  { id: 'act4_scene2', type: 'B_ROLL', title: 'zk-SNARK Circuit Auto-Repair', bg: '#081a18', text: 'VERITAS zk-SNARK PROVENANCE SEAL\\nAutonomous Feedback Circuit Auto-Repair' },
  { id: 'act5_scene1', type: 'A_ROLL', title: 'Enterprise ROI Impact', video: 'scratch/keynote_10min/veo_act5.mp4' },
  { id: 'act5_scene2', type: 'B_ROLL', title: 'Transformation Horizon', bg: '#0d1322', text: 'ENTERPRISE 3-YEAR TRANSFORMATION HORIZON\\n$2.3M - $4.2M Annualized ROI Realization' }
];

const renderedScenes = [];

for (let i = 0; i < scenes.length; i++) {
  const sc = scenes[i];
  const wavPath = `scratch/keynote_10min/${sc.id}.wav`;
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${wavPath}`, { encoding: 'utf8' }).trim());
  const outVid = `scratch/keynote_10min/final_clip_${sc.id}.mp4`;

  console.log(`🎥 [Scene ${i + 1}/10] Rendering ${sc.id} (Duration: ${dur.toFixed(2)}s, Type: ${sc.type})...`);

  if (sc.type === 'A_ROLL') {
    // Loop the unique Veo 3.1 shot smoothly to exact scene speech duration
    execSync(`ffmpeg -y -stream_loop -1 -i ${sc.video} -t ${dur} -c:v libx264 -pix_fmt yuv420p -r 24 -s 1280x720 -an ${outVid}`);
  } else {
    // Render high-tech animated architecture card matching speech duration
    const filter = `color=c=${sc.bg}:s=1280x720:d=${dur},drawtext=text='ZYVORIQ SOVEREIGN ARCHITECTURE':fontcolor=0x38bdf8:fontsize=28:x=(w-text_w)/2:y=180,drawtext=text='${sc.text}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=280:line_spacing=20,drawtext=text='LIVE 60 FPS TELEMETRY • VERITAS zk-SNARK VALIDATED':fontcolor=0x10b981:fontsize=20:x=(w-text_w)/2:y=480`;
    execSync(`ffmpeg -y -f lavfi -i "${filter}" -c:v libx264 -pix_fmt yuv420p -r 24 -s 1280x720 -t ${dur} ${outVid}`);
  }

  renderedScenes.push({ id: sc.id, path: outVid, dur });
}

// Build xfade chain for all 10 scenes
console.log('🎞️ Building 0.8s Cinematic Cross-Dissolve Filter Graph...');
let inputArgs = renderedScenes.map((s, idx) => `-i ${s.path}`).join(' ');

let filterComplex = '';
let currentOffset = renderedScenes[0].dur - 0.8;
let lastLabel = '0:v';

for (let i = 1; i < renderedScenes.length; i++) {
  const nextLabel = `v${i}`;
  const outLabel = (i === renderedScenes.length - 1) ? 'vfinal' : `v${i}_out`;
  filterComplex += `[${lastLabel}][${i}:v]xfade=transition=fade:duration=0.8:offset=${currentOffset.toFixed(2)}[${outLabel}];`;
  lastLabel = outLabel;
  if (i < renderedScenes.length - 1) {
    currentOffset += renderedScenes[i].dur - 0.8;
  }
}

// Cut trailing semicolon
filterComplex = filterComplex.replace(/;$/, '');

console.log('🚀 Assembling Complete Master 10-Minute Video with Cross-Dissolves & Convolving Audio...');
const masterCmd = `cd /usr/local/google/home/nitinagga/zyvoriq && ffmpeg -y ${inputArgs} -i public/assets/audio/priya_10min_master_speech.wav -filter_complex "${filterComplex}" -map "[vfinal]" -map ${renderedScenes.length}:a -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart public/assets/video/priya_10min_keynote_master.mp4`;

fs.writeFileSync('scratch/keynote_10min/render_master.sh', masterCmd);
execSync('bash scratch/keynote_10min/render_master.sh');

console.log('🎉 10-Minute Master Keynote Broadcast Video with 5 Unique Veo 3.1 Shots & Cross-Dissolves COMPLETE!');
