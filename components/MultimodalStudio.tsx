"use client";

import React, { useState } from "react";
import { Layers, FileText, Code2, Mic, Video, Share2, Sparkles, CheckCircle2 } from "lucide-react";

interface ModalityEngine {
  id: string;
  name: string;
  prdId: string;
  icon: any;
  description: string;
  features: string[];
  outputSample: string;
}

const ENGINES: ModalityEngine[] = [
  {
    id: "tech_writing",
    name: "Engineering & Technical Publishing",
    prdId: "PRD-104",
    icon: FileText,
    description:
      "Compiles deep technical whitepapers, RFCs, release notes, and architecture articles directly from Git diffs and PRDs.",
    features: [
      "Syntax-highlighted code blocks with verified imports",
      "Automatic Architecture Decision Record (ADR) formatting",
      "Direct markdown and MDX exports with LaTeX math",
    ],
    outputSample: "Generates production-grade Markdown with exact API signatures and verified benchmarks.",
  },
  {
    id: "diagrams",
    name: "System Architecture & Flow Graphs",
    prdId: "PRD-105",
    icon: Code2,
    description:
      "Generates 2D collision-checked SVG topologies, sequence diagrams, and microservice interaction maps with zero manual layout editing.",
    features: [
      "Auto-healing bounding box collision algorithms",
      "Interactive SVG & Draw.io XML graph exports",
      "Dark glassmorphic styling aligned with enterprise design systems",
    ],
    outputSample: "Produces clean, un-crowded cloud infrastructure graphs and sequence charts.",
  },
  {
    id: "voice",
    name: "Humanized Neural Audio & Voice Dubbing",
    prdId: "PRD-106",
    icon: Mic,
    description:
      "Procedural vocal tract synthesis with 5-band formant convolution, emotional pacing, and conversational pauses for podcasts and keynotes.",
    features: [
      "Persistent vocal timbre and cadence cloning",
      "Gold-standard synced karaoke subtitle timecodes",
      "Multi-lingual dubbing with cultural inflection preservation",
    ],
    outputSample: "Broadcast-quality conversational narration with realistic breathing and vocal warmth.",
  },
  {
    id: "video",
    name: "Cinematic Video Storyboards & Shorts",
    prdId: "PRD-107",
    icon: Video,
    description:
      "Synthesizes scene-by-scene video storyboards, b-roll prompts, motion camera direction, and talking avatar scripts.",
    features: [
      "Aspect ratio adaptations: 16:9 Keynote, 9:16 Shorts, 1:1 Social",
      "Scene-level visual prompt compilers with seed consistency",
      "Automated motion cue and sound effect placement",
    ],
    outputSample: "Director-ready storyboard packages ready for Remotion, Veo 2, or studio mastering.",
  },
];

export function MultimodalStudio() {
  const [activeEngine, setActiveEngine] = useState<ModalityEngine>(ENGINES[0]);

  return (
    <section id="multimodal" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-300 border border-teal-500/20">
            <Layers className="h-3.5 w-3.5" />
            <span>PRD-104 → PRD-107 // MULTIMODAL SYNTHESIS SUITE</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            1 Master Story. 5 Native Modalities.
          </h2>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            Never copy-paste generic text across channels. Zyvoriq compiles dedicated native artifacts for each medium without diluting technical substance.
          </p>
        </div>
      </div>

      {/* Engine Selection Tabs & Interactive Studio Display */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Tab List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {ENGINES.map((engine) => {
            const Icon = engine.icon;
            const isSelected = activeEngine.id === engine.id;
            return (
              <button
                key={engine.id}
                type="button"
                onClick={() => setActiveEngine(engine)}
                className={`flex items-start gap-4 rounded-2xl p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-teal-400 bg-slate-900/95 shadow-xl shadow-teal-500/10"
                    : "border border-slate-800/80 bg-obsidian-900/70 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-teal-400 text-slate-950"
                      : "border border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{engine.name}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {engine.prdId}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-snug line-clamp-2">
                    {engine.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-obsidian-900/90 p-6 md:p-8 backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-teal-400">
                  ACTIVE MODALITY ENGINE
                </span>
                <h3 className="mt-1 text-2xl font-extrabold text-white">
                  {activeEngine.name}
                </h3>
              </div>
              <span className="rounded-xl border border-teal-500/30 bg-teal-950/40 px-3 py-1.5 font-mono text-xs font-bold text-teal-300">
                {activeEngine.prdId} Verified
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {activeEngine.description}
            </p>

            <div className="mt-6 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Core Architectural Capabilities:
              </span>
              <ul className="space-y-2">
                {activeEngine.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
              Modality Compilation Guarantee:
            </div>
            <div className="mt-1 text-xs text-teal-300 font-mono">
              ✓ {activeEngine.outputSample}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
