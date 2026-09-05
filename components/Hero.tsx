"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  Zap,
  Smile,
  Flame,
  ShoppingBag,
  Film,
  Compass,
  WandSparkles,
  Clapperboard,
  Captions,
  Music2,
  Languages
} from "lucide-react";

const ONBOARDING_REELS = [
  {
    id: "kids_pixar",
    title: "Kids & Family",
    sub: "Pixar 3D CGI",
    icon: Smile,
    videoSrc: "/assets/video/persona1_pixar_kids_reel.mp4",
    badge: "1080p60 · PIXAR 3D ENGINE",
    hook: "A curious robot named Pip plants a glowing flower on the moon",
    caption: "“Every tiny spark begins a grand adventure.”",
    color: "from-pink-500 to-rose-500",
    border: "border-pink-500/40 text-pink-300"
  },
  {
    id: "anime_shonen",
    title: "Anime & Manga",
    sub: "Shōnen Action",
    icon: Zap,
    videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
    badge: "4K 60FPS · UFOTABLE SAKUGA",
    hook: "Sensei Ren & Apprentice Aoi unleash the secret Mushin technique",
    caption: "“Focus your mind until thunder turns to silence.”",
    color: "from-purple-500 to-indigo-500",
    border: "border-purple-500/40 text-purple-300"
  },
  {
    id: "viral_influencer",
    title: "Viral Influencer",
    sub: "Split ASMR Reel",
    icon: Flame,
    videoSrc: "/assets/video/persona3_viral_influencer_reel.mp4",
    badge: "9:16 VERTICAL · 84% RETENTION",
    hook: "3 daily micro-habits quietly destroying your focus",
    caption: "“The third one feels productive—but is pure friction.”",
    color: "from-red-500 to-orange-500",
    border: "border-red-500/40 text-red-300"
  },
  {
    id: "ugc_ecommerce",
    title: "E-Com UGC Ads",
    sub: "DTC Conversion",
    icon: ShoppingBag,
    videoSrc: "/assets/video/persona4_ugc_ecommerce_reel.mp4",
    badge: "ROAS 4.8X · TIKTOK & REELS",
    hook: "Watch the instant brightening serum test in real sunlight",
    caption: "“Zero filters. Just pure 72-hour deep hydration.”",
    color: "from-amber-500 to-yellow-500",
    border: "border-amber-500/40 text-amber-300"
  },
  {
    id: "cinema_noir",
    title: "A24 Cinema",
    sub: "35mm Neo-Noir",
    icon: Film,
    videoSrc: "/assets/video/persona5_arthouse_cinema_reel.mp4",
    badge: "2.39:1 ANAMORPHIC · KODAK 5219",
    hook: "Midnight rain in the neon labyrinth of District 9",
    caption: "“Some truths only reveal themselves after dark.”",
    color: "from-indigo-500 to-cyan-500",
    border: "border-indigo-500/40 text-indigo-300"
  },
  {
    id: "heritage_lore",
    title: "Heritage Lore",
    sub: "Indian Epics & BBC",
    icon: Compass,
    videoSrc: "/assets/video/persona6_heritage_mythology_reel.mp4",
    badge: "BBC DOCUMENTARY · 4K MASTER",
    hook: "Ancient celestial architectural marvels lost in time",
    caption: "“Carved into granite stone over a thousand years ago.”",
    color: "from-emerald-500 to-teal-500",
    border: "border-emerald-500/40 text-emerald-300"
  }
];

