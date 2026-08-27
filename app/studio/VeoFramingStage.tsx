"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VeoFramingStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  restartTrigger?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VeoFramingStage: React.FC<VeoFramingStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  restartTrigger = 0,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [framingMode, setFramingMode] = useState<"full" | "half" | "close">("half");
  const [localPlaying, setLocalPlaying] = useState<boolean>(false);

  const FRAMING_PRESETS = {
    full: { scale: "scale-100", offset: "translate-y-0" },
    half: { scale: "scale-125", offset: "translate-y-[-4%]" },
    close: { scale: "scale-160", offset: "translate-y-[-10%]" }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    } else {
      video.pause();
      setLocalPlaying(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || restartTrigger === 0) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    }
  }, [restartTrigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (onTimeUpdate) onTimeUpdate(video.currentTime);
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    } else {
      video.pause();
      setLocalPlaying(false);
    }
  };

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
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group flex items-center justify-center">
        <div className={`relative w-full h-full transition-transform duration-700 ease-out origin-center ${currentPreset.scale} ${currentPreset.offset}`}>
          <video
            ref={videoRef}
            src="/assets/video/veo_priya_master.mp4"
            playsInline
            loop
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setLocalPlaying(true)}
            onPause={() => setLocalPlaying(false)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Clean Hover Play/Pause Overlay */}
        <button
          onClick={handleTogglePlay}
          className="absolute z-30 p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-black/80"
        >
          {localPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
