import type { ReelProductionManifest, WordTiming } from "@/lib/reel/types";

const clock = (value: number) => Number(value.toFixed(6));
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function normalizeWords(value: string) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function sourceCapacitySec(shot: ReelProductionManifest["shots"][number]) {
  const actual = Number(shot.asset?.actualDurationSec || 0);
  const planned = Number(shot.generationDurationSec || 0);
  return Math.max(0.25, actual || planned || Number(shot.editorialDurationSec || 0));
}

type ActualToken = { token: string; timingIndex: number };

function actualTokensFromTimings(timings: WordTiming[]): ActualToken[] {
  const tokens: ActualToken[] = [];
  timings.forEach((timing, timingIndex) => {
    normalizeWords(timing.word).forEach(token => tokens.push({ token, timingIndex }));
  });
  return tokens;
}

function alignExpectedToActual(expected: string[], actual: ActualToken[]) {
  const rows = expected.length + 1;
  const cols = actual.length + 1;
  const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const substitution = dp[i - 1][j - 1] + (expected[i - 1] === actual[j - 1].token ? 0 : 1);
      dp[i][j] = Math.min(substitution, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  const mapping: Array<number | null> = Array(expected.length).fill(null);
  let exactMatches = 0;
  let i = expected.length;
  let j = actual.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const cost = expected[i - 1] === actual[j - 1].token ? 0 : 1;
      if (dp[i][j] === dp[i - 1][j - 1] + cost) {
        mapping[i - 1] = j - 1;
        if (cost === 0) exactMatches += 1;
        i -= 1;
        j -= 1;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      i -= 1;
      continue;
    }
    if (j > 0) {
      j -= 1;
      continue;
    }
    break;
  }

  return {
    mapping,
    exactMatchCoverage: expected.length ? exactMatches / expected.length : 0,
  };
}

function mappedActualIndex(mapping: Array<number | null>, expectedIndex: number, direction: -1 | 1) {
  for (let index = expectedIndex; index >= 0 && index < mapping.length; index += direction) {
    const mapped = mapping[index];
    if (mapped !== null) return mapped;
  }
  return null;
}

function narrationSlots(manifest: ReelProductionManifest) {
  const durationSec = Number(manifest.audio.actualDurationSec || 0);
  const timings = manifest.audio.wordTimings || manifest.audio.speechMap?.words || [];
  if (!(durationSec > 0)) throw new Error("Studio1 sync requires actual narration duration");
  if (!timings.length) throw new Error("Studio1 sync requires actual narration word timings");
  if (!manifest.audio.alignmentValidation?.passed) throw new Error("Studio1 sync requires validated narration alignment");

  const sceneTokens = manifest.shots.map(shot => normalizeWords(shot.scriptText));
  const expected = sceneTokens.flat();
  if (!expected.length) throw new Error("Studio1 sync requires spoken scene text");

  const actual = actualTokensFromTimings(timings);
  if (!actual.length) throw new Error("Studio1 sync could not normalize narration word timings");

  const alignment = alignExpectedToActual(expected, actual);
  if (alignment.exactMatchCoverage < 0.85) {
    throw new Error(`Studio1 scene-to-narration alignment coverage ${(alignment.exactMatchCoverage * 100).toFixed(1)}% is below 85%`);
  }

  const boundaries = [0];
  let cumulativeExpected = 0;
  for (let sceneIndex = 0; sceneIndex < manifest.shots.length - 1; sceneIndex++) {
    cumulativeExpected += sceneTokens[sceneIndex].length;
    const previousActual = mappedActualIndex(alignment.mapping, cumulativeExpected - 1, -1);
    const nextActual = mappedActualIndex(alignment.mapping, cumulativeExpected, 1);
    const fallback = durationSec * (cumulativeExpected / expected.length);

    let candidate = fallback;
    if (previousActual !== null && nextActual !== null) {
      const previousTiming = timings[actual[previousActual].timingIndex];
      const nextTiming = timings[actual[nextActual].timingIndex];
      if (previousTiming && nextTiming) {
        candidate = actual[previousActual].timingIndex === actual[nextActual].timingIndex
          ? Number(previousTiming.endSec)
          : (Number(previousTiming.endSec) + Number(nextTiming.startSec)) / 2;
      }
    } else if (previousActual !== null) {
      candidate = Number(timings[actual[previousActual].timingIndex]?.endSec ?? fallback);
    } else if (nextActual !== null) {
      candidate = Number(timings[actual[nextActual].timingIndex]?.startSec ?? fallback);
    }

    const minBoundary = boundaries[boundaries.length - 1] + 0.2;
    const remainingShots = manifest.shots.length - sceneIndex - 1;
    const maxBoundary = durationSec - remainingShots * 0.2;
    boundaries.push(clock(clamp(Number.isFinite(candidate) ? candidate : fallback, minBoundary, Math.max(minBoundary, maxBoundary))));
  }
  boundaries.push(clock(durationSec));

  return {
    slots: boundaries.slice(1).map((end, index) => Math.max(0.2, clock(end - boundaries[index]))),
    boundaries,
    alignmentCoverage: clock(alignment.exactMatchCoverage),
  };
}

function assertSceneCapacity(slots: number[], capacities: number[]) {
  const failures = slots
    .map((required, index) => ({ index, required, capacity: capacities[index], deficit: required - capacities[index] }))
    .filter(item => item.deficit > 0.01);
  if (!failures.length) return;

  const summary = failures
    .map(item => `scene ${item.index + 1} requires ${item.required.toFixed(2)}s but clip provides ${item.capacity.toFixed(2)}s`)
    .join("; ");
  throw new Error(`Studio1 will not shift narration time into other scenes: ${summary}. Regenerate only the short scene(s).`);
}

export function syncStudio1TimelineToNarration(manifest: ReelProductionManifest) {
  if (!manifest.shots.length) throw new Error("Studio1 sync requires at least one scene");
  if (manifest.shots.some(shot => !shot.asset?.videoUrl)) throw new Error("Studio1 sync requires every scene to have a generated clip");

  const durationSec = Number(manifest.audio.actualDurationSec || 0);
  const { slots, boundaries, alignmentCoverage } = narrationSlots(manifest);
  const capacities = manifest.shots.map(sourceCapacitySec);
  assertSceneCapacity(slots, capacities);

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
      version: 2,
      source: "scene-script-aligned-to-actual-word-timings",
      capacityPolicy: "no-cross-scene-redistribution",
      narrationDurationSec: clock(durationSec),
      sceneDurationsSec: slots,
      boundaryTimesSec: boundaries,
      sourceCapacitiesSec: capacities.map(clock),
      alignmentCoverage,
      syncedAt: new Date().toISOString(),
    },
  };

  return { durationSec: clock(durationSec), sceneDurationsSec: slots, boundaryTimesSec: boundaries, alignmentCoverage };
}
