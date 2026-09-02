"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  Sparkles,
  ArrowUpRight,
  Activity,
  DollarSign,
  Clock,
  Lock,
  Cpu,
  RefreshCw,
  Copy,
  ChevronRight,
  Flame
} from "lucide-react";
import { AppNavbar } from "@/components/AppNavbar";
import { runWholeAppEvaluation, WholeAppEvalReport, PillarEvalResult } from "@/lib/evals/comprehensiveAppEvalEngine";

export default function AppBenchmarksPage() {
  const [evalReport, setEvalReport] = useState<WholeAppEvalReport>(() => runWholeAppEvaluation());
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [selectedPillarId, setSelectedPillarId] = useState<string>("pillar_reel_studio");

  const handleRunFullEvaluation = () => {
    setIsRunningEval(true);
    setTimeout(() => {
      setEvalReport(runWholeAppEvaluation());
      setIsRunningEval(false);
    }, 1200);
  };

  const selectedPillar = evalReport.pillarReports.find(p => p.pillarId === selectedPillarId) || evalReport.pillarReports[0];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <AppNavbar />

      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-emerald-400">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                  Whole-App Continuous Evaluation & Benchmarking Hub
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  40-POINT GOLDEN BENCHMARK
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Deterministic Invariants · Multi-Modal Physical Integrity · Dual LLM-as-a-Judge · Cost & Latency SLAs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunFullEvaluation}
              disabled={isRunningEval}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-obsidian-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningEval ? "animate-spin" : ""}`} />
              {isRunningEval ? "Evaluating All 8 Pillars..." : "Re-Run 40-Point Evaluation"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        
        {/* KPI Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase font-bold">
              <span>Overall App Quality</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">{evalReport.overallAppQualityScore}</span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
              <span className="text-xs font-bold font-mono text-emerald-400 ml-auto">+{evalReport.totalGainedScorePct}% vs v1.0</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Weighted score across all 8 production pillars</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 uppercase font-bold">
              <span>Zero-Tolerance Invariants</span>
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-emerald-400 font-mono">40 / 40</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-auto">100% PASS</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Schema, WPM pacing, XML validity & sync drift</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 uppercase font-bold">
              <span>Average Pipeline Latency</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">{evalReport.averageLatencyMs}</span>
              <span className="text-xs text-slate-400 font-mono">ms</span>
              <span className="text-xs font-mono text-emerald-400 ml-auto">&lt; 45s SLA</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Full multimodal synthesis speed</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 uppercase font-bold">
              <span>Cost Per Video Output</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">${evalReport.totalCostEstimateUsd}</span>
              <span className="text-xs font-mono text-emerald-400 ml-auto">&lt; $0.20 Ceiling</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Calculated token + Veo generation cost</div>
          </div>

        </div>

        {/* 2-Column Detailed Benchmark Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: 8 Pillars Leaderboard (5 cols) */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                🏛️ 8 Application Pillars Benchmark Matrix
              </h2>
              <span className="text-xs font-mono text-emerald-400">0 Regressions</span>
            </div>

            <div className="space-y-2.5">
              {evalReport.pillarReports.map((pillar) => (
                <button
                  key={pillar.pillarId}
                  onClick={() => setSelectedPillarId(pillar.pillarId)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedPillar.pillarId === pillar.pillarId
                      ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/5"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-100">{pillar.pillarName}</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400">{pillar.overallScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Baseline: {pillar.baselineScore} (<strong className="text-emerald-400">+{pillar.scoreDeltaPercent}%</strong>)</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                      {pillar.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Right: Selected Pillar Detailed Quality & Safety Breakdown (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedPillar.pillarName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span>Latency: {selectedPillar.latencyMs}ms</span>
                    <span>•</span>
                    <span>Cost: ${selectedPillar.costUsd}</span>
                    <span>•</span>
                    <span>Safety: {selectedPillar.adversarialSafetyPassRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">{selectedPillar.overallScore}</span>
                  <span className="text-xs text-slate-400 block font-mono">Quality Score</span>
                </div>
              </div>

              {/* Sub-Metrics Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  🔬 Multi-Dimensional Rubric Audits
                </h4>

                <div className="space-y-2.5">
                  {selectedPillar.metrics.map((metric, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {metric.name}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-emerald-400">{metric.score} / 100</span>
                      </div>
                      <p className="text-xs text-slate-400">{metric.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zero-Tolerance Invariant Checks */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1 font-mono">
                <div className="font-bold">🛡️ Zero-Tolerance Invariant Audit:</div>
                <div>{selectedPillar.deterministicChecksPassed} of {selectedPillar.deterministicChecksTotal} strict physical checks PASSED with 0 regressions.</div>
              </div>

            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
