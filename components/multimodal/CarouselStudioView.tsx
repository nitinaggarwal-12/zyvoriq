"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Download,
  Sliders,
  Share2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check
} from "lucide-react";
import {
  generateCarouselDeck,
  CarouselDeck,
  CarouselFormat,
  SlideThemeId,
  SLIDE_THEMES
} from "@/lib/multimodal/carouselEngine";

interface CarouselStudioViewProps {
  initialTopic: string;
}

export function CarouselStudioView({ initialTopic }: CarouselStudioViewProps) {
  const [topic, setTopic] = useState(initialTopic || "3 Habits Quietly Killing Your Focus");
  const [format, setFormat] = useState<CarouselFormat>("4:5_portrait");
  const [theme, setTheme] = useState<SlideThemeId>("cyber_dark");
  const [deck, setDeck] = useState<CarouselDeck>(() => generateCarouselDeck(topic, format, theme));
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const handleGenerate = () => {
    setDeck(generateCarouselDeck(topic, format, theme));
    setActiveSlideIdx(0);
  };

  const handleThemeChange = (newTheme: SlideThemeId) => {
    setTheme(newTheme);
    setDeck(prev => ({ ...prev, theme: newTheme }));
  };

  const currentSlide = deck.slides[activeSlideIdx];
  const activeTheme = SLIDE_THEMES[theme];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Sidebar Controls */}
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Deck Controls</div>
          <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">Carousel Engine</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">CAROUSEL TOPIC</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3.5 text-sm text-white outline-none focus:border-pink-300/40"
            placeholder="What is the carousel about?"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">ASPECT RATIO / FORMAT</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as CarouselFormat)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="4:5_portrait">4:5 Portrait (LinkedIn & Instagram Classic)</option>
            <option value="1:1_square">1:1 Square (Feed Carousel)</option>
            <option value="16:9_widescreen">16:9 Widescreen (Presentation Deck)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">VISUAL THEME</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(SLIDE_THEMES) as SlideThemeId[]).map((tKey) => (
              <button
                key={tKey}
                onClick={() => handleThemeChange(tKey)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition ${theme === tKey ? "border-pink-500 bg-pink-500/20 text-white" : "border-white/5 bg-white/[0.03] text-slate-400 hover:text-white"}`}
              >
                <span>{SLIDE_THEMES[tKey].name}</span>
                {theme === tKey && <Check className="h-3.5 w-3.5 text-pink-400" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
        >
          <Sparkles className="h-4 w-4" /> Re-Generate 6-Card Deck
        </button>

        <button
          onClick={() => alert("Exporting 6-Card Carousel as Multi-Page PDF...")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-pink-500/10 py-3.5 text-sm font-black text-pink-200 transition hover:bg-pink-500/20"
        >
          <Download className="h-4 w-4" /> Export as LinkedIn PDF
        </button>
      </aside>

      {/* Main Slide Card Canvas */}
      <section className="space-y-6">
        {/* Spotlight Active Slide */}
        <div className="flex flex-col items-center">
          <div className={`relative flex w-full max-w-[480px] flex-col justify-between rounded-[32px] border border-white/20 bg-gradient-to-b ${activeTheme.bgGradient} p-8 shadow-2xl ${format === "4:5_portrait" ? "aspect-[4/5]" : format === "16:9_widescreen" ? "aspect-[16/9]" : "aspect-square"}`}>
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeTheme.accentColor}`}>
                  {currentSlide.eyebrow}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                  {activeSlideIdx + 1} / {deck.slides.length}
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-black leading-tight text-white">
                {currentSlide.headline}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {currentSlide.bodyText}
              </p>

              {currentSlide.statNumber && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className={`text-3xl font-black ${activeTheme.accentColor}`}>
                    {currentSlide.statNumber}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{currentSlide.statLabel}</div>
                </div>
              )}

              {currentSlide.bullets && (
                <ul className="mt-5 space-y-2 text-xs text-slate-300">
                  {currentSlide.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={activeTheme.accentColor}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] font-bold text-slate-500">@zyvoriq · AI Studio</span>
              {currentSlide.badge && (
                <span className="rounded-lg border border-pink-500/30 bg-pink-500/20 px-2.5 py-1 text-[10px] font-bold text-pink-300">
                  {currentSlide.badge}
                </span>
              )}
            </div>
          </div>

          {/* Slide Navigation Controllers */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
              disabled={activeSlideIdx === 0}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {deck.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`h-2 rounded-full transition-all ${activeSlideIdx === idx ? "w-6 bg-pink-500" : "w-2 bg-white/20"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlideIdx(Math.min(deck.slides.length - 1, activeSlideIdx + 1))}
              disabled={activeSlideIdx === deck.slides.length - 1}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Multi-Card Grid Strip */}
        <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">All 6 Slides In Sequence</div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {deck.slides.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIdx(i)}
                className={`cursor-pointer rounded-xl border p-3 transition ${activeSlideIdx === i ? "border-pink-500 bg-pink-500/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"}`}
              >
                <div className="text-[10px] font-black text-pink-400">#{i + 1} {s.eyebrow}</div>
                <div className="mt-1 line-clamp-2 text-[11px] font-bold text-white">{s.headline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
