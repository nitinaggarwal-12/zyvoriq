import crypto from "node:crypto";
import { planReel, type PlanReelInput } from "@/lib/reel/planner";
import type { ReelProductionManifest } from "@/lib/reel/types";

export type Studio2SubjectMode = "PRESENTER" | "NO_PERSON";

export type Studio2Metadata = {
  schemaVersion: 1;
  presenterContinuity: boolean;
  environmentContinuity: boolean;
  generationRound: number;
  basePrompts: Record<string, string>;
  subjectModes: Record<string, Studio2SubjectMode>;
  clipOptions: Record<string, Array<{
    id: string;
    label: string;
    asset: NonNullable<ReelProductionManifest["shots"][number]["asset"]>;
    createdAt: string;
  }>>;
};

function studio2Meta(manifest: ReelProductionManifest): Studio2Metadata {
  const meta = (manifest as any).studio2 as Studio2Metadata;
  if (typeof meta.environmentContinuity !== "boolean") meta.environmentContinuity = true;
  return meta;
}

export function applyStudio2ShotPrompt(manifest: ReelProductionManifest, shotId: string) {
  const meta = studio2Meta(manifest);
  const shotIndex = manifest.shots.findIndex(item => item.id === shotId);
  const shot = manifest.shots[shotIndex];
  if (!shot) return;
  const base = meta.basePrompts[shot.id] || shot.generationPrompt;
  const mode = meta.subjectModes[shot.id] || "PRESENTER";
  const previous = shotIndex > 0 ? manifest.shots[shotIndex - 1] : null;
  shot.dependsOnShotIds = meta.environmentContinuity && previous ? [previous.id] : [];

  const environmentRule = meta.environmentContinuity
    ? "STUDIO2 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or other task-specific objects unless the brief or this shot explicitly requires them."
    : "STUDIO2 ENVIRONMENT MODE: Environment continuity is disabled for this experiment.";

  if (mode === "NO_PERSON") {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
    shot.generationPrompt = [
      base,
      environmentRule,
      "STUDIO2 SUBJECT RULE: This shot is explicit B-roll with NO visible people, faces, presenters, human silhouettes, reflections, portraits, photographs of people, or person-like figures. Preserve the established environment and visual language without introducing a new human identity."
    ].join(" ");
    return;
  }

  if (meta.presenterContinuity) {
    shot.continuityIn.characterId = "character_presenter";
    shot.continuityOut.characterId = "character_presenter";
  } else {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
  }
  shot.generationPrompt = [
    base,
    environmentRule,
    meta.presenterContinuity
      ? "STUDIO2 IDENTITY LOCK: The same canonical presenter must appear in this shot. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different presenter. The canonical reference frame supplied by the production worker is authoritative."
      : "STUDIO2 PRESENTER MODE: A presenter is allowed, but canonical identity anchoring is disabled for this experiment."
  ].join(" ");
}

export function planStudio2(input: PlanReelInput): ReelProductionManifest {
  const manifest = planReel(input);
  manifest.id = `studio2_${crypto.randomUUID()}`;
  manifest.status = "SCRIPT_READY";

  const basePrompts = Object.fromEntries(manifest.shots.map(shot => [shot.id, shot.generationPrompt]));
  const subjectModes = Object.fromEntries(manifest.shots.map(shot => [shot.id, "PRESENTER" as Studio2SubjectMode]));
  const meta: Studio2Metadata = {
    schemaVersion: 1,
    presenterContinuity: true,
    environmentContinuity: true,
    generationRound: 1,
    basePrompts,
    subjectModes,
    clipOptions: {},
  };
  (manifest as any).studio2 = meta;

  // The current production worker's character-anchor module reads a top-level
  // characters array. Studio2 intentionally supplies that compatibility view
  // without changing the /studio manifest contract.
  (manifest as any).characters = structuredClone(manifest.continuity?.characters || []);

  for (const shot of manifest.shots) applyStudio2ShotPrompt(manifest, shot.id);
  if (manifest.continuity?.boundaries) {
    for (const boundary of manifest.continuity.boundaries) {
      boundary.expected.preserveIdentity = true;
      boundary.expected.preserveWardrobe = true;
      boundary.expected.preserveEnvironment = true;
      boundary.expected.preserveObjects = true;
    }
  }
  return manifest;
}

export function isStudio2Manifest(manifest: ReelProductionManifest) {
  return manifest.id.startsWith("studio2_") && Boolean((manifest as any).studio2?.schemaVersion === 1);
}
