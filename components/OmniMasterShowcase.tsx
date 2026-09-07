"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX, ShieldCheck, Sparkles, Film, Clock, Music2, Maximize2, CheckCircle2 } from "lucide-react";

interface ActPreview {
  id: string;
  actNumber: string;
  title: string;
  timeRange: string;
  description: string;
  character: string;
  stillUrl: string;
  videoTime: number;
}

const ACTS: ActPreview[] = [
  {
    id: "ACT_01",
    actNumber: "ACT I",
    title: "The Fires of Youth & Unsent Letters",
    timeRange: "00:00 - 00:36",
    description: "Young artillery officer Bonaparte courting Désirée Clary on the bluffs of Marseille, 1795.",
    character: "Young Napoleon & Désirée",
    stillUrl: "/assets/stills/napoleon_hero.png",
    videoTime: 0
  },
  {
    id: "ACT_02",
    actNumber: "ACT II",
    title: "The Imperial Crown & The Rose Sanctuary",
    timeRange: "00:36 - 01:12",
    description: "Notre-Dame coronation ceremony followed by Joséphine's tranquil rose haven at Malmaison.",
    character: "Empress Joséphine de Beauharnais",
    stillUrl: "/assets/stills/coronation_hero.png",
    videoTime: 36
  },
  {
    id: "ACT_03",
    actNumber: "ACT III",
    title: "The Polish Winter & Countess Walewska",
    timeRange: "01:12 - 01:48",
    description: "Finckenstein Palace snowbound romance amidst the grueling winter campaigns of 1807.",
    character: "Countess Marie Walewska",
    stillUrl: "/assets/stills/titanic_hero.jpg",
    videoTime: 72
  },
  {
    id: "ACT_04",
    actNumber: "ACT IV",
    title: "The Dynastic Sacrifice & King of Rome",
    timeRange: "01:48 - 02:24",
    description: "The heartbreaking legal dissolution of marriage for imperial heir Marie-Louise and Napoleon II.",
    character: "Empress Marie-Louise & Infant Heir",
    stillUrl: "/assets/stills/coronation_hero.png",
    videoTime: 108
  },
  {
    id: "ACT_05",
    actNumber: "ACT V",
    title: "The Solitary Echo & Saint Helena",
    timeRange: "02:24 - 03:00",
    description: "Longwood House in the South Atlantic; the dying emperor's final whispered word: 'France, l'armée, Joséphine.'",
    character: "Napoleon in Exile",
    stillUrl: "/assets/stills/napoleon_hero.png",
    videoTime: 144
  }
];

export function OmniMasterShowcase() {
  const [activeActIndex, setActiveActIndex] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeAct = ACTS[activeActIndex];

  const handleSelectAct = (index: number) => {
    setActiveActIndex(index);
    if (videoRef.current) {
      document.querySelectorAll("video").forEach((v) => {
        if (v !== videoRef.current) v.pause();
      });
      videoRef.current.currentTime = ACTS[index].videoTime;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section id="master-showcase" className="relative border-b border-white/5 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 py-10 lg:py-14 overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-black text-teal-300 font-mono tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> 180.0s SMPTE Broadcast Master
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Napoleon: The Emperor&apos;s Heart
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
              A 3-minute, 30-shot cinematic master compiled entirely through Google Omni and Veo 3.1. Zero text burn-ins, pure acoustic Beethoven Symphony No. 7 score, and 100% verified frame continuity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Duration</div>
              <div className="text-xs font-black text-white font-mono flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" /> 180.1s (4,320 F)
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Audio Master</div>
              <div className="text-xs font-black text-amber-300 font-mono flex items-center gap-1.5 mt-0.5">
                <Music2 className="h-3.5 w-3.5 text-amber-400" /> Beethoven Op. 92
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Vision Gate</div>
              <div className="text-xs font-black text-teal-300 font-mono flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> 13/13 Certified
              </div>
            </div>
          </div>
        </div>

        {/* Master Cinema Player Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-obsidian-900/80 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-black/80">
          
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black shadow-inner">
            <video
              ref={videoRef}
              key="napoleon-master-video"
              className="h-full w-full object-cover"
              src="/assets/video/napoleon_180s_master.mp4"
              poster={activeAct.stillUrl || "/assets/stills/napoleon_hero.png"}
              playsInline
              controls
              preload="none"
              onPlay={() => {
                document.querySelectorAll("video").forEach((v) => {
                  if (v !== videoRef.current) v.pause();
                });
              }}
            />

            <div className="pointer-events-none absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-[11px] font-mono font-bold text-slate-200 backdrop-blur-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              COOKE ANAMORPHIC 2.39:1 · 24FPS DCI
            </div>
          </div>

          {/* 5-Act Interactive Scrubber Tabs */}
          <div className="mt-5">
            <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-2">
              Timeline Navigation (Click to Jump to Act):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ACTS.map((act, index) => {
                const isSelected = activeActIndex === index;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleSelectAct(index)}
                    className={`group relative rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-teal-400 bg-teal-500/15 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className={isSelected ? "text-teal-300" : "text-slate-300 group-hover:text-white"}>
                        {act.actNumber}
                      </span>
                      <span className={isSelected ? "text-teal-200 font-extrabold" : "text-slate-400"}>
                        {act.timeRange}
                      </span>
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-black text-white line-clamp-1">
                      {act.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-300 line-clamp-1">
                      {act.character}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Full 180s timeline rendered on Cloudtop with zero rogue dialogue bleed</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/scratch/productions/napoleon_romance/shots/napoleon_romance_180s_master.mp4"
                download="napoleon_romance_180s_master.mp4"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Film className="h-3.5 w-3.5 text-teal-300" /> Download Master MP4 (186 MB)
              </a>

              <Link
                href="/studio/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-5 py-2 text-xs font-black text-slate-950 uppercase tracking-wider transition hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20"
              >
                <Sparkles className="h-3.5 w-3.5 fill-current" /> Direct Your Film
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
