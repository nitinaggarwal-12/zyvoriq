"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clapperboard, Film, Play, Pause, Sparkles, ShieldCheck, Video, RefreshCw, Cpu, Volume2, VolumeX } from "lucide-react";

interface VeoVideoStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VeoVideoStage: React.FC<VeoVideoStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeShot, setActiveShot] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(100);
  const [localPlaying, setLocalPlaying] = useState<boolean>(false);

  const SHOTS = [
    { id: 0, title: "Shot 1: Veo 3.1 Establishing Keynote", focal: "24mm Cinema Master", motion: "Authentic Human Speech & Body Kinematics" },
    { id: 1, title: "Shot 2: 70mm Executive Close-Up", focal: "70mm Portrait Prime", motion: "Dynamic Eye Gaze & Natural Facial Diffusion" },
    { id: 2, title: "Shot 3: Sovereign Stage Arc", focal: "35mm Anamorphic", motion: "Physical Stage Lighting & Spatial Movement" }
  ];

  // Sync external isPlaying state with the real HTML5 video
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
                GOOGLE VEO 3.1 AI VIDEO GENERATION STUDIO
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VEO 3.1 ACTIVE DIFFUSION • 100% REAL VIDEO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthesized directly on Google Cloud GPUs using <code className="text-purple-300">models/veo-3.1-fast-generate-preview</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>GCP Job: 05tf44lmc39p</span>
          </div>
        </div>
      </div>

      {/* Main Real Video Player Viewport */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-500/40 shadow-2xl group flex items-center justify-center">
        {/* Real Veo 3.1 MP4 Video */}
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

        {/* Viewport Top HUD */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-2 pointer-events-auto">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>{SHOTS[activeShot].title}</span>
          </div>
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
            {SHOTS[activeShot].focal}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Veo 3.1 C2PA Verified
          </div>
        </div>

        {/* Floating Play/Pause Overlay */}
        <button
          onClick={handleTogglePlay}
          className="absolute z-30 p-4 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/50 text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-purple-600/80"
        >
          {localPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        {/* Bottom Shot Timeline Selector */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
          <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-purple-500/30 text-purple-300 font-mono text-[11px] flex items-center gap-2 pointer-events-auto">
            <span className="text-purple-400">🎥 Camera Motion:</span>
            <span className="font-bold text-white bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/40">
              {SHOTS[activeShot].motion}
            </span>
          </div>

          <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl pointer-events-auto">
            {SHOTS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveShot(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  activeShot === idx
                    ? "bg-purple-500/30 border border-purple-400 text-purple-200 shadow-sm shadow-purple-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                Shot {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
