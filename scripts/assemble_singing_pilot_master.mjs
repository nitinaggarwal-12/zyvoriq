import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/spain_college_swim_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const FINAL_VIDEO = path.join(BASE_DIR, "spain_college_swim_15s_pilot.mp4");

console.log("========================================================================");
console.log("🎬 RE-ASSEMBLING PILOT: AUDIBLE SINGING AT 4S + SCENIC INTRO + DIVE DROP");
console.log("========================================================================");

// 1. Prepare video shots with exact durations:
// Shot 1: Drone over sea and villa (4.000s)
const s1 = path.join(CLIPS_DIR, "s1_4s.mp4");
execSync(`ffmpeg -y -ss 0 -t 4.000 -i ${CLIPS_DIR}/s1_graded.mp4 -c:v copy -an ${s1}`);

// Shot 2: Maya singing at pool edge (8.000s, 4.0s to 12.0s)
const s2 = path.join(CLIPS_DIR, "s2_8s.mp4");
execSync(`ffmpeg -y -ss 0 -t 8.000 -i ${CLIPS_DIR}/s2_graded.mp4 -c:v copy -an ${s2}`);

// Shot 3: Maya diving into pool at golden hour (3.484s, 12.0s to 15.484s)
const s3 = path.join(CLIPS_DIR, "s3_3s.mp4");
execSync(`ffmpeg -y -ss 0 -t 3.484 -i ${CLIPS_DIR}/s3_dive.mp4 -c:v copy -an ${s3}`);

// Concat video
const concatList = path.join(BASE_DIR, "singing_concat.txt");
fs.writeFileSync(concatList, `file '${path.resolve(s1)}'\nfile '${path.resolve(s2)}'\nfile '${path.resolve(s3)}'\n`);

const concatVideo = path.join(CLIPS_DIR, "singing_timeline.mp4");
execSync(`ffmpeg -y -f concat -safe 0 -i ${concatList} -c:v copy ${concatVideo}`);

// 2. Prepare Audio Stems:
// Stem A: Background music bed for 15.484s (seeking 0.58s to eliminate silence)
const bedAudio = path.join(BASE_DIR, "bed_15s.wav");
execSync(`ffmpeg -y -ss 0.58 -t 15.484 -i ${MASTER_AUDIO} -c:a pcm_s16le ${bedAudio}`);

// Stem B: Maya's native singing vocal (8.0s) extracted directly from shot_2_raw.mp4
// At 0.0s of this stem: "Sunrise hits the villa walls, no turning back. No me llames, I won't call, we're off the track."
const mayaVocal = path.join(BASE_DIR, "maya_vocal_8s.wav");
execSync(`ffmpeg -y -ss 0 -t 8.000 -i ${CLIPS_DIR}/shot_2_raw.mp4 -vn -c:a pcm_s16le ${mayaVocal}`);

// Stem C: Beat drop climax (3.5s) for the dive
const diveDrop = path.join(BASE_DIR, "dive_drop_4s.wav");
execSync(`ffmpeg -y -ss 15.0 -t 4.0 -i ${MASTER_AUDIO} -c:a pcm_s16le ${diveDrop}`);

// 3. Mix audio:
// - 0s to 4s: Background music (bed) playing at full volume (scenic sea)
// - 4s to 12s: Maya's vocal comes up loud and clear (volume=1.4), bed dips slightly (volume=0.3)
// - 12s to 15.5s: Beat drop surges as Maya dives into the water
const mixedAudio = path.join(BASE_DIR, "final_singing_mix.wav");
const filter = [
  `[0:a]volume=0.45[bed]`,
  `[1:a]adelay=4000|4000,volume=1.4[vox]`,
  `[2:a]adelay=12000|12000,volume=1.1[drop]`,
  `[bed][vox][drop]amix=inputs=3:duration=first:dropout_transition=0[aout]`
].join(";");

execSync(`ffmpeg -y -i ${bedAudio} -i ${mayaVocal} -i ${diveDrop} -filter_complex "${filter}" -map "[aout]" -c:a pcm_s16le ${mixedAudio}`);

// 4. Mux video and audio into final release
execSync(`ffmpeg -y -i ${concatVideo} -i ${mixedAudio} -c:v copy -c:a aac -b:a 256k -shortest ${FINAL_VIDEO}`);

console.log("✅ Final Video Generated:", FINAL_VIDEO);

// 5. Verification
const probeDur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${FINAL_VIDEO}`).toString().trim();
console.log("⏱️ Duration:", probeDur);

const silenceCheck = execSync(`ffmpeg -i ${FINAL_VIDEO} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const hasSilence = silenceCheck.includes("silence_start");
console.log("🔇 Silence check:", hasSilence ? "WARNING" : "CLEAN (0 silence intervals)");
