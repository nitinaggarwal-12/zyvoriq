import crypto from "node:crypto";
import { reelProductionStore, type StoredReelProduction } from "@/lib/reel/productionStore";
import type { ReelProductionManifest } from "@/lib/reel/types";
import { applyStudio1ShotPrompt, isStudio1Manifest, type Studio1Metadata, type Studio1SubjectMode } from "./planner";

const clock = (value: number) => Number(value.toFixed(6));

function chooseGenerationDuration(editorialDurationSec: number): 4 | 6 | 8 {
  if (editorialDurationSec <= 3.5) return 4;
  if (editorialDurationSec <= 5.5) return 6;
  return 8;
}

function meta(manifest: ReelProductionManifest): Studio1Metadata {
  const value = (manifest as any).studio1 as Studio1Metadata | undefined;
  if (!value) throw new Error("Studio1 metadata missing");
  if (typeof value.environmentContinuity !== "boolean") value.environmentContinuity = true;
  if (!value.projectTitle) value.projectTitle = manifest.topic;
  return value;
}

function assertStudio1(stored: StoredReelProduction | null): StoredReelProduction {
  if (!stored) throw new Error("Studio1 production not found");
  if (!isStudio1Manifest(stored.manifest)) throw new Error("This production does not belong to Studio1");
  return stored;
}

function archiveCurrent(manifest: ReelProductionManifest, shotId: string) {
  const shot = manifest.shots.find(item => item.id === shotId);
  if (!shot?.asset?.videoUrl) return;
  const m = meta(manifest);
  const options = m.clipOptions[shotId] || [];
  if (!options.some(option => option.asset.videoUrl === shot.asset?.videoUrl)) {
    options.push({
      id: `option_${crypto.randomUUID()}`,
      label: `Option ${String.fromCharCode(65 + Math.min(options.length, 25))}`,
      asset: structuredClone(shot.asset),
      createdAt: new Date().toISOString(),
    });
    m.clipOptions[shotId] = options;
  }
}

function invalidateCombinedOutputs(manifest: ReelProductionManifest) {
  if (!manifest.outputs) return;
  delete manifest.outputs.narratedRoughCut;
  delete manifest.outputs.master;
}

function draftCaptionCues(manifest: ReelProductionManifest) {
  return manifest.shots.filter(shot => shot.scriptText.trim()).map((shot, index) => ({
    id: `caption_draft_${String(index + 1).padStart(2, "0")}`,
    startSec: shot.editorialStartSec,
    endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
    text: shot.scriptText.trim(),
    wordIds: [],
    lines: [shot.scriptText.trim()],
    position: "lower-third" as const,
  }));
}

function invalidateNarration(manifest: ReelProductionManifest) {
  delete manifest.audio.narrationUrl;
  delete manifest.audio.actualDurationSec;
  delete manifest.audio.wordTimings;
  delete manifest.audio.alignmentValidation;
  delete manifest.audio.speechMap;
  manifest.audio.timingSource = "pending";
  manifest.captions = {
    timingSource: "draft",
    cues: draftCaptionCues(manifest),
    safeZoneProfile: manifest.platform === "YouTube Shorts" ? "youtube-shorts" : manifest.platform === "TikTok" ? "tiktok" : "instagram-reels",
  };
  invalidateCombinedOutputs(manifest);
}

