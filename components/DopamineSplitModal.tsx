"use client";

import React, { useState } from "react";
import {
  DOPAMINE_PRESETS,
  DopamineConfig,
  DopaminePresetId,
  DopamineLayoutMode
} from "../lib/reel/dopamineSplitScreen";

interface DopamineSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DopamineConfig;
  onUpdateConfig: (config: DopamineConfig) => void;
}

export default function DopamineSplitModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}: DopamineSplitModalProps) {
  const [localConfig, setLocalConfig] = useState<DopamineConfig>(config);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const categories = ["All", "Gaming & Parkour", "Kinetic ASMR", "Oddly Satisfying"];

  const filteredPresets = DOPAMINE_PRESETS.filter((preset) => {
    if (selectedCategory === "All") return true;
    return preset.category === selectedCategory;
  });

  const handleSave = () => {
    onUpdateConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-pink-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xl font-bold">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Split-Screen Dopamine & ASMR Brainrot Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  🔥 Viral Tier 1
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Composite top AI Avatar / Reel with 60FPS satisfying gameplay & synchronized ASMR ducking.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Master Enable Toggle */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white text-sm flex items-center gap-2">
                <span>Enable Split-Screen Dopamine Mode</span>
                {localConfig.enabled && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active (+38% Retention)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Renders Top 50% as your AI narration and Bottom 50% as synchronized 60FPS hypnotic video.
              </p>
            </div>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                localConfig.enabled
                  ? "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              {localConfig.enabled ? "✓ Enabled" : "Enable Mode"}
            </button>
          </div>

          {/* Layout Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
              Screen Layout Composition
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "50_50_split", label: "50/50 Equal Split", icon: "🥞", desc: "Top Avatar / Bottom ASMR" },
                { id: "60_40_focus", label: "60/40 Primary Focus", icon: "🎯", desc: "Top 60% Focus / Bottom 40%" },
                { id: "pip_bottom_right", label: "Floating Corner PiP", icon: "🖼️", desc: "Corner overlay bubble" },
                { id: "dopamine_side_by_side", label: "16:9 Side-by-Side", icon: "↔️", desc: "Widescreen dual-split" }
              ].map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setLocalConfig({ ...localConfig, layout: layout.id as DopamineLayoutMode })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    localConfig.layout === layout.id
                      ? "bg-pink-500/10 border-pink-500 text-white shadow-md shadow-pink-500/10"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-xl mb-1">{layout.icon}</div>
                  <div className="font-semibold text-xs text-white">{layout.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{layout.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-pink-500 text-white font-semibold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPresets.map((preset) => {
              const isSelected = localConfig.presetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setLocalConfig({ ...localConfig, presetId: preset.id, enabled: true })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-pink-500/15 border-pink-500 shadow-lg shadow-pink-500/20"
                      : "bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-pink-400">{preset.badge}</span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                        {preset.fps} FPS
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-white mb-1">{preset.name}</div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{preset.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{preset.category}</span>
                    <span className="text-pink-400 font-medium">+{preset.retentionBoostPercent}% Retention</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ASMR Audio & Ducking Controls */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                <span>ASMR Audio Volume</span>
                <span className="font-mono text-pink-400">{localConfig.asmrVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localConfig.asmrVolume}
                onChange={(e) => setLocalConfig({ ...localConfig, asmrVolume: parseInt(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Smart Voice Ducking (-20dB)</div>
                <div className="text-[11px] text-zinc-400">Automatically lowers ASMR audio when avatar is speaking</div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.audioDuckingEnabled}
                onChange={(e) => setLocalConfig({ ...localConfig, audioDuckingEnabled: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all"
          >
            Apply Dopamine Split Mode
          </button>
        </div>
      </div>
    </div>
  );
}
