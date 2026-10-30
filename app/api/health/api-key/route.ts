import { NextRequest, NextResponse } from "next/server";

function loadConfiguredApiKey(): string {
  const envKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  return envKey && envKey.trim() ? envKey.trim() : "";
}

export async function GET(req: NextRequest) {
  const cookieKey = req.cookies.get("zyvoriq_gemini_api_key")?.value;
  const headerKey = req.headers.get("x-gemini-api-key");
  const apiKey = cookieKey || headerKey || loadConfiguredApiKey();

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        source: "none",
        message: "GEMINI_API_KEY / GOOGLE_API_KEY is not configured."
      },
      { status: 503 }
    );
  }

  const source = cookieKey ? "browser_cookie" : headerKey ? "request_header" : "server_env";

  try {
    const testRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 4 }
        }),
        signal: AbortSignal.timeout(5000)
      }
    );

    if (testRes.ok) {
      return NextResponse.json({
        ok: true,
        configured: true,
        source,
        model: "models/gemini-2.5-flash",
        tier: "Gemini 2.5 Flash / Pro, Veo 3.0 & Gemini 2.5 TTS Active",
        ttsModel: "gemini-2.5-flash-preview-tts"
      });
    }

    return NextResponse.json(
      {
        ok: false,
        configured: false,
        source,
        status: testRes.status,
        message: `Gemini API key validation failed with HTTP ${testRes.status}.`
      },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        source,
        message: err instanceof Error ? err.message : "Failed to reach Gemini API."
      },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, action } = body;

    if (!apiKey) {
      const response = NextResponse.json({ ok: false, message: "API key is required." }, { status: 400 });
      response.cookies.delete("zyvoriq_gemini_api_key");
      return response;
    }

    const cleanKey = String(apiKey).trim();

    if (action === "validate") {
      const startTime = performance.now();
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "ping" }] }],
              generationConfig: { maxOutputTokens: 4 }
            }),
            signal: AbortSignal.timeout(5000)
          }
        );

        const latencyMs = Math.round(performance.now() - startTime);
        if (testRes.ok) {
          return NextResponse.json({
            ok: true,
            status: "alive",
            latencyMs,
            model: "models/gemini-2.5-flash"
          });
        }

        const errData = await testRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            ok: false,
            status: "invalid",
            latencyMs,
            message: errData?.error?.message || `API returned status ${testRes.status}`
          },
          { status: 401 }
        );
      } catch (err: unknown) {
        return NextResponse.json(
          {
            ok: false,
            status: "error",
            message: err instanceof Error ? err.message : "Network validation failed"
          },
          { status: 503 }
        );
      }
    }

    const response = NextResponse.json({
      ok: true,
      configured: true,
      source: "browser_cookie",
      message: "Gemini API key saved in secure HTTP-only cookie."
    });

    response.cookies.set("zyvoriq_gemini_api_key", cleanKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }
}
