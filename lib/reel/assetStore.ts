import fs from "node:fs/promises";
import path from "node:path";

function configuredRoot() {
  return process.env.ZYVORIQ_ASSET_ROOT || process.env.RAILWAY_VOLUME_MOUNT_PATH || "";
}

function safeKey(key: string) {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.startsWith("/")) throw new Error("Invalid asset key");
  return normalized;
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
  const root = configuredRoot();
  if (!root) {
    throw new Error("Durable asset storage is not configured. Set ZYVORIQ_ASSET_ROOT or attach a Railway volume.");
  }
  const clean = safeKey(key);
  const target = path.resolve(root, clean);
  const resolvedRoot = path.resolve(root);
  if (!target.startsWith(`${resolvedRoot}${path.sep}`) && target !== resolvedRoot) throw new Error("Asset path escaped configured root");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, data);
  return { key: clean, url: `/api/reels/assets/${clean.split("/").map(encodeURIComponent).join("/")}`, bytes: data.length };
}

export async function readAsset(key: string) {
  const root = configuredRoot();
  if (!root) throw new Error("Durable asset storage is not configured");
  const clean = safeKey(key);
  const target = path.resolve(root, clean);
  const resolvedRoot = path.resolve(root);
  if (!target.startsWith(`${resolvedRoot}${path.sep}`) && target !== resolvedRoot) throw new Error("Asset path escaped configured root");
  return fs.readFile(target);
}
