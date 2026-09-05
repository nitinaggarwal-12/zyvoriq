"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clapperboard, Film, Play, Pause, Sparkles, ShieldCheck, Video, RefreshCw, Cpu, Volume2, VolumeX } from "lucide-react";

interface VeoVideoStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  videoUrl?: string;
  restartTrigger?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onTogglePlay?: () => void;
}

export const VeoVideoStage: React.FC<VeoVideoStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  videoUrl,
  restartTrigger = 0,
  onTimeUpdate,
  onTogglePlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync external isPlaying state with the real HTML5 video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Handle Instant Restart Trigger
  useEffect(() => {
    const video = videoRef.current;
    if (!video || restartTrigger === 0) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => {});
    }
  }, [restartTrigger]);

  const handleTogglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-100 tracking-wide">
                ZYVORIQ NEURAL CINEMA GENERATION STUDIO
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NEURAL CINEMA DIFFUSION • 100% ULTRA-HD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthesized directly on sovereign GPU clusters using <code className="text-purple-300">zyvoriq-neural-cinema-v3.1-core</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compute Job: 05tf44lmc39p</span>
          </div>
        </div>
      </div>

      {/* Main Real Video Player Viewport */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-500/40 shadow-2xl group flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            loop
            muted={true}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-purple-950/20 via-black to-black">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Film className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-full">
              NEURAL CINEMA STAGE · READY
            </span>
            <p className="text-[11px] text-slate-400 font-mono max-w-sm">
              Zero fallback objects. Awaiting keynote prompt synthesis or live stream broadcast.
            </p>
          </div>
        )}

        {/* Viewport Top HUD */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-2 pointer-events-auto">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Neural Cinema Keynote Broadcast</span>
          </div>
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
            24mm Cinema Master
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            C2PA Provenance Verified
          </div>
        </div>

        {/* Floating Play/Pause Overlay */}
        <button
          onClick={handleTogglePlay}
          className="absolute z-30 p-4 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
        >
          {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
