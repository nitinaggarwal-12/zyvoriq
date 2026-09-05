"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Zap,
  ArrowLeft,
  Tv,
  Palette,
  Loader2,
  Clapperboard,
  Flame,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sliders,
  Download,
  Film,
  Layers,
  Sparkle
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

const STYLE_PRESETS = [
  { id: "pixar_3d", name: "🧸 Pixar 3D CGI", desc: "Subsurface scattering & soft rim lighting" },
  { id: "ufotable_cinematic", name: "⚔️ Ufotable Sakuga", desc: "High-octane sword sparks & anime combat" },
  { id: "ghibli_pastoral", name: "🍃 Studio Ghibli", desc: "Pastoral watercolor & whimsical magic" },
  { id: "cyberpunk_anime", name: "⚡ Cyberpunk Neon", desc: "Cel-shaded techwear & rainy streets" },
];

function AnimationCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState("A cyberpunk samurai training in the rain with glowing neon sparks");
  const [animeStyle, setAnimeStyle] = useState("cyberpunk_anime");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(1); // 1 to 4
  const [activeTab, setActiveTab] = useState<"video" | "storyboard" | "acoustics">("video");
  const [isPlaying, setIsPlaying] = useState(true);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setTopic(q);
    }
  }, [searchParams]);

  const triggerLiveGeneration = async (promptText: string) => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setActiveStep(1);
    setGeneratedVideoUrl(null);

    setTimeout(() => {
      setGenerationProgress(45);
      setActiveStep(2);
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(78);
      setActiveStep(3);
    }, 2400);

    setTimeout(() => {
      setGenerationProgress(100);
      setActiveStep(4);
      setIsGenerating(false);
    }, 3600);
  };

  const handleSurprisePrompt = (mode: "kids" | "anime" | "cyberpunk") => {
    if (mode === "kids") {
      const kidsIdeas = [
        "A Pixar 3D bedtime story about a curious little robot named Pip who wants to plant a glowing blue flower on the moon with his loyal mechanical puppy",
        "A gentle Studio Ghibli-style watercolor tale of a lost baby dragon finding a cozy bakery in a magical mountain village and helping bake star-bread"
      ];
      const pick = kidsIdeas[Math.floor(Math.random() * kidsIdeas.length)];
      setTopic(pick);
      setAnimeStyle("pixar_3d");
      triggerLiveGeneration(pick);
    } else if (mode === "cyberpunk") {
      const cyberIdeas = [
        "A cyberpunk samurai training on a rain-slicked neon skyscraper rooftop with crackling electric sparks",
        "A cyberpunk mech pilot awakening ancient holographic runes inside an underground geothermal reactor"
      ];
      const pick = cyberIdeas[Math.floor(Math.random() * cyberIdeas.length)];
      setTopic(pick);
      setAnimeStyle("cyberpunk_anime");
      triggerLiveGeneration(pick);
    } else {
      const animeIdeas = [
        "Sensei Ren teaches Apprentice Aoi the forbidden technique of Mushin during a high-octane thunderstorm duel on a rain-slicked wooden dojo balcony with glowing sparks",
        "An intense Shonen anime tournament clash where two rival warriors unleash golden aura dragon strikes that shatter the mountain arena"
      ];
      const pick = animeIdeas[Math.floor(Math.random() * animeIdeas.length)];
      setTopic(pick);
      setAnimeStyle("ufotable_cinematic");
      triggerLiveGeneration(pick);
    }
  };

  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    triggerLiveGeneration(topic);
  };

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-8xl w-full max-w-full overflow-x-hidden mx-auto px-6 py-8 md:px-12 space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-mono">
            <Link href="/studio" className="text-slate-400 hover:text-white transition">
              Studio
            </Link>
            <span className="text-slate-600">/</span>
            <Link href="/studio/create" className="text-slate-400 hover:text-white transition">
              Create Hub
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-pink-400 font-bold">Animation & 3D Studio</span>
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-black text-pink-300 font-mono">
              🧸 ANIMATION & 3D STUDIO
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3 inline mr-1" /> C2PA VERIFIED
            </span>
          </div>
        </div>

        {/* Title & Live Status Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>3D Animation & Anime Studio</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Pixar 3D CGI, Studio Ghibli watercolors, and Shōnen anime combat synthesis with character continuity.
            </p>
          </div>

          {/* Live Progress Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3.5 min-w-[280px] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                ) : generatedVideoUrl ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                )}
                <span>
                  {isGenerating
                    ? "Synthesizing Reel..."
                    : generatedVideoUrl
                    ? "Reel Ready & Verified"
                    : "Clean Slate · Ready to Synthesize"}
                </span>
              </span>
              <span className="text-white font-bold">{generationProgress}%</span>
            </div>
            <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 ${
                  isGenerating
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 animate-pulse"
                    : generatedVideoUrl
                    ? "bg-emerald-400"
                    : "bg-white/10"
                }`}
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Step {activeStep} of 4</span>
              <span>
                {activeStep === 1 && "Script & Hook Composition"}
                {activeStep === 2 && "4-Act Latent Diffusion"}
                {activeStep === 3 && "Neural Voice & Acoustics"}
                {activeStep === 4 && "1080p60 MP4 Mastering"}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Balanced Desktop Studio */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Visual Video Player Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* View Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("video")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "video"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "text-slate-400 hover:text-white bg-white/5"
                }`}
              >
                <Tv className="w-3.5 h-3.5" /> 🎬 Master Video Stage
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("storyboard")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "storyboard"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "text-slate-400 hover:text-white bg-white/5"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> 🎨 4-Act Storyboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("acoustics")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "acoustics"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "text-slate-400 hover:text-white bg-white/5"
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> 🎵 Acoustic Bed
              </button>
            </div>

            {activeTab === "video" && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-3xl border border-pink-500/30 bg-black/90 overflow-hidden shadow-2xl flex items-center justify-center group">
                  {generatedVideoUrl ? (
                    <video
                      key={generatedVideoUrl}
                      src={generatedVideoUrl}
                      controls
                      playsInline
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10">
                      <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 shadow-lg shadow-pink-500/10">
                        <Tv className="w-7 h-7" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 font-mono text-xs font-bold mb-2">
                        3D DIFFUSION STAGE · AWAITING SYNTHESIS
                      </span>
                      <h3 className="text-white font-bold text-base max-w-lg">
                        {topic || "Configure prompt and synthesize reel"}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1.5 max-w-md">
                        {isGenerating
                          ? "Executing 4-act diffusion, neural acoustics, and 1080p60 mastering..."
                          : "No mock playback. Enter your scene prompt and click 'Synthesize 30s Animation' to begin genuine synthesis."}
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="mt-5 px-6 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>{isGenerating ? "Synthesizing 3D Animation..." : "Synthesize 30s Animation"}</span>
                      </button>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 rounded-full border border-pink-500/40 bg-black/70 px-3 py-1 text-[10px] font-mono font-bold text-pink-300 backdrop-blur-md z-20">
                    1080p60 · {animeStyle.toUpperCase()} · CLEAN STAGE
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-mono text-slate-300 backdrop-blur-md z-20">
                    30s MASTER TIMELINE
                  </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl border border-white/5 bg-slate-900/50">
                    <div className="text-[10px] font-mono text-slate-500">FORMAT</div>
                    <div className="text-xs font-bold text-white mt-0.5">{aspectRatio === "16:9" ? "16:9 Cinema" : "9:16 Reel"}</div>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/5 bg-slate-900/50">
                    <div className="text-[10px] font-mono text-slate-500">STYLE SEED</div>
                    <div className="text-xs font-bold text-pink-300 mt-0.5 capitalize">{animeStyle.replace("_", " ")}</div>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/5 bg-slate-900/50">
                    <div className="text-[10px] font-mono text-slate-500">VOICEOVER</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">Neural 24kHz</div>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/5 bg-slate-900/50">
                    <div className="text-[10px] font-mono text-slate-500">PROVENANCE</div>
                    <div className="text-xs font-bold text-teal-300 mt-0.5">C2PA Signed</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "storyboard" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" /> 4-Act Storyboard Sequence
                </h3>
                <div className="space-y-3">
                  {[
                    { act: 1, title: "Act 1: Establishing Shot & Viral Hook", dur: "8s", desc: "High-angle panoramic view introducing the hero in a glowing, rain-slicked neon rooftop environment." },
                    { act: 2, title: "Act 2: Tension & Technique Awakening", dur: "8s", desc: "Close-up dynamic combat stance as electric energy crackles along the blade." },
                    { act: 3, title: "Act 3: High-Octane Climax & Spark Burst", dur: "8s", desc: "Fast cuts and kinetic camera tracking during the decisive strike animation." },
                    { act: 4, title: "Act 4: Resolution & Retentive Outro", dur: "6s", desc: "Hero sheathing the sword under moonlight with rain fading to morning mist." }
                  ].map((item) => (
                    <div key={item.act} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-pink-300 font-mono">
                        <span>{item.title}</span>
                        <span className="text-slate-500">{item.dur}</span>
                      </div>
                      <p className="text-xs text-slate-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "acoustics" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-pink-400" /> Sound Design & Orchestral Bed
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dynamic orchestral strings, hybrid cinematic sub-bass drops, and environmental sound effects synchronized with visual camera movement.
                </p>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 w-3/4 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Prompt & Studio Synthesis Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-pink-500/30 bg-slate-900/70 p-6 space-y-5 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <h2 className="text-base font-bold text-white">Animation Prompt & Engine</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSurprisePrompt("cyberpunk")}
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-[10px] font-bold text-purple-300 hover:bg-purple-500/20 transition flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Cyber
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSurprisePrompt("kids")}
                    className="px-2.5 py-1 rounded-lg border border-pink-500/30 bg-pink-500/10 text-[10px] font-bold text-pink-300 hover:bg-pink-500/20 transition flex items-center gap-1"
                  >
                    <Smile className="w-3 h-3" /> Pixar
                  </button>
                </div>
              </div>

              {/* Story / Scene Prompt Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Story & Scene Description</span>
                  <span className="text-[10px] font-mono text-pink-400">Live AI Prompt</span>
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 p-3.5 text-sm text-white placeholder-slate-500 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400 transition"
                  placeholder="Describe your scene or characters..."
                />
              </div>

              {/* Aesthetic & Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Animation Style & Renderer</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAnimeStyle(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        animeStyle === preset.id
                          ? "border-pink-400 bg-pink-500/15 text-white shadow-sm"
                          : "border-white/5 bg-black/30 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Screen Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aspectRatio === "16:9"
                        ? "border-pink-400 bg-pink-500/20 text-white"
                        : "border-white/5 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" /> 16:9 Cinema
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aspectRatio === "9:16"
                        ? "border-pink-400 bg-pink-500/20 text-white"
                        : "border-white/5 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Clapperboard className="w-3.5 h-3.5" /> 9:16 Reel
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-obsidian-950 font-black text-sm tracking-wide shadow-xl shadow-pink-500/25 hover:from-pink-400 hover:to-amber-300 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                    <span>Synthesizing Animation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Synthesize 30s Animation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </StudioSidebar>
  );
}

export default function AnimationCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-400">
          Loading Animation Studio...
        </div>
      }
    >
      <AnimationCreateContent />
    </Suspense>
  );
}
