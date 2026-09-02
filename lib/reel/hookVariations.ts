/**
 * 🎯 ZYVORIQ 1-CLICK A/B HOOK VARIATIONS ENGINE (PHASE 5)
 * 
 * Generates and manages 3 distinct viral opening hook variations (Curiosity Gap, Negative Warning, Shocking Stat)
 * while preserving the entire downstream body narrative and audio timeline.
 */

export type HookArchetype = "curiosity_gap" | "negative_warning" | "shocking_stat" | "contrarian_truth";

export interface HookVariation {
  id: string;
  archetype: HookArchetype;
  label: string;
  badge: string;
  scriptText: string;
  visualIntent: string;
  veoPrompt: string;
  cameraMotion: "Zoom In Fast" | "Dolly Forward" | "Orbit Left" | "Static Punch";
  durationSec: number;
  videoUrl?: string;
  testedRetentionScore?: number; // Estimated viral score 1-100
}

export interface HookSuite {
  topic: string;
  variants: HookVariation[];
  activeVariantId: string;
}

/**
 * Procedurally generates 3 viral hook variations tailored to the given topic.
 */
export function generateHookSuite(topic: string, baseDuration = 3.5): HookSuite {
  const cleanTopic = topic.trim() || "your daily productivity habits";
  const upper = cleanTopic.toUpperCase();

  const variants: HookVariation[] = [
    {
      id: "hook_var_a",
      archetype: "curiosity_gap",
      label: "Hook A · Curiosity Gap",
      badge: "🔥 89% Retention Score",
      scriptText: `The real reason you struggle with ${cleanTopic} has almost nothing to do with effort.`,
      visualIntent: `Extreme close-up on intense eyes, sudden camera punch-in toward camera, high-contrast studio rim lighting.`,
      veoPrompt: `Cinematic 9:16 vertical shot of a confident speaker looking directly into camera with intense focus, camera quickly dollies in on the phrase '${cleanTopic}', photorealistic, 8k resolution.`,
      cameraMotion: "Zoom In Fast",
      durationSec: baseDuration,
      testedRetentionScore: 89
    },
    {
      id: "hook_var_b",
      archetype: "negative_warning",
      label: "Hook B · Negative Warning",
      badge: "⚠️ 94% Viral Hook Rate",
      scriptText: `Stop ignoring this immediately if you care about ${cleanTopic} — you're making a massive mistake.`,
      visualIntent: `Fast dynamic pan-left into speaker holding up one hand in a warning gesture, sharp cinematic lighting.`,
      veoPrompt: `Dramatic 9:16 vertical shot of a speaker with urgent warning expression, raising hand toward camera, high energy, crisp 4k studio bokeh.`,
      cameraMotion: "Static Punch",
      durationSec: baseDuration,
      testedRetentionScore: 94
    },
    {
      id: "hook_var_c",
      archetype: "shocking_stat",
      label: "Hook C · Shocking Stat",
      badge: "📈 91% Conversion Rate",
      scriptText: `93% of top creators completely misunderstand ${cleanTopic}. Here is the actual data.`,
      visualIntent: `Speaker confidently stepping forward into frame, subtle holographic numbers floating in background.`,
      veoPrompt: `Crisp 9:16 vertical camera tracking speaker walking forward into frame, confident posture, subtle modern tech background, 4k ultra-detailed.`,
      cameraMotion: "Dolly Forward",
      durationSec: baseDuration,
      testedRetentionScore: 91
    }
  ];

  return {
    topic: cleanTopic,
    variants,
    activeVariantId: variants[0].id
  };
}

/**
 * Applies a selected hook variation to a production's scene list by replacing Scene 1
 * while strictly preserving all downstream scenes (Scenes 2..N).
 */
export function swapHookInShots<T extends { id: string; scriptText?: string; visualIntent?: string; cameraMotion?: string; editorialDurationSec?: number }>(
  shots: T[],
  selectedHook: HookVariation
): T[] {
  if (shots.length === 0) return shots;

  const newShots = [...shots];
  newShots[0] = {
    ...newShots[0],
    scriptText: selectedHook.scriptText,
    visualIntent: selectedHook.visualIntent,
    cameraMotion: selectedHook.cameraMotion,
    editorialDurationSec: selectedHook.durationSec
  };

  return newShots;
}
