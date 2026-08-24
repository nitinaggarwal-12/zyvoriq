import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { publisher } from "@/lib/publish/connectors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      campaignId, 
      title, 
      narrationScript, 
      vqsScore, 
      channels, 
      certificateId,
      videoS3Url,
      audioS3Url 
    } = body;

    const dispatchResult = await publisher.dispatchCampaign({
      campaignId: campaignId || `cmp_${Date.now()}`,
      title: title || "Quantum-Resistant Multi-Tenant PostgreSQL Launch",
      narrationScript: narrationScript || "Collapsing enterprise content lifecycles from 14 days to 90 seconds with Veritas quality assurance.",
      vqsScore: vqsScore || 94.6,
      channels: channels || ["linkedin", "youtube", "x", "substack"],
      videoS3Url,
      audioS3Url
    });

    return NextResponse.json({
      dispatchBatchId: dispatchResult.batchId,
      manifest: dispatchResult.manifest,
      results: dispatchResult.results,
      allSuccessful: dispatchResult.allSuccess,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch omnichannel campaign" }, { status: 500 });
  }
}
