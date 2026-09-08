"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  Download,
  Share2,
  Check,
  HelpCircle,
  Film,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Clapperboard,
  Music2,
  Smartphone,
  Languages
} from "lucide-react";

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English", desc: "US fast social pacing" },
  { id: "hinglish-roman", label: "🇮🇳 Hinglish (Bollywood)", desc: "Conversational Hindi-English in Roman script" },
  { id: "hi-devanagari", label: "हिन्दी (Devanagari)", desc: "Standard Hindi in Devanagari script" },
  { id: "es", label: "Español", desc: "Spanish expressive pacing" },
  { id: "ja", label: "日本語", desc: "Japanese dramatic stems" },
];

export interface FinishedReel {
  id: string;
  title: string;
  category: string;
  shots: number;
  durationSec: number;
  videoUrl: string;
  posterUrl: string;
  prompt: string;
  continuityProof: string;
  tags: string[];
}

export const FINISHED_REELS: FinishedReel[] = [
  {
    id: "studio1_e2e00945",
    title: "Midnight Cyberpunk Dance",
    category: "Choreography & Style",
    shots: 8,
    durationSec: 42,
    videoUrl: "/api/reels/assets/reels/studio1_e2e00945-e431-4228-bb7b-33cc68f0fa72/renders/narrated-rough-f557d8de0f33a371.mp4",
    posterUrl: "/assets/stills/dubai_dance.jpg",
    prompt: "Street dancer performing liquid popping choreography under neon rain in Shinjuku, continuous camera orbit, synthwave bass drop at 0:15.",
    continuityProof: "Full 8-shot unbroken extension. Facial structure, wet hair physics, and cyberpunk jacket stay 100% coherent from shot 1 to shot 8 without face-morphing.",
    tags: ["9:16 Vertical", "8 Shots", "Liquid Motion", "Zero Face Drift"]
  },
  {
    id: "studio1_9f360810",
    title: "Alpine Sunrise Expedition",
    category: "Outdoor Adventure",
    shots: 6,
    durationSec: 24,
    videoUrl: "/api/reels/assets/reels/studio1_9f360810-20f5-48ba-b3a4-f315bd3ea5c8/renders/narrated-rough-de3bbcca6baf5b2d.mp4",
    posterUrl: "/assets/stills/swiss_alpine.jpg",
    prompt: "Solo mountaineer standing on a jagged snow-covered ridge in the Swiss Alps at golden hour, looking out over a sea of clouds as mountain wind whips.",
    continuityProof: "6 continuous shots. Cold breath vapor, red parka texture, and polarized sunglasses reflections remain rock-solid across every camera push-in.",
    tags: ["9:16 Vertical", "6 Shots", "Hyper-Realistic", "Natural Light"]
  },
  {
    id: "studio1_d2d144d2",
    title: "Dune Nomad Odyssey",
    category: "Cinematic Sci-Fi",
    shots: 6,
    durationSec: 30,
    videoUrl: "/api/reels/assets/reels/studio1_d2d144d2-e696-48e3-9341-68f4ef96455a/renders/narrated-rough-e82a64a80bea275d.mp4",
    posterUrl: "/assets/stills/desert_spiral.jpg",
    prompt: "Desert nomad in wind-swept nomadic silks walking along knife-edge sand dune crest, swirling golden particles in low evening sun.",
    continuityProof: "Extended 6-shot camera spiral. Fabric aerodynamics and sand physics flow continuously without the telltale warping of clip-stitched AI video.",
    tags: ["9:16 Vertical", "6 Shots", "Cloth Physics", "Single Take"]
  },
  {
    id: "studio1_5bfb958d",
    title: "Cosmic Deep Space Ascent",
    category: "Sci-Fi & Cosmos",
    shots: 5,
    durationSec: 34,
    videoUrl: "/api/reels/assets/reels/studio1_5bfb958d-cae5-4147-9bd5-bde17cf67ac4/renders/narrated-rough-bec32d6d147ed737.mp4",
    posterUrl: "/assets/stills/cosmic_nebula.jpg",
    prompt: "Astronaut tethered outside orbital station viewing violet aurora over Earth's horizon, visor reflection showing stars and glowing instruments.",
    continuityProof: "5-shot unbroken orbital arc. Visor curvature reflections, helmet seams, and zero-G drift maintain identity lock from start to finish.",
    tags: ["9:16 Vertical", "5 Shots", "Orbital Arc", "Visor Optics"]
  }
];

export interface CinemaMasterReel {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  shots: number;
  durationSec: number;
  aspectRatio: "2.39:1" | "16:9" | "9:16";
  videoUrl: string;
  posterUrl: string;
  prompt: string;
  scoreTitle: string;
  acts: { act: number; title: string; timecode: string; theme: string }[];
  continuityProof: string;
  tags: string[];
}

