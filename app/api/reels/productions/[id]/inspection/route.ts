import { NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { buildInspectionPackage } from "@/lib/reel/inspection";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    const safeProduction = production.id.startsWith("studio1_") ? suppressUncertifiedStudio1Outputs(production) : production;
    const inspection = buildInspectionPackage(safeProduction.manifest, 30, safeProduction.revision);
    return NextResponse.json({ success: true, production: { id: safeProduction.id, revision: safeProduction.revision }, inspection }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to build inspection package" }, { status: 500 });
  }
}
