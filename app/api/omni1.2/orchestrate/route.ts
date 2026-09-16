import { NextResponse } from "next/server";
import { compileOmni12Plan, OMNI12_PERFORMERS, OMNI12_VENUES } from "@/lib/omni12/engine";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "Google Omni 1.2 Zero-Baggage Directorial Engine",
    version: "5.1.9",
    performers: OMNI12_PERFORMERS,
    venues: OMNI12_VENUES,
    defaultPlan: compileOmni12Plan({
      performerId: "sofia_madrid_es",
      venueId: "sacred_temple_sanctum",
      customWardrobe: "bikini", // Demonstrates live Sacred Venue Sanctity Gate auto-healing
      bpm: 120,
      numBars: 15 // 30.0s total reel (15 bars * 2.0s)
    })
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      performerId = "sofia_madrid_es",
      venueId = "sacred_temple_sanctum",
      customWardrobe,
      bpm = 120,
      numBars = 15
    } = body;

    const plan = compileOmni12Plan({
      performerId,
      venueId,
      customWardrobe,
      bpm: Number(bpm) || 120,
      numBars: Number(numBars) || 15
    });

    return NextResponse.json({
      status: "compiled",
      plan
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to compile Omni 1.2 plan" },
      { status: 500 }
    );
  }
}
