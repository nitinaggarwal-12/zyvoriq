import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface LibraryAssetItem {
  id: string;
  canonicalId?: string;
  canonicalUrl?: string;
  studioUrl?: string;
  posterSrc?: string;
  projectId: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  assetType:
    | "combined_master"
    | "act_master"
    | "turn_segment"
    | "baked_custom"
    | "face_anchor"
    | "blueprint_pending_render"
    | "audio_master"
    | "audio_track"
    | "audio_sfx"
    | "audio_narration"
    | "keyframe_image";
  genre: string;
  durationSec: number;
  frames?: number;
  fps?: string;
  audioSpec: string;
  partIndex?: number;
  speedMultiplier?: number;
  wardrobe?: string;
  location?: string;
  promptSummary: string;
  src: string;
  createdAt: string;
}

function getManifestPath(): string {
  return path.join(process.cwd(), "public/assets/swarm/library_manifest.json");
}

export function normalizeMediaRelPath(rawSrc: string): string {
  const clean = String(rawSrc || "").split("?")[0].split("#")[0].trim();
  return clean
    .replace(/^\/api\/media\/assets\//, "assets/")
    .replace(/^\/api\/media\//, "")
    .replace(/^\//, "");
}

export function deriveCanonicalReelId(rawId: string, title?: string): string {
  const upper = String(rawId || "").toUpperCase();
  if (upper.startsWith("ZYV-")) return upper;
  const rawLower = String(rawId || "").toLowerCase();
  const isLegacyCuratedJob =
    /^job_179(0|27|28|3105000)/.test(rawLower) || !rawLower.startsWith("job_");
  if (isLegacyCuratedJob) {
    const lower = `${rawId} ${title || ""}`.toLowerCase();
    if (lower.includes("mission") && lower.includes("impossible")) return "ZYV-REEL-MI10-300S";
    if (lower.includes("kailash") && lower.includes("option 2")) return "ZYV-REEL-KAILASH-OPT2";
    if (lower.includes("kailash") && lower.includes("option 1")) return "ZYV-REEL-KAILASH-OPT1";
    if (lower.includes("cursed hunter")) return "ZYV-REEL-HUNTER-60S";
    if (lower.includes("crimson echoes") || lower.includes("speakeasy")) return "ZYV-REEL-SPEAKEASY-60S";
    if (lower.includes("barcelona") || lower.includes("bhangra")) return "ZYV-REEL-BARCELONA-60S";
    if (lower.includes("neotokyo") || lower.includes("quantum")) return "ZYV-REEL-NEOTOKYO-60S";
  }
  const digits = String(rawId).replace(/\D/g, "").slice(-6);
  const slug = String(title || rawId)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  return `ZYV-REEL-${slug || "STUDIO"}${digits ? `-${digits}` : ""}`;
}

function enrichCanonicalUrls(item: LibraryAssetItem): LibraryAssetItem {
  const canonicalId = item.canonicalId || deriveCanonicalReelId(item.id, item.title);
  return {
    ...item,
    canonicalId,
    canonicalUrl: item.canonicalUrl || `/entity/${canonicalId}`,
    studioUrl: item.studioUrl || `/swarm-MUI?reel=${encodeURIComponent(canonicalId)}`,
  };
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
      const curatedProjectIds = new Set([
        "job_1793105000_mission_impossible_10_multiverse_300s",
        "job_1790974000000_kailash_epic",
        "job_1792785702413",
        "job_1790807322189_opt2_native",
        "job_1790793528334",
      ]);
      for (const dir of entries) {
        if (curatedProjectIds.has(dir.name)) continue;
        const statePath = path.join(genRoot, dir.name, "job_state.json");
        if (!fs.existsSync(statePath)) continue;
        try {
          const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
          if (state.status !== "completed" || !state.combinedSrc) continue;
          const relClean = normalizeMediaRelPath(state.combinedSrc);
          const absVideo = path.join(process.cwd(), "public", relClean);
          if (!fs.existsSync(absVideo)) continue;
          const segCount =
            Array.isArray(state.segments) && state.segments.length > 0
              ? state.segments.length
              : 2;
          const durationSec =
            typeof state.durationSeconds === "number" && state.durationSeconds > 0
              ? state.durationSeconds
              : segCount * 30;
          const preferredFile = path.join(
            genRoot,
            dir.name,
            `combined_${durationSec}s.mp4`
          );
          const resolvedSrc = fs.existsSync(preferredFile)
            ? `/api/media/assets/swarm/generated/${dir.name}/combined_${durationSec}s.mp4`
            : `/api/media/${relClean}`;
          const posterFile = path.join(genRoot, dir.name, "scene1_anchor.jpg");
          const posterSrc = fs.existsSync(posterFile)
            ? `/api/media/assets/swarm/generated/${dir.name}/scene1_anchor.jpg`
            : undefined;
          const canonicalId =
            state.canonicalId || deriveCanonicalReelId(dir.name, state.title);
          dynamicJobs.push(
            enrichCanonicalUrls({
              id: canonicalId,
              canonicalId,
              canonicalUrl: `/entity/${canonicalId}`,
              studioUrl: `/swarm-MUI?reel=${encodeURIComponent(canonicalId)}`,
              posterSrc,
              projectId: dir.name,
              projectTitle: state.title || `Studio Master (${dir.name})`,
              title: state.title?.includes("Master")
                ? state.title
                : `${state.title || dir.name} — Combined ${durationSec}.0s Master`,
              subtitle: `${segCount}-Act Multi-Scene Master (${durationSec}.0s • ${Math.floor(
                durationSec / 60
              )}:${String(durationSec % 60).padStart(2, "0")} • 24/1 CFR)`,
              assetType: "combined_master",
              genre: state.genre || "Studio Production",
              durationSec,
              frames: durationSec * 24,
              fps: "24/1 CFR",
              audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
              speedMultiplier: 1.0,
              wardrobe: "Multi-Act Character Wardrobe Progression",
              location: "Multi-Act Studio Set Progression",
              promptSummary:
                state.act1Prompt || state.title || "Multi-Act 24/1 CFR Studio Master",
              src: resolvedSrc,
              createdAt: new Date(
                state.updatedAt || state.createdAt || Date.now()
              ).toISOString(),
            })
          );
        } catch {
          // ignore malformed job_state.json
        }
      }
    } catch {
      // ignore directory scan errors
    }
  }

  const candidates: LibraryAssetItem[] = [
    enrichCanonicalUrls({
      id: "ZYV-REEL-MI10-300S",
      canonicalId: "ZYV-REEL-MI10-300S",
      canonicalUrl: "/entity/ZYV-REEL-MI10-300S",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-MI10-300S",
      posterSrc:
        "/api/media/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/scene1_anchor.jpg",
      projectId: "job_1793105000_mission_impossible_10_multiverse_300s",
      projectTitle:
        "Mission: Impossible 10 — The Multiverse Protocol (5-Min / 300.0s 10-Act 35mm Master)",
      title:
        "Mission: Impossible 10 — The Multiverse Protocol (5-Min / 300.0s 10-Act 35mm Master)",
      subtitle:
        "10-Act Parallel-Universe Spy Thriller • Ethan Cross & Dr. Elena Vance (300.0s / 5:00 • 24/1 CFR • 124 BPM Score)",
      assetType: "combined_master",
      genre: "35mm Parallel-Universe Spy Thriller Epic",
      durationSec: 300.0,
      frames: 7200,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS Sidechain Ducked)",
      speedMultiplier: 1.0,
      wardrobe:
        "Tactical Obsidian Field Trench, Alpine Stealth Rig, Formal Geneva Tuxedo & Quantum Visor",
      location:
        "Geneva Quantum Collider → Prague Mirror Vault → Neo-Tokyo Orbital Tether",
      promptSummary:
        "mission impossible 10 trailer in parallel universe 5 min (300.0s / 10 Parallel 30s Acts)",
      src: "/api/media/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4",
      createdAt: "2026-10-27T12:20:15Z",
    }),
    enrichCanonicalUrls({
      id: "ZYV-REEL-KAILASH-OPT2",
      canonicalId: "ZYV-REEL-KAILASH-OPT2",
      canonicalUrl: "/entity/ZYV-REEL-KAILASH-OPT2",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-KAILASH-OPT2",
      posterSrc:
        "/api/media/assets/swarm/generated/job_1790974000000_kailash_epic/scene1_anchor.jpg",
      projectId: "job_1790974000000_kailash_epic",
      projectTitle: "Sacred Kailash: Ganesh, Parvati & Shiva — 35mm Visual Epic",
      title:
        "Sacred Kailash: Ganesh, Parvati & Shiva (Option 2: Lip-Synced Dialogue + Lyria 3 Theatrical Score + Sidechain Ducking)",
      subtitle:
        "6-Shot 35mm Mythological Cinema • Parvati, Ganesha & Shiva (60.0s • 24/1 CFR • 108 BPM Theatrical Score)",
      assetType: "combined_master",
      genre: "Sacred Indian Mythological Epic",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS Sidechain Ducked)",
      speedMultiplier: 1.0,
      wardrobe:
        "Crimson & Gold Temple Silk Sari, Saffron Dhoti & Crown, Tiger-Skin & Trishul",
      location: "Sacred Sandstone Gates & Snowy Bridge of Mount Kailash",
      promptSummary:
        "a 5 min high quality visual story with best sound and visual effects with dialogs, dynamic background music based on Ganesh Parvati and Shiva story similar to https://www.youtube.com/watch?v=m55XOXtscXU",
      src: "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3",
      createdAt: "2026-10-03T07:15:00Z",
    }),
    enrichCanonicalUrls({
      id: "ZYV-REEL-KAILASH-OPT1",
      canonicalId: "ZYV-REEL-KAILASH-OPT1",
      canonicalUrl: "/entity/ZYV-REEL-KAILASH-OPT1",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-KAILASH-OPT1",
      posterSrc:
        "/api/media/assets/swarm/generated/job_1790974000000_kailash_epic/scene2_anchor.jpg",
      projectId: "job_1790974000000_kailash_epic",
      projectTitle:
        "Sacred Kailash: Ganesh, Parvati & Shiva — Symphonic Devotional Master",
      title:
        "Sacred Kailash: Ganesh, Parvati & Shiva (Option 1: Lyria 3 Pro IMAX Symphonic Score + Dialogue)",
      subtitle:
        "108 BPM Vedic War Drums, Brass Swells, Temple Bells, Bansuri & Strings (60.0s • 24/1 CFR)",
      assetType: "combined_master",
      genre: "Sacred Indian Mythological Epic",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS Symphonic Mix)",
      speedMultiplier: 1.0,
      wardrobe:
        "Crimson & Gold Temple Silk Sari, Saffron Dhoti & Crown, Tiger-Skin & Trishul",
      location: "Sacred Sandstone Gates & Snowy Bridge of Mount Kailash",
      promptSummary:
        "Continuous 108 BPM Lyria 3 Pro Big-Movie Theatrical Vedic orchestral score + LFE SFX with lip-synced dialogue for Ganesh, Parvati, and Shiva at Mount Kailash.",
      src: "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4?v=theatrical3",
      createdAt: "2026-10-03T07:14:00Z",
    }),
    enrichCanonicalUrls({
      id: "ZYV-REEL-HUNTER-60S",
      canonicalId: "ZYV-REEL-HUNTER-60S",
      canonicalUrl: "/entity/ZYV-REEL-HUNTER-60S",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-HUNTER-60S",
      projectId: "job_1790807322189_opt2_native",
      projectTitle: "The Cursed Hunter — 35mm Live-Action 60s Campaign",
      title: "The Cursed Hunter — 35mm Live-Action 60s Campaign",
      subtitle:
        "6-Act Snowy Basalt Pass Confrontation • Kaelen & Lyra (60.0s • 24/1 CFR)",
      assetType: "combined_master",
      genre: "35mm Dramatic Fantasy Cinema",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
      speedMultiplier: 1.0,
      wardrobe: "Weathered Fur Cloak & Arctic Linen Tunic",
      location: "Frozen Basalt Canyon Pass at Arctic Twilight",
      promptSummary:
        "The Cursed Hunter: 60s 35mm confrontation in a snowy basalt canyon with unarmed Lyra and Kaelen.",
      src: "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4",
      createdAt: "2026-10-02T18:30:00Z",
    }),
    enrichCanonicalUrls({
      id: "ZYV-REEL-SPEAKEASY-60S",
      canonicalId: "ZYV-REEL-SPEAKEASY-60S",
      canonicalUrl: "/entity/ZYV-REEL-SPEAKEASY-60S",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-SPEAKEASY-60S",
      projectId: "job_1790793528334",
      projectTitle: "Crimson Echoes — 1920s Art-Deco Speakeasy 60s Master",
      title: "Crimson Echoes — 1920s Art-Deco Speakeasy 60s Master",
      subtitle:
        "6-Act Velvet Jazz-Noir Performance • Clara & Julian (60.0s • 24/1 CFR • 118 BPM)",
      assetType: "combined_master",
      genre: "1920s Art-Deco Jazz Cinema",
      durationSec: 60.0,
      frames: 1440,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo AAC (-14.0 LUFS)",
      speedMultiplier: 1.0,
      wardrobe: "Crimson Silk Evening Gown & Midnight Tuxedo",
      location: "1920s Art-Deco Underground Speakeasy Stage",
      promptSummary:
        "Crimson Echoes: 60s 1920s Art-Deco speakeasy jazz performance with Julian and Clara.",
      src: "/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4",
      createdAt: "2026-10-01T14:20:00Z",
    }),
    ...dynamicJobs,
  ];

  const deduped = new Map<string, LibraryAssetItem>();
  for (const item of candidates) {
    const absPath = path.join(
      process.cwd(),
      "public",
      normalizeMediaRelPath(item.src)
    );
    if (!fs.existsSync(absPath)) continue;
    const key = item.canonicalId || item.id;
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }
  return Array.from(deduped.values());
}

