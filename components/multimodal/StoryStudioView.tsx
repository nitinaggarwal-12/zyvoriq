"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Download,
  Users,
  Feather,
  Copy,
  Check,
  Flame,
  Layers
} from "lucide-react";
import {
  generateEpisodicStory,
  EpisodicStory,
  StoryCharacter,
  StoryChapter
} from "@/lib/multimodal/storyEngine";

interface StoryStudioViewProps {
  initialTopic: string;
}

export function StoryStudioView({ initialTopic }: StoryStudioViewProps) {
  const [topic, setTopic] = useState(initialTopic || "The Zero-Day Protocol");
  const [genre, setGenre] = useState("Cyberpunk Neo-Noir / High Tech");
  const [story, setStory] = useState<EpisodicStory>(() => generateEpisodicStory(topic, genre));
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setStory(generateEpisodicStory(topic, genre));
  };

  const copyStory = async () => {
    const fullText = story.chapters.map(c => `Chapter ${c.chapterNumber}: ${c.title}\n\n${c.narrativeText}\n\nCliffhanger: ${c.cliffhanger}`).join("\n\n---\n\n");
    try { await navigator.clipboard.writeText(fullText); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Sidebar Controls */}
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Story & Novel Studio</div>
          <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">Narrative Lore</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">STORY PREMISE / CORE MYSTERY</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3.5 text-sm text-white outline-none focus:border-pink-300/40"
            placeholder="What is the story about?"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400">GENRE & WORLD SETTING</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="Cyberpunk Neo-Noir / High Tech">Cyberpunk Neo-Noir / High Tech</option>
            <option value="Epic Sci-Fi Space Opera">Epic Sci-Fi Space Opera</option>
            <option value="Psychological Thriller">Psychological Thriller</option>
            <option value="High-Stakes Silicon Valley Drama">High-Stakes Silicon Valley Drama</option>
            <option value="Dark Fantasy Lore">Dark Fantasy Lore</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
        >
          <Sparkles className="h-4 w-4" /> Generate Episodic Chapters
        </button>

        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-2 text-slate-400">
          <div className="flex justify-between"><span>Total Words:</span> <strong className="text-slate-200">{story.totalWordCount} words</strong></div>
          <div className="flex justify-between"><span>Characters:</span> <strong className="text-slate-200">{story.characters.length} profiles</strong></div>
          <div className="flex justify-between"><span>Chapters:</span> <strong className="text-slate-200">{story.chapters.length} episodes</strong></div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyStory}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Story"}
          </button>
          <button
            onClick={() => alert("Downloading Manuscript as EPUB / Markdown...")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-pink-500/10 py-3 text-xs font-bold text-pink-200 transition hover:bg-pink-500/20"
          >
            <Download className="h-3.5 w-3.5" /> Export Manuscript
          </button>
        </div>
      </aside>

      {/* Main Story & Lore Display */}
      <section className="space-y-6">
        {/* Story Header */}
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-r from-purple-950/20 via-[#0c1017] to-pink-950/20 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400">{story.genre}</div>
          <h2 className="mt-1 text-2xl font-black text-white">{story.title}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{story.premise}</p>
        </div>

        {/* Character Lore Cards */}
        <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Dramatis Personae (Character Lore)</div>
          <div className="grid gap-3 md:grid-cols-2">
            {story.characters.map((char) => (
              <div key={char.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{char.name}</span>
                  <span className="rounded-md border border-pink-500/30 bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                    {char.archetype}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400"><strong>Motive:</strong> {char.motive}</div>
                <div className="mt-1 text-[11px] text-slate-400"><strong>Flaw:</strong> {char.flaw}</div>
                <div className="mt-2 text-[11px] italic text-pink-200/80">"{char.catchphrase}"</div>
              </div>
            ))}
          </div>
        </div>

        {/* Episodic Chapters */}
        <div className="space-y-4">
          {story.chapters.map((chap) => (
            <div key={chap.id} className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-xs font-bold text-pink-400">Chapter {chap.chapterNumber}</span>
                  <h3 className="text-lg font-black text-white">{chap.title}</h3>
                </div>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-400">
                  📍 {chap.sceneSetting}
                </span>
              </div>

              <p className="text-sm leading-7 text-slate-200">{chap.narrativeText}</p>

              {/* Dialogue Box */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="text-[10px] font-black uppercase text-slate-500">Key Dialogue Exchange</div>
                {chap.keyDialogue.map((d, i) => (
                  <div key={i} className="text-xs text-slate-300">
                    <strong className="text-pink-300">{d.speaker}:</strong> "{d.line}"
                  </div>
                ))}
              </div>

              {/* Cliffhanger Callout */}
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                <Flame className="h-4 w-4 shrink-0 text-amber-400" />
                <span><strong>Cliffhanger:</strong> {chap.cliffhanger}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
