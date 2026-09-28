#!/usr/bin/env node
/**
 * ASSEMBLY FORENSICS -- audio/visual mapping at the timeline level
 * ================================================================
 * Measures the class of defect that only exists AFTER assembly: whether the
 * visual cut points land on the musical grid of the Lyria master.
 *
 * WHY THIS EXISTS
 * ---------------
 * Reported symptom: "individual clips are good, problems start after assembly
 * with lyria soundtrack and veo visuals mapping."
 *
 * That symptom is consistent with the measurements. On the real 338 s master:
 *
 *     container duration : 338.000000 s
 *     video frames       : 8112  ( = 338 x 24 exactly )
 *     shard durations    : 44+40+44+40+44+40+44+42 = 338, all frame-exact
 *
 * There is no drift, no duration mismatch, no cadence error. Every per-clip
 * gate passes because every per-clip property is correct. The defect is
 * RELATIONAL -- it lives in the alignment between two artifacts that are each
 * individually valid.
 *
 * A cut that lands 5 frames before a downbeat is not a broken clip and not a
 * broken song. It is a broken EDIT. No existing gate in scripts/guards/ looks
 * at the relationship between cut times and musical time, so this entire
 * failure mode is invisible to the current harness.
 *
 * WHAT IT MEASURES
 *   1. Beat grid recovered from the audio master (tempo + phase).
 *   2. Visual cut timestamps recovered from the video.
 *   3. For each cut, signed frame distance to the nearest beat.
 *
 * At 24 fps one frame is 41.667 ms. Perceptually, a cut within +/-1 frame of a
 * transient reads as intentional; beyond ~3 frames it reads as a mistake --
 * the picture and the music stop agreeing about where "now" is.
 *
 * USAGE
 *   node scripts/guards/assembly_forensics.mjs <video.mp4> [audio_master]
 *   node scripts/guards/assembly_forensics.mjs <video.mp4> --json
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const FPS = 24;
const SR = 22050;
const HOP = Math.round(SR / FPS);   // 919 samples = one video frame

/** Tempo search range. Covers everything from a ballad to uptempo dance. */
const MIN_BPM = 60;
const MAX_BPM = 180;

/** A cut this far from a beat still reads as intentional. */
const ON_BEAT_TOLERANCE_FRAMES = 1;

function sh(bin, args, opts = {}) {
  return execFileSync(bin, args, { maxBuffer: 512 * 1024 * 1024, ...opts });
}

/**
 * Decode to mono PCM and build a per-video-frame onset strength envelope.
 *
 * Spectral flux would be sharper, but a rectified energy derivative is
 * adequate for percussive material and has no dependencies. Crucially it is
 * fully deterministic: same bytes in, same envelope out.
 */
export function onsetEnvelope(audioPath) {
  const raw = sh('ffmpeg', [
    '-v', 'error', '-i', audioPath,
    '-ac', '1', '-ar', String(SR), '-f', 's16le', '-',
  ]);

  const samples = new Int16Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 2));
  const nFrames = Math.floor(samples.length / HOP);
  if (nFrames < FPS) {
    throw new Error(`AUDIO TOO SHORT: ${nFrames} frames decoded from ${audioPath}`);
  }

  // RMS per frame.
  const energy = new Float64Array(nFrames);
  for (let f = 0; f < nFrames; f++) {
    let sum = 0;
    const base = f * HOP;
    for (let i = 0; i < HOP; i++) {
      const v = samples[base + i] / 32768;
      sum += v * v;
    }
    energy[f] = Math.sqrt(sum / HOP);
  }

  // Half-wave rectified first difference: onsets are energy INCREASES.
  const flux = new Float64Array(nFrames);
  for (let f = 1; f < nFrames; f++) {
    const d = energy[f] - energy[f - 1];
    flux[f] = d > 0 ? d : 0;
  }

  // Normalise so thresholds are scale-free across masters of different loudness.
  const peak = Math.max(...flux);
  if (peak > 0) for (let f = 0; f < nFrames; f++) flux[f] /= peak;

  return { flux, nFrames };
}