export function Hero() {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);

  const activeReel = ONBOARDING_REELS[activeReelIndex];

  const handleSelectReel = (idx: number) => {
    setActiveReelIndex(idx);
    setHasVideoError(false);
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.16),transparent_38%),radial-gradient(circle_at_75%_15%,rgba(45,212,191,0.14),transparent_28%)]" />
      <div className="relative mx-auto grid w-full max-w-[1800px] gap-10 lg:gap-14 px-6 pb-20 pt-14 sm:px-10 lg:px-14 xl:px-16 lg:grid-cols-12 lg:items-center lg:pb-28 lg:pt-20">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-5 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs sm:text-sm font-semibold text-teal-300 font-mono">
            <Sparkles className="h-4 w-4 text-teal-300" />
            <span>Autonomous Video Intelligence & 14-Persona Creation Suite</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-6xl xl:text-[74px] font-black leading-[0.98] tracking-[-0.055em] text-white [text-wrap:balance]">
            Turn an idea into a{" "}
            <span className="inline-block bg-gradient-to-r from-teal-300 via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              world-class 30s Reel.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-slate-300">
            From Pixar 3D CGI and Shōnen anime combat to high-converting TikTok UGC ads and cinematic films—Zyvoriq synthesizes scripts, scenes, voiceovers, kinetic captions, and platform-ready variants from one prompt.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="/studio/create"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-8 py-4 text-sm font-black text-obsidian-950 transition hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-teal-500/20"
            >
              <span>Open 14-Persona Studio</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#reel-demo"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/[0.08]"
            >
              <Play className="h-4 w-4 fill-current text-teal-300" />
              <span>Watch Live 30s Reels</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
            {["Pixar 3D & Anime", "TikTok & Shorts", "UGC Video Ads", "A24 Cinema", "C2PA Provenance", "Multilingual TTS"].map((item) => (
              <span key={item} className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 font-mono text-[11px]">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Live 30s Reel Stage */}
        <div id="reel-demo" className="relative w-full lg:col-span-7 space-y-4">
          {/* Persona Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full flex-wrap sm:flex-nowrap">
            {ONBOARDING_REELS.map((reel, idx) => {
              const Icon = reel.icon;
              const active = activeReelIndex === idx;
              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => handleSelectReel(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    active
                      ? "bg-white text-slate-950 shadow-lg"
                      : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{reel.title}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Player Box */}
          <div className="relative rounded-[32px] border border-white/10 bg-[#0c1016]/95 p-5 sm:p-7 shadow-2xl shadow-black/60 backdrop-blur-2xl grid gap-6 md:grid-cols-12 items-center">
            {/* 9:16 / 16:9 Vertical Reel Frame */}
            <div className="md:col-span-5 relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-inner flex items-center justify-center">
              {!hasVideoError && activeReel.videoSrc ? (
                <video
                  key={activeReel.videoSrc}
                  src={activeReel.videoSrc}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  onError={() => setHasVideoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeReel.color} flex items-center justify-center text-white mb-4 shadow-xl`}>
                    <activeReel.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-1">
                    {activeReel.sub}
                  </span>
                  <h4 className="text-white font-black text-sm max-w-[200px] leading-snug">
                    {activeReel.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-2 max-w-[210px] leading-relaxed">
                    {activeReel.hook}
                  </p>
                  <Link
                    href="/studio/create"
                    className="mt-5 px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-slate-200 transition active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>Launch Studio</span>
                  </Link>
                </div>
              )}

              {/* Top Video Telemetry Badge */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 border ${activeReel.border} backdrop-blur-md`}>
                  {activeReel.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                  0:30
                </span>
              </div>

              {/* Bottom Real-Time Kinetic Caption */}
              <div className="absolute inset-x-3 bottom-12 rounded-xl bg-black/60 p-3 backdrop-blur-md border border-white/10">
                <div className="text-xs font-bold text-white leading-snug">
                  {activeReel.caption}
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                  <span>⚡ AI TIMED SUBTITLES</span>
                  <span>C2PA CERTIFIED</span>
                </div>
              </div>

              {/* Audio Mute Controller Button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/80 text-white hover:bg-black border border-white/20 transition active:scale-95"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
              </button>
            </div>

            {/* Right: Synthesis Steps & Features */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                  {activeReel.title} · Active Prompt
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activeReel.hook}
                </h3>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  [WandSparkles, "3-Second Viral Hook", "Paced for maximum watch-time retention."],
                  [Clapperboard, "4-Act Scene Continuity", "Consistent character faces and lighting."],
                  [Captions, "Dynamic Kinetic Captions", "Word-by-word timed emphasis."],
                  [ShieldCheck, "C2PA Provenance Seal", "EU AI Act & CCPA cryptographic trust."]
                ].map(([Icon, title, desc]: any) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition"
                  >
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300 shrink-0 border border-teal-500/20">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{title}</div>
                      <div className="text-[11px] text-slate-400">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={`/studio/create?persona=${activeReel.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-xs font-black text-obsidian-950 shadow-lg shadow-teal-500/15 hover:from-teal-400 hover:to-emerald-400 active:scale-95 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize in Studio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
