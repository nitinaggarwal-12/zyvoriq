import type { ReelShot } from "./types.ts";

export type ModelTier = "lite" | "fast" | "quality";

/**
 * Deterministic tracker state across visual shots in a reel.
 * Pure and immutable: decide() never mutates this state.
 */
export interface ScriptSupervisorState {
  /** Mapping of characterId -> shotId of the most recent shot featuring that character */
  lastShotByCharacter: Record<string, string>;
  /** The immediately preceding shot ID in chronological sequence */
  lastShotId?: string;
  /** The immediately preceding scene ID in chronological sequence */
  lastSceneId?: string;
  /** Registered canonical reference image URIs for each character (characterId -> URIs) */
  characterCanonicalUris: Record<string, string[]>;
  /** Recorded frame media per completed shot (shotId -> { lastFrameUrl, videoUrl }) */
  shotFrames: Record<string, { lastFrameUrl?: string; videoUrl?: string }>;
}

export type ContinuitySupervisorState = ScriptSupervisorState;

/**
 * Output of a deterministic continuity decision for a single shot.
 */
export interface ContinuityDecision {
  shotId: string;
  characterId: string | null;
  sceneId: string;
  tier: ModelTier;
  clauses: string[];
  canonicalReferenceUris: string[];
  temporalAnchorShotId: string | null;
  temporalAnchorUrl: string | null;
  sceneTransition: boolean;
  characterReturn: boolean;
  updatedState: ScriptSupervisorState;
}

/**
 * Creates an empty, clean initial ScriptSupervisorState.
 */
export function createInitialSupervisorState(
  characterCanonicalUris: Record<string, string[]> = {}
): ScriptSupervisorState {
  return {
    lastShotByCharacter: {},
    lastShotId: undefined,
    lastSceneId: undefined,
    characterCanonicalUris: { ...characterCanonicalUris },
    shotFrames: {},
  };
}

/**
 * Script Supervisor: Pure deterministic function.
 * Evaluates continuity rules for a given shot and tier against current state.
 *
 * CORE INVARIANT:
 * "A clause may only be emitted if the thing it references is actually attached."
 * - IDENTITY LOCK is ONLY emitted if canonicalReferenceUris is non-empty.
 * - TEMPORAL CONTINUITY is ONLY emitted if temporalAnchorUrl is non-null.
 */
