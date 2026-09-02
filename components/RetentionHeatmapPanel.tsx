"use client";

import React, { useMemo } from "react";
import {
  ViralRetentionAnalysis,
  analyzeViralRetention,
  AutoFixRecommendation
} from "../lib/reel/retentionPredictor";

interface RetentionHeatmapPanelProps {
  hookText: string;
  totalDurationSec: number;
  scenesCount: number;
  kineticEmojiTimings: number[];
  brollTimings: number[];
  dopamineSplitEnabled?: boolean;
  onApplyAutoFix?: (recommendation: AutoFixRecommendation) => void;
}

export default function RetentionHeatmapPanel({
  hookText,
  totalDurationSec,
  scenesCount,
  kineticEmojiTimings,
  brollTimings,
  dopamineSplitEnabled = false,
  onApplyAutoFix
}: RetentionHeatmapPanelProps) {
  const analysis: ViralRetentionAnalysis = useMemo(() => {
    return analyzeViralRetention({
      hookText,
      totalDurationSec,
      scenesCount,
      kineticEmojiTimings,
      brollTimings,
      dopamineSplitEnabled
    });
  }, [hookText, totalDurationSec, scenesCount, kineticEmojiTimings, brollTimings, dopamineSplitEnabled]);

  return (
    <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm">
            📉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">AI Viral Retention & Drop-Off Heatmap</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Algorithm Simulator
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Second-by-second simulated audience retention curve & pacing dead-zone detector.
            </p>
          </div>
        </div>

        {/* Big Viral Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Predicted Viral Score</div>
            <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              {analysis.overallViralScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400">0–3s Hook Retention</div>
          <div className="text-base font-bold text-emerald-400">{analysis.hookScore}%</div>
          <div className="text-[10px] text-zinc-500">First-frame swipe defense</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400">Completion Rate</div>
          <div className="text-base font-bold text-indigo-400">{analysis.completionRateEstimate}%</div>
          <div className="text-[10px] text-zinc-500">Full video completion %</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] text-zinc-400">Avg Watch Duration</div>
          <div className="text-base font-bold text-amber-400">{analysis.averageWatchDurationSec}s</div>
          <div className="text-[10px] text-zinc-500">of {Math.round(totalDurationSec || 25)}s total</div>
        </div>
      </div>

      {/* Second-by-Second Visual Retention Bar Graph */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
          <span>0s (Hook)</span>
          <span>Timeline Retention Heatmap</span>
          <span>{analysis.timelineCurve.length - 1}s (End)</span>
        </div>
        <div className="h-14 bg-zinc-900/90 rounded-xl border border-zinc-800 p-1 flex items-end gap-[2px] overflow-hidden">
          {analysis.timelineCurve.map((point) => {
            const heightPercent = Math.max(15, point.retentionPercent);
            let barBg = "bg-emerald-500";
            if (point.pacingState === "warning_slump") barBg = "bg-amber-500";
            if (point.pacingState === "drop_off_risk") barBg = "bg-rose-500";

            return (
              <div
                key={point.second}
                className="flex-1 h-full flex items-end group relative cursor-pointer"
              >
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full ${barBg} rounded-t-[1px] transition-all hover:opacity-80`}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-zinc-900 border border-zinc-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    t={point.second}s · {point.retentionPercent}% ({point.pacingState.replace("_", " ")})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Click Auto-Fix Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <span>⚡ 1-Click AI Auto-Fix Recommendations ({analysis.recommendations.length})</span>
          </div>
          <div className="space-y-2">
            {analysis.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{rec.issueTitle}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      +{rec.expectedRetentionGain}% Gain
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{rec.fixDescription}</p>
                </div>
                {onApplyAutoFix && (
                  <button
                    onClick={() => onApplyAutoFix(rec)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap"
                  >
                    ⚡ Auto-Fix
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
