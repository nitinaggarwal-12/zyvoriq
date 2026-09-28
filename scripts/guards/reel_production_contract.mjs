#!/usr/bin/env node
/**
 * ZYVORIQ STAGE 0 — REEL PRODUCTION CONTRACT ENFORCER
 * ===================================================
 * Governance Epoch: 7.0.0
 *
 * PURPOSE
 * -------
 * Every other guard in the Zyvoriq stack is a NEGATIVE constraint: it forbids
 * bad output (slideshows, time-warp, lip-sync drift). None of them can compel
 * output to EXIST. The consequence is that an empty deliverable set passes the
 * entire 10-layer chain cleanly — producing nothing is the cheapest way to
 * satisfy the constitution.
 *
 * This module supplies the missing POSITIVE obligation. It audits against a
 * DECLARED TARGET (`reel_target.json`) rather than against whatever happens to
 * be on disk, which closes the empty-set vacuity hole.
 *
 * SAFETY / SCOPE
 * --------------
 * This guard is INERT unless an ACTIVE `reel_target.json` is discovered. A
 * normal code-only session declares no target, finds no target, and is never
 * blocked. Only a session that explicitly promised a reel is held to it.
 *
 * TARGET MANIFEST SCHEMA (`reel_target.json`)
 * -------------------------------------------
 * {
 *   "production_id": "spain_pool_english_reel",
 *   "status": "ACTIVE",                          // ACTIVE | COMPLETE | ABANDONED
 *   "deliverable": "master.mp4",                 // relative to manifest dir
 *   "min_total_duration_s": 60.0,
 *   "min_shot_count": 8,
 *   "max_shot_duration_s": 8.0,
 *   "require_tail_frame_chain_continuity": true,
 *   "max_unchained_hard_cuts": 2,
 *   "tracks": ["track_01.mp4", "track_02.mp4"]   // optional N-of-N album set
 * }
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export const CONTRACT_DEFAULTS = {
  min_total_duration_s: 60.0,
  min_shot_count: 8,
  max_shot_duration_s: 8.0,
  require_tail_frame_chain_continuity: true,
  max_unchained_hard_cuts: 2,
  scene_detection_threshold: 0.32,
  on_missing_deliverable: "BLOCK",
  on_empty_deliverable_set: "BLOCK"
};

const TARGET_FILENAME = "reel_target.json";

/**
 * Recursively locate every reel_target.json under the supplied roots.
 * Depth-limited and node_modules-pruned to keep the Stop hook fast.
 */
export function discoverTargets(roots, maxDepth = 6) {
  const found = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full, depth + 1);
      } else if (entry.name === TARGET_FILENAME) {
        try {
          const manifest = JSON.parse(fs.readFileSync(full, "utf-8"));
          found.push({ manifestPath: full, dir, manifest });
        } catch (err) {
          // A corrupt target manifest is itself a blocking condition; surface it
          // rather than silently skipping, otherwise a malformed file becomes a
          // trivial bypass of the entire contract.
          found.push({ manifestPath: full, dir, manifest: null, parseError: err.message });
        }
      }
    }
  }
  for (const root of roots) {
    if (fs.existsSync(root)) walk(root, 0);
  }
  return found;
}

function probeDuration(videoPath) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { timeout: 15000 }
  )
    .toString()
    .trim();
  const parsed = parseFloat(out);
  if (!Number.isFinite(parsed)) throw new Error(`Unreadable duration for ${videoPath}`);
  return parsed;
}

/**
 * Returns the sorted list of scene-cut timestamps (seconds).
 * Shot count == cuts.length + 1.
 */
