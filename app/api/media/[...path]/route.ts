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
        return new NextResponse(`Media not found: ${requestedPath}`, { status: 404 });
      }
    }

    const stat = fs.statSync(targetFile);
    const fileSize = stat.size;
    const range = req.headers.get("range");

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

    // Handle HTTP Range Requests (Essential for video playback & seeking in Safari/Chrome)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` }
        });
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(targetFile, { start, end });

      // Convert Node stream to Web ReadableStream
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        }
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // Full file stream
    const fileStream = fs.createReadStream(targetFile);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      }
    });

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (err: any) {
    return new NextResponse(`Error serving media: ${err.message}`, { status: 500 });
  }
}
