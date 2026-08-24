"use client";

import React, { useState, useRef } from "react";
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
  ShieldCheck
} from "lucide-react";

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<"4pane" | "cloning">("4pane");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [selectedLanguage, setSelectedLanguage] = useState("English (US - Studio Master Baritone)");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [diagramZoom, setDiagramZoom] = useState(1);
  const [activeTabDiagram, setActiveTabDiagram] = useState<"visual" | "xml">("visual");

  // Video & Avatar Cloning State
  const [selectedAvatar, setSelectedAvatar] = useState("avatar_1");
  const [cloningStatus, setCloningStatus] = useState<"ready" | "calibrating" | "rendered">("ready");
  const [lipSyncPrecision, setLipSyncPrecision] = useState(99.8);
  const [gazeTracking, setGazeTracking] = useState(true);
  const [emotionTone, setEmotionTone] = useState("Authoritative Technical Master");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

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
        console.error("Audio playback error", e);
        setIsPlayingAudio(true);
      }
    }
  };

  const avatars = [
    {
      id: "avatar_1",
      name: "Dr. Evelyn Vance",
      title: "Chief AI Architect",
      faceMesh: "468-point 3D Morphable Mesh",
      resolution: "4K 60fps Ultra-HDR",
      status: "Calibrated & Signed",
      tag: "Executive Master",
    },
    {
      id: "avatar_2",
      name: "Marcus Aurelius Tech",
      title: "VP Developer Relations",
      faceMesh: "Neural Radiance Field (NeRF)",
      resolution: "1080p 60fps HDR",
      status: "Calibrated & Signed",
      tag: "Technical Keynote",
    },
    {
      id: "avatar_3",
      name: "Alex Rivera",
      title: "Security & Cryptography Lead",
      faceMesh: "Gaussian Splatting Avatar",
      resolution: "4K 60fps HDR",
      status: "Calibrated & Signed",
      tag: "Live Demo Clone",
    },
  ];

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

  const handleTriggerClone = () => {
    setCloningStatus("calibrating");
    setTimeout(() => {
      setCloningStatus("rendered");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <AppNavbar />

      <main className="mx-auto max-w-8xl px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Top Title & Studio Switcher Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Multimodal Studio &amp; AI Video Cloning
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Switch between the synchronized 4-Pane Multi-Modal Canvas and the photorealistic AI Executive Avatar &amp; Video Face/Voice Cloning Enclave.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
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
              <button
                onClick={() => setStudioMode("cloning")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  studioMode === "cloning"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>AI Video Cloning &amp; Avatars</span>
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
        {/* MODE A: AI VIDEO CLONING & AVATAR STUDIO SECTION     */}
        {/* ---------------------------------------------------- */}
        {studioMode === "cloning" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
            
            {/* LEFT: Avatar Selection & Calibration Parameters (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Executive Avatar Vault */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                    <UserCheck className="h-4 w-4" />
                    <span>Executive Persona &amp; Face Vault</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">3 Clones Ready</span>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  {avatars.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        selectedAvatar === av.id
                          ? "border-pink-500 bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 shadow-md shadow-pink-500/10"
                          : "border-slate-800 bg-obsidian-950/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-mono font-black text-sm border border-pink-500/30">
                            {av.name.slice(0, 2).toUpperCase()}
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

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                        <span>{av.faceMesh}</span>
                        <span className="text-emerald-400">{av.resolution}</span>
                      </div>
                    </div>
                  ))}

                  {/* Upload Custom Clone */}
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-obsidian-950/40 p-4 text-xs font-mono text-slate-300 hover:border-pink-500 hover:text-pink-300 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload 10-sec Calibration Video (.mp4 / .mov)</span>
                  </button>
                </div>
              </div>

              {/* Neural Synthesis Controls */}
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                    <Sliders className="h-4 w-4" />
                    <span>Lip-Sync &amp; Gaze Tuning</span>
                  </div>
                  <span className="text-xs font-mono text-teal-300">Veo 2 Engine</span>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 pb-1">
                      <span>Lip-Sync Precision Formant:</span>
                      <span className="font-mono text-pink-400">{lipSyncPrecision}%</span>
                    </div>
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
                    <span className="text-xs font-semibold text-slate-300">Micro-Expression &amp; Eye Gaze:</span>
                    <button
                      onClick={() => setGazeTracking(!gazeTracking)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                        gazeTracking ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {gazeTracking ? "ENABLED (Natural Blink)" : "DISABLED"}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-300">Emotion &amp; Delivery Cadence:</span>
                    <select
                      value={emotionTone}
                      onChange={(e) => setEmotionTone(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-obsidian-950 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option>Authoritative Technical Master (Zero Fluff)</option>
                      <option>High-Energy Keynote Presentation</option>
                      <option>Executive Boardroom Briefing</option>
                      <option>Podcast Conversational Flow</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT: Live Video Clone Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[560px]">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                      <Camera className="h-4 w-4" />
                      <span>Live 4K Photorealistic Video Clone Viewport</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
                      <span className="text-xs font-mono text-pink-300">
                        {cloningStatus === "calibrating" ? "Rendering NeRF Mesh..." : "C2PA Verified Frame"}
                      </span>
                    </div>
                  </div>

                  {/* Photorealistic Canvas Preview */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-obsidian-950 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[340px] text-center">
                    
                    {/* Glowing Mesh Animation */}
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500/20 via-rose-500/10 to-indigo-500/20 border border-pink-500/40 shadow-2xl shadow-pink-500/20">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 font-mono text-2xl font-black text-pink-300 animate-pulse">
                        {selectedAvatar === "avatar_1" ? "EV" : selectedAvatar === "avatar_2" ? "MA" : "AR"}
                      </div>
                      <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-6 font-mono text-lg font-bold text-white">
                      {selectedAvatar === "avatar_1" ? "Dr. Evelyn Vance" : selectedAvatar === "avatar_2" ? "Marcus Aurelius Tech" : "Alex Rivera"}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 max-w-md font-sans">
                      &quot;Zyvoriq collapses traditional 14-day enterprise video pipelines into 90 seconds with Veritas claim-level cryptographic validation.&quot;
                    </p>

                    {/* C2PA Provenance Overlay Badge */}
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-[11px] font-mono text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>C2PA Watermark Embedded • Signed with Ed25519</span>
                    </div>
                  </div>
                </div>

                {/* Render Button */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    <span>Est. Synthesis: </span>
                    <span className="text-white font-bold">1.8 seconds (Veo 2 Engine)</span>
                  </div>

                  <button
                    onClick={handleTriggerClone}
                    disabled={cloningStatus === "calibrating"}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {cloningStatus === "calibrating" ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Rendering 4K Avatar Clone...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Synthesize 4K Video Clone</span>
                      </>
                    )}
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
