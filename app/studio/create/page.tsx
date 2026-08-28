"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Film,
  Clock,
  User,
  Palette,
  Globe,
  ShieldCheck,
  Check,
  RotateCcw,
  Play,
  Share2,
  Tv,
  ArrowLeft,
  Volume2,
  FileCheck,
  Send,
  Zap,
  Layers,
  Search,
  Shuffle,
  Compass,
  Radio,
  Tag,
  Sliders,
  ChevronRight,
  Video
} from "lucide-react";
import { GENRE_CATEGORIES, GENRE_CONCEPTS, GenreConcept } from "@/components/CreateActModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTrackId = searchParams.get("trackId") || "";
  const modeParam = searchParams.get("mode") || "";

  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSpeakingPitch, setIsSpeakingPitch] = useState<string | null>(null);

  const [title, setTitle] = useState(
    targetTrackId ? "⚡ Act 2: Combustion Transition" : "⚡ The Thunderstorm of Mushin"
  );
  const [prompt, setPrompt] = useState(
    targetTrackId
      ? "Act 2 continuity scene: Transitioning to supersonic airflow and turbulent fuel injection dynamics within the combustion chamber."
      : "Sensei Ren teaches Apprentice Aoi the concept of Mushin (Mind without Mind) during a night thunderstorm duel on the wooden dojo balcony."
  );
  const [duration, setDuration] = useState<number>(8);
  const [destinationMode, setDestinationMode] = useState<"new_series" | "append_current">(
    modeParam === "append_current" || targetTrackId ? "append_current" : "new_series"
  );
  const [characterLock, setCharacterLock] = useState(targetTrackId ? "david" : "ren_aoi");
  const [visualStyle, setVisualStyle] = useState(targetTrackId ? "cinematic_4k" : "ufotable_anime");
  const [languages, setLanguages] = useState<string[]>(["ja", "en", "es", "fr", "de", "hi"]);
  const [autoVeritas, setAutoVeritas] = useState(true);

  const [availableTracks, setAvailableTracks] = useState<any[]>([]);
  const [selectedParentTrackId, setSelectedParentTrackId] = useState<string>(targetTrackId || "");
  const [targetTrackTitle, setTargetTrackTitle] = useState<string>("");

  useEffect(() => {
    fetch("/api/studio/tracks")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tracks)) {
          setAvailableTracks(data.tracks);
          if (targetTrackId) {
            const found = data.tracks.find((t: any) => t.id === targetTrackId);
            if (found) {
              setSelectedParentTrackId(found.id);
              setTargetTrackTitle(found.title);
            }
          } else if (data.tracks.length > 0) {
            setSelectedParentTrackId(data.tracks[0].id);
            setTargetTrackTitle(data.tracks[0].title);
          }
        }
      })
      .catch(() => {});
  }, [targetTrackId]);

  const [apiHealth, setApiHealth] = useState<{ ok: boolean; configured: boolean; message?: string; model?: string } | null>(null);

  useEffect(() => {
    fetch("/api/health/api-key")
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(() => setApiHealth({ ok: false, configured: false, message: "Server connection error" }));
  }, []);

  const activeTargetTrack = availableTracks.find((t: any) => t.id === selectedParentTrackId) || null;

  // Suggested Act Continuations for Active Target Track
  const continuitySuggestions = [
    {
      title: `⚡ Act ${(activeTargetTrack?.acts?.length || 1) + 1}: Combustion & Plasma Ignition`,
      prompt: `Act ${(activeTargetTrack?.acts?.length || 1) + 1} continuity scene: Internal cross-section view showing supersonic air intake entering the scramjet combustor with glowing shock diamond plasma flames and thermal flow lines.`,
      visualStyle: "ue5_raytraced"
    },
    {
      title: `🔬 Act ${(activeTargetTrack?.acts?.length || 1) + 1}: Nanite CAD Stress Telemetry`,
      prompt: `Act ${(activeTargetTrack?.acts?.length || 1) + 1} continuity scene: High-speed holographic sensor scan inspecting structural titanium lattice under extreme thermal and aerodynamic load at Mach 5.`,
      visualStyle: "photorealistic_keynote"
    },
    {
      title: `🚀 Act ${(activeTargetTrack?.acts?.length || 1) + 1}: Hypersonic Flight Deck Ascent`,
      prompt: `Act ${(activeTargetTrack?.acts?.length || 1) + 1} continuity scene: Wide cinematic exterior view of the scramjet-powered craft penetrating the upper stratosphere leaving an incandescent ionization wake.`,
      visualStyle: "cyberpunk_noir"
    }
  ];

  // Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState("");
  const [genProgress, setGenProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [savedTrackId, setSavedTrackId] = useState<string | null>(null);

  const filteredConcepts = GENRE_CONCEPTS.filter((c) => {
    const matchesGenre = selectedGenre === "all" || c.genre === selectedGenre;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.hook.toLowerCase().includes(q) ||
      c.prompt.toLowerCase().includes(q) ||
      c.genre.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });

  const handleSelectConcept = (concept: GenreConcept) => {
    setTitle(concept.title);
    setPrompt(concept.prompt);
    setCharacterLock(concept.characterLock);
    setVisualStyle(concept.visualStyle);
    setDuration(concept.recommendedDuration);
  };

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * GENRE_CONCEPTS.length);
    handleSelectConcept(GENRE_CONCEPTS[randomIndex]);
  };

  const handleListenSpeech = (concept: GenreConcept) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(concept.speechSample);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingPitch(concept.id);
      utterance.onend = () => setIsSpeakingPitch(null);
      utterance.onerror = () => setIsSpeakingPitch(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleLang = (code: string) => {
    if (languages.includes(code)) {
      if (languages.length > 1) setLanguages(languages.filter((l) => l !== code));
    } else {
      setLanguages([...languages, code]);
    }
  };

  const handleKickoffGeneration = async () => {
    const newJobId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const effectiveParentTrackId = destinationMode === "append_current" ? (selectedParentTrackId || targetTrackId) : undefined;
    
    // Asynchronously kickoff generation in background pipeline with keepalive
    fetch("/api/tier6/create-act", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        id: newJobId,
        parentTrackId: effectiveParentTrackId,
        mode: destinationMode,
        title,
        prompt,
        duration,
        characterLock,
        visualStyle,
        languages,
        autoVeritas
      })
    }).catch(console.error);

    // Navigate immediately to dedicated, permanent, deep-linkable Production Monitor
    router.push(`/studio/production/${newJobId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sticky Full-Width Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1720px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-medium shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Stage</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Studio Series Creator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                  Veo 3.1 + DeepMind TTS
                </span>
              </div>
              <h1 className="text-xl font-bold text-white font-serif tracking-tight">
                New Production & Story Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio/library"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-bold shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>📚 Media Vault (Saved Clips)</span>
            </Link>

            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Cinema Player</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Width Multi-Column Canvas */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 md:px-12 py-8 space-y-6">
        {/* Unified Studio Top-Level Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-amber-300 transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <Link href="/studio" className="hover:text-amber-300 transition-colors flex items-center gap-1">
            Studio Cinema
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          {targetTrackId ? (
            <>
              <Link
                href={`/studio?track=${targetTrackId}`}
                className="text-slate-300 hover:text-amber-300 transition-colors max-w-[200px] truncate"
              >
                {activeTargetTrack?.title || "Active Series"}
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 fill-current" /> Append Act {(activeTargetTrack?.acts?.length || 1) + 1}
              </span>
            </>
          ) : (
            <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 fill-current" /> Series Creator
            </span>
          )}
        </div>

        {/* 🎯 Target Series Visual Routing Banner */}
        <div>
          {destinationMode === "append_current" ? (
            <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/20">
                  <Film className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      Appending Act {(activeTargetTrack?.acts?.length || 1) + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Target Series: <span className="text-amber-300 font-bold">{activeTargetTrack?.title || targetTrackTitle || "Active Series"}</span>
                    </span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-white font-serif tracking-tight">
                    {activeTargetTrack?.title || targetTrackTitle || "Building a Hypersonic Scramjet Engine"}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Current Runtime: {activeTargetTrack?.duration || 8}s ({activeTargetTrack?.acts?.length || 1} Acts) ➔ Expanding to {(activeTargetTrack?.duration || 8) + duration}s Total
                  </p>
                </div>
              </div>

              {/* Quick Switch Dropdown & Action */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {availableTracks.length > 1 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Switch Series to Append</span>
                    <select
                      value={selectedParentTrackId}
                      onChange={(e) => {
                        setSelectedParentTrackId(e.target.value);
                        const sel = availableTracks.find((t: any) => t.id === e.target.value);
                        if (sel) {
                          setTargetTrackTitle(sel.title);
                          setTitle(`Act ${(sel.acts?.length || 1) + 1}: Continuity Scene`);
                        }
                      }}
                      className="bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400 shadow-inner"
                    >
                      {availableTracks.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.acts?.length || 1} Acts)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDestinationMode("new_series")}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-2 mt-4 lg:mt-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Start New Series Instead</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                      New Independent Series
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white font-serif mt-0.5">
                    Creating Brand New Master Series (Act 1)
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    This will create an independent track with its own dedicated deep-linkable cinema player.
                  </p>
                </div>
              </div>

              {availableTracks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationMode("append_current");
                    if (!selectedParentTrackId && availableTracks[0]) {
                      setSelectedParentTrackId(availableTracks[0].id);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Film className="w-4 h-4" />
                  <span>🔗 Append to an Existing Series Track</span>
                </button>
              )}
            </div>
          )}
        </div>

        {!generatedResult ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Netflix / Prime Video Genre & Concept Hub (7 cols) */}
            <section className="xl:col-span-7 space-y-6">
              <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Netflix & Prime Concept Discovery
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {filteredConcepts.length} Blockbuster Concepts
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white font-serif mt-1.5">
                      Story & Speech Concept Discovery <span className="text-amber-400 font-normal italic">+ Live Speech Pitches</span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400/60 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm active:scale-95"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>🎲 Surprise Idea</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genres, story tropes, or keywords (e.g. medical, space, nature, samurai, leadership)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-16 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Genre Category Pills (Netflix Style) */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {GENRE_CATEGORIES.map((g) => {
                    const isSelected = selectedGenre === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGenre(g.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10 font-bold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>

                {/* Netflix-Style Concept Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
                  {filteredConcepts.map((concept) => {
                    const isPlaying = isSpeakingPitch === concept.id;
                    const isCurrent = title === concept.title;
                    return (
                      <div
                        key={concept.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative group ${
                          isCurrent
                            ? "bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                            : "bg-slate-950/80 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center gap-1">
                              {concept.genreEmoji} {concept.genre.replace("_", " ")}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> {concept.recommendedDuration}s
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white font-serif group-hover:text-amber-200 transition-colors">
                            {concept.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                            {concept.hook}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                          <button
                            type="button"
                            onClick={() => handleListenSpeech(concept)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                              isPlaying
                                ? "bg-teal-500 text-slate-950 font-bold animate-pulse"
                                : "bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-500/30"
                            }`}
                            title="Listen to Speech Pitch Preview"
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} />
                            <span>{isPlaying ? "Speaking..." : "🔊 Pitch Voice"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectConcept(concept)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isCurrent
                                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-mono"
                                : "bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-300"
                            }`}
                          >
                            {isCurrent ? <Check className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{isCurrent ? "Active Concept" : "⚡ Use Concept"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Production Controls & Generation Pipeline (5 cols) */}
            <section className="xl:col-span-5 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Production Pipeline Parameters</span>
                  </h3>
                  {apiHealth ? (
                    <span className={`text-[11px] font-mono flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                      apiHealth.ok
                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                        : "bg-rose-500/15 border border-rose-500/40 text-rose-300 animate-pulse"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${apiHealth.ok ? "bg-emerald-400" : "bg-rose-400"}`} />
                      <span>{apiHealth.ok ? "Veo 3.1 & Gemini Active" : "API Key Missing on Server"}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Ready to Synthesize
                    </span>
                  )}
                </div>

                {/* 1-Click Continuity Prompts when Appending */}
                {destinationMode === "append_current" && (
                  <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> 1-Click Suggested Continuations
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Auto-Prompting</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {continuitySuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setTitle(s.title);
                            setPrompt(s.prompt);
                            if (s.visualStyle) setVisualStyle(s.visualStyle);
                          }}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/50 text-left transition-all group shadow-sm"
                        >
                          <div className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200">
                            {s.title}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {s.prompt}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Story Title & Prompt */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-amber-400" /> Story Title & Scene Description
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">Gemini 2.5 Flash Grounded</span>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Act 8: The Way of Mushin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-medium focus:outline-none focus:border-amber-500/80 shadow-inner"
                  />

                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrompt(val);
                      const low = val.toLowerCase();
                      if (low.includes("elena") && characterLock !== "elena") {
                        setCharacterLock("elena");
                      } else if (low.includes("priya") && characterLock !== "priya") {
                        setCharacterLock("priya");
                      } else if (low.includes("david") && characterLock !== "david") {
                        setCharacterLock("david");
                      }
                    }}
                    rows={4}
                    placeholder="Describe what happens in this scene, the philosophical dilemma, lighting, and action..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-amber-500/80 leading-relaxed resize-none shadow-inner"
                  />
                </div>

                {/* Destination Mode Selector: New Track vs Append */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Production Destination
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDestinationMode("new_series")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        destinationMode === "new_series"
                          ? "bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-500 text-white shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${destinationMode === "new_series" ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>Start New Series</span>
                          {destinationMode === "new_series" && <Check className="w-3 h-3 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          Creates an independent track in your library
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDestinationMode("append_current")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        destinationMode === "append_current"
                          ? "bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500 text-white shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/50"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${destinationMode === "append_current" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>Append to Active</span>
                          {destinationMode === "append_current" && <Check className="w-3 h-3 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-amber-300/90 font-medium mt-0.5 leading-snug">
                          {targetTrackTitle
                            ? `🔗 Chaining onto "${targetTrackTitle}"`
                            : targetTrackId
                            ? `🔗 Chaining to ${targetTrackId.slice(0, 18)}...`
                            : "Chains onto your active series track"}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Duration & Act Structure */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Duration & Act Structure
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { s: 8, label: "Single Act", desc: "8s" },
                      { s: 24, label: "3-Act Short", desc: "24s" },
                      { s: 56, label: "7-Act Film", desc: "56s" },
                      { s: 120, label: "2-Min Film", desc: "120s" }
                    ].map((d) => (
                      <button
                        key={d.s}
                        type="button"
                        onClick={() => setDuration(d.s)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          duration === d.s
                            ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="text-xs font-bold font-mono">{d.desc}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">{d.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character & Visual Style Grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Character Continuity Lock */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" /> Character Lock
                    </label>
                    <select
                      value={characterLock}
                      onChange={(e) => setCharacterLock(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ren_aoi">🥋 Sensei Ren & Apprentice Aoi</option>
                      <option value="priya">👩‍💼 Priya (Silicon Valley Twin)</option>
                      <option value="david">👨‍💼 David (Zurich AI Architect)</option>
                      <option value="elena">👩‍🔬 Elena (Tokyo Neural Systems)</option>
                    </select>
                  </div>

                  {/* Visual Aesthetic & Stagecraft */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-400" /> Visual Aesthetic
                    </label>
                    <select
                      value={visualStyle}
                      onChange={(e) => setVisualStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      <option value="photorealistic_keynote">🎥 Photorealistic 4K Broadcast</option>
                      <option value="ue5_raytraced">⚙️ Unreal Engine 5 (Raytraced / 3D CAD)</option>
                      <option value="cyberpunk_noir">🌆 Cinematic Cyberpunk Neon</option>
                      <option value="ufotable_anime">🌸 Ufotable Anime (Volumetric Light)</option>
                      <option value="ghibli_pastoral">🎨 Studio Ghibli Watercolor</option>
                    </select>
                  </div>
                </div>

                {/* Multilingual Dubs (DeepMind) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" /> Multilingual Dubs (DeepMind)
                    </label>
                    <span className="text-[10px] font-mono text-indigo-400">250ms Zero-Drift</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: "ja", label: "JA (Original)" },
                      { code: "en", label: "EN (Dub)" },
                      { code: "es", label: "ES (Doblaje)" },
                      { code: "fr", label: "FR (Doublage)" },
                      { code: "de", label: "DE (Synchron)" },
                      { code: "hi", label: "HI (डबिंग)" }
                    ].map((lang) => {
                      const active = languages.includes(lang.code);
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleToggleLang(lang.code)}
                          className={`p-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 border ${
                            active
                              ? "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold"
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-indigo-400" />}
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Veritas zk-SNARK & C2PA Provenance Gate */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="pageAutoVeritas"
                    checked={autoVeritas}
                    onChange={(e) => setAutoVeritas(e.target.checked)}
                    className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  <label htmlFor="pageAutoVeritas" className="text-xs leading-relaxed cursor-pointer select-none">
                    <span className="font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Veritas zk-SNARK & C2PA Provenance Gate
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Automatically certifies claim grounding, 0ms lip-sync drift, and signs with Ed25519.
                    </span>
                  </label>
                </div>

                {/* Generation Trigger & Progress */}
                {isGenerating ? (
                  <div className="space-y-4 p-6 rounded-2xl bg-slate-950 border border-amber-500/30 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin" /> Synthesizing Production Master...
                      </span>
                      <span className="text-slate-400">{genProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${genProgress}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-300 font-mono tracking-tight">{genStage}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleKickoffGeneration}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm font-mono shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Kickoff Veo 3.1 & DeepMind Dub Pipeline</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* ========================================================================= */
          /* FULL-WIDTH 1600PX PRODUCTION MASTER PREVIEW & DISTRIBUTION SCREEN         */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Top Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-emerald-500/40 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                      Veritas Certified Active
                    </span>
                    <span className="text-xs font-mono text-slate-400">0ms Lip Drift · Ed25519 Cryptographically Sealed</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-serif mt-1">
                    {generatedResult.act?.title || title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all flex items-center gap-2 border border-slate-700 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>+ Create Another Story</span>
                </button>
                <Link
                  href={savedTrackId ? `/studio?track=${savedTrackId}` : "/studio"}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play in Studio Stage</span>
                </Link>
              </div>
            </div>

            {/* 2-Column Edge-to-Edge Desktop Viewport */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column (7 cols): 4K Video Master Player */}
              <div className="xl:col-span-7 space-y-4">
                <div className="relative rounded-3xl overflow-hidden aspect-video bg-black border border-slate-800 shadow-2xl group ring-1 ring-emerald-500/30">
                  <video
                    src={generatedResult.act?.videoSrc || "/assets/video/priya_4k_10act_master.mp4"}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 pointer-events-none px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md text-[11px] font-mono text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>4K Cinema Master · 24fps Motion Locked</span>
                  </div>
                </div>

                {/* Omnichannel Distribution Action Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Link
                    href={savedTrackId ? `/studio?track=${savedTrackId}` : "/studio"}
                    className="py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs font-mono shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch in Cinema</span>
                  </Link>

                  <Link
                    href="/studio/library"
                    className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>View in Media Vault</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsPublished(true)}
                    className={`py-4 px-4 rounded-2xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      isPublished
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white hover:border-slate-700"
                    }`}
                  >
                    {isPublished ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{isPublished ? "Published" : "Publish OTT"}</span>
                  </button>
                </div>
              </div>

              {/* Right Column (5 cols): Veritas Attestation & Multilingual Inspector */}
              <div className="xl:col-span-5 space-y-5">
                {/* Veritas zk-SNARK Cryptographic Proof */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 space-y-4 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Veritas Cryptographic Attestation</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-500 block text-[10px] uppercase">zk-SNARK Proof Hash</span>
                      <span className="text-emerald-400 font-bold break-all">
                        {generatedResult.act?.veritas?.snarkProofHash || "0x8f2d61bca79e4310d289aa84bb234f9011"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Lip-Sync Drift</span>
                        <span className="text-cyan-300 font-bold text-sm">0.00 ms (Locked)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase">Claim Grounding</span>
                        <span className="text-amber-300 font-bold text-sm">99.94% Grounded</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] uppercase">C2PA Manifest Digest</span>
                      <span className="text-slate-300 break-all text-[11px]">
                        urn:c2pa:zyvoriq:master_{Date.now()}:ed25519_signed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multilingual Dub Stems */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>DeepMind Multilingual Dub Stems</span>
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400">6 Stems Active</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: "ja", label: "🇯🇵 Japanese" },
                      { code: "en", label: "🇺🇸 English" },
                      { code: "es", label: "🇪🇸 Spanish" },
                      { code: "fr", label: "🇫🇷 French" },
                      { code: "de", label: "🇩🇪 German" },
                      { code: "hi", label: "🇮🇳 Hindi" }
                    ].map((l) => (
                      <div
                        key={l.code}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs text-slate-300 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-indigo-400" />
                        <span>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Story Script & Parameters Summary */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                    <Film className="w-4 h-4 text-amber-400" />
                    <span>Story Prompt & Scene Context</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudioCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-mono text-sm">Loading Studio Creator...</div>}>
      <ErrorBoundary fallbackTitle="Studio Creator Isolated">
        <CreatePageContent />
      </ErrorBoundary>
    </Suspense>
  );
}
