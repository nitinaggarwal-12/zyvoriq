import { NextRequest, NextResponse } from "next/server";
import { locationLibrary } from "@/lib/library/locationLibrary";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const location = await locationLibrary.get(id);
    if (!location) {
      return NextResponse.json({ error: `Location ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ location });
  } catch (error: any) {
    console.error("[api/library/locations/[id]] GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const current = await locationLibrary.get(id);
    if (!current) {
      return NextResponse.json({ error: `Location ${id} not found` }, { status: 404 });
    }
    const body = await req.json();
    const updated = await locationLibrary.create({
      id,
      displayName: body.displayName ?? current.displayName,
      environmentBlock: body.environmentBlock ?? current.environmentBlock,
      establishingUri: body.establishingUri ?? current.establishingUri,
      era: body.era ?? current.era,
      timeOfDay: body.timeOfDay ?? current.timeOfDay,
    });
    return NextResponse.json({ location: updated });
  } catch (error: any) {
    console.error("[api/library/locations/[id]] PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await locationLibrary.delete(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("[api/library/locations/[id]] DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
