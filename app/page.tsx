import { CreatorReelsHome } from "@/components/CreatorReelsHome";

export const metadata = {
  title: "Zyvoriq — Viral 9:16 AI Reels with Zero Character Drift",
  description: "Generate unbroken 9:16 vertical reels with 100% character face lock. ~7 minutes for a 6-shot reel. Labeled as AI with C2PA and SynthID so platforms never penalize your reach.",
};

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <CreatorReelsHome />
    </main>
  );
}
