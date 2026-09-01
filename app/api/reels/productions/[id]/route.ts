import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { reelOperationQueue } from "@/lib/reel/operationQueue";
import { reelProductionControl } from "@/lib/reel/productionControl";
import type { ReelOperation } from "@/lib/reel/operationQueue";
import type { ReelProductionStatus } from "@/lib/reel/types";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    const safeProduction = production.id.startsWith("studio1_") ? suppressUncertifiedStudio1Outputs(production) : production;
    let operations: ReelOperation[] = [];
    try { operations = await reelOperationQueue.latestForProduction(id, 12); } catch {}
    return NextResponse.json({ success: true, production: safeProduction, operations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Compatibility bridge for existing clients such as /studio. New public
    // productions are Studio1 manifests, so preserve PATCH + body with a 307
    // and let the canonical Studio1 API own all generation semantics.
    if (id.startsWith("studio1_")) {
      const target = new URL(`/api/studio1/productions/${encodeURIComponent(id)}`, req.url);
      return NextResponse.redirect(target, 307);
    }

    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);

    if (action === "cancelProduction") {
      await reelProductionControl.cancel(id, body.supersededBy ? String(body.supersededBy) : undefined);
      const production = await reelProductionService.get(id);
      return NextResponse.json({ success: true, cancelled: true, production });
    }

    if (action === "transition") {
      const production = await reelProductionService.transition(id, String(body.to) as ReelProductionStatus, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    if (["generateNarration", "generateNextShot", "renderNarratedRoughCut"].includes(action)) {
      return NextResponse.json({
        success: false,
        code: "LEGACY_REEL_PIPELINE_DISABLED",
        error: "This legacy reel_* production cannot run paid generation. Create a new Reel so it uses the canonical Studio1 narration-master-clock, continuity, and certification pipeline.",
        canonicalEngine: "studio1",
      }, { status: 410, headers: { "Cache-Control": "no-store" } });
    }

    if (action === "attachNarration" || action === "attachShotAsset") {
      return NextResponse.json({ success: false, error: `${action} is disabled; production evidence may only be attached by the durable worker` }, { status: 410 });
    }

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update production";
    const unavailable = message.includes("worker unavailable") || message.includes("Production control requires Postgres");
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("dependency") || message.includes("cancelled");
    return NextResponse.json({ success: false, error: message }, { status: unavailable ? 503 : conflict ? 409 : 400 });
  }
}
