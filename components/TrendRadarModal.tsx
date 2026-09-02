'use client';

import React, { useState } from 'react';
import { 
  get7DayPredictedTrends, 
  PredictedTrend, 
  TrendCategory, 
  applyNicheTransposition,
  mutateContrarianScript 
} from '../lib/reel/trendRadarEngine';

interface TrendRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchInStudio: (trend: PredictedTrend) => void;
}

export const TrendRadarModal: React.FC<TrendRadarModalProps> = ({
  isOpen,
  onClose,
  onLaunchInStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TrendCategory | 'all'>('all');
  const [activeTrendId, setActiveTrendId] = useState<string>('trend-arxiv-reasoning-moe');
  const [activeOutputTab, setActiveOutputTab] = useState<'reel60s' | 'linkedin' | 'podcast' | 'contrarian' | 'niche'>('reel60s');
  const [selectedNiche, setSelectedNiche] = useState<'b2b_saas' | 'real_estate' | 'personal_finance' | 'fitness_health'>('b2b_saas');

  if (!isOpen) return null;

  const trends = selectedCategory === 'all' 
    ? get7DayPredictedTrends() 
    : get7DayPredictedTrends(selectedCategory);

  const currentTrend = trends.find(t => t.id === activeTrendId) || trends[0];
  const contrarianData = currentTrend ? mutateContrarianScript(currentTrend.title, currentTrend.hookRecommendation.boldHook) : null;
  const nicheData = currentTrend ? applyNicheTransposition(currentTrend, selectedNiche) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-xl">🔮</span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                7-Day Advance Predictive Trend Radar
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                  LIVE VOI SCORING
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Mines upstream ArXiv, Stanford/MIT Labs, GitHub stars, LinkedIn Pulse, Reddit, and TikTok Search Vacuums
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-neutral-800 bg-neutral-900/30 overflow-x-auto text-xs">
          {[
            { id: 'all', label: '🌟 All Top VOI Trends' },
            { id: 'academic_breakthrough', label: '🏛️ Elite Research & ArXiv' },
            { id: 'ai_tech', label: '⚡ GitHub & AI Tech' },
            { id: 'b2b_career', label: '💼 LinkedIn & Career' },
            { id: 'lifestyle_ugc', label: '🛍️ Search Vacuums & UGC' },
            { id: 'entertainment_lore', label: '🎭 Reddit & Mythology' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: 7-Day Forecast Radar List */}
          <div className="md:col-span-5 border-r border-neutral-800 overflow-y-auto p-4 space-y-3 bg-neutral-950/50">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
              Upcoming 7-Day Peak Forecasts
            </div>

            {trends.map(trend => {
              const isSelected = trend.id === activeTrendId;
              return (
                <div
                  key={trend.id}
                  onClick={() => setActiveTrendId(trend.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[11px] font-mono rounded">
                      {trend.peakForecastDay}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-neutral-400 font-mono">VOI</span>
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-xs font-bold rounded border border-emerald-800/50">
                        {trend.voiScore}/100
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1">
                    {trend.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                    {trend.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                    <span className="flex items-center gap-1 text-indigo-300">
                      📡 {trend.sourcePlatform}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      +{trend.searchAccelerationPct}% Search
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Trend Teardown & Omni-Modal Transpiler */}
          <div className="md:col-span-7 overflow-y-auto p-6 flex flex-col space-y-5 bg-neutral-900/20">
            {currentTrend && (
              <>
                {/* Trend Banner */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      {currentTrend.category.replace('_', ' ').toUpperCase()} • {currentTrend.sourceTier.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🛡️ {currentTrend.copyrightArmor.fairUseStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {currentTrend.title}
                  </h3>
                  <p className="text-xs text-neutral-300">
                    {currentTrend.summary}
                  </p>
                </div>

                {/* Sub-Tabs for Transpiler Outputs */}
                <div className="flex items-center space-x-1.5 border-b border-neutral-800 pb-2">
                  {[
                    { id: 'reel60s', label: '📱 60s Reel Script' },
                    { id: 'linkedin', label: '📑 LinkedIn Carousel' },
                    { id: 'podcast', label: '🎙️ Executive Podcast' },
                    { id: 'contrarian', label: '⚡ Anti-Duplicate Mutation' },
                    { id: 'niche', label: '🎯 Niche Transposer' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOutputTab(tab.id as any)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        activeOutputTab === tab.id
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: 60s Reel Script */}
                {activeOutputTab === 'reel60s' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
                      <div className="font-semibold text-indigo-300 mb-1">🔥 Viral Hook (First 3 Seconds):</div>
                      <div className="text-white text-sm font-medium">"{currentTrend.transpiledRecipes.reel60s.hook}"</div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-neutral-300">Script Body Beats (Paced for 130 BPM):</div>
                      {currentTrend.transpiledRecipes.reel60s.scriptBeats.map((beat, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-neutral-900/60 border border-neutral-800 text-neutral-200 flex gap-2">
                          <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                          <span>{beat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-neutral-400 pt-2 border-t border-neutral-800">
                      <span>🎨 Subtitles: <strong className="text-white">{currentTrend.transpiledRecipes.reel60s.visualStyle}</strong></span>
                      <span>🎵 Beat Sync: <strong className="text-white">{currentTrend.transpiledRecipes.reel60s.audioBpm} BPM</strong></span>
                    </div>
                  </div>
                )}

                {/* Tab 2: LinkedIn Carousel */}
                {activeOutputTab === 'linkedin' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-semibold text-white text-sm">
                      {currentTrend.transpiledRecipes.linkedinCarousel.title} ({currentTrend.transpiledRecipes.linkedinCarousel.slideCount} Slides)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentTrend.transpiledRecipes.linkedinCarousel.slides.map(slide => (
                        <div key={slide.slideNum} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                          <div className="text-indigo-400 font-bold mb-1">Slide {slide.slideNum}: {slide.header}</div>
                          <ul className="list-disc list-inside space-y-1 text-neutral-300">
                            {slide.points.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Executive Podcast */}
                {activeOutputTab === 'podcast' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="text-white font-bold text-sm">{currentTrend.transpiledRecipes.executivePodcast.topic}</div>
                      <div className="text-neutral-400">
                        Host 1: <strong className="text-indigo-300">{currentTrend.transpiledRecipes.executivePodcast.host1Role}</strong> | 
                        Host 2: <strong className="text-indigo-300">{currentTrend.transpiledRecipes.executivePodcast.host2Role}</strong>
                      </div>
                      <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-neutral-200">
                        <span className="text-amber-400 font-bold">🎙️ Opening Hook: </span>
                        "{currentTrend.transpiledRecipes.executivePodcast.openingHook}"
                      </div>
                      <div className="text-neutral-300">
                        <strong className="text-white">Core Debate: </strong>
                        {currentTrend.transpiledRecipes.executivePodcast.coreDebate}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Anti-Duplicate Contrarian Mutation */}
                {activeOutputTab === 'contrarian' && contrarianData && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-lg">
                      <div className="text-amber-300 font-bold mb-1">🛡️ Contrarian Angle (Zero Duplicate Penalty):</div>
                      <div className="text-white font-medium text-sm">"{contrarianData.contrarianHook}"</div>
                    </div>
                    <div className="space-y-2">
                      {contrarianData.debatePoints.map((pt, i) => (
                        <div key={i} className="p-2.5 bg-neutral-900 rounded border border-neutral-800 text-neutral-200">
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 5: Niche Transposer */}
                {activeOutputTab === 'niche' && nicheData && (
                  <div className="space-y-3 text-xs">
                    <div className="flex gap-2">
                      {[
                        { id: 'b2b_saas', label: 'B2B SaaS' },
                        { id: 'real_estate', label: 'Real Estate' },
                        { id: 'personal_finance', label: 'Personal Finance' },
                        { id: 'fitness_health', label: 'Longevity/Health' }
                      ].map(n => (
                        <button
                          key={n.id}
                          onClick={() => setSelectedNiche(n.id as any)}
                          className={`px-2.5 py-1 rounded text-xs ${
                            selectedNiche === n.id ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                      <div className="text-indigo-400 font-bold">{nicheData.transposedTitle}</div>
                      <div className="text-white font-medium">"{nicheData.transposedHook}"</div>
                      <div className="text-emerald-400">Action: {nicheData.transposedAction}</div>
                    </div>
                  </div>
                )}

                {/* Action CTA Bar */}
                <div className="pt-4 mt-auto border-t border-neutral-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-neutral-400">
                    Peak Forecast: <strong className="text-emerald-400">{currentTrend.peakForecastDay}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLaunchInStudio(currentTrend)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                    >
                      🚀 1-Click Launch This Trend in Studio
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
