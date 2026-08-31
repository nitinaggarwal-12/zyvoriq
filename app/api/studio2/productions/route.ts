import { NextRequest, NextResponse } from "next/server";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { planStudio2 } from "@/lib/studio2/planner";
import { studio2Service } from "@/lib/studio2/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await studio2Service.list(Math.max(1, Math.min(100, limit)));
    return NextResponse.json({ success: true, productions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to list Studio2 productions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "topic is required" }, { status: 400 });

    const manifest = planStudio2({
      topic,
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
    });
    const production = await reelProductionStore.create(manifest);

    let control = null;
    try { control = await reelProductionControl.register(production.id); } catch {}

    return NextResponse.json({
      success: true,
      production,
      productionControl: control ? { generationToken: control.generationToken } : null,
      studio2: true,
      note: "Studio2 is isolated by route and studio2_-prefixed production IDs. /studio files and APIs are unchanged.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create Studio2 production" }, { status: 400 });
  }
}
