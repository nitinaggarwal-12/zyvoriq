#!/usr/bin/env node
/**
 * ASSEMBLY FIXTURE BUILDER -- ground truth for the assembly auditor
 * =================================================================
 * Builds two assemblies from the SAME Lyria master and the SAME source clips,
 * differing only in where the cuts land:
 *
 *   assembly_onbeat.mp4   cuts placed exactly on the recovered beat grid
 *   assembly_offbeat.mp4  identical, every cut displaced by +6 frames (250 ms)
 *
 * WHY BOTH ARE NEEDED
 * -------------------
 * An auditor that reports "cuts are aligned" is worthless until it has been
 * shown to report "cuts are misaligned" on material that genuinely is. These
 * two assemblies are the positive and negative control for that claim.
 *
 * 6 frames is chosen deliberately: large enough to be unambiguously wrong
 * (250 ms is roughly a quarter of a beat at 120 BPM and plainly audible as a
 * late cut), small enough that every per-clip property remains perfect. Both
 * assemblies have identical duration, identical frame count, identical CFR,
 * identical codecs, and identical audio. Every existing per-clip gate scores
 * them the same. Only the audio/visual RELATIONSHIP differs -- which is
 * precisely the defect class reported as "problems start after assembly".
 *
 * NOTE: these are quarantined test artifacts under scratch/. Never ship them.
 *
 * USAGE
 *   node scripts/guards/build_assembly_fixtures.mjs
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { onsetEnvelope, recoverBeatGrid } from './assembly_forensics.mjs';

const ROOT = process.env.ZYVORIQ_ROOT || '/Users/nitinagga/Documents/zyvoriq';
const OUT = join(ROOT, 'scratch', 'gate_sensitivity', 'assembly');
const FPS = 24;

const AUDIO = join(ROOT, 'public/assets/swarm/spain_pool_lyria3_complete_song_master.mp3');

/** Visually distinct donors so every boundary produces a detectable cut. */
const DONORS = [
  join(ROOT, 'scratch/dhurandhar_megamix_replica_338s/shards/shard_00_clean.mp4'),
  join(ROOT, 'scratch/dhurandhar_megamix_replica_338s/shards/shard_02_clean.mp4'),
  join(ROOT, 'scratch/dhurandhar_megamix_replica_338s/shards/shard_04_clean.mp4'),
  join(ROOT, 'scratch/dhurandhar_megamix_replica_338s/shards/shard_06_clean.mp4'),
];

const SHOT_BEATS = 8;      // cut every 8 beats (musical phrase)
const TOTAL_SHOTS = 8;
const W = 640, H = 360;    // small raster keeps the suite fast

function ff(args, label) {
  try {
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    throw new Error(`FFMPEG FAILED (${label}): ${err.stderr || err.message}`);
  }
}

/**
 * Render one assembly from a list of cut frames.
 *
 * Every shot is rendered with `-frames:v N` rather than a duration in seconds.
 * Seconds are a float and accumulate rounding; frame counts are integers and
 * cannot drift. The rendered length is therefore exactly sum(shotFrames).
 */
