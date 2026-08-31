// app/api/_probe/route.ts
//
// TEMPORARY probe. Delete after use.
//
// Purpose: confirm your Railway GEMINI_API_KEY + models accept the Veo
// `referenceImages` payload BEFORE wiring the character-sheet fix into the
// worker. Runs entirely server-side on Railway — the key never reaches the
// browser or anyone else.
//
// Use:
//   1. Save this file at app/api/_probe/route.ts
//   2. Commit to a BRANCH (not main) and let Railway deploy
//   3. Open https://<your-app>.up.railway.app/api/_probe?go=1 in your browser
//   4. Copy the JSON it returns
//   5. DELETE this file and redeploy
//
// The ?go=1 guard means a random crawler hitting /api/_probe won't spend
// generation credits — only a deliberate load does.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API_BASE = "https://generativelanguage.googleapis.com";
const IMAGE_MODEL =
  process.env.ZYVORIQ_CHARACTER_IMAGE_MODEL || "gemini-3-pro-image-preview";
const VEO_MODEL =
  process.env.ZYVORIQ_VEO_MODEL || "veo-3.1-fast-generate-preview";

function key() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function findInlineImage(node: any): string | null {
  if (!node || typeof node !== "object") return null;
  for (const k of ["inline_data", "inlineData"]) {
    if (node[k] && typeof node[k].data === "string") return node[k].data;
  }
  if (
    (node.mimeType?.startsWith?.("image/") ||
      node.mime_type?.startsWith?.("image/")) &&
    typeof node.data === "string"
  ) {
    return node.data;
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) {
      for (const it of v) {
        const f = findInlineImage(it);
        if (f) return f;
      }
    } else if (v && typeof v === "object") {
      const f = findInlineImage(v);
      if (f) return f;
    }
  }
  return null;
}

async function step1Image(): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1beta/models/${IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key(), "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Character reference sheet. Front-facing portrait of ONE person, " +
                  "mid-20s, neutral expression, plain grey background, even lighting, " +
                  "no text. Photorealistic.",
              },
            ],
          },
        ],
      }),
    }
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(`IMAGE ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  const b64 = findInlineImage(json);
  if (!b64)
    throw new Error(
      `IMAGE ok but no inline image: ${JSON.stringify(json).slice(0, 300)}`
    );
  return b64;
}

async function step2Veo(refB64: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/v1beta/models/${VEO_MODEL}:predictLongRunning`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key(), "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt:
              "The same person from the reference speaks warmly to camera in a bright room.",
            referenceImages: [
              {
                image: { bytesBase64Encoded: refB64, mimeType: "image/png" },
                referenceType: "asset",
              },
            ],
          },
        ],
        parameters: {
          aspectRatio: "9:16",
          durationSeconds: 4,
          seed: 12345,
          negativePrompt: "different person, morphing, on-screen text",
        },
      }),
    }
  );
  const json = await res.json();
  if (!res.ok || json?.error)
    throw new Error(
      `VEO ${res.status}: ${JSON.stringify(json?.error || json).slice(0, 400)}`
    );
  if (!json?.name)
    throw new Error(`VEO ok but no operation name: ${JSON.stringify(json).slice(0, 300)}`);
  return json.name;
}

export async function GET(req: NextRequest) {
  if (!key()) {
    return NextResponse.json(
      { verdict: "NO_KEY", detail: "GEMINI_API_KEY not present in this environment" },
      { status: 200 }
    );
  }
  if (req.nextUrl.searchParams.get("go") !== "1") {
    return NextResponse.json(
      {
        verdict: "IDLE",
        hint: "Add ?go=1 to actually run the probe (spends a little generation credit).",
        imageModel: IMAGE_MODEL,
        veoModel: VEO_MODEL,
      },
      { status: 200 }
    );
  }

  const result: any = { imageModel: IMAGE_MODEL, veoModel: VEO_MODEL };
  try {
    const ref = await step1Image();
    result.step1 = "ok";
    result.imageBytes = Buffer.from(ref, "base64").length;
    try {
      const opName = await step2Veo(ref);
      result.step2 = "ok";
      result.operation = opName;
      result.verdict = "PASS";
    } catch (e: any) {
      result.step2 = "fail";
      result.step2Error = e?.message || String(e);
      result.verdict = "FAIL_VEO";
    }
  } catch (e: any) {
    result.step1 = "fail";
    result.step1Error = e?.message || String(e);
    result.verdict = "FAIL_IMAGE";
  }
  return NextResponse.json(result, { status: 200 });
}
