import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const reels = [
  { id: "studio1_01bd8d8d", uuid: "studio1_01bd8d8d-b5b1-484f-96a3-d9a433db1f6a", note: "character sheet failed — shot_01 unanchored" },
  { id: "studio1_5bfb958d", uuid: "studio1_5bfb958d-cae5-4147-9bd5-bde17cf67ac4", note: "5 shots" },
  { id: "studio1_d2d144d2", uuid: "studio1_d2d144d2-e696-48e3-9341-68f4ef96455a", note: "6 shots" },
  { id: "studio1_05579f63", uuid: "studio1_05579f63-187c-4fde-b349-5a1b7dbf6193", note: "7 shots" },
  { id: "studio1_37f1f557", uuid: "studio1_37f1f557-2c30-4da1-bf34-3a2a9fdbcbf8", note: "longest chain (9 shots)" },
  { id: "studio1_9f360810", uuid: "studio1_9f360810-20f5-48ba-b3a4-f315bd3ea5c8", note: "6 shots" },
  { id: "studio1_290443e2", uuid: "studio1_290443e2-07fa-48a2-8fba-4a1d52a5479c", note: "6 shots" },
  { id: "studio1_e2e00945", uuid: "studio1_e2e00945-e431-4228-bb7b-33cc68f0fa72", note: "8 shots" }
];

const BASE_DIR = path.resolve(process.env.HOME || "", "zyvoriq_remote/scratch/reels_evaluation");
fs.mkdirSync(path.join(BASE_DIR, "frames"), { recursive: true });

async function getManifest(uuid) {
  try {
    const res = await fetch(`https://zyvoriq.up.railway.app/api/studio1/productions/${uuid}`);
    const data = await res.json();
    return data.production?.manifest || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log("=== STARTING REEL FORENSIC EVALUATION ===");
  const results = [];

  for (const r of reels) {
    console.log(`\nEvaluating [${r.id}] (${r.note})...`);
    const mp4Path = path.join(BASE_DIR, `${r.id}.mp4`);
    if (!fs.existsSync(mp4Path) || fs.statSync(mp4Path).size < 1000000) {
      console.log(`Downloading ${r.id}.mp4...`);
      const manifest = await getManifest(r.uuid);
      const roughCutUrl = manifest?.outputs?.narratedRoughCut?.videoUrl || manifest?.studio1?.outputCertification?.suppressedVideoUrl;
      if (!roughCutUrl) {
        console.error(`No rough cut URL found for ${r.id}`);
        continue;
      }
      const fullUrl = `https://zyvoriq.up.railway.app${roughCutUrl}`;
      execSync(`curl -L -s -f -o "${mp4Path}" "${fullUrl}"`);
    }

    const manifest = await getManifest(r.uuid);
    const framesDir = path.join(BASE_DIR, "frames", r.id);
    fs.mkdirSync(framesDir, { recursive: true });

    // 1. FFprobe metadata
    const probeJson = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${mp4Path}"`).toString();
    const probe = JSON.parse(probeJson);
    const videoStream = probe.streams.find(s => s.codec_type === "video");
    const audioStream = probe.streams.find(s => s.codec_type === "audio");
    const durationSec = Number(probe.format.duration);
    const width = videoStream?.width;
    const height = videoStream?.height;
    const fps = videoStream?.r_frame_rate;
    const audioDuration = audioStream?.duration ? Number(audioStream.duration) : durationSec;

    // 2. Measure audio loudness via ebur128
    let integratedLoudness = "N/A";
    try {
      const ebuOut = execSync(`ffmpeg -i "${mp4Path}" -filter:a ebur128 -f null - 2>&1`).toString();
      const match = /Integrated loudness:\s+I:\s+([-\d.]+)\s+LUFS/i.exec(ebuOut);
      if (match) integratedLoudness = `${match[1]} LUFS`;
    } catch (e) {}

    // 3. Extract keyframes for each shot
    const shots = manifest?.shots || [];
    const shotCount = shots.length;
    const capturedFrames = [];

    if (shotCount > 0) {
      let cumulativeTime = 0;
      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        const shotDur = shot.editorialDurationSec || (durationSec / shotCount);
        const midTime = Math.min(durationSec - 0.2, cumulativeTime + shotDur / 2);
        const frameFile = path.join(framesDir, `shot_${String(i + 1).padStart(2, "0")}_mid.jpg`);
        execSync(`ffmpeg -y -ss ${midTime.toFixed(2)} -i "${mp4Path}" -vframes 1 -q:v 2 "${frameFile}" 2>/dev/null`);
        capturedFrames.push({
          shotIndex: i + 1,
          timeSec: midTime.toFixed(2),
          frameFile: `scratch/reels_evaluation/frames/${r.id}/shot_${String(i + 1).padStart(2, "0")}_mid.jpg`,
          scriptText: shot.scriptText,
          prompt: shot.generationPrompt
        });
        cumulativeTime += shotDur;
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const t = ((i + 0.5) * durationSec / 6).toFixed(2);
        const frameFile = path.join(framesDir, `frame_${i + 1}.jpg`);
        execSync(`ffmpeg -y -ss ${t} -i "${mp4Path}" -vframes 1 -q:v 2 "${frameFile}" 2>/dev/null`);
        capturedFrames.push({ shotIndex: i + 1, timeSec: t, frameFile: `scratch/reels_evaluation/frames/${r.id}/frame_${i + 1}.jpg` });
      }
    }

    // 4. Generate contact sheet mosaic
    const contactSheetName = `contact_sheet_${r.id}.jpg`;
    const contactSheetPath = path.join(framesDir, contactSheetName);
    const cols = Math.min(shotCount || 6, 4);
    const rows = Math.ceil((shotCount || 6) / cols);
    try {
      const totalThumbs = shotCount || 6;
      const step = durationSec / totalThumbs;
      execSync(`ffmpeg -y -i "${mp4Path}" -vf "fps=1/${step.toFixed(3)},scale=270:480,tile=${cols}x${rows}" -frames:v 1 -q:v 2 "${contactSheetPath}" 2>/dev/null`);
    } catch (e) {
      console.error(`Contact sheet error for ${r.id}:`, e.message);
    }

    results.push({
      id: r.id,
      uuid: r.uuid,
      note: r.note,
      title: manifest?.topic || manifest?.title || "Untitled",
      shotCount,
      durationSec: durationSec.toFixed(2),
      audioDurationSec: audioDuration.toFixed(2),
      resolution: `${width}x${height}`,
      fps,
      integratedLoudness,
      contactSheet: `scratch/reels_evaluation/frames/${r.id}/${contactSheetName}`,
      capturedFrames,
      shotsSummary: shots.map(s => ({
        id: s.id,
        editorialDur: s.editorialDurationSec,
        genDur: s.generationDurationSec,
        actualDur: s.asset?.actualDurationSec,
        trimIn: s.trimInSec,
        trimOut: s.trimOutSec,
        text: s.scriptText
      }))
    });
  }

  const reportPath = path.join(BASE_DIR, "evaluation_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nEvaluation complete! Report written to ${reportPath}`);
}

main().catch(console.error);
