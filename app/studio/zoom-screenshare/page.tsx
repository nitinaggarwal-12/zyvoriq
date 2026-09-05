"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ScreenShare,
  Camera,
  CameraOff,
  CheckCircle2,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  MousePointer,
  Users,
  Mic,
  Play,
  Pause,
  ArrowLeft,
  Sparkles,
  Box,
  Video,
  Check,
  Settings2
} from "lucide-react";
import { RealTime3DAvatarCanvas } from "@/components/RealTime3DAvatarCanvas";

export default function ZoomScreenSharePage() {
  // Pre-Session Mode Selection: Option A (Photorealistic Video) vs Option B (3D VRM Mesh)
  const [avatarEngineMode, setAvatarEngineMode] = useState<"photorealistic" | "3d_vrm">("photorealistic");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "elena">("user");
  const [hasAppliedFix, setHasAppliedFix] = useState(false);
  const [isUserCamActive, setIsUserCamActive] = useState(true);
  const [laserPos, setLaserPos] = useState({ x: 380, y: 240 });

  const userCamRef = useRef<HTMLVideoElement | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);

  // Strictly Calibrated Non-Overlapping Dialogue Timetable
  // 0.20s - 6.17s: Nitin (User)
  // 6.62s - 14.07s: Elena (Support)
  // 14.52s - 16.98s: Nitin (User)
  // 17.43s - 25.24s: Elena (Support)
  // 25.69s - 27.40s: Nitin (User)
  // 27.85s - 30.13s: Elena (Support)

  useEffect(() => {
    let start = Date.now() - (currentTime * 1000);
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const elapsed = (Date.now() - start) / 1000;
      setCurrentTime(Math.min(elapsed, 30.2));

      if (elapsed < 6.4) {
        setActiveSpeaker("user");
        setLaserPos({ x: 340 + Math.sin(elapsed * 2) * 30, y: 220 + Math.cos(elapsed * 2) * 20 });
      } else if (elapsed < 14.3) {
        setActiveSpeaker("elena");
        // Laser highlights Shot 1 Audio Stem
        setLaserPos({ x: 260 + Math.sin(elapsed * 4) * 20, y: 310 + Math.cos(elapsed * 4) * 10 });
      } else if (elapsed < 17.2) {
        setActiveSpeaker("user");
        setLaserPos({ x: 260, y: 310 });
      } else if (elapsed < 25.5) {
        setActiveSpeaker("elena");
        // Elena clicks Autonomous Fix
        setLaserPos({ x: 640 + Math.sin(elapsed * 3) * 15, y: 480 });
        setHasAppliedFix(true);
      } else if (elapsed < 27.6) {
        setActiveSpeaker("user");
        setLaserPos({ x: 800, y: 220 });
      } else {
        setActiveSpeaker("elena");
        setLaserPos({ x: 840 + Math.sin(elapsed * 2) * 20, y: 160 });
      }

      if (elapsed >= 30.2) {
        clearInterval(interval);
      }
    }, 100);

    // Audio Playback Triggers - Spoken via Web Speech API with zero static file dependencies
    const speakText = (text: string, isElena: boolean) => {
      if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = isElena ? 1.05 : 1.0;
        utterance.pitch = isElena ? 1.2 : 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    };

    const timeouts: NodeJS.Timeout[] = [];
    if (isPlaying) {
      if (currentTime < 0.2) {
        timeouts.push(setTimeout(() => speakText("Hey Elena, I’m seeing a cadence drift in Shot 1 after extending the hook to 5 seconds. Can you help me re-align the lip-sync?", false), 200));
      }
      if (currentTime < 6.62) {
        timeouts.push(setTimeout(() => speakText("Hi Nitin! I see your screen. That’s because the audio stem cadence is still locked to the 3-second template. Let me highlight it for you right now.", true), Math.max(0, (6.62 - currentTime) * 1000)));
      }
      if (currentTime < 14.52) {
        timeouts.push(setTimeout(() => speakText("Got it, I see your laser pointer on the cadence bar. Should I re-render the whole shot?", false), Math.max(0, (14.52 - currentTime) * 1000)));
      }
      if (currentTime < 17.43) {
        timeouts.push(setTimeout(() => speakText("No need to re-render! I’ve just engaged Zyvoriq’s neural audio time-stretch. It will dynamically re-time the voiceover to match the 5-second cut while maintaining pitch perfection.", true), Math.max(0, (17.43 - currentTime) * 1000)));
      }
      if (currentTime < 25.69) {
        timeouts.push(setTimeout(() => speakText("Awesome, that fixed it instantly. Thanks Elena!", false), Math.max(0, (25.69 - currentTime) * 1000)));
      }
      if (currentTime < 27.85) {
        timeouts.push(setTimeout(() => speakText("You are welcome Nitin! Happy creating!", true), Math.max(0, (27.85 - currentTime) * 1000)));
      }
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, currentTime, isMuted]);

  // Handle User Webcam with Proper Cleanup
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isUserCamActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          userStreamRef.current = stream;
          if (userCamRef.current) userCamRef.current.srcObject = stream;
        })
        .catch(() => {
          console.log("Using avatar silhouette fallback");
        });
    }

    return () => {
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(t => t.stop());
        userStreamRef.current = null;
      }
    };
  }, [isUserCamActive]);

  const handleRestart = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTime(0);
    setHasAppliedFix(false);
    setIsPlaying(true);
  };

  const handleToggleUserCamera = () => {
    if (isUserCamActive) {
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(t => t.stop());
        userStreamRef.current = null;
      }
      setIsUserCamActive(false);
    } else {
      setIsUserCamActive(true);
    }
  };

  const currentDialogue = [
    { start: 0, end: 6.4, speaker: "Nitin Aggarwal (Creator)", text: "“Hey Elena, my 4-shot reel timeline won't sync audio on Shot 1. Can you help me fix this?”" },
    { start: 6.4, end: 14.3, speaker: "Elena Rostova (AI Support Engineer)", text: "“Hi Nitin! I see your screen right now. Your Shot 1 audio stem is unlinked from the hook. Look at my laser spotlight on your timeline.”" },
    { start: 14.3, end: 17.2, speaker: "Nitin Aggarwal (Creator)", text: "“Got it! Can you auto sync it for me?”" },
    { start: 17.2, end: 25.5, speaker: "Elena Rostova (AI Support Engineer)", text: "“I am triggering One Click Autonomous Sync now. There, your retention jumped to 94.8% and your reel is ready for 4K export!”" },
    { start: 25.5, end: 27.6, speaker: "Nitin Aggarwal (Creator)", text: "“Awesome, thank you Elena!”" },
    { start: 27.6, end: 30.5, speaker: "Elena Rostova (AI Support Engineer)", text: "“You are welcome Nitin! Happy creating!”" }
  ].find(d => currentTime >= d.start && currentTime < d.end) || {
    speaker: "Elena Rostova (AI Support Engineer)",
    text: "“You are welcome Nitin! Happy creating!”"
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. ZOOM / MEET HEADER BAR WITH PRE-SESSION MODE SELECTOR */}
      <header className="h-16 border-b border-slate-800/90 bg-[#0b0f17]/95 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Studio</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>2-WAY ZOOM SESSION ACTIVE</span>
          </div>

          <span className="text-xs font-mono text-slate-400 hidden lg:inline">
            Room: #4829-9182 • 48kHz Duplex Voice
          </span>
        </div>

        {/* AVATAR ENGINE MODE SELECTOR: Option A vs Option B */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setAvatarEngineMode("photorealistic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                avatarEngineMode === "photorealistic"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Option A: Photorealistic Desk/Office Video Stream"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Option A: Desk Video</span>
              {avatarEngineMode === "photorealistic" && <Check className="w-3 h-3 stroke-[3]" />}
            </button>

            <button
              onClick={() => setAvatarEngineMode("3d_vrm")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                avatarEngineMode === "3d_vrm"
                  ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Option B: Real-Time 3D Conversational Avatar (Three.js + VRM)"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Option B: 3D VRM Mesh</span>
              {avatarEngineMode === "3d_vrm" && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>

          <Link
            href="/studio"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all font-bold text-xs font-mono"
          >
            End Call
          </Link>
        </div>
      </header>

      {/* 2. MAIN STAGE: SHARED SCREEN (LEFT 3 COLS) + 2-WAY CAM TILES (RIGHT COL) */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-[1600px] w-full mx-auto">
        
        {/* SHARED SCREEN WORKSPACE */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-[#0d121d] p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          
          {/* Screen Share Watermark & Top Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <ScreenShare className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>Nitin Aggarwal&apos;s Shared Screen: <strong>Zyvoriq Reel Studio (Timeline Canvas)</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Playhead: {currentTime.toFixed(1)}s / 30.0s
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                24fps Locked
              </span>
            </div>
          </div>

          {/* Actual 4-Beat Studio Sequence Timeline */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                Topic: Autonomous AI Video Infrastructure &amp; Multi-Shot Director
              </h3>
              <span className="text-xs font-mono text-emerald-400">Format: 9:16 Vertical Reel</span>
            </div>

            {/* 4 Cinematic Beats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Shot 1 */}
              <div className={`p-4 rounded-xl border transition-all ${
                hasAppliedFix
                  ? "bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
              }`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-100">Shot 1: 3-Second Curiosity Hook</span>
                  <span className={hasAppliedFix ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                    {hasAppliedFix ? "94.8% RETENTION" : "42.0% (UNLINKED STEM)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Duration: 0:00 - 0:03 • Visual: Fast-paced AI node topology zoom-in
                </p>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${hasAppliedFix ? "bg-emerald-400 w-[94.8%]" : "bg-amber-400 w-[42%]"}`}
                  />
                </div>
              </div>

              {/* Shot 2 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-100">Shot 2: Problem &amp; Tension</span>
                  <span className="text-emerald-400 font-mono">SYNCHRONIZED</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Duration: 0:03 - 0:11 • Visual: Highlighting data bottleneck in traditional studios
                </p>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[91%]" />
                </div>
              </div>

              {/* Shot 3 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-100">Shot 3: Breakthrough Showcase</span>
                  <span className="text-emerald-400 font-mono">SYNCHRONIZED</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Duration: 0:11 - 0:22 • Visual: Live continuous 60fps rendering in browser
                </p>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[96%]" />
                </div>
              </div>

              {/* Shot 4 */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-100">Shot 4: CTA &amp; Outro</span>
                  <span className="text-teal-300 font-mono">READY FOR 4K EXPORT</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Duration: 0:22 - 0:30 • Visual: 1-Click publish to TikTok, YouTube &amp; LinkedIn
                </p>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-400 w-[98%]" />
                </div>
              </div>

            </div>

            {/* Retention & Audio Waveform Deck */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 mt-3">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  AUDIO WAVEFORM &amp; VIRALITY RETENTION CURVE
                </span>
                <span className={hasAppliedFix ? "text-emerald-400" : "text-amber-400"}>
                  {hasAppliedFix ? "● Auto-Lock Active (No Drift)" : "⚠️ Audio Offset Detected (+180ms)"}
                </span>
              </div>
              
              {/* Waveform graphic */}
              <div className="h-10 flex items-center gap-1 overflow-hidden px-2 bg-slate-900/90 rounded-lg">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const heightPercent = hasAppliedFix 
                    ? Math.round(20 + 20 * Math.sin(idx * 0.4)) 
                    : (idx < 12 ? 10 : Math.round(25 + 15 * Math.cos(idx * 0.5)));
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        hasAppliedFix ? "bg-teal-400" : (idx < 12 ? "bg-amber-400 animate-pulse" : "bg-slate-700")
                      }`}
                      style={{
                        height: `${heightPercent}%`
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* REAL-TIME LASER CURSOR ANNOTATION */}
          <div
            className="pointer-events-none absolute transition-all duration-500 ease-out z-40"
            style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
          >
            <div className="relative -top-5 -left-5 h-10 w-10 rounded-full border-2 border-teal-400 bg-teal-400/20 animate-ping" />
            <div className="absolute top-0 left-0 flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-teal-400 border-2 border-white shadow-xl shadow-teal-500/50 flex items-center justify-center text-slate-950 font-black text-[10px]">
                <MousePointer className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-teal-950/90 border border-teal-400/50 backdrop-blur-md text-[10px] font-mono font-bold text-teal-200 shadow-lg whitespace-nowrap">
                Elena&apos;s Spotlight Pointer
              </div>
            </div>
          </div>

        </div>

        {/* 2-WAY PARTICIPANT VIDEO TILES (Right Column) */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* 1. SUPPORT AGENT TILE: Dynamic Mode (Option A Video vs Option B 3D VRM Mesh) */}
          <div className={`p-3 rounded-2xl border transition-all ${
            activeSpeaker === "elena"
              ? "border-teal-400 bg-slate-900/90 shadow-xl shadow-teal-500/20"
              : "border-slate-800 bg-slate-950/90"
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-teal-300 font-bold flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${activeSpeaker === "elena" ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                ELENA ROSTOVA (AI SUPPORT)
              </span>
              <span className="text-slate-400 text-[10px]">
                {avatarEngineMode === "photorealistic" ? "Option A: Video" : "Option B: 3D Mesh"}
              </span>
            </div>

            {/* DYNAMIC RENDERING: Option A Video vs Option B 3D VRM Canvas */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              {avatarEngineMode === "photorealistic" ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950/30 to-black p-4 text-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full border-2 border-teal-400/50 bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-lg shadow-lg">
                      ER
                    </div>
                    {activeSpeaker === "elena" && (
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">Elena Rostova</div>
                  <div className="text-[10px] font-mono text-teal-400/80">AI Support Engineer · Live Copilot</div>
                  <div className="mt-2 text-[9px] text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                    {activeSpeaker === "elena" ? "Speaking..." : "Listening"}
                  </div>
                </div>
              ) : (
                <RealTime3DAvatarCanvas
                  isSpeaking={activeSpeaker === "elena"}
                  avatarName="Elena Rostova"
                  avatarId="elena"
                />
              )}
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                <Mic className={`w-3 h-3 ${activeSpeaker === "elena" ? "text-emerald-400 animate-bounce" : "text-slate-400"}`} />
                <span>Elena Rostova</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-teal-300">Natural Voice: 190 WPM</span>
              <span className="text-emerald-400">{avatarEngineMode === "3d_vrm" ? "60fps WebGL" : "1080p 60fps"}</span>
            </div>
          </div>

          {/* 2. USER TILE (Nitin Aggarwal) */}
          <div className={`p-3 rounded-2xl border transition-all ${
            activeSpeaker === "user"
              ? "border-cyan-400 bg-slate-900/90 shadow-xl shadow-cyan-500/20"
              : "border-slate-800 bg-slate-950/90"
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${activeSpeaker === "user" ? "bg-cyan-400 animate-ping" : "bg-slate-600"}`} />
                NITIN AGGARWAL (CREATOR)
              </span>
              <button
                onClick={handleToggleUserCamera}
                className="text-[10px] text-slate-400 hover:text-white"
                title={isUserCamActive ? "Mute User Camera" : "Enable User Camera"}
              >
                {isUserCamActive ? <Camera className="w-3.5 h-3.5 text-cyan-400" /> : <CameraOff className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            </div>

            {/* User Cam Video Feed */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {isUserCamActive ? (
                <video
                  ref={userCamRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-slate-500 text-xs">
                  <CameraOff className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  Camera Muted
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                <Mic className={`w-3 h-3 ${activeSpeaker === "user" ? "text-cyan-400 animate-bounce" : "text-slate-400"}`} />
                <span>Nitin (Creator)</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-cyan-300">Duplex Voice Active</span>
              <span className="text-emerald-400">AEC 48kHz</span>
            </div>
          </div>

          {/* 3. DIAGNOSTIC ACTION DECK */}
          <div className="p-3.5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
              <span>RESOLUTION STATUS:</span>
              <strong className={hasAppliedFix ? "text-emerald-400" : "text-amber-400"}>
                {hasAppliedFix ? "100% UNBLOCKED" : "ACTION REQUIRED"}
              </strong>
            </div>

            <button
              onClick={() => setHasAppliedFix(true)}
              className={`w-full py-2 px-3 rounded-xl font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 ${
                hasAppliedFix
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/20 cursor-pointer"
              }`}
            >
              {hasAppliedFix ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AUTONOMOUS FIX APPLIED</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>APPLY 1-CLICK FIX</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM LIVE KARAOKE CAPTIONS & ZOOM CONTROLS */}
      <footer className="border-t border-slate-800/90 bg-[#0b0f17]/95 px-6 py-3 z-30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Active Speaker Subtitles */}
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2 w-2 rounded-full ${activeSpeaker === "user" ? "bg-cyan-400" : "bg-teal-400"} animate-pulse`} />
              <strong className={activeSpeaker === "user" ? "text-cyan-300 font-mono" : "text-teal-300 font-mono"}>
                {currentDialogue.speaker}:
              </strong>
            </div>
            <p className="text-amber-200 italic font-medium leading-relaxed">
              {currentDialogue.text}
            </p>
          </div>

          {/* Zoom Meeting Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              }`}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title={isPlaying ? "Pause Session" : "Play Session"}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title="Restart 30s Debug Demo"
            >
              <RotateCcw className="w-4 h-4 text-slate-300" />
            </button>

            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-lg transition-all"
            >
              Return to Studio
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
