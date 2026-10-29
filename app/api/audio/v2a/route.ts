import { NextRequest, NextResponse } from "next/server";
import { generateV2AFoleyEffects } from "@/lib/ai/v2aService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resolvedPrompt = String(
      body.prompt || body.videoDescription || "Cinematic video scene"
    ).trim();
    const visualStyle = body.visualStyle || "photorealistic_keynote";
    const ambientEnvironment =
      typeof body.ambientEnvironment === "string"
        ? body.ambientEnvironment.trim()
        : undefined;
    const resolvedDur = Math.min(
      30,
      Math.max(4, Number(body.durationSeconds || body.duration) || 12)
    );
    const result = await generateV2AFoleyEffects({
      prompt: resolvedPrompt,
      visualStyle,
      ambientEnvironment,
      duration: resolvedDur,
    });
    if (!result || !result.audioUrl) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "V2A Sound FX synthesis returned empty audioUrl",
        },
        { status: 502 }
      );
    }
    const fallbackTitle = (() => {
      const norm = resolvedPrompt.replace(/\s+/g, " ").trim();
      if (norm.length <= 64) return norm;
      const cut = norm.slice(0, 64);
      const sp = cut.lastIndexOf(" ");
      return `${(sp > 34 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—]+$/, "")}…`;
    })();
    return NextResponse.json({
      ok: true,
      success: true,
      canonicalId: result.canonicalId,
      title: body.title || fallbackTitle,
      audioUrl: result.audioUrl,
      durationSec: result.duration,
      durationSeconds: result.duration,
      acousticSpace: result.acousticSpace,
      modelUsed: result.modelUsed,
      cues: (result.foleyCues || []).map((c) => ({
        timestampSec: c.timestampSeconds,
        effect: `${c.name}: ${c.soundDescription}`,
        intensity: c.intensityLevel,
      })),
      foley: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
