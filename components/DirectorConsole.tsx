"use client";

import React, { useState } from "react";
import {
  Terminal,
  Sparkles,
  GitBranch,
  FileText,
  Video,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from "lucide-react";

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  promptExample: string;
  tasteVector: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "architect",
    name: "Elena Rostova",
    role: "Chief Architect & Distributed Systems",
    promptExample:
      "Deconstruct our event-driven microservices architecture into a technical whitepaper, system diagram, and LinkedIn engineering breakdown.",
    tasteVector: ["Rigorous Systems Thinking", "Zero Marketing Fluff", "Quantified Latencies & SLOs"],
  },
  {
    id: "founder",
    name: "Marcus Vance",
    role: "Product Strategist & Founder",
    promptExample:
      "Synthesize our PRD-000 and QGV-001 documentation into an executive product briefing, investor update, and multi-format launch campaign.",
    tasteVector: ["Visionary Narrative", "Outcome-Driven ROI", "Clear Market Differentiation"],
  },
  {
    id: "thought_leader",
    name: "Dr. Aris Thorne",
    role: "AI Researcher & Thought Leader",
    promptExample:
      "Turn our benchmark evals on agentic memory and hallucination auto-repair into a viral technical essay and visual infographic.",
    tasteVector: ["Contrarian Insights", "Empirical Evidence", "High-Craft Storytelling"],
  },
];

