#!/usr/bin/env node
/**
 * ZYVORIQ DEFECT CLASSIFIER — REMEDIATION LAYER ENFORCEMENT
 * =========================================================
 * Governance Epoch: 7.0.0
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * A forensic audit that only *lists* defects invites the cheapest possible
 * response: post-process the artifact until the symptom disappears. The repo
 * contains 24 heal/fix/remediate/remaster scripts and NOT ONE of them modifies
 * generator source. The clearest example is fix_omni12_ghosting_and_blur.mjs,
 * which "fixes" ghosting — a TEMPORAL GENERATION artifact — with
 * `unsharp=5:5:0.35:5:5:0.0`, a SPATIAL SHARPEN. That cannot remove a ghost;
 * it only renders it more crisply. The generator stayed broken, so the defect
 * recurred, so another heal script was written. The count of heal scripts IS
 * the evidence of the anti-pattern.
 *
 * THE RULE
 * --------
 *   Remediation must occur AT OR ABOVE the layer where the defect originated.
 *
 * You cannot fix a generation defect at the encode layer. Doing so is the
 * static spoofing forbidden by Rule 43 Step 3.
 *
 * LAYERS (higher number == earlier/deeper in the pipeline)
 *   4 PLAN      - wrong timing, structure, coverage, section mapping
 *   3 GENERATOR - bug in generator/DSP/prompt code
 *   2 CONTENT   - model produced a bad take from correct code
 *   1 ASSEMBLY  - concat / mux / splice
 *   0 ENCODE    - container, pixel format, faststart, loudness normalization
 *
 * Only CONTENT defects are legitimately fixable by regeneration alone.
 * Only ASSEMBLY/ENCODE defects are legitimately fixable by post-processing.
 */

import fs from "node:fs";
import path from "node:path";

export const LAYERS = {
  PLAN: 4,
  GENERATOR: 3,
  CONTENT: 2,
  ASSEMBLY: 1,
  ENCODE: 0
};

export const LAYER_NAMES = Object.fromEntries(
  Object.entries(LAYERS).map(([k, v]) => [v, k])
);

/**
 * Post-processing filters that CANNOT legitimately repair a generation-layer
 * defect. Applying any of these in response to a GENERATOR/CONTENT defect is
 * cosmetic masking, not remediation.
 */
export const COSMETIC_FILTERS = [
  "unsharp",
  "gblur",
  "smartblur",
  "hqdn3d",
  "nlmeans",
  "atadenoise",
  "tblend",
  "minterpolate",
  "deband",
  "sharpen",
  "eq=contrast",
  "vaguedenoiser"
];

/**
 * Ordered rules. First match wins, so put specific patterns before general.
 * `remediation` documents the ONLY legitimate repair for that class.
 */
