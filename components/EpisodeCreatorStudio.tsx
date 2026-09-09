"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Clapperboard,
  Tv,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Layers,
  Shirt,
  Music,
  Volume2,
  ShieldCheck,
  Play,
  ArrowRight,
  Download,
  RefreshCw,
  AlertCircle,
  MapPin,
  Users,
  Compass,
  FileText,
  Sliders,
  Check
} from "lucide-react";
import type { LibraryCharacter, WardrobeVariant } from "@/lib/library/characterLibrary";
import type { EpisodeBlueprint, EpisodeAct, EpisodeChapter } from "@/lib/episode/types";

const DURATION_PRESETS = [
  { minutes: 10, sec: 600, label: "10 Min", acts: 2, chapters: 4, desc: "Quick Chapter Arc (2 Acts • 4 Reels)" },
  { minutes: 20, sec: 1200, label: "20 Min", acts: 4, chapters: 7, desc: "Mid-Form Story (4 Acts • 7 Reels)" },
  { minutes: 30, sec: 1800, label: "30 Min Standard", acts: 5, chapters: 10, desc: "Classical TV / Streaming Pilot (5 Acts • 10 Reels)", recommended: true },
  { minutes: 45, sec: 2700, label: "45 Min Special", acts: 5, chapters: 15, desc: "Extended Feature / Season Finale (5 Acts • 15 Reels)" }
];

const GENRES = [
  { id: "NORDIC_NOIR", label: "Nordic Noir", desc: "Cold atmospheric tension, muted palette, high-stakes psychological mystery" },
  { id: "CYBERPUNK_SCIFI", label: "Cyberpunk Sci-Fi", desc: "Neon illumination, high-tech dystopian intrigue, synth pulse" },
  { id: "CINEMATIC_DRAMA", label: "Cinematic Drama", desc: "Character-driven emotional beats, natural lighting, deep realism" },
  { id: "ACTION_THRILLER", label: "Action Thriller", desc: "Kinetic camera motion, ticking clock, relentless physical pacing" },
  { id: "ROMANTIC_MYSTERY", label: "Romantic Mystery", desc: "Warm cinematic glow, unspoken longing, dual character arcs" }
];

const QUICK_STARTERS = [
  {
    title: "Copenhagen Quantum Breach",
    topic: "Nordic Tech Espionage in Copenhagen: Freja Møller and Mikkel Lind uncover rogue quantum surveillance beneath the harbor.",
    genre: "NORDIC_NOIR",
    leadCharIds: ["freja_moller", "mikkel_lind"]
  },
  {
    title: "The Riviera Sunset Protocol",
    topic: "High-Stakes Mediterranean Espionage: Camille Dupont and Lucas Silva trace a stolen cryptography key from a luxury yacht gala to a coastal cliffside villa.",
    genre: "ACTION_THRILLER",
    leadCharIds: ["camille_dupont", "lucas_silva_br"]
  },
  {
    title: "Neo-Kyoto Midnight Paradox",
    topic: "Temporal Corporate Conspiracy: Kenji Sato investigates rogue synthetic memory leaks across neon rain-soaked alleyways and rooftop torii gardens.",
    genre: "CYBERPUNK_SCIFI",
    leadCharIds: ["kenji_sato_jp", "aoi_takahashi_jp"]
  }
];

