import { NextRequest, NextResponse } from "next/server";
import { inspectSynthIDWatermark } from "@/lib/ai/synthidService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetUrl = "zyvoriq_master.mp4", assetType = "video" } = body;
    const result = inspectSynthIDWatermark(assetUrl, assetType);
    return NextResponse.json({ success: true, synthId: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
