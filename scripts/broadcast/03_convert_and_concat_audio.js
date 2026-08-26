const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔄 Converting PCM audio scenes to WAV and building Master Keynote Audio Track...');

const manifest = JSON.parse(fs.readFileSync('scratch/keynote_10min/audio_manifest.json', 'utf8'));

let concatList = '';
for (const scene of manifest) {
  const pcmPath = scene.pcmPath;
  const wavPath = scene.wavPath;
  console.log(`  🎵 Converting ${pcmPath} -> ${wavPath}`);
  execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i ${pcmPath} -ar 48000 -ac 2 ${wavPath}`);
  concatList += `file '${scene.id}.wav'\n`;
}

fs.writeFileSync('scratch/keynote_10min/concat_list.txt', concatList);

console.log('🎙️ Concatenating all scenes into unified 10-Minute Master Keynote Audio...');
execSync(`cd scratch/keynote_10min && ffmpeg -y -f concat -safe 0 -i concat_list.txt -c:a pcm_s16le ../../public/assets/audio/priya_10min_master_speech.wav`);
execSync(`cd scratch/keynote_10min && ffmpeg -y -i ../../public/assets/audio/priya_10min_master_speech.wav -b:a 192k ../../public/assets/audio/priya_10min_master_speech.mp3`);

console.log('✅ Master Keynote Audio generated at public/assets/audio/priya_10min_master_speech.wav & mp3');
