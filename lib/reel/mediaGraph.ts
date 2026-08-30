import type { ReelProductionManifest } from "./types";

export type MediaObjectKind =
  | "production"
  | "track"
  | "clip"
  | "option"
  | "video"
  | "audio"
  | "caption"
  | "text"
  | "image"
  | "character"
  | "environment"
  | "evidence";

export interface MediaObject {
  id: string;
  kind: MediaObjectKind;
  label: string;
  canonicalUrl: string;
  assetUrl?: string;
  parentId?: string;
  childIds: string[];
  metadata: Record<string, unknown>;
}

export interface MediaTrackSelection {
  id: string;
  label: string;
  kind: "speech" | "music" | "sfx" | "ambience" | "captions";
  language?: string;
  voice?: string;
  style?: string;
  url?: string;
  available: boolean;
  objectId: string;
}

export interface MediaGraph {
  version: 1;
  productionId: string;
  revision: number;
  rootObjectId: string;
  sequenceObjectId: string;
  objects: MediaObject[];
  clips: Array<{
    id: string;
    objectId: string;
    optionObjectId?: string;
    shotId: string;
    order: number;
    label: string;
    videoUrl?: string;
    startSec: number;
    durationSec: number;
    trimInSec: number;
    trimOutSec: number;
    enabledByDefault: boolean;
  }>;
  tracks: {
    speech: MediaTrackSelection[];
    music: MediaTrackSelection[];
    sfx: MediaTrackSelection[];
    ambience: MediaTrackSelection[];
    captions: MediaTrackSelection[];
  };
}

function idFor(productionId: string, revision: number, type: string, localId: string) {
  return `zyvoriq:${productionId}:r${revision}:${type}:${localId}`;
}

function objectUrl(productionId: string, objectId: string) {
  return `/studio/player/${encodeURIComponent(productionId)}?object=${encodeURIComponent(objectId)}`;
}

