import React from "react";
import { Navbar } from "@/components/Navbar";
import { OmniHero } from "@/components/OmniHero";
import { OmniMasterShowcase } from "@/components/OmniMasterShowcase";
import { OmniPillars } from "@/components/OmniPillars";
import { OmniGenreSelector } from "@/components/OmniGenreSelector";
import { WaitlistCTA } from "@/components/WaitlistCTA";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <Navbar />
      <OmniHero />
      <OmniMasterShowcase />
      <OmniPillars />
      <OmniGenreSelector />
      <WaitlistCTA />
    </main>
  );
}
