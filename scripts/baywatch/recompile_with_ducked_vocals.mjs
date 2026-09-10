import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE_DIR = "scratch/malibu_baywatch_5m";
const CLIPS_DIR = path.join(BASE_DIR, "clips");

const bedWav = path.join(BASE_DIR, "bed_continuous_15s.wav");
const chloeVocal = path.join(BASE_DIR, "chloe_native_vocal_7s6.wav");
const finalMix = path.join(BASE_DIR, "final_broadcast_audio.wav");
const concatVideo = path.join(CLIPS_DIR, "conformed_timeline_15s.mp4");
const gradedVideoWithFade = path.join(CLIPS_DIR, "conformed_timeline_with_fade.mp4");
const finalVideo = path.join(BASE_DIR, "malibu_baywatch_15s_pilot.mp4");

console.log("========================================================================");
console.log("🎛️ RECOMPILING WITH PURE DUAL-STEM MASTER (CHLOE LEAD VOCALS + LYRIA BED)");
console.log("========================================================================");

// Audio Architecture:
// 1. [0:a] Continuous Lyria Bed (15.239s):
//    - Uplifting Nu-Disco instrumental bed (bass, drums, synth groove, brass stabs).
//    - Runs continuously from 0:00 to 15.24s with zero silence.
//    - Ducked slightly during Chloe's verse (0.35x), surges to 0.85x for Shot 1 and Shot 3.
// 2. [1:a] Chloe's Native Lead Vocal (7.619s):
//    - Starts at t=3.810s (Shot 2 cut).
//    - Chloe sings: "Eyes on the horizon, sun burning gold, watching every wave..."
//    - Loud, articulate, and prominent (1.60x), perfectly synchronized with her on-screen lips.
//    - Concludes cleanly at 11.429s as the jet ski launches.
// 3. Smooth broadcast fadeout from 14.40s to 15.239s to resolve the 8-bar pilot cleanly.

const mixFilter = [
  `[0:a]volume='if(between(t,3.810,11.429),0.35,0.85)':eval=frame[bed]`,
  `[1:a]adelay=3810|3810,volume=1.60[vox]`,
  `[bed][vox]amix=inputs=2:normalize=0:dropout_transition=0,afade=t=out:st=14.400:d=0.839[out]`
].join(";");

console.log("Compiling clean dual-stem broadcast audio mix...");
execSync(`ffmpeg -y -i ${bedWav} -i ${chloeVocal} -filter_complex "${mixFilter}" -map "[out]" -c:a pcm_s16le ${finalMix}`);
console.log("✅ Final broadcast audio mix created:", finalMix);

// 2. Video Outro Fade:
console.log("Applying cinematic release to video timeline...");
execSync(`ffmpeg -y -i ${concatVideo} -vf "fade=t=out:st=14.85:d=0.38" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 24 -an ${gradedVideoWithFade}`);

// 3. Mux into final master video:
execSync(`ffmpeg -y -i ${gradedVideoWithFade} -i ${finalMix} -c:v copy -c:a aac -b:a 256k -shortest ${finalVideo}`);
console.log("✅ Final Master Video created:", finalVideo);

// 4. Verification:
const silenceCheck = execSync(`ffmpeg -i ${finalVideo} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`).toString();
const hasSilence = silenceCheck.includes("silence_start");
console.log("🔇 Silence check:", hasSilence ? "WARNING: Silence detected!" : "CLEAN (0 silence intervals found)");

const vol = execSync(`ffmpeg -i ${finalVideo} -filter_complex "volumedetect" -f null - 2>&1 | grep "mean_volume\\|max_volume"`).toString().trim();
console.log("📊 Volume Levels:\n" + vol);

console.log("\n========================================================================");
console.log("🎉 PURE DUAL-STEM MASTER COMPLETE!");
console.log("========================================================================");
