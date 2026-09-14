import React from "react";
import { YTStudio } from "@/components/YTStudio";

export const metadata = {
  title: "Zyvoriq Studio — Omni 1.1 Hybrid Master Console",
  description: "Direct 4K Master Cinema Reels and AI Music Videos with Google Omni 1.1 Flash Hybrid Mastering & Lyria 3.5.",
};

export default function StudioPage() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <YTStudio embedded={false} />
    </main>
  );
}

