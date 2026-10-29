import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import {
  loadLibraryAssets,
  deriveCanonicalReelId,
  LibraryAssetItem,
} from "@/lib/swarm/libraryStore";
import {
  synthesizeDeepResearchBible,
  DeepResearchProductionBible,
} from "@/lib/swarm/deepResearchBible";

export const runtime = "nodejs";

interface EntitySegmentItem {
  id: string;
  act: number;
  actId: string;
  canonicalActId: string;
  canonicalUrl: string;
  canonicalActUrl: string;
  studioUrl: string;
  studioActUrl: string;
  partIndex: number;
  timeRange: string;
  durationSec: number;
  rawSeconds: number;
  label: string;
  sublabel: string;
  videoSrc: string;
  src: string;
  cameraPreset: string;
  lensPreset: string;
  slugline?: string;
  speaker?: string;
  dialogue?: string;
  vfxCue?: string;
  lightingCue?: string;
  sfxAndFoleyCue?: string;
  continuityHandoffLock?: string;
}

interface ResolvedEntityPayload {
  id: string;
  canonicalId: string;
  entityType: "REEL" | "ACT";
  parentReelId?: string;
  actNumber?: number;
  canonicalUrl: string;
  studioUrl: string;
  title: string;
  subtitle: string;
  category: string;
  genre: string;
  durationSeconds: number;
  durationSec: number;
  durationLabel: string;
  aspectRatio: string;
  resolution: string;
  frames: number;
  fps: number;
  fpsLabel: string;
  audioSpec: string;
  videoSrc: string;
  videoUrl: string;
  posterSrc?: string;
  projectId: string;
  foundationModel: string;
  prompt: string;
  promptSummary: string;
  createdAt: string;
  actsCount: number;
  parallelWorkers: {
    totalWorkers: number;
    mode: string;
    engineLabel: string;
    veoWorkers: number;
    lyriaWorkers: number;
    chirpWorkers: number;
    muxWorker: number;
  };
  renderStatus?: "ready" | "rendering" | "fallback";
  isFallbackMaster?: boolean;
  fallbackReason?: string;
  activeJob?: {
    id: string;
    status: string;
    progress: number;
    stageLabel: string;
    latestLog?: string;
    part1Src?: string;
    combinedSrc?: string;
  };
  segments: EntitySegmentItem[];
  acts: EntitySegmentItem[];
  deepResearchBible: DeepResearchProductionBible;
}

const CAMERA_PRESETS_CYCLE = [
  "70mm IMAX Anamorphic Dolly In",
  "360° Bullet-Time Orbit",
  "FPV Tactical Drone Dive",
  "Low-Angle Tracking Rig",
  "SnorriCam Chest Mount",
  "Steadicam Whip-Pan",
  "Overhead Crane Reveal",
  "Telephoto 85mm Compression",
  "Macro Optical Push-In",
  "Helicopter Gimbal Sweep",
];

const LENS_PRESETS_CYCLE = [
  "Panavision C-Series 35mm Anamorphic",
  "ARRI Master Anamorphic 50mm T1.9",
  "Cooke S4/i 40mm Prime",
  "IMAX 70mm 15-Perf Hasselblad",
  "Atlas Orion 65mm Anamorphic",
  "Leica Summilux-C 29mm T1.4",
];

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function toMediaApiUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("/api/media/")) return rawUrl;
  if (rawUrl.startsWith("/assets/")) return `/api/media${rawUrl}`;
  return rawUrl;
}

function diskFileExistsForMediaUrl(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  const clean = rawUrl
    .split("?")[0]
    .replace(/^\/api\/media\//, "")
    .replace(/^\/+/, "");
  if (!clean) return false;
  const full = path.join(process.cwd(), "public", clean);
  return fs.existsSync(full) && fs.statSync(full).size > 1024;
}

function findNewestJobStateForCanonicalId(
  upperId: string
): Record<string, unknown> | null {
  const genRoot = path.join(process.cwd(), "public/assets/swarm/generated");
  if (!fs.existsSync(genRoot)) return null;
  let dirs: string[] = [];
  try {
    dirs = fs
      .readdirSync(genRoot)
      .filter((d) => d.startsWith("job_"))
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return null;
  }

  let bestMatch: Record<string, unknown> | null = null;
  let bestUpdated = -1;
  for (const dir of dirs) {
    const stateFile = path.join(genRoot, dir, "job_state.json");
    if (!fs.existsSync(stateFile)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(stateFile, "utf8")) as Record<
        string,
        unknown
      >;
      const cid = String(parsed.canonicalId || "").toUpperCase();
      const jid = String(parsed.id || dir).toUpperCase();
      if (cid === upperId || jid === upperId) {
        const updated = Number(parsed.updatedAt || parsed.createdAt || 0);
        if (updated >= bestUpdated) {
          bestUpdated = updated;
          bestMatch = parsed;
        }
      }
    } catch {
      // skip malformed state
    }
  }
  return bestMatch;
}

