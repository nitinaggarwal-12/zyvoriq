"use client";

import React, { useState } from "react";
import {
  MemePreset,
  MemeCutawayItem,
  TRENDING_MEME_LIBRARY
} from "../lib/reel/autoMemeEngine";

interface AutoMemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedMemes: MemeCutawayItem[];
  onToggleMeme: (id: string) => void;
  onAddCustomMeme: (meme: MemePreset) => void;
}

export default function AutoMemeModal({
  isOpen,
  onClose,
  detectedMemes,
  onToggleMeme,
  onAddCustomMeme
}: AutoMemeModalProps) {
  const [selectedVibe, setSelectedVibe] = useState<string>("all");

  if (!isOpen) return null;

  const filteredPresets = TRENDING_MEME_LIBRARY.filter((p) => {
    if (selectedVibe === "all") return true;
    return p.vibe === selectedVibe;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-rose-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl font-bold">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Auto-Meme & Reaction Cutaway Injector
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ⚡ Viral Tier 3
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically detect punchlines and inject trending reaction memes & Vine Boom sound effects.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Detected Memes in Script */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Script-Detected Reaction Triggers ({detectedMemes.length})
              </label>
              <span className="text-[11px] text-rose-400 font-mono">
                {detectedMemes.filter((m) => m.enabled).length} Active Cutaways
              </span>
            </div>

            {detectedMemes.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-400">
                No obvious punchlines detected in current script. Select a meme preset below to insert manually.
              </div>
            ) : (
              <div className="space-y-2">
                {detectedMemes.map((meme) => (
                  <div
                    key={meme.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      meme.enabled
                        ? "bg-rose-500/10 border-rose-500/50 text-white"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleMeme(meme.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold ${
                          meme.enabled ? "bg-rose-500 text-white border-rose-400" : "border-zinc-700 bg-zinc-800"
                        }`}
                      >
                        {meme.enabled ? "✓" : ""}
                      </button>
                      <div>
                        <div className="font-bold text-xs text-white">{meme.title}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Trigger: {meme.timestampSec}s · Duration: {meme.durationSec}s · SFX: {meme.sfx}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {meme.layout}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trending Memes Library */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Trending Meme Soundboard & Video Presets
              </label>
              <div className="flex items-center gap-1">
                {["all", "shock", "irony", "celebration", "cringe", "plot_twist"].map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => setSelectedVibe(vibe)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase transition-all ${
                      selectedVibe === vibe
                        ? "bg-rose-500 text-white font-bold"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {vibe.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">
                        {preset.vibe}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {preset.durationSec}s
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1">{preset.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">SFX: {preset.sfx}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">Auto-triggers on punchlines</span>
                    <button
                      onClick={() => onAddCustomMeme(preset)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-[11px] font-bold transition-colors"
                    >
                      + Insert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
