"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  InlineClipTrimmer,
  MultiClipSplicerWorkbench,
  QueuedSpliceSegment,
} from "@/components/InstantSubClipSplicer";
import {
  M3_TONAL_SCHEMES,
  M3TonalScheme,
  getM3CssVariables,
} from "@/lib/m3TonalSchemes";

interface IndividualReel {
  id: string;
  partIndex: 1 | 2;
  label: string;
  sublabel: string;
  rawSeconds: number;
  src: string;
}

interface TrendingIdea {
  id: string;
  badge: string;
  title: string;
  genre: string;
  bpm: number;
  durationSec?: number;
  tagline: string;
  act1Wardrobe: string;
  act1Location: string;
  act1Prompt: string;
  act2Wardrobe: string;
  act2Location: string;
  act2Prompt: string;
}

interface SwarmJobResponse {
  id: string;
  title: string;
  genre?: string;
  bpm?: number;
  act1Prompt?: string;
  act2Prompt?: string;
  selectedCharacterId?: string;
  selectedCharacterName?: string;
  selectedLocationId?: string;
  selectedLocationName?: string;
  status: "queued" | "running" | "completed" | "error";
  progress: number;
  stageLabel: string;
  part1Src?: string;
  part2Src?: string;
  act1Src?: string;
  act2Src?: string;
  combinedSrc: string;
  logs: string[];
}

interface CharacterOption {
  id: string;
  displayName: string;
  archetype: string;
  country?: string;
  validationStatus?: string;
}

interface LocationOption {
  id: string;
  displayName: string;
  era?: string;
  timeOfDay?: string;
}

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "South Korea",
  "UAE (Dubai)",
  "Canada",
  "Spain",
  "Brazil",
  "Japan",
  "Nigeria",
  "France",
  "Australia",
];

const LANGUAGES = [
  "Hindi",
  "Punjabi",
  "English",
  "Hinglish (Hindi + English)",
  "Spanish",
  "Korean (K-Pop)",
  "Tamil",
  "Telugu",
  "Arabic",
  "French",
  "Portuguese",
];

const CHARACTER_FORMATIONS = [
  "Lead Heroine + 4 Girls Troupe (5 Performers)",
  "Romantic Lead Couple + 6 Backup Dancers",
  "Dual Female Lead Duo + 6 Couture Ensemble",
  "Solo Pop Superstar Icon + 8 Stage Dancers",
  "5-Member Global Girl Group Formation",
  "Lead Male Star + 6 Urban Street Crew",
  "Royal Palace Classical Ensemble (7 Dancers)",
];

const EXHAUSTIVE_ATTIRES_ACT1 = [
  "Sabyasachi Royal Velvet & Zari Couture Lehenga",
  "Manish Malhotra Sequin Champagne-Gold Saree Gown",
  "Crimson-Rose Silk Mirror-Work Anarkali Couture",
  "Pastel Ivory & Emerald Polki Bridal Resort Wear",
  "Cyber-Couture Holographic Chrome Bodysuit & Cape",
  "Mediterranean Linen & Gold-Chain Resort Co-ord Set",
  "High-Street Oversized Bomber & Crystal Cargo Set",
  "Avant-Garde Sculpted Corset & Silk Palazzo Ensemble",
  "Traditional Phulkari & Mirror-Embroidered Punjabi Suit",
  "Parisian Runway Feather-Trimmed Cocktail Mini Dress",
];

const EXHAUSTIVE_WARDROBES_ACT2 = [
  "Royal Emerald-Sapphire & Silver Crystal Evening Couture",
  "Midnight Obsidian Swarovski-Encrusted Cocktail Gown",
  "Liquid Gold Metallic Draped Goddess Silhouette",
  "Ruby Red Silk Satin Slit Gown with Diamond Choker",
  "Electric Cobalt Blue Fringe Stage Performance Suit",
  "Neon Magenta & Carbon-Fiber Futuristic Clubwear",
  "Pearl-White Silk Organza Cape Gown with Tiara",
  "Burgundy Velvet Tuxedo-Dress with Gold Epaulettes",
  "Iridescent Opal Sequin Mermaid Evening Gown",
  "Custom Hand-Beaded Indo-Western Dhoti Skirt & Bustier",
];

const DEMOGRAPHIES = [
  "Gen-Z Youth (18–24)",
  "Young Millennials (25–34)",
  "Global South Asian Diaspora (18–35)",
  "Affluent Luxury & Fashion Enthusiasts (22–45)",
  "Teen & College Dance Creators (16–22)",
  "Pan-India Metro & Tier-1 Audience (18–40)",
  "Global Pop & Crossover Music Fans (16–35)",
];

const TARGET_AUDIENCES = [
  "Dance Challenge & Hook-Step Creators",
  "Luxury Fashion & Couture Lovers",
  "Bollywood & Desi Pop Chart Followers",
  "High-Energy Club & Festival Goers",
  "Wedding Sangeet & Celebration Curators",
  "Music Video Visual & Cinematography Buffs",
  "Global Viral Short-Form Consumers",
];

const SOCIAL_PLATFORMS = [
  "Instagram Reels (9:16 • 60s Master)",
  "YouTube Shorts & 4K Music Video",
  "TikTok Global Viral Feed (9:16)",
  "Spotify Canvas & Apple Music Video",
  "Snapchat Spotlight & Creator Stories",
  "X (Twitter) & Threads Premiere Cut",
];

const PIPELINE_STEPS = [
  { id: 1, label: "Turn 1A (10s)", threshold: 15 },
  { id: 2, label: "Turn 1B (20s)", threshold: 35 },
  { id: 3, label: "Face Identity Lock", threshold: 50 },
  { id: 4, label: "Turn 2A (10s)", threshold: 70 },
  { id: 5, label: "Turn 2B (20s)", threshold: 90 },
  { id: 6, label: "60s Master Reel", threshold: 100 },
];

