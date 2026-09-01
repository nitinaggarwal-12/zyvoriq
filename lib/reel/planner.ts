import crypto from "node:crypto";
import { BoundaryStrategy, QualityGateId, ReelCreationIntent, ReelProductionManifest, ReelShot, TransitionType } from "./types";

export interface PlanReelInput {
  topic: string;
  tone?: string;
  platform?: ReelProductionManifest["platform"];
  requestedDurationSec?: number;
  scriptText?: string;
  creationIntent?: ReelCreationIntent;
}

const clock = (n: number) => Number(n.toFixed(6));
const clampDuration = (n: number) => Math.max(8, Math.min(90, clock(n)));
const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const normalizeSpaces = (value: string) => value.trim().replace(/\s+/g, " ");

// Pick the SMALLEST Veo bucket that can cover the narration slot within the
// same local-adaptation limits the renderer enforces (<=0.75s and <=1.20x).
// Rounding up wastes source: a 4.30s slot generated at 6s throws away 1.70s,
// and the front-trim cuts the clip mid-action.
const GENERATION_BUCKETS: Array<4 | 6 | 8> = [4, 6, 8];
const MAX_LOCAL_EXTENSION_RATIO = 1.06;
const MAX_LOCAL_EXTENSION_SEC = 0.25;

function chooseGenerationDuration(editorialDurationSec: number): 4 | 6 | 8 {
  for (const bucket of GENERATION_BUCKETS) {
    if (editorialDurationSec <= bucket) return bucket;
    const deficitSec = editorialDurationSec - bucket;
    if (deficitSec <= MAX_LOCAL_EXTENSION_SEC && editorialDurationSec / bucket <= MAX_LOCAL_EXTENSION_RATIO) return bucket;
  }
  return 8;
}

