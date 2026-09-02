/**
 * 🎮 Zyvoriq Dopamine Split-Screen & ASMR Brainrot Engine
 * Provides synchronized dual-layer video compositing (Top: Avatar/Reel, Bottom: 60FPS Satisfying/Gameplay loops)
 * with intelligent ASMR ducking, viral pacing sync, and FFmpeg filter graph generation.
 */

export type DopaminePresetId =
  | "minecraft_parkour"
  | "subway_surfers"
  | "asmr_kinetic_sand"
  | "asmr_soap_cutting"
  | "satisfying_slime"
  | "hydraulic_press";

export type DopamineLayoutMode =
  | "50_50_split"
  | "60_40_focus"
  | "pip_bottom_right"
  | "dopamine_side_by_side";

export interface DopaminePreset {
  id: DopaminePresetId;
  name: string;
  category: "Gaming & Parkour" | "Kinetic ASMR" | "Oddly Satisfying";
  fps: number;
  description: string;
  videoUrl: string;
  defaultAsmrVolume: number; // 0.0 to 1.0 (e.g. 0.25 = -12dB)
  duckingDb: number; // e.g. -20dB during narration
  badge: string;
  retentionBoostPercent: number;
}

export interface DopamineConfig {
  enabled: boolean;
  presetId: DopaminePresetId;
  layout: DopamineLayoutMode;
  asmrVolume: number; // 0 to 100
  audioDuckingEnabled: boolean;
  borderGlowColor: string; // Hex or CSS color
}

export const DOPAMINE_PRESETS: DopaminePreset[] = [
  {
    id: "minecraft_parkour",
    name: "⚡ Neon Minecraft Parkour",
    category: "Gaming & Parkour",
    fps: 60,
    description: "Ultra-fast continuous jumping across neon cyber blocks with rhythmic block-landing sounds.",
    videoUrl: "/media/dopamine/minecraft_parkour_60fps.mp4",
    defaultAsmrVolume: 0.20,
    duckingDb: -22,
    badge: "🔥 98% Retention Boost",
    retentionBoostPercent: 38
  },
  {
    id: "subway_surfers",
    name: "🛹 High-Speed Subway Hoverboard",
    category: "Gaming & Parkour",
    fps: 60,
    description: "Hypnotic high-speed train dodges, coin magnet chimes, and fluid dodge mechanics.",
    videoUrl: "/media/dopamine/subway_surfers_60fps.mp4",
    defaultAsmrVolume: 0.18,
    duckingDb: -24,
    badge: "⚡ 96% Viral Hook Rate",
    retentionBoostPercent: 35
  },
  {
    id: "asmr_kinetic_sand",
    name: "🏖️ Rainbow Kinetic Sand Slicing",
    category: "Kinetic ASMR",
    fps: 60,
    description: "Crisp crunch sound and multi-layer gradient sand scoops with deep resonant crunch ASMR.",
    videoUrl: "/media/dopamine/kinetic_sand_asmr.mp4",
    defaultAsmrVolume: 0.35,
    duckingDb: -16,
    badge: "🎧 Pure Tingles ASMR",
    retentionBoostPercent: 42
  },
  {
    id: "asmr_soap_cutting",
    name: "🧼 Grid Cube Soap Carving",
    category: "Kinetic ASMR",
    fps: 60,
    description: "Precision razor blade slicing through micro-cube soap bars with acoustic clicking triggers.",
    videoUrl: "/media/dopamine/soap_cutting_asmr.mp4",
    defaultAsmrVolume: 0.30,
    duckingDb: -18,
    badge: "✨ Hypnotic Focus",
    retentionBoostPercent: 40
  },
  {
    id: "satisfying_slime",
    name: "🔮 Holographic Slime & Bubble Pops",
    category: "Oddly Satisfying",
    fps: 60,
    description: "Pearlescent metallic slime stretching, swirl twisting, and deep tactile bubble popping.",
    videoUrl: "/media/dopamine/satisfying_slime.mp4",
    defaultAsmrVolume: 0.25,
    duckingDb: -20,
    badge: "💎 94% Watch-Time",
    retentionBoostPercent: 32
  },
  {
    id: "hydraulic_press",
    name: "💥 100-Ton Hydraulic Press Crushing",
    category: "Oddly Satisfying",
    fps: 60,
    description: "Slow-motion explosive destruction of colorful objects under extreme hydraulic pressure.",
    videoUrl: "/media/dopamine/hydraulic_press.mp4",
    defaultAsmrVolume: 0.25,
    duckingDb: -20,
    badge: "💥 Explosive Impact",
    retentionBoostPercent: 36
  }
];

