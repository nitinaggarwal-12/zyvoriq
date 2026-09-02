"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZoomKeyframe } from "@/lib/reel/autoZoom";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Sliders,
  Captions,
  Eye,
  Layers,
  ChevronRight
} from "lucide-react";

import { getCachedMediaBlobUrl } from "@/lib/cache/mediaCache";
import { BRollItem, getActiveBRollAtTime } from "@/lib/reel/broll";
import { KineticEmojiItem, getActiveEmojiAtTime, playProceduralSFX } from "@/lib/reel/kineticEmoji";

interface DynamicZoomVideoPlayerProps {
  videoUrl: string;
  keyframes: ZoomKeyframe[];
  brollItems?: BRollItem[];
  showBRoll?: boolean;
  kineticEmojis?: KineticEmojiItem[];
  showEmojis?: boolean;
  showSFX?: boolean;
  subtitleText?: string;
  subtitleStyle?: string;
  onSeekToScene?: (sceneIndex: number) => void;
}

export function DynamicZoomVideoPlayer({
  videoUrl,
  keyframes,
  brollItems = [],
  showBRoll = true,
  kineticEmojis = [],
  showEmojis = true,
  showSFX = true,
  subtitleText,
  subtitleStyle = "karaoke-gold",
  onSeekToScene
}: DynamicZoomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const brollVideoRef = useRef<HTMLVideoElement>(null);
  const lastPlayedSFXRef = useRef<string | null>(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>(videoUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [currentLabel, setCurrentLabel] = useState<string>("1.0x Wide");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeBRoll, setActiveBRoll] = useState<BRollItem | null>(null);
  const [activeEmoji, setActiveEmoji] = useState<KineticEmojiItem | null>(null);
  const [enableEmojis, setEnableEmojis] = useState(showEmojis);
  const [enableSFXAudio, setEnableSFXAudio] = useState(showSFX);

  useEffect(() => {
    let active = true;
    getCachedMediaBlobUrl(videoUrl).then((cached) => {
      if (active) setResolvedVideoUrl(cached);
    });
    return () => { active = false; };
  }, [videoUrl]);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [enableBRollOverlay, setEnableBRollOverlay] = useState(showBRoll);
  const [manualZoomOverride, setManualZoomOverride] = useState<number | null>(null);

  const effectiveZoom = manualZoomOverride !== null ? manualZoomOverride : currentZoom;

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Synchronize B-Roll cutaways
    if (enableBRollOverlay && brollItems.length > 0) {
      const broll = getActiveBRollAtTime(brollItems, t);
      setActiveBRoll(broll);
    } else {
      setActiveBRoll(null);
    }

    // Synchronize 3D Kinetic Emojis & Auto-SFX (Phase 4)
    if (enableEmojis && kineticEmojis.length > 0) {
      const emoji = getActiveEmojiAtTime(kineticEmojis, t);
      setActiveEmoji(emoji);

      if (emoji && isPlaying && enableSFXAudio && lastPlayedSFXRef.current !== emoji.id) {
        lastPlayedSFXRef.current = emoji.id;
        playProceduralSFX(emoji.sfx, emoji.sfxVolume);
      }
    } else {
      setActiveEmoji(null);
    }

    if (manualZoomOverride === null) {
      if (!keyframes || keyframes.length === 0) {
        setCurrentZoom(1.0);
        setCurrentLabel("1.0x Wide");
      } else {
        const activeKeyframe = keyframes.find(k => t >= k.startSec && t <= k.endSec);
        if (activeKeyframe) {
          setCurrentZoom(activeKeyframe.scale);
          setCurrentLabel(activeKeyframe.label);
        } else {
          setCurrentZoom(1.0);
          setCurrentLabel("1.0x Wide");
        }
      }
    }
  };

  // Frame-accurate synchronization between primary A-Roll and active B-Roll overlay
  useEffect(() => {
    if (brollVideoRef.current && activeBRoll) {
      const targetOffset = Math.max(0, currentTime - activeBRoll.startSec);
      if (Math.abs(brollVideoRef.current.currentTime - targetOffset) > 0.3) {
        brollVideoRef.current.currentTime = targetOffset;
      }
      if (isPlaying && brollVideoRef.current.paused) {
        brollVideoRef.current.play().catch(() => {});
      } else if (!isPlaying && !brollVideoRef.current.paused) {
        brollVideoRef.current.pause();
      }
    }
  }, [activeBRoll, currentTime, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const stepTime = (deltaSeconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.duration || 999, videoRef.current.currentTime + deltaSeconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const stepFrame = (deltaFrames: number) => {
    stepTime(deltaFrames * (1 / 24));
  };

  const handleRateChange = () => {
    const rates = [0.5, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (videoRef.current) videoRef.current.playbackRate = nextRate;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const ms = Math.floor((sec % 1) * 10).toString();
    return `${m}:${s}.${ms}`;
  };

  const currentFrame = Math.floor(currentTime * 24);
  const totalFrames = Math.floor((duration || 30) * 24);

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[9/16] w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl"
    >
      {/* Primary A-Roll Video Surface */}
      <div
        className="h-full w-full overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${effectiveZoom})`,
          transformOrigin: "center 38%"
        }}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full cursor-pointer object-cover"
        />
      </div>

      {/* B-ROLL CUTAWAY OVERLAY LAYER (Phase 3) */}
      {enableBRollOverlay && activeBRoll && (
        <>
          {/* Full Cutaway */}
          {activeBRoll.type === "full_cutaway" && (
            <div className="absolute inset-0 z-10 overflow-hidden bg-black transition-opacity duration-300 animate-in fade-in">
              <video
                ref={brollVideoRef}
                src={activeBRoll.brollUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute top-12 left-3 rounded-full border border-teal-400/40 bg-black/85 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-300 backdrop-blur-md shadow-xl">
                ⚡ B-ROLL: {activeBRoll.keyword.toUpperCase()}
              </div>
            </div>
          )}

          {/* Picture-in-Picture (PIP) Floating Card */}
          {activeBRoll.type === "pip_top_right" && (
            <div className="absolute top-12 right-3 z-20 w-36 aspect-[9/16] overflow-hidden rounded-2xl border-2 border-pink-500 bg-black/90 shadow-2xl transition-all duration-300 animate-in zoom-in-90">
              <video
                ref={brollVideoRef}
                src={activeBRoll.brollUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-1 inset-x-1 rounded-md bg-black/80 py-0.5 text-center text-[8px] font-black uppercase text-pink-300">
                PIP · {activeBRoll.keyword}
              </div>
            </div>
          )}

          {/* Split Screen Top/Bottom */}
          {activeBRoll.type === "split_screen" && (
            <div className="absolute inset-x-0 top-0 h-1/2 z-15 overflow-hidden border-b-2 border-teal-400/50 bg-black transition-all duration-300 animate-in slide-in-from-top">
              <video
                ref={brollVideoRef}
                src={activeBRoll.brollUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[8px] font-black uppercase text-teal-300">
                SPLIT · {activeBRoll.keyword}
              </div>
            </div>
          )}
        </>
      )}

      {/* Top HUD Overlay: Zoom Status + Subtitles Toggle + Timecode */}
      <div className="pointer-events-auto absolute inset-x-3 top-3 z-30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-pink-300 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          <span>{manualZoomOverride !== null ? `${manualZoomOverride}x Manual` : currentLabel}</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/80 px-2.5 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-md">
          <span>FR {currentFrame}/{totalFrames}</span>
          <span className="text-pink-400">@ 24fps</span>
        </div>
      </div>

      {/* Center Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/30 transition hover:bg-black/20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-pink-400/40 bg-pink-500/90 text-white shadow-2xl shadow-pink-500/50 backdrop-blur-md transition group-hover:scale-110">
            <Play className="ml-1 h-7 w-7 fill-white" />
          </div>
        </div>
      )}

      {/* 3D KINETIC EMOJIS OVERLAY LAYER (Phase 4) */}
      {enableEmojis && activeEmoji && (
        <div
          className={`pointer-events-none absolute z-25 flex flex-col items-center justify-center transition-all duration-300 ${
            activeEmoji.position === "center"
              ? "inset-0"
              : activeEmoji.position === "top_center"
              ? "inset-x-0 top-16"
              : "inset-x-0 bottom-36"
          }`}
        >
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
            <span className="text-6xl sm:text-7xl filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)] transition-transform duration-200 hover:scale-125">
              {activeEmoji.emoji}
            </span>
            <div className="mt-1.5 rounded-full border border-pink-400/50 bg-black/90 px-3.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-pink-200 shadow-2xl backdrop-blur-md">
              {activeEmoji.label}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Subtitle Preview Overlay */}
      {showSubtitles && (
        <div className="pointer-events-none absolute inset-x-4 bottom-24 z-20 text-center">
          <div className="inline-block rounded-xl border border-yellow-400/30 bg-black/85 px-4 py-2 shadow-2xl backdrop-blur-md">
            <span className="text-xs font-black tracking-wide text-yellow-300 drop-shadow-md">
              {subtitleText || "🔥 ZYVORIQ ULTRA-HD CONTINUOUS CINEMA WITH NATIVE LIP-SYNC"}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Professional Studio Controller Bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 backdrop-blur-md">
        {/* Timeline Scrubber Bar */}
        <div className="flex items-center gap-2">
          <span className="w-12 text-right text-[10px] font-bold text-pink-300">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 30}
            step={0.01}
            value={currentTime}
            onChange={handleSeek}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-pink-500 outline-none hover:bg-white/30"
          />
          <span className="w-12 text-left text-[10px] font-bold text-slate-400">
            {formatTime(duration || 30)}
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="mt-2.5 flex items-center justify-between gap-1">
          {/* Left: Playback & Backward/Forward Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-pink-500 hover:text-white"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
            </button>

            {/* Rewind 5s */}
            <button
              onClick={() => stepTime(-5)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-200 transition hover:border-pink-500/50 hover:bg-pink-500/20 hover:text-pink-200"
              title="Rewind 5 Seconds (-5s)"
            >
              <RotateCcw className="h-3.5 w-3.5 text-pink-400" />
              <span className="text-[10px] font-black">-5s</span>
            </button>

            {/* Forward 5s */}
            <button
              onClick={() => stepTime(5)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-200 transition hover:border-pink-500/50 hover:bg-pink-500/20 hover:text-pink-200"
              title="Fast Forward 5 Seconds (+5s)"
            >
              <RotateCw className="h-3.5 w-3.5 text-pink-400" />
              <span className="text-[10px] font-black">+5s</span>
            </button>

            {/* Step 1 Frame Back */}
            <button
              onClick={() => stepFrame(-1)}
              className="rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] font-black text-slate-300 transition hover:border-teal-400/40 hover:bg-teal-400/20 hover:text-teal-200"
              title="Step -1 Frame Back"
            >
              -1F
            </button>

            {/* Step 1 Frame Forward */}
            <button
              onClick={() => stepFrame(1)}
              className="rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] font-black text-slate-300 transition hover:border-teal-400/40 hover:bg-teal-400/20 hover:text-teal-200"
              title="Step +1 Frame Forward"
            >
              +1F
            </button>
          </div>

          {/* Right: Rate, Audio & Fullscreen Controls */}
          <div className="flex items-center gap-1.5">
            {/* Speed Selector */}
            <button
              onClick={handleRateChange}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black text-slate-200 hover:bg-white/10"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`rounded-lg p-1.5 transition ${
                showSubtitles ? "bg-pink-500/20 text-pink-300" : "text-slate-400 hover:bg-white/10"
              }`}
              title="Toggle Subtitles Overlay"
            >
              <Captions className="h-4 w-4" />
            </button>

            {/* B-Roll Toggle (Phase 3) */}
            <button
              onClick={() => setEnableBRollOverlay(!enableBRollOverlay)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black transition ${
                enableBRollOverlay ? "bg-teal-400/20 text-teal-300 border border-teal-400/30" : "text-slate-500 hover:bg-white/10"
              }`}
              title="Toggle Smart B-Roll & PIP Cutaways"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>B-Roll</span>
            </button>

            {/* Emojis Toggle (Phase 4) */}
            <button
              onClick={() => setEnableEmojis(!enableEmojis)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black transition ${
                enableEmojis ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "text-slate-500 hover:bg-white/10"
              }`}
              title="Toggle 3D Kinetic Emojis"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Emojis</span>
            </button>

            {/* Procedural SFX Toggle (Phase 4) */}
            <button
              onClick={() => setEnableSFXAudio(!enableSFXAudio)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black transition ${
                enableSFXAudio ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30" : "text-slate-500 hover:bg-white/10"
              }`}
              title="Toggle Procedural Whoosh/Ding SFX"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>SFX</span>
            </button>

            {/* Audio Mute */}
            <button
              onClick={toggleMute}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