export function DirectorConsole() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [promptText, setPromptText] = useState(PERSONAS[0].promptExample);
  const [sourceType, setSourceType] = useState<"repo" | "pdf" | "video" | "voice">("repo");
  const [sourceValue, setSourceValue] = useState("https://github.com/nitinaggarwal-12/zyvoriq");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineComplete, setPipelineComplete] = useState(true);
  const [activeOutputTab, setActiveOutputTab] = useState<
    "master" | "diagram" | "video" | "article" | "social" | "veritas"
  >("master");

  const handlePersonaChange = (p: PersonaConfig) => {
    setSelectedPersona(p);
    setPromptText(p.promptExample);
  };

  const handleRunDirector = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPipelineComplete(true);
    }, 900);
  };

  return (
    <section id="director" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-300 border border-teal-500/20">
            <Terminal className="h-3.5 w-3.5" />
            <span>PRD-101 // UNIVERSAL CREATE & DIRECTOR</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Zyvoriq Director Console
          </h2>
          <p className="mt-2 max-w-2xl text-base text-slate-400">
            Ingest repositories, PRDs, or architecture notes. Ground with persistent persona memory, synthesize master stories, and compile native multi-channel media with automated Veritas quality gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Autonomy Tier:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-950/40 px-3 py-1 text-xs font-bold text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Tier 2: Approval Gate
          </span>
        </div>
      </div>

      {/* Main Console Frame */}
      <div className="mt-10 rounded-3xl border border-slate-800 bg-obsidian-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Top Control Bar: Persona Selection */}
        <div className="border-b border-slate-800/80 bg-slate-950/70 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                1. Select Grounded Persona & Taste Vector (PRD-102)
              </span>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {PERSONAS.map((p) => {
                  const isActive = selectedPersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePersonaChange(p)}
                      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? "border border-teal-500/50 bg-teal-950/50 text-teal-200 shadow-md shadow-teal-500/10"
                          : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isActive ? "bg-teal-400 animate-pulse" : "bg-slate-600"
                        }`}
                      />
                      <span>{p.name}</span>
                      <span className="hidden sm:inline text-[10px] text-slate-500 font-normal">
                        ({p.role.split("&")[0]})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Taste Vector Pills */}
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Active Taste Constraints
              </span>
              <div className="mt-1.5 flex gap-1.5">
                {selectedPersona.tasteVector.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Form & Ingestion Bar */}
        <form onSubmit={handleRunDirector} className="p-6 md:p-8">
          <div className="flex flex-col gap-5">
            {/* Multimodal Source Attachment Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-400">
                  Ingest Source:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("repo");
                      setSourceValue("https://github.com/nitinaggarwal-12/zyvoriq");
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      sourceType === "repo"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>Git Repo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("pdf");
                      setSourceValue("Zyvoriq_Product_Engineering_Documentation_Blueprint.md");
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      sourceType === "pdf"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>PRD / Spec</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("video");
                      setSourceValue("loom_architecture_walkthrough_v1.mp4");
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      sourceType === "video"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Video / Loom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("voice");
                      setSourceValue("audio_voice_memo_architecture_rfc.m4a");
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      sourceType === "voice"
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Voice Memo</span>
                  </button>
                </div>
              </div>

              {/* Source Value Badge */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1 text-xs font-mono text-slate-300">
                <span className="text-teal-400">URI:</span>
                <span className="truncate max-w-[280px] sm:max-w-md">{sourceValue}</span>
              </div>
            </div>

            {/* Prompt Instruction Input */}
            <div className="relative">
              <label htmlFor="director-prompt" className="sr-only">
                Director Prompt Instructions
              </label>
              <textarea
                id="director-prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-4 font-sans text-base text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                placeholder="What impact or artifact do you want Zyvoriq to generate?"
              />
            </div>

            {/* Footer Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                  QGV-001 Gate Active
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Veritas Auto-Repair On
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-teal-500/30 active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Lifecycle Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Synthesize Master Story & Modalities</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Live Execution Pipeline Output Area */}
        {pipelineComplete && (
          <div className="border-t border-slate-800 bg-slate-950/95 p-6 md:p-8">
            {/* Output Sub-Header with Modality Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Pipeline Execution Complete • 1 Master Story → 5 Modalities
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Target: {selectedPersona.name} ({selectedPersona.role})
                </div>
              </div>

              {/* Modality Output Tabs */}
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
                {[
                  { id: "master", label: "Master Story", icon: Layers },
                  { id: "diagram", label: "Architecture Graph", icon: Code2 },
                  { id: "video", label: "Video Storyboard", icon: Video },
                  { id: "article", label: "Technical Article", icon: FileText },
                  { id: "social", label: "Authority Carousel", icon: Share2 },
                  { id: "veritas", label: "Veritas QA (99.8%)", icon: CheckCircle2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeOutputTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveOutputTab(tab.id as any)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-teal-400 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Output Viewer Box */}
            <div className="mt-6 rounded-2xl border border-slate-800/80 bg-obsidian-900/90 p-6">
              {activeOutputTab === "master" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase text-teal-400 font-bold">
                      CANONICAL MASTER STORY OBJECT (PRD-101)
                    </span>
                    <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-mono text-teal-300">
                      ID: MSO-2026-8829-Z
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    The Death of Unverified AI Content: How Zyvoriq Replaces Hallucination With Evidence Graphs
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Modern AI content generators flood platforms with unverified, synthetic slop that alienates technical and enterprise audiences. Zyvoriq introduces a dual-engine architecture separating generation from judgment, enforcing verifiable claim attribution and multi-modal consistency before single-token publication.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Core Claims Verified</span>
                      <div className="text-lg font-bold text-teal-300 font-mono">14 / 14 Claims</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Quality Index (QGV-001)</span>
                      <div className="text-lg font-bold text-emerald-300 font-mono">99.8 / 100</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Persona Fidelity</span>
                      <div className="text-lg font-bold text-cyan-300 font-mono">100% Grounded</div>
                    </div>
                  </div>
                </div>
              )}

              {activeOutputTab === "diagram" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                      GENERATED SYSTEM ARCHITECTURE DIAGRAM (PRD-105)
                    </span>
                    <span className="text-xs font-mono text-slate-400">Interactive SVG Topology</span>
                  </div>

                  {/* Interactive SVG Diagram Component */}
                  <div className="relative overflow-x-auto rounded-xl border border-slate-800/80 bg-obsidian-950 p-4">
                    <svg
                      viewBox="0 0 800 240"
                      className="w-full min-w-[700px] h-auto font-mono text-xs"
                    >
                      {/* Connections */}
                      <path d="M 140 120 L 260 120" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4,4" />
                      <path d="M 380 120 L 500 120" stroke="#10b981" strokeWidth="2" />
                      <path d="M 620 120 L 710 70" stroke="#6366f1" strokeWidth="2" />
                      <path d="M 620 120 L 710 170" stroke="#06b6d4" strokeWidth="2" />

                      {/* Node 1: Ingestion & Repo */}
                      <rect x="20" y="80" width="120" height="80" rx="12" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
                      <text x="80" y="115" fill="#f8fafc" textAnchor="middle" fontWeight="bold">Source Ingest</text>
                      <text x="80" y="135" fill="#14b8a6" textAnchor="middle" fontSize="10">Repo + PRD</text>

                      {/* Node 2: Director Brain */}
                      <rect x="260" y="70" width="120" height="100" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                      <text x="320" y="110" fill="#f8fafc" textAnchor="middle" fontWeight="bold">Zyvoriq Brain</text>
                      <text x="320" y="130" fill="#10b981" textAnchor="middle" fontSize="10">PRD-101 / 102</text>
                      <text x="320" y="148" fill="#94a3b8" textAnchor="middle" fontSize="9">Master Story</text>

                      {/* Node 3: Veritas Verifier */}
                      <rect x="500" y="70" width="120" height="100" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                      <text x="560" y="110" fill="#f8fafc" textAnchor="middle" fontWeight="bold">Veritas QA</text>
                      <text x="560" y="130" fill="#34d399" textAnchor="middle" fontSize="10">Auto-Repair Gate</text>
                      <text x="560" y="148" fill="#94a3b8" textAnchor="middle" fontSize="9">99.8% Pass</text>

                      {/* Output Nodes */}
                      <rect x="700" y="40" width="90" height="55" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="745" y="72" fill="#c7d2fe" textAnchor="middle" fontSize="11" fontWeight="bold">Video/Audio</text>

                      <rect x="700" y="145" width="90" height="55" rx="8" fill="#083344" stroke="#06b6d4" strokeWidth="1.5" />
                      <text x="745" y="177" fill="#a5f3fc" textAnchor="middle" fontSize="11" fontWeight="bold">Articles/Social</text>
                    </svg>
                  </div>
                </div>
              )}

              {activeOutputTab === "video" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
                      EXECUTIVE VIDEO STORYBOARD & NEURAL VOICE SPEC (PRD-107 / PRD-106)
                    </span>
                    <span className="text-xs font-mono text-emerald-400">Duration: 62s • 4 Scenes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        scene: "Scene 1 (0:00 - 0:14)",
                        hook: "The Synthetic Hallucination Problem",
                        visual: "Close-up on noisy AI text feed dissolving into red anomaly warning.",
                        voice: "Authoritative, deliberate pacing: '94% of enterprise AI content fails technical review.'",
                      },
                      {
                        scene: "Scene 2 (0:15 - 0:28)",
                        hook: "Deconstructing Source Truth",
                        visual: "3D exploding diagram of code repository merging into canonical master graph.",
                        voice: "Dynamic rise in tone: 'Zyvoriq anchors story in actual Git commits and PRD constraints.'",
                      },
                      {
                        scene: "Scene 3 (0:29 - 0:45)",
                        hook: "Veritas Quality Auto-Healing",
                        visual: "Green laser scan resolving conflicting claims in real-time.",
                        voice: "Crisp and confident: 'Separating generation from evaluation guarantees zero slop.'",
                      },
                      {
                        scene: "Scene 4 (0:46 - 1:02)",
                        hook: "Multi-Channel Impact",
                        visual: "Instant branching into LinkedIn carousel, technical RFC, and YouTube keynote.",
                        voice: "Call-to-action tone: 'Turn engineering truth into impact.'",
                      },
                    ].map((s) => (
                      <div key={s.scene} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-[10px] font-mono text-teal-400 uppercase font-bold">{s.scene}</div>
                        <div className="mt-1 text-xs font-bold text-white">{s.hook}</div>
                        <div className="mt-2 text-[11px] text-slate-400">
                          <span className="text-slate-500 font-mono">Visual:</span> {s.visual}
                        </div>
                        <div className="mt-2 rounded bg-slate-900/90 p-2 text-[11px] text-slate-300 italic border-l-2 border-teal-400">
                          {s.voice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeOutputTab === "article" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-teal-400 uppercase font-bold">
                      TECHNICAL RFC / SUBSTACK DEEP DIVE (PRD-104)
                    </span>
                    <span className="text-slate-400">Word Count: 1,420 • Read Time: 6 min</span>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4 text-slate-300 leading-relaxed font-sans text-sm space-y-3">
                    <h4 className="text-base font-bold text-white font-mono">
                      ## Architectural Separation of Generative Synthesis & Truth Verification
                    </h4>
                    <p>
                      In typical LLM pipelines, single-pass generation conflates creative synthesis with fact verification. In high-stakes technical domains, this failure mode results in subtle, dangerous hallucinations (e.g. fabricated API flags or non-existent benchmark numbers).
                    </p>
                    <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-teal-300 border border-slate-800">
                      <code>
                        {`// Zyvoriq Veritas Pipeline Contract
interface ClaimVerificationGate {
  claimId: string;
  sourceAttribution: GitReference | PRDSpec;
  confidenceScore: number; // Must be >= 0.95 for QG-PRD-01
  autoRepaired: boolean;
}`}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeOutputTab === "social" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase text-indigo-300 font-bold">
                      LINKEDIN & X HIGH-AUTHORITY CAROUSEL SLIDES (PRD-109)
                    </span>
                    <span className="text-xs text-slate-400">5 Slides • Native Typography & Formatting</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { num: "01", title: "The Problem", text: "Why 94% of AI content gets ignored by serious engineers." },
                      { num: "02", title: "The Root Cause", text: "Conflating creative generation with fact evaluation." },
                      { num: "03", title: "The Solution", text: "Separating Director synthesis from Veritas QA gates." },
                      { num: "04", title: "The Architecture", text: "1 Master Story Object → 8 Native Modalities." },
                      { num: "05", title: "Key Takeaway", text: "High craft is impossible without automated proof." },
                    ].map((slide) => (
                      <div
                        key={slide.num}
                        className="aspect-[4/5] rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center text-xs font-mono text-teal-400 font-bold">
                          <span>SLIDE {slide.num}</span>
                          <span>ZYVORIQ</span>
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-white">{slide.title}</div>
                          <div className="mt-2 text-[11px] text-slate-400 leading-snug">{slide.text}</div>
                        </div>
                        <div className="text-[9px] font-mono text-slate-600">@elena_rostova</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeOutputTab === "veritas" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                      VERITAS AUTO-REPAIR AUDIT LOG (PRD-108 / QGV-001)
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-mono text-emerald-300">
                      Zero Open Blockers • Ready to Publish
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        claim: "Claim #1: Latency SLA claimed as 'sub-10ms' across all multi-region nodes.",
                        issue: "Ambiguous NFR constraint contradicted in ARC-001 §3.4 (P99 is 45ms).",
                        fix: "Auto-repaired to 'P99 <45ms multi-region and <10ms edge caching' with direct citation to ARC-001.",
                        status: "Auto-Repaired",
                      },
                      {
                        claim: "Claim #2: Next.js 15 breaking changes in async request headers.",
                        issue: "Unverified API syntax in initial draft.",
                        fix: "Cross-checked against internal Next.js 15 docs; added await headers() syntax.",
                        status: "Verified & Hardened",
                      },
                      {
                        claim: "Claim #3: Rights & provenance citation for diagram architecture.",
                        issue: "Missing copyright license reference.",
                        fix: "Injected TRU-001 Open Source attribution metadata.",
                        status: "Verified",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-800/80 bg-slate-950 p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{item.claim}</div>
                          <div className="text-slate-400">
                            <span className="text-amber-400 font-mono">Finding:</span> {item.issue}
                          </div>
                          <div className="text-teal-300">
                            <span className="text-emerald-400 font-mono">Veritas Resolution:</span> {item.fix}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-300">
                          ✓ {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
