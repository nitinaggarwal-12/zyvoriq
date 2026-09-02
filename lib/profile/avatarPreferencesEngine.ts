/**
 * ZYVORIQ USER AVATAR & COPILOT PREFERENCES ENGINE
 * Manages personalized virtual chat avatars, attire styles, neural audio voices,
 * and conversational tones for live support and screen sharing.
 */

export interface AvatarProfilePreference {
  avatarId: string;
  avatarName: string;
  avatarRole: string;
  avatarImage: string;
  attire: "executive_blazer" | "tech_hoodie" | "creative_linen" | "cyberpunk_neon" | "academic_trench";
  attireLabel: string;
  audioVoiceId: string;
  audioVoiceName: string;
  audioPitch: number; // 0.8 to 1.2
  audioRate: number; // 0.8 to 1.3
  tone: "pedagogical" | "concise_technical" | "energetic_director" | "warm_conversational" | "authoritative_executive";
  toneLabel: string;
  copilotScreenMode: "proactive_spotlights" | "step_by_step" | "silent_observer";
  copilotScreenModeLabel: string;
  studioBackdrop: "obsidian_glass" | "neon_cyber" | "minimalist_lab" | "cozy_library";
  lastSavedAt: string;
}

export const ATTIRE_PRESETS = [
  { id: "executive_blazer", label: "Navy Executive Blazer & Lapel Pin", icon: "👔", desc: "Crisp corporate elegance with sharp modern tailoring" },
  { id: "tech_hoodie", label: "Tech Minimalist Dark Hoodie", icon: "🧥", desc: "Silicon Valley developer aesthetic with matte textures" },
  { id: "creative_linen", label: "Creative Director Oversized Linen", icon: "🎨", desc: "Relaxed artistic styling with warm neutral tones" },
  { id: "cyberpunk_neon", label: "Cyberpunk Luminescent Techwear", icon: "⚡", desc: "Glowing trim and futuristic cyber-aesthetic" },
  { id: "academic_trench", label: "Classic Scholar Trench & Frames", icon: "👓", desc: "Refined vintage academic styling with tortoiseshell glasses" }
] as const;

export const TONE_PRESETS = [
  { id: "pedagogical", label: "Supportive & Pedagogical", desc: "Patient step-by-step guidance with encouraging creator feedback" },
  { id: "concise_technical", label: "Concise & Analytical", desc: "Direct, engineering-first answers with zero fluff" },
  { id: "energetic_director", label: "Energetic Studio Director", desc: "High-energy motivation focused on viral retention hooks and pacing" },
  { id: "warm_conversational", label: "Warm & Friendly Conversational", desc: "Approachable, empathetic dialogue with natural pacing" },
  { id: "authoritative_executive", label: "Authoritative Executive", desc: "Strategic enterprise-grade tone focused on ROI and quality yields" }
] as const;

export const COPILOT_SCREEN_MODES = [
  { id: "proactive_spotlights", label: "Proactive Spotlights & Auto-Diagnose", desc: "AI dynamically highlights next actions and suggests workflow shortcuts" },
  { id: "step_by_step", label: "Interactive Step-by-Step Walkthrough", desc: "AI guides you one button at a time with verbal confirmation" },
  { id: "silent_observer", label: "Silent Observer (Voice on Request)", desc: "AI observes quietly and speaks only when you ask a question" }
] as const;

export const DEFAULT_AVATAR_PREFERENCE: AvatarProfilePreference = {
  avatarId: "elena",
  avatarName: "Elena Rostova",
  avatarRole: "Senior Technical Copilot & AI Director",
  avatarImage: "/assets/avatars/avatar_elena_founder.jpg",
  attire: "tech_hoodie",
  attireLabel: "Tech Minimalist Dark Hoodie",
  audioVoiceId: "neural_crisp_tech_female",
  audioVoiceName: "Google DeepMind Neural Crystal (Female, 144 WPM)",
  audioPitch: 1.0,
  audioRate: 1.05,
  tone: "pedagogical",
  toneLabel: "Supportive & Pedagogical",
  copilotScreenMode: "proactive_spotlights",
  copilotScreenModeLabel: "Proactive Spotlights & Auto-Diagnose",
  studioBackdrop: "obsidian_glass",
  lastSavedAt: new Date().toISOString()
};

const STORAGE_KEY = "zyvoriq_user_avatar_preference";

export function loadSavedAvatarPreference(): AvatarProfilePreference {
  if (typeof window === "undefined") return DEFAULT_AVATAR_PREFERENCE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AVATAR_PREFERENCE, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_AVATAR_PREFERENCE;
}

export function saveAvatarPreference(pref: AvatarProfilePreference): void {
  if (typeof window === "undefined") return;
  try {
    const updated = { ...pref, lastSavedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("zyvoriq_avatar_preference_updated", { detail: updated }));
  } catch {}
}
