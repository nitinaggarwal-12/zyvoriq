import { NextRequest, NextResponse } from "next/server";
import { generateV2AFoleyEffects } from "@/lib/ai/v2aService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = "Cinematic video scene", visualStyle = "photorealistic_keynote", duration = 8 } = body;
    const result = await generateV2AFoleyEffects({ prompt, visualStyle, duration });
    return NextResponse.json({ success: true, foley: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
