#!/usr/bin/env node
import fs from "node:fs";

// Read JSON input from stdin
let inputData = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(inputData || "{}");
    const toolCall = payload.toolCall || {};
    const cmd = (toolCall.args?.CommandLine || "").trim();

    // Default decision: allow
    let decision = "allow";
    let reason = "";

    // Guard against assembling final music video without master audio existing first
    const isVideoAssemblyCmd = (cmd.includes("assemble_") || cmd.includes("mux") || cmd.includes("concat_video")) && cmd.includes("scratch/");
    if (isVideoAssemblyCmd) {
      // Check if command references scratch directory
      const scratchMatch = cmd.match(/scratch\/([a-zA-Z0-9_-]+)/);
      if (scratchMatch) {
        const targetDir = `/Users/nitinagga/Documents/zyvoriq/scratch/${scratchMatch[1]}`;
        const hasMasterAudio = fs.existsSync(`${targetDir}/master_soundtrack_5min.mp3`) || 
                               fs.existsSync(`${targetDir}/master_soundtrack_full_300s.mp3`) ||
                               fs.existsSync(`${targetDir}/master_soundtrack.mp3`);
        const hasLyrics = fs.existsSync(`${targetDir}/lyrics_timestamps.json`) || fs.existsSync(`${targetDir}/lyrics_timestamps_5m.json`);

        if (!hasMasterAudio && !hasLyrics) {
          decision = "deny";
          reason = `[ZYVORIQ ARCHITECTURAL GUARD]: Cannot assemble or render video in scratch/${scratchMatch[1]} because Step 1 (Lyria Master Soundtrack & Lyrics Manifest) has not been generated or persisted. Generate master audio first.`;
        }
      }
    }

    const isFfmpegInvocation = (cmd.startsWith("ffmpeg") || cmd.includes(" ffmpeg ") || cmd.includes("/ffmpeg")) && !cmd.startsWith("git ") && !cmd.startsWith("echo ") && !cmd.startsWith("node ") && !cmd.startsWith("cat ");

    // 2. ZERO-ILLUSION GUARD: Strictly forbid -stream_loop on video clips
    // Looping video clips breaks character continuity, causes visual jumping, and destroys lip-sync
    if (isFfmpegInvocation && cmd.includes("-stream_loop")) {
      const loopMatch = cmd.match(/-stream_loop\s+(\d+)/);
      if (loopMatch && parseInt(loopMatch[1], 10) > 0) {
        decision = "deny";
        reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: -stream_loop (${loopMatch[1]}) is strictly forbidden for music video productions! Looping short video clips causes visual jumping, breaks character costume continuity across iterations, and destroys lip-sync synchronization. Every segment must be a unique, dedicated generation or continuous shot.`;
      }
    }

    // 3. ZERO AUDIO COLLISION GUARD: Forbid mixing vocal stems over un-ducked vocal/music beds
    if (isFfmpegInvocation && cmd.includes("amix") && (cmd.includes("adelay") || cmd.includes("vox")) && (cmd.includes("master_soundtrack") || cmd.includes("bed"))) {
      const bedMatch = cmd.match(/\[0:a\]volume=([0-9.]+)/);
      if (bedMatch && parseFloat(bedMatch[1]) >= 0.35) {
        decision = "deny";
        reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: Audio collision detected! Backing bed volume is set to ${bedMatch[1]} while superimposing vocal stems. When vocal stems enter, the backing bed must be ducked to <= 0.20 or use an instrumental/isolated accompaniment bed to prevent vocal clashing, doubling, and phasing.`;
      }
    }

    const output = { decision };
    if (reason) output.reason = reason;
    console.log(JSON.stringify(output));
  } catch (err) {
    // Fail open if hook itself encounters a parsing issue
    console.log(JSON.stringify({ decision: "allow" }));
  }
});
