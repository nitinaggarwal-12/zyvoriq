"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Crown, Film, Rocket, Flame, Sparkles } from "lucide-react";

const GENRES = [
  {
    id: "historical",
    title: "Historical Epics",
    subtitle: "2.39:1 Anamorphic · Orchestral Score",
    description: "Period dramas from 18th-century royal courts to ancient battlefields. Governed by authentic character likeness, costuming, and acoustic symphonies.",
    icon: Crown,
    badge: "HISTORICAL SAGA",
    href: "/#hero-director",
    accent: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    hoverBorder: "group-hover:border-amber-500/50"
  },
  {
    id: "cinema",
    title: "A24 Arthouse Cinema",
    subtitle: "35mm Kodak 5219 · Chiaroscuro",
    description: "Intimate psychological narratives, subtle micro-expressions, slow zooms, atmospheric rain, and organic film grain without synthetic AI plastic look.",
    icon: Film,
    badge: "ARTHOUSE DRAMA",
    href: "/#hero-director",
    accent: "text-teal-300 bg-teal-500/10 border-teal-500/30",
    hoverBorder: "group-hover:border-teal-500/50"
  },
  {
    id: "scifi",
    title: "Sci-Fi Worldbuilding",
    subtitle: "4K DCI · Deep Space & Cyberpunk",
    description: "High-concept speculative worlds, futuristic orbital stations, and cyberpunk neon corridors rendered with coherent architectural depth and sound design.",
    icon: Rocket,
    badge: "SPECULATIVE SCI-FI",
    href: "/#hero-director",
    accent: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
    hoverBorder: "group-hover:border-cyan-500/50"
  },
  {
    id: "viral",
    title: "High-Retention Social",
    subtitle: "9:16 Vertical · Feed-Native Pacing",
    description: "Short-form vertical video engineered for Instagram Reels and YouTube Shorts. Dynamic hook pacing, phrase-level subtitles, and zero cringe.",
    icon: Flame,
    badge: "VERTICAL CREATOR",
    href: "/#hero-director",
    accent: "text-rose-300 bg-rose-500/10 border-rose-500/30",
    hoverBorder: "group-hover:border-rose-500/50"
  }
];

export function OmniGenreSelector() {
  return (
    <section id="genres" className="relative border-b border-white/5 bg-obsidian-900/40 py-10 lg:py-14">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-black text-teal-300 font-mono tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Curated Production Suites
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Specialized Cinematography Engines
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-400">
              Select an aesthetic. Google Omni tunes its lens physics, color grading profile, and acoustic composition to match the genre.
            </p>
          </div>

          <a
            href="/#hero-director"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-950 uppercase tracking-wider transition hover:scale-105 active:scale-95 shrink-0"
          >
            Direct Custom Master <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* 4 Clean Quadrant Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GENRES.map((g) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.id}
                href={g.href}
                className={`group relative rounded-[24px] border border-white/10 bg-slate-900/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/70 ${g.hoverBorder} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${g.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-600 transition group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <div className="mt-6 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                    {g.badge}
                  </div>

                  <h3 className="mt-1 text-xl font-black text-white group-hover:text-teal-300 transition-colors">
                    {g.title}
                  </h3>

                  <div className="mt-1 text-xs font-semibold text-slate-400">
                    {g.subtitle}
                  </div>

                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {g.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs font-bold text-teal-300">
                  <span>Direct this genre</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
