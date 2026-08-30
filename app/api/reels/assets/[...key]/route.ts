import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/reel/assetStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function contentType(key: string) {
  if (key.endsWith(".wav")) return "audio/wav";
  if (key.endsWith(".mp3")) return "audio/mpeg";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    const assetKey = key.map(decodeURIComponent).join("/");
    const data = await readAsset(assetKey);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType(assetKey),
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(data.length),
      },
    });
  } catch (error: any) {
    const missing = error?.code === "ENOENT";
    return NextResponse.json({ success: false, error: missing ? "Asset not found" : (error?.message || "Failed to read asset") }, { status: missing ? 404 : 500 });
  }
}
