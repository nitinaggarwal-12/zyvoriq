import { NextRequest, NextResponse } from "next/server";
import { planReel } from "@/lib/reel/planner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const manifest = planReel({
      topic: String(body.topic || ""),
      tone: body.tone,
      platform: body.platform,
      requestedDurationSec: Number(body.requestedDurationSec || 30),
      scriptText: body.scriptText
    });

    return NextResponse.json({ success: true, manifest });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to plan reel" }, { status: 400 });
  }
}
