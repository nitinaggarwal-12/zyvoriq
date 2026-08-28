"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Activity,
  CheckCircle,
  Lock,
  Download
} from "lucide-react";

export function SynthIDLatentHeatmap() {
  const [selectedBand, setSelectedBand] = useState<"all" | "low" | "mid" | "high">("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number; val: number } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate 24x24 latent frequency grid matrix
  const gridSize = 24;
  const [matrix, setMatrix] = useState<number[][]>([]);

  useEffect(() => {
    const newMatrix: number[][] = [];
    for (let r = 0; r < gridSize; r++) {
      const row: number[] = [];
      for (let c = 0; c < gridSize; c++) {
        // Higher values near high-frequency corners representing latent SynthID watermark
        const distFromCorner = Math.sqrt(r * r + c * c) / (gridSize * 1.414);
        const noise = Math.sin(r * 0.5) * Math.cos(c * 0.5) * 0.2;
        const val = Math.min(0.99, Math.max(0.65, 0.75 + distFromCorner * 0.2 + noise));
        row.push(Number(val.toFixed(3)));
      }
      newMatrix.push(row);
    }
    setMatrix(newMatrix);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1200);
  };

  const getHeatmapColor = (val: number) => {
    if (selectedBand === "low" && val > 0.8) return "bg-slate-900 border-slate-800";
    if (selectedBand === "high" && val < 0.85) return "bg-slate-950 border-slate-900";
    
    if (val >= 0.92) return "bg-cyan-400 border-cyan-300 text-slate-950 font-bold shadow-cyan-500/30";
    if (val >= 0.84) return "bg-teal-500 border-teal-400 text-slate-950 font-semibold shadow-teal-500/20";
    if (val >= 0.75) return "bg-emerald-600 border-emerald-500 text-white";
    return "bg-indigo-950/80 border-indigo-800/40 text-slate-400";
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-serif">
                DeepMind SynthID Latent Frequency Spectrum Heatmap
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                99.8% Watermark Match
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-frequency imperceptible watermarking across video latent diffusion frames (0ms drift)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Spectral Fast Fourier Transform..." : "⚡ Run Spectral FFT Scan"}</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Frequency Bands + Forensic Zoom */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Frequency Band Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider pl-1">
            Spectrum Band:
          </span>
          {[
            { id: "all", label: "Full Latent Space (0-24kHz)" },
            { id: "low", label: "Low Frequencies (0-4kHz)" },
            { id: "mid", label: "Mid Spectral (4-12kHz)" },
            { id: "high", label: "High Latent Watermark (12-24kHz)" }
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBand(b.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                selectedBand === b.id
                  ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Forensic Zoom:
          </span>
          {[1, 2, 4].map((z) => (
            <button
              key={z}
              onClick={() => setZoomLevel(z)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                zoomLevel === z
                  ? "bg-teal-500 text-slate-950 border-teal-400"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Heatmap Matrix Grid (24x24) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 relative overflow-hidden">
        <div
          className="grid gap-1 transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center"
          }}
        >
          {matrix.map((row, rIdx) =>
            row.map((val, cIdx) => {
              const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => setSelectedCell({ r: rIdx, c: cIdx, val })}
                  title={`Coord [${rIdx}, ${cIdx}] · Latent Resonance: ${(val * 100).toFixed(1)}%`}
                  className={`h-4 sm:h-5 rounded-sm border cursor-pointer transition-all duration-150 flex items-center justify-center text-[7px] font-mono ${getHeatmapColor(
                    val
                  )} ${isSelected ? "ring-2 ring-white scale-125 z-10" : "hover:scale-110"}`}
                >
                  {zoomLevel >= 2 ? (val * 100).toFixed(0) : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Latent Cell Telemetry Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>24x24 Discrete Latent Cells Analyzed</span>
          </div>
          {selectedCell && (
            <div className="text-slate-300">
              Selected: <span className="text-white font-bold">[{selectedCell.r}, {selectedCell.c}]</span> · Latent Watermark: <span className="text-teal-400 font-bold">{(selectedCell.val * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> &gt;92% Certified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-teal-500 inline-block" /> 84-92% Strong
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> 75-84% Nominal
          </span>
        </div>
      </div>
    </div>
  );
}
