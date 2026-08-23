"use client";

import React, { useState } from "react";
import { GitCommit, ShieldCheck, CheckCircle2, ArrowRight, Layers, FileCode, Check, Cpu } from "lucide-react";

interface LifecycleStage {
  id: string;
  gateId: string;
  name: string;
  category: string;
  owner: string;
  approvers: string;
  exitCondition: string;
  artifacts: string[];
  scoreThreshold: string;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: "vision",
    gateId: "QG-STR-01",
    name: "Vision & Strategy",
    category: "Foundation",
    owner: "Founder / CPO",
    approvers: "Founder/CPO + CTO",
    exitCondition: "All P0 strategy checks pass; North Star defined; strategic boundaries locked.",
    artifacts: ["STR-001 Product Vision", "STR-002 Strategy", "MKT-001 Market / TAM"],
    scoreThreshold: "≥95 / 100",
  },
  {
    id: "brd_prd",
    gateId: "QG-PRD-01",
    name: "BRD & Master PRD",
    category: "Product Definition",
    owner: "Product Lead",
    approvers: "PM + Design + Eng Lead",
    exitCondition: "100% P0 requirements testable and traceable; zero ambiguous behavior.",
    artifacts: ["BUS-001 BRD", "SCP-001 Scope Map", "PRD-000 Master PRD", "PRD-101 to 112"],
    scoreThreshold: "≥95 / 100",
  },
  {
    id: "arch_nfr",
    gateId: "QG-HLD-01",
    name: "Architecture & NFR",
    category: "Engineering Architecture",
    owner: "Principal Architect",
    approvers: "Principal Architect + Eng + Security + SRE",
    exitCondition: "100% P0 NFR coverage; data models & trust boundaries verified.",
    artifacts: ["NFR-001 Specs", "ARC-001 HLD", "ARC-003 Domain Model", "SEC-001 Threat Model"],
    scoreThreshold: "≥95 / 100",
  },
  {
    id: "ai_evals",
    gateId: "QG-AI-01",
    name: "AI, Agents & Veritas QA",
    category: "Intelligence & Quality",
    owner: "AI & Eval Lead",
    approvers: "AI Lead + Eval Lead + Trust/Safety",
    exitCondition: "P0 eval benchmark pass floor; zero critical safety or hallucination regression.",
    artifacts: ["AI-001 Agent Arch", "AI-003 Content QA", "AI-004 Golden Benchmarks", "TRU-001 Privacy"],
    scoreThreshold: "≥95 / 100",
  },
  {
    id: "build_qa",
    gateId: "QG-QA-01",
    name: "Build & System QA",
    category: "Execution & Delivery",
    owner: "Engineering & QA Lead",
    approvers: "QA Lead + Eng Lead + Security + SRE",
    exitCondition: "100% P0 E2E test suites pass; zero Sev-1/Sev-2 blockers.",
    artifacts: ["TDD-101-112", "ENG-002 LLD", "API-001 Specs", "QAT-001 Test Strategy"],
    scoreThreshold: "100% Pass",
  },
  {
    id: "release_learn",
    gateId: "QG-GA-01",
    name: "Release, Autopilot & Learn",
    category: "Operations & Evolution",
    owner: "Exec Product & CTO",
    approvers: "Exec Product + CTO + Release Council",
    exitCondition: "All P0 gates green; telemetry active; self-optimizing learning loop engaged.",
    artifacts: ["OBS-001 Observability", "REL-001 CI/CD", "MET-001 North Star", "PRD-110 Learning Loop"],
    scoreThreshold: "GA Approved",
  },
];

export function LifecycleFlow() {
  const [selectedStage, setSelectedStage] = useState<LifecycleStage>(LIFECYCLE_STAGES[1]);

  return (
    <section id="lifecycle" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/20">
            <Cpu className="h-3.5 w-3.5" />
            <span>QGV-001 // QUALITY GOVERNANCE STANDARD</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            The Canonical Product Lifecycle
          </h2>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            Zyvoriq governs the complete loop: Vision → BRD → PRD → Architecture → AI Evals → Build → Release → Learn. No artifact advances on authorship alone.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="font-mono text-xs text-slate-400">Quality Council</div>
          <div className="text-sm font-bold text-teal-300">7 Named Approver Quorum</div>
        </div>
      </div>

      {/* Interactive Lifecycle Steps Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const isSelected = selectedStage.id === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`flex flex-col justify-between rounded-2xl p-5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-2 border-teal-400 bg-slate-900/90 shadow-xl shadow-teal-500/15"
                  : "border border-slate-800/80 bg-obsidian-900/70 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isSelected ? "text-teal-300 font-bold" : "text-slate-500"}>
                    0{idx + 1}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    {stage.gateId}
                  </span>
                </div>
                <div className="mt-3 text-sm font-bold text-white leading-snug">
                  {stage.name}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {stage.category}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Gate Status</span>
                <span className="text-emerald-400 font-bold">✓ Enforced</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detail Panel */}
      <div className="mt-8 rounded-3xl border border-slate-800 bg-obsidian-900/90 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-teal-500/20 px-3 py-1 font-mono text-xs font-bold text-teal-300 border border-teal-500/30">
                GATE: {selectedStage.gateId}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Assurance Threshold: <strong className="text-emerald-400">{selectedStage.scoreThreshold}</strong>
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-extrabold text-white">
              {selectedStage.name} Specification
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300">
              <span className="text-slate-500">Owner:</span> {selectedStage.owner}
            </span>
            <span className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300">
              <span className="text-slate-500">Approvers:</span> {selectedStage.approvers}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exit Condition */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5">
              <span className="text-xs font-mono font-bold uppercase text-teal-400">
                Minimum Gate Exit Condition (Non-Negotiable P0)
              </span>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                {selectedStage.exitCondition}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                QGV-001 Governance Principle
              </span>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                No P0 artifact advances on authorship alone. Advancement requires explicit empirical evidence, named approver consensus, zero unresolved Sev-1/Sev-2 blockers, and recorded gate sign-off.
              </p>
            </div>
          </div>

          {/* Controlled Artifacts */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5">
            <span className="text-xs font-mono font-bold uppercase text-indigo-400">
              Controlled Blueprint Artifacts
            </span>
            <ul className="mt-3 space-y-2 text-xs font-mono text-slate-300">
              {selectedStage.artifacts.map((art) => (
                <li key={art} className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-3 py-2 border border-slate-800">
                  <FileCode className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{art}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
