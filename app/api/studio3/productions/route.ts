import { NextRequest, NextResponse } from "next/server";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { planStudio3 } from "@/lib/studio3/planner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "Topic is required" }, { status: 400 });
    const manifest = planStudio3({
      topic,
      tone: String(body.tone || "Confident & conversational"),
      platform: String(body.platform || "Instagram Reels"),
      requestedDurationSec: Number(body.requestedDurationSec || 30),
    });
    const production = await reelProductionStore.create(manifest);
    await reelProductionControl.ensure(production.id);
    return NextResponse.json({ success: true, production }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create Studio3 production" }, { status: 500 });
  }
}
