import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { readAsset } from "@/lib/reel/assetStore";

const PRODUCTION_ASSET_BASE = (
  process.env.ZYVORIQ_PRODUCTION_URL || "https://zyvoriq.up.railway.app"
).replace(/\/$/, "");

/**
 * Resolves a web asset path (e.g., "/assets/video/foo.mp4", "/renders/yt/...",
 * or "/api/reels/assets/reels/...") to an absolute filesystem path on the current environment.
 */
function resolveWebPathToDisk(webUrl: string): string | null {
  if (!webUrl || typeof webUrl !== "string") return null;
  const cleanUrl = webUrl.split("?")[0].split("#")[0];

  // 1. Direct public/ paths (/assets/..., /renders/..., /showcase/..., /samples/...)
  if (
    cleanUrl.startsWith("/assets/") ||
    cleanUrl.startsWith("/renders/") ||
    cleanUrl.startsWith("/showcase/") ||
    cleanUrl.startsWith("/samples/") ||
    cleanUrl.startsWith("/music-video/")
  ) {
    return path.join(process.cwd(), "public", cleanUrl);
  }

  // 2. API asset proxy paths (/api/reels/assets/reels/<id>/...)
  if (cleanUrl.startsWith("/api/reels/assets/")) {
    const rel = cleanUrl.replace(/^\/api\/reels\/assets\//, "");
    const candidatePublic = path.join(process.cwd(), "public", "assets", rel);
    if (fs.existsSync(candidatePublic)) return candidatePublic;

    const candidateScratch = path.join(process.cwd(), "scratch", rel);
    if (fs.existsSync(candidateScratch)) return candidateScratch;

    return candidatePublic;
  }

  return null;
}

async function checkFileExistsAndValid(webUrl: string): Promise<boolean> {
  if (!webUrl || typeof webUrl !== "string") return false;
  if (webUrl.startsWith("http://") || webUrl.startsWith("https://")) {
    if (webUrl.includes(".railway.internal")) return false;
    return true;
  }
  if (webUrl.startsWith("data:")) return true;

  const cleanUrl = webUrl.split("?")[0].split("#")[0];

  // If this is an API asset proxy path (/api/reels/assets/...), check assetStore OR remote proxy
  if (cleanUrl.startsWith("/api/reels/assets/")) {
    const rel = cleanUrl.replace(/^\/api\/reels\/assets\//, "");
    try {
      const buf = await readAsset(rel);
      if (buf && buf.length > 512) return true;
    } catch {}

    // Live generated studio1 / yt / ep assets are served on-demand via /api/reels/assets/[...key] proxy from Railway
    if (
      rel.startsWith("reels/studio1_") ||
      rel.startsWith("reels/ep_") ||
      rel.startsWith("reels/yt_") ||
      rel.startsWith("yt/")
    ) {
      return true;
    }
  }

  const diskPath = resolveWebPathToDisk(webUrl);
  if (!diskPath) return false;

  try {
    if (!fs.existsSync(diskPath)) return false;
    const stat = fs.statSync(diskPath);
    return stat.isFile() && stat.size > 512;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];

    const results: Record<string, boolean> = {};
    await Promise.all(
      urls.map(async (u) => {
        if (u && typeof u === "string") {
          results[u] = await checkFileExistsAndValid(u);
        }
      })
    );

    const fallbacks: Record<string, string> = {};
    for (const u of urls) {
      if (u && !results[u]) {
        if (
          u.includes("napoleon_180s_master.mp4") &&
          (await checkFileExistsAndValid("/assets/video/napoleon_30s_cut.mp4"))
        ) {
          fallbacks[u] = "/assets/video/napoleon_30s_cut.mp4";
          results[u] = true;
        } else if (
          u.includes("zyvoriq_mumbai_penthouse_master.mp4") &&
          (await checkFileExistsAndValid("/assets/video/coronation_30s_cut.mp4"))
        ) {
          fallbacks[u] = "/assets/video/coronation_30s_cut.mp4";
          results[u] = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      environment:
        process.env.RAILWAY_ENVIRONMENT_NAME ||
        process.env.NODE_ENV ||
        "development",
      verified: results,
      fallbacks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to verify assets" },
      { status: 500 }
    );
  }
}
