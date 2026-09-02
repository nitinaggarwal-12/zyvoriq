/**
 * 🎬 ZYVORIQ SMART B-ROLL & VISUAL CUTAWAY ENGINE (PHASE 3)
 * 
 * Provides automated script-driven visual keyword extraction, contextual B-Roll cutaways,
 * Picture-in-Picture (PIP) split screens, and timeline synchronization over continuous A-Roll audio/video.
 */

export interface ShotLike {
  id: string;
  editorialDurationSec?: number;
  scriptText?: string;
  asset?: { videoUrl?: string };
}

export type CutawayType = "full_cutaway" | "pip_top_right" | "pip_bottom_right" | "split_screen" | "floating_card";
export type TransitionEffect = "fade" | "glitch" | "zoom_in" | "slide_up" | "hard_cut";

export interface BRollItem {
  id: string;
  shotId: string;
  sceneIndex: number;
  keyword: string;
  searchQuery: string;
  brollUrl: string;
  thumbnailUrl?: string;
  startSec: number;
  durationSec: number;
  type: CutawayType;
  transition: TransitionEffect;
  opacity: number;
  captionText?: string;
  enabled: boolean;
}

export interface BRollStockPreset {
  id: string;
  category: "tech_ai" | "finance_growth" | "lifestyle_mindset" | "nature_cinematic" | "abstract_motion";
  title: string;
  keywords: string[];
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number;
}

/** Pre-curated high-definition 1080x1920 / 1920x1080 B-roll library */
export const BROLL_PRESET_LIBRARY: BRollStockPreset[] = [
  {
    id: "broll_ai_neural_nexus",
    category: "tech_ai",
    title: "AI Neural Network Hologram",
    keywords: ["ai", "algorithm", "data", "future", "tech", "machine learning", "code", "intelligence"],
    videoUrl: "/assets/video/veo_gaming_nexus_master.mp4",
    thumbnailUrl: "/assets/video/generated/serengeti_cheetah.mp4",
    durationSec: 8.0
  },
  {
    id: "broll_macro_finance_chart",
    category: "finance_growth",
    title: "Financial Growth & Bullish Candlesticks",
    keywords: ["growth", "money", "invest", "habits", "success", "scale", "revenue", "profit", "killing", "focus"],
    videoUrl: "/assets/video/veo_finance_macro_master.mp4",
    thumbnailUrl: "/assets/video/veo_finance_macro_genuine.mp4",
    durationSec: 8.0
  },
  {
    id: "broll_cinematic_noir_focus",
    category: "lifestyle_mindset",
    title: "Deep Work Concentration & Clock Ticking",
    keywords: ["focus", "habits", "mindset", "distraction", "discipline", "time", "routine", "silent"],
    videoUrl: "/assets/video/veo_cinema_noir_master.mp4",
    thumbnailUrl: "/assets/video/veo_cinema_noir_genuine.mp4",
    durationSec: 8.0
  },
  {
    id: "broll_cheetah_hyper_speed",
    category: "nature_cinematic",
    title: "Cheetah Sprinting (Velocity & Speed)",
    keywords: ["speed", "fast", "velocity", "exponential", "sprint", "power", "momentum", "instinct"],
    videoUrl: "/assets/video/serengeti_act_4_cheetah_sprint.mp4",
    thumbnailUrl: "/assets/video/generated/serengeti_cheetah.mp4",
    durationSec: 8.0
  },
  {
    id: "broll_wagyu_culinary_craft",
    category: "lifestyle_mindset",
    title: "High-Craft Precision Execution",
    keywords: ["quality", "precision", "craft", "perfection", "detail", "mastery", "elite"],
    videoUrl: "/assets/video/veo_culinary_wagyu_master.mp4",
    thumbnailUrl: "/assets/video/veo_culinary_wagyu_genuine.mp4",
    durationSec: 8.0
  }
];

/**
 * Automatically analyzes scene script texts and extracts high-impact visual keywords
 * to suggest contextually relevant B-Roll cutaways.
 */
