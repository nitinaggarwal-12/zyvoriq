"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Undo2,
  Redo2,
  RotateCcw,
  Scissors,
  Plus,
  Trash2,
  Volume2,
  Music,
  Sparkles,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Film,
  X,
  Gauge,
  Lock,
  Unlock,
  Play,
  Pause,
  Palette,
  Activity,
  Eye,
} from "lucide-react";

export interface TimelineClipItem {
  id: string;
  title: string;
  videoUrl: string;
  sourceDurationSec: number;
  trimStartSec: number;
  trimEndSec: number;
  speed: number; // Per-clip visual speed (0.25x - 4.0x)
  enabled: boolean;
}

export interface SavedVersionItem {
  versionNumber: number;
  label: string;
  url: string;
  durationSec: number;
  createdAt?: string;
}

export interface EditorSnapshotState {
  clips: TimelineClipItem[];
  globalVideoSpeed: number; // Global visual speed multiplier (0.25x - 4.0x)
  colorGrading: string; // "none" | "cyberpunk_neon" | "golden_hour_warm" | "mediterranean_sunlit" | "bollywood_royal" | "vintage_film"
  // Track 2: Dialogue / Vocals
  vocalMode: "original" | "mute" | "custom";
  vocalVolume: number; // 0.0 to 1.5 (150%)
  vocalSpeed: number; // Independent dialogue/vocal speed (0.25x - 4.0x)
  // Track 3: Music Bed (Unaltered continuous lock by default)
  musicTrack: string;
  musicLockMode: "unaltered" | "custom_trim";
  musicVolume: number; // 0.0 to 1.5
  musicSpeed: number; // Independent music speed (0.25x - 4.0x)
  // Track 4: Background SFX
  sfxTrack: string;
  sfxVolume: number; // 0.0 to 1.0
  sfxSpeed: number; // Independent SFX speed (0.25x - 4.0x)
}

interface ReelTimelineEditorProps {
  reelId: string;
  reelTitle: string;
  masterVideoUrl: string;
  initialShots?: Array<{
    id?: string;
    title?: string;
    videoUrl?: string;
    durationSec?: number;
  }>;
  initialVersions?: SavedVersionItem[];
  onClose?: () => void;
  onVersionSaved?: (newVersion: SavedVersionItem, allVersions: SavedVersionItem[]) => void;
}

export const MUSIC_PRESETS = [
  { label: "🎼 Original Lyria 3.5 Master Soundtrack (Unaltered)", value: "original_lyria" },
  { label: "🎻 Romantic Orchestra Score (Bollywood Strings)", value: "/assets/audio/music/bollywood_romance_orchestra.mp3" },
  { label: "🥁 Punjabi Dhol & Tumbi Groove (128 BPM)", value: "/assets/audio/music/punjabi_dhol_tumbi_128bpm.mp3" },
  { label: "🔇 No Background Music Bed", value: "none" },
];

export const SFX_PRESETS = [
  { label: "🔇 None (Clean Studio Mix)", value: "none" },
  { label: "🏖️ Summer Pool Party Water Splashes & Sun", value: "/assets/audio/sfx/pool_party_splash.mp3" },
  { label: "🎉 Nightclub Stage Concert Crowd Cheer", value: "/assets/audio/sfx/club_crowd_cheer.mp3" },
  { label: "☕ Coastal Ocean Breeze & Surf Ambiance", value: "/assets/audio/sfx/coastal_ocean_breeze.mp3" },
  { label: "🌧️ Cinematic Vinyl Crackle & Warm Rain", value: "/assets/audio/sfx/vinyl_rain_ambiance.mp3" },
];

export const COLOR_GRADING_LUT_MAP: Record<
  string,
  { label: string; filter: string; description: string; badge: string }
> = {
  none: {
    label: "🎞️ Natural Rec.709 (No Grade)",
    filter: "none",
    description: "Standard cinematic color profile with neutral balance",
    badge: "Rec.709 Neutral",
  },
  cyberpunk_neon: {
    label: "🌆 Cyberpunk Neon Cyan/Magenta",
    filter: "contrast(1.22) saturate(1.4) hue-rotate(-15deg)",
    description: "Deep cool shadows with saturated high-energy neon highlights",
    badge: "Teal & Magenta",
  },
  golden_hour_warm: {
    label: "🌅 Golden Hour Mediterranean Warmth",
    filter: "sepia(0.25) saturate(1.3) contrast(1.1) brightness(1.04)",
    description: "Sun-drenched Mediterranean bronze tones with rich skin warmth",
    badge: "3200K Sunset",
  },
  mediterranean_sunlit: {
    label: "☀️ Sunlit Turquoise Pool Horizon",
    filter: "contrast(1.15) saturate(1.3) brightness(1.05) hue-rotate(5deg)",
    description: "Vibrant coastal blues and crisp radiant poolside highlights",
    badge: "Vibrant Aqua",
  },
  bollywood_royal: {
    label: "👑 Bollywood Royal Velvet & Gold",
    filter: "contrast(1.2) saturate(1.4) brightness(1.02) sepia(0.12)",
    description: "Rich opulent jewel tones with golden highlights and velvety blacks",
    badge: "Opulent Regal",
  },
  vintage_film: {
    label: "🎥 Vintage 35mm Technicolor Warmth",
    filter: "sepia(0.35) contrast(1.12) brightness(0.96)",
    description: "Classic analog celluloid warmth with softened contrast and grain feel",
    badge: "1970s Stock",
  },
};

