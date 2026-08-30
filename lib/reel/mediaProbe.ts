import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function probeVideoBuffer(buffer: Buffer) {
  if (!buffer.length) throw new Error("Cannot probe empty video buffer");
  const tempPath = path.join(os.tmpdir(), `zyvoriq-probe-${crypto.randomUUID()}.mp4`);
  try {
    await fs.writeFile(tempPath, buffer);
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration:stream=codec_name,width,height,r_frame_rate",
      "-of", "json",
      tempPath,
    ], { timeout: 20000, maxBuffer: 1024 * 1024 });
    const parsed = JSON.parse(stdout);
    const durationSec = Number(parsed?.format?.duration);
    if (!Number.isFinite(durationSec) || durationSec <= 0) throw new Error("ffprobe returned no valid duration");
    const videoStream = Array.isArray(parsed?.streams) ? parsed.streams.find((s: any) => Number(s.width) > 0 && Number(s.height) > 0) : undefined;
    return {
      durationSec: Number(durationSec.toFixed(3)),
      codec: videoStream?.codec_name ? String(videoStream.codec_name) : undefined,
      width: Number(videoStream?.width || 0) || undefined,
      height: Number(videoStream?.height || 0) || undefined,
      frameRate: videoStream?.r_frame_rate ? String(videoStream.r_frame_rate) : undefined,
    };
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      throw new Error("ffprobe is required to verify actual generated video duration but is not installed");
    }
    throw error;
  } finally {
    try { await fs.unlink(tempPath); } catch {}
  }
}
