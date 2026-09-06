"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Music2,
  Check,
  Clock,
  MoreHorizontal,
  MoreVertical,
  Download,
  Sliders,
  Settings,
  ChevronRight,
  ArrowRight,
  Edit3
} from "lucide-react";

export interface ScriptLine {
  id: string;
  speaker: string;
  emotion?: string;
  timestamp: string;
  text: string;
}

interface ScenePreset {
  id: string;
  title: string;
  setting: string;
  dynamic: string;
  still: string;
  video: string;
  lines: ScriptLine[];
}

const DEFAULT_SCENE: ScenePreset = {
  id: "mumbai_penthouse",
  title: "Luxury Mumbai Penthouse",
  setting: "Bandra Penthouse, Mumbai",
  dynamic: "Sibling Household",
  still: "/assets/stills/mumbai_penthouse.jpg",
  video: "/assets/video/napoleon_180s_master.mp4",
  lines: [
    {
      id: "l1",
      speaker: "RAJ",
      emotion: "smiling",
      timestamp: "01:21",
      text: "Bas karo, Shweta! Paneer khatam ho jayega!"
    },
    {
      id: "l2",
      speaker: "SHWETA",
      emotion: "laughing",
      timestamp: "01:25",
      text: "Rahul is eating it all!"
    },
    {
      id: "l3",
      speaker: "RAHUL",
      timestamp: "01:27",
      text: "No way!"
    }
  ]
};

