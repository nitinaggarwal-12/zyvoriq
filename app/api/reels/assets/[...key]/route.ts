import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/reel/assetStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WORKER_ASSET_BASE = (process.env.ZYVORIQ_WORKER_ASSET_BASE_URL || "http://zyvoriq-reel-worker.railway.internal:8080/internal/reel-assets").replace(/\/$/, "");

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

async function proxyFromWorker(req: NextRequest, assetKey: string, method: "GET" | "HEAD") {
  const headers = new Headers();
  const range = req.headers.get("range");
  if (range) headers.set("range", range);
  const upstream = await fetch(`${WORKER_ASSET_BASE}/${encodedKey(assetKey)}`, { method, headers, cache: "no-store" });
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
      return NextResponse.json({ success: false, error: proxyError?.message || "Asset unavailable from worker" }, { status: 502 });
    }
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  return handle(req, context, "GET");
}

export async function HEAD(req: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  return handle(req, context, "HEAD");
}
