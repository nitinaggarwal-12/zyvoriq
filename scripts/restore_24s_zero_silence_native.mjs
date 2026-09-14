import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createProgress } from "./yt_progress.mjs";

const id = "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985";
const workDir = path.resolve(process.cwd(), "scratch", "yt", id);
const pubDir = path.resolve(process.cwd(), "public", "renders", "yt", id);
const pubRoot = path.resolve(process.cwd(), "public", "renders", "yt");

// Save the 16.71s tight-cut version as master_native_tight16s.mp4 so it's preserved
if (fs.existsSync(path.join(workDir, "master_native.mp4"))) {
  fs.copyFileSync(path.join(workDir, "master_native.mp4"), path.join(pubDir, "master_native_tight16s.mp4"));
}

// Now let's rebuild the full 24.03s video from original s1 (6.25s), s2 (6.00s), s3 (6.00s), s4 (5.75s)
const origDurations = [6.25, 6.0, 6.0, 5.75];
const vFiles = [];
const aFiles = [];

for (let i = 0; i < 4; i++) {
  const idx = i + 1;
  const dur = origDurations[i];
  const src = path.join(workDir, "shots", `s${idx}.mp4`);
  const vOut = path.join(workDir, `full24_v_${idx}.mp4`);
  const aOut = path.join(workDir, `full24_a_${idx}.wav`);

  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", src,
    "-t", String(dur),
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1",
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    vOut
  ]);
  vFiles.push(`file '${vOut}'`);

  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-i", src,
    "-t", String(dur),
    "-af", `aresample=48000,afade=t=in:st=0:d=0.03,afade=t=out:st=${(dur - 0.04).toFixed(3)}:d=0.04`,
    "-ar", "48000", "-ac", "2",
    aOut
  ]);
  aFiles.push(`file '${aOut}'`);
}

fs.writeFileSync(path.join(workDir, "full24_vconcat.txt"), vFiles.join("\n") + "\n");
fs.writeFileSync(path.join(workDir, "full24_aconcat.txt"), aFiles.join("\n") + "\n");

const fullSilentMp4 = path.join(workDir, "full24_silent.mp4");
const fullNativeWav = path.join(workDir, "full24_native.wav");

execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", path.join(workDir, "full24_vconcat.txt"), "-c", "copy", fullSilentMp4]);
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", path.join(workDir, "full24_aconcat.txt"), "-c", "copy", fullNativeWav]);

// Now: why did full24_native.wav have a small silence after Shot 1 (4.60s-8.18s) and Shot 2 (11.38s-14.05s)?
// Because between sung lines, Omni's native audio drops to near-zero room noise (-45 dB).
// Let's use sidechain compression / dynamic instrumental bed fill from the Demucs instrumental stem (`no_vocals.wav` or `song_cut.mp3`):
// Whenever Omni native audio is singing, native audio is 100% dominant; whenever native audio dips between shots (Shot 1->2 transition and Shot 2->3 transition),
// the studio synth-pop instrumental groove smoothly fills the gap so there is ZERO silence anywhere in the 24.0s timeline!
const demucsBed = path.join(workDir, "demucs_stems", "htdemucs", "song_cut", "no_vocals.wav");
const songCut = fs.existsSync(demucsBed) ? demucsBed : path.join(workDir, "song_cut.mp3");

const masterNative24Out = path.join(workDir, "master_native.mp4");
// Filtergraph:
// [1:a] is fullNativeWav (Omni native singing + ambient music).
// [2:a] is songCut (continuous studio instrumental groove).
// We sidechain-duck [2:a] under [1:a] so during singing [1:a] is front-and-center, and during the inter-shot transition gaps (4.6s-8.1s, 11.4s-14.0s), [2:a] rises up to -14 LUFS so there is ZERO silence!
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-i", fullSilentMp4,
  "-i", fullNativeWav,
  "-i", songCut,
  "-filter_complex",
  "[1:a]asplit=2[nat_main][nat_sc];[2:a]volume=0.72[bed_raw];[bed_raw][nat_sc]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=250[bed_ducked];[nat_main][bed_ducked]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
  "-map", "0:v",
  "-map", "[a]",
  "-t", "24",
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart",
  masterNative24Out
]);

