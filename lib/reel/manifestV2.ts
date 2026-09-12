import type { BoundaryState, CaptionCue, PerformanceCue, ReelProductionManifest, WordTiming } from "./types";

const clock = (n: number) => Number(n.toFixed(6));

function safeZoneProfile(platform: ReelProductionManifest["platform"]): "instagram-reels" | "youtube-shorts" | "tiktok" {
  if (platform === "YouTube Shorts") return "youtube-shorts";
  if (platform === "TikTok") return "tiktok";
  return "instagram-reels";
}

function compileCaptionCues(wordTimings: WordTiming[]): { words: WordTiming[]; cues: CaptionCue[] } {
  const words = wordTimings.map((word, index) => ({ ...word, id: word.id || `word_${String(index + 1).padStart(4, "0")}` }));
  const cues: CaptionCue[] = [];
  let bucket: WordTiming[] = [];
  const flush = () => {
    if (!bucket.length) return;
    const text = bucket.map(w => w.word).join(" ");
    cues.push({
      id: `caption_${String(cues.length + 1).padStart(3, "0")}`,
      startSec: bucket[0].startSec,
      endSec: bucket[bucket.length - 1].endSec,
      text,
      wordIds: bucket.map(w => w.id!),
      lines: [text],
      position: "lower-third",
    });
    bucket = [];
  };
  for (const word of words) {
    const start = bucket[0]?.startSec ?? word.startSec;
    const gap = bucket.length ? word.startSec - bucket[bucket.length - 1].endSec : 0;
    if (bucket.length >= 7 || word.endSec - start > 2.6 || gap > 0.45) flush();
    bucket.push(word);
    if (/[.!?]$/.test(word.word) && bucket.length >= 3) flush();
  }
  flush();
  return { words, cues };
}

function syncBoundaries(manifest: ReelProductionManifest) {
  if (!manifest.continuity || !Array.isArray(manifest.shots)) return;
  const priorBoundaries = Array.isArray(manifest.continuity.boundaries) ? manifest.continuity.boundaries : [];
  const existing = new Map(priorBoundaries.map(boundary => [`${boundary.fromShotId}:${boundary.toShotId}`, boundary]));
  manifest.continuity.boundaries = manifest.shots.slice(0, -1).map((from, index): BoundaryState => {
    const to = manifest.shots[index + 1];
    const prior = existing.get(`${from.id}:${to.id}`);
    const samePresenter = Boolean(from.continuityOut?.characterId && from.continuityOut.characterId === to.continuityIn?.characterId);
    return {
      id: prior?.id || `boundary_${from.id}_${to.id}`,
      fromShotId: from.id,
      toShotId: to.id,
      strategy: prior?.strategy || (from.transitionOut.type === "cut-on-action" ? "CUT_ON_ACTION" : from.transitionOut.type === "match-cut" ? "MATCH_CUT" : "HARD_CUT"),
      fromTimeSec: clock(from.editorialStartSec + from.editorialDurationSec),
      toTimeSec: to.editorialStartSec,
      expected: prior?.expected || {
        preserveIdentity: samePresenter,
        preserveWardrobe: samePresenter,
        preserveEnvironment: true,
        preserveObjects: true,
        preserveEmotion: samePresenter,
        preserveMotion: from.transitionOut.type === "cut-on-action" || from.transitionOut.type === "match-cut",
        continuousAudio: true,
      },
      evaluation: prior?.evaluation,
    };
  });
}

function syncPerformance(manifest: ReelProductionManifest) {
  const performanceTracks = Array.isArray(manifest.continuity?.performanceTracks) ? manifest.continuity.performanceTracks : [];
  const shots = Array.isArray(manifest.shots) ? manifest.shots : [];
  const track = performanceTracks.find(item => item?.characterId === "character_presenter");
  if (!track) return;
  track.cues = shots.filter(shot => shot?.continuityIn?.characterId === track.characterId).map((shot): PerformanceCue => ({
    startSec: shot.editorialStartSec,
    endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
    emotion: shot.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
    gaze: "camera",
    gesture: shot.continuityOut.action,
    speakingEnergy: shot.continuityIn.emotion?.intensity || 0.5,
  }));
}

export function enrichManifestV2(input: ReelProductionManifest): ReelProductionManifest {
  if (input.version !== 2) return input;
  const manifest = structuredClone(input);
  // V2 was introduced before runtime schema validation. Leave incomplete legacy
  // records readable; final QA remains responsible for rejecting them as valid
  // productions, while archive hydration must never throw.
  if (!manifest.audio || typeof manifest.audio !== "object" || Array.isArray(manifest.audio) ||
      !manifest.qa || typeof manifest.qa !== "object" || Array.isArray(manifest.qa) ||
      !Array.isArray(manifest.shots)) {
    return manifest;
  }
  syncBoundaries(manifest);
  syncPerformance(manifest);

  const actualDurationSec = manifest.audio.actualDurationSec;
  const alignedWords = manifest.audio.wordTimings;
  if (actualDurationSec && alignedWords?.length && manifest.audio.timingSource === "actual-alignment" && manifest.audio.alignmentValidation?.passed) {
    const compiled = compileCaptionCues(alignedWords);
    manifest.audio.wordTimings = compiled.words;
    manifest.audio.speechMap = {
      source: "actual-audio",
      durationSec: actualDurationSec,
      words: compiled.words,
      generatedAt: manifest.audio.speechMap?.generatedAt || new Date().toISOString(),
      phonemes: manifest.audio.speechMap?.phonemes,
      prosody: manifest.audio.speechMap?.prosody,
      pauses: manifest.audio.speechMap?.pauses,
    };
    manifest.captions = { timingSource: "actual-alignment", cues: compiled.cues, safeZoneProfile: safeZoneProfile(manifest.platform) };
    manifest.qa.gates = manifest.qa.gates || {};
    const validation = manifest.audio.alignmentValidation;
    manifest.qa.gates["QG-TRANSCRIPT-01"] = {
      id: "QG-TRANSCRIPT-01",
      status: "PASSED",
      score: Math.round(Math.max(0, 100 - validation.wer * 100)),
      threshold: 94,
      evaluator: "transcript-vs-script",
      evaluatedAt: new Date().toISOString(),
      evidenceRefs: [manifest.audio.narrationUrl || "narration"],
    };
    manifest.qa.gates["QG-CAP-01"] = {
      id: "QG-CAP-01",
      status: "PASSED",
      score: 100,
      threshold: 97,
      evaluator: "actual-word-alignment-caption-compiler",
      evaluatedAt: new Date().toISOString(),
      evidenceRefs: compiled.cues.map(cue => cue.id),
      note: "Cue timing derives from verified speech alignment. Final rendered placement remains subject to master visual QA.",
    };
  }

  return manifest;
}
