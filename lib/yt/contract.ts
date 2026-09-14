/**
 * YT PIPELINE — CANONICAL STAGE CONTRACT
 * ======================================
 * The ordering below is the whole point of this pipeline, so it is encoded as
 * data and enforced by a guard rather than left to the call order of whoever
 * happens to be editing the orchestrator.
 *
 * Why this exists: the pre-existing studio1 path calls Lyria from INSIDE
 * renderRough(), i.e. after every frame of video already exists. That makes it
 * structurally impossible to cut picture to the beat, because the beat is not
 * known until the picture is finished. YT inverts that: the song is stage 2,
 * and the shot grid is derived from its MEASURED tempo in stage 3.
 */

export const YT_STAGES = [
  "OMNI_DIRECTION",   // 1. Omni 1.1 - the single creative authority
  "LYRIA_SONG",       // 2. song/score FIRST, from Omni's lyrics
  "TEMPO_MEASURE",    // 3. deterministic: measure what Lyria actually produced
  "ANCHOR_PLATE",     // 4. Flash image - canonical character anchor
  "VEO_SHOTS",        // 5. Veo, conditioned on the anchor, cut to the beat
  "MASTER_MUX",       // 6. ffmpeg - assembly (no model)
  "OMNI_SYNC_AUDIT",  // 7. Omni 1.1 watches the cut - BLOCKING
] as const;

export type YtStage = (typeof YT_STAGES)[number];

/**
 * Model attribution. Every entry here must name a model that is PHYSICALLY
 * invoked at that stage. Stages executed by plain code say so explicitly -
 * dressing ffmpeg up as a model is the exact dishonesty this table prevents.
 *
 * Model ids are fully qualified ("models/...") without exception. Mixing bare
 * and qualified ids here produced a live 404 at ANCHOR_PLATE, because one URL
 * template interpolated the value directly while another prepended "models/".
 */
export const YT_STAGE_EXECUTOR: Record<YtStage, string> = {
  OMNI_DIRECTION: "models/gemini-omni-1.1-flash",
  LYRIA_SONG: "models/lyria-3.5",
  TEMPO_MEASURE: "deterministic:ffmpeg+autocorrelation (no model)",
  ANCHOR_PLATE: "models/gemini-2.5-flash-image",
  VEO_SHOTS: "models/veo-3.1-generate-preview",
  MASTER_MUX: "deterministic:ffmpeg (no model)",
  OMNI_SYNC_AUDIT: "models/gemini-omni-1.1-flash",
};

/** Roles Omni genuinely performs. Kept honest on purpose - see OMNI_NOT_ROLES. */
export const OMNI_ROLES = [
  "producer", "director", "writer", "screenplay_writer", "choreographer",
  "cameraman", "costume_designer", "wardrobe_supervisor", "crew_lead",
  "casting_director", "lyricist", "viral_hook_strategist", "quality_auditor",
] as const;

/**
 * Roles Omni is COMMONLY but WRONGLY credited with. Recording them stops the
 * manifest from claiming work Omni did not do.
 */
export const OMNI_NOT_ROLES: Record<string, string> = {
  singer: "Lyria 3.5 synthesises all vocal audio. Omni writes the lyrics only.",
  audio_engineer: "ffmpeg performs the mux and loudness master. Omni only verifies the result.",
  live_researcher: "No search tool is attached. 'Viral hooks' are model priors, not live Instagram research.",
};

/** Veo accepts only these clip lengths. Requesting anything else is rejected. */
/**
 * Veo tier selection. VEO_SHOTS in YT_STAGE_EXECUTOR is the "full" default;
 * the cheaper tiers exist so an A/B matrix can be run without paying full
 * freight on every arm. Whichever tier runs is written to the provenance
 * ledger - a reel must never claim a model that did not generate it.
 */
export const VEO_TIER_MODEL = {
  full: "models/veo-3.1-generate-preview",
  fast: "models/veo-3.1-fast-generate-preview",
  lite: "models/veo-3.1-lite-generate-preview",
} as const;

export type VeoTier = keyof typeof VEO_TIER_MODEL;

export const VEO_DURATION_BUCKETS = [4, 6, 8] as const;

/**
 * Pick the shortest legal bucket that still covers the target.
 *
 * The studio1 path always asked for 8s and then compressed the result to fit a
 * 4-5.7s slot, which threw away 32% of every paid generation AND forced a
 * 0.92x speed ramp onto every single shot. Choosing the bucket correctly
 * removes the waste and the ramp in one move.
 */
export function pickVeoDuration(targetSec: number): number {
  return VEO_DURATION_BUCKETS.find((d) => d >= targetSec - 0.001)
    ?? VEO_DURATION_BUCKETS[VEO_DURATION_BUCKETS.length - 1];
}

/** Delivery master spec. Social platforms normalise to roughly -14 LUFS. */
export const YT_MASTER_SPEC = {
  lufs: -14,
  truePeakDb: -1.0,
  sampleRate: 48000,
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Throws if a stage runs out of order. Ordering is the feature. */
export function assertStageOrder(completed: YtStage[], next: YtStage): void {
  const expected = YT_STAGES[completed.length];
  if (expected !== next) {
    throw new Error(
      `YT_STAGE_ORDER_VIOLATION: expected "${expected}" after [${completed.join(" -> ")}], got "${next}". ` +
      `The canonical order is ${YT_STAGES.join(" -> ")}.`
    );
  }
}