export function autoGenerateBRollCutaways(shots: ShotLike[]): BRollItem[] {
  let accumulatedTime = 0;
  const brollItems: BRollItem[] = [];

  shots.forEach((shot, index) => {
    const shotDuration = shot.editorialDurationSec || 4.0;
    const shotStart = accumulatedTime;
    accumulatedTime += shotDuration;

    // We selectively add B-roll to alternate beats (e.g. Beats 2, 4, 6, 8, etc.) to maintain visual pacing
    const isGoodCandidate = index > 0 && index % 2 === 1;
    if (!isGoodCandidate) return;

    const scriptLower = (shot.scriptText || "").toLowerCase();
    
    // Find matching stock preset
    let matchedPreset = BROLL_PRESET_LIBRARY.find(preset =>
      preset.keywords.some(kw => scriptLower.includes(kw))
    );

    if (!matchedPreset) {
      // Fallback to rotating preset based on index
      matchedPreset = BROLL_PRESET_LIBRARY[index % BROLL_PRESET_LIBRARY.length];
    }

    // Cutaway starts 0.5s into the scene for smooth pacing
    const cutawayStart = shotStart + 0.5;
    const cutawayDuration = Math.min(2.5, Math.max(1.5, shotDuration - 1.0));

    // Determine ideal framing style based on beat type
    const cutawayType: CutawayType = index === 1 
      ? "pip_top_right" 
      : index % 4 === 3 
      ? "split_screen" 
      : "full_cutaway";

    brollItems.push({
      id: `broll_${shot.id}_${index}`,
      shotId: shot.id,
      sceneIndex: index,
      keyword: matchedPreset.keywords[0] || "visual highlight",
      searchQuery: matchedPreset.title,
      brollUrl: matchedPreset.videoUrl,
      thumbnailUrl: matchedPreset.thumbnailUrl,
      startSec: cutawayStart,
      durationSec: cutawayDuration,
      type: cutawayType,
      transition: "fade",
      opacity: 1.0,
      captionText: `[B-ROLL: ${matchedPreset.title.toUpperCase()}]`,
      enabled: true
    });
  });

  return brollItems;
}

/**
 * Calculates active B-roll overlay at any given playback timestamp.
 */
export function getActiveBRollAtTime(brollItems: BRollItem[], currentTimeSec: number): BRollItem | null {
  return brollItems.find(
    item => item.enabled && currentTimeSec >= item.startSec && currentTimeSec < (item.startSec + item.durationSec)
  ) || null;
}

/**
 * Builds FFmpeg complex filter strings for compositing B-roll overlays / PIP cutaways onto master reel.
 */
export function buildFFmpegBRollFilter(brollItems: BRollItem[], mainWidth = 1080, mainHeight = 1920): string {
  const activeItems = brollItems.filter(b => b.enabled);
  if (activeItems.length === 0) return "";

  const filters: string[] = [];
  let currentBaseTag = "[0:v]";

  activeItems.forEach((item, idx) => {
    const inputIdx = idx + 1; // 0 is main video
    const start = item.startSec.toFixed(2);
    const end = (item.startSec + item.durationSec).toFixed(2);
    const outTag = `[v_broll_${idx}]`;

    switch (item.type) {
      case "full_cutaway":
        // Scaled to full 1080x1920 overlay with fade transition
        filters.push(
          `[${inputIdx}:v]scale=${mainWidth}:${mainHeight}:force_original_aspect_ratio=increase,crop=${mainWidth}:${mainHeight}[b_scale_${idx}]`,
          `${currentBaseTag}[b_scale_${idx}]overlay=0:0:enable='between(t,${start},${end})'${outTag}`
        );
        break;

      case "pip_top_right":
        // 420x746 floating card in top right corner (24px margin)
        const pipW = 420;
        const pipH = 746;
        filters.push(
          `[${inputIdx}:v]scale=${pipW}:${pipH}:force_original_aspect_ratio=increase,crop=${pipW}:${pipH}[b_pip_${idx}]`,
          `${currentBaseTag}[b_pip_${idx}]overlay=main_w-${pipW}-24:24:enable='between(t,${start},${end})'${outTag}`
        );
        break;

      case "split_screen":
        // Upper 50% / Lower 50% split screen
        const splitH = mainHeight / 2;
        filters.push(
          `[${inputIdx}:v]scale=${mainWidth}:${splitH}:force_original_aspect_ratio=increase,crop=${mainWidth}:${splitH}[b_split_${idx}]`,
          `${currentBaseTag}[b_split_${idx}]overlay=0:0:enable='between(t,${start},${end})'${outTag}`
        );
        break;

      default:
        filters.push(
          `[${inputIdx}:v]scale=${mainWidth}:${mainHeight}[b_def_${idx}]`,
          `${currentBaseTag}[b_def_${idx}]overlay=0:0:enable='between(t,${start},${end})'${outTag}`
        );
    }

    currentBaseTag = outTag;
  });

  return filters.join("; ");
}
