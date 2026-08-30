import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { generateAlignedNarration } from "@/lib/reel/geminiNarration";
import type { ReelProductionStatus, WordTiming } from "@/lib/reel/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 300;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    return NextResponse.json({ success: true, production }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);

    if (action === "transition") {
      const production = await reelProductionService.transition(id, String(body.to) as ReelProductionStatus, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "generateNarration") {
      const current = await reelProductionService.get(id);
      if (!current) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
      if (current.manifest.status !== "SCRIPT_READY") {
        return NextResponse.json({ success: false, error: `Narration generation requires SCRIPT_READY; production is ${current.manifest.status}` }, { status: 409 });
      }

      const generating = await reelProductionService.transition(id, "AUDIO_GENERATING", expectedRevision ?? current.revision);
      try {
        const narration = await generateAlignedNarration({
          productionId: id,
          text: generating.manifest.masterScript,
          tone: generating.manifest.tone,
        });
        const audioReady = await reelProductionService.attachNarration({
          id,
          narrationUrl: narration.narrationUrl,
          actualDurationSec: narration.actualDurationSec,
          timingSource: "actual-alignment",
          wordTimings: narration.wordTimings,
          provider: narration.provider,
          model: narration.model,
          voice: narration.voice,
          expectedRevision: generating.revision,
        });
        const planned = await reelProductionService.transition(id, "SHOTS_PLANNED", audioReady.revision);
        return NextResponse.json({ success: true, production: planned });
      } catch (generationError) {
        const latest = await reelProductionService.get(id);
        if (latest?.manifest.status === "AUDIO_GENERATING") {
          try { await reelProductionService.transition(id, "FAILED", latest.revision); } catch {}
        }
        throw generationError;
      }
    }

    if (action === "attachNarration") {
      const wordTimings = Array.isArray(body.wordTimings) ? body.wordTimings as WordTiming[] : [];
      const production = await reelProductionService.attachNarration({
        id,
        narrationUrl: String(body.narrationUrl || ""),
        actualDurationSec: Number(body.actualDurationSec),
        timingSource: "actual-alignment",
        wordTimings,
        provider: body.provider ? String(body.provider) : undefined,
        model: body.model ? String(body.model) : undefined,
        voice: body.voice ? String(body.voice) : undefined,
        expectedRevision,
      });
      return NextResponse.json({ success: true, production });
    }

    if (action === "attachShotAsset") {
      const production = await reelProductionService.attachShotAsset({
        id,
        shotId: String(body.shotId || ""),
        videoUrl: String(body.videoUrl || ""),
        actualDurationSec: Number(body.actualDurationSec),
        operationName: body.operationName ? String(body.operationName) : undefined,
        provider: body.provider ? String(body.provider) : undefined,
        model: body.model ? String(body.model) : undefined,
        expectedRevision,
      });
      return NextResponse.json({ success: true, production });
    }

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update production";
    const conflict = message.includes("concurrently") || message.includes("requires SCRIPT_READY");
    return NextResponse.json({ success: false, error: message }, { status: conflict ? 409 : 400 });
  }
}
