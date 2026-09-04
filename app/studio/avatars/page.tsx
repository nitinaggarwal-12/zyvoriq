"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Check,
  Bot,
  Sliders,
  ScreenShare
} from "lucide-react";
import { GLOBAL_CHARACTERS, CharacterProfile } from "@/lib/tier6/characters";
import { VoiceCloneVault } from "@/components/VoiceCloneVault";
import { MultilingualDubbingMatrix } from "@/components/MultilingualDubbingMatrix";
import { AvatarProfileCustomizer } from "@/components/AvatarProfileCustomizer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StudioSidebar } from "@/components/StudioSidebar";

const AVATAR_CATEGORIES = [
  { id: "all", label: "🌟 All 14 Global Cast & Avatars", count: 14 },
  { id: "executive", label: "🧑‍💼 Humans & Executive Twins", count: 6 },
  { id: "anime", label: "🌸 Anime & Manga Masters", count: 2 },
  { id: "engineering_science", label: "🔬 Science & Engineering Leads", count: 4 },
  { id: "narrator", label: "🦁 Wildlife & Epic Cinema Narrators", count: 2 }
];

const AVATAR_IMAGE_MAP: Record<string, string> = {
  elena: "/assets/avatars/avatar_elena_founder.jpg",
  priya: "/assets/avatars/avatar_priya_cto.jpg",
  marcus: "/assets/avatars/avatar_keynote_gesture.jpg",
  david: "/assets/avatars/avatar_executive_gravitas.jpg",
  celeste: "/assets/avatars/avatar_female_executive.jpg",
  maya: "/assets/avatars/avatar_maya_fireside.jpg",
  ren_aoi: "/assets/avatars/avatar_fireside_journey.jpg"
};

function AvatarsPageContent() {
  const router = useRouter();
  const [activeStudioTab, setActiveStudioTab] = useState<"cast" | "voice_clone" | "multilingual_dub" | "chat_copilot">("chat_copilot");
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

  const currentAuditionIdRef = useRef<string | null>(null);

  const handlePlayVoice = (char: CharacterProfile) => {
    if (playingVoiceId === char.id) {
      currentAuditionIdRef.current = null;
      setPlayingVoiceId(null);
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      return;
    }

    currentAuditionIdRef.current = char.id;
    setPlayingVoiceId(char.id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Greetings. I am ${char.name}, ${char.role} based in ${char.location}. With Zyvoriq Neural Cinema and proprietary synthetic audio, our broadcasts are mathematically guaranteed.`
      );
      utterance.rate = 1.0;
      utterance.pitch = char.gender === "female" ? 1.05 : 0.95;
      utterance.onend = () => {
        if (currentAuditionIdRef.current === char.id) {
          setPlayingVoiceId(null);
        }
      };
      utterance.onerror = () => {
        if (currentAuditionIdRef.current === char.id) {
          setPlayingVoiceId(null);
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        if (currentAuditionIdRef.current === char.id) {
          setPlayingVoiceId(null);
        }
      }, 3000);
    }
  };

  return (
    <StudioSidebar>
      {/* Sub-Header Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Creation Studio</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-teal-400 font-semibold">Virtual Chat Avatars &amp; Cast Matrix</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zyvoriq Viseme Lip-Sync Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-8">
        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Global Character Roster &amp; Preferred Copilot Studio
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Virtual Chat Avatars, Wardrobe Attire &amp; Voice Vault
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Personalize your preferred virtual chat concierge and screen-sharing copilot. Choose wardrobe attire, Zyvoriq neural vocal pitch, conversational tone, and real-time screen-sharing guidance behavior.
            </p>
          </div>
        </div>

        {/* Master Studio Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          {[
            { id: "chat_copilot", label: "💬 Preferred Chat & Copilot Avatar", desc: "Attire, voice pitch & screen tone" },
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
                    ? "bg-gradient-to-r from-teal-500/20 to-emerald-600/10 border-teal-500/70 text-white shadow-lg shadow-teal-500/10"
                    : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className={`text-xs font-mono font-bold ${isActive ? "text-teal-300" : "text-slate-300"}`}>
                  {tab.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {tab.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB 0: PREFERRED CHAT & COPILOT AVATAR CUSTOMIZER */}
        {activeStudioTab === "chat_copilot" && (
          <div className="animate-fadeIn">
            <AvatarProfileCustomizer />
          </div>
        )}

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
                        ? "bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                        : "bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-[10px] text-slate-300">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search character name, role, region, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCharacters.map((char) => (
                <div
                  key={char.id}
                  className="group rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-teal-500/50 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      {AVATAR_IMAGE_MAP[char.id] ? (
                        <Image
                          src={AVATAR_IMAGE_MAP[char.id]}
                          alt={char.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-4xl">
                          {char.avatarEmoji}
                        </div>
                      )}

                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-teal-300 font-bold">
                        {char.location}
                      </div>
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-white">{char.name}</div>
                      <div className="text-xs text-teal-400 font-medium">{char.role}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{char.specialty}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePlayVoice(char)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border ${
                        playingVoiceId === char.id
                          ? "bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/25"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{playingVoiceId === char.id ? "Auditioning..." : "Audition Voice"}</span>
                    </button>

                    <Link
                      href={`/studio/create?characterLock=${char.id}`}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/10 hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Create Video</span>
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
    </StudioSidebar>
  );
}

export default function StudioAvatarsPage() {
  return (
    <ErrorBoundary>
      <AvatarsPageContent />
    </ErrorBoundary>
  );
}
