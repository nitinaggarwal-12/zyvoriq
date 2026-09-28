import { NextRequest, NextResponse } from "next/server";
import {
  listProjectStates,
  persistProjectState,
} from "@/lib/project-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 100);
    const projects = await listProjectStates(Math.max(1, Math.min(limit, 500)));
    return NextResponse.json({ ok: true, projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list projects";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body.id || `project_${Date.now()}`);
    const now = new Date().toISOString();
    const state = {
      id,
      title: String(body.title || "Untitled project"),
      format: String(body.format || "reel"),
      stage: String(body.stage || "brief"),
      status: String(body.status || "draft"),
      brief: String(body.brief || ""),
      country: String(body.country || "United States"),
      language: String(body.language || "English"),
      platform: String(body.platform || ""),
      referenceMedia: Array.isArray(body.referenceMedia) ? body.referenceMedia : [],
      selectedCharacterId: body.selectedCharacterId || "",
      selectedLocationId: body.selectedLocationId || "",
      selectedWardrobeId: body.selectedWardrobeId || "",
      selectedScene2LocationId: body.selectedScene2LocationId || "",
      titleDraft: body.titleDraft || body.title || "Untitled project",
      genre: body.genre || "",
      bpm: Number(body.bpm || 120),
      act1Prompt: body.act1Prompt || "",
      act2Prompt: body.act2Prompt || "",
      review: body.review || null,
      publish: body.publish || null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };
    await persistProjectState(id, state, { status: state.status, title: state.title });
    return NextResponse.json({ ok: true, project: state }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