export const CINEMA_FINISHED_REELS: CinemaMasterReel[] = [
  {
    id: "cinema_napoleon_180s",
    title: "Napoleon: The Imperial Crown & The Rose Garden",
    subtitle: "A 180-Second Theatrical Romance in 5 Classical Acts",
    category: "Historical Drama & Romance",
    shots: 30,
    durationSec: 180,
    aspectRatio: "2.39:1",
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    posterUrl: "/assets/stills/napoleon_hero.png",
    prompt: "Napoleon Bonaparte 180-second 5-act theatrical romance. Marseilles youth, Joséphine's coronation at Notre-Dame, Finckenstein Polish winter, Tuileries dynastic divorce, and solitary remembrance on Saint Helena.",
    scoreTitle: "Beethoven Symphony No. 7 in A major, Op. 92 – II. Allegretto (-24.0 LUFS EBU R128)",
    acts: [
      { act: 1, title: "The Fires of Youth & Unsent Letters", timecode: "00:00 - 00:36", theme: "Marseilles Coastline Terraces & Candlelit Salons" },
      { act: 2, title: "Imperial Crown & Malmaison Sanctuary", timecode: "00:36 - 01:12", theme: "Notre-Dame Coronation & Rain-Drenched Roses" },
      { act: 3, title: "Polish Winter & Countess Walewska", timecode: "01:12 - 01:48", theme: "Finckenstein Castle Blizzard & Stone Hearth" },
      { act: 4, title: "Dynastic Sacrifice & King of Rome", timecode: "01:48 - 02:24", theme: "Tuileries Throne Room Decree & Marble Nurseries" },
      { act: 5, title: "Solitary Echo & Saint Helena", timecode: "02:24 - 03:00", theme: "Atlantic Winds & Whispers of Remembrance" }
    ],
    continuityProof: "30 unbroken camera takes across 5 classical dramatic acts. Uniform 1800s neoclassical lighting, gold-embroidered imperial uniform, and pristine acoustic synchronization to Beethoven Op. 92.",
    tags: ["2.39:1 Anamorphic", "30 Shots", "180s Master", "5 Acts", "Beethoven Op. 92", "Dolby Audio"]
  }
];

export const OMNI_GENRES = [
  { id: "AUTO", label: "✨ Auto-Detect", desc: "Omni Director auto-infers best cinematic or documentary format from prompt" },
  { id: "BOLLYWOOD_ROMANCE", label: "🌹 Bollywood Romance", desc: "Alpine musical duet, flowing chiffon sarees, violin motifs, 2.39:1 anamorphic" },
  { id: "BOLLYWOOD_ACTION", label: "💥 Bollywood Action", desc: "Kinetic tracking, combat stunts, tactical coverage" },
  { id: "HISTORICAL_BIOPIC", label: "🎩 Historical Biopic", desc: "Era wardrobe, multi-character dialogue, period lighting" },
  { id: "CINEMATIC_DRAMA", label: "🎭 Cinematic Drama", desc: "Shot / reverse-shot, emotional stakes, anamorphic falloff" },
  { id: "SCI_FI_CYBERPUNK", label: "🚀 Sci-Fi Cyberpunk", desc: "Neon atmosphere, futuristic tech, synthetic score" },
  { id: "NEO_NOIR_THRILLER", label: "🕵️ Neo-Noir Thriller", desc: "High-contrast rain, venetian shadows, suspense" },
  { id: "HIGH_FANTASY", label: "🐉 High Fantasy", desc: "Mythic realms, epic wide masters, orchestral motifs" },
  { id: "HORROR_MYSTERY", label: "🕯️ Horror / Mystery", desc: "Atmospheric dread, slow deliberate pushes, low key" },
  { id: "DOCUMENTARY_EXPLAINER", label: "🎙️ Documentary Explainer", desc: "Direct-to-camera presenter, educational breakdown" },
];

