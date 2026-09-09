import fs from "node:fs/promises";
import path from "node:path";

import fsSync from "node:fs";

const ASSET_URL_PREFIX = "/api/reels/assets/";

function configuredRoot() {
  const env = process.env.ZYVORIQ_ASSET_ROOT || process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (env) return env;
  try {
    const localScratch = path.join(process.cwd(), "scratch", "assets");
    if (fsSync.existsSync(localScratch)) return localScratch;
  } catch {}
  try {
    if (fsSync.existsSync("/data")) return "/data";
  } catch {}
  return "";
}

function safeKey(key: string) {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.startsWith("/")) throw new Error("Invalid asset key");
  return normalized;
}

function resolveAssetPath(key: string) {
  const root = configuredRoot();
  if (!root) throw new Error("Durable asset storage is not configured");
  const clean = safeKey(key);
  const target = path.resolve(root, clean);
  const resolvedRoot = path.resolve(root);
  if (!target.startsWith(`${resolvedRoot}${path.sep}`) && target !== resolvedRoot) throw new Error("Asset path escaped configured root");
  return { clean, target };
}

export function assetUrlToKey(url: string) {
  if (!url.startsWith(ASSET_URL_PREFIX)) throw new Error(`Asset URL is not owned by the Reel asset store: ${url}`);
  const encoded = url.slice(ASSET_URL_PREFIX.length);
  const decoded = encoded.split("/").map(segment => decodeURIComponent(segment)).join("/");
  return safeKey(decoded);
}

export function getAssetFilePath(keyOrUrl: string) {
  const key = keyOrUrl.startsWith(ASSET_URL_PREFIX) ? assetUrlToKey(keyOrUrl) : safeKey(keyOrUrl);
  return resolveAssetPath(key).target;
}

export function getAssetStoreCapability() {
  const root = configuredRoot();
  return {
    configured: Boolean(root),
    durable: Boolean(root),
    backend: root ? "mounted-volume" as const : "unconfigured" as const,
  };
}

