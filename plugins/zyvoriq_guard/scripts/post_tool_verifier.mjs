#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

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
    const error = payload.error || "";
    const workspace = payload.workspacePaths?.[0] || process.cwd();

    // 1. Post-execution verification for video rendering commands
    if (toolName === "run_command" && cmd) {
      if (error) {
        console.error(`[ZYVORIQ POST-TOOL AUDIT]: Command failed with error: ${error}`);
      }

      // Check if command produced or attempted to produce an MP4 video in scratch/
      const mp4Matches = cmd.match(/scratch\/[a-zA-Z0-9_\/-]+\.mp4/g) || [];
      for (const relMp4 of mp4Matches) {
        const fullPath = path.resolve(workspace, relMp4);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.size < 1024) {
            console.error(`[ZYVORIQ POST-TOOL AUDIT WARNING]: Video asset ${relMp4} is abnormally small (${stats.size} bytes). Verify media integrity!`);
          }
        }
      }
    }

    // 2. Post-edit verification for TypeScript / JavaScript files
    if (toolName === "write_to_file" || toolName === "replace_file_content") {
      const targetFile = args.TargetFile || "";
      if (targetFile.endsWith(".ts") || targetFile.endsWith(".mjs")) {
        // Quick syntax / existence check
        if (fs.existsSync(targetFile)) {
          const size = fs.statSync(targetFile).size;
          if (size === 0) {
            console.error(`[ZYVORIQ POST-TOOL AUDIT ERROR]: File ${targetFile} was written with 0 bytes!`);
          }
        }
      }
    }

    // Output empty JSON object as required by Jetski PostToolUse contract
    console.log(JSON.stringify({}));
  } catch (err) {
    // Fail-open on hook internal error to avoid blocking agent execution
    console.log(JSON.stringify({}));
  }
});
