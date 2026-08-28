"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Globe,
  Subtitles,
  Sparkles,
  Check,
  Film,
  Layers,
  ChevronRight,
  BookOpen,
  Award,
  ShieldCheck,
  Languages,
  Tv,
  MessageSquare,
  Mic,
  Send,
  Radio,
  Compass,
  Scroll,
  Zap,
  Download,
  FolderHeart
} from "lucide-react";
import {
  ANIME_SUBTITLE_CUES,
  AUDIO_LANGUAGES,
  SUBTITLE_LANGUAGES,
  AudioLangCode,
  SubtitleLangCode,
  SubtitleCue
} from "@/lib/tier6/anime_subtitles";

interface LivingDojoMessage {
  id: string;
  userQuery: string;
  philosophy: string;
  visualMood: string;
  actionDirection: string;
  renDialogue: string;
  aoiDialogue: string;
  wisdomKey: string;
  audioUrl?: string;
  timestamp: string;
}

const PRESET_DILEMMAS = [
  {
    title: "Comparing to Others",
    kanji: "桜梅桃李 (Oubaitori)",
    prompt: "Sensei, I constantly feel behind my peers who seem to achieve success so effortlessly."
  },
  {
    title: "Mistakes & Scars",
    kanji: "金継ぎ (Kintsugi)",
    prompt: "Sensei, I made a catastrophic mistake in my work and feel broken by the outcome."
  },
  {
    title: "Overwhelming Adversity",
    kanji: "我慢 (Gaman)",
    prompt: "Sensei, the pressure and stress today are immense. How do I keep my spirit from breaking?"
  },
  {
    title: "Small 1% Steps",
    kanji: "改善 (Kaizen)",
    prompt: "Sensei, my daily progress feels so microscopic. How can tiny 1% steps ever amount to greatness?"
  },
  {
    title: "Finding True Purpose",
    kanji: "生き甲斐 (Ikigai)",
    prompt: "Sensei, I am working hard every day, but I do not know where my true calling lies."
  }
];

import { CANONICAL_SERIES_TRACKS, SeriesTrack } from "@/lib/tier6/default_tracks";

function getSpeakerDisplay(speaker?: string, speakerRole?: string) {
  const s = (speaker || "").toLowerCase();
  if (s === "aoi") {
    return {
      badge: "🥋 AOI (Apprentice)",
      subBadge: "🥋 AOI (Student)",
      badgeColor: "bg-cyan-950/80 border-cyan-500/50 text-cyan-200 shadow-cyan-950/50",
      subColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      dotPing: "bg-cyan-400",
      dotSolid: "bg-cyan-500"
    };
  }
  if (s === "ren" || s === "sensei ren" || s.includes("ren")) {
    return {
      badge: "⛩️ SENSEI REN (Zen Master)",
      subBadge: "⛩️ SENSEI REN (Master)",
      badgeColor: "bg-amber-950/80 border-amber-500/50 text-amber-200 shadow-amber-950/50",
      subColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      dotPing: "bg-amber-400",
      dotSolid: "bg-amber-500"
    };
  }
  if (s === "priya" || s.includes("priya")) {
    return {
      badge: "👩‍💼 PRIYA SHARMA (Chief AI Officer)",
      subBadge: `👩‍💼 PRIYA (${speakerRole || "Chief AI Officer"})`,
      badgeColor: "bg-purple-950/80 border-purple-500/50 text-purple-200 shadow-purple-950/50",
      subColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      dotPing: "bg-purple-400",
      dotSolid: "bg-purple-500"
    };
  }
  if (s === "david" || s.includes("david")) {
    return {
      badge: "👨‍💼 DAVID KIM (Lead Infrastructure)",
      subBadge: `👨‍💼 DAVID (${speakerRole || "Lead Infrastructure"})`,
      badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50",
      subColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dotPing: "bg-emerald-400",
      dotSolid: "bg-emerald-500"
    };
  }
  if (s === "elena" || s.includes("elena")) {
    return {
      badge: "👩‍💼 ELENA ROSTOVA (Product Strategy)",
      subBadge: `👩‍💼 ELENA (${speakerRole || "VP Product"})`,
      badgeColor: "bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-rose-950/50",
      subColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      dotPing: "bg-rose-400",
      dotSolid: "bg-rose-500"
    };
  }
  return {
    badge: speakerRole ? `🎙️ ${(speaker || "Speaker").toUpperCase()} (${speakerRole.toUpperCase()})` : `🎙️ ${(speaker || "Speaker").toUpperCase()}`,
    subBadge: speakerRole ? `${(speaker || "Speaker").toUpperCase()} (${speakerRole})` : (speaker || "Speaker").toUpperCase(),
    badgeColor: "bg-teal-950/80 border-teal-500/50 text-teal-200 shadow-teal-950/50",
    subColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    dotPing: "bg-teal-400",
    dotSolid: "bg-teal-500"
  };
}

