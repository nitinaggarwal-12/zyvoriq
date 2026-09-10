#!/usr/bin/env node
import fs from "node:fs";

let inputData = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(inputData || "{}");
    const workspace = payload.workspacePaths?.[0] || "";

    // Only inject for zyvoriq workspace
    if (workspace.includes("zyvoriq")) {
      const reminder = [
        "🛡️ [ZYVORIQ ZERO-ILLUSION MANDATORY PRODUCTION GATEKEEPERS]:",
        "1. STEP 1 FIRST: Never generate or stitch video before DeepMind Lyria master audio & lyrics manifest are saved to scratch/.",
        "2. ZERO FAKE LOOPING (-stream_loop BAN): Never use -stream_loop or repeat identical clips in music videos. Every cut must be a unique, dedicated camera shot or continuous motion to prevent lip-sync destruction and costume collapse.",
        "3. ZERO AUDIO COLLISION: Never superimpose vocal stems on top of an un-ducked vocal bed. Bed volume must be ducked to <= 0.20 or use an instrumental accompaniment bed when lead vocals enter to prevent vocal phasing and clashing.",
        "4. ANCHOR-CONDITIONED ZERO-TOLERANCE VISUAL CONTINUITY: Every cut boundary must match reference character anchors within 5%. No missing tiaras, no costume morphs, no phantom duplicate performers. Rationalizing styling variations is strictly forbidden.",
        "5. DIRECT VIDEO AUDITING (NO DETACHED JPEGS/MP3s): Multimodal audits must inspect actual video clips or dense cut-boundary frames against anchors; detached JPEGs/MP3s are strictly prohibited.",
        "6. NATIVE SINGING AUDIBILITY & LIP-SYNC: If an on-screen character is singing, their native singing vocal MUST be audible (volume > 1.0) and synchronized with their mouth. Never mute singing characters.",
        "7. ZERO SILENCE: Final videos must have 0 silence intervals across the entire timeline (background music bed must continue continuously).",
        "8. CUT-BOUNDARY ACOUSTIC CONTINUITY: Never hard-cut singing vocals mid-syllable. Always apply a 300ms natural acoustic decay (afade=t=out) and crossfade incoming stems (afade=t=in).",
        "9. REMOTE CLOUDTOP EXECUTION: All heavy ffmpeg, rendering, and test harnesses must execute on Cloudtop (nitinagga.c.googlers.com)."
      ].join("\n");

      console.log(JSON.stringify({
        injectSteps: [
          {
            ephemeralMessage: reminder
          }
        ]
      }));
    } else {
      console.log(JSON.stringify({ injectSteps: [] }));
    }
  } catch (e) {
    console.log(JSON.stringify({ injectSteps: [] }));
  }
});
