// characterAnchor.mjs  (Path B — first-frame identity + environment anchoring)
//
// Veo referenceImages are NOT supported on this Gemini Developer API key.
// The worker therefore conditions Veo with one generated opening frame.
// This module makes that opening frame authoritative for three things at once:
//   1. canonical presenter identity / wardrobe,
//   2. the established physical environment from the previous generated clip,
//   3. the CURRENT narration beat already visible at frame 0.000.
//
// That prevents the common failure mode where identity stays stable but the set
// changes between clips, and it prevents a clip from spending its first seconds
// visually "catching up" to narration that has already moved to the next beat.

import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const API_BASE = "https://generativelanguage.googleapis.com";
const IMAGE_MODEL = process.env.ZYVORIQ_CHARACTER_IMAGE_MODEL || "gemini-3-pro-image-preview";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function findInlineImage(node) {
  if (!node || typeof node !== "object") return null;
  for (const k of ["inline_data", "inlineData"]) {
    if (node[k] && typeof node[k].data === "string") return node[k].data;
  }
  if (
    (node.mimeType?.startsWith?.("image/") || node.mime_type?.startsWith?.("image/")) &&
    typeof node.data === "string"
  ) {
    return node.data;
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) {
      for (const it of v) {
        const f = findInlineImage(it);
        if (f) return f;
      }
    } else if (v && typeof v === "object") {
      const f = findInlineImage(v);
      if (f) return f;
    }
  }
  return null;
}

