import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { studio3Service } from "@/lib/studio3/service";
import type { Studio3OmniMode, Studio3OmniOption } from "@/lib/studio3/planner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = "https://generativelanguage.googleapis.com";
const MODEL = "gemini-omni-1.1-flash";
function apiKey() { return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""; }
function videoUri(node: any): string | null {
  if (!node || typeof node !== "object") return null;
  if (node.type === "video" && typeof node.uri === "string") return node.uri;
  if (node.output_video && typeof node.output_video.uri === "string") return node.output_video.uri;
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const child of value) { const found = videoUri(child); if (found) return found; }
    else if (value && typeof value === "object") { const found = videoUri(value); if (found) return found; }
  }
  return null;
}
function fileIdFromUri(uri: string) {
  const match = uri.match(/files\/([a-zA-Z0-9_-]+)/); return match?.[1] || null;
}
async function waitForFile(fileId: string, key: string) {
  for (let i = 0; i < 36; i++) {
    const response = await fetch(`${API_BASE}/v1beta/files/${encodeURIComponent(fileId)}`, { headers: { "x-goog-api-key": key }, cache: "no-store" });
    const json = await response.json();
    if (!response.ok) throw new Error(`Omni output status failed (${response.status})`);
    const state = String(json.state?.name || json.state || "").toUpperCase();
    if (state === "ACTIVE") return;
    if (state === "FAILED") throw new Error("Gemini Omni output processing failed");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error("Gemini Omni output is still processing; try again later");
}
function defaultInstruction(mode: Studio3OmniMode) {
  if (mode === "REPAIR") return "Repair only the visible defect while preserving the same presenter identity, face, hair, wardrobe, camera framing, motion, timing, environment and all unaffected details. Do not introduce new people, props, electronics, text or logos. Do not intentionally alter speech or voice.";
  if (mode === "EXTEND") return "Extend this video naturally at the end. Preserve the same person, wardrobe, location, lighting, camera language and motion continuity. Continue the existing scene without introducing a new person or unrelated props. Do not add new dialogue.";
  return "Apply only the requested visual edit. Preserve the presenter identity, timing, camera movement and every element not explicitly requested to change. Do not intentionally alter speech or voice.";
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id.startsWith("studio3_")) return NextResponse.json({ success: false, error: "Omni editing is isolated to Studio3 productions" }, { status: 403 });
    const key = apiKey(); if (!key) return NextResponse.json({ success: false, error: "Gemini API key is required for Omni" }, { status: 503 });
    const body = await req.json();
    const shotId = String(body.shotId || "");
    const mode = String(body.mode || "REPAIR").toUpperCase() as Studio3OmniMode;
    if (!["EDIT", "REPAIR", "EXTEND"].includes(mode)) return NextResponse.json({ success: false, error: "mode must be EDIT, REPAIR, or EXTEND" }, { status: 400 });
    const production = await studio3Service.get(id); if (!production) return NextResponse.json({ success: false, error: "Studio3 production not found" }, { status: 404 });
    const expectedRevision = body.expectedRevision === undefined ? production.revision : Number(body.expectedRevision);
    if (expectedRevision !== production.revision) return NextResponse.json({ success: false, error: `Production changed concurrently (expected revision ${expectedRevision}, found ${production.revision})` }, { status: 409 });
    const shot = production.manifest.shots.find(item => item.id === shotId); if (!shot?.asset?.videoUrl) return NextResponse.json({ success: false, error: "Generate this clip before using Omni" }, { status: 409 });
    if (Number(shot.asset.actualDurationSec || shot.generationDurationSec || 0) > 10.05) return NextResponse.json({ success: false, error: "Omni uploaded-video editing and extension requires an input clip of 10 seconds or less" }, { status: 400 });

    const source = new URL(shot.asset.videoUrl, req.nextUrl.origin);
    const sourceResponse = await fetch(source, { cache: "no-store" });
    if (!sourceResponse.ok) throw new Error(`Could not load source clip (${sourceResponse.status})`);
    const bytes = Buffer.from(await sourceResponse.arrayBuffer());
    if (bytes.length > 90 * 1024 * 1024) throw new Error("Source clip is too large for inline Omni editing");

    const userPrompt = String(body.prompt || "").trim();
    const instruction = [defaultInstruction(mode), userPrompt ? `Requested change: ${userPrompt}` : ""].filter(Boolean).join("\n");
    const payload: any = {
      model: MODEL,
      input: [{ type: "user_input", content: [
        { type: "video", mime_type: "video/mp4", data: bytes.toString("base64") },
        { type: "text", text: instruction },
      ] }],
      response_format: { type: "video", delivery: "uri", resolution: "720p" },
    };
    if (mode === "EXTEND") payload.generation_config = { video_config: { task: "extend" } };

    const response = await fetch(`${API_BASE}/v1beta/interactions`, {
      method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store",
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`Gemini Omni ${mode.toLowerCase()} failed (${response.status}): ${json?.error?.message || "request rejected"}`);
    const uri = videoUri(json); if (!uri) throw new Error("Gemini Omni completed without a video URI");
    const fileId = fileIdFromUri(uri); if (!fileId) throw new Error("Gemini Omni returned an unrecognized video URI");
    await waitForFile(fileId, key);

    const createdAt = new Date(); const expiresAt = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
    const option: Studio3OmniOption = {
      id: `omni_${crypto.randomUUID()}`, mode, prompt: instruction, sourceVideoUrl: shot.asset.videoUrl,
      videoUrl: `/api/studio3/omni-assets/${encodeURIComponent(fileId)}`, googleFileId: fileId,
      interactionId: typeof json.id === "string" ? json.id : undefined, model: MODEL,
      createdAt: createdAt.toISOString(), expiresAt: expiresAt.toISOString(),
    };
    const updated = await studio3Service.addOmniOption(id, shotId, option, production.revision);
    return NextResponse.json({ success: true, production: updated, option, temporary: true, expiresAt: option.expiresAt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Studio3 Omni operation failed" }, { status: 500 });
  }
}
