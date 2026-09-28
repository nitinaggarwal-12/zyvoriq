#!/usr/bin/env node
/**
 * GATE SENSITIVITY HARNESS  (Scorecard B)
 * =======================================
 * Runs every media gate against a clean control and every poison fixture,
 * then reports which gates are actually capable of failing.
 *
 * THE METRIC
 * ----------
 *   sensitivity% = gates proven SENSITIVE / total gates tested
 *
 * A gate is classified by its behaviour across the fixture matrix:
 *
 *   SENSITIVE    passes clean AND rejects >= 1 poison.
 *                A real control. Its green light means something.
 *
 *   DECORATION   passes clean AND passes ALL 7 poisons.
 *                Has never been observed turning red. Functionally
 *                indistinguishable from `return PASS`. QUARANTINE.
 *
 *   HAIR_TRIGGER rejects the clean control.
 *                False-positive machine. Teams learn to ignore it, which is
 *                worse than having no gate, because it launders real failures
 *                into background noise.
 *
 *   BROKEN       crashes or times out.
 *                Critically, a crash must NOT be scored as a rejection --
 *                that is the "error indistinguishable from a negative result"
 *                bug that caused the contract-binding meter to fabricate a
 *                0%/100% report. Exit code 1 from a stack trace is not a
 *                verdict; it is an absence of one.
 *
 * WHY THIS IS THE FIRST THING TO BUILD
 * ------------------------------------
 * Quality metrics measured by unverified gates are worthless. If a cadence
 * gate cannot detect setpts=0.9, then "cadence: PASS" on the real album
 * carries zero information. Scorecard B must be 100% before any Scorecard C
 * number is trustworthy.
 *
 * USAGE
 *   node scripts/guards/gate_sensitivity.mjs
 *   node scripts/guards/gate_sensitivity.mjs --json
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

const ROOT = process.env.ZYVORIQ_ROOT || '/Users/nitinagga/Documents/zyvoriq';
const FIXTURES = join(ROOT, 'scratch', 'gate_sensitivity', 'fixtures');
const LEDGER = join(ROOT, 'scratch', 'metrics', 'gate_sensitivity_ledger.jsonl');

/** Per-gate wall clock budget. `timeout(1)` does not exist on this machine. */
const TIMEOUT_MS = 90_000;

/**
 * Media gates: argv[2] is a video path, exit 0 = pass, non-zero = reject.
 * Excluded deliberately:
 *   defect_classifier.mjs        - consumes an audit receipt, not media
 *   reel_production_contract.mjs - consumes a reel target manifest
 *   claude_opus_5_forensic_judge - non-deterministic; excluded from all
 *                                  measurement by design (it holds veto over
 *                                  deliverables, but gets no vote on metrics)
 */
const GATES = [
  'gate_frame_cadence_forensics.mjs',
  'gate_motion_velocity_cadence.mjs',
  'gate_video_optical_flow.mjs',
  'gate_speech_visual_onset_sync.mjs',
  'universal_deterministic_output_auditor.mjs',
];

const POISONS = [
  'poison_speed.mp4',
  'poison_silence.mp4',
  'poison_hardcut.mp4',
  'poison_ghost.mp4',
  'poison_highpass.mp4',
  'poison_lipoffset.mp4',
  'poison_zoompan.mp4',
  'poison_frozen.mp4',
];

/**
 * RESPONSIBILITY MAP -- which defects each gate is ACCOUNTABLE for catching.
 *
 * WHY THIS REPLACED THE ORIGINAL METRIC
 * -------------------------------------
 * The first version of this harness scored a gate SENSITIVE if it rejected
 * >= 1 poison. That bar is far too generous: a gate can catch an unrelated
 * defect and score as working while being completely blind to its actual job.
 *
 * Concretely, adding poison_frozen promotes gate_video_optical_flow to
 * "SENSITIVE" under the old rule -- even though it demonstrably cannot detect
 * the zoompan slideshow it is named for (1.289 vs a 0.15 floor). The metric
 * would have concealed the exact defect it exists to surface.
 *
 * Ownership is assigned from each gate's OWN stated purpose -- its filename,
 * its failure messages, and the contract clause it cites. Nothing is assigned
 * speculatively; a gate is never charged with a defect it never claimed.
 */