const CLASSIFICATION_RULES = [
  // ---------------- PLAN (4) ----------------
  { re: /^\[?CONTRACT_DELIVERABLE_MISSING/i, layer: "PLAN", remediation: "Generate the declared deliverable. Nothing to patch — it does not exist." },
  { re: /^\[?CONTRACT_INCOMPLETE_ALBUM/i, layer: "PLAN", remediation: "Produce the missing tracks (N-of-N)." },
  { re: /^\[?CONTRACT_TIMELINE_MISMATCH/i, layer: "PLAN", remediation: "Re-derive the shot grid from the immutable song clock; do not trim the artifact to fit." },
  { re: /^\[?CONTRACT_SHOT_COUNT_LOW/i, layer: "PLAN", remediation: "Re-plan with more shots. Do not insert artificial cuts into finished footage." },
  { re: /^\[?CONTRACT_SHOT_TOO_LONG/i, layer: "PLAN", remediation: "Split the shot in the plan and regenerate it." },
  { re: /^\[?CONTRACT_NO_SHOT_LIST|^\[?CONTRACT_NO_DELIVERABLE_DECLARED/i, layer: "PLAN", remediation: "Declare the structure in reel_target.json." },
  { re: /^\[?CONTRACT_MANIFEST_CORRUPT/i, layer: "PLAN", remediation: "Repair the target manifest." },
  { re: /REEL_REPEAT_DUPLICATE_CLIP|CROSS_PROJECT_ASSET_RECYCLING/i, layer: "PLAN", remediation: "Plan unique coverage. Do not mask reuse with filters." },

  // ---------------- GENERATOR (3) ----------------
  { re: /FORBIDDEN_AUDIO_SHORTCUT/i, layer: "GENERATOR", remediation: "Remove the shortcut from the generator source, then regenerate the audio." },
  { re: /FORBIDDEN_VARIABLE_PLAYBACK_SPEED/i, layer: "GENERATOR", remediation: "Delete the setpts/atempo time-warp from the generator, then regenerate." },
  { re: /FORBIDDEN_VIDEO_PROMPT_ARTIFACT/i, layer: "GENERATOR", remediation: "Edit the prompt in the generator source, then regenerate the shot." },
  { re: /HIGH_FREQ_BRICKWALL_CUTOFF/i, layer: "GENERATOR", remediation: "Remove the brickwall lowpass from the generator. Spectrum cannot be restored by boosting." },
  { re: /SYNTHETIC_SINE|aevalsrc|OSCILLATOR/i, layer: "GENERATOR", remediation: "Replace synthetic oscillator audio with a real source in the generator." },
  { re: /STATIC_ZOOMPAN|zoompan|SLIDESHOW/i, layer: "GENERATOR", remediation: "Remove synthetic motion generation; produce real motion." },
  { re: /IDENTITY|ARCFACE|BIOMETRIC|CHARACTER_DRIFT/i, layer: "GENERATOR", remediation: "Fix identity conditioning (anchor/reference images) in the generator, then regenerate." },
  { re: /TAIL_FRAME|CHAIN_CONDITIONING|UNDECLARED_HARD_CUTS/i, layer: "GENERATOR", remediation: "Fix tail-frame conditioning in the generator. A cut cannot be chained after the fact." },
  { re: /GHOST|BLUR|SMEAR|MORPH|WARP_ARTIFACT/i, layer: "GENERATOR", remediation: "Temporal generation artifact. Regenerate with corrected conditioning. Sharpening filters are FORBIDDEN here." },
  { re: /PHANTOM_MOUTH|MOUTH_LINGERING|SINGING_DURING_INSTRUMENTAL/i, layer: "GENERATOR", remediation: "Correct the prompt's vocal/instrumental directive in the generator, then regenerate." },

  // ---------------- CONTENT (2) ----------------
  { re: /LIP_SYNC|PEARSON|MAR_CORRELATION|PLOSIVE/i, layer: "CONTENT", remediation: "Regenerate the take (new seed) and select the best-correlating take. Never post-warp video to chase sync." },
  { re: /FROZEN_FRAME|DUPLICATE_OR_FROZEN/i, layer: "CONTENT", remediation: "Regenerate the affected clip. Do not drop/interpolate frames to hide it." },
  { re: /OPTICAL_FLOW|LOW_MOTION|STATIC_ANCHOR/i, layer: "CONTENT", remediation: "Regenerate with stronger motion direction." },

  // ---------------- ASSEMBLY (1) ----------------
  { re: /UNEVEN_FRAME_PLAYBACK_CADENCE/i, layer: "ASSEMBLY", remediation: "Re-assemble at exact CFR using -frames:v N. Do not resample." },
  { re: /SILENCE|GAP_MS|UNINTENDED_SILENCE/i, layer: "ASSEMBLY", remediation: "Re-mux with correct audio alignment. Padding filters are forbidden." },
  { re: /CONCAT|SPLICE|SEAM/i, layer: "ASSEMBLY", remediation: "Re-assemble from the existing good clips." },

  // ---------------- ENCODE (0) ----------------
  { re: /pix_fmt|yuv420p/i, layer: "ENCODE", remediation: "Re-encode with -pix_fmt yuv420p." },
  { re: /faststart|moov/i, layer: "ENCODE", remediation: "Re-mux with -movflags +faststart." },
  { re: /LUFS|LRA|TRUE_PEAK|dBTP|EBUR128/i, layer: "ENCODE", remediation: "Apply delivery-stage loudness normalization (never to the immutable master)." }
];

/** Classify one issue string. Unknown issues fail safe to GENERATOR. */
export function classifyIssue(issueText) {
  const text = String(issueText || "");
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.re.test(text)) {
      return {
        issue: text,
        layer: rule.layer,
        layerRank: LAYERS[rule.layer],
        remediation: rule.remediation,
        matched: true
      };
    }
  }
  // Fail safe: assume the deepest plausible origin so remediation is not
  // permitted to happen too shallow.
  return {
    issue: text,
    layer: "GENERATOR",
    layerRank: LAYERS.GENERATOR,
    remediation: "UNCLASSIFIED — assume generator origin. Investigate root cause before any post-processing.",
    matched: false
  };
}

/**
 * Classify a full issue list and compute the minimum layer at which
 * remediation is permitted.
 */
export function classifyAll(issues = []) {
  const classified = issues.map(classifyIssue);
  const maxRank = classified.reduce((m, c) => Math.max(m, c.layerRank), -1);
  const byLayer = {};
  for (const c of classified) {
    (byLayer[c.layer] ||= []).push(c.issue);
  }
  return {
    classified,
    byLayer,
    deepest_defect_layer: maxRank >= 0 ? LAYER_NAMES[maxRank] : null,
    minimum_remediation_layer: maxRank >= 0 ? LAYER_NAMES[maxRank] : null,
    requires_generator_source_diff: maxRank >= LAYERS.GENERATOR,
    requires_full_regeneration: maxRank >= LAYERS.GENERATOR,
    post_processing_alone_is_sufficient: maxRank >= 0 && maxRank <= LAYERS.ASSEMBLY
  };
}

/**
 * Detects the anti-pattern directly: a remediation script that applies cosmetic
 * post-filters while the defect set contains GENERATOR/CONTENT-layer issues.
 */
export function detectIllegalRemediation(remediationScriptPath, issues = []) {
  const violations = [];
  if (!remediationScriptPath || !fs.existsSync(remediationScriptPath)) return violations;

  const summary = classifyAll(issues);
  if (summary.deepest_defect_layer === null) return violations;
  if (LAYERS[summary.deepest_defect_layer] < LAYERS.CONTENT) return violations;

  const src = fs.readFileSync(remediationScriptPath, "utf-8");
  const base = path.basename(remediationScriptPath);

  for (const filt of COSMETIC_FILTERS) {
    if (src.includes(filt)) {
      violations.push(
        `[ILLEGAL_REMEDIATION_LAYER] ${base} applies cosmetic filter '${filt}' while the defect set ` +
          `originates at layer ${summary.deepest_defect_layer}. A ${summary.deepest_defect_layer}-layer defect ` +
          `cannot be repaired by post-processing — this masks the symptom and guarantees recurrence. ` +
          `Required: ${summary.classified.find((c) => c.layerRank === LAYERS[summary.deepest_defect_layer])?.remediation}`
      );
    }
  }

  const regenerates = /predictLongRunning|generateVideo|veo-3/.test(src);
  if (summary.requires_full_regeneration && !regenerates) {
    violations.push(
      `[NO_REGENERATION_AFTER_GENERATOR_FIX] ${base} performs no generation call, but the defect set ` +
        `contains ${summary.deepest_defect_layer}-layer defects which require regeneration after the ` +
        `underlying source is corrected.`
    );
  }

  return violations;
}

// ---- CLI ----------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const receiptPath = process.argv[2];
  if (!receiptPath || !fs.existsSync(receiptPath)) {
    console.error("Usage: node defect_classifier.mjs <audit_receipt.json> [remediation_script.mjs]");
    process.exit(2);
  }
  const report = JSON.parse(fs.readFileSync(receiptPath, "utf-8"));
  const summary = classifyAll(report.issues || []);
  console.log(JSON.stringify(summary, null, 2));

  const remScript = process.argv[3];
  if (remScript) {
    const v = detectIllegalRemediation(remScript, report.issues || []);
    if (v.length) {
      console.error("\nILLEGAL REMEDIATION DETECTED:");
      for (const x of v) console.error("  - " + x);
      process.exit(1);
    }
    console.log("\nRemediation layer check: OK");
  }
  process.exit(0);
}
