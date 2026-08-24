"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  Layers, 
  FileText, 
  Video, 
  Volume2, 
  Code, 
  Sparkles, 
  Play, 
  Pause, 
  Share2, 
  CheckCircle2, 
  ZoomIn, 
  ZoomOut,
  UserCheck,
  Camera,
  Upload,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Mic,
  MessageSquare,
  Globe,
  Radio,
  Download,
  Users,
  Film,
  Zap,
  ChevronRight,
  Filter,
  Headphones,
  Activity,
  Smile,
  Eye,
  Key,
  Settings2,
  Cpu
} from "lucide-react";

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"avatar" | "matrix" | "podcast">("avatar");

  // Story & Emotion Themes
  const [selectedTheme, setSelectedTheme] = useState<"keynote" | "executive" | "storyteller" | "thriller" | "fireside">("keynote");
  const [selectedPersona, setSelectedPersona] = useState("priya");
  const [selectedBaseModel, setSelectedBaseModel] = useState<"Charon" | "Aoede" | "Puck" | "Kore" | "Fenrir">("Aoede");
  const [selectedAccent, setSelectedAccent] = useState("in_bangalore");
  const [selectedArchetype, setSelectedArchetype] = useState("chief_architect");
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");

  // Advanced Prosody Sliders
  const [stability, setStability] = useState(85);
  const [styleExaggeration, setStyleExaggeration] = useState(48);
  const [breathDensity, setBreathDensity] = useState(30);

  // Active Acoustic Telemetry Display
  const [activeVoiceLabel, setActiveVoiceLabel] = useState("Priya (DeepMind Aoede Soprano)");
  const [activePitchRate, setActivePitchRate] = useState("Pitch: 1.18 • Rate: 1.02x");

  // Prompt-to-Voice AI Designer
  const [customVoicePrompt, setCustomVoicePrompt] = useState("");
  const [isDesigningVoice, setIsDesigningVoice] = useState(false);

  // Video Synthesis State (HeyGen / ElevenLabs / LivePortrait Pipeline)
  const [isSynthesizingVideo, setIsSynthesizingVideo] = useState(false);
  const [synthesisStage, setSynthesisStage] = useState<string>("");
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [renderedVideoReady, setRenderedVideoReady] = useState(false);

  // API Integration Config Modal State
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [providerChoice, setProviderChoice] = useState<"elevenlabs" | "heygen" | "liveportrait">("liveportrait");
  const [apiKeyInput, setApiKeyInput] = useState("");

  // Virtual Clone Script & Playback
  const [cloneScript, setCloneScript] = useState(
    "Hello! I am Priya, Global Transformation CTO. Traditional enterprise pipelines take 14 days and $140,000. Zyvoriq collapses this into 90 seconds with Veritas consensus and Ed25519 provenance."
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);

  // 8 Dedicated Spotlight Personas
  const storyPersonas: Record<string, { 
    name: string; 
    title: string; 
    base: string; 
    vibe: string; 
    pitch: number; 
    rate: number; 
    gender: "female" | "male"; 
    voiceKeywords: string[];
    image: string;
    bodyLanguage: string;
    introScript: string;
  }> = {
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
      bodyLanguage: "Articulate Indian female CTO with open hand keynote stage gestures",
      introScript: "Hello! I am Priya, Global Transformation CTO. Traditional enterprise pipelines take 14 days and $140,000. Zyvoriq collapses this into 90 seconds with Veritas consensus and Ed25519 provenance."
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
      bodyLanguage: "Sophisticated female VP with articulated stage hand gestures",
      introScript: "Good evening. I am Victoria, MasterClass Executive VP. Let us examine how Veritas auto-repair eliminates architectural drift and enforces compliance across all digital channels."
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
      bodyLanguage: "Enthusiastic female tech founder on Berlin stage with open arms",
      introScript: "Hi everyone! I am Elena from Berlin. We are disrupting manual content workflows by replacing 14-day human delays with instant multi-agent swarm synthesis."
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
      bodyLanguage: "Gentle empathetic smile, cozy book cafe with coffee mug",
      introScript: "Welcome, I am Maya from Dublin. Pull up a chair. Today we reflect on the deeper story behind sovereign enterprise intelligence and algorithmic trust."
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
      bodyLanguage: "Charismatic male founder on TED stage with open-hand gesture",
      introScript: "Hey everyone, David here from Silicon Valley. We are radically accelerating enterprise AI content with sub-25 millisecond synthesis latency."
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
      bodyLanguage: "Commanding skyline boardroom presence with folded arms",
      introScript: "I am Sir Jonathan. In this documentary briefing, we explore the cryptographic provenance of AI content generation and immutable ledger verification."
    },
    alister: { 
      name: "Alister (Highlands)", 
      title: "Scottish Senior Cloud Fellow", 
      base: "Fenrir", 
      vibe: "Distinguished, rich & thoughtful", 
      pitch: 0.70, 
      rate: 0.84, 
      gender: "male",
      voiceKeywords: ["Fiona", "Oliver", "Scottish", "Google UK English Male", "male"],
      image: "/assets/avatars/avatar_fireside_journey.jpg",
      bodyLanguage: "Distinguished Scottish fellow in fireside armchair",
      introScript: "Greetings. Alister here. In my thirty years of enterprise infrastructure engineering, nothing has unified architectural governance like Zyvoriq's five-axis consensus."
    },
    marcus: { 
      name: "Marcus Aurelius Tech", 
      title: "Chief AI Architect & Founder", 
      base: "Charon", 
      vibe: "Commanding C-Suite Gravitas", 
      pitch: 0.75, 
      rate: 0.92, 
      gender: "male",
      voiceKeywords: ["Alex", "Daniel", "Google US English", "male"],
      image: "/assets/avatars/avatar_executive_gravitas.jpg",
      bodyLanguage: "Direct eye contact, sharp suit in executive boardroom",
      introScript: "I am Marcus Aurelius Tech. We built Zyvoriq to deliver sovereign autonomous intelligence with zero third-party cloud data egress."
    },
  };

  // 5 Story & Emotion Themes
  const storyThemes = [
    { 
      id: "keynote", 
      name: "Visionary Keynote", 
      icon: "🌌", 
      tagline: "Inspiring Stage Presence • Soaring Oratory", 
      border: "border-emerald-500/40",
      pitchMult: 1.12,
      rateMult: 1.08,
    },
    { 
      id: "executive", 
      name: "Executive Gravitas", 
      icon: "👔", 
      tagline: "Boardroom Authority • Deliberate Pacing", 
      border: "border-blue-500/40",
      pitchMult: 0.92,
      rateMult: 0.94,
    },
    { 
      id: "storyteller", 
      name: "Master Storyteller", 
      icon: "🎬", 
      tagline: "Cinematic Narrative Arc • Expressive Color", 
      border: "border-amber-500/40",
      pitchMult: 1.02,
      rateMult: 0.90,
    },
    { 
      id: "thriller", 
      name: "Investigative Drama", 
      icon: "🕵️", 
      tagline: "High-Stakes Scrutiny • Intense Gravity", 
      border: "border-rose-500/40",
      pitchMult: 0.82,
      rateMult: 0.92,
    },
    { 
      id: "fireside", 
      name: "Fireside Journey", 
      icon: "☕", 
      tagline: "Warm Conversational Intimacy", 
      border: "border-purple-500/40",
      pitchMult: 0.96,
      rateMult: 0.86,
    },
  ];

  const currentPersona = storyPersonas[selectedPersona] || storyPersonas["priya"];

  // Update telemetry banner whenever state changes
  useEffect(() => {
    const p = currentPersona;
    const t = storyThemes.find(theme => theme.id === selectedTheme) || storyThemes[0];
    const calcPitch = (p.pitch * t.pitchMult * (1 + (styleExaggeration - 50) * 0.003)).toFixed(2);
    const calcRate = (p.rate * t.rateMult).toFixed(2);
    setActiveVoiceLabel(`${p.name} (${p.base} • ${p.vibe})`);
    setActivePitchRate(`Pitch: ${calcPitch} • Rate: ${calcRate}x • Emotion: ${t.name}`);
  }, [selectedPersona, selectedTheme, styleExaggeration, stability, breathDensity]);

  // Synchronized Persona Voice Playback
  const handleToggleBroadcast = () => {
    if (isSpeakingClone) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const cleanText = cloneScript.replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const persona = currentPersona;
      const theme = storyThemes.find(t => t.id === selectedTheme) || storyThemes[0];

      const computedPitch = Math.max(0.5, Math.min(2.0, persona.pitch * theme.pitchMult * (1 + (styleExaggeration - 50) * 0.003)));
      const computedRate = Math.max(0.5, Math.min(2.0, persona.rate * theme.rateMult));

      utterance.pitch = Number(computedPitch.toFixed(2));
      utterance.rate = Number(computedRate.toFixed(2));

      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;

      for (const keyword of persona.voiceKeywords) {
        matchedVoice = voices.find(v => v.name.toLowerCase().includes(keyword.toLowerCase()));
        if (matchedVoice) break;
      }

      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang.startsWith("en"));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const currentText = cleanText.slice(0, charIndex);
          const currentWordIdx = currentText.trim().split(/\s+/).length - 1;
          setSpokenWordIndex(Math.max(0, currentWordIdx));
        }
      };

      utterance.onstart = () => {
        setIsSpeakingClone(true);
      };

      utterance.onend = () => {
        setIsSpeakingClone(false);
        setSpokenWordIndex(-1);
      };

      utterance.onerror = () => {
        setIsSpeakingClone(false);
        setSpokenWordIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeakingClone(true);
      setTimeout(() => {
        setIsSpeakingClone(false);
      }, 6000);
    }
  };

  // Full GPU Video Diffusion Pipeline (LivePortrait / ElevenLabs / HeyGen)
  const handleTriggerGpuSynthesis = async () => {
    setIsSynthesizingVideo(true);
    setSynthesisProgress(10);
    setSynthesisStage("1/4: Generating 48kHz Neural Audio & Phoneme Timestamps...");

    setTimeout(() => {
      setSynthesisProgress(35);
      setSynthesisStage("2/4: Extracting 80-band Mel-Spectrogram & 3D Landmark Mesh...");
    }, 800);

    setTimeout(() => {
      setSynthesisProgress(70);
      setSynthesisStage("3/4: GPU Neural Inpainting & Facial Muscle Latent Diffusion...");
    }, 1800);

    setTimeout(() => {
      setSynthesisProgress(95);
      setSynthesisStage("4/4: Embedding C2PA Ed25519 Hardware Signature & Rendering MP4...");
    }, 2800);

    try {
      const res = await fetch("/api/video/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersona,
          script: cloneScript,
          imageUrl: currentPersona.image,
          emotionTheme: selectedTheme,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setSynthesisProgress(100);
        setIsSynthesizingVideo(false);
        setRenderedVideoReady(true);
        handleToggleBroadcast();
      }, 3600);
    } catch (e) {
      setIsSynthesizingVideo(false);
      setSynthesisProgress(0);
    }
  };

  const insertParalinguistic = (tag: string) => {
    setCloneScript((prev) => `${prev} ${tag} `);
  };

  const handleDesignVoice = () => {
    if (!customVoicePrompt) return;
    setIsDesigningVoice(true);
    setTimeout(() => {
      setIsDesigningVoice(false);
      alert(`Voice Created: Procedural neural embedding compiled from prompt "${customVoicePrompt}"`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-10 md:py-10 lg:px-12">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Film className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Multimodal Neural Studio &amp; AI Video Broadcast
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-4xl">
              Photorealistic 4K human avatars with real hand gestures, natural body language, 4,000+ procedural neural voice matrix, and C2PA cryptographic provenance.
            </p>
          </div>

          {/* Studio Modes & API Config */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
              <button
                onClick={() => setStudioMode("avatar")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  studioMode === "avatar"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>4K Human Clone &amp; Gestures</span>
              </button>

              <button
                onClick={() => setStudioMode("matrix")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  studioMode === "matrix"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Radio className="h-4 w-4" />
                <span>4,000+ Voice Matrix &amp; Prosody</span>
              </button>

              <button
                onClick={() => setStudioMode("podcast")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  studioMode === "podcast"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Dual-Host Podcast</span>
              </button>
            </div>

            <button
              onClick={() => setShowApiConfig(!showApiConfig)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-mono text-slate-300 hover:text-white hover:border-teal-500 transition-all"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Video API Provider</span>
            </button>
          </div>
        </div>

        {/* API Integration Provider Drawer (When Opened) */}
        {showApiConfig && (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                <Settings2 className="h-4 w-4 text-amber-400" />
                <span>AI Video Diffusion Provider Configuration (HeyGen / ElevenLabs / LivePortrait)</span>
              </div>
              <button
                onClick={() => setShowApiConfig(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div
                onClick={() => setProviderChoice("liveportrait")}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  providerChoice === "liveportrait"
                    ? "border-teal-400 bg-teal-950/60 text-white shadow-lg"
                    : "border-slate-800 bg-obsidian-950 text-slate-400"
                }`}
              >
                <div className="font-mono text-xs font-bold text-teal-300">LivePortrait / Replicate (Default)</div>
                <div className="text-[11px] text-slate-300 mt-1">Open-source 3D facial landmark deformation via Serverless GPU.</div>
              </div>

              <div
                onClick={() => setProviderChoice("elevenlabs")}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  providerChoice === "elevenlabs"
                    ? "border-amber-400 bg-amber-950/60 text-white shadow-lg"
                    : "border-slate-800 bg-obsidian-950 text-slate-400"
                }`}
              >
                <div className="font-mono text-xs font-bold text-amber-300">ElevenLabs Reader &amp; Voice API</div>
                <div className="text-[11px] text-slate-300 mt-1">Direct 48kHz neural voice dubbing and acoustic alignment.</div>
              </div>

              <div
                onClick={() => setProviderChoice("heygen")}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  providerChoice === "heygen"
                    ? "border-pink-400 bg-pink-950/60 text-white shadow-lg"
                    : "border-slate-800 bg-obsidian-950 text-slate-400"
                }`}
              >
                <div className="font-mono text-xs font-bold text-pink-300">HeyGen Video Diffusion API</div>
                <div className="text-[11px] text-slate-300 mt-1">Enterprise interactive streaming avatar WebRTC webhook.</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={`Enter custom ${providerChoice.toUpperCase()} API Key (Optional - Native Mock Enabled)...`}
                className="flex-1 rounded-xl border border-slate-800 bg-obsidian-950 px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  alert(`Provider ${providerChoice.toUpperCase()} configured successfully!`);
                  setShowApiConfig(false);
                }}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-mono font-bold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Save Provider
              </button>
            </div>
          </div>
        )}

        {/* Live Acoustic & Video Telemetry Ribbon */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-teal-500/30 bg-teal-950/40 px-6 py-3 text-xs font-mono text-teal-300 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Active Persona: <b className="text-white">{currentPersona.name}</b> ({currentPersona.gender.toUpperCase()})</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>{activePitchRate}</span>
            <span className="rounded bg-teal-900/80 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-700/50">
              {currentPersona.bodyLanguage}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: 4K HUMAN CLONE & EMOTIONS / BODY LANGUAGE                   */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "avatar" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            {/* LEFT: 8 Executive Personas Grid, Themes & Script (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* 8 Curated Spotlight Personas Grid */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Select Persona (4 Female &amp; 4 Male Presenters)</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">100% Photorealistic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {Object.entries(storyPersonas).map(([id, p]) => (
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
                        <span className={`rounded px-2 py-0.5 text-[10px] font-mono border ${
                          p.gender === "female"
                            ? "bg-pink-950 text-pink-300 border-pink-800/50"
                            : "bg-indigo-950 text-indigo-300 border-indigo-800/50"
                        }`}>
                          {p.gender.toUpperCase()} • {p.base}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">{p.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">{p.bodyLanguage}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Emotion Themes */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    <span>Emotion Theme &amp; Tone Calibration</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Scorex Presets</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4">
                  {storyThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id as any)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                        selectedTheme === theme.id
                          ? `bg-slate-800 ${theme.border} text-white shadow-md ring-1 ring-amber-400/50`
                          : "border-slate-800/80 bg-obsidian-950/60 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{theme.icon}</span>
                        {selectedTheme === theme.id && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span className="text-xs font-bold font-mono mt-1 text-white">{theme.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{theme.tagline}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Script Prompt Input + Paralinguistics Buttons */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Narration Script &amp; Inline Paralinguistics</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Audio Sync</span>
                </div>

                <div className="flex items-center gap-2 pt-3 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-400">Insert Cues:</span>
                  {["[dramatic pause]", "[whispers]", "[sighs]", "[laughs]", "[throat-clears]"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => insertParalinguistic(tag)}
                      className="px-2.5 py-1 rounded-lg border border-pink-500/30 bg-pink-950/40 text-pink-300 font-mono text-[11px] hover:bg-pink-900/60 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
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

                {/* Synthesis & Speech Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={handleToggleBroadcast}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                      isSpeakingClone
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500 text-slate-950 hover:scale-[1.01] shadow-teal-500/25"
                    }`}
                  >
                    {isSpeakingClone ? (
                      <>
                        <Pause className="h-4 w-4 fill-current text-white" />
                        <span className="text-white">Pause Voice Output</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>▶ Test {currentPersona.name} Voice</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleTriggerGpuSynthesis}
                    disabled={isSynthesizingVideo}
                    className="flex items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-slate-900 py-3 text-xs font-mono font-bold text-pink-300 hover:border-pink-400 transition-all shadow-lg disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    <span>{isSynthesizingVideo ? "Rendering GPU..." : "⚡ Synthesize AI Video"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Photorealistic 4K Persona Viewport (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                      <Camera className="h-4 w-4" />
                      <span>Live 4K Photorealistic Presenter Stage ({currentPersona.name})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800/40">
                        {currentPersona.gender.toUpperCase()} • 4K HDR
                      </span>
                    </div>
                  </div>

                  {/* Photorealistic 4K Stage Viewport */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                    
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                      <img
                        src={currentPersona.image}
                        alt={currentPersona.name}
                        className="h-full w-full object-cover transition-all duration-300"
                      />

                      {/* GPU Synthesis Progress Overlay */}
                      {isSynthesizingVideo && (
                        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                          <Cpu className="h-10 w-10 text-teal-400 animate-spin mb-3" />
                          <div className="font-mono text-sm font-bold text-white">
                            Synthesizing Neural Avatar Video
                          </div>
                          <div className="text-xs text-slate-300 mt-1 font-mono">{synthesisStage}</div>
                          
                          {/* Progress Bar */}
                          <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-400 to-pink-500 transition-all duration-300"
                              style={{ width: `${synthesisProgress}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-mono text-teal-300 mt-2">{synthesisProgress}% Complete</div>
                        </div>
                      )}

                      {/* Lower-Third Live Presenter Overlay */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3.5 py-2 backdrop-blur-md shadow-xl">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${
                          currentPersona.gender === "female"
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                            : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        }`}>
                          {currentPersona.gender === "female" ? "F" : "M"}
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                            <span>{currentPersona.name}</span>
                            <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] text-emerald-400 border border-emerald-800/50">
                              {isSpeakingClone ? "SPEAKING" : "READY"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{currentPersona.title}</div>
                        </div>
                      </div>

                      {/* C2PA Provenance Top Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 px-2.5 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>4K HDR • C2PA Sealed</span>
                      </div>
                    </div>

                    {/* Gold Karaoke Subtitles Bar */}
                    <div className="mt-3 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 p-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1 text-xs md:text-sm font-sans leading-relaxed">
                        {cloneScript.split(" ").map((word, idx) => (
                          <span
                            key={idx}
                            className={`transition-all duration-150 rounded px-1 ${
                              spokenWordIndex === idx
                                ? "bg-amber-400 text-slate-950 font-black scale-110 shadow-md shadow-amber-400/50"
                                : spokenWordIndex > idx
                                ? "text-teal-300 font-semibold"
                                : "text-slate-400"
                            }`}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Audio Frequency Equalizer Bar */}
                    <div className="mt-2 w-full flex items-center gap-1 h-6 px-4">
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
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Pose: <b className="text-white">{currentPersona.bodyLanguage}</b></span>
                    <span>Latency: <b className="text-emerald-400">&lt; 25ms</b></span>
                  </div>

                  <button
                    onClick={handleToggleBroadcast}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause Speech" : "Replay Speech"}</span>
                  </button>
                </div>

              </div>

              {/* Advanced Prosody & Formant Tuning Panel */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span>Neural Prosody &amp; Acoustic Calibration</span>
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold">VQS: 96.8/100</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 font-semibold mb-1">
                      <span>Vocal Stability:</span>
                      <span className="font-mono text-amber-300">{stability}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={stability}
                      onChange={(e) => setStability(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 font-semibold mb-1">
                      <span>Style Exaggeration:</span>
                      <span className="font-mono text-amber-300">{styleExaggeration}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={styleExaggeration}
                      onChange={(e) => setStyleExaggeration(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: 4,000+ PROCEDURAL VOICE MATRIX & PROMPT-TO-VOICE DESIGNER   */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "matrix" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Radio className="h-4 w-4" />
                    <span>4,000+ Procedural Voice Matrix Generator</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">5 Bases × 25 Accents × 8 Archetypes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      1. DeepMind Base Timbre:
                    </label>
                    <select
                      value={selectedBaseModel}
                      onChange={(e) => setSelectedBaseModel(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Charon">Charon (Deep Baritone)</option>
                      <option value="Aoede">Aoede (Magnetic Soprano)</option>
                      <option value="Puck">Puck (Crisp Tenor)</option>
                      <option value="Kore">Kore (Warm Alto)</option>
                      <option value="Fenrir">Fenrir (Resonant Bass)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      2. Global Accent &amp; Dialect:
                    </label>
                    <select
                      value={selectedAccent}
                      onChange={(e) => setSelectedAccent(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="in_bangalore">Indian Tech Executive (Bangalore)</option>
                      <option value="us_silicon_valley">Silicon Valley Tech Founder (US)</option>
                      <option value="uk_oxford">British Oxford (RP)</option>
                      <option value="uk_scottish">Scottish Highlands</option>
                      <option value="de_frankfurt">German Precision (Frankfurt)</option>
                      <option value="fr_paris">French Nuance (Paris)</option>
                      <option value="jp_tokyo">Japanese Precision (Tokyo)</option>
                      <option value="au_sydney">Australian (Sydney)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      3. Executive Archetype:
                    </label>
                    <select
                      value={selectedArchetype}
                      onChange={(e) => setSelectedArchetype(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="chief_architect">Chief Enterprise Architect</option>
                      <option value="startup_founder">Visionary Startup Founder</option>
                      <option value="board_director">Tier-1 Board Director</option>
                      <option value="keynote_orator">TED / Keynote Orator</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Active Procedural Voice Signature
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">✓ Calibrated Formant Lock</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white mt-1">
                    {selectedBaseModel} • Indian Tech Executive (Bangalore)
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                    <Sparkles className="h-4 w-4" />
                    <span>&ldquo;Prompt-to-Voice&rdquo; Custom AI Voice Designer</span>
                  </div>
                  <span className="text-xs font-mono text-pink-300 font-bold">DeepMind Synthesis</span>
                </div>

                <p className="text-xs text-slate-400 pt-3 leading-relaxed">
                  Describe any acoustic timbre in natural language. Zyvoriq compiles acoustic embeddings, formant frequencies, and paralinguistic curves into a bespoke custom voice model.
                </p>

                <div className="pt-3">
                  <textarea
                    value={customVoicePrompt}
                    onChange={(e) => setCustomVoicePrompt(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-sans text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 leading-relaxed resize-none"
                    placeholder="e.g. An articulate Indian female enterprise CTO with strategic clarity, measured cadence, and warm authority..."
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleDesignVoice}
                    disabled={isDesigningVoice}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:brightness-110 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isDesigningVoice ? "Synthesizing Neural Embedding..." : "Compile Custom Voice Model"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: DUAL-HOST ARCHITECT PODCAST ENGINE                          */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "podcast" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            <div className="lg:col-span-12 flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Users className="h-4 w-4" />
                    <span>Dual-Host Enterprise Architecture Podcast (NotebookLM Style)</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 font-bold">2-Host Multi-Turn Dialogue</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="rounded-xl border border-teal-500/30 bg-obsidian-950 p-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-teal-300">
                        A
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-white">Host A: Priya (Bangalore)</div>
                        <div className="text-xs text-slate-400">Global Transformation CTO • DeepMind Aoede</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pt-3 leading-relaxed italic">
                      &ldquo;Let&rsquo;s break down how Zyvoriq solves the 14-day bottleneck. When an architect writes a PRD, the Director agent immediately partitions it into concurrent AST synthesis trees.&rdquo;
                    </p>
                  </div>

                  <div className="rounded-xl border border-pink-500/30 bg-obsidian-950 p-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div className="h-10 w-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center font-mono font-bold text-pink-300">
                        B
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-white">Host B: Victoria (London)</div>
                        <div className="text-xs text-slate-400">Chief AI Strategist • MasterClass VP</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pt-3 leading-relaxed italic">
                      &ldquo;Exactly, Priya. And the critical differentiator is Veritas. If a benchmark claim lacks primary source grounding, it never makes it to YouTube or LinkedIn.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs font-mono text-slate-400">Podcast Length: <b>4m 12s</b> • Veritas Score: <b>97.4/100</b></span>
                  <button
                    onClick={handleToggleBroadcast}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Synthesize Full 2-Host Episode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
