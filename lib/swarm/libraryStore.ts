import fs from "node:fs";
import path from "node:path";

export interface LibraryAssetItem {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  assetType:
    | "combined_master"
    | "act_master"
    | "turn_segment"
    | "baked_custom"
    | "face_anchor";
  genre: string;
  durationSec: number;
  frames: number;
  fps: string;
  audioSpec: string;
  partIndex?: number;
  speedMultiplier?: number;
  wardrobe: string;
  location: string;
  promptSummary: string;
  src: string;
  createdAt: string;
}

function getManifestPath(): string {
  return path.join(process.cwd(), "public/assets/swarm/library_manifest.json");
}

function discoverVerifiedMastersOnDisk(): LibraryAssetItem[] {
  const dynamicJobs: LibraryAssetItem[] = [];
  const genRoot = path.join(process.cwd(), "public/assets/swarm/generated");
  if (fs.existsSync(genRoot)) {
    try {
      const entries = fs
        .readdirSync(genRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith("job_"))
        .sort((a, b) => b.name.localeCompare(a.name));
      for (const dir of entries) {
        const statePath = path.join(genRoot, dir.name, "job_state.json");
        if (!fs.existsSync(statePath)) continue;
        try {
          const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
          if (state.status !== "completed" || !state.combinedSrc) continue;
          const cleanSrc = String(state.combinedSrc).split("?")[0];
          const absVideo = path.join(process.cwd(), "public", cleanSrc.replace(/^\//, ""));
          if (!fs.existsSync(absVideo)) continue;
          const segCount = Array.isArray(state.segments) && state.segments.length > 0 ? state.segments.length : 2;
          const durationSec = segCount * 30;
          const preferredFile = path.join(genRoot, dir.name, `combined_${durationSec}s.mp4`);
          const resolvedSrc = fs.existsSync(preferredFile)
            ? `/assets/swarm/generated/${dir.name}/combined_${durationSec}s.mp4`
            : cleanSrc;
          dynamicJobs.push({
            id: `${dir.name}_combined`,
            projectId: dir.name,
            projectTitle: state.title || `Studio Master (${dir.name})`,
            title: `${state.title || dir.name} — Combined ${durationSec}.0s Master`,
            subtitle: `${segCount}-Act Multi-Scene Master (${durationSec}.0s • 24/1 CFR)`,
            assetType: "combined_master",
            genre: state.genre || "Studio Production",
            durationSec,
            frames: durationSec * 24,
            fps: "24/1 CFR",
            audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
            speedMultiplier: 1.0,
            wardrobe: "Multi-Act Character Wardrobe Progression",
            location: "Multi-Act Studio Set Progression",
            promptSummary: state.act1Prompt || state.title || "Multi-Act 24/1 CFR Studio Master",
            src: resolvedSrc,
            createdAt: new Date(state.updatedAt || state.createdAt || Date.now()).toISOString(),
          });
        } catch {
          // ignore malformed job_state.json
        }
      }
    } catch {
      // ignore directory scan errors
    }
  }

  const candidates: LibraryAssetItem[] = [
    ...dynamicJobs,
    {
      id: "reel_spain_girls_60s",
      projectId: "proj_spain_marbella_60s",
      projectTitle: "Spain Marbella Golden Hour to Midnight Fiesta (60s Master)",
      title: "Spain Marbella Golden Hour to Midnight Fiesta (60s Master)",
      subtitle: "Act I Sunlit Infinity Pool → Act II Torchlit Andalusian Courtyard",
      assetType: "combined_master",
      genre: "Spanish Latin Pop & Reggaeton",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
      speedMultiplier: 1.0,
      wardrobe: "Act I: Ibiza Crochet & Silk Pareo | Act II: Liquid-Gold Chainmail Gown",
      location: "Marbella Infinity Pool Deck → Torchlit Andalusian Courtyard",
      promptSummary:
        "60.0s 2-Act Mediterranean celebration transitioning at 00:30 from sunlit marble pool terrace to torchlit midnight fiesta.",
      src: "/assets/swarm/punjabi_spain_girls_group_60s_omni_1_1_flash_flawless.mp4",
      createdAt: "2026-09-21T22:15:00Z",
    },
    {
      id: "reel_bollywood_masterB_60s",
      projectId: "proj_master_b_v2",
      projectTitle: "Udaipur Pool Villa to Superyacht (60s Master)",
      title: "Udaipur Pool Villa to Superyacht (60s Master)",
      subtitle: "Act I Sunlit Pool Villa → Act II Twilight Superyacht Deck",
      assetType: "combined_master",
      genre: "Bollywood Royal Pop",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
      speedMultiplier: 1.0,
      wardrobe: "Act I: Crimson-Rose & Gold Lehenga | Act II: Royal Emerald-Sapphire Couture",
      location: "Sunlit Cliffside Pool Villa → Twilight Superyacht Deck",
      promptSummary:
        "60.0s 24fps dance reel with locked lead facial identity across sunlit pool villa and twilight superyacht deck.",
      src: "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4",
      createdAt: "2026-09-21T21:40:00Z",
    },
    {
      id: "reel_punjabi_spain_60s",
      projectId: "proj_punjabi_marbella_60s",
      projectTitle: "Punjabi x Mediterranean Poolside Anthem (60s Master)",
      title: "Punjabi x Mediterranean Poolside Anthem (60s Master)",
      subtitle: "Dhol-Pop & Acoustic Guitar Fusion (Act I + Act II)",
      assetType: "combined_master",
      genre: "Punjabi Pop & Bhangra Fusion",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
      speedMultiplier: 1.0,
      wardrobe: "Act I: Resort Linen & Phulkari Accents | Act II: Midnight Velvet Couture",
      location: "Marbella Poolside Terrace → Midnight Courtyard",
      promptSummary:
        "60.0s high-energy Punjabi-Mediterranean fusion dance video with 5-tier ensemble cast.",
      src: "/assets/swarm/punjabi_spain_poolside_full_60s_omni_1_1_flash.mp4",
      createdAt: "2026-09-21T20:55:00Z",
    },
  ];

  return candidates.filter((item) => {
    const absPath = path.join(process.cwd(), "public", item.src.replace(/^\//, "").split("?")[0]);
    return fs.existsSync(absPath);
  });
}

export function loadLibraryAssets(): LibraryAssetItem[] {
  const manifestPath = getManifestPath();
  const verifiedDefaults = discoverVerifiedMastersOnDisk();
  if (!fs.existsSync(manifestPath)) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(verifiedDefaults, null, 2), "utf8");
    return verifiedDefaults;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const rawArray = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
        ? parsed.items
        : [];
    // Filter out any stale entry whose video file does not exist on disk
    const valid = rawArray.filter((item: LibraryAssetItem) => {
      if (!item || typeof item.src !== "string") return false;
      const cleanRel = item.src.replace(/^\//, "").split("?")[0];
      return fs.existsSync(path.join(process.cwd(), "public", cleanRel));
    });
    const mergedMap = new Map<string, LibraryAssetItem>();
    for (const item of [...verifiedDefaults, ...valid]) {
      mergedMap.set(item.id, item);
    }
    const merged = Array.from(mergedMap.values());
    return merged.length > 0 ? merged : verifiedDefaults;
  } catch {
    return verifiedDefaults;
  }
}

export function appendLibraryAssets(newItems: LibraryAssetItem[]): LibraryAssetItem[] {
  const existing = loadLibraryAssets();
  const map = new Map<string, LibraryAssetItem>();
  for (const item of [...newItems, ...existing]) {
    map.set(item.id, item);
  }
  const merged = Array.from(map.values());
  fs.mkdirSync(path.dirname(getManifestPath()), { recursive: true });
  fs.writeFileSync(getManifestPath(), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}
