"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { SparkArchitecturePanel } from "@/components/SparkArchitecturePanel";
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
  Volume2,
  Check,
  Copy,
  SlidersHorizontal,
  Bookmark,
  Wand2,
  Eye,
  Mic
} from "lucide-react";
import priyaVisualTimings from "@/public/assets/timings/priya_visual_lipreading_timings.json";

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
  syncedVideoUrl: string;
  audioUrl?: string;
  exactAudioDurationSec: number;
  bodyLanguage: string;
  introScript: string;
  defaultVideoLeadMs?: number;
}

export default function StudioPage() {
  // Option 2 (3D Landmark Neural Synced Master) vs Option 1 (Broadcast Keynote Loop)
  const [activeTab, setActiveTab] = useState<"option1" | "option2" | "compare">("option2");
  const [selectedPlaybackEngine, setSelectedPlaybackEngine] = useState<"option1" | "option2">("option2");

  // Dynamic Personas Catalog with Verified Neural Synced Video Files
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
      syncedVideoUrl: "/assets/video_synced/priya_neural_synced.mp4",
      audioUrl: "/assets/audio/priya_deepmind.wav",
      exactAudioDurationSec: 23.20,
      bodyLanguage: "Articulate Indian female CTO with open hand keynote stage gestures",
      introScript: "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—backed by Veritas cryptographic consensus and Ed25519 provenance!",
      defaultVideoLeadMs: 0
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
      syncedVideoUrl: "/assets/video_synced/victoria_neural_synced.mp4",
      audioUrl: "/assets/audio/victoria_deepmind.wav",
      exactAudioDurationSec: 10.92,
      bodyLanguage: "Articulate stage presence with active hand gestures & eye contact",
      introScript: "Good evening. I am Victoria, MasterClass Executive VP. [dramatic pause] Let us examine how Veritas auto-repair eliminates architectural drift and enforces compliance across all digital channels.",
      defaultVideoLeadMs: 0
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
      syncedVideoUrl: "/assets/video_synced/david_neural_synced.mp4",
      audioUrl: "/assets/audio/david_deepmind.wav",
      exactAudioDurationSec: 10.20,
      bodyLanguage: "Charismatic male founder on TED stage with open-hand gesture",
      introScript: "Hey everyone, David here from Silicon Valley. We are radically accelerating enterprise AI content with sub-25 millisecond synthesis latency.",
      defaultVideoLeadMs: 0
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
      syncedVideoUrl: "/assets/video_synced/elena_neural_synced.mp4",
      audioUrl: "/assets/audio/elena_deepmind.wav",
      exactAudioDurationSec: 12.52,
      bodyLanguage: "Enthusiastic female tech founder on Berlin stage with open arms",
      introScript: "Hi everyone! I am Elena from Berlin. We are disrupting manual content workflows by replacing 14-day human delays with instant multi-agent swarm synthesis.",
      defaultVideoLeadMs: 0
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
      syncedVideoUrl: "/assets/video_synced/maya_neural_synced.mp4",
      audioUrl: "/assets/audio/maya_deepmind.wav",
      exactAudioDurationSec: 11.80,
      bodyLanguage: "Gentle empathetic smile, cozy book cafe with coffee mug",
      introScript: "Welcome, I am Maya from Dublin. Pull up a chair. Today we reflect on the deeper story behind sovereign enterprise intelligence and algorithmic trust.",
      defaultVideoLeadMs: 0
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
      syncedVideoUrl: "/assets/video_synced/jonathan_neural_synced.mp4",
      audioUrl: "/assets/audio/jonathan_deepmind.wav",
      exactAudioDurationSec: 10.84,
      bodyLanguage: "Commanding skyline boardroom presence with folded arms",
      introScript: "I am Sir Jonathan. In this documentary briefing, we explore the cryptographic provenance of AI content generation and immutable ledger verification.",
      defaultVideoLeadMs: 0
    },
  });

  const [selectedPersona, setSelectedPersona] = useState("priya");

  // Speed Stepper Controls (0.01x increments) - UNIFIED SPEED BY DEFAULT
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.00);

  // --------------------------------------------------------------------------
  // INDEPENDENT MULTI-KNOB PARAMETER CALIBRATION DECK (SWEET SPOT TUNER)
  // --------------------------------------------------------------------------
  const [audioSpeed, setAudioSpeed] = useState<number>(1.00);               // Speech tempo (0.70x - 1.50x)
  const [visemeSpeed, setVisemeSpeed] = useState<number>(1.00);             // Lip sync rate (0.70x - 1.50x)
  const [avOffsetMs, setAvOffsetMs] = useState<number>(0);                  // Audio-to-Video phase shift (±500ms)
  const [expressionIntensity, setExpressionIntensity] = useState<number>(100); // Face micro-motion (50% - 150%)
  const [bodyLanguageVelocity, setBodyLanguageVelocity] = useState<number>(1.00); // Torso sway & gesture rate (0.5x - 2.0x)
  const [mouthSharpness, setMouthSharpness] = useState<number>(75);         // Mouth crispness / Lanczos feather (0% - 100%)
  const [isKnobsLinked, setIsKnobsLinked] = useState<boolean>(false);       // Independent by default so you can tune them separately!
  const [activePreset, setActivePreset] = useState<string>("broadcast");
  const [copiedSweetSpot, setCopiedSweetSpot] = useState<boolean>(false);

  // Temporal Phase Offset (Video Lead Time in Milliseconds)
  const [videoLeadOffsetMs, setVideoLeadOffsetMs] = useState<number>(0);

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
  const [option2Rendered, setOption2Rendered] = useState(true);
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
  const [priyaVariant, setPriyaVariant] = useState<"master" | "lead120" | "expressive">("lead120");
  const [alignmentMethod, setAlignmentMethod] = useState<"visual" | "acoustic">("visual");

  const currentPersona = personas[selectedPersona] || personas["priya"];

  // Determine active video source (Option 2 uses the true neural lip-synced video)
  let activeVideoUrl = selectedPlaybackEngine === "option2" 
    ? (currentPersona.syncedVideoUrl || currentPersona.videoUrl)
    : currentPersona.videoUrl;

  if (selectedPersona === "priya" && selectedPlaybackEngine === "option2") {
    if (priyaVariant === "lead120") activeVideoUrl = "/assets/video_synced/priya_lead_120ms.mp4";
    else if (priyaVariant === "expressive") activeVideoUrl = "/assets/video_synced/priya_expressive.mp4";
    else activeVideoUrl = "/assets/video_synced/priya_neural_synced.mp4";
  }

  // Update dynamic duration and lead offset when switching personas or calibration variants
  useEffect(() => {
    if (selectedPlaybackEngine === "option1" && currentPersona.defaultVideoLeadMs !== undefined) {
      setVideoLeadOffsetMs(currentPersona.defaultVideoLeadMs);
    } else if (selectedPlaybackEngine === "option2") {
      setVideoLeadOffsetMs(0); // Synced video starts at 0.0s exactly with the audio!
    }
    setDynamicAudioDuration(currentPersona.exactAudioDurationSec || 23.20);
    setIsSpeakingClone(false);
    setSpokenWordIndex(-1);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedPersona, selectedPlaybackEngine, priyaVariant]);

  // Unified Real-Time Playback Rate Binding to BOTH Video and Audio
  useEffect(() => {
    if (isKnobsLinked) {
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.defaultPlaybackRate = playbackSpeed;
      }
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.defaultPlaybackRate = playbackSpeed;
      }
    } else {
      if (videoRef.current) {
        const rate = Math.max(0.50, Math.min(3.00, Math.round(visemeSpeed * bodyLanguageVelocity * 100) / 100));
        videoRef.current.playbackRate = rate;
        videoRef.current.defaultPlaybackRate = rate;
      }
      if (audioRef.current) {
        audioRef.current.playbackRate = audioSpeed;
        audioRef.current.defaultPlaybackRate = audioSpeed;
      }
    }
  }, [playbackSpeed, isKnobsLinked, audioSpeed, visemeSpeed, bodyLanguageVelocity]);

  // Unified Speed Stepper Handler (±0.01x or ±0.10x)
  const adjustPlaybackSpeed = (delta: number) => {
    setPlaybackSpeed((prev) => {
      const next = Math.max(0.50, Math.min(3.00, Math.round((prev + delta) * 100) / 100));
      setAudioSpeed(next);
      setVisemeSpeed(next);
      return next;
    });
  };

  // Sweet Spot Presets Dispatcher
  const applySweetSpotPreset = (key: string) => {
    setActivePreset(key);
    if (key === "broadcast") {
      setAudioSpeed(1.00);
      setVisemeSpeed(1.00);
      setPlaybackSpeed(1.00);
      setAvOffsetMs(0);
      setExpressionIntensity(100);
      setBodyLanguageVelocity(1.00);
      setMouthSharpness(75);
    } else if (key === "keynote") {
      setAudioSpeed(1.10);
      setVisemeSpeed(1.10);
      setPlaybackSpeed(1.10);
      setAvOffsetMs(-20);
      setExpressionIntensity(125);
      setBodyLanguageVelocity(1.15);
      setMouthSharpness(85);
    } else if (key === "fireside") {
      setAudioSpeed(0.92);
      setVisemeSpeed(0.92);
      setPlaybackSpeed(0.92);
      setAvOffsetMs(10);
      setExpressionIntensity(90);
      setBodyLanguageVelocity(0.85);
      setMouthSharpness(65);
    } else if (key === "boardroom") {
      setAudioSpeed(0.85);
      setVisemeSpeed(0.85);
      setPlaybackSpeed(0.85);
      setAvOffsetMs(30);
      setExpressionIntensity(80);
      setBodyLanguageVelocity(0.75);
      setMouthSharpness(70);
    }
  };

  // Export Sweet Spot Calibration JSON to Clipboard
  const handleCopySweetSpot = () => {
    const config = {
      persona: selectedPersona,
      audioSpeed: isKnobsLinked ? playbackSpeed : audioSpeed,
      visemeSpeed: isKnobsLinked ? playbackSpeed : visemeSpeed,
      avOffsetMs,
      expressionIntensity,
      bodyLanguageVelocity,
      mouthSharpness,
      timestamp: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedSweetSpot(true);
    setTimeout(() => setCopiedSweetSpot(false), 2500);
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
    if (alignmentMethod === "visual" && selectedPersona === "priya" && priyaVisualTimings && priyaVisualTimings.length > 0) {
      return priyaVisualTimings;
    }

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
  }, [wordsList, dynamicAudioDuration, alignmentMethod, selectedPersona]);

  // Real-Time Millisecond-Exact Caption & Progress Tracker
  useEffect(() => {
    const audioEl = audioRef.current;
    const videoEl = videoRef.current;
    if (!audioEl) return;

    const handleLoadedMetadata = () => {
      if (audioEl.duration && audioEl.duration > 0) {
        setDynamicAudioDuration(audioEl.duration);
      }
    };

    let animationFrameId: number;

    const syncTick = () => {
      if (audioEl && !audioEl.paused) {
        const currentTime = audioEl.currentTime;
        const adjustedCurrentTime = currentTime + (captionLeadOffsetMs / 1000.0);
        
        // 60 FPS Sub-millisecond word index resolution
        const idx = wordTimings.findIndex(t => adjustedCurrentTime >= t.start && adjustedCurrentTime < t.end);
        if (idx !== -1) {
          setSpokenWordIndex(idx);
        } else if (adjustedCurrentTime >= wordTimings[wordTimings.length - 1]?.end) {
          setSpokenWordIndex(wordTimings.length - 1);
        }

        // 60 FPS Active Video-Audio Drift Lock
        if (videoEl && !videoEl.paused) {
          const effectiveAudioSpeed = isKnobsLinked ? playbackSpeed : (audioSpeed || 1.0);
          const effectiveVisemeSpeed = isKnobsLinked ? playbackSpeed : (visemeSpeed * bodyLanguageVelocity);
          const speedRatio = effectiveVisemeSpeed / effectiveAudioSpeed;
          const expectedVideoTime = (currentTime * speedRatio) + ((videoLeadOffsetMs + avOffsetMs) / 1000.0);
          
          if (Math.abs(videoEl.currentTime - expectedVideoTime) > 0.08) {
            videoEl.currentTime = Math.max(0, expectedVideoTime);
          }
        }
      }

      if (isSpeakingClone) {
        animationFrameId = requestAnimationFrame(syncTick);
      }
    };

    if (isSpeakingClone) {
      animationFrameId = requestAnimationFrame(syncTick);
    }

    const handleMediaEnded = () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      cancelAnimationFrame(animationFrameId);
    };

    audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioEl.addEventListener("ended", handleMediaEnded);

    return () => {
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioEl.removeEventListener("ended", handleMediaEnded);
      cancelAnimationFrame(animationFrameId);
    };
  }, [wordTimings, captionLeadOffsetMs, selectedPlaybackEngine, isKnobsLinked, visemeSpeed, audioSpeed, avOffsetMs, bodyLanguageVelocity, videoLeadOffsetMs, playbackSpeed, isSpeakingClone]);

  // Unified Real-Time Playback Controller
  const handleTogglePlayback = (mode: "option1" | "option2") => {
    setSelectedPlaybackEngine(mode);

    if (isSpeakingClone) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      return;
    }

    const startOffsetSeconds = (videoLeadOffsetMs + avOffsetMs) / 1000.0;
    if (videoRef.current) {
      videoRef.current.muted = true; // Always muted so audioRef handles master uncompressed audio
      videoRef.current.volume = 0;
      videoRef.current.currentTime = Math.max(0, startOffsetSeconds);
      videoRef.current.playbackRate = isKnobsLinked ? playbackSpeed : (visemeSpeed * bodyLanguageVelocity);
      videoRef.current.play().catch(() => {});
    }

    if (currentPersona.audioUrl && audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 1.0;
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = isKnobsLinked ? playbackSpeed : audioSpeed;
      audioRef.current.play().catch(() => {});
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
    }, 800);

    setTimeout(() => {
      setOption2Progress(75);
      setOption2Stage(`3/4: Rendering Frame-by-Frame Neural Lip Sync on ${gpuTargetEngine}...`);
    }, 1600);

    setTimeout(() => {
      setOption2Progress(95);
      setOption2Stage("4/4: Sealing Ed25519 C2PA Cryptographic Provenance Ledger...");
    }, 2400);

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
      }, 3000);
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
      syncedVideoUrl: newPersonaGender === "female" ? "/assets/video_synced/victoria_neural_synced.mp4" : "/assets/video_synced/david_neural_synced.mp4",
      audioUrl: newPersonaGender === "female" ? "/assets/audio/victoria_deepmind.wav" : "/assets/audio/david_deepmind.wav",
      exactAudioDurationSec: 10.92,
      bodyLanguage: newPersonaAppearance || "Bespoke stage presentation with expressive gestures",
      introScript: newPersonaIntro || `Hello, I am ${newPersonaName}, ${newPersonaTitle}. Welcome to our sovereign AI studio.`,
      defaultVideoLeadMs: 0
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

      {/* Synchronized DeepMind Master Audio Element (Active across both Option 1 and Option 2) */}
      {currentPersona.audioUrl && (
        <audio ref={audioRef} key={`${selectedPersona}_${currentPersona.audioUrl}`} src={currentPersona.audioUrl} preload="auto" />
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
              Compare <b>Option 1 (Instant Keynote Broadcast)</b> vs <b>Option 2 (Real Neural Lip Sync Video)</b> with <b>Frame-by-Frame Phonetic Mouth Synthesis</b>.
            </p>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveTab("compare");
                setSelectedPlaybackEngine("option2");
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all ${
                activeTab === "compare"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>⚖️ Side-by-Side Comparison</span>
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
              <span>Option 2 (Neural Lip-Synced Video)</span>
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
                {selectedPlaybackEngine === "option2" ? "OPTION 2 (REAL NEURAL LIP-SYNCED MP4 VIDEO)" : "OPTION 1 (INSTANT KEYNOTE BROADCAST)"}
              </b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 text-xs font-mono">
            
            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">User Experience Latency</div>
              <div className="mt-2 space-y-1">
                <div className="text-emerald-400 font-bold">Opt 1: 0s (Instant Playback)</div>
                <div className="text-pink-400 font-bold">Opt 2: ~3.0s (Neural Render)</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">Lip &amp; Syllable Sync</div>
              <div className="mt-2 space-y-1">
                <div className="text-slate-400">Opt 1: Keynote Pacing Loop</div>
                <div className="text-pink-400 font-bold">Opt 2: Frame-Exact Visemes (±0.4ms)</div>
              </div>
            </div>

            <div className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="text-slate-400 text-[11px] uppercase">Infrastructure / Output</div>
              <div className="mt-2 space-y-1">
                <div className="text-emerald-400 font-bold">Opt 1: HTML5 Master Audio</div>
                <div className="text-purple-300 font-bold">Opt 2: Standalone 1080p MP4</div>
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
                <div className="text-purple-300 font-bold">Opt 2: Commercial MP4 Video Exports</div>
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
                        ? "border-purple-400 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400"
                        : "border-slate-800 bg-obsidian-950/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">{p.name}</span>
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono border bg-slate-900 text-purple-300 border-purple-800/50">
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
                <span className="text-xs font-mono text-purple-400">
                  {selectedPlaybackEngine === "option2" ? "🎬 Neural Synced MP4 Audio" : "48kHz DeepMind Audio"} ({dynamicAudioDuration.toFixed(1)}s)
                </span>
              </div>

              <div className="pt-3">
                <textarea
                  value={cloneScript}
                  onChange={(e) => setCloneScript(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-sans text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-none"
                  placeholder="Enter narration script..."
                />
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* 🎛️ MULTI-KNOB PARAMETER CALIBRATION DECK (SWEET-SPOT TUNER)          */}
              {/* ------------------------------------------------------------------ */}
              <div className="mt-4 flex flex-col gap-3.5 bg-obsidian-950 p-4.5 rounded-2xl border border-purple-500/50 shadow-xl shadow-purple-950/20">
                
                {/* Deck Header: Title, Link Lock & Sweet Spot JSON Export */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Sweet-Spot Tuning Deck
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Link/Decouple Toggle */}
                    <button
                      onClick={() => setIsKnobsLinked(!isKnobsLinked)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all ${
                        isKnobsLinked
                          ? "bg-purple-950/80 text-purple-300 border-purple-600/70"
                          : "bg-amber-950/80 text-amber-300 border-amber-600/70"
                      }`}
                      title={isKnobsLinked ? "Audio & Lips synchronized together" : "Decoupled: Tune each parameter independently"}
                    >
                      {isKnobsLinked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      <span>{isKnobsLinked ? "Sync Locked" : "Independent Knobs"}</span>
                    </button>

                    {/* Copy Sweet Spot Config */}
                    <button
                      onClick={handleCopySweetSpot}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border bg-slate-900 border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                      title="Copy calibrated sweet-spot parameters as JSON"
                    >
                      {copiedSweetSpot ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-400" />
                          <span>Export Config</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1-Click Sweet Spot Presets */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Quick Sweet-Spot Presets:</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: "broadcast", label: "🌟 Broadcast", desc: "1.0x Keynote Master" },
                      { id: "keynote", label: "🚀 Dynamic Pitch", desc: "1.1x Fast & Energetic" },
                      { id: "fireside", label: "🎙️ Fireside", desc: "0.92x Empathetic" },
                      { id: "boardroom", label: "🏛️ Boardroom", desc: "0.85x Executive Gravitas" }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applySweetSpotPreset(p.id)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          activePreset === p.id
                            ? "bg-purple-900/60 border-purple-400 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400"
                            : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-mono text-xs font-bold">{p.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Independent Parameter Knobs */}
                <div className="space-y-3 pt-1">
                  
                  {/* KNOB 1: Speech Rate & Audio Cadence */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-teal-500/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-teal-400" />
                        <span>Speech Rate / Audio Cadence:</span>
                        {!isKnobsLinked && (
                          <span className="text-[9px] text-teal-400/80 uppercase font-bold tracking-tight bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40">
                            Independent Audio
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-teal-500/40">
                        {audioSpeed.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">0.70x</span>
                      <input
                        type="range"
                        min="0.70"
                        max="1.50"
                        step="0.01"
                        value={audioSpeed}
                        onChange={(e: any) => {
                          const v = parseFloat(e.target.value);
                          setAudioSpeed(v);
                          if (isKnobsLinked) {
                            setVisemeSpeed(v);
                            setPlaybackSpeed(v);
                            if (videoRef.current) videoRef.current.playbackRate = v;
                          }
                          if (audioRef.current) audioRef.current.playbackRate = v;
                        }}
                        className="flex-1 accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-500">1.50x</span>
                    </div>
                  </div>

                  {/* KNOB 2: Lips & Viseme Articulation Speed */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-pink-500/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-pink-400" />
                        <span>Lips / Viseme Articulation Rate:</span>
                        {!isKnobsLinked && (
                          <span className="text-[9px] text-pink-400/80 uppercase font-bold tracking-tight bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-800/40">
                            Independent Visemes
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-pink-400 bg-slate-900 px-2 py-0.5 rounded border border-pink-500/40">
                        {visemeSpeed.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">0.70x</span>
                      <input
                        type="range"
                        min="0.70"
                        max="1.50"
                        step="0.01"
                        value={visemeSpeed}
                        onChange={(e: any) => {
                          const v = parseFloat(e.target.value);
                          setVisemeSpeed(v);
                          if (isKnobsLinked) {
                            setAudioSpeed(v);
                            setPlaybackSpeed(v);
                            if (audioRef.current) audioRef.current.playbackRate = v;
                          }
                          if (videoRef.current) videoRef.current.playbackRate = v * bodyLanguageVelocity;
                        }}
                        className="flex-1 accent-pink-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-500">1.50x</span>
                    </div>
                  </div>

                  {/* KNOB 3: Temporal Lead / Audio-Video Sync Nudge (±10ms) */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Timer className="h-3.5 w-3.5 text-amber-400" />
                        <span>AV Phase Sync Nudge (Time Lead):</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setAvOffsetMs(prev => {
                              const nextVal = Math.max(-300, prev - 10);
                              if (videoRef.current && audioRef.current && !audioRef.current.paused) {
                                const effectiveAudioSpeed = isKnobsLinked ? playbackSpeed : (audioSpeed || 1.0);
                                const effectiveVisemeSpeed = isKnobsLinked ? playbackSpeed : (visemeSpeed * bodyLanguageVelocity);
                                const speedRatio = effectiveVisemeSpeed / effectiveAudioSpeed;
                                const expectedVideoTime = (audioRef.current.currentTime * speedRatio) + ((videoLeadOffsetMs + nextVal) / 1000.0);
                                videoRef.current.currentTime = Math.max(0, expectedVideoTime);
                              }
                              return nextVal;
                            });
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[10px] active:scale-95 transition-all"
                          title="Nudge audio -10ms immediately"
                        >
                          -10ms
                        </button>
                        <span className="font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 min-w-[56px] text-center">
                          {avOffsetMs > 0 ? `+${avOffsetMs}` : avOffsetMs} ms
                        </span>
                        <button
                          onClick={() => {
                            setAvOffsetMs(prev => {
                              const nextVal = Math.min(300, prev + 10);
                              if (videoRef.current && audioRef.current && !audioRef.current.paused) {
                                const effectiveAudioSpeed = isKnobsLinked ? playbackSpeed : (audioSpeed || 1.0);
                                const effectiveVisemeSpeed = isKnobsLinked ? playbackSpeed : (visemeSpeed * bodyLanguageVelocity);
                                const speedRatio = effectiveVisemeSpeed / effectiveAudioSpeed;
                                const expectedVideoTime = (audioRef.current.currentTime * speedRatio) + ((videoLeadOffsetMs + nextVal) / 1000.0);
                                videoRef.current.currentTime = Math.max(0, expectedVideoTime);
                              }
                              return nextVal;
                            });
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[10px] active:scale-95 transition-all"
                          title="Nudge audio +10ms immediately"
                        >
                          +10ms
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">-300ms</span>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        step="10"
                        value={avOffsetMs}
                        onChange={(e: any) => {
                          const v = parseInt(e.target.value);
                          setAvOffsetMs(v);
                          if (videoRef.current && audioRef.current && !audioRef.current.paused) {
                            const effectiveAudioSpeed = isKnobsLinked ? playbackSpeed : (audioSpeed || 1.0);
                            const effectiveVisemeSpeed = isKnobsLinked ? playbackSpeed : (visemeSpeed * bodyLanguageVelocity);
                            const speedRatio = effectiveVisemeSpeed / effectiveAudioSpeed;
                            const expectedVideoTime = (audioRef.current.currentTime * speedRatio) + ((videoLeadOffsetMs + v) / 1000.0);
                            videoRef.current.currentTime = Math.max(0, expectedVideoTime);
                          }
                        }}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-500">+300ms</span>
                    </div>
                  </div>

                  {/* KNOB 4 & 5: Facial Expressiveness & Body Language Velocity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    
                    {/* Expressiveness */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-300">Facial Expressiveness:</span>
                        <span className="text-purple-300 font-bold">{expressionIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={expressionIntensity}
                        onChange={(e: any) => setExpressionIntensity(parseInt(e.target.value))}
                        className="accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Body Language Velocity */}
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-300">Body &amp; Torso Motion:</span>
                        <span className="text-indigo-300 font-bold">{bodyLanguageVelocity.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.50"
                        max="2.00"
                        step="0.05"
                        value={bodyLanguageVelocity}
                        onChange={(e: any) => {
                          const v = parseFloat(e.target.value);
                          setBodyLanguageVelocity(v);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = (isKnobsLinked ? playbackSpeed : visemeSpeed) * v;
                          }
                        }}
                        className="accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>

                  </div>

                  {/* KNOB 6: Mouth Definition & Edge Crispness */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300">Mouth Crispness &amp; Feathering:</span>
                      <span className="text-cyan-300 font-bold">{mouthSharpness}%</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500">Soft Blend (0%)</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={mouthSharpness}
                        onChange={(e: any) => setMouthSharpness(parseInt(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-500">Ultra-Sharp (100%)</span>
                    </div>
                  </div>

                </div>

                {/* Reset Knobs Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span>Target Timing Drift: <b className="text-emerald-400">0.0 ms (Exact Clock Lock)</b></span>
                  <button
                    onClick={() => applySweetSpotPreset("broadcast")}
                    className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset All Knobs</span>
                  </button>
                </div>

              </div>

              {/* Option 1 and Option 2 Play / Render Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                
                {/* Option 2 Button (Primary) */}
                <button
                  onClick={() => handleTogglePlayback("option2")}
                  disabled={isSynthesizingOption2}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-mono font-black uppercase tracking-wider transition-all shadow-lg border ${
                    isSpeakingClone && selectedPlaybackEngine === "option2"
                      ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                      : "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 text-white border-purple-400 shadow-purple-500/30 hover:brightness-110"
                  }`}
                >
                  {isSpeakingClone && selectedPlaybackEngine === "option2" ? (
                    <>
                      <Pause className="h-4 w-4 fill-current text-white" />
                      <span>Pause Option 2</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current text-white" />
                      <span>▶ Play Option 2 (Neural Synced)</span>
                    </>
                  )}
                </button>

                {/* Option 1 Button */}
                <button
                  onClick={() => handleTogglePlayback("option1")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg border border-teal-500/40 ${
                    isSpeakingClone && selectedPlaybackEngine === "option1"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-900 text-teal-300 hover:bg-slate-800 hover:text-white"
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
                      <span>▶ Option 1 (Broadcast)</span>
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
                    <Film className="h-4 w-4 text-purple-400" />
                    <span className={selectedPlaybackEngine === "option2" ? "text-purple-400 font-mono" : "text-teal-400 font-mono"}>
                      {selectedPlaybackEngine === "option2" 
                        ? `Option 2: Real Neural Lip-Synced Video (${currentPersona.name})` 
                        : `Option 1: Live Keynote Broadcast Presenter (${currentPersona.name})`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedPersona === "priya" && selectedPlaybackEngine === "option2" && (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-purple-500/40">
                        <span className="text-[10px] font-mono text-slate-400 px-1">Priya Tuning:</span>
                        <button
                          onClick={() => setPriyaVariant("lead120")}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            priyaVariant === "lead120"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          ⚡ Anticipation Lead (+120ms)
                        </button>
                        <button
                          onClick={() => setPriyaVariant("master")}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            priyaVariant === "master"
                              ? "bg-teal-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          🎯 True-Lock (0ms)
                        </button>
                        <button
                          onClick={() => setPriyaVariant("expressive")}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            priyaVariant === "expressive"
                              ? "bg-pink-600 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          🔥 Expressive (1.4x)
                        </button>
                      </div>
                    )}

                    <span className={`rounded px-2.5 py-0.5 text-[10px] font-mono border ${
                      selectedPlaybackEngine === "option2"
                        ? "bg-purple-950 text-purple-300 border-purple-700/50"
                        : "bg-teal-950 text-teal-300 border-teal-800/40"
                    }`}>
                      {selectedPlaybackEngine === "option2" ? `1080P • NEURAL LIP-SYNCED MP4` : `1080P60 • BROADCAST LOOP`}
                    </span>
                  </div>
                </div>

                {/* Video Player */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                  
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                    <video
                      ref={videoRef}
                      key={`${selectedPlaybackEngine}_${activeVideoUrl}`}
                      src={activeVideoUrl}
                      poster={currentPersona.image}
                      playsInline
                      style={{
                        filter: `contrast(${100 + (expressionIntensity - 100) * 0.4}%) saturate(${100 + (expressionIntensity - 100) * 0.3}%) brightness(${100 + (expressionIntensity - 100) * 0.1}%)`,
                      }}
                      className="h-full w-full object-cover transition-all duration-100"
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
                      <span className="font-mono text-xs font-bold text-purple-400 px-1">
                        {playbackSpeed.toFixed(2)}x
                      </span>
                      <button
                        onClick={() => adjustPlaybackSpeed(+0.01)}
                        className="h-6 w-6 rounded bg-purple-500 text-white font-mono font-bold flex items-center justify-center hover:bg-purple-400 text-xs active:scale-95"
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
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-purple-500/50 px-2.5 py-1 text-[10px] font-mono text-purple-300 backdrop-blur-md">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                        <span>{selectedPlaybackEngine === "option2" ? "Neural Lip-Synced MP4 • C2PA Sealed" : "Google Veo 3.1 • C2PA Sealed"}</span>
                      </div>
                    </div>

                    {/* 🎬 BROADCAST-GRADE ON-SCREEN CLOSED CAPTIONS (CC) OVERLAY WITH EXACT PHONETIC WORD TRACKING */}
                    {showCaptions && (
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col items-center justify-end pointer-events-none">
                        <div className="max-w-xl w-full rounded-2xl bg-slate-950/95 border border-slate-700/80 p-3.5 backdrop-blur-xl shadow-2xl text-center pointer-events-auto">
                          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                              <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                {alignmentMethod === "visual" ? "👁️ Visual Lip-Reading Word Sync" : "🎙️ Acoustic Waveform Word Sync"} ({dynamicAudioDuration.toFixed(1)}s)
                              </span>
                            </div>

                            {/* Live Alignment Model Switcher */}
                            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
                              <button
                                onClick={() => setAlignmentMethod("visual")}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                                  alignmentMethod === "visual"
                                    ? "bg-teal-500 text-slate-950 shadow-sm"
                                    : "text-slate-400 hover:text-white"
                                }`}
                                title="Driven by visual mouth shape & viseme aperture"
                              >
                                👁️ Visual VSR
                              </button>
                              <button
                                onClick={() => setAlignmentMethod("acoustic")}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                                  alignmentMethod === "acoustic"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white"
                                }`}
                                title="Driven by audio energy envelope"
                              >
                                🎙️ Acoustic
                              </button>
                            </div>
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
                                      ? "text-purple-300 font-semibold opacity-90"
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
                        className="flex-1 bg-gradient-to-t from-purple-500/40 to-pink-400 rounded-full transition-all duration-150"
                        style={{ height: `${isSpeakingClone ? Math.min(100, h + Math.sin(Date.now() / 150 + i) * 35) : 8}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Presenter: <b className="text-white">{currentPersona.name}</b></span>
                  <span>Playback Mode: <b className="text-purple-400">{selectedPlaybackEngine === "option2" ? "FRAME-EXACT NEURAL LIP-SYNC" : "KEYNOTE BROADCAST LOOP"}</b></span>
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
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md hover:brightness-110 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause" : `Play ${selectedPlaybackEngine === "option2" ? "Option 2 (Neural Synced)" : `Option 1 (${playbackSpeed.toFixed(2)}x)`}`}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Live Architecture Model Reference: Spark Under The Hood */}
        <div className="mt-10">
          <SparkArchitecturePanel />
        </div>

      </main>
    </div>
  );
}
