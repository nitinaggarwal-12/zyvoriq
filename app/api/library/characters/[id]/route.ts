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