export function buildMediaGraph(input: { id: string; revision: number; manifest: ReelProductionManifest }): MediaGraph {
  const { id: productionId, revision, manifest } = input;
  const objects: MediaObject[] = [];
  const add = (o: Omit<MediaObject, "canonicalUrl">) => {
    const object = { ...o, canonicalUrl: objectUrl(productionId, o.id) };
    objects.push(object);
    return object.id;
  };

  const rootId = idFor(productionId, revision, "production", "root");
  const sequenceId = idFor(productionId, revision, "track", "visual-sequence");
  const rootChildren: string[] = [sequenceId];
  const sequenceChildren: string[] = [];

  const clips = manifest.shots.map((shot, index) => {
    const clipObjectId = idFor(productionId, revision, "clip", shot.id);
    const childIds: string[] = [];
    let primaryOptionObjectId: string | undefined;
    const possibleAssets = [
      ...(shot.asset?.videoUrl ? [{ id: "primary", ...shot.asset }] : []),
      ...((((shot as unknown as { assetVariants?: Array<Record<string, unknown>> }).assetVariants) || []) as Array<Record<string, unknown>>),
    ];

    possibleAssets.forEach((asset: any, variantIndex) => {
      if (!asset?.videoUrl) return;
      const local = variantIndex === 0 ? "primary" : String(asset.id || `option-${variantIndex + 1}`);
      const optionObjectId = idFor(productionId, revision, "option", `${shot.id}:${local}`);
      const videoObjectId = idFor(productionId, revision, "video", `${shot.id}:${local}`);
      add({
        id: videoObjectId,
        kind: "video",
        label: `Clip ${index + 1} · ${local} video`,
        assetUrl: String(asset.videoUrl),
        parentId: optionObjectId,
        childIds: [],
        metadata: { provider: asset.provider, model: asset.model, durationSec: asset.actualDurationSec, operationName: asset.operationName },
      });
      add({
        id: optionObjectId,
        kind: "option",
        label: `Clip ${index + 1} · option ${variantIndex + 1}`,
        parentId: clipObjectId,
        childIds: [videoObjectId],
        metadata: { selected: variantIndex === 0, variantIndex, shotId: shot.id },
      });
      childIds.push(optionObjectId);
      if (variantIndex === 0) primaryOptionObjectId = optionObjectId;
    });

    if (shot.continuityIn?.referenceFrameUrl) {
      const referenceId = idFor(productionId, revision, "image", `${shot.id}:continuity-in`);
      add({ id: referenceId, kind: "image", label: `Clip ${index + 1} continuity frame`, assetUrl: shot.continuityIn.referenceFrameUrl, parentId: clipObjectId, childIds: [], metadata: { role: "continuity-reference", shotId: shot.id } });
      childIds.push(referenceId);
    }

    const shotTextId = idFor(productionId, revision, "text", `${shot.id}:script`);
    add({ id: shotTextId, kind: "text", label: `Clip ${index + 1} script`, parentId: clipObjectId, childIds: [], metadata: { text: shot.scriptText } });
    childIds.push(shotTextId);

    add({
      id: clipObjectId,
      kind: "clip",
      label: `Clip ${index + 1}`,
      parentId: sequenceId,
      childIds,
      metadata: {
        shotId: shot.id,
        order: shot.order,
        editorialStartSec: shot.editorialStartSec,
        editorialDurationSec: shot.editorialDurationSec,
        trimInSec: shot.trimInSec,
        trimOutSec: shot.trimOutSec,
        visualIntent: shot.visualIntent,
        continuityIn: shot.continuityIn,
        continuityOut: shot.continuityOut,
      },
    });
    sequenceChildren.push(clipObjectId);
    return {
      id: shot.id,
      objectId: clipObjectId,
      optionObjectId: primaryOptionObjectId,
      shotId: shot.id,
      order: shot.order,
      label: `Clip ${index + 1}`,
      videoUrl: shot.asset?.videoUrl,
      startSec: shot.editorialStartSec,
      durationSec: shot.editorialDurationSec,
      trimInSec: shot.trimInSec,
      trimOutSec: shot.trimOutSec,
      enabledByDefault: Boolean(shot.asset?.videoUrl),
    };
  });

  add({ id: sequenceId, kind: "track", label: "Visual clip sequence", parentId: rootId, childIds: sequenceChildren, metadata: { clipCount: clips.length } });

  const tracks: MediaGraph["tracks"] = { speech: [], music: [], sfx: [], ambience: [], captions: [] };

  const addTrack = (selection: MediaTrackSelection, metadata: Record<string, unknown>) => {
    add({ id: selection.objectId, kind: selection.kind === "captions" ? "caption" : "audio", label: selection.label, assetUrl: selection.url, parentId: rootId, childIds: [], metadata });
    rootChildren.push(selection.objectId);
  };

  if (manifest.audio?.narrationUrl) {
    const objectId = idFor(productionId, revision, "audio", "speech-master");
    const selection = { id: "speech-master", label: `${manifest.audio.voice || "Narration"} · source language`, kind: "speech" as const, language: "source", voice: manifest.audio.voice, url: manifest.audio.narrationUrl, available: true, objectId };
    tracks.speech.push(selection);
    addTrack(selection, { role: "speech", voice: manifest.audio.voice, language: "source", model: manifest.audio.model, durationSec: manifest.audio.actualDurationSec });
  }

  const narrationVariants = (((manifest.audio as any)?.narrationVariants || []) as any[]).filter(v => v?.url);
  narrationVariants.forEach((v, index) => {
    const objectId = idFor(productionId, revision, "audio", `speech-variant-${v.id || index + 1}`);
    const selection = { id: `speech-variant-${v.id || index + 1}`, label: v.label || `${v.voice || "Voice"} · ${v.language || "alternate"}`, kind: "speech" as const, language: v.language, voice: v.voice, url: v.url, available: true, objectId };
    tracks.speech.push(selection);
    addTrack(selection, { role: "speech", variant: true, language: v.language, voice: v.voice, model: v.model, durationSec: v.actualDurationSec });
  });

  if (manifest.audio?.musicUrl) {
    const objectId = idFor(productionId, revision, "audio", "music-master");
    const selection = { id: "music-master", label: "Production music", kind: "music" as const, style: "production", url: manifest.audio.musicUrl, available: true, objectId };
    tracks.music.push(selection);
    addTrack(selection, { role: "music", durationSec: manifest.musicPlan?.durationSec });
  }

  const musicVariants = (((manifest.audio as any)?.musicVariants || []) as any[]).filter(v => v?.url);
  musicVariants.forEach((v, index) => {
    const objectId = idFor(productionId, revision, "audio", `music-variant-${v.id || index + 1}`);
    const selection = { id: `music-variant-${v.id || index + 1}`, label: v.label || v.style || `Music option ${index + 2}`, kind: "music" as const, style: v.style, url: v.url, available: true, objectId };
    tracks.music.push(selection);
    addTrack(selection, { role: "music", variant: true, style: v.style, model: v.model, durationSec: v.durationSec });
  });

  const sfxVariants = (((manifest.audio as any)?.sfxVariants || []) as any[]).filter(v => v?.url);
  sfxVariants.forEach((v, index) => {
    const objectId = idFor(productionId, revision, "audio", `sfx-${v.id || index + 1}`);
    const selection = { id: `sfx-${v.id || index + 1}`, label: v.label || `SFX ${index + 1}`, kind: "sfx" as const, style: v.style, url: v.url, available: true, objectId };
    tracks.sfx.push(selection);
    addTrack(selection, { role: "sfx", style: v.style, durationSec: v.durationSec });
  });

  const ambienceVariants = (((manifest.audio as any)?.ambienceVariants || []) as any[]).filter(v => v?.url);
  ambienceVariants.forEach((v, index) => {
    const objectId = idFor(productionId, revision, "audio", `ambience-${v.id || index + 1}`);
    const selection = { id: `ambience-${v.id || index + 1}`, label: v.label || v.style || `Ambience ${index + 1}`, kind: "ambience" as const, style: v.style, url: v.url, available: true, objectId };
    tracks.ambience.push(selection);
    addTrack(selection, { role: "ambience", style: v.style, durationSec: v.durationSec });
  });

  if (manifest.captions?.cues?.length) {
    const objectId = idFor(productionId, revision, "caption", "source");
    const selection = { id: "captions-source", label: "Source captions", kind: "captions" as const, language: "source", available: true, objectId };
    tracks.captions.push(selection);
    addTrack(selection, { language: "source", cues: manifest.captions.cues });
  }

  const captionVariants = ((((manifest.captions as any)?.variants || []) as any[]).filter(v => Array.isArray(v?.cues)));
  captionVariants.forEach((v, index) => {
    const objectId = idFor(productionId, revision, "caption", `variant-${v.id || index + 1}`);
    const selection = { id: `captions-${v.id || index + 1}`, label: v.label || `${v.language || "Alternate"} captions`, kind: "captions" as const, language: v.language, available: true, objectId };
    tracks.captions.push(selection);
    addTrack(selection, { language: v.language, cues: v.cues, variant: true });
  });

  const scriptId = idFor(productionId, revision, "text", "master-script");
  add({ id: scriptId, kind: "text", label: "Master script", parentId: rootId, childIds: [], metadata: { text: manifest.masterScript } });
  rootChildren.push(scriptId);

  if (manifest.audio?.wordTimings?.length) {
    const wordsId = idFor(productionId, revision, "evidence", "word-alignment");
    add({ id: wordsId, kind: "evidence", label: "Word alignment", parentId: rootId, childIds: [], metadata: { wordTimings: manifest.audio.wordTimings, validation: manifest.audio.alignmentValidation } });
    rootChildren.push(wordsId);
  }

  if (manifest.continuity) {
    const continuityId = idFor(productionId, revision, "evidence", "continuity");
    add({ id: continuityId, kind: "evidence", label: "Continuity package", parentId: rootId, childIds: [], metadata: manifest.continuity as unknown as Record<string, unknown> });
    rootChildren.push(continuityId);
  }

  for (const character of manifest.continuity?.characters || []) {
    const objectId = idFor(productionId, revision, "character", character.id);
    add({ id: objectId, kind: "character", label: character.id, parentId: rootId, childIds: [], metadata: character as unknown as Record<string, unknown> });
    rootChildren.push(objectId);
  }
  for (const env of manifest.continuity?.environments || []) {
    const objectId = idFor(productionId, revision, "environment", env.id);
    add({ id: objectId, kind: "environment", label: env.id, parentId: rootId, childIds: [], metadata: env as unknown as Record<string, unknown> });
    rootChildren.push(objectId);
  }

  if (manifest.outputs?.narratedRoughCut?.videoUrl) {
    const roughId = idFor(productionId, revision, "video", "rough-cut");
    add({ id: roughId, kind: "video", label: "Narrated rough cut", assetUrl: manifest.outputs.narratedRoughCut.videoUrl, parentId: rootId, childIds: [], metadata: manifest.outputs.narratedRoughCut as unknown as Record<string, unknown> });
    rootChildren.push(roughId);
  }
  if (manifest.outputs?.master?.videoUrl) {
    const masterId = idFor(productionId, revision, "video", "master");
    add({ id: masterId, kind: "video", label: "Master render", assetUrl: manifest.outputs.master.videoUrl, parentId: rootId, childIds: [], metadata: manifest.outputs.master as unknown as Record<string, unknown> });
    rootChildren.push(masterId);
  }

  const qaId = idFor(productionId, revision, "evidence", "qa");
  add({ id: qaId, kind: "evidence", label: "QA evidence", parentId: rootId, childIds: [], metadata: manifest.qa as unknown as Record<string, unknown> });
  rootChildren.push(qaId);

  const manifestId = idFor(productionId, revision, "evidence", "manifest");
  add({ id: manifestId, kind: "evidence", label: "Production manifest", parentId: rootId, childIds: [], metadata: manifest as unknown as Record<string, unknown> });
  rootChildren.push(manifestId);

  add({ id: rootId, kind: "production", label: manifest.topic || productionId, childIds: rootChildren, metadata: { productionId, revision, status: manifest.status, durationSec: manifest.plannedDurationSec, platform: manifest.platform } });

  return { version: 1, productionId, revision, rootObjectId: rootId, sequenceObjectId: sequenceId, objects, clips, tracks };
}
