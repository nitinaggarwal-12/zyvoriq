"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Zap, Search, Eye } from "lucide-react";

interface QualityDimension {
  id: string;
  name: string;
  score: number;
  description: string;
  rule: string;
}

const QUALITY_DIMENSIONS: QualityDimension[] = [
  {
    id: "completeness",
    name: "1. Completeness",
    score: 100,
    description: "All mandatory sections, decisions, assumptions, risks, dependencies, and metrics present.",
    rule: "P0 Gate Floor: 100%",
  },
  {
    id: "correctness",
    name: "2. Correctness",
    score: 99,
    description: "Facts, APIs, calculations, terminology, technical assertions, and constraints valid.",
    rule: "P0 Gate Floor: ≥95%",
  },
  {
    id: "consistency",
    name: "3. Consistency",
    score: 98,
    description: "Zero unresolved contradictions between upstream PRDs and downstream architecture.",
    rule: "P0 Gate Floor: 100%",
  },
  {
    id: "traceability",
    name: "4. Traceability",
    score: 100,
    description: "Every claim traces directly to repository code, PRDs, telemetry, or verified evidence.",
    rule: "P0 Gate Floor: 100%",
  },
  {
    id: "clarity",
    name: "5. Clarity",
    score: 97,
    description: "Intended readers can interpret requirements without guessing or hallucination.",
    rule: "P0 Gate Floor: ≥90%",
  },
  {
    id: "buildability",
    name: "6. Buildability",
    score: 99,
    description: "Engineering can execute implementation without inventing missing product behavior.",
    rule: "P0 Gate Floor: ≥95%",
  },
  {
    id: "testability",
    name: "7. Testability",
    score: 100,
    description: "QA can objectively prove acceptance criteria with automated pass/fail assertions.",
    rule: "P0 Gate Floor: 100%",
  },
  {
    id: "decision_quality",
    name: "8. Decision Quality",
    score: 98,
    description: "Alternatives, rationale, assumptions, tradeoffs, and consequences explicitly documented.",
    rule: "P0 Gate Floor: ≥90%",
  },
];

export function VeritasQualityMatrix() {
  const [viewMode, setViewMode] = useState<"verified" | "raw">("verified");

  return (
    <section id="veritas" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PRD-108 // VERITAS CONTENT QUALITY & AUTO-REPAIR</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Veritas Quality & Truth Governance
          </h2>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            Zyvoriq separates generation from judgment. Independent evaluators audit 8 universal quality dimensions, verify claim-level evidence, and auto-repair hallucinations before publishing.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-right">
            <div className="text-xs font-mono text-emerald-300 uppercase font-semibold">Publish Confidence</div>
            <div className="text-3xl font-black text-white font-mono">99.2%</div>
          </div>
        </div>
      </div>

      {/* 8 Quality Dimensions Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUALITY_DIMENSIONS.map((dim) => (
          <div
            key={dim.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{dim.name}</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300">
                  {dim.score}%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {dim.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{dim.rule}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Before/After Claim Inspection Panel */}
      <div className="mt-10 rounded-3xl border border-slate-800 bg-obsidian-900/90 p-6 md:p-8 backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-emerald-400">
              Live Claim Attribution & Auto-Repair Demonstration
            </span>
            <h3 className="mt-1 text-xl font-bold text-white">
              Raw LLM Output vs. Veritas Governed Artifact
            </h3>
          </div>

          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                viewMode === "raw"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Raw AI Draft (Unverified)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("verified")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                viewMode === "verified"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Veritas Governed (Auto-Repaired)
            </button>
          </div>
        </div>

        {/* Comparison Content Box */}
        <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/90 p-6">
          {viewMode === "raw" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>3 Hallucinations & Unbacked Assertions Detected</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Zyvoriq achieves{" "}
                <span className="rounded bg-rose-950/80 border border-rose-500/50 px-1.5 py-0.5 text-rose-200 font-bold">
                  0.1 millisecond global latency
                </span>{" "}
                across all worldwide edge locations without any database caching. Furthermore,{" "}
                <span className="rounded bg-rose-950/80 border border-rose-500/50 px-1.5 py-0.5 text-rose-200 font-bold">
                  everyone can deploy in 2 seconds with zero configuration
                </span>
                .
              </p>
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4 text-xs font-mono text-rose-300">
                <div className="font-bold">❌ Audit Failures:</div>
                <ul className="mt-1 space-y-1 text-rose-400">
                  <li>• Correctness: 0.1ms global latency contradicts physical speed of light constraints.</li>
                  <li>• Traceability: No citation or benchmark found in ARC-001 or NFR-001.</li>
                  <li>• Ambiguity: "Zero configuration" violates explicit enterprise IAM policy.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>100% Claims Attributed & Auto-Repaired to Specification</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Zyvoriq delivers{" "}
                <span className="rounded bg-emerald-950/80 border border-emerald-500/50 px-1.5 py-0.5 text-emerald-200 font-semibold">
                  P99 edge cache reads under 12ms and multi-region consensus under 65ms{" "}
                  <a href="#docs" className="text-teal-400 underline font-mono text-xs">[ARC-001:§4.2]</a>
                </span>
                . Enterprise deployments enforce{" "}
                <span className="rounded bg-emerald-950/80 border border-emerald-500/50 px-1.5 py-0.5 text-emerald-200 font-semibold">
                  deterministic RBAC permissions and cryptographic provenance{" "}
                  <a href="#docs" className="text-teal-400 underline font-mono text-xs">[TRU-001]</a>
                </span>
                .
              </p>
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-xs font-mono text-emerald-300">
                <div className="font-bold">✓ Veritas Resolution Log:</div>
                <ul className="mt-1 space-y-1 text-emerald-400">
                  <li>• Replaced unbacked latency claim with exact quantified P99 NFR benchmark data.</li>
                  <li>• Injected cryptographic provenance signature and stable requirement IDs.</li>
                  <li>• QGV-001 Assurance Score elevated to 99.8/100 (Pass).</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
