import { NextRequest, NextResponse } from "next/server";
import { resolveReelCreationIntent } from "@/lib/reel/creationCatalog";
import { planReel, planReelAsync } from "@/lib/reel/planner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planInput = {
      topic: String(body.topic || ""),
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
      creationIntent: resolveReelCreationIntent(body.creationIntent),
      genre: body.genre,
      language: body.language || body.narrationLanguage || body.creationIntent?.narrationLanguage,
    };
    const hasScript = Boolean(String(body.scriptText || "").trim());
    const manifest = hasScript ? planReel(planInput) : await planReelAsync(planInput);

    return NextResponse.json({ success: true, manifest, canonicalEngine: "omni11_veo31_safety_net" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to plan reel" }, { status: 400 });
  }
}
