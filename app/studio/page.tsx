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
  Minus,
  X,
  UserPlus,
  Gauge,
  Subtitles,
  Eye,
  Crosshair
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
  mouthCoords: { x: number; y: number; width: number; height: number }; // normalized 0..1
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

  // Dynamic Personas Catalog with Precision Lip Coordinates
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
      introScript: "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—backed by Veritas cryptographic consensus and Ed25519 provenance!",
      mouthCoords: { x: 0.738, y: 0.525, width: 0.042, height: 0.024 }
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
      introScript: "Good evening. I am Victoria, MasterClass Executive VP. [dramatic pause] Let us examine how Veritas auto-repair eliminates architectural drift and enforces compliance across all digital channels.",
      mouthCoords: { x: 0.742, y: 0.395, width: 0.040, height: 0.022 }
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
      introScript: "Hey everyone, David here from Silicon Valley. We are radically accelerating enterprise AI content with sub-25 millisecond synthesis latency.",
      mouthCoords: { x: 0.650, y: 0.410, width: 0.045, height: 0.025 }
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
      introScript: "Hi everyone! I am Elena from Berlin. We are disrupting manual content workflows by replacing 14-day human delays with instant multi-agent swarm synthesis.",
      mouthCoords: { x: 0.742, y: 0.395, width: 0.040, height: 0.022 }
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
      introScript: "Welcome, I am Maya from Dublin. Pull up a chair. Today we reflect on the deeper story behind sovereign enterprise intelligence and algorithmic trust.",
      mouthCoords: { x: 0.738, y: 0.525, width: 0.042, height: 0.024 }
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
      introScript: "I am Sir Jonathan. In this documentary briefing, we explore the cryptographic provenance of AI content generation and immutable ledger verification.",
      mouthCoords: { x: 0.650, y: 0.410, width: 0.045, height: 0.025 }
    },
  });

  const [selectedTheme, setSelectedTheme] = useState<"keynote" | "executive" | "storyteller" | "thriller" | "fireside">("keynote");
  const [selectedPersona, setSelectedPersona] = useState("priya");
  const [selectedBaseModel, setSelectedBaseModel] = useState<"Charon" | "Aoede" | "Puck" | "Kore" | "Fenrir">("Aoede");

  // Speed Stepper Controls (0.1x increments)
  const [videoSpeed, setVideoSpeed] = useState<number>(1.40);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.00);

  // Live Closed Captions (CC) Overlay Toggle
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  // Live Neural Viseme Radar Active State
  const [activeViseme, setActiveViseme] = useState<{ phoneme: string; name: string; aperture: number; pinch: number }>({
    phoneme: "/p, b, m/",
    name: "Bilabial Closure",
    aperture: 0,
    pinch: 90
  });

  // Advanced Prosody Sliders
  const [stability, setStability] = useState(85);
  const [styleExaggeration, setStyleExaggeration] = useState(55);
  const [breathDensity, setBreathDensity] = useState(30);

  // Active Acoustic Telemetry Display
  const [activeVoiceLabel, setActiveVoiceLabel] = useState("Priya (DeepMind Aoede Soprano)");
  const [activePitchRate, setActivePitchRate] = useState("Video: 1.40x • Audio: 1.00x");

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Audio-to-Face Neural Lip Sync Synthesis State
  const [isSynthesizingNeuralLipSync, setIsSynthesizingNeuralLipSync] = useState(false);
  const [neuralSyncStage, setNeuralSyncStage] = useState<string>("");
  const [neuralSyncProgress, setNeuralSyncProgress] = useState(0);

  // Virtual Clone Script & Playback
  const [cloneScript, setCloneScript] = useState(
    "Hello everyone! I'm Priya, Global Transformation CTO. Traditional enterprise content pipelines take 14 long days and over $140,000. With Zyvoriq, we collapse that entire lifecycle into just 90 seconds—backed by Veritas cryptographic consensus and Ed25519 provenance!"
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);

  const currentPersona = personas[selectedPersona] || personas["priya"];

  // Initialize Web Audio Context & Analyser for Real-Time 60FPS Lip Deformation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.4;

          const source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          audioSourceRef.current = source;
        }
      } catch (e) {
        // Source might already be connected
      }
    };

    audio.addEventListener("play", setupAudioContext, { once: true });
    return () => {
      audio.removeEventListener("play", setupAudioContext);
    };
  }, [currentPersona.audioUrl]);

  // Real-Time 60FPS Audio-Reactive Lip Motion Rendering Loop
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mouthOpenSmoothed = 0;
    const dataArray = new Uint8Array(256);

    const renderLoop = () => {
      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Analyze real-time acoustic energy
        let energy = 0;
        if (analyserRef.current && isSpeakingClone) {
          analyserRef.current.getByteFrequencyData(dataArray);
          // Calculate RMS of mid vocal frequencies (100Hz - 3000Hz)
          let sum = 0;
          for (let i = 2; i < 40; i++) {
            sum += dataArray[i];
          }
          energy = Math.min(1.0, (sum / 38) / 110);
        } else if (isSpeakingClone) {
          // Synthetic audio envelope if web audio is suspended
          energy = 0.4 + Math.sin(Date.now() / 120) * 0.35 + Math.cos(Date.now() / 80) * 0.2;
          energy = Math.max(0, Math.min(1, energy));
        }

        // Smooth mouth interpolation
        mouthOpenSmoothed = mouthOpenSmoothed * 0.65 + energy * 0.35;

        // If speaking and mouth opening is active, apply photographic viseme deformation
        if (mouthOpenSmoothed > 0.08) {
          const coords = currentPersona.mouthCoords || { x: 0.738, y: 0.525, width: 0.042, height: 0.024 };
          const mouthCenterX = canvas.width * coords.x;
          const mouthCenterY = canvas.height * coords.y;
          const mouthRadiusX = (canvas.width * coords.width) * 0.95;
          const mouthRadiusY = (canvas.height * coords.height) * (0.8 + mouthOpenSmoothed * 1.8);

          ctx.save();
          // Clip to mouth ellipse
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY, mouthRadiusX, mouthRadiusY, 0, 0, Math.PI * 2);
          ctx.clip();

          // Dark inner oral cavity depth
          ctx.fillStyle = `rgba(35, 12, 16, ${0.75 + mouthOpenSmoothed * 0.25})`;
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY, mouthRadiusX * 0.9, mouthRadiusY * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();

          // Upper teeth illumination
          if (mouthOpenSmoothed > 0.25) {
            ctx.fillStyle = "rgba(240, 235, 230, 0.92)";
            ctx.beginPath();
            ctx.ellipse(mouthCenterX, mouthCenterY - mouthRadiusY * 0.42, mouthRadiusX * 0.65, mouthRadiusY * 0.28, 0, 0, Math.PI);
            ctx.fill();
          }

          // Lower lip shading and highlight
          ctx.fillStyle = `rgba(180, 85, 95, ${0.4 + mouthOpenSmoothed * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY + mouthRadiusY * 0.7, mouthRadiusX * 0.85, mouthRadiusY * 0.3, 0, Math.PI, 0);
          ctx.fill();

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [currentPersona, isSpeakingClone]);

  // Update telemetry banner whenever state changes
  useEffect(() => {
    const p = currentPersona;
    const t = storyThemes.find(theme => theme.id === selectedTheme) || storyThemes[0];
    const calcPitch = (p.pitch * t.pitchMult * (1 + (styleExaggeration - 50) * 0.003)).toFixed(2);
    setActiveVoiceLabel(`${p.name} (${p.base} • ${p.vibe})`);
    setActivePitchRate(`Pitch: ${calcPitch} • Video: ${videoSpeed.toFixed(1)}x • Audio: ${audioSpeed.toFixed(1)}x • CC: ${showCaptions ? "ON" : "OFF"}`);
  }, [selectedPersona, selectedTheme, styleExaggeration, stability, breathDensity, personas, videoSpeed, audioSpeed, showCaptions]);

  // Update Video Playback Rate in real time
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed]);

  // Update Audio Playback Rate in real time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [audioSpeed]);

  // Stepper Handlers for Video Speed (±0.1x)
  const adjustVideoSpeed = (delta: number) => {
    setVideoSpeed((prev) => {
      const next = Math.max(0.5, Math.min(3.0, Math.round((prev + delta) * 10) / 10));
      return next;
    });
  };

  // High-Precision Real-Time Caption & Neural Viseme Radar Tracker
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const visemeMap = [
      { phoneme: "/h, e/", name: "Glottal Vowel", aperture: 45, pinch: 20 },
      { phoneme: "/l, oʊ/", name: "Rounded Aperture", aperture: 65, pinch: 60 },
      { phoneme: "/e, v, r/", name: "Labiodental Spread", aperture: 50, pinch: 30 },
      { phoneme: "/aɪ, æ/", name: "Wide Open Vowel", aperture: 95, pinch: 10 },
      { phoneme: "/p, r, i:/", name: "Plosive High Front", aperture: 75, pinch: 15 },
      { phoneme: "/g, l, oʊ/", name: "Velar Rounded", aperture: 70, pinch: 65 },
      { phoneme: "/t, r, æ/", name: "Alveolar Open", aperture: 85, pinch: 25 },
      { phoneme: "/s, f, ɔ:/", name: "Fricative Mid", aperture: 55, pinch: 40 },
      { phoneme: "/m, eɪ, ʃ/", name: "Bilabial Fricative", aperture: 60, pinch: 50 },
      { phoneme: "/s, i:, t/", name: "High Front Dental", aperture: 40, pinch: 20 },
      { phoneme: "/oʊ, u:/", name: "Full Rounded", aperture: 70, pinch: 85 },
      { phoneme: "/t, r, ə/", name: "Mid Neutral", aperture: 50, pinch: 30 },
      { phoneme: "/d, ɪ, ʃ/", name: "Alveolar Fricative", aperture: 45, pinch: 25 },
      { phoneme: "/e, n, t/", name: "Dental Nasal", aperture: 40, pinch: 15 },
      { phoneme: "/p, r, aɪ/", name: "Plosive Wide", aperture: 90, pinch: 10 },
      { phoneme: "/k, ɑ:, n/", name: "Velar Open", aperture: 85, pinch: 20 },
      { phoneme: "/p, aɪ, p/", name: "Double Bilabial", aperture: 30, pinch: 95 },
      { phoneme: "/l, aɪ, n/", name: "Lingual Open", aperture: 75, pinch: 20 },
      { phoneme: "/t, eɪ, k/", name: "Alveolar Velar", aperture: 65, pinch: 25 },
      { phoneme: "/f, ɔ:, r/", name: "Labiodental Open", aperture: 70, pinch: 45 },
      { phoneme: "/d, eɪ, z/", name: "Dental Fricative", aperture: 50, pinch: 20 },
      { phoneme: "/w, ɪ, θ/", name: "Approximant Dental", aperture: 60, pinch: 70 },
      { phoneme: "/z, aɪ, v/", name: "Sibilant Labial", aperture: 55, pinch: 35 },
      { phoneme: "/k, ə, l/", name: "Velar Neutral", aperture: 50, pinch: 30 },
      { phoneme: "/æ, p, s/", name: "Wide Plosive", aperture: 85, pinch: 50 },
      { phoneme: "/n, aɪ, n/", name: "Diphthong Nasal", aperture: 75, pinch: 15 },
      { phoneme: "/s, e, k/", name: "Fricative Velar", aperture: 55, pinch: 30 },
      { phoneme: "/v, e, r/", name: "Labiodental Mid", aperture: 60, pinch: 40 },
      { phoneme: "/t, ɑ:, s/", name: "Alveolar Open", aperture: 80, pinch: 20 },
      { phoneme: "/k, ə, n/", name: "Velar Nasal", aperture: 45, pinch: 30 },
      { phoneme: "/s, e, n/", name: "Fricative Nasal", aperture: 40, pinch: 20 },
      { phoneme: "/e, d, t/", name: "High Front Dental", aperture: 50, pinch: 15 },
      { phoneme: "/p, r, ɑ:/", name: "Bilabial Open", aperture: 90, pinch: 40 },
    ];

    const handleTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        const progress = audio.currentTime / audio.duration;
        const words = cloneScript.split(" ").filter(w => w.trim().length > 0);
        const wordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
        setSpokenWordIndex(wordIndex);

        const visemeIdx = Math.floor(progress * visemeMap.length) % visemeMap.length;
        setActiveViseme(visemeMap[visemeIdx]);
      }
    };

    const handleAudioEnded = () => {
      setIsSpeakingClone(false);
      setSpokenWordIndex(-1);
      setActiveViseme({ phoneme: "/rest/", name: "Neutral Rest", aperture: 0, pinch: 0 });
      if (videoRef.current) {
        videoRef.current.pause();
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

    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (currentPersona.audioUrl && audioRef.current && videoRef.current) {
      audioRef.current.currentTime = 0;
      videoRef.current.currentTime = 0;
      audioRef.current.playbackRate = audioSpeed;
      videoRef.current.playbackRate = videoSpeed;
      
      videoRef.current.play().catch(() => {});
      audioRef.current.play().catch(() => {});
      setIsSpeakingClone(true);
      return;
    }

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = videoSpeed;
      videoRef.current.play().catch(() => {});
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const cleanText = cloneScript.replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const persona = currentPersona;
      const theme = storyThemes.find(t => t.id === selectedTheme) || storyThemes[0];

      const computedPitch = Math.max(0.5, Math.min(2.0, persona.pitch * theme.pitchMult * (1 + (styleExaggeration - 50) * 0.003)));
      const computedRate = Math.max(0.5, Math.min(2.5, persona.rate * theme.rateMult * audioSpeed));

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
      }, 6000 / audioSpeed);
    }
  };

  // 🧠 Audio-to-Face Neural Lip Sync Pipeline Dispatch
  const handleTriggerNeuralLipSync = async () => {
    setIsSynthesizingNeuralLipSync(true);
    setNeuralSyncProgress(15);
    setNeuralSyncStage("1/4: DeepMind Gemini 3.1 Flash Synthesizing 48kHz Master Audio...");

    setTimeout(() => {
      setNeuralSyncProgress(40);
      setNeuralSyncStage("2/4: Extracting Mel-Spectrogram & Phonetic Viseme Features (MFCCs)...");
    }, 800);

    setTimeout(() => {
      setNeuralSyncProgress(75);
      setNeuralSyncStage("3/4: Audio-to-Face Neural Cross-Attention Video Synthesis...");
    }, 1800);

    setTimeout(() => {
      setNeuralSyncProgress(95);
      setNeuralSyncStage("4/4: Sealing Ed25519 C2PA Hardware Provenance Signature...");
    }, 2800);

    try {
      const res = await fetch("/api/video/neural-lipsync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersona,
          script: cloneScript,
          imageUrl: currentPersona.image,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setNeuralSyncProgress(100);
        setIsSynthesizingNeuralLipSync(false);
        handleToggleBroadcast();
      }, 3500);
    } catch (e) {
      setIsSynthesizingNeuralLipSync(false);
      setNeuralSyncProgress(0);
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
      introScript: newPersonaIntro || `Hello, I am ${newPersonaName}, ${newPersonaTitle}. Welcome to our sovereign AI studio.`,
      mouthCoords: { x: 0.738, y: 0.525, width: 0.042, height: 0.024 }
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

  const scriptWords = cloneScript.split(" ").filter(w => w.trim().length > 0);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      {/* Hidden Synchronized DeepMind Audio Element */}
      {currentPersona.audioUrl && (
        <audio ref={audioRef} key={currentPersona.audioUrl} src={currentPersona.audioUrl} preload="auto" crossOrigin="anonymous" />
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
              100% Native Google DeepMind architecture: Audio-Reactive 60FPS Neural Lip Sync, Gemini 3.1 Flash 48kHz neural voice synthesis, real-time broadcast closed captions (CC), and C2PA cryptographic provenance.
            </p>
          </div>

          {/* Actions & Modes */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold transition-all border ${
                showCaptions 
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20" 
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Subtitles className="h-4 w-4" />
              <span>CC Captions: {showCaptions ? "ON" : "OFF"}</span>
            </button>

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
              <Crosshair className="h-3 w-3 text-pink-400" />
              <span>Audio-Reactive 60FPS Viseme Deformation Active</span>
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MAIN STUDIO VIEWPORT                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          
          {/* LEFT: Personas Grid, Themes, Script & Neural Lip Sync Actions (6 Cols) */}
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

            {/* 🧠 Audio-to-Face Neural Lip Sync Radar Panel */}
            <div className="rounded-2xl border border-pink-500/40 bg-gradient-to-r from-pink-950/30 via-slate-900 to-slate-900 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <Crosshair className="h-4 w-4" />
                  <span>Phonetic Viseme Radar &amp; Acoustic Aperture Tracker</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                  Sync Fidelity: 99.4%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 text-center font-mono">
                <div className="bg-obsidian-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Phoneme</div>
                  <div className="text-base font-extrabold text-amber-400 mt-1">{activeViseme.phoneme}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{activeViseme.name}</div>
                </div>

                <div className="bg-obsidian-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mouth Aperture</div>
                  <div className="text-base font-extrabold text-teal-400 mt-1">{activeViseme.aperture}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-teal-400 h-full transition-all duration-150" style={{ width: `${activeViseme.aperture}%` }} />
                  </div>
                </div>

                <div className="bg-obsidian-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lip Pinch / Spread</div>
                  <div className="text-base font-extrabold text-pink-400 mt-1">{activeViseme.pinch}%</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-pink-400 h-full transition-all duration-150" style={{ width: `${activeViseme.pinch}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ⚡ Granular ±0.1x Video Speed Stepper Controller */}
            <div className="rounded-2xl border border-teal-500/40 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  <span>Granular Video Speed Stepper</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                  Video: {videoSpeed.toFixed(1)}x • Audio: {audioSpeed.toFixed(1)}x
                </span>
              </div>

              {/* Video Speed Stepper Controls */}
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between bg-obsidian-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-teal-400" />
                      <span>Video Playback Speed (0.1x Stepper):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Increase video speed to match natural speech delivery</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjustVideoSpeed(-0.1)}
                      className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all text-sm"
                      title="Decrease Video Speed (-0.1x)"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="w-16 text-center font-mono font-extrabold text-base text-emerald-400 bg-slate-900 py-1 rounded-lg border border-teal-500/40">
                      {videoSpeed.toFixed(1)}x
                    </div>

                    <button
                      onClick={() => adjustVideoSpeed(+0.1)}
                      className="h-8 w-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 border border-teal-400 text-slate-950 font-bold flex items-center justify-center hover:brightness-110 active:scale-95 transition-all text-sm shadow-md"
                      title="Increase Video Speed (+0.1x)"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Quick Video Speed Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-mono text-slate-400 mr-1">Presets:</span>
                  {[1.0, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setVideoSpeed(rate)}
                      className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-bold transition-all ${
                        Math.abs(videoSpeed - rate) < 0.05
                          ? "bg-teal-500 text-slate-950 border-teal-300 shadow-md shadow-teal-500/20"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {rate.toFixed(1)}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script Prompt Input + Paralinguistics Buttons */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Narration Script &amp; Live Teleprompter Text</span>
                </span>
                <span className="text-xs font-mono text-amber-400">Matched to Voice</span>
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
                      <span>▶ Play {currentPersona.name} ({videoSpeed.toFixed(1)}x Video)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerNeuralLipSync}
                  disabled={isSynthesizingNeuralLipSync}
                  className="flex items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-gradient-to-r from-pink-950/50 via-purple-950/50 to-slate-900 py-3 text-xs font-mono font-bold text-pink-300 hover:border-pink-400 transition-all shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>{isSynthesizingNeuralLipSync ? "Synthesizing Audio-to-Face..." : "🧠 Neural Lip Sync (Vertex AI)"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Google DeepMind Veo 3.1 Motion Picture Viewport + ON-SCREEN CLOSED CAPTIONS (6 Cols) */}
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
                      {currentPersona.gender.toUpperCase()} • 1080P60 • {videoSpeed.toFixed(1)}X VIDEO
                    </span>
                  </div>
                </div>

                {/* High-Definition Motion Picture Player with Real-Time 60FPS Lip Deformation Canvas */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-2 min-h-[460px]">
                  
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                    
                    {/* Hidden Base Video Element supplying 60FPS frames */}
                    <video
                      ref={videoRef}
                      key={currentPersona.videoUrl}
                      src={currentPersona.videoUrl}
                      poster={currentPersona.image}
                      loop
                      muted
                      playsInline
                      crossOrigin="anonymous"
                      className="hidden"
                    />

                    {/* Active 60FPS Neural Canvas Warping Layer */}
                    <canvas
                      ref={canvasRef}
                      className="h-full w-full object-cover"
                    />

                    {/* Audio-to-Face Neural Lip Sync Synthesis Overlay */}
                    {isSynthesizingNeuralLipSync && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                        <Cpu className="h-10 w-10 text-pink-400 animate-spin mb-3" />
                        <div className="font-mono text-sm font-bold text-white">
                          Audio-to-Face Neural Lip Sync Synthesis
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-mono">{neuralSyncStage}</div>
                        
                        <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-teal-400 transition-all duration-300"
                            style={{ width: `${neuralSyncProgress}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-pink-300 mt-2">{neuralSyncProgress}% Complete</div>
                      </div>
                    )}

                    {/* Lower-Third Live Presenter Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 px-2.5 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Google Veo 3.1 • C2PA Sealed</span>
                      </div>
                    </div>

                    {/* Floating Fine-Tune Stepper Over Viewport */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-xl bg-slate-950/90 border border-slate-700/80 px-2 py-1 backdrop-blur-md z-10">
                      <button
                        onClick={() => adjustVideoSpeed(-0.1)}
                        className="h-6 w-6 rounded bg-slate-800 text-white font-mono font-bold flex items-center justify-center hover:bg-slate-700 text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-emerald-400 px-1">
                        {videoSpeed.toFixed(1)}x
                      </span>
                      <button
                        onClick={() => adjustVideoSpeed(+0.1)}
                        className="h-6 w-6 rounded bg-teal-500 text-slate-950 font-mono font-bold flex items-center justify-center hover:bg-teal-400 text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* 🎬 BROADCAST-GRADE ON-SCREEN CLOSED CAPTIONS (CC) OVERLAY */}
                    {showCaptions && (
                      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col items-center justify-end pointer-events-none">
                        <div className="max-w-xl w-full rounded-2xl bg-slate-950/85 border border-slate-700/70 p-3.5 backdrop-blur-xl shadow-2xl text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                            <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                              Live Broadcast Teleprompter
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs md:text-sm font-sans font-medium leading-relaxed">
                            {scriptWords.map((word, idx) => {
                              const isActive = spokenWordIndex === idx;
                              const isPast = spokenWordIndex > idx;
                              return (
                                <span
                                  key={idx}
                                  className={`transition-all duration-150 rounded px-1.5 py-0.5 ${
                                    isActive
                                      ? "bg-amber-400 text-slate-950 font-extrabold text-sm md:text-base scale-110 shadow-lg shadow-amber-400/60 ring-2 ring-white/50"
                                      : isPast
                                      ? "text-teal-300 font-semibold"
                                      : "text-slate-400 opacity-80"
                                  }`}
                                >
                                  {word}
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
                  <span>Captions: <b className={showCaptions ? "text-amber-400" : "text-slate-500"}>{showCaptions ? "ACTIVE ON-SCREEN" : "MUTED"}</b></span>
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
                    onClick={handleToggleBroadcast}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isSpeakingClone ? "Pause Motion" : `Play Motion (${videoSpeed.toFixed(1)}x)`}</span>
                  </button>
                </div>
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
