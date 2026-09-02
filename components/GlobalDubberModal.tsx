"use client";

import React, { useState } from "react";
import {
  DubbingLanguage,
  DubbedTrackResult,
  DUBBING_LANGUAGES,
  synthesizeDubbedTrack
} from "../lib/reel/globalDubber";

interface GlobalDubberModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceScript: string;
  speakerName: string;
  onApplyDubbedAudio: (result: DubbedTrackResult) => void;
}

export default function GlobalDubberModal({
  isOpen,
  onClose,
  sourceScript,
  speakerName,
  onApplyDubbedAudio
}: GlobalDubberModalProps) {
  const [selectedLang, setSelectedLang] = useState<string>("es-ES");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dubResult, setDubResult] = useState<DubbedTrackResult | null>(null);

  if (!isOpen) return null;

  const handleDub = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600)); // smooth settling
    const result = synthesizeDubbedTrack(sourceScript, selectedLang, speakerName);
    setDubResult(result);
    setIsGenerating(false);
  };

  const handleApply = () => {
    if (dubResult) {
      onApplyDubbedAudio(dubResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-blue-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-bold">
              🌍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1-Click "MrBeast Global Dubber" & Lip-Sync Matrix
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  🌐 30+ Languages
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Preserve your original speaker pitch, cadence, and emotion with zero-egress DeepMind neural voice synthesis.
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
          {/* Language Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              Select Target Global Market
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {DUBBING_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedLang === lang.code
                      ? "bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/20 text-white"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {lang.estimatedReachMultiplier}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white">{lang.name}</div>
                  <div className="text-[10px] text-zinc-400">{lang.nativeName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            disabled={isGenerating}
            onClick={handleDub}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{isGenerating ? "⚡ Synthesizing DeepMind Neural Dubbing..." : "⚡ Dub into Selected Language & Generate Lip-Sync"}</span>
          </button>

          {/* Dub Result Preview */}
          {dubResult && (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-blue-500/40 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-white">
                    Dubbed Audio Track: {dubResult.languageName} ({dubResult.durationSec}s)
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">
                    ✓ Pitch Preserved ({dubResult.pitchPreservationScore}%) · {dubResult.lipSyncPhonemesCount} Phonemes Aligned
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                  Ready to Sync
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono">
                {dubResult.translatedScript}
              </div>
            </div>
          )}
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
            disabled={!dubResult}
            onClick={handleApply}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
              dubResult
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Apply Dubbed Track to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