function buildEntityFromLibraryItem(
  item: LibraryAssetItem,
  requestedActIndex?: number,
  liveJobOverride?: Record<string, unknown> | null
): ResolvedEntityPayload {
  const canonicalId =
    item.canonicalId || deriveCanonicalReelId(item.id, item.title);
  const overrideJobId =
    liveJobOverride && typeof liveJobOverride.id === "string"
      ? liveJobOverride.id
      : "";
  const effectiveProjectId =
    overrideJobId &&
    liveJobOverride?.status === "completed" &&
    diskFileExistsForMediaUrl(String(liveJobOverride.combinedSrc || ""))
      ? overrideJobId
      : item.projectId;

  const genDir = path.join(
    process.cwd(),
    "public/assets/swarm/generated",
    effectiveProjectId
  );
  const statePath = path.join(genDir, "job_state.json");
  let rawState: Record<string, unknown> | null = liveJobOverride || null;
  if (!rawState && fs.existsSync(statePath)) {
    try {
      rawState = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
      rawState = null;
    }
  }

  const durationSec =
    (effectiveProjectId !== item.projectId &&
      Number(rawState?.durationSeconds)) ||
    item.durationSec ||
    60;
  const totalActs =
    durationSec >= 300 ? 10 : Math.max(2, Math.round(durationSec / 30));
  const actDur = Math.max(10, Math.round(durationSec / totalActs));

  const rawSegments = Array.isArray(rawState?.segments)
    ? (rawState.segments as Array<Record<string, unknown>>)
    : [];

  const actBasePrefix = canonicalId.replace(/^ZYV-REEL-/, "ZYV-ACT-");

  const segments: EntitySegmentItem[] =
    rawSegments.length > 0
      ? rawSegments.map((seg, idx) => {
          const partIndex = idx + 1;
          const actId =
            typeof seg.canonicalActId === "string"
              ? seg.canonicalActId
              : typeof seg.actId === "string"
              ? seg.actId
              : `${actBasePrefix}-${String(partIndex).padStart(2, "0")}`;
          const candidateActSrc =
            typeof seg.src === "string" && seg.src
              ? seg.src
              : `/api/media/assets/swarm/generated/${effectiveProjectId}/act${partIndex}_30s.mp4`;
          const normalizedSrc = diskFileExistsForMediaUrl(candidateActSrc)
            ? toMediaApiUrl(candidateActSrc)
            : "";
          const sDur = Number(seg.rawSeconds) || actDur;
          const startS = idx * sDur;
          const endS = startS + sDur;
          const cUrl = `/entity/${actId}`;
          const sUrl = `/swarm-MUI?reel=${encodeURIComponent(
            canonicalId
          )}&act=${encodeURIComponent(actId)}`;
          const lbl =
            typeof seg.label === "string" ? seg.label : `Act ${partIndex}`;
          const sublbl =
            typeof seg.sublabel === "string"
              ? seg.sublabel
              : `24/1 CFR • ${sDur}.0s Master Segment`;
          return {
            id: String(seg.id || `act-${partIndex}`),
            act: partIndex,
            actId,
            canonicalActId: actId,
            canonicalUrl: cUrl,
            canonicalActUrl: cUrl,
            studioUrl: sUrl,
            studioActUrl: sUrl,
            partIndex,
            timeRange: `${formatSec(startS)}–${formatSec(endS)}`,
            durationSec: sDur,
            rawSeconds: sDur,
            label: `${lbl} — ${sublbl}`,
            sublabel: sublbl,
            videoSrc: normalizedSrc,
            src: normalizedSrc,
            cameraPreset:
              CAMERA_PRESETS_CYCLE[idx % CAMERA_PRESETS_CYCLE.length],
            lensPreset: LENS_PRESETS_CYCLE[idx % LENS_PRESETS_CYCLE.length],
          };
        })
      : Array.from({ length: totalActs }).map((_, idx) => {
          const partIndex = idx + 1;
          const actId = `${actBasePrefix}-${String(partIndex).padStart(
            2,
            "0"
          )}`;
          const actFile = path.join(genDir, `act${partIndex}_30s.mp4`);
          const actSrc =
            fs.existsSync(actFile) && fs.statSync(actFile).size > 1024
              ? `/api/media/assets/swarm/generated/${effectiveProjectId}/act${partIndex}_30s.mp4`
              : diskFileExistsForMediaUrl(item.src)
              ? toMediaApiUrl(item.src)
              : "";
          const startS = idx * actDur;
          const endS = startS + actDur;
          const cUrl = `/entity/${actId}`;
          const sUrl = `/swarm-MUI?reel=${encodeURIComponent(
            canonicalId
          )}&act=${encodeURIComponent(actId)}`;
          return {
            id: `act-${partIndex}`,
            act: partIndex,
            actId,
            canonicalActId: actId,
            canonicalUrl: cUrl,
            canonicalActUrl: cUrl,
            studioUrl: sUrl,
            studioActUrl: sUrl,
            partIndex,
            timeRange: `${formatSec(startS)}–${formatSec(endS)}`,
            durationSec: actDur,
            rawSeconds: actDur,
            label: `Act ${partIndex} (${formatSec(startS)}–${formatSec(
              endS
            )}) — 24/1 CFR Master`,
            sublabel: `24/1 CFR • ${actDur}.0s Master Segment`,
            videoSrc: actSrc,
            src: actSrc,
            cameraPreset:
              CAMERA_PRESETS_CYCLE[idx % CAMERA_PRESETS_CYCLE.length],
            lensPreset: LENS_PRESETS_CYCLE[idx % LENS_PRESETS_CYCLE.length],
          };
        });

  const deepResearchBible = synthesizeDeepResearchBible({
    canonicalReelId: canonicalId,
    title: item.title,
    prompt: item.promptSummary || item.subtitle || "",
    durationSeconds: durationSec,
    actsCount: segments.length,
    segments: segments.map((s) => ({
      actId: s.actId,
      canonicalId: s.canonicalActId,
      timeRange: s.timeRange,
      cameraPreset: s.cameraPreset,
    })),
  });

  const enrichedSegments: EntitySegmentItem[] = segments.map((seg, idx) => {
    const actScene = deepResearchBible.screenplay.acts[idx];
    const leadCue = actScene?.characterCues?.[0];
    return {
      ...seg,
      slugline: actScene?.slugline,
      speaker: leadCue?.character,
      dialogue: leadCue?.dialogue,
      vfxCue: actScene?.vfxCue,
      lightingCue: actScene?.lightingCue,
      sfxAndFoleyCue: actScene?.sfxAndFoleyCue,
      continuityHandoffLock: actScene?.continuityHandoffLock,
    };
  });

  const rawFoundationModel =
    typeof rawState?.foundationModel === "string" ? rawState.foundationModel : "";
  const isFallback = rawState?.isFallbackMaster === true;
  const fallbackReason =
    typeof rawState?.fallbackReason === "string"
      ? rawState.fallbackReason
      : undefined;
  const isJobRunning =
    rawState?.status === "running" || rawState?.status === "queued";
  const isPendingBlueprint =
    item.assetType === "blueprint_pending_render" &&
    !(
      rawState?.status === "completed" &&
      typeof rawState.combinedSrc === "string" &&
      diskFileExistsForMediaUrl(rawState.combinedSrc)
    );
  const renderStatus: "ready" | "rendering" | "fallback" =
    isJobRunning || isPendingBlueprint
      ? "rendering"
      : isFallback
      ? "fallback"
      : "ready";

  const logsArr = Array.isArray(rawState?.logs)
    ? (rawState.logs as string[])
    : [];
  const activeJob = isJobRunning || isPendingBlueprint
    ? {
        id: String(rawState?.id || effectiveProjectId),
        status: String(rawState?.status || "rendering"),
        progress: Number(rawState?.progress || 16),
        stageLabel: String(
          rawState?.stageLabel || "Production Bible locked — preparing live multi-act studio render..."
        ),
        latestLog: logsArr.length > 0 ? logsArr[logsArr.length - 1] : undefined,
        part1Src:
          typeof rawState?.part1Src === "string" && rawState.part1Src
            ? toMediaApiUrl(rawState.part1Src)
            : undefined,
        combinedSrc:
          typeof rawState?.combinedSrc === "string" && rawState.combinedSrc
            ? toMediaApiUrl(rawState.combinedSrc)
            : undefined,
      }
    : undefined;

  const persistedEngineLabel =
    typeof (rawState?.parallelWorkers as Record<string, unknown> | undefined)
      ?.engineLabel === "string"
      ? String(
          (rawState?.parallelWorkers as Record<string, unknown>).engineLabel
        )
      : "";
  const isVeoPrimary = persistedEngineLabel
    ? persistedEngineLabel === "Veo 3.1"
    : (!isFallback && rawState?.usedVeo31Live === true) ||
      (!isFallback && rawFoundationModel === "veo31_4k") ||
      /\bveo\b/i.test(`${item.subtitle || ""} ${item.audioSpec || ""}`);
  const resolvedEngineLabel = isVeoPrimary ? "Veo 3.1" : "Omni 1.1";
  const resolvedFoundationModel =
    rawFoundationModel || (isVeoPrimary ? "veo31_4k" : "omni11_lyria3");

  const parallelWorkers = {
    totalWorkers: enrichedSegments.length + 3,
    mode: `Promise.all (${enrichedSegments.length} Concurrent ${resolvedEngineLabel} Video Workers + Lyria 3 Pro + Chirp 3 HD + FFmpeg Mux)`,
    engineLabel: resolvedEngineLabel,
    veoWorkers: enrichedSegments.length,
    lyriaWorkers: 1,
    chirpWorkers: 1,
    muxWorker: 1,
  };

  if (
    typeof requestedActIndex === "number" &&
    requestedActIndex >= 1 &&
    requestedActIndex <= enrichedSegments.length
  ) {
    const matchedAct = enrichedSegments[requestedActIndex - 1];
    return {
      id: matchedAct.actId,
      canonicalId: matchedAct.actId,
      entityType: "ACT",
      parentReelId: canonicalId,
      actNumber: matchedAct.act,
      canonicalUrl: matchedAct.canonicalUrl,
      studioUrl: matchedAct.studioUrl,
      title: `${item.title} — Act ${matchedAct.act}`,
      subtitle: matchedAct.sublabel,
      category: item.genre,
      genre: item.genre,
      durationSeconds: matchedAct.durationSec,
      durationSec: matchedAct.durationSec,
      durationLabel: `${matchedAct.durationSec}.0s Act (${matchedAct.timeRange})`,
      aspectRatio: "9:16 Uncropped Master (720×1280)",
      resolution: "720×1280 HD",
      frames: matchedAct.durationSec * 24,
      fps: 24,
      fpsLabel: "24/1 CFR",
      audioSpec: item.audioSpec,
      videoSrc: matchedAct.videoSrc,
      videoUrl: matchedAct.videoSrc,
      posterSrc: item.posterSrc,
      projectId: effectiveProjectId,
      foundationModel: resolvedFoundationModel,
      prompt: item.promptSummary,
      promptSummary: item.promptSummary,
      createdAt: item.createdAt,
      actsCount: enrichedSegments.length,
      parallelWorkers,
      renderStatus,
      isFallbackMaster: isFallback,
      fallbackReason,
      activeJob,
      segments: enrichedSegments,
      acts: enrichedSegments,
      deepResearchBible,
    };
  }

  let resolvedMainVideoSrc = diskFileExistsForMediaUrl(item.src)
    ? toMediaApiUrl(item.src)
    : "";
  if (
    rawState?.status === "completed" &&
    typeof rawState.combinedSrc === "string" &&
    diskFileExistsForMediaUrl(rawState.combinedSrc)
  ) {
    resolvedMainVideoSrc = toMediaApiUrl(rawState.combinedSrc);
  } else if (
    isJobRunning &&
    typeof rawState?.part1Src === "string" &&
    diskFileExistsForMediaUrl(rawState.part1Src)
  ) {
    resolvedMainVideoSrc = toMediaApiUrl(rawState.part1Src);
  }

  const resolvedPoster =
    rawState?.status === "completed" &&
    typeof rawState.posterSrc === "string" &&
    diskFileExistsForMediaUrl(rawState.posterSrc)
      ? toMediaApiUrl(rawState.posterSrc)
      : item.posterSrc
      ? toMediaApiUrl(item.posterSrc)
      : undefined;

  const rawAspect =
    typeof rawState?.aspectRatio === "string" ? rawState.aspectRatio : "9:16";
  const aspectLabel =
    rawAspect === "16:9"
      ? "16:9 Widescreen Cinema (1280×720)"
      : rawAspect === "1:1"
      ? "1:1 Square Feed Master (1080×1080)"
      : "9:16 Uncropped Master (720×1280)";
  const resolutionLabel =
    rawAspect === "16:9"
      ? "1280×720 HD"
      : rawAspect === "1:1"
      ? "1080×1080 HD"
      : "720×1280 HD";

  return {
    id: item.id,
    canonicalId,
    entityType: "REEL",
    canonicalUrl: `/entity/${canonicalId}`,
    studioUrl: `/swarm-MUI?reel=${encodeURIComponent(canonicalId)}`,
    title: item.title,
    subtitle: item.subtitle,
    category: item.genre,
    genre: item.genre,
    durationSeconds: durationSec,
    durationSec,
    durationLabel:
      durationSec >= 300
        ? `300.0s (5-Minute · ${enrichedSegments.length} Acts)`
        : `${durationSec}.0s (${enrichedSegments.length} Acts)`,
    aspectRatio: aspectLabel,
    resolution: resolutionLabel,
    frames: item.frames || durationSec * 24,
    fps: 24,
    fpsLabel: item.fps || "24/1 CFR",
    audioSpec: item.audioSpec,
    videoSrc: resolvedMainVideoSrc,
    videoUrl: resolvedMainVideoSrc,
    posterSrc: resolvedPoster,
    projectId: effectiveProjectId,
    foundationModel: resolvedFoundationModel,
    prompt: item.promptSummary,
    promptSummary: item.promptSummary,
    createdAt: item.createdAt,
    actsCount: enrichedSegments.length,
    parallelWorkers,
    renderStatus,
    isFallbackMaster: isFallback,
    fallbackReason,
    activeJob,
    segments: enrichedSegments,
    acts: enrichedSegments,
    deepResearchBible,
  };
}

