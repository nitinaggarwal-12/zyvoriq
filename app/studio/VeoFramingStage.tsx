"use client";

import React, { useState, useRef, useEffect } from "react";

interface VeoFramingStageProps {
  videoUrl?: string;
  isPlaying: boolean;
  currentTime?: number;
  restartTrigger?: number;
  onTogglePlay?: () => void;
}

export const VeoFramingStage: React.FC<VeoFramingStageProps> = ({
  videoUrl = "/assets/video/priya_master.mp4",
  isPlaying,
  currentTime = 0,
  restartTrigger = 0,
  onTogglePlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [framingMode, setFramingMode] = useState<"full" | "half" | "close">("half");

  const FRAMING_PRESETS = {
    full: { scale: "scale-100", offset: "translate-y-0" },
    half: { scale: "scale-125", offset: "translate-y-[-4%]" },
    close: { scale: "scale-160", offset: "translate-y-[-10%]" }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.4) {
      video.currentTime = currentTime % (video.duration || 8);
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || restartTrigger === 0) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => {});
    }
  }, [restartTrigger]);

  const currentPreset = FRAMING_PRESETS[framingMode];

  return (
    <div className="flex flex-col gap-3">
      {/* Clean Framing Selector */}
      <div className="flex items-center justify-end">
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shadow-lg">
          {(["full", "half", "close"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFramingMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                framingMode === mode
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "full" ? "🧍 Full-Body" : mode === "half" ? "🎤 Half-Body" : "🎥 Headshot"}
            </button>
          ))}
        </div>
      </div>

      {/* Video Viewport with Smooth Animated Zoom */}
      <div 
        onClick={onTogglePlay}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group flex items-center justify-center cursor-pointer"
      >
        <div className={`relative w-full h-full transition-transform duration-700 ease-out origin-center ${currentPreset.scale} ${currentPreset.offset}`}>
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            muted
            loop
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
