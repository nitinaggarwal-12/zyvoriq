const CLOCK_DIGITS = 6;
const MIN_SCENE_SEC = 0.12;
const FPS = 30;
const MAX_BOUNDARY_DRIFT_MS = 50;
const MAX_LOCAL_EXTENSION_RATIO = 1.20;
const MAX_LOCAL_EXTENSION_SEC = 0.75;
const MAX_RETIME_FACTOR = 1.10;

const NUMBER_WORDS = new Map(Object.entries({
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}));

const clock = value => Number(Number(value).toFixed(CLOCK_DIGITS));

function rawTokens(value, metadataFactory = () => ({})) {
  const pieces = String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return pieces.map((token, index) => ({ token, ...metadataFactory(index) }));
}

function canonicalize(tokens, sameGroup = () => true) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const item = { ...tokens[i] };
    let word = item.token;
    if (word === "can't") word = "cannot";
    else if (word === "won't" || word === "wont") word = "willnot";
    else if (word === "mustn't") word = "mustnot";

    if (NUMBER_WORDS.has(word)) {
      let n = NUMBER_WORDS.get(word);
      const next = tokens[i + 1];
      if (n >= 20 && n % 10 === 0 && next && sameGroup(item, next) && NUMBER_WORDS.has(next.token)) {
        const nextNumber = NUMBER_WORDS.get(next.token);
        if (nextNumber > 0 && nextNumber < 10) {
          n += nextNumber;
          i += 1;
        }
      }
      out.push({ ...item, token: String(n) });
      const percent = tokens[i + 1];
      if (percent && sameGroup(item, percent) && percent.token === "percent") i += 1;
    } else {
      out.push({ ...item, token: word });
    }
  }
  return out;
}

function scriptTokens(shots) {
  const raw = [];
  shots.forEach((shot, shotIndex) => {
    raw.push(...rawTokens(shot.scriptText, () => ({ shotIndex, shotId: shot.id })));
  });
  return canonicalize(raw, (a, b) => a.shotIndex === b.shotIndex);
}

function timingTokens(timings) {
  const raw = [];
  timings.forEach((timing, timingIndex) => {
    raw.push(...rawTokens(timing.word, () => ({ timingIndex })));
  });
  return canonicalize(raw, () => true);
}

function alignTokens(script, transcript) {
  const n = script.length;
  const m = transcript.length;
  if (!n || !m) throw new Error("Studio1 exact sync requires comparable script and transcript words");
  if (n * m > 4_000_000) throw new Error("Studio1 exact sync transcript is too large for deterministic alignment");

  const costs = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  const directions = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { costs[i][0] = i; directions[i][0] = 2; }
  for (let j = 1; j <= m; j++) { costs[0][j] = j; directions[0][j] = 3; }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const exact = script[i - 1].token === transcript[j - 1].token;
      const diagonal = costs[i - 1][j - 1] + (exact ? 0 : 1);
      const deletion = costs[i - 1][j] + 1;
      const insertion = costs[i][j - 1] + 1;
      if (diagonal <= deletion && diagonal <= insertion) {
        costs[i][j] = diagonal;
        directions[i][j] = 1;
      } else if (deletion <= insertion) {
        costs[i][j] = deletion;
        directions[i][j] = 2;
      } else {
        costs[i][j] = insertion;
        directions[i][j] = 3;
      }
    }
  }

  const mapping = Array(n).fill(null);
  const exact = Array(n).fill(false);
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const direction = directions[i][j];
    if (i > 0 && j > 0 && direction === 1) {
      mapping[i - 1] = j - 1;
      exact[i - 1] = script[i - 1].token === transcript[j - 1].token;
      i -= 1;
      j -= 1;
    } else if (i > 0 && (direction === 2 || j === 0)) {
      i -= 1;
    } else if (j > 0) {
      j -= 1;
    } else {
      throw new Error("Studio1 exact sync alignment backtrace failed");
    }
  }
  return { mapping, exact, editDistance: Number(costs[n][m]) };
}

