import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { reelOperationQueue } from "@/lib/reel/operationQueue";
import { reelProductionControl } from "@/lib/reel/productionControl";
import type { ReelOperation } from "@/lib/reel/operationQueue";
import type { ReelProductionStatus } from "@/lib/reel/types";
import { reelProductionStore, RevisionConflictError } from "@/lib/reel/productionStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    let operations: ReelOperation[] = [];
    try { operations = await reelOperationQueue.latestForProduction(id, 12); } catch {}
    let priority = 0;
    try {
      const control = await reelProductionControl.get(id);
      if (control) priority = control.priority;
    } catch {}
    return NextResponse.json({ success: true, production: { ...production, priority }, operations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);

    if (action === "toggleStar" || action === "setStarred") {
      const current = await reelProductionStore.get(id);
      if (!current) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
      const nextStarred = body.starred !== undefined ? Boolean(body.starred) : !Boolean(current.starred || current.manifest?.starred);
      const updated = await reelProductionStore.setStarred(id, nextStarred, expectedRevision);
      return NextResponse.json({ success: true, starred: nextStarred, production: updated });
    }

    if (action === "setPriority") {
      const priority = Number(body.priority);
      if (isNaN(priority)) return NextResponse.json({ success: false, error: "priority must be a number" }, { status: 400 });
      const control = await reelProductionControl.setPriority(id, priority);
      return NextResponse.json({ success: true, priority: control.priority, productionControl: control });
    }

    if (action === "cancelProduction") {
      await reelProductionControl.cancel(id, body.supersededBy ? String(body.supersededBy) : undefined);
      const production = await reelProductionService.get(id);
      return NextResponse.json({ success: true, cancelled: true, production });
    }

    if (action === "transition") {
      const production = await reelProductionService.transition(id, String(body.to) as ReelProductionStatus, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    if ([
      "generate",
      "regenerate-shot",
      "render",
      "publish",
      "generateNarration",
      "generateNextShot",
      "generateAllShotsParallel",
      "renderNarratedRoughCut",
      "generateNativeReel",
      "attachNarration",
      "attachShotAsset",
    ].includes(action)) {
      return NextResponse.json({
        success: false,
        code: "STUDIO1_WORKER_PRUNED_OPTION_A",
        error: `Legacy Studio1 action '${action}' is retired under Option A. Dispatch live Omni 1.1 Flash + Veo 3.1 Safety-Net synthesis via POST /api/swarm/jobs.`,
        canonicalEngine: "omni11_veo31_safety_net",
      }, { status: 410, headers: { "Cache-Control": "no-store" } });
    }

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    if (error instanceof RevisionConflictError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          error: error.message,
          expectedRevision: error.expectedRevision,
          actualRevision: error.actualRevision,
        },
        { status: 409 }
      );
    }
    const message = error?.message || "Failed to update production";
    const unavailable = message.includes("worker unavailable") || message.includes("Production control requires Postgres");
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("dependency") || message.includes("cancelled");
    return NextResponse.json({ success: false, error: message }, { status: unavailable ? 503 : conflict ? 409 : 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const queryRev = searchParams.get("expectedRevision");
    let expectedRevision = queryRev !== null && queryRev !== "" ? Number(queryRev) : undefined;
    if (expectedRevision === undefined) {
      const body = await req.json().catch(() => null);
      if (body && body.expectedRevision !== undefined) {
        expectedRevision = Number(body.expectedRevision);
      }
    }
    await reelProductionStore.delete(id, expectedRevision);
    return NextResponse.json({ success: true, deleted: true, id });
  } catch (error: any) {
    if (error instanceof RevisionConflictError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          error: error.message,
          expectedRevision: error.expectedRevision,
          actualRevision: error.actualRevision,
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete production" }, { status: 500 });
  }
}
