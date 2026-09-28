#!/usr/bin/env node
/**
 * CONTRACT BINDING COVERAGE METER
 * ================================
 * Answers one question with a hard number: "How much of what the constitution
 * DECLARES is actually READ BY CODE?"
 *
 * WHY THIS EXISTS
 * ---------------
 * The central forensic finding of the v7 audit was:
 *
 *     "The governance layer specifies a system that does not exist in code."
 *
 * hooks.json declares MAR <= 0.015, Pearson r >= 0.72, plosive window [-1,0],
 * PSNR bands, a 20ms latency budget -- and there is zero implementation for
 * any of them. Four separate subsystems were found built-then-abandoned.
 *
 * A declaration nobody reads is not a control. It is a comment that lies.
 *
 * THE THREE STATES
 * ----------------
 *   BOUND      Code resolves the value FROM hooks.json at runtime.
 *              Drift is structurally impossible: edit the config, behavior
 *              changes. This is the only state that is actually a control.
 *
 *   HARDCODED  The concept is implemented, but the threshold is a literal in
 *              source. It works TODAY, but hooks.json and code are two
 *              independent sources of truth that will silently diverge the
 *              first time someone edits one and not the other.
 *
 *   UNBOUND    No code references the key or its value anywhere. Pure fiction.
 *              This is the number that matters most.
 *
 * DESIGN CONSTRAINT: NO LLM IN THE MEASUREMENT PATH
 * -------------------------------------------------
 * This meter is 100% deterministic static analysis -- ripgrep and string
 * matching. It cannot be flattered, cannot hallucinate, and returns a byte
 * identical result for a byte identical tree. An LLM judge is the WRONG
 * instrument for progress measurement because it is non-deterministic and
 * it will happily congratulate you on a regression. The LLM keeps its
 * BINDING_VETO over *deliverables*; it gets no vote on *metrics*.
 *
 * USAGE
 *   node scripts/guards/contract_binding_coverage.mjs            # human report
 *   node scripts/guards/contract_binding_coverage.mjs --json     # machine
 *   node scripts/guards/contract_binding_coverage.mjs --record   # append ledger
 *   node scripts/guards/contract_binding_coverage.mjs --compare  # delta vs last
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';

const ROOT = process.env.ZYVORIQ_ROOT || '/Users/nitinagga/Documents/zyvoriq';
const HOOKS = '/Users/nitinagga/.gemini/config/hooks.json';
const LEDGER = join(ROOT, 'scratch', 'metrics', 'contract_binding_ledger.jsonl');

/**
 * Keys that are prose, provenance, or self-reference -- they describe the
 * contract rather than impose a measurable obligation, so counting them would
 * inflate the denominator with things that were never meant to be enforced.
 */
const NON_OBLIGATION_KEYS = new Set([
  'description', 'enforcement_note', 'enforcement_status', 'implementation_path',
  'core_rule', 'rationale', 'note', 'snap_err_rationale', 'priority',
  'enforcer', 'sha256', 'verified_clean_today',
]);

/**
 * Directories that are not the shipping pipeline. Matches here do not count as
 * a binding -- a threshold referenced only in a backup or a node_modules vendor
 * file is not enforced.
 */
const EXCLUDED_PATHS = [
  'node_modules', '.git', 'scratch/metrics', '.bak', '.backup',
  'dist/', 'build/', '.next/', 'coverage/',
];

function flattenObligations(obj, prefix = '', out = []) {
  for (const key of Object.keys(obj)) {
    if (NON_OBLIGATION_KEYS.has(key)) continue;
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObligations(value, path, out);
    } else {
      out.push({ path, key, value });
    }
  }
  return out;
}

/**
 * SOURCE CORPUS -- loaded exactly once.
 *
 * FAILURE-MODE NOTE (this is the whole point of this section)
 * -----------------------------------------------------------
 * The first version of this meter shelled out to `rg` and wrapped it in
 * `catch { return []; }`. `rg` is not installed on this machine, so every
 * single lookup threw ENOENT, was swallowed, and returned "no matches".
 * The meter then confidently reported 0% coverage / 100% fiction across all
 * 90 obligations -- a perfectly formatted, completely fabricated result.
 *
 * That is the canonical bug class: AN ERROR THAT IS INDISTINGUISHABLE FROM
 * A LEGITIMATE NEGATIVE RESULT. Never write a catch block that cannot tell
 * "I looked and found nothing" apart from "I never actually looked."
 *
 * The rewrite removes the external dependency entirely: enumerate the source
 * files once, read them into memory once, and match in-process. This is both
 * ~100x faster than 90 full-tree greps and has no silent-failure surface.
 */
const SOURCE_EXTENSIONS = ['.mjs', '.js', '.ts', '.tsx', '.jsx', '.sql', '.py', '.sh'];

