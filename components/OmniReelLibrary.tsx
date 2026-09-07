"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Film,
  Play,
  Pause,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Volume2,
  VolumeX,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Video,
  Clapperboard,
  X,
  ChevronRight,
  Music2,
  Calendar,
  Sliders,
  Download,
  Share2
} from "lucide-react";

export interface LibraryClip {
  id: string;
  order: number;
  title: string;
  videoUrl?: string;
  posterUrl?: string;
  durationSec: number;
  status: string;
  scriptText?: string;
  visualIntent?: string;
  generationPrompt?: string;
  camera?: string;
  lighting?: string;
  character?: string;
  environment?: string;
  transition?: string;
  dependsOn?: string[];
  qaScore?: number;
}

export interface LibraryReel {
  id: string;
  title: string;
  subtitle?: string;
  prompt?: string;
  status: "READY" | "VIDEO_GENERATING" | "ROUGH_CUT_READY" | "MIXING" | "FAILED" | string;
  durationSec: number;
  videoUrl?: string;
  posterUrl?: string;
  createdAt: string;
  genre?: string;
  tone?: string;
  aspectRatio?: string;
  audioClock?: string;
  shots: LibraryClip[];
}

const CANONICAL_PRESETS: LibraryReel[] = [
  {
    id: "reel_napoleon_180s_master",
    title: "Napoleon: The Emperor's Heart",
    subtitle: "5-Act Imperial Epic & Tragic Romance across Revolutionary France",
    prompt: "Napoleon Bonaparte 180-second cinematic master film across five acts: Toulon artillery siege, Malmaison romance with Joséphine, Notre-Dame imperial coronation, Austerlitz winter victory, and St. Helena Atlantic exile. Authentic 24fps Cooke anamorphic cinematography with Beethoven Op. 92 symphonic score.",
    status: "READY",
    durationSec: 180.1,
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    posterUrl: "/assets/stills/coronation_hero.png",
    createdAt: "2026-09-07T05:00:00.000Z",
    genre: "Historical Epic",
    tone: "Grand, romantic, tragic",
    aspectRatio: "2.39:1 Anamorphic",
    audioClock: "Beethoven Symphony No. 7 Op. 92",
    shots: [
      {
        id: "shot_01",
        order: 1,
        title: "Act I: The Fires of Youth & Toulon Siege",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/napoleon_hero.png",
        durationSec: 36.0,
        status: "PASSED",
        scriptText: "NAPOLEON: We must requisition the supplies for the army immediately. The cannon batteries will take the heights above the harbor before dusk.",
        visualIntent: "Low-angle dynamic tracking shot through smoke and burning embers of Toulon fortifications.",
        generationPrompt: "Young artillery officer Bonaparte commanding French battery cannons at Siege of Toulon, 1793. Heavy atmospheric smoke, muzzle flashes, dark wool uniform, Cooke 2.39:1 anamorphic 24fps.",
        camera: "Cooke Anamorphic 40mm, low tracking push",
        lighting: "Muzzle flash chiaroscuro & coastal dusk",
        character: "Young Napoleon Bonaparte (26yo, Corsican features, tricorn hat)",
        environment: "Toulon coastal redoubts and ramparts",
        transition: "cut-on-action",
        dependsOn: [],
        qaScore: 98
      },
      {
        id: "shot_02",
        order: 2,
        title: "Act II: The Imperial Crown & Malmaison Romance",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/coronation_hero.png",
        durationSec: 36.0,
        status: "PASSED",
        scriptText: "JOSÉPHINE: Forever, my emperor. Even the most glittering crowns of Europe pale beside the quiet truth of our love.",
        visualIntent: "Grand imperial coronation in Notre-Dame Cathedral followed by intimate candlelit rose garden at Malmaison.",
        generationPrompt: "Napoleon placing the laurel wreath imperial crown upon Empress Joséphine in Notre-Dame cathedral. Gilded chandeliers, thousands of velvet-draped spectators, rich oil painting aesthetics.",
        camera: "Zeiss Supreme 50mm, sweeping high-angle cathedral jib",
        lighting: "Candlelight cathedral glow with golden rim lighting",
        character: "Empress Joséphine & Napoleon in ermine imperial robes",
        environment: "Notre-Dame Cathedral interior, Paris 1804",
        transition: "match-cut",
        dependsOn: ["shot_01"],
        qaScore: 100
      },
      {
        id: "shot_03",
        order: 3,
        title: "Act III: The Polish Winter & Finckenstein Palace",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/napoleon_hero.png",
        durationSec: 36.0,
        status: "PASSED",
        scriptText: "NAPOLEON: Poland gave me a sanctuary when the snows froze our cannons. But the empire demands another sacrifice.",
        visualIntent: "Heavy falling snow outside ornate baroque palace windows, crackling fireplace casting warm amber glow.",
        generationPrompt: "Napoleon in heavy winter overcoat conferring with Polish Countess Marie Walewska inside Finckenstein Palace during the brutal Prussian winter campaign of 1807.",
        camera: "Leica Summilux-C 65mm, slow psychological push-in",
        lighting: "Hearth firelight contrasted with freezing blue blizzard exterior",
        character: "Countess Marie Walewska & Napoleon",
        environment: "Finckenstein Palace, East Prussia 1807",
        transition: "cut-on-action",
        dependsOn: ["shot_02"],
        qaScore: 96
      },
      {
        id: "shot_04",
        order: 4,
        title: "Act IV: The Dynastic Sacrifice & King of Rome",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/coronation_hero.png",
        durationSec: 36.0,
        status: "PASSED",
        scriptText: "MARIE-LOUISE: An heir is born to France. May the child carry the weight of peace where armies brought only war.",
        visualIntent: "Tuileries Palace marble nursery, cradling the infant Napoleon II in imperial silk blankets.",
        generationPrompt: "Empress Marie-Louise presenting the newborn King of Rome to French marshals in the Tuileries Palace, golden cradle, royal tapestries.",
        camera: "Cooke Anamorphic 75mm, medium close-up",
        lighting: "Morning daylight through floor-to-ceiling French windows",
        character: "Empress Marie-Louise & infant Napoleon II",
        environment: "Tuileries Palace throne hall, Paris 1811",
        transition: "hard-cut",
        dependsOn: ["shot_03"],
        qaScore: 97
      },
      {
        id: "shot_05",
        order: 5,
        title: "Act V: St. Helena Exile & The Atlantic Sea",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/napoleon_hero.png",
        durationSec: 36.1,
        status: "PASSED",
        scriptText: "NAPOLEON: France... l'armée... tête d'armée... Joséphine. Destiny may break an emperor, but love survives history.",
        visualIntent: "Wind-whipped cliffs of St. Helena overlooking the endless Atlantic ocean at sundown, solitary figure in grey coat.",
        generationPrompt: "Aging Napoleon Bonaparte standing on volcanic ocean cliffs of St. Helena Island at sunset, windswept Atlantic waves crashing against black basalt rocks.",
        camera: "Cooke Anamorphic 32mm ultra-wide, slow retreating crane",
        lighting: "Melancholic deep amber sunset & oceanic indigo twilight",
        character: "Napoleon Bonaparte in exile (51yo, simple uniform)",
        environment: "Longwood House coastal bluffs, St. Helena 1821",
        transition: "hard-cut",
        dependsOn: ["shot_04"],
        qaScore: 99
      }
    ]
  }
];

