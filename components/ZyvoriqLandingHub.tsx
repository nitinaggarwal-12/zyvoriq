"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Music,
  Clapperboard,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Eye,
  ShieldCheck,
  Layers,
  Gauge,
  Palette,
  Wand2,
  Radio,
  Compass,
  Maximize2,
} from "lucide-react";

type StudioFormatId = "reels" | "music_video" | "feature_films";

interface SandboxScenePreset {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  durationSec: number;
  aspectBadge: string;
  defaultPrompt: string;
  castLead: string;
  acousticSpec: string;
}

interface StudioCardConfig {
  id: StudioFormatId;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  studioHref: string;
  studioButtonText: string;
  accentColor: "teal" | "purple" | "amber";
  aspectClass: string;
  heroVideoUrl: string;
  specs: string[];
  presets: SandboxScenePreset[];
}

const STUDIO_CONFIGS: Record<StudioFormatId, StudioCardConfig> = {
  reels: {
    id: "reels",
    title: "9:16 Viral Reels",
    badge: "9:16 VERTICAL • ZERO FACE DRIFT",
    tagline: "Unbroken vertical social cinema with 100% biometric identity lock.",
    description:
      "Generate 15s–45s continuous vertical reels with sequential tail-frame chaining (PSNR < 25dB), dynamic facial anchors, and C2PA/SynthID disclosure.",
    studioHref: "/reels",
    studioButtonText: "Enter Reel Studio",
    accentColor: "teal",
    aspectClass: "aspect-[9/16] max-h-[380px]",
    heroVideoUrl: "/assets/video/studio1_e2e00945.mp4",
    specs: ["15s–45s Unbroken", "Tail-Frame Chained", "100% Face Lock"],
    presets: [
      {
        id: "reel_cyberpunk",
        title: "Midnight Cyberpunk Dance",
        subtitle: "Shinjuku Neon Rain • 8 Continuous Shots",
        videoUrl: "/assets/video/studio1_e2e00945.mp4",
        durationSec: 42,
        aspectBadge: "9:16 Vertical",
        castLead: "Aria Chen (Biometric Anchor #A104)",
        acousticSpec: "Synthwave Bass Drop • -14.0 LUFS",
        defaultPrompt:
          "Street dancer performing liquid popping choreography in neon-lit Shinjuku rain at midnight, continuous 35mm gimbal push-in, wet asphalt reflections, 100% facial identity lock across 8 unbroken shots.",
      },
      {
        id: "reel_alpine",
        title: "Alpine Sunrise Expedition",
        subtitle: "Dolomites Ridge • Golden Hour Aerial",
        videoUrl: "/assets/video/studio1_01bd8d8d.mp4",
        durationSec: 24,
        aspectBadge: "9:16 Vertical",
        castLead: "Marcus Vance (Mountaineer Anchor #M22)",
        acousticSpec: "Cinematic strings + wind foley • -16.0 LUFS",
        defaultPrompt:
          "Solo mountaineer traversing a razor-sharp snowy ridge at sunrise in the Italian Dolomites, sweeping drone orbit, crisp sunlight flare over alpine peaks.",
      },
      {
        id: "reel_dune",
        title: "Dune Nomad Odyssey",
        subtitle: "Sahara Twilight • Anamorphic Vertical",
        videoUrl: "/assets/video/studio1_290443e2.mp4",
        durationSec: 30,
        aspectBadge: "9:16 Vertical",
        castLead: "Zahara Al-Mansoor (Desert Anchor #Z09)",
        acousticSpec: "Ethnic duduk + deep sub-bass pulse",
        defaultPrompt:
          "Nomadic traveler walking across towering golden sand dunes at twilight, flowing indigo silk scarf catching desert wind, tracking profile shot.",
      },
      {
        id: "reel_cosmic",
        title: "Cosmic Deep Space Ascent",
        subtitle: "Orbital Station • Zero-G Continuity",
        videoUrl: "/assets/video/studio1_9f360810.mp4",
        durationSec: 34,
        aspectBadge: "9:16 Vertical",
        castLead: "Commander Elena Rostova (Anchor #E88)",
        acousticSpec: "Ambient modular synth + comms crackle",
        defaultPrompt:
          "Astronaut drifting through a glass observation cupola overlooking Earth's glowing aurora borealis, helmet visor reflecting starlight, continuous slow-motion zero-G rotation.",
      },
    ],
  },
  music_video: {
    id: "music_video",
    title: "Music Video Studio",
    badge: "OMNI 1.1 HYBRID • LYRIA 3.5 MASTER",
    tagline: "Polyphonic DeepMind Lyria 3.5 soundtracks locked to vocal visemes.",
    description:
      "Produce multi-artist music videos with genuine Lyria 3.5 polyphonic masters, Demucs vocal stem isolation, and zero phantom mouthing during instrumental drops.",
    studioHref: "/music-video",
    studioButtonText: "Enter Music Video Studio",
    accentColor: "purple",
    aspectClass: "aspect-[9/16] max-h-[380px]",
    heroVideoUrl: "/renders/yt/yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069/master_hybrid.mp4",
    specs: ["Lyria 3.5 Master", "Demucs Vocal Stem", "Zero Phantom Mouthing"],
    presets: [
      {
        id: "mv_shibuya",
        title: "Neon Skies — Shibuya Runway",
        subtitle: "Dual Lead Performers • 124 BPM Electro-Pop",
        videoUrl: "/renders/yt/yt_5d8d946f-2528-4c23-9f4f-d9c1c960a069/master_hybrid.mp4",
        durationSec: 24,
        aspectBadge: "9:16 MV Master",
        castLead: "Performer A & Performer B (Dual Biometric Lock)",
        acousticSpec: "Lyria 3.5 Master + Demucs Vocal Stem (-14.0 LUFS)",
        defaultPrompt:
          "Lyrics: Chasing stars in the midnight glow / Watch our fire begin to grow. High-fashion sequin choreography under magenta and cyan neon lights, synchronized spin on the beat drop.",
      },
      {
        id: "mv_punjabi",
        title: "Royal Chandigarh Mainstage",
        subtitle: "Punjabi Pop Anthem • Concert LED Wall",
        videoUrl: "/renders/yt/yt_punjabi_stage_omni_hybrid/master_hybrid.mp4",
        durationSec: 24,
        aspectBadge: "9:16 MV Master",
        castLead: "Simran Kaur & Badshah Style Ensemble",
        acousticSpec: "118 BPM Urban Bhangra Groove + Live Crowd",
        defaultPrompt:
          "High-energy Punjabi college festival mainstage performance with pyrotechnics, heavy bass dhol drop, designer embroidered streetwear, dynamic crane sweeps.",
      },
      {
        id: "mv_ibiza",
        title: "Mediterranean Sunlit Pool Party",
        subtitle: "Summer Tropical House • 120 BPM",
        videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/master_hybrid.mp4",
        durationSec: 24,
        aspectBadge: "9:16 MV Master",
        castLead: "Elena & Sofia (Summer Resort Wardrobe Lock)",
        acousticSpec: "Lyria 3.5 Tropical House Synth + Water Splash SFX",
        defaultPrompt:
          "Sun-drenched luxury infinity pool overlooking the Mediterranean sea, authentic resort swimwear, rhythmic poolside dance choreography under golden sunlight.",
      },
      {
        id: "mv_club",
        title: "Midnight Electric Club Anthem",
        subtitle: "VIP Laser Lounge • High-Contrast Optics",
        videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/master_hybrid.mp4",
        durationSec: 24,
        aspectBadge: "9:16 MV Master",
        castLead: "Airi Sato (Tokyo Shibuya Mode Lead)",
        acousticSpec: "Deep Club Sub-Bass (35Hz–20kHz Intact)",
        defaultPrompt:
          "Underground luxury nightclub with volumetric laser beams and atmospheric haze, confident vogue hand framing and rhythmic choreography locked to 126 BPM kick drum.",
      },
    ],
  },
  feature_films: {
    id: "feature_films",
    title: "Feature Films Studio",
    badge: "2.39:1 ANAMORPHIC • 180s THEATRICAL",
    tagline: "Widescreen 2.39:1 theatrical cinema across 5 classical dramatic acts.",
    description:
      "Direct 180-second theatrical feature film masters in Cooke Anamorphic Scope with multi-character ensemble continuity, historical lore grounding, and -24.0 LUFS symphonic scores.",
    studioHref: "/feature-films",
    studioButtonText: "Enter Feature Film Studio",
    accentColor: "amber",
    aspectClass: "aspect-[16/9] max-h-[260px]",
    heroVideoUrl: "/assets/video/napoleon_30s_cut.mp4",
    specs: ["2.39:1 Scope", "5-Act Screenplay", "-24.0 LUFS Symphonic"],
    presets: [
      {
        id: "film_napoleon",
        title: "Napoleon: The 1804 Coronation",
        subtitle: "Notre-Dame Cathedral • Cooke Anamorphic 2.39:1",
        videoUrl: "/assets/video/napoleon_30s_cut.mp4",
        durationSec: 30,
        aspectBadge: "2.39:1 Scope",
        castLead: "Emperor Napoleon & Empress Joséphine",
        acousticSpec: "Full Orchestral Brass & Choir Score (-24.0 LUFS)",
        defaultPrompt:
          "Interior Notre-Dame Cathedral, 1804. Candlelight reflecting off imperial crimson velvet and gold brocade. Slow, majestic dolly push-in as Napoleon raises the imperial crown.",
      },
      {
        id: "film_coronation",
        title: "Sovereign Crown: Westminster Abbey",
        subtitle: "Royal Historical Drama • 50mm Anamorphic Prime",
        videoUrl: "/assets/video/coronation_30s_cut.mp4",
        durationSec: 30,
        aspectBadge: "2.39:1 Scope",
        castLead: "Royal Sovereign Ensemble (Biometric Period Lock)",
        acousticSpec: "Symphonic Strings + Cathedral Organ Acoustics",
        defaultPrompt:
          "Shafts of volumetric morning light piercing Westminster Abbey stone arches. Regal procession in authentic 19th-century ceremonial regalia, deep depth of field.",
      },
      {
        id: "film_neotokyo",
        title: "Neo-Tokyo 2099: Cyber-Noir Act I",
        subtitle: "Sci-Fi Theatrical Feature • Rain-Slicked Megacity",
        videoUrl: "/assets/video/neotokyo_30s_cut.mp4",
        durationSec: 30,
        aspectBadge: "2.39:1 Scope",
        castLead: "Detective Kenji Sato (Cyber-Noir Anchor #K01)",
        acousticSpec: "Vangelis-Style Analog CS-80 Brass Score",
        defaultPrompt:
          "Widescreen 2.39:1 anamorphic vista of Neo-Tokyo megastructures shrouded in acid rain and holographic billboards. Spinner vehicle banking through neon canyon.",
      },
      {
        id: "film_titanic",
        title: "1912 North Atlantic: Grand Staircase",
        subtitle: "Period Romance Epic • Warm Tungsten Optics",
        videoUrl: "/assets/video/titanic_30s_cut.mp4",
        durationSec: 30,
        aspectBadge: "2.39:1 Scope",
        castLead: "Edwardian Lead Duo (Period Wardrobe Lock)",
        acousticSpec: "Celtic Chamber Ensemble & Solo Violin (-24.0 LUFS)",
        defaultPrompt:
          "Opulent 1912 ocean liner First Class Grand Staircase under crystal chandelier glow. Sweeping Steadicam crane shot capturing period evening gowns and tuxedos.",
      },
    ],
  },
};