const LEGACY_CANONICAL_ID_ALIASES: Record<string, string> = {
  "ZYV-REEL-AMUSICAL-300S": "ZYV-REEL-SHAKIRAHIP-60S-IC8B",
};

function attachAliasMetadata(
  payload: (ResolvedEntityPayload & { aliasedFromId?: string }) | null,
  rawUpper: string,
  upperId: string
): ResolvedEntityPayload | null {
  if (!payload) return null;
  if (rawUpper !== upperId) {
    payload.aliasedFromId = rawUpper;
  }
  return payload;
}

function resolveEntityById(rawId: string): ResolvedEntityPayload | null {
  const cleanId = decodeURIComponent(String(rawId || "").trim());
  if (!cleanId) return null;
  const rawUpper = cleanId.toUpperCase();
  const upperId = LEGACY_CANONICAL_ID_ALIASES[rawUpper] || rawUpper;
  const allItems = loadLibraryAssets({ includePendingBlueprints: true });

  // Check if requesting a specific Act ID like ZYV-ACT-MI10-300S-03 or ZYV-ACT-MI10-03
  const actMatch = upperId.match(
    /^ZYV-(?:ACT|CLIP)-([A-Z0-9-]+?)-(?:P)?(\d{1,2})$/
  );
  if (actMatch) {
    const baseToken = actMatch[1];
    const actNum = parseInt(actMatch[2], 10);
    const parentItem =
      allItems.find((it) => {
        const cid = (it.canonicalId || it.id).toUpperCase();
        return (
          cid.startsWith("ZYV-REEL-") &&
          (cid.includes(baseToken) ||
            it.projectId.toUpperCase().includes(baseToken))
        );
      }) ||
      allItems.find((it) => {
        const cid = (it.canonicalId || it.id).toUpperCase();
        return (
          cid.includes(baseToken) ||
          it.projectId.toUpperCase().includes(baseToken)
        );
      });
    if (parentItem) {
      const parentUpper = (
        parentItem.canonicalId || parentItem.id
      ).toUpperCase();
      const liveJob = findNewestJobStateForCanonicalId(parentUpper);
      return attachAliasMetadata(
        buildEntityFromLibraryItem(parentItem, actNum, liveJob),
        rawUpper,
        upperId
      );
    }
    return null;
  }

  const liveJobForId = findNewestJobStateForCanonicalId(upperId);

  const directMatch = allItems.find((it) => {
    const cid = (it.canonicalId || "").toUpperCase();
    return (
      cid === upperId ||
      it.id.toUpperCase() === upperId ||
      it.projectId.toUpperCase() === upperId
    );
  });

  if (directMatch) {
    return attachAliasMetadata(
      buildEntityFromLibraryItem(directMatch, undefined, liveJobForId),
      rawUpper,
      upperId
    );
  }

  // If a job is running/completed on disk before library_manifest.json was read, synthesize directly from job_state.json
  if (liveJobForId) {
    const jId = String(liveJobForId.id || "job_live");
    const jCid = String(liveJobForId.canonicalId || cleanId);
    const jDur = Number(liveJobForId.durationSeconds || 60);
    const fallbackSrc =
      typeof liveJobForId.combinedSrc === "string" && liveJobForId.combinedSrc
        ? liveJobForId.combinedSrc
        : typeof liveJobForId.part1Src === "string" && liveJobForId.part1Src
        ? liveJobForId.part1Src
        : "";
    const syntheticItem: LibraryAssetItem = {
      id: jCid,
      canonicalId: jCid,
      canonicalUrl: `/entity/${jCid}`,
      studioUrl: `/swarm-MUI?reel=${encodeURIComponent(jCid)}`,
      projectId: jId,
      projectTitle: String(liveJobForId.title || jCid),
      title: String(liveJobForId.title || jCid),
      subtitle: String(liveJobForId.stageLabel || "Live Multi-Act Master"),
      assetType: fallbackSrc ? "combined_master" : "blueprint_pending_render",
      genre: String(liveJobForId.genre || "Studio Master"),
      durationSec: jDur,
      frames: jDur * 24,
      fps: "24/1 CFR",
      audioSpec: "48,000 Hz Stereo Master (-14.0 LUFS)",
      wardrobe: "Custom Prompt Wardrobe",
      location: "Custom Prompt Location",
      promptSummary: String(
        liveJobForId.prompt || liveJobForId.act1Prompt || ""
      ),
      src: fallbackSrc,
      createdAt: new Date(
        Number(liveJobForId.createdAt || Date.now())
      ).toISOString(),
    };
    return attachAliasMetadata(
      buildEntityFromLibraryItem(syntheticItem, undefined, liveJobForId),
      rawUpper,
      upperId
    );
  }

  // Fallback fuzzy match only on meaningful >=4-char known canonical tokens (never arbitrary unknown IDs)
  if (upperId.length >= 4 && !upperId.startsWith("ZYV-")) {
    const fuzzy = allItems.find((it) => {
      const hay =
        `${it.canonicalId} ${it.id} ${it.projectId} ${it.title}`.toUpperCase();
      return hay.includes(upperId);
    });
    if (fuzzy) {
      const fuzzyUpper = (fuzzy.canonicalId || fuzzy.id).toUpperCase();
      return attachAliasMetadata(
        buildEntityFromLibraryItem(
          fuzzy,
          undefined,
          findNewestJobStateForCanonicalId(fuzzyUpper)
        ),
        rawUpper,
        upperId
      );
    }
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const entity = resolveEntityById(id);
  if (!entity) {
    return NextResponse.json(
      { ok: false, error: `Entity ${id} not found` },
      { status: 404 }
    );
  }
  return NextResponse.json(
    {
      ok: true,
      entity,
      allCanonicalReels: loadLibraryAssets()
        .filter((i) => {
          const cid = String(i.canonicalId || i.id || "").toUpperCase();
          return (
            !cid.startsWith("ZYV-ACT-") &&
            i.assetType !== "act_master" &&
            i.assetType !== "turn_segment"
          );
        })
        .map((i) => ({
          canonicalId: i.canonicalId || i.id,
          canonicalUrl: i.canonicalUrl || `/entity/${i.canonicalId || i.id}`,
          studioUrl: i.studioUrl || `/swarm-MUI?reel=${i.canonicalId || i.id}`,
          title: i.title,
          durationSeconds: i.durationSec,
          durationSec: i.durationSec,
        })),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
