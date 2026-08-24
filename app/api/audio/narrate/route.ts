import { NextResponse } from "next/server";
import { audioNarrationService } from "@/lib/audio/audioNarrationService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voiceId, archetypeId, accentId, emotionTone, prosody, languageCode } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing required text prompt" }, { status: 400 });
    }

    const response = await audioNarrationService.synthesizeNarration({
      text,
      voiceId,
      archetypeId,
      accentId,
      emotionTone,
      prosody,
      languageCode
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to synthesize neural audio narration" }, { status: 500 });
  }
}
