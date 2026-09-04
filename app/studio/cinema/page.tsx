"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StudioSidebar } from "@/components/StudioSidebar";
import {
  Clapperboard,
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Globe,
  Download,
  Share2,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  Cpu,
  Terminal,
  Activity,
  Award,
  Zap,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  Music,
  Users,
  Eye,
  Camera,
  Flame,
  Info
} from "lucide-react";

interface CinemaFilm {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  format: string;
  durationMinutes: number;
  shotCount: number;
  directorAesthetic: string;
  leadActors: string[];
  musicalScore: string;
  videoSrc: string;
  veritasScore: number;
  c2paCertId: string;
  imfStatus: string;
  availableLanguages: string[];
  subtitles: Record<string, string>;
  synopsis: string;
}

const PRELOADED_ORIGINALS: CinemaFilm[] = [
  {
    id: "film_noor_e_ishq",
    title: "Noor-e-Ishq (The Light of Love)",
    tagline: "A Grand Romance in the Swiss Alps · Yash Chopra Cinematic Directive Model",
    genre: "Romantic Epic / Musical",
    format: "Festival Short (Sweet Spot Master)",
    durationMinutes: 15,
    shotCount: 122,
    directorAesthetic: "Yash Chopra Golden Hour & Chiffon (Kodak 2383 LUT)",
    leadActors: ["Kabir Verma (syn_kabir_01)", "Meera Sen (syn_meera_02)"],
    musicalScore: "Lyria 3.0 Sitar, Sarangi & 60-Piece Orchestral Strings",
    videoSrc: "/assets/video/persona5_arthouse_cinema_reel.mp4",
    veritasScore: 97.4,
    c2paCertId: "c2pa_ed25519_zyvoriq_noor_e_ishq_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["Hindi (Native)", "English (Dubbed)", "Spanish", "French", "Japanese"],
    subtitles: {
      "hi": "कबीर: 'अगर यह ख्वाब है, तो मुझे कभी मत जगाना...'",
      "en": "Kabir: 'If this is a dream, never awaken me...'",
      "es": "Kabir: 'Si esto es un sueño, nunca me despiertes...'",
      "fr": "Kabir: 'Si c'est un rêve, ne me réveille jamais...'",
      "ja": "カビール:「これが夢なら、決して私を起こさないでくれ…」"
    },
    synopsis: "Set against the snow-covered cliffs of Grindelwald and the rain-slicked courtyards of Udaipur, Kabir, an architect of forgotten memories, encounters Meera, a classical heritage restorer. As family obligations threaten to tear them apart, their unspoken bond defies continents, culminating in a dramatic reunion at an Alpine railway station."
  },
  {
    id: "film_mongol_conquest",
    title: "The Mongol Steppe Storm: Wrath of the Khans",
    tagline: "20-Act 1,200s Master Historical Docu-Drama · Genghis Khan to the Four Khanates",
    genre: "Historical Docu-Drama",
    format: "Prestige Featurette (20 Minutes)",
    durationMinutes: 20,
    shotCount: 168,
    directorAesthetic: "Roger Deakins 50mm Anamorphic Naturalist",
    leadActors: ["Subutai Ba'atur (syn_subutai_05)", "Genghis Khan (syn_temujin_06)"],
    musicalScore: "Norse & Steppe Wardruna War Drums + Primordial Throat Chants",
    videoSrc: "/assets/video/veo_mongol_steppe_warfare_master.mp4",
    veritasScore: 98.2,
    c2paCertId: "c2pa_ed25519_mongol_steppe_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["Mongolian (Native)", "English", "Hindi", "Japanese"],
    subtitles: {
      "hi": "सूत्रधार: 'अनंत नीले आकाश के नीचे दुनिया बदलने वाली घुड़सवार सेना का उदय होता है।'"
    },
    synopsis: "The tactical mastery of Subutai and the nomadic endurance of the Mongol cavalry, chronicling the unification of the tribes and the greatest military conquest in human history."
  },
  {
    id: "film_quantum_horizon",
    title: "Quantum Horizon 2099",
    tagline: "Cyberpunk Hard Sci-Fi · Quantum-Entangled Consciousness in Old Varanasi",
    genre: "Cyberpunk Sci-Fi",
    format: "Prestige Pilot (35 Minutes)",
    durationMinutes: 35,
    shotCount: 280,
    directorAesthetic: "David Fincher Low-Key Amber & Tungsten Precision",
    leadActors: ["Tara Thorne (syn_tara_04)", "Aryan Khan-Raza (syn_aryan_03)"],
    musicalScore: "Analog Modular Synthwave + Deep Sub-Bass Drones",
    videoSrc: "/assets/video/persona2_anime_shonen_reel.mp4",
    veritasScore: 96.1,
    c2paCertId: "c2pa_ed25519_quantum_horizon_4k_master",
    imfStatus: "IMF_SMPTE_2067_CERTIFIED",
    availableLanguages: ["English", "Hindi", "Japanese"],
    subtitles: {
      "en": "Tara: 'The qubit doesn't collapse because you observe it. It collapses because it remembers you.'"
    },
    synopsis: "In a 2099 megalopolis built along the Ganges, a neuro-quantum cipher runner uncovers a state secret hidden inside an ancient temple's holographic frequency."
  }
];

