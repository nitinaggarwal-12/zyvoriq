import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import type { ReelProductionStatus } from "@/lib/reel/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    return NextResponse.json({ success: true, production }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);

    if (action === "transition") {
      const production = await reelProductionService.transition(id, String(body.to) as ReelProductionStatus, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "attachNarration") {
      const production = await reelProductionService.attachNarration({
        id,
        narrationUrl: String(body.narrationUrl || ""),
        actualDurationSec: Number(body.actualDurationSec),
        timingSource: "actual-alignment",
        expectedRevision,
      });
      return NextResponse.json({ success: true, production });
    }

    if (action === "attachShotAsset") {
      const production = await reelProductionService.attachShotAsset({
        id,
        shotId: String(body.shotId || ""),
        videoUrl: String(body.videoUrl || ""),
        actualDurationSec: Number(body.actualDurationSec),
        operationName: body.operationName ? String(body.operationName) : undefined,
        expectedRevision,
      });
      return NextResponse.json({ success: true, production });
    }

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update production";
    const conflict = message.includes("concurrently");
    return NextResponse.json({ success: false, error: message }, { status: conflict ? 409 : 400 });
  }
}
