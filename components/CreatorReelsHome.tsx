"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  Download,
  Share2,
  Check,
  HelpCircle,
  Film,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Clapperboard,
  Music2,
  Smartphone,
  Languages,
  Wand2,
  Link2,
  Users,
  Palette,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  Sliders,
  Send,
  Lock,
  Compass,
  User,
  MapPin
} from "lucide-react";
import type { OmniDirectorialTreatment } from "@/lib/reel/elaborateDirector";
import { getNextPartInfo } from "./MyReelsLibrary";
import { CharacterLibrary } from "./CharacterLibrary";
import { LocationLibrary } from "./LocationLibrary";
import type { LibraryCharacter } from "@/lib/library/characterLibrary";
import type { LibraryLocation } from "@/lib/library/locationLibrary";
import { YTStudio } from "./YTStudio";

export const LANGUAGE_OPTIONS = [
  { id: "en", label: "English", desc: "US fast social pacing" },
  { id: "hinglish-roman", label: "🇮🇳 Hinglish (Bollywood)", desc: "Conversational Hindi-English in Roman script" },
  { id: "hi-devanagari", label: "हिन्दी (Devanagari)", desc: "Standard Hindi in Devanagari script" },
  { id: "es", label: "Español", desc: "Spanish expressive pacing" },
];

export function getWardrobeShortLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("gym") || l.includes("workout") || l.includes("athletic") || l.includes("fitness")) return "Gym";
  if (l.includes("pool") || l.includes("swim") || l.includes("resort") || l.includes("beach")) return "Pool";
  if (l.includes("office") || l.includes("suit") || l.includes("formal") || /\bwork\b/i.test(l)) return "Office";
  if (l.includes("home") || l.includes("hygge") || l.includes("lounge") || l.includes("casual")) return "Home";
  if (l.includes("market") || l.includes("grocery") || l.includes("denim") || l.includes("parka")) return "Market";
  return label.split(" ")[0] || "Default";
}

export function getWardrobeIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("gym") || l.includes("workout") || l.includes("athletic") || l.includes("fitness")) return "🏃";
  if (l.includes("pool") || l.includes("swim") || l.includes("resort") || l.includes("beach")) return "🏊";
  if (l.includes("office") || l.includes("suit") || l.includes("formal") || /\bwork\b/i.test(l)) return "👔";
  if (l.includes("home") || l.includes("hygge") || l.includes("lounge") || l.includes("casual")) return "☕";
  if (l.includes("market") || l.includes("grocery") || l.includes("denim") || l.includes("parka")) return "🛒";
  return "👟";
}

export interface FinishedReel {
  id: string;
  title: string;
  category: string;
  shots: number;
  durationSec: number;
  videoUrl: string;
  posterUrl: string;
  prompt: string;
  continuityProof: string;
  tags: string[];
}

export const FINISHED_REELS: FinishedReel[] = [
  {
    id: "studio1_e2e00945",
    title: "Midnight Cyberpunk Dance",
    category: "Choreography & Style",
    shots: 8,
    durationSec: 42,
    videoUrl: "/assets/video/studio1_e2e00945.mp4",
    posterUrl: "/assets/stills/dubai_dance.jpg",
    prompt: "Street dancer performing liquid popping choreography under neon rain in Shinjuku, continuous camera orbit, synthwave bass drop at 0:15.",
    continuityProof: "Full 8-shot unbroken extension. Facial structure, wet hair physics, and cyberpunk jacket stay 100% coherent from shot 1 to shot 8 without face-morphing.",
    tags: ["9:16 Vertical", "8 Shots", "Liquid Motion", "Zero Face Drift"]
  },
  {
    id: "studio1_9f360810",
    title: "Alpine Sunrise Expedition",
    category: "Outdoor Adventure",
    shots: 6,
    durationSec: 24,
    videoUrl: "/assets/video/studio1_9f360810.mp4",
    posterUrl: "/assets/stills/swiss_alpine.jpg",
    prompt: "Solo mountaineer standing on a jagged snow-covered ridge in the Swiss Alps at golden hour, looking out over a sea of clouds as mountain wind whips.",
    continuityProof: "6 continuous shots. Cold breath vapor, red parka texture, and polarized sunglasses reflections remain rock-solid across every camera push-in.",
    tags: ["9:16 Vertical", "6 Shots", "Hyper-Realistic", "Natural Light"]
  },
  {
    id: "studio1_d2d144d2",
    title: "Dune Nomad Odyssey",
    category: "Cinematic Sci-Fi",
    shots: 6,
    durationSec: 30,
    videoUrl: "/assets/video/studio1_d2d144d2.mp4",
    posterUrl: "/assets/stills/desert_spiral.jpg",
    prompt: "Desert nomad in wind-swept nomadic silks walking along knife-edge sand dune crest, swirling golden particles in low evening sun.",
    continuityProof: "Extended 6-shot camera spiral. Fabric aerodynamics and sand physics flow continuously without the telltale warping of clip-stitched AI video.",
    tags: ["9:16 Vertical", "6 Shots", "Cloth Physics", "Single Take"]
  },
  {
    id: "studio1_5bfb958d",
    title: "Cosmic Deep Space Ascent",
    category: "Sci-Fi & Cosmos",
    shots: 5,
    durationSec: 34,
    videoUrl: "/assets/video/studio1_5bfb958d.mp4",
    posterUrl: "/assets/stills/cosmic_nebula.jpg",
    prompt: "Astronaut tethered outside orbital station viewing violet aurora over Earth's horizon, visor reflection showing stars and glowing instruments.",
    continuityProof: "5-shot unbroken orbital arc. Visor curvature reflections, helmet seams, and zero-G drift maintain identity lock from start to finish.",
    tags: ["9:16 Vertical", "5 Shots", "Orbital Arc", "Visor Optics"]
  }
];

export interface CinemaMasterReel {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  shots: number;
  durationSec: number;
  aspectRatio: "2.39:1" | "16:9" | "9:16";
  videoUrl: string;
  posterUrl: string;
  prompt: string;
  scoreTitle: string;
  acts: { act: number; title: string; timecode: string; theme: string }[];
  continuityProof: string;
  tags: string[];
}

export const CINEMA_FINISHED_REELS: CinemaMasterReel[] = [
  {
    id: "cinema_napoleon_180s",
    title: "Napoleon: The Imperial Crown & The Rose Garden",
    subtitle: "A 180-Second Theatrical Romance in 5 Classical Acts",
    category: "Historical Drama & Romance",
    shots: 30,
    durationSec: 180,
    aspectRatio: "2.39:1",
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    posterUrl: "/assets/stills/napoleon_hero.png",
    prompt: "Napoleon Bonaparte 180-second 5-act theatrical romance. Marseilles youth, Joséphine's coronation at Notre-Dame, Finckenstein Polish winter, Tuileries dynastic divorce, and solitary remembrance on Saint Helena.",
    scoreTitle: "Beethoven Symphony No. 7 in A major, Op. 92 – II. Allegretto (-24.0 LUFS EBU R128)",
    acts: [
      { act: 1, title: "The Fires of Youth & Unsent Letters", timecode: "00:00 - 00:36", theme: "Marseilles Coastline Terraces & Candlelit Salons" },
      { act: 2, title: "Imperial Crown & Malmaison Sanctuary", timecode: "00:36 - 01:12", theme: "Notre-Dame Coronation & Rain-Drenched Roses" },
      { act: 3, title: "Polish Winter & Countess Walewska", timecode: "01:12 - 01:48", theme: "Finckenstein Castle Blizzard & Stone Hearth" },
      { act: 4, title: "Dynastic Sacrifice & King of Rome", timecode: "01:48 - 02:24", theme: "Tuileries Throne Room Decree & Marble Nurseries" },
      { act: 5, title: "Solitary Echo & Saint Helena", timecode: "02:24 - 03:00", theme: "Atlantic Winds & Whispers of Remembrance" }
    ],
    continuityProof: "30 unbroken camera takes across 5 classical dramatic acts. Uniform 1800s neoclassical lighting, gold-embroidered imperial uniform, and pristine acoustic synchronization to Beethoven Op. 92.",
    tags: ["2.39:1 Anamorphic", "30 Shots", "180s Master", "5 Acts", "Beethoven Op. 92", "Dolby Audio"]
  }
];

export const OMNI_GENRES = [
  { id: "AUTO", label: "✨ Auto-Detect", desc: "Omni Director auto-infers best cinematic, music video, or documentary format from prompt" },
  { id: "MUSIC_VIDEO", label: "🎵 Music Video", desc: "Vocal lip-sync performance, dynamic music video choreography, cinematic visual rhythm, melodic score" },
  { id: "BOLLYWOOD_ROMANCE", label: "🌹 Bollywood Romance", desc: "Alpine musical duet, flowing chiffon sarees, violin motifs, 2.39:1 anamorphic" },
  { id: "BOLLYWOOD_ACTION", label: "💥 Bollywood Action", desc: "Kinetic tracking, combat stunts, tactical coverage" },
  { id: "HISTORICAL_BIOPIC", label: "🎩 Historical Biopic", desc: "Era wardrobe, multi-character dialogue, period lighting" },
  { id: "CINEMATIC_DRAMA", label: "🎭 Cinematic Drama", desc: "Shot / reverse-shot, emotional stakes, anamorphic falloff" },
  { id: "SCI_FI_CYBERPUNK", label: "🚀 Sci-Fi Cyberpunk", desc: "Neon atmosphere, futuristic tech, synthetic score" },
  { id: "NEO_NOIR_THRILLER", label: "🕵️ Neo-Noir Thriller", desc: "High-contrast rain, venetian shadows, suspense" },
  { id: "HIGH_FANTASY", label: "🐉 High Fantasy", desc: "Mythic realms, epic wide masters, orchestral motifs" },
  { id: "HORROR_MYSTERY", label: "🕯️ Horror / Mystery", desc: "Atmospheric dread, slow deliberate pushes, low key" },
  { id: "DOCUMENTARY_EXPLAINER", label: "🎙️ Documentary Explainer", desc: "Direct-to-camera presenter, educational breakdown" },
];

