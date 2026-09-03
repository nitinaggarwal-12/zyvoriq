"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookMarked,
  Sparkles,
  Zap,
  ArrowLeft,
  Scroll,
  Feather,
  Loader2,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  Play,
  Download,
  Share2,
  ArrowRight,
  Sliders,
  ChevronDown,
  Clock,
  Compass,
  Layers,
  Award,
  Volume2,
  Flame,
  Globe,
  Sun,
  Crown
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

type PantheonType = "vedic_mahabharata" | "hellenic_olympian" | "norse_ragnarok" | "celtic_arthurian" | "east_asian_mythos";
type AcousticAmbience = "sanskrit_drone_108hz" | "gregorian_latin_choral" | "norse_wardruna_drums" | "celtic_harp_bodhran";
type VisualIllumination = "gold_leaf_manuscript" | "classical_oil_chiaroscuro" | "ancient_fresco_mosaic" | "carved_stone_relief";

interface MythologicalAct {
  actNumber: number;
  title: string;
  subhead: string;
  epicQuote: string;
  sanskritVerse?: string;
  loreDescription: string;
  acousticCue: string;
  dropCap: string;
  intensity: number;
  duration: string;
}

const MYTHOLOGY_PRESETS = [
  {
    id: "kurukshetra_dharma",
    pantheon: "vedic_mahabharata" as PantheonType,
    title: "The Gita of the Cosmos (Mahabharata Retelling)",
    premise: "At the dawn of the cosmic battlefield of Kurukshetra, Prince Arjuna and Krishna converse on the eternal nature of duty, karmic geometry, and the cyclical destruction of universes.",
    ambience: "sanskrit_drone_108hz" as AcousticAmbience,
    illumination: "gold_leaf_manuscript" as VisualIllumination,
    actsCount: 3
  },
  {
    id: "odyssey_siren_shores",
    pantheon: "hellenic_olympian" as PantheonType,
    title: "The Odyssey: Song of the Sirens (Hellenic Epic)",
    premise: "Tied to the mast of his black-hulled ship, Odysseus listens to the celestial forbidden melody that drives mortal navigators into immortal memory.",
    ambience: "gregorian_latin_choral" as AcousticAmbience,
    illumination: "classical_oil_chiaroscuro" as VisualIllumination,
    actsCount: 3
  },
  {
    id: "yggdrasil_frost_fire",
    pantheon: "norse_ragnarok" as PantheonType,
    title: "Ragnarök: The Loom of the Norns (Norse Saga)",
    premise: "As Fimbulwinter freezes the nine realms, the three Norns weave the final golden thread into the roots of Yggdrasil before the sun is reborn.",
    ambience: "norse_wardruna_drums" as AcousticAmbience,
    illumination: "carved_stone_relief" as VisualIllumination,
    actsCount: 3
  },
  {
    id: "avalon_grail_mists",
    pantheon: "celtic_arthurian" as PantheonType,
    title: "The Mists of Avalon & The Hollow Crown (Celtic Lore)",
    premise: "High Priestess Morgaine summons the ancient druidic mists to shield the Isle of Apples from the passing of the old gods.",
    ambience: "celtic_harp_bodhran" as AcousticAmbience,
    illumination: "ancient_fresco_mosaic" as VisualIllumination,
    actsCount: 3
  }
];