/** Minimum plausible corpus size. A tree this size cannot legitimately be tiny. */
const MIN_EXPECTED_FILES = 50;

let CORPUS = null;

function loadCorpus() {
  if (CORPUS) return CORPUS;

  let listing;
  try {
    listing = execFileSync(
      'find',
      [ROOT, '-type', 'f', ...SOURCE_EXTENSIONS.flatMap((e, i) =>
        i === 0 ? ['-name', '*' + e] : ['-o', '-name', '*' + e])],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
    );
  } catch (err) {
    throw new Error(
      `CORPUS ENUMERATION FAILED: status=${err.status} code=${err.code} ` +
      `msg=${err.message}. Refusing to report a number from a broken instrument.`
    );
  }

  const files = listing
    .split('\n')
    .filter(Boolean)
    .filter((f) => !EXCLUDED_PATHS.some((ex) => f.includes(ex)))
    // The documents that DECLARE an obligation are not implementations of it.
    .filter((f) => !f.endsWith('contract_binding_coverage.mjs'));

  if (files.length < MIN_EXPECTED_FILES) {
    throw new Error(
      `CORPUS TOO SMALL: found only ${files.length} source files under ${ROOT}. ` +
      `Expected at least ${MIN_EXPECTED_FILES}. The enumeration is broken; a ` +
      `coverage number computed against an empty corpus would be pure fiction.`
    );
  }

  CORPUS = files.map((path) => {
    try {
      return { path, text: readFileSync(path, 'utf8') };
    } catch {
      return { path, text: '' }; // unreadable/binary -- contributes no matches
    }
  });

  const totalBytes = CORPUS.reduce((n, f) => n + f.text.length, 0);
  if (totalBytes === 0) {
    throw new Error('CORPUS READ FAILED: every source file read as empty.');
  }

  return CORPUS;
}

/** Return the paths of every corpus file containing `pattern` as a substring. */
function search(pattern) {
  return loadCorpus()
    .filter((f) => f.text.includes(pattern))
    .map((f) => f.path);
}

/**
 * CALIBRATION CANARY -- run before any measurement is emitted.
 *
 * A green light you have never seen turn red is not evidence of anything.
 * Before trusting a single number from this meter, prove the search primitive
 * can both FIND a string that is known to exist and MISS a string that is
 * known not to exist. If either canary misbehaves, abort rather than print.
 */
function selfTest() {
  const POSITIVE = 'universal_deterministic_output_auditor';
  const NEGATIVE = 'zzz_no_such_token_' + Math.random().toString(36).slice(2) + '_zzz';

  const posHits = search(POSITIVE);
  if (posHits.length === 0) {
    throw new Error(
      `CALIBRATION FAILED: known-present token "${POSITIVE}" returned 0 hits. ` +
      `The search primitive is not working. All coverage numbers would be fiction.`
    );
  }

  const negHits = search(NEGATIVE);
  if (negHits.length !== 0) {
    throw new Error(
      `CALIBRATION FAILED: known-absent token returned ${negHits.length} hits. ` +
      `The search primitive is matching indiscriminately.`
    );
  }

  return { positive_token: POSITIVE, positive_hits: posHits.length, negative_hits: 0 };
}

/**
 * Classify one obligation.
 *
 * BOUND requires the KEY NAME to appear in code, which is the only evidence
 * that the value is being resolved from config rather than duplicated.
 * HARDCODED means the key name is absent but a distinctive literal value is
 * present -- the behavior may exist, but config and code can diverge.
 */
function classify({ key, value }) {
  const keyHits = search(key);
  if (keyHits.length > 0) {
    return { state: 'BOUND', evidence: keyHits.slice(0, 3), hitCount: keyHits.length };
  }

  // Look for the literal value, but only when it is distinctive enough that a
  // match is meaningful. Booleans and tiny integers match everything.
  const literals = [];
  if (Array.isArray(value)) {
    literals.push(...value.filter((v) => typeof v === 'string' && v.length >= 4));
  } else if (typeof value === 'number' && !Number.isInteger(value)) {
    literals.push(String(value)); // e.g. 0.015, 0.72 -- distinctive
  } else if (typeof value === 'string' && value.length >= 6 && !/^[A-Z_]+$/.test(value)) {
    literals.push(value);
  }

  for (const lit of literals) {
    const hits = search(lit);
    if (hits.length > 0) {
      return {
        state: 'HARDCODED',
        evidence: hits.slice(0, 3),
        hitCount: hits.length,
        literal: lit,
      };
    }
  }

  return { state: 'UNBOUND', evidence: [], hitCount: 0 };
}