export function AnimeCinemaStage() {
  const [studioMode, setStudioMode] = useState<"cinema" | "living_dojo">("cinema");

  // Multi-Track Series Library State
  const [seriesTracks, setSeriesTracks] = useState<SeriesTrack[]>(CANONICAL_SERIES_TRACKS);
  const [activeTrackId, setActiveTrackId] = useState<string>("track_anime_kaizen");

  // Fetch tracks from persistent SQLite DB
  useEffect(() => {
    async function loadTracks() {
      try {
        const res = await fetch("/api/studio/tracks");
        const data = await res.json();
        if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
          setSeriesTracks(data.tracks);
          
          // Check for URL query param ?track=...
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const queryTrack = params.get("track");
            if (queryTrack && data.tracks.some((t: any) => t.id === queryTrack)) {
              setActiveTrackId(queryTrack);
            } else if (!data.tracks.some((t: any) => t.id === activeTrackId)) {
              setActiveTrackId(data.tracks[0].id);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load tracks from API:", e);
      }
    }
    loadTracks();
  }, []);

  const activeTrack = seriesTracks.find((t) => t.id === activeTrackId) || seriesTracks[0] || CANONICAL_SERIES_TRACKS[0];
  const actsList = activeTrack.acts;
  const isAnimeTrack = activeTrack.category === "anime" || activeTrack.id.includes("anime") || activeTrack.id.includes("ren");

  // Cinema Mode State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(activeTrack?.duration || 56.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<AudioLangCode>("ja");
  const [subtitleLang, setSubtitleLang] = useState<SubtitleLangCode>("en");
  const [showAudioSubMenu, setShowAudioSubMenu] = useState<boolean>(false);
  const [selectedActIndex, setSelectedActIndex] = useState<number>(0);
  const [isCreateActOpen, setIsCreateActOpen] = useState<boolean>(false);
  const [recentNewAct, setRecentNewAct] = useState<any>(null);

  // Living Dojo Mode State
  const [userInput, setUserInput] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [livingMessages, setLivingMessages] = useState<LivingDojoMessage[]>([
    {
      id: "initial_welcome",
      userQuery: "Welcome to the Zen Dojo",
      philosophy: "Shoshin (初心) — Beginner's Mind",
      visualMood: "dojo_dawn",
      actionDirection: "Sensei Ren sits peacefully upon the tatami mat, incense gently swirling as Apprentice Aoi rests her wooden sword.",
      renDialogue: "Welcome, traveler. Empty your cup of preconceived notions. Whatever burden or doubt weighs upon your spirit today, speak freely.",
      aoiDialogue: "I am ready to learn alongside you. The path of Kaizen begins with an honest question.",
      wisdomKey: "In the beginner's mind there are many possibilities, but in the expert's mind there are few.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [activeDojoAudio, setActiveDojoAudio] = useState<string | null>(null);
  const [isDojoAudioPlaying, setIsDojoAudioPlaying] = useState<boolean>(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const dojoAudioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Switch Active Series Track
  const handleTrackChange = (trackId: string) => {
    setActiveTrackId(trackId);
    setSelectedActIndex(0);
    setCurrentTime(0);
    setIsPlaying(false);
    const targetTrack = seriesTracks.find((t) => t.id === trackId);
    if (targetTrack) {
      setDuration(targetTrack.duration);
    }
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) {
      video.currentTime = 0;
      video.load();
    }
    if (audio) {
      audio.currentTime = 0;
      if (targetTrack?.category !== "anime") {
        audio.pause();
      } else {
        audio.load();
      }
    }
  };

  // Keep duration synced with activeTrack
  useEffect(() => {
    if (activeTrack) {
      setDuration(activeTrack.duration || 24.0);
    }
  }, [activeTrackId, activeTrack?.id, activeTrack?.duration]);

  // Synchronize Active Subtitle Cue in Cinema Mode
  const activeCue = actsList.find(
    (c) => currentTime >= c.startTime && currentTime <= (c.endTime || duration)
  ) || actsList[selectedActIndex] || actsList[0];

  // Update selected act on time progress
  useEffect(() => {
    const idx = actsList.findIndex(
      (c) => currentTime >= c.startTime && currentTime <= (c.endTime || duration)
    );
    if (idx !== -1) {
      setSelectedActIndex(idx);
    }
  }, [currentTime, actsList, duration]);

  // Handle Newly Created Act / New Series Track
  const handleActCreated = (newActData: any, destinationMode: "new_series" | "append_current" = "new_series") => {
    const isRen = newActData.characterLock === "ren_aoi";
    const isDavid = newActData.characterLock === "david";
    const defaultSpeaker = isRen ? "Ren" : isDavid ? "David" : "Priya";
    const defaultSpeakerRole = isRen ? "Zen Master" : isDavid ? "Lead Infrastructure" : "Chief AI Officer";

    const newCue: SubtitleCue = {
      id: newActData.actId || `act_${Date.now()}`,
      startTime: 0.25,
      endTime: parseFloat(newActData.duration) || 7.5,
      speaker: defaultSpeaker,
      speakerRole: defaultSpeakerRole,
      actName: newActData.title || `Act 1: ${newActData.script?.philosophy?.split("—")[0]?.trim() || "The Sovereign Path"}`,
      philosophy: newActData.script?.philosophy || "Autonomous Intelligence Architecture",
      text: {
        ja: newActData.script?.dialogueJa || newActData.script?.dialogueEn || "",
        en: newActData.script?.dialogueEn || "",
        es: newActData.script?.dialogueEs || newActData.script?.dialogueEn || "",
        fr: newActData.script?.dialogueFr || newActData.script?.dialogueEn || "",
        de: newActData.script?.dialogueDe || newActData.script?.dialogueEn || "",
        hi: newActData.script?.dialogueHi || newActData.script?.dialogueEn || ""
      }
    };

    if (destinationMode === "new_series") {
      // Create Brand New Standalone Track
      const newTrackId = `track_${Date.now()}`;
      const newTrackDuration = parseFloat(newActData.duration) || 24.0;
      const newTrack: SeriesTrack = {
        id: newTrackId,
        title: newActData.title || "Custom AI Production Series",
        subtitle: newActData.script?.philosophy || "Multi-Modal Autonomous Series",
        category: newActData.characterLock === "ren_aoi" ? "anime" : "executive",
        character: newActData.characterLock === "ren_aoi" ? "🥋 Sensei Ren & Aoi" : newActData.characterLock === "david" ? "👨‍💼 David Kim (Lead Infrastructure)" : "👩‍💼 Priya Sharma (Chief AI Officer)",
        videoSrc: newActData.videoUrl || (newActData.characterLock === "ren_aoi" ? "/assets/video/ren_and_aoi_conversation_synced.mp4" : newActData.characterLock === "david" ? "/assets/video/david_master.mp4" : "/assets/video/priya_4k_10act_master.mp4"),
        acts: [newCue],
        duration: newTrackDuration
      };

      setSeriesTracks((prev) => [...prev, newTrack]);
      setActiveTrackId(newTrackId);
      setSelectedActIndex(0);
      setDuration(newTrackDuration);
    } else {
      // Append to Current Series Track
      const newIndex = actsList.length;
      newCue.startTime = newIndex * 8.0 + 0.25;
      newCue.endTime = newIndex * 8.0 + 7.5;
      newCue.actName = newActData.title || `Act ${newIndex + 1}: ${newActData.script?.philosophy?.split("—")[0]?.trim() || "The Sovereign Path"}`;

      setSeriesTracks((prev) =>
        prev.map((t) =>
          t.id === activeTrackId
            ? { ...t, acts: [...t.acts, newCue], duration: (newIndex + 1) * 8.0 }
            : t
        )
      );
      setSelectedActIndex(newIndex);
    }

    setRecentNewAct(newActData);
    setIsCreateActOpen(false);

    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    if (isAnimeTrack && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    setIsPlaying(true);
  };

  // Audio track switching with exact timecode preservation
  const handleAudioLangChange = (code: AudioLangCode) => {
    setAudioLang(code);
    if (isAnimeTrack) {
      const audio = audioRef.current;
      if (audio) {
        const wasPlaying = isPlaying;
        audio.currentTime = currentTime;
        if (wasPlaying) {
          audio.play().catch(() => {});
        }
      }
    }
  };

  // Play / Pause Master Sync
  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (audio) audio.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      if (audio) {
        audio.currentTime = video.currentTime;
        audio.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  // Time Scrubbing & Instant Play
  const handleSeek = (time: number, autoPlay: boolean = false) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const loopTime = duration > 0 ? time % duration : time;
    if (video) video.currentTime = loopTime;
    if (audio) audio.currentTime = loopTime;
    setCurrentTime(time);
    const idx = actsList.findIndex(
      (c) => time >= c.startTime && time <= (c.endTime || duration)
    );
    if (idx !== -1) {
      setSelectedActIndex(idx);
    }
    if (autoPlay || isPlaying) {
      if (video) video.play().catch(() => {});
      if (audio) audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Time Updates from Video Element
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      if (audio && Math.abs(audio.currentTime - video.currentTime) > 0.15) {
        audio.currentTime = video.currentTime;
      }
    }
  };

  const skipSeconds = (delta: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + delta));
    handleSeek(nextTime);
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "j" || e.key === "J" || e.key === "ArrowLeft") {
        e.preventDefault();
        skipSeconds(-5);
      } else if (e.key === "l" || e.key === "L" || e.key === "ArrowRight") {
        e.preventDefault();
        skipSeconds(5);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, currentTime, isMuted]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // Trigger Living Dojo AI Simulation
  const handleSendDojoQuery = async (queryText?: string) => {
    const query = queryText || userInput;
    if (!query.trim() || isSimulating) return;

    setIsSimulating(true);
    setUserInput("");

    try {
      const res = await fetch("/api/tier6/living-dojo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: query,
          language: audioLang,
          speakerTarget: "both",
          conversationHistory: livingMessages.slice(-3)
        })
      });

      const data = await res.json();
      if (data.success) {
        const newMsg: LivingDojoMessage = {
          id: `msg_${Date.now()}`,
          userQuery: query,
          philosophy: data.philosophy,
          visualMood: data.visualMood,
          actionDirection: data.actionDirection,
          renDialogue: data.renDialogue,
          aoiDialogue: data.aoiDialogue,
          wisdomKey: data.wisdomKey,
          audioUrl: data.audioUrl,
          timestamp: data.timestamp
        };

        setLivingMessages((prev) => [...prev, newMsg]);

        if (data.audioUrl) {
          setActiveDojoAudio(data.audioUrl);
          setTimeout(() => {
            if (dojoAudioRef.current) {
              dojoAudioRef.current.src = data.audioUrl;
              dojoAudioRef.current.play().then(() => {
                setIsDojoAudioPlaying(true);
              }).catch(() => {});
            }
          }, 200);
        }
      }
    } catch (err) {
      console.error("Dojo query failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const activeSpeaker = getSpeakerDisplay(activeCue?.speaker, activeCue?.speakerRole);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sleek, Compact Series Workspace HUD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Interactive Project Dropdown & Metadata */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Interactive Series Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/10 group"
                >
                  <Layers className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="truncate max-w-[260px] md:max-w-[380px] text-sm">{activeTrack.title}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-mono">
                    {activeTrack.acts.length} Acts · {Math.round(activeTrack.duration)}s
                  </span>
                  <span className="text-xs text-slate-400">▾</span>
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 md:w-96 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-2xl space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Switch Project</span>
                      <span>{seriesTracks.length} Series Total</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {seriesTracks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            handleTrackChange(t.id);
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                            t.id === activeTrackId
                              ? "bg-amber-500/20 border border-amber-500/50 text-amber-200 font-bold"
                              : "hover:bg-slate-900 text-slate-300"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate font-semibold">{t.title}</div>
                            <div className="text-[10px] text-slate-500">{t.character}</div>
                          </div>
                          <span className="text-[10px] font-mono shrink-0 text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                            {t.acts.length} Acts · {Math.round(t.duration)}s
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <Link
                        href="/studio/create?mode=new_series"
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span>+ Start New Standalone Series</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Persona Badge */}
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>{activeTrack.character}</span>
              </span>

              {/* Active Chapter indicator */}
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                Act {selectedActIndex + 1} of {actsList.length}
              </span>
            </div>

            {activeTrack.subtitle && (
              <p className="text-xs text-slate-400 line-clamp-1">
                {activeTrack.subtitle}
              </p>
            )}
          </div>

          {/* Right: Studio Sub-Mode & Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                data-testid="cinema-mode-tab"
                onClick={() => setStudioMode("cinema")}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  studioMode === "cinema"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Cinema Stage</span>
              </button>
              <button
                type="button"
                data-testid="tier6-living-dojo-tab"
                onClick={() => setStudioMode("living_dojo")}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  studioMode === "living_dojo"
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Living Dojo</span>
              </button>
            </div>

            {/* Direct Download Button */}
            <a
              href={`${activeTrack.videoSrc}${activeTrack.videoSrc.includes('?') ? '&' : '?'}download=true&filename=${encodeURIComponent(activeTrack.title.replace(/[^a-zA-Z0-9_-]/g, '_'))}.mp4`}
              download={`${activeTrack.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download MP4</span>
            </a>

            {/* Primary Add Act Button */}
            <Link
              href={`/studio/create?trackId=${activeTrack.id}&mode=append_current`}
              data-testid="create-act-button"
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 border border-amber-400/40"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>+ Add Act {(activeTrack.acts?.length || 1) + 1}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CINEMA BROADCAST STAGE                                            */}
      {/* ========================================================================= */}
      {studioMode === "cinema" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Newly Created Act Notification Banner */}
          {recentNewAct && (
            <div className="bg-gradient-to-r from-amber-950/80 via-rose-950/70 to-slate-900 border border-amber-500/50 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                      ✨ Added to Live Playlist
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Veritas Score: {recentNewAct.veritasAudit?.vqsScore || "96.4"}/100
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-serif mt-0.5">
                    {recentNewAct.title || "Act 8: The Way of Mushin"} — <span className="text-amber-300 font-normal italic">{recentNewAct.script?.philosophy || "Mushin"}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => {
                    const idx = actsList.length - 1;
                    setSelectedActIndex(idx);
                    handleSeek(idx * 8.0, true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play {recentNewAct?.title?.split(":")[0] || `Act ${actsList.length}`}</span>
                </button>
                <button
                  onClick={() => setRecentNewAct(null)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cinema Player Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
            <div
              ref={containerRef}
              className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group select-none"
            >
              {/* Dynamic Video Stream based on Active Series Track */}
              <video
                key={activeTrack.videoSrc}
                ref={videoRef}
                src={activeTrack.videoSrc}
                className="w-full h-full object-cover"
                muted={(isAnimeTrack || !!(activeTrack as any).audioSrc) ? true : isMuted}
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration || activeTrack.duration);
                }}
                onEnded={() => {
                  if (selectedActIndex < actsList.length - 1) {
                    const nextIndex = selectedActIndex + 1;
                    const nextAct = actsList[nextIndex];
                    setSelectedActIndex(nextIndex);
                    handleSeek(nextAct.startTime || (nextIndex * 8.0), true);
                  } else {
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                  }
                }}
                onClick={togglePlay}
              >
                <source src={activeTrack.videoSrc} type="video/mp4" />
              </video>

              {/* Dynamic Multilingual Dub or Neural TTS Audio Element */}
              {(isAnimeTrack || !!(activeTrack as any).audioSrc) && (
                <audio
                  key={(activeTrack as any).audioSrc || audioLang}
                  ref={audioRef}
                  src={(activeTrack as any).audioSrc || `/assets/audio/anime_dubs/dub_${audioLang}.mp3`}
                  muted={isMuted}
                  preload="auto"
                />
              )}

              {/* Real-Time Active Speaker HUD (Top Left) */}
              <div className="absolute top-4 left-4 z-30 pointer-events-none transition-all duration-300">
                {activeCue ? (
                  <div
                    className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl backdrop-blur-xl border shadow-xl transition-all ${activeSpeaker.badgeColor}`}
                  >
                    <span className="flex h-2 w-2 relative">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeSpeaker.dotPing}`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${activeSpeaker.dotSolid}`}
                      />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-wider font-mono uppercase">
                        {activeSpeaker.badge}
                      </span>
                      <span className="text-[9px] text-zinc-300 font-sans">
                        {activeCue.actName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-zinc-800 text-zinc-400 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <span>Cinematic Orientation (600ms Visual Lead-in)</span>
                  </div>
                )}
              </div>

              {/* Broadcast Subtitles Overlay (Netflix / Prime Gold Style) */}
              {subtitleLang !== "off" && activeCue && (
                <div className="absolute bottom-20 inset-x-8 flex justify-center pointer-events-none transition-all duration-300 z-30">
                  <div
                    className={`backdrop-blur-md px-6 py-3 rounded-2xl max-w-2xl text-center shadow-2xl border transition-all ${activeSpeaker.badgeColor}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border font-bold ${activeSpeaker.subColor}`}
                      >
                        {activeSpeaker.subBadge}
                      </span>
                      <span className="text-[10px] font-serif italic text-zinc-400">
                        {activeCue.philosophy}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm md:text-base leading-relaxed tracking-wide drop-shadow-md">
                      {activeCue.text[subtitleLang as keyof typeof activeCue.text] || activeCue.text.en}
                    </p>
                  </div>
                </div>
              )}

              {/* Netflix / Prime Style Audio & Subtitles Menu Overlay */}
              {showAudioSubMenu && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-40 p-8 flex flex-col justify-center animate-fadeIn">
                  <div className="max-w-2xl mx-auto w-full">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Tv className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                          Audio & Subtitles
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAudioSubMenu(false)}
                        className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                      >
                        Close (Esc)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      {/* Audio Column */}
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          Audio Track
                        </h4>
                        {isAnimeTrack ? (
                          <div className="space-y-1.5">
                            {AUDIO_LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => handleAudioLangChange(lang.code)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                                  audioLang === lang.code
                                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-md"
                                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {audioLang === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                  {lang.label}
                                </span>
                                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  {lang.badge}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
                              <Check className="w-4 h-4" />
                              <span>Original Executive Speech Stem</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Playing native 24-bit studio vocal audio synchronized with 4K broadcast video.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Subtitles Column */}
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                          <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                          Subtitles / CC
                        </h4>
                        <div className="space-y-1.5">
                          {SUBTITLE_LANGUAGES.map((sub) => (
                            <button
                              key={sub.code}
                              onClick={() => setSubtitleLang(sub.code)}
                              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                                subtitleLang === sub.code
                                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-md"
                                  : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {subtitleLang === sub.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                {sub.label}
                              </span>
                              {sub.code === "en" && (
                                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  CC
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Cinema Player Control Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity z-20">
                {/* Multi-Act Progress Scrubber with Act Partition Markers */}
                <div
                  className="w-full h-2.5 bg-zinc-800/80 rounded-full cursor-pointer relative overflow-hidden group/scrub border border-zinc-700/50 shadow-inner"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickPos = (e.clientX - rect.left) / rect.width;
                    handleSeek(clickPos * duration);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickPos = (touch.clientX - rect.left) / rect.width;
                    handleSeek(Math.max(0, Math.min(1, clickPos)) * duration);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickPos = (touch.clientX - rect.left) / rect.width;
                    handleSeek(Math.max(0, Math.min(1, clickPos)) * duration);
                  }}
                >
                  {/* Progress Fill */}
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-amber-300 transition-all rounded-full"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />

                  {/* Act Boundary Tick Marks */}
                  {actsList.length > 1 && (
                    <div className="absolute inset-0 pointer-events-none flex">
                      {actsList.map((act, idx) => {
                        const actPct = ((act.startTime || (idx * 8.0)) / (duration || 1)) * 100;
                        if (actPct <= 0 || actPct >= 100) return null;
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 w-0.5 bg-zinc-950/80 z-10"
                            style={{ left: `${actPct}%` }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-amber-300 flex items-center justify-center transition-transform hover:scale-105 shadow-md"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                    </button>

                    <button
                      onClick={() => skipSeconds(-10)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors text-xs font-mono"
                    >
                      -10s
                    </button>
                    <button
                      onClick={() => skipSeconds(10)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors text-xs font-mono"
                    >
                      +10s
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-zinc-400 text-xs">
                      {Math.floor(currentTime / 60)}:
                      {Math.floor(currentTime % 60).toString().padStart(2, "0")} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAudioSubMenu(!showAudioSubMenu)}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors font-mono text-xs uppercase"
                      title="Audio & Subtitles"
                    >
                      <Subtitles className="w-4 h-4" />
                      <span>{isAnimeTrack ? `${audioLang.toUpperCase()} / ` : ""}{subtitleLang.toUpperCase()}</span>
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Act Spotlight Indicator */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Current Chapter (Act {selectedActIndex + 1} of {actsList.length})
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {actsList[selectedActIndex]?.actName || "Act 1: Production Master"}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                  {actsList[selectedActIndex]?.philosophy ? actsList[selectedActIndex].philosophy.split("—")[0] : "Mushin"}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Storyboard & Philosophy Timeline Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                {actsList.length}-Act Story Navigator
              </h3>
              <span className="text-xs font-mono text-zinc-500">{Math.round(duration)}s Total</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {actsList.map((cue, idx) => {
                const isActive = selectedActIndex === idx;
                const isNewlyGenerated = idx >= 7;
                const timecode = `${Math.floor(cue.startTime / 60)}:${Math.floor(cue.startTime % 60).toString().padStart(2, "0")}`;
                return (
                  <div
                    key={cue.id}
                    onClick={() => {
                      setSelectedActIndex(idx);
                      handleSeek(cue.startTime, true);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                      isActive
                        ? "bg-gradient-to-r from-red-950/50 to-zinc-900 border-red-500/60 shadow-lg shadow-red-950/40"
                        : isNewlyGenerated
                        ? "bg-gradient-to-r from-amber-950/30 to-zinc-900/80 hover:bg-zinc-800/80 border-amber-500/50 hover:border-amber-400 shadow-md shadow-amber-500/10"
                        : "bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-red-400" : isNewlyGenerated ? "bg-amber-400 animate-ping" : "bg-zinc-600"}`} />
                        {cue.actName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isNewlyGenerated && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/50 text-[9px] font-mono text-amber-300 font-bold uppercase">
                            ✨ AI ACT
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-zinc-500">{timecode}</span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-300/90 font-serif italic">
                      {cue.philosophy}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {cue.text[subtitleLang === "off" ? "en" : subtitleLang]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TIER 6 LIVING DOJO (LIVE INTERACTIVE MULTI-MODAL AI SIMULATION)    */}
      {/* ========================================================================= */}
      {studioMode === "living_dojo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Living Dojo Interactive Visual Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video bg-gradient-to-b from-stone-950 via-zinc-900 to-black rounded-2xl overflow-hidden border border-teal-500/30 shadow-2xl p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-radial-glow opacity-25 pointer-events-none" />

              {/* Background Zen Dojo Video Loop */}
              <video
                src="/assets/video/ren_and_aoi_conversation_synced.mp4"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                autoPlay
                loop
                muted
                playsInline
              />

              {/* Top HUD: Living Simulation Status */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-teal-500/40 text-teal-300 text-xs font-mono">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  <span>TIER-6 LIVE WORLD MODEL ACTIVE</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                    Voice: Charon (DeepMind Neural)
                  </span>
                </div>
              </div>

              {/* Dynamic Living Response Bubble */}
              {livingMessages.length > 0 && (
                <div className="relative z-10 my-auto bg-black/85 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-5 shadow-2xl space-y-3 max-w-xl mx-auto">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                      ⛩️ Sensei Ren & 🥋 Apprentice Aoi
                    </span>
                    <span className="text-[10px] font-mono bg-teal-950/60 border border-teal-500/40 text-teal-300 px-2 py-0.5 rounded">
                      {livingMessages[livingMessages.length - 1].philosophy}
                    </span>
                  </div>

                  <p className="text-sm md:text-base text-zinc-100 font-serif leading-relaxed italic">
                    "{livingMessages[livingMessages.length - 1].renDialogue}"
                  </p>

                  <div className="pt-1 text-xs text-cyan-300 font-sans border-t border-zinc-800/60 flex items-start gap-2">
                    <span className="font-bold uppercase font-mono text-[10px] text-cyan-400">Aoi:</span>
                    <span>{livingMessages[livingMessages.length - 1].aoiDialogue}</span>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-1.5 text-[11px] text-amber-300/90 font-mono">
                    💡 <b>Takeaway:</b> {livingMessages[livingMessages.length - 1].wisdomKey}
                  </div>
                </div>
              )}

              {/* Bottom Hidden Audio Player for Real-time Voice */}
              <audio
                ref={dojoAudioRef}
                onEnded={() => setIsDojoAudioPlaying(false)}
                className="hidden"
              />

              {/* Action Direction Stage Note */}
              <div className="relative z-10 text-[11px] text-zinc-400 font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                <span>🎭 Scene Action: {livingMessages[livingMessages.length - 1]?.actionDirection}</span>
                {isDojoAudioPlaying && (
                  <span className="text-teal-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Speaking
                  </span>
                )}
              </div>
            </div>

            {/* Quick Dilemma Selector Chips */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Explore Philosophical Dilemmas (One-Click Dialogue)
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_DILEMMAS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendDojoQuery(d.prompt)}
                    disabled={isSimulating}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 rounded-xl text-left text-xs text-zinc-300 hover:text-white transition-all shadow-md group disabled:opacity-50"
                  >
                    <div className="font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <span>{d.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">({d.kanji.split(" ")[0]})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Input Bar (Mic + Text) */}
            <div className="bg-zinc-900/90 border border-zinc-700/70 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-xl shadow-xl">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendDojoQuery();
                }}
                placeholder="Ask Sensei Ren about your doubts, career, failure, or life path..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none px-2"
                disabled={isSimulating}
              />
              <button
                onClick={() => handleSendDojoQuery()}
                disabled={isSimulating || !userInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
              >
                {isSimulating ? (
                  <span className="flex items-center gap-2 font-mono">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Speak to Sensei
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation Transcript & Persona Wisdom Matrix (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-teal-400" />
                  Dojo Wisdom Log
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  {livingMessages.length} Interactions Recorded
                </span>
              </div>

              {/* Message History Feed */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {livingMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3.5 bg-black/50 border border-zinc-800/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
                      <span className="text-amber-400 font-bold">Q: {msg.userQuery}</span>
                      <span>{msg.philosophy.split("—")[0]}</span>
                    </div>
                    <p className="text-zinc-200 font-serif leading-relaxed">
                      "{msg.renDialogue}"
                    </p>
                    {msg.audioUrl && (
                      <button
                        onClick={() => {
                          if (dojoAudioRef.current) {
                            dojoAudioRef.current.src = msg.audioUrl!;
                            dojoAudioRef.current.play();
                            setIsDojoAudioPlaying(true);
                          }
                        }}
                        className="text-[10px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-1 bg-teal-950/40 border border-teal-500/30 px-2 py-1 rounded"
                      >
                        <Volume2 className="w-3 h-3" /> Replay Voice (Charon)
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Perpetual Wisdom Progression */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Wisdom Vector Sync</span>
                  <span className="text-amber-400 font-bold">100% Grounded</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-amber-400 h-full w-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
