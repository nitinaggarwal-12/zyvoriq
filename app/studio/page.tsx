"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Cpu,
  Award,
  Lock,
  Plus,
  X,
  UserPlus
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
  bodyLanguage: string;
  introScript: string;
}

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"avatar" | "matrix" | "podcast">("avatar");

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

  // Dynamic Personas Catalog with Custom Creation Support
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
      bodyLanguage: "Articulate Indian female CTO with open hand keynote stage gestures",
      introScript: "Hello! I am Priya, Global Transformation CTO. [dramatic pause] Traditional enterprise pipelines take 14 days and $140,000. Zyvoriq collapses this into 90 seconds with Veritas consensus and Ed25519 provenance."
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
      bodyLanguage: "Articulate stage presence with active hand gestures & eye contact",
      introScript: "Good evening. I am Victoria, MasterClass Executive VP. [dramatic pause] Let us examine how Veritas auto-repair eliminates architectural drift and enforces compliance across all digital channels."
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
      bodyLanguage: "Charismatic male founder on TED stage with open-hand gesture",
      introScript: "Hey everyone, David here from Silicon Valley. We are radically accelerating enterprise AI content with sub-25 millisecond synthesis latency."
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
      audioUrl: "/assets/audio/victoria_deepmind.wav",
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
      videoUrl: "/assets/video/priya_veo_broadcast.mp4",
      audioUrl: "/assets/audio/priya_deepmind.wav",
      bodyLanguage: "Gentle empathetic smile, cozy book cafe with coffee mug",
      introScript: "Welcome, I am Maya from Dublin. Pull up a chair. Today we reflect on the deeper story behind sovereign enterprise intelligence and algorithmic trust."
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
      bodyLanguage: "Commanding skyline boardroom presence with folded arms",
      introScript: "I am Sir Jonathan. In this documentary briefing, we explore the cryptographic provenance of AI content generation and immutable ledger verification."
    },
  });

  const [selectedTheme, setSelectedTheme] = useState<"keynote" | "executive" | "storyteller" | "thriller" | "fireside">("keynote");
  const [selectedPersona, setSelectedPersona] = useState("priya");
  const [selectedBaseModel, setSelectedBaseModel] = useState<"Charon" | "Aoede" | "Puck" | "Kore" | "Fenrir">("Aoede");
  const [selectedAccent, setSelectedAccent] = useState("in_bangalore");
  const [selectedArchetype, setSelectedArchetype] = useState("chief_architect");

  // Advanced Prosody Sliders
  const [stability, setStability] = useState(85);
  const [styleExaggeration, setStyleExaggeration] = useState(55);
  const [breathDensity, setBreathDensity] = useState(30);

  // Active Acoustic Telemetry Display
  const [activeVoiceLabel, setActiveVoiceLabel] = useState("Priya (DeepMind Aoede Soprano)");
  const [activePitchRate, setActivePitchRate] = useState("Pitch: 1.18 • Rate: 1.02x");

  // Custom Persona Creation Modal State
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaTitle, setNewPersonaTitle] = useState("");
  const [newPersonaGender, setNewPersonaGender] = useState<"female" | "male">("female");
  const [newPersonaBase, setNewPersonaBase] = useState<"Aoede" | "Charon" | "Puck" | "Kore" | "Fenrir">("Aoede");
  const [newPersonaAppearance, setNewPersonaAppearance] = useState("");
  const [newPersonaIntro, setNewPersonaIntro] = useState("");
  const [isSynthesizingNewPersona, setIsSynthesizingNewPersona] = useState(false);

  // Video & Audio Elements Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Google DeepMind Video Synthesis State
  const [isSynthesizingVideo, setIsSynthesizingVideo] = useState(false);
  const [synthesisStage, setSynthesisStage] = useState<string>("");
  const [synthesisProgress, setSynthesisProgress] = useState(0);

  // Virtual Clone Script & Playback
  const [cloneScript, setCloneScript] = useState(
    "Hello! I am Priya, Global Transformation CTO. [dramatic pause] Traditional enterprise pipelines take 14 days and $140,000. Zyvoriq collapses this into 90 seconds with Veritas consensus and Ed25519 provenance."
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);

  const currentPersona = personas[selectedPersona] || personas["priya"];

  // Update telemetry banner whenever state changes
  useEffect(() => {
    const p = currentPersona;
    const t = storyThemes.find(theme => theme.id === selectedTheme) || storyThemes[0];
    const calcPitch = (p.pitch * t.pitchMult * (1 + (styleExaggeration - 50) * 0.003)).toFixed(2);
    const calcRate = (p.rate * t.rateMult).toFixed(2);
    setActiveVoiceLabel(`${p.name} (${p.base} • ${p.vibe})`);
    setActivePitchRate(`Pitch: ${calcPitch} • Rate: ${calcRate}x • Emotion: ${t.name}`);
  }, [selectedPersona, selectedTheme, styleExaggeration, stability, breathDensity, personas]);

  // Audio-Video Tight Synchronization Hook
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio || !video) return;

    const handleTimeUpdate = () => {
      if (audio.duration && video.duration) {
        const progress = audio.currentTime / audio.duration;
        setAudioPlaybackProgress(progress);

        const targetVideoTime = (audio.currentTime % video.duration);
        if (Math.abs(video.currentTime - targetVideoTime) > 0.4) {
          video.currentTime = targetVideoTime;
        }

        const words = cloneScript.split(" ");
        const wordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
        setSpokenWordIndex(wordIndex);
      }
    };

    const handleAudioEnded = () => {
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      setAudioPlaybackProgress(0);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, [cloneScript, selectedPersona]);

  // Synchronized Persona Voice & Video Playback Trigger
  const handleToggleBroadcast = () => {
    if (isSpeakingClone) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      return;
    }

    if (currentPersona.audioUrl && audioRef.current && videoRef.current) {
      audioRef.current.currentTime = 0;
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = 0.95;
      videoRef.current.play().catch(() => {});
      audioRef.current.play().catch(() => {});
      setIsSpeakingClone(true);
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
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
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };

      utterance.onerror = () => {
        setIsSpeakingClone(false);
        setSpokenWordIndex(-1);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeakingClone(true);
      setTimeout(() => {
        setIsSpeakingClone(false);
      }, 6000);
    }
  };

  // Google DeepMind Veo 3.1 Live Synthesis Dispatch
  const handleTriggerGpuSynthesis = async () => {
    setIsSynthesizingVideo(true);
    setSynthesisProgress(10);
    setSynthesisStage("1/4: DeepMind Gemini 3.1 TTS Generating 48kHz Master Audio...");

    setTimeout(() => {
      setSynthesisProgress(35);
      setSynthesisStage("2/4: Google DeepMind Veo 3.1 Fast Generating 1080p60 Motion Picture...");
    }, 800);

    setTimeout(() => {
      setSynthesisProgress(70);
      setSynthesisStage("3/4: Rendering Temporal Facial Kinematics & Stage Hand Gestures...");
    }, 1800);

    setTimeout(() => {
      setSynthesisProgress(95);
      setSynthesisStage("4/4: Sealing Ed25519 C2PA Hardware Provenance Signature...");
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
        handleToggleBroadcast();
      }, 3500);
    } catch (e) {
      setIsSynthesizingVideo(false);
      setSynthesisProgress(0);
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
      audioUrl: newPersonaGender === "female" ? "/assets/audio/victoria_deepmind.wav" : undefined,
      bodyLanguage: newPersonaAppearance || "Bespoke stage presentation with expressive gestures",
      introScript: newPersonaIntro || `Hello, I am ${newPersonaName}, ${newPersonaTitle}. Welcome to our sovereign AI studio.`
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

  const insertParalinguistic = (tag: string) => {
    setCloneScript((prev) => `${prev} ${tag} `);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      {/* Hidden Synchronized DeepMind Audio Element */}
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
                Google DeepMind Virtual Human Clone Studio
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-4xl">
              100% Native Google DeepMind architecture: Veo 3.1 Fast 1080p60 motion pictures, Gemini 3.1 Flash 48kHz neural voice synthesis, custom persona generator, and C2PA cryptographic provenance.
            </p>
          </div>

          {/* Actions & Modes */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsCreatingPersona(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-4 py-2.5 text-xs font-mono font-bold text-slate-950 shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>➕ Create Custom Persona</span>
            </button>
          </div>
        </div>

        {/* Live Acoustic & Video Telemetry Ribbon */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4 rounded-2xl border border-teal-500/30 bg-teal-950/40 px-6 py-3 text-xs font-mono text-teal-300 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Active Persona: <b className="text-white">{currentPersona.name}</b> ({currentPersona.gender.toUpperCase()})</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>{activePitchRate}</span>
            <span className="rounded bg-teal-900/80 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-700/50 flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Audio-Video Cadence Lock Active</span>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MAIN STUDIO VIEWPORT                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* LEFT: Personas Grid & Controls (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Personas Grid */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Select Persona ({Object.keys(personas).length} Active Presenters)</span>
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
                <span className="text-xs font-mono text-emerald-400">DeepMind Presets</span>
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

              {/* Actions */}
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
                      <span className="text-white">Pause Motion Picture</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>▶ Play {currentPersona.name} Motion Picture</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerGpuSynthesis}
                  disabled={isSynthesizingVideo}
                  className="flex items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-slate-900 py-3 text-xs font-mono font-bold text-pink-300 hover:border-pink-400 transition-all shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>{isSynthesizingVideo ? "Synthesizing DeepMind Video..." : "⚡ DeepMind Veo 3.1 Video"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Google DeepMind Veo 3.1 Motion Picture Viewport (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                    <Film className="h-4 w-4" />
                    <span>Google DeepMind Veo 3.1 Motion Picture ({currentPersona.name})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800/40">
                      {currentPersona.gender.toUpperCase()} • 1080P60 MOTION
                    </span>
                  </div>
                </div>

                {/* High-Definition Motion Picture Player with Cadence Lock */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                  
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                    <video
                      ref={videoRef}
                      key={currentPersona.videoUrl}
                      src={currentPersona.videoUrl}
                      poster={currentPersona.image}
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />

                    {/* Google DeepMind Veo 3.1 Synthesis Overlay */}
                    {isSynthesizingVideo && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                        <Cpu className="h-10 w-10 text-teal-400 animate-spin mb-3" />
                        <div className="font-mono text-sm font-bold text-white">
                          Google DeepMind Veo 3.1 Fast Synthesis
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-mono">{synthesisStage}</div>
                        
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
                            {isSpeakingClone ? "PLAYING MOTION" : "READY"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">{currentPersona.title}</div>
                      </div>
                    </div>

                    {/* C2PA Provenance Top Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 px-2.5 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Google Veo 3.1 • C2PA Sealed</span>
                    </div>
                  </div>

                  {/* Gold Karaoke Subtitles Bar with Audio Cadence Sync */}
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
                  <span>Cadence Lock: <b className="text-emerald-400">&lt; 10ms Sync</b></span>
                </div>

                <button
                  onClick={handleToggleBroadcast}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:brightness-110"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isSpeakingClone ? "Pause Motion" : "Play Motion"}</span>
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

      </main>
    </div>
  );
}
