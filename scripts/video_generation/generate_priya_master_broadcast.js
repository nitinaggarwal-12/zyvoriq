const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎬 Starting Film-Grade Multi-Scene Master Broadcast Video Generation for Priya...');

const audioPath = 'public/assets/audio/priya_10min_master_speech.wav';
const outMaster = 'public/assets/avatars/priya_10min_keynote_master.mp4';
const outPriya = 'public/assets/avatars/priya_master.mp4';

// Check duration of audio
const durationStr = execSync(`ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
const totalDuration = parseFloat(durationStr) || 176.0;
console.log(`⏱️ Audio duration: ${totalDuration.toFixed(2)} seconds`);

const ffmpegCmd = `ffmpeg -y \
  -loop 1 -t 35 -i public/assets/avatars/priya.jpg \
  -loop 1 -t 35 -i public/assets/avatars/priya_cutout.png \
  -loop 1 -t 35 -i public/assets/avatars/priya.jpg \
  -loop 1 -t 35 -i public/assets/avatars/priya_cutout.png \
  -loop 1 -t 40 -i public/assets/avatars/priya.jpg \
  -i ${audioPath} \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=2100:s=1920x1080,fade=t=out:st=32:d=3[v0]; \
    [1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='1.15-0.0005*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=2100:s=1920x1080,fade=t=in:st=0:d=3,fade=t=out:st=32:d=3[v1]; \
    [2:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0007,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=2100:s=1920x1080,fade=t=in:st=0:d=3,fade=t=out:st=32:d=3[v2]; \
    [3:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='1.2-0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=2100:s=1920x1080,fade=t=in:st=0:d=3,fade=t=out:st=32:d=3[v3]; \
    [4:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='min(zoom+0.0005,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=2400:s=1920x1080,fade=t=in:st=0:d=3[v4]; \
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[vconcat]; \
    [vconcat]drawtext=text='ZYVORIQ SOVEREIGN BROADCAST • PRIYA SHARMA':fontcolor=white@0.85:fontsize=24:x=60:y=60:box=1:boxcolor=black@0.5:boxborderw=10,\
    drawtext=text='LIVE KEYNOTE • 60 FPS 1080p MASTER':fontcolor=0x00f0ff@0.9:fontsize=18:x=60:y=100:box=1:boxcolor=black@0.5:boxborderw=8,\
    format=yuv420p[vfinal] \
  " \
  -map "[vfinal]" -map 5:a -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 320k -shortest ${outMaster}`;

console.log('🚀 Executing FFmpeg Master Broadcast Pipeline...');
execSync(ffmpegCmd, { stdio: 'inherit' });

// Copy to priya_master.mp4 as well
fs.copyFileSync(outMaster, outPriya);
console.log(`🎉 Successfully rendered Master Keynote Broadcast: ${outMaster} (${(fs.statSync(outMaster).size / 1024 / 1024).toFixed(2)} MB)`);
