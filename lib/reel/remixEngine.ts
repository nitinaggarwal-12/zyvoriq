/**
 * 🔁 Zyvoriq "Remix This Reel" Viral Growth Engine (Tier 2)
 * Encodes, serializes, and decodes complete creation recipes (Hooks, B-Roll, Emojis,
 * Personas, Dopamine split config, Captions) into deep-linkable URLs and 1-click clone tokens.
 */

import { DopamineConfig, DEFAULT_DOPAMINE_CONFIG } from "./dopamineSplitScreen";

export interface ReelRemixRecipe {
  version: "1.0";
  title: string;
  topic: string;
  personaId: string;
  aspectRatio: string;
  durationSec: number;
  subtitleStyle: string;
  hookStyle: string;
  dopamineConfig: DopamineConfig;
  brollPresetIds: string[];
  emojiKeywords: string[];
  remixCount?: number;
}

export const FEATURED_REMIX_TEMPLATES: ReelRemixRecipe[] = [
  {
    version: "1.0",
    title: "⚡ Viral Faceless Dopamine Parkour Hook",
    topic: "3 psychological tricks that command instant respect",
    personaId: "aria-thorne",
    aspectRatio: "9:16",
    durationSec: 30,
    subtitleStyle: "hormozi_bold",
    hookStyle: "Negative Warning",
    dopamineConfig: {
      enabled: true,
      presetId: "minecraft_parkour",
      layout: "50_50_split",
      asmrVolume: 25,
      audioDuckingEnabled: true,
      borderGlowColor: "#ec4899"
    },
    brollPresetIds: ["tech_ai", "finance_growth"],
    emojiKeywords: ["rocket", "money", "warning", "focus"],
    remixCount: 14200
  },
  {
    version: "1.0",
    title: "🛍️ TikTok Shop 3-Part UGC Cash Machine",
    topic: "Why everyone is obsessed with this $29 gadget",
    personaId: "priya-sharma",
    aspectRatio: "9:16",
    durationSec: 30,
    subtitleStyle: "mrbeast_glow",
    hookStyle: "Curiosity Gap",
    dopamineConfig: DEFAULT_DOPAMINE_CONFIG,
    brollPresetIds: ["lifestyle_mindset"],
    emojiKeywords: ["growth", "smart", "fire"],
    remixCount: 9840
  },
  {
    version: "1.0",
    title: "💬 Reddit Mystery True Crime Narrative",
    topic: "The unexplainable disappearance at Blackwood Lake",
    personaId: "jordan-kai",
    aspectRatio: "9:16",
    durationSec: 45,
    subtitleStyle: "cyberpunk_glitch",
    hookStyle: "Shocking Stat",
    dopamineConfig: {
      enabled: true,
      presetId: "asmr_kinetic_sand",
      layout: "60_40_focus",
      asmrVolume: 35,
      audioDuckingEnabled: true,
      borderGlowColor: "#6366f1"
    },
    brollPresetIds: ["nature_cinematic"],
    emojiKeywords: ["warning", "focus"],
    remixCount: 21500
  }
];

/**
 * Serializes a remix recipe into a URL-safe Base64 token.
 */
export function encodeRemixRecipe(recipe: ReelRemixRecipe): string {
  try {
    const jsonStr = JSON.stringify(recipe);
    if (typeof btoa !== "undefined") {
      return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    }
    return encodeURIComponent(Buffer.from(jsonStr).toString("base64"));
  } catch {
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 token back into a structured remix recipe.
 */
export function decodeRemixRecipe(token: string): ReelRemixRecipe | null {
  try {
    const rawStr = decodeURIComponent(token);
    let jsonStr = "";
    if (typeof atob !== "undefined") {
      jsonStr = decodeURIComponent(escape(atob(rawStr)));
    } else {
      jsonStr = Buffer.from(rawStr, "base64").toString("utf-8");
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed.version === "1.0" && parsed.topic) {
      return parsed as ReelRemixRecipe;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates a full shareable Remix URL for social media badges.
 */
export function generateRemixShareUrl(recipe: ReelRemixRecipe, origin = "https://zyvoriq.ai"): string {
  const token = encodeRemixRecipe(recipe);
  return `${origin}/studio?remix=${token}`;
}
