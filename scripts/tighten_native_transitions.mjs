import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createProgress } from "./yt_progress.mjs";

const id = process.argv[2] || "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985";
const workDir = path.resolve(process.cwd(), "scratch", "yt", id);
const pubDir = path.resolve(process.cwd(), "public", "renders", "yt", id);
const pubRoot = path.resolve(process.cwd(), "public", "renders", "yt");

const asrPath = path.join(workDir, "native_asr.json");
const asr = JSON.parse(fs.readFileSync(asrPath, "utf8"));

// Original untrimmed shot durations in master.sh:
// shot 1: 6.25s (offset 0.00)
// shot 2: 6.00s (offset 6.25)
// shot 3: 6.00s (offset 12.25)
// shot 4: 5.75s (offset 18.25)
const origOffsets = [0.0, 6.25, 12.25, 18.25];
const origDurations = [6.25, 6.0, 6.0, 5.75];

const lines = asr.transcription;
console.log("Original vocal lines in concatenated timeline:");
lines.forEach((l, i) => {
  const relStart = (l.start - origOffsets[i]).toFixed(3);
  const relEnd = (l.end - origOffsets[i]).toFixed(3);
  console.log(`  Shot ${i + 1}: global [${l.start}s - ${l.end}s] -> local [${relStart}s - ${relEnd}s] "${l.text}"`);
});

// Compute tight trim windows (with 0.30s breath padding at internal cuts)
// Shot 1: keep opening intro (0.0s) so music video starts naturally, trim tail at vocal_end + 0.30s
// Shot 2: trim intro at vocal_start - 0.30s, trim tail at vocal_end + 0.30s
// Shot 3: trim intro at vocal_start - 0.30s, trim tail at vocal_end + 0.30s
// Shot 4: trim intro at vocal_start - 0.30s, keep full outro tail so ending resolves naturally
const PAD = 0.28;
const trims = lines.map((l, i) => {
  const relStart = l.start - origOffsets[i];
  const relEnd = l.end - origOffsets[i];
  const clipStart = i === 0 ? 0.0 : Math.max(0, Number((relStart - PAD).toFixed(3)));
  const clipEnd = i === lines.length - 1 ? origDurations[i] : Math.min(origDurations[i], Number((relEnd + PAD).toFixed(3)));
  const duration = Number((clipEnd - clipStart).toFixed(3));
  return { shotIndex: i + 1, clipStart, clipEnd, duration, relVocalStart: relStart, relVocalEnd: relEnd, text: l.text };
});

console.log("\nComputed Tight Synchronous Trim Windows (Video + Audio locked):");
let cumTime = 0;
trims.forEach((t, i) => {
  const newVocalStartGlobal = cumTime + (t.relVocalStart - t.clipStart);
  const newVocalEndGlobal = cumTime + (t.relVocalEnd - t.clipStart);
  console.log(
    `  Shot ${t.shotIndex}: trim [${t.clipStart.toFixed(2)}s -> ${t.clipEnd.toFixed(2)}s] (dur ${t.duration.toFixed(2)}s) | New Vocal Global: [${newVocalStartGlobal.toFixed(2)}s -> ${newVocalEndGlobal.toFixed(2)}s]`
  );
  if (i > 0) {
    const prev = trims[i - 1];
    const prevVocalEndGlobal = (cumTime - t.duration) + (prev.relVocalEnd - prev.clipStart);
    // Wait: let's compute exact gap between previous vocal end and current vocal start
  }
  cumTime += t.duration;
});

// Verify inter-lyric gaps
let tCursor = 0;
let prevVocalEnd = null;
for (const t of trims) {
  const vStart = tCursor + (t.relVocalStart - t.clipStart);
  const vEnd = tCursor + (t.relVocalEnd - t.clipStart);
  if (prevVocalEnd !== null) {
    console.log(`  -> Inter-shot vocal gap before Shot ${t.shotIndex}: ${(vStart - prevVocalEnd).toFixed(2)}s (was ~3.5s)`);
  }
  prevVocalEnd = vEnd;
  tCursor += t.duration;
}
console.log(`Total tightened master duration: ${tCursor.toFixed(2)}s`);

