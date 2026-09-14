"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Film,
  Music2,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  Layers,
  ShieldCheck,
  Award,
  Sliders,
  Wand2,
  Clock,
  CheckCircle2,
  Compass,
  Users,
  MapPin,
  Download,
} from "lucide-react";

interface CinemaAct {
  act: number;
  title: string;
  timecode: string;
  seconds: number;
  description: string;
  lens: string;
  lighting: string;
}

const FEATURE_FILM_SHOWCASE = [
  {
    id: "napoleon-emperor-heart",
    title: "NAPOLEON: THE EMPEROR'S HEART (5-ACT ANAMORPHIC MASTER)",
    director: "Omni Theatrical Director v3.2",
    aspectRatio: "2.39:1 Scope",
    duration: "180s (30 Takes)",
    audioSpec: "Symphonic Score (Beethoven Op. 92 • -24.0 LUFS EBU R128)",
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    posterUrl: "/assets/stills/napoleon_hero.png",
    synopsis:
      "A young artillery officer falls passionately in love with Joséphine de Beauharnais amidst the turmoil of Revolutionary France, forging an imperial destiny while wrestling with devotion, glory, and tragic sacrifice.",
    acts: [
      {
        act: 1,
        title: "Act I: The Fires of Youth & Toulon Siege",
        timecode: "0:00 – 0:36",
        seconds: 0,
        description: "Establishing 2.39:1 crane shot over Marseille coastline terraces at golden hour; young officer torn between love and imperial duty.",
        lens: "Cooke Anamorphic 40mm T2.3",
        lighting: "Warm golden Mediterranean sunset + cold sea spray reflections",
      },
      {
        act: 2,
        title: "Act II: The Imperial Crown & Rose Garden",
        timecode: "0:36 – 1:12",
        seconds: 36,
        description: "Steadicam coronation sequence inside Notre-Dame and rain-drenched Malmaison sanctuary with Joséphine.",
        lens: "Cooke Anamorphic 50mm T2.3",
        lighting: "Notre-Dame gilded imperial rays + deep chiaroscuro velvet shadows",
      },
      {
        act: 3,
        title: "Act III: The Polish Winter & Countess Walewska",
        timecode: "1:12 – 1:48",
        seconds: 72,
        description: "Snow-blown Prussian pine forests and intimate stone fireplaces; orchestral strings swell with Beethoven Allegretto.",
        lens: "Cooke Anamorphic 75mm Close Focus",
        lighting: "Cold volumetric blizzard exterior + roaring fireplace warm key",
      },
      {
        act: 4,
        title: "Act IV: The Dynastic Sacrifice & Farewell",
        timecode: "1:48 – 2:24",
        seconds: 108,
        description: "Shadowed Tuileries throne room; the heartbreak of imperial divorce and tears on parchment.",
        lens: "Cooke Anamorphic 32mm Wide",
        lighting: "Dramatic side key through tall arched windows + deep falloff",
      },
      {
        act: 5,
        title: "Act V: The Solitary Echo & Saint Helena",
        timecode: "2:24 – 3:00",
        seconds: 144,
        description: "Slow crane elevation at sunset overlooking wind-swept Atlantic bluffs; Beethoven Op. 92 resolves to minor chord.",
        lens: "Cooke Anamorphic 100mm Telephoto",
        lighting: "Pale twilight ocean haze + ACEScc 1.3 35mm print emulation",
      },
    ] as CinemaAct[],
  },
];