const LUT_FILTERS: Record<string, { label: string; cssFilter: string; badgeColor: string }> = {
  none: {
    label: "Original Cinema (Unaltered)",
    cssFilter: "none",
    badgeColor: "border-slate-500/30 text-slate-300",
  },
  cyberpunk_neon: {
    label: "Cyberpunk Neon",
    cssFilter: "contrast(1.18) saturate(1.42) hue-rotate(-8deg) brightness(1.03)",
    badgeColor: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
  },
  golden_hour_warm: {
    label: "Golden Hour Warm",
    cssFilter: "contrast(1.08) saturate(1.28) sepia(0.22) brightness(1.04)",
    badgeColor: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  },
  mediterranean_sunlit: {
    label: "Mediterranean Sunlit",
    cssFilter: "contrast(1.12) saturate(1.35) brightness(1.06)",
    badgeColor: "border-teal-500/40 text-teal-300 bg-teal-500/10",
  },
  bollywood_royal: {
    label: "Bollywood Royal",
    cssFilter: "contrast(1.18) saturate(1.45) sepia(0.12) brightness(1.02)",
    badgeColor: "border-purple-500/40 text-purple-300 bg-purple-500/10",
  },
  vintage_film: {
    label: "Vintage 35mm Film",
    cssFilter: "contrast(1.08) saturate(0.78) sepia(0.28) brightness(0.98)",
    badgeColor: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  },
};