function rebuildStructure(manifest: ReelProductionManifest) {
  let cursor = 0;
  const m = meta(manifest);
  for (let index = 0; index < manifest.shots.length; index++) {
    const shot = manifest.shots[index];
    shot.order = index + 1;
    shot.editorialStartSec = clock(cursor);
    shot.editorialDurationSec = Math.max(0.5, clock(shot.editorialDurationSec));
    shot.trimInSec = Math.max(0, Math.min(shot.trimInSec || 0, shot.editorialDurationSec - 0.1));
    shot.trimOutSec = Math.max(shot.trimInSec + 0.1, Math.min(shot.trimOutSec || shot.editorialDurationSec, shot.editorialDurationSec));
    shot.generationDurationSec = chooseGenerationDuration(shot.editorialDurationSec);
    if (index === manifest.shots.length - 1) shot.transitionOut = { type: "hard-cut", durationSec: 0 };
    cursor = clock(cursor + shot.editorialDurationSec);
  }
  manifest.plannedDurationSec = cursor;

  for (const shot of manifest.shots) applyStudio1ShotPrompt(manifest, shot.id);

  if (manifest.continuity) {
    manifest.continuity.boundaries = manifest.shots.slice(0, -1).map((shot, index) => {
      const next = manifest.shots[index + 1];
      const samePresenter = Boolean(shot.continuityOut.characterId && shot.continuityOut.characterId === next.continuityIn.characterId);
      return {
        id: `boundary_${shot.id}_${next.id}`,
        fromShotId: shot.id,
        toShotId: next.id,
        strategy: shot.transitionOut.type === "cut-on-action" ? "CUT_ON_ACTION" : shot.transitionOut.type === "match-cut" ? "MATCH_CUT" : shot.transitionOut.type === "jump-cut" ? "JUMP_CUT" : shot.transitionOut.type === "graphic" ? "GRAPHIC_TRANSITION" : "HARD_CUT",
        fromTimeSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
        toTimeSec: next.editorialStartSec,
        expected: {
          preserveIdentity: samePresenter,
          preserveWardrobe: samePresenter,
          preserveEnvironment: true,
          preserveObjects: true,
          preserveEmotion: samePresenter,
          preserveMotion: shot.transitionOut.type === "cut-on-action" || shot.transitionOut.type === "match-cut",
          continuousAudio: true,
        },
      };
    });
    manifest.continuity.objectStateGraph = Object.fromEntries(manifest.shots.map(shot => [shot.id, shot.continuityIn.objectStates || []]));
    const presenterTrack = manifest.continuity.performanceTracks.find(track => track.characterId === "character_presenter");
    if (presenterTrack) {
      presenterTrack.cues = manifest.shots.filter(shot => shot.continuityIn.characterId === "character_presenter").map(shot => ({
        startSec: shot.editorialStartSec,
        endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
        emotion: shot.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
        gaze: "camera" as const,
        gesture: shot.continuityOut.action,
        speakingEnergy: shot.continuityIn.emotion?.intensity || 0.5,
      }));
    }
  }

  for (const key of Object.keys(m.subjectModes)) if (!manifest.shots.some(shot => shot.id === key)) delete m.subjectModes[key];
  for (const key of Object.keys(m.basePrompts)) if (!manifest.shots.some(shot => shot.id === key)) delete m.basePrompts[key];
  for (const key of Object.keys(m.clipOptions)) if (!manifest.shots.some(shot => shot.id === key)) delete m.clipOptions[key];

  if (manifest.captions?.timingSource === "draft") manifest.captions.cues = draftCaptionCues(manifest);
  if (manifest.musicPlan?.sections?.length) manifest.musicPlan.sections[manifest.musicPlan.sections.length - 1].endSec = cursor;
}

function recomputeStatus(manifest: ReelProductionManifest) {
  const complete = manifest.shots.every(shot => Boolean(shot.asset?.videoUrl) && ["GENERATED", "PASSED"].includes(shot.status));
  if (complete) manifest.status = "ROUGH_CUT_READY";
  else if (manifest.audio?.narrationUrl) manifest.status = manifest.shots.some(shot => Boolean(shot.asset?.videoUrl)) ? "VIDEO_GENERATING" : "SHOTS_PLANNED";
  else manifest.status = "SCRIPT_READY";
}

function resetShotForRegeneration(manifest: ReelProductionManifest, shotId: string) {
  const shot = manifest.shots.find(item => item.id === shotId);
  if (!shot) throw new Error(`Shot ${shotId} not found`);
  archiveCurrent(manifest, shotId);
  delete shot.asset;
  shot.status = "PLANNED";
  shot.qa = { warnings: [], failures: [] };
  if (shot.continuityIn) delete shot.continuityIn.referenceFrameUrl;
}

