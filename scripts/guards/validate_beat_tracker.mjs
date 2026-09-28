#!/usr/bin/env node
/**
 * BEAT TRACKER VALIDATION
 * =======================
 * Generates click tracks at KNOWN tempos and checks that the estimator
 * recovers them. Without this, every downstream cut list is built on an
 * unverified number.
 *
 * WHY THIS IS NECESSARY
 * ---------------------
 * The first estimator reported 60.00 BPM on the production master -- exactly
 * the frame rate and exactly the edge of its own search range. It was ranking
 * noise, because the rectified onset envelope has a DC offset that gives
 * autocorrelation a flat non-decaying floor.
 *
 * That error was only visible because the number happened to look suspicious.
 * A slightly-wrong tempo would have passed unnoticed and silently corrupted
 * every cut list derived from it. Known-tempo clicks make the check explicit.
 *
 * TOLERANCE: +/-2% of true BPM. Tighter than any audible difference, loose
 * enough to absorb the quantisation of a finite-length click track.
 *
 * NOTE: aevalsrc synthesis is banned for DELIVERABLES. These are throwaway
 * measurement references under scratch/, never shipped as content.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { onsetEnvelope, recoverBeatGrid } from './assembly_forensics.mjs';

const ROOT = process.env.ZYVORIQ_ROOT || '/Users/nitinagga/Documents/zyvoriq';
const OUT = join(ROOT, 'scratch', 'gate_sensitivity', 'beat_validation');
const FPS = 24;
const DURATION = 40;
const TOLERANCE_PCT = 2.0;

/**
 * 90/96/120/144 are frame-exact at 24 fps (integer frames per beat).
 * 100/125/128 are deliberately NOT, to confirm the estimator reports
 * fractional periods rather than silently rounding.
 */
const TEST_BPMS = [90, 96, 100, 120, 125, 128, 144];

function makeClick(bpm, path) {
  const bps = bpm / 60;
  // 20 ms of 1 kHz tone at the start of every beat, silence otherwise.
  const expr = `if(lt(mod(t*${bps},1),0.02), 0.8*sin(2*PI*1000*t), 0)`;
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'lavfi', '-i', `aevalsrc='${expr}':d=${DURATION}:s=44100`,
    '-ac', '1', path,
  ], { maxBuffer: 64 * 1024 * 1024 });
}

function main() {
  mkdirSync(OUT, { recursive: true });

  console.log('\n=== BEAT TRACKER VALIDATION ===\n');
  console.log('  true BPM   recovered   period(f)   err%    frame-exact   result');
  console.log('  ' + '-'.repeat(66));

  let passed = 0;
  const results = [];

  for (const bpm of TEST_BPMS) {
    const path = join(OUT, `click_${bpm}bpm.wav`);
    makeClick(bpm, path);

    const { flux, nFrames } = onsetEnvelope(path);
    const grid = recoverBeatGrid(flux, nFrames);

    const errPct = ((grid.bpm - bpm) / bpm) * 100;
    const ok = Math.abs(errPct) <= TOLERANCE_PCT;
    if (ok) passed++;

    // Ground truth for whether this tempo can land on the 24 fps grid at all.
    const truePeriod = (60 * FPS) / bpm;
    const trulyExact = Math.abs(truePeriod - Math.round(truePeriod)) < 0.02;

    results.push({ bpm, recovered: grid.bpm, ok, errPct, trulyExact, grid });

    console.log(
      `  ${String(bpm).padStart(8)}   ${String(grid.bpm).padStart(9)}` +
      `   ${String(grid.beat_period_frames).padStart(9)}` +
      `   ${errPct.toFixed(2).padStart(6)}` +
      `   ${String(grid.frame_exact).padStart(11)}` +
      `   ${ok ? 'PASS' : 'FAIL'}` +
      `${grid.hit_search_boundary ? '  [HIT SEARCH BOUNDARY]' : ''}`
    );
  }

  const pct = ((passed / TEST_BPMS.length) * 100).toFixed(1);
  console.log(`\n  RECOVERY ACCURACY : ${passed}/${TEST_BPMS.length}  (${pct}%)  tolerance +/-${TOLERANCE_PCT}%`);

  // Cross-check that frame-exactness is reported correctly, since the planner
  // will branch on it when deciding a rounding policy.
  const misreported = results.filter((r) => r.ok && r.grid.frame_exact !== r.trulyExact);
  if (misreported.length > 0) {
    console.log(`\n  WARNING: frame_exact misreported for ${misreported.map((r) => r.bpm).join(', ')} BPM`);
  } else {
    console.log('  frame_exact flag  : correct on all recovered tempos');
  }

  console.log('');
  if (passed < TEST_BPMS.length) {
    console.log('  Estimator is NOT trustworthy. Do not build a cut list on it yet.\n');
    process.exit(1);
  }
}

main();
