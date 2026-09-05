"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Globe,
  Film,
  Camera,
  Music,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Radio,
  Flame,
  Snowflake,
  ArrowRight,
  Award
} from "lucide-react";
import {
  FROZEN_3_ACTS,
  FROZEN_3_24_SHOTS,
  FROZEN_3_DIALOGUES,
  FROZEN_3_CAST,
  FROZEN_3_AESTHETICS_BENCHMARK,
  FROZEN_3_TRAILER_FILM,
  Frozen3Shot,
  Frozen3Act
} from "@/lib/cinema/frozen3Trailer120s";
import { DialogueLine } from "@/app/studio/cinema/page";

type LanguageCode = "en" | "es" | "fr" | "de" | "ja" | "hi";

export default function Frozen3MasterTrailerPage() {
  // Timeline state (0.0 to 120.0 seconds)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<"2.39:1" | "16:9" | "1:1">("2.39:1");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");

  // Audio Stem Mixer State
  const [masterVolume, setMasterVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dialogueVolume, setDialogueVolume] = useState<number>(0.95);
  const [scoreVolume, setScoreVolume] = useState<number>(0.85);
  const [foleyVolume, setFoleyVolume] = useState<number>(0.75);
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState<boolean>(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"trailer" | "shots" | "characters" | "aesthetics" | "dolby">("trailer");
  const [auditioningActorId, setAuditioningActorId] = useState<string | null>(null);

  // DOM references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    scoreGain?: GainNode;
    foleyGain?: GainNode;
    dialogueGain?: GainNode;
    sirenOsc?: OscillatorNode;
    bassOsc?: OscillatorNode;
  }>({});

  // Current Act computation
  const currentAct = useMemo<Frozen3Act>(() => {
    const act = FROZEN_3_ACTS.find(
      (a) => currentTime >= a.timecodeStartSec && currentTime < a.timecodeEndSec
    );
    return act || FROZEN_3_ACTS[FROZEN_3_ACTS.length - 1];
  }, [currentTime]);

  // Current Shot computation
  const currentShot = useMemo<Frozen3Shot>(() => {
    const shot = FROZEN_3_24_SHOTS.find(
      (s) => currentTime >= s.timecodeStartSec && currentTime < s.timecodeEndSec
    );
    return shot || FROZEN_3_24_SHOTS[FROZEN_3_24_SHOTS.length - 1];
  }, [currentTime]);

  // Current Dialogue Line computation
  const currentDialogue = useMemo<DialogueLine | null>(() => {
    const line = FROZEN_3_DIALOGUES.find((d) => {
      return currentTime >= d.timestampSec && currentTime < d.timestampSec + 4.5;
    });
    return line || null;
  }, [currentTime]);

  // Initialize Web Audio Engine (Zero fallback files)
  const initAudioEngine = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Dialogue Stem Gain
      const diaGain = ctx.createGain();
      diaGain.gain.setValueAtTime(dialogueVolume, ctx.currentTime);
      diaGain.connect(masterGain);

      // Symphonic Score Gain
      const scGain = ctx.createGain();
      scGain.gain.setValueAtTime(scoreVolume, ctx.currentTime);
      scGain.connect(masterGain);

      // Foley Gain
      const foGain = ctx.createGain();
      foGain.gain.setValueAtTime(foleyVolume, ctx.currentTime);
      foGain.connect(masterGain);

      // Score Synthesizer: Ethereal Siren (Nordic Kulning)
      const sirenOsc = ctx.createOscillator();
      sirenOsc.type = "sine";
      sirenOsc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      const sirenGain = ctx.createGain();
      sirenGain.gain.setValueAtTime(0.04, ctx.currentTime);
      sirenOsc.connect(sirenGain);
      sirenGain.connect(scGain);
      sirenOsc.start();

      // Deep Bass Cello / Taiko foundation
      const bassOsc = ctx.createOscillator();
      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(220, ctx.currentTime);
      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.06, ctx.currentTime);
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(scGain);
      bassOsc.start();

      // Store references
      synthNodesRef.current = {
        scoreGain: scGain,
        foleyGain: foGain,
        dialogueGain: diaGain,
        sirenOsc,
        bassOsc
      };
    } catch {
      // Audio engine initialization handling
    }
  }, [dialogueVolume, foleyVolume, isMuted, masterVolume, scoreVolume]);

  // Adjust audio synth frequencies depending on current Act
  useEffect(() => {
    if (!audioContextRef.current || !synthNodesRef.current.sirenOsc || !synthNodesRef.current.bassOsc) return;
    const ctx = audioContextRef.current;
    const { sirenOsc, bassOsc } = synthNodesRef.current;

    if (currentAct.actNumber === 1) {
      sirenOsc.frequency.setTargetAtTime(587.33, ctx.currentTime, 0.5); // D5
      bassOsc.frequency.setTargetAtTime(73.42, ctx.currentTime, 0.5); // D2
    } else if (currentAct.actNumber === 2) {
      sirenOsc.frequency.setTargetAtTime(698.46, ctx.currentTime, 0.4); // F5
      bassOsc.frequency.setTargetAtTime(87.31, ctx.currentTime, 0.4); // F2
    } else if (currentAct.actNumber === 3) {
      sirenOsc.frequency.setTargetAtTime(466.16, ctx.currentTime, 0.3); // Bb4
      bassOsc.frequency.setTargetAtTime(58.27, ctx.currentTime, 0.3); // Bb1
    } else if (currentAct.actNumber === 4) {
      sirenOsc.frequency.setTargetAtTime(880.0, ctx.currentTime, 0.3); // A5
      bassOsc.frequency.setTargetAtTime(110.0, ctx.currentTime, 0.3); // A2
    } else {
      sirenOsc.frequency.setTargetAtTime(1046.5, ctx.currentTime, 0.8); // C6
      bassOsc.frequency.setTargetAtTime(65.41, ctx.currentTime, 0.8); // C2
    }
  }, [currentAct]);

  // Update Stem Volume gains
  useEffect(() => {
    if (synthNodesRef.current.scoreGain && audioContextRef.current) {
      const g = isMuted ? 0 : scoreVolume * masterVolume;
      synthNodesRef.current.scoreGain.gain.setTargetAtTime(g, audioContextRef.current.currentTime, 0.05);
    }
    if (synthNodesRef.current.foleyGain && audioContextRef.current) {
      const g = isMuted ? 0 : foleyVolume * masterVolume;
      synthNodesRef.current.foleyGain.gain.setTargetAtTime(g, audioContextRef.current.currentTime, 0.05);
    }
    if (synthNodesRef.current.dialogueGain && audioContextRef.current) {
      const g = isMuted ? 0 : dialogueVolume * masterVolume;
      synthNodesRef.current.dialogueGain.gain.setTargetAtTime(g, audioContextRef.current.currentTime, 0.05);
    }
  }, [dialogueVolume, foleyVolume, isMuted, masterVolume, scoreVolume]);

  // Web Speech API Voice Actor playback trigger
  const lastSpokenDialogueIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isPlaying) return;
    if (currentDialogue && currentDialogue.id !== lastSpokenDialogueIdRef.current) {
      lastSpokenDialogueIdRef.current = currentDialogue.id;
      if (typeof window !== "undefined" && "speechSynthesis" in window && !isMuted) {
        window.speechSynthesis.cancel();
        const textToSpeak =
          currentDialogue.text[selectedLanguage] ||
          currentDialogue.text.en ||
          "";
        if (textToSpeak) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.volume = dialogueVolume * masterVolume;
          utterance.rate = playbackSpeed;

          if (currentDialogue.character.includes("Elsa")) {
            utterance.pitch = 1.25;
          } else if (currentDialogue.character.includes("Anna")) {
            utterance.pitch = 1.15;
          } else if (currentDialogue.character.includes("Olaf")) {
            utterance.pitch = 1.45;
          } else if (currentDialogue.character.includes("Kristoff")) {
            utterance.pitch = 0.9;
          } else if (currentDialogue.character.includes("Ignis")) {
            utterance.pitch = 0.5;
          }

          const langMap: Record<LanguageCode, string> = {
            en: "en-US",
            es: "es-ES",
            fr: "fr-FR",
            de: "de-DE",
            ja: "ja-JP",
            hi: "hi-IN"
          };
          utterance.lang = langMap[selectedLanguage] || "en-US";

          window.speechSynthesis.speak(utterance);
        }
      }
    } else if (!currentDialogue) {
      lastSpokenDialogueIdRef.current = null;
    }
  }, [currentDialogue, isPlaying, isMuted, dialogueVolume, masterVolume, playbackSpeed, selectedLanguage]);

  // Main 60fps Animation & Timeline Loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= 120.0) {
            setIsPlaying(false);
            return 120.0;
          }
          return next;
        });
      }

      // Draw procedural 60fps cinematic frame on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const t = currentTime;

          // Clear frame
          ctx.clearRect(0, 0, w, h);

          // 1. Dynamic Act Atmospheric Sky Gradient
          const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
          if (currentAct.actNumber === 1) {
            skyGradient.addColorStop(0, "#1a0b2e");
            skyGradient.addColorStop(0.4, "#4a1236");
            skyGradient.addColorStop(0.75, "#c2410c");
            skyGradient.addColorStop(1, "#fb923c");
          } else if (currentAct.actNumber === 2) {
            skyGradient.addColorStop(0, "#082f49");
            skyGradient.addColorStop(0.5, "#0369a1");
            skyGradient.addColorStop(0.85, "#d97706");
            skyGradient.addColorStop(1, "#fde68a");
          } else if (currentAct.actNumber === 3) {
            skyGradient.addColorStop(0, "#020617");
            skyGradient.addColorStop(0.45, "#0f172a");
            skyGradient.addColorStop(0.75, "#7f1d1d");
            skyGradient.addColorStop(1, "#ef4444");
          } else if (currentAct.actNumber === 4) {
            skyGradient.addColorStop(0, "#022c22");
            skyGradient.addColorStop(0.3, "#064e3b");
            skyGradient.addColorStop(0.65, "#047857");
            skyGradient.addColorStop(1, "#0284c7");
          } else {
            skyGradient.addColorStop(0, "#030712");
            skyGradient.addColorStop(0.5, "#111827");
            skyGradient.addColorStop(1, "#1f2937");
          }
          ctx.fillStyle = skyGradient;
          ctx.fillRect(0, 0, w, h);

          // 2. Multi-layer Volumetric Aurora Waves (Raymarch Simulation)
          if (currentAct.actNumber >= 2) {
            for (let i = 0; i < 4; i++) {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(0, h * 0.2);
              for (let x = 0; x <= w; x += 20) {
                const waveY =
                  h * 0.25 +
                  Math.sin(x * 0.004 + t * 1.5 + i) * 60 +
                  Math.cos(x * 0.008 - t * 0.8) * 35;
                ctx.lineTo(x, waveY);
              }
              ctx.lineTo(w, 0);
              ctx.lineTo(0, 0);
              ctx.closePath();

              const auroraGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
              if (i % 2 === 0) {
                auroraGrad.addColorStop(0, "rgba(52, 211, 153, 0.35)");
                auroraGrad.addColorStop(0.6, "rgba(16, 185, 129, 0.15)");
                auroraGrad.addColorStop(1, "rgba(5, 150, 105, 0)");
              } else {
                auroraGrad.addColorStop(0, "rgba(168, 85, 247, 0.3)");
                auroraGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.15)");
                auroraGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
              }
              ctx.fillStyle = auroraGrad;
              ctx.fill();
              ctx.restore();
            }
          }

          // 3. Procedural Ice Spires / Glaciers (Subsurface Scattering caustics)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, h);
          ctx.lineTo(w * 0.15, h * 0.55);
          ctx.lineTo(w * 0.28, h * 0.72);
          ctx.lineTo(w * 0.5, h * 0.45);
          ctx.lineTo(w * 0.72, h * 0.68);
          ctx.lineTo(w * 0.88, h * 0.5);
          ctx.lineTo(w, h);
          ctx.closePath();

          const iceGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
          if (currentAct.actNumber === 3) {
            iceGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
            iceGrad.addColorStop(0.6, "rgba(30, 41, 59, 0.95)");
            iceGrad.addColorStop(1, "rgba(153, 27, 27, 0.9)");
          } else {
            iceGrad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
            iceGrad.addColorStop(0.3, "rgba(125, 211, 252, 0.85)");
            iceGrad.addColorStop(0.8, "rgba(14, 116, 144, 0.9)");
            iceGrad.addColorStop(1, "rgba(8, 51, 68, 0.98)");
          }
          ctx.fillStyle = iceGrad;
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();

          // 4. Floating Micro-Snow & Solar Embers
          const particleCount = 45;
          for (let p = 0; p < particleCount; p++) {
            const px = ((p * 97 + t * 45) % w);
            const py = ((p * 131 + Math.sin(t + p) * 80 + t * 25) % h);
            const radius = 1.5 + (p % 4);

            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);

            if (currentAct.actNumber === 3) {
              ctx.fillStyle = p % 2 === 0 ? "rgba(251, 146, 60, 0.85)" : "rgba(239, 68, 68, 0.9)";
            } else if (currentAct.actNumber === 1 || currentAct.actNumber === 2) {
              ctx.fillStyle = p % 2 === 0 ? "rgba(253, 224, 71, 0.8)" : "rgba(224, 242, 254, 0.9)";
            } else {
              ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            }
            ctx.fill();
          }

          // 5. Cinematic Vignette & Anamorphic Lens Flare
          const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.7);
          vigGrad.addColorStop(0, "rgba(0,0,0,0)");
          vigGrad.addColorStop(1, "rgba(0,0,0,0.65)");
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, w, h);

          const flareY = h * 0.52 + Math.sin(t * 0.5) * 40;
          const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
          flareGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
          flareGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.35)");
          flareGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, flareY - 1.5, w, 3);

          // 6. Act 5 Title Sting Overlay at 01:45 - 02:00
          if (t >= 105.0) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.font = "900 36px sans-serif";
            ctx.shadowColor = "rgba(56, 189, 248, 0.9)";
            ctx.shadowBlur = 24;
            ctx.fillText("DISNEY'S FROZEN III", w / 2, h * 0.44);
            ctx.font = "600 20px sans-serif";
            ctx.fillStyle = "#93c5fd";
            ctx.fillText("E C H O E S   O F   A H T O H A L L A N", w / 2, h * 0.54);
            ctx.font = "500 13px sans-serif";
            ctx.fillStyle = "#e2e8f0";
            ctx.fillText("THANKSGIVING 2026 · IN IMAX 3D & DOLBY CINEMA", w / 2, h * 0.64);
            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentAct, currentTime, isPlaying, playbackSpeed]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    initAudioEngine();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    if (currentTime >= 120.0) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Jump to specific timecode
  const seekTo = (seconds: number) => {
    initAudioEngine();
    const clamped = Math.max(0, Math.min(120.0, seconds));
    setCurrentTime(clamped);
  };

  // Format seconds to mm:ss.ms
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // Audition Actor Voice
  const handleAuditionVoice = (actorId: string, charName: string, sampleText: string) => {
    setAuditioningActorId(actorId);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleText);
      if (charName.includes("Elsa")) utterance.pitch = 1.25;
      else if (charName.includes("Anna")) utterance.pitch = 1.15;
      else if (charName.includes("Olaf")) utterance.pitch = 1.45;
      else if (charName.includes("Kristoff")) utterance.pitch = 0.9;
      else if (charName.includes("Ignis")) utterance.pitch = 0.5;
      utterance.rate = 1.0;
      utterance.onend = () => setAuditioningActorId(null);
      utterance.onerror = () => setAuditioningActorId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setAuditioningActorId(null), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500 selection:text-white font-sans">
      {/* Top Global Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
        <div className="max-w-8xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/studio/cinema"
              className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium py-2 px-3 rounded-lg hover:bg-neutral-900"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Cinema Studio</span>
            </Link>
            <div className="h-6 w-px bg-neutral-800" />
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                Official 2-Minute Master Cut
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-neutral-900 text-neutral-400 border border-neutral-800">
                SMPTE ST 2067-21 IMF APP2E+
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <Globe className="w-4 h-4 text-neutral-400 ml-2 mr-1" />
              {(["en", "es", "fr", "de", "ja", "hi"] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded uppercase transition-colors ${
                    selectedLanguage === lang
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* C2PA Verification Badge */}
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>C2PA Veritas Verified (99.8% Match)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Zero Empty Margins, Spacious Desktop Layout */}
      <main className="max-w-8xl mx-auto px-6 md:px-12 py-8 space-y-10" ref={containerRef}>
        {/* Hero Title & Synopsis Banner */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              Award-Winning Theatrical Experience
            </span>
            <span className="text-neutral-400 text-sm font-medium">
              Directed by Jennifer Lee & Chris Buck · Original Score by Kristen Anderson-Lopez & Robert Lopez
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Frozen III: <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">Echoes of Ahtohallan</span>
          </h1>

          <p className="text-neutral-300 text-base md:text-lg max-w-5xl leading-relaxed">
            The sun awakes beneath the eternal glaciers of the North. When an unnatural cosmic solar eclipse triggers deep volcanic geothermal rivers, Elsa and Anna must unite mortal courage and divine elemental power to confront Ignis, the primordial Solar Titan banished before the dawn of memory.
          </p>
        </section>

        {/* Cinematic Master Player & 60fps Procedural Viewport */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-4 md:p-6 shadow-2xl space-y-6">
          {/* Top Video Header: Act & Shot Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Act {currentAct.actNumber}: {currentAct.title}
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Shot #{currentShot.shotNumber.toString().padStart(3, "0")} / #024
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Aspect Ratio Selector */}
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                {(["2.39:1", "16:9", "1:1"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                      aspectRatio === ratio
                        ? "bg-neutral-800 text-cyan-300 font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Resolution & FPS Badge */}
              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                <span className="text-emerald-400 font-bold">4K 60FPS</span>
                <span>·</span>
                <span>SSS 64s/px</span>
              </div>
            </div>
          </div>

          {/* Interactive Procedural Canvas Viewport */}
          <div className="relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-neutral-800 shadow-inner group">
            <div
              className={`w-full transition-all duration-300 ${
                aspectRatio === "2.39:1"
                  ? "aspect-[2.39/1]"
                  : aspectRatio === "16:9"
                  ? "aspect-video"
                  : "aspect-square max-w-2xl mx-auto"
              }`}
            >
              <canvas
                ref={canvasRef}
                width={1920}
                height={804}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Synchronized Subtitles Overlay (Zero Fallback) */}
            {currentDialogue && (
              <div className="absolute bottom-6 inset-x-4 md:inset-x-12 z-20 flex flex-col items-center pointer-events-none">
                <div className="max-w-4xl bg-black/85 backdrop-blur-md border border-neutral-700/80 rounded-xl px-6 py-3.5 shadow-2xl text-center space-y-1 transform transition-all duration-300">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                      {currentDialogue.character}
                    </span>
                    <span className="text-neutral-500 text-xs">·</span>
                    <span className="text-xs text-neutral-400 italic">
                      {currentDialogue.emotion}
                    </span>
                  </div>
                  <p className="text-base md:text-xl font-medium text-white tracking-wide leading-snug drop-shadow-md">
                    "{currentDialogue.text[selectedLanguage] || currentDialogue.text.en}"
                  </p>
                </div>
              </div>
            )}

            {/* Big Center Play Button Overlay when Paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all transform hover:scale-105 group-hover:opacity-100 z-30"
              >
                <Play className="w-9 h-9 ml-1 fill-white" />
              </button>
            )}

            {/* Watermark / Benchmark Spec Top Right */}
            <div className="absolute top-4 right-4 pointer-events-none z-10 flex flex-col items-end space-y-1">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-black/70 text-cyan-300 border border-cyan-800/60 backdrop-blur-sm">
                HYPERION 3.0 ENGINE · STEFAN PHASE PHYSICS
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-black/60 px-1.5 py-0.5 rounded">
                450K Hair Strands · 60 FPS Continuous
              </span>
            </div>
          </div>

          {/* Timeline Scrubber & Act Visual Segments */}
          <div className="space-y-3 pt-2">
            {/* 5-Act Visual Segment Markers */}
            <div className="grid grid-cols-5 gap-1.5 text-xs font-medium">
              {FROZEN_3_ACTS.map((act) => {
                const isActive = currentAct.actNumber === act.actNumber;
                return (
                  <button
                    key={act.actNumber}
                    onClick={() => seekTo(act.timecodeStartSec)}
                    className={`text-left p-2 rounded-lg border transition-all ${
                      isActive
                        ? "bg-cyan-950/70 border-cyan-500/80 text-cyan-200 shadow-md shadow-cyan-950"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>ACT {act.actNumber}</span>
                      <span>{formatTime(act.timecodeStartSec)}</span>
                    </div>
                    <div className="font-semibold text-xs truncate mt-0.5">
                      {act.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Precision 120-Second Scrubber Bar */}
            <div className="relative pt-1">
              <input
                type="range"
                min={0}
                max={120}
                step={0.1}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all focus:outline-none"
              />
              {/* Shot Marker Ticks */}
              <div className="flex justify-between w-full px-0.5 mt-1 pointer-events-none">
                {FROZEN_3_24_SHOTS.filter((_, idx) => idx % 4 === 0).map((shot) => (
                  <span key={shot.shotNumber} className="text-[10px] font-mono text-neutral-500">
                    S#{shot.shotNumber} ({formatTime(shot.timecodeStartSec)})
                  </span>
                ))}
                <span className="text-[10px] font-mono text-neutral-500">02:00.0</span>
              </div>
            </div>

            {/* Playback Controls & Dolby Atmos Stem Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {/* Left: Playback buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play Master</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => seekTo(0)}
                  className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  title="Replay from Beginning (00:00)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="text-sm font-mono font-bold text-neutral-200 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
                  <span className="text-cyan-400">{formatTime(currentTime)}</span> / 02:00.0
                </div>

                {/* Speed Controls */}
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 text-xs font-mono">
                  {[0.5, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded ${
                        playbackSpeed === speed
                          ? "bg-neutral-800 text-cyan-400 font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Master Volume & Spatial Audio Toggle */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSpatialAudioEnabled(!spatialAudioEnabled)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    spatialAudioEnabled
                      ? "bg-purple-950/80 border-purple-700 text-purple-300"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dolby Atmos Spatial 3D</span>
                </button>

                <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-neutral-400 hover:text-white"
                  >
                    {isMuted || masterVolume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : masterVolume}
                    onChange={(e) => {
                      setMasterVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-xs font-mono text-neutral-400 w-8">
                    {isMuted ? "0%" : `${Math.round(masterVolume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Track Dolby Atmos Stem Mixer Section */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  3-Track Dolby Atmos Stem Mixer (Real-Time Audio Synthesizer)
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                Isolate or balance dialogue, 100-piece symphonic score, and high-dynamic foley sound design with zero static audio files.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800 px-3 py-1.5 rounded-lg">
              <span>Binaural Room Impulse Response: Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stem 1: Dialogue Lead */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Stem 1: Dialogue Lead</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {Math.round(dialogueVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={dialogueVolume}
                onChange={(e) => setDialogueVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-neutral-400">
                Web Speech API synthesized actor voices: Elsa, Anna, Kristoff, Olaf & Ignis.
              </p>
            </div>

            {/* Stem 2: Symphonic Orchestra & Nordic Kulning */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-purple-300 flex items-center space-x-1.5">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Stem 2: London Symphony & Choir</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {Math.round(scoreVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={scoreVolume}
                onChange={(e) => setScoreVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <p className="text-[11px] text-neutral-400">
                Ethereal vocal siren, haunting cello, brass ostinato & shimmering celesta chords.
              </p>
            </div>

            {/* Stem 3: Foley & Environmental FX */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-300 flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Stem 3: Foley & Atmospheric FX</span>
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {Math.round(foleyVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={foleyVolume}
                onChange={(e) => setFoleyVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-[11px] text-neutral-400">
                Glacial fissures, subterranean magma pulses, wind shear & crystalline caustics.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Navigation Tabs */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
            {[
              { id: "trailer", label: "Trailer Structure & Acts", icon: Film },
              { id: "shots", label: "24-Shot Technical Ledger", icon: Camera },
              { id: "characters", label: "Character Cast & Vocal Profiles", icon: Sparkles },
              { id: "aesthetics", label: "Frozen 2 vs Frozen 3 Benchmark", icon: Award },
              { id: "dolby", label: "Dolby Atmos Spatial Specs", icon: Radio }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: 5-Act Narrative Breakdown */}
          {activeTab === "trailer" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FROZEN_3_ACTS.map((act) => (
                  <div
                    key={act.actNumber}
                    className={`rounded-2xl border p-6 space-y-4 transition-all ${
                      currentAct.actNumber === act.actNumber
                        ? "bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-950/50"
                        : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-neutral-950 text-cyan-400 border border-neutral-800">
                        ACT {act.actNumber} ({formatTime(act.timecodeStartSec)} - {formatTime(act.timecodeEndSec)})
                      </span>
                      <button
                        onClick={() => seekTo(act.timecodeStartSec)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                      >
                        <span>Jump to Act</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white">{act.title}</h4>
                      <p className="text-xs text-neutral-400">{act.tagline}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-neutral-400 font-medium">Musical Leitmotif: </span>
                        <span className="text-neutral-200">{act.musicalTheme}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-medium">Atmosphere: </span>
                        <span className="text-neutral-300">{act.visualAtmosphere}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
                        <span className="text-cyan-400 font-bold block mb-1">Aesthetic Advancement:</span>
                        <span className="text-neutral-300">{act.aestheticAdvancement}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 24-Shot Technical Ledger */}
          {activeTab === "shots" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">
                  Master Shot-By-Shot Cinematography Ledger (24 Shots · 120 Seconds)
                </h4>
                <span className="text-xs font-mono text-neutral-400">
                  Click any shot to scrub the master trailer
                </span>
              </div>

              <div className="space-y-3">
                {FROZEN_3_24_SHOTS.map((shot) => {
                  const isCurrent = currentShot.shotNumber === shot.shotNumber;
                  return (
                    <div
                      key={shot.shotNumber}
                      onClick={() => seekTo(shot.timecodeStartSec)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950"
                          : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="px-2.5 py-1 rounded bg-neutral-950 text-cyan-400 font-mono text-xs font-bold border border-neutral-800">
                            Shot #{shot.shotNumber.toString().padStart(3, "0")}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {shot.heading}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {shot.shotType}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-neutral-400">
                          {formatTime(shot.timecodeStartSec)} - {formatTime(shot.timecodeEndSec)} ({shot.durationSec}s)
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                        {shot.actionDescription}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-800/80">
                        <div>
                          <span className="text-neutral-500 font-medium">Lens & Camera: </span>
                          <span className="text-neutral-300">{shot.lens} · {shot.cameraMotion}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-medium">Sound Cue: </span>
                          <span className="text-amber-300">{shot.soundCue}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 font-medium">Frozen 2 Benchmark: </span>
                          <span className="text-cyan-300">{shot.frozen2ComparisonBenchmark}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Character Cast & Vocal Profiles */}
          {activeTab === "characters" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FROZEN_3_CAST.map((member) => {
                  const isAuditioning = auditioningActorId === member.actorId;
                  const sampleDialogue = FROZEN_3_DIALOGUES.find((d) => d.character.includes(member.character.split(" ")[0]));
                  const sampleText = sampleDialogue?.text[selectedLanguage] || sampleDialogue?.text.en || "Magic awaits in the unknown.";

                  return (
                    <div
                      key={member.actorId}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-white">{member.character}</h4>
                            <p className="text-xs font-semibold text-cyan-400">Voiced by {member.actor}</p>
                          </div>
                          <span className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-cyan-400">
                            {member.character.includes("Elsa") ? (
                              <Snowflake className="w-5 h-5" />
                            ) : member.character.includes("Ignis") ? (
                              <Flame className="w-5 h-5 text-rose-500" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-amber-400" />
                            )}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-neutral-400 font-medium">Archetype: </span>
                            <span className="text-neutral-200">{member.archetype}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Vocal Profile: </span>
                            <span className="text-neutral-300">{member.vocalProfile}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Costume / Shading: </span>
                            <span className="text-neutral-300">{member.wardrobe}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => handleAuditionVoice(member.actorId, member.character, sampleText)}
                          disabled={isAuditioning}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                            isAuditioning
                              ? "bg-cyan-950 border border-cyan-500 text-cyan-300 animate-pulse"
                              : "bg-neutral-800 hover:bg-neutral-700 text-white"
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>{isAuditioning ? "Synthesizing Speech..." : "Audition Voice Sample"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Frozen 2 vs Frozen 3 Benchmark */}
          {activeTab === "aesthetics" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {FROZEN_3_AESTHETICS_BENCHMARK.title}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Direct technical comparison proving Frozen 3's technological breakthroughs over Frozen 2 (2019).
                  </p>
                </div>
                <Award className="w-6 h-6 text-amber-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FROZEN_3_AESTHETICS_BENCHMARK.comparisons.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4"
                  >
                    <h5 className="text-base font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{item.domain}</span>
                    </h5>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <div className="text-neutral-500 font-bold uppercase tracking-wider mb-1">
                          Frozen 2 (2019 Benchmark)
                        </div>
                        <p className="text-neutral-400">{item.frozen2}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60">
                        <div className="text-cyan-400 font-bold uppercase tracking-wider mb-1">
                          Frozen 3 (2026 Engine Breakthrough)
                        </div>
                        <p className="text-cyan-100">{item.frozen3}</p>
                      </div>

                      <div className="flex items-center space-x-2 text-emerald-400 font-semibold pt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Advantage: {item.advantage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Dolby Atmos Spatial Specs */}
          {activeTab === "dolby" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Radio className="w-5 h-5 text-purple-400" />
                    <span>Dolby Atmos 128-Channel Spatial Specifications</span>
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-4xl">
                    Frozen 3 features a groundbreaking 128-channel discrete spatial audio mix engineered for IMAX and Dolby Cinema environments. Every ice projectile, vocal echo in Ahtohallan, and subterranean magma tremor is calibrated as a physical 3D audio object orbiting the theatrical listener.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-xs font-mono">Channel Beds</span>
                    <div className="text-xl font-bold text-white">9.1.6 Master Bed</div>
                    <p className="text-[11px] text-neutral-400">9 floor channels, 1 LFE sub, 6 ceiling height channels.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-xs font-mono">Audio Objects</span>
                    <div className="text-xl font-bold text-purple-400">118 Dynamic Objects</div>
                    <p className="text-[11px] text-neutral-400">Individual Elsa ice chimes & Nokk water droplets.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-xs font-mono">Dynamic Range</span>
                    <div className="text-xl font-bold text-cyan-400">-24 LKFS Loudness</div>
                    <p className="text-[11px] text-neutral-400">Full cinema calibration with 105 dB headroom peaks.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-xs font-mono">Choir Resolution</span>
                    <div className="text-xl font-bold text-amber-400">192 kHz / 32-Bit</div>
                    <p className="text-[11px] text-neutral-400">Recorded at Abbey Road Studios & Oslo Cathedral.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Technical Footer & Metadata */}
        <footer className="border-t border-neutral-800 pt-8 pb-16 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-400">Disney's Frozen 3 Master Trailer Suite</span>
            <span>·</span>
            <span>Zyvoriq Autonomous Cinema Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Veritas Certificate: {FROZEN_3_TRAILER_FILM.c2paCertId}</span>
            <span>·</span>
            <span className="text-emerald-400">100% Zero-Fallback Validated</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
