/**
 * ⚡ ZYVORIQ AUTO-SFX & KINETIC EMOJIS ENGINE (PHASE 4)
 * 
 * Provides automated script-driven keyword parsing to attach 3D animated kinetic emojis
 * and synchronized sound effects (Whoosh, Ding, Cash Chime, Bass Drop, Pop, Glitch).
 */

export type EmojiAnimation = "pop_bounce" | "spin_in" | "slide_from_bottom" | "floating_pulse" | "impact_slam";
export type EmojiPosition = "center" | "above_captions" | "top_center" | "left_badge" | "right_badge";
export type SFXType = "whoosh" | "ding" | "cash_chime" | "bass_drop" | "pop" | "riser" | "glitch";

export interface KineticEmojiItem {
  id: string;
  shotId: string;
  sceneIndex: number;
  keyword: string;
  emoji: string;
  label: string;
  startSec: number;
  durationSec: number;
  animation: EmojiAnimation;
  position: EmojiPosition;
  sfx: SFXType;
  sfxVolume: number; // 0.0 to 1.0
  enabled: boolean;
}

export interface EmojiPresetMapping {
  keywords: string[];
  emoji: string;
  label: string;
  animation: EmojiAnimation;
  sfx: SFXType;
}

export const EMOJI_KEYWORD_DICTIONARY: EmojiPresetMapping[] = [
  {
    keywords: ["rocket", "launch", "grow", "scale", "exponential", "speed", "fast", "surge"],
    emoji: "🚀",
    label: "Exponential Scale",
    animation: "pop_bounce",
    sfx: "whoosh"
  },
  {
    keywords: ["idea", "smart", "brain", "think", "learn", "algorithm", "intelligence", "mindset", "secret"],
    emoji: "💡",
    label: "Insight Spark",
    animation: "floating_pulse",
    sfx: "ding"
  },
  {
    keywords: ["money", "revenue", "profit", "invest", "financial", "growth", "rich", "wealth", "cash", "dollar"],
    emoji: "💰",
    label: "Wealth & Revenue",
    animation: "impact_slam",
    sfx: "cash_chime"
  },
  {
    keywords: ["fire", "viral", "hot", "killing", "destroy", "crazy", "insane", "lit", "energy", "habits"],
    emoji: "🔥",
    label: "Viral Fire",
    animation: "pop_bounce",
    sfx: "whoosh"
  },
  {
    keywords: ["chart", "stats", "graph", "metrics", "analytics", "numbers", "trend", "data"],
    emoji: "📈",
    label: "Upward Trend",
    animation: "slide_from_bottom",
    sfx: "ding"
  },
  {
    keywords: ["warning", "stop", "danger", "mistake", "fail", "trap", "never", "ruin", "risk"],
    emoji: "⚠️",
    label: "Critical Warning",
    animation: "impact_slam",
    sfx: "bass_drop"
  },
  {
    keywords: ["target", "focus", "goal", "execute", "precision", "discipline", "bullseye", "habit"],
    emoji: "🎯",
    label: "Precision Focus",
    animation: "spin_in",
    sfx: "pop"
  },
  {
    keywords: ["king", "winner", "best", "elite", "craft", "quality", "mastery", "champion"],
    emoji: "👑",
    label: "Elite Mastery",
    animation: "floating_pulse",
    sfx: "cash_chime"
  },
  {
    keywords: ["shock", "glitch", "future", "tech", "ai", "machine", "quantum", "magic"],
    emoji: "⚡",
    label: "High Voltage",
    animation: "pop_bounce",
    sfx: "glitch"
  }
];

export interface ShotLike {
  id: string;
  editorialDurationSec?: number;
  scriptText?: string;
  asset?: { videoUrl?: string };
}

/**
 * Automatically parses script texts across all scenes and generates synchronized kinetic emoji popups.
 */
export function autoGenerateKineticEmojis(shots: ShotLike[]): KineticEmojiItem[] {
  let accumulatedTime = 0;
  const items: KineticEmojiItem[] = [];

  shots.forEach((shot, index) => {
    const shotDuration = shot.editorialDurationSec || 4.0;
    const shotStart = accumulatedTime;
    accumulatedTime += shotDuration;

    const scriptLower = (shot.scriptText || "").toLowerCase();
    
    // Find matching dictionary entry
    const match = EMOJI_KEYWORD_DICTIONARY.find(entry =>
      entry.keywords.some(kw => scriptLower.includes(kw))
    );

    if (match) {
      // Trigger emoji 0.8s into the shot for dramatic punch
      const startSec = shotStart + 0.8;
      const durationSec = 1.4;

      items.push({
        id: `emoji_${shot.id}_${index}`,
        shotId: shot.id,
        sceneIndex: index,
        keyword: match.keywords.find(kw => scriptLower.includes(kw)) || match.keywords[0],
        emoji: match.emoji,
        label: match.label,
        startSec,
        durationSec,
        animation: match.animation,
        position: index % 2 === 0 ? "above_captions" : "top_center",
        sfx: match.sfx,
        sfxVolume: 0.85,
        enabled: true
      });
    }
  });

  return items;
}

/**
 * Retrieves active kinetic emojis at any given playback timestamp.
 */
export function getActiveEmojiAtTime(emojis: KineticEmojiItem[], currentTimeSec: number): KineticEmojiItem | null {
  return emojis.find(
    item => item.enabled && currentTimeSec >= item.startSec && currentTimeSec < (item.startSec + item.durationSec)
  ) || null;
}

/**
 * Synthesizes procedural Web Audio SFX (Whoosh, Ding, Cash Chime, Bass Drop, Pop, Glitch)
 * with zero third-party downloads or network latency.
 */
export function playProceduralSFX(type: SFXType, volume = 0.85): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    switch (type) {
      case "ding": {
        // High-pitched crystal bell (1760 Hz / 2640 Hz harmonics)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1760, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
        break;
      }

      case "whoosh": {
        // Filtered white noise frequency sweep
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start();
        noise.stop(ctx.currentTime + 0.45);
        break;
      }

      case "cash_chime": {
        // Dual metallic chime (2093 Hz & 2793 Hz)
        [2093, 2793].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

          gain.gain.setValueAtTime(0.7, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.65);
        });
        break;
      }

      case "bass_drop": {
        // Deep sub-bass drop (150 Hz -> 35 Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(1.0, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
        break;
      }

      case "pop": {
        // Fast woodblock pop (600 Hz -> 150 Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.9, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        break;
      }

      case "glitch": {
        // Rapid frequency square pulses
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.warn("SFX audio synth playback warning:", e);
  }
}