/**
 * Recover tempo and phase from the onset envelope.
 *
 * FAILURE-MODE NOTE
 * -----------------
 * The first version reported 60.00 BPM (24 frames/beat) on the 338 s master --
 * exactly the frame rate, and exactly the maximum of its own search range.
 * Both are tells for a broken estimator rather than a slow song.
 *
 * Cause: the flux envelope is half-wave rectified, so it has a large positive
 * mean. Autocorrelating a signal with a DC offset produces a floor of ~mean^2
 * at EVERY lag, which does not decay. Real periodic structure adds only a
 * small ripple on top of that floor, so the estimator was essentially ranking
 * noise and drifting to the range boundary.
 *
 * Three fixes:
 *   1. MEAN-CENTRE the envelope before correlating. Removes the DC floor so
 *      the correlation actually measures periodicity.
 *   2. TEMPO PRIOR. Autocorrelation cannot distinguish a tempo from half or
 *      double it -- both are genuinely periodic. A log-Gaussian prior centred
 *      on 120 BPM breaks the tie the way a listener would.
 *   3. SUB-FRAME INTERPOLATION. Integer frame lags cannot represent common
 *      tempos: 125 BPM is 11.52 frames/beat at 24 fps. Rounding to 11 or 12
 *      accumulates ~0.5 frame of error per beat, which is several frames of
 *      drift within a single bar. Parabolic interpolation around the peak
 *      recovers a fractional period.
 */
export function recoverBeatGrid(flux, nFrames) {
  const minLag = Math.max(2, Math.floor((60 / MAX_BPM) * FPS));
  const maxLag = Math.ceil((60 / MIN_BPM) * FPS);

  // 1. Mean-centre so the correlation has no DC floor.
  let mean = 0;
  for (let f = 0; f < nFrames; f++) mean += flux[f];
  mean /= nFrames;
  const centred = new Float64Array(nFrames);
  for (let f = 0; f < nFrames; f++) centred[f] = flux[f] - mean;

  // Normalised autocorrelation across the tempo range.
  const raw = new Float64Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0, energyA = 0, energyB = 0;
    for (let f = lag; f < nFrames; f++) {
      num += centred[f] * centred[f - lag];
      energyA += centred[f] * centred[f];
      energyB += centred[f - lag] * centred[f - lag];
    }
    const denom = Math.sqrt(energyA * energyB);
    raw[lag] = denom > 0 ? num / denom : 0;
  }

  // 2. Log-Gaussian prior centred on 120 BPM, ~0.7 octave width.
  const PREFERRED_BPM = 120;
  const OCTAVE_SIGMA = 0.7;
  const scored = new Float64Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (60 * FPS) / lag;
    const octaves = Math.log2(bpm / PREFERRED_BPM);
    scored[lag] = raw[lag] * Math.exp(-(octaves * octaves) / (2 * OCTAVE_SIGMA * OCTAVE_SIGMA));
  }

  let bestLag = minLag;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (scored[lag] > scored[bestLag]) bestLag = lag;
  }

  // 3. Parabolic interpolation for a fractional period.
  let refined = bestLag;
  if (bestLag > minLag && bestLag < maxLag) {
    const y0 = scored[bestLag - 1], y1 = scored[bestLag], y2 = scored[bestLag + 1];
    const denom = y0 - 2 * y1 + y2;
    if (Math.abs(denom) > 1e-12) {
      const delta = 0.5 * (y0 - y2) / denom;
      if (Math.abs(delta) <= 1) refined = bestLag + delta;
    }
  }

  // Phase search at sub-frame resolution against the fractional period.
  let bestPhase = 0, bestPhaseScore = -Infinity;
  for (let phase = 0; phase < Math.ceil(refined); phase++) {
    let score = 0;
    for (let b = 0; ; b++) {
      const f = Math.round(phase + b * refined);
      if (f >= nFrames) break;
      score += flux[f];
    }
    if (score > bestPhaseScore) { bestPhaseScore = score; bestPhase = phase; }
  }

  const beats = [];
  for (let b = 0; ; b++) {
    const f = Math.round(bestPhase + b * refined);
    if (f >= nFrames) break;
    beats.push(f);
  }

  const bpm = (60 * FPS) / refined;

  /**
   * A tempo is frame-exact only when frames-per-beat is an integer. 120 BPM
   * gives exactly 12.000; 125 BPM gives 11.52 and can never land cleanly on
   * the 24 fps grid. Callers planning a cut list need to know which case
   * they are in, because a non-integer period forces a rounding policy.
   */
  const nearestInt = Math.round(refined);
  const frameExact = Math.abs(refined - nearestInt) < 0.02;

  return {
    beat_period_frames: Number(refined.toFixed(4)),
    beat_period_frames_int: nearestInt,
    bpm: Number(bpm.toFixed(2)),
    phase_frames: bestPhase,
    autocorr_peak: Number(raw[bestLag].toFixed(4)),
    hit_search_boundary: bestLag === minLag || bestLag === maxLag,
    frame_exact: frameExact,
    beats,
  };
}

