// characterAnchor.mjs  (Path B — first-frame identity anchoring)
//
// Veo referenceImages are NOT supported on this Gemini Developer API key
// (probe returned INVALID_ARGUMENT). Two things ARE confirmed working:
//   1. Image generation via generateContent (probe step 1 = ok)
//   2. First-frame conditioning via Veo instance.image (already in the worker)
// Path B chains only those: generate ONE canonical character, then give each
// presenter shot an opening frame starting from that same face, handed to Veo
// as the first frame. Every shot opens on the same person.

import crypto from "node:crypto";

const API_BASE = "https://generativelanguage.googleapis.com";
const IMAGE_MODEL =
  process.env.ZYVORIQ_CHARACTER_IMAGE_MODEL || "gemini-3-pro-image-preview";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function findInlineImage(node) {
  if (!node || typeof node !== "object") return null;
  for (const k of ["inline_data", "inlineData"]) {
    if (node[k] && typeof node[k].data === "string") return node[k].data;
  }
  if (
    (node.mimeType?.startsWith?.("image/") ||
      node.mime_type?.startsWith?.("image/")) &&
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
  const res = await fetch(
    `${API_BASE}/v1beta/models/${IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
    }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Image gen ${res.status}: ${JSON.stringify(json).slice(0, 300)}`
    );
  }
  const b64 = findInlineImage(json);
  if (!b64) throw new Error("Image gen returned no inline image data");
  return Buffer.from(b64, "base64");
}

function characterDescription(manifest) {
  const bible = manifest.creativeBible || {};
  const locked = [bible.characterLock, bible.wardrobeLock]
    .filter(Boolean)
    .join(". ");
  return (
    locked ||
    "A single friendly presenter, mid-20s, warm approachable face, neutral " +
      "modern casual-professional wardrobe, consistent hairstyle."
  );
}

export async function ensureCharacterSheet(manifest, productionId, writeAsset) {
  const characters = manifest.characters || [];
  const presenter =
    characters.find((c) => c.id === "character_presenter") || characters[0];
  if (!presenter) return manifest;

  if (
    Array.isArray(presenter.canonicalReferenceImages) &&
    presenter.canonicalReferenceImages.length > 0
  ) {
    return manifest;
  }

  const prompt =
    "Character reference sheet. Full front-facing portrait of ONE person. " +
    characterDescription(manifest) +
    " Neutral expression, direct eye contact, even studio lighting, plain " +
    "light-grey seamless background, no props, no text, no logo. " +
    "Photorealistic, sharp facial detail, natural skin texture. " +
    "Canonical identity reference to be reused across many shots.";

  const png = await generateImage([{ text: prompt }]);
  const digest = crypto.createHash("sha256").update(png).digest("hex").slice(0, 16);
  const saved = await writeAsset(
    `reels/${productionId}/character/${presenter.id}-${digest}.png`,
    png
  );
  presenter.canonicalReferenceImages = [{ url: saved.url, digest }];
  return manifest;
}

export async function firstFrameForShot(
  manifest,
  shot,
  productionId,
  writeAsset,
  readAsset
) {
  const charId = shot?.continuityIn?.characterId;
  if (!charId) return null;

  const character = (manifest.characters || []).find((c) => c.id === charId);
  const ref = character?.canonicalReferenceImages?.[0];
  if (!ref) return null;

  let canonical;
  try {
    canonical = await readAsset(ref.url);
  } catch (e) {
    console.warn(`[anchor] could not read canonical sheet: ${e?.message || e}`);
    return null;
  }

  const scene = [
    "Opening frame of a video shot.",
    "Keep the SAME person from the provided reference image — identical face,",
    "hair, and wardrobe. Do not change their identity.",
    `Scene: ${shot.visualIntent || "presenter speaking to camera"}.`,
    shot.continuityIn?.environment
      ? `Setting: ${shot.continuityIn.environment}.`
      : "",
    "Photorealistic, vertical 9:16 framing, natural lighting. No text or logos.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const frame = await generateImage([
      {
        inline_data: {
          mime_type: "image/png",
          data: canonical.toString("base64"),
        },
      },
      { text: scene },
    ]);
    const digest = crypto
      .createHash("sha256")
      .update(frame)
      .digest("hex")
      .slice(0, 16);
    await writeAsset(
      `reels/${productionId}/frames/${shot.id}-${digest}.png`,
      frame
    );
    return frame;
  } catch (e) {
    console.warn(
      `[anchor] scene-frame conditioning failed (${e?.message || e}); ` +
        `using raw canonical sheet as first frame for ${shot.id}`
    );
    return canonical;
  }
}

export function seedForShot(productionId, shotId) {
  const h = crypto
    .createHash("sha256")
    .update(`${productionId}:${shotId}`)
    .digest();
  return h.readUInt32BE(0);
}
