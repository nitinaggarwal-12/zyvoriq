import fs from "node:fs";
import path from "node:path";
import { createProgress } from "./yt_progress.mjs";

const REELS = [
  {
    id: "yt_spain_pool_party_omni_hybrid",
    workDir: "scratch/yt_spain_pool_party",
    topic: "Pool Party Music Video in Summer in Spain Calendar Shoot (🥇 Omni 1.1 Hybrid Master)",
  },
  {
    id: "yt_chandigarh_club_omni_hybrid",
    workDir: "scratch/yt_chandigarh_club",
    topic: "2 hot young fashion diva top model punjabi college girls performing on stage in chandigarh night club",
  },
  {
    id: "yt_punjabi_stage_omni_hybrid",
    workDir: "scratch/yt_punjabi_stage",
    topic: "young punjabi college girl in mini skirt and crop top performing on stage in Punjabi Hindi",
  },
  {
    id: "yt_summer_roadtrip_omni_hybrid",
    workDir: "scratch/yt_omni_master",
    topic: "summer roadtrip (sunlit Lisbon terrace)",
  },
  {
    id: "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985",
    workDir: "scratch/yt/yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985",
    topic: "Modern pop music video 2 yound model singing dancing in studio",
  },
];

for (const reel of REELS) {
  const workPath = path.join(process.cwd(), reel.workDir);
  if (!fs.existsSync(workPath)) {
    console.warn(`Skipping ${reel.id}: ${workPath} not found`);
    continue;
  }

  const pubDir = path.join(process.cwd(), "public", "renders", "yt", reel.id);
  fs.mkdirSync(pubDir, { recursive: true });

  // Copy core files
  const filesToCopy = [
    ["master_hybrid.mp4", "master_hybrid.mp4"],
    ["master_hybrid.mp4", "master.mp4"],
    ["master_native.mp4", "master_native.mp4"],
    ["master_lyria.mp4", "master_lyria.mp4"],
    ["song.mp3", "song.mp3"],
    ["anchor.png", "anchor.png"],
    ["dossier.json", "dossier.json"],
    ["audit.json", "audit.json"],
    ["shotplan.json", "shotplan.json"],
  ];

  for (const [srcName, destName] of filesToCopy) {
    const src = path.join(workPath, srcName);
    const dest = path.join(pubDir, destName);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }

  // Also copy public/renders/yt/${id}.mp4 to master_hybrid.mp4
  const topLevelMp4 = path.join(process.cwd(), "public", "renders", "yt", `${reel.id}.mp4`);
  const hybridSrc = path.join(pubDir, "master_hybrid.mp4");
  if (fs.existsSync(hybridSrc)) {
    fs.copyFileSync(hybridSrc, topLevelMp4);
  }

  // Copy shots
  const shotplanPath = path.join(workPath, "shotplan.json");
  let shotplan = [];
  if (fs.existsSync(shotplanPath)) {
    try {
      shotplan = JSON.parse(fs.readFileSync(shotplanPath, "utf-8"));
    } catch {}
  }

  const shotsList = [];
  const shotsDir = path.join(workPath, "shots");

  // Check if this is the 6-shot studio reel
  if (reel.id === "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985") {
    const studio6Shots = [
      { index: 1, durationSec: 4.85, lyric: "We burn bright in the neon light" },
      { index: 2, durationSec: 3.88, lyric: "Dancing through the summer night" },
      { index: 3, durationSec: 3.88, lyric: "Feel the beat, we're flying high" },
      { index: 4, durationSec: 3.80, lyric: "Underneath the emerald sky" },
      { index: 5, durationSec: 3.80, lyric: "We burn bright in the neon light (Encore Close-Up)" },
      { index: 6, durationSec: 3.79, lyric: "Feel the beat, we're flying high (Finale)" },
    ];
    for (const s of studio6Shots) {
      shotsList.push({
        id: `${reel.id}_shot_${s.index}`,
        index: s.index,
        url: `/renders/yt/${reel.id}/shot_${s.index}.mp4?v=hybrid_std`,
        durationSec: s.durationSec,
        lyric: s.lyric,
      });
    }
  } else if (fs.existsSync(shotsDir)) {
    const shotFiles = fs.readdirSync(shotsDir).filter(f => f.endsWith(".mp4")).sort();
    shotFiles.forEach((file, idx) => {
      const index = idx + 1;
      const destShot = path.join(pubDir, `shot_${index}.mp4`);
      fs.copyFileSync(path.join(shotsDir, file), destShot);
      const sp = shotplan.find(x => x.index === index) || shotplan[idx] || {};
      shotsList.push({
        id: `${reel.id}_shot_${index}`,
        index,
        url: `/renders/yt/${reel.id}/shot_${index}.mp4?v=hybrid_std`,
        durationSec: sp.durationSec || 6.0,
        lyric: sp.lyric || `Shot ${index} Choreography & Performance`,
      });
    });
  }

  let audit = {};
  const auditPath = path.join(workPath, "audit.json");
  if (fs.existsSync(auditPath)) {
    try {
      audit = JSON.parse(fs.readFileSync(auditPath, "utf-8"));
    } catch {}
  }

  const assets = {
    masterHybridUrl: `/renders/yt/${reel.id}/master_hybrid.mp4?v=hybrid_std`,
    masterNativeUrl: `/renders/yt/${reel.id}/master_native.mp4?v=hybrid_std`,
    masterNative16sUrl: reel.id === "yt_b18ca6d6-dd6a-4648-9026-0e03e8a93985"
      ? `/renders/yt/${reel.id}/master_native_16s_tight.mp4?v=hybrid_std`
      : undefined,
    masterLyriaUrl: `/renders/yt/${reel.id}/master_lyria.mp4?v=hybrid_std`,
    songUrl: `/renders/yt/${reel.id}/song.mp3`,
    anchorUrl: `/renders/yt/${reel.id}/anchor.png`,
    dossierUrl: `/renders/yt/${reel.id}/dossier.json`,
    auditUrl: `/renders/yt/${reel.id}/audit.json`,
    shots: shotsList,
  };

  const progress = await createProgress(reel.id, { log: console.log });
  await progress.setProduction("READY", null, {
    manifest: {
      videoUrl: assets.masterHybridUrl,
      masterUrl: assets.masterHybridUrl,
      assets,
      audit,
    },
    renders: [
      { id: "hybrid", label: "🥇 Hybrid Master (Lyria Bed + Live Vocals)", url: assets.masterHybridUrl },
      { id: "native", label: "🎤 Original Native Audio", url: assets.masterNativeUrl },
      { id: "lyria", label: "🎼 Pure Lyria Audio", url: assets.masterLyriaUrl },
    ],
  });
  await progress.close();

  console.log(`✅ Standardized ${reel.id} (${shotsList.length} shots, Hybrid Master default)`);
}
