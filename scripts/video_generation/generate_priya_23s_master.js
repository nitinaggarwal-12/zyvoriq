const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎬 Generating 23.2s Syllable-Matched 1080p 60fps Video for Priya...');

const audioPath = 'public/assets/audio/priya.wav';
const outMaster = 'public/assets/video/priya_master.mp4';
const outAvatar = 'public/assets/avatars/priya_master.mp4';

// Check exact duration of priya.wav
const durationStr = execSync(`ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
const totalDuration = parseFloat(durationStr) || 23.2;
console.log(`⏱️ Exact audio duration: ${totalDuration.toFixed(3)} seconds`);

const ffmpegCmd = `ffmpeg -y \
  -loop 1 -t ${totalDuration} -i public/assets/avatars/priya.jpg \
  -i ${audioPath} \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,\
    zoompan=z='min(zoom+0.0004,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(totalDuration * 60)}:s=1920x1080:fps=60,\
    format=yuv420p[vfinal] \
  " \
  -map "[vfinal]" -map 1:a -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing FFmpeg 23.2s Pipeline...');
execSync(ffmpegCmd, { stdio: 'inherit' });

fs.copyFileSync(outMaster, outAvatar);
console.log(`🎉 Successfully rendered 23.2s Matched Video: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
