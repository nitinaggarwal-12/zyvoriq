import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function resolveLocalFilePath(urlOrPath: string): string | null {
  if (!urlOrPath || urlOrPath === "none") return null;
  const clean = urlOrPath.split("?")[0];
  if (clean.startsWith("/")) {
    const candidate = path.join(process.cwd(), "public", clean);
    if (fs.existsSync(candidate)) return candidate;
    const candidateRoot = path.join(process.cwd(), clean.replace(/^\//, ""));
    if (fs.existsSync(candidateRoot)) return candidateRoot;
  }
  if (fs.existsSync(clean)) return clean;
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const reelId = req.nextUrl.searchParams.get("reelId") || "";
    const shotIndex = Number(req.nextUrl.searchParams.get("shotIndex") || "0");
    const stream = req.nextUrl.searchParams.get("stream") || "audio"; // "audio" | "video"
    const sourceUrl = req.nextUrl.searchParams.get("sourceUrl") || "";
    const download = req.nextUrl.searchParams.get("download") === "1";

    let inputPath: string | null = null;
    if (sourceUrl) {
      inputPath = resolveLocalFilePath(sourceUrl);
    }
    if (!inputPath && reelId) {
      const candidates = [
        path.join(process.cwd(), "public", "renders", "yt", reelId, `shot_${shotIndex + 1}.mp4`),
        path.join(process.cwd(), "public", "renders", "yt", reelId, `shot_${String(shotIndex + 1).padStart(2, "0")}.mp4`),
        path.join(process.cwd(), "public", "renders", "yt", reelId, "shots", `s${shotIndex + 1}.mp4`),
        path.join(process.cwd(), "scratch", "yt", reelId, "shots", `s${shotIndex + 1}.mp4`),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          inputPath = c;
          break;
        }
      }
    }

    if (!inputPath || !fs.existsSync(inputPath)) {
      return NextResponse.json(
        { success: false, error: `Source shot file not found for shot #${shotIndex + 1}` },
        { status: 404 }
      );
    }

    const cacheDir = path.join(process.cwd(), "public", "renders", "separated_stems", reelId || "default");
    fs.mkdirSync(cacheDir, { recursive: true });

    if (stream === "video") {
      const outName = `shot_${String(shotIndex + 1).padStart(2, "0")}_video_only.mp4`;
      const outPath = path.join(cacheDir, outName);
      if (!fs.existsSync(outPath)) {
        execFileSync("ffmpeg", [
          "-y",
          "-i",
          inputPath,
          "-an", // Strip all audio tracks
          "-c:v",
          "copy",
          outPath,
        ]);
      }
      const fileBuf = fs.readFileSync(outPath);
      const headers: Record<string, string> = {
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      };
      if (download) {
        headers["Content-Disposition"] = `attachment; filename="${outName}"`;
      }
      return new NextResponse(fileBuf, { status: 200, headers });
    } else {
      // stream === "audio"
      const outName = `shot_${String(shotIndex + 1).padStart(2, "0")}_audio_only.wav`;
      const outPath = path.join(cacheDir, outName);
      if (!fs.existsSync(outPath)) {
        execFileSync("ffmpeg", [
          "-y",
          "-i",
          inputPath,
          "-vn", // Strip all video frames
          "-acodec",
          "pcm_s16le",
          "-ar",
          "48000",
          "-ac",
          "2",
          outPath,
        ]);
      }
      const fileBuf = fs.readFileSync(outPath);
      const headers: Record<string, string> = {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
      };
      if (download) {
        headers["Content-Disposition"] = `attachment; filename="${outName}"`;
      }
      return new NextResponse(fileBuf, { status: 200, headers });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to extract separated shot stream" },
      { status: 500 }
    );
  }
}
