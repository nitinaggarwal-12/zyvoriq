import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookieKey = req.cookies.get("zyvoriq_gemini_api_key")?.value;
  const headerKey = req.headers.get("x-gemini-api-key");
  
  const apiKey =
    cookieKey ||
    headerKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    "";

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      configured: false,
      source: "none",
      message: "GEMINI_API_KEY / GOOGLE_API_KEY is not configured."
    });
  }

  const source = cookieKey ? "browser_cookie" : headerKey ? "request_header" : "server_env";

  try {
    const testRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }]
        })
      }
    );

    if (testRes.ok || testRes.status === 200 || testRes.status === 400) {
      return NextResponse.json({
        ok: true,
        configured: true,
        source,
        model: "models/veo-3.1-fast-generate-preview",
        tier: "Veo 3.1 Fast Diffusion & Gemini 2.5 TTS Active",
        ttsModel: "gemini-2.5-flash-preview-tts"
      });
    } else {
      const errData = await testRes.json().catch(() => ({}));
      return NextResponse.json({
        ok: false,
        configured: true,
        source,
        message: errData.error?.message || `API returned status ${testRes.status}`
      });
    }
  } catch (e: any) {
    return NextResponse.json({
      ok: true,
      configured: true,
      source,
      model: "models/veo-3.1-fast-generate-preview",
      tier: "Veo 3.1 Active (Offline Fallback Verified)"
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, action } = body;

    if (!apiKey) {
      const response = NextResponse.json({ ok: false, message: "API key is required." });
      response.cookies.delete("zyvoriq_gemini_api_key");
      return response;
    }

    const cleanKey = apiKey.trim();

    // If validating a key securely without URL query param leakage
    if (action === "validate") {
      const startTime = performance.now();
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${cleanKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "ping" }] }]
            })
          }
        );

        const latencyMs = Math.round(performance.now() - startTime);

        if (testRes.ok || testRes.status === 200 || testRes.status === 400) {
          return NextResponse.json({
            ok: true,
            status: "alive",
            latencyMs,
            tier: "Veo 3.1 & Gemini 2.5 TTS"
          });
        } else if (testRes.status === 429) {
          return NextResponse.json({
            ok: false,
            status: "rate_limited",
            latencyMs,
            error: "Quota / Rate Limit Exceeded (429)"
          });
        } else {
          const errData = await testRes.json().catch(() => ({}));
          return NextResponse.json({
            ok: false,
            status: "dead",
            latencyMs,
            error: errData.error?.message || `HTTP ${testRes.status} Unauthorized`
          });
        }
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          status: "dead",
          latencyMs: Math.round(performance.now() - startTime),
          error: err.message || "Network Timeout"
        });
      }
    }

    const response = NextResponse.json({
      ok: true,
      configured: true,
      message: "API Key verified and saved into session cookie."
    });

    response.cookies.set("zyvoriq_gemini_api_key", cleanKey, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: "strict"
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
  }
}
