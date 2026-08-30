import type { BoundaryState, CharacterBible, PerformanceTrack, ReelProductionManifest } from "./types";

export type ProductionOperation =
  | "GENERATE_VIDEO"
  | "EXTEND_VIDEO"
  | "EDIT_VIDEO"
  | "INTERPOLATE_BOUNDARY"
  | "REFERENCE_GENERATE"
  | "PERFORMANCE_RENDER"
  | "LIP_SYNC"
  | "TRANSCRIBE"
  | "MUSIC_GENERATE"
  | "MUSIC_STEER"
  | "SEMANTIC_QA"
  | "BOUNDARY_QA"
  | "WHOLE_REEL_QA"
  | "REPAIR";

export interface ProviderCapability {
  providerId: string;
  operation: ProductionOperation;
  enabled: boolean;
  model?: string;
  supportsReferenceImages?: boolean;
  supportsFirstFrame?: boolean;
  supportsLastFrame?: boolean;
  supportsContinuousIdentity?: boolean;
  supportsAudioDrivenPerformance?: boolean;
  supportsLongRunningResume?: boolean;
  maxDurationSec?: number;
  priority?: number;
  note?: string;
}

export interface ProviderRegistry {
  capabilities: ProviderCapability[];
}

export interface PersistentPerformanceRenderInput {
  manifestId: string;
  character: CharacterBible;
  track: PerformanceTrack;
  narrationUrl: string;
  durationSec: number;
}

export interface PersistentPerformanceRenderResult {
  videoUrl: string;
  durationSec: number;
  provider: string;
  model?: string;
  evidence: {
    audioDriven: boolean;
    identityReferenceCount: number;
    operationId?: string;
  };
}

export interface PersistentPerformanceProvider {
  id: string;
  render(input: PersistentPerformanceRenderInput): Promise<PersistentPerformanceRenderResult>;
}

export interface BoundaryRoutingDecision {
  operation: ProductionOperation;
  reason: string;
  requiresReference: boolean;
  requiresFirstAndLastFrame: boolean;
}

export function chooseBoundaryOperation(boundary: BoundaryState): BoundaryRoutingDecision {
  if (boundary.strategy === "EXTEND") return { operation: "EXTEND_VIDEO", reason: "Physical scene continuation should preserve the previous generated state.", requiresReference: true, requiresFirstAndLastFrame: false };
  if (boundary.strategy === "FIRST_LAST_FRAME_BRIDGE") return { operation: "INTERPOLATE_BOUNDARY", reason: "Both approved boundary states are known and require a controlled bridge.", requiresReference: true, requiresFirstAndLastFrame: true };
  if (boundary.strategy === "REPAIR_BOUNDARY") return { operation: "REPAIR", reason: "Boundary QA rejected the existing transition; repair the smallest affected unit.", requiresReference: true, requiresFirstAndLastFrame: Boolean(boundary.expected.preserveMotion) };
  if (boundary.strategy === "GENERATE_WITH_REFERENCE") return { operation: "GENERATE_VIDEO", reason: "A fresh shot is required but continuity state must condition generation.", requiresReference: true, requiresFirstAndLastFrame: false };
  return { operation: "EDIT_VIDEO", reason: "The boundary is editorial; preserve continuous audio and use an intentional edit rather than generative morphing.", requiresReference: false, requiresFirstAndLastFrame: false };
}

export function selectProvider(registry: ProviderRegistry, operation: ProductionOperation, requirements: Partial<Pick<ProviderCapability, "supportsReferenceImages" | "supportsFirstFrame" | "supportsLastFrame" | "supportsContinuousIdentity" | "supportsAudioDrivenPerformance" | "supportsLongRunningResume">> = {}): ProviderCapability {
  const candidates = registry.capabilities.filter(capability => {
    if (!capability.enabled || capability.operation !== operation) return false;
    for (const [key, required] of Object.entries(requirements)) {
      if (required === true && capability[key as keyof ProviderCapability] !== true) return false;
    }
    return true;
  }).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  if (!candidates.length) throw new Error(`No enabled provider satisfies ${operation} requirements; fail closed instead of silently falling back to an incompatible renderer`);
  return candidates[0];
}

export function requiresPersistentPerformance(manifest: ReelProductionManifest) {
  return Boolean(manifest.continuity?.performanceTracks.some(track => track.mode === "persistent-performer"));
}
