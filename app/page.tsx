import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PersonaGridSection } from "@/components/PersonaGridSection";
import { MultimodalStudio } from "@/components/MultimodalStudio";
import { UseCasesSection } from "@/components/UseCasesSection";
import { WaitlistCTA } from "@/components/WaitlistCTA";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <Navbar />
      <Hero />
      <PersonaGridSection />
      <MultimodalStudio />
      <UseCasesSection />
      <WaitlistCTA />
    </main>
  );
}
