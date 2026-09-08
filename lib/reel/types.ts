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

export type BoundaryStrategy =
  | "HARD_CUT"
  | "CUT_ON_ACTION"
  | "MATCH_CUT"
  | "J_CUT"
  | "L_CUT"
  | "JUMP_CUT"
  | "EXTEND"
  | "GENERATE_WITH_REFERENCE"
  | "FIRST_LAST_FRAME_BRIDGE"
  | "GRAPHIC_TRANSITION"
  | "REPAIR_BOUNDARY";

export type QualityGateStatus = "NOT_APPLICABLE" | "PENDING" | "PASSED" | "FAILED";
export type QualityGateId =
  | "QG-TRANSCRIPT-01"
  | "QG-CAP-01"
  | "QG-PERF-01"
  | "QG-LIP-01"
  | "QG-EMO-01"
  | "QG-BND-01"
  | "QG-OBJ-01"
  | "QG-VIS-01"
  | "QG-AUD-01"
  | "QG-SEM-01"
  | "QG-WHOLE-01";

export interface ReelCreationIntent {
  mode: "quick-brief" | "category";
  clusterId?: string;
  clusterName?: string;
  categoryId?: string;
  categoryLabel?: string;
  conceptId?: string;
  conceptTitle?: string;
  conceptHook?: string;
  conceptPrompt?: string;
  conceptSpeechSample?: string;
  characterId?: string;
  characterName?: string;
  characterDescription?: string;
  visualStyleId?: string;
  visualStyleLabel?: string;
  visualStyleDescription?: string;
  musicPreset?: string;
  narrationLanguage?: string;
}

export interface WordTiming {
  id?: string;
  word: string;
  startSec: number;
  endSec: number;
  speaker?: string;
}

export interface PhonemeTiming {
  phoneme: string;
  startSec: number;
  endSec: number;
  source: "provider" | "forced-aligner";
}

export interface ProsodyCue {
  startSec: number;
  endSec: number;
  energy?: number;
  pitch?: number;
  speakingRate?: number;
  emphasis?: string[];
  emotion?: string;
  confidence?: number;
}

export interface AlignmentValidation {
  expectedWords: number;
  actualWords: number;
  wer: number;
  coverage: number;
  passed: boolean;
  missingCritical?: string[];
}

export interface SpeechMap {
  source: "actual-audio";
  durationSec: number;
  words: WordTiming[];
  phonemes?: PhonemeTiming[];
  prosody?: ProsodyCue[];
  pauses?: Array<{ startSec: number; endSec: number; kind?: "breath" | "silence" | "dramatic" }>;
  generatedAt: string;
}

export interface CaptionCue {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  wordIds: string[];
  lines: string[];
  emphasizedWords?: string[];
  position: "lower-third" | "center" | "upper-third";
}

export interface CaptionTrack {
  timingSource: "actual-alignment" | "draft";
  cues: CaptionCue[];
  safeZoneProfile: "instagram-reels" | "youtube-shorts" | "tiktok";
}

export interface EmotionState {
  emotion: string;
  intensity: number;
  smile?: number;
  browRaise?: number;
  eyeIntensity?: number;
  headTilt?: number;
  gestureEnergy?: number;
}

export interface PerformanceCue {
  startSec: number;
  endSec: number;
  emotion: EmotionState;
  gaze: "camera" | "off-camera-left" | "off-camera-right" | "subject" | "free";
  posture?: string;
  gesture?: string;
  speakingEnergy?: number;
}

export interface PerformanceTrack {
  id: string;
  characterId: string;
  audioTrack: "master-narration";
  mode: "persistent-performer" | "shot-conditioned";
  cues: PerformanceCue[];
  renderedPerformanceUrl?: string;
  provider?: string;
  model?: string;
}

