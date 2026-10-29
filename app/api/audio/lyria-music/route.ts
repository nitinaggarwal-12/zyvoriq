import { NextRequest, NextResponse } from "next/server";
import {
  LYRIA_MUSIC_PRESETS,
  LYRIA_VOCAL_STYLES,
  generateLyriaBackgroundMusic,
  type LyriaTier,
  type LyriaVocalMode,
} from "@/lib/ai/lyriaService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    success: true,
    presets: LYRIA_MUSIC_PRESETS,
    vocalStyles: LYRIA_VOCAL_STYLES,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = "Epic cinematic background music",
      title,
      visualStyle = "photorealistic_keynote",
      musicPreset = "adaptive_cinematic",
      genre,
      bpm,
      vocalMode,
      instrumentalOnly,
      vocalStyle = "latin_pop_belt",
      tier,
      duration,
      durationSeconds,
    } = body;

    const reqDur = Math.min(
      180,
      Math.max(15, Number(durationSeconds || duration) || 30)
    );
    const resolvedVocalMode: LyriaVocalMode =
      typeof instrumentalOnly === "boolean"
        ? instrumentalOnly
          ? "instrumental"
          : "character_singing"
        : vocalMode ||
          (/\b(song|sing|vocal|lyrics?|chorus|anthem|duet|choir)\b/i.test(
            String(prompt)
          )
            ? "character_singing"
            : "instrumental");
    const resolvedTier: LyriaTier =
      tier || (reqDur > 30 || resolvedVocalMode !== "instrumental" ? "pro" : "standard");

    // Extract explicit BPM from prompt if caller didn't specify one or if prompt mentions e.g. "112 BPM"
    const promptBpmMatch = String(prompt).match(/\b(\d{2,3})\s*bpm\b/i);
    const parsedBpm = promptBpmMatch
      ? Number(promptBpmMatch[1])
      : typeof bpm === "number" || typeof bpm === "string"
      ? Number(bpm)
      : undefined;

    const result = await generateLyriaBackgroundMusic({
      prompt: String(prompt).trim(),
      tier: resolvedTier,
      visualStyle,
      musicPreset,
      genre: typeof genre === "string" ? genre : undefined,
      bpm: Number.isFinite(parsedBpm) && (parsedBpm as number) > 0 ? parsedBpm : undefined,
      vocalMode: resolvedVocalMode,
      vocalStyle,
      duration: reqDur,
    });

    if (!result || !result.audioUrl) {
      return NextResponse.json(
        {
          success: false,
          ok: false,
          error: "Lyria 3 audio generation returned empty audioUrl. Verify GEMINI_API_KEY.",
        },
        { status: 502 }
      );
    }

    const fallbackTitle = (() => {
      const norm = String(prompt).replace(/\s+/g, " ").trim();
      if (norm.length <= 64) return norm;
      const cut = norm.slice(0, 64);
      const sp = cut.lastIndexOf(" ");
      return `${(sp > 34 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—]+$/, "")}…`;
    })();
    return NextResponse.json({
      success: true,
      ok: true,
      canonicalId: result.canonicalId,
      title: title || fallbackTitle,
      audioUrl: result.audioUrl,
      durationSec: result.duration,
      durationSeconds: result.duration,
      bpm: result.bpm,
      genre: result.genre,
      modelUsed:
        result.modelUsed ||
        (resolvedTier === "pro"
          ? "models/lyria-3-pro-preview"
          : "models/lyria-3-clip-preview"),
      lyricsUsed:
        Array.isArray(result.lyrics) && result.lyrics.length > 0
          ? result.lyrics.join("\n")
          : result.lyriaRawArrangement || undefined,
      music: result,
    });
  } catch (err: any) {
    console.error("Failed to generate Lyria music:", err);
    return NextResponse.json(
      { success: false, ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
