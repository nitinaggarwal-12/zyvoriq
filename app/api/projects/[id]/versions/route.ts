import { NextRequest, NextResponse } from "next/server";
import { listProjectVersions } from "@/lib/project-store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const versions = await listProjectVersions(id);
  return NextResponse.json({ ok: true, versions });
}
