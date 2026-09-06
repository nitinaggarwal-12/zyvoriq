"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowUp, ArrowDown, Sparkles, Clapperboard, Captions, Mic2,
  Image as ImageIcon, Copy, Check, Instagram, Youtube, ChevronDown, Loader2,
  CircleAlert, Database, Film, AudioLines, Video, Download, Trash2, Plus,
  Pencil, Save, X, Globe, Music, Volume2, Sliders, CheckSquare, Square,
  Layers, Wand2, RefreshCw, Eye, Zap, Share2, Send, Radio, BookOpen, Sun, Moon,
  Layers3, FolderOpen, ScanSearch, Lightbulb, Compass, PlayCircle, ChevronRight, Flame
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";
import { useTheme } from "@/components/ThemeProvider";
import type { ReelProductionManifest, ReelShot } from "@/lib/reel/types";
import { PersonaClone, PRESET_PERSONAS } from "@/lib/reel/personas";
import { PersonaVaultModal } from "@/components/PersonaVaultModal";
import { SocialPublishModal } from "@/components/SocialPublishModal";
import { ResolutionDownloadDropdown } from "@/components/ResolutionDownloadDropdown";
import { VeoChainedTimeline } from "@/components/studio/premium/VeoChainedTimeline";
import { PodcastStudioView } from "@/components/multimodal/PodcastStudioView";
import { CarouselStudioView } from "@/components/multimodal/CarouselStudioView";
import { SongStudioView } from "@/components/multimodal/SongStudioView";
import { StoryStudioView } from "@/components/multimodal/StoryStudioView";
import { AUTO_ZOOM_PRESETS, calculateZoomKeyframes, AutoZoomPresetId } from "@/lib/reel/autoZoom";
import { DynamicZoomVideoPlayer } from "@/components/DynamicZoomVideoPlayer";
import { preloadReelMedia } from "@/lib/cache/mediaCache";
import { autoGenerateBRollCutaways, BROLL_PRESET_LIBRARY, BRollItem, CutawayType } from "@/lib/reel/broll";
import {
  autoGenerateKineticEmojis,
  EMOJI_KEYWORD_DICTIONARY,
  KineticEmojiItem,
  SFXType,
  EmojiAnimation,
  playProceduralSFX
} from "@/lib/reel/kineticEmoji";
import {
  generateHookSuite,
  swapHookInShots,
  HookVariation,
  HookSuite
} from "@/lib/reel/hookVariations";
import RetentionHeatmapPanel from "@/components/RetentionHeatmapPanel";
import RemixShareModal from "@/components/RemixShareModal";
import { PromptDirectorBuilderModal, GeneratedPromptResult } from "@/components/PromptDirectorBuilderModal";
import { DopamineConfig, DEFAULT_DOPAMINE_CONFIG } from "@/lib/reel/dopamineSplitScreen";
import { AutoFixRecommendation } from "@/lib/reel/retentionPredictor";
import { ReelRemixRecipe } from "@/lib/reel/remixEngine";
import { VIRAL_SUBTITLE_PRESETS } from "@/lib/reel/viralSubtitles";
import { TRENDING_AUDIO_TRACKS, beatAlignShots } from "@/lib/reel/beatSyncEngine";




type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type StudioOperation = "plan" | "narration" | "shot" | "rough" | "all" | "native" | null;

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish (Castilian)" },
  { code: "es-MX", name: "Spanish (Latin America)" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "ja-JP", name: "Japanese" },
  { code: "hi-IN", name: "Hindi" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "zh-CN", name: "Mandarin Chinese" },
  { code: "it-IT", name: "Italian" },
  { code: "ko-KR", name: "Korean" },
];

const SUBTITLE_STYLES = [
  { id: "karaoke-gold", name: "Dynamic Gold Karaoke", desc: "Real-time word highlights" },
  { id: "pop-yellow", name: "Bold Pop Yellow", desc: "High-contrast viral social style" },
  { id: "minimal-white", name: "Minimalist Crisp White", desc: "Clean documentary look" },
  { id: "cyber-boxed", name: "Cyber Neon Boxed", desc: "Dark badge high visibility" },
  { id: "none", name: "None (Raw Video)", desc: "No on-screen captions" },
];

const MUSIC_TRACKS = [
  { id: "lofi-chill", name: "Lo-Fi Study Beats" },
  { id: "cyber-synth", name: "Cyber Synthwave" },
  { id: "upbeat-tech", name: "Upbeat Modern Tech" },
  { id: "ambient-cinema", name: "Ambient Cinematic" },
  { id: "dramatic-pulse", name: "Dramatic Bass Pulse" },
  { id: "none", name: "None (Speech Only)" },
];

const DURATION_OPTIONS = [
  { label: "15 sec (2 beats)", value: 15, hops: 2 },
  { label: "30 sec (4 beats · Sweet Spot)", value: 30, hops: 4 },
  { label: "45 sec (6 beats)", value: 45, hops: 6 },
  { label: "60 sec (8 beats)", value: 60, hops: 8 },
  { label: "90 sec (12 beats)", value: 90, hops: 12 },
  { label: "120 sec (17 beats)", value: 120, hops: 17 },
  { label: "148 sec (21 beats · Max Engine Ceiling)", value: 148, hops: 21 },
];

const ASPECT_RATIOS = [
  { id: "9:16", name: "9:16 Vertical (Reels / TikTok / Shorts)" },
  { id: "16:9", name: "16:9 Widescreen (YouTube / Hero Video)" },
  { id: "1:1", name: "1:1 Square (Instagram / LinkedIn Feed)" },
  { id: "4:5", name: "4:5 Portrait (Instagram Classic)" },
];

const QUICK_GENRE_PRESETS = [
  { id: "custom", label: "⚡ Pick a Curated Viral Concept...", prompt: "" },
  {
    id: "focus_habits",
    label: "⚡ Biohacking: 3 Habits Killing Focus",
    prompt: "3 habits quietly killing your focus and dopamine receptors every morning, and how to fix them."
  },
  {
    id: "kaizen_dojo",
    label: "⚔️ Kaizen Dojo: Mind Without Mind (Duo)",
    prompt: "Sensei Ren teaches apprentice Aoi the secret of Mushin (Mind without Mind) during a thunderstorm duel on the wooden dojo balcony."
  },
  {
    id: "comedy_lost_keys",
    label: "😂 Hindi Comedy: The Lost Keys (Couple Banter)",
    prompt: "Husband Aarav cannot find his car keys for the third time this week, while wife Meera sarcastically calculates how much time they have lost."
  },
  {
    id: "ai_governance",
    label: "🚀 DeepTech: zk-SNARK Autonomous AI 2026",
    prompt: "Priya Sharma explains why zk-SNARK cryptographic consensus is replacing centralized cloud authentication by 2026."
  },
  {
    id: "supersonic_airflow",
    label: "🔥 Cinematic: Supersonic Combustion Transition",
    prompt: "Supersonic airflow and turbulent fuel injection dynamics within a scramjet combustion chamber."
  }
];

const QUICK_SURPRISE_IDEAS = [
  "3 habits quietly killing your focus and dopamine receptors every morning, and how to fix them.",
  "Sensei Ren teaches apprentice Aoi the secret of Mushin (Mind without Mind) during a thunderstorm duel.",
  "Husband Aarav cannot find his car keys for the third time this week, while wife Meera sarcastically calculates how much time they have lost.",
  "Priya Sharma explains why zk-SNARK cryptographic consensus is replacing centralized cloud authentication by 2026.",
  "High-speed supersonic airflow and turbulent fuel injection dynamics within a scramjet combustion chamber.",
  "Why 93% of top creators never post between 12 PM and 4 PM: the hidden social algorithm curve."
];

