import crypto from "node:crypto";
import { planReel, generateNarrationScriptWithGemini, mergeShortBeats, type PlanReelInput } from "../reel/planner.ts";
export { mergeShortBeats };
import { compileOmniDirectorialPass, type OmniDirectorialCompilation } from "../reel/omniDirector.ts";
import { verifyPromptPreFlight, sanitizeAndEnrichUserPrompt } from "../ai/promptVerifier.ts";
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
// Conversational speech in video generation / TTS averages ~2.1 words per second.
// Maximum editorial duration ceiling is 7.36s (8.0s Veo clip * 0.92 retime floor).
// At 2.1 wps, 15 words ~ 7.14s, which fits cleanly within the 7.36s Veo ceiling with zero clamp trim.
export const TARGET_SHOT_DURATION_SEC = 6.0;
export const WORDS_PER_SECOND = 2.1;
export const MAX_SHOT_DURATION_SEC = 7.36;
export const MAX_WORDS_PER_SHOT = 15;
export const MIN_WORDS_PER_SHOT = 13;

// 128 BPM Musical Bar Grid (4/4 time signature)
// 1 beat = 60 / 128 = 0.46875s
// 1 bar (4 beats) = 1.875s
// 2 bars = 3.75s
// 4 bars = 7.50s (fits Veo 8.0s bucket cleanly with factor 0.9375)
export const MUSICAL_BAR_GRID_BPM = 128;
export const SECONDS_PER_BEAT = 60 / MUSICAL_BAR_GRID_BPM; // 0.46875s
export const SECONDS_PER_BAR = SECONDS_PER_BEAT * 4;      // 1.875s

export function quantizeToMusicalBars(durationSec: number): number {
  const bars = Math.max(1, Math.round(durationSec / SECONDS_PER_BAR));
  return Number((bars * SECONDS_PER_BAR).toFixed(3));
}

export function wordsPerSecondForGenre(genre?: string): number {
  // Measured 2026-09-09: MUSIC_VIDEO produced 44 words / 20.64s = 2.13 wps —
  // identical to prose. Gemini TTS speaks lyrics at conversational pace; it
  // does not sing or hold notes, so there is no slower lyric cadence.
  return 2.1;
}

export function maxWordsPerShotForGenre(genre?: string): number {
  return 15;   // delete the MUSIC_VIDEO branch
}

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
  const genre = manifest.genre || manifest.creativeBible?.genre;
  const isMusicVideo = String(genre || "").toUpperCase() === "MUSIC_VIDEO";
  const wps = wordsPerSecondForGenre(genre);
  const maxWords = maxWordsPerShotForGenre(genre);
  const originalShots = manifest.shots;
  const newShots: ReelProductionManifest["shots"] = [];

  for (let i = 0; i < originalShots.length; i++) {
    const shot = originalShots[i];
    const script = shot.scriptText?.trim() || "";
    const cleanWords = stripSpeakerLabels(script).split(/\s+/).filter(Boolean);
    const wordCount = cleanWords.length;
    const estDurationSec = wordCount > 0 ? wordCount / wps : shot.editorialDurationSec;

    // In MUSIC_VIDEO genre: Quantize duration to 128 BPM musical bars (1 bar = 1.875s)
    if (isMusicVideo) {
      const targetDuration = quantizeToMusicalBars(shot.editorialDurationSec || estDurationSec || 6.0);
      shot.editorialDurationSec = Math.min(7.50, Math.max(SECONDS_PER_BAR, targetDuration));
    }

    // A shot needs splitting if its word count exceeds the genre carrying capacity (>10 words for lyrics, >15 for prose),
    // or if its editorial duration exceeds the 7.50s safe cap.
    const maxDur = isMusicVideo ? 7.50 : MAX_SHOT_DURATION_SEC;
    const needsSplit = (wordCount > maxWords || shot.editorialDurationSec > maxDur || estDurationSec > maxDur) && wordCount > 3;

    if (!needsSplit) {
      newShots.push({
        ...shot,
        editorialDurationSec: isMusicVideo ? quantizeToMusicalBars(shot.editorialDurationSec) : Math.min(MAX_SHOT_DURATION_SEC, Math.max(2.0, shot.editorialDurationSec)),
      });
      continue;
    }

    const units = splitScriptIntoBudgetedUnits(script, maxWords);
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
      const rawDur = isMusicVideo
        ? Math.max(SECONDS_PER_BAR, Math.min(7.50, quantizeToMusicalBars(shot.editorialDurationSec * ratio)))
        : Math.max(2.5, Math.min(MAX_SHOT_DURATION_SEC, Number((shot.editorialDurationSec * ratio).toFixed(2))));
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
    const lang = String(manifest.language || manifest.creationIntent?.narrationLanguage || "").toLowerCase();
    let langDirective = "";
    if (lang === "hinglish-roman" || lang === "hinglish") {
      langDirective = "AUDIO & DIALOGUE LANGUAGE: Hinglish (Hindi-English blend in Roman script). Native character dialogue, vocalizations and background calls must be in natural conversational Hinglish.";
    } else if (lang === "hi-devanagari" || lang === "hindi") {
      langDirective = "AUDIO & DIALOGUE LANGUAGE: Hindi (Devanagari). Native character dialogue, vocalizations and background calls must be in standard Hindi.";
    } else if (lang && lang !== "en") {
      langDirective = `AUDIO & DIALOGUE LANGUAGE: Native character dialogue and vocalizations must be in ${lang}.`;
    }

    const sceneSetting = (manifest.scenes && s.sceneId && manifest.scenes[s.sceneId]?.environment)
      ? `VERBATIM SCENE SETTING [${s.sceneId}]: ${manifest.scenes[s.sceneId].environment}. Preserve identical physical set architecture, geometry, materials, background elements, lighting direction and color temperature.`
      : "";

    const isMusicVideo = String(manifest.creativeBible?.genre || (manifest as any).genre || "").toUpperCase() === "MUSIC_VIDEO";
    let musicVideoLock = "";
    if (isMusicVideo) {
      const isHindiLang = lang === "hinglish-roman" || lang === "hinglish" || lang === "hi-devanagari" || lang === "hindi";
      const acousticStyle = isHindiLang
        ? "Contemporary South Asian pop dance song with bright high-register feminine vocal delivery, acoustic Dhol rhythm, deep club sub-bass, and celebratory festival drop."
        : "Contemporary pop dance anthem with bright feminine vocal delivery, energetic production, deep club sub-bass, driving modern drum rhythm, and celebratory festival drop.";

      const performanceLock = "MUSIC VIDEO PERFORMANCE & LIP-SYNC: The performer is actively singing/delivering vocal phrases on camera with visible mouth, lips, teeth, and facial articulation in precise sync. Face, lips, and mouth are completely illuminated and unobstructed. ZERO ON-SCREEN TEXT, NO SUBTITLES, NO CAPTIONS.";

      // Modular 5-Shot Directorial Matrix (Generic Descriptive Archetypes)
      if (idx === 0) {
        musicVideoLock = `${performanceLock} MUSIC VIDEO HERO INTRO: ${acousticStyle} Energetic slow-motion power catwalk forward toward camera with confident hip swagger and direct piercing eye contact. Staging: Two energetic live Dhol drummers in orange turbans and white kurtas flank the runway striking dhol drums in sync. Performer delivers confident musical vocals on camera with clear lip articulation. Lighting: Dramatic backlit silhouette cutting through volumetric haze, high-contrast cyan/magenta rim lighting. Dynamic speed ramp on downbeat. ACOUSTIC DIRECTIVE: Immediate 128.0 BPM acoustic Dhol downbeats and driving rhythm active from frame 0.000s under performance without delay. Negative: No camera metadata overlays, no camera model watermarks, clean raw sensor frame.`;
      } else if (idx === 1) {
        musicVideoLock = `${performanceLock} MUSIC VIDEO CHORUS DROP: ${acousticStyle} Symmetrical V-formation dance troupe on main festival stage. Lead performer and co-performer lead 6 backup dancers in sharp, synchronized rhythmic choreography and high-kick turns with metallic waist chain accents. Performer actively sings with mouth/lips/teeth in precise sync. Saturated magenta/cyan lasers slicing haze, cold-spark pyrotechnic geysers erupting on downbeats.`;
      } else if (idx === 2) {
        musicVideoLock = `${performanceLock} MUSIC VIDEO GLAMOUR BREAKDOWN: ${acousticStyle} High-fashion wet-down studio with mirror-black reflective floor flooded with water. Performer dances barefoot with silver ankle bells (ghungroos), executing rapid rhythmic pelvic and hip isolations and fluid torso rolls to the live Dhol solo. Water droplets splashing off heels in 120fps slow-motion, wind-machine hair, macro portrait angles.`;
      } else if (idx === 3) {
        musicVideoLock = `${performanceLock} MUSIC VIDEO FLOOR PROWL & SQUAD: ${acousticStyle} Wet-down reflective floor. Lead performer drops into a low athletic floor crouch, arched back, looking up with fierce gaze into the lens, before rising into a synchronized power squad catwalk with co-performer and female dancers. Dynamic speed-ramping snapping from slow-motion prowl to fast unison choreography.`;
      } else {
        musicVideoLock = `${performanceLock} MUSIC VIDEO GRAND FINALE: ${acousticStyle} Massive cultural festival spectacle. Entire festival crowd jumping in unison with ultraviolet glowsticks, golden marigold flower petal showers falling through spotlights, fireworks and cold sparks blasting. Lead performer executes a triumphant spin, looks directly into the camera lens, and throws her head back in a radiant, carefree laugh. Dynamic 360-degree orbital camera sweep.`;
      }
    }

    const basePrompt = s.visualIntent
      ? [
          sceneSetting,
          s.visualIntent,
          isMusicVideo
            ? "Visual beat: Dynamic dance performance and expressive musical delivery."
            : (s.scriptText ? `Visual beat: Character delivers monologue with authentic emotional expression.` : ""),
          `Tone: ${manifest.tone}.`,
          langDirective,
          manifest.creativeBible.visualStyle,
          manifest.creativeBible.cameraLanguage,
          musicVideoLock,
          "STRICT NEGATIVE CONSTRAINT: Zero generated text, no captions, no subtitles, no words, no logos, no typography anywhere in the frame."
        ].filter(Boolean).join(" ")
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
  const rawBase = meta.basePrompts[shot.id] || shot.generationPrompt;
  const base = rawBase
    .replace(/(?:STUDIO1\s+)?IDENTITY LOCK \[[^\]]+\]:[^.]*\.(?:[^.]*\.)*(?:\s*Maintain identical facial features and actor identity\.)?/gi, "")
    .replace(/STUDIO1 (?:SUBJECT RULE|ACTOR MODE):[^.]*\./gi, "")
    .replace(/STUDIO1 ENVIRONMENT (?:LOCK|MODE):[^.]*\.(?:[^.]*\.)*/gi, "")
    .replace(/STUDIO1 SEMANTIC ONSET LOCK:[^.]*\.(?:[^.]*\.)*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const mode = meta.subjectModes[shot.id] || "PRESENTER";
  const previous = shotIndex > 0 ? manifest.shots[shotIndex - 1] : null;
  shot.dependsOnShotIds = meta.environmentContinuity && previous ? [previous.id] : [];

  const environmentRule = meta.environmentContinuity
    ? (previous
        ? "STUDIO1 ENVIRONMENT LOCK: Treat the established location as one continuous physical set across clips. The previous-scene visual reference supplied by the worker is authoritative for the set. Preserve the same room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships. Change only the action/framing required by this shot. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change."
        : "STUDIO1 ENVIRONMENT LOCK: Establish the primary physical set for this scene. Preserve the room or location, background geometry, wall and floor materials, furniture placement, major props, lighting direction, color temperature, time-of-day and camera-side spatial relationships across all subsequent clips. Do not invent a living room, office, studio, outdoor location, electronics, tools, machinery, screens, desks, lab equipment, workshop activity, new furniture, or another new set unless the brief or this shot explicitly requires a location change.")
    : "STUDIO1 ENVIRONMENT MODE: Environment continuity is disabled for this experiment.";

  const isMusicVideo = manifest.genre === "MUSIC_VIDEO" || (manifest as any).creativeBible?.genre === "MUSIC_VIDEO";
  const semanticOnsetRule = [
    "STUDIO1 SEMANTIC ONSET LOCK: the very first rendered frame of this clip must already communicate the CURRENT scene's narration beat and visual objective.",
    "Do not spend the opening seconds establishing the room, waiting in a neutral pose, completing the previous scene's action, walking into position, revealing the subject later, or otherwise visually catching up to narration.",
    "Start with the relevant subject/action/state already underway at time 0.000 and develop it naturally through the clip.",
    shot.scriptText
      ? (isMusicVideo
          ? "Visual performance: Performer actively sings with rhythmic lip-sync, expressive open-mouth visemes, visible teeth, and energetic facial delivery. STRICT NEGATIVE CONSTRAINT: Zero generated text, no captions, no subtitles, no words on screen."
          : "Visual performance: Performer speaks naturally on camera with matching lip articulation. STRICT NEGATIVE CONSTRAINT: Zero generated text, no captions, no subtitles, no words on screen.")
      : "",
  ].filter(Boolean).join(" ");

  if (mode === "NO_PERSON" || !shot.continuityIn?.characterId) {
    delete shot.continuityIn.characterId;
    delete shot.continuityOut.characterId;
    shot.generationPrompt = [
      base,
      environmentRule,
      semanticOnsetRule,
      "STUDIO1 SUBJECT RULE: Pure cinematic action, stunt, environment master or object focus. NO talking presenters, NO direct-to-camera address. Preserve the established environment and visual language. ZERO TEXT, NO SUBTITLES."
    ].join(" ");
    return;
  }

  const charId = shot.continuityIn.characterId;
  const char = (manifest.continuity?.characters || []).find(c => c.id === charId);
  const purePhysicalDesc = char?.appearance?.face
    ? `${char.appearance.ageBand || "mid 20s"}, ${char.appearance.face}, ${char.appearance.hair}`
    : (char?.appearance?.description || "lead performer with expressive facial bone structure");
  const wardrobeDesc = char?.wardrobe ? (Array.isArray(char.wardrobe) ? char.wardrobe[0] : char.wardrobe) : "";

  shot.continuityIn.characterId = charId;
  shot.continuityOut.characterId = charId;

  shot.generationPrompt = [
    base,
    environmentRule,
    semanticOnsetRule,
    meta.presenterContinuity
      ? `STUDIO1 IDENTITY LOCK [${charId}]: The attached canonical character reference image is authoritative for this shot. Physical description: ${purePhysicalDesc}. Character continuity is mandatory: consistent face, age, skin tone, hair, body proportions, wardrobe and distinguishing features.${wardrobeDesc ? ` Mandatory Locked Wardrobe: ${wardrobeDesc}.` : ""} Eyeline: ${shot.continuityIn.eyeline || "conversational off-camera"}. STRICT NEGATIVE CONSTRAINT: Zero text in scene pixels, no captions, no subtitles, no watermarks, no typography.`
      : "STUDIO1 CHARACTER MODE: Canonical identity anchoring is disabled for this experiment."
  ].join(" ");
}

