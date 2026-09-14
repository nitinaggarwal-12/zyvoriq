import fs from "node:fs";
import path from "node:path";
import { createProgress } from "./yt_progress.mjs";

const SCRATCH_ROOT = path.resolve(process.cwd(), "scratch");
const PUB_YT_ROOT = path.resolve(process.cwd(), "public", "renders", "yt");
fs.mkdirSync(PUB_YT_ROOT, { recursive: true });

async function publishProductionFolder(id, srcDir) {
  if (!fs.existsSync(srcDir)) return null;
  const destDir = path.join(PUB_YT_ROOT, id);
  fs.mkdirSync(destDir, { recursive: true });

  const copyIfPresent = (srcRel, destName) => {
    const fullSrc = path.join(srcDir, srcRel);
    if (fs.existsSync(fullSrc)) {
      const fullDest = path.join(destDir, destName);
      fs.copyFileSync(fullSrc, fullDest);
      return `/renders/yt/${id}/${destName}`;
    }
    return null;
  };

  const hybridUrl = copyIfPresent("master_hybrid.mp4", "master_hybrid.mp4") || copyIfPresent("master.mp4", "master_hybrid.mp4");
  const nativeUrl = copyIfPresent("master_native.mp4", "master_native.mp4");
  const lyriaVideoUrl = copyIfPresent("master_lyria.mp4", "master_lyria.mp4");
  const masterUrl = copyIfPresent("master.mp4", "master.mp4") || hybridUrl;
  // Also ensure top-level /renders/yt/${id}.mp4 exists
  if (fs.existsSync(path.join(srcDir, "master.mp4"))) {
    fs.copyFileSync(path.join(srcDir, "master.mp4"), path.join(PUB_YT_ROOT, `${id}.mp4`));
  }

  const songUrl = copyIfPresent("song.mp3", "song.mp3");
  const songCutUrl = copyIfPresent("song_cut.mp3", "song_cut.mp3");
  const anchorUrl = copyIfPresent("anchor.png", "anchor.png");
  const dossierUrl = copyIfPresent("dossier.json", "dossier.json");
  const auditUrl = copyIfPresent("audit.json", "audit.json");
  const shotplanUrl = copyIfPresent("shotplan.json", "shotplan.json");

  // Shots
  const shots = [];
  let shotPlan = [];
  try {
    if (fs.existsSync(path.join(srcDir, "shotplan.json"))) {
      shotPlan = JSON.parse(fs.readFileSync(path.join(srcDir, "shotplan.json"), "utf8"));
    }
  } catch {}

  for (let i = 1; i <= 8; i++) {
    const sUrl = copyIfPresent(`shots/s${i}.mp4`, `shot_${i}.mp4`) || copyIfPresent(`shot_0${i}.mp4`, `shot_${i}.mp4`);
    if (sUrl) {
      const planEntry = shotPlan[i - 1] || {};
      shots.push({
        index: i,
        id: `${id}_shot_${i}`,
        title: `Shot ${i} (${planEntry.framing || "MEDIUM"})`,
        lyric: planEntry.lyric || planEntry.vocalDirective || "",
        durationSec: planEntry.targetSec || planEntry.duration || 6,
        videoUrl: sUrl,
      });
    }
  }

  let audit = null;
  try {
    if (fs.existsSync(path.join(srcDir, "audit.json"))) {
      audit = JSON.parse(fs.readFileSync(path.join(srcDir, "audit.json"), "utf8"));
    }
  } catch {}

  let dossier = null;
  try {
    if (fs.existsSync(path.join(srcDir, "dossier.json"))) {
      dossier = JSON.parse(fs.readFileSync(path.join(srcDir, "dossier.json"), "utf8"));
    }
  } catch {}

  const assets = {
    masterHybridUrl: hybridUrl || `/renders/yt/${id}.mp4`,
    masterNativeUrl: nativeUrl,
    masterLyriaUrl: lyriaVideoUrl,
    songUrl,
    songCutUrl,
    anchorUrl,
    dossierUrl,
    auditUrl,
    shotplanUrl,
    shots,
  };

  const manifest = {
    videoUrl: `/renders/yt/${id}.mp4`,
    assets,
    audit,
    dossier,
  };

  const renders = [
    { label: "Hybrid Master (Demucs Bed + Omni Vocals)", url: assets.masterHybridUrl, type: "hybrid" },
    ...(nativeUrl ? [{ label: "Original Native Audio (Omni)", url: nativeUrl, type: "native" }] : []),
    ...(lyriaVideoUrl ? [{ label: "Pure Lyria 3.5 Audio Master", url: lyriaVideoUrl, type: "lyria" }] : []),
  ];

  const p = await createProgress(id, { log: console.log });
  await p.setProduction("READY", null, { manifest, renders });
  await p.close();
  console.log(`Published all assets for ${id}:`, {
    masterHybridUrl: assets.masterHybridUrl,
    masterNativeUrl: assets.masterNativeUrl,
    masterLyriaUrl: assets.masterLyriaUrl,
    songUrl: assets.songUrl,
    anchorUrl: assets.anchorUrl,
    shotCount: shots.length,
  });
}

(async () => {
  // 1. User's newly generated reel
  await publishProductionFolder(
    "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985",
    path.join(SCRATCH_ROOT, "yt", "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985")
  );

  // 2. Spain Pool Party
  await publishProductionFolder(
    "yt_spain_pool_party_omni_hybrid",
    path.join(SCRATCH_ROOT, "yt_spain_pool_party")
  );

  // 3. Any other folders inside scratch/yt/
  const ytSubdir = path.join(SCRATCH_ROOT, "yt");
  if (fs.existsSync(ytSubdir)) {
    for (const entry of fs.readdirSync(ytSubdir)) {
      if (entry.startsWith("yt_") && entry !== "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985") {
        await publishProductionFolder(entry, path.join(ytSubdir, entry));
      }
    }
  }
})();
