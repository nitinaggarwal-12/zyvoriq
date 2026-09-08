import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { reelProductionStore } from "@/lib/reel/productionStore";
import { reelProductionControl } from "@/lib/reel/productionControl";
import { operationKey, reelOperationQueue, type ReelOperation } from "@/lib/reel/operationQueue";
import { planStudio1 } from "@/lib/studio1/planner";
import { studio1Service } from "@/lib/studio1/service";
import type { ReelProductionManifest } from "@/lib/reel/types";

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

function extractRoughCutUrl(manifest: ReelProductionManifest, operations: ReelOperation[] = []): string | null {
  const outputs = manifest.outputs as any;
  const roughCutOutput = outputs?.narratedRoughCut?.videoUrl || outputs?.nativeReel?.videoUrl || outputs?.master?.videoUrl;
  if (roughCutOutput) return roughCutOutput;

  // Fallback to succeeded ROUGH_CUT operation result if manifest.outputs has not yet updated
  const roughCutOp = operations.find(o => (o.kind === "ROUGH_CUT" || (o as any).operation_type === "ROUGH_CUT") && o.status === "SUCCEEDED");
  if (roughCutOp?.result && typeof (roughCutOp.result as any).videoUrl === "string") {
    return (roughCutOp.result as any).videoUrl;
  }
  if (roughCutOp?.payload && typeof (roughCutOp.payload as any).videoUrl === "string") {
    return (roughCutOp.payload as any).videoUrl;
  }

  return null;
}

function cleanTitle(m: any): string {
  if (m.projectTitle && typeof m.projectTitle === "string" && m.projectTitle.length <= 60) return m.projectTitle;
  if (m.title && typeof m.title === "string" && m.title.length <= 60) return m.title;
  const raw = m.topic || m.prompt || "";
  const words = String(raw).replace(/[^\w\s]/gi, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Omni 4K Master Cinema Reel";
  return words.slice(0, 6).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function buildSceneObject(production: { id: string; manifest: ReelProductionManifest }, operations: ReelOperation[] = []) {
  const m = production.manifest;
  const roughCutUrl = extractRoughCutUrl(m, operations);
  const firstShot = m.shots?.[0];
  const stillUrl = (firstShot?.asset as any)?.imageUrl || (firstShot?.asset as any)?.stillUrl || (m as any).posterUrl || (m as any).heroPlateUrl;

  const rawLines = Array.isArray((m as any).scriptLines) && (m as any).scriptLines.length > 0
    ? (m as any).scriptLines
    : (m as any).masterScript
    ? String((m as any).masterScript).split("\n").map((line: string) => line.trim()).filter(Boolean)
    : (m.shots || []).map((s, idx) => ({
        id: s.id || `shot_${String(idx + 1).padStart(2, "0")}`,
        speaker: (s as any).characterId?.toUpperCase() || (s as any).speaker || "OMNI",
        emotion: (s.continuityOut as any)?.emotion?.emotion || (s as any).emotion || "cinematic",
        timestamp: `00:${String(Math.floor(s.editorialStartSec || 0)).padStart(2, "0")}`,
        text: s.scriptText || s.visualIntent || `Scene beat ${idx + 1}`,
      }));

  const scriptLines = rawLines.map((item: any, idx: number) => {
    if (typeof item === "string") {
      return {
        id: `line_${idx + 1}`,
        speaker: "OMNI",
        emotion: "cinematic",
        timestamp: `00:${String(idx * 3).padStart(2, "0")}`,
        text: item,
      };
    }
    return {
      id: item.id || `line_${idx + 1}`,
      speaker: item.speaker || "OMNI",
      emotion: item.emotion || "cinematic",
      timestamp: item.timestamp || "00:00",
      text: item.text || item.scriptText || item.dialogue || "",
    };
  });

  return {
    id: production.id,
    title: cleanTitle(m),
    genre: (m as any).genre || (m as any).creationIntent?.categoryLabel || "Cinematic Reel",
    setting: (m as any).setting || (m.scenes && Object.values(m.scenes)[0]?.environment) || "",
    dynamic: (m as any).dynamic || m.tone || "",
    prompt: (m as any).prompt || (m as any).masterScript || m.topic || "",
    duration: m.plannedDurationSec || (m as any).duration || (m as any).requestedDurationSec || (m.shots.length * 6),
    aspectRatio: m.aspectRatio || "9:16",
    video: roughCutUrl || undefined,
    still: stillUrl || undefined,
    lines: scriptLines,
    shots: m.shots || [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || id === "new_creation") {
      return NextResponse.json({ success: false, error: "Valid id parameter is required" }, { status: 400 });
    }

    let production = await studio1Service.get(id);
    if (!production) {
      production = await reelProductionStore.get(id);
    }

    if (!production) {
      return NextResponse.json({ success: false, error: `Production ${id} not found` }, { status: 404 });
    }

    let operations: ReelOperation[] = [];
    try {
      operations = await reelOperationQueue.latestForProduction(id, 25);
    } catch {}

    const scene = buildSceneObject(production, operations);

    return NextResponse.json({
      success: true,
      production,
      operations,
      shots: production.manifest.shots || [],
      scene,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to get Omni studio generation" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || body.prompt || "").trim();
    if (!topic) return NextResponse.json({ success: false, error: "prompt is required" }, { status: 400 });

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
      genre: body.genre,
      language: body.language || body.narrationLanguage,
    });

    const production = await reelProductionStore.create(manifest);

    let control = null;
    let operation = null;
    const initialPriority = Number(body.priority || 0);
    try {
      control = await reelProductionControl.register(production.id, initialPriority);
      if (body.autoStart !== false) {
        const ctrl = await paidContext(production.id);
        const fp = fingerprint({ script: manifest.masterScript, tone: manifest.tone, language: manifest.language, studio1: true });
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
            language: manifest.language,
          },
        });
      }
    } catch (ctrlErr: any) {
      console.warn(`[omni-generate] Auto-start narration note: ${ctrlErr?.message || ctrlErr}`);
    }

    const scene = buildSceneObject(production, operation ? [operation] : []);

    return NextResponse.json({
      success: true,
      production,
      productionId: production.id,
      productionControl: control ? { generationToken: control.generationToken } : null,
      operation,
      shots: production.manifest.shots || [],
      scene,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to execute Omni generation" }, { status: 500 });
  }
}
