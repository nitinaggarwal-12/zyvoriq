import crypto from "node:crypto";
import { BoundaryStrategy, QualityGateId, ReelProductionManifest, ReelShot, TransitionType } from "./types";

export interface PlanReelInput {
  topic: string;
  tone?: string;
  platform?: ReelProductionManifest["platform"];
  requestedDurationSec?: number;
  scriptText?: string;
}

const clock = (n: number) => Number(n.toFixed(6));
const clampDuration = (n: number) => Math.max(8, Math.min(90, clock(n)));

function chooseGenerationDuration(editorialDurationSec: number): 4 | 6 | 8 {
  if (editorialDurationSec <= 3.5) return 4;
  if (editorialDurationSec <= 5.5) return 6;
  return 8;
}

function buildScript(topic: string, targetSec: number) {
  const beats = [
    `Most people misunderstand ${topic}, and it quietly costs them results.`,
    `Here is the first thing to notice: the obvious behavior is usually not the real problem.`,
    `Second, look for the hidden tradeoff and show one concrete example the viewer recognizes immediately.`,
    `Third, replace the bad pattern with one practical action the viewer can try today.`,
    `The payoff is simple: make the better behavior easier than the default behavior.`,
    `Save this and share it with someone who needs the reminder.`
  ];
  const wordsTarget = Math.max(28, Math.round(targetSec * 2.15));
  const words: string[] = [];
  let i = 0;
  while (words.length < wordsTarget) {
    words.push(...beats[i % beats.length].split(/\s+/));
    i++;
  }
  return words.slice(0, wordsTarget).join(" ");
}

function splitIntoEditorialBeats(script: string, targetSec: number): string[] {
  const desiredShotCount = Math.max(2, Math.ceil(targetSec / 6));
  const words = script.trim().split(/\s+/).filter(Boolean);
  const chunks = Array.from({ length: desiredShotCount }, () => "");
  if (!words.length) return chunks;
  const wordsPerChunk = Math.max(1, Math.ceil(words.length / desiredShotCount));
  for (let i = 0; i < desiredShotCount; i++) chunks[i] = words.slice(i * wordsPerChunk, (i + 1) * wordsPerChunk).join(" ");
  return chunks;
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
  const masterScript = (input.scriptText || "").trim() || buildScript(topic, requestedDurationSec);
  const beats = splitIntoEditorialBeats(masterScript, requestedDurationSec);
  const perShot = requestedDurationSec / beats.length;

  const bible = {
    visualStyle: "Premium social-first cinematic realism; intentional vertical composition; no generated text in scene pixels.",
    characterLock: "Maintain the same face, body proportions, age, hair, skin tone and distinguishing features whenever the primary presenter appears.",
    wardrobeLock: "Maintain identical wardrobe, accessories and grooming within a continuous location/time block.",
    environmentLock: "Maintain spatial layout, key props, weather and time-of-day within a continuous location block.",
    cameraLanguage: "9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action.",
    colorLanguage: "Consistent white balance, contrast and saturation across the full production; final master grade owns the look."
  };

  let cursor = 0;
  const shots: ReelShot[] = beats.map((beat, i) => {
    const remaining = requestedDurationSec - cursor;
    const editorialDurationSec = clock(i === beats.length - 1 ? remaining : perShot);
    const generationDurationSec = chooseGenerationDuration(editorialDurationSec);
    const previousAction = i === 0 ? "Presenter is composed and ready to begin." : `Continue naturally from shot ${i}.`;
    const actionOut = i === beats.length - 1 ? "Finish with a confident readable hold." : `End on a clean gesture or motion vector that can motivate shot ${i + 2}.`;
    const visualIntent = i === 0
      ? "High-retention opening: tight presenter or visually surprising action; immediate subject clarity."
      : i === beats.length - 1
      ? "Payoff and CTA with clean negative space for editor-rendered captions."
      : i % 3 === 1
      ? "Relevant b-roll that literally supports the spoken beat; no decorative stock-like imagery."
      : "Presenter-driven explanation with a purposeful change in framing or camera motion.";
    const presenterShot = i % 3 !== 1;
    const emotion = { emotion: i === beats.length - 1 ? "confident" : i === 0 ? "curious" : "engaged", intensity: i === 0 ? 0.65 : 0.55, gestureEnergy: presenterShot ? 0.45 : 0.2 };

    const continuityIn = {
      character: bible.characterLock,
      characterId: presenterShot ? "character_presenter" : undefined,
      wardrobe: bible.wardrobeLock,
      environment: bible.environmentLock,
      environmentId: "environment_primary",
      lighting: bible.colorLanguage,
      action: previousAction,
      camera: bible.cameraLanguage,
      eyeline: presenterShot ? "camera" : undefined,
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
      generationPrompt: [visualIntent, `Narrative beat: ${narrative}`, `Tone: ${tone}.`, bible.visualStyle, bible.characterLock, bible.wardrobeLock, bible.environmentLock, bible.cameraLanguage, `Continuity start: ${previousAction}`, `Continuity end: ${actionOut}`, `Emotional state: ${emotion.emotion} at intensity ${emotion.intensity}.`, "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."].join(" "),
      continuityIn,
      continuityOut,
      transitionOut: transitionFor(i, beats.length),
      dependsOnShotIds: (() => {
        if (i === 0 || !presenterShot) return [];
        for (let j = i - 1; j >= 0; j--) { if (j % 3 !== 1) return [`shot_${String(j + 1).padStart(2, "0")}`]; }
        return [];
      })(),
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
    musicPlan: { sections: [{ startSec: 0, endSec: clock(cursor), intent: "Continuous supportive underscore following the narrative arc.", energy: 0.45 }], continuousAcrossVisualCuts: true, duckUnderSpeech: true },
    shots,
    qa: { minimumReadyScore: 90, passed: false, gates: initialGates(), warnings: ["Narration waveform alignment, generated media inspection, lip-sync verification, boundary QA and final master QA are pending."], failures: [] }
  };
}