export async function writeAsset(key: string, data: Buffer) {
  if (!configuredRoot()) {
    throw new Error("Durable asset storage is not configured. Set ZYVORIQ_ASSET_ROOT or attach a Railway volume.");
  }
  const { clean, target } = resolveAssetPath(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return { key: clean, url: `${ASSET_URL_PREFIX}${clean.split("/").map(encodeURIComponent).join("/")}`, bytes: data.length };
}

export async function readAsset(key: string) {
  const ext = path.extname(key).toLowerCase();
  const isVideo = ext === ".mp4" || ext === ".webm" || ext === ".mov" || !ext;
  const isImage = ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp";

  // 1. Direct scratch cache lookup for all media types (shots, audio, images, renders)
  const scratchCache = path.resolve(process.cwd(), "scratch", "asset_cache", key);
  if (fsSync.existsSync(scratchCache)) {
    return fs.readFile(scratchCache);
  }

  // 2. Direct public and public/assets lookup
  const publicRelative = path.resolve(process.cwd(), "public", key);
  if (fsSync.existsSync(publicRelative)) {
    return fs.readFile(publicRelative);
  }
  const publicAssetsRelative = path.resolve(process.cwd(), "public", "assets", key);
  if (fsSync.existsSync(publicAssetsRelative)) {
    return fs.readFile(publicAssetsRelative);
  }

  // 3. Durable volume storage lookup (/data or ZYVORIQ_ASSET_ROOT)
  try {
    const { target } = resolveAssetPath(key);
    if (fsSync.existsSync(target)) {
      return await fs.readFile(target);
    }
  } catch {}

  // 4. If this is explicitly a rough cut / master render request (NEVER for shots), check master candidate
  const isRoughOrMaster = isVideo && (
    key.includes("narrated-rough") ||
    key.includes("rough_master") ||
    key.includes("renders/") ||
    key.endsWith("master.mp4")
  );
  if (isRoughOrMaster) {
    const fullId = key.match(/studio1_[a-f0-9\-]{36}/i)?.[0];
    if (fullId) {
      const masterCandidate = path.resolve(process.cwd(), "public", "assets", "reels", fullId, "narrated_rough_master.mp4");
      if (fsSync.existsSync(masterCandidate)) {
        return fs.readFile(masterCandidate);
      }
      const scratchMaster = path.resolve(process.cwd(), "scratch", "asset_cache", "reels", fullId, "narrated_rough_cut_master.mp4");
      if (fsSync.existsSync(scratchMaster)) {
        return fs.readFile(scratchMaster);
      }
    }
  }

  // 5. Short ID showcase video fallbacks
  if (isVideo) {
    const shortId = key.match(/studio1_[a-f0-9]{8}/i)?.[0];
    if (shortId) {
      const publicCandidate = path.resolve(process.cwd(), "public", "assets", "video", `${shortId}.mp4`);
      if (fsSync.existsSync(publicCandidate)) {
        return fs.readFile(publicCandidate);
      }
      const scratchCandidate = path.resolve(process.cwd(), "scratch", "reels_evaluation", `${shortId}.mp4`);
      if (fsSync.existsSync(scratchCandidate)) {
        return fs.readFile(scratchCandidate);
      }
    }
  }

  // 6. Dedicated demo stills and external proxy caching
  if (isImage) {
    if (key.includes("5b3c6b72")) {
      const renStill = path.resolve(process.cwd(), "public", "assets", "stills", "ren_cyberpunk.png");
      if (fsSync.existsSync(renStill)) {
        return fs.readFile(renStill);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      try {
        const prodUrl = `https://zyvoriq.up.railway.app/api/reels/assets/${key.replace(/^\/+/, "")}`;
        const res = await fetch(prodUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const cType = res.headers.get("content-type") || "";
          if (cType.startsWith("image/")) {
            const buf = Buffer.from(await res.arrayBuffer());
            await fs.mkdir(path.dirname(scratchCache), { recursive: true }).catch(() => {});
            await fs.writeFile(scratchCache, buf).catch(() => {});
            return buf;
          }
        }
      } catch {}
    }
  }

  throw new Error(`Asset not found: ${key}`);
}

export async function deleteAsset(key: string) {
  const { target } = resolveAssetPath(key);
  try {
    await fs.unlink(target);
    return true;
  } catch (error: any) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

const WORKER_ASSET_BASE = (process.env.ZYVORIQ_WORKER_ASSET_BASE_URL || "http://zyvoriq-reel-worker.railway.internal:8080/internal/reel-assets").replace(/\/$/, "");

export async function deleteProductionAssets(productionId: string): Promise<void> {
  const cleanId = safeKey(productionId);
  const root = configuredRoot();
  if (root) {
    const targets = [
      path.resolve(root, "reels", cleanId),
      path.resolve(root, cleanId),
    ];
    const resolvedRoot = path.resolve(root);
    for (const target of targets) {
      if (target.startsWith(`${resolvedRoot}${path.sep}`) || target === resolvedRoot) {
        try {
          await fs.rm(target, { recursive: true, force: true });
        } catch (err: any) {
          if (err?.code !== "ENOENT") {
            console.warn(`[asset-store] Warning: failed to delete local production assets for ${productionId}:`, err?.message || err);
          }
        }
      }
    }
  }

  // Also check RAILWAY_VOLUME_MOUNT_PATH directly if different from root
  const volMount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volMount && volMount !== root) {
    try {
      await fs.rm(path.resolve(volMount, "reels", cleanId), { recursive: true, force: true }).catch(() => {});
      await fs.rm(path.resolve(volMount, cleanId), { recursive: true, force: true }).catch(() => {});
    } catch {}
  }

  // Forward deletion to worker asset server (which hosts the mounted persistent volume)
  if (WORKER_ASSET_BASE) {
    try {
      await fetch(`${WORKER_ASSET_BASE}/reels/${encodeURIComponent(cleanId)}`, {
        method: "DELETE",
        cache: "no-store",
      }).catch(() => {});
    } catch {}
  }
}

