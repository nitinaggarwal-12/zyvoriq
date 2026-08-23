"use client";

import React, { useState } from "react";
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
  Download, 
  Share2, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Maximize2, 
  Sliders, 
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function StudioPage() {
  const [activePane, setActivePane] = useState<"all" | "narrative" | "video" | "audio" | "diagram">("all");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [selectedLanguage, setSelectedLanguage] = useState("English (US - Studio Master)");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const scenes = [
    {
      id: 1,
      title: "Scene 1: The Bottleneck Hook",
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

      <main className="mx-auto max-w-8xl px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Top Title Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Multimodal Studio (4-Pane Synchronized Canvas)
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Real-time synchronized editor across narrative copy, Veo 2 cinematic video storyboards, DeepMind 5-band neural audio stems, and Draw.io architecture vector diagrams.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 text-xs font-semibold">
              <span className="px-2 text-slate-400">Aspect Ratio:</span>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`rounded-lg px-2.5 py-1 ${aspectRatio === "9:16" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                9:16 Shorts
              </button>
              <button
                onClick={() => setAspectRatio("16:9")}
                className={`rounded-lg px-2.5 py-1 ${aspectRatio === "16:9" ? "bg-indigo-500 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                16:9 Widescreen
              </button>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95">
              <Share2 className="h-3.5 w-3.5" />
              <span>Omnichannel Dispatch</span>
            </button>
          </div>
        </div>

        {/* 4-Pane Synchronized Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8">
          
          {/* PANE 1: Narrative & Script Editor (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <FileText className="h-4 w-4" />
                <span>Pane 1: Narrative &amp; Storyboard Script (Claude 3.5 Sonnet)</span>
              </div>
              <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800/40">
                Persona Tone: 0.94 Cosine
              </span>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              {scenes.map((scene) => (
                <div key={scene.id} className="rounded-xl border border-slate-800/80 bg-obsidian-950/80 p-4">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-mono text-xs font-bold text-indigo-300">{scene.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400">✓ Fact Anchored</span>
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
              <span className="rounded bg-pink-950 px-2 py-0.5 text-[10px] font-mono text-pink-300 border border-pink-800/40">
                1080p 60fps HDR
              </span>
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
              {/* Language Selector */}
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
                  <option>French (FR - Parisian Studio)</option>
                </select>
              </div>

              {/* Waveform Stems */}
              <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-300">Vocal Waveform &amp; Gold Karaoke Sync</span>
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono text-emerald-300 hover:bg-emerald-500/30"
                  >
                    {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                    <span>{isPlayingAudio ? "Pause Stem" : "Preview Stem"}</span>
                  </button>
                </div>

                {/* Simulated Audio Bars */}
                <div className="flex items-center gap-1 h-12 py-2">
                  {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 100, 50, 70, 90, 35, 85, 60, 45, 95, 70, 80, 55, 65, 90, 40].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-500/40 to-teal-400 rounded-full transition-all duration-150"
                      style={{ height: `${isPlayingAudio ? Math.min(100, h + Math.random() * 20) : h}%` }}
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
                <span>Pane 4: Draw.io Vector Diagram Canvas (mxGraph AST)</span>
              </div>
              <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-800/40">
                2D Auto-Healed (30px Pad)
              </span>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <div className="rounded-xl border border-slate-800 bg-obsidian-950 p-4">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-mono font-bold text-amber-300">Generated XML Graph Coordinates</span>
                  <span className="text-[10px] font-mono text-emerald-400">✓ 0 Node Collisions</span>
                </div>

                <pre className="text-[11px] font-mono text-slate-300/90 leading-relaxed overflow-x-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
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
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
