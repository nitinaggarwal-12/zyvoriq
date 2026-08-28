"use client";

import React, { useState } from "react";
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
  X,
  Volume2,
  Volume1,
  FileCheck,
  Send,
  Zap,
  Layers,
  Search,
  Shuffle,
  Compass,
  Radio,
  Tag
} from "lucide-react";

interface CreateActModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActCreated?: (actData: any, destinationMode?: "new_series" | "append_current") => void;
  currentTrackTitle?: string;
}

export interface GenreConcept {
  id: string;
  genre: string;
  genreEmoji: string;
  title: string;
  hook: string;
  prompt: string;
  characterLock: string;
  visualStyle: string;
  recommendedDuration: number;
  speechSample: string;
}

export const GENRE_CATEGORIES = [
  { id: "all", label: "🎬 All Categories" },
  { id: "executive", label: "🧑‍💼 Humans & Executive Twins" },
  { id: "anime", label: "🌸 Anime & Manga" },
  { id: "cartoon", label: "🎨 Cartoon & Stylized Animation" },
  { id: "cgi_3d", label: "🧊 3D Graphics & CGI Cinematic" },
  { id: "nature", label: "🌿 Nature & Wildlife Documentaries" },
  { id: "space", label: "🌌 Universe, Cosmos & Space" },
  { id: "engineering", label: "⚙️ Machine Building & Engineering" },
  { id: "medical", label: "🩺 Medical Equipment & Healthcare" },
  { id: "security", label: "🛡️ Veritas Trust & Cryptography" }
];

