import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export interface SpliceSegmentInput {
  clipId: string;
  label?: string;
  src: string;
  startSec: number;
  endSec: number;
  speed?: number;
}

function sqlEscape(val: string): string {
  return val.replace(/'/g, "''");
}

async function registerSplicedEntityInDb(opts: {
  id: string;
  entityType: "reel" | "clip";
  title: string;
  subtitle: string;
  assetSrc: string;
  parentId: string;
  metadata: Record<string, unknown>;
}) {
  try {
    const dbDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    const dbPath = path.join(dbDir, "studio_entities.db");
    const slug = opts.id.toLowerCase();
    const canonicalUrl = `/entity/${opts.id}`;
    const metaJson = JSON.stringify(opts.metadata);
    const createdAt = new Date().toISOString();

    const sql = `
      CREATE TABLE IF NOT EXISTS studio_entities (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        slug TEXT NOT NULL,
        canonical_url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        parent_id TEXT,
        asset_src TEXT,
        metadata_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      INSERT OR REPLACE INTO studio_entities (
        id, entity_type, slug, canonical_url, title, subtitle, parent_id, asset_src, metadata_json, created_at
      ) VALUES (
        '${sqlEscape(opts.id)}',
        '${sqlEscape(opts.entityType)}',
        '${sqlEscape(slug)}',
        '${sqlEscape(canonicalUrl)}',
        '${sqlEscape(opts.title)}',
        '${sqlEscape(opts.subtitle)}',
        '${sqlEscape(opts.parentId)}',
        '${sqlEscape(opts.assetSrc)}',
        '${sqlEscape(metaJson)}',
        '${sqlEscape(createdAt)}'
      );
    `;
    await execFileAsync("sqlite3", [dbPath, sql]);
  } catch (err) {
    console.warn("DB entity registration warning:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const segments: SpliceSegmentInput[] = Array.isArray(body.segments)
      ? body.segments
      : body.src
      ? [
          {
            clipId: body.clipId || "CLP-CUSTOM",
            label: body.label || "Sub-Clip Cut",
            src: body.src,
            startSec: Number(body.startSec ?? 0),
            endSec: Number(body.endSec ?? 10),
            speed: Number(body.speed ?? 1.0),
          },
        ]
      : [];

    if (!segments.length) {
      return NextResponse.json(
        { error: "At least one segment with src, startSec, and endSec is required." },
        { status: 400 }
      );
    }

    const outDir = path.join(process.cwd(), "public", "assets", "swarm", "generated");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const stamp = Date.now().toString(36).toUpperCase();
    const isMulti = segments.length > 1;
    const entityId = isMulti ? `ZYV-REEL-SPL${stamp.slice(-5)}` : `ZYV-CLIP-SPL${stamp.slice(-5)}`;
    const outFileName = `${entityId.toLowerCase()}.mp4`;
    const outAbsPath = path.join(outDir, outFileName);
    const publicUrl = `/assets/swarm/generated/${outFileName}`;

    const tempPartFiles: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const cleanRelSrc = seg.src.replace(/^\//, "");
      const inAbsPath = path.join(process.cwd(), "public", cleanRelSrc);
      if (!fs.existsSync(inAbsPath)) {
        return NextResponse.json(
          { error: `Source video not found on disk: ${seg.src}` },
          { status: 404 }
        );
      }

      const startSec = Math.max(0, Number(seg.startSec || 0));
      const endSec = Math.max(startSec + 0.25, Number(seg.endSec || startSec + 5));
      const speed = Math.min(2.0, Math.max(0.5, Number(seg.speed || 1.0)));

      const partPath =
        segments.length === 1
          ? outAbsPath
          : path.join(outDir, `_tmp_splice_${stamp}_${i}.mp4`);
      if (segments.length > 1) tempPartFiles.push(partPath);

      const filterArgs: string[] = [];
      if (Math.abs(speed - 1.0) > 0.005) {
        const ptsMult = (1 / speed).toFixed(4);
        filterArgs.push(
          "-filter_complex",
          `[0:v]setpts=${ptsMult}*PTS[v];[0:a]atempo=${speed.toFixed(2)}[a]`,
          "-map",
          "[v]",
          "-map",
          "[a]"
        );
      }

      await execFileAsync("ffmpeg", [
        "-y",
        "-ss",
        startSec.toFixed(2),
        "-to",
        endSec.toFixed(2),
        "-i",
        inAbsPath,
        ...filterArgs,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-r",
        "24",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        partPath,
      ]);
    }

    // If multi-segment splice, concat all trimmed child sub-clips seamlessly
    if (segments.length > 1) {
      const listFilePath = path.join(outDir, `_tmp_concat_${stamp}.txt`);
      const listContent = tempPartFiles.map((p) => `file '${p}'`).join("\n");
      fs.writeFileSync(listFilePath, listContent, "utf8");

      await execFileAsync("ffmpeg", [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listFilePath,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        outAbsPath,
      ]);

      try {
        fs.unlinkSync(listFilePath);
        for (const p of tempPartFiles) {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      } catch {
        // ignore temp cleanup errors
      }
    }

    const totalDurationSec = segments.reduce((acc, s) => {
      const spd = Math.min(2.0, Math.max(0.5, Number(s.speed || 1.0)));
      return acc + Math.max(0.25, (Number(s.endSec) - Number(s.startSec)) / spd);
    }, 0);

    const summaryLabel = segments
      .map(
        (s) =>
          `${s.clipId} [${Number(s.startSec).toFixed(1)}s–${Number(s.endSec).toFixed(1)}s]`
      )
      .join(" + ");

    await registerSplicedEntityInDb({
      id: entityId,
      entityType: isMulti ? "reel" : "clip",
      title: isMulti
        ? `Custom Spliced Reel (${segments.length} Sub-Clips • ${totalDurationSec.toFixed(1)}s)`
        : `Custom Trimmed Sub-Clip • ${summaryLabel}`,
      subtitle: summaryLabel,
      assetSrc: publicUrl,
      parentId: "ZYV-REEL-MBV260S1",
      metadata: {
        segments,
        totalDurationSec: Number(totalDurationSec.toFixed(2)),
        audioSpec: "48,000 Hz Stereo Native Preserved",
        fps: "24/1 CFR",
      },
    });

    return NextResponse.json({
      ok: true,
      entityId,
      canonicalUrl: `/entity/${entityId}`,
      src: publicUrl,
      durationSec: Number(totalDurationSec.toFixed(2)),
      summary: summaryLabel,
      segmentCount: segments.length,
    });
  } catch (err: unknown) {
    console.error("Instant Splice API Error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to splice sub-clip.",
      },
      { status: 500 }
    );
  }
}