const OWNERSHIP = {
  // Cites cadence and frame timing. Its own failure text says "setpts".
  'gate_frame_cadence_forensics.mjs': ['poison_speed.mp4'],

  // Failure text: "Speed-warped frame velocity ... accelerated via setpts",
  // and a separate branch for "frozen or near-static".
  'gate_motion_velocity_cadence.mjs': ['poison_speed.mp4', 'poison_frozen.mp4'],

  // Failure text: "Static slideshow / frozen video detected".
  // Both the slideshow AND the frozen case are squarely its remit.
  'gate_video_optical_flow.mjs': ['poison_zoompan.mp4', 'poison_frozen.mp4'],

  // Failure text: audio-onset vs mouth-movement drift.
  'gate_speech_visual_onset_sync.mjs': ['poison_lipoffset.mp4'],

  // The universal auditor. Per hooks.json it enforces the cadence contract,
  // the filter/asset bans, the zoompan invariant, silence limits, continuity
  // PSNR, and the remediation contract -- so it owns the full set.
  'universal_deterministic_output_auditor.mjs': [
    'poison_speed.mp4', 'poison_silence.mp4', 'poison_hardcut.mp4',
    'poison_ghost.mp4', 'poison_highpass.mp4', 'poison_lipoffset.mp4',
    'poison_zoompan.mp4', 'poison_frozen.mp4',
  ],
};

/**
 * Distinguish a genuine verdict from a crash.
 *
 * A gate that throws an uncaught exception also exits non-zero, and naively
 * counting that as "rejected the poison" would inflate the sensitivity score
 * with gates that are merely broken. Stack-trace markers on stderr demote the
 * result to BROKEN.
 */
