import type { ReelProductionManifest, ReelShot, WordTiming } from "../lib/reel/types";

export interface Studio1TimelineSyncResult {
  version: 2;
  source: "transcript-scene-alignment";
  narrationDurationSec: number;
  sceneDurationsSec: number[];
  boundariesSec: number[];
  boundaryAnchors: Array<{
    fromShotId: string;
    toShotId: string;
    beforeWord: string;
    afterWord: string;
    beforeTimingIndex: number;
    afterTimingIndex: number;
    boundarySec: number;
  }>;
  sceneAlignment: Array<{
    shotId: string;
    shotIndex: number;
    scriptStartIndex: number;
    scriptEndIndex: number;
    scriptWordCount: number;
    mappedWordCount: number;
    exactWordCount: number;
    coverage: number;
    exactRatio: number;
  }>;
  globalExactRatio: number;
  editDistance: number;
  adaptations?: Array<Record<string, unknown>>;
  frameRate?: number;
  maxAllowedBoundaryDriftMs?: number;
  syncedAt?: string;
}

export interface Studio1RenderScenePlan {
  shotId: string;
  inputIndex: number;
  frameCount: number;
  expectedStartSec: number;
  expectedEndSec: number;
  renderedStartSec: number;
  renderedEndSec: number;
  boundaryDriftMs: number;
  sourceSec: number;
  targetSec: number;
  retimeFactor: number;
  padSec: number;
}

export interface Studio1RenderPlan {
  fps: number;
  expectedDurationSec: number;
  renderedVideoClockSec: number;
  maxBoundaryDriftMs: number;
  scenes: Studio1RenderScenePlan[];
}

export function computeStudio1NarrationTimeline(input: {
  shots: ReelProductionManifest["shots"];
  timings: WordTiming[];
  durationSec: number;
}): Studio1TimelineSyncResult;

export function synchronizeStudio1ManifestTimeline(
  manifest: ReelProductionManifest,
  options?: { mode?: "plan" | "render"; resetAssets?: boolean },
): Studio1TimelineSyncResult;

export function buildStudio1RenderPlan(manifest: ReelProductionManifest): Studio1RenderPlan;
export function buildStudio1VisualFilter(shot: ReelShot, scenePlan: Studio1RenderScenePlan, options?: { unifiedScale?: boolean }): string;
