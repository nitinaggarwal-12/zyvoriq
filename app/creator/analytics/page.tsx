"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudioSidebar } from "@/components/StudioSidebar";
import {
  Trophy,
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  Globe,
  Users,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Target,
  CheckCircle2,
  Lock,
  Compass,
  Play,
  Share2,
  HelpCircle,
  BarChart2,
  Award
} from "lucide-react";
import {
  getCreatorGrowthProfile,
  CategoryRanking,
  GrowthStrategyAction
} from "@/lib/creator/creatorAnalyticsEngine";

export default function CreatorAnalyticsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(() => getCreatorGrowthProfile("creator_user_alpha"));
  const [selectedCategory, setSelectedCategory] = useState<string>("tech_ai");
  const [activeStrategyFilter, setActiveStrategyFilter] = useState<string>("all");
  const [appliedStrategy, setAppliedStrategy] = useState<string | null>(null);

  const currentCategoryRank = profile.rankings.find((r) => r.categoryId === selectedCategory) || profile.rankings[0];

  const filteredStrategies = profile.strategies.filter((s) => {
    if (activeStrategyFilter === "all") return true;
    return s.pillar === activeStrategyFilter;
  });

  const handleApplyStrategy = (strat: GrowthStrategyAction) => {
    setAppliedStrategy(strat.id);
    // Simulate routing to Studio with preloaded growth configuration
    setTimeout(() => {
      if (strat.studioPresetTarget.creationMode === "dopamine_split") {
        router.push("/studio/create?preset=dopamine_split&hook=contrarian_inversion");
      } else {
        router.push("/studio/create?preset=growth_accelerator");
      }
    }, 1200);
  };

  return (
    <StudioSidebar>
      <main className="flex-1 min-w-0 pb-20 pt-8">
        <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-8 md:px-12">
          
          {/* Top Hero Banner & Creator Overview */}
          <div className="mb-8 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-obsidian-900 via-slate-900/90 to-teal-950/40 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-300">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    CREATOR INFLUENCER ACCELERATOR
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-mono text-slate-300">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    Isolated Tenant Analytics (Zero Admin Sharing)
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  Creator Growth & Category Ranking Hub
                </h1>
                <p className="mt-2 text-base text-slate-300 max-w-3xl">
                  Personalized algorithmic growth strategies, niche ranking percentiles, and actionable content pivots engineered to turn you into the #1 authority in your category.
                </p>
              </div>

              {/* Influencer Scorecard Summary */}
              <div className="flex items-center gap-4 bg-obsidian-950/80 border border-slate-800 rounded-2xl p-5 shrink-0">
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
                  <span className="text-2xl font-mono font-black">{profile.overallInfluencerScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authority</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase text-slate-400">Global Percentile</div>
                  <div className="text-xl font-black text-emerald-400">Top { (100 - profile.globalPercentile).toFixed(1) }% of Creators</div>
                  <div className="text-xs text-slate-400">
                    30-Day Views: <span className="font-mono font-bold text-white">{profile.totalViews30Days.toLocaleString()}</span> (+{profile.viewSurgeRate}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Zero-Gutter Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (4 Cols): Category Leaderboards & Standings */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Category Selector Card */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Your Category Standings
                  </h3>
                  <span className="text-xs font-mono text-teal-400 font-semibold">6 Cohorts Active</span>
                </div>

                <div className="space-y-3">
                  {profile.rankings.map((r) => {
                    const isSelected = r.categoryId === selectedCategory;
                    return (
                      <button
                        key={r.categoryId}
                        onClick={() => setSelectedCategory(r.categoryId)}
                        className={`w-full text-left rounded-xl p-4 transition-all border ${
                          isSelected
                            ? "bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10"
                            : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {r.badge}
                          </span>
                          <span className={`text-sm font-mono font-black ${isSelected ? "text-teal-300" : "text-white"}`}>
                            Rank #{r.currentRank}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-200 mb-1">{r.categoryName}</div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Top { (100 - r.percentile).toFixed(1) }% ({r.totalInCohort.toLocaleString()} creators)</span>
                          <span className="text-emerald-400 font-mono">+{r.weeklyChange} this week</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Deep-Dive Focus */}
              <div className="rounded-2xl border border-teal-500/30 bg-obsidian-900/90 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-400 uppercase tracking-wider mb-4">
                  <Award className="h-4 w-4 text-teal-400" />
                  Path to #1 in {currentCategoryRank.categoryName}
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs text-slate-400">Average Views / Broadcast</div>
                    <div className="text-2xl font-mono font-black text-white mt-1">
                      {currentCategoryRank.averageViewsPerPost.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                      <span>#1 Creator Benchmark:</span>
                      <span className="font-mono text-amber-400 font-bold">{currentCategoryRank.topCreatorBenchmarkViews.toLocaleString()} views</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/40">
                    <div className="text-xs text-teal-300 font-bold uppercase tracking-wider">Gap to Next Rank:</div>
                    <div className="text-base font-bold text-white mt-1">
                      Needs <span className="font-mono text-teal-300">+{currentCategoryRank.gapToNextRankViews.toLocaleString()} views</span> on next 2 posts.
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Applying the recommended <strong>Contrarian Inversion + Dopamine-Split</strong> formula will bridge this gap in under 72 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy & Anti-Leak Armor Notice */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-950/90 p-5 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Proprietary Tenant Privacy Protocol
                </div>
                <p>
                  Rankings are calculated via zero-knowledge percentile cohorts. Your private draft scripts, unreleased video assets, and audience demographics are strictly isolated and never visible to other users or public leaderboards.
                </p>
              </div>

            </div>

            {/* Right Column (8 Cols): Targeted Growth Strategies & Actionable Prescriptions */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Strategy Header & Filter Tabs */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-teal-400" />
                      Actionable Growth Strategies to Maximize Views
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Algorithmic prescriptions specifically tuned for your creator archetype and category standing.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    {[
                      { id: "all", label: "All Pillars" },
                      { id: "topic", label: "Topics" },
                      { id: "format", label: "Format" },
                      { id: "language", label: "Languages" },
                      { id: "avatar", label: "Avatar" },
                      { id: "schedule", label: "Schedule" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveStrategyFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeStrategyFilter === tab.id
                            ? "bg-teal-500 text-obsidian-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strategy Cards List */}
                <div className="space-y-4">
                  {filteredStrategies.map((strat) => (
                    <div
                      key={strat.id}
                      className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 transition-all hover:border-teal-500/40 hover:bg-slate-900"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 border border-teal-500/40 text-teal-300">
                              {strat.pillar.toUpperCase()} PILLAR
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                              {strat.projectedViewBoost}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Impact: {strat.impactScore}/100
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{strat.title}</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                            <div className="p-3 rounded-lg bg-obsidian-950 border border-rose-900/30">
                              <span className="text-rose-400 font-bold block mb-1">Current Approach:</span>
                              <span className="text-slate-300">{strat.currentApproach}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-obsidian-950 border border-teal-900/40">
                              <span className="text-teal-400 font-bold block mb-1">Recommended Pivot:</span>
                              <span className="text-slate-200">{strat.recommendedPivot}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pt-1">
                            <strong className="text-teal-300">Actionable Directive:</strong> {strat.actionableDirective}
                          </p>

                          <div className="text-[10px] font-mono text-slate-500 pt-1">
                            Statistical Confidence: {strat.confidenceInterval}
                          </div>
                        </div>

                        {/* Apply Action Button */}
                        <div className="sm:self-center shrink-0">
                          <button
                            onClick={() => handleApplyStrategy(strat)}
                            disabled={appliedStrategy === strat.id}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-lg ${
                              appliedStrategy === strat.id
                                ? "bg-emerald-500 text-obsidian-950"
                                : "bg-teal-500 hover:bg-teal-400 text-obsidian-950 shadow-teal-500/20"
                            }`}
                          >
                            {appliedStrategy === strat.id ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>CONFIGURING STUDIO...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4" />
                                <span>APPLY IN STUDIO</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30-Day Influencer Step-by-Step Playbook */}
              <div className="rounded-2xl border border-slate-800 bg-obsidian-900/90 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-400" />
                    30-Day Step-by-Step Road to #1 Authority
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Autonomous Execution Plan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.growthPlaybookSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                            {step.timeframe}
                          </span>
                          <span className="text-xs font-mono text-slate-500">Step 0{step.stepNumber}</span>
                        </div>
                        <h5 className="text-sm font-bold text-white mb-2">{step.phase}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed">{step.directive}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold">
                        🎯 Target: {step.expectedMilestone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </StudioSidebar>
  );
}
