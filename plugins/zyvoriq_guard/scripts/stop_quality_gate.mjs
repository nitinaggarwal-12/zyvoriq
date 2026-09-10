#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

let inputData = "";
process.stdin.setEncoding("utf-8");

process.stdin.on("data", (chunk) => {
  inputData += chunk;
});

process.stdin.on("end", async () => {
  try {
    const payload = JSON.parse(inputData || "{}");
    const workspace = payload.workspacePaths?.[0] || "";

    if (workspace.includes("zyvoriq") && payload.terminationReason === "model_stop") {
      // Load workspace environment variables for API keys
      try {
        const envPath = path.join(workspace, ".env.local");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf-8");
          for (const line of envContent.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
              const [k, ...v] = trimmed.split("=");
              if (!process.env[k]) process.env[k] = v.join("=");
            }
          }
        }
      } catch {}

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const scratchDir = path.join(workspace, "scratch");

      if (fs.existsSync(scratchDir)) {
        // Find recent subfolders in scratch/
        const subdirs = fs.readdirSync(scratchDir)
          .map((d) => path.join(scratchDir, d))
          .filter((p) => {
            try { return fs.statSync(p).isDirectory(); } catch { return false; }
          })
          .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

        for (const dir of subdirs) {
          const dirAgeMs = Date.now() - fs.statSync(dir).mtimeMs;
          if (dirAgeMs > 60 * 60 * 1000) continue; // Only check projects touched in last 1 hour

          const files = fs.readdirSync(dir);
          const videoFiles = files.filter(
            (f) =>
              f.endsWith(".mp4") &&
              (f.includes("master") || f.includes("pilot") || f.includes("reel") || f.includes("conformed") || f.includes("final"))
          );

          for (const vf of videoFiles) {
            const videoPath = path.join(dir, vf);
            const videoAgeMs = Date.now() - fs.statSync(videoPath).mtimeMs;
            if (videoAgeMs > 15 * 60 * 1000) continue; // Only verify videos produced or modified in active generation (< 15 min)
            const relativePath = path.relative(workspace, videoPath);

            // =========================================================================
            // ASSERTION 1: DETECT -stream_loop AND REPEATED CLIPS IN CONCAT LISTS
            // =========================================================================
            const concatFiles = files.filter((f) => f.startsWith("concat") && f.endsWith(".txt"));
            for (const cf of concatFiles) {
              const cfPath = path.join(dir, cf);
              const lines = fs.readFileSync(cfPath, "utf-8").split("\n").filter((l) => l.trim().startsWith("file"));
              const fileList = lines.map((l) => l.replace(/^file\s+['"]?/, "").replace(/['"]?$/, "").trim());
              const uniqueFiles = new Set(fileList);
              if (fileList.length > 0 && uniqueFiles.size < fileList.length * 0.75) {
                console.log(
                  JSON.stringify({
                    decision: "continue",
                    reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Video concat list ${cf} repeats identical clip segments (${uniqueFiles.size} unique out of ${fileList.length} total segments)! Master music videos must consist of unique scene shots without artificial clip looping.`
                  })
                );
                return;
              }
            }

            // Check if active scripts in directory or scripts/ used -stream_loop
            const scriptFiles = [
              path.join(workspace, "scripts", "auditorium", "produce_euro_auditorium_trio_5min_reel.mjs"),
              path.join(workspace, "scripts", "auditorium", "produce_euro_auditorium_trio.mjs")
            ];
            for (const sf of scriptFiles) {
              if (fs.existsSync(sf)) {
                const sContent = fs.readFileSync(sf, "utf-8");
                if (sContent.includes("-stream_loop") && !sContent.includes("// -stream_loop")) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Generation script ${path.basename(sf)} contains -stream_loop! Looping short video clips causes visual jumps, breaks character costume continuity across iterations, and destroys lip-sync synchronization. Every segment must be a unique, dedicated generation.`
                    })
                  );
                  return;
                }
              }
            }

            // =========================================================================
            // ASSERTION 2: DETECT AUDIO COLLISIONS (UN-DUCKED VOCAL BEDS)
            // =========================================================================
            for (const sf of scriptFiles) {
              if (fs.existsSync(sf)) {
                const sContent = fs.readFileSync(sf, "utf-8");
                if (sContent.includes("amix") && (sContent.includes("adelay") || sContent.includes("vox"))) {
                  const bedMatch = sContent.match(/\[0:a\]volume=([0-9.]+)/);
                  if (bedMatch && parseFloat(bedMatch[1]) >= 0.35) {
                    console.log(
                      JSON.stringify({
                        decision: "continue",
                        reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Audio collision detected in ${path.basename(sf)}! Backing music bed volume is set to ${bedMatch[1]} while superimposing vocal stems. When vocal stems enter, the backing bed must be ducked to <= 0.20 or use an instrumental accompaniment bed to prevent vocal clashing, doubling, and phasing.`
                      })
                    );
                    return;
                  }
                }
              }
            }

            // =========================================================================
            // ASSERTION 3: REMOTE ZERO SILENCE ON CLOUDTOP (-40dB, 0.3s)
            // =========================================================================
            try {
              const remotePath = `~/zyvoriq_remote/${relativePath}`;
              const checkCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -i ${remotePath} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1'`;
              const silence = execSync(checkCmd, { timeout: 15000 }).toString();
              if (silence.includes("silence_start")) {
                console.log(
                  JSON.stringify({
                    decision: "continue",
                    reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: ${relativePath} contains digital silence intervals! Audio must play continuously without dropouts across all cut boundaries. Remediate audio mix before concluding.`
                  })
                );
                return;
              }
            } catch (e) {}

            // =========================================================================
            // ASSERTION 4: CUT-BOUNDARY ANCHOR-CONDITIONED ZERO-TOLERANCE VISUAL AUDIT
            // =========================================================================
            const anchorsDir = path.join(dir, "anchors");
            let anchorPath = "";
            if (fs.existsSync(anchorsDir)) {
              const anchorFiles = fs.readdirSync(anchorsDir).filter((f) => f.includes("composite") || f.includes("anchor"));
              if (anchorFiles.length > 0) anchorPath = path.join(anchorsDir, anchorFiles[0]);
            }

            if (anchorPath && fs.existsSync(anchorPath) && apiKey) {
              const anchorB64 = fs.readFileSync(anchorPath).toString("base64");
              // Sample cut boundary frames (e.g. 15s, 18s, 30s, 35s, 45s)
              const sampleCutTimes = [15, 18, 30, 35, 45];
              for (const t of sampleCutTimes) {
                try {
                  const remotePath = `~/zyvoriq_remote/${relativePath}`;
                  const b64Cmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${t} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                  const frameB64 = execSync(b64Cmd, { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();

                  if (frameB64 && frameB64.length > 5000) {
                    const promptText = `You are the Zyvoriq Independent Chief Quality Auditor conducting a zero-tolerance visual continuity inspection.
Compare the provided video frame directly against the reference anchor image.
Zero-tolerance rules:
1. Every character present must match their reference anchor costume, color, fabric, and accessories EXACTLY.
2. If Yasmina's silver tiara or sapphire blue starburst gown is missing or changed (e.g. into dark green or sleeveless), output FAIL immediately.
3. If Leyla's turquoise silk belly dance costume or gold forehead headpiece is missing or changed, output FAIL immediately.
4. If Simran's yellow halter top or white shorts are missing or changed, output FAIL immediately.
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
                            { text: `\n[VIDEO FRAME AT t=${t}s]:` },
                            { inlineData: { mimeType: "image/jpeg", data: frameB64 } }
                          ]
                        }]
                      })
                    });

                    if (res.ok) {
                      const data = await res.json();
                      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      let isFail = false;
                      let reason = "";

                      if (responseText.includes("VERDICT: FAIL") || responseText.includes('"verdict": "FAIL"') || (responseText.includes("FAIL") && !responseText.includes("VERDICT: PASS"))) {
                        isFail = true;
                        const matchReason = responseText.match(/REASON:\s*([^\n]+)/i);
                        reason = matchReason ? matchReason[1].trim() : responseText.slice(0, 300).trim();
                      }

                      if (isFail) {
                        console.log(
                          JSON.stringify({
                            decision: "continue",
                            reason: `[ZYVORIQ ZERO-TOLERANCE QUALITY GATE BLOCKED]: Visual discontinuity detected at cut boundary t=${t}s against reference anchor! Reason: ${reason}. Remediate shot generation and wardrobe continuity before concluding.`
                          })
                        );
                        return;
                      }
                    }
                  }
                } catch (err) {
                  // If remote extraction or network call fails, proceed to next checks
                }
              }
            }

            // =========================================================================
            // ASSERTION 5: CHECK AUDIT REPORT VERDICT
            // =========================================================================
            const auditReportPaths = [
              path.join(dir, "audit_5m", "forensic_audit_report.md"),
              path.join(dir, "audit", "forensic_audit_report.md"),
              path.join(dir, "forensic_audit_report.md")
            ];

            for (const arp of auditReportPaths) {
              if (fs.existsSync(arp)) {
                const reportContent = fs.readFileSync(arp, "utf-8");
                if (
                  reportContent.includes("VERDICT: FAIL") ||
                  reportContent.includes("FINAL COMPREHENSIVE VERDICT]:\nFAIL") ||
                  reportContent.includes("AUDIT RESULT: FAIL")
                ) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ QUALITY GATE BLOCKED]: The forensic multimodal audit report at ${arp} indicates FAIL! All biometric continuity, vocal sync, and acoustic gates must PASS before concluding. Remediate defects autonomously.`
                    })
                  );
                  return;
                }
              }
            }
          }
        }
      }
    }

    // Default: allow stop
    console.log(JSON.stringify({}));
  } catch (err) {
    console.log(JSON.stringify({}));
  }
});
