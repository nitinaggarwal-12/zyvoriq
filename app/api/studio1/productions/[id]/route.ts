import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { operationKey, reelOperationQueue, type ReelOperation } from "@/lib/reel/operationQueue";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";
import { studio1Service } from "@/lib/studio1/service";
import { planStudio1ProductionTimeline, syncStudio1ProductionTimeline } from "@/lib/studio1/timelineSyncService";
import type { Studio1SubjectMode } from "@/lib/studio1/planner";
import { canExtend } from "@/lib/reel/preconditions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fingerprint(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);
}

function presentProduction<T extends { manifest: any }>(production: T) {
  return suppressUncertifiedStudio1Outputs(production as any) as T;
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

  const gate = canExtend(shotId, production.manifest);
  if (!gate.ok) {
    throw new Error(`Cannot enqueue shot ${shotId}: [${gate.kind}] ${gate.reason}`);
  }

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
    return NextResponse.json({ success: true, production: presentProduction(production), operations }, { headers: { "Cache-Control": "no-store" } });
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

    if (action === "renameProject") {
      const production = await studio1Service.renameProject(id, String(body.projectTitle || ""), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "duplicateProject") {
      const production = await studio1Service.duplicateProject(id);
      let control = null;
      try { control = await reelProductionControl.register(production.id); } catch {}
      return NextResponse.json({ success: true, production: presentProduction(production), duplicated: true, productionControl: control ? { generationToken: control.generationToken } : null }, { status: 201 });
    }

    if (action === "editShot") {
      const production = await studio1Service.editShot(id, String(body.shotId || ""), String(body.visualIntent || ""), String(body.scriptText || ""), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "addShotAfter") {
      const production = await studio1Service.addShotAfter(id, String(body.shotId || ""), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "deleteShot") {
      const production = await studio1Service.deleteShot(id, String(body.shotId || ""), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "moveShot") {
      const direction = Number(body.direction) === -1 ? -1 : Number(body.direction) === 1 ? 1 : 0;
      if (!direction) return NextResponse.json({ success: false, error: "direction must be -1 or 1" }, { status: 400 });
      const production = await studio1Service.moveShot(id, String(body.shotId || ""), direction, current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "setPresenterContinuity") {
      const production = await studio1Service.setPresenterContinuity(id, Boolean(body.enabled), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "setEnvironmentContinuity") {
      const production = await studio1Service.setEnvironmentContinuity(id, Boolean(body.enabled), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "setSubjectMode") {
      const mode = String(body.mode) as Studio1SubjectMode;
      if (!["PRESENTER", "NO_PERSON"].includes(mode)) return NextResponse.json({ success: false, error: "mode must be PRESENTER or NO_PERSON" }, { status: 400 });
      const production = await studio1Service.setSubjectMode(id, String(body.shotId || ""), mode, current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "selectOption") {
      const production = await studio1Service.selectOption(id, String(body.shotId || ""), String(body.optionId || ""), current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production) });
    }

    if (action === "generateAllFresh") {
      const production = await studio1Service.prepareFreshAll(id, current.revision);
      return NextResponse.json({ success: true, production: presentProduction(production), fresh: true });
    }

    if (action === "regenerateShot") {
      current = await studio1Service.prepareShotRegeneration(id, String(body.shotId || ""), current.revision);
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const operation = await enqueueShot(current, String(body.shotId || ""), modelTier, crypto.randomUUID());
      return NextResponse.json({ success: true, queued: true, operation, production: presentProduction(current) }, { status: 202 });
    }

    if (action === "generateNarration") {
      if (current.manifest.status !== "SCRIPT_READY") return NextResponse.json({ success: false, error: `Narration generation requires SCRIPT_READY; production is ${current.manifest.status}` }, { status: 409 });
      const control = await paidContext(id);
      const fp = fingerprint({ script: current.manifest.masterScript, tone: current.manifest.tone, studio1: true });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "NARRATION", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "NARRATION", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, studio1: true } });
      return NextResponse.json({ success: true, queued: true, operation, production: presentProduction(current) }, { status: 202 });
    }

    if (action === "generateNextShot") {
      const hasAnyClip = current.manifest.shots.some(item => Boolean(item.asset?.videoUrl));
      const exactVersion = Number((current.manifest as any).studio1?.timelineSync?.version || 0);
      if (!hasAnyClip && current.manifest.audio?.alignmentValidation?.passed && exactVersion < 2) {
        current = await planStudio1ProductionTimeline(id, current.revision);
      }
      if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) return NextResponse.json({ success: false, error: `Shot generation is not allowed while production is ${current.manifest.status}` }, { status: 409 });
      const completedIds = new Set(current.manifest.shots.filter(item => item.asset?.videoUrl && ["GENERATED", "PASSED"].includes(item.status)).map(item => item.id));
      const shot = current.manifest.shots.find(item => ["PLANNED", "FAILED"].includes(item.status) && !item.asset?.videoUrl && item.dependsOnShotIds.every(dep => completedIds.has(dep)));
      if (!shot) {
        const remaining = current.manifest.shots.filter(item => ["PLANNED", "FAILED"].includes(item.status) && !item.asset?.videoUrl);
        if (!remaining.length) return NextResponse.json({ success: true, production: presentProduction(current), queued: false, message: "No ungenerated Studio1 shots remain." });
        return NextResponse.json({ success: false, error: "No Studio1 shot is eligible yet; environment continuity dependency is unresolved." }, { status: 409 });
      }
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const operation = await enqueueShot(current, shot.id, modelTier);
      return NextResponse.json({ success: true, queued: true, operation, production: presentProduction(current), shotId: shot.id }, { status: 202 });
    }

    if (action === "generateAllShotsParallel") {
      const hasAnyClip = current.manifest.shots.some(item => Boolean(item.asset?.videoUrl));
      const exactVersion = Number((current.manifest as any).studio1?.timelineSync?.version || 0);
      if (!hasAnyClip && current.manifest.audio?.alignmentValidation?.passed && exactVersion < 2) {
        const planned = await planStudio1ProductionTimeline(id, current.revision);
        if (planned) current = planned;
      }
      if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) {
        return NextResponse.json({ success: false, error: `Shot generation is not allowed while production is ${current.manifest.status}` }, { status: 409 });
      }
      const ungenerated = current.manifest.shots.filter(item => !item.asset?.videoUrl);
      if (!ungenerated.length) {
        return NextResponse.json({ success: true, production: presentProduction(current), queued: false, message: "All Studio1 shots already generated." });
      }
      const modelTier = body.modelTier === "quality" || body.modelTier === "lite" ? body.modelTier : "fast";
      const validProduction = current!;
      const enqueuedOps = await Promise.all(ungenerated.map(shot => enqueueShot(validProduction, shot.id, modelTier)));
      return NextResponse.json({ success: true, queued: true, count: enqueuedOps.length, operations: enqueuedOps, production: presentProduction(validProduction) }, { status: 202 });
    }

    if (action === "renderNarratedRoughCut") {
      const complete = current.manifest.shots.length > 0 && current.manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
      if (!complete) return NextResponse.json({ success: false, error: "Narrated rough-cut render requires every Studio1 scene to have a generated clip" }, { status: 409 });
      if (!current.manifest.audio?.narrationUrl || !current.manifest.audio?.alignmentValidation?.passed) return NextResponse.json({ success: false, error: "Narrated rough-cut render requires validated narration alignment" }, { status: 409 });

      current = await syncStudio1ProductionTimeline(id, current.revision);
      const control = await paidContext(id);
      const fp = fingerprint({
        audio: current.manifest.audio.narrationUrl,
        audioDuration: current.manifest.audio.actualDurationSec,
        timelineSync: (current.manifest as any).studio1?.timelineSync,
        shots: current.manifest.shots.map(shot => [shot.id, shot.asset?.videoUrl, shot.editorialStartSec, shot.editorialDurationSec, shot.trimInSec, shot.trimOutSec]),
        studio1: true,
      });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "ROUGH_CUT", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "ROUGH_CUT", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, studio1: true, narrationSyncedTimeline: true } });
      return NextResponse.json({ success: true, queued: true, operation, production: presentProduction(current), timelineSync: (current.manifest as any).studio1?.timelineSync }, { status: 202 });
    }

    if (action === "generateNativeReel") {
      // Option C: one continuous Veo generation with native audio. No TTS, no
      // per-shot clips, no timeline sync — the model speaks the beats itself.
      const beats = current.manifest.shots.map(shot => String((shot as any).scriptText || "").trim()).filter(Boolean);
      if (beats.length !== current.manifest.shots.length || beats.length === 0) {
        return NextResponse.json({ success: false, error: "Native reel requires scriptText on every planned scene" }, { status: 409 });
      }
      const control = await paidContext(id);
      const fp = fingerprint({ beats, character: (current.manifest.shots[0] as any)?.continuityIn, tone: current.manifest.tone, native: true });
      const idempotencyKey = operationKey({ productionId: id, generationToken: control.generationToken, kind: "NATIVE_REEL", manifestRevision: current.revision, fingerprint: fp });
      const operation = await reelOperationQueue.enqueue({ productionId: id, kind: "NATIVE_REEL", idempotencyKey, payload: { manifestRevision: current.revision, generationToken: control.generationToken, semanticFingerprint: fp, studio1: true, nativeAudio: true } });
      return NextResponse.json({ success: true, queued: true, operation, production: presentProduction(current) }, { status: 202 });
    }

    return NextResponse.json({ success: false, error: `Unsupported Studio1 action: ${action}` }, { status: 400 });
  } catch (error: any) {
    const message = error?.message || "Failed to update Studio1 production";
    const unavailable = message.includes("worker unavailable") || message.includes("requires Postgres");
    const conflict = message.includes("concurrently") || message.includes("requires") || message.includes("not allowed") || message.includes("not found") || message.includes("dependency") || message.includes("regeneration") || message.includes("align");
    return NextResponse.json({ success: false, error: message }, { status: unavailable ? 503 : conflict ? 409 : 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id.startsWith("studio1_")) return NextResponse.json({ success: false, error: "Studio1 may only delete studio1_-prefixed productions" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const expectedRevision = body.expectedRevision === undefined ? undefined : Number(body.expectedRevision);
    await studio1Service.deleteProject(id, expectedRevision);
    return NextResponse.json({ success: true, deletedId: id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    const message = error?.message || "Failed to delete Studio1 production";
    const conflict = message.includes("concurrently") || message.includes("not found");
    return NextResponse.json({ success: false, error: message }, { status: conflict ? 409 : 400 });
  }
}
