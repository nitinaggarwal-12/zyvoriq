import { NextRequest, NextResponse } from "next/server";
import { reelOperationQueue } from "@/lib/reel/operationQueue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const operation = await reelOperationQueue.get(id);
    if (!operation) return NextResponse.json({ success: false, error: "Operation not found" }, { status: 404 });
    if (operation.status === "CANCELLED") {
      return NextResponse.json({ success: false, cancelled: true, operation, error: operation.lastError || "Production operation was cancelled or superseded" }, { status: 410, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ success: true, operation }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load operation" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    if (body.action === "retry") {
      const operation = await reelOperationQueue.retry(id);
      if (!operation) return NextResponse.json({ success: false, error: "Operation not found" }, { status: 404 });
      return NextResponse.json({ success: true, operation });
    }
    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to retry operation" }, { status: 500 });
  }
}
