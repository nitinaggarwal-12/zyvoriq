"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  MapPin,
  Menu
} from "lucide-react";
import type { OmniDirectorialTreatment } from "@/lib/reel/elaborateDirector";
import { getNextPartInfo } from "./MyReelsLibrary";
import { CharacterLibrary } from "./CharacterLibrary";
import { LocationLibrary } from "./LocationLibrary";
import type { LibraryCharacter } from "@/lib/library/characterLibrary";
import type { LibraryLocation } from "@/lib/library/locationLibrary";

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

export const FORMAT_CONFIGS = [
  { id: "9:16" as const, label: "9:16 Vertical", icon: "📱", badge: "Reels / TikTok", desc: "Full-bleed vertical smartphone immersion" },
  { id: "16:9" as const, label: "16:9 Landscape", icon: "🖥️", badge: "YouTube UHD", desc: "Cinematic widescreen desktop displays" },
  { id: "2.39:1" as const, label: "2.39:1 Anamorphic", icon: "🎬", badge: "Cinema Master", desc: "Theatrical anamorphic scope falloff" },
];

export const DURATION_CONFIGS = [
  { sec: 15, label: "15s", badge: "Short Hook", desc: "3 takes • Quick viral hook" },
  { sec: 30, label: "30s", badge: "Standard Reel", desc: "5 takes • Social algorithm pacing" },
  { sec: 34, label: "34s", badge: "Music Video", desc: "5 takes • Synchronized lip-sync & dance" },
  { sec: 45, label: "45s", badge: "Extended", desc: "7 takes • Detailed narrative progression" },
  { sec: 60, label: "60s", badge: "Short Master", desc: "9 takes • Complete 1-minute narrative arc" },
  { sec: 180, label: "180s", badge: "5-Act Master", desc: "25 takes • 3-minute 5-act theatrical epic" },
];

