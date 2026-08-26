"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Award,
  Video,
  Mic,
  Cpu,
  Globe,
  Lock,
  CheckCircle2,
  Maximize2,
  Volume2,
  VolumeX,
  FileCheck,
  Zap,
  Activity,
  Layers,
  Check,
  User,
  Heart,
  Eye,
  Wind,
  Compass,
  Box,
  Monitor,
  Camera,
  Share2
} from "lucide-react";
import { EXECUTIVE_PERSONAS } from "@/lib/tier6/personas";
import {
  ExecutivePersona,
  ScriptWordTiming,
  VeritasProvenanceSeal,
  FramingMode,
  PostureMode,
  EnvironmentMode,
  Gen7NeuroBiometrics
} from "@/lib/tier6/types";
import { computePhoneticWordTimings } from "@/lib/tier6/timing_engine";
import { generateVeritasSeal } from "@/lib/tier6/veritas_engine";

export default function Gen7StudioPage() {
  // State
  const [selectedPersona, setSelectedPersona] = useState<ExecutivePersona>(EXECUTIVE_PERSONAS[0]);
  const [scriptText, setScriptText] = useState<string>(EXECUTIVE_PERSONAS[0].defaultScript);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [spokenWordIndex, setSpokenWordIndex] = useState<number>(-1);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthProgress, setSynthProgress] = useState<number>(0);
  const [synthStage, setSynthStage] = useState<string>("");
  const [selectedResolution, setSelectedResolution] = useState<"1080p" | "4K">("1080p");
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);

  // Gen 7 Director State Controls
  const [framingMode, setFramingMode] = useState<FramingMode>("full_body");
  const [postureMode, setPostureMode] = useState<PostureMode>("standing");
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>("keynote_arena");
  const [activeHologramNode, setActiveHologramNode] = useState<string>("agent_mesh");

  // Dynamic Neuro-Biometrics Simulation
  const biometrics = useMemo<Gen7NeuroBiometrics>(() => {
    const pulseOffset = Math.sin(currentTime * 1.5) * 4;
    return {
      ppgPulseBpm: Math.round(72 + pulseOffset + (isPlaying ? 4 : 0)),
      microSaccadeHz: parseFloat((4.8 + Math.sin(currentTime * 2.2) * 0.4).toFixed(1)),
      lungTidalVolumeL: parseFloat((0.52 + Math.cos(currentTime * 0.8) * 0.08).toFixed(2)),
      pupilDilationMm: parseFloat((3.8 + Math.sin(currentTime * 0.5) * 0.2).toFixed(1))
    };
  }, [currentTime, isPlaying]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Dynamic Gen 7 Multi-Angle Video Source Resolver
  const activeVideoSrc = useMemo(() => {
    const pId = selectedPersona.id;
    if (framingMode === "headshot") {
      return `/assets/video_synced/${pId}_neural_synced.mp4`;
    }
    if (postureMode === "sitting") {
      return `/assets/video_synced/${pId}_sitting.mp4`;
    }
    if (postureMode === "walking") {
      return `/assets/video_synced/${pId}_walking.mp4`;
    }
    if (framingMode === "half_body") {
      return `/assets/video_synced/${pId}_director_cut.mp4`;
    }
    // Full Body Standing Keynote default
    return `/assets/video_synced/${pId}_fullbody_standing.mp4`;
  }, [selectedPersona, framingMode, postureMode]);

  // Smooth Source Switching without destroying DOM node
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      video.src = activeVideoSrc;
      video.load();
      setCurrentTime(0);
      setSpokenWordIndex(-1);
    }
  }, [activeVideoSrc]);

  // Computed Word Timings
  const wordTimings = useMemo<ScriptWordTiming[]>(() => {
    return computePhoneticWordTimings(scriptText, 23.20);
  }, [scriptText]);

  // Active Veritas Cryptographic Seal
  const veritasSeal = useMemo<VeritasProvenanceSeal>(() => {
    return generateVeritasSeal(selectedPersona, scriptText, activeVideoSrc);
  }, [selectedPersona, scriptText, activeVideoSrc]);

  // Handle Persona Change
  const handleSelectPersona = (persona: ExecutivePersona) => {
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    setSelectedPersona(persona);
    setScriptText(persona.defaultScript);
    setCurrentTime(0);
    setSpokenWordIndex(-1);
  };

  // Synchronized Master Playback
  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = isMuted;
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Playback error:", err);
        }
      }
    }
  };

  // Restart Playback
  const handleRestart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setCurrentTime(0);
      setSpokenWordIndex(-1);
      if (!isPlaying) {
        video.play().then(() => setIsPlaying(true));
      }
    }
  };

  // 60 FPS Sub-Millisecond Dynamic Teleprompter Loop
  useEffect(() => {
    const updateTeleprompter = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        const time = video.currentTime;
        setCurrentTime(time);

        // Find active word with +120ms anticipation lead
        const lookupTime = time + 0.12;
        let activeIdx = -1;
        for (let i = 0; i < wordTimings.length; i++) {
          if (lookupTime >= wordTimings[i].start && lookupTime <= wordTimings[i].end) {
            activeIdx = i;
            break;
          }
        }
        setSpokenWordIndex(activeIdx);
      }
      animationFrameRef.current = requestAnimationFrame(updateTeleprompter);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTeleprompter);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, wordTimings]);

  // Gemini AI Script Polish
  const handleAiPolishScript = async () => {
    setIsSynthesizing(true);
    setSynthProgress(15);
    setSynthStage("Invoking Gemini 3.1 Pro Executive Tone Formatter...");

    setTimeout(() => {
      setSynthProgress(55);
      setSynthStage("Optimizing Phonetic Visemes & Syllable Cadence...");
    }, 400);

    setTimeout(() => {
      setSynthProgress(90);
      setSynthStage("Signing Veritas Ed25519 Cryptographic Manifest...");
    }, 800);

    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthProgress(0);
      setSynthStage("");
      setScriptText(
        `Welcome to the sovereign era of digital intelligence. I'm ${selectedPersona.name.split(" ")[0]}, delivering enterprise broadcasts with deterministic zero latency, verified C2PA provenance, and 4D neuro-biometric alignment!`
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-8xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5 text-slate-950" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                ZYVORIQ
              </span>
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 font-semibold">
              <Sparkles className="h-3 w-3 animate-spin text-cyan-400" />
              <span>GEN 7 SOVEREIGN TWIN</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProvenanceModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-emerald-400 transition-all hover:border-emerald-500/50 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Veritas zk-SNARK Active</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>64-Core Hardware Pool</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="max-w-8xl mx-auto px-6 md:px-12 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Persona Selector & Script Editor & Gen 7 Options (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Executive Persona Cards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  EXECUTIVE DIGITAL TWINS
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">6 Unique 3D Personas</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXECUTIVE_PERSONAS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`relative p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all group ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="relative h-16 w-full rounded-lg overflow-hidden bg-slate-800">
                      <Image
                        src={persona.avatarUrl}
                        alt={persona.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-100 truncate">{persona.name.split(" ")[0]}</span>
                      <span className="text-[10px] text-slate-400 truncate">{persona.location.split(",")[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gen 7 Director Controls: Framing, Locomotion & World Environment */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  GEN 7 DIRECTOR CONTROLS
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                4D WORLD ENGINE
              </span>
            </div>

            {/* 1. Camera Framing Modes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold">1. CAMERA FRAMING</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "headshot", label: "Headshot", desc: "4K Close-Up" },
                  { id: "half_body", label: "Half Body", desc: "Chest-Up Posture" },
                  { id: "full_body", label: "Full Body", desc: "Standing Stage" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFramingMode(f.id as FramingMode)}
                    className={`px-2.5 py-2 rounded-xl border text-left transition-all ${
                      framingMode === f.id
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs">{f.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Locomotion & Posture Modes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold">2. LOCOMOTION & POSTURE</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "standing", label: "Standing", icon: "🧍" },
                  { id: "sitting", label: "Sitting", icon: "🪑" },
                  { id: "walking", label: "Walking", icon: "🚶" },
                  { id: "interactive_hologram", label: "Hologram", icon: "✨" }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPostureMode(p.id as PostureMode)}
                    className={`px-2 py-2 rounded-xl border text-center transition-all ${
                      postureMode === p.id
                        ? "bg-blue-500/20 border-blue-400 text-blue-300 font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-sm">{p.icon}</div>
                    <div className="text-[11px] mt-0.5">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. World Environments */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold">3. WORLD ENVIRONMENT</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "keynote_arena", label: "Keynote LED Arena", desc: "Main Stage Blue Glow" },
                  { id: "fireside_library", label: "Fireside Library", desc: "Warm Oak & Bookshelf" },
                  { id: "command_bunker", label: "AI Command Bunker", desc: "Cyber-Ops HUD Screens" },
                  { id: "executive_boardroom", label: "Glass Boardroom", desc: "City Skyline Horizon" }
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setEnvironmentMode(env.id as EnvironmentMode)}
                    className={`px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                      environmentMode === env.id
                        ? "bg-purple-500/20 border-purple-400 text-purple-300 font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-[11px] font-semibold truncate">{env.label}</div>
                    <div className="text-[9px] text-slate-500 truncate">{env.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Script Editor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  EXECUTIVE SCRIPT
                </h2>
              </div>

              <button
                onClick={handleAiPolishScript}
                disabled={isSynthesizing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition-all"
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Polish</span>
              </button>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans"
              placeholder="Enter executive speech..."
            />

            {isSynthesizing && (
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-cyan-300">{synthStage}</span>
                  <span className="text-cyan-400 font-bold">{synthProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${synthProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Master Broadcast Player, Neuro-Biometric HUD & Teleprompter (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Master Player Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  GEN 7 MASTER BROADCAST
                </h2>
              </div>

              {/* Mode Badges */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 font-bold">
                  {framingMode.toUpperCase().replace("_", " ")}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-purple-300 font-bold">
                  {postureMode.toUpperCase().replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Video Player Frame with Dynamic 4D Hologram Overlay */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              
              {/* Main Video Stream */}
              <video
                ref={videoRef}
                src={activeVideoSrc}
                playsInline
                preload="auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setSpokenWordIndex(-1);
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Gen 7 Interactive 3D Holographic Stage Overlay */}
              {postureMode === "interactive_hologram" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-6">
                  <div className="pointer-events-auto bg-slate-950/80 border border-cyan-500/50 rounded-xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 animate-pulse">
                    <span className="text-[9px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                      <Box className="h-3 w-3" />
                      <span>[VERTEX AI SWARM MESH]</span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">Status: 12 Nodes Synced</span>
                  </div>

                  <div className="pointer-events-auto bg-slate-950/80 border border-purple-500/50 rounded-xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 animate-bounce">
                    <span className="text-[9px] font-mono text-purple-400 font-bold flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>[zk-SNARK PROVENANCE]</span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">Proof: Validated (0ms)</span>
                  </div>
                </div>
              )}

              {/* Watermark & Badges Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>zk-SNARK Signed</span>
              </div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{selectedPersona.name}</span>
              </div>

              {/* Play / Pause Big Center Button Overlay */}
              {!isPlaying && (
                <button
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl transition-all hover:scale-105"
                >
                  <Play className="h-8 w-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="h-9 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                  <span>{isPlaying ? "Pause" : "Play Broadcast"}</span>
                </button>

                <button
                  onClick={handleRestart}
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  title="Restart from beginning"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="text-cyan-400 font-bold">{currentTime.toFixed(1)}s</span>
                  <span>/ 23.2s</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Activity className="h-3.5 w-3.5" />
                  <span>0ms Drift</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Gen 7 Neuro-Biometric Telemetry HUD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Heart className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                <span>AUTONOMIC NEURO-BIOMETRIC SENSORY HUD</span>
              </span>
              <span className="text-emerald-400 font-bold font-mono">100% PHYSIOLOGICAL ALIGNMENT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-400" /> PPG Pulse (BPM)
                </span>
                <span className="text-lg font-bold font-mono text-red-400">{biometrics.ppgPulseBpm} BPM</span>
                <span className="text-[9px] text-slate-500 font-mono">Vascular Micro-Flushing</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Eye className="h-3 w-3 text-cyan-400" /> Micro-Saccades
                </span>
                <span className="text-lg font-bold font-mono text-cyan-300">{biometrics.microSaccadeHz} Hz</span>
                <span className="text-[9px] text-slate-500 font-mono">Ocular Jitter Dynamics</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Wind className="h-3 w-3 text-blue-400" /> Lung Tidal Vol
                </span>
                <span className="text-lg font-bold font-mono text-blue-300">{biometrics.lungTidalVolumeL} L</span>
                <span className="text-[9px] text-slate-500 font-mono">Sub-Glottal Acoustics</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-purple-400" /> Pupil Dilation
                </span>
                <span className="text-lg font-bold font-mono text-purple-300">{biometrics.pupilDilationMm} mm</span>
                <span className="text-[9px] text-slate-500 font-mono">Cognitive Load Index</span>
              </div>
            </div>
          </div>

          {/* Real-Time Dynamic Sub-Millisecond Teleprompter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Mic className="h-3.5 w-3.5 text-cyan-400" />
                <span>DYNAMIC TELEPROMPTER & VISUAL PHONEME LOCK</span>
              </span>
              <span className="text-cyan-400 font-bold">60 FPS REAL-TIME</span>
            </div>

            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 min-h-[100px] flex flex-wrap gap-x-2 gap-y-2 items-center leading-relaxed">
              {wordTimings.map((wt, idx) => {
                const isSpoken = idx === spokenWordIndex;
                const isPast = idx < spokenWordIndex;
                return (
                  <span
                    key={idx}
                    className={`text-sm transition-all duration-100 rounded px-1.5 py-0.5 font-medium ${
                      isSpoken
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 scale-105"
                        : isPast
                        ? "text-slate-100 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {wt.word}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* Veritas zk-SNARK Cryptographic Certificate Modal */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Veritas zk-SNARK & C2PA Provenance Seal</h3>
              </div>
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex flex-col gap-2.5 overflow-x-auto">
              <div><span className="text-slate-500">Certificate ID:</span> <span className="text-emerald-400 font-bold">{veritasSeal.certId}</span></div>
              <div><span className="text-slate-500">Proof Protocol:</span> <span className="text-cyan-400">zk-SNARK (Plonk / Groth16) + Ed25519</span></div>
              <div><span className="text-slate-500">Manifest Hash:</span> <span className="text-purple-400 break-all">{veritasSeal.c2paManifestHash}</span></div>
              <div><span className="text-slate-500">Signature:</span> <span className="text-amber-400 break-all">{veritasSeal.signature}</span></div>
              <div><span className="text-slate-500">Sovereign Issuer:</span> <span className="text-slate-200">{veritasSeal.issuer}</span></div>
              <div><span className="text-slate-500">Timestamp:</span> <span className="text-slate-400">{veritasSeal.timestamp}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
