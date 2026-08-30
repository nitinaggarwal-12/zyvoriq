import { NextRequest, NextResponse } from "next/server";
import { reelOperationQueue } from "@/lib/reel/operationQueue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const operation = await reelOperationQueue.get(id);
    if (!operation) return NextResponse.json({ success: false, error: "Operation not found" }, { status: 404 });
    return NextResponse.json({ success: true, operation }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load operation" }, { status: 500 });
  }
}
