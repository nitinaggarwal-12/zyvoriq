import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { reelProductionService } from "@/lib/reel/productionService";
import { operationKey, reelOperationQueue } from "@/lib/reel/operationQueue";
import { reelProductionControl } from "@/lib/reel/productionControl";
import type { ReelOperation } from "@/lib/reel/operationQueue";
import type { ReelProductionStatus } from "@/lib/reel/types";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fingerprint(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function paidOperationContext(id: string) {
  const [control, worker] = await Promise.all([
    reelProductionControl.requireActive(id),
    reelProductionControl.workerHealth(),
  ]);
  if (!worker.healthy) throw new Error(`Dedicated production worker unavailable: ${worker.reason || "stale heartbeat"}`);
  return { control, worker };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await reelProductionService.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
    const safeProduction = production.id.startsWith("studio1_") ? suppressUncertifiedStudio1Outputs(production) : production;
    let operations: ReelOperation[] = [];
    try { operations = await reelOperationQueue.latestForProduction(id, 12); } catch {}
    return NextResponse.json({ success: true, production: safeProduction, operations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load production" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (id.startsWith("studio1_")) return NextResponse.json({ success: false, error: "Studio1 productions must be mutated through the Studio1 API so exact narration-sync and certification contracts cannot be bypassed" }, { status: 403 });
    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);

    if (action === "cancelProduction") {
      await reelProductionControl.cancel(id, body.supersededBy ? String(body.supersededBy) : undefined);
      const production = await reelProductionService.get(id);
      return NextResponse.json({ success: true, cancelled: true, production });
    }

    if (action === "transition") {
      const production = await reelProductionService.transition(id, String(body.to) as ReelProductionStatus, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    if (["generateNarration", "generateNextShot", "renderNarratedRoughCut"].includes(action)) {
      const current = await reelProductionService.get(id);
      if (!current) return NextResponse.json({ success: false, error: "Production not found" }, { status: 404 });
      if (expectedRevision !== undefined && expectedRevision !== current.revision) {
        return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${current.revision})` }, { status: 409 });
      }
      const { control } = await paidOperationContext(id);

      if (action === "generateNarration") {
        if (current.manifest.status !== "SCRIPT_READY") return NextResponse.json({ success: false, error: `Narration generation requires SCRIPT_READY; production is ${current.manifest.status}` }, { status: 409 });
        const fp = fingerprint({ script: current.manifest.masterScript, tone: current.manifest.tone });
        const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "NARRATION", manifestRevision: current.revision, fingerprint: fp });
        const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "NARRATION", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp } });
        return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
      }

      if (action === "generateNextShot") {
        if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) return NextResponse.json({ success: false, error: `Shot generation is not allowed while production is ${current.manifest.status}` }, { status: 409 });
        const completedIds = new Set(current.manifest.shots.filter(s => Boolean(s.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(s.status)).map(s => s.id));
        const shot = current.manifest.shots.find(s => ["PLANNED", "FAILED"].includes(s.status) && s.dependsOnShotIds.every(dep => completedIds.has(dep)));
        if (!shot) {
          const remaining = current.manifest.shots.filter(s => ["PLANNED", "FAILED"].includes(s.status));
          if (!remaining.length) return NextResponse.json({ success: true, production: current, queued: false, message: "No ungenerated shots remain." });
          return NextResponse.json({ success: false, error: "No shot is currently eligible; continuity dependencies are unresolved." }, { status: 409 });
        }
        const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
        const dependencyEvidence = shot.dependsOnShotIds.map(depId => ({ id: depId, url: current.manifest.shots.find(s => s.id === depId)?.asset?.videoUrl || null }));
        const fp = fingerprint({ prompt: shot.generationPrompt, duration: shot.generationDurationSec, modelTier, dependencyEvidence });
        const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "SHOT", targetId: shot.id, manifestRevision: current.revision, fingerprint: fp });
        const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "SHOT", targetId: shot.id, idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, modelTier } });
        return NextResponse.json({ success: true, queued: true, operation, production: current, shotId: shot.id }, { status: 202 });
      }

      if (current.manifest.status !== "ROUGH_CUT_READY") return NextResponse.json({ success: false, error: `Narrated rough-cut render requires ROUGH_CUT_READY; production is ${current.manifest.status}` }, { status: 409 });
      const fp = fingerprint({ audio: current.manifest.audio.narrationUrl, duration: current.manifest.audio.actualDurationSec, shots: current.manifest.shots.map(s => [s.id, s.asset?.videoUrl, s.trimInSec, s.trimOutSec]) });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "ROUGH_CUT", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "ROUGH_CUT", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp } });
      return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
    }

    if (action === "attachNarration" || action === "attachShotAsset") return NextResponse.json({ success: false, error: `${action} is disabled; production evidence may only be attached by the durable worker` }, { status: 410 });

    if (action === "auditManifest") {
      const production = await reelProductionService.applyManifestAudit(id, expectedRevision);
      return NextResponse.json({ success: true, production });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update production";
    const unavailable = message.includes("worker unavailable") || message.includes("Production control requires Postgres");
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("dependency") || message.includes("cancelled");
    return NextResponse.json({ success: false, error: message }, { status: unavailable ? 503 : conflict ? 409 : 400 });
  }
}
