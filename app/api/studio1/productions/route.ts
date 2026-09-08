import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { operationKey, reelOperationQueue } from "@/lib/reel/operationQueue";
import { planStudio1 } from "@/lib/studio1/planner";
import { studio1Service } from "@/lib/studio1/service";

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

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || 25);
    const productions = await studio1Service.list(Math.max(1, Math.min(100, limit)));
    return NextResponse.json({ success: true, productions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to list Studio1 productions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || body.prompt || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "topic is required" }, { status: 400 });

    const platform = body.platform === "YouTube Shorts" || body.platform === "youtube"
      ? "YouTube Shorts"
      : body.platform === "TikTok" || body.platform === "tiktok"
      ? "TikTok"
      : "Instagram Reels";

    const manifest = await planStudio1({
      topic,
      tone: body.tone,
      platform,
      aspectRatio: body.aspectRatio || (platform === "YouTube Shorts" ? "2.39:1" : "9:16"),
      requestedDurationSec: Number(body.requestedDurationSec || body.duration || 30),
      scriptText: body.scriptText,
    });
    const production = await reelProductionStore.create(manifest);

    let control = null;
    let operation = null;
    try {
      control = await reelProductionControl.register(production.id);
      if (body.autoStart !== false) {
        const ctrl = await paidContext(production.id);
        const fp = fingerprint({ script: manifest.masterScript, tone: manifest.tone, studio1: true });
        const idempotencyKey = operationKey({
          productionId: production.id,
          generationToken: ctrl.generationToken,
          kind: "NARRATION",
          manifestRevision: production.revision,
          fingerprint: fp,
        });
        operation = await reelOperationQueue.enqueue({
          productionId: production.id,
          kind: "NARRATION",
          idempotencyKey,
          payload: {
            manifestRevision: production.revision,
            generationToken: ctrl.generationToken,
            semanticFingerprint: fp,
            studio1: true,
          },
        });
      }
    } catch (ctrlErr: any) {
      console.warn(`[studio1] Auto-start narration note: ${ctrlErr?.message || ctrlErr}`);
    }

    return NextResponse.json({
      success: true,
      production,
      productionId: production.id,
      productionControl: control ? { generationToken: control.generationToken } : null,
      operation,
      studio1: true,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to create Studio1 production" }, { status: 400 });
  }
}
