import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await reelProductionService.list(limit);
    return NextResponse.json(
      { success: true, productions },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to list productions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "topic is required" }, { status: 400 });

    const production = await reelProductionService.create({
      topic,
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
    });

    return NextResponse.json({
      success: true,
      production,
      nextRequiredAction: "GENERATE_REAL_NARRATION",
      note: "The production is persisted at SCRIPT_READY. No audio or video is reported complete until a real artifact is attached.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create production" }, { status: 400 });
  }
}
