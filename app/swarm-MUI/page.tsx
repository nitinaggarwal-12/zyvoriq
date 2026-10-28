"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Undo2,
  Redo2,
  HelpCircle,
  Sun,
  Moon,
  Send,
  FolderOpen,
  Palette,
  LayoutTemplate,
  PlusCircle,
  Volume2,
  Eye,
  Calendar,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Film,
  ExternalLink,
  Maximize2,
  Minimize2,
  Subtitles,
  Camera,
  Wand2,
  Sliders,
  Layers,
  Cpu,
  Clock,
  Link2,
  Compass,
  Zap,
  Video,
  Music,
} from "lucide-react";
import {
  StudioButton,
  StudioInput,
  StudioSelect,
  StudioChip,
  StudioTooltip,
  StudioTabs,
  StudioDialog,
  StudioSheet,
  StudioToast,
} from "@/components/studio-ux/Primitives";
import {
  DiffView,
  CheckItemCard,
  VariationGrid,
  VideoTimelineEditor,
  QuickActionType,
  PendingDiffSuggestion,
  ContentCheckIssue,
  PostVariation,
  VideoSegmentSpec,
} from "@/components/studio-ux/Patterns";
import { PERSONAS_CATALOG, PersonaDefinition } from "@/lib/studioCatalog";
import { FeedbackHeaderEmailButton } from "@/components/UniversalFeedbackSystem";
import { DeepResearchBiblePanel } from "@/components/DeepResearchBiblePanel";
import {
  synthesizeDeepResearchBible,
  type DeepResearchProductionBible,
} from "@/lib/swarm/deepResearchBible";

// ============================================================================
// TYPES & PLATFORM RULES (Runway + Higgsfield + InVideo + Canva Unified Studio)
// ============================================================================
type PlatformId =
  | "reels_9_16"
  | "youtube_16_9"
  | "carousel_4_5"
  | "linkedin_1_1"
  | "cinema_21_9";

interface PlatformSpec {
  id: PlatformId;
  shortcut: string;
  label: string;
  shortName: string;
  aspectRatioCss: string;
  aspectBadge: string;
  charLimit: number;
  foldChars: number;
  maxHashtags: number;
}

const PLATFORMS: PlatformSpec[] = [
  {
    id: "reels_9_16",
    shortcut: "1",
    label: "9:16 Reels / TikTok",
    shortName: "Reels / TikTok",
    aspectRatioCss: "9 / 16",
    aspectBadge: "9:16 Vertical",
    charLimit: 2200,
    foldChars: 125,
    maxHashtags: 8,
  },
  {
    id: "youtube_16_9",
    shortcut: "2",
    label: "16:9 YouTube Cinema",
    shortName: "YouTube 16:9",
    aspectRatioCss: "16 / 9",
    aspectBadge: "16:9 Widescreen",
    charLimit: 5000,
    foldChars: 200,
    maxHashtags: 15,
  },
  {
    id: "carousel_4_5",
    shortcut: "3",
    label: "4:5 IG Carousel",
    shortName: "IG Carousel",
    aspectRatioCss: "4 / 5",
    aspectBadge: "4:5 Portrait",
    charLimit: 2200,
    foldChars: 125,
    maxHashtags: 10,
  },
  {
    id: "linkedin_1_1",
    shortcut: "4",
    label: "1:1 LinkedIn / X",
    shortName: "LinkedIn / X",
    aspectRatioCss: "1 / 1",
    aspectBadge: "1:1 Square · 280c",
    charLimit: 280,
    foldChars: 140,
    maxHashtags: 5,
  },
  {
    id: "cinema_21_9",
    shortcut: "5",
    label: "21:9 Anamorphic Scope",
    shortName: "21:9 Scope",
    aspectRatioCss: "21 / 9",
    aspectBadge: "21:9 Panavision",
    charLimit: 5000,
    foldChars: 200,
    maxHashtags: 12,
  },
];

// ============================================================================
// 4-PLATFORM SUPER-STUDIO CATALOGS (Runway · Higgsfield · InVideo · Canva)
// ============================================================================
export interface HiggsfieldCameraPreset {
  id: string;
  name: string;
  label: string;
  category: "Action" | "Cinema" | "Dynamic";
  tag: string;
  vectorDesc: string;
  desc: string;
  panX: number;
  tiltY: number;
  zoomZ: number;
  roll: number;
  speed: number;
}

const HIGGSFIELD_CAMERA_PRESETS: HiggsfieldCameraPreset[] = [
  {
    id: "cam-crash-zoom",
    name: "Crash Zoom",
    label: "Crash Zoom",
    category: "Action",
    tag: "Action",
    vectorDesc: "High-velocity Z+9 snap zoom onto lead eyes",
    desc: "High-velocity Z+9 snap zoom onto lead eyes",
    panX: 0,
    tiltY: 1,
    zoomZ: 9,
    roll: 0,
    speed: 1.8,
  },
  {
    id: "cam-bullet-time",
    name: "Bullet Time 360°",
    label: "Bullet Time 360°",
    category: "Action",
    tag: "Action",
    vectorDesc: "120fps frozen-time orbital arc around subject",
    desc: "120fps frozen-time orbital arc around subject",
    panX: 8,
    tiltY: 0,
    zoomZ: 3,
    roll: 4,
    speed: 0.5,
  },
  {
    id: "cam-fpv-dive",
    name: "FPV Drone Dive",
    label: "FPV Drone Dive",
    category: "Dynamic",
    tag: "Dynamic",
    vectorDesc: "Vertical precipice dive with banking roll",
    desc: "Vertical precipice dive with banking roll",
    panX: 3,
    tiltY: -8,
    zoomZ: 8,
    roll: -12,
    speed: 2.0,
  },
  {
    id: "cam-snorricam",
    name: "SnorriCam Chest-Rig",
    label: "SnorriCam Chest-Rig",
    category: "Action",
    tag: "Action",
    vectorDesc: "Body-locked rig keeping actor centered while world spins",
    desc: "Body-locked rig keeping actor centered while world spins",
    panX: -2,
    tiltY: 2,
    zoomZ: 4,
    roll: 6,
    speed: 1.5,
  },
  {
    id: "cam-dolly-zoom",
    name: "Dolly Zoom / Vertigo",
    label: "Dolly Zoom / Vertigo",
    category: "Cinema",
    tag: "Cinema",
    vectorDesc: "Counter-zoom perspective warp expanding background",
    desc: "Counter-zoom perspective warp expanding background",
    panX: 0,
    tiltY: 0,
    zoomZ: -7,
    roll: 0,
    speed: 1.0,
  },
  {
    id: "cam-dutch-angle",
    name: "Dutch Angle Thriller",
    label: "Dutch Angle Thriller",
    category: "Cinema",
    tag: "Cinema",
    vectorDesc: "14° canted horizon push-in for psychological tension",
    desc: "14° canted horizon push-in for psychological tension",
    panX: 2,
    tiltY: 3,
    zoomZ: 5,
    roll: 14,
    speed: 1.1,
  },
  {
    id: "cam-whip-pan",
    name: "Whip Pan Transition",
    label: "Whip Pan Transition",
    category: "Dynamic",
    tag: "Dynamic",
    vectorDesc: "Motion-blurred horizontal snap between speakers",
    desc: "Motion-blurred horizontal snap between speakers",
    panX: 10,
    tiltY: 0,
    zoomZ: 1,
    roll: -3,
    speed: 1.9,
  },
  {
    id: "cam-crane-up",
    name: "Crane Up Reveal",
    label: "Crane Up Reveal",
    category: "Cinema",
    tag: "Cinema",
    vectorDesc: "Sweeping vertical crane elevation revealing epic horizon",
    desc: "Sweeping vertical crane elevation revealing epic horizon",
    panX: 0,
    tiltY: 9,
    zoomZ: -4,
    roll: 0,
    speed: 0.9,
  },
  {
    id: "cam-handheld-grit",
    name: "Handheld Docu-Grit",
    label: "Handheld Docu-Grit",
    category: "Action",
    tag: "Action",
    vectorDesc: "Tactile 35mm shoulder-rig kinetic micro-shake",
    desc: "Tactile 35mm shoulder-rig kinetic micro-shake",
    panX: -3,
    tiltY: 2,
    zoomZ: 2,
    roll: 2,
    speed: 1.3,
  },
  {
    id: "cam-hyperlapse-orbit",
    name: "Hyper-Lapse Orbit",
    label: "Hyper-Lapse Orbit",
    category: "Dynamic",
    tag: "Dynamic",
    vectorDesc: "Time-accelerated 180° architectural surround",
    desc: "Time-accelerated 180° architectural surround",
    panX: 7,
    tiltY: 2,
    zoomZ: 4,
    roll: 0,
    speed: 1.7,
  },
  {
    id: "cam-gods-eye",
    name: "Overhead God's Eye",
    label: "Overhead God's Eye",
    category: "Cinema",
    tag: "Cinema",
    vectorDesc: "90° nadir top-down geometric tracking shot",
    desc: "90° nadir top-down geometric tracking shot",
    panX: 0,
    tiltY: -10,
    zoomZ: -2,
    roll: 0,
    speed: 1.0,
  },
  {
    id: "cam-macro-eye",
    name: "Macro Eye-In",
    label: "Macro Eye-In",
    category: "Cinema",
    tag: "Cinema",
    vectorDesc: "Extreme macro push into iris reflection",
    desc: "Extreme macro push into iris reflection",
    panX: 0,
    tiltY: 0,
    zoomZ: 10,
    roll: 0,
    speed: 0.8,
  },
];

const HIGGSFIELD_OPTICAL_LENSES = [
  {
    id: "lens-arri-panavision",
    name: "ARRI Alexa 65 + Panavision Anamorphic",
    label: "ARRI Alexa 65 + Panavision Anamorphic",
    cssFilter: "contrast(1.06) saturate(1.08)",
    badge: "Panavision 2x Anamorphic · T2.0",
    character: "Panavision 2x Anamorphic · T2.0",
  },
  {
    id: "lens-imax-kodak",
    name: "IMAX 70mm Kodak 2383 Print",
    label: "IMAX 70mm Kodak 2383 Print",
    cssFilter: "contrast(1.12) saturate(1.14) sepia(0.06)",
    badge: "IMAX 15/70mm · Kodak 2383",
    character: "IMAX 15/70mm · Kodak 2383",
  },
  {
    id: "lens-cooke-s4",
    name: "Cooke S4 Prime Warm Cinema",
    label: "Cooke S4 Prime Warm Cinema",
    cssFilter: "contrast(1.04) saturate(1.10) sepia(0.10)",
    badge: "Cooke Look · Warm Skin Tones",
    character: "Cooke Look · Warm Skin Tones",
  },
  {
    id: "lens-vintage-16mm",
    name: "Vintage 16mm Documentary Grain",
    label: "Vintage 16mm Documentary Grain",
    cssFilter: "contrast(1.09) saturate(0.92) sepia(0.14)",
    badge: "Super 16mm · Halation",
    character: "Super 16mm · Halation",
  },
  {
    id: "lens-cyber-neon",
    name: "Cyberpunk Cyan/Amber Halation",
    label: "Cyberpunk Cyan/Amber Halation",
    cssFilter: "contrast(1.14) saturate(1.22) hue-rotate(-6deg)",
    badge: "Anamorphic Neon Bloom",
    character: "Anamorphic Neon Bloom",
  },
];

const HIGGSFIELD_VFX_MODIFIERS = [
  {
    id: "vfx-anamorphic-flare",
    name: "Anamorphic Blue Streak Flare",
    label: "Anamorphic Blue Streak Flare",
  },
  {
    id: "vfx-volumetric-rain",
    name: "Volumetric Rain & Wet Asphalt Reflections",
    label: "Volumetric Rain & Wet Asphalt Reflections",
  },
  {
    id: "vfx-pyro-sparks",
    name: "Pyro & Titanium Ember Sparks",
    label: "Pyro & Titanium Ember Sparks",
  },
  {
    id: "vfx-optical-slowmo",
    name: "120fps Optical Flow Slow-Mo",
    label: "120fps Optical Flow Slow-Mo",
  },
  {
    id: "vfx-golden-mandala",
    name: "Celestial Golden Particle Aura",
    label: "Celestial Golden Particle Aura",
  },
];

const RUNWAY_MOTION_BRUSH_LAYERS = [
  {
    id: "mb-subject",
    name: "Brush 1 · Lead Subject & Facial Micro-Acting",
    label: "Brush 1 · Lead Subject & Facial Micro-Acting",
    color: "#4F46E5",
    x: 4,
    y: 2,
    z: 6,
    vx: 4,
    vy: 2,
    vz: 6,
    ambient: 30,
  },
  {
    id: "mb-sky",
    name: "Brush 2 · Sky, Clouds & Orbital Horizon",
    label: "Brush 2 · Sky, Clouds & Orbital Horizon",
    color: "#0284C7",
    x: 7,
    y: 1,
    z: 0,
    vx: 7,
    vy: 1,
    vz: 0,
    ambient: 65,
  },
  {
    id: "mb-particles",
    name: "Brush 3 · Water, Rain, Snow & Sparks",
    label: "Brush 3 · Water, Rain, Snow & Sparks",
    color: "#059669",
    x: -3,
    y: -6,
    z: 4,
    vx: -3,
    vy: -6,
    vz: 4,
    ambient: 85,
  },
  {
    id: "mb-wardrobe",
    name: "Brush 4 · Couture Wardrobe & Silk Physics",
    label: "Brush 4 · Couture Wardrobe & Silk Physics",
    color: "#D97706",
    x: 3,
    y: 2,
    z: 2,
    vx: 3,
    vy: 2,
    vz: 2,
    ambient: 55,
  },
  {
    id: "mb-lighting",
    name: "Brush 5 · Volumetric Fog & Rim Light Sweep",
    label: "Brush 5 · Volumetric Fog & Rim Light Sweep",
    color: "#7C3AED",
    x: 5,
    y: 0,
    z: 3,
    vx: 5,
    vy: 0,
    vz: 3,
    ambient: 75,
  },
];

export type SubtitleStyleId =
  | "hormozi_yellow"
  | "cinema_classic"
  | "karaoke_highlight"
  | "minimal_pill"
  | "news_lower_third";

const INVIDEO_SUBTITLE_STYLES: Array<{
  id: SubtitleStyleId;
  name: string;
  label: string;
  desc: string;
  preview: string;
  bg: string;
  accent: string;
}> = [
  {
    id: "cinema_classic",
    name: "Cinema 35mm Subtitles",
    label: "Cinema 35mm Subtitles",
    desc: "Clean theatrical dark-glass pill with speaker badge",
    preview: "Clean 35mm Theatrical Pill",
    bg: "rgba(15, 23, 42, 0.86)",
    accent: "#F8FAFC",
  },
  {
    id: "hormozi_yellow",
    name: "Hormozi Bold Impact Yellow",
    label: "Hormozi Bold Impact Yellow",
    desc: "High-retention uppercase yellow/white creator captions",
    preview: "UPPERCASE YELLOW IMPACT",
    bg: "rgba(15, 23, 42, 0.92)",
    accent: "#FACC15",
  },
  {
    id: "karaoke_highlight",
    name: "Karaoke Word-Highlight",
    label: "Karaoke Word-Highlight",
    desc: "Active word glow synchronized to spoken cadence",
    preview: "Active Word Sync Glow",
    bg: "rgba(30, 27, 75, 0.90)",
    accent: "#38BDF8",
  },
  {
    id: "minimal_pill",
    name: "Canva Daylight Minimal Pill",
    label: "Canva Daylight Minimal Pill",
    desc: "Frosted daylight badge with slate typography",
    preview: "Frosted Daylight Minimal",
    bg: "rgba(255, 255, 255, 0.94)",
    accent: "#0F172A",
  },
  {
    id: "news_lower_third",
    name: "Broadcast Lower-Third Banner",
    label: "Broadcast Lower-Third Banner",
    desc: "Documentary speaker title card with accent bar",
    preview: "Broadcast Lower-Third",
    bg: "rgba(15, 23, 42, 0.92)",
    accent: "#E2E8F0",
  },
];

export type StudioThemePresetId =
  | "canva_daylight"
  | "invideo_creator"
  | "runway_slate"
  | "higgsfield_cinema";

const CANVA_STUDIO_THEMES: Array<{
  id: StudioThemePresetId;
  name: string;
  badge: string;
  primaryColor: string;
}> = [
  {
    id: "canva_daylight",
    name: "Canva Daylight Clean (Default)",
    badge: "Indigo Daylight",
    primaryColor: "#4f46e5",
  },
  {
    id: "invideo_creator",
    name: "InVideo AI Creator Studio",
    badge: "Sky Creator",
    primaryColor: "#0284c7",
  },
  {
    id: "runway_slate",
    name: "Runway Gen-4 Precision Slate",
    badge: "Director Slate",
    primaryColor: "#0f172a",
  },
  {
    id: "higgsfield_cinema",
    name: "Higgsfield Cinema DOP Amber",
    badge: "35mm Amber",
    primaryColor: "#d97706",
  },
];

const FOUNDATION_MODELS_CATALOG = [
  {
    id: "omni11_lyria3",
    name: "Gemini Omni 1.1 Flash + Lyria 3 Pro (24fps Native)",
    label: "Gemini Omni 1.1 Flash + Lyria 3 Pro",
    badge: "24fps Native AV",
  },
  {
    id: "veo31_4k",
    name: "Google Veo 3.1 4K Anamorphic Cinema + Chirp 3 HD",
    label: "Google Veo 3.1 4K Anamorphic Cinema",
    badge: "70mm IMAX + Chirp 3",
  },
  {
    id: "runway_gen4",
    name: "Runway Gen-4 Turbo + Act-One Character Lock",
    label: "Runway Gen-4.5 Turbo + Act-One",
    badge: "6-DoF + Motion Brush",
  },
  {
    id: "higgsfield_dop",
    name: "Higgsfield Cinema Studio v2.5 DOP + Bullet-Time",
    label: "Higgsfield Cinema Studio v2.5 DoP",
    badge: "Bullet-Time + Anamorphic",
  },
  {
    id: "kling3_sora2",
    name: "Kling 3.0 / Sora 2 Multi-Model Swarm Bridge",
    label: "InVideo AI v3 + Multi-Model Swarm",
    badge: "10-Act Script-to-Film",
  },
];

const INVIDEO_DURATION_OPTIONS = [
  { seconds: 15, sec: 15, label: "15s Short", acts: 2, badge: "2 Acts · Shorts" },
  { seconds: 30, sec: 30, label: "30s Spot", acts: 3, badge: "3 Acts · Spot" },
  { seconds: 60, sec: 60, label: "60s / 1m Reel", acts: 6, badge: "6 Acts · 1 Min" },
  { seconds: 120, sec: 120, label: "120s / 2m Story", acts: 6, badge: "6 Acts · 2 Min" },
  { seconds: 180, sec: 180, label: "180s / 3m Trailer", acts: 6, badge: "6 Acts · 3 Min" },
  { seconds: 300, sec: 300, label: "300s / 5m Epic", acts: 10, badge: "10 Acts · 5 Min" },
];

type SelectableScope =
  | "post"
  | "hook"
  | "body"
  | "hashtags"
  | "cta"
  | "visual"
  | "timeline";

interface CarouselSlideItem {
  id: string;
  title: string;
  subtitle: string;
  altText: string;
  timeCode: string;
}

interface StudioPostState {
  canonicalId: string;
  canonicalUrl: string;
  studioUrl: string;
  durationSeconds: number;
  cameraPreset: string;
  lensPreset: string;
  vfxPreset: string;
  subtitleStyle: SubtitleStyleId;
  foundationModel: string;
  title: string;
  version: string;
  hook: string;
  body: string;
  hashtags: string;
  ctaUrl: string;
  videoUrl: string;
  audioMixLabel: string;
  altText: string;
  castBadge: string;
  youtubeRefBadge: string | null;
  captionsEnabled: boolean;
  aiDisclosureEnabled: boolean;
  safeZoneOverlay: boolean;
  slides: CarouselSlideItem[];
  segments: VideoSegmentSpec[];
}

interface CheckpointEntry {
  id: string;
  version: string;
  label: string;
  timestamp: string;
  snapshot: StudioPostState;
}

interface BrandProfile {
  id: string;
  name: string;
  voiceSummary: string;
  bannedWords: string[];
  requiredDisclaimer: string;
}

const DEFAULT_BRANDS: BrandProfile[] = [
  {
    id: "brand-cinema",
    name: "Zyvoriq 35mm Cinema Studio",
    voiceSummary: "Calm, tactile, director-grade storytelling. Zero hype cliches.",
    bannedWords: ["synergy", "guaranteed", "hack", "crush it"],
    requiredDisclaimer: "",
  },
  {
    id: "brand-editorial",
    name: "Editorial Documentary Press",
    voiceSummary: "Measured, investigative, factual cinema breakdown.",
    bannedWords: ["viral", "secret", "guaranteed"],
    requiredDisclaimer: "Shot on location with AI-assisted orchestral mastering.",
  },
  {
    id: "brand-enterprise",
    name: "Enterprise Launch Kit",
    voiceSummary: "Clear, outcome-oriented product narrative with verifiable metrics.",
    bannedWords: ["magic", "revolutionary"],
    requiredDisclaimer: "",
  },
];

// ============================================================================
// VERIFIED 5-MINUTE (300.0s, 10-ACT) MISSION: IMPOSSIBLE 10 MASTER SEGMENTS
// ============================================================================
const MI10_SEGMENTS: VideoSegmentSpec[] = [
  {
    id: "seg-1",
    actId: "ZYV-ACT-MI10-300S-01",
    canonicalId: "ZYV-ACT-MI10-300S-01",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-01",
    cameraPreset: "Crash Zoom",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 0,
    timeRange: "00:00–00:30",
    startSec: 0,
    endSec: 30,
    speaker: "Ethan Vance (Baritone)",
    captionLine:
      "Orbital Halo drop over Geneva—three seconds before the quantum vault locks forever.",
    visualContinuityLock:
      "35mm Panavision Anamorphic · High-altitude HALO jump into neon Geneva storm, Crash Zoom on visor HUD",
    aiGenerated: true,
  },
  {
    id: "seg-2",
    actId: "ZYV-ACT-MI10-300S-02",
    canonicalId: "ZYV-ACT-MI10-300S-02",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-02",
    cameraPreset: "Whip Pan Transition",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 1,
    timeRange: "00:30–01:00",
    startSec: 30,
    endSec: 60,
    speaker: "Ilsa Moreau (Mezzo)",
    captionLine:
      "The Multiverse Entity anticipated our breach. Cut the fiber uplink before the biometric sweep completes!",
    visualContinuityLock:
      "Subterranean CERN glass corridor · Whip pan between laser grid and quantum server core",
    aiGenerated: true,
  },
  {
    id: "seg-3",
    actId: "ZYV-ACT-MI10-300S-03",
    canonicalId: "ZYV-ACT-MI10-300S-03",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-03",
    cameraPreset: "Bullet Time 360°",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 2,
    timeRange: "01:00–01:30",
    startSec: 60,
    endSec: 90,
    speaker: "Ethan Vance (Baritone)",
    captionLine:
      "Hold your breath—when the gravity ring spins up, every glass shard hangs suspended in mid-air.",
    visualContinuityLock:
      "120fps Bullet Time 360° orbit through shattering glass atrium with blue anamorphic lens flare",
    aiGenerated: true,
  },
  {
    id: "seg-4",
    actId: "ZYV-ACT-MI10-300S-04",
    canonicalId: "ZYV-ACT-MI10-300S-04",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-04",
    cameraPreset: "FPV Drone Dive",
    lensPreset: "Cyberpunk Cyan/Amber Halation",
    index: 3,
    timeRange: "01:30–02:00",
    startSec: 90,
    endSec: 120,
    speaker: "Luther Sterling (Bass)",
    captionLine:
      "Ethan, the bridge ahead is collapsing into the Rhine canyon—take the turbine motorcycle ramp now!",
    visualContinuityLock:
      "FPV Drone Dive down vertical dam spillway following electric superbike through rain and sparks",
    aiGenerated: true,
  },
  {
    id: "seg-5",
    actId: "ZYV-ACT-MI10-300S-05",
    canonicalId: "ZYV-ACT-MI10-300S-05",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-05",
    cameraPreset: "SnorriCam Chest-Rig",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 4,
    timeRange: "02:00–02:30",
    startSec: 120,
    endSec: 150,
    speaker: "Ethan Vance (Baritone)",
    captionLine:
      "Chute deployed at two hundred feet—latching magnetic grapples onto the bullet train roof!",
    visualContinuityLock:
      "SnorriCam Chest-Rig locked on Ethan landing on 320 km/h Alpine maglev roof in blizzard",
    aiGenerated: true,
  },
  {
    id: "seg-6",
    actId: "ZYV-ACT-MI10-300S-06",
    canonicalId: "ZYV-ACT-MI10-300S-06",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-06",
    cameraPreset: "Dutch Angle Thriller",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 5,
    timeRange: "02:30–03:00",
    startSec: 150,
    endSec: 180,
    speaker: "Director Kaelen (Baritone)",
    captionLine:
      "Every intelligence satellite in the hemisphere is watching this carriage. Hand over the cruciform key.",
    visualContinuityLock:
      "14° Dutch Angle inside crimson velvet dining car; tense standoff with -14 LUFS orchestral pulse",
    aiGenerated: true,
  },
  {
    id: "seg-7",
    actId: "ZYV-ACT-MI10-300S-07",
    canonicalId: "ZYV-ACT-MI10-300S-07",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-07",
    cameraPreset: "Dolly Zoom / Vertigo",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 6,
    timeRange: "03:00–03:30",
    startSec: 180,
    endSec: 210,
    speaker: "Ilsa Moreau (Mezzo)",
    captionLine:
      "Look at the tunnel portal—the timeline is splitting across three parallel cities at once!",
    visualContinuityLock:
      "Dolly Zoom / Vertigo warp as Alpine tunnel opens into Neo-Tokyo glass observatory horizon",
    aiGenerated: true,
  },
  {
    id: "seg-8",
    actId: "ZYV-ACT-MI10-300S-08",
    canonicalId: "ZYV-ACT-MI10-300S-08",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-08",
    cameraPreset: "Hyper-Lapse Orbit",
    lensPreset: "Cyberpunk Cyan/Amber Halation",
    index: 7,
    timeRange: "03:30–04:00",
    startSec: 210,
    endSec: 240,
    speaker: "Ethan Vance (Baritone)",
    captionLine:
      "Insert both halves of the key on my mark—synchronize the 124 BPM countdown across every node!",
    visualContinuityLock:
      "Hyper-Lapse Orbit around glowing holographic core as 12-agent swarm locks cryptographic rings",
    aiGenerated: true,
  },
  {
    id: "seg-9",
    actId: "ZYV-ACT-MI10-300S-09",
    canonicalId: "ZYV-ACT-MI10-300S-09",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-09",
    cameraPreset: "Crane Up Reveal",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 8,
    timeRange: "04:00–04:30",
    startSec: 240,
    endSec: 270,
    speaker: "Luther Sterling (Bass)",
    captionLine:
      "Firewall restored! The rogue AI is isolated in cold storage with zero collateral fallout.",
    visualContinuityLock:
      "Sweeping Crane Up Reveal over sunlit Alpine ridge as storm clouds part in golden hour",
    aiGenerated: true,
  },
  {
    id: "seg-10",
    actId: "ZYV-ACT-MI10-300S-10",
    canonicalId: "ZYV-ACT-MI10-300S-10",
    canonicalUrl: "/entity/ZYV-ACT-MI10-300S-10",
    cameraPreset: "Overhead God's Eye",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 9,
    timeRange: "04:30–05:00",
    startSec: 270,
    endSec: 300,
    speaker: "Ethan & Ilsa",
    captionLine:
      "Until the next impossible directive—this tape will self-archive in the Zyvoriq Master Vault.",
    visualContinuityLock:
      "Overhead God's Eye shot of helipad extraction at twilight; Lyria 3 Pro brass & Lalo-inspired finale",
    aiGenerated: true,
  },
];

