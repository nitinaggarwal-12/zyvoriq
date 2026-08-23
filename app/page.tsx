import React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { DirectorConsole } from "@/components/DirectorConsole";
import { LifecycleFlow } from "@/components/LifecycleFlow";
import { VeritasQualityMatrix } from "@/components/VeritasQualityMatrix";
import { MultimodalStudio } from "@/components/MultimodalStudio";
import { AutonomyPolicyControls } from "@/components/AutonomyPolicyControls";
import { UseCasesSection } from "@/components/UseCasesSection";
import { WaitlistCTA } from "@/components/WaitlistCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <Navbar />
      <Hero />
      <DirectorConsole />
      <LifecycleFlow />
      <VeritasQualityMatrix />
      <MultimodalStudio />
      <AutonomyPolicyControls />
      <UseCasesSection />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}
