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
