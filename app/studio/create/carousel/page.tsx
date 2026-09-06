"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Sparkles,
  Zap,
  ArrowLeft,
  Palette,
  FileText,
  Loader2,
  Lightbulb,
  Share2
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

function CarouselCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState("dark_glassmorphic");
  const [targetPlatform, setTargetPlatform] = useState("linkedin");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("topic");
    if (q) {
      setTopic(q);
    }
  }, [searchParams]);

  const handleSurprisePrompt = () => {
    const ideas = [
      "7 cognitive biases that secretly control your everyday buying decisions (and how marketers exploit them)",
      "How Stripe designs their UI: 5 typography and spacing rules every developer should steal",
      "The 2026 Solo Founder Tech Stack: How 1 person builds an $80k/mo business with AI agents",
      "5 subtle body language cues high-status leaders use in high-stakes negotiations"
    ];
    setTopic(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    router.push(`/studio?mode=carousel&topic=${encodeURIComponent(topic)}&slides=${slideCount}&theme=${theme}`);
  };

  return (
    <StudioSidebar>
      <main className="flex-1 min-w-0 max-w-5xl w-full mx-auto px-5 py-8 md:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/studio/create"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-teal-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Creation Hub
          </Link>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-300 font-mono">
            📊 CAROUSEL & SLIDE DECK STUDIO
          </span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Create a Social Carousel & Deck
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Generate high-converting, viral carousel slide decks for LinkedIn and Instagram.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                Topic or Content Premise
              </label>
              <button
                type="button"
                onClick={handleSurprisePrompt}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Surprise Me</span>
              </button>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="e.g. 5 non-obvious ways AI agents will reshape consumer retail by 2027..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                Number of Slides
              </label>
              <div className="flex gap-2">
                {[5, 7, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSlideCount(count)}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                      slideCount === count
                        ? "border-teal-400 bg-teal-500/20 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                    }`}
                  >
                    {count} Slides
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                Design Aesthetic
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs font-bold text-white focus:border-teal-400 focus:outline-none"
              >
                <option value="dark_glassmorphic">Dark Glassmorphism (Vercel Style)</option>
                <option value="high_contrast_yellow">High Contrast Bold Yellow (Viral)</option>
                <option value="clean_editorial_white">Clean Editorial Minimalist</option>
                <option value="cyberpunk_neon">Cyberpunk Neon Blueprint</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                Target Platform
              </label>
              <div className="flex gap-2">
                {[
                  { id: "linkedin", label: "LinkedIn (PDF)" },
                  { id: "instagram", label: "IG (4:5)" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetPlatform(item.id)}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                      targetPlatform === item.id
                        ? "border-teal-400 bg-teal-500/20 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-8 py-3.5 text-sm font-black text-obsidian-950 shadow-lg shadow-teal-500/25 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Generate Carousel Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </StudioSidebar>
  );
}

export default function CarouselCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 p-8 text-teal-400 font-mono">Loading Deck Studio...</div>}>
      <CarouselCreateContent />
    </Suspense>
  );
}
