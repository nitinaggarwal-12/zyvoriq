import { NextRequest, NextResponse } from "next/server";
import { listEpisodes, saveEpisodeBlueprint } from "@/lib/episode/episodeStore";
import type { EpisodeBlueprint } from "@/lib/episode/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const episodes = await listEpisodes();
    return NextResponse.json({ success: true, episodes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { blueprint: EpisodeBlueprint };
    if (!body || !body.blueprint) {
      return NextResponse.json({ success: false, error: "Missing episode blueprint" }, { status: 400 });
    }
    const saved = await saveEpisodeBlueprint(body.blueprint);
    return NextResponse.json({ success: true, episode: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
