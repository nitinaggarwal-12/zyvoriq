"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Zap,
  ArrowLeft,
  Music,
  Tv,
  Mic,
  Disc,
  Play,
  Pause,
  Layers,
  Radio,
  Sliders,
  ShieldCheck,
  Download,
  Share2,
  FileText,
  Clock,
  Sparkle
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";
import { LyriaSongArranger } from "@/components/studio/premium/LyriaSongArranger";

interface MusicAct {
  act: number;
  title: string;
  duration: number;
  lyrics: string;
  translation: string;
  scenePrompt: string;
}

const DEFAULT_GENRES = [
  { id: "bollywood_sangeet", name: "Bollywood Grand Sangeet", tempo: "128 BPM", mood: "Festive & Lavish" },
  { id: "punjabi_bhangra", name: "High-Energy Bhangra", tempo: "135 BPM", mood: "Celebratory & Heavy Dhol" },
  { id: "sufi_fusion", name: "Sufi Qawwali Rock", tempo: "110 BPM", mood: "Soulful & Transcendental" },
  { id: "desi_hiphop", name: "Desi Hip-Hop & Drill", tempo: "140 BPM", mood: "Gritty & Punchy" },
  { id: "synthwave_cyber", name: "Cyberpunk Synthwave", tempo: "120 BPM", mood: "Neon & Retro-Futuristic" },
  { id: "cinematic_epic", name: "Epic Orchestral OST", tempo: "95 BPM", mood: "Heroic & Grand" },
];

const DEFAULT_ACTS: MusicAct[] = [
  {
    act: 1,
    title: "Act 1: Grand Palace Sangeet Entry",
    duration: 8,
    lyrics: "ढोल बजे, शहनाई गूंजे, खुशियों की ये रात है...",
    translation: "Drums beat, the shehnai echoes, tonight is the night of pure celebration...",
    scenePrompt: "Royal Rajasthan palace illuminated by 10,000 glowing diyas. Bride in crimson-gold zardozi lehenga dancing joyfully with bridesmaids under floral archways."
  },
  {
    act: 2,
    title: "Act 2: Groom Baraat & Live Dhol Rhythms",
    duration: 8,
    lyrics: "सारे रिश्तेदार नाचें, दिल में बस गई बात है...",
    translation: "All the relatives are dancing, love has settled deep in every heart...",
    scenePrompt: "Groom in embroidered ivory-gold sherwani dancing Bhangra with cousins amidst live Punjabi dhol drummers and rose petal showers."
  },
  {
    act: 3,
    title: "Act 3: Couple Center Stage Dance",
    duration: 8,
    lyrics: "बल्ले बल्ले झूमे सजना, सहेलियां गाएं तराना...",
    translation: "The couple sways in bliss, lifelong friends sing sweet celebratory melodies...",
    scenePrompt: "Lavish floral ballroom stage with chandelier lighting. Bride and groom performing synchronized romantic Bollywood choreography."
  },
  {
    act: 4,
    title: "Act 4: Grand Finale & Confetti Celebration",
    duration: 8,
    lyrics: "आज हमारे यार का ब्याह, रंग दे सारा ज़माना!",
    translation: "Today is our beloved one's grand wedding, let's paint the entire world in joy!",
    scenePrompt: "Multi-generational family dancing together on the palace terrace under golden confetti cannons and midnight sky fireworks."
  }
];

function MusicStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedGenre, setSelectedGenre] = useState("bollywood_sangeet");
  const [songTitle, setSongTitle] = useState("शाही शादी संगीत · Grand Family Wedding");
  const [vocalType, setVocalType] = useState<"solo_female" | "solo_male" | "duet" | "instrumental">("solo_female");
  const [language, setLanguage] = useState("hi-IN");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [activeActIndex, setActiveActIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"arranger" | "visualizer" | "lyrics" | "acts">("arranger");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSongTitle(q);
    }
  }, [searchParams]);

  const handleSurprisePrompt = () => {
    const ideas = [
      {
        title: "शाही शादी संगीत · Grand Bollywood Palace Wedding",
        genre: "bollywood_sangeet",
        vocal: "solo_female" as const
      },
      {
        title: "रूहानियत सूफी · Transcendental Sufi Qawwali Night",
        genre: "sufi_fusion",
        vocal: "solo_male" as const
      },
      {
        title: "पंजाब की शान · High-Energy Dhol Baraat Anthem",
        genre: "punjabi_bhangra",
        vocal: "solo_male" as const
      },
      {
        title: "Neon Monsoon · Cyberpunk Synthwave Odyssey",
        genre: "synthwave_cyber",
        vocal: "duet" as const
      }
    ];
    const pick = ideas[Math.floor(Math.random() * ideas.length)];
    setSongTitle(pick.title);
    setSelectedGenre(pick.genre);
    setVocalType(pick.vocal);
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    router.push(
      `/studio?mode=music_video&title=${encodeURIComponent(songTitle)}&genre=${selectedGenre}&vocal=${vocalType}&aspectRatio=${aspectRatio}`
    );
  };

  const activeAct = DEFAULT_ACTS[activeActIndex];

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-8xl w-full max-w-full overflow-x-hidden mx-auto px-6 py-8 md:px-12 space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/studio/create"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Creation Hub
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-300 font-mono">
              <Disc className="w-3.5 h-3.5 animate-spin" /> AI MUSIC VIDEO STUDIO
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3 inline mr-1" /> C2PA PROVENANCE READY
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
            <span>AI Music Video & Lyric Studio</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-4xl leading-relaxed">
            Synthesize multi-act continuous music videos, synchronized lyrics, authentic acoustic stems (Dhol, Shehnai, Synth), and cinematic 4K visuals.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("arranger")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "arranger"
                ? "bg-purple-500 text-obsidian-950 shadow-lg shadow-purple-500/20"
                : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Disc className="w-3.5 h-3.5" /> 🎼 Lyria 3.0 Pro Arranger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("visualizer")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "visualizer"
                ? "bg-amber-500 text-obsidian-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> 🎬 Master Video Stage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lyrics")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "lyrics"
                ? "bg-amber-500 text-obsidian-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> ✍️ Lyrics & Vocals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("acts")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "acts"
                ? "bg-amber-500 text-obsidian-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 🎞️ 4-Act Storyboard
          </button>
        </div>

        {/* Main Studio Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Visualizer / Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {activeTab === "arranger" && (
              <LyriaSongArranger
                currentTier="pro"
                initialPresetId={selectedGenre === "bollywood_sangeet" ? "bollywood_fusion" : "adaptive_cinematic"}
                onSongChange={(config) => {
                  console.log("Lyria Song Configuration updated:", config);
                }}
              />
            )}
            {activeTab === "visualizer" && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-3xl border border-amber-500/30 bg-black/90 overflow-hidden shadow-2xl flex items-center justify-center group">
                  <video
                    src="/assets/video/persona6_heritage_mythology_reel.mp4"
                    controls
                    playsInline
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 rounded-full border border-amber-500/40 bg-black/70 px-3 py-1 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md">
                    4K UHD · MULTI-ACT CONTINUOUS REEL
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                    32s MASTER TIMELINE
                  </div>
                </div>

                {/* Act Selector Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DEFAULT_ACTS.map((actItem, idx) => (
                    <button
                      key={actItem.act}
                      type="button"
                      onClick={() => setActiveActIndex(idx)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        activeActIndex === idx
                          ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                          : "border-white/5 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold text-amber-400">ACT {actItem.act} · 8s</div>
                      <div className="text-xs font-bold truncate mt-0.5">{actItem.title.split(":")[1] || actItem.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "lyrics" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" /> Synchronized Song Lyrics
                  </h3>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {vocalType.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  {DEFAULT_ACTS.map((item) => (
                    <div key={item.act} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="text-[11px] font-mono text-amber-400 font-bold">
                        ACT {item.act} (0:0{item.act * 8 - 8} - 0:{item.act * 8 < 10 ? "0" : ""}{item.act * 8})
                      </div>
                      <p className="text-base font-bold text-amber-200">{item.lyrics}</p>
                      <p className="text-xs text-slate-400 italic">"{item.translation}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "acts" && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" /> 4-Act Storyboard & Scene Plans
                </h3>
                <div className="space-y-3">
                  {DEFAULT_ACTS.map((item) => (
                    <div key={item.act} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.duration}s Cut</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.scenePrompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Generation Controls Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Track & Video Synthesis</h2>
                </div>
                <button
                  type="button"
                  onClick={handleSurprisePrompt}
                  className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Surprise Me
                </button>
              </div>

              {/* Song Title / Theme Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Song Title & Cinematic Theme</span>
                  <span className="text-[10px] font-mono text-slate-500">Prompt</span>
                </label>
                <textarea
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-white/10 bg-black/50 p-3.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  placeholder="e.g. Royal Palace Bollywood Sangeet Wedding Anthem with live Dhol rhythms"
                />
              </div>

              {/* Musical Genre */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Musical Genre & Acoustic Arrangement</label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => setSelectedGenre(genre.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedGenre === genre.id
                          ? "border-amber-400 bg-amber-500/15 text-white"
                          : "border-white/5 bg-black/30 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{genre.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{genre.tempo} · {genre.mood}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vocal Mode & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Vocal Arrangement</label>
                  <select
                    value={vocalType}
                    onChange={(e) => setVocalType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="solo_female">Solo Lead Female</option>
                    <option value="solo_male">Solo Lead Male</option>
                    <option value="duet">Romantic Duet</option>
                    <option value="instrumental">Instrumental / Acoustic</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="en-US">English (Global)</option>
                    <option value="es-ES">Spanish (Español)</option>
                    <option value="ja-JP">Japanese (日本語)</option>
                  </select>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Video Canvas Framing</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aspectRatio === "16:9"
                        ? "border-amber-400 bg-amber-500/20 text-white"
                        : "border-white/5 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    📺 16:9 Landscape (YouTube)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      aspectRatio === "9:16"
                        ? "border-amber-400 bg-amber-500/20 text-white"
                        : "border-white/5 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    📱 9:16 Portrait (Reels)
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!songTitle.trim() || isGenerating}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-obsidian-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? "Synthesizing Master Video..." : "Synthesize AI Music Video"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </StudioSidebar>
  );
}

export default function MusicStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-400">
          Loading Music Studio...
        </div>
      }
    >
      <MusicStudioContent />
    </Suspense>
  );
}