export interface CharacterBible {
  id: string;
  name?: string;
  gender?: "male" | "female" | "non-binary";
  biometricDNA?: any;
  role: "presenter" | "character" | "supporting";
  canonicalReferenceImages: string[];
  appearance: {
    description: string;
    gender?: string;
    face?: string;
    hair?: string;
    skin?: string;
    ageBand?: string;
    body?: string;
  };
  wardrobe: string[];
  accessories: string[];
  voiceProfile?: string;
  gestureStyle?: string;
  gazeStyle?: string;
  emotionalRange?: string[];
}

export interface EnvironmentBible {
  id: string;
  description: string;
  layout?: string;
  lightingDirection?: string;
  lightTemperature?: string;
  timeOfDay?: string;
  weather?: string;
  palette?: string;
  keyObjects: string[];
  cameraAxis?: string;
}

export interface ObjectState {
  objectId: string;
  label: string;
  owner?: string;
  location?: string;
  hand?: "left" | "right" | "both" | "none";
  state?: string;
  orientation?: string;
}

export interface ContinuityState {
  character?: string;
  characterId?: string;
  wardrobe?: string;
  environment?: string;
  environmentId?: string;
  lighting?: string;
  props?: string[];
  objectStates?: ObjectState[];
  action?: string;
  pose?: string;
  camera?: string;
  cameraMotion?: string;
  subjectMotion?: string;
  screenPosition?: string;
  eyeline?: string;
  emotion?: EmotionState;
  referenceFrameUrl?: string;
}

export interface BoundaryEvaluation {
  evaluatedAt: string;
  overallScore: number;
  passed: boolean;
  scores: Partial<Record<"identity" | "face" | "expression" | "pose" | "wardrobe" | "objects" | "environment" | "lighting" | "motion" | "camera" | "eyeline" | "audio" | "lipSync" | "captions" | "semantic", number>>;
  failures: string[];
  evaluator?: string;
}

export interface BoundaryState {
  id: string;
  fromShotId: string;
  toShotId: string;
  strategy: BoundaryStrategy;
  fromTimeSec: number;
  toTimeSec: number;
  expected: {
    preserveIdentity: boolean;
    preserveWardrobe: boolean;
    preserveEnvironment: boolean;
    preserveObjects: boolean;
    preserveEmotion: boolean;
    preserveMotion: boolean;
    continuousAudio: boolean;
  };
  evaluation?: BoundaryEvaluation;
}

export interface QualityGateEvidence {
  id: QualityGateId;
  status: QualityGateStatus;
  score?: number;
  threshold?: number;
  evaluator?: string;
  evaluatedAt?: string;
  evidenceRefs?: string[];
  failures?: string[];
  note?: string;
}

export interface ReelShot {
  id: string;
  sceneId?: string;
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

export interface MusicPlan {
  durationSec?: number;
  bpm?: number;
  key?: string;
  sections: Array<{ startSec: number; endSec: number; intent: string; energy: number }>;
  continuousAcrossVisualCuts: boolean;
  duckUnderSpeech: boolean;
}

export interface ReelProductionManifest {
  id: string;
  version: 1 | 2;
  createdAt: string;
  status: ReelProductionStatus;
  platform: "Instagram Reels" | "YouTube Shorts" | "TikTok";
  aspectRatio: "9:16" | "16:9" | "2.39:1";
  requestedDurationSec: number;
  plannedDurationSec: number;
  topic: string;
  tone: string;
  language?: string;
  starred?: boolean;
  creationIntent?: ReelCreationIntent;
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
    speechMap?: SpeechMap;
    provider?: string;
    model?: string;
    voice?: string;
  };
  captions?: CaptionTrack;
  continuity?: {
    characters: CharacterBible[];
    environments: EnvironmentBible[];
    performanceTracks: PerformanceTrack[];
    boundaries: BoundaryState[];
    objectStateGraph: Record<string, ObjectState[]>;
  };
  musicPlan?: MusicPlan;
  scenes?: Record<string, { id: string; environment: string }>;
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
    gates?: Partial<Record<QualityGateId, QualityGateEvidence>>;
  };
}