async function generateImage(parts) {
  const key = apiKey();
  if (!key) throw new Error("Image generation requires GEMINI_API_KEY");
  const res = await fetch(`${API_BASE}/v1beta/models/${IMAGE_MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }] }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Image gen ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  const b64 = findInlineImage(json);
  if (!b64) throw new Error("Image gen returned no inline image data");
  return Buffer.from(b64, "base64");
}

function characterDescription(manifest) {
  const bible = manifest.creativeBible || {};
  const locked = [bible.characterLock, bible.wardrobeLock].filter(Boolean).join(". ");
  return locked || "A single friendly presenter, mid-20s, warm approachable face, neutral modern casual-professional wardrobe, consistent hairstyle.";
}

function referenceUrl(value) {
  if (typeof value === "string") return value;
  if (value && typeof value.url === "string") return value.url;
  return "";
}

function characterFrom(manifest, charId) {
  const compatibility = Array.isArray(manifest.characters) ? manifest.characters : [];
  const canonical = Array.isArray(manifest.continuity?.characters) ? manifest.continuity.characters : [];
  return compatibility.find(c => c.id === charId) || canonical.find(c => c.id === charId) || null;
}

function syncCanonicalReference(manifest, charId, saved) {
  const compatibility = Array.isArray(manifest.characters) ? manifest.characters : [];
  let compat = compatibility.find(c => c.id === charId);
  if (!compat) {
    const source = manifest.continuity?.characters?.find(c => c.id === charId);
    if (source) {
      compat = structuredClone(source);
      compatibility.push(compat);
      manifest.characters = compatibility;
    }
  }
  if (compat) compat.canonicalReferenceImages = [{ url: saved.url, digest: saved.digest }];

  const canonical = manifest.continuity?.characters?.find(c => c.id === charId);
  if (canonical) canonical.canonicalReferenceImages = [saved.url];
}

export function buildOpeningFramePrompt(manifest, shot, { hasCanonical = false, hasEnvironmentReference = false } = {}) {
  const noPerson = !shot?.continuityIn?.characterId;
  return [
    "OPENING-FRAME CONTRACT: this image is frame 0.000 of the CURRENT video scene.",
    "SEMANTIC ONSET LOCK: the current narration beat must already be visually true in this first frame. Do not use an establishing delay, neutral waiting pose, generic setup, delayed reveal, or transition period before the relevant visual begins.",
    shot?.scriptText ? `CURRENT NARRATION BEAT: ${shot.scriptText}` : "",
    `CURRENT VISUAL OBJECTIVE: ${shot?.visualIntent || "directly visualize the current narration beat"}.`,
    hasCanonical
      ? "IDENTITY REFERENCE: the first supplied reference is authoritative for the presenter identity, face, hair, body proportions and wardrobe. Preserve that person exactly."
      : "",
    hasCanonical && hasEnvironmentReference
      ? "Do NOT copy the canonical identity sheet's plain studio background; that first image is for identity only."
      : "",
    hasEnvironmentReference
      ? "ENVIRONMENT REFERENCE: the supplied previous-scene frame is authoritative for the physical set. Preserve the same background geometry, wall/floor materials, furniture placement, major props, lighting direction, color temperature and spatial relationships. Do not replace it with a living room, office, studio, outdoor location or any other new set unless the current visual objective explicitly requires a location change."
      : "",
    noPerson
      ? "SUBJECT RULE: this frame must contain no visible people, faces, silhouettes, reflections or portraits. Preserve the established environment while staging the current B-roll subject."
      : "Keep the same presenter already engaged in the current beat; do not make them wait before acting or speaking visually.",
    shot?.continuityIn?.environment ? `SETTING CONTRACT: ${shot.continuityIn.environment}.` : "",
    "Photorealistic vertical 9:16 composition, natural continuity-preserving lighting, no text, captions, logos or UI.",
  ].filter(Boolean).join(" ");
}

async function dependencyLastFrame(manifest, shot, readAsset) {
  const dependencyId = shot?.dependsOnShotIds?.at?.(-1);
  if (!dependencyId) return null;
  const dependency = manifest.shots?.find(item => item.id === dependencyId);
  if (!dependency?.asset?.videoUrl) return null;

  const video = await readAsset(dependency.asset.videoUrl);
  const tmpVideo = path.join(os.tmpdir(), `zyvoriq-env-${crypto.randomUUID()}.mp4`);
  const tmpFrame = path.join(os.tmpdir(), `zyvoriq-env-${crypto.randomUUID()}.png`);

  const depSec = Number(dependency.asset.actualDurationSec || 0);
  const trimOutRaw = Number(dependency.trimOutSec || 0);
  const trimOut = depSec > 0 ? Math.min(trimOutRaw || depSec, depSec) : trimOutRaw;
  const trimIn = Number(dependency.trimInSec || 0);
  const t = Math.max(0, Math.max(trimIn, trimOut > 0 ? trimOut - 0.15 : 0));
  
  try {
    await fs.writeFile(tmpVideo, video);
    await execFileAsync("ffmpeg", [
      "-y", "-ss", String(t), "-i", tmpVideo,
      "-frames:v", "1",
      "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
      tmpFrame,
    ], { timeout: 30000, maxBuffer: 2e6 });
    return await fs.readFile(tmpFrame);
  } finally {
    try { await fs.unlink(tmpVideo); } catch {}
    try { await fs.unlink(tmpFrame); } catch {}
  }
}

export async function ensureCharacterSheet(manifest, productionId, writeAsset) {
  const characters = Array.isArray(manifest.characters) && manifest.characters.length
    ? manifest.characters
    : (manifest.continuity?.characters || []);
  const presenter = characters.find(c => c.id === "character_presenter") || characters[0];
  if (!presenter) return manifest;

  const existing = (presenter.canonicalReferenceImages || []).map(referenceUrl).find(Boolean);
  if (existing) {
    syncCanonicalReference(manifest, presenter.id, { url: existing, digest: undefined });
    return manifest;
  }

  const prompt =
    "Character reference sheet. Full front-facing portrait of ONE person. " +
    characterDescription(manifest) +
    " Neutral expression, direct eye contact, even studio lighting, plain light-grey seamless background, no props, no text, no logo. " +
    "Photorealistic, sharp facial detail, natural skin texture. Canonical identity reference to be reused across many shots.";

  const png = await generateImage([{ text: prompt }]);
  const digest = crypto.createHash("sha256").update(png).digest("hex").slice(0, 16);
  const saved = await writeAsset(`reels/${productionId}/character/${presenter.id}-${digest}.png`, png);
  syncCanonicalReference(manifest, presenter.id, { url: saved.url, digest });
  return manifest;
}

export async function firstFrameForShot(manifest, shot, productionId, writeAsset, readAsset) {
  const charId = shot?.continuityIn?.characterId;
  const character = charId ? characterFrom(manifest, charId) : null;
  const canonicalRef = character?.canonicalReferenceImages?.map?.(referenceUrl)?.find(Boolean) || "";

  let canonical = null;
  if (canonicalRef) {
    try {
      canonical = await readAsset(canonicalRef);
    } catch (e) {
      console.warn(`[anchor] could not read canonical sheet: ${e?.message || e}`);
    }
  }

  let environmentFrame = null;
  if (shot?.dependsOnShotIds?.length) {
    try {
      environmentFrame = await dependencyLastFrame(manifest, shot, readAsset);
    } catch (e) {
      console.warn(`[anchor] could not extract environment frame for ${shot.id}: ${e?.message || e}`);
    }
  }

  if (!canonical && !environmentFrame) return null;

  const prompt = buildOpeningFramePrompt(manifest, shot, {
    hasCanonical: Boolean(canonical),
    hasEnvironmentReference: Boolean(environmentFrame),
  });
  const parts = [];
  if (canonical) {
    parts.push({ inline_data: { mime_type: "image/png", data: canonical.toString("base64") } });
  }
  if (environmentFrame) {
    parts.push({ inline_data: { mime_type: "image/png", data: environmentFrame.toString("base64") } });
  }
  parts.push({ text: prompt });

  try {
    const frame = await generateImage(parts);
    const digest = crypto.createHash("sha256").update(frame).digest("hex").slice(0, 16);
    await writeAsset(`reels/${productionId}/frames/${shot.id}-${digest}.png`, frame);
    return frame;
  } catch (e) {
    // For an environment-locked presenter scene the previous clip frame is the
    // safer fallback: it preserves the actual set and, in the default Studio1
    // presenter flow, the same already-approved person. Falling back to the raw
    // character sheet would reintroduce the plain-background/new-set defect.
    if (environmentFrame && charId) {
      console.warn(`[anchor] composite frame failed (${e?.message || e}); preserving previous scene frame for ${shot.id}`);
      return environmentFrame;
    }
    if (canonical && !environmentFrame) {
      console.warn(`[anchor] semantic opening frame failed (${e?.message || e}); using canonical identity frame for first scene ${shot.id}`);
      return canonical;
    }
    console.warn(`[anchor] opening frame failed for ${shot.id}: ${e?.message || e}`);
    return null;
  }
}

export function seedForShot(productionId, shotId) {
  const h = crypto.createHash("sha256").update(`${productionId}:${shotId}`).digest();
  return h.readUInt32BE(0);
}
