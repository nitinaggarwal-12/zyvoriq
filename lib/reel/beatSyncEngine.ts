/**
 * 🎵 Zyvoriq Trending Audio & Beat-Matched Auto-Cutter (Tier 3)
 * Analyzes audio BPM and automatically quantizes scene cuts, kinetic emoji pops,
 * and B-roll cutaways to snap directly to musical downbeats.
 */

export interface TrendingAudioTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: "Phonk Drift" | "Cyber Synthwave" | "Lo-Fi Chill" | "Cinematic Bass" | "Upbeat Tech";
  viralRating: string; // e.g. "🔥 #2 on TikTok Charts"
  downbeatsSec: number[];
}

export const TRENDING_AUDIO_TRACKS: TrendingAudioTrack[] = [
  {
    id: "phonk_drift_01",
    title: "⚡ Midnight Phonk Velocity",
    artist: "Zyvoriq Sound Lab",
    bpm: 130,
    genre: "Phonk Drift",
    viralRating: "🔥 #1 Viral on TikTok",
    downbeatsSec: [0.0, 1.84, 3.69, 5.53, 7.38, 9.23, 11.07, 12.92, 14.76, 16.61, 18.46, 20.30, 22.15, 24.0, 25.84, 27.69, 29.53]
  },
  {
    id: "cyber_synth_02",
    title: "🌆 Neon Skyline Pulse",
    artist: "SynthWave AI",
    bpm: 120,
    genre: "Cyber Synthwave",
    viralRating: "⚡ 8.4M Uses on Reels",
    downbeatsSec: [0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0]
  },
  {
    id: "lofi_study_03",
    title: "☕ Raindrop Lo-Fi Focus",
    artist: "ChillHop Engine",
    bpm: 85,
    genre: "Lo-Fi Chill",
    viralRating: "🎧 Deep Focus ASMR",
    downbeatsSec: [0.0, 2.82, 5.64, 8.47, 11.29, 14.11, 16.94, 19.76, 22.58, 25.41, 28.23]
  }
];

/**
 * Snaps any timestamp to the nearest musical downbeat in the selected audio track.
 */
export function quantizeToNearestBeat(timestampSec: number, track: TrendingAudioTrack): number {
  if (!track.downbeatsSec.length) return timestampSec;
  let closest = track.downbeatsSec[0];
  let minDiff = Math.abs(timestampSec - closest);

  for (const beat of track.downbeatsSec) {
    const diff = Math.abs(timestampSec - beat);
    if (diff < minDiff) {
      minDiff = diff;
      closest = beat;
    }
  }
  return Math.round(closest * 100) / 100;
}

/**
 * Re-times all scene cut boundaries to match downbeats.
 */
export function beatAlignShots<T extends { editorialStartSec?: number; editorialDurationSec?: number }>(
  shots: T[],
  track: TrendingAudioTrack
): T[] {
  let runningStart = 0;
  return shots.map((shot, idx) => {
    const originalDur = shot.editorialDurationSec ?? 4.0;
    const targetEnd = runningStart + originalDur;
    const quantizedEnd = quantizeToNearestBeat(targetEnd, track);
    const duration = Math.max(1.5, Math.round((quantizedEnd - runningStart) * 10) / 10);
    const result = {
      ...shot,
      editorialStartSec: runningStart,
      editorialDurationSec: duration
    };
    runningStart += duration;
    return result;
  });
}
