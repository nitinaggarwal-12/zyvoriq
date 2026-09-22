import { NextRequest, NextResponse } from "next/server";
import { characterLibrary } from "@/lib/library/characterLibrary";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const character = await characterLibrary.get(id);
    if (!character) {
      return NextResponse.json({ error: `Character ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ character });
  } catch (error: any) {
    console.error("[api/library/characters/[id]] GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const current = await characterLibrary.get(id);
    if (!current) {
      return NextResponse.json({ error: `Character ${id} not found` }, { status: 404 });
    }
    const body = await req.json();
    const updated = await characterLibrary.create({
      id,
      displayName: body.displayName ?? current.displayName,
      archetype: body.archetype ?? current.archetype,
      description: body.description ?? current.description,
      gender: body.gender ?? current.gender,
      era: body.era ?? current.era,
      country: body.country ?? current.country,
      countryCode: body.countryCode ?? current.countryCode,
      region: body.region ?? current.region,
      language: body.language ?? current.language,
      category: body.category ?? current.category,
      defaultVoiceId: body.defaultVoiceId ?? current.defaultVoiceId,
      wardrobe: Array.isArray(body.wardrobe) ? body.wardrobe : current.wardrobe,
      validationStatus: body.validationStatus ?? current.validationStatus,
    });
    return NextResponse.json({ character: updated });
  } catch (error: any) {
    console.error("[api/library/characters/[id]] PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await characterLibrary.delete(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("[api/library/characters/[id]] DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
