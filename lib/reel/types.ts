export type ReelProductionStatus =
  | "PLANNING"
  | "SCRIPT_READY"
  | "AUDIO_GENERATING"
  | "AUDIO_READY"
  | "SHOTS_PLANNED"
  | "VIDEO_GENERATING"
  | "ROUGH_CUT_READY"
  | "MIXING"
  | "MASTER_RENDERING"
  | "AUDITING"
  | "REPAIRING"
  | "APPROVAL_REQUIRED"
  | "READY"
  | "FAILED";

export type ShotStatus = "PLANNED" | "GENERATING" | "GENERATED" | "AUDITING" | "PASSED" | "FAILED";

export type TransitionType =
  | "hard-cut"
  | "match-cut"
  | "cut-on-action"
  | "jump-cut"
  | "whip"
  | "dissolve"
  | "dip"
  | "graphic";

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
  speaker?: string;
}

export interface AlignmentValidation {
  expectedWords: number;
  actualWords: number;
  wer: number;
  coverage: number;
  passed: boolean;
}

export interface ContinuityState {
  character?: string;
  wardrobe?: string;
  environment?: string;
  lighting?: string;
  props?: string[];
  action?: string;
  camera?: string;
  eyeline?: string;
  referenceFrameUrl?: string;
}

export interface ReelShot {
  id: string;
  order: number;
  editorialStartSec: number;
  editorialDurationSec: number;
  generationDurationSec: 4 | 6 | 8;
  trimInSec: number;
  trimOutSec: number;
  scriptText: string;
  visualIntent: string;
  generationPrompt: string;
  continuityIn: ContinuityState;
  continuityOut: ContinuityState;
  transitionOut: { type: TransitionType; durationSec: number };
  dependsOnShotIds: string[];
  status: ShotStatus;
  asset?: {
    videoUrl: string;
    actualDurationSec?: number;
    operationName?: string;
    provider?: string;
    model?: string;
  };
  qa?: {
    score?: number;
    warnings: string[];
    failures: string[];
  };
}

export interface ReelRenderedOutput {
  videoUrl: string;
  actualDurationSec: number;
  kind: "narrated-rough-cut" | "master";
  codec?: string;
  width?: number;
  height?: number;
  frameRate?: string;
  renderedAt: string;
}

export interface ReelProductionManifest {
  id: string;
  version: 1;
  createdAt: string;
  status: ReelProductionStatus;
  platform: "Instagram Reels" | "YouTube Shorts" | "TikTok";
  aspectRatio: "9:16";
  requestedDurationSec: number;
  plannedDurationSec: number;
  topic: string;
  tone: string;
  masterScript: string;
  creativeBible: {
    visualStyle: string;
    characterLock: string;
    wardrobeLock: string;
    environmentLock: string;
    cameraLanguage: string;
    colorLanguage: string;
  };
  audio: {
    masterClock: "narration" | "music" | "editorial";
    narrationUrl?: string;
    musicUrl?: string;
    actualDurationSec?: number;
    timingSource: "actual-alignment" | "pending";
    wordTimings?: WordTiming[];
    alignmentValidation?: AlignmentValidation;
    provider?: string;
    model?: string;
    voice?: string;
  };
  shots: ReelShot[];
  outputs?: {
    narratedRoughCut?: ReelRenderedOutput;
    master?: ReelRenderedOutput;
  };
  qa: {
    minimumReadyScore: number;
    overallScore?: number;
    passed: boolean;
    warnings: string[];
    failures: string[];
  };
}
