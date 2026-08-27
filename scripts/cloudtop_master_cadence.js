const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CADENCE_DIR = path.join(PROJECT_ROOT, 'scratch/cadence_dubs');
const OUT_DIR = path.join(PROJECT_ROOT, 'public/assets/audio/anime_dubs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SCORE_PATH = path.join(PROJECT_ROOT, 'scratch/cinematic_anime_score.wav');
const VISUAL_PATH = path.join(PROJECT_ROOT, 'scratch/consistent_anime/visual_56s_master.mp4');
const FINAL_VIDEO_PATH = path.join(PROJECT_ROOT, 'public/assets/video/ren_and_aoi_conversation_synced.mp4');

const LANGS = ['ja', 'en', 'es', 'fr', 'de', 'hi'];

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
    const dur = parseFloat(out.trim());
    return isNaN(dur) ? 6.5 : dur;
  } catch (e) {
    return 6.5;
  }
}

for (const lang of LANGS) {
  console.log(`\n🎬 Mastering [${lang.toUpperCase()}] Cadence Dub...`);

  // Acts 1 to 6
  for (let act = 1; act <= 6; act++) {
    const rawFile = path.join(CADENCE_DIR, `${lang}_${act}.wav`);
    const actOut = path.join(CADENCE_DIR, `${lang}_act${act}_cadence.wav`);
    
    const rawDur = getDuration(rawFile);
    let tempo = (rawDur / 6.80);
    if (tempo < 0.85) tempo = 0.85;
    if (tempo > 1.35) tempo = 1.35;
    tempo = tempo.toFixed(3);

    // Pan: Aoi (c0=0.25, c1=0.95), Ren (c0=0.95, c1=0.25)
    const pan = (act % 2 === 1) ? 'pan=stereo|c0=0.25*c0|c1=0.95*c0' : 'pan=stereo|c0=0.95*c0|c1=0.25*c0';

    const cmd = `ffmpeg -y -i "${rawFile}" -af "silenceremove=start_periods=1:start_threshold=-45dB,atempo=${tempo},${pan},adelay=600|600,apad=pad_dur=8,atrim=0:8.00" -ar 48000 "${actOut}"`;
    execSync(cmd, { stdio: 'inherit' });
  }

  // Act 7: 7a (Aoi: 0.60s to 3.80s), 7b (Ren: 4.00s to 7.40s)
  const f7a = path.join(CADENCE_DIR, `${lang}_7a.wav`);
  const f7b = path.join(CADENCE_DIR, `${lang}_7b.wav`);
  const act7Out = path.join(CADENCE_DIR, `${lang}_act7_cadence.wav`);

  const cmd7 = `ffmpeg -y -i "${f7a}" -i "${f7b}" -filter_complex "[0:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.00,pan=stereo|c0=0.25*c0|c1=0.95*c0,adelay=600|600,atrim=0:3.80[a7a];[1:a]silenceremove=start_periods=1:start_threshold=-45dB,atempo=1.00,pan=stereo|c0=0.95*c0|c1=0.25*c0,adelay=4000|4000,atrim=0:7.50[a7b];[a7a][a7b]amix=inputs=2:duration=longest[a7mix];[a7mix]apad=pad_dur=8,atrim=0:8.00[a7out]" -map "[a7out]" -ar 48000 "${act7Out}"`;
  execSync(cmd7, { stdio: 'inherit' });

  // Concat all 7 acts into 56.000s master speech track
  const dialogueMaster = path.join(CADENCE_DIR, `${lang}_dialogue_cadence_master.wav`);
  const inList = [];
  for (let act = 1; act <= 7; act++) {
    inList.push(`-i "${path.join(CADENCE_DIR, `${lang}_act${act}_cadence.wav`)}"`);
  }
  const concatCmd = `ffmpeg -y ${inList.join(' ')} -filter_complex "[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[vconcat];[vconcat]aecho=0.8:0.85:25:0.18[clean_dialogue]" -map "[clean_dialogue]" -ar 48000 -t 56.00 "${dialogueMaster}"`;
  execSync(concatCmd, { stdio: 'inherit' });

  // Mix dialogue with Zen score
  const finalDub = path.join(OUT_DIR, `dub_${lang}.mp3`);
  const mixCmd = `ffmpeg -y -i "${dialogueMaster}" -i "${SCORE_PATH}" -filter_complex "[0:a]volume=1.5[v];[1:a]volume=0.28[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]" -map "[limited]" -t 56.00 -ar 48000 "${finalDub}"`;
  execSync(mixCmd, { stdio: 'inherit' });

  console.log(`✅ [${lang.toUpperCase()}] Mastered -> ${finalDub}`);
}

// Re-mux default video with Japanese master
console.log(`\n🎥 Re-muxing synced video master with Japanese audio track...`);
const remuxCmd = `ffmpeg -y -i "${VISUAL_PATH}" -i "${path.join(OUT_DIR, 'dub_ja.mp3')}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 320k -t 56.00 -movflags +faststart "${FINAL_VIDEO_PATH}"`;
execSync(remuxCmd, { stdio: 'inherit' });
console.log(`✅ Master Video Synced -> ${FINAL_VIDEO_PATH}`);