function chooseGenerationDuration(targetSec, shotId) {
  // Smallest bucket that covers the slot within the same local-adaptation
  // limits enforced below, so we stop over-generating and front-trimming
  // clips mid-action.
  for (const bucket of [4, 6, 8]) {
    if (targetSec <= bucket) return bucket;
    const deficitSec = targetSec - bucket;
    if (deficitSec <= MAX_LOCAL_EXTENSION_SEC && targetSec / bucket <= MAX_LOCAL_EXTENSION_RATIO) return bucket;
  }
  throw new Error(`Studio1 scene ${shotId} requires ${targetSec.toFixed(2)}s of narration; split the scene because Veo source clips are limited to 8s`);
}

function sceneAlignmentStats(shots, script, mapping, exact) {
  return shots.map((shot, shotIndex) => {
    const indexes = [];
    for (let index = 0; index < script.length; index++) if (script[index].shotIndex === shotIndex) indexes.push(index);
    if (!indexes.length) throw new Error(`Studio1 scene ${shot.id} has no spoken script; exact narration sync requires every visual scene to own a narration beat`);
    const mapped = indexes.filter(index => mapping[index] !== null);
    const exactMatches = indexes.filter(index => exact[index]).length;
    const coverage = mapped.length / indexes.length;
    const exactRatio = exactMatches / indexes.length;
    const passed = indexes.length < 3
      ? mapped.length >= 1 && exactMatches >= 1
      : coverage >= 0.75 && exactRatio >= 0.55;
    if (!passed) {
      throw new Error(`Studio1 scene ${shot.id} cannot be aligned confidently to narration (coverage ${(coverage * 100).toFixed(0)}%, exact ${(exactRatio * 100).toFixed(0)}%)`);
    }
    return {
      shotId: shot.id,
      shotIndex,
      scriptStartIndex: indexes[0],
      scriptEndIndex: indexes[indexes.length - 1],
      scriptWordCount: indexes.length,
      mappedWordCount: mapped.length,
      exactWordCount: exactMatches,
      coverage: clock(coverage),
      exactRatio: clock(exactRatio),
    };
  });
}

function computeBoundaries(shots, timings, script, transcript, mapping, stats, durationSec) {
  const boundaries = [0];
  const anchors = [];
  for (let shotIndex = 0; shotIndex < shots.length - 1; shotIndex++) {
    const currentEndScript = stats[shotIndex].scriptEndIndex;
    const nextStartScript = stats[shotIndex + 1].scriptStartIndex;
    let beforeTranscriptToken = null;
    let afterTranscriptToken = null;
    for (let index = currentEndScript; index >= 0; index--) {
      if (mapping[index] !== null) { beforeTranscriptToken = mapping[index]; break; }
    }
    for (let index = nextStartScript; index < mapping.length; index++) {
      if (mapping[index] !== null) { afterTranscriptToken = mapping[index]; break; }
    }
    if (beforeTranscriptToken === null || afterTranscriptToken === null) {
      throw new Error(`Studio1 boundary ${shots[shotIndex].id} → ${shots[shotIndex + 1].id} has no reliable transcript anchor`);
    }
    const beforeTimingIndex = transcript[beforeTranscriptToken].timingIndex;
    const afterTimingIndex = transcript[afterTranscriptToken].timingIndex;
    if (afterTimingIndex < beforeTimingIndex) throw new Error("Studio1 transcript alignment is not monotonic");
    const before = timings[beforeTimingIndex];
    const after = timings[afterTimingIndex];
    const boundarySec = beforeTimingIndex === afterTimingIndex
      ? Number(before.endSec)
      : (Number(before.endSec) + Number(after.startSec)) / 2;
    const previous = boundaries[boundaries.length - 1];
    const remainingScenes = shots.length - shotIndex - 1;
    if (!(boundarySec > previous + MIN_SCENE_SEC)) {
      throw new Error(`Studio1 scene ${shots[shotIndex].id} is shorter than ${MIN_SCENE_SEC}s after transcript alignment`);
    }
    if (!(durationSec - boundarySec >= remainingScenes * MIN_SCENE_SEC)) {
      throw new Error(`Studio1 transcript boundary leaves insufficient time for the remaining scenes after ${shots[shotIndex].id}`);
    }
    boundaries.push(clock(boundarySec));
    anchors.push({
      fromShotId: shots[shotIndex].id,
      toShotId: shots[shotIndex + 1].id,
      beforeWord: String(before.word || ""),
      afterWord: String(after.word || ""),
      beforeTimingIndex,
      afterTimingIndex,
      boundarySec: clock(boundarySec),
    });
  }
  boundaries.push(clock(durationSec));
  return { boundaries, anchors };
}

