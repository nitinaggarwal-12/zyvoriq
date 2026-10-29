import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    const requestedPath = pathSegments.join("/");

    // Security check: prevent path traversal
    if (requestedPath.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Try resolving in public directory, then workspace root
    const publicPath = path.resolve(process.cwd(), "public", requestedPath);
    const altPublicPath = path.resolve(process.cwd(), "public/assets", requestedPath);
    const rootPath = path.resolve(process.cwd(), requestedPath);

    let targetFile = publicPath;
    if (!fs.existsSync(targetFile)) {
      if (fs.existsSync(altPublicPath)) {
        targetFile = altPublicPath;
      } else if (fs.existsSync(rootPath)) {
        targetFile = rootPath;
      } else {
        // Fallback: proxy from dedicated worker asset server if configured
        const WORKER_ASSET_BASE = (process.env.ZYVORIQ_WORKER_ASSET_BASE_URL || "").replace(/\/$/, "");
        if (WORKER_ASSET_BASE) {
          try {
            const upstream = await fetch(`${WORKER_ASSET_BASE}/${requestedPath}`, {
              headers: req.headers.get("range") ? { range: req.headers.get("range")! } : {},
              cache: "no-store"
            });
            if (upstream.ok || upstream.status === 206) {
              const out = new Headers();
              for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"]) {
                const value = upstream.headers.get(name);
                if (value) out.set(name, value);
              }
              return new Response(upstream.body, { status: upstream.status, headers: out });
            }
          } catch {}
        }

        return new NextResponse(`Media not found: ${requestedPath}`, { status: 404 });
      }
    }

    const stat = fs.statSync(targetFile);
    const fileSize = stat.size;
    const range = req.headers.get("range");
    const isMutableGenerated =
      requestedPath.includes("generated/") || requestedPath.includes("library_manifest.json");
    const cacheControl = isMutableGenerated
      ? "no-store, no-cache, must-revalidate, max-age=0"
      : "public, max-age=3600, stale-while-revalidate=86400";

    // Determine content type
    const ext = path.extname(targetFile).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".mp3") contentType = "audio/mpeg";
    else if (ext === ".wav") contentType = "audio/wav";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";

    // Cloud Run's GFE / Envoy HTTP/1.1 layer rejects single buffered responses > 32 MiB
    // ("Response size was too large"). Cap open-ended or oversized Range windows to 8 MiB
    // so <video> elements play immediately at 0:00 and pipeline sequential 206 chunks.
    const MAX_CLOUDRUN_RANGE_CHUNK_BYTES = 8 * 1024 * 1024; // 8 MiB (< 32 MiB limit)
    const SAFE_DIRECT_RESPONSE_BYTES = 24 * 1024 * 1024; // 24 MiB

    const createSafeFileWebStream = (opts?: { start: number; end: number }) => {
      const fileStream = opts
        ? fs.createReadStream(targetFile, { start: opts.start, end: opts.end })
        : fs.createReadStream(targetFile);
      let closed = false;
      const cleanup = () => {
        if (closed) return;
        closed = true;
        fileStream.removeAllListeners("data");
        fileStream.removeAllListeners("end");
        fileStream.removeAllListeners("error");
        if (!fileStream.destroyed) {
          fileStream.destroy();
        }
      };

      return new ReadableStream<Uint8Array>({
        start(controller) {
          fileStream.on("data", (chunk: Buffer | string) => {
            if (closed) return;
            try {
              const bytes =
                typeof chunk === "string" ? Buffer.from(chunk) : new Uint8Array(chunk);
              controller.enqueue(bytes);
            } catch {
              cleanup();
            }
          });
          fileStream.on("end", () => {
            if (closed) return;
            closed = true;
            try {
              controller.close();
            } catch {
              // Controller already closed by client abort
            }
          });
          fileStream.on("error", (err) => {
            if (closed) return;
            closed = true;
            try {
              controller.error(err);
            } catch {
              // Controller already closed
            }
          });
        },
        cancel() {
          cleanup();
        },
      });
    };

    const isDownload = req.nextUrl.searchParams.get("download") === "true";

    // Handle HTTP Range Requests (and auto-promote >24 MiB non-download video probes to 8 MiB 206 Range)
    if (range || (!isDownload && (ext === ".mp4" || ext === ".webm") && fileSize > SAFE_DIRECT_RESPONSE_BYTES)) {
      const normalizedRange = range ? range.replace(/bytes=/i, "").trim() : "0-";
      const parts = normalizedRange.split("-");
      let start = parts[0] ? parseInt(parts[0], 10) : 0;
      if (!Number.isFinite(start) || start < 0) start = 0;

      // Suffix byte-range request (e.g., bytes=-500)
      if (!parts[0] && parts[1]) {
        const suffixLen = parseInt(parts[1], 10);
        if (Number.isFinite(suffixLen) && suffixLen > 0) {
          start = Math.max(0, fileSize - Math.min(suffixLen, MAX_CLOUDRUN_RANGE_CHUNK_BYTES));
        }
      }

      if (start >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const maxWindowEnd = Math.min(fileSize - 1, start + MAX_CLOUDRUN_RANGE_CHUNK_BYTES - 1);
      const requestedEnd = parts[0] && parts[1] ? parseInt(parts[1], 10) : maxWindowEnd;
      const end =
        Number.isFinite(requestedEnd) && requestedEnd >= start
          ? Math.min(requestedEnd, maxWindowEnd)
          : maxWindowEnd;

      const chunksize = end - start + 1;
      const stream = createSafeFileWebStream({ start, end });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
          "Cache-Control": cacheControl,
        },
      });
    }

    // Full file stream (<= 24 MiB or explicit small asset download)
    const stream = createSafeFileWebStream();
    const downloadFilename = (
      req.nextUrl.searchParams.get("filename") || path.basename(targetFile)
    ).replace(/[^a-zA-Z0-9._-]/g, "_");

    const headers: Record<string, string> = {
      "Content-Length": fileSize.toString(),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl,
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="${downloadFilename}"`;
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new NextResponse(`Error serving media: ${err.message}`, { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    const requestedPath = pathSegments.join("/");
    if (requestedPath.includes("..")) {
      return new NextResponse(null, { status: 403 });
    }
    const candidates = [
      path.resolve(process.cwd(), "public", requestedPath),
      path.resolve(process.cwd(), "public/assets", requestedPath),
      path.resolve(process.cwd(), requestedPath),
    ];
    const targetFile = candidates.find((p) => fs.existsSync(p));
    if (!targetFile) {
      return new NextResponse(null, { status: 404 });
    }
    const stat = fs.statSync(targetFile);
    const isMutableGenerated =
      requestedPath.includes("generated/") || requestedPath.includes("library_manifest.json");
    const ext = path.extname(targetFile).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".mp3") contentType = "audio/mpeg";
    else if (ext === ".wav") contentType = "audio/wav";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Length": stat.size.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": isMutableGenerated
          ? "no-store, no-cache, must-revalidate, max-age=0"
          : "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

