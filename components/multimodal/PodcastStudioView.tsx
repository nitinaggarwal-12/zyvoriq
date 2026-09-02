"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Sparkles,
  Users,
  Music,
  Radio,
  Clock,
  Share2,
  Flame,
  Check,
  Plus,
  Trash2
} from "lucide-react";
import {
  generatePodcastEpisode,
  PodcastEpisode,
  PodcastDialogueTurn,
  PodcastFormat,
  PodcastDurationTier,
  PODCAST_FORMAT_CONFIG,
  DURATION_TIER_CONFIG
} from "@/lib/multimodal/podcastEngine";
import { PRESET_PERSONAS, PersonaClone } from "@/lib/reel/personas";

interface PodcastStudioViewProps {
  initialTopic: string;
}

export function PodcastStudioView({ initialTopic }: PodcastStudioViewProps) {
  const [topic, setTopic] = useState(initialTopic || "Autonomous Agentic AI Infrastructure");
  const [format, setFormat] = useState<PodcastFormat>("fireside_chat");
  const [durationTier, setDurationTier] = useState<PodcastDurationTier>("quick_bite");
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>([PRESET_PERSONAS[0].id, PRESET_PERSONAS[3].id]); // Priya & Carlos
  const [introMusic, setIntroMusic] = useState("lofi-chill");

  const activeHosts = selectedHostIds
    .map(id => PRESET_PERSONAS.find(p => p.id === id))
    .filter(Boolean) as PersonaClone[];

  const [episode, setEpisode] = useState<PodcastEpisode>(() =>
    generatePodcastEpisode(topic, format, durationTier, activeHosts, introMusic)
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);

  const handleGenerate = () => {
    const ep = generatePodcastEpisode(topic, format, durationTier, activeHosts, introMusic);
    setEpisode(ep);
    setIsPlaying(false);
    setActiveTurnId(null);
  };

  const toggleHostSelection = (personaId: string) => {
    const isSelected = selectedHostIds.includes(personaId);
    const formatConfig = PODCAST_FORMAT_CONFIG[format];

    if (isSelected) {
      if (selectedHostIds.length <= formatConfig.minHosts) return; // Keep minimum
      setSelectedHostIds(selectedHostIds.filter(id => id !== personaId));
    } else {
      if (selectedHostIds.length >= formatConfig.maxHosts) {
        setSelectedHostIds([...selectedHostIds.slice(1), personaId]);
      } else {
        setSelectedHostIds([...selectedHostIds, personaId]);
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && episode.dialogueTurns.length > 0) {
      setActiveTurnId(episode.dialogueTurns[0].id);
    } else {
      setActiveTurnId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Left Sidebar: Show Settings & Controls */}
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Show & Format</div>
          <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">
            Multi-Host Studio
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">EPISODE TOPIC</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3.5 text-sm text-white outline-none focus:border-pink-300/40"
            placeholder="What should the hosts discuss?"
          />
        </div>

        {/* Show Format Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-400">SHOW FORMAT</label>
          <select
            value={format}
            onChange={(e) => {
              const newFormat = e.target.value as PodcastFormat;
              setFormat(newFormat);
              const config = PODCAST_FORMAT_CONFIG[newFormat];
              if (selectedHostIds.length < config.minHosts) {
                setSelectedHostIds(PRESET_PERSONAS.slice(0, config.minHosts).map(p => p.id));
              }
            }}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
          >
            {(Object.keys(PODCAST_FORMAT_CONFIG) as PodcastFormat[]).map(fKey => (
              <option key={fKey} value={fKey}>
                {PODCAST_FORMAT_CONFIG[fKey].name}
              </option>
            ))}
          </select>
          <div className="mt-1.5 text-[11px] text-slate-400">
            {PODCAST_FORMAT_CONFIG[format].description}
          </div>
        </div>

        {/* Episode Duration Tier */}
        <div>
          <label className="block text-xs font-bold text-slate-400">EPISODE DURATION</label>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {(Object.keys(DURATION_TIER_CONFIG) as PodcastDurationTier[]).map(dTier => (
              <button
                key={dTier}
                onClick={() => setDurationTier(dTier)}
                className={`rounded-xl border p-2 text-center text-[10px] font-bold transition ${durationTier === dTier ? "border-pink-500 bg-pink-500/20 text-white" : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white"}`}
              >
                {DURATION_TIER_CONFIG[dTier].label.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Speaker Roster Selection */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-400">
              SPEAKERS ({selectedHostIds.length} / {PODCAST_FORMAT_CONFIG[format].maxHosts})
            </label>
            <span className="text-[10px] text-pink-300">Click to assign</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {PRESET_PERSONAS.map(p => {
              const isSelected = selectedHostIds.includes(p.id);
              const hostIndex = selectedHostIds.indexOf(p.id);
              const roleLabel = hostIndex === 0 ? "Moderator" : hostIndex === 1 ? "Guest / Co-Host" : "Panelist";
              return (
                <div
                  key={p.id}
                  onClick={() => toggleHostSelection(p.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${isSelected ? "border-pink-500/50 bg-pink-500/10 text-white" : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{p.avatarEmoji}</span>
                    <div>
                      <div className="text-xs font-bold">{p.name.split(" ")[0]} {p.name.split(" ")[1]}</div>
                      <div className="text-[10px] text-slate-400">{p.role}</div>
                    </div>
                  </div>
                  {isSelected ? (
                    <span className="rounded-md border border-pink-500/30 bg-pink-500/20 px-2 py-0.5 text-[9px] font-black text-pink-300">
                      {roleLabel}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">+ Add</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Music Jingle Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-400">INTRO & OUTRO JINGLE</label>
          <select
            value={introMusic}
            onChange={(e) => setIntroMusic(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="lofi-chill">Lo-Fi Study Beats</option>
            <option value="cyber-synth">Cyber Synthwave</option>
            <option value="jazz-lounge">Late Night Jazz Lounge</option>
            <option value="modern-tech">Upbeat Modern Tech</option>
            <option value="ambient-cinema">Ambient Cinematic</option>
            <option value="none">None (Pure Speech)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100 shadow-lg shadow-white/10"
        >
          <Sparkles className="h-4 w-4" /> Synthesize Episode
        </button>

        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-2 text-slate-400">
          <div className="flex justify-between"><span>Total Duration:</span> <strong className="text-slate-200">{episode.totalDurationSec.toFixed(1)}s</strong></div>
          <div className="flex justify-between"><span>Dialogue Turns:</span> <strong className="text-slate-200">{episode.dialogueTurns.length} segments</strong></div>
          <div className="flex justify-between"><span>Audio Ducking:</span> <strong className="text-slate-200">{episode.musicDuckingDb} dB</strong></div>
          <div className="flex justify-between"><span>Format:</span> <strong className="text-slate-200">{PODCAST_FORMAT_CONFIG[episode.format]?.badge || episode.format}</strong></div>
        </div>
      </aside>

      {/* Main Content: Audio Player & Turn Timeline */}
      <section className="space-y-5">
        {/* Master Waveform Bar */}
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-r from-purple-950/20 via-[#0c1017] to-pink-950/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                  {PODCAST_FORMAT_CONFIG[episode.format]?.name || "Master Podcast Stream"}
                </span>
                <span className="rounded-full border border-pink-500/30 bg-pink-500/20 px-2 py-0.2 text-[9px] font-black text-pink-300">
                  {episode.hosts.length} Speakers
                </span>
              </div>
              <h2 className="mt-1 text-xl font-black text-white">{episode.title}</h2>
              <p className="mt-1 text-xs text-slate-400">{episode.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-400"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause Stream" : "Play Full Episode"}
              </button>
              <button
                onClick={() => alert(`Exporting broadcast MP3 (${episode.totalDurationSec}s)...`)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <Download className="h-4 w-4 text-emerald-400" /> Export MP3
              </button>
            </div>
          </div>

          {/* Simulated Waveform Visualizer */}
          <div className="mt-6 flex h-14 items-end gap-1 rounded-xl bg-black/40 p-3">
            {Array.from({ length: 48 }).map((_, i) => {
              const height = isPlaying ? Math.sin(i * 0.4) * 35 + 40 : (i % 4) * 15 + 15;
              return (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-full transition-all duration-150 ${isPlaying ? "bg-gradient-to-t from-pink-500 to-purple-400" : "bg-white/20"}`}
                />
              );
            })}
          </div>
        </div>

        {/* Dialogue Turns Sequence */}
        <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dialogue Turns & Live Script ({episode.dialogueTurns.length} segments)
            </div>
            <div className="flex gap-2">
              {episode.hosts.map((h, i) => (
                <span key={h.id} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                  {h.avatarEmoji} {h.name.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {episode.dialogueTurns.map((turn, idx) => {
              const hostMatch = episode.hosts.find(h => h.id === turn.speakerId) || episode.hosts[0];
              const isLead = turn.role === "moderator" || turn.role === "host";
              return (
                <div
                  key={turn.id}
                  onClick={() => setActiveTurnId(turn.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${activeTurnId === turn.id ? "border-pink-500/50 bg-pink-500/[0.07]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-black text-white">
                        {hostMatch?.avatarEmoji || (isLead ? "A" : "B")}
                      </span>
                      <div>
                        <span className="text-xs font-black text-white">{turn.speakerName}</span>
                        <span className="ml-2 text-[10px] text-slate-400 capitalize">({turn.role})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-[10px] text-pink-300 font-bold">
                        {turn.emotion}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {turn.startSec}s · {turn.durationSec}s
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200">{turn.scriptText}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
