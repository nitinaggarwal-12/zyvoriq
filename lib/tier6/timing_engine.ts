import { ScriptWordTiming } from "./types";

export function computePhoneticWordTimings(scriptText: string, totalDurationSec: number): ScriptWordTiming[] {
  const words = scriptText.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Phonetic syllable weighting based on vocal tract mechanics
  const weights = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9$]/g, "");
    let wt = Math.max(1, clean.length);
    
    // Vowel count proxy for jaw drop duration
    const vowels = (clean.match(/[aeiouy]/g) || []).length;
    wt += vowels * 1.5;

    // Plosives and bilabials require compression and release time
    if (/[pbtdkg]/.test(clean)) wt += 1.2;

    // Multisyllabic numbers or acronyms
    if (/\d+/.test(clean) || clean === "cto" || clean === "ed25519" || clean === "zyvoriq" || clean === "veritas") {
      wt += 3.5;
    }

    // Punctuation pauses
    if (/[.!?—]/.test(w)) wt += 2.0;

    return wt;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let currentAccumTime = 0;

  return words.map((word, i) => {
    const duration = (weights[i] / totalWeight) * totalDurationSec;
    const start = currentAccumTime;
    currentAccumTime += duration;
    return {
      word,
      start: parseFloat(start.toFixed(3)),
      end: parseFloat(currentAccumTime.toFixed(3)),
    };
  });
}
