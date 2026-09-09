import { NextRequest, NextResponse } from "next/server";
import { deconstructAndElaborateDirector } from "@/lib/reel/elaborateDirector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || body.topic || "").trim();
    const referenceUrl = String(body.referenceUrl || body.url || "").trim();

    if (!prompt && !referenceUrl) {
      return NextResponse.json(
        { success: false, error: "Either a text prompt or a reference video URL is required." },
        { status: 400 }
      );
    }

    const duration = Number(body.requestedDurationSec || body.duration || 30);
    const aspectRatio = body.aspectRatio || "16:9";
    const genre = body.genre;
    const language = body.language;
    const tweakInstructions = body.tweakInstructions;
    const previousTreatment = body.previousTreatment;

    console.log(`[api/studio1/elaborate] POST incoming: prompt="${prompt.slice(0, 60)}...", genre="${genre || ""}", duration=${duration}`);

    const treatment = await deconstructAndElaborateDirector({
      prompt,
      referenceUrl,
      genre,
      requestedDurationSec: duration,
      aspectRatio,
      language,
      tweakInstructions,
      previousTreatment,
    });

    return NextResponse.json({
      success: true,
      treatment,
    });
  } catch (error: any) {
    console.error("[api/studio1/elaborate] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to elaborate directorial treatment." },
      { status: 500 }
    );
  }
}
