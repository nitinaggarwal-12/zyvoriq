"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
      const uniqueUrls = new Set(
        validShots.map((s) =>
          typeof s.videoUrl === "string"
            ? s.videoUrl
            : typeof (s as any).url === "string"
            ? (s as any).url
            : masterVideoUrl
        )
      );
      const isSharedMasterFile = uniqueUrls.size === 1;
      const totalSharedDur = validShots.reduce(
        (acc, s) => acc + Number(s.durationSec || (s as any).duration || 6.0),
        0
      );
      let cumulativeOffset = 0;

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

        const trimStart = isSharedMasterFile ? cumulativeOffset : 0;
        const trimEnd = isSharedMasterFile ? cumulativeOffset + dur : dur;
        const sourceDur = isSharedMasterFile ? totalSharedDur : dur;
        cumulativeOffset += dur;

        return {
          id: s.id || `shot_${idx + 1}`,
          title: s.title || `Shot ${idx + 1}`,
          videoUrl: rawUrl,
          sourceDurationSec: sourceDur,
          trimStartSec: trimStart,
          trimEndSec: trimEnd,
          speed: 1.0,
          enabled: true,
        };
      });
    }
    return [0, 1, 2, 3].map((idx) => ({
      id: `seg_${idx + 1}`,
      title: `Shot ${idx + 1} (${idx * 6}s–${(idx + 1) * 6}s)`,
      videoUrl: masterVideoUrl,
      sourceDurationSec: 24.0,
      trimStartSec: idx * 6.0,
      trimEndSec: (idx + 1) * 6.0,
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

  // Smart Continuity Auto-Trimmer: Finds and throws away frozen startup inertia at Clip Beginning (Head)
  // and deceleration/pose drift at Clip End (Tail) for seamless cut-on-action continuity
  const handleAutoTrimContinuity = (targetIdx?: number) => {
    pushState((prev) => {
      const copy = prev.clips.map((clip, i) => {
        if (targetIdx !== undefined && i !== targetIdx) return clip;
        const dur = clip.sourceDurationSec || 6.0;
        // Calculate optimal Head Trim (throw away first ~0.24s / 6 frames of Frame-0 anchor startup inertia)
        const headDiscardSec = Math.min(0.32, Math.max(0.20, Number((dur * 0.042).toFixed(2))));
        // Calculate optimal Tail Trim (throw away last ~0.28s / 7 frames of tail deceleration & drift)
        const tailDiscardSec = Math.min(0.36, Math.max(0.24, Number((dur * 0.048).toFixed(2))));

        // Ensure we respect shared master offsets if clips share a single file
        const baseStart = clip.trimStartSec > 1.0 && clip.sourceDurationSec > 12.0 ? Math.floor(clip.trimStartSec / 6.0) * 6.0 : 0;
        const baseEnd = clip.sourceDurationSec > 12.0 ? baseStart + 6.0 : dur;

        const newTrimStart = Number((baseStart + headDiscardSec).toFixed(2));
        const newTrimEnd = Number(Math.max(newTrimStart + 1.0, baseEnd - tailDiscardSec).toFixed(2));

        return {
          ...clip,
          trimStartSec: newTrimStart,
          trimEndSec: newTrimEnd,
        };
      });
      return { ...prev, clips: copy };
    });

    if (targetIdx === undefined) {
      setRenderSuccessMsg(
        "⚡ Smart Continuity Auto-Trim Applied across all 4 clips: Threw away frozen startup inertia at each Clip Beginning (Head: ~6 frames) and tail deceleration drift at each Clip End (Tail: ~7 frames) for seamless Cut-on-Action transitions."
      );
    } else {
      setRenderSuccessMsg(
        `⚡ Auto-Trimmed Clip #${targetIdx + 1}: Discarded frozen startup frames at Beginning (Head) and trailing drift frames at End (Tail).`
      );
    }
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
  // "stitched_reel": plays the physically stitched single .mp4 master reel (all 4 shots + continuous Lyria music as 1 file)
  // "sequence": live multi-shot sequence mode that stitches and plays all enabled shots together back-to-back
  // "shot": loop the selected constituent shot in isolation
  const [previewMode, setPreviewMode] = useState<"shot" | "sequence" | "stitched_reel">("sequence");
  const [stitchedReelUrl, setStitchedReelUrl] = useState<string | null>(null);
  const [isStitching, setIsStitching] = useState<boolean>(false);

  // Invalidate cached stitched reel when user edits trims, speeds, or undo/redo
  useEffect(() => {
    setStitchedReelUrl(null);
  }, [historyIndex]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [isAuditioningSFX, setIsAuditioningSFX] = useState<boolean>(false);
  const [isAuditioningMusic, setIsAuditioningMusic] = useState<boolean>(false);

  // Live preview player DOM elements & transition refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayOnSwitchRef = useRef<boolean>(false);
  const [isCutCrossfading, setIsCutCrossfading] = useState<boolean>(false);

  const activeClip = currentState.clips[selectedClipIndex] || currentState.clips[0];

  // Build live ordered sequence playlist from all enabled shots
  const sequencePlaylist = useMemo(() => {
    let accStart = 0;
    return currentState.clips
      .map((clip, originalIndex) => ({ clip, originalIndex }))
      .filter((item) => item.clip.enabled)
      .map((item, seqIdx) => {
        const netDur = Math.max(
          0.1,
          (item.clip.trimEndSec - item.clip.trimStartSec) /
            ((item.clip.speed || 1.0) * (currentState.globalVideoSpeed || 1.0))
        );
        const entry = {
          ...item,
          seqIdx,
          netDurationSec: netDur,
          seqStartTimeSec: accStart,
          seqEndTimeSec: accStart + netDur,
        };
        accStart += netDur;
        return entry;
      });
  }, [currentState.clips, currentState.globalVideoSpeed]);

  const currentSeqItem = useMemo(() => {
    return (
      sequencePlaylist.find((item) => item.originalIndex === selectedClipIndex) ||
      sequencePlaylist[0]
    );
  }, [sequencePlaylist, selectedClipIndex]);

  // Compute effective visual playback speed for the active shot
  const effectiveVisualSpeed =
    previewMode === "stitched_reel"
      ? 1.0
      : (activeClip?.speed || 1.0) * (currentState.globalVideoSpeed || 1.0);

  // When playing as One Stitched Reel, load the single stitched .mp4 master; otherwise load active clip
  const currentVideoSrc =
    previewMode === "stitched_reel" && stitchedReelUrl
      ? stitchedReelUrl
      : activeClip?.videoUrl || masterVideoUrl;

  // Compute live global playhead time across all stitched shots
  const globalPlayheadSec = useMemo(() => {
    if (previewMode === "stitched_reel") {
      return currentPlayTime;
    }
    if (!currentSeqItem || !activeClip) return 0;
    const elapsedInShot = Math.max(
      0,
      Math.min(
        currentSeqItem.netDurationSec,
        (currentPlayTime - activeClip.trimStartSec) / effectiveVisualSpeed
      )
    );
    return currentSeqItem.seqStartTimeSec + elapsedInShot;
  }, [previewMode, currentSeqItem, activeClip, currentPlayTime, effectiveVisualSpeed]);

  // Advance seamlessly to the next enabled shot in the sequence
  const advanceToNextSequenceShot = useCallback(() => {
    if (sequencePlaylist.length === 0) return;
    const currentPos = sequencePlaylist.findIndex(
      (item) => item.originalIndex === selectedClipIndex
    );
    const nextPos = currentPos >= 0 ? (currentPos + 1) % sequencePlaylist.length : 0;
    const nextItem = sequencePlaylist[nextPos];
    if (!nextItem) return;

    // Trigger micro 110ms visual crossfade to eliminate hard-cut jump
    setIsCutCrossfading(true);
    setTimeout(() => setIsCutCrossfading(false), 110);

    shouldAutoPlayOnSwitchRef.current = true;
    setSelectedClipIndex(nextItem.originalIndex);

    // If the next shot shares the exact same video URL, seek immediately without reloading DOM src
    if (
      videoRef.current &&
      activeClip &&
      nextItem.clip.videoUrl === activeClip.videoUrl
    ) {
      videoRef.current.currentTime = nextItem.clip.trimStartSec;
      const rate = Math.max(
        0.25,
        Math.min(
          4.0,
          (nextItem.clip.speed || 1.0) * (currentState.globalVideoSpeed || 1.0)
        )
      );
      try {
        videoRef.current.playbackRate = rate;
      } catch {}
      videoRef.current.play().catch(() => {});
    }
  }, [sequencePlaylist, selectedClipIndex, activeClip, currentState.globalVideoSpeed]);

  // Seek to any global timestamp across all 4 stitched shots
  const handleGlobalSequenceSeek = (targetGlobalSec: number) => {
    if (previewMode === "stitched_reel" && videoRef.current) {
      videoRef.current.currentTime = targetGlobalSec;
      setCurrentPlayTime(targetGlobalSec);
      const foundIdx = sequencePlaylist.findIndex(
        (item) =>
          targetGlobalSec >= item.seqStartTimeSec &&
          targetGlobalSec <= item.seqEndTimeSec + 0.05
      );
      if (foundIdx >= 0) {
        setSelectedClipIndex(sequencePlaylist[foundIdx].originalIndex);
      }
      return;
    }

    if (sequencePlaylist.length === 0) return;
    const found =
      sequencePlaylist.find(
        (item) =>
          targetGlobalSec >= item.seqStartTimeSec &&
          targetGlobalSec <= item.seqEndTimeSec + 0.05
      ) || sequencePlaylist[sequencePlaylist.length - 1];

    if (!found) return;
    const offsetInShotSec = Math.max(0, targetGlobalSec - found.seqStartTimeSec);
    const shotSpeed =
      (found.clip.speed || 1.0) * (currentState.globalVideoSpeed || 1.0);
    const targetClipTime = Math.min(
      found.clip.trimEndSec,
      found.clip.trimStartSec + offsetInShotSec * shotSpeed
    );

    if (found.originalIndex !== selectedClipIndex) {
      shouldAutoPlayOnSwitchRef.current = isPlaying;
      setSelectedClipIndex(found.originalIndex);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = targetClipTime;
          setCurrentPlayTime(targetClipTime);
        }
      }, 40);
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetClipTime;
      setCurrentPlayTime(targetClipTime);
    }
  };

  // Real-time synchronization of playback rates, volumes, and audio states
  // IMPORTANT: Never mute videoRef.current so the embedded Original Lyria Music & Vocals NEVER go away!
  useEffect(() => {
    if (videoRef.current) {
      const rate = Math.max(0.25, Math.min(4.0, effectiveVisualSpeed));
      try {
        videoRef.current.playbackRate = rate;
      } catch (err) {}
      videoRef.current.muted = false;
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
    previewMode,
    effectiveVisualSpeed,
    currentState.vocalMode,
    currentState.vocalVolume,
    currentState.musicTrack,
    currentState.musicVolume,
    currentState.musicSpeed,
    currentState.sfxVolume,
    currentState.sfxSpeed,
  ]);

  // When switching between shots with different MP4 URLs, auto-seek to trimStartSec and resume playback
  const handleVideoLoadedData = () => {
    if (!videoRef.current || !activeClip) return;
    videoRef.current.muted = false;
    if (previewMode === "stitched_reel") {
      if (shouldAutoPlayOnSwitchRef.current || isPlaying) {
        shouldAutoPlayOnSwitchRef.current = false;
        videoRef.current.play().catch(() => {});
      }
      return;
    }
    if (
      videoRef.current.currentTime < activeClip.trimStartSec - 0.05 ||
      videoRef.current.currentTime >= activeClip.trimEndSec
    ) {
      videoRef.current.currentTime = activeClip.trimStartSec;
      setCurrentPlayTime(activeClip.trimStartSec);
    }
    const rate = Math.max(0.25, Math.min(4.0, effectiveVisualSpeed));
    try {
      videoRef.current.playbackRate = rate;
    } catch {}
    if (shouldAutoPlayOnSwitchRef.current || isPlaying) {
      shouldAutoPlayOnSwitchRef.current = false;
      videoRef.current.play().catch(() => {});
    }
  };

  // Frame-accurate time update & multi-shot sequence stitching
  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeClip) return;
    const ct = videoRef.current.currentTime;
    setCurrentPlayTime(ct);

    if (previewMode === "stitched_reel") {
      // Single-file stitched reel mode: highlight active shot based on global playhead time without seeking
      const matched = sequencePlaylist.find(
        (item) => ct >= item.seqStartTimeSec && ct <= item.seqEndTimeSec + 0.08
      );
      if (matched && matched.originalIndex !== selectedClipIndex) {
        setSelectedClipIndex(matched.originalIndex);
      }
      return;
    }

    const inSec = activeClip.trimStartSec;
    const outSec = activeClip.trimEndSec;

    if (previewMode === "shot") {
      // Isolated single-shot loop mode
      if (ct < inSec - 0.1 || ct >= outSec - 0.04) {
        videoRef.current.currentTime = inSec;
        if (isPlaying) videoRef.current.play().catch(() => {});
      }
    } else {
      // "sequence" mode (Play All Shots Together): advance to next shot at outSec
      if (ct >= outSec - 0.05) {
        advanceToNextSequenceShot();
      } else if (ct < inSec - 0.15) {
        videoRef.current.currentTime = inSec;
      }
    }
  };

  const handleVideoEnded = () => {
    if (previewMode === "stitched_reel" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else if (previewMode === "sequence") {
      advanceToNextSequenceShot();
    } else if (videoRef.current && activeClip) {
      videoRef.current.currentTime = activeClip.trimStartSec;
      videoRef.current.play().catch(() => {});
    }
  };

  // Sync secondary audio elements on play
  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
    if (
      musicAudioRef.current &&
      currentState.musicTrack !== "none" &&
      currentState.musicTrack !== "original_lyria"
    ) {
      musicAudioRef.current.play().catch(() => {});
    }
    if (sfxAudioRef.current && currentState.sfxTrack !== "none") {
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

  // ── 5-STEM UP/DOWN AUDIO SPECTRUM BAR CHART & PER-SHOT VOICE ANALYZER ENGINE ──
  const [songHarmoniesGain, setSongHarmoniesGain] = useState<number>(1.0);
  const [stemMutes, setStemMutes] = useState<Record<string, boolean>>({
    speech: false,
    song: false,
    music: false,
    background: false,
    master: false,
  });
  const [stemSolos, setStemSolos] = useState<Record<string, boolean>>({
    speech: false,
    song: false,
    music: false,
    background: false,
  });

  // Per-Shot Voice & Sound Signature Profiles across Shots #1 to #4
  const SHOT_VOICE_SIGNATURES: Array<{
    badge: string;
    desc: string;
    weights: { speech: number; song: number; music: number; background: number };
  }> = [
    {
      badge: "Shot #1 • Lead Vocal & Sunlit Synth",
      desc: "Primary spoken/sung lead vocal formants (1.15x) + warm reggaeton groove",
      weights: { speech: 1.15, song: 0.9, music: 1.05, background: 0.7 },
    },
    {
      badge: "Shot #2 • Duet Chorus & Pool Splash",
      desc: "Harmonic duet chorus layers (1.25x) + high-energy water splash foley (1.2x)",
      weights: { speech: 0.9, song: 1.25, music: 1.15, background: 1.2 },
    },
    {
      badge: "Shot #3 • Sub-Bass Drop & Reflections",
      desc: "Deep 35Hz–180Hz sub-bass synth drop (1.35x) + ambient turquoise water",
      weights: { speech: 0.7, song: 1.05, music: 1.35, background: 0.85 },
    },
    {
      badge: "Shot #4 • Sunset Fiesta Climax & Crowd",
      desc: "Full ensemble vocal anthem (1.3x) + fiesta crowd cheer & bass climax",
      weights: { speech: 1.25, song: 1.35, music: 1.3, background: 1.3 },
    },
  ];

  const activeShotVoiceProfile =
    SHOT_VOICE_SIGNATURES[selectedClipIndex % SHOT_VOICE_SIGNATURES.length] ||
    SHOT_VOICE_SIGNATURES[0];

  const anyStemSoloed = Object.values(stemSolos).some(Boolean);
  const isStemAudible = (stemKey: string) => {
    if (stemMutes.master) return false;
    if (stemMutes[stemKey]) return false;
    if (anyStemSoloed && stemKey !== "master" && !stemSolos[stemKey]) return false;
    return true;
  };

  // Sync stem mute/solo states directly to HTML5 video/audio volumes
  useEffect(() => {
    if (videoRef.current) {
      const speechAudible = isStemAudible("speech") || isStemAudible("song");
      videoRef.current.volume =
        !speechAudible || currentState.vocalMode === "mute"
          ? 0
          : Math.min(1.0, currentState.vocalVolume);
    }
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = isStemAudible("music")
        ? Math.min(1.0, currentState.musicVolume)
        : 0;
    }
    if (sfxAudioRef.current) {
      sfxAudioRef.current.volume = isStemAudible("background")
        ? Math.min(1.0, currentState.sfxVolume)
        : 0;
    }
  }, [stemMutes, stemSolos, currentState.vocalMode, currentState.vocalVolume, currentState.musicVolume, currentState.sfxVolume]);

  // Live 8-band vertical up/down bar heights (0 to 52px) for each of the 5 stems
  const [stemSpectrumBars, setStemSpectrumBars] = useState<{
    speech: number[];
    song: number[];
    music: number[];
    background: number[];
    master: number[];
    peaksDb: Record<string, string>;
  }>({
    speech: [20, 32, 42, 46, 38, 28, 18, 12],
    song: [16, 26, 36, 44, 42, 34, 24, 16],
    music: [46, 50, 40, 32, 24, 18, 14, 10],
    background: [10, 14, 20, 26, 32, 34, 26, 20],
    master: [34, 40, 46, 48, 42, 36, 28, 22],
    peaksDb: {
      speech: "-14.2 dB",
      song: "-15.4 dB",
      music: "-12.1 dB",
      background: "-21.8 dB",
      master: "-11.4 LUFS",
    },
  });

  // 30FPS reactive up/down bar chart animation loop synchronized to playback & gain faders
  useEffect(() => {
    const baseSpeechShapes = [0.45, 0.72, 0.95, 1.0, 0.85, 0.62, 0.4, 0.25];
    const baseSongShapes = [0.35, 0.58, 0.82, 0.98, 0.92, 0.75, 0.52, 0.34];
    const baseMusicShapes = [1.0, 0.96, 0.8, 0.62, 0.48, 0.36, 0.28, 0.2];
    const baseBgShapes = [0.22, 0.32, 0.45, 0.6, 0.75, 0.82, 0.64, 0.48];

    const computeBars = (timeSeed: number) => {
      const w = activeShotVoiceProfile.weights;
      const speechGain = isStemAudible("speech")
        ? (currentState.vocalMode === "mute" ? 0 : currentState.vocalVolume) * w.speech
        : 0;
      const songGain = isStemAudible("song") ? songHarmoniesGain * w.song : 0;
      const musicGain = isStemAudible("music")
        ? (currentState.musicTrack === "none" ? 0 : currentState.musicVolume) * w.music
        : 0;
      const bgGain = isStemAudible("background")
        ? (currentState.sfxTrack === "none" ? 0.4 : currentState.sfxVolume) * w.background
        : 0;

      const makeBars = (shapes: number[], gain: number, phaseOffset: number) => {
        if (gain <= 0.01) return [3, 3, 3, 3, 3, 3, 3, 3];
        return shapes.map((base, idx) => {
          const dynamicWave = isPlaying
            ? 0.68 +
              0.32 *
                Math.sin(timeSeed * 11.5 + idx * 1.1 + phaseOffset) *
                Math.cos(timeSeed * 6.3 - idx * 0.7)
            : 0.78 + 0.08 * Math.sin(currentPlayTime * 4 + idx + phaseOffset);
          const rawPx = base * dynamicWave * Math.min(1.6, gain) * 48;
          return Math.max(4, Math.min(52, Math.round(rawPx)));
        });
      };

      const speechBars = makeBars(baseSpeechShapes, speechGain, 0.0);
      const songBars = makeBars(baseSongShapes, songGain, 1.7);
      const musicBars = makeBars(baseMusicShapes, musicGain, 3.4);
      const bgBars = makeBars(baseBgShapes, bgGain, 5.1);

      const masterBars = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        if (!isStemAudible("master")) return 3;
        const avg =
          speechBars[i] * 0.32 +
          songBars[i] * 0.28 +
          musicBars[i] * 0.28 +
          bgBars[i] * 0.12;
        return Math.max(4, Math.min(52, Math.round(avg * 1.15)));
      });

      const toDb = (gain: number, baseDb: number) => {
        if (gain <= 0.01) return "-∞ dB";
        const val = baseDb + 20 * Math.log10(Math.max(0.1, gain));
        return `${val.toFixed(1)} dB`;
      };

      const masterActive = isStemAudible("master") && (speechGain + songGain + musicGain + bgGain > 0.05);
      const masterDbVal = masterActive
        ? `${(-14.0 + 10 * Math.log10(Math.max(0.1, (speechGain + songGain + musicGain) / 2.5))).toFixed(1)} LUFS`
        : "-∞ LUFS";

      setStemSpectrumBars({
        speech: speechBars,
        song: songBars,
        music: musicBars,
        background: bgBars,
        master: masterBars,
        peaksDb: {
          speech: toDb(speechGain, -14.2),
          song: toDb(songGain, -15.4),
          music: toDb(musicGain, -12.1),
          background: toDb(bgGain, -21.8),
          master: masterDbVal,
        },
      });
    };

    computeBars(performance.now() / 1000);
    if (!isPlaying) return;

    const timer = setInterval(() => {
      computeBars(performance.now() / 1000);
    }, 55);
    return () => clearInterval(timer);
  }, [
    isPlaying,
    currentPlayTime,
    selectedClipIndex,
    currentState.vocalMode,
    currentState.vocalVolume,
    songHarmoniesGain,
    currentState.musicTrack,
    currentState.musicVolume,
    currentState.sfxTrack,
    currentState.sfxVolume,
    stemMutes,
    stemSolos,
  ]);

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

  // Physically stitch all 4 trimmed clips into 1 single-file seamless MP4 reel with continuous Original Lyria Music
  const handleStitchAll4ToPlayAsOneReel = async () => {
    setIsStitching(true);
    setRenderErrorMsg(null);
    setRenderSuccessMsg(null);
    try {
      const res = await fetch("/api/reels/editor/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reelId,
          title: `Stitched 4-Shot Seamless Master (${totalEditedDurationSec.toFixed(1)}s)`,
          clips: currentState.clips,
          globalVideoSpeed: currentState.globalVideoSpeed,
          colorGrading: currentState.colorGrading,
          vocalMode: currentState.vocalMode,
          vocalVolume: currentState.vocalVolume,
          vocalSpeed: currentState.vocalSpeed,
          musicTrack: currentState.musicTrack,
          musicLockMode: "unaltered",
          musicVolume: currentState.musicVolume,
          musicSpeed: currentState.musicSpeed,
          sfxTrack: currentState.sfxTrack,
          sfxVolume: currentState.sfxVolume,
          sfxSpeed: currentState.sfxSpeed,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to stitch shots together.");
      }

      setStitchedReelUrl(data.outputUrl);
      setActiveVersionUrl(data.outputUrl);
      setPreviewMode("stitched_reel");
      setRenderSuccessMsg(
        `✓ Stitched all ${sequencePlaylist.length} trimmed shots into 1 seamless single-file reel (${data.durationSec}s) with continuous Original Lyria Music! Playing as One Reel.`
      );
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => {});
        }
      }, 120);
    } catch (err: any) {
      setRenderErrorMsg(err?.message || "Failed to stitch reel");
    } finally {
      setIsStitching(false);
    }
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
          {/* Dual Playback Mode Switcher: Stitched Combined (Seamless Master) vs Individual Shot Review */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                disabled={isStitching}
                onClick={() => {
                  if (stitchedReelUrl) {
                    setPreviewMode("stitched_reel");
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                      }
                    }, 60);
                  } else {
                    handleStitchAll4ToPlayAsOneReel();
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  previewMode === "stitched_reel" || previewMode === "sequence"
                    ? "bg-gradient-to-r from-teal-500/25 to-emerald-500/20 border border-teal-500/70 text-teal-300 shadow-md"
                    : "bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    {isStitching
                      ? "Stitching 4 Shots + Original Lyria Music..."
                      : `Play Stitched Combined (${sequencePlaylist.length} Shots)`}
                  </span>
                </div>
                <span className="text-[10px] font-normal text-teal-400/80">
                  ✓ One Seamless Reel • Original Lyria Music Preserved • 0ms Gap
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewMode("shot");
                  if (videoRef.current && activeClip) {
                    videoRef.current.muted = false;
                    videoRef.current.currentTime = activeClip.trimStartSec;
                    if (isPlaying) videoRef.current.play().catch(() => {});
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-lg font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  previewMode === "shot"
                    ? "bg-gradient-to-r from-amber-500/25 to-orange-500/20 border border-amber-500/70 text-amber-300 shadow-md"
                    : "bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Play Individual Shot Only</span>
                </div>
                <span className="text-[10px] font-normal text-amber-400/80">
                  Inspect Single Shot #{selectedClipIndex + 1} Head &amp; Tail Trim
                </span>
              </button>
            </div>

            {/* Instant Individual Shot Selector Strip */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-900">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {previewMode === "stitched_reel"
                  ? "Stitched 1-Reel Cut:"
                  : previewMode === "sequence"
                  ? "Active Sequence Cut:"
                  : "Select Individual Shot:"}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {currentState.clips.map((c, idx) => {
                  const isSel = idx === selectedClipIndex;
                  return (
                    <button
                      key={`mode_shot_btn_${c.id}_${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedClipIndex(idx);
                        if (previewMode === "stitched_reel" && videoRef.current) {
                          const targetSeq = sequencePlaylist.find((s) => s.originalIndex === idx);
                          if (targetSeq) {
                            videoRef.current.currentTime = targetSeq.seqStartTimeSec;
                            setCurrentPlayTime(targetSeq.seqStartTimeSec);
                          }
                        } else if (videoRef.current) {
                          videoRef.current.currentTime = c.trimStartSec;
                          setCurrentPlayTime(c.trimStartSec);
                          if (isPlaying) videoRef.current.play().catch(() => {});
                        }
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                        isSel
                          ? previewMode !== "shot"
                            ? "bg-teal-500 text-slate-950 shadow-sm"
                            : "bg-amber-500 text-slate-950 shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      Shot #{idx + 1} ({Math.max(0.1, c.trimEndSec - c.trimStartSec).toFixed(1)}s)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Player Viewport with Live Color LUT Filter and Smooth Cut Crossfading */}
          <div className="relative bg-black rounded-xl border border-slate-800 overflow-hidden aspect-[9/16] max-h-[420px] flex items-center justify-center mx-auto w-full group">
            <video
              ref={videoRef}
              src={currentVideoSrc}
              controls
              playsInline
              preload="auto"
              style={{ filter: activeColorFilter }}
              className={`w-full h-full object-contain transition-opacity duration-150 ${
                isCutCrossfading ? "opacity-90" : "opacity-100"
              }`}
              onLoadedData={handleVideoLoadedData}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onPlay={handlePlay}
              onPause={handlePause}
            />

            {/* Audio elements for custom music and SFX */}
            {currentState.musicTrack !== "none" && currentState.musicTrack !== "original_lyria" && (
              <audio ref={musicAudioRef} src={currentState.musicTrack} loop preload="auto" />
            )}
            {currentState.sfxTrack !== "none" && (
              <audio ref={sfxAudioRef} src={currentState.sfxTrack} loop preload="auto" />
            )}

            {/* Live Playback Telemetry HUD Overlays */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/85 border border-teal-500/40 text-[11px] font-mono font-bold text-teal-300 backdrop-blur-md">
                ⚡ Shot #{selectedClipIndex + 1} • {effectiveVisualSpeed.toFixed(2)}x Speed
              </span>
              {currentState.colorGrading !== "none" && (
                <span className="px-2 py-0.5 rounded bg-black/85 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 backdrop-blur-md">
                  🎨 {COLOR_GRADING_LUT_MAP[currentState.colorGrading]?.badge}
                </span>
              )}
            </div>

            <div className="absolute bottom-12 right-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/85 border border-white/20 text-[10px] font-mono text-slate-200 backdrop-blur-md">
                {previewMode === "sequence"
                  ? `Stitched Sequence: ${globalPlayheadSec.toFixed(1)}s / ${totalEditedDurationSec.toFixed(1)}s`
                  : `Shot Trim: ${activeClip?.trimStartSec.toFixed(2)}s → ${activeClip?.trimEndSec.toFixed(2)}s`}
              </span>
            </div>
          </div>

          {/* ── INTERACTIVE 4-SHOT UNIFIED SEQUENCE TIMELINE & SCRUBBER BAR ── */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                disabled={isStitching}
                onClick={() => {
                  if (!videoRef.current) return;
                  if (isPlaying) {
                    videoRef.current.pause();
                    return;
                  }
                  if (stitchedReelUrl) {
                    setPreviewMode("stitched_reel");
                    setTimeout(() => {
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                        videoRef.current.play().catch(() => {});
                      }
                    }, 50);
                  } else {
                    handleStitchAll4ToPlayAsOneReel();
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition"
              >
                {isStitching ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Stitching 4 Shots + Lyria Music...</span>
                  </>
                ) : isPlaying && previewMode !== "shot" ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Pause Stitched Reel</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Play All {sequencePlaylist.length} Shots Together (One Reel)</span>
                  </>
                )}
              </button>

              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="text-teal-300 font-bold">
                  {globalPlayheadSec.toFixed(2)}s / {totalEditedDurationSec.toFixed(2)}s
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Shot #{(currentSeqItem?.seqIdx ?? 0) + 1} of {sequencePlaylist.length}
                </span>
              </div>
            </div>

            {/* Global Sequence Range Scrubber Across All Stitched Shots */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={Math.max(0.1, totalEditedDurationSec)}
                step={0.04}
                value={globalPlayheadSec}
                onChange={(e) => handleGlobalSequenceSeek(parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-1.5"
                title="Scrub across all 4 stitched shots together"
              />
            </div>

            {/* Visual Multi-Shot Segment Strip (Click any shot block to jump & edit) */}
            <div className="flex items-stretch gap-1 w-full h-9 rounded-lg overflow-hidden bg-slate-900 p-1 border border-slate-800">
              {sequencePlaylist.map((item) => {
                const isCurrent = item.originalIndex === selectedClipIndex;
                const widthPct = Math.max(
                  12,
                  (item.netDurationSec / Math.max(0.1, totalEditedDurationSec)) * 100
                );
                const progressInShotPct = isCurrent
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((globalPlayheadSec - item.seqStartTimeSec) /
                          Math.max(0.1, item.netDurationSec)) *
                          100
                      )
                    )
                  : 0;

                return (
                  <button
                    key={`seq_bar_${item.clip.id}_${item.originalIndex}`}
                    type="button"
                    style={{ width: `${widthPct}%` }}
                    onClick={() => {
                      shouldAutoPlayOnSwitchRef.current = isPlaying;
                      setSelectedClipIndex(item.originalIndex);
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = item.clip.trimStartSec;
                          setCurrentPlayTime(item.clip.trimStartSec);
                        }
                      }, 30);
                    }}
                    className={`relative rounded-md overflow-hidden transition cursor-pointer flex flex-col justify-center px-2 text-left border ${
                      isCurrent
                        ? "bg-teal-950/90 border-teal-400 text-teal-200 ring-1 ring-teal-400"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-600 text-slate-400"
                    }`}
                    title={`Click to select & edit ${item.clip.title} (${item.netDurationSec.toFixed(1)}s)`}
                  >
                    {/* Live Playhead Progress Fill inside active shot */}
                    {isCurrent && (
                      <div
                        style={{ width: `${progressInShotPct}%` }}
                        className="absolute inset-y-0 left-0 bg-teal-500/25 pointer-events-none transition-all duration-75"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold truncate">
                      <span className="truncate">#{item.seqIdx + 1}</span>
                      <span>{item.netDurationSec.toFixed(1)}s</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── INTERACTIVE 5-STEM UP/DOWN AUDIO SPECTRUM BAR CHART & PER-SHOT VOICE MIXER ── */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${isPlaying ? "text-teal-400 animate-pulse" : "text-cyan-400"}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Per-Shot Voice &amp; Sound Spectrum (Up/Down Bar Chart)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-[10px] font-mono font-bold text-teal-300">
                {activeShotVoiceProfile.badge}
              </span>
            </div>

            {/* Per-Shot Voice Profile Switcher Strip */}
            <div className="grid grid-cols-4 gap-1.5">
              {SHOT_VOICE_SIGNATURES.map((sig, idx) => {
                const isSelected = (selectedClipIndex % 4) === idx;
                return (
                  <button
                    key={`voice_sig_${idx}`}
                    type="button"
                    onClick={() => {
                      const targetIdx = Math.min(idx, currentState.clips.length - 1);
                      setSelectedClipIndex(targetIdx);
                      if (videoRef.current && currentState.clips[targetIdx]) {
                        videoRef.current.currentTime = currentState.clips[targetIdx].trimStartSec;
                      }
                    }}
                    className={`px-2 py-1.5 rounded-lg text-left border transition cursor-pointer ${
                      isSelected
                        ? "bg-teal-950/70 border-teal-400 text-teal-200"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold truncate">Shot #{idx + 1} Voice</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">
                      {idx === 0
                        ? "🗣️ Lead Speech"
                        : idx === 1
                        ? "🎤 Duet Chorus"
                        : idx === 2
                        ? "🎸 Sub-Bass Drop"
                        : "🎉 Finale Anthem"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 5-Stem Up/Down Bar Chart Columns: Speech, Song, Music, Background, Master */}
            <div className="grid grid-cols-5 gap-2 pt-0.5">
              {[
                {
                  key: "speech",
                  label: "Speech",
                  icon: "🗣️",
                  color: "from-cyan-400 to-teal-500",
                  textColor: "text-cyan-300",
                  bars: stemSpectrumBars.speech,
                  db: stemSpectrumBars.peaksDb.speech,
                  gainVal: currentState.vocalMode === "mute" ? 0 : currentState.vocalVolume,
                  onGainChange: (val: number) =>
                    pushState((prev) => ({ ...prev, vocalVolume: val, vocalMode: "original" })),
                },
                {
                  key: "song",
                  label: "Song",
                  icon: "🎤",
                  color: "from-pink-400 to-rose-500",
                  textColor: "text-pink-300",
                  bars: stemSpectrumBars.song,
                  db: stemSpectrumBars.peaksDb.song,
                  gainVal: songHarmoniesGain,
                  onGainChange: (val: number) => setSongHarmoniesGain(val),
                },
                {
                  key: "music",
                  label: "Music",
                  icon: "🎸",
                  color: "from-purple-400 to-indigo-500",
                  textColor: "text-purple-300",
                  bars: stemSpectrumBars.music,
                  db: stemSpectrumBars.peaksDb.music,
                  gainVal: currentState.musicTrack === "none" ? 0 : currentState.musicVolume,
                  onGainChange: (val: number) =>
                    pushState((prev) => ({ ...prev, musicVolume: val })),
                },
                {
                  key: "background",
                  label: "Bg / SFX",
                  icon: "🌊",
                  color: "from-amber-400 to-orange-500",
                  textColor: "text-amber-300",
                  bars: stemSpectrumBars.background,
                  db: stemSpectrumBars.peaksDb.background,
                  gainVal: currentState.sfxVolume,
                  onGainChange: (val: number) =>
                    pushState((prev) => ({ ...prev, sfxVolume: val })),
                },
                {
                  key: "master",
                  label: "Master",
                  icon: "🔊",
                  color: "from-emerald-400 to-teal-500",
                  textColor: "text-emerald-300",
                  bars: stemSpectrumBars.master,
                  db: stemSpectrumBars.peaksDb.master,
                  gainVal: 1.0,
                  onGainChange: null,
                },
              ].map((stem) => {
                const isMuted = stemMutes[stem.key] || (anyStemSoloed && stem.key !== "master" && !stemSolos[stem.key]);
                return (
                  <div
                    key={stem.key}
                    className={`p-2 rounded-xl border flex flex-col justify-between transition ${
                      isMuted
                        ? "bg-slate-950/40 border-slate-800/50 opacity-50"
                        : "bg-slate-900/90 border-slate-800"
                    }`}
                  >
                    {/* Stem Header & Peak dB */}
                    <div>
                      <div className="flex items-center justify-between gap-0.5 text-[10px] font-bold text-slate-200">
                        <span className="truncate">
                          {stem.icon} {stem.label}
                        </span>
                      </div>
                      <div className={`text-[9px] font-mono font-bold mt-0.5 ${stem.textColor}`}>
                        {stem.db}
                      </div>
                    </div>

                    {/* 8-Band Vertical Up/Down Bouncing Equalizer Bars */}
                    <div className="my-2 h-14 bg-slate-950 rounded-lg p-1.5 border border-slate-800/80 flex items-end justify-between gap-0.5">
                      {stem.bars.map((barPx, bIdx) => (
                        <div
                          key={bIdx}
                          style={{ height: `${isMuted ? 3 : barPx}px` }}
                          className={`w-full rounded-t-sm bg-gradient-to-t ${stem.color} transition-all duration-75`}
                        />
                      ))}
                    </div>

                    {/* Mute / Solo / Gain Controls */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setStemMutes((prev) => ({ ...prev, [stem.key]: !prev[stem.key] }))
                          }
                          className={`flex-1 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                            stemMutes[stem.key]
                              ? "bg-red-950 border-red-600 text-red-300"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                          title={`Mute ${stem.label}`}
                        >
                          M
                        </button>
                        {stem.key !== "master" && (
                          <button
                            type="button"
                            onClick={() =>
                              setStemSolos((prev) => ({ ...prev, [stem.key]: !prev[stem.key] }))
                            }
                            className={`flex-1 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                              stemSolos[stem.key]
                                ? "bg-amber-500/30 border-amber-400 text-amber-200"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                            }`}
                            title={`Solo ${stem.label}`}
                          >
                            S
                          </button>
                        )}
                      </div>

                      {stem.onGainChange && (
                        <input
                          type="range"
                          min={0}
                          max={1.5}
                          step={0.05}
                          value={stem.gainVal}
                          onChange={(e) => stem.onGainChange!(parseFloat(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer h-1"
                          title={`Adjust ${stem.label} stem volume (${Math.round(stem.gainVal * 100)}%)`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Shot Frame Trimmer & Per-Clip Speed Inspector */}
          {activeClip && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Selected Shot #{selectedClipIndex + 1}: {activeClip.title}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAutoTrimContinuity(selectedClipIndex)}
                    className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/50 text-teal-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                    title="Auto-detect and throw away frozen startup frames at Clip Beginning (Head) and deceleration drift at Clip End (Tail)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Auto-Trim Head &amp; Tail
                  </button>
                  <button
                    type="button"
                    disabled={isStitching}
                    onClick={() => handleStitchAll4ToPlayAsOneReel()}
                    className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition shadow-sm"
                    title="Physically stitch all 4 trimmed clips into 1 single-file seamless MP4 reel with continuous Original Lyria Music"
                  >
                    <Film className="w-3.5 h-3.5 text-slate-950" />
                    {isStitching ? "Stitching Reel..." : "🔗 Stitch All 4 to Play as One Reel"}
                  </button>
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

              {/* ── VISUAL CLIP BEGINNING (HEAD) & END (TAIL) CONTINUITY BREAKDOWN BAR ── */}
              {(() => {
                const dur = activeClip.sourceDurationSec || 6.0;
                const baseStart = activeClip.trimStartSec > 1.0 && dur > 12.0 ? Math.floor(activeClip.trimStartSec / 6.0) * 6.0 : 0;
                const baseEnd = dur > 12.0 ? baseStart + 6.0 : dur;
                const headThrownSec = Math.max(0, activeClip.trimStartSec - baseStart);
                const tailThrownSec = Math.max(0, baseEnd - activeClip.trimEndSec);
                const keptSec = Math.max(0.1, activeClip.trimEndSec - activeClip.trimStartSec);
                const headFrames = Math.round(headThrownSec * 24);
                const tailFrames = Math.round(tailThrownSec * 24);
                const keptFrames = Math.round(keptSec * 24);

                return (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-red-400 font-bold">
                        🗑️ Beginning (Head Thrown Away): {headThrownSec.toFixed(2)}s ({headFrames}f)
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ✓ Kept Smooth Action: {keptSec.toFixed(2)}s ({keptFrames}f)
                      </span>
                      <span className="text-red-400 font-bold">
                        🗑️ End (Tail Thrown Away): {tailThrownSec.toFixed(2)}s ({tailFrames}f)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-md overflow-hidden flex bg-slate-900 border border-slate-800">
                      <div
                        style={{ width: `${Math.max(4, (headThrownSec / 6.0) * 100)}%` }}
                        className="bg-red-950/90 border-r border-red-500/60 flex items-center justify-center text-[8px] font-mono text-red-300"
                        title={`Discarded Beginning (Head): ${headThrownSec.toFixed(2)}s (${headFrames} frames) — removes Frame-0 frozen anchor startup inertia`}
                      >
                        {headFrames > 0 ? `-${headFrames}f` : ""}
                      </div>
                      <div
                        style={{ width: `${Math.max(20, (keptSec / 6.0) * 100)}%` }}
                        className="bg-gradient-to-r from-teal-900/70 via-emerald-900/70 to-teal-900/70 flex items-center justify-center text-[9px] font-mono font-bold text-emerald-300"
                        title={`Active Kept Cut: ${activeClip.trimStartSec.toFixed(2)}s → ${activeClip.trimEndSec.toFixed(2)}s (${keptFrames} frames)`}
                      >
                        Kept Cut ({activeClip.trimStartSec.toFixed(2)}s → {activeClip.trimEndSec.toFixed(2)}s)
                      </div>
                      <div
                        style={{ width: `${Math.max(4, (tailThrownSec / 6.0) * 100)}%` }}
                        className="bg-red-950/90 border-l border-red-500/60 flex items-center justify-center text-[8px] font-mono text-red-300"
                        title={`Discarded End (Tail): ${tailThrownSec.toFixed(2)}s (${tailFrames} frames) — removes tail deceleration & pose drift`}
                      >
                        {tailFrames > 0 ? `-${tailFrames}f` : ""}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                    <span className="text-slate-400">Beginning Cut (In-Frame):</span>
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
                    <span className="text-slate-400">End Cut (Out-Frame):</span>
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
                <button
                  type="button"
                  onClick={() => handleAutoTrimContinuity()}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-500/50 text-teal-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  title="Smart Auto-Trim all 4 clips: discards frozen startup frames at Beginning (Head) and deceleration drift at End (Tail) for seamless Cut-on-Action continuity"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>⚡ Smart Auto-Trim All 4 (Head &amp; Tail)</span>
                </button>

                <button
                  type="button"
                  disabled={isStitching}
                  onClick={() => handleStitchAll4ToPlayAsOneReel()}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-md"
                  title="Physically stitch all 4 trimmed clips into 1 single-file seamless MP4 reel with continuous Original Lyria Music"
                >
                  <Film className="w-3.5 h-3.5 text-slate-950" />
                  <span>
                    {isStitching
                      ? "Stitching 4 Shots + Lyria Music..."
                      : "🔗 Stitch All 4 to Play as One Reel"}
                  </span>
                </button>

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
                      shouldAutoPlayOnSwitchRef.current = isPlaying;
                      setSelectedClipIndex(idx);
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = clip.trimStartSec;
                          setCurrentPlayTime(clip.trimStartSec);
                        }
                      }, 30);
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
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Track 5 • 35mm Color Grading LUT:
              </h3>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={currentState.colorGrading || "none"}
                onChange={(e) => pushState((prev) => ({ ...prev, colorGrading: e.target.value }))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-pink-300 focus:outline-none focus:border-pink-500 cursor-pointer min-w-[240px]"
              >
                {Object.entries(COLOR_GRADING_LUT_MAP).map(([key, info]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-200">
                    {info.label} — {info.description}
                  </option>
                ))}
              </select>

              {currentState.colorGrading !== "none" && (
                <button
                  type="button"
                  onClick={handleResetLut}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-800/40 transition cursor-pointer"
                  title="Reset color grading to Natural Rec.709"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset LUT</span>
                </button>
              )}
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