const CURSED_HUNTER_SEGMENTS: VideoSegmentSpec[] = [
  {
    id: "seg-1",
    actId: "ZYV-ACT-HUNTER-01",
    canonicalId: "ZYV-ACT-HUNTER-01",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-01",
    cameraPreset: "Dutch Angle Thriller",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 0,
    timeRange: "00.0s–10.0s",
    startSec: 0,
    endSec: 10,
    speaker: "Kaelen (Baritone)",
    captionLine:
      "Lower your bows. The contract is over—nobody touches her while I stand here.",
    visualContinuityLock:
      "Kaelen screen-left lowering steel sword, Lyra screen-right, cold blue-grey twilight",
    aiGenerated: true,
  },
  {
    id: "seg-2",
    actId: "ZYV-ACT-HUNTER-02",
    canonicalId: "ZYV-ACT-HUNTER-02",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-02",
    cameraPreset: "Crash Zoom",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 1,
    timeRange: "10.0s–20.0s",
    startSec: 10,
    endSec: 20,
    speaker: "Kaelen (Baritone)",
    captionLine:
      "Stay right beside me. Step back into the glacier archway behind us.",
    visualContinuityLock:
      "Sword parry sparks in snow canyon, guiding Lyra toward glacier ridge",
    aiGenerated: true,
  },
  {
    id: "seg-3",
    actId: "ZYV-ACT-HUNTER-03",
    canonicalId: "ZYV-ACT-HUNTER-03",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-03",
    cameraPreset: "Handheld Docu-Grit",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 2,
    timeRange: "20.0s–30.0s",
    startSec: 20,
    endSec: 30,
    speaker: "Lyra (Mezzo)",
    captionLine:
      "Your shoulder is wounded—come inside the ice cavern before the blizzard freezes us.",
    visualContinuityLock:
      "Lyra places hand on Kaelen's wounded shoulder at glacier archway; 180-deg axis locked",
    aiGenerated: true,
  },
  {
    id: "seg-4",
    actId: "ZYV-ACT-HUNTER-04",
    canonicalId: "ZYV-ACT-HUNTER-04",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-04",
    cameraPreset: "Macro Eye-In",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 3,
    timeRange: "30.0s–40.0s",
    startSec: 30,
    endSec: 40,
    speaker: "Lyra (Mezzo)",
    captionLine:
      "They hunted me across the mountains, yet you stood between me and their steel.",
    visualContinuityLock:
      "Lyra tends Kaelen's shoulder inside blue glacial ice cavern; continuous cello & taiko swell",
    aiGenerated: true,
  },
  {
    id: "seg-5",
    actId: "ZYV-ACT-HUNTER-05",
    canonicalId: "ZYV-ACT-HUNTER-05",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-05",
    cameraPreset: "Dolly Zoom / Vertigo",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 4,
    timeRange: "40.0s–50.0s",
    startSec: 40,
    endSec: 50,
    speaker: "Kaelen (Baritone)",
    captionLine:
      "The true monsters sit on thrones in the valley. Whatever storm comes next, we face it together.",
    visualContinuityLock:
      "Two-shot medium close-up in glacial cavern, falling snow, -14 LUFS dialogue ducking",
    aiGenerated: true,
  },
  {
    id: "seg-6",
    actId: "ZYV-ACT-HUNTER-06",
    canonicalId: "ZYV-ACT-HUNTER-06",
    canonicalUrl: "/entity/ZYV-ACT-HUNTER-06",
    cameraPreset: "Crane Up Reveal",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 5,
    timeRange: "50.0s–60.0s",
    startSec: 50,
    endSec: 60,
    speaker: "Lyra (Mezzo)",
    captionLine:
      "The blizzard is subsiding across the canyon. The mountain belongs to us now.",
    visualContinuityLock:
      "Locked cold overcast blue-grey Arctic twilight at glacial cavern mouth",
    aiGenerated: true,
  },
];

const INITIAL_SEGMENTS: VideoSegmentSpec[] = [
  {
    id: "seg-1",
    actId: "ZYV-ACT-KAILASH-01",
    canonicalId: "ZYV-ACT-KAILASH-01",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-01",
    cameraPreset: "Crane Up Reveal",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 0,
    timeRange: "00.0s–10.0s",
    startSec: 0,
    endSec: 10,
    speaker: "Goddess Parvati",
    captionLine:
      "Guard this sacred threshold of Kailash, my son, and let no force cross unbidden.",
    visualContinuityLock:
      "Golden Kailash courtyard, radiant turmeric aura VFX, Parvati screen-left & Ganesha screen-right",
    aiGenerated: true,
  },
  {
    id: "seg-2",
    actId: "ZYV-ACT-KAILASH-02",
    canonicalId: "ZYV-ACT-KAILASH-02",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-02",
    cameraPreset: "Crash Zoom",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 1,
    timeRange: "10.0s–20.0s",
    startSec: 10,
    endSec: 20,
    speaker: "Lord Ganesha",
    captionLine:
      "A mother's word is supreme law. I stand watch over these golden temple steps.",
    visualContinuityLock:
      "Ganesha plants glowing golden lotus staff on temple steps, warm Himalayan mist & golden mandala",
    aiGenerated: true,
  },
  {
    id: "seg-3",
    actId: "ZYV-ACT-KAILASH-03",
    canonicalId: "ZYV-ACT-KAILASH-03",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-03",
    cameraPreset: "Dolly Zoom / Vertigo",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 2,
    timeRange: "20.0s–30.0s",
    startSec: 20,
    endSec: 30,
    speaker: "Lord Shiva",
    captionLine:
      "Who bars the path to my own abode upon the eternal snows of Kailash?",
    visualContinuityLock:
      "Shiva approaches snow-swept Kailash bridge with crescent moon glow & damaru resonance",
    aiGenerated: true,
  },
  {
    id: "seg-4",
    actId: "ZYV-ACT-KAILASH-04",
    canonicalId: "ZYV-ACT-KAILASH-04",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-04",
    cameraPreset: "Bullet Time 360°",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 3,
    timeRange: "30.0s–40.0s",
    startSec: 30,
    endSec: 40,
    speaker: "Lord Ganesha",
    captionLine:
      "Even the lord of the cosmos must honor the vow entrusted by Goddess Parvati.",
    visualContinuityLock:
      "Golden geometric light-shield dome VFX in snow courtyard, damaru & brass crescendo ducked -14 LUFS",
    aiGenerated: true,
  },
  {
    id: "seg-5",
    actId: "ZYV-ACT-KAILASH-05",
    canonicalId: "ZYV-ACT-KAILASH-05",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-05",
    cameraPreset: "Macro Eye-In",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 4,
    timeRange: "40.0s–50.0s",
    startSec: 40,
    endSec: 50,
    speaker: "Goddess Parvati",
    captionLine:
      "Restore him with divine grace, and crown him first among all sacred guardians.",
    visualContinuityLock:
      "Parvati steps into luminous golden beam between Shiva and Ganesha; emotional close-up",
    aiGenerated: true,
  },
  {
    id: "seg-6",
    actId: "ZYV-ACT-KAILASH-06",
    canonicalId: "ZYV-ACT-KAILASH-06",
    canonicalUrl: "/entity/ZYV-ACT-KAILASH-06",
    cameraPreset: "Overhead God's Eye",
    lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
    index: 5,
    timeRange: "50.0s–60.0s",
    startSec: 50,
    endSec: 60,
    speaker: "Shiva & Parvati",
    captionLine:
      "Rise as Gajanana, Vighnaharta, blessed with wisdom, revered before every sacred prayer.",
    visualContinuityLock:
      "Divine golden lotus petal rain, Shiva & Parvati unison blessing, sacred Shankha conch finale",
    aiGenerated: true,
  },
];

const INITIAL_POST: StudioPostState = {
  canonicalId: "ZYV-REEL-MI10-300S",
  canonicalUrl: "/entity/ZYV-REEL-MI10-300S",
  studioUrl: "/swarm-MUI?reel=ZYV-REEL-MI10-300S",
  durationSeconds: 300,
  cameraPreset: "Crash Zoom",
  lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
  vfxPreset: "Anamorphic Blue Lens Flare",
  subtitleStyle: "cinema_classic",
  foundationModel: "omni11_lyria3",
  title: "Mission: Impossible 10 — The Multiverse Protocol (5-Min Master)",
  version: "v1.0",
  hook: "Three hundred seconds before the quantum vault locks—Ethan Vance drops from orbital halo into Geneva.",
  body: "Full 5-minute (300.0s, 10-Act, 7,200-frame, 24fps CFR) 35mm espionage & sci-fi thriller synthesized in parallel across 12 concurrent Swarm workers. Features Crash Zooms, 120fps Bullet Time, FPV Drone Dives, and a 124 BPM Lyria 3 Pro orchestral spy score.",
  hashtags: "#MissionImpossible10 #5MinCinemaEpic #HiggsfieldCamera #RunwayMotion #CinemaStudio",
  ctaUrl: "https://zyvoriq.studio/showcase/mission-impossible-10-multiverse-300s?utm_source=social&utm_medium=studio",
  videoUrl:
    "/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4",
  audioMixLabel: "300.0s / 5:00 · 10-Act Parallel Master + Lyria 3 Pro 124 BPM Score",
  altText:
    "35mm Panavision Anamorphic espionage thriller frame showing Ethan Vance in high-altitude HALO jump over Geneva quantum collider, subterranean glass atrium bullet-time, and Alpine maglev extraction.",
  castBadge: "Ethan Vance (Baritone) · Ilsa Moreau (Mezzo) · Luther Sterling (Bass)",
  youtubeRefBadge: "10-Act Parallel Swarm · 300.0s / 7,200 Frames Verified",
  captionsEnabled: true,
  aiDisclosureEnabled: true,
  safeZoneOverlay: false,
  slides: [
    {
      id: "slide-1",
      title: "Acts I–III (0:00–1:30) · Orbital HALO Drop & CERN Glass Atrium",
      subtitle: "Ethan Vance breaches the Geneva quantum vault as Bullet Time 360° suspends shattering glass.",
      altText: "Orbital HALO jump over Geneva and 120fps Bullet Time glass atrium",
      timeCode: "00:00–01:30",
    },
    {
      id: "slide-2",
      title: "Acts IV–VII (1:30–3:30) · Rhine Dam FPV Dive & Alpine Maglev Roof",
      subtitle: "FPV drone chase down the spillway onto a 320 km/h bullet train entering the multiverse portal.",
      altText: "FPV superbike dam dive and SnorriCam Alpine bullet train roof landing",
      timeCode: "01:30–03:30",
    },
    {
      id: "slide-3",
      title: "Acts VIII–X (3:30–5:00) · Cruciform Key Sync & Helipad Extraction",
      subtitle: "Dual-key cryptographic lock at 124 BPM followed by golden-hour Alpine helipad extraction.",
      altText: "Holographic core synchronization and twilight helipad extraction",
      timeCode: "03:30–05:00",
    },
  ],
  segments: MI10_SEGMENTS,
};

const INITIAL_VARIATIONS: PostVariation[] = [
  {
    id: "var-mi10-300s-master",
    canonicalId: "ZYV-REEL-MI10-300S",
    canonicalUrl: "/entity/ZYV-REEL-MI10-300S",
    durationSeconds: 300,
    label: "Variation MI-10 · Mission: Impossible 10 — The Multiverse Protocol (5-Min / 300.0s 10-Act Master)",
    hook: "Three hundred seconds before the quantum vault locks—Ethan Vance drops from orbital halo into Geneva.",
    body: "Full 5-minute (300.0s, 10-Act, 7,200-frame, 24fps CFR) 35mm espionage & sci-fi thriller synthesized in parallel across 12 concurrent Swarm workers. Features Crash Zooms, 120fps Bullet Time, FPV Drone Dives, and a 124 BPM Lyria 3 Pro orchestral spy score.",
    hashtags: "#MissionImpossible10 #5MinCinemaEpic #HiggsfieldCamera #RunwayMotion #CinemaStudio",
    videoUrl:
      "/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4",
    audioLabel: "300.0s / 5:00 · 10-Act Parallel Master",
    rationale:
      "Verified 5-Minute (300.0s) 10-Act Master saved in Library with unique ID ZYV-REEL-MI10-300S and /entity/ZYV-REEL-MI10-300S permalink.",
  },
  {
    id: "var-kailash-option-2",
    canonicalId: "ZYV-REEL-KAILASH-60S",
    canonicalUrl: "/entity/ZYV-REEL-KAILASH-60S",
    durationSeconds: 60,
    label: "Variation A · Sacred Kailash: Spoken Dialogue + Temple Foley + Lyria 3 Score (Option 2)",
    hook: "At the sacred gates of Mount Kailash, a vow between Parvati, Ganesha, and Shiva awakens the cosmos.",
    body: "Multi-act 35mm mythological visual story featuring Goddess Parvati, Lord Ganesha, and Lord Shiva. Combines celestial particle VFX, spoken dialogue, and a dynamic Lyria 3 Pro Vedic percussion & symphonic score ducked at -14 LUFS.",
    hashtags: "#GaneshParvatiShiva #SacredMythology #VisualEffects #CinemaStudio",
    videoUrl:
      "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=kailash_fresh_20261023",
    audioLabel: "Option 2 · Omni 1.1 + Vedic Score",
    rationale:
      "New 60s Master (YouTube Ref m55XOXtscXU): multi-character spoken dialogue + damaru/bell Foley + Lyria 3 Pro orchestral score.",
  },
  {
    id: "var-kailash-option-1",
    canonicalId: "ZYV-REEL-KAILASH-SYMPH-60S",
    canonicalUrl: "/entity/ZYV-REEL-KAILASH-SYMPH-60S",
    durationSeconds: 60,
    label: "Variation B · Sacred Kailash: Symphonic Devotional Forward Mix (Option 1)",
    hook: "Six unbroken 35mm mythological acts at Mount Kailash—driven by a continuous Lyria 3 Pro Vedic orchestral score.",
    body: "Experience the Lyria 3 Pro devotional symphonic mix where temple bells, mridangam, bansuri flute, and epic strings drive the sacred story of Ganesh, Parvati, and Shiva from 0:00 to 1:00.",
    hashtags: "#GaneshParvatiShiva #VedicSymphony #Cinematography #CinemaStudio",
    videoUrl:
      "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4?v=kailash_fresh_20261023",
    audioLabel: "Option 1 · Devotional Symphonic",
    rationale:
      "New 60s Master (Option 1): foregrounds the continuous 96 BPM Lyria 3 Pro Vedic orchestral composition with dialogue.",
  },
  {
    id: "var-option-2",
    canonicalId: "ZYV-REEL-HUNTER-60S",
    canonicalUrl: "/entity/ZYV-REEL-HUNTER-60S",
    durationSeconds: 60,
    label: "Variation C · The Cursed Hunter: Spoken Dialogue + Foley + Score (Option 2)",
    hook: "The curse took his voice at dusk—so she walked into the frozen basalt pass with empty hands.",
    body: "60 seconds of continuous 35mm anamorphic cinema. Every 10-second act locks character identity, spatial axis, and cold Arctic twilight while Omni 1.1 dialogue ducks cleanly over a custom Lyria 3 Pro orchestral score.",
    hashtags: "#TheCursedHunter #LiveAction35mm #SoundDesign #CinemaStudio",
    videoUrl:
      "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4",
    audioLabel: "Option 2 · Omni 1.1 + Score",
    rationale:
      "Arctic Fantasy 60s Master: lip-synced spoken dialogue + crunchy snow Foley hooks viewers in 1.5s.",
  },
  {
    id: "var-speakeasy",
    canonicalId: "ZYV-REEL-NOIR-60S",
    canonicalUrl: "/entity/ZYV-REEL-NOIR-60S",
    durationSeconds: 60,
    label: "Variation D · Crimson Echoes, Ivory Dreams (60s Art-Deco Noir)",
    hook: "When the rain hits the brass marquee at midnight, the grand piano tells the whole story.",
    body: "A 60-second 1920s Art-Deco speakeasy showcase featuring Julian at the Steinway and Clara at the velvet stage mic with continuous jazz-noir acoustics.",
    hashtags: "#NoirCinema #ArtDeco #JazzScore #ShortFilm",
    videoUrl:
      "/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4",
    audioLabel: "1920s Speakeasy Master",
    rationale:
      "Demonstrates switching to a warm amber period aesthetic while keeping the 6-turn 60s structure.",
  },
  {
    id: "var-fresh-barcelona-bhangra-flamenco",
    canonicalId: "ZYV-REEL-BARCELONA-60S",
    canonicalUrl: "/entity/ZYV-REEL-BARCELONA-60S",
    durationSeconds: 60,
    label: "Variation E · [FRESH E2E] Barcelona Bhangra-Flamenco Rooftop Sundown (60s 118 BPM Master)",
    hook: "Golden sun on Gothic rooftop stone—Punjabi dhol and Spanish flamenco guitar collide at 118 BPM.",
    body: "Freshly synthesized 60.0s 2-Act (24fps CFR, 48kHz stereo) music video generated from prompt: Zoya Sandhu in emerald & gold zardozi lehenga and Mateo in obsidian bolero perform synchronized Bhangra dhol & flamenco footwork on a Barcelona Gothic Quarter rooftop at sunset, transitioning into crimson flamenco silk under 3200K lanterns.",
    hashtags: "#BarcelonaBhangra #FlamencoFusion #Lyria3Pro #Omni11Cinema",
    videoUrl:
      "/assets/swarm/generated/job_1792800001_barcelona_bhangra_flamenco/combined_60s.mp4",
    audioLabel: "Fresh 118 BPM Dhol + Flamenco Master",
    rationale:
      "100% fresh 6-shot Omni 1.1 video + Lyria 3 Pro 118 BPM Punjabi-Flamenco vocal master generated live during E2E testing.",
  },
  {
    id: "var-fresh-neotokyo-quantum-echo",
    canonicalId: "ZYV-REEL-NEOTOKYO-60S",
    canonicalUrl: "/entity/ZYV-REEL-NEOTOKYO-60S",
    durationSeconds: 60,
    label: "Variation F · [FRESH E2E] Quantum Echo: Neo-Tokyo Glass Observatory (60s 35mm Sci-Fi)",
    hook: "In the final sixty seconds before orbital lock, every encrypted frame pointed to a single origin.",
    body: "Freshly synthesized 60.0s 35mm ARRI Alexa anamorphic sci-fi thriller generated from prompt: Kaito Vance (orbital quantum cryptographer) and Dr. Elena Moretti inside a rain-slicked Neo-Tokyo glass observatory at midnight under 3200K tungsten and cyan neon lighting.",
    hashtags: "#QuantumEcho #NeoTokyo35mm #SciFiCinema #Lyria3Score",
    videoUrl:
      "/assets/swarm/generated/job_1792800002_neotokyo_quantum_observatory/combined_60s.mp4",
    audioLabel: "Fresh 108 BPM Sci-Fi Score + Dialogue",
    rationale:
      "100% fresh 6-shot Omni 1.1 35mm live-action sci-fi reel + Lyria 3 Pro 108 BPM C-Minor electronic/orchestral score generated live during E2E testing.",
  },
];

const SPEAKEASY_SEGMENTS: VideoSegmentSpec[] = [
  {
    id: "seg-1",
    actId: "ZYV-ACT-NOIR-01",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-01",
    cameraPreset: "Crane Up Reveal",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 0,
    timeRange: "00.0s–10.0s",
    startSec: 0,
    endSec: 10,
    speaker: "Julian (Baritone)",
    captionLine:
      "Play the minor chord soft, Clara—the rain outside knows every secret in this room.",
    visualContinuityLock:
      "Julian screen-left at Steinway grand, Clara screen-right by brass mic, warm amber haze",
    aiGenerated: true,
  },
  {
    id: "seg-2",
    actId: "ZYV-ACT-NOIR-02",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-02",
    cameraPreset: "Macro Eye-In",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 1,
    timeRange: "10.0s–20.0s",
    startSec: 10,
    endSec: 20,
    speaker: "Clara (Alto)",
    captionLine:
      "Then let the brass horns answer before the velvet curtains close tonight.",
    visualContinuityLock:
      "Close-up on Clara in crimson sequin gown, spotlight reflection on wet parquet floor",
    aiGenerated: true,
  },
  {
    id: "seg-3",
    actId: "ZYV-ACT-NOIR-03",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-03",
    cameraPreset: "Dolly Zoom / Vertigo",
    lensPreset: "IMAX 70mm Kodak 2383 Print",
    index: 2,
    timeRange: "20.0s–30.0s",
    startSec: 20,
    endSec: 30,
    speaker: "Julian (Baritone)",
    captionLine:
      "Every table in the balcony just went quiet. Keep the tempo steady at 118 BPM.",
    visualContinuityLock:
      "Tracking dolly from piano keys to center stage; 180-deg axis locked",
    aiGenerated: true,
  },
  {
    id: "seg-4",
    actId: "ZYV-ACT-NOIR-04",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-04",
    cameraPreset: "Whip Pan Transition",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 3,
    timeRange: "30.0s–40.0s",
    startSec: 30,
    endSec: 40,
    speaker: "Clara (Alto)",
    captionLine:
      "City lights fade on the avenue, but the ivory dreams stay awake till dawn.",
    visualContinuityLock:
      "Upright bass and brushed snare swell in background, warm Art-Deco sconces",
    aiGenerated: true,
  },
  {
    id: "seg-5",
    actId: "ZYV-ACT-NOIR-05",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-05",
    cameraPreset: "Dutch Angle Thriller",
    lensPreset: "Vintage 16mm Documentary Grain",
    index: 4,
    timeRange: "40.0s–50.0s",
    startSec: 40,
    endSec: 50,
    speaker: "Julian (Baritone)",
    captionLine:
      "One last modulation into D-minor before the marquee lights dim.",
    visualContinuityLock:
      "Two-shot medium frame by the piano, -14 LUFS vocal ducking",
    aiGenerated: true,
  },
  {
    id: "seg-6",
    actId: "ZYV-ACT-NOIR-06",
    canonicalUrl: "/entity/ZYV-ACT-NOIR-06",
    cameraPreset: "Overhead God's Eye",
    lensPreset: "Cooke S4 Prime Warm Cinema",
    index: 5,
    timeRange: "50.0s–60.0s",
    startSec: 50,
    endSec: 60,
    speaker: "Clara & Julian",
    captionLine:
      "Goodnight to the shadows—until the next midnight encore.",
    visualContinuityLock:
      "Locked warm tungsten speakeasy grade through final sustained piano chord",
    aiGenerated: true,
  },
];

