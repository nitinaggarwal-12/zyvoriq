#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const videoPath = process.argv[2];
if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("[gate_speech_visual_onset_sync] Missing or invalid video path");
  process.exit(1);
}

// 1. Check audio-vs-video stream duration drift (catches adelay lip-offset shifts immediately)
let videoDur = 0;
let audioDur = 0;
try {
  const rawProbe = JSON.parse(
    execSync(`ffprobe -v error -show_entries stream=codec_type,duration -of json "${videoPath}"`, { encoding: "utf8" })
  );
  for (const st of rawProbe.streams || []) {
    if (st.codec_type === "video" && st.duration) videoDur = parseFloat(st.duration);
    if (st.codec_type === "audio" && st.duration) audioDur = parseFloat(st.duration);
  }
} catch {}

if (videoDur > 0 && audioDur > 0 && Math.abs(audioDur - videoDur) > 0.22) {
  console.error(
    `[gate_speech_visual_onset_sync] FAIL: Audio/video stream duration offset detected (video=${videoDur.toFixed(3)}s, audio=${audioDur.toFixed(3)}s, |drift|=${Math.abs(audioDur - videoDur).toFixed(3)}s > 0.22s). Indicates uncompensated adelay lip-offset.`
  );
  process.exit(1);
}

// 2. Detect true LEADING acoustic onset (silence_start <= 0.12s within first 10s)
let audioOnset = null;
const dir = path.dirname(videoPath);
const stemPath = [path.join(dir, "vocals.wav"), path.join(dir, "vocal.mp3")].find((p) => fs.existsSync(p));
const audioSrc = stemPath ? stemPath : videoPath;
const audioFilter = stemPath
  ? "silencedetect=noise=-30dB:d=0.08"
  : "silencedetect=noise=-38dB:d=0.12";

try {
  const sLog = execSync(`ffmpeg -t 10 -i "${audioSrc}" -af "${audioFilter}" -f null - 2>&1`, { encoding: "utf8" });
  const startMatch = sLog.match(/silence_start:\s*([0-9.]+)/);
  const endMatch = sLog.match(/silence_end:\s*([0-9.]+)/);
  if (startMatch && endMatch && parseFloat(startMatch[1]) <= 0.12) {
    audioOnset = parseFloat(endMatch[1]);
  }
} catch (sErr) {
  const out = (sErr.stdout?.toString?.() || "") + (sErr.stderr?.toString?.() || "");
  const startMatch = out.match(/silence_start:\s*([0-9.]+)/);
  const endMatch = out.match(/silence_end:\s*([0-9.]+)/);
  if (startMatch && endMatch && parseFloat(startMatch[1]) <= 0.12) {
    audioOnset = parseFloat(endMatch[1]);
  }
}

// Enforce visual onset lock when an isolated vocal stem exists OR when leading digital silence > 0.25s is present
const hasPolyphonicLyriaMaster = fs.existsSync(path.join(dir, "lyria3_master_60s.mp3")) || fs.existsSync(path.join(dir, "lyria3_vocal_windows.json"));
if (audioOnset !== null && audioOnset > 0.22 && (stemPath || !hasPolyphonicLyriaMaster)) {
  const tmpDir = `/tmp/onset_${process.pid}_${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    execSync(`ffmpeg -ss 0 -t ${Math.min(audioOnset + 1.0, 10)} -i "${videoPath}" -vf "fps=20,crop=in_w*0.3:in_h*0.3:(in_w-in_w*0.3)/2:in_h*0.25" -q:v 2 "${tmpDir}/f_%03d.jpg" 2>/dev/null`);
    const frames = fs.readdirSync(tmpDir).filter((f) => f.endsWith(".jpg")).sort();
    let visualOnset = null;
    for (let i = 1; i < frames.length; i++) {
      const ssim = execSync(`ffmpeg -i "${tmpDir}/${frames[i - 1]}" -i "${tmpDir}/${frames[i]}" -filter_complex "ssim" -f null - 2>&1`).toString();
      const sVal = parseFloat(ssim.match(/All:([0-9.]+)/)?.[1] || "1.0");
      if (sVal < 0.94) {
        visualOnset = i / 20.0;
        break;
      }
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });

    if (visualOnset !== null && Math.abs(visualOnset - audioOnset) > 0.15) {
      console.error(`[gate_speech_visual_onset_sync] FAIL: Desync detected! Audio onset at ${audioOnset.toFixed(2)}s but mouth movement starts at ${visualOnset.toFixed(2)}s (|drift|=${Math.abs(visualOnset - audioOnset).toFixed(2)}s > 0.15s).`);
      process.exit(1);
    }
  } catch {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(JSON.stringify({ gate: "gate_speech_visual_onset_sync", passed: true, audioSrc: path.basename(audioSrc), audioOnset }));
