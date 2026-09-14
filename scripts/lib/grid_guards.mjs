// Deterministic quality measures over a shot grid.
//
// These live outside yt_pipeline.mjs for one reason: a gate nobody has ever
// watched fail is not a gate. Every check in this file can be pointed at a
// recorded bad grid by scripts/yt_grid_fixture.mjs and observed rejecting it.
// The pipeline decides what to DO about a finding; this file only measures.

// Seconds of silence tolerated inside a single shot's vocal directive.
//
// WhisperX splits one sung sentence into fragments wherever the singer breathes
// ("Golden light on the terracotta" / "tiles catch your eye" / "and it's taking
// me miles"), so counting lines measures the transcriber, not the performance.
// Three contiguous fragments are one singable phrase; two lines separated by
// four seconds of instrumental are not. The gap is a property of the song.
export const PHRASE_GAP_MAX = 1.2;

// Seconds of audible lyric a shot may carry while still being prompted as an
// instrumental (mouth closed) shot. Matches the audit's own grace for
// SILENT_MOUTH_OVER_LYRICS so the pre-flight and the post-flight agree.
export const SILENT_MOUTH_BUDGET = 0.5;

/**
 * @param {Array<{index:number, durationSec:number, lyric?:string,
 *                lyricParts?:Array<{text:string,start:number,end:number}>}>} shotPlan
 * @returns {{disjoint:Array, reused:Array, worstGap:number}}
 */
export function checkLyricFocus(shotPlan, { phraseGapMax = PHRASE_GAP_MAX, silentMouthBudget = SILENT_MOUTH_BUDGET } = {}) {
  const disjoint = [];
  let worstGap = 0;

  for (const s of shotPlan) {
    const parts = s.lyricParts || [];
    let worst = 0, at = null;
    for (let i = 1; i < parts.length; i++) {
      const gap = parts[i].start - parts[i - 1].end;
      if (gap > worst) { worst = gap; at = parts[i - 1].end; }
    }
    if (worst > worstGap) worstGap = worst;
    if (worst > phraseGapMax) disjoint.push({ index: s.index, durationSec: s.durationSec, gap: worst, at, lyric: s.lyric || "" });
  }

  // LINE REUSE. Each lyric line belongs to one moment on the master clock. If
  // the same line is handed to two shots, at least one of them is singing words
  // the audience is not hearing. Run #3 did exactly this - its third shot
  // replayed the first shot's opening line - and comparing whole directives as
  // strings MISSED IT, because shot 3's directive was that line plus another.
  // Reuse is therefore compared per line, keyed on the line's own start time so
  // a genuinely repeated chorus later in the song is not mistaken for reuse.
  const owner = new Map();
  const reused = [];
  for (const s of shotPlan) {
    for (const p of s.lyricParts || []) {
      const key = `${p.start.toFixed(2)}|${String(p.text).trim().toLowerCase()}`;
      if (owner.has(key)) reused.push({ first: owner.get(key), second: s.index, text: p.text });
      else owner.set(key, s.index);
    }
  }

  // SILENT MOUTH OVER WORDS. The shot's `singing` flag decides whether the Veo
  // prompt asks for a sung performance at all, and it is set by a fraction:
  // sung seconds >= 40% of the shot. A long span that clips the tail of a
  // phrase and then runs into an instrumental break lands under that threshold
  // while still carrying audible words, so the model is told to keep the mouth
  // shut over lyrics the audience can hear.
  //
  // The gap measure above is structurally blind to this: a shot holding exactly
  // one lyric line has no intra-shot gap at all. Run #4's grid produced
  // "shot 2 3.447-8.888s instrumental (35% sung)" with a lyric attached and the
  // gap check reported a clean 0.66s. Measure the seconds, not the fraction.
  const mismatched = [];
  for (const s of shotPlan) {
    const parts = s.lyricParts || [];
    if (!parts.length || s.singing !== false) continue;
    const sungSec = typeof s.sungFraction === "number" && typeof s.durationSec === "number"
      ? s.sungFraction * s.durationSec
      : parts.reduce((a, p) => a + (p.end - p.start), 0);
    if (sungSec > silentMouthBudget) {
      mismatched.push({ index: s.index, durationSec: s.durationSec, sungSec, lyric: s.lyric || "" });
    }
  }

  return { disjoint, reused, mismatched, worstGap };
}

/** Human-readable reasons, empty when the grid is clean. */
export function describeLyricFocus({ disjoint, reused, mismatched = [] }, phraseGapMax = PHRASE_GAP_MAX, silentMouthBudget = SILENT_MOUTH_BUDGET) {
  const reasons = [];
  if (disjoint.length) {
    reasons.push(
      `${disjoint.length} shot(s) carry a disjoint vocal directive: ` +
      disjoint.map((x) =>
        `shot ${x.index} (${x.durationSec}s) stitches lyrics across a ${x.gap.toFixed(2)}s silence at ` +
        `master t=${x.at.toFixed(2)}s: "${x.lyric.slice(0, 70)}"`).join("; ") +
      `. A shot spanning an instrumental break cannot be sung continuously, so the mouth will be wrong ` +
      `for part of it. Limit is ${phraseGapMax}s.`
    );
  }
  if (reused.length) {
    reasons.push(
      `${reused.length} lyric line(s) are assigned to more than one shot: ` +
      reused.map((r) => `"${String(r.text).slice(0, 50)}" in shots ${r.first} and ${r.second}`).join("; ") +
      `. The same words cannot be sung at two different points on the master clock.`
    );
  }
  if (mismatched.length) {
    reasons.push(
      `${mismatched.length} shot(s) are planned as instrumental while lyrics play inside them: ` +
      mismatched.map((x) =>
        `shot ${x.index} (${x.durationSec}s) carries ${x.sungSec.toFixed(2)}s of audible lyric ` +
        `"${String(x.lyric).slice(0, 50)}" but is below the 40% singing threshold`).join("; ") +
      `. Those shots would be prompted mouth-closed over words the audience can hear. ` +
      `Budget is ${silentMouthBudget}s.`
    );
  }
  return reasons;
}