/**
 * Recover visual cut timestamps via ffmpeg scene-change scoring.
 *
 * FAILURE-MODE NOTE
 * -----------------
 * The first version called execFileSync, which returns ONLY stdout. The
 * `showinfo` filter writes to STDERR, so every cut list came back empty and
 * both the on-beat and off-beat control assemblies were reported as having
 * zero cuts. Identical symptom to the ripgrep incident: the code was not
 * looking, and reported "nothing found".
 *
 * Both streams are now captured, and the absence of any showinfo output at
 * all is treated as a detector failure rather than as "no cuts".
 */
function detectCuts(videoPath, threshold = 0.20) {
  const r = spawnSync('ffmpeg', [
    '-v', 'info', '-i', videoPath,
    '-filter:v', `select='gt(scene,${threshold})',showinfo`,
    '-f', 'null', '-',
  ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

  const combined = (r.stdout || '') + (r.stderr || '');

  if (!/Parsed_showinfo/.test(combined)) {
    throw new Error(
      `CUT DETECTOR DID NOT RUN on ${videoPath}. No showinfo output in either ` +
      `stream. Refusing to report "0 cuts" from a probe that never executed.\n` +
      combined.split('\n').slice(-5).join('\n')
    );
  }

  const times = [...combined.matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1]));
  return [...new Set(times)].sort((a, b) => a - b);
}

