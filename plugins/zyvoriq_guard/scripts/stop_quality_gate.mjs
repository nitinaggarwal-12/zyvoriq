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
            function findScripts(baseDir) {
              let res = [];
              if (!fs.existsSync(baseDir)) return res;
              for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
                const full = path.join(baseDir, entry.name);
                if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
                  res = res.concat(findScripts(full));
                } else if (entry.isFile() && (entry.name.endsWith(".mjs") || entry.name.endsWith(".ts"))) {
                  res.push(full);
                }
              }
              return res;
            }
            const scriptFiles = findScripts(path.join(workspace, "scripts")).concat(findScripts(dir));
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
            // ASSERTION 2b: DETECT SYNTHETIC OSCILLATOR AUDIO (ZERO SINE WAVE BAN)
            // =========================================================================
            for (const sf of scriptFiles) {
              if (fs.existsSync(sf)) {
                const sContent = fs.readFileSync(sf, "utf-8");
                if (
                  (sContent.includes("sine=frequency=") || sContent.includes("anoisesrc=")) &&
                  (sContent.includes("master_soundtrack") || sContent.includes("bed") || sContent.includes("music"))
                ) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Synthetic audio oscillator detected in ${path.basename(sf)} (sine=frequency=/anoisesrc=)! Simulating music with monotone test tones or sine hums is strictly forbidden. Master soundtracks must be generated via Google DeepMind Lyria (models/lyria-3.5:generateContent).`
                    })
                  );
                  return;
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
              if (anchorFiles.length > 0) {
                const comp = anchorFiles.find(f => f.includes("composite"));
                anchorPath = path.join(anchorsDir, comp || anchorFiles[0]);
              }
            }

            if (anchorPath && fs.existsSync(anchorPath) && apiKey) {
              const anchorB64 = fs.readFileSync(anchorPath).toString("base64");
              const remotePath = `~/zyvoriq_remote/${relativePath}`;

              // Dynamic duration and uniform timeline sampling across all shot interiors
              let totalDur = 40;
              try {
                const durCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${remotePath}'`;
                const parsedDur = parseFloat(execSync(durCmd, { timeout: 10000 }).toString().trim());
                if (!isNaN(parsedDur) && parsedDur > 0) totalDur = parsedDur;
              } catch {}

              // 4a. Anchor-Conditioned Visual Audit at Shot Midpoints
              const numSamples = Math.min(8, Math.max(4, Math.floor(totalDur / 10)));
              const sampleCutTimes = [];
              const interval = totalDur / numSamples;
              for (let i = 0; i < numSamples; i++) {
                sampleCutTimes.push(Math.round((i * interval + interval / 2) * 10) / 10);
              }

              for (const t of sampleCutTimes) {
                try {
                  const b64Cmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${t} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                  const frameB64 = execSync(b64Cmd, { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();

                  if (frameB64 && frameB64.length > 5000) {
                    const promptText = `You are the Zyvoriq Independent Chief Quality Auditor conducting a zero-tolerance visual continuity inspection.
Compare the provided video frame directly against the reference anchor image.
Zero-tolerance rules:
1. ARTISTIC MEDIUM CONTINUITY: Both the reference anchor and the video frame must be in the EXACT same artistic medium (photorealistic live-action cinema vs 3D CGI animation). If a character shifts into 3D CGI cartoon animation or cartoon styling, output FAIL immediately with REASON: MEDIUM_STYLE_MORPH.
2. ANCHOR IDENTITY & BIOMETRICS: Every character present must match their reference anchor facial bone structure, skin complexion, hair color, and hairstyle (e.g. wavy hair vs braided crown).
3. GARMENT STRUCTURE & CONSTRUCTION: Compare neckline cut, bodice construction (e.g. sweetheart crystal corset vs flat snowflake mesh yoke), sleeve style, and cape/cloak attachment (single-shoulder drape vs neck clasp). If garment construction differs from the anchor by even 5%, output FAIL immediately.
4. NO PHANTOM CHARACTERS: No duplicate performers, no missing lead performers, and no un-anchored extra performers.
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

              // =========================================================================
              // ASSERTION 4b: PAIRWISE CUT-BOUNDARY DELTA INSPECTION (SEAM COMPARISON)
              // =========================================================================
              // Identify cut boundaries (e.g. every 10s or from concat list)
              const cutSeams = [];
              for (let s = 10; s <= totalDur - 5; s += 10) {
                cutSeams.push(s);
              }

              for (const cutTime of cutSeams) {
                try {
                  const tPre = Math.max(0.1, Math.round((cutTime - 0.2) * 10) / 10);
                  const tPost = Math.min(totalDur - 0.1, Math.round((cutTime + 0.2) * 10) / 10);

                  const preCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${tPre} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                  const postCmd = `ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${tPost} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;

                  const preB64 = execSync(preCmd, { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                  const postB64 = execSync(postCmd, { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();

                  if (preB64.length > 5000 && postB64.length > 5000) {
                    const seamPrompt = `You are the Zyvoriq Chief Quality Auditor inspecting a pairwise cut transition at seam t=${cutTime}s.
Compare the OUTGOING frame (just before cut at t=${tPre}s) directly with the INCOMING frame (just after cut at t=${tPost}s).
Zero-tolerance transition rules:
1. ENVIRONMENTAL & LIGHTING CONTINUITY: The time of day, sky, weather, and color temperature must be continuous across the cut. A violent jump from broad daylight/sunlight to nighttime/midnight aurora in consecutive performance cuts is strictly forbidden (FAIL: DAY_NIGHT_LIGHTING_JUMP).
2. ACTOR BIOMETRIC CAST LOCKING: The same character must not jump to a different human actor across the seam. Facial bone structure, jawline geometry, nose shape, eye spacing, and skin texture must belong to the exact same performer. Cast substitutions between shots are strictly forbidden (FAIL: ACTOR_CAST_SUBSTITUTION).
3. WARDROBE & ACCESSORY STABILITY: Garments, accessories, cloaks, and fasteners must remain stable across the cut. Sudden appearance of brooches, buttons, sleeve changes, or shifting bodice crystal patterns across the seam is strictly forbidden (FAIL: WARDROBE_SEAM_MORPH).

State your verdict clearly:
VERDICT: FAIL or PASS
REASON: <concise explanation>`;

                    const seamRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contents: [{
                          role: "user",
                          parts: [
                            { text: seamPrompt },
                            { text: `\n[OUTGOING VIDEO FRAME AT t=${tPre}s]:` },
                            { inlineData: { mimeType: "image/jpeg", data: preB64 } },
                            { text: `\n[INCOMING VIDEO FRAME AT t=${tPost}s]:` },
                            { inlineData: { mimeType: "image/jpeg", data: postB64 } }
                          ]
                        }]
                      })
                    });

                    if (seamRes.ok) {
                      const seamData = await seamRes.json();
                      const seamText = seamData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                      let isSeamFail = false;
                      let seamReason = "";

                      if (seamText.includes("VERDICT: FAIL") || seamText.includes('"verdict": "FAIL"') || (seamText.includes("FAIL") && !seamText.includes("VERDICT: PASS"))) {
                        isSeamFail = true;
                        const matchReason = seamText.match(/REASON:\s*([^\n]+)/i);
                        seamReason = matchReason ? matchReason[1].trim() : seamText.slice(0, 300).trim();
                      }

                      if (isSeamFail) {
                        console.log(
                          JSON.stringify({
                            decision: "continue",
                            reason: `[ZYVORIQ ZERO-TOLERANCE QUALITY GATE BLOCKED]: Cut-boundary transition defect at t=${cutTime}s! Outgoing frame (t=${tPre}s) and incoming frame (t=${tPost}s) failed continuity! Reason: ${seamReason}. Remediate environmental lighting and actor consistency across cuts.`
                          })
                        );
                        return;
                      }
                    }
                  }
                } catch (e) {
                  // Proceed if network call or extraction fails
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
