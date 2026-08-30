import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { reelProductionControl } from "@/lib/reel/productionControl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await reelProductionService.list(limit);
    return NextResponse.json({ success: true, productions }, { headers: { "Cache-Control": "no-store" } });
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

    let control = null;
    try {
      control = await reelProductionControl.register(production.id);
      const supersedesProductionId = String(body.supersedesProductionId || "").trim();
      if (supersedesProductionId && supersedesProductionId !== production.id) {
        try { await reelProductionControl.cancel(supersedesProductionId, production.id); } catch {}
      }
    } catch {
      // Planning remains usable without Postgres, but paid generation will fail closed.
    }

    return NextResponse.json({
      success: true,
      production,
      productionControl: control ? { generationToken: control.generationToken } : null,
      nextRequiredAction: "GENERATE_REAL_NARRATION",
      note: "The production is persisted at SCRIPT_READY. Paid generation requires an active durable production control and a healthy dedicated worker.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create production" }, { status: 400 });
  }
}
