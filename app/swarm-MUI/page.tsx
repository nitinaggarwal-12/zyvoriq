"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Slider,
  Chip,
  Collapse,
  LinearProgress,
  Divider,
  Stack,
  ButtonGroup,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  AutoAwesome,
  PlayArrow,
  Pause,
  SkipPrevious,
  FastRewind,
  FastForward,
  RotateRight,
  Flip,
  GraphicEq,
  Loop,
  ExpandMore,
  ExpandLess,
  MovieCreation,
  Download,
  Palette,
  Tune,
  ContentCut,
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Sync,
} from "@mui/icons-material";
import {
  InlineClipTrimmer,
  MultiClipSplicerWorkbench,
  QueuedSpliceSegment,
} from "@/components/InstantSubClipSplicer";

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
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  stageLabel: string;
  act1Src: string;
  act2Src: string;
  combinedSrc: string;
  logs: string[];
}

// ============================================================================
// GOOGLE MATERIAL DESIGN 3 (M3) HCT-CALIBRATED DYNAMIC TONAL COLOR SCHEMES
// ============================================================================
interface M3TonalScheme {
  id: string;
  name: string;
  mode: "dark" | "light";
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outlineVariant: string;
}

const M3_TONAL_SCHEMES: M3TonalScheme[] = [
  {
    id: "sapphire_emerald",
    name: "M3 Sapphire & Emerald Studio (Dark • HCT AAA)",
    mode: "dark",
    primary: "#A8C7FA",
    onPrimary: "#062E6F",
    primaryContainer: "#0842A0",
    onPrimaryContainer: "#D3E3FD",
    secondary: "#6EE7B7",
    onSecondary: "#022C22",
    secondaryContainer: "#065F46",
    onSecondaryContainer: "#D1FAE5",
    tertiary: "#FCD34D",
    onTertiary: "#3F2E00",
    tertiaryContainer: "#78350F",
    onTertiaryContainer: "#FEF3C7",
    onSurface: "#E2E2E9",
    onSurfaceVariant: "#C4C6D0",
    surfaceDim: "#0B0E14",
    surfaceContainerLowest: "#07090E",
    surfaceContainerLow: "#111622",
    surfaceContainer: "#171D2B",
    surfaceContainerHigh: "#1E2638",
    surfaceContainerHighest: "#263046",
    outlineVariant: "rgba(168, 199, 250, 0.22)",
  },
  {
    id: "amethyst_gold",
    name: "M3 Royal Amethyst & Gold (Dark • HCT AAA)",
    mode: "dark",
    primary: "#D0BCFF",
    onPrimary: "#381E72",
    primaryContainer: "#4F378B",
    onPrimaryContainer: "#EADDFF",
    secondary: "#FCD34D",
    onSecondary: "#451A03",
    secondaryContainer: "#78350F",
    onSecondaryContainer: "#FEF3C7",
    tertiary: "#F472B6",
    onTertiary: "#500724",
    tertiaryContainer: "#831843",
    onTertiaryContainer: "#FCE7F3",
    onSurface: "#E6E0E9",
    onSurfaceVariant: "#CAC4D0",
    surfaceDim: "#0E0B16",
    surfaceContainerLowest: "#09070E",
    surfaceContainerLow: "#161224",
    surfaceContainer: "#1D182E",
    surfaceContainerHigh: "#26203B",
    surfaceContainerHighest: "#31294B",
    outlineVariant: "rgba(208, 188, 255, 0.22)",
  },
  {
    id: "crimson_velvet",
    name: "M3 Crimson Velvet & Champagne (Dark • HCT Balanced)",
    mode: "dark",
    primary: "#FFB3B8",
    onPrimary: "#5F111D",
    primaryContainer: "#8E1D2F",
    onPrimaryContainer: "#FFDAD9",
    secondary: "#FDE68A",
    onSecondary: "#422006",
    secondaryContainer: "#713F12",
    onSecondaryContainer: "#FEF9C3",
    tertiary: "#7DD3FC",
    onTertiary: "#003549",
    tertiaryContainer: "#0C4A6E",
    onTertiaryContainer: "#E0F2FE",
    onSurface: "#F1DFE1",
    onSurfaceVariant: "#D8C2C4",
    surfaceDim: "#120A0C",
    surfaceContainerLowest: "#0E080A",
    surfaceContainerLow: "#1D1315",
    surfaceContainer: "#24181B",
    surfaceContainerHigh: "#2E2023",
    surfaceContainerHighest: "#39292C",
    outlineVariant: "rgba(255, 179, 184, 0.22)",
  },
  {
    id: "cyan_coral",
    name: "M3 Cyber Cyan & Sunset Coral (Dark • HCT AAA)",
    mode: "dark",
    primary: "#67E8F9",
    onPrimary: "#083344",
    primaryContainer: "#155E75",
    onPrimaryContainer: "#CFFAFE",
    secondary: "#FDA4AF",
    onSecondary: "#4C0519",
    secondaryContainer: "#881337",
    onSecondaryContainer: "#FFE4E6",
    tertiary: "#A7F3D0",
    onTertiary: "#003826",
    tertiaryContainer: "#064E3B",
    onTertiaryContainer: "#D1FAE5",
    onSurface: "#DEE3E6",
    onSurfaceVariant: "#BFC8CC",
    surfaceDim: "#091217",
    surfaceContainerLowest: "#050B0E",
    surfaceContainerLow: "#0F1C24",
    surfaceContainer: "#14252F",
    surfaceContainerHigh: "#1B303D",
    surfaceContainerHighest: "#233D4D",
    outlineVariant: "rgba(103, 232, 249, 0.22)",
  },
  {
    id: "daylight_studio",
    name: "M3 Daylight Studio Ivory & Cobalt (Light • HCT Tone 98)",
    mode: "light",
    primary: "#1D4ED8",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D8E2FF",
    onPrimaryContainer: "#001A41",
    secondary: "#047857",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#A7F3D0",
    onSecondaryContainer: "#022C22",
    tertiary: "#B45309",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#FDE68A",
    onTertiaryContainer: "#451A03",
    onSurface: "#1A1B20",
    onSurfaceVariant: "#44474E",
    surfaceDim: "#F5F6FA",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F3F4F9",
    surfaceContainer: "#EDEEF3",
    surfaceContainerHigh: "#E7E8EE",
    surfaceContainerHighest: "#E2E3E9",
    outlineVariant: "rgba(26, 27, 32, 0.16)",
  },
];

