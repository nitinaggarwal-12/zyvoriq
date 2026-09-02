/**
 * 🎭 Zyvoriq Auto-Meme & Reaction Cutaway Injector (Tier 3)
 * Analyzes script dialogue for punchlines, comedic irony, and dramatic plot twists.
 * Automatically injects trending reaction GIF/video cutaways and iconic soundboard FX
 * (Vine Boom, Anime Wow, Metal Pipe, Bruh, Dramatic Dun Dun Dun, Sad Violin).
 */

export type MemeSoundEffect =
  | "vine_boom"
  | "anime_wow"
  | "metal_pipe"
  | "bruh"
  | "dramatic_dun_dun"
  | "sad_violin"
  | "record_scratch"
  | "cricket_silence";

export interface MemePreset {
  id: string;
  title: string;
  memeUrl: string;
  sfx: MemeSoundEffect;
  keywords: string[];
  vibe: "shock" | "cringe" | "celebration" | "irony" | "plot_twist";
  durationSec: number;
}

export interface MemeCutawayItem {
  id: string;
  shotId: string;
  sceneIndex: number;
  timestampSec: number;
  memeId: string;
  title: string;
  memeUrl: string;
  sfx: MemeSoundEffect;
  layout: "pip_center" | "full_cutaway" | "bottom_reaction";
  durationSec: number;
  enabled: boolean;
}

export const TRENDING_MEME_LIBRARY: MemePreset[] = [
  {
    id: "the_rock_eyebrow",
    title: "🤨 The Rock Eyebrow Raise",
    memeUrl: "/media/memes/the_rock_eyebrow.gif",
    sfx: "vine_boom",
    keywords: ["what", "suspicious", "really", "doubt", "secret", "lies", "impossible"],
    vibe: "shock",
    durationSec: 1.8
  },
  {
    id: "pedro_pascal_driving",
    title: "🚗 Pedro Pascal Laughing to Crying",
    memeUrl: "/media/memes/pedro_pascal_driving.gif",
    sfx: "dramatic_dun_dun",
    keywords: ["mistake", "wrong", "regret", "disaster", "pain", "failed"],
    vibe: "irony",
    durationSec: 2.2
  },
  {
    id: "dicaprio_pointing",
    title: "👉 Leonardo DiCaprio Pointing",
    memeUrl: "/media/memes/dicaprio_pointing.gif",
    sfx: "anime_wow",
    keywords: ["look", "see", "found", "exact", "there", "caught", "noticed"],
    vibe: "celebration",
    durationSec: 1.6
  },
  {
    id: "michael_scott_no",
    title: "😱 Michael Scott 'No God Please No'",
    memeUrl: "/media/memes/michael_scott_no.gif",
    sfx: "record_scratch",
    keywords: ["stop", "never", "worst", "terrible", "destroy", "bad"],
    vibe: "cringe",
    durationSec: 2.0
  },
  {
    id: "metal_pipe_falling",
    title: "💥 Metal Pipe Echo Slam",
    memeUrl: "/media/memes/metal_pipe_slam.gif",
    sfx: "metal_pipe",
    keywords: ["boom", "slam", "shock", "collapse", "destroyed", "dead"],
    vibe: "plot_twist",
    durationSec: 1.5
  }
];

/**
 * Scans script lines and automatically places meme cutaways at punchlines.
 */
export function autoDetectMemeCutaways(
  shots: Array<{ id: string; scriptText: string; editorialStartSec?: number; editorialDurationSec?: number }>
): MemeCutawayItem[] {
  const cutaways: MemeCutawayItem[] = [];

  shots.forEach((shot, index) => {
    const text = shot.scriptText.toLowerCase();
    const startSec = shot.editorialStartSec ?? index * 4.0;
    const duration = shot.editorialDurationSec ?? 4.0;

    for (const preset of TRENDING_MEME_LIBRARY) {
      const match = preset.keywords.find((k) => text.includes(k));
      if (match) {
        cutaways.push({
          id: `meme_${shot.id}_${preset.id}`,
          shotId: shot.id,
          sceneIndex: index,
          timestampSec: Math.round((startSec + duration * 0.4) * 10) / 10,
          memeId: preset.id,
          title: preset.title,
          memeUrl: preset.memeUrl,
          sfx: preset.sfx,
          layout: "pip_center",
          durationSec: preset.durationSec,
          enabled: true
        });
        break; // 1 meme max per shot
      }
    }
  });

  return cutaways;
}
