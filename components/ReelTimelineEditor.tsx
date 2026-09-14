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
} from "lucide-react";

export interface TimelineClipItem {
  id: string;
  title: string;
  videoUrl: string;
  sourceDurationSec: number;
  trimStartSec: number;
  trimEndSec: number;
  speed: number; // Per-clip visual speed (0.5x - 2.0x)
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
  globalVideoSpeed: number; // Global visual speed multiplier (0.5x - 2.0x)
  // Track 2: Dialogue / Vocals
  vocalMode: "original" | "mute" | "custom";
  vocalVolume: number;
  vocalSpeed: number; // Independent dialogue/vocal speed (0.5x - 2.0x)
  // Track 3: Music Bed (Unaltered continuous lock by default)
  musicTrack: string;
  musicLockMode: "unaltered" | "custom_trim";
  musicVolume: number;
  musicSpeed: number; // Independent music speed (0.5x - 2.0x)
  // Track 4: Background SFX
  sfxTrack: string;
  sfxVolume: number;
  sfxSpeed: number; // Independent SFX speed (0.5x - 2.0x)
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

const MUSIC_PRESETS = [
  { label: "🎼 Original Lyria 3.5 Instrumental Stem (Unaltered)", value: "original_lyria" },
  { label: "🎻 Romantic Orchestra Score (Bollywood Strings)", value: "/assets/audio/music/bollywood_romance_orchestra.mp3" },
  { label: "🥁 Punjabi Dhol & Tumbi Groove (128 BPM)", value: "/assets/audio/music/punjabi_dhol_tumbi_128bpm.mp3" },
  { label: "🔇 No Background Music Bed", value: "none" },
];

const SFX_PRESETS = [
  { label: "🔇 None (Clean Studio Mix)", value: "none" },
  { label: "🏖️ Summer Pool Party Water Splashes & Sun", value: "/assets/audio/sfx/pool_party_splash.mp3" },
  { label: "🎉 Nightclub Stage Concert Crowd Cheer", value: "/assets/audio/sfx/club_crowd_cheer.mp3" },
  { label: "☕ Coastal Ocean Breeze & Surf Ambiance", value: "/assets/audio/sfx/coastal_ocean_breeze.mp3" },
  { label: "🌧️ Cinematic Vinyl Crackle & Warm Rain", value: "/assets/audio/sfx/vinyl_rain_ambiance.mp3" },
];

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

