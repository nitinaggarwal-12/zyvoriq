import crypto from "node:crypto";
import { planReel, generateNarrationScriptWithGemini, type PlanReelInput } from "../reel/planner.ts";
import { compileOmniDirectorialPass, type OmniDirectorialCompilation } from "../reel/omniDirector.ts";
import type { ReelProductionManifest } from "../reel/types.ts";

export type Studio1SubjectMode = "PRESENTER" | "NO_PERSON";

export type Studio1Metadata = {
  schemaVersion: 1;
  projectTitle?: string;
  presenterContinuity: boolean;
  environmentContinuity: boolean;
  generationRound: number;
  basePrompts: Record<string, string>;
  subjectModes: Record<string, Studio1SubjectMode>;
  clipOptions: Record<string, Array<{
    id: string;
    label: string;
    asset: NonNullable<ReelProductionManifest["shots"][number]["asset"]>;
    createdAt: string;
  }>>;
};

// Narration budgeting constants
// Conversational speech in video generation / TTS averages ~1.65 words per second.
// Maximum editorial duration ceiling is 7.5s to maintain safe headroom below Veo's 8.0s hard cap.
// At 1.65 wps, 12 words ~ 7.27s, which fits cleanly within the 8.0s Veo ceiling with zero clamp trim.
export const TARGET_SHOT_DURATION_SEC = 6.0;
export const WORDS_PER_SECOND = 1.65;
export const MAX_SHOT_DURATION_SEC = 7.5;
export const MAX_WORDS_PER_SHOT = 12;

const GENERATION_BUCKETS: Array<4 | 6 | 8> = [4, 6, 8];
const MAX_LOCAL_EXTENSION_RATIO = 1.06;
const MAX_LOCAL_EXTENSION_SEC = 0.25;

export function chooseGenerationDuration(editorialDurationSec: number): 4 | 6 | 8 {
  for (const bucket of GENERATION_BUCKETS) {
    if (editorialDurationSec <= bucket) return bucket;
    const deficitSec = editorialDurationSec - bucket;
    if (deficitSec <= MAX_LOCAL_EXTENSION_SEC && editorialDurationSec / bucket <= MAX_LOCAL_EXTENSION_RATIO) return bucket;
  }
  return 8;
}

