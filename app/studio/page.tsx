import { Suspense } from "react";
import { OmniMultiPhaseStudio } from "@/components/OmniMultiPhaseStudio";

export const metadata = {
  title: "Omni Directorial Studio — 11-Phase Production Console | Zyvoriq",
  description: "Direct 4K Master Cinema Reels with Google Omni: 11-Phase Directorial Dossier, Multimodal Screenplay, and Shot-by-Shot Timeline.",
};

export default function StudioPage() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <Suspense fallback={<div className="p-8 text-center text-sm font-mono text-emerald-400/80">Loading Omni Directorial Studio...</div>}>
        <OmniMultiPhaseStudio />
      </Suspense>
    </main>
  );
}
