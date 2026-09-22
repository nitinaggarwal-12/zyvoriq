import { NextResponse } from "next/server";
import { publisher } from "@/lib/publish/connectors";

type Channel = "linkedin" | "youtube" | "x";

function connectionState() {
  return {
    linkedin: Boolean(process.env.LINKEDIN_OAUTH_TOKEN),
    youtube: Boolean(process.env.YOUTUBE_OAUTH_TOKEN),
    x: Boolean(process.env.X_API_BEARER_TOKEN),
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    connections: connectionState(),
    note: "Only channels with configured OAuth/API credentials can be published.",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requested: Channel[] = Array.isArray(body.channels)
      ? body.channels.filter((value: unknown): value is Channel =>
          value === "linkedin" || value === "youtube" || value === "x"
        )
      : [];

    if (requested.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Select at least one supported publishing channel." },
        { status: 400 }
      );
    }

    const connections = connectionState();
    const disconnected = requested.filter((channel) => !connections[channel]);
    if (disconnected.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Publishing connection required for: ${disconnected.join(", ")}`,
          connections,
        },
        { status: 503 }
      );
    }

    const dispatchResult = await publisher.dispatchCampaign({
      campaignId: String(body.campaignId || `cmp_${Date.now()}`),
      title: String(body.title || "Untitled Zyvoriq project"),
      narrationScript: String(body.narrationScript || body.caption || ""),
      vqsScore: Number(body.vqsScore || 100),
      channels: requested,
      certificateId: body.certificateId,
      videoS3Url: body.videoS3Url,
      audioS3Url: body.audioS3Url,
    } as any);

    return NextResponse.json({
      ok: dispatchResult.allSuccess,
      dispatchBatchId: dispatchResult.batchId,
      manifest: dispatchResult.manifest,
      results: dispatchResult.results,
      allSuccessful: dispatchResult.allSuccess,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