function studio1Meta(manifest: ReelProductionManifest): Studio1Metadata {
  const meta = (manifest as any).studio1 as Studio1Metadata;
  if (typeof meta.environmentContinuity !== "boolean") meta.environmentContinuity = true;
  if (!meta.projectTitle) meta.projectTitle = manifest.topic;
  return meta;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function stripSpeakerLabels(value: string) {
  return value.replace(/^[A-Z0-9_\-\s]{2,25}:/i, "").trim();
}

function splitLongSentence(sentence: string, maxWords: number): string[] {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [sentence.trim()];

  const out: string[] = [];
  let start = 0;
  const semanticBreak = /^(?:and|but|so|then|because|while|when|before|after|instead|which|that)$/i;

  while (words.length - start > maxWords) {
    const hardEnd = Math.min(words.length, start + maxWords);
    const softStart = Math.min(hardEnd - 1, start + Math.max(4, maxWords - 4));
    let splitAt = -1;
    for (let i = hardEnd - 1; i >= softStart; i--) {
      if (/[,:;—-]$/.test(words[i])) {
        splitAt = i + 1;
        break;
      }
      if (semanticBreak.test(words[i]) && i > start + 3) {
        splitAt = i;
        break;
      }
    }
    if (splitAt <= start) {
      splitAt = hardEnd;
    }
    out.push(words.slice(start, splitAt).join(" "));
    start = splitAt;
  }
  if (start < words.length) {
    out.push(words.slice(start).join(" "));
  }
  return out.filter(Boolean);
}

export function splitScriptIntoBudgetedUnits(text: string, maxWords: number = MAX_WORDS_PER_SHOT): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // 1. Check if multiple dialogue speakers exist in the text (e.g. "ALICE: ... BOB: ...")
  const speakerRegex = /([A-Z0-9_\-\s]{2,25}:)/g;
  const speakerMatches = [...trimmed.matchAll(speakerRegex)];
  if (speakerMatches.length > 1) {
    const pieces: string[] = [];
    let lastIdx = 0;
    for (let i = 1; i < speakerMatches.length; i++) {
      const match = speakerMatches[i];
      const part = trimmed.slice(lastIdx, match.index).trim();
      if (part) pieces.push(part);
      lastIdx = match.index!;
    }
    const finalPart = trimmed.slice(lastIdx).trim();
    if (finalPart) pieces.push(finalPart);
    return pieces.flatMap(piece => splitScriptIntoBudgetedUnits(piece, maxWords));
  }

  const cleanForCount = stripSpeakerLabels(trimmed);
  const words = cleanForCount.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return [trimmed];
  }

  const prefixMatch = trimmed.match(/^([A-Z0-9_\-\s]{2,25}:\s*)/i);
  const prefix = prefixMatch ? prefixMatch[1] : "";
  const body = prefixMatch ? trimmed.slice(prefix.length).trim() : trimmed;

  const sentenceUnits = (body.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [body])
    .map(s => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentWords: string[] = [];

  for (const sentence of sentenceUnits) {
    const sWords = sentence.split(/\s+/).filter(Boolean);
    if (sWords.length > maxWords) {
      if (currentWords.length > 0) {
        chunks.push(currentWords.join(" "));
        currentWords = [];
      }
      const subParts = splitLongSentence(sentence, maxWords);
      chunks.push(...subParts);
    } else if (currentWords.length + sWords.length > maxWords) {
      chunks.push(currentWords.join(" "));
      currentWords = [...sWords];
    } else {
      currentWords.push(...sWords);
    }
  }

  if (currentWords.length > 0) {
    chunks.push(currentWords.join(" "));
  }

  if (prefix && chunks.length > 0) {
    chunks[0] = `${prefix}${chunks[0]}`;
  }

  return chunks.filter(Boolean);
}

