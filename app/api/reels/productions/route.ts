import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { resolveReelCreationIntent } from "@/lib/reel/creationCatalog";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";
import { planStudio1 } from "@/lib/studio1/planner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await reelProductionService.list(limit);
    const safeProductions = productions.map(production => production.id.startsWith("studio1_") ? suppressUncertifiedStudio1Outputs(production) : production);
    return NextResponse.json({ success: true, productions: safeProductions }, { headers: { "Cache-Control": "no-store" } });
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

    // Public Reel creation has one canonical engine. Keep this compatibility
    // endpoint for existing clients, but persist a Studio1 manifest so narration,
    // semantic scene timing, continuity anchoring and final certification cannot
    // be bypassed by a second legacy `reel_*` production path.
    const manifest = planStudio1({
      topic,
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText,
      creationIntent,
    });
    const production = await reelProductionStore.create(manifest);

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
      canonicalEngine: "studio1",
      note: "Public Reel creation is persisted as a Studio1 production. Paid generation requires the narration-master-clock Studio1 worker path and final certification.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create production" }, { status: 400 });
  }
}