const INITIAL_TRENDING_IDEAS: TrendingIdea[] = [
  {
    id: "idea_bollywood_master_b_v2",
    badge: "🔥 #1 INDIA • BOLLYWOOD SUPERHIT",
    title: "Ishq Tera Electric — Sunlit Villa to Twilight Superyacht",
    genre: "Modern Bollywood Dance-Pop",
    bpm: 118,
    durationSec: 60,
    tagline:
      "Lead heroine + 4 dancers across a cliffside pool villa (Act I) and a twilight superyacht deck (Act II) with strict face-identity lock.",
    act1Wardrobe: "Crimson-Rose & Champagne-Gold Couture Lehenga",
    act1Location: "Sunlit Cliffside Infinity Pool Villa Terrace",
    act1Prompt:
      "High-budget 4K Bollywood theatrical music video shot on 35mm anamorphic cinema lens at a sunlit luxury cliffside infinity pool villa terrace. A charismatic 23-year-old Bollywood lead heroine stands center-frame in crimson-rose and champagne-gold couture lehenga singing expressively while 4 coordinated female background dancers in turquoise-gold ensembles perform crisp mudras behind her.",
    act2Wardrobe: "Royal Emerald-Sapphire & Silver Crystal Evening Couture",
    act2Location: "Twilight Candlelit Luxury Superyacht Deck",
    act2Prompt:
      "MANDATORY FACIAL IDENTITY LOCK: exact same 23-year-old Bollywood lead heroine face identity from Act I, now wearing a royal emerald-sapphire and silver crystal evening couture gown on a candlelit luxury superyacht deck at blue-hour twilight with 4 background dancers.",
  },
  {
    id: "idea_punjabi_monaco_penthouse",
    badge: "⚡ #2 VIRAL • PUNJABI AFRO-POP",
    title: "Diamond Koka — Monaco Rooftop Penthouse to Private Jet Tarmac",
    genre: "Punjabi Afro-Trap Club Anthem",
    bpm: 106,
    durationSec: 60,
    tagline:
      "Golden-hour Monaco penthouse terrace (Act I) cutting to a rain-slicked midnight private jet runway with supercars (Act II).",
    act1Wardrobe: "Ivory-Gold Embellished Corset Saree & Oversized Shades",
    act1Location: "Monaco Marble Penthouse Terrace Overlooking Harbor",
    act1Prompt:
      "Ultra-cinematic 4K Punjabi pop music video on a sunlit Monaco marble penthouse terrace overlooking superyachts. Lead female vocalist in an ivory-gold embellished corset saree performs sleek urban choreography with 4 dancers in pastel silk coordinates.",
    act2Wardrobe: "Midnight Obsidian Swarovski Bodysuit & Velvet Cape",
    act2Location: "Midnight Private Gulfstream Jet Tarmac & Neon Runway",
    act2Prompt:
      "MANDATORY FACIAL IDENTITY LOCK: exact same lead female vocalist face identity from Act I, now dressed in a midnight obsidian Swarovski crystal bodysuit on a rain-slicked private jet tarmac at night flanked by matte-black supercars and 4 dancers.",
  },
  {
    id: "idea_kpop_cyber_seoul",
    badge: "💎 #3 GLOBAL • K-POP / HYPER-POP",
    title: "Supernova Crush — Seoul Hologram Atrium to Tokyo Sky-Deck",
    genre: "High-Octane Electro K-Pop",
    bpm: 126,
    durationSec: 60,
    tagline:
      "Precision knife-edge formation dance inside a neon Seoul glass atrium (Act I) cutting to a 70th-floor Tokyo helipad at dusk (Act II).",
    act1Wardrobe: "Holographic Chrome & White Leather Street-Couture",
    act1Location: "Futuristic Seoul Glass & LED Architectural Atrium",
    act1Prompt:
      "High-energy 4K K-pop music video inside a futuristic Seoul glass atrium with volumetric cyan-magenta lighting. Lead center idol and 4 group members in holographic chrome and white leather street-couture execute sharp synchronized choreography.",
    act2Wardrobe: "Ruby-Red Velvet & Silver Chain Stage Uniform",
    act2Location: "70th-Floor Tokyo Skyscraper Helipad at Sunset",
    act2Prompt:
      "MANDATORY FACIAL IDENTITY LOCK: exact same lead center idol face identity from Act I, now wearing a ruby-red velvet and silver chain stage uniform on a 70th-floor Tokyo skyscraper helipad at sunset with sweeping drone orbits.",
  },
];

const DEFAULT_SEGMENTS: IndividualReel[] = [
  {
    id: "act1_pool_villa_30s",
    partIndex: 1,
    label: "Act I — Sunlit Cliffside Pool Villa (00:00–00:30)",
    sublabel: "Crimson-Rose & Champagne-Gold Couture • Turn 1A (10s) + Turn 1B (20s)",
    rawSeconds: 30.0,
    src: "/assets/swarm/masterB_v2/act1_pool_villa_30s.mp4",
  },
  {
    id: "act2_superyacht_deck_30s",
    partIndex: 2,
    label: "Act II — Twilight Superyacht Deck (00:30–01:00)",
    sublabel: "Royal Emerald-Sapphire Couture • Same Lead Face Identity Anchor",
    rawSeconds: 30.0,
    src: "/assets/swarm/masterB_v2/act2_superyacht_deck_30s.mp4",
  },
];

