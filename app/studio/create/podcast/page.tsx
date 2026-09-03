"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  Sparkles,
  Zap,
  ArrowLeft,
  Users,
  Volume2,
  Radio,
  Loader2,
  Lightbulb,
  Headphones,
  Film,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Play,
  Download,
  Share2,
  ArrowRight,
  Sliders,
  ChevronDown,
  Clock,
  Compass,
  Layers,
  Award
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";
import { GLOBAL_CHARACTERS } from "@/lib/tier6/characters";

type CinemaVisualEngine = "35mm_kodak_grain" | "a24_chiaroscuro" | "slow_burn_orbit" | "nordic_noir_teal";
type AudioScoreType = "cello_solo" | "low_drone_synth" | "rain_pavement_asmr" | "true_crime_pulse";
type DialoguePacing = "slow_burn_intense" | "rapid_fire_debate" | "philosophical_monologue";

interface DialogueBeat {
  speaker: string;
  speakerRole: string;
  text: string;
  soundCue?: string;
  timestamp: string;
  intensity: number;
}

const CINEMA_PRESETS = [
  {
    id: "silent_verdict",
    title: "The Silent Verdict (A24 Neo-Noir)",
    topic: "In a city built on algorithmic silence, the loudest scream is a signed non-disclosure agreement. Detective Elena confronts corporate strategist Marcus Vance.",
    engine: "35mm_kodak_grain" as CinemaVisualEngine,
    score: "cello_solo" as AudioScoreType,
    h1: "elena",
    h2: "marcus"
  },
  {
    id: "quantum_conscience",
    title: "The Quantum Conscience (Investigative)",
    topic: "Why the lead architect of the first quantum consensus engine resigned overnight, and the encrypted memo left behind in Zurich.",
    engine: "a24_chiaroscuro" as CinemaVisualEngine,
    score: "low_drone_synth" as AudioScoreType,
    h1: "priya",
    h2: "david"
  },
  {
    id: "nordic_rain_memoir",
    title: "Nordic Rain Memoir (Psychological Drama)",
    topic: "Two former co-founders meet on a rain-slicked dock in Bergen after 7 years of estrangement to divide their proprietary AI weights.",
    engine: "nordic_noir_teal" as CinemaVisualEngine,
    score: "rain_pavement_asmr" as AudioScoreType,
    h1: "celeste",
    h2: "carlos"
  }
];

const SAMPLE_DIALOGUE_BEATS: DialogueBeat[] = [
  {
    speaker: "Det. Elena Rostova",
    speakerRole: "Lead Investigator",
    text: "You didn't just delete the audit logs, Marcus. You mathematically un-existed forty-two days of financial telemetry.",
    soundCue: "[SLOW 35MM PUSH-IN · CELLO SWELLS -18dB]",
    timestamp: "00:00 - 00:04",
    intensity: 85
  },
  {
    speaker: "Marcus Vance",
    speakerRole: "Corporate Strategist",
    text: "In our industry, Elena... survival isn't about what you record. It is about what you have the discipline to forget.",
    soundCue: "[LOW DRONE SYNTH RESOUNDS · LIGHTNING FLASH]",
    timestamp: "00:04 - 00:08",
    intensity: 95
  },
  {
    speaker: "Det. Elena Rostova",
    speakerRole: "Lead Investigator",
    text: "Then why did the blockchain hash still verify your private key at 3:14 AM?",
    soundCue: "[CRESCENDO STRING QUARTET · 24FPS CUTAWAY]",
    timestamp: "00:08 - 00:12",
    intensity: 100
  }
];

function PodcastCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState(CINEMA_PRESETS[0].topic);
  const [visualEngine, setVisualEngine] = useState<CinemaVisualEngine>("35mm_kodak_grain");
  const [audioScore, setAudioScore] = useState<AudioScoreType>("cello_solo");
  const [pacing, setPacing] = useState<DialoguePacing>("slow_burn_intense");
  const [host1Id, setHost1Id] = useState("elena");
  const [host2Id, setHost2Id] = useState("marcus");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"video" | "script" | "sound_design">("video");

  const host1 = GLOBAL_CHARACTERS.find(p => p.id === host1Id) || GLOBAL_CHARACTERS[0];
  const host2 = GLOBAL_CHARACTERS.find(p => p.id === host2Id) || GLOBAL_CHARACTERS[1];

  const handleSelectPreset = (preset: typeof CINEMA_PRESETS[0]) => {
    setTopic(preset.topic);
    setVisualEngine(preset.engine);
    setAudioScore(preset.score);
    setHost1Id(preset.h1);
    setHost2Id(preset.h2);
  };

  const handleSurprisePrompt = () => {
    const randomPreset = CINEMA_PRESETS[Math.floor(Math.random() * CINEMA_PRESETS.length)];
    handleSelectPreset(randomPreset);
  };

  const handleLaunchInMasterStudio = () => {
    router.push(`/studio?mode=podcast&topic=${encodeURIComponent(topic)}&h1=${host1.id}&h2=${host2.id}`);
  };

  const handleDownloadCinemaMaster = () => {
    const a = document.createElement("a");
    a.href = "/assets/video/persona5_arthouse_cinema_reel.mp4";
    a.download = "persona5_arthouse_cinema_reel.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <StudioSidebar currentPath="/studio/create/podcast">
      <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 md:pb-12">
        {/* Top Header */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-slate-900 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-indigo-400">
                  <Film className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono">
                    Persona #5: Mature Drama &amp; Arthouse Cinema
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-400 font-mono">
                    <Flame className="w-3.5 h-3.5 text-indigo-400" />
                    35MM GRAIN &amp; DUAL DEBATE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  A24 Chiaroscuro · 24 FPS Cinematic Push-Ins · 2-Host Investigative Debate · Neo-Classical Cello &amp; Drone Synthesis
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLaunchInMasterStudio}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-500 transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-white fill-current" />
                Launch in Master Timeline
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Zero-Gutter Workspace */}
        <main className="flex-1 mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Creative Controls & Cinematography (6 cols) */}
            <section className="lg:col-span-6 space-y-6">
              
              {/* Preset Quick Selectors */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">
                  PRESETS:
                </span>
                {CINEMA_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className="shrink-0 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-500/40 text-xs font-semibold text-indigo-200 transition-all cursor-pointer"
                  >
                    🎬 {p.title.split(" (")[0]}
                  </button>
                ))}
              </div>

              {/* Topic & Premise Input Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Dramatic Premise &amp; Episode Debate Brief
                  </label>
                  <button
                    type="button"
                    onClick={handleSurprisePrompt}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Surprise Idea
                  </button>
                </div>

                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe the dramatic confrontation, investigative mystery, or philosophical dispute..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-base md:text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>

              {/* Cinematography & Visual Engine Configuration */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  Cinematography &amp; Visual Grading
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "35mm_kodak_grain", label: "35mm Kodak 5219 Grain", desc: "Warm film texture with deep shadows & organic noise" },
                    { id: "a24_chiaroscuro", label: "A24 Natural Chiaroscuro", desc: "High-contrast single-key lighting with deep blacks" },
                    { id: "slow_burn_orbit", label: "Slow-Burn Orbit (24fps)", desc: "Continuous dynamic 24fps camera wrap around actors" },
                    { id: "nordic_noir_teal", label: "Nordic Noir Cold Teal", desc: "Muted desaturated blues with rain reflection grading" },
                  ].map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => setVisualEngine(engine.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        visualEngine === engine.id
                          ? "border-indigo-500/60 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/10"
                          : "border-slate-800/80 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-100 flex items-center justify-between">
                        <span>{engine.label}</span>
                        {visualEngine === engine.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{engine.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Speaker Cast & Sound Design */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Dual-Host Characters &amp; Atmospheric Score
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Host 1 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Lead Anchor / Detective</label>
                    <select
                      value={host1Id}
                      onChange={(e) => setHost1Id(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-indigo-500"
                    >
                      {GLOBAL_CHARACTERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.avatarEmoji} {c.name} ({c.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Host 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Counterpoint / Suspect</label>
                    <select
                      value={host2Id}
                      onChange={(e) => setHost2Id(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-purple-500"
                    >
                      {GLOBAL_CHARACTERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.avatarEmoji} {c.name} ({c.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Audio Score Selection */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-300">Atmospheric Audio Score &amp; Stems</label>
                  <select
                    value={audioScore}
                    onChange={(e) => setAudioScore(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-base md:text-xs font-bold text-white outline-none focus:border-indigo-500"
                  >
                    <option value="cello_solo">🎻 Neo-Classical Cello Solo (Dark &amp; Melancholic · -18dB Ducking)</option>
                    <option value="low_drone_synth">🎛️ Low-Frequency Drone Synthesizer (Psychological Tension)</option>
                    <option value="rain_pavement_asmr">🌧️ Rain on Pavement ASMR with Sub-Bass Rumble</option>
                    <option value="true_crime_pulse">🔍 True Crime Clock Pulse with Subtle Heartbeat</option>
                  </select>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Interactive Cinema Monitor & Script Telemetry (6 cols) */}
            <section className="lg:col-span-6 space-y-6">
              
              {/* Video Monitor Card */}
              <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ARTHOUSE CINEMA MONITOR
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                    24 FPS · 9:16 VERTICAL CINEMA
                  </span>
                </div>

                {/* 9:16 Video Player Wrapper */}
                <div className="relative aspect-[9/16] w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl group">
                  <video
                    src="/assets/video/persona5_arthouse_cinema_reel.mp4"
                    controls
                    playsInline
                    autoPlay
                    loop
                    muted
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300">
                      🎬 35mm Chiaroscuro Active
                    </span>
                    <span className="px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                      C2PA Verified
                    </span>
                  </div>
                </div>

                {/* Export & Master Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDownloadCinemaMaster}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download 4K Master MP4
                  </button>
                  <button
                    onClick={handleLaunchInMasterStudio}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all border border-slate-700 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-indigo-400" />
                    Edit in Studio Timeline
                  </button>
                </div>
              </div>

              {/* 3-Act Script & Dialogue Breakdown */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-indigo-400" />
                    3-Act Dramatic Dialogue Script &amp; Sound Cues
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">3 Beats Synced</span>
                </div>

                <div className="space-y-3">
                  {SAMPLE_DIALOGUE_BEATS.map((beat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-indigo-300 flex items-center gap-2">
                          <span>{beat.speaker}</span>
                          <span className="text-[10px] font-normal text-slate-500">({beat.speakerRole})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{beat.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-serif italic leading-relaxed">
                        &ldquo;{beat.text}&rdquo;
                      </p>
                      {beat.soundCue && (
                        <div className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1.5">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          {beat.soundCue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </section>
          </div>
        </main>
      </div>
    </StudioSidebar>
  );
}

export default function PodcastCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      }
    >
      <PodcastCreateContent />
    </Suspense>
  );
}
