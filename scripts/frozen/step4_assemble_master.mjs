import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/frozen_glacier_whispers";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const AUDIT_DIR = path.join(BASE_DIR, "audit");
const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack.mp3");
const MASTER_OUTPUT = path.join(BASE_DIR, "master_music_video_cut.mp4");

fs.mkdirSync(AUDIT_DIR, { recursive: true });

async function assemble() {
  console.log("========================================================================");
  console.log("🎬 [STEP 4/5] CONCATENATING UNIQUE SHOTS & DUAL-STEM AUDIO MIXING");
  console.log("========================================================================");

  const shot1 = path.join(CLIPS_DIR, "shot_01_glacial_awakening.mp4");
  const shot2 = path.join(CLIPS_DIR, "shot_02_freya_vocal_attack.mp4");
  const shot3 = path.join(CLIPS_DIR, "shot_03_astrid_freya_harmonies.mp4");
  const shot4 = path.join(CLIPS_DIR, "shot_04_aurora_climax_finale.mp4");

  for (const s of [shot1, shot2, shot3, shot4]) {
    if (!fs.existsSync(s)) throw new Error(`Missing shot: ${s}`);
  }

  // 1. Create concat video list
  const listPath = path.join(CLIPS_DIR, "concat_list.txt");
  fs.writeFileSync(listPath, `file '${path.resolve(shot1)}'\nfile '${path.resolve(shot2)}'\nfile '${path.resolve(shot3)}'\nfile '${path.resolve(shot4)}'\n`);

  // Concat video and native audio
  const concatRaw = path.join(CLIPS_DIR, "video_rough_concat.mp4");
  console.log("🎞️ Concatenating 4 unique shots (40 seconds total)...");
  execSync(`ffmpeg -y -f concat -safe 0 -i ${listPath} -c:v copy -c:a aac ${concatRaw}`, { stdio: "inherit" });

  const totalDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${concatRaw}`).toString().trim());
  console.log(`⏱️ Concatenated Video Duration: ${totalDur.toFixed(2)}s`);

  // 2. Mix Lyria Master soundtrack (trimmed to exact length) as background bed with ducking under native audio
  console.log("🎵 Mixing Lyria Master Bed (ducked to 0.20 to prevent vocal collision)...");
  
  // Gatekeeper 3: Duck accompaniment bed to <= 0.20 when native vocals are active, preserve native vocals at 1.2
  const filterGraph = `[0:a]volume=1.2[vocal];[1:a]atrim=0:${totalDur},asetpts=PTS-STARTPTS,volume=0.18[bed];[vocal][bed]amix=inputs=2:duration=first:dropout_transition=2[outa]`;

  execSync(`ffmpeg -y -i ${concatRaw} -i ${MASTER_AUDIO} -filter_complex "${filterGraph}" -map 0:v -map "[outa]" -c:v copy -c:a aac -b:a 192k ${MASTER_OUTPUT}`, { stdio: "inherit" });

  const masterDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_OUTPUT}`).toString().trim());
  const masterSize = fs.statSync(MASTER_OUTPUT).size;
  console.log(`🎉 Master Video Assembled: ${MASTER_OUTPUT} (${Math.round(masterSize / (1024 * 1024) * 10) / 10} MB, ${masterDur.toFixed(2)}s)`);

  // 3. Extract cut-boundary audit frames
  console.log("📸 Extracting cut boundary audit frames...");
  for (const f of fs.readdirSync(AUDIT_DIR)) {
    if (f.startsWith("cut_frame_") && f.endsWith(".png")) {
      fs.unlinkSync(path.join(AUDIT_DIR, f));
    }
  }
  const cutPoints = [0.5, 5.0, 10.5, 15.0, 20.5, 25.0, 30.5, 38.0];
  for (let i = 0; i < cutPoints.length; i++) {
    const cp = cutPoints[i];
    const frameOut = path.join(AUDIT_DIR, `cut_frame_${String(i + 1).padStart(2, "0")}_t${cp}s.png`);
    execSync(`ffmpeg -y -ss ${cp} -i ${MASTER_OUTPUT} -frames:v 1 -update 1 ${frameOut}`);
  }
  console.log(`✅ Extracted ${cutPoints.length} cut-boundary frames to ${AUDIT_DIR}`);
}

assemble().catch((err) => {
  console.error("❌ Assembly failed:", err);
  process.exit(1);
});