export function CreatorReelsHome() {
  const [activeTab, setActiveTab] = useState<"instagram_tiktok" | "youtube_shorts">("instagram_tiktok");
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
  const [openDropdown, setOpenDropdown] = useState<"format" | "duration" | "genre" | "language" | null>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest?.(".dropdown-container")) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);
  const [selectedCastSize, setSelectedCastSize] = useState<1 | 2>(1);
  const [leadCharacter, setLeadCharacter] = useState<LibraryCharacter | null>(null);
  const [supportingCharacter, setSupportingCharacter] = useState<LibraryCharacter | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LibraryLocation | null>(null);
  const [showCharacterLibraryModal, setShowCharacterLibraryModal] = useState(false);
  const [showLocationLibraryModal, setShowLocationLibraryModal] = useState(false);
  const [showCastAndPlaceDrawer, setShowCastAndPlaceDrawer] = useState(false);
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [assetsMenuOpen, setAssetsMenuOpen] = useState(false);
  const [studioMenuOpen, setStudioMenuOpen] = useState(false);

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

  // Hydrate custom or generated reel from URL query params (e.g. ?id=... or ?reel=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id") || params.get("reel");
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
        setPromptText(`Act II: Continuation of "${resolveLocal.title}". The sequence continues seamlessly with the same character, wardrobe, and visual aesthetic: `);
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
        fetch(`/api/reels/productions/${encodeURIComponent(continueId)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const prod = data?.production;
            if (prod) {
              const m = prod.manifest || {};
              let cleanTitle = m.topic || (m as any).studio1?.projectTitle || prod.id;
              if (cleanTitle.length > 50) cleanTitle = cleanTitle.slice(0, 48) + "...";
              let poster = prod.posterUrl;
              if (!poster || poster.includes(".railway.internal")) {
                poster = m.shots?.[1]?.continuityIn?.referenceFrameUrl || m.shots?.[0]?.posterUrl || null;
              }
              if (!poster || poster.includes(".railway.internal")) {
                if (prod.id.includes("5b3c6b72")) poster = "/assets/stills/ren_cyberpunk.png";
                else if (prod.id.includes("e2e00945")) poster = "/assets/stills/dubai_dance.jpg";
                else if (prod.id.includes("9f360810") || prod.id.includes("39a1fe18")) poster = "/assets/stills/swiss_alpine.jpg";
                else if (!prod.id.includes("cf46b686") && (prod.id.includes("d2d144d2") || prod.id.includes("32ffc950"))) poster = "/assets/stills/desert_spiral.jpg";
                else if (prod.id.includes("5bfb958d") || prod.id.includes("1a8264ca")) poster = "/assets/stills/cosmic_nebula.jpg";
                else if (prod.id.includes("napoleon")) poster = "/assets/stills/napoleon_hero.png";
                else if (prod.id.includes("coronation")) poster = "/assets/stills/coronation_hero.png";
              }
              const partInfo = getNextPartInfo({ title: cleanTitle, prompt: m.prompt || m.topic });
              setContinuationParent({
                id: prod.id,
                title: cleanTitle,
                category: m.genre || "Choreography & Style",
                prompt: m.prompt || m.topic || "",
                aspectRatio: m.aspectRatio || "9:16",
                durationSec: m.requestedDurationSec || m.durationSec || 30,
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
              setTimeout(() => {
                const el = document.getElementById("directorial-studio") || document.getElementById("prompt-studio-box");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }
          })
          .catch(() => {});
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

  const handleTabChange = (tab: "instagram_tiktok" | "youtube_shorts") => {
    setActiveTab(tab);
    setShowcaseTab(tab);
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
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* 1. STICKY FULL-WIDTH NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#07090E]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 h-18 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                  <Film className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  ZYVORIQ
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300">
                    Creator
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Single unbroken takes • Zero character drift
                </span>
              </div>
            </Link>
          </div>

          {/* CONSOLIDATED DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-300">
            <a href="#showcase" className="hover:text-teal-400 transition-colors py-2">
              Showcase
            </a>

            {/* Assets Dropdown (Characters & Sets) */}
            <div
              className="relative group"
              onMouseEnter={() => setAssetsMenuOpen(true)}
              onMouseLeave={() => setAssetsMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAssetsMenuOpen(!assetsMenuOpen)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 group-hover:text-teal-300"
              >
                <span>Assets</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${assetsMenuOpen ? "rotate-180 text-teal-400" : "text-slate-400"}`} />
              </button>

              <div
                className={`absolute top-full left-0 pt-2 w-64 transition-all duration-200 z-50 ${
                  assetsMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="p-2 rounded-2xl bg-[#0C1019]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 space-y-1">
                  <Link
                    href="/characters"
                    onClick={() => setAssetsMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-teal-400/50">
                      <Users className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Characters
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold uppercase">DNA</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Biometric face &amp; wardrobe continuity
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/locations"
                    onClick={() => setAssetsMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-amber-400/50">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Locations &amp; Sets
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">Sets</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Persistent physical sets &amp; environments
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Studio Dropdown (Omni Studio & Long-Form Episodes) */}
            <div
              className="relative group"
              onMouseEnter={() => setStudioMenuOpen(true)}
              onMouseLeave={() => setStudioMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setStudioMenuOpen(!studioMenuOpen)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-2 group-hover:text-teal-300"
              >
                <span>Studio</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${studioMenuOpen ? "rotate-180 text-teal-400" : "text-slate-400"}`} />
              </button>

              <div
                className={`absolute top-full left-0 pt-2 w-64 transition-all duration-200 z-50 ${
                  studioMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="p-2 rounded-2xl bg-[#0C1019]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 space-y-1">
                  <Link
                    href="/studio"
                    onClick={() => setStudioMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-teal-400/50">
                      <Clapperboard className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Omni Studio
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold uppercase">11-Phase</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Director treatment &amp; multimodal compiler
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/episodes/create"
                    onClick={() => setStudioMenuOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-cyan-400/50">
                      <Film className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        Episodes (30m)
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold uppercase">Series</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Full-length continuous episodic productions
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <a href="#differentiator" className="hover:text-teal-400 transition-colors py-2">
              Why Unbroken
            </a>

            <a href="#pricing" className="hover:text-teal-400 transition-colors py-2">
              Pricing
            </a>
          </nav>

          {/* RIGHT ACTION ZONE */}
          <div className="flex items-center gap-3">
            <Link
              href="/my-reels"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Film className="w-3.5 h-3.5 text-teal-400" />
              <span>My Reels</span>
            </Link>

            <a
              href="#prompt-bar"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#07090E] font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Reel</span>
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#07090E]/98 border-b border-white/10 px-4 py-4 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/5">
              <a
                href="#showcase"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Showcase</span>
              </a>
              <Link
                href="/my-reels"
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-2"
              >
                <Film className="w-3.5 h-3.5 text-teal-400" />
                <span>My Reels</span>
              </Link>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-1 tracking-wider">Creation &amp; Assets</div>
              <Link
                href="/characters"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Characters
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300">DNA</span>
              </Link>
              <Link
                href="/locations"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Locations &amp; Sets
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">Sets</span>
              </Link>
              <Link
                href="/studio"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-teal-400" />
                  Omni Studio
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300">11-Phase</span>
              </Link>
              <Link
                href="/episodes/create"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  Episodes (30m)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300">Series</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <a
                href="#differentiator"
                onClick={() => setMobileNavOpen(false)}
                className="text-center p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
              >
                Why Unbroken
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileNavOpen(false)}
                className="text-center p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
              >
                Pricing
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. THE FOLD: HERO WITH PLAYING REEL + PROMPT BAR */}
      <section className="relative pt-2 sm:pt-3 pb-3 md:pb-4 border-b border-white/5 overflow-hidden">
        {/* Subtle background glow tailored to activeTab */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[450px] blur-[140px] pointer-events-none transition-all duration-700 ${
          activeTab === "youtube_shorts"
            ? "bg-gradient-to-tr from-amber-600/15 via-orange-500/10 to-transparent"
            : "bg-gradient-to-tr from-teal-600/15 via-cyan-500/10 to-transparent"
        }`} />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 relative z-10">
          {/* MASTHEAD HEADER ZONE: Sleek, compact, condensed, zero scrolling required */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-2 sm:mb-2.5">
            {/* DUAL FORMAT SELECTOR: TAB 1 (Instagram / TikTok) vs TAB 2 (YouTube Shorts & 180s Cinema) */}
            <div className="inline-flex p-1 bg-[#0C1019]/90 border border-white/10 rounded-xl mb-1.5 shadow-lg backdrop-blur-xl w-full max-w-md">
              <button
                type="button"
                onClick={() => handleTabChange("instagram_tiktok")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
                  activeTab === "instagram_tiktok"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-[#07090E] shadow-md shadow-teal-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Instagram / TikTok</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                  activeTab === "instagram_tiktok" ? "bg-[#07090E]/20 text-[#07090E]" : "bg-white/5 text-slate-400"
                }`}>
                  9:16
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("youtube_shorts")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[36px] ${
                  activeTab === "youtube_shorts"
                    ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 text-[#07090E] shadow-md shadow-orange-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5 shrink-0" />
                <span>YouTube / Cinema</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                  activeTab === "youtube_shorts" ? "bg-[#07090E]/20 text-[#07090E]" : "bg-white/5 text-slate-400"
                }`}>
                  180s Master
                </span>
              </button>
            </div>

            {/* Live Specification Pill Badge */}
            {activeTab === "instagram_tiktok" ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[10px] sm:text-[11px] font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Single Unbroken Take • Zero Character Drift • 9:16 Vertical</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] sm:text-[11px] font-semibold mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Classical 5-Act Drama • Anamorphic Cinematography • Symphonic Bed (-24.0 LUFS)</span>
              </div>
            )}

            {/* Main Headline */}
            {activeTab === "instagram_tiktok" ? (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-black tracking-tight text-white leading-tight mb-0.5">
                  Generate 9:16 reels that{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">
                    actually keep the same face.
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-normal max-w-2xl">
                  Other AI tools morph your character on every cut. Zyvoriq extends continuous scenes with 100% biometric facial identity lock.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-black tracking-tight text-white leading-tight mb-0.5">
                  Direct 180s cinema that{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                    commands the big screen.
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-normal max-w-2xl">
                  Synthesize 3-minute 30-shot theatrical epics in 5-act narrative arcs, Cooke anamorphic 2.39:1 optics, and -24.0 LUFS symphonic scores.
                </p>
              </>
            )}
          </div>

          {/* TWO-COLUMN STUDIO CONSOLE: EQUAL SIZE (50% / 50% split, items-stretch) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
            {/* LEFT COLUMN: COMMAND & PROMPT BAR (50% width) */}
            <div className="flex flex-col h-full">
              {/* THE PROMPT BAR CONTAINER */}
              <div
                id="prompt-bar"
                className={`w-full h-full bg-[#0E121B] border rounded-2xl md:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/60 relative flex flex-col justify-between transition-all ${
                  activeTab === "youtube_shorts"
                    ? "border-amber-500/20 focus-within:border-amber-500/50"
                    : "border-white/10 focus-within:border-teal-500/50"
                }`}
              >
                {/* STUDIO DYNAMIC CONFIGURATION BAR: 4 CONSOLIDATED DYNAMIC DROPDOWNS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 pb-2 border-b border-white/5 relative z-30">
                  {/* 1. FORMAT DROPDOWN */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      data-dropdown-trigger="format"
                      onClick={() => setOpenDropdown(openDropdown === "format" ? null : "format")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-1 min-h-[42px] ${
                        openDropdown === "format"
                          ? activeTab === "youtube_shorts"
                            ? "bg-[#141A26] border-amber-400/60 ring-1 ring-amber-400/30"
                            : "bg-[#141A26] border-teal-400/60 ring-1 ring-teal-400/30"
                          : "bg-[#090D15] hover:bg-[#101522] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">Format</span>
                        <span className="block text-xs font-bold text-white truncate flex items-center gap-1">
                          <span>{selectedAspectRatio === "9:16" ? "📱" : selectedAspectRatio === "16:9" ? "🖥️" : "🎬"}</span>
                          <span>{selectedAspectRatio === "2.39:1" ? "2.39:1 Scope" : selectedAspectRatio}</span>
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === "format" ? "rotate-180 text-teal-400" : ""}`} />
                    </button>

                    {openDropdown === "format" && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 w-64 bg-[#0B0F18]/95 backdrop-blur-2xl border border-white/15 rounded-xl p-2 shadow-2xl shadow-black/90 space-y-1.5 animate-in fade-in duration-150">
                        {/* Dynamic Recommended Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center justify-between">
                            <span>⭐ Recommended for {activeTab === "youtube_shorts" ? "Cinema" : "Reels"}</span>
                            <span className="text-[8px] text-slate-400 font-mono">Smart Pick</span>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {FORMAT_CONFIGS.filter(f => (activeTab === "youtube_shorts" || selectedDuration >= 60 || ["HISTORICAL_BIOPIC", "CINEMATIC_DRAMA"].includes(selectedGenre)) ? (f.id === "2.39:1" || f.id === "16:9") : (f.id === "9:16" || f.id === "16:9")).map(fmt => (
                              <button
                                key={`rec-${fmt.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedAspectRatio(fmt.id);
                                  if (fmt.id === "2.39:1" && selectedDuration < 60) {
                                    setSelectedDuration(180);
                                  } else if (fmt.id === "9:16" && selectedDuration === 180) {
                                    setSelectedDuration(30);
                                  }
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedAspectRatio === fmt.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-200"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span>{fmt.icon}</span>
                                  <span className="truncate font-semibold">{fmt.label}</span>
                                </div>
                                {selectedAspectRatio === fmt.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/10 my-1" />

                        {/* All Options Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            All Formats
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {FORMAT_CONFIGS.map(fmt => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAspectRatio(fmt.id);
                                  if (fmt.id === "2.39:1" && selectedDuration < 60) {
                                    setSelectedDuration(180);
                                  } else if (fmt.id === "9:16" && selectedDuration === 180) {
                                    setSelectedDuration(30);
                                  }
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedAspectRatio === fmt.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span>{fmt.icon}</span>
                                  <div className="min-w-0">
                                    <div className="truncate font-semibold">{fmt.label}</div>
                                    <div className="text-[9px] text-slate-400 truncate">{fmt.desc}</div>
                                  </div>
                                </div>
                                {selectedAspectRatio === fmt.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. DURATION DROPDOWN */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      data-dropdown-trigger="duration"
                      onClick={() => setOpenDropdown(openDropdown === "duration" ? null : "duration")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-1 min-h-[42px] ${
                        openDropdown === "duration"
                          ? activeTab === "youtube_shorts"
                            ? "bg-[#141A26] border-amber-400/60 ring-1 ring-amber-400/30"
                            : "bg-[#141A26] border-teal-400/60 ring-1 ring-teal-400/30"
                          : "bg-[#090D15] hover:bg-[#101522] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">Duration</span>
                        <span className="block text-xs font-bold text-white truncate flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{selectedDuration}s</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {selectedDuration === 30 ? "(Std)" : selectedDuration === 34 ? "(Music)" : selectedDuration === 180 ? "(Master)" : selectedDuration === 60 ? "(Short)" : ""}
                          </span>
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === "duration" ? "rotate-180 text-teal-400" : ""}`} />
                    </button>

                    {openDropdown === "duration" && (
                      <div className="absolute top-full left-0 sm:left-0 mt-1.5 z-50 w-72 bg-[#0B0F18]/95 backdrop-blur-2xl border border-white/15 rounded-xl p-2 shadow-2xl shadow-black/90 space-y-1.5 animate-in fade-in duration-150">
                        {/* Dynamic Recommended Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center justify-between">
                            <span>
                              ⭐ Recommended for {selectedGenre === "MUSIC_VIDEO" ? "Music Video" : activeTab === "youtube_shorts" ? "Cinema" : "Reels"}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">Smart Pick</span>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {(selectedGenre === "MUSIC_VIDEO"
                              ? DURATION_CONFIGS.filter(d => d.sec === 34 || d.sec === 15 || d.sec === 30)
                              : activeTab === "youtube_shorts" || selectedAspectRatio === "2.39:1" || ["HISTORICAL_BIOPIC", "CINEMATIC_DRAMA"].includes(selectedGenre)
                              ? DURATION_CONFIGS.filter(d => d.sec === 180 || d.sec === 60)
                              : DURATION_CONFIGS.filter(d => d.sec === 30 || d.sec === 15 || d.sec === 34)
                            ).map(d => (
                              <button
                                key={`rec-${d.sec}`}
                                type="button"
                                onClick={() => {
                                  setSelectedDuration(d.sec);
                                  if (d.sec === 34) setSelectedGenre("MUSIC_VIDEO");
                                  if (d.sec === 180) setSelectedAspectRatio("2.39:1");
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedDuration === d.sec
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-200"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-bold text-teal-300">{d.label}</span>
                                  {d.badge && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 font-medium">
                                      {d.badge}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-400 truncate">{d.desc.split("•")[1] || d.desc}</span>
                                </div>
                                {selectedDuration === d.sec && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/10 my-1" />

                        {/* All Durations Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            All Durations
                          </div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            {DURATION_CONFIGS.map(d => (
                              <button
                                key={d.sec}
                                type="button"
                                onClick={() => {
                                  setSelectedDuration(d.sec);
                                  if (d.sec === 34) setSelectedGenre("MUSIC_VIDEO");
                                  if (d.sec === 180) setSelectedAspectRatio("2.39:1");
                                  setOpenDropdown(null);
                                }}
                                className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                                  selectedDuration === d.sec
                                    ? "bg-teal-500/20 text-teal-200 border-teal-500/40 font-bold"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/5"
                                }`}
                              >
                                <span>{d.sec}s</span>
                                {d.badge && <span className="text-[8px] text-slate-400 opacity-80">{d.badge.split(" ")[0]}</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Duration Input */}
                        <div className="pt-2 mt-1 border-t border-white/10 flex items-center justify-between px-1 text-xs">
                          <span className="text-[10px] text-slate-400 font-medium">Custom duration:</span>
                          <div className="flex items-center gap-1">
                            <input
                              id="custom-duration-input"
                              type="number"
                              min="10"
                              max="240"
                              value={selectedDuration}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const val = Math.max(10, Math.min(240, Number(e.target.value) || 30));
                                setSelectedDuration(val);
                              }}
                              className="w-12 bg-black/60 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white text-center font-bold focus:outline-none focus:border-teal-400"
                            />
                            <span className="text-[10px] text-slate-400">sec</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. GENRE DROPDOWN */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      data-dropdown-trigger="genre"
                      onClick={() => setOpenDropdown(openDropdown === "genre" ? null : "genre")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-1 min-h-[42px] ${
                        openDropdown === "genre"
                          ? activeTab === "youtube_shorts"
                            ? "bg-[#141A26] border-amber-400/60 ring-1 ring-amber-400/30"
                            : "bg-[#141A26] border-teal-400/60 ring-1 ring-teal-400/30"
                          : "bg-[#090D15] hover:bg-[#101522] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">Genre</span>
                        <span className="block text-xs font-bold text-white truncate">
                          {OMNI_GENRES.find(g => g.id === selectedGenre)?.label || "✨ Auto-Detect"}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === "genre" ? "rotate-180 text-teal-400" : ""}`} />
                    </button>

                    {openDropdown === "genre" && (
                      <div className="absolute top-full left-0 sm:left-auto sm:right-0 md:left-auto md:right-0 mt-1.5 z-50 w-72 bg-[#0B0F18]/95 backdrop-blur-2xl border border-white/15 rounded-xl p-2 shadow-2xl shadow-black/90 space-y-1.5 animate-in fade-in duration-150">
                        {/* Dynamic Recommended Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center justify-between">
                            <span>
                              ⭐ Recommended for {selectedDuration === 34 ? "34s Music" : activeTab === "youtube_shorts" ? "Cinema Master" : "Viral Reel"}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">Smart Pick</span>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {(selectedDuration === 34
                              ? OMNI_GENRES.filter(g => ["MUSIC_VIDEO", "AUTO", "BOLLYWOOD_ROMANCE"].includes(g.id))
                              : activeTab === "youtube_shorts" || selectedDuration >= 60 || selectedAspectRatio === "2.39:1"
                              ? OMNI_GENRES.filter(g => ["HISTORICAL_BIOPIC", "CINEMATIC_DRAMA", "AUTO", "BOLLYWOOD_ROMANCE"].includes(g.id))
                              : OMNI_GENRES.filter(g => ["AUTO", "MUSIC_VIDEO", "BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION"].includes(g.id))
                            ).map(g => (
                              <button
                                key={`rec-${g.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedGenre(g.id);
                                  if (g.id === "MUSIC_VIDEO" && selectedDuration !== 34) {
                                    setSelectedDuration(34);
                                    if (activeTab === "instagram_tiktok") setSelectedAspectRatio("9:16");
                                  } else if (["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION"].includes(g.id) && selectedLanguage === "en") {
                                    setSelectedLanguage("hinglish-roman");
                                  }
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedGenre === g.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-200"
                                }`}
                              >
                                <span className="font-semibold truncate">{g.label}</span>
                                {selectedGenre === g.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/10 my-1" />

                        {/* All Genres Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            All Genres
                          </div>
                          <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1 pr-1 scrollbar-thin">
                            {OMNI_GENRES.map(g => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => {
                                  setSelectedGenre(g.id);
                                  if (g.id === "MUSIC_VIDEO" && selectedDuration !== 34) {
                                    setSelectedDuration(34);
                                    if (activeTab === "instagram_tiktok") setSelectedAspectRatio("9:16");
                                  } else if (["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION"].includes(g.id) && selectedLanguage === "en") {
                                    setSelectedLanguage("hinglish-roman");
                                  }
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedGenre === g.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-300"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold truncate">{g.label}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{g.desc}</div>
                                </div>
                                {selectedGenre === g.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1.5" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. LANGUAGE DROPDOWN */}
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      data-dropdown-trigger="language"
                      onClick={() => setOpenDropdown(openDropdown === "language" ? null : "language")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl border transition-all flex items-center justify-between gap-1 min-h-[42px] ${
                        openDropdown === "language"
                          ? activeTab === "youtube_shorts"
                            ? "bg-[#141A26] border-amber-400/60 ring-1 ring-amber-400/30"
                            : "bg-[#141A26] border-teal-400/60 ring-1 ring-teal-400/30"
                          : "bg-[#090D15] hover:bg-[#101522] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">Language</span>
                        <span className="block text-xs font-bold text-white truncate flex items-center gap-1">
                          <Languages className="w-3 h-3 text-teal-400 shrink-0" />
                          <span className="truncate">{LANGUAGE_OPTIONS.find(l => l.id === selectedLanguage)?.label || "English"}</span>
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === "language" ? "rotate-180 text-teal-400" : ""}`} />
                    </button>

                    {openDropdown === "language" && (
                      <div className="absolute top-full right-0 left-auto mt-1.5 z-50 w-64 bg-[#0B0F18]/95 backdrop-blur-2xl border border-white/15 rounded-xl p-2 shadow-2xl shadow-black/90 space-y-1.5 animate-in fade-in duration-150">
                        {/* Dynamic Recommended Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-teal-400 flex items-center justify-between">
                            <span>
                              ⭐ Recommended for {["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION"].includes(selectedGenre) ? "Bollywood" : "Global"}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">Smart Pick</span>
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {(["BOLLYWOOD_ROMANCE", "BOLLYWOOD_ACTION"].includes(selectedGenre)
                              ? LANGUAGE_OPTIONS.filter(l => ["hinglish-roman", "hi-devanagari", "en"].includes(l.id))
                              : LANGUAGE_OPTIONS.filter(l => ["en", "hinglish-roman"].includes(l.id))
                            ).map(l => (
                              <button
                                key={`rec-${l.id}`}
                                type="button"
                                onClick={() => {
                                  setSelectedLanguage(l.id);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedLanguage === l.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-200"
                                }`}
                              >
                                <span className="font-semibold truncate">{l.label}</span>
                                {selectedLanguage === l.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-white/10 my-1" />

                        {/* All Options Section */}
                        <div>
                          <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            All Languages
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {LANGUAGE_OPTIONS.map(l => (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  setSelectedLanguage(l.id);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  selectedLanguage === l.id
                                    ? "bg-teal-500/20 text-teal-200 font-bold border border-teal-500/40"
                                    : "hover:bg-white/5 text-slate-300"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold truncate">{l.label}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{l.desc}</div>
                                </div>
                                {selectedLanguage === l.id && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Cast & Reference Controls bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowRefInput(!showRefInput)}
                    className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Link2 className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>🔗 YouTube / Reference URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCastAndPlaceDrawer(!showCastAndPlaceDrawer)}
                    className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-white/5"
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
                  <div className="mb-3 p-3 rounded-xl bg-[#07090E]/80 border border-white/10 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-slate-200">Casting & Physical Set Lock</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 mr-1">Cast Size:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCastSize(1)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            selectedCastSize === 1 ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40" : "bg-white/5 text-slate-400"
                          }`}
                        >
                          Solo Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCastSize(2)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            selectedCastSize === 2 ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40" : "bg-white/5 text-slate-400"
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
                              : "text-slate-400 hover:text-white"
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
                              : "text-slate-400 hover:text-white"
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
                              : "text-slate-400 hover:text-white"
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
                          <p className="text-xs text-slate-300 leading-relaxed">
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
                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5" /> Custom Performer & Set Specification
                            </span>
                            <span className="text-[10px] text-slate-400">Omni validates & anchors in advance</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-slate-300 block mb-1">Performer Name</label>
                              <input
                                type="text"
                                value={customLeadName}
                                onChange={(e) => setCustomLeadName(e.target.value)}
                                placeholder="e.g. Astrid Vane, Det. Frederik, Maya Lin"
                                className="w-full bg-[#0C1019] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-300 block mb-1">Gender / Voice Profile</label>
                              <div className="flex items-center gap-2">
                                {(["female", "male", "non-binary"] as const).map(g => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setCustomLeadGender(g)}
                                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border capitalize transition-all ${
                                      customLeadGender === g
                                        ? "bg-teal-500/20 text-teal-200 border-teal-500/50 font-bold"
                                        : "bg-[#0C1019] text-slate-400 border-white/10 hover:text-white"
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-slate-300 block mb-1">Appearance & Biometric Archetype</label>
                            <input
                              type="text"
                              value={customLeadArchetype}
                              onChange={(e) => setCustomLeadArchetype(e.target.value)}
                              placeholder="e.g. 28yo Danish architect, intense blue eyes, structured jawline, short blonde hair"
                              className="w-full bg-[#0C1019] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-medium text-slate-300 block mb-1">Wardrobe / Costume Style</label>
                              <input
                                type="text"
                                value={customLeadWardrobe}
                                onChange={(e) => setCustomLeadWardrobe(e.target.value)}
                                placeholder="e.g. Charcoal wool coat, black turtleneck"
                                className="w-full bg-[#0C1019] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-slate-300 block mb-1">Reference Portrait URL (Optional)</label>
                              <input
                                type="text"
                                value={customLeadImageUri}
                                onChange={(e) => setCustomLeadImageUri(e.target.value)}
                                placeholder="https://... or /assets/... (optional reference photo)"
                                className="w-full bg-[#0C1019] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-medium text-slate-300 block mb-1">Custom Physical Set / Location Environment</label>
                            <input
                              type="text"
                              value={customLocationDesc}
                              onChange={(e) => setCustomLocationDesc(e.target.value)}
                              placeholder="e.g. Glass-walled penthouse overlooking Copenhagen harbour at sunset with rain on glass"
                              className="w-full bg-[#0C1019] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
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
                                    <div className="w-11 h-11 rounded-lg bg-[#0C1019] overflow-hidden border border-white/10 shrink-0">
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
                                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{leadCharacter.archetype}</div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setShowCharacterLibraryModal(true)}
                                    className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
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
                                        <div className="text-[10px] text-slate-400">Denmark, France, UK, US, India...</div>
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
                                    <span className="text-[9px] text-slate-400">Quick pick:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        fetch("/api/library/characters/freja_moller_dk")
                                          .then(res => res.json())
                                          .then(data => data?.character && setLeadCharacter(data.character));
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 flex items-center gap-1"
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
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 flex items-center gap-1"
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
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 flex items-center gap-1"
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
                                                : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
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
                                      <div className="w-11 h-11 rounded-lg bg-[#0C1019] overflow-hidden border border-white/10 shrink-0">
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
                                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{supportingCharacter.archetype}</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowCharacterLibraryModal(true)}
                                      className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
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
                                          <div className="text-[10px] text-slate-400">Choose 2nd character</div>
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
                                      <span className="text-[9px] text-slate-400">Quick pick:</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          fetch("/api/library/characters/mikkel_lind_dk")
                                            .then(res => res.json())
                                            .then(data => data?.character && setSupportingCharacter(data.character));
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 flex items-center gap-1"
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
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 flex items-center gap-1"
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
                                                  : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
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
                              <div className="w-14 h-10 rounded-lg bg-[#0C1019] overflow-hidden border border-white/10 shrink-0">
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
                                <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
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
                                className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
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
                  <div className="mb-2 p-2.5 bg-[#080B11] border border-teal-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Reference Video / Public YouTube URL</span>
                        <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Deconstructs cinematography, lighting &amp; audio)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceUrl("");
                          setShowRefInput(false);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10"
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
                        className="flex-1 bg-[#05070A] border border-white/10 rounded-lg px-3 py-1.5 text-base md:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 min-h-[38px]"
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
                          <span className="text-[10px] font-mono text-slate-400">
                            Parent: {continuationParent.id.slice(0, 16)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate">
                          Directing Sequel to: <span className="text-teal-300">{continuationParent.title}</span>
                        </h4>
                        <p className="text-xs text-slate-300/80 mt-0.5 line-clamp-2">
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
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 shrink-0 transition flex items-center gap-1"
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
                    className="w-full bg-[#080B11] border border-white/5 rounded-xl p-3.5 sm:p-4 text-base md:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400/50 resize-none"
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
                  <span className="text-slate-400 shrink-0 text-[11px] font-medium">Try starter:</span>
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
                      className={`shrink-0 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300 text-[11px] transition-colors truncate max-w-[260px] ${
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
                    <div className="bg-[#0D111A] border border-white/10 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-teal-400" />
                          <h3 className="text-base font-bold text-white">Select a Reel to Direct Part 2</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowContinuationModal(false)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 mb-4">
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
                                    className="w-10 h-14 rounded-lg object-cover border border-white/10 shrink-0"
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
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
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
                              <img src={reel.posterUrl} alt={reel.title} className="w-10 h-14 rounded-lg object-cover border border-white/10 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
                                  {reel.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
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
                    <div className="bg-[#0D111A] border border-white/10 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
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
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
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
                    <div className="bg-[#0D111A] border border-white/10 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
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
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
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
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">
                        {activeTab === "youtube_shorts"
                          ? "~12–15m for 30-shot master."
                          : "~7m for 6-shot reel."}
                      </span>
                      <span className="text-slate-400 block text-[10px]">
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
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>
                    <strong className="text-slate-200">Labeled as AI, so platforms won&apos;t penalize you.</strong> Verified C2PA Content Credentials &amp; SynthID watermarks satisfy disclosure rules without reach throttling.
                  </span>
                </div>
              </div>

              {/* OMNI DIRECTOR'S TREATMENT DOSSIER CARD */}
              {treatment && (
                <div className="mt-6 w-full bg-[#0B0F19] border border-teal-500/40 rounded-2xl md:rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
                          <Clapperboard className="w-3.5 h-3.5" />
                          Omni Director Pre-Flight Treatment
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
                          Awaiting Approval
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px]">
                          {treatment.targetDurationSec}s • {treatment.shots.length} Takes • {treatment.aspectRatio}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px]">
                          {treatment.language}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {treatment.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 italic max-w-3xl">
                        &ldquo;{treatment.logline}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTreatment(null)}
                      className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
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
                      <span className="text-slate-400 text-[11px] sm:text-right">
                        Aesthetic: <span className="text-slate-200">{treatment.referenceAnalyzed.detectedAesthetic}</span>
                      </span>
                    </div>
                  )}

                  {/* Dossier Tabs */}
                  <div className="flex items-center gap-2 border-b border-white/10 mt-5 pb-2 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setTreatmentTab("screenplay")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
                        treatmentTab === "screenplay"
                          ? "bg-teal-500 text-[#07090E] shadow-sm shadow-teal-500/30"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
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
                          : "text-slate-400 hover:text-white hover:bg-white/5"
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
                          : "text-slate-400 hover:text-white hover:bg-white/5"
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
                            className="p-4 rounded-xl bg-[#070A11] border border-white/5 hover:border-teal-500/30 transition-all"
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
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  • {shot.cameraAndOptics.framing} ({shot.cameraAndOptics.lens})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {wordCount > 0 ? `${wordCount}w • budget safe` : "Visual take"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
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
                                      <span className="text-[10px] text-slate-400">Speaker: {shot.speaker || "None"}</span>
                                    </div>
                                    <p className="text-slate-200 italic font-serif text-sm">
                                      &ldquo;{shot.dialogueOrLyric || "(Instrumental beat / ambient foley)"}&rdquo;
                                    </p>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-cyan-300 font-semibold block mb-1">
                                      👁️ Facial Micro-Expression &amp; Eyeline
                                    </span>
                                    <p className="text-slate-300">{shot.facialExpression}</p>
                                  </div>
                                </div>

                                {/* Right Column: Body Language, Choreography & Spatial Blocking */}
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-amber-300 font-semibold block mb-1">
                                      💃 Body Language &amp; Choreography
                                    </span>
                                    <p className="text-slate-300">
                                      {shot.bodyLanguage} • {shot.choreography}
                                    </p>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                                    <span className="text-[11px] text-violet-300 font-semibold block mb-1">
                                      📐 Spatial Blocking &amp; Camera Motion
                                    </span>
                                    <p className="text-slate-300">
                                      {shot.spatialBlocking.depthPlanes} | Proximity: {shot.spatialBlocking.proximity} | Contact: {shot.spatialBlocking.contactPoints}
                                    </p>
                                    <p className="text-slate-400 text-[11px] mt-1">
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
                          className="p-4 rounded-xl bg-[#070A11] border border-white/5 space-y-3 text-xs"
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
                            <span className="text-[11px] text-slate-400 block font-medium mb-0.5">Biometric Archetype:</span>
                            <p className="text-slate-200">{c.archetypeSafeDescription}</p>
                            <div className="mt-1 text-[11px] text-slate-400">
                              {c.biometricDNA.ageBand} • {c.biometricDNA.hair} • {c.biometricDNA.facialFeatures}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-[11px] text-amber-300 font-semibold block">Wardrobe Progression:</span>
                            <div className="space-y-1 text-[11px]">
                              <div className="text-slate-300">
                                <strong className="text-slate-400">Act 1–2:</strong> {c.wardrobeProgression.act1_2.costume} ({c.wardrobeProgression.act1_2.accessories})
                              </div>
                              <div className="text-slate-300">
                                <strong className="text-slate-400">Act 3–4:</strong> {c.wardrobeProgression.act3_4.costume} ({c.wardrobeProgression.act3_4.accessories})
                              </div>
                              <div className="text-slate-300">
                                <strong className="text-slate-400">Act 5:</strong> {c.wardrobeProgression.act5.costume} ({c.wardrobeProgression.act5.accessories})
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
                      <div className="p-4 rounded-xl bg-[#070A11] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Music2 className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-bold text-white">Acoustic Score Bed</span>
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">
                            {treatment.musicScore.lufsTarget}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Genre / Mood:</span>
                            <span className="text-white font-medium">{treatment.musicScore.genre}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tempo &amp; Key:</span>
                            <span className="text-white font-medium">{treatment.musicScore.bpm} BPM • {treatment.musicScore.key} ({treatment.musicScore.meter})</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Lead Instruments:</span>
                          <span className="text-slate-200">{treatment.musicScore.instruments.join(", ")}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[11px]">Vocal Profile:</span>
                          <span className="text-slate-200">{treatment.musicScore.vocalProfile}</span>
                        </div>
                      </div>

                      {/* Color Script */}
                      <div className="p-4 rounded-xl bg-[#070A11] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                          <Palette className="w-4 h-4 text-teal-400" />
                          <span className="text-sm font-bold text-white">Directorial Color Script</span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          <div>
                            <strong className="text-teal-300 block">Act 1–2 (Exposition / Rise):</strong>
                            <p className="text-slate-300">{treatment.colorScript.act1_2}</p>
                          </div>
                          <div>
                            <strong className="text-amber-300 block">Act 3–4 (Climax / Dramatic Stakes):</strong>
                            <p className="text-slate-300">{treatment.colorScript.act3_4}</p>
                          </div>
                          <div>
                            <strong className="text-cyan-300 block">Act 5 (Resolution / Grand Finale):</strong>
                            <p className="text-slate-300">{treatment.colorScript.act5}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conversational Tweak with Omni Box */}
                  <div className="mt-5 p-4 rounded-xl bg-[#080C14] border border-white/10">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
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
                        className="flex-1 bg-[#05070A] border border-white/10 rounded-lg px-3 py-2 text-base md:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 min-h-[44px]"
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
                  <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

                    <span className="text-xs text-slate-400 text-center sm:text-right">
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
                <div className="mt-4 p-5 rounded-2xl bg-[#0E1522] border border-teal-500/40 shadow-xl text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="font-bold text-white text-base">Production Successfully Queued!</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-mono font-semibold">
                      ID: {generatedResult.productionId?.slice(0, 16) || "studio1"}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-3">
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
                      className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: THE LIVE PRODUCTION MONITOR (50% width, matching exact container card) */}
            <div className="flex flex-col h-full">
              {/* MATCHING PRODUCTION MONITOR CONTAINER CARD */}
              <div
                id="monitor-card"
                className={`w-full h-full bg-[#0E121B] border rounded-2xl md:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/60 relative flex flex-col justify-between transition-all ${
                  activeTab === "youtube_shorts"
                    ? "border-amber-500/20 hover:border-amber-500/40"
                    : "border-white/10 hover:border-teal-500/30"
                }`}
              >
                {activeTab === "instagram_tiktok" ? (
                  /* Instagram / TikTok Mode 1 Monitor Content */
                  <>
                    {/* Monitor Card Top Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span className="font-bold text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                          Live Production Monitor
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-[10px] font-semibold">
                          9:16 Vertical
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                          1080×1920 (4K Upscaled)
                        </span>
                      </div>
                    </div>

                    {/* Monitor Card Body: iPhone 17 Pro Max Flagship Frame + Sample Productions side-by-side */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-3.5 flex-1 py-1">
                      {/* iPhone 17 Pro Max Flagship Chassis (6.9" display, 19.5:9 ratio, titanium frame, Dynamic Island) */}
                      <div className="relative w-[230px] sm:w-[245px] md:w-[255px] shrink-0 aspect-[9/19.5] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-[42px] p-2.5 shadow-2xl shadow-teal-500/20 border-[3.5px] border-slate-600/80 ring-1 ring-white/20 flex flex-col justify-between overflow-hidden group">
                        {/* Dynamic Island pill with camera & sensor */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full z-30 pointer-events-none border border-white/10 flex items-center justify-between px-2.5 shadow-md">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#111622] border border-blue-400/30 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-blue-400/80 animate-pulse" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#0d1017] border border-white/10" />
                        </div>

                        {/* THE 19.5:9 FLAGSHIP VIDEO ELEMENT */}
                        <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-slate-950">
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

                          {/* Top Badges Overlay (below Dynamic Island) */}
                          <div className="absolute top-8 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span>{activeReel.shots} Shots • {activeReel.durationSec}s</span>
                            </span>

                            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/90 backdrop-blur-md text-[#07090E] text-[8px] font-black uppercase tracking-wider">
                              Zero Drift
                            </span>
                          </div>

                          {/* Controls overlay: Mute & Play toggles */}
                          <div className="absolute top-8 right-2.5 z-30 flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={toggleMute}
                              className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                              title={isMuted ? "Unmute Audio" : "Mute Audio"}
                            >
                              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-teal-400" />}
                            </button>

                            <button
                              type="button"
                              onClick={togglePlay}
                              className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                              title={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5 text-teal-400" />}
                            </button>
                          </div>

                          {/* Bottom Info Bar inside Reel */}
                          <div className="absolute bottom-3 inset-x-0 p-2.5 pt-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400">
                              {activeReel.category}
                            </span>
                            <h3 className="text-xs font-bold text-white leading-tight drop-shadow-md truncate">
                              {activeReel.title}
                            </h3>
                            <p className="text-[9px] text-slate-300 mt-0.5 line-clamp-1 leading-snug">
                              {activeReel.prompt}
                            </p>

                            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400">
                              <span className="flex items-center gap-0.5 text-teal-300 font-medium">
                                <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                                Single continuous take
                              </span>
                              <span>9:19.5 Flagship</span>
                            </div>
                          </div>
                        </div>

                        {/* iOS Bottom Home Indicator Bar */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full z-30 pointer-events-none shadow-sm" />
                      </div>

                      {/* Companion Side Column: Sample Productions Grid */}
                      <div className="flex-1 flex flex-col justify-between w-full h-full min-h-0">
                        {/* Switch active reel filmstrip cards */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-0.5 text-xs text-slate-400">
                            <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <Film className="w-3 h-3" /> Sample Productions
                            </span>
                            <span className="text-[9px] text-slate-400">Tap to load</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {FINISHED_REELS.map((reel, idx) => (
                              <button
                                key={reel.id}
                                type="button"
                                onClick={() => setActiveReelIndex(idx)}
                                className={`relative aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all group ${
                                  activeReelIndex === idx
                                    ? "border-teal-400 shadow-md shadow-teal-500/30 scale-[1.02] z-10"
                                    : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                                }`}
                                title={reel.title}
                              >
                                <img src={reel.posterUrl} alt={reel.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-1 inset-x-1 flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-white truncate text-left">
                                    {reel.title}
                                  </span>
                                  <span className="text-[8px] font-mono text-teal-300 shrink-0 bg-black/50 px-1 rounded">
                                    {reel.durationSec}s
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Active Reel Production Telemetry Strip */}
                        <div className="mt-2 p-2 rounded-xl bg-[#0A0E17] border border-teal-500/20 flex items-center justify-between text-[10px] text-slate-300">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
                            <span className="font-semibold text-white truncate max-w-[150px]">{activeReel.title}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[9px] text-teal-300 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{activeReel.shots} Takes</span>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{activeReel.durationSec}s</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monitor Card Bottom Footer */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>
                        <strong className="text-slate-200">Biometric Identity Continuity Certified.</strong> Facial geometry, bone anchors &amp; physical wardrobe lock 100% across all cuts.
                      </span>
                    </div>
                  </>
                ) : (
                  /* YouTube / Cinema Mode 2 Monitor Content */
                  <>
                    {/* Monitor Card Top Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-bold text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                          Cinema Master Monitor
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-semibold">
                          2.39:1 Anamorphic
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                          30 Takes • 180s Total
                        </span>
                      </div>
                    </div>

                    {/* Monitor Card Body: 2.39:1 Player + 5 Acts Scrubber + Side-by-Side Cards */}
                    <div className="flex flex-col gap-2 flex-1 justify-between py-1">
                      {/* Widescreen 2.39:1 Video Container */}
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
                          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[9px] font-bold text-white flex items-center gap-1">
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
                            className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
                            title={isMuted ? "Unmute Audio" : "Mute Audio"}
                          >
                            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={togglePlay}
                            className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-lg min-h-[28px]"
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
                            <span className="text-[9px] text-slate-300 truncate max-w-[260px]">
                              {activeCinema.subtitle}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md truncate">
                            {activeCinema.title}
                          </h3>
                        </div>
                      </div>

                      {/* 5 ACTS TIME JUMP SCRUBBER */}
                      <div className="bg-[#0C1019] rounded-xl p-1.5 border border-amber-500/20 shadow-md flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs px-1 text-slate-400 font-medium">
                          <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 text-[10px]">
                            <Clapperboard className="w-3 h-3 text-amber-400" />
                            Jump to Act:
                          </span>
                          <span className="text-[9px] text-slate-500">Interactive Timeline</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
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
                              className="px-1 py-0.5 rounded-lg bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/5 text-slate-300 hover:text-amber-200 transition-all text-center flex flex-col items-center min-h-[30px] justify-center"
                            >
                              <span className="text-amber-400 font-bold text-[10px]">Act {item.act}</span>
                              <span className="text-[8px] text-slate-400">{item.timecode}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Side-by-Side: Score Bed & Classical 5-Act Narrative Arc */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Master Symphonic Score Bed Card */}
                        <div className="p-2 rounded-xl bg-[#0A0E17] border border-amber-500/20 text-xs text-slate-300 flex items-start gap-2 shadow-md">
                          <Music2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-300 block font-semibold text-[10px] uppercase tracking-wider">Master Symphonic Bed (-24.0 LUFS):</strong>
                            <span className="text-slate-300 text-[10px] block mt-0.5 leading-snug">{activeCinema.scoreTitle}</span>
                          </div>
                        </div>

                        {/* Classical 5-Act Breakdown */}
                        <div className="p-2 rounded-xl bg-[#080B11] border border-white/10 text-xs shadow-md overflow-hidden">
                          <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold border-b border-white/5 pb-1 mb-1">
                            <span className="flex items-center gap-1">
                              <Clapperboard className="w-3 h-3 text-amber-400" />
                              Classical 5-Act Narrative Arc
                            </span>
                            <span className="text-slate-400 font-mono text-[9px]">30 Takes • 180s</span>
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
                    </div>

                    {/* Monitor Card Bottom Footer */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong className="text-slate-200">Theatrical Master Certified.</strong> 5-act classical drama, Cooke 2.39:1 anamorphic optics &amp; EBU R128 master acoustic bed.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* THREE CREATOR PROMISES ROW (FULL-WIDTH 12 COLS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5">
            {activeTab === "instagram_tiktok" ? (
              <>
                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-teal-500/20 shadow-lg flex items-start gap-3.5 hover:border-teal-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Zero Face Drift</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Continuous scene extension keeps character facial identity 100% locked across all cuts.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-cyan-500/20 shadow-lg flex items-start gap-3.5 hover:border-cyan-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">~7 Minute Turnaround</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Honest wait times stated upfront. Render in background with immediate completion alerts.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-emerald-500/20 shadow-lg flex items-start gap-3.5 hover:border-emerald-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Platform-Safe AI</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Compliant C2PA metadata &amp; SynthID watermarks safeguard account reach on TikTok &amp; IG.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-amber-500/20 shadow-lg flex items-start gap-3.5 hover:border-amber-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Clapperboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Classical 5-Act Drama</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Prologue, inciting incident, crisis, climax &amp; resolution structured across 30 unbroken takes.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-orange-500/20 shadow-lg flex items-start gap-3.5 hover:border-orange-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Cooke Anamorphic 2.39:1</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Authentic 24fps motion cadence, anamorphic lens falloff, flares &amp; ACES 1.3 color grading.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0A0E17]/80 border border-yellow-500/20 shadow-lg flex items-start gap-3.5 hover:border-yellow-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0 text-yellow-400">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Symphonic -24.0 LUFS</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Continuous orchestral score (Beethoven Op. 92) mixed to broadcast EBU R128 standards.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3. BELOW THE FOLD: FINISHED PRODUCTION OUTPUTS SHOWCASE */}
      <section id="showcase" className="py-16 md:py-24 border-b border-white/5 bg-[#090D15]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Film className="w-3.5 h-3.5" />
              <span>Real Production Outputs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Finished productions. Ready to broadcast.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Every production below was planned, anchored, and synthesized end-to-end as a single unbroken sequence with synchronized audio.
            </p>

            {/* Showcase tab selector */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowcaseTab("instagram_tiktok")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                  showcaseTab === "instagram_tiktok"
                    ? "bg-teal-500 text-[#07090E] shadow-md shadow-teal-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>📱 Instagram / TikTok (9:16)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowcaseTab("youtube_shorts")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                  showcaseTab === "youtube_shorts"
                    ? "bg-amber-400 text-[#07090E] shadow-md shadow-amber-400/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🎬 YouTube / 180s Cinema (2.39:1)</span>
              </button>
            </div>
          </div>

          {showcaseTab === "instagram_tiktok" ? (
            /* 4 REELS RESPONSIVE GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {FINISHED_REELS.map((reel, index) => {
                const isSelected = activeReelIndex === index && activeTab === "instagram_tiktok";
                return (
                  <div
                    key={reel.id}
                    className={`bg-[#0E121B] rounded-2xl border transition-all overflow-hidden flex flex-col group ${
                      isSelected
                        ? "border-teal-500 ring-2 ring-teal-500/30 shadow-xl shadow-teal-500/10"
                        : "border-white/10 hover:border-white/25 hover:shadow-xl"
                    }`}
                  >
                    {/* Reel 9:16 Video Container */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden">
                      <video
                        src={reel.videoUrl}
                        poster={reel.posterUrl}
                        playsInline
                        muted
                        loop
                        autoPlay
                        preload="auto"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top overlay badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                          {reel.shots} Shots • {reel.durationSec}s
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/90 text-[#07090E] text-[10px] font-black uppercase">
                          9:16
                        </span>
                      </div>

                      {/* Bottom CTA to load into main player */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("instagram_tiktok");
                            setActiveReelIndex(index);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#07090E] font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Watch in Main Player</span>
                        </button>
                      </div>
                    </div>

                    {/* Reel Metadata */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wide">
                            {reel.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                          {reel.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {reel.prompt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2.5">
                        <div className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{reel.continuityProof}</span>
                        </div>
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
                            setPromptText(`Act II: Continuation of "${reel.title}". The sequence continues seamlessly with the same character, wardrobe, and visual aesthetic: `);
                            setActiveTab("instagram_tiktok");
                            setSelectedAspectRatio("9:16");
                            setTimeout(() => {
                              const el = document.getElementById("continuation-active-banner") || document.getElementById("prompt-studio-box");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-400 text-teal-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                          title="Direct Part 2 continuation with the exact same character, wardrobe, and theme"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          <span>Direct Part 2 (Continuation)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 180s CINEMA THEATRICAL MASTER SHOWCASE */
            <div className="flex flex-col gap-8">
              {CINEMA_FINISHED_REELS.map(cinema => (
                <div
                  key={cinema.id}
                  className="bg-[#0E121B] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl p-6 sm:p-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* 16:9 / 2.39:1 Video Container */}
                    <div className="lg:col-span-7">
                      <div className="relative aspect-[16/9] bg-black rounded-2xl overflow-hidden border border-white/10 group">
                        <video
                          src={cinema.videoUrl}
                          poster={cinema.posterUrl}
                          playsInline
                          muted
                          loop
                          autoPlay
                          preload="auto"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-xs font-bold text-white">
                            30 Shots • 180s Master
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-amber-400 text-[#07090E] text-xs font-black uppercase">
                            2.39:1 Anamorphic
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("youtube_shorts");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#07090E] font-black text-sm flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all"
                          >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Load in Cinema Director</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Info Column */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                            {cinema.category}
                          </span>
                          <span className="text-xs text-slate-400">• Classical 5-Act Drama</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                          {cinema.title}
                        </h3>
                        <p className="text-sm font-semibold text-amber-300/90 mt-1">
                          {cinema.subtitle}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                          {cinema.prompt}
                        </p>

                        <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3 text-xs">
                          <Music2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block font-semibold">Master Symphonic Bed:</strong>
                            <span className="text-slate-300">{cinema.scoreTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                        {cinema.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-[11px] font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5 Classical Acts Cards Grid */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-amber-400" />
                      <span>5 Classical Acts Dramatic Breakdown:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {cinema.acts.map((act) => (
                        <div
                          key={act.act}
                          className="p-3.5 rounded-xl bg-black/50 border border-white/5 hover:border-amber-400/30 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-1">
                              <span>Act {act.act}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{act.timecode}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white leading-snug">
                              {act.title}
                            </h5>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">
                            {act.theme}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE CORE DIFFERENTIATOR: SINGLE UNBROKEN TAKE VS STITCHED CLIPS */}
      <section id="differentiator" className="py-16 md:py-24 border-b border-white/5 bg-[#07090E]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>The Zyvoriq Difference</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Why other AI video tools look like disjointed slides.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Most generators create random 3-second clips and stitch them into a timeline. When faces morph every cut, viewers scroll away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard AI Generators */}
            <div className="bg-[#0B0E17] rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Other AI Video Generators</h3>
                  <span className="text-xs text-rose-300">Stitched multi-prompt clips</span>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Character Face Morphs:</strong> Each cut prompts a brand-new face. Your protagonist looks like 6 different people.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Jarring Disconnects:</strong> Lighting, wardrobe, and physics violently jump between cuts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Hidden Wait Times:</strong> Cryptic 11-phase spinners with zero ETA leave you guessing when renders finish.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span><strong>Platform Penalties:</strong> Unlabeled synthetic media gets flagged and throttled by TikTok and Instagram recommendation engines.</span>
                </li>
              </ul>
            </div>

            {/* Zyvoriq Unbroken Sequence */}
            <div className="bg-[#0E1522] rounded-3xl p-6 sm:p-8 border-2 border-teal-500/50 shadow-2xl shadow-teal-500/10 relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-teal-500 text-[#07090E] font-black text-xs uppercase tracking-wider">
                Zyvoriq Advantage
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Zyvoriq Unbroken Scene Extension</h3>
                  <span className="text-xs text-teal-300">Continuous single-take camera choreography</span>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>100% Biometric Lock:</strong> Shot 1 anchors character DNA. Every subsequent shot extends the same 3D coordinates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Single Unbroken Take:</strong> Fluid camera motion vectors carry momentum, wind, and fabric across cuts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Honest ~7-Minute ETA:</strong> Exact queue timing stated upfront. Close the tab and get notified when ready.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Safe to Post:</strong> Built-in C2PA Content Credentials &amp; SynthID watermarks safeguard account reach.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-16 md:py-24 border-b border-white/5 bg-[#090D15]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Plans built for publishing velocity.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mt-3">
              Pay for finished, platform-ready reels with zero surprise credit fees.
            </p>

            {/* Monthly / Annual billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs sm:text-sm font-semibold ${!annualBilling ? "text-white" : "text-slate-400"}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-12 h-6 rounded-full bg-white/10 p-1 relative transition-colors focus:outline-none"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-teal-400 transition-transform ${
                    annualBilling ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${annualBilling ? "text-white" : "text-slate-400"}`}>
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* 3 PRICING TIERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* TIER 1: CREATOR */}
            <div className="bg-[#0E121B] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Starter Creator</h3>
                <p className="text-xs text-slate-400 mt-1">For independent creators posting 2–3 viral reels per week.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "23" : "29"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>15 finished 9:16 reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 6 shots (~30s) per reel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>1080p vertical export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>~7 min background rendering</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>C2PA &amp; SynthID compliance badge</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm text-center block transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Start with Starter
                </a>
              </div>
            </div>

            {/* TIER 2: PRO PUBLISHER (FEATURED) */}
            <div className="bg-[#0E1522] rounded-3xl p-6 sm:p-8 border-2 border-teal-500 shadow-2xl shadow-teal-500/20 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-teal-500 text-[#07090E] font-black text-xs uppercase tracking-wider">
                Most Popular
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Pro Publisher</h3>
                <p className="text-xs text-slate-400 mt-1">For serious creators and brand channels posting daily.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "63" : "79"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>50 finished 9:16 reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 9 shots (~45s) unbroken takes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>720p HD vertical export (720x1280)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Priority fast queue (~5 min render)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom facial anchor upload</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>1-click export to TikTok &amp; Instagram</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#07090E] font-black text-sm text-center block shadow-lg shadow-teal-500/25 transition-all min-h-[44px] flex items-center justify-center"
                >
                  Get Pro Publisher
                </a>
              </div>
            </div>

            {/* TIER 3: AGENCY */}
            <div className="bg-[#0E121B] rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Agency &amp; Studio</h3>
                <p className="text-xs text-slate-400 mt-1">For multi-creator agencies and enterprise production houses.</p>
                
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    ${annualBilling ? "159" : "199"}
                  </span>
                  <span className="text-slate-400 text-xs ml-1.5">/ month</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>150 finished reels</strong> / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Multi-seat collaboration (5 creators)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom voice cloning &amp; audio track sync</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dedicated background worker queue</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Full commercial rights &amp; API access</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="#prompt-bar"
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm text-center block transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Contact Agency Sales
                </a>
              </div>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Cancel anytime with 1 click
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Full commercial usage rights included
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Platform-safe C2PA &amp; SynthID disclosure
            </span>
          </div>
        </div>
      </section>

      {/* 6. CLEAN CREATOR FOOTER */}
      <footer className="py-12 bg-[#05070A] border-t border-white/5 text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm">
              Z
            </div>
            <span className="font-bold text-white tracking-tight">ZYVORIQ</span>
            <span className="text-slate-400">• Single Unbroken Take AI Video Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#differentiator" className="hover:text-white transition-colors">Differentiator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/my-reels" className="hover:text-white transition-colors">My Reels</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>

          <div className="text-slate-400 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Zyvoriq. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
