import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { resolveReelCreationIntent } from "@/lib/reel/creationCatalog";
import { planReel, planReelAsync } from "@/lib/reel/planner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await reelProductionService.list(limit);
    let priorityMap: Record<string, number> = {};
    try {
      priorityMap = await reelProductionControl.getPriorities(productions.map(p => p.id));
    } catch {}
    const productionsWithPriority = productions.map(p => ({
      ...p,
      priority: priorityMap[p.id] ?? 0,
    }));
    return NextResponse.json({ success: true, productions: productionsWithPriority }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to list productions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "topic is required" }, { status: 400 });
    const creationIntent = resolveReelCreationIntent(body.creationIntent);

    const planInput = {
      topic,
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
      creationIntent,
      genre: body.genre,
      language: body.language || body.narrationLanguage || creationIntent?.narrationLanguage,
    };
    const hasScript = Boolean(String(body.scriptText || "").trim());
    const manifest = hasScript ? planReel(planInput) : await planReelAsync(planInput);
    const production = await reelProductionStore.create(manifest);
    const productionControl = await reelProductionControl.register(production.id, Number(body.priority || 0));

    return NextResponse.json({
      success: true,
      production,
      productionControl,
      nextRequiredAction: "DISPATCH_SWARM_JOB",
      canonicalEngine: "omni11_veo31_safety_net",
      note: "Option A Lean Omni-First + Veo Safety-Net: live multi-act video/audio synthesis dispatches through POST /api/swarm/jobs.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create production" }, { status: 400 });
  }
}
