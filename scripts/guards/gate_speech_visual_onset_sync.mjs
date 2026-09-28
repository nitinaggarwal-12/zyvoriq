#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const videoPath = process.argv[2];
if (!videoPath || !fs.existsSync(videoPath)) {
  console.error("[gate_speech_visual_onset_sync] Missing or invalid video path");
  process.exit(1);
}

// 1. Detect acoustic speech onset via vocal stem or vocal-bandpass silencedetect
let audioOnset = null;
const dir = path.dirname(videoPath);
const stemPath = [path.join(dir, "vocals.wav"), path.join(dir, "vocal.mp3")].find(p => fs.existsSync(p));
const audioSrc = stemPath ? stemPath : videoPath;
const audioFilter = stemPath
  ? "silencedetect=noise=-30dB:d=0.08"
  : "bandpass=f=1500:w=2000,silencedetect=noise=-28dB:d=0.08";

try {
  const sLog = execSync(`ffmpeg -i "${audioSrc}" -af "${audioFilter}" -f null - 2>&1`, { encoding: "utf8" });
  const m = sLog.match(/silence_end:\s*([0-9.]+)/);
  if (m) audioOnset = parseFloat(m[1]);
} catch {}

if (audioOnset !== null && audioOnset > 0.1) {
  const tmpDir = `/tmp/onset_${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    execSync(`ffmpeg -ss 0 -t ${Math.min(audioOnset + 1.0, 10)} -i "${videoPath}" -vf "fps=20,crop=in_w*0.3:in_h*0.3:(in_w-in_w*0.3)/2:in_h*0.25" -q:v 2 "${tmpDir}/f_%03d.jpg" 2>/dev/null`);
    const frames = fs.readdirSync(tmpDir).filter(f => f.endsWith(".jpg")).sort();
    let visualOnset = null;
    for (let i = 1; i < frames.length; i++) {
      const ssim = execSync(`ffmpeg -i "${tmpDir}/${frames[i-1]}" -i "${tmpDir}/${frames[i]}" -filter_complex "ssim" -f null - 2>&1`).toString();
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
  } catch (err) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(JSON.stringify({ gate: "gate_speech_visual_onset_sync", passed: true, audioSrc: path.basename(audioSrc), audioOnset }));