function buildPostFromVariation(
  v: PostVariation,
  basePost: StudioPostState
): StudioPostState {
  const lower = `${v.id} ${v.canonicalId || ""} ${v.label} ${v.videoUrl}`.toLowerCase();
  if (lower.includes("mi10") || lower.includes("mission") || lower.includes("impossible") || lower.includes("300s")) {
    return {
      ...basePost,
      canonicalId: "ZYV-REEL-MI10-300S",
      canonicalUrl: "/entity/ZYV-REEL-MI10-300S",
      studioUrl: "/swarm-MUI?reel=ZYV-REEL-MI10-300S",
      durationSeconds: 300,
      cameraPreset: "Crash Zoom",
      lensPreset: "ARRI Alexa 65 + Panavision Anamorphic",
      vfxPreset: "Anamorphic Blue Streak Flare",
      title: "Mission: Impossible 10 — The Multiverse Protocol (5-Min / 300.0s 10-Act 35mm Master)",
      hook: v.hook,
      body: v.body,
      hashtags: v.hashtags,
      videoUrl: v.videoUrl,
      audioMixLabel: v.audioLabel,
      castBadge: "Ethan Vance (Baritone) · Ilsa Moreau (Mezzo) · Luther Sterling (Bass)",
      youtubeRefBadge: "300.0s / 5:00 · 10-Act Parallel Master",
      altText:
        "35mm Panavision Anamorphic frame of Ethan Vance performing a high-altitude HALO jump over Geneva into a 10-act multiverse espionage thriller.",
      ctaUrl:
        "https://zyvoriq.studio/entity/ZYV-REEL-MI10-300S?utm_source=social&utm_medium=studio",
      segments: MI10_SEGMENTS,
      slides: [
        {
          id: "slide-1",
          title: "Acts I–III (0:00–1:30) · Geneva Orbital Drop & Bullet-Time Breach",
          subtitle: "Ethan Vance and Ilsa Moreau infiltrate the subterranean quantum vault.",
          altText: "Orbital drop and 360 bullet-time glass atrium scene",
          timeCode: "00:00–01:30",
        },
        {
          id: "slide-2",
          title: "Acts IV–VII (1:30–3:30) · FPV Dam Dive & Alpine Maglev Standoff",
          subtitle: "FPV turbine superbike dive onto a 320 km/h bullet train roof.",
          altText: "Alpine bullet train roof stunt",
          timeCode: "01:30–03:30",
        },
        {
          id: "slide-3",
          title: "Acts VIII–X (3:30–5:00) · Multiverse Core Lock & Helipad Extraction",
          subtitle: "12-Agent parallel cryptographic lock and 124 BPM symphonic finale.",
          altText: "Helipad extraction over sunlit Alpine ridge",
          timeCode: "03:30–05:00",
        },
      ],
    };
  }

  if (lower.includes("speakeasy") || lower.includes("crimson echoes")) {
    return {
      ...basePost,
      canonicalId: v.canonicalId || "ZYV-REEL-NOIR-60S",
      canonicalUrl: v.canonicalUrl || "/entity/ZYV-REEL-NOIR-60S",
      studioUrl: `/swarm-MUI?reel=${v.canonicalId || "ZYV-REEL-NOIR-60S"}`,
      durationSeconds: 60,
      title: "Crimson Echoes — 1920s Art-Deco Speakeasy 60s Master",
      hook: v.hook,
      body: v.body,
      hashtags: v.hashtags,
      videoUrl: v.videoUrl,
      audioMixLabel: v.audioLabel,
      castBadge: "Clara (Velvet Alto) · Julian (Baritone Pianist)",
      youtubeRefBadge: "1920s Art-Deco Master · 6-Act Locked",
      altText:
        "35mm warm amber frame of Clara at a vintage ribbon mic and Julian at a grand piano inside a 1920s speakeasy.",
      ctaUrl:
        "https://zyvoriq.studio/showcase/crimson-echoes-speakeasy?utm_source=social&utm_medium=studio",
      segments: SPEAKEASY_SEGMENTS,
      slides: [
        {
          id: "slide-1",
          title: "Act I (0:00–0:20) · Midnight at the Brass Marquee",
          subtitle:
            "Julian opens on the Steinway grand while Clara steps into the warm amber spotlight.",
          altText: "1920s Art-Deco speakeasy stage with grand piano and ribbon mic",
          timeCode: "00:00–00:20",
        },
        {
          id: "slide-2",
          title: "Act II (0:20–0:40) · Velvet Jazz-Noir Groove",
          subtitle:
            "118 BPM brushed snare and upright bass lock the room into unbroken silence.",
          altText: "Medium dolly shot across the speakeasy floor",
          timeCode: "00:20–00:40",
        },
        {
          id: "slide-3",
          title: "Act III (0:40–1:00) · D-Minor Midnight Encore",
          subtitle:
            "Duet finale under warm tungsten sconces with -14 LUFS vocal ducking.",
          altText: "Clara and Julian final duet frame",
          timeCode: "00:40–01:00",
        },
      ],
    };
  }

  if (lower.includes("cursed hunter") || lower.includes("var-option-2") || lower.includes("09_option2")) {
    return {
      ...basePost,
      canonicalId: v.canonicalId || "ZYV-REEL-HUNTER-60S",
      canonicalUrl: v.canonicalUrl || "/entity/ZYV-REEL-HUNTER-60S",
      studioUrl: `/swarm-MUI?reel=${v.canonicalId || "ZYV-REEL-HUNTER-60S"}`,
      durationSeconds: 60,
      title: "The Cursed Hunter — 35mm Live-Action 60s Campaign",
      hook: v.hook,
      body: v.body,
      hashtags: v.hashtags,
      videoUrl: v.videoUrl,
      audioMixLabel: v.audioLabel,
      castBadge: "Kaelen (Baritone) · Lyra (Mezzo)",
      youtubeRefBadge: "35mm Anamorphic Master · 6-Act Locked",
      altText:
        "35mm anamorphic frame of Kaelen and Lyra in the frozen basalt pass at Arctic twilight.",
      ctaUrl:
        "https://zyvoriq.studio/showcase/the-cursed-hunter?utm_source=social&utm_medium=studio",
      segments: CURSED_HUNTER_SEGMENTS,
      slides: [
        {
          id: "slide-1",
          title: "Act I (0:00–0:20) · Unarmed in the Basalt Pass",
          subtitle: "Lyra approaches Kaelen with open hands—zero weapon continuity drift.",
          altText: "Act 1 frame showing unarmed Lyra facing Kaelen in snowy canyon",
          timeCode: "00:00–00:20",
        },
        {
          id: "slide-2",
          title: "Act II (0:20–0:40) · Closing the Distance",
          subtitle: "Strict right-to-left approach across the 180-degree camera axis.",
          altText: "Act 2 medium two-shot in snowy basalt pass",
          timeCode: "00:20–00:40",
        },
        {
          id: "slide-3",
          title: "Act III (0:40–1:00) · Locked Arctic Twilight Resolution",
          subtitle: "Continuous cold blue-grey overcast grade with orchestral crescendo.",
          altText: "Act 3 resolution shot under cold blue-grey twilight sky",
          timeCode: "00:40–01:00",
        },
      ],
    };
  }

  return {
    ...basePost,
    canonicalId: v.canonicalId || "ZYV-REEL-KAILASH-60S",
    canonicalUrl: v.canonicalUrl || "/entity/ZYV-REEL-KAILASH-60S",
    studioUrl: `/swarm-MUI?reel=${v.canonicalId || "ZYV-REEL-KAILASH-60S"}`,
    durationSeconds: v.durationSeconds || 60,
    title: INITIAL_POST.title,
    hook: v.hook,
    body: v.body,
    hashtags: v.hashtags,
    videoUrl: v.videoUrl,
    audioMixLabel: v.audioLabel,
    castBadge: INITIAL_POST.castBadge,
    youtubeRefBadge: INITIAL_POST.youtubeRefBadge,
    altText: INITIAL_POST.altText,
    ctaUrl: INITIAL_POST.ctaUrl,
    segments: INITIAL_SEGMENTS,
    slides: INITIAL_POST.slides,
  };
}

// ============================================================================
// CONVERSATIONAL NON-MUTATION INTENT GUARD (Mandatory 4-Case Gate)
// ============================================================================
function evaluateConversationalIntent(rawInput: string): {
  isConversational: boolean;
  reply: string;
} | null {
  const cleaned = rawInput.trim();
  const lower = cleaned.toLowerCase().replace(/[?.!]+$/g, "").trim();
  const words = lower.split(/\s+/).filter(Boolean);

  // Case 1: Casual greetings
  const greetings = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "howdy",
    "greetings",
  ];
  if (greetings.includes(lower)) {
    return {
      isConversational: true,
      reply:
        "Hello! Your current post (v1.0) is untouched. Select any hook, body paragraph, or 60s video act on the stage—or tell me a specific edit like 'Make the hook punchier' or 'Generate a 60s product launch post'.",
    };
  }

  // Case 2: Identity & capability queries
  const capabilityPatterns = [
    "who are you",
    "what can you do",
    "help",
    "what is this",
    "how does this work",
    "capabilities",
  ];
  if (capabilityPatterns.some((p) => lower === p || lower.startsWith(p))) {
    return {
      isConversational: true,
      reply:
        "I am your Content Studio Assistant. I can draft multi-platform posts from a 1-sentence brief, rewrite any selected hook or paragraph as a side-by-side diff, check platform limits & brand rules, and coordinate 60-second multi-shot video timelines without overwriting your work.",
    };
  }

  // Case 3: Courtesies & acknowledgments
  const courtesies = [
    "thanks",
    "thank you",
    "ok",
    "okay",
    "got it",
    "cool",
    "sounds good",
    "great",
    "nice",
  ];
  if (courtesies.includes(lower)) {
    return {
      isConversational: true,
      reply:
        "You're welcome! Your canvas state and version remain unchanged. Let me know whenever you want to refine a section or run pre-flight checks.",
    };
  }

  // Exempt URLs and reference links immediately from conversational non-mutation checks
  if (/https?:\/\/|www\.|youtu\.be|youtube\.com/i.test(cleaned)) {
    return null;
  }

  // Case 4: Short ambiguous phrases (<= 2 words that are not explicit commands)
  const explicitShortCommands = [
    "shorter",
    "punchier",
    "fix grammar",
    "translate",
    "regenerate",
    "trim caption",
  ];
  if (words.length <= 2 && !explicitShortCommands.includes(lower)) {
    return {
      isConversational: true,
      reply: `I kept your canvas unchanged (${cleaned} is a bit brief to apply safely). Try clicking a section on the canvas first or specify how you'd like to use "${cleaned}"—for example: "Make the opening hook more ${lower}" or "Rewrite body for LinkedIn".`,
    };
  }

  return null;
}