export default function FeatureFilmsStudio() {
  const activeFilm = FEATURE_FILM_SHOWCASE[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedActIndex, setSelectedActIndex] = useState<number>(0);

  // Feature film authoring prompt state
  const [titlePrompt, setTitlePrompt] = useState<string>(
    "THE SOVEREIGN HORIZON — 5-Act Sci-Fi Thriller in 2.39:1 Anamorphic Scope"
  );
  const [screenplayPrompt, setScreenplayPrompt] = useState<string>(
    "A deep-sea orbital elevator engineer discovers a signal beneath the Mariana trench. Structure across 5 classical dramatic acts (30 continuous 6-second takes = 180s total) with Cooke Anamorphic 2.39:1 lenses, 24fps theatrical shutter, and a -24.0 LUFS symphonic orchestral score."
  );
  const [selectedLensPackage, setSelectedLensPackage] = useState<string>("Cooke Anamorphic /i Full Frame Plus (2.39:1)");
  const [selectedColorScience, setSelectedColorScience] = useState<string>("ACES 1.3 Kodak 2383 Print Emulation");
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [planStatus, setPlanStatus] = useState<string | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekToAct = (act: CinemaAct, idx: number) => {
    setSelectedActIndex(idx);
    if (videoRef.current) {
      videoRef.current.currentTime = act.seconds;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleGenerateFeatureFilm = () => {
    setIsPlanning(true);
    setPlanStatus("Compiling 30-shot 5-Act Anamorphic Screenplay Dossier & Symphonic Score stems...");
    setTimeout(() => {
      setIsPlanning(false);
      setPlanStatus(
        "✓ 180s Feature Film Master Dossier queued across 5 Acts (30 takes @ 24fps, Cooke 2.39:1 Scope, -24.0 LUFS Master)."
      );
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* PAGE TITLE BAR */}
      <div className="w-full border-b border-white/10 bg-[#07090E]">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  FEATURE FILMS STUDIO
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  2.39:1 Anamorphic • 180s Master
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Classical 5-Act Narrative Architecture • 30 Continuous Takes • Symphonic -24.0 LUFS Score
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateFeatureFilm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 text-[#07090E] font-black text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Direct 180s Feature Master</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FULL-WIDTH WORKSPACE */}
      <div className="max-w-[1600px] w-full mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* TOP CINEMA TELEMETRY RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0C1019] border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Theatrical Aspect Ratio
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-white">2.39:1</span>
              <span className="text-xs font-bold text-amber-300">Scope</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Cooke Anamorphic /i Full Frame Optics
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C1019] border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Dramatic Arc Structure
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-white">5 Acts</span>
              <span className="text-xs font-bold text-amber-300">30 Takes</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              180 Seconds Unbroken Narrative Continuity
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C1019] border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5" />
              Symphonic Audio Standard
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-white">-24.0 LUFS</span>
              <span className="text-xs font-bold text-emerald-400">EBU R128</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Beethoven Op. 92 Broadcast Orchestral Bed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0C1019] border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Biometric Character Lock
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-400">100% Locked</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Zero Facial Drift Across All 30 Camera Setups
            </span>
          </div>
        </div>

        {/* WIDESCREEN 2.39:1 MASTER MONITOR + 5-ACT BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: 2.39:1 ANAMORPHIC SCREENING ROOM */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-3xl bg-[#0C1019] border border-amber-500/25 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    2.39:1 Anamorphic Theatrical Screening Room
                  </h2>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                  24.000 FPS • 180° Shutter
                </span>
              </div>

              {/* 2.39:1 Widescreen Cinema Viewport */}
              <div className="relative w-full aspect-[2.39/1] rounded-2xl overflow-hidden bg-black border-2 border-amber-500/30 shadow-2xl group">
                <video
                  ref={videoRef}
                  src={activeFilm.videoUrl}
                  poster={activeFilm.posterUrl}
                  className="w-full h-full object-cover"
                  playsInline
                  loop
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Anamorphic HUD Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded bg-black/70 border border-white/15 text-amber-300 font-bold">
                    {activeFilm.acts[selectedActIndex]?.title}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/70 border border-white/15 text-slate-300">
                    {activeFilm.acts[selectedActIndex]?.lens}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-black/80 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-2xl">
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                  </div>
                </button>
              </div>

              {/* Transport Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-[#07090E] font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause Screening" : "Play 2.39:1 Feature Master"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  {activeFilm.audioSpec}
                </span>
              </div>
            </div>

            {/* CLASSICAL 5-ACT DRAMATIC TIMELINE */}
            <div className="p-6 rounded-3xl bg-[#0C1019] border border-white/10 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-amber-400" />
                Classical 5-Act Dramatic Breakdown (Click Act to Seek)
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {activeFilm.acts.map((act, idx) => {
                  const isSelected = idx === selectedActIndex;
                  return (
                    <div
                      key={act.act}
                      onClick={() => seekToAct(act, idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10"
                          : "bg-[#07090E] border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                            ACT {act.act}
                          </span>
                          <span className="text-sm font-bold text-white">{act.title}</span>
                          <span className="text-xs font-mono text-slate-400">({act.timecode})</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px] text-amber-300/90">
                        <div>{act.lens}</div>
                        <div className="text-slate-400 text-[10px]">{act.lighting}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: FEATURE FILM SCREENPLAY & ANAMORPHIC DIRECTOR CONSOLE */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0C1019] border border-amber-500/25 shadow-2xl space-y-5">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  Direct New 180s Feature Film Master
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizes a 3-minute, 30-shot theatrical feature film structured across 5 classical dramatic acts.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Feature Film Title & Logline:
                  </label>
                  <input
                    type="text"
                    value={titlePrompt}
                    onChange={(e) => setTitlePrompt(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#07090E] border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    5-Act Dramatic Treatment & Visual Direction:
                  </label>
                  <textarea
                    rows={5}
                    value={screenplayPrompt}
                    onChange={(e) => setScreenplayPrompt(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#07090E] border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Optics & Anamorphic Glass:
                    </label>
                    <select
                      value={selectedLensPackage}
                      onChange={(e) => setSelectedLensPackage(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#07090E] border border-white/15 text-xs text-amber-300 font-semibold"
                    >
                      <option>Cooke Anamorphic /i Full Frame Plus (2.39:1)</option>
                      <option>ARRI Master Anamorphic Flare Set (2.39:1)</option>
                      <option>Panavision C-Series Vintage Anamorphic</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Color Science & Print Stock:
                    </label>
                    <select
                      value={selectedColorScience}
                      onChange={(e) => setSelectedColorScience(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#07090E] border border-white/15 text-xs text-cyan-300 font-semibold"
                    >
                      <option>ACES 1.3 Kodak 2383 Print Emulation</option>
                      <option>Bleach Bypass High-Contrast Silver</option>
                      <option>Teal & Tungsten Neo-Noir Grade</option>
                    </select>
                  </div>
                </div>

                {planStatus && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{planStatus}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateFeatureFilm}
                  disabled={isPlanning}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 text-[#07090E] font-black text-sm shadow-xl shadow-amber-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isPlanning
                      ? "Directing 30-Shot 5-Act Screenplay..."
                      : "Synthesize 180s Feature Film Master (2.39:1)"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
