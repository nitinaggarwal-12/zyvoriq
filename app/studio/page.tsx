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
  Hand
} from "lucide-react";

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"cloning" | "4pane" | "matrix" | "podcast">("cloning");
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [activeTabDiagram, setActiveTabDiagram] = useState<"visual" | "xml">("visual");

  // Story & Emotion Themes (From Scorex)
  const [selectedTheme, setSelectedTheme] = useState<"executive" | "keynote" | "storyteller" | "thriller" | "fireside">("keynote");
  const [selectedPersona, setSelectedPersona] = useState("david");
  const [selectedBaseModel, setSelectedBaseModel] = useState<"Charon" | "Aoede" | "Puck" | "Kore" | "Fenrir">("Puck");
  const [selectedAccent, setSelectedAccent] = useState("us_silicon_valley");
  const [selectedArchetype, setSelectedArchetype] = useState("startup_founder");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  // Advanced Prosody Sliders (Scorex)
  const [stability, setStability] = useState(82);
  const [styleExaggeration, setStyleExaggeration] = useState(45);
  const [breathDensity, setBreathDensity] = useState(30);
  const [spectralDenoising, setSpectralDenoising] = useState(90);

  // Active Acoustic Telemetry Display
  const [activeVoiceLabel, setActiveVoiceLabel] = useState("David (DeepMind Puck Tenor)");
  const [activePitchRate, setActivePitchRate] = useState("Pitch: 1.20 • Rate: 1.18");

  // Prompt-to-Voice AI Designer
  const [customVoicePrompt, setCustomVoicePrompt] = useState("");
  const [isDesigningVoice, setIsDesigningVoice] = useState(false);

  // Virtual Clone Interactive State
  const [cloneScript, setCloneScript] = useState(
    "Traditional enterprise pipelines take 14 days and $140,000. [dramatic pause] Zyvoriq collapses this into 90 seconds with Veritas consensus and Ed25519 provenance."
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [showMeshOverlay, setShowMeshOverlay] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);

  // 5 Story & Emotion Themes with Specific Human Poses
  const storyThemes = [
    { 
      id: "keynote", 
      name: "Visionary Keynote", 
      icon: "🌌", 
      tagline: "Steve Jobs / TED Stage • Open Hand Gestures", 
      color: "from-emerald-500 to-teal-600", 
      border: "border-emerald-500/40",
      pitchMult: 1.14,
      rateMult: 1.08,
      avatarImage: "/assets/avatars/avatar_keynote_gesture.jpg",
      expressionLabel: "Passionate Visionary Smile & Open Palm Presentation"
    },
    { 
      id: "executive", 
      name: "Executive Gravitas", 
      icon: "👔", 
      tagline: "Boardroom Skyline • Direct Assertive Stance", 
      color: "from-blue-500 to-indigo-600", 
      border: "border-blue-500/40",
      pitchMult: 0.90,
      rateMult: 0.94,
      avatarImage: "/assets/avatars/avatar_executive_gravitas.jpg",
      expressionLabel: "Assertive Boardroom Gaze & Confident Posture"
    },
    { 
      id: "thriller", 
      name: "Investigative Drama", 
      icon: "🕵️", 
      tagline: "Cyber Control Center • Analytical Focus", 
      color: "from-rose-500 to-red-600", 
      border: "border-rose-500/40",
      pitchMult: 0.80,
      rateMult: 0.92,
      avatarImage: "/assets/avatars/avatar_drama_investigative.jpg",
      expressionLabel: "Intense Analytical Brow & Focused Forensic Body Language"
    },
    { 
      id: "fireside", 
      name: "Fireside Journey", 
      icon: "☕", 
      tagline: "Cozy Studio Armchair • Warm Empathetic Smile", 
      color: "from-purple-500 to-violet-600", 
      border: "border-purple-500/40",
      pitchMult: 0.95,
      rateMult: 0.84,
      avatarImage: "/assets/avatars/avatar_fireside_journey.jpg",
      expressionLabel: "Warm Empathetic Smile, Holding Coffee Cup, Conversational Lean"
    },
    { 
      id: "storyteller", 
      name: "Master Storyteller", 
      icon: "🎬", 
      tagline: "Masterclass Keynote • Expressive Gestures", 
      color: "from-amber-500 to-orange-600", 
      border: "border-amber-500/40",
      pitchMult: 1.00,
      rateMult: 0.88,
      avatarImage: "/assets/avatars/avatar_female_executive.jpg",
      expressionLabel: "Magnetic Articulated Hand Gestures & Dynamic Keynote Presence"
    },
  ];

  // 8 Curated Spotlight Personas
  const storyPersonas: Record<string, { 
    name: string; 
    title: string; 
    base: string; 
    vibe: string; 
    pitch: number; 
    rate: number; 
    gender: "male" | "female"; 
    voiceKeywords: string[];
    defaultImage: string;
    bodyLanguage: string;
  }> = {
    david: { 
      name: "David (Silicon Valley)", 
      title: "Visionary Tech Orator & Founder", 
      base: "Puck", 
      vibe: "Inspiring, resonant & punchy", 
      pitch: 1.05, 
      rate: 1.10, 
      gender: "male",
      voiceKeywords: ["Google US English", "Alex", "Fred", "Arthur", "male"],
      defaultImage: "/assets/avatars/avatar_keynote_gesture.jpg",
      bodyLanguage: "Expressive open-hand keynote gestures on stage"
    },
    victoria: { 
      name: "Victoria (London)", 
      title: "MasterClass Executive VP Narrator", 
      base: "Aoede", 
      vibe: "Magnetic, eloquent & expressive", 
      pitch: 1.22, 
      rate: 0.98, 
      gender: "female",
      voiceKeywords: ["Samantha", "Karen", "Victoria", "Google UK English Female", "female"],
      defaultImage: "/assets/avatars/avatar_female_executive.jpg",
      bodyLanguage: "Sophisticated presenter posture with dynamic hand articulation"
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
      defaultImage: "/assets/avatars/avatar_executive_gravitas.jpg",
      bodyLanguage: "Commanding skyline boardroom presence with folded arms"
    },
    priya: { 
      name: "Priya (Bangalore)", 
      title: "Global Transformation CTO", 
      base: "Aoede", 
      vibe: "Decisive & strategic clarity", 
      pitch: 1.16, 
      rate: 1.04, 
      gender: "female",
      voiceKeywords: ["Veena", "Google UK English Female", "Samantha", "en-IN", "female"],
      defaultImage: "/assets/avatars/avatar_female_executive.jpg",
      bodyLanguage: "High-energy tech keynote stance with open palms"
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
      defaultImage: "/assets/avatars/avatar_fireside_journey.jpg",
      bodyLanguage: "Relaxed fireside armchair posture with coffee mug"
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
      defaultImage: "/assets/avatars/avatar_executive_gravitas.jpg",
      bodyLanguage: "Sharp dark suit, direct eye contact in executive suite"
    },
    elena: { 
      name: "Elena (Berlin)", 
      title: "AI Tech Founder & Lead", 
      base: "Kore", 
      vibe: "High-energy visionary optimism", 
      pitch: 1.25, 
      rate: 1.14, 
      gender: "female",
      voiceKeywords: ["Victoria", "Samantha", "Karen", "female"],
      defaultImage: "/assets/avatars/avatar_female_executive.jpg",
      bodyLanguage: "Passionate expressive stage posture"
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
      defaultImage: "/assets/avatars/avatar_fireside_journey.jpg",
      bodyLanguage: "Gentle empathetic smile and intimate conversational lean"
    },
  };

  // 25 Global Accents
  const globalAccents = [
    { id: "us_silicon_valley", name: "Silicon Valley Tech Founder", lang: "en-US" },
    { id: "us_standard", name: "US General Broadcast", lang: "en-US" },
    { id: "uk_oxford", name: "British Oxford (RP)", lang: "en-GB" },
    { id: "uk_scottish", name: "Scottish Highlands", lang: "en-GB" },
    { id: "in_bangalore", name: "Indian Tech Executive (Bangalore)", lang: "en-IN" },
    { id: "sg_singapore", name: "Singaporean Global Executive", lang: "en-SG" },
    { id: "de_frankfurt", name: "German Engineering Precision", lang: "de-DE" },
    { id: "fr_paris", name: "French Intellectual Nuance", lang: "fr-FR" },
    { id: "jp_tokyo", name: "Japanese Meticulous Precision", lang: "ja-JP" },
    { id: "au_sydney", name: "Australian Sydney Open Vowels", lang: "en-AU" },
  ];

  // Active Human Avatar Image Selection
  const activeAvatarImage = storyThemes.find(t => t.id === selectedTheme)?.avatarImage || storyPersonas[selectedPersona]?.defaultImage || "/assets/avatars/avatar_keynote_gesture.jpg";
  const activeBodyLanguageDesc = storyThemes.find(t => t.id === selectedTheme)?.expressionLabel || storyPersonas[selectedPersona]?.bodyLanguage;

  // Preload Active Avatar Image
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = activeAvatarImage;
      img.onload = () => {
        avatarImageRef.current = img;
        drawAvatarFrame(0, 0, false);
      };
    }
  }, [activeAvatarImage]);

  // Update telemetry banner whenever state changes
  useEffect(() => {
    const p = storyPersonas[selectedPersona] || storyPersonas["david"];
    const t = storyThemes.find(theme => theme.id === selectedTheme) || storyThemes[0];
    const calcPitch = (p.pitch * t.pitchMult * (1 + (styleExaggeration - 50) * 0.003)).toFixed(2);
    const calcRate = (p.rate * t.rateMult).toFixed(2);
    setActiveVoiceLabel(`${p.name} (${p.base} • ${p.vibe})`);
    setActivePitchRate(`Pitch: ${calcPitch} • Rate: ${calcRate}x • Emotion: ${t.name}`);
  }, [selectedPersona, selectedTheme, styleExaggeration, stability, breathDensity]);

  // Dynamic Canvas 2D Kinematics Renderer (Mouth morphing & breathing sway on 4K human avatar)
  const drawAvatarFrame = (mouthOpenAmount: number, headBobAngle: number, isBlinking: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Subtle natural breathing sway on whole body
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(headBobAngle * 0.015);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (avatarImageRef.current) {
      ctx.drawImage(avatarImageRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3D NeRF Mesh Overlay Wireframe
    if (showMeshOverlay) {
      ctx.strokeStyle = "rgba(45, 212, 191, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.51, canvas.height * 0.2);
      ctx.lineTo(canvas.width * 0.38, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.64, canvas.height * 0.35);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.38, canvas.height * 0.35);
      ctx.lineTo(canvas.width * 0.51, canvas.height * 0.45);
      ctx.lineTo(canvas.width * 0.64, canvas.height * 0.35);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  };

  // 60FPS Kinematics Loop
  useEffect(() => {
    let startTime = Date.now();
    let isBlinking = false;
    let blinkTimer = 0;

    const animateLoop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      blinkTimer += 0.016;
      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.65) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      if (isSpeakingClone) {
        const mouthOpen = (Math.sin(elapsed * 14) + Math.sin(elapsed * 8) + 2) / 4;
        const headBob = Math.sin(elapsed * 2.5);
        drawAvatarFrame(mouthOpen, headBob, isBlinking);
      } else {
        const restingBob = Math.sin(elapsed * 1.2) * 0.12;
        drawAvatarFrame(0, restingBob, isBlinking);
      }

      animationFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpeakingClone, showMeshOverlay, activeAvatarImage]);

  // Synchronized Real Human Avatar Voice Playback
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

      const persona = storyPersonas[selectedPersona] || storyPersonas["david"];
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
        matchedVoice = voices.find(v => v.lang.startsWith(selectedLanguage.split("-")[0]));
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
      setTimeout(() => setIsSpeakingClone(false), 5000);
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
        
        {/* Top Header & Studio Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <Smile className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Photorealistic AI Human Clone Studio
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-4xl">
              Photorealistic 4K human avatars with real facial expressions, authentic body language and hand gestures, 4,000+ procedural voice matrix, and C2PA cryptographic provenance.
            </p>
          </div>

          {/* Studio Modes */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
              <button
                onClick={() => setStudioMode("cloning")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  studioMode === "cloning"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/20"
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
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Dual-Host Podcast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Acoustic & Body Language Telemetry Ribbon */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-teal-500/30 bg-teal-950/40 px-6 py-3 text-xs font-mono text-teal-300 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Active Model: <b className="text-white">{activeVoiceLabel}</b></span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>{activePitchRate}</span>
            <span className="rounded bg-teal-900/80 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-700/50">
              {activeBodyLanguageDesc}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: 4K HUMAN CLONE & EMOTIONS / BODY LANGUAGE                   */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "cloning" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            {/* LEFT: Emotion Themes, Personas & Script (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* 5 Storytelling & Emotion Themes (Auto-morphs Avatar Pose & Body Language) */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    <span>Emotion Theme &amp; Body Language (Switches Pose &amp; Tone)</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">5 Dynamic Postures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {storyThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id as any)}
                      className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                        selectedTheme === theme.id
                          ? `bg-slate-800 ${theme.border} text-white shadow-xl ring-1 ring-amber-400/50`
                          : "border-slate-800/80 bg-obsidian-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{theme.icon}</span>
                          <span className="text-xs font-bold font-mono text-white">{theme.name}</span>
                        </div>
                        {selectedTheme === theme.id && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">{theme.tagline}</span>
                      <span className="text-[10px] text-emerald-400/90 font-mono mt-1 italic">
                        ✓ {theme.expressionLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8 Curated Spotlight Personas Grid */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>8 Executive Personas (Male &amp; Female Presenters)</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">DeepMind Cast</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {Object.entries(storyPersonas).map(([id, p]) => (
                    <div
                      key={id}
                      onClick={() => setSelectedPersona(id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedPersona === id
                          ? "border-teal-500 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 shadow-md shadow-teal-500/10"
                          : "border-slate-800 bg-obsidian-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white">{p.name}</span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800/50">
                          {p.base} ({p.gender})
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{p.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 italic">{p.bodyLanguage}</div>
                    </div>
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
                  <span className="text-xs font-mono text-emerald-400">Interactive 60FPS</span>
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
                    className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-sans text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 leading-relaxed resize-none"
                    placeholder="Enter narration script..."
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleToggleBroadcast}
                    className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                      isSpeakingClone
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 text-white hover:scale-[1.01] shadow-pink-500/25"
                    }`}
                  >
                    {isSpeakingClone ? (
                      <>
                        <Pause className="h-4 w-4 fill-current" />
                        <span>Speaking {storyPersonas[selectedPersona]?.name} Audio (Click to Pause)</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>▶ Test Human Clone Speech &amp; Gestures ({storyPersonas[selectedPersona]?.name})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Photorealistic 4K Human Clone Viewport (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                      <Camera className="h-4 w-4" />
                      <span>Live 4K Photorealistic Human Clone Viewport</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          showMeshOverlay ? "bg-teal-500/20 text-teal-300 border border-teal-500/40" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {showMeshOverlay ? "3D MESH ON" : "NATURAL 4K"}
                      </button>
                    </div>
                  </div>

                  {/* 4K Photorealistic Canvas with Natural Human Gestures & Breathing */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                    
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                      <canvas
                        ref={canvasRef}
                        width={960}
                        height={540}
                        className="h-full w-full object-cover"
                      />

                      {/* Lower-Third Live Presenter Overlay */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3.5 py-2 backdrop-blur-md shadow-xl">
                        <div className="h-8 w-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center font-mono font-bold text-pink-300 text-xs">
                          AI
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                            <span>{storyPersonas[selectedPersona]?.name}</span>
                            <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] text-emerald-400 border border-emerald-800/50">
                              LIVE
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">{storyPersonas[selectedPersona]?.title}</div>
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
                          className="flex-1 bg-gradient-to-t from-pink-500/40 to-teal-400 rounded-full transition-all duration-150"
                          style={{ height: `${isSpeakingClone ? Math.min(100, h + Math.sin(Date.now() / 150 + i) * 35) : 8}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Pose: <b className="text-white">{activeBodyLanguageDesc}</b></span>
                    <span>Latency: <b className="text-emerald-400">&lt; 25ms</b></span>
                  </div>

                  <button
                    onClick={handleToggleBroadcast}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause Narration" : "Replay Human Clone"}</span>
                  </button>
                </div>

              </div>

              {/* Advanced Prosody & Formant Tuning Panel */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span>Neural Prosody &amp; Acoustic Calibration (Scorex Sliders)</span>
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
                      className="w-full accent-pink-500 cursor-pointer"
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
            
            {/* LEFT: 4,000+ Combination Matrix Browser (7 Cols) */}
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
                      {globalAccents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
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
                      <option value="startup_founder">Visionary Startup Founder</option>
                      <option value="chief_architect">Chief Enterprise Architect</option>
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
                    {selectedBaseModel} • {globalAccents.find(a => a.id === selectedAccent)?.name}
                  </div>
                </div>
              </div>

              {/* Multilingual Dubbing Matrix (30+ Languages) */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                    <Globe className="h-4 w-4" />
                    <span>30+ Multilingual Voice Dubbing Engine</span>
                  </div>
                  <span className="text-xs font-mono text-teal-300 font-bold">Zero-Loss Translation</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  {[
                    { code: "en-US", name: "English (US Master)" },
                    { code: "en-GB", name: "English (UK Oxford)" },
                    { code: "de-DE", name: "German (Frankfurt)" },
                    { code: "ja-JP", name: "Japanese (Tokyo)" },
                    { code: "fr-FR", name: "French (Paris)" },
                    { code: "es-ES", name: "Spanish (Madrid)" },
                    { code: "zh-CN", name: "Mandarin (Beijing)" },
                    { code: "hi-IN", name: "Hindi (Mumbai)" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedLanguage === lang.code
                          ? "border-teal-500 bg-teal-950/50 text-white font-bold shadow-md"
                          : "border-slate-800 bg-obsidian-950/80 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-mono text-xs">{lang.code}</div>
                      <div className="text-[11px] text-slate-300 mt-1">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT: "Prompt-to-Voice" Custom AI Voice Designer (5 Cols) */}
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
                    placeholder="e.g. A warm, gravelly Scottish professor with deep bass resonance, measured cadence, and slight breath intake before key points..."
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
        {/* TAB 3: DUAL-HOST ARCHITECT PODCAST ENGINE (NOTEBOOKLM STYLE)       */}
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
                        <div className="font-mono text-sm font-bold text-white">Host A: Sir Jonathan (Charon)</div>
                        <div className="text-xs text-slate-400">Lead Enterprise Architect • Deep Baritone</div>
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
                        <div className="font-mono text-sm font-bold text-white">Host B: Victoria (Aoede)</div>
                        <div className="text-xs text-slate-400">Chief AI Strategist • Magnetic Soprano</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 pt-3 leading-relaxed italic">
                      &ldquo;Exactly, Jonathan. And the critical differentiator is Veritas. If a benchmark claim lacks primary source grounding, it never makes it to YouTube or LinkedIn.&rdquo;
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
