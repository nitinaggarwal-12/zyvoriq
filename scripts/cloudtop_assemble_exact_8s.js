const { execSync } = require('child_process');
const fs = require('fs');

const LANGS = ['ja', 'en', 'es', 'fr', 'de', 'hi'];

function run() {
  console.log("=============================================================================");
  console.log("🎬 ZERO-LAG AUDIO MASTERING: CRISP 250ms LEAD-IN (0.25s) & EXACT 8.000s ACTS");
  console.log("=============================================================================");

  fs.mkdirSync('public/assets/audio/anime_dubs', { recursive: true });

  for (const L of LANGS) {
    console.log(`\n🎌 [${L.toUpperCase()}] Mastering 7 Acts with crisp 250ms reaction timing...`);

    // Acts 1 to 6
    for (let i = 1; i <= 6; i++) {
      const rawFile = `scratch/cadence_dubs_v2/${L}_${i}.wav`;
      const outFile = `scratch/cadence_dubs_v2/${L}_act${i}_8s.wav`;

      // Get raw duration
      const rawDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${rawFile}`).toString().trim());

      // If duration exceeds 6.2s, compress gently so it easily finishes before 7.0s
      let tempoFilter = '';
      if (rawDur > 6.2) {
        const t = (rawDur / 6.0).toFixed(3);
        tempoFilter = `,atempo=${t}`;
        console.log(`   Act ${i}: raw ${rawDur.toFixed(2)}s -> atempo=${t}`);
      } else {
        console.log(`   Act ${i}: raw ${rawDur.toFixed(2)}s (1.0x natural tempo)`);
      }

      // Pan: Aoi (Acts 1,3,5 -> c0=0.25, c1=0.95), Ren (Acts 2,4,6 -> c0=0.95, c1=0.25)
      const pan = (i % 2 === 1) ? 'pan=stereo|c0=0.25*c0|c1=0.95*c0' : 'pan=stereo|c0=0.95*c0|c1=0.25*c0';

      // 250ms crisp lead-in (adelay=250|250)
      const cmd = `ffmpeg -y -i "${rawFile}" -filter_complex "
        [0:a]silenceremove=start_periods=1:start_threshold=-45dB${tempoFilter},${pan},adelay=250|250[speech];
        aevalsrc=0:d=8.0:s=48000[silence];
        [silence][speech]amix=inputs=2:duration=first:dropout_transition=0[out]
      " -map '[out]' -ar 48000 "${outFile}"`;
      execSync(cmd);
    }

    // Act 7 (Bow Scene - Mutual Dialogue)
    // Aoi starts at 0.35s (adelay=350|350), Ren starts at 3.0s (adelay=3000|3000)
    console.log(`   Act 7: Aoi (delay 0.35s) | Ren (delay 3.0s)`);

    const act7Cmd = `ffmpeg -y \
      -i scratch/cadence_dubs_v2/${L}_7a.wav \
      -i scratch/cadence_dubs_v2/${L}_7b.wav \
      -filter_complex "
        [0:a]silenceremove=start_periods=1:start_threshold=-45dB,pan=stereo|c0=0.25*c0|c1=0.95*c0,adelay=350|350[a7a];
        [1:a]silenceremove=start_periods=1:start_threshold=-45dB,pan=stereo|c0=0.95*c0|c1=0.25*c0,adelay=3000|3000[a7b];
        [a7a][a7b]amix=inputs=2:dropout_transition=0[a7speech];
        aevalsrc=0:d=8.0:s=48000[silence];
        [silence][a7speech]amix=inputs=2:duration=first:dropout_transition=0[out]
      " -map '[out]' -ar 48000 scratch/cadence_dubs_v2/${L}_act7_8s.wav`;
    execSync(act7Cmd);

    // Concat all 7 acts into 56.000000s dialogue master
    const concatCmd = `ffmpeg -y \
      -i scratch/cadence_dubs_v2/${L}_act1_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act2_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act3_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act4_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act5_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act6_8s.wav \
      -i scratch/cadence_dubs_v2/${L}_act7_8s.wav \
      -filter_complex "[0:a][1:a][2:a][3:a][4:a][5:a][6:a]concat=n=7:v=0:a=1[clean]" \
      -map '[clean]' -ar 48000 -t 56.00 scratch/cadence_dubs_v2/${L}_dialogue_master.wav`;
    execSync(concatCmd);

    // Mix dialogue with ambient Zen music track
    const mixCmd = `ffmpeg -y \
      -i scratch/cadence_dubs_v2/${L}_dialogue_master.wav \
      -i scratch/cinematic_anime_score.wav \
      -filter_complex '[0:a]volume=1.5[v];[1:a]volume=0.25[m];[v][m]amix=inputs=2:duration=first[aout];[aout]alimiter=limit=0.95:attack=5:release=50[limited]' \
      -map '[limited]' -t 56.00 -ar 48000 public/assets/audio/anime_dubs/dub_${L}.mp3`;
    execSync(mixCmd);

    const dubDur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/assets/audio/anime_dubs/dub_${L}.mp3`).toString().trim();
    console.log(`   ✅ dub_${L}.mp3 duration: ${dubDur}s`);
  }

  // Re-mux master video with synced Japanese dub
  console.log("\n🎬 Re-muxing master MP4 video...");
  execSync(`ffmpeg -y \
    -i scratch/consistent_anime/visual_56s_master.mp4 \
    -i public/assets/audio/anime_dubs/dub_ja.mp3 \
    -map 0:v:0 -map 1:a:0 \
    -c:v copy -c:a aac -b:a 320k \
    -t 56.00 -movflags +faststart \
    public/assets/video/ren_and_aoi_conversation_synced.mp4`);

  const vidDur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/assets/video/ren_and_aoi_conversation_synced.mp4`).toString().trim();
  console.log(`🎉 Master Video Duration: ${vidDur}s`);
}

run();
