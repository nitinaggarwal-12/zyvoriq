import crypto from "node:crypto";
import { planReel, type PlanReelInput } from "@/lib/reel/planner";
import type { ReelProductionManifest } from "@/lib/reel/types";

export type Studio3SubjectMode = "PRESENTER" | "NO_PERSON";
export type Studio3OmniMode = "EDIT" | "REPAIR" | "EXTEND";

export type Studio3OmniOption = {
  id: string;
  mode: Studio3OmniMode;
  prompt: string;
  sourceVideoUrl: string;
  videoUrl: string;
  googleFileId: string;
  interactionId?: string;
  model: string;
  createdAt: string;
  expiresAt: string;
};

export type Studio3Metadata = {
  schemaVersion: 1;
  presenterContinuity: boolean;
  environmentContinuity: boolean;
  generationRound: number;
  basePrompts: Record<string, string>;
  subjectModes: Record<string, Studio3SubjectMode>;
  clipOptions: Record<string, Array<{
    id: string;
    label: string;
    asset: NonNullable<ReelProductionManifest["shots"][number]["asset"]>;
    createdAt: string;
  }>>;
  omniModel: "gemini-omni-1.1-flash";
  omniOptions: Record<string, Studio3OmniOption[]>;
  selectedOmniOptionIds: Record<string, string | undefined>;
};

function meta(manifest: ReelProductionManifest): Studio3Metadata {
  return (manifest as any).studio3 as Studio3Metadata;
}

export function applyStudio3ShotPrompt(manifest: ReelProductionManifest, shotId: string) {
  const m = meta(manifest);
  const shot = manifest.shots.find(item => item.id === shotId);
  if (!shot) return;
  const index = manifest.shots.findIndex(item => item.id === shotId);
  const base = m.basePrompts[shot.id] || shot.generationPrompt;
  const mode = m.subjectModes[shot.id] || "PRESENTER";

  shot.dependsOnShotIds = m.environmentContinuity && index > 0 ? [manifest.shots[index - 1].id] : [];
  if (mode === "NO_PERSON") {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
    shot.generationPrompt = [base,
      "STUDIO3 SUBJECT RULE: strict B-roll. No visible people, faces, presenters, human silhouettes, reflections, portraits or substitute humans.",
      m.environmentContinuity ? "STUDIO3 ENVIRONMENT LOCK: preserve the established location, background geometry, lighting, furniture and major props. Do not invent electronics, tools, machinery or unrelated activities unless required by the brief." : ""
    ].filter(Boolean).join(" ");
    return;
  }

  if (m.presenterContinuity) {
    shot.continuityIn.characterId = "character_presenter";
    shot.continuityOut.characterId = "character_presenter";
  } else {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
  }
  shot.generationPrompt = [base,
    m.presenterContinuity ? "STUDIO3 IDENTITY LOCK: use the same canonical presenter: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Never substitute or morph the presenter." : "",
    m.environmentContinuity ? "STUDIO3 ENVIRONMENT LOCK: preserve the established location, background geometry, lighting, furniture and major props from the previous clip. Change only what the narrative requires; do not invent electronics, tools, machinery or unrelated activities." : ""
  ].filter(Boolean).join(" ");
}

export function planStudio3(input: PlanReelInput): ReelProductionManifest {
  const manifest = planReel(input);
  manifest.id = `studio3_${crypto.randomUUID()}`;
  manifest.status = "SCRIPT_READY";
  const m: Studio3Metadata = {
    schemaVersion: 1,
    presenterContinuity: true,
    environmentContinuity: true,
    generationRound: 1,
    basePrompts: Object.fromEntries(manifest.shots.map(shot => [shot.id, shot.generationPrompt])),
    subjectModes: Object.fromEntries(manifest.shots.map(shot => [shot.id, "PRESENTER" as Studio3SubjectMode])),
    clipOptions: {},
    omniModel: "gemini-omni-1.1-flash",
    omniOptions: {},
    selectedOmniOptionIds: {},
  };
  (manifest as any).studio3 = m;
  (manifest as any).characters = structuredClone(manifest.continuity?.characters || []);
  for (const shot of manifest.shots) applyStudio3ShotPrompt(manifest, shot.id);
  if (manifest.continuity?.boundaries) for (const boundary of manifest.continuity.boundaries) {
    boundary.expected.preserveIdentity = true;
    boundary.expected.preserveWardrobe = true;
  }
  return manifest;
}

export function isStudio3Manifest(manifest: ReelProductionManifest) {
  return manifest.id.startsWith("studio3_") && Boolean((manifest as any).studio3?.schemaVersion === 1);
}
