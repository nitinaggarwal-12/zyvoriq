"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Captions, WandSparkles, Languages, Music2, Clapperboard } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.16),transparent_38%),radial-gradient(circle_at_75%_15%,rgba(45,212,191,0.14),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-[1500px] gap-12 px-6 pb-20 pt-16 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-28 lg:pt-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-semibold text-slate-300">
            <Sparkles className="h-4 w-4 text-pink-300" />
            AI reel studio for creators, brands & teams
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-[82px]">
            Turn an idea into a
            <span className="block bg-gradient-to-r from-pink-300 via-orange-200 to-teal-200 bg-clip-text text-transparent">scroll-stopping Reel.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Zyvoriq helps you create the hook, script, scenes, voice, captions, music direction, thumbnail and platform-ready variants from one brief—without making every post feel AI-generated.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]">
              Create a Reel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#reel-demo" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/[0.08]">
              <Play className="h-4 w-4 fill-current" /> See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
            {["Instagram Reels", "YouTube Shorts", "TikTok-ready", "Multilingual", "Brand-aware"].map((item) => (
              <span key={item} className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5">{item}</span>
            ))}
          </div>
        </div>

        <div id="reel-demo" className="relative mx-auto w-full max-w-3xl">
          <div className="absolute -inset-10 rounded-[48px] bg-gradient-to-br from-pink-500/10 via-cyan-500/5 to-teal-500/10 blur-3xl" />
          <div className="relative grid gap-5 md:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[34px] border border-white/10 bg-[#0c1016] p-3 shadow-2xl shadow-black/40">
              <div className="relative aspect-[9/16] overflow-hidden rounded-[27px] bg-[radial-gradient(circle_at_65%_20%,rgba(244,114,182,0.35),transparent_26%),radial-gradient(circle_at_35%_75%,rgba(45,212,191,0.25),transparent_30%),linear-gradient(160deg,#1b1320,#0a1118_60%,#0b1717)]">
                <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/70">
                  <span>Preview</span><span>0:24</span>
                </div>
                <div className="absolute inset-x-5 top-[27%] text-center">
                  <div className="text-3xl font-black leading-none tracking-[-0.04em] text-white">3 habits quietly killing your focus</div>
                  <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-pink-300" />
                </div>
                <div className="absolute inset-x-5 bottom-24 rounded-2xl bg-black/35 p-4 backdrop-blur-md">
                  <div className="text-sm font-bold text-white">“The third one feels productive—but isn’t.”</div>
                  <div className="mt-2 text-[11px] leading-4 text-white/60">Dynamic caption timing • emphasis detected</div>
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[10px] text-white/60">
                  <span>@yourbrand</span><span>♫ original audio</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:pt-8">
              {[
                [WandSparkles, "Hook & script", "3 strong openings, paced for retention"],
                [Clapperboard, "Scene plan", "Shot-by-shot visuals, b-roll and transitions"],
                [Captions, "Captions", "Readable, timed, emphasis-aware subtitles"],
                [Music2, "Voice & sound", "Narration tone, beat and SFX direction"],
                [Languages, "Repurpose", "Variants for Reels, Shorts and other languages"],
              ].map(([Icon, title, body]: any) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-pink-300/25">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-pink-200"><Icon className="h-4 w-4" /></div>
                    <div><div className="text-sm font-bold text-white">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{body}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
