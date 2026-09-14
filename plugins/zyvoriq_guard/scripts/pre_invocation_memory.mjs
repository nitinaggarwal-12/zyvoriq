#!/usr/bin/env node
// ZYVORIQ RULES ENGINE aware memory injector (v3.0)
let inputData = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => { inputData += chunk; });

process.stdin.on("end", () => {
  try {
    const memory = [
      "1. STEP 1 FIRST: Never generate or stitch video before DeepMind Lyria master audio & lyrics manifest are saved to scratch/.",
      "2. ZERO FAKE LOOPING (CLIP LOOP BAN): Never loop or repeat identical clips in music videos. Every cut must be a unique, dedicated camera shot.",
      "3. ZERO AUDIO COLLISION: Never superimpose vocal stems on an un-ducked vocal bed. Duck bed to <= 0.20 when lead vocals enter.",
      "4. ANCHOR-CONDITIONED ZERO-TOLERANCE VISUAL CONTINUITY: Every cut boundary must match reference character anchors within 5%.",
      "5. DIRECT VIDEO AUDITING (NO DETACHED JPEGS/MP3s): Multimodal audits MUST inline actual video (mimeType video/mp4) so the auditor sees motion AND hears audio. Detached still frames cannot detect desync and produce false PASS verdicts. ENFORCED by pre_tool_guard.",
      "6. NATIVE SINGING AUDIBILITY & LIP-SYNC: If an on-screen character sings, their native vocal MUST remain audible and synchronized. NEVER strip native audio from singing clips and dub a different track over them. ENFORCED by pre_tool_guard.",
      "7. ZERO SILENCE: Final videos must have 0 silence intervals across the entire timeline.",
      "8. CUT-BOUNDARY ACOUSTIC CONTINUITY: Never hard-cut vocals mid-syllable; apply 300ms decay and crossfade stems.",
      "9. REMOTE CLOUDTOP EXECUTION: All heavy ffmpeg, rendering, and test harnesses must execute on Cloudtop (nitinagga.c.googlers.com).",
      "10. ENVIRONMENTAL & LIGHTING CONTINUITY: Never jump time-of-day between consecutive shots of a continuous scene.",
      "11. CUT-BOUNDARY PAIRWISE CONTINUITY & CAST LOCKING: Facial bone structure, jawline, skin texture and accessories must stay locked across cuts.",
      "12. GENUINE LYRIA MUSIC MANDATE (ZERO SYNTHETIC OSCILLATOR BAN): Master soundtracks must come from Google DeepMind Lyria. Simulated tone/noise generators are forbidden.",
      "13. MANDATORY SEQUENTIAL TAIL-FRAME CHAINING (ZERO ANCHOR RE-USE RESET): Never pass the same anchor image to consecutive shots. Shot N+1 MUST condition on Shot N's extracted tail frame. Cross-cut initial-frame PSNR must be < 25 dB. ENFORCED by pre_tool_guard + stop gate.",
      "14. AUDIO-VISUAL VOCAL COINCIDENCE (ZERO PHANTOM MOUTHING): Veo is DEAF - it has no audio input and cannot hear Lyria. Never prompt 'singing' without first extracting vocal onset T_vocal. During instrumental passages the performer must be directed with 'mouth closed, non-vocal dance performance'. ENFORCED by pre_tool_guard.",
      "15. GUARD INSTALL-PATH INTEGRITY: The runtime loads guards from ~/.gemini/config/plugins/zyvoriq_guard/. Editing the repo copy alone has NO effect. After ANY guard edit you MUST run `npm run guard:sync` and verify with `npm run guard:drift`.",
      "16. NO INERT GOVERNANCE: A rule that no script reads is not a rule. Every rule key in .agents/hooks.json must be consumed by lib/rules_engine.mjs and enforced by an actual detector, or it must be deleted.",
      "17. SCENE-CONTEXT WARDROBE LOCK: Aquatic, pool, beach, and swimming scenes MUST enforce authentic swimwear (bikinis, swimsuits, trunks, monokinis). Never generate street clothes, blazers, dinner jackets, or evening gowns in water. ENFORCED by pre_tool_guard + stop gate.",
      "18. ENSEMBLE BIOMETRIC DIFFERENTIATION (ANTI-CLONING): When generating an ensemble of 2+ characters of the same gender, they MUST have mutually exclusive hairstyle silhouettes (e.g. bob vs waves vs braids vs buzzcut vs turban), skin undertones, accessories, and wardrobe colors. Zero clone faces.",
      "19. MULTI-CHARACTER VOCAL LOCK & SHOT BUDGET: Ensemble wide shots must lock non-lead characters to 'mouth closed, non-vocal dance and reaction' during singing lines. Multi-character reels must respect minimum duration geometry (>=30s for 4-6 characters).",
      "20. TRUE PATH B VOCAL PERFORMANCE & LIP-SYNC (ZERO FROZEN-LIPS BAN): When singing vocals play on the soundtrack (t >= T_vocal), on-camera performers MUST be actively singing with dynamic lip movement, mouth articulation, and jaw movement matching song lyrics. Sealed lips or frozen mouths during vocal delivery is strictly prohibited. Veo singing prompts must inject negativePrompt banning closed mouth/motionless lips. Stop quality gate asserts LIPS_MOVING: YES & LIPS_MATCH_AUDIO: YES.",
      "21. VOCAL-STATE ACOUSTIC-VISUAL TIMELINE LOCKING: Strictly bifurcate performance directives: mouth closed for instrumental breaks (0.0s - T_vocal); active vocal articulation and singing to camera for singing sections (t >= T_vocal). Never mix 'mouth closed' with active vocal singing.",
      "22. CONTEXT-AWARE CHARACTER ANCHOR PLATES: Non-vocal dance reels mandate sealed-lip anchors; vocal singing reels require natural relaxed resting lips (neutral facial posture, no forced grimaces), providing a fluid, un-clamped base for Veo mouth articulation.",
      "23. ZERO SMILE DILUTION IN SINGING PROMPTS: Never combine singing performance directives with smile tokens ('smiling between phrases', 'smiling while singing', 'lounging with smile'). Diffusion models bias heavily toward frozen smiles over syllable articulation.",
      "24. PATH B ACOUSTIC LYRIC SNAPPING: Before generating video in Path B, transcribe the master Lyria track with exact second-by-second timestamps. Video prompts must include second-by-second phrase markers ('At 0-2s: ...'). Lyrics must never cross cut boundaries mid-sentence.",
      "25. DETERMINISTIC SHOT CACHE PURGING: Never silently reuse stale shot video files when prompt, lyrics, or lip-sync configurations change. Purge or force-regenerate all affected shots."
    ].join("\n");

    console.log(JSON.stringify({
      injectSteps: [
        {
          ephemeralMessage: "\n\n[ZYVORIQ ZERO-ILLUSION MANDATORY PRODUCTION GATEKEEPERS]:\n" + memory
        }
      ],
      hookSpecificOutput: {
        hookEventName: "PreInvocation",
        additionalContext: "\n\n[ZYVORIQ ZERO-ILLUSION MANDATORY PRODUCTION GATEKEEPERS]:\n" + memory
      }
    }));
  } catch {
    console.log(JSON.stringify({}));
  }
});
