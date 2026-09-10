import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/malibu_baywatch_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");
const MASTER_AUDIO = path.join(BASE_DIR, "master_soundtrack_5min.mp3");
const SHOT2_RAW = path.join(CLIPS_DIR, "shot_2_raw.mp4");

const bedWav = path.join(BASE_DIR, "bed_continuous_15s.wav");
const chloeVocal = path.join(BASE_DIR, "chloe_native_vocal_48k.wav");
const finalMix = path.join(BASE_DIR, "final_broadcast_audio.wav");
const concatVideo = path.join(CLIPS_DIR, "conformed_timeline_15s.mp4");
const gradedVideoWithFade = path.join(CLIPS_DIR, "conformed_timeline_with_fade.mp4");
const finalVideo = path.join(BASE_DIR, "malibu_baywatch_15s_pilot.mp4");

console.log("========================================================================");
console.log("🎛️ ZYVORIQ MASTER AUDIO ENGINE: 48kHz HARMONIC RESAMPLING & VOCAL PRESENCE");
console.log("========================================================================");

// 1. Prepare Bed at uniform 48kHz
console.log("[1/4] Preparing continuous 48kHz Lyria background bed...");
execSync(`ffmpeg -y -ss 0.00 -t 15.239 -i "${MASTER_AUDIO}" -ar 48000 -ac 2 -c:a pcm_s16le "${bedWav}"`);

// 2. Extract Chloe's vocal at uniform 48kHz
console.log("[2/4] Extracting Chloe's native vocal stem at 48kHz...");
execSync(`ffmpeg -y -ss 0 -t 7.619 -i "${SHOT2_RAW}" -vn -ar 48000 -ac 2 -c:a pcm_s16le "${chloeVocal}"`);

// 3. Audio Mixing with Vocal Presence EQ & Automatic Ducking
console.log("[3/4] Compiling dual-stem mix with 48kHz synchronization...");
const mixFilter = [
  `[0:a]volume='if(between(t,3.810,11.429),0.30,0.85)':eval=frame[bed]`,
  `[1:a]adelay=3810|3810,volume=1.75,highpass=f=100,equalizer=f=3200:width_type=o:width=1.2:g=3.5[vox]`,
  `[bed][vox]amix=inputs=2:normalize=0:dropout_transition=0,afade=t=out:st=14.500:d=0.739[out]`
].join(";");

execSync(`ffmpeg -y -i "${bedWav}" -i "${chloeVocal}" -filter_complex "${mixFilter}" -map "[out]" -ar 48000 -ac 2 -c:a pcm_s16le "${finalMix}"`);
console.log("✅ Final 48kHz broadcast audio mix created:", finalMix);

// 4. Video Outro Fade & Muxing
console.log("[4/4] Conforming video outro and muxing final broadcast master...");
execSync(`ffmpeg -y -i "${concatVideo}" -vf "fade=t=out:st=14.85:d=0.38" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an "${gradedVideoWithFade}"`);
execSync(`ffmpeg -y -i "${gradedVideoWithFade}" -i "${finalMix}" -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest "${finalVideo}"`);
console.log("✅ Final Master Video created:", finalVideo);

// 5. Verification
const silenceCheck = execSync(`ffmpeg -i "${finalVideo}" -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const hasSilence = silenceCheck.includes("silence_start");
console.log("🔇 Silence check:", hasSilence ? "WARNING: Silence detected!" : "CLEAN (0 silence intervals found)");

const vol = execSync(`ffmpeg -i "${finalVideo}" -filter_complex "volumedetect" -f null - 2>&1 | grep "mean_volume\\|max_volume"`).toString().trim();
console.log("📊 Volume Levels:\n" + vol);

console.log("\n========================================================================");
console.log("🎉 MASTER RENDER COMPLETE!");
console.log("========================================================================");
