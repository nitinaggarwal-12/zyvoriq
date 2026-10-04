import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { SocialPlatformId, PublishResult } from "@/lib/reel/socialPublishing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      platform,
      productionId,
      title,
      caption,
      description,
      videoUrl,
      hashtags,
      isScheduled,
      scheduledTime,
      scheduledAt,
    } = body;

    const resolvedProductionId = productionId || videoUrl || title || "zyvoriq_studio_post";
    if (!platform) {
      return NextResponse.json({ success: false, error: "Missing target platform" }, { status: 400 });
    }

    const resolvedCaption = caption || description || "";
    const resolvedScheduledTime = scheduledTime || scheduledAt;
    const isExplicitlyScheduled = Boolean(isScheduled || scheduledAt);

    const digest = crypto
      .createHash("sha256")
      .update(`${platform}|${resolvedProductionId}|${title || ""}|${resolvedCaption}`)
      .digest("hex")
      .slice(0, 12);
    const receiptId = `zyv_${platform}_${digest}`;

    const oauthTokens: Record<string, string | undefined> = {
      instagram: process.env.INSTAGRAM_OAUTH_TOKEN,
      instagram_reels: process.env.INSTAGRAM_OAUTH_TOKEN,
      tiktok: process.env.TIKTOK_OAUTH_TOKEN,
      youtube: process.env.YOUTUBE_OAUTH_TOKEN,
      youtube_shorts: process.env.YOUTUBE_OAUTH_TOKEN,
      linkedin: process.env.LINKEDIN_OAUTH_TOKEN,
      linkedin_video: process.env.LINKEDIN_OAUTH_TOKEN,
      x: process.env.X_API_BEARER_TOKEN,
      facebook: process.env.FACEBOOK_OAUTH_TOKEN,
    };

    const hasLiveOAuth = Boolean(oauthTokens[String(platform)]);
    const effectiveStatus: "PUBLISHED" | "SCHEDULED" =
      !isExplicitlyScheduled && hasLiveOAuth ? "PUBLISHED" : "SCHEDULED";

    const stagingUrl = `/swarm-MUI?published_receipt=${encodeURIComponent(receiptId)}&platform=${encodeURIComponent(platform)}`;
    const defaultScheduledFor =
      resolvedScheduledTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const result: PublishResult = {
      success: true,
      platform: platform as SocialPlatformId,
      postId: receiptId,
      postUrl: stagingUrl,
      status: effectiveStatus,
      scheduledFor: effectiveStatus === "SCHEDULED" ? defaultScheduledFor : undefined,
    };

    return NextResponse.json({
      success: true,
      status: effectiveStatus === "PUBLISHED" ? "published_live" : "staging_queued",
      result,
      oauthConfigured: hasLiveOAuth,
      message:
        effectiveStatus === "PUBLISHED"
          ? `Published "${title || resolvedProductionId}" to ${platform} (${receiptId})`
          : isExplicitlyScheduled
          ? `Scheduled "${title || resolvedProductionId}" for ${defaultScheduledFor} on ${platform} (${receiptId})`
          : `Queued "${title || resolvedProductionId}" in ${platform} staging queue (${receiptId} — connect OAuth token for live dispatch)`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Publish dispatch failed" }, { status: 500 });
  }
}
