"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clapperboard, Film, Play, Pause, Sparkles, ShieldCheck, Video, RefreshCw, Cpu, Layers } from "lucide-react";

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
  selectedPersonaAvatar,
  audioUrl,
  onTimeUpdate,
}) => {
  const [activeShot, setActiveShot] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(100);
  const [cameraMotion, setCameraMotion] = useState<string>("Slow Keynote Dolly In + Pan Right");

  const SHOTS = [
    { id: 0, title: "Shot 1: Keynote Establishing Wide", focal: "24mm Cinema Lens", motion: "Slow Keynote Dolly In + Pan Right", time: "0.0s - 7.5s", scale: "scale-100", offset: "translate-y-0" },
    { id: 1, title: "Shot 2: 70mm Executive Close-Up", focal: "70mm Portrait Prime", motion: "Subtle Head Tracking & Eyeline Lock", time: "7.5s - 15.0s", scale: "scale-125", offset: "-translate-y-4" },
    { id: 2, title: "Shot 3: Auditorium B-Roll & Screen", focal: "35mm Anamorphic", motion: "Dynamic Stage Arc Vector", time: "15.0s - 23.2s", scale: "scale-110", offset: "translate-y-2" }
  ];

  // Auto-switch cinematic shots during playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveShot((prev) => (prev + 1) % SHOTS.length);
      }, 7500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setIsGenerating(false);
      }
      setGenerationProgress(p);
    }, 150);
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
                GOOGLE VEO 2 / NEURAL VIDEO DIFFUSION STUDIO
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/40">
                TEMPORAL DIFFUSION v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              True multi-frame cinematic video generation with consistent facial geometry & physical camera vectors
            </p>
          </div>
        </div>

        {/* Generate / Retake Button */}
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? `SYNTHESIZING VEO FRAMES (${generationProgress}%)...` : "RE-SYNTHESIZE VEO SHOTS"}</span>
        </button>
      </div>

      {/* Main Cinema Viewport */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-500/30 shadow-2xl group flex items-center justify-center">
        {/* Active Cinema Shot Frame */}
        <div className={`relative w-full h-full transition-all duration-1000 ease-out ${SHOTS[activeShot].scale} ${SHOTS[activeShot].offset}`}>
          <Image
            src={selectedPersonaAvatar}
            alt={selectedPersonaName}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
          {/* Anamorphic Lens Flare Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Temporal Frame Generation Overlay (When Generating) */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
            <Cpu className="w-10 h-10 text-purple-400 animate-bounce" />
            <div className="text-center space-y-1">
              <h4 className="font-bold text-sm text-slate-100 font-mono">
                GENERATING 700+ TEMPORAL VEO 2 FRAMES...
              </h4>
              <p className="text-xs font-mono text-purple-300">
                Latent Denoising Step: {generationProgress} / 100 • Temporal Attention Matrix Locked
              </p>
            </div>
            <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden border border-purple-500/40">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-150" style={{ width: `${generationProgress}%` }} />
            </div>
          </div>
        )}

        {/* Viewport HUD Overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>{SHOTS[activeShot].title}</span>
          </div>
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px]">
            {SHOTS[activeShot].focal}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            C2PA Manifest Verified
          </div>
        </div>

        {/* Bottom Shot Timeline Selector */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-purple-500/30 text-purple-300 font-mono text-[11px] flex items-center gap-2">
            <span className="text-purple-400">🎥 Camera Vector:</span>
            <span className="font-bold text-white bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/40">
              {SHOTS[activeShot].motion}
            </span>
          </div>

          <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
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
