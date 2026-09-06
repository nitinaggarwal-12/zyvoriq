"use client";

import React from "react";
import { Sparkles, Cpu, Eye, Music, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const PILLARS = [
  {
    number: "01",
    badge: "95% UPFRONT FLAW ELIMINATION",
    title: "Pre-Flight Prompt Compiler",
    subtitle: "Eliminating diffusion physics traps before spending compute.",
    description: "Instead of naive text prompts that produce melted eyelids, rubber limbs, and frozen plates, Omni acts as the Master Showrunner. It compiles diffusion-safe cinematography directives with velocity anchors, character facial DNA tokens, and natural motion physics.",
    features: [
      "Zero Macro-Fluid Traps (Dry dignified grief)",
      "Strict Character Facial DNA Anchoring",
      "Dynamic 24fps Continuous Motion Vectors",
      "Automatic Celebrity Name Filter Bypass"
    ],
    accent: "from-teal-500/20 to-emerald-500/5",
    border: "border-teal-500/30",
    textAccent: "text-teal-300"
  },
  {
    number: "02",
    badge: "5% END-STAGE REAL-TIME QC",
    title: "Autonomous Vision Gatekeeper",
    subtitle: "Gemini 2.5 Flash inspecting live frames directly on Cloudtop.",
    description: "Even with optimal prompts, diffusion noise is stochastic. Omni inspects three sequential keyframes per plate in 3 seconds. If a 1-in-20 glitch occurs, it rejects the seed and autonomously re-rolls the shot before the clip ever touches the master reel.",
    features: [
      "Sub-Frame Eyelid & Anatomy Inspection",
      "Direct Pixel Entropy & Motion Continuity Check",
      "13 Automated Cloudtop Forensic Quality Gates",
      "Real-Time Quality Scoring (Zero Mock Logs)"
    ],
    accent: "from-cyan-500/20 to-blue-500/5",
    border: "border-cyan-500/30",
    textAccent: "text-cyan-300"
  },
  {
    number: "03",
    badge: "BROADCAST STANDARDS (EBU R128)",
    title: "Pure Acoustic Soundstage",
    subtitle: "Real classical master recordings with zero rogue dialogue bleed.",
    description: "Every master film is scored with authentic 48kHz orchestral classical recordings (Beethoven, Mahler, Chopin) and layered with atmospheric room foley. Calibrated precisely to -24.0 LUFS with zero electronic buzzers, zero dead air, and zero cross-talk.",
    features: [
      "Authentic Classical Orchestral Masters",
      "Calibrated to EBU R128 (-24.0 LUFS Target)",
      "Continuous Room Foley & Zero Dead Air (<0.7s)",
      "100% Rogue Dialogue Bleed Elimination"
    ],
    accent: "from-amber-500/20 to-orange-500/5",
    border: "border-amber-500/30",
    textAccent: "text-amber-300"
  }
];

export function OmniPillars() {
  return (
    <section id="architecture" className="relative border-b border-white/5 bg-obsidian-950 py-20 lg:py-32 overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-14 xl:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-black text-teal-300 font-mono tracking-wider uppercase">
            <Cpu className="h-3.5 w-3.5" /> Autonomous Architecture
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            How Omni Solves Generative Video
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-400">
            A closed-loop system designed from the ground up to eliminate AI hallucinations, temporal stutter, and rogue audio overlap.
          </p>
        </div>

        {/* 3 Core Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className={`relative rounded-[24px] border ${pillar.border} bg-gradient-to-b ${pillar.accent} p-8 backdrop-blur-xl shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-white/30">{pillar.number}</span>
                  <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${pillar.border} ${pillar.textAccent} bg-black/40`}>
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-black text-white">
                  {pillar.title}
                </h3>
                <div className={`mt-1 text-xs font-bold ${pillar.textAccent}`}>
                  {pillar.subtitle}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {pillar.description}
                </p>

                <div className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {pillar.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${pillar.textAccent}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link
                  href="/studio/create"
                  className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${pillar.textAccent} hover:underline`}
                >
                  Experience in Studio <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