export function computeStudio1NarrationTimeline({ shots, timings, durationSec }) {
  const duration = Number(durationSec || 0);
  if (!(duration > 0)) throw new Error("Studio1 exact sync requires actual narration duration");
  if (!Array.isArray(shots) || !shots.length) throw new Error("Studio1 exact sync requires at least one scene");
  if (!Array.isArray(timings) || !timings.length) throw new Error("Studio1 exact sync requires actual narration word timings");

  const script = scriptTokens(shots);
  const transcript = timingTokens(timings);
  const aligned = alignTokens(script, transcript);
  const globalExactRatio = aligned.exact.filter(Boolean).length / script.length;
  if (globalExactRatio < 0.70) {
    throw new Error(`Studio1 scene scripts diverge too far from the validated narration for exact sync (${(globalExactRatio * 100).toFixed(0)}% exact)`);
  }
  const stats = sceneAlignmentStats(shots, script, aligned.mapping, aligned.exact);
  const { boundaries, anchors } = computeBoundaries(shots, timings, script, transcript, aligned.mapping, stats, duration);
  const sceneDurationsSec = boundaries.slice(1).map((end, index) => clock(end - boundaries[index]));
  const total = clock(sceneDurationsSec.reduce((sum, value) => sum + value, 0));
  if (Math.abs(total - duration) > 0.002) throw new Error(`Studio1 exact timeline total ${total}s does not match narration ${duration}s`);
  return {
    version: 2,
    source: "transcript-scene-alignment",
    narrationDurationSec: clock(duration),
    sceneDurationsSec,
    boundariesSec: boundaries,
    boundaryAnchors: anchors,
    sceneAlignment: stats,
    globalExactRatio: clock(globalExactRatio),
    editDistance: aligned.editDistance,
  };
}

function updateDependentTiming(manifest) {
  if (manifest.continuity?.boundaries) {
    manifest.continuity.boundaries.forEach(boundary => {
      const from = manifest.shots.find(shot => shot.id === boundary.fromShotId);
      const to = manifest.shots.find(shot => shot.id === boundary.toShotId);
      if (from) boundary.fromTimeSec = clock(Number(from.editorialStartSec) + Number(from.editorialDurationSec));
      if (to) boundary.toTimeSec = clock(Number(to.editorialStartSec));
    });
  }
  const presenterTrack = manifest.continuity?.performanceTracks?.find(track => track.characterId === "character_presenter");
  if (presenterTrack) {
    presenterTrack.cues = manifest.shots
      .filter(shot => shot.continuityIn?.characterId === "character_presenter")
      .map(shot => ({
        startSec: clock(shot.editorialStartSec),
        endSec: clock(Number(shot.editorialStartSec) + Number(shot.editorialDurationSec)),
        emotion: shot.continuityIn?.emotion || { emotion: "engaged", intensity: 0.5 },
        gaze: "camera",
        gesture: shot.continuityOut?.action,
        speakingEnergy: shot.continuityIn?.emotion?.intensity || 0.5,
      }));
  }
  if (manifest.captions?.timingSource === "draft") {
    manifest.captions.cues = manifest.shots
      .filter(shot => String(shot.scriptText || "").trim())
      .map((shot, index) => ({
        id: `caption_draft_${String(index + 1).padStart(2, "0")}`,
        startSec: clock(shot.editorialStartSec),
        endSec: clock(Number(shot.editorialStartSec) + Number(shot.editorialDurationSec)),
        text: String(shot.scriptText || "").trim(),
        wordIds: [],
        lines: [String(shot.scriptText || "").trim()],
        position: "lower-third",
      }));
  }
  if (manifest.musicPlan?.sections?.length) manifest.musicPlan.sections[manifest.musicPlan.sections.length - 1].endSec = clock(manifest.audio.actualDurationSec);
}

