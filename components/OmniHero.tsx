"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronRight
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
    title: "Napoleon: The Emperor's Heart",
    userPrompt: "Young Napoleon standing on the windy bluffs of Marseille overlooking the Mediterranean at sunset with Désirée, gentle sea breeze, slow camera push-in, 24fps cinematic photorealism.",
    lens: "Cooke Anamorphic 35mm / 75mm (2.39:1)",
    score: "Beethoven Symphony No. 7 Allegretto (-24.0 LUFS)",
    subject: "Napoleon Bonaparte (1795 Corsican uniform)",
    qcGate: "Gemini 2.5 Flash: Zero liquid tear traps, zero morphing",
    actTime: 0
  },
  {
    id: "coronation",
    tag: "IMPERIAL CORONATION",
    title: "Joséphine Crowned Empress",
    userPrompt: "Solemn coronation inside Notre-Dame cathedral, vaulted stone arches, golden sunlight through incense, Napoleon placing the crown upon kneeling Joséphine.",
    lens: "Zeiss Master Prime 50mm, f/1.8",
    score: "Coronation March & Cathedral Choir (48kHz)",
    subject: "Empress Joséphine in Ermine Mantle",
    qcGate: "Gemini 2.5 Flash: Anatomical hand & crown check (Pass)",
    actTime: 36
  },
  {
    id: "titanic",
    tag: "A24 DISASTER",
    title: "Titanic: Final Distress Telegram",
    userPrompt: "Macro close-up of brass Morse key tapping distress signals as freezing seawater cascades into the wireless cabin, dim filament amber bulbs, 24fps Kodak grain.",
    lens: "Leica Summilux-C 40mm",
    score: "Chamber Cello Solo in D Minor (-23.5 LUFS)",
    subject: "Senior Wireless Operator Jack Phillips",
    qcGate: "Gemini 2.5 Flash: Steady wrist framing (Zero rubber limbs)",
    actTime: 72
  },
  {
    id: "cyberpunk",
    tag: "NEO-NOIR 4K",
    title: "District 9: Rain in Neo-Tokyo",
    userPrompt: "Cybernetic detective in dark trench coat walking through neon-lit alley in Neo-Tokyo during midnight downpour, anamorphic horizontal lens flares, reflective puddles.",
    lens: "Panavision C-Series 40mm Anamorphic",
    score: "Analog Polyphonic Synth & Live Viola",
    subject: "Detective Kaelen (Cybernetic optical implant)",
    qcGate: "Gemini 2.5 Flash: Rain-particle & reflection consistency (Pass)",
    actTime: 108
  }
];

export function OmniHero() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<PresetPrompt>(PRESETS[0]);
  const [promptText, setPromptText] = useState(PRESETS[0].userPrompt);
  const [aspectRatio, setAspectRatio] = useState<"2.39:1" | "16:9" | "9:16">("2.39:1");
  const [duration, setDuration] = useState<"6s" | "30s" | "180s">("180s");
  const [isCompiling, setIsCompiling] = useState(false);

  const handleSelectPreset = (preset: PresetPrompt) => {
    setSelectedPreset(preset);
    setPromptText(preset.userPrompt);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsCompiling(true);
    const query = new URLSearchParams({
      prompt: promptText,
      aspect: aspectRatio,
      duration: duration
    }).toString();
    router.push(`/studio/create?${query}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-obsidian-950 pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[650px] bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.20),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.08),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-14 xl:px-16">
        
        {/* Top Badging & Headline */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-black text-teal-300 font-mono uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 fill-current" /> Text to Cinema Video · Powered by Google Omni & Veo 3.1
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Directed by <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">Google Omni</span>.
          </h1>

          <p className="mt-4 text-base sm:text-xl leading-relaxed text-slate-400 max-w-3xl">
            Type any story vision. Google Omni eliminates diffusion traps up-front, directs Veo 3.1 4K camera plates, composes pure classical scores, and enforces real-time on-set quality gates.
          </p>
        </div>

        {/* Spacious 2-Column Director Interface */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7/12): The Interactive Prompt Console */}
          <div className="lg:col-span-7">
            <form 
              onSubmit={handleGenerate}
              className="rounded-[28px] border-2 border-teal-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80 hover:border-teal-400/50 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-400/20 text-teal-300">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-black uppercase tracking-wider text-white">
                      Text to Video Generator
                    </div>
                    <div className="text-[10px] text-teal-400 font-mono">
                      Veo 3.1 4K Diffusion Pipeline
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
              <div className="mt-5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Describe the Scene, Action & Cinematography:
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={4}
                  placeholder="Describe your scene in natural language..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/60 p-4 text-base sm:text-lg font-medium text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all leading-relaxed"
                />
              </div>

              {/* Quick Idea Starters */}
              <div className="mt-4">
                <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
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
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? "border border-teal-400/60 bg-teal-400/20 text-teal-200 shadow-sm"
                            : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07]"
                        }`}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                
                {/* Aspect Ratio */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Ratio:</span>
                  {(["2.39:1", "16:9", "9:16"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
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
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                        duration === d
                          ? "bg-teal-400 text-slate-950 shadow-sm"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isCompiling}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-6 py-3 text-xs font-black text-slate-950 uppercase tracking-wider transition hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-teal-500/25 cursor-pointer ml-auto"
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                  {isCompiling ? "Compiling..." : "Generate Video"}
                </button>

              </div>
            </form>
          </div>

          {/* Right Column (5/12): Live Omni Director Blueprint HUD */}
          <div className="lg:col-span-5 rounded-[28px] border border-white/10 bg-obsidian-900/90 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl shadow-black/80">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-mono font-black uppercase text-white tracking-wider">
                  Live Omni Compilation HUD
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                ACTIVE DIRECTIVE
              </span>
            </div>

            {/* Blueprint Cards */}
            <div className="mt-5 space-y-3.5 text-xs font-mono">
              
              <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-teal-400" /> Optics & Motion Vector
                </div>
                <div className="mt-1 text-slate-200 font-sans font-medium text-xs leading-relaxed">
                  {selectedPreset.lens}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" /> Character Continuity DNA
                </div>
                <div className="mt-1 text-slate-200 font-sans font-medium text-xs leading-relaxed">
                  {selectedPreset.subject}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-3.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Music2 className="h-3.5 w-3.5 text-amber-400" /> Acoustic Master Score
                </div>
                <div className="mt-1 text-slate-200 font-sans font-medium text-xs leading-relaxed">
                  {selectedPreset.score}
                </div>
              </div>

              <div className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-3.5">
                <div className="text-[10px] uppercase font-bold text-teal-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Autonomous Vision Gatekeeper
                </div>
                <div className="mt-1 text-slate-300 font-sans text-xs leading-relaxed">
                  {selectedPreset.qcGate}
                </div>
              </div>

            </div>

            {/* Quick Link to Watch this Shot */}
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
              <a 
                href="#master-showcase" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-teal-200 font-mono"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Preview in Master Theater
              </a>
              <span className="text-[10px] font-mono text-slate-400">180s Master Ready</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
