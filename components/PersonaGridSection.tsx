"use client";

import React from "react";
import Link from "next/link";
import {
  Smile,
  Zap,
  Flame,
  ShoppingBag,
  Film,
  Compass,
  Briefcase,
  Dumbbell,
  Building2,
  TrendingUp,
  Plane,
  GraduationCap,
  Stethoscope,
  Moon,
  ArrowRight,
  Sparkles
} from "lucide-react";

const PERSONAS = [
  { id: "kids", index: "#1", title: "Kids & Family", sub: "Disney & Pixar 3D CGI", icon: Smile, color: "text-pink-400 bg-pink-500/10 border-pink-500/20", href: "/studio/create/animation" },
  { id: "anime", index: "#2", title: "Anime & Manga", sub: "Shōnen & 4-Koma Ink", icon: Zap, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", href: "/studio/create/comics" },
  { id: "influencer", index: "#3", title: "Viral Influencers", sub: "Split-Screen & ASMR", icon: Flame, color: "text-red-400 bg-red-500/10 border-red-500/20", href: "/studio/create/reel?mode=faceless" },
  { id: "ugc", index: "#4", title: "E-Com & DTC Ads", sub: "High-Converting UGC", icon: ShoppingBag, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", href: "/studio/create/ugc" },
  { id: "cinema", index: "#5", title: "Filmmakers & A24", sub: "Arthouse & Neo-Noir", icon: Film, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", href: "/studio/create/film" },
  { id: "heritage", index: "#6", title: "Seniors & Heritage", sub: "Folklore & Wisdom", icon: Compass, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", href: "/studio/create/heritage" },
  { id: "b2b", index: "#7", title: "B2B SaaS & Tech", sub: "Product Demos & VSLs", icon: Briefcase, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", href: "/studio/create/b2b" },
  { id: "fitness", index: "#8", title: "Fitness & Diet", sub: "High-Energy Workouts", icon: Dumbbell, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", href: "/studio/create/fitness" },
  { id: "realestate", index: "#9", title: "Luxury Real Estate", sub: "3D Spatial Walkthroughs", icon: Building2, color: "text-teal-400 bg-teal-500/10 border-teal-500/20", href: "/studio/create/realestate" },
  { id: "finance", index: "#10", title: "Traders & Crypto", sub: "Macro Charts & Signals", icon: TrendingUp, color: "text-lime-400 bg-lime-500/10 border-lime-500/20", href: "/studio/create/finance" },
  { id: "travel", index: "#11", title: "Travel & Foodies", sub: "Cinematic Itineraries", icon: Plane, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", href: "/studio/create/travel" },
  { id: "edtech", index: "#12", title: "EdTech & STEM", sub: "Interactive Code Demos", icon: GraduationCap, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", href: "/studio/create/edtech" },
  { id: "doctors", index: "#13", title: "Doctors & Clinical", sub: "3D Medical Anatomy", icon: Stethoscope, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", href: "/studio/create/healthcare" },
  { id: "spiritual", index: "#14", title: "Astrology & Faith", sub: "Sacred Chants & Horoscopes", icon: Moon, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", href: "/studio/create/devotional" }
];

export function PersonaGridSection() {
  return (
    <section className="relative border-b border-white/5 bg-black/40 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1800px] px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-black text-teal-300 font-mono">
              <Sparkles className="h-3.5 w-3.5" /> 14-PERSONA CREATIVE PRODUCTION SUITE
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Specialized visual engines for every industry.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Zero one-size-fits-all prompts. From Pixar 3D CGI and Shōnen anime combat to high-converting TikTok UGC ads and clinical 3D medical animations.
            </p>
          </div>

          <Link
            href="/studio/create"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-950 transition hover:scale-105 active:scale-95"
          >
            Explore Master Matrix <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 14 Persona Cards Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                href={p.href}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-teal-400/40 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-teal-500/10 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${p.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black font-mono text-slate-500 group-hover:text-teal-300">
                    {p.index}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-black text-white group-hover:text-teal-200 transition">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">
                    {p.sub}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
