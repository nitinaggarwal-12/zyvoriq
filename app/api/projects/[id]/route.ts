import { NextRequest, NextResponse } from "next/server";
import {
  createProjectVersion,
  deleteProjectState,
  listProjectVersions,
  loadProjectState,
  persistProjectState,
} from "@/lib/project-store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await loadProjectState(id);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, project });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patch = await req.json();
    const current = (await loadProjectState<Record<string, unknown>>(id)) || { id };
    const next = {
      ...current,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await persistProjectState(id, next, {
      status: String(next.status || "draft"),
      title: String(next.title || next.titleDraft || "Untitled project"),
    });
    if (patch.createVersion === true) {
      await createProjectVersion(id, next);
    }
    return NextResponse.json({ ok: true, project: next });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update project";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteProjectState(id);
  return NextResponse.json({ ok: true, deletedId: id });
}
