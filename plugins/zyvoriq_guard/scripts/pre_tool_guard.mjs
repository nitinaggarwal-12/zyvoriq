#!/usr/bin/env node
/**
 * ZYVORIQ PRE-TOOL GUARD (v3.0 - Executable Enforcement)
 * ======================================================
 * FIXES APPLIED IN v3.0:
 *  [1] `path` was used but never imported -> every video-assembly check threw
 *      ReferenceError and FAILED OPEN silently. Now imported + fail-closed.
 *  [2] No detector existed for the ffmpeg no-audio flag (strip native audio).
 *      The most destructive flag in the audio pipeline was fully unguarded.
 *  [3] No detector existed for singing prompts lacking vocal-onset proof.
 *  [4] No detector existed for detached-still lip-sync audits (Rule 5).
 *  [5] hooks.json rules were never read. Now loaded via rules_engine.
 *  [6] Guard sources are self-exempt so detector literals cannot self-trip.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let loadRules = () => ({});
try {
  ({ loadRules } = await import(path.join(__dirname, "..", "lib", "rules_engine.mjs")));
} catch {
  try { ({ loadRules } = await import("../lib/rules_engine.mjs")); } catch {}
}

const R = (() => { try { return loadRules(process.cwd()); } catch { return {}; } })();
const on = (k, dflt = true) => (R[k] === undefined ? dflt : R[k] !== false);

// v4.1.1 added the music-video correctness rules as a nested block. Surface it
// here so the detectors below can read it. Defaults are applied per-rule rather
// than relying on the block existing, so an older hooks.json still enforces.
const MV = (R.music_video_correctness && typeof R.music_video_correctness === "object")
  ? R.music_video_correctness
  : {};
const mvOn = (k, dflt = true) => (MV[k] === undefined ? dflt : MV[k] !== false);

// Patterns assembled at runtime so the guard source never contains the raw
// literals it screens for (prevents the guard from denying its own authoring).
const SYNTH_OSC = new RegExp(["sine=freq", "uency=|anoise", "src="].join(""), "i");
const NO_AUDIO_FLAG = new RegExp("(?:^|[\\s\"'`])-" + "an(?:[\\s\"'`]|$)");

let inputData = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", c => { inputData += c; });

process.stdin.on("end", () => {
  let decision = "allow";
  let reason = "";

  try {
    const payload = JSON.parse(inputData || "{}");

    // ==================================================================
    // ENVELOPE NORMALIZATION (fail-closed)
    // ------------------------------------------------------------------
    // PREVIOUS BUG: this read ONLY `payload.toolCall.{name,args}`. Any other
    // envelope shape - notably `{tool_name, tool_input}` - produced an empty
    // toolName + empty args, every detector saw an empty surface, and the
    // guard emitted {"decision":"allow"} while doing zero inspection.
    // That is a total bypass of a hook declared FAIL_CLOSED.
    //
    // We now accept every envelope shape the host may emit, and we DENY on
    // any payload that is non-empty but structurally unrecognized, rather
    // than silently waving it through.
    // ==================================================================
    const toolCall = payload.toolCall || payload.tool_call || payload.toolcall || {};

    const toolName = (
      toolCall.name || toolCall.toolName || toolCall.tool_name ||
      payload.tool_name || payload.toolName || payload.name || ""
    );

    const args = (
      toolCall.args || toolCall.arguments || toolCall.input ||
      payload.tool_input || payload.toolInput || payload.args ||
      payload.arguments || payload.input || payload.parameters || {}
    );

    const argsIsObject = args && typeof args === "object" && !Array.isArray(args);
    const payloadKeys = Object.keys(payload);
    const envelopeRecognized =
      Boolean(toolName) || (argsIsObject && Object.keys(args).length > 0);

    // An empty payload (no stdin / `{}`) is a legitimate no-op: nothing to
    // inspect, nothing to deny. A NON-empty payload we cannot decode is a
    // different matter - it means the host contract changed and every
    // detector below would run blind. Fail closed.
    if (!envelopeRecognized && payloadKeys.length > 0) {
      console.log(JSON.stringify({
        decision: "deny",
        reason:
          "[ZYVORIQ GUARD FAIL-CLOSED - UNRECOGNIZED HOOK ENVELOPE]: Received a non-empty payload " +
          "with keys [" + payloadKeys.join(", ") + "] but could not locate a tool name or argument " +
          "object in any supported envelope shape (toolCall.args / tool_input / args / input / parameters).\n\n" +
          "Refusing to fail open: with an undecodable envelope every downstream detector inspects an " +
          "empty string and would report a false 'allow'. Update the envelope normalizer in " +
          "scripts/pre_tool_guard.mjs to support this shape, then retry."
      }));
      return;
    }

    const cmd = String(
      args.CommandLine || args.command || args.commandLine ||
      args.cmd || args.Command || ""
    ).trim();

    const isWriteOrEdit =
      toolName === "write_to_file" ||
      toolName === "replace_file_content" ||
      toolName === "notebook_edit" ||
      (toolName === "call_mcp_tool" && String(args.ToolName || args.tool_name || "").includes("file"));

    const targetFile = String(
      args.TargetFile || args.NotebookPath ||
      args.file_path || args.filePath || args.path || args.target_file || ""
    );

    let writeContent = String(
      args.CodeContent || args.ReplacementContent || args.Content ||
      args.content || args.code || args.new_string || args.text ||
      (typeof args.Arguments === "object" ? JSON.stringify(args.Arguments) : "") || ""
    ).trim();

    // Last-resort safety net: the envelope was recognized, but none of the
    // known argument keys carried a payload. Rather than inspect an empty
    // surface (the exact failure mode above), serialize the arguments so
    // detector literals cannot be smuggled through an unknown key name.
    if (!writeContent && !cmd && argsIsObject && Object.keys(args).length > 0) {
      writeContent = JSON.stringify(args);
    }

    const surface = writeContent + "\n" + cmd;

    // Word-boundary matching fails on snake_case identifiers because `_` is a
    // word character (e.g. "mv_01_singing_master.mp4" never matched /\bsinging\b/).
    // Normalizing separators to spaces makes token detection reliable.
    const surfaceNorm = surface.replace(/[_\-]+/g, " ");

    // Self-exemption: guard sources, governance docs, and adversarial test
    // fixtures legitimately contain detector literals. Screening them is a
    // false positive that would make the guard untestable and unmaintainable.
    //
    // NOTE: files are frequently authored via `cat <<EOF > path` through
    // run_command, where args.TargetFile is empty. We therefore derive the
    // effective target from shell redirection as well.
    const redirectMatch = cmd.match(/>\s*([A-Za-z0-9_\-./]+\.(?:mjs|js|ts|json|md))/);
    const effectiveTarget = targetFile || (redirectMatch ? redirectMatch[1] : "");

    const isDoc = /\.(md|txt)$/i.test(effectiveTarget);
    const isGuardSource =
      /zyvoriq_guard|scripts\/guards\/|hooks\.json|promptVerifier/i.test(effectiveTarget) ||
      /ZYVORIQ PRE-TOOL GUARD|ZYVORIQ RULES ENGINE|GUARD INSTALLER|GUARD SELF-TEST|GUARD INSTALLER \/ DRIFT DETECTOR/.test(writeContent + cmd);
    const exempt = isDoc || isGuardSource;

    // Negation-awareness: a prompt saying "not singing" / "no mouthing words" / "no laughter"
    // is the CORRECT directorial lock, not a violation. Strip negative prompts and negated forms
    // before testing so negative constraints are not false-positived.
    const stripNegatives = surfaceNorm.replace(/\bnegative[\s_-]*prompt[:=][^;,\n}]+/gi, " ");
    const deNegated = stripNegatives.replace(
      /\b(?:not|no|never|without|zero|non|strictly no)[\s-]*(?:singing|sings|sing|mouthing|talking|vocal|vocals|laughter|laughing|giggle|giggling|cheering|shouting|yelling|screaming|open mouths?)\b/gi,
      " "
    );
    const hasMouthClosedLock = /\b(?:mouth closed|lips together|sealed lips|lips sealed|closed lips|closed-lip|non[-\s]?vocal|no mouthing|no talking)\b/i.test(surfaceNorm);

    // ==================================================================
    // RULE 6 - BAN NATIVE AUDIO STRIPPING ON SINGING SHOTS
    // Root cause of the lip-sync failure: the no-audio flag deleted 100% of
    // Veo's native track, then Lyria was muxed on top => rubber-dub desync.
    // ==================================================================
    if (!exempt && on("ban_native_audio_stripping_on_singing_shots")) {
      const stripsAudio = NO_AUDIO_FLAG.test(surface);
      const mentionsSinging = /\bsing(?:s|ing|er)?\b|\blip\s?sync\b|\bvocal(?:s|ist)?\b|\blyric/i.test(deNegated);
      const isMusicContext = /lyria|music video|\bmv \d|master soundtrack|musicvideo/i.test(surfaceNorm);
      const acknowledged = /NO SINGING IN SHOT|ZERO NATIVE AUDIO JUSTIFIED|PATH_B_LYRIA_MASTER_JUSTIFIED|PATH_B_JUSTIFIED|LYRIA_MASTER_SOUNDTRACK_JUSTIFIED/i.test(surfaceNorm);

      if (stripsAudio && mentionsSinging && isMusicContext && !acknowledged && !hasMouthClosedLock) {
        decision = "deny";
        reason =
          "[ZYVORIQ LIP-SYNC GATE - RULE 6 VIOLATION]: This operation strips ALL native audio from clips whose " +
          "prompts reference singing/vocals, then muxes a separate Lyria track over the top.\n\n" +
          "Veo has NO audio input. It cannot hear Lyria, so its mouth animation is generated blind. Deleting the " +
          "native track and dubbing a different song over it produces guaranteed rubber-dub desync (phantom mouthing).\n\n" +
          "RESOLUTION - choose one:\n" +
          "  (A) DIRECTORIAL LOCK: Remove all singing/vocal language from Veo prompts. Direct the performer to dance, " +
          "model, and move to the beat with 'mouth closed, no mouthing words, non-vocal dance performance'. Lyria then " +
          "plays as a soundtrack (standard for fashion/dance reels) and desync becomes structurally impossible.\n" +
          "  (B) NEURAL VISEME PASS: Keep singing, but run an audio-conditioned lip re-synthesis pass so the mouth is " +
          "physically warped to the Lyria vocal phonemes before final mux.\n\n" +
          "If stripping is genuinely correct (pure instrumental, mouth verifiably closed), annotate the script with " +
          "the token NO_SINGING_IN_SHOT to record that justification.";
      }
    }

    // ==================================================================
    // RULE 14 - BAN SINGING PROMPTS WITHOUT VOCAL-ONSET PROOF
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_singing_prompts_during_instrumental_intros")) {
      const isLibrary = /generate_international_music_video/i.test(effectiveTarget) || /export\s+(?:async\s+)?function\s+generateVeo/i.test(surface);
      const isVeoGen = !isLibrary && /generateVeoClip|generateVeoShot|predictLongRunning/i.test(surfaceNorm);
      const hasSingingPrompt = /\b(?:singing|sings)\b/i.test(deNegated);
      const hasOnsetProof = /vocalOnset|extractVocalOnset|\bT vocal\b|vocal onset/i.test(surfaceNorm);

      if (isVeoGen && hasSingingPrompt && !hasOnsetProof) {
        decision = "deny";
        reason =
          "[ZYVORIQ LIP-SYNC GATE - RULE 14 VIOLATION]: This script dispatches Veo prompts containing 'singing' but " +
          "performs NO pre-flight acoustic vocal-onset extraction (no vocalOnset / extractVocalOnset / T_vocal symbol).\n\n" +
          "Veo is deaf. Prompting 'singing' makes it hallucinate arbitrary mouth movement unrelated to the Lyria vocal " +
          "track. If the music is still in its instrumental intro, the character mouths words over pure instrumentation " +
          "(PHANTOM_VOCAL_MOUTHING).\n\n" +
          "Either extract T_vocal first and gate singing prompts to t >= T_vocal, or switch the shot to " +
          "'mouth closed, non-vocal dance performance'.";
      }
    }

    // ==================================================================
    // RULE 5 - BAN DETACHED-STILL LIP-SYNC / AUDIO-VISUAL AUDITS
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_detached_still_frame_lipsync_audits")) {
      const isAuditScript = /audit|forensic|verdict|quality_gate|qa\//i.test(effectiveTarget) || /VERDICT:\s*PASS/i.test(surface);
      const feedsStills =
        /readFileSync\([^)]*\.(?:jpg|jpeg|png)[^)]*\)\s*\.toString\(\s*["']base64["']\s*\)/i.test(surface) ||
        /mimeType:\s*["']image\/(?:jpeg|png)["']/i.test(surface);
      const claimsAvVerdict = /lip[-\s]?sync|vocal coincidence|audio[-\s]?visual|\bmouth\b|viseme|phantom/i.test(surface);
      const hasRealMedia = /mimeType:\s*["'](?:video\/mp4|audio\/(?:mpeg|mp3|wav))["']/i.test(surface);

      if (isAuditScript && feedsStills && claimsAvVerdict && !hasRealMedia) {
        decision = "deny";
        reason =
          "[ZYVORIQ AUDIT INTEGRITY GATE - RULE 5 VIOLATION]: This audit claims to evaluate lip-sync / audio-visual " +
          "coincidence but only uploads detached still images to the model. A still frame contains no audio and no " +
          "temporal information - the model physically CANNOT detect desync and will return a false PASS.\n\n" +
          "Inline the real media instead: { mimeType: 'video/mp4', data: <base64 mp4> } so the auditor sees motion AND " +
          "hears the soundtrack on one unified timeline.";
      }
    }

    // ==================================================================
    // RULE 2 - ZERO FAKE LOOPING
    // ==================================================================
    if (decision === "allow" && on("ban_stream_loop") && !exempt) {
      const LOOP = "-stream" + "_loop";
      const executableLoop =
        new RegExp("(?:ffmpeg|avconv)[^;\\n]*[\\s\"']" + LOOP + "[\\s\"']|exec(?:Sync|File)?\\([^)]*" + LOOP, "i").test(writeContent) ||
        (writeContent.includes(LOOP) && !/BAN|GATEKEEPER|prohibited|forbidden/.test(writeContent));
      if (executableLoop) {
        decision = "deny";
        reason = "[ZYVORIQ ZERO-ILLUSION GUARD - RULE 2]: Executable clip looping detected! Looping short clips causes visual jumping, breaks costume continuity, and destroys lip-sync. Every segment must be a unique, dedicated generation.";
      }
      const loopMatch = cmd.match(new RegExp(LOOP + "\\s+(\\d+)"));
      if (decision === "allow" && loopMatch && parseInt(loopMatch[1], 10) > 0 && !cmd.startsWith("git ")) {
        decision = "deny";
        reason = "[ZYVORIQ ZERO-ILLUSION GUARD - RULE 2]: Clip looping (" + loopMatch[1] + ") is strictly forbidden in music video productions.";
      }
    }

    // ==================================================================
    // RULE 13 - SEQUENTIAL TAIL-FRAME CHAINING
    // ==================================================================
    if (decision === "allow" && !exempt && on("require_sequential_tail_frame_chaining")) {
      const staticAnchorLoop =
        /(?:for\s*\([^)]*shots\)|shots\.map|shots\.forEach)[^}]*generateVeo(?:Clip|Shot)\([^)]*anchor/i.test(writeContent) &&
        !writeContent.includes("tail") && !writeContent.includes("sseof");
      if (staticAnchorLoop) {
        decision = "deny";
        reason = "[ZYVORIQ ZERO-ILLUSION GUARD - RULE 13]: Cannot reuse an identical anchor still across consecutive shots! Veo pins Frame 0 to the input image, causing a snap-back reset at every cut. Implement sequential tail-frame chaining.";
      }
    }

    // ==================================================================
    // RULE 12 - GENUINE LYRIA (ZERO SYNTHETIC OSCILLATOR)
    // ==================================================================
    if (decision === "allow" && !exempt && SYNTH_OSC.test(surface) && /master_soundtrack|bed|music|lyria/i.test(surface)) {
      decision = "deny";
      reason = "[ZYVORIQ ZERO-ILLUSION GUARD - RULE 12]: Synthetic oscillator tone detected! Master soundtracks must be generated by Google DeepMind Lyria, never simulated with synthetic tone or noise generators.";
    }

    // ==================================================================
    // RULE 15 - VOCAL GENDER ALIGNMENT (ZERO CROSS-GENDER LIP-SYNC)
    // ==================================================================
    if (decision === "allow" && !exempt && on("enforce_vocal_gender_alignment")) {
      const mentionsFemalePerformer = /female|woman|girl|actress|urban_pop_icon/i.test(surfaceNorm);
      const mentionsMaleVoice = /voice:\s*["']?(?:Kore|Puck|Fenrir|Orus|male)/i.test(surface);
      const isSingingContext = /\bsing(?:s|ing)?\b|\blip\s?sync\b/i.test(surfaceNorm);
      if (mentionsFemalePerformer && mentionsMaleVoice && isSingingContext && !/duet|chorus|backup/i.test(surfaceNorm)) {
        decision = "deny";
        reason = "[ZYVORIQ GENDER-ALIGNMENT GUARD - RULE 15]: Cross-gender vocal mismatch detected! A female character anchor is mapped to a male singing voice without duet isolation. All singing shots must be biometrically gender-locked.";
      }
    }

    // ==================================================================
    // RULE 3 - VOCAL BED DUCKING
    // ==================================================================
    if (decision === "allow" && !exempt && /amix/i.test(surface) && /adelay|vox/i.test(surface)) {
      const bedMatch = surface.match(/\[0:a\]volume=([0-9.]+)/);
      const maxBed = typeof R.max_vocal_bed_volume === "number" ? R.max_vocal_bed_volume : 0.20;
      if (bedMatch && parseFloat(bedMatch[1]) >= 0.35) {
        decision = "deny";
        reason = "[ZYVORIQ ZERO-ILLUSION GUARD - RULE 3]: Audio collision! Bed volume " + bedMatch[1] + " while mixing vocal stems. Must duck to <= " + maxBed + ".";
      }
    }

    // ==================================================================
    // RULE 1 - STEP-1-FIRST (path now correctly imported; no silent throw)
    // ==================================================================
    if (decision === "allow" && (toolName === "run_command" || cmd)) {
      const isAssembly = (cmd.includes("assemble_") || cmd.includes("mux") || cmd.includes("concat_video")) && cmd.includes("scratch/");
      if (isAssembly) {
        const m = cmd.match(/scratch\/([a-zA-Z0-9_-]+)/);
        if (m) {
          const d = path.resolve(process.cwd(), "scratch", m[1]);
          const hasAudio = ["master_soundtrack_5min.mp3", "master_soundtrack_full_300s.mp3", "master_soundtrack.mp3", "lyria_24s.mp3"]
            .some(f => fs.existsSync(path.join(d, f)));
          const hasLyrics = ["lyrics_timestamps.json", "lyrics_timestamps_5m.json"]
            .some(f => fs.existsSync(path.join(d, f)));
          if (!hasAudio && !hasLyrics) {
            decision = "deny";
            reason = "[ZYVORIQ ARCHITECTURAL GUARD - RULE 1]: Cannot assemble video in scratch/" + m[1] + " - Step 1 (Lyria master soundtrack + lyrics manifest) has not been generated yet.";
          }
        }
      }
    }

    // ==================================================================
    // RULE 17 - BAN INAPPROPRIATE WATER SCENE WARDROBE (SCENE-CONTEXT LOCK)
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_inappropriate_water_scene_wardrobe")) {
      const isWaterEnvironment = /\b(?:pool|swimming|poolside|infinity pool|jacuzzi|water park)\b/i.test(surfaceNorm);
      const isInsideWater = /\b(?:in the pool|in the water|waist deep|splashing|immersed in|swimming in)\b/i.test(surfaceNorm);
      const hasDryFormalWear = /\b(?:blazer|dinner jacket|tuxedo|formal gown|evening gown|business suit|leather jacket)\b/i.test(surfaceNorm);
      const hasSwimwear = /\b(?:swimwear|swimsuit|bikini|monokini|swim trunks|trunks|bathing suit|boardshorts)\b/i.test(surfaceNorm);
      const isAcknowledged = /DRY_CLOTHES_JUSTIFIED|SURREAL_FASHION_JUSTIFIED/i.test(surface);

      if (isWaterEnvironment && !isAcknowledged) {
        if (hasDryFormalWear) {
          decision = "deny";
          reason =
            "[ZYVORIQ WARDROBE GUARD - RULE 17 VIOLATION]: Dry formal wear detected in a pool/water scene! " +
            "Characters in aquatic, pool, or swimming scenes must wear authentic swimwear (swimsuits, bikinis, trunks, monokinis). " +
            "Generating blazers, suits, dinner jackets, or evening gowns in water is strictly prohibited.\n\n" +
            "Remediation: Update prompt/wardrobe to authentic swimwear, or annotate with DRY_CLOTHES_JUSTIFIED if intentionally surreal.";
        } else if (isInsideWater && !hasSwimwear) {
          decision = "deny";
          reason =
            "[ZYVORIQ WARDROBE GUARD - RULE 17 VIOLATION]: Characters are described immersed in water without explicit swimwear! " +
            "All prompts describing characters in the pool/water must explicitly specify swimwear cut and style (e.g. swim trunks, bikini, monokini).\n\n" +
            "Remediation: Explicitly add swimwear descriptors to the character/shot prompt.";
        }
      }
    }

    // ==================================================================
    // RULE 18 - ENFORCE ENSEMBLE BIOMETRIC DIFFERENTIATION (ANTI-CLONING)
    // ==================================================================
    if (decision === "allow" && !exempt && on("enforce_ensemble_biometric_differentiation")) {
      const isPromptOrGen = /\b(?:prompt|shot|scene|video|veo|predictLongRunning|generateImagen|cinematic|portrait)\b/i.test(surfaceNorm) || /scripts\/music\/|scripts\/reel/i.test(effectiveTarget);
      const isMultiCharacterPrompt = isPromptOrGen && /\b(?:ensemble|group shot|all (?:3|4|5|6|7|8)|three women|three men|friends (?:in|at))\b/i.test(surfaceNorm);
      const hasExplicitDiversity = /\b(?:distinct|mutually exclusive|differentiation matrix|buzzcut|turban|bob\b|braids?|curtain bangs|shaggy curls)\b/i.test(surfaceNorm);
      const isAcknowledged = /HOMOGENEOUS_CAST_JUSTIFIED/i.test(surface);

      if (isMultiCharacterPrompt && !hasExplicitDiversity && !isAcknowledged) {
        decision = "deny";
        reason =
          "[ZYVORIQ ENSEMBLE GUARD - RULE 18 VIOLATION]: Multi-character ensemble prompt lacks 5-Axis Biometric Differentiation! " +
          "When generating an ensemble with 2+ characters of the same gender, the prompt MUST enforce mutually exclusive hairstyle " +
          "silhouettes (e.g., bob vs waves vs braids; buzzcut vs turban vs curls), contrasting skin tones, and distinct wardrobe colors.\n\n" +
          "Remediation: Detail distinct haircuts and styling for each character in the prompt, or annotate with HOMOGENEOUS_CAST_JUSTIFIED.";
      }
    }

    // ==================================================================
    // RULE 19 - BAN ENSEMBLE GROUP VOCAL BLEED (SINGLE VOCALIST LOCK)
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_ensemble_group_vocal_bleed")) {
      const isGroupFrame = /\b(?:group shot|ensemble wide|all (?:3|4|5|6)|friends in the pool|crew)\b/i.test(surfaceNorm);
      const directsSoloSinging = /\bsings these EXACT words|sings:\s*["']|lead vocal performance\b/i.test(surfaceNorm);
      const hasSoloFocusWithMouthLock = /\b(?:close-up on|isolated on|solo framing)\b/i.test(surfaceNorm) && hasMouthClosedLock;
      const isAcknowledged = /GROUP_UNISON_VOCALS_JUSTIFIED/i.test(surface);

      if (isGroupFrame && directsSoloSinging && !hasSoloFocusWithMouthLock && !hasMouthClosedLock && !isAcknowledged) {
        decision = "deny";
        reason =
          "[ZYVORIQ VOCAL-BLEED GUARD - RULE 19 VIOLATION]: Solo singing directed in a multi-character group shot! " +
          "Multi-character wide shots cannot assign solo singing lyrics to an ensemble frame without camera isolation on the lead " +
          "and 'mouth closed, lips together, non-vocal dance/reaction' directives for background characters. Veo will attempt to " +
          "animate multiple mouths simultaneously, creating rubber-dub vocal bleed.\n\n" +
          "Remediation: Lock the group shot to non-vocal choreography ('mouth closed, non-vocal dance'), or isolate the lead in a single-performer close-up.";
      }
    }

    // ==================================================================
    // RULE 20 - BAN PROMPT CONTRADICTIONS & EMOTIONAL OPEN-MOUTH TOKENS
    // Root cause of lip-sync failure: prompts coupling "mouth closed" with
    // "genuine laughter with mouths closed". Diffusion video models prioritize
    // dynamic action tokens over negative constraints, generating open mouths,
    // dropped jaws, and laughing visemes that clash with vocal soundtracks.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_prompt_contradictions_and_open_mouth_tokens")) {
      const isVeoOrPrompt = /veo|predictLongRunning|prompt|shot/i.test(surfaceNorm) || /scripts\/music\/|scripts\/reel/i.test(effectiveTarget);
      const isAcknowledged = /OPEN_MOUTH_LAUGHTER_JUSTIFIED|AUDIT_VISEME_RULE/i.test(surface);

      if (isVeoOrPrompt && !isAcknowledged) {
        // Extract string literals or inspect lines/paragraphs for prompt contradiction
        const stringLiterals = surface.match(/["'`]([^"'`]{15,})["'`]/g) || [surface];
        for (const lit of stringLiterals) {
          // If this is an audit prompt, assertion instruction, or error message, skip it
          if (/auditing|inspection|Zero-tolerance rules|answer strictly|VERDICT|FAIL or PASS|QUALITY_GATE|Error|throw|diagnostic|assert/i.test(lit)) continue;

          const norm = lit.replace(/[_\-]+/g, " ");
          const closed = /\b(?:mouth closed|lips together|sealed lips|lips sealed|closed lips|closed-lip|non[-\s]?vocal|no mouthing)\b/i.test(norm);
          const deNeg = norm.replace(
            /\b(?:not|no|never|without|zero|non|strictly no)[\s-]*(?:singing|sings|sing|mouthing|talking|vocal|vocals|laughter|laughing|giggle|giggling|cheering|shouting|yelling|screaming|open mouths?)\b/gi,
            " "
          );
          const openAction = /\b(?:laughter|laughing|giggle|giggling|cheering|shouting|yelling|screaming|talking|mouth open|open mouth|jaw drop)\b/i.test(deNeg);

          if (closed && openAction) {
            decision = "deny";
            reason =
              "[ZYVORIQ PROMPT CONTRADICTION - RULE 20 VIOLATION]: Prompt couples closed-mouth / non-vocal dance directives " +
              "with conflicting oral action tokens (e.g., laughter, laughing, cheering, shouting, yelling) in the same prompt:\n\n" +
              `"${lit.slice(0, 160)}..."\n\n` +
              "Diffusion video models (Google Veo) prioritize dynamic emotional action tokens over negative constraints like " +
              "'with mouth closed'. Including 'laughter' or 'cheering' produces wide open mouths, dropped jaws, and laughing " +
              "visemes, causing visual lip-sync failure when Lyria vocal soundtracks play.\n\n" +
              "Remediation: Replace 'laughter' / 'cheering' with 'closed-lip smile', 'poised dance expression', or 'joyful closed-lip smiles'. " +
              "If open-mouth laughter is genuinely required (e.g. comedic spoken dialogue where audio has recorded laughter), annotate with OPEN_MOUTH_LAUGHTER_JUSTIFIED.";
            break;
          }
        }
      }
    }

    // ==================================================================
    // RULE 22 - BAN OPEN-MOUTH & LAUGHING TOKENS IN CHARACTER ANCHOR PROMPTS
    // Root cause of lip-sync failure in dance reels: Veo locks Frame 0 to the
    // anchor still. If the anchor prompt contains "warm smile", "laughing", or
    // "singing smile", Imagen draws exposed teeth and open lips. Veo pins Frame 0
    // to that open mouth, propagating open-mouth visemes across all chained shots.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_open_mouth_tokens_in_character_anchors")) {
      const isAnchorGen = /generateImagenAnchor|anchorPrompt|anchorStill|anchorLead|anchorCoStar|anchor_.*\.jpg/i.test(surfaceNorm);
      const isAcknowledged = /OPEN_MOUTH_ANCHOR_JUSTIFIED|NATIVE_SINGING_ANCHOR|PATH_B_VOCAL_ANCHOR|relaxed lips/i.test(surface);

      if (isAnchorGen && !isAcknowledged) {
        const stringLiterals = surface.match(/["'`]([^"'`]{20,})["'`]/g) || [surface];
        for (const lit of stringLiterals) {
          if (/auditing|inspection|Zero-tolerance rules|answer strictly|VERDICT|FAIL or PASS|QUALITY_GATE|Error|throw|diagnostic|assert/i.test(lit)) continue;
          const norm = lit.replace(/[_\-]+/g, " ");
          const isAnchorText = /portrait|anchor|dna|stunning|radiant|wearing|masterpiece/i.test(norm);
          if (!isAnchorText) continue;

          const deNeg = norm.replace(
            /\b(?:not|no|never|without|zero|non|strictly no)[\s-]*(?:singing|sings|sing|mouthing|talking|vocal|vocals|laughter|laughing|giggle|giggling|cheering|shouting|yelling|screaming|open mouths?|teeth visible)\b/gi,
            " "
          );
          const hasOpenToken = /\b(?:warm smile|broad smile|radiant smile|confident smile|laughing|laughter|giggle|giggling|open mouth|mouth open|teeth visible|singing smile|singing expression)\b/i.test(deNeg);
          const hasClosedLock = /\b(?:mouth closed|lips together|sealed lips|lips sealed|closed lips|closed-lip|no teeth visible)\b/i.test(norm);

          if (hasOpenToken && !hasClosedLock) {
            decision = "deny";
            reason =
              "[ZYVORIQ ANCHOR INTEGRITY - RULE 22 VIOLATION]: Character anchor prompt contains open-mouth, laughing, or unprotected smile tokens without closed-lip enforcement:\n\n" +
              `"${lit.slice(0, 160)}..."\n\n` +
              "Veo pins Frame 0 (t=0.0s) directly to the character anchor still. Prompts with 'warm smile', 'confident smile', or 'laughing' cause Imagen/Nano Banana to generate visible teeth and open lips. " +
              "Veo inherits this open mouth on Frame 0 and propagates open-mouth visemes throughout the dance reel, triggering OPEN_MOUTH_VISEME_MISMATCH.\n\n" +
              "Remediation: For non-vocal dance reels, explicitly mandate closed lips: 'lips firmly sealed together, mouth closed, serene closed-lip expression, no teeth visible, strictly no open mouth'. " +
              "For vocal singing productions where relaxed resting lips are used, annotate with NATIVE_SINGING_ANCHOR or PATH_B_VOCAL_ANCHOR.";
            break;
          }
        }
      }
    }

    // ==================================================================
    // RULE 23 - BAN FROZEN-LIP & SILENT-DANCE DIRECTIVES ON VOCAL SHOTS
    // Root cause of "lips aren't moving at all": when a master audio track
    // contains lead vocal singing (t >= T_vocal), prompting the performer
    // with "mouth closed", "lips sealed", or "no mouthing words" forces
    // Veo to keep lips motionless while singing plays, destroying lip-sync.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_frozen_lips_during_vocal_sections")) {
      const isVeoGen = /generateVeoClip|generateVeoShot|predictLongRunning/i.test(surfaceNorm);
      const hasClosedDirective = /\b(?:mouth closed|lips firmly sealed|lips sealed together|lips together|closed lips|no mouthing of words)\b/i.test(surfaceNorm);
      const isSingingSong = /master_vocal_song|full vocal song|vocal song|lead female singing|lead male singing/i.test(surfaceNorm);
      const isAcknowledged = /INSTRUMENTAL_SECTION_JUSTIFIED|DANCE_BREAK_JUSTIFIED|NO_SINGING_IN_SHOT/i.test(surface);

      if (isVeoGen && hasClosedDirective && isSingingSong && !isAcknowledged) {
        decision = "deny";
        reason =
          "[ZYVORIQ VOCAL LIP-SYNC - RULE 23 VIOLATION]: Directing 'mouth closed' or 'lips sealed' on a video shot paired with a vocal singing song!\n\n" +
          "When singing vocals are playing on the master track, performers on camera MUST be directed with active vocal lip sync " +
          "('sings the lyrics directly to camera, mouth and lips moving actively with natural vocal articulation, visible jaw movement in sync with the song'). " +
          "Prompting 'mouth closed' during singing produces frozen, motionless lips while vocals play.\n\n" +
          "Remediation: Direct the performer to sing the lyrics to camera with active mouth articulation. " +
          "If this specific cut is an instrumental break or pure dance solo, annotate with INSTRUMENTAL_SECTION_JUSTIFIED.";
      }
    }

    // ==================================================================
    // RULE 24 - BAN SMILE DILUTION IN SINGING PERFORMANCE PROMPTS
    // Root cause of frozen open-mouthed smile: in diffusion video models,
    // "smiling between phrases" or "smiling expressively" causes the model
    // to lock the character into a static open smile throughout the shot,
    // overriding vocal syllable articulation.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_smile_dilution_in_singing_prompts")) {
      const isVeoGen = /generateVeoClip|generateVeoShot|predictLongRunning/i.test(surfaceNorm);
      const isSingingShot = /\bsing(?:ing|s)?\b|\blip[-\s]?sync\b/i.test(surfaceNorm);
      const hasSmileDilution = /\b(?:smiling expressively between vocal phrases|smiling between phrases|smiling while singing|lounging with smile)\b/i.test(surfaceNorm);
      const isAcknowledged = /SMILE_DILUTION_JUSTIFIED/i.test(surface);

      if (isVeoGen && isSingingShot && hasSmileDilution && !isAcknowledged) {
        decision = "deny";
        reason =
          "[ZYVORIQ VOCAL LIP-SYNC - RULE 24 VIOLATION]: Singing prompt contains smile dilution tokens ('smiling between phrases')!\n\n" +
          "Diffusion video models strongly bias toward static smiling over phoneme shaping. " +
          "Phrasing like 'smiling expressively between vocal phrases' causes Veo to render a frozen open grin with zero syllable enunciation.\n\n" +
          "Remediation: Direct the performer with active syllable enunciation ('dynamic mouth and jaw movement enunciating words syllable by syllable, distinct phonetic visemes opening and closing with each phrase').";
      }
    }

    // ==================================================================
    // RULE 25 - REQUIRE PATH B ACOUSTIC LYRIC SNAPPING & TIMESTAMPS
    // In Path B (Lyria vocal track + Veo video), prompts must specify
    // second-by-second acoustic timing cues (e.g. "At 0-2s:", "At 3s:")
    // so Veo shapes mouth visemes at the exact timestamps vocals occur.
    // ==================================================================
    if (decision === "allow" && !exempt && on("require_path_b_acoustic_lyric_snapping")) {
      const isPathB = /master_vocal_song|full vocal song|lyria.*vocal/i.test(surfaceNorm);
      const isVeoShot = /generateVeoClip|generateVeoShot/i.test(surfaceNorm);
      const isSinging = /\bsing(?:ing|s)?\b|\blip[-\s]?sync\b/i.test(surfaceNorm);
      const hasTimestampCues = /\b(?:0-[0-9]s|[0-9]-[0-9]+s|At\s+[0-9]+(?:\.[0-9]+)?s|timestamp|cadence)\b/i.test(surfaceNorm);
      const isAcknowledged = /ACOUSTIC_SNAPPING_EXEMPT/i.test(surface);

      if (isPathB && isVeoShot && isSinging && !hasTimestampCues && !isAcknowledged) {
        decision = "deny";
        reason =
          "[ZYVORIQ PATH B VOCAL SYNC - RULE 25 VIOLATION]: Singing video prompt lacks second-by-second acoustic timestamp cues!\n\n" +
          "In Path B, Veo generates visuals independently of Lyria audio. To prevent mouth desynchronization, " +
          "the prompt MUST ground lyric delivery to exact second intervals (e.g. 'At 0-2s: Sofia sings [Lyrics], mouth opening to enunciate. At 2-5s: Sofia sings [Lyrics]').\n\n" +
          "Remediation: Transcribe the Lyria audio track and inject timed phrase cues into the prompt.";
      }
    }

    // ==================================================================
    // RULE 26 - REQUIRE ACOUSTIC-NEURAL LATENCY CALIBRATION (ADELAY LOCK)
    // When assembling an external master vocal song with video, FFmpeg must
    // apply calibrated neural audio delay (adelay=50..120ms, default 70ms)
    // to prevent acoustic audio from leading visual mouth motion.
    // ==================================================================
    if (decision === "allow" && !exempt && on("require_acoustic_neural_latency_adelay_calibration")) {
      const isAssembly = /ffmpeg.*-i.*picture.*-i.*(?:master_audio|trimmedAudio|soundtrack)/i.test(surface) ||
                         /ffmpeg.*-i.*picture_concat.*-i.*trimmed/i.test(surface) ||
                         (surface.includes("ffmpeg") && surface.includes("master.mp4") && /master_vocal_song|full vocal song/i.test(surface));
      const hasAdelay = /adelay\s*=\s*[0-9]+/i.test(surface);
      const isExempt = /ADELAY_ZERO_OFFSET_JUSTIFIED/i.test(surface);

      if (isAssembly && !hasAdelay && !isExempt) {
        decision = "deny";
        reason =
          "[ZYVORIQ ACOUSTIC-NEURAL SYNC - RULE 26 VIOLATION]: Master vocal video assembly lacks neural latency audio delay calibration!\n\n" +
          "Diffusion video models exhibit a ~60-90ms physical mouth articulation onset latency relative to prompt timestamps. " +
          "Muxing audio at t=0 causes vocals to arrive before the mouth visibly opens. " +
          "Assembly commands MUST include -filter_complex '[1:a]adelay=70|70[aout]' or justify with ADELAY_ZERO_OFFSET_JUSTIFIED.\n\n" +
          "Remediation: Apply -filter_complex '[1:a]adelay=70|70[aout]' -map 0:v:0 -map '[aout]'.";
      }
    }

    // ==================================================================
    // RULE 28 - BAN CERTIFICATION TAMPERING & QUALITY GATE DE-ENFORCEMENT
    // Blocks any tool call that attempts to weaken fullReelCertification,
    // remove frameCadenceForensics, bypass Gate 10, or re-introduce
    // uncertified music video exemptions.
    // ==================================================================
    if (decision === "allow" && on("ban_certification_tampering")) {
      const targetsCertification = /fullReelCertification\.(?:mjs|ts)/i.test(effectiveTarget);
      const reintroducesBypass = /if\s*\([^)]*isMusicVideoContract\s*\)\s*return\s+true/i.test(surface) ||
                                 /isMusicVideoContract\s*\|\|\s*native-shot-audio-master/i.test(surface);
      const removesCadenceForensics = targetsCertification &&
                                      !/frameCadenceForensics/i.test(surface) &&
                                      surface.length > 500; // full file rewrite without frameCadenceForensics

      if (targetsCertification && (reintroducesBypass || removesCadenceForensics)) {
        decision = "deny";
        reason =
          "[ZYVORIQ ANTI-TAMPER GUARD - RULE 28 VIOLATION]: Attempt to tamper with or weaken Studio 1 Certification!\n\n" +
          "Removing frameCadenceForensics or re-introducing unconditional music video certification bypasses is strictly forbidden. " +
          "All production reels must maintain verified frame-level cadence and lingering motion enforcement.";
      }
    }

    // ==================================================================
    // RULE 29 - BAN ARBITRARY FIXED-DURATION MUSIC VIDEO ASSEMBLY
    // Mandates that all music video shot assemblies must be guided by an
    // acoustic phrase map (extractAcousticPhraseMap / assemblePhraseAlignedMaster)
    // rather than hardcoded 8s/8s fixed-shot splits that produce dead air.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_arbitrary_fixed_duration_mv_assembly")) {
      const isMvAssembly =
        /master[_\s]vocal[_\s]song|full[_\s]vocal[_\s]song|vocal[_\s]mv|music[_\s]video/i.test(surface) ||
        /master vocal song|full vocal song|vocal mv|music video|\bmv\b/i.test(surfaceNorm);
      const isConcat = /concat|picture_concat|ffmpeg.*-f concat/i.test(surfaceNorm);
      const usesAcousticMap = /extractAcousticPhraseMap|assemblePhraseAlignedMaster|acousticPhraseCutter|vocalEvents/i.test(surface);

      if (isMvAssembly && isConcat && !usesAcousticMap && !/FIXED_DURATION_JUSTIFIED/i.test(surface)) {
        decision = "deny";
        reason =
          "[ZYVORIQ FILM GRAMMAR GUARD - RULE 29 VIOLATION]: Attempting to assemble a music video without acoustic phrase alignment!\n\n" +
          "Hardcoding fixed 8-second shots across vocal and instrumental boundaries causes characters to mouth words over dead air. " +
          "All music video assemblies must route through Omni 1.1's Acoustic Phrase Cutter (extractAcousticPhraseMap / assemblePhraseAlignedMaster) " +
          "so cuts happen on musical beat drops and phrase terminations with 0ms lingering motion.";
      }
    }

    // ==================================================================
    // RULE 30 - BAN UNVALIDATED CACHED TAKE REUSE
    // Mandates that music video production and assembly scripts cannot
    // blindly reuse unverified raw takes from scratch/ with `existsSync`
    // caching unless accompanied by a verified take audit manifest or
    // explicit --force regeneration flag.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_unvalidated_cached_take_reuse")) {
      const isMvScript = /produce_.*_mv|produce_.*_music_video|produce_.*_vocal/i.test(effectiveTarget || surface);
      const hasBlindCacheReuse = /existsSync\(shot\d/i.test(surface) && !/--force|forceRegen|TAKE_AUDIT_VERIFIED/i.test(surface);
      const isDirectAssemblyFromStaleTake =
        /ffmpeg.*-i.*scratch\/.*shot_\d+.*master/i.test(surface) &&
        !/visemeAudit|takeAudit|freshnessVerified|TAKE_AUDIT_VERIFIED/i.test(surface);

      if ((isMvScript && hasBlindCacheReuse) || isDirectAssemblyFromStaleTake) {
        decision = "deny";
        reason =
          "[ZYVORIQ ZERO-STALE-TAKE GUARD - RULE 30 VIOLATION]: Attempting to reuse or assemble unvalidated cached takes!\n\n" +
          "Blindly reusing existing shot files from disk via `existsSync` bypasses Omni 1.1's directorial review and " +
          "recycles defective, sluggish mouth movements from previous runs.\n\n" +
          "All video takes must pass an in-flight Take Viseme Performance Audit, or scripts must support `--force` " +
          "regeneration and dirty-state invalidation.";
      }
    }

    // ==================================================================
    // RULE 32 - BAN CONCAT SOURCE TAKE DEDUPLICATION & PARENT TAKE REUSE
    // Detects when multiple ffmpeg trim commands slice output segments
    // from the same parent take (e.g. shot1File -> shot_01_cut & shot_03_cut)
    // or when concat lists reuse the same parent take under different names.
    // ==================================================================
    if (decision === "allow" && !exempt && on("ban_concat_source_take_deduplication")) {
      const isMvScript = /produce_.*_mv|produce_.*_music_video|produce_.*_vocal/i.test(effectiveTarget || surface);
      const shot1Slices = (surface.match(/-i\s+["']?(?:\${shot1File}|shot_01\.mp4|\bshot1File\b)["']?[^\n\r]*?(?:shot_\d+_cut|Trimmed)/g) || []).length;
      const shot2Slices = (surface.match(/-i\s+["']?(?:\${shot2File}|shot_02\.mp4|\bshot2File\b)["']?[^\n\r]*?(?:shot_\d+_cut|Trimmed)/g) || []).length;
      const shot3Slices = (surface.match(/-i\s+["']?(?:\${shot3File}|shot_03\.mp4|\bshot3File\b)["']?[^\n\r]*?(?:shot_\d+_cut|Trimmed)/g) || []).length;
      
      const hasParentTakeReuse = (shot1Slices > 1 || shot2Slices > 1 || shot3Slices > 1) && !/PARENT_TAKE_REUSE_JUSTIFIED/i.test(surface);
      const concatListReuse = /file\s+['"]?[^\n\r]*shot_01_cut[^\n\r]*['"]?[\s\S]*file\s+['"]?[^\n\r]*shot_01_cut/i.test(surface);

      if (isMvScript && (hasParentTakeReuse || concatListReuse)) {
        decision = "deny";
        reason =
          "[ZYVORIQ ZERO-LOOP GUARD - RULE 32 VIOLATION]: Parent take reuse and clip duplication detected in concat assembly!\n\n" +
          "Slicing multiple concat segments from the same source take (e.g. slicing shot_01 into both shot_01_cut and shot_03_cut) " +
          "causes identical visual clips to repeat across the reel, destroying narrative progression and creating phantom lip desync.\n\n" +
          "Every segment in the master concat list MUST originate from a dedicated, 100% unique Veo generation take.";
      }
    }

    // ==================================================================
    // RULE 33 - REQUIRE PREFLIGHT AUDIO GROUNDTRUTH TRANSCRIPTION
    // Mandates that vocal music video production scripts transcribe the
    // master audio track (Gemini 2.5 Flash / acoustic transcription)
    // BEFORE authoring Veo singing prompts. Writing prompts based on
    // assumed lyrics causes severe syllable mismatch and phantom mouthing.
    // ==================================================================
    if (decision === "allow" && !exempt && on("require_preflight_audio_groundtruth_transcription")) {
      const isMvScript = /produce_.*_mv|produce_.*_music_video|produce_.*_vocal/i.test(effectiveTarget || surface);
      const generatesAudio = /generateLyriaAudio|master_vocal_song/i.test(surface);
      const hasSingingPrompts = /sings directly to camera|singing performance/i.test(surface);
      const transcribesAudio = /transcribeAudio|gemini-2\.5-flash.*transcribe|acousticPhraseMap|groundTruthLyrics|transcription/i.test(surface);

      if (isMvScript && generatesAudio && hasSingingPrompts && !transcribesAudio && !/PREFLIGHT_TRANSCRIPTION_JUSTIFIED/i.test(surface)) {
        decision = "deny";
        reason =
          "[ZYVORIQ ACOUSTIC GROUNDING GUARD - RULE 33 VIOLATION]: Authoring Veo singing prompts without ground-truth audio transcription!\n\n" +
          "DeepMind Lyria 3.5 generates unique phrasing, lyrical cadence, and melody. Prompts that assume lyrics without " +
          "transcribing the actual generated audio bytes create fatal syllable misalignments and phantom mouthing.\n\n" +
          "Scripts MUST call Gemini 2.5 Flash to transcribe the audio track and extract ground-truth lyric timestamps " +
          "before generating Veo shots.";
      }
    }

    // ==================================================================
    // RULE 34 - BAN AGGRESSIVE HIGHPASS / SUB-BASS GUTTING
    // Shipped defect: highpass=f=200 stripped the kick, sub-bass and synth
    // groove out of the master and produced a tinny, spectrum-gutted mix.
    // ==================================================================
    if (decision === "allow" && !exempt && mvOn("ban_aggressive_highpass")) {
      const ceiling = Number(MV.ban_highpass_at_or_above_hz ?? 200);
      const maxAllowed = Number(MV.max_allowed_highpass_hz ?? 80);
      const hp = surface.match(/highpass\s*=\s*f\s*=\s*(\d+)/i);
      if (hp && Number(hp[1]) >= ceiling) {
        decision = "deny";
        reason =
          "[ZYVORIQ AUDIO SPECTRUM GUARD - RULE 34 VIOLATION]: highpass=f=" + hp[1] + " detected.\n\n" +
          "Filtering at or above " + ceiling + "Hz removes the kick drum, sub-bass and synth groove, " +
          "which is what produced the tinny master previously flagged as AUDIO_SPECTRUM_GUTTED. " +
          "The full 35Hz-20kHz spectrum must survive mastering.\n\n" +
          "Maximum permitted highpass for music content is " + maxAllowed + "Hz. If a highpass is genuinely " +
          "required for a spoken-word or noise-reduction pass, lower the cutoff or annotate " +
          "SPECTRUM_HIGHPASS_JUSTIFIED with the reason.";
        if (/SPECTRUM_HIGHPASS_JUSTIFIED/i.test(surface)) { decision = "allow"; reason = ""; }
      }
    }

    // ==================================================================
    // RULE 35 - BAN SILENT PADDING FILTERS ON MASTER AUDIO
    // aloop/apad manufacture duration by repeating or padding silence,
    // which fakes duration parity instead of generating real content.
    // ==================================================================
    if (decision === "allow" && !exempt && mvOn("ban_silent_padding_filters")) {
      const banned = Array.isArray(MV.banned_padding_filters)
        ? MV.banned_padding_filters
        : ["aloop", "apad"];
      const hit = banned.find(f => new RegExp("(?:^|[\\s,;:\"'`\\[])" + f + "\\s*=", "i").test(surface));
      const isMedia = /ffmpeg|\.mp3|\.wav|\.m4a|\.mp4/i.test(surface);
      if (hit && isMedia && !/PADDING_FILTER_JUSTIFIED/i.test(surface)) {
        decision = "deny";
        reason =
          "[ZYVORIQ AUDIO PADDING GUARD - RULE 35 VIOLATION]: banned padding filter '" + hit + "' detected.\n\n" +
          "aloop/apad manufacture runtime by looping or padding silence. This fakes song-structure " +
          "duration parity rather than generating real musical content, and produces dead air at " +
          "cut boundaries.\n\n" +
          "Generate audio of the correct length via Lyria instead of padding it. If padding is " +
          "genuinely required (e.g. a deliberate tail reverb bed), annotate PADDING_FILTER_JUSTIFIED.";
      }
    }

    // ==================================================================
    // RULE 36 - BAN STOCK / FALLBACK POSTER FRAMES
    // Shipped defect: a stock beach still was used as a reel thumbnail,
    // surfacing a man who does not appear anywhere in that reel.
    // ==================================================================
    if (decision === "allow" && !exempt && mvOn("ban_stock_fallback_posters")) {
      const bannedPaths = Array.isArray(MV.banned_poster_paths)
        ? MV.banned_poster_paths
        : ["/assets/stills/beach_sunset.jpg"];
      const hit = bannedPaths.find(p => surface.includes(p));
      const genericFallback =
        /(?:poster|thumbnail|thumb|still)[A-Za-z]*\s*(?:=|:|\|\|)\s*["'`][^"'`]*\/assets\/stills\//i.test(surface);
      if (hit || genericFallback) {
        decision = "deny";
        reason =
          "[ZYVORIQ POSTER AUTHENTICITY GUARD - RULE 36 VIOLATION]: stock/fallback poster reference detected" +
          (hit ? " ('" + hit + "')" : "") + ".\n\n" +
          "A reel's poster MUST be a frame extracted from that reel's own render. Falling back to a " +
          "stock still previously surfaced a man in a white shirt as the thumbnail for a reel he does " +
          "not appear in - the viewer sees a thumbnail that misrepresents the content.\n\n" +
          "Extract a real keyframe (ffmpeg -ss <t> -vframes 1) from the rendered shot and bind that instead.";
      }
    }

    // ==================================================================
    // RULE 37 - BAN 16:9 CROPPING OF 9:16 VERTICAL ASSETS
    // Shipped defect: sm:aspect-video forced vertical clips into 16:9
    // boxes and cropped every subject's head out of frame.
    // ==================================================================
    if (decision === "allow" && !exempt && mvOn("ban_vertical_crop_of_9_16_assets")) {
      const isVerticalCtx = /9:16|9\/16|aspect-\[9\/16\]|720x1280|1080x1920|vertical|reel|shorts/i.test(surface);
      const forcesLandscape = /aspect-video|aspect-\[16\/9\]|aspect-16-9/i.test(surface);
      const crops = /object-cover/i.test(surface);
      if (isVerticalCtx && forcesLandscape && !/VERTICAL_ASPECT_JUSTIFIED/i.test(surface)) {
        decision = "deny";
        reason =
          "[ZYVORIQ VERTICAL ASSET GUARD - RULE 37 VIOLATION]: a 16:9 aspect class is being applied in a " +
          "9:16 vertical context" + (crops ? " together with object-cover" : "") + ".\n\n" +
          "This is the exact defect that cropped the heads off every subject in the reel grid: " +
          "sm:aspect-video forced 9:16 clips into 16:9 boxes.\n\n" +
          "Use a conditional aspect (aspect-[9/16] for vertical assets) so heads, subtitles and text " +
          "overlays stay 100% visible. If this element is genuinely landscape, annotate VERTICAL_ASPECT_JUSTIFIED.";
      }
    }

    const out = { decision };
    if (reason) out.reason = reason;
    console.log(JSON.stringify(out));
  } catch (err) {
    // FAIL-CLOSED on media pipelines. Previously this silently allowed everything.
    const risky = /ffmpeg|veo|lyria/i.test(inputData || "");
    if (risky) {
      console.log(JSON.stringify({
        decision: "deny",
        reason: "[ZYVORIQ GUARD FAIL-CLOSED]: The guard threw \"" + err.message + "\" while inspecting a media/generation operation. Refusing to fail open on an unverified media pipeline. Fix the guard, then retry."
      }));
    } else {
      console.log(JSON.stringify({ decision: "allow" }));
    }
  }
});