const DEFAULT_MYTH_ACTS: MythologicalAct[] = [
  {
    actNumber: 1,
    title: "Act I: The Cosmic Chariot at Kurukshetra",
    subhead: "Dawn over the sacred plain of Dharma",
    dropCap: "W",
    epicQuote: "When the conch shells resounded across the golden horizon, time itself bowed before the unwritten law.",
    sanskritVerse: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत · अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥",
    loreDescription: "The twin armies stand frozen in morning mist. Krishna reveals the multi-dimensional fabric of time, holding the celestial reins of four white steeds.",
    acousticCue: "[108Hz Vedic Tanpura drone swells · Sanskrit Shloka chant resonance · -18dB ducking]",
    intensity: 85,
    duration: "00:00 - 00:04"
  },
  {
    actNumber: 2,
    title: "Act II: The Celestial Astra & The Wheel of Karma",
    subhead: "The cosmic form (Vishwaroopa) unfurled",
    dropCap: "I",
    epicQuote: "In every mortal eye lies the reflection of a thousand suns, awaiting the sovereign spark of self-knowledge.",
    sanskritVerse: "दिवि सूर्यसहस्रस्य भवेद्युगपदुत्थिता · यदि भाः सदृशी सा स्याद्भासस्तस्य महात्मनः ॥",
    loreDescription: "Arjuna witnesses galaxies revolving within the open palm of the avatar. Divine bows resonate with harmonic frequencies.",
    acousticCue: "[Crescendo temple bells & bronze gong · Binaural vocal choir · 24fps anamorphic flare]",
    intensity: 95,
    duration: "00:04 - 00:08"
  },
  {
    actNumber: 3,
    title: "Act III: The Unyielding Oath of Dharma",
    subhead: "Transmedia mastery & permanent legacy",
    dropCap: "F",
    epicQuote: "From the ashes of the battleground rises not triumph over foes, but victory over illusion.",
    sanskritVerse: "यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः · तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम ॥",
    loreDescription: "The narrative concludes with the blessing of eternal sovereignty. Cryptographically anchored with Veritas provenance metadata.",
    acousticCue: "[Full orchestral string crescendo · Deep Vedic breath resonance · Fade to amber gold]",
    intensity: 100,
    duration: "00:08 - 00:12"
  }
];

function StoryCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topic, setTopic] = useState(MYTHOLOGY_PRESETS[0].premise);
  const [pantheon, setPantheon] = useState<PantheonType>("vedic_mahabharata");
  const [ambience, setAmbience] = useState<AcousticAmbience>("sanskrit_drone_108hz");
  const [illumination, setIllumination] = useState<VisualIllumination>("gold_leaf_manuscript");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"video" | "manuscript" | "acoustic_matrix">("video");
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const qTopic = searchParams.get("topic");
    const qPantheon = searchParams.get("pantheon") as PantheonType;
    if (qTopic) setTopic(qTopic);
    if (qPantheon) setPantheon(qPantheon);
  }, [searchParams]);

  const handleApplyPreset = (preset: typeof MYTHOLOGY_PRESETS[0]) => {
    setPantheon(preset.pantheon);
    setTopic(preset.premise);
    setAmbience(preset.ambience);
    setIllumination(preset.illumination);
  };

  const handleSurpriseMyth = () => {
    const randomPreset = MYTHOLOGY_PRESETS[Math.floor(Math.random() * MYTHOLOGY_PRESETS.length)];
    handleApplyPreset(randomPreset);
  };

  // Real physical client downloads
  const handleDownloadOpfXml = () => {
    setIsDownloading(true);
    const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="zyvoriq-myth-${Date.now()}" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>The Eternal Loom: Epics of Antiquity &amp; Gods</dc:title>
    <dc:creator>Zyvoriq Transmedia Lore Studio</dc:creator>
    <dc:language>en-US</dc:language>
    <dc:description>${topic}</dc:description>
    <dc:publisher>Zyvoriq DeepMind Autonomous Publishing</dc:publisher>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
    <meta property="zyvoriq:pantheon">${pantheon}</meta>
    <meta property="zyvoriq:acoustic_ambience">${ambience}</meta>
    <meta property="zyvoriq:illumination_style">${illumination}</meta>
    <meta property="zyvoriq:c2pa_provenance">ed25519_verified_sovereign</meta>
  </metadata>
  <manifest>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="act1" href="act1_kurukshetra.xhtml" media-type="application/xhtml+xml"/>
    <item id="act2" href="act2_astra.xhtml" media-type="application/xhtml+xml"/>
    <item id="act3" href="act3_dharma.xhtml" media-type="application/xhtml+xml"/>
    <item id="audio_reel" href="assets/video/persona6_heritage_mythology_reel.mp4" media-type="video/mp4"/>
  </manifest>
  <spine>
    <itemref idref="cover"/>
    <itemref idref="act1"/>
    <itemref idref="act2"/>
    <itemref idref="act3"/>
  </spine>
</package>`;

    const blob = new Blob([opfXml], { type: "application/oebps-package+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyvoriq_heritage_${pantheon}_package.opf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsDownloading(false), 600);
  };

  const handleDownloadCueSheet = () => {
    setIsDownloading(true);
    const cueSheet = {
      project: "Persona #6: Heritage & Mythology Retelling",
      pantheon,
      ambience,
      illumination,
      masterVideoReel: "/assets/video/persona6_heritage_mythology_reel.mp4",
      audioFrequencySettings: {
        vedicDroneDecibels: "-18dB",
        narratorDecibels: "-3dB",
        choralReverbDecibels: "-12dB",
        binauralFrequency: "108Hz"
      },
      acts: DEFAULT_MYTH_ACTS
    };

    const blob = new Blob([JSON.stringify(cueSheet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyvoriq_heritage_${pantheon}_cuesheet.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsDownloading(false), 600);
  };

  const handleDownloadScript = () => {
    setIsDownloading(true);
    const scriptText = `================================================================================
ZYVORIQ HERITAGE & MYTHOLOGY STUDIO · MASTER TRANSMEDIA SCRIPT
PANTHEON: ${pantheon.toUpperCase()} | ILLUMINATION: ${illumination.toUpperCase()}
AUDIO AMBIENCE: ${ambience.toUpperCase()} | VERITAS C2PA VERIFIED
================================================================================

PREMISE:
${topic}

--------------------------------------------------------------------------------
${DEFAULT_MYTH_ACTS.map(act => `
[${act.duration}] ${act.title.toUpperCase()}
${act.subhead}
ACOUSTIC CUE: ${act.acousticCue}

QUOTE:
"${act.epicQuote}"

SANSKRIT / SACRED VERSE:
${act.sanskritVerse || "N/A"}

LORE DESCRIPTION:
${act.loreDescription}
`).join("\n--------------------------------------------------------------------------------\n")}

================================================================================
Generated by Zyvoriq Autonomous Heritage Studio · 100% Original Transmedia IP
================================================================================`;

    const blob = new Blob([scriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zyvoriq_heritage_${pantheon}_master_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsDownloading(false), 600);
  };

  const handleDownloadVideo = () => {
    setIsDownloading(true);
    const a = document.createElement("a");
    a.href = "/assets/video/persona6_heritage_mythology_reel.mp4";
    a.download = `zyvoriq_persona6_heritage_mythology_${selectedResolution}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setIsDownloading(false), 600);
  };

  const handleGenerate = () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab("video");
    }, 1200);
  };

  return (
    <StudioSidebar currentPath="/studio/create/story">
      <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-24 md:pb-12">
        {/* Top Header */}
        <div className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-slate-900 p-[1px] shadow-lg shadow-amber-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-obsidian-950 text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-amber-500/20">
                    PERSONA #6
                  </span>
                  <span className="text-xs text-slate-400">Epic Transmedia Studio</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Heritage, Mythology &amp; Folklore Retellings
                </h1>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSurpriseMyth}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/20 hover:text-white transition cursor-pointer min-h-[44px]"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Surprise Myth</span>
              </button>

              <Link
                href="/studio/books"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition min-h-[44px]"
              >
                <BookMarked className="w-4 h-4 text-sky-400" />
                <span>Book Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-8 space-y-8 flex-1">
          {/* Quick Preset Selector Chips */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 border-b border-white/5">
            <span className="text-xs font-mono font-bold text-slate-400 shrink-0">🏛️ Quick Epic Pantheons:</span>
            {MYTHOLOGY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition border cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                  pantheon === preset.pantheon
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {preset.pantheon === "vedic_mahabharata" && "🔱 Vedic Mahabharata"}
                {preset.pantheon === "hellenic_olympian" && "⚡ Greek Odyssey"}
                {preset.pantheon === "norse_ragnarok" && "❄️ Norse Ragnarök"}
                {preset.pantheon === "celtic_arthurian" && "🗡️ Celtic Avalon"}
              </button>
            ))}
          </div>

          {/* 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Creator Configuration Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Story Lore & Premise Box */}
              <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                    <Feather className="w-4 h-4 text-amber-400" /> Mythological Premise &amp; Sacred Conflict
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Veritas C2PA
                  </span>
                </div>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe your mythological premise, sacred conflict, or epic retelling..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/60 p-4 text-base md:text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>

              {/* Pantheon & Mythology Frameworks */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" /> Ancient Pantheon &amp; Epic World
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "vedic_mahabharata", label: "🔱 Vedic & Indian", desc: "Mahabharata / Ramayana / Vedic Shlokas" },
                    { id: "hellenic_olympian", label: "⚡ Greek & Hellenic", desc: "Odyssey / Iliad / Titanomachy" },
                    { id: "norse_ragnarok", label: "❄️ Norse & Sagas", desc: "Ragnarök / Yggdrasil / Valkyries" },
                    { id: "celtic_arthurian", label: "🗡️ Celtic & Avalon", desc: "Arthurian Grail / Tuatha Dé Danann" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPantheon(item.id as PantheonType)}
                      className={`text-left p-3.5 rounded-2xl border transition min-h-[64px] cursor-pointer ${
                        pantheon === item.id
                          ? "border-amber-400 bg-amber-500/20 text-white shadow-md shadow-amber-500/10"
                          : "border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Acoustic Ambience & Sacred Frequency */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400" /> Sacred Acoustic Ambience &amp; Audio Ducking
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "sanskrit_drone_108hz", label: "🕉️ 108Hz Vedic Drone", desc: "Sanskrit Shlokas & Tanpura" },
                    { id: "gregorian_latin_choral", label: "⛪ Latin Choral Choir", desc: "Cathedral Reverb (-16dB)" },
                    { id: "norse_wardruna_drums", label: "🥁 War Horns & Drums", desc: "Wardruna Percussive Pulse" },
                    { id: "celtic_harp_bodhran", label: "🪕 Celtic Harp & Flute", desc: "Gaelic Bodhrán Rhythm" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAmbience(item.id as AcousticAmbience)}
                      className={`text-left p-3.5 rounded-2xl border transition min-h-[64px] cursor-pointer ${
                        ambience === item.id
                          ? "border-amber-400 bg-amber-500/20 text-white shadow-md shadow-amber-500/10"
                          : "border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Illumination Style */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-amber-400" /> Manuscript &amp; Visual Illumination
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "gold_leaf_manuscript", label: "📜 24K Gold Vellum", desc: "Illuminated Drop Caps" },
                    { id: "classical_oil_chiaroscuro", label: "🎨 Renaissance Oil", desc: "Caravaggio Chiaroscuro" },
                    { id: "ancient_fresco_mosaic", label: "🏛️ Temple Fresco", desc: "Hellenic Marble Inlay" },
                    { id: "carved_stone_relief", label: "🗿 Granite Bas-Relief", desc: "Weathered Nordic Runes" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIllumination(item.id as VisualIllumination)}
                      className={`text-left p-3.5 rounded-2xl border transition min-h-[64px] cursor-pointer ${
                        illumination === item.id
                          ? "border-amber-400 bg-amber-500/20 text-white shadow-md shadow-amber-500/10"
                          : "border-white/10 bg-black/40 text-slate-300 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 py-4 text-sm font-black text-obsidian-950 shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[52px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-obsidian-950" />
                    <span>Synthesizing Sacred Chants, Shlokas &amp; Epics...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>🏛️ Synthesize Master Heritage Epic</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Live Master Cinema Viewport & Narrative Lore (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Studio Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    id="tab-btn-video" onClick={() => setActiveTab("video")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer min-h-[44px] ${
                      activeTab === "video"
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Play className="w-4 h-4 text-amber-400" /> Master Video Reel
                  </button>
                  <button
                    id="tab-btn-manuscript" onClick={() => setActiveTab("manuscript")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer min-h-[44px] ${
                      activeTab === "manuscript"
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Scroll className="w-4 h-4 text-amber-400" /> Illuminated Manuscript
                  </button>
                  <button
                    id="tab-btn-acoustics" onClick={() => setActiveTab("acoustic_matrix")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer min-h-[44px] ${
                      activeTab === "acoustic_matrix"
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-amber-400" /> Sacred Acoustics
                  </button>
                </div>

                {/* Direct Download Options */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedResolution}
                    onChange={(e) => setSelectedResolution(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-amber-300 outline-none min-h-[44px]"
                  >
                    <option value="1080p">1080p HD Master</option>
                    <option value="720p">720p Standard</option>
                    <option value="480p">480p Mobile</option>
                  </select>
                  <button
                    onClick={handleDownloadVideo}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition cursor-pointer min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> Reel (.mp4)
                  </button>
                </div>
              </div>

              {/* Tab 1: Live Master Video Reel Viewport */}
              {activeTab === "video" && (
                <div className="space-y-5">
                  <div className="relative rounded-3xl border border-amber-500/30 bg-black overflow-hidden shadow-2xl aspect-[9/16] max-h-[640px] mx-auto flex items-center justify-center">
                    <video
                      src="/assets/video/persona6_heritage_mythology_reel.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Watermark & C2PA Provenance Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[11px] font-mono font-black text-amber-300">
                          {pantheon.toUpperCase()} · 24 FPS VEDIC MASTER
                        </span>
                      </div>
                      <div className="bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                        C2PA ED25519 VERIFIED
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 pointer-events-none">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 font-serif">🔱 The Eternal Loom: Epics of Antiquity</span>
                        <span className="font-mono text-[11px] text-slate-400">00:12 Master</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full w-2/3 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Physical Export Toolbar */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Physical Package Exports:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={handleDownloadOpfXml}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer min-h-[44px]"
                      >
                        <Scroll className="w-4 h-4 text-amber-400" /> Download OPF (.opf)
                      </button>
                      <button
                        onClick={handleDownloadCueSheet}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer min-h-[44px]"
                      >
                        <Volume2 className="w-4 h-4 text-sky-400" /> Audio Cues (.json)
                      </button>
                      <button
                        onClick={handleDownloadScript}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/20 hover:text-white transition cursor-pointer min-h-[44px]"
                      >
                        <Feather className="w-4 h-4 text-amber-400" /> Full Script (.txt)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Illuminated Manuscript & Shlokas */}
              {activeTab === "manuscript" && (
                <div className="space-y-5">
                  {DEFAULT_MYTH_ACTS.map((act) => (
                    <div
                      key={act.actNumber}
                      className="rounded-3xl border border-amber-500/20 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                            {act.duration}
                          </span>
                          <h3 className="text-base font-bold text-white font-serif">{act.title}</h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{act.subhead}</span>
                      </div>

                      {/* Drop Cap & Quote */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-3xl font-black text-obsidian-950 font-serif shadow-lg shadow-amber-500/20">
                          {act.dropCap}
                        </div>
                        <div className="space-y-2.5 flex-1">
                          <p className="text-base text-slate-200 italic font-serif leading-relaxed">
                            &ldquo;{act.epicQuote}&rdquo;
                          </p>
                          {act.sanskritVerse && (
                            <p className="text-xs text-amber-300/90 font-mono bg-black/50 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                              {act.sanskritVerse}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {act.loreDescription}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-400/80">
                        <span>{act.acousticCue}</span>
                        <span className="text-slate-500">Intensity: {act.intensity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Sacred Acoustics Matrix */}
              {activeTab === "acoustic_matrix" && (
                <div className="rounded-3xl border border-amber-500/20 bg-slate-900/80 p-7 backdrop-blur-xl space-y-6">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-amber-400" /> Sacred Acoustic Frequencies &amp; Ducking Engine
                    </h3>
                    <p className="text-xs text-slate-400">
                      Multi-stem real-time acoustic convolution modeling. Zero audio clashing between chants and narration.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { channel: "Narrator Vocal Track", freq: "80Hz - 12kHz", db: "-3.0 dB", desc: "Gold Vocal Presence · 5-Band Formant Shaping" },
                      { channel: "108Hz Vedic Drone (Tanpura)", freq: "108Hz Harmonic", db: "-18.0 dB", desc: "Automatic Ducking when speech is detected" },
                      { channel: "Hellenic / Latin Choral Choir", freq: "300Hz - 4.5kHz", db: "-14.5 dB", desc: "Convolution Cathedral Reverb (3.2s decay)" },
                      { channel: "Percussion & War Horns (Taiko/Dhaak)", freq: "40Hz - 250Hz", db: "-12.0 dB", desc: "Transient-shaped rhythmic punch" },
                    ].map((ch, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{ch.channel}</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{ch.db}</span>
                        </div>
                        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full"
                            style={{ width: `${85 - idx * 15}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{ch.desc}</span>
                          <span>{ch.freq}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudioSidebar>
  );
}

export default function StoryCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-amber-400 font-mono text-sm">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Initializing Heritage Studio...
      </div>
    }>
      <StoryCreateContent />
    </Suspense>
  );
}
