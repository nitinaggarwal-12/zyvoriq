import crypto from "node:crypto";
import { ReelProductionManifest, ReelShot, TransitionType } from "./types";

export interface PlanReelInput {
  topic: string;
  tone?: string;
  platform?: ReelProductionManifest["platform"];
  requestedDurationSec?: number;
  scriptText?: string;
}

const clampDuration = (n: number) => Math.max(8, Math.min(90, Math.round(n)));

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
  return words.slice(0, wordsTarget).join(" ").replace(/\s+([,.!?])/g, "$1");
}

function splitIntoEditorialBeats(script: string, targetSec: number) {
  const sentences = script.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const desiredShotCount = Math.max(2, Math.ceil(targetSec / 5));
  const chunks: string[] = Array.from({ length: desiredShotCount }, () => "");
  sentences.forEach((sentence, i) => {
    const index = Math.min(desiredShotCount - 1, Math.floor((i / Math.max(1, sentences.length)) * desiredShotCount));
    chunks[index] = `${chunks[index]} ${sentence}`.trim();
  });

  // If script has too few sentence boundaries, distribute words instead.
  if (chunks.filter(Boolean).length < Math.min(2, desiredShotCount)) {
    const words = script.split(/\s+/);
    const perChunk = Math.ceil(words.length / desiredShotCount);
    return Array.from({ length: desiredShotCount }, (_, i) => words.slice(i * perChunk, (i + 1) * perChunk).join(" ")).filter(Boolean);
  }
  return chunks.filter(Boolean);
}

function transitionFor(index: number, total: number): { type: TransitionType; durationSec: number } {
  if (index === total - 1) return { type: "hard-cut", durationSec: 0 };
  if (index === 0) return { type: "cut-on-action", durationSec: 0 };
  if (index % 4 === 2) return { type: "match-cut", durationSec: 0 };
  if (index % 5 === 3) return { type: "whip", durationSec: 0.16 };
  return { type: "hard-cut", durationSec: 0 };
}

export function planReel(input: PlanReelInput): ReelProductionManifest {
  const requestedDurationSec = clampDuration(input.requestedDurationSec || 30);
  const topic = input.topic.trim() || "your topic";
  const tone = input.tone || "Confident & conversational";
  const masterScript = (input.scriptText || "").trim() || buildScript(topic, requestedDurationSec);
  const beats = splitIntoEditorialBeats(masterScript, requestedDurationSec);

  const weights = beats.map(b => Math.max(1, b.split(/\s+/).length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = 0;

  const bible = {
    visualStyle: "Premium social-first cinematic realism; intentional vertical composition; no generated text in scene pixels.",
    characterLock: "Maintain the same face, body proportions, age, hair, skin tone and distinguishing features whenever the primary presenter appears.",
    wardrobeLock: "Maintain identical wardrobe, accessories and grooming within a continuous location/time block.",
    environmentLock: "Maintain spatial layout, key props, weather and time-of-day within a continuous location block.",
    cameraLanguage: "9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action.",
    colorLanguage: "Consistent white balance, contrast and saturation across the full production; final master grade owns the look."
  };

  const shots: ReelShot[] = beats.map((beat, i) => {
    const raw = requestedDurationSec * (weights[i] / totalWeight);
    const editorialDurationSec = Number(Math.max(1.4, Math.min(7.6, raw)).toFixed(2));
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

    const continuityIn = {
      character: bible.characterLock,
      wardrobe: bible.wardrobeLock,
      environment: bible.environmentLock,
      lighting: bible.colorLanguage,
      action: previousAction,
      camera: bible.cameraLanguage
    };
    const continuityOut = {
      ...continuityIn,
      action: actionOut
    };

    const prompt = [
      visualIntent,
      `Narrative beat: ${beat}`,
      `Tone: ${tone}.`,
      bible.visualStyle,
      bible.characterLock,
      bible.wardrobeLock,
      bible.environmentLock,
      bible.cameraLanguage,
      `Continuity start: ${previousAction}`,
      `Continuity end: ${actionOut}`,
      "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."
    ].join(" ");

    const shot: ReelShot = {
      id: `shot_${String(i + 1).padStart(2, "0")}`,
      order: i + 1,
      editorialStartSec: Number(cursor.toFixed(2)),
      editorialDurationSec,
      generationDurationSec,
      trimInSec: 0,
      trimOutSec: editorialDurationSec,
      scriptText: beat,
      visualIntent,
      generationPrompt: prompt,
      continuityIn,
      continuityOut,
      transitionOut: transitionFor(i, beats.length),
      dependsOnShotIds: i > 0 && i % 3 !== 1 ? [`shot_${String(i).padStart(2, "0")}`] : [],
      status: "PLANNED",
      qa: { warnings: [], failures: [] }
    };
    cursor += editorialDurationSec;
    return shot;
  });

  // Scale the editorial timeline to the requested duration without changing Veo generation unit sizes.
  const scale = requestedDurationSec / Math.max(cursor, 0.001);
  let scaledCursor = 0;
  for (const shot of shots) {
    shot.editorialDurationSec = Number((shot.editorialDurationSec * scale).toFixed(2));
    shot.editorialStartSec = Number(scaledCursor.toFixed(2));
    shot.trimOutSec = Math.min(shot.generationDurationSec, shot.editorialDurationSec);
    scaledCursor += shot.editorialDurationSec;
  }

  return {
    id: `reel_${crypto.randomUUID()}`,
    version: 1,
    createdAt: new Date().toISOString(),
    status: "SHOTS_PLANNED",
    platform: input.platform || "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec,
    plannedDurationSec: Number(scaledCursor.toFixed(2)),
    topic,
    tone,
    masterScript,
    creativeBible: bible,
    audio: {
      masterClock: "narration",
      timingSource: "pending"
    },
    shots,
    qa: {
      minimumReadyScore: 90,
      passed: false,
      warnings: ["Narration waveform alignment, generated media inspection and final master QA are pending."],
      failures: []
    }
  };
}