export const studio1Service = {
  async get(id: string) {
    const stored = await reelProductionStore.get(id);
    return stored ? assertStudio1(stored) : null;
  },

  async list(limit = 50) {
    const all = await reelProductionStore.list(100);
    return all.filter(item => isStudio1Manifest(item.manifest)).slice(0, Math.max(1, Math.min(100, limit)));
  },

  async renameProject(id: string, projectTitle: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const title = projectTitle.trim();
    if (!title) throw new Error("Project title is required");
    const manifest = structuredClone(stored.manifest);
    meta(manifest).projectTitle = title.slice(0, 160);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async duplicateProject(id: string) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const now = new Date().toISOString();
    manifest.id = `studio1_${crypto.randomUUID()}`;
    manifest.createdAt = now;
    const m = meta(manifest);
    m.projectTitle = `${m.projectTitle || manifest.topic} copy`.slice(0, 160);
    return reelProductionStore.create(manifest);
  },

  async deleteProject(id: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    await reelProductionStore.delete(id, expectedRevision ?? stored.revision);
  },

  async editShot(id: string, shotId: string, visualIntent: string, scriptText: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(item => item.id === shotId);
    if (!shot) throw new Error(`Shot ${shotId} not found`);
    const nextVisual = visualIntent.trim();
    const nextScript = scriptText.trim();
    if (!nextVisual) throw new Error("Scene visual direction is required");
    const scriptChanged = nextScript !== shot.scriptText.trim();
    const visualChanged = nextVisual !== shot.visualIntent.trim();
    if (!scriptChanged && !visualChanged) return stored;

    resetShotForRegeneration(manifest, shotId);
    shot.visualIntent = nextVisual;
    shot.scriptText = nextScript;
    meta(manifest).basePrompts[shot.id] = [nextVisual, nextScript ? `Narrative beat: ${nextScript}` : "Silent visual continuation.", `Tone: ${manifest.tone}.`, manifest.creativeBible.visualStyle, manifest.creativeBible.cameraLanguage, "Do not render captions, subtitles, logos or UI text inside the generated video."].join(" ");
    if (scriptChanged) {
      manifest.masterScript = manifest.shots.map(item => item.scriptText.trim()).filter(Boolean).join(" ");
      invalidateNarration(manifest);
    } else invalidateCombinedOutputs(manifest);
    rebuildStructure(manifest);
    recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async addShotAfter(id: string, shotId: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const index = manifest.shots.findIndex(item => item.id === shotId);
    if (index < 0) throw new Error(`Shot ${shotId} not found`);
    const source = manifest.shots[index];
    resetShotForRegeneration(manifest, source.id);

    const originalDuration = Math.max(1, source.editorialDurationSec);
    const firstDuration = clock(originalDuration / 2);
    const secondDuration = clock(originalDuration - firstDuration);
    const words = source.scriptText.trim().split(/\s+/).filter(Boolean);
    const splitAt = Math.ceil(words.length / 2);
    const firstScript = words.slice(0, splitAt).join(" ");
    const secondScript = words.slice(splitAt).join(" ");
    source.editorialDurationSec = firstDuration;
    source.trimInSec = 0;
    source.trimOutSec = firstDuration;
    source.scriptText = firstScript;

    const newId = `shot_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const added = structuredClone(source);
    added.id = newId;
    added.editorialDurationSec = secondDuration;
    added.trimInSec = 0;
    added.trimOutSec = secondDuration;
    added.scriptText = secondScript;
    added.visualIntent = `${source.visualIntent.replace(/\s*\(continuation\)$/i, "")} (continuation)`;
    added.status = "PLANNED";
    delete added.asset;
    added.qa = { warnings: [], failures: [] };
    delete added.continuityIn.referenceFrameUrl;

    const m = meta(manifest);
    m.basePrompts[source.id] = [source.visualIntent, firstScript ? `Narrative beat: ${firstScript}` : "Silent visual continuation."].join(" ");
    m.basePrompts[newId] = [added.visualIntent, secondScript ? `Narrative beat: ${secondScript}` : "Silent visual continuation."].join(" ");
    m.subjectModes[newId] = m.subjectModes[source.id] || "PRESENTER";
    m.clipOptions[newId] = [];
    manifest.shots.splice(index + 1, 0, added);

    invalidateCombinedOutputs(manifest);
    rebuildStructure(manifest);
    recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async deleteShot(id: string, shotId: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    if (manifest.shots.length <= 2) throw new Error("Studio1 requires at least two scenes");
    const index = manifest.shots.findIndex(item => item.id === shotId);
    if (index < 0) throw new Error(`Shot ${shotId} not found`);
    const removed = manifest.shots[index];
    const targetIndex = index > 0 ? index - 1 : 1;
    const target = manifest.shots[targetIndex];
    resetShotForRegeneration(manifest, target.id);
    target.editorialDurationSec = clock(target.editorialDurationSec + removed.editorialDurationSec);
    target.trimInSec = 0;
    target.trimOutSec = target.editorialDurationSec;
    target.scriptText = index > 0 ? [target.scriptText, removed.scriptText].filter(Boolean).join(" ") : [removed.scriptText, target.scriptText].filter(Boolean).join(" ");
    meta(manifest).basePrompts[target.id] = [target.visualIntent, target.scriptText ? `Narrative beat: ${target.scriptText}` : "Silent visual continuation."].join(" ");
    manifest.shots.splice(index, 1);

    invalidateCombinedOutputs(manifest);
    rebuildStructure(manifest);
    recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async moveShot(id: string, shotId: string, direction: -1 | 1, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const index = manifest.shots.findIndex(item => item.id === shotId);
    if (index < 0) throw new Error(`Shot ${shotId} not found`);
    const destination = index + direction;
    if (destination < 0 || destination >= manifest.shots.length) return stored;
    const [shot] = manifest.shots.splice(index, 1);
    manifest.shots.splice(destination, 0, shot);
    manifest.masterScript = manifest.shots.map(item => item.scriptText.trim()).filter(Boolean).join(" ");
    invalidateNarration(manifest);
    rebuildStructure(manifest);
    recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async prepareShotRegeneration(id: string, shotId: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(item => item.id === shotId);
    if (!shot) throw new Error(`Shot ${shotId} not found`);
    if (!manifest.audio?.narrationUrl) throw new Error("Generate narration before regenerating a clip");
    resetShotForRegeneration(manifest, shotId);
    applyStudio1ShotPrompt(manifest, shotId);
    invalidateCombinedOutputs(manifest);
    manifest.status = manifest.shots.some(item => Boolean(item.asset?.videoUrl)) ? "VIDEO_GENERATING" : "SHOTS_PLANNED";
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async prepareFreshAll(id: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    if (!manifest.audio?.narrationUrl) throw new Error("Generate narration before generating all clips fresh");
    const m = meta(manifest);
    m.generationRound += 1;
    for (const shot of manifest.shots) {
      resetShotForRegeneration(manifest, shot.id);
      applyStudio1ShotPrompt(manifest, shot.id);
    }
    invalidateCombinedOutputs(manifest);
    manifest.status = "SHOTS_PLANNED";
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async setPresenterContinuity(id: string, enabled: boolean, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    meta(manifest).presenterContinuity = enabled;
    for (const shot of manifest.shots) applyStudio1ShotPrompt(manifest, shot.id);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async setEnvironmentContinuity(id: string, enabled: boolean, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    meta(manifest).environmentContinuity = enabled;
    for (const shot of manifest.shots) applyStudio1ShotPrompt(manifest, shot.id);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async setSubjectMode(id: string, shotId: string, mode: Studio1SubjectMode, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    if (!manifest.shots.some(item => item.id === shotId)) throw new Error(`Shot ${shotId} not found`);
    meta(manifest).subjectModes[shotId] = mode;
    applyStudio1ShotPrompt(manifest, shotId);
    invalidateCombinedOutputs(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },

  async selectOption(id: string, shotId: string, optionId: string, expectedRevision?: number) {
    const stored = assertStudio1(await reelProductionStore.get(id));
    const manifest = structuredClone(stored.manifest);
    const shot = manifest.shots.find(item => item.id === shotId);
    if (!shot) throw new Error(`Shot ${shotId} not found`);
    archiveCurrent(manifest, shotId);
    const option = (meta(manifest).clipOptions[shotId] || []).find(item => item.id === optionId);
    if (!option) throw new Error(`Option ${optionId} not found for ${shotId}`);
    shot.asset = structuredClone(option.asset);
    shot.status = "GENERATED";
    invalidateCombinedOutputs(manifest);
    recomputeStatus(manifest);
    return reelProductionStore.replace(id, manifest, expectedRevision ?? stored.revision);
  },
};