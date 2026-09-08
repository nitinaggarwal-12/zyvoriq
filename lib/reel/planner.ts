import crypto from "node:crypto";
import type { BoundaryStrategy, QualityGateId, ReelCreationIntent, ReelProductionManifest, ReelShot, TransitionType } from "./types.ts";
import { compileDeterministicDirectorialPass, compileOmniDirectorialPass, type OmniDirectorialCompilation, type OmniGenre } from "./omniDirector.ts";

export interface PlanReelInput {
  topic: string;
  tone?: string;
  platform?: ReelProductionManifest["platform"];
  requestedDurationSec?: number;
  scriptText?: string;
  creationIntent?: ReelCreationIntent;
  aspectRatio?: "9:16" | "16:9" | "2.39:1";
  genre?: OmniGenre;
}

const clock = (n: number) => Number(n.toFixed(6));
const clampDuration = (n: number) => Math.max(8, Math.min(180, clock(n)));
const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const normalizeSpaces = (value: string) => value.trim().replace(/\s+/g, " ");

// Narration budgeting and shot duration constants
export const TARGET_SHOT_DURATION_SEC = 6.0;
export const MAX_SHOT_DURATION_SEC = 7.5;
export const MAX_WORDS_PER_SHOT = 12;
export const WORDS_PER_SECOND = 1.65;

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

export async function generateNarrationScriptWithGemini(
  topic: string,
  targetDurationSec: number = 30,
  tone: string = "Confident & conversational",
  intent?: ReelCreationIntent
): Promise<string> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const targetShots = Math.max(2, Math.min(30, Math.round(targetDurationSec / TARGET_SHOT_DURATION_SEC)));

  if (!key) {
    throw new Error(
      "NARRATION_PRECONDITION_FAILED: Missing GEMINI_API_KEY or GOOGLE_API_KEY for dynamic narration script generation. Silent canned filler fallback is forbidden."
    );
  }

  const isCinema = targetDurationSec >= 90;
  const systemPrompt = isCinema
    ? `You are an elite theatrical cinema director and master screenwriter directing an epic 5-Act cinematic short film.
Topic: "${topic}"
Tone: "${tone}"
Target Duration: ${targetDurationSec} seconds across 5 dramatic acts (${targetShots} continuous visual shots total).

RULES & HARD BUDGET:
1. Output exactly ${targetShots} short, dramatic spoken lines or scene narrative beats, one per visual shot (spread across 5 dramatic acts).
2. STRICT BUDGET: Each line MUST be between 5 and ${MAX_WORDS_PER_SHOT} words maximum. Never exceed ${MAX_WORDS_PER_SHOT} words per line.
3. Authentic cinema: write impactful cinematic dialogue and narrative lines worthy of a theatrical masterpiece. Avoid corporate filler, canned clichés, or generic platitudes (NEVER say "Here is what deserves a closer look", "The obvious reaction is only the surface", "Experience the true atmosphere", "Every detail reveals another layer", "Notice the energy moving naturally", "Pure immersion, captured from start to finish", etc.).
4. Focus directly and immersively on the subject: "${topic}".
5. If character names or dialogue are implied, format with clean character markers (e.g. "NAPOLEON: ...", "JOSEPHINE: ...").
6. Output format: Return a raw JSON array of strings containing exactly ${targetShots} lines:
["Line 1", "Line 2", ...]`
    : `You are an elite short-form video director and social reel scriptwriter.
Write an authentic, punchy voiceover script for a 9:16 vertical video reel.
Topic: "${topic}"
Tone: "${tone}"
Target Duration: ${targetDurationSec} seconds.

RULES & HARD BUDGET:
1. Output exactly ${targetShots} short spoken lines, one per visual shot.
2. STRICT BUDGET: Each line MUST be between 5 and ${MAX_WORDS_PER_SHOT} words maximum. Never exceed ${MAX_WORDS_PER_SHOT} words per line.
3. Natural creator narration: write words a real creator would say aloud. Avoid robotic corporate filler, canned clichés, or generic platitudes (NEVER say "Here is what deserves a closer look", "The obvious reaction is only the surface", "Experience the true atmosphere", "Every detail reveals another layer", "Notice the energy moving naturally", "Pure immersion, captured from start to finish", etc.).
4. Focus directly and immersively on the subject: "${topic}".
5. If character names or dialogue are implied, format with clean character markers or narrative speech.
6. Output format: Return a raw JSON array of strings containing exactly ${targetShots} lines:
["Line 1", "Line 2", ...]`;

  const primaryModel = process.env.GEMINI_SCRIPT_MODEL || "gemini-3.7-flash";
  const candidateModels = primaryModel === "gemini-2.5-flash" ? ["gemini-2.5-flash"] : [primaryModel, "gemini-2.5-flash"];

  let lastError: Error | null = null;
  let rawText = "";

  for (const model of candidateModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          }
        })
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        console.warn(`[planner] Script generation with ${model} returned ${res.status}: ${errorBody.slice(0, 200)}`);
        lastError = new Error(`Gemini API script generation with ${model} failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (rawText) break;
    } catch (err: any) {
      console.warn(`[planner] Script generation with ${model} threw: ${err?.message || err}`);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!rawText) {
    throw new Error(
      `NARRATION_PRECONDITION_FAILED: Failed to generate narration script via Gemini (${lastError?.message || "empty response"}). Silent canned filler fallback is forbidden.`
    );
  }

  let lines: string[] = [];
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) {
      lines = parsed.map(s => String(s).trim()).filter(Boolean);
    } else if (parsed && Array.isArray(parsed.lines)) {
      lines = parsed.lines.map((s: any) => String(s).trim()).filter(Boolean);
    }
  } catch {
    lines = rawText.split(/\r?\n/).map((l: string) => l.replace(/^[-*0-9.]+\s*/, "").trim()).filter(Boolean);
  }

  if (!lines.length) {
    throw new Error("NARRATION_PRECONDITION_FAILED: Gemini API returned zero valid script lines. Silent canned filler fallback is forbidden.");
  }

  // Ensure each line obeys word limits
  const budgeted = lines.map(line => {
    const cleaned = line.replace(/^["']|["']$/g, "").trim();
    return splitLongUnit(cleaned, MAX_WORDS_PER_SHOT).join(" ");
  });

  return budgeted.join(" ");
}

function sentenceUnits(script: string) {
  const lines = script.split(/\r?\n/).map(normalizeSpaces).filter(Boolean);
  const units: string[] = [];
  for (const line of lines) {
    const sents = (line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line])
      .map(normalizeSpaces)
      .filter(Boolean);
    units.push(...sents);
  }
  return units;
}

function splitLongUnit(unit: string, maxWords: number): string[] {
  if (countWords(unit) <= maxWords) return [unit];
  const words = unit.split(/\s+/);
  const out: string[] = [];
  let start = 0;
  const semanticBreak = /^(?:and|but|so|then|because|while|when|before|after|instead|which|that)$/i;

  while (words.length - start > maxWords) {
    const hardEnd = Math.min(words.length, start + maxWords);
    const softStart = Math.min(hardEnd - 1, start + Math.max(5, maxWords - 4));
    let splitAt = -1;
    for (let i = hardEnd - 1; i >= softStart; i--) {
      if (/[,:;—-]$/.test(words[i])) { splitAt = i + 1; break; }
      if (semanticBreak.test(words[i]) && i > start + 4) { splitAt = i; break; }
    }
    if (splitAt <= start) splitAt = hardEnd;
    out.push(words.slice(start, splitAt).join(" "));
    start = splitAt;
  }
  if (start < words.length) out.push(words.slice(start).join(" "));
  return out.filter(Boolean);
}

function splitIntoEditorialBeats(script: string, targetSec: number): string[] {
  if (!script.trim()) return [];
  const totalWords = countWords(script);
  // Veo clips are limited to 4s, 6s, 8s buckets.
  // Maximum editorial duration ceiling is 7.5s (MAX_SHOT_DURATION_SEC) to leave headroom below Veo's 8.0s hard cap.
  // At ~1.65 words/sec delivery cadence, each beat has max MAX_WORDS_PER_SHOT (12 words) to stay under ~7.2s,
  // guaranteeing beats fit cleanly into Veo's bucket with zero clamp trim or duration overrun.
  const desiredShotCount = Math.max(2, Math.ceil(targetSec / TARGET_SHOT_DURATION_SEC), Math.ceil(totalWords / MAX_WORDS_PER_SHOT));
  const targetWordsPerShot = Math.max(5, Math.min(MAX_WORDS_PER_SHOT, Math.round(totalWords / desiredShotCount)));
  const maxWordsPerShot = MAX_WORDS_PER_SHOT;
  const units = sentenceUnits(script).flatMap(unit => splitLongUnit(unit, maxWordsPerShot));
  const beats: string[] = [];
  let current = "";

  for (const unit of units) {
    // If unit starts with a new speaker marker (e.g. "NAME:"), flush previous beat to create a clean cut
    const isNewSpeaker = /^[A-Z0-9_\-\s]{2,20}:/i.test(unit) && current;
    const proposed = current ? `${current} ${unit}` : unit;
    if (isNewSpeaker || (current && (countWords(proposed) > maxWordsPerShot || countWords(current) >= targetWordsPerShot))) {
      beats.push(current);
      current = unit;
    } else {
      current = proposed;
    }
  }
  if (current) beats.push(current);

  if (beats.length === 1 && desiredShotCount > 1 && countWords(beats[0]) > 7) {
    return splitLongUnit(beats[0], Math.ceil(countWords(beats[0]) / 2));
  }

  // Ensure no shot duration exceeds MAX_SHOT_DURATION_SEC (7.5s)
  while (targetSec / beats.length > MAX_SHOT_DURATION_SEC) {
    let maxIdx = 0;
    for (let j = 1; j < beats.length; j++) {
      if (countWords(beats[j]) > countWords(beats[maxIdx])) maxIdx = j;
    }
    const targetBeat = beats[maxIdx];
    const words = targetBeat.split(/\s+/);
    if (words.length <= 1) break;
    const mid = Math.ceil(words.length / 2);
    const firstHalf = words.slice(0, mid).join(" ");
    const secondHalf = words.slice(mid).join(" ");
    beats.splice(maxIdx, 1, firstHalf, secondHalf);
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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeZoneProfile(platform: ReelProductionManifest["platform"]): "instagram-reels" | "youtube-shorts" | "tiktok" {
  if (platform === "YouTube Shorts") return "youtube-shorts";
  if (platform === "TikTok") return "tiktok";
  return "instagram-reels";
}

export function planReel(input: PlanReelInput, directorial?: OmniDirectorialCompilation): ReelProductionManifest {
  const requestedDurationSec = clampDuration(input.requestedDurationSec || 30);
  const topic = input.topic.trim() || "your topic";
  const tone = input.tone || "Confident & conversational";
  const platform = input.platform || "Instagram Reels";
  const creationIntent = input.creationIntent;
  const isCinema = requestedDurationSec >= 90 || platform === "YouTube Shorts";
  const aspectRatio: "9:16" | "16:9" | "2.39:1" = input.aspectRatio || (isCinema ? "2.39:1" : "9:16");
  const masterScript = (input.scriptText || directorial?.masterScript || input.creationIntent?.conceptSpeechSample || "").trim();
  if (!masterScript) {
    throw new Error(
      "NARRATION_PRECONDITION_FAILED: Non-empty scriptText is required to plan a reel manifest synchronously. In async creation pipelines, use planStudio1() or planReelAsync() to dynamically synthesize the script via Gemini before calling synchronous planning."
    );
  }
  const dir = directorial || compileDeterministicDirectorialPass(topic, masterScript, requestedDurationSec, creationIntent, input.genre, aspectRatio);
  const beats = splitIntoEditorialBeats(masterScript, requestedDurationSec);

  // Map of unique scenes: sceneId -> verbatim unvarying environment string across all contiguous shots
  const sceneEnvironments: Record<string, string> = {};
  for (let sIdx = 0; sIdx < beats.length; sIdx++) {
    const sId = dir.shots[sIdx]?.sceneId || `scene_${String(Math.floor(sIdx / 4) + 1).padStart(2, "0")}`;
    if (!sceneEnvironments[sId]) {
      sceneEnvironments[sId] = dir.shots[sIdx]?.sceneEnvironment || dir.shots[0]?.sceneEnvironment || topic;
    }
  }

  const charactersList = dir.cast.map(c => ({
    id: c.id,
    role: c.role === "lead" ? ("character" as const) : c.role === "narrator" ? ("presenter" as const) : ("supporting" as const),
    canonicalReferenceImages: [] as string[],
    appearance: {
      description: `${c.name}, ${c.biometricDNA.ageBand}. ${c.biometricDNA.facialFeatures}, ${c.biometricDNA.hair}.`,
      face: c.biometricDNA.facialFeatures,
      hair: c.biometricDNA.hair,
      ageBand: c.biometricDNA.ageBand,
    },
    wardrobe: [c.wardrobe.costume + (c.wardrobe.accessories ? `, ${c.wardrobe.accessories}` : "")],
    accessories: c.wardrobe.accessories ? [c.wardrobe.accessories] : [],
    voiceProfile: c.voiceProfile,
    gestureStyle: dir.genre === "DOCUMENTARY_EXPLAINER" ? "Natural conversational emphasis; avoid repetitive synthetic gestures." : "Cinematic dramatic presence; natural physical weight.",
    gazeStyle: dir.genre === "DOCUMENTARY_EXPLAINER" ? "Maintain camera eyeline for direct-address presenter beats." : "Conversational off-camera eyelines; do NOT look into camera lens.",
    emotionalRange: ["focused", "intense", "commanding", "calculating", "reflective"]
  }));

  // Harmonize optics and framing with manifest's requested aspectRatio to avoid contradictory camera instructions
  let cleanOptics = dir.visualStyle.optics || "";
  if (aspectRatio === "9:16") {
    cleanOptics = cleanOptics
      .replace(/\b(?:2\.39:1|16:9)\s*(?:aspect\s*ratio|framing|anamorphic)?\b/gi, "9:16 vertical framing")
      .replace(/\bAnamorphic 2\.39:1\b/gi, "Spherical 9:16")
      .replace(/\bCooke Anamorphic 2\.39:1 framing\b/gi, "35mm & 50mm spherical primes with 9:16 vertical framing");
  } else if (aspectRatio === "16:9") {
    cleanOptics = cleanOptics
      .replace(/\b(?:2\.39:1|9:16)\s*(?:aspect\s*ratio|framing|anamorphic)?\b/gi, "16:9 widescreen framing")
      .replace(/\bAnamorphic 2\.39:1\b/gi, "16:9 widescreen")
      .replace(/\bCooke Anamorphic 2\.39:1 framing\b/gi, "35mm & 50mm spherical primes with 16:9 widescreen framing");
  } else if (aspectRatio === "2.39:1") {
    cleanOptics = cleanOptics
      .replace(/\b(?:9:16|16:9)\s*(?:aspect\s*ratio|framing)?\b/gi, "2.39:1 Anamorphic cinema framing");
  }

  const cinemaFramingClause = aspectRatio === "2.39:1"
    ? "Cooke Anamorphic 2.39:1 framing"
    : aspectRatio === "16:9"
    ? "16:9 widescreen framing"
    : "9:16 vertical composition";

  const selectedVisualStyle = creationIntent?.visualStyleDescription
    ? `${creationIntent.visualStyleLabel || creationIntent.visualStyleId}: ${creationIntent.visualStyleDescription}. Preserve ${aspectRatio === "9:16" ? "social-first" : "cinematic"} readability and do not render text in scene pixels.`
    : isCinema
    ? `Theatrical 4K cinematic realism; ${cinemaFramingClause}; 24fps motion cadence; ACES 1.3 color grading; zero generated text in scene pixels.`
    : `${cleanOptics}; ${dir.visualStyle.lightingPalette}; ${dir.visualStyle.atmosphere}. Zero generated text in scene pixels.`;

  const selectedCharacter = charactersList.map(c => `${c.id}: ${c.appearance.description}`).join(" | ");
  const selectedEnvironment = dir.shots[0]?.sceneEnvironment || topic;

  const bible = {
    genre: dir.genre,
    visualStyle: selectedVisualStyle,
    characterLock: selectedCharacter,
    wardrobeLock: charactersList.map(c => `${c.id}: ${c.wardrobe.join(", ")}`).join(" | "),
    environmentLock: selectedEnvironment,
    cameraLanguage: aspectRatio === "2.39:1"
      ? "2.39:1 Anamorphic cinema framing; deliberate mix of grand cinematic master shots, medium character two-shots and intimate close-ups; 24fps film motion."
      : aspectRatio === "16:9"
      ? "16:9 widescreen cinema framing; deliberate mix of wide landscape compositions, medium action shots and tight character close-ups."
      : "9:16 social framing; deliberate mix of tight presenter shots, medium action shots and relevant b-roll; preserve eyeline and screen direction across contiguous action.",
    colorLanguage: dir.visualStyle.lightingPalette
  };

  const categoryDirection = [
    creationIntent?.categoryLabel ? `Content category: ${creationIntent.categoryLabel}.` : "",
    creationIntent?.conceptTitle ? `Selected concept: ${creationIntent.conceptTitle}.` : "",
    creationIntent?.conceptHook ? `Creative hook: ${creationIntent.conceptHook}.` : "",
  ].filter(Boolean).join(" ");

  let cursor = 0;
  const maxEditorialSec = MAX_SHOT_DURATION_SEC;
  const shots: ReelShot[] = beats.map((beat, i) => {
    const remaining = clock(requestedDurationSec - cursor);
    const remainingShots = beats.length - i;
    const rawDur = i === beats.length - 1 ? remaining : clock(remaining / remainingShots);
    const editorialDurationSec = clock(Math.min(maxEditorialSec, Math.max(1.5, rawDur)));
    if (editorialDurationSec > 8.0) {
      throw new Error(`Planner invariant failed: shot ${i + 1} duration ${editorialDurationSec}s exceeds 8.0s Veo ceiling`);
    }
    const generationDurationSec = chooseGenerationDuration(editorialDurationSec);

    const dirShot = dir.shots[i];
    const onCameraCharId = dirShot ? dirShot.onCameraCharacterId : (dir.genre === "DOCUMENTARY_EXPLAINER" ? "character_presenter" : dir.cast[0]?.id || null);
    const onCameraChar = onCameraCharId ? charactersList.find(c => c.id === onCameraCharId) : null;
    const onCameraCast = onCameraCharId ? dir.cast.find(c => c.id === onCameraCharId) : null;
    const eyeline = dirShot?.eyeline || (dir.genre === "DOCUMENTARY_EXPLAINER" ? "camera" : "screen_right");
    const shotGrammar = dirShot?.shotGrammar || "HERO_CLOSE_UP";
    const rawVisualAction = dirShot?.visualAction || `Visual beat for ${beat || topic}`;
    const cameraMotion = dirShot?.cameraMotion || bible.cameraLanguage;

    // Substitute character names with generic performer archetypes before building the prompt
    const subjectLabel = onCameraCast?.role === "antagonist" ? "the antagonist" : (onCameraChar?.role === "presenter" ? "the presenter" : "the lead performer");
    let safeAction = rawVisualAction;
    for (const member of dir.cast) {
      const label = member.id === onCameraCharId ? subjectLabel : (member.role === "antagonist" ? "the antagonist" : "the secondary performer");
      if (member.name) {
        safeAction = safeAction.replace(new RegExp(`\\b${escapeRegex(member.name)}\\b`, "gi"), label);
      }
      const slugName = member.id.replace(/_/g, " ");
      safeAction = safeAction.replace(new RegExp(`\\b${escapeRegex(slugName)}\\b`, "gi"), label);
    }

    const previousAction = i === 0
      ? (onCameraChar ? `${subjectLabel} is in position.` : "Establishing composition.")
      : `Continue naturally from shot ${i}.`;

    const actionOut = i === beats.length - 1
      ? "Finish with a confident readable hold."
      : `Complete the dramatic action before cut; Shot ${i + 2} continues naturally.`;

    const visualIntent = `${shotGrammar}: ${safeAction}. Eyeline: ${eyeline}. Camera: ${cameraMotion}.`;
    const emotion = { emotion: i === beats.length - 1 ? "confident" : i === 0 ? "curious" : "engaged", intensity: i === 0 ? 0.65 : 0.55, gestureEnergy: 0.4 };

    const sceneId = dirShot?.sceneId || `scene_${String(Math.floor(i / 4) + 1).padStart(2, "0")}`;
    const sceneEnvironment = sceneEnvironments[sceneId] || bible.environmentLock;

    const purePhysicalDesc = onCameraCast
      ? `${onCameraCast.biometricDNA.ageBand}, ${onCameraCast.biometricDNA.facialFeatures}, ${onCameraCast.biometricDNA.hair}`
      : (onCameraChar?.appearance?.face ? `${onCameraChar.appearance.face}, ${onCameraChar.appearance.hair}` : "lead performer with expressive eyes");

    const identityLockClause = onCameraCharId
      ? `IDENTITY LOCK [${onCameraCharId}]: Authoritative canonical reference sheet applies to ${subjectLabel} (${purePhysicalDesc}). Wardrobe: ${onCameraChar?.wardrobe?.[0] || "Era-appropriate costume"}. Eyeline: ${eyeline}. Maintain identical facial features and actor identity.`
      : "SUBJECT RULE: Pure cinematic action, stunt, environment master, or object focus. NO talking presenters, NO direct-to-camera address.";

    const continuityIn: any = {
      character: purePhysicalDesc,
      characterId: onCameraCharId || undefined,
      wardrobe: onCameraChar?.wardrobe?.[0],
      environment: sceneEnvironment,
      environmentId: sceneId,
      lighting: bible.colorLanguage,
      action: previousAction,
      camera: cameraMotion,
      eyeline,
      emotion
    };
    const continuityOut = { ...continuityIn, action: actionOut };
    const narrative = beat || `Visual continuation for ${topic}; support the surrounding narration without introducing a new claim.`;

    const promptParts = [
      `GENRE: ${dir.genre}.`,
      `VERBATIM SCENE SETTING [${sceneId}]: ${sceneEnvironment}. Preserve identical physical set architecture, geometry, materials, background elements, lighting direction and color temperature.`,
      identityLockClause,
      `SCENE ACTION: ${safeAction}.`,
      categoryDirection,
      `Narrative beat: ${narrative}.`,
      `Tone: ${tone}.`,
      bible.visualStyle,
      bible.cameraLanguage,
      `Continuity start: ${previousAction}`,
      `Continuity end: ${actionOut}`,
      `Emotional state: ${emotion.emotion} at intensity ${emotion.intensity}.`,
      "Do not render captions, subtitles, logos or UI text inside the generated video; those are composited later."
    ];

    const shot: ReelShot = {
      id: `shot_${String(i + 1).padStart(2, "0")}`,
      sceneId,
      order: i + 1,
      editorialStartSec: clock(cursor),
      editorialDurationSec,
      generationDurationSec,
      trimInSec: 0,
      trimOutSec: editorialDurationSec,
      scriptText: beat,
      visualIntent,
      generationPrompt: promptParts.filter(Boolean).join(" "),
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
    aspectRatio,
    requestedDurationSec,
    plannedDurationSec: clock(cursor),
    topic,
    tone,
    creationIntent,
    masterScript,
    creativeBible: bible,
    audio: { masterClock: isCinema ? "music" : "narration", timingSource: "pending" },
    captions: { timingSource: "draft", cues: draftCaptionCues, safeZoneProfile: safeZoneProfile(platform) },
    continuity: {
      characters: charactersList,
      environments: Object.entries(sceneEnvironments).map(([sId, envDesc]) => ({
        id: sId,
        description: envDesc,
        palette: bible.colorLanguage,
        keyObjects: [],
        cameraAxis: bible.cameraLanguage
      })),
      performanceTracks: charactersList.map(char => ({
        id: `performance_${char.id}`,
        characterId: char.id,
        audioTrack: "master-narration" as const,
        mode: "persistent-performer" as const,
        cues: shots.filter(s => s.continuityIn.characterId === char.id).map(s => ({
          startSec: s.editorialStartSec,
          endSec: clock(s.editorialStartSec + s.editorialDurationSec),
          emotion: s.continuityIn.emotion || { emotion: "engaged", intensity: 0.5 },
          gaze: (s.continuityIn.eyeline?.includes("left") ? "off-camera-left" : s.continuityIn.eyeline?.includes("right") ? "off-camera-right" : s.continuityIn.eyeline === "camera" ? "camera" : "free") as any,
          gesture: s.continuityOut.action,
          speakingEnergy: s.continuityIn.emotion?.intensity || 0.5
        }))
      })),
      boundaries,
      objectStateGraph: Object.fromEntries(shots.map(s => [s.id, s.continuityIn.objectStates || []]))
    },
    scenes: Object.fromEntries(Object.entries(sceneEnvironments).map(([sId, env]) => [sId, { id: sId, environment: env }])),
    musicPlan: {
      sections: [{
        startSec: 0,
        endSec: clock(cursor),
        intent: isCinema
          ? "5-Act Symphonic Orchestral masterwork bed (Beethoven Op. 92 allegretto movements), continuous across visual cuts, mastered to -24.0 LUFS EBU R128."
          : creationIntent?.musicPreset
          ? `Continuous supportive underscore. Planning direction: ${creationIntent.musicPreset}.`
          : "Continuous supportive underscore following the narrative arc.",
        energy: 0.45
      }],
      continuousAcrossVisualCuts: true,
      duckUnderSpeech: true
    },
    shots,
    qa: { minimumReadyScore: 90, passed: false, gates: initialGates(), warnings: ["Narration waveform alignment, generated media inspection, lip-sync verification, boundary QA and final master QA are pending."], failures: [] }
  };
}

export async function planReelAsync(input: PlanReelInput): Promise<ReelProductionManifest> {
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
  return planReel({ ...input, scriptText }, directorial);
}
