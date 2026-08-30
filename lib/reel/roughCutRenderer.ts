import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getAssetFilePath, writeAsset } from "./assetStore";
import { probeVideoBuffer } from "./mediaProbe";
import type { ReelProductionManifest } from "./types";

const execFileAsync = promisify(execFile);

export async function renderNarratedRoughCut(manifest: ReelProductionManifest) {
  if (manifest.status !== "ROUGH_CUT_READY") throw new Error(`Rough-cut render requires ROUGH_CUT_READY; production is ${manifest.status}`);
  if (!manifest.audio.narrationUrl || manifest.audio.timingSource !== "actual-alignment") {
    throw new Error("Rough-cut render requires persisted, actually aligned narration");
  }
  if (!manifest.shots.length || manifest.shots.some(s => !s.asset?.videoUrl)) {
    throw new Error("Rough-cut render requires every shot source asset");
  }
  if (manifest.shots.some(s => s.transitionOut.durationSec > 0)) {
    throw new Error("Non-zero transition overlaps are not allowed until source-handle accounting is enabled");
  }

  const videoPaths = manifest.shots.map(s => getAssetFilePath(s.asset!.videoUrl));
  const narrationPath = getAssetFilePath(manifest.audio.narrationUrl);
  const outputPath = path.join(os.tmpdir(), `zyvoriq-rough-${crypto.randomUUID()}.mp4`);

  const args: string[] = ["-y"];
  for (const videoPath of videoPaths) args.push("-i", videoPath);
  args.push("-i", narrationPath);

  const filters: string[] = [];
  manifest.shots.forEach((shot, index) => {
    filters.push(
      `[${index}:v]trim=start=${shot.trimInSec}:end=${shot.trimOutSec},` +
      `setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,` +
      `crop=1080:1920,setsar=1,fps=30[v${index}]`
    );
  });
  const videoInputs = manifest.shots.map((_, index) => `[v${index}]`).join("");
  filters.push(`${videoInputs}concat=n=${manifest.shots.length}:v=1:a=0[vout]`);
  const narrationIndex = manifest.shots.length;
  filters.push(`[${narrationIndex}:a]atrim=duration=${manifest.plannedDurationSec},asetpts=PTS-STARTPTS,aresample=48000[aout]`);

  args.push(
    "-filter_complex", filters.join(";"),
    "-map", "[vout]",
    "-map", "[aout]",
    "-t", String(manifest.plannedDurationSec),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    outputPath
  );

  try {
    try {
      await execFileAsync("ffmpeg", args, { timeout: 300000, maxBuffer: 4 * 1024 * 1024 });
    } catch (error: any) {
      if (error?.code === "ENOENT") throw new Error("ffmpeg is required for Reel assembly but is not installed");
      throw new Error(`FFmpeg rough-cut render failed: ${String(error?.stderr || error?.message || error).slice(0, 1200)}`);
    }

    const buffer = await fs.readFile(outputPath);
    const probe = await probeVideoBuffer(buffer);
    if (Math.abs(probe.durationSec - manifest.plannedDurationSec) > 0.25) {
      throw new Error(`Rendered rough cut is ${probe.durationSec}s; canonical timeline is ${manifest.plannedDurationSec}s`);
    }
    if (probe.width !== 1080 || probe.height !== 1920) {
      throw new Error(`Rendered rough cut is ${probe.width || "?"}x${probe.height || "?"}; expected 1080x1920`);
    }

    const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
    const asset = await writeAsset(`reels/${manifest.id}/renders/narrated-rough-${digest}.mp4`, buffer);
    return {
      assetKey: asset.key,
      output: {
        videoUrl: asset.url,
        actualDurationSec: probe.durationSec,
        kind: "narrated-rough-cut" as const,
        codec: probe.codec,
        width: probe.width,
        height: probe.height,
        frameRate: probe.frameRate,
        renderedAt: new Date().toISOString(),
      },
    };
  } finally {
    try { await fs.unlink(outputPath); } catch {}
  }
}