export function planStudio1Sync(input: PlanReelInput, directorial?: OmniDirectorialCompilation): ReelProductionManifest {
  const manifest = planReel(input, directorial);
  manifest.id = `studio1_${crypto.randomUUID()}`;
  manifest.status = "SCRIPT_READY";
  if (directorial?.genre) {
    manifest.genre = directorial.genre;
  } else if (input.genre) {
    manifest.genre = input.genre;
  }

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

  const isMusicVideo = String(manifest.creativeBible?.genre || (manifest as any).genre || "").toUpperCase() === "MUSIC_VIDEO";
  manifest.omniLedger = manifest.omniLedger || [];
  manifest.omniLedger.push({
    checkpoint: "PREFLIGHT_DIRECTORIAL_APPROVAL",
    timestamp: new Date().toISOString(),
    approvedBy: "Omni-Executive-Producer-Directorial-Engine",
    telemetry: {
      genre: manifest.genre || manifest.creativeBible?.genre,
      plannedDurationSec: manifest.plannedDurationSec,
      shotCount: manifest.shots.length,
      musicalGridBPM: isMusicVideo ? 128.0 : undefined,
      barDurationSec: isMusicVideo ? 1.875 : undefined,
      leadArchetypes: isMusicVideo ? ["Shakira", "Jennifer Lopez", "Michael Jackson", "Taylor Swift", "Kriti Sanon", "Nora Fatehi"] : undefined,
      stagingPlan: isMusicVideo ? "Dual Live Punjabi Dhol Drummers on stage + Symmetrical V-Formation Troupe + Wet-Down Studio" : undefined,
      audioStrategy: isMusicVideo ? "dual-stem-crossover-native-vocals-plus-lyria-dhol-master" : "native-speech-foley"
    },
    verdict: "APPROVED_FOR_PRODUCTION"
  });

  return manifest;
}

