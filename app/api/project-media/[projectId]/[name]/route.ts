import { NextRequest, NextResponse } from "next/server";
import { loadProjectMedia } from "@/lib/project-store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; name: string }> }
) {
  const { projectId, name } = await params;
  const media = await loadProjectMedia(projectId, name);
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }
  return new NextResponse(media.bytes, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    },
  });
}
