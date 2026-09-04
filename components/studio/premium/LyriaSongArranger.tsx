"use client";

import React, { useState, useMemo } from "react";
import { 
  Music, 
  Play, 
  Pause, 
  Sliders, 
  Volume2, 
  Sparkles, 
  Lock, 
  Layers, 
  Clock, 
  Disc, 
  Mic, 
  Share2, 
  Zap, 
  Plus, 
  Trash2,
  Activity
} from "lucide-react";
import { 
  LYRIA_MUSIC_PRESETS, 
  LYRIA_VOCAL_STYLES, 
  LyriaMusicPreset, 
  LyriaVocalStyle, 
  LyriaSection, 
  LyriaTier, 
  LyriaVocalMode 
} from "@/lib/ai/lyriaService";
import { PlanTier, TIER_DEFINITIONS } from "@/lib/billing/tierPolicy";

interface LyriaSongArrangerProps {
  currentTier?: PlanTier;
  initialPresetId?: string;
  initialSections?: LyriaSection[];
  onSongChange?: (config: {
    presetId: string;
    vocalMode: LyriaVocalMode;
    vocalStyleId: string;
    sections: LyriaSection[];
    totalDuration: number;
    stemsEnabled: boolean;
  }) => void;
}

export const LyriaSongArranger: React.FC<LyriaSongArrangerProps> = ({
  currentTier = "pro",
  initialPresetId = "adaptive_cinematic",
  initialSections,
  onSongChange
}) => {
  const tierQuotas = TIER_DEFINITIONS[currentTier];
  const maxAllowedDuration = tierQuotas.maxLyriaDurationSeconds; // 30s Free, 120s Creator, 180s Pro/Ent
  const isProMusicAllowed = tierQuotas.lyriaTier === "pro";
  const areStemsAllowed = tierQuotas.lyriaStemSeparation;

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId);
  const [vocalMode, setVocalMode] = useState<LyriaVocalMode>("instrumental");
  const [selectedVocalStyleId, setSelectedVocalStyleId] = useState<string>("anime_jpop_lead");
  const [stemsActive, setStemsActive] = useState<boolean>(areStemsAllowed);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // Default 5-section musical progression
  const [sections, setSections] = useState<LyriaSection[]>(() => {
    if (initialSections && initialSections.length > 0) return initialSections;
    if (!isProMusicAllowed) {
      return [{ name: "verse", startSec: 0, endSec: Math.min(30, maxAllowedDuration), energy: 0.6 }];
    }
    return [
      { name: "intro", startSec: 0, endSec: 20, energy: 0.4 },
      { name: "verse", startSec: 20, endSec: 60, energy: 0.65 },
      { name: "chorus", startSec: 60, endSec: 100, energy: 0.95 },
      { name: "bridge", startSec: 100, endSec: 140, energy: 0.75 },
      { name: "outro", startSec: 140, endSec: 180, energy: 0.45 }
    ];
  });

  const selectedPreset: LyriaMusicPreset = useMemo(() => {
    return LYRIA_MUSIC_PRESETS.find(p => p.id === selectedPresetId) || LYRIA_MUSIC_PRESETS[0];
  }, [selectedPresetId]);

  const totalCalculatedDuration = useMemo(() => {
    if (sections.length === 0) return 0;
    return sections[sections.length - 1].endSec;
  }, [sections]);

  const handleUpdateSectionDuration = (index: number, newDuration: number) => {
    const updated = [...sections];
    const prevEnd = index === 0 ? 0 : updated[index - 1].endSec;
    const proposedEnd = prevEnd + Math.max(5, newDuration);

    // Enforce overall tier limit
    if (proposedEnd > maxAllowedDuration) return;

    updated[index].endSec = proposedEnd;
    // Shift subsequent sections forward
    let runningStart = proposedEnd;
    for (let i = index + 1; i < updated.length; i++) {
      const secDuration = updated[i].endSec - updated[i].startSec;
      updated[i].startSec = runningStart;
      updated[i].endSec = Math.min(maxAllowedDuration, runningStart + secDuration);
      runningStart = updated[i].endSec;
    }
    setSections(updated);
    notifyChange(updated);
  };

  const handleUpdateSectionEnergy = (index: number, energy: number) => {
    const updated = [...sections];
    updated[index].energy = Math.max(0.1, Math.min(1.0, energy));
    setSections(updated);
    notifyChange(updated);
  };

  const notifyChange = (updatedSections: LyriaSection[]) => {
    onSongChange?.({
      presetId: selectedPresetId,
      vocalMode,
      vocalStyleId: selectedVocalStyleId,
      sections: updatedSections,
      totalDuration: updatedSections[updatedSections.length - 1]?.endSec || 0,
      stemsEnabled: stemsActive && areStemsAllowed
    });
  };

  return (
    <div className="w-full bg-[#0d1017] border border-[#222838] rounded-xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 text-white">
      {/* 1. Arranger Header & Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1d2333] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-bold">
                DeepMind Lyria 3.0 Pro Song Arranger
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {isProMusicAllowed ? "Pro Multi-Section" : "Standard Single-Cue"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Structured Musical Form · Max {maxAllowedDuration}s Composition Headroom ({currentTier.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Stem Separation Indicator / Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (areStemsAllowed) {
                setStemsActive(!stemsActive);
              }
            }}
            disabled={!areStemsAllowed}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              stemsActive && areStemsAllowed
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : areStemsAllowed
                ? "bg-[#161a25] border-[#293144] text-slate-400 hover:text-slate-200"
                : "bg-[#10131d] border-[#1f2433] text-slate-600 cursor-not-allowed"
            }`}
          >
            {areStemsAllowed ? (
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>4-Stem Isolation (Vocal/Drums/Bass/Synth)</span>
            {!areStemsAllowed && (
              <span className="text-[9px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded ml-1">
                Pro
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Musical Preset & Tempo Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Preset Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Composition Preset</label>
          <select
            value={selectedPresetId}
            onChange={(e) => {
              setSelectedPresetId(e.target.value);
              notifyChange(sections);
            }}
            className="w-full bg-[#141824] border border-[#272f44] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {LYRIA_MUSIC_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.genre})
              </option>
            ))}
          </select>
        </div>

        {/* BPM & Key Signature */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Tempo (BPM)</label>
            <div className="bg-[#141824] border border-[#272f44] rounded-lg px-3 py-2 text-xs font-mono text-purple-300">
              {selectedPreset.bpm} BPM
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Key Signature</label>
            <div className="bg-[#141824] border border-[#272f44] rounded-lg px-3 py-2 text-xs font-mono text-purple-300">
              {selectedPreset.keySignature}
            </div>
          </div>
        </div>

        {/* Vocal Mode Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Vocal Arrangement</label>
          <select
            value={vocalMode}
            onChange={(e) => {
              setVocalMode(e.target.value as LyriaVocalMode);
              notifyChange(sections);
            }}
            className="w-full bg-[#141824] border border-[#272f44] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="instrumental">Instrumental Only (Score)</option>
            <option value="character_singing">Character Lead Singing (Viseme Sync)</option>
            <option value="duet_ensemble">Duet Ensemble Harmony</option>
            <option value="choir_chant">Ethereal Ambient Choir</option>
          </select>
        </div>
      </div>

      {/* 3. Interactive 5-Section Arranger Sequencer */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Song Structure Tree: Intro ➔ Verse ➔ Chorus ➔ Bridge ➔ Outro
          </span>
          <span className="font-mono text-xs text-purple-300">
            Total Duration: {totalCalculatedDuration}s / {maxAllowedDuration}s
          </span>
        </div>

        {/* Section Blocks Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {sections.map((section, idx) => {
            const duration = section.endSec - section.startSec;
            return (
              <div
                key={`${section.name}-${idx}`}
                className="bg-[#131622] border border-[#242b3d] rounded-xl p-3 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-purple-500/50 transition-all"
              >
                {/* Header: Section Name & Energy Meter */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {section.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {section.startSec}s - {section.endSec}s
                  </span>
                </div>

                {/* Duration Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Duration</span>
                    <span className="font-mono font-bold text-slate-200">{duration}s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={duration}
                    disabled={!isProMusicAllowed}
                    onChange={(e) => handleUpdateSectionDuration(idx, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1e2436] rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                  />
                </div>

                {/* Energy & Dynamics */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-purple-400" /> Energy
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {Math.round(section.energy * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(section.energy * 100)}
                    disabled={!isProMusicAllowed}
                    onChange={(e) => handleUpdateSectionEnergy(idx, parseInt(e.target.value) / 100)}
                    className="w-full h-1.5 bg-[#1e2436] rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Instruments Stems Visualizer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1d2333] text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-300">Orchestration Stems:</span>
          {selectedPreset.instruments.map((inst, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md bg-[#161a26] border border-[#262c3e] text-slate-300 text-[11px]"
            >
              {inst}
            </span>
          ))}
        </div>
        <div className="font-mono text-[11px] text-purple-300 flex items-center gap-1.5">
          <Disc className="w-3.5 h-3.5 animate-spin" /> DeepMind SynthID Audio Watermarked
        </div>
      </div>
    </div>
  );
};
export default LyriaSongArranger;
