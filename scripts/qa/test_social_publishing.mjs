import assert from "node:assert/strict";
import {
  generatePlatformMetadata,
  DEFAULT_CONNECTED_ACCOUNTS,
  calculatePeakPostTime
} from "../../lib/reel/socialPublishing.ts";

console.log("🚀 Starting Phase 6 Direct Social Media OAuth & Publishing Suite...");

// 1. Check Connected Accounts
console.log("\n🧪 Test 1: Verifying default connected OAuth accounts...");
assert.strictEqual(DEFAULT_CONNECTED_ACCOUNTS.length, 4, "Should have 4 supported social platforms");
const platformIds = DEFAULT_CONNECTED_ACCOUNTS.map(a => a.platform);
assert.ok(platformIds.includes("instagram_reels"), "Must include Instagram Reels");
assert.ok(platformIds.includes("tiktok"), "Must include TikTok");
assert.ok(platformIds.includes("youtube_shorts"), "Must include YouTube Shorts");
assert.ok(platformIds.includes("linkedin_video"), "Must include LinkedIn Video");
assert.ok(DEFAULT_CONNECTED_ACCOUNTS.every(a => a.connected === true), "All default accounts should be connected");
console.log("  ✅ All 4 social platforms (Instagram, TikTok, YouTube, LinkedIn) verified and connected");

// 2. Metadata Generation for Instagram Reels
console.log("\n🧪 Test 2: Verifying Instagram Reels metadata generation...");
const testTopic = "3 habits quietly killing your focus";
const igMeta = generatePlatformMetadata(testTopic, "instagram_reels");
assert.ok(igMeta.title.length > 0, "Instagram title must not be empty");
assert.ok(igMeta.caption.includes("Save this reel"), "Instagram caption should include call-to-action");
assert.ok(igMeta.hashtags.length >= 5, "Instagram hashtags should have at least 5 tags");
assert.ok(igMeta.hashtags.includes("#reels"), "Should include #reels hashtag");
console.log("  ✅ Instagram Reels metadata:", { title: igMeta.title, tags: igMeta.hashtags.length });

// 3. Metadata Generation for TikTok
console.log("\n🧪 Test 3: Verifying TikTok metadata generation...");
const ttMeta = generatePlatformMetadata(testTopic, "tiktok");
assert.ok(ttMeta.title.includes("99% fail"), "TikTok title should include viral hook style");
assert.ok(ttMeta.hashtags.includes("#fyp"), "TikTok must include #fyp");
console.log("  ✅ TikTok metadata:", { title: ttMeta.title, tags: ttMeta.hashtags.length });

// 4. Metadata Generation for YouTube Shorts
console.log("\n🧪 Test 4: Verifying YouTube Shorts metadata generation...");
const ytMeta = generatePlatformMetadata(testTopic, "youtube_shorts");
assert.ok(ytMeta.title.includes("#Shorts"), "YouTube Shorts title should include #Shorts");
assert.ok(ytMeta.hashtags.some(t => t.toLowerCase() === "#shorts"), "YouTube Shorts hashtags should include #Shorts");
console.log("  ✅ YouTube Shorts metadata:", { title: ytMeta.title, tags: ytMeta.hashtags.length });

// 5. Metadata Generation for LinkedIn Video
console.log("\n🧪 Test 5: Verifying LinkedIn Video metadata generation...");
const liMeta = generatePlatformMetadata(testTopic, "linkedin_video");
assert.ok(liMeta.caption.includes("45-second framework"), "LinkedIn caption should feature executive framework");
assert.ok(liMeta.hashtags.some(t => t.toLowerCase() === "#leadership"), "LinkedIn hashtags should include professional tags");
console.log("  ✅ LinkedIn Video metadata:", { title: liMeta.title, tags: liMeta.hashtags.length });

// 6. Peak Post Time Calculation
console.log("\n🧪 Test 6: Verifying Peak Post Time scheduler calculation...");
const peakTimeStr = calculatePeakPostTime();
const peakDate = new Date(peakTimeStr);
assert.ok(!isNaN(peakDate.getTime()), "Peak post time must be a valid ISO date string");
assert.ok(peakDate.getTime() > Date.now(), "Peak post time must be in the future");
console.log("  ✅ Calculated optimal peak post time:", peakTimeStr);

console.log("\n🎉 ALL PHASE 6 SOCIAL PUBLISHING SUITE TESTS PASSED (100% PASS)!\n");
