import { reelProductionStore } from "@/lib/reel/productionStore";
import { isStudio1Manifest } from "./planner";
import { syncStudio1TimelineToNarration } from "./timelineSync";

export async function syncStudio1ProductionTimeline(id: string, expectedRevision?: number) {
  const stored = await reelProductionStore.get(id);
  if (!stored) throw new Error("Studio1 production not found");
  if (!isStudio1Manifest(stored.manifest)) throw new Error("This production does not belong to Studio1");
  if (expectedRevision !== undefined && stored.revision !== expectedRevision) {
    throw new Error(`Production changed concurrently (expected revision ${expectedRevision}, found ${stored.revision})`);
  }

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
