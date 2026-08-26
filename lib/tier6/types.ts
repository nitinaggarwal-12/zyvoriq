/**
 * ZYVORIQ TIER 6: AUTONOMOUS COGNITIVE DIGITAL TWIN TYPES
 * Production-grade type contracts for Gemini 3.1 Cognitive Reasoning,
 * DeepMind 48kHz Acoustics, Full-Body Video Diffusion, and Veritas C2PA Provenance.
 */

export type FramingMode = "headshot" | "half_body" | "full_body";
export type PostureMode = "standing" | "sitting" | "walking" | "interactive_hologram";
export type EnvironmentMode = "keynote_arena" | "fireside_library" | "command_bunker" | "executive_boardroom";

export interface ExecutivePersona {
  id: string;
  name: string;
  title: string;
  location: string;
  gender: "female" | "male";
  avatarUrl: string;
  videoUrl: string;
  audioUrl: string;
  accent: string;
  voiceStyle: string;
  defaultScript: string;
  bio: string;
  c2paCertId: string;
}

export interface ScriptWordTiming {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface VeritasProvenanceSeal {
  certId: string;
  algorithm: "Ed25519" | "Dilithium5-PostQuantum" | "zk-SNARK-Plonk";
  signature: string;
  c2paManifestHash: string;
  timestamp: string;
  issuer: string;
  claims: {
    voiceModel: string;
    videoModel: string;
    watermarkWatermarkDetected: boolean;
    tamperProofPassed: boolean;
    zkProofVerified?: boolean;
    sovereignIdentityLedger?: string;
  };
}

export interface Tier6SynthesisStage {
  stage: number;
  totalStages: number;
  name: string;
  detail: string;
  progressPct: number;
  status: "idle" | "running" | "completed" | "error";
}

export interface Gen7NeuroBiometrics {
  ppgPulseBpm: number;          // Heart rate / sub-surface scattering pulse (e.g. 72 BPM)
  microSaccadeHz: number;        // Ocular micro-saccade jitter frequency (e.g. 4.8 Hz)
  lungTidalVolumeL: number;      // Respiratory sub-glottal volume (e.g. 0.52 L)
  pupilDilationMm: number;       // Cognitive load pupil response (e.g. 3.8 mm)
}

export interface Tier6LiveTelemetry {
  audioEnergyRms: number;     // 0-100%
  oralAperturePct: number;    // 0-100%
  phaseConvergenceMs: number; // 0ms target
  syncHealthScore: number;    // 0-100%
  activeWordIndex: number;
  activeWord: string;
  playbackProgressPct: number;
  biometrics?: Gen7NeuroBiometrics;
  activeFraming?: FramingMode;
  activePosture?: PostureMode;
  activeEnvironment?: EnvironmentMode;
}
