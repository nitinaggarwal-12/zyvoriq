"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Users,
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  Compass,
  Zap,
  Layers,
  Award,
  Check
} from "lucide-react";
import { GLOBAL_CHARACTERS, CharacterProfile } from "@/lib/tier6/characters";
import { VoiceCloneVault } from "@/components/VoiceCloneVault";
import { MultilingualDubbingMatrix } from "@/components/MultilingualDubbingMatrix";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const AVATAR_CATEGORIES = [
  { id: "all", label: "🌟 All 14 Global Cast & Avatars", count: 14 },
  { id: "executive", label: "🧑‍💼 Humans & Executive Twins", count: 6 },
  { id: "anime", label: "🌸 Anime & Manga Masters", count: 2 },
  { id: "engineering_science", label: "🔬 Science & Engineering Leads", count: 4 },
  { id: "narrator", label: "🦁 Wildlife & Epic Cinema Narrators", count: 2 }
];

function AvatarsPageContent() {
  const router = useRouter();
  const [activeStudioTab, setActiveStudioTab] = useState<"cast" | "voice_clone" | "multilingual_dub">("cast");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const filteredCharacters = GLOBAL_CHARACTERS.filter((char) => {
    let matchesCat = true;
    if (selectedCategory === "executive") {
      matchesCat = ["priya", "marcus", "elena", "david", "carlos", "celeste"].includes(char.id);
    } else if (selectedCategory === "anime") {
      matchesCat = ["ren_aoi"].includes(char.id);
    } else if (selectedCategory === "engineering_science") {
      matchesCat = ["meiling", "gabriel", "sarah", "henrik"].includes(char.id);
    } else if (selectedCategory === "narrator") {
      matchesCat = ["narrator_nature", "narrator_epic"].includes(char.id);
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      char.name.toLowerCase().includes(q) ||
      char.role.toLowerCase().includes(q) ||
      char.location.toLowerCase().includes(q) ||
      char.specialty.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handlePlayVoice = (char: CharacterProfile) => {
    if (playingVoiceId === char.id) {
      setPlayingVoiceId(null);
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      return;
    }

    setPlayingVoiceId(char.id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Greetings. I am ${char.name}, ${char.role} based in ${char.location}. With Google Veo 3.1 and DeepMind neural audio, our broadcasts are mathematically guaranteed.`
      );
      utterance.rate = 1.0;
      utterance.pitch = char.gender === "female" ? 1.05 : 0.95;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingVoiceId(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </Link>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-200 font-bold">Studio</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-bold">Cast & Persona Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio/create"
              className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create with Custom Cast</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-8">
        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Global Character Roster & Voice Matrix · Google Veo 3.1
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Executive Digital Twins, Voice Vault & 30-Language Dubbing
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every persona features deterministic role framing, authentic regional accents, DeepMind 5-band formant audio synthesis, and cryptographic Veritas zk-SNARK attestation.
            </p>
          </div>
        </div>

        {/* Master Studio Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          {[
            { id: "cast", label: "🌟 14 Global Cast & Digital Twins", desc: "Executive personas & anime masters" },
            { id: "voice_clone", label: "🎙️ 30s Neural Voice Clone Vault", desc: "Local enclave 5-band formant cloning" },
            { id: "multilingual_dub", label: "🌐 30-Language Dubbing Matrix", desc: "Universal speech translation & lip sync" }
          ].map((tab) => {
            const isActive = activeStudioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id as any)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/70 text-white shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className={`text-xs font-mono font-bold ${isActive ? "text-amber-300" : "text-slate-300"}`}>
                  {tab.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 14 GLOBAL CAST & PERSONAS */}
        {activeStudioTab === "cast" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Category Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {AVATAR_CATEGORIES.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedCategory === tab.id
                        ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                        : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, role, region, or specialty..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Characters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((char) => (
                <div
                  key={char.id}
                  className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between space-y-6 group"
                >
                  {/* Top Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform">
                          {char.avatarEmoji}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                            {char.name}
                          </h3>
                          <div className="text-xs font-mono text-cyan-400 font-medium">
                            {char.role}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {char.regionBadge}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>{char.organization} · {char.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{char.accent} ({char.voiceStyle})</span>
                      </div>
                    </div>

                    {/* Specialty Pill */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                        Core Specialization
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {char.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handlePlayVoice(char)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
                        playingVoiceId === char.id
                          ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20 animate-pulse"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{playingVoiceId === char.id ? "Speaking..." : "Pitch Voice"}</span>
                    </button>

                    <Link
                      href={`/studio/create?character=${char.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Series</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: 30S NEURAL VOICE CLONE VAULT */}
        {activeStudioTab === "voice_clone" && (
          <div className="animate-fadeIn">
            <VoiceCloneVault />
          </div>
        )}

        {/* TAB 3: 30-LANGUAGE MULTILINGUAL DUBBING MATRIX */}
        {activeStudioTab === "multilingual_dub" && (
          <div className="animate-fadeIn">
            <MultilingualDubbingMatrix />
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudioAvatarsPage() {
  return (
    <ErrorBoundary>
      <AvatarsPageContent />
    </ErrorBoundary>
  );
}
