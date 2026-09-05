 "use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  Sparkles,
  Zap,
  ArrowLeft,
  Users,
  User,
  Clock,
  Palette,
  Loader2,
  Lightbulb,
  Tv,
  Smartphone,
  Square,
  Flame,
  ShieldCheck,
  Split,
  FileText,
  HelpCircle,
  TrendingUp,
  Volume2,
  Gauge,
  Layers,
  Play
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

type ReelFormat = "split_screen_asmr" | "reddit_confession" | "countdown_quiz" | "would_you_rather" | "talking_head";
type SubtitleStyle = "gold_bounce" | "neon_green" | "punchy_red" | "clean_white";
type BrollType = "kinetic_sand" | "soap_cutting" | "subway_3d" | "hydraulic_press" | "slime_stretch";
type BgmType = "phonk_trap" | "dark_horror" | "lofi_chill" | "synthwave" | "none";

function ReelCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState("");
  const [reelFormat, setReelFormat] = useState<ReelFormat>("split_screen_asmr");
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>("gold_bounce");
  const [brollType, setBrollType] = useState<BrollType>("kinetic_sand");
  const [bgmType, setBgmType] = useState<BgmType>("phonk_trap");
  const [voiceSpeed, setVoiceSpeed] = useState<"1.0x" | "1.15x" | "1.25x">("1.15x");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [durationSec, setDurationSec] = useState<number>(30);
  const [language, setLanguage] = useState("English");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const triggerLiveGeneration = (promptText: string) => {
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

  useEffect(() => {
    const q = searchParams.get("q");
    const mode = searchParams.get("mode");
    if (q) {
      setTopic(q);
      triggerLiveGeneration(q);
    }
    if (mode === "faceless") setReelFormat("split_screen_asmr");
    else if (mode === "reddit") setReelFormat("reddit_confession");
    else if (mode === "quiz") setReelFormat("countdown_quiz");
  }, [searchParams]);

  const handleSurprisePrompt = (type: ReelFormat) => {
    setReelFormat(type);
    let chosenTopic = "";
    if (type === "split_screen_asmr") {
      chosenTopic = "3 psychological tricks that secretly influence 90% of human decisions without anyone noticing";
      setBrollType("kinetic_sand");
      setSubtitleStyle("gold_bounce");
    } else if (type === "reddit_confession") {
      chosenTopic = "I was working late at a 24-hour convenience store when an old man handed me a key and whispered 'Never open locker 42'";
      setBrollType("hydraulic_press");
      setSubtitleStyle("punchy_red");
    } else if (type === "countdown_quiz") {
      chosenTopic = "5-question world geography challenge: Can you name the only continent without an active volcano in 5 seconds?";
      setSubtitleStyle("neon_green");
    } else if (type === "would_you_rather") {
      chosenTopic = "Would you rather have $10,000,000 right now or go back 10 years with all your current knowledge and memory?";
      setSubtitleStyle("gold_bounce");
    } else {
      chosenTopic = "Why 99% of people fail at habit building and the single 2-minute rule that guarantees consistency";
      setSubtitleStyle("clean_white");
    }
    setTopic(chosenTopic);
    triggerLiveGeneration(chosenTopic);
  };

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    triggerLiveGeneration(topic);
  };

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-8 md:px-8 space-y-6">
        {/* Header Breadcrumbs & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs font-mono">
            <Link href="/studio" className="text-slate-400 hover:text-white transition">
              Studio
            </Link>
            <span className="text-slate-600">/</span>
            <Link href="/studio/create" className="text-slate-400 hover:text-white transition">
              Create Hub
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-red-400 font-bold">Viral Retention Reels</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 font-mono">
              <ShieldCheck className="w-3 h-3" /> 100% ORIGINAL ASSETS & ROYALTY-FREE STEMS
            </span>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-black text-red-300 font-mono">
              🔥 PERSONA #3: VIRAL RETENTION REELS
            </span>
          </div>
        </div>

        {/* Hero Title & Live Progress Status Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Viral Influencers & Faceless Reels Studio</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Synthesize split-screen ASMR brainrot loops, dark Reddit horror confessions, and 5s countdown quizzes with kinetic bouncing gold subtitles.
            </p>
          </div>

          {/* Live Progress Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3.5 min-w-[280px] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                ) : generatedVideoUrl ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-red-400" />
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
                    ? "bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 animate-pulse"
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
                {activeStep === 1 && "Viral Hook Synthesis"}
                {activeStep === 2 && "Dual ASMR Split Render"}
                {activeStep === 3 && "Neural Voice & Gold Subtitles"}
                {activeStep === 4 && "1080x1920 MP4 Mastering"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            id="tab-btn-video"
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-red-500 text-white shadow-lg shadow-red-500/30"
          >
            <Smartphone className="w-3.5 h-3.5" /> 📱 9:16 Vertical Master Reel
          </button>
        </div>

        {/* Master Video Preview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-red-500/30 bg-black/90 p-4 shadow-2xl flex items-center justify-center">
            <div className="relative aspect-[9/16] max-h-[500px] w-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
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
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/10">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-[10px] font-bold mb-2">
                    VERTICAL STAGE · AWAITING HOOK
                  </span>
                  <h3 className="text-white font-bold text-xs max-w-[200px] line-clamp-2">
                    {topic || "Configure prompt and synthesize vertical reel"}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1.5 max-w-[220px]">
                    {isGenerating
                      ? "Synthesizing 9:16 vertical stream with kinetic acoustics..."
                      : "No mock playback. Click Synthesize below to compile your reel."}
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerLiveGeneration(topic)}
                    disabled={isGenerating}
                    className="mt-4 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isGenerating ? "Synthesizing..." : "Synthesize Reel"}</span>
                  </button>
                </div>
              )}
              <div className="absolute top-3 left-3 rounded-full border border-red-500/40 bg-black/70 px-2.5 py-0.5 text-[9px] font-mono font-bold text-red-300 backdrop-blur-md z-20">
                9:16 VERTICAL · 3S HOOK ENGINE · CLEAN STAGE
              </div>
              <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/70 px-2.5 py-0.5 text-[9px] font-mono text-slate-300 backdrop-blur-md z-20">
                ⏱️ 30s MASTER TIMELINE
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400 font-mono">
                Retention Telemetry
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                  <span>Aspect Ratio</span>
                  <span className="font-mono text-white font-bold">9:16 Vertical Reel</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                  <span>Hook Velocity</span>
                  <span className="font-mono text-emerald-400 font-bold">0.4s Drop</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                  <span>Subtitle Animation</span>
                  <span className="font-mono text-amber-300 font-bold">Gold Bounce Kinetic</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-400">
                  <span>BGM Frequency</span>
                  <span className="font-mono text-white font-bold">Phonk / Trap 140BPM</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {generatedVideoUrl ? (
                <a
                  href={generatedVideoUrl}
                  download="zyvoriq_viral_reel_master.mp4"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 text-xs transition shadow-lg shadow-red-500/20"
                >
                  📥 Download Master 9:16 Reel
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => alert("No synthesized reel available yet. Please click 'Synthesize 9:16 Viral Reel' above to begin.")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold py-2.5 text-xs transition cursor-pointer"
                >
                  📥 Awaiting Synthesis
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        {/* 1-Click Prompt & Hook Bar */}
        <div className="rounded-3xl border border-red-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-red-400 font-mono flex items-center gap-2">
              <Flame className="w-4 h-4" /> 1-Click Viral Hook & Topic Concept
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSurprisePrompt("split_screen_asmr")}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Split className="w-3.5 h-3.5" /> 🧠 ASMR Split
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("reddit_confession")}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200 transition bg-red-400/10 border border-red-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> 👻 Reddit Horror
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("countdown_quiz")}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> ⏱️ 5s Quiz
              </button>
              <button
                type="button"
                onClick={() => handleSurprisePrompt("would_you_rather")}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-purple-200 transition bg-purple-400/10 border border-purple-400/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" /> 🤔 Would You Rather
              </button>
            </div>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            placeholder="Describe your hook and story (e.g. '3 psychological tricks that secretly influence 90% of human decisions without anyone noticing')..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-4 text-base md:text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition"
          />
        </div>

        {/* 2-Column Desktop Grid: Studio Controls (Left) + Phone Simulator (Right) */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Production Controls (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Format Selector */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-400" /> 1. Viral Video Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: "split_screen_asmr", label: "Split-Screen ASMR / Brainrot", sub: "Top Story + Bottom Kinetic Sand/Soap" },
                  { id: "reddit_confession", label: "Dark Reddit Horror Story", sub: "Text suspense + dramatic audio drone" },
                  { id: "countdown_quiz", label: "5s Countdown Trivia Quiz", sub: "Ticking progress bar + buzzer reveal" },
                  { id: "would_you_rather", label: "Would You Rather Poll", sub: "50/50 comparison + community vote %" },
                  { id: "talking_head", label: "AI Talking Head Influencer", sub: "Solo avatar presenter delivery" }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setReelFormat(fmt.id as ReelFormat)}
                    className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                      reelFormat === fmt.id
                        ? "border-red-400 bg-red-500/20 text-white shadow-md shadow-red-500/20"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fmt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitles & Inset B-Roll Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Kinetic Subtitle Style */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" /> 2. Kinetic Subtitle Style
                </label>
                <div className="space-y-2">
                  {[
                    { id: "gold_bounce", label: "🟡 Bouncing Gold (Hormozi)", sub: "Bold yellow animated pop" },
                    { id: "neon_green", label: "🟢 Neon Toxic Glow", sub: "Cyberpunk high-contrast green" },
                    { id: "punchy_red", label: "🔴 Punchy Red Alert", sub: "Urgent red capitalization" },
                    { id: "clean_white", label: "⚪ Clean White Shadow", sub: "Minimalist black stroke" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubtitleStyle(sub.id as SubtitleStyle)}
                      className={`w-full rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        subtitleStyle === sub.id
                          ? "border-amber-400 bg-amber-500/20 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold">{sub.label}</div>
                      <div className="text-[10px] text-slate-400">{sub.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Inset B-Roll */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Split className="w-4 h-4 text-teal-400" /> 3. Bottom Split ASMR Inset
                </label>
                <div className="space-y-2">
                  {[
                    { id: "kinetic_sand", label: "🏖️ Kinetic Sand Slicing", sub: "Hypnotic 60fps sand blade" },
                    { id: "soap_cutting", label: "🧼 Crisp Soap Cube Slicing", sub: "Satisfying tactile crunch" },
                    { id: "subway_3d", label: "🎮 3D Runner Obstacle Loop", sub: "High-speed arcade runner" },
                    { id: "hydraulic_press", label: "🔨 Hydraulic Press ASMR", sub: "Heavy crushing loops" },
                    { id: "slime_stretch", label: "🔮 Slime ASMR Knead", sub: "Pastel colored bubble pop" }
                  ].map((broll) => (
                    <button
                      key={broll.id}
                      type="button"
                      disabled={reelFormat !== "split_screen_asmr"}
                      onClick={() => setBrollType(broll.id as BrollType)}
                      className={`w-full rounded-xl border p-2.5 text-left transition cursor-pointer ${
                        reelFormat !== "split_screen_asmr"
                          ? "opacity-40 cursor-not-allowed border-white/5 bg-white/[0.01]"
                          : brollType === broll.id
                          ? "border-teal-400 bg-teal-500/20 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold">{broll.label}</div>
                      <div className="text-[10px] text-slate-400">{broll.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Retention Engine: Speed & BGM */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Voice Speed Multiplier */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-400" /> 4. Voiceover Speed & Pacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1.0x", label: "1.0x Normal" },
                    { id: "1.15x", label: "1.15x Retention" },
                    { id: "1.25x", label: "1.25x Rapid" }
                  ].map((spd) => (
                    <button
                      key={spd.id}
                      type="button"
                      onClick={() => setVoiceSpeed(spd.id as any)}
                      className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
                        voiceSpeed === spd.id
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Music Stems */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" /> 5. Royalty-Free Music Stem
                </label>
                <select
                  value={bgmType}
                  onChange={(e) => setBgmType(e.target.value as BgmType)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-base md:text-xs font-bold text-white outline-none focus:border-purple-400"
                >
                  <option value="phonk_trap">🔥 Upbeat Phonk Drift (High Adrenaline)</option>
                  <option value="dark_horror">🎻 Suspense Horror Drone (True Crime / Reddit)</option>
                  <option value="lofi_chill">☕ Lo-Fi Chill Beats (Study / Reflection)</option>
                  <option value="synthwave">⚡ Retro Synthwave Drive (Tech / Growth)</option>
                  <option value="none">🔇 Clean Voice Only (No Music)</option>
                </select>
              </div>
            </div>

            {/* Format & Duration */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "9:16", label: "9:16 Vertical", icon: Smartphone },
                    { id: "16:9", label: "16:9 Cinema", icon: Tv },
                    { id: "1:1", label: "1:1 Square", icon: Square }
                  ].map((item) => (
                    <button
                      key={item.id}
                      id={`btn-aspect-${item.id.replace(":", "-")}`}
                      type="button"
                      onClick={() => setAspectRatio(item.id as any)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition cursor-pointer ${
                        aspectRatio === item.id
                          ? "border-red-400 bg-red-500/20 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mb-1 text-red-400" />
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                  Target Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { sec: 8, label: "8s Hook" },
                    { sec: 15, label: "15s Viral" },
                    { sec: 30, label: "30s Standard" },
                    { sec: 60, label: "60s Story" }
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDurationSec(item.sec)}
                      className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
                        durationSec === item.sec
                          ? "border-red-400 bg-red-500/20 text-red-200"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Viewport Simulator (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            <div className="rounded-3xl border border-white/15 bg-slate-900/90 p-5 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  {aspectRatio === "9:16" ? (
                    <Smartphone className="w-4 h-4 text-red-400" />
                  ) : aspectRatio === "16:9" ? (
                    <Tv className="w-4 h-4 text-red-400" />
                  ) : (
                    <Square className="w-4 h-4 text-red-400" />
                  )}
                  <span>{aspectRatio} Live Preview</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE SIMULATOR
                </span>
              </div>

              {/* Dynamic Viewport Mockup Frame */}
              <div
                className={`relative w-full mx-auto rounded-[24px] border-4 border-slate-700 bg-black overflow-hidden shadow-2xl flex flex-col justify-between p-3 transition-all duration-300 ${
                  aspectRatio === "9:16"
                    ? "aspect-[9/16] max-w-[280px]"
                    : aspectRatio === "16:9"
                    ? "aspect-[16/9] max-w-[420px]"
                    : "aspect-square max-w-[320px]"
                }`}
              >
                {/* Top Notch / Status */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-1 z-10">
                  <span>9:41</span>
                  <div className="w-12 h-2.5 bg-slate-800 rounded-full mx-auto" />
                  <span className="text-red-400 font-bold">● REC</span>
                </div>

                {/* Top Video Half: Content / Hook */}
                <div className="flex-1 flex flex-col justify-center items-center text-center p-2 z-10">
                  <div className="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md mb-2 tracking-wider animate-pulse">
                    🚨 WAIT FOR IT
                  </div>
                  <p className="text-xs font-bold text-white leading-tight line-clamp-3">
                    {topic || "3 psychological tricks that secretly influence 90% of human decisions..."}
                  </p>

                  {/* Kinetic Subtitle Demo */}
                  <div className="mt-4 px-2 py-1 rounded-lg">
                    {subtitleStyle === "gold_bounce" && (
                      <span className="text-sm font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                        ✨ SECRETLY INFLUENCE ✨
                      </span>
                    )}
                    {subtitleStyle === "neon_green" && (
                      <span className="text-sm font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] uppercase tracking-wide">
                        ⚡ SECRETLY INFLUENCE ⚡
                      </span>
                    )}
                    {subtitleStyle === "punchy_red" && (
                      <span className="text-sm font-black text-rose-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                        💥 SECRETLY INFLUENCE 💥
                      </span>
                    )}
                    {subtitleStyle === "clean_white" && (
                      <span className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                        Secretly Influence
                      </span>
                    )}
                  </div>
                </div>

                {/* Split Screen Separator (if split screen) */}
                {reelFormat === "split_screen_asmr" && (
                  <div className="h-0.5 bg-gradient-to-r from-teal-400 via-amber-400 to-red-400 w-full my-1 relative">
                    <span className="absolute -top-2 right-2 bg-slate-900 border border-teal-400/40 text-[8px] font-mono text-teal-300 px-1 rounded">
                      60 FPS ASMR
                    </span>
                  </div>
                )}

                {/* Bottom Video Half: ASMR B-Roll / Trivia Bar */}
                <div className="h-28 rounded-2xl bg-gradient-to-t from-slate-900/90 to-slate-800/40 border border-white/5 flex flex-col justify-end p-2 z-10">
                  {reelFormat === "split_screen_asmr" && (
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-teal-300">
                        {brollType === "kinetic_sand" && "🏖️ Kinetic Sand Slicing (Bottom Loop)"}
                        {brollType === "soap_cutting" && "🧼 Soap Cube Crunch (Bottom Loop)"}
                        {brollType === "subway_3d" && "🎮 3D Runner Obstacle (Bottom Loop)"}
                        {brollType === "hydraulic_press" && "🔨 Hydraulic Press ASMR (Bottom Loop)"}
                        {brollType === "slime_stretch" && "🔮 Slime ASMR Knead (Bottom Loop)"}
                      </span>
                    </div>
                  )}
                  {reelFormat === "countdown_quiz" && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-emerald-300">
                        <span>Countdown:</span>
                        <span>04.8s</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-emerald-400" />
                      </div>
                    </div>
                  )}
                  {reelFormat === "reddit_confession" && (
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-rose-300">
                        📻 Suspense Waveform 1.15x Active
                      </span>
                    </div>
                  )}
                  {reelFormat === "would_you_rather" && (
                    <div className="grid grid-cols-2 gap-1 text-[8px] font-bold text-center">
                      <div className="bg-red-500/30 p-1 rounded">Option A: 68%</div>
                      <div className="bg-blue-500/30 p-1 rounded">Option B: 32%</div>
                    </div>
                  )}

                  {/* Audio & Speed Tag */}
                  <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5 text-purple-400" />
                      {bgmType}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                      {voiceSpeed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-rose-500 py-3.5 text-xs font-black text-obsidian-950 shadow-xl shadow-red-500/25 hover:from-red-400 hover:to-rose-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                      <span>Synthesizing Viral Reel...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 fill-current" />
                      <span>🚀 Synthesize Viral Reel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </StudioSidebar>
  );
}

export default function ReelCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 text-slate-400 p-8">Loading Viral Reel Studio...</div>}>
      <ReelCreateContent />
    </Suspense>
  );
}
