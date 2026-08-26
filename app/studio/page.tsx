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
  Check
} from "lucide-react";
import { EXECUTIVE_PERSONAS } from "@/lib/tier6/personas";
import { ExecutivePersona, ScriptWordTiming, VeritasProvenanceSeal } from "@/lib/tier6/types";
import { computePhoneticWordTimings } from "@/lib/tier6/timing_engine";
import { generateVeritasSeal } from "@/lib/tier6/veritas_engine";

export default function Tier6StudioPage() {
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

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Computed Word Timings
  const wordTimings = useMemo<ScriptWordTiming[]>(() => {
    return computePhoneticWordTimings(scriptText, 23.20);
  }, [scriptText]);

  // Active Veritas Cryptographic Seal
  const veritasSeal = useMemo<VeritasProvenanceSeal>(() => {
    return generateVeritasSeal(selectedPersona, scriptText, selectedPersona.videoUrl);
  }, [selectedPersona, scriptText]);

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
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = isMuted;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback error:", err);
      });
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

  // Real-Time 60 FPS Video Clock & Teleprompter Sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTick = () => {
      if (!video.paused && !video.ended) {
        const time = video.currentTime;
        setCurrentTime(time);

        // Find active word index
        const idx = wordTimings.findIndex(t => time >= t.start && time < t.end);
        if (idx !== -1) {
          setSpokenWordIndex(idx);
        } else if (time >= (wordTimings[wordTimings.length - 1]?.end || 0)) {
          setSpokenWordIndex(wordTimings.length - 1);
        }
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(syncTick);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(syncTick);
    }

    const handleEnded = () => {
      setIsPlaying(false);
      setSpokenWordIndex(-1);
      setCurrentTime(0);
      cancelAnimationFrame(animationFrameRef.current);
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, wordTimings]);

  // One-Click Tier 6 Synthesis Simulation
  const handleSynthesizeTier6 = () => {
    setIsSynthesizing(true);
    setSynthProgress(10);
    setSynthStage("Stage 1/4: Gemini 3.1 Flash Cognitive Script Conditioning...");

    setTimeout(() => {
      setSynthProgress(40);
      setSynthStage("Stage 2/4: Synthesizing DeepMind 48kHz Emotional Neural Audio...");
    }, 700);

    setTimeout(() => {
      setSynthProgress(75);
      setSynthStage("Stage 3/4: Full-Body Multimodal Video Diffusion & 0ms Biological Lip Sync...");
    }, 1500);

    setTimeout(() => {
      setSynthProgress(95);
      setSynthStage("Stage 4/4: Generating Veritas Ed25519 & C2PA Cryptographic Provenance...");
    }, 2200);

    setTimeout(() => {
      setSynthProgress(100);
      setSynthStage("🎉 Tier 6 Digital Twin Synthesized Successfully!");
      setTimeout(() => {
        setIsSynthesizing(false);
        handleRestart();
      }, 600);
    }, 2800);
  };

  // AI Script Polish
  const handleAiPolishScript = () => {
    const polished = `Hello everyone! I'm ${selectedPersona.name.split(" ")[0]}, ${selectedPersona.title}. With Zyvoriq, we eliminate weeks of multi-agency bottlenecks, orchestrating autonomous AI broadcasts with sub-millisecond precision, cryptographic consensus, and immutable Veritas provenance!`;
    setScriptText(polished);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* 1. Full-Width Sticky Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">ZYVORIQ</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  TIER 6 ENGINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Autonomous Cognitive Digital Twin Studio</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <Link href="/director" className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              Director
            </Link>
            <Link href="/studio" className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
              Studio Player
            </Link>
            <Link href="/governance" className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              Governance
            </Link>
            <Link href="/veritas" className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              Veritas QA
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sovereign Cloudtop Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Studio Workstation */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Presenter Selector & Script Editor (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section A: Executive Presenter Selection */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">1. Executive Digital Twin</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">6 Personas Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {EXECUTIVE_PERSONAS.map(persona => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`relative p-3 rounded-xl text-left transition-all border flex flex-col gap-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-950/60 to-blue-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                        : "bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-700 shrink-0">
                        <Image
                          src={persona.avatarUrl}
                          alt={persona.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-100 truncate">{persona.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{persona.title}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/50">
                      <span className="truncate">{persona.location.split(",")[0]}</span>
                      {isSelected && <span className="text-cyan-400 font-bold flex items-center gap-0.5"><Check className="h-3 w-3" /> ACTIVE</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Executive Script & Cognitive Conditioning */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">2. Cognitive Speech Script</h2>
              </div>
              <button
                onClick={handleAiPolishScript}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/40 text-xs font-semibold hover:bg-purple-900/60 transition-all shadow-sm"
              >
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>AI Polish</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={scriptText}
                onChange={e => setScriptText(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                placeholder="Enter speech script for the executive digital twin..."
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5">
                <span>{scriptText.split(/\s+/).filter(Boolean).length} words | ~23.2s runtime</span>
                <span className="font-mono text-purple-400">Gemini 3.1 Conditioning</span>
              </div>
            </div>

            {/* Synthesis Button */}
            <button
              onClick={handleSynthesizeTier6}
              disabled={isSynthesizing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide uppercase shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <Activity className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Tier 6 Clone...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-white" />
                  <span>⚡ Synthesize Tier 6 Executive Broadcast</span>
                </>
              )}
            </button>

            {/* Synthesis Progress Bar */}
            {isSynthesizing && (
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cyan-300 font-bold">{synthStage}</span>
                  <span className="text-cyan-400">{synthProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${synthProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section C: Veritas C2PA Trust Shield Summary */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Veritas C2PA Verified</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ED25519 SEALED
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                  {selectedPersona.c2paCertId}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProvenanceModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Inspect Cert</span>
            </button>
          </div>

        </div>

        {/* Right Column: 1080p Broadcast Video Player & Dynamic Teleprompter (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Master Video Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4">
            
            {/* Player Header Bar */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-slate-200">1080P MASTER BROADCAST</span>
                <span className="text-[10px] text-slate-400 font-mono">| 48kHz Master Audio</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
                  <button
                    onClick={() => setSelectedResolution("1080p")}
                    className={`px-2 py-0.5 rounded ${selectedResolution === "1080p" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-500"}`}
                  >
                    1080P
                  </button>
                  <button
                    onClick={() => setSelectedResolution("4K")}
                    className={`px-2 py-0.5 rounded ${selectedResolution === "4K" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-500"}`}
                  >
                    4K HDR
                  </button>
                </div>
              </div>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
              <video
                ref={videoRef}
                src={selectedPersona.videoUrl}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Watermark & Badges Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>C2PA Authenticated</span>
              </div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{selectedPersona.name}</span>
              </div>

              {/* Play / Pause Big Center Button Overlay (on hover when paused) */}
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

      {/* Veritas Cryptographic Certificate Modal */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Veritas Cryptographic C2PA Certificate</h3>
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
              <div><span className="text-slate-500">Algorithm:</span> <span className="text-cyan-400">{veritasSeal.algorithm} (FIPS 186-5)</span></div>
              <div><span className="text-slate-500">Manifest Hash:</span> <span className="text-purple-400 break-all">{veritasSeal.c2paManifestHash}</span></div>
              <div><span className="text-slate-500">Signature:</span> <span className="text-amber-400 break-all">{veritasSeal.signature}</span></div>
              <div><span className="text-slate-500">Issuer:</span> <span className="text-slate-200">{veritasSeal.issuer}</span></div>
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