function sourceCapacitySec(shot) {
  const actual = Number(shot.asset?.actualDurationSec || 0);
  const planned = Number(shot.generationDurationSec || 0);
  return Math.max(0, actual || planned || 0);
}

export function synchronizeStudio1ManifestTimeline(manifest, { mode = "render", resetAssets = false } = {}) {
  if (!manifest?.audio?.alignmentValidation?.passed) throw new Error("Studio1 exact sync requires validated narration alignment");
  const timings = manifest.audio.wordTimings || manifest.audio.speechMap?.words || [];
  const timeline = computeStudio1NarrationTimeline({ shots: manifest.shots, timings, durationSec: manifest.audio.actualDurationSec });
  const adaptations = [];
  let cursor = 0;

  manifest.shots.forEach((shot, index) => {
    const targetSec = timeline.sceneDurationsSec[index];
    shot.order = index + 1;
    shot.editorialStartSec = clock(cursor);
    shot.editorialDurationSec = targetSec;
    shot.generationDurationSec = chooseGenerationDuration(targetSec, shot.id);
    shot.trimInSec = 0;

    if (mode === "plan") {
      if (resetAssets) {
        delete shot.asset;
        shot.status = "PLANNED";
        if (shot.continuityIn) delete shot.continuityIn.referenceFrameUrl;
      }
      shot.trimOutSec = targetSec;
      adaptations.push({ shotId: shot.id, targetSec, sourceSec: null, mode: "planned-source", retimeFactor: 1, padSec: 0 });
    } else {
      if (!shot.asset?.videoUrl) throw new Error(`Studio1 exact render requires generated clip ${shot.id}`);
      const sourceSec = sourceCapacitySec(shot);
      if (!(sourceSec > 0)) throw new Error(`Studio1 clip ${shot.id} has no trustworthy source duration`);
      const usableSec = Math.min(sourceSec, targetSec);
      const deficitSec = Math.max(0, targetSec - usableSec);
      const extensionRatio = targetSec / usableSec;
      if (deficitSec > 0.03 && (deficitSec > MAX_LOCAL_EXTENSION_SEC || extensionRatio > MAX_LOCAL_EXTENSION_RATIO)) {
        throw new Error(`Studio1 scene ${shot.id} needs selective regeneration: narration slot ${targetSec.toFixed(2)}s exceeds source ${sourceSec.toFixed(2)}s by ${deficitSec.toFixed(2)}s`);
      }
      const retimeFactor = deficitSec > 0.003 ? Math.min(MAX_RETIME_FACTOR, extensionRatio) : 1;
      const retimedSec = usableSec * retimeFactor;
      const padSec = Math.max(0, targetSec - retimedSec);
      shot.trimOutSec = clock(usableSec);
      adaptations.push({
        shotId: shot.id,
        targetSec,
        sourceSec: clock(sourceSec),
        usableSec: clock(usableSec),
        deficitSec: clock(deficitSec),
        mode: deficitSec <= 0.003 ? "trim" : padSec <= 0.003 ? "local-retime" : "local-retime-plus-freeze",
        retimeFactor: clock(retimeFactor),
        padSec: clock(padSec),
      });
    }
    cursor = clock(cursor + targetSec);
  });

  manifest.plannedDurationSec = timeline.narrationDurationSec;
  updateDependentTiming(manifest);
  manifest.studio1 = {
    ...(manifest.studio1 || {}),
    timelineSync: {
      ...timeline,
      adaptations,
      frameRate: FPS,
      maxAllowedBoundaryDriftMs: MAX_BOUNDARY_DRIFT_MS,
      syncedAt: new Date().toISOString(),
    },
  };
  return manifest.studio1.timelineSync;
}

