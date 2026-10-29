import { NextResponse } from "next/server";
import { audioNarrationService } from "@/lib/audio/audioNarrationService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      text,
      prompt,
      podcastTopic,
      title,
      mode,
      voiceId,
      voiceName,
      hostAVoice,
      hostBVoice,
      archetypeId,
      accentId,
      emotionTone,
      prosody,
      languageCode,
    } = body;

    const resolvedText = String(text || prompt || podcastTopic || "").trim();
    if (!resolvedText) {
      return NextResponse.json(
        { ok: false, error: "Missing required text or podcast topic prompt" },
        { status: 400 }
      );
    }

    const response = await audioNarrationService.synthesizeNarration({
      text: resolvedText,
      mode: mode === "podcast" ? "podcast" : "narration",
      voiceId: voiceId || voiceName,
      hostAVoice,
      hostBVoice,
      archetypeId,
      accentId,
      emotionTone,
      prosody,
      languageCode,
    });

    const fallbackTitle = (() => {
      const norm = resolvedText.replace(/\s+/g, " ").trim();
      if (norm.length <= 64) return norm;
      const cut = norm.slice(0, 64);
      const sp = cut.lastIndexOf(" ");
      return `${(sp > 34 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—]+$/, "")}…`;
    })();
    return NextResponse.json({
      ...response,
      durationSec: response.durationSeconds,
      title: title || fallbackTitle,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: `Failed to synthesize neural audio narration: ${msg}` },
      { status: 500 }
    );
  }
}
