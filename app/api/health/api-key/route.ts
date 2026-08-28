import { NextResponse } from "next/server";

export async function GET() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    "";

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message: "GEMINI_API_KEY / GOOGLE_API_KEY is not configured in environment variables."
    });
  }

  try {
    const testRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview?key=${apiKey}`
    );
    if (testRes.ok) {
      return NextResponse.json({
        ok: true,
        configured: true,
        model: "models/veo-3.1-fast-generate-preview",
        tier: "Veo 3.1 Fast Diffusion Cluster Active",
        ttsModel: "gemini-2.5-flash-preview-tts"
      });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return NextResponse.json({
        ok: false,
        configured: true,
        message: errData.error?.message || `API returned status ${testRes.status}`
      });
    }
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      configured: true,
      message: e.message
    });
  }
}
