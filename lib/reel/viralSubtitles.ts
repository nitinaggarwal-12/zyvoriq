/**
 * ✨ Zyvoriq Ultra-Kinetic Subtitle Engine (Tier 2)
 * High-craft subtitle presets inspired by top creators (Alex Hormozi, MrBeast, Ali Abdaal)
 * with real-time bouncing word highlights, glowing outlines, and audio-reactive CSS styling.
 */

export type ViralSubtitleStyleId =
  | "hormozi_bold"
  | "mrbeast_glow"
  | "ali_abdaal_clean"
  | "cyberpunk_glitch"
  | "karaoke_gold"
  | "minimal_white";

export interface ViralSubtitlePreset {
  id: ViralSubtitleStyleId;
  name: string;
  creatorTag: string;
  fontFamily: string;
  textTransform: "uppercase" | "capitalize" | "none";
  activeWordColor: string;
  inactiveWordColor: string;
  strokeColor: string;
  glowShadow: string;
  badge: string;
  description: string;
  animationClass: string;
}

export const VIRAL_SUBTITLE_PRESETS: ViralSubtitlePreset[] = [
  {
    id: "hormozi_bold",
    name: "🟡 Alex Hormozi Bold Pop",
    creatorTag: "Alex Hormozi ($100M)",
    fontFamily: "font-black tracking-tighter uppercase",
    textTransform: "uppercase",
    activeWordColor: "#facc15", // Punchy Yellow
    inactiveWordColor: "#ffffff",
    strokeColor: "#000000",
    glowShadow: "drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]",
    badge: "🔥 #1 Viral Retention Style",
    description: "Giant uppercase words that punch and pop word-by-word with high-contrast black outline.",
    animationClass: "animate-bounce-short"
  },
  {
    id: "mrbeast_glow",
    name: "🔴 MrBeast Neon Glow",
    creatorTag: "MrBeast (300M+ Subs)",
    fontFamily: "font-black tracking-normal uppercase",
    textTransform: "uppercase",
    activeWordColor: "#ef4444", // Neon Red / Cyan stroke
    inactiveWordColor: "#ffffff",
    strokeColor: "#06b6d4",
    glowShadow: "drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]",
    badge: "⚡ High Energy Beast Style",
    description: "Pulsing red/cyan neon glow with kinetic shake on dramatic power words.",
    animationClass: "animate-pulse"
  },
  {
    id: "ali_abdaal_clean",
    name: "⚪ Ali Abdaal Minimalist",
    creatorTag: "Ali Abdaal (Productivity)",
    fontFamily: "font-medium tracking-tight",
    textTransform: "none",
    activeWordColor: "#38bdf8", // Sky Blue
    inactiveWordColor: "rgba(255,255,255,0.7)",
    strokeColor: "transparent",
    glowShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]",
    badge: "✨ Elegant Documentary Look",
    description: "Clean, elegant sans-serif with smooth left-to-right gradient word highlight.",
    animationClass: "transition-colors duration-150"
  },
  {
    id: "cyberpunk_glitch",
    name: "👾 Cyberpunk Glitch Neon",
    creatorTag: "Sci-Fi & Tech",
    fontFamily: "font-mono font-bold uppercase",
    textTransform: "uppercase",
    activeWordColor: "#ec4899", // Neon Pink
    inactiveWordColor: "#a855f7",
    strokeColor: "#000000",
    glowShadow: "drop-shadow-[0_0_10px_rgba(236,72,153,0.9)]",
    badge: "🔮 Neon Synthwave Glow",
    description: "Chromatic aberration flicker with neon pink and purple glow.",
    animationClass: "animate-pulse"
  },
  {
    id: "karaoke_gold",
    name: "👑 Dynamic Gold Karaoke",
    creatorTag: "Broadcast & Luxury",
    fontFamily: "font-extrabold uppercase",
    textTransform: "uppercase",
    activeWordColor: "#fbbf24", // Rich Gold
    inactiveWordColor: "rgba(255,255,255,0.8)",
    strokeColor: "#78350f",
    glowShadow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    badge: "💎 Luxury Karaoke Fill",
    description: "Real-time gold fill with smooth syllable transitions.",
    animationClass: "transition-all duration-100"
  },
  {
    id: "minimal_white",
    name: "📄 Crisp Minimal White",
    creatorTag: "Documentary & News",
    fontFamily: "font-semibold",
    textTransform: "none",
    activeWordColor: "#ffffff",
    inactiveWordColor: "#9ca3af",
    strokeColor: "#000000",
    glowShadow: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
    badge: "📽️ Classic Documentary",
    description: "Crisp white subtitles with subtle contrast shadow for natural viewing.",
    animationClass: ""
  }
];

export function getSubtitlePreset(styleId: string): ViralSubtitlePreset {
  return VIRAL_SUBTITLE_PRESETS.find((p) => p.id === styleId) || VIRAL_SUBTITLE_PRESETS[0];
}
