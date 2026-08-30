import { NextRequest, NextResponse } from "next/server";
import { GLOBAL_CHARACTERS } from "@/lib/tier6/characters";
import { planReel } from "@/lib/reel/planner";

/**
 * Compatibility endpoint for the old Studio contract.
 *
 * IMPORTANT: this endpoint no longer invents video/audio URLs, fixed durations,
 * word timestamps or COMPLETED generation stages. Long-form media must move
 * through the Reel production manifest so each generated 4/6/8s source shot
 * can be audited, repaired and assembled against a canonical timeline.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personaId, scriptText, targetResolution = "1080p" } = body;
    const persona = GLOBAL_CHARACTERS.find(p => p.id === personaId) || GLOBAL_CHARACTERS[0];
    const script = scriptText?.trim() || `Welcome. I am ${persona.name}, ${persona.role} based in ${persona.location}.`;
    const requestedDurationSec = Number(body.durationSeconds || body.requestedDurationSec || Math.max(8, Math.ceil(script.split(/\s+/).length / 2.15)));

    const manifest = planReel({
      topic: body.topic || `${persona.name} presentation`,
      tone: persona.voiceStyle || "Confident & conversational",
      platform: body.platform || "Instagram Reels",
      requestedDurationSec,
      scriptText: script
    });

    return NextResponse.json({
      success: true,
      pipeline: "ZYVORIQ-REEL-PRODUCTION-V1",
      status: manifest.status,
      message: "Production manifest created. Media is not marked complete until real artifacts exist and pass final QA.",
      persona: {
        id: persona.id,
        name: persona.name,
        title: persona.role,
        location: persona.location,
        accent: persona.accent,
        avatarEmoji: persona.avatarEmoji,
        specialty: persona.specialty
      },
      targetResolution,
      videoUrl: null,
      audioUrl: null,
      wordTimings: [],
      timingSource: "pending-actual-audio-alignment",
      manifest,
      stages: [
        { name: "Script & shot planning", status: "COMPLETED" },
        { name: "Master narration synthesis + actual alignment", status: "PENDING" },
        { name: "Dependency-aware 4/6/8s video generation", status: "PENDING" },
        { name: "Editorial assembly + audio mix", status: "PENDING" },
        { name: "Whole-master multimodal audit", status: "PENDING" },
        { name: "Provenance sealing", status: "PENDING" }
      ]
    }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ success: false, status: "FAILED", error: error?.message || "Unable to create production manifest" }, { status: 500 });
  }
}