export default function CinemaStudioPage() {
  const [activeTab, setActiveTab] = useState<"originals" | "produce" | "telemetry">("originals");
  const [selectedFilm, setSelectedFilm] = useState<CinemaFilm>(PRELOADED_ORIGINALS[0]);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [audioDuckingActive, setAudioDuckingActive] = useState<boolean>(true);
  const [activeVoiceStem, setActiveVoiceStem] = useState<"dialogue" | "foley" | "music">("dialogue");

  // Production Form State
  const [prodTitle, setProdTitle] = useState("Noor-e-Ishq: Chapter II (The Swiss Reprise)");
  const [prodLogline, setProdLogline] = useState("Two estranged lovers from Udaipur and Geneva meet again under the shadows of the Matterhorn during the winter solstice, with secrets neither can reveal.");
  const [prodGenre, setProdGenre] = useState("romantic_epic");
  const [prodFormat, setProdFormat] = useState<"short_15m" | "pilot_30m" | "feature_90m">("short_15m");
  const [prodDirector, setProdDirector] = useState("yash_chopra_chiffon");
  const [prodLeadCast, setProdLeadCast] = useState<string[]>(["syn_kabir_01", "syn_meera_02"]);
  const [prodMusicTheme, setProdMusicTheme] = useState("lyria_sitar_orchestral");

  // 4-Tier QA Controls
  const [arcfaceThreshold, setArcfaceThreshold] = useState<number>(0.86);
  const [kinematicGuard, setKinematicGuard] = useState<boolean>(true);
  const [visionScoreThreshold, setVisionScoreThreshold] = useState<number>(85);
  const [enableJLCut, setEnableJLCut] = useState<boolean>(true);
  const [enableFoleyIR, setEnableFoleyIR] = useState<boolean>(true);
  const [circuitBreakerRetries, setCircuitBreakerRetries] = useState<number>(3);

  // Dispatch & Live Telemetry State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genProgress, setGenProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<string>("idle");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [liveMetrics, setLiveMetrics] = useState({
    arcfaceAvg: 0.914,
    kinematicsPassYield: 98.4,
    autoRerollsHealed: 8,
    activeWorkers: 20,
    runningCostUsd: 28.50,
    shotsCompleted: 122,
    totalShots: 122
  });
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
    setVideoProgress(progress);
  };

  const handleLaunchProduction = async () => {
    setIsGenerating(true);
    setActiveTab("telemetry");
    setGenProgress(5);
    setActiveStage("Decomposing Screenplay into 122 Atomic Shot Manifests");
    setTelemetryLogs([
      `[00:00.04] Initiating Autonomous Studio OS Engine...`,
      `[00:00.12] Screenplay Parsed: 3 Acts, 122 atomic shots allocated with 3D stage eyeline vectors.`,
      `[00:00.45] Biometric Talent Vault: Locked ${prodLeadCast.join(" & ")} (ArcFace 512-dim embedding threshold: ${arcfaceThreshold}).`,
      `[00:00.90] Soundstage Engine: J-Cut/L-Cut dialogue overlap active (+800ms lead-in) · Foley IR reverb primed.`
    ]);

    try {
      const res = await fetch("/api/studio/cinema/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prodTitle,
          prompt: prodLogline,
          genre: prodGenre,
          format: prodFormat,
          leadCast: prodLeadCast,
          directorStyle: prodDirector,
          qaThresholds: {
            arcfaceMatch: arcfaceThreshold,
            kinematicPassRate: 0.95,
            geminiVisionScore: visionScoreThreshold,
            maxRetries: circuitBreakerRetries
          },
          soundstage: {
            jCutLCut: enableJLCut,
            opticalFoley: enableFoleyIR,
            autoDuckingDb: -12,
            musicalTheme: prodMusicTheme
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dispatch failed");

      // Progress animation steps simulating the 20-worker automated pipeline
      setTimeout(() => {
        setGenProgress(25);
        setActiveStage("Parallel 20x Cloud GPU Batch Dispatch (Veo 2 & Imagen 3)");
        setTelemetryLogs((prev) => [
          `[00:01.32] 20 cloud GPU workers dispatched. Shots #001 to #020 rendering concurrently.`,
          ...prev
        ]);
      }, 1000);

      setTimeout(() => {
        setGenProgress(55);
        setActiveStage("Automated 4-Tier QA Robo-Director (ArcFace & YOLOv10)");
        setTelemetryLogs((prev) => [
          `[00:02.10] 4-Tier QA Gate: 28 shots evaluated. ArcFace mean score: 0.922 (PASS).`,
          `[00:02.45] Shot #014 flagged (hand anatomy anomaly) -> Auto-reroll triggered (+137 seed jitter).`,
          `[00:02.80] Shot #014 re-evaluated: ArcFace 0.931, Kinematics 100% (SELF-HEALED).`,
          ...prev
        ]);
      }, 2000);

      setTimeout(() => {
        setGenProgress(80);
        setActiveStage("Neural Lip-Sync, Foley Impulse Response & Lyria Arranger");
        setTelemetryLogs((prev) => [
          `[00:03.20] DeepMind Emotional TTS synthesized with native Hindi phoneme cadence.`,
          `[00:03.65] Optical motion foley synced: snow footsteps, saree fabric rustle, train whistle.`,
          `[00:04.05] Lyria 3.0 Sitar & Strings stems master ducked to -12dB under spoken dialogue.`,
          ...prev
        ]);
      }, 3000);

      setTimeout(() => {
        setGenProgress(100);
        setActiveStage("Completed: 4K Master Exported & C2PA Cryptographically Signed");
        setTelemetryLogs((prev) => [
          `[00:04.50] Concat pass complete. Kodak 2383 3D LUT + 35mm film grain composited.`,
          `[00:04.80] C2PA Ed25519 digital signature embedded. IMF SMPTE 2067 package sealed.`,
          `[00:05.00] Master Film ready for distribution on Netflix, Prime Video & Zyvoriq Cinema.`,
          ...prev
        ]);
        setIsGenerating(false);

        // Prepend new film to originals
        const newFilm: CinemaFilm = {
          id: `film_custom_${Date.now()}`,
          title: prodTitle,
          tagline: prodLogline,
          genre: "Romantic Epic / Musical",
          format: prodFormat === "short_15m" ? "Festival Short (15m)" : "Prestige Feature",
          durationMinutes: prodFormat === "short_15m" ? 15 : 90,
          shotCount: prodFormat === "short_15m" ? 122 : 920,
          directorAesthetic: "Yash Chopra Golden Hour & Chiffon",
          leadActors: prodLeadCast,
          musicalScore: "Lyria 3.0 Orchestral Sitar & Strings",
          videoSrc: "/assets/video/persona5_arthouse_cinema_reel.mp4",
          veritasScore: 98.1,
          c2paCertId: `c2pa_ed25519_${Date.now()}_master`,
          imfStatus: "IMF_SMPTE_2067_CERTIFIED",
          availableLanguages: ["Hindi (Native)", "English", "Spanish"],
          subtitles: {
            "en": "Kabir: 'Time changes, but this heartbeat remains eternal.'",
            "hi": "कबीर: 'वक़्त बदल सकता है, पर यह धड़कन नहीं...'"
          },
          synopsis: prodLogline
        };
        setSelectedFilm(newFilm);
      }, 4200);

    } catch (err: any) {
      console.error("Production generation error:", err);
      setIsGenerating(false);
      setActiveStage("Failed");
      setTelemetryLogs((prev) => [`[ERROR] ${err.message}`, ...prev]);
    }
  };

  return (
    <StudioSidebar currentPath="/studio/cinema">
      <main className="flex-1 min-w-0 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12 py-8 overflow-x-hidden min-h-dvh">
        
        {/* Sticky Full-Width Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-mono">
                    ZYVORIQ CINEMA ORIGINALS
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Phase 3 Cloud Studio
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-slate-400 max-w-3xl">
                  Autonomous Original Movie Production House · End-to-end screenplay decomposition, 4-Tier automated QA self-healing, synthetic star casting, and IMF distribution packaging.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Studio KPI Highlights */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Overhead:</span>
              <span className="font-bold text-white font-mono">$0 Soundstage</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-400">QA Gates:</span>
              <span className="font-bold text-teal-300 font-mono">4-Tier Auto</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Master:</span>
              <span className="font-bold text-amber-300 font-mono">4K IMF / C2PA</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between gap-4 mt-8 pb-4 border-b border-slate-800/60 overflow-x-auto">
          <div className="flex items-center gap-3">
            <button
              id="tab-originals"
              onClick={() => setActiveTab("originals")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "originals"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Originals Vault (Stream & Distribute)</span>
            </button>

            <button
              id="tab-produce"
              onClick={() => setActiveTab("produce")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "produce"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Autonomous Movie Studio (Create)</span>
            </button>

            <button
              id="tab-telemetry"
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                activeTab === "telemetry"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Mission Control & 4-Tier QA Telemetry</span>
              {isGenerating && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORIGINALS VAULT (STREAMING & DISTRIBUTION MASTER) */}
        {/* ======================================================== */}
        {activeTab === "originals" && (
          <div className="space-y-10 mt-8">
            
            {/* Grand Marquee Spotlight Player */}
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Cinema Video Player */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-2xl">
                    <video
                      ref={videoRef}
                      src={selectedFilm.videoSrc}
                      playsInline
                      muted={isMuted}
                      loop
                      preload="auto"
                      onTimeUpdate={handleTimeUpdate}
                      className="w-full h-full object-cover"
                    />

                    {/* Subtitle Overlay */}
                    <div className="absolute bottom-6 left-0 right-0 px-6 text-center pointer-events-none">
                      <p id="cinema-subtitle-text" className="inline-block px-4 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 font-serif text-sm md:text-base border border-amber-500/30 shadow-lg">
                        {selectedFilm.subtitles[selectedLang] || selectedFilm.subtitles["en"] || Object.values(selectedFilm.subtitles)[0]}
                      </p>
                    </div>

                    {/* Video Player Controls Bar */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-all font-bold min-h-[36px]"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-9 w-9 rounded-xl bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-all min-h-[36px]"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-200"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">1080p 4K HDR</span>
                      </div>
                    </div>
                  </div>

                  {/* Multilingual Audio & Subtitle Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-400">Audio / Subtitles:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {["en", "hi", "es", "fr", "ja"].map((lang) => (
                          <button
                            key={lang}
                            id={`lang-btn-${lang}`}
                            onClick={() => setSelectedLang(lang)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedLang === lang
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-800/80 text-slate-300 hover:text-white"
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audio Ducking & Stem Separation Indicator */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">Lyria BGM:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        -12dB Auto-Ducked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Film Metadata & Distribution Master Suite */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {selectedFilm.format}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {selectedFilm.durationMinutes} Mins · {selectedFilm.shotCount} Shots
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {selectedFilm.title}
                    </h2>
                    <p className="mt-1 text-xs md:text-sm text-amber-400 font-medium italic">
                      {selectedFilm.tagline}
                    </p>
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedFilm.synopsis}
                  </p>

                  {/* Production Blueprint Specs */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block">Directive Aesthetic:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.directorAesthetic}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lead Synthetic Cast:</span>
                      <span className="font-semibold text-slate-200">{selectedFilm.leadActors.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Veritas Quality Score:</span>
                      <span className="font-bold text-teal-400">{selectedFilm.veritasScore} / 100 (Certified)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IMF Specification:</span>
                      <span className="font-bold text-amber-300">{selectedFilm.imfStatus}</span>
                    </div>
                  </div>

                  {/* 1-Click Master Distribution Export Actions */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Studio Master Export & Distribution
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={selectedFilm.videoSrc}
                        download={`${selectedFilm.id}_4K_master.mp4`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10 min-h-[44px]"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export 4K Master (ProRes)</span>
                      </a>

                      <button
                        onClick={() => alert(`Packaging IMF Master for ${selectedFilm.title}:\n\n- SMPTE 2067-21 Compliant\n- 5.1 Discrete Surround Audio Stems\n- C2PA Provenance Manifest Hash: ${selectedFilm.c2paCertId}\n\nReady for direct ingestion to Netflix / Amazon Prime Video Direct.`)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Tv className="h-4 w-4 text-teal-400" />
                        <span>Package IMF for Netflix/Prime</span>
                      </button>

                      <button
                        id="inspect-c2pa-btn"
                        onClick={() => setShowCertModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Inspect C2PA Provenance</span>
                      </button>

                      <button
                        onClick={() => alert(`Exporting JSON Shot Manifest:\n\n- ${selectedFilm.shotCount} atomic shots with 3D stage vectors\n- 512-dim ArcFace biometric locks\n- Lyria stem mix points`)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all border border-slate-700 min-h-[44px]"
                      >
                        <Terminal className="h-4 w-4 text-indigo-400" />
                        <span>Shot Manifest JSON</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Catalog of Studio Originals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Zyvoriq Studio Catalog (Original Productions)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {PRELOADED_ORIGINALS.length} Features Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRELOADED_ORIGINALS.map((film) => (
                  <div
                    key={film.id}
                    onClick={() => {
                      setSelectedFilm(film);
                      setIsPlaying(false);
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                    }}
                    className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                      selectedFilm.id === film.id
                        ? "border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                        {film.format}
                      </span>
                      <span className="font-mono">{film.durationMinutes} mins</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white line-clamp-1">
                      {film.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {film.tagline}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-teal-400 font-semibold font-mono">
                        VQS: {film.veritasScore}/100
                      </span>
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        <span>Select Master</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: AUTONOMOUS FEATURE FILM STUDIO (THE ENGINE)       */}
        {/* ======================================================== */}
        {activeTab === "produce" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                  <span>Autonomous Screenplay-to-Feature Engine</span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configure your narrative premise, choose your synthetic talent, lock your 4-Tier QA thresholds, and launch a complete autonomous feature film pipeline.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                
                {/* Column 1: Story & Cast */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      1. Film Title & Screenplay Premise
                    </label>
                    <input
                      type="text"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500 mb-3"
                      placeholder="e.g. Noor-e-Ishq (The Light of Love)"
                    />
                    <textarea
                      rows={4}
                      value={prodLogline}
                      onChange={(e) => setProdLogline(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                      placeholder="Write your story synopsis or scene premise..."
                    />
                  </div>

                  {/* Format & Duration Selector (Golden Sweet Spot Highlighted) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      2. Duration & Scope (The Golden Sweet Spot)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setProdFormat("short_15m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "short_15m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-amber-400">Sweet Spot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "short_15m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">12–18 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">118 shots · 95% consistency · ~$28 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("pilot_30m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "pilot_30m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-indigo-400">TV Pilot</span>
                          <Check className={`h-3 w-3 ${prodFormat === "pilot_30m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">30–45 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">280 shots · 85% consistency · ~$74 compute</p>
                      </div>

                      <div
                        onClick={() => setProdFormat("feature_90m")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          prodFormat === "feature_90m"
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-teal-400">Feature Film</span>
                          <Check className={`h-3 w-3 ${prodFormat === "feature_90m" ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">90–110 Mins</h4>
                        <p className="text-[11px] text-slate-400 mt-1">920 shots · Auto-Healed · ~$368 compute</p>
                      </div>
                    </div>
                  </div>

                  {/* Synthetic Lead Cast Vault */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      3. Synthetic Talent Vault (Legally Clean Procedural Stars)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      {[
                        { id: "syn_kabir_01", name: "Kabir Verma", archetype: "Romantic Baritone Lead" },
                        { id: "syn_meera_02", name: "Meera Sen", archetype: "Heritage Classical Heroine" },
                        { id: "syn_aryan_03", name: "Aryan Khan-Raza", archetype: "Action / Hero Archetype" },
                        { id: "syn_tara_04", name: "Tara Thorne", archetype: "Cyberpunk / Tech Protagonist" }
                      ].map((star) => (
                        <div
                          key={star.id}
                          onClick={() => {
                            if (prodLeadCast.includes(star.id)) {
                              setProdLeadCast(prodLeadCast.filter((c) => c !== star.id));
                            } else {
                              setProdLeadCast([...prodLeadCast, star.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            prodLeadCast.includes(star.id)
                              ? "border-amber-500 bg-amber-500/10 text-white"
                              : "border-slate-800 bg-slate-950 text-slate-400"
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-white">{star.name}</span>
                            <span className="text-[10px] text-slate-400">{star.archetype}</span>
                          </div>
                          <Check className={`h-3.5 w-3.5 ${prodLeadCast.includes(star.id) ? "text-amber-400" : "opacity-0"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Director Style, Soundstage & 4-Tier QA */}
                <div className="space-y-6">
                  {/* Director Aesthetic & 3D LUT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      4. Directive Vision & Master 3D LUT
                    </label>
                    <select
                      value={prodDirector}
                      onChange={(e) => setProdDirector(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="yash_chopra_chiffon">Yash Chopra: Swiss Alps Golden Hour, Chiffon Sarees, Kodak 2383 LUT</option>
                      <option value="roger_deakins_naturalist">Roger Deakins: Naturalist 50mm Anamorphic, Practical Soft Light</option>
                      <option value="david_fincher_amber">David Fincher: Low-Key Amber/Tungsten Precision, Fluid Tracking</option>
                      <option value="christopher_nolan_imax">Christopher Nolan: 70mm IMAX Practical Scale, 35mm Heavy Film Grain</option>
                    </select>
                  </div>

                  {/* Soundstage & Acoustic Controls */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      5. Virtual Soundstage & Foley Engine
                    </label>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">J-Cut / L-Cut Dialogue Overlap</span>
                        <span className="text-slate-500 text-[11px]">800ms natural conversational audio lead-in</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableJLCut}
                        onChange={(e) => setEnableJLCut(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">Optical Motion Foley & Room IR Reverb</span>
                        <span className="text-slate-500 text-[11px]">Auto-synthesizes footsteps, wind, fabric rustle</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableFoleyIR}
                        onChange={(e) => setEnableFoleyIR(e.target.checked)}
                        className="h-4 w-4 accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* 4-Tier Automated QA & Self-Healing Circuit Breaker */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                      <span>6. 4-Tier Automated QA & Circuit Breakers</span>
                      <ShieldCheck className="h-4 w-4 text-teal-400" />
                    </label>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>ArcFace Face Similarity Lock:</span>
                        <span className="font-bold text-white font-mono">≥ {arcfaceThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="0.95"
                        step="0.01"
                        value={arcfaceThreshold}
                        onChange={(e) => setArcfaceThreshold(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">YOLOv10 Kinematic & Anatomy Guard</span>
                        <span className="text-slate-500 text-[11px]">0 extra limbs or impossible physics tolerance</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">Active</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-white font-semibold block">Max Retries Before Cutaway Fallback</span>
                        <span className="text-slate-500 text-[11px]">Prevents infinite token burn on impossible shots</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">3 Strikes</span>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    id="launch-production-btn"
                    onClick={handleLaunchProduction}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm md:text-base hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/20 min-h-[48px]"
                  >
                    <Clapperboard className="h-5 w-5 fill-slate-950" />
                    <span>LAUNCH AUTONOMOUS MOVIE PRODUCTION</span>
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MISSION CONTROL & 4-TIER QA TELEMETRY            */}
        {/* ======================================================== */}
        {activeTab === "telemetry" && (
          <div className="space-y-8 mt-8">
            <div className="p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Autonomous Production Mission Control
                    </h2>
                  </div>
                  <p className="mt-1 text-xs md:text-sm text-slate-400">
                    Active Job: <span className="text-amber-300 font-mono">{prodTitle}</span> ({prodFormat.replace("_", " ").toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Current Status:</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {isGenerating ? activeStage : "Master Package Sealed & Live"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Overall Pipeline Completion</span>
                  <span className="text-amber-400 font-bold">{isGenerating ? `${genProgress}%` : "100%"}</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${isGenerating ? genProgress : 100}%` }}
                  />
                </div>
              </div>

              {/* Real-Time Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">ArcFace Mean Match</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">0.914</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">Threshold: ≥ 0.86 (PASS)</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Kinematics & Pose Yield</span>
                  <span className="text-2xl font-black text-teal-400 font-mono">98.2%</span>
                  <span className="text-[10px] text-teal-500/80 block mt-1">0 Extra Limbs Detected</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">Self-Healed Rerolls</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">8 Shots</span>
                  <span className="text-[10px] text-amber-500/80 block mt-1">0 Human QA Touches</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-500 block">GPU Compute Cost</span>
                  <span className="text-2xl font-black text-white font-mono">$28.50</span>
                  <span className="text-[10px] text-slate-500 block mt-1">20 Cloud Workers</span>
                </div>
              </div>

              {/* Real-time Streaming Terminal Logs */}
              <div className="mt-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Live Autonomous Pipeline Event Log
                </span>
                <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 shadow-inner">
                  {telemetryLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-amber-500/80 select-none">&gt;</span>
                      <span className={log.includes("ERROR") ? "text-red-400" : log.includes("SELF-HEALED") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Switch to Player */}
              {!isGenerating && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab("originals")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 min-h-[44px]"
                  >
                    <span>View Master in Originals Vault</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* C2PA Cryptographic Provenance Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                <h3 className="text-xl font-bold text-white">C2PA Cryptographic Provenance Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold min-h-[36px] px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Manifest ID:</span>
                <span className="text-amber-300 select-all">{selectedFilm.c2paCertId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Digital Signing Algorithm:</span>
                <span className="text-teal-300">Ed25519 (Zero Third-Party Cloud Egress)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Content Authenticity Claim:</span>
                <span className="text-slate-200">Generative Synthetic Media produced under Zyvoriq Veritas 5-Axis Governance</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">IMF Specification:</span>
                <span className="text-amber-400">SMPTE 2067-21 (Netflix / Amazon Prime Video Direct Compliant)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="close-c2pa-btn"
                onClick={() => setShowCertModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all min-h-[40px]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </StudioSidebar>
  );
}
