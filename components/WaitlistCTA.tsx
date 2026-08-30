"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export function WaitlistCTA() {
  return (
    <section id="waitlist" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.12),transparent_34%),radial-gradient(circle_at_72%_35%,rgba(45,212,191,0.10),transparent_26%)]" />
      <div className="relative mx-auto max-w-[1500px] px-6 py-20 md:px-10 lg:py-28">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-slate-300">
                <Sparkles className="h-4 w-4 text-pink-300" />
                Your next Reel can start with one sentence
              </div>
              <h2 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Stop staring at a blank timeline.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">Bring the idea. Zyvoriq helps shape the hook, script, visual beats, captions and variants so you can spend more time making the content feel like you.</p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400">
                {["Editable creative decisions", "Brand-aware output", "Short-form first", "Repurpose without copy-paste"].map((item) => (
                  <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-300" />{item}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[250px]">
              <Link href="/studio" className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]">
                Create a Reel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a href="#multimodal" className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/[0.07]">Explore the workflow</a>
              <p className="text-center text-xs leading-5 text-slate-600">No fake signup confirmation. Start with the product experience.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