export function ZyvoriqLandingHub() {
  // Card & Sandbox Selection State
  const [activeFormat, setActiveFormat] = useState<StudioFormatId>("reels");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Interactive Non-Destructive Sandbox Controls State
  const [selectedLut, setSelectedLut] = useState<string>("none");
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [vocalVolume, setVocalVolume] = useState<number>(100);
  const [musicVolume, setMusicVolume] = useState<number>(100);
  const [sfxPreset, setSfxPreset] = useState<string>("none");
  const [showFramingGrid, setShowFramingGrid] = useState<boolean>(false);
  const [showAnamorphicMatte, setShowAnamorphicMatte] = useState<boolean>(false);
  const [sandboxPrompt, setSandboxPrompt] = useState<string>(
    STUDIO_CONFIGS.reels.presets[0].defaultPrompt
  );
  const [simulatedAuditPassed, setSimulatedAuditPassed] = useState<boolean>(false);

  // Card video preview mute states
  const [mutedCard, setMutedCard] = useState<Record<StudioFormatId, boolean>>({
    reels: true,
    music_video: true,
    feature_films: true,
  });

  // Sandbox main video player state
  const sandboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const [sandboxPlaying, setSandboxPlaying] = useState<boolean>(true);
  const [sandboxMuted, setSandboxMuted] = useState<boolean>(true);

  const currentConfig = STUDIO_CONFIGS[activeFormat];
  const currentPreset =
    currentConfig.presets[selectedPresetIndex] || currentConfig.presets[0];

  // Sync sandbox prompt when switching format or preset
  const handleSelectFormatAndOpenSandbox = (formatId: StudioFormatId, scroll = true) => {
    setActiveFormat(formatId);
    setSelectedPresetIndex(0);
    setSandboxPrompt(STUDIO_CONFIGS[formatId].presets[0].defaultPrompt);
    setSimulatedAuditPassed(false);
    if (formatId === "feature_films") {
      setShowAnamorphicMatte(true);
    } else {
      setShowAnamorphicMatte(false);
    }
    if (scroll && typeof window !== "undefined") {
      const el = document.getElementById("sandbox-workbench");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = currentConfig.presets[idx];
    if (preset) {
      setSandboxPrompt(preset.defaultPrompt);
      setSimulatedAuditPassed(false);
    }
  };

  const handleResetSandbox = () => {
    setSelectedLut("none");
    setPlaybackRate(1.0);
    setVocalVolume(100);
    setMusicVolume(100);
    setSfxPreset("none");
    setShowFramingGrid(false);
    setShowAnamorphicMatte(activeFormat === "feature_films");
    setSandboxPrompt(currentPreset.defaultPrompt);
    setSimulatedAuditPassed(false);
  };

  // Apply real-time playback rate and volume to the sandbox video element
  useEffect(() => {
    if (sandboxVideoRef.current) {
      sandboxVideoRef.current.playbackRate = playbackRate;
      const combinedGain = Math.min(1.0, ((vocalVolume + musicVolume) / 200));
      sandboxVideoRef.current.volume = combinedGain;
    }
  }, [playbackRate, vocalVolume, musicVolume, currentPreset.videoUrl]);

  const toggleSandboxPlay = () => {
    if (!sandboxVideoRef.current) return;
    if (sandboxVideoRef.current.paused) {
      sandboxVideoRef.current.play().catch(() => {});
      setSandboxPlaying(true);
    } else {
      sandboxVideoRef.current.pause();
      setSandboxPlaying(false);
    }
  };

  const toggleSandboxMute = () => {
    if (!sandboxVideoRef.current) return;
    const next = !sandboxMuted;
    sandboxVideoRef.current.muted = next;
    setSandboxMuted(next);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-teal-500/30 selection:text-teal-100">
      {/* MAIN WORKSPACE CONTAINER (Strict Viewport Breadth: max-w-[1600px] mx-auto px-6 md:px-12) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 md:py-12 space-y-12">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Sandbox &amp; Multi-Format AI Production Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Direct Unbroken AI Cinema Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-purple-300 to-amber-300">
              All Three Formats.
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Click any studio card below to open its interactive{" "}
            <strong className="text-white font-semibold">Sandbox Editor Controls</strong> and test
            real-time LUT color grading, speed cadence, and acoustic mixing without saving—or launch directly into the full production studio.
          </p>
        </section>

        {/* 3 SIDE-BY-SIDE FORMAT CARDS */}
        <section aria-label="Production Formats" className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
          {(["reels", "music_video", "feature_films"] as StudioFormatId[]).map((formatId) => {
            const card = STUDIO_CONFIGS[formatId];
            const isSelected = activeFormat === formatId;

            const borderAccent =
              card.accentColor === "teal"
                ? isSelected
                  ? "border-teal-400 shadow-2xl shadow-teal-500/20 ring-2 ring-teal-400/30"
                  : "border-white/10 hover:border-teal-500/50"
                : card.accentColor === "purple"
                ? isSelected
                  ? "border-purple-400 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-400/30"
                  : "border-white/10 hover:border-purple-500/50"
                : isSelected
                ? "border-amber-400 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/30"
                : "border-white/10 hover:border-amber-500/50";

            const badgeColor =
              card.accentColor === "teal"
                ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                : card.accentColor === "purple"
                ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30";

            const primaryBtnColor =
              card.accentColor === "teal"
                ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-[#07090E] hover:brightness-110 shadow-lg shadow-teal-500/25"
                : card.accentColor === "purple"
                ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:brightness-110 shadow-lg shadow-purple-500/25"
                : "bg-gradient-to-r from-amber-400 to-orange-500 text-[#07090E] hover:brightness-110 shadow-lg shadow-amber-500/25";

            return (
              <div
                key={card.id}
                onClick={() => handleSelectFormatAndOpenSandbox(card.id, true)}
                className={`group relative rounded-3xl bg-[#0D111A] border-2 p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${borderAccent}`}
              >
                {/* Top Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                      {card.badge}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                        Active in Sandbox
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5" /> Click to sandbox
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {card.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-300 mt-1">
                    {card.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Video Preview Showcase Container */}
                <div className="my-5 relative rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center h-[260px]">
                  <video
                    src={card.heroVideoUrl}
                    playsInline
                    autoPlay
                    loop
                    muted={mutedCard[card.id]}
                    preload="auto"
                    className={`w-full h-full ${
                      card.id === "feature_films" ? "object-cover" : "object-contain bg-black"
                    }`}
                  />
                  {/* Top-right Mute Toggle on Card Video */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMutedCard((prev) => ({ ...prev, [card.id]: !prev[card.id] }));
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all"
                    title={mutedCard[card.id] ? "Unmute Preview" : "Mute Preview"}
                  >
                    {mutedCard[card.id] ? (
                      <VolumeX className="w-4 h-4 text-slate-300" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-teal-400" />
                    )}
                  </button>

                  {/* Spec Chips Overlay */}
                  <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
                    {card.specs.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="space-y-2.5 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  {/* Button 1: Open Interactive Sandbox Editor Controls */}
                  <button
                    type="button"
                    onClick={() => handleSelectFormatAndOpenSandbox(card.id, true)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
                      isSelected
                        ? "bg-white/15 border-white/30 text-white shadow-inner"
                        : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-200"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-teal-400" />
                    <span>
                      {isSelected
                        ? `Editing ${card.title} in Sandbox Below`
                        : `Play Around with ${card.title} Controls`}
                    </span>
                  </button>

                  {/* Button 2: Direct Studio Launch Link */}
                  <Link
                    href={card.studioHref}
                    className={`w-full py-3.5 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${primaryBtnColor}`}
                  >
                    <span>{card.studioButtonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* ===================================================================== */}
        {/* INTERACTIVE SANDBOX EDITOR WORKBENCH (PLAY AROUND WITHOUT SAVING)     */}
        {/* ===================================================================== */}
        <section
          id="sandbox-workbench"
          className="rounded-3xl bg-[#0D111A] border-2 border-white/15 shadow-2xl overflow-hidden scroll-mt-24"
        >
          {/* Workbench Top Header Bar */}
          <div className="bg-[#111726] border-b border-white/10 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Format Switcher Tabs inside Sandbox */}
              <div className="inline-flex rounded-xl bg-black/50 p-1 border border-white/10">
                {(["reels", "music_video", "feature_films"] as StudioFormatId[]).map((id) => {
                  const tabCfg = STUDIO_CONFIGS[id];
                  const active = activeFormat === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectFormatAndOpenSandbox(id, false)}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                        active
                          ? "bg-teal-500 text-[#07090E] shadow-md"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {id === "reels" && <Film className="w-3.5 h-3.5" />}
                      {id === "music_video" && <Music className="w-3.5 h-3.5" />}
                      {id === "feature_films" && <Clapperboard className="w-3.5 h-3.5" />}
                      <span>{tabCfg.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Non-Destructive Sandbox Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Sandbox Mode:</strong> Play around freely — changes preview live in real-time and will <u>not</u> overwrite or save to your database.
                </span>
              </div>
            </div>

            {/* Right Actions: Reset & Enter Full Studio */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              <button
                type="button"
                onClick={handleResetSandbox}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
                title="Reset Sandbox Controls"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Controls</span>
              </button>

              <Link
                href={currentConfig.studioHref}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-[#07090E] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:brightness-110 transition-all"
              >
                <span>{currentConfig.studioButtonText} (Full Production)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Workbench Main Grid: Left Live Monitor (5 cols) + Right Interactive Controls (7 cols) */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: LIVE SANDBOX MONITOR (5 COLS) */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Live Sandbox Preview Monitor
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Rate: {playbackRate.toFixed(2)}x • LUT: {LUT_FILTERS[selectedLut]?.label.split(" ")[0]}
                </span>
              </div>

              {/* Dynamic Preview Frame */}
              <div
                className={`relative w-full rounded-2xl overflow-hidden bg-black border-2 border-white/15 shadow-2xl flex items-center justify-center ${
                  activeFormat === "feature_films" ? "aspect-[16/9]" : "max-w-[280px] aspect-[9/16]"
                }`}
              >
                <video
                  ref={sandboxVideoRef}
                  key={currentPreset.videoUrl}
                  src={currentPreset.videoUrl}
                  playsInline
                  autoPlay
                  loop
                  muted={sandboxMuted}
                  preload="auto"
                  onClick={toggleSandboxPlay}
                  style={{
                    filter: LUT_FILTERS[selectedLut]?.cssFilter || "none",
                  }}
                  className="w-full h-full object-cover cursor-pointer transition-all duration-300"
                />

                {/* Optional 2.39:1 Anamorphic Letterbox Matte Overlay */}
                {showAnamorphicMatte && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-[12%] bg-black z-20 pointer-events-none border-b border-white/10 flex items-center justify-center">
                      <span className="text-[9px] font-mono tracking-widest text-amber-400/70 uppercase">
                        2.39:1 Cooke Anamorphic Scope Matte
                      </span>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 h-[12%] bg-black z-20 pointer-events-none border-t border-white/10" />
                  </>
                )}

                {/* Optional Rule of Thirds / Framing Grid Overlay */}
                {showFramingGrid && (
                  <div className="absolute inset-0 z-20 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-teal-400/30" />
                    <div className="border-r border-b border-teal-400/30" />
                    <div className="border-b border-teal-400/30" />
                    <div className="border-r border-b border-teal-400/30" />
                    <div className="border-r border-b border-teal-400/30" />
                    <div className="border-b border-teal-400/30" />
                    <div className="border-r border-teal-400/30" />
                    <div className="border-r border-teal-400/30" />
                    <div />
                  </div>
                )}

                {/* Play/Mute Overlay Controls */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSandboxMute}
                    className="w-8 h-8 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all"
                    title={sandboxMuted ? "Unmute Sandbox Audio" : "Mute Sandbox Audio"}
                  >
                    {sandboxMuted ? (
                      <VolumeX className="w-4 h-4 text-amber-300" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-teal-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSandboxPlay}
                    className="w-8 h-8 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black transition-all"
                    title={sandboxPlaying ? "Pause" : "Play"}
                  >
                    {sandboxPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 translate-x-0.5 text-teal-400" />
                    )}
                  </button>
                </div>

                {/* Bottom Live Metadata Pill inside Video */}
                <div className="absolute bottom-3 inset-x-3 z-30 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 flex flex-col gap-1 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {currentPreset.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      {currentPreset.aspectBadge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 truncate">
                    {currentPreset.castLead}
                  </span>
                </div>
              </div>

              {/* Quick Scene / Persona Selector Filmstrip for Active Format */}
              <div className="w-full space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    Switch {currentConfig.title} Sample Scene:
                  </span>
                  <span className="text-[11px] text-slate-500">4 Pre-Loaded Masters</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {currentConfig.presets.map((preset, idx) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedPresetIndex === idx
                          ? "bg-teal-500/15 border-teal-400 text-white shadow-md"
                          : "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs font-bold truncate block">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                        {preset.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE SANDBOX EDITOR CONTROLS (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Control Group 1: Optical Color Grading LUTs */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span>1. Optical Color Grading &amp; Cinema LUT (Live Preview)</span>
                  </label>
                  <span className="text-xs font-mono text-teal-300">
                    {LUT_FILTERS[selectedLut]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(LUT_FILTERS).map(([key, lut]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedLut(key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        selectedLut === key
                          ? "bg-teal-500 text-[#07090E] border-teal-400 shadow-md"
                          : "bg-black/40 border-white/10 text-slate-300 hover:border-white/30"
                      }`}
                    >
                      <span className="truncate">{lut.label}</span>
                      {selectedLut === key && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Group 2: Playback Speed Cadence & Viewport Guides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Speed Cadence */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      <span>2. Speed Cadence</span>
                    </label>
                    <span className="text-xs font-mono text-purple-300">{playbackRate}x</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setPlaybackRate(rate)}
                        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                          playbackRate === rate
                            ? "bg-purple-500 text-white border-purple-400"
                            : "bg-black/40 border-white/10 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Framing Guides */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>3. Director Framing Guides</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFramingGrid(!showFramingGrid)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        showFramingGrid
                          ? "bg-teal-500/20 border-teal-400 text-teal-300"
                          : "bg-black/40 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Rule of Thirds</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnamorphicMatte(!showAnamorphicMatte)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                        showAnamorphicMatte
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-black/40 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>2.39:1 Matte</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Control Group 3: Acoustic Stem & Foley Mixer */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-teal-400" />
                    <span>4. Multi-Stem Acoustic Mixer &amp; Foley Ambience</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentPreset.acousticSpec}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Lead Vocal / Dialogue Stem</span>
                      <span className="font-mono text-teal-300">{vocalVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={vocalVolume}
                      onChange={(e) => setVocalVolume(Number(e.target.value))}
                      className="w-full accent-teal-400 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Lyria 3.5 / Symphonic Score Bed</span>
                      <span className="font-mono text-purple-300">{musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={150}
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Ambient SFX selector */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 mr-1">Ambient Foley Layer:</span>
                  {[
                    { id: "none", label: "None (Pure Master)" },
                    { id: "crowd_cheer", label: "🎉 Festival Crowd" },
                    { id: "vinyl_rain", label: "🌧️ Midnight Rain" },
                    { id: "ocean_waves", label: "🌊 Coastal Breeze" },
                  ].map((sfx) => (
                    <button
                      key={sfx.id}
                      type="button"
                      onClick={() => setSfxPreset(sfx.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        sfxPreset === sfx.id
                          ? "bg-teal-500/20 border-teal-400 text-teal-300"
                          : "bg-black/40 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sfx.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Group 4: Director Screenplay / Prompt Scratchpad */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <span>5. Director Prompt &amp; Screenplay Sandbox</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSimulatedAuditPassed(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                  >
                    ⚡ Test Pre-Flight Audit (Sandbox)
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={sandboxPrompt}
                  onChange={(e) => {
                    setSandboxPrompt(e.target.value);
                    setSimulatedAuditPassed(false);
                  }}
                  className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Experiment with camera optics, choreography beats, lighting, or lyrics..."
                />

                {simulatedAuditPassed && (
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>
                        <strong>Omni 1.1 Pre-Flight Sandbox Check Passed:</strong> 100% Biometric Identity Lock • Cut Boundary PSNR &lt; 25.0dB • Zero Phantom Mouthing.
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-black/40 text-teal-300 shrink-0">
                      Sandbox Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom CTA Card: Ready to Save & Produce? Enter Full Studio */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-500/15 via-purple-500/15 to-amber-500/15 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Ready to generate and save your production?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Launch the full <strong>{currentConfig.title}</strong> to run multi-shot Veo 3.1 + Lyria 3.5 rendering and save non-destructive cuts to your library.
                  </p>
                </div>

                <Link
                  href={currentConfig.studioHref}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-[#07090E] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-teal-500/25 hover:brightness-110 transition-all shrink-0"
                >
                  <span>{currentConfig.studioButtonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default ZyvoriqLandingHub;
