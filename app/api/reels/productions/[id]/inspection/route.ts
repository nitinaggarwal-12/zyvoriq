import { NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { buildInspectionPackage } from "@/lib/reel/inspection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    const inspection = buildInspectionPackage(production.manifest, 30);
    return NextResponse.json({ success: true, production: { id: production.id, revision: production.revision }, inspection }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to build inspection package" }, { status: 500 });
  }
}