export function CreatorReelsHome() {
  const [activeTab, setActiveTab] = useState<"instagram_tiktok" | "youtube_shorts">("instagram_tiktok");
  const [showcaseTab, setShowcaseTab] = useState<"instagram_tiktok" | "youtube_shorts">("instagram_tiktok");
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCinemaIndex, setActiveCinemaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("AUTO");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"9:16" | "16:9" | "2.39:1">("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [annualBilling, setAnnualBilling] = useState(false);

  // Auto-suggest Hinglish if user picks Bollywood Romance or Bollywood Action genre
  useEffect(() => {
    if ((selectedGenre === "BOLLYWOOD_ACTION" || selectedGenre === "BOLLYWOOD_ROMANCE") && selectedLanguage === "en") {
      setSelectedLanguage("hinglish-roman");
    }
  }, [selectedGenre, selectedLanguage]);

  // Auto-suggest Hinglish if user writes Hindi/Hinglish in the prompt text
  useEffect(() => {
    if (/\b(?:hindi|hinglish|desi|bollywood|in hindi)\b/i.test(promptText) && selectedLanguage === "en") {
      setSelectedLanguage("hinglish-roman");
    }
  }, [promptText, selectedLanguage]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeReel = FINISHED_REELS[activeReelIndex];
  const activeCinema = CINEMA_FINISHED_REELS[activeCinemaIndex];

  const handleTabChange = (tab: "instagram_tiktok" | "youtube_shorts") => {
    setActiveTab(tab);
    setShowcaseTab(tab);
    if (tab === "youtube_shorts") {
      setSelectedAspectRatio("2.39:1");
      setSelectedDuration(180);
    } else {
      setSelectedAspectRatio("9:16");
      setSelectedDuration(30);
    }
  };

  // Auto-play when active reel, cinema or tab changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeReelIndex, activeCinemaIndex, activeTab]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekToTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSelectStarterPrompt = (p: string) => {
    setPromptText(p);
  };

  const handleGenerate = async () => {
    const text = promptText.trim();
    if (!text) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedResult(null);
    setGenerationStep(
      activeTab === "youtube_shorts"
        ? "Analyzing prompt & composing 5-act 30-shot screenplay with Beethoven Op. 92..."
        : "Analyzing prompt & composing multi-shot screenplay..."
    );

    try {
      const platform = activeTab === "youtube_shorts" ? "YouTube Shorts" : "Instagram Reels";
      const res = await fetch("/api/studio1/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: text,
          prompt: text,
          duration: selectedDuration,
          requestedDurationSec: selectedDuration,
          aspectRatio: selectedAspectRatio,
          genre: selectedGenre !== "AUTO" ? selectedGenre : undefined,
          language: selectedLanguage,
          platform,
          autoStart: true,
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation request failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setGeneratedResult({
        ...data,
        productionId: data.production?.id || data.productionId,
        message:
          activeTab === "youtube_shorts"
            ? "Your 180s Theatrical Cinema Master is planned across 5 classical dramatic acts and actively rendering in the background queue. Estimated time: ~12–15 minutes."
            : "Your Studio1 unbroken reel is planned and actively rendering in the background queue. Estimated time: ~7 minutes."
      });
      setGenerationStep(null);
    } catch (err: any) {
      console.error("Failed to enqueue reel generation:", err);
      setGenerationError(err?.message || "Failed to start generation. Please check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* 1. STICKY FULL-WIDTH NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#07090E]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 h-18 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  ZYVORIQ
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                    Creator
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Single unbroken takes • Zero character drift
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#showcase" className="hover:text-teal-400 transition-colors">Finished Reels</a>
            <a href="#differentiator" className="hover:text-teal-400 transition-colors">Why Unbroken Takes?</a>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">Pricing</a>
            <Link href="/my-reels" className="hover:text-teal-400 transition-colors">My Reels</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/my-reels"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              My Library
            </Link>
            <a
              href="#prompt-bar"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#07090E] font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Reel</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. THE FOLD: HERO WITH PLAYING 9:16 REEL + PROMPT BAR */}
      <section className="relative pt-6 sm:pt-10 md:pt-14 pb-16 md:pb-24 border-b border-white/5 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] h-[500px] bg-gradient-to-tr from-teal-600/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
                  {/* LEFT COLUMN: HERO HEADLINE, PROMPT BAR & CREATOR PROMISES (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* DUAL FORMAT SELECTOR: TAB 1 (Instagram / TikTok) vs TAB 2 (YouTube Shorts & 180s Cinema) */}
              <div className="flex items-center p-1.5 bg-[#0C1019] border border-white/10 rounded-2xl mb-6 w-full max-w-xl shadow-xl">
                <button
                  type="button"
                  onClick={() => handleTabChange("instagram_tiktok")}
                  className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                    activeTab === "instagram_tiktok"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-[#07090E] shadow-lg shadow-teal-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Instagram / TikTok</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase hidden sm:inline ${
                    activeTab === "instagram_tiktok" ? "bg-[#07090E]/20 text-[#07090E]" : "bg-white/5 text-slate-400"
                  }`}>
                    9:16 Vertical
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("youtube_shorts")}
                  className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                    activeTab === "youtube_shorts"
                      ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 text-[#07090E] shadow-lg shadow-orange-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Clapperboard className="w-4 h-4 shrink-0" />
                  <span>YouTube / 180s Cinema</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase hidden sm:inline ${
                    activeTab === "youtube_shorts" ? "bg-[#07090E]/20 text-[#07090E]" : "bg-white/5 text-slate-400"
                  }`}>
                    5-Act Master
                  </span>
                </button>
              </div>

              {/* Creator badge */}
              {activeTab === "instagram_tiktok" ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs sm:text-sm font-semibold mb-5 w-fit">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>Single Unbroken Take • Zero Character Drift • 9:16 Vertical</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs sm:text-sm font-semibold mb-5 w-fit">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Classical 5-Act Drama • Anamorphic Cinematography • Symphonic Bed (-24.0 LUFS)</span>
                </div>
              )}

              {/* Main Headline */}
              {activeTab === "instagram_tiktok" ? (
                <>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-5">
                    Generate 9:16 reels that{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">
                      actually keep the same face.
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
                    Other AI video tools stitch disjointed 3-second clips that morph your character’s face on every cut. Zyvoriq extends one continuous scene frame-to-frame with 100% biometric facial identity lock.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] mb-5">
                    Direct 180s cinema that{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                      commands the big screen.
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
                    Synthesize 3-minute 30-shot theatrical epics structured in classical 5-act narrative arcs, Cooke anamorphic 2.39:1 optics, dynamic camera choreography, and mastering-grade symphonic scores.
                  </p>
                </>
              )}

              {/* THE PROMPT BAR CONTAINER */}
              <div
                id="prompt-bar"
                className={`w-full bg-[#0E121B] border rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/60 relative transition-all ${
                  activeTab === "youtube_shorts"
                    ? "border-amber-500/20 focus-within:border-amber-500/50"
                    : "border-white/10 focus-within:border-teal-500/50"
                }`}
              >
                {/* Format & Duration toggles */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                  {/* Format selector */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Format:</span>
                    {activeTab === "instagram_tiktok" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("9:16")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 ${
                            selectedAspectRatio === "9:16"
                              ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                              : "bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <span>📱 9:16 Vertical</span>
                          <span className="text-[10px] opacity-75 font-normal">(Reels & TikTok)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("16:9")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                            selectedAspectRatio === "16:9"
                              ? "bg-teal-500 text-[#07090E]"
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          16:9 Landscape
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("2.39:1")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] flex items-center gap-1.5 ${
                            selectedAspectRatio === "2.39:1"
                              ? "bg-amber-400 text-[#07090E] shadow-sm shadow-amber-400/30"
                              : "bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <span>🎬 2.39:1 Anamorphic</span>
                          <span className="text-[10px] opacity-75 font-normal">(Cinema Master)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("16:9")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                            selectedAspectRatio === "16:9"
                              ? "bg-amber-400 text-[#07090E]"
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          16:9 Widescreen
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("9:16")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                            selectedAspectRatio === "9:16"
                              ? "bg-amber-400 text-[#07090E]"
                              : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          9:16 Shorts
                        </button>
                      </>
                    )}
                  </div>

                  {/* Duration selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Duration:</span>
                    {(activeTab === "instagram_tiktok"
                      ? [
                          { sec: 15, shots: 3 },
                          { sec: 30, shots: 6, label: "Standard" },
                          { sec: 45, shots: 9 }
                        ]
                      : [
                          { sec: 60, shots: 10, label: "Short" },
                          { sec: 180, shots: 30, label: "5-Act Epic Master" }
                        ]
                    ).map(d => (
                      <button
                        key={d.sec}
                        type="button"
                        onClick={() => setSelectedDuration(d.sec)}
                        className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1 ${
                          selectedDuration === d.sec
                            ? activeTab === "youtube_shorts"
                              ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold"
                              : "bg-teal-500/20 border border-teal-400/40 text-teal-300 font-bold"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        <span>{d.sec}s</span>
                        <span className="text-[10px] text-slate-400">({d.shots} shots)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Omni Directorial Genre Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/5 scrollbar-none">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">Genre:</span>
                  {OMNI_GENRES.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGenre(g.id)}
                      title={g.desc}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all min-h-[44px] flex items-center gap-1.5 ${
                        selectedGenre === g.id
                          ? activeTab === "youtube_shorts"
                            ? "bg-amber-400 text-[#07090E] font-bold shadow-sm shadow-amber-400/30"
                            : "bg-teal-500 text-[#07090E] font-bold shadow-sm shadow-teal-500/30"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>

                {/* Language & Dialect Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/5 scrollbar-none">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-teal-400" /> Language:
                  </span>
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLanguage(l.id)}
                      title={l.desc}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all min-h-[38px] flex items-center gap-1.5 ${
                        selectedLanguage === l.id
                          ? activeTab === "youtube_shorts"
                            ? "bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold shadow-sm"
                            : "bg-teal-500/20 border border-teal-400/50 text-teal-300 font-bold shadow-sm"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>

                {/* Prompt Textarea */}
                <div className="relative mb-4">
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={
                      activeTab === "youtube_shorts"
                        ? "Describe your 180s cinematic story (e.g., Napoleon Bonaparte 5-act romance, from Marseilles youth to Notre-Dame coronation and solitary exile, Beethoven Op. 92 Allegretto, anamorphic 2.39:1...)"
                        : "Describe your scene or action (e.g., A street dancer performing in neon-lit Shinjuku at midnight, continuous camera push-in, synthwave bass drop...)"
                    }
                    className="w-full bg-[#080B11] border border-white/5 rounded-xl p-3.5 sm:p-4 text-base md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/50 resize-none"
                  />
                </div>

                {/* Quick starter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
                  <span className="text-slate-400 shrink-0 text-[11px] font-medium">Try starter:</span>
                  {(activeTab === "instagram_tiktok"
                    ? [
                        "Cyberpunk street dance in neon rain, bass drop at 0:15",
                        "High alpine climber reaching sunlit peak, wind in jacket",
                        "Desert nomad traversing sandstorms, cinematic dunes",
                        "Deep space astronaut suit reflection, nebula flare"
                      ]
                    : [
                        "Yash Chopra 5-act romance: Violinist hero & flowing chiffon saree heroine in Swiss Alps, Mohabbatein aesthetic, Lyria Bollywood strings, 2.39:1",
                        "Napoleon Bonaparte: 5-act romance & imperial rise, Beethoven Op. 92 allegretto, anamorphic 2.39:1",
                        "Oppenheimer Trinity dawn: Desert countdown, heat mirage, orchestral crescendo, 35mm anamorphic",
                        "The Last Samurai of Kyoto: Rain-soaked cobblestones, silent duel at dawn, bamboo mist",
                        "Interstellar Kepler Voyage: Relativistic tidal wave on ocean world, organ crescendo"
                      ]
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectStarterPrompt(preset)}
                      className={`shrink-0 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300 text-[11px] transition-colors truncate max-w-[260px] ${
                        activeTab === "youtube_shorts"
                          ? "hover:bg-amber-500/10 hover:border-amber-500/30"
                          : "hover:bg-teal-500/10 hover:border-teal-500/30"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Submit button & wait time disclosure */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !promptText.trim()}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl disabled:opacity-50 disabled:pointer-events-none text-[#07090E] font-black text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                      activeTab === "youtube_shorts"
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 shadow-amber-500/25 hover:shadow-amber-500/40"
                        : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 shadow-teal-500/25 hover:shadow-teal-500/40"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#07090E] border-t-transparent rounded-full animate-spin" />
                        <span>
                          {activeTab === "youtube_shorts" ? "Directing 180s Screenplay..." : "Planning Unbroken Scene..."}
                        </span>
                      </>
                    ) : (
                      <>
                        {activeTab === "youtube_shorts" ? (
                          <Clapperboard className="w-5 h-5 text-[#07090E]" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[#07090E]" />
                        )}
                        <span>
                          {activeTab === "youtube_shorts" ? "Direct 180s Cinema Master" : "Generate 9:16 Reel"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#07090E]" />
                      </>
                    )}
                  </button>

                  {/* STATED WAIT: HONEST TIME IN PLAIN ENGLISH */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">
                        {activeTab === "youtube_shorts"
                          ? "~12–15 minutes for a 30-shot theatrical master."
                          : "~7 minutes for a 6-shot reel."}
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        {activeTab === "youtube_shorts"
                          ? "5 classical acts, Beethoven score & 4K mastering in background."
                          : "We render in background; you get notified when ready."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PLATFORM SAFETY GUARANTEE (C2PA + SYNTHID REFRAMED) */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Labeled as AI, so platforms won&apos;t penalize you.</strong> Every reel embeds verified C2PA Content Credentials &amp; SynthID watermarks, satisfying YouTube, TikTok and Instagram disclosure rules without reach throttling.
                  </span>
                </div>
              </div>

              {/* LIVE GENERATION STATUS OR RESULT CARD */}
              {isGenerating && (
                <div className="mt-4 p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div className="text-xs sm:text-sm text-teal-200">
                    <strong className="block text-white font-semibold">Generating Character Anchor...</strong>
                    <span>{generationStep || "Enqueuing background video diffusion worker..."}</span>
                  </div>
                </div>
              )}

              {generationError && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-xs sm:text-sm text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">Generation Notice:</strong>
                    <span>{generationError}</span>
                  </div>
                </div>
              )}

              {generatedResult && (
                <div className="mt-4 p-5 rounded-2xl bg-[#0E1522] border border-teal-500/40 shadow-xl text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="font-bold text-white text-base">Production Successfully Queued!</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-mono font-semibold">
                      ID: {generatedResult.productionId?.slice(0, 16) || "studio1"}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-3">
                    {generatedResult.message || "Your production is now queued in the background video diffusion worker."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/my-reels"
                      className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#07090E] font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Film className="w-4 h-4" />
                      <span>Track in My Reels</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setGeneratedResult(null)}
                      className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

              {/* THREE CREATOR PROMISES ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                {activeTab === "instagram_tiktok" ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Zero Face Drift</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Continuous scene extension keeps character facial identity 100% locked.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">~7 Minute Turnaround</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Honest wait times. Background rendering with immediate completion alerts.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Platform-Safe AI</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Compliant C2PA metadata means zero shadowbans or reach penalties on TikTok &amp; IG.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        <Clapperboard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Classical 5-Act Drama</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Prologue, inciting incident, crisis, climax &amp; resolution across 30 shots.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-400">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Cooke Anamorphic 2.39:1</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Authentic 24fps motion cadence, anamorphic lens flares &amp; ACES 1.3 grading.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                        <Music2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Symphonic -24.0 LUFS</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Continuous orchestral score (Beethoven Op. 92) EBU R128 mastered.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: THE PLAYING PREVIEW IN THE FOLD (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              {activeTab === "instagram_tiktok" ? (
                /* Phone-like 9:16 viewport frame */
                <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-[9/16] bg-black rounded-[36px] p-2.5 shadow-2xl shadow-teal-500/15 border-2 border-white/10 ring-1 ring-white/5 flex flex-col justify-between overflow-hidden group">
                  {/* Simulated mobile phone ear notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#07090E] rounded-full z-30 pointer-events-none border border-white/5" />

                  {/* THE 9:16 VIDEO ELEMENT */}
                  <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-slate-950">
                    <video
                      ref={videoRef}
                      key={activeReel.videoUrl}
                      src={activeReel.videoUrl}
                      poster={activeReel.posterUrl}
                      playsInline
                      muted={isMuted}
                      autoPlay
                      loop
                      preload="auto"
                      className="w-full h-full object-cover select-none cursor-pointer"
                      onClick={togglePlay}
                    />

                    {/* Top Badges Overlay */}
                    <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span>{activeReel.shots} Shots • {activeReel.durationSec}s</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-teal-500/80 backdrop-blur-md text-[#07090E] text-[10px] font-black uppercase tracking-wider">
                        Zero Drift
                      </span>
                    </div>

                    {/* Controls overlay: Mute & Play toggles */}
                    <div className="absolute top-8 right-4 z-30 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5 text-teal-400" />}
                      </button>
                    </div>

                    {/* Bottom Info Bar inside Reel */}
                    <div className="absolute bottom-0 inset-x-0 p-4 pt-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                        {activeReel.category}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
                        {activeReel.title}
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-snug">
                        {activeReel.prompt}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-teal-300 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          Single continuous take
                        </span>
                        <span>9:16 Vertical</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch active reel thumbnails bar */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {FINISHED_REELS.map((reel, idx) => (
                      <button
                        key={reel.id}
                        type="button"
                        onClick={() => setActiveReelIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          activeReelIndex === idx
                            ? "w-8 bg-teal-400"
                            : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                        title={reel.title}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Cinema Master 180s Theatrical Showcase Frame */
                <div className="w-full max-w-[580px] flex flex-col gap-3">
                  <div className="relative w-full aspect-[16/9] bg-black rounded-2xl sm:rounded-3xl p-2 shadow-2xl shadow-amber-500/10 border-2 border-amber-500/30 ring-1 ring-amber-500/20 overflow-hidden group">
                    <video
                      ref={videoRef}
                      key={activeCinema.videoUrl}
                      src={activeCinema.videoUrl}
                      poster={activeCinema.posterUrl}
                      playsInline
                      muted={isMuted}
                      autoPlay
                      loop
                      preload="auto"
                      className="w-full h-full object-cover select-none cursor-pointer rounded-xl sm:rounded-2xl"
                      onClick={togglePlay}
                    />

                    {/* Top Cinema Overlay Badges */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>30 Shots • 180s • 5 Classical Acts</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-amber-400/90 backdrop-blur-md text-[#07090E] text-[10px] font-black uppercase tracking-wider">
                        2.39:1 Anamorphic
                      </span>
                    </div>

                    {/* Controls overlay: Mute & Play toggles */}
                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5 text-amber-400" />}
                      </button>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {activeCinema.category}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
                        {activeCinema.title}
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                        {activeCinema.scoreTitle}
                      </p>
                    </div>
                  </div>

                  {/* 5 ACTS TIME JUMP SCRUBBER */}
                  <div className="bg-[#0C1019] rounded-xl p-2.5 border border-white/10 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-400 font-medium">
                      <span className="text-amber-300 font-bold uppercase tracking-wider">5 Classical Acts:</span>
                      <span>Jump to act</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { act: 1, label: "Marseilles", time: 0, timecode: "0:00" },
                        { act: 2, label: "Notre-Dame", time: 36, timecode: "0:36" },
                        { act: 3, label: "Poland", time: 72, timecode: "1:12" },
                        { act: 4, label: "Tuileries", time: 108, timecode: "1:48" },
                        { act: 5, label: "St. Helena", time: 144, timecode: "2:24" }
                      ].map(item => (
                        <button
                          key={item.act}
                          type="button"
                          onClick={() => seekToTime(item.time)}
                          className="px-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/5 text-slate-300 hover:text-amber-200 transition-all text-center flex flex-col items-center min-h-[44px] justify-center"
                        >
                          <span className="text-amber-400 font-bold text-[10px]">Act {item.act}</span>
                          <span className="text-[9px] text-slate-400">{item.timecode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Caption under player frame */}
              <div className="mt-3 text-center max-w-sm">
                <span className="text-xs font-semibold text-slate-300 block">
                  {activeTab === "instagram_tiktok" ? activeReel.title : activeCinema.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeTab === "instagram_tiktok"
                    ? "Tap to mute/unmute. 100% generated via background worker."
                    : "Beethoven Op. 92 Allegretto (-24.0 LUFS EBU R128). Click any Act to jump."}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BELOW THE FOLD: FINISHED PRODUCTION OUTPUTS SHOWCASE */}
      <section id="showcase" className="py-16 md:py-24 border-b border-white/5 bg-[#090D15]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Film className="w-3.5 h-3.5" />
              <span>Real Production Outputs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Finished productions. Ready to broadcast.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Every production below was planned, anchored, and synthesized end-to-end as a single unbroken sequence with synchronized audio.
            </p>

            {/* Showcase tab selector */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowcaseTab("instagram_tiktok")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                  showcaseTab === "instagram_tiktok"
                    ? "bg-teal-500 text-[#07090E] shadow-md shadow-teal-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>📱 Instagram / TikTok (9:16)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowcaseTab("youtube_shorts")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                  showcaseTab === "youtube_shorts"
                    ? "bg-amber-400 text-[#07090E] shadow-md shadow-amber-400/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🎬 YouTube / 180s Cinema (2.39:1)</span>
              </button>
            </div>
          </div>

          {showcaseTab === "instagram_tiktok" ? (
            /* 4 REELS RESPONSIVE GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {FINISHED_REELS.map((reel, index) => {
                const isSelected = activeReelIndex === index && activeTab === "instagram_tiktok";
                return (
                  <div
                    key={reel.id}
                    className={`bg-[#0E121B] rounded-2xl border transition-all overflow-hidden flex flex-col group ${
                      isSelected
                        ? "border-teal-500 ring-2 ring-teal-500/30 shadow-xl shadow-teal-500/10"
                        : "border-white/10 hover:border-white/25 hover:shadow-xl"
                    }`}
                  >
                    {/* Reel 9:16 Video Container */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden">
                      <video
                        src={reel.videoUrl}
                        poster={reel.posterUrl}
                        playsInline
                        muted
                        loop
                        autoPlay
                        preload="auto"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top overlay badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                          {reel.shots} Shots • {reel.durationSec}s
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/90 text-[#07090E] text-[10px] font-black uppercase">
                          9:16
                        </span>
                      </div>

                      {/* Bottom CTA to load into main player */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("instagram_tiktok");
                            setActiveReelIndex(index);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#07090E] font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Watch in Main Player</span>
                        </button>
                      </div>
                    </div>

                    {/* Reel Metadata */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                            {reel.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                          {reel.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {reel.prompt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{reel.continuityProof}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 180s CINEMA THEATRICAL MASTER SHOWCASE */
            <div className="flex flex-col gap-8">
              {CINEMA_FINISHED_REELS.map(cinema => (
                <div
                  key={cinema.id}
                  className="bg-[#0E121B] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl p-6 sm:p-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* 16:9 / 2.39:1 Video Container */}
                    <div className="lg:col-span-7">
                      <div className="relative aspect-[16/9] bg-black rounded-2xl overflow-hidden border border-white/10 group">
                        <video
                          src={cinema.videoUrl}
                          poster={cinema.posterUrl}
                          playsInline
                          muted
                          loop
                          autoPlay
                          preload="auto"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-xs font-bold text-white">
                            30 Shots • 180s Master
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-amber-400 text-[#07090E] text-xs font-black uppercase">
                            2.39:1 Anamorphic
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("youtube_shorts");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#07090E] font-black text-sm flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all"
                          >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Load in Cinema Director</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Info Column */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                            {cinema.category}
                          </span>
                          <span className="text-xs text-slate-400">• Classical 5-Act Drama</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                          {cinema.title}
                        </h3>
                        <p className="text-sm font-semibold text-amber-300/90 mt-1">
                          {cinema.subtitle}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                          {cinema.prompt}
                        </p>

                        <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3 text-xs">
                          <Music2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block font-semibold">Master Symphonic Bed:</strong>
                            <span className="text-slate-300">{cinema.scoreTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                        {cinema.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-[11px] font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5 Classical Acts Cards Grid */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-amber-400" />
                      <span>5 Classical Acts Dramatic Breakdown:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {cinema.acts.map((act) => (
                        <div
                          key={act.act}
                          className="p-3.5 rounded-xl bg-black/50 border border-white/5 hover:border-amber-400/30 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-1">
                              <span>Act {act.act}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{act.timecode}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white leading-snug">
                              {act.title}
                            </h5>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                            {act.theme}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE CORE DIFFERENTIATOR: SINGLE UNBROKEN TAKE VS STITCHED CLIPS */}
      <section id="differentiator" className="py-16 md:py-24 border-b border-white/5 bg-[#07090E]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>The Zyvoriq Difference</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why other AI video tools look like disjointed slides.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Most generators create random 3-second clips and stitch them into a timeline. When faces morph every cut, viewers scroll away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard AI Generators */}
            <div className="bg-[#0B0E17] rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Other AI Video Generators</h3>
                  <span className="text-xs text-rose-300">Stitched multi-prompt clips</span>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Character Face Morphs:</strong> Each cut prompts a brand-new face. Your protagonist looks like 6 different people.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Jarring Disconnects:</strong> Lighting, wardrobe, and physics violently jump between cuts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Hidden Wait Times:</strong> Cryptic 11-phase spinners with zero ETA leave you guessing when renders finish.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Platform Penalties:</strong> Unlabeled synthetic media gets flagged and throttled by TikTok and Instagram recommendation engines.</span>
                </li>
              </ul>
            </div>

            {/* Zyvoriq Unbroken Sequence */}
            <div className="bg-[#0E1522] rounded-3xl p-6 sm:p-8 border-2 border-teal-500/50 shadow-2xl shadow-teal-500/10 relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-teal-500 text-[#07090E] font-black text-xs uppercase tracking-wider">
                Zyvoriq Advantage
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Zyvoriq Unbroken Scene Extension</h3>
                  <span className="text-xs text-teal-300">Continuous single-take camera choreography</span>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>100% Biometric Lock:</strong> Shot 1 anchors character DNA. Every subsequent shot extends the same 3D coordinates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Single Unbroken Take:</strong> Fluid camera motion vectors carry momentum, wind, and fabric across cuts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Honest ~7-Minute ETA:</strong> Exact queue timing stated upfront. Close the tab and get notified when ready.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Safe to Post:</strong> Built-in C2PA Content Credentials &amp; SynthID watermarks safeguard account reach.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-16 md:py-24 border-b border-white/5 bg-[#090D15]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Plans built for publishing velocity.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Pay for finished, platform-ready reels with zero surprise credit fees.
            </p>

            {/* Monthly / Annual billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs sm:text-sm font-semibold ${!annualBilling ? "text-white" : "text-slate-400"}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-12 h-6 rounded-full bg-white/10 p-1 relative transition-colors focus:outline-none"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-teal-400 transition-transform ${
                    annualBilling ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${annualBilling ? "text-white" : "text-slate-400"}`}>
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* 3 PRICING TIERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* TIER 1: CREATOR */}
            <div className="bg-[#0E121B] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Starter Creator</h3>
                <p className="text-xs text-slate-400 mt-1">For independent creators posting 2–3 viral reels per week.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "23" : "29"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>15 finished 9:16 reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 6 shots (~30s) per reel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>1080p vertical export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>~7 min background rendering</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>C2PA &amp; SynthID compliance badge</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm text-center block transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Start with Starter
                </a>
              </div>
            </div>

            {/* TIER 2: PRO PUBLISHER (FEATURED) */}
            <div className="bg-[#0E1522] rounded-3xl p-6 sm:p-8 border-2 border-teal-500 shadow-2xl shadow-teal-500/20 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500 text-[#07090E] font-black text-xs uppercase tracking-wider">
                Most Popular
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Pro Publisher</h3>
                <p className="text-xs text-slate-400 mt-1">For serious creators and brand channels posting daily.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "63" : "79"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>50 finished 9:16 reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 9 shots (~45s) unbroken takes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>720p HD vertical export (720x1280)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Priority fast queue (~5 min render)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom facial anchor upload</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>1-click export to TikTok &amp; Instagram</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#07090E] font-black text-sm text-center block shadow-lg shadow-teal-500/25 transition-all min-h-[44px] flex items-center justify-center"
                >
                  Get Pro Publisher
                </a>
              </div>
            </div>

            {/* TIER 3: AGENCY */}
            <div className="bg-[#0E121B] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Agency &amp; Studio</h3>
                <p className="text-xs text-slate-400 mt-1">For multi-creator agencies and enterprise production houses.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "159" : "199"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>150 finished reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Multi-seat collaboration (5 creators)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom voice cloning &amp; audio track sync</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dedicated background worker queue</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Full commercial rights &amp; API access</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm text-center block transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Contact Agency Sales
                </a>
              </div>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Cancel anytime with 1 click
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Full commercial usage rights included
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Platform-safe C2PA &amp; SynthID disclosure
            </span>
          </div>
        </div>
      </section>

      {/* 6. CLEAN CREATOR FOOTER */}
      <footer className="py-12 bg-[#05070A] border-t border-white/5 text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
              Z
            </div>
            <span className="font-bold text-white tracking-tight">ZYVORIQ</span>
            <span className="text-slate-400">• Single Unbroken Take AI Video Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#differentiator" className="hover:text-white transition-colors">Differentiator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/my-reels" className="hover:text-white transition-colors">My Reels</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Zyvoriq. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
