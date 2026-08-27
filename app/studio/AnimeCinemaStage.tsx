"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  Tv
} from "lucide-react";
import {
  ANIME_SUBTITLE_CUES,
  AUDIO_LANGUAGES,
  SUBTITLE_LANGUAGES,
  AudioLangCode,
  SubtitleLangCode,
  SubtitleCue
} from "@/lib/tier6/anime_subtitles";

export function AnimeCinemaStage() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(56.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<AudioLangCode>("ja");
  const [subtitleLang, setSubtitleLang] = useState<SubtitleLangCode>("en");
  const [showAudioSubMenu, setShowAudioSubMenu] = useState<boolean>(false);
  const [selectedActIndex, setSelectedActIndex] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize Active Subtitle Cue
  const activeCue = ANIME_SUBTITLE_CUES.find(
    (c) => currentTime >= c.startTime && currentTime <= c.endTime
  );

  // Update selected act on time progress
  useEffect(() => {
    const actIdx = Math.min(Math.floor(currentTime / 8.0), 6);
    setSelectedActIndex(actIdx);
  }, [currentTime]);

  // Audio track switching with exact timecode preservation
  const handleAudioLangChange = (code: AudioLangCode) => {
    setAudioLang(code);
    const audio = audioRef.current;
    if (audio) {
      const wasPlaying = isPlaying;
      audio.currentTime = currentTime;
      if (wasPlaying) {
        audio.play().catch(() => {});
      }
    }
  };

  // Play / Pause Master Sync
  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (isPlaying) {
      video.pause();
      audio.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Time Scrubbing
  const handleSeek = (time: number) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) video.currentTime = time;
    if (audio) audio.currentTime = time;
    setCurrentTime(time);
  };

  // Time Updates from Video Element
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      // Continuous audio synchronization drift guard (max 120ms drift allowance)
      if (audio && Math.abs(audio.currentTime - video.currentTime) > 0.12) {
        audio.currentTime = video.currentTime;
      }
    }
  };

  // Skip 10 seconds
  const skipSeconds = (delta: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + delta));
    handleSeek(nextTime);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-amber-950/20 to-black border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-radial-glow opacity-30 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-red-600/30 border border-red-500/40 text-red-300 font-mono text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg shadow-red-950/50">
                <Film className="w-3.5 h-3.5 text-red-400" />
                Anime Cinema Suite
              </span>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-wider rounded-full">
                6-Language Multilingual Dubs
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white font-bold">
              The Master & The Apprentice: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400">Path to Kaizen</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              56-second cinematic anime self-improvement narrative. Featuring 6-language studio dubs (JA, EN, ES, FR, DE, HI) and Netflix/Prime-grade subtitle controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAudioSubMenu(!showAudioSubMenu)}
              className="px-4 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/50 hover:border-amber-500/50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg backdrop-blur-md"
            >
              <Languages className="w-4 h-4 text-amber-400" />
              <span>Audio: <b className="text-amber-300 font-mono uppercase">{audioLang}</b></span>
              <span className="text-zinc-500">|</span>
              <span>Subtitles: <b className="text-amber-300 font-mono uppercase">{subtitleLang}</b></span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Cinema Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cinema Player Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div
            ref={containerRef}
            className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group select-none"
          >
            {/* Master 56.0s 7-Act Video Stream */}
            <video
              ref={videoRef}
              src="/assets/video/ren_and_aoi_conversation_synced.mp4"
              className="w-full h-full object-cover"
              muted={true}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration || 56.0);
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.pause();
              }}
              onClick={togglePlay}
            />

            {/* Dynamic Multilingual Dub Audio Element */}
            <audio
              ref={audioRef}
              src={`/assets/audio/anime_dubs/dub_${audioLang}.mp3`}
              muted={isMuted}
              preload="auto"
            />

            {/* Broadcast Subtitles Overlay (Netflix / Prime Gold Style) */}
            {subtitleLang !== "off" && activeCue && (
              <div className="absolute bottom-20 inset-x-8 flex justify-center pointer-events-none transition-all duration-300 z-30">
                <div className="bg-black/75 backdrop-blur-md border border-zinc-700/50 px-6 py-3 rounded-2xl max-w-2xl text-center shadow-2xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeCue.speaker}
                    </span>
                    <span className="text-[10px] font-serif italic text-zinc-400">
                      {activeCue.philosophy}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm md:text-base leading-relaxed text-amber-100/95 tracking-wide drop-shadow-md">
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
                        Audio Dub Track
                      </h4>
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
              {/* Progress Scrubber */}
              <div
                className="w-full h-1.5 bg-zinc-700/60 rounded-full cursor-pointer relative overflow-hidden group/scrub"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  handleSeek(clickPos * duration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-amber-300 transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
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
                    {Math.floor(currentTime % 60).toString().padStart(2, "0")} / 0:56
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speech Bubble Icon for Audio & Subtitles */}
                  <button
                    onClick={() => setShowAudioSubMenu(!showAudioSubMenu)}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors font-mono text-xs uppercase"
                    title="Audio & Subtitles"
                  >
                    <Subtitles className="w-4 h-4" />
                    <span>{audioLang.toUpperCase()} / {subtitleLang.toUpperCase()}</span>
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
                  Current Chapter (Act {selectedActIndex + 1} of 7)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {ANIME_SUBTITLE_CUES[selectedActIndex]?.actName || "Act 1: Apprentice Doubt"}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400/90 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                {ANIME_SUBTITLE_CUES[selectedActIndex]?.philosophy.split("—")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Act Storyboard & Philosophy Timeline Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              7-Act Story Navigator
            </h3>
            <span className="text-xs font-mono text-zinc-500">56s Total</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {ANIME_SUBTITLE_CUES.slice(0, 7).map((cue, idx) => {
              const isActive = selectedActIndex === idx;
              const timecode = `${Math.floor(cue.startTime / 60)}:${Math.floor(cue.startTime % 60).toString().padStart(2, "0")}`;
              return (
                <div
                  key={cue.id}
                  onClick={() => handleSeek(cue.startTime)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-red-950/50 to-zinc-900 border-red-500/60 shadow-lg shadow-red-950/40"
                      : "bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-red-400" : "bg-zinc-600"}`} />
                      {cue.actName}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">{timecode}</span>
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
  );
}
