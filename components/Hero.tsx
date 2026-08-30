"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Mic2, Video, Image as ImageIcon, Presentation, Languages, BookOpen, Share2 } from "lucide-react";

const outputs = [
  { label: "Video", icon: Video, meta: "9:16 short" },
  { label: "Voice", icon: Mic2, meta: "natural narration" },
  { label: "Visuals", icon: ImageIcon, meta: "scene pack" },
  { label: "Slides", icon: Presentation, meta: "executive deck" },
  { label: "Story", icon: BookOpen, meta: "illustrated" },
  { label: "Social", icon: Share2, meta: "native posts" },
  { label: "Languages", icon: Languages, meta: "localized" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.18),transparent_48%)]" />
      <div className="relative mx-auto grid max-w-[1500px] gap-12 px-6 pb-20 pt-16 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-28 lg:pt-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-teal-300" />
            One idea. Every format. Still unmistakably yours.
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[84px]">
            Imagine it.
            <span className="block bg-gradient-to-r from-teal-200 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">Zyvoriq makes it real.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Turn one brief into video, voice, visuals, stories, presentations and channel-ready content—while preserving your identity, intent, brand and source context.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]">
              Start creating <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#demo" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/[0.08]">
              <Play className="h-4 w-4 fill-current" /> See the transformation
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            <span>Human review when you want it</span>
            <span>•</span>
            <span>Source-aware creation</span>
            <span>•</span>
            <span>Multilingual adaptation</span>
          </div>
        </div>

        <div id="demo" className="relative">
          <div className="absolute -inset-10 rounded-[48px] bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1118] shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
              <span className="ml-3 text-xs font-medium text-slate-500">Zyvoriq creative canvas</span>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Your idea</div>
                <p className="mt-3 text-lg font-semibold leading-7 text-white sm:text-xl">“Explain quantum computing to a 12-year-old as a space adventure.”</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full bg-white/5 px-3 py-1.5">Curious</span>
                  <span className="rounded-full bg-white/5 px-3 py-1.5">Ages 10–14</span>
                  <span className="rounded-full bg-white/5 px-3 py-1.5">Warm narrator</span>
                  <span className="rounded-full bg-white/5 px-3 py-1.5">Science grounded</span>
                </div>
              </div>

              <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                <span className="h-px flex-1 bg-white/5" /> becomes <span className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {outputs.map(({ label, icon: Icon, meta }, index) => (
                  <div key={label} className={`group rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-4 transition hover:-translate-y-1 hover:border-teal-300/30 ${index === 0 ? "sm:col-span-2" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/7 text-teal-200"><Icon className="h-4 w-4" /></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">ready</span>
                    </div>
                    <div className="mt-4 text-sm font-bold text-white">{label}</div>
                    <div className="mt-1 text-xs text-slate-500">{meta}</div>
                    {index === 0 && <div className="mt-4 h-20 rounded-xl bg-[radial-gradient(circle_at_70%_25%,rgba(45,212,191,0.35),transparent_28%),linear-gradient(135deg,#17202b,#0d1118)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
