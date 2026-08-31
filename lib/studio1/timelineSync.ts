import type { ReelProductionManifest } from "@/lib/reel/types";
import { synchronizeStudio1ManifestTimeline } from "../../scripts/studio1_timeline_sync.mjs";

const MAX_LOCAL_EXTENSION_RATIO = 1.2;
const MAX_LOCAL_EXTENSION_SEC = 0.75;
const clock = (value: number) => Number(value.toFixed(6));

function synchronizeDraftCaptions(manifest: ReelProductionManifest) {
  if (manifest.captions?.timingSource !== "draft") return;
  manifest.captions.cues = manifest.shots
    .filter(shot => shot.scriptText.trim())
    .map((shot, index) => ({
      id: manifest.captions?.cues[index]?.id || `caption_draft_${String(index + 1).padStart(2, "0")}`,
      startSec: clock(shot.editorialStartSec),
      endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
      text: shot.scriptText.trim(),
      wordIds: [],
      lines: [shot.scriptText.trim()],
      position: "lower-third" as const,
    }));
}

function enforceLocalAdaptationPolicy(manifest: ReelProductionManifest) {
  const adaptations = ((manifest as any).studio1?.timelineSync?.adaptations || []) as Array<Record<string, unknown>>;
  for (const item of adaptations) {
    const sourceSec = Number(item.sourceSec || 0);
    const targetSec = Number(item.targetSec || 0);
    if (!(sourceSec > 0) || !(targetSec > sourceSec)) continue;
    const deficitSec = targetSec - sourceSec;
    const ratio = targetSec / sourceSec;
    if (deficitSec > MAX_LOCAL_EXTENSION_SEC || ratio > MAX_LOCAL_EXTENSION_RATIO) {
      throw new Error(`Studio1 scene ${String(item.shotId || "unknown")} needs selective regeneration: narration slot ${targetSec.toFixed(2)}s exceeds source ${sourceSec.toFixed(2)}s by ${deficitSec.toFixed(2)}s`);
    }
  }
}

export function syncStudio1TimelineToNarration(manifest: ReelProductionManifest) {
  const result = synchronizeStudio1ManifestTimeline(manifest, { mode: "render" });
  enforceLocalAdaptationPolicy(manifest);
  synchronizeDraftCaptions(manifest);
  return result;
}

export function planStudio1TimelineFromNarration(manifest: ReelProductionManifest, resetAssets = false) {
  const result = synchronizeStudio1ManifestTimeline(manifest, { mode: "plan", resetAssets });
  synchronizeDraftCaptions(manifest);
  return result;
}
