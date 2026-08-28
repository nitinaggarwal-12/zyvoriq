import { NextRequest, NextResponse } from "next/server";
import { generateImagen3PrevisStoryboard } from "@/lib/ai/imagen3Service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title = "Untitled Storyboard", prompt = "Cinematic scene", visualStyle = "ufotable_anime", characterLock = "ren_aoi" } = body;
    const result = await generateImagen3PrevisStoryboard({ title, prompt, visualStyle, characterLock });
    return NextResponse.json({ success: true, previs: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
