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
        // Recursively find recent video outputs anywhere under scratch/ (including worker_assets)
        function findRecentVideos(baseDir, maxAgeMs = 60 * 60 * 1000) {
          let results = [];
          if (!fs.existsSync(baseDir)) return results;
          for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
            const full = path.join(baseDir, entry.name);
            if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
              results = results.concat(findRecentVideos(full, maxAgeMs));
            } else if (entry.isFile() && entry.name.endsWith(".mp4")) {
              try {
                const stat = fs.statSync(full);
                if (Date.now() - stat.mtimeMs < maxAgeMs && (
                  entry.name.includes("master") || entry.name.includes("pilot") || entry.name.includes("reel") ||
                  entry.name.includes("conformed") || entry.name.includes("final") || entry.name.includes("rough") || entry.name.includes("narrated")
                )) {
                  results.push({ fullPath: full, dir: path.dirname(full), name: entry.name, mtimeMs: stat.mtimeMs });
                }
              } catch {}
            }
          }
          return results;
        }

        const recentVideos = findRecentVideos(scratchDir, 60 * 60 * 1000)
          .sort((a, b) => b.mtimeMs - a.mtimeMs)
          .slice(0, 3);

        for (const item of recentVideos) {
          const dir = item.dir;
          const vf = item.name;
          const videoPath = item.fullPath;
          const files = fs.readdirSync(dir);
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
              // Strict 100% uniqueness
              if (fileList.length > 0 && uniqueFiles.size !== fileList.length) {
                console.log(
                  JSON.stringify({
                    decision: "continue",
                    reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Video concat list ${cf} repeats identical clip segments (${uniqueFiles.size} unique out of ${fileList.length} total segments)! Master music videos must consist of 100% unique scene shots without artificial clip looping.`
                  })
                );
                return;
              }

              // Parent-take lineage check: verify raw takes in shots/ match or exceed cut clips
              const shotsSubdir = path.join(dir, "shots");
              if (fs.existsSync(shotsSubdir)) {
                const rawTakes = fs.readdirSync(shotsSubdir).filter(f => /^shot_\d+\.mp4$/i.test(f));
                const performanceCuts = fileList.filter(f => !f.includes("outro") && !f.includes("sweep") && !f.includes("tail"));
                if (rawTakes.length > 0 && performanceCuts.length > rawTakes.length) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Take lineage deduplication violation! Shots directory contains only ${rawTakes.length} raw Veo takes (${rawTakes.join(", ")}), but concat list ${cf} references ${performanceCuts.length} performance cuts! Reusing slices from the same parent take is strictly forbidden under Rule 32.`
                    })
                  );
                  return;
                }
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
            const scriptFiles = findScripts(dir).concat(
              findScripts(path.join(workspace, "scripts")).filter(sf => {
                try { return Date.now() - fs.statSync(sf).mtimeMs < 60 * 60 * 1000; } catch { return false; }
              })
            );
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
            // ASSERTION 2c: MANDATORY DEEPMIND LYRIA SOUNDTRACK FOR MUSIC_VIDEO REELS
            // =========================================================================
            const prodMatch = videoPath.match(/reels\/([^\/]+)\//);
            if (prodMatch) {
              const prodId = prodMatch[1];
              let prodManifest = null;
              try {
                const dbRes = execSync(`psql -h localhost -p 5433 -U nitinagga -d zyvoriq -t -A -c "SELECT manifest_json FROM reel_productions WHERE id='${prodId}'"`, { timeout: 3000 }).toString();
                if (dbRes) prodManifest = JSON.parse(dbRes);
              } catch {}

              if (prodManifest && prodManifest.genre === "MUSIC_VIDEO") {
                const hasLyria = prodManifest.soundtrack?.provider === "google-deepmind-lyria" ||
                  prodManifest.audio?.provider === "google-deepmind-lyria" ||
                  (prodManifest.soundtrack?.audioUrl && String(prodManifest.soundtrack.audioUrl).includes("lyria"));

                const isPathwayA = prodManifest.audioStrategy === "native" || prodManifest.creationIntent?.audioStrategy === "native";
                if (!hasLyria && !isPathwayA) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Music video production ${prodId} lacks a genuine Google DeepMind Lyria master soundtrack! Path B music videos must generate a dedicated polyphonic music bed via models/lyria-3.5:generateContent, or specify audioStrategy='native' for Path A live singing.`
                    })
                  );
                  return;
                }

                // =========================================================================
                // ASSERTION 2d: VOCAL-GENDER BIOMETRIC LOCKING (ZERO CROSS-GENDER LIP-SYNC)
                // =========================================================================
                const leadChar = prodManifest.characters?.[0];
                const charGender = (leadChar?.biometricDNA?.gender || leadChar?.gender || "").toLowerCase();
                const audioVoice = (prodManifest.audio?.voice || "").toLowerCase();
                const isMaleVoice = ["kore", "charon", "fenrir", "puck"].includes(audioVoice);
                const isFemaleVoice = ["aoede", "leda", "zephyr"].includes(audioVoice);

                if (charGender === "female" && isMaleVoice && !String(prodManifest.topic || "").toLowerCase().includes("duet")) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Cross-gender vocal mismatch in ${prodId}! Lead on-camera character is female (${leadChar?.name || leadChar?.id}) while vocal audio is performed by male voice (${audioVoice}). Re-cast with male artist anchor or re-dub with female vocalist.`
                    })
                  );
                  return;
                }
              }
            }

            // =========================================================================
            // ASSERTION 3: ZERO SILENCE (LOCAL + REMOTE FALLBACK) (-40dB, 0.3s)
            // =========================================================================
            try {
              let silence = "";
              if (fs.existsSync(videoPath)) {
                try {
                  silence = execSync(`ffmpeg -i "${videoPath}" -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1`, { timeout: 8000 }).toString();
                } catch (lErr) {
                  silence = lErr.stdout?.toString?.() || lErr.stderr?.toString?.() || "";
                }
              } else {
                const remotePath = `~/zyvoriq_remote/${relativePath}`;
                const checkCmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -i ${remotePath} -af "silencedetect=noise=-40dB:d=0.3" -f null - 2>&1'`;
                silence = execSync(checkCmd, { timeout: 8000 }).toString();
              }
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
            // ASSERTION 3b: SUB-BASS ENERGY RETENTION (ZERO 200Hz GUTTING BAN)
            // =========================================================================
            try {
              let bassDetect = "";
              const checkBassCmd = `ffmpeg -i "${videoPath}" -af "lowpass=f=120,volumedetect" -f null - 2>&1`;
              bassDetect = execSync(checkBassCmd, { timeout: 8000 }).toString();
              const maxVolMatch = bassDetect.match(/max_volume:\s*([-\d.]+)\s*dB/);
              if (maxVolMatch) {
                const subBassMax = parseFloat(maxVolMatch[1]);
                if (subBassMax <= -60) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: Video ${vf} has virtually zero sub-bass energy below 120Hz (${subBassMax} dB)! Audio was gutted by an aggressive highpass filter. Music video masters must preserve punchy sub-bass, kick drums, and low synth body.`
                    })
                  );
                  return;
                }
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
            if (!anchorPath && fs.existsSync(dir)) {
              const localAnchors = fs.readdirSync(dir).filter(f => (f.startsWith("anchor") || f.startsWith("composite") || f.includes("anchor")) && (f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg")));
              if (localAnchors.length > 0) {
                const comp = localAnchors.find(f => f.includes("composite"));
                anchorPath = path.join(dir, comp || localAnchors[0]);
              }
            }

            if (anchorPath && fs.existsSync(anchorPath) && apiKey) {
              const anchorB64 = fs.readFileSync(anchorPath).toString("base64");
              const anchorMime = anchorPath.endsWith(".png") ? "image/png" : "image/jpeg";
              const remotePath = `~/zyvoriq_remote/${relativePath}`;

              // Assertion 4d: Pre-flight Reference Anchor Still Mouth-Aperture Audit
              try {
                const isNonVocalDance = /non[-\s]?vocal|closed[-\s]?mouth|instrumental_only|dance_only/i.test(relativePath || videoPath);
                if (isNonVocalDance) {
                  const anchorAuditRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{
                        role: "user",
                        parts: [
                          { inlineData: { mimeType: anchorMime, data: anchorB64 } },
                          {
                            text: "You are the Chief Quality Auditor inspecting a reference character anchor still for a non-vocal dance/music video reel.\n" +
                                  "Zero-tolerance rule:\n" +
                                  "1. MOUTH APERTURE & TEETH: For non-vocal dance and performance reels, character anchor stills MUST have mouth closed with lips sealed and ZERO visible teeth.\n" +
                                  "If the character exhibits an open mouth, exposed teeth, or laughing/singing visemes, output FAIL immediately with REASON: ANCHOR_OPEN_MOUTH_DEFECT.\n\n" +
                                  "State your verdict clearly:\n" +
                                  "VERDICT: FAIL or PASS\n" +
                                  "REASON: <concise explanation>"
                          }
                        ]
                      }],
                      generationConfig: { temperature: 0.0 }
                    })
                  });
                  if (anchorAuditRes.ok) {
                    const anchorAuditData = await anchorAuditRes.json();
                    const aText = anchorAuditData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (aText.includes("VERDICT: FAIL") || aText.includes("ANCHOR_OPEN_MOUTH_DEFECT") || (aText.includes("FAIL") && !aText.includes("VERDICT: PASS"))) {
                      const matchReason = aText.match(/REASON:\s*([^\n]+)/i);
                      const aReason = matchReason ? matchReason[1].trim() : aText.slice(0, 300).trim();
                      console.log(
                        JSON.stringify({
                          decision: "continue",
                          reason: `[ZYVORIQ ZERO-TOLERANCE QUALITY GATE BLOCKED]: Reference anchor still (${path.basename(anchorPath)}) failed mouth-aperture audit! Reason: ${aReason}. Regenerate the anchor still with sealed lips and zero visible teeth before continuing.`
                        })
                      );
                      return;
                    }
                  }
                }
              } catch (anchorErr) {}

              // Dynamic duration and uniform timeline sampling across all shot interiors
              let totalDur = 40;
              try {
                if (fs.existsSync(videoPath)) {
                  const parsedDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`, { timeout: 5000 }).toString().trim());
                  if (!isNaN(parsedDur) && parsedDur > 0) totalDur = parsedDur;
                } else {
                  const durCmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${remotePath}'`;
                  const parsedDur = parseFloat(execSync(durCmd, { timeout: 8000 }).toString().trim());
                  if (!isNaN(parsedDur) && parsedDur > 0) totalDur = parsedDur;
                }
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
                  let frameB64 = "";
                  if (fs.existsSync(videoPath)) {
                    frameB64 = execSync(`ffmpeg -y -ss ${t} -i "${videoPath}" -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64`, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                  } else {
                    const b64Cmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${t} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                    frameB64 = execSync(b64Cmd, { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                  }

                  if (frameB64 && frameB64.length > 5000) {
                    const promptText = `You are the Zyvoriq Independent Chief Quality Auditor conducting a zero-tolerance visual continuity inspection.
Compare the provided video frame directly against the reference anchor image.
Zero-tolerance rules:
1. ARTISTIC MEDIUM CONTINUITY: Both the reference anchor and the video frame must be in the EXACT same artistic medium (photorealistic live-action cinema vs 3D CGI animation). If a character shifts into 3D CGI cartoon animation or cartoon styling, output FAIL immediately with REASON: MEDIUM_STYLE_MORPH.
2. ANCHOR IDENTITY & BIOMETRICS: Every character present must match their reference anchor facial bone structure, skin complexion, hair color, and hairstyle (e.g. wavy hair vs braided crown).
3. GARMENT STRUCTURE & CONSTRUCTION: Compare neckline cut, bodice construction (e.g. sweetheart crystal corset vs flat snowflake mesh yoke), sleeve style, and cape/cloak attachment (single-shoulder drape vs neck clasp). If garment construction differs from the anchor by even 5%, output FAIL immediately.
4. NO PHANTOM CHARACTERS: No duplicate performers, no missing lead performers, and no un-anchored extra performers.
5. SCENE-CONTEXT WARDROBE CONTINUITY: If the video frame depicts characters inside a swimming pool, jacuzzi, or water body, verify that they are wearing authentic swimwear (swimsuits, bikinis, trunks, monokinis). If characters are in the water wearing formal blazers, suits, dinner jackets, or evening dresses, output FAIL immediately with REASON: SCENE_WARDROBE_MISMATCH.
6. ENSEMBLE BIOMETRIC DIVERSITY: If multiple characters of the same gender appear in the frame, verify that they have distinctly different hairstyles (e.g. bob vs waves vs braids; buzzcut vs turban vs curls), facial features, and wardrobe colors. If characters appear cloned, homogeneous, or interchangeable, output FAIL immediately with REASON: ENSEMBLE_HOMOGENEITY_DETECTED.
7. MOUTH VISEME STATE & AUDIO-VISUAL HARMONY:
- For non-vocal dance shots, instrumental sections, or background dancers: performers must have closed mouths with lips sealed shut; reject open mouths or laughing visemes (FAIL: OPEN_MOUTH_VISEME_MISMATCH).
- For vocal singing performances where performers are singing lyrics: natural mouth movement, singing articulation, and vocal visemes are expected and required. Only reject if mouth movement violates human anatomy or if characters mouth words during instrumental-only breaks (FAIL: PHANTOM_VOCAL_MOUTHING).
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
                            { inlineData: { mimeType: anchorMime, data: anchorB64 } },
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

                  let preB64 = "";
                  let postB64 = "";
                  if (fs.existsSync(videoPath)) {
                    preB64 = execSync(`ffmpeg -y -ss ${tPre} -i "${videoPath}" -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64`, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                    postB64 = execSync(`ffmpeg -y -ss ${tPost} -i "${videoPath}" -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64`, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                  } else {
                    const preCmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${tPre} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                    const postCmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${tPost} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                    preB64 = execSync(preCmd, { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                    postB64 = execSync(postCmd, { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                  }

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
            } else if (!anchorPath && apiKey && (videoPath.includes("mv_") || videoPath.includes("music") || videoPath.includes("vocal") || videoPath.includes("master"))) {
              // Assertion 4c: Standalone Forensic Viseme & Wardrobe Audit (when no separate anchor still is present)
              try {
                const sampleT = 4.0;
                let frameB64 = "";
                const remotePath = `~/zyvoriq_remote/${relativePath}`;
                if (fs.existsSync(videoPath)) {
                  frameB64 = execSync(`ffmpeg -y -ss ${sampleT} -i "${videoPath}" -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64`, { timeout: 8000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                } else {
                  const b64Cmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss ${sampleT} -i ${remotePath} -vframes 1 -f image2pipe -vcodec mjpeg -q:v 2 - 2>/dev/null | base64'`;
                  frameB64 = execSync(b64Cmd, { timeout: 10000, maxBuffer: 10 * 1024 * 1024 }).toString().replace(/\r?\n|\r/g, "").trim();
                }

                if (frameB64 && frameB64.length > 5000) {
                  const standalonePrompt = `You are the Zyvoriq Chief Quality Auditor inspecting video frame at t=${sampleT}s.
Zero-tolerance rules:
1. SCENE-CONTEXT WARDROBE CONTINUITY: If the frame depicts characters in a swimming pool, jacuzzi, or water body, verify they are wearing authentic swimwear. Reject formal blazers or suits in water (FAIL: SCENE_WARDROBE_MISMATCH).
2. ENSEMBLE BIOMETRIC DIVERSITY: If multiple performers of the same gender appear, verify distinct hairstyles, styling, and appearance (FAIL: ENSEMBLE_HOMOGENEITY_DETECTED).
3. MOUTH VISEME STATE & AUDIO-VISUAL HARMONY: In dance or group celebration scenes without character singing, characters must NOT exhibit open mouths, dropped jaws, laughing visemes, or mouthing of words (FAIL: OPEN_MOUTH_VISEME_MISMATCH). For character vocal singing performances, mouth movement and singing visemes are expected and required.
State your verdict clearly:
VERDICT: FAIL or PASS
REASON: <concise explanation>`;

                  const saRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{
                        role: "user",
                        parts: [
                          { text: standalonePrompt },
                          { inlineData: { mimeType: "image/jpeg", data: frameB64 } }
                        ]
                      }]
                    })
                  });

                  if (saRes.ok) {
                    const saData = await saRes.json();
                    const saText = saData.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (saText.includes("VERDICT: FAIL") || saText.includes('"verdict": "FAIL"') || (saText.includes("FAIL") && !saText.includes("VERDICT: PASS"))) {
                      const matchReason = saText.match(/REASON:\s*([^\n]+)/i);
                      const saReason = matchReason ? matchReason[1].trim() : saText.slice(0, 300).trim();
                      console.log(
                        JSON.stringify({
                          decision: "continue",
                          reason: `[ZYVORIQ ZERO-TOLERANCE QUALITY GATE BLOCKED]: Standalone frame audit at t=${sampleT}s failed! Reason: ${saReason}. Remediate mouth visemes or wardrobe before concluding.`
                        })
                      );
                      return;
                    }
                  }
                }
              } catch (err) {}
            }

            // =========================================================================
            // ASSERTION 4e: MANDATORY MULTIMODAL VOCAL LIP-SYNC AUDIT (ZERO FROZEN LIPS)
            // =========================================================================
            try {
              const isSingingProduction = /vocal|sing/i.test(relativePath || videoPath) && !/non[-\s]?vocal|closed[-\s]?mouth/i.test(relativePath || videoPath);
              if (isSingingProduction) {
                const auditVerdictPath = path.join(dir, "audit_verdict.txt");
                if (fs.existsSync(auditVerdictPath)) {
                  const auditTxt = fs.readFileSync(auditVerdictPath, "utf-8");
                  const hasFailedMovement = auditTxt.includes("LIPS_MOVING: NO") || auditTxt.includes("LIPS_MATCH_AUDIO: NO") || auditTxt.includes("PHONETIC_VARIANCE: NO");
                  const ratingMatch = auditTxt.match(/LIP_SYNC_RATING:\s*([0-9]+)/i);
                  const lipRating = ratingMatch ? parseInt(ratingMatch[1], 10) : 10;
                  const isFail = hasFailedMovement || lipRating < 7 || auditTxt.includes("FAIL: FROZEN_LIPS");

                  if (isFail) {
                    console.log(
                      JSON.stringify({
                        decision: "continue",
                        reason: `[ZYVORIQ ZERO-TOLERANCE QUALITY GATE BLOCKED]: Vocal music video ${relativePath} has frozen lips, static smile, or low lip-sync rating (${lipRating}/10)! Audit reports: ${auditTxt.slice(0, 200)}. Characters must actively articulate singing lyrics with dynamic syllable aperture variance.`
                      })
                    );
                    return;
                  }
                }
              }
            } catch (err) {}

            // =========================================================================
            // ASSERTION 6: CUT-BOUNDARY INITIAL-FRAME PSNR CEILING (< 25 dB)
            // (Verifies sequential tail-frame chaining and bans identical anchor resets)
            // =========================================================================
            try {
              let psnrOut = "";
              if (fs.existsSync(videoPath)) {
                const localCmd = `ffmpeg -y -ss 0.0 -i "${videoPath}" -vframes 1 -q:v 2 /tmp/p0.jpg 2>/dev/null; ffmpeg -y -ss 8.0 -i "${videoPath}" -vframes 1 -q:v 2 /tmp/p8.jpg 2>/dev/null; ffmpeg -y -ss 16.0 -i "${videoPath}" -vframes 1 -q:v 2 /tmp/p16.jpg 2>/dev/null; ffmpeg -i /tmp/p0.jpg -i /tmp/p8.jpg -filter_complex "psnr" -f null - 2>&1; ffmpeg -i /tmp/p8.jpg -i /tmp/p16.jpg -filter_complex "psnr" -f null - 2>&1`;
                psnrOut = execSync(localCmd, { timeout: 10000 }).toString();
              } else {
                const remotePath = `~/zyvoriq_remote/${relativePath}`;
                const p0Cmd = `ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no nitinagga.c.googlers.com 'ffmpeg -y -ss 0.0 -i ${remotePath} -vframes 1 -q:v 2 /tmp/p0.jpg 2>/dev/null; ffmpeg -y -ss 8.0 -i ${remotePath} -vframes 1 -q:v 2 /tmp/p8.jpg 2>/dev/null; ffmpeg -y -ss 16.0 -i ${remotePath} -vframes 1 -q:v 2 /tmp/p16.jpg 2>/dev/null; ffmpeg -i /tmp/p0.jpg -i /tmp/p8.jpg -filter_complex "psnr" -f null - 2>&1; ffmpeg -i /tmp/p8.jpg -i /tmp/p16.jpg -filter_complex "psnr" -f null - 2>&1'`;
                psnrOut = execSync(p0Cmd, { timeout: 15000 }).toString();
              }
              const psnrMatches = [...psnrOut.matchAll(/average:([0-9.]+)/g)].map(m => parseFloat(m[1]));
              for (const p of psnrMatches) {
                if (p >= 25.0) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ ZERO-ILLUSION GATE BLOCKED]: High cross-shot PSNR (${p.toFixed(2)} dB >= 25.0 dB) detected between cut boundary start frames in ${relativePath}! This indicates that Shot N and Shot N+1 both began from the identical static anchor frame (visual snap-back reset). Implement sequential tail-frame chaining so consecutive shots continue forward motion seamlessly.`
                    })
                  );
                  return;
                }
              }
            } catch (e) {}

            // =========================================================================
            // ASSERTION 7: UNIVERSAL MOBILE PLAYBACK & FASTSTART STREAMING AUDIT
            // =========================================================================
            try {
              if (fs.existsSync(videoPath) && videoPath.endsWith(".mp4") && (videoPath.includes("master") || videoPath.includes("final"))) {
                // Check pix_fmt
                const pixFmt = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`, { timeout: 4000 }).toString().trim();
                if (pixFmt && !["yuv420p", "yuvj420p"].includes(pixFmt)) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ MOBILE COMPATIBILITY GATE BLOCKED]: Video ${relativePath} uses pixel format '${pixFmt}' instead of 'yuv420p'! Master reels must be encoded with -pix_fmt yuv420p to prevent mobile Safari/Android hardware playback failures.`
                    })
                  );
                  return;
                }

                // Check moov atom placement (faststart)
                const vStats = fs.statSync(videoPath);
                const readLen = Math.min(vStats.size, 131072);
                const fd = fs.openSync(videoPath, "r");
                const buf = Buffer.alloc(readLen);
                fs.readSync(fd, buf, 0, readLen, 0);
                fs.closeSync(fd);
                const moovPos = buf.indexOf("moov");
                const mdatPos = buf.indexOf("mdat");
                if (moovPos === -1 || (mdatPos !== -1 && moovPos > mdatPos)) {
                  console.log(
                    JSON.stringify({
                      decision: "continue",
                      reason: `[ZYVORIQ MOBILE STREAMING GATE BLOCKED]: Video ${relativePath} lacks +faststart streaming optimization (moov atom is placed after mdat or at end of file)! Remaster with -movflags +faststart to enable instantaneous mobile streaming.`
                    })
                  );
                  return;
                }
              }
            } catch (e) {}

            // =========================================================================
            // ASSERTION 8: DENSE FRAME-LEVEL CADENCE & MOUTH LINGERING AUDIT
            // (Physically decodes frames and rejects any video where lips linger or move in slow-mo)
            // =========================================================================
            try {
              if (fs.existsSync(videoPath) && videoPath.endsWith(".mp4") && (videoPath.includes("master") || videoPath.includes("vocal"))) {
                const forensicScript = path.resolve(process.cwd(), "scripts/guards/gate_frame_cadence_forensics.mjs");
                if (fs.existsSync(forensicScript)) {
                  try {
                    execSync(`node "${forensicScript}" "${videoPath}"`, { timeout: 35000, stdio: "pipe" });
                  } catch (forensicErr) {
                    const errOutput = forensicErr.stdout ? forensicErr.stdout.toString() : (forensicErr.stderr ? forensicErr.stderr.toString() : forensicErr.message);
                    console.log(
                      JSON.stringify({
                        decision: "continue",
                        reason: `[ZYVORIQ FRAME-LEVEL CADENCE GATE BLOCKED]: Video ${relativePath} failed physical frame cadence forensics!\n${errOutput.split("\n").filter(l => l.includes("GATE 10 FAILED") || l.includes("MOUTH_LINGERING") || l.includes("CADENCE_MISMATCH")).join("\n") || "Mouth motion persists after acoustic vocals end, or mouth articulation is slower than audio syllables."}\nRemediation: Ensure prompts mandate closed lips the millisecond singing ends, and match cadence to audio rate.`
                      })
                    );
                    return;
                  }
                }
              }
            } catch (e) {}
        }
      }
    }

    // Default: allow stop
    console.log(JSON.stringify({}));
  } catch (err) {
    console.log(JSON.stringify({}));
  }
});