export function OmniMultiPhaseStudio() {
  // Stepper Phase tracking (1 to 8, default 3 matching Figma mockup exactly)
  const [activePhase, setActivePhase] = useState<number>(3);
  const [completedPhases, setCompletedPhases] = useState<number[]>([1, 2]);

  // Phase 1 state
  const [settingText, setSettingText] = useState(DEFAULT_SCENE.setting);
  const [dynamicText, setDynamicText] = useState(DEFAULT_SCENE.dynamic);

  // Phase 3 editable script lines
  const [scriptLines, setScriptLines] = useState<ScriptLine[]>(DEFAULT_SCENE.lines);
  const [activeTag, setActiveTag] = useState<"Speakers" | "Tags" | "Hinglish">("Hinglish");

  // Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const dossierContainerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(84); // 01:24
  const [totalDuration, setTotalDuration] = useState(180); // 03:00
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vuLevels, setVuLevels] = useState<number[]>([5, 7, 9, 6, 8, 4, 7]);

  // Dynamic Audio VU Meter
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setVuLevels([
          Math.floor(Math.random() * 4) + 4,
          Math.floor(Math.random() * 5) + 3,
          Math.floor(Math.random() * 4) + 5,
          Math.floor(Math.random() * 6) + 2,
          Math.floor(Math.random() * 5) + 4,
          Math.floor(Math.random() * 4) + 3,
          Math.floor(Math.random() * 5) + 4,
        ]);
      } else {
        setVuLevels([5, 6, 8, 5, 7, 4, 6]); // Static heights matching Figma mockup
      }
    }, 180);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
        setTotalDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      playerWrapperRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * totalDuration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveAndAdvance = (fromPhase: number) => {
    if (!completedPhases.includes(fromPhase)) {
      setCompletedPhases((prev) => [...prev, fromPhase]);
    }
    const nextPhase = Math.min(8, fromPhase + 1);
    setActivePhase(nextPhase);

    setTimeout(() => {
      const activeCard = document.getElementById(`dossier-phase-${nextPhase}`);
      if (activeCard && dossierContainerRef.current) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 120);
  };

  const handleUpdateScriptLine = (id: string, newText: string) => {
    setScriptLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, text: newText } : line))
    );
  };

  return (
    <section id="hero-director" className="w-full bg-[#07090E] px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 pb-8">
      {/* Figma Frame Container */}
      <div 
        id="omni-multiphase-studio"
        className="mx-auto w-full max-w-[1760px] rounded-2xl border border-zinc-800/80 bg-[#0B0F17] p-3.5 sm:p-5 lg:p-6 shadow-2xl shadow-black/90 font-sans"
      >
        
        {/* ============================================================ */}
        {/* 1. TOP HEADER & TELEMETRY ROW (Exact Figma Replication)      */}
        {/* ============================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/70 pb-3.5 mb-4">
          
          {/* Left Brand + Pill Navigation */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 mr-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                Z
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Zyvoriq
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                Omni Director [Active]
              </button>
              <a
                href="#master-showcase"
                className="rounded-full bg-zinc-800/60 hover:bg-zinc-700/60 px-3 py-1 text-xs font-mono text-zinc-300 transition"
              >
                Master Film
              </a>
              <a
                href="#architecture"
                className="rounded-full bg-zinc-800/60 hover:bg-zinc-700/60 px-3 py-1 text-xs font-mono text-zinc-300 transition"
              >
                Architecture
              </a>
              <a
                href="#quality-gates"
                className="rounded-full bg-zinc-800/60 hover:bg-zinc-700/60 px-3 py-1 text-xs font-mono text-zinc-300 transition"
              >
                Quality Gates
              </a>
            </div>
          </div>

          {/* Right Telemetry Badges & Settings */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Veo 3.1 4K DCI
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
              <Music2 className="h-3 w-3 text-cyan-400" />
              EBU R128 -24 LUFS
            </div>
            <button
              type="button"
              className="rounded-full bg-zinc-800/60 p-1.5 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. MAIN 70 / 30 WORKSTATION GRID                             */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
          
          {/* ========================================================== */}
          {/* LEFT 70%: CINEMA PLAYER + 8-PHASE STEPPER + GATEKEEPER BAR */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            
            {/* A. MASTER CINEMA PLAYER (Exact Figma Framing & Aspect Ratio) */}
            <div 
              ref={playerWrapperRef}
              className="relative aspect-[16/9] lg:aspect-[2.35/1] w-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-black shadow-2xl group flex flex-col justify-between"
            >
              {/* Overlaid Scene Title (Top-Left) */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide">
                  {DEFAULT_SCENE.title}
                </h2>
              </div>

              {/* Video Element with Fallback Poster */}
              <div className="relative h-full w-full bg-black">
                <video
                  ref={videoRef}
                  src={DEFAULT_SCENE.video}
                  poster={DEFAULT_SCENE.still}
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="h-full w-full object-cover select-none"
                />

                {/* Large Center Play Button when paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/50 border border-emerald-400/40 text-emerald-300 backdrop-blur-md shadow-2xl transition hover:scale-110 hover:bg-emerald-500/20 active:scale-95 cursor-pointer z-10"
                    aria-label="Play Video"
                  >
                    <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-1" />
                  </button>
                )}
              </div>

              {/* Bottom Scrubber & Transport Bar */}
              <div className="relative z-20 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6 pb-3 px-4">
                
                {/* Glowing Emerald Progress Scrubber */}
                <div 
                  onClick={handleSeek}
                  className="relative h-1.5 w-full rounded-full bg-zinc-700/80 hover:h-2 cursor-pointer transition-all mb-2.5 group/track"
                >
                  {/* Progress Fill */}
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.85)]"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                  {/* Scrubber Knob */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-300 border-2 border-slate-950 shadow-[0_0_10px_rgba(16,185,129,1)] transition-transform group-hover/track:scale-125"
                    style={{ left: `calc(${(currentTime / totalDuration) * 100}% - 7px)` }}
                  />
                </div>

                {/* Transport Controls Row */}
                <div className="flex items-center justify-between gap-3 text-xs font-mono">
                  
                  {/* Left Controls: Play, Timecode, 4K DCI */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="text-white hover:text-emerald-400 transition cursor-pointer"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                    </button>

                    <span className="text-zinc-300 font-semibold tracking-wider">
                      {formatTime(currentTime)} <span className="text-zinc-500">/</span> {formatTime(totalDuration)}
                    </span>

                    <span className="rounded bg-black/70 border border-zinc-700/80 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                      4K DCI
                    </span>
                  </div>

                  {/* Right Controls: Speaker, Animated VU Meter, Fullscreen */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="text-zinc-400 hover:text-white transition cursor-pointer"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>

                    {/* Animated LED Audio VU Meter (Exact Mockup Match) */}
                    <div className="flex items-end gap-[2px] h-3.5 px-1 py-0.5 rounded bg-black/50 border border-zinc-800" title="Audio VU Meter (-24 LUFS)">
                      {vuLevels.map((lvl, idx) => (
                        <div
                          key={idx}
                          className={`w-[2.5px] rounded-xs transition-all duration-150 ${
                            idx > 5
                              ? "bg-amber-400"
                              : "bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.7)]"
                          }`}
                          style={{ height: `${Math.min(12, lvl * 1.5)}px` }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="text-zinc-400 hover:text-white transition cursor-pointer"
                      aria-label="Fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </div>

            {/* B. 8-PHASE STEPPER TRACK (Exact Horizontal Pill Flow with Chevrons) */}
            <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2 sm:p-2.5 backdrop-blur-md flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto select-none scrollbar-none">
              
              {/* 1. Cognition */}
              <button
                type="button"
                onClick={() => setActivePhase(1)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 1
                    ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    : completedPhases.includes(1)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>1. Cognition</span>
                {completedPhases.includes(1) && activePhase !== 1 && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 2. Logic & Sanity */}
              <button
                type="button"
                onClick={() => setActivePhase(2)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 2
                    ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    : completedPhases.includes(2)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>2. Logic &amp; Sanity</span>
                {completedPhases.includes(2) && activePhase !== 2 && (
                  <Check className="h-3 w-3 stroke-[3]" />
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 3. Script & EDL [Active] */}
              <button
                type="button"
                onClick={() => setActivePhase(3)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 3
                    ? "bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                    : completedPhases.includes(3)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>3. Script &amp; EDL</span>
                {activePhase === 3 ? (
                  <span className="text-[10px] bg-slate-950/30 px-1 rounded uppercase tracking-wider">
                    [Active]
                  </span>
                ) : completedPhases.includes(3) ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : null}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 4. Tool Routing */}
              <button
                type="button"
                onClick={() => setActivePhase(4)}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 4
                    ? "bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                    : completedPhases.includes(4)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>4. Tool Routing</span>
                {!completedPhases.includes(4) && activePhase !== 4 && (
                  <span className="text-amber-400 text-[10px]">⏳</span>
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 5. Video Gen */}
              <button
                type="button"
                onClick={() => setActivePhase(5)}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 5
                    ? "bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                    : completedPhases.includes(5)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>5. Video Gen</span>
                {!completedPhases.includes(5) && activePhase !== 5 && (
                  <span className="text-amber-400 text-[10px]">⏳</span>
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 6. Audio & Foley */}
              <button
                type="button"
                onClick={() => setActivePhase(6)}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 6
                    ? "bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                    : completedPhases.includes(6)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>6. Audio &amp; Foley</span>
                {!completedPhases.includes(6) && activePhase !== 6 && (
                  <span className="text-amber-400 text-[10px]">⏳</span>
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 7. Quality Gates */}
              <button
                type="button"
                onClick={() => setActivePhase(7)}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 7
                    ? "bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                    : completedPhases.includes(7)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>7. Quality Gates</span>
                {!completedPhases.includes(7) && activePhase !== 7 && (
                  <span className="text-amber-400 text-[10px]">⏳</span>
                )}
              </button>

              <span className="text-zinc-600 text-xs shrink-0">➔</span>

              {/* 8. Master Delivery */}
              <button
                type="button"
                onClick={() => setActivePhase(8)}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  activePhase === 8
                    ? "bg-emerald-400 text-slate-950 font-black ring-2 ring-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                    : completedPhases.includes(8)
                    ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-bold"
                    : "bg-zinc-800/40 text-zinc-400 hover:text-white"
                }`}
              >
                <span>8. Master Delivery</span>
                {!completedPhases.includes(8) && activePhase !== 8 && (
                  <span className="text-amber-400 text-[10px]">⏳</span>
                )}
              </button>

            </div>

            {/* C. BOTTOM QUALITY GATEKEEPER BAR (Exact Figma Replica) */}
            <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3 sm:py-2.5 sm:px-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider text-white">
                  Quality Gatekeeper
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
                <div className="rounded-md bg-black/60 border border-zinc-800 px-2.5 py-1 text-zinc-300">
                  Guard 1: 180s SMPTE <span className="font-black text-emerald-400">[PASS]</span>
                </div>
                <div className="rounded-md bg-black/60 border border-zinc-800 px-2.5 py-1 text-zinc-300">
                  Guard 3: Anatomy Audit <span className="font-black text-emerald-400">[PASS]</span>
                </div>
                <div className="rounded-md bg-black/60 border border-zinc-800 px-2.5 py-1 text-zinc-300">
                  Guard 4: -24.0 LUFS <span className="font-black text-emerald-400">[PASS]</span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================== */}
          {/* RIGHT 30%: DIRECTORIAL DOSSIER & CHAT                      */}
          {/* ========================================================== */}
          <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#0E131F]/90 p-4 sm:p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
            
            {/* Dossier Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3 mb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Directorial Dossier &amp; Chat
              </h3>
              <button
                type="button"
                className="text-zinc-400 hover:text-white transition p-1 cursor-pointer"
                title="Dossier actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Dossier Cards Stack */}
            <div 
              ref={dossierContainerRef}
              className="flex-1 space-y-2.5 overflow-y-auto max-h-[660px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              
              {/* PHASE 1 CARD: Cognition */}
              <div 
                id="dossier-phase-1"
                onClick={() => setActivePhase(1)}
                className={`rounded-xl border p-2.5 sm:p-3 transition cursor-pointer ${
                  activePhase === 1
                    ? "border-2 border-emerald-400/80 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-0.5">
                  <span className="font-bold text-zinc-200">Phase 1</span>
                  <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                </div>
                <div className="text-xs font-mono font-bold text-white mb-0.5">
                  Cognition: inputs
                </div>
                <div className="text-[11px] text-zinc-400 mb-2">
                  Context defined
                </div>

                <div className="w-full py-1 text-center rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  Approved ✓
                </div>
              </div>

              {/* PHASE 2 CARD: Logic */}
              <div 
                id="dossier-phase-2"
                onClick={() => setActivePhase(2)}
                className={`rounded-xl border p-2.5 sm:p-3 transition cursor-pointer ${
                  activePhase === 2
                    ? "border-2 border-emerald-400/80 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-0.5">
                  <span className="font-bold text-zinc-200">Phase 2: Logic</span>
                  <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                </div>
                <div className="text-xs font-mono text-zinc-300 mb-2">
                  Scene Consistency Check <span className="text-emerald-400 font-bold">[PASS]</span>
                </div>

                <div className="w-full py-1 text-center rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  Logic Approved ✓
                </div>
              </div>

              {/* PHASE 3 CARD: Script (Active in Figma Mockup) */}
              <div 
                id="dossier-phase-3"
                onClick={() => setActivePhase(3)}
                className={`rounded-xl border p-3 sm:p-3.5 transition cursor-pointer ${
                  activePhase === 3
                    ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                    : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-emerald-400">
                    Phase 3: Script
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-black/60 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                      Hinglish
                    </span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </div>

                {/* In-Place Dialogue Rows */}
                <div className="space-y-1.5 text-xs font-sans">
                  {scriptLines.map((line) => (
                    <div key={line.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span className="text-zinc-200 font-bold">
                          [{line.speaker}] {line.emotion ? `(${line.emotion})` : ""}
                        </span>
                        <span className="text-zinc-500">{line.timestamp}</span>
                      </div>

                      <textarea
                        rows={line.text.length > 40 ? 2 : 1}
                        value={line.text}
                        onChange={(e) => handleUpdateScriptLine(line.id, e.target.value)}
                        className="w-full resize-none rounded-md bg-black/20 p-1 text-xs text-zinc-300 font-medium focus:bg-black/60 focus:border focus:border-emerald-400/60 focus:outline-none transition leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                {/* Filter Tags: Speakers, Tags, Hinglish */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/60">
                  {(["Speakers", "Tags", "Hinglish"] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTag(tag);
                      }}
                      className={`rounded px-2 py-0.5 text-[10px] font-mono transition cursor-pointer ${
                        activeTag === tag
                          ? "bg-zinc-700 text-white font-bold"
                          : "bg-zinc-800/50 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Primary Button: Save & Advance Phase 4 (Exact Mockup Primary Button) */}
                {activePhase === 3 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveAndAdvance(3);
                    }}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                  >
                    <span>Save &amp; Advance Phase 4</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : completedPhases.includes(3) ? (
                  <div className="mt-2.5 w-full py-1 text-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                    Script Locked ✓
                  </div>
                ) : null}
              </div>

              {/* PHASE 4 CARD: Tool Routing */}
              {activePhase >= 4 && (
                <div 
                  id="dossier-phase-4"
                  onClick={() => setActivePhase(4)}
                  className={`rounded-xl border p-3.5 sm:p-4 transition cursor-pointer ${
                    activePhase === 4
                      ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-200">Phase 4: Tool Routing</span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    Unbiased Omni Delegation:
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono mb-3">
                    <div className="flex items-center justify-between rounded bg-black/40 p-1.5">
                      <span className="text-zinc-400">Diffusion:</span>
                      <span className="text-emerald-400 font-bold">Veo 3.1 4K DCI</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-black/40 p-1.5">
                      <span className="text-zinc-400">Director:</span>
                      <span className="text-cyan-400 font-bold">Gemini 2.5 Flash</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-black/40 p-1.5">
                      <span className="text-zinc-400">Audio:</span>
                      <span className="text-amber-400 font-bold">DeepMind Emotional Voice</span>
                    </div>
                  </div>

                  {activePhase === 4 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveAndAdvance(4);
                      }}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    >
                      Save &amp; Advance Phase 5 <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-full py-1 text-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      Routing Locked ✓
                    </div>
                  )}
                </div>
              )}

              {/* PHASE 5, 6, 7, 8 CARDS */}
              {activePhase >= 5 && (
                <div 
                  id="dossier-phase-5"
                  onClick={() => setActivePhase(5)}
                  className={`rounded-xl border p-3.5 sm:p-4 transition cursor-pointer ${
                    activePhase === 5
                      ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-200">Phase 5: Video Gen</span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    4K DCI Latent Diffusion (24fps SMPTE)
                  </div>
                  {activePhase === 5 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveAndAdvance(5);
                      }}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    >
                      Save &amp; Advance Phase 6 <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-full py-1 text-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      Keyframes Rendered ✓
                    </div>
                  )}
                </div>
              )}

              {activePhase >= 6 && (
                <div 
                  id="dossier-phase-6"
                  onClick={() => setActivePhase(6)}
                  className={`rounded-xl border p-3.5 sm:p-4 transition cursor-pointer ${
                    activePhase === 6
                      ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-200">Phase 6: Audio &amp; Foley</span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    EBU R128 (-24.0 LUFS broadcast mix)
                  </div>
                  {activePhase === 6 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveAndAdvance(6);
                      }}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    >
                      Save &amp; Advance Phase 7 <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-full py-1 text-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      Audio Mixed ✓
                    </div>
                  )}
                </div>
              )}

              {activePhase >= 7 && (
                <div 
                  id="dossier-phase-7"
                  onClick={() => setActivePhase(7)}
                  className={`rounded-xl border p-3.5 sm:p-4 transition cursor-pointer ${
                    activePhase === 7
                      ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-200">Phase 7: Quality Gates</span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold mb-2">
                    13 Forensic Guards Certified [PASS]
                  </div>
                  {activePhase === 7 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveAndAdvance(7);
                      }}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                    >
                      Save &amp; Advance Phase 8 <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-full py-1 text-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      Gates Cleared ✓
                    </div>
                  )}
                </div>
              )}

              {activePhase >= 8 && (
                <div 
                  id="dossier-phase-8"
                  onClick={() => setActivePhase(8)}
                  className={`rounded-xl border p-3.5 sm:p-4 transition cursor-pointer ${
                    activePhase === 8
                      ? "border-2 border-emerald-400/90 bg-emerald-950/20 shadow-[0_0_22px_rgba(16,185,129,0.2)]"
                      : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="font-bold text-zinc-200">Phase 8: Master Delivery</span>
                    <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-xs font-mono text-zinc-300 mb-2">
                    4K DCI Cinema Master ready for export
                  </div>
                  <a
                    href={DEFAULT_SCENE.video}
                    download="zyvoriq_mumbai_penthouse_master.mp4"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <Download className="h-4 w-4" /> Export Master 4K Film
                  </a>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
