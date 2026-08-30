import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { operationKey, reelOperationQueue } from "@/lib/reel/operationQueue";
import type { ReelProductionStatus } from "@/lib/reel/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fingerprint(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    let operations = [];
    try { operations = await reelOperationQueue.latestForProduction(id, 12); } catch {}
    return NextResponse.json({ success: true, production, operations }, { headers: { "Cache-Control": "no-store" } });
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
      if (current.manifest.status !== "SCRIPT_READY" && current.manifest.status !== "AUDIO_GENERATING") {
        return NextResponse.json({ success: false, error: `Narration generation requires SCRIPT_READY/AUDIO_GENERATING; production is ${current.manifest.status}` }, { status: 409 });
      }
      if (expectedRevision !== undefined && expectedRevision !== current.revision) {
        return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${current.revision})` }, { status: 409 });
      }

      const idempotencyKey = operationKey({
        productionId: id,
        kind: "NARRATION",
        manifestRevision: current.revision,
        fingerprint: fingerprint({ script: current.manifest.masterScript, tone: current.manifest.tone }),
      });
      const operation = await reelOperationQueue.enqueue({
        productionId: id,
        kind: "NARRATION",
        idempotencyKey,
        payload: { manifestRevision: current.revision },
      });
      let production = current;
      if (current.manifest.status === "SCRIPT_READY") {
        try { production = await reelProductionService.transition(id, "AUDIO_GENERATING", current.revision); }
        catch { production = (await reelProductionService.get(id)) || current; }
      }
      return NextResponse.json({ success: true, queued: true, operation, production }, { status: 202 });
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
      const completedIds = new Set(current.manifest.shots.filter(s => Boolean(s.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(s.status)).map(s => s.id));
      const shot = current.manifest.shots.find(s => ["PLANNED", "FAILED"].includes(s.status) && s.dependsOnShotIds.every(dep => completedIds.has(dep)));
      if (!shot) {
        const remaining = current.manifest.shots.filter(s => ["PLANNED", "FAILED"].includes(s.status));
        if (!remaining.length) return NextResponse.json({ success: true, production: current, queued: false, message: "No ungenerated shots remain." });
        return NextResponse.json({ success: false, error: "No shot is currently eligible; continuity dependencies are unresolved." }, { status: 409 });
      }
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const dependencyEvidence = shot.dependsOnShotIds.map(depId => {
        const dep = current.manifest.shots.find(s => s.id === depId);
        return { id: depId, url: dep?.asset?.videoUrl || null };
      });
      const idempotencyKey = operationKey({
        productionId: id,
        kind: "SHOT",
        targetId: shot.id,
        manifestRevision: current.revision,
        fingerprint: fingerprint({ prompt: shot.generationPrompt, duration: shot.generationDurationSec, modelTier, dependencyEvidence }),
      });
      const operation = await reelOperationQueue.enqueue({
        productionId: id,
        kind: "SHOT",
        targetId: shot.id,
        idempotencyKey,
        payload: { manifestRevision: current.revision, modelTier },
      });
      return NextResponse.json({ success: true, queued: true, operation, production: current, shotId: shot.id }, { status: 202 });
    }

    if (action === "renderNarratedRoughCut") {
      const current = await reelProductionService.get(id);
      if (!current) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
      if (current.manifest.status !== "ROUGH_CUT_READY") {
        return NextResponse.json({ success: false, error: `Narrated rough-cut render requires ROUGH_CUT_READY; production is ${current.manifest.status}` }, { status: 409 });
      }
      if (expectedRevision !== undefined && expectedRevision !== current.revision) {
        return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${current.revision})` }, { status: 409 });
      }
      const idempotencyKey = operationKey({
        productionId: id,
        kind: "ROUGH_CUT",
        manifestRevision: current.revision,
        fingerprint: fingerprint({ audio: current.manifest.audio.narrationUrl, duration: current.manifest.audio.actualDurationSec, shots: current.manifest.shots.map(s => [s.id, s.asset?.videoUrl, s.trimInSec, s.trimOutSec]) }),
      });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "ROUGH_CUT", idempotencyKey, payload: { manifestRevision: current.revision } });
      return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
    }

    if (action === "attachNarration" || action === "attachShotAsset") {
      return NextResponse.json({ success: false, error: `${action} is disabled; production evidence may only be attached by the durable worker` }, { status: 410 });
    }

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update production";
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("dependency");
    return NextResponse.json({ success: false, error: message }, { status: conflict ? 409 : 400 });
  }
}
