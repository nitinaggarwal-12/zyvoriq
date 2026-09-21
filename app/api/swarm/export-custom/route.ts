import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { appendLibraryAssets } from "../library/route";

export const runtime = "nodejs";

function buildAtempoChain(speed: number): string {
  const clamped = Math.max(0.5, Math.min(2.0, Number(speed.toFixed(4))));
  return `atempo=${clamped}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const part1Speed = Math.max(0.5, Math.min(2.0, Number(body.part1Speed ?? 1.0)));
    const part2Speed = Math.max(0.5, Math.min(2.0, Number(body.part2Speed ?? 1.0)));
    const part1In = Math.max(0, Math.min(29.9, Number(body.part1In ?? 0)));
    const part1Out = Math.max(part1In + 0.1, Math.min(30.0, Number(body.part1Out ?? 30.0)));
    const part2In = Math.max(0, Math.min(29.9, Number(body.part2In ?? 0)));
    const part2Out = Math.max(part2In + 0.1, Math.min(30.0, Number(body.part2Out ?? 30.0)));

    const rootDir = process.cwd();
    const assetsDir = path.join(rootDir, "public/assets/swarm/masterB_v2");
    const act1Src = path.join(assetsDir, "act1_pool_villa_30s.mp4");
    const act2Src = path.join(assetsDir, "act2_superyacht_deck_30s.mp4");

    const stamp = Date.now();
    const outFileName = `masterB_v2_custom_p1_${part1Speed.toFixed(2)}x_p2_${part2Speed.toFixed(2)}x.mp4`;
    const outPath = path.join(assetsDir, outFileName);

    const p1Pts = (1 / part1Speed).toFixed(6);
    const p2Pts = (1 / part2Speed).toFixed(6);
    const p1Atempo = buildAtempoChain(part1Speed);
    const p2Atempo = buildAtempoChain(part2Speed);

    const filterComplex = [
      `[0:v]trim=start=${part1In}:end=${part1Out},setpts=${p1Pts}*(PTS-STARTPTS),fps=24/1[v1]`,
      `[0:a]atrim=start=${part1In}:end=${part1Out},asetpts=PTS-STARTPTS,${p1Atempo},aresample=48000[a1]`,
      `[1:v]trim=start=${part2In}:end=${part2Out},setpts=${p2Pts}*(PTS-STARTPTS),fps=24/1[v2]`,
      `[1:a]atrim=start=${part2In}:end=${part2Out},asetpts=PTS-STARTPTS,${p2Atempo},aresample=48000[a2]`,
      `[v1][a1][v2][a2]concat=n=2:v=1:a=1[vout][aout]`,
    ].join(";");

    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        act1Src,
        "-i",
        act2Src,
        "-filter_complex",
        filterComplex,
        "-map",
        "[vout]",
        "-map",
        "[aout]",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "17",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "24/1",
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
        outPath,
      ],
      { stdio: "inherit" }
    );

    const stat = fs.statSync(outPath);
    const effectiveSec = Number(
      ((part1Out - part1In) / part1Speed + (part2Out - part2In) / part2Speed).toFixed(2)
    );

    appendLibraryAssets([
      {
        id: `baked_${part1Speed.toFixed(2)}_${part2Speed.toFixed(2)}_${stamp}`,
        projectId: "proj_master_b_v2",
        projectTitle: "Master B v2 — Ishq Tera Electric (Bollywood 60s)",
        title: `Custom Speed Master (P1: ${part1Speed.toFixed(2)}x | P2: ${part2Speed.toFixed(2)}x)`,
        subtitle: `Trim P1 [${part1In.toFixed(1)}s–${part1Out.toFixed(1)}s] + P2 [${part2In.toFixed(
          1
        )}s–${part2Out.toFixed(1)}s] • Effective ${effectiveSec}s`,
        assetType: "baked_custom",
        genre: "Bollywood Hindi Pop",
        durationSec: effectiveSec,
        frames: Math.round(effectiveSec * 24),
        fps: "24/1 CFR",
        audioSpec: "48,000 Hz Stereo AAC",
        speedMultiplier: Number(((part1Speed + part2Speed) / 2).toFixed(2)),
        wardrobe: "Act I: Crimson-Rose & Gold Lehenga | Act II: Royal Emerald-Sapphire Couture",
        location: "Act I: Sunlit Cliffside Pool Villa | Act II: Twilight Superyacht Deck",
        promptSummary: `Custom baked export with Part 1 @ ${part1Speed.toFixed(
          2
        )}x and Part 2 @ ${part2Speed.toFixed(2)}x.`,
        src: `/assets/swarm/masterB_v2/${outFileName}`,
        createdAt: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      ok: true,
      url: `/assets/swarm/masterB_v2/${outFileName}?t=${stamp}`,
      fileName: outFileName,
      sizeBytes: stat.size,
      part1Speed,
      part2Speed,
      part1Trim: [part1In, part1Out],
      part2Trim: [part2In, part2Out],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
