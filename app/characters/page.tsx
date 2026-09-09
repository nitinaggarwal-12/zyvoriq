import React from "react";
import Link from "next/link";
import { CharacterLibrary } from "@/components/CharacterLibrary";
import { Users, Sparkles, ShieldCheck, Film, Compass, Clapperboard, Plus } from "lucide-react";

export const metadata = {
  title: "Character Library — Pre-Validated Cast Vault | Zyvoriq",
  description: "Browse and cast pre-validated actor identity sheets for zero-drift video generation.",
};

export default function CharactersPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      {/* 1. STICKY TOP FULL-WIDTH NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#07090E]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1760px] items-center justify-between px-4 py-3.5 sm:px-6 md:px-10 lg:px-12">
          {/* Left Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-base shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                Z
              </div>
              <span className="text-lg font-black tracking-tight text-white hidden sm:inline">
                Zyvoriq
              </span>
            </Link>

            <span className="text-zinc-600 text-sm hidden sm:inline">/</span>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-mono font-semibold text-teal-300">
                <Users className="h-3.5 w-3.5 text-teal-400" />
                <span>Character Vault</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 hidden md:inline">
                (Pre-Validated Cast & Wardrobe)
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <Link href="/locations" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Location Library</span>
            </Link>
            <Link href="/studio" className="hover:text-teal-400 transition-colors flex items-center gap-1">
              <Clapperboard className="w-3.5 h-3.5 text-teal-400" />
              <span>Omni Studio</span>
            </Link>
            <Link href="/my-reels" className="hover:text-teal-400 transition-colors flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-teal-400" />
              <span>My Reels</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/#prompt-bar"
              className="flex items-center gap-1.5 rounded-xl border border-teal-500/50 bg-teal-500/15 hover:bg-teal-500/25 px-4 py-2 text-xs font-mono font-bold text-teal-300 transition shadow-[0_0_15px_rgba(20,184,166,0.25)] min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Direct New Reel</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO HIGHLIGHT BAR */}
      <section className="border-b border-white/5 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent py-8 px-4 sm:px-6 md:px-10 lg:px-12">
        <div className="max-w-[1760px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero RAI Poisoning • Veo Likeness Pre-Tested</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                Pre-Validated Character Cast & Wardrobe
              </h1>
              <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
                Every character sheet in this library has undergone empirical pre-flight validation against Google Veo safety filters.
                Archetype-anchored references eliminate prompt-level celebrity false positives, while bound voice profiles guarantee audio continuity.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-teal-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Veo Validated</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-cyan-400">2 Max</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Speaker Limit</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-emerald-400">0.0%</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Likeness Drift</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN GALLERY CONTENT */}
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-8">
        <CharacterLibrary isSelectionMode={false} />
      </main>
    </div>
  );
}
