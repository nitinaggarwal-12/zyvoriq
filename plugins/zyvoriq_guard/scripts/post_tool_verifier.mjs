#!/usr/bin/env node
/**
 * ZYVORIQ POST-TOOL VERIFIER (v6.6.0 - Command & File Deliverable Integrity + Trinity Enforcement)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let buf = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", c => { buf += c; });
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(buf || "{}");
    const toolCall = payload.toolCall || payload.tool_call || {};
    const args = toolCall.args || payload.tool_input || payload.args || {};
    const cmdStr = args.CommandLine || args.command || "";
    const explicitTarget = args.TargetFile || args.AbsolutePath || args.file_path || "";

    const candidateMedia = [];
    if (explicitTarget && /\.(?:mp4|wav|mp3|m4a)$/i.test(explicitTarget)) {
      candidateMedia.push(explicitTarget);
    }
    for (const m of cmdStr.matchAll(/([A-Za-z0-9_./-]+\.(?:mp4|wav|mp3|m4a))/gi)) {
      candidateMedia.push(m[1]);
    }

    for (const relOrAbs of candidateMedia) {
      const p = path.resolve(ROOT, relOrAbs);
      if (fs.existsSync(p)) {
        const st = fs.statSync(p);
        if (st.size < 1024) {
          console.log(JSON.stringify({
            decision: "block",
            reason: `[ZYVORIQ POST-TOOL VERIFIER]: Deliverable ${p} is truncated/empty (${st.size} bytes < 1024 bytes).`
          }));
          return;
        }
      }
    }

    if (!explicitTarget || /(?:hooks\.json|AGENTS\.md|GEMINI\.md|CLAUDE\.md|skills\.md)/i.test(explicitTarget)) {
      execSync(`node "${path.join(ROOT, "scripts", "guards", "enforce_universal_single_source_trinity.mjs")}" --auto-heal`, {
        cwd: ROOT,
        stdio: "pipe",
        timeout: 10000
      });
    }
    console.log(JSON.stringify({}));
  } catch (err) {
    console.log(JSON.stringify({
      decision: "block",
      reason: "[ZYVORIQ POST-TOOL VERIFIER FAIL-CLOSED]: " + err.message
    }));
  }
});
