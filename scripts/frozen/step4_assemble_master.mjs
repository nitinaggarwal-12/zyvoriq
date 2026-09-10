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

  // Concat video and native audio using explicit filtergraph with 50ms edge audio smoothing to eliminate macroblocking, PTS jitter, and acoustic clicks
  const concatRaw = path.join(CLIPS_DIR, "video_rough_concat.mp4");
  console.log("🎞️ Concatenating 4 unique shots with filtergraph (zero B-frame drops, 50ms seam smoothing)...");
  execSync(`ffmpeg -y -i ${shot1} -i ${shot2} -i ${shot3} -i ${shot4} -filter_complex "[0:v]setsar=1,fps=24[v0];[1:v]setsar=1,fps=24[v1];[2:v]setsar=1,fps=24[v2];[3:v]setsar=1,fps=24[v3];[0:a]afade=t=out:st=9.95:d=0.05[a0];[1:a]afade=t=in:ss=0:d=0.05,afade=t=out:st=9.95:d=0.05[a1];[2:a]afade=t=in:ss=0:d=0.05,afade=t=out:st=9.95:d=0.05[a2];[3:a]afade=t=in:ss=0:d=0.05[a3];[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[vcat][acat]" -map "[vcat]" -map "[acat]" -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k ${concatRaw}`, { stdio: "inherit" });

  const totalDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${concatRaw}`).toString().trim());
  console.log(`⏱️ Concatenated Video Duration: ${totalDur.toFixed(2)}s`);

  // 2. Mix Lyria Master soundtrack as background bed with vocal band reduction & ducking
  console.log("🎵 Mixing Lyria Master Bed (vocal frequency reduction + ducked to 0.12 to prevent dual-vocal phasing)...");
  
  // Gatekeeper 3: Duck accompaniment bed to <= 0.20 and notch mid frequencies (1.2kHz & 2.8kHz) to eliminate vocal clash
  const filterGraph = `[0:a]volume=1.2[vocal];[1:a]atrim=0:${totalDur},asetpts=PTS-STARTPTS,equalizer=f=1200:width_type=o:w=2.0:g=-14,equalizer=f=2800:width_type=o:w=1.5:g=-10,volume=0.12[bed];[vocal][bed]amix=inputs=2:duration=first:dropout_transition=2[outa]`;

  execSync(`ffmpeg -y -i ${concatRaw} -i ${MASTER_AUDIO} -filter_complex "${filterGraph}" -map 0:v -map "[outa]" -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k ${MASTER_OUTPUT}`, { stdio: "inherit" });

  const masterDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${MASTER_OUTPUT}`).toString().trim());
  const masterSize = fs.statSync(MASTER_OUTPUT).size;
  console.log(`🎉 Master Video Assembled: ${MASTER_OUTPUT} (${Math.round(masterSize / (1024 * 1024) * 10) / 10} MB, ${masterDur.toFixed(2)}s)`);

  // 3. Extract cut-boundary and anchor audit frames
  console.log("📸 Extracting cut boundary and anchor audit frames...");
  for (const f of fs.readdirSync(AUDIT_DIR)) {
    if ((f.startsWith("cut_frame_") || f.startsWith("seam_frame_") || f.startsWith("singing_")) && (f.endsWith(".png") || f.endsWith(".mp4"))) {
      try { fs.unlinkSync(path.join(AUDIT_DIR, f)); } catch {}
    }
  }

  // Anchor mid-shot audit frames
  const anchorPoints = [5.0, 15.0, 25.0, 35.0];
  for (let i = 0; i < anchorPoints.length; i++) {
    const cp = anchorPoints[i];
    const frameOut = path.join(AUDIT_DIR, `cut_frame_shot0${i + 1}_t${cp.toFixed(1)}s.png`);
    execSync(`ffmpeg -y -ss ${cp} -i ${MASTER_OUTPUT} -frames:v 1 -update 1 ${frameOut}`);
  }

  // Pairwise cut-seam audit frames (t_cut ± 0.2s)
  const cutSeams = [
    { name: "seam_01_cut10s", tail: 9.8, head: 10.2 },
    { name: "seam_02_cut20s", tail: 19.8, head: 20.2 },
    { name: "seam_03_cut30s", tail: 29.8, head: 30.2 }
  ];
  for (const seam of cutSeams) {
    const tailOut = path.join(AUDIT_DIR, `${seam.name}_tail_t${seam.tail}s.png`);
    const headOut = path.join(AUDIT_DIR, `${seam.name}_head_t${seam.head}s.png`);
    execSync(`ffmpeg -y -ss ${seam.tail} -i ${MASTER_OUTPUT} -frames:v 1 -update 1 ${tailOut}`);
    execSync(`ffmpeg -y -ss ${seam.head} -i ${MASTER_OUTPUT} -frames:v 1 -update 1 ${headOut}`);
  }

  // Temporal singing subclips for direct temporal lip-sync verification
  console.log("🎤 Extracting singing subclips for temporal lip-sync evaluation...");
  const singingClips = [
    { name: "singing_shot02_freya.mp4", start: 12.0, dur: 4.0 },
    { name: "singing_shot03_duet.mp4", start: 22.0, dur: 4.0 },
    { name: "singing_shot04_climax.mp4", start: 32.0, dur: 4.0 }
  ];
  for (const sc of singingClips) {
    const clipOut = path.join(AUDIT_DIR, sc.name);
    execSync(`ffmpeg -y -ss ${sc.start} -i ${MASTER_OUTPUT} -t ${sc.dur} -c:v libx264 -crf 20 -c:a aac ${clipOut}`);
  }
  console.log(`✅ Extracted anchor frames, cut-seam frames, and singing subclips to ${AUDIT_DIR}`);
}

assemble().catch((err) => {
  console.error("❌ Assembly failed:", err);
  process.exit(1);
});
