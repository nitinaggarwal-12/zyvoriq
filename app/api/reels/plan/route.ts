import { NextRequest, NextResponse } from "next/server";
import { resolveReelCreationIntent } from "@/lib/reel/creationCatalog";
import { planStudio1 } from "@/lib/studio1/planner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const manifest = await planStudio1({
      topic: String(body.topic || ""),
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
      creationIntent: resolveReelCreationIntent(body.creationIntent),
      genre: body.genre,
      language: body.language || body.narrationLanguage || body.creationIntent?.narrationLanguage,
    });

    return NextResponse.json({ success: true, manifest, canonicalEngine: "studio1" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to plan reel" }, { status: 400 });
  }
}
