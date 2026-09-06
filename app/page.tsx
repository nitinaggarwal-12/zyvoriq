import React from "react";
import { OmniMultiPhaseStudio } from "@/components/OmniMultiPhaseStudio";
import { OmniMasterShowcase } from "@/components/OmniMasterShowcase";
import { OmniPillars } from "@/components/OmniPillars";
import { OmniGenreSelector } from "@/components/OmniGenreSelector";
import { WaitlistCTA } from "@/components/WaitlistCTA";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <OmniMultiPhaseStudio />
      <OmniMasterShowcase />
      <OmniPillars />
      <OmniGenreSelector />
      <WaitlistCTA />
    </main>
  );
}

