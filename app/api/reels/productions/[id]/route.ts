import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { generateAlignedNarration } from "@/lib/reel/geminiNarration";
import { generateProductionShot } from "@/lib/reel/veoProduction";
import { deleteAsset } from "@/lib/reel/assetStore";
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

    if (action === "generateNextShot") {
      const current = await reelProductionService.get(id);
      if (!current) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
      if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) {
        return NextResponse.json({ success: false, error: `Shot generation is not allowed while production is ${current.manifest.status}` }, { status: 409 });
      }
      if (expectedRevision !== undefined && expectedRevision !== current.revision) {
        return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${current.revision})` }, { status: 409 });
      }

      const completedIds = new Set(
        current.manifest.shots
          .filter(s => Boolean(s.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(s.status))
          .map(s => s.id)
      );
      const shot = current.manifest.shots.find(s =>
        s.status === "PLANNED" && s.dependsOnShotIds.every(dep => completedIds.has(dep))
      );
      if (!shot) {
        const remaining = current.manifest.shots.filter(s => s.status === "PLANNED");
        if (remaining.length === 0) {
          return NextResponse.json({ success: true, production: current, generated: null, message: "No planned shots remain." });
        }
        return NextResponse.json({ success: false, error: "No shot is currently eligible; continuity dependencies are unresolved." }, { status: 409 });
      }

      let generated: Awaited<ReturnType<typeof generateProductionShot>> | null = null;
      try {
        generated = await generateProductionShot({
          productionId: id,
          shot,
          modelTier: body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast",
        });
        const production = await reelProductionService.attachShotAsset({
          id,
          shotId: shot.id,
          videoUrl: generated.videoUrl,
          actualDurationSec: generated.actualDurationSec,
          operationName: generated.operationName,
          provider: generated.provider,
          model: generated.model,
          expectedRevision: current.revision,
        });
        return NextResponse.json({
          success: true,
          production,
          generated: { shotId: shot.id, probe: generated.probe, provider: generated.provider, model: generated.model },
        });
      } catch (generationError) {
        if (generated?.assetKey) {
          try { await deleteAsset(generated.assetKey); } catch {}
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
    const conflict = message.includes("concurrently") || message.includes("requires SCRIPT_READY") || message.includes("not allowed");
    return NextResponse.json({ success: false, error: message }, { status: conflict ? 409 : 400 });
  }
}
