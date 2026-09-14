import { CreatorReelsHome } from "@/components/CreatorReelsHome";

export const metadata = {
  title: "Zyvoriq Music Video Studio — Autonomous AI Music Videos (Omni 1.1 & Lyria 3.5)",
  description: "Autonomous AI Music Video Production powered by Google Omni 1.1 & Lyria 3.5 Hybrid Mastering.",
};

export default function YTPage() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <CreatorReelsHome initialTab="music_video" />
    </main>
  );
}
