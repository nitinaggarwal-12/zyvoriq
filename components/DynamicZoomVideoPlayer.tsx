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

interface DynamicZoomVideoPlayerProps {
  videoUrl: string;
  keyframes: ZoomKeyframe[];
  subtitleText?: string;
  subtitleStyle?: string;
  onSeekToScene?: (sceneIndex: number) => void;
}

export function DynamicZoomVideoPlayer({
  videoUrl,
  keyframes,
  subtitleText,
  subtitleStyle = "karaoke-gold",
  onSeekToScene
}: DynamicZoomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [currentLabel, setCurrentLabel] = useState<string>("1.0x Wide");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [manualZoomOverride, setManualZoomOverride] = useState<number | null>(null);

  const effectiveZoom = manualZoomOverride !== null ? manualZoomOverride : currentZoom;

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

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
    // 24fps -> ~0.0416s per frame
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
      {/* Zoomable Video Surface */}
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
          src={videoUrl}
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full cursor-pointer object-cover"
        />
      </div>

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

      {/* Dynamic Subtitle Preview Overlay */}
      {showSubtitles && (
        <div className="pointer-events-none absolute inset-x-4 bottom-24 z-20 text-center">
          <div className="inline-block rounded-xl border border-yellow-400/30 bg-black/85 px-4 py-2 shadow-2xl backdrop-blur-md">
            <span className="text-xs font-black tracking-wide text-yellow-300 drop-shadow-md">
              {subtitleText || "🔥 OPTION C CONTINUOUS VEO 3.1 WITH NATIVE LIP-SYNC"}
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-pink-300"
              title="Rewind 5 Seconds (-5s)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Forward 5s */}
            <button
              onClick={() => stepTime(5)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-pink-300"
              title="Fast Forward 5 Seconds (+5s)"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Step 1 Frame Back */}
            <button
              onClick={() => stepFrame(-1)}
              className="px-1.5 py-1 text-[10px] font-black text-slate-400 hover:bg-white/10 hover:text-white"
              title="Step -1 Frame Back"
            >
              -1F
            </button>

            {/* Step 1 Frame Forward */}
            <button
              onClick={() => stepFrame(1)}
              className="px-1.5 py-1 text-[10px] font-black text-slate-400 hover:bg-white/10 hover:text-white"
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
