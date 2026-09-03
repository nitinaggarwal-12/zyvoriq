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
  Mic
} from "lucide-react";

export default function ZoomScreenSharePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "elena">("user");
  const [hasAppliedFix, setHasAppliedFix] = useState(false);
  const [isUserCamActive, setIsUserCamActive] = useState(true);
  const [laserPos, setLaserPos] = useState({ x: 380, y: 240 });

  const audioUser1 = useRef<HTMLAudioElement | null>(null);
  const audioElena1 = useRef<HTMLAudioElement | null>(null);
  const audioUser2 = useRef<HTMLAudioElement | null>(null);
  const audioElena2 = useRef<HTMLAudioElement | null>(null);
  const audioUser3 = useRef<HTMLAudioElement | null>(null);
  const audioElena3 = useRef<HTMLAudioElement | null>(null);
  const userCamRef = useRef<HTMLVideoElement | null>(null);

  // Play dialogue sequentially
  useEffect(() => {
    let start = Date.now();
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const elapsed = (Date.now() - start) / 1000;
      setCurrentTime(Math.min(elapsed, 30));

      if (elapsed < 6) {
        setActiveSpeaker("user");
        setLaserPos({ x: 340 + Math.sin(elapsed * 2) * 30, y: 220 + Math.cos(elapsed * 2) * 20 });
      } else if (elapsed < 15) {
        setActiveSpeaker("elena");
        // Laser highlights Shot 1 Audio Stem
        setLaserPos({ x: 260 + Math.sin(elapsed * 4) * 20, y: 310 + Math.cos(elapsed * 4) * 10 });
      } else if (elapsed < 18) {
        setActiveSpeaker("user");
        setLaserPos({ x: 260, y: 310 });
      } else if (elapsed < 26) {
        setActiveSpeaker("elena");
        // Elena clicks Autonomous Fix
        setLaserPos({ x: 640 + Math.sin(elapsed * 3) * 15, y: 480 });
        setHasAppliedFix(true);
      } else if (elapsed < 28) {
        setActiveSpeaker("user");
        setLaserPos({ x: 800, y: 220 });
      } else {
        setActiveSpeaker("elena");
        setLaserPos({ x: 840 + Math.sin(elapsed * 2) * 20, y: 160 });
      }

      if (elapsed >= 30) {
        clearInterval(interval);
      }
    }, 100);

    // Audio Playback Triggers
    const t1 = setTimeout(() => audioUser1.current?.play().catch(() => {}), 200);
    const t2 = setTimeout(() => audioElena1.current?.play().catch(() => {}), 6000);
    const t3 = setTimeout(() => audioUser2.current?.play().catch(() => {}), 15000);
    const t4 = setTimeout(() => audioElena2.current?.play().catch(() => {}), 18000);
    const t5 = setTimeout(() => audioUser3.current?.play().catch(() => {}), 26000);
    const t6 = setTimeout(() => audioElena3.current?.play().catch(() => {}), 28000);

    // Init User Webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (userCamRef.current) userCamRef.current.srcObject = stream;
        })
        .catch(() => {});
    }

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [isPlaying]);

  const currentDialogue = [
    { start: 0, end: 6, speaker: "Nitin Aggarwal (Creator)", text: "“Hey Elena, my 4-shot reel in Studio Cinema won't sync audio on Shot 1, and my predicted retention is stuck at 42%. Can you look at my screen and help me fix this?”" },
    { start: 6, end: 15, speaker: "Elena Rostova (AI Support Engineer)", text: "“Hi Nitin! I am connected to your screen right now. I see the issue immediately—your Shot 1 audio stem is unlinked from the 3-second curiosity hook. See my laser spotlight on your timeline right here.”" },
    { start: 15, end: 18, speaker: "Nitin Aggarwal (Creator)", text: "“Got it! Should I rebuild the beat plan or can you auto-sync it for me?”" },
    { start: 18, end: 26, speaker: "Elena Rostova (AI Support Engineer)", text: "“I will trigger the 1-Click Autonomous Sync directly on your canvas. Watch your waveform auto-align... There, your retention score just jumped to 94.8% and your 4-shot sequence is ready for 4K export!”" },
    { start: 26, end: 28, speaker: "Nitin Aggarwal (Creator)", text: "“Awesome, that completely fixed it. Thanks Elena!”" },
    { start: 28, end: 30, speaker: "Elena Rostova (AI Support Engineer)", text: "“You're very welcome Nitin! Reach out anytime if you need another review.”" }
  ].find(d => currentTime >= d.start && currentTime < d.end) || {
    speaker: "Elena Rostova (AI Support Engineer)",
    text: "“You're very welcome Nitin! Reach out anytime if you need another review.”"
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-black">
      
      {/* Hidden Audio Elements for 2-Way Spoken Conversation */}
      <audio ref={audioUser1} src="/assets/audio/user_1.wav" preload="auto" />
      <audio ref={audioElena1} src="/assets/audio/elena_1.wav" preload="auto" />
      <audio ref={audioUser2} src="/assets/audio/user_2.wav" preload="auto" />
      <audio ref={audioElena2} src="/assets/audio/elena_2.wav" preload="auto" />
      <audio ref={audioUser3} src="/assets/audio/user_3.wav" preload="auto" />
      <audio ref={audioElena3} src="/assets/audio/elena_3.wav" preload="auto" />

      {/* 1. ZOOM / MEET HEADER BAR */}
      <header className="h-14 border-b border-slate-800/90 bg-[#0b0f17]/95 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>2-WAY ZOOM SESSION ACTIVE</span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Room: #4829-9182 • Zyvoriq Live Screen Share &amp; Video Co-Presence
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300">
            <Users className="w-3.5 h-3.5" />
            <span>2 Participants (Nitin + Elena)</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
            <span>1080p 60fps • 48kHz AEC</span>
          </div>
          <Link
            href="/studio"
            className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white transition-all font-bold"
          >
            End Call
          </Link>
        </div>
      </header>

      {/* 2. MAIN STAGE: 2-WAY CAM TILES (TOP) + SHARED SCREEN (CENTER) */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-[1600px] w-full mx-auto">
        
        {/* SHARED SCREEN WORKSPACE (Left 3 Columns) */}
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
                {Array.from({ length: 48 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      hasAppliedFix ? "bg-teal-400" : (idx < 12 ? "bg-amber-400 animate-pulse" : "bg-slate-700")
                    }`}
                    style={{
                      height: `${hasAppliedFix ? 20 + 20 * Math.sin(idx * 0.4) : (idx < 12 ? 10 : 25 + 15 * Math.cos(idx * 0.5))}%`
                    }}
                  />
                ))}
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
          
          {/* 1. SUPPORT AGENT TILE (Elena Rostova) */}
          <div className={`p-3 rounded-2xl border transition-all ${
            activeSpeaker === "elena"
              ? "border-teal-400 bg-slate-900/90 shadow-xl shadow-teal-500/20"
              : "border-slate-800 bg-slate-950/90"
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono mb-2">
              <span className="text-teal-300 font-bold flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${activeSpeaker === "elena" ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
                ELENA ROSTOVA
              </span>
              <span className="text-slate-400 text-[10px]">Support Specialist</span>
            </div>

            {/* Video Box */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <video
                src="/assets/video/veo_aria_master.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                <Mic className={`w-3 h-3 ${activeSpeaker === "elena" ? "text-emerald-400 animate-bounce" : "text-slate-400"}`} />
                <span>Elena Rostova</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-teal-300">Natural Voice: 144 WPM</span>
              <span className="text-emerald-400">1080p 60fps</span>
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
                NITIN AGGARWAL
              </span>
              <button
                onClick={() => setIsUserCamActive(!isUserCamActive)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                {isUserCamActive ? <Camera className="w-3.5 h-3.5 text-cyan-400" /> : <CameraOff className="w-3.5 h-3.5" />}
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
                  : "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/20"
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
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title={isPlaying ? "Pause Session" : "Play Session"}
            >
              {isPlaying ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
            <button
              onClick={() => {
                setCurrentTime(0);
                setHasAppliedFix(false);
              }}
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
