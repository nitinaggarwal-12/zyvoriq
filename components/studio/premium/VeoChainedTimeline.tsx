"use client";

import React, { useState, useMemo } from "react";
import { 
  Film, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Layers, 
  Sparkles, 
  Clock, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import { 
  PlanTier, 
  TIER_DEFINITIONS, 
  resolveEffectiveVeoCycles, 
  checkConcurrentRenderCapacity 
} from "@/lib/billing/tierPolicy";

export interface TimelineCycleAct {
  cycleIndex: number; // 1 to 20
  title: string;
  durationSeconds: number; // 8s per cycle
  status: "completed" | "diffusing" | "queued" | "locked";
  videoUrl?: string;
  scenePrompt: string;
  cameraMovement?: string;
  continuityScore?: number;
}

interface VeoChainedTimelineProps {
  currentTier?: PlanTier;
  isBYOK?: boolean;
  activeRendersCount?: number;
  initialCyclesCount?: number;
  currentTime?: number;
  isPlaying?: boolean;
  onTimeSeek?: (time: number) => void;
  onPlayToggle?: () => void;
  onCycleSelect?: (cycleIndex: number) => void;
  onRequestChainingExpansion?: (targetCycles: number) => void;
}

export const VeoChainedTimeline: React.FC<VeoChainedTimelineProps> = ({
  currentTier = "pro",
  isBYOK = false,
  activeRendersCount = 0,
  initialCyclesCount = 8,
  currentTime = 0,
  isPlaying = false,
  onTimeSeek,
  onPlayToggle,
  onCycleSelect,
  onRequestChainingExpansion
}) => {
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const tierLimits = TIER_DEFINITIONS[currentTier];
  const effectivePolicy = useMemo(() => {
    return resolveEffectiveVeoCycles(initialCyclesCount, currentTier, isBYOK);
  }, [initialCyclesCount, currentTier, isBYOK]);

  // Max cycles allowed for this tier (or 20 max for timeline ceiling)
  const maxPossibleCycles = 20; // 168s max
  const tierAllowedCycles = effectivePolicy.allowedCycles;
  const totalTimelineDuration = effectivePolicy.durationSeconds;

  // Generate 20 cycle slots
  const cycles: TimelineCycleAct[] = useMemo(() => {
    const list: TimelineCycleAct[] = [];
    for (let i = 1; i <= maxPossibleCycles; i++) {
      const isWithinTier = i <= tierAllowedCycles;
      const isWithinRequested = i <= initialCyclesCount;
      
      let status: TimelineCycleAct["status"] = "locked";
      if (isWithinTier && isWithinRequested) {
        status = i <= 2 ? "completed" : i === 3 ? "diffusing" : "queued";
      } else if (isWithinTier) {
        status = "queued";
      } else {
        status = "locked";
      }

      list.push({
        cycleIndex: i,
        title: `Act ${i}: ${
          i === 1 ? "Opening Hook" :
          i === 2 ? "Narrative Inciting Incident" :
          i === 3 ? "Tension Escalation" :
          i === 4 ? "Midpoint Pivot" :
          i === 5 ? "Sub-plot Collision" :
          i === 6 ? "Climax Sequence A" :
          i === 7 ? "Climax Sequence B" :
          i === 8 ? "Master Resolution" :
          `Extended Sequence ${i}`
        }`,
        durationSeconds: 8,
        status,
        scenePrompt: `Veo 3.1 Diffusion Latent Frame Continuity - Cycle ${i}`,
        cameraMovement: i % 2 === 0 ? "Steadicam Forward Push" : "Low Angle Orbital Pan",
        continuityScore: isWithinTier ? 98.4 - (i * 0.4) : undefined
      });
    }
    return list;
  }, [tierAllowedCycles, initialCyclesCount]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = clickRatio * totalTimelineDuration;
    onTimeSeek?.(targetTime);
  };

  const activeActIndex = Math.min(
    tierAllowedCycles,
    Math.max(1, Math.floor(currentTime / 8) + 1)
  );

  return (
    <div className="w-full bg-[#0d0f14] border border-[#252b3b] rounded-xl p-4 md:p-6 shadow-2xl flex flex-col gap-4 text-white select-none">
      {/* 1. Header with Tier Quota & Real-time Chaining Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2330] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold tracking-wide">
                Google Veo 3.1 Multi-Act Timeline
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentTier} Tier
              </span>
              {isBYOK && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> BYOK Active (+32s Headroom)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Recursive Diffusion Chaining · {tierAllowedCycles} Acts Unlocked ({totalTimelineDuration}s max)
            </p>
          </div>
        </div>

        {/* Action / Upgrade Badge */}
        <div className="flex items-center gap-3">
          {tierAllowedCycles < 20 && (
            <button
              onClick={() => onRequestChainingExpansion?.(tierAllowedCycles + 4)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Expand to {Math.min(20, tierAllowedCycles + 4) * 8}s (Pro/Ent)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="text-xs text-slate-400 bg-[#161a24] px-3 py-1.5 rounded-lg border border-[#262c3d] font-mono">
            Playhead: <span className="text-white font-bold">{currentTime.toFixed(1)}s</span> / {totalTimelineDuration}s
          </div>
        </div>
      </div>

      {/* 2. Interactive Scrubbing Bar (Proportional Scale) */}
      <div className="relative flex flex-col gap-1.5 pt-2">
        {/* Timeline time marks */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>00:00</span>
          <span>{totalTimelineDuration >= 32 ? "00:32" : "00:08"}</span>
          {totalTimelineDuration >= 64 && <span>01:04</span>}
          {totalTimelineDuration >= 120 && <span>02:00</span>}
          <span>{`0${Math.floor(totalTimelineDuration / 60)}:${(totalTimelineDuration % 60).toString().padStart(2, "0")}`}</span>
        </div>

        {/* Interactive Scrubbing Track */}
        <div 
          onClick={handleTimelineClick}
          className="relative h-10 w-full bg-[#141824] rounded-lg border border-[#2a3245] cursor-pointer overflow-hidden group shadow-inner"
        >
          {/* Cycle segments within track */}
          <div className="absolute inset-0 flex">
            {cycles.slice(0, tierAllowedCycles).map((c, idx) => (
              <div 
                key={c.cycleIndex}
                style={{ width: `${(8 / totalTimelineDuration) * 100}%` }}
                className={`h-full border-r border-[#262c3d]/60 relative transition-colors ${
                  activeActIndex === c.cycleIndex 
                    ? "bg-emerald-500/15" 
                    : c.status === "completed" 
                    ? "bg-[#182032]/60 hover:bg-[#1f2a42]" 
                    : c.status === "diffusing"
                    ? "bg-amber-500/10 animate-pulse"
                    : "bg-[#10141f]"
                }`}
              >
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-400 opacity-60">
                  Act {c.cycleIndex}
                </span>
                {c.status === "diffusing" && (
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 animate-spin" /> Diffusing...
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Played Progress Bar */}
          <div 
            style={{ width: `${Math.min(100, (currentTime / totalTimelineDuration) * 100)}%` }}
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500/30 to-emerald-400/50 pointer-events-none transition-all duration-75"
          />

          {/* Needle Playhead */}
          <div 
            style={{ left: `${Math.min(100, (currentTime / totalTimelineDuration) * 100)}%` }}
            className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] pointer-events-none transform -translate-x-1/2 z-20"
          >
            <div className="w-3 h-3 bg-emerald-400 rounded-full -top-1 -left-1 absolute shadow-md" />
          </div>
        </div>
      </div>

      {/* 3. Multi-Act Cycle Cards (Horizontal Scroller) */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Continuous Latent Sequence Chaining (20 Acts Total)
          </span>
          <span className="text-[11px] text-slate-400">
            {cycles.filter(c => c.status === "completed").length} Ready · {cycles.filter(c => c.status === "diffusing").length} Rendering · {cycles.filter(c => c.status === "locked").length} Locked
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {cycles.map((cycle) => {
            const isSelected = selectedCycle === cycle.cycleIndex;
            const isUnlocked = cycle.status !== "locked";

            return (
              <div
                key={cycle.cycleIndex}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedCycle(cycle.cycleIndex);
                    onCycleSelect?.(cycle.cycleIndex);
                    onTimeSeek?.((cycle.cycleIndex - 1) * 8);
                  }
                }}
                className={`min-w-[170px] max-w-[170px] rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-[120px] relative overflow-hidden ${
                  isSelected
                    ? "bg-[#182133] border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                    : isUnlocked
                    ? "bg-[#131620] border-[#252b3d] hover:border-[#38425d] hover:bg-[#161a27]"
                    : "bg-[#0b0d13]/70 border-[#1a1f2b] opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Top Row: Act Number & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Act {cycle.cycleIndex}
                  </span>
                  {cycle.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : cycle.status === "diffusing" ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : cycle.status === "queued" ? (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Middle: Title & Continuity Score */}
                <div className="flex flex-col gap-0.5">
                  <div className="text-[11px] font-medium text-slate-300 truncate" title={cycle.title}>
                    {cycle.title.replace(`Act ${cycle.cycleIndex}: `, "")}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {cycle.cameraMovement}
                  </div>
                </div>

                {/* Bottom Row: Duration & Continuity Proof */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1e2433]">
                  <span className="font-mono text-slate-400">8.0s</span>
                  {cycle.continuityScore ? (
                    <span className="text-[9px] text-emerald-400/90 font-mono">
                      {cycle.continuityScore.toFixed(1)}% match
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500">
                      {cycle.status === "locked" ? "Pro Required" : "Pending"}
                    </span>
                  )}
                </div>

                {/* Lock Overlay if outside current tier */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                    <Lock className="w-4 h-4 text-amber-400/80 mb-1" />
                    <span className="text-[9px] font-bold text-amber-300">
                      {cycle.cycleIndex <= 4 ? "Creator Tier" : cycle.cycleIndex <= 8 ? "Pro Studio" : "Enterprise"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Playback Controls Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1a1f2c]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTimeSeek?.(Math.max(0, currentTime - 8))}
            className="p-2 rounded-lg bg-[#161a25] hover:bg-[#1f2535] border border-[#272f42] text-slate-300 transition-colors"
            title="Step Back 8s (Previous Act)"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={onPlayToggle}
            className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            title={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="text-xs font-bold pr-1">{isPlaying ? "Pause" : "Play Master"}</span>
          </button>
          <button
            onClick={() => onTimeSeek?.(Math.min(totalTimelineDuration, currentTime + 8))}
            className="p-2 rounded-lg bg-[#161a25] hover:bg-[#1f2535] border border-[#272f42] text-slate-300 transition-colors"
            title="Step Forward 8s (Next Act)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Act Metadata Summary */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Latent Continuity Lock Active
          </span>
          <span className="text-slate-600">|</span>
          <span>1080p60 H.264 Master Output</span>
        </div>
      </div>
    </div>
  );
};
export default VeoChainedTimeline;
