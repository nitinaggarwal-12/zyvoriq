import { reelProductionStore } from "@/lib/reel/productionStore";
import { isStudio1Manifest } from "./planner";
import { planStudio1TimelineFromNarration, syncStudio1TimelineToNarration } from "./timelineSync";

function requireStoredStudio1(stored: Awaited<ReturnType<typeof reelProductionStore.get>>, expectedRevision?: number) {
  if (!stored) throw new Error("Studio1 production not found");
  if (!isStudio1Manifest(stored.manifest)) throw new Error("This production does not belong to Studio1");
  if (expectedRevision !== undefined && stored.revision !== expectedRevision) {
    throw new Error(`Production changed concurrently (expected revision ${expectedRevision}, found ${stored.revision})`);
  }
  return stored;
}

export async function planStudio1ProductionTimeline(id: string, expectedRevision?: number) {
  const stored = requireStoredStudio1(await reelProductionStore.get(id), expectedRevision);
  const manifest = structuredClone(stored.manifest);
  if (manifest.shots.some(shot => Boolean(shot.asset?.videoUrl))) {
    throw new Error("Studio1 exact narration planning must run before the first scene clip is generated");
  }
  planStudio1TimelineFromNarration(manifest, false);
  if (manifest.outputs) {
    delete manifest.outputs.narratedRoughCut;
    delete manifest.outputs.master;
  }
  manifest.status = "SHOTS_PLANNED";
  return reelProductionStore.replace(id, manifest, stored.revision);
}

export async function syncStudio1ProductionTimeline(id: string, expectedRevision?: number) {
  const stored = requireStoredStudio1(await reelProductionStore.get(id), expectedRevision);
  const manifest = structuredClone(stored.manifest);
  syncStudio1TimelineToNarration(manifest);
  if (manifest.outputs) {
    delete manifest.outputs.narratedRoughCut;
    delete manifest.outputs.master;
  }
  const complete = manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  manifest.status = complete ? "ROUGH_CUT_READY" : manifest.status;
  return reelProductionStore.replace(id, manifest, stored.revision);
}
