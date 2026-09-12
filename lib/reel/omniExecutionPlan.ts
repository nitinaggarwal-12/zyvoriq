// lib/reel/omniExecutionPlan.ts
//
// The Omni Execution Plan is the single source of truth for a production: the
// ordered DAG of model calls that Omni 1.1 authorizes, plus a signed token.

import crypto from "node:crypto";
import type { OmniDirectorialCompilation, OmniGenre } from "./omniDirector";

export const OMNI_PLAN_SCHEMA_VERSION = "1.0.0" as const;
export const OMNI_MODEL_ID = "gemini-omni-1.1-flash" as const;

export const OMNI_MODEL_REGISTRY = {
  music: "lyria-3.5",
  anchorImage: "gemini-2.5-flash-image",
  video: "veo-3.1-generate-preview",
  videoFast: "veo-3.1-fast-generate-preview",
  audit: "gemini-omni-1.1-flash",
} as const;

export type OmniModelId = (typeof OMNI_MODEL_REGISTRY)[keyof typeof OMNI_MODEL_REGISTRY];

export type OmniNodeKind =
  | "MUSIC"
  | "ANCHOR"
  | "SHOT"
  | "LIP_MAP"
  | "AUDIT"
  | "ROUGH_CUT"
  | "NARRATION";

export type OmniRemediationDirective =
  | { action: "pass" }
  | { action: "surgical_fix"; op: string; params: Record<string, unknown>; reason: string }
  | { action: "regen_clip"; targetShotId: string; reason: string }
  | { action: "regen_reel"; reason: string };

export interface OmniPlanNode {
  id: string;
  kind: OmniNodeKind;
  model: OmniModelId | null;
  targetId?: string;
  dependsOn: string[];
  params: Record<string, unknown>;
}

export interface OmniExecutionPlan {
  schemaVersion: typeof OMNI_PLAN_SCHEMA_VERSION;
  planToken: string;
  productionId: string;
  genre: OmniGenre;
  requestedDurationSec: number;
  createdAt: string;
  authoredBy: typeof OMNI_MODEL_ID;
  nodes: OmniPlanNode[];
}

export function issueOmniPlanToken(productionId: string, nodes: OmniPlanNode[]): string {
  const material = JSON.stringify({ productionId, nodes: nodes.map(n => ({ id: n.id, kind: n.kind, model: n.model, dependsOn: n.dependsOn })) });
  const digest = crypto.createHash("sha256").update(material).digest("hex").slice(0, 24);
  return `omni_${digest}`;
}

export function buildOmniExecutionPlan(args: {
  productionId: string;
  compilation: OmniDirectorialCompilation;
  requestedDurationSec: number;
  audioStrategy: "native" | "narration";
}): OmniExecutionPlan {
  const { productionId, compilation, requestedDurationSec, audioStrategy } = args;
  const isMusicVideo = compilation.genre === "MUSIC_VIDEO" || audioStrategy === "native";
  const nodes: OmniPlanNode[] = [];
  const shotIds = compilation.shots.map(s => `shot_${String(s.shotNumber).padStart(2, "0")}`);

  if (isMusicVideo) {
    nodes.push({
      id: "music",
      kind: "MUSIC",
      model: OMNI_MODEL_REGISTRY.music,
      dependsOn: [],
      params: { durationSec: requestedDurationSec, extractVocalOnset: true, lufs: -24 },
    });
  } else {
    nodes.push({ id: "narration", kind: "NARRATION", model: null, dependsOn: [], params: { language: "auto" } });
  }

  const audioNodeId = isMusicVideo ? "music" : "narration";

  shotIds.forEach((shotId, i) => {
    nodes.push({
      id: `anchor:${shotId}`,
      kind: "ANCHOR",
      model: OMNI_MODEL_REGISTRY.anchorImage,
      targetId: shotId,
      dependsOn: i === 0 ? [] : [`anchor:${shotIds[i - 1]}`],
      params: { chainFromPreviousPlate: i > 0, character: compilation.shots[i].onCameraCharacterId },
    });
  });

  shotIds.forEach((shotId, i) => {
    const deps = [`anchor:${shotId}`, audioNodeId];
    if (i > 0) deps.push(`shot:${shotIds[i - 1]}`);
    nodes.push({
      id: `shot:${shotId}`,
      kind: "SHOT",
      model: OMNI_MODEL_REGISTRY.video,
      targetId: shotId,
      dependsOn: deps,
      params: { genre: compilation.genre, audioStrategy, mouthLockDuringInstrumental: isMusicVideo },
    });
  });

  if (isMusicVideo) {
    shotIds.forEach((shotId) => {
      nodes.push({ id: `lipmap:${shotId}`, kind: "LIP_MAP", model: null, targetId: shotId, dependsOn: [`shot:${shotId}`, "music"], params: {} });
    });
  }

  shotIds.forEach((shotId) => {
    const dep = isMusicVideo ? `lipmap:${shotId}` : `shot:${shotId}`;
    nodes.push({ id: `audit:${shotId}`, kind: "AUDIT", model: OMNI_MODEL_REGISTRY.audit, targetId: shotId, dependsOn: [dep], params: { scope: "shot" } });
  });

  nodes.push({ id: "rough_cut", kind: "ROUGH_CUT", model: null, dependsOn: shotIds.map(s => `audit:${s}`), params: {} });
  nodes.push({ id: "audit:reel", kind: "AUDIT", model: OMNI_MODEL_REGISTRY.audit, dependsOn: ["rough_cut"], params: { scope: "reel" } });

  const planToken = issueOmniPlanToken(productionId, nodes);
  return {
    schemaVersion: OMNI_PLAN_SCHEMA_VERSION,
    planToken,
    productionId,
    genre: compilation.genre,
    requestedDurationSec,
    createdAt: new Date().toISOString(),
    authoredBy: OMNI_MODEL_ID,
    nodes,
  };
}

export function nextReadyNodes(plan: OmniExecutionPlan, doneNodeIds: Set<string>): OmniPlanNode[] {
  return plan.nodes.filter(n => !doneNodeIds.has(n.id) && n.dependsOn.every(d => doneNodeIds.has(d)));
}
