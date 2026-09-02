"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUp, ArrowDown, Sparkles, Clapperboard, Captions, Mic2,
  Image as ImageIcon, Copy, Check, Instagram, Youtube, ChevronDown, Loader2,
  CircleAlert, Database, Film, AudioLines, Video, Download, Trash2, Plus,
  Pencil, Save, X, Globe, Music, Volume2, Sliders, CheckSquare, Square,
  Layers, Wand2, RefreshCw, Eye, Zap, Share2, Send, Radio, BookOpen
} from "lucide-react";
import type { ReelProductionManifest, ReelShot } from "@/lib/reel/types";
import { PersonaClone, PRESET_PERSONAS } from "@/lib/reel/personas";
import { PersonaVaultModal } from "@/components/PersonaVaultModal";
import { SocialPublishModal } from "@/components/SocialPublishModal";
import { ResolutionDownloadDropdown } from "@/components/ResolutionDownloadDropdown";
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
import DopamineSplitModal from "@/components/DopamineSplitModal";
import UgcAdGeneratorModal from "@/components/UgcAdGeneratorModal";
import RetentionHeatmapPanel from "@/components/RetentionHeatmapPanel";
import RemixShareModal from "@/components/RemixShareModal";
import RedditStoryModal from "@/components/RedditStoryModal";
import AutoMemeModal from "@/components/AutoMemeModal";
import GlobalDubberModal from "@/components/GlobalDubberModal";
import DemonetizationArmorModal from "@/components/DemonetizationArmorModal";
import { TrendRadarModal } from "@/components/TrendRadarModal";
import { BookStudioModal } from "@/components/BookStudioModal";
import { PredictedTrend } from "@/lib/reel/trendRadarEngine";
import { DopamineConfig, DEFAULT_DOPAMINE_CONFIG } from "@/lib/reel/dopamineSplitScreen";
import { UgcAdCampaign } from "@/lib/reel/ugcAdEngine";
import { AutoFixRecommendation } from "@/lib/reel/retentionPredictor";
import { ReelRemixRecipe } from "@/lib/reel/remixEngine";
import { RedditStoryConfig } from "@/lib/reel/redditStoryEngine";
import { VIRAL_SUBTITLE_PRESETS } from "@/lib/reel/viralSubtitles";
import { autoDetectMemeCutaways, MemeCutawayItem, MemePreset } from "@/lib/reel/autoMemeEngine";
import { DubbedTrackResult } from "@/lib/reel/globalDubber";
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
  const [selectedPersona, setSelectedPersona] = useState<PersonaClone>(PRESET_PERSONAS[0]);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDopamineModalOpen, setIsDopamineModalOpen] = useState(false);
  const [isUgcModalOpen, setIsUgcModalOpen] = useState(false);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [isRedditModalOpen, setIsRedditModalOpen] = useState(false);
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);
  const [isDubberModalOpen, setIsDubberModalOpen] = useState(false);
  const [isArmorModalOpen, setIsArmorModalOpen] = useState(false);
  const [isTrendRadarOpen, setIsTrendRadarOpen] = useState(false);
  const [isBookStudioOpen, setIsBookStudioOpen] = useState(false);
  const [detectedMemes, setDetectedMemes] = useState<MemeCutawayItem[]>([]);
  const [dopamineConfig, setDopamineConfig] = useState<DopamineConfig>(DEFAULT_DOPAMINE_CONFIG);
  const [zoomPreset, setZoomPreset] = useState<AutoZoomPresetId>("dynamic-viral");
  const [activeTab, setActiveTab] = useState<"Scenes" | "Script" | "B-Roll" | "SFX & Emojis" | "Retention Heatmap" | "Audio & Subtitles" | "Format" | "Cover">("Scenes");



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

  // Tier 3: Auto-Meme & Reaction Cutaways Engine
  const defaultMemes = useMemo(() => autoDetectMemeCutaways(shots), [shots]);
  useEffect(() => {
    setDetectedMemes(defaultMemes);
  }, [defaultMemes]);

  const handleToggleMeme = (id: string) => {
    setDetectedMemes(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleAddCustomMeme = (preset: MemePreset) => {
    const newMeme: MemeCutawayItem = {
      id: `meme_custom_${Date.now()}`,
      shotId: shots[0]?.id || "shot_1",
      sceneIndex: 0,
      timestampSec: 2.0,
      memeId: preset.id,
      title: preset.title,
      memeUrl: preset.memeUrl,
      sfx: preset.sfx,
      layout: "pip_center",
      durationSec: preset.durationSec,
      enabled: true
    };
    setDetectedMemes(prev => [...prev, newMeme]);
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

  const handleApplyUgcCampaign = (campaign: UgcAdCampaign) => {
    setTopic(campaign.suggestedTitle);
    const targetPersona = PRESET_PERSONAS.find(p => p.id === campaign.avatarPersonaId) || PRESET_PERSONAS[0];
    setSelectedPersona(targetPersona);

    if (production) {
      const ugcShots: ReelShot[] = campaign.scenes.map((scene, idx) => ({
        id: `shot_ugc_${scene.sceneIndex}`,
        order: scene.sceneIndex,
        editorialStartSec: idx * 4,
        editorialDurationSec: scene.durationSec,
        generationDurationSec: 4,
        trimInSec: 0,
        trimOutSec: 0,
        scriptText: scene.dialogue,
        visualIntent: `Presenter holds and reviews ${campaign.productName}. Camera: ${scene.cameraMovement}. Overlay: ${scene.overlayBadge}`,
        generationPrompt: `High resolution photorealistic video of presenter holding and reviewing ${campaign.productName}`,
        continuityIn: {
          character: targetPersona.name,
          wardrobe: "Casual Creator Wear",
          environment: "Modern Creator Studio / Desk",
          lighting: "Crisp Ring Light Key"
        },
        continuityOut: {
          character: targetPersona.name,
          wardrobe: "Casual Creator Wear",
          environment: "Modern Creator Studio / Desk",
          lighting: "Crisp Ring Light Key"
        },
        transitionOut: { type: "hard-cut", durationSec: 0 },
        dependsOnShotIds: [],
        status: "PLANNED"
      }));

      const updatedManifest: ReelProductionManifest = {
        ...production.manifest,
        topic: campaign.suggestedTitle,
        masterScript: campaign.scenes.map(s => s.dialogue).join(" "),
        shots: ugcShots
      };

      setProduction({ ...production, manifest: updatedManifest });
    }
    setActiveTab("Scenes");
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

  const handleApplyRedditStory = (story: RedditStoryConfig) => {
    setTopic(`${story.subreddit}: ${story.title}`);
    setDuration(story.totalDurationSec.toString());
    if (production) {
      const redditShots: ReelShot[] = story.messages.map((msg, idx) => ({
        id: `shot_reddit_${msg.id}`,
        order: idx + 1,
        editorialStartSec: msg.timestampSec,
        editorialDurationSec: 4.0,
        generationDurationSec: 4,
        trimInSec: 0,
        trimOutSec: 0,
        scriptText: `${msg.senderName}: "${msg.text}"`,
        visualIntent: `Animated iMessage chat bubble from ${msg.senderName} popping up over dark ambient background with typing dots.`,
        generationPrompt: `Dark cinematic ambient screen with iOS style iMessage chat bubble from ${msg.senderName}`,
        continuityIn: {
          character: msg.senderName,
          wardrobe: "Dark Cinematic",
          environment: "Ambient Chat Screen",
          lighting: "Neon Glow"
        },
        continuityOut: {
          character: msg.senderName,
          wardrobe: "Dark Cinematic",
          environment: "Ambient Chat Screen",
          lighting: "Neon Glow"
        },
        transitionOut: { type: "hard-cut", durationSec: 0 },
        dependsOnShotIds: [],
        status: "PLANNED"
      }));

      const updatedManifest: ReelProductionManifest = {
        ...production.manifest,
        topic: `${story.subreddit}: ${story.title}`,
        masterScript: story.messages.map(m => `${m.senderName}: "${m.text}"`).join(" "),
        shots: redditShots
      };

      setProduction({ ...production, manifest: updatedManifest });
    }
    setActiveTab("Scenes");
  };

  const handleApplyDubbedAudio = (result: DubbedTrackResult) => {
    setLanguage(result.languageCode);
    if (production && production.manifest.outputs?.narratedRoughCut) {
      setProduction({
        ...production,
        manifest: {
          ...production.manifest,
          outputs: {
            ...production.manifest.outputs,
            narratedRoughCut: {
              ...production.manifest.outputs.narratedRoughCut,
              videoUrl: result.dubbedAudioUrl
            }
          }
        }
      });
    }
  };

  const handleApplyCensoredScript = (censoredText: string) => {
    if (production) {
      setProduction({
        ...production,
        manifest: {
          ...production.manifest,
          masterScript: censoredText
        }
      });
    }
  };

  const handleBeatAlign = () => {
    if (production && production.manifest.shots.length > 0) {
      const aligned = beatAlignShots(production.manifest.shots, TRENDING_AUDIO_TRACKS[0]);
      setProduction({
        ...production,
        manifest: {
          ...production.manifest,
          shots: aligned
        }
      });
    }
  };

  const handleLaunchTrendInStudio = (trend: PredictedTrend) => {
    setTopic(trend.title);
    setDuration("60");
    if (trend.transpiledRecipes.reel60s.visualStyle === "ali_abdaal_sky") {
      setSubtitleStyle("ali-abdaal-sky");
    } else if (trend.transpiledRecipes.reel60s.visualStyle === "mrbeast_neon") {
      setSubtitleStyle("mrbeast-red");
    } else {
      setSubtitleStyle("hormozi-bold");
    }
    if (production) {
      const newShots: ReelShot[] = trend.transpiledRecipes.reel60s.scriptBeats.map((beat, idx) => ({
        id: `shot_trend_${idx + 1}`,
        order: idx + 1,
        editorialStartSec: idx * 4,
        editorialDurationSec: 4,
        generationDurationSec: 4,
        trimInSec: 0,
        trimOutSec: 0,
        scriptText: beat,
        visualIntent: `Presenter explains: ${beat}. High kinetic interest.`,
        generationPrompt: `Cinematic high quality presentation video. Lighting: Studio Key. Subject: Presenter discussing ${trend.title}`,
        continuityIn: {
          character: selectedPersona.name,
          wardrobe: "Casual Creator Wear",
          environment: "Modern Creator Studio / Desk",
          lighting: "Crisp Ring Light Key"
        },
        continuityOut: {
          character: selectedPersona.name,
          wardrobe: "Casual Creator Wear",
          environment: "Modern Creator Studio / Desk",
          lighting: "Crisp Ring Light Key"
        },
        transitionOut: { type: "hard-cut", durationSec: 0 },
        dependsOnShotIds: [],
        status: "PLANNED"
      }));

      setProduction({
        ...production,
        manifest: {
          ...production.manifest,
          topic: trend.title,
          masterScript: `${trend.transpiledRecipes.reel60s.hook} ${trend.transpiledRecipes.reel60s.scriptBeats.join(" ")}`,
          shots: newShots
        }
      });
    }
    setIsTrendRadarOpen(false);
    setActiveTab("Scenes");
  };





  const busy = operation !== null;
  const generateAllBusyLabel = manifest?.status === "SCRIPT_READY"
    ? "Generating narration…"
    : generatedShotCount < totalShotCount
      ? `Generating all · ${generatedShotCount}/${totalShotCount}`
      : "Combining one MP4…";

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 font-black text-slate-950">Z</div>
              <div>
                <div className="font-black tracking-[-0.02em] text-white">Reel Studio Pro</div>
                <div className="text-[11px] text-slate-500">Option C Native Veo 3.1 & Multi-Shot Studio Suite</div>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-xs font-medium text-slate-400 sm:flex">
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-300">
              <Globe className="h-3.5 w-3.5 text-pink-300" /> {LANGUAGES.find(l => l.code === language)?.name}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-teal-300" /> {aspectRatio}
            </span>
            <span className={`h-2 w-2 rounded-full ${production ? "bg-emerald-400" : "bg-slate-700"}`} />
            {production ? `Persisted · r${production.revision}` : "Draft Mode"}
            <button
              onClick={() => setIsTrendRadarOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1.5 text-xs font-bold text-indigo-200 shadow-sm transition hover:border-indigo-500/60 hover:from-indigo-500/30 hover:to-purple-500/30"
            >
              <span>🔮 7-Day Trend Radar</span>
            </button>
            <button
              onClick={() => setIsBookStudioOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 shadow-sm transition hover:border-amber-500/60 hover:from-amber-500/30 hover:to-orange-500/30"
            >
              <span>📚 Book Studio</span>
            </button>
            <button
              onClick={() => setIsRemixModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-200 shadow-sm transition hover:border-purple-500/50 hover:bg-purple-500/20"
            >
              <span>🔁 Remix Reel</span>
            </button>
            <button
              onClick={() => setIsRedditModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-200 shadow-sm transition hover:border-cyan-500/50 hover:bg-cyan-500/20"
            >
              <span>💬 Reddit Story</span>
            </button>
            <button
              onClick={() => setIsUgcModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200 shadow-sm transition hover:border-amber-500/50 hover:bg-amber-500/20"
            >
              <span>🛍️ UGC Ad</span>
            </button>
            <button
              onClick={() => setIsDopamineModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                dopamineConfig.enabled
                  ? "border-pink-500 bg-pink-500/20 text-pink-200 font-black shadow-pink-500/20"
                  : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-pink-500/40"
              }`}
            >
              <span>🎮 Dopamine {dopamineConfig.enabled ? "ON" : "Split"}</span>
            </button>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-3 py-1.5 text-xs font-bold text-pink-200 shadow-sm transition hover:border-pink-500/50 hover:from-pink-500/30 hover:to-purple-500/30"
            >
              <Share2 className="h-3.5 w-3.5 text-pink-400" />
              <span>1-Click Publish</span>
            </button>


          </div>
        </div>
      </header>

      {/* Omni-Modal Creation Switcher */}
      <div className="border-b border-white/10 bg-black/40 px-5 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2">CREATION STUDIO:</span>
            {[
              { id: "video_reel", label: "🎬 AI Video Reel" },
              { id: "podcast", label: "🎙️ 2-Host Podcast" },
              { id: "carousel", label: "📊 Social Carousel & Deck" },
              { id: "song", label: "🎵 Song & Music" },
              { id: "story", label: "✍️ Story & Novel" },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setCreationMode(m.id as any)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${creationMode === m.id ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
              >
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <div className="hidden text-[11px] font-bold text-slate-500 md:block">
            {creationMode === "video_reel" && "Veo 3.1 Multi-Shot & Continuous Option C Studio"}
            {creationMode === "podcast" && "2-Speaker Conversational Neural Podcast Studio"}
            {creationMode === "carousel" && "Multi-Card Vector PDF & SVG Slide Deck Studio"}
            {creationMode === "song" && "Verse-Chorus Lyric & Beat Visualizer Engine"}
            {creationMode === "story" && "Episodic Chapters & Dramatis Personae Lore Studio"}
          </div>
        </div>
      </div>

      {creationMode === "video_reel" && (
        <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[380px_1fr_360px]">
        {/* LEFT COLUMN: Brief, Settings & Primary Generators */}
        <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Creative Controls</div>
            <span className="rounded-md border border-pink-300/30 bg-pink-300/10 px-2 py-0.5 text-[10px] font-black text-pink-200">Veo 3.1 Ready</span>
          </div>

          <label className="mt-5 block text-xs font-bold text-slate-400">IDEA OR TOPIC</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/25 p-3.5 text-sm leading-6 text-white outline-none focus:border-pink-300/40"
            placeholder="What is your video about?"
          />

          {/* Virtual Persona & Cloned Twin Selector */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">PRESENTER / VIRTUAL TWIN</span>
              <button
                type="button"
                onClick={() => setIsPersonaModalOpen(true)}
                className="text-[11px] font-black text-pink-300 transition hover:text-pink-200 hover:underline"
              >
                Change / Clone Face & Voice →
              </button>
            </div>
            <div
              onClick={() => setIsPersonaModalOpen(true)}
              className="mt-2.5 flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition hover:border-pink-500/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-lg">
                  {selectedPersona.faceImageUrl ? (
                    <img src={selectedPersona.faceImageUrl} alt={selectedPersona.name} className="h-full w-full object-cover" />
                  ) : (
                    selectedPersona.avatarEmoji || "👤"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-xs font-bold text-white">{selectedPersona.name}</div>
                    {selectedPersona.isCustomClone && (
                      <span className="rounded border border-pink-500/30 bg-pink-500/20 px-1 py-0.2 text-[8px] font-black uppercase text-pink-300">
                        Clone
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{selectedPersona.role}</div>
                </div>
              </div>
              <span className="rounded-lg border border-pink-500/20 bg-pink-500/10 px-2 py-1 text-[10px] font-bold text-pink-300">
                Vault
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Field label="Tone & Delivery" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty", "Dramatic & cinematic"]} />
            <Field label="Duration Target" value={duration} onChange={setDuration} options={DURATION_OPTIONS.map(d => `${d.value}`)} displayLabels={DURATION_OPTIONS.map(d => d.label)} />
            <Field label="Audio Language" value={language} onChange={setLanguage} options={LANGUAGES.map(l => l.code)} displayLabels={LANGUAGES.map(l => l.name)} />
            <Field label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECT_RATIOS.map(a => a.id)} displayLabels={ASPECT_RATIOS.map(a => a.name)} />
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 space-y-2.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Execution Engines</div>

            <ActionButton
              onClick={buildProduction}
              disabled={busy || !topic.trim()}
              active={operation === "plan"}
              icon={Sparkles}
              idle={production ? "Re-Plan Sequence & Script" : "Build Production Plan"}
              busyLabel="Building Plan…"
              primary
            />

            {canGenerateAll && (
              <ActionButton
                onClick={generateAllMp4Parallel}
                disabled={busy}
                active={operation === "all"}
                icon={Zap}
                idle={generatedShotCount ? `⚡ Turbo Parallel Render Remaining (${generatedShotCount}/${totalShotCount})` : "⚡ Turbo Parallel Render (All 17 Clips ~60s)"}
                busyLabel={generateAllBusyLabel}
                primary
              />
            )}

            {canGenerateNative && (
              <ActionButton
                onClick={() => runAction("generateNativeReel", "native")}
                disabled={busy}
                active={operation === "native"}
                icon={Sparkles}
                idle="🔄 Continuous Native Reel (Option C · Veo 3.1)"
                busyLabel="Generating continuous reel…"
              />
            )}

            {canGenerateAll && (
              <ActionButton
                onClick={generateAllMp4}
                disabled={busy}
                active={operation === "all"}
                icon={Film}
                idle="🪜 Step-by-Step Multi-Shot (1 clip at a time)"
                busyLabel={generateAllBusyLabel}
              />
            )}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setIsUgcModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
              >
                <span>🛍️ UGC Ad</span>
              </button>
              <button
                onClick={() => setIsDopamineModalOpen(true)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition ${
                  dopamineConfig.enabled
                    ? "border-pink-500 bg-pink-500/20 text-pink-200 font-black shadow-md shadow-pink-500/20"
                    : "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-pink-500/40"
                }`}
              >
                <span>🎮 Dopamine {dopamineConfig.enabled ? "ON" : "Split"}</span>
              </button>
              <button
                onClick={() => setIsMemeModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20"
              >
                <span>🎭 Auto-Meme</span>
              </button>
              <button
                onClick={() => setIsDubberModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20"
              >
                <span>🌍 Global Dub</span>
              </button>
              <button
                onClick={() => setIsArmorModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <span>🛡️ Safe Armor</span>
              </button>
              <button
                onClick={handleBeatAlign}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 py-2.5 text-xs font-bold text-teal-200 transition hover:bg-teal-500/20"
              >
                <span>🎵 Beat-Sync</span>
              </button>
            </div>


            {roughCut?.videoUrl && (
              <ResolutionDownloadDropdown
                videoUrl={roughCut.videoUrl}
                durationSec={roughCut.actualDurationSec}
              />
            )}

            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-purple-500/20 py-3.5 text-sm font-black text-pink-100 shadow-lg shadow-pink-500/10 transition hover:from-pink-500/30 hover:to-purple-500/30"
            >
              <Share2 className="h-4 w-4 text-pink-400" /> 🚀 1-Click Publish & Schedule
            </button>
          </div>

          {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </aside>

        {/* CENTER COLUMN: Scene & Settings Tabs */}
        <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]">
          <div className="flex flex-wrap items-center justify-between border-b border-white/5 p-3">
            <div className="flex flex-wrap items-center gap-1">
              {(["Scenes", "Script", "B-Roll", "SFX & Emojis", "Retention Heatmap", "Audio & Subtitles", "Format", "Cover"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {shots.length > 0 && activeTab === "Scenes" && (
              <button
                onClick={() => handleAddShotAfter(shots[shots.length - 1].id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-pink-300/25 bg-pink-300/[0.08] px-3 py-1.5 text-xs font-bold text-pink-200 hover:bg-pink-300/[0.15]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Scene
              </button>
            )}
          </div>

          <div className="p-5 sm:p-7">
            {/* TAB 1: SCENES & TIMELINE */}
            {activeTab === "Scenes" && (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">SCENE SEQUENCE & BEAT EDITOR</div>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                      {manifest ? `${shots.length} Scenes (${generatedShotCount}/${totalShotCount} Generated)` : "Build a plan to create shots"}
                    </h2>
                  </div>
                  {shots.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllShots}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                      >
                        {selectedShotIds.size === shots.length ? <CheckSquare className="h-3.5 w-3.5 text-pink-300" /> : <Square className="h-3.5 w-3.5" />}
                        {selectedShotIds.size === shots.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Phase 5: 1-Click Viral A/B Hook Switcher */}
                <div className="mt-4 rounded-2xl border border-pink-500/20 bg-pink-500/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-pink-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">
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
                              ? "border-pink-400 bg-pink-400/15 shadow-lg shadow-pink-500/10"
                              : "border-white/10 bg-black/30 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{variant.label}</span>
                            {isActive && <Check className="h-3.5 w-3.5 text-pink-300" />}
                          </div>
                          <div className="mt-1 inline-block rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-pink-300">
                            {variant.badge}
                          </div>
                          <p className="mt-2 text-[11px] leading-snug text-slate-300 line-clamp-3">
                            "{variant.scriptText}"
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-500">
                            <span>{variant.cameraMotion}</span>
                            <span className="font-bold text-pink-300">{isActive ? "ACTIVE HOOK" : "1-Click Swap"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedShotIds.size > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-pink-300/30 bg-pink-950/30 p-3 backdrop-blur-lg">
                    <span className="text-xs font-bold text-pink-200">
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

                {!manifest ? (
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center text-sm text-slate-400">
                    No production plan generated yet. Fill the brief on the left and click <strong>Build Production Plan</strong>.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
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
                              ? "border-pink-300/50 bg-pink-300/[0.06]"
                              : isChecked
                              ? "border-pink-400/30 bg-white/[0.04]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectShot(shot.id)}
                              className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-pink-400 focus:ring-0"
                            />
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-black text-pink-300">
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
                                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-pink-300"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Visual Intent</label>
                                    <textarea
                                      value={editVisualIntent}
                                      onChange={(e) => setEditVisualIntent(e.target.value)}
                                      rows={2}
                                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-pink-300"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveEdit}
                                      className="inline-flex items-center gap-1 rounded-lg bg-pink-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-pink-300"
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
                                      <span className="rounded-md border border-pink-500/30 bg-pink-500/15 px-2 py-0.5 font-black text-pink-300">
                                        🔍 {zoomKeyframes[i].label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Scene Action Buttons */}
                              {!isEditing && (
                                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2.5">
                                  {generated && (
                                    <button
                                      onClick={() => setSelectedShotId(shot.id)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-pink-300/30 bg-pink-300/10 px-2.5 py-1 text-[11px] font-bold text-pink-200 hover:bg-pink-300/20"
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

        {/* RIGHT COLUMN: Video Monitor & Production Truth (Top on mobile/tablet, Sticky Right on Desktop) */}
        <aside className="order-first lg:order-last h-fit lg:sticky lg:top-24">
          <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">
            <div>
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{selectedShot ? `Clip ${Math.max(1, (shots.findIndex(s => s.id === selectedShot.id) ?? 0) + 1)} Review` : roughCut?.videoUrl ? "Full Reel Master" : "Interactive Studio Monitor"}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {selectedShot ? `${selectedShot.editorialDurationSec.toFixed(1)}s · Veo Source` : `Veo 3.1 & Audio Engine · ${AUTO_ZOOM_PRESETS.find(p => p.id === zoomPreset)?.name}`}
                  </div>
                </div>
                {selectedShot && roughCut?.videoUrl && (
                  <button onClick={() => setSelectedShotId(null)} className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white">
                    FULL REEL
                  </button>
                )}
              </div>
              <DynamicZoomVideoPlayer
                videoUrl={previewVideoUrl || "/assets/video/veo_continuous_master.mp4"}
                keyframes={zoomKeyframes}
                brollItems={brollItems}
                kineticEmojis={kineticEmojis}
                subtitleText={shots[0]?.scriptText || topic}
                subtitleStyle={subtitleStyle}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Production Truth</div>
            <div className="mt-4 space-y-3 text-sm">
              <Status icon={Database} label="Manifest" value={production ? `Persisted r${production.revision}` : "Not created"} />
              <Status icon={Film} label="State" value={manifest?.status || "DRAFT"} />
              <Status icon={Globe} label="Language" value={LANGUAGES.find(l => l.code === language)?.name || language} />
              <Status icon={Captions} label="Subtitles" value={SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.name || subtitleStyle} />
              <Status icon={Video} label="Scene Clips" value={manifest ? `${generatedShotCount}/${totalShotCount}` : "Pending"} />
              <Status icon={Film} label="Combined MP4" value={roughCut ? `${roughCut.actualDurationSec.toFixed(2)}s` : "Pending"} />
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
        selectedPersonaId={selectedPersona.id}
        onSelectPersona={(p) => setSelectedPersona(p)}
      />

      <SocialPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        topic={topic}
        productionId={production?.id || "prod_active_demo"}
        videoUrl={roughCut?.videoUrl}
      />

      <DopamineSplitModal
        isOpen={isDopamineModalOpen}
        onClose={() => setIsDopamineModalOpen(false)}
        config={dopamineConfig}
        onUpdateConfig={(newConfig) => setDopamineConfig(newConfig)}
      />

      <UgcAdGeneratorModal
        isOpen={isUgcModalOpen}
        onClose={() => setIsUgcModalOpen(false)}
        onApplyCampaign={handleApplyUgcCampaign}
      />

      <RemixShareModal
        isOpen={isRemixModalOpen}
        onClose={() => setIsRemixModalOpen(false)}
        currentRecipe={currentRemixRecipe}
        onApplyTemplate={handleApplyRemixTemplate}
      />

      <RedditStoryModal
        isOpen={isRedditModalOpen}
        onClose={() => setIsRedditModalOpen(false)}
        onApplyStory={handleApplyRedditStory}
      />

      <AutoMemeModal
        isOpen={isMemeModalOpen}
        onClose={() => setIsMemeModalOpen(false)}
        detectedMemes={detectedMemes}
        onToggleMeme={handleToggleMeme}
        onAddCustomMeme={handleAddCustomMeme}
      />

      <GlobalDubberModal
        isOpen={isDubberModalOpen}
        onClose={() => setIsDubberModalOpen(false)}
        sourceScript={production?.manifest.masterScript || topic}
        speakerName={selectedPersona.name}
        onApplyDubbedAudio={handleApplyDubbedAudio}
      />

      <DemonetizationArmorModal
        isOpen={isArmorModalOpen}
        onClose={() => setIsArmorModalOpen(false)}
        scriptText={production?.manifest.masterScript || topic}
        onApplyCensoredScript={handleApplyCensoredScript}
      />

      <TrendRadarModal
        isOpen={isTrendRadarOpen}
        onClose={() => setIsTrendRadarOpen(false)}
        onLaunchInStudio={handleLaunchTrendInStudio}
      />

      <BookStudioModal
        isOpen={isBookStudioOpen}
        onClose={() => setIsBookStudioOpen(false)}
      />
    </div>
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
