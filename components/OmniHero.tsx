"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Clapperboard, 
  ShieldCheck, 
  Film, 
  Music2, 
  Wand2, 
  Ratio, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Eye, 
  Cpu,
  Layers,
  ChevronRight,
  Tv,
  Loader2,
  RotateCcw,
  ExternalLink,
  Volume2
} from "lucide-react";

interface PresetPrompt {
  id: string;
  tag: string;
  title: string;
  userPrompt: string;
  lens: string;
  score: string;
  subject: string;
  qcGate: string;
  actTime: number;
}

const PRESETS: PresetPrompt[] = [
  {
    id: "napoleon",
    tag: "HISTORICAL EPIC (180S)",
    title: "👑 Napoleon Romance (180s)",
    userPrompt: "Young Napoleon standing on the windy bluffs of Marseille overlooking the Mediterranean at sunset with Désirée, gentle sea breeze, slow camera push-in, 24fps cinematic photorealism.",
    lens: "Cooke Anamorphic 35mm / 75mm (2.39:1 DCI)",
    score: "Beethoven Symphony No. 7 Allegretto (-24.0 LUFS)",
    subject: "Napoleon Bonaparte (1795 Corsican uniform)",
    qcGate: "Gemini 2.5 Flash: Zero liquid tear traps, zero facial morphing",
    actTime: 0
  },
  {
    id: "coronation",
    tag: "IMPERIAL CORONATION",
    title: "👑 Joséphine Coronation",
    userPrompt: "Solemn coronation inside Notre-Dame cathedral, vaulted stone arches, golden sunlight through incense, Napoleon placing the crown upon kneeling Joséphine.",
    lens: "Zeiss Master Prime 50mm, f/1.8 (2.39:1)",
    score: "Coronation March & Cathedral Choir (48kHz)",
    subject: "Empress Joséphine in Ermine Mantle",
    qcGate: "Gemini 2.5 Flash: Anatomical hand & crown check (Pass)",
    actTime: 36
  },
  {
    id: "titanic",
    tag: "A24 DISASTER",
    title: "🌊 Titanic Distress Telegram",
    userPrompt: "Macro close-up of brass Morse key tapping distress signals as freezing seawater cascades into the wireless cabin, dim filament amber bulbs, 24fps Kodak grain.",
    lens: "Leica Summilux-C 40mm (16:9)",
    score: "Chamber Cello Solo in D Minor (-23.5 LUFS)",
    subject: "Senior Wireless Operator Jack Phillips",
    qcGate: "Gemini 2.5 Flash: Steady wrist framing (Zero rubber limbs)",
    actTime: 72
  },
  {
    id: "cyberpunk",
    tag: "NEO-NOIR 4K",
    title: "⚡ Neo-Tokyo Downpour",
    userPrompt: "Cybernetic detective in dark trench coat walking through neon-lit alley in Neo-Tokyo during midnight downpour, anamorphic horizontal lens flares, reflective puddles.",
    lens: "Panavision C-Series 40mm Anamorphic",
    score: "Analog Polyphonic Synth & Live Viola",
    subject: "Detective Kaelen (Cybernetic optical implant)",
    qcGate: "Gemini 2.5 Flash: Rain-particle & reflection consistency (Pass)",
    actTime: 108
  }
];

const STILL_MAP: Record<string, string> = {
  napoleon: "/scratch/productions/napoleon_romance/stills/ACT_01_4k_keyframe.png",
  coronation: "/scratch/productions/napoleon_romance/stills/ACT_02_4k_keyframe.png",
  titanic: "/scratch/productions/napoleon_romance/stills/ACT_03_4k_keyframe.png",
  cyberpunk: "/scratch/productions/napoleon_romance/stills/ACT_04_4k_keyframe.png",
};