function buildAssembly(name, cutFrames) {
  const parts = [];

  for (let i = 0; i < cutFrames.length - 1; i++) {
    const nFrames = cutFrames[i + 1] - cutFrames[i];
    const donor = DONORS[i % DONORS.length];
    // Offset the in-point per shot so repeated donors don't show the same footage.
    const startS = (2 + i * 3).toFixed(3);
    const out = join(OUT, `_${name}_shot${String(i).padStart(2, '0')}.mp4`);

    ff(['-ss', startS, '-i', donor,
        '-frames:v', String(nFrames),
        '-r', String(FPS), '-s', `${W}x${H}`, '-pix_fmt', 'yuv420p',
        '-c:v', 'libx264', '-crf', '20', '-an', out], `${name} shot ${i}`);
    parts.push(out);
  }

  const listPath = join(OUT, `_${name}_concat.txt`);
  writeFileSync(listPath, parts.map((p) => `file '${p}'`).join('\n') + '\n');

  const silent = join(OUT, `_${name}_silent.mp4`);
  ff(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', silent], `${name} concat`);

  const totalFrames = cutFrames[cutFrames.length - 1] - cutFrames[0];
  const durationS = (totalFrames / FPS).toFixed(6);
  const final = join(OUT, `${name}.mp4`);

  // The Lyria master is never re-timed. It is trimmed to length and muxed as-is.
  ff(['-i', silent, '-i', AUDIO,
      '-t', durationS,
      '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart', final], `${name} mux`);

  return { path: final, frames: totalFrames, duration_s: Number(durationS) };
}

function main() {
  for (const f of [AUDIO, ...DONORS]) {
    if (!existsSync(f)) throw new Error(`SOURCE MISSING: ${f}`);
  }
  mkdirSync(OUT, { recursive: true });

  console.log(`recovering beat grid from ${AUDIO}`);
  const { flux, nFrames } = onsetEnvelope(AUDIO);
  const grid = recoverBeatGrid(flux, nFrames);
  console.log(`  tempo ${grid.bpm} BPM  period ${grid.beat_period_frames} frames  phase ${grid.phase_frames}`);

  const P = grid.beat_period_frames;

  /**
   * PHASE BUG THAT THIS FIXES
   * -------------------------
   * The first version started the grid at `phase + 4*P` to skip an intro ramp,
   * but the audio is muxed from master frame 0 with no corresponding trim.
   * The video therefore began 109 frames into the grid while the audio began
   * at 0, so cuts built as "on beat" landed 17 frames off, and the positive
   * control measured 0% on-beat -- indistinguishable from the negative
   * control. A control that fails identically to the defect proves nothing.
   *
   * Since audio starts at master frame 0, assembly time IS master time, so the
   * grid must start at the recovered phase. Frames 0..phase form a short
   * lead-in before the first beat-aligned cut.
   */
  const onbeatCuts = [0];
  for (let s = 0; s <= TOTAL_SHOTS; s++) {
    onbeatCuts.push(grid.phase_frames + s * SHOT_BEATS * P);
  }

  /**
   * Displace every interior cut by +6 frames. The first and last boundaries
   * are held fixed so both assemblies have IDENTICAL total duration and frame
   * count -- otherwise a duration difference would be a confound, and a gate
   * could "detect" the offbeat version for entirely the wrong reason.
   */
  const OFFSET = 6;
  const offbeatCuts = onbeatCuts.map((c, i) =>
    (i === 0 || i === onbeatCuts.length - 1) ? c : c + OFFSET);

  const a = buildAssembly('assembly_onbeat', onbeatCuts);
  const b = buildAssembly('assembly_offbeat', offbeatCuts);

  if (a.frames !== b.frames) {
    throw new Error(
      `CONFOUND: assemblies differ in length (${a.frames} vs ${b.frames} frames). ` +
      `They must differ ONLY in cut placement.`
    );
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    audio_master: AUDIO,
    recovered_grid: { bpm: grid.bpm, period_frames: P, phase_frames: grid.phase_frames },
    shot_beats: SHOT_BEATS,
    offset_frames: OFFSET,
    offset_ms: Number(((OFFSET / FPS) * 1000).toFixed(1)),
    warning: 'QUARANTINED TEST ASSEMBLIES. Never ship.',
    assemblies: {
      onbeat: { ...a, expectation: 'HIGH on_beat_pct' },
      offbeat: { ...b, expectation: 'LOW on_beat_pct' },
    },
  };
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nbuilt 2 assemblies in ${OUT}`);
  for (const [k, v] of Object.entries(manifest.assemblies)) {
    console.log(`  ${k.padEnd(9)} ${v.frames} frames  ${v.duration_s}s  ${statSync(v.path).size}B`);
  }
  console.log(`\n  cut offset applied to offbeat: ${OFFSET} frames (${manifest.offset_ms} ms)`);
  console.log(`  both assemblies identical in duration, fps, codec, and audio.`);
}

main();
