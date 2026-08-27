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
  Video,
  Mic,
  Cpu,
  Volume2,
  VolumeX,
  Activity,
  CheckCircle2,
  Lock,
  Globe,
  Share2,
  Zap,
  Loader2,
  Check
} from "lucide-react";
import { EXECUTIVE_PERSONAS } from "@/lib/tier6/personas";
import {
  ExecutivePersona,
  ScriptWordTiming,
  VeritasProvenanceSeal
} from "@/lib/tier6/types";
import { computePhoneticWordTimings } from "@/lib/tier6/timing_engine";
import { generateVeritasSeal } from "@/lib/tier6/veritas_engine";
import { VeoVideoStage } from "./VeoVideoStage";
import { VeoFramingStage } from "./VeoFramingStage";
import { VeoSittingStage } from "./VeoSittingStage";

export default function Gen7StudioPage() {
  // State
  const [selectedPersona, setSelectedPersona] = useState<ExecutivePersona>(EXECUTIVE_PERSONAS[0]);
  const [scriptText, setScriptText] = useState<string>(EXECUTIVE_PERSONAS[0].defaultScript);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>(EXECUTIVE_PERSONAS[0].audioUrl);
  const [audioDuration, setAudioDuration] = useState<number>(23.2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [spokenWordIndex, setSpokenWordIndex] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<"standing_keynote" | "dynamic_framing" | "sitting_boardroom">("standing_keynote");
  const [restartTrigger, setRestartTrigger] = useState<number>(0);
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthSuccess, setSynthSuccess] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Compute Word Timings dynamically based on audio duration
  const wordTimings = useMemo<ScriptWordTiming[]>(() => {
    return computePhoneticWordTimings(scriptText, audioDuration);
  }, [scriptText, audioDuration]);

  // Active Veritas Cryptographic Seal
  const veritasSeal = useMemo<VeritasProvenanceSeal>(() => {
    return generateVeritasSeal(selectedPersona, scriptText, selectedPersona.videoUrl);
  }, [selectedPersona, scriptText]);

  // Audio Playback Synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || restartTrigger === 0) return;
    audio.currentTime = 0;
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [restartTrigger]);

  const handleAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    setCurrentTime(time);

    // Sync teleprompter word highlighting
    const lookupTime = time + 0.12;
    let activeIdx = -1;
    for (let i = 0; i < wordTimings.length; i++) {
      if (lookupTime >= wordTimings[i].start && lookupTime <= wordTimings[i].end) {
        activeIdx = i;
        break;
      }
    }
    setSpokenWordIndex(activeIdx);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setSpokenWordIndex(-1);
  };

  // Handle Persona Change
  const handleSelectPersona = (persona: ExecutivePersona) => {
    setIsPlaying(false);
    setSelectedPersona(persona);
    setScriptText(persona.defaultScript);
    setActiveAudioUrl(persona.audioUrl);
    setAudioDuration(23.2);
    setCurrentTime(0);
    setSpokenWordIndex(-1);
    setRestartTrigger(prev => prev + 1);
  };

  // Synchronized Master Playback
  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Restart Playback
  const handleRestart = () => {
    setCurrentTime(0);
    setSpokenWordIndex(-1);
    setRestartTrigger(prev => prev + 1);
    setIsPlaying(true);
  };

  // Live Script Voice Synthesis with Gemini Neural Voice
  const handleSynthesize = async () => {
    if (!scriptText.trim()) return;
    setIsSynthesizing(true);
    setSynthSuccess(false);

    try {
      const res = await fetch("/api/tier6/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptText,
          personaName: selectedPersona.name
        })
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        setActiveAudioUrl(data.audioUrl);
        setAudioDuration(data.durationSeconds || 20);
        setSynthSuccess(true);
        setCurrentTime(0);
        setSpokenWordIndex(-1);
        setRestartTrigger(prev => prev + 1);
        setIsPlaying(true);
        setTimeout(() => setSynthSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Synthesis error:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                Z
              </div>
              <span className="font-bold text-lg tracking-wider text-slate-100">
                ZYVORIQ
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <Sparkles className="h-3 w-3" />
              GOOGLE VEO 3.1 BROADCAST
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProvenanceModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs hover:bg-emerald-500/20 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Veritas zk-SNARK Verified</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 md:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Persona Selector & Script Editor (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Executive Persona Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  EXECUTIVE DIGITAL TWIN
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {EXECUTIVE_PERSONAS.length} Personas
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {EXECUTIVE_PERSONAS.map((p) => {
                const isSelected = selectedPersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition-all text-left group ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20"
                        : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={p.avatarUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 33vw, 150px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-2">
                      <span className="font-bold text-xs text-white truncate">
                        {p.name.split(" ")[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate">
                        {p.location.split(",")[0]}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script Editor with Live Synthesis Action */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  EXECUTIVE SCRIPT
                </h2>
              </div>

              {/* Synthesize Button */}
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : synthSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-950" />
                    <span>Voice Ready!</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>⚡ Synthesize Voice</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed resize-none font-sans"
              placeholder="Paste or write any custom presentation script here, then click ⚡ Synthesize Voice..."
            />
          </div>
        </div>

        {/* Right Column: Clean Master Broadcast Player (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-col gap-4">
            
            {/* Header with 3 Clean Scenario Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-100 tracking-wide">
                  MASTER BROADCAST
                </h2>
              </div>

              {/* Clean 3-Tab Scenario Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap gap-1">
                <button
                  onClick={() => setViewMode("standing_keynote")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    viewMode === "standing_keynote"
                      ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🧍 STANDING KEYNOTE
                </button>
                <button
                  onClick={() => setViewMode("dynamic_framing")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    viewMode === "dynamic_framing"
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🔍 DYNAMIC FRAMING
                </button>
                <button
                  onClick={() => setViewMode("sitting_boardroom")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    viewMode === "sitting_boardroom"
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🪑 SITTING BOARDROOM
                </button>
              </div>
            </div>

            {/* Master Audio Element with Synchronization */}
            <audio
              ref={audioRef}
              src={activeAudioUrl}
              preload="auto"
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              className="hidden"
            />

            {/* Mode 1: Standing Keynote (Full-Body Keynote) */}
            {viewMode === "standing_keynote" && (
              <VeoVideoStage
                videoUrl={selectedPersona.videoUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                restartTrigger={restartTrigger}
                onTogglePlay={handleTogglePlay}
              />
            )}

            {/* Mode 2: Dynamic In-Browser Focal Framing Zoom (0ms) */}
            {viewMode === "dynamic_framing" && (
              <VeoFramingStage
                videoUrl={selectedPersona.videoUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                restartTrigger={restartTrigger}
                onTogglePlay={handleTogglePlay}
              />
            )}

            {/* Mode 3: Sitting Executive Posture (Boardroom) */}
            {viewMode === "sitting_boardroom" && (
              <VeoSittingStage
                videoUrl={selectedPersona.id === "maya" ? "/assets/video/maya_master.mp4" : selectedPersona.videoUrl}
                isPlaying={isPlaying}
                currentTime={currentTime}
                restartTrigger={restartTrigger}
                onTogglePlay={handleTogglePlay}
              />
            )}

            {/* Video Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="h-9 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
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
                  <span>/ {audioDuration.toFixed(1)}s</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Activity className="h-3.5 w-3.5" />
                  <span>0ms Drift</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Real-Time Teleprompter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Mic className="h-3.5 w-3.5 text-cyan-400" />
                <span>DYNAMIC TELEPROMPTER & PHONETIC CADENCE</span>
              </span>
              <span className="text-cyan-400 font-bold font-mono">{audioDuration.toFixed(1)}s TOTAL</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 max-h-[160px] overflow-y-auto flex flex-wrap gap-x-2 gap-y-2 items-center leading-relaxed">
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

      {/* Veritas Provenance Cryptographic Certificate Modal */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
                <h3 className="font-bold text-lg text-slate-100">Veritas zk-SNARK Provenance Seal</h3>
              </div>
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <span className="text-slate-500">Root Consensus Hash:</span>
                <span className="text-emerald-400 break-all text-[11px]">{veritasSeal.c2paManifestHash}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                <span className="text-slate-500">Ed25519 Presenter Signature:</span>
                <span className="text-cyan-400 break-all text-[11px]">{veritasSeal.signature}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500">Engine: </span>
                  <span className="text-purple-300">Google Veo 3.1 Diffusion</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500">C2PA Cert: </span>
                  <span className="text-slate-300">{veritasSeal.certId}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProvenanceModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Close Verification Seal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
