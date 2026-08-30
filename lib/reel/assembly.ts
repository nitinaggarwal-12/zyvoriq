import { ReelProductionManifest, ReelShot } from "./types";

export interface AssemblyPlan {
  inputs: string[];
  filterComplex: string;
  videoMap: string;
  expectedDurationSec: number;
}

function requireGeneratedShot(shot: ReelShot) {
  if (!shot.asset?.videoUrl) throw new Error(`Missing generated video asset for ${shot.id}`);
  if (shot.status !== "GENERATED" && shot.status !== "PASSED") {
    throw new Error(`${shot.id} is ${shot.status}; only generated/audited shots can be assembled`);
  }
  if (shot.trimOutSec <= shot.trimInSec) throw new Error(`Invalid trim range for ${shot.id}`);
  if (shot.asset.actualDurationSec && shot.trimOutSec > shot.asset.actualDurationSec + 0.05) {
    throw new Error(`${shot.id} trimOut (${shot.trimOutSec}s) exceeds probed asset duration (${shot.asset.actualDurationSec}s)`);
  }
}

/**
 * Builds a video-only FFmpeg filter graph from the canonical manifest.
 * Audio is deliberately mixed separately against the actual master narration/music
 * clock; this function never guesses audio duration or timestamps.
 */
export function buildAssemblyPlan(manifest: ReelProductionManifest): AssemblyPlan {
  if (!manifest.shots.length) throw new Error("Cannot assemble an empty reel");
  manifest.shots.forEach(requireGeneratedShot);

  const inputs = manifest.shots.map(s => s.asset!.videoUrl);
  const filters: string[] = [];

  manifest.shots.forEach((shot, i) => {
    filters.push(
      `[${i}:v]trim=start=${shot.trimInSec}:end=${shot.trimOutSec},` +
      `setpts=PTS-STARTPTS,` +
      `scale=1080:1920:force_original_aspect_ratio=increase,` +
      `crop=1080:1920,setsar=1,fps=30[v${i}]`
    );
  });

  let current = "v0";
  let currentDuration = manifest.shots[0].trimOutSec - manifest.shots[0].trimInSec;

  for (let i = 1; i < manifest.shots.length; i++) {
    const previous = manifest.shots[i - 1];
    const nextDuration = manifest.shots[i].trimOutSec - manifest.shots[i].trimInSec;
    const transition = previous.transitionOut;
    const out = `vx${i}`;

    // Most short-form edits should remain exact hard/match/action/jump cuts.
    // Motion semantics are determined before render; FFmpeg does not invent continuity.
    if (transition.durationSec <= 0 || ["hard-cut", "match-cut", "cut-on-action", "jump-cut"].includes(transition.type)) {
      filters.push(`[${current}][v${i}]concat=n=2:v=1:a=0[${out}]`);
      currentDuration += nextDuration;
    } else {
      const d = Math.min(transition.durationSec, currentDuration / 2, nextDuration / 2);
      const offset = Math.max(0, currentDuration - d);
      const ffTransition = transition.type === "whip" ? "smoothleft" : transition.type === "dip" ? "fadeblack" : "fade";
      filters.push(`[${current}][v${i}]xfade=transition=${ffTransition}:duration=${d.toFixed(3)}:offset=${offset.toFixed(3)}[${out}]`);
      currentDuration += nextDuration - d;
    }
    current = out;
  }

  return {
    inputs,
    filterComplex: filters.join(";"),
    videoMap: `[${current}]`,
    expectedDurationSec: Number(currentDuration.toFixed(3))
  };
}

export function buildFfmpegArgs(manifest: ReelProductionManifest, outputPath: string): string[] {
  const plan = buildAssemblyPlan(manifest);
  const args: string[] = ["-y"];
  for (const input of plan.inputs) args.push("-i", input);
  args.push(
    "-filter_complex", plan.filterComplex,
    "-map", plan.videoMap,
    "-an",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputPath
  );
  return args;
}
