"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Zap,
  ArrowLeft,
  Layers,
  Palette,
  Loader2,
  Lightbulb,
  FileImage,
  ShieldCheck,
  Flame,
  Swords,
  Smile
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

function ComicsCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [panelLayout, setPanelLayout] = useState("4_panel_manga");
  const [artStyle, setArtStyle] = useState("classic_manga_ink");
  const [sfxStyle, setSfxStyle] = useState("japanese_sfx");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setTopic(q);
    }
  }, [searchParams]);

  const handleSurprisePrompt = (type: "shonen" | "comedy" | "western") => {
    if (type === "shonen") {
      setTopic("An intense 4-panel Shōnen manga battle where Apprentice Aoi unleashes a forbidden lightning strike against the Shadow Master on a stormy temple rooftop");
      setArtStyle("classic_manga_ink");
      setPanelLayout("4_panel_manga");
      setSfxStyle("japanese_sfx");
    } else if (type === "comedy") {
      setTopic("A 4-Koma comedic manga strip about a legendary demon overlord trying to work part-time at a Tokyo ramen shop and getting intimidated by the head chef");
      setArtStyle("classic_manga_ink");
      setPanelLayout("4_panel_manga");
      setSfxStyle("japanese_sfx");
    } else {
      setTopic("A gritty American graphic novel double-page splash where a cybernetic detective investigates a glowing holographic crime scene in rain-slicked Neo-Chicago");
      setArtStyle("western_comic_noir");
      setPanelLayout("graphic_splash");
      setSfxStyle("western_sfx");
    }
  };

  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    router.push(`/studio?mode=carousel&topic=${encodeURIComponent(topic)}&style=${artStyle}&layout=${panelLayout}&sfx=${sfxStyle}`);
  };

  const [activeTab, setActiveTab] = useState<"video" | "panels" | "audio">("video");

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-7xl w-full max-w-full overflow-x-hidden mx-auto px-5 py-8 md:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-mono">
            <Link href="/studio" className="text-slate-400 hover:text-white transition">
              Studio
            </Link>
            <span className="text-slate-600">/</span>
            <Link href="/studio/create" className="text-slate-400 hover:text-white transition">
              Create Hub
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">Shōnen Anime & Manga</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 font-mono">
              <ShieldCheck className="w-3 h-3" /> 100% ORIGINAL ASSETS
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-300 font-mono">
              ⚡ PERSONA #2: SHONEN ANIME & MANGA
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Shōnen Anime & Manga Creation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            24fps cell-shaded anime combat, dynamic speedlines, Japanese sound effects (SFX), and multi-panel manga storyboards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            id="tab-btn-video"
            type="button"
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "video" ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> ⚔️ Anime Combat Master Reel
          </button>
          <button
            id="tab-btn-manuscript"
            type="button"
            onClick={() => setActiveTab("panels")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "panels" ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 📖 4-Koma Manga Panels
          </button>
          <button
            id="tab-btn-acoustics"
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "audio" ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30" : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> 🎸 J-Rock & SFX Mixer
          </button>
        </div>

        {activeTab === "video" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-amber-500/30 bg-black/80 overflow-hidden shadow-2xl relative aspect-video flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
                <Zap className="w-8 h-8 animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md mb-3">
                ANIME DIFFUSION STAGE · AWAITING SYNTHESIS
              </div>
              <h3 className="text-base font-bold text-white max-w-md mb-2">
                Ufotable Cel-Shaded Action Engine
              </h3>
              <p className="text-xs text-slate-400 max-w-sm font-mono">
                No mock playback. Select a prompt preset below or enter a scene description to synthesize authentic 24fps anime animation.
              </p>
              <div className="absolute top-4 left-4 rounded-full border border-amber-500/40 bg-black/70 px-3 py-1 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md">
                1080p60 · UFOTABLE DYNAMIC CEL · READY
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 font-mono">
                  Anime Reel Telemetry
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Frame Rate</span>
                    <span className="font-mono text-white font-bold">24fps Kinematic</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Spark Density</span>
                    <span className="font-mono text-amber-400 font-bold">Ufotable Grade (0.92)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Voice Matrix</span>
                    <span className="font-mono text-cyan-300 font-bold">Ren Sensei & Aoi Duo</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                    <span>Onomatopoeia</span>
                    <span className="font-mono text-white font-bold">Kanji Impact Katakana</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  ⚡ Synthesize Shōnen Reel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "panels" && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">PANEL 1: THE TEMPLE ROOF</div>
              <p className="text-xs text-slate-300">Rain pelts down on ancient cedar tiles as thunder illuminates two silhouetted duelists.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">PANEL 2: BLADE DRAW</div>
              <p className="text-xs text-slate-300">Aoi’s golden katana sparks with blue lightning arc particles [SFX: ズバッ!].</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">PANEL 3: CLASH AT SPEED</div>
              <p className="text-xs text-slate-300">Extreme radial speedlines focus on the blade lock, shattering rainwater into glowing steam.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400">PANEL 4: AFTERMATH</div>
              <p className="text-xs text-slate-300">Ren smiles in recognition: &quot;Your form has sharpened, Apprentice.&quot;</p>
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
            <h3 className="text-sm font-black text-amber-300 font-mono">High-Octane J-Rock & Battle SFX Stem</h3>
            <p className="text-xs text-slate-400">Distorted 8-string electric guitar riffs, thunder claps, and sword resonance at 24-bit 48kHz.</p>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 w-4/5 animate-pulse" />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Storyline & Dialogue Concept
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSurprisePrompt("shonen")}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" /> ⚔️ Shōnen Duel
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("comedy")}
                className="inline-flex items-center gap-1 text-xs font-bold text-pink-300 hover:text-pink-200 transition bg-pink-400/10 border border-pink-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Smile className="w-3.5 h-3.5" /> 😂 4-Koma Comedy
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("western")}
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-sky-200 transition bg-sky-400/10 border border-sky-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> 🦸 Hero Splash
              </button>
            </div>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            placeholder="Describe your manga or comic plot (e.g. 'An intense 4-panel Shonen manga battle where Apprentice Aoi unleashes a forbidden lightning strike against the Shadow Master on a stormy temple rooftop')..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-4 text-base md:text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Panel Layout
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "4_panel_manga", label: "4-Koma Manga Grid" },
                { id: "webtoon_vertical", label: "Webtoon Vertical Scroll" },
                { id: "graphic_splash", label: "Hero Action Splash Page" },
              ].map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setPanelLayout(layout.id)}
                  className={`rounded-xl border py-2.5 px-3 text-xs font-bold text-left transition cursor-pointer ${
                    panelLayout === layout.id
                      ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-md shadow-amber-500/20"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Art & Inking Style
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-amber-400"
            >
              <option value="classic_manga_ink">🖋️ Classic Shōnen Inking (Screentones & Shadows)</option>
              <option value="modern_webtoon_color">🎨 Full-Color Webtoon (Digital Cel Paint)</option>
              <option value="western_comic_noir">🦇 Graphic Novel Noir (Heavy Chiaroscuro Inks)</option>
              <option value="amar_chitra_katha">🏛️ Classical Heritage Inking (Mythology Art)</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
              Sound Effects & SFX Style
            </label>
            <select
              value={sfxStyle}
              onChange={(e) => setSfxStyle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-amber-400"
            >
              <option value="japanese_sfx">💥 Japanese Sound Effects ([ドドド], [ゴゴゴ], [ズバッ])</option>
              <option value="western_sfx">⚡ American Comic SFX ([BOOM!], [SLASH!], [CRACK!])</option>
              <option value="subtle_sfx">🤫 Minimalist Dialogue Only (Clean Panels)</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 py-4 text-sm font-black text-obsidian-950 shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-orange-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-obsidian-950" />
              <span>Generating Illustrated Panels & Speech Bubbles...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>📚 Generate Comic Panels</span>
            </>
          )}
        </button>
      </main>
    </StudioSidebar>
  );
}

export default function ComicsCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 text-slate-400 p-8">Loading Manga Studio...</div>}>
      <ComicsCreateContent />
    </Suspense>
  );
}