const FEATURED_CHARACTERS: Array<{
  id: string;
  displayName: string;
  country: string;
  archetype: string;
  wardrobes: Array<{ label: string }>;
}> = [
  {
    id: "freja_moller",
    displayName: "Freja Møller",
    country: "Denmark",
    archetype: "Architect & Spatial Designer",
    wardrobes: [
      { label: "👟 Copenhagen Street" },
      { label: "👔 Office Tailored" },
      { label: "🏃 Fitness Gym" },
      { label: "🏊 Pool & Resort" },
      { label: "☕ Hygge Home" },
      { label: "🛒 Torvehallerne Market" }
    ]
  },
  {
    id: "mikkel_lind",
    displayName: "Mikkel Lind",
    country: "Denmark",
    archetype: "Sound Engineer & Tech Lead",
    wardrobes: [
      { label: "👟 Copenhagen Street" },
      { label: "👔 Office Business" },
      { label: "🏃 Fitness Gym" },
      { label: "🏊 Pool & Swim" },
      { label: "☕ Home Studio" },
      { label: "🛒 Street Casual" }
    ]
  },
  {
    id: "camille_dupont",
    displayName: "Camille Dupont",
    country: "France",
    archetype: "Investigative Journalist",
    wardrobes: [
      { label: "Trenchcoat & Silk Scarf" },
      { label: "Evening Gala Gown" },
      { label: "Casual Denim & Blazer" }
    ]
  },
  {
    id: "lucas_silva_br",
    displayName: "Lucas Silva",
    country: "Brazil",
    archetype: "Maritime Pilot & Navigator",
    wardrobes: [
      { label: "Linen Maritime Shirt" },
      { label: "Formal Coastal Suit" },
      { label: "Activewear" }
    ]
  },
  {
    id: "kenji_sato_jp",
    displayName: "Kenji Sato",
    country: "Japan",
    archetype: "Quantum Systems Architect",
    wardrobes: [
      { label: "Minimalist Black Kimono-Cut Blazer" },
      { label: "Raincoat & Tech Shell" },
      { label: "Laboratory Attire" }
    ]
  }
];

