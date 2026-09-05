"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ScreenShare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sliders,
  Check,
  MousePointer,
  Eye,
  Activity
} from "lucide-react";

export interface LiveScreenShareCopilotSessionProps {
  isOpen: boolean;
  onClose: () => void;
  avatarId?: "elena" | "priya";
  onAvatarChange?: (avatarId: "elena" | "priya") => void;
}

export function LiveScreenShareCopilotSession({
  isOpen,
  onClose,
  avatarId = "elena",
  onAvatarChange
}: LiveScreenShareCopilotSessionProps) {
  const [currentAvatar, setCurrentAvatar] = useState<"elena" | "priya">(avatarId);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUserCamActive, setIsUserCamActive] = useState(true);
  const [sessionProgress, setSessionProgress] = useState(0); // 0 to 30s
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [hasAppliedFix, setHasAppliedFix] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 120, y: 180 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userCamRef = useRef<HTMLVideoElement | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const avatarData = {
    elena: {
      name: "Elena Rostova",
      role: "Senior AI Video & Workflow Specialist",
      attire: "Tech Minimalist Dark Hoodie",
      tone: "Supportive & Pedagogical",
      videoSrc: "",
      audioSrc: "",
      headshot: "/assets/avatars/avatar_elena_founder.jpg",
      problemTitle: "Shot 1 Audio Stem Unlinked from Curiosity Hook",
      spokenLines: [
        { start: 0, end: 6, text: "Hi Nitin! Elena here from Zyvoriq Live Support. I'm connected to your screen and I can see your Reel Studio timeline." },
        { start: 6, end: 14, text: "Notice how Shot 1 is missing the curiosity hook audio waveform? Look at my laser spotlight right here on your audio inspector." },
        { start: 14, end: 22, text: "I'm going to trigger the 1-Click Autonomous Sync for you right now. Watch your timeline auto-lock and retention jump to 94 percent." },
        { start: 22, end: 30, text: "Perfect! Your reel is now fully synchronized and ready for 4K export. Let me know if you need any other help!" }
      ]
    },
    priya: {
      name: "Priya Sharma",
      role: "Chief AI Officer & Global Creative Director",
      attire: "Navy Executive Blazer & Lapel Pin",
      tone: "Authoritative Executive",
      videoSrc: "",
      audioSrc: "",
      headshot: "/assets/avatars/avatar_priya_cto.jpg",
      problemTitle: "14% Viewer Retention Drop on Hook B",
      spokenLines: [
        { start: 0, end: 6, text: "Hello Nitin! Priya Sharma here, Chief AI Officer. I am reviewing your studio canvas in real time." },
        { start: 6, end: 14, text: "Your 3-second hook conversion is dropping by 14 percent on Hook B. I am spotlighting the Hook A Curiosity Gap on your screen." },
        { start: 14, end: 22, text: "Let's apply the high-retention switch now. Excellent, your predicted audience engagement is now at 96 percent." },
        { start: 22, end: 30, text: "Your studio session is optimized and ready to publish across global syndication channels!" }
      ]
    }
  };

  const active = avatarData[currentAvatar];

  // Initialize or restart session when opened or avatar changed
  useEffect(() => {
    if (isOpen) {
      setSessionProgress(0);
      setCurrentStep(1);
      setHasAppliedFix(false);
      setLaserPos({ x: 280, y: 220 });

      // Start Real Spoken Audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlayingAudio(true);
        }).catch(err => {
          console.warn("Audio autoplay handled:", err);
          setIsPlayingAudio(true);
        });
      }

      // Progress Tracker & Animated Laser Pointer
      if (timerRef.current) clearInterval(timerRef.current);
      const startMs = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startMs) / 1000;
        setSessionProgress(Math.min(elapsed, 30));

        if (elapsed < 6) {
          setCurrentStep(1);
          setLaserPos({ x: 320 + Math.sin(elapsed * 2) * 40, y: 240 + Math.cos(elapsed * 1.5) * 20 });
        } else if (elapsed < 14) {
          setCurrentStep(2);
          setLaserPos({ x: 260 + Math.sin(elapsed * 4) * 15, y: 310 + Math.cos(elapsed * 4) * 10 });
        } else if (elapsed < 22) {
          setCurrentStep(3);
          setLaserPos({ x: 680 + Math.sin(elapsed * 3) * 10, y: 520 });
          setHasAppliedFix(true);
        } else {
          setCurrentStep(4);
          setLaserPos({ x: 880 + Math.sin(elapsed * 2) * 20, y: 160 });
        }

        if (elapsed >= 30) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 100);

      // Initialize User Webcam
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            userStreamRef.current = stream;
            if (userCamRef.current) {
              userCamRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            setIsUserCamActive(true);
          });
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(t => t.stop());
        userStreamRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (userStreamRef.current) {
        userStreamRef.current.getTracks().forEach(t => t.stop());
        userStreamRef.current = null;
      }
    };
  }, [isOpen, currentAvatar]);

  const handleSwitchAvatar = (newAvatar: "elena" | "priya") => {
    setCurrentAvatar(newAvatar);
    if (onAvatarChange) onAvatarChange(newAvatar);
  };

  const handleApplyFixManually = () => {
    setHasAppliedFix(true);
    setCurrentStep(3);
  };

  const currentCaption = active.spokenLines.find(
    line => sessionProgress >= line.start && sessionProgress < line.end
  )?.text || active.spokenLines[active.spokenLines.length - 1].text;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      
      {/* Audio Element for Real Spoken Human Speech */}
      {active.audioSrc && (
        <audio
          ref={audioRef}
          src={active.audioSrc}
          preload="auto"
          muted={isMuted}
          onEnded={() => setIsPlayingAudio(false)}
        />
      )}

      {/* 1. TOP STATUS BAR: Live Screen Sharing Banner */}
      <header className="pointer-events-auto w-full max-w-7xl mx-auto rounded-2xl border border-teal-500/40 bg-slate-950/90 backdrop-blur-xl p-3 shadow-2xl shadow-teal-500/10 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono font-bold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SCREEN SHARE COPILOT</span>
          </div>
          <span className="hidden md:inline text-slate-400 font-mono">
            {active.name} is actively inspecting your Reel Studio canvas
          </span>
        </div>

        {/* Avatar Fast Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => handleSwitchAvatar("elena")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                currentAvatar === "elena"
                  ? "bg-teal-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Elena</span>
              {currentAvatar === "elena" && <Check className="w-3 h-3" />}
            </button>
            <button
              onClick={() => handleSwitchAvatar("priya")}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                currentAvatar === "priya"
                  ? "bg-teal-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Priya</span>
              {currentAvatar === "priya" && <Check className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
            title="End Screen Share Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. REAL-TIME LASER CURSOR & SPOTLIGHT OVERLAY */}
      <div
        className="pointer-events-none absolute transition-all duration-300 ease-out z-50"
        style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
      >
        {/* Glowing Laser Spotlight Circle */}
        <div className="relative -top-6 -left-6 h-12 w-12 rounded-full border-2 border-teal-400 bg-teal-400/20 animate-ping" />
        
        {/* Animated Hand / Pointer Cursor */}
        <div className="absolute top-0 left-0 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-teal-400 border-2 border-white shadow-xl shadow-teal-500/50 flex items-center justify-center text-slate-950 font-black text-[10px]">
            <MousePointer className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="px-2 py-0.5 rounded-lg bg-teal-950/90 border border-teal-400/50 backdrop-blur-md text-[10px] font-mono font-bold text-teal-200 shadow-lg whitespace-nowrap">
            {active.name}&apos;s Pointer
          </div>
        </div>

        {/* Live Step Diagnostic Tag */}
        <div className="absolute top-8 left-0 mt-1 w-64 rounded-xl border border-teal-500/50 bg-slate-950/95 p-2.5 backdrop-blur-xl shadow-2xl text-[11px] text-white">
          <div className="flex items-center gap-1.5 text-teal-300 font-mono font-bold text-[10px]">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>STEP {currentStep} OF 4</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-200">
            {currentStep === 1 && "Inspecting 4-Beat Reel Sequence..."}
            {currentStep === 2 && `Spotlight: ${active.problemTitle}`}
            {currentStep === 3 && (hasAppliedFix ? "Autonomous 1-Click Fix Applied!" : "Applying 1-Click Autonomous Audio Lock...")}
            {currentStep === 4 && "Timeline Synchronized! 94.8% Retention Score Locked"}
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-400 border-t border-slate-800 pt-1">
            <span>Latency: 320ms</span>
            <span>AEC 48kHz</span>
          </div>
        </div>
      </div>

      {/* 3. FLOATING MULTIMODAL COPILOT HUD (Top Right & Bottom Bars) */}
      <div className="pointer-events-auto flex flex-col md:flex-row items-end justify-between gap-4 max-w-7xl w-full mx-auto">
        
        {/* LEFT BOTTOM: User Live Webcam (PiP) */}
        <div className="w-64 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono font-bold text-[10px]">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>USER WEBCAM (LIVE PIP)</span>
            </div>
            <button
              onClick={() => setIsUserCamActive(!isUserCamActive)}
              className={`p-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                isUserCamActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {isUserCamActive ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
            </button>
          </div>

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
              <div className="text-center p-3 text-slate-500 text-[10px]">
                <CameraOff className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                User Cam Paused
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-white">
              Creator (Nitin)
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Duplex Audio
            </span>
            <span>48kHz Echo Canceled</span>
          </div>
        </div>

        {/* CENTER BOTTOM: Gold Subtitles & Interactive 1-Click Fix Button */}
        <div className="flex-1 max-w-2xl rounded-2xl border border-teal-500/40 bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-300 font-mono font-bold text-[11px]">
                SPIDEY-SENSE LIVE GUIDANCE ({sessionProgress.toFixed(1)}s / 30.0s)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isMuted ? "border-rose-500/40 text-rose-300 bg-rose-950/30" : "border-teal-500/40 text-teal-300 bg-teal-950/30"
                }`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleApplyFixManually}
                disabled={hasAppliedFix}
                className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs transition-all flex items-center gap-1.5 ${
                  hasAppliedFix
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                    : "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/20 cursor-pointer"
                }`}
              >
                {hasAppliedFix ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SYNCHRONIZED (94.8% RETENTION)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>APPLY 1-CLICK AUTONOMOUS FIX</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Gold Karaoke Spoken Dialogue Bar */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-amber-200 font-medium text-xs leading-relaxed italic">
            &ldquo;{currentCaption}&rdquo;
          </div>

          {/* Telemetry Chips */}
          <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-300 text-center">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">Helpfulness</span>
              <strong className="text-emerald-400">99.8%</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">Zero-Fluff</span>
              <strong className="text-teal-300">100%</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">Content Safety</span>
              <strong className="text-emerald-400">Guarded</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">Retention</span>
              <strong className={hasAppliedFix ? "text-emerald-400" : "text-amber-400"}>
                {hasAppliedFix ? "94.8%" : "42.0%"}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT BOTTOM: Virtual Support Agent Live Video Clone */}
        <div className="w-72 rounded-2xl border border-teal-500/40 bg-slate-950/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-teal-300 font-mono font-bold text-[10px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SUPPORT CLONE: {active.name.toUpperCase()}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">1080p 60fps</span>
          </div>

          {/* Avatar Stream or Headshot */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-teal-500/30 shadow-inner flex items-center justify-center">
            {active.videoSrc ? (
              <video
                src={active.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={active.headshot}
                alt={active.name}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-teal-200 border border-teal-500/30 z-10">
              {active.name}
            </div>
          </div>

          {/* Soundwave Meter Synchronized with Speech */}
          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
            <span className="text-slate-400 font-mono">{active.attire.split("&")[0]}</span>
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-full bg-teal-400 animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="w-0.5 h-3/4 bg-teal-400 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-0.5 h-full bg-teal-400 animate-pulse" style={{ animationDelay: "300ms" }} />
              <span className="w-0.5 h-1/2 bg-teal-400 animate-pulse" style={{ animationDelay: "450ms" }} />
              <span className="w-0.5 h-4/5 bg-teal-400 animate-pulse" style={{ animationDelay: "600ms" }} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