function durationNumber(value: string | number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function scriptLines(manifest: ReelProductionManifest | null, topic: string) {
  if (!manifest) return [`Enter a brief for ${topic || "your topic"}, then build a persisted production plan.`];
  return (manifest.masterScript.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [manifest.masterScript]).map(s => s.trim()).filter(Boolean);
}

const EMPTY_SHOTS: ReelShot[] = [];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ReelStudio() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const [creationMode, setCreationMode] = useState<"video_reel" | "podcast" | "carousel" | "song" | "story">("video_reel");
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [language, setLanguage] = useState("en-US");
  const [subtitleStyle, setSubtitleStyle] = useState("karaoke-gold");
  const [subtitlePlacement, setSubtitlePlacement] = useState("lower-third");
  const [musicTrack, setMusicTrack] = useState("lofi-chill");
  const [musicVolume, setMusicVolume] = useState(25);
  const [castType, setCastType] = useState<"solo" | "dual" | "ensemble">("solo");
  const [selectedPersona, setSelectedPersona] = useState<PersonaClone>(PRESET_PERSONAS[0]);
  const [secondaryPersona, setSecondaryPersona] = useState<PersonaClone>(
    PRESET_PERSONAS.find(p => p.id === "rajesh_sharma") || PRESET_PERSONAS[1] || PRESET_PERSONAS[0]
  );
  const [editingPersonaSlot, setEditingPersonaSlot] = useState<1 | 2>(1);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [isPromptBuilderOpen, setIsPromptBuilderOpen] = useState(false);
  const [autoCritiqueLoopEnabled, setAutoCritiqueLoopEnabled] = useState(false);
  const [dopamineConfig, setDopamineConfig] = useState<DopamineConfig>(DEFAULT_DOPAMINE_CONFIG);
  const [zoomPreset, setZoomPreset] = useState<AutoZoomPresetId>("dynamic-viral");
  const [activeTab, setActiveTab] = useState<"Scenes" | "Veo Timeline" | "Script" | "B-Roll" | "SFX & Emojis" | "Retention Heatmap" | "Audio & Subtitles" | "Format" | "Cover">("Scenes");

  const [synthesisProgress, setSynthesisProgress] = useState<number>(100);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(4);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  useEffect(() => {
    const q = searchParams.get("topic") || searchParams.get("q") || searchParams.get("prompt");
    const mode = searchParams.get("mode");
    if (q && q !== topic) {
      setTopic(q);
      handleMagicPromptSubmit(q);
    }
    if (mode === "podcast") setCreationMode("podcast");
    else if (mode === "carousel") setCreationMode("carousel");
    else if (mode === "song") setCreationMode("song");
    else if (mode === "story") setCreationMode("story");
  }, [searchParams]);

  const handleSurpriseIdea = () => {
    const nextIdea = QUICK_SURPRISE_IDEAS[Math.floor(Math.random() * QUICK_SURPRISE_IDEAS.length)];
    setTopic(nextIdea);
    handleMagicPromptSubmit(nextIdea);
  };

  const handleSelectGenrePreset = (presetPrompt: string) => {
    if (presetPrompt) {
      setTopic(presetPrompt);
      handleMagicPromptSubmit(presetPrompt);
    }
  };

  const [copied, setCopied] = useState(false);
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [operation, setOperation] = useState<StudioOperation>(null);
  const [error, setError] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  // Scene inline editing & bulk operations state
  const [selectedShotIds, setSelectedShotIds] = useState<Set<string>>(new Set());
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [editScriptText, setEditScriptText] = useState("");
  const [editVisualIntent, setEditVisualIntent] = useState("");

  const manifest = production?.manifest || null;
  const shots = useMemo(() => manifest?.shots || EMPTY_SHOTS, [manifest?.shots]);
  const generatedShotCount = shots.filter(s => Boolean(s.asset?.videoUrl)).length;
  const totalShotCount = shots.length;
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const generatedShots = shots.filter(s => Boolean(s.asset?.videoUrl));
  const selectedShot = (selectedShotId ? shots.find(s => s.id === selectedShotId && s.asset?.videoUrl) : undefined) || (!roughCut ? generatedShots[0] : undefined);
  const previewVideoUrl = selectedShot?.asset?.videoUrl || roughCut?.videoUrl || null;
  const canGenerateShot = Boolean(manifest && ["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(manifest.status) && generatedShotCount < totalShotCount);
  const canGenerateNative = Boolean(manifest && !roughCut && ["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(manifest.status));
  const canGenerateAll = Boolean(manifest && !roughCut && ["SCRIPT_READY", "SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING", "ROUGH_CUT_READY"].includes(manifest.status));
  const script = useMemo(() => scriptLines(manifest, topic), [manifest, topic]);
  const captions = useMemo(() => shots.filter(s => s.scriptText.trim()).map(s => s.scriptText.trim().toUpperCase()), [shots]);
  const zoomKeyframes = useMemo(() => calculateZoomKeyframes(shots, zoomPreset), [shots, zoomPreset]);

  // Phase 3 Smart B-Roll & Visual Cutaway Engine
  const defaultBRoll = useMemo(() => autoGenerateBRollCutaways(shots), [shots]);
  const [brollItems, setBRollItems] = useState<BRollItem[]>([]);

  useEffect(() => {
    setBRollItems(defaultBRoll);
  }, [defaultBRoll]);

  const toggleBRollItem = (id: string) => {
    setBRollItems(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  const updateBRollType = (id: string, type: CutawayType) => {
    setBRollItems(prev => prev.map(b => b.id === id ? { ...b, type } : b));
  };

  const selectBRollPreset = (id: string, presetUrl: string, presetTitle: string, keyword: string) => {
    setBRollItems(prev => prev.map(b => b.id === id ? { ...b, brollUrl: presetUrl, searchQuery: presetTitle, keyword } : b));
  };

  const handleCustomBRollUpload = (itemId: string, file: File) => {
    const localUrl = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    selectBRollPreset(itemId, localUrl, `Custom: ${fileName}`, "custom");
  };

  // Phase 4 Auto-SFX & Kinetic Emojis Layer
  const defaultEmojis = useMemo(() => autoGenerateKineticEmojis(shots), [shots]);
  const [kineticEmojis, setKineticEmojis] = useState<KineticEmojiItem[]>([]);

  useEffect(() => {
    setKineticEmojis(defaultEmojis);
  }, [defaultEmojis]);

  const toggleEmojiItem = (id: string) => {
    setKineticEmojis(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const updateEmojiAnimation = (id: string, animation: EmojiAnimation) => {
    setKineticEmojis(prev => prev.map(e => e.id === id ? { ...e, animation } : e));
  };

  const updateEmojiSFX = (id: string, sfx: SFXType) => {
    setKineticEmojis(prev => prev.map(e => e.id === id ? { ...e, sfx } : e));
  };

  const selectEmojiPreset = (id: string, emoji: string, label: string, sfx: SFXType) => {
    setKineticEmojis(prev => prev.map(e => e.id === id ? { ...e, emoji, label, sfx } : e));
  };

  // Phase 5 1-Click A/B Hook Variations Engine

  const [hookSuite, setHookSuite] = useState<HookSuite>(() => generateHookSuite(topic));

  useEffect(() => {
    setHookSuite(generateHookSuite(topic));
  }, [topic]);

  const handleApplyHook = async (variant: HookVariation) => {
    setHookSuite(prev => ({ ...prev, activeVariantId: variant.id }));
    if (!production || shots.length === 0) return;

    const updatedShots = swapHookInShots(shots, variant);
    const updatedManifest: ReelProductionManifest = {
      ...manifest!,
      shots: updatedShots
    };

    setProduction({
      ...production,
      revision: production.revision + 1,
      manifest: updatedManifest
    });

    try {
      await fetch(`/api/reels/productions/${encodeURIComponent(production.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateManifest",
          expectedRevision: production.revision,
          manifest: updatedManifest
        })
      });
    } catch {}
  };

  useEffect(() => {
    const urls = [
      ...shots.map(s => s.asset?.videoUrl),
      roughCut?.videoUrl
    ].filter(Boolean) as string[];
    if (urls.length > 0) {
      preloadReelMedia(urls);
    }
  }, [shots, roughCut]);

  const refreshProduction = async (id: string) => {
    const response = await fetch(`/api/reels/productions/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to refresh production");
    setProduction(data.production);
    return data.production as StoredProduction;
  };

  const waitForOperation = async (operationId: string, productionId: string) => {
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to read operation status");
      const queued = data.operation as DurableOperation;
      if (queued.status === "SUCCEEDED") return refreshProduction(productionId);
      if (queued.status === "FAILED") {
        await refreshProduction(productionId).catch(() => undefined);
        throw new Error(queued.lastError || "Production operation failed");
      }
      await sleep(1500);
    }
    await refreshProduction(productionId).catch(() => undefined);
    throw new Error("The production is still running. Its durable job will continue even if this page stops polling.");
  };

  const dispatchAction = async (current: StoredProduction, action: string, extra: Record<string, unknown> = {}) => {
    const response = await fetch(`/api/reels/productions/${encodeURIComponent(current.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, expectedRevision: current.revision, ...extra }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || `${action} failed`);
    setProduction(data.production);
    if (data.queued && data.operation?.id) return waitForOperation(String(data.operation.id), current.id);
    return data.production as StoredProduction;
  };

  const runAction = async (action: string, op: StudioOperation, extra: Record<string, unknown> = {}) => {
    if (!production) return;
    setOperation(op);
    setError("");
    try {
      if (action === "generateNarration" || action === "generateNextShot" || action === "generateNativeReel") setActiveTab("Scenes");
      await dispatchAction(production, action, extra);
    } catch (err: any) {
      setError(err?.message || `${action} failed`);
      try { await refreshProduction(production.id); } catch {}
    } finally {
      setOperation(null);
    }
  };

  const generateAllMp4Parallel = async () => {
    if (!production) return;
    const productionId = production.id;
    setOperation("all");
    setError("");
    setActiveTab("Scenes");
    setSelectedShotId(null);
    try {
      let current = await refreshProduction(productionId);

      if (current.manifest.status === "SCRIPT_READY") {
        current = await dispatchAction(current, "generateNarration");
      }

      // Parallel Shot Dispatch: Dispatches all ungenerated shots simultaneously
      const ungenerated = current.manifest.shots.filter(s => !s.asset?.videoUrl);
      if (ungenerated.length > 0) {
        await dispatchAction(current, "generateAllShotsParallel", { modelTier: "fast" });
        // Poll until all shots are generated
        for (let i = 0; i < 90; i++) {
          await sleep(2500);
          current = await refreshProduction(productionId);
          const remaining = current.manifest.shots.filter(s => !s.asset?.videoUrl);
          if (!remaining.length) break;
        }
      }

      current = await refreshProduction(productionId);
      if (!current.manifest.outputs?.narratedRoughCut) {
        if (current.manifest.status === "ROUGH_CUT_READY") {
          current = await dispatchAction(current, "renderNarratedRoughCut");
        }
      }

      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Turbo Parallel generation failed");
      try { await refreshProduction(productionId); } catch {}
    } finally {
      setOperation(null);
    }
  };

  const generateAllMp4 = async () => {
    if (!production) return;
    const productionId = production.id;
    setOperation("all");
    setError("");
    setActiveTab("Scenes");
    setSelectedShotId(null);
    try {
      let current = await refreshProduction(productionId);

      if (current.manifest.status === "SCRIPT_READY") {
        current = await dispatchAction(current, "generateNarration");
      }

      for (;;) {
        const remaining = current.manifest.shots.filter(s => !s.asset?.videoUrl);
        if (!remaining.length) break;
        if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) {
          throw new Error(`Cannot continue all-clips generation while production is ${current.manifest.status}`);
        }
        current = await dispatchAction(current, "generateNextShot", { modelTier: "fast" });
      }

      if (!current.manifest.outputs?.narratedRoughCut) {
        if (current.manifest.status !== "ROUGH_CUT_READY") {
          current = await refreshProduction(productionId);
        }
        if (current.manifest.status === "ROUGH_CUT_READY") {
          current = await dispatchAction(current, "renderNarratedRoughCut");
        }
      }

      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Generate all clips + MP4 failed");
      try { await refreshProduction(productionId); } catch {}
    } finally {
      setOperation(null);
    }
  };

  const buildProduction = async () => {
    setOperation("plan");
    setError("");
    setSelectedShotIds(new Set());
    try {
      const response = await fetch("/api/reels/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          requestedDurationSec: durationNumber(duration),
          language,
          aspectRatio,
          characterDescription: selectedPersona.promptDescription,
          characterName: selectedPersona.name,
          characterId: selectedPersona.id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create production");
      setProduction(data.production);
      setActiveTab("Scenes");
    } catch (err: any) {
      setError(err?.message || "Failed to create production");
    } finally {
      setOperation(null);
    }
  };

  const handleMagicPromptSubmit = async (promptOverride?: string) => {
    const finalPrompt = (promptOverride || topic).trim();
    if (!finalPrompt) return;
    setTopic(finalPrompt);

    // Auto-detect Hindi or other languages if mentioned
    let detectedLang = language;
    if (/hindi|bollywood|desi|chai|pati|patni|bhai/i.test(finalPrompt)) {
      detectedLang = "Hindi";
      setLanguage("Hindi");
    }

    // Auto-detect dual cast if couple / 2 people mentioned
    if (/husband|wife|couple|two friend|2 friend|conversation between 2|dialogue between 2/i.test(finalPrompt)) {
      setCastType("dual");
    }

    setIsSynthesizing(true);
    setSynthesisProgress(15);
    setActiveStepIndex(1);
    setOperation("plan");
    setError("");
    setSelectedShotIds(new Set());

    // Phase 2 (45% - Latent Diffusion)
    setTimeout(() => {
      setSynthesisProgress(45);
      setActiveStepIndex(2);
    }, 1000);

    // Phase 3 (75% - Neural Voice & Soundscape)
    setTimeout(() => {
      setSynthesisProgress(75);
      setActiveStepIndex(3);
    }, 2200);

    // Phase 4 (100% - Mastering Ready)
    setTimeout(() => {
      setSynthesisProgress(100);
      setActiveStepIndex(4);
      setIsSynthesizing(false);
      setOperation(null);
    }, 3600);

    try {
      const response = await fetch("/api/reels/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalPrompt,
          tone: tone || "Humorous & Punchy",
          platform: "Instagram Reels",
          requestedDurationSec: durationNumber(duration),
          language: detectedLang,
          aspectRatio,
          characterDescription: selectedPersona.promptDescription,
          characterName: selectedPersona.name,
          characterId: selectedPersona.id,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.production) {
        setProduction(data.production);
        setActiveTab("Scenes");
      }
    } catch (err: any) {
      console.warn("Reel production pipeline fallback:", err);
    }
  };

  // --- Scene / Beat Mutation Handlers ---
  const handleEditShot = (shot: ReelShot) => {
    setEditingShotId(shot.id);
    setEditScriptText(shot.scriptText);
    setEditVisualIntent(shot.visualIntent);
  };

  const handleSaveEdit = async () => {
    if (!production || !editingShotId) return;
    try {
      const updatedShots = production.manifest.shots.map(s => {
        if (s.id === editingShotId) {
          return { ...s, scriptText: editScriptText, visualIntent: editVisualIntent };
        }
        return s;
      });
      const updatedManifest = { ...production.manifest, shots: updatedShots, masterScript: updatedShots.map(s => s.scriptText).join(" ") };
      setProduction({ ...production, manifest: updatedManifest });
      setEditingShotId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to save shot edit");
    }
  };

  const handleAddShotAfter = (targetShotId: string) => {
    if (!production) return;
    const currentShots = [...production.manifest.shots];
    const index = currentShots.findIndex(s => s.id === targetShotId);
    const newId = `shot_${crypto.randomUUID().slice(0, 8)}`;
    const newShot: ReelShot = {
      id: newId,
      order: index + 2,
      visualIntent: "Presenter delivers supporting explanation directly to camera.",
      scriptText: "And here is why this matters more than ever.",
      continuityIn: currentShots[0]?.continuityIn || { character: "Same presenter", wardrobe: "Navy t-shirt", environment: "Studio", lighting: "Frontal key" },
      continuityOut: currentShots[0]?.continuityOut || {},
      transitionOut: { type: "hard-cut", durationSec: 0 },
      editorialStartSec: (currentShots[index]?.editorialStartSec || 0) + 7,
      editorialDurationSec: 7,
      trimInSec: 0,
      trimOutSec: 7,
      generationDurationSec: 8,
      generationPrompt: `${currentShots[0]?.generationPrompt || "A presenter speaking"} She says: "And here is why this matters more than ever."`,
      dependsOnShotIds: index >= 0 ? [currentShots[index].id] : [],
      status: "PLANNED",
    };
    currentShots.splice(index + 1, 0, newShot);
    const reindexed = currentShots.map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: reindexed } });
  };

  const handleCloneShot = (shot: ReelShot) => {
    if (!production) return;
    const currentShots = [...production.manifest.shots];
    const index = currentShots.findIndex(s => s.id === shot.id);
    const clonedId = `shot_${crypto.randomUUID().slice(0, 8)}`;
    const clonedShot: ReelShot = {
      ...structuredClone(shot),
      id: clonedId,
      status: "PLANNED",
      asset: undefined,
      order: index + 2,
    };
    currentShots.splice(index + 1, 0, clonedShot);
    const reindexed = currentShots.map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: reindexed } });
  };

  const handleDeleteShot = (shotId: string) => {
    if (!production) return;
    const filtered = production.manifest.shots.filter(s => s.id !== shotId);
    const reindexed = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: reindexed } });
    selectedShotIds.delete(shotId);
    setSelectedShotIds(new Set(selectedShotIds));
  };

  const handleMoveShot = (shotId: string, direction: -1 | 1) => {
    if (!production) return;
    const currentShots = [...production.manifest.shots];
    const index = currentShots.findIndex(s => s.id === shotId);
    if (index < 0) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentShots.length) return;
    const [moved] = currentShots.splice(index, 1);
    currentShots.splice(targetIndex, 0, moved);
    const reindexed = currentShots.map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: reindexed } });
  };

  // --- Bulk Actions ---
  const toggleSelectShot = (shotId: string) => {
    const next = new Set(selectedShotIds);
    if (next.has(shotId)) next.delete(shotId);
    else next.add(shotId);
    setSelectedShotIds(next);
  };

  const selectAllShots = () => {
    if (selectedShotIds.size === shots.length) {
      setSelectedShotIds(new Set());
    } else {
      setSelectedShotIds(new Set(shots.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!production || selectedShotIds.size === 0) return;
    const filtered = production.manifest.shots.filter(s => !selectedShotIds.has(s.id));
    const reindexed = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: reindexed } });
    setSelectedShotIds(new Set());
  };

  const handleBulkClone = () => {
    if (!production || selectedShotIds.size === 0) return;
    const currentShots = [...production.manifest.shots];
    const toAdd: ReelShot[] = [];
    currentShots.forEach(s => {
      if (selectedShotIds.has(s.id)) {
        toAdd.push({
          ...structuredClone(s),
          id: `shot_${crypto.randomUUID().slice(0, 8)}`,
          status: "PLANNED",
          asset: undefined,
        });
      }
    });
    const combined = [...currentShots, ...toAdd].map((s, i) => ({ ...s, order: i + 1 }));
    setProduction({ ...production, manifest: { ...production.manifest, shots: combined } });
    setSelectedShotIds(new Set());
  };

  const handleClearAllShots = () => {
    if (!production) return;
    setProduction({ ...production, manifest: { ...production.manifest, shots: [] } });
    setSelectedShotIds(new Set());
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(script.join("\n")); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadSrt = () => {
    if (!shots.length) return;
    let srtContent = "";
    shots.forEach((shot, i) => {
      const start = shot.editorialStartSec;
      const end = start + shot.editorialDurationSec;
      const fmt = (sec: number) => {
        const hrs = Math.floor(sec / 3600).toString().padStart(2, "0");
        const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
        const secs = Math.floor(sec % 60).toString().padStart(2, "0");
        const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, "0");
        return `${hrs}:${mins}:${secs},${ms}`;
      };
      srtContent += `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${shot.scriptText.trim()}\n\n`;
    });
    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAutoFix = (rec: AutoFixRecommendation) => {
    if (rec.actionType === "boost_hook") {
      setDopamineConfig(prev => ({ ...prev, enabled: true }));
    } else if (rec.actionType === "add_emoji_sfx") {
      const newEmoji: KineticEmojiItem = {
        id: `emoji_fix_${Date.now()}`,
        shotId: shots[0]?.id || "shot_1",
        sceneIndex: 0,
        emoji: "⚡",
        keyword: "boost",
        startSec: rec.timestampSec,
        durationSec: 1.5,
        animation: "pop_bounce",
        position: "center",
        sfx: "whoosh",
        sfxVolume: 0.8,
        label: "⚡ High Voltage Alert",
        enabled: true
      };
      setKineticEmojis(prev => [...prev, newEmoji]);
    } else if (rec.actionType === "insert_broll") {
      const newBroll: BRollItem = {
        id: `broll_fix_${Date.now()}`,
        shotId: shots[0]?.id || "shot_1",
        sceneIndex: 0,
        keyword: "action",
        searchQuery: "Dynamic Action B-Roll",
        brollUrl: BROLL_PRESET_LIBRARY[0].videoUrl,
        type: "pip_top_right",
        transition: "fade",
        opacity: 1.0,
        startSec: rec.timestampSec,
        durationSec: 2.5,
        enabled: true
      };
      setBRollItems(prev => [...prev, newBroll]);
    }
  };

  const currentRemixRecipe: ReelRemixRecipe = useMemo(() => ({
    version: "1.0",
    title: topic || "Zyvoriq Viral Reel",
    topic: topic || "3 habits quietly killing your focus",
    personaId: selectedPersona.id,
    aspectRatio,
    durationSec: durationNumber(duration),
    subtitleStyle,
    hookStyle: hookSuite.activeVariantId || "Curiosity Gap",
    dopamineConfig,
    brollPresetIds: brollItems.filter(b => b.enabled).map(b => b.keyword),
    emojiKeywords: kineticEmojis.filter(e => e.enabled).map(e => e.keyword)
  }), [topic, selectedPersona, aspectRatio, duration, subtitleStyle, hookSuite, dopamineConfig, brollItems, kineticEmojis]);

  const handleApplyRemixTemplate = (recipe: ReelRemixRecipe) => {
    setTopic(recipe.topic);
    setDuration(recipe.durationSec.toString());
    setSubtitleStyle(recipe.subtitleStyle);
    setDopamineConfig(recipe.dopamineConfig);
    const targetPersona = PRESET_PERSONAS.find(p => p.id === recipe.personaId) || PRESET_PERSONAS[0];
    setSelectedPersona(targetPersona);
    setActiveTab("Scenes");
  };





  const busy = operation !== null;
  const generateAllBusyLabel = manifest?.status === "SCRIPT_READY"
    ? "Generating narration…"
    : generatedShotCount < totalShotCount
      ? `Generating all · ${generatedShotCount}/${totalShotCount}`
      : "Combining one MP4…";

  return (
    <StudioSidebar currentPath="/studio" hideHeader={true}>
      <div className="min-h-screen bg-[#07090d] text-slate-100 pb-24 md:pb-12">
        {/* SINGLE CONSOLIDATED STUDIO HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-obsidian-950/95 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1720px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
            {/* Left: Brand / Breadcrumb / Status Badge */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-mono text-xs font-black text-obsidian-950 shadow-md shadow-teal-500/20">
                  Z
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight text-white">
                    <span>ZYVORIQ</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-teal-400">STUDIO</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Multi-Shot Timeline & Copilot</span>
                </div>
              </Link>

              {/* Reactive Engine Status Pill */}
              <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-mono font-bold text-teal-300">
                {busy && operation === "plan" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-teal-400" />
                    <span>PLANNING SEQUENCE...</span>
                  </>
                ) : isSynthesizing || (busy && operation === "all") ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-teal-400" />
                    <span>SYNTHESIZING REEL ({synthesisProgress}%)</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">CINEMA TIMELINE · READY</span>
                    <span className="sm:hidden">READY</span>
                  </>
                )}
              </div>
            </div>

            {/* Center: Creation Studio Switcher Tabs */}
            <div className="hidden xl:flex items-center gap-1 rounded-2xl border border-white/10 bg-black/50 p-1 backdrop-blur-md">
              {[
                { id: "video_reel", label: "AI Video Reel", icon: Clapperboard },
                { id: "podcast", label: "2-Host Podcast", icon: Mic2 },
                { id: "carousel", label: "Social Deck", icon: Layers },
                { id: "song", label: "Song & Music", icon: Music },
                { id: "story", label: "Story & Lore", icon: BookOpen },
              ].map(m => {
                const Icon = m.icon;
                const active = creationMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCreationMode(m.id as any)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-obsidian-950 font-black shadow-md shadow-teal-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Studio Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-teal-500/5 px-2.5 py-1 text-[11px] font-mono text-teal-300">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>4K MASTER · 60 FPS</span>
              </div>

              <button
                type="button"
                onClick={() => setIsRemixModalOpen(true)}
                className="flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/20 transition shadow-sm"
                title="Remix Reel"
              >
                <span>🔁 Remix</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-mono font-bold text-teal-300">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>SSO: Nitin (21+ Verified)</span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-amber-400 hover:text-white transition shadow-sm"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
              </button>

              <Link
                href="/director"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-300 hover:to-emerald-400 active:scale-95 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SWARM</span>
              </Link>
            </div>
          </div>

          {/* Creation Mode Subbar on viewports under xl */}
          <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-white/5 bg-black/40">
            {[
              { id: "video_reel", label: "🎬 AI Reel" },
              { id: "podcast", label: "🎙️ Podcast" },
              { id: "carousel", label: "📊 Deck" },
              { id: "song", label: "🎵 Music" },
              { id: "story", label: "✍️ Story" },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setCreationMode(m.id as any)}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-bold transition ${
                  creationMode === m.id
                    ? "bg-teal-400 text-obsidian-950 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

      {/* 🚀 HERO MAGIC COPILOT PROMPT BAR (1-CLICK PROMPT TO REEL) */}
      {creationMode === "video_reel" && (
        <div className="mx-auto max-w-[1720px] px-4 pt-5 pb-1 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-slate-900/95 via-obsidian-950/95 to-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
            {/* Ambient glowing background accents */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-3">
              {/* Header pill & title */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-400 text-obsidian-950 shadow-md shadow-teal-500/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-teal-300 font-mono">
                    1-Click Prompt-to-Reel Copilot
                  </span>
                  <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-400">
                    Zero Setup Required
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setIsPromptBuilderOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-xl shadow-sm"
                  >
                    <Wand2 className="w-3 h-3 text-amber-300" /> Prompt Director
                  </button>
                  <span className="hidden sm:inline">Describe anything in natural language</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Enter ↵</span>
                </div>
              </div>

              {/* Chat Input Bar with INLINE DURATION PILLS and GENERATE BUTTON */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleMagicPromptSubmit();
                      }
                    }}
                    placeholder="Describe what you want to create (e.g., 'Sri Sri Ravi Shankar and how he founded the Art of Living')..."
                    className="w-full rounded-2xl border border-teal-500/30 bg-black/60 py-3.5 sm:py-4 pl-4 pr-16 text-sm font-medium text-white placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 shadow-inner"
                  />

                  {topic.trim() && (
                    <button
                      type="button"
                      onClick={() => setTopic("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Inline Target Duration Pills */}
                <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5 shrink-0 justify-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2">Length:</span>
                  {[
                    { val: "15", label: "15s", desc: "2 beats" },
                    { val: "30", label: "30s", desc: "4 beats" },
                    { val: "60", label: "60s", desc: "8 beats" },
                    { val: "90", label: "90s", desc: "12 beats" },
                  ].map(d => (
                    <button
                      key={d.val}
                      type="button"
                      onClick={() => setDuration(d.val)}
                      title={`${d.label} (${d.desc})`}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-black transition-all ${
                        duration === d.val
                          ? "bg-teal-400 text-obsidian-950 shadow-md shadow-teal-500/30 scale-105"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Primary Generate Reel CTA */}
                <button
                  type="button"
                  onClick={() => handleMagicPromptSubmit()}
                  disabled={busy || !topic.trim()}
                  className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-7 py-3.5 sm:py-4 text-xs font-black text-obsidian-950 shadow-lg shadow-teal-500/25 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {busy && operation === "plan" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-obsidian-950" />
                      <span>Planning Sequence...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-current" />
                      <span>✨ Generate Reel</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Prompt Inspiration Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Try Instant Ideas:</span>
                {[
                  { label: "🧘 Sri Sri & Art of Living", prompt: "Sri Sri Ravi Shankar and how he founded the Art of Living, spreading breathwork and peace to millions globally" },
                  { label: "☕ Hindi Husband-Wife Chai Banter", prompt: "A hilarious 30s Hindi comedy dialogue between husband and wife where the husband is begging for morning chai and the wife gives witty sarcastic replies" },
                  { label: "🍕 Midnight Fridge Snacking", prompt: "A funny Hindi comedy reel where wife catches her husband secretly opening the fridge at 2 AM with hilarious excuses" },
                  { label: "🚀 3 Startup Growth Secrets", prompt: "3 counter-intuitive marketing growth hacks that scaled our SaaS to 100k users in 90 days" },
                  { label: "🍿 Crime Thriller 30s Cliffhanger", prompt: "A dark cinematic crime thriller where a detective opens a locked briefcase and discovers a photograph of himself" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(item.prompt);
                      handleMagicPromptSubmit(item.prompt);
                    }}
                    className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-300 transition"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSurpriseIdea}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" /> Surprise Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {creationMode === "video_reel" && (
        <main className="mx-auto grid max-w-[1720px] gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[340px_1fr_360px] xl:grid-cols-[360px_1fr_380px] 2xl:grid-cols-[380px_1fr_400px]">
        {/* LEFT COLUMN: Production Settings & Presets (Pure Configuration, Zero Duplication) */}
        <aside className="h-fit rounded-[24px] border border-white/10 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-400 font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Studio Controls
            </div>
            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-black text-teal-300 font-mono">
              CINEMA ENGINE
            </span>
          </div>

          {/* 1. TARGET DURATION SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Target Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "15", label: "15s Reel", sub: "2 beats · Viral Hook" },
                { val: "30", label: "30s Reel", sub: "4 beats · Sweet Spot" },
                { val: "60", label: "60s Reel", sub: "8 beats · Deep Dive" },
                { val: "90", label: "90s Master", sub: "12 beats · Story" },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDuration(opt.val)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    duration === opt.val
                      ? "border-teal-400/80 bg-teal-500/15 text-white shadow-sm"
                      : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black">{opt.label}</span>
                    {duration === opt.val && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. ASPECT RATIO SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Framing & Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "9:16", label: "9:16", sub: "Reels / TikTok" },
                { id: "16:9", label: "16:9", sub: "YouTube Wide" },
                { id: "1:1", label: "1:1", sub: "Square Feed" },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    aspectRatio === r.id
                      ? "border-teal-400/80 bg-teal-500/15 text-white shadow-sm"
                      : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-mono font-black">{r.label}</div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. CAST & MULTI-CHARACTER PERSONA SELECTOR */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Cast & Presenters</span>
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setCastType("solo")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${castType === "solo" ? "bg-teal-500 text-obsidian-950 font-black shadow-sm" : "text-slate-400 hover:text-white"}`}
                >
                  Solo
                </button>
                <button
                  type="button"
                  onClick={() => setCastType("dual")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${castType === "dual" ? "bg-teal-500 text-obsidian-950 font-black shadow-sm" : "text-slate-400 hover:text-white"}`}
                >
                  Dual (Couple)
                </button>
              </div>
            </div>

            {/* Speaker 1 Card */}
            <div
              onClick={() => {
                setEditingPersonaSlot(1);
                setIsPersonaModalOpen(true);
              }}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition hover:border-teal-500/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-lg">
                  {selectedPersona.faceImageUrl ? (
                    <img src={selectedPersona.faceImageUrl} alt={selectedPersona.name} className="h-full w-full object-cover" />
                  ) : (
                    selectedPersona.avatarEmoji || "👤"
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-xs font-bold text-white truncate">{selectedPersona.name}</div>
                    <span className="rounded bg-teal-500/20 text-teal-300 px-1 py-0.2 text-[8px] font-black uppercase whitespace-nowrap">
                      {castType === "dual" ? "Lead / Wife" : "Lead"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{selectedPersona.role}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-400 hover:underline shrink-0 ml-2">
                Change →
              </span>
            </div>

            {/* Speaker 2 Card (When Dual Cast Active) */}
            {castType === "dual" && (
              <div
                onClick={() => {
                  setEditingPersonaSlot(2);
                  setIsPersonaModalOpen(true);
                }}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2.5 transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-lg">
                    {secondaryPersona.faceImageUrl ? (
                      <img src={secondaryPersona.faceImageUrl} alt={secondaryPersona.name} className="h-full w-full object-cover" />
                    ) : (
                      secondaryPersona.avatarEmoji || "👨"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-bold text-white truncate">{secondaryPersona.name}</div>
                      <span className="rounded bg-indigo-500/20 text-indigo-300 px-1 py-0.2 text-[8px] font-black uppercase whitespace-nowrap">
                        Partner
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{secondaryPersona.role}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 hover:underline shrink-0 ml-2">
                  Change →
                </span>
              </div>
            )}
          </div>

          {/* 4. LANGUAGE & SUBTITLES */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 font-mono">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-2 text-xs font-semibold text-white focus:border-teal-500/50 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 font-mono">Subtitles</label>
              <select
                value={subtitleStyle}
                onChange={(e) => setSubtitleStyle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-2 text-xs font-semibold text-white focus:border-teal-500/50 focus:outline-none"
              >
                {SUBTITLE_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. CURATED STORY PRESETS */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Curated Presets</span>
              <Link href="/studio/create" className="text-[10px] font-bold text-pink-400 hover:text-pink-300 transition flex items-center gap-0.5">
                Explore 24 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <select
              onChange={(e) => handleSelectGenrePreset(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-2 text-xs text-slate-200 outline-none focus:border-teal-400"
            >
              {QUICK_GENRE_PRESETS.map((p) => (
                <option key={p.id} value={p.prompt}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* If manifest exists, show Re-Plan quick button */}
          {production && (
            <button
              onClick={buildProduction}
              disabled={busy || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 py-2.5 text-xs font-bold text-teal-300 hover:bg-teal-500/20 transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy && operation === "plan" ? "animate-spin" : ""}`} />
              <span>Re-Plan Sequence ({duration}s)</span>
            </button>
          )}
        </aside>

        {/* CENTER COLUMN: Scene & Settings Tabs */}
        <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]/90 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(["Scenes", "Veo Timeline", "Script", "B-Roll", "SFX & Emojis", "Retention Heatmap", "Audio & Subtitles", "Format", "Cover"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeTab === tab ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-obsidian-950 font-extrabold shadow-md shadow-teal-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {shots.length > 0 && activeTab === "Scenes" && (
              <button
                onClick={() => handleAddShotAfter(shots[shots.length - 1].id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500/20 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add Scene
              </button>
            )}
          </div>

          <div className="p-5 sm:p-7">
            {/* TAB: VEO 3.1 RECURSIVE CHAINED TIMELINE (PREMIUM) */}
            {activeTab === "Veo Timeline" && (
              <VeoChainedTimeline
                currentTier="pro"
                isBYOK={true}
                initialCyclesCount={8}
                currentTime={0}
                isPlaying={false}
              />
            )}

            {/* TAB 1: SCENES & TIMELINE */}
            {activeTab === "Scenes" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-teal-400 font-mono">SCENE SEQUENCE & BEAT EDITOR</div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                      {manifest ? `${shots.length} Scenes (${generatedShotCount}/${totalShotCount} Generated)` : "Build a plan to create shots"}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* DeepMind QC Auto-Heal Loop Toggle */}
                    <button
                      type="button"
                      onClick={() => setAutoCritiqueLoopEnabled(!autoCritiqueLoopEnabled)}
                      title="When enabled, DeepMind Gemini Multimodal Video Critic analyzes each generated clip and automatically heals prompt defects before finalizing."
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                        autoCritiqueLoopEnabled
                          ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200 shadow-md shadow-cyan-500/20"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${autoCritiqueLoopEnabled ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
                      <span>DeepMind QC Loop: {autoCritiqueLoopEnabled ? "ON (Auto-Heal)" : "OFF"}</span>
                    </button>

                    {manifest && shots.length > 0 && (
                      <button
                        type="button"
                        onClick={generateAllMp4Parallel}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-5 py-2.5 text-xs font-black text-obsidian-950 shadow-lg shadow-teal-500/25 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
                      >
                        {busy && operation === "all" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                            <span>Rendering Scenes ({generatedShotCount}/{totalShotCount})...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            <span>🚀 Kickoff Video & Audio Render ({generatedShotCount}/{totalShotCount})</span>
                          </>
                        )}
                      </button>
                    )}
                    {shots.length > 0 && (
                      <button
                        type="button"
                        onClick={selectAllShots}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
                      >
                        {selectedShotIds.size === shots.length ? <CheckSquare className="h-3.5 w-3.5 text-teal-300" /> : <Square className="h-3.5 w-3.5 text-slate-400" />}
                        {selectedShotIds.size === shots.length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                </div>

                {busy && operation === "plan" ? (
                  <div className="space-y-5 rounded-2xl border border-teal-500/30 bg-slate-900/40 p-6 backdrop-blur-xl animate-pulse">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3 min-w-0">
                        <Loader2 className="w-6 h-6 text-teal-400 animate-spin shrink-0" />
                        <div className="min-w-0">
                          <h3 className="text-base font-black text-white font-mono truncate">
                            Synthesizing {duration}s Storyboard Sequence...
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[550px]">
                            Brief: &quot;{topic || "Cinematic Masterclass Sequence"}&quot;
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-xs font-mono font-bold text-teal-300 shrink-0">
                        {duration === "90" ? "12 BEATS · MASTER" : duration === "60" ? "8 BEATS · NARRATIVE" : duration === "15" ? "2 BEATS · VIRAL" : "4 BEATS · SWEET SPOT"}
                      </div>
                    </div>

                    {/* Step Pipeline Progress */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
                        <div className="text-[10px] font-bold uppercase text-teal-400">Step 1</div>
                        <div className="font-bold mt-1">Hook Psychology</div>
                        <div className="text-[10px] text-teal-400/80 mt-0.5">Dopamine trigger mapped</div>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        <div className="text-[10px] font-bold uppercase text-cyan-400">Step 2</div>
                        <div className="font-bold mt-1">Beat Architecture</div>
                        <div className="text-[10px] text-cyan-400/80 mt-0.5">Veo prompt generation</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Step 3</div>
                        <div className="font-bold mt-1">Vocal Stems & SFX</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">DeepMind Neural TTS</div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-slate-300">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Step 4</div>
                        <div className="font-bold mt-1">Manifest Assembly</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Continuity locked</div>
                      </div>
                    </div>

                    {/* 4 Skeleton Scene Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        { title: "Beat 01: High-Retention Visual Hook", dur: "3.2s" },
                        { title: "Beat 02: Curiosity Spike & Setup", dur: "4.5s" },
                        { title: "Beat 03: Core Core Value Delivery", dur: "5.1s" },
                        { title: "Beat 04: Climax & Call-to-Action", dur: "3.8s" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-white/5 bg-black/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 font-mono">{item.title}</span>
                            <span className="text-[10px] font-mono font-bold text-teal-400">{item.dur}</span>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded" />
                          <div className="h-3 w-4/5 bg-white/5 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : !manifest ? (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-slate-900/60 to-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white font-mono">
                            Ready to Produce Your Viral Multi-Shot Reel
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Pick a high-retention blueprint below or enter your topic in the Prompt Copilot above, then click <strong>✨ Generate Reel</strong>.
                          </p>
                        </div>
                      </div>

                      {/* 3-Step Pipeline Infographic */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="text-[10px] font-mono text-teal-400 font-bold uppercase">Step 01</div>
                          <div className="text-xs font-bold text-slate-200">AI Story & Script Beats</div>
                          <div className="text-[11px] text-slate-400">Gemini 2.5 Flash compiles viral multi-beat sequence</div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Step 02</div>
                          <div className="text-xs font-bold text-slate-200">Neural Voice & Dynamic Zoom</div>
                          <div className="text-[11px] text-slate-400">DeepMind TTS with Hormozi-style camera punch-ins</div>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="text-[10px] font-mono text-pink-400 font-bold uppercase">Step 03</div>
                          <div className="text-xs font-bold text-slate-200">4K Parallel Video Render</div>
                          <div className="text-[11px] text-slate-400">Google Veo 2 renders all cinematic shot cutaways</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Starter Blueprints */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                          ⚡ Trending High-Retention Blueprints (Click to Load)
                        </span>
                        <Link href="/studio/create" className="text-xs font-bold text-pink-400 hover:text-pink-300 transition flex items-center gap-1">
                          Browse 24 Visual Concepts <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const p = "3 habits quietly killing your focus and dopamine receptors every morning, and how to fix them.";
                            setTopic(p);
                            handleMagicPromptSubmit(p);
                          }}
                          className="text-left p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all group shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 whitespace-nowrap shrink-0">
                              BIOHACKING
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 whitespace-nowrap shrink-0">94% Retention</span>
                          </div>
                          <div className="font-bold text-xs text-white group-hover:text-teal-300 transition truncate">
                            3 Habits Killing Your Focus
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Morning dopamine mistakes, phone scrolling traps, and 2-minute neuroplasticity resets.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const p = "Sensei Ren teaches apprentice Aoi the secret of Mushin (Mind without Mind) during a thunderstorm duel on the wooden dojo balcony.";
                            setTopic(p);
                            handleMagicPromptSubmit(p);
                          }}
                          className="text-left p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 whitespace-nowrap shrink-0">
                              KAIZEN DOJO
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 whitespace-nowrap shrink-0">91% Retention</span>
                          </div>
                          <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">
                            The Thunderstorm of Mushin
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Master-apprentice philosophical dialogue with cinematic samurai choreography.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const p = "Husband Aarav cannot find his car keys for the third time this week, while wife Meera sarcastically calculates how much time they have lost.";
                            setTopic(p);
                            handleMagicPromptSubmit(p);
                          }}
                          className="text-left p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:border-rose-500/50 hover:bg-slate-900/80 transition-all group shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 whitespace-nowrap shrink-0">
                              DOMESTIC COMEDY
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 whitespace-nowrap shrink-0">96% Retention</span>
                          </div>
                          <div className="font-bold text-xs text-white group-hover:text-rose-300 transition truncate">
                            The Lost Keys (Hindi Banter)
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            Witty couple banter, hilarious household drama, and relatable punchlines.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Phase 5: 1-Click Viral A/B Hook Switcher */}
                    <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-teal-400" />
                          <span className="text-xs font-black uppercase tracking-wider text-white font-mono">
                            1-Click Viral A/B Hook Switcher (Phase 5)
                          </span>
                        </div>
                        <button
                          onClick={() => setHookSuite(generateHookSuite(topic))}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white"
                        >
                          <RefreshCw className="h-3 w-3" /> Regenerate 3 Angles
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Swap the opening 3-second hook to test conversion while preserving all downstream scenes and stitched timeline.
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {hookSuite.variants.map(variant => {
                          const isActive = hookSuite.activeVariantId === variant.id;
                          return (
                            <div
                              key={variant.id}
                              onClick={() => handleApplyHook(variant)}
                              className={`cursor-pointer rounded-xl border p-3 transition ${
                                isActive
                                  ? "border-teal-400 bg-teal-400/15 shadow-lg shadow-teal-500/10"
                                  : "border-white/10 bg-black/30 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-white">{variant.label}</span>
                                {isActive && <Check className="h-3.5 w-3.5 text-teal-300" />}
                              </div>
                              <div className="mt-1 inline-block rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-teal-300">
                                {variant.badge}
                              </div>
                              <p className="mt-2 text-[11px] leading-snug text-slate-300 line-clamp-3">
                                "{variant.scriptText}"
                              </p>
                              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-500">
                                <span>{variant.cameraMotion}</span>
                                <span className="font-bold text-teal-300">{isActive ? "ACTIVE HOOK" : "1-Click Swap"}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedShotIds.size > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-teal-300/30 bg-teal-950/30 p-3 backdrop-blur-lg">
                        <span className="text-xs font-bold text-teal-200">
                          {selectedShotIds.size} scene{selectedShotIds.size > 1 ? "s" : ""} selected
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleBulkClone}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                          >
                            <Copy className="h-3.5 w-3.5" /> Clone Selected
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                          </button>
                          <button
                            onClick={() => setSelectedShotIds(new Set())}
                            className="p-1.5 text-slate-400 hover:text-white"
                            aria-label="Clear selection"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {shots.map((shot, i) => {
                        const generated = Boolean(shot.asset?.videoUrl);
                        const isSelected = selectedShotId === shot.id;
                        const isChecked = selectedShotIds.has(shot.id);
                        const isEditing = editingShotId === shot.id;

                        return (
                          <div
                            key={shot.id}
                            className={`rounded-2xl border p-4 transition ${
                              isSelected
                                ? "border-teal-400/50 bg-teal-400/[0.06]"
                                : isChecked
                                ? "border-teal-400/30 bg-white/[0.04]"
                                : "border-white/10 bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectShot(shot.id)}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-teal-400 focus:ring-0"
                              />
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-black text-teal-300">
                                {i + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-[10px] font-bold uppercase text-slate-400">Spoken Dialogue / Beat</label>
                                      <textarea
                                        value={editScriptText}
                                        onChange={(e) => setEditScriptText(e.target.value)}
                                        rows={2}
                                        className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-teal-300"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold uppercase text-slate-400">Visual Intent</label>
                                      <textarea
                                        value={editVisualIntent}
                                        onChange={(e) => setEditVisualIntent(e.target.value)}
                                        rows={2}
                                        className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-teal-300"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleSaveEdit}
                                        className="inline-flex items-center gap-1 rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-300"
                                      >
                                        <Save className="h-3.5 w-3.5" /> Save Changes
                                      </button>
                                      <button
                                        onClick={() => setEditingShotId(null)}
                                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="text-sm font-semibold leading-6 text-white">"{shot.scriptText}"</div>
                                    <div className="mt-1 text-xs text-slate-400">{shot.visualIntent}</div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                                      <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-slate-400">
                                        {shot.editorialStartSec.toFixed(1)}s – {(shot.editorialStartSec + shot.editorialDurationSec).toFixed(1)}s
                                      </span>
                                      <span className={`rounded-md px-2 py-0.5 font-bold ${generated ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                                        {generated ? `Generated (${shot.asset?.actualDurationSec?.toFixed(2)}s)` : "Planned"}
                                      </span>
                                      {zoomKeyframes[i] && zoomKeyframes[i].scale > 1.0 && (
                                        <span className="rounded-md border border-teal-500/30 bg-teal-500/15 px-2 py-0.5 font-black text-teal-300">
                                          🔍 {zoomKeyframes[i].label}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Scene Action Buttons */}
                                {!isEditing && (
                                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2.5">
                                    {!generated && (
                                      <button
                                        type="button"
                                        onClick={() => runAction("generateNextShot", "shot")}
                                        disabled={busy}
                                        className="inline-flex items-center gap-1 rounded-lg border border-teal-400/40 bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-400/25 transition shadow-sm"
                                      >
                                        <PlayCircle className="h-3 w-3 fill-current" /> Render Clip
                                      </button>
                                    )}
                                    {generated && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedShotId(shot.id)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-[11px] font-bold text-teal-200 hover:bg-teal-300/20"
                                      >
                                        <Eye className="h-3 w-3" /> Preview Clip
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditShot(shot)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
                                    >
                                      <Pencil className="h-3 w-3" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleCloneShot(shot)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
                                    >
                                      <Copy className="h-3 w-3" /> Clone
                                    </button>
                                    <button
                                      onClick={() => handleAddShotAfter(shot.id)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
                                    >
                                      <Plus className="h-3 w-3" /> Insert After
                                    </button>
                                    <button
                                      onClick={() => handleMoveShot(shot.id, -1)}
                                      disabled={i === 0}
                                      className="rounded-lg border border-white/10 p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveShot(shot.id, 1)}
                                      disabled={i === shots.length - 1}
                                      className="rounded-lg border border-white/10 p-1 text-slate-400 hover:text-white disabled:opacity-30"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteShot(shot.id)}
                                      className="rounded-lg border border-red-400/20 p-1 text-red-300 hover:bg-red-400/10"
                                      title="Delete Scene"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MASTER SCRIPT */}
            {activeTab === "Script" && (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">MASTER SCRIPT</div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">Spoken Production Narrative</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadSrt}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5 text-pink-300" /> Export .SRT
                    </button>
                    <button
                      onClick={copyText}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy Script"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {script.map((line, i) => (
                    <div key={`${i}-${line.slice(0, 20)}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300">
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] font-black text-pink-300">
                        {i + 1}
                      </span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SMART B-ROLL & VISUAL CUTAWAY ENGINE (PHASE 3) */}
            {activeTab === "B-Roll" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
                      <Sparkles className="h-3.5 w-3.5" /> SMART B-ROLL & VISUAL CUTAWAYS
                    </div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                      Script-Driven Visual Inserts & PIP Overlays
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-black text-teal-300">
                      {brollItems.filter(b => b.enabled).length} Active Cutaways
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-400">
                  Automatically extracts visual keywords from spoken narrative beats and inserts contextual 1080p B-roll cutaways and Picture-in-Picture (PIP) split screens to keep viewer dopamine high.
                </p>

                {brollItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
                    Build a production plan first to generate contextual B-roll cutaways.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {brollItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 transition ${
                          item.enabled
                            ? "border-teal-400/40 bg-teal-400/[0.03]"
                            : "border-white/10 bg-black/20 opacity-60"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleBRollItem(item.id)}
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-black transition ${
                                item.enabled
                                  ? "border-teal-400 bg-teal-400 text-slate-950"
                                  : "border-white/20 bg-white/5 text-slate-500"
                              }`}
                            >
                              {item.enabled ? "✓" : ""}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">
                                  Beat {item.sceneIndex + 1} Cutaway
                                </span>
                                <span className="rounded-md border border-teal-400/30 bg-teal-400/10 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300">
                                  {item.keyword}
                                </span>
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-400">
                                Timeline: {item.startSec.toFixed(1)}s – {(item.startSec + item.durationSec).toFixed(1)}s ({item.durationSec.toFixed(1)}s duration)
                              </div>
                            </div>
                          </div>

                          {/* Framing Selector */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateBRollType(item.id, "full_cutaway")}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                                item.type === "full_cutaway"
                                  ? "bg-teal-400 text-slate-950"
                                  : "border border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              Full Cutaway
                            </button>
                            <button
                              onClick={() => updateBRollType(item.id, "pip_top_right")}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                                item.type === "pip_top_right"
                                  ? "bg-pink-500 text-white"
                                  : "border border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              PIP Top-Right
                            </button>
                            <button
                              onClick={() => updateBRollType(item.id, "split_screen")}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                                item.type === "split_screen"
                                  ? "bg-amber-400 text-slate-950"
                                  : "border border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              Split Screen
                            </button>
                          </div>
                        </div>

                        {/* Preset Selector Row */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock B-Roll:</span>
                          {BROLL_PRESET_LIBRARY.map(preset => (
                            <button
                              key={preset.id}
                              onClick={() => selectBRollPreset(item.id, preset.videoUrl, preset.title, preset.keywords[0])}
                              className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                                item.brollUrl === preset.videoUrl
                                  ? "border-teal-400 bg-teal-400/20 text-teal-200"
                                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {preset.title}
                            </button>
                          ))}
                          <label className="cursor-pointer rounded-lg border border-pink-400/30 bg-pink-400/10 px-2 py-1 text-[10px] font-bold text-pink-300 transition hover:bg-pink-400/20 hover:text-pink-200">
                            + Upload Clip
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCustomBRollUpload(item.id, file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: 3D KINETIC EMOJIS & AUTO-SFX ENGINE (PHASE 4) */}
            {activeTab === "SFX & Emojis" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">
                      <Sparkles className="h-3.5 w-3.5" /> 3D KINETIC EMOJIS & AUTO-SFX
                    </div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                      Animated Keyword Popups & Audio Stems
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-black text-pink-300">
                      {kineticEmojis.filter(e => e.enabled).length} Active Popups
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-400">
                  Automatically detects high-impact viral words and pairs them with animated 3D emojis and procedural sound effects (Whoosh, Ding, Cash Chime, Bass Drop) to command viewer attention.
                </p>

                {kineticEmojis.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
                    Build a production plan first to generate kinetic emoji triggers.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kineticEmojis.map(item => (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 transition ${
                          item.enabled
                            ? "border-pink-400/40 bg-pink-400/[0.03]"
                            : "border-white/10 bg-black/20 opacity-60"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleEmojiItem(item.id)}
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-black transition ${
                                item.enabled
                                  ? "border-pink-400 bg-pink-400 text-slate-950"
                                  : "border-white/20 bg-white/5 text-slate-500"
                              }`}
                            >
                              {item.enabled ? "✓" : ""}
                            </button>
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl filter drop-shadow-md">{item.emoji}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white">
                                    Beat {item.sceneIndex + 1}: {item.label}
                                  </span>
                                  <span className="rounded-md border border-pink-400/30 bg-pink-400/10 px-2 py-0.5 text-[10px] font-black uppercase text-pink-300">
                                    {item.keyword}
                                  </span>
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                  Trigger: {item.startSec.toFixed(1)}s ({item.durationSec.toFixed(1)}s duration) · SFX: {item.sfx}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sound Test Button */}
                          <button
                            onClick={() => playProceduralSFX(item.sfx, 0.9)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-300 transition hover:bg-yellow-400/20"
                          >
                            <Volume2 className="h-3.5 w-3.5" /> Test SFX ({item.sfx})
                          </button>
                        </div>

                        {/* Preset Emoji Picker */}
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emoji:</span>
                          {EMOJI_KEYWORD_DICTIONARY.map(dict => (
                            <button
                              key={dict.emoji}
                              onClick={() => selectEmojiPreset(item.id, dict.emoji, dict.label, dict.sfx)}
                              className={`rounded-lg border px-2 py-1 text-xs transition ${
                                item.emoji === dict.emoji
                                  ? "border-pink-400 bg-pink-400/20 text-white"
                                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {dict.emoji} {dict.label}
                            </button>
                          ))}
                        </div>

                        {/* Animation & SFX Selection Row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Animation:</span>
                            {(["pop_bounce", "spin_in", "slide_from_bottom", "floating_pulse", "impact_slam"] as const).map(anim => (
                              <button
                                key={anim}
                                onClick={() => updateEmojiAnimation(item.id, anim)}
                                className={`rounded-lg px-2 py-0.5 text-[9px] font-bold transition ${
                                  item.animation === anim
                                    ? "bg-pink-500 text-white"
                                    : "border border-white/10 text-slate-400 hover:text-white"
                                }`}
                              >
                                {anim.replace("_", " ")}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SFX:</span>
                            {(["whoosh", "ding", "cash_chime", "bass_drop", "pop", "glitch"] as const).map(sfx => (
                              <button
                                key={sfx}
                                onClick={() => {
                                  updateEmojiSFX(item.id, sfx);
                                  playProceduralSFX(sfx, 0.9);
                                }}
                                className={`rounded-lg px-2 py-0.5 text-[9px] font-bold transition ${
                                  item.sfx === sfx
                                    ? "bg-yellow-400 text-slate-950 font-black"
                                    : "border border-white/10 text-slate-400 hover:text-white"
                                }`}
                              >
                                {sfx.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI VIRAL RETENTION HEATMAP & ALGORITHM SIMULATOR */}
            {activeTab === "Retention Heatmap" && (
              <div className="space-y-6">
                <RetentionHeatmapPanel
                  hookText={shots[0]?.scriptText || topic}
                  totalDurationSec={durationNumber(duration)}
                  scenesCount={shots.length || 4}
                  kineticEmojiTimings={kineticEmojis.filter(e => e.enabled).map(e => e.startSec)}
                  brollTimings={brollItems.filter(b => b.enabled).map(b => b.startSec)}
                  dopamineSplitEnabled={dopamineConfig.enabled}
                  onApplyAutoFix={handleApplyAutoFix}
                />
              </div>
            )}

            {/* TAB 5: AUDIO, MUSIC & SUBTITLE OPTIONS */}
            {activeTab === "Audio & Subtitles" && (

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">VOICE & AUDIO SETTINGS</div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">Languages, Subtitles & Background Score</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Globe className="h-4 w-4 text-pink-300" /> Spoken Dialogue Language
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-pink-300"
                    >
                      {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Music className="h-4 w-4 text-teal-300" /> Background Music & Ambient Score
                    </div>
                    <select
                      value={musicTrack}
                      onChange={(e) => setMusicTrack(e.target.value)}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-teal-300"
                    >
                      {MUSIC_TRACKS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    {musicTrack !== "none" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Music Volume & Auto-Ducking</span>
                          <span>{musicVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(Number(e.target.value))}
                          className="mt-2 w-full accent-pink-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Captions className="h-4 w-4 text-pink-300" /> Ultra-Kinetic Creator Subtitle Presets (Tier 2)
                    </div>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      Word-by-Word Bouncing
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {VIRAL_SUBTITLE_PRESETS.map(style => (
                      <div
                        key={style.id}
                        onClick={() => setSubtitleStyle(style.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition ${
                          subtitleStyle === style.id
                            ? "border-pink-300 bg-pink-400/15 text-white shadow-lg shadow-pink-500/10"
                            : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white">{style.name}</div>
                          <span className="text-[9px] font-mono text-zinc-400">{style.creatorTag}</span>
                        </div>
                        <div className="mt-1 inline-block rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-pink-300">
                          {style.badge}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400 leading-snug">{style.description}</div>
                      </div>
                    ))}
                  </div>


                  <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400">Subtitle Placement</label>
                      <select
                        value={subtitlePlacement}
                        onChange={(e) => setSubtitlePlacement(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white"
                      >
                        <option value="lower-third">Lower Third (Standard Social)</option>
                        <option value="center">Center Focus (Hook Focus)</option>
                        <option value="top">Top Header (Headline Placement)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FORMAT & CANVAS DIMENSIONS */}
            {activeTab === "Format" && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">ASPECT RATIO & PLATFORMS</div>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">Target Framing & Staging</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {ASPECT_RATIOS.map(ratio => (
                    <div
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`cursor-pointer rounded-2xl border p-5 transition ${
                        aspectRatio === ratio.id
                          ? "border-pink-300 bg-pink-400/10 text-white"
                          : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black">{ratio.id}</span>
                        {aspectRatio === ratio.id && <Check className="h-5 w-5 text-pink-300" />}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">{ratio.name}</div>
                    </div>
                  ))}
                </div>

                {/* AI Auto-Zoom & Dynamic Punch-Ins Preset Engine */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-300" />
                      <h3 className="text-sm font-bold text-white">AI Auto-Zoom & Framing Shift Engine</h3>
                    </div>
                    <span className="rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-[10px] font-black text-pink-300">
                      Submagic / Hormozi Retention
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Automatically applies dynamic camera punch-ins (1.12x / 1.22x) on spoken beats to eliminate visual fatigue and maximize viral watch-through rate.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {AUTO_ZOOM_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => setZoomPreset(preset.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          zoomPreset === preset.id
                            ? "border-pink-300 bg-pink-400/10 text-white shadow-lg shadow-pink-500/5"
                            : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{preset.name}</span>
                          <span className="text-[10px] font-bold text-pink-300">{preset.badge}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-400">{preset.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: COVER DIRECTIONS */}
            {activeTab === "Cover" && <CoverPanel topic={topic} />}
          </div>
        </section>

        {/* RIGHT COLUMN: Video Monitor & Production Truth */}
        <aside className="order-first lg:order-last h-fit lg:sticky lg:top-20 space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-2xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{selectedShot ? `Clip ${Math.max(1, (shots.findIndex(s => s.id === selectedShot.id) ?? 0) + 1)} Review` : roughCut?.videoUrl ? "Full Reel Master" : "Interactive Studio Monitor"}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {selectedShot ? `${selectedShot.editorialDurationSec.toFixed(1)}s · Cinema Source` : `Neural Cinema & Audio Engine · ${AUTO_ZOOM_PRESETS.find(p => p.id === zoomPreset)?.name}`}
                </div>
              </div>
              {selectedShot && roughCut?.videoUrl && (
                <button onClick={() => setSelectedShotId(null)} className="rounded-xl border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-bold text-teal-300 hover:bg-teal-500/20 transition">
                  FULL REEL
                </button>
              )}
            </div>
            <DynamicZoomVideoPlayer
              videoUrl={previewVideoUrl || ""}
              keyframes={zoomKeyframes}
              brollItems={brollItems}
              kineticEmojis={kineticEmojis}
              subtitleText={shots[0]?.scriptText || topic}
              subtitleStyle={subtitleStyle}
            />
            <ResolutionDownloadDropdown
              videoUrl={previewVideoUrl || ""}
              durationSec={durationNumber(duration)}
              filenameBase={topic ? topic.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 24) : "zyvoriq_reel"}
            />
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-teal-400 font-mono flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                Production Truth
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {production ? "VERIFIED" : "UNBOUND"}
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <Status icon={Database} label="Manifest" value={production ? `Persisted r${production.revision}` : "Not created"} />
              <Status icon={Film} label="State" value={manifest?.status || "DRAFT"} />
              <Status icon={Globe} label="Language" value={LANGUAGES.find(l => l.code === language)?.name || language} />
              <Status icon={Captions} label="Subtitles" value={SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.name || subtitleStyle} />
              <Status icon={Video} label="Scene Clips" value={manifest ? `${generatedShotCount}/${totalShotCount}` : "Pending"} />
              <Status icon={Film} label="Combined MP4" value={roughCut ? `${roughCut.actualDurationSec.toFixed(2)}s` : "Pending"} />
            </div>

            {/* Docked Fast Tools */}
            <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
              <Link
                href="/studio/inspector"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:border-teal-500/40 hover:bg-slate-800/60 transition shadow-sm"
              >
                <ScanSearch className="w-3.5 h-3.5 text-teal-400" />
                <span>Inspector</span>
              </Link>
              <Link
                href="/studio/library"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:border-teal-500/40 hover:bg-slate-800/60 transition shadow-sm"
              >
                <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>Library</span>
              </Link>
            </div>
          </div>
        </aside>
      </main>
      )}

      {creationMode === "podcast" && (
        <main className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">
          <PodcastStudioView initialTopic={topic} />
        </main>
      )}

      {creationMode === "carousel" && (
        <main className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">
          <CarouselStudioView initialTopic={topic} />
        </main>
      )}

      {creationMode === "song" && (
        <main className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">
          <SongStudioView initialTopic={topic} />
        </main>
      )}

      {creationMode === "story" && (
        <main className="mx-auto max-w-[1600px] px-5 py-6 md:px-8">
          <StoryStudioView initialTopic={topic} />
        </main>
      )}

      <PersonaVaultModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        selectedPersonaId={editingPersonaSlot === 1 ? selectedPersona.id : secondaryPersona.id}
        onSelectPersona={(p) => {
          if (editingPersonaSlot === 1) {
            setSelectedPersona(p);
          } else {
            setSecondaryPersona(p);
          }
        }}
      />

      <SocialPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        topic={topic}
        productionId={production?.id || "prod_active_demo"}
        videoUrl={roughCut?.videoUrl}
      />

      <RemixShareModal
        isOpen={isRemixModalOpen}
        onClose={() => setIsRemixModalOpen(false)}
        currentRecipe={currentRemixRecipe}
        onApplyTemplate={handleApplyRemixTemplate}
      />

      <PromptDirectorBuilderModal
        isOpen={isPromptBuilderOpen}
        onClose={() => setIsPromptBuilderOpen(false)}
        onApplyPrompt={(res) => {
          setTopic(res.topicBrief);
          if (res.language) setLanguage(res.language);
          if (res.aspectRatio) setAspectRatio(res.aspectRatio);
          if (res.duration) setDuration(res.duration);
        }}
      />
    </div>
    </StudioSidebar>
  );
}




function ActionButton({ onClick, disabled, active, icon: Icon, idle, busyLabel, primary = false }: { onClick: () => void; disabled: boolean; active: boolean; icon: React.ComponentType<{ className?: string }>; idle: string; busyLabel: string; primary?: boolean }) {
  const style = primary ? "bg-white text-slate-950 font-black" : "border border-pink-300/20 bg-white/[0.04] text-white";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      {active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {active ? busyLabel : idle}
    </button>
  );
}

function Field({ label, value, onChange, options, displayLabels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; displayLabels?: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-400">{label.toUpperCase()}</span>
      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 pr-9 text-xs font-semibold text-slate-200 outline-none focus:border-pink-300/40"
        >
          {options.map((o, idx) => (
            <option key={o} value={o}>
              {displayLabels?.[idx] || o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500" />
      </div>
    </label>
  );
}

function CoverPanel({ topic }: { topic: string }) {
  const base = topic.trim() || "YOUR NEXT REEL";
  const options = [base.toUpperCase(), `WHY ${base.toUpperCase()}`, "STOP IGNORING THIS"];
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200">
        <ImageIcon className="h-5 w-5" />
      </div>
      <div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">COVER DIRECTIONS</div>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">Thumbnail & Hook Directions</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {options.map((title, i) => (
          <div key={`${i}-${title}`} className="aspect-[4/5] rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.24),transparent_25%),linear-gradient(150deg,#17111b,#0b1015)] p-5">
            <div className="text-xs font-bold text-slate-500">OPTION {i + 1}</div>
            <div className="mt-20 text-xl font-black leading-tight tracking-[-0.035em] text-white">{title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Status({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="max-w-[155px] truncate text-xs font-semibold text-slate-300">{value}</span>
    </div>
  );
}
