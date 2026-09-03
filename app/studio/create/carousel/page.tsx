"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AppNavbar } from "@/components/AppNavbar";

export default function CarouselCreatePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState("dark_glassmorphic");
  const [targetPlatform, setTargetPlatform] = useState("linkedin");
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-teal-500/30">
      <AppNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8 md:px-8 space-y-6">
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
          <p className="text-sm text-slate-400 mt-1">
            Generate high-retention swipeable slide cards for LinkedIn and Instagram with automated typography and vector export.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Carousel Topic or Educational Framework
            </label>
            <button
              type="button"
              onClick={handleSurprisePrompt}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 rounded-lg"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Surprise Idea
            </button>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            placeholder="What should the carousel teach or break down? (e.g. '7 cognitive biases that secretly control your everyday buying decisions')..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-4 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Slide Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 7, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSlideCount(cnt)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                    slideCount === cnt
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                  }`}
                >
                  {cnt} Slides
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Visual Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "dark_glassmorphic", label: "Dark Glassmorphism" },
                { id: "minimal_swiss", label: "Minimalist Swiss" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setTheme(st.id)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                    theme === st.id
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 py-4 text-sm font-black text-obsidian-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-300 hover:to-cyan-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-obsidian-950" />
              <span>Generating Carousel Slides & Vector Layouts...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>📊 Generate Carousel Deck</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
