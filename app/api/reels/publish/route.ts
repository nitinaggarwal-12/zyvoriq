import { NextResponse } from "next/server";
import { SocialPlatformId, PublishResult } from "@/lib/reel/socialPublishing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, productionId, title, caption, hashtags, isScheduled, scheduledTime } = body;

    if (!platform || !productionId) {
      return NextResponse.json({ success: false, error: "Missing platform or productionId" }, { status: 400 });
    }

    // Simulate OAuth direct dispatch with simulated live platform IDs
    const mockPostId = `post_${platform}_${Date.now()}`;
    const mockPostUrls: Record<SocialPlatformId, string> = {
      instagram_reels: `https://instagram.com/reel/${mockPostId}`,
      tiktok: `https://tiktok.com/@zyvoriq/video/${mockPostId}`,
      youtube_shorts: `https://youtube.com/shorts/${mockPostId}`,
      linkedin_video: `https://linkedin.com/feed/update/urn:li:ugcPost:${mockPostId}`
    };

    const result: PublishResult = {
      success: true,
      platform,
      postId: mockPostId,
      postUrl: mockPostUrls[platform as SocialPlatformId] || mockPostUrls.instagram_reels,
      status: isScheduled ? "SCHEDULED" : "PUBLISHED",
      scheduledFor: isScheduled ? (scheduledTime || new Date().toISOString()) : undefined
    };

    return NextResponse.json({
      success: true,
      result,
      message: isScheduled ? `Successfully scheduled to ${platform}` : `Successfully published to ${platform}!`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Publish dispatch failed" }, { status: 500 });
  }
}
