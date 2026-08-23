import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { certificateId, channels, masterAssetId } = body;

    const dispatchResults = (channels || ["youtube", "linkedin", "x"]).map((channel: string) => ({
      channel,
      status: "PUBLISHED",
      externalPostId: `post_${channel}_${Math.random().toString(36).substring(2, 8)}`,
      c2paManifestAttached: true,
      deliveredAt: new Date().toISOString()
    }));

    return NextResponse.json({
      dispatchBatchId: `pub_${Date.now()}`,
      certificateId: certificateId || "vqc_demo_valid",
      results: dispatchResults,
      allSuccessful: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch omnichannel assets" }, { status: 500 });
  }
}
