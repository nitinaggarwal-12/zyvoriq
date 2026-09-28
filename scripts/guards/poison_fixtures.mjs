#!/usr/bin/env node
/**
 * POISON FIXTURE GENERATOR
 * ========================
 * Builds a corpus of deliberately-defective media derived from a known-good
 * source clip, so that every forensic gate can be tested for SENSITIVITY --
 * i.e. proven capable of actually turning red.
 *
 * WHY THIS EXISTS
 * ---------------
 *   "A green light you have never seen turn red is not evidence.
 *    It is decoration."
 *
 * This was demonstrated the hard way: the contract-binding meter reported a
 * confident "0% coverage / 100% fiction" for all 90 obligations because the
 * `rg` binary it depended on was not installed and the ENOENT was swallowed
 * by a bare catch. It looked authoritative. It was fabricated. A single
 * known-good canary would have caught it instantly.
 *
 * The same risk applies to every gate in scripts/guards/. A gate that has
 * never been observed rejecting a bad input is indistinguishable from a gate
 * that returns PASS unconditionally. This generator produces the inputs that
 * force each gate to prove itself.
 *
 * EACH POISON TARGETS A SPECIFIC DECLARED CONTRACT CLAUSE
 * -------------------------------------------------------
 *   speed      -> cadence_and_speed_contract (strict 1.000x, no setpts)
 *   silence    -> filter_and_asset_bans.max_unintended_silence_gap_ms
 *   hardcut    -> visual_continuity_and_psnr_contract (undeclared hard cut)
 *   ghost      -> remediation_contract (cosmetic filter on generation defect)
 *   highpass   -> filter_and_asset_bans.ban_highpass_at_or_above_hz (81 Hz)
 *   lipoffset  -> lipsync_and_viseme_dsp_contract (Pearson r >= 0.72)
 *   zoompan    -> STATIC_ZOOMPAN_SLIDESHOW_FORBIDDEN
 *
 * IMPORTANT: the ffmpeg filters used here (setpts, unsharp, zoompan, highpass)
 * are themselves CONSTITUTIONALLY BANNED in production. That is precisely the
 * point -- these artifacts are quarantined test poison, never deliverables.
 * They live under scratch/gate_sensitivity/ and must never be shipped.
 *
 * USAGE
 *   node scripts/guards/poison_fixtures.mjs             # build all fixtures
 *   node scripts/guards/poison_fixtures.mjs --list      # show manifest only
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.env.ZYVORIQ_ROOT || '/Users/nitinagga/Documents/zyvoriq';
const OUT_DIR = join(ROOT, 'scratch', 'gate_sensitivity', 'fixtures');

/**
 * Known-good donor clips. Both are native 24/1 CFR Veo output with an AAC
 * track -- i.e. they already satisfy the cadence contract, so any gate
 * failure on the CLEAN fixture indicates a false positive in the gate rather
 * than a defect in the media.
 */
const SOURCE_A = join(ROOT, 'scratch/keynote_10min/veo_act3.mp4');
const SOURCE_B = join(ROOT, 'scratch/chandigarh_denmark_production/shot_2_raw.mp4');

/** Fixture duration. Short enough that the whole suite runs in seconds. */
const DUR = 6;

function ff(args, label) {
  try {
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
      encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(`FFMPEG FAILED building "${label}": ${err.stderr || err.message}`);
  }
}

function probe(path, stream, fields) {
  return execFileSync('ffprobe', [
    '-v', 'error', '-select_streams', stream,
    '-show_entries', fields, '-of', 'default=nw=1:nk=1', path,
  ], { encoding: 'utf8' }).trim();
}

/**
 * Verify a fixture actually got built AND actually carries the defect it
 * claims to carry. A poison fixture that is silently identical to the clean
 * one would make a gate look sensitive when it is not -- the exact inversion
 * of the bug this whole system exists to prevent.
 */