export function buildStudio1RenderPlan(manifest) {
  const sync = manifest?.studio1?.timelineSync;
  if (!sync || Number(sync.version) < 2) throw new Error("Studio1 exact render requires timelineSync version 2");
  const durationSec = Number(manifest.audio?.actualDurationSec || 0);
  if (!(durationSec > 0)) throw new Error("Studio1 exact render requires narration duration");
  let previousFrame = 0;
  const scenes = manifest.shots.map((shot, index) => {
    const expectedStartSec = Number(shot.editorialStartSec);
    const expectedEndSec = expectedStartSec + Number(shot.editorialDurationSec);
    const endFrame = index === manifest.shots.length - 1 ? Math.round(durationSec * FPS) : Math.round(expectedEndSec * FPS);
    if (endFrame <= previousFrame) throw new Error(`Studio1 scene ${shot.id} collapses below one video frame`);
    const frameCount = endFrame - previousFrame;
    const renderedStartSec = previousFrame / FPS;
    const renderedEndSec = endFrame / FPS;
    const boundaryDriftMs = index === manifest.shots.length - 1 ? 0 : Math.abs(renderedEndSec - expectedEndSec) * 1000;
    if (boundaryDriftMs > MAX_BOUNDARY_DRIFT_MS) {
      throw new Error(`Studio1 boundary after ${shot.id} would drift ${boundaryDriftMs.toFixed(1)}ms at ${FPS}fps`);
    }
    const sourceSec = Number(shot.trimOutSec) - Number(shot.trimInSec || 0);
    const targetSec = Number(shot.editorialDurationSec);
    if (!(sourceSec > 0) || !(targetSec > 0)) throw new Error(`Studio1 scene ${shot.id} has invalid source/target duration`);
    const extensionRatio = targetSec / sourceSec;
    if (extensionRatio > MAX_LOCAL_EXTENSION_RATIO + 0.0001 || targetSec - sourceSec > MAX_LOCAL_EXTENSION_SEC + 0.0001) {
      throw new Error(`Studio1 scene ${shot.id} exceeds safe local adaptation limits`);
    }
    const retimeFactor = targetSec > sourceSec + 0.003 ? Math.min(MAX_RETIME_FACTOR, extensionRatio) : 1;
    const padSec = Math.max(0, targetSec - sourceSec * retimeFactor);
    const result = {
      shotId: shot.id,
      inputIndex: index,
      frameCount,
      expectedStartSec: clock(expectedStartSec),
      expectedEndSec: clock(expectedEndSec),
      renderedStartSec: clock(renderedStartSec),
      renderedEndSec: clock(renderedEndSec),
      boundaryDriftMs: clock(boundaryDriftMs),
      sourceSec: clock(sourceSec),
      targetSec: clock(targetSec),
      retimeFactor: clock(retimeFactor),
      padSec: clock(padSec),
    };
    previousFrame = endFrame;
    return result;
  });
  const renderedVideoClockSec = previousFrame / FPS;
  if (Math.abs(renderedVideoClockSec - durationSec) > 1 / FPS + 0.002) {
    throw new Error(`Studio1 rendered frame clock ${renderedVideoClockSec.toFixed(3)}s diverges from narration ${durationSec.toFixed(3)}s`);
  }
  return {
    fps: FPS,
    expectedDurationSec: clock(durationSec),
    renderedVideoClockSec: clock(renderedVideoClockSec),
    maxBoundaryDriftMs: clock(Math.max(0, ...scenes.map(scene => scene.boundaryDriftMs))),
    scenes,
  };
}

export function buildStudio1VisualFilter(shot, scenePlan) {
  const start = Number(shot.trimInSec || 0);
  const end = Number(shot.trimOutSec || 0);
  const target = Number(scenePlan.targetSec);
  const factor = Number(scenePlan.retimeFactor || 1);
  const pad = Number(scenePlan.padSec || 0);
  const chain = [
    `[${scenePlan.inputIndex}:v]trim=start=${clock(start)}:end=${clock(end)}`,
    `setpts=${factor.toFixed(8)}*(PTS-STARTPTS)`,
  ];
  if (pad > 0.0005) chain.push(`tpad=stop_mode=clone:stop_duration=${clock(pad)}`);
  chain.push(
    `trim=duration=${clock(target)}`,
    "setpts=PTS-STARTPTS",
    "scale=1080:1920:force_original_aspect_ratio=increase",
    "crop=1080:1920",
    "setsar=1",
    `fps=${FPS}`,
    `trim=end_frame=${scenePlan.frameCount}`,
    "setpts=PTS-STARTPTS",
  );
  return `${chain.join(",")}[v${scenePlan.inputIndex}]`;
}