export const DEFAULT_DOPAMINE_CONFIG: DopamineConfig = {
  enabled: false,
  presetId: "minecraft_parkour",
  layout: "50_50_split",
  asmrVolume: 25,
  audioDuckingEnabled: true,
  borderGlowColor: "#ec4899"
};

/**
 * Compiles the FFmpeg video & audio filter graph for split-screen compositing.
 */
export function buildDopamineFFmpegFilter(config: DopamineConfig, width = 1080, height = 1920): {
  videoFilter: string;
  audioFilter: string;
} {
  const preset = DOPAMINE_PRESETS.find((p) => p.id === config.presetId) || DOPAMINE_PRESETS[0];

  if (!config.enabled) {
    return {
      videoFilter: `[0:v]scale=${width}:${height}[outv]`,
      audioFilter: `[0:a]volume=1.0[outa]`
    };
  }

  let videoFilter = "";
  if (config.layout === "50_50_split") {
    const halfH = Math.floor(height / 2);
    videoFilter =
      `[0:v]scale=${width}:${halfH}:force_original_aspect_ratio=increase,crop=${width}:${halfH}[top]; ` +
      `[1:v]scale=${width}:${halfH}:force_original_aspect_ratio=increase,crop=${width}:${halfH}[bottom]; ` +
      `[top][bottom]vstack=inputs=2[outv]`;
  } else if (config.layout === "60_40_focus") {
    const topH = Math.floor(height * 0.6);
    const bottomH = height - topH;
    videoFilter =
      `[0:v]scale=${width}:${topH}:force_original_aspect_ratio=increase,crop=${width}:${topH}[top]; ` +
      `[1:v]scale=${width}:${bottomH}:force_original_aspect_ratio=increase,crop=${width}:${bottomH}[bottom]; ` +
      `[top][bottom]vstack=inputs=2[outv]`;
  } else if (config.layout === "pip_bottom_right") {
    const pipW = Math.floor(width * 0.45);
    const pipH = Math.floor(height * 0.35);
    videoFilter =
      `[0:v]scale=${width}:${height}[main]; ` +
      `[1:v]scale=${pipW}:${pipH}:force_original_aspect_ratio=increase,crop=${pipW}:${pipH}[pip]; ` +
      `[main][pip]overlay=main_w-${pipW}-24:main_h-${pipH}-48[outv]`;
  } else {
    // dopamine_side_by_side
    const halfW = Math.floor(width / 2);
    videoFilter =
      `[0:v]scale=${halfW}:${height}:force_original_aspect_ratio=increase,crop=${halfW}:${height}[left]; ` +
      `[1:v]scale=${halfW}:${height}:force_original_aspect_ratio=increase,crop=${halfW}:${height}[right]; ` +
      `[left][right]hstack=inputs=2[outv]`;
  }

  const vol = (config.asmrVolume / 100) * preset.defaultAsmrVolume;
  const audioFilter = config.audioDuckingEnabled
    ? `[0:a]volume=1.0[maina]; [1:a]volume=${vol.toFixed(2)},sidechaincompress=threshold=0.1:ratio=4:attack=20:release=300[asmra]; [maina][asmra]amix=inputs=2:duration=first[outa]`
    : `[0:a]volume=1.0[maina]; [1:a]volume=${vol.toFixed(2)}[asmra]; [maina][asmra]amix=inputs=2:duration=first[outa]`;

  return { videoFilter, audioFilter };
}