export function decide(
  state: ScriptSupervisorState,
  shot: ReelShot,
  tier: ModelTier = "fast"
): ContinuityDecision {
  const shotId = shot.id;
  const charId = shot.continuityIn?.characterId || (shot as any).onCameraCharacterId || null;
  const sceneId = shot.sceneId || state.lastSceneId || "scene_01";
  const isNewScene = Boolean(state.lastSceneId && sceneId !== state.lastSceneId);

  // Character appearance classification
  const isFirstAppearance = Boolean(charId && !state.lastShotByCharacter[charId]);
  const isContiguousSameChar = Boolean(
    charId && state.lastShotId && state.lastShotByCharacter[charId] === state.lastShotId
  );
  const isReturnAfterAbsence = Boolean(
    charId && state.lastShotByCharacter[charId] && state.lastShotByCharacter[charId] !== state.lastShotId
  );

  // 1. Resolve canonical reference URIs
  const registeredUris = (charId && state.characterCanonicalUris[charId]) || [];
  const shotUris =
    (shot as any).canonicalReferenceImages ||
    (shot.continuityIn?.referenceFrameUrl ? [shot.continuityIn.referenceFrameUrl] : []);
  const availableUris = charId
    ? Array.from(new Set([...registeredUris, ...shotUris])).filter(Boolean)
    : [];

  const canonicalReferenceUris: string[] = charId ? [...availableUris] : [];

  // 2. Resolve temporal anchor frame
  let temporalAnchorShotId: string | null = null;
  let temporalAnchorUrl: string | null = null;

  // Temporal frame continuity allowed ONLY if:
  // - Same scene (!isNewScene)
  // - Contiguous shot of same character, OR both are landscape/no-person shots
  // - Tier is "quality" or "fast"
  // - Preceding shot has a verified, recorded lastFrameUrl
  const canUseTemporalFrame =
    !isNewScene &&
    tier !== "lite" &&
    state.lastShotId &&
    ((charId && isContiguousSameChar) || (!charId && !state.lastShotByCharacter[state.lastShotId || ""])) &&
    Boolean(state.shotFrames[state.lastShotId]?.lastFrameUrl);

  if (canUseTemporalFrame && state.lastShotId) {
    temporalAnchorShotId = state.lastShotId;
    temporalAnchorUrl = state.shotFrames[state.lastShotId].lastFrameUrl || null;
  }

  // 3. Assemble prompt clauses with strict attachment invariants
  const clauses: string[] = [];

  // Scene setting clauses
  if (isNewScene) {
    clauses.push(`SCENE TRANSITION [${sceneId}]: Cut to new scene location.`);
  }

  const envDesc = shot.continuityIn?.environment || (shot as any).sceneEnvironment;
  if (envDesc) {
    clauses.push(`VERBATIM SCENE SETTING [${sceneId}]: ${envDesc}`);
  }

  // Character vs Non-Person clauses
  if (!charId) {
    clauses.push(
      "SUBJECT RULE: Pure cinematic action, stunt, environment master, or object focus. NO talking presenters, NO direct-to-camera address."
    );
  } else {
    // INVARIANT 1: IDENTITY LOCK emitted ONLY if canonicalReferenceUris is physically attached
    if (canonicalReferenceUris.length > 0) {
      const charDesc = shot.continuityIn?.character ? ` (${shot.continuityIn.character})` : "";
      const wardrobeDesc = shot.continuityIn?.wardrobe ? ` Wardrobe: ${shot.continuityIn.wardrobe}.` : "";
      const eyelineDesc = shot.continuityIn?.eyeline ? ` Eyeline: ${shot.continuityIn.eyeline}.` : "";
      clauses.push(
        `IDENTITY LOCK [${charId}]: Authoritative canonical reference image applies to ${charId}${charDesc}.${wardrobeDesc}${eyelineDesc} Maintain identical facial features, hair, and actor identity.`
      );
    } else {
      const desc = shot.continuityIn?.character || "Performer with expressive features";
      clauses.push(
        `PERFORMER GUIDANCE [${charId}]: ${desc}. Preserve consistent physical description across shots.`
      );
    }

    // INVARIANT 2: TEMPORAL CONTINUITY emitted ONLY if temporalAnchorUrl is physically attached
    if (temporalAnchorUrl && temporalAnchorShotId) {
      clauses.push(
        `TEMPORAL CONTINUITY: Action flows continuously from preceding shot ${temporalAnchorShotId}. Align initial pose and camera motion to the attached reference frame.`
      );
    }

    // Character Return indicator
    if (isReturnAfterAbsence) {
      clauses.push(
        `CHARACTER RETURN [${charId}]: Character returns to screen after cutaway; re-anchor authoritative identity to canonical reference.`
      );
    }
  }

  // 4. Hard invariant validation: fail closed if any rule was violated
  const hasIdentityLockClause = clauses.some(c => c.includes("IDENTITY LOCK"));
  if (hasIdentityLockClause && canonicalReferenceUris.length === 0) {
    throw new Error(
      `INVARIANT_VIOLATION: IDENTITY LOCK clause emitted for character "${charId}" without attached canonicalReferenceUris`
    );
  }

  const hasTemporalClause = clauses.some(c => c.includes("TEMPORAL CONTINUITY"));
  if (hasTemporalClause && (!temporalAnchorUrl || !temporalAnchorShotId)) {
    throw new Error(
      `INVARIANT_VIOLATION: TEMPORAL CONTINUITY clause emitted without attached temporalAnchorUrl / temporalAnchorShotId`
    );
  }

  // 5. Construct updated state immutably
  const updatedLastShotByChar = { ...state.lastShotByCharacter };
  if (charId) {
    updatedLastShotByChar[charId] = shotId;
  }

  const updatedShotFrames = { ...state.shotFrames };
  if (shot.asset?.videoUrl) {
    updatedShotFrames[shotId] = {
      videoUrl: shot.asset.videoUrl,
      lastFrameUrl: state.shotFrames[shotId]?.lastFrameUrl,
    };
  }

  const updatedState: ScriptSupervisorState = {
    lastShotByCharacter: updatedLastShotByChar,
    lastShotId: shotId,
    lastSceneId: sceneId,
    characterCanonicalUris: { ...state.characterCanonicalUris },
    shotFrames: updatedShotFrames,
  };

  return {
    shotId,
    characterId: charId,
    sceneId,
    tier,
    clauses,
    canonicalReferenceUris,
    temporalAnchorShotId,
    temporalAnchorUrl,
    sceneTransition: isNewScene,
    characterReturn: isReturnAfterAbsence,
    updatedState,
  };
}
