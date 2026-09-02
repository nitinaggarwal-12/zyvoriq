"use client";

import React, { useMemo } from "react";
import {
  DemonetizationScanResult,
  scanDemonetizationArmor,
  FlaggedCensorItem
} from "../lib/reel/demonetizationArmor";

interface DemonetizationArmorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  onApplyCensoredScript: (censoredText: string) => void;
}

export default function DemonetizationArmorModal({
  isOpen,
  onClose,
  scriptText,
  onApplyCensoredScript
}: DemonetizationArmorModalProps) {
  const scanResult: DemonetizationScanResult = useMemo(() => {
    return scanDemonetizationArmor(scriptText);
  }, [scriptText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-emerald-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  "Demonetization Armor" & Auto-Censor Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ad Revenue Protection
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Scan scripts for algorithmic shadowban triggers in the first 7s and apply comedic TV bleeps.
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
          {/* Safety Score Header */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Algorithmic Monetization Safety Score</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    scanResult.overallSafetyScore >= 90
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {scanResult.overallSafetyScore}/100 Safe
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {scanResult.flaggedItems.length === 0
                  ? "✓ Zero trigger words detected. Your script is 100% safe for YouTube Shorts & TikTok monetization."
                  : `⚠️ ${scanResult.flaggedItems.length} potential trigger word(s) detected.`}
              </p>
            </div>
          </div>

          {/* Flagged Items */}
          {scanResult.flaggedItems.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Flagged Sensitive Trigger Words
              </label>
              {scanResult.flaggedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                      "{item.word}"
                    </span>
                    <span className="text-zinc-400">
                      at t={item.timestampSec}s {item.isFirst7Seconds && "· 🚨 Critical 0-7s Window"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-medium">Safe alternative: "{item.replacementText}"</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      1000Hz TV Bleep
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Censored Preview */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Armored Script Preview
            </label>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
              {scanResult.censoredMasterScript}
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
            onClick={() => {
              onApplyCensoredScript(scanResult.censoredMasterScript);
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            Apply Armored Script to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
