import crypto from "node:crypto";
import type { ReelProductionManifest } from "../reel/types";

export type ArtifactKind = "project" | "document" | "diagram" | "reel" | "clip" | "audio" | "image" | "evidence";

export interface ArtifactReference {
  id: string;
  kind: ArtifactKind;
  role: string;
  title: string;
  canonicalPath: string;
  parentProjectId?: string;
  sourceKey?: string;
  mediaUrl?: string;
}

const prefixes: Record<Exclude<ArtifactKind, "project">, string> = {
  document: "doc",
  diagram: "dgm",
  reel: "reel",
  clip: "clip",
  audio: "aud",
  image: "img",
  evidence: "evd",
};

const kindsByPrefix = Object.fromEntries(Object.entries(prefixes).map(([kind, prefix]) => [prefix, kind])) as Record<string, Exclude<ArtifactKind, "project">>;

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function canonicalArtifactPath(id: string) {
  return `/artifact/${encodeURIComponent(id)}`;
}

/**
 * New standalone artifacts (for example a future diagram/document object)
 * use a type-prefixed UUID. Persist this ID with the object; never derive it
 * from a title or filename.
 */
export function newArtifactId(kind: ArtifactKind) {
  if (kind === "project") return `project_${crypto.randomUUID()}`;
  return `${prefixes[kind]}.${crypto.randomUUID()}`;
}

/**
 * Child artifacts inside an existing durable project use a self-describing,
 * deterministic ID. This makes old projects backfillable without a migration
 * table and makes the ID globally unique even when local keys repeat (shot_01,
 * captions, master-script, etc.).
 */
export function scopedArtifactId(kind: Exclude<ArtifactKind, "project">, projectId: string, sourceKey: string) {
  return `${prefixes[kind]}.${encode(projectId)}.${encode(sourceKey)}`;
}

export function parseScopedArtifactId(id: string): { kind: Exclude<ArtifactKind, "project">; projectId: string; sourceKey: string } | null {
  const parts = id.split(".");
  if (parts.length !== 3) return null;
  const kind = kindsByPrefix[parts[0]];
  if (!kind) return null;
  try {
    const projectId = decode(parts[1]);
    const sourceKey = decode(parts[2]);
    if (!projectId || !sourceKey) return null;
    return { kind, projectId, sourceKey };
  } catch {
    return null;
  }
}

function ref(input: Omit<ArtifactReference, "canonicalPath">): ArtifactReference {
  return { ...input, canonicalPath: canonicalArtifactPath(input.id) };
}

/** Build the canonical artifact index for every persisted piece currently represented by a Reel manifest. */
export function buildReelArtifactIndex(manifest: ReelProductionManifest): ArtifactReference[] {
  const projectId = manifest.id;
  const projectTitle = (manifest as any).studio1?.projectTitle || manifest.topic || projectId;
  // Persisted manifests predate the current required audio/shots schema. Artifact
  // indexing runs on every list read, so it must remain safe for those legacy
  // rows rather than taking down the complete production archive.
  const audio = manifest?.audio;
  const shots = Array.isArray(manifest?.shots) ? manifest.shots : [];
  const artifacts: ArtifactReference[] = [
    ref({ id: projectId, kind: "project", role: "project", title: projectTitle, sourceKey: "project" }),
    ref({ id: scopedArtifactId("document", projectId, "master-script"), kind: "document", role: "master-script", title: `${projectTitle} · Master script`, parentProjectId: projectId, sourceKey: "master-script" }),
    ref({ id: scopedArtifactId("evidence", projectId, "manifest"), kind: "evidence", role: "manifest", title: `${projectTitle} · Production manifest`, parentProjectId: projectId, sourceKey: "manifest" }),
  ];

  if (manifest.captions) {
    artifacts.push(ref({ id: scopedArtifactId("document", projectId, "captions"), kind: "document", role: "captions", title: `${projectTitle} · Captions`, parentProjectId: projectId, sourceKey: "captions" }));
  }
  if (audio?.wordTimings?.length) {
    artifacts.push(ref({ id: scopedArtifactId("document", projectId, "word-alignment"), kind: "document", role: "word-alignment", title: `${projectTitle} · Word alignment`, parentProjectId: projectId, sourceKey: "word-alignment" }));
  }
  if (audio?.narrationUrl) {
    artifacts.push(ref({ id: scopedArtifactId("audio", projectId, "narration"), kind: "audio", role: "narration", title: `${projectTitle} · Narration`, parentProjectId: projectId, sourceKey: "narration", mediaUrl: audio.narrationUrl }));
  }
  if (audio?.musicUrl) {
    artifacts.push(ref({ id: scopedArtifactId("audio", projectId, "music"), kind: "audio", role: "music", title: `${projectTitle} · Music`, parentProjectId: projectId, sourceKey: "music", mediaUrl: audio.musicUrl }));
  }

  for (const [index, shot] of shots.entries()) {
    if (!shot || typeof shot !== "object") continue;
    if (shot.asset?.videoUrl) {
      artifacts.push(ref({ id: scopedArtifactId("clip", projectId, shot.id), kind: "clip", role: "clip", title: `${projectTitle} · Clip ${index + 1}`, parentProjectId: projectId, sourceKey: shot.id, mediaUrl: shot.asset.videoUrl }));
    }
    if (shot.continuityIn?.referenceFrameUrl) {
      artifacts.push(ref({ id: scopedArtifactId("image", projectId, `continuity:${shot.id}`), kind: "image", role: "continuity-frame", title: `${projectTitle} · Clip ${index + 1} continuity frame`, parentProjectId: projectId, sourceKey: `continuity:${shot.id}`, mediaUrl: shot.continuityIn.referenceFrameUrl }));
    }
  }

  if (manifest.outputs?.narratedRoughCut?.videoUrl) {
    artifacts.push(ref({ id: scopedArtifactId("reel", projectId, "narrated-rough-cut"), kind: "reel", role: "narrated-rough-cut", title: `${projectTitle} · Full Reel`, parentProjectId: projectId, sourceKey: "narrated-rough-cut", mediaUrl: manifest.outputs.narratedRoughCut.videoUrl }));
  }
  if (manifest.outputs?.master?.videoUrl) {
    artifacts.push(ref({ id: scopedArtifactId("reel", projectId, "master"), kind: "reel", role: "master", title: `${projectTitle} · Master`, parentProjectId: projectId, sourceKey: "master", mediaUrl: manifest.outputs.master.videoUrl }));
  }
  if (manifest.qa) {
    artifacts.push(ref({ id: scopedArtifactId("evidence", projectId, "qa"), kind: "evidence", role: "qa", title: `${projectTitle} · QA evidence`, parentProjectId: projectId, sourceKey: "qa" }));
  }
  if (manifest.continuity) {
    artifacts.push(ref({ id: scopedArtifactId("evidence", projectId, "continuity"), kind: "evidence", role: "continuity", title: `${projectTitle} · Continuity package`, parentProjectId: projectId, sourceKey: "continuity" }));
  }
  return artifacts;
}

export function attachReelArtifactIndex(manifest: ReelProductionManifest) {
  const artifacts = buildReelArtifactIndex(manifest);
  (manifest as any).artifact = artifacts[0];
  (manifest as any).artifacts = artifacts;
  return manifest;
}
