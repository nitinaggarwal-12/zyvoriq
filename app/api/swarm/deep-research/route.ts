import { NextRequest, NextResponse } from "next/server";
import {
  buildMissionImpossible10Bible,
  synthesizeDeepResearchBible,
} from "@/lib/swarm/deepResearchBible";
import { loadLibraryAssets } from "@/lib/swarm/libraryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reelId = (searchParams.get("reelId") || "ZYV-REEL-MI10-300S").trim();

  if (reelId.toUpperCase() === "ZYV-REEL-MI10-300S") {
    const bible = buildMissionImpossible10Bible();
    return NextResponse.json({
      ok: true,
      canonicalReelId: bible.canonicalReelId,
      deepResearchBible: bible,
    });
  }

  const library = loadLibraryAssets();
  const matched = library.find(
    (r) =>
      (r.canonicalId || "").toUpperCase() === reelId.toUpperCase() ||
      r.id.toUpperCase() === reelId.toUpperCase()
  );

  const durationSeconds = matched?.durationSec || 60;
  const actsCount =
    durationSeconds >= 300 ? 10 : Math.max(2, Math.round(durationSeconds / 30));

  const bible = synthesizeDeepResearchBible({
    canonicalReelId: matched?.canonicalId || reelId,
    title: matched?.title || "Zyvoriq Master Production",
    prompt: matched?.promptSummary || matched?.subtitle || "",
    durationSeconds,
    actsCount,
  });

  return NextResponse.json({
    ok: true,
    canonicalReelId: bible.canonicalReelId,
    deepResearchBible: bible,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const canonicalReelId = String(
      body.canonicalReelId || "ZYV-REEL-MI10-300S"
    ).trim();
    const title = String(
      body.title ||
        "Mission: Impossible 10 — The Multiverse Protocol (5-Min Master)"
    ).trim();
    const prompt = String(body.prompt || "").trim();
    const durationSeconds = Number(body.durationSeconds) || 300;
    const actsCount =
      Number(body.actsCount) || Math.max(2, Math.round(durationSeconds / 30));

    const bible = synthesizeDeepResearchBible({
      canonicalReelId,
      title,
      prompt,
      durationSeconds,
      actsCount,
      cameraPresetName: body.cameraPresetName,
      lensName: body.lensName,
      vfxName: body.vfxName,
      segments: Array.isArray(body.segments) ? body.segments : undefined,
    });

    return NextResponse.json({
      ok: true,
      canonicalReelId: bible.canonicalReelId,
      deepResearchBible: bible,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
