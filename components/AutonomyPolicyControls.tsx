"use client";

import React, { useState } from "react";
import { Sliders, Shield, AlertOctagon, CheckCircle2, Lock, Zap, RefreshCw } from "lucide-react";

interface PolicyTier {
  id: "tier1" | "tier2" | "tier3";
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  humanInLoop: string;
  riskTolerance: string;
  bestFor: string;
}

const TIERS: PolicyTier[] = [
  {
    id: "tier1",
    title: "Tier 1: Manual Supervision",
    badge: "Strict Sign-Off",
    badgeColor: "border-cyan-500/30 bg-cyan-950/40 text-cyan-300",
    summary: "AI generates candidates; every token, diagram node, and claim requires explicit human approval.",
    humanInLoop: "100% Manual Review",
    riskTolerance: "Zero Tolerance",
    bestFor: "High-stakes security advisories, regulated compliance, and initial persona calibration.",
  },
  {
    id: "tier2",
    title: "Tier 2: Approval Gate (Recommended)",
    badge: "Smart Escalation",
    badgeColor: "border-teal-500/30 bg-teal-950/40 text-teal-300",
    summary: "AI drafts, attributes evidence, and auto-repairs. Human sign-off is only triggered on confidence <95% or boundary anomalies.",
    humanInLoop: "Exception-Based (5% Review)",
    riskTolerance: "Quantified P0 Gates",
    bestFor: "Enterprise engineering blogs, product releases, technical thought leadership.",
  },
  {
    id: "tier3",
    title: "Tier 3: Autonomous Autopilot",
    badge: "Continuous Loop",
    badgeColor: "border-indigo-500/30 bg-indigo-950/40 text-indigo-300",
    summary: "Continuous opportunity intelligence, automated Veritas quality scoring, scheduled publishing, and real-time performance learning.",
    humanInLoop: "Autonomous with Kill-Switch",
    riskTolerance: "Self-Healing Auto-Repair",
    bestFor: "Daily developer updates, category news commentary, automated release note distribution.",
  },
];

export function AutonomyPolicyControls() {
  const [selectedTier, setSelectedTier] = useState<"tier1" | "tier2" | "tier3">("tier2");
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const active = TIERS.find((t) => t.id === selectedTier) || TIERS[1];

  return (
    <section id="autonomy" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/20">
            <Sliders className="h-3.5 w-3.5" />
            <span>AUT-001 // AUTONOMY & POLICY CONTROLS</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Granular Autonomy & Safety Bounds
          </h2>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            You maintain total sovereignty over brand, voice, and distribution. Switch between strict human sign-off, smart approval gates, or verified autopilot.
          </p>
        </div>

        {/* Emergency Kill Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setKillSwitchActive(!killSwitchActive)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              killSwitchActive
                ? "border-2 border-rose-500 bg-rose-950 text-rose-200 shadow-lg shadow-rose-500/20 animate-pulse"
                : "border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-rose-500/50 hover:text-rose-300"
            }`}
          >
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>{killSwitchActive ? "Emergency Halt ENGAGED" : "Global Kill-Switch Ready"}</span>
          </button>
        </div>
      </div>

      {/* 3 Tier Selector Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedTier(tier.id)}
              className={`rounded-3xl p-6 text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-2 border-teal-400 bg-slate-900/95 shadow-xl shadow-teal-500/10"
                  : "border border-slate-800/80 bg-obsidian-900/70 hover:border-slate-700 hover:bg-slate-900/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-mono font-bold ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">{tier.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{tier.summary}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/70 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Human Oversight:</span>
                  <span className="text-teal-300 font-semibold">{tier.humanInLoop}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Risk Tolerance:</span>
                  <span className="text-slate-300 font-semibold">{tier.riskTolerance}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Policy Details Inspector */}
      <div className="mt-8 rounded-3xl border border-slate-800 bg-obsidian-900/90 p-6 md:p-8 backdrop-blur-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-teal-400">
              ACTIVE AUTONOMY PROFILE: {active.title}
            </span>
            <h4 className="mt-2 text-xl font-bold text-white">
              Guardrail Boundaries & Escalation Rules (PRD-111)
            </h4>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              In this tier, Zyvoriq continuously benchmarks every generated claim against your authoritative codebase and PRD constraints. If a claim drops below the 95% threshold or touches a sensitive domain boundary, execution pauses and alerts your team via webhook.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Active Security Guardrails (TRU-001 / AUT-001):
            </span>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Identity & Voice Drift Cap</span>
              <span className="text-emerald-400 font-bold">Max 3% Drift Allowed</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Hallucination Auto-Repair Loop</span>
              <span className="text-emerald-400 font-bold">3 Automated Passes</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Cryptographic Provenance Signature</span>
              <span className="text-teal-400 font-bold">SHA-256 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