function formatSMPTE(sec: number): string {
  const clamped = Math.max(0, sec);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const frames = Math.floor((clamped % 1) * 24);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(
    frames
  ).padStart(2, "0")}`;
}

export default function SwarmStudioM3Page() {
  // GOOGLE MATERIAL DESIGN 3 (M3) DYNAMIC TONAL COLOR SCHEME STATE
  const [schemeId, setSchemeId] = useState<string>("daylight_studio");
  const activeScheme: M3TonalScheme = useMemo(
    () => M3_TONAL_SCHEMES.find((s) => s.id === schemeId) || M3_TONAL_SCHEMES[0],
    [schemeId]
  );

  // Clean New Reel Creation Canvas by default; only show Step 3 if launched or editing existing
  const [hasActiveReelLoaded, setHasActiveReelLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit")) {
        setHasActiveReelLoaded(true);
      }
    }
  }, []);

  // Active Production & Video Sources
  const [projectTitle, setProjectTitle] = useState<string>(
    "Ishq Tera Electric — Bollywood 2-Act Superhit"
  );
  const [combinedSrc, setCombinedSrc] = useState<string>(
    "/assets/swarm/masterB_v2/masterB_v2_combined_60s.mp4"
  );
  const [segments, setSegments] = useState<IndividualReel[]>(DEFAULT_SEGMENTS);

  // Step 1 Exhaustive Input Parameters
  const [trendCountry, setTrendCountry] = useState<string>("India");
  const [trendLanguage, setTrendLanguage] = useState<string>("Hindi");
  const [trendCharacters, setTrendCharacters] = useState<string>(
    CHARACTER_FORMATIONS[0]
  );
  const [trendDurationSec, setTrendDurationSec] = useState<number>(60);
  const [trendAttire, setTrendAttire] = useState<string>(EXHAUSTIVE_ATTIRES_ACT1[1]);
  const [trendWardrobe, setTrendWardrobe] = useState<string>(
    EXHAUSTIVE_WARDROBES_ACT2[0]
  );
  const [trendDemography, setTrendDemography] = useState<string>(DEMOGRAPHIES[2]);
  const [trendAudience, setTrendAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [trendPlatform, setTrendPlatform] = useState<string>(SOCIAL_PLATFORMS[0]);

  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>(
    INITIAL_TRENDING_IDEAS
  );
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(
    INITIAL_TRENDING_IDEAS[0].id
  );
  const [showScriptEditor, setShowScriptEditor] = useState<boolean>(true);
  const [showChildReelsDrawer, setShowChildReelsDrawer] = useState<boolean>(false);
  const [showSplicerStudio, setShowSplicerStudio] = useState<boolean>(false);
  const [splicerTabIndex, setSplicerTabIndex] = useState<number>(0);
  const [spliceQueue, setSpliceQueue] = useState<QueuedSpliceSegment[]>([]);

  // Draft Script State
  const [draftTitle, setDraftTitle] = useState<string>(INITIAL_TRENDING_IDEAS[0].title);
  const [draftGenre, setDraftGenre] = useState<string>(INITIAL_TRENDING_IDEAS[0].genre);
  const [draftBpm, setDraftBpm] = useState<number>(INITIAL_TRENDING_IDEAS[0].bpm);
  const [draftAct1Prompt, setDraftAct1Prompt] = useState<string>(
    INITIAL_TRENDING_IDEAS[0].act1Prompt
  );
  const [draftAct2Prompt, setDraftAct2Prompt] = useState<string>(
    INITIAL_TRENDING_IDEAS[0].act2Prompt
  );
  const [promptsSyncedBadge, setPromptsSyncedBadge] = useState<boolean>(true);
  const [activeJob, setActiveJob] = useState<SwarmJobResponse | null>(null);
  const [availableCharacters, setAvailableCharacters] = useState<CharacterOption[]>([]);
  const [availableLocations, setAvailableLocations] = useState<LocationOption[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [assetLoading, setAssetLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/library/characters").then((r) => (r.ok ? r.json() : { characters: [] })),
      fetch("/api/library/locations").then((r) => (r.ok ? r.json() : { locations: [] })),
    ])
      .then(([charData, locationData]) => {
        if (!alive) return;
        setAvailableCharacters(Array.isArray(charData?.characters) ? charData.characters : []);
        setAvailableLocations(Array.isArray(locationData?.locations) ? locationData.locations : []);
      })
      .finally(() => {
        if (alive) setAssetLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    const characterId = params.get("character");
    const locationId = params.get("location");
    if (characterId) setSelectedCharacterId(characterId);
    if (locationId) setSelectedLocationId(locationId);
    if (!projectId) return;

    fetch(`/api/swarm/jobs?id=${encodeURIComponent(projectId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const job = data?.job as SwarmJobResponse | undefined;
        if (!job) return;
        setActiveJob(job);
        setHasActiveReelLoaded(true);
        setProjectTitle(job.title);
        setDraftTitle(job.title);
        if (job.genre) setDraftGenre(job.genre);
        if (typeof job.bpm === "number") setDraftBpm(job.bpm);
        if (job.act1Prompt) setDraftAct1Prompt(job.act1Prompt);
        if (job.act2Prompt) setDraftAct2Prompt(job.act2Prompt);
        if (job.selectedCharacterId) setSelectedCharacterId(job.selectedCharacterId);
        if (job.selectedLocationId) setSelectedLocationId(job.selectedLocationId);
        if (job.combinedSrc) setCombinedSrc(job.combinedSrc);
        const p1 = job.act1Src || job.part1Src;
        const p2 = job.act2Src || job.part2Src;
        if (p1 && p2) {
          setSegments([
            { ...DEFAULT_SEGMENTS[0], src: p1 },
            { ...DEFAULT_SEGMENTS[1], src: p2 },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  // Per-Act Speed Multipliers (0.01x steps)
  const [part1Speed, setPart1Speed] = useState<number>(1.0);
  const [part2Speed, setPart2Speed] = useState<number>(1.0);

  // QuickTime Pro Transforms & Transport State
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [preservesPitch, setPreservesPitch] = useState<boolean>(true);
  const [loopPlayback, setLoopPlayback] = useState<boolean>(true);
  const [selectedActIndex, setSelectedActIndex] = useState<1 | 2>(1);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [combinedTime, setCombinedTime] = useState<number>(0);
  const [domRate, setDomRate] = useState<number>(1.0);

  // Custom MP4 Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const combinedVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-sync top dropdown choices directly into Act I & Act II prompts
  const syncDropdownsIntoPrompts = useCallback(
    (overrides?: {
      country?: string;
      language?: string;
      characters?: string;
      durationSec?: number;
      attire?: string;
      wardrobe?: string;
      demography?: string;
      audience?: string;
      platform?: string;
    }) => {
      const c = overrides?.country ?? trendCountry;
      const l = overrides?.language ?? trendLanguage;
      const ch = overrides?.characters ?? trendCharacters;
      const dur = overrides?.durationSec ?? trendDurationSec;
      const att1 = overrides?.attire ?? trendAttire;
      const wrd2 = overrides?.wardrobe ?? trendWardrobe;
      const dem = overrides?.demography ?? trendDemography;
      const aud = overrides?.audience ?? trendAudience;
      const plat = overrides?.platform ?? trendPlatform;

      const halfDur = Math.round(dur / 2);

      setDraftAct1Prompt(
        `High-budget 4K ${l} (${c}) theatrical music video shot on 35mm anamorphic cinema lens at a sunlit luxury cliffside infinity pool villa terrace (Act I • ${halfDur}s). Featuring ${ch} wearing ${att1}, singing and performing synchronized high-energy choreography tailored for ${dem} & ${aud} on ${plat}.`
      );
      setDraftAct2Prompt(
        `MANDATORY FACIAL IDENTITY LOCK: exact same lead performer face identity from Act I, now wearing ${wrd2} on a candlelit luxury superyacht deck at blue-hour twilight (Act II • ${halfDur}s) with ${ch}, synchronized vocals, and cinematic camera orbits.`
      );
      setPromptsSyncedBadge(true);
    },
    [
      trendCountry,
      trendLanguage,
      trendCharacters,
      trendDurationSec,
      trendAttire,
      trendWardrobe,
      trendDemography,
      trendAudience,
      trendPlatform,
    ]
  );

  const selectIdeaById = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    const idea = trendingIdeas.find((it) => it.id === ideaId);
    if (idea) {
      setDraftTitle(idea.title);
      setDraftGenre(idea.genre);
      setDraftBpm(idea.bpm);
      setDraftAct1Prompt(idea.act1Prompt);
      setDraftAct2Prompt(idea.act2Prompt);
      if (idea.durationSec) setTrendDurationSec(idea.durationSec);
      setPromptsSyncedBadge(true);
      setShowScriptEditor(true);
    }
  };

  async function handleGenerate10TrendingIdeas() {
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch("/api/swarm/trending-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: trendCountry,
          language: trendLanguage,
          characters: trendCharacters,
          durationSec: trendDurationSec,
          attire: trendAttire,
          wardrobe: trendWardrobe,
          demography: trendDemography,
          targetAudience: trendAudience,
          socialPlatform: trendPlatform,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ideas?.length) {
        setTrendingIdeas(data.ideas);
        const first = data.ideas[0];
        setSelectedIdeaId(first.id);
        setDraftTitle(first.title);
        setDraftGenre(first.genre);
        setDraftBpm(first.bpm);
        setDraftAct1Prompt(first.act1Prompt);
        setDraftAct2Prompt(first.act2Prompt);
        setPromptsSyncedBadge(true);
        setShowScriptEditor(true);
      }
    } finally {
      setIsGeneratingIdeas(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setHasActiveReelLoaded(true);
    const res = await fetch("/api/swarm/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draftTitle,
        genre: draftGenre,
        bpm: draftBpm,
        durationSec: trendDurationSec,
        country: trendCountry,
        language: trendLanguage,
        characters: trendCharacters,
        demography: trendDemography,
        targetAudience: trendAudience,
        socialPlatform: trendPlatform,
        act1Wardrobe: trendAttire,
        act2Wardrobe: trendWardrobe,
        selectedCharacterId,
        selectedLocationId,
        act1Prompt: draftAct1Prompt,
        act2Prompt: draftAct2Prompt,
      }),
    });
    const data = await res.json();
    if (res.ok && data.job) {
      setActiveJob(data.job);
    }
  }

  useEffect(() => {
    if (!activeJob || activeJob.status !== "running") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/swarm/jobs?id=${activeJob.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.job) {
          setActiveJob(data.job);
          if (data.job.status === "completed") {
            setProjectTitle(data.job.title);
            setCombinedSrc(data.job.combinedSrc);
            setSegments([
              {
                ...DEFAULT_SEGMENTS[0],
                src: data.job.act1Src,
              },
              {
                ...DEFAULT_SEGMENTS[1],
                src: data.job.act2Src,
              },
            ]);
          }
        }
      } catch {
        // ignore transient poll errors
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [activeJob]);

  const syncPlaybackEngine = useCallback(() => {
    const v = combinedVideoRef.current;
    if (!v) return;
    const t = v.currentTime;
    const activeRate = t < 30.0 ? part1Speed : part2Speed;

    if (Math.abs(v.playbackRate - activeRate) > 0.001) {
      v.playbackRate = activeRate;
      v.defaultPlaybackRate = activeRate;
    }
    const anyV = v as HTMLVideoElement & {
      preservesPitch?: boolean;
      mozPreservesPitch?: boolean;
      webkitPreservesPitch?: boolean;
    };
    if (anyV.preservesPitch !== preservesPitch) {
      anyV.preservesPitch = preservesPitch;
      anyV.mozPreservesPitch = preservesPitch;
      anyV.webkitPreservesPitch = preservesPitch;
    }
    setDomRate(v.playbackRate);
  }, [part1Speed, part2Speed, preservesPitch]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (combinedVideoRef.current && !combinedVideoRef.current.paused) {
        setCombinedTime(combinedVideoRef.current.currentTime);
        syncPlaybackEngine();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [syncPlaybackEngine]);

  const setP1Speed = (val: number) => {
    const clamped = Math.min(2.0, Math.max(0.5, Number(val.toFixed(2))));
    setPart1Speed(clamped);
    if (combinedVideoRef.current && combinedVideoRef.current.currentTime < 30.0) {
      combinedVideoRef.current.playbackRate = clamped;
      setDomRate(clamped);
    }
  };

  const setP2Speed = (val: number) => {
    const clamped = Math.min(2.0, Math.max(0.5, Number(val.toFixed(2))));
    setPart2Speed(clamped);
    if (combinedVideoRef.current && combinedVideoRef.current.currentTime >= 30.0) {
      combinedVideoRef.current.playbackRate = clamped;
      setDomRate(clamped);
    }
  };

  const seekCombined = (sec: number, autoPlay = false) => {
    const v = combinedVideoRef.current;
    if (!v) return;
    v.currentTime = Math.min(60, Math.max(0, sec));
    setCombinedTime(v.currentTime);
    syncPlaybackEngine();
    if (autoPlay) {
      v.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    const v = combinedVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const stepFrame = (deltaFrames: number) => {
    const v = combinedVideoRef.current;
    if (!v) return;
    v.pause();
    setIsPlaying(false);
    seekCombined(v.currentTime + deltaFrames / 24);
  };

  const resetAllEdits = () => {
    setPart1Speed(1.0);
    setPart2Speed(1.0);
    setRotationDeg(0);
    setFlipH(false);
  };

  async function handleRenderCustomMaster() {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const res = await fetch("/api/swarm/export-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          act1Src: segments[0].src,
          act2Src: segments[1].src,
          part1Speed,
          part2Speed,
          part1In: 0,
          part1Out: 30,
          part2In: 0,
          part2Out: 30,
          rotationDeg,
          flipH,
          preservesPitch,
        }),
      });
      const data = await res.json();
      if (res.ok && data.masterUrl) {
        setCombinedSrc(data.masterUrl);
        setExportNotice(`✅ Custom Master Baked & Saved to Library (${data.masterUrl})`);
      }
    } finally {
      setIsExporting(false);
    }
  }

  const p1EffDur = 30.0 / part1Speed;
  const p2EffDur = 30.0 / part2Speed;
  const totalEffDur = p1EffDur + p2EffDur;
  const isInPart1 = combinedTime < 30.0;

  const videoTransform: React.CSSProperties = {
    transform: `rotate(${rotationDeg}deg) scaleX(${flipH ? -1 : 1})`,
    transition: "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
  };

  return (
    <main
      style={{
        ...getM3CssVariables(activeScheme),
        backgroundColor: activeScheme.surfaceDim,
        color: activeScheme.onSurface,
      }}
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-5 space-y-5 transition-colors duration-300"
    >
      {/* =====================================================================
          STEP ①: CONCEPT, CAST & TREND INPUTS (GOOGLE M3 TONAL SURFACE CARD)
         ===================================================================== */}
      <section
        style={{
          backgroundColor: activeScheme.surfaceContainer,
          borderColor: activeScheme.outlineVariant,
        }}
        className="rounded-2xl border p-4 shadow-lg space-y-3.5"
      >
        {/* Header with Step ① Pill + Clean Canvas / Edit Existing Toggle + M3 Palette Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              style={{
                backgroundColor: activeScheme.primaryContainer,
                color: activeScheme.onPrimaryContainer,
              }}
              className="px-3 py-1 rounded-full font-mono text-xs font-extrabold"
            >
              STEP ① • CONCEPT & CAST INPUTS
            </span>
            <span className="text-xs text-slate-500">
              {hasActiveReelLoaded
                ? "Editing / Extending Active Reel — or click 'New Reel Creation Mode' to start fresh"
                : "Clean New Reel Creation Canvas — configure cast, wardrobe & prompt below"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasActiveReelLoaded ? (
              <button
                type="button"
                onClick={() => {
                  setHasActiveReelLoaded(false);
                  setActiveJob(null);
                }}
                style={{
                  borderColor: activeScheme.primary,
                  color: activeScheme.primary,
                }}
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold hover:opacity-90 transition"
              >
                ➕ New Reel Creation Mode (Hide Existing Reel)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setHasActiveReelLoaded(true)}
                style={{
                  borderColor: activeScheme.secondary,
                  color: activeScheme.secondary,
                }}
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold hover:opacity-90 transition"
              >
                ✏️ Edit / Extend Existing Reel (ZYV-REEL-MBV260S1)
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500">🎨 M3 Palette:</span>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                style={{
                  backgroundColor: activeScheme.surfaceContainerHigh,
                  borderColor: activeScheme.outlineVariant,
                  color: activeScheme.onSurface,
                }}
                className="px-2.5 py-1.5 rounded-xl border text-xs font-bold"
              >
                {M3_TONAL_SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Cast asset</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">Choose a person from Assets</h3>
              </div>
              <Link href="/assets?tab=people" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Browse assets
              </Link>
            </div>
            <select
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              disabled={assetLoading}
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            >
              <option value="">No saved character — use prompt cast</option>
              {availableCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.displayName} • {character.archetype}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              The selected character is persisted with this project and injected into Omni 1.1 generation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Location asset</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">Choose a saved location</h3>
              </div>
              <Link href="/assets?tab=locations" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Browse locations
              </Link>
            </div>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              disabled={assetLoading}
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            >
              <option value="">No saved location — use prompt location</option>
              {availableLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.displayName}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              The selected environment is persisted with the project and used consistently in both acts.
            </p>
          </div>
        </div>

        {/* Responsive 6-Column M3 Grid — Zero Horizontal Scroll Overflow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Country */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Country
            </label>
            <select
              value={trendCountry}
              onChange={(e) => {
                setTrendCountry(e.target.value);
                syncDropdownsIntoPrompts({ country: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Language */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Language
            </label>
            <select
              value={trendLanguage}
              onChange={(e) => {
                setTrendLanguage(e.target.value);
                syncDropdownsIntoPrompts({ language: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Characters */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Characters / Cast
            </label>
            <select
              value={trendCharacters}
              onChange={(e) => {
                setTrendCharacters(e.target.value);
                syncDropdownsIntoPrompts({ characters: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {CHARACTER_FORMATIONS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Duration (s) */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Duration (s)
            </label>
            <input
              type="number"
              min={10}
              max={180}
              step={10}
              value={trendDurationSec}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTrendDurationSec(v);
                syncDropdownsIntoPrompts({ durationSec: v });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
                color: activeScheme.primary,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold"
            />
          </div>

          {/* 5. Attire (Act I) */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Attire (Act I)
            </label>
            <select
              value={trendAttire}
              onChange={(e) => {
                setTrendAttire(e.target.value);
                syncDropdownsIntoPrompts({ attire: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {EXHAUSTIVE_ATTIRES_ACT1.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Wardrobe (Act II) */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Wardrobe (Act II)
            </label>
            <select
              value={trendWardrobe}
              onChange={(e) => {
                setTrendWardrobe(e.target.value);
                syncDropdownsIntoPrompts({ wardrobe: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {EXHAUSTIVE_WARDROBES_ACT2.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Demography */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Demography
            </label>
            <select
              value={trendDemography}
              onChange={(e) => {
                setTrendDemography(e.target.value);
                syncDropdownsIntoPrompts({ demography: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {DEMOGRAPHIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Target Audience */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Target Audience
            </label>
            <select
              value={trendAudience}
              onChange={(e) => {
                setTrendAudience(e.target.value);
                syncDropdownsIntoPrompts({ audience: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {TARGET_AUDIENCES.map((ta) => (
                <option key={ta} value={ta}>
                  {ta}
                </option>
              ))}
            </select>
          </div>

          {/* 9. Social Platform */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Social Platform
            </label>
            <select
              value={trendPlatform}
              onChange={(e) => {
                setTrendPlatform(e.target.value);
                syncDropdownsIntoPrompts({ platform: e.target.value });
              }}
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs text-white"
            >
              {SOCIAL_PLATFORMS.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* 10. Generate 10 Ideas M3 Filled Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate10TrendingIdeas}
              disabled={isGeneratingIdeas}
              style={{
                backgroundColor: activeScheme.primary,
                color: activeScheme.onPrimary,
              }}
              className="w-full px-4 py-1.5 rounded-full font-extrabold text-xs shadow transition hover:opacity-90"
            >
              {isGeneratingIdeas ? "✨ Generating..." : "✨ Generate 10 Ideas"}
            </button>
          </div>

          {/* 11. Generated Ideas Dropdown (Spans 2 columns) */}
          <div className="col-span-2">
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
              Select Trending AI Treatment (1–10)
            </label>
            <select
              value={selectedIdeaId}
              onChange={(e) => selectIdeaById(e.target.value)}
              style={{
                backgroundColor: activeScheme.surfaceContainerHigh,
                borderColor: activeScheme.outlineVariant,
                color: activeScheme.onSurface,
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
            >
              {trendingIdeas.map((idea, i) => (
                <option key={idea.id} value={idea.id}>
                  #{i + 1} • {idea.title} ({idea.bpm} BPM)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STEP ②: DIRECTOR SCRIPT EDITOR & LAUNCH SHOOT (GOOGLE M3 SURFACE)
         ===================================================================== */}
      <section
        style={{
          backgroundColor: activeScheme.surfaceContainer,
          borderColor: activeScheme.outlineVariant,
        }}
        className="rounded-2xl border p-4 shadow-lg space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              style={{
                backgroundColor: activeScheme.secondaryContainer,
                color: activeScheme.onSecondaryContainer,
              }}
              className="px-3 py-1 rounded-full font-mono text-xs font-extrabold"
            >
              STEP ② • DIRECTOR SCRIPT & SHOOT
            </span>
            <h1 className="text-sm md:text-base font-bold">{draftTitle}</h1>
            <span
              style={{
                backgroundColor: promptsSyncedBadge
                  ? activeScheme.secondaryContainer
                  : activeScheme.surfaceContainerHigh,
                color: promptsSyncedBadge
                  ? activeScheme.onSecondaryContainer
                  : activeScheme.onSurface,
              }}
              className="px-2.5 py-0.5 rounded-full font-mono text-[11px]"
            >
              {promptsSyncedBadge
                ? "✓ Synced with Top Dropdowns"
                : "Custom Director Prompt Edits"}
            </span>
            {!promptsSyncedBadge && (
              <button
                type="button"
                onClick={() => syncDropdownsIntoPrompts()}
                style={{ borderColor: activeScheme.outlineVariant }}
                className="px-2.5 py-0.5 rounded-full border text-[11px] hover:bg-white/5"
              >
                ↻ Re-Sync from Dropdowns
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowScriptEditor((s) => !s)}
              className="px-2.5 py-0.5 rounded-full text-[11px] text-slate-700 hover:bg-white/5"
            >
              {showScriptEditor ? "▲ Collapse Script" : "▼ Expand Script"}
            </button>
          </div>

          {hasActiveReelLoaded && (
            <a
              href={combinedSrc}
              download="Master_B_v2_Director_Cut.mp4"
              style={{
                backgroundColor: activeScheme.secondary,
                color: activeScheme.onSecondary,
              }}
              className="px-4 py-1.5 rounded-full font-extrabold text-xs"
            >
              ⬇ Export Master MP4
            </a>
          )}
        </div>

        {showScriptEditor && (
          <form
            onSubmit={handleCreateJob}
            style={{ borderColor: activeScheme.outlineVariant }}
            className="space-y-3 pt-3 border-t"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                style={{
                  backgroundColor: activeScheme.surfaceContainerLowest,
                  borderColor: activeScheme.outlineVariant,
                }}
                className="rounded-xl border p-3"
              >
                <div
                  style={{ color: activeScheme.primary }}
                  className="flex justify-between text-[10px] font-mono mb-1"
                >
                  <span>ACT I PROMPT (PART 1 • {Math.round(trendDurationSec / 2)}s)</span>
                  <span>ATTIRE: {trendAttire}</span>
                </div>
                <textarea
                  rows={3}
                  value={draftAct1Prompt}
                  onChange={(e) => {
                    setDraftAct1Prompt(e.target.value);
                    setPromptsSyncedBadge(false);
                  }}
                  className="w-full bg-transparent text-xs text-slate-900 focus:outline-none leading-relaxed"
                />
              </div>

              <div
                style={{
                  backgroundColor: activeScheme.surfaceContainerLowest,
                  borderColor: activeScheme.outlineVariant,
                }}
                className="rounded-xl border p-3"
              >
                <div
                  style={{ color: activeScheme.secondary }}
                  className="flex justify-between text-[10px] font-mono mb-1"
                >
                  <span>ACT II PROMPT (PART 2 • SAME LEAD FACE LOCK)</span>
                  <span>WARDROBE: {trendWardrobe}</span>
                </div>
                <textarea
                  rows={3}
                  value={draftAct2Prompt}
                  onChange={(e) => {
                    setDraftAct2Prompt(e.target.value);
                    setPromptsSyncedBadge(false);
                  }}
                  className="w-full bg-transparent text-xs text-slate-900 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Target: <b className="text-slate-800">{trendDemography}</b> •{" "}
                <b className="text-slate-800">{trendAudience}</b> on{" "}
                <b style={{ color: activeScheme.secondary }}>{trendPlatform}</b> (
                {trendDurationSec}s total)
              </span>
              <button
                type="submit"
                disabled={activeJob?.status === "running"}
                style={{
                  backgroundColor: activeScheme.primary,
                  color: activeScheme.onPrimary,
                }}
                className="px-6 py-2 rounded-full font-extrabold text-xs shadow-lg disabled:opacity-50"
              >
                {activeJob?.status === "running"
                  ? "⚡ Generating Live with Gemini Omni 1.1 Flash..."
                  : "🎬 Submit & Launch Production Shoot"}
              </button>
            </div>
          </form>
        )}

        {/* 6-Stage Visual Production Pipeline Tracker */}
        {activeJob && (
          <div
            style={{
              backgroundColor: activeScheme.surfaceContainerLowest,
              borderColor: activeScheme.outlineVariant,
            }}
            className="rounded-xl border p-3.5 space-y-3"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold">{activeJob.stageLabel}</span>
              <span
                style={{ color: activeScheme.secondary }}
                className="font-bold"
              >
                {activeJob.progress}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                style={{
                  width: `${activeJob.progress}%`,
                  backgroundColor: activeScheme.primary,
                }}
                className="h-full transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PIPELINE_STEPS.map((st, idx) => {
                const prevThreshold = idx === 0 ? 0 : PIPELINE_STEPS[idx - 1].threshold;
                const isDone = activeJob.progress >= st.threshold;
                const isCurrent =
                  !isDone &&
                  activeJob.progress >= prevThreshold &&
                  activeJob.status === "running";
                return (
                  <div
                    key={st.id}
                    style={{
                      backgroundColor: isDone
                        ? activeScheme.secondaryContainer
                        : isCurrent
                        ? activeScheme.primaryContainer
                        : activeScheme.surfaceContainer,
                      borderColor: activeScheme.outlineVariant,
                    }}
                    className="p-2 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5"
                  >
                    <span>{isDone ? "✓" : isCurrent ? "●" : "○"}</span>
                    <span>
                      {st.id}. {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          STEP ③: ONLY RENDERED WHEN A SHOOT IS LAUNCHED OR EDITING AN EXISTING REEL
         ===================================================================== */}
      {hasActiveReelLoaded && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* LEFT RAIL (3 COLS): CLEAN M3 SPEED & TEMPO RACK */}
          <aside className="xl:col-span-3 space-y-3">
            {/* ACT I SPEED CARD */}
            <div
              onClick={() => setSelectedActIndex(1)}
              style={{
                backgroundColor:
                  selectedActIndex === 1
                    ? activeScheme.surfaceContainerHigh
                    : activeScheme.surfaceContainer,
                borderColor:
                  selectedActIndex === 1
                    ? activeScheme.primary
                    : activeScheme.outlineVariant,
              }}
              className="cursor-pointer rounded-2xl p-4 border transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{
                    backgroundColor: activeScheme.primaryContainer,
                    color: activeScheme.onPrimaryContainer,
                  }}
                  className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full"
                >
                  ACT I • 00:00 → 00:30
                </span>
                <span className="font-mono text-xs text-slate-500">
                  Eff: {p1EffDur.toFixed(2)}s
                </span>
              </div>
              <h3 className="text-sm font-bold">Sunlit Cliffside Pool Villa</h3>
              <p className="text-xs text-slate-500 mt-0.5">{trendAttire}</p>

              <div
                style={{ borderColor: activeScheme.outlineVariant }}
                className="mt-3 pt-3 border-t space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Part 1 Speed</span>
                  <div className="flex items-center gap-1 font-mono">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setP1Speed(part1Speed - 0.01);
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      -
                    </button>
                    <span
                      style={{ color: activeScheme.primary }}
                      className="w-14 text-center font-bold"
                    >
                      {part1Speed.toFixed(2)}x
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setP1Speed(part1Speed + 0.01);
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  value={part1Speed}
                  onChange={(e) => setP1Speed(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* ACT II SPEED CARD */}
            <div
              onClick={() => setSelectedActIndex(2)}
              style={{
                backgroundColor:
                  selectedActIndex === 2
                    ? activeScheme.surfaceContainerHigh
                    : activeScheme.surfaceContainer,
                borderColor:
                  selectedActIndex === 2
                    ? activeScheme.secondary
                    : activeScheme.outlineVariant,
              }}
              className="cursor-pointer rounded-2xl p-4 border transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{
                    backgroundColor: activeScheme.secondaryContainer,
                    color: activeScheme.onSecondaryContainer,
                  }}
                  className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full"
                >
                  ACT II • 00:30 → 01:00
                </span>
                <span className="font-mono text-xs text-slate-500">
                  Eff: {p2EffDur.toFixed(2)}s
                </span>
              </div>
              <h3 className="text-sm font-bold">Twilight Luxury Superyacht Deck</h3>
              <p className="text-xs text-slate-500 mt-0.5">{trendWardrobe}</p>

              <div
                style={{ borderColor: activeScheme.outlineVariant }}
                className="mt-3 pt-3 border-t space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Part 2 Speed</span>
                  <div className="flex items-center gap-1 font-mono">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setP2Speed(part2Speed - 0.01);
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      -
                    </button>
                    <span
                      style={{ color: activeScheme.secondary }}
                      className="w-14 text-center font-bold"
                    >
                      {part2Speed.toFixed(2)}x
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setP2Speed(part2Speed + 0.01);
                      }}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  value={part2Speed}
                  onChange={(e) => setP2Speed(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* DIRECTOR TEMPO & MASTER BAKE CARD */}
            <div
              style={{
                backgroundColor: activeScheme.surfaceContainer,
                borderColor: activeScheme.outlineVariant,
              }}
              className="rounded-2xl border p-4 space-y-2.5"
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Pacing Presets & Custom Master Bake
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    setPart1Speed(1.1);
                    setPart2Speed(0.9);
                  }}
                  style={{ borderColor: activeScheme.outlineVariant }}
                  className="w-full text-left px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border text-xs flex justify-between items-center"
                >
                  <span>⚡ Dynamic Contrast Cut</span>
                  <span className="font-mono">1.10x → 0.90x</span>
                </button>
                <button
                  onClick={resetAllEdits}
                  style={{ borderColor: activeScheme.outlineVariant }}
                  className="w-full text-left px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border text-xs flex justify-between items-center"
                >
                  <span>🎬 Studio Reference Lock</span>
                  <span className="font-mono">1.00x → 1.00x</span>
                </button>
              </div>

              <button
                onClick={handleRenderCustomMaster}
                disabled={isExporting}
                style={{
                  backgroundColor: activeScheme.primary,
                  color: activeScheme.onPrimary,
                }}
                className="w-full py-2 rounded-full font-extrabold text-xs shadow-lg transition disabled:opacity-50"
              >
                {isExporting
                  ? "Rendering Broadcast Master..."
                  : "⚡ Render & Master Custom Cut MP4"}
              </button>
              {exportNotice && (
                <div className="text-[11px] font-mono text-emerald-300">
                  {exportNotice}
                </div>
              )}
            </div>
          </aside>

          {/* CENTER STAGE (9 COLS): STEP ③ MAIN COMBINED REEL + UNIFIED SPLICER + CHILD CLIPS */}
          <section
            style={{
              backgroundColor: activeScheme.surfaceContainer,
              borderColor: activeScheme.outlineVariant,
            }}
            className="xl:col-span-9 rounded-2xl border p-4 md:p-5 space-y-4 shadow-2xl"
          >
            {/* SMPTE TIMECODE BAR */}
            <div
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl border"
            >
              <div className="flex items-center gap-3">
                <span
                  style={{
                    backgroundColor: activeScheme.primaryContainer,
                    color: activeScheme.onPrimaryContainer,
                  }}
                  className="px-2.5 py-0.5 rounded-full font-mono text-xs font-extrabold"
                >
                  STEP ③ • MASTER MONITOR
                </span>
                <span className="font-mono text-sm md:text-base font-bold tracking-wider">
                  TC {formatSMPTE(combinedTime)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span>
                  Active Speed: <b>{domRate.toFixed(2)}x</b> (
                  {(24 * domRate).toFixed(1)} fps)
                </span>
                <span>
                  Total Runtime: <b>{totalEffDur.toFixed(2)}s</b>
                </span>
              </div>
            </div>

            {/* MAIN COMBINED REEL CARD */}
            <div
              style={{
                backgroundColor: activeScheme.surfaceContainerLow,
                borderColor: activeScheme.outlineVariant,
              }}
              className="rounded-2xl border p-4 space-y-3"
            >
              <div
                onClick={() => setShowChildReelsDrawer((prev) => !prev)}
                style={{ backgroundColor: activeScheme.surfaceContainerHigh }}
                className="flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none px-3 py-2 rounded-xl transition"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundColor: activeScheme.secondaryContainer,
                      color: activeScheme.onSecondaryContainer,
                    }}
                    className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold"
                  >
                    ZYV-REEL-MBV260S1
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold">
                    MAIN COMBINED REEL (60.0s MASTER)
                  </span>
                  <Link
                    href="/entity/ZYV-REEL-MBV260S1"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: activeScheme.primary }}
                    className="text-[11px] font-mono hover:underline"
                  >
                    /entity/ZYV-REEL-MBV260S1
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSplicerStudio((prev) => !prev);
                    }}
                    style={{
                      borderColor: activeScheme.primary,
                      color: activeScheme.primary,
                    }}
                    className="px-3 py-1 rounded-full border font-mono text-xs font-bold"
                  >
                    {showSplicerStudio ? "✂️ Hide Trim & Splice" : "✂️ Trim & Splice Studio"}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChildReelsDrawer((prev) => !prev);
                    }}
                    style={{
                      backgroundColor: activeScheme.secondary,
                      color: activeScheme.onSecondary,
                    }}
                    className="px-3.5 py-1 rounded-full font-mono text-xs font-extrabold shadow"
                  >
                    {showChildReelsDrawer
                      ? "▲ Hide Child Reels & Clips (6)"
                      : "▼ Expand Child Reels & Clips (6)"}
                  </button>
                </div>
              </div>

              {/* VIDEO PLAYER */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-200 aspect-[9/16] max-h-[540px] max-w-md mx-auto w-full flex items-center justify-center shadow-inner">
                <video
                  key={combinedSrc}
                  ref={combinedVideoRef}
                  src={combinedSrc}
                  controls
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => {
                    setCombinedTime((e.currentTarget as HTMLVideoElement).currentTime);
                    syncPlaybackEngine();
                  }}
                  style={videoTransform}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* UNIFIED COLLAPSIBLE TRIM & SPLICE STUDIO */}
              {showSplicerStudio && (
                <div
                  style={{
                    backgroundColor: activeScheme.surfaceContainerLowest,
                    borderColor: activeScheme.outlineVariant,
                  }}
                  className="rounded-xl border p-3.5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold">
                      ✂️ Unified Sub-Clip Trim & Multi-Clip Splicer Studio
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSplicerTabIndex(0)}
                        style={{
                          backgroundColor:
                            splicerTabIndex === 0
                              ? activeScheme.primary
                              : "transparent",
                          color:
                            splicerTabIndex === 0
                              ? activeScheme.onPrimary
                              : activeScheme.onSurface,
                        }}
                        className="px-3 py-1 rounded-full text-xs font-bold"
                      >
                        Single Clip Quick Cut
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplicerTabIndex(1)}
                        style={{
                          backgroundColor:
                            splicerTabIndex === 1
                              ? activeScheme.primary
                              : "transparent",
                          color:
                            splicerTabIndex === 1
                              ? activeScheme.onPrimary
                              : activeScheme.onSurface,
                        }}
                        className="px-3 py-1 rounded-full text-xs font-bold"
                      >
                        Multi-Clip Splicer Timeline
                      </button>
                    </div>
                  </div>

                  {splicerTabIndex === 0 ? (
                    <InlineClipTrimmer
                      clipId="CLP-COMBINED-MASTER"
                      label="Main Combined Reel (60.0s Master)"
                      src={combinedSrc}
                      maxDurationSec={60}
                      onAddToQueue={(seg) => {
                        setSpliceQueue((prev) => [...prev, seg]);
                        setSplicerTabIndex(1);
                      }}
                    />
                  ) : (
                    <MultiClipSplicerWorkbench
                      availableSources={[
                        {
                          clipId: "CLP-COMBINED-MASTER",
                          label: "Combined 60.0s Master Reel",
                          src: combinedSrc,
                          maxDurationSec: 60,
                        },
                        {
                          clipId: "CLP-ACT01-MASTER30S",
                          label: "Act I Master Reel (Pool Villa Terrace)",
                          src: segments[0].src,
                          maxDurationSec: 30,
                        },
                        {
                          clipId: "CLP-ACT02-MASTER30S",
                          label: "Act II Master Reel (Superyacht Deck)",
                          src: segments[1].src,
                          maxDurationSec: 30,
                        },
                        {
                          clipId: "CLP-TRN01-ACT01-10S",
                          label: "Child Clip ACT01 • Turn 1A (Root 10.0s)",
                          src: "/assets/swarm/masterB_v2/act1_turnA_10s.mp4",
                          maxDurationSec: 10,
                        },
                        {
                          clipId: "CLP-TRN02-ACT02-20S",
                          label: "Child Clip ACT02 • Turn 1B (Stateful 20.0s)",
                          src: "/assets/swarm/masterB_v2/act1_turnB_20s.mp4",
                          maxDurationSec: 20,
                        },
                        {
                          clipId: "CLP-TRN03-ACT03-10S",
                          label: "Child Clip ACT03 • Turn 2A (Face-Anchored 10.0s)",
                          src: "/assets/swarm/masterB_v2/act2_turnA_10s.mp4",
                          maxDurationSec: 10,
                        },
                        {
                          clipId: "CLP-TRN04-ACT04-20S",
                          label: "Child Clip ACT04 • Turn 2B (Stateful 20.0s)",
                          src: "/assets/swarm/masterB_v2/act2_turnB_20s.mp4",
                          maxDurationSec: 20,
                        },
                      ]}
                      queue={spliceQueue}
                      setQueue={setSpliceQueue}
                    />
                  )}
                </div>
              )}

              {/* EXPANDED CHILD REELS & CLIPS DRAWER */}
              {showChildReelsDrawer && (
                <div
                  style={{ borderColor: activeScheme.outlineVariant }}
                  className="pt-4 mt-2 border-t space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      style={{
                        backgroundColor: activeScheme.surfaceContainerHigh,
                        borderColor: activeScheme.outlineVariant,
                      }}
                      className="rounded-xl border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold">ZYV-CLIP-ACT130S1 • ACT I MASTER (30.0s)</span>
                        <Link
                          href="/entity/ZYV-CLIP-ACT130S1"
                          style={{ color: activeScheme.secondary }}
                          className="hover:underline text-[11px]"
                        >
                          /entity/ZYV-CLIP-ACT130S1
                        </Link>
                      </div>
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[340px] mx-auto w-full">
                        <video
                          src={segments[0].src}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <InlineClipTrimmer
                        clipId="CLP-ACT01-MASTER30S"
                        label="Act I Master Reel (30.0s)"
                        src={segments[0].src}
                        maxDurationSec={30}
                        onAddToQueue={(seg) => {
                          setSpliceQueue((prev) => [...prev, seg]);
                          setShowSplicerStudio(true);
                          setSplicerTabIndex(1);
                        }}
                      />
                    </div>

                    <div
                      style={{
                        backgroundColor: activeScheme.surfaceContainerHigh,
                        borderColor: activeScheme.outlineVariant,
                      }}
                      className="rounded-xl border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold">ZYV-CLIP-ACT230S2 • ACT II MASTER (30.0s)</span>
                        <Link
                          href="/entity/ZYV-CLIP-ACT230S2"
                          style={{ color: activeScheme.secondary }}
                          className="hover:underline text-[11px]"
                        >
                          /entity/ZYV-CLIP-ACT230S2
                        </Link>
                      </div>
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[340px] mx-auto w-full">
                        <video
                          src={segments[1].src}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <InlineClipTrimmer
                        clipId="CLP-ACT02-MASTER30S"
                        label="Act II Master Reel (30.0s)"
                        src={segments[1].src}
                        maxDurationSec={30}
                        onAddToQueue={(seg) => {
                          setSpliceQueue((prev) => [...prev, seg]);
                          setShowSplicerStudio(true);
                          setSplicerTabIndex(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* 4 CHILD TURN CLIPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {[
                      {
                        id: "ZYV-CLIP-TRN1A10S",
                        clipCode: "CLP-TRN01-ACT01",
                        label: "Turn 1A (Root 10.0s)",
                        duration: 10,
                        src: "/assets/swarm/masterB_v2/act1_turnA_10s.mp4",
                      },
                      {
                        id: "ZYV-CLIP-TRN1B20S",
                        clipCode: "CLP-TRN02-ACT02",
                        label: "Turn 1B (Stateful 20.0s)",
                        duration: 20,
                        src: "/assets/swarm/masterB_v2/act1_turnB_20s.mp4",
                      },
                      {
                        id: "ZYV-CLIP-TRN2A10S",
                        clipCode: "CLP-TRN03-ACT03",
                        label: "Turn 2A (Face-Anchored 10.0s)",
                        duration: 10,
                        src: "/assets/swarm/masterB_v2/act2_turnA_10s.mp4",
                      },
                      {
                        id: "ZYV-CLIP-TRN2B20s",
                        clipCode: "CLP-TRN04-ACT04",
                        label: "Turn 2B (Stateful 20.0s)",
                        duration: 20,
                        src: "/assets/swarm/masterB_v2/act2_turnB_20s.mp4",
                      },
                    ].map((clip) => (
                      <div
                        key={clip.id}
                        style={{
                          backgroundColor: activeScheme.surfaceContainerHigh,
                          borderColor: activeScheme.outlineVariant,
                        }}
                        className="rounded-xl border p-2.5 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold">{clip.id}</span>
                          <Link
                            href={`/entity/${clip.id}`}
                            style={{ color: activeScheme.secondary }}
                            className="hover:underline"
                          >
                            /entity/{clip.id}
                          </Link>
                        </div>
                        <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-h-[240px] mx-auto w-full">
                          <video
                            src={clip.src}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <InlineClipTrimmer
                          clipId={clip.clipCode}
                          label={clip.label}
                          src={clip.src}
                          maxDurationSec={clip.duration}
                          onAddToQueue={(seg) => {
                            setSpliceQueue((prev) => [...prev, seg]);
                            setShowSplicerStudio(true);
                            setSplicerTabIndex(1);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QUICKTIME STUDIO TRANSPORT BAR */}
            <div
              style={{
                backgroundColor: activeScheme.surfaceContainerLowest,
                borderColor: activeScheme.outlineVariant,
              }}
              className="rounded-xl border p-3.5 space-y-3"
            >
              <input
                type="range"
                min={0}
                max={60}
                step={0.04}
                value={combinedTime}
                onChange={(e) => seekCombined(Number(e.target.value))}
                className="w-full cursor-pointer"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => seekCombined(0, true)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 font-mono"
                  >
                    ⏮ 00:00
                  </button>
                  <button
                    onClick={() => stepFrame(-1)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 font-mono"
                  >
                    ◀| -1f
                  </button>
                  <button
                    onClick={togglePlay}
                    style={{
                      backgroundColor: activeScheme.primary,
                      color: activeScheme.onPrimary,
                    }}
                    className="px-4 py-1.5 rounded-full font-extrabold"
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play Master"}
                  </button>
                  <button
                    onClick={() => stepFrame(1)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 font-mono"
                  >
                    +1f |▶
                  </button>
                  <button
                    onClick={() => seekCombined(28.0, true)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 font-mono font-semibold"
                  >
                    ▶ Audition 00:30 Cut
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRotationDeg((d) => (d + 90) % 360)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    ↻ Rotate 90°
                  </button>
                  <button
                    onClick={() => setFlipH((f) => !f)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    ↔ Mirror
                  </button>
                  <button
                    onClick={() => setPreservesPitch((p) => !p)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    🎵 Pitch Lock: {preservesPitch ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => setLoopPlayback((l) => !l)}
                    className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    🔁 Loop: {loopPlayback ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
