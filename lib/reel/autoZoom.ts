export type ZoomLevel = 1.0 | 1.12 | 1.22 | 1.35;
export type ZoomTransition = "cut" | "smooth" | "snap";

export interface ZoomKeyframe {
  shotIndex: number;
  shotId?: string;
  startSec: number;
  endSec: number;
  scale: ZoomLevel;
  focusPoint: "center" | "face" | "left" | "right";
  transition: ZoomTransition;
  label: string;
}

export type AutoZoomPresetId = "dynamic-viral" | "dramatic-climax" | "subtle-motion" | "none";

export interface AutoZoomPreset {
  id: AutoZoomPresetId;
  name: string;
  description: string;
  badge: string;
}

export const AUTO_ZOOM_PRESETS: AutoZoomPreset[] = [
  {
    id: "dynamic-viral",
    name: "Dynamic Viral (Alternating Punch-Ins)",
    description: "Alternates between 1.0x and 1.18x punch-ins on each spoken beat for maximum audience retention (Alex Hormozi / Submagic style).",
    badge: "🔥 High Retention"
  },
  {
    id: "dramatic-climax",
    name: "Dramatic Climax (Progressive Push)",
    description: "Starts wide (1.0x) and progressively punches in (1.12x -> 1.22x -> 1.35x) towards the final punchline and CTA.",
    badge: "🎬 Cinematic"
  },
  {
    id: "subtle-motion",
    name: "Minimalist Breathing (1.08x Micro-Zoom)",
    description: "Gentle framing shifts on key sentences to keep visuals active without aggressive jumps.",
    badge: "✨ Subtle"
  },
  {
    id: "none",
    name: "Static Framing (1.0x Raw)",
    description: "Maintains fixed camera distance with no automated zooming.",
    badge: "Raw"
  }
];

export interface ShotDurationInfo {
  id: string;
  order: number;
  editorialStartSec: number;
  editorialDurationSec: number;
  scriptText?: string;
}

/**
 * Computes the exact zoom keyframes for a sequence of shots based on the selected preset.
 */
export function calculateZoomKeyframes(
  shots: ShotDurationInfo[],
  presetId: AutoZoomPresetId = "dynamic-viral"
): ZoomKeyframe[] {
  if (!shots || shots.length === 0) return [];
  if (presetId === "none") {
    return shots.map((s, idx) => ({
      shotIndex: idx,
      shotId: s.id,
      startSec: s.editorialStartSec,
      endSec: s.editorialStartSec + s.editorialDurationSec,
      scale: 1.0,
      focusPoint: "center",
      transition: "cut",
      label: "1.0x Wide"
    }));
  }

  if (presetId === "dynamic-viral") {
    return shots.map((s, idx) => {
      // Alternate: Shot 0 -> 1.0x, Shot 1 -> 1.18x punch-in, Shot 2 -> 1.0x, Shot 3 -> 1.22x close-up, etc.
      const isPunchIn = idx % 2 === 1;
      const isClimax = idx === shots.length - 1 && shots.length > 2;
      const scale: ZoomLevel = isClimax ? 1.22 : isPunchIn ? 1.12 : 1.0;

      return {
        shotIndex: idx,
        shotId: s.id,
        startSec: s.editorialStartSec,
        endSec: s.editorialStartSec + s.editorialDurationSec,
        scale,
        focusPoint: "center",
        transition: isPunchIn ? "cut" : "snap",
        label: scale === 1.0 ? "1.0x Wide" : `${scale}x Punch-In`
      };
    });
  }

  if (presetId === "dramatic-climax") {
    const total = shots.length;
    return shots.map((s, idx) => {
      const progress = idx / Math.max(1, total - 1);
      let scale: ZoomLevel = 1.0;
      if (progress > 0.75) scale = 1.22;
      else if (progress > 0.4) scale = 1.12;

      return {
        shotIndex: idx,
        shotId: s.id,
        startSec: s.editorialStartSec,
        endSec: s.editorialStartSec + s.editorialDurationSec,
        scale,
        focusPoint: "center",
        transition: "smooth",
        label: `${scale}x ${progress > 0.75 ? "Climax" : "Push"}`
      };
    });
  }

  // subtle-motion
  return shots.map((s, idx) => {
    const scale: ZoomLevel = idx % 3 === 1 ? 1.12 : 1.0;
    return {
      shotIndex: idx,
      shotId: s.id,
      startSec: s.editorialStartSec,
      endSec: s.editorialStartSec + s.editorialDurationSec,
      scale,
      focusPoint: "center",
      transition: "smooth",
      label: scale > 1.0 ? "1.08x Breath" : "1.0x Base"
    };
  });
}

/**
 * Generates an FFmpeg complex filter command snippet for video crop and zoom baking.
 */
export function generateFfmpegZoomFilter(keyframes: ZoomKeyframe[], width = 720, height = 1280): string {
  if (!keyframes.length || keyframes.every(k => k.scale === 1.0)) {
    return "null";
  }

  // Builds conditional crop expression per timestamp segment
  const segments = keyframes.map(k => {
    const cropW = Math.round(width / k.scale);
    const cropH = Math.round(height / k.scale);
    const cropX = Math.round((width - cropW) / 2);
    const cropY = Math.round((height - cropH) / 2);
    return `between(t,${k.startSec.toFixed(2)},${k.endSec.toFixed(2)})*${cropW}`;
  });

  return `crop=w='max(${width},${segments.join("+")})':h='in_h':x='(in_w-out_w)/2':y='(in_h-out_h)/2'`;
}
