import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { buildMediaGraph } from "@/lib/reel/mediaGraph";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    const graph = buildMediaGraph({ id: production.id, revision: production.revision, manifest: production.manifest });
    return NextResponse.json({ success: true, graph }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to build media graph" }, { status: 500 });
  }
}
