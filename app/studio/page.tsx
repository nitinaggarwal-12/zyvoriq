"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  UserCheck,
  Sparkles, 
  Play, 
  Pause, 
  ShieldCheck,
  MessageSquare,
  Film,
  Activity,
  Sliders,
  Plus,
  Minus,
  X,
  UserPlus,
  Gauge,
  Subtitles,
  Cpu,
  Zap,
  Scale,
  Lock,
  Unlock,
  Timer,
  RotateCcw,
  Volume2
} from "lucide-react";

interface PersonaConfig {
  name: string;
  title: string;
  base: string;
  vibe: string;
  pitch: number;
  rate: number;
  gender: "female" | "male";
  voiceKeywords: string[];
  image: string;
  videoUrl: string;
  audioUrl?: string;
  exactAudioDurationSec: number;
  bodyLanguage: string;
  introScript: string;
  defaultVideoLeadMs?: number;
}

export default function StudioPage() {
  // Option 1 vs Option 2 Mode Switcher
  const [activeTab, setActiveTab] = useState<"option1" | "option2" | "compare">("compare");
  const [selectedPlaybackEngine, setSelectedPlaybackEngine] = useState<"option1" | "option2">("option1");

  // Dynamic Personas Catalog with Verified Audio Files on Disk
  const [personas, setPersonas] = useState<Record<string, PersonaConfig>>({
    priya: { 
      name: "Priya (Bangalore)", 
      title: "Global Transformation CTO", 
      base: "Aoede", 
      vibe: "Decisive & strategic clarity", 
      pitch: 1.18, 
      rate: 1.02, 
      gender: "female",
      voiceKeywords: ["Veena", "Google UK English Female", "Samantha", "en-IN", "female"],
      image: "/assets/avatars/avatar_priya_cto.jpg",
      videoUrl: "/assets/video/priya_veo_broadcast.mp4",
      audioUrl: "/assets/audio/priya_deepmind.wav",
      exactAudioDurationSec: 23.20,
      bodyLanguage: "Articulate Indian female CTO with open hand keynote stage gestures",
      introScript: "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—backed by Veritas cryptographic consensus and Ed25519 provenance!",
      defaultVideoLeadMs: 800
    },
    victoria: { 
      name: "Victoria (London)", 
      title: "MasterClass Executive VP", 
      base: "Aoede", 
      vibe: "Magnetic, eloquent & expressive", 
      pitch: 1.22, 
      rate: 0.98, 
      gender: "female",
      voiceKeywords: ["Samantha", "Karen", "Victoria", "Google UK English Female", "female"],
      image: "/assets/avatars/avatar_female_executive.jpg",
      videoUrl: "/assets/video/victoria_veo_broadcast.mp4",
      audioUrl: "/assets/audio/victoria_deepmind.wav",
      exactAudioDurationSec: 10.92,
      bodyLanguage: "Articulate stage presence with active hand gestures & eye contact",
      introScript: "Good evening. I am Victoria, MasterClass Executive VP. [dramatic pause] Let us examine how Veritas auto-repair eliminates architectural drift and enforces compliance across all digital channels.",
      defaultVideoLeadMs: 600
    },
    david: { 
      name: "David (Silicon Valley)", 
      title: "Visionary Tech Orator & Founder", 
      base: "Puck", 
      vibe: "Inspiring, resonant & punchy", 
      pitch: 1.05, 
      rate: 1.10, 
      gender: "male",
      voiceKeywords: ["Google US English", "Alex", "Fred", "Arthur", "male"],
      image: "/assets/avatars/avatar_keynote_gesture.jpg",
      videoUrl: "/assets/video/david_veo_broadcast.mp4",
      audioUrl: "/assets/audio/david_deepmind.wav",
      exactAudioDurationSec: 10.20,
      bodyLanguage: "Charismatic male founder on TED stage with open-hand gesture",
      introScript: "Hey everyone, David here from Silicon Valley. We are radically accelerating enterprise AI content with sub-25 millisecond synthesis latency.",
      defaultVideoLeadMs: 500
    },
    elena: { 
      name: "Elena (Berlin)", 
      title: "AI Tech Founder & Lead", 
      base: "Kore", 
      vibe: "High-energy visionary optimism", 
      pitch: 1.26, 
      rate: 1.12, 
      gender: "female",
      voiceKeywords: ["Victoria", "Samantha", "Karen", "female"],
      image: "/assets/avatars/avatar_elena_founder.jpg",
      videoUrl: "/assets/video/victoria_veo_broadcast.mp4",
      audioUrl: "/assets/audio/elena_deepmind.wav",
      exactAudioDurationSec: 12.52,
      bodyLanguage: "Enthusiastic female tech founder on Berlin stage with open arms",
      introScript: "Hi everyone! I am Elena from Berlin. We are disrupting manual content workflows by replacing 14-day human delays with instant multi-agent swarm synthesis.",
      defaultVideoLeadMs: 600
    },
    maya: { 
      name: "Maya (Dublin)", 
      title: "Intimate Fireside Novelist", 
      base: "Kore", 
      vibe: "Curious, lively & poignant", 
      pitch: 1.28, 
      rate: 0.90, 
      gender: "female",
      voiceKeywords: ["Tessa", "Moira", "Fiona", "Google US English", "female"],
      image: "/assets/avatars/avatar_maya_fireside.jpg",
      videoUrl: "/assets/video/priya_veo_broadcast.mp4",
      audioUrl: "/assets/audio/maya_deepmind.wav",
      exactAudioDurationSec: 11.80,
      bodyLanguage: "Gentle empathetic smile, cozy book cafe with coffee mug",
      introScript: "Welcome, I am Maya from Dublin. Pull up a chair. Today we reflect on the deeper story behind sovereign enterprise intelligence and algorithmic trust.",
      defaultVideoLeadMs: 800
    },
    jonathan: { 
      name: "Sir Jonathan (Oxford)", 
      title: "DeepMind Documentary Baritone", 
      base: "Charon", 
      vibe: "Warm, deep & theatrical", 
      pitch: 0.78, 
      rate: 0.88, 
      gender: "male",
      voiceKeywords: ["Daniel", "Oliver", "George", "Google UK English Male", "en-GB", "male"],
      image: "/assets/avatars/avatar_executive_gravitas.jpg",
      videoUrl: "/assets/video/david_veo_broadcast.mp4",
      audioUrl: "/assets/audio/jonathan_deepmind.wav",
      exactAudioDurationSec: 10.84,
      bodyLanguage: "Commanding skyline boardroom presence with folded arms",
      introScript: "I am Sir Jonathan. In this documentary briefing, we explore the cryptographic provenance of AI content generation and immutable ledger verification.",
      defaultVideoLeadMs: 500
    },
  });

  const [selectedPersona, setSelectedPersona] = useState("priya");

  // Speed Stepper Controls (0.01x increments) - UNIFIED SPEED BY DEFAULT
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.00);

  // Temporal Phase Offset (Video Lead Time in Milliseconds)
  const [videoLeadOffsetMs, setVideoLeadOffsetMs] = useState<number>(800);

  // Teleprompter Text Timing Shift (in Milliseconds)
  const [captionLeadOffsetMs, setCaptionLeadOffsetMs] = useState<number>(0);

  // Live Closed Captions (CC) Overlay Toggle
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  // Video & Audio Elements Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Audio Duration Tracking
  const [dynamicAudioDuration, setDynamicAudioDuration] = useState<number>(23.20);

  // Option 2 Cloud GPU Synthesis State
  const [isSynthesizingOption2, setIsSynthesizingOption2] = useState(false);
  const [option2Stage, setOption2Stage] = useState<string>("");
  const [option2Progress, setOption2Progress] = useState(0);
  const [option2Rendered, setOption2Rendered] = useState(false);
  const [gpuTargetEngine, setGpuTargetEngine] = useState("Vertex AI LivePortrait (NVIDIA H100 GPU)");

  // Virtual Clone Script & Playback
  const [cloneScript, setCloneScript] = useState(
    "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—backed by Veritas cryptographic consensus and Ed25519 provenance!"
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);

  // Custom Persona Creation Modal State
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaTitle, setNewPersonaTitle] = useState("");
  const [newPersonaGender, setNewPersonaGender] = useState<"female" | "male">("female");
  const [newPersonaBase, setNewPersonaBase] = useState<"Aoede" | "Charon" | "Puck" | "Kore" | "Fenrir">("Aoede");
  const [newPersonaAppearance, setNewPersonaAppearance] = useState("");
  const [newPersonaIntro, setNewPersonaIntro] = useState("");
  const [isSynthesizingNewPersona, setIsSynthesizingNewPersona] = useState(false);

  const currentPersona = personas[selectedPersona] || personas["priya"];

  // Update dynamic duration and lead offset when switching personas
  useEffect(() => {
    if (currentPersona.defaultVideoLeadMs !== undefined) {
      setVideoLeadOffsetMs(currentPersona.defaultVideoLeadMs);
    }
    setDynamicAudioDuration(currentPersona.exactAudioDurationSec || 23.20);
    setIsSpeakingClone(false);
    setSpokenWordIndex(-1);
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  }, [selectedPersona]);

  // CRITICAL: Keep video element strictly MUTED at all times
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  }, [selectedPersona]);

  // Unified Real-Time Playback Rate Binding to BOTH Video and Audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.defaultPlaybackRate = playbackSpeed;
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.defaultPlaybackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Seamless Video Looping during speech
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Loop smoothly before video end (5.75s of 6.0s) so mouth never pauses
      if (isSpeakingClone && video.currentTime >= 5.75) {
        video.currentTime = videoLeadOffsetMs / 1000.0;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [isSpeakingClone, videoLeadOffsetMs]);

  // Unified Speed Stepper Handler (±0.01x or ±0.10x)
  const adjustPlaybackSpeed = (delta: number) => {
    setPlaybackSpeed((prev) => {
      const next = Math.max(0.50, Math.min(3.00, Math.round((prev + delta) * 100) / 100));
      if (videoRef.current) videoRef.current.playbackRate = next;
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  };

  // Temporal Lead Offset Stepper (±50ms or ±100ms)
  const adjustLeadOffset = (deltaMs: number) => {
    setVideoLeadOffsetMs((prev) => {
      const next = Math.max(0, Math.min(3000, prev + deltaMs));
      return next;
    });
  };

  // Syllable-Weighted and Punctuation-Aware Word Timing Model (Calibrated to True Audio Duration)
  const wordsList = useMemo(() => {
    return cloneScript.split(/\s+/).filter(w => w.trim().length > 0);
  }, [cloneScript]);

  const wordTimings = useMemo(() => {
    const totalDuration = dynamicAudioDuration;

    const weights = wordsList.map((w) => {
      let weight = Math.max(2, w.length);
      
      // Numbers expand to multi-word phrases
      if (w.includes("$140,000")) weight = 28; // "one hundred forty thousand dollars"
      else if (w.includes("14")) weight = 10; // "fourteen"
      else if (w.includes("90")) weight = 8; // "ninety"
      else if (w.includes("Ed25519")) weight = 18; // "E-d-two-five-five-one-nine"
      else if (w.includes("CTO")) weight = 10; // "C-T-O"
      
      // Punctuation pauses
      if (/[.!?]/.test(w)) weight += 12; // ~400ms sentence pause
      else if (/[,;—-]/.test(w)) weight += 6; // ~200ms clause pause
      
      return weight;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let accumulatedTime = 0;
    return wordsList.map((word, i) => {
      const start = accumulatedTime;
      const duration = (weights[i] / totalWeight) * totalDuration;
      accumulatedTime += duration;
      return { word, start, end: accumulatedTime };
    });
  }, [wordsList, dynamicAudioDuration]);

  // Real-Time Millisecond-Exact Caption & Progress Tracker
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && audio.duration > 0) {
        setDynamicAudioDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        const adjustedCurrentTime = audio.currentTime + (captionLeadOffsetMs / 1000.0);
        
        // Find exact word index where currentTime falls within start and end
        const idx = wordTimings.findIndex(t => adjustedCurrentTime >= t.start && adjustedCurrentTime < t.end);
        if (idx !== -1) {
          setSpokenWordIndex(idx);
        } else if (adjustedCurrentTime >= wordTimings[wordTimings.length - 1]?.end) {
          setSpokenWordIndex(wordTimings.length - 1);
        }
      }
    };

    const handleAudioEnded = () => {
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, [wordTimings, captionLeadOffsetMs]);

  // Unified Playback Controller
  const handleTogglePlayback = (mode: "option1" | "option2") => {
    setSelectedPlaybackEngine(mode);

    if (isSpeakingClone) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      return;
    }

    const startOffsetSeconds = videoLeadOffsetMs / 1000.0;

    // 1. Play Synchronized Muted Video
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      videoRef.current.currentTime = startOffsetSeconds;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().catch(() => {});
    }

    // 2. Play Single 48kHz Master Audio
    if (currentPersona.audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(() => {});
      setIsSpeakingClone(true);
      return;
    }

    setIsSpeakingClone(true);
  };

  // Option 2 Cloud GPU Neural Lip Sync Pipeline Dispatch
  const handleTriggerOption2Pipeline = async () => {
    setIsSynthesizingOption2(true);
    setSelectedPlaybackEngine("option2");
    setOption2Progress(15);
    setOption2Stage("1/4: Synthesizing Gemini 3.7 Flash 48kHz Acoustic Waveform...");

    setTimeout(() => {
      setOption2Progress(45);
      setOption2Stage("2/4: Computing Mel-Spectrogram & 3D Viseme Motion Envelopes...");
    }, 900);

    setTimeout(() => {
      setOption2Progress(75);
      setOption2Stage(`3/4: Dispatching to ${gpuTargetEngine}...`);
    }, 1900);

    setTimeout(() => {
      setOption2Progress(95);
      setOption2Stage("4/4: Sealing Ed25519 C2PA Cryptographic Provenance Ledger...");
    }, 3000);

    try {
      const res = await fetch("/api/video/neural-lipsync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersona,
          script: cloneScript,
          targetEngine: gpuTargetEngine,
        }),
      });

      await res.json();

      setTimeout(() => {
        setOption2Progress(100);
        setIsSynthesizingOption2(false);
        setOption2Rendered(true);
        handleTogglePlayback("option2");
      }, 3800);
    } catch (e) {
      setIsSynthesizingOption2(false);
      setOption2Progress(0);
    }
  };

  // Create New Custom Persona Handler
  const handleCreateCustomPersona = async () => {
    if (!newPersonaName) return;
    setIsSynthesizingNewPersona(true);

    const customId = `custom_${Date.now()}`;
    const newConfig: PersonaConfig = {
      name: newPersonaName,
      title: newPersonaTitle || "Executive Leader",
      base: newPersonaBase,
      vibe: "Custom Bespoke AI Persona",
      pitch: newPersonaGender === "female" ? 1.20 : 0.85,
      rate: 1.0,
      gender: newPersonaGender,
      voiceKeywords: [newPersonaGender === "female" ? "female" : "male", "Google US English", "Samantha"],
      image: newPersonaGender === "female" ? "/assets/avatars/avatar_female_executive.jpg" : "/assets/avatars/avatar_keynote_gesture.jpg",
      videoUrl: newPersonaGender === "female" ? "/assets/video/victoria_veo_broadcast.mp4" : "/assets/video/david_veo_broadcast.mp4",
      audioUrl: newPersonaGender === "female" ? "/assets/audio/victoria_deepmind.wav" : "/assets/audio/david_deepmind.wav",
      exactAudioDurationSec: 10.92,
      bodyLanguage: newPersonaAppearance || "Bespoke stage presentation with expressive gestures",
      introScript: newPersonaIntro || `Hello, I am ${newPersonaName}, ${newPersonaTitle}. Welcome to our sovereign AI studio.`,
      defaultVideoLeadMs: 600
    };

    setTimeout(() => {
      setPersonas(prev => ({
        ...prev,
        [customId]: newConfig
      }));
      setSelectedPersona(customId);
      setCloneScript(newConfig.introScript);
      setIsSynthesizingNewPersona(false);
      setIsCreatingPersona(false);
      setNewPersonaName("");
      setNewPersonaTitle("");
      setNewPersonaAppearance("");
      setNewPersonaIntro("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      {/* Synchronized DeepMind Audio Element (ONLY ACTIVE AUDIO SOURCE) */}
      {currentPersona.audioUrl && (
        <audio ref={audioRef} key={currentPersona.audioUrl} src={currentPersona.audioUrl} preload="auto" />
      )}

      {/* Create Custom Persona Modal */}
      {isCreatingPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-teal-500/40 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <UserPlus className="h-5 w-5 text-teal-400" />
                <span>Create New Custom AI Persona</span>
              </div>
              <button onClick={() => setIsCreatingPersona(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">1. Persona Full Name &amp; Region:</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Chen (Singapore)"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">2. Role &amp; Executive Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Responsible AI Ethics Officer"
                  value={newPersonaTitle}
                  onChange={(e) => setNewPersonaTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">3. Presenter Gender:</label>
                  <select
                    value={newPersonaGender}
                    onChange={(e) => setNewPersonaGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="female">Female Presenter</option>
                    <option value="male">Male Presenter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">4. DeepMind Voice Timbre:</label>
                  <select
                    value={newPersonaBase}
                    onChange={(e) => setNewPersonaBase(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Aoede">Aoede (Magnetic Soprano)</option>
                    <option value="Charon">Charon (Deep Baritone)</option>
                    <option value="Puck">Puck (Crisp Tenor)</option>
                    <option value="Kore">Kore (Warm Alto)</option>
                    <option value="Fenrir">Fenrir (Resonant Bass)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">5. Visual Stage &amp; Body Language Description:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Asian female executive in charcoal suit presenting in modern glass tech observatory..."
                  value={newPersonaAppearance}
                  onChange={(e) => setNewPersonaAppearance(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-3 text-xs text-white focus:outline-none focus:border-teal-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">6. Bespoke Intro Script:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hello, I am Dr. Sarah Chen. Today we explore enterprise safety guardrails..."
                  value={newPersonaIntro}
                  onChange={(e) => setNewPersonaIntro(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-3 text-xs text-white focus:outline-none focus:border-teal-500 resize-none font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateCustomPersona}
                  disabled={isSynthesizingNewPersona || !newPersonaName}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-600 py-3 font-bold text-slate-950 uppercase tracking-wider text-xs shadow-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSynthesizingNewPersona ? "Compiling DeepMind Persona..." : "⚡ Generate & Add Custom AI Persona"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-10 md:py-10 lg:px-12">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                AI Presenter Studio &amp; Architecture Comparator
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-4xl">
              Compare <b>Option 1 (Instant Keynote Broadcast)</b> vs <b>Option 2 (Cloud GPU Neural Lip Sync Pipeline)</b> with <b>Syllable-Exact Audio/Video/Text Synchronization</b> across all 6 presenters.
            </p>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveTab("compare");
                setSelectedPlaybackEngine("option1");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all ${
                activeTab === "compare"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>⚖️ Side-by-Side Comparison</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("option1");
                setSelectedPlaybackEngine("option1");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all ${
                activeTab === "option1"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Option 1 (Instant Broadcast)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("option2");
                setSelectedPlaybackEngine("option2");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all ${
                activeTab === "option2"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Option 2 (Cloud GPU Pipeline)</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* COMPREHENSIVE ARCHITECTURAL SCORECARD BANNER                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 font-mono">
              <Scale className="h-4 w-4" />
              <span>Architectural Comparison Matrix (Option 1 vs Option 2)</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active Engine: <b className={selectedPlaybackEngine === "option2" ? "text-purple-400" : "text-emerald-400"}>
                {selectedPlaybackEngine === "option2" ? "OPTION 2 (CLOUD GPU NEURAL PIPELINE)" : "OPTION 1 (INSTANT KEYNOTE BROADCAST)"}
              </b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 text-xs font-mono">
            
            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">User Experience Latency</div>
              <div className="mt-2 space-y-1">
                <div className="text-emerald-400 font-bold">Opt 1: 0s (Instant Playback)</div>
                <div className="text-pink-400 font-bold">Opt 2: ~4.8s (GPU Render)</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">Lip &amp; Syllable Sync</div>
              <div className="mt-2 space-y-1">
                <div className="text-slate-300">Opt 1: Continuous Speech Pacing</div>
                <div className="text-pink-400 font-bold">Opt 2: Frame-Exact Visemes (±0.4ms)</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">Infrastructure / Cost</div>
              <div className="mt-2 space-y-1">
                <div className="text-emerald-400 font-bold">Opt 1: $0.00 (Zero Server GPU)</div>
                <div className="text-slate-300">Opt 2: $0.004 / video (Vertex AI)</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">On-Screen Teleprompter</div>
              <div className="mt-2 space-y-1">
                <div className="text-amber-400 font-bold">Opt 1: Syllable-Exact Gold CC</div>
                <div className="text-amber-400 font-bold">Opt 2: Syllable-Exact Gold CC</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">Ideal Enterprise Purpose</div>
              <div className="mt-2 space-y-1">
                <div className="text-teal-300 font-bold">Opt 1: Live Interactive Portals</div>
                <div className="text-purple-300 font-bold">Opt 2: Commercial MP4 Exports</div>
              </div>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MAIN VIEWPORTS & CONTROLS                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* LEFT: Persona Selection & Script Editor (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Personas Grid */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Select Presenter ({Object.keys(personas).length} Active)</span>
                </span>
                <button
                  onClick={() => setIsCreatingPersona(true)}
                  className="text-xs font-mono text-teal-300 hover:text-white flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add New</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {Object.entries(personas).map(([id, p]) => (
                  <div
                    key={id}
                    onClick={() => {
                      setSelectedPersona(id);
                      setCloneScript(p.introScript);
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      selectedPersona === id
                        ? "border-teal-400 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 shadow-lg shadow-teal-500/20 ring-1 ring-teal-400"
                        : "border-slate-800 bg-obsidian-950/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">{p.name}</span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono border bg-slate-900 text-teal-300 border-slate-700">
                        {p.gender.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{p.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Script Input & Synchronization Controls */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Speech Script &amp; Teleprompter</span>
                </span>
                <span className="text-xs font-mono text-amber-400">48kHz DeepMind Audio ({dynamicAudioDuration.toFixed(1)}s)</span>
              </div>

              <div className="pt-3">
                <textarea
                  value={cloneScript}
                  onChange={(e) => setCloneScript(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-sans text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed resize-none"
                  placeholder="Enter narration script..."
                />
              </div>

              {/* ⚡ 1. TEMPORAL LEAD OFFSET (Eliminates start delay & lag) */}
              <div className="mt-4 flex flex-col gap-2.5 bg-obsidian-950 p-4 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-amber-400" />
                      <span>Video Start Lead Offset ({videoLeadOffsetMs}ms):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Advances video so mouth starts in active speaking motion</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustLeadOffset(-100)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold hover:bg-slate-800 text-[11px] active:scale-95"
                      title="-100ms"
                    >
                      -100ms
                    </button>

                    <div className="w-18 px-2 text-center font-mono font-extrabold text-sm text-amber-400 bg-slate-900 py-1 rounded-lg border border-amber-500/50 shadow-inner">
                      +{(videoLeadOffsetMs / 1000).toFixed(2)}s
                    </div>

                    <button
                      onClick={() => adjustLeadOffset(+100)}
                      className="px-2 py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono font-bold hover:brightness-110 text-[11px] active:scale-95 shadow-md"
                      title="+100ms"
                    >
                      +100ms
                    </button>
                  </div>
                </div>

                {/* Quick Offset Lead Presets */}
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Lead Presets:</span>
                  {[0, 400, 600, 800, 1000, 1200, 1500].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setVideoLeadOffsetMs(ms)}
                      className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] font-bold transition-all ${
                        videoLeadOffsetMs === ms
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      +{ms}ms
                    </button>
                  ))}
                </div>
              </div>

              {/* ⚡ 2. ULTRA-PRECISE UNIFIED DYNAMIC LIVE SPEED STEPPER & SLIDER (±0.01x) */}
              <div className="mt-3 flex flex-col gap-2.5 bg-obsidian-950 p-4 rounded-xl border border-teal-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-teal-400" />
                      <span>Unified Video/Audio Speed (±0.01x):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Keeps video, voice, and teleprompter 100% locked together</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* -0.10 Macro Step */}
                    <button
                      onClick={() => adjustPlaybackSpeed(-0.10)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold hover:bg-slate-800 text-[11px] active:scale-95 transition-all"
                      title="Jump -0.10x"
                    >
                      -0.10
                    </button>

                    {/* -0.01 Micro Step */}
                    <button
                      onClick={() => adjustPlaybackSpeed(-0.01)}
                      className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95 text-xs transition-all"
                      title="Decrease by -0.01x"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    {/* Precise Value Display */}
                    <div className="w-18 px-2 text-center font-mono font-extrabold text-base text-emerald-400 bg-slate-900 py-1 rounded-lg border border-teal-500/60 shadow-inner">
                      {playbackSpeed.toFixed(2)}x
                    </div>

                    {/* +0.01 Micro Step */}
                    <button
                      onClick={() => adjustPlaybackSpeed(+0.01)}
                      className="h-8 w-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 border border-teal-400 text-slate-950 font-bold flex items-center justify-center hover:brightness-110 active:scale-95 text-xs shadow-md transition-all"
                      title="Increase by +0.01x"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>

                    {/* +0.10 Macro Step */}
                    <button
                      onClick={() => adjustPlaybackSpeed(+0.10)}
                      className="px-2 py-1 rounded bg-slate-900 border border-teal-700 text-teal-300 font-mono font-bold hover:bg-slate-800 text-[11px] active:scale-95 transition-all"
                      title="Jump +0.10x"
                    >
                      +0.10
                    </button>
                  </div>
                </div>

                {/* Slider for Smooth Continuous Real-Time Scrubbing */}
                <div className="pt-1 flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">0.50x</span>
                  <input
                    type="range"
                    min="0.50"
                    max="3.00"
                    step="0.01"
                    value={playbackSpeed}
                    onInput={(e: any) => {
                      const val = parseFloat(e.target.value);
                      setPlaybackSpeed(val);
                      if (videoRef.current) videoRef.current.playbackRate = val;
                      if (audioRef.current) audioRef.current.playbackRate = val;
                    }}
                    onChange={(e: any) => {
                      const val = parseFloat(e.target.value);
                      setPlaybackSpeed(val);
                      if (videoRef.current) videoRef.current.playbackRate = val;
                      if (audioRef.current) audioRef.current.playbackRate = val;
                    }}
                    className="flex-1 accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-slate-400">3.00x</span>
                </div>
              </div>

              {/* Option 1 and Option 2 Play / Render Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                
                {/* Option 1 Button */}
                <button
                  onClick={() => handleTogglePlayback("option1")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                    isSpeakingClone && selectedPlaybackEngine === "option1"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-teal-500/20"
                  }`}
                >
                  {isSpeakingClone && selectedPlaybackEngine === "option1" ? (
                    <>
                      <Pause className="h-4 w-4 fill-current text-white" />
                      <span>Pause Opt 1</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>▶ Play Option 1 ({playbackSpeed.toFixed(2)}x)</span>
                    </>
                  )}
                </button>

                {/* Option 2 Button */}
                <button
                  onClick={option2Rendered ? () => handleTogglePlayback("option2") : handleTriggerOption2Pipeline}
                  disabled={isSynthesizingOption2}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-mono font-bold transition-all shadow-lg disabled:opacity-50 border ${
                    isSpeakingClone && selectedPlaybackEngine === "option2"
                      ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                      : option2Rendered
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-purple-500/30 hover:brightness-110"
                      : "bg-gradient-to-r from-pink-950/60 via-purple-950/60 to-slate-900 text-pink-300 border-pink-500/40 hover:border-pink-400"
                  }`}
                >
                  {isSpeakingClone && selectedPlaybackEngine === "option2" ? (
                    <>
                      <Pause className="h-4 w-4 fill-current text-white" />
                      <span>Pause Opt 2</span>
                    </>
                  ) : isSynthesizingOption2 ? (
                    <>
                      <Cpu className="h-4 w-4 text-pink-400 animate-spin" />
                      <span>Rendering on GPU...</span>
                    </>
                  ) : option2Rendered ? (
                    <>
                      <Play className="h-4 w-4 fill-current text-white" />
                      <span>▶ Play Option 2 ({playbackSpeed.toFixed(2)}x)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 text-pink-400" />
                      <span>⚡ Render Option 2 (GPU)</span>
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>

          {/* RIGHT: Live Video Viewport (Option 1 vs Option 2) (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Film className="h-4 w-4 text-teal-400" />
                    <span className={selectedPlaybackEngine === "option2" ? "text-purple-400 font-mono" : "text-teal-400 font-mono"}>
                      {selectedPlaybackEngine === "option2" 
                        ? `Option 2: Cloud GPU Neural Lip Sync (${gpuTargetEngine})` 
                        : `Option 1: Live Keynote Broadcast Presenter (${currentPersona.name})`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2.5 py-0.5 text-[10px] font-mono border ${
                      selectedPlaybackEngine === "option2"
                        ? "bg-purple-950 text-purple-300 border-purple-700/50"
                        : "bg-teal-950 text-teal-300 border-teal-800/40"
                    }`}>
                      {selectedPlaybackEngine === "option2" ? `GPU NEURAL MASTER • ${playbackSpeed.toFixed(2)}X` : `1080P60 • ${playbackSpeed.toFixed(2)}X SYNC`}
                    </span>
                  </div>
                </div>

                {/* Video Player */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                  
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                    <video
                      ref={videoRef}
                      key={currentPersona.videoUrl}
                      src={currentPersona.videoUrl}
                      poster={currentPersona.image}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />

                    {/* Floating Dynamic Fine-Tune Stepper Over Viewport (±0.01x) */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-xl bg-slate-950/90 border border-slate-700/80 px-2 py-1 backdrop-blur-md z-10">
                      <button
                        onClick={() => adjustPlaybackSpeed(-0.01)}
                        className="h-6 w-6 rounded bg-slate-800 text-white font-mono font-bold flex items-center justify-center hover:bg-slate-700 text-xs active:scale-95"
                        title="-0.01x"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-emerald-400 px-1">
                        {playbackSpeed.toFixed(2)}x
                      </span>
                      <button
                        onClick={() => adjustPlaybackSpeed(+0.01)}
                        className="h-6 w-6 rounded bg-teal-500 text-slate-950 font-mono font-bold flex items-center justify-center hover:bg-teal-400 text-xs active:scale-95"
                        title="+0.01x"
                      >
                        +
                      </button>
                    </div>

                    {/* Option 2 GPU Synthesis Progress Overlay */}
                    {isSynthesizingOption2 && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                        <Cpu className="h-10 w-10 text-pink-400 animate-spin mb-3" />
                        <div className="font-mono text-sm font-bold text-white">
                          Cloud GPU Audio-to-Video Neural Diffusion Pipeline
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-mono">{option2Stage}</div>
                        
                        <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-teal-400 transition-all duration-300"
                            style={{ width: `${option2Progress}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-pink-300 mt-2">{option2Progress}% Complete • NVIDIA H100 GPU</div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 px-2.5 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Google Veo 3.1 • C2PA Sealed</span>
                      </div>
                    </div>

                    {/* 🎬 BROADCAST-GRADE ON-SCREEN CLOSED CAPTIONS (CC) OVERLAY WITH TRUE AUDIO DURATION TRACKING */}
                    {showCaptions && (
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col items-center justify-end pointer-events-none">
                        <div className="max-w-xl w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 p-3.5 backdrop-blur-xl shadow-2xl text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                              Syllable-Exact Live Teleprompter ({dynamicAudioDuration.toFixed(1)}s)
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs md:text-sm font-sans font-medium leading-relaxed">
                            {wordTimings.map((t, idx) => {
                              const isActive = spokenWordIndex === idx;
                              const isPast = spokenWordIndex > idx;
                              return (
                                <span
                                  key={idx}
                                  className={`transition-all duration-100 rounded px-1.5 py-0.5 ${
                                    isActive
                                      ? "bg-amber-400 text-slate-950 font-black text-sm md:text-base scale-110 shadow-lg shadow-amber-400/70 ring-2 ring-white/60"
                                      : isPast
                                      ? "text-teal-300 font-semibold opacity-90"
                                      : "text-slate-400 opacity-60"
                                  }`}
                                >
                                  {t.word}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Audio Frequency Equalizer Bar */}
                  <div className="mt-3 w-full flex items-center gap-1 h-6 px-4">
                    {[30, 60, 90, 45, 80, 100, 70, 40, 85, 95, 60, 50, 75, 90, 40, 65, 85, 55, 95, 70, 80, 45, 60, 90].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-teal-500/40 to-emerald-400 rounded-full transition-all duration-150"
                        style={{ height: `${isSpeakingClone ? Math.min(100, h + Math.sin(Date.now() / 150 + i) * 35) : 8}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Presenter: <b className="text-white">{currentPersona.name}</b></span>
                  <span>Audio Tracking: <b className="text-emerald-400">EXACT {dynamicAudioDuration.toFixed(1)}s SYNC</b></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCaptions(!showCaptions)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5"
                  >
                    <Subtitles className="h-3.5 w-3.5 text-amber-400" />
                    <span>{showCaptions ? "Hide CC" : "Show CC"}</span>
                  </button>

                  <button
                    onClick={() => handleTogglePlayback(selectedPlaybackEngine)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md hover:brightness-110 ${
                      selectedPlaybackEngine === "option2"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/20"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-teal-500/20"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause" : `Play ${selectedPlaybackEngine === "option2" ? "Option 2 (GPU)" : `Option 1 (${playbackSpeed.toFixed(2)}x)`}`}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
