"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Maximize2, ShieldCheck, Zap } from "lucide-react";

interface NeuralDiffusionPlayerProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const NeuralDiffusionPlayer: React.FC<NeuralDiffusionPlayerProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  selectedPersonaAvatar,
  audioUrl,
  onTimeUpdate,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [upscaleMode, setUpscaleMode] = useState<"1080p" | "4K_HDR">("4K_HDR");
  const [framing, setFraming] = useState<"wide" | "keynote" | "tight">("keynote");
  const [acousticEnergy, setAcousticEnergy] = useState<number>(0);

  // Audio Sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // Audio Wave Energy Simulation
  useEffect(() => {
    let animId: number;
    const updateEnergy = (timestamp: number) => {
      animId = requestAnimationFrame(updateEnergy);
      const t = timestamp * 0.001;
      if (isPlaying) {
        setAcousticEnergy(Math.sin(t * 8.5) * 0.35 + Math.cos(t * 14.0) * 0.25 + 0.4);
      } else {
        setAcousticEnergy(0.04);
      }
    };
    animId = requestAnimationFrame(updateEnergy);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (onTimeUpdate) onTimeUpdate(audio.currentTime);
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/40 shadow-2xl group flex items-center justify-center">
      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
        className="hidden"
      />

      {/* Main Image with Neural Dynamic Framing & Subtle Breathing */}
      <div className={`relative w-full h-full transition-transform duration-700 ease-out ${
        framing === "tight" ? "scale-125 translate-y-[-5%]" : framing === "keynote" ? "scale-105" : "scale-100"
      }`}>
        <Image
          src={selectedPersonaAvatar}
          alt={selectedPersonaName}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className={`object-cover transition-all duration-300 ${
            isPlaying ? "brightness-105 contrast-105" : "brightness-95 contrast-100"
          }`}
        />

        {/* Neural Holographic Lighting & Specular Bloom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />
        
        {/* Dynamic Speech Lighting Flare */}
        {isPlaying && (
          <div
            className="absolute inset-0 bg-purple-500/10 mix-blend-screen pointer-events-none transition-opacity duration-150"
            style={{ opacity: 0.3 + acousticEnergy * 0.5 }}
          />
        )}
      </div>

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-purple-500/50 text-purple-300 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>NEURAL DIFFUSION • </span>
          <span className="font-bold">{upscaleMode}</span>
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Acoustic Energy: {Math.round(acousticEnergy * 100)}%</span>
        </div>
      </div>

      {/* Provenance Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          zk-SNARK Provenance Sealed
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2">
        {/* Upscale Selector */}
        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-purple-500/30 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-purple-300 px-2 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            ENGINE:
          </span>
          {(["1080p", "4K_HDR"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setUpscaleMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                upscaleMode === mode
                  ? "bg-purple-500/30 border border-purple-400 text-purple-200 shadow-sm shadow-purple-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Framing Selector */}
        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            FRAMING:
          </span>
          {[
            { id: "tight", label: "🎥 70mm Tight" },
            { id: "keynote", label: "🎤 35mm Keynote" },
            { id: "wide", label: "📐 24mm Wide" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFraming(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                framing === f.id
                  ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
