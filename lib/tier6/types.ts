/**
 * ZYVORIQ TIER 6: AUTONOMOUS COGNITIVE DIGITAL TWIN TYPES
 * Production-grade type contracts for Gemini 3.1 Cognitive Reasoning,
 * DeepMind 48kHz Acoustics, Full-Body Video Diffusion, and Veritas C2PA Provenance.
 */

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
  algorithm: "Ed25519" | "Dilithium5-PostQuantum";
  signature: string;
  c2paManifestHash: string;
  timestamp: string;
  issuer: string;
  claims: {
    voiceModel: string;
    videoModel: string;
    watermarkWatermarkDetected: boolean;
    tamperProofPassed: boolean;
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

export interface Tier6LiveTelemetry {
  audioEnergyRms: number;     // 0-100%
  oralAperturePct: number;    // 0-100%
  phaseConvergenceMs: number; // 0ms target
  syncHealthScore: number;    // 0-100%
  activeWordIndex: number;
  activeWord: string;
  playbackProgressPct: number;
}
