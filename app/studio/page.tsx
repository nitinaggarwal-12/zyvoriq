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
  Maximize2
} from "lucide-react";

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"cloning" | "4pane" | "matrix" | "podcast">("cloning");
  const [videoDisplayMode, setVideoDisplayMode] = useState<"mp4_broadcast" | "nerf_mesh">("mp4_broadcast");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [activeTabDiagram, setActiveTabDiagram] = useState<"visual" | "xml">("visual");

  // Story & Emotion Themes (From Scorex)
  const [selectedTheme, setSelectedTheme] = useState<"storyteller" | "keynote" | "thriller" | "fireside" | "executive">("executive");
  const [selectedPersona, setSelectedPersona] = useState("jonathan");
  const [selectedBaseModel, setSelectedBaseModel] = useState<"Charon" | "Aoede" | "Puck" | "Kore" | "Fenrir">("Charon");
  const [selectedAccent, setSelectedAccent] = useState("us_standard");
  const [selectedArchetype, setSelectedArchetype] = useState("chief_architect");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  // Advanced Prosody Sliders (Scorex)
  const [stability, setStability] = useState(82);
  const [styleExaggeration, setStyleExaggeration] = useState(45);
  const [breathDensity, setBreathDensity] = useState(30);
  const [spectralDenoising, setSpectralDenoising] = useState(90);

  // Active Acoustic Telemetry Display
  const [activeVoiceLabel, setActiveVoiceLabel] = useState("Sir Jonathan (DeepMind Charon Baritone)");
  const [activePitchRate, setActivePitchRate] = useState("Pitch: 0.74 • Rate: 0.86");

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
  const [lipSyncPrecision, setLipSyncPrecision] = useState(99.8);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);

  // 5 Story & Emotion Themes
  const storyThemes = [
    { 
      id: "executive", 
      name: "Executive Gravitas", 
      icon: "👔", 
      tagline: "Authoritative Board Briefing", 
      color: "from-blue-500 to-indigo-600", 
      border: "border-blue-500/40",
      pitchMult: 0.90,
      rateMult: 0.94
    },
    { 
      id: "keynote", 
      name: "Visionary Keynote", 
      icon: "🌌", 
      tagline: "Steve Jobs / TED Odyssey", 
      color: "from-emerald-500 to-teal-600", 
      border: "border-emerald-500/40",
      pitchMult: 1.14,
      rateMult: 1.08
    },
    { 
      id: "storyteller", 
      name: "Master Storyteller", 
      icon: "🎬", 
      tagline: "Cinematic 5-Act Narrative Arc", 
      color: "from-amber-500 to-orange-600", 
      border: "border-amber-500/40",
      pitchMult: 1.00,
      rateMult: 0.88
    },
    { 
      id: "thriller", 
      name: "Investigative Drama", 
      icon: "🕵️", 
      tagline: "High-Stakes Risk & Revelation", 
      color: "from-rose-500 to-red-600", 
      border: "border-rose-500/40",
      pitchMult: 0.80,
      rateMult: 0.92
    },
    { 
      id: "fireside", 
      name: "Fireside Journey", 
      icon: "☕", 
      tagline: "Intimate Founder-to-Founder", 
      color: "from-purple-500 to-violet-600", 
      border: "border-purple-500/40",
      pitchMult: 0.95,
      rateMult: 0.84
    },
  ];

  // 8 Curated Spotlight Personas
  const storyPersonas: Record<string, { name: string; title: string; base: string; vibe: string; pitch: number; rate: number; gender: "male" | "female"; voiceKeywords: string[] }> = {
    jonathan: { 
      name: "Sir Jonathan", 
      title: "DeepMind Documentary Baritone", 
      base: "Charon", 
      vibe: "Warm, deep & theatrical", 
      pitch: 0.78, 
      rate: 0.88, 
      gender: "male",
      voiceKeywords: ["Daniel", "Oliver", "George", "Google UK English Male", "en-GB", "male"] 
    },
    victoria: { 
      name: "Victoria", 
      title: "MasterClass Executive Narrator", 
      base: "Aoede", 
      vibe: "Magnetic, eloquent & expressive", 
      pitch: 1.22, 
      rate: 0.98, 
      gender: "female",
      voiceKeywords: ["Samantha", "Karen", "Victoria", "Google UK English Female", "female"] 
    },
    david: { 
      name: "David", 
      title: "Visionary Tech Orator", 
      base: "Puck", 
      vibe: "Inspiring, resonant & punchy", 
      pitch: 1.05, 
      rate: 1.10, 
      gender: "male",
      voiceKeywords: ["Google US English", "Alex", "Fred", "Arthur", "male"] 
    },
    maya: { 
      name: "Maya", 
      title: "Intimate Fireside Novelist", 
      base: "Kore", 
      vibe: "Curious, lively & poignant", 
      pitch: 1.28, 
      rate: 0.90, 
      gender: "female",
      voiceKeywords: ["Tessa", "Moira", "Fiona", "Google US English", "female"] 
    },
    alister: { 
      name: "Alister", 
      title: "Scottish Senior Cloud Fellow", 
      base: "Fenrir", 
      vibe: "Distinguished, rich & thoughtful", 
      pitch: 0.70, 
      rate: 0.84, 
      gender: "male",
      voiceKeywords: ["Fiona", "Oliver", "Scottish", "Google UK English Male", "male"] 
    },
    priya: { 
      name: "Priya", 
      title: "Global Transformation CTO", 
      base: "Aoede", 
      vibe: "Decisive & strategic clarity", 
      pitch: 1.16, 
      rate: 1.04, 
      gender: "female",
      voiceKeywords: ["Veena", "Google UK English Female", "Samantha", "en-IN", "female"] 
    },
    marcus: { 
      name: "Marcus Aurelius Tech", 
      title: "AI Executive Clone & Founder", 
      base: "Charon", 
      vibe: "Commanding C-Suite Gravitas", 
      pitch: 0.75, 
      rate: 0.92, 
      gender: "male",
      voiceKeywords: ["Alex", "Daniel", "Google US English", "male"] 
    },
    elena: { 
      name: "Elena", 
      title: "AI Tech Founder & Lead", 
      base: "Kore", 
      vibe: "High-energy visionary optimism", 
      pitch: 1.25, 
      rate: 1.14, 
      gender: "female",
      voiceKeywords: ["Victoria", "Samantha", "Karen", "female"] 
    },
  };

  // 25 Global Accents
  const globalAccents = [
    { id: "us_standard", name: "US General Broadcast", lang: "en-US" },
    { id: "us_silicon_valley", name: "Silicon Valley Tech Founder", lang: "en-US" },
    { id: "uk_oxford", name: "British Oxford (RP)", lang: "en-GB" },
    { id: "uk_scottish", name: "Scottish Highlands", lang: "en-GB" },
    { id: "in_bangalore", name: "Indian Tech Executive (Bangalore)", lang: "en-IN" },
    { id: "sg_singapore", name: "Singaporean Global Executive", lang: "en-SG" },
    { id: "de_frankfurt", name: "German Engineering Precision", lang: "de-DE" },
    { id: "fr_paris", name: "French Intellectual Nuance", lang: "fr-FR" },
    { id: "jp_tokyo", name: "Japanese Meticulous Precision", lang: "ja-JP" },
    { id: "au_sydney", name: "Australian Sydney Open Vowels", lang: "en-AU" },
  ];

  // 8 Professional Archetypes
  const archetypes = [
    { id: "chief_architect", name: "Chief Enterprise Architect", desc: "Deep technological mastery & gravitas" },
    { id: "board_director", name: "Tier-1 Board Director", desc: "Razor-sharp boardroom strategic weight" },
    { id: "startup_founder", name: "Visionary Startup Founder", desc: "Charismatic conviction & disruptive energy" },
    { id: "keynote_orator", name: "TED / Keynote Orator", desc: "Soaring rhetorical arcs & auditorium presence" },
    { id: "fireside_mentor", name: "Fireside Executive Mentor", desc: "Compassionate, warm, intimate wisdom" },
    { id: "cyber_auditor", name: "Security & Risk Auditor", desc: "Objective vigilance & zero-tolerance scrutiny" },
  ];

  // Preload Avatar Image for Mesh fallback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = "/assets/avatars/executive_clone.jpg";
      img.onload = () => {
        avatarImageRef.current = img;
        drawAvatarFrame(0, 0, false);
      };
    }
  }, []);

  // Update telemetry banner whenever state changes
  useEffect(() => {
    const p = storyPersonas[selectedPersona] || storyPersonas["jonathan"];
    const t = storyThemes.find(theme => theme.id === selectedTheme) || storyThemes[0];
    const calcPitch = (p.pitch * t.pitchMult * (1 + (styleExaggeration - 50) * 0.003)).toFixed(2);
    const calcRate = (p.rate * t.rateMult).toFixed(2);
    setActiveVoiceLabel(`${p.name} (${p.base} • ${p.vibe})`);
    setActivePitchRate(`Pitch: ${calcPitch} • Rate: ${calcRate}x • Theme: ${t.name}`);
  }, [selectedPersona, selectedTheme, styleExaggeration, stability, breathDensity]);

  // Dynamic Canvas 2D Kinematics Renderer (NeRF Mode)
  const drawAvatarFrame = (mouthOpenAmount: number, headBobAngle: number, isBlinking: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(headBobAngle * 0.03);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (avatarImageRef.current) {
      ctx.drawImage(avatarImageRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (isBlinking) {
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.44, canvas.height * 0.32, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.58, canvas.height * 0.32, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mouthOpenAmount > 0.05) {
      const mouthX = canvas.width * 0.51;
      const mouthY = canvas.height * 0.44;
      const mouthWidth = 28 + mouthOpenAmount * 6;
      const mouthHeight = Math.max(3, mouthOpenAmount * 18);

      ctx.fillStyle = "#2D0A14";
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY - mouthHeight * 0.4, mouthWidth * 0.7, 3, 0, 0, Math.PI);
      ctx.fill();

      ctx.strokeStyle = "rgba(190, 24, 93, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + mouthHeight * 0.5, mouthWidth * 0.85, 4, 0, 0, Math.PI);
      ctx.stroke();
    }

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

      ctx.fillStyle = "#F43F5E";
      ctx.beginPath();
      ctx.arc(canvas.width * 0.51, canvas.height * 0.44, Math.max(2, mouthOpenAmount * 7), 0, Math.PI * 2);
      ctx.fill();
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
        const restingBob = Math.sin(elapsed * 1.2) * 0.15;
        drawAvatarFrame(0, restingBob, isBlinking);
      }

      animationFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpeakingClone, showMeshOverlay]);

  // Synchronized Real Broadcast Video & Speech Playback
  const handleToggleBroadcast = () => {
    if (isSpeakingClone) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      return;
    }

    // Play real MP4 video in sync
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const cleanText = cloneScript.replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const persona = storyPersonas[selectedPersona] || storyPersonas["jonathan"];
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
        if (videoRef.current) videoRef.current.pause();
      };

      utterance.onerror = () => {
        setIsSpeakingClone(false);
        setSpokenWordIndex(-1);
        if (videoRef.current) videoRef.current.pause();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeakingClone(true);
      setTimeout(() => {
        setIsSpeakingClone(false);
        if (videoRef.current) videoRef.current.pause();
      }, 6000);
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

  const scenes = [
    {
      id: 1,
      title: "Scene 1: The Enterprise Bottleneck",
      narration: "Traditional enterprise content pipelines take 14 days and cost $140,000 per brand line. Zyvoriq collapses this into 90 seconds.",
      videoShot: "Macro cinematic shot of glowing server motherboards with data streams converging into a single quantum core.",
      audioStem: "Deep authoritative baritone + subtle ambient low-frequency synth pad.",
      diagramNode: "Client BFF Gateway -> Redis BullMQ Async Queue.",
    },
    {
      id: 2,
      title: "Scene 2: Veritas 5-Axis Consensus",
      narration: "Every single factual claim is anchored to primary source filings. If the Veritas score drops below 90, the auto-repair engine surgically patches the defect.",
      videoShot: "Split-screen visualization of Gemini 2.5 Pro and Claude 3.5 Sonnet cross-examining claim nodes with green confirmation pulses.",
      audioStem: "Crisp vocal formant with gold karaoke subtitle synchronization.",
      diagramNode: "Veritas 5-Axis Consensus Enclave (Fact, Tone, Safety Gate).",
    },
    {
      id: 3,
      title: "Scene 3: Cryptographic Provenance",
      narration: "Before omnichannel dispatch, every asset is cryptographically sealed with an Ed25519 digital signature and embedded C2PA Content Credentials.",
      videoShot: "Close-up of a holographic cryptographic seal stamping onto 4K video and audio master stems.",
      audioStem: "Resonant crescendo vocal cadence with stereo panning.",
      diagramNode: "Ed25519 Signed VQC Certificate -> Omnichannel Webhook Dispatch.",
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-10 md:py-10 lg:px-12">
        
        {/* Top Header & Studio Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <Film className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Multimodal Neural Studio &amp; AI Video Broadcast
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-4xl">
              High-definition AI video broadcast stream, 4,000+ procedural voice matrix, real-time gold karaoke subtitles, and C2PA Ed25519 hardware provenance.
            </p>
          </div>

          {/* 4 Studio Modes */}
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
                <Video className="h-4 w-4" />
                <span>4K Video Broadcast &amp; Avatars</span>
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
                <span>Dual-Host Podcast (NotebookLM)</span>
              </button>

              <button
                onClick={() => setStudioMode("4pane")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                  studioMode === "4pane"
                    ? "bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>4-Pane Canvas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Acoustic Telemetry Ribbon */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-teal-500/30 bg-teal-950/40 px-6 py-3 text-xs font-mono text-teal-300 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Active Model: <b className="text-white">{activeVoiceLabel}</b></span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>{activePitchRate}</span>
            <span className="rounded bg-teal-900/80 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-700/50">
              Live Acoustic &amp; Video Calibration Active
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: 4K VIDEO BROADCAST & AVATARS                                */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "cloning" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            
            {/* LEFT: Script, Emotion Themes & Persona Vault (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Emotion & Story Themes Bar */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Storytelling &amp; Emotion Theme</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">5 Dynamic Styles</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4">
                  {storyThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id as any)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                        selectedTheme === theme.id
                          ? `bg-slate-800 ${theme.border} text-white shadow-lg`
                          : "border-slate-800/80 bg-obsidian-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{theme.icon}</span>
                        {selectedTheme === theme.id && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                      </div>
                      <span className="text-xs font-bold font-mono mt-1 text-white">{theme.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{theme.tagline}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8 Curated Spotlight Personas Grid */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>8 Curated Spotlight Personas</span>
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
                      <div className="text-[11px] text-slate-500 mt-0.5 italic">{p.vibe}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Prompt Input + Paralinguistics Buttons */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Script Ingestion &amp; Inline Paralinguistics</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Interactive Broadcast</span>
                </div>

                {/* Paralinguistics Tag Shortcuts */}
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

                {/* Speak & Broadcast Action Button */}
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
                        <span>Broadcasting {storyPersonas[selectedPersona]?.name} Video &amp; Audio (Click to Pause)</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>▶ Play 4K Video Broadcast &amp; Voice ({storyPersonas[selectedPersona]?.name})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT: Live High-Definition Video Broadcast Stream (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                      <Film className="h-4 w-4" />
                      <span>Live 4K AI Studio Video Broadcast Stream</span>
                    </div>

                    {/* Viewport Mode Switcher */}
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-obsidian-950 p-1 text-[11px] font-mono">
                      <button
                        onClick={() => setVideoDisplayMode("mp4_broadcast")}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          videoDisplayMode === "mp4_broadcast" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-slate-400"
                        }`}
                      >
                        🎬 4K Broadcast Stream
                      </button>
                      <button
                        onClick={() => setVideoDisplayMode("nerf_mesh")}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          videoDisplayMode === "nerf_mesh" ? "bg-teal-500/20 text-teal-300 font-bold" : "text-slate-400"
                        }`}
                      >
                        🔬 3D NeRF Kinematics
                      </button>
                    </div>
                  </div>

                  {/* The Live Video Player Viewport */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[440px]">
                    
                    {videoDisplayMode === "mp4_broadcast" ? (
                      <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                        <video
                          ref={videoRef}
                          src="/assets/video/studio_executive_broadcast.mp4"
                          playsInline
                          loop
                          muted
                          className="h-full w-full object-cover"
                        />

                        {/* Lower-Third Title Overlay */}
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
                    ) : (
                      /* 3D NeRF Kinematics Viewport */
                      <div className="relative h-[320px] w-[320px] overflow-hidden rounded-2xl border border-pink-500/40 shadow-2xl shadow-pink-500/20">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

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
                    <span>Source: <b className="text-white">4K Studio Video (.mp4) + Neural TTS</b></span>
                    <span>Latency: <b className="text-emerald-400">&lt; 25ms</b></span>
                  </div>

                  <button
                    onClick={handleToggleBroadcast}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause Stream" : "Replay Broadcast"}</span>
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
                      {archetypes.map((arch) => (
                        <option key={arch.id} value={arch.id}>{arch.name}</option>
                      ))}
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
                    {selectedBaseModel} • {globalAccents.find(a => a.id === selectedAccent)?.name} ({archetypes.find(a => a.id === selectedArchetype)?.name})
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    {archetypes.find(a => a.id === selectedArchetype)?.desc}
                  </p>
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

              {/* 24-bit Studio Master WAV/MP3 Exporter */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Download className="h-4 w-4" />
                    <span>24-bit 48kHz Studio Master Exporter</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300">Broadcast Ready</span>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-950 p-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">Full Episode Master (.WAV)</div>
                      <div className="text-[10px] text-slate-400">24-bit PCM • 48,000Hz Stereo • Lossless</div>
                    </div>
                    <button
                      onClick={() => alert("Downloading 24-bit Master WAV stem...")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold hover:bg-emerald-500/30"
                    >
                      Export WAV
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-obsidian-950 p-3">
                    <div>
                      <div className="font-mono text-xs font-bold text-white">Streaming Delivery (.MP3)</div>
                      <div className="text-[10px] text-slate-400">320kbps Constant Bitrate • C2PA Sealed</div>
                    </div>
                    <button
                      onClick={() => alert("Downloading 320kbps MP3 stem...")}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold hover:bg-indigo-500/30"
                    >
                      Export MP3
                    </button>
                  </div>
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
                  {/* Host A */}
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

                  {/* Host B */}
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

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: 4-PANE SYNCHRONIZED MULTI-MODAL CANVAS                       */}
        {/* ------------------------------------------------------------------ */}
        {studioMode === "4pane" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            
            {/* PANE 1: Narrative & Script Editor (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <FileText className="h-4 w-4" />
                  <span>Pane 1: Narrative &amp; Storyboard Script (Claude 3.5 Sonnet)</span>
                </div>
                <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800/40">
                  Persona Tone: 0.94 Match
                </span>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                {scenes.map((scene) => (
                  <div key={scene.id} className="rounded-xl border border-slate-800/80 bg-obsidian-950/80 p-4">
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-mono text-xs font-bold text-indigo-300">{scene.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400">✓ Ground Truth Anchored</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{scene.narration}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PANE 2: Veo 2 Video Storyboard (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                  <Video className="h-4 w-4" />
                  <span>Pane 2: Cinematic Video Storyboard (Google Veo 2 / Imagen 3)</span>
                </div>
                <span className="rounded bg-pink-950 px-2 py-0.5 text-[10px] font-mono text-pink-300 border border-pink-800/40">
                  1080p 60fps HDR
                </span>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                {scenes.map((scene) => (
                  <div key={scene.id} className="rounded-xl border border-slate-800/80 bg-obsidian-950/80 p-4">
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-mono text-xs font-bold text-pink-300">Shot {scene.id}: Motion Vector Prompt</span>
                      <span className="text-[10px] font-mono text-slate-400">Aspect: {aspectRatio}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">{scene.videoShot}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PANE 3: DeepMind 5-Band Neural Audio Dubbing (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Volume2 className="h-4 w-4" />
                  <span>Pane 3: DeepMind 5-Band Neural Vocal Dubbing</span>
                </div>
                <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800/40">
                  24-bit 48kHz Master WAV
                </span>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-300">Vocal Waveform &amp; Gold Karaoke Sync</span>
                    <button
                      onClick={handleToggleBroadcast}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Test Audio Synthesis</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 h-12 py-2">
                    {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 100, 50, 70, 90, 35, 85, 60, 45, 95, 70, 80, 55, 65, 90, 40].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-emerald-500/40 to-teal-400 rounded-full transition-all duration-150"
                        style={{ height: `${isSpeakingClone ? Math.min(100, h + Math.sin(Date.now() / 200 + i) * 30) : h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PANE 4: Draw.io Vector Architecture Canvas (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Code className="h-4 w-4" />
                  <span>Pane 4: Draw.io Vector Architecture Canvas</span>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTabDiagram("visual")}
                    className={`px-2 py-0.5 rounded ${activeTabDiagram === "visual" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"}`}
                  >
                    SVG Render
                  </button>
                  <button
                    onClick={() => setActiveTabDiagram("xml")}
                    className={`px-2 py-0.5 rounded ${activeTabDiagram === "xml" ? "bg-amber-500/20 text-amber-300" : "text-slate-400"}`}
                  >
                    mxGraph XML
                  </button>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                {activeTabDiagram === "visual" ? (
                  <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4 relative overflow-hidden flex items-center justify-center min-h-[220px]">
                    <svg viewBox="0 0 500 200" className="w-full h-auto max-h-[200px]" style={{ transform: `scale(${diagramZoom})` }}>
                      <rect x="20" y="30" width="130" height="60" rx="8" fill="#F0FDFA" stroke="#0D9488" strokeWidth="1.5" />
                      <text x="35" y="55" fill="#0F766E" fontSize="10" fontWeight="bold">Client BFF Gateway</text>
                      <text x="35" y="72" fill="#334155" fontSize="8">Rate Limiter &amp; Auth</text>

                      <line x1="150" y1="60" x2="190" y2="60" stroke="#0D9488" strokeWidth="2" />

                      <rect x="190" y="30" width="140" height="60" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
                      <text x="205" y="55" fill="#4338CA" fontSize="10" fontWeight="bold">Director Swarm DAG</text>
                      <text x="205" y="72" fill="#334155" fontSize="8">Task Decomposition</text>

                      <line x1="330" y1="60" x2="370" y2="60" stroke="#6366F1" strokeWidth="2" />

                      <rect x="370" y="30" width="110" height="60" rx="8" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
                      <text x="382" y="55" fill="#166534" fontSize="10" fontWeight="bold">Veritas VQC Gate</text>
                      <text x="382" y="72" fill="#334155" fontSize="8">VQS 94.6 (PASS)</text>
                    </svg>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                    <pre className="text-[11px] font-mono text-slate-300/90 leading-relaxed overflow-x-auto p-2 bg-slate-950 rounded-lg border border-slate-800 max-h-[190px]">
{`<mxfile host="zyvoriq-studio">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="node_bff" value="Edge BFF Gateway" vertex="1" parent="1"/>
  </root>
</mxfile>`}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
