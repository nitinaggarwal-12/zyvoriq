"use client";

import React, { useState } from "react";
import {
  Music,
  Sparkles,
  Download,
  Play,
  Volume2,
  Sliders,
  Flame,
  Zap,
  Radio
} from "lucide-react";
import {
  generateSongComposition,
  SongComposition,
  SongGenre,
  LyricSection
} from "@/lib/multimodal/songEngine";

interface SongStudioViewProps {
  initialTopic: string;
}

export function SongStudioView({ initialTopic }: SongStudioViewProps) {
  const [topic, setTopic] = useState(initialTopic || "Midnight City Lights");
  const [genre, setGenre] = useState<SongGenre>("synthwave_pop");
  const [song, setSong] = useState<SongComposition>(() => generateSongComposition(topic, genre));

  const handleGenerate = () => {
    setSong(generateSongComposition(topic, genre));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Sidebar Controls */}
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Song & Lyric Studio</div>
          <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">Composition Engine</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">SONG THEME / TOPIC</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3.5 text-sm text-white outline-none focus:border-pink-300/40"
            placeholder="What is your song or track about?"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">GENRE & STYLE</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as SongGenre)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="synthwave_pop">Synthwave Pop (124 BPM · Neon Retro)</option>
            <option value="lofi_hiphop">Lo-Fi Chill Hip-Hop (85 BPM · Study Vibes)</option>
            <option value="cyber_edm">Cyber EDM / Future Bass (128 BPM · Festival Drop)</option>
            <option value="cinematic_orchestral">Cinematic Orchestral (Dramatic Strings)</option>
            <option value="acoustic_indie">Acoustic Indie (Warm Guitar & Vocals)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
        >
          <Sparkles className="h-4 w-4" /> Compose Lyrics & Structure
        </button>

        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-2 text-slate-400">
          <div className="flex justify-between"><span>Tempo:</span> <strong className="text-slate-200">{song.tempoBpm} BPM</strong></div>
          <div className="flex justify-between"><span>Key:</span> <strong className="text-slate-200">{song.musicalKey}</strong></div>
          <div className="flex justify-between"><span>Sections:</span> <strong className="text-slate-200">{song.sections.length} parts</strong></div>
        </div>

        <button
          onClick={() => alert("Downloading Song Lyrics & Meter Sheet...")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-bold text-white transition hover:bg-white/10"
        >
          <Download className="h-4 w-4 text-pink-400" /> Export Lyrics & Audio Cues
        </button>
      </aside>

      {/* Main Track & Lyrics Display */}
      <section className="space-y-6">
        {/* Track Banner */}
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-r from-pink-950/20 via-[#0c1017] to-purple-950/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-pink-400">Master Song Arrangement</div>
              <h2 className="text-xl font-black text-white">{song.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-slate-300">🎹 {song.musicalKey}</span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-slate-300">⚡ {song.tempoBpm} BPM</span>
                <span className="rounded-lg bg-pink-500/20 text-pink-300 px-2.5 py-1 font-bold">🎤 {song.vocalStyle}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Simulating Beat-Synced Audio Playback...")}
                className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-400"
              >
                <Play className="h-4 w-4" /> Preview Audio Track
              </button>
            </div>
          </div>
        </div>

        {/* Structured Lyric Sections */}
        <div className="space-y-4">
          {song.sections.map((sec) => (
            <div
              key={sec.id}
              className={`rounded-[22px] border p-5 ${sec.type === "chorus" ? "border-pink-500/40 bg-pink-500/[0.05]" : sec.type === "bridge" ? "border-purple-500/40 bg-purple-500/[0.05]" : "border-white/10 bg-[#0a0d12]"}`}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-white">{sec.title}</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                    Rhyme: {sec.rhymeScheme}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Energy: {sec.energyLevel}/10
                </div>
              </div>

              <div className="mt-4 space-y-2 font-mono text-sm leading-relaxed text-slate-200">
                {sec.lines.map((line, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>{line}</span>
                    <span className="text-[10px] text-slate-600 font-sans">Line {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
