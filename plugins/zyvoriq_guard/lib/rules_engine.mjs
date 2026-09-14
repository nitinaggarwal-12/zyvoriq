#!/usr/bin/env node
/**
 * ZYVORIQ RULES ENGINE  (v3 - single canonical source)
 * ====================================================
 * Makes hooks.json ACTUALLY EXECUTABLE.
 *
 * SINGLE SOURCE OF TRUTH:
 *   ~/.gemini/config/hooks.json   (override: ZYVORIQ_HOOKS_PATH)
 *
 * Exactly ONE hooks.json governs every project system-wide. Repo-local copies
 * are symlinks to the canonical file; any real (non-symlink) duplicate is a
 * shadow and is reported by detectShadowConfigs().
 *
 * FIXES APPLIED
 *  P0-1  Regex path_matchers now bind. The previous engine used
 *        `cwd.includes(matcher)`, so anchored patterns such as
 *        "^zyvoriq(/.*)?$" could never match "/Users/x/Documents/zyvoriq".
 *        Matchers are now tested against every path-suffix candidate
 *        ("zyvoriq", "documents/zyvoriq", ...) as regex, with literal
 *        substring fallback for plain strings.
 *  P0-2  Only the canonical path is read. Repo-local files can no longer
 *        silently shadow governance.
 *  P0-3  unmatched_fallback.action === "REJECT" is now honored: loadRules
 *        throws UngovernedProjectError instead of silently returning defaults.
 *  P1-4  v3.0.0 key aliases are bridged to the legacy keys the guard scripts
 *        actually read, so renamed rules do not silently disable enforcement.
 *  P1-5  DEFAULTS act as a safety floor; explicit file values always win.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const CANONICAL_HOOKS_PATH =
  process.env.ZYVORIQ_HOOKS_PATH ||
  path.join(os.homedir(), ".gemini", "config", "hooks.json");

/** Locations that must be symlinks to CANONICAL_HOOKS_PATH, never real files. */
export const LEGACY_HOOKS_LOCATIONS = [
  ".gemini/hooks.json",
  ".agents/hooks.json",
  "hooks.json",
  "_agents/hooks.json",
  "plugins/zyvoriq_guard/hooks.json"
];

export class UngovernedProjectError extends Error {
  constructor(cwd) {
    super(`UNGOVERNED_PROJECT: no path_matcher in ${CANONICAL_HOOKS_PATH} binds "${cwd}". ` +
          `global_governance.unmatched_fallback.action=REJECT -> refusing to run ungoverned.`);
    this.name = "UngovernedProjectError";
    this.code = "UNGOVERNED_PROJECT";
  }
}

/**
 * Safety floor. Every boolean ban that any guard script reads lives here so a
 * rule renamed or omitted upstream cannot silently switch enforcement off.
 * Explicit values in hooks.json always override these.
 */
const DEFAULTS = {
  ban_stream_loop: true,
  ban_identical_shot_image_conditioning: true,
  require_sequential_tail_frame_chaining: true,
  require_preflight_audio_vocal_timestamp_extraction: true,
  ban_singing_prompts_during_instrumental_intros: true,
  ban_native_audio_stripping_on_singing_shots: true,
  ban_detached_still_frame_lipsync_audits: true,
  require_multimodal_audio_visual_lipsync_gate: true,
  max_cross_shot_initial_frame_psnr: 25.0,
  max_vocal_bed_volume: 0.20,
  biometric_anchor_threshold: 0.05,
  zero_silence_required: true,
  require_lyria_master_soundtrack: true,
  enforce_vocal_gender_alignment: true,
  require_faststart_and_yuv420p: true,
  ban_cross_gender_conditioning_morph: true,
  ban_inappropriate_water_scene_wardrobe: true,
  enforce_ensemble_biometric_differentiation: true,
  ban_ensemble_group_vocal_bleed: true,
  require_active_vocal_lip_sync_on_singing_shots: true,
  ban_frozen_lips_during_vocal_sections: true,
  require_acoustic_viseme_timeline_alignment: true,
  ban_forced_mouth_sealing_on_vocal_anchors: true,
  ban_prompt_contradictions_and_open_mouth_tokens: true,
  ban_open_mouth_visemes_in_non_vocal_scenes: true,
  ban_smile_dilution_in_singing_prompts: true,
  require_path_b_acoustic_lyric_snapping: true,
  ban_stale_shot_cache_reuse_on_prompt_update: true,
  ban_open_mouth_tokens_in_character_anchors: true,
  require_acoustic_neural_latency_adelay_calibration: true,
  ban_certification_tampering: true,
  ban_arbitrary_fixed_duration_mv_assembly: true,
  ban_unvalidated_cached_take_reuse: true,
  require_in_take_viseme_cadence_audit: true,
  ban_concat_source_take_deduplication: true,
  require_preflight_audio_groundtruth_transcription: true,
  require_model_execution_order: true
};

/**
 * Bridge v3.0.0 schema keys onto the legacy keys guard scripts read.
 * Without this, renaming a rule silently disables its detector.
 */