export function ReelTimelineEditor({
  reelId,
  reelTitle,
  masterVideoUrl,
  initialShots = [],
  initialVersions = [],
  onClose,
  onVersionSaved,
}: ReelTimelineEditorProps) {
  const buildDefaultClips = (): TimelineClipItem[] => {
    const validShots = initialShots.filter((s) => s && (s.videoUrl || (s as any).url));
    if (validShots.length > 0) {
      return validShots.map((s, idx) => {
        const dur = Number(s.durationSec || (s as any).duration || 6.0);
        const rawUrl =
          typeof s.videoUrl === "string"
            ? s.videoUrl
            : typeof (s as any).url === "string"
            ? (s as any).url
            : typeof (s.videoUrl as any)?.url === "string"
            ? (s.videoUrl as any).url
            : masterVideoUrl;
        return {
          id: s.id || `shot_${idx + 1}`,
          title: s.title || `Shot ${idx + 1}`,
          videoUrl: rawUrl,
          sourceDurationSec: dur,
          trimStartSec: 0,
          trimEndSec: dur,
          speed: 1.0,
          enabled: true,
        };
      });
    }
    return [0, 1, 2, 3].map((idx) => ({
      id: `seg_${idx + 1}`,
      title: `Shot ${idx + 1} (${idx * 6}s–${(idx + 1) * 6}s)`,
      videoUrl: masterVideoUrl,
      sourceDurationSec: 6.0,
      trimStartSec: 0,
      trimEndSec: 6.0,
      speed: 1.0,
      enabled: true,
    }));
  };

  const initialSnapshot: EditorSnapshotState = {
    clips: buildDefaultClips(),
    globalVideoSpeed: 1.0,
    colorGrading: "none",
    vocalMode: "original",
    vocalVolume: 1.0,
    vocalSpeed: 1.0,
    musicTrack: "original_lyria",
    musicLockMode: "unaltered",
    musicVolume: 0.65,
    musicSpeed: 1.0,
    sfxTrack: "none",
    sfxVolume: 0.35,
    sfxSpeed: 1.0,
  };

  // Full Undo / Redo History Stack
  const [history, setHistory] = useState<EditorSnapshotState[]>([initialSnapshot]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const currentState = history[historyIndex] || initialSnapshot;

  const pushState = useCallback(
    (updater: (prev: EditorSnapshotState) => EditorSnapshotState) => {
      setHistory((prevHistory) => {
        const current = prevHistory[historyIndex] || prevHistory[prevHistory.length - 1];
        const next = updater(JSON.parse(JSON.stringify(current)));
        const sliced = prevHistory.slice(0, historyIndex + 1);
        return [...sliced, next];
      });
      setHistoryIndex((prevIdx) => prevIdx + 1);
    },
    [historyIndex]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) setHistoryIndex((i) => i - 1);
  };

  const handleRedo = () => {
    if (canRedo) setHistoryIndex((i) => i + 1);
  };

  const handleRestoreOriginal = () => {
    pushState(() => JSON.parse(JSON.stringify(initialSnapshot)));
  };

  const handleResetShot = (idx: number) => {
    pushState((prev) => {
      const copy = [...prev.clips];
      if (copy[idx]) {
        copy[idx] = {
          ...copy[idx],
          trimStartSec: 0,
          trimEndSec: copy[idx].sourceDurationSec,
          speed: 1.0,
          enabled: true,
        };
      }
      return { ...prev, clips: copy };
    });
  };

  const handleResetAllClips = () => {
    pushState((prev) => ({
      ...prev,
      clips: buildDefaultClips(),
      globalVideoSpeed: 1.0,
    }));
  };

  const handleResetGlobalSpeed = () => {
    pushState((prev) => ({ ...prev, globalVideoSpeed: 1.0 }));
  };

  const handleResetLut = () => {
    pushState((prev) => ({ ...prev, colorGrading: "none" }));
  };

  const handleResetVocals = () => {
    pushState((prev) => ({
      ...prev,
      vocalMode: "original",
      vocalVolume: 1.0,
      vocalSpeed: 1.0,
    }));
  };

  const handleResetMusic = () => {
    pushState((prev) => ({
      ...prev,
      musicTrack: "original_lyria",
      musicLockMode: "unaltered",
      musicVolume: 0.65,
      musicSpeed: 1.0,
    }));
  };

  const handleResetSfx = () => {
    pushState((prev) => ({
      ...prev,
      sfxTrack: "none",
      sfxVolume: 0.35,
      sfxSpeed: 1.0,
    }));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          if (historyIndex < history.length - 1) setHistoryIndex((i) => i + 1);
        } else {
          e.preventDefault();
          if (historyIndex > 0) setHistoryIndex((i) => i - 1);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (historyIndex < history.length - 1) setHistoryIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [historyIndex, history.length]);

  // Saved Versions State
  const [versions, setVersions] = useState<SavedVersionItem[]>(() => {
    if (initialVersions && initialVersions.length > 0) return initialVersions;
    return [
      {
        versionNumber: 1,
        label: "v1 • Original Master",
        url: masterVideoUrl,
        durationSec: 24.0,
      },
    ];
  });
  const [activeVersionUrl, setActiveVersionUrl] = useState<string>(masterVideoUrl);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderSuccessMsg, setRenderSuccessMsg] = useState<string | null>(null);
  const [renderErrorMsg, setRenderErrorMsg] = useState<string | null>(null);
  const [versionTitleInput, setVersionTitleInput] = useState<string>("");

  // Live preview & playback states
  // "shot": preview the selected constituent shot in isolation with frame looping & shot speed
  // "sequence": preview the rendered master sequence with global speed
  const [previewMode, setPreviewMode] = useState<"shot" | "sequence">("shot");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [isAuditioningSFX, setIsAuditioningSFX] = useState<boolean>(false);
  const [isAuditioningMusic, setIsAuditioningMusic] = useState<boolean>(false);

  // Live preview player DOM elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

  const activeClip = currentState.clips[selectedClipIndex] || currentState.clips[0];

  // Compute effective visual playback speed
  const effectiveVisualSpeed =
    previewMode === "shot"
      ? (activeClip?.speed || 1.0) * (currentState.globalVideoSpeed || 1.0)
      : currentState.globalVideoSpeed || 1.0;

  // Determine active video source URL
  const currentVideoSrc =
    previewMode === "shot"
      ? activeClip?.videoUrl || masterVideoUrl
      : activeVersionUrl;

  // Real-time synchronization of playback rates, volumes, and audio states
  useEffect(() => {
    if (videoRef.current) {
      // Direct unclamped playback rate supporting 0.25x to 4.0x
      const rate = Math.max(0.25, Math.min(4.0, effectiveVisualSpeed));
      try {
        videoRef.current.playbackRate = rate;
      } catch (err) {
        // Fallback if browser limits
      }
      videoRef.current.volume =
        currentState.vocalMode === "mute" ? 0 : Math.min(1.0, currentState.vocalVolume);
    }
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = Math.min(1.0, currentState.musicVolume);
      const mRate = Math.max(0.25, Math.min(4.0, currentState.musicSpeed || 1.0));
      try {
        musicAudioRef.current.playbackRate = mRate;
      } catch (err) {}
    }
    if (sfxAudioRef.current) {
      sfxAudioRef.current.volume = Math.min(1.0, currentState.sfxVolume);
      const sRate = Math.max(0.25, Math.min(4.0, currentState.sfxSpeed || 1.0));
      try {
        sfxAudioRef.current.playbackRate = sRate;
      } catch (err) {}
    }
  }, [
    effectiveVisualSpeed,
    currentState.vocalMode,
    currentState.vocalVolume,
    currentState.musicVolume,
    currentState.musicSpeed,
    currentState.sfxVolume,
    currentState.sfxSpeed,
  ]);

  // Frame-accurate time update & looping logic
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    setCurrentPlayTime(ct);

    // In isolated shot preview mode, clamp and loop strictly within trimStartSec and trimEndSec
    if (previewMode === "shot" && activeClip) {
      const inSec = activeClip.trimStartSec;
      const outSec = activeClip.trimEndSec;
      if (ct < inSec || ct >= outSec) {
        videoRef.current.currentTime = inSec;
      }
    }
  };

  // Sync secondary audio elements on play
  const handlePlay = () => {
    setIsPlaying(true);
    if (
      musicAudioRef.current &&
      currentState.musicTrack !== "none" &&
      currentState.musicTrack !== "original_lyria"
    ) {
      musicAudioRef.current.currentTime = videoRef.current?.currentTime || 0;
      musicAudioRef.current.play().catch(() => {});
    }
    if (sfxAudioRef.current && currentState.sfxTrack !== "none") {
      sfxAudioRef.current.currentTime = videoRef.current?.currentTime || 0;
      sfxAudioRef.current.play().catch(() => {});
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    musicAudioRef.current?.pause();
    sfxAudioRef.current?.pause();
  };

  // Immediate interactive frame seeking when scrubbing in/out sliders
  const handleSeekFrame = (targetSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
      setCurrentPlayTime(targetSec);
    }
  };

  // Toggle SFX Auditioning (allows hearing the sound effect on demand)
  const toggleAuditionSFX = () => {
    if (isAuditioningSFX) {
      sfxAudioRef.current?.pause();
      setIsAuditioningSFX(false);
    } else {
      if (sfxAudioRef.current && currentState.sfxTrack !== "none") {
        sfxAudioRef.current.currentTime = 0;
        sfxAudioRef.current.play().then(() => {
          setIsAuditioningSFX(true);
          setTimeout(() => {
            sfxAudioRef.current?.pause();
            setIsAuditioningSFX(false);
          }, 4000);
        }).catch(() => {
          setIsAuditioningSFX(false);
        });
      }
    }
  };

  // Toggle Music Bed Auditioning
  const toggleAuditionMusic = () => {
    if (isAuditioningMusic) {
      musicAudioRef.current?.pause();
      setIsAuditioningMusic(false);
    } else {
      if (
        musicAudioRef.current &&
        currentState.musicTrack !== "none" &&
        currentState.musicTrack !== "original_lyria"
      ) {
        musicAudioRef.current.currentTime = 0;
        musicAudioRef.current.play().then(() => {
          setIsAuditioningMusic(true);
          setTimeout(() => {
            musicAudioRef.current?.pause();
            setIsAuditioningMusic(false);
          }, 5000);
        }).catch(() => {
          setIsAuditioningMusic(false);
        });
      }
    }
  };

  const totalEditedDurationSec = currentState.clips
    .filter((c) => c.enabled)
    .reduce(
      (acc, c) =>
        acc +
        Math.max(
          0.2,
          (c.trimEndSec - c.trimStartSec) / ((c.speed || 1) * (currentState.globalVideoSpeed || 1))
        ),
      0
    );

  const updateClip = (idx: number, patch: Partial<TimelineClipItem>) => {
    pushState((prev) => {
      const nextClips = [...prev.clips];
      nextClips[idx] = { ...nextClips[idx], ...patch };
      return { ...prev, clips: nextClips };
    });
  };

  const handleSplitClipAtMidpoint = (idx: number) => {
    pushState((prev) => {
      const target = prev.clips[idx];
      if (!target) return prev;
      const mid = Number(((target.trimStartSec + target.trimEndSec) / 2).toFixed(2));
      if (mid - target.trimStartSec < 0.4) return prev;
      const partA: TimelineClipItem = {
        ...target,
        id: `${target.id}_A_${Date.now().toString().slice(-3)}`,
        title: `${target.title} (Part A)`,
        trimEndSec: mid,
      };
      const partB: TimelineClipItem = {
        ...target,
        id: `${target.id}_B_${Date.now().toString().slice(-3)}`,
        title: `${target.title} (Part B)`,
        trimStartSec: mid,
      };
      const nextClips = [...prev.clips];
      nextClips.splice(idx, 1, partA, partB);
      return { ...prev, clips: nextClips };
    });
  };

  const handleDuplicateOrAddClip = (idx: number) => {
    pushState((prev) => {
      const target = prev.clips[idx] || prev.clips[prev.clips.length - 1];
      if (!target) return prev;
      const copy: TimelineClipItem = {
        ...target,
        id: `added_${Date.now().toString().slice(-4)}`,
        title: `${target.title} (Added Frame Cut)`,
        enabled: true,
      };
      const nextClips = [...prev.clips];
      nextClips.splice(idx + 1, 0, copy);
      return { ...prev, clips: nextClips };
    });
    setSelectedClipIndex(idx + 1);
  };

  const handleMoveClip = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= currentState.clips.length) return;
    pushState((prev) => {
      const nextClips = [...prev.clips];
      const temp = nextClips[idx];
      nextClips[idx] = nextClips[targetIdx];
      nextClips[targetIdx] = temp;
      return { ...prev, clips: nextClips };
    });
    setSelectedClipIndex(targetIdx);
  };

  const handleRenderNewVersion = async () => {
    setIsRendering(true);
    setRenderErrorMsg(null);
    setRenderSuccessMsg(null);
    try {
      const res = await fetch("/api/reels/editor/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reelId,
          title:
            versionTitleInput.trim() ||
            `v${versions.length + 1} • Edited Master (${totalEditedDurationSec.toFixed(1)}s)`,
          clips: currentState.clips,
          globalVideoSpeed: currentState.globalVideoSpeed,
          colorGrading: currentState.colorGrading,
          vocalMode: currentState.vocalMode,
          vocalVolume: currentState.vocalVolume,
          vocalSpeed: currentState.vocalSpeed,
          musicTrack: currentState.musicTrack,
          musicLockMode: currentState.musicLockMode,
          musicVolume: currentState.musicVolume,
          musicSpeed: currentState.musicSpeed,
          sfxTrack: currentState.sfxTrack,
          sfxVolume: currentState.sfxVolume,
          sfxSpeed: currentState.sfxSpeed,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to render edited master.");
      }

      const newVer: SavedVersionItem = {
        versionNumber: data.versionNumber || versions.length + 1,
        label:
          versionTitleInput.trim() ||
          `v${data.versionNumber || versions.length + 1} • Studio NLE Edit (${data.durationSec}s)`,
        url: data.outputUrl,
        durationSec: data.durationSec,
        createdAt: new Date().toISOString(),
      };
      const updatedVersions = data.versions?.length ? data.versions : [...versions, newVer];
      setVersions(updatedVersions);
      setActiveVersionUrl(data.outputUrl);
      setPreviewMode("sequence");
      setVersionTitleInput("");
      setRenderSuccessMsg(
        `✓ Rendered and saved new version "${newVer.label}" in ${data.durationSec}s! Original master (v1) is preserved.`
      );
      if (onVersionSaved) {
        onVersionSaved(newVer, updatedVersions);
      }
    } catch (err: any) {
      setRenderErrorMsg(err?.message || "Render failed");
    } finally {
      setIsRendering(false);
    }
  };

  const activeColorFilter =
    COLOR_GRADING_LUT_MAP[currentState.colorGrading || "none"]?.filter || "none";

  return (
    <div className="w-full bg-[#090D16] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-6">
      {/* TOP BAR: Title, Undo / Redo / Restore Controls, Save New Version Button */}
      <div className="px-6 py-4 bg-[#0B111E] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Studio NLE Multi-Track Video &amp; Audio Editor</h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-teal-950 text-teal-300 border border-teal-800">
                Independent 4-Track Speeds &amp; Unaltered Music Lock
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              Editing: <span className="text-slate-200 font-medium">{reelTitle}</span> ({reelId})
            </p>
          </div>
        </div>

        {/* Undo / Redo / Restore Toolbar */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            disabled={!canUndo}
            onClick={handleUndo}
            title="Undo last action (Ctrl+Z)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4 text-teal-400" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={handleRedo}
            title="Redo action (Ctrl+Y)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-35 text-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4 text-teal-400" />
            <span>Redo</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={handleRestoreOriginal}
            title="Restore all shots, speeds, and audio tracks back to original baseline"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Baseline</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500 pl-1">
            Step {historyIndex + 1}/{history.length}
          </span>
        </div>

        {/* Save New Version & Close */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={versionTitleInput}
            onChange={(e) => setVersionTitleInput(e.target.value)}
            placeholder={`v${versions.length + 1} Custom Version Label...`}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 w-44"
          />
          <button
            type="button"
            disabled={isRendering}
            onClick={handleRenderNewVersion}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-teal-950/50 transition cursor-pointer"
          >
            {isRendering ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Rendering v{versions.length + 1}...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Render &amp; Save New Version (v{versions.length + 1})</span>
              </>
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Editor"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* SAVED VERSIONS BAR (Non-Destructive Version History) */}
      <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            Saved Versions ({versions.length}):
          </span>
          {versions.map((ver, vIdx) => {
            const isActive = activeVersionUrl === ver.url;
            return (
              <button
                key={`ver_${ver.versionNumber ?? vIdx}_${vIdx}`}
                type="button"
                onClick={() => {
                  setActiveVersionUrl(ver.url);
                  setPreviewMode("sequence");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-teal-500/20 border border-teal-500 text-teal-300"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{ver.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>
            Edited Visual Duration:{" "}
            <strong className="text-teal-300">{totalEditedDurationSec.toFixed(2)}s</strong> (
            {Math.round(totalEditedDurationSec * 24)} frames)
          </span>
          <a
            href={activeVersionUrl}
            download
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Download Active MP4
          </a>
        </div>
      </div>

      {/* STATUS / FEEDBACK BANNERS */}
      {renderSuccessMsg && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between">
          <span>{renderSuccessMsg}</span>
          <button onClick={() => setRenderSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}
      {renderErrorMsg && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/70 border border-red-700 text-red-200 text-xs flex items-center justify-between">
          <span>Error: {renderErrorMsg}</span>
          <button onClick={() => setRenderErrorMsg(null)} className="text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE: Left Preview Player + Right 4-Track Independent NLE Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* LEFT 5 COLS: Live Video Preview & Selected Shot Frame Trimmer */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Dual Preview Switcher: Shot Preview vs Master Sequence Preview */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setPreviewMode("shot");
                if (videoRef.current && activeClip) {
                  videoRef.current.currentTime = activeClip.trimStartSec;
                }
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                previewMode === "shot"
                  ? "bg-teal-500/20 border border-teal-500/60 text-teal-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Isolated Shot #{selectedClipIndex + 1} Preview</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewMode("sequence");
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                }
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                previewMode === "sequence"
                  ? "bg-teal-500/20 border border-teal-500/60 text-teal-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Full Sequence Preview</span>
            </button>
          </div>

          {/* Interactive Player Viewport with Live Color LUT Filter and Real-Time Speed */}
          <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden aspect-[9/16] max-h-[440px] flex items-center justify-center mx-auto w-full group">
            <video
              ref={videoRef}
              key={previewMode === "shot" ? `shot_${selectedClipIndex}_${activeClip?.videoUrl}` : `seq_${activeVersionUrl}`}
              src={currentVideoSrc}
              controls
              playsInline
              preload="auto"
              style={{ filter: activeColorFilter }}
              className="w-full h-full object-contain transition-all duration-200"
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
            />

            {/* Audio elements for music and SFX */}
            {currentState.musicTrack !== "none" && currentState.musicTrack !== "original_lyria" && (
              <audio ref={musicAudioRef} src={currentState.musicTrack} loop preload="auto" />
            )}
            {currentState.sfxTrack !== "none" && (
              <audio ref={sfxAudioRef} src={currentState.sfxTrack} loop preload="auto" />
            )}

            {/* Live Playback Telemetry HUD Overlays */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/80 border border-teal-500/40 text-[11px] font-mono font-bold text-teal-300 backdrop-blur-md">
                ⚡ {effectiveVisualSpeed.toFixed(2)}x Visual Speed
              </span>
              {currentState.colorGrading !== "none" && (
                <span className="px-2 py-0.5 rounded bg-black/80 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 backdrop-blur-md">
                  🎨 {COLOR_GRADING_LUT_MAP[currentState.colorGrading]?.badge}
                </span>
              )}
            </div>

            <div className="absolute bottom-12 right-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                {previewMode === "shot"
                  ? `In: ${activeClip.trimStartSec.toFixed(2)}s → Out: ${activeClip.trimEndSec.toFixed(2)}s`
                  : `Master Sequence (${totalEditedDurationSec.toFixed(1)}s)`}
              </span>
            </div>
          </div>

          {/* Motional Waveform & Playback Telemetry Visualizer */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isPlaying ? "text-teal-400 animate-pulse" : "text-slate-600"}`} />
              <span className="text-slate-400">
                Live Engine:{" "}
                <strong className={isPlaying ? "text-emerald-300" : "text-slate-400"}>
                  {isPlaying ? "Playing (Real-Time Reactive)" : "Paused"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Audio Pressure:</span>
              <div className="flex items-end gap-0.5 h-3">
                {[4, 8, 12, 16, 10, 14, 6].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: isPlaying ? `${Math.min(16, h * (currentState.vocalVolume || 1))}px` : "3px",
                      backgroundColor: isPlaying ? (i % 2 === 0 ? "#2dd4bf" : "#a855f7") : "#334155",
                    }}
                    className="w-1 rounded-sm transition-all duration-150"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Selected Shot Frame Trimmer & Per-Clip Speed Inspector */}
          {activeClip && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Selected Shot #{selectedClipIndex + 1}: {activeClip.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleResetShot(selectedClipIndex)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="Reset selected shot trim and speed back to full source duration"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Shot
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitClipAtMidpoint(selectedClipIndex)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Split shot into two independent clips at midpoint frame"
                  >
                    <Scissors className="w-3.5 h-3.5 text-teal-400" />
                    Split Clip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateOrAddClip(selectedClipIndex)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Insert / add frame segment after this clip"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    Add Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => updateClip(selectedClipIndex, { enabled: !activeClip.enabled })}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      activeClip.enabled
                        ? "bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/60"
                        : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {activeClip.enabled ? "Remove Shot" : "Restore Shot"}
                  </button>
                </div>
              </div>

              {/* Source Shot Switcher for Multi-Shot Productions */}
              {initialShots.length > 0 && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 shrink-0 font-medium">Switch Shot Source:</span>
                  <select
                    value={activeClip.videoUrl}
                    onChange={(e) => {
                      const sel = initialShots.find((s) => (s.videoUrl || (s as any).url) === e.target.value);
                      if (sel) {
                        const dur = Number(sel.durationSec || 6.0);
                        updateClip(selectedClipIndex, {
                          videoUrl: sel.videoUrl || (sel as any).url,
                          title: sel.title || activeClip.title,
                          sourceDurationSec: dur,
                          trimEndSec: Math.min(activeClip.trimEndSec, dur),
                        });
                        setPreviewMode("shot");
                      }
                    }}
                    className="bg-slate-900 text-teal-300 font-mono text-xs rounded px-2 py-1 border border-slate-700 outline-none w-full max-w-[260px] cursor-pointer"
                  >
                    {initialShots.map((s, idx) => (
                      <option key={`init_shot_${s.id || idx}_${idx}`} value={s.videoUrl || (s as any).url}>
                        {s.title || `Shot #${idx + 1}`} ({s.durationSec || 6}s)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Frame-accurate In/Out Trimmers + Per-Clip Visual Speed with Interactive Frame Seeking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Trim In-Frame:</span>
                    <span className="font-mono text-teal-300 font-bold">
                      {activeClip.trimStartSec.toFixed(2)}s ({Math.round(activeClip.trimStartSec * 24)}f)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, activeClip.trimEndSec - 0.2)}
                    step={0.04}
                    value={activeClip.trimStartSec}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateClip(selectedClipIndex, { trimStartSec: val });
                      handleSeekFrame(val);
                    }}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Trim Out-Frame:</span>
                    <span className="font-mono text-teal-300 font-bold">
                      {activeClip.trimEndSec.toFixed(2)}s ({Math.round(activeClip.trimEndSec * 24)}f)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.min(activeClip.sourceDurationSec, activeClip.trimStartSec + 0.2)}
                    max={activeClip.sourceDurationSec}
                    step={0.04}
                    value={activeClip.trimEndSec}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateClip(selectedClipIndex, { trimEndSec: val });
                      handleSeekFrame(val);
                    }}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Shot Visual Speed:</span>
                    <span className="font-mono text-teal-300 font-bold">{(activeClip.speed || 1).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={4.0}
                    step={0.05}
                    value={activeClip.speed || 1.0}
                    onChange={(e) => updateClip(selectedClipIndex, { speed: parseFloat(e.target.value) })}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 7 COLS: 4 Independent Tracks + Cinematic Color Grading */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* TRACK 1: VISUAL VIDEO SEQUENCE & GLOBAL VISUAL SPEED */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 1 • Visual Video Frames ({currentState.clips.filter((c) => c.enabled).length} cuts)
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs text-slate-400">Global Video Speed:</span>
                  <input
                    type="range"
                    min={0.25}
                    max={4.0}
                    step={0.05}
                    value={currentState.globalVideoSpeed}
                    onChange={(e) =>
                      pushState((prev) => ({ ...prev, globalVideoSpeed: parseFloat(e.target.value) }))
                    }
                    className="w-20 accent-teal-400 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-teal-300 w-10 text-right">
                    {currentState.globalVideoSpeed.toFixed(2)}x
                  </span>
                  {currentState.globalVideoSpeed !== 1.0 && (
                    <button
                      type="button"
                      onClick={handleResetGlobalSpeed}
                      title="Reset global video speed to 1.00x"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {initialShots.length > 0 && (
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const s = initialShots.find((item) => (item.videoUrl || (item as any).url) === val);
                      if (s) {
                        pushState((prev) => {
                          const newClip: TimelineClipItem = {
                            id: `shot_${Date.now().toString().slice(-4)}_${prev.clips.length + 1}`,
                            title: s.title || `Shot #${prev.clips.length + 1}`,
                            videoUrl: s.videoUrl || (s as any).url || masterVideoUrl,
                            sourceDurationSec: Number(s.durationSec || 6.0),
                            trimStartSec: 0,
                            trimEndSec: Number(s.durationSec || 6.0),
                            speed: 1.0,
                            enabled: true,
                          };
                          return { ...prev, clips: [...prev.clips, newClip] };
                        });
                        setSelectedClipIndex(currentState.clips.length);
                      }
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer outline-none"
                  >
                    <option value="" disabled>+ Add Constituent Shot...</option>
                    {initialShots.map((s, idx) => (
                      <option key={`add_shot_${s.id || idx}_${idx}`} value={s.videoUrl || (s as any).url} className="bg-slate-900 text-slate-200">
                        + {s.title || `Shot #${idx + 1}`} ({s.durationSec || 6}s)
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => handleDuplicateOrAddClip(currentState.clips.length - 1)}
                  className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Frame Cut
                </button>

                <button
                  type="button"
                  onClick={handleResetAllClips}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                  title="Reset all constituent shots back to original timeline cuts"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Reset Shots
                </button>
              </div>
            </div>

            {/* Horizontal Shot Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {currentState.clips.map((clip, idx) => {
                const isSelected = idx === selectedClipIndex;
                const netDur = Math.max(
                  0.2,
                  (clip.trimEndSec - clip.trimStartSec) / ((clip.speed || 1) * (currentState.globalVideoSpeed || 1))
                );
                return (
                  <div
                    key={`${clip.id || "clip"}_${idx}`}
                    onClick={() => {
                      setSelectedClipIndex(idx);
                      setPreviewMode("shot");
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      !clip.enabled
                        ? "bg-slate-950/40 border-slate-800/50 opacity-45"
                        : isSelected
                        ? "bg-teal-950/40 border-teal-500 shadow-md shadow-teal-950/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-200">
                        <span className="truncate">
                          #{idx + 1} {clip.title}
                        </span>
                        {!clip.enabled && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400">Cut</span>
                        )}
                      </div>
                      <div className="mt-1.5 text-[11px] font-mono text-teal-300">
                        {netDur.toFixed(2)}s ({Math.round(netDur * 24)}f) @ {(clip.speed || 1).toFixed(2)}x
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        In: {clip.trimStartSec.toFixed(1)}s → Out: {clip.trimEndSec.toFixed(1)}s
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveClip(idx, -1);
                          }}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentState.clips.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveClip(idx, 1);
                          }}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetShot(idx);
                          }}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 cursor-pointer transition"
                          title="Reset shot trim & speed"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateClip(idx, { enabled: !clip.enabled });
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        {clip.enabled ? "Remove" : "Restore"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLOR GRADING & 35MM LUT CONTROLLER */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 5 • Theatrical Color Grading &amp; 35mm LUT Matrix
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {currentState.colorGrading !== "none" && (
                  <button
                    type="button"
                    onClick={handleResetLut}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-800/40 transition cursor-pointer"
                    title="Reset color grading to Natural Rec.709"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset LUT</span>
                  </button>
                )}
                <span className="text-xs font-mono text-pink-300 bg-pink-950/40 border border-pink-800/40 px-2 py-0.5 rounded">
                  Live Video Preview Filter Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(COLOR_GRADING_LUT_MAP).map(([key, info]) => {
                const isSelected = (currentState.colorGrading || "none") === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pushState((prev) => ({ ...prev, colorGrading: key }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-pink-950/40 border-pink-500 shadow-md shadow-pink-950/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{info.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{info.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: DIALOGUE / VOCALS STEM (Independent Speed & Volume) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 2 • Dialogue &amp; Singing Vocals (Independent Speed &amp; Gain)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetVocals}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-800/40 transition cursor-pointer"
                  title="Reset vocal stem gain and speed back to 100% and 1.00x"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Vocals</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    pushState((prev) => ({
                      ...prev,
                      vocalMode: prev.vocalMode === "mute" ? "original" : "mute",
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentState.vocalMode === "mute"
                      ? "bg-red-950/70 border border-red-700 text-red-300"
                      : "bg-blue-950/60 border border-blue-700 text-blue-300"
                  }`}
                >
                  {currentState.vocalMode === "mute" ? "🔇 Dialogues Muted" : "🎤 Dialogues / Vocals Active"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Dialogue / Vocal Gain:</span>
                  <span className="font-mono text-blue-300 font-bold">
                    {currentState.vocalMode === "mute" ? "0%" : `${Math.round(currentState.vocalVolume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  disabled={currentState.vocalMode === "mute"}
                  value={currentState.vocalMode === "mute" ? 0 : currentState.vocalVolume}
                  onChange={(e) =>
                    pushState((prev) => ({ ...prev, vocalVolume: parseFloat(e.target.value), vocalMode: "original" }))
                  }
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Independent Dialogue Speed:</span>
                  <span className="font-mono text-blue-300 font-bold">{currentState.vocalSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={4.0}
                  step={0.05}
                  disabled={currentState.vocalMode === "mute"}
                  value={currentState.vocalSpeed}
                  onChange={(e) =>
                    pushState((prev) => ({ ...prev, vocalSpeed: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* TRACK 3: UNALTERED CONTINUOUS MUSIC BED (Independent Speed & Lock Mode) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 3 • Continuous Music Bed (Unaltered Across Video Frame Cuts)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetMusic}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/40 transition cursor-pointer"
                  title="Reset music bed to original Lyria master at 65% volume"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Music</span>
                </button>
                {/* Unaltered Music Lock Switch */}
                <button
                  type="button"
                  onClick={() =>
                    pushState((prev) => ({
                      ...prev,
                      musicLockMode: prev.musicLockMode === "unaltered" ? "custom_trim" : "unaltered",
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    currentState.musicLockMode === "unaltered"
                      ? "bg-emerald-950/80 border border-emerald-600/80 text-emerald-300"
                      : "bg-slate-800 border border-slate-700 text-slate-300"
                  }`}
                  title="When Unaltered Lock is ON, cutting or adding video frames will NEVER chop or restart the music bed"
                >
                  {currentState.musicLockMode === "unaltered" ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Music Locked Unaltered (Seamless)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Music Trimmed to Cuts</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-slate-400">Select Music Track:</label>
                  {currentState.musicTrack !== "none" && currentState.musicTrack !== "original_lyria" && (
                    <button
                      type="button"
                      onClick={toggleAuditionMusic}
                      className="text-[10px] font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {isAuditioningMusic ? <Pause className="w-3 h-3 text-purple-400" /> : <Play className="w-3 h-3 text-purple-400" />}
                      <span>{isAuditioningMusic ? "Stop Test" : "Audition (5s)"}</span>
                    </button>
                  )}
                </div>
                <select
                  value={currentState.musicTrack}
                  onChange={(e) => pushState((prev) => ({ ...prev, musicTrack: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {MUSIC_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Music Volume:</span>
                  <span className="font-mono text-purple-300 font-bold">{Math.round(currentState.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={currentState.musicVolume}
                  onChange={(e) => pushState((prev) => ({ ...prev, musicVolume: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Independent Music Speed:</span>
                  <span className="font-mono text-purple-300 font-bold">{currentState.musicSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={4.0}
                  step={0.05}
                  value={currentState.musicSpeed}
                  onChange={(e) => pushState((prev) => ({ ...prev, musicSpeed: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* TRACK 4: BACKGROUND SOUND EFFECT / FOLEY (Independent Speed & Volume) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 4 • Background Sound Effect / Foley (Audible &amp; Feelable)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSfx}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/40 transition cursor-pointer"
                  title="Reset SFX track to None"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset SFX</span>
                </button>
                {currentState.sfxTrack !== "none" && (
                  <button
                    type="button"
                    onClick={toggleAuditionSFX}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30"
                  >
                    {isAuditioningSFX ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{isAuditioningSFX ? "Stop Audition" : "🔊 Audition SFX (4s)"}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Background SFX:</label>
                <select
                  value={currentState.sfxTrack}
                  onChange={(e) => pushState((prev) => ({ ...prev, sfxTrack: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {SFX_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">SFX Volume:</span>
                  <span className="font-mono text-amber-300 font-bold">{Math.round(currentState.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.0}
                  step={0.05}
                  value={currentState.sfxVolume}
                  onChange={(e) => pushState((prev) => ({ ...prev, sfxVolume: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Independent SFX Speed:</span>
                  <span className="font-mono text-amber-300 font-bold">{currentState.sfxSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={4.0}
                  step={0.05}
                  value={currentState.sfxSpeed}
                  onChange={(e) => pushState((prev) => ({ ...prev, sfxSpeed: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReelTimelineEditor;