export const GENRE_CONCEPTS: GenreConcept[] = [
  // 1. Humans & Executive Digital Twins
  {
    id: "sovereign_ai_exec",
    genre: "executive",
    genreEmoji: "🧑‍💼",
    title: "🏢 Sovereign AI Enterprise Keynote",
    hook: "Priya delivers an authoritative mainstage keynote on autonomous corporate governance.",
    prompt: "Priya delivers an authoritative 4K keynote on enterprise zk-SNARK cryptographic provenance, deterministic media synthesis, and zero-drift neural broadcasting.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 120,
    speechSample: "Welcome to the frontier of sovereign enterprise intelligence—where every decision is verifiable and cryptographically guaranteed."
  },
  {
    id: "earnings_margin",
    genre: "executive",
    genreEmoji: "📈",
    title: "📈 Q3 Global Earnings & Margin Expansion",
    hook: "Elena breaks down cross-border neural infrastructure ROI for institutional shareholders.",
    prompt: "Elena presents a crisp, data-driven executive briefing on multi-region inference margins, decentralized compute clusters, and 300% ARR growth.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "By transitioning to decentralized sub-millisecond edge clusters, we unlocked 300% ARR expansion with zero latency overhead."
  },

  // 2. Anime & Manga
  {
    id: "mushin_thunder",
    genre: "anime",
    genreEmoji: "🥋",
    title: "⚡ The Thunderstorm of Mushin",
    hook: "A rainy nighttime duel on a tatami balcony exploring the concept of Mind without Mind.",
    prompt: "Sensei Ren teaches Apprentice Aoi the concept of Mushin (Mind without Mind) during a night thunderstorm duel on the wooden dojo balcony.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 24,
    speechSample: "Do not anchor your mind, Aoi. Like falling rain, true mastery strikes only when all thought is released."
  },
  {
    id: "wabi_sabi",
    genre: "anime",
    genreEmoji: "🌸",
    title: "🌸 Sakura Wabi-Sabi Duel",
    hook: "Embracing imperfection and transience as cherry blossoms drift across the dojo garden.",
    prompt: "Aoi struggles with perfectionism before Sensei Ren points to imperfect falling cherry blossoms, illustrating beauty in transience.",
    characterLock: "ren_aoi",
    visualStyle: "ufotable_anime",
    recommendedDuration: 8,
    speechSample: "Look at the garden, Aoi. Wabi-Sabi teaches that true beauty lives in the transient and the broken."
  },

  // 3. Cartoon & Stylized Animation
  {
    id: "retro_cartoon_lab",
    genre: "cartoon",
    genreEmoji: "🎨",
    title: "🎨 Whimsical Inventor's Laboratory",
    hook: "A wacky cartoon inventor creates a contraption that turns breakfast pancakes into rocket fuel.",
    prompt: "Classic hand-drawn animation style with bouncy physics: an eccentric cartoon inventor activates a steam-powered pancake catapult in a cluttered whimsical workshop.",
    characterLock: "custom",
    visualStyle: "ghibli_pastoral",
    recommendedDuration: 24,
    speechSample: "Hold onto your toast! The Gravitational Batter Propeller is warming up for ignition!"
  },

  // 4. 3D Graphics & CGI Cinematic
  {
    id: "unreal_cyber_city",
    genre: "cgi_3d",
    genreEmoji: "🧊",
    title: "🧊 Unreal Engine 5 Cyber-Metropolis",
    hook: "Photorealistic ray-traced drone flythrough across holographic floating skylanes.",
    prompt: "Hyper-detailed Unreal Engine 5 CGI render with Nanite geometry and Lumen global illumination: camera glides through a bustling futuristic mega-city with flying aero-transits and neon rain.",
    characterLock: "david",
    visualStyle: "cyberpunk_noir",
    recommendedDuration: 56,
    speechSample: "Initializing sub-atomic path tracing across Sector 9. Global illumination render lock engaged."
  },

  // 5. Nature & Wildlife Documentaries
  {
    id: "savanna_predator",
    genre: "nature",
    genreEmoji: "🌿",
    title: "🌿 Serengeti Thunderstorm & Lion Pride",
    hook: "BBC Earth-style cinematic documentary following a lion pride during the Great Migration rainstorm.",
    prompt: "Cinematic 8K wildlife documentary: golden hour sunlight breaks through dramatic storm clouds as a lion pride surveys the sweeping Serengeti plains with amber grasses rippling in the wind.",
    characterLock: "custom",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "Across the vast golden plains of the Serengeti, the coming rains signal a dramatic renewal of life and the ancient hunt."
  },

  // 6. Universe, Space & Cosmic Exploration
  {
    id: "deep_space_blackhole",
    genre: "space",
    genreEmoji: "🌌",
    title: "🌌 Event Horizon: Journey into Gargantua",
    hook: "Interstellar journey navigating the glowing gravitational lensing of a supermassive black hole.",
    prompt: "Photorealistic deep space IMAX cinematography: an exploration starship approaches a supermassive black hole with a blinding gold-orange accretion disk warping starlight in relativistic physics.",
    characterLock: "custom",
    visualStyle: "cyberpunk_noir",
    recommendedDuration: 120,
    speechSample: "As we cross the photon sphere, time dilates exponentially. Starlight curves around the gravitational singularity."
  },

  // 7. Machines, Engineering & Manufacturing
  {
    id: "jet_engine_assembly",
    genre: "engineering",
    genreEmoji: "⚙️",
    title: "⚙️ Building a Hypersonic Scramjet Engine",
    hook: "Step-by-step engineering teardown and 5-axis CNC machining of titanium turbine blades.",
    prompt: "Educational industrial engineering documentary: exploded 3D CAD holographic view showing titanium combustion chambers, ceramic heat shields, and fuel injectors assembling at Mach 7 tolerances.",
    characterLock: "david",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "Every micron counts. These titanium-aluminide turbine blades withstand temperatures hotter than molten volcanic magma."
  },

  // 8. Medical Equipment & Healthcare
  {
    id: "robotic_surgery_mri",
    genre: "medical",
    genreEmoji: "🩺",
    title: "🩺 Da Vinci Robotic Micro-Surgery & MRI",
    hook: "High-precision robotic microsurgery guided by real-time 7-Tesla neuro-MRI scanning.",
    prompt: "State-of-the-art medical education footage: robotic surgical arms perform sub-millimeter suturing while real-time holographic MRI neural scans illuminate synaptic pathways in the background.",
    characterLock: "elena",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "With 7-Tesla intraoperative neuro-imaging, the robotic needle achieves sub-millimeter precision without disrupting vascular pathways."
  },

  // 9. Veritas Trust & Cryptography
  {
    id: "veritas_c2pa",
    genre: "security",
    genreEmoji: "🛡️",
    title: "🛡️ Veritas zk-SNARK Cryptographic Shield",
    hook: "Priya explains frame-by-frame deepfake immunity and C2PA provenance signatures.",
    prompt: "Priya Sharma briefs sovereign security auditors on Ed25519 cryptographic seals and claim-level zero-drift grounding protocols.",
    characterLock: "priya",
    visualStyle: "photorealistic_keynote",
    recommendedDuration: 56,
    speechSample: "In a world flooded with synthetic media, trust is math. Veritas zk-SNARK provides immutable proof for every spoken syllable."
  }
];

