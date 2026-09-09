import React from "react";
import Link from "next/link";
import { LocationLibrary } from "@/components/LocationLibrary";
import { Compass, Users, Sparkles, Layers, ShieldCheck, Film, Clapperboard, Plus } from "lucide-react";

export const metadata = {
  title: "Location Library — Physical Set Lock | Zyvoriq",
  description: "Browse immutable physical set blocks for byte-identical scene environments and zero world drift.",
};

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500/30 selection:text-amber-100">
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
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-semibold text-amber-300">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span>Physical Set Library</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 hidden md:inline">
                (Immutable Environment Blocks)
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <Link href="/characters" className="hover:text-teal-400 transition-colors flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              <span>Character Library</span>
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
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-2 text-xs font-mono font-bold text-amber-300 transition shadow-[0_0_15px_rgba(245,158,11,0.25)] min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Direct New Reel</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO HIGHLIGHT BAR */}
      <section className="border-b border-white/5 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent py-8 px-4 sm:px-6 md:px-10 lg:px-12">
        <div className="max-w-[1760px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Byte-Identical Environment Prompts • Zero Set Drift</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
                Immutable Physical Set & Architecture Library
              </h1>
              <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
                Physical environments drift across shots when video diffusion engines interpret room layout anew.
                Zyvoriq locks each set to a verbatim, byte-identical prompt block injected into every scene manifest, ensuring architectural and atmospheric fidelity.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-amber-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Byte-Identical</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-teal-400">0.0%</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Lighting Drift</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0C1019] border border-white/10 text-center min-w-[100px]">
                <div className="text-2xl font-mono font-bold text-cyan-400">Instant</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Omni Set Lock</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN GALLERY CONTENT */}
      <main className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-8">
        <LocationLibrary isSelectionMode={false} />
      </main>
    </div>
  );
}