function probeSceneCuts(videoPath, threshold) {
  const escaped = videoPath.replace(/'/g, "\\'");
  const out = execSync(
    `ffprobe -v error -f lavfi -i "movie='${escaped}',select=gt(scene\\,${threshold})" -show_entries frame=pts_time -of csv=p=0`,
    { timeout: 120000, maxBuffer: 8 * 1024 * 1024 }
  ).toString();
  return out
    .split("\n")
    .map((l) => parseFloat(l.trim()))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

/**
 * Evaluate one declared target against its physical deliverable.
 * Returns { productionId, issues: string[] }.
 */
export function evaluateTarget(target, workspace) {
  const issues = [];
  const { manifestPath, dir, manifest, parseError } = target;
  const rel = path.relative(workspace, manifestPath);

  if (parseError || !manifest) {
    issues.push(
      `[CONTRACT_MANIFEST_CORRUPT] ${rel} could not be parsed (${parseError}). ` +
        `A malformed target manifest cannot be treated as satisfied.`
    );
    return { productionId: rel, issues };
  }

  const productionId = manifest.production_id || rel;
  const status = (manifest.status || "ACTIVE").toUpperCase();

  // Only ACTIVE targets are enforced. COMPLETE/ABANDONED are intentionally inert.
  if (status !== "ACTIVE") return { productionId, issues };

  const cfg = { ...CONTRACT_DEFAULTS, ...manifest };

  // ---- N-of-N album completion -------------------------------------------
  if (Array.isArray(manifest.tracks) && manifest.tracks.length > 0) {
    const missing = manifest.tracks.filter((t) => !fs.existsSync(path.join(dir, t)));
    if (missing.length > 0) {
      issues.push(
        `[CONTRACT_INCOMPLETE_ALBUM] ${productionId}: ${missing.length}/${manifest.tracks.length} ` +
          `declared tracks were never produced -> ${missing.join(", ")}. ` +
          `N-of-N completion is required before release.`
      );
    }
  }

  // ---- Primary deliverable existence (the empty-set killer) ---------------
  const deliverableName = manifest.deliverable;
  if (!deliverableName) {
    issues.push(
      `[CONTRACT_NO_DELIVERABLE_DECLARED] ${productionId}: target manifest omits "deliverable".`
    );
    return { productionId, issues };
  }

  const videoPath = path.join(dir, deliverableName);
  if (!fs.existsSync(videoPath)) {
    issues.push(
      `[CONTRACT_DELIVERABLE_MISSING] ${productionId}: declared deliverable "${deliverableName}" ` +
        `does not exist on disk. The production target was declared but never generated. ` +
        `Generate the reel — an empty workspace does not satisfy an ACTIVE contract.`
    );
    return { productionId, issues };
  }

  // ---- Minimum total duration --------------------------------------------
  let duration = 0;
  try {
    duration = probeDuration(videoPath);
    if (duration < cfg.min_total_duration_s) {
      issues.push(
        `[CONTRACT_DURATION_SHORT] ${productionId}: ${duration.toFixed(2)}s produced but ` +
          `${cfg.min_total_duration_s}s required. A truncated reel does not satisfy the contract.`
      );
    }
  } catch (err) {
    issues.push(`[CONTRACT_DURATION_UNREADABLE] ${productionId}: ${err.message}`);
    return { productionId, issues };
  }

  // ---- Shot structure: verified from the DECLARED plan, not inferred -------
  //
  // WHY NOT SCENE DETECTION:
  // The previous implementation inferred shot count from `scene > threshold`.
  // That is fundamentally incompatible with tail-frame chaining, which this
  // same constitution mandates. A correctly chained cut is *visually
  // continuous* by construction (PSNR 26-42 dB), so it does NOT trip scene
  // detection. The better the chaining, the fewer cuts detected, the more
  // certain the CONTRACT_SHOT_COUNT_LOW failure. The two clauses could never
  // be satisfied by the same artifact.
  //
  // Additionally the old budget `cuts > max_unchained_hard_cuts + (min_shot_count - 1)`
  // bounded shotCount to [8,10], which combined with max_shot_duration_s made
  // the contract mathematically unsatisfiable for any reel longer than ~80s.
  //
  // Shot structure is a property of the PLAN. We verify the declared structure
  // arithmetically (free, exact) and use scene detection only to catch
  // *undeclared* hard cuts — an anomaly check, never the source of truth.
  const shots = Array.isArray(manifest.shots) ? manifest.shots : null;

  if (!shots || shots.length === 0) {
    issues.push(
      `[CONTRACT_NO_SHOT_LIST] ${productionId}: target manifest declares no "shots" array. ` +
        `Shot structure must be declared at planning time so it can be verified exactly ` +
        `rather than guessed from scene detection.`
    );
  } else {
    // -- Declared shot count --
    if (shots.length < cfg.min_shot_count) {
      issues.push(
        `[CONTRACT_SHOT_COUNT_LOW] ${productionId}: plan declares ${shots.length} shot(s) but ` +
          `${cfg.min_shot_count} required.`
      );
    }

    // -- Per-shot duration ceiling (kills long static takes) --
    shots.forEach((s, i) => {
      const d = Number(s.duration_s);
      if (!Number.isFinite(d) || d <= 0) {
        issues.push(`[CONTRACT_SHOT_DURATION_INVALID] ${productionId}: shot[${i}] has invalid duration_s=${s.duration_s}.`);
      } else if (d > cfg.max_shot_duration_s) {
        issues.push(
          `[CONTRACT_SHOT_TOO_LONG] ${productionId}: shot[${i}] is ${d.toFixed(3)}s, exceeding ` +
            `max_shot_duration_s=${cfg.max_shot_duration_s}.`
        );
      }
    });

    // -- Declared timeline must tile the delivered artifact exactly --
    const declaredTotal = shots.reduce((a, s) => a + (Number(s.duration_s) || 0), 0);
    const frameTolerance = 1 / (Number(cfg.fps) || 24); // one frame
    if (Math.abs(declaredTotal - duration) > frameTolerance) {
      issues.push(
        `[CONTRACT_TIMELINE_MISMATCH] ${productionId}: declared shot total ${declaredTotal.toFixed(3)}s ` +
          `!= delivered duration ${duration.toFixed(3)}s (tolerance ${frameTolerance.toFixed(4)}s = 1 frame). ` +
          `The plan and the artifact disagree.`
      );
    }

    // -- Anomaly check: undeclared hard cuts --
    // Declared hard cuts are expected to be detectable; chained boundaries are
    // expected NOT to be. We only flag detections materially in excess of what
    // the plan declared, which catches accidental jump cuts and bad splices.
    try {
      const detected = probeSceneCuts(videoPath, cfg.scene_detection_threshold);
      const declaredHardCuts = shots.filter(
        (s) => String(s.boundary_type || "").toLowerCase() === "hard_cut"
      ).length;
      const slack = Number(cfg.undeclared_hard_cut_slack ?? 2);
      if (detected.length > declaredHardCuts + slack) {
        issues.push(
          `[CONTRACT_UNDECLARED_HARD_CUTS] ${productionId}: ${detected.length} visual discontinuities ` +
            `detected but only ${declaredHardCuts} hard cut(s) declared (slack ${slack}). ` +
            `Unplanned breaks suggest failed tail-frame chaining or a bad splice.`
        );
      }
    } catch (err) {
      // Anomaly check only — must never fail the contract on its own.
      issues.push(
        `[CONTRACT_SCENE_PROBE_WARNING] ${productionId}: anomaly scan unavailable (${err.message}). ` +
          `Declared-structure checks still applied.`
      );
    }
  }

  return { productionId, issues };
}

/**
 * Top-level entry consumed by stop_quality_gate.mjs.
 * MUST be called OUTSIDE any `recentDeliverables` loop so that it still
 * executes when that array is empty — that is the entire point of this module.
 */
export function enforceProductionContracts(workspace) {
  const roots = [path.join(workspace, "scratch"), path.join(workspace, "public", "assets")];
  const targets = discoverTargets(roots);

  // No declared target => guard is inert. Normal sessions are unaffected.
  if (targets.length === 0) return { enforced: false, issues: [], targetCount: 0 };

  const issues = [];
  for (const target of targets) {
    const result = evaluateTarget(target, workspace);
    issues.push(...result.issues);
  }
  return { enforced: true, issues, targetCount: targets.length };
}

// ---- CLI mode ------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const workspace = process.argv[2] || process.cwd();
  const result = enforceProductionContracts(workspace);
  if (!result.enforced) {
    console.log("[REEL CONTRACT] No ACTIVE reel_target.json found — guard inert.");
    process.exit(0);
  }
  if (result.issues.length > 0) {
    console.error(`[REEL CONTRACT] ${result.issues.length} violation(s):`);
    for (const i of result.issues) console.error(`  - ${i}`);
    process.exit(1);
  }
  console.log(`[REEL CONTRACT] ${result.targetCount} target(s) satisfied.`);
  process.exit(0);
}