// ============================================================================
// EXHAUSTIVE STUDIO TAXONOMY DROPDOWN OPTIONS
// ============================================================================
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

export default function SwarmMuiStudioPage() {
  // M3 Dynamic Tonal Palette State
  const [schemeId, setSchemeId] = useState<string>("sapphire_emerald");
  const activeScheme = useMemo(
    () => M3_TONAL_SCHEMES.find((s) => s.id === schemeId) || M3_TONAL_SCHEMES[0],
    [schemeId]
  );

  const m3Theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: activeScheme.mode || "dark",
          primary: {
            main: activeScheme.primary,
            contrastText: activeScheme.onPrimary,
          },
          secondary: {
            main: activeScheme.secondary,
            contrastText: activeScheme.onSecondary,
          },
          text: {
            primary: activeScheme.onSurface,
            secondary: activeScheme.onSurfaceVariant,
          },
          background: {
            default: activeScheme.surfaceDim,
            paper: activeScheme.surfaceContainer,
          },
          divider: activeScheme.outlineVariant,
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily:
            '"Inter", "Roboto", "Google Sans", -apple-system, BlinkMacSystemFont, sans-serif',
          button: {
            textTransform: "none",
            fontWeight: 700,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                paddingLeft: 16,
                paddingRight: 16,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                borderRadius: 20,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [activeScheme]
  );

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

  // Live helper that syncs top dropdown choices directly into Act I & Act II prompt textboxes
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
        act1Prompt: draftAct1Prompt,
        act2Prompt: draftAct2Prompt,
      }),
    });
    const data = await res.json();
    if (res.ok && data.job) {
      setActiveJob(data.job);
    }
  }

  // Poll running job until completion
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

  // 60Hz Frame-Accurate Playback Engine
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
    <ThemeProvider theme={m3Theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: activeScheme.surfaceDim,
          color: activeScheme.onSurface,
          px: { xs: 2, md: 3.5 },
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* ===================================================================
            STEP ①: CONCEPT, CAST & TREND INPUTS (ZERO HORIZONTAL SCROLL OVERFLOW)
           =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: activeScheme.surfaceContainer,
            border: `1px solid ${activeScheme.outlineVariant}`,
            borderRadius: 4,
            p: 2,
          }}
        >
          {/* Header with Step ① Badge + M3 Dynamic Color Role Palette Switcher (No duplicate navbar links!) */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 1.8,
            }}
          >
            <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
              <Chip
                label="STEP ① • CONCEPT & CAST INPUTS"
                sx={{
                  bgcolor: activeScheme.primaryContainer,
                  color: activeScheme.onPrimaryContainer,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              />
              <Typography variant="body2" sx={{ color: activeScheme.onSurfaceVariant }}>
                Changing any dropdown below automatically live-syncs your Act I & Act II prompts
              </Typography>
            </Stack>

            <FormControl size="small" sx={{ minWidth: 235 }}>
              <InputLabel>
                <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                  <Palette sx={{ fontSize: 14 }} />
                  <span>M3 Dynamic Color Palette</span>
                </Stack>
              </InputLabel>
              <Select
                label="M3 Dynamic Color Palette"
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                sx={{
                  bgcolor: activeScheme.surfaceContainerHigh,
                  borderRadius: 3,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {M3_TONAL_SCHEMES.map((s) => (
                  <MenuItem key={s.id} value={s.id} sx={{ fontSize: 12 }}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Auto-Wrapping Responsive M3 Grid — 100% Visible Without Horizontal Scrollbars */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                md: "repeat(6, 1fr)",
              },
              gap: 1.2,
            }}
          >
            {/* 1. Country */}
            <FormControl size="small" fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                label="Country"
                value={trendCountry}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendCountry(val);
                  syncDropdownsIntoPrompts({ country: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: 12 }}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 2. Language */}
            <FormControl size="small" fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                label="Language"
                value={trendLanguage}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendLanguage(val);
                  syncDropdownsIntoPrompts({ language: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {LANGUAGES.map((l) => (
                  <MenuItem key={l} value={l} sx={{ fontSize: 12 }}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 3. Characters */}
            <FormControl size="small" fullWidth>
              <InputLabel>Characters / Cast</InputLabel>
              <Select
                label="Characters / Cast"
                value={trendCharacters}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendCharacters(val);
                  syncDropdownsIntoPrompts({ characters: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {CHARACTER_FORMATIONS.map((ch) => (
                  <MenuItem key={ch} value={ch} sx={{ fontSize: 12 }}>
                    {ch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 4. Duration (seconds) */}
            <TextField
              size="small"
              type="number"
              label="Duration (s)"
              value={trendDurationSec}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTrendDurationSec(val);
                syncDropdownsIntoPrompts({ durationSec: val });
              }}
              slotProps={{ htmlInput: { min: 10, max: 180, step: 10 } }}
              sx={{ bgcolor: activeScheme.surfaceContainerLowest }}
            />

            {/* 5. Attire (Act I) */}
            <FormControl size="small" fullWidth>
              <InputLabel>Attire (Act I)</InputLabel>
              <Select
                label="Attire (Act I)"
                value={trendAttire}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendAttire(val);
                  syncDropdownsIntoPrompts({ attire: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {EXHAUSTIVE_ATTIRES_ACT1.map((a) => (
                  <MenuItem key={a} value={a} sx={{ fontSize: 12 }}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 6. Wardrobe (Act II) */}
            <FormControl size="small" fullWidth>
              <InputLabel>Wardrobe (Act II)</InputLabel>
              <Select
                label="Wardrobe (Act II)"
                value={trendWardrobe}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendWardrobe(val);
                  syncDropdownsIntoPrompts({ wardrobe: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {EXHAUSTIVE_WARDROBES_ACT2.map((w) => (
                  <MenuItem key={w} value={w} sx={{ fontSize: 12 }}>
                    {w}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 7. Demography */}
            <FormControl size="small" fullWidth>
              <InputLabel>Demography</InputLabel>
              <Select
                label="Demography"
                value={trendDemography}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendDemography(val);
                  syncDropdownsIntoPrompts({ demography: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {DEMOGRAPHIES.map((d) => (
                  <MenuItem key={d} value={d} sx={{ fontSize: 12 }}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 8. Target Audience */}
            <FormControl size="small" fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                label="Target Audience"
                value={trendAudience}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendAudience(val);
                  syncDropdownsIntoPrompts({ audience: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {TARGET_AUDIENCES.map((ta) => (
                  <MenuItem key={ta} value={ta} sx={{ fontSize: 12 }}>
                    {ta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 9. Social Platform */}
            <FormControl size="small" fullWidth>
              <InputLabel>Social Platform</InputLabel>
              <Select
                label="Social Platform"
                value={trendPlatform}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrendPlatform(val);
                  syncDropdownsIntoPrompts({ platform: val });
                }}
                sx={{ bgcolor: activeScheme.surfaceContainerLowest, fontSize: 12 }}
              >
                {SOCIAL_PLATFORMS.map((sp) => (
                  <MenuItem key={sp} value={sp} sx={{ fontSize: 12 }}>
                    {sp}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 10. Generate 10 Ideas M3 Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate10TrendingIdeas}
              disabled={isGeneratingIdeas}
              startIcon={<AutoAwesome />}
              sx={{ fontWeight: 800 }}
            >
              {isGeneratingIdeas ? "Generating..." : "Generate 10 Ideas"}
            </Button>

            {/* 11. Generated Ideas Dropdown (Spans 2 columns on desktop so titles are clearly readable) */}
            <FormControl
              size="small"
              fullWidth
              sx={{ gridColumn: { xs: "span 2", md: "span 2" } }}
            >
              <InputLabel>Select Trending AI Treatment (1–10)</InputLabel>
              <Select
                label="Select Trending AI Treatment (1–10)"
                value={selectedIdeaId}
                onChange={(e) => selectIdeaById(e.target.value)}
                sx={{
                  bgcolor: activeScheme.surfaceContainerHigh,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {trendingIdeas.map((idea, i) => (
                  <MenuItem key={idea.id} value={idea.id} sx={{ fontSize: 12 }}>
                    #{i + 1} • {idea.title} ({idea.bpm} BPM)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* ===================================================================
            STEP ②: DIRECTOR SCRIPT EDITOR, LIVE 6-STAGE TRACKER & LAUNCH SHOOT
           =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: activeScheme.surfaceContainer,
            border: `1px solid ${activeScheme.outlineVariant}`,
            borderRadius: 4,
            p: 2.5,
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Chip
                label="STEP ② • DIRECTOR SCRIPT & SHOOT"
                sx={{
                  bgcolor: activeScheme.secondaryContainer,
                  color: activeScheme.onSecondaryContainer,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {projectTitle}
              </Typography>
              <Chip
                size="small"
                color={promptsSyncedBadge ? "secondary" : "default"}
                icon={<Sync sx={{ fontSize: 14 }} />}
                label={
                  promptsSyncedBadge
                    ? "Synced with Top Dropdowns"
                    : "Custom Director Prompt Edits"
                }
                sx={{ fontSize: 11, fontFamily: "monospace" }}
              />
              {!promptsSyncedBadge && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => syncDropdownsIntoPrompts()}
                  startIcon={<Sync />}
                >
                  Re-Sync from Dropdowns
                </Button>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => setShowScriptEditor((s) => !s)}
                endIcon={showScriptEditor ? <ExpandLess /> : <ExpandMore />}
              >
                {showScriptEditor ? "Collapse Script" : "Expand Script"}
              </Button>
            </Stack>

            <Button
              component="a"
              href={combinedSrc}
              download="Master_B_v2_Director_Cut.mp4"
              variant="contained"
              color="secondary"
              startIcon={<Download />}
            >
              Export Master MP4
            </Button>
          </Stack>

          <Collapse in={showScriptEditor}>
            <Box
              component="form"
              onSubmit={handleCreateJob}
              sx={{ mt: 2, pt: 2, borderTop: `1px solid ${activeScheme.outlineVariant}` }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  label={`ACT I PROMPT (PART 1 • ${Math.round(
                    trendDurationSec / 2
                  )}s) • ATTIRE: ${trendAttire}`}
                  value={draftAct1Prompt}
                  onChange={(e) => {
                    setDraftAct1Prompt(e.target.value);
                    setPromptsSyncedBadge(false);
                  }}
                  sx={{ bgcolor: activeScheme.surfaceContainerLowest }}
                />
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  label={`ACT II PROMPT (PART 2 • SAME LEAD FACE LOCK) • WARDROBE: ${trendWardrobe}`}
                  value={draftAct2Prompt}
                  onChange={(e) => {
                    setDraftAct2Prompt(e.target.value);
                    setPromptsSyncedBadge(false);
                  }}
                  sx={{ bgcolor: activeScheme.surfaceContainerLowest }}
                />
              </Box>

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mt: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  Target: <b>{trendDemography}</b> • <b>{trendAudience}</b> on{" "}
                  <b style={{ color: activeScheme.secondary }}>{trendPlatform}</b> (
                  {trendDurationSec}s total)
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={activeJob?.status === "running"}
                  startIcon={<MovieCreation />}
                >
                  {activeJob?.status === "running"
                    ? "Generating Live with Gemini Omni 1.1 Flash..."
                    : "Submit & Launch Production Shoot"}
                </Button>
              </Stack>
            </Box>
          </Collapse>

          {/* 6-STAGE VISUAL PIPELINE STEPPER WHEN JOB IS RUNNING / COMPLETED */}
          {activeJob && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 3,
                bgcolor: activeScheme.surfaceContainerLowest,
                border: `1px solid ${activeScheme.outlineVariant}`,
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.2 }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "monospace" }}>
                  {activeJob.stageLabel}
                </Typography>
                <Chip
                  size="small"
                  color={activeJob.status === "completed" ? "secondary" : "primary"}
                  label={`${activeJob.progress}% Complete`}
                  sx={{ fontFamily: "monospace", fontWeight: 800 }}
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={activeJob.progress}
                sx={{ height: 8, borderRadius: 4, mb: 1.8 }}
              />

              {/* Visual 6-Stage Stepper Pills */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(6, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {PIPELINE_STEPS.map((st, idx) => {
                  const prevThreshold = idx === 0 ? 0 : PIPELINE_STEPS[idx - 1].threshold;
                  const isDone = activeJob.progress >= st.threshold;
                  const isCurrent =
                    !isDone && activeJob.progress >= prevThreshold && activeJob.status === "running";
                  return (
                    <Paper
                      key={st.id}
                      elevation={0}
                      sx={{
                        p: 1,
                        borderRadius: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        bgcolor: isDone
                          ? activeScheme.secondaryContainer
                          : isCurrent
                          ? activeScheme.primaryContainer
                          : activeScheme.surfaceContainer,
                        border: `1px solid ${activeScheme.outlineVariant}`,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle sx={{ fontSize: 15, color: activeScheme.secondary }} />
                      ) : isCurrent ? (
                        <RadioButtonChecked sx={{ fontSize: 15, color: activeScheme.primary }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ fontSize: 15, color: "#64748B" }} />
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                        {st.id}. {st.label}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}
        </Paper>

        {/* ===================================================================
            STEP ③: MASTER MONITOR, TEMPO RACK, CHILD CLIPS & UNIFIED SPLICER
           =================================================================== */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "340px 1fr" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          {/* LEFT RAIL: CLEAN SPEED & TEMPO RACK (NO DUPLICATE START/END TRIMMERS) */}
          <Stack spacing={2}>
            {/* ACT I SPEED CARD */}
            <Card
              elevation={0}
              sx={{
                bgcolor:
                  selectedActIndex === 1
                    ? activeScheme.surfaceContainerHigh
                    : activeScheme.surfaceContainer,
                border: `1px solid ${
                  selectedActIndex === 1
                    ? activeScheme.primary
                    : activeScheme.outlineVariant
                }`,
              }}
            >
              <CardActionArea onClick={() => setSelectedActIndex(1)} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Chip
                    size="small"
                    label="ACT I • 00:00 → 00:30"
                    sx={{
                      bgcolor: activeScheme.primaryContainer,
                      color: activeScheme.onPrimaryContainer,
                      fontFamily: "monospace",
                      fontWeight: 800,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                    Eff: {p1EffDur.toFixed(2)}s
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1 }}>
                  Sunlit Cliffside Pool Villa
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trendAttire}
                </Typography>
              </CardActionArea>

              <Divider />

              <CardContent sx={{ pt: 1.5 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Part 1 Speed Multiplier
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setP1Speed(part1Speed - 0.01)}
                      sx={{ minWidth: 30, px: 0.5 }}
                    >
                      -
                    </Button>
                    <Chip
                      size="small"
                      label={`${part1Speed.toFixed(2)}x`}
                      color="primary"
                      sx={{ fontFamily: "monospace", fontWeight: 800 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setP1Speed(part1Speed + 0.01)}
                      sx={{ minWidth: 30, px: 0.5 }}
                    >
                      +
                    </Button>
                  </Stack>
                </Stack>

                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  value={part1Speed}
                  onChange={(_, val) => setP1Speed(val as number)}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>

            {/* ACT II SPEED CARD */}
            <Card
              elevation={0}
              sx={{
                bgcolor:
                  selectedActIndex === 2
                    ? activeScheme.surfaceContainerHigh
                    : activeScheme.surfaceContainer,
                border: `1px solid ${
                  selectedActIndex === 2
                    ? activeScheme.secondary
                    : activeScheme.outlineVariant
                }`,
              }}
            >
              <CardActionArea onClick={() => setSelectedActIndex(2)} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Chip
                    size="small"
                    label="ACT II • 00:30 → 01:00"
                    sx={{
                      bgcolor: activeScheme.secondaryContainer,
                      color: activeScheme.onSecondaryContainer,
                      fontFamily: "monospace",
                      fontWeight: 800,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                    Eff: {p2EffDur.toFixed(2)}s
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1 }}>
                  Twilight Luxury Superyacht Deck
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trendWardrobe}
                </Typography>
              </CardActionArea>

              <Divider />

              <CardContent sx={{ pt: 1.5 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Part 2 Speed Multiplier
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => setP2Speed(part2Speed - 0.01)}
                      sx={{ minWidth: 30, px: 0.5 }}
                    >
                      -
                    </Button>
                    <Chip
                      size="small"
                      label={`${part2Speed.toFixed(2)}x`}
                      color="secondary"
                      sx={{ fontFamily: "monospace", fontWeight: 800 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => setP2Speed(part2Speed + 0.01)}
                      sx={{ minWidth: 30, px: 0.5 }}
                    >
                      +
                    </Button>
                  </Stack>
                </Stack>

                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.01}
                  value={part2Speed}
                  onChange={(_, val) => setP2Speed(val as number)}
                  color="secondary"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>

            {/* DIRECTOR TEMPO & MASTER BAKE CARD */}
            <Card
              elevation={0}
              sx={{
                bgcolor: activeScheme.surfaceContainer,
                border: `1px solid ${activeScheme.outlineVariant}`,
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, fontFamily: "monospace", display: "block", mb: 1.5 }}
                >
                  DIRECTOR TEMPO PRESETS & MASTER BAKE
                </Typography>

                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setPart1Speed(1.1);
                      setPart2Speed(0.9);
                    }}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <span>⚡ Dynamic Contrast Cut</span>
                    <code>1.10x → 0.90x</code>
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={resetAllEdits}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <span>🎬 Studio Reference Lock</span>
                    <code>1.00x → 1.00x</code>
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isExporting}
                    onClick={handleRenderCustomMaster}
                    startIcon={<Tune />}
                    sx={{ mt: 1 }}
                  >
                    {isExporting
                      ? "Rendering Broadcast Master..."
                      : "Render & Master Custom Cut MP4"}
                  </Button>
                  {exportNotice && (
                    <Alert severity="success" sx={{ fontSize: 11 }}>
                      {exportNotice}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* CENTER STAGE: STEP ③ MAIN COMBINED REEL + TRANSPORT + UNIFIED SPLICER DRAWER */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: activeScheme.surfaceContainer,
              border: `1px solid ${activeScheme.outlineVariant}`,
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* SMPTE TIMECODE & TELEMETRY STRIP */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: activeScheme.surfaceContainerLowest,
                border: `1px solid ${activeScheme.outlineVariant}`,
                borderRadius: 3,
                px: 2,
                py: 1.2,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Chip
                  size="small"
                  label="STEP ③ • MASTER MONITOR"
                  color="primary"
                  sx={{ fontFamily: "monospace", fontWeight: 800 }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: "monospace" }}>
                  TC {formatSMPTE(combinedTime)}
                </Typography>
                <Chip
                  size="small"
                  label={isInPart1 ? "ACT I • POOL VILLA" : "ACT II • SUPERYACHT"}
                  color={isInPart1 ? "primary" : "secondary"}
                  sx={{ fontFamily: "monospace", fontWeight: 800 }}
                />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  Active Speed: <b>{domRate.toFixed(2)}x</b> ({(24 * domRate).toFixed(1)}{" "}
                  fps)
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  Total Runtime: <b>{totalEffDur.toFixed(2)}s</b>
                </Typography>
              </Stack>
            </Paper>

            {/* MAIN COMBINED REEL CARD */}
            <Card
              elevation={0}
              sx={{
                bgcolor: activeScheme.surfaceContainerLow,
                border: `1px solid ${activeScheme.outlineVariant}`,
                p: 2,
              }}
            >
              <Box
                onClick={() => setShowChildReelsDrawer((prev) => !prev)}
                sx={{
                  cursor: "pointer",
                  p: 1.5,
                  borderRadius: 3,
                  mb: 1.5,
                  bgcolor: activeScheme.surfaceContainerHigh,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      label="ZYV-REEL-MBV260S1"
                      color="secondary"
                      sx={{ fontFamily: "monospace", fontWeight: 800 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      MAIN COMBINED REEL (60.0s MASTER)
                    </Typography>
                    <Typography
                      component={Link}
                      href="/entity/ZYV-REEL-MBV260S1"
                      onClick={(e) => e.stopPropagation()}
                      variant="caption"
                      fontFamily="monospace"
                      sx={{ color: activeScheme.primary, textDecoration: "underline" }}
                    >
                      /entity/ZYV-REEL-MBV260S1
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Button
                      variant={showSplicerStudio ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      startIcon={<ContentCut />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSplicerStudio((prev) => !prev);
                      }}
                    >
                      {showSplicerStudio ? "Hide Trim & Splice Studio" : "Trim & Splice Studio"}
                    </Button>

                    <Button
                      variant="contained"
                      color={showChildReelsDrawer ? "primary" : "secondary"}
                      size="small"
                      endIcon={showChildReelsDrawer ? <ExpandLess /> : <ExpandMore />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowChildReelsDrawer((prev) => !prev);
                      }}
                    >
                      {showChildReelsDrawer
                        ? "Hide Child Reels & Clips (6)"
                        : "Expand Child Reels & Clips (6)"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              {/* SINGLE MAIN COMBINED VIDEO MONITOR */}
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  bgcolor: "#000",
                  border: `1px solid ${activeScheme.outlineVariant}`,
                  aspectRatio: "9/16",
                  maxHeight: 540,
                  maxWidth: 340,
                  mx: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
                  style={{ ...videoTransform, width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>

              {/* UNIFIED COLLAPSIBLE TRIM & SPLICE STUDIO (REPLACES THE 3 SCATTERED TRIMMERS) */}
              <Collapse in={showSplicerStudio}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: activeScheme.surfaceContainerLowest,
                    border: `1px solid ${activeScheme.outlineVariant}`,
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      ✂️ Unified Sub-Clip Trim & Multi-Clip Splicer Studio
                    </Typography>
                    <Tabs
                      value={splicerTabIndex}
                      onChange={(_, val) => setSplicerTabIndex(val)}
                      textColor="primary"
                      indicatorColor="primary"
                    >
                      <Tab label="Single Clip Quick Cut" sx={{ fontSize: 12 }} />
                      <Tab label="Multi-Clip Splicer Timeline" sx={{ fontSize: 12 }} />
                    </Tabs>
                  </Stack>

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
                </Paper>
              </Collapse>

              {/* M3 SPRING COLLAPSE DRAWER FOR CHILD REELS & CLIPS */}
              <Collapse in={showChildReelsDrawer}>
                <Box
                  sx={{
                    mt: 3,
                    pt: 2.5,
                    borderTop: `1px solid ${activeScheme.outlineVariant}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, fontFamily: "monospace", mb: 2, color: activeScheme.primary }}
                  >
                    ↳ EXPANDED CHILD REELS (30s ACTS) & NATIVE TURN CLIPS (10s / 20s)
                  </Typography>

                  {/* 2 CHILD ACT REELS */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {[
                      {
                        entityId: "ZYV-CLIP-ACT130S1",
                        clipCode: "CLP-ACT01-MASTER30S",
                        title: "Act I Master Reel (30.0s Pool Villa)",
                        src: segments[0].src,
                      },
                      {
                        entityId: "ZYV-CLIP-ACT230S2",
                        clipCode: "CLP-ACT02-MASTER30S",
                        title: "Act II Master Reel (30.0s Superyacht)",
                        src: segments[1].src,
                      },
                    ].map((act) => (
                      <Card
                        key={act.entityId}
                        elevation={0}
                        sx={{
                          bgcolor: activeScheme.surfaceContainerHigh,
                          border: `1px solid ${activeScheme.outlineVariant}`,
                          p: 2,
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            size="small"
                            label={act.entityId}
                            color="primary"
                            sx={{ fontFamily: "monospace", fontWeight: 800 }}
                          />
                          <Typography
                            component={Link}
                            href={`/entity/${act.entityId}`}
                            variant="caption"
                            sx={{ fontFamily: "monospace", color: activeScheme.secondary }}
                          >
                            /entity/{act.entityId}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            bgcolor: "#000",
                            aspectRatio: "9/16",
                            maxHeight: 340,
                            mx: "auto",
                          }}
                        >
                          <video
                            src={act.src}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </Box>
                        <InlineClipTrimmer
                          clipId={act.clipCode}
                          label={act.title}
                          src={act.src}
                          maxDurationSec={30}
                          onAddToQueue={(seg) => {
                            setSpliceQueue((prev) => [...prev, seg]);
                            setShowSplicerStudio(true);
                            setSplicerTabIndex(1);
                          }}
                        />
                      </Card>
                    ))}
                  </Box>

                  {/* 4 CHILD TURN CLIPS */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        lg: "repeat(4, 1fr)",
                      },
                      gap: 2,
                      mt: 2,
                    }}
                  >
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
                      <Card
                        key={clip.id}
                        elevation={0}
                        sx={{
                          bgcolor: activeScheme.surfaceContainerHigh,
                          border: `1px solid ${activeScheme.outlineVariant}`,
                          p: 1.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Chip
                            size="small"
                            label={clip.id}
                            sx={{ fontFamily: "monospace", fontSize: 10, fontWeight: 800 }}
                          />
                          <Typography
                            component={Link}
                            href={`/entity/${clip.id}`}
                            variant="caption"
                            sx={{ fontFamily: "monospace", color: activeScheme.secondary, fontSize: 10 }}
                          >
                            /entity/{clip.id}
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "#000",
                            aspectRatio: "9/16",
                            maxHeight: 240,
                            mx: "auto",
                          }}
                        >
                          <video
                            src={clip.src}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </Box>
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
                      </Card>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Card>

            {/* M3 QUICKTIME PRO TRANSPORT & TIMELINE SCRUBBER */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: activeScheme.surfaceContainerLowest,
                border: `1px solid ${activeScheme.outlineVariant}`,
                borderRadius: 4,
                p: 2,
              }}
            >
              <Slider
                min={0}
                max={60}
                step={0.04}
                value={combinedTime}
                onChange={(_, val) => seekCombined(val as number)}
                color={isInPart1 ? "primary" : "secondary"}
              />

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <ButtonGroup variant="outlined" size="small">
                  <Button onClick={() => seekCombined(0, true)} startIcon={<SkipPrevious />}>
                    00:00
                  </Button>
                  <Button onClick={() => stepFrame(-1)} startIcon={<FastRewind />}>
                    -1f
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={togglePlay}
                    startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  >
                    {isPlaying ? "Pause" : "Play Master"}
                  </Button>
                  <Button onClick={() => stepFrame(1)} endIcon={<FastForward />}>
                    +1f
                  </Button>
                  <Button onClick={() => seekCombined(28.0, true)}>
                    Audition 00:30 Cut
                  </Button>
                </ButtonGroup>

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setRotationDeg((d) => (d + 90) % 360)}
                    startIcon={<RotateRight />}
                  >
                    Rotate 90°
                  </Button>
                  <Button
                    size="small"
                    variant={flipH ? "contained" : "outlined"}
                    onClick={() => setFlipH((f) => !f)}
                    startIcon={<Flip />}
                  >
                    Mirror
                  </Button>
                  <Button
                    size="small"
                    variant={preservesPitch ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setPreservesPitch((p) => !p)}
                    startIcon={<GraphicEq />}
                  >
                    Pitch Lock: {preservesPitch ? "ON" : "OFF"}
                  </Button>
                  <Button
                    size="small"
                    variant={loopPlayback ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setLoopPlayback((l) => !l)}
                    startIcon={<Loop />}
                  >
                    Loop: {loopPlayback ? "ON" : "OFF"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