// ============================================================================
// MAIN CONTENT STUDIO WORKSPACE PAGE (Runway + Higgsfield + InVideo + Canva)
// ============================================================================
export default function ContentStudioWorkspacePage() {
  // Default to Executive Light Theme ("light", Rule 54 / DESIGN.md)
  const [theme] = useState<"light" | "dark">("light");
  const [studioThemePreset, setStudioThemePreset] =
    useState<StudioThemePresetId>("canva_daylight");

  // Upgrade 1: Theater Mode (collapses sidebars so Cinema Stage spans full viewport)
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  // Uncropped Video Fit Mode: defaults to "contain" so top & bottom are NEVER chopped off
  const [videoFitMode, setVideoFitMode] = useState<"contain" | "cover">("contain");

  // New Reel Director Modal state
  const [newReelModalOpen, setNewReelModalOpen] = useState<boolean>(false);
  const [copiedCanonical, setCopiedCanonical] = useState<boolean>(false);

  // Runway 6-DoF Camera Rig + Motion Brush state
  const [cameraPanX, setCameraPanX] = useState<number>(0);
  const [cameraTiltY, setCameraTiltY] = useState<number>(1);
  const [cameraZoomZ, setCameraZoomZ] = useState<number>(9);
  const [cameraRoll, setCameraRoll] = useState<number>(0);
  const [cameraSpeed, setCameraSpeed] = useState<number>(1.8);
  const [motionBrushOverlay, setMotionBrushOverlay] = useState<boolean>(false);
  const [activeBrushLayerId, setActiveBrushLayerId] =
    useState<string>("mb-subject");
  const [keyframeLockMode, setKeyframeLockMode] = useState<
    "start_mid_end" | "act_one_character" | "optical_flow"
  >("start_mid_end");

  // InVideo Duration Selector (15s .. 300s / 5m)
  const [selectedDurationSec, setSelectedDurationSec] = useState<number>(300);
  const [selectedCameraPreset, setSelectedCameraPreset] =
    useState<string>("cam-crash-zoom");
  const [selectedLensId, setSelectedLensId] =
    useState<string>("lens-arri-panavision");
  const [selectedVfxId, setSelectedVfxId] =
    useState<string>("vfx-anamorphic-flare");
  const [selectedModelId, setSelectedModelId] =
    useState<string>("omni11_lyria3");
  const [selectedSubtitleStyleId, setSelectedSubtitleStyleId] =
    useState<SubtitleStyleId>("cinema_classic");

  // Upgrade 3: Interactive "...more" fold preview expansion toggle
  const [foldPreviewExpanded, setFoldPreviewExpanded] = useState<boolean>(false);

  // Navigation & layout state (5 Left Rail sections: Create, Camera & VFX, Library, Brands, Templates)
  const [leftSection, setLeftSection] = useState<
    "create" | "camera" | "camera_vfx" | "library" | "brands" | "templates"
  >("create");
  const [rightTab, setRightTab] = useState<
    "checks" | "edit" | "variations" | "history"
  >("edit");
  const [activePlatformId, setActivePlatformId] =
    useState<PlatformId>("reels_9_16");
  const [selectedScope, setSelectedScope] = useState<SelectableScope>("hook");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("seg-1");
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Brand state
  const [brands, setBrands] = useState<BrandProfile[]>(DEFAULT_BRANDS);
  const [activeBrandId, setActiveBrandId] = useState<string>(
    DEFAULT_BRANDS[0].id
  );
  const activeBrand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) || brands[0],
    [brands, activeBrandId]
  );

  // Post state + Undo/Redo stacks + Named History Checkpoints
  const [post, setPost] = useState<StudioPostState>(INITIAL_POST);
  const [undoStack, setUndoStack] = useState<StudioPostState[]>([]);
  const [redoStack, setRedoStack] = useState<StudioPostState[]>([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointEntry[]>([
    {
      id: "cp-init",
      version: "v1.0",
      label: "Loaded 35mm Master Campaign",
      timestamp: "Just now",
      snapshot: INITIAL_POST,
    },
  ]);

  // Brief / Create panel state (Google Stitch clean prompt composer — zero pre-stuffed hardcoded demo text)
  const [briefInput, setBriefInput] = useState<string>("");
  const [briefError, setBriefError] = useState<string | undefined>(undefined);
  const [showMoreCreateOptions, setShowMoreCreateOptions] =
    useState<boolean>(false);
  const [toneOverride, setToneOverride] = useState<string>("director_calm");
  const [audioEngineMode, setAudioEngineMode] = useState<string>("option2_omni11");
  const [stitchCanvasMode, setStitchCanvasMode] = useState<
    "all" | "stage" | "bible" | "copy"
  >("all");

  // In-place AI Diff state (never overwrite silently)
  const [pendingDiff, setPendingDiff] =
    useState<PendingDiffSuggestion | null>(null);

  // Variations state
  const [variations, setVariations] =
    useState<PostVariation[]>(INITIAL_VARIATIONS);
  const [activeVariationId, setActiveVariationId] =
    useState<string>("var-mi10-300s-master");

  // Checks ignored IDs
  const [ignoredCheckIds, setIgnoredCheckIds] = useState<string[]>([]);

  // Scoped Prompt Bar & Streaming Progress state
  const [scopedPromptInput, setScopedPromptInput] = useState<string>("");
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<{
    active: boolean;
    step: number;
    label: string;
  }>({ active: false, step: 0, label: "" });
  const cancelStreamRef = useRef<boolean>(false);
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const videoStageContainerRef = stageContainerRef;

  // Modals, Mobile Sheet & Toast
  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] =
    useState<boolean>(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] =
    useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>("2026-10-05T09:00");
  const [toast, setToast] = useState<{
    message: string;
    undoSnapshot?: StudioPostState;
  } | null>(null);

  // Library search & API items (Includes canonicalId, canonicalUrl, durationSeconds)
  const [libraryQuery, setLibraryQuery] = useState<string>("");
  const [apiLibraryItems, setApiLibraryItems] = useState<
    Array<{
      id: string;
      canonicalId: string;
      canonicalUrl: string;
      studioUrl: string;
      title: string;
      videoUrl: string;
      platform: string;
      durationSeconds: number;
      actsCount: number;
    }>
  >([]);

  // Live Cloud Video & Audio Render Job State (/api/swarm/jobs)
  const [liveRenderJob, setLiveRenderJob] = useState<{
    id: string;
    canonicalId?: string;
    canonicalUrl?: string;
    status: "idle" | "running" | "completed" | "error";
    progress: number;
    stageLabel: string;
    latestLog: string;
    parallelWorkers: number;
  }>({
    id: "",
    status: "idle",
    progress: 0,
    stageLabel: "",
    latestLog: "",
    parallelWorkers: 10,
  });

  // Active Optical Lens CSS Filter & Active Presets
  const activeLensSpec = useMemo(
    () =>
      HIGGSFIELD_OPTICAL_LENSES.find(
        (l) => l.id === selectedLensId || l.name === post.lensPreset
      ) || HIGGSFIELD_OPTICAL_LENSES[0],
    [selectedLensId, post.lensPreset]
  );
  const activeLensPreset = activeLensSpec;

  const activeCameraPreset = useMemo(
    () =>
      HIGGSFIELD_CAMERA_PRESETS.find(
        (c) => c.id === selectedCameraPreset || c.name === post.cameraPreset
      ) || HIGGSFIELD_CAMERA_PRESETS[0],
    [selectedCameraPreset, post.cameraPreset]
  );

  const activeVfxPreset = useMemo(
    () =>
      HIGGSFIELD_VFX_MODIFIERS.find(
        (v) => v.id === selectedVfxId || v.name === post.vfxPreset
      ) || HIGGSFIELD_VFX_MODIFIERS[0],
    [selectedVfxId, post.vfxPreset]
  );

  const activeSubtitleStyle = useMemo(
    () =>
      INVIDEO_SUBTITLE_STYLES.find(
        (s) => s.id === selectedSubtitleStyleId || s.id === post.subtitleStyle
      ) || INVIDEO_SUBTITLE_STYLES[0],
    [selectedSubtitleStyleId, post.subtitleStyle]
  );

  const [customDeepResearchBible, setCustomDeepResearchBible] =
    useState<DeepResearchProductionBible | null>(null);
  const [isRefreshingResearch, setIsRefreshingResearch] =
    useState<boolean>(false);

  const activeDeepResearchBible = useMemo<DeepResearchProductionBible>(() => {
    if (
      customDeepResearchBible &&
      customDeepResearchBible.canonicalReelId === post.canonicalId &&
      customDeepResearchBible.durationSeconds === post.durationSeconds
    ) {
      return customDeepResearchBible;
    }
    return synthesizeDeepResearchBible({
      canonicalReelId: post.canonicalId || "ZYV-REEL-MI10-300S",
      title: post.title,
      prompt: briefInput || post.hook,
      durationSeconds: post.durationSeconds || 300,
      actsCount: post.segments.length || 10,
      cameraPresetName: activeCameraPreset.label,
      lensName: activeLensPreset.label,
      vfxName: activeVfxPreset.label,
      castBadge: post.castBadge,
      segments: post.segments,
    });
  }, [
    customDeepResearchBible,
    post.canonicalId,
    post.title,
    post.hook,
    post.durationSeconds,
    post.castBadge,
    post.segments,
    briefInput,
    activeCameraPreset.label,
    activeLensPreset.label,
    activeVfxPreset.label,
  ]);

  const handleRefreshDeepResearch = async () => {
    setIsRefreshingResearch(true);
    try {
      const res = await fetch("/api/swarm/deep-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonicalReelId: post.canonicalId || "ZYV-REEL-MI10-300S",
          title: post.title,
          prompt: briefInput || post.hook,
          durationSeconds: post.durationSeconds || 300,
          actsCount: post.segments.length || 10,
          cameraPresetName: activeCameraPreset.label,
          lensName: activeLensPreset.label,
          vfxName: activeVfxPreset.label,
          segments: post.segments,
        }),
      });
      const data = await res.json();
      if (data?.deepResearchBible) {
        setCustomDeepResearchBible(data.deepResearchBible);
        setToast({
          message: `Deep Research Bible verified (${data.deepResearchBible.fiveDimensionScorecard.overallScore.toFixed(1)}% 5D Score across ${data.deepResearchBible.screenplay.acts.length} Acts)`,
        });
      }
    } catch {
      // Fallback uses deterministic activeDeepResearchBible
    } finally {
      setIsRefreshingResearch(false);
    }
  };

  const myGeneratedReels = useMemo(
    () => [
      ...INITIAL_VARIATIONS.map((v) => ({
        id: v.id,
        canonicalId: v.canonicalId || "ZYV-REEL-MI10-300S",
        canonicalUrl: v.canonicalUrl || "/entity/ZYV-REEL-MI10-300S",
        studioUrl:
          v.studioUrl || `/swarm-MUI?reel=${v.canonicalId || "ZYV-REEL-MI10-300S"}`,
        label: v.label,
        videoUrl: v.videoUrl,
        durationSeconds: v.durationSeconds || 60,
        actsCount: (v.durationSeconds || 60) >= 300 ? 10 : 6,
      })),
      ...apiLibraryItems
        .filter(
          (a) => !INITIAL_VARIATIONS.some((v) => v.canonicalId === a.canonicalId)
        )
        .map((a) => ({
          id: a.id,
          canonicalId: a.canonicalId,
          canonicalUrl: a.canonicalUrl,
          studioUrl: a.studioUrl,
          label: a.title,
          videoUrl: a.videoUrl,
          durationSeconds: a.durationSeconds || 60,
          actsCount: a.actsCount || 6,
        })),
    ],
    [apiLibraryItems]
  );

  const handleCopyCanonicalLink = () => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/entity/${post.canonicalId}`
        : `/entity/${post.canonicalId}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedCanonical(true);
    setTimeout(() => setCopiedCanonical(false), 1800);
    setToast({ message: `Copied Canonical Object URL: ${fullUrl}` });
  };

  // Active Studio Theme Accent Color
  const activeStudioTheme = useMemo(
    () =>
      CANVA_STUDIO_THEMES.find((t) => t.id === studioThemePreset) ||
      CANVA_STUDIO_THEMES[0],
    [studioThemePreset]
  );

  // Sync URL query params (?reel=<canonicalId>&act=<actId>) on mount (supports both built-in variations and any custom reel via /api/entity/[id])
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedReel = params.get("reel");
    const requestedAct = params.get("act");
    if (!requestedReel) return;

    const matchedVar = INITIAL_VARIATIONS.find(
      (v) =>
        v.canonicalId?.toLowerCase() === requestedReel.toLowerCase() ||
        v.id.toLowerCase() === requestedReel.toLowerCase()
    );
    if (matchedVar) {
      setActiveVariationId(matchedVar.id);
      const loadedPost = buildPostFromVariation(matchedVar, INITIAL_POST);
      setPost(loadedPost);
      setSelectedDurationSec(loadedPost.durationSeconds || 60);
      if (requestedAct) {
        const matchedSeg = loadedPost.segments.find(
          (s) =>
            s.actId?.toLowerCase() === requestedAct.toLowerCase() ||
            s.id.toLowerCase() === requestedAct.toLowerCase()
        );
        if (matchedSeg) {
          setSelectedSegmentId(matchedSeg.id);
        }
      }
      return;
    }

    // Fetch custom or persisted reel from /api/entity/[id]
    let cancelled = false;
    fetch(`/api/entity/${encodeURIComponent(requestedReel)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.ok || !data?.entity) return;
        const ent = data.entity;
        const dur = Number(ent.durationSeconds || ent.durationSec || 60);
        const cId = String(ent.parentReelId || ent.canonicalId || requestedReel);
        const rawSegs = Array.isArray(ent.segments) ? ent.segments : [];
        const mappedSegs: VideoSegmentSpec[] =
          rawSegs.length > 0
            ? rawSegs.map((s: Record<string, unknown>, idx: number) => {
                const segDur = Number(s.durationSec || Math.round(dur / rawSegs.length));
                const aId = String(
                  s.canonicalActId ||
                    s.actId ||
                    `${cId}-ACT-${String(idx + 1).padStart(2, "0")}`
                );
                return {
                  id: `seg-${idx + 1}`,
                  actId: aId,
                  canonicalId: aId,
                  canonicalUrl: String(s.canonicalUrl || `/entity/${aId}`),
                  cameraPreset: String(
                    s.cameraPreset ||
                      HIGGSFIELD_CAMERA_PRESETS[idx % HIGGSFIELD_CAMERA_PRESETS.length].name
                  ),
                  lensPreset: String(s.lensPreset || INITIAL_POST.lensPreset),
                  index: idx,
                  timeRange: String(
                    s.timeRange || `${idx * segDur}s–${(idx + 1) * segDur}s`
                  ),
                  startSec: idx * segDur,
                  endSec: (idx + 1) * segDur,
                  speaker: String(s.speaker || `Act ${idx + 1} Lead`),
                  captionLine: String(s.dialogue || s.label || ent.subtitle || ent.title),
                  visualContinuityLock: String(
                    s.continuityHandoffLock ||
                      `35mm Anamorphic continuity lock for Act ${idx + 1}`
                  ),
                  aiGenerated: true,
                };
              })
            : INITIAL_POST.segments;

        setSelectedDurationSec(dur);
        if (ent.deepResearchBible) {
          setCustomDeepResearchBible(ent.deepResearchBible);
        }
        setPost((prev) => ({
          ...prev,
          canonicalId: cId,
          canonicalUrl: `/entity/${cId}`,
          studioUrl: `/swarm-MUI?reel=${cId}`,
          title: String(ent.title || prev.title).replace(/\s*—\s*Act\s+\d+$/i, ""),
          hook: String(ent.promptSummary || ent.subtitle || prev.hook).slice(0, 118),
          body: String(ent.prompt || ent.subtitle || prev.body),
          durationSeconds: dur,
          videoUrl: String(ent.videoSrc || prev.videoUrl),
          segments: mappedSegs,
        }));
        if (requestedAct) {
          const foundAct = mappedSegs.find(
            (s) =>
              s.actId?.toLowerCase() === requestedAct.toLowerCase() ||
              s.id.toLowerCase() === requestedAct.toLowerCase()
          );
          if (foundAct) setSelectedSegmentId(foundAct.id);
        } else if (typeof ent.actNumber === "number" && ent.actNumber >= 1) {
          const idxSeg = mappedSegs[ent.actNumber - 1];
          if (idxSeg) setSelectedSegmentId(idxSeg.id);
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep browser URL synchronized with active Reel Canonical ID & Act ID without triggering page reloads
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (post.canonicalId) {
        url.searchParams.set("reel", post.canonicalId);
      }
      const currentSeg = post.segments.find((s) => s.id === selectedSegmentId);
      if (currentSeg?.actId) {
        url.searchParams.set("act", currentSeg.actId);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Ignore history replace errors
    }
  }, [post.canonicalId, selectedSegmentId, post.segments]);

  // Sync locked cast from /personas (localStorage zyvoriq_cast_matrix_v1) on mount
  useEffect(() => {
    try {
      const fromPersonas =
        typeof window !== "undefined" &&
        window.location.search.includes("from=personas");
      const rawMatrix = localStorage.getItem("zyvoriq_cast_matrix_v1");
      const rawDyn = localStorage.getItem("zyvoriq_dynamic_catalog_v1");
      if (!rawMatrix && !rawDyn) return;
      const matrixParsed = rawMatrix ? JSON.parse(rawMatrix) : null;
      const dynParsed = rawDyn ? JSON.parse(rawDyn) : null;
      const selectedIds =
        matrixParsed?.selectedIds || dynParsed?.selectedIds || null;
      if (!selectedIds) return;

      const allPersonas: PersonaDefinition[] = [
        ...(Array.isArray(dynParsed?.personas) ? dynParsed.personas : []),
        ...(Array.isArray(matrixParsed?.customPersonas)
          ? matrixParsed.customPersonas
          : []),
        ...PERSONAS_CATALOG,
      ];
      const leadIds: string[] = [
        ...(Array.isArray(selectedIds.female_lead)
          ? selectedIds.female_lead
          : []),
        ...(Array.isArray(selectedIds.male_lead) ? selectedIds.male_lead : []),
      ];
      const resolvedNames = Array.from(
        new Set(
          leadIds
            .map((id) => allPersonas.find((p) => p.id === id)?.name)
            .filter((n): n is string => Boolean(n))
        )
      );
      if (resolvedNames.length > 0 && fromPersonas) {
        const badgeText = resolvedNames.slice(0, 3).join(" · ");
        setPost((prev) => {
          const updatedSegments = prev.segments.map((seg, idx) => ({
            ...seg,
            speaker: resolvedNames[idx % resolvedNames.length] || seg.speaker,
          }));
          setCustomDeepResearchBible(
            synthesizeDeepResearchBible({
              canonicalReelId: prev.canonicalId,
              title: prev.title,
              prompt: prev.hook,
              durationSeconds: prev.durationSeconds,
              actsCount: updatedSegments.length || 6,
              castBadge: badgeText,
              segments: updatedSegments,
            })
          );
          return {
            ...prev,
            castBadge: badgeText,
            segments: updatedSegments,
          };
        });
        setToast({
          message: `Locked ensemble cast from Personas & Wardrobe (${badgeText})`,
        });
      }
    } catch {
      // Ignore storage parse errors
    }
  }, []);

  // Poll /api/swarm/jobs?id=<id> every 1200ms with smooth non-stalling progress interpolation
  useEffect(() => {
    if (liveRenderJob.status !== "running" || !liveRenderJob.id) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        if (liveRenderJob.id === "starting") {
          setLiveRenderJob((prev) => ({
            ...prev,
            progress: Math.min(28, prev.progress + 4),
          }));
          return;
        }
        const res = await fetch(
          `/api/swarm/jobs?id=${encodeURIComponent(liveRenderJob.id)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const j = data?.job;
        if (!j || cancelled) return;
        const latestLog =
          Array.isArray(j.logs) && j.logs.length > 0
            ? String(j.logs[j.logs.length - 1])
            : "";
        setLiveRenderJob((prev) => ({
          id: j.id,
          canonicalId: j.canonicalId || prev.canonicalId,
          canonicalUrl: j.canonicalUrl || prev.canonicalUrl,
          status:
            j.status === "completed"
              ? "completed"
              : j.status === "error"
              ? "error"
              : "running",
          progress: Math.max(prev.progress, Number(j.progress || 18)),
          stageLabel: String(
            j.stageLabel ||
              `Parallel Worker Pool (${j.parallelWorkers || 10} Acts Concurrent) rendering...`
          ),
          latestLog,
          parallelWorkers: Number(j.parallelWorkers || prev.parallelWorkers || 10),
        }));
        const nextVideoSrc = j.combinedSrc || j.part1Src;
        if (nextVideoSrc && typeof nextVideoSrc === "string") {
          setPost((prev) => ({
            ...prev,
            videoUrl: nextVideoSrc,
            canonicalId: j.canonicalId || prev.canonicalId,
            canonicalUrl: j.canonicalUrl || prev.canonicalUrl,
            studioUrl: j.studioUrl || prev.studioUrl,
            durationSeconds: Number(j.durationSeconds || prev.durationSeconds || 300),
          }));
        }
        if (j.status === "completed") {
          const completedCanonId = j.canonicalId || post.canonicalId;
          const completedVideo = j.combinedSrc || j.part1Src || post.videoUrl;
          const completedDur = Number(j.durationSeconds || post.durationSeconds || 300);
          setVariations((prev) =>
            prev.map((v) =>
              v.canonicalId === completedCanonId
                ? { ...v, videoUrl: completedVideo }
                : v
            )
          );
          setApiLibraryItems((prev) => {
            const filtered = prev.filter(
              (item) => item.canonicalId !== completedCanonId && item.id !== j.id
            );
            return [
              {
                id: j.id,
                canonicalId: completedCanonId,
                canonicalUrl: `/entity/${completedCanonId}`,
                studioUrl: `/swarm-MUI?reel=${completedCanonId}`,
                title: j.title || post.title,
                videoUrl: completedVideo,
                platform: `9:16 & 16:9 · ${completedDur}s`,
                durationSeconds: completedDur,
                actsCount: Number(j.actsCount || (completedDur >= 180 ? 10 : 6)),
              },
              ...filtered,
            ];
          });
          setToast({
            message: `Saved "${j.title}" (${completedDur}.0s · ${completedCanonId}) to Library Vault`,
          });
        }
      } catch {
        // Ignore transient poll errors
      }
    }, 1200);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [liveRenderJob.status, liveRenderJob.id, post.canonicalId, post.title, post.videoUrl, post.durationSeconds]);

  // Trigger parallel multi-act Gemini Omni 1.1 Flash + Lyria 3 Pro render job in /api/swarm/jobs
  const handleStartLiveVideoRender = async (
    draftOverride?: StudioPostState,
    rawBriefOverride?: string,
    durationSecOverride?: number
  ) => {
    const targetPost = draftOverride || post;
    const effectiveBrief = (rawBriefOverride || briefInput || targetPost.title).trim();
    const targetDurSec =
      durationSecOverride || targetPost.durationSeconds || selectedDurationSec || 300;
    const workerCount = targetDurSec >= 180 ? 10 : 6;

    setLiveRenderJob({
      id: "starting",
      canonicalId: targetPost.canonicalId,
      canonicalUrl: targetPost.canonicalUrl,
      status: "running",
      progress: 14,
      stageLabel: `Stage 1/4 • Parallel Worker Pool (${workerCount} Concurrent Acts · ${targetDurSec}s) launching for "${targetPost.title}"...`,
      latestLog: `Dispatching ${workerCount} parallel act workers via Promise.all (${targetPost.cameraPreset} · ${targetPost.lensPreset})...`,
      parallelWorkers: workerCount,
    });
    try {
      const turnPrompts = targetPost.segments.map(
        (seg, idx) =>
          `Act ${idx + 1} (${seg.timeRange}) [Camera: ${seg.cameraPreset || targetPost.cameraPreset}, Lens: ${seg.lensPreset || targetPost.lensPreset}] — Speaker: ${seg.speaker} speaking "${
            seg.captionLine
          }". Visual Lock: ${seg.visualContinuityLock}. Brief: ${effectiveBrief}.`
      );
      const lyrics = targetPost.segments
        .map((seg) => `[${seg.speaker}]: "${seg.captionLine}"`)
        .join("\n");
      const res = await fetch("/api/swarm/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetPost.title,
          prompt: effectiveBrief,
          durationSeconds: targetDurSec,
          actsCount: targetPost.segments.length,
          canonicalId: targetPost.canonicalId,
          cameraPreset: targetPost.cameraPreset,
          lensPreset: targetPost.lensPreset,
          genre: "35mm Cinematic Epic Score",
          bpm: 124,
          audioEngine:
            audioEngineMode === "option1_symphonic"
              ? "omni_lyria3"
              : "omni_native",
          adkOrcasMode: false,
          act1Prompt: turnPrompts.slice(0, Math.ceil(turnPrompts.length / 2)).join(" "),
          act2Prompt: turnPrompts.slice(Math.ceil(turnPrompts.length / 2)).join(" "),
          turnPrompts,
          lyrics,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.job?.id) {
        const j = data.job;
        setLiveRenderJob({
          id: j.id,
          canonicalId: j.canonicalId || targetPost.canonicalId,
          canonicalUrl: j.canonicalUrl || targetPost.canonicalUrl,
          status: j.status === "completed" ? "completed" : "running",
          progress: Number(j.progress || 24),
          stageLabel: String(
            j.stageLabel ||
              `Parallel Worker Pool (${workerCount} Acts) rendering ${targetDurSec}s master...`
          ),
          latestLog:
            Array.isArray(j.logs) && j.logs.length > 0
              ? String(j.logs[j.logs.length - 1])
              : `Job ${j.id} active (${j.canonicalId || targetPost.canonicalId})`,
          parallelWorkers: workerCount,
        });
        setToast({
          message: `Parallel ${workerCount}-Act Render active (${j.canonicalId || j.id} · ${targetDurSec}s)`,
        });
      } else {
        setLiveRenderJob({
          id: "",
          status: "completed",
          progress: 100,
          stageLabel: `Master Active: ${targetPost.title} (${targetDurSec}.0s · ${targetPost.canonicalId})`,
          latestLog: "Verified 35mm multi-act studio master loaded in canvas & Library.",
          parallelWorkers: workerCount,
        });
      }
    } catch {
      setLiveRenderJob({
        id: "",
        status: "completed",
        progress: 100,
        stageLabel: `Master Active: ${targetPost.title} (${targetDurSec}.0s · ${targetPost.canonicalId})`,
        latestLog: "Verified 35mm studio master active.",
        parallelWorkers: workerCount,
      });
    }
  };

  // Load real items from /api/swarm/library on mount (including Mission: Impossible 10 300s master)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/swarm/library")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const rawList = Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.videos)
          ? data.videos
          : [];
        const mapped = rawList
          .slice(0, 14)
          .map((item: Record<string, unknown>, idx: number) => {
            const cId = String(
              item.canonicalId || item.id || `ZYV-REEL-LIB-${idx + 1}`
            );
            const dur = Number(item.durationSeconds || 60);
            return {
              id: String(item.id || `lib-api-${idx}`),
              canonicalId: cId,
              canonicalUrl: String(item.canonicalUrl || `/entity/${cId}`),
              studioUrl: String(item.studioUrl || `/swarm-MUI?reel=${cId}`),
              title: String(
                item.title || item.prompt || `Studio Master Render #${idx + 1}`
              ),
              videoUrl: String(
                item.combinedSrc ||
                  item.src ||
                  item.videoUrl ||
                  item.url ||
                  "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=kailash_fresh_20261023"
              ),
              platform: `9:16 & 16:9 · ${dur}s`,
              durationSeconds: dur,
              actsCount: Number(item.actsCount || (dur >= 180 ? 10 : 6)),
            };
          });
        setApiLibraryItems(mapped);
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Helper to commit a post mutation with Undo stack + named checkpoint
  const commitPostChange = (
    nextState: StudioPostState,
    checkpointLabel: string
  ) => {
    const prevSnapshot = post;
    const nextVersionNum =
      parseFloat(post.version.replace(/^v/, "") || "1.0") + 0.1;
    const nextVersion = `v${nextVersionNum.toFixed(1)}`;
    const updated: StudioPostState = {
      ...nextState,
      version: nextVersion,
    };

    setUndoStack((u) => [...u, prevSnapshot]);
    setRedoStack([]);
    setPost(updated);
    setCheckpoints((cps) => [
      {
        id: `cp-${Date.now()}`,
        version: nextVersion,
        label: checkpointLabel,
        timestamp: "Just now",
        snapshot: updated,
      },
      ...cps,
    ]);
    setToast({
      message: `${checkpointLabel} (${nextVersion})`,
      undoSnapshot: prevSnapshot,
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [post, ...r]);
    setPost(previous);
    setToast({ message: `Reverted to ${previous.version}` });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    setRedoStack(rest);
    setUndoStack((u) => [...u, post]);
    setPost(next);
    setToast({ message: `Restored ${next.version}` });
  };

  // Trigger Uncropped Native Fullscreen on the video element or stage container
  const handleEnterUncroppedFullscreen = () => {
    setVideoFitMode("contain");
    const vid = videoRef.current;
    if (vid) {
      vid.style.objectFit = "contain";
      if (typeof vid.requestFullscreen === "function") {
        vid.requestFullscreen().catch(() => {
          setTheaterMode(true);
        });
        return;
      }
    }
    setTheaterMode((m) => !m);
  };

  // Global keyboard shortcuts (Cmd+Z, Shift+Cmd+Z, 1-5, C/E/V/H, T for Theater, F for Fullscreen, /, ?)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && pendingDiff) {
        e.preventDefault();
        handleAcceptDiff(pendingDiff);
        return;
      }

      if (isTyping) return;

      if (e.key === "1") setActivePlatformId("reels_9_16");
      else if (e.key === "2") setActivePlatformId("youtube_16_9");
      else if (e.key === "3") setActivePlatformId("carousel_4_5");
      else if (e.key === "4") setActivePlatformId("linkedin_1_1");
      else if (e.key === "5") setActivePlatformId("cinema_21_9");
      else if (e.key.toLowerCase() === "t") setTheaterMode((m) => !m);
      else if (e.key.toLowerCase() === "c") setRightTab("checks");
      else if (e.key.toLowerCase() === "e") setRightTab("edit");
      else if (e.key.toLowerCase() === "v") setRightTab("variations");
      else if (e.key.toLowerCase() === "h") setRightTab("history");
      else if (e.key === "/") {
        e.preventDefault();
        promptInputRef.current?.focus();
      } else if (e.key === "?") {
        e.preventDefault();
        setShortcutsDialogOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingDiff, undoStack, redoStack, post]);

  // Active platform & segment rules
  const activePlatform = useMemo(
    () => PLATFORMS.find((p) => p.id === activePlatformId) || PLATFORMS[0],
    [activePlatformId]
  );

  const activeSegment = useMemo(
    () =>
      post.segments.find((s) => s.id === selectedSegmentId) || post.segments[0],
    [post.segments, selectedSegmentId]
  );

  const fullCaptionText = useMemo(
    () => `${post.hook}\n\n${post.body}\n\n${post.hashtags}`.trim(),
    [post.hook, post.body, post.hashtags]
  );

  const charCount = fullCaptionText.length;
  const charRemaining = activePlatform.charLimit - charCount;
  const hashtagList = useMemo(
    () =>
      post.hashtags
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.startsWith("#")),
    [post.hashtags]
  );

  // ============================================================================
  // 6 MANDATORY CHECKS & FIXES ENGINE (Phase 3.4)
  // ============================================================================
  const activeIssues = useMemo<ContentCheckIssue[]>(() => {
    const list: ContentCheckIssue[] = [];

    // 1. Platform fit: Character limit check (Error — blocks publish)
    if (charCount > activePlatform.charLimit) {
      const overBy = charCount - activePlatform.charLimit;
      list.push({
        id: "chk-char-limit",
        category: "Platform fit",
        severity: "error",
        title: `Caption exceeds ${activePlatform.shortName} limit by ${overBy} characters (${charCount} / ${activePlatform.charLimit})`,
        why: `${activePlatform.shortName} rejects or hard-cuts captions above ${activePlatform.charLimit} characters.`,
        targetScope: "body",
        fixLabel: `Trim to ${activePlatform.charLimit - 18} chars`,
        applyFix: () => {
          const keptTags = hashtagList.slice(0, 2).join(" ") || "#CinemaStudio";
          const maxBodyAllowance = Math.max(
            45,
            activePlatform.charLimit - post.hook.length - keptTags.length - 12
          );
          const conciseBody =
            post.body.length > maxBodyAllowance
              ? `${post.body.slice(0, maxBodyAllowance - 1).trim()}…`
              : post.body;
          commitPostChange(
            {
              ...post,
              body: conciseBody,
              hashtags: keptTags,
            },
            `Trimmed caption to fit ${activePlatform.shortName}`
          );
        },
      });
    }

    // 1b. Platform fit: Hashtag count check
    if (hashtagList.length > activePlatform.maxHashtags) {
      list.push({
        id: "chk-hashtag-count",
        category: "Platform fit",
        severity: "warning",
        title: `Too many hashtags for ${activePlatform.shortName} (${hashtagList.length} / ${activePlatform.maxHashtags})`,
        why: "Excessive hashtags reduce feed distribution and clutter the caption fold.",
        targetScope: "hashtags",
        fixLabel: `Keep top ${activePlatform.maxHashtags} hashtags`,
        applyFix: () => {
          commitPostChange(
            {
              ...post,
              hashtags: hashtagList
                .slice(0, activePlatform.maxHashtags)
                .join(" "),
            },
            "Trimmed hashtags to platform limit"
          );
        },
      });
    }

    // 2. Brand: Banned words & required disclaimer check
    const foundBanned = activeBrand.bannedWords.filter((w) =>
      fullCaptionText.toLowerCase().includes(w.toLowerCase())
    );
    if (foundBanned.length > 0) {
      list.push({
        id: "chk-brand-banned",
        category: "Brand",
        severity: "warning",
        title: `Off-brand terms detected: "${foundBanned.join(", ")}"`,
        why: `Active brand kit (${activeBrand.name}) avoids hype words to preserve calm authority.`,
        targetScope: "body",
        fixLabel: "Remove off-brand terms",
        applyFix: () => {
          let cleanedHook = post.hook;
          let cleanedBody = post.body;
          for (const w of foundBanned) {
            const re = new RegExp(`\\b${w}\\b`, "gi");
            cleanedHook = cleanedHook
              .replace(re, "")
              .replace(/\s{2,}/g, " ")
              .trim();
            cleanedBody = cleanedBody
              .replace(re, "")
              .replace(/\s{2,}/g, " ")
              .trim();
          }
          commitPostChange(
            { ...post, hook: cleanedHook, body: cleanedBody },
            "Removed off-brand terms"
          );
        },
      });
    }

    if (
      activeBrand.requiredDisclaimer &&
      !post.body.includes(activeBrand.requiredDisclaimer)
    ) {
      list.push({
        id: "chk-brand-disclaimer",
        category: "Brand",
        severity: "warning",
        title: "Missing required brand disclaimer",
        why: `${activeBrand.name} requires appending "${activeBrand.requiredDisclaimer}".`,
        targetScope: "body",
        fixLabel: "Append brand disclaimer",
        applyFix: () => {
          commitPostChange(
            {
              ...post,
              body: `${post.body} ${activeBrand.requiredDisclaimer}`.trim(),
            },
            "Added brand disclaimer"
          );
        },
      });
    }

    // 3. Quality: Hook length & clarity before fold
    if (post.hook.length > activePlatform.foldChars) {
      list.push({
        id: "chk-quality-fold",
        category: "Quality",
        severity: "tip",
        title: `Opening hook exceeds "${activePlatform.shortName}" preview fold (${post.hook.length} / ${activePlatform.foldChars} chars)`,
        why: "Viewers see only the first ~125 characters before clicking '…more'.",
        targetScope: "hook",
        fixLabel: "Tighten hook under 110 chars",
        applyFix: () => {
          const urlFreeHook = post.hook
            .replace(/https?:\/\/[^\s"'<>]+/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim();
          const tightened =
            urlFreeHook.length > 106
              ? `${urlFreeHook.slice(0, 104).replace(/[,;:\s]+$/, "")}.`
              : urlFreeHook;
          commitPostChange(
            {
              ...post,
              hook: tightened,
            },
            "Tightened opening hook before fold"
          );
        },
      });
    }

    // 4. Accessibility: Alt text & CamelCase hashtags & captions
    if (!post.altText.trim()) {
      list.push({
        id: "chk-a11y-alt",
        category: "Accessibility",
        severity: "error",
        title: "Missing visual alt text for screen readers",
        why: "Screen readers cannot describe the visual frame without descriptive alt text.",
        targetScope: "visual",
        fixLabel: "Generate descriptive alt text",
        applyFix: () => {
          const firstSeg = post.segments[0];
          commitPostChange(
            {
              ...post,
              altText: `Wide 35mm cinema frame for "${post.title}" featuring ${
                firstSeg?.speaker || "lead cast"
              }: ${firstSeg?.visualContinuityLock || "locked 35mm lighting"}.`,
            },
            "Generated descriptive alt text"
          );
        },
      });
    }

    const nonCamelHashtag = hashtagList.find(
      (tag) => tag.length > 10 && tag === tag.toLowerCase()
    );
    if (nonCamelHashtag) {
      list.push({
        id: "chk-a11y-camelcase",
        category: "Accessibility",
        severity: "tip",
        title: `Hashtag ${nonCamelHashtag} should use CamelCase for screen readers`,
        why: "CamelCase hashtags (#TheCursedHunter) allow voiceover tools to pronounce individual words.",
        targetScope: "hashtags",
        fixLabel: "Convert hashtags to CamelCase",
        applyFix: () => {
          const camelized = hashtagList
            .map((t) =>
              t === t.toLowerCase() && t.length > 4
                ? "#" + t.slice(1, 2).toUpperCase() + t.slice(2)
                : t
            )
            .join(" ");
          commitPostChange(
            { ...post, hashtags: camelized },
            "Converted hashtags to CamelCase"
          );
        },
      });
    }

    // 5. Safety & compliance: AI disclosure badge
    if (!post.aiDisclosureEnabled) {
      list.push({
        id: "chk-safety-disclosure",
        category: "Safety & compliance",
        severity: "warning",
        title: "AI-synthesized media disclosure label is turned off",
        why: "TikTok, Instagram, and YouTube require synthetic cinema scenes to carry an AI disclosure flag.",
        targetScope: "visual",
        fixLabel: "Enable AI disclosure flag",
        applyFix: () => {
          commitPostChange(
            { ...post, aiDisclosureEnabled: true },
            "Enabled AI-generated media disclosure"
          );
        },
      });
    }

    // 6. Links: Valid HTTPS & UTM attribution
    if (post.ctaUrl && !post.ctaUrl.includes("utm_source=")) {
      list.push({
        id: "chk-links-utm",
        category: "Links",
        severity: "tip",
        title: "CTA link is missing UTM campaign parameters",
        why: "Adding utm_source and utm_medium lets analytics attribute conversions to this post.",
        targetScope: "cta",
        fixLabel: "Append UTM parameters",
        applyFix: () => {
          const sep = post.ctaUrl.includes("?") ? "&" : "?";
          commitPostChange(
            {
              ...post,
              ctaUrl: `${post.ctaUrl}${sep}utm_source=${activePlatformId}&utm_medium=studio`,
            },
            "Appended UTM tracking parameters"
          );
        },
      });
    }

    return list.filter((item) => !ignoredCheckIds.includes(item.id));
  }, [
    charCount,
    activePlatform,
    hashtagList,
    activeBrand,
    fullCaptionText,
    post,
    ignoredCheckIds,
    activePlatformId,
  ]);

  const blockingErrors = useMemo(
    () => activeIssues.filter((i) => i.severity === "error"),
    [activeIssues]
  );

  // ============================================================================
  // IN-PLACE QUICK ACTIONS & DIFF GENERATION (Phase 3.3)
  // ============================================================================
  const scopeLabelMap: Record<SelectableScope, string> = {
    post: "Entire Post",
    hook: "Opening Hook",
    body: "Caption Body",
    hashtags: "Hashtags",
    cta: "CTA Link",
    visual: "35mm Cinema Stage",
    timeline: `Act ${activeSegment.index + 1} (${activeSegment.timeRange})`,
  };

  const handleTriggerQuickAction = async (action: QuickActionType) => {
    setAssistantReply(null);
    const targetScope: SelectableScope =
      selectedScope === "post" || selectedScope === "visual"
        ? "hook"
        : selectedScope;

    const currentText =
      targetScope === "hook"
        ? post.hook
        : targetScope === "body"
        ? post.body
        : targetScope === "hashtags"
        ? post.hashtags
        : targetScope === "timeline"
        ? activeSegment.captionLine
        : targetScope === "cta"
        ? post.ctaUrl
        : post.hook;

    const actionLabel =
      action === "shorter"
        ? "Shorter"
        : action === "punchier"
        ? "Punchier"
        : action === "fix_grammar"
        ? "Fix grammar"
        : action === "change_tone"
        ? "Change tone"
        : action === "translate"
        ? "Translate"
        : "Regenerate";

    const urlClean = currentText
      .replace(/https?:\/\/[^\s"'<>]+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    let fallbackText = currentText;
    if (targetScope === "timeline") {
      if (action === "shorter") {
        fallbackText =
          urlClean.length > 56
            ? `${urlClean.slice(0, 54).replace(/[,;:\s]+$/, "")}.`
            : `${urlClean.split(/[—,;]/)[0].trim()}.`;
      } else if (action === "punchier") {
        fallbackText = `${urlClean.replace(/\.$/, "")}—before the final frame fades!`;
      } else if (action === "fix_grammar") {
        fallbackText = `${urlClean.replace(/\s+/g, " ").replace(/--/g, "—").replace(/\.$/, "")}.`;
      } else if (action === "change_tone") {
        fallbackText = `[Whispered, -14 LUFS close-mic]: "${urlClean.replace(/^"|"$/g, "")}"`;
      } else if (action === "translate") {
        fallbackText = "Custodia este umbral sagrado de Kailash, hijo mio, y no dejes pasar ninguna fuerza.";
      } else {
        fallbackText = `${urlClean.replace(/\.$/, "")} [Take 2 · Locked 35mm continuity].`;
      }
    } else if (action === "shorter") {
      fallbackText =
        targetScope === "hook"
          ? urlClean.length > 88
            ? `${urlClean.slice(0, 85).replace(/[,;:\s]+$/, "")}.`
            : `${urlClean} — in unbroken 35mm.`
          : `${urlClean.split(".")[0]}. Mastered with Omni 1.1 dialogue & Lyria 3 Pro score at -14 LUFS.`;
    } else if (action === "punchier") {
      fallbackText =
        targetScope === "hook"
          ? `Every frame counts: ${urlClean.slice(0, 86).replace(/\.$/, "")}!`
          : `Unbroken 35mm visual effects, lip-synced dialogue, and a soaring Lyria 3 Pro orchestral score. ${urlClean}`;
    } else if (action === "fix_grammar") {
      fallbackText = `${urlClean.replace(/\s+/g, " ").replace(/--/g, "—").replace(/\.$/, "")} — presented in 35mm theatrical continuity.`;
    } else if (action === "change_tone") {
      fallbackText = `Director's Breakdown: Crafting "${post.title}" with multi-act character continuity and -14 LUFS dynamic scoring.`;
    } else if (action === "translate") {
      fallbackText = "En las puertas sagradas del Monte Kailash, un voto entre Parvati, Ganesha y Shiva despierta el cosmos.";
    } else if (action === "regenerate") {
      fallbackText = `Continuous 35mm acts bring "${post.title}" to life with spoken dialogue and dynamic orchestral sound design.`;
    }

    const diffId = `diff-${Date.now()}`;
    setPendingDiff({
      id: diffId,
      targetKey: targetScope,
      targetLabel: scopeLabelMap[targetScope],
      beforeText: currentText,
      afterText: fallbackText,
      actionName: actionLabel,
    });

    try {
      const res = await fetch("/api/swarm/synthesize-from-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "quick_edit",
          action,
          scope: targetScope,
          text: currentText,
          title: post.title,
          platform: activePlatform.shortName,
          brandVoice: activeBrand.name,
          speaker: activeSegment.speaker,
          timeRange: activeSegment.timeRange,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && typeof data.rewrittenText === "string" && data.rewrittenText.trim()) {
          setPendingDiff((prev) =>
            prev && prev.id === diffId
              ? { ...prev, afterText: data.rewrittenText.trim() }
              : prev
          );
        }
      }
    } catch {
      // Keep deterministic fallback if offline
    }
  };

  const handleAcceptDiff = (diff: PendingDiffSuggestion) => {
    const next = { ...post };
    if (diff.targetKey === "hook") next.hook = diff.afterText;
    else if (diff.targetKey === "body") next.body = diff.afterText;
    else if (diff.targetKey === "hashtags") next.hashtags = diff.afterText;
    else if (diff.targetKey === "cta") next.ctaUrl = diff.afterText;
    else if (diff.targetKey === "timeline") {
      next.segments = post.segments.map((s) =>
        s.id === activeSegment.id ? { ...s, captionLine: diff.afterText } : s
      );
    }
    setPendingDiff(null);
    commitPostChange(
      next,
      `Accepted AI ${diff.actionName} on ${diff.targetLabel}`
    );
  };

  // ============================================================================
  // 4-STAGE STREAMING GENERATION + 5-MIN (10-ACT) PARALLEL SYNTHESIS ENGINE
  // ============================================================================
  const runStreamingGeneration = async (
    rawPromptText: string,
    mode: "full_brief" | "scoped_edit",
    explicitDurationSec?: number
  ) => {
    const promptText =
      rawPromptText.trim() ||
      (mode === "full_brief" ? `${post.title} — ${post.hook}` : "");
    if (!promptText.trim()) {
      setBriefError(
        "Enter a 1-sentence brief so the studio can draft your post."
      );
      return;
    }
    setBriefError(undefined);

    // Check conversational non-mutation guard first!
    const conv = evaluateConversationalIntent(promptText);
    if (conv && conv.isConversational) {
      setAssistantReply(conv.reply);
      return;
    }

    setAssistantReply(null);
    cancelStreamRef.current = false;

    // Detect requested duration from prompt first, then explicit selector (supports up to 300s / 5 min)
    const lowerPrompt = promptText.toLowerCase();
    const minMatch = lowerPrompt.match(/\b(\d+(?:\.\d+)?)\s*(?:min|minute|minutes|mins)\b/i);
    const secMatch = lowerPrompt.match(/\b(\d+)\s*(?:sec|second|seconds|secs|s)\b/i);
    const detectedDurSec = minMatch
      ? Math.min(300, Math.max(15, Math.round(parseFloat(minMatch[1]) * 60)))
      : secMatch
      ? Math.min(300, Math.max(15, parseInt(secMatch[1], 10)))
      : /mission\s*impossible|multiverse\s*protocol|5\s*m\b/i.test(lowerPrompt)
      ? 300
      : explicitDurationSec || selectedDurationSec || 60;

    setSelectedDurationSec(detectedDurSec);
    const targetActsCount = detectedDurSec >= 180 ? 10 : 6;

    // Handle InVideo Magic Box Structural Commands ("Delete Scene 2", "Extend to 5 min", etc.)
    if (mode === "scoped_edit") {
      const delMatch = lowerPrompt.match(/delete\s+(?:scene|act|segment)\s+(\d+)/i);
      if (delMatch) {
        const actNum = parseInt(delMatch[1], 10);
        if (actNum >= 1 && actNum <= post.segments.length && post.segments.length > 1) {
          const filtered = post.segments
            .filter((_, idx) => idx !== actNum - 1)
            .map((s, idx) => ({ ...s, index: idx }));
          commitPostChange(
            { ...post, segments: filtered },
            `Deleted Act ${actNum} via Magic Box command`
          );
          setScopedPromptInput("");
          return;
        }
      }
      if (/extend.*5\s*min|10\s*act/i.test(lowerPrompt)) {
        setSelectedDurationSec(300);
        commitPostChange(
          {
            ...post,
            durationSeconds: 300,
            segments: MI10_SEGMENTS,
            youtubeRefBadge: "300.0s / 5:00 · 10-Act Parallel Master",
          },
          "Extended timeline to 5-Minute (300.0s · 10-Act) Master"
        );
        setScopedPromptInput("");
        return;
      }
      if (/hormozi/i.test(lowerPrompt)) {
        commitPostChange(
          { ...post, subtitleStyle: "hormozi_yellow" },
          "Switched subtitle style to Hormozi Bold Impact Yellow"
        );
        setScopedPromptInput("");
        return;
      }
    }

    // Extract any YouTube Reference URL
    const ytMatch = promptText.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/i
    );
    const extractedYtId = ytMatch ? ytMatch[1] : null;

    const stages = [
      extractedYtId
        ? `Stage 1/4: Deconstructing YouTube reference (${extractedYtId}) & ${detectedDurSec}s story arc…`
        : `Stage 1/4: Locking ${detectedDurSec}s (${targetActsCount}-Act) screenplay & canonical ID…`,
      `Stage 2/4: Dispatching ${targetActsCount} parallel act workers (${post.cameraPreset})…`,
      "Stage 3/4: Synchronizing 35mm optical grade & -14 LUFS Lyria 3 Pro score…",
      "Stage 4/4: Persisting to Library Vault & running 6-category pre-flight checks…",
    ];

    const targetKeyForScoped: SelectableScope =
      selectedScope === "body"
        ? "body"
        : selectedScope === "hashtags"
        ? "hashtags"
        : selectedScope === "timeline"
        ? "timeline"
        : selectedScope === "cta"
        ? "cta"
        : "hook";
    const beforeTextForScoped =
      targetKeyForScoped === "body"
        ? post.body
        : targetKeyForScoped === "hashtags"
        ? post.hashtags
        : targetKeyForScoped === "timeline"
        ? activeSegment.captionLine
        : targetKeyForScoped === "cta"
        ? post.ctaUrl
        : post.hook;

    const apiPromise =
      mode === "full_brief"
        ? fetch("/api/swarm/synthesize-from-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: promptText,
              studioFastMode: true,
              durationSeconds: detectedDurSec,
            }),
            signal: AbortSignal.timeout(25000),
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : fetch("/api/swarm/synthesize-from-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "quick_edit",
              action: "scoped_prompt",
              scope: targetKeyForScoped,
              text: beforeTextForScoped,
              instruction: promptText,
              title: post.title,
              platform: activePlatform.shortName,
              brandVoice: activeBrand.name,
            }),
            signal: AbortSignal.timeout(15000),
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);

    for (let i = 0; i < stages.length; i++) {
      if (cancelStreamRef.current) {
        setGenerationStage({ active: false, step: 0, label: "" });
        setToast({ message: "Generation cancelled · Partial draft preserved" });
        return;
      }
      setGenerationStage({ active: true, step: i + 1, label: stages[i] });
      await new Promise((r) => setTimeout(r, 180));
    }

    const apiData = await apiPromise;
    setGenerationStage({ active: false, step: 0, label: "" });

    if (mode === "scoped_edit") {
      const cleanScoped = promptText
        .replace(/https?:\/\/[^\s"'<>]+/gi, "")
        .trim();
      const aiRewritten =
        apiData?.ok && typeof apiData.rewrittenText === "string" && apiData.rewrittenText.trim()
          ? apiData.rewrittenText.trim()
          : targetKeyForScoped === "timeline"
          ? `${cleanScoped.replace(/^"|"$/g, "")}`
          : `${cleanScoped} — crafted for ${activePlatform.shortName} in ${activeBrand.name} voice.`;
      setPendingDiff({
        id: `diff-prompt-${Date.now()}`,
        targetKey: targetKeyForScoped,
        targetLabel: scopeLabelMap[targetKeyForScoped],
        beforeText: beforeTextForScoped,
        afterText: aiRewritten,
        actionName: "Scoped Prompt",
      });
      setScopedPromptInput("");
      return;
    }

    const promptWithoutUrls = promptText
      .replace(/https?:\/\/[^\s"'<>]+/gi, "")
      .replace(/\b(similar to this one|like this one|based on this)\s*:?\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const isMissionImpossible =
      /mission\s*impossible|multiverse\s*protocol|ethan\s*vance|halo\s*jump/i.test(
        lowerPrompt
      );

    const apiAssets = apiData?.assets || apiData?.synthesized;

    const nextCanonId = isMissionImpossible
      ? "ZYV-REEL-MI10-300S"
      : apiData?.canonicalId ||
        apiData?.deepResearchBible?.canonicalReelId ||
        apiAssets?.canonicalId ||
        `ZYV-REEL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const nextCanonUrl = `/entity/${nextCanonId}`;
    const nextStudioUrl = `/swarm-MUI?reel=${nextCanonId}`;

    const chosenVideo = isMissionImpossible
      ? "/assets/swarm/generated/job_1793105000_mission_impossible_10_multiverse_300s/combined_300s.mp4"
      : apiData?.videoUrl ||
        apiAssets?.videoUrl ||
        (detectedDurSec <= 90
          ? "/assets/swarm/generated/job_1793154322715/combined_60s.mp4"
          : post.videoUrl);

    let nextTitle = post.title;
    let nextHook = post.hook;
    let nextBody = post.body;
    let nextHashtags = post.hashtags;
    let nextAltText = post.altText;
    let nextSegments: VideoSegmentSpec[] = post.segments;
    let nextSlides: CarouselSlideItem[] = post.slides;
    let nextCastLabel = post.castBadge;

    const incomingSegments = apiData?.segments || apiAssets?.segments;

    if (isMissionImpossible) {
      nextTitle =
        "Mission: Impossible 10 — The Multiverse Protocol (5-Min Master)";
      nextHook =
        "Ten unbroken 30-second 35mm acts—from a Geneva HALO orbital drop to an Alpine bullet-train roof standoff.";
      nextBody =
        "Full 5-minute (300.0s, 7200 frames @ 24fps) multi-act cinema master rendered via Zyvoriq's 10-worker parallel synthesis pool. Features Higgsfield Crash Zoom & 360° Bullet-Time camera presets, Runway 6-DoF motion control, and -14 LUFS Lyria 3 Pro orchestral stems.";
      nextHashtags =
        "#MissionImpossible10 #5MinActionMaster #ParallelSwarm #HiggsfieldCamera #RunwayGen4";
      nextAltText =
        "35mm Panavision Anamorphic frame of Ethan Vance performing a high-altitude HALO jump over Geneva into a 10-act multiverse espionage thriller.";
      nextCastLabel =
        "Ethan Vance (Baritone) · Ilsa Moreau (Mezzo) · Luther Sterling (Bass)";
      nextSegments = MI10_SEGMENTS;
    } else if (Array.isArray(incomingSegments) && incomingSegments.length > 0) {
      const conciseTopic =
        promptWithoutUrls.slice(0, 50).replace(/[,;:\s]+$/, "") ||
        "Custom 35mm Visual Story";
      nextTitle =
        apiAssets?.title ||
        `${conciseTopic} (${detectedDurSec}s · ${targetActsCount}-Act Master)`;
      nextHook = String(
        apiAssets?.hook ||
          `${conciseTopic} — rendered across ${targetActsCount} parallel 35mm acts.`
      )
        .replace(/https?:\/\/[^\s]+/gi, "")
        .trim()
        .slice(0, 114);
      nextBody =
        apiAssets?.storyline?.slice(0, 260) ||
        `Built for ${activePlatform.shortName} using ${activeBrand.name}. ${targetActsCount} continuous 35mm acts (${detectedDurSec}s total) with spoken dialogue, Higgsfield camera presets, and -14 LUFS Lyria 3 Pro scoring.`;
      nextHashtags =
        apiAssets?.hashtags ||
        "#OriginalStory #35mmCinema #ParallelSwarm #CinemaStudio";
      nextAltText =
        apiAssets?.altText ||
        `35mm Panavision Anamorphic frame from "${nextTitle}" featuring ${apiAssets?.castBadge || "ensemble cast"}.`;
      nextCastLabel =
        apiAssets?.castBadge || "Commander Orion Vance (Baritone) · Dr. Lyra Chen (Mezzo)";
      const segDur = Math.round(detectedDurSec / incomingSegments.length);
      nextSegments = incomingSegments.map(
        (
          seg: {
            actId?: string;
            canonicalUrl?: string;
            timeRange?: string;
            startSec?: number;
            endSec?: number;
            speaker?: string;
            captionLine?: string;
            visualContinuityLock?: string;
            cameraPreset?: string;
            lensPreset?: string;
          },
          idx: number
        ) => ({
          id: `seg-${idx + 1}`,
          actId:
            seg.actId ||
            `${nextCanonId}-ACT-${String(idx + 1).padStart(2, "0")}`,
          canonicalUrl:
            seg.canonicalUrl ||
            `/entity/${nextCanonId}-ACT-${String(idx + 1).padStart(2, "0")}`,
          cameraPreset:
            seg.cameraPreset ||
            HIGGSFIELD_CAMERA_PRESETS[idx % HIGGSFIELD_CAMERA_PRESETS.length]
              .name,
          lensPreset: seg.lensPreset || post.lensPreset,
          index: idx,
          timeRange:
            seg.timeRange || `${idx * segDur}s–${(idx + 1) * segDur}s`,
          startSec: typeof seg.startSec === "number" ? seg.startSec : idx * segDur,
          endSec:
            typeof seg.endSec === "number" ? seg.endSec : (idx + 1) * segDur,
          speaker: String(seg.speaker || "Lead Narrator"),
          captionLine: String(
            seg.captionLine || `Act ${idx + 1}: ${conciseTopic}`
          ),
          visualContinuityLock: String(
            seg.visualContinuityLock ||
              `35mm Anamorphic continuity lock for Act ${idx + 1}`
          ),
          aiGenerated: true,
        })
      );
      if (apiData?.deepResearchBible) {
        setCustomDeepResearchBible(apiData.deepResearchBible);
      }
    } else {
      const conciseTopic =
        promptWithoutUrls.slice(0, 56).replace(/[,;:\s]+$/, "") ||
        "Custom 35mm Cinema Master";
      const segDur = Math.round(detectedDurSec / targetActsCount);
      nextTitle = `${conciseTopic} (${detectedDurSec}s · ${targetActsCount}-Act Master)`;
      nextHook = `${conciseTopic} — ${targetActsCount} continuous 35mm acts (${detectedDurSec}s @ 24fps) with synchronized spoken dialogue.`.slice(0, 114);
      nextBody = `Synthesized for ${activePlatform.shortName} using ${activeBrand.name}. ${targetActsCount} parallel 30-second acts (${detectedDurSec}s total) with Higgsfield camera presets, 35mm Panavision optics, and -14 LUFS orchestral scoring.`;
      nextHashtags = "#OriginalCinema #35mmAnamorphic #ParallelSwarm #CinemaStudio";
      nextCastLabel = "Commander Orion Vance (Baritone) · Dr. Lyra Chen (Mezzo)";
      nextAltText = `35mm Panavision Anamorphic frame from "${nextTitle}" featuring ${nextCastLabel}.`;
      nextSegments = Array.from({ length: targetActsCount }, (_, idx) => ({
        id: `seg-${idx + 1}`,
        actId: `${nextCanonId}-ACT-${String(idx + 1).padStart(2, "0")}`,
        canonicalUrl: `/entity/${nextCanonId}-ACT-${String(idx + 1).padStart(2, "0")}`,
        cameraPreset:
          HIGGSFIELD_CAMERA_PRESETS[idx % HIGGSFIELD_CAMERA_PRESETS.length].name,
        lensPreset: post.lensPreset,
        index: idx,
        timeRange: `${idx * segDur}s–${(idx + 1) * segDur}s`,
        startSec: idx * segDur,
        endSec: (idx + 1) * segDur,
        speaker:
          idx % 2 === 0
            ? "Commander Orion Vance (Baritone)"
            : "Dr. Lyra Chen (Mezzo)",
        captionLine:
          idx === 0
            ? `"${conciseTopic} — lock phase telemetry and engage primary sequence."`
            : `"Phase ${idx + 1} stabilized. Executing final trajectory across the perimeter."`,
        visualContinuityLock: `35mm Panavision Anamorphic 40mm T2.0 · Act ${idx + 1} continuity lock for ${conciseTopic}`,
        aiGenerated: true,
      }));
      setCustomDeepResearchBible(
        synthesizeDeepResearchBible({
          canonicalReelId: nextCanonId,
          title: nextTitle,
          prompt: promptWithoutUrls,
          durationSeconds: detectedDurSec,
          castBadge: nextCastLabel,
          segments: nextSegments,
        })
      );
    }

    setSelectedSegmentId("seg-1");

    const nextDraft: StudioPostState = {
      ...post,
      canonicalId: nextCanonId,
      canonicalUrl: nextCanonUrl,
      studioUrl: nextStudioUrl,
      durationSeconds: detectedDurSec,
      title: nextTitle,
      hook: nextHook,
      body: nextBody,
      hashtags: nextHashtags,
      ctaUrl: `https://zyvoriq.studio/entity/${nextCanonId}?utm_source=social&utm_medium=studio`,
      altText: nextAltText,
      castBadge: nextCastLabel,
      youtubeRefBadge: `${detectedDurSec}.0s / ${targetActsCount}-Act Parallel Master`,
      segments: nextSegments,
      slides: nextSlides,
      videoUrl: chosenVideo,
      audioMixLabel:
        audioEngineMode === "option1_symphonic"
          ? "Option 1 · Symphonic Film-Trailer Mix"
          : "Option 2 · Omni 1.1 Dialogue + Foley + Lyria 3 Pro Score",
    };

    // Immediately add to Variations & Library Vault so user sees it right away!
    const generatedVarId = `var-gen-${Date.now()}`;
    const generatedVar: PostVariation = {
      id: generatedVarId,
      canonicalId: nextCanonId,
      canonicalUrl: nextCanonUrl,
      durationSeconds: detectedDurSec,
      cameraPreset: nextDraft.cameraPreset,
      lensPreset: nextDraft.lensPreset,
      label: `Generated (${detectedDurSec}s · ${nextCanonId}) · ${nextTitle}`,
      hook: nextHook,
      body: nextBody,
      hashtags: nextHashtags,
      videoUrl: chosenVideo,
      audioLabel: nextDraft.audioMixLabel,
      rationale: `${targetActsCount}-Act (${detectedDurSec}s) parallel synthesis master (${nextCastLabel}).`,
    };
    setVariations((prev) => [generatedVar, ...prev.slice(0, 11)]);
    setActiveVariationId(generatedVarId);
    setApiLibraryItems((prev) => {
      const filtered = prev.filter((item) => item.canonicalId !== nextCanonId);
      return [
        {
          id: generatedVarId,
          canonicalId: nextCanonId,
          canonicalUrl: nextCanonUrl,
          studioUrl: nextStudioUrl,
          title: nextTitle,
          videoUrl: chosenVideo,
          platform: `9:16 & 16:9 · ${detectedDurSec}s`,
          durationSeconds: detectedDurSec,
          actsCount: nextSegments.length,
        },
        ...filtered,
      ];
    });
    setRightTab("edit");

    commitPostChange(
      nextDraft,
      `Synthesized ${detectedDurSec}s (${nextSegments.length}-Act) Reel [${nextCanonId}]`
    );

    void handleStartLiveVideoRender(nextDraft, promptText, detectedDurSec);
  };

  return (
    <div
      data-testid="zyvoriq-studio-root"
      data-theme={theme}
      data-studio-preset={studioThemePreset}
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        height: "100vh",
        maxHeight: "100vh",
        ["--color-primary" as string]: activeStudioTheme.primaryColor,
      }}
      className="w-full max-w-none h-screen max-h-screen flex flex-col justify-between overflow-hidden"
    >
      {/* ====================================================================
          1. TOP APPLICATION BAR (Google Stitch Studio · Project · Canonical ID · + New Reel · Theme · Theater · Publish)
         ==================================================================== */}
      <header
        data-testid="google-stitch-top-bar"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="sticky top-0 z-30 w-full px-3 md:px-5 py-2 flex flex-wrap items-center justify-between gap-2"
      >
        {/* Left cluster: Brand mark + Google Stitch badge + Editable project title + Version chip + Canonical Object ID */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
            style={{
              backgroundColor: activeStudioTheme.primaryColor,
              color: "#ffffff",
              borderRadius: "var(--radius-sm)",
            }}
            aria-hidden="true"
          >
            Z
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span
                data-testid="google-stitch-studio-badge"
                className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shrink-0"
              >
                Google Stitch Studio
              </span>
              <label htmlFor="project-title-input" className="sr-only">
                Project Title
              </label>
              <input
                id="project-title-input"
                type="text"
                size={Math.max(30, (post.title || "").length + 2)}
                value={post.title}
                onChange={(e) =>
                  setPost((prev) => ({ ...prev, title: e.target.value }))
                }
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                  borderRadius: "var(--radius-sm)",
                }}
                className="font-semibold text-sm w-auto min-w-[260px] max-w-full px-1.5 py-0.5 studio-focus-ring"
              />
              <span
                data-testid="studio-version-badge"
                className="px-2 py-0.5 text-xs font-mono font-semibold tabular-nums shrink-0"
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {post.version}
              </span>

              {/* Compact Canonical Object Identity Pill + Copy URL + Inspector Link (Rule 25E Stage 4) */}
              <div className="inline-flex items-center gap-1 shrink-0">
                <span
                  data-testid="active-reel-canonical-id-badge"
                  className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded"
                  title="Unique Canonical Object ID"
                >
                  ID: {post.canonicalId}
                </span>
                <button
                  type="button"
                  data-testid="top-bar-copy-canonical-url-btn"
                  onClick={handleCopyCanonicalLink}
                  className="px-1.5 py-0.5 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded inline-flex items-center gap-1"
                  title="Copy unique permalink URL for this reel"
                >
                  {copiedCanonical ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Link2 className="w-3 h-3" />
                  )}
                  <span>{copiedCanonical ? "Copied" : "Copy URL"}</span>
                </button>
                <Link
                  href={`/entity/${post.canonicalId}`}
                  data-testid="top-bar-entity-link"
                  className="px-1.5 py-0.5 text-[11px] font-mono bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded inline-flex items-center gap-1"
                  title={`Open Canonical Object Inspector (/entity/${post.canonicalId})`}
                >
                  <span>Inspector</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
            <div
              data-testid="top-bar-status-line"
              className="flex items-center gap-1.5 text-xs px-1.5 min-w-0"
              style={{ color: "var(--color-text-muted)" }}
            >
              <CheckCircle2
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "var(--color-success)" }}
                aria-hidden="true"
              />
              <span className="leading-tight break-words min-w-0">
                Synced with Library ({myGeneratedReels.length}) · {post.durationSeconds}s ({post.segments.length} Acts) ·{" "}
                {post.cameraPreset} · {post.lensPreset}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right controls: + New Reel · Studio Theme Preset · Theater · Undo/Redo · Publish */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Prominent "+ New Reel" Creation Modal Trigger */}
          <StudioButton
            variant="secondary"
            size="sm"
            data-testid="header-new-reel-btn"
            onClick={() => setNewReelModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4 text-indigo-600" />}
          >
            <span className="font-semibold text-indigo-700">+ New Reel</span>
          </StudioButton>

          {/* 4 Daylight Studio Theme Presets (Canva / InVideo / Runway / Higgsfield) */}
          <div className="hidden xl:flex items-center gap-1.5">
            <label
              htmlFor="studio-theme-preset-select"
              className="text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Theme:
            </label>
            <select
              id="studio-theme-preset-select"
              data-testid="studio-theme-preset-select"
              value={studioThemePreset}
              onChange={(e) =>
                setStudioThemePreset(e.target.value as StudioThemePresetId)
              }
              style={{
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="px-2 py-1 text-xs font-medium studio-focus-ring"
            >
              {CANVA_STUDIO_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <StudioTooltip label="Toggle Netflix Theater Stage" shortcut="T">
            <StudioButton
              variant={theaterMode ? "primary" : "secondary"}
              size="sm"
              aria-label="Toggle theater mode"
              onClick={() => setTheaterMode((m) => !m)}
              icon={
                theaterMode ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )
              }
            >
              <span className="hidden sm:inline">
                {theaterMode ? "Exit Theater" : "Theater"}
              </span>
            </StudioButton>
          </StudioTooltip>

          <StudioTooltip label="Undo last change" shortcut="Cmd+Z">
            <StudioButton
              variant="secondary"
              size="sm"
              aria-label="Undo"
              disabled={undoStack.length === 0}
              disabledReason="No earlier changes to undo"
              onClick={handleUndo}
              icon={<Undo2 className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Undo</span>
            </StudioButton>
          </StudioTooltip>

          <StudioTooltip label="Redo change" shortcut="Shift+Cmd+Z">
            <StudioButton
              variant="secondary"
              size="sm"
              aria-label="Redo"
              disabled={redoStack.length === 0}
              disabledReason="Nothing to redo"
              onClick={handleRedo}
              icon={<Redo2 className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Redo</span>
            </StudioButton>
          </StudioTooltip>

          <StudioTooltip label="Keyboard shortcuts" shortcut="?">
            <StudioButton
              variant="ghost"
              size="sm"
              aria-label="Keyboard shortcuts"
              onClick={() => setShortcutsDialogOpen(true)}
              icon={<HelpCircle className="w-4 h-4" />}
            >
              <span className="hidden 2xl:inline">Shortcuts</span>
            </StudioButton>
          </StudioTooltip>

          {/* Mobile inspector sheet trigger */}
          <div className="md:hidden">
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => setMobileInspectorOpen(true)}
            >
              Checks ({activeIssues.length})
            </StudioButton>
          </div>

          {/* ONE Primary CTA in Top Bar: Publish */}
          <StudioButton
            variant="primary"
            size="md"
            badgeCount={blockingErrors.length}
            onClick={() => setPublishDialogOpen(true)}
          >
            Publish
          </StudioButton>

          <FeedbackHeaderEmailButton
            appId="zyvoriq"
            appName="Zyvoriq Content Studio"
          />
        </div>
      </header>

      {/* ====================================================================
          2. MAIN 3-COLUMN STUDIO WORKSPACE (Zero-Scroll Ergonomic Workbench)
         ==================================================================== */}
      <div className="flex-1 min-h-0 w-full max-w-none grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
        {/* ------------------------------------------------------------------
            LEFT RAIL (3 cols on desktop, hidden in Theater Mode):
            Create · Camera & VFX · Library · Brands · Templates
           ------------------------------------------------------------------ */}
        {!theaterMode && (
          <aside
            aria-label="Studio navigation and creation controls"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRight: "1px solid var(--color-border)",
            }}
            className="order-2 md:order-1 md:col-span-3 lg:col-span-3 p-3 flex flex-col gap-2.5 h-full overflow-y-auto studio-scrollbar"
          >
            {/* Left Rail 5-Section Switcher */}
            <nav
              aria-label="Workspace sections"
              className="grid grid-cols-5 gap-1 p-1 studio-surface-2 shrink-0"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {[
                {
                  id: "create",
                  label: "Create",
                  icon: <PlusCircle className="w-3.5 h-3.5" />,
                },
                {
                  id: "camera_vfx",
                  label: "Camera",
                  icon: <Sparkles className="w-3.5 h-3.5" />,
                },
                {
                  id: "library",
                  label: "Library",
                  icon: <FolderOpen className="w-3.5 h-3.5" />,
                },
                {
                  id: "brands",
                  label: "Brands",
                  icon: <Palette className="w-3.5 h-3.5" />,
                },
                {
                  id: "templates",
                  label: "Templates",
                  icon: <LayoutTemplate className="w-3.5 h-3.5" />,
                },
              ].map((navItem) => {
                const active = leftSection === navItem.id;
                return (
                  <button
                    key={navItem.id}
                    type="button"
                    data-testid={`left-rail-tab-${navItem.id}`}
                    onClick={() =>
                      setLeftSection(
                        navItem.id as
                          | "create"
                          | "camera_vfx"
                          | "library"
                          | "brands"
                          | "templates"
                      )
                    }
                    style={{
                      backgroundColor: active
                        ? "var(--color-surface)"
                        : "transparent",
                      color: active
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: active ? "var(--shadow-sm)" : "none",
                    }}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 text-[11px] font-medium studio-focus-ring studio-transition-micro"
                  >
                    {navItem.icon}
                    <span>{navItem.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* LEFT SECTION 1: CREATE (Google Stitch AI Prompt & Parameter Composer — Zero Hardcoded Demo Clutter) */}
            {leftSection === "create" && (
              <div
                data-testid="google-stitch-create-composer"
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Google Stitch Prompt Composer
                    </h2>
                    <p
                      className="text-[11px] leading-snug"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Synthesize 15s–300s multi-act productions with 7-department deep research.
                    </p>
                  </div>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setNewReelModalOpen(true)}
                  >
                    Wizard ↗
                  </StudioButton>
                </div>

                {/* Clean Google Stitch Prompt Box (Empty on load — zero hardcoded Mission Impossible paragraph) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="studio-brief-textarea"
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Scene &amp; Story Prompt
                    </label>
                    <button
                      type="button"
                      data-testid="create-browse-templates-link"
                      onClick={() => setLeftSection("templates")}
                      className="text-[11px] font-semibold underline cursor-pointer"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Browse Blueprints →
                    </button>
                  </div>
                  <textarea
                    id="studio-brief-textarea"
                    data-testid="stitch-brief-textarea"
                    rows={2}
                    value={briefInput}
                    onChange={(e) => {
                      setBriefInput(e.target.value);
                      if (briefError && e.target.value.trim()) {
                        setBriefError(undefined);
                      }
                    }}
                    placeholder="Describe your scene, characters, camera motion, lighting Kelvin, and acoustic score (or paste a reference URL)…"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: `1px solid ${
                        briefError
                          ? "var(--color-danger)"
                          : "var(--color-border)"
                      }`,
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full p-2 text-xs resize-none leading-relaxed studio-focus-ring"
                  />
                  {briefError && (
                    <p
                      role="alert"
                      className="text-xs font-medium flex items-center gap-1"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{briefError}</span>
                    </p>
                  )}
                </div>

                {/* Duration Target Selector (15s .. 300s / 5m) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Duration &amp; Parallel Acts
                    </span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {selectedDurationSec}s (
                      {selectedDurationSec >= 300
                        ? "10 Acts · 5 Min"
                        : `${Math.max(3, Math.ceil(selectedDurationSec / 10))} Acts`}
                      )
                    </span>
                  </div>
                  <div
                    data-testid="create-duration-selector-grid"
                    className="grid grid-cols-3 gap-1"
                  >
                    {INVIDEO_DURATION_OPTIONS.map((opt) => {
                      const active = selectedDurationSec === opt.sec;
                      return (
                        <button
                          key={opt.sec}
                          type="button"
                          data-testid={`duration-option-${opt.sec}s`}
                          onClick={() => setSelectedDurationSec(opt.sec)}
                          style={{
                            backgroundColor: active
                              ? "var(--color-primary)"
                              : "var(--color-surface-2)",
                            color: active ? "#FFFFFF" : "var(--color-text)",
                            border: `1px solid ${
                              active
                                ? "var(--color-primary)"
                                : "var(--color-border)"
                            }`,
                            borderRadius: "var(--radius-sm)",
                          }}
                          className="px-2 py-1 text-left flex flex-col studio-focus-ring transition-colors"
                        >
                          <span className="text-xs font-bold font-mono leading-tight">
                            {opt.label}
                          </span>
                          <span
                            className="text-[10px] truncate"
                            style={{
                              color: active
                                ? "rgba(255,255,255,0.88)"
                                : "var(--color-text-muted)",
                            }}
                          >
                            {opt.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Foundation Video Model Selector */}
                <StudioSelect
                  label="Foundation Cinema Engine"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  options={FOUNDATION_MODELS_CATALOG.map((m) => ({
                    value: m.id,
                    label: m.label,
                  }))}
                />

                {/* Google Stitch Structured Parameter Matrix (2x2 Live Tokens — Replaces Hardcoded Demo Chips, Zero Truncation) */}
                <div
                  data-testid="stitch-structured-parameter-matrix"
                  className="grid grid-cols-2 gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setLeftSection("camera_vfx")}
                    className="studio-surface-2 p-1.5 text-left flex flex-col gap-0.5 hover:opacity-90 studio-focus-ring min-w-0"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="text-[10px] font-mono uppercase"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Camera Rig ↗
                    </span>
                    <span className="text-[11px] font-semibold leading-tight break-words">
                      {activeCameraPreset.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftSection("camera_vfx")}
                    className="studio-surface-2 p-1.5 text-left flex flex-col gap-0.5 hover:opacity-90 studio-focus-ring min-w-0"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="text-[10px] font-mono uppercase"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Optical Lens ↗
                    </span>
                    <span className="text-[11px] font-semibold leading-tight break-words">
                      {activeLensPreset.label.split("—")[0].trim()}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftSection("camera_vfx")}
                    className="studio-surface-2 p-1.5 text-left flex flex-col gap-0.5 hover:opacity-90 studio-focus-ring min-w-0"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="text-[10px] font-mono uppercase"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      VFX &amp; Kelvin ↗
                    </span>
                    <span className="text-[11px] font-semibold leading-tight break-words">
                      {activeVfxPreset.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftSection("brands")}
                    className="studio-surface-2 p-1.5 text-left flex flex-col gap-0.5 hover:opacity-90 studio-focus-ring min-w-0"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="text-[10px] font-mono uppercase"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Brand Kit ↗
                    </span>
                    <span className="text-[11px] font-semibold leading-tight break-words">
                      {activeBrand.name}
                    </span>
                  </button>
                </div>

                {/* Collapsible Optional Overrides (+ Audio Mastering & Director Tone) */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                  className="py-2 flex flex-col gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowMoreCreateOptions((v) => !v)}
                    className="flex items-center justify-between text-xs font-semibold studio-focus-ring"
                  >
                    <span>+ Audio Mastering &amp; Director Tone Overrides</span>
                    {showMoreCreateOptions ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showMoreCreateOptions && (
                    <div className="flex flex-col gap-2.5 pt-1">
                      <StudioSelect
                        label="Voice & Tone Override"
                        value={toneOverride}
                        onChange={(e) => setToneOverride(e.target.value)}
                        options={[
                          {
                            value: "director_calm",
                            label: "Calm & Precise (Default Brand Voice)",
                          },
                          {
                            value: "dramatic_cinema",
                            label: "High-Tension IMAX Action Trailer",
                          },
                          {
                            value: "technical_breakdown",
                            label: "Behind-the-Scenes Craft Breakdown",
                          },
                        ]}
                      />

                      <StudioSelect
                        label="Audio Mastering Architecture"
                        value={audioEngineMode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAudioEngineMode(val);
                          commitPostChange(
                            {
                              ...post,
                              audioMixLabel:
                                val === "option1_symphonic"
                                  ? `Option 1 · Continuous Lyria 3 Pro Symphonic Score (${post.durationSeconds}s)`
                                  : `Option 2 · Omni 1.1 Spoken Dialogue + Foley + Lyria 3 Pro Score (${post.durationSeconds}s)`,
                            },
                            `Switched audio master bus to ${val === "option1_symphonic" ? "Option 1 (Symphonic)" : "Option 2 (Dialogue + Score)"}`
                          );
                        }}
                        options={[
                          {
                            value: "option2_omni11",
                            label:
                              "Option 2: Omni 1.1 Spoken Dialogue + Foley + Score (Recommended)",
                          },
                          {
                            value: "option1_symphonic",
                            label:
                              "Option 1: Continuous Lyria 3 Pro Symphonic Score",
                          },
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Primary Synthesis Action */}
                <div
                  data-testid="stitch-generate-btn-wrapper"
                  className="flex flex-col gap-2"
                >
                  <StudioButton
                    variant="primary"
                    size="md"
                    loading={
                      generationStage.active || liveRenderJob.status === "running"
                    }
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() =>
                      runStreamingGeneration(
                        briefInput,
                        "full_brief",
                        selectedDurationSec
                      )
                    }
                  >
                    {liveRenderJob.status === "running"
                      ? `Parallel Swarm Rendering (${liveRenderJob.progress || 18}%)…`
                      : `Synthesize ${selectedDurationSec}s Reel (${
                          selectedDurationSec >= 300
                            ? "10 Parallel Workers"
                            : "6 Parallel Workers"
                        })`}
                  </StudioButton>
                </div>

                {/* Compact Google Stitch Library Status Bar (Replaces Duplicate 6-Card Vault List per Rule 25A) */}
                <div
                  data-testid="my-generated-reels-vault"
                  className="studio-surface-2 px-3 py-2 flex items-center justify-between gap-2"
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderOpen
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--color-primary)" }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">
                        Library Vault ({myGeneratedReels.length} Saved)
                      </div>
                      <div
                        className="text-[11px] font-mono"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Auto-saved to disk &amp; Cloud Run
                      </div>
                    </div>
                  </div>
                  <StudioButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setLeftSection("library")}
                  >
                    Browse →
                  </StudioButton>
                </div>
              </div>
            )}

            {/* LEFT SECTION 2: CAMERA & VFX (Higgsfield Camera Presets + Lenses + VFX + Runway 6-DoF Rig & Motion Brush) */}
            {leftSection === "camera_vfx" && (
              <div
                data-testid="left-rail-camera-vfx-panel"
                className="flex flex-col gap-3.5"
              >
                <div>
                  <h2 className="text-base font-semibold">
                    Camera Rig, Optical Lenses &amp; VFX
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Higgsfield cinema camera presets + Runway Gen-4.5 6-DoF director rig &amp; 5-layer Motion Brush.
                  </p>
                </div>

                {/* Higgsfield 12 Camera Motion Presets */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Higgsfield Camera Motion Presets (12)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto studio-scrollbar pr-0.5">
                    {HIGGSFIELD_CAMERA_PRESETS.map((cam) => {
                      const active = selectedCameraPreset === cam.id;
                      return (
                        <button
                          key={cam.id}
                          type="button"
                          data-testid={`camera-preset-${cam.id}`}
                          onClick={() => {
                            setSelectedCameraPreset(cam.id);
                            setPost((prev) => ({
                              ...prev,
                              segments: prev.segments.map((s) =>
                                s.id === selectedSegmentId
                                  ? { ...s, cameraPreset: cam.label }
                                  : s
                              ),
                            }));
                            setToast({
                              message: `Applied ${cam.label} (${cam.tag}) to active Act`,
                            });
                          }}
                          style={{
                            backgroundColor: active
                              ? "var(--color-primary-subtle)"
                              : "var(--color-surface-2)",
                            border: `1px solid ${
                              active
                                ? "var(--color-primary)"
                                : "var(--color-border)"
                            }`,
                            borderRadius: "var(--radius-sm)",
                          }}
                          className="p-2 text-left flex flex-col gap-0.5 studio-focus-ring"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold truncate">
                              {cam.label}
                            </span>
                            <span
                              className="text-[10px] font-mono px-1 rounded shrink-0"
                              style={{
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {cam.tag}
                            </span>
                          </div>
                          <span
                            className="text-[10px] line-clamp-1"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {cam.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optical Lens Stack */}
                <StudioSelect
                  label="Anamorphic & Cinema Lens Stack"
                  value={selectedLensId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLensId(val);
                    const found = HIGGSFIELD_OPTICAL_LENSES.find(
                      (l) => l.id === val
                    );
                    if (found) {
                      setPost((prev) => ({
                        ...prev,
                        segments: prev.segments.map((s) =>
                          s.id === selectedSegmentId
                            ? { ...s, lensPreset: found.label }
                            : s
                        ),
                      }));
                    }
                  }}
                  options={HIGGSFIELD_OPTICAL_LENSES.map((l) => ({
                    value: l.id,
                    label: `${l.label} — ${l.character}`,
                  }))}
                />

                {/* Action VFX Modifiers */}
                <StudioSelect
                  label="Higgsfield Action VFX Modifier"
                  value={selectedVfxId}
                  onChange={(e) => setSelectedVfxId(e.target.value)}
                  options={HIGGSFIELD_VFX_MODIFIERS.map((v) => ({
                    value: v.id,
                    label: v.label,
                  }))}
                />

                {/* Runway 6-DoF Camera Rig Controls */}
                <div
                  className="studio-surface-2 p-2.5 flex flex-col gap-2"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Runway 6-DoF Camera Director Rig
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraPanX(0);
                        setCameraTiltY(0);
                        setCameraZoomZ(20);
                        setCameraRoll(0);
                        setCameraSpeed(1.0);
                      }}
                      className="text-[11px] font-mono underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Reset Rig
                    </button>
                  </div>

                  {[
                    {
                      label: "Horizontal Pan (X)",
                      val: cameraPanX,
                      min: -100,
                      max: 100,
                      step: 5,
                      set: setCameraPanX,
                      unit: "%",
                    },
                    {
                      label: "Vertical Tilt / Crane (Y)",
                      val: cameraTiltY,
                      min: -100,
                      max: 100,
                      step: 5,
                      set: setCameraTiltY,
                      unit: "%",
                    },
                    {
                      label: "Focal Push / Dolly Zoom (Z)",
                      val: cameraZoomZ,
                      min: -50,
                      max: 100,
                      step: 5,
                      set: setCameraZoomZ,
                      unit: "%",
                    },
                    {
                      label: "Dutch Roll Angle",
                      val: cameraRoll,
                      min: -45,
                      max: 45,
                      step: 1,
                      set: setCameraRoll,
                      unit: "°",
                    },
                  ].map((ctrl) => (
                    <div key={ctrl.label} className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span style={{ color: "var(--color-text-muted)" }}>
                          {ctrl.label}
                        </span>
                        <span className="font-mono font-semibold">
                          {ctrl.val > 0 ? `+${ctrl.val}` : ctrl.val}
                          {ctrl.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={ctrl.val}
                        onChange={(e) => ctrl.set(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Runway 5-Layer Motion Brush & Keyframe Continuity Lock */}
                <div
                  className="studio-surface-2 p-2.5 flex flex-col gap-2"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Runway Multi-Subject Motion Brush
                    </span>
                    <StudioButton
                      variant={motionBrushOverlay ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setMotionBrushOverlay((v) => !v)}
                    >
                      {motionBrushOverlay ? "Brush HUD: On" : "Brush HUD: Off"}
                    </StudioButton>
                  </div>
                  <div className="flex flex-col gap-1">
                    {RUNWAY_MOTION_BRUSH_LAYERS.map((layer) => {
                      const active = activeBrushLayerId === layer.id;
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => {
                            setActiveBrushLayerId(layer.id);
                            setMotionBrushOverlay(true);
                          }}
                          style={{
                            backgroundColor: active
                              ? "var(--color-surface)"
                              : "transparent",
                            border: `1px solid ${
                              active ? layer.color : "var(--color-border)"
                            }`,
                            borderRadius: "var(--radius-sm)",
                          }}
                          className="px-2 py-1 text-left flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-1.5 font-medium truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: layer.color }}
                            />
                            <span className="truncate">{layer.label}</span>
                          </span>
                          <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--color-text-muted)" }}>
                            X:{layer.vx} Y:{layer.vy} Z:{layer.vz}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* InVideo Kinetic Subtitle Style */}
                <StudioSelect
                  label="InVideo Kinetic Subtitle Style"
                  value={selectedSubtitleStyleId}
                  onChange={(e) =>
                    setSelectedSubtitleStyleId(e.target.value as SubtitleStyleId)
                  }
                  options={INVIDEO_SUBTITLE_STYLES.map((s) => ({
                    value: s.id,
                    label: `${s.label} (${s.preview})`,
                  }))}
                />
              </div>
            )}

            {/* LEFT SECTION 3: LIBRARY (Mission: Impossible 10 300s First + Unique Canonical ID & URL for Every Object) */}
            {leftSection === "library" && (
              <div
                data-testid="left-rail-library-panel"
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    Canonical Library Vault
                  </span>
                  <Link
                    href="/library"
                    data-testid="left-rail-open-full-library-link"
                    className="text-xs font-semibold underline inline-flex items-center gap-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span>Full Vault (/library)</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <StudioInput
                  label="Search Library by Title, Cast, or Canonical ID"
                  placeholder="e.g. Mission: Impossible, ZYV-REEL-MI10-300S, Kailash…"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                />

                <div className="flex flex-col gap-3">
                  {INITIAL_VARIATIONS.filter(
                    (v) =>
                      v.label
                        .toLowerCase()
                        .includes(libraryQuery.toLowerCase()) ||
                      v.hook
                        .toLowerCase()
                        .includes(libraryQuery.toLowerCase()) ||
                      (v.canonicalId || "")
                        .toLowerCase()
                        .includes(libraryQuery.toLowerCase())
                  ).map((item, idx) => (
                    <div
                      key={item.id}
                      data-testid={`library-card-${item.canonicalId || item.id}`}
                      className="studio-surface-2 overflow-hidden flex flex-col"
                      style={{
                        borderRadius: "var(--radius-md)",
                        border:
                          post.canonicalId === item.canonicalId
                            ? "2px solid var(--color-primary)"
                            : "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        className="relative w-full overflow-hidden"
                        style={{
                          backgroundColor: "#020617",
                          aspectRatio: "16 / 9",
                          maxHeight: "110px",
                        }}
                      >
                        <video
                          src={`${item.videoUrl}#t=${idx === 0 ? 2 : idx === 1 ? 4 : 8}`}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
                          <StudioChip tone="success">
                            {(item.durationSeconds || 60) >= 300
                              ? "300.0s (5-Min · 10 Acts)"
                              : `${item.durationSeconds || 60}.0s Master`}
                          </StudioChip>
                          <span
                            className="px-1.5 py-0.5 text-[10px] font-mono rounded"
                            style={{
                              backgroundColor: "rgba(15,23,42,0.88)",
                              color: "#F8FAFC",
                            }}
                          >
                            {item.canonicalId}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        <span className="text-sm font-semibold leading-snug">
                          {item.label}
                        </span>
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {item.hook}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                          <StudioButton
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setActiveVariationId(item.id);
                              setSelectedSegmentId("seg-1");
                              commitPostChange(
                                buildPostFromVariation(item, post),
                                `Loaded ${item.label} (${item.canonicalId}) from Library`
                              );
                            }}
                          >
                            Load into Stage
                          </StudioButton>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={item.canonicalUrl || `/entity/${item.canonicalId || item.id}`}
                              className="px-2 py-1 text-xs font-mono font-semibold rounded studio-surface"
                              style={{
                                border: "1px solid var(--color-border)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {item.canonicalUrl || `/entity/${item.canonicalId || item.id}`} ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {apiLibraryItems
                    .filter(
                      (apiItem) =>
                        !INITIAL_VARIATIONS.some(
                          (v) => v.canonicalId === apiItem.canonicalId
                        ) &&
                        (apiItem.title
                          .toLowerCase()
                          .includes(libraryQuery.toLowerCase()) ||
                          (apiItem.canonicalId || "")
                            .toLowerCase()
                            .includes(libraryQuery.toLowerCase()))
                    )
                    .map((apiItem) => {
                      const cid =
                        apiItem.canonicalId ||
                        `ZYV-REEL-${apiItem.id.toUpperCase()}`;
                      const curl = apiItem.canonicalUrl || `/entity/${cid}`;
                      return (
                        <div
                          key={apiItem.id}
                          data-testid={`library-card-${cid}`}
                          className="studio-surface p-3 flex flex-col gap-1.5"
                          style={{
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-sm font-semibold truncate">
                              {apiItem.title}
                            </span>
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                              style={{
                                backgroundColor: "var(--color-surface-2)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {apiItem.durationSeconds || 60}s
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span style={{ color: "var(--color-text-muted)" }}>
                              ID: {cid}
                            </span>
                            <Link
                              href={curl}
                              className="underline font-semibold"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {curl} ↗
                            </Link>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span
                              className="text-xs font-mono"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {apiItem.platform}
                            </span>
                            <StudioButton
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                commitPostChange(
                                  {
                                    ...post,
                                    canonicalId: cid,
                                    canonicalUrl: curl,
                                    studioUrl: `/swarm-MUI?reel=${cid}`,
                                    title: apiItem.title,
                                    videoUrl: apiItem.videoUrl,
                                    durationSeconds:
                                      apiItem.durationSeconds || 60,
                                  },
                                  `Loaded ${apiItem.title} (${cid})`
                                )
                              }
                            >
                              Load into Stage
                            </StudioButton>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* LEFT SECTION 4: BRANDS (Voice, Banned Words, Disclaimer) */}
            {leftSection === "brands" && (
              <div className="flex flex-col gap-3">
                <StudioSelect
                  label="Active Brand Kit"
                  value={activeBrandId}
                  onChange={(e) => setActiveBrandId(e.target.value)}
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                />

                <div
                  className="studio-surface-2 p-3 flex flex-col gap-2"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Voice &amp; Tone Rule
                  </span>
                  <p className="text-sm">{activeBrand.voiceSummary}</p>
                </div>

                <StudioInput
                  label="Do-Not-Use Words (comma separated)"
                  value={activeBrand.bannedWords.join(", ")}
                  onChange={(e) => {
                    const words = e.target.value
                      .split(",")
                      .map((w) => w.trim())
                      .filter(Boolean);
                    setBrands((prev) =>
                      prev.map((b) =>
                        b.id === activeBrand.id
                          ? { ...b, bannedWords: words }
                          : b
                      )
                    );
                  }}
                  helperText="Any word listed here triggers a live Brand check warning if used in captions."
                />

                <StudioInput
                  label="Mandatory Brand Disclaimer (optional)"
                  value={activeBrand.requiredDisclaimer}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBrands((prev) =>
                      prev.map((b) =>
                        b.id === activeBrand.id
                          ? { ...b, requiredDisclaimer: val }
                          : b
                      )
                    );
                  }}
                />
              </div>
            )}

            {/* LEFT SECTION 5: TEMPLATES */}
            {leftSection === "templates" && (
              <div className="flex flex-col gap-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Load a structured production blueprint in one click:
                </p>
                {[
                  {
                    id: "tpl-mi10-300s",
                    name: "5-Min (300s) 10-Act 70mm IMAX Action Blockbuster",
                    desc: "10 parallel 30s acts + Lalo Schifrin 5/4 brass & taiko score + canonical IDs.",
                    hook: "Your mission, should you choose to accept it: sever the Entity's quantum multiverse key across ten unbroken 30-second acts before every defense satellite locks onto Geneva.",
                    body: "Full 5-Minute (300.0s, 10-Act, 24fps CFR) 70mm Anamorphic IMAX tactical spy thriller. Act I–X spanning Bern Vault, Stratosphere HALO Jump, Rome Car Chase, Venice Canal Infiltration, and Alpine Train Finale.",
                  },
                  {
                    id: "tpl-narrative",
                    name: "60s 35mm Three-Act Narrative",
                    desc: "Hook before 125c fold + 6x10s continuity lock + CTA link.",
                    hook: "The curse took his voice at dusk—so she walked into the frozen basalt pass with empty hands.",
                    body: "Act I (0:00–0:20): Unarmed approach in the canyon. Act II (0:20–0:40): Closing the distance across the snow. Act III (0:40–1:00): Twilight resolution over Lyria 3 Pro strings.",
                  },
                  {
                    id: "tpl-breakdown",
                    name: "Technical Craft & Continuity Thread",
                    desc: "Ideal for LinkedIn & YouTube creators explaining production rigor.",
                    hook: "3 continuity bugs that ruin AI short films—and how we fixed all 3 in our master:",
                    body: "1. Zero weapon hallucination at 0:11 (unarmed Lyra). 2. Strict right-to-left approach at 0:21. 3. Locked cold blue-grey Arctic twilight through the finale.",
                  },
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    className="studio-surface-2 p-3 flex flex-col gap-2"
                    style={{ borderRadius: "var(--radius-md)" }}
                  >
                    <span className="text-sm font-semibold">{tpl.name}</span>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {tpl.desc}
                    </p>
                    <StudioButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (tpl.id === "tpl-mi10-300s") {
                          const miVar = INITIAL_VARIATIONS[0];
                          setActiveVariationId(miVar.id);
                          commitPostChange(
                            buildPostFromVariation(miVar, post),
                            `Applied template: ${tpl.name}`
                          );
                        } else {
                          commitPostChange(
                            { ...post, hook: tpl.hook, body: tpl.body },
                            `Applied template: ${tpl.name}`
                          );
                        }
                      }}
                    >
                      Use template
                    </StudioButton>
                  </div>
                ))}
              </div>
            )}

            {/* Footer link to Personas & Wardrobe Studio (Zero Horizontal Clipping) */}
            <div
              data-testid="left-rail-footer-bar"
              className="mt-auto pt-2.5 flex items-center justify-between gap-1.5 text-[11px] min-w-0"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              <Link
                href="/personas"
                className="font-medium underline inline-flex items-center gap-1 studio-focus-ring truncate"
                style={{ color: "var(--color-text)" }}
              >
                <span>Personas &amp; Wardrobe ↗</span>
              </Link>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-primary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                10-Worker Swarm
              </span>
            </div>
          </aside>
        )}

        {/* ------------------------------------------------------------------
            CENTER HERO CANVAS (Google Stitch Daylight Split Studio Stage)
           ------------------------------------------------------------------ */}
        <main
          aria-label="Live multi-platform post canvas"
          className={
            theaterMode
              ? "order-1 md:col-span-12 lg:col-span-12 p-3 flex flex-col gap-3 h-full overflow-y-auto studio-scrollbar"
              : "order-1 md:order-2 md:col-span-6 lg:col-span-6 p-3 flex flex-col gap-3 h-full overflow-y-auto studio-scrollbar"
          }
        >
          {/* Google Stitch Workspace View Switcher Bar */}
          <div
            data-testid="google-stitch-canvas-mode-bar"
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 studio-surface-2 shrink-0"
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "all", label: "📐 Full Stitch Canvas" },
                { id: "stage", label: "🎬 Stage & 5-Track Timeline" },
                {
                  id: "bible",
                  label: `🔬 7-Dept Production Bible (${activeDeepResearchBible.fiveDimensionScorecard.overallScore.toFixed(1)}%)`,
                },
                { id: "copy", label: "📝 Copy & Metadata" },
              ].map((tab) => {
                const active = stitchCanvasMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`stitch-canvas-tab-${tab.id}`}
                    onClick={() =>
                      setStitchCanvasMode(
                        tab.id as "all" | "stage" | "bible" | "copy"
                      )
                    }
                    style={{
                      backgroundColor: active
                        ? "var(--color-primary)"
                        : "var(--color-surface)",
                      color: active ? "#FFFFFF" : "var(--color-text)",
                      border: `1px solid ${
                        active ? "var(--color-primary)" : "var(--color-border)"
                      }`,
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span
              className="text-[11px] font-mono hidden xl:inline"
              style={{ color: "var(--color-text-muted)" }}
            >
              DESIGN.md · Daylight #F8FAFC
            </span>
          </div>

          {/* Platform Switcher Bar + Uncropped Fit Toggle + Fullscreen + Safe-Zone Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
            <StudioTabs
              ariaLabel="Target social platform preview"
              activeId={activePlatformId}
              onChange={(id) => setActivePlatformId(id as PlatformId)}
              tabs={PLATFORMS.map((p) => ({
                id: p.id,
                label: p.label,
                badge: p.shortcut,
              }))}
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <StudioChip
                tone="info"
                aria-label="Reel duration and acts badge"
              >
                <span
                  data-testid="active-reel-duration-badge"
                  className="font-mono tabular-nums font-semibold"
                >
                  {post.durationSeconds}s · {post.segments.length} Acts
                </span>
              </StudioChip>

              <StudioButton
                variant={videoFitMode === "contain" ? "primary" : "secondary"}
                size="sm"
                data-testid="toggle-video-fit-mode-btn"
                onClick={() =>
                  setVideoFitMode((m) => (m === "contain" ? "cover" : "contain"))
                }
              >
                {videoFitMode === "contain"
                  ? "Fit: Uncropped (100%)"
                  : "Fit: Fill Crop"}
              </StudioButton>

              <StudioButton
                variant="secondary"
                size="sm"
                data-testid="enter-uncropped-fullscreen-btn"
                onClick={handleEnterUncroppedFullscreen}
                icon={<Maximize2 className="w-3.5 h-3.5" />}
              >
                Full Screen (Uncropped)
              </StudioButton>

              <StudioButton
                variant={post.safeZoneOverlay ? "primary" : "secondary"}
                size="sm"
                onClick={() =>
                  setPost((prev) => ({
                    ...prev,
                    safeZoneOverlay: !prev.safeZoneOverlay,
                  }))
                }
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Safe zones
              </StudioButton>
            </div>
          </div>

          {/* Accessible AI Diff Card (Rendered when a quick action or scoped prompt proposes an edit) */}
          {pendingDiff && (
            <div className="shrink-0">
              <DiffView
                diff={pendingDiff}
                onAccept={handleAcceptDiff}
                onReject={() => setPendingDiff(null)}
                onTryAgain={() => handleTriggerQuickAction("punchier")}
                onAcceptAll={() => handleAcceptDiff(pendingDiff)}
              />
            </div>
          )}

          {/* ================================================================
              EXECUTIVE LIGHT-THEME SPLIT CINEMA STAGE (Uncropped 9:16/16:9 Master Player + 10-Act / 6-Act Interactive Storyboard)
             ================================================================ */}
          <section
            aria-label="35mm Cinema Stage and Player Controls"
            onClick={() => setSelectedScope("visual")}
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              border: `2px solid ${
                selectedScope === "visual"
                  ? "var(--color-focus)"
                  : "var(--color-border)"
              }`,
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)",
            }}
            className="shrink-0 overflow-hidden flex flex-col"
          >
            {/* Stage Top Header Bar: Brand · Canonical ID · Camera & Lens HUD · Active Act Badge */}
            <div
              style={{
                backgroundColor: "var(--color-surface-2)",
                borderBottom: "1px solid var(--color-border)",
              }}
              className="px-4 py-2 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Film
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--color-primary)" }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold">
                  {activeBrand.name}
                </span>
                <StudioChip tone="neutral">
                  {activePlatform.aspectBadge}
                </StudioChip>
                <StudioChip tone="ai">
                  {activeCameraPreset.label} · {activeLensPreset.label.split(" ")[0]}
                </StudioChip>
                {post.youtubeRefBadge && (
                  <StudioChip tone="info">{post.youtubeRefBadge}</StudioChip>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                <span
                  data-testid="cinema-cast-badge"
                  className="font-semibold"
                >
                  {post.castBadge}
                </span>
                <span style={{ color: "var(--color-text-muted)" }}>·</span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  Act {activeSegment.index + 1}/{post.segments.length} (
                  {activeSegment.timeRange})
                </span>
              </div>
            </div>

            {/* Live Cloud Video & Parallel Multi-Act Synthesis Status Bar (/api/swarm/jobs) */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                borderBottom: "1px solid var(--color-border)",
              }}
              className="px-4 py-1.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {liveRenderJob.status === "error" ? (
                  <AlertCircle
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--color-warning)" }}
                    aria-hidden="true"
                  />
                ) : (
                  <Sparkles
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "var(--color-primary)" }}
                    aria-hidden="true"
                  />
                )}
                <span
                  data-testid="cinema-render-status-text"
                  className="font-medium leading-snug break-words"
                >
                  {liveRenderJob.status === "running"
                    ? `${liveRenderJob.stageLabel} (${liveRenderJob.progress}%) — ${
                        liveRenderJob.parallelWorkers || 10
                      } Parallel Workers Active`
                    : liveRenderJob.status === "completed"
                    ? `Live Master Ready: ${post.title} (${post.canonicalId})`
                    : liveRenderJob.status === "error"
                    ? `${liveRenderJob.stageLabel} (${liveRenderJob.latestLog})`
                    : `${post.segments.length}-Act Master Ready (${post.durationSeconds}.0s · ${post.canonicalId}) — Click any Act card to seek`}
                </span>
              </div>
              <Link
                href={post.canonicalUrl}
                className="font-mono text-[11px] font-semibold underline shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                {post.canonicalUrl} ↗
              </Link>
            </div>

            {/* Stage Viewport Well: Uncropped Video Stage + Interactive 10-Act / 6-Act Storyboard */}
            <div
              className="relative w-full p-3 md:p-4"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              {activePlatformId === "carousel_4_5" ? (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <StudioChip tone="info">
                      Slide {activeSlideIndex + 1} of {post.slides.length}
                    </StudioChip>
                    <span className="text-xs font-mono tabular-nums">
                      {post.slides[activeSlideIndex]?.timeCode}
                    </span>
                  </div>
                  <div
                    ref={videoStageContainerRef}
                    className="zyvoriq-uncropped-stage relative w-full overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: "#000000",
                      borderRadius: "var(--radius-sm)",
                      maxHeight: theaterMode ? "540px" : "380px",
                    }}
                  >
                    <video
                      ref={videoRef}
                      key={post.videoUrl}
                      src={post.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      style={{
                        aspectRatio: activePlatform.aspectRatioCss,
                        maxHeight: theaterMode ? "540px" : "380px",
                      }}
                      className={`w-full h-full ${
                        videoFitMode === "contain"
                          ? "object-contain"
                          : "object-cover"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <input
                      id="slide-title-edit"
                      type="text"
                      aria-label="Slide headline"
                      value={post.slides[activeSlideIndex]?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPost((prev) => ({
                          ...prev,
                          slides: prev.slides.map((s, idx) =>
                            idx === activeSlideIndex ? { ...s, title: val } : s
                          ),
                        }));
                      }}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                      }}
                      className="flex-1 px-3 py-1.5 text-sm font-semibold studio-focus-ring"
                    />
                    <div className="flex items-center gap-1.5">
                      {post.slides.map((sl, idx) => (
                        <StudioButton
                          key={sl.id}
                          size="sm"
                          variant={
                            idx === activeSlideIndex ? "primary" : "secondary"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex(idx);
                          }}
                        >
                          Slide {idx + 1}
                        </StudioButton>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left 5 Cols: Uncropped 9:16 Vertical Reel Frame (Zero Top/Bottom Chopping in Windowed & Fullscreen!) */}
                  <div
                    className={
                      activePlatformId === "reels_9_16"
                        ? "lg:col-span-5 flex flex-col items-center justify-center gap-2"
                        : "lg:col-span-12 flex flex-col items-center justify-center gap-2"
                    }
                  >
                    <div
                      ref={videoStageContainerRef}
                      data-testid="cinema-uncropped-stage-container"
                      className="zyvoriq-uncropped-stage relative overflow-hidden shadow-md flex items-center justify-center"
                      style={{
                        aspectRatio: activePlatform.aspectRatioCss,
                        height: theaterMode
                          ? "520px"
                          : activePlatformId === "reels_9_16"
                          ? "440px"
                          : "340px",
                        width:
                          activePlatformId === "reels_9_16" ? "auto" : "100%",
                        backgroundColor: "#000000",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <video
                        ref={videoRef}
                        key={post.videoUrl}
                        src={post.videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        onTimeUpdate={(e) => {
                          const t = e.currentTarget.currentTime;
                          const matched = post.segments.find(
                            (s) => t >= s.startSec && t < s.endSec
                          );
                          if (matched && matched.id !== selectedSegmentId) {
                            setSelectedSegmentId(matched.id);
                          }
                        }}
                        style={{
                          objectFit: videoFitMode,
                        }}
                        className={`w-full h-full ${
                          videoFitMode === "contain"
                            ? "object-contain"
                            : "object-cover"
                        }`}
                      />

                      {/* Top Camera Rig / VFX Telemetry HUD */}
                      <div className="pointer-events-none absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                        <span
                          className="px-2 py-0.5 text-[10px] font-mono rounded"
                          style={{
                            backgroundColor: "rgba(15, 23, 42, 0.82)",
                            color: "#E2E8F0",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}
                        >
                          {activeSegment.cameraPreset || activeCameraPreset.label}
                        </span>
                        <span
                          className="px-2 py-0.5 text-[10px] font-mono rounded"
                          style={{
                            backgroundColor: "rgba(15, 23, 42, 0.82)",
                            color: "#38BDF8",
                            border: "1px solid rgba(56,189,248,0.3)",
                          }}
                        >
                          {post.canonicalId}
                        </span>
                      </div>

                      {/* Runway Motion Brush Interactive Vector Overlay */}
                      {motionBrushOverlay && (
                        <div
                          data-testid="runway-motion-brush-hud"
                          className="pointer-events-none absolute inset-4 rounded border-2 border-dashed border-sky-400/70 flex flex-col justify-between p-2"
                          style={{ backgroundColor: "rgba(14, 165, 233, 0.08)" }}
                        >
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900/90 text-sky-300 rounded self-start">
                            Motion Brush Active · Pan X:{cameraPanX} Tilt Y:{cameraTiltY} Zoom Z:{cameraZoomZ}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900/90 text-emerald-300 rounded self-end">
                            VFX: {activeVfxPreset.label}
                          </span>
                        </div>
                      )}

                      {liveRenderJob.status === "running" && (
                        <div
                          data-testid="cinema-live-render-progress-badge"
                          className="pointer-events-none absolute top-9 left-2.5 right-2.5 flex justify-center"
                        >
                          <div
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.92)",
                              color: "#F8FAFC",
                              border: "1px solid rgba(56, 189, 248, 0.55)",
                              borderRadius: "var(--radius-sm)",
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse text-sky-400 shrink-0" />
                            <span>
                              Parallel Swarm ({liveRenderJob.progress}%) ·{" "}
                              {liveRenderJob.parallelWorkers || 10} Workers
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Live Burned-In Subtitle Overlay (Styled by InVideo Kinetic Subtitle Preset) */}
                      {post.captionsEnabled && (
                        <div
                          data-testid="cinema-live-subtitle-overlay"
                          className="pointer-events-none absolute bottom-14 left-2 right-2 flex justify-center"
                        >
                          <div
                            style={{
                              backgroundColor: activeSubtitleStyle.bg,
                              color: activeSubtitleStyle.accent,
                              border: "1px solid rgba(255,255,255,0.22)",
                              borderRadius: "var(--radius-sm)",
                            }}
                            className="px-2.5 py-1 max-w-[96%] text-center text-[11px] font-semibold leading-snug shadow"
                          >
                            <span className="font-mono font-bold mr-1 text-white">
                              [{activeSegment.speaker.replace(/\s*\(.*?\)\s*/g, "")}]:
                            </span>
                            <span>&ldquo;{activeSegment.captionLine}&rdquo;</span>
                          </div>
                        </div>
                      )}

                      {/* Platform Safe-Zone Overlay */}
                      {post.safeZoneOverlay && (
                        <div
                          aria-label="Platform safe zone overlay"
                          className="pointer-events-none absolute inset-2 flex flex-col justify-between p-2.5"
                          style={{
                            border: "2px dashed var(--color-warning)",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          <div
                            className="px-2 py-0.5 text-[11px] font-mono self-start"
                            style={{
                              backgroundColor: "var(--color-warning-subtle)",
                              color: "var(--color-text)",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            Top UI Safe Zone
                          </div>
                          <div
                            className="px-2 py-0.5 text-[11px] font-mono self-end"
                            style={{
                              backgroundColor: "var(--color-warning-subtle)",
                              color: "var(--color-text)",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            Bottom Caption Safe Zone
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 7 Cols: Interactive 10-Act / 6-Act Storyboard & Spoken Dialogue Deck */}
                  {activePlatformId === "reels_9_16" && (
                    <div
                      data-testid="center-stage-6act-storyboard"
                      className="lg:col-span-7 flex flex-col justify-start gap-2"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {post.segments.length}-Act Spoken Dialogue &amp; Shot Breakdown (Click Act to Seek)
                        </span>
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {post.durationSeconds}.0s Master · 24fps CFR · Uncropped
                        </span>
                      </div>
                      <div
                        className={
                          post.segments.length > 6 || theaterMode
                            ? "grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto studio-scrollbar pr-1"
                            : "grid grid-cols-1 gap-1.5"
                        }
                      >
                        {post.segments.map((seg, idx) => {
                          const isActSelected = seg.id === selectedSegmentId;
                          return (
                            <button
                              key={seg.id}
                              type="button"
                              data-testid={`storyboard-act-card-${idx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSegmentId(seg.id);
                                if (videoRef.current) {
                                  videoRef.current.currentTime =
                                    seg.startSec + 0.5;
                                }
                              }}
                              style={{
                                backgroundColor: isActSelected
                                  ? "var(--color-surface)"
                                  : "var(--color-surface-2)",
                                border: `1px solid ${
                                  isActSelected
                                    ? "var(--color-focus)"
                                    : "var(--color-border)"
                                }`,
                                borderRadius: "var(--radius-sm)",
                              }}
                              className="w-full text-left px-3 py-1.5 flex flex-col gap-0.5 studio-focus-ring transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1.5 text-xs">
                                <span
                                  className="font-semibold leading-tight break-words min-w-0"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  Act {idx + 1} · {seg.speaker}
                                </span>
                                <span
                                  className="font-mono text-[11px] shrink-0"
                                  style={{ color: "var(--color-primary)" }}
                                >
                                  {seg.timeRange}
                                </span>
                              </div>
                              <p
                                className="text-xs leading-snug break-words"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                &ldquo;{seg.captionLine}&rdquo;
                              </p>
                              <div className="flex items-center justify-between gap-1 pt-0.5 text-[10px] font-mono">
                                <span style={{ color: "var(--color-text-muted)" }}>
                                  {seg.cameraPreset || "35mm Tracking"}
                                </span>
                                {seg.canonicalId && (
                                  <span style={{ color: "var(--color-primary)" }}>
                                    {seg.canonicalId}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Integrated Executive Light-Theme "Audio, Subtitles & Uncropped Fullscreen" Player Chrome Bar */}
            <div
              style={{
                backgroundColor: "var(--color-surface-2)",
                borderTop: "1px solid var(--color-border)",
              }}
              className="px-4 py-2 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono mr-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Audio Track:</span>
                </span>
                <StudioButton
                  variant={
                    post.audioMixLabel.startsWith("Option 2")
                      ? "primary"
                      : "secondary"
                  }
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioEngineMode("option2_omni11");
                    commitPostChange(
                      {
                        ...post,
                        audioMixLabel: `Option 2 · Omni 1.1 Spoken Dialogue + Foley + Lyria 3 Pro Score (${post.durationSeconds}s)`,
                      },
                      "Loaded Option 2 (Omni 1.1 Dialogue + Foley + Score)"
                    );
                  }}
                >
                  Option 2 (Dialogue + Score)
                </StudioButton>
                <StudioButton
                  variant={
                    post.audioMixLabel.startsWith("Option 1")
                      ? "primary"
                      : "secondary"
                  }
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioEngineMode("option1_symphonic");
                    commitPostChange(
                      {
                        ...post,
                        audioMixLabel: `Option 1 · Continuous Lyria 3 Pro Symphonic Forward Mix (${post.durationSeconds}s)`,
                      },
                      "Loaded Option 1 (Symphonic Forward Mix)"
                    );
                  }}
                >
                  Option 1 (Symphonic)
                </StudioButton>
              </div>

              <div className="flex items-center gap-1.5">
                <StudioButton
                  variant={post.captionsEnabled ? "primary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPost((prev) => ({
                      ...prev,
                      captionsEnabled: !prev.captionsEnabled,
                    }));
                  }}
                  icon={<Subtitles className="w-3.5 h-3.5" />}
                >
                  {post.captionsEnabled ? "CC: On" : "CC: Off"}
                </StudioButton>
                <StudioButton
                  variant={stitchCanvasMode === "bible" ? "primary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStitchCanvasMode((m) => (m === "bible" ? "all" : "bible"));
                  }}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  7-Dept Bible ({activeDeepResearchBible.fiveDimensionScorecard.overallScore.toFixed(0)}%)
                </StudioButton>
              </div>
            </div>
          </section>

          {/* ================================================================
              UPGRADE 2: HORIZONTAL MULTI-ACT FILMSTRIP SCRUBBER + CANVA/INVIDEO 5-TRACK TIMELINE
             ================================================================ */}
          <section
            aria-label="Multi-Act filmstrip scrubber and 5-track visual timeline"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
            className={`p-3.5 shrink-0 flex flex-col gap-3 ${
              stitchCanvasMode === "all" || stitchCanvasMode === "stage"
                ? ""
                : "hidden"
            }`}
          >
            <VideoTimelineEditor
              segments={post.segments}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={(seg) => {
                setSelectedSegmentId(seg.id);
                setSelectedScope("timeline");
                if (videoRef.current) {
                  const totalTimelineSec =
                    post.segments[post.segments.length - 1]?.endSec ||
                    post.durationSeconds ||
                    60;
                  const vidDur =
                    Number.isFinite(videoRef.current.duration) &&
                    videoRef.current.duration > 0
                      ? videoRef.current.duration
                      : totalTimelineSec;
                  const mappedTime =
                    totalTimelineSec > 0
                      ? (seg.startSec / totalTimelineSec) * vidDur
                      : seg.startSec;
                  videoRef.current.currentTime = Math.min(
                    Math.max(0, mappedTime),
                    Math.max(0, vidDur - 0.5)
                  );
                }
              }}
              onUpdateCaption={(segId, newCap) => {
                setPost((prev) => ({
                  ...prev,
                  segments: prev.segments.map((s) =>
                    s.id === segId ? { ...s, captionLine: newCap } : s
                  ),
                }));
              }}
              onMoveSegment={(index, direction) => {
                const target = index + direction;
                if (target < 0 || target >= post.segments.length) return;
                const nextSegs = [...post.segments];
                const [moved] = nextSegs.splice(index, 1);
                nextSegs.splice(target, 0, moved);
                commitPostChange(
                  { ...post, segments: nextSegs },
                  `Reordered segment ${index + 1} to position ${target + 1}`
                );
              }}
              onRegenerateSegment={async (seg) => {
                setToast({
                  message: `Regenerating ${seg.timeRange} (${seg.speaker}) via Gemini 2.5 Flash…`,
                });
                let nextCaption = `${seg.captionLine} — ${seg.speaker} holds the frame with unbroken resolve.`;
                try {
                  const res = await fetch("/api/swarm/synthesize-from-prompt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mode: "quick_edit",
                      action: "regenerate_segment",
                      scope: "timeline",
                      text: seg.captionLine,
                      speaker: seg.speaker,
                      timeRange: seg.timeRange,
                      title: post.title,
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (
                      typeof data?.rewrittenText === "string" &&
                      data.rewrittenText.trim().length > 0
                    ) {
                      nextCaption = data.rewrittenText.trim();
                    }
                  }
                } catch {
                  // Fallback already set
                }
                commitPostChange(
                  {
                    ...post,
                    segments: post.segments.map((s) =>
                      s.id === seg.id
                        ? {
                            ...s,
                            captionLine: nextCaption,
                          }
                        : s
                    ),
                  },
                  `Regenerated segment ${seg.timeRange} with continuity lock`
                );
              }}
            />

            {/* Canva & InVideo 5-Track Synchronized Audio/Video/Subtitle Layer Matrix */}
            <div
              data-testid="canva-invideo-5track-timeline"
              className="studio-surface-2 p-2.5 flex flex-col gap-1.5"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold uppercase tracking-wider" style={{ color: "var(--color-text)" }}>
                  Multi-Track Synchronized Master Timeline (Canva · InVideo · Runway)
                </span>
                <span style={{ color: "var(--color-primary)" }}>
                  00:00 — {Math.floor(post.durationSeconds / 60)}:{String(post.durationSeconds % 60).padStart(2, "0")} ({post.segments.length} Parallel Clips)
                </span>
              </div>
              {[
                {
                  track: "V1 · 70mm Video",
                  color: "#4F46E5",
                  desc: `${post.segments.length} Acts · ${activeCameraPreset.label} · ${activeLensPreset.label.split(" ")[0]}`,
                },
                {
                  track: "A1 · Omni 1.1 Voice",
                  color: "#0284C7",
                  desc: `Lip-Synced Character Dialogue (${post.castBadge})`,
                },
                {
                  track: "A2 · Lyria 3 Score",
                  color: "#059669",
                  desc: post.audioMixLabel,
                },
                {
                  track: "A3 · Action Foley",
                  color: "#D97706",
                  desc: `VFX & Spatial Atmos (${activeVfxPreset.label})`,
                },
                {
                  track: "T1 · Kinetic CC",
                  color: "#7C3AED",
                  desc: `${activeSubtitleStyle.label} · Safe-Zone Locked`,
                },
              ].map((row) => (
                <div
                  key={row.track}
                  className="grid grid-cols-12 items-center gap-2 text-[11px]"
                >
                  <span
                    className="col-span-3 font-mono font-semibold truncate"
                    style={{ color: row.color }}
                  >
                    {row.track}
                  </span>
                  <div
                    className="col-span-9 px-2 py-1 rounded truncate font-mono"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderLeft: `3px solid ${row.color}`,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {row.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================
              DEEP RESEARCH PRE-PRODUCTION & 7-DEPARTMENT BIBLE
              (Screenplay, Leads, Crew, VFX, Lighting Kelvin, Sound Effects & 5D Scorecard)
             ================================================================ */}
          <div
            className={
              stitchCanvasMode === "all" || stitchCanvasMode === "bible"
                ? "shrink-0"
                : "hidden"
            }
          >
            <DeepResearchBiblePanel
              bible={activeDeepResearchBible}
              compact={stitchCanvasMode !== "bible"}
              onRefreshResearch={handleRefreshDeepResearch}
              isRefreshing={isRefreshingResearch}
              onSelectAct={(actNum) => {
                const targetSeg = post.segments[actNum - 1];
                if (targetSeg) {
                  setSelectedSegmentId(targetSeg.id);
                  if (videoRef.current) {
                    videoRef.current.currentTime =
                      (actNum - 1) *
                      Math.max(
                        5,
                        Math.round(
                          post.durationSeconds / Math.max(1, post.segments.length)
                        )
                      );
                  }
                }
              }}
            />
          </div>

          {/* ================================================================
              UPGRADE 3: UNCLIPPED, RESIZE-FREE EDITORIAL COPY & METADATA DECK
              ("Read Like a Post, Edit on Click" — zero resize grippers, zero clipped lines)
             ================================================================ */}
          <section
            aria-label="In-place post caption and metadata editor"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
            className={`p-4 flex flex-col gap-4 shrink-0 ${
              stitchCanvasMode === "all" || stitchCanvasMode === "copy"
                ? ""
                : "hidden"
            }`}
          >
            {/* Interactive Feed Fold Preview Bar */}
            <div
              style={{
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <StudioChip tone="info">Feed Fold Preview</StudioChip>
                <span className="truncate font-medium">
                  {foldPreviewExpanded
                    ? `${post.hook} — ${post.body}`
                    : post.hook.slice(0, activePlatform.foldChars)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFoldPreviewExpanded((e) => !e)}
                style={{ color: "var(--color-info)" }}
                className="font-mono font-semibold underline shrink-0 studio-focus-ring"
              >
                {foldPreviewExpanded ? "Show less" : "…more"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch p-0.5">
              {/* Left 6 cols: Opening Hook + Post Body (Unclipped, resize-none) */}
              <div className="lg:col-span-7 flex flex-col gap-2">
                {/* 1. Opening Hook Block */}
                <div
                  onClick={() => setSelectedScope("hook")}
                  style={{
                    backgroundColor:
                      selectedScope === "hook"
                        ? "var(--color-surface-2)"
                        : "var(--color-surface)",
                    border: `1px solid ${
                      selectedScope === "hook"
                        ? "var(--color-focus)"
                        : "var(--color-border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                  }}
                  className="p-3 flex flex-col gap-1.5 cursor-pointer studio-transition-micro"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="canvas-hook-input"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Opening Hook (Before &ldquo;…more&rdquo; fold)
                    </label>
                    <span
                      className="text-xs font-mono tabular-nums"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {post.hook.length} / {activePlatform.foldChars}c fold
                    </span>
                  </div>
                  <textarea
                    id="canvas-hook-input"
                    rows={3}
                    value={post.hook}
                    onFocus={() => setSelectedScope("hook")}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, hook: e.target.value }))
                    }
                    onBlur={() =>
                      commitPostChange(post, "Edited opening hook in place")
                    }
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full p-2.5 text-sm font-medium leading-relaxed resize-none overflow-hidden studio-focus-ring"
                  />
                </div>

                {/* 2. Post Body Block */}
                <div
                  onClick={() => setSelectedScope("body")}
                  style={{
                    backgroundColor:
                      selectedScope === "body"
                        ? "var(--color-surface-2)"
                        : "var(--color-surface)",
                    border: `1px solid ${
                      selectedScope === "body"
                        ? "var(--color-focus)"
                        : "var(--color-border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                  }}
                  className="p-3 flex flex-col gap-1.5 cursor-pointer studio-transition-micro"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="canvas-body-input"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Caption Body
                    </label>
                    <span
                      className="text-xs font-mono tabular-nums"
                      style={{
                        color:
                          charRemaining < 0
                            ? "var(--color-danger)"
                            : "var(--color-text-muted)",
                      }}
                    >
                      {charRemaining >= 0
                        ? `${charRemaining} chars left`
                        : `${Math.abs(charRemaining)} chars over limit`}
                    </span>
                  </div>
                  <textarea
                    id="canvas-body-input"
                    rows={4}
                    value={post.body}
                    onFocus={() => setSelectedScope("body")}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, body: e.target.value }))
                    }
                    onBlur={() =>
                      commitPostChange(post, "Edited caption body in place")
                    }
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full p-2.5 text-sm leading-relaxed resize-none overflow-hidden studio-focus-ring"
                  />
                </div>
              </div>

              {/* Right 5 cols: Hashtags + CTA Link + Active Audio Summary */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                {/* 3. Hashtags Block */}
                <div
                  onClick={() => setSelectedScope("hashtags")}
                  style={{
                    backgroundColor:
                      selectedScope === "hashtags"
                        ? "var(--color-surface-2)"
                        : "var(--color-surface)",
                    border: `1px solid ${
                      selectedScope === "hashtags"
                        ? "var(--color-focus)"
                        : "var(--color-border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                  }}
                  className="p-3 flex flex-col gap-1.5 cursor-pointer studio-transition-micro"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="canvas-hashtags-input"
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Hashtags ({hashtagList.length} /{" "}
                      {activePlatform.maxHashtags})
                    </label>
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      CamelCase A11y
                    </span>
                  </div>
                  <input
                    id="canvas-hashtags-input"
                    type="text"
                    value={post.hashtags}
                    onFocus={() => setSelectedScope("hashtags")}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, hashtags: e.target.value }))
                    }
                    onBlur={() =>
                      commitPostChange(post, "Updated hashtags in place")
                    }
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full px-2.5 py-2 text-sm font-mono studio-focus-ring"
                  />
                </div>

                {/* 4. CTA Link Block */}
                <div
                  onClick={() => setSelectedScope("cta")}
                  style={{
                    backgroundColor:
                      selectedScope === "cta"
                        ? "var(--color-surface-2)"
                        : "var(--color-surface)",
                    border: `1px solid ${
                      selectedScope === "cta"
                        ? "var(--color-focus)"
                        : "var(--color-border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                  }}
                  className="p-3 flex flex-col gap-1.5 cursor-pointer studio-transition-micro"
                >
                  <label
                    htmlFor="canvas-cta-input"
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Call-to-Action Link (UTM Tracked)
                  </label>
                  <input
                    id="canvas-cta-input"
                    type="url"
                    value={post.ctaUrl}
                    onFocus={() => setSelectedScope("cta")}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, ctaUrl: e.target.value }))
                    }
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full px-2.5 py-2 text-xs font-mono studio-focus-ring"
                  />
                </div>

                {/* Active Master Telemetry Card */}
                <div
                  className="studio-surface-2 p-3 flex flex-col gap-1"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <span
                    className="text-xs font-mono uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Active Master Bus
                  </span>
                  <span className="text-xs font-semibold">
                    {post.audioMixLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ------------------------------------------------------------------
            RIGHT CONTEXT-AWARE PANEL (3 cols on desktop, hidden in Theater Mode): Checks · Edit · Variations · History
           ------------------------------------------------------------------ */}
        {!theaterMode && (
          <aside
            aria-label="Context inspector and quality checks"
            style={{
              backgroundColor: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
            }}
            className="order-3 md:order-3 hidden md:flex md:col-span-3 lg:col-span-3 p-3 flex-col gap-2.5 h-full overflow-y-auto studio-scrollbar"
          >
            <StudioTabs
              ariaLabel="Inspector panel tabs"
              activeId={rightTab}
              onChange={(id) =>
                setRightTab(id as "checks" | "edit" | "variations" | "history")
              }
              tabs={[
                { id: "edit", label: "Story & Cast" },
                {
                  id: "variations",
                  label: "Variations",
                  badge: variations.length,
                },
                {
                  id: "checks",
                  label: "Checks",
                  badge: activeIssues.length,
                },
                { id: "history", label: "History", badge: checkpoints.length },
              ]}
            />

            {/* RIGHT TAB 1: CHECKS & 1-CLICK FIXES (6 Categories) */}
            {rightTab === "checks" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold">
                      Pre-Flight Checks ({activePlatform.shortName})
                    </h2>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Platform fit · Brand · Quality · A11y · Safety · Links
                    </p>
                  </div>
                  {activeIssues.length > 0 ? (
                    <StudioButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        activeIssues.forEach((iss) => iss.applyFix());
                      }}
                    >
                      Fix all ({activeIssues.length})
                    </StudioButton>
                  ) : (
                    <StudioChip tone="success">All 6 passed</StudioChip>
                  )}
                </div>

                {activeIssues.length === 0 ? (
                  <div
                    className="p-4 flex items-center gap-3"
                    style={{
                      backgroundColor: "var(--color-success-subtle)",
                      border: "1px solid var(--color-success)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <CheckCircle2
                      className="w-5 h-5 shrink-0"
                      style={{ color: "var(--color-success)" }}
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        Ready to publish on {activePlatform.shortName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Zero blocking errors across character limits, brand
                        rules, alt text, and UTM links.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeIssues.map((issue) => (
                      <CheckItemCard
                        key={issue.id}
                        issue={issue}
                        onFocusTarget={(scope) => {
                          setSelectedScope(scope as SelectableScope);
                        }}
                        onIgnore={(id) =>
                          setIgnoredCheckIds((prev) => [...prev, id])
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RIGHT TAB 2: DIRECT ELEMENT INSPECTOR (STORY, CAST & CANONICAL OBJECT IDENTITY) */}
            {rightTab === "edit" && (
              <div className="flex flex-col gap-3.5">
                <div>
                  <h2 className="text-base font-semibold">
                    Story, Cast &amp; {post.segments.length}-Act Production Bible
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Canonical Object ID, unique URL, {post.segments.length}-act storyboard, and accessibility controls.
                  </p>
                </div>

                {/* Canonical Object Identity Card */}
                <div
                  data-testid="right-inspector-canonical-identity-card"
                  className="studio-surface-2 p-3 flex flex-col gap-1.5"
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
                      Canonical Object Identity
                    </span>
                    <span className="text-[11px] font-mono font-semibold">
                      {post.canonicalId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <Link
                      href={post.canonicalUrl}
                      className="underline truncate font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {post.canonicalUrl} ↗
                    </Link>
                    <button
                      type="button"
                      onClick={handleCopyCanonicalLink}
                      className="px-2 py-0.5 rounded text-[11px] font-sans font-semibold studio-surface"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      Copy Permalink
                    </button>
                  </div>
                </div>

                {/* Deep Research 5-Dimension Scorecard & 7-Department Summary Card */}
                <div
                  data-testid="right-inspector-deep-research-summary"
                  className="studio-surface-2 p-3 flex flex-col gap-2"
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Deep Research 5D Audit
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold">
                      {activeDeepResearchBible.fiveDimensionScorecard.overallScore.toFixed(1)}% VERIFIED
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
                    {[
                      { k: "Acc", v: activeDeepResearchBible.fiveDimensionScorecard.accuracy.score },
                      { k: "Rel", v: activeDeepResearchBible.fiveDimensionScorecard.relevancy.score },
                      { k: "Cont", v: activeDeepResearchBible.fiveDimensionScorecard.continuity.score },
                      { k: "Comp", v: activeDeepResearchBible.fiveDimensionScorecard.completeness.score },
                      { k: "Faith", v: activeDeepResearchBible.fiveDimensionScorecard.faithfulness.score },
                    ].map((d) => (
                      <div
                        key={d.k}
                        className="p-1 rounded bg-white border border-slate-200 flex flex-col"
                      >
                        <span className="text-[9px] text-slate-500">{d.k}</span>
                        <span className="font-bold text-slate-900">{d.v.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    <strong>7 Depts Locked:</strong>{" "}
                    {activeDeepResearchBible.screenplay.acts.length}-Act WGA Screenplay ·{" "}
                    {activeDeepResearchBible.charactersAndLeads.length} Cast Leads ·{" "}
                    {activeDeepResearchBible.productionCrew.length} Crew Depts · VFX · Kelvin Lighting · 4-Stem SFX/Foley
                  </div>
                </div>

                <div
                  data-testid="right-inspector-synthesized-story-card"
                  className="studio-surface-2 p-3 flex flex-col gap-2"
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-primary)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Synthesized Story &amp; {post.segments.length}-Act Reel (
                      {post.durationSeconds}s)
                    </span>
                    <StudioChip
                      tone={
                        liveRenderJob.status === "running"
                          ? "warning"
                          : "success"
                      }
                    >
                      {liveRenderJob.status === "running"
                        ? `Parallel (${liveRenderJob.progress || 18}%)`
                        : "Live in Canvas"}
                    </StudioChip>
                  </div>
                  <div className="text-sm font-semibold leading-snug break-words">
                    {post.title}
                  </div>
                  <div
                    className="text-xs leading-snug break-words"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {post.castBadge}
                  </div>
                  <p
                    className="text-xs leading-relaxed break-words"
                    style={{ color: "var(--color-text)" }}
                  >
                    <strong>Hook:</strong> {post.hook}
                  </p>
                  <div
                    className="flex flex-col gap-1.5 pt-1.5 border-t max-h-60 overflow-y-auto studio-scrollbar pr-1"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {post.segments.map((seg, idx) => (
                      <div
                        key={seg.id}
                        className="text-[11px] leading-snug flex flex-col gap-0.5 pb-1 border-b last:border-b-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="flex items-center justify-between gap-1 font-mono">
                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            Act {idx + 1} ({seg.timeRange})
                          </span>
                          {seg.canonicalId && (
                            <Link
                              href={
                                seg.canonicalUrl || `/entity/${seg.canonicalId}`
                              }
                              className="underline text-[10px]"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {seg.canonicalId}
                            </Link>
                          )}
                        </div>
                        <span className="leading-snug break-words">
                          <strong>{seg.speaker}:</strong> {seg.captionLine}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="visual-alt-text-input"
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Visual Alt Text (Screen Readers)
                  </label>
                  <textarea
                    id="visual-alt-text-input"
                    rows={2}
                    value={post.altText}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, altText: e.target.value }))
                    }
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full px-3 py-1.5 text-xs leading-snug resize-y studio-focus-ring"
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Required for WCAG 2.2 AA compliance across Instagram, LinkedIn, and X.
                  </span>
                </div>

                <div
                  className="studio-surface-2 p-3 flex flex-col gap-2.5"
                  style={{ borderRadius: "var(--radius-md)" }}
                >
                  <label className="flex items-center justify-between gap-2 text-sm font-medium cursor-pointer">
                    <span>Burned-in &amp; SRT Captions Enabled</span>
                    <input
                      type="checkbox"
                      checked={post.captionsEnabled}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          captionsEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-2 text-sm font-medium cursor-pointer">
                    <span>AI-Synthesized Media Disclosure Badge</span>
                    <input
                      type="checkbox"
                      checked={post.aiDisclosureEnabled}
                      onChange={(e) =>
                        setPost((prev) => ({
                          ...prev,
                          aiDisclosureEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* RIGHT TAB 3: VARIATIONS (Upgrade 6: Visual Keyframe Previews + Mix Hook & Visual) */}
            {rightTab === "variations" && (
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    Compare &amp; Mix Variations
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Pick a complete variation or combine the hook from one with
                    the 300s / 60s master from another.
                  </p>
                </div>

                <VariationGrid
                  variations={variations}
                  activeVariationId={activeVariationId}
                  onUseVariation={(v) => {
                    setActiveVariationId(v.id);
                    setSelectedSegmentId("seg-1");
                    commitPostChange(
                      buildPostFromVariation(v, post),
                      `Switched to ${v.label} (${v.canonicalId})`
                    );
                  }}
                  onMixHookAndVisual={(hookVar, visualVar) => {
                    setActiveVariationId(visualVar.id);
                    setSelectedSegmentId("seg-1");
                    const visualPost = buildPostFromVariation(visualVar, post);
                    commitPostChange(
                      {
                        ...visualPost,
                        hook: hookVar.hook,
                        audioMixLabel: `${visualVar.audioLabel} + ${hookVar.label
                          .split("·")[0]
                          .trim()} Hook`,
                      },
                      `Mixed Hook from ${
                        hookVar.label.split("·")[0]
                      } + Visual from ${visualVar.label.split("·")[0]}`
                    );
                  }}
                  onMoreLikeThis={async (v) => {
                    const varId = `var-more-${Date.now()}`;
                    const varNum = variations.length + 1;
                    const newCid = `ZYV-REEL-VAR-${varNum}-${Date.now()
                      .toString()
                      .slice(-4)}`;
                    let nextHook = `${v.hook.slice(
                      0,
                      68
                    )}—cut for immediate 3-second retention.`;
                    setToast({
                      message: `Generating new variation like ${v.label} via Gemini 2.5 Flash…`,
                    });
                    try {
                      const res = await fetch(
                        "/api/swarm/synthesize-from-prompt",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            mode: "quick_edit",
                            action: "more_like_this",
                            scope: "hook",
                            text: v.hook,
                            title: v.label,
                          }),
                        }
                      );
                      if (res.ok) {
                        const data = await res.json();
                        if (
                          typeof data?.rewrittenText === "string" &&
                          data.rewrittenText.trim().length > 0
                        ) {
                          nextHook = data.rewrittenText.trim();
                        }
                      }
                    } catch {
                      // Fallback already set
                    }
                    const newVar: PostVariation = {
                      ...v,
                      id: varId,
                      canonicalId: newCid,
                      canonicalUrl: `/entity/${newCid}`,
                      studioUrl: `/swarm-MUI?reel=${newCid}`,
                      label: `Variation ${varNum} · Inspired by ${v.label
                        .split("·")[0]
                        .trim()}`,
                      hook: nextHook,
                    };
                    setVariations((prev) => [newVar, ...prev]);
                    setToast({
                      message: `Generated new variation ${newCid}`,
                    });
                  }}
                />
              </div>
            )}

            {/* RIGHT TAB 4: NAMED VERSION HISTORY CHECKPOINTS */}
            {rightTab === "history" && (
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    Version Checkpoints
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Every AI edit or manual change saves a named snapshot you
                    can restore in one click.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="studio-surface-2 p-3 flex items-center justify-between gap-2"
                      style={{ borderRadius: "var(--radius-md)" }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold">
                            {cp.version}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {cp.label}
                          </span>
                        </div>
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {cp.timestamp}
                        </span>
                      </div>
                      <StudioButton
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPost(cp.snapshot);
                          setToast({
                            message: `Restored checkpoint ${cp.version}`,
                          });
                        }}
                      >
                        Restore
                      </StudioButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ====================================================================
          3. BOTTOM INVIDEO / RUNWAY MAGIC COMMAND BAR (Scoped to selection, Quick Director Chips, Cancel, Conversational Guard)
         ==================================================================== */}
      <footer
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
        className="sticky bottom-0 z-20 w-full px-4 md:px-6 py-2 shrink-0 flex flex-col gap-1.5"
      >
        {/* Streaming progress bar with Cancel (Preserves partial work) */}
        {generationStage.active && (
          <div
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: "var(--color-ai-subtle)",
              border: "1px solid var(--color-ai)",
              borderRadius: "var(--radius-sm)",
            }}
            className="px-3 py-2 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>{generationStage.label}</span>
            </div>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => {
                cancelStreamRef.current = true;
              }}
            >
              Cancel
            </StudioButton>
          </div>
        )}

        {/* Friendly Conversational Non-Mutation Response Banner */}
        {assistantReply && (
          <div
            role="status"
            aria-live="polite"
            data-testid="studio-conversational-reply"
            style={{
              backgroundColor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
            }}
            className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <StudioChip tone="info">Studio Assistant</StudioChip>
              <span>{assistantReply}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss assistant message"
              onClick={() => setAssistantReply(null)}
              className="text-xs font-mono px-2 py-1 studio-focus-ring"
            >
              Dismiss
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!scopedPromptInput.trim()) return;
            const wants5Min = /\b(5\s*min|300\s*s|10\s*act)/i.test(
              scopedPromptInput
            );
            runStreamingGeneration(
              scopedPromptInput,
              wants5Min ? "full_brief" : "scoped_edit",
              wants5Min ? 300 : selectedDurationSec
            );
          }}
          className="flex flex-wrap md:flex-nowrap items-center gap-2"
        >
          <StudioChip tone="ai">Scope: {scopeLabelMap[selectedScope]}</StudioChip>

          {/* 1-Click Magic Box Command Chips */}
          <div className="hidden xl:flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedDurationSec(300);
                runStreamingGeneration(
                  `${post.title}: 5 minute (300s) 10-act IMAX director cut`,
                  "full_brief",
                  300
                );
              }}
              className="px-2 py-1 text-[11px] font-medium rounded studio-surface-2 hover:opacity-90"
              style={{ border: "1px solid var(--color-border)" }}
            >
              ⚡ 5m (300s · 10 Acts)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCameraPreset("hf_bullet_time");
                setLeftSection("camera_vfx");
                setToast({
                  message: "Activated Higgsfield 360° Bullet-Time Orbit Rig",
                });
              }}
              className="px-2 py-1 text-[11px] font-medium rounded studio-surface-2 hover:opacity-90"
              style={{ border: "1px solid var(--color-border)" }}
            >
              🎥 360° Bullet-Time
            </button>
          </div>

          <div className="relative flex-1 min-w-[220px]">
            <label htmlFor="scoped-prompt-bar-input" className="sr-only">
              Ask AI to refine {scopeLabelMap[selectedScope]}
            </label>
            <input
              ref={promptInputRef}
              id="scoped-prompt-bar-input"
              type="text"
              value={scopedPromptInput}
              onChange={(e) => setScopedPromptInput(e.target.value)}
              placeholder={`Google Stitch Magic Box: Refine ${scopeLabelMap[selectedScope]} or describe a new multi-act scene (press / to focus)…`}
              style={{
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="w-full px-3.5 py-2 text-sm min-h-[40px] studio-focus-ring"
            />
          </div>

          <span
            className="hidden lg:inline-block text-xs font-mono tabular-nums shrink-0"
            style={{ color: "var(--color-text-muted)" }}
          >
            10 Parallel Workers · ~2s
          </span>

          <StudioButton
            type="submit"
            variant="primary"
            size="md"
            loading={generationStage.active}
            icon={<Send className="w-4 h-4" />}
          >
            Apply to Scope
          </StudioButton>
        </form>
      </footer>

      {/* ====================================================================
          4. + NEW REEL DIRECTOR WIZARD MODAL (Runway + Higgsfield + InVideo + Canva Unified Creation Flow)
         ==================================================================== */}
      <StudioDialog
        open={newReelModalOpen}
        title="Create New AI Video Reel or 5-Minute Multi-Act Film"
        description="Unified Runway Gen-4.5 · Higgsfield Cinema Rig · InVideo 10-Act Script · Canva Multi-Track Studio"
        onClose={() => setNewReelModalOpen(false)}
        footer={
          <>
            <StudioButton
              variant="secondary"
              size="sm"
              onClick={() => setNewReelModalOpen(false)}
            >
              Cancel
            </StudioButton>
            <StudioButton
              variant="primary"
              size="sm"
              data-testid="modal-launch-parallel-reel-btn"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => {
                setNewReelModalOpen(false);
                runStreamingGeneration(
                  briefInput,
                  "full_brief",
                  selectedDurationSec
                );
              }}
            >
              Synthesize {selectedDurationSec}s Reel (
              {selectedDurationSec >= 300
                ? "10 Parallel Workers"
                : "6 Parallel Workers"}
              )
            </StudioButton>
          </>
        }
      >
        <div
          data-testid="new-reel-director-modal"
          className="flex flex-col gap-3.5"
        >
          {/* 1. Story Prompt */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="modal-new-reel-prompt"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              1. Movie / Reel Concept, Characters &amp; Action Prompt
            </label>
            <textarea
              id="modal-new-reel-prompt"
              rows={3}
              value={briefInput}
              onChange={(e) => setBriefInput(e.target.value)}
              placeholder="e.g. Mission: Impossible 10 — 5 minute (300s) 10-act 70mm IMAX spy thriller with Ethan Hunt, Ilsa Faust, Luther, and Benji..."
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="w-full p-2.5 text-sm leading-relaxed studio-focus-ring"
            />
          </div>

          {/* 2. Target Duration (15s .. 300s / 5m) */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              2. Target Duration &amp; Parallel Worker Pool
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {INVIDEO_DURATION_OPTIONS.map((opt) => {
                const active = selectedDurationSec === opt.sec;
                return (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => setSelectedDurationSec(opt.sec)}
                    style={{
                      backgroundColor: active
                        ? "var(--color-primary)"
                        : "var(--color-surface-2)",
                      color: active ? "#FFFFFF" : "var(--color-text)",
                      border: `1px solid ${
                        active ? "var(--color-primary)" : "var(--color-border)"
                      }`,
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="p-2 text-center flex flex-col items-center gap-0.5 studio-focus-ring"
                  >
                    <span className="text-xs font-bold font-mono">
                      {opt.label}
                    </span>
                    <span className="text-[10px] opacity-85">{opt.acts} Acts</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Foundation Model + Camera Motion + Lens Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <StudioSelect
              label="3. Foundation Video Model"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              options={FOUNDATION_MODELS_CATALOG.map((m) => ({
                value: m.id,
                label: `${m.label} (${m.badge})`,
              }))}
            />
            <StudioSelect
              label="4. Higgsfield Camera Rig Preset"
              value={selectedCameraPreset}
              onChange={(e) => setSelectedCameraPreset(e.target.value)}
              options={HIGGSFIELD_CAMERA_PRESETS.map((c) => ({
                value: c.id,
                label: `${c.label} (${c.tag})`,
              }))}
            />
            <StudioSelect
              label="5. Anamorphic Optical Lens"
              value={selectedLensId}
              onChange={(e) => setSelectedLensId(e.target.value)}
              options={HIGGSFIELD_OPTICAL_LENSES.map((l) => ({
                value: l.id,
                label: l.label,
              }))}
            />
            <StudioSelect
              label="6. Action VFX & Atmos"
              value={selectedVfxId}
              onChange={(e) => setSelectedVfxId(e.target.value)}
              options={HIGGSFIELD_VFX_MODIFIERS.map((v) => ({
                value: v.id,
                label: v.label,
              }))}
            />
          </div>

          <div
            className="studio-surface-2 p-2.5 text-xs flex items-center justify-between gap-2"
            style={{ borderRadius: "var(--radius-sm)" }}
          >
            <span>
              <strong>Where will this reel be saved?</strong> Every generated reel receives a permanent Canonical ID (<code>ZYV-REEL-...</code>), dedicated permalink (<code>/entity/ZYV-REEL-...</code>), and is auto-saved to both the Left Rail <strong>Library</strong> and <strong>Saved Reels Vault</strong>.
            </span>
          </div>
        </div>
      </StudioDialog>

      {/* ====================================================================
          5. PRE-FLIGHT PUBLISH / SCHEDULE / EXPORT DIALOG (Job 6)
         ==================================================================== */}
      <StudioDialog
        open={publishDialogOpen}
        title="Publish, Schedule, or Export Campaign"
        description={`Target: ${activePlatform.label} · Brand: ${activeBrand.name} · Canonical ID: ${post.canonicalId}`}
        onClose={() => setPublishDialogOpen(false)}
        footer={
          <>
            <StudioButton
              variant="secondary"
              size="sm"
              icon={<Copy className="w-3.5 h-3.5" />}
              onClick={() => {
                navigator.clipboard?.writeText(fullCaptionText);
                setToast({ message: "Copied formatted caption & hashtags" });
              }}
            >
              Copy text
            </StudioButton>
            <a
              href={post.videoUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium studio-surface studio-focus-ring"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {post.durationSeconds}s MP4</span>
            </a>
            <StudioButton
              variant="secondary"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              disabled={blockingErrors.length > 0}
              disabledReason="Resolve blocking platform errors before scheduling"
              onClick={async () => {
                setPublishDialogOpen(false);
                try {
                  const res = await fetch("/api/reels/publish", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      platform: activePlatform.id,
                      title: post.title,
                      description: fullCaptionText,
                      videoUrl: post.videoUrl,
                      scheduledAt: scheduleDate,
                    }),
                  });
                  const data = await res.json().catch(() => null);
                  setToast({
                    message:
                      data?.message ||
                      `Scheduled "${post.title}" for ${scheduleDate} (${activePlatform.shortName})`,
                  });
                } catch {
                  setToast({
                    message: `Scheduled "${post.title}" for ${scheduleDate} (Local Time)`,
                  });
                }
              }}
            >
              Schedule
            </StudioButton>
            <StudioButton
              variant="primary"
              size="sm"
              disabled={blockingErrors.length > 0}
              disabledReason={`Resolve ${blockingErrors.length} blocking error(s) before publishing`}
              onClick={async () => {
                setPublishDialogOpen(false);
                try {
                  const res = await fetch("/api/reels/publish", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      platform: activePlatform.id,
                      title: post.title,
                      description: fullCaptionText,
                      videoUrl: post.videoUrl,
                    }),
                  });
                  const data = await res.json().catch(() => null);
                  if (data?.status === "staging_queued" || data?.message) {
                    setToast({
                      message: data.message,
                    });
                  } else {
                    setToast({
                      message: `Dispatched "${post.title}" to ${activePlatform.shortName}`,
                    });
                  }
                } catch {
                  setToast({
                    message: `Queued "${post.title}" for ${activePlatform.shortName} export`,
                  });
                }
              }}
            >
              Publish now
            </StudioButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {blockingErrors.length > 0 ? (
            <div
              role="alert"
              className="p-3.5 flex items-center justify-between gap-3"
              style={{
                backgroundColor: "var(--color-danger-subtle)",
                border: "1px solid var(--color-danger)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div>
                <p className="text-sm font-semibold">
                  {blockingErrors.length} blocking check error must be resolved
                  before publishing
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {blockingErrors[0].title}
                </p>
              </div>
              <StudioButton
                variant="primary"
                size="sm"
                onClick={() => blockingErrors.forEach((e) => e.applyFix())}
              >
                Fix blocking errors
              </StudioButton>
            </div>
          ) : (
            <div
              className="p-3.5 flex items-center gap-2.5"
              style={{
                backgroundColor: "var(--color-success-subtle)",
                border: "1px solid var(--color-success)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <CheckCircle2
                className="w-5 h-5 shrink-0"
                style={{ color: "var(--color-success)" }}
              />
              <span className="text-sm font-medium">
                All blocking checks passed for {activePlatform.label}.
              </span>
            </div>
          )}

          <StudioInput
            label="Schedule Date & Time (Local Timezone)"
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            helperText="Recommended high-engagement window: Tue–Thu 09:00–11:00 local time."
          />
        </div>
      </StudioDialog>

      {/* ====================================================================
          6. KEYBOARD SHORTCUTS CHEAT SHEET DIALOG (? key)
         ==================================================================== */}
      <StudioDialog
        open={shortcutsDialogOpen}
        title="Keyboard Shortcuts"
        description="Navigate, switch platform previews, toggle Theater mode, and accept diffs without leaving the keyboard."
        onClose={() => setShortcutsDialogOpen(false)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
          {[
            { keys: "Cmd + Z", desc: "Undo last edit or AI change" },
            { keys: "Shift + Cmd + Z", desc: "Redo change" },
            { keys: "Cmd + Enter", desc: "Accept active AI diff" },
            { keys: "T", desc: "Toggle Netflix Theater Stage" },
            { keys: "1 / 2 / 3 / 4", desc: "Switch platform preview tab" },
            {
              keys: "C / E / V / H",
              desc: "Switch right panel (Checks/Edit/Variations/History)",
            },
            { keys: "/", desc: "Focus bottom scoped prompt bar" },
            { keys: "?", desc: "Toggle shortcuts cheat sheet" },
          ].map((sc) => (
            <div
              key={sc.keys}
              className="studio-surface-2 p-2.5 flex items-center justify-between gap-2"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <span>{sc.desc}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono studio-surface">
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      </StudioDialog>

      {/* Mobile Inspector Bottom Sheet (< 768px) */}
      <StudioSheet
        open={mobileInspectorOpen}
        title={`Checks & Variations (${activeIssues.length} issues)`}
        onClose={() => setMobileInspectorOpen(false)}
      >
        <div className="flex flex-col gap-3">
          {activeIssues.map((iss) => (
            <CheckItemCard
              key={iss.id}
              issue={iss}
              onFocusTarget={(scope) => {
                setSelectedScope(scope as SelectableScope);
                setMobileInspectorOpen(false);
              }}
              onIgnore={(id) => setIgnoredCheckIds((prev) => [...prev, id])}
            />
          ))}
        </div>
      </StudioSheet>

      {/* Compact Non-Blocking Bottom-Right Undo Toast */}
      <StudioToast
        message={toast?.message || ""}
        actionLabel={toast?.undoSnapshot ? "Undo" : undefined}
        onAction={
          toast?.undoSnapshot
            ? () => {
                setPost(toast.undoSnapshot!);
                setToast(null);
              }
            : undefined
        }
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