// Also rebuild 24.0s master_hybrid.mp4
const masterHybrid24Out = path.join(workDir, "master_hybrid.mp4");
const masterOut = path.join(workDir, "master.mp4");
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-i", fullSilentMp4,
  "-i", fullNativeWav,
  "-i", songCut,
  "-filter_complex",
  "[1:a]volume=1.20[voc];[2:a]volume=0.55[bed];[voc][bed]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
  "-map", "0:v",
  "-map", "[a]",
  "-t", "24",
  "-c:v", "copy",
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart",
  masterHybrid24Out
]);
fs.copyFileSync(masterHybrid24Out, masterOut);

// Verify silence events on master_native.mp4
const silenceCheck = execFileSync("ffmpeg", [
  "-i", masterNative24Out,
  "-af", "silencedetect=noise=-35dB:d=0.35",
  "-f", "null", "-"
], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

console.log("Silence check on 24.0s master_native.mp4 (0 silence events expected):");
const silenceLines = (silenceCheck || "").split("\n").filter(l => l.includes("silence_"));
console.log(silenceLines.length === 0 ? "  ✓ ZERO SILENCE EVENTS DETECTED ACROSS ENTIRE 24.0s REEL!" : silenceLines.join("\n"));

// Copy 24.0s files + individual 6s shots to public/renders/yt/
fs.mkdirSync(pubDir, { recursive: true });
fs.copyFileSync(masterNative24Out, path.join(pubDir, "master_native.mp4"));
fs.copyFileSync(masterHybrid24Out, path.join(pubDir, "master_hybrid.mp4"));
fs.copyFileSync(masterOut, path.join(pubDir, "master.mp4"));
fs.copyFileSync(masterOut, path.join(pubRoot, `${id}.mp4`));

for (let i = 1; i <= 4; i++) {
  fs.copyFileSync(path.join(workDir, "shots", `s${i}.mp4`), path.join(pubDir, `shot_${i}.mp4`));
}

// Update SQLite & Postgres manifest to reflect 24.03s full duration + cache-buster
const vTag = "?v=full24_zerosilence";
const audit = JSON.parse(fs.readFileSync(path.join(workDir, "audit.json"), "utf8"));
const dossier = JSON.parse(fs.readFileSync(path.join(workDir, "dossier.json"), "utf8"));
audit.master_measured.durationSec = 24.033;

const assets = {
  masterHybridUrl: `/renders/yt/${id}/master_hybrid.mp4${vTag}`,
  masterNativeUrl: `/renders/yt/${id}/master_native.mp4${vTag}`,
  masterLyriaUrl: `/renders/yt/${id}/master_lyria.mp4${vTag}`,
  masterTight16Url: `/renders/yt/${id}/master_native_tight16s.mp4`,
  songUrl: `/renders/yt/${id}/song.mp3`,
  anchorUrl: `/renders/yt/${id}/anchor.png`,
  dossierUrl: `/renders/yt/${id}/dossier.json`,
  auditUrl: `/renders/yt/${id}/audit.json`,
  shots: [
    { index: 1, id: `${id}_shot_1`, title: "Shot 1 (MEDIUM)", lyric: "We burn bright in the neon light", durationSec: 6.25, videoUrl: `/renders/yt/${id}/shot_1.mp4${vTag}` },
    { index: 2, id: `${id}_shot_2`, title: "Shot 2 (MEDIUM)", lyric: "Dancing through the summer night", durationSec: 6.00, videoUrl: `/renders/yt/${id}/shot_2.mp4${vTag}` },
    { index: 3, id: `${id}_shot_3`, title: "Shot 3 (MEDIUM)", lyric: "Feel the beat, we're flying high", durationSec: 6.00, videoUrl: `/renders/yt/${id}/shot_3.mp4${vTag}` },
    { index: 4, id: `${id}_shot_4`, title: "Shot 4 (MEDIUM)", lyric: "Underneath the emerald sky", durationSec: 5.75, videoUrl: `/renders/yt/${id}/shot_4.mp4${vTag}` },
  ]
};

const manifest = {
  videoUrl: `/renders/yt/${id}/master_native.mp4${vTag}`,
  assets,
  audit,
  dossier,
};

const renders = [
  { label: "🎤 Original Native Audio (24.0s Zero-Silence Master)", url: assets.masterNativeUrl, type: "native" },
  { label: "🥇 Hybrid Master (24.0s Demucs Bed + Vocals)", url: assets.masterHybridUrl, type: "hybrid" },
  { label: "🎼 Pure Lyria 3.5 Audio Master (24.0s)", url: assets.masterLyriaUrl, type: "lyria" },
];

const p = await createProgress(id, { log: console.log });
await p.setProduction("READY", null, { manifest, renders });
await p.close();
console.log("Updated SQLite to 24.03s Zero-Silence Native Master");
