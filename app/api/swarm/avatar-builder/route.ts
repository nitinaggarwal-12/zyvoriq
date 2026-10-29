import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function loadEnvApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();
}

function listAvailableCharacterPortraits(): string[] {
  try {
    const dir = path.join(process.cwd(), "public/assets/characters");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map((f) => `/api/media/assets/characters/${f}`);
  } catch {
    return [];
  }
}

function selectBestPortraitFromPool(
  portraits: string[],
  category: string,
  gender: string,
  promptText: string,
  name: string
): string {
  if (portraits.length === 0) return "/api/media/assets/characters/ananya_roy_in.jpg";

  const maleHints = [
    "arjun",
    "vikram",
    "kabir",
    "gianluigi",
    "marcus",
    "david",
    "julian",
    "andrei",
    "aarav",
    "rohan",
    "kenji",
    "mateo",
    "lucas",
    "omar",
    "dev",
    "raj",
    "carlos",
    "diego",
    "liam",
    "noah",
  ];

  const isMale =
    category === "male_lead" ||
    gender.toLowerCase() === "male" ||
    /\b(male|man|boy|tenor|baritone|gentleman|actor|king|brother)\b/i.test(promptText);

  const filteredByGender = portraits.filter((p) => {
    const base = path.basename(p).toLowerCase();
    const matchesMaleName = maleHints.some((m) => base.includes(m));
    return isMale ? matchesMaleName : !matchesMaleName;
  });

  const pool = filteredByGender.length > 0 ? filteredByGender : portraits;
  const tokens = `${promptText} ${name}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  let bestUrl = pool[0];
  let bestScore = -1;
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    const base = path.basename(p).toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (tok.length >= 3 && base.includes(tok)) score += 5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestUrl = p;
    }
  }

  if (bestScore <= 0) {
    let hash = 2166136261;
    const seedStr = `${name}_${promptText}_${category}_${Date.now()}`;
    for (let i = 0; i < seedStr.length; i++) {
      hash ^= seedStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    bestUrl = pool[Math.abs(hash) % pool.length];
  }

  return bestUrl;
}

export async function GET() {
  const portraits = listAvailableCharacterPortraits();
  return NextResponse.json({
    ok: true,
    service: "Zyvoriq Biometric Persona, Keyframe & Poster Image Studio (Prompt | Upload | URL)",
    supportedModes: ["prompt", "keyframe", "upload", "url"],
    availablePortraitsCount: portraits.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "prompt") as "prompt" | "keyframe" | "upload" | "url";
    const surfaceType = String(body.surfaceType || (mode === "keyframe" ? "keyframe" : "avatar"));
    const aspectRatio = String(body.aspectRatio || "9:16");
    const category = String(body.category || "female_lead");
    const gender = String(
      body.gender || (category === "male_lead" ? "male" : "female")
    );
    const rawName = String(body.name || "").trim();
    const rawRole = String(body.role || body.roleTitle || "").trim();
    const promptText = String(body.prompt || body.facialSpec || body.styleNotes || "").trim();
    const imageBase64 = String(body.imageBase64 || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const outfit1 = String(body.outfit1 || "").trim();
    const outfit2 = String(body.outfit2 || "").trim();

    const avatarsDir = path.join(process.cwd(), "public/assets/avatars");
    fs.mkdirSync(avatarsDir, { recursive: true });

    const ts = Date.now();
    let resolvedPhotoUrl = "";
    let modelUsed = "pool-fallback";

    // 1. Upload Mode: Persist base64 image to /public/assets/avatars/
    if (mode === "upload" && imageBase64.startsWith("data:image/")) {
      const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches[2]) {
        const ext = matches[1].includes("png")
          ? "png"
          : matches[1].includes("webp")
          ? "webp"
          : "jpg";
        const filename = `custom_avatar_${ts}.${ext}`;
        const fullPath = path.join(avatarsDir, filename);
        fs.writeFileSync(fullPath, Buffer.from(matches[2], "base64"));
        resolvedPhotoUrl = `/api/media/assets/avatars/${filename}`;
        modelUsed = "user-upload";
      }
    }
    // 2. URL Mode: SSRF-hardened public image fetch (blocks private/loopback/link-local/metadata IPs & redirects, enforces magic bytes + 10 MiB cap)
    else if (mode === "url" && imageUrl.length > 0) {
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        const isSafePublicImageHttpUrl = (raw: string): boolean => {
          try {
            const u = new URL(raw);
            if (u.protocol !== "https:" && u.protocol !== "http:") return false;
            const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
            if (
              !host ||
              host === "localhost" ||
              host.endsWith(".localhost") ||
              host.endsWith(".local") ||
              host.endsWith(".internal") ||
              host === "metadata.google.internal" ||
              host === "0.0.0.0" ||
              host === "::1" ||
              host.startsWith("fc") ||
              host.startsWith("fd") ||
              host.startsWith("fe80:")
            ) {
              return false;
            }
            const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
            if (ipv4) {
              const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
              if (
                a === 0 ||
                a === 10 ||
                a === 127 ||
                (a === 169 && b === 254) ||
                (a === 172 && b >= 16 && b <= 31) ||
                (a === 192 && b === 168) ||
                (a === 100 && b >= 64 && b <= 127)
              ) {
                return false;
              }
            }
            return true;
          } catch {
            return false;
          }
        };

        if (!isSafePublicImageHttpUrl(imageUrl)) {
          return NextResponse.json(
            { ok: false, error: "Blocked unsafe or internal URL in avatar-builder URL mode." },
            { status: 400 }
          );
        }
        try {
          const resp = await fetch(imageUrl, {
            redirect: "error",
            signal: AbortSignal.timeout(8000),
          });
          if (resp.ok) {
            const contentLength = Number(resp.headers.get("content-length") || "0");
            if (contentLength > 10 * 1024 * 1024) {
              return NextResponse.json(
                { ok: false, error: "Remote image exceeds 10 MiB limit." },
                { status: 413 }
              );
            }
            const buf = Buffer.from(await resp.arrayBuffer());
            if (buf.length > 10 * 1024 * 1024) {
              return NextResponse.json(
                { ok: false, error: "Remote image exceeds 10 MiB limit." },
                { status: 413 }
              );
            }
            const isJpeg = buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
            const isPng =
              buf.length > 8 &&
              buf[0] === 0x89 &&
              buf[1] === 0x50 &&
              buf[2] === 0x4e &&
              buf[3] === 0x47;
            const isWebp =
              buf.length > 12 &&
              buf.subarray(0, 4).toString("ascii") === "RIFF" &&
              buf.subarray(8, 12).toString("ascii") === "WEBP";
            if (!isJpeg && !isPng && !isWebp) {
              return NextResponse.json(
                { ok: false, error: "Remote URL did not return a valid JPEG, PNG, or WEBP image." },
                { status: 415 }
              );
            }
            const ext = isPng ? "png" : isWebp ? "webp" : "jpg";
            const filename = `url_avatar_${ts}.${ext}`;
            const fullPath = path.join(avatarsDir, filename);
            fs.writeFileSync(fullPath, buf);
            resolvedPhotoUrl = `/api/media/assets/avatars/${filename}`;
            modelUsed = "url-import";
          } else {
            return NextResponse.json(
              { ok: false, error: `Remote image returned HTTP ${resp.status}` },
              { status: 502 }
            );
          }
        } catch {
          return NextResponse.json(
            { ok: false, error: "Remote image fetch failed or attempted redirect." },
            { status: 502 }
          );
        }
      } else if (imageUrl.startsWith("/")) {
        resolvedPhotoUrl = imageUrl.startsWith("/assets/")
          ? `/api/media${imageUrl}`
          : imageUrl;
      }
    }

    // 3. Synthesize enriched biometric or cinema keyframe specification via Gemini 3.8 Flash
    const isSceneKeyframe =
      mode === "keyframe" || surfaceType === "keyframe" || surfaceType === "poster";
    const wordSafePromptTitle = (() => {
      const norm = promptText.replace(/\s+/g, " ").trim();
      if (!norm) return "35mm Cinema Keyframe";
      if (norm.length <= 52) return norm;
      const cut = norm.slice(0, 52);
      const sp = cut.lastIndexOf(" ");
      return `${(sp > 28 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—]+$/, "")}…`;
    })();
    let synthesizedName =
      rawName || (isSceneKeyframe ? wordSafePromptTitle : "Custom Studio Persona");
    let synthesizedRole =
      rawRole || (isSceneKeyframe ? `35mm Keyframe (${aspectRatio})` : "Lead Vocalist & Performer");
    let synthesizedEthnicity = "Global Contemporary";
    let synthesizedFacialSpec =
      promptText ||
      `${synthesizedName} (${synthesizedRole}) — expressive eyes, sculpted bone structure, natural skin texture, and camera-ready stage presence`;

    const portraits = listAvailableCharacterPortraits();
    const apiKey = loadEnvApiKey();

    if (apiKey && !isSceneKeyframe && (promptText.length > 3 || !rawName)) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are a Casting & Biometric Persona Director for an AI cinema & music studio.
Given the user's persona input:
- Category: ${category}
- Gender: ${gender}
- Provided Name: "${rawName}"
- Provided Role: "${rawRole}"
- Prompt / Description: "${promptText}"

Return ONLY valid JSON with:
{
  "name": "<distinguished stage name if Provided Name is empty, else keep Provided Name>",
  "roleTitle": "<concise 3-5 word role title>",
  "ethnicity": "<cultural/regional heritage>",
  "facialSpec": "<detailed 18-28 word biometric facial, hair, eye, and bone-structure specification>"
}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                responseMimeType: "application/json",
                maxOutputTokens: 1024,
                thinkingConfig: { thinkingLevel: "LOW" },
              },
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawJson =
            gData?.candidates?.[0]?.content?.parts
              ?.filter((p: Record<string, any>) => !p.thought && typeof p.text === "string")
              ?.map((p: Record<string, any>) => p.text)
              .join("") || "{}";
          const parsed = JSON.parse(rawJson);
          if (parsed.name && !rawName) synthesizedName = String(parsed.name).trim();
          if (parsed.roleTitle && !rawRole) synthesizedRole = String(parsed.roleTitle).trim();
          if (parsed.ethnicity) synthesizedEthnicity = String(parsed.ethnicity).trim();
          if (parsed.facialSpec) synthesizedFacialSpec = String(parsed.facialSpec).trim();
        }
      } catch {
        // Fallback below
      }
    }

    // 3B. Synthesize a 100% BRAND-NEW photorealistic 35mm cinema keyframe or portrait via Gemini Flash Image
    if (apiKey && !resolvedPhotoUrl) {
      const slug =
        synthesizedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "")
          .slice(0, 28) || "keyframe";
      const aspectLabel =
        aspectRatio === "16:9"
          ? "16:9 widescreen theatrical anamorphic"
          : aspectRatio === "1:1"
          ? "1:1 square album cover"
          : "9:16 vertical full-frame cinema";
      const imagePrompt = isSceneKeyframe
        ? `Photorealistic 35mm ARRI Alexa 65 Panavision Anamorphic (${aspectLabel} composition) master keyframe still for: ${promptText}. Rich optical depth of field, cinematic volumetric lighting, authentic film grain, crisp natural textures, zero text overlays, zero typography, zero watermarks.`
        : `Photorealistic 35mm ARRI Alexa 85mm f/1.4 studio casting headshot portrait (${aspectLabel}) of ${synthesizedName} (${synthesizedRole}, ${synthesizedEthnicity}): ${synthesizedFacialSpec}. ${
            outfit1 ? `Wardrobe: ${outfit1}.` : ""
          } Natural skin pores, expressive eyes looking at camera, cinematic key lighting, zero text overlays, zero watermarks.`;

      for (const imgModel of [
        "models/gemini-3.1-flash-image-preview",
        "models/gemini-2.5-flash-image",
      ]) {
        try {
          const imgRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${imgModel}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
                generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
              }),
              signal: AbortSignal.timeout(35000),
            }
          );
          if (imgRes.ok) {
            const imgJson = await imgRes.json();
            const parts: Array<Record<string, any>> =
              imgJson?.candidates?.[0]?.content?.parts || [];
            const imgPart = parts.find(
              (p) => p?.inlineData?.data && String(p.inlineData.data).length > 1000
            );
            if (imgPart?.inlineData?.data) {
              const mime = String(imgPart.inlineData.mimeType || "image/jpeg");
              const ext = mime.includes("png") ? "png" : "jpg";
              const prefix = isSceneKeyframe ? "keyframe" : "custom_avatar";
              const filename = `${prefix}_${slug}_${ts}.${ext}`;
              const fullPath = path.join(avatarsDir, filename);
              fs.writeFileSync(fullPath, Buffer.from(imgPart.inlineData.data, "base64"));
              resolvedPhotoUrl = `/api/media/assets/avatars/${filename}`;
              modelUsed = imgModel;
              break;
            }
          }
        } catch {
          // try next model
        }
      }
    }

    if (!resolvedPhotoUrl) {
      if (isSceneKeyframe) {
        return NextResponse.json(
          {
            ok: false,
            error: "AI Keyframe image generation unavailable — verify GEMINI_API_KEY.",
          },
          { status: 502 }
        );
      }
      resolvedPhotoUrl = selectBestPortraitFromPool(
        portraits,
        category,
        gender,
        synthesizedFacialSpec,
        synthesizedName
      );
    }

    const personaId = `${isSceneKeyframe ? "kf" : "p_custom"}_${ts}`;
    const canonicalId = isSceneKeyframe
      ? `ZYV-KF-${String(ts).slice(-8).toUpperCase()}`
      : undefined;

    if (isSceneKeyframe && canonicalId) {
      try {
        const { appendLibraryAssets } = await import("@/lib/swarm/libraryStore");
        appendLibraryAssets([
          {
            id: canonicalId,
            canonicalId,
            canonicalUrl: resolvedPhotoUrl,
            studioUrl: "/swarm-MUI",
            projectId: personaId,
            projectTitle: `35mm AI Keyframe — ${wordSafePromptTitle}`,
            title: `35mm Keyframe (${aspectRatio}) — ${wordSafePromptTitle}`,
            subtitle: `${modelUsed} • ${aspectRatio} Photorealistic 35mm Still`,
            assetType: "keyframe_image",
            genre: "35mm Cinema Keyframe",
            durationSec: 0,
            audioSpec: "35mm Cinema Still (Visual Only)",
            promptSummary: promptText,
            src: resolvedPhotoUrl,
            posterSrc: resolvedPhotoUrl,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({
      ok: true,
      canonicalId,
      modelUsed,
      imageUrl: resolvedPhotoUrl,
      aspectRatio,
      avatar: {
        id: personaId,
        mode,
        surfaceType,
        aspectRatio,
        category,
        name: synthesizedName,
        gender,
        role: synthesizedRole,
        roleTitle: synthesizedRole,
        ethnicity: synthesizedEthnicity,
        face: synthesizedFacialSpec,
        facialSpec: synthesizedFacialSpec,
        outfit1,
        outfit2,
        photoUrl: resolvedPhotoUrl,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
