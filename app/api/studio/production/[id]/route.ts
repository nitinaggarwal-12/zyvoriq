import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const job = db.getProductionJob(id);

    if (!job) {
      // Check if it exists in studio_series_tracks
      const tracks = db.getStudioTracks();
      const track = tracks.find((t: any) => t.id === id);
      if (track) {
        return NextResponse.json({
          success: true,
          job: {
            id: track.id,
            title: track.title,
            prompt: track.subtitle || track.title,
            characterLock: track.category === "anime" ? "ren_aoi" : "custom",
            visualStyle: "cinematic_4k",
            duration: track.duration,
            status: "completed",
            progress: 100,
            stageText: "Production Master Live in Library",
            logs: [
              "[00:00.0] 🎬 Master Track Retrieved from SQLite Media Vault",
              `[00:00.1] 📹 Video Source: ${track.videoSrc}`,
              `[00:00.2] 🛡️ Veritas Attestation: ${track.veritas?.status || "CERTIFIED_VALID"}`
            ],
            videoUrl: track.videoSrc,
            script: {
              philosophy: track.acts?.[0]?.philosophy || "Autonomous Neural Synthesis",
              dialogueJa: track.acts?.[0]?.text?.ja || "",
              dialogueEn: track.acts?.[0]?.text?.en || "",
              dialogueEs: track.acts?.[0]?.text?.es || "",
              dialogueFr: track.acts?.[0]?.text?.fr || "",
              dialogueDe: track.acts?.[0]?.text?.de || "",
              dialogueHi: track.acts?.[0]?.text?.hi || ""
            },
            veritas: track.veritas,
            createdAt: track.createdAt
          }
        });
      }
      return NextResponse.json({ success: false, error: "Production job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