function median(xs) {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const positional = args.filter((a) => !a.startsWith('--'));
  const videoPath = positional[0];
  const audioPath = positional[1] || videoPath;   // default: the video's own track

  if (!videoPath || !existsSync(videoPath)) {
    throw new Error('Usage: node assembly_forensics.mjs <video.mp4> [audio_master] [--json]');
  }
  if (!existsSync(audioPath)) throw new Error(`AUDIO NOT FOUND: ${audioPath}`);

  const { flux, nFrames } = onsetEnvelope(audioPath);
  const grid = recoverBeatGrid(flux, nFrames);

  /**
   * CUT SOURCE: declared EDL beats reverse-engineering, every time.
   *
   * Scene detection is unreliable on the exact material this project produces.
   * On an 8-shot test assembly it reported 21 cuts: the extra 13 were intra-shot
   * content changes in choreography footage, not edit points. Those false
   * positives land at arbitrary times and swamp the alignment statistic.
   *
   * When the pipeline knows where it cut, it should say so. `--cuts` takes a
   * comma-separated frame list, which makes the measurement exact. Detection
   * remains available for auditing a delivered file with no accompanying plan,
   * but its output should be read as an estimate.
   */
  const declared = args.find((a) => a.startsWith('--cuts='));
  const cutSource = declared ? 'DECLARED_EDL' : 'SCENE_DETECTION';
  const cutTimes = declared
    ? declared.slice('--cuts='.length).split(',').filter(Boolean).map((f) => Number(f) / FPS)
    : detectCuts(videoPath);

  /**
   * Absence of cuts is not evidence of good editing -- it may equally mean the
   * detector failed. Report it as unmeasurable rather than as a perfect score.
   */
  if (cutTimes.length === 0) {
    const report = {
      video: videoPath, audio: audioPath, ...grid,
      cuts_detected: 0,
      verdict: 'UNMEASURABLE',
      note: 'No scene cuts detected. Either a single continuous take, or the '
          + 'detector threshold is wrong. Not scored as a pass.',
    };
    console.log(json ? JSON.stringify(report, null, 2)
      : `\nUNMEASURABLE: no cuts detected in ${videoPath}\n`);
    return;
  }

  const analysis = cutTimes.map((t) => {
    const cutFrame = Math.round(t * FPS);
    let nearest = grid.beats[0];
    for (const b of grid.beats) {
      if (Math.abs(b - cutFrame) < Math.abs(nearest - cutFrame)) nearest = b;
    }
    const err = cutFrame - nearest;
    return {
      cut_time_s: Number(t.toFixed(3)),
      cut_frame: cutFrame,
      nearest_beat_frame: nearest,
      error_frames: err,
      error_ms: Number(((err / FPS) * 1000).toFixed(1)),
      on_beat: Math.abs(err) <= ON_BEAT_TOLERANCE_FRAMES,
    };
  });

  const onBeat = analysis.filter((a) => a.on_beat).length;
  const absErrs = analysis.map((a) => Math.abs(a.error_frames));
  const onBeatPct = Number(((onBeat / analysis.length) * 100).toFixed(2));

  const report = {
    video: videoPath,
    audio: audioPath,
    ...grid,
    beats: undefined,                   // too long to print; derivable from bpm+phase
    beat_count: grid.beats.length,
    cuts_detected: analysis.length,
    cuts_on_beat: onBeat,
    on_beat_pct: onBeatPct,
    median_abs_error_frames: median(absErrs),
    max_abs_error_frames: Math.max(...absErrs),
    median_abs_error_ms: Number(((median(absErrs) / FPS) * 1000).toFixed(1)),
    cuts: analysis,
  };

  if (json) { console.log(JSON.stringify(report, null, 2)); return; }

  console.log('\n=== ASSEMBLY FORENSICS: audio/visual mapping ===');
  console.log(`  video : ${videoPath}`);
  console.log(`  audio : ${audioPath}`);
  console.log(`\n  recovered tempo : ${grid.bpm} BPM  (${grid.beat_period_frames} frames/beat, phase ${grid.phase_frames})`);
  console.log(`  beats           : ${grid.beat_count}`);
  console.log(`  cut source      : ${cutSource}`);
  console.log(`  cuts            : ${analysis.length}`);
  console.log(`\n  CUTS ON BEAT    : ${onBeat}/${analysis.length}  (${onBeatPct}%)   [+/-${ON_BEAT_TOLERANCE_FRAMES} frame]`);
  console.log(`  median error    : ${report.median_abs_error_frames} frames  (${report.median_abs_error_ms} ms)`);
  console.log(`  worst error     : ${report.max_abs_error_frames} frames`);

  console.log('\n  cut      time      frame   beat   err(f)   err(ms)');
  console.log('  ' + '-'.repeat(52));
  for (const [i, a] of analysis.slice(0, 30).entries()) {
    console.log(
      `  ${String(i + 1).padStart(3)}  ${String(a.cut_time_s).padStart(9)}` +
      `  ${String(a.cut_frame).padStart(7)} ${String(a.nearest_beat_frame).padStart(6)}` +
      `  ${String(a.error_frames).padStart(6)}  ${String(a.error_ms).padStart(8)}` +
      `  ${a.on_beat ? '' : '  OFF-BEAT'}`
    );
  }
  if (analysis.length > 30) console.log(`  ... ${analysis.length - 30} more`);
  console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
