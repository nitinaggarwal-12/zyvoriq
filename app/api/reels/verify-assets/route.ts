import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    // Check both public/assets/ and scratch/ or data/ directories
    const candidatePublic = path.join(process.cwd(), "public", "assets", rel);
    if (fs.existsSync(candidatePublic)) return candidatePublic;

    const candidateScratch = path.join(process.cwd(), "scratch", rel);
    if (fs.existsSync(candidateScratch)) return candidateScratch;

    return candidatePublic;
  }

  return null;
}

function checkFileExistsAndValid(webUrl: string): boolean {
  if (!webUrl || typeof webUrl !== "string") return false;
  if (webUrl.startsWith("http://") || webUrl.startsWith("https://")) {
    // External URLs assumed valid unless internal railway hostname
    if (webUrl.includes(".railway.internal")) return false;
    return true;
  }
  if (webUrl.startsWith("data:")) return true;

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
    for (const u of urls) {
      if (u && typeof u === "string") {
        results[u] = checkFileExistsAndValid(u);
      }
    }

    // Also provide environment fallback mappings if a large master file is missing
    // but a 30s master cut exists on disk in this environment (e.g. Railway container)
    const fallbacks: Record<string, string> = {};
    for (const u of urls) {
      if (u && !results[u]) {
        if (u.includes("napoleon_180s_master.mp4") && checkFileExistsAndValid("/assets/video/napoleon_30s_cut.mp4")) {
          fallbacks[u] = "/assets/video/napoleon_30s_cut.mp4";
          results[u] = true;
        } else if (u.includes("zyvoriq_mumbai_penthouse_master.mp4") && checkFileExistsAndValid("/assets/video/coronation_30s_cut.mp4")) {
          fallbacks[u] = "/assets/video/coronation_30s_cut.mp4";
          results[u] = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || "development",
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
