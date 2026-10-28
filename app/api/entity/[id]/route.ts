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
  posterSrc?: string;
  projectId: string;
  prompt: string;
  promptSummary: string;
  createdAt: string;
  actsCount: number;
  parallelWorkers: {
    totalWorkers: number;
    mode: string;
    veoWorkers: number;
    lyriaWorkers: number;
    chirpWorkers: number;
    muxWorker: number;
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

function buildEntityFromLibraryItem(
  item: LibraryAssetItem,
  requestedActIndex?: number
): ResolvedEntityPayload {
  const canonicalId =
    item.canonicalId || deriveCanonicalReelId(item.id, item.title);
  const genDir = path.join(
    process.cwd(),
    "public/assets/swarm/generated",
    item.projectId
  );
  const statePath = path.join(genDir, "job_state.json");
  let rawState: Record<string, unknown> | null = null;
  if (fs.existsSync(statePath)) {
    try {
      rawState = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
      rawState = null;
    }
  }

  const durationSec = item.durationSec || 60;
  const totalActs =
    durationSec >= 300 ? 10 : Math.max(2, Math.round(durationSec / 10));
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
              : `${actBasePrefix}-${String(partIndex).padStart(2, "0")}`;
          const rawSrc =
            typeof seg.src === "string"
              ? seg.src
              : `/api/media/assets/swarm/generated/${item.projectId}/act${partIndex}_30s.mp4`;
          const normalizedSrc = rawSrc.startsWith("/api/media/")
            ? rawSrc
            : rawSrc.startsWith("/assets/")
            ? `/api/media${rawSrc}`
            : rawSrc;
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
          const actSrc = fs.existsSync(actFile)
            ? `/api/media/assets/swarm/generated/${item.projectId}/act${partIndex}_30s.mp4`
            : item.src.startsWith("/api/media/")
            ? item.src
            : item.src.startsWith("/assets/")
            ? `/api/media${item.src}`
            : item.src;
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

  const parallelWorkers = {
    totalWorkers: enrichedSegments.length + 3,
    mode: `Promise.all (${enrichedSegments.length} Concurrent Video Workers + Lyria 3 Pro + Omni 1.1 Voice + FFmpeg Mux)`,
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
      posterSrc: item.posterSrc,
      projectId: item.projectId,
      prompt: item.promptSummary,
      promptSummary: item.promptSummary,
      createdAt: item.createdAt,
      actsCount: enrichedSegments.length,
      parallelWorkers,
      segments: enrichedSegments,
      acts: enrichedSegments,
      deepResearchBible,
    };
  }

  const normalizedMainSrc = item.src.startsWith("/api/media/")
    ? item.src
    : item.src.startsWith("/assets/")
    ? `/api/media${item.src}`
    : item.src;

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
    aspectRatio: "9:16 Uncropped Master (720×1280)",
    resolution: "720×1280 HD",
    frames: item.frames || durationSec * 24,
    fps: 24,
    fpsLabel: item.fps || "24/1 CFR",
    audioSpec: item.audioSpec,
    videoSrc: normalizedMainSrc,
    posterSrc: item.posterSrc,
    projectId: item.projectId,
    prompt: item.promptSummary,
    promptSummary: item.promptSummary,
    createdAt: item.createdAt,
    actsCount: enrichedSegments.length,
    parallelWorkers,
    segments: enrichedSegments,
    acts: enrichedSegments,
    deepResearchBible,
  };
}

function resolveEntityById(rawId: string): ResolvedEntityPayload | null {
  const cleanId = decodeURIComponent(String(rawId || "").trim());
  if (!cleanId) return null;
  const upperId = cleanId.toUpperCase();
  const allItems = loadLibraryAssets();

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
      }) ||
      allItems[0];
    if (parentItem) {
      return buildEntityFromLibraryItem(parentItem, actNum);
    }
  }

  const directMatch = allItems.find((it) => {
    const cid = (it.canonicalId || "").toUpperCase();
    return (
      cid === upperId ||
      it.id.toUpperCase() === upperId ||
      it.projectId.toUpperCase() === upperId
    );
  });

  if (directMatch) {
    return buildEntityFromLibraryItem(directMatch);
  }

  // Fallback fuzzy match by token (e.g. MI10, KAILASH, HUNTER, SPEAKEASY)
  const fuzzy = allItems.find((it) => {
    const hay =
      `${it.canonicalId} ${it.id} ${it.projectId} ${it.title}`.toUpperCase();
    return hay.includes(upperId);
  });
  if (fuzzy) {
    return buildEntityFromLibraryItem(fuzzy);
  }

  return allItems[0] ? buildEntityFromLibraryItem(allItems[0]) : null;
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
  return NextResponse.json({
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
  });
}
