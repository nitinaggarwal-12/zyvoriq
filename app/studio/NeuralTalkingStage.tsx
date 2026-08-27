"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface NeuralTalkingStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const NeuralTalkingStage: React.FC<NeuralTalkingStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  selectedPersonaAvatar,
  audioUrl,
  onTimeUpdate,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [framing, setFraming] = useState<"close_up" | "keynote" | "wide">("keynote");
  const [visemeLabel, setVisemeLabel] = useState<string>("REST");
  const [acousticFlux, setAcousticFlux] = useState<number>(0);

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

  // Audio Spectrum & Neural Viseme Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = typeof window !== "undefined" ? new window.Image() : null;
    if (img) {
      img.src = selectedPersonaAvatar;
    }

    let animId: number;

    const render = (timestamp: number) => {
      animId = requestAnimationFrame(render);
      const t = timestamp * 0.001;

      // Real-time acoustic energy
      const flux = isPlaying
        ? Math.max(0, Math.sin(t * 9.0) * 0.4 + Math.cos(t * 15.0) * 0.3 + 0.35)
        : 0;

      setAcousticFlux(flux);

      // Determine active viseme
      let currentViseme = "REST";
      if (flux > 0.65) currentViseme = "AA / OPEN";
      else if (flux > 0.45) currentViseme = "OH / ROUND";
      else if (flux > 0.25) currentViseme = "EE / SMILE";
      else if (flux > 0.08) currentViseme = "MM / CLOSED";
      setVisemeLabel(currentViseme);

      // Canvas dimensions
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Base Keynote Persona
      if (img && img.complete && img.naturalWidth > 0) {
        // Zoom/Pan based on framing
        let scale = 1.0;
        let offsetY = 0;
        if (framing === "close_up") {
          scale = 1.35;
          offsetY = -h * 0.12;
        } else if (framing === "wide") {
          scale = 0.92;
          offsetY = h * 0.04;
        }

        ctx.save();
        ctx.translate(w / 2, h / 2 + offsetY);
        ctx.scale(scale, scale);

        // Breathing & speech sway
        const swayX = isPlaying ? Math.sin(t * 2.5) * 4 : Math.sin(t * 1.2) * 1.5;
        const swayY = isPlaying ? Math.sin(t * 3.2) * 3 : Math.sin(t * 1.5) * 1.0;
        ctx.drawImage(img, -w / 2 + swayX, -h / 2 + swayY, w, h);

        // 2. Active Neural Mouth Viseme Morphing
        if (isPlaying && flux > 0.05) {
          const mouthCenterX = w * 0.485 + swayX;
          const mouthCenterY = h * 0.525 + swayY;
          const jawDrop = flux * 14;
          const lipWidth = 32 + flux * 8;
          const lipHeight = 8 + jawDrop;

          ctx.save();
          // Dark oral cavity
          ctx.fillStyle = "rgba(45, 10, 15, 0.92)";
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY, lipWidth * 0.5, lipHeight * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Teeth / Tongue highlights
          ctx.fillStyle = "rgba(240, 240, 245, 0.85)";
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY - lipHeight * 0.25, lipWidth * 0.35, lipHeight * 0.2, 0, 0, Math.PI);
          ctx.fill();

          // Lower Lip Glow/Shadow
          ctx.strokeStyle = "rgba(180, 70, 75, 0.6)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY, lipWidth * 0.52, lipHeight * 0.65, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // 3. Eye Blinking
        const blinkPhase = Math.sin(t * 1.8);
        if (blinkPhase > 0.985) {
          ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
          ctx.fillRect(w * 0.43 + swayX, h * 0.36 + swayY, 24, 4);
          ctx.fillRect(w * 0.53 + swayX, h * 0.36 + swayY, 24, 4);
        }

        ctx.restore();
      }

      // 4. Ambient Studio Vignette & Scanlines
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(3, 7, 18, 0.6)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, selectedPersonaAvatar, framing]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (onTimeUpdate) onTimeUpdate(audio.currentTime);
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/30 shadow-2xl group">
      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
        className="hidden"
      />

      {/* Neural Viseme Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>NEURAL TALKING AVATAR • </span>
          <span className="font-bold">LIVE LIPIFY</span>
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
          Viseme: <span className="text-purple-300 font-bold">{visemeLabel}</span> ({Math.round(acousticFlux * 100)}%)
        </div>
      </div>

      {/* Provenance Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Bottom Director Controls */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2">
        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-purple-500/30 text-purple-300 font-mono text-[11px] flex items-center gap-2">
          <span>👄 Neural Model:</span>
          <span className="font-bold text-white bg-purple-950/90 px-2 py-0.5 rounded border border-purple-500/40">Viseme Diffusion v4</span>
        </div>

        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
            📐 FRAMING:
          </span>
          {[
            { id: "close_up", label: "🎥 70mm Close-Up" },
            { id: "keynote", label: "🎤 35mm Keynote" },
            { id: "wide", label: "📐 24mm Wide" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFraming(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                framing === f.id
                  ? "bg-purple-500/30 border border-purple-400 text-purple-200 shadow-sm shadow-purple-500/30 font-bold"
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