  // Live preview players
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync browser playback speed & volumes in real time
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume =
        currentState.vocalMode === "mute" ? 0 : Math.min(1, currentState.vocalVolume);
      videoRef.current.playbackRate = Math.max(0.5, Math.min(2.0, currentState.globalVideoSpeed || 1.0));
    }
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = Math.min(1, currentState.musicVolume);
      musicAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, currentState.musicSpeed || 1.0));
    }
    if (sfxAudioRef.current) {
      sfxAudioRef.current.volume = Math.min(1, currentState.sfxVolume);
      sfxAudioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, currentState.sfxSpeed || 1.0));
    }
  }, [
    currentState.vocalMode,
    currentState.vocalVolume,
    currentState.globalVideoSpeed,
    currentState.musicVolume,
    currentState.musicSpeed,
    currentState.sfxVolume,
    currentState.sfxSpeed,
  ]);

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
      setVersionTitleInput("");
      setRenderSuccessMsg(
        `✓ Saved new version "${newVer.label}"! Original master (v1) is safely preserved.`
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

  const activeClip = currentState.clips[selectedClipIndex] || currentState.clips[0];

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
              <h2 className="text-lg font-bold text-white">Studio NLE Multi-Track Video & Audio Editor</h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-teal-950 text-teal-300 border border-teal-800">
                Independent 4-Track Speeds & Unaltered Music Lock
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
                <span>Render & Save New Version (v{versions.length + 1})</span>
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
          {versions.map((ver) => {
            const isActive = activeVersionUrl === ver.url;
            return (
              <button
                key={ver.versionNumber}
                type="button"
                onClick={() => setActiveVersionUrl(ver.url)}
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
          <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden aspect-[9/16] max-h-[440px] flex items-center justify-center mx-auto w-full">
            <video
              ref={videoRef}
              key={activeVersionUrl}
              src={activeVersionUrl}
              controls
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
              onPlay={() => {
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
              }}
              onPause={() => {
                musicAudioRef.current?.pause();
                sfxAudioRef.current?.pause();
              }}
            />
            {currentState.musicTrack !== "none" && currentState.musicTrack !== "original_lyria" && (
              <audio ref={musicAudioRef} src={currentState.musicTrack} loop preload="auto" />
            )}
            {currentState.sfxTrack !== "none" && (
              <audio ref={sfxAudioRef} src={currentState.sfxTrack} loop preload="auto" />
            )}
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

              {/* Frame-accurate In/Out Trimmers + Per-Clip Visual Speed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Trim In-Frame:</span>
                    <span className="font-mono text-teal-300">
                      {activeClip.trimStartSec.toFixed(2)}s ({Math.round(activeClip.trimStartSec * 24)}f)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, activeClip.trimEndSec - 0.2)}
                    step={0.04}
                    value={activeClip.trimStartSec}
                    onChange={(e) => updateClip(selectedClipIndex, { trimStartSec: parseFloat(e.target.value) })}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Trim Out-Frame:</span>
                    <span className="font-mono text-teal-300">
                      {activeClip.trimEndSec.toFixed(2)}s ({Math.round(activeClip.trimEndSec * 24)}f)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={Math.min(activeClip.sourceDurationSec, activeClip.trimStartSec + 0.2)}
                    max={activeClip.sourceDurationSec}
                    step={0.04}
                    value={activeClip.trimEndSec}
                    onChange={(e) => updateClip(selectedClipIndex, { trimEndSec: parseFloat(e.target.value) })}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Shot Visual Speed:</span>
                    <span className="font-mono text-teal-300">{(activeClip.speed || 1).toFixed(2)}x</span>
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

        {/* RIGHT 7 COLS: 4 Independent Tracks (1. Visual Video, 2. Dialogue/Vocals, 3. Unaltered Music, 4. Background SFX) */}
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
              <div className="flex items-center gap-3">
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
                </div>
                <button
                  type="button"
                  onClick={() => handleDuplicateOrAddClip(currentState.clips.length - 1)}
                  className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Frame Cut
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
                    key={clip.id}
                    onClick={() => setSelectedClipIndex(idx)}
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
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
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
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                          title="Move Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateClip(idx, { enabled: !clip.enabled });
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-red-400"
                      >
                        {clip.enabled ? "Remove" : "Restore"}
                      </button>
                    </div>
                  </div>
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
                  Track 2 • Dialogue & Singing Vocals (Independent Speed & Gain)
                </h3>
              </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Dialogue / Vocal Gain:</span>
                  <span className="font-mono text-blue-300">
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
                  <span className="font-mono text-blue-300">{currentState.vocalSpeed.toFixed(2)}x</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Music Track:</label>
                <select
                  value={currentState.musicTrack}
                  onChange={(e) => pushState((prev) => ({ ...prev, musicTrack: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
                  <span className="font-mono text-purple-300">{Math.round(currentState.musicVolume * 100)}%</span>
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
                  <span className="font-mono text-purple-300">{currentState.musicSpeed.toFixed(2)}x</span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Track 4 • Background Sound Effect / Foley (Independent Speed & Volume)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Background SFX:</label>
                <select
                  value={currentState.sfxTrack}
                  onChange={(e) => pushState((prev) => ({ ...prev, sfxTrack: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
                  <span className="font-mono text-amber-300">{Math.round(currentState.sfxVolume * 100)}%</span>
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
                  <span className="font-mono text-amber-300">{currentState.sfxSpeed.toFixed(2)}x</span>
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

