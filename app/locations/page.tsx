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
