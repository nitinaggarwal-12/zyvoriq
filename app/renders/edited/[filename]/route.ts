import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { getDatabase, getPostgresPool } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildColorGradingFilter(grading?: string): string {
  switch (grading) {
    case "cyberpunk_neon":
      return "eq=contrast=1.18:saturation=1.38:brightness=0.02,colorbalance=rs=-0.08:gs=0.04:bs=0.18:rh=0.12:gh=-0.04:bh=0.15";
    case "golden_hour_warm":
      return "eq=contrast=1.08:saturation=1.22:brightness=0.03,colorbalance=rs=0.14:gs=0.06:bs=-0.12:rh=0.10:gh=0.04:bh=-0.08";
    case "mediterranean_sunlit":
      return "eq=contrast=1.12:saturation=1.28:brightness=0.04,colorbalance=rs=0.06:gs=0.05:bs=0.08";
    case "bollywood_royal":
      return "eq=contrast=1.16:saturation=1.34:gamma=1.04,colorbalance=rs=0.12:gs=0.02:bs=-0.05:rh=0.15:gh=0.05:bh=-0.05";
    case "vintage_film":
      return "eq=contrast=1.06:saturation=0.82:brightness=0.02,colorbalance=rs=0.08:gs=0.04:bs=-0.06";
    default:
      return "";
  }
}

function findBaseMasterVideo(reelId: string): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "renders", "yt", reelId, "master_hybrid.mp4"),
    path.join(process.cwd(), "public", "renders", "yt", reelId, "master.mp4"),
    path.join(process.cwd(), "public", "renders", "yt", reelId, "master_native.mp4"),
    path.join(process.cwd(), "public", "assets", "video", "studio1_e2e00945.mp4"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }
  return null;
}

async function selfHealEditedRender(filename: string): Promise<string | null> {
  try {
    const cleanName = path.basename(filename);
    // Extract reelId from patterns like:
    // yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069_director_1789390165983.mp4
    // yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069_edit_1789390165983_abc.mp4
    const reelId = cleanName.split(/_director_|_edit_/)[0];
    if (!reelId) return null;

    const baseMaster = findBaseMasterVideo(reelId);
    if (!baseMaster) return null;

    const outDir = path.join(process.cwd(), "scratch", "renders", "edited");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, cleanName);

    // Look up version metadata in DB if available
    let colorGrading = "none";
    let sfxPreset = "none";
    try {
      const pg = getPostgresPool();
      let manifest: any = null;
      if (pg) {
        const res = await pg.query(`SELECT manifest_json FROM yt_productions WHERE id = $1`, [reelId]);
        if (res.rows.length > 0) {
          manifest = typeof res.rows[0].manifest_json === "string" ? JSON.parse(res.rows[0].manifest_json) : res.rows[0].manifest_json;
        }
      } else {
        const db = getDatabase();
        const row = db.prepare(`SELECT manifest_json FROM yt_productions WHERE id = ?`).get(reelId) as any;
        if (row) {
          manifest = typeof row.manifest_json === "string" ? JSON.parse(row.manifest_json) : row.manifest_json;
        }
      }
      if (manifest && Array.isArray(manifest.versions)) {
        const ver = manifest.versions.find((v: any) => (v.videoUrl || v.url || "").includes(cleanName));
        if (ver?.directionSummary) {
          colorGrading = ver.directionSummary.colorGrading || "none";
          sfxPreset = ver.directionSummary.sfxPreset || "none";
        }
      }
    } catch (e) {
      console.warn("[renders/edited] DB lookup note during self-heal:", e);
    }

    const gradingFilter = buildColorGradingFilter(colorGrading);
    const sfxMap: Record<string, string> = {
      pool_splash: path.join(process.cwd(), "public", "assets", "audio", "sfx", "pool_party_splash.mp3"),
      crowd_cheer: path.join(process.cwd(), "public", "assets", "audio", "sfx", "club_crowd_cheer.mp3"),
      ocean_waves: path.join(process.cwd(), "public", "assets", "audio", "sfx", "coastal_ocean_breeze.mp3"),
      vinyl_rain: path.join(process.cwd(), "public", "assets", "audio", "sfx", "vinyl_rain_ambiance.mp3"),
    };
    const sfxFile = sfxPreset !== "none" && sfxMap[sfxPreset] && fs.existsSync(sfxMap[sfxPreset]) ? sfxMap[sfxPreset] : null;

    if (!gradingFilter && !sfxFile) {
      // Pure stream copy of base master
      fs.copyFileSync(baseMaster, outPath);
      return outPath;
    }

    const args: string[] = ["-y", "-i", baseMaster];
    if (sfxFile) {
      args.push("-stream_loop", "-1", "-i", sfxFile);
    }

    const filterParts: string[] = [];
    if (gradingFilter) {
      filterParts.push(`[0:v]${gradingFilter}[vout]`);
    }
    if (sfxFile) {
      filterParts.push(`[0:a]volume=1.0[a0];[1:a]volume=0.45[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]`);
    } else {
      filterParts.push(`[0:a]anull[aout]`);
    }

    args.push(
      "-filter_complex",
      filterParts.join(";"),
      "-map",
      gradingFilter ? "[vout]" : "0:v",
      "-map",
      "[aout]",
      "-c:v",
      gradingFilter ? "libx264" : "copy",
      ...(gradingFilter ? ["-preset", "ultrafast", "-crf", "23"] : []),
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      outPath
    );

    execFileSync("ffmpeg", args, { stdio: "pipe" });
    if (fs.existsSync(outPath)) {
      return outPath;
    }
  } catch (err) {
    console.warn("[renders/edited] FFmpeg self-heal fallback to base master:", err);
  }
  // Fallback directly to base master so video playback never 404s
  const cleanName = path.basename(filename);
  const reelId = cleanName.split(/_director_|_edit_/)[0];
  return reelId ? findBaseMasterVideo(reelId) : null;
}

async function handleRequest(req: NextRequest, context: { params: Promise<{ filename: string }> }, method: "GET" | "HEAD") {
  const { filename } = await context.params;
  const cleanName = path.basename(decodeURIComponent(filename));

  const candidatePaths = [
    path.join(process.cwd(), "scratch", "renders", "edited", cleanName),
    path.join(process.cwd(), "public", "renders", "edited", cleanName),
  ];

  let filePath: string | null = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    filePath = await selfHealEditedRender(cleanName);
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse("Edited render not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const size = stat.size;

  const range = req.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
      let end = match[2] ? Number(match[2]) : size - 1;
      end = Math.min(end, size - 1);
      if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && start < size) {
        const chunkLen = end - start + 1;
        if (method === "HEAD") {
          return new NextResponse(null, {
            status: 206,
            headers: {
              "Content-Type": "video/mp4",
              "Content-Range": `bytes ${start}-${end}/${size}`,
              "Content-Length": String(chunkLen),
              "Accept-Ranges": "bytes",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
        const buf = Buffer.alloc(chunkLen);
        const fd = fs.openSync(filePath, "r");
        try {
          fs.readSync(fd, buf, 0, chunkLen, start);
        } finally {
          fs.closeSync(fd);
        }
        return new NextResponse(new Uint8Array(buf), {
          status: 206,
          headers: {
            "Content-Type": "video/mp4",
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Content-Length": String(chunkLen),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }
  }

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const fullData = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(fullData), {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ filename: string }> }) {
  return handleRequest(req, context, "GET");
}

export async function HEAD(req: NextRequest, context: { params: Promise<{ filename: string }> }) {
  return handleRequest(req, context, "HEAD");
}
