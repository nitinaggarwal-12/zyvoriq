import { NextRequest, NextResponse } from "next/server";
import { resolveArtifact } from "@/lib/artifact/resolver";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const artifact = await resolveArtifact(id);
    if (!artifact) return NextResponse.json({ success: false, error: "Artifact not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ success: true, ...artifact }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to resolve artifact" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
