import { NextRequest, NextResponse } from "next/server";
import { LYRIA_MUSIC_PRESETS, generateLyriaBackgroundMusic } from "@/lib/ai/lyriaService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    presets: LYRIA_MUSIC_PRESETS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = "Epic cinematic background music",
      visualStyle = "photorealistic_keynote",
      musicPreset = "adaptive_cinematic",
      duration = 24
    } = body;

    const result = await generateLyriaBackgroundMusic({
      prompt,
      visualStyle,
      musicPreset,
      duration: Math.max(8, Number(duration) || 24)
    });

    return NextResponse.json({
      success: true,
      music: result
    });
  } catch (err: any) {
    console.error("Failed to generate Lyria music:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
