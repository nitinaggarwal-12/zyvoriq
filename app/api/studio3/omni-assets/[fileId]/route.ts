import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const API_BASE = "https://generativelanguage.googleapis.com";
function apiKey() { return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""; }

export async function GET(req: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await context.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) return NextResponse.json({ success: false, error: "Invalid Omni file id" }, { status: 400 });
    const key = apiKey(); if (!key) return NextResponse.json({ success: false, error: "Gemini API key unavailable" }, { status: 503 });
    const upstream = await fetch(`${API_BASE}/v1beta/files/${encodeURIComponent(fileId)}:download?alt=media&key=${encodeURIComponent(key)}`, {
      headers: req.headers.get("range") ? { Range: req.headers.get("range")! } : undefined,
      cache: "no-store",
    });
    if (!upstream.ok && upstream.status !== 206) return NextResponse.json({ success: false, error: `Omni video unavailable (${upstream.status}); generated files expire after 48 hours` }, { status: upstream.status === 404 ? 410 : 502 });
    const headers = new Headers();
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) { const value = upstream.headers.get(name); if (value) headers.set(name, value); }
    headers.set("Cache-Control", "private, max-age=60");
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to stream Omni asset" }, { status: 500 });
  }
}