export function EpisodeCreatorStudio() {
  const [topic, setTopic] = useState("Nordic Tech Espionage in Copenhagen: Freja Møller and Mikkel Lind uncover rogue quantum surveillance beneath the harbor.");
  const [seriesTitle, setSeriesTitle] = useState("The Copenhagen Resonance");
  const [selectedDuration, setSelectedDuration] = useState(1800); // 30 mins
  const [customMinutes, setCustomMinutes] = useState(30);
  const [selectedGenre, setSelectedGenre] = useState("NORDIC_NOIR");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCastIds, setSelectedCastIds] = useState<string[]>(["freja_moller", "mikkel_lind"]);

  // Planning states
  const [isPlanning, setIsPlanning] = useState(false);
  const [planStage, setPlanStage] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<EpisodeBlueprint | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [activeActTab, setActiveActTab] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick Pick Cast Helpers
  const toggleCastSelection = (id: string) => {
    setSelectedCastIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(c => c !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4 leads
        return [...prev, id];
      }
    });
  };

  const handleCompile = async () => {
    if (!topic.trim()) {
      setPlanError("Please provide a series premise or story topic.");
      return;
    }

    setIsPlanning(true);
    setPlanError(null);
    setBlueprint(null);
    setSavedSuccess(false);

    const stages = [
      "Omni Showrunner: Grounding Lore & Global 30-Minute Narrative Arc...",
      "Omni Screenwriter: Partitioning 5 Classical Acts & 10 Chapter Reels...",
      "Omni Wardrobe Master: Scheduling Character Outfits & Scene Continuity...",
      "Omni Composer: Formulating Acoustic Leitmotif (D minor, -24.0 LUFS)..."
    ];

    let stageIdx = 0;
    setPlanStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setPlanStage(stages[stageIdx]);
      }
    }, 1800);

    try {
      const res = await fetch("/api/episodes/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          seriesTitle: seriesTitle.trim() || undefined,
          targetDurationSec: selectedDuration,
          genre: selectedGenre,
          language: selectedLanguage,
          leadCharacterIds: selectedCastIds
        })
      });

      clearInterval(interval);

      const data = await res.json();
      if (!data.success || !data.blueprint) {
        throw new Error(data.error || "Omni Showrunner was unable to formulate the episode blueprint.");
      }

      setBlueprint(data.blueprint);
      setActiveActTab(1);
    } catch (err: any) {
      clearInterval(interval);
      console.error("Episode planning failed:", err);
      setPlanError(err?.message || "Failed to direct episode. Please check Gemini API key or network.");
    } finally {
      setIsPlanning(false);
      setPlanStage(null);
    }
  };

  const handleSaveAndEnqueue = async () => {
    if (!blueprint) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to commit episode production");
      setSavedSuccess(true);
    } catch (err: any) {
      alert("Error committing episode: " + (err?.message || "unknown"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBible = () => {
    if (!blueprint) return;
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.seriesTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_s01e01_bible.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Curated Denmark & Lead Personas for Quick Pick
  const displayedChars = FEATURED_CHARACTERS;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col antialiased selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      {/* 1. STICKY FULL-WIDTH HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl tracking-tight group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-black font-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                Z
              </div>
              <span className="hidden xs:inline">Zyvoriq</span>
            </Link>

            <div className="h-5 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <Link href="/studio" className="hover:text-teal-400 transition-colors hidden md:inline">
                Omni Studio
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden md:inline" />
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-teal-400" />
                <span>Showrunner Episode Studio</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                10–45 Min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/my-reels"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/5 transition-colors min-h-[44px] flex items-center"
            >
              My Library
            </Link>
            <Link
              href="/studio"
              className="text-xs sm:text-sm font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3.5 sm:px-4 py-2 rounded-xl transition-all min-h-[44px] flex items-center gap-1.5"
            >
              <Clapperboard className="w-4 h-4" />
              <span className="hidden sm:inline">Single Reel Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO / CALLOUT BANNER */}
      <section className="relative pt-6 sm:pt-10 pb-8 border-b border-white/5 bg-gradient-to-b from-teal-950/20 via-[#07090E] to-[#07090E]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>95% Pre-Flight Preparation • Zero Markovian Drift • Full Act Continuity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Direct Combined Multi-Act Episodes <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">with Google Omni</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-4xl leading-relaxed">
            Eliminate reactive "match next reel to previous" drift. Google Omni acts as your complete series showrunner, pre-planning the entire 10–30+ minute narrative arc, 5-act beat sheet, character wardrobe schedule, and acoustic leitmotifs well in advance before a single frame is generated.
          </p>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE: SPLIT DESKTOP GRID */}
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT COLUMN: PRE-FLIGHT DIRECTORIAL CONTROLS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#0D111A] border border-white/10 p-5 sm:p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-400" />
                  <h2 className="font-bold text-base sm:text-lg text-white">Episode Directorial Specs</h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Season 1 • Ep 1</span>
              </div>

              {/* Creative Starters */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Series Concept Presets:</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_STARTERS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSeriesTitle(s.title);
                        setTopic(s.topic);
                        setSelectedGenre(s.genre);
                        setSelectedCastIds(s.leadCharIds);
                      }}
                      className="text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/40 transition-all text-xs group"
                    >
                      <div className="font-bold text-white group-hover:text-teal-300 transition-colors flex items-center justify-between">
                        <span>{s.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400">{s.genre}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.topic}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Series Title & Topic */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Series / Episode Title
                  </label>
                  <input
                    type="text"
                    value={seriesTitle}
                    onChange={(e) => setSeriesTitle(e.target.value)}
                    placeholder="e.g. The Copenhagen Resonance"
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base md:text-sm text-white focus:outline-none focus:border-teal-400 transition-colors min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Storyline & Thematic Concept (Prompt)
                  </label>
                  <textarea
                    rows={4}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe the overarching 30-minute narrative, character conflicts, key revelations, and locations..."
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-base md:text-sm text-white focus:outline-none focus:border-teal-400 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* DURATION SELECTOR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Episode Duration:</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-teal-300">
                    {Math.round(selectedDuration / 60)} Minutes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d.sec}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(d.sec);
                        setCustomMinutes(d.minutes);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-between ${
                        selectedDuration === d.sec
                          ? "bg-teal-500/20 border-teal-400/60 shadow-lg shadow-teal-950/40 text-white"
                          : "bg-black/30 border-white/5 hover:border-white/20 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-white">{d.label}</span>
                        {d.recommended && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-500 text-black">
                            Pilot
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{d.acts} Acts • {d.chapters} Chapters</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GENRE SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-teal-400" />
                  <span>Cinematic Genre:</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGenre(g.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedGenre === g.id
                          ? "bg-teal-500/15 border-teal-400/50 text-white"
                          : "bg-black/30 border-white/5 hover:border-white/15 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{g.label}</span>
                        {selectedGenre === g.id && <Check className="w-3.5 h-3.5 text-teal-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CAST & WARDROBE PRE-FLIGHT PICKER */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span>Lead Cast & Wardrobe Matrices:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{selectedCastIds.length} Selected (Max 4)</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {displayedChars.map((char) => {
                    const isSelected = selectedCastIds.includes(char.id);
                    return (
                      <div
                        key={char.id}
                        onClick={() => toggleCastSelection(char.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-teal-950/30 border-teal-500/60 ring-1 ring-teal-500/30 text-white"
                            : "bg-black/40 border-white/5 hover:border-white/20 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{char.country === "Denmark" ? "🇩🇰" : "🇫🇷"}</span>
                            <div>
                              <span className="font-bold text-xs text-white">{char.displayName}</span>
                              <span className="text-[10px] text-slate-400 ml-2">({char.archetype})</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? "bg-teal-500 border-teal-400 text-black" : "border-white/20"}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Available Wardrobe Pills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {char.wardrobes.map((w: { label: string }) => (
                            <span key={w.label} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                              {w.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION: COMPILE WITH OMNI */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isPlanning}
                  onClick={handleCompile}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-obsidian-950 font-black text-sm tracking-wide shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 hover:scale-[1.01]"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>{planStage || "Omni Showrunner Directing..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black fill-current" />
                      <span>Direct {Math.round(selectedDuration / 60)}-Min Episode with Omni</span>
                    </>
                  )}
                </button>
              </div>

              {planError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{planError}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PRE-FLIGHT MASTER BLUEPRINT & CHAPTER INSPECTOR (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {!blueprint ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0A0D14]/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-950/40">
                  <Clapperboard className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="font-bold text-lg text-white">Pre-Flight Screenplay & Storyboard</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Select your duration (e.g. 30 Min) and click <strong className="text-teal-300">"Direct Episode with Omni"</strong> to inspect the complete 5-act beat sheet, chapter reels, dialogue script, and character wardrobe timeline before rendering.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 5 Classical Acts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 10 Chapter Reels</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Wardrobe Continuity</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* BLUEPRINT SUMMARY HERO CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0E1422] to-[#0A0D15] border border-teal-500/40 p-5 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          S{blueprint.seasonNumber} • E{blueprint.episodeNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{blueprint.genre}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{blueprint.episodeTitle}</h2>
                      <p className="text-xs text-teal-300 font-medium">Series: {blueprint.seriesTitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadBible}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 min-h-[40px]"
                        title="Download complete JSON production bible"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Bible</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{blueprint.logline}"
                  </p>

                  {/* Acoustic Leitmotif Bar */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Music className="w-4 h-4 text-teal-400" />
                      <span className="font-bold text-white">Leitmotif:</span>
                      <span>Key of {blueprint.scoreLeitmotif?.musicalKey || "D minor"}</span>
                      <span>•</span>
                      <span>{blueprint.scoreLeitmotif?.tempoBpm || 92} BPM</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Mix Target: -24.0 LUFS Broadcast Standard
                    </div>
                  </div>
                </div>

                {/* ACT NAVIGATION TABS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-400" />
                      <span>Theatrical Acts ({blueprint.acts.length} Acts • {blueprint.totalChapters} Chapters):</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {blueprint.acts.map((act) => (
                      <button
                        key={act.actNumber}
                        type="button"
                        onClick={() => setActiveActTab(act.actNumber)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[44px] flex items-center gap-2 ${
                          activeActTab === act.actNumber
                            ? "bg-teal-500 text-[#07090E] shadow-lg shadow-teal-500/25"
                            : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        <span>Act {act.actNumber}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeActTab === act.actNumber ? "bg-black/20 text-black" : "bg-white/10 text-slate-400"}`}>
                          {act.chapters?.length || 0} Reels
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHAPTERS OF ACTIVE ACT */}
                {(() => {
                  const activeAct = blueprint.acts.find(a => a.actNumber === activeActTab) || blueprint.acts[0];
                  if (!activeAct) return null;

                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white">{activeAct.actName}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{activeAct.dramaticObjective}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-teal-300 font-bold">
                            Tension: {activeAct.narrativeTensionLevel}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {activeAct.chapters?.map((ch: EpisodeChapter) => (
                          <div
                            key={ch.chapterNumber}
                            className="rounded-xl bg-[#0D111A] border border-white/10 p-5 space-y-3.5 hover:border-teal-500/30 transition-all shadow-md"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                                  Chapter {ch.chapterNumber}
                                </span>
                                <h5 className="font-bold text-sm text-white">{ch.chapterTitle}</h5>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                <Clock className="w-3.5 h-3.5 text-teal-400" />
                                <span>{ch.durationSec}s (~3m Reel)</span>
                              </div>
                            </div>

                            {/* Location & Wardrobe Schedule */}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1 rounded-md">
                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                <span className="font-medium">{ch.locationName}</span>
                              </div>

                              {ch.charactersOnScreen?.map((char, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 text-slate-300 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
                                  <Shirt className="w-3.5 h-3.5 text-teal-400" />
                                  <span className="font-bold text-white">{char.name}:</span>
                                  <span className="text-teal-300 font-mono">{char.wardrobePill || char.wardrobeLabel}</span>
                                </div>
                              ))}
                            </div>

                            {/* Dramatic Beat & Visual Direction */}
                            <div className="space-y-1.5 text-xs text-slate-300">
                              <p><strong className="text-white">Dramatic Beat:</strong> {ch.dramaticBeat}</p>
                              <p className="text-slate-400"><strong className="text-slate-300">Camera & Lighting:</strong> {ch.visualDirection} ({ch.cameraMovement})</p>
                            </div>

                            {/* Dialogue Excerpts */}
                            {ch.dialogueExcerpts && ch.dialogueExcerpts.length > 0 && (
                              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Screenplay Dialogue:</span>
                                {ch.dialogueExcerpts.map((d, dIdx) => (
                                  <div key={dIdx} className="text-slate-200">
                                    <span className="font-bold text-teal-300 uppercase">{d.speaker}: </span>
                                    <span className="italic">"{d.text}"</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* CHARACTER WARDROBE TIMELINE TABLE (ZERO AMNESIA PROOF) */}
                {blueprint.wardrobeSchedule && blueprint.wardrobeSchedule.length > 0 && (
                  <div className="rounded-xl bg-[#0D111A] border border-white/10 p-5 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-teal-400" />
                      <span>Character Wardrobe Timeline (Zero-Amnesia Schedule)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-mono">
                            <th className="py-2 pr-4">Character</th>
                            <th className="py-2 pr-4">Act / Chapter</th>
                            <th className="py-2 pr-4">Setting Context</th>
                            <th className="py-2 pr-4">Costume / Wardrobe</th>
                            <th className="py-2">Justification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {blueprint.wardrobeSchedule.map((charSched) =>
                            charSched.wardrobes?.map((w, wIdx) => (
                              <tr key={`${charSched.characterId}_${wIdx}`} className="hover:bg-white/5">
                                <td className="py-2.5 pr-4 font-bold text-white whitespace-nowrap">{charSched.characterName}</td>
                                <td className="py-2.5 pr-4 font-mono text-teal-300 whitespace-nowrap">Act {w.actNumber} • Ch {w.chapterNumber}</td>
                                <td className="py-2.5 pr-4 uppercase text-[10px] font-mono text-slate-400">{w.settingContext}</td>
                                <td className="py-2.5 pr-4 text-white font-medium">{w.wardrobeLabel}</td>
                                <td className="py-2.5 text-slate-400 text-[11px]">{w.justification}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* COMMIT & EXECUTION BAR */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-obsidian-950 border border-teal-500/50 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-teal-950/40">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Master Episode Blueprint Validated</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ready to execute 10 Chapter Reels and stitch continuous 30-Minute 4K master.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveAndEnqueue}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-[#07090E] font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 min-h-[44px]"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>Committing to Database...</span>
                        </>
                      ) : savedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-black stroke-[3]" />
                          <span>Saved to Library!</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-black fill-current" />
                          <span>Commit & Begin Master Production</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
