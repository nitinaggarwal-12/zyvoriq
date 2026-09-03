import fs from "node:fs/promises";
import path from "node:path";

import fsSync from "node:fs";

const ASSET_URL_PREFIX = "/api/reels/assets/";

function configuredRoot() {
  const env = process.env.ZYVORIQ_ASSET_ROOT || process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (env) return env;
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
  const { target } = resolveAssetPath(key);
  return fs.readFile(target);
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