function sentencePool(topic: string, intent?: ReelCreationIntent) {
  const generic = [
    `Here is what deserves a closer look about ${topic}.`,
    "The obvious reaction is only the surface of the idea.",
    "Look underneath it and notice the pattern that keeps returning.",
    "Separate what you assume from what you can actually observe.",
    "Then ask what the default choice gives you right now.",
    "Next, ask what that same choice quietly costs over time.",
    "That tradeoff is usually more useful than the first impression.",
    "Now compare the default with one deliberate alternative.",
    "Make that alternative specific enough to try today.",
    "Keep the action small enough that repetition feels realistic.",
    "Watch what changes instead of guessing whether it worked.",
    "If it helps, keep the signal and remove extra friction.",
    "If it does not, change one variable and test again.",
    "That turns a vague opinion into feedback you can use.",
    "The next decision becomes clearer because the evidence is visible.",
    "Over time, the better response starts feeling more automatic.",
    "The real payoff is understanding what changed and why.",
    "That makes the lesson easier to remember and explain.",
    "Try it once, then pay attention to the actual result.",
    "Save this idea if you want to revisit the pattern later."
  ];
  const concept = intent?.conceptId ? [
    intent.conceptSpeechSample || intent.conceptHook || `Open on the strongest moment of ${topic}.`,
    intent.conceptHook && intent.conceptHook !== intent.conceptSpeechSample ? intent.conceptHook : "",
    `Establish the stakes of ${topic} without wasting the opening seconds.`,
    `Move into the defining detail and make the progression visually obvious.`,
    "Show the contrast or consequence that makes the idea worth watching.",
    `Build toward a payoff that feels native to ${intent.categoryLabel || "this category"}.`,
    "Use one concrete change to move the story forward.",
    "Let the next beat prove why that change matters.",
    "Keep each step connected to the same central idea.",
    "Raise the consequence before giving the viewer the resolution.",
    "Make the payoff specific enough to feel earned.",
    "Finish on a memorable image or line that completes the idea.",
    ...generic.slice(12)
  ] : generic;
  const seen = new Set<string>();
  return concept
    .map(normalizeSpaces)
    .filter(Boolean)
    .filter(sentence => {
      const key = sentence.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildScript(topic: string, targetSec: number, intent?: ReelCreationIntent) {
  const targetWords = Math.max(18, Math.round(targetSec * 2.0));
  const candidates = sentencePool(topic, intent);
  let best: string[] = [];
  let bestDelta = Number.POSITIVE_INFINITY;
  let running: string[] = [];
  let runningWords = 0;

  for (const sentence of candidates) {
    running = [...running, sentence];
    runningWords += countWords(sentence);
    const delta = Math.abs(targetWords - runningWords);
    if (delta < bestDelta) {
      best = running;
      bestDelta = delta;
    }
    if (runningWords >= targetWords && delta > bestDelta) break;
  }

  if (!best.length) best = candidates.slice(0, 1);
  return normalizeSpaces(best.join(" "));
}

function sentenceUnits(script: string) {
  return (script.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [script])
    .map(normalizeSpaces)
    .filter(Boolean);
}

function splitLongUnit(unit: string, maxWords: number): string[] {
  if (countWords(unit) <= maxWords) return [unit];
  const words = unit.split(/\s+/);
  const out: string[] = [];
  let start = 0;
  const semanticBreak = /^(?:and|but|so|then|because|while|when|before|after|instead|which|that)$/i;

  while (words.length - start > maxWords) {
    const hardEnd = Math.min(words.length, start + maxWords);
    const softStart = Math.min(hardEnd - 1, start + Math.max(6, maxWords - 5));
    let splitAt = -1;
    for (let i = hardEnd - 1; i >= softStart; i--) {
      if (/[,:;—-]$/.test(words[i])) { splitAt = i + 1; break; }
      if (semanticBreak.test(words[i]) && i > start + 5) { splitAt = i; break; }
    }
    if (splitAt <= start) splitAt = hardEnd;
    out.push(words.slice(start, splitAt).join(" "));
    start = splitAt;
  }
  if (start < words.length) out.push(words.slice(start).join(" "));
  return out.filter(Boolean);
}

function splitIntoEditorialBeats(script: string, targetSec: number): string[] {
  const normalized = normalizeSpaces(script);
  if (!normalized) return [];
  const totalWords = countWords(normalized);
  const desiredShotCount = Math.max(2, Math.ceil(targetSec / 6));
  const targetWordsPerShot = Math.max(7, Math.min(13, Math.round(totalWords / desiredShotCount)));
  const maxWordsPerShot = 16;
  const units = sentenceUnits(normalized).flatMap(unit => splitLongUnit(unit, maxWordsPerShot));
  const beats: string[] = [];
  let current = "";

  for (const unit of units) {
    const proposed = current ? `${current} ${unit}` : unit;
    if (current && (countWords(proposed) > maxWordsPerShot || countWords(current) >= targetWordsPerShot)) {
      beats.push(current);
      current = unit;
    } else {
      current = proposed;
    }
  }
  if (current) beats.push(current);

  if (beats.length === 1 && desiredShotCount > 1 && countWords(beats[0]) > 8) {
    return splitLongUnit(beats[0], Math.ceil(countWords(beats[0]) / 2));
  }
  return beats;
}

function transitionFor(index: number, total: number): { type: TransitionType; durationSec: number } {
  if (index === total - 1) return { type: "hard-cut", durationSec: 0 };
  if (index === 0) return { type: "cut-on-action", durationSec: 0 };
  if (index % 4 === 2) return { type: "match-cut", durationSec: 0 };
  return { type: "hard-cut", durationSec: 0 };
}

function boundaryStrategy(type: TransitionType): BoundaryStrategy {
  if (type === "cut-on-action") return "CUT_ON_ACTION";
  if (type === "match-cut") return "MATCH_CUT";
  if (type === "jump-cut") return "JUMP_CUT";
  if (type === "graphic") return "GRAPHIC_TRANSITION";
  return "HARD_CUT";
}

function initialGates(): ReelProductionManifest["qa"]["gates"] {
  const ids: QualityGateId[] = [
    "QG-TRANSCRIPT-01", "QG-CAP-01", "QG-PERF-01", "QG-LIP-01", "QG-EMO-01",
    "QG-BND-01", "QG-OBJ-01", "QG-VIS-01", "QG-AUD-01", "QG-SEM-01", "QG-WHOLE-01"
  ];
  return Object.fromEntries(ids.map(id => [id, { id, status: "PENDING" as const }])) as ReelProductionManifest["qa"]["gates"];
}

function safeZoneProfile(platform: ReelProductionManifest["platform"]): "instagram-reels" | "youtube-shorts" | "tiktok" {
  if (platform === "YouTube Shorts") return "youtube-shorts";
  if (platform === "TikTok") return "tiktok";
  return "instagram-reels";
}

export function planReel(input: PlanReelInput): ReelProductionManifest {
  const requestedDurationSec = clampDuration(input.requestedDurationSec || 30);
  const topic = input.topic.trim() || "your topic";
  const tone = input.tone || "Confident & conversational";
  const platform = input.platform || "Instagram Reels";
  const creationIntent = input.creationIntent;
  const masterScript = (input.scriptText || "").trim() || buildScript(topic, requestedDurationSec, creationIntent);
  const beats = splitIntoEditorialBeats(masterScript, requestedDurationSec);
  const perShot = requestedDurationSec / beats.length;

  const selectedVisualStyle = creationIntent?.visualStyleDescription
    ? `${creationIntent.visualStyleLabel || creationIntent.visualStyleId}: ${creationIntent.visualStyleDescription}. Preserve social-first readability and do not render text in scene pixels.`
    : "Premium social-first cinematic realism; intentional vertical composition; no generated text in scene pixels.";
  const selectedCharacter = creationIntent?.characterDescription
    ? `Primary performer identity: ${creationIntent.characterDescription} Maintain the same face, body proportions, age, hair, skin tone and distinguishing features whenever this performer appears.`
    : "Maintain the same face, body proportions, age, hair, skin tone and distinguishing features whenever the primary presenter appears.";
  const selectedEnvironment = creationIntent?.conceptPrompt
    ? `Concept world and scene direction: ${creationIntent.conceptPrompt} Preserve spatial layout, key props, weather and time-of-day whenever the sequence remains in the same location.`
    : "Maintain spatial layout, key props, weather and time-of-day within a continuous location block.";

  const bible = {
    visualStyle: selectedVisualStyle,
    characterLock: selectedCharacter,
    wardrobeLock: "Maintain identical wardrobe, accessories and grooming within a continuous location/time block.",
    environmentLock: selectedEnvironment,
    cameraLanguage: "9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action.",
    colorLanguage: "Consistent white balance, contrast and saturation across the full production; final master grade owns the look."
  };

  const categoryDirection = [
    creationIntent?.categoryLabel ? `Content category: ${creationIntent.categoryLabel}.` : "",
    creationIntent?.conceptTitle ? `Selected concept: ${creationIntent.conceptTitle}.` : "",
    creationIntent?.conceptHook ? `Creative hook: ${creationIntent.conceptHook}.` : "",
  ].filter(Boolean).join(" ");

  let cursor = 0;
  const shots: ReelShot[] = beats.map((beat, i) => {
    const remaining = requestedDurationSec - cursor;
    const editorialDurationSec = clock(i === beats.length - 1 ? remaining : perShot);
    const generationDurationSec = chooseGenerationDuration(editorialDurationSec);
    const previousAction = i === 0 ? "Presenter is composed and ready to begin." : `Continue naturally from shot ${i}.`;
    // Framing only. The presenter is present and identity-locked in every shot;
    // subjectForward changes what dominates frame, never who is in it.
    // TODO: drive this from a per-beat shotType returned by the beat planner.
    const subjectForward = i !== 0 && i !== beats.length - 1 && i % 3 === 1;
    const actionOut = i === beats.length - 1 ? "Finish with a confident readable hold." : `Arrive at a settled, readable pose by the end of the clip; complete the gesture rather than ending mid-motion. Shot ${i + 2} continues from this final frame.`;
    const visualIntent = i === 0
      ? creationIntent?.conceptId
        ? "High-retention opening inside the selected concept world; establish subject, genre and stakes immediately."
        : "High-retention opening: tight presenter or visually surprising action; immediate subject clarity."
      : i === beats.length - 1
      ? "Payoff and CTA with clean negative space for editor-rendered captions."
      : subjectForward
      ? creationIntent?.conceptId
        ? "Subject-forward framing: the concept subject dominates the frame while the same presenter stays visibly present at the edge of frame or gesturing toward it; never substitute a different person and avoid generic stock-like imagery."
        : "Subject-forward framing: the thing being described dominates the frame while the same presenter stays visibly present at the edge of frame or gesturing toward it; never substitute a different person."
      : "Presenter-driven explanation with a purposeful change in framing or camera motion.";
    const emotion = { emotion: i === beats.length - 1 ? "confident" : i === 0 ? "curious" : "engaged", intensity: i === 0 ? 0.65 : 0.55, gestureEnergy: subjectForward ? 0.3 : 0.45 };

    const continuityIn = {
      character: bible.characterLock,
      characterId: "character_presenter",
      wardrobe: bible.wardrobeLock,
      environment: bible.environmentLock,
      environmentId: "environment_primary",
      lighting: bible.colorLanguage,
      action: previousAction,
      camera: bible.cameraLanguage,
      eyeline: subjectForward ? "toward subject, presenter remains in frame" : "camera",
      emotion
    };
    const continuityOut = { ...continuityIn, action: actionOut };
    const narrative = beat || `Visual continuation for ${topic}; support the surrounding narration without introducing a new claim.`;

    const shot: ReelShot = {
      id: `shot_${String(i + 1).padStart(2, "0")}`,
      order: i + 1,
      editorialStartSec: clock(cursor),
      editorialDurationSec,
      generationDurationSec,
      trimInSec: 0,
      trimOutSec: editorialDurationSec,
      scriptText: beat,
      visualIntent,
      generationPrompt: [visualIntent, categoryDirection, `Narrative beat: ${narrative}`, `Tone: ${tone}.`, bible.visualStyle, bible.characterLock, bible.wardrobeLock, bible.environmentLock, bible.cameraLanguage, `Continuity start: ${previousAction}`, `Continuity end: ${actionOut}`, `Emotional state: ${emotion.emotion} at intensity ${emotion.intensity}.`, "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."].filter(Boolean).join(" "),
      continuityIn,
      continuityOut,
      transitionOut: transitionFor(i, beats.length),
      dependsOnShotIds: i === 0 ? [] : [`shot_${String(i).padStart(2, "0")}`],
      status: "PLANNED",
      qa: { warnings: [], failures: [] }
    };
    cursor = clock(cursor + editorialDurationSec);
    return shot;
  });

  const boundaries = shots.slice(0, -1).map((shot, i) => {
    const next = shots[i + 1];
    const samePresenter = Boolean(shot.continuityOut.characterId && shot.continuityOut.characterId === next.continuityIn.characterId);
    return {
      id: `boundary_${shot.id}_${next.id}`,
      fromShotId: shot.id,
      toShotId: next.id,
      strategy: boundaryStrategy(shot.transitionOut.type),
      fromTimeSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
      toTimeSec: next.editorialStartSec,
      expected: {
        preserveIdentity: samePresenter,
        preserveWardrobe: samePresenter,
        preserveEnvironment: true,
        preserveObjects: true,
        preserveEmotion: samePresenter,
        preserveMotion: shot.transitionOut.type === "cut-on-action" || shot.transitionOut.type === "match-cut",
        continuousAudio: true
      }
    };
  });

  const draftCaptionCues = shots.filter(s => s.scriptText.trim()).map((shot, i) => ({
    id: `caption_draft_${String(i + 1).padStart(2, "0")}`,
    startSec: shot.editorialStartSec,
    endSec: clock(shot.editorialStartSec + shot.editorialDurationSec),
    text: shot.scriptText.trim(),
    wordIds: [],
    lines: [shot.scriptText.trim()],
    position: "lower-third" as const
  }));

  return {
    id: `reel_${crypto.randomUUID()}`,
    version: 2,
    createdAt: new Date().toISOString(),
    status: "SHOTS_PLANNED",
    platform,
    aspectRatio: "9:16",
    requestedDurationSec,
    plannedDurationSec: clock(cursor),
    topic,
    tone,
    creationIntent,
    masterScript,
    creativeBible: bible,
    audio: { masterClock: "narration", timingSource: "pending" },
    captions: { timingSource: "draft", cues: draftCaptionCues, safeZoneProfile: safeZoneProfile(platform) },
    continuity: {
      characters: [{
        id: "character_presenter",
        role: "presenter",
        canonicalReferenceImages: [],
        appearance: { description: bible.characterLock },
        wardrobe: [bible.wardrobeLock],
        accessories: [],
        voiceProfile: creationIntent?.characterName,
        gestureStyle: "Natural conversational emphasis; avoid repetitive synthetic gestures.",
        gazeStyle: "Maintain camera eyeline for direct-address presenter beats.",
        emotionalRange: ["curious", "engaged", "reflective", "confident"]
      }],
      environments: [{
        id: "environment_primary",
        description: bible.environmentLock,
        palette: bible.colorLanguage,
        keyObjects: [],
        cameraAxis: bible.cameraLanguage
      }],
      performanceTracks: [{
        id: "performance_presenter",
        characterId: "character_presenter",
        audioTrack: "master-narration",
        mode: "persistent-performer",
        cues: shots.filter(s => s.continuityIn.characterId === "character_presenter").map(s => ({
          startSec: s.editorialStartSec,
          endSec: clock(s.editorialStartSec + s.editorialDurationSec),
          emotion: s.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
          gaze: "camera" as const,
          gesture: s.continuityOut.action,
          speakingEnergy: s.continuityIn.emotion?.intensity || 0.5
        }))
      }],
      boundaries,
      objectStateGraph: Object.fromEntries(shots.map(s => [s.id, s.continuityIn.objectStates || []]))
    },
    musicPlan: { sections: [{ startSec: 0, endSec: clock(cursor), intent: creationIntent?.musicPreset ? `Continuous supportive underscore. Planning direction: ${creationIntent.musicPreset}.` : "Continuous supportive underscore following the narrative arc.", energy: 0.45 }], continuousAcrossVisualCuts: true, duckUnderSpeech: true },
    shots,
    qa: { minimumReadyScore: 90, passed: false, gates: initialGates(), warnings: ["Narration waveform alignment, generated media inspection, lip-sync verification, boundary QA and final master QA are pending."], failures: [] }
  };
}
