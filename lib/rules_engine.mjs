#!/usr/bin/env node
/**
 * ZYVORIQ RULES ENGINE (v6.1.0 - Single Canonical Source)
 * =======================================================
 * Loads and resolves active governance rules directly from:
 *   ~/.gemini/config/hooks.json (override: ZYVORIQ_HOOKS_PATH)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const CANONICAL_HOOKS_PATH =
  process.env.ZYVORIQ_HOOKS_PATH ||
  path.join(os.homedir(), ".gemini", "config", "hooks.json");

export const LEGACY_HOOKS_LOCATIONS = [
  ".gemini/hooks.json",
  ".agents/hooks.json",
  "hooks.json",
  "_agents/hooks.json",
  "plugins/zyvoriq_guard/hooks.json"
];

export class UngovernedProjectError extends Error {
  constructor(cwd) {
    super(
      `UNGOVERNED_PROJECT: no path_matcher in ${CANONICAL_HOOKS_PATH} binds "${cwd}". ` +
        `global_governance.unmatched_fallback.action=REJECT -> refusing to run ungoverned.`
    );
    this.name = "UngovernedProjectError";
    this.code = "UNGOVERNED_PROJECT";
  }
}

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
  require_model_execution_order: true,
  require_strict_1x_playback_speed_no_setpts_distortion: true,
  forensic_auditor_and_judge_model: "Claude Opus 5",
  require_claude_opus_5_forensic_judge_verdict: true
};

function applyAliases(rules) {
  const out = { ...rules };

  if (out.isolated_vocal_bed_mix_volume !== undefined && out.max_vocal_bed_volume === undefined) {
    out.max_vocal_bed_volume = out.isolated_vocal_bed_mix_volume;
  }

  const p = out.psnr_quality_gate;
  if (p && typeof p === "object") {
    if (p.min_sequential_tail_frame_psnr !== undefined) out.min_sequential_tail_frame_psnr = p.min_sequential_tail_frame_psnr;
    if (p.max_sequential_tail_frame_psnr !== undefined) out.max_sequential_tail_frame_psnr = p.max_sequential_tail_frame_psnr;
    if (p.min_hard_scene_cut_psnr_difference !== undefined) out.min_hard_scene_cut_psnr_difference = p.min_hard_scene_cut_psnr_difference;
  }

  // Never disable ban_prompt_contradictions_and_open_mouth_tokens when dynamic visemes are allowed;
  // Rule 20 specifically prevents coupling "mouth closed" with "laughing/cheering" in the same prompt.
  if (out.viseme_token_isolation_scope === "append_to_dynamic_motion_prompt_only") {
    out.ban_open_mouth_tokens_in_character_anchors = true;
  }

  if (out.suppress_omni_native_video_audio === true) {
    out.ban_native_audio_stripping_on_singing_shots = true;
  }

  return out;
}

function pathCandidates(absDir) {
  const norm = path.resolve(absDir).replace(/\\/g, "/").toLowerCase();
  const segs = norm.split("/").filter(Boolean);
  const out = new Set([norm, norm.replace(/^\//, "")]);
  for (let i = 0; i < segs.length; i++) out.add(segs.slice(i).join("/"));
  return [...out];
}

function matcherHits(matcher, candidates) {
  const m = String(matcher);
  if (!/[\^\$\(\)\[\]\*\+\?\\|]/.test(m)) {
    const lower = m.toLowerCase();
    return candidates.some((c) => c.includes(lower));
  }
  let re;
  try {
    re = new RegExp(m, "i");
  } catch {
    return false;
  }
  return candidates.some((c) => re.test(c));
}

export function findHooksConfig() {
  return fs.existsSync(CANONICAL_HOOKS_PATH) ? CANONICAL_HOOKS_PATH : null;
}

export function detectShadowConfigs(startDir = process.cwd()) {
  const shadows = [];
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    for (const rel of LEGACY_HOOKS_LOCATIONS) {
      const p = path.join(dir, rel);
      try {
        const st = fs.lstatSync(p);
        if (st.isFile()) shadows.push(p);
      } catch {}
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
    try {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      return null;
    }
  }
  const candidates = pathCandidates(startDir);
  const entries = Object.entries(cfg.projects || {}).sort(
    (a, b) => (a[1].priority ?? 99) - (b[1].priority ?? 99)
  );

  for (const [name, proj] of entries) {
    const matchers = [...(proj.path_matchers || []), ...(proj.path_matchers_regex || [])];
    if (matchers.some((m) => matcherHits(m, candidates))) return { name, proj };
  }
  if (cfg.projects?.zyvoriq) {
    return { name: "zyvoriq", proj: cfg.projects.zyvoriq };
  }
  return null;
}

export { DEFAULTS };

export function loadRules(startDir = process.cwd()) {
  const configPath = findHooksConfig();
  if (!configPath) return applyAliases({ ...DEFAULTS });
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const hit = resolveProject(startDir, cfg);
  if (!hit) {
    return applyAliases({ ...DEFAULTS });
  }
  return applyAliases({ ...DEFAULTS, ...(hit.proj.rules || {}) });
}

