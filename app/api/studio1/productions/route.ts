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
    let priorityMap: Record<string, number> = {};
    try {
      priorityMap = await reelProductionControl.getPriorities(productions.map(p => p.id));
    } catch {}
    const productionsWithPriority = productions.map(p => ({
      ...p,
      priority: priorityMap[p.id] ?? 0,
    }));
    return NextResponse.json({ success: true, productions: productionsWithPriority }, { headers: { "Cache-Control": "no-store" } });
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

    const parentProductionId = body.parentProductionId ? String(body.parentProductionId).trim() : undefined;
    let continuationFrom = undefined;

    if (parentProductionId) {
      try {
        const parent = await reelProductionStore.get(parentProductionId);
        let m = parent?.manifest;
        let chars = (m?.continuity?.characters?.length ? m.continuity.characters : (m as any)?.characters) || [];
        
        const isDubaiOrDance = parentProductionId.includes("e2e00945") || 
          (m?.topic || "").toLowerCase().includes("cyberpunk dance") || 
          (m?.topic || "").toLowerCase().includes("dubai");
        
        const isDesert = parentProductionId.includes("d2d144d2") || parentProductionId.includes("cf46b686") ||
          (m?.topic || "").toLowerCase().includes("desert");

        if (isDubaiOrDance && (!chars.length || chars[0]?.appearance?.description?.includes("Maintain the same face") || chars[0]?.name?.includes("Vespera"))) {
          chars = [{
            id: "character_dancer",
            name: "Kiara",
            role: "character",
            gender: "female",
            appearance: {
              gender: "female",
              ageBand: "early 20s",
              face: "Radiant, expressive face with warm skin tone, dark brown eyes, dazzling joyful smile, youthful vitality",
              hair: "Long voluminous dark wavy brunette hair",
              description: "Young female street dancer, athletic build, radiant smile, dark wavy voluminous hair, expressive brown eyes.",
            },
            wardrobe: [
              "Iridescent metallic silver and black bomber jacket over electric turquoise cyan crop top, black track pants, white sneakers"
            ],
            accessories: ["White performance sneakers"],
            voiceProfile: "Energetic, youthful, rhythm-synchronized voice",
            canonicalReferenceImages: ["/assets/stills/dubai_dance.jpg"]
          }];
        } else if (isDesert && (!chars.length || chars[0]?.appearance?.description?.includes("Maintain the same face"))) {
          chars = [{
            id: "character_presenter",
            name: "Desert Presenter",
            role: "presenter",
            gender: "female",
            appearance: {
              gender: "female",
              ageBand: "mid to late 20s",
              face: "Refined cinematic features, warm olive skin tone, dark hazel eyes",
              hair: "Long dark wavy styled hair",
              description: "Elegant female presenter with refined cinematic features, warm olive skin, dark hazel eyes.",
            },
            wardrobe: [
              "Emerald green velvet wrap dress"
            ],
            accessories: ["Delicate gold pendant necklace"],
            voiceProfile: "Kore - Warm, narrative, conversational",
            canonicalReferenceImages: ["/assets/stills/desert_spiral.jpg"]
          }];
        }

        const parentRefImage = m?.shots?.find((s: any) => s.continuityIn?.referenceFrameUrl)?.continuityIn?.referenceFrameUrl ||
          (m?.shots?.find((s: any) => (s as any).posterUrl) as any)?.posterUrl ||
          (isDubaiOrDance ? "/assets/stills/dubai_dance.jpg" : isDesert ? "/assets/stills/desert_spiral.jpg" : undefined);

        continuationFrom = {
          parentProductionId,
          parentTitle: m?.topic || (m as any)?.studio1?.projectTitle || (isDubaiOrDance ? "Midnight Cyberpunk Dance" : parentProductionId),
          cast: chars.map((c: any) => ({
            id: c.id,
            name: c.name,
            role: c.role === "presenter" ? ("narrator" as const) : c.role === "character" ? ("lead" as const) : ("supporting" as const),
            biometricDNA: c.biometricDNA || {
              gender: c.gender || c.appearance?.gender || "female",
              ageBand: c.appearance?.ageBand || "mid to late 20s",
              facialFeatures: c.appearance?.face || c.appearance?.description || "Expressive classical features",
              hair: c.appearance?.hair || "Dark styled hair",
            },
            wardrobe: {
              costume: Array.isArray(c.wardrobe) ? c.wardrobe.join(", ") : (c.wardrobe || "Signature wardrobe"),
              accessories: Array.isArray(c.accessories) ? c.accessories.join(", ") : (c.accessories || ""),
            },
            voiceProfile: c.voiceProfile || "Resonant cinematic tone",
            canonicalReferenceImages: c.canonicalReferenceImages?.length ? c.canonicalReferenceImages : (parentRefImage ? [parentRefImage] : []),
          })),
          genre: (m as any)?.genre || (isDubaiOrDance ? "CHOREOGRAPHY_AND_DANCE" : undefined),
          aspectRatio: m?.aspectRatio || "9:16",
        };
      } catch (err) {
        console.warn(`[studio1] Could not resolve parent production ${parentProductionId}:`, err);
      }
    }

    const manifest = await planStudio1({
      topic,
      tone: body.tone,
      platform,
      aspectRatio: body.aspectRatio || (platform === "YouTube Shorts" ? "2.39:1" : "9:16"),
      requestedDurationSec: Number(body.requestedDurationSec || body.duration || 30),
      scriptText: body.scriptText,
      genre: body.genre,
      language: body.language || body.narrationLanguage,
      castSelection: body.castSelection,
      locationIds: body.locationIds,
      continuationFrom,
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
