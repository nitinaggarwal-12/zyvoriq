import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { operationKey, reelOperationQueue, type ReelOperation } from "@/lib/reel/operationQueue";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { studio1Service } from "@/lib/studio1/service";
import type { Studio1SubjectMode } from "@/lib/studio1/planner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fingerprint(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

async function paidContext(id: string) {
  const [control, worker] = await Promise.all([
    reelProductionControl.requireActive(id),
    reelProductionControl.workerHealth(),
  ]);
  if (!worker.healthy) throw new Error(`Dedicated production worker unavailable: ${worker.reason || "stale heartbeat"}`);
  return control;
}

async function enqueueShot(production: NonNullable<Awaited<ReturnType<typeof studio1Service.get>>>, shotId: string, modelTier: "fast" | "quality" | "lite" = "fast", nonce?: string) {
  const shot = production.manifest.shots.find(item => item.id === shotId);
  if (!shot) throw new Error(`Shot ${shotId} not found`);
  const control = await paidContext(production.id);
  const fp = fingerprint({ prompt: shot.generationPrompt, duration: shot.generationDurationSec, modelTier, round: (production.manifest as any).studio1?.generationRound, nonce });
  const idempotencyKey = operationKey({ productionId: production.id, generationToken: control.generationToken, kind: "SHOT", targetId: shot.id, manifestRevision: production.revision, fingerprint: fp });
  return reelOperationQueue.enqueue({ productionId: production.id, kind: "SHOT", targetId: shot.id, idempotencyKey, payload: { manifestRevision: production.revision, generationToken: control.generationToken, semanticFingerprint: fp, modelTier, studio1: true } });
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const production = await studio1Service.get(id);
    if (!production) return NextResponse.json({ success: false, error: "Studio1 production not found" }, { status: 404 });
    let operations: ReelOperation[] = [];
    try { operations = await reelOperationQueue.latestForProduction(id, 20); } catch {}
    return NextResponse.json({ success: true, production, operations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load Studio1 production" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id.startsWith("studio1_")) return NextResponse.json({ success: false, error: "Studio1 may only mutate studio1_-prefixed productions" }, { status: 403 });
    const body = await req.json();
    const action = String(body.action || "");
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);
    let current = await studio1Service.get(id);
    if (!current) return NextResponse.json({ success: false, error: "Studio1 production not found" }, { status: 404 });
    if (expectedRevision !== undefined && current.revision !== expectedRevision) return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${current.revision})` }, { status: 409 });

    if (action === "setPresenterContinuity") {
      const production = await studio1Service.setPresenterContinuity(id, Boolean(body.enabled), current.revision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "setEnvironmentContinuity") {
      const production = await studio1Service.setEnvironmentContinuity(id, Boolean(body.enabled), current.revision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "setSubjectMode") {
      const mode = String(body.mode) as Studio1SubjectMode;
      if (!["PRESENTER", "NO_PERSON"].includes(mode)) return NextResponse.json({ success: false, error: "mode must be PRESENTER or NO_PERSON" }, { status: 400 });
      const production = await studio1Service.setSubjectMode(id, String(body.shotId || ""), mode, current.revision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "selectOption") {
      const production = await studio1Service.selectOption(id, String(body.shotId || ""), String(body.optionId || ""), current.revision);
      return NextResponse.json({ success: true, production });
    }

    if (action === "generateAllFresh") {
      const production = await studio1Service.prepareFreshAll(id, current.revision);
      return NextResponse.json({ success: true, production, fresh: true });
    }

    if (action === "regenerateShot") {
      current = await studio1Service.prepareShotRegeneration(id, String(body.shotId || ""), current.revision);
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const operation = await enqueueShot(current, String(body.shotId || ""), modelTier, crypto.randomUUID());
      return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
    }

    if (action === "generateNarration") {
      if (current.manifest.status !== "SCRIPT_READY") return NextResponse.json({ success: false, error: `Narration generation requires SCRIPT_READY; production is ${current.manifest.status}` }, { status: 409 });
      const control = await paidContext(id);
      const fp = fingerprint({ script: current.manifest.masterScript, tone: current.manifest.tone, studio1: true });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "NARRATION", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "NARRATION", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, studio1: true } });
      return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
    }

    if (action === "generateNextShot") {
      if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) return NextResponse.json({ success: false, error: `Shot generation is not allowed while production is ${current.manifest.status}` }, { status: 409 });
      const completedIds = new Set(current.manifest.shots.filter(item => item.asset?.videoUrl && ["GENERATED", "PASSED"].includes(item.status)).map(item => item.id));
      const shot = current.manifest.shots.find(item => ["PLANNED", "FAILED"].includes(item.status) && !item.asset?.videoUrl && item.dependsOnShotIds.every(dep => completedIds.has(dep)));
      if (!shot) {
        const remaining = current.manifest.shots.filter(item => ["PLANNED", "FAILED"].includes(item.status) && !item.asset?.videoUrl);
        if (!remaining.length) return NextResponse.json({ success: true, production: current, queued: false, message: "No ungenerated Studio1 shots remain." });
        return NextResponse.json({ success: false, error: "No Studio1 shot is eligible yet; environment continuity dependency is unresolved." }, { status: 409 });
      }
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const operation = await enqueueShot(current, shot.id, modelTier);
      return NextResponse.json({ success: true, queued: true, operation, production: current, shotId: shot.id }, { status: 202 });
    }

    if (action === "renderNarratedRoughCut") {
      if (current.manifest.status !== "ROUGH_CUT_READY") return NextResponse.json({ success: false, error: `Narrated rough-cut render requires ROUGH_CUT_READY; production is ${current.manifest.status}` }, { status: 409 });
      const control = await paidContext(id);
      const fp = fingerprint({ audio: current.manifest.audio.narrationUrl, shots: current.manifest.shots.map(shot => [shot.id, shot.asset?.videoUrl, shot.trimInSec, shot.trimOutSec]), studio1: true });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "ROUGH_CUT", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "ROUGH_CUT", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, studio1: true } });
      return NextResponse.json({ success: true, queued: true, operation, production: current }, { status: 202 });
    }

    return NextResponse.json({ success: false, error: `Unsupported Studio1 action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update Studio1 production";
    const unavailable = message.includes("worker unavailable") || message.includes("requires Postgres");
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("not found") || message.includes("dependency");
    return NextResponse.json({ success: false, error: message }, { status: unavailable ? 503 : conflict ? 409 : 400 });
  }
}
