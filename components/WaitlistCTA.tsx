"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Clapperboard, ShieldCheck } from "lucide-react";

export function WaitlistCTA() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-white/5 bg-obsidian-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.14),transparent_40%),radial-gradient(circle_at_75%_35%,rgba(245,158,11,0.08),transparent_30%)]" />
      <div className="relative mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 py-10 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-teal-500/20 bg-gradient-to-br from-slate-900/80 via-obsidian-900/60 to-slate-900/80 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl shadow-2xl shadow-black/80">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Directed by Google Omni & Veo 3.1
              </div>
              <h2 className="mt-6 max-w-4xl text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Ready to direct your first cinema master?
              </h2>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                Bring any concept, historical saga, or brand story. Google Omni compiles diffusion-safe prompts, guides 4K camera vectors, composes pure acoustic scores, and rejects defects on-set.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm text-slate-400 font-mono">
                {["Zero Prompts Wasted", "Veo 3.1 4K Photorealism", "Beethoven & Chamber Score", "Gemini Directorial QC"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[280px]">
              <a 
                href="/#hero-director" 
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-7 py-4 text-sm font-black text-slate-950 uppercase tracking-wider transition hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-teal-500/25"
              >
                <Clapperboard className="h-4 w-4" />
                Direct Cinema Master <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a 
                href="#master-showcase" 
                className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/[0.08]"
              >
                Watch 180s Napoleon Master
              </a>
              <p className="text-center text-[11px] leading-relaxed text-slate-500 font-mono">
                C2PA &amp; SynthID Platform Safety · Normalized Audio
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
