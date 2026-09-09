import { NextRequest, NextResponse } from "next/server";
import { characterLibrary } from "@/lib/library/characterLibrary";
// @ts-ignore
import { validateCharacterSheet } from "@/scripts/validateCharacterSheet.mjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const char = await characterLibrary.get(id);
      if (!char) return NextResponse.json({ error: "Character not found" }, { status: 404 });
      return NextResponse.json({ character: char });
    }

    const era = searchParams.get("era") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const country = searchParams.get("country") || undefined;
    const countryCode = searchParams.get("countryCode") || undefined;
    const region = searchParams.get("region") || undefined;
    const language = searchParams.get("language") || undefined;
    const category = searchParams.get("category") || undefined;
    const validatedOnly = searchParams.get("validated") === "true";

    const characters = await characterLibrary.list({ era, gender, country, countryCode, region, language, category, validatedOnly });
    return NextResponse.json({ characters, count: characters.length });
  } catch (error: any) {
    console.error("[api/library/characters] GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      displayName,
      archetype,
      description,
      gender,
      era,
      country,
      countryCode,
      region,
      language,
      category,
      defaultVoiceId,
      wardrobe,
      validateNow = false,
      validationStatus
    } = body;

    if (!displayName || !archetype || !description) {
      return NextResponse.json(
        { error: "displayName, archetype, and description are required" },
        { status: 400 }
      );
    }

    const created = await characterLibrary.create({
      id,
      displayName,
      archetype,
      description,
      gender,
      era,
      country,
      countryCode,
      region,
      language,
      category: category || "creator",
      defaultVoiceId: defaultVoiceId || "Kore",
      wardrobe: Array.isArray(wardrobe) ? wardrobe : [],
      validationStatus: validationStatus || "UNVALIDATED"
    });

    // If validation requested and sheet URIs are present, validate
    if (validateNow && created.wardrobe.length > 0) {
      const defaultVariant = created.wardrobe.find(w => w.isDefault) || created.wardrobe[0];
      if (defaultVariant && defaultVariant.sheetUris.length > 0) {
        validateCharacterSheet({
          characterId: created.id,
          archetype: created.archetype,
          sheetUris: defaultVariant.sheetUris
        }).catch((err: any) => {
          console.warn(`[api/library/characters] Async validation error for ${created.id}:`, err);
        });
      }
    }

    return NextResponse.json({ character: created }, { status: 201 });
  } catch (error: any) {
    console.error("[api/library/characters] POST error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