function main() {
  const args = process.argv.slice(2);

  // HARD PRECONDITION: prove the instrument works before reporting any number.
  // If this throws, the process dies with a non-zero exit and prints nothing
  // that could be mistaken for a measurement.
  const calibration = selfTest();

  const hooks = JSON.parse(readFileSync(HOOKS, 'utf8'));
  const zyvoriq = hooks.projects?.zyvoriq || {};
  const obligations = flattenObligations(zyvoriq);

  const results = obligations.map((o) => ({ ...o, ...classify(o) }));


  const byState = { BOUND: [], HARDCODED: [], UNBOUND: [] };
  for (const r of results) byState[r.state].push(r);

  const total = results.length;
  const bound = byState.BOUND.length;
  const hardcoded = byState.HARDCODED.length;
  const unbound = byState.UNBOUND.length;

  // Weighted: a hardcoded threshold is real enforcement but carries drift risk,
  // so it earns partial credit rather than full credit.
  const score = ((bound + 0.5 * hardcoded) / total) * 100;

  // Per-contract breakdown so the next action is obvious.
  const byContract = {};
  for (const r of results) {
    const contract = r.path.split('.')[0];
    byContract[contract] ??= { BOUND: 0, HARDCODED: 0, UNBOUND: 0, total: 0 };
    byContract[contract][r.state]++;
    byContract[contract].total++;
  }

  const gitSha = (() => {
    try {
      return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
        cwd: ROOT, encoding: 'utf8',
      }).trim();
    } catch { return 'nogit'; }
  })();

  const report = {
    measured_at: new Date().toISOString(),
    git_sha: gitSha,
    governance_epoch: hooks.governance_epoch || hooks.epoch || 'unknown',
    total_obligations: total,
    bound, hardcoded, unbound,
    binding_coverage_pct: Number(score.toFixed(2)),
    hard_unbound_pct: Number(((unbound / total) * 100).toFixed(2)),
    by_contract: byContract,
    unbound_keys: byState.UNBOUND.map((r) => r.path),
    hardcoded_keys: byState.HARDCODED.map((r) => ({ path: r.path, literal: r.literal })),
  };

  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('\n=== CONTRACT BINDING COVERAGE ===');
    console.log(`git ${report.git_sha}   epoch ${report.governance_epoch}   ${report.measured_at}`);
    console.log(`\n  Total obligations declared : ${total}`);
    console.log(`  BOUND     (config-driven)  : ${bound}`);
    console.log(`  HARDCODED (drift risk)     : ${hardcoded}`);
    console.log(`  UNBOUND   (fiction)        : ${unbound}`);
    console.log(`\n  BINDING COVERAGE           : ${report.binding_coverage_pct}%`);
    console.log(`  PURE FICTION               : ${report.hard_unbound_pct}%`);

    console.log('\n--- per contract ---');
    const rows = Object.entries(byContract).sort(
      (a, b) => b[1].UNBOUND / b[1].total - a[1].UNBOUND / a[1].total
    );
    for (const [name, c] of rows) {
      const pct = (((c.BOUND + 0.5 * c.HARDCODED) / c.total) * 100).toFixed(0);
      const bar = '#'.repeat(Math.round(pct / 5)).padEnd(20, '.');
      console.log(`  ${bar} ${String(pct).padStart(3)}%  ${name}  (${c.UNBOUND}/${c.total} unbound)`);
    }

    if (unbound > 0) {
      console.log('\n--- UNBOUND (declared, enforced by nothing) ---');
      for (const k of report.unbound_keys) console.log('  x ' + k);
    }
  }

  if (args.includes('--record')) {
    mkdirSync(dirname(LEDGER), { recursive: true });
    appendFileSync(LEDGER, JSON.stringify(report) + '\n');
    console.log(`\n[recorded] ${LEDGER}`);
  }

  if (args.includes('--compare') && existsSync(LEDGER)) {
    const lines = readFileSync(LEDGER, 'utf8').trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      const prev = JSON.parse(lines[lines.length - 1]);
      const d = report.binding_coverage_pct - prev.binding_coverage_pct;
      const dUnbound = report.unbound - prev.unbound;
      console.log('\n--- DELTA vs last recorded ---');
      console.log(`  previous : ${prev.binding_coverage_pct}%  (${prev.unbound} unbound, git ${prev.git_sha})`);
      console.log(`  current  : ${report.binding_coverage_pct}%  (${report.unbound} unbound, git ${report.git_sha})`);
      console.log(`  CHANGE   : ${d >= 0 ? '+' : ''}${d.toFixed(2)} pct-pts   unbound ${dUnbound >= 0 ? '+' : ''}${dUnbound}`);
      console.log(`  VERDICT  : ${d > 0 ? 'IMPROVED' : d < 0 ? 'REGRESSED' : 'NO CHANGE'}`);
    }
  }

  return report;
}

main();
