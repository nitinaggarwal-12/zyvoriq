import { NextRequest, NextResponse } from "next/server";
import { locationLibrary } from "@/lib/library/locationLibrary";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const era = searchParams.get("era") || undefined;
    const timeOfDay = searchParams.get("timeOfDay") || undefined;

    const locations = await locationLibrary.list({ era, timeOfDay });
    return NextResponse.json({ locations, count: locations.length });
  } catch (error: any) {
    console.error("[api/library/locations] GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, displayName, environmentBlock, establishingUri, era, timeOfDay } = body;

    if (!displayName || !environmentBlock) {
      return NextResponse.json(
        { error: "displayName and environmentBlock are required" },
        { status: 400 }
      );
    }

    const created = await locationLibrary.create({
      id,
      displayName,
      environmentBlock,
      establishingUri,
      era,
      timeOfDay
    });

    return NextResponse.json({ location: created }, { status: 201 });
  } catch (error: any) {
    console.error("[api/library/locations] POST error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