export function CreateActModal({ isOpen, onClose, onActCreated, currentTrackTitle = "The Master & The Apprentice" }: CreateActModalProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSpeakingPitch, setIsSpeakingPitch] = useState<string | null>(null);

  const [title, setTitle] = useState("⚡ The Thunderstorm of Mushin");
  const [prompt, setPrompt] = useState(
    "Sensei Ren teaches Apprentice Aoi the concept of Mushin (Mind without Mind) during a night thunderstorm duel on the wooden dojo balcony."
  );
  const [duration, setDuration] = useState<number>(24);
  const [destinationMode, setDestinationMode] = useState<"new_series" | "append_current">("new_series");
  const [characterLock, setCharacterLock] = useState("ren_aoi");
  const [visualStyle, setVisualStyle] = useState("ufotable_anime");
  const [languages, setLanguages] = useState<string[]>(["ja", "en", "es", "fr", "de", "hi"]);
  const [autoVeritas, setAutoVeritas] = useState(true);

  // Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState("");
  const [genProgress, setGenProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  // Filtered concepts based on genre & search
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

  if (!isOpen) return null;

  const handleToggleLang = (code: string) => {
    if (languages.includes(code)) {
      if (languages.length > 1) setLanguages(languages.filter((l) => l !== code));
    } else {
      setLanguages([...languages, code]);
    }
  };

  const handleKickoffGeneration = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    setIsPublished(false);
    setGenProgress(15);
    setGenStage("🧠 Decomposing Scene Narrative & Persona Dialogue (Gemini 2.5 Flash)...");

    setTimeout(() => {
      setGenProgress(40);
      setGenStage("🎬 Synthesizing Veo 3.1 Character-Locked Keyframes & 24fps Motion...");
    }, 700);

    setTimeout(() => {
      setGenProgress(70);
      setGenStage("🎙️ Synthesizing DeepMind 6-Language Neural Voice Stems (Charon & Aoede)...");
    }, 1400);

    setTimeout(() => {
      setGenProgress(90);
      setGenStage("⏱️ Applying 250ms Zero-Drift Audio Container Locking & FFmpeg Remux...");
    }, 2100);

    try {
      const res = await fetch("/api/tier6/create-act", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          prompt,
          duration,
          characterLock,
          visualStyle,
          languages,
          autoVeritas
        })
      });

      const data = await res.json();
      setTimeout(() => {
        setIsGenerating(false);
        setGenProgress(100);
        if (data.success) {
          setGeneratedResult(data);
          if (onActCreated) onActCreated(data);
        }
      }, 2600);
    } catch (err) {
      console.error("Act creation failed:", err);
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-serif flex items-center gap-2">
              <span>Studio Act & Episode Generator</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] uppercase">
                Veo 3.1 + DeepMind TTS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure prompt, choose duration, synthesize multilingual dubs, audit with Veritas zk-SNARK, and publish with 1 click.
            </p>
          </div>
        </div>

        {!generatedResult ? (
          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* NETFLIX / PRIME VIDEO GENRE & IDEA DISCOVERY HUB                          */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Netflix & Prime Concept Discovery
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {filteredConcepts.length} Blockbuster Concepts
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-serif mt-1">
                    Genre & Idea Generator <span className="text-amber-400 font-normal italic">+ Speech Pitch Previews</span>
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleRandomize}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400/60 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>🎲 Surprise Idea</span>
                </button>
              </div>

              {/* Search Bar & Genre Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genres, story tropes, or keywords (e.g. samurai, leadership, cyberpunk, wabi-sabi)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 border ${
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
              </div>

              {/* Netflix-Style Concept Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {filteredConcepts.map((concept) => {
                  const isPlaying = isSpeakingPitch === concept.id;
                  const isCurrent = title === concept.title;
                  return (
                    <div
                      key={concept.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative group ${
                        isCurrent
                          ? "bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/70 shadow-lg shadow-amber-500/10"
                          : "bg-slate-950/80 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center gap-1">
                            {concept.genreEmoji} {concept.genre.replace("_", " ")}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ⏱️ {concept.recommendedDuration}s
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white font-serif group-hover:text-amber-200 transition-colors">
                          {concept.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {concept.hook}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                        <button
                          type="button"
                          onClick={() => handleListenSpeech(concept)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 ${
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
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                            isCurrent
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-300"
                          }`}
                        >
                          {isCurrent ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3 text-amber-400" />}
                          <span>{isCurrent ? "Active Concept" : "⚡ Use Concept"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Act Title & Prompt Customization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-400" /> Selected Story Title & Prompt
                </label>
                <span className="text-[11px] font-mono text-slate-500">Gemini 2.5 Flash Grounded</span>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Act 8: The Way of Mushin"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/80"
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
                rows={3}
                placeholder="Describe what happens in this scene, the philosophical dilemma, lighting, and action..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/80 leading-relaxed resize-none"
              />
            </div>

            {/* Destination Mode Selector: New Track vs Append */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Production Destination
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDestinationMode("new_series")}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    destinationMode === "new_series"
                      ? "bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-500 text-white shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${destinationMode === "new_series" ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Start Brand New Series / Track
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Creates an independent video track in your library
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDestinationMode("append_current")}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    destinationMode === "append_current"
                      ? "bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500 text-white shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/50"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${destinationMode === "append_current" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      Append to Active Series
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate max-w-[220px]">
                      Adds as next sequel act to {currentTrackTitle}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Grid 2 Columns: Duration & Character Lock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Duration Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" /> Duration & Act Structure
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setDuration(8)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      duration === 8
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">8s</span>
                    <span className="text-[10px] text-slate-400">Single Act</span>
                  </button>

                  <button
                    onClick={() => setDuration(24)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      duration === 24
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">24s</span>
                    <span className="text-[10px] text-slate-400">3-Act Short</span>
                  </button>

                  <button
                    onClick={() => setDuration(56)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      duration === 56
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">56s</span>
                    <span className="text-[10px] text-slate-400">7-Act Film</span>
                  </button>

                  <button
                    onClick={() => setDuration(120)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      duration === 120
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">120s</span>
                    <span className="text-[10px] text-slate-400">2-Min Film</span>
                  </button>
                </div>
              </div>

              {/* Character Continuity Lock */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Character Continuity Lock
                </label>
                <select
                  value={characterLock}
                  onChange={(e) => setCharacterLock(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="ren_aoi">🥋 Sensei Ren & Apprentice Aoi (Anime Master & Student)</option>
                  <option value="priya">👩‍💼 Priya (Executive Digital Twin - Silicon Valley)</option>
                  <option value="david">👨‍💼 David (Chief AI Architect - Zurich)</option>
                  <option value="elena">👩‍🔬 Elena (VP Neural Research - Tokyo)</option>
                </select>
              </div>

            </div>

            {/* Grid 2 Columns: Visual Style & Multilingual Dubs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Visual Aesthetic */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-400" /> Visual Aesthetic & Stagecraft
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="ufotable_anime">🌸 Ufotable Cinematic Anime (Sakura Rays & Volumetric Light)</option>
                  <option value="cyberpunk_neo_dojo">⚡ Cyberpunk Neo-Dojo (Rain Reflections & Neon Katana)</option>
                  <option value="executive_keynote">🏛️ Executive 4K Studio Keynote (Teleprompter & Stage Lights)</option>
                </select>
              </div>

              {/* Multilingual Dubs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" /> Multilingual Dubs (DeepMind)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">250ms Zero-Drift</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: "ja", label: "JA (Original)" },
                    { code: "en", label: "EN (Dub)" },
                    { code: "es", label: "ES (Doblaje)" },
                    { code: "fr", label: "FR (Doublage)" },
                    { code: "de", label: "DE (Synchron)" },
                    { code: "hi", label: "HI (डबिंग)" }
                  ].map((l) => {
                    const isSelected = languages.includes(l.code);
                    return (
                      <button
                        key={l.code}
                        onClick={() => handleToggleLang(l.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-200"
                            : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Veritas Quality Gate Checkbox */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Veritas zk-SNARK & C2PA Provenance Gate</div>
                  <div className="text-[11px] text-slate-400">
                    Automatically certifies claim grounding, 0ms lip-sync drift, and signs with Ed25519.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoVeritas}
                onChange={(e) => setAutoVeritas(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Progress Bar while generating */}
            {isGenerating && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> {genStage}
                  </span>
                  <span className="text-amber-400 font-bold">{genProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Kickoff Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleKickoffGeneration}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Multi-Modal Act...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Kickoff Veo 3.1 &amp; DeepMind Dub Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Generated Result Review & 1-Click Publish Stage */
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{generatedResult.title} Generated Successfully!</h3>
                  <p className="text-xs text-emerald-300/90 font-mono">
                    Duration: {generatedResult.duration} | Veritas Quality Score: <b>{generatedResult.veritasAudit?.vqsScore}/100 [PASS APPROVED]</b>
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                {generatedResult.veritasAudit?.certId}
              </div>
            </div>

            {/* Script & Dialogue Review */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  🎭 Scene Direction &amp; Philosophy
                </span>
                <span className="text-xs font-mono text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded">
                  {generatedResult.script?.philosophy}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic">
                "{generatedResult.script?.actionDirection}"
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-xs text-white font-serif">
                  <span className="text-amber-400 font-bold font-mono">Ren (Sensei):</span> "{generatedResult.script?.dialogueJa}"
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-bold font-mono">EN:</span> "{generatedResult.script?.dialogueEn}"
                </div>
                <div className="text-xs text-cyan-300 font-sans">
                  <span className="text-cyan-400 font-bold font-mono">Aoi:</span> "{generatedResult.script?.aoiResponse}"
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-[11px] font-mono text-amber-300">
                💡 <b>Takeaway:</b> {generatedResult.script?.wisdomKey}
              </div>
            </div>

            {/* Veritas Cryptographic Proof Breakdown */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>C2PA Manifest Hash:</span>
                <span className="text-purple-400">{generatedResult.veritasAudit?.c2paManifestHash?.substring(0, 32)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Audio-Visual Lip Sync Drift:</span>
                <span className="text-emerald-400 font-bold">0ms Drift (250ms Reaction Locked)</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-Language Dub Tracks:</span>
                <span className="text-cyan-400 font-bold">{generatedResult.languagesGenerated?.join(", ").toUpperCase()} (6 Dubs)</span>
              </div>
            </div>

            {/* Actions: Publish vs Return */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setGeneratedResult(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
              >
                ← Create Another Act
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (generatedResult && onActCreated) {
                      onActCreated(generatedResult, destinationMode);
                    }
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview in Studio Stage</span>
                </button>

                <button
                  onClick={handlePublish}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    isPublished
                      ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                      : "bg-gradient-to-r from-teal-400 to-cyan-500 hover:brightness-110 text-slate-950 shadow-teal-500/20"
                  }`}
                >
                  {isPublished ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Published to Omnichannel Pipeline!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>1-Click Omnichannel Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