function applyAliases(rules) {
  const out = { ...rules };

  // Vocal bed volume was renamed.
  if (out.isolated_vocal_bed_mix_volume !== undefined && out.max_vocal_bed_volume === undefined) {
    out.max_vocal_bed_volume = out.isolated_vocal_bed_mix_volume;
  }

  // PSNR moved into a nested object with corrected directional bounds.
  const p = out.psnr_quality_gate;
  if (p && typeof p === "object") {
    if (p.min_sequential_tail_frame_psnr !== undefined) out.min_sequential_tail_frame_psnr = p.min_sequential_tail_frame_psnr;
    if (p.max_sequential_tail_frame_psnr !== undefined) out.max_sequential_tail_frame_psnr = p.max_sequential_tail_frame_psnr;
    if (p.min_hard_scene_cut_psnr_difference !== undefined) out.min_hard_scene_cut_psnr_difference = p.min_hard_scene_cut_psnr_difference;
  }

  // Viseme token policy: anchors stay sealed, but in-shot dynamic visemes are
  // permitted. The blanket contradiction ban would otherwise cancel this.
  if (out.allow_dynamic_viseme_prompts_during_vocals === true &&
      out.ban_prompt_contradictions_and_open_mouth_tokens === undefined) {
    out.ban_prompt_contradictions_and_open_mouth_tokens = false;
  }
  if (out.viseme_token_isolation_scope === "append_to_dynamic_motion_prompt_only") {
    out.ban_open_mouth_tokens_in_character_anchors = true;
  }

  // suppress_omni_native_video_audio must never override the singing-audio ban.
  if (out.suppress_omni_native_video_audio === true) {
    out.ban_native_audio_stripping_on_singing_shots = true;
  }

  return out;
}

/** Candidate path forms a matcher may be written against. */
function pathCandidates(absDir) {
  const norm = path.resolve(absDir).replace(/\\/g, "/").toLowerCase();
  const segs = norm.split("/").filter(Boolean);
  const out = new Set([norm, norm.replace(/^\//, "")]);
  for (let i = 0; i < segs.length; i++) out.add(segs.slice(i).join("/"));
  return [...out];
}

function matcherHits(matcher, candidates) {
  const m = String(matcher);
  // Plain literal (no regex metacharacters) -> substring, preserves old behaviour.
  if (!/[\^\$\(\)\[\]\*\+\?\\|]/.test(m)) {
    const lower = m.toLowerCase();
    return candidates.some(c => c.includes(lower));
  }
  let re;
  try { re = new RegExp(m, "i"); } catch { return false; }
  return candidates.some(c => re.test(c));
}

export function findHooksConfig() {
  return fs.existsSync(CANONICAL_HOOKS_PATH) ? CANONICAL_HOOKS_PATH : null;
}

/** Report any real (non-symlink) hooks.json shadowing the canonical file. */
export function detectShadowConfigs(startDir = process.cwd()) {
  const shadows = [];
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    for (const rel of LEGACY_HOOKS_LOCATIONS) {
      const p = path.join(dir, rel);
      try {
        const st = fs.lstatSync(p);
        if (st.isFile()) shadows.push(p); // symlinks report isFile()===false here
      } catch { /* absent */ }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return shadows;
}

export function resolveProject(startDir = process.cwd(), cfg = null) {
  const configPath = findHooksConfig();
  if (!configPath) return null;
  if (!cfg) {
    try { cfg = JSON.parse(fs.readFileSync(configPath, "utf-8")); } catch { return null; }
  }
  const candidates = pathCandidates(startDir);
  const entries = Object.entries(cfg.projects || {})
    .sort((a, b) => (a[1].priority ?? 99) - (b[1].priority ?? 99));

  for (const [name, proj] of entries) {
    const matchers = [...(proj.path_matchers || []), ...(proj.path_matchers_regex || [])];
    if (matchers.some(m => matcherHits(m, candidates))) return { name, proj };
  }
  return null;
}

/** Load the ACTIVE rule set for the current project from the canonical file. */
export function loadRules(startDir = process.cwd()) {
  const configPath = findHooksConfig();
  if (!configPath) {
    return { ...DEFAULTS, __source: "defaults(canonical-hooks-missing)", __canonical: CANONICAL_HOOKS_PATH };
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    // Fail closed: an unparseable governance file must not silently disable rules.
    return { ...DEFAULTS, __source: `defaults(parse-error: ${e.message})`, __configPath: configPath };
  }

  const match = resolveProject(startDir, cfg);

  if (!match) {
    const action = cfg.global_governance?.unmatched_fallback?.action;
    if (String(action).toUpperCase() === "REJECT") throw new UngovernedProjectError(path.resolve(startDir));
    return { ...DEFAULTS, __source: "defaults(no-project-match)", __configPath: configPath };
  }

  const fileRules = applyAliases(match.proj.rules || {});
  const fromDefaults = Object.keys(DEFAULTS).filter(k => fileRules[k] === undefined);

  return {
    ...DEFAULTS,
    ...fileRules,
    __source: `canonical::projects.${match.name}.rules`,
    __configPath: configPath,
    __project: match.name,
    __orchestration: match.proj.model_orchestration || null,
    __auditor: match.proj.omni_sme_auditor || null,
    __inheritedFromDefaults: fromDefaults
  };
}

export function ruleEnabled(rules, key) {
  if (rules[key] !== undefined) return rules[key] !== false;
  return DEFAULTS[key] === true;
}

export { DEFAULTS };
export default { loadRules, findHooksConfig, resolveProject, detectShadowConfigs, ruleEnabled, DEFAULTS, CANONICAL_HOOKS_PATH, UngovernedProjectError };