function curatedProjectIdsFilter(projectId?: string, canonicalId?: string): boolean {
  const pid = String(projectId || "");
  const cid = String(canonicalId || "").toUpperCase();
  if (cid.startsWith("ZYV-REEL-SACREDKA-")) return true;
  if (
    pid === "job_1792785702413" ||
    (pid === "job_1790974000000_kailash_epic" &&
      cid !== "ZYV-REEL-KAILASH-OPT2" &&
      cid !== "ZYV-REEL-KAILASH-OPT1")
  ) {
    return true;
  }
  return false;
}

function atomicWriteJson(targetPath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmpPath, targetPath);
}

const CURATED_CANONICAL_IDS = new Set([
  "ZYV-REEL-MI10-300S",
  "ZYV-REEL-KAILASH-OPT2",
  "ZYV-REEL-KAILASH-OPT1",
  "ZYV-REEL-HUNTER-60S",
  "ZYV-REEL-SPEAKEASY-60S",
]);

export function loadLibraryAssets(options?: {
  includePendingBlueprints?: boolean;
  includeAudioAndImages?: boolean;
}): LibraryAssetItem[] {
  const includePending = Boolean(options?.includePendingBlueprints);
  const includeAudioImg = Boolean(options?.includeAudioAndImages);
  const manifestPath = getManifestPath();
  const verifiedDefaults = discoverVerifiedMastersOnDisk();
  if (!fs.existsSync(manifestPath)) {
    atomicWriteJson(manifestPath, verifiedDefaults);
    return verifiedDefaults;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const rawArray = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
      ? parsed.items
      : [];
    const valid = rawArray
      .filter((item: LibraryAssetItem) => {
        if (!item || typeof item.src !== "string") return false;
        const idStr = String(item.id || "");
        const cidStr = String(item.canonicalId || "").toUpperCase();
        if (
          idStr.endsWith("_initial") ||
          /_act\d+_/i.test(idStr) ||
          cidStr.startsWith("ZYV-ACT-") ||
          item.assetType === "act_master" ||
          item.assetType === "turn_segment" ||
          item.assetType === "face_anchor"
        ) {
          return false;
        }
        if (item.assetType === "blueprint_pending_render") {
          return includePending;
        }
        if (
          item.assetType === "audio_master" ||
          item.assetType === "audio_track" ||
          item.assetType === "audio_sfx" ||
          item.assetType === "audio_narration" ||
          item.assetType === "keyframe_image"
        ) {
          return includeAudioImg;
        }
        if (item.assetType === "baked_custom") return true;
        if (curatedProjectIdsFilter(item.projectId, cidStr)) return false;
        const cleanRel = normalizeMediaRelPath(item.src);
        if (!cleanRel) return false;
        const absFile = path.join(process.cwd(), "public", cleanRel);
        return fs.existsSync(absFile) && fs.statSync(absFile).isFile();
      })
      .map(enrichCanonicalUrls);
    const curatedFirst = verifiedDefaults.filter((d) =>
      CURATED_CANONICAL_IDS.has(String(d.canonicalId || d.id))
    );
    const dynamicFallbacks = verifiedDefaults.filter(
      (d) => !CURATED_CANONICAL_IDS.has(String(d.canonicalId || d.id))
    );
    const mergedMap = new Map<string, LibraryAssetItem>();
    for (const item of [...curatedFirst, ...valid, ...dynamicFallbacks]) {
      const enriched = enrichCanonicalUrls(item);
      const key = enriched.canonicalId || enriched.id;
      const existing = mergedMap.get(key);
      if (!existing) {
        mergedMap.set(key, enriched);
      } else if (
        (String(existing.projectId || "").startsWith("synth_") ||
          existing.assetType === "blueprint_pending_render") &&
        !String(enriched.projectId || "").startsWith("synth_") &&
        enriched.assetType !== "blueprint_pending_render"
      ) {
        mergedMap.set(key, enriched);
      }
    }
    const merged = Array.from(mergedMap.values());
    return merged.length > 0 ? merged : verifiedDefaults;
  } catch {
    return verifiedDefaults;
  }
}

export function appendLibraryAssets(
  newItems: LibraryAssetItem[]
): LibraryAssetItem[] {
  const existing = loadLibraryAssets({
    includePendingBlueprints: true,
    includeAudioAndImages: true,
  });
  const map = new Map<string, LibraryAssetItem>();
  for (const item of [...newItems.map(enrichCanonicalUrls), ...existing]) {
    const key = item.canonicalId || item.id;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, enrichCanonicalUrls(item));
    } else if (
      prev.assetType === "blueprint_pending_render" &&
      item.assetType !== "blueprint_pending_render" &&
      item.src
    ) {
      map.set(key, enrichCanonicalUrls(item));
    }
  }
  const merged = Array.from(map.values());
  atomicWriteJson(manifestPathOrDefault(), merged);
  return merged;
}

function manifestPathOrDefault(): string {
  return getManifestPath();
}

