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
    const toolName = toolCall.name || "";
    const args = toolCall.args || {};
    const cmd = (args.CommandLine || "").trim();
    const fileContent = (args.CodeContent || args.ReplacementContent || "").trim();

    // Default decision: allow
    let decision = "allow";
    let reason = "";

    // 1. FILE WRITE & EDIT INSPECTION
    if (toolName === "write_to_file" || toolName === "replace_file_content") {
      const targetFile = args.TargetFile || "";
      if (fileContent.includes("-stream_loop") && !fileContent.includes("// -stream_loop")) {
        decision = "deny";
        reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: Cannot write script containing -stream_loop! Looping video clips causes visual jumping, breaks character costume continuity across iterations, and destroys lip-sync synchronization. Every segment must be a unique, dedicated generation.`;
      } else if (fileContent.includes("amix") && (fileContent.includes("adelay") || fileContent.includes("vox"))) {
        const bedMatch = fileContent.match(/\[0:a\]volume=([0-9.]+)/);
        if (bedMatch && parseFloat(bedMatch[1]) >= 0.35) {
          decision = "deny";
          reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: Cannot write script with audio collision! Backing bed volume is set to ${bedMatch[1]} while mixing vocal stems. Must be ducked to <= 0.20.`;
        }
      } else if (targetFile.includes("scripts/") && (targetFile.endsWith(".mjs") || targetFile.endsWith(".ts"))) {
        // Check for conflicting consecutive shot prompts (e.g. broad daylight vs nighttime aurora in the same scene)
        const hasDaylight = /daylight|broad daylight|natural sunlight|golden hour/i.test(fileContent);
        const hasNight = /nighttime|midnight|dark night|aurora borealis|night sky/i.test(fileContent);
        if (hasDaylight && hasNight && fileContent.includes("SHOTS = [") && !fileContent.includes("sunset transition") && !fileContent.includes("twilight bridge")) {
          // Check if both exist across shots in the same sequence without a transition
          decision = "deny";
          reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: Environmental lighting contradiction detected! Script defines consecutive scene shots mixing daylight/sunlight and nighttime/aurora without an explicit transition bridge. Continuous performance scenes must maintain unified lighting and time-of-day.`;
        }
      }
    }

    // 2. COMMAND EXECUTION INSPECTION
    if (toolName === "run_command" || cmd) {
      // Guard against assembling final music video without master audio existing first
      const isVideoAssemblyCmd = (cmd.includes("assemble_") || cmd.includes("mux") || cmd.includes("concat_video")) && cmd.includes("scratch/");
      if (isVideoAssemblyCmd) {
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

      const isFfmpegOrMediaCmd = (cmd.includes("ffmpeg") || cmd.includes("ffprobe")) && !cmd.startsWith("git ") && !cmd.startsWith("cat ");

      // Strictly forbid -stream_loop on video clips
      if ((isFfmpegOrMediaCmd || cmd.includes("-stream_loop")) && !cmd.startsWith("git ")) {
        const loopMatch = cmd.match(/-stream_loop\s+(\d+)/);
        if (loopMatch && parseInt(loopMatch[1], 10) > 0) {
          decision = "deny";
          reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: -stream_loop (${loopMatch[1]}) is strictly forbidden for music video productions! Looping short video clips causes visual jumping, breaks character costume continuity across iterations, and destroys lip-sync synchronization. Every segment must be a unique, dedicated generation or continuous shot.`;
        }
      }

      // Forbid mixing vocal stems over un-ducked vocal/music beds
      if ((isFfmpegOrMediaCmd || cmd.includes("amix")) && (cmd.includes("adelay") || cmd.includes("vox")) && (cmd.includes("master_soundtrack") || cmd.includes("bed"))) {
        const bedMatch = cmd.match(/\[0:a\]volume=([0-9.]+)/);
        if (bedMatch && parseFloat(bedMatch[1]) >= 0.35) {
          decision = "deny";
          reason = `[ZYVORIQ ZERO-ILLUSION GUARD]: Audio collision detected! Backing bed volume is set to ${bedMatch[1]} while superimposing vocal stems. When vocal stems enter, the backing bed must be ducked to <= 0.20 or use an instrumental/isolated accompaniment bed to prevent vocal clashing, doubling, and phasing.`;
        }
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
