import { NextRequest, NextResponse } from "next/server";
import { planEpisodeWithOmni } from "@/lib/episode/omniShowrunner";
import type { EpisodePlanInput } from "@/lib/episode/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EpisodePlanInput;
    if (!body || !body.topic || !body.topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Topic / series concept is required to direct an episode." },
        { status: 400 }
      );
    }

    const targetDurationSec = Number(body.targetDurationSec) || 1800; // default 30 min
    const blueprint = await planEpisodeWithOmni({
      ...body,
      targetDurationSec
    });

    return NextResponse.json({
      success: true,
      blueprint
    });
  } catch (error: any) {
    console.error("[api/episodes/plan] Error planning episode:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to compile episode blueprint with Omni Showrunner."
      },
      { status: 500 }
    );
  }
}