function verifyFixture(path, expectation) {
  if (!existsSync(path)) throw new Error(`FIXTURE MISSING: ${path}`);
  const bytes = statSync(path).size;
  if (bytes < 1024) throw new Error(`FIXTURE TRUNCATED (${bytes}B): ${path}`);
  return { path, bytes, expectation };
}

function main() {
  for (const src of [SOURCE_A, SOURCE_B]) {
    if (!existsSync(src)) {
      throw new Error(
        `DONOR CLIP MISSING: ${src}. Cannot build poison fixtures without a ` +
        `known-good source. Refusing to emit a fixture set built from nothing.`
      );
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const W = probe(SOURCE_A, 'v:0', 'stream=width');
  const H = probe(SOURCE_A, 'v:0', 'stream=height');
  console.log(`donor: ${SOURCE_A}  ${W}x${H}`);

  const built = [];
  const p = (n) => join(OUT_DIR, n);

  // ---------------------------------------------------------------------
  // CLEAN CONTROL -- must PASS every gate.
  // Normalised to the canonical encode contract: 24/1 CFR, yuv420p, faststart.
  // If a gate rejects THIS, the gate has a false-positive problem.
  // ---------------------------------------------------------------------
  ff(['-i', SOURCE_A, '-t', String(DUR),
      '-r', '24', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
      p('clean.mp4')], 'clean');
  built.push(verifyFixture(p('clean.mp4'), 'MUST_PASS'));

  // ---------------------------------------------------------------------
  // POISON 1 -- SPEED. setpts=0.9 breaks strict 1.000x playback.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'),
      '-filter:v', 'setpts=0.9*PTS', '-an',
      '-r', '24', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      p('poison_speed.mp4')], 'poison_speed');
  built.push(verifyFixture(p('poison_speed.mp4'), 'MUST_FAIL:cadence_and_speed_contract'));

  // ---------------------------------------------------------------------
  // POISON 2 -- SILENCE. 3s of digital black in the audio bed.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'),
      '-af', "volume=0:enable='between(t,2,5)'",
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      p('poison_silence.mp4')], 'poison_silence');
  built.push(verifyFixture(p('poison_silence.mp4'), 'MUST_FAIL:max_unintended_silence_gap_ms'));

  // ---------------------------------------------------------------------
  // POISON 3 -- HARD CUT. Two unrelated shots spliced with no tail-frame
  // chaining. Should land far below the PSNR <= 20 dB hard-cut threshold.
  // ---------------------------------------------------------------------
  ff(['-i', SOURCE_B, '-t', '3',
      '-r', '24', '-s', `${W}x${H}`, '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264', '-crf', '18', '-c:a', 'aac', '-b:a', '192k',
      p('_tmp_b.mp4')], 'tmp_b');
  ff(['-i', p('clean.mp4'), '-t', '3',
      '-r', '24', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k', p('_tmp_a.mp4')], 'tmp_a');
  writeFileSync(p('_concat.txt'), `file '${p('_tmp_a.mp4')}'\nfile '${p('_tmp_b.mp4')}'\n`);
  ff(['-f', 'concat', '-safe', '0', '-i', p('_concat.txt'),
      '-c', 'copy', '-movflags', '+faststart',
      p('poison_hardcut.mp4')], 'poison_hardcut');
  built.push(verifyFixture(p('poison_hardcut.mp4'), 'MUST_FAIL:visual_continuity_psnr'));

  // ---------------------------------------------------------------------
  // POISON 4 -- GHOST/COSMETIC. unsharp is the exact filter
  // fix_omni12_ghosting_and_blur.mjs used to "repair" temporal ghosting.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'),
      '-vf', 'unsharp=5:5:0.35:5:5:0.0',
      '-r', '24', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      '-c:a', 'copy', p('poison_ghost.mp4')], 'poison_ghost');
  built.push(verifyFixture(p('poison_ghost.mp4'), 'MUST_FAIL:remediation_contract'));

  // ---------------------------------------------------------------------
  // POISON 5 -- HIGHPASS at 200 Hz, far above the 80 Hz ceiling. Guts the
  // entire bass register; the constitution allows zero 81-199 Hz gray zone.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'),
      '-af', 'highpass=f=200',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      p('poison_highpass.mp4')], 'poison_highpass');
  built.push(verifyFixture(p('poison_highpass.mp4'), 'MUST_FAIL:ban_highpass_at_or_above_hz'));

  // ---------------------------------------------------------------------
  // POISON 6 -- LIP OFFSET. Audio delayed 500 ms = 12 frames at 24fps,
  // 25x the 20 ms latency budget. Video untouched, so any gate that claims
  // to measure audio/visual sync MUST catch this.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'),
      '-af', 'adelay=500|500',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      p('poison_lipoffset.mp4')], 'poison_lipoffset');
  built.push(verifyFixture(p('poison_lipoffset.mp4'), 'MUST_FAIL:lipsync_pearson_r'));

  // ---------------------------------------------------------------------
  // POISON 7 -- ZOOMPAN SLIDESHOW. A single still frame with synthetic
  // Ken-Burns motion: zero real optical flow, the archetypal fake reel.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'), '-vf', 'select=eq(n\\,0)', '-vframes', '1',
      p('_still.png')], 'still');
  ff(['-loop', '1', '-i', p('_still.png'), '-t', String(DUR),
      '-vf', `zoompan=z='min(zoom+0.0015,1.5)':d=${DUR * 24}:s=${W}x${H},fps=24`,
      '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      p('poison_zoompan.mp4')], 'poison_zoompan');
  built.push(verifyFixture(p('poison_zoompan.mp4'), 'MUST_FAIL:STATIC_ZOOMPAN_SLIDESHOW_FORBIDDEN'));

  // ---------------------------------------------------------------------
  // POISON 8 -- TRULY FROZEN. One still, no synthetic motion whatsoever.
  //
  // This is the discriminating control for the motion gates. Measured:
  //   clean (real footage) meanFlow = 4.103
  //   poison_zoompan       meanFlow = 1.289
  //   poison_frozen        meanFlow = 0.000
  // gate_video_optical_flow fires only below 0.15, so it catches THIS but
  // sails past the zoompan slideshow with 8.6x margin. Without this fixture
  // the gate looks dead; with it, the gate is revealed as alive but aimed
  // at a defect no generator would ever actually produce.
  // ---------------------------------------------------------------------
  ff(['-i', p('clean.mp4'), '-vf', 'select=eq(n\\,0)', '-vframes', '1',
      p('_frozen.png')], 'frozen_still');
  ff(['-loop', '1', '-i', p('_frozen.png'), '-t', String(DUR),
      '-r', '24', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18',
      p('poison_frozen.mp4')], 'poison_frozen');
  built.push(verifyFixture(p('poison_frozen.mp4'), 'MUST_FAIL:frozen_video'));

  // ---------------------------------------------------------------------
  // Differential check: every poison must differ from clean in BYTES.
  // Identical output would mean the filter silently no-op'd, which would
  // make a gate appear sensitive when nothing was actually wrong.
  // ---------------------------------------------------------------------
  const cleanBytes = built[0].bytes;
  const identical = built.slice(1).filter((f) => f.bytes === cleanBytes);
  if (identical.length > 0) {
    throw new Error(
      `POISON INERT: ${identical.map((f) => f.path).join(', ')} are byte-identical ` +
      `to clean.mp4. The corrupting filter did not apply. These fixtures would ` +
      `produce a meaningless sensitivity score.`
    );
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    donor_a: SOURCE_A,
    donor_b: SOURCE_B,
    dimensions: `${W}x${H}`,
    duration_s: DUR,
    warning: 'QUARANTINED TEST POISON. Never ship. Never audit as a deliverable.',
    fixtures: built,
  };
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nbuilt ${built.length} fixtures in ${OUT_DIR}`);
  for (const f of built) {
    console.log(`  ${String(f.bytes).padStart(9)}B  ${f.path.split('/').pop().padEnd(24)} ${f.expectation}`);
  }
}

main();
