"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Flame,
  ArrowRight,
  Filter,
  BarChart3,
  Layers,
  Search,
  CheckCircle2,
  Calendar,
  Share2,
  Copy,
  ExternalLink,
  Target,
  Award
} from "lucide-react";
import {
  PREDICTED_TRENDS_RADAR,
  PredictedTrend,
  TrendCategory
} from "@/lib/reel/trendRadarEngine";
import { StudioSidebar } from "@/components/StudioSidebar";

const CATEGORIES: { id: TrendCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All Frontiers", icon: "🌐" },
  { id: "ai_tech", label: "AI & DeepTech", icon: "🤖" },
  { id: "b2b_career", label: "B2B & Career", icon: "💼" },
  { id: "wealth_finance", label: "Wealth & Finance", icon: "📈" },
  { id: "lifestyle_ugc", label: "Lifestyle & Biohacking", icon: "⚡" },
  { id: "academic_breakthrough", label: "Elite Academia", icon: "🎓" }
];

export default function TrendRadarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-teal-400 font-mono text-sm">Loading 7-Day Trend Radar...</div>}>
      <TrendRadarContent />
    </Suspense>
  );
}

function TrendRadarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopicId = searchParams?.get("topicId") || PREDICTED_TRENDS_RADAR[0].id;

  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | "all">("all");
  const [selectedTrend, setSelectedTrend] = useState<PredictedTrend>(() => {
    return PREDICTED_TRENDS_RADAR.find((t: PredictedTrend) => t.id === initialTopicId) || PREDICTED_TRENDS_RADAR[0];
  });
  const [activeTab, setActiveTab] = useState<"transpiler" | "contrarian" | "audiences">("transpiler");
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const filteredTrends = PREDICTED_TRENDS_RADAR.filter((item: PredictedTrend) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesCat;
  });

  const recipes = selectedTrend.transpiledRecipes;

  const handleLaunchInStudio = () => {
    const topic = `${selectedTrend.title}: ${selectedTrend.hookRecommendation.contrarianAngle}`;
    router.push(`/studio?mode=video_reel&topic=${encodeURIComponent(topic)}`);
  };

  const handleCopy = (text: string, actionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionName);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  return (
    <StudioSidebar>
      <div className="flex-1 min-w-0 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
        {/* Top Breadcrumbs & Stage Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-teal-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                  7-Day Predictive Trend Radar
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 text-xs font-bold text-teal-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  PRE-VIRAL INTELLIGENCE MINER
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Mining ArXiv, Stanford HAI, GitHub Stars, LinkedIn Pulse, Reddit & TikTok Search Vacuums 7 Days in Advance
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchInStudio}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-obsidian-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-obsidian-950 fill-current" />
              Launch Viral Reel in Timeline
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Zero-Gutter Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: 7-Day Horizon Picker & Feed Stream (4 cols) */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selectedCategory === cat.id
                      ? "bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Forecast Feed List */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                📡 Pre-Viral Signal Feed ({filteredTrends.length})
              </span>
              {filteredTrends.map((trend: PredictedTrend) => (
                <button
                  key={trend.id}
                  onClick={() => setSelectedTrend(trend)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedTrend.id === trend.id
                      ? "border-teal-500/50 bg-teal-500/10 text-white shadow-lg shadow-teal-500/5"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">
                      {trend.peakForecastDay}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      VOI: {trend.voiScore}/100
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-100">{trend.title}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">{trend.summary}</div>
                </button>
              ))}
            </div>
          </section>

          {/* CENTER STAGE: Viral Velocity & Contrarian Analysis (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Selected Topic Hero Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300">
                  {selectedTrend.sourcePlatform}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Lifecycle: <strong className="text-teal-400 uppercase">{selectedTrend.lifecycleStage.replace(/_/g, " ")}</strong>
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white font-mono leading-snug">
                  {selectedTrend.title}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedTrend.summary}
                </p>
              </div>

              {/* VOI Velocity Breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Search Velocity</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">+{selectedTrend.searchAccelerationPct}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Migration Lag</span>
                  <span className="text-base font-bold text-amber-400 font-mono">{selectedTrend.migrationLagDays} Days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Saturation</span>
                  <span className="text-base font-bold text-cyan-400 font-mono capitalize">{selectedTrend.saturationDensity.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>

            {/* Stage Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => setActiveTab("transpiler")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "transpiler"
                    ? "bg-teal-500 text-obsidian-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                60s Script Recipe
              </button>
              <button
                onClick={() => setActiveTab("contrarian")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "contrarian"
                    ? "bg-teal-500 text-obsidian-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Hook & Contrarian Angle
              </button>
              <button
                onClick={() => setActiveTab("audiences")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "audiences"
                    ? "bg-teal-500 text-obsidian-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Target Audience Niches
              </button>
            </div>

            {/* Tab 1: 60s Reel Transpiler */}
            {activeTab === "transpiler" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 font-medium">
                  <strong>High-Retention Hook:</strong> "{recipes.reel60s.hook}"
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    🎬 Script Beats & Pacing
                  </h4>
                  {recipes.reel60s.scriptBeats.map((beat: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="font-mono font-bold text-teal-400">0{idx + 1}.</span>
                      <span>{beat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Contrarian Angle */}
            {activeTab === "contrarian" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Bold Hook</span>
                  <p className="text-slate-100 font-bold text-sm">"{selectedTrend.hookRecommendation.boldHook}"</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">Contrarian Angle</span>
                  <p className="text-slate-200 font-medium">"{selectedTrend.hookRecommendation.contrarianAngle}"</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Why It Works</span>
                  <p className="text-slate-300">{selectedTrend.hookRecommendation.whyItWorks}</p>
                </div>
              </div>
            )}

            {/* Tab 3: Target Niches */}
            {activeTab === "audiences" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  🎯 Target Audience Segments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTrend.targetAudienceNiches.map((niche: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN: Omni-Modal Transpiled Outputs (3 cols) */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Transpiled Formats Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                Omni-Modal Formats
              </h3>

              <div className="space-y-3">
                {/* LinkedIn Carousel */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100">LinkedIn PDF Carousel</span>
                    <span className="text-[10px] font-mono text-teal-400">8 Slides</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{recipes.linkedinCarousel.title}</p>
                  <button
                    onClick={() => handleCopy(JSON.stringify(recipes.linkedinCarousel, null, 2), "carousel")}
                    className="w-full text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
                  >
                    {copiedAction === "carousel" ? "✓ Carousel Copied!" : "Export Carousel JSON"}
                  </button>
                </div>

                {/* Executive Podcast Debate */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100">Executive Podcast</span>
                    <span className="text-[10px] font-mono text-cyan-400">2-Host Debate</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{recipes.executivePodcast.coreDebate}</p>
                  <button
                    onClick={() => handleCopy(JSON.stringify(recipes.executivePodcast, null, 2), "podcast")}
                    className="w-full text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
                  >
                    {copiedAction === "podcast" ? "✓ Outline Copied!" : "Export Debate Outline"}
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Timeline Bridge */}
            <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-slate-900/60 to-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="font-bold text-xs text-teal-300 uppercase tracking-wider font-mono">
                🎬 Studio Creator Bridge
              </h4>
              <p className="text-xs text-slate-400">
                Instantly populate this forecast's hook, 60s beats, and neural voiceover into the Master Studio Timeline.
              </p>
              <button
                onClick={handleLaunchInStudio}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-xs text-obsidian-950 shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                Populate Master Studio
              </button>
            </div>
          </section>

        </div>
      </main>
      </div>
    </StudioSidebar>
  );
}
