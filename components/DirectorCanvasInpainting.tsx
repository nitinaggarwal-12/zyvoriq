"use client";

import React, { useState } from "react";
import {
  Paintbrush,
  Sparkles,
  RotateCcw,
  Check,
  Play,
  Pause,
  Sliders,
  Layers,
  Film,
  CheckCircle,
  Eye,
  Zap,
  Maximize2
} from "lucide-react";

export interface MultiTakeCandidate {
  id: string;
  name: string;
  badge: string;
  desc: string;
  videoSrc: string;
  veritasScore: number;
  duration: string;
  isCommitted: boolean;
}

export function DirectorCanvasInpainting() {
  const [activeTakeId, setActiveTakeId] = useState<string>("take-b");
  const [isInpainting, setIsInpainting] = useState<boolean>(false);
  const [inpaintSuccess, setInpaintSuccess] = useState<boolean>(false);
  const [maskActive, setMaskActive] = useState<boolean>(true);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(0.65);
  const [inpaintPrompt, setInpaintPrompt] = useState<string>(
    "Replace wooden bokken with glowing cyan energy katana with electric lightning particle arcs"
  );

  const [takes, setTakes] = useState<MultiTakeCandidate[]>([
    {
      id: "take-a",
      name: "Take 1: Traditional Bokken (Original)",
      badge: "Master Take",
      desc: "Original grounded delivery with wooden bokken under torrential rain and authentic water splash physics.",
      videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
      veritasScore: 99.8,
      duration: "8.0s",
      isCommitted: false,
    },
    {
      id: "take-b",
      name: "Take 2: Cyan Energy Katana (Inpainted)",
      badge: "Inpainted",
      desc: "Zyvoriq latent inpainting: Replaced wooden weapon with glowing cyan plasma katana emitting ionization arcs.",
      videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
      veritasScore: 99.4,
      duration: "8.0s",
      isCommitted: true,
    },
    {
      id: "take-c",
      name: "Take 3: Crimson Flame Blade",
      badge: "High Drama",
      desc: "Intense embers and red thermal heat distortion trailing bokken strikes with volumetric smoke.",
      videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
      veritasScore: 98.9,
      duration: "8.0s",
      isCommitted: false,
    },
    {
      id: "take-d",
      name: "Take 4: Damascus Steel Edge",
      badge: "Cinematic",
      desc: "Ultra-sharp folded steel blade with realistic anamorphic lens flare glinting on lightning strikes.",
      videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
      veritasScore: 99.5,
      duration: "8.0s",
      isCommitted: false,
    },
  ]);

  const handleRunInpaint = () => {
    setIsInpainting(true);
    setTimeout(() => {
      setIsInpainting(false);
      setInpaintSuccess(true);
      setActiveTakeId("take-b");
      setTimeout(() => setInpaintSuccess(false), 3500);
    }, 1200);
  };

  const handleCommitTake = (id: string) => {
    setTakes((prev) =>
      prev.map((t) => ({
        ...t,
        isCommitted: t.id === id,
      }))
    );
    setActiveTakeId(id);
  };

  const activeTake = takes.find((t) => t.id === activeTakeId) || takes[0];

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Paintbrush className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif">
                Director Canvas Inpainting & Multi-Take Editor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                Neural Cinema Inpaint
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive frame-accurate prop repainting with zero boundary bleeding & 4-take live carousel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>0ms Audio Sync Lock</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Inpaint Viewport (7 Cols) + Control Panel (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Inpainting Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group select-none">
            {/* Main Video Stream */}
            <video
              src={activeTake.videoSrc}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Interactive Inpainting Bounding Box Mask */}
            {maskActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-[32%] right-[28%] w-36 h-48 border-2 border-dashed border-cyan-400 bg-cyan-500/20 rounded-xl backdrop-blur-[2px] animate-pulse flex flex-col justify-between p-2 shadow-lg shadow-cyan-500/20 pointer-events-auto cursor-crosshair">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 font-mono text-[9px] font-bold">
                      Repaint Mask #1
                    </span>
                    <span className="text-[9px] font-mono text-cyan-200">Katana Mesh</span>
                  </div>
                  <div className="text-center font-mono text-[10px] text-cyan-100 font-bold bg-black/60 rounded py-0.5">
                    Target: Wooden Bokken
                  </div>
                </div>
              </div>
            )}

            {/* Viewport Top Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-slate-700 text-slate-200 font-mono text-xs font-semibold">
                {activeTake.name}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
                VQS: {activeTake.veritasScore}%
              </span>
            </div>

            {/* Inpainting Diffusion Status Overlay */}
            {isInpainting && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-fadeIn">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-sm font-mono font-bold text-cyan-300">
                  Synthesizing Latent Inpainting Mask...
                </div>
                <p className="text-xs text-slate-400 max-w-sm font-mono">
                  Injecting cyan energy emission shaders and dynamic electric particle arcs at 4K UHD.
                </p>
              </div>
            )}
          </div>

          {/* Mask Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaskActive(!maskActive)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  maskActive
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>{maskActive ? "Mask Active" : "Show Mask"}</span>
              </button>

              <button
                onClick={() => setMaskActive(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Mask</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono">Brush: {brushSize}px</span>
              <input
                type="range"
                min="8"
                max="64"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Inpainting Parameters & Prompt Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Inpainting Target Prompt
              </label>
              <span className="text-[10px] font-mono text-slate-500">Neural Grounded</span>
            </div>

            <textarea
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none shadow-inner"
              placeholder="Describe the replacement object, lighting, shader, and motion characteristics..."
            />

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                1-Click Preset Props
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "⚡ Cyan Laser Katana", prompt: "Replace wooden bokken with glowing cyan energy katana with electric lightning particle arcs" },
                  { label: "🔥 Crimson Flame Blade", prompt: "Replace wooden bokken with blazing crimson plasma blade with trailing embers and smoke" },
                  { label: "💎 Crystalline Glass Bokken", prompt: "Replace wooden bokken with transparent refractive diamond crystal sword refracting rain light" },
                  { label: "🌸 Sakura Aura Blade", prompt: "Surround weapon with floating holographic pink cherry blossom petal trails and soft glow" },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInpaintPrompt(chip.prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 text-[11px] font-mono transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Denoising Strength Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Denoising Strength (Latent Rigidity)</span>
                <span className="text-cyan-400 font-bold">{denoiseStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={denoiseStrength}
                onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Repaint Action Button */}
            <button
              onClick={handleRunInpaint}
              disabled={isInpainting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInpainting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Inpaint...</span>
                </>
              ) : inpaintSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Inpainted Take Committed!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>⚡ Regenerate Inpainted Region (0.8s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Take Candidate Carousel (US-3.2) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white font-serif">
              Multi-Take Candidate Carousel (4 Parallel Takes)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any take to preview · 1-click timeline commitment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {takes.map((take) => {
            const isSelected = activeTakeId === take.id;
            return (
              <div
                key={take.id}
                onClick={() => setActiveTakeId(take.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                  take.isCommitted
                    ? "bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                    : isSelected
                    ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500 shadow-md shadow-indigo-500/10"
                    : "bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 relative mb-3 group">
                    <video
                      src={take.videoSrc}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-slate-300">
                      {take.duration}
                    </div>
                    {take.isCommitted && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[9px] font-bold uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" /> Committed
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white font-mono truncate">
                      {take.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {take.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">
                    VQS: {take.veritasScore}%
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCommitTake(take.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                      take.isCommitted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300"
                    }`}
                  >
                    {take.isCommitted ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Active Master</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Commit Take</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
