import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function loadEnvApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GEMINI_API_KEY=") || trimmed.startsWith("GOOGLE_API_KEY=")) {
          return trimmed.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  } catch {
    // ignore
  }
  return "";
}

function listAvailableCharacterPortraits(): string[] {
  try {
    const dir = path.join(process.cwd(), "public/assets/characters");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map((f) => `/assets/characters/${f}`);
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
  if (portraits.length === 0) return "/assets/characters/ananya_roy_in.jpg";

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
    service: "Zyvoriq Biometric Persona & Avatar Builder (Prompt | Upload | URL)",
    supportedModes: ["prompt", "upload", "url"],
    availablePortraitsCount: portraits.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "prompt") as "prompt" | "upload" | "url";
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
        resolvedPhotoUrl = `/assets/avatars/${filename}`;
      }
    }
    // 2. URL Mode: Download remote image to /public/assets/avatars/ or validate local path
    else if (mode === "url" && imageUrl.length > 0) {
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        try {
          const resp = await fetch(imageUrl, { signal: AbortSignal.timeout(6000) });
          if (resp.ok) {
            const arrBuf = await resp.arrayBuffer();
            const filename = `url_avatar_${ts}.jpg`;
            const fullPath = path.join(avatarsDir, filename);
            fs.writeFileSync(fullPath, Buffer.from(arrBuf));
            resolvedPhotoUrl = `/assets/avatars/${filename}`;
          } else {
            resolvedPhotoUrl = imageUrl;
          }
        } catch {
          resolvedPhotoUrl = imageUrl;
        }
      } else if (imageUrl.startsWith("/")) {
        resolvedPhotoUrl = imageUrl;
      }
    }

    // 3. Synthesize enriched biometric specification via Gemini if prompt provided
    let synthesizedName = rawName || "Custom Studio Persona";
    let synthesizedRole = rawRole || "Lead Vocalist & Performer";
    let synthesizedEthnicity = "Global Contemporary";
    let synthesizedFacialSpec =
      promptText ||
      `${synthesizedName} (${synthesizedRole}) — expressive eyes, sculpted bone structure, natural skin texture, and camera-ready stage presence`;

    const portraits = listAvailableCharacterPortraits();
    const apiKey = loadEnvApiKey();

    if (apiKey && (promptText.length > 3 || !rawName)) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are a Casting & Biometric Persona Director for an AI music video studio.
Given the user's persona input:
- Category: ${category}
- Gender: ${gender}
- Provided Name: "${rawName}"
- Provided Role: "${rawRole}"
- Prompt / Description: "${promptText}"
- Available portrait filenames: ${JSON.stringify(portraits.map((p) => path.basename(p)))}

Return ONLY valid JSON with:
{
  "name": "<distinguished stage name if Provided Name is empty, else keep Provided Name>",
  "roleTitle": "<concise 3-5 word role title>",
  "ethnicity": "<cultural/regional heritage>",
  "facialSpec": "<detailed 18-28 word biometric facial, hair, eye, and bone-structure specification>",
  "matchedPortraitFilename": "<exact filename from Available portrait filenames that best matches gender and heritage>"
}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
            signal: AbortSignal.timeout(6000),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawJson = gData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          const parsed = JSON.parse(rawJson);
          if (parsed.name && !rawName) synthesizedName = String(parsed.name).trim();
          if (parsed.roleTitle && !rawRole) synthesizedRole = String(parsed.roleTitle).trim();
          if (parsed.ethnicity) synthesizedEthnicity = String(parsed.ethnicity).trim();
          if (parsed.facialSpec) synthesizedFacialSpec = String(parsed.facialSpec).trim();
          if (!resolvedPhotoUrl && parsed.matchedPortraitFilename) {
            const candidatePath = `/assets/characters/${path.basename(String(parsed.matchedPortraitFilename))}`;
            if (portraits.includes(candidatePath)) {
              resolvedPhotoUrl = candidatePath;
            }
          }
        }
      } catch {
        // Fallback to deterministic pool selection below
      }
    }

    if (!resolvedPhotoUrl) {
      resolvedPhotoUrl = selectBestPortraitFromPool(
        portraits,
        category,
        gender,
        synthesizedFacialSpec,
        synthesizedName
      );
    }

    const personaId = `p_custom_${ts}`;

    return NextResponse.json({
      ok: true,
      avatar: {
        id: personaId,
        mode,
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
