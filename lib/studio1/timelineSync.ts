import type { ReelProductionManifest } from "@/lib/reel/types";

const clock = (value: number) => Number(value.toFixed(6));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function countWords(value: string) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function sourceCapacitySec(shot: ReelProductionManifest["shots"][number]) {
  const actual = Number(shot.asset?.actualDurationSec || 0);
  const planned = Number(shot.generationDurationSec || 0);
  return Math.max(0.25, actual || planned || Number(shot.editorialDurationSec || 0));
}

function rawNarrationSlots(manifest: ReelProductionManifest) {
  const durationSec = Number(manifest.audio.actualDurationSec || 0);
  const timings = manifest.audio.wordTimings || manifest.audio.speechMap?.words || [];
  if (!(durationSec > 0)) throw new Error("Studio1 sync requires actual narration duration");
  if (!timings.length) throw new Error("Studio1 sync requires actual narration word timings");
  if (!manifest.audio.alignmentValidation?.passed) throw new Error("Studio1 sync requires validated narration alignment");

  const counts = manifest.shots.map(shot => countWords(shot.scriptText));
  const totalScriptWords = counts.reduce((sum, value) => sum + value, 0);
  const boundaries = [0];
  let cumulativeWords = 0;

  for (let index = 0; index < manifest.shots.length - 1; index++) {
    cumulativeWords += counts[index];
    const fraction = totalScriptWords > 0 ? cumulativeWords / totalScriptWords : (index + 1) / manifest.shots.length;
    const timingIndex = clamp(Math.round(fraction * timings.length), 1, Math.max(1, timings.length - 1));
    const before = timings[timingIndex - 1];
    const after = timings[timingIndex];
    const fallback = durationSec * fraction;
    const candidate = before && after
      ? (Number(before.endSec) + Number(after.startSec)) / 2
      : before
        ? Number(before.endSec)
        : fallback;
    const minBoundary = boundaries[boundaries.length - 1] + 0.2;
    const remainingShots = manifest.shots.length - index - 1;
    const maxBoundary = durationSec - remainingShots * 0.2;
    boundaries.push(clock(clamp(Number.isFinite(candidate) ? candidate : fallback, minBoundary, Math.max(minBoundary, maxBoundary))));
  }
  boundaries.push(clock(durationSec));
  return boundaries.slice(1).map((end, index) => Math.max(0.2, clock(end - boundaries[index])));
}

function fitSlotsToClipCapacity(raw: number[], capacities: number[], durationSec: number) {
  if (capacities.reduce((sum, value) => sum + value, 0) + 0.03 < durationSec) {
    throw new Error(`Generated clips provide ${capacities.reduce((sum, value) => sum + value, 0).toFixed(2)}s but narration requires ${durationSec.toFixed(2)}s`);
  }

  const allocated = raw.map((value, index) => Math.min(value, capacities[index]));
  let remaining = durationSec - allocated.reduce((sum, value) => sum + value, 0);

  for (let pass = 0; pass < 8 && remaining > 0.0005; pass++) {
    const eligible = allocated.map((value, index) => ({ index, slack: capacities[index] - value, weight: Math.max(raw[index], 0.2) })).filter(item => item.slack > 0.0005);
    if (!eligible.length) break;
    const weightTotal = eligible.reduce((sum, item) => sum + item.weight, 0);
    let distributed = 0;
    for (const item of eligible) {
      const share = remaining * (item.weight / weightTotal);
      const add = Math.min(item.slack, share);
      allocated[item.index] += add;
      distributed += add;
    }
    if (distributed <= 0.0005) break;
    remaining -= distributed;
  }

  if (remaining > 0.02) throw new Error(`Unable to fit ${remaining.toFixed(2)}s of narration into generated clip capacity`);

  const rounded = allocated.map(clock);
  const delta = clock(durationSec - rounded.reduce((sum, value) => sum + value, 0));
  if (Math.abs(delta) > 0.000001) {
    for (let index = rounded.length - 1; index >= 0; index--) {
      const next = rounded[index] + delta;
      if (next >= 0.2 && next <= capacities[index] + 0.000001) {
        rounded[index] = clock(next);
        break;
      }
    }
  }
  return rounded;
}

export function syncStudio1TimelineToNarration(manifest: ReelProductionManifest) {
  if (!manifest.shots.length) throw new Error("Studio1 sync requires at least one scene");
  if (manifest.shots.some(shot => !shot.asset?.videoUrl)) throw new Error("Studio1 sync requires every scene to have a generated clip");

  const durationSec = Number(manifest.audio.actualDurationSec || 0);
  const raw = rawNarrationSlots(manifest);
  const capacities = manifest.shots.map(sourceCapacitySec);
  const slots = fitSlotsToClipCapacity(raw, capacities, durationSec);

  let cursor = 0;
  manifest.shots.forEach((shot, index) => {
    const slot = slots[index];
    shot.order = index + 1;
    shot.editorialStartSec = clock(cursor);
    shot.editorialDurationSec = slot;
    shot.trimInSec = 0;
    shot.trimOutSec = slot;
    cursor = clock(cursor + slot);
  });
  manifest.plannedDurationSec = clock(durationSec);

  if (manifest.continuity?.boundaries) {
    manifest.continuity.boundaries.forEach(boundary => {
      const from = manifest.shots.find(shot => shot.id === boundary.fromShotId);
      const to = manifest.shots.find(shot => shot.id === boundary.toShotId);
      if (from) boundary.fromTimeSec = clock(from.editorialStartSec + from.editorialDurationSec);
      if (to) boundary.toTimeSec = to.editorialStartSec;
    });
  }

  const presenterTrack = manifest.continuity?.performanceTracks?.find(track => track.characterId === "character_presenter");
  if (presenterTrack) {
    presenterTrack.cues = manifest.shots.filter(shot => shot.continuityIn.characterId === "character_presenter").map(shot => ({
      startSec: shot.editorialStartSec,
      endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
      emotion: shot.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
      gaze: "camera" as const,
      gesture: shot.continuityOut.action,
      speakingEnergy: shot.continuityIn.emotion?.intensity || 0.5,
    }));
  }

  if (manifest.musicPlan?.sections?.length) manifest.musicPlan.sections[manifest.musicPlan.sections.length - 1].endSec = clock(durationSec);
  (manifest as any).studio1 = {
    ...((manifest as any).studio1 || {}),
    timelineSync: {
      version: 1,
      source: "actual-narration-word-timings",
      narrationDurationSec: clock(durationSec),
      sceneDurationsSec: slots,
      syncedAt: new Date().toISOString(),
    },
  };

  return { durationSec: clock(durationSec), sceneDurationsSec: slots };
}