export function budgetStudio1NarrationAgainstCap(manifest: ReelProductionManifest): ReelProductionManifest {
  const meta = studio1Meta(manifest);
  const originalShots = manifest.shots;
  const newShots: ReelProductionManifest["shots"] = [];

  for (let i = 0; i < originalShots.length; i++) {
    const shot = originalShots[i];
    const script = shot.scriptText?.trim() || "";
    const cleanWords = stripSpeakerLabels(script).split(/\s+/).filter(Boolean);
    const wordCount = cleanWords.length;
    const estDurationSec = wordCount > 0 ? wordCount / WORDS_PER_SECOND : shot.editorialDurationSec;

    // A shot needs splitting if its word count exceeds the 8.0s Veo carrying capacity (>12 words),
    // or if its editorial duration exceeds the 7.5s safe cap.
    const needsSplit = (wordCount > MAX_WORDS_PER_SHOT || shot.editorialDurationSec > MAX_SHOT_DURATION_SEC || estDurationSec > MAX_SHOT_DURATION_SEC) && wordCount > 3;

    if (!needsSplit) {
      newShots.push({
        ...shot,
        editorialDurationSec: Math.min(MAX_SHOT_DURATION_SEC, Math.max(2.0, shot.editorialDurationSec)),
      });
      continue;
    }

    const units = splitScriptIntoBudgetedUnits(script, MAX_WORDS_PER_SHOT);
    if (units.length <= 1) {
      // Midpoint forced split if semantic splitter was unable to break
      const mid = Math.ceil(cleanWords.length / 2);
      const prefixMatch = script.match(/^([A-Z0-9_\-\s]{2,25}:\s*)/i);
      const prefix = prefixMatch ? prefixMatch[1] : "";
      units.length = 0;
      units.push(prefix + cleanWords.slice(0, mid).join(" "));
      units.push(cleanWords.slice(mid).join(" "));
    }

    const totalWords = units.reduce((acc, u) => acc + stripSpeakerLabels(u).split(/\s+/).filter(Boolean).length, 0);

    for (let uIdx = 0; uIdx < units.length; uIdx++) {
      const unitText = units[uIdx];
      const unitWords = stripSpeakerLabels(unitText).split(/\s+/).filter(Boolean).length;
      const ratio = totalWords > 0 ? unitWords / totalWords : 1 / units.length;
      const rawDur = Math.max(2.5, Math.min(MAX_SHOT_DURATION_SEC, Number((shot.editorialDurationSec * ratio).toFixed(2))));
      const editorialDurationSec = rawDur;
      const generationDurationSec = chooseGenerationDuration(editorialDurationSec);

      const isFirst = uIdx === 0;
      const isLast = uIdx === units.length - 1;

      const subId = isFirst ? shot.id : `${shot.id}_${String.fromCharCode(97 + uIdx)}`;
      const subVisualIntent = isFirst
        ? shot.visualIntent
        : `${shot.visualIntent || "Scene continuation"} (Part ${uIdx + 1}: continuing action)`;

      const subShot: ReelProductionManifest["shots"][number] = {
        ...structuredClone(shot),
        id: subId,
        editorialDurationSec,
        generationDurationSec,
        trimInSec: 0,
        trimOutSec: editorialDurationSec,
        scriptText: unitText,
        visualIntent: subVisualIntent,
        status: "PLANNED",
        qa: { warnings: [], failures: [] },
      };

      if (!isFirst) {
        delete subShot.asset;
        if (subShot.continuityIn) {
          subShot.continuityIn.action = `Continue naturally from beat ${uIdx}.`;
        }
      }

      if (!isLast && subShot.continuityOut) {
        subShot.continuityOut.action = `Arrive at a settled, readable pose by the end of the clip. Beat ${uIdx + 2} continues from this final frame.`;
      }

      newShots.push(subShot);
    }
  }

  // Re-index all shots, IDs, order, editorialStartSec, and metadata
  let cursor = 0;
  const newBasePrompts: Record<string, string> = {};
  const newSubjectModes: Record<string, Studio1SubjectMode> = {};

  for (let idx = 0; idx < newShots.length; idx++) {
    const s = newShots[idx];
    const originalShotId = s.id;
    const newId = `shot_${String(idx + 1).padStart(2, "0")}`;
    s.id = newId;
    s.order = idx + 1;
    s.editorialStartSec = Number(cursor.toFixed(6));
    s.generationDurationSec = chooseGenerationDuration(s.editorialDurationSec);
    s.trimInSec = 0;
    s.trimOutSec = s.editorialDurationSec;
    cursor = Number((cursor + s.editorialDurationSec).toFixed(6));

    const existingMode = meta.subjectModes[originalShotId] || meta.subjectModes[newId] || "PRESENTER";
    newSubjectModes[newId] = existingMode;

    const basePrompt = s.visualIntent
      ? [s.visualIntent, s.scriptText ? `Narrative beat: ${s.scriptText}` : "", `Tone: ${manifest.tone}.`, manifest.creativeBible.visualStyle, manifest.creativeBible.cameraLanguage, "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."].filter(Boolean).join(" ")
      : s.generationPrompt;
    newBasePrompts[newId] = basePrompt;
  }

  manifest.shots = newShots;
  manifest.plannedDurationSec = cursor;
  meta.basePrompts = newBasePrompts;
  meta.subjectModes = newSubjectModes;

  // Re-apply Studio 1 shot prompts (handles dependsOnShotIds, environment lock, identity lock, semantic onset)
  for (const shot of manifest.shots) {
    applyStudio1ShotPrompt(manifest, shot.id);
  }

  // Rebuild continuity boundaries
  if (manifest.continuity) {
    manifest.continuity.boundaries = manifest.shots.slice(0, -1).map((shot, index) => {
      const next = manifest.shots[index + 1];
      const samePresenter = Boolean(shot.continuityOut.characterId && shot.continuityOut.characterId === next.continuityIn.characterId);
      return {
        id: `boundary_${shot.id}_${next.id}`,
        fromShotId: shot.id,
        toShotId: next.id,
        strategy: shot.transitionOut.type === "cut-on-action" ? "CUT_ON_ACTION" : shot.transitionOut.type === "match-cut" ? "MATCH_CUT" : "HARD_CUT",
        fromTimeSec: Number((shot.editorialStartSec + shot.editorialDurationSec).toFixed(6)),
        toTimeSec: next.editorialStartSec,
        expected: {
          preserveIdentity: samePresenter,
          preserveWardrobe: samePresenter,
          preserveEnvironment: true,
          preserveObjects: true,
          preserveEmotion: samePresenter,
          preserveMotion: false,
          continuousAudio: true,
        },
      };
    });
    manifest.continuity.objectStateGraph = Object.fromEntries(manifest.shots.map(s => [s.id, s.continuityIn.objectStates || []]));
    const presenterTrack = manifest.continuity.performanceTracks?.find(track => track.characterId === "character_presenter");
    if (presenterTrack) {
      presenterTrack.cues = manifest.shots.filter(s => s.continuityIn.characterId === "character_presenter").map(s => ({
        startSec: s.editorialStartSec,
        endSec: Number((s.editorialStartSec + s.editorialDurationSec).toFixed(6)),
        emotion: s.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
        gaze: "camera" as const,
        gesture: s.continuityOut.action,
        speakingEnergy: s.continuityIn.emotion?.intensity || 0.5,
      }));
    }
  }

  // Rebuild captions
  if (manifest.captions) {
    manifest.captions.cues = manifest.shots.filter(s => s.scriptText.trim()).map((shot, index) => ({
      id: `caption_draft_${String(index + 1).padStart(2, "0")}`,
      startSec: shot.editorialStartSec,
      endSec: Number((shot.editorialStartSec + shot.editorialDurationSec).toFixed(6)),
      text: shot.scriptText.trim(),
      wordIds: [],
      lines: [shot.scriptText.trim()],
      position: "lower-third" as const,
    }));
  }

  // Rebuild masterScript
  manifest.masterScript = manifest.shots.map(s => s.scriptText.trim()).filter(Boolean).join(" ");

  return manifest;
}

