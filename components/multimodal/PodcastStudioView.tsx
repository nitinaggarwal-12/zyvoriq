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
  Share2
} from "lucide-react";
import { generatePodcastEpisode, PodcastEpisode, PodcastDialogueTurn } from "@/lib/multimodal/podcastEngine";
import { PRESET_PERSONAS, PersonaClone } from "@/lib/reel/personas";

interface PodcastStudioViewProps {
  initialTopic: string;
}

export function PodcastStudioView({ initialTopic }: PodcastStudioViewProps) {
  const [topic, setTopic] = useState(initialTopic || "The Future of AI Autonomy");
  const [hostA, setHostA] = useState<PersonaClone>(PRESET_PERSONAS[0]);
  const [hostB, setHostB] = useState<PersonaClone>(PRESET_PERSONAS[3]);
  const [episode, setEpisode] = useState<PodcastEpisode>(() => generatePodcastEpisode(topic, hostA, hostB));
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);

  const handleGenerate = () => {
    const ep = generatePodcastEpisode(topic, hostA, hostB);
    setEpisode(ep);
    setIsPlaying(false);
    setActiveTurnId(null);
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
      {/* Left Sidebar: Settings & Controls */}
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Podcast Controls</div>
          <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">2-Host Studio</span>
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

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400">HOST A (LEAD ORATOR)</label>
            <select
              value={hostA.id}
              onChange={(e) => setHostA(PRESET_PERSONAS.find(p => p.id === e.target.value) || PRESET_PERSONAS[0])}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
            >
              {PRESET_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>{p.avatarEmoji} {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400">HOST B (CO-HOST / COUNTER)</label>
            <select
              value={hostB.id}
              onChange={(e) => setHostB(PRESET_PERSONAS.find(p => p.id === e.target.value) || PRESET_PERSONAS[3])}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
            >
              {PRESET_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>{p.avatarEmoji} {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
        >
          <Sparkles className="h-4 w-4" /> Synthesize 2-Host Episode
        </button>

        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-2 text-slate-400">
          <div className="flex justify-between"><span>Est. Duration:</span> <strong className="text-slate-200">{episode.totalDurationSec}s</strong></div>
          <div className="flex justify-between"><span>Turns:</span> <strong className="text-slate-200">{episode.dialogueTurns.length} segments</strong></div>
          <div className="flex justify-between"><span>Intro Music:</span> <strong className="text-slate-200">{episode.introMusicTrack}</strong></div>
          <div className="flex justify-between"><span>Audio Ducking:</span> <strong className="text-slate-200">{episode.musicDuckingDb} dB</strong></div>
        </div>
      </aside>

      {/* Main Content: Audio Player & Turn Timeline */}
      <section className="space-y-5">
        {/* Master Waveform Bar */}
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-r from-purple-950/20 via-[#0c1017] to-pink-950/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-pink-400">Master Episode Stream</div>
              <h2 className="text-xl font-black text-white">{episode.title}</h2>
              <p className="mt-1 text-xs text-slate-400">{episode.summary}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-400"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause Episode" : "Play Full Episode"}
              </button>
              <button
                onClick={() => alert("Downloading Podcast Episode MP3...")}
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
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Dialogue Turns & Script Breakdown</div>
          <div className="space-y-3 pt-2">
            {episode.dialogueTurns.map((turn) => {
              const isHost = turn.role === "host";
              return (
                <div
                  key={turn.id}
                  onClick={() => setActiveTurnId(turn.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${activeTurnId === turn.id ? "border-pink-500/50 bg-pink-500/[0.07]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-black text-white">
                        {isHost ? "A" : "B"}
                      </span>
                      <div>
                        <span className="text-xs font-black text-white">{turn.speakerName}</span>
                        <span className="ml-2 text-[10px] text-slate-400 capitalize">({turn.role})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-pink-300">
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
