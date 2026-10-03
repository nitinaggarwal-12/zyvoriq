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
  ChevronDown,
  ChevronUp,
  Film,
  ExternalLink,
  Maximize2,
  Minimize2,
  Subtitles,
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
  SelectionToolbar,
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

// ============================================================================
// TYPES & PLATFORM RULES (Phase 1 & Phase 3 + Netflix Cinema Upgrades)
// ============================================================================
type PlatformId = "reels_9_16" | "youtube_16_9" | "carousel_4_5" | "linkedin_1_1";

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

const CURSED_HUNTER_SEGMENTS: VideoSegmentSpec[] = [
  {
    id: "seg-1",
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
  title: "Sacred Kailash: Ganesh, Parvati & Shiva — 35mm Visual Epic",
  version: "v1.0",
  hook: "At the sacred gates of Mount Kailash, a vow between Parvati, Ganesha, and Shiva awakens the cosmos.",
  body: "Multi-act 35mm mythological visual story (elevated from YouTube ref m55XOXtscXU) featuring Goddess Parvati, Lord Ganesha, and Lord Shiva. Combines celestial particle VFX, spoken dialogue, and a dynamic Lyria 3 Pro Vedic percussion & symphonic score ducked at -14 LUFS.",
  hashtags: "#GaneshParvatiShiva #SacredMythology #VisualEffects #CinemaStudio",
  ctaUrl: "https://zyvoriq.studio/showcase/sacred-kailash-ganesh-parvati-shiva?utm_source=social&utm_medium=studio",
  videoUrl:
    "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3",
  audioMixLabel: "Option 2 · Omni 1.1 Dialogue + Foley + Lyria 3 Pro Score",
  altText:
    "Wide 35mm cinema frame of Mount Kailash at golden twilight featuring Goddess Parvati, young elephant-headed Lord Ganesha guarding the temple threshold, and Lord Shiva with celestial light effects.",
  castBadge: "Goddess Parvati (Soprano) · Lord Ganesha (Tenor) · Lord Shiva (Baritone)",
  youtubeRefBadge: "YouTube Ref: m55XOXtscXU · Deconstructed",
  captionsEnabled: true,
  aiDisclosureEnabled: true,
  safeZoneOverlay: false,
  slides: [
    {
      id: "slide-1",
      title: "Act I (0:00–0:20) · Sacred Vow at Mount Kailash",
      subtitle: "Parvati creates Ganesha and entrusts him with guarding the inner sanctum.",
      altText: "Goddess Parvati and young Ganesha at the gates of Kailash",
      timeCode: "00:00–00:20",
    },
    {
      id: "slide-2",
      title: "Act II (0:20–0:40) · The Cosmic Confrontation",
      subtitle: "Shiva returns to Kailash as dynamic damaru & orchestral swells heighten the standoff.",
      altText: "Lord Shiva facing Ganesha at the snowy mountain threshold",
      timeCode: "00:20–00:40",
    },
    {
      id: "slide-3",
      title: "Act III (0:40–1:00) · Dawn of Vigneshwara",
      subtitle: "Ganesha is crowned remover of obstacles under a golden celestial blessing.",
      altText: "Shiva and Parvati blessing Lord Ganesha",
      timeCode: "00:40–01:00",
    },
  ],
  segments: INITIAL_SEGMENTS,
};

const INITIAL_VARIATIONS: PostVariation[] = [
  {
    id: "var-kailash-option-2",
    label: "Variation A · Sacred Kailash: Spoken Dialogue + Temple Foley + Lyria 3 Score (Option 2)",
    hook: "At the sacred gates of Mount Kailash, a vow between Parvati, Ganesha, and Shiva awakens the cosmos.",
    body: "Multi-act 35mm mythological visual story featuring Goddess Parvati, Lord Ganesha, and Lord Shiva. Combines celestial particle VFX, spoken dialogue, and a dynamic Lyria 3 Pro Vedic percussion & symphonic score ducked at -14 LUFS.",
    hashtags: "#GaneshParvatiShiva #SacredMythology #VisualEffects #CinemaStudio",
    videoUrl:
      "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3",
    audioLabel: "Option 2 · Omni 1.1 + Vedic Score",
    rationale:
      "New 60s Master (YouTube Ref m55XOXtscXU): multi-character spoken dialogue + damaru/bell Foley + Lyria 3 Pro orchestral score.",
  },
  {
    id: "var-kailash-option-1",
    label: "Variation B · Sacred Kailash: Symphonic Devotional Forward Mix (Option 1)",
    hook: "Six unbroken 35mm mythological acts at Mount Kailash—driven by a continuous Lyria 3 Pro Vedic orchestral score.",
    body: "Experience the Lyria 3 Pro devotional symphonic mix where temple bells, mridangam, bansuri flute, and epic strings drive the sacred story of Ganesh, Parvati, and Shiva from 0:00 to 1:00.",
    hashtags: "#GaneshParvatiShiva #VedicSymphony #Cinematography #CinemaStudio",
    videoUrl:
      "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4?v=theatrical3",
    audioLabel: "Option 1 · Devotional Symphonic",
    rationale:
      "New 60s Master (Option 1): foregrounds the continuous 96 BPM Lyria 3 Pro Vedic orchestral composition with dialogue.",
  },
  {
    id: "var-option-2",
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
];

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
// MAIN CONTENT STUDIO WORKSPACE PAGE (With All 6 Netflix Studio Upgrades)
// ============================================================================
export default function ContentStudioWorkspacePage() {
  // Upgrade 5: Default to Dark Cinema Theme ("dark") for 35mm grading accuracy,
  // while keeping 1-click Light/Dark toggle in the top bar.
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Upgrade 1: Theater Mode (collapses sidebars so Cinema Stage spans full viewport)
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  // Upgrade 3: Interactive "...more" fold preview expansion toggle
  const [foldPreviewExpanded, setFoldPreviewExpanded] = useState<boolean>(false);

  // Navigation & layout state
  const [leftSection, setLeftSection] = useState<
    "create" | "library" | "brands" | "templates"
  >("create");
  const [rightTab, setRightTab] = useState<
    "checks" | "edit" | "variations" | "history"
  >("checks");
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
      label: "Loaded 35mm 60s Master Campaign",
      timestamp: "Just now",
      snapshot: INITIAL_POST,
    },
  ]);

  // Brief / Create panel state (Progressive disclosure: 1 required field)
  const [briefInput, setBriefInput] = useState<string>(
    "a 5 min high quality visual story with best sound and visual effects with dialogs, dynamic background music based on Ganesh Parvati and Shiva story similar to this one: https://www.youtube.com/watch?v=m55XOXtscXU"
  );
  const [briefError, setBriefError] = useState<string | undefined>(undefined);
  const [showMoreCreateOptions, setShowMoreCreateOptions] =
    useState<boolean>(false);
  const [toneOverride, setToneOverride] = useState<string>("director_calm");
  const [audioEngineMode, setAudioEngineMode] = useState<string>("option2_omni11");

  // In-place AI Diff state (never overwrite silently)
  const [pendingDiff, setPendingDiff] =
    useState<PendingDiffSuggestion | null>(null);

  // Variations state
  const [variations, setVariations] =
    useState<PostVariation[]>(INITIAL_VARIATIONS);
  const [activeVariationId, setActiveVariationId] =
    useState<string>("var-kailash-option-2");

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

  // Modals, Mobile Sheet & Toast
  const [publishDialogOpen, setPublishDialogOpen] = useState<boolean>(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] =
    useState<boolean>(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] =
    useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>("2026-10-01T09:00");
  const [toast, setToast] = useState<{
    message: string;
    undoSnapshot?: StudioPostState;
  } | null>(null);

  // Library search & API items
  const [libraryQuery, setLibraryQuery] = useState<string>("");
  const [apiLibraryItems, setApiLibraryItems] = useState<
    Array<{ id: string; title: string; videoUrl: string; platform: string }>
  >([]);

  // Live Cloud Video & Audio Render Job State (/api/swarm/jobs)
  const [liveRenderJob, setLiveRenderJob] = useState<{
    id: string;
    status: "idle" | "running" | "completed" | "error";
    progress: number;
    stageLabel: string;
    latestLog: string;
  }>({
    id: "",
    status: "idle",
    progress: 0,
    stageLabel: "",
    latestLog: "",
  });

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
        setPost((prev) => ({ ...prev, castBadge: badgeText }));
        setToast({
          message: `Locked ensemble cast from Personas & Wardrobe (${badgeText})`,
        });
      }
    } catch {
      // Ignore storage parse errors
    }
  }, []);

  // Poll /api/swarm/jobs?id=<id> when a live video render job is running
  useEffect(() => {
    if (liveRenderJob.status !== "running" || !liveRenderJob.id) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
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
        setLiveRenderJob({
          id: j.id,
          status:
            j.status === "completed"
              ? "completed"
              : j.status === "error"
              ? "error"
              : "running",
          progress: Number(j.progress || 10),
          stageLabel: String(j.stageLabel || "Rendering 35mm acts..."),
          latestLog,
        });
        const nextVideoSrc = j.combinedSrc || j.part1Src;
        if (nextVideoSrc && typeof nextVideoSrc === "string") {
          setPost((prev) =>
            prev.videoUrl === nextVideoSrc
              ? prev
              : { ...prev, videoUrl: nextVideoSrc }
          );
        }
        if (j.status === "completed") {
          setToast({
            message: `Live 35mm video & audio master rendered (${j.title})`,
          });
        }
      } catch {
        // Ignore transient poll errors
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [liveRenderJob.status, liveRenderJob.id]);

  // Trigger live Gemini Omni 1.1 Flash + Lyria 3 Pro render job in /api/swarm/jobs
  const handleStartLiveVideoRender = async () => {
    if (liveRenderJob.status === "running") return;
    setLiveRenderJob({
      id: "starting",
      status: "running",
      progress: 6,
      stageLabel:
        "Stage 1/6 • Launching models/gemini-omni-1.1-flash + models/lyria-3-pro-preview...",
      latestLog: "Submitting 6-act screenplay & dialogue stems to cloud render pipeline...",
    });
    try {
      const turnPrompts = post.segments.map(
        (seg, idx) =>
          `Act ${idx + 1} (${seg.timeRange}) — Speaker: ${seg.speaker} speaking "${
            seg.captionLine
          }". Visual & Lighting Lock: ${seg.visualContinuityLock}. Photorealistic 35mm live-action cinema.`
      );
      const lyrics = post.segments
        .map((seg) => `[${seg.speaker}]: "${seg.captionLine}"`)
        .join("\n");
      const res = await fetch("/api/swarm/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: post.title,
          genre: "35mm Cinematic Epic Score",
          bpm: 118,
          audioEngine:
            audioEngineMode === "option1_symphonic"
              ? "omni_lyria3"
              : "omni_native",
          adkOrcasMode: true,
          act1Prompt: turnPrompts.slice(0, 3).join(" "),
          act2Prompt: turnPrompts.slice(3, 6).join(" "),
          turnPrompts,
          lyrics,
        }),
      });
      const data = await res.json();
      if (data?.ok && data?.job?.id) {
        setLiveRenderJob({
          id: data.job.id,
          status: "running",
          progress: Number(data.job.progress || 8),
          stageLabel: String(
            data.job.stageLabel ||
              "Stage 1/6 • Rendering 35mm keyframes & Lyria 3 Pro score..."
          ),
          latestLog:
            Array.isArray(data.job.logs) && data.job.logs.length > 0
              ? String(data.job.logs[data.job.logs.length - 1])
              : `Job ${data.job.id} active`,
        });
        setToast({
          message: `Started live Omni 1.1 + Lyria 3 render (${data.job.id})`,
        });
      } else {
        const errReason = String(
          data?.error || "Cloud render requires active Gemini API key"
        );
        setLiveRenderJob({
          id: "",
          status: "error",
          progress: 0,
          stageLabel: "Cloud render fallback: Pre-rendered 35mm master active",
          latestLog: errReason,
        });
        setToast({
          message: `${errReason} — playing pre-rendered 35mm studio master`,
        });
      }
    } catch (err) {
      setLiveRenderJob({
        id: "",
        status: "error",
        progress: 0,
        stageLabel: "Network error starting live render job",
        latestLog: String(err),
      });
      setToast({
        message: "Network error starting live render — playing studio master",
      });
    }
  };

  // Load real items from /api/swarm/library on mount
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
          .slice(0, 8)
          .map((item: Record<string, unknown>, idx: number) => ({
            id: String(item.id || `lib-api-${idx}`),
            title: String(
              item.title || item.prompt || `Studio Master Render #${idx + 1}`
            ),
            videoUrl: String(
              item.src ||
                item.videoUrl ||
                item.url ||
                "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3"
            ),
            platform: "9:16 & 16:9",
          }));
        setApiLibraryItems(mapped);
      })
      .catch(() => {
        // Non-blocking fallback to built-in verified 60s library items
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

  // Global keyboard shortcuts (Cmd+Z, Shift+Cmd+Z, 1-4, C/E/V/H, T for Theater, /, ?)
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

  const handleTriggerQuickAction = (action: QuickActionType) => {
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

    const isDefaultHunter =
      post.title.toLowerCase().includes("cursed hunter") ||
      post.hook.toLowerCase().includes("basalt pass");
    const urlClean = currentText
      .replace(/https?:\/\/[^\s"'<>]+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    let proposedText = currentText;
    if (targetScope === "timeline") {
      if (action === "shorter") {
        proposedText =
          urlClean.length > 56
            ? `${urlClean.slice(0, 54).replace(/[,;:\s]+$/, "")}.`
            : `${urlClean.split(/[—,;]/)[0].trim()}.`;
      } else if (action === "punchier") {
        proposedText = `${urlClean.replace(/\.$/, "")}—before the final frame fades!`;
      } else if (action === "fix_grammar") {
        proposedText = `${urlClean.replace(/\s+/g, " ").replace(/--/g, "—").replace(/\.$/, "")}.`;
      } else if (action === "change_tone") {
        proposedText = `[Whispered, -14 LUFS close-mic]: "${urlClean.replace(/^"|"$/g, "")}"`;
      } else if (action === "translate") {
        proposedText = "Mira mis manos en el paso helado—solo la verdad permanece en este acto.";
      } else {
        proposedText = `${urlClean.replace(/\.$/, "")} [Take 2 · Locked 35mm continuity].`;
      }
    } else if (action === "shorter") {
      if (isDefaultHunter) {
        proposedText =
          targetScope === "hook"
            ? "The curse took his voice—so she walked into the frozen pass unarmed."
            : "60s continuous 35mm cinema: locked Arctic twilight, Omni 1.1 dialogue + Lyria 3 Pro score.";
      } else {
        proposedText =
          targetScope === "hook"
            ? urlClean.length > 88
              ? `${urlClean.slice(0, 85).replace(/[,;:\s]+$/, "")}.`
              : `${urlClean} — in unbroken 35mm.`
            : `${urlClean.split(".")[0]}. Mastered with Omni 1.1 dialogue & Lyria 3 Pro score at -14 LUFS.`;
      }
    } else if (action === "punchier") {
      if (isDefaultHunter) {
        proposedText =
          targetScope === "hook"
            ? "Sixty seconds before the canyon freezes shut—and she left her sword behind."
            : "Six unbroken 35mm shots. Spoken dialogue + snow Foley ducked at -14 LUFS over a live orchestral crescendo.";
      } else {
        proposedText =
          targetScope === "hook"
            ? `Every frame counts: ${urlClean.slice(0, 86).replace(/\.$/, "")}!`
            : `Unbroken 35mm visual effects, lip-synced dialogue, and a soaring Lyria 3 Pro orchestral score. ${urlClean}`;
      }
    } else if (action === "fix_grammar") {
      proposedText = urlClean
        .replace(/\s+/g, " ")
        .replace(/--/g, "—")
        .trim();
      if (proposedText === currentText) {
        proposedText = isDefaultHunter
          ? "The curse stole his voice at dusk; she entered the frozen basalt pass with open hands."
          : `${urlClean.replace(/\.$/, "")} — presented in 35mm theatrical continuity.`;
      }
    } else if (action === "change_tone") {
      proposedText = isDefaultHunter
        ? "Director's Note: How we maintained 180-degree spatial continuity and cold twilight across 60 seconds."
        : `Director's Breakdown: Crafting "${post.title}" with 6-act character continuity and -14 LUFS dynamic scoring.`;
    } else if (action === "translate") {
      proposedText = isDefaultHunter
        ? "La maldicion robo su voz al anochecer, asi que entro al paso de basalto con las manos vacias."
        : "Una historia visual cinematografica en 35mm con dialogo sincronizado y musica dinamica orquestal.";
    } else if (action === "regenerate") {
      proposedText = isDefaultHunter
        ? "No sword. No armor. Just 60 seconds in the snowy basalt pass to break a six-winter curse."
        : `Six cinematic acts bring "${post.title}" to life with spoken dialogue and dynamic orchestral sound design.`;
    }

    setPendingDiff({
      id: `diff-${Date.now()}`,
      targetKey: targetScope,
      targetLabel: scopeLabelMap[targetScope],
      beforeText: currentText,
      afterText: proposedText,
      actionName:
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
          : "Regenerate",
    });
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
  // 4-STAGE STREAMING GENERATION + YOUTUBE/STORY SYNTHESIS ENGINE (Phase 3.6)
  // ============================================================================
  const runStreamingGeneration = async (
    promptText: string,
    mode: "full_brief" | "scoped_edit"
  ) => {
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

    // Extract any YouTube Reference URL (e.g. https://www.youtube.com/watch?v=m55XOXtscXU)
    const ytMatch = promptText.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/i
    );
    const extractedYtId = ytMatch ? ytMatch[1] : null;

    const stages = [
      extractedYtId
        ? `Stage 1/4: Deconstructing YouTube reference (${extractedYtId}) & story arc…`
        : "Stage 1/4: Understanding brief & brand constraints…",
      "Stage 2/4: Synthesizing 6-Act screenplay, cast & spoken dialogues…",
      "Stage 3/4: Synchronizing 35mm visual continuity & -14 LUFS score…",
      "Stage 4/4: Running 6-category pre-flight checks…",
    ];

    // Fire non-blocking synthesis request in parallel with stage progress
    const apiPromise =
      mode === "full_brief"
        ? fetch("/api/swarm/synthesize-from-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: promptText }),
            signal: AbortSignal.timeout(2200),
          })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        : Promise.resolve(null);

    for (let i = 0; i < stages.length; i++) {
      if (cancelStreamRef.current) {
        setGenerationStage({ active: false, step: 0, label: "" });
        setToast({ message: "Generation cancelled · Partial draft preserved" });
        return;
      }
      setGenerationStage({ active: true, step: i + 1, label: stages[i] });
      await new Promise((r) => setTimeout(r, 220));
    }

    const apiData = await apiPromise;
    setGenerationStage({ active: false, step: 0, label: "" });

    if (mode === "scoped_edit") {
      const targetKey: SelectableScope =
        selectedScope === "body"
          ? "body"
          : selectedScope === "hashtags"
          ? "hashtags"
          : selectedScope === "timeline"
          ? "timeline"
          : selectedScope === "cta"
          ? "cta"
          : "hook";
      const beforeText =
        targetKey === "body"
          ? post.body
          : targetKey === "hashtags"
          ? post.hashtags
          : targetKey === "timeline"
          ? activeSegment.captionLine
          : targetKey === "cta"
          ? post.ctaUrl
          : post.hook;
      const cleanScoped = promptText
        .replace(/https?:\/\/[^\s"'<>]+/gi, "")
        .trim();
      setPendingDiff({
        id: `diff-prompt-${Date.now()}`,
        targetKey,
        targetLabel: scopeLabelMap[targetKey],
        beforeText,
        afterText:
          targetKey === "timeline"
            ? `${cleanScoped.replace(/^"|"$/g, "")}`
            : `${cleanScoped} — crafted for ${activePlatform.shortName} in ${activeBrand.name} voice.`,
        actionName: "Scoped Prompt",
      });
      setScopedPromptInput("");
      return;
    }

    // Strip raw URLs out of promptText so URLs never pollute the Opening Hook
    const promptWithoutUrls = promptText
      .replace(/https?:\/\/[^\s"'<>]+/gi, "")
      .replace(/\b(similar to this one|like this one|based on this)\s*:?\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const lowerPrompt = promptText.toLowerCase();
    const isGaneshShivaParvati =
      lowerPrompt.includes("ganesh") ||
      lowerPrompt.includes("parvati") ||
      lowerPrompt.includes("shiva") ||
      lowerPrompt.includes("kailash") ||
      extractedYtId === "m55XOXtscXU";
    const isSpeakeasy =
      lowerPrompt.includes("speakeasy") || lowerPrompt.includes("jazz");
    const isCursedHunter =
      lowerPrompt.includes("cursed hunter") ||
      lowerPrompt.includes("kaelen") ||
      lowerPrompt.includes("lyra");

    const chosenVideo = isSpeakeasy
      ? audioEngineMode === "option1_symphonic"
        ? "/assets/swarm/comparisons/02_option1_clone_adk_orcas_omni_lyria3_60s.mp4"
        : "/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4"
      : isGaneshShivaParvati
      ? audioEngineMode === "option1_symphonic"
        ? "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4?v=theatrical3"
        : "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3"
      : isCursedHunter
      ? audioEngineMode === "option1_symphonic"
        ? "/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4"
        : "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4"
      : apiData?.assets?.videoUrl ||
        "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3";

    let nextTitle = post.title;
    let nextHook = post.hook;
    let nextBody = post.body;
    let nextHashtags = post.hashtags;
    let nextAltText = post.altText;
    let nextSegments: VideoSegmentSpec[] = post.segments;
    let nextSlides: CarouselSlideItem[] = post.slides;
    let nextCastLabel = "Kaelen (Baritone) · Lyra (Mezzo)";

    if (isGaneshShivaParvati) {
      const isFiveMin =
        lowerPrompt.includes("5 min") || lowerPrompt.includes("5-min");
      const actDur = isFiveMin ? 50 : 10;
      const timeRanges = isFiveMin
        ? [
            "0:00–0:50",
            "0:50–1:40",
            "1:40–2:30",
            "2:30–3:20",
            "3:20–4:10",
            "4:10–5:00",
          ]
        : [
            "00.0s–10.0s",
            "10.0s–20.0s",
            "20.0s–30.0s",
            "30.0s–40.0s",
            "40.0s–50.0s",
            "50.0s–60.0s",
          ];
      nextTitle =
        apiData?.assets?.title ||
        "Sacred Kailash: Ganesh, Parvati & Shiva — 35mm Visual Epic";
      // Keep hook strictly under 110 characters (< 125c fold) with zero raw URLs!
      nextHook =
        "At the sacred gates of Mount Kailash, a vow between Parvati, Ganesha, and Shiva awakens the cosmos.";
      nextBody = `Multi-act 35mm mythological visual story${
        extractedYtId ? ` (elevated from YouTube ref ${extractedYtId})` : ""
      } featuring Goddess Parvati, Lord Ganesha, and Lord Shiva. Combines celestial particle VFX, spoken dialogue, and a dynamic Lyria 3 Pro Vedic percussion & symphonic score ducked at -14 LUFS.`;
      nextHashtags =
        "#GaneshParvatiShiva #SacredMythology #VisualEffects #CinemaStudio";
      nextAltText =
        "Wide 35mm cinema frame of Mount Kailash at golden twilight featuring Goddess Parvati, young Lord Ganesha guarding the temple threshold, and Lord Shiva with celestial light effects.";
      nextCastLabel =
        "Goddess Parvati (Soprano) · Lord Ganesha (Tenor) · Lord Shiva (Baritone)";
      nextSegments = [
        {
          id: "seg-1",
          index: 0,
          timeRange: timeRanges[0],
          startSec: 0 * actDur,
          endSec: 1 * actDur,
          speaker: "Goddess Parvati",
          captionLine:
            "Guard this sacred threshold of Kailash, my son, and let no force cross unbidden.",
          visualContinuityLock:
            "Golden Kailash courtyard, radiant turmeric aura VFX, Parvati screen-left & Ganesha screen-right",
          aiGenerated: true,
        },
        {
          id: "seg-2",
          index: 1,
          timeRange: timeRanges[1],
          startSec: 1 * actDur,
          endSec: 2 * actDur,
          speaker: "Lord Ganesha",
          captionLine:
            "A mother's word is supreme law. I stand watch over these golden temple steps.",
          visualContinuityLock:
            "Ganesha plants glowing golden lotus staff on temple steps, warm Himalayan mist & golden mandala",
          aiGenerated: true,
        },
        {
          id: "seg-3",
          index: 2,
          timeRange: timeRanges[2],
          startSec: 2 * actDur,
          endSec: 3 * actDur,
          speaker: "Lord Shiva",
          captionLine:
            "Who bars the path to my own abode upon the eternal snows of Kailash?",
          visualContinuityLock:
            "Shiva approaches snow-swept Kailash bridge with crescent moon glow & damaru resonance",
          aiGenerated: true,
        },
        {
          id: "seg-4",
          index: 3,
          timeRange: timeRanges[3],
          startSec: 3 * actDur,
          endSec: 4 * actDur,
          speaker: "Lord Ganesha",
          captionLine:
            "Even the lord of the cosmos must honor the vow entrusted by Goddess Parvati.",
          visualContinuityLock:
            "Golden geometric light-shield dome VFX in snow courtyard, damaru & brass crescendo ducked -14 LUFS",
          aiGenerated: true,
        },
        {
          id: "seg-5",
          index: 4,
          timeRange: timeRanges[4],
          startSec: 4 * actDur,
          endSec: 5 * actDur,
          speaker: "Goddess Parvati",
          captionLine:
            "Restore him with divine grace, and crown him first among all sacred guardians.",
          visualContinuityLock:
            "Parvati steps into luminous golden beam between Shiva and Ganesha; emotional close-up",
          aiGenerated: true,
        },
        {
          id: "seg-6",
          index: 5,
          timeRange: timeRanges[5],
          startSec: 5 * actDur,
          endSec: 6 * actDur,
          speaker: "Shiva & Parvati",
          captionLine:
            "Rise as Gajanana, Vighnaharta, blessed with wisdom, revered before every sacred prayer.",
          visualContinuityLock:
            "Divine golden lotus petal rain, Shiva & Parvati unison blessing, sacred Shankha conch finale",
          aiGenerated: true,
        },
      ];
      nextSlides = [
        {
          id: "slide-1",
          title: `Act I (${timeRanges[0]}) · Sacred Vow at Mount Kailash`,
          subtitle:
            "Parvati creates Ganesha and entrusts him with guarding the inner sanctum.",
          altText: "Goddess Parvati and young Ganesha at the gates of Kailash",
          timeCode: timeRanges[0],
        },
        {
          id: "slide-2",
          title: `Act II (${timeRanges[2]}) · The Cosmic Confrontation`,
          subtitle:
            "Shiva returns to Kailash as dynamic damaru & orchestral swells heighten the standoff.",
          altText: "Lord Shiva facing Ganesha at the snowy mountain threshold",
          timeCode: timeRanges[2],
        },
        {
          id: "slide-3",
          title: `Act III (${timeRanges[5]}) · Dawn of Vigneshwara`,
          subtitle:
            "Ganesha is crowned remover of obstacles under a golden celestial blessing.",
          altText: "Shiva and Parvati blessing Lord Ganesha",
          timeCode: timeRanges[5],
        },
      ];
    } else if (isSpeakeasy) {
      nextTitle = "Crimson Echoes — 1920s Art-Deco Speakeasy 60s Master";
      nextHook =
        "When midnight rain hits the brass marquee, Julian's Steinway and Clara's voice own the room.";
      nextBody = `Built for ${activePlatform.shortName} using ${activeBrand.name}. Six continuous 10s takes inside a warm amber 1920s speakeasy with lip-synced jazz vocals and upright bass at -14 LUFS.`;
      nextHashtags = "#CrimsonEchoes #ArtDecoNoir #JazzCinema #CinemaStudio";
      nextAltText =
        "35mm warm amber frame of Clara at a vintage ribbon mic and Julian at a grand piano inside a 1920s speakeasy.";
      nextCastLabel = "Clara (Velvet Alto) · Julian (Baritone Pianist)";
      nextSegments = [
        {
          id: "seg-1",
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
      nextSlides = [
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
      ];
    } else if (isCursedHunter) {
      nextTitle = "The Cursed Hunter — 35mm Live-Action 60s Campaign";
      nextHook =
        "The curse took his voice at dusk—so she walked into the frozen basalt pass with empty hands.";
      nextBody = `Built for ${activePlatform.shortName} using ${activeBrand.name}. Every 10-second segment locks character wardrobe, spatial blocking, and -14 LUFS audio ducking.`;
      nextHashtags =
        "#TheCursedHunter #LiveAction35mm #SoundDesign #CinemaStudio";
      nextSegments = CURSED_HUNTER_SEGMENTS;
      nextSlides = [
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
      ];
      nextCastLabel = "Kaelen (Baritone) · Lyra (Mezzo)";
    } else {
      // Custom topic or YouTube reference synthesis
      const apiAssets = apiData?.assets;
      const conciseTopic =
        promptWithoutUrls.length > 52
          ? promptWithoutUrls.slice(0, 50).replace(/[,;:\s]+$/, "")
          : promptWithoutUrls || (extractedYtId ? `YouTube Ref (${extractedYtId}) Cinema Epic` : "Custom 35mm Visual Story");
      nextTitle = apiAssets?.title || `${conciseTopic} — 35mm Cinema Master`;
      const rawHookCandidate = promptWithoutUrls.trim()
        ? promptWithoutUrls.length <= 92
          ? `${promptWithoutUrls.replace(/\.$/, "")}—in unbroken 35mm continuity.`
          : `${promptWithoutUrls.slice(0, 96).replace(/[,;:\s]+$/, "")}—in 35mm cinema.`
        : `Deconstructing YouTube reference ${extractedYtId || "visual"} into an unbroken 60s 35mm cinema cut.`;
      nextHook = rawHookCandidate.slice(0, 114);
      nextBody =
        apiAssets?.storyline?.slice(0, 260) ||
        `Built for ${activePlatform.shortName} using ${activeBrand.name}${
          extractedYtId ? ` (referencing YouTube ID ${extractedYtId})` : ""
        }. Six continuous 35mm acts with spoken dialogue, visual effects continuity locks, and dynamic Lyria 3 Pro orchestral scoring at -14 LUFS.`;
      nextHashtags = "#VisualStorytelling #35mmCinema #SoundDesign #CinemaStudio";
      nextAltText = `Wide 35mm cinema frame for ${nextTitle} with locked character lighting and dynamic atmospheric effects.`;
      const leadA = apiAssets?.personas?.female_lead?.name || "Lead Protagonist";
      const leadB = apiAssets?.personas?.male_lead?.name || "Co-Lead";
      nextCastLabel = `${leadA} · ${leadB}`;
      nextSegments = [
        {
          id: "seg-1",
          index: 0,
          timeRange: "00.0s–10.0s",
          startSec: 0,
          endSec: 10,
          speaker: leadA,
          captionLine:
            "Every step into this threshold changes the story we came here to tell.",
          visualContinuityLock: `Establishing 35mm wide shot for ${conciseTopic}; locked atmospheric lighting`,
          aiGenerated: true,
        },
        {
          id: "seg-2",
          index: 1,
          timeRange: "10.0s–20.0s",
          startSec: 10,
          endSec: 20,
          speaker: leadB,
          captionLine:
            "Hold your ground—listen to the resonance rising through the mist.",
          visualContinuityLock:
            "Medium two-shot with zero prop drift; dynamic particle VFX",
          aiGenerated: true,
        },
        {
          id: "seg-3",
          index: 2,
          timeRange: "20.0s–30.0s",
          startSec: 20,
          endSec: 30,
          speaker: leadA,
          captionLine:
            "We don't turn back when the score reaches the second act.",
          visualContinuityLock:
            "180-degree camera axis locked; forward dolly movement",
          aiGenerated: true,
        },
        {
          id: "seg-4",
          index: 3,
          timeRange: "30.0s–40.0s",
          startSec: 30,
          endSec: 40,
          speaker: leadB,
          captionLine:
            "The shadows are clearing—look at the horizon opening ahead.",
          visualContinuityLock:
            "Continuous orchestral swell ducked at -14 LUFS under spoken dialogue",
          aiGenerated: true,
        },
        {
          id: "seg-5",
          index: 4,
          timeRange: "40.0s–50.0s",
          startSec: 40,
          endSec: 50,
          speaker: leadA,
          captionLine:
            "Every vow we made at the beginning holds true in the final light.",
          visualContinuityLock:
            "Close-up emotional beat; locked wardrobe and color grade",
          aiGenerated: true,
        },
        {
          id: "seg-6",
          index: 5,
          timeRange: "50.0s–60.0s",
          startSec: 50,
          endSec: 60,
          speaker: `${leadA} & ${leadB}`,
          captionLine:
            "Here begins the next chapter—unbroken from first frame to last.",
          visualContinuityLock:
            "Wide theatrical resolution shot with symphonic crescendo",
          aiGenerated: true,
        },
      ];
      nextSlides = [
        {
          id: "slide-1",
          title: `Act I (0:00–0:20) · ${conciseTopic.slice(0, 32)}`,
          subtitle: nextSegments[0].captionLine,
          altText: `Act I 35mm frame for ${conciseTopic}`,
          timeCode: "00:00–00:20",
        },
        {
          id: "slide-2",
          title: `Act II (0:20–0:40) · Rising Tension`,
          subtitle: nextSegments[2].captionLine,
          altText: `Act II medium two-shot for ${conciseTopic}`,
          timeCode: "00:20–00:40",
        },
        {
          id: "slide-3",
          title: `Act III (0:40–1:00) · Symphonic Finale`,
          subtitle: nextSegments[5].captionLine,
          altText: `Act III finale shot for ${conciseTopic}`,
          timeCode: "00:40–01:00",
        },
      ];
    }

    const ctaSlug = nextTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 48)
      .replace(/^-+|-+$/g, "");
    const nextCtaUrl = `https://zyvoriq.studio/showcase/${
      ctaSlug || "cinema-master"
    }?utm_source=social&utm_medium=studio`;

    setSelectedSegmentId("seg-1");

    const nextDraft: StudioPostState = {
      ...post,
      title: nextTitle,
      hook: nextHook,
      body: nextBody,
      hashtags: nextHashtags,
      ctaUrl: nextCtaUrl,
      altText: nextAltText,
      castBadge: nextCastLabel,
      youtubeRefBadge: extractedYtId
        ? `YouTube Ref: ${extractedYtId} · Deconstructed`
        : null,
      segments: nextSegments,
      slides: nextSlides,
      videoUrl: chosenVideo,
      audioMixLabel:
        audioEngineMode === "option1_symphonic"
          ? "Option 1 · Symphonic Film-Trailer Mix"
          : "Option 2 · Omni 1.1 Dialogue + Foley + Lyria 3 Pro Score",
    };

    commitPostChange(
      nextDraft,
      extractedYtId
        ? `Synthesized 6-Act story & dialogue from YouTube ref (${extractedYtId})`
        : "Synthesized 6-Act story, dialogue & multi-platform post from brief"
    );
  };

  return (
    <div
      data-theme={theme}
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        height: "100vh",
        maxHeight: "100vh",
      }}
      className="w-full max-w-none h-screen max-h-screen flex flex-col justify-between overflow-hidden"
    >
      {/* ====================================================================
          1. TOP APPLICATION BAR (Project · Brand · Saved · Theater · Undo/Redo · Publish)
         ==================================================================== */}
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="sticky top-0 z-30 w-full px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3"
      >
        {/* Left cluster: Brand mark + Editable project title + Version chip */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-text)",
              borderRadius: "var(--radius-sm)",
            }}
            aria-hidden="true"
          >
            Z
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <label htmlFor="project-title-input" className="sr-only">
                Project Title
              </label>
              <input
                id="project-title-input"
                type="text"
                value={post.title}
                onChange={(e) =>
                  setPost((prev) => ({ ...prev, title: e.target.value }))
                }
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-text)",
                  borderRadius: "var(--radius-sm)",
                }}
                className="font-semibold text-base truncate max-w-[220px] sm:max-w-[340px] px-1.5 py-0.5 studio-focus-ring"
              />
              <span
                data-testid="studio-version-badge"
                className="px-2 py-0.5 text-xs font-mono font-semibold tabular-nums"
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {post.version}
              </span>
            </div>
            <div
              className="flex items-center gap-2 text-xs px-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              <CheckCircle2
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-success)" }}
                aria-hidden="true"
              />
              <span>Saved · 35mm Cinema Grading Active</span>
            </div>
          </div>
        </div>

        {/* Center/Right controls: Brand selector · Theater · Undo/Redo · Shortcuts · Theme · Publish */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">
            <label
              htmlFor="top-brand-select"
              className="text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Brand:
            </label>
            <select
              id="top-brand-select"
              value={activeBrandId}
              onChange={(e) => setActiveBrandId(e.target.value)}
              style={{
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
              }}
              className="px-2.5 py-1.5 text-xs font-medium studio-focus-ring"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
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
              <span className="hidden xl:inline">Shortcuts</span>
            </StudioButton>
          </StudioTooltip>

          <StudioButton
            variant="secondary"
            size="sm"
            aria-label={
              theme === "light" ? "Switch to dark theme" : "Switch to light theme"
            }
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            icon={
              theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )
            }
          >
            <span className="hidden sm:inline">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </StudioButton>

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
        </div>
      </header>

      {/* ====================================================================
          2. MAIN 3-COLUMN STUDIO WORKSPACE (Zero-Scroll Ergonomic Workbench)
         ==================================================================== */}
      <div className="flex-1 min-h-0 w-full max-w-none grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
        {/* ------------------------------------------------------------------
            LEFT RAIL (3 cols on desktop, hidden in Theater Mode): Create · Library · Brands · Templates
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
            {/* Left Rail Section Switcher */}
            <nav
              aria-label="Workspace sections"
              className="grid grid-cols-4 gap-1 p-1 studio-surface-2 shrink-0"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              {[
                {
                  id: "create",
                  label: "Create",
                  icon: <PlusCircle className="w-3.5 h-3.5" />,
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
                    onClick={() =>
                      setLeftSection(
                        navItem.id as
                          | "create"
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
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs font-medium studio-focus-ring studio-transition-micro"
                  >
                    {navItem.icon}
                    <span>{navItem.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* LEFT SECTION 1: CREATE (Progressive disclosure — 1 required field!) */}
            {leftSection === "create" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold">Create Post</h2>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    One required field. Smart defaults handle platform ratios,
                    captions, and audio mix.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="studio-brief-textarea"
                    className="text-sm font-medium"
                  >
                    Topic or 1-Sentence Brief (Required)
                  </label>
                  <textarea
                    id="studio-brief-textarea"
                    rows={3}
                    value={briefInput}
                    onChange={(e) => {
                      setBriefInput(e.target.value);
                      if (briefError && e.target.value.trim()) {
                        setBriefError(undefined);
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setBriefError(
                          "Enter a 1-sentence brief so the studio can draft your post."
                        );
                      }
                    }}
                    placeholder="Describe your post or 60s video idea in one sentence…"
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
                    className="w-full p-3 text-sm resize-none leading-relaxed studio-focus-ring"
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

                {/* Starter 1-click brief chips */}
                <div className="flex flex-col gap-1.5">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Or try a verified 60s / 5-min production brief:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <StudioChip
                      tone="neutral"
                      onClick={() =>
                        setBriefInput(
                          "a 5 min high quality visual story with best sound and visual effects with dialogs, dynamic background music based on Ganesh Parvati and Shiva story similar to this one: https://www.youtube.com/watch?v=m55XOXtscXU"
                        )
                      }
                    >
                      Ganesh, Parvati &amp; Shiva (5m Epic)
                    </StudioChip>
                    <StudioChip
                      tone="neutral"
                      onClick={() =>
                        setBriefInput(
                          "The Cursed Hunter: 60s 35mm confrontation in a snowy basalt canyon with unarmed Lyra and Kaelen."
                        )
                      }
                    >
                      The Cursed Hunter (60s)
                    </StudioChip>
                    <StudioChip
                      tone="neutral"
                      onClick={() =>
                        setBriefInput(
                          "Crimson Echoes: 60s 1920s Art-Deco speakeasy jazz performance with Julian and Clara."
                        )
                      }
                    >
                      Art-Deco Speakeasy (60s)
                    </StudioChip>
                  </div>
                </div>

                {/* Collapsible Optional Overrides (+ More options) */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                  className="py-2.5 flex flex-col gap-3"
                >
                  <button
                    type="button"
                    onClick={() => setShowMoreCreateOptions((v) => !v)}
                    className="flex items-center justify-between text-sm font-medium studio-focus-ring"
                  >
                    <span>+ More options (Tone, Audio Mix, Audience)</span>
                    {showMoreCreateOptions ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showMoreCreateOptions && (
                    <div className="flex flex-col gap-3 pt-1">
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
                            label: "High-Tension Cinema Trailer",
                          },
                          {
                            value: "technical_breakdown",
                            label: "Behind-the-Scenes Craft Breakdown",
                          },
                        ]}
                      />

                      <StudioSelect
                        label="60s Audio Mastering Architecture"
                        value={audioEngineMode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAudioEngineMode(val);
                          const lowerT = post.title.toLowerCase();
                          if (val === "option1_symphonic") {
                            const nextVid =
                              lowerT.includes("crimson echoes") ||
                              lowerT.includes("speakeasy")
                                ? "/assets/swarm/comparisons/02_option1_clone_adk_orcas_omni_lyria3_60s.mp4"
                                : lowerT.includes("kailash") ||
                                  lowerT.includes("ganesh")
                                ? "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4?v=theatrical3"
                                : "/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4";
                            commitPostChange(
                              {
                                ...post,
                                videoUrl: nextVid,
                                audioMixLabel:
                                  "Option 1 · Symphonic Film-Trailer Forward Mix",
                              },
                              "Switched to Option 1 (Lyria 3 Pro Symphonic Mix)"
                            );
                          } else {
                            const nextVid =
                              lowerT.includes("crimson echoes") ||
                              lowerT.includes("speakeasy")
                                ? "/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4"
                                : lowerT.includes("kailash") ||
                                  lowerT.includes("ganesh")
                                ? "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4?v=theatrical3"
                                : "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4";
                            commitPostChange(
                              {
                                ...post,
                                videoUrl: nextVid,
                                audioMixLabel:
                                  "Option 2 · Omni 1.1 Dialogue + Foley + Lyria 3 Pro Score",
                              },
                              "Switched to Option 2 (Omni 1.1 Dialogue + Score)"
                            );
                          }
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

                <StudioButton
                  variant="primary"
                  size="md"
                  loading={generationStage.active}
                  icon={<Sparkles className="w-4 h-4" />}
                  onClick={() => runStreamingGeneration(briefInput, "full_brief")}
                >
                  Generate Post
                </StudioButton>
              </div>
            )}

            {/* LEFT SECTION 2: LIBRARY (Upgrade 6: Visual Keyframe Video Previews + Fit Badges) */}
            {leftSection === "library" && (
              <div className="flex flex-col gap-3">
                <StudioInput
                  label="Search Library"
                  placeholder="Filter by title or theme…"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                />

                <div className="flex flex-col gap-3">
                  {INITIAL_VARIATIONS.filter(
                    (v) =>
                      v.label
                        .toLowerCase()
                        .includes(libraryQuery.toLowerCase()) ||
                      v.hook.toLowerCase().includes(libraryQuery.toLowerCase())
                  ).map((item, idx) => (
                    <div
                      key={item.id}
                      className="studio-surface-2 overflow-hidden flex flex-col"
                      style={{ borderRadius: "var(--radius-md)" }}
                    >
                      <div
                        className="relative w-full overflow-hidden"
                        style={{
                          backgroundColor: "var(--color-cinema-stage)",
                          aspectRatio: "16 / 9",
                          maxHeight: "100px",
                        }}
                      >
                        <video
                          src={`${item.videoUrl}#t=${idx === 0 ? 1 : idx === 1 ? 12 : 8}`}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover opacity-95"
                        />
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
                          <StudioChip tone="success">
                            {idx === 0 ? "99% Fit" : "60.0s Master"}
                          </StudioChip>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {item.hook}
                        </p>
                        <div className="flex items-center gap-2">
                          <StudioButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setActiveVariationId(item.id);
                              commitPostChange(
                                {
                                  ...post,
                                  hook: item.hook,
                                  body: item.body,
                                  hashtags: item.hashtags,
                                  videoUrl: item.videoUrl,
                                  audioMixLabel: item.audioLabel,
                                },
                                `Loaded ${item.label} from Library`
                              );
                            }}
                          >
                            Load into stage
                          </StudioButton>
                        </div>
                      </div>
                    </div>
                  ))}

                  {apiLibraryItems.map((apiItem) => (
                    <div
                      key={apiItem.id}
                      className="studio-surface p-3 flex flex-col gap-1.5"
                      style={{ borderRadius: "var(--radius-md)" }}
                    >
                      <span className="text-sm font-medium truncate">
                        {apiItem.title}
                      </span>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {apiItem.platform}
                        </span>
                        <StudioButton
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            commitPostChange(
                              {
                                ...post,
                                title: apiItem.title,
                                videoUrl: apiItem.videoUrl,
                              },
                              `Loaded ${apiItem.title}`
                            )
                          }
                        >
                          Duplicate
                        </StudioButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LEFT SECTION 3: BRANDS (Voice, Banned Words, Disclaimer) */}
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

            {/* LEFT SECTION 4: TEMPLATES */}
            {leftSection === "templates" && (
              <div className="flex flex-col gap-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Load a structured post blueprint in one click:
                </p>
                {[
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
                    hook: "3 continuity bugs that ruin AI short films—and how we fixed all 3 in our 60s master:",
                    body: "1. Zero weapon hallucination at 0:11 (unarmed Lyra). 2. Strict right-to-left approach at 0:21. 3. Locked cold blue-grey Arctic twilight through 0:50–1:00.",
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
                      onClick={() =>
                        commitPostChange(
                          { ...post, hook: tpl.hook, body: tpl.body },
                          `Applied template: ${tpl.name}`
                        )
                      }
                    >
                      Use template
                    </StudioButton>
                  </div>
                ))}
              </div>
            )}

            {/* Footer links to Personas & Component Gallery (/dev/gallery) */}
            <div
              className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              <Link
                href="/personas"
                className="font-medium underline inline-flex items-center gap-1 studio-focus-ring"
                style={{ color: "var(--color-text)" }}
              >
                <span>Personas &amp; Wardrobe</span>
              </Link>
              <Link
                href="/dev/gallery"
                className="font-medium underline inline-flex items-center gap-1 studio-focus-ring"
                style={{ color: "var(--color-info)" }}
              >
                <span>Component Gallery (/dev/gallery)</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </aside>
        )}

        {/* ------------------------------------------------------------------
            CENTER HERO CANVAS (Upgrade 1, 2, 3, 4: Theater-First Cinema Stage)
           ------------------------------------------------------------------ */}
        <main
          aria-label="Live multi-platform post canvas"
          className={
            theaterMode
              ? "order-1 md:col-span-12 lg:col-span-12 p-3 flex flex-col gap-3 h-full overflow-y-auto studio-scrollbar"
              : "order-1 md:order-2 md:col-span-6 lg:col-span-6 p-3 flex flex-col gap-3 h-full overflow-y-auto studio-scrollbar"
          }
        >
          {/* Platform Switcher Bar + Character Limit Pill + Safe-Zone Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
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

            <div className="flex items-center gap-2">
              <StudioChip
                tone={
                  charRemaining < 0
                    ? "danger"
                    : charRemaining < 40
                    ? "warning"
                    : "neutral"
                }
                aria-label="Platform character counter"
              >
                <span className="font-mono tabular-nums">
                  {charCount} / {activePlatform.charLimit} chars
                </span>
              </StudioChip>

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

          {/* Floating In-Place Selection Toolbar (Always visible for current selection) */}
          <div className="shrink-0">
            <SelectionToolbar
              scopeLabel={scopeLabelMap[selectedScope]}
              onQuickAction={handleTriggerQuickAction}
            />
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
              UPGRADE 1 & 4: NETFLIX THEATER-FIRST CINEMA STAGE + INTEGRATED AUDIO/SUBTITLE CHROME
             ================================================================ */}
          <section
            data-theme="dark"
            aria-label="35mm Cinema Stage and Player Controls"
            onClick={() => setSelectedScope("visual")}
            style={{
              backgroundColor: "var(--color-cinema-stage)",
              color: "var(--color-cinema-text)",
              border: `2px solid ${
                selectedScope === "visual"
                  ? "var(--color-focus)"
                  : "var(--color-cinema-border)"
              }`,
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-md)",
            }}
            className="shrink-0 overflow-hidden flex flex-col"
          >
            {/* Stage Top Header Bar: Brand · Aspect Ratio · Active Act Badge */}
            <div
              style={{
                backgroundColor: "var(--color-cinema-surface)",
                borderBottom: "1px solid var(--color-cinema-border)",
              }}
              className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2"
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
                {post.aiDisclosureEnabled && (
                  <StudioChip tone="ai">35mm Continuity Locked</StudioChip>
                )}
                {post.youtubeRefBadge && (
                  <StudioChip tone="info">{post.youtubeRefBadge}</StudioChip>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                <span style={{ color: "var(--color-cinema-muted)" }}>
                  Cast:
                </span>
                <span
                  data-testid="cinema-cast-badge"
                  className="font-semibold"
                >
                  {post.castBadge}
                </span>
                <span style={{ color: "var(--color-cinema-muted)" }}>·</span>
                <span className="font-semibold">
                  Act {activeSegment.index + 1} ({activeSegment.timeRange})
                </span>
              </div>
            </div>

            {/* Live Cloud Video & Audio Synthesis / Render Control Bar (/api/swarm/jobs) */}
            <div
              style={{
                backgroundColor: "var(--color-cinema-surface)",
                borderBottom: "1px solid var(--color-cinema-border)",
              }}
              className="px-4 py-2 flex items-center justify-between gap-3 text-xs"
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
                  className="truncate font-medium"
                >
                  {liveRenderJob.status === "running"
                    ? `${liveRenderJob.stageLabel} (${liveRenderJob.progress}%)`
                    : liveRenderJob.status === "completed"
                    ? `Live Master Ready: ${post.title}`
                    : liveRenderJob.status === "error"
                    ? `${liveRenderJob.stageLabel} (${liveRenderJob.latestLog})`
                    : `6-Act Screenplay Ready: ${post.title} — Click any Act below to scrub or render fresh cloud video`}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StudioButton
                  variant="primary"
                  size="sm"
                  loading={liveRenderJob.status === "running"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartLiveVideoRender();
                  }}
                >
                  {liveRenderJob.status === "running"
                    ? `Rendering ${liveRenderJob.progress}%…`
                    : liveRenderJob.status === "error"
                    ? "Retry Live Render"
                    : "Render Live Video & Audio"}
                </StudioButton>
              </div>
            </div>

            {/* Stage Viewport Well: Video Frame + Live Burned-In Netflix Subtitle Overlay + Safe-Zone Overlay */}
            <div className="relative w-full flex flex-col items-center justify-center p-3 md:p-4">
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
                  <video
                    ref={videoRef}
                    key={post.videoUrl}
                    src={post.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      aspectRatio: activePlatform.aspectRatioCss,
                      maxHeight: theaterMode ? "520px" : "340px",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full object-cover"
                  />
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
                        backgroundColor: "var(--color-cinema-surface)",
                        color: "var(--color-cinema-text)",
                        border: "1px solid var(--color-cinema-border)",
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
                <div className="relative w-full flex flex-col items-center justify-center">
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
                      aspectRatio: activePlatform.aspectRatioCss,
                      minHeight: theaterMode ? "360px" : "240px",
                      maxHeight: theaterMode
                        ? "540px"
                        : activePlatformId === "reels_9_16"
                        ? "350px"
                        : "290px",
                      backgroundColor: "#05070B",
                      borderRadius: "var(--radius-sm)",
                    }}
                    className="w-full object-contain"
                  />

                  {/* Live Burned-In Netflix-Style Subtitle Overlay (Lower Third, above native controls) */}
                  {post.captionsEnabled && (
                    <div
                      data-testid="cinema-live-subtitle-overlay"
                      className="pointer-events-none absolute bottom-14 left-4 right-4 flex justify-center"
                    >
                      <div
                        style={{
                          backgroundColor: "var(--color-cinema-surface)",
                          color: "var(--color-cinema-text)",
                          border: "1px solid var(--color-cinema-border)",
                          borderRadius: "var(--radius-sm)",
                          boxShadow: "var(--shadow-md)",
                        }}
                        className="px-3.5 py-1.5 max-w-[92%] text-center text-xs sm:text-sm font-medium leading-snug"
                      >
                        <span
                          className="font-mono font-bold mr-1.5"
                          style={{ color: "var(--color-cinema-muted)" }}
                        >
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
                      className="pointer-events-none absolute inset-2 flex flex-col justify-between p-3"
                      style={{
                        border: "2px dashed var(--color-warning)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div
                        className="px-2 py-1 text-xs font-mono self-start"
                        style={{
                          backgroundColor: "var(--color-warning-subtle)",
                          color: "var(--color-text)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        Top UI Safe Zone (Status &amp; Audio Bar)
                      </div>
                      <div
                        className="px-2 py-1 text-xs font-mono self-end"
                        style={{
                          backgroundColor: "var(--color-warning-subtle)",
                          color: "var(--color-text)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        Bottom/Right Safe Zone (Caption &amp; Action Icons)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upgrade 4: Integrated Netflix "Audio & Subtitles" Player Chrome Bar */}
            <div
              style={{
                backgroundColor: "var(--color-cinema-surface)",
                borderTop: "1px solid var(--color-cinema-border)",
              }}
              className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono mr-1"
                  style={{ color: "var(--color-cinema-muted)" }}
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
                    const lowerT = post.title.toLowerCase();
                    const nextVid =
                      lowerT.includes("crimson echoes") ||
                      lowerT.includes("speakeasy")
                        ? "/assets/swarm/comparisons/04_option2_clone_adk_orcas_omni_native_60s.mp4"
                        : lowerT.includes("kailash") ||
                          lowerT.includes("ganesh")
                        ? "/assets/swarm/comparisons/11_sacred_kailash_ganesh_shiva_parvati_option2_dialogue_score_60s.mp4"
                        : "/assets/swarm/comparisons/09_option2_omni11_dramatic_score_60s_master.mp4";
                    commitPostChange(
                      {
                        ...post,
                        videoUrl: nextVid,
                        audioMixLabel:
                          "Option 2 · Omni 1.1 Dialogue + Foley + Lyria 3 Pro Score",
                      },
                      "Loaded Option 2 (Omni 1.1 Dialogue + Score)"
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
                    const lowerT = post.title.toLowerCase();
                    const nextVid =
                      lowerT.includes("crimson echoes") ||
                      lowerT.includes("speakeasy")
                        ? "/assets/swarm/comparisons/02_option1_clone_adk_orcas_omni_lyria3_60s.mp4"
                        : lowerT.includes("kailash") ||
                          lowerT.includes("ganesh")
                        ? "/assets/swarm/comparisons/12_sacred_kailash_ganesh_shiva_parvati_option1_lyria3_devotional_60s.mp4"
                        : "/assets/swarm/comparisons/10_option1_lyria3pro_symphonic_60s_master.mp4";
                    commitPostChange(
                      {
                        ...post,
                        videoUrl: nextVid,
                        audioMixLabel:
                          "Option 1 · Symphonic Film-Trailer Forward Mix",
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
                  variant={theaterMode ? "primary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheaterMode((m) => !m);
                  }}
                  icon={
                    theaterMode ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {theaterMode ? "Exit Theater (T)" : "Theater (T)"}
                </StudioButton>
              </div>
            </div>
          </section>

          {/* ================================================================
              UPGRADE 2: HORIZONTAL 6-ACT FILMSTRIP SCRUBBER DIRECTLY BELOW CINEMA STAGE
             ================================================================ */}
          <section
            aria-label="60-second 6-Act filmstrip scrubber"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
            className="p-3.5 shrink-0"
          >
            <VideoTimelineEditor
              segments={post.segments}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={(seg) => {
                setSelectedSegmentId(seg.id);
                setSelectedScope("timeline");
                if (videoRef.current) {
                  const totalTimelineSec =
                    post.segments[post.segments.length - 1]?.endSec || 60;
                  const vidDur =
                    Number.isFinite(videoRef.current.duration) &&
                    videoRef.current.duration > 0
                      ? videoRef.current.duration
                      : 60;
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
              onRegenerateSegment={(seg) => {
                commitPostChange(
                  {
                    ...post,
                    segments: post.segments.map((s) =>
                      s.id === seg.id
                        ? {
                            ...s,
                            captionLine: `${s.captionLine} [Refined 35mm take]`,
                          }
                        : s
                    ),
                  },
                  `Regenerated segment ${seg.timeRange} with continuity lock`
                );
              }}
            />
          </section>

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
            className="p-4 flex flex-col gap-4 shrink-0"
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
                {
                  id: "checks",
                  label: "Checks",
                  badge: activeIssues.length,
                },
                { id: "edit", label: "Edit" },
                {
                  id: "variations",
                  label: "Variations",
                  badge: variations.length,
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

            {/* RIGHT TAB 2: DIRECT ELEMENT INSPECTOR (EDIT) */}
            {rightTab === "edit" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Inspecting: {scopeLabelMap[selectedScope]}
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Fine-tune accessibility, alt text, and platform disclosures
                    in place.
                  </p>
                </div>

                <StudioInput
                  label="Visual Alt Text (Screen Readers)"
                  value={post.altText}
                  onChange={(e) =>
                    setPost((prev) => ({ ...prev, altText: e.target.value }))
                  }
                  helperText="Required for WCAG 2.2 AA compliance across Instagram, LinkedIn, and X."
                />

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
                    the 60s master from another.
                  </p>
                </div>

                <VariationGrid
                  variations={variations}
                  activeVariationId={activeVariationId}
                  onUseVariation={(v) => {
                    setActiveVariationId(v.id);
                    commitPostChange(
                      {
                        ...post,
                        hook: v.hook,
                        body: v.body,
                        hashtags: v.hashtags,
                        videoUrl: v.videoUrl,
                        audioMixLabel: v.audioLabel,
                      },
                      `Switched to ${v.label}`
                    );
                  }}
                  onMixHookAndVisual={(hookVar, visualVar) => {
                    setActiveVariationId(visualVar.id);
                    commitPostChange(
                      {
                        ...post,
                        hook: hookVar.hook,
                        videoUrl: visualVar.videoUrl,
                        audioMixLabel: `${visualVar.audioLabel} + ${hookVar.label
                          .split("·")[0]
                          .trim()} Hook`,
                      },
                      `Mixed Hook from ${
                        hookVar.label.split("·")[0]
                      } + Visual from ${visualVar.label.split("·")[0]}`
                    );
                  }}
                  onMoreLikeThis={(v) => {
                    const newVar: PostVariation = {
                      ...v,
                      id: `var-more-${Date.now()}`,
                      label: `Variation ${
                        variations.length + 1
                      } · Inspired by ${v.label.split("·")[0].trim()}`,
                      hook: `${v.hook.slice(
                        0,
                        68
                      )}—refined for maximum retention.`,
                    };
                    setVariations((prev) => [newVar, ...prev]);
                    setToast({
                      message: `Generated new variation like ${v.label}`,
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
          3. BOTTOM SCOPED PROMPT BAR (Scoped to selection, Cost Badge, Cancel, Conversational Guard)
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
            runStreamingGeneration(scopedPromptInput, "scoped_edit");
          }}
          className="flex flex-wrap md:flex-nowrap items-center gap-2.5"
        >
          <StudioChip tone="ai">Scope: {scopeLabelMap[selectedScope]}</StudioChip>

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
              placeholder={`Refine ${scopeLabelMap[selectedScope]} (press / to focus, e.g. "Make hook punchier under 100 chars")…`}
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
            Est. ~1s · 1 credit
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
          4. PRE-FLIGHT PUBLISH / SCHEDULE / EXPORT DIALOG (Job 6)
         ==================================================================== */}
      <StudioDialog
        open={publishDialogOpen}
        title="Publish, Schedule, or Export Campaign"
        description={`Target: ${activePlatform.label} · Brand: ${activeBrand.name}`}
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
              <span>Export 60s MP4</span>
            </a>
            <StudioButton
              variant="secondary"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              disabled={blockingErrors.length > 0}
              disabledReason="Resolve blocking platform errors before scheduling"
              onClick={() => {
                setPublishDialogOpen(false);
                setToast({
                  message: `Scheduled for ${scheduleDate} (Local Time)`,
                });
              }}
            >
              Schedule
            </StudioButton>
            <StudioButton
              variant="primary"
              size="sm"
              disabled={blockingErrors.length > 0}
              disabledReason={`Resolve ${blockingErrors.length} blocking error(s) before publishing`}
              onClick={() => {
                setPublishDialogOpen(false);
                setToast({
                  message: `Published "${post.title}" to ${activePlatform.shortName}`,
                });
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
          5. KEYBOARD SHORTCUTS CHEAT SHEET DIALOG (? key)
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