export function applyStudio1ShotPrompt(manifest: ReelProductionManifest, shotId: string) {
  const meta = studio1Meta(manifest);
  const shotIndex = manifest.shots.findIndex(item => item.id === shotId);
  const shot = manifest.shots[shotIndex];
  if (!shot) return;
  const base = meta.basePrompts[shot.id] || shot.generationPrompt;
  const mode = meta.subjectModes[shot.id] || "PRESENTER";
  const previous = shotIndex > 0 ? manifest.shots[shotIndex - 1] : null;
  shot.dependsOnShotIds = meta.environmentContinuity && previous ? [previous.id] : [];

  const environmentRule = meta.environmentContinuity
    ? "STUDIO1 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. The previous-scene visual reference supplied by the worker is authoritative for the set. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change."
    : "STUDIO1 ENVIRONMENT MODE: Environment continuity is disabled for this experiment.";

  const semanticOnsetRule = [
    "STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective.",
    "Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration.",
    "Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip.",
    shot.scriptText ? `The current spoken beat is: ${shot.scriptText}` : "",
  ].filter(Boolean).join(" ");

  if (mode === "NO_PERSON" || !shot.continuityIn?.characterId) {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
    shot.generationPrompt = [
      base,
      environmentRule,
      semanticOnsetRule,
      "STUDIO1 SUBJECT RULE: Pure cinematic action, stunt, environment master or object focus. NO talking presenters, NO direct-to-camera address. Preserve the established environment and visual language."
    ].join(" ");
    return;
  }

  const charId = shot.continuityIn.characterId;
  const char = (manifest.continuity?.characters || []).find(c => c.id === charId);
  const purePhysicalDesc = char?.appearance?.face
    ? `${char.appearance.ageBand || "mid 20s"}, ${char.appearance.face}, ${char.appearance.hair}`
    : (char?.appearance?.description || "lead performer with expressive facial bone structure");

  shot.continuityIn.characterId = charId;
  shot.continuityOut.characterId = charId;

  shot.generationPrompt = [
    base,
    environmentRule,
    semanticOnsetRule,
    meta.presenterContinuity
      ? `STUDIO1 IDENTITY LOCK [lead_performer]: The attached canonical character reference image is authoritative for this shot. Physical description: ${purePhysicalDesc}. Identity continuity is mandatory: identical face, age, skin tone, hair, body proportions, wardrobe and distinguishing features. Do not substitute, cast, morph into, or introduce a different actor. Eyeline: ${shot.continuityIn.eyeline || "conversational off-camera"}.`
      : "STUDIO1 ACTOR MODE: Canonical identity anchoring is disabled for this experiment."
  ].join(" ");
}

