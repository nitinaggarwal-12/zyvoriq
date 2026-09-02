"use client";

import React, { useState } from "react";
import {
  ReelRemixRecipe,
  FEATURED_REMIX_TEMPLATES,
  encodeRemixRecipe,
  generateRemixShareUrl
} from "../lib/reel/remixEngine";

interface RemixShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecipe: ReelRemixRecipe;
  onApplyTemplate: (recipe: ReelRemixRecipe) => void;
}

export default function RemixShareModal({
  isOpen,
  onClose,
  currentRecipe,
  onApplyTemplate
}: RemixShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateRemixShareUrl(currentRecipe);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-purple-950/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold">
              🔁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  "Remix This Reel" Viral Growth Flywheel
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  📈 Viral Tier 2
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Share a 1-click cloneable recipe of your video's hooks, persona, B-roll, and dopamine sync.
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
          {/* Share Link Generator Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Your 1-Click Viral Remix Link
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                ⚡ Instant Template Clone
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-300 font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{copied ? "✓ Copied!" : "📋 Copy Link"}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              When viewers click this link on TikTok, X, or YouTube, Zyvoriq opens with your exact editing structure pre-loaded.
            </p>
          </div>

          {/* Featured Viral Templates to Clone */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Explore High-Converting Viral Templates
              </label>
              <span className="text-[11px] text-zinc-500">Over 45,000+ total remixes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FEATURED_REMIX_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.title}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-400 font-mono">
                        🔥 {tmpl.remixCount?.toLocaleString()} Remixes
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {tmpl.durationSec}s
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mb-1.5">{tmpl.title}</div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">"{tmpl.topic}"</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {tmpl.dopamineConfig.enabled ? "🎮 Split ASMR" : "🎬 Pure Reel"}
                    </span>
                    <button
                      onClick={() => {
                        onApplyTemplate(tmpl);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-200 hover:text-white text-xs font-bold transition-colors"
                    >
                      ⚡ Remix
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
