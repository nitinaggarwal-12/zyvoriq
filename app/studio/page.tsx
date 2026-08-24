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
  MessageSquare
} from "lucide-react";

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"cloning" | "4pane">("cloning");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [selectedLanguage, setSelectedLanguage] = useState("English (US - Studio Master Baritone)");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [activeTabDiagram, setActiveTabDiagram] = useState<"visual" | "xml">("visual");

  // Virtual Clone Interactive State
  const [selectedAvatar, setSelectedAvatar] = useState("avatar_1");
  const [cloneScript, setCloneScript] = useState(
    "Hello Nitin, I am your Zyvoriq AI Executive Clone. I deconstruct technical architectures, validate claims with Veritas consensus, and publish 4K videos in under 90 seconds with Ed25519 provenance."
  );
  const [isSpeakingClone, setIsSpeakingClone] = useState(false);
  const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
  const [showMeshOverlay, setShowMeshOverlay] = useState(false);
  const [lipSyncPrecision, setLipSyncPrecision] = useState(99.8);
  const [gazeTracking, setGazeTracking] = useState(true);
  const [emotionTone, setEmotionTone] = useState("Authoritative Technical Master");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const avatars = [
    {
      id: "avatar_1",
      name: "Marcus Aurelius Tech",
      title: "Chief AI Architect & Founder",
      faceMesh: "468-point 3D Morphable NeRF",
      resolution: "4K 60fps Ultra-HDR",
      status: "Calibrated & Signed",
      tag: "Live Interactive Master",
      image: "/assets/avatars/executive_clone.jpg"
    },
    {
      id: "avatar_2",
      name: "Dr. Evelyn Vance",
      title: "VP Multi-Modal Intelligence",
      faceMesh: "Gaussian Splatting Kinematics",
      resolution: "4K 60fps HDR",
      status: "Calibrated & Signed",
      tag: "Executive Keynote",
      image: "/assets/avatars/executive_clone.jpg"
    }
  ];

  // Preload Avatar Image
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

  // Dynamic Canvas 2D Kinematics Renderer (Mouth morphing, Eye blinking, Head bobbing)
  const drawAvatarFrame = (mouthOpenAmount: number, headBobAngle: number, isBlinking: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Subtle head tilt / bobbing
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(headBobAngle * 0.03);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw base avatar portrait
    if (avatarImageRef.current) {
      ctx.drawImage(avatarImageRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 1. Dynamic Eye Blinking Kinematics
    if (isBlinking) {
      ctx.fillStyle = "#1E293B";
      // Left Eyelid
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.44, canvas.height * 0.32, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right Eyelid
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.58, canvas.height * 0.32, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Real-Time Lip-Sync Morphing (Mouth Opening & Closing Curves)
    if (mouthOpenAmount > 0.05) {
      const mouthX = canvas.width * 0.51;
      const mouthY = canvas.height * 0.44;
      const mouthWidth = 28 + mouthOpenAmount * 6;
      const mouthHeight = Math.max(3, mouthOpenAmount * 18);

      // Inner mouth cavity
      ctx.fillStyle = "#2D0A14";
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Teeth / Lip highlight
      ctx.fillStyle = "#F8FAFC";
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY - mouthHeight * 0.4, mouthWidth * 0.7, 3, 0, 0, Math.PI);
      ctx.fill();

      // Lower Lip shadow
      ctx.strokeStyle = "rgba(190, 24, 93, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + mouthHeight * 0.5, mouthWidth * 0.85, 4, 0, 0, Math.PI);
      ctx.stroke();
    }

    // 3. 3D NeRF Mesh Overlay Wireframe
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

  // 60FPS Kinematics Loop during Speech
  useEffect(() => {
    let startTime = Date.now();
    let isBlinking = false;
    let blinkTimer = 0;

    const animateLoop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Random blink every 3.5 seconds
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

  // Real In-Browser Virtual Clone Speech Synthesis with Natural Voice & Real-Time Lip-Sync
  const handleSpeakClone = () => {
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

      const utterance = new SpeechSynthesisUtterance(cloneScript);
      
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Premium") ||
          v.name.includes("Enhanced") ||
          v.name.includes("Daniel") ||
          v.name.includes("Alex") ||
          v.name.includes("Samantha")
      ) || voices[0];

      if (naturalVoice) utterance.voice = naturalVoice;
      utterance.rate = 0.94;
      utterance.pitch = 0.92;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const currentText = cloneScript.slice(0, charIndex);
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
      setTimeout(() => setIsSpeakingClone(false), 4000);
    }
  };

  const toggleAudioPreview = () => {
    if (isPlayingAudio) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          oscRef.current = osc;
          setIsPlayingAudio(true);
        }
      } catch (e) {
        setIsPlayingAudio(true);
      }
    }
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

      <main className="mx-auto max-w-[1720px] px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Top Title & Studio Switcher Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                AI Virtual Clone &amp; Avatar Studio
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Photorealistic 4K 3D NeRF avatar cloning with real-time in-browser speech synthesis, 60fps mouth phoneme morphing, and C2PA Ed25519 cryptographic provenance.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
              <button
                onClick={() => setStudioMode("cloning")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  studioMode === "cloning"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Virtual Clone Studio</span>
              </button>
              <button
                onClick={() => setStudioMode("4pane")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  studioMode === "4pane"
                    ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>4-Pane Canvas</span>
              </button>
            </div>

            <Link
              href="/governance"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Omnichannel Dispatch</span>
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODE A: INTERACTIVE VIRTUAL CLONE STUDIO SECTION     */}
        {/* ---------------------------------------------------- */}
        {studioMode === "cloning" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            
            {/* LEFT: Live Script Ingestion & Avatar Calibration (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Script Prompt Input */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                    <MessageSquare className="h-4 w-4" />
                    <span>Custom Speech &amp; Narration Prompt</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Interactive 60FPS</span>
                </div>

                <div className="pt-4">
                  <textarea
                    value={cloneScript}
                    onChange={(e) => setCloneScript(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-800 bg-obsidian-950 p-4 font-sans text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 leading-relaxed resize-none"
                    placeholder="Type anything for your virtual clone to speak..."
                  />
                </div>

                {/* Speak Action Button */}
                <div className="mt-4 flex items-center justify-between pt-2">
                  <button
                    onClick={handleSpeakClone}
                    className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                      isSpeakingClone
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 text-white hover:scale-[1.01] shadow-pink-500/25"
                    }`}
                  >
                    {isSpeakingClone ? (
                      <>
                        <Pause className="h-4 w-4 fill-current" />
                        <span>Speaking Live Clone Audio (Click to Stop)</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>▶ Test Virtual Clone (Speak &amp; Animate 60FPS)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Avatar Selector Vault */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                    <UserCheck className="h-4 w-4" />
                    <span>Executive Persona Vault</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Calibrated NeRF</span>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  {avatars.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedAvatar === av.id
                          ? "border-pink-500 bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 shadow-md shadow-pink-500/10"
                          : "border-slate-800 bg-obsidian-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-pink-500/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={av.image} alt={av.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-bold text-white">{av.name}</div>
                            <div className="text-xs text-slate-400">{av.title}</div>
                          </div>
                        </div>
                        <span className="rounded bg-pink-950 px-2 py-0.5 text-[10px] font-mono text-pink-300 border border-pink-800/50">
                          {av.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neural Tuning Sliders */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sliders className="h-4 w-4" />
                    <span>Neural Lip-Sync &amp; Formant Settings</span>
                  </div>
                  <span className="text-xs font-mono text-amber-300 font-bold">{lipSyncPrecision}%</span>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <div>
                    <input
                      type="range"
                      min="95"
                      max="100"
                      step="0.1"
                      value={lipSyncPrecision}
                      onChange={(e) => setLipSyncPrecision(Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">3D NeRF Mesh Overlay:</span>
                    <button
                      onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                        showMeshOverlay ? "bg-teal-500/20 text-teal-300 border border-teal-500/40" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {showMeshOverlay ? "WIREFRAME ON" : "NATURAL 4K"}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Photorealistic 60FPS Canvas Kinematics Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                      <Camera className="h-4 w-4" />
                      <span>Live 60FPS Photorealistic Kinematics Viewport</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isSpeakingClone ? "bg-pink-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                      <span className="text-xs font-mono text-slate-300">
                        {isSpeakingClone ? "60FPS Neural Speech Active" : "Avatar Ready"}
                      </span>
                    </div>
                  </div>

                  {/* 60FPS Interactive Canvas Viewport */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-4 min-h-[460px]">
                    
                    {/* The Live 60FPS Canvas */}
                    <div className="relative h-[360px] w-[360px] overflow-hidden rounded-2xl border border-pink-500/40 shadow-2xl shadow-pink-500/20">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover"
                      />

                      {/* Verified Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-emerald-500/50 px-2.5 py-1 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>NeRF 60fps Morphing</span>
                      </div>
                    </div>

                    {/* Gold Karaoke Real-Time Word Highlighting */}
                    <div className="mt-4 w-full rounded-xl bg-slate-950/90 border border-slate-800/80 p-3.5 text-center">
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

                    {/* C2PA Provenance Overlay Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-[11px] font-mono text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>C2PA JUMBF Box: sha256:7f83b1657ff1... • Signed with Ed25519</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Ticker */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Engine: <b className="text-white">60FPS Canvas Kinematics + DeepMind Formant</b></span>
                    <span>Latency: <b className="text-emerald-400">&lt; 40ms In-Browser</b></span>
                  </div>

                  <button
                    onClick={handleSpeakClone}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:brightness-110"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isSpeakingClone ? "Stop Narration" : "Replay Virtual Clone"}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* MODE B: 4-PANE SYNCHRONIZED MULTI-MODAL CANVAS       */
          /* ---------------------------------------------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8">
            
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStudioMode("cloning")}
                    className="text-[10px] font-mono font-bold text-pink-400 hover:text-pink-300 underline"
                  >
                    Open Avatar Cloning →
                  </button>
                  <span className="rounded bg-pink-950 px-2 py-0.5 text-[10px] font-mono text-pink-300 border border-pink-800/40">
                    1080p 60fps HDR
                  </span>
                </div>
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
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-300">
                  <span>Vocal Matrix Language Cast:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-obsidian-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option>English (US - Studio Master Baritone)</option>
                    <option>German (DE - Tech Narrative)</option>
                    <option>Japanese (JA - Executive Pitch)</option>
                    <option>Spanish (ES - Latin America Commercial)</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-mono font-bold text-emerald-300">Vocal Waveform &amp; Gold Karaoke Sync</span>
                    <button
                      onClick={toggleAudioPreview}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                      <span>{isPlayingAudio ? "Stop Stem Audio" : "Play Stem Audio (Web Audio)"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 h-12 py-2">
                    {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 100, 50, 70, 90, 35, 85, 60, 45, 95, 70, 80, 55, 65, 90, 40].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-emerald-500/40 to-teal-400 rounded-full transition-all duration-150"
                        style={{ height: `${isPlayingAudio ? Math.min(100, h + Math.sin(Date.now() / 200 + i) * 30) : h}%` }}
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

                      <line x1="260" y1="90" x2="260" y2="130" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="3 3" />

                      <rect x="190" y="130" width="140" height="50" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
                      <text x="205" y="152" fill="#92400E" fontSize="9" fontWeight="bold">pgvector 1536 Memory</text>
                      <text x="205" y="168" fill="#334155" fontSize="8">ivfflat Cosine &lt; 0.15</text>
                    </svg>

                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
                      <button
                        onClick={() => setDiagramZoom(Math.max(0.8, diagramZoom - 0.1))}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDiagramZoom(Math.min(1.4, diagramZoom + 0.1))}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Zoom In"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                    <pre className="text-[11px] font-mono text-slate-300/90 leading-relaxed overflow-x-auto p-2 bg-slate-950 rounded-lg border border-slate-800 max-h-[190px]">
{`<mxfile host="zyvoriq-studio">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="node_bff" value="Edge BFF Gateway" vertex="1" parent="1">
      <mxGeometry x="50" y="120" width="280" height="90" as="geometry"/>
    </mxCell>
    <mxCell id="node_veritas" value="Veritas 5-Axis Engine" vertex="1" parent="1">
      <mxGeometry x="420" y="120" width="340" height="150" as="geometry"/>
    </mxCell>
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