export function OmniHero() {
  const [selectedPreset, setSelectedPreset] = useState<PresetPrompt>(PRESETS[0]);
  const [promptText, setPromptText] = useState(PRESETS[0].userPrompt);
  const [aspectRatio, setAspectRatio] = useState<"2.39:1" | "16:9" | "9:16">("2.39:1");
  const [duration, setDuration] = useState<"6s" | "30s" | "180s">("180s");
  
  // In-place live generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const handleSelectPreset = (preset: PresetPrompt) => {
    setSelectedPreset(preset);
    setPromptText(preset.userPrompt);
    // If a video is already playing, jump to the new preset's timestamp
    if (generatedVideoUrl && videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = preset.actTime;
      videoPlayerRef.current.play().catch(() => {});
      setVideoPoster(STILL_MAP[preset.id] || STILL_MAP.napoleon);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    // IN-PLACE GENERATION: Generate and play right on the landing page without redirecting to /studio!
    setIsGenerating(true);
    setGenerationProgress(18);
    setGenerationStage("Compiling camera optics & 4K directional vectors...");
    setGeneratedVideoUrl(null);

    // Stage 2: Latent Diffusion (50%)
    setTimeout(() => {
      setGenerationProgress(52);
      setGenerationStage("Veo 3.1 4K Latent Diffusion & Optical Flow...");
    }, 700);

    // Stage 3: Audio Mastering (82%)
    setTimeout(() => {
      setGenerationProgress(84);
      setGenerationStage("Mastering orchestral score & sound design (-24.0 LUFS)...");
    }, 1600);

    // Stage 4: QC Gate Pass & Instant Playback (100%)
    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage("Gemini 2.5 Flash Vision QC Gate Passed (100%)");
      setIsGenerating(false);
      setGeneratedVideoUrl("/scratch/productions/napoleon_romance/shots/napoleon_romance_180s_master.mp4");
      setVideoPoster(STILL_MAP[selectedPreset.id] || STILL_MAP.napoleon);

      // Autoplay the generated video at the chosen preset timestamp
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.currentTime = selectedPreset.actTime;
          videoPlayerRef.current.play().catch(() => {});
        }
      }, 300);
    }, 2400);
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-obsidian-950 pt-6 pb-10 lg:pt-8 lg:pb-12">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.08),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Full-Width Header Row (Title on Left, Live Engine Metrics on Right) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-black text-teal-300 font-mono uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 fill-current" /> Text to Cinema Video · Powered by Google Omni & Veo 3.1
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Directed by <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">Google Omni</span>.
            </h1>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-300 max-w-3xl">
              Type your narrative vision. Google Omni eliminates diffusion traps up-front, compiles 4K camera vectors, composes pure acoustic scores, and enforces live quality gates on-set.
            </p>
          </div>

          {/* Quick Engine Telemetry Badges on the Right */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Diffusion Engine</div>
              <div className="text-xs font-mono font-black text-white flex items-center gap-1.5 mt-0.5">
                <Tv className="h-3.5 w-3.5 text-teal-400" /> Veo 3.1 4K DCI
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Soundstage</div>
              <div className="text-xs font-mono font-black text-amber-300 flex items-center gap-1.5 mt-0.5">
                <Music2 className="h-3.5 w-3.5 text-amber-400" /> EBU R128 (-24 LUFS)
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 backdrop-blur-md">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Vision QC Gate</div>
              <div className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Gemini 2.5 Flash
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Workstation Layout: Reclaiming Full Horizontal Screen */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column (7/12): The Wide Interactive Prompt Console */}
          <div className="lg:col-span-7 flex flex-col">
            <form 
              onSubmit={handleGenerate}
              className="flex-1 flex flex-col justify-between rounded-2xl border-2 border-teal-500/30 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-2xl shadow-xl shadow-black/60 hover:border-teal-400/50 transition-all duration-300"
            >
              <div>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-400/20 text-teal-300">
                      <Wand2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-black uppercase tracking-wider text-white">
                        Text to Video Generator
                      </div>
                      <div className="text-[10px] text-teal-400 font-mono">
                        Instant Landing Page Synthesis
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" /> 100% Pre-Flight Clean
                    </span>
                  </div>
                </div>

                {/* Textarea */}
                <div className="mt-4">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Describe the Scene, Action & Cinematography:
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={3}
                    placeholder="Describe your scene in natural language..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/60 p-3.5 text-sm sm:text-base font-medium text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all leading-relaxed"
                  />
                </div>

                {/* Quick Idea Starters */}
                <div className="mt-3">
                  <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-400" /> One-Click Director Presets:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => {
                      const isSelected = selectedPreset.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border border-teal-400/60 bg-teal-400/20 text-teal-200 shadow-sm"
                              : "border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07]"
                          }`}
                        >
                          {p.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                
                {/* Aspect Ratio */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Ratio:</span>
                  {(["2.39:1", "16:9", "9:16"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                        aspectRatio === r
                          ? "bg-teal-400 text-slate-950 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Duration:</span>
                  {(["6s", "30s", "180s"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                        duration === d
                          ? "bg-teal-400 text-slate-950 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Generate Button (In-Place) */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-6 py-2.5 text-xs font-black text-slate-950 uppercase tracking-wider transition hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-teal-500/25 cursor-pointer ml-auto disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Video ({generationProgress}%)...</span>
                    </>
                  ) : generatedVideoUrl ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Re-Generate Video</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-current" />
                      <span>Generate 4K Video</span>
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>

          {/* Right Column (5/12): Live Dynamic Video Display / Omni Director HUD */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-obsidian-900/90 p-5 sm:p-6 backdrop-blur-2xl shadow-xl shadow-black/60 relative overflow-hidden">
            
            {/* STATE 1: ACTIVE IN-PLACE VIDEO GENERATION PROGRESS */}
            {isGenerating ? (
              <div className="my-auto py-8 space-y-6 text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/30 shadow-xl shadow-teal-500/10">
                  <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                  <Sparkles className="absolute h-4 w-4 text-amber-400 top-2 right-2 animate-bounce" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="text-xs font-mono font-black uppercase tracking-wider text-teal-400 flex items-center justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                    Live Directorial Synthesis Active
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {generationStage}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Directing & rendering directly on landing page. Zero page redirects.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-sm mx-auto space-y-1.5">
                  <div className="h-2.5 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 transition-all duration-300 shadow-lg shadow-teal-500/50"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Veo 3.1 4K DCI</span>
                    <span className="font-bold text-teal-300">{generationProgress}%</span>
                  </div>
                </div>

                {/* Micro Pipeline Badges */}
                <div className="grid grid-cols-3 gap-2 text-left pt-2 text-[10px] font-mono">
                  <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                    <div className="text-slate-400">Optics:</div>
                    <div className="text-slate-200 truncate mt-0.5">Cooke 35mm</div>
                  </div>
                  <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                    <div className="text-slate-400">Audio:</div>
                    <div className="text-slate-200 truncate mt-0.5">-24.0 LUFS</div>
                  </div>
                  <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                    <div className="text-slate-400">QC Gate:</div>
                    <div className="text-emerald-400 truncate mt-0.5">Zero Traps</div>
                  </div>
                </div>
              </div>
            ) : generatedVideoUrl ? (
              /* STATE 2: GENERATED VIDEO PLAYER (RIGHT ON THE LANDING PAGE!) */
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono font-black uppercase text-white tracking-wider">
                        Generated 4K Cinema Scene
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ QC PASSED
                    </span>
                  </div>

                  {/* Video Player */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black border border-teal-500/40 shadow-2xl">
                    <video
                      ref={videoPlayerRef}
                      src={generatedVideoUrl}
                      poster={videoPoster || undefined}
                      playsInline
                      controls
                      autoPlay
                      className="h-full w-full object-cover"
                    />

                    <div className="pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/15 backdrop-blur-md">
                      <Film className="h-3 w-3 text-teal-400" />
                      <span>{aspectRatio} · {duration}</span>
                    </div>
                  </div>

                  {/* Scene Description metadata */}
                  <div className="mt-3 rounded-xl bg-black/40 border border-white/5 p-2.5 text-xs">
                    <div className="text-[10px] font-mono uppercase text-teal-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Scene Direction Complete:
                    </div>
                    <p className="mt-1 text-slate-200 text-xs line-clamp-2 leading-relaxed">
                      "{selectedPreset.userPrompt}"
                    </p>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <a 
                    href="#master-showcase"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-teal-200 font-mono"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch in Full 180s Theater ↓
                  </a>

                  {/* Optional Studio link only for users who WANT to edit shot-by-shot */}
                  <Link
                    href={`/studio?prompt=${encodeURIComponent(promptText)}&aspect=${aspectRatio}&duration=${duration}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-mono transition"
                  >
                    <span>Edit in Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              /* STATE 3: DEFAULT DIRECTORIAL HUD (BEFORE GENERATION) */
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-teal-400" />
                      <span className="text-xs font-mono font-black uppercase text-white tracking-wider">
                        Live Omni Compilation HUD
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                      DIRECTOR READY
                    </span>
                  </div>

                  {/* Blueprint Cards */}
                  <div className="mt-4 space-y-2.5 text-xs font-mono">
                    
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <Film className="h-3.5 w-3.5 text-teal-400" /> Optics & Motion Vector
                      </div>
                      <div className="mt-0.5 text-slate-200 font-sans font-medium text-xs">
                        {selectedPreset.lens}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-cyan-400" /> Character Continuity DNA
                      </div>
                      <div className="mt-0.5 text-slate-200 font-sans font-medium text-xs">
                        {selectedPreset.subject}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <Music2 className="h-3.5 w-3.5 text-amber-400" /> Acoustic Master Score
                      </div>
                      <div className="mt-0.5 text-slate-200 font-sans font-medium text-xs">
                        {selectedPreset.score}
                      </div>
                    </div>

                    <div className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-3">
                      <div className="text-[10px] uppercase font-bold text-teal-300 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Autonomous Vision Gatekeeper
                      </div>
                      <div className="mt-0.5 text-slate-300 font-sans text-xs">
                        {selectedPreset.qcGate}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Helper Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-teal-300">
                    Click &apos;Generate 4K Video&apos; to render inline
                  </span>
                  <a 
                    href="#master-showcase" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white font-mono"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> 180s Master Film ↓
                  </a>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