export function planStudio1Sync(input: PlanReelInput, directorial?: OmniDirectorialCompilation): ReelProductionManifest {
  const manifest = planReel(input, directorial);
  manifest.id = `studio1_${crypto.randomUUID()}`;
  manifest.status = "SCRIPT_READY";

  const basePrompts = Object.fromEntries(manifest.shots.map(shot => [shot.id, shot.generationPrompt]));
  const subjectModes = Object.fromEntries(manifest.shots.map(shot => [
    shot.id,
    (shot.continuityIn.characterId ? "PRESENTER" : "NO_PERSON") as Studio1SubjectMode
  ]));
  const meta: Studio1Metadata = {
    schemaVersion: 1,
    projectTitle: input.topic,
    presenterContinuity: true,
    environmentContinuity: true,
    generationRound: 1,
    basePrompts,
    subjectModes,
    clipOptions: {},
  };
  (manifest as any).studio1 = meta;

  // Isolated compatibility view used by the existing shared production worker.
  (manifest as any).characters = structuredClone(manifest.continuity?.characters || []);

  // Budget narration against the 8.0s Veo ceiling: cap each scene at 12 words / 7.5s, splitting scenes rather than truncating
  budgetStudio1NarrationAgainstCap(manifest);

  for (const shot of manifest.shots) applyStudio1ShotPrompt(manifest, shot.id);
  if (manifest.continuity?.boundaries) {
    for (const boundary of manifest.continuity.boundaries) {
      boundary.expected.preserveIdentity = true;
      boundary.expected.preserveWardrobe = true;
      boundary.expected.preserveEnvironment = true;
      boundary.expected.preserveObjects = true;
    }
  }
  return manifest;
}

export async function planStudio1(input: PlanReelInput): Promise<ReelProductionManifest> {
  let scriptText = (input.scriptText || "").trim();
  let directorial: OmniDirectorialCompilation | undefined;

  if (!scriptText) {
    directorial = await compileOmniDirectorialPass({
      topic: input.topic,
      requestedDurationSec: input.requestedDurationSec || 30,
      tone: input.tone,
      creationIntent: input.creationIntent,
      aspectRatio: input.aspectRatio,
      genre: input.genre,
    });
    scriptText = directorial.masterScript;
  }
  return planStudio1Sync({ ...input, scriptText }, directorial);
}

export function isStudio1Manifest(manifest: ReelProductionManifest) {
  return manifest.id.startsWith("studio1_") && Boolean((manifest as any).studio1?.schemaVersion === 1);
}
