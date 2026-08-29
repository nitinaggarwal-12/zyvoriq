"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Layers, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28">
      {/* Background radial ambient lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-indigo-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/4 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 text-center">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-teal-300 shadow-xl backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span>AI-Native Lifecycle &amp; Content Intelligence</span>
          <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-mono text-teal-200">
            PRD-101 → PRD-112
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto mt-8 max-w-6xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.08]">
          Turn Complex Ideas &amp; Code into{" "}
          <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            Multi-Modal Impact
          </span>{" "}
          With Proof.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl md:text-2xl font-normal leading-relaxed">
          Zyvoriq grounds your identity, deconstructs repositories and PRDs into master architectures, validates facts with Veritas auto-repair, and publishes native multi-channel media.
        </p>

        {/* Hero Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/studio"
            className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-8 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-teal-500/35 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span>Launch Cinema Studio</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/director"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-7 py-4 text-sm font-bold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:border-slate-500 hover:bg-slate-800/80"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Mission Control DAG</span>
          </Link>
        </div>

        {/* Metric Ticker & Quality Badges */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase font-semibold">Quality Gates</span>
              <ShieldCheck className="h-4 w-4 text-teal-400" />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-black text-white font-mono">19 P0 Gates</div>
            <div className="mt-1 text-xs text-slate-400">QGV-001 Governed Thresholds</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase font-semibold">Synthesis Modalities</span>
              <Layers className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-black text-white font-mono">8 Channels</div>
            <div className="mt-1 text-xs text-slate-400">1 Master Story → Native Formats</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase font-semibold">Claim Precision</span>
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-black text-white font-mono">99.8%</div>
            <div className="mt-1 text-xs text-slate-400">Veritas Evidence &amp; Auto-Repair</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-left">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase font-semibold">Policy Control</span>
              <Cpu className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl md:text-3xl font-black text-white font-mono">3 Tiers</div>
            <div className="mt-1 text-xs text-slate-400">Manual • Approval • Autopilot</div>
          </div>
        </div>
      </div>
    </section>
  );
}