function runGate(gateFile, mediaPath) {
  const r = spawnSync('node', [join(ROOT, 'scripts', 'guards', gateFile), mediaPath], {
    encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024, cwd: ROOT,
  });

  if (r.error && r.error.code === 'ETIMEDOUT') {
    return { verdict: 'TIMEOUT', code: null };
  }

  const stderr = r.stderr || '';
  const crashed =
    /\n\s+at\s+\S+\s*\(/.test(stderr) ||           // stack frame
    /ReferenceError|TypeError|SyntaxError|ERR_MODULE_NOT_FOUND/.test(stderr);

  if (crashed) return { verdict: 'CRASH', code: r.status, detail: stderr.split('\n')[0] };

  return { verdict: r.status === 0 ? 'PASS' : 'REJECT', code: r.status };
}

function main() {
  const json = process.argv.includes('--json');

  if (!existsSync(join(FIXTURES, 'manifest.json'))) {
    throw new Error(
      `FIXTURES MISSING at ${FIXTURES}. Run: node scripts/guards/poison_fixtures.mjs`
    );
  }

  const results = [];

  for (const gate of GATES) {
    const cleanRun = runGate(gate, join(FIXTURES, 'clean.mp4'));
    const poisonRuns = {};
    for (const poison of POISONS) {
      poisonRuns[poison] = runGate(gate, join(FIXTURES, poison));
    }

    const rejected = POISONS.filter((p) => poisonRuns[p].verdict === 'REJECT');
    const broke = POISONS.filter((p) => ['CRASH', 'TIMEOUT'].includes(poisonRuns[p].verdict));

    const owned = OWNERSHIP[gate] || [];
    const ownedCaught = owned.filter((p) => poisonRuns[p].verdict === 'REJECT');
    const ownedMissed = owned.filter((p) => poisonRuns[p].verdict !== 'REJECT');

    let classification;
    if (['CRASH', 'TIMEOUT'].includes(cleanRun.verdict)) {
      classification = 'BROKEN';
    } else if (cleanRun.verdict === 'REJECT') {
      classification = 'HAIR_TRIGGER';
    } else if (rejected.length === 0) {
      classification = 'DECORATION';
    } else if (ownedMissed.length > 0) {
      classification = 'PARTIAL';
    } else {
      classification = 'SENSITIVE';
    }

    /**
     * A gate that rejects the clean control scores ZERO owned-coverage no
     * matter how many poisons it also rejects. An always-reject gate carries
     * exactly as much information as an always-pass gate: none. Crediting it
     * for "catching" defects would be the same error as counting a crash as
     * a verdict.
     */
    const credited = classification === 'HAIR_TRIGGER' || classification === 'BROKEN'
      ? 0
      : ownedCaught.length;

    results.push({
      gate, classification,
      clean: cleanRun.verdict,
      owned_count: owned.length,
      owned_caught: credited,
      owned_missed: ownedMissed,
      rejected_count: rejected.length,
      rejected, broke,
      detail: poisonRuns,
    });
  }

  const total = results.length;
  const sensitive = results.filter((r) => r.classification === 'SENSITIVE').length;

  // HEADLINE METRIC: of every (gate, defect-it-is-accountable-for) pair,
  // what fraction is actually caught?
  const ownedTotal = results.reduce((n, r) => n + r.owned_count, 0);
  const ownedCaught = results.reduce((n, r) => n + r.owned_caught, 0);
  const sensitivityPct = Number(((ownedCaught / ownedTotal) * 100).toFixed(2));
  const gateLevelPct = Number(((sensitive / total) * 100).toFixed(2));

  const report = {
    measured_at: new Date().toISOString(),
    total_gates: total,
    sensitive,
    partial: results.filter((r) => r.classification === 'PARTIAL').length,
    decoration: results.filter((r) => r.classification === 'DECORATION').length,
    hair_trigger: results.filter((r) => r.classification === 'HAIR_TRIGGER').length,
    broken: results.filter((r) => r.classification === 'BROKEN').length,
    owned_defects_total: ownedTotal,
    owned_defects_caught: ownedCaught,
    // Headline: responsibility-weighted. This is the number that matters.
    gate_sensitivity_pct: sensitivityPct,
    // Retained for continuity with the first baseline. Strictly more generous.
    gate_level_pct: gateLevelPct,
    results,
  };

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('\n=== GATE SENSITIVITY (Scorecard B) ===\n');

    const head = ['clean', ...POISONS.map((p) => p.replace('poison_', '').replace('.mp4', ''))];
    console.log('  ' + 'gate'.padEnd(42) + head.map((h) => h.slice(0, 9).padStart(10)).join(''));
    console.log('  ' + '-'.repeat(42 + head.length * 10));

    const sym = (v) => ({ PASS: 'pass', REJECT: 'REJECT', CRASH: 'crash!', TIMEOUT: 'timeout' }[v] || v);

    for (const r of results) {
      const cells = [sym(r.clean), ...POISONS.map((p) => sym(r.detail[p].verdict))];
      console.log('  ' + basename(r.gate).slice(0, 41).padEnd(42) +
        cells.map((c) => c.padStart(10)).join(''));
    }

    console.log('\n--- classification (owned = defects this gate is accountable for) ---');
    for (const r of results) {
      const miss = r.owned_missed.length
        ? '  MISSES: ' + r.owned_missed.map((p) => p.replace('poison_', '').replace('.mp4', '')).join(', ')
        : '';
      console.log(
        `  ${r.classification.padEnd(13)} ${basename(r.gate).padEnd(44)}` +
        `owned ${r.owned_caught}/${r.owned_count}${miss}`
      );
    }

    console.log('\n  SENSITIVE    : ' + report.sensitive + '   catches everything it owns');
    console.log('  PARTIAL      : ' + report.partial + '   catches some of what it owns');
    console.log('  DECORATION   : ' + report.decoration + '   never turns red');
    console.log('  HAIR_TRIGGER : ' + report.hair_trigger + '   rejects the clean control (scored 0)');
    console.log('  BROKEN       : ' + report.broken);
    console.log(`\n  GATE SENSITIVITY : ${sensitivityPct}%   (${ownedCaught}/${ownedTotal} owned defects caught)`);
    console.log(`  gate-level (old) : ${gateLevelPct}%   [more generous; kept for continuity]\n`);
  }

  mkdirSync(dirname(LEDGER), { recursive: true });
  appendFileSync(LEDGER, JSON.stringify(report) + '\n');
}

main();
