"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  TrendingUp, 
  Cpu, 
  Database, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Target, 
  BarChart2, 
  Zap, 
  Clock, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { 
  PLATFORM_ARBITRAGE_SIGNALS, 
  TIME_SERIES_7D_FORECAST, 
  HOOK_RETENTION_PREDICTIONS 
} from "@/lib/analytics/predictiveAnalyticsEngine";

export default function PredictiveForecastingPage() {
  const [selectedSignal, setSelectedSignal] = useState(PLATFORM_ARBITRAGE_SIGNALS[0]);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                PostgreSQL Global Market Forecasting &amp; Arbitrage Engine
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Real-time time-series modeling powered by <strong className="text-teal-300">PostgreSQL + pgvector (768-dim) + TimescaleDB</strong>. Predicts 7-day viral breakout trajectories and multi-platform content arbitrage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-teal-500/10 border border-teal-500/30 px-3.5 py-1 text-xs font-mono text-teal-300 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              <span>pgvector HNSW Index Active</span>
            </span>
            <Link
              href="/studio/trend-radar"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:opacity-95"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>Explore Trend Radar</span>
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>7-Day Forecasted View Surge</span>
              <TrendingUp className="h-5 w-5 text-teal-400" />
            </div>
            <div className="mt-4 font-mono text-3xl font-black text-white">3.45M</div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center justify-between">
              <span>Acceleration Velocity</span>
              <span>+104.1% YoY Day 2</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Cross-Platform Arbitrage Alpha</span>
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-4 font-mono text-3xl font-black text-white">98.4 VOI</div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-teal-300 font-bold flex items-center justify-between">
              <span>Supply / Demand Imbalance</span>
              <span>Zero Competition</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>ARIMA_PLUS Model Confidence</span>
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4 font-mono text-3xl font-black text-white">99.2%</div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-indigo-300 font-bold flex items-center justify-between">
              <span>Error Margin</span>
              <span>±1.4% Variance</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>pgvector Query Latency</span>
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div className="mt-4 font-mono text-3xl font-black text-white">3.8 ms</div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-bold flex items-center justify-between">
              <span>Indexed Embeddings</span>
              <span>12.8M Signals</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 7-Day Time Series Forecast Graph & Retention Predictor (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 7-Day Volume Trajectory */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <BarChart2 className="h-4 w-4" />
                  <span>7-Day Predictive Growth Trajectory (Volume &amp; Confidence Bounds)</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Topic: {selectedSignal.topic}</span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-8 gap-2 items-end h-56 pt-6 pb-2">
                {TIME_SERIES_7D_FORECAST.map((point) => {
                  const maxVol = 3950000;
                  const heightPct = Math.round((point.predictedVolume / maxVol) * 100);
                  const isPeak = point.dayOffset === 7;
                  return (
                    <div key={point.dayOffset} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {(point.predictedVolume / 1000000).toFixed(2)}M
                      </div>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 group-hover:scale-105 ${
                          isPeak
                            ? "bg-gradient-to-t from-teal-500 to-emerald-400 shadow-lg shadow-teal-500/30"
                            : "bg-slate-800 hover:bg-teal-500/70"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="text-[10px] font-mono text-slate-400 text-center leading-tight">
                        {point.dateLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Lower Bound: <strong>2.95M</strong></span>
                <span className="text-teal-400 font-bold">Predicted Target: 3.45M (+2,775% Growth)</span>
                <span>Upper Bound: <strong>3.95M</strong></span>
              </div>
            </div>

            {/* Hook Retention Predictor */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Hook Retention Scoring &amp; Drop-off Predictor</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">TimescaleDB Telemetry</span>
              </div>

              <div className="space-y-3">
                {HOOK_RETENTION_PREDICTIONS.map((model, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{model.hookType}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        model.churnRiskFactor === "LOW" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        Churn Risk: {model.churnRiskFactor}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                      <div className="p-2 rounded-lg bg-slate-900">
                        <div className="text-[10px] text-slate-400">Sec 1</div>
                        <div className="font-mono font-bold text-teal-300">{model.second1Retention}%</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900">
                        <div className="text-[10px] text-slate-400">Sec 3 (Hook)</div>
                        <div className="font-mono font-bold text-emerald-400">{model.second3Retention}%</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900">
                        <div className="text-[10px] text-slate-400">Sec 15 (Mid)</div>
                        <div className="font-mono font-bold text-indigo-300">{model.second15Retention}%</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900">
                        <div className="text-[10px] text-slate-400">Completion</div>
                        <div className="font-mono font-bold text-amber-300">{model.completionRateEstimated}%</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-1">
                      💡 <strong>Pattern Interrupt:</strong> {model.suggestedPatternInterrupt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Platform Arbitrage Signals (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <Target className="h-4 w-4" />
                  <span>Cross-Platform Arbitrage Opportunities</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">3 High-Yield Leads</span>
              </div>

              <div className="space-y-3">
                {PLATFORM_ARBITRAGE_SIGNALS.map((sig) => {
                  const isSelected = selectedSignal.id === sig.id;
                  return (
                    <div
                      key={sig.id}
                      onClick={() => setSelectedSignal(sig)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-teal-500 bg-slate-900/90 ring-2 ring-teal-500/30"
                          : "border-slate-800 bg-slate-950 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                          {sig.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          VOI: {sig.voiScore}/100
                        </span>
                      </div>

                      <div className="mt-2 text-xs font-bold text-white">{sig.topic}</div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px]">Source Demand:</span>
                          <div className="font-bold text-white">{sig.sourceLeadingPlatform} 🔥</div>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 text-[10px]">Underserved Target:</span>
                          <div className="font-bold text-teal-300">{sig.targetUnderservedPlatform} 🚀</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Yield: <strong className="text-emerald-400">{sig.monetizationYieldEstimated}</strong></span>
                        <Link
                          href="/studio"
                          className="font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                        >
                          <span>Execute in Studio</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
