import crypto from "node:crypto";
import { reelProductionStore, type StoredReelProduction } from "@/lib/reel/productionStore";
import type { ReelProductionManifest } from "@/lib/reel/types";
import { applyStudio3ShotPrompt, isStudio3Manifest, type Studio3Metadata, type Studio3OmniOption, type Studio3SubjectMode } from "./planner";

function meta(manifest: ReelProductionManifest): Studio3Metadata {
  const value = (manifest as any).studio3 as Studio3Metadata | undefined;
  if (!value) throw new Error("Studio3 metadata missing");
  return value;
}
function assertStudio3(stored: StoredReelProduction | null): StoredReelProduction {
  if (!stored) throw new Error("Studio3 production not found");
  if (!isStudio3Manifest(stored.manifest)) throw new Error("This production does not belong to Studio3");
  return stored;
}
function archiveCurrent(manifest: ReelProductionManifest, shotId: string) {
  const shot = manifest.shots.find(item => item.id === shotId);
  if (!shot?.asset?.videoUrl) return;
  const m = meta(manifest);
  const options = m.clipOptions[shotId] || [];
  if (!options.some(option => option.asset.videoUrl === shot.asset?.videoUrl)) {
    options.push({ id: `option_${crypto.randomUUID()}`, label: `Option ${String.fromCharCode(65 + Math.min(options.length, 25))}`, asset: structuredClone(shot.asset), createdAt: new Date().toISOString() });
    m.clipOptions[shotId] = options;
  }
}
function invalidateCombinedOutputs(manifest: ReelProductionManifest) {
  if (!manifest.outputs) return;
  delete manifest.outputs.narratedRoughCut;
  delete manifest.outputs.master;
}
function recomputeStatus(manifest: ReelProductionManifest) {
  const complete = manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  if (complete) manifest.status = "ROUGH_CUT_READY";
  else if (manifest.audio?.narrationUrl) manifest.status = manifest.shots.some(shot => Boolean(shot.asset?.videoUrl)) ? "VIDEO_GENERATING" : "SHOTS_PLANNED";
  else manifest.status = "SCRIPT_READY";
}

export const studio3Service = {
  async get(id: string) {
    const stored = await reelProductionStore.get(id);
    return stored ? assertStudio3(stored) : null;
  },
  async prepareShotRegeneration(id: string, shotId: string, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(item => item.id === shotId);
    if (!shot) throw new Error(`Shot ${shotId} not found`);
    if (!manifest.audio?.narrationUrl) throw new Error("Generate narration before regenerating a clip");
    archiveCurrent(manifest, shotId);
    delete shot.asset; shot.status = "PLANNED"; shot.qa = { warnings: [], failures: [] };
    invalidateCombinedOutputs(manifest);
    manifest.status = manifest.shots.some(item => Boolean(item.asset?.videoUrl)) ? "VIDEO_GENERATING" : "SHOTS_PLANNED";
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async prepareFreshAll(id: string, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    if (!manifest.audio?.narrationUrl) throw new Error("Generate narration before generating all clips fresh");
    meta(manifest).generationRound += 1;
    for (const shot of manifest.shots) {
      archiveCurrent(manifest, shot.id); delete shot.asset; shot.status = "PLANNED"; shot.qa = { warnings: [], failures: [] };
      if (shot.continuityIn) delete shot.continuityIn.referenceFrameUrl;
      applyStudio3ShotPrompt(manifest, shot.id);
    }
    invalidateCombinedOutputs(manifest); manifest.status = "SHOTS_PLANNED";
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async setPresenterContinuity(id: string, enabled: boolean, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest);
    meta(manifest).presenterContinuity = enabled; for (const shot of manifest.shots) applyStudio3ShotPrompt(manifest, shot.id);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async setEnvironmentContinuity(id: string, enabled: boolean, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest);
    meta(manifest).environmentContinuity = enabled; for (const shot of manifest.shots) applyStudio3ShotPrompt(manifest, shot.id);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async setSubjectMode(id: string, shotId: string, mode: Studio3SubjectMode, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest);
    if (!manifest.shots.some(item => item.id === shotId)) throw new Error(`Shot ${shotId} not found`);
    meta(manifest).subjectModes[shotId] = mode; applyStudio3ShotPrompt(manifest, shotId);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async selectOption(id: string, shotId: string, optionId: string, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(item => item.id === shotId); if (!shot) throw new Error(`Shot ${shotId} not found`);
    archiveCurrent(manifest, shotId);
    const option = (meta(manifest).clipOptions[shotId] || []).find(item => item.id === optionId); if (!option) throw new Error(`Option ${optionId} not found for ${shotId}`);
    shot.asset = structuredClone(option.asset); shot.status = "GENERATED"; invalidateCombinedOutputs(manifest); recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async addOmniOption(id: string, shotId: string, option: Studio3OmniOption, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest);
    if (!manifest.shots.some(item => item.id === shotId)) throw new Error(`Shot ${shotId} not found`);
    const m = meta(manifest); const options = m.omniOptions[shotId] || []; options.push(option); m.omniOptions[shotId] = options; m.selectedOmniOptionIds[shotId] = option.id;
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
  async selectOmniOption(id: string, shotId: string, optionId: string | undefined, expectedRevision?: number) {
    const stored = assertStudio3(await reelProductionStore.get(id)); const manifest = structuredClone(stored.manifest); const m = meta(manifest);
    if (optionId && !(m.omniOptions[shotId] || []).some(option => option.id === optionId)) throw new Error(`Omni option ${optionId} not found`);
    m.selectedOmniOptionIds[shotId] = optionId;
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
};
