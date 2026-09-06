"use client";

import React from "react";
import { Sparkles, Cpu, Eye, Music, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const PILLARS = [
  {
    number: "01",
    badge: "95% UP-FRONT PRE-FLIGHT SYNTHESIS",
    title: "Master Director & Story Architecture",
    subtitle: "Eliminating blindspots, lore gaps, and drift before diffusion begins.",
    description: "Omni completes 95% of the heavy lifting up-front: deep lore research, multi-act plot structures, character emotional subtext, naturalistic dialogues, and blocking. This eliminates diffusion drift, narrative blindspots, and continuity traps before spending GPU compute.",
    features: [
      "95% Up-Front Lore & Subject Grounding",
      "Multi-Act Dramatic Tension & Pacing Arc",
      "Subtextual Dialogue & Speech Cadence",
      "Authentic Human Emotions (Zero Caricature)"
    ],
    accent: "from-teal-500/20 to-emerald-500/5",
    border: "border-teal-500/30",
    textAccent: "text-teal-300"
  },
  {
    number: "02",
    badge: "CREW, OPTICS & CAST CONTINUITY",
    title: "Cinematography & Character DNA",
    subtitle: "Curating lenses, lighting rigs, dance choreography, and face DNA.",
    description: "Omni selects the virtual camera crew: Cooke Anamorphic 2.39:1 lenses, Zeiss primes, chiaroscuro lighting, and ACES 1.3 color conformance. It locks facial continuity DNA, choreographs rhythmic motion vectors, and synchronizes dance blocking.",
    features: [
      "Cooke Anamorphic & Leica Optics Selection",
      "Strict Character Facial DNA Anchoring",
      "Rhythmic Dance & Scene Blocking Vectors",
      "ACES 1.3 Color Science & Volumetric Lighting"
    ],
    accent: "from-cyan-500/20 to-blue-500/5",
    border: "border-cyan-500/30",
    textAccent: "text-cyan-300"
  },
  {
    number: "03",
    badge: "SOUNDSTAGE & LYRICAL COMPOSITION",
    title: "Music, Songs & Acoustic Bed",
    subtitle: "Original symphonic scores, lyrics, BGM, and EBU R128 loudness.",
    description: "Every scene is orchestrated with authentic acoustic instrumentation (Beethoven, Mahler, analog modular synths), poetic lyrical verse, and atmospheric room foley. Calibrated strictly to EBU R128 (-24.0 LUFS) with zero dead air and zero dialogue bleed.",
    features: [
      "Authentic Orchestral & Synthesizer BGM",
      "Poetic Songwriting & Lyrical Composition",
      "Calibrated to EBU R128 (-24.0 LUFS Standard)",
      "100% Dialogue Bleed & Cross-Talk Elimination"
    ],
    accent: "from-amber-500/20 to-orange-500/5",
    border: "border-amber-500/30",
    textAccent: "text-amber-300"
  },
  {
    number: "04",
    badge: "5% POST-DIFFUSION SURGICAL FIXING",
    title: "Surgical Defect Auto-Repair Loop",
    subtitle: "Pinpointing the final 5% gaps and healing them autonomously.",
    description: "After the 95% baseline reel is compiled, Omni audits live frames with Gemini 2.5 Flash. It isolates remaining edge defects—an anatomical flicker or dialogue splice—and surgically re-rolls only that specific shot without discarding the master timeline.",
    features: [
      "Gemini 2.5 Flash Frame-Level Gap Detection",
      "Surgical Shot-Level Auto-Repair (Loop 1-3)",
      "Zero-Master Discard Timeline Conformance",
      "13 Forensic Quality Gates (100% Broadcast Pass)"
    ],
    accent: "from-purple-500/20 to-indigo-500/5",
    border: "border-purple-500/30",
    textAccent: "text-purple-300"
  }
];

export function OmniPillars() {
  return (
    <section id="architecture" className="relative border-b border-white/5 bg-obsidian-950 py-10 lg:py-14 overflow-hidden">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
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

        {/* 4 Core Directorial & QC Pillars Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <a
                  href="/#hero-director"
                  className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${pillar.textAccent} hover:underline`}
                >
                  Direct with Omni <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
