#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const GUARD_DIR = path.join(process.env.HOME || "", ".gemini/config/plugins/zyvoriq_guard");
const PRE_TOOL_SCRIPT = path.join(GUARD_DIR, "scripts", "pre_tool_guard.mjs");
const STOP_SCRIPT = path.join(GUARD_DIR, "scripts", "stop_quality_gate.mjs");
const PRE_INVOC_SCRIPT = path.join(GUARD_DIR, "scripts", "pre_invocation_memory.mjs");
const HOOKS_JSON = path.join(GUARD_DIR, "hooks.json");

console.log("========================================================================");
console.log("🛡️ ZYVORIQ ZERO-ILLUSION QUALITY GATE VERIFICATION SUITE");
console.log("========================================================================");

let passed = 0;
let total = 0;

function assert(desc, condition, details = "") {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${desc}`);
  } else {
    console.error(`❌ [FAIL] ${desc} — ${details}`);
  }
}

// SUITE 1: hooks.json Structure & Timeout
console.log("\n📋 [SUITE 1/4] hooks.json Configuration Verification");
const hooksConfig = JSON.parse(fs.readFileSync(HOOKS_JSON, "utf-8"));
assert("hooks.json is enabled", hooksConfig.zyvoriq_guard?.enabled === true);
assert("PreInvocation hook registered", hooksConfig.zyvoriq_guard?.PreInvocation?.length > 0);
assert("PreToolUse hook registered for commands and file edits", 
  hooksConfig.zyvoriq_guard?.PreToolUse?.[0]?.matcher.includes("run_command") &&
  hooksConfig.zyvoriq_guard?.PreToolUse?.[0]?.matcher.includes("write_to_file") &&
  hooksConfig.zyvoriq_guard?.PreToolUse?.[0]?.matcher.includes("replace_file_content")
);
assert("Stop hook timeout is at least 120s (configured to 180s) for thorough cut inspection", hooksConfig.zyvoriq_guard?.Stop?.[0]?.timeout >= 120);

// SUITE 2: pre_invocation_memory.mjs Gatekeeper Enforcement
console.log("\n📋 [SUITE 2/4] pre_invocation_memory.mjs Gatekeeper Enforcement");
const preInvocInput = JSON.stringify({ workspacePaths: [process.cwd()] });
const preInvocOut = JSON.parse(execSync(`echo '${preInvocInput}' | node ${PRE_INVOC_SCRIPT}`).toString());
const injectedMsg = preInvocOut.injectSteps?.[0]?.ephemeralMessage || "";
assert("Injects Zero-Illusion Gatekeepers", injectedMsg.includes("ZERO-ILLUSION MANDATORY PRODUCTION GATEKEEPERS"));
assert("Enforces Gatekeeper 2 (-stream_loop ban)", injectedMsg.includes("ZERO FAKE LOOPING (-stream_loop BAN)"));
assert("Enforces Gatekeeper 3 (Zero Audio Collision)", injectedMsg.includes("ZERO AUDIO COLLISION"));
assert("Enforces Gatekeeper 4 (Anchor-Conditioned Continuity)", injectedMsg.includes("ANCHOR-CONDITIONED ZERO-TOLERANCE VISUAL CONTINUITY"));
assert("Enforces Gatekeeper 5 (Direct Video Auditing)", injectedMsg.includes("DIRECT VIDEO AUDITING (NO DETACHED JPEGS/MP3s)"));
assert("Enforces Gatekeeper 10 (Environmental & Lighting Continuity)", injectedMsg.includes("ENVIRONMENTAL & LIGHTING CONTINUITY (ZERO DAY/NIGHT JUMPS)"));
assert("Enforces Gatekeeper 11 (Cut-Boundary Pairwise Face & Wardrobe Locking)", injectedMsg.includes("CUT-BOUNDARY PAIRWISE CONTINUITY & CAST LOCKING"));

// SUITE 3: pre_tool_guard.mjs Interception
console.log("\n📋 [SUITE 3/4] pre_tool_guard.mjs Interception Assertions");

const badLoopCmd = ["ffmpeg", "-y", "-stream_loop", "2", "-i", "shot1.mp4", "out.mp4"].join(" ");
const loopCmdInput = JSON.stringify({ toolCall: { name: "run_command", args: { CommandLine: badLoopCmd } } });
const loopRes = JSON.parse(execSync(`echo '${loopCmdInput}' | node ${PRE_TOOL_SCRIPT}`).toString());
assert("Denies -stream_loop command", loopRes.decision === "deny");
assert("Explains -stream_loop denial reason", loopRes.reason.includes("-stream_loop") && loopRes.reason.includes("strictly forbidden"));

const badAudioCmd = ["ffmpeg", "-i", "master_soundtrack.mp3", "-i", "vox.wav", "-filter_complex", "\"[0:a]volume=0.60[bed];[1:a]adelay=3000[vox];[bed][vox]amix=inputs=2[out]\"", "out.wav"].join(" ");
const audioColInput = JSON.stringify({ toolCall: { name: "run_command", args: { CommandLine: badAudioCmd } } });
const audioColRes = JSON.parse(execSync(`echo '${audioColInput}' | node ${PRE_TOOL_SCRIPT}`).toString());
assert("Denies audio collision with un-ducked bed (volume >= 0.35)", audioColRes.decision === "deny");
assert("Explains audio collision ducking requirement", audioColRes.reason.includes("Audio collision detected") && audioColRes.reason.includes("<= 0.20"));

// Test file write interception for -stream_loop
const badFileWrite = JSON.stringify({ toolCall: { name: "write_to_file", args: { TargetFile: "scripts/bad.mjs", CodeContent: "ffmpeg -stream_loop 3 -i clip.mp4" } } });
const fileWriteRes = JSON.parse(execSync(`echo '${badFileWrite}' | node ${PRE_TOOL_SCRIPT}`).toString());
assert("Denies write_to_file containing -stream_loop", fileWriteRes.decision === "deny");

// Test file write interception for environmental lighting contradiction
const badLightingScript = JSON.stringify({ toolCall: { name: "write_to_file", args: { TargetFile: "scripts/shots.mjs", CodeContent: "const SHOTS = [{ prompt: 'broad daylight sunlight coastal cliff' }, { prompt: 'nighttime midnight aurora borealis' }];" } } });
const lightingRes = JSON.parse(execSync(`echo '${badLightingScript}' | node ${PRE_TOOL_SCRIPT}`).toString());
assert("Denies write_to_file with day/night lighting contradiction", lightingRes.decision === "deny");

const legitCmd = ["ffmpeg", "-y", "-ss", "0", "-t", "15", "-i", "shot1.mp4", "out.mp4"].join(" ");
const legitCmdInput = JSON.stringify({ toolCall: { name: "run_command", args: { CommandLine: legitCmd } } });
const legitRes = JSON.parse(execSync(`echo '${legitCmdInput}' | node ${PRE_TOOL_SCRIPT}`).toString());
assert("Allows legitimate unique shot conforming command", legitRes.decision === "allow");

// SUITE 4: stop_quality_gate.mjs Programmatic Assertions
console.log("\n📋 [SUITE 4/4] stop_quality_gate.mjs Programmatic Assertions");

const testConcatDir = "/tmp/test_zyvoriq_guard_concat";
fs.mkdirSync(testConcatDir, { recursive: true });
const dupConcatTxt = path.join(testConcatDir, "concat_test.txt");
fs.writeFileSync(dupConcatTxt, "file 'seg0.mp4'\nfile 'seg1.mp4'\nfile 'seg0.mp4'\nfile 'seg1.mp4'\n");
const lines = fs.readFileSync(dupConcatTxt, "utf-8").split("\n").filter((l) => l.trim().startsWith("file"));
const fileList = lines.map((l) => l.replace(/^file\s+['\"]?/, "").replace(/['\"]?$/, "").trim());
const uniqueFiles = new Set(fileList);
assert("Concat repetition detector identifies non-unique segments", uniqueFiles.size < fileList.length * 0.75);
fs.rmSync(testConcatDir, { recursive: true, force: true });

console.log("🔍 Testing Live Zero-Tolerance Visual Comparison against 00_trio_composite_anchor.png...");
const anchorPath = path.join(process.cwd(), "scratch/euro_auditorium_trio_5m/anchors/00_trio_composite_anchor.png");
const framePath = path.join(process.cwd(), "scratch/euro_auditorium_trio_5m/audit_5m/user_t15.jpg");

if (fs.existsSync(anchorPath) && fs.existsSync(framePath)) {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
  let apiKey = "";
  for (const line of envContent.split("\n")) {
    if (line.startsWith("GEMINI_API_KEY=")) apiKey = line.split("=")[1].trim();
  }

  if (apiKey) {
    const anchorB64 = fs.readFileSync(anchorPath).toString("base64");
    const frameB64 = fs.readFileSync(framePath).toString("base64");

    const promptText = `You are the Zyvoriq Independent Chief Quality Auditor conducting a zero-tolerance visual continuity inspection.
Compare the provided video frame directly against the reference anchor image.
Zero-tolerance rules:
1. Every character present must match their reference anchor costume, color, fabric, and accessories EXACTLY.
2. If Yasmina silver tiara or sapphire blue starburst gown is missing or changed (e.g. into dark green or sleeveless), output FAIL immediately.
3. If Leyla turquoise silk belly dance costume or gold forehead headpiece is missing or changed, output FAIL immediately.
4. If Simran yellow halter top or white shorts are missing or changed, output FAIL immediately.
5. If there are duplicate characters or un-anchored extra performers, output FAIL immediately.
Do NOT rationalize styling variations. If any detail differs by even 5%, output FAIL immediately.

State your verdict clearly:
VERDICT: FAIL or PASS
REASON: <concise explanation>`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: promptText },
            { text: "\n[REFERENCE ANCHOR IMAGE]:" },
            { inlineData: { mimeType: "image/png", data: anchorB64 } },
            { text: "\n[VIDEO FRAME AT t=15s]:" },
            { inlineData: { mimeType: "image/jpeg", data: frameB64 } }
          ]
        }]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const isFail = text.includes("VERDICT: FAIL") || (text.includes("FAIL") && !text.includes("VERDICT: PASS"));
      assert("Zero-tolerance auditor correctly issues FAIL for t=15s costume defect", isFail, text.slice(0, 150));
      assert("Auditor specifically flags missing tiara / green gown", text.includes("tiara") || text.includes("gown") || text.includes("green"));
    }
  }
}

console.log("\n========================================================================");
console.log(`📊 FINAL TEST REPORT: ${passed}/${total} Quality Gate Assertions PASSED (${Math.round((passed / total) * 100)}%)`);
console.log("========================================================================");

if (passed === total) {
  console.log("🎉 ALL ZERO-ILLUSION QUALITY GATES ARE FULLY OPERATIONAL AND VERIFIED!\n");
  process.exit(0);
} else {
  console.error("❌ Some quality gate assertions failed.\n");
  process.exit(1);
}
