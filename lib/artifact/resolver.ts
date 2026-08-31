import { buildReelArtifactIndex, canonicalArtifactPath, parseScopedArtifactId, type ArtifactReference } from "./identity";
import { reelProductionStore, type StoredReelProduction } from "@/lib/reel/productionStore";
import { suppressUncertifiedStudio1Outputs } from "@/lib/studio1/fullReelCertification";

export interface ResolvedArtifact {
  artifact: ArtifactReference;
  project: {
    id: string;
    revision: number;
    canonicalPath: string;
    createdAt: string;
    updatedAt: string;
  };
  payload: unknown;
  children?: ArtifactReference[];
}

function safeProduction(production: StoredReelProduction): StoredReelProduction {
  return production.id.startsWith("studio1_") ? suppressUncertifiedStudio1Outputs(production) : production;
}

function artifactPayload(production: StoredReelProduction, artifact: ArtifactReference): unknown {
  const manifest = production.manifest;
  if (artifact.kind === "project") return production;
  if (artifact.kind === "document") {
    if (artifact.role === "master-script") return { text: manifest.masterScript };
    if (artifact.role === "captions") return manifest.captions || null;
    if (artifact.role === "word-alignment") return manifest.audio.wordTimings || [];
  }
  if (artifact.kind === "reel") {
    if (artifact.role === "master") return manifest.outputs?.master || null;
    if (artifact.role === "narrated-rough-cut") return manifest.outputs?.narratedRoughCut || null;
  }
  if (artifact.kind === "clip") return manifest.shots.find(shot => shot.id === artifact.sourceKey) || null;
  if (artifact.kind === "audio") {
    if (artifact.role === "narration") return {
      url: manifest.audio.narrationUrl,
      durationSec: manifest.audio.actualDurationSec,
      provider: manifest.audio.provider,
      model: manifest.audio.model,
      voice: manifest.audio.voice,
    };
    if (artifact.role === "music") return { url: manifest.audio.musicUrl, plan: manifest.musicPlan || null };
  }
  if (artifact.kind === "image" && artifact.sourceKey?.startsWith("continuity:")) {
    const shotId = artifact.sourceKey.slice("continuity:".length);
    const shot = manifest.shots.find(item => item.id === shotId);
    return { shotId, url: shot?.continuityIn?.referenceFrameUrl || null, continuityIn: shot?.continuityIn || null };
  }
  if (artifact.kind === "evidence") {
    if (artifact.role === "qa") return manifest.qa;
    if (artifact.role === "continuity") return manifest.continuity || null;
    if (artifact.role === "manifest") return manifest;
  }
  return null;
}

export async function resolveArtifact(id: string): Promise<ResolvedArtifact | null> {
  const parsed = parseScopedArtifactId(id);
  const projectId = parsed?.projectId || id;
  const stored = await reelProductionStore.get(projectId);
  if (!stored) return null;
  const production = safeProduction(stored);
  const artifacts = buildReelArtifactIndex(production.manifest);
  const artifact = artifacts.find(item => item.id === id);
  if (!artifact) return null;
  return {
    artifact,
    project: {
      id: production.id,
      revision: production.revision,
      canonicalPath: canonicalArtifactPath(production.id),
      createdAt: production.createdAt,
      updatedAt: production.updatedAt,
    },
    payload: artifactPayload(production, artifact),
    children: artifact.kind === "project" ? artifacts.filter(item => item.id !== artifact.id) : undefined,
  };
}