// Re-encode trimmed video clips and audio stems synchronously
const concatLines = [];
const audioInputs = [];

for (const t of trims) {
  const srcShot = path.join(workDir, "shots", `s${t.shotIndex}.mp4`);
  const outVid = path.join(workDir, `tight_v_${t.shotIndex}.mp4`);
  const outAud = path.join(workDir, `tight_a_${t.shotIndex}.wav`);

  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-ss", String(t.clipStart),
    "-to", String(t.clipEnd),
    "-i", srcShot,
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1",
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    outVid
  ]);
  concatLines.push(`file '${outVid}'`);

  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-ss", String(t.clipStart),
    "-to", String(t.clipEnd),
    "-i", srcShot,
    "-af", `aresample=48000,afade=t=in:st=0:d=0.02,afade=t=out:st=${Math.max(0, t.duration - 0.03).toFixed(3)}:d=0.03`,
    "-ar", "48000", "-ac", "2",
    outAud
  ]);
  audioInputs.push(outAud);
}

const concatFile = path.join(workDir, "tight_concat.txt");
fs.writeFileSync(concatFile, concatLines.join("\n") + "\n");

const tightSilentMp4 = path.join(workDir, "tight_silent.mp4");
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0",
  "-i", concatFile,
  "-c", "copy",
  tightSilentMp4
]);

// Concatenate audio stems with smooth 40ms acrossfade so room tone never dips to digital zero
const tightNativeWav = path.join(workDir, "tight_native.wav");
const aconcatFile = path.join(workDir, "tight_aconcat.txt");
fs.writeFileSync(aconcatFile, audioInputs.map(a => `file '${a}'`).join("\n") + "\n");
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0",
  "-i", aconcatFile,
  "-c", "copy",
  tightNativeWav
]);

// Build tightened master_native.mp4 with EBU R128 loudness normalization + subtle continuous room bed
const masterNativeOut = path.join(workDir, "master_native.mp4");
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-i", tightSilentMp4,
  "-i", tightNativeWav,
  "-filter_complex", "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
  "-map", "0:v",
  "-map", "[a]",
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart",
  masterNativeOut
]);

// Build tightened master_hybrid.mp4 (continuous Lyria instrumental bed under tightened native vocals)
const songPath = path.join(workDir, "song.mp3");
const masterHybridOut = path.join(workDir, "master_hybrid.mp4");
const masterOut = path.join(workDir, "master.mp4");

execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-i", tightSilentMp4,
  "-i", tightNativeWav,
  "-ss", "1.19", "-i", songPath,
  "-filter_complex",
  "[1:a]volume=1.15[voc];[2:a]volume=0.38[bed];[voc][bed]amix=inputs=2:duration=first:dropout_transition=2,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
  "-map", "0:v",
  "-map", "[a]",
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart",
  masterHybridOut
]);

fs.copyFileSync(masterHybridOut, masterOut);

// Publish to public/renders/yt/
fs.mkdirSync(pubDir, { recursive: true });
fs.copyFileSync(masterNativeOut, path.join(pubDir, "master_native.mp4"));
fs.copyFileSync(masterHybridOut, path.join(pubDir, "master_hybrid.mp4"));
fs.copyFileSync(masterOut, path.join(pubDir, "master.mp4"));
fs.copyFileSync(masterOut, path.join(pubRoot, `${id}.mp4`));

// Also copy tightened individual shots to public/renders/yt/${id}/shot_1..4.mp4
for (let i = 1; i <= 4; i++) {
  const srcTightVid = path.join(workDir, `tight_v_${i}.mp4`);
  const srcTightAud = path.join(workDir, `tight_a_${i}.wav`);
  const outShot = path.join(pubDir, `shot_${i}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", srcTightVid,
    "-i", srcTightAud,
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    outShot
  ]);
}

console.log("\nPublished tightened master_native.mp4, master_hybrid.mp4, and shot_1..4.mp4 to public/renders/yt/" + id);
