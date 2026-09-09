import { NextRequest, NextResponse } from "next/server";
import { characterLibrary } from "@/lib/library/characterLibrary";
// @ts-ignore
import { validateCharacterSheet } from "@/scripts/validateCharacterSheet.mjs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { label, sheetUris, isDefault = false, validateNow = false } = body;

    if (!label || !Array.isArray(sheetUris) || sheetUris.length === 0) {
      return NextResponse.json(
        { error: "label and non-empty sheetUris array are required" },
        { status: 400 }
      );
    }

    const char = await characterLibrary.get(id);
    if (!char) {
      return NextResponse.json({ error: `Character ${id} not found` }, { status: 404 });
    }

    // Add wardrobe capped at 3 images
    const variant = await characterLibrary.addWardrobe(id, label, sheetUris, Boolean(isDefault));

    if (validateNow && variant.sheetUris.length > 0) {
      validateCharacterSheet({
        characterId: id,
        archetype: char.archetype,
        sheetUris: variant.sheetUris
      }).catch((err: any) => {
        console.warn(`[api/library/characters/[id]/wardrobe] Async validation error:`, err);
      });
    }

    return NextResponse.json({ wardrobe: variant }, { status: 201 });
  } catch (error: any) {
    console.error("[api/library/characters/[id]/wardrobe] POST error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
