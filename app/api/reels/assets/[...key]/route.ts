import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/reel/assetStore";
import { getPostgresPool, getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WORKER_ASSET_BASE = (process.env.ZYVORIQ_WORKER_ASSET_BASE_URL || "http://zyvoriq-reel-worker.railway.internal:8080/internal/reel-assets").replace(/\/$/, "");
const PRODUCTION_ASSET_BASE = (process.env.ZYVORIQ_PRODUCTION_URL || "https://zyvoriq.up.railway.app").replace(/\/$/, "");

function contentType(key: string) {
  if (key.endsWith(".wav")) return "audio/wav";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

function encodedKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

const FALLBACK_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
  <rect width="640" height="360" fill="#0A0D14"/>
  <rect x="0.5" y="0.5" width="639" height="359" stroke="#1E293B" stroke-opacity="0.6"/>
  <circle cx="320" cy="180" r="40" fill="#141E33"/>
  <path d="M312 165L334 180L312 195V165Z" fill="#2DD4BF"/>
  <text x="320" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748B" text-anchor="middle" letter-spacing="0.05em">ZYVORIQ CINEMA FRAME</text>
</svg>`;

async function proxyFromProduction(req: NextRequest, assetKey: string, method: "GET" | "HEAD"): Promise<Response> {
  const headers = new Headers();
  const range = req.headers.get("range");
  if (range) headers.set("range", range);
  const upstream = await fetch(`${PRODUCTION_ASSET_BASE}/api/reels/assets/${encodedKey(assetKey)}`, { method, headers, cache: "no-store" });
  if (upstream.status === 404) {
    if (contentType(assetKey).startsWith("image/")) {
      return new Response(FALLBACK_IMAGE_SVG, { status: 200, headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" } });
    }
    // Fallback: If a master or rough cut variant was requested but not found, check if this reel has an available rendered rough cut
    if (assetKey.includes("master") || assetKey.includes("rough")) {
      const prodIdMatch = assetKey.match(/(studio1_[a-f0-9\-]{36}|reel_[a-f0-9\-]{36})/i);
      if (prodIdMatch) {
        const prodId = prodIdMatch[0];
        try {
          const pg = getPostgresPool();
          let manifest: any = null;
          if (pg) {
            const row = await pg.query("SELECT manifest_json FROM reel_productions WHERE id = $1", [prodId]);
            manifest = row.rows[0]?.manifest_json;
          } else {
            const db = getDatabase();
            const row = db.prepare("SELECT manifest_json FROM reel_productions WHERE id = ?").get(prodId) as any;
            manifest = typeof row?.manifest_json === "string" ? JSON.parse(row.manifest_json) : row?.manifest_json;
          }
          const altVideoUrl = manifest?.outputs?.narratedRoughCut?.videoUrl || manifest?.outputs?.nativeReel?.videoUrl || manifest?.outputs?.master?.videoUrl;
          if (altVideoUrl && typeof altVideoUrl === "string") {
            const altKey = altVideoUrl.replace(/^\/?api\/reels\/assets\//, "").replace(/^\/+/, "");
            if (altKey && altKey !== assetKey) {
              console.log(`[assets] Resolving rough/master variant ${assetKey} -> ${altKey}`);
              return await proxyFromProduction(req, altKey, method);
            }
          }
        } catch (e: any) {
          console.warn(`[assets] Fallback lookup failed for ${prodId}:`, e.message);
        }
      }
    }
    return new Response(null, { status: 404 });
  }
  if (!upstream.ok) {
    throw new Error(`Upstream production returned HTTP ${upstream.status}`);
  }
  const out = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  if (!out.has("content-type")) out.set("content-type", contentType(assetKey));
  return new Response(method === "HEAD" ? null : upstream.body, { status: upstream.status, headers: out });
}

async function proxyFromWorker(req: NextRequest, assetKey: string, method: "GET" | "HEAD") {
  const headers = new Headers();
  const range = req.headers.get("range");
  if (range) headers.set("range", range);
  const upstream = await fetch(`${WORKER_ASSET_BASE}/${encodedKey(assetKey)}`, { method, headers, cache: "no-store" });
  if (upstream.status === 404) {
    return new Response(null, { status: 404 });
  }
  const out = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  if (!out.has("content-type")) out.set("content-type", contentType(assetKey));
  return new Response(method === "HEAD" ? null : upstream.body, { status: upstream.status, headers: out });
}

async function handle(req: NextRequest, context: { params: Promise<{ key: string[] }> }, method: "GET" | "HEAD") {
  const { key } = await context.params;
  const assetKey = key.map(decodeURIComponent).join("/");
  try {
    const data = await readAsset(assetKey);
    if (method === "HEAD") {
      return new Response(null, { status: 200, headers: { "Content-Type": contentType(assetKey), "Cache-Control": "private, max-age=3600", "Content-Length": String(data.length), "Accept-Ranges": "bytes" } });
    }
    const range = req.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match) {
        const size = data.length;
        let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
        let end = match[2] ? Number(match[2]) : size - 1;
        end = Math.min(end, size - 1);
        if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && start < size) {
          const slice = data.subarray(start, end + 1);
          return new Response(new Uint8Array(slice), { status: 206, headers: { "Content-Type": contentType(assetKey), "Cache-Control": "private, max-age=3600", "Content-Length": String(slice.length), "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes" } });
        }
      }
    }
    return new Response(new Uint8Array(data), { status: 200, headers: { "Content-Type": contentType(assetKey), "Cache-Control": "private, max-age=3600", "Content-Length": String(data.length), "Accept-Ranges": "bytes" } });
  } catch (error: any) {
    try {
      return await proxyFromWorker(req, assetKey, method);
    } catch (proxyError: any) {
      try {
        return await proxyFromProduction(req, assetKey, method);
      } catch (prodError: any) {
        if (contentType(assetKey).startsWith("image/")) {
          return new Response(FALLBACK_IMAGE_SVG, {
            status: 200,
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "public, max-age=300",
            },
          });
        }
        return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
      }
    }
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  return handle(req, context, "GET");
}

export async function HEAD(req: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  return handle(req, context, "HEAD");
}
