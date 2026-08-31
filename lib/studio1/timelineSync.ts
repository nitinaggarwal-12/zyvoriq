import type { ReelProductionManifest } from "@/lib/reel/types";
import { synchronizeStudio1ManifestTimeline } from "../../scripts/studio1_timeline_sync.mjs";

export function syncStudio1TimelineToNarration(manifest: ReelProductionManifest) {
  return synchronizeStudio1ManifestTimeline(manifest, { mode: "render" });
}

export function planStudio1TimelineFromNarration(manifest: ReelProductionManifest, resetAssets = false) {
  return synchronizeStudio1ManifestTimeline(manifest, { mode: "plan", resetAssets });
}