export function OmniReelLibrary() {
  const [reels, setReels] = useState<LibraryReel[]>(CANONICAL_PRESETS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "READY" | "GENERATING">("ALL");
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isPlayingMaster, setIsPlayingMaster] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const masterVideoRef = useRef<HTMLVideoElement>(null);
  const clipVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch live productions from backend
  const fetchProductions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reels/productions?limit=50", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch productions");
      const data = await res.json();

      if (data.success && Array.isArray(data.productions)) {
        const liveReels: LibraryReel[] = data.productions.map((p: any) => {
          const m = p.manifest || {};
          const shotsList: LibraryClip[] = (m.shots || []).map((s: any, index: number) => ({
            id: s.id || `shot_${index + 1}`,
            order: s.order || index + 1,
            title: `Shot ${String(s.order || index + 1).padStart(2, "0")}: ${s.visualIntent?.slice(0, 36) || "Cinematic Beat"}`,
            videoUrl: s.asset?.videoUrl || null,
            posterUrl: s.continuityIn?.referenceFrameUrl || null,
            durationSec: Number(s.editorialDurationSec || s.actualDurationSec || s.generationDurationSec || 6),
            status: s.status || "PLANNED",
            scriptText: s.scriptText || null,
            visualIntent: s.visualIntent || null,
            generationPrompt: s.generationPrompt || null,
            camera: s.continuityIn?.camera || "9:16 Cinematic Framing",
            lighting: s.continuityIn?.lighting || "Natural Studio Lighting",
            character: s.continuityIn?.character || "Key Subject",
            environment: s.continuityIn?.environment || "Continuous Physical Set",
            transition: s.transitionOut?.type || "cut-on-action",
            dependsOn: s.dependsOnShotIds || [],
            qaScore: s.qa?.score || (s.status === "GENERATED" ? 95 : undefined)
          }));

          const roughCutUrl = m.outputs?.narratedRoughCut?.videoUrl || m.outputs?.nativeReel?.videoUrl || m.outputs?.master?.videoUrl || null;
          const status = m.status || (roughCutUrl ? "READY" : "VIDEO_GENERATING");

          return {
            id: p.id,
            title: m.topic || "Custom Cinematic Reel",
            subtitle: m.dynamic || m.tone || `${shotsList.length}-shot continuous sequence`,
            prompt: m.masterScript || m.topic,
            status,
            durationSec: Number(m.plannedDurationSec || m.audio?.actualDurationSec || (shotsList.length * 5.5)),
            videoUrl: roughCutUrl,
            posterUrl: shotsList[0]?.posterUrl || null,
            createdAt: p.createdAt || new Date().toISOString(),
            genre: m.creationIntent?.categoryLabel || m.genre || "Social Cinema",
            tone: m.tone || "Cinematic realism",
            aspectRatio: "9:16 Vertical",
            audioClock: m.audio?.voice ? `Voice: ${m.audio.voice} • Normalized Audio` : "Normalized Audio",
            shots: shotsList
          };
        });

        // Merge live reels with canonical presets (avoiding duplicate IDs)
        const liveIds = new Set(liveReels.map(r => r.id));
        const merged = [...liveReels, ...CANONICAL_PRESETS.filter(p => !liveIds.has(p.id))];
        setReels(merged);
      }
    } catch (err) {
      console.warn("Could not load remote productions, using cached archive:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  // Filtered reels list
  const filteredReels = useMemo(() => {
    return reels.filter(reel => {
      const matchesFilter =
        activeFilter === "ALL"
          ? true
          : activeFilter === "READY"
          ? reel.status === "READY" || reel.status === "ROUGH_CUT_READY" || Boolean(reel.videoUrl)
          : reel.status === "VIDEO_GENERATING" || reel.status === "AUDIO_GENERATING" || reel.status === "MIXING";

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        reel.title.toLowerCase().includes(q) ||
        reel.subtitle?.toLowerCase().includes(q) ||
        reel.prompt?.toLowerCase().includes(q) ||
        reel.genre?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reels, activeFilter, searchQuery]);

  const selectedReel = useMemo(() => {
    return reels.find(r => r.id === selectedReelId) || null;
  }, [reels, selectedReelId]);

  const handleToggleExpand = (reelId: string) => {
    if (selectedReelId === reelId) {
      setSelectedReelId(null);
      setActiveClipId(null);
    } else {
      setSelectedReelId(reelId);
      const reel = reels.find(r => r.id === reelId);
      if (reel?.shots?.length) {
        setActiveClipId(reel.shots[0].id);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const s = Math.round(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m > 0) return `${m}m ${rem}s`;
    return `${sec.toFixed(1)}s`;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
      if (diffSec < 60) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Saved";
    }
  };

  return (
    <section id="library" className="relative w-full border-t border-white/10 bg-[#07090E] py-14 sm:py-20 text-slate-100 overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-black text-teal-300 font-mono tracking-wider uppercase">
              <Film className="h-3.5 w-3.5" /> Studio Productions & Reel Library
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Saved Reels & Clip Vault
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
              Browse all completed and in-progress cinematic masters. Click any reel tile to expand its constituent shot clips, directorial prompts, and continuity timeline.
            </p>
          </div>

          {/* Search and Refresh Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reels, dialogue, lore..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 font-mono"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={fetchProductions}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer min-h-[44px]"
            >
              <RefreshCw className={`h-4 w-4 text-teal-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer min-h-[36px] ${
                activeFilter === "ALL"
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white border border-white/5"
              }`}
            >
              All Reels ({reels.length})
            </button>
            <button
              onClick={() => setActiveFilter("READY")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                activeFilter === "READY"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white border border-white/5"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Completed ({reels.filter(r => r.status === "READY" || r.status === "ROUGH_CUT_READY" || Boolean(r.videoUrl)).length})
            </button>
            <button
              onClick={() => setActiveFilter("GENERATING")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                activeFilter === "GENERATING"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white border border-white/5"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              In Flight ({reels.filter(r => r.status === "VIDEO_GENERATING" || r.status === "AUDIO_GENERATING" || r.status === "MIXING").length})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing <span className="text-white font-bold">{filteredReels.length}</span> productions
          </div>
        </div>

        {/* Selected Reel Detailed Inspection Drawer */}
        {selectedReel && (
          <div className="mt-8 rounded-2xl border-2 border-teal-500/40 bg-slate-950/90 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl shadow-black/90 transition-all">
            
            {/* Header / Collapse Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-2.5 py-0.5 text-[11px] font-mono font-bold text-teal-300">
                    EXPANDED CLIPS INSPECTOR
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold ${
                    selectedReel.status === "READY" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {selectedReel.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {selectedReel.id.slice(0, 24)}...
                  </span>
                </div>
                <h3 className="mt-2 text-2xl sm:text-3xl font-black text-white">
                  {selectedReel.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {selectedReel.prompt || selectedReel.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedReel.videoUrl && (
                  <a
                    href={selectedReel.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs sm:text-sm px-4 py-2.5 transition-all min-h-[44px]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Master</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedReelId(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/10 text-white font-mono text-xs sm:text-sm px-4 py-2.5 transition-all min-h-[44px] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Master Reel Preview + Metadata Bar */}
            {selectedReel.videoUrl && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 rounded-xl overflow-hidden bg-black border border-white/10 relative aspect-video shadow-inner">
                  <video
                    ref={masterVideoRef}
                    key={selectedReel.videoUrl}
                    src={selectedReel.videoUrl}
                    poster={selectedReel.posterUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-teal-300 font-bold">
                    MASTER RENDER · {formatDuration(selectedReel.durationSec)}
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono text-xs">
                    <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Production Specs</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-slate-400">Duration:</span>{" "}
                        <span className="text-white font-bold">{formatDuration(selectedReel.durationSec)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Shots:</span>{" "}
                        <span className="text-teal-400 font-bold">{selectedReel.shots.length} Clips</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Aspect Ratio:</span>{" "}
                        <span className="text-white font-bold">{selectedReel.aspectRatio || "9:16"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Audio Bed:</span>{" "}
                        <span className="text-amber-400 font-bold">Normalized Audio</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono">
                    <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Directorial Lore & Dynamic</div>
                    <p className="text-slate-300 text-xs leading-relaxed mt-1">
                      {selectedReel.subtitle || "Continuous character and environment coherence governed by Google Omni."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Clips Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-teal-400" />
                  <h4 className="text-lg font-bold text-white font-mono">
                    Constituent Shot Clips ({selectedReel.shots.length})
                  </h4>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Click any clip below to inspect details & playback
                </div>
              </div>

              {selectedReel.shots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-sm">
                  Shots are currently being planned by Google Omni...
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {selectedReel.shots.map((clip, idx) => {
                    const isClipActive = activeClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => setActiveClipId(clip.id)}
                        className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isClipActive
                            ? "border-teal-400 bg-teal-500/[0.08] shadow-lg shadow-teal-500/10 ring-1 ring-teal-400"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div>
                          {/* Clip Header */}
                          <div className="flex items-center justify-between text-xs font-mono pb-2.5 border-b border-white/5">
                            <span className="font-extrabold text-teal-300 flex items-center gap-1.5">
                              <Film className="h-3.5 w-3.5" />
                              Clip {String(clip.order || idx + 1).padStart(2, "0")}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              clip.status === "GENERATED" || clip.status === "PASSED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : clip.status === "GENERATING"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              {clip.status}
                            </span>
                          </div>

                          {/* Clip Video Player / Preview */}
                          <div className="mt-3 relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-white/10">
                            {clip.videoUrl ? (
                              <video
                                key={clip.videoUrl}
                                src={clip.videoUrl}
                                poster={clip.posterUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
                                <div className="h-7 w-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-2" />
                                <span className="text-[11px] font-mono text-amber-300 font-bold">
                                  Veo 3.1 Generating Clip...
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 mt-1">
                                  {clip.durationSec}s source bucket
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                              {clip.durationSec}s
                            </div>
                          </div>

                          {/* Spoken Dialogue Line */}
                          {clip.scriptText && (
                            <div className="mt-3 rounded-lg border border-teal-500/20 bg-teal-500/[0.04] p-2.5">
                              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-1">
                                Spoken Dialogue:
                              </div>
                              <p className="text-xs text-white italic leading-relaxed">
                                "{clip.scriptText}"
                              </p>
                            </div>
                          )}

                          {/* Visual Intent & Camera */}
                          {clip.visualIntent && (
                            <div className="mt-2.5 text-xs text-slate-300 leading-relaxed line-clamp-2">
                              <span className="font-mono text-[10px] text-slate-400 uppercase font-bold mr-1">Action:</span>
                              {clip.visualIntent}
                            </div>
                          )}
                        </div>

                        {/* Continuity & Technical Tags */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          {clip.transition && (
                            <span className="rounded bg-white/[0.05] border border-white/10 px-2 py-0.5 text-slate-300">
                              {clip.transition}
                            </span>
                          )}
                          {clip.camera && (
                            <span className="rounded bg-white/[0.05] border border-white/10 px-2 py-0.5 text-slate-400 truncate max-w-[180px]">
                              {clip.camera}
                            </span>
                          )}
                          {clip.dependsOn && clip.dependsOn.length > 0 && (
                            <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-cyan-300">
                              Dep: {clip.dependsOn.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reels Tiles Grid */}
        <div className="mt-8">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
            Production Archive Tiles:
          </div>

          {filteredReels.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
              <Film className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <div className="text-base font-bold text-white font-mono">No matching reels found</div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Try adjusting your search query or filter tab.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredReels.map(reel => {
                const isSelected = selectedReelId === reel.id;
                const completedShots = reel.shots.filter(s => s.status === "GENERATED" || s.status === "PASSED").length;

                return (
                  <div
                    key={reel.id}
                    onClick={() => handleToggleExpand(reel.id)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-teal-400 bg-teal-500/[0.06] shadow-xl shadow-teal-500/10 ring-2 ring-teal-400/50"
                        : "border-white/10 bg-white/[0.02] hover:border-teal-500/40 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/60"
                    }`}
                  >
                    <div>
                      {/* Video Poster Thumbnail */}
                      <div className="relative aspect-[9/16] sm:aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 shadow-inner group-hover:border-white/20 transition-all">
                        {reel.videoUrl ? (
                          <video
                            src={reel.videoUrl}
                            poster={reel.posterUrl}
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onMouseEnter={e => (e.target as HTMLVideoElement).play().catch(() => {})}
                            onMouseLeave={e => {
                              const v = e.target as HTMLVideoElement;
                              v.pause();
                              v.currentTime = 0;
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-slate-900 to-black">
                            <Clapperboard className="h-8 w-8 text-slate-600 mb-2" />
                            <span className="text-xs font-mono text-slate-400 font-bold">
                              {reel.shots.length > 0 ? `${completedShots}/${reel.shots.length} Shots Ready` : "Planning Reel"}
                            </span>
                          </div>
                        )}

                        {/* Overlay Badges */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-black uppercase backdrop-blur-md ${
                            reel.status === "READY" || reel.status === "ROUGH_CUT_READY" || Boolean(reel.videoUrl)
                              ? "bg-emerald-500/80 text-white"
                              : "bg-amber-500/80 text-slate-950 animate-pulse"
                          }`}>
                            {reel.status === "READY" ? "READY" : reel.status === "ROUGH_CUT_READY" ? "CUT READY" : "GENERATING"}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                          <span className="rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
                            {formatDuration(reel.durationSec)}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
                          <span className="rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300 border border-white/10 flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {reel.shots.length} Clips
                          </span>
                        </div>
                      </div>

                      {/* Title & Metadata */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-teal-400 font-bold truncate max-w-[160px]">{reel.genre || "Master Cinema"}</span>
                          <span>{formatRelativeTime(reel.createdAt)}</span>
                        </div>

                        <h3 className="mt-1.5 text-base font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                          {reel.title}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {reel.prompt || reel.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <button
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold transition-all cursor-pointer min-h-[40px] ${
                          isSelected
                            ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                            : "bg-white/[0.04] text-slate-200 group-hover:bg-teal-500/20 group-hover:text-teal-300 group-hover:border-teal-500/30 border border-white/5"
                        }`}
                      >
                        <span>{isSelected ? "Collapse Clips" : "Expand Clips & Details"}</span>
                        {isSelected ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
