import crypto from "node:crypto";
import { planReel, type PlanReelInput } from "@/lib/reel/planner";
import type { ReelProductionManifest } from "@/lib/reel/types";

export type Studio1SubjectMode = "PRESENTER" | "NO_PERSON";

export type Studio1Metadata = {
  schemaVersion: 1;
  projectTitle?: string;
  presenterContinuity: boolean;
  environmentContinuity: boolean;
  generationRound: number;
  basePrompts: Record<string, string>;
  subjectModes: Record<string, Studio1SubjectMode>;
  clipOptions: Record<string, Array<{
    id: string;
    label: string;
    asset: NonNullable<ReelProductionManifest["shots"][number]["asset"]>;
    createdAt: string;
  }>>;
};

function studio1Meta(manifest: ReelProductionManifest): Studio1Metadata {
  const meta = (manifest as any).studio1 as Studio1Metadata;
  if (typeof meta.environmentContinuity !== "boolean") meta.environmentContinuity = true;
  if (!meta.projectTitle) meta.projectTitle = manifest.topic;
  return meta;
}

export function applyStudio1ShotPrompt(manifest: ReelProductionManifest, shotId: string) {
  const meta = studio1Meta(manifest);
  const shotIndex = manifest.shots.findIndex(item => item.id === shotId);
  const shot = manifest.shots[shotIndex];
  if (!shot) return;
  const base = meta.basePrompts[shot.id] || shot.generationPrompt;
  const mode = meta.subjectModes[shot.id] || "PRESENTER";
  const previous = shotIndex > 0 ? manifest.shots[shotIndex - 1] : null;
  shot.dependsOnShotIds = meta.environmentContinuity && previous ? [previous.id] : [];

  const environmentRule = meta.environmentContinuity
    ? "STUDIO1 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. The previous-scene visual reference supplied by the worker is authoritative for the set. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change."
    : "STUDIO1 ENVIRONMENT MODE: Environment continuity is disabled for this experiment.";

  const semanticOnsetRule = [
    "STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective.",
    "Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration.",
    "Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip.",
    shot.scriptText ? `The current spoken beat is: ${shot.scriptText}` : "",
  ].filter(Boolean).join(" ");

  if (mode === "NO_PERSON") {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
    shot.generationPrompt = [
      base,
      environmentRule,
      semanticOnsetRule,
      "STUDIO1 SUBJECT RULE: This shot is explicit B-roll with NO visible people, faces, presenters, human silhouettes, reflections, portraits, photographs of people, or person-like figures. Preserve the established environment and visual language without introducing a new human identity."
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
    semanticOnsetRule,
    meta.presenterContinuity
      ? "STUDIO1 IDENTITY LOCK: The same canonical presenter must appear in this shot. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different presenter. The canonical reference frame supplied by the production worker is authoritative for identity, while the previous-scene reference is authoritative for the environment."
      : "STUDIO1 PRESENTER MODE: A presenter is allowed, but canonical identity anchoring is disabled for this experiment."
  ].join(" ");
}

export function planStudio1(input: PlanReelInput): ReelProductionManifest {
  const manifest = planReel(input);
  manifest.id = `studio1_${crypto.randomUUID()}`;
  manifest.status = "SCRIPT_READY";

  const basePrompts = Object.fromEntries(manifest.shots.map(shot => [shot.id, shot.generationPrompt]));
  const subjectModes = Object.fromEntries(manifest.shots.map(shot => [shot.id, "PRESENTER" as Studio1SubjectMode]));
  const meta: Studio1Metadata = {
    schemaVersion: 1,
    projectTitle: input.topic,
    presenterContinuity: true,
    environmentContinuity: true,
    generationRound: 1,
    basePrompts,
    subjectModes,
    clipOptions: {},
  };
  (manifest as any).studio1 = meta;

  // Isolated compatibility view used by the existing shared production worker.
  (manifest as any).characters = structuredClone(manifest.continuity?.characters || []);

  for (const shot of manifest.shots) applyStudio1ShotPrompt(manifest, shot.id);
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

export function isStudio1Manifest(manifest: ReelProductionManifest) {
  return manifest.id.startsWith("studio1_") && Boolean((manifest as any).studio1?.schemaVersion === 1);
}
