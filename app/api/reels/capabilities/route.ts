import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getAssetStoreCapability } from "@/lib/reel/assetStore";
import { getPostgresPool } from "@/lib/db/client";

const execFileAsync = promisify(execFile);

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function binaryAvailable(name: string) {
  try {
    await execFileAsync(name, ["-version"], { timeout: 5000, maxBuffer: 128 * 1024 });
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const [ffmpeg, ffprobe] = await Promise.all([binaryAvailable("ffmpeg"), binaryAvailable("ffprobe")]);
  const storage = getAssetStoreCapability();
  const gemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const postgres = Boolean(getPostgresPool());

  const blockers: string[] = [];
  if (!storage.durable) blockers.push("durable_asset_storage");
  if (!gemini) blockers.push("gemini_api_key");
  if (!ffmpeg) blockers.push("ffmpeg");
  if (!ffprobe) blockers.push("ffprobe");

  return NextResponse.json({
    success: true,
    productionReady: blockers.length === 0,
    capabilities: {
      persistence: postgres ? "postgres" : "sqlite-fallback",
      durableAssetStorage: storage,
      geminiConfigured: gemini,
      ffmpeg,
      ffprobe,
    },
    blockers,
  }, { headers: { "Cache-Control": "no-store" } });
}
