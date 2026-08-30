import type { ReelProductionManifest } from "./types";

export type MediaObjectKind =
  | "production"
  | "track"
  | "clip"
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
    const videoObjectId = idFor(productionId, revision, "video", shot.id);
    const childIds: string[] = [];
    if (shot.asset?.videoUrl) {
      childIds.push(videoObjectId);
      add({
        id: videoObjectId,
        kind: "video",
        label: `Shot ${index + 1} video`,
        assetUrl: shot.asset.videoUrl,
        parentId: clipObjectId,
        childIds: [],
        metadata: { provider: shot.asset.provider, model: shot.asset.model, durationSec: shot.asset.actualDurationSec },
      });
    }
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
        scriptText: shot.scriptText,
        visualIntent: shot.visualIntent,
      },
    });
    sequenceChildren.push(clipObjectId);
    return {
      id: shot.id,
      objectId: clipObjectId,
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

  if (manifest.audio?.narrationUrl) {
    const objectId = idFor(productionId, revision, "audio", "speech-master");
    add({ id: objectId, kind: "audio", label: "Master narration", assetUrl: manifest.audio.narrationUrl, parentId: rootId, childIds: [], metadata: { role: "speech", voice: manifest.audio.voice, language: "source", model: manifest.audio.model, durationSec: manifest.audio.actualDurationSec } });
    rootChildren.push(objectId);
    tracks.speech.push({ id: "speech-master", label: `${manifest.audio.voice || "Narration"} · source language`, kind: "speech", language: "source", voice: manifest.audio.voice, url: manifest.audio.narrationUrl, available: true, objectId });
  }

  if (manifest.audio?.musicUrl) {
    const objectId = idFor(productionId, revision, "audio", "music-master");
    add({ id: objectId, kind: "audio", label: "Music stem", assetUrl: manifest.audio.musicUrl, parentId: rootId, childIds: [], metadata: { role: "music", durationSec: manifest.musicPlan?.durationSec } });
    rootChildren.push(objectId);
    tracks.music.push({ id: "music-master", label: "Production music", kind: "music", style: "production", url: manifest.audio.musicUrl, available: true, objectId });
  }

  if (manifest.captions?.cues?.length) {
    const objectId = idFor(productionId, revision, "caption", "source");
    add({ id: objectId, kind: "caption", label: "Source captions", parentId: rootId, childIds: [], metadata: { language: "source", cues: manifest.captions.cues } });
    rootChildren.push(objectId);
    tracks.captions.push({ id: "captions-source", label: "Source captions", kind: "captions", language: "source", available: true, objectId });
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

  add({ id: rootId, kind: "production", label: manifest.topic || productionId, childIds: rootChildren, metadata: { productionId, revision, status: manifest.status, durationSec: manifest.plannedDurationSec, platform: manifest.platform } });

  return { version: 1, productionId, revision, rootObjectId: rootId, sequenceObjectId: sequenceId, objects, clips, tracks };
}
