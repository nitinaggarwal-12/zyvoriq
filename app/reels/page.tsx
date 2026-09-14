import { CreatorReelsHome } from "@/components/CreatorReelsHome";

export const metadata = {
  title: "Zyvoriq Reels — 9:16 Unbroken AI Reels with 100% Biometric Identity Lock",
  description: "Generate unbroken 9:16 vertical reels with 100% character face lock and zero identity drift.",
};

export default function ReelsPage() {
  return (
    <main id="top" className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      <CreatorReelsHome initialTab="instagram_tiktok" />
    </main>
  );
}
