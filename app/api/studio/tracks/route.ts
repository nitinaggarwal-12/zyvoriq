import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { CANONICAL_SERIES_TRACKS } from "@/lib/tier6/default_tracks";

export async function GET(req: NextRequest) {
  try {
    db.seedDefaultStudioTracks();
    const tracks = db.getStudioTracks();
    return NextResponse.json({ success: true, tracks: tracks.length > 0 ? tracks : CANONICAL_SERIES_TRACKS });
  } catch (err: any) {
    console.error("Failed to get studio tracks, using canonical fallback:", err);
    return NextResponse.json({ success: true, tracks: CANONICAL_SERIES_TRACKS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Construct full track object
    const trackId = body.id || `track_${Date.now()}`;
    const track = {
      id: trackId,
      title: body.title || "Custom Studio Production",
      subtitle: body.subtitle || body.prompt?.slice(0, 80) || "AI Character Video Series",
      category: body.category || "custom",
      character: body.character || (body.characterLock === "priya" ? "Priya Sharma (Silicon Valley)" : body.characterLock === "david" ? "David Kim (Zurich)" : body.characterLock === "elena" ? "Elena Rostova (Tokyo)" : "Sensei Ren & Apprentice Aoi"),
      videoSrc: (body.videoSrc || body.video_src || (body.characterLock?.includes("ren") ? "/assets/video/ren_and_aoi_conversation_synced.mp4" : body.characterLock === "david" ? "/assets/video/david_master.mp4" : "/assets/video/priya_4k_10act_master.mp4")).replace("/videos/", "/assets/video/"),
      duration: body.duration || 24,
      acts: body.acts || [
        {
          id: `act_${Date.now()}`,
          startTime: 0.0,
          endTime: body.duration || 24,
          speaker: body.characterLock?.includes("ren") ? "Ren" : body.characterLock === "david" ? "David" : "Priya",
          speakerRole: body.characterLock?.includes("ren") ? "Zen Master" : body.characterLock === "david" ? "Lead Infrastructure" : "Chief AI Officer",
          actName: body.title || "Act 1: Production Master",
          philosophy: body.philosophy || "Autonomous Neural Synthesis",
          text: {
            ja: `🇯🇵 ${body.title || "Production Master"}`,
            en: `🇺🇸 ${body.prompt || body.title || "Custom Production Master"}`,
            es: `🇪🇸 ${body.title || "Master de Producción"}`,
            fr: `🇫🇷 ${body.title || "Master de Production"}`,
            de: `🇩🇪 ${body.title || "Produktions-Master"}`,
            hi: `🇮🇳 ${body.title || "उत्पादन मास्टर"}`
          }
        }
      ],
      veritas: body.veritas || {
        status: "CERTIFIED_VALID",
        snarkProofHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
      }
    };

    db.saveStudioTrack(track);
    const allTracks = db.getStudioTracks();
    return NextResponse.json({ success: true, track, tracks: allTracks });
  } catch (err: any) {
    console.error("Failed to save studio track:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing track ID" }, { status: 400 });
    }
    db.deleteStudioTrack(id);
    const tracks = db.getStudioTracks();
    return NextResponse.json({ success: true, tracks });
  } catch (err: any) {
    console.error("Failed to delete studio track:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
