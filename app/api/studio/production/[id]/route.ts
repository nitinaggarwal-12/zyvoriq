import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { CANONICAL_SERIES_TRACKS } from "@/lib/tier6/default_tracks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function libraryJob(track: any, source: "canonical" | "library") {
  const acts = Array.isArray(track.acts) ? track.acts : [];
  const firstAct = acts[0] || {};
  return {
    id: track.id,
    title: track.title,
    prompt: track.subtitle || track.title,
    characterLock: track.character || "custom",
    visualStyle: track.category || "cinematic",
    duration: Number(track.duration || 0),
    status: "library_asset",
    progress: 100,
    stageText: "Existing media asset loaded from library",
    logs: [
      `Existing ${source} media asset loaded.`,
      track.videoSrc ? `Video source: ${track.videoSrc}` : "No video source is attached.",
      "No verification, lip-sync, provenance, or quality claim is inferred by this endpoint."
    ],
    videoUrl: track.videoSrc || "",
    audioUrl: track.audioSrc || firstAct?.audioUrl || "",
    acts,
    script: {
      philosophy: firstAct.philosophy || track.subtitle || "",
      dialogueJa: firstAct.text?.ja || "",
      dialogueEn: firstAct.text?.en || "",
      dialogueEs: firstAct.text?.es || "",
      dialogueFr: firstAct.text?.fr || "",
      dialogueDe: firstAct.text?.de || "",
      dialogueHi: firstAct.text?.hi || ""
    },
    veritas: null,
    createdAt: track.createdAt || null,
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const job = await db.getProductionJobAsync(id);
    if (job) {
      return NextResponse.json({ success: true, job }, { headers: { "Cache-Control": "no-store" } });
    }

    const canonical = CANONICAL_SERIES_TRACKS.find((track) => track.id === id);
    if (canonical) {
      return NextResponse.json({ success: true, job: libraryJob(canonical, "canonical") }, { headers: { "Cache-Control": "no-store" } });
    }

    const tracks = await db.getStudioTracksAsync();
    const track = tracks.find((candidate: any) => candidate.id === id);
    if (track) {
      return NextResponse.json({ success: true, job: libraryJob(track, "library") }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ success: false, error: "Production job not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production job" }, { status: 500 });
  }
}