export function CreatorReelsHome({ initialTab = "instagram_tiktok" }: { initialTab?: "instagram_tiktok" | "youtube_shorts" | "music_video" } = {}) {
  const [activeTab, setActiveTab] = useState<"instagram_tiktok" | "youtube_shorts" | "music_video">(initialTab);
  const [showcaseTab, setShowcaseTab] = useState<"instagram_tiktok" | "youtube_shorts">("instagram_tiktok");
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCinemaIndex, setActiveCinemaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("AUTO");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"9:16" | "16:9" | "2.39:1">("9:16");
  const [selectedCastSize, setSelectedCastSize] = useState<1 | 2>(1);
  const [leadCharacter, setLeadCharacter] = useState<LibraryCharacter | null>(null);
  const [supportingCharacter, setSupportingCharacter] = useState<LibraryCharacter | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LibraryLocation | null>(null);
  const [showCharacterLibraryModal, setShowCharacterLibraryModal] = useState(false);
  const [showLocationLibraryModal, setShowLocationLibraryModal] = useState(false);
  const [showCastAndPlaceDrawer, setShowCastAndPlaceDrawer] = useState(true);
  const [castingMode, setCastingMode] = useState<"library" | "omni_auto" | "custom">("omni_auto");
  const [customLeadName, setCustomLeadName] = useState("");
  const [customLeadArchetype, setCustomLeadArchetype] = useState("");
  const [customLeadWardrobe, setCustomLeadWardrobe] = useState("");
  const [customLeadGender, setCustomLeadGender] = useState<"female" | "male" | "non-binary">("female");
  const [customLeadImageUri, setCustomLeadImageUri] = useState("");
  const [customLocationDesc, setCustomLocationDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [annualBilling, setAnnualBilling] = useState(false);

  // Directorial Elaboration & Reference Deconstruction State
  const [referenceUrl, setReferenceUrl] = useState("");
  const [showRefInput, setShowRefInput] = useState(false);
  const [isElaborating, setIsElaborating] = useState(false);
  const [elaborateStep, setElaborateStep] = useState<string | null>(null);
  const [elaborateError, setElaborateError] = useState<string | null>(null);
  const [treatment, setTreatment] = useState<OmniDirectorialTreatment | null>(null);
  const [treatmentTab, setTreatmentTab] = useState<"screenplay" | "cast" | "score">("screenplay");
  const [tweakPrompt, setTweakPrompt] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  const [expandedShotIdx, setExpandedShotIdx] = useState<number | null>(0);

  // Continuation / Part 2 Reel State
  const [continuationParent, setContinuationParent] = useState<{
    id: string;
    title: string;
    category?: string;
    prompt?: string;
    aspectRatio?: string;
    durationSec?: number;
    posterUrl?: string;
  } | null>(null);
  const [showContinuationModal, setShowContinuationModal] = useState(false);
  const [libraryReels, setLibraryReels] = useState<any[]>([]);

  // Auto-suggest Hinglish if user picks Bollywood Romance or Bollywood Action genre
  useEffect(() => {
    if ((selectedGenre === "BOLLYWOOD_ACTION" || selectedGenre === "BOLLYWOOD_ROMANCE") && selectedLanguage === "en") {
      setSelectedLanguage("hinglish-roman");
    }
  }, [selectedGenre, selectedLanguage]);

  // Auto-suggest Hinglish if user writes Hindi/Hinglish in the prompt text
  useEffect(() => {
    if (/\b(?:hindi|hinglish|desi|bollywood|in hindi)\b/i.test(promptText) && selectedLanguage === "en") {
      setSelectedLanguage("hinglish-roman");
    }
  }, [promptText, selectedLanguage]);

  // Smart detect if user pastes a YouTube URL into promptText
  useEffect(() => {
    if (/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(promptText) && !referenceUrl) {
      const match = promptText.match(/(https?:\/\/[^\s]+)/i);
      if (match) {
        setReferenceUrl(match[1]);
        setShowRefInput(true);
      }
    }
  }, [promptText, referenceUrl]);

  const [reelsList, setReelsList] = useState<FinishedReel[]>(FINISHED_REELS);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeReel = reelsList[activeReelIndex] || FINISHED_REELS[0];
  const activeCinema = CINEMA_FINISHED_REELS[activeCinemaIndex];

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Hydrate custom or generated reel from URL query params (e.g. ?id=... or ?reel=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "music" || tabParam === "music_video") {
      setActiveTab("music_video");
    } else if (tabParam === "reels" || tabParam === "instagram_tiktok") {
      setActiveTab("instagram_tiktok");
    }
    const targetId = params.get("id") || params.get("reel");
    const phaseParam = params.get("phase");
    if (targetId && phaseParam === "6") {
      window.location.replace(`/my-reels/${encodeURIComponent(targetId)}`);
      return;
    }
    if (targetId && targetId.startsWith("yt_")) {
      setActiveTab("music_video");
      return;
    }
    if (targetId) {
      fetch(`/api/studio/omni-generate?id=${encodeURIComponent(targetId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data?.scene) {
            const s = data.scene;
            const newReel: FinishedReel = {
              id: s.id,
              title: s.title || "4K Master Cinema Reel",
              category: s.genre || "Bollywood Romance",
              shots: data.shots?.length || 12,
              durationSec: s.duration || 34,
              videoUrl: s.video || FINISHED_REELS[0].videoUrl,
              posterUrl: s.still || FINISHED_REELS[0].posterUrl,
              prompt: s.prompt || "",
              continuityProof: `${data.shots?.length || 12}-shot continuous sequence with 100% biometric facial identity lock.`,
              tags: ["9:16 Vertical", `${data.shots?.length || 12} Shots`, "Master Reel", "Zero Drift"]
            };
            setReelsList((prev) => [newReel, ...prev.filter((r) => r.id !== s.id)]);
            setActiveReelIndex(0);
            if (videoRef.current && s.video) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
          }
        })
        .catch(() => {});
    }

    // Hydrate Part 2 Continuation from ?continueReel= or ?parentReel=
    const continueId = params.get("continueReel") || params.get("parentReel");
    if (continueId) {
      const nextPartNum = params.get("nextPart") || "2";
      const resolveLocal = FINISHED_REELS.find((r) => r.id === continueId) || CINEMA_FINISHED_REELS.find((r) => r.id === continueId);
      if (resolveLocal) {
        setContinuationParent({
          id: resolveLocal.id,
          title: resolveLocal.title,
          category: resolveLocal.category,
          prompt: resolveLocal.prompt,
          aspectRatio: (resolveLocal as any).aspectRatio || "9:16",
          durationSec: resolveLocal.durationSec,
          posterUrl: resolveLocal.posterUrl,
        });
        setPromptText(`Part ${nextPartNum} Continuation of "${resolveLocal.title}". The sequence continues seamlessly with the exact same character, wardrobe, and visual aesthetic: `);
        if ((resolveLocal as any).aspectRatio === "2.39:1") {
          setActiveTab("youtube_shorts");
          setSelectedAspectRatio("2.39:1");
        } else {
          setActiveTab("instagram_tiktok");
          setSelectedAspectRatio("9:16");
        }
        setTimeout(() => {
          const el = document.getElementById("directorial-studio") || document.getElementById("prompt-studio-box");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        // Set immediate synchronous fallback so Part 2 Continuation Banner is visible at 0ms
        const fallbackCleanTitle = continueId.replace(/^(studio1_|yt_|reel_)/, "").replace(/_/g, " ").toUpperCase();
        setContinuationParent({
          id: continueId,
          title: fallbackCleanTitle,
          category: "Directorial Continuation",
          prompt: "",
          aspectRatio: "9:16",
          durationSec: 24,
          posterUrl: undefined,
        });
        setPromptText(`Part ${nextPartNum} Continuation of "${fallbackCleanTitle}". The sequence continues seamlessly with the exact same character, wardrobe, and visual aesthetic: `);

        // Fetch full metadata from both Reels & YT production APIs
        Promise.all([
          fetch(`/api/reels/productions?limit=100`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
          fetch(`/api/yt/productions?limit=100`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]).then(([reelsData, ytData]) => {
          const allProds = [...(reelsData?.productions || []), ...(ytData?.productions || [])];
          const prod = allProds.find((p: any) => p.id === continueId);
          if (prod) {
            const m = prod.manifest || {};
            let cleanTitle = m.title || m.topic || prod.topic || (m as any).studio1?.projectTitle || fallbackCleanTitle;
            if (cleanTitle.length > 50) cleanTitle = cleanTitle.slice(0, 48) + "...";
            let poster = prod.posterUrl || m.theatricalPosterUrl || m.assets?.anchorUrl || undefined;
            if (!poster || poster.includes(".railway.internal")) {
              poster = m.shots?.[1]?.continuityIn?.referenceFrameUrl || m.shots?.[0]?.posterUrl || undefined;
            }
            setContinuationParent({
              id: prod.id,
              title: cleanTitle,
              category: prod.genre || m.genre || "Directorial Continuation",
              prompt: prod.topic || m.prompt || m.topic || "",
              aspectRatio: m.aspectRatio || "9:16",
              durationSec: Number(prod.durationSec || m.plannedDurationSec || 24),
              posterUrl: poster || undefined,
            });
            setPromptText(`Part ${nextPartNum} Continuation of "${cleanTitle}". The sequence continues seamlessly with the exact same character, wardrobe, and visual aesthetic: `);
          }
          setTimeout(() => {
            const el = document.getElementById("directorial-studio") || document.getElementById("prompt-studio-box");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 300);
        });
      }
    }

    // Hydrate Character from ?lead=
    const leadParam = params.get("lead");
    const wardrobeParam = params.get("wardrobe");
    const outfitParam = params.get("outfit");
    if (leadParam) {
      fetch(`/api/library/characters/${encodeURIComponent(leadParam)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.character) {
            const char = data.character;
            if (wardrobeParam && Array.isArray(char.wardrobe)) {
              char.wardrobe = char.wardrobe.map((w: any) => ({
                ...w,
                isDefault: w.id === wardrobeParam,
              }));
            }
            setLeadCharacter(char);
            setShowCastAndPlaceDrawer(true);

            // Pre-fill / contextualize prompt if empty
            const activeWardrobe = char.wardrobe?.find((w: any) => w.isDefault) || char.wardrobe?.[0];
            const outfitName = outfitParam || activeWardrobe?.label;
            if (outfitName) {
              setPromptText((prev) => {
                if (!prev || prev.trim() === "") {
                  return `${char.displayName} in ${decodeURIComponent(outfitName)} attire`;
                }
                return prev;
              });
            }
          }
        })
        .catch(() => {});
    }

    // Hydrate Location from ?location=
    const locationParam = params.get("location");
    if (locationParam) {
      fetch(`/api/library/locations/${encodeURIComponent(locationParam)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.location) {
            setSelectedLocation(data.location);
            setShowCastAndPlaceDrawer(true);
          }
        })
        .catch(() => {});
    }

    // Pre-fetch library productions for "Continue from Library" selector
    fetch("/api/reels/productions?limit=30")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.productions)) {
          setLibraryReels(data.productions);
        }
      })
      .catch(() => {});
  }, []);

  const handleTabChange = (tab: "instagram_tiktok" | "youtube_shorts" | "music_video") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const targetUrl = tab === "music_video" ? "/yt" : "/reels";
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new Event("zyvoriq-route-change"));
    }
    if (tab !== "music_video") {
      setShowcaseTab(tab);
    }
    if (tab === "youtube_shorts") {
      setSelectedAspectRatio("2.39:1");
      setSelectedDuration(180);
    } else {
      setSelectedAspectRatio("9:16");
      setSelectedDuration(30);
    }
  };

  // Auto-play when active reel, cinema or tab changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeReelIndex, activeCinemaIndex, activeTab, reelsList]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekToTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSelectStarterPrompt = (p: string) => {
    setPromptText(p);
  };

  const handleElaborate = async (overrideTweak?: string) => {
    const text = promptText.trim();
    const url = referenceUrl.trim();

    if (!text && !url) {
      setElaborateError("Please enter a scene prompt or provide a reference YouTube / reel URL to elaborate.");
      return;
    }

    if (overrideTweak) {
      setIsTweaking(true);
    } else {
      setIsElaborating(true);
    }
    setElaborateError(null);
    setElaborateStep(
      url
        ? "Deconstructing reference video (actors, lighting, choreography, acoustic bed)..."
        : "Composing forensic 9-layer directorial treatment with Omni Director..."
    );

    try {
      const res = await fetch("/api/studio1/elaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          referenceUrl: url,
          requestedDurationSec: selectedDuration,
          aspectRatio: selectedAspectRatio,
          genre: selectedGenre !== "AUTO" ? selectedGenre : undefined,
          language: selectedLanguage,
          tweakInstructions: overrideTweak || undefined,
          previousTreatment: overrideTweak && treatment ? treatment : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Elaboration failed with status ${res.status}`);
      }

      const newTreatment: OmniDirectorialTreatment = data.treatment;
      setTreatment(newTreatment);

      if (newTreatment.refinedPrompt) {
        setPromptText(newTreatment.refinedPrompt);
      }
      if (newTreatment.genre) {
        setSelectedGenre(newTreatment.genre);
      }
      if (newTreatment.language) {
        setSelectedLanguage(newTreatment.language);
      }
      if (newTreatment.aspectRatio) {
        setSelectedAspectRatio(newTreatment.aspectRatio);
      }
      if (newTreatment.targetDurationSec) {
        setSelectedDuration(newTreatment.targetDurationSec);
      }

      setTweakPrompt("");
      setElaborateStep(null);
    } catch (err: any) {
      console.error("[CreatorReelsHome] Elaboration failed:", err);
      setElaborateError(err?.message || "Failed to elaborate directorial treatment. Please try again.");
    } finally {
      setIsElaborating(false);
      setIsTweaking(false);
      setElaborateStep(null);
    }
  };

  const handleGenerate = async (treatmentOverride?: OmniDirectorialTreatment) => {
    const activeTreatment = treatmentOverride || treatment;
    const text = (activeTreatment?.refinedPrompt || promptText).trim();
    if (!text) return;

    const targetDuration = activeTreatment?.targetDurationSec || selectedDuration;
    const targetAspect = activeTreatment?.aspectRatio || selectedAspectRatio;
    const targetGenre = activeTreatment?.genre || (selectedGenre !== "AUTO" ? selectedGenre : undefined);
    const targetLang = activeTreatment?.language || selectedLanguage;

    console.log(`[CreatorReelsHome] Initiating generation: targetGenre="${targetGenre || "AUTO"}", targetDuration=${targetDuration}, targetLang="${targetLang}"`);

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedResult(null);
    setGenerationStep(
      activeTab === "youtube_shorts"
        ? "Analyzing prompt & composing 5-act 30-shot screenplay with Beethoven Op. 92..."
        : "Locking character biometric DNA & enqueuing unbroken scene takes..."
    );

    try {
      const platform = activeTab === "youtube_shorts" ? "YouTube Shorts" : "Instagram Reels";

      // Build cast selection based on active castingMode
      const castSelection: any[] = [];
      let locationIds = undefined;
      let finalTopic = text;

      if (castingMode === "custom") {
        if (customLeadName.trim()) {
          castSelection.push({
            libraryCharacterId: `custom_${Date.now()}`,
            wardrobeId: "custom_wardrobe",
            voiceId: customLeadGender === "male" ? "Puck" : "Aoede",
            role: "lead",
            displayName: customLeadName.trim(),
            archetype: customLeadArchetype.trim() || `${customLeadName.trim()} in ${customLeadWardrobe.trim() || "custom attire"}`,
            gender: customLeadGender,
            sheetUris: customLeadImageUri.trim() ? [customLeadImageUri.trim()] : []
          });
        }
        if (customLocationDesc.trim()) {
          finalTopic = `${text}. Physical Setting: ${customLocationDesc.trim()}`;
        }
      } else if (castingMode === "library") {
        if (!leadCharacter) {
          setShowCharacterLibraryModal(true);
          throw new Error("Please select a performer from the Character Library, or choose 'Omni Auto-Cast' above to let Omni cast dynamically.");
        }
        const defaultW = leadCharacter.wardrobe.find(w => w.isDefault) || leadCharacter.wardrobe[0];
        castSelection.push({
          libraryCharacterId: leadCharacter.id,
          wardrobeId: defaultW?.id,
          voiceId: leadCharacter.defaultVoiceId || "Kore",
          role: "lead",
          displayName: leadCharacter.displayName,
          archetype: leadCharacter.archetype,
          sheetUris: defaultW?.sheetUris || []
        });
        if (selectedCastSize === 2 && supportingCharacter) {
          const defaultW = supportingCharacter.wardrobe.find(w => w.isDefault) || supportingCharacter.wardrobe[0];
          castSelection.push({
            libraryCharacterId: supportingCharacter.id,
            wardrobeId: defaultW?.id,
            voiceId: supportingCharacter.defaultVoiceId || "Charon",
            role: "supporting",
            displayName: supportingCharacter.displayName,
            archetype: supportingCharacter.archetype,
            sheetUris: defaultW?.sheetUris || []
          });
        }
        locationIds = selectedLocation ? [selectedLocation.environmentBlock] : undefined;
      }
      // If castingMode === "omni_auto", castSelection remains empty and Omni dynamically auto-casts in planner & omniDirector!

      const res = await fetch("/api/studio1/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          prompt: finalTopic,
          scriptText: activeTreatment?.masterScript || undefined,
          duration: targetDuration,
          requestedDurationSec: targetDuration,
          aspectRatio: targetAspect,
          genre: targetGenre,
          language: targetLang,
          castSelection: castSelection.length > 0 ? castSelection : undefined,
          locationIds,
          platform,
          autoStart: true,
          parentProductionId: continuationParent?.id || undefined,
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Generation request failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setGeneratedResult({
        ...data,
        productionId: data.production?.id || data.productionId,
        message: continuationParent
          ? `Part 2 Continuation of "${continuationParent.title}" is queued with 100% biometric facial identity lock. Estimated time: ~7 minutes.`
          : activeTab === "youtube_shorts"
            ? "Your 180s Theatrical Cinema Master is planned across 5 classical dramatic acts and actively rendering in the background queue. Estimated time: ~12–15 minutes."
            : "Your Studio1 unbroken reel is planned and actively rendering in the background queue. Estimated time: ~7 minutes."
      });
      setGenerationStep(null);
    } catch (err: any) {
      console.error("Failed to enqueue reel generation:", err);
      setGenerationError(err?.message || "Failed to start generation. Please check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-900 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* CONSOLIDATED STUDIO WORKSPACE */}
      <section className="relative pt-4 pb-6 border-b border-white/5 overflow-hidden">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[450px] blur-[140px] pointer-events-none transition-all duration-700 ${
          activeTab === "youtube_shorts"
            ? "bg-gradient-to-tr from-amber-600/15 via-orange-500/10 to-transparent"
            : activeTab === "music_video"
            ? "bg-gradient-to-tr from-teal-600/20 via-cyan-500/15 to-emerald-500/10"
            : "bg-gradient-to-tr from-teal-600/15 via-cyan-500/10 to-transparent"
        }`} />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 relative z-10">
          {/* STUDIO HEADER */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-4">

            {activeTab === "instagram_tiktok" ? (
              <>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight mb-1">
                  Generate 9:16 reels with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">
                    100% biometric facial identity lock.
                  </span>
                </h1>
              </>
            ) : activeTab === "youtube_shorts" ? (
              <>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight mb-1">
                  Direct 180s cinema that{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                    commands the big screen.
                  </span>
                </h1>
              </>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight mb-1">
                  Autonomous AI Music Video Production{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300">
                    powered by Google Omni 1.1 &amp; Lyria 3.5
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 max-w-2xl">
                  Select a verified 24-second master production below or create a new music video with 16-check multimodal sync verification.
                </p>
              </>
            )}
          </div>

          {activeTab === "music_video" ? (
            <YTStudio embedded={true} />
          ) : (
            <>
              {/* TWO-COLUMN STUDIO CONSOLE: BALANCED EQUAL-SIZED LEFT AND RIGHT CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            {/* LEFT COLUMN: COMMAND & PROMPT BAR CARD (6 cols) */}
            <div className="lg:col-span-6 flex flex-col">
              {/* THE PROMPT BAR CONTAINER */}
              <div
                id="prompt-bar"
                className={`w-full h-full bg-white border rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/60 relative transition-all flex flex-col justify-between ${
                  activeTab === "youtube_shorts"
                    ? "border-amber-500/20 focus-within:border-amber-500/50"
                    : "border-slate-200 focus-within:border-teal-500/50"
                }`}
              >
                {/* Format & Duration in ONE sleek row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                  {/* Format selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-0.5">Format:</span>
                    {activeTab === "instagram_tiktok" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("9:16")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[30px] flex items-center gap-1 ${
                            selectedAspectRatio === "9:16"
                              ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                              : "bg-white/5 text-slate-700 hover:bg-white/10"
                          }`}
                        >
                          <span>📱 9:16 Vertical</span>
                          <span className="text-[10px] opacity-75 font-normal">(Reels)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("16:9")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all min-h-[30px] ${
                            selectedAspectRatio === "16:9"
                              ? "bg-teal-500 text-[#07090E]"
                              : "bg-white/5 text-slate-500 hover:bg-white/10"
                          }`}
                        >
                          16:9 Landscape
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("2.39:1")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all min-h-[30px] flex items-center gap-1 ${
                            selectedAspectRatio === "2.39:1"
                              ? "bg-amber-400 text-[#07090E] shadow-sm shadow-amber-400/30"
                              : "bg-white/5 text-slate-700 hover:bg-white/10"
                          }`}
                        >
                          <span>🎬 2.39:1 Anamorphic</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("16:9")}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[30px] ${
                            selectedAspectRatio === "16:9"
                              ? "bg-amber-400 text-[#07090E]"
                              : "bg-white/5 text-slate-500 hover:bg-white/10"
                          }`}
                        >
                          16:9
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAspectRatio("9:16")}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all min-h-[30px] ${
                            selectedAspectRatio === "9:16"
                              ? "bg-amber-400 text-[#07090E]"
                              : "bg-white/5 text-slate-500 hover:bg-white/10"
                          }`}
                        >
                          9:16
                        </button>
                      </>
                    )}
                  </div>

                  {/* Duration selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-0.5">Duration:</span>
                    {(activeTab === "instagram_tiktok"
                      ? [
                          { sec: 15, shots: 3 },
                          { sec: 30, shots: 5, label: "Std" },
                          { sec: 34, shots: 5, label: "34s Music" },
                          { sec: 45, shots: 7 }
                        ]
                      : [
                          { sec: 60, shots: 9, label: "Short" },
                          { sec: 180, shots: 25, label: "5-Act Master" }
                        ]
                    ).map(d => (
                      <button
                        key={d.sec}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(d.sec);
                          if (d.label?.includes("Music") || d.sec === 34) {
                            setSelectedGenre("MUSIC_VIDEO");
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all min-h-[28px] flex items-center gap-1 ${
                          selectedDuration === d.sec
                            ? activeTab === "youtube_shorts"
                              ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold"
                              : "bg-teal-500/20 border border-teal-400/40 text-teal-300 font-bold"
                            : "bg-white/5 text-slate-500 hover:bg-white/10"
                        }`}
                      >
                        <span>{d.sec}s</span>
                        {d.label && <span className="hidden xl:inline text-[9px] opacity-75">({d.label})</span>}
                      </button>
                    ))}
                    <div className="flex items-center gap-0.5 ml-0.5 bg-white/5 px-1.5 py-0.5 rounded-md border border-slate-200 min-h-[28px]">
                      <input
                        id="custom-duration-input"
                        type="number"
                        min="10"
                        max="240"
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(Math.max(10, Math.min(240, Number(e.target.value) || 30)))}
                        className="w-8 bg-transparent text-xs text-white text-center font-bold focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-500">s</span>
                    </div>
                  </div>
                </div>

                {/* Genre & Language in ONE sleek row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0 mr-1">Genre:</span>
                    {OMNI_GENRES.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGenre(g.id)}
                        title={g.desc}
                        className={`px-2 py-1 rounded-md text-xs font-semibold shrink-0 transition-all min-h-[28px] flex items-center gap-1 ${
                          selectedGenre === g.id
                            ? activeTab === "youtube_shorts"
                              ? "bg-amber-400 text-[#07090E] font-bold shadow-sm"
                              : "bg-teal-500 text-[#07090E] font-bold shadow-sm"
                            : "bg-white/5 text-slate-700 hover:bg-white/10"
                        }`}
                      >
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1 mr-1">
                      <Languages className="w-3 h-3 text-teal-400" /> Lang:
                    </span>
                    {LANGUAGE_OPTIONS.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setSelectedLanguage(l.id)}
                        title={l.desc}
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 transition-all min-h-[28px] flex items-center gap-1 ${
                          selectedLanguage === l.id
                            ? activeTab === "youtube_shorts"
                              ? "bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold"
                              : "bg-teal-500/20 border border-teal-400/50 text-teal-300 font-bold"
                            : "bg-white/5 text-slate-500 hover:bg-white/10"
                        }`}
                      >
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Cast & Reference Controls bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowRefInput(!showRefInput)}
                    className="text-[11px] text-slate-500 hover:text-teal-300 flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Link2 className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>🔗 YouTube / Reference URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCastAndPlaceDrawer(!showCastAndPlaceDrawer)}
                    className="text-[11px] text-slate-500 hover:text-teal-300 flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Sliders className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>⚙️ Cast & Physical Set Lock</span>
                    {(leadCharacter || selectedLocation) && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                        Active
                      </span>
                    )}
                    {showCastAndPlaceDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Optional Cast & Place Selection Drawer */}
                {showCastAndPlaceDrawer && (
                  <div className="mb-3 p-3 rounded-xl bg-[#F7F8FC]/80 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-slate-800">Casting & Physical Set Lock</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 mr-1">Cast Size:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCastSize(1)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            selectedCastSize === 1 ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40" : "bg-white/5 text-slate-500"
                          }`}
                        >
                          Solo Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCastSize(2)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            selectedCastSize === 2 ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40" : "bg-white/5 text-slate-500"
                          }`}
                        >
                          Dialogue Duo
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
                      {/* 3-Tier Persona & Set Choice Architecture */}
                      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setCastingMode("omni_auto")}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            castingMode === "omni_auto"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold shadow-sm"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          <span>✨ Omni Auto-Cast (Default)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCastingMode("library")}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            castingMode === "library"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold shadow-sm"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 text-teal-400" />
                          <span>📚 Curated Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCastingMode("custom")}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            castingMode === "custom"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold shadow-sm"
                              : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5 text-teal-400" />
                          <span>✏️ Enter Custom Details</span>
                        </button>
                      </div>

                      {/* MODE 1: Omni Auto-Cast (Default) */}
                      {castingMode === "omni_auto" && (
                        <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-teal-400" />
                            <span className="text-xs font-bold text-teal-300">Autonomous Pre-Flight Cast & Physical Set Synthesis</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            Zero friction. You are not forced to choose existing personas or locations. Omni will automatically analyze your prompt, determine the optimal genre, character archetypes, facial biometric anchors, and physical sets in advance with guaranteed cross-shot continuity.
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-teal-400/90 pt-1 flex-wrap">
                            <span>✓ Dynamic 1:1 Facial Anchor</span>
                            <span>✓ Continuous Lore & Biometric Ledger</span>
                            <span>✓ Calibrated -24.0 LUFS Voice Cast</span>
                          </div>
                        </div>
                      )}

                      {/* MODE 3: Custom Details */}
                      {castingMode === "custom" && (
                        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5" /> Custom Performer & Set Specification
                            </span>
                            <span className="text-[10px] text-slate-500">Omni validates & anchors in advance</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-slate-700 block mb-1">Performer Name</label>
                              <input
                                type="text"
                                value={customLeadName}
                                onChange={(e) => setCustomLeadName(e.target.value)}
                                placeholder="e.g. Astrid Vane, Det. Frederik, Maya Lin"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-700 block mb-1">Gender / Voice Profile</label>
                              <div className="flex items-center gap-2">
                                {(["female", "male", "non-binary"] as const).map(g => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setCustomLeadGender(g)}
                                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border capitalize transition-all ${
                                      customLeadGender === g
                                        ? "bg-teal-500/20 text-teal-200 border-teal-500/50 font-bold"
                                        : "bg-white text-slate-500 border-slate-200 hover:text-white"
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-slate-700 block mb-1">Appearance & Biometric Archetype</label>
                            <input
                              type="text"
                              value={customLeadArchetype}
                              onChange={(e) => setCustomLeadArchetype(e.target.value)}
                              placeholder="e.g. 28yo Danish architect, intense blue eyes, structured jawline, short blonde hair"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-slate-700 block mb-1">Wardrobe / Costume Style</label>
                              <input
                                type="text"
                                value={customLeadWardrobe}
                                onChange={(e) => setCustomLeadWardrobe(e.target.value)}
                                placeholder="e.g. Charcoal wool coat, black turtleneck"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-700 block mb-1">Reference Portrait URL (Optional)</label>
                              <input
                                type="text"
                                value={customLeadImageUri}
                                onChange={(e) => setCustomLeadImageUri(e.target.value)}
                                placeholder="https://... or /assets/... (optional reference photo)"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-slate-700 block mb-1">Custom Physical Set / Location Environment</label>
                            <input
                              type="text"
                              value={customLocationDesc}
                              onChange={(e) => setCustomLocationDesc(e.target.value)}
                              placeholder="e.g. Glass-walled penthouse overlooking Copenhagen harbour at sunset with rain on glass"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            />
                          </div>
                        </div>
                      )}

                      {/* MODE 2: Curated Library */}
                      {castingMode === "library" && (
                        <>
                          {/* Cast slots */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Lead Actor Slot */}
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-2.5">
                              {leadCharacter ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-11 h-11 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0">
                                      <img
                                        src={
                                          (leadCharacter.wardrobe?.find(w => w.isDefault)?.sheetUris[0]) ||
                                          leadCharacter.wardrobe?.[0]?.sheetUris[0] ||
                                          "/assets/stills/dubai_dance.jpg"
                                        }
                                        alt="Lead"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-teal-400">Lead Performer</div>
                                      <div className="text-xs font-bold text-white">{leadCharacter.displayName}</div>
                                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{leadCharacter.archetype}</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setShowCharacterLibraryModal(true)}
                                    className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-700"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-teal-400" />
                                      </div>
                                      <div>
                                        <div className="text-[10px] uppercase font-bold text-teal-400">Lead Performer</div>
                                        <div className="text-xs font-bold text-white">Select from 78 Personas</div>
                                        <div className="text-[10px] text-slate-500">Denmark, France, UK, US, India...</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowCharacterLibraryModal(true)}
                                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40"
                                    >
                                      Browse
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-white/5">
                                    <span className="text-[9px] text-slate-500">Quick pick:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        fetch("/api/library/characters/freja_moller_dk")
                                          .then(res => res.json())
                                          .then(data => data?.character && setLeadCharacter(data.character));
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-700 border border-white/5 flex items-center gap-1"
                                    >
                                      <span>🇩🇰</span> Freja (Denmark)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        fetch("/api/library/characters/mikkel_lind_dk")
                                          .then(res => res.json())
                                          .then(data => data?.character && setLeadCharacter(data.character));
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-700 border border-white/5 flex items-center gap-1"
                                    >
                                      <span>🇩🇰</span> Mikkel (Denmark)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        fetch("/api/library/characters/camille_vidal")
                                          .then(res => res.json())
                                          .then(data => data?.character && setLeadCharacter(data.character));
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-700 border border-white/5 flex items-center gap-1"
                                    >
                                      <span>🇫🇷</span> Camille (France)
                                    </button>
                                  </div>
                                </div>
                              )}

                              {leadCharacter && leadCharacter.wardrobe && leadCharacter.wardrobe.length > 0 && (
                                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap">
                                  <span className="text-[10px] text-teal-300 font-medium truncate max-w-[150px]">
                                    👗 {(leadCharacter.wardrobe.find(w => w.isDefault) || leadCharacter.wardrobe[0])?.label}
                                  </span>
                                  {leadCharacter.wardrobe.length > 1 && (
                                    <div className="flex flex-wrap gap-1">
                                      {leadCharacter.wardrobe.map((w) => {
                                        const isCurrent = (leadCharacter.wardrobe.find(item => item.isDefault)?.id || leadCharacter.wardrobe[0]?.id) === w.id;
                                        const shortName = getWardrobeShortLabel(w.label);
                                        const icon = getWardrobeIcon(w.label);
                                        return (
                                          <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => {
                                              setLeadCharacter({
                                                ...leadCharacter,
                                                wardrobe: leadCharacter.wardrobe.map(item => ({
                                                  ...item,
                                                  isDefault: item.id === w.id,
                                                })),
                                              });
                                            }}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border transition-colors flex items-center gap-1 ${
                                              isCurrent
                                                ? "bg-teal-500/20 text-teal-200 border-teal-500/50 font-bold"
                                                : "bg-white/5 text-slate-500 border-white/5 hover:text-white"
                                            }`}
                                          >
                                            <span>{icon}</span>
                                            <span>{shortName}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Co-Star Slot (Actor 2) */}
                            {selectedCastSize === 2 ? (
                              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-2.5">
                                {supportingCharacter ? (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-11 h-11 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0">
                                        <img
                                          src={
                                            (supportingCharacter.wardrobe?.find(w => w.isDefault)?.sheetUris[0]) ||
                                            supportingCharacter.wardrobe?.[0]?.sheetUris[0] ||
                                            "/assets/stills/ren_cyberpunk.jpg"
                                          }
                                          alt="Co-star"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-[10px] uppercase font-bold text-cyan-400">Co-Star (Actor 2)</div>
                                        <div className="text-xs font-bold text-white">{supportingCharacter.displayName}</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{supportingCharacter.archetype}</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowCharacterLibraryModal(true)}
                                      className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-700"
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                          <User className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                          <div className="text-[10px] uppercase font-bold text-cyan-400">Co-Star (Actor 2)</div>
                                          <div className="text-xs font-bold text-white">Select Co-Star</div>
                                          <div className="text-[10px] text-slate-500">Choose 2nd character</div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setShowCharacterLibraryModal(true)}
                                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40"
                                      >
                                        Choose
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-white/5">
                                      <span className="text-[9px] text-slate-500">Quick pick:</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          fetch("/api/library/characters/mikkel_lind_dk")
                                            .then(res => res.json())
                                            .then(data => data?.character && setSupportingCharacter(data.character));
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-700 border border-white/5 flex items-center gap-1"
                                      >
                                        <span>🇩🇰</span> Mikkel (Denmark)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          fetch("/api/library/characters/freja_moller_dk")
                                            .then(res => res.json())
                                            .then(data => data?.character && setSupportingCharacter(data.character));
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-700 border border-white/5 flex items-center gap-1"
                                      >
                                        <span>🇩🇰</span> Freja (Denmark)
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {supportingCharacter && supportingCharacter.wardrobe && supportingCharacter.wardrobe.length > 0 && (
                                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-1 flex-wrap">
                                    <span className="text-[10px] text-cyan-300 font-medium truncate max-w-[150px]">
                                      👗 {(supportingCharacter.wardrobe.find(w => w.isDefault) || supportingCharacter.wardrobe[0])?.label}
                                    </span>
                                    {supportingCharacter.wardrobe.length > 1 && (
                                      <div className="flex flex-wrap gap-1">
                                        {supportingCharacter.wardrobe.map((w) => {
                                          const isCurrent = (supportingCharacter.wardrobe.find(item => item.isDefault)?.id || supportingCharacter.wardrobe[0]?.id) === w.id;
                                          const shortName = getWardrobeShortLabel(w.label);
                                          const icon = getWardrobeIcon(w.label);
                                          return (
                                            <button
                                              key={w.id}
                                              type="button"
                                              onClick={() => {
                                                setSupportingCharacter({
                                                  ...supportingCharacter,
                                                  wardrobe: supportingCharacter.wardrobe.map(item => ({
                                                    ...item,
                                                    isDefault: item.id === w.id,
                                                  })),
                                                });
                                              }}
                                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium border transition-colors flex items-center gap-1 ${
                                                isCurrent
                                                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/50 font-bold"
                                                  : "bg-white/5 text-slate-500 border-white/5 hover:text-white"
                                              }`}
                                            >
                                              <span>{icon}</span>
                                              <span>{shortName}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-black/20 border border-dashed border-white/5 flex items-center justify-between">
                                <span className="text-xs text-slate-500">Solo production (1 actor active)</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCastSize(2)}
                                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                                >
                                  + Enable 2 Actors
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Location Slot */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-10 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0">
                                <img
                                  src={selectedLocation?.establishingUri || "/assets/stills/beach_sunset.jpg"}
                                  alt="Location"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase font-bold text-amber-400">Physical Set Contract</div>
                                <div className="text-xs font-bold text-white">
                                  {selectedLocation ? selectedLocation.displayName : "Auto-Match Scene to Prompt (Default)"}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[280px]">
                                  {selectedLocation
                                    ? `"${selectedLocation.environmentBlock}"`
                                    : "Physical set will be dynamically created to match your prompt (e.g. beach, gym, pool, office)"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {selectedLocation && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedLocation(null)}
                                  className="px-2 py-1 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
                                  title="Reset to match prompt"
                                >
                                  Reset
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowLocationLibraryModal(true)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-700 transition-colors"
                              >
                                {selectedLocation ? "Change Set" : "Lock Set"}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Reference Video / YouTube Input when expanded */}
                {(showRefInput || referenceUrl) && (
                  <div className="mb-2 p-2.5 bg-slate-50 border border-teal-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Reference Video / Public YouTube URL</span>
                        <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">(Deconstructs cinematography, lighting &amp; audio)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceUrl("");
                          setShowRefInput(false);
                        }}
                        className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="url"
                        value={referenceUrl}
                        onChange={(e) => setReferenceUrl(e.target.value)}
                        placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-base md:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 min-h-[38px]"
                      />
                      {referenceUrl && (
                        <button
                          type="button"
                          onClick={() => handleElaborate()}
                          disabled={isElaborating}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#07090E] font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 min-h-[38px] transition-colors"
                        >
                          {isElaborating ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#07090E] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          <span>Deconstruct</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Part 2 Sequel Mode Active Banner */}
                {continuationParent && (
                  <div
                    id="continuation-active-banner"
                    className="mb-3.5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-teal-950/80 via-emerald-950/60 to-slate-900/90 border border-teal-500/50 shadow-xl shadow-teal-950/40 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {continuationParent.posterUrl ? (
                        <img
                          src={continuationParent.posterUrl}
                          alt={continuationParent.title}
                          className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg object-cover border border-teal-500/50 shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-teal-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 text-teal-400" />
                            Part 2 Sequel Mode
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-black/50 text-emerald-300/90 border border-emerald-500/30 font-mono text-[10px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                            Biometric DNA & Scene Continuity Locked
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Parent: {continuationParent.id.slice(0, 16)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate">
                          Directing Sequel to: <span className="text-teal-300">{continuationParent.title}</span>
                        </h4>
                        <p className="text-xs text-slate-700/80 mt-0.5 line-clamp-2">
                          All character facial anchors, wardrobe, visual style, and audio profile from Part 1 are locked. Type your continuation scene action or plot twist below.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setContinuationParent(null);
                        setPromptText("");
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 shrink-0 transition flex items-center gap-1"
                      title="Exit continuation mode and direct a fresh standalone reel"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                )}

                {/* Prompt Textarea */}
                <div id="prompt-studio-box" className="relative mb-4">
                  <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={
                      activeTab === "youtube_shorts"
                        ? "Describe your 180s cinematic story (e.g., Napoleon Bonaparte 5-act romance, from Marseilles youth to Notre-Dame coronation and solitary exile, Beethoven Op. 92 Allegretto, anamorphic 2.39:1...)"
                        : "Describe your scene or action (e.g., A street dancer performing in neon-lit Shinjuku at midnight, continuous camera push-in, synthwave bass drop...)"
                    }
                    className="w-full bg-slate-50 border border-white/5 rounded-xl p-3.5 sm:p-4 text-base md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/50 resize-none"
                  />
                </div>

                {/* Quick starter pills + Continuation Sequel from Library */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
                  <button
                    type="button"
                    onClick={() => setShowContinuationModal(true)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-semibold flex items-center gap-1.5 transition shadow-sm"
                    title="Direct Part 2 of any previously generated reel with character and scene locked"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Direct Sequel from Library...</span>
                  </button>
                  <span className="text-slate-500 shrink-0 text-[11px] font-medium">Try starter:</span>
                  {(activeTab === "instagram_tiktok"
                    ? [
                        "Cyberpunk street dance in neon rain, bass drop at 0:15",
                        "High alpine climber reaching sunlit peak, wind in jacket",
                        "Desert nomad traversing sandstorms, cinematic dunes",
                        "Deep space astronaut suit reflection, nebula flare"
                      ]
                    : [
                        "Yash Chopra 5-act romance: Violinist hero & flowing chiffon saree heroine in Swiss Alps, Mohabbatein aesthetic, Lyria Bollywood strings, 2.39:1",
                        "Napoleon Bonaparte: 5-act romance & imperial rise, Beethoven Op. 92 allegretto, anamorphic 2.39:1",
                        "Oppenheimer Trinity dawn: Desert countdown, heat mirage, orchestral crescendo, 35mm anamorphic",
                        "The Last Samurai of Kyoto: Rain-soaked cobblestones, silent duel at dawn, bamboo mist",
                        "Interstellar Kepler Voyage: Relativistic tidal wave on ocean world, organ crescendo"
                      ]
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectStarterPrompt(preset)}
                      className={`shrink-0 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-700 text-[11px] transition-colors truncate max-w-[260px] ${
                        activeTab === "youtube_shorts"
                          ? "hover:bg-amber-500/10 hover:border-amber-500/30"
                          : "hover:bg-teal-500/10 hover:border-teal-500/30"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Modal to pick any reel from library to continue */}
                {showContinuationModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-teal-400" />
                          <h3 className="text-base font-bold text-white">Select a Reel to Direct Part 2</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowContinuationModal(false)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 mb-4">
                        Choose any generated reel from your library. Omni Director will preserve the character's facial structure, wardrobe, and world continuity for the sequel.
                      </p>

                      <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                        {/* 1. Archive & Library Reels */}
                        {libraryReels.map((p) => {
                          const m = p.manifest || {};
                          let title = m.topic || (m as any).studio1?.projectTitle || p.id;
                          if (title.length > 60) title = title.slice(0, 58) + "...";
                          let poster = p.posterUrl;
                          if (!poster || poster.includes(".railway.internal")) {
                            poster = m.shots?.[1]?.continuityIn?.referenceFrameUrl || m.shots?.[0]?.posterUrl || null;
                          }
                          if (!poster || poster.includes(".railway.internal")) {
                            if (p.id.includes("5b3c6b72")) poster = "/assets/stills/ren_cyberpunk.png";
                            else if (p.id.includes("e2e00945")) poster = "/assets/stills/dubai_dance.jpg";
                            else if (p.id.includes("9f360810") || p.id.includes("39a1fe18")) poster = "/assets/stills/swiss_alpine.jpg";
                            else if (!p.id.includes("cf46b686") && (p.id.includes("d2d144d2") || p.id.includes("32ffc950"))) poster = "/assets/stills/desert_spiral.jpg";
                            else if (p.id.includes("5bfb958d") || p.id.includes("1a8264ca")) poster = "/assets/stills/cosmic_nebula.jpg";
                            else if (p.id.includes("napoleon")) poster = "/assets/stills/napoleon_hero.png";
                            else if (p.id.includes("coronation")) poster = "/assets/stills/coronation_hero.png";
                          }
                          const partInfo = getNextPartInfo({ title, prompt: m.prompt || m.topic });
                          return (
                            <div
                              key={p.id}
                              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-teal-500/40 hover:bg-teal-500/5 transition flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {poster ? (
                                  <img
                                    src={poster}
                                    alt={title}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLElement).style.display = "none";
                                    }}
                                    className="w-10 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-14 rounded-lg bg-teal-950/40 border border-teal-500/30 flex items-center justify-center shrink-0">
                                    <Clapperboard className="w-4 h-4 text-teal-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
                                    {title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                    <span>ID: {p.id.slice(0, 12)}</span>
                                    <span>•</span>
                                    <span>{m.genre || "Reel"}</span>
                                    <span>•</span>
                                    <span>{m.aspectRatio || "9:16"}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setContinuationParent({
                                    id: p.id,
                                    title,
                                    category: m.genre || "Reel",
                                    prompt: m.prompt || m.topic || "",
                                    aspectRatio: m.aspectRatio || "9:16",
                                    durationSec: m.requestedDurationSec || 30,
                                    posterUrl: poster,
                                  });
                                  setPromptText(`${partInfo.suggestedTitlePrefix} "${partInfo.baseTitle}". The sequence continues seamlessly with the same character, wardrobe, and visual aesthetic: `);
                                  if (m.aspectRatio === "2.39:1") {
                                    setActiveTab("youtube_shorts");
                                    setSelectedAspectRatio("2.39:1");
                                  } else {
                                    setActiveTab("instagram_tiktok");
                                    setSelectedAspectRatio("9:16");
                                  }
                                  setShowContinuationModal(false);
                                  setTimeout(() => {
                                    const el = document.getElementById("continuation-active-banner") || document.getElementById("prompt-studio-box");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }, 200);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold shrink-0 flex items-center gap-1 transition shadow-sm cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>{partInfo.buttonText}</span>
                              </button>
                            </div>
                          );
                        })}

                        {/* 2. Finished showcase reels */}
                        {FINISHED_REELS.map((reel) => (
                          <div
                            key={reel.id}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-teal-500/40 hover:bg-teal-500/5 transition flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={reel.posterUrl} alt={reel.title} className="w-10 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
                                  {reel.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                  <span>{reel.category}</span>
                                  <span>•</span>
                                  <span>{reel.shots} Shots</span>
                                  <span>•</span>
                                  <span>9:16</span>
                                </div>
                              </div>
                            </div>
                            {(() => {
                              const partInfo = getNextPartInfo({ title: reel.title, prompt: reel.prompt });
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContinuationParent({
                                      id: reel.id,
                                      title: reel.title,
                                      category: reel.category,
                                      prompt: reel.prompt,
                                      aspectRatio: "9:16",
                                      durationSec: reel.durationSec,
                                      posterUrl: reel.posterUrl,
                                    });
                                    setPromptText(`${partInfo.suggestedTitlePrefix} "${partInfo.baseTitle}". The sequence continues seamlessly with the same character, wardrobe, and visual aesthetic: `);
                                    setActiveTab("instagram_tiktok");
                                    setSelectedAspectRatio("9:16");
                                    setShowContinuationModal(false);
                                    setTimeout(() => {
                                      const el = document.getElementById("continuation-active-banner") || document.getElementById("prompt-studio-box");
                                      if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }, 200);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold shrink-0 flex items-center gap-1 transition shadow-sm cursor-pointer"
                                >
                                  <Sparkles className="w-3 h-3 text-teal-400" />
                                  <span>{partInfo.buttonText}</span>
                                </button>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal to pick character from library */}
                {showCharacterLibraryModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-teal-400" />
                          <h3 className="text-base font-bold text-white">Cast from Character Library</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                            Pre-Validated
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCharacterLibraryModal(false)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="overflow-y-auto flex-1 mt-4">
                        <CharacterLibrary
                          isSelectionMode={true}
                          selectedLeadId={leadCharacter?.id}
                          selectedSupportingId={supportingCharacter?.id}
                          onSelectCharacter={(char, role) => {
                            if (role === "lead") {
                              setLeadCharacter(char);
                            } else {
                              setSupportingCharacter(char);
                              setSelectedCastSize(2);
                            }
                            setShowCharacterLibraryModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal to pick physical set from location library */}
                {showLocationLibraryModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-amber-400" />
                          <h3 className="text-base font-bold text-white">Lock Physical Set from Location Library</h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            Byte-Identical Consistency
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowLocationLibraryModal(false)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="overflow-y-auto flex-1 mt-4">
                        <LocationLibrary
                          isSelectionMode={true}
                          selectedLocationId={selectedLocation?.id}
                          onSelectLocation={(loc) => {
                            setSelectedLocation(loc);
                            setShowLocationLibraryModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions Row: Elaborate Button + Submit Button + Stated Wait */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Generate Button */}
                    <button
                      type="button"
                      onClick={() => handleGenerate()}
                      disabled={isGenerating || isElaborating || !promptText.trim()}
                      className={`px-4 sm:px-5 py-2 rounded-xl disabled:opacity-50 disabled:pointer-events-none text-[#07090E] font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
                        activeTab === "youtube_shorts"
                          ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 shadow-amber-500/25 hover:shadow-amber-500/40"
                          : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 shadow-teal-500/25 hover:shadow-teal-500/40"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#07090E] border-t-transparent rounded-full animate-spin" />
                          <span>
                            {activeTab === "youtube_shorts" ? "Directing 180s Screenplay..." : "Planning Unbroken Scene..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {activeTab === "youtube_shorts" ? (
                            <Clapperboard className="w-4 h-4 text-[#07090E]" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#07090E]" />
                          )}
                          <span>
                            {treatment
                              ? `Approve & Direct ${treatment.targetDurationSec}s Reel`
                              : activeTab === "youtube_shorts"
                              ? "Direct 180s Cinema Master"
                              : "Generate 9:16 Reel"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#07090E]" />
                        </>
                      )}
                    </button>

                    {/* ✨ Elaborate & Deconstruct Button */}
                    <button
                      type="button"
                      onClick={() => handleElaborate()}
                      disabled={isElaborating || isGenerating || (!promptText.trim() && !referenceUrl.trim())}
                      className={`px-3.5 py-2 rounded-xl disabled:opacity-50 disabled:pointer-events-none font-bold text-xs border transition-all flex items-center justify-center gap-1.5 min-h-[38px] ${
                        activeTab === "youtube_shorts"
                          ? "bg-amber-500/10 border-amber-400/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/70 shadow-lg shadow-amber-500/10"
                          : "bg-teal-500/10 border-teal-400/40 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/70 shadow-lg shadow-teal-500/10"
                      }`}
                      title="Omni Director deconstructs actors, dialogues, emotions, choreography, and spatial blocking into an approved treatment"
                    >
                      {isElaborating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Omni Deconstructing...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>✨ Elaborate &amp; Deconstruct</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-white/10 uppercase tracking-wider font-extrabold hidden xl:inline">
                            Omni Pre-Flight
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* STATED WAIT: HONEST TIME IN PLAIN ENGLISH */}
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">
                        {activeTab === "youtube_shorts"
                          ? "~12–15m for 30-shot master."
                          : "~7m for 6-shot reel."}
                      </span>
                      <span className="text-slate-500 block text-[10px]">
                        {activeTab === "youtube_shorts"
                          ? "5 acts & Beethoven score in background."
                          : "Renders in background; notify when ready."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Elaboration loading & error indicators */}
                {isElaborating && (
                  <div className="mt-2 p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-2.5 animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <div className="text-[11px] text-teal-200">
                      <strong className="block text-white font-semibold">Omni Director at Work...</strong>
                      <span>{elaborateStep || "Deconstructing actors, locations, lighting, and choreography..."}</span>
                    </div>
                  </div>
                )}

                {elaborateError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div>
                      <strong className="block text-white font-semibold">Director Elaboration Notice:</strong>
                      <span>{elaborateError}</span>
                    </div>
                  </div>
                )}

                {/* PLATFORM SAFETY GUARANTEE (C2PA + SYNTHID REFRAMED) */}
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Labeled as AI, so platforms won&apos;t penalize you.</strong> Verified C2PA Content Credentials &amp; SynthID watermarks satisfy disclosure rules without reach throttling.
                  </span>
                </div>
              </div>

              {/* OMNI DIRECTOR'S TREATMENT DOSSIER CARD */}
              {treatment && (
                <div className="mt-6 w-full bg-slate-50 border border-teal-500/40 rounded-2xl md:rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 relative z-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
                          <Clapperboard className="w-3.5 h-3.5" />
                          Omni Director Pre-Flight Treatment
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
                          Awaiting Approval
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-700 text-[11px]">
                          {treatment.targetDurationSec}s • {treatment.shots.length} Takes • {treatment.aspectRatio}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-700 text-[11px]">
                          {treatment.language}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {treatment.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 italic max-w-3xl">
                        &ldquo;{treatment.logline}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTreatment(null)}
                      className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                      title="Dismiss treatment"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Dismiss Dossier</span>
                    </button>
                  </div>

                  {/* Reference Deconstruction Banner */}
                  {treatment.referenceAnalyzed && (
                    <div className="mt-4 p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <div>
                          <span className="font-bold text-teal-200">Deconstructed Reference: </span>
                          <span className="text-white font-medium">{treatment.referenceAnalyzed.detectedTitle || treatment.referenceAnalyzed.url}</span>
                        </div>
                      </div>
                      <span className="text-slate-500 text-[11px] sm:text-right">
                        Aesthetic: <span className="text-slate-800">{treatment.referenceAnalyzed.detectedAesthetic}</span>
                      </span>
                    </div>
                  )}

                  {/* Dossier Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-200 mt-5 pb-2 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setTreatmentTab("screenplay")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
                        treatmentTab === "screenplay"
                          ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                          : "text-slate-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Screenplay &amp; Staging ({treatment.shots.length} Takes)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreatmentTab("cast")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
                        treatmentTab === "cast"
                          ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                          : "text-slate-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Cast &amp; Wardrobe Progression ({treatment.cast.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreatmentTab("score")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
                        treatmentTab === "score"
                          ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                          : "text-slate-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Music2 className="w-3.5 h-3.5" />
                      <span>Acoustic Bed &amp; Color Grade</span>
                    </button>
                  </div>

                  {/* TAB 1: SCREENPLAY & STAGING */}
                  {treatmentTab === "screenplay" && (
                    <div className="mt-4 space-y-3">
                      {treatment.shots.map((shot, idx) => {
                        const isExpanded = expandedShotIdx === idx;
                        const wordCount = shot.dialogueOrLyric.trim().split(/\s+/).filter(Boolean).length;
                        return (
                          <div
                            key={shot.shotNumber}
                            className="p-4 rounded-xl bg-slate-50 border border-white/5 hover:border-teal-500/30 transition-all"
                          >
                            <div
                              className="flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none"
                              onClick={() => setExpandedShotIdx(isExpanded ? null : idx)}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 font-mono font-bold text-xs flex items-center justify-center">
                                  #{shot.shotNumber}
                                </span>
                                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                                  shot.characterDensity === "duet"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : shot.characterDensity === "ensemble"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                }`}>
                                  {shot.characterDensity}
                                </span>
                                <span className="text-xs font-semibold text-white">
                                  {shot.onCameraCharacters.join(" & ") || "Atmospheric Scene"}
                                </span>
                                <span className="text-[11px] text-slate-500 hidden sm:inline">
                                  • {shot.cameraAndOptics.framing} ({shot.cameraAndOptics.lens})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {wordCount > 0 ? `${wordCount}w • budget safe` : "Visual take"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                            </div>

                            {/* Expanded Performance Triad Details */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {/* Left Column: Dialogue & Facial Micro-Expressions */}
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between text-[11px] text-teal-300 font-semibold mb-1">
                                      <span>💬 Dialogue / Lyric</span>
                                      <span className="text-[10px] text-slate-500">Speaker: {shot.speaker || "None"}</span>
                                    </div>
                                    <p className="text-slate-800 italic font-serif text-sm">
                                      &ldquo;{shot.dialogueOrLyric || "(Instrumental beat / ambient foley)"}&rdquo;
                                    </p>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-cyan-300 font-semibold block mb-1">
                                      👁️ Facial Micro-Expression &amp; Eyeline
                                    </span>
                                    <p className="text-slate-700">{shot.facialExpression}</p>
                                  </div>
                                </div>

                                {/* Right Column: Body Language, Choreography & Spatial Blocking */}
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-amber-300 font-semibold block mb-1">
                                      💃 Body Language &amp; Choreography
                                    </span>
                                    <p className="text-slate-700">
                                      {shot.bodyLanguage} • {shot.choreography}
                                    </p>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-violet-300 font-semibold block mb-1">
                                      📐 Spatial Blocking &amp; Camera Motion
                                    </span>
                                    <p className="text-slate-700">
                                      {shot.spatialBlocking.depthPlanes} | Proximity: {shot.spatialBlocking.proximity} | Contact: {shot.spatialBlocking.contactPoints}
                                    </p>
                                    <p className="text-slate-500 text-[11px] mt-1">
                                      Camera Motion: {shot.cameraAndOptics.cameraMotion}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: CAST & WARDROBE PROGRESSION */}
                  {treatmentTab === "cast" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {treatment.cast.map(c => (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl bg-slate-50 border border-white/5 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div>
                              <span className="text-sm font-bold text-white block">{c.name}</span>
                              <span className="text-[11px] text-teal-300 uppercase font-semibold">{c.role}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                              Safe Archetype Lock
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block font-medium mb-0.5">Biometric Archetype:</span>
                            <p className="text-slate-800">{c.archetypeSafeDescription}</p>
                            <div className="mt-1 text-[11px] text-slate-500">
                              {c.biometricDNA.ageBand} • {c.biometricDNA.hair} • {c.biometricDNA.facialFeatures}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-[11px] text-amber-300 font-semibold block">Wardrobe Progression:</span>
                            <div className="space-y-1 text-[11px]">
                              <div className="text-slate-700">
                                <strong className="text-slate-500">Act 1–2:</strong> {c.wardrobeProgression.act1_2.costume} ({c.wardrobeProgression.act1_2.accessories})
                              </div>
                              <div className="text-slate-700">
                                <strong className="text-slate-500">Act 3–4:</strong> {c.wardrobeProgression.act3_4.costume} ({c.wardrobeProgression.act3_4.accessories})
                              </div>
                              <div className="text-slate-700">
                                <strong className="text-slate-500">Act 5:</strong> {c.wardrobeProgression.act5.costume} ({c.wardrobeProgression.act5.accessories})
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: ACOUSTIC SCORE & COLOR SCRIPT */}
                  {treatmentTab === "score" && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Acoustic Score */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Music2 className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold text-white">Acoustic Score Bed</span>
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">
                            {treatment.musicScore.lufsTarget}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 block">Genre / Mood:</span>
                            <span className="text-white font-medium">{treatment.musicScore.genre}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Tempo &amp; Key:</span>
                            <span className="text-white font-medium">{treatment.musicScore.bpm} BPM • {treatment.musicScore.key} ({treatment.musicScore.meter})</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Lead Instruments:</span>
                          <span className="text-slate-800">{treatment.musicScore.instruments.join(", ")}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Vocal Profile:</span>
                          <span className="text-slate-800">{treatment.musicScore.vocalProfile}</span>
                        </div>
                      </div>

                      {/* Color Script */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Palette className="w-4 h-4 text-teal-400" />
                          <span className="text-sm font-bold text-white">Directorial Color Script</span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          <div>
                            <strong className="text-teal-300 block">Act 1–2 (Exposition / Rise):</strong>
                            <p className="text-slate-700">{treatment.colorScript.act1_2}</p>
                          </div>
                          <div>
                            <strong className="text-amber-300 block">Act 3–4 (Climax / Dramatic Stakes):</strong>
                            <p className="text-slate-700">{treatment.colorScript.act3_4}</p>
                          </div>
                          <div>
                            <strong className="text-cyan-300 block">Act 5 (Resolution / Grand Finale):</strong>
                            <p className="text-slate-700">{treatment.colorScript.act5}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conversational Tweak with Omni Box */}
                  <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>Want Omni to adjust any character, costume, choreography, or dialogue?</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={tweakPrompt}
                        onChange={(e) => setTweakPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tweakPrompt.trim() && !isTweaking) {
                            handleElaborate(tweakPrompt);
                          }
                        }}
                        placeholder="e.g. 'Make dance choreography higher energy in Shot 2', 'Change heroine saree to ruby red chiffon', 'More close-up yearning eyelines'..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base md:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleElaborate(tweakPrompt)}
                        disabled={isTweaking || !tweakPrompt.trim()}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 min-h-[44px] transition-colors disabled:opacity-50"
                      >
                        {isTweaking ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Apply Tweak</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Approval CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerate(treatment)}
                      disabled={isGenerating}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 hover:from-teal-300 hover:to-cyan-300 text-[#07090E] font-black text-sm sm:text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 min-h-[50px]"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#07090E] border-t-transparent rounded-full animate-spin" />
                          <span>Directing &amp; Enqueuing Reel Takes...</span>
                        </>
                      ) : (
                        <>
                          <Clapperboard className="w-5 h-5 text-[#07090E]" />
                          <span>🚀 Approve Treatment &amp; Direct {treatment.targetDurationSec}s Reel</span>
                          <ArrowRight className="w-4 h-4 text-[#07090E]" />
                        </>
                      )}
                    </button>

                    <span className="text-xs text-slate-500 text-center sm:text-right">
                      Omni will direct all {treatment.shots.length} takes with 100% actor &amp; costume continuity.
                    </span>
                  </div>
                </div>
              )}

              {/* LIVE GENERATION STATUS OR RESULT CARD */}
              {isGenerating && (
                <div className="mt-4 p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div className="text-xs sm:text-sm text-teal-200">
                    <strong className="block text-white font-semibold">Generating Character Anchor...</strong>
                    <span>{generationStep || "Enqueuing background video diffusion worker..."}</span>
                  </div>
                </div>
              )}

              {generationError && (
                <div className="mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-3 text-xs sm:text-sm text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">Generation Notice:</strong>
                    <span>{generationError}</span>
                  </div>
                </div>
              )}

              {generatedResult && (
                <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-teal-500/40 shadow-xl text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="font-bold text-white text-base">Production Successfully Queued!</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-mono font-semibold">
                      ID: {generatedResult.productionId?.slice(0, 16) || "studio1"}
                    </span>
                  </div>

                  <p className="text-slate-700 mb-3">
                    {generatedResult.message || "Your production is now queued in the background video diffusion worker."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/my-reels"
                      className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#07090E] font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Film className="w-4 h-4" />
                      <span>Track in My Reels</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setGeneratedResult(null)}
                      className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: THE LIVE PRODUCTION MONITOR CARD (6 cols) */}
            <div className="lg:col-span-6 flex flex-col">
              {/* THE MATCHING PRODUCTION MONITOR CONTAINER */}
              <div
                id="production-monitor"
                className={`w-full h-full bg-white border rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/60 relative transition-all flex flex-col justify-between ${
                  activeTab === "youtube_shorts"
                    ? "border-amber-500/20"
                    : "border-slate-200"
                }`}
              >
                {activeTab === "instagram_tiktok" ? (
                  /* Phone-like 9:16 viewport frame + Sample filmstrip + Continuity lock in sleek matching card */
                  <div className="flex-1 flex flex-col justify-between gap-3.5">
                    {/* Card Header matching left card styling */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-teal-400" />
                          Live Production Monitor
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20">
                          Zero Face Drift
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-black/50 border border-slate-200 font-mono text-teal-300">
                          9:16 Vertical
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>Tap to preview</span>
                      </div>
                    </div>

                    {/* Body: Side-by-side Smartphone & Companion Content */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-5">
                      {/* Smartphone Frame (Locked to true 9:16 aspect ratio: 236px x 420px, never vertically stretched) */}
                      <div className="relative w-[220px] sm:w-[236px] h-[391px] sm:h-[420px] shrink-0 aspect-[9/16] self-start bg-black rounded-[28px] p-2 shadow-2xl shadow-teal-500/20 border-2 border-slate-200 ring-1 ring-white/10 flex flex-col justify-between overflow-hidden group">
                        {/* Simulated mobile phone ear notch */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-[#F7F8FC] rounded-full z-30 pointer-events-none border border-white/5" />

                        {/* THE 9:16 VIDEO ELEMENT */}
                        <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-slate-950">
                          <video
                            ref={videoRef}
                            key={activeReel.videoUrl}
                            src={activeReel.videoUrl}
                            poster={activeReel.posterUrl}
                            playsInline
                            muted={isMuted}
                            autoPlay
                            loop
                            preload="auto"
                            className="w-full h-full object-cover select-none cursor-pointer"
                            onClick={togglePlay}
                          />

                          {/* Top Badges Overlay */}
                          <div className="absolute top-6 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-slate-200 text-[9px] font-bold text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>{activeReel.shots} Shots • {activeReel.durationSec}s</span>
                            </span>

                            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/90 backdrop-blur-md text-[#07090E] text-[8px] font-black uppercase tracking-wider">
                              Zero Drift
                            </span>
                          </div>

                          {/* Controls overlay: Mute & Play toggles */}
                          <div className="absolute top-6 right-2.5 z-30 flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={toggleMute}
                              className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-slate-300 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                              title={isMuted ? "Unmute Audio" : "Mute Audio"}
                            >
                              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
                            </button>

                            <button
                              type="button"
                              onClick={togglePlay}
                              className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-slate-300 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                              title={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5 text-teal-400" />}
                            </button>
                          </div>

                          {/* Bottom Info Bar inside Reel */}
                          <div className="absolute bottom-0 inset-x-0 p-2.5 pt-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400">
                              {activeReel.category}
                            </span>
                            <h3 className="text-xs font-bold text-white leading-tight drop-shadow-md truncate">
                              {activeReel.title}
                            </h3>
                            <p className="text-[9px] text-slate-700 mt-0.5 line-clamp-1 leading-snug">
                              {activeReel.prompt}
                            </p>

                            <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
                              <span className="flex items-center gap-0.5 text-teal-300 font-medium">
                                <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                                Single continuous take
                              </span>
                              <span>9:16 Vertical</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Companion Side Column: Sample Productions Grid + Continuity Lock Card (Matched 420px height) */}
                      <div className="flex-1 flex flex-col justify-between sm:h-[420px] gap-3 w-full max-w-[320px] sm:max-w-none">
                        {/* Switch active reel filmstrip cards */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-0.5 text-xs text-slate-500">
                            <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                              <Film className="w-3.5 h-3.5 text-teal-400" /> Sample Productions
                            </span>
                            <span className="text-[10px] text-slate-500">Tap to load</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            {FINISHED_REELS.map((reel, idx) => (
                              <button
                                key={reel.id}
                                type="button"
                                onClick={() => setActiveReelIndex(idx)}
                                className={`relative aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all group ${
                                  activeReelIndex === idx
                                    ? "border-teal-400 shadow-md shadow-teal-500/30 scale-[1.02] z-10"
                                    : "border-slate-200 opacity-70 hover:opacity-100 hover:border-white/30"
                                }`}
                                title={reel.title}
                              >
                                <img src={reel.posterUrl} alt={reel.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-white truncate text-left">
                                    {reel.title}
                                  </span>
                                  <span className="text-[8px] font-mono text-teal-300 shrink-0 bg-black/60 px-1 py-0.5 rounded">
                                    {reel.durationSec}s
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Continuity Proof Badge Card */}
                        <div className="w-full p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs text-slate-700 flex items-start gap-2.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-teal-300 block font-semibold text-[11px]">Biometric Continuity Lock:</strong>
                            <span className="text-slate-700 text-[10px] leading-relaxed block mt-0.5">
                              {activeReel.continuityProof}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lower Production Telemetry & Pipeline Spec Deck (Balances card height when left-side Casting panel is expanded) */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Acoustic Clock</span>
                        <span className="text-xs font-bold text-teal-300 mt-0.5">Lyria 3.5 Master</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">-14.0 LUFS Polyphonic</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Visual Continuity</span>
                        <span className="text-xs font-bold text-teal-300 mt-0.5">Tail-Frame Chain</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Cut PSNR &lt; 25.0 dB</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Director Engine</span>
                        <span className="text-xs font-bold text-teal-300 mt-0.5">Omni 1.1 Pre-Flight</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Zero Phantom Mouthing</span>
                      </div>
                    </div>

                    {/* Card Footer: Matching left card AI disclosure */}
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 text-teal-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% Biometric Facial Lock across all continuous cuts</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">SynthID &amp; C2PA Verified</span>
                    </div>
                  </div>
                ) : (
                  /* Cinema Master 180s Theatrical Showcase Frame + Scrubber + Score & Acts in Matching Card */
                  <div className="flex-1 flex flex-col justify-between gap-3.5">
                    {/* Card Header matching left card styling */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                          Theatrical Cinema Monitor
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20">
                          5-Act Master
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-black/50 border border-slate-200 font-mono text-amber-300">
                          2.39:1 Anamorphic
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>30 Shots • 180s</span>
                      </div>
                    </div>

                    {/* Cinema Master 180s Video Player */}
                    <div className="relative w-full aspect-[2.39/1] bg-black rounded-xl sm:rounded-2xl p-1.5 shadow-2xl shadow-amber-500/15 border-2 border-amber-500/40 ring-1 ring-amber-500/20 overflow-hidden group">
                      <video
                        ref={videoRef}
                        key={activeCinema.videoUrl}
                        src={activeCinema.videoUrl}
                        poster={activeCinema.posterUrl}
                        playsInline
                        muted={isMuted}
                        autoPlay
                        loop
                        preload="auto"
                        className="w-full h-full object-cover select-none cursor-pointer rounded-lg sm:rounded-xl"
                        onClick={togglePlay}
                      />

                      {/* Center Cinema Play Button overlay when paused */}
                      {!isPlaying && (
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-400/90 hover:bg-amber-300 text-[#07090E] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-30 cursor-pointer"
                          aria-label="Play Cinema Master"
                          title="Play Full Combined Cinema Master Reel"
                        >
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </button>
                      )}

                      {/* Top Cinema Overlay Badges */}
                      <div className="absolute top-2 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-slate-200 text-[9px] font-bold text-white flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>30 Shots • 180s • 5 Classical Acts</span>
                        </span>

                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400/90 backdrop-blur-md text-[#07090E] text-[8px] font-black uppercase tracking-wider">
                          2.39:1 Anamorphic
                        </span>
                      </div>

                      {/* Controls overlay: Mute & Play toggles */}
                      <div className="absolute top-2 right-2.5 z-30 flex gap-1.5">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-slate-300 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                          title={isMuted ? "Unmute Audio" : "Mute Audio"}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={togglePlay}
                          className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-slate-300 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                          title={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5 text-amber-400" />}
                        </button>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-0 inset-x-0 p-2 pt-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                            {activeCinema.category}
                          </span>
                          <span className="text-[9px] text-slate-700 truncate max-w-[260px]">
                            {activeCinema.subtitle}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md truncate">
                          {activeCinema.title}
                        </h3>
                      </div>
                    </div>

                    {/* 5 ACTS TIME JUMP SCRUBBER */}
                    <div className="bg-white rounded-xl p-2 border border-amber-500/20 shadow-md flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
                        <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 text-[10px]">
                          <Clapperboard className="w-3 h-3 text-amber-400" />
                          Jump to Act:
                        </span>
                        <span className="text-[9px] text-slate-500">Interactive Timeline</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { act: 1, label: "Marseilles", time: 0, timecode: "0:00" },
                          { act: 2, label: "Notre-Dame", time: 36, timecode: "0:36" },
                          { act: 3, label: "Poland", time: 72, timecode: "1:12" },
                          { act: 4, label: "Tuileries", time: 108, timecode: "1:48" },
                          { act: 5, label: "St. Helena", time: 144, timecode: "2:24" }
                        ].map(item => (
                          <button
                            key={item.act}
                            type="button"
                            onClick={() => seekToTime(item.time)}
                            className="px-1 py-1 rounded-lg bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/5 text-slate-700 hover:text-amber-200 transition-all text-center flex flex-col items-center min-h-[34px] justify-center"
                          >
                            <span className="text-amber-400 font-bold text-[10px]">Act {item.act}</span>
                            <span className="text-[8px] text-slate-500">{item.timecode}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Side-by-Side: Score Bed & Classical 5-Act Narrative Arc */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Master Symphonic Score Bed Card */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-amber-500/20 text-xs text-slate-700 flex items-start gap-2 shadow-md">
                        <Music2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block font-semibold text-[10px] uppercase tracking-wider">Master Symphonic Bed (-24.0 LUFS):</strong>
                          <span className="text-slate-700 text-[10px] block mt-0.5 leading-snug">{activeCinema.scoreTitle}</span>
                        </div>
                      </div>

                      {/* Classical 5-Act Breakdown */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-md overflow-hidden">
                        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold border-b border-white/5 pb-1 mb-1">
                          <span className="flex items-center gap-1">
                            <Clapperboard className="w-3 h-3 text-amber-400" />
                            Classical 5-Act Narrative Arc
                          </span>
                          <span className="text-slate-500 font-mono text-[9px]">30 Takes • 180s</span>
                        </div>
                        <div className="space-y-0.5 text-[10px]">
                          {activeCinema.acts.map((act) => (
                            <div
                              key={act.act}
                              className="flex items-center justify-between gap-1 cursor-pointer hover:text-amber-200 transition-colors py-0.5"
                              onClick={() => seekToTime(act.act === 1 ? 0 : act.act === 2 ? 36 : act.act === 3 ? 72 : act.act === 4 ? 108 : 144)}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <span className="font-mono text-amber-400 font-bold shrink-0">A{act.act}:</span>
                                <strong className="text-white font-medium truncate">{act.title}</strong>
                              </div>
                              <span className="text-slate-500 font-mono text-[9px] shrink-0">{act.timecode}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Matching left card AI disclosure */}
                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Music2 className="w-3.5 h-3.5" />
                        <span>Orchestral Score (Beethoven Op. 92) EBU R128 Mastered</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">Cooke Anamorphic 24fps</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
          )}

        </div>
      </section>
    </div>
  );
}