export function extractDurationFromPrompt(text: string): number | null {
  if (!text) return null;
  const clean = text.trim();
  const minMatch = clean.match(/\b(?:(\d+)|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:-| )?\s*(?:min|minute|minutes|m)\b/i);
  if (minMatch) {
    const wordOrNum = minMatch[1] || minMatch[0].split(/[\s-]+/)[0].toLowerCase();
    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    const mins = minMatch[1] ? parseInt(minMatch[1], 10) : (wordMap[wordOrNum] || 0);
    if (mins > 0 && mins <= 10) {
      return mins * 60;
    }
  }
  const secMatch = clean.match(/\b(\d+)\s*(?:-| )?\s*(?:sec|second|seconds|s)\b/i);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    if (secs >= 10 && secs <= 600) {
      return secs;
    }
  }
  return null;
}

export async function planStudio1(input: PlanReelInput): Promise<ReelProductionManifest> {
  // Step 0: Root User Prompt Sanitization & Semantic De-Risking
  const promptCheck = await sanitizeAndEnrichUserPrompt(input.topic, { genre: input.genre });
  if (promptCheck.wasRewritten) {
    console.log(`[planner] Sanitized root user prompt at Step 0: reasons=${promptCheck.reasons.join(", ")}`);
    input.topic = promptCheck.sanitizedTopic;
  }

  let scriptText = (input.scriptText || "").trim();
  let directorial: OmniDirectorialCompilation | undefined;

  const rawDuration = input.requestedDurationSec || 0;
  const naturalDuration = extractDurationFromPrompt(input.topic);
  const effectiveDuration = rawDuration > 0
    ? (rawDuration === 30 && naturalDuration ? naturalDuration : rawDuration)
    : (naturalDuration || 30);

  if (!scriptText) {
    directorial = await compileOmniDirectorialPass({
      topic: input.topic,
      requestedDurationSec: effectiveDuration,
      tone: input.tone,
      creationIntent: input.creationIntent,
      aspectRatio: input.aspectRatio,
      genre: input.genre,
      language: input.language,
      continuationFrom: input.continuationFrom,
    });
    scriptText = directorial.masterScript;
  }
  const manifest = planStudio1Sync({ ...input, requestedDurationSec: effectiveDuration, scriptText }, directorial);
  if (input.continuationFrom?.parentProductionId) {
    (manifest as any).parentProductionId = input.continuationFrom.parentProductionId;
    (manifest as any).continuationPart = 2;
    if ((manifest as any).studio1) {
      (manifest as any).studio1.parentProductionId = input.continuationFrom.parentProductionId;
      (manifest as any).studio1.continuationPart = 2;
    }
  }
  // Pre-flight prompt verification & auto-correction gate
  try {
    const genre = manifest.genre || manifest.creativeBible?.genre || input.genre;
    const meta = (manifest as any).studio1;
    await Promise.all(manifest.shots.map(async (shot) => {
      if (shot.generationPrompt) {
        const allChars = manifest.continuity?.characters || (manifest as any).characters || [];
        const charName = allChars.find((c: any) => c.id === shot.continuityIn?.characterId)?.name;
        const verification = await verifyPromptPreFlight(shot.generationPrompt, { genre, characterName: charName });
        if (verification.wasRewritten) {
          console.log(`[prompt-verifier] Pre-flight healed shot ${shot.id} prompt: ${verification.reasons.join(", ")}`);
          shot.generationPrompt = verification.verifiedPrompt;
          if (meta?.basePrompts && meta.basePrompts[shot.id]) {
            meta.basePrompts[shot.id] = verification.verifiedPrompt;
          }
        }
      }
    }));
  } catch (err) {
    console.warn(`[prompt-verifier] Non-fatal pre-flight verification warning:`, err);
  }

  return manifest;
}

export function isStudio1Manifest(manifest: ReelProductionManifest) {
  return manifest.id.startsWith("studio1_") && Boolean((manifest as any).studio1?.schemaVersion === 1);
}
