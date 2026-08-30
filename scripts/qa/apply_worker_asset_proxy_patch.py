from pathlib import Path

worker_path = Path('scripts/reel_worker_v2.mjs')
s = worker_path.read_text()

old_import = 'import fs from "node:fs/promises";\n'
new_import = 'import fs from "node:fs/promises";\nimport { createReadStream } from "node:fs";\nimport http from "node:http";\n'
if old_import not in s:
    raise SystemExit('worker import anchor not found')
s = s.replace(old_import, new_import, 1)

old_const = 'const heartbeatMs = 15000;\n'
new_const = 'const heartbeatMs = 15000;\nconst assetServerPort = Math.max(1, Number(process.env.ZYVORIQ_ASSET_SERVER_PORT || 8080));\n'
if old_const not in s:
    raise SystemExit('worker const anchor not found')
s = s.replace(old_const, new_const, 1)

anchor = 'async function readAsset(keyOrUrl) { return fs.readFile(assetPath(keyOrUrl).target); }\n'
server = r'''

function assetContentType(key) {
  if (key.endsWith(".wav")) return "audio/wav";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function parseByteRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(value).trim());
  if (!match) return { invalid: true };
  let start;
  let end;
  if (!match[1] && match[2]) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return { invalid: true };
  end = Math.min(end, size - 1);
  return { start, end };
}

const assetServer = http.createServer(async (req, res) => {
  try {
    if (!assetRoot()) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "asset_storage_unavailable" }));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    const url = new URL(req.url || "/", "http://worker.local");
    const prefix = "/internal/reel-assets/";
    if (!url.pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const encoded = url.pathname.slice(prefix.length);
    const key = encoded.split("/").map(decodeURIComponent).join("/");
    const resolved = assetPath(key);
    const stat = await fs.stat(resolved.target);
    if (!stat.isFile()) {
      res.writeHead(404);
      res.end();
      return;
    }
    const size = Number(stat.size);
    const range = parseByteRange(req.headers.range, size);
    const common = {
      "Content-Type": assetContentType(resolved.key),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    };
    if (range?.invalid) {
      res.writeHead(416, { ...common, "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    if (range) {
      const length = range.end - range.start + 1;
      res.writeHead(206, {
        ...common,
        "Content-Length": String(length),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      });
      if (req.method === "HEAD") { res.end(); return; }
      createReadStream(resolved.target, { start: range.start, end: range.end }).pipe(res);
      return;
    }
    res.writeHead(200, { ...common, "Content-Length": String(size) });
    if (req.method === "HEAD") { res.end(); return; }
    createReadStream(resolved.target).pipe(res);
  } catch (error) {
    const missing = error?.code === "ENOENT";
    res.writeHead(missing ? 404 : 500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: missing ? "asset_not_found" : String(error?.message || error) }));
  }
});
assetServer.listen(assetServerPort, "::", () => {
  console.log(`[reel-worker] private asset server listening on ${assetServerPort}`);
});
'''
if anchor not in s:
    raise SystemExit('worker asset read anchor not found')
s = s.replace(anchor, anchor + server, 1)
worker_path.write_text(s)

route = '''import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/reel/assetStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const WORKER_ASSET_BASE = (process.env.ZYVORIQ_WORKER_ASSET_BASE_URL || "http://zyvoriq-reel-worker.railway.internal:8080/internal/reel-assets").replace(/\\/$/, "");

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
      const match = /^bytes=(\\d*)-(\\d*)$/.exec(range.trim());
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
    if (error?.code !== "ENOENT") {
      return NextResponse.json({ success: false, error: error?.message || "Failed to read asset" }, { status: 500 });
    }
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
'''
Path('app/api/reels/assets/[...key]/route.ts').write_text(route)
