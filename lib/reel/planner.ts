import crypto from "node:crypto";
import { ReelProductionManifest, ReelShot, TransitionType } from "./types";

export interface PlanReelInput {
  topic: string;
  tone?: string;
  platform?: ReelProductionManifest["platform"];
  requestedDurationSec?: number;
  scriptText?: string;
}

const clampDuration = (n: number) => Math.max(8, Math.min(90, Number(n.toFixed(3))));

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
  // Keep every editorial segment safely below an 8s generator boundary.
  // Empty segments are valid visual-only b-roll when a supplied script is short.
  const desiredShotCount = Math.max(2, Math.ceil(targetSec / 6));
  const words = script.trim().split(/\s+/).filter(Boolean);
  const chunks = Array.from({ length: desiredShotCount }, () => "");
  if (!words.length) return chunks;

  const wordsPerChunk = Math.max(1, Math.ceil(words.length / desiredShotCount));
  for (let i = 0; i < desiredShotCount; i++) {
    chunks[i] = words.slice(i * wordsPerChunk, (i + 1) * wordsPerChunk).join(" ");
  }
  return chunks;
}

function transitionFor(index: number, total: number): { type: TransitionType; durationSec: number } {
  // REL-01 invariant: editorialDurationSec is each shot's exact contribution to the
  // master timeline. Non-zero overlaps (xfade/whip/dissolve) require explicit source
  // handle accounting before they are allowed in the canonical planner.
  if (index === total - 1) return { type: "hard-cut", durationSec: 0 };
  if (index === 0) return { type: "cut-on-action", durationSec: 0 };
  if (index % 4 === 2) return { type: "match-cut", durationSec: 0 };
  return { type: "hard-cut", durationSec: 0 };
}

export function planReel(input: PlanReelInput): ReelProductionManifest {
  const requestedDurationSec = clampDuration(input.requestedDurationSec || 30);
  const topic = input.topic.trim() || "your topic";
  const tone = input.tone || "Confident & conversational";
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
    const editorialDurationSec = Number((i === beats.length - 1 ? remaining : perShot).toFixed(3));
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
    const continuityOut = { ...continuityIn, action: actionOut };
    const narrative = beat || `Visual continuation for ${topic}; support the surrounding narration without introducing a new claim.`;

    const shot: ReelShot = {
      id: `shot_${String(i + 1).padStart(2, "0")}`,
      order: i + 1,
      editorialStartSec: Number(cursor.toFixed(3)),
      editorialDurationSec,
      generationDurationSec,
      trimInSec: 0,
      trimOutSec: editorialDurationSec,
      scriptText: beat,
      visualIntent,
      generationPrompt: [
        visualIntent,
        `Narrative beat: ${narrative}`,
        `Tone: ${tone}.`,
        bible.visualStyle,
        bible.characterLock,
        bible.wardrobeLock,
        bible.environmentLock,
        bible.cameraLanguage,
        `Continuity start: ${previousAction}`,
        `Continuity end: ${actionOut}`,
        "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."
      ].join(" "),
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

  return {
    id: `reel_${crypto.randomUUID()}`,
    version: 1,
    createdAt: new Date().toISOString(),
    status: "SHOTS_PLANNED",
    platform: input.platform || "Instagram Reels",
    aspectRatio: "9:16",
    requestedDurationSec,
    plannedDurationSec: Number(cursor.toFixed(3)),
    topic,
    tone,
    masterScript,
    creativeBible: bible,
    audio: { masterClock: "narration", timingSource: "pending" },
    shots,
    qa: {
      minimumReadyScore: 90,
      passed: false,
      warnings: ["Narration waveform alignment, generated media inspection and final master QA are pending."],
      failures: []
    }
  };
}
