"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Film,
  Play,
  Pause,
  Clock,
  Sparkles,
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
  AlertTriangle,
  ExternalLink,
  Video,
  Clapperboard,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Pencil,
  Trash2,
  Copy,
  Bookmark,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Folder,
  FolderInput,
  ArrowUpDown,
  Plus,
  Check,
  MoreVertical,
  Sliders,
  Filter,
  ArrowLeft
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
  isSaved?: boolean;
  isHidden?: boolean;
  isArchived?: boolean;
}

export interface LibraryReel {
  id: string;
  title: string;
  subtitle?: string;
  prompt?: string;
  status: "READY" | "DIFFUSING" | "ATTENTION_NEEDED" | "DRAFT" | string;
  durationSec: number;
  videoUrl?: string;
  posterUrl?: string;
  createdAt: string;
  genre?: string;
  tone?: string;
  aspectRatio?: string;
  audioClock?: string;
  folder?: string;
  isSaved?: boolean;
  isHidden?: boolean;
  isArchived?: boolean;
  priority?: number;
  shots: LibraryClip[];
}

// -------------------------------------------------------------
// NETFLIX-GRADE CONTENT & CLIP IDENTIFIERS
// -------------------------------------------------------------
export function getNetflixReelId(id: string): string {
  if (!id) return "ZYV-REEL";
  if (id.startsWith("studio1_")) {
    const clean = id.replace("studio1_", "").replace(/-/g, "").slice(0, 6).toUpperCase();
    return `ZYV-${clean}`;
  }
  if (id.startsWith("reel_")) {
    const clean = id.replace("reel_", "").replace(/_/g, "").slice(0, 8).toUpperCase();
    return `ZYV-${clean}`;
  }
  return `ZYV-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export function getNetflixClipId(reelId: string, clip: { order: number; id?: string }): string {
  const reelPart = getNetflixReelId(reelId);
  const clipOrder = String(clip.order || 1).padStart(2, "0");
  return `${reelPart}-C${clipOrder}`;
}

// -------------------------------------------------------------
// TELEMETRY-ACCURATE STATUS RESOLUTION
// -------------------------------------------------------------
export function computeReelStatus(
  manifestStatus?: string,
  shots: LibraryClip[] = [],
  roughCutUrl?: string | null,
  updatedAt?: string
): {
  status: "READY" | "ATTENTION_NEEDED" | "DIFFUSING" | "DRAFT";
  label: string;
  badgeClass: string;
  dotClass: string;
  failedShotNumber?: number;
} {
  const hasRoughCut = Boolean(roughCutUrl);
  const allShotsPassed = shots.length > 0 && shots.every(s => s.status === "PASSED" || s.status === "GENERATED");

  if (hasRoughCut || manifestStatus === "READY" || manifestStatus === "ROUGH_CUT_READY" || manifestStatus === "COMPLETED" || allShotsPassed) {
    return {
      status: "READY",
      label: "4K MASTER READY",
      badgeClass: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
      dotClass: "bg-emerald-400"
    };
  }

  // Check if any shot failed or manifest is in error/repairing
  const failedShotIndex = shots.findIndex(s => s.status === "FAILED");
  if (failedShotIndex !== -1 || manifestStatus === "FAILED" || manifestStatus === "REPAIRING") {
    const shotNum = failedShotIndex !== -1 ? (shots[failedShotIndex].order || failedShotIndex + 1) : undefined;
    return {
      status: "ATTENTION_NEEDED",
      label: shotNum ? `NEEDS ATTENTION • Shot ${shotNum} Failed` : "NEEDS ATTENTION",
      badgeClass: "bg-rose-500/15 border-rose-500/40 text-rose-300",
      dotClass: "bg-rose-400",
      failedShotNumber: shotNum
    };
  }

  // Check if actively diffusing
  const hasGeneratingShot = shots.some(s => s.status === "GENERATING" || s.status === "DIFFUSING" || s.status === "IN_DIFFUSION");
  const updateAgeMs = updatedAt ? (Date.now() - new Date(updatedAt).getTime()) : Infinity;
  const isRecentGeneration = manifestStatus === "VIDEO_GENERATING" && updateAgeMs < 20 * 60 * 1000;

  if (hasGeneratingShot || isRecentGeneration) {
    return {
      status: "DIFFUSING",
      label: "DIFFUSING IN CLOUD",
      badgeClass: "bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse",
      dotClass: "bg-amber-400"
    };
  }

  // Otherwise, it's a planned draft or idle production
  return {
    status: "DRAFT",
    label: `DRAFT • ${shots.length} Shots Planned`,
    badgeClass: "bg-zinc-800/80 border-zinc-700/50 text-zinc-300",
    dotClass: "bg-zinc-400"
  };
}

const DEFAULT_FOLDERS = ["All", "Favorites", "Dubai Series", "Commercials", "Social Shorts", "Archive"];

const CANONICAL_SHOWCASES: LibraryReel[] = [
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
    folder: "Favorites",
    isSaved: true,
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
        camera: "Cooke Anamorphic 40mm, low tracking push",
        lighting: "Muzzle flash chiaroscuro & coastal dusk",
        character: "Young Napoleon Bonaparte (26yo, Corsican features)",
        environment: "Toulon coastal redoubts and ramparts",
        transition: "cut-on-action"
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
        camera: "Zeiss Supreme 50mm, sweeping high-angle cathedral jib",
        lighting: "Candlelight cathedral glow with golden rim lighting",
        character: "Empress Joséphine & Napoleon in ermine imperial robes",
        environment: "Notre-Dame Cathedral interior, Paris 1804",
        transition: "match-cut"
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
        camera: "Leica Summilux-C 65mm, slow psychological push-in",
        lighting: "Hearth firelight contrasted with freezing blue blizzard exterior",
        character: "Countess Marie Walewska & Napoleon",
        environment: "Finckenstein Palace, East Prussia 1807",
        transition: "cut-on-action"
      },
      {
        id: "shot_04",
        order: 4,
        title: "Act IV: The Dynastic Sacrifice & King of Rome",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/coronation_hero.png",
        durationSec: 36.0,
        status: "PASSED",
        scriptText: "NAPOLEON: A son to carry France into the coming century. The throne is secured, yet the horizon darkens.",
        visualIntent: "Sunlight streaming through Tuileries Palace grand arched windows upon the cradle of Napoleon II.",
        camera: "Cooke S4 35mm, majestic wide tableau",
        lighting: "Golden morning sunbeams cutting through dust motes",
        character: "Emperor Napoleon & Marie-Louise of Austria",
        environment: "Tuileries Palace Throne Room, Paris 1811",
        transition: "dissolve"
      },
      {
        id: "shot_05",
        order: 5,
        title: "Act V: The Atlantic Wind & St. Helena Solitude",
        videoUrl: "/assets/video/napoleon_180s_master.mp4",
        posterUrl: "/assets/stills/napoleon_hero.png",
        durationSec: 36.1,
        status: "PASSED",
        scriptText: "NAPOLEON: France... the army... head of the army... Joséphine. Destinies never truly die in the vastness of memory.",
        visualIntent: "Gale-force ocean wind whipping through Napoleon's signature overcoat atop barren St. Helena volcanic sea-cliffs.",
        camera: "Angénieux Optimo 28-76mm, slow sweeping pull-back",
        lighting: "Overcast desolate Atlantic twilight storm",
        character: "Exiled Napoleon Bonaparte in classic grey frock coat",
        environment: "Longwood House volcanic cliffs, St. Helena 1821",
        transition: "fade-to-black"
      }
    ]
  }
];

export function MyReelsLibrary() {
  const [reels, setReels] = useState<LibraryReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "READY" | "DIFFUSING" | "ATTENTION" | "DRAFTS" | "SAVED" | "ARCHIVE" | "HIDDEN">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "duration" | "priority">("newest");
  
  // Expanded Reel IDs for multi-level hierarchy (Reel -> Clips)
  const [expandedReelIds, setExpandedReelIds] = useState<Record<string, boolean>>({});

  // Spotlight Cinema Modal Player (Supports Single Clip or Continuous Sequence Playlist)
  const [spotlightVideo, setSpotlightVideo] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    reelId?: string;
    clipId?: string;
    playlist?: Array<{
      url: string;
      title: string;
      subtitle?: string;
      order: number;
      durationSec: number;
    }>;
    currentIndex?: number;
  } | null>(null);

  // Modal Dialog States
  const [editingReel, setEditingReel] = useState<LibraryReel | null>(null);
  const [editingClip, setEditingClip] = useState<{ reelId: string; clip: LibraryClip } | null>(null);
  const [movingReel, setMovingReel] = useState<LibraryReel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "reel" | "clip"; reelId: string; clipId?: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle expand / collapse of lower-level clips
  const toggleExpand = (reelId: string) => {
    setExpandedReelIds(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  // Expand all or Collapse all
  const expandAll = () => {
    const all: Record<string, boolean> = {};
    reels.forEach(r => { all[r.id] = true; });
    setExpandedReelIds(all);
  };

  const collapseAll = () => {
    setExpandedReelIds({});
  };

  // Persistent deleted reel tracking (so deleted showcases and live reels NEVER resurrect)
  const getDeletedReelIds = (): Set<string> => {
    try {
      if (typeof window === "undefined") return new Set();
      const raw = localStorage.getItem("zyvoriq_deleted_reels");
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  };

  const addDeletedReelId = (id: string) => {
    try {
      if (typeof window === "undefined") return;
      const current = getDeletedReelIds();
      current.add(id);
      localStorage.setItem("zyvoriq_deleted_reels", JSON.stringify([...current]));
    } catch {}
  };

  const clearDeletedReelIds = () => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem("zyvoriq_deleted_reels");
    } catch {}
  };

  // Persistent Archive Tracking
  const getArchivedReelIds = (): Set<string> => {
    try {
      if (typeof window === "undefined") return new Set();
      const raw = localStorage.getItem("zyvoriq_archived_reels");
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  };

  const setArchivedReelId = (id: string, isArchived: boolean) => {
    try {
      if (typeof window === "undefined") return;
      const current = getArchivedReelIds();
      if (isArchived) current.add(id);
      else current.delete(id);
      localStorage.setItem("zyvoriq_archived_reels", JSON.stringify([...current]));
    } catch {}
  };

  // Persistent Hidden Reel Tracking
  const getHiddenReelIds = (): Set<string> => {
    try {
      if (typeof window === "undefined") return new Set();
      const raw = localStorage.getItem("zyvoriq_hidden_reels");
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  };

  const setHiddenReelId = (id: string, isHidden: boolean) => {
    try {
      if (typeof window === "undefined") return;
      const current = getHiddenReelIds();
      if (isHidden) current.add(id);
      else current.delete(id);
      localStorage.setItem("zyvoriq_hidden_reels", JSON.stringify([...current]));
    } catch {}
  };

  // Persistent Hidden Clip Tracking
  const getHiddenClipIds = (): Set<string> => {
    try {
      if (typeof window === "undefined") return new Set();
      const raw = localStorage.getItem("zyvoriq_hidden_clips");
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  };

  const setHiddenClipId = (reelId: string, clipId: string, isHidden: boolean) => {
    try {
      if (typeof window === "undefined") return;
      const current = getHiddenClipIds();
      const key = `${reelId}:${clipId}`;
      if (isHidden) current.add(key);
      else current.delete(key);
      localStorage.setItem("zyvoriq_hidden_clips", JSON.stringify([...current]));
    } catch {}
  };

  // Load local folder/metadata customizations from localStorage
  const loadLocalMetadata = () => {
    try {
      const savedFolders = localStorage.getItem("zyvoriq_user_folders");
      if (savedFolders) setFolders(JSON.parse(savedFolders));
    } catch {}
  };

  // Fetch productions from API
  const fetchProductions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reels/productions?limit=100", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch productions");
      const data = await res.json();

      let savedMeta: Record<string, { folder?: string; isSaved?: boolean; isArchived?: boolean; isHidden?: boolean; title?: string }> = {};
      try {
        const raw = localStorage.getItem("zyvoriq_reels_meta");
        if (raw) savedMeta = JSON.parse(raw);
      } catch {}

      if (data.success && Array.isArray(data.productions)) {
        const deletedIds = getDeletedReelIds();
        const archivedIds = getArchivedReelIds();
        const hiddenIds = getHiddenReelIds();
        const hiddenClipKeys = getHiddenClipIds();

        const liveReels: LibraryReel[] = data.productions
          .filter((p: any) => !deletedIds.has(p.id))
          .map((p: any) => {
            const m = p.manifest || {};
            const meta = savedMeta[p.id] || {};

            const shotsList: LibraryClip[] = (m.shots || []).map((s: any, index: number) => {
              const clipId = s.id || `shot_${index + 1}`;
              const isClipHidden = hiddenClipKeys.has(`${p.id}:${clipId}`);
              return {
                id: clipId,
                order: s.order || index + 1,
                title: `Shot ${String(s.order || index + 1).padStart(2, "0")}: ${s.visualIntent?.slice(0, 42) || s.scriptText?.slice(0, 36) || "Cinematic Beat"}`,
                videoUrl: s.asset?.videoUrl || null,
                posterUrl: s.asset?.posterUrl || s.continuityIn?.referenceFrameUrl || (index === 0 ? (m.canonicalCharacterAnchorUrl || m.anchorImageUrl || m.stillUrl || m.characters?.[0]?.canonicalReferenceImages?.[0]) : null) || null,
                durationSec: Number(s.editorialDurationSec || s.actualDurationSec || s.generationDurationSec || 5.5),
                status: s.status || "PLANNED",
                scriptText: s.scriptText || null,
                visualIntent: s.visualIntent || null,
                generationPrompt: s.generationPrompt || null,
                camera: s.continuityIn?.camera || "9:16 Vertical Framing",
                lighting: s.continuityIn?.lighting || "Cinematic Studio Lighting",
                character: s.continuityIn?.character || "Key Subject",
                environment: s.continuityIn?.environment || "Continuous Set",
                transition: s.transitionOut?.type || "cut-on-action",
                dependsOn: s.dependsOnShotIds || [],
                isSaved: meta.isSaved || false,
                isHidden: isClipHidden,
                isArchived: meta.isArchived || false
              };
            });

            const roughCutUrl = m.outputs?.narratedRoughCut?.videoUrl || m.outputs?.nativeReel?.videoUrl || m.outputs?.master?.videoUrl || null;
            const statusInfo = computeReelStatus(m.status, shotsList, roughCutUrl, p.updatedAt || m.updatedAt);
            const isReelArchived = archivedIds.has(p.id) || meta.isArchived || meta.folder === "Archive";
            const isReelHidden = hiddenIds.has(p.id) || meta.isHidden || false;

            return {
              id: p.id,
              title: meta.title || m.topic || (m.studio1?.projectTitle) || "Custom Reel Production",
              subtitle: m.dynamic || m.tone || `${shotsList.length}-shot continuous narrative sequence`,
              prompt: m.masterScript || m.topic || "",
              status: statusInfo.status,
              durationSec: Number(m.plannedDurationSec || m.audio?.actualDurationSec || (shotsList.length * 5.5)),
              videoUrl: roughCutUrl,
              posterUrl: shotsList[0]?.posterUrl || (m.stillUrl) || null,
              createdAt: p.createdAt || p.created_at || new Date().toISOString(),
              genre: m.creationIntent?.categoryLabel || m.genre || "Social Cinema",
              tone: m.tone || "Cinematic realism",
              aspectRatio: m.aspectRatio || "9:16 Vertical",
              audioClock: m.audio?.voice ? `Voice: ${m.audio.voice} • Normalized Audio` : "Normalized Audio",
              folder: meta.folder || (isReelArchived ? "Archive" : (p.id.includes("napoleon") ? "Favorites" : "All")),
              isSaved: meta.isSaved || false,
              isHidden: isReelHidden,
              isArchived: isReelArchived,
              priority: Number(p.priority || 0),
              shots: shotsList
            };
          });

        // Merge live reels with canonical showcases (prevent duplicate IDs and exclude user-deleted ones)
        const liveIds = new Set(liveReels.map(r => r.id));
        const merged = [
          ...liveReels,
          ...CANONICAL_SHOWCASES.filter(p => !liveIds.has(p.id) && !deletedIds.has(p.id)).map(s => {
            const isReelArchived = archivedIds.has(s.id);
            const isReelHidden = hiddenIds.has(s.id);
            return {
              ...s,
              isArchived: isReelArchived,
              isHidden: isReelHidden,
              folder: isReelArchived ? "Archive" : s.folder
            };
          })
        ];
        setReels(merged);

        // Auto-expand the first reel by default
        if (merged.length > 0 && Object.keys(expandedReelIds).length === 0) {
          setExpandedReelIds({ [merged[0].id]: true });
        }
      }
    } catch (err) {
      console.warn("Using showcase archive:", err);
      const deletedIds = getDeletedReelIds();
      const availableShowcases = CANONICAL_SHOWCASES.filter(p => !deletedIds.has(p.id));
      setReels(availableShowcases);
      if (availableShowcases.length > 0) {
        setExpandedReelIds({ [availableShowcases[0].id]: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalMetadata();
    fetchProductions();

    // Check for deep-link query parameter ?reel=[id]
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetReel = params.get("reel");
      if (targetReel) {
        setExpandedReelIds(prev => ({ ...prev, [targetReel]: true }));
      }
    }
  }, []);

  // Persist reel meta (folder, saved, custom title, archive, hidden)
  const saveReelMeta = (reelId: string, updates: Partial<{ folder: string; isSaved: boolean; isArchived: boolean; isHidden: boolean; title: string }>) => {
    try {
      const raw = localStorage.getItem("zyvoriq_reels_meta");
      const current = raw ? JSON.parse(raw) : {};
      current[reelId] = { ...(current[reelId] || {}), ...updates };
      localStorage.setItem("zyvoriq_reels_meta", JSON.stringify(current));
    } catch {}
  };

  // -------------------------------------------------------------
  // REEL-LEVEL ACTION HANDLERS
  // -------------------------------------------------------------

  // 1. Toggle Bookmark / Save
  const handleToggleSaveReel = (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    const newSaved = !reel.isSaved;
    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, isSaved: newSaved } : r));
    saveReelMeta(reel.id, { isSaved: newSaved });
    showToast(newSaved ? `★ Saved "${reel.title}" to Favorites` : `Removed "${reel.title}" from Saved`);
  };

  // 2. Clone Reel
  const handleCloneReel = async (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    try {
      const newId = `reel_clone_${Date.now().toString(36)}`;
      const clonedReel: LibraryReel = {
        ...reel,
        id: newId,
        title: `${reel.title} (Clone)`,
        createdAt: new Date().toISOString(),
        shots: reel.shots.map((s, idx) => ({ ...s, id: `shot_${idx + 1}` }))
      };
      setReels(prev => [clonedReel, ...prev]);
      setExpandedReelIds(prev => ({ ...prev, [newId]: true }));
      showToast(`📋 Cloned "${reel.title}" as new production draft!`);
    } catch (err: any) {
      showToast(`Failed to clone reel: ${err.message}`);
    }
  };

  // 3. Delete Reel
  const confirmDeleteReel = async () => {
    if (!deleteConfirm) return;
    const { reelId } = deleteConfirm;
    try {
      // 1. Immediately persist tombstone so the reel NEVER comes back on reload or showcase merge
      addDeletedReelId(reelId);

      // Clean up local metadata
      try {
        const rawMeta = localStorage.getItem("zyvoriq_reels_meta");
        if (rawMeta) {
          const metaObj = JSON.parse(rawMeta);
          delete metaObj[reelId];
          localStorage.setItem("zyvoriq_reels_meta", JSON.stringify(metaObj));
        }
      } catch {}

      // 2. Remove immediately from React UI state for instant response
      setReels(prev => prev.filter(r => r.id !== reelId));
      showToast(`🗑️ Production "${deleteConfirm.title}" deleted.`);

      // 3. Dispatch DELETE to backend to purge from DB and cascade cancel operations
      await fetch(`/api/reels/productions/${encodeURIComponent(reelId)}`, { method: "DELETE" }).catch(() => {});
    } catch {
      setReels(prev => prev.filter(r => r.id !== reelId));
      showToast(`Removed "${deleteConfirm.title}" from library.`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // 4. Download Reel MP4
  const handleDownloadReel = (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    if (!reel.videoUrl) {
      showToast(`⚠️ Reel is still diffusing. Rough cut not available for download yet.`);
      return;
    }
    const a = document.createElement("a");
    a.href = reel.videoUrl;
    a.download = `zyvoriq_${reel.id}_4k_master.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`⬇️ Initiating download: ${reel.title}`);
  };

  // 5. Move Reel to Folder
  const handleAssignFolder = (reelId: string, folderName: string) => {
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, folder: folderName } : r));
    saveReelMeta(reelId, { folder: folderName });
    setMovingReel(null);
    showToast(`📁 Moved reel to "${folderName}" folder.`);
  };

  // 6. Save Edited Reel Title / Meta
  const handleSaveReelEdit = (updatedTitle: string, updatedFolder: string) => {
    if (!editingReel) return;
    setReels(prev => prev.map(r => r.id === editingReel.id ? { ...r, title: updatedTitle, folder: updatedFolder } : r));
    saveReelMeta(editingReel.id, { title: updatedTitle, folder: updatedFolder });
    setEditingReel(null);
    showToast(`✓ Updated reel details for "${updatedTitle}".`);
  };

  // 7. Share Reel Link
  const handleShareReel = (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/my-reels?reel=${encodeURIComponent(reel.id)}`;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast(`🔗 Link copied to clipboard!`);
  };

  // 8. Toggle Archive Reel
  const handleToggleArchiveReel = (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    const newArchived = !reel.isArchived;
    setReels(prev => prev.map(r => r.id === reel.id ? { 
      ...r, 
      isArchived: newArchived, 
      folder: newArchived ? "Archive" : (r.folder === "Archive" ? "All" : r.folder) 
    } : r));
    setArchivedReelId(reel.id, newArchived);
    saveReelMeta(reel.id, { 
      isArchived: newArchived, 
      folder: newArchived ? "Archive" : (reel.folder === "Archive" ? "All" : reel.folder) 
    });
    showToast(newArchived ? `📦 Archived "${reel.title}". View in Archive tab.` : `📦 Restored "${reel.title}" to library.`);
  };

  // 9. Toggle Hide Reel
  const handleToggleHideReel = (e: React.MouseEvent, reel: LibraryReel) => {
    e.stopPropagation();
    const newHidden = !reel.isHidden;
    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, isHidden: newHidden } : r));
    setHiddenReelId(reel.id, newHidden);
    showToast(newHidden ? `👁️ Hidden "${reel.title}". View in Hidden tab.` : `👁️ Unhidden "${reel.title}". Restored to library.`);
  };

  // 10. Set Reel Priority (Normal = 0, High = 10, Urgent = 20)
  const handleSetReelPriority = async (e: React.MouseEvent, reel: LibraryReel, nextPriority: number) => {
    e.stopPropagation();
    const endpoint = reel.id.startsWith("studio1_")
      ? `/api/studio1/productions/${encodeURIComponent(reel.id)}`
      : `/api/reels/productions/${encodeURIComponent(reel.id)}`;

    // Optimistic local update
    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, priority: nextPriority } : r));
    const label = nextPriority >= 20 ? "Urgent (P20)" : nextPriority >= 10 ? "High (P10)" : "Normal (P0)";
    showToast(`⚡ Priority set to ${label} for "${reel.title}"`);

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPriority", priority: nextPriority }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(`⚠️ Failed to update priority: ${data.error || "Unknown error"}`);
        setReels(prev => prev.map(r => r.id === reel.id ? { ...r, priority: reel.priority || 0 } : r));
      }
    } catch (err: any) {
      showToast(`⚠️ Priority network error: ${err?.message || err}`);
      setReels(prev => prev.map(r => r.id === reel.id ? { ...r, priority: reel.priority || 0 } : r));
    }
  };

  // -------------------------------------------------------------
  // CLIP-LEVEL ACTION HANDLERS
  // -------------------------------------------------------------

  // 1. Delete Clip from Reel
  const confirmDeleteClip = async () => {
    if (!deleteConfirm || !deleteConfirm.clipId) return;
    const { reelId, clipId } = deleteConfirm;

    // Persist clip deletion to Studio1 backend if live production
    if (reelId.startsWith("studio1_")) {
      try {
        const res = await fetch(`/api/studio1/productions/${encodeURIComponent(reelId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deleteShot", shotId: clipId })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showToast(`⚠️ ${data.error || "Cannot delete clip"}`);
          setDeleteConfirm(null);
          return;
        }
      } catch (err: any) {
        showToast(`⚠️ Failed to delete clip from server: ${err.message}`);
        setDeleteConfirm(null);
        return;
      }
    }

    setReels(prev => prev.map(r => {
      if (r.id !== reelId) return r;
      const updatedShots = r.shots.filter(s => s.id !== clipId).map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...r, shots: updatedShots };
    }));
    setDeleteConfirm(null);
    showToast(`🗑️ Clip removed from reel sequence.`);
  };

  // 2. Clone Clip in Reel
  const handleCloneClip = (reelId: string, clip: LibraryClip) => {
    setReels(prev => prev.map(r => {
      if (r.id !== reelId) return r;
      const index = r.shots.findIndex(s => s.id === clip.id);
      const clonedClip: LibraryClip = {
        ...clip,
        id: `${clip.id}_copy_${Date.now().toString(36)}`,
        title: `${clip.title} (Take 2)`,
        order: clip.order + 1
      };
      const newShots = [...r.shots];
      newShots.splice(index + 1, 0, clonedClip);
      const renumbered = newShots.map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...r, shots: renumbered };
    }));
    showToast(`📋 Shot ${clip.order} duplicated into sequence!`);
  };

  // 3. Move Clip (Reorder Up / Down)
  const handleMoveClip = (reelId: string, clipId: string, direction: "up" | "down") => {
    setReels(prev => prev.map(r => {
      if (r.id !== reelId) return r;
      const index = r.shots.findIndex(s => s.id === clipId);
      if (index === -1) return r;
      if (direction === "up" && index === 0) return r;
      if (direction === "down" && index === r.shots.length - 1) return r;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const newShots = [...r.shots];
      const temp = newShots[index];
      newShots[index] = newShots[targetIndex];
      newShots[targetIndex] = temp;

      const renumbered = newShots.map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...r, shots: renumbered };
    }));
    showToast(`↕️ Shot reordered in sequence.`);
  };

  // 4. Download Clip MP4
  const handleDownloadClip = (clip: LibraryClip) => {
    if (!clip.videoUrl) {
      showToast(`⚠️ Video file for this shot is not generated yet.`);
      return;
    }
    const a = document.createElement("a");
    a.href = clip.videoUrl;
    a.download = `shot_${clip.order}_${clip.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`⬇️ Downloading Shot ${clip.order} MP4...`);
  };

  // 5. Save Clip to Vault
  const handleSaveClip = (clip: LibraryClip) => {
    showToast(`🔖 Saved Shot ${clip.order} to B-Roll / Clips Vault!`);
  };

  // 6. Save Clip Edit
  const handleSaveClipEdit = (scriptText: string, visualIntent: string, durationSec: number) => {
    if (!editingClip) return;
    const { reelId, clip } = editingClip;
    setReels(prev => prev.map(r => {
      if (r.id !== reelId) return r;
      const updatedShots = r.shots.map(s => s.id === clip.id ? { ...s, scriptText, visualIntent, durationSec } : s);
      return { ...r, shots: updatedShots };
    }));
    setEditingClip(null);
    showToast(`✓ Updated details for Shot ${clip.order}.`);
  };

  // 7. Toggle Hide Clip
  const handleToggleHideClip = (reelId: string, clipId: string) => {
    setReels(prev => prev.map(r => {
      if (r.id !== reelId) return r;
      const updatedShots = r.shots.map(s => {
        if (s.id !== clipId) return s;
        const newHidden = !s.isHidden;
        setHiddenClipId(reelId, clipId, newHidden);
        showToast(newHidden ? `👁️ Hidden Shot ${s.order}.` : `👁️ Unhidden Shot ${s.order}.`);
        return { ...s, isHidden: newHidden };
      });
      return { ...r, shots: updatedShots };
    }));
  };

  // 8. Archive Clip to Vault
  const handleArchiveClip = (reelId: string, clip: LibraryClip) => {
    showToast(`📦 Archived Shot ${clip.order} to Vault Archive.`);
  };

  // Filtered and sorted reels
  const filteredReels = useMemo(() => {
    return reels
      .filter(r => {
        // 1. Hidden filter handling:
        if (activeFilter === "HIDDEN") {
          return Boolean(r.isHidden);
        }
        // If not on HIDDEN tab, hidden reels are ALWAYS excluded:
        if (r.isHidden) return false;

        // 2. Archive filter handling:
        if (activeFilter === "ARCHIVE") {
          return Boolean(r.isArchived || r.folder === "Archive");
        }
        // If not on ARCHIVE tab and folder is not Archive, exclude archived reels:
        if ((r.isArchived || r.folder === "Archive") && selectedFolder !== "Archive") {
          return false;
        }

        // 3. Folder filter
        if (selectedFolder !== "All") {
          if (selectedFolder === "Favorites") {
            if (!r.isSaved) return false;
          } else if (r.folder !== selectedFolder) {
            return false;
          }
        }

        // 4. Status tab filter
        if (activeFilter === "READY") {
          if (!(r.status === "READY" || r.status === "ROUGH_CUT_READY" || r.videoUrl)) return false;
        } else if (activeFilter === "DIFFUSING") {
          if (r.status !== "DIFFUSING") return false;
        } else if (activeFilter === "ATTENTION") {
          if (r.status !== "ATTENTION_NEEDED") return false;
        } else if (activeFilter === "DRAFTS") {
          if (r.status !== "DRAFT") return false;
        } else if (activeFilter === "SAVED") {
          if (!r.isSaved) return false;
        }

        // 5. Search query filter (matches Netflix ID, title, prompt, or dialogue)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = getNetflixReelId(r.id).toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchPrompt = (r.prompt || "").toLowerCase().includes(q);
          const matchClip = r.shots.some(s => 
            getNetflixClipId(r.id, s).toLowerCase().includes(q) ||
            (s.scriptText || "").toLowerCase().includes(q) || 
            (s.visualIntent || "").toLowerCase().includes(q)
          );
          if (!matchId && !matchTitle && !matchPrompt && !matchClip) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const pA = a.priority || 0;
          const pB = b.priority || 0;
          if (pB !== pA) return pB - pA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "duration") {
          return b.durationSec - a.durationSec;
        }
        return 0;
      });
  }, [reels, selectedFolder, activeFilter, searchQuery, sortBy]);

  const unarchivedUnhiddenReels = reels.filter(r => !r.isHidden && !r.isArchived && r.folder !== "Archive");
  const readyCount = unarchivedUnhiddenReels.filter(r => r.status === "READY" || r.videoUrl).length;
  const diffusingCount = unarchivedUnhiddenReels.filter(r => r.status === "DIFFUSING").length;
  const attentionCount = unarchivedUnhiddenReels.filter(r => r.status === "ATTENTION_NEEDED").length;
  const draftsCount = unarchivedUnhiddenReels.filter(r => r.status === "DRAFT").length;
  const savedCount = unarchivedUnhiddenReels.filter(r => r.isSaved).length;
  const archivedCount = reels.filter(r => (r.isArchived || r.folder === "Archive") && !r.isHidden).length;
  const hiddenCount = reels.filter(r => r.isHidden).length;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-teal-500/30 selection:text-teal-100">
      
      {/* ============================================================ */}
      {/* 1. STICKY TOP FULL-WIDTH NAVBAR                               */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#07090E]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1760px] items-center justify-between px-4 py-3.5 sm:px-6 md:px-10 lg:px-12">
          
          {/* Left Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-base shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                Z
              </div>
              <span className="text-lg font-black tracking-tight text-white hidden sm:inline">
                Zyvoriq
              </span>
            </Link>

            <span className="text-zinc-600 text-sm hidden sm:inline">/</span>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-mono font-semibold text-violet-300">
                <Film className="h-3.5 w-3.5 text-violet-400" />
                <span>My Reels & Saved Clips</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 hidden md:inline">
                ({reels.length} total productions)
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={fetchProductions}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer min-h-[44px]"
              title="Refresh library"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-2 text-xs font-mono font-bold text-emerald-300 transition shadow-[0_0_15px_rgba(16,185,129,0.25)] min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Reel</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN BODY (Zero-gutter, spacious desktop layout)           */}
      {/* ============================================================ */}
      <main className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 md:px-10 lg:px-12 py-8 space-y-6">

        {/* Page Heading & Synopsis */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                My Reels Archive
              </h1>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono text-emerald-400">
                Hierarchical Vault
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Explore your complete collection of generated reels at the highest grouping level. Click any reel tile to expand its constituent clips, edit individual screenplay beats, or download 24fps master cuts.
            </p>
          </div>

          {/* Quick Expand / Collapse Controls */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={expandAll}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 px-3 py-1.5 text-zinc-300 transition cursor-pointer min-h-[40px]"
            >
              Expand All Clips
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 px-3 py-1.5 text-zinc-300 transition cursor-pointer min-h-[40px]"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. FILTERS, SEARCH & FOLDERS BAR                             */}
        {/* ============================================================ */}
        <div className="space-y-3.5 bg-[#0B0F17] border border-zinc-800/80 rounded-2xl p-4 shadow-lg">
          
          {/* Folder Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1 shrink-0 pl-1 mr-1">
              <Folder className="h-3.5 w-3.5 text-zinc-400" /> Folders:
            </span>
            {folders.map(folder => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`rounded-full px-3.5 py-1 text-xs font-mono font-medium shrink-0 transition cursor-pointer min-h-[36px] flex items-center gap-1.5 ${
                  selectedFolder === folder
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                }`}
              >
                {folder === "Favorites" ? "⭐ Favorites" : folder}
              </button>
            ))}
          </div>

          {/* Search, Status Tabs & Sorting Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 ${
                  activeFilter === "ALL" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All ({unarchivedUnhiddenReels.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("READY")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "READY" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Ready ({readyCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("DIFFUSING")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "DIFFUSING" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Clock className={`h-3.5 w-3.5 text-amber-400 ${diffusingCount > 0 ? "animate-spin" : ""}`} />
                Diffusing ({diffusingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ATTENTION")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "ATTENTION"
                    ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                    : attentionCount > 0
                    ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                Attention ({attentionCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("DRAFTS")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "DRAFTS" ? "bg-zinc-700/60 text-zinc-200 font-bold border border-zinc-600" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-zinc-400" />
                Drafts ({draftsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("SAVED")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "SAVED" ? "bg-violet-500/20 text-violet-300 font-bold border border-violet-500/40" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Bookmark className="h-3.5 w-3.5 text-violet-400" />
                Saved ({savedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ARCHIVE")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "ARCHIVE" ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Archive className="h-3.5 w-3.5 text-sky-400" />
                Archive ({archivedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("HIDDEN")}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeFilter === "HIDDEN" ? "bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <EyeOff className="h-3.5 w-3.5 text-orange-400" />
                Hidden ({hiddenCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search reels by title, prompt, or spoken dialogue..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-zinc-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none min-h-[44px]"
              >
                <option value="priority">Highest Priority</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. REELS LIST (Hierarchical Grouping as Tiles)               */}
        {/* ============================================================ */}
        {loading && reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-800/80 rounded-2xl bg-[#0B0F17] space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-sm font-mono text-zinc-400">Loading your reels library...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-800/80 rounded-2xl bg-[#0B0F17] space-y-3 text-center p-6">
            <Film className="h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-bold text-zinc-300">No reels found</h3>
            <p className="text-xs text-zinc-500 max-w-md">
              {searchQuery ? `No matches for "${searchQuery}". Try changing search terms or filter.` : "No reels in this folder yet. Create your first reel in the Studio!"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-500/30 transition min-h-[44px] flex items-center"
              >
                Open Studio
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearDeletedReelIds();
                  showToast("✨ Restored demo showcases.");
                  fetchProductions();
                }}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white transition min-h-[44px] flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Restore Demo Showcases</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReels.map(reel => {
              const isExpanded = Boolean(expandedReelIds[reel.id]);
              const isReady = reel.status === "READY" || reel.status === "ROUGH_CUT_READY" || Boolean(reel.videoUrl);

              return (
                <div
                  key={reel.id}
                  className={`rounded-2xl border transition-all duration-200 bg-[#0B0F17] overflow-hidden shadow-xl ${
                    isExpanded ? "border-emerald-500/50 shadow-emerald-950/20" : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {/* -------------------------------------------------------- */}
                  {/* REEL TILE (Highest Level of Grouping)                    */}
                  {/* -------------------------------------------------------- */}
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      
                      {/* Left: Poster + Core Metadata */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        
                        {/* Video / Poster Thumbnail Preview */}
                        <div 
                          onClick={() => {
                            if (reel.videoUrl) {
                              setSpotlightVideo({ url: reel.videoUrl, title: reel.title, subtitle: reel.subtitle, reelId: reel.id });
                            } else {
                              const readyClips = reel.shots.filter(s => Boolean(s.videoUrl));
                              if (readyClips.length > 0) {
                                const playlist = readyClips.map(c => ({
                                  url: c.videoUrl!,
                                  title: `${reel.title} — Shot ${String(c.order).padStart(2, "0")}: ${c.title}`,
                                  subtitle: c.scriptText ? `"${c.scriptText}"` : c.visualIntent || undefined,
                                  order: c.order,
                                  durationSec: c.durationSec
                                }));
                                setSpotlightVideo({
                                  url: playlist[0].url,
                                  title: playlist[0].title,
                                  subtitle: playlist[0].subtitle,
                                  reelId: reel.id,
                                  clipId: readyClips[0].id,
                                  playlist,
                                  currentIndex: 0
                                });
                              }
                            }
                          }}
                          className="relative w-full sm:w-44 lg:w-48 aspect-video sm:aspect-[9/16] rounded-xl overflow-hidden bg-black/80 border border-zinc-800 shrink-0 group cursor-pointer shadow-md"
                        >
                          {reel.posterUrl ? (
                            <img
                              src={reel.posterUrl}
                              alt={reel.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : reel.videoUrl ? (
                            <video
                              src={reel.videoUrl}
                              preload="metadata"
                              playsInline
                              muted
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                              <Clapperboard className="h-8 w-8 text-zinc-600" />
                            </div>
                          )}

                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-black shadow-lg group-hover:scale-110 transition">
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-800">
                            {reel.durationSec.toFixed(1)}s
                          </div>

                          {/* Aspect Ratio Badge */}
                          <div className="absolute top-2 left-2 rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 border border-zinc-800">
                            {reel.aspectRatio || "9:16"}
                          </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="space-y-2 flex-1 min-w-0">
                          
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            {/* Netflix-Grade Reel ID Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nid = getNetflixReelId(reel.id);
                                navigator.clipboard.writeText(nid).catch(() => {});
                                showToast(`✓ Copied ID: ${nid}`);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/80 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer shadow-sm tracking-wider"
                              title="Click to copy Netflix Reel ID"
                            >
                              <span className="text-zinc-500 font-normal">ID:</span>
                              <span>{getNetflixReelId(reel.id)}</span>
                              <Copy className="h-2.5 w-2.5 text-zinc-400 ml-0.5" />
                            </button>

                            {/* Multi-Tier Accurate Status Badge */}
                            {reel.status === "READY" || isReady ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border bg-emerald-500/15 border-emerald-500/40 text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                4K MASTER READY
                              </span>
                            ) : reel.status === "ATTENTION_NEEDED" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border bg-rose-500/15 border-rose-500/40 text-rose-300">
                                <AlertTriangle className="h-3 w-3 text-rose-400" />
                                {(() => {
                                  const failed = reel.shots.find(s => s.status === "FAILED");
                                  return failed ? `NEEDS ATTENTION • Shot ${failed.order} Failed` : "NEEDS ATTENTION";
                                })()}
                              </span>
                            ) : reel.status === "DIFFUSING" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                DIFFUSING IN CLOUD
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border bg-zinc-800/80 border-zinc-700/60 text-zinc-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                DRAFT • {reel.shots.length} Shots Planned
                              </span>
                            )}

                            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300 border border-zinc-700/50 flex items-center gap-1">
                              <Layers className="h-3 w-3 text-teal-400" />
                              {reel.shots.length} Clips
                            </span>

                            {/* Interactive Priority Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = Number(reel.priority || 0);
                                const next = current === 0 ? 10 : current === 10 ? 20 : 0;
                                handleSetReelPriority(e, reel, next);
                              }}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono font-bold transition cursor-pointer border shadow-sm ${
                                (reel.priority || 0) >= 20
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-500/30"
                                  : (reel.priority || 0) >= 10
                                  ? "bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30"
                                  : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/70"
                              }`}
                              title="Generation Priority: Normal (P0) → High (P10) → Urgent (P20). Click to cycle."
                            >
                              <Sparkles className={`h-3 w-3 ${
                                (reel.priority || 0) >= 20 ? "text-amber-400 fill-amber-400" : (reel.priority || 0) >= 10 ? "text-sky-400" : "text-zinc-500"
                              }`} />
                              <span>
                                {(reel.priority || 0) >= 20 ? "URGENT (P20)" : (reel.priority || 0) >= 10 ? "HIGH (P10)" : "NORMAL (P0)"}
                              </span>
                            </button>

                            {reel.isArchived && (
                              <span className="rounded bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-[11px] text-sky-300 flex items-center gap-1">
                                <Archive className="h-3 w-3" />
                                Archived
                              </span>
                            )}

                            {reel.isHidden && (
                              <span className="rounded bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 text-[11px] text-orange-300 flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Hidden
                              </span>
                            )}

                            {reel.folder && (
                              <span className="rounded bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[11px] text-violet-300 flex items-center gap-1">
                                <Folder className="h-3 w-3" />
                                {reel.folder}
                              </span>
                            )}

                            <span className="text-zinc-500 text-[11px]">
                              {new Date(reel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Reel Title */}
                          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-emerald-300 transition line-clamp-1">
                            {reel.title}
                          </h2>

                          {/* Subtitle / Dynamic */}
                          {reel.subtitle && (
                            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                              {reel.subtitle}
                            </p>
                          )}

                          {/* Audio & Director Spec */}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
                            <span className="text-emerald-400/90 font-medium">
                              ✓ {reel.audioClock || "Normalized Audio"}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-400">
                              24fps Locked
                            </span>
                            <span>•</span>
                            <span className="text-amber-400/90 font-bold">
                              ID: {getNetflixReelId(reel.id)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: ACTION ICONS FOR REELS */}
                      <div className="flex flex-wrap items-center lg:flex-col lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                        
                        {/* Main Action Icons Toolbar */}
                        <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
                          
                          {/* 1. Edit Reel */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingReel(reel); }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Edit Reel Title & Metadata"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* 2. Clone Reel */}
                          <button
                            type="button"
                            onClick={(e) => handleCloneReel(e, reel)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-teal-300 hover:bg-zinc-800 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Clone Reel as New Draft"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          {/* 3. Bookmark / Save Reel */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSaveReel(e, reel)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] ${
                              reel.isSaved ? "text-amber-400 bg-amber-500/15" : "text-zinc-300 hover:text-amber-400 hover:bg-zinc-800"
                            }`}
                            title={reel.isSaved ? "Remove from Favorites" : "Save to Favorites"}
                          >
                            <Bookmark className={`h-4 w-4 ${reel.isSaved ? "fill-current" : ""}`} />
                          </button>

                          {/* 4. Archive Reel */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleArchiveReel(e, reel)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] ${
                              reel.isArchived
                                ? "text-sky-400 bg-sky-500/15"
                                : "text-zinc-300 hover:text-sky-300 hover:bg-zinc-800"
                            }`}
                            title={reel.isArchived ? "Restore from Archive" : "Archive Reel"}
                          >
                            {reel.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </button>

                          {/* 5. Hide Reel */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleHideReel(e, reel)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] ${
                              reel.isHidden
                                ? "text-orange-400 bg-orange-500/15"
                                : "text-zinc-300 hover:text-orange-300 hover:bg-zinc-800"
                            }`}
                            title={reel.isHidden ? "Unhide Reel" : "Hide Reel"}
                          >
                            {reel.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>

                          {/* 6. Move Reel to Folder */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setMovingReel(reel); }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-violet-300 hover:bg-zinc-800 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Move to Folder / Collection"
                          >
                            <FolderInput className="h-4 w-4" />
                          </button>

                          {/* 7. Download Reel MP4 */}
                          <button
                            type="button"
                            onClick={(e) => handleDownloadReel(e, reel)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-emerald-300 hover:bg-zinc-800 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Download 4K Master MP4"
                          >
                            <Download className="h-4 w-4" />
                          </button>

                          {/* 8. Share Reel */}
                          <button
                            type="button"
                            onClick={(e) => handleShareReel(e, reel)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Copy Shareable Link"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>

                          {/* 9. Delete Reel */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ type: "reel", reelId: reel.id, title: reel.title });
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition cursor-pointer min-h-[36px] min-w-[36px]"
                            title="Delete Reel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Open in Studio Link */}
                        <Link
                          href={`/?reel=${encodeURIComponent(reel.id)}&phase=6`}
                          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-300 transition py-1"
                        >
                          <span>Open in Studio</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* -------------------------------------------------------- */}
                    {/* EXPAND TRIGGER BAR (Click to reveal constituent clips)   */}
                    {/* -------------------------------------------------------- */}
                    <div 
                      onClick={() => toggleExpand(reel.id)}
                      className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between cursor-pointer group hover:bg-zinc-900/40 -mx-4 -mb-4 px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5 lg:-mx-6 lg:-mb-6 lg:px-6 transition"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 group-hover:text-emerald-300 transition">
                        <Clapperboard className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-semibold">
                          {isExpanded ? "Hide Clips Breakdown" : `Expand ${reel.shots.length} Constituent Clips & Cinematic Beats`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition">
                        <span>{isExpanded ? "Collapse" : "Expand"}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* EXPANDED LOWER LEVEL: CONSTITUENT CLIPS / SHOTS          */}
                  {/* -------------------------------------------------------- */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/80 bg-[#07090E]/80 p-4 sm:p-5 lg:p-6 space-y-4">
                      
                      {/* Clips Header Info */}
                      {(() => {
                        const completedClips = reel.shots.filter(s => Boolean(s.videoUrl));
                        return (
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 border-b border-zinc-800/70 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-emerald-400 font-bold">EDL Sequence:</span>
                              <span>{reel.shots.length} Continuous Shots</span>
                              <span>•</span>
                              <span>Biometric Facial Continuity: Locked (Verified Continuity)</span>
                              {completedClips.length > 0 && (
                                <span className="text-emerald-300 font-semibold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px]">
                                  {completedClips.length}/{reel.shots.length} Generated
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {completedClips.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const playlist = completedClips.map((c) => ({
                                      url: c.videoUrl!,
                                      title: `${reel.title} — Shot ${String(c.order).padStart(2, "0")}: ${c.title}`,
                                      subtitle: c.scriptText ? `"${c.scriptText}"` : c.visualIntent || undefined,
                                      order: c.order,
                                      durationSec: c.durationSec
                                    }));
                                    setSpotlightVideo({
                                      url: playlist[0].url,
                                      title: playlist[0].title,
                                      subtitle: playlist[0].subtitle,
                                      reelId: reel.id,
                                      clipId: completedClips[0].id,
                                      playlist,
                                      currentIndex: 0
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-mono font-bold transition shadow-lg hover:scale-105 cursor-pointer"
                                  title="Play all completed shots back-to-back as a continuous sequence"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                  <span>Play In-Progress Reel ({completedClips.length} Cuts)</span>
                                </button>
                              )}
                              <div className="text-zinc-500">
                                Total Timeline: {reel.durationSec.toFixed(1)}s
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Constituent Clips Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {reel.shots.map((clip) => {
                          const hasClipVideo = Boolean(clip.videoUrl);

                          return (
                            <div
                              key={clip.id}
                              className={`rounded-xl border p-3.5 space-y-3 shadow-md transition ${
                                clip.isHidden
                                  ? "border-dashed border-orange-500/50 bg-zinc-950/80 opacity-60"
                                  : "border-zinc-800/90 bg-[#0E131F] hover:border-zinc-700"
                              }`}
                            >
                              {/* Clip Preview Box */}
                              <div className="relative aspect-[9/16] sm:aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800 group">
                                {clip.posterUrl ? (
                                  <img
                                    src={clip.posterUrl}
                                    alt={clip.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  />
                                ) : hasClipVideo ? (
                                  <video
                                    src={clip.videoUrl!}
                                    preload="metadata"
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200 pointer-events-none"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 gap-1">
                                    <Video className="h-6 w-6" />
                                    <span className="text-[10px] font-mono">Shot {clip.order}</span>
                                  </div>
                                )}

                                {/* Play Clip Button */}
                                {hasClipVideo && (
                                  <button
                                    type="button"
                                    onClick={() => setSpotlightVideo({
                                      url: clip.videoUrl!,
                                      title: `Shot ${clip.order}: ${clip.title}`,
                                      subtitle: clip.scriptText || clip.visualIntent,
                                      reelId: reel.id,
                                      clipId: clip.id
                                    })}
                                    className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition cursor-pointer"
                                  >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-black shadow-md group-hover:scale-110 transition">
                                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                    </div>
                                  </button>
                                )}

                                {/* Shot Order Tag & Netflix Clip ID */}
                                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 flex-wrap">
                                  <div className="rounded bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-zinc-800">
                                    Shot {String(clip.order).padStart(2, "0")}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const cid = getNetflixClipId(reel.id, clip);
                                      navigator.clipboard.writeText(cid).catch(() => {});
                                      showToast(`✓ Copied Clip ID: ${cid}`);
                                    }}
                                    className="inline-flex items-center gap-1 rounded bg-black/80 hover:bg-zinc-800 border border-zinc-700/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer shadow-sm"
                                    title="Click to copy Netflix Clip ID"
                                  >
                                    <span>{getNetflixClipId(reel.id, clip)}</span>
                                    <Copy className="h-2 w-2 text-zinc-400" />
                                  </button>

                                  {clip.isHidden && (
                                    <span className="rounded bg-orange-500/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-black uppercase">
                                      Hidden
                                    </span>
                                  )}
                                </div>

                                {/* Duration */}
                                <div className="absolute bottom-2 right-2 rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-800">
                                  {clip.durationSec.toFixed(1)}s
                                </div>
                              </div>

                              {/* Clip Details */}
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-zinc-300 font-bold truncate">
                                    {clip.title}
                                  </span>
                                  <span className={`shrink-0 ml-1 font-semibold ${
                                    clip.status === "FAILED"
                                      ? "text-rose-400"
                                      : clip.status === "GENERATING" || clip.status === "DIFFUSING"
                                      ? "text-amber-400 animate-pulse"
                                      : clip.status === "PASSED" || clip.status === "GENERATED"
                                      ? "text-emerald-400"
                                      : "text-zinc-500"
                                  }`}>
                                    {clip.status}
                                  </span>
                                </div>

                                {/* Script Dialogue */}
                                {clip.scriptText && (
                                  <p className="text-[11px] text-zinc-300 bg-black/40 p-2 rounded border border-zinc-800/80 font-mono italic line-clamp-3">
                                    "{clip.scriptText}"
                                  </p>
                                )}

                                {/* Visual Intent / Camera Direction */}
                                {clip.visualIntent && (
                                  <p className="text-[10px] text-zinc-400 line-clamp-2">
                                    <strong className="text-zinc-300 font-mono">Intent:</strong> {clip.visualIntent}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-1 text-[9px] font-mono text-zinc-400 pt-1">
                                  {clip.camera && (
                                    <span className="bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                      {clip.camera}
                                    </span>
                                  )}
                                  {clip.lighting && (
                                    <span className="bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                      {clip.lighting}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* -------------------------------------------------------- */}
                              {/* ACTION ICONS FOR CLIPS                                   */}
                              {/* -------------------------------------------------------- */}
                              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-zinc-400">
                                
                                {/* Move Up / Down sequence */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveClip(reel.id, clip.id, "up")}
                                    disabled={clip.order === 1}
                                    className="p-1 rounded hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    title="Move earlier in sequence"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveClip(reel.id, clip.id, "down")}
                                    disabled={clip.order === reel.shots.length}
                                    className="p-1 rounded hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                    title="Move later in sequence"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Clip Action Buttons */}
                                <div className="flex items-center gap-1">
                                  {/* Edit Clip */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingClip({ reelId: reel.id, clip })}
                                    className="p-1.5 rounded hover:bg-zinc-800 hover:text-white transition"
                                    title="Edit Clip Beat"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Clone Clip */}
                                  <button
                                    type="button"
                                    onClick={() => handleCloneClip(reel.id, clip)}
                                    className="p-1.5 rounded hover:bg-zinc-800 hover:text-teal-300 transition"
                                    title="Duplicate Shot"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Hide / Unhide Clip */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleHideClip(reel.id, clip.id)}
                                    className={`p-1.5 rounded transition ${
                                      clip.isHidden
                                        ? "text-orange-400 bg-orange-500/15"
                                        : "hover:bg-zinc-800 hover:text-orange-300"
                                    }`}
                                    title={clip.isHidden ? "Unhide Shot" : "Hide Shot"}
                                  >
                                    {clip.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                  </button>

                                  {/* Archive Clip to Vault */}
                                  <button
                                    type="button"
                                    onClick={() => handleArchiveClip(reel.id, clip)}
                                    className="p-1.5 rounded hover:bg-zinc-800 hover:text-sky-300 transition"
                                    title="Archive Shot to Vault"
                                  >
                                    <Archive className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Save Clip to Vault Favorites */}
                                  <button
                                    type="button"
                                    onClick={() => handleSaveClip(clip)}
                                    className="p-1.5 rounded hover:bg-zinc-800 hover:text-amber-400 transition"
                                    title="Save to B-Roll Vault"
                                  >
                                    <Bookmark className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Download Clip */}
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadClip(clip)}
                                    className="p-1.5 rounded hover:bg-zinc-800 hover:text-emerald-300 transition"
                                    title="Download Clip MP4"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Delete Clip */}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirm({
                                      type: "clip",
                                      reelId: reel.id,
                                      clipId: clip.id,
                                      title: `Shot ${clip.order} of "${reel.title}"`
                                    })}
                                    className="p-1.5 rounded hover:bg-rose-500/20 text-rose-400 transition"
                                    title="Remove Shot"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 5. MODALS & POPUPS                                            */}
      {/* ============================================================ */}

      {/* A. Cinema Player Modal (Continuous Sequence Player) */}
      {spotlightVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-2xl bg-[#0B0F17] border border-zinc-800 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{spotlightVideo.title}</h3>
                  {spotlightVideo.playlist && typeof spotlightVideo.currentIndex === "number" && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
                      Cut {spotlightVideo.currentIndex + 1} of {spotlightVideo.playlist.length}
                    </span>
                  )}
                </div>
                {spotlightVideo.subtitle && <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{spotlightVideo.subtitle}</p>}
              </div>

              {/* Controls: Prev/Next Cut & Close */}
              <div className="flex items-center gap-2 shrink-0">
                {spotlightVideo.playlist && typeof spotlightVideo.currentIndex === "number" && (
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button
                      type="button"
                      disabled={spotlightVideo.currentIndex <= 0}
                      onClick={() => {
                        const prevIdx = (spotlightVideo.currentIndex || 0) - 1;
                        if (prevIdx >= 0 && spotlightVideo.playlist) {
                          const item = spotlightVideo.playlist[prevIdx];
                          setSpotlightVideo({
                            ...spotlightVideo,
                            url: item.url,
                            title: item.title,
                            subtitle: item.subtitle,
                            currentIndex: prevIdx
                          });
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition cursor-pointer disabled:cursor-not-allowed"
                      title="Previous Cut"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={spotlightVideo.currentIndex >= spotlightVideo.playlist.length - 1}
                      onClick={() => {
                        const nextIdx = (spotlightVideo.currentIndex || 0) + 1;
                        if (spotlightVideo.playlist && nextIdx < spotlightVideo.playlist.length) {
                          const item = spotlightVideo.playlist[nextIdx];
                          setSpotlightVideo({
                            ...spotlightVideo,
                            url: item.url,
                            title: item.title,
                            subtitle: item.subtitle,
                            currentIndex: nextIdx
                          });
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition cursor-pointer disabled:cursor-not-allowed"
                      title="Next Cut"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSpotlightVideo(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video sm:aspect-[16/9] max-h-[70vh] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <video
                key={spotlightVideo.url}
                src={spotlightVideo.url}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
                onEnded={() => {
                  if (spotlightVideo.playlist && typeof spotlightVideo.currentIndex === "number") {
                    const nextIdx = spotlightVideo.currentIndex + 1;
                    if (nextIdx < spotlightVideo.playlist.length) {
                      const nextItem = spotlightVideo.playlist[nextIdx];
                      setSpotlightVideo({
                        ...spotlightVideo,
                        url: nextItem.url,
                        title: nextItem.title,
                        subtitle: nextItem.subtitle,
                        currentIndex: nextIdx
                      });
                    }
                  }
                }}
              />
            </div>

            {/* Interactive Segmented Timeline Scrubber */}
            {spotlightVideo.playlist && spotlightVideo.playlist.length > 1 && typeof spotlightVideo.currentIndex === "number" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 w-full">
                  {spotlightVideo.playlist.map((item, idx) => {
                    const isCurrent = idx === spotlightVideo.currentIndex;
                    const isPast = idx < (spotlightVideo.currentIndex || 0);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSpotlightVideo({
                            ...spotlightVideo,
                            url: item.url,
                            title: item.title,
                            subtitle: item.subtitle,
                            currentIndex: idx
                          });
                        }}
                        className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-400 ring-2 ring-emerald-400/50 scale-y-125"
                            : isPast
                            ? "bg-emerald-600/80 hover:bg-emerald-500"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                        title={`Jump to Shot ${item.order}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Continuous Reel Mode (Auto-Advancing)
                  </span>
                  {spotlightVideo.currentIndex < spotlightVideo.playlist.length - 1 && (
                    <span className="truncate max-w-[280px] sm:max-w-md text-zinc-400">
                      Up Next: Shot {spotlightVideo.playlist[spotlightVideo.currentIndex + 1].order}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-800">
              <span>Google Omni Continuous Master Preview</span>
              <a
                href={spotlightVideo.url}
                download
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <Download className="h-3.5 w-3.5" /> Download Current Cut
              </a>
            </div>
          </div>
        </div>
      )}

      {/* B. Edit Reel Modal */}
      {editingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E131F] border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-emerald-400" /> Edit Reel Details
              </h3>
              <button onClick={() => setEditingReel(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveReelEdit(form.title.value, form.folder.value);
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div className="space-y-1.5">
                <label className="text-zinc-400">Reel Title</label>
                <input
                  name="title"
                  defaultValue={editingReel.title}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400">Folder / Collection</label>
                <select
                  name="folder"
                  defaultValue={editingReel.folder || "All"}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                >
                  {folders.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingReel(null)}
                  className="rounded-xl px-4 py-2 text-zinc-400 hover:text-white min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2 font-bold text-black hover:bg-emerald-400 transition min-h-[44px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Move Reel Modal */}
      {movingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0E131F] border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderInput className="h-4 w-4 text-violet-400" /> Move Reel to Folder
              </h3>
              <button onClick={() => setMovingReel(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Select destination folder for <strong className="text-white">"{movingReel.title}"</strong>:
            </p>

            <div className="space-y-1.5">
              {folders.map(folder => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => handleAssignFolder(movingReel.id, folder)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-mono transition cursor-pointer min-h-[44px] ${
                    movingReel.folder === folder
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-violet-400" />
                    {folder}
                  </span>
                  {movingReel.folder === folder && <Check className="h-4 w-4 text-violet-400" />}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setMovingReel(null)}
                className="rounded-xl px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. Edit Clip Modal */}
      {editingClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E131F] border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-teal-400" /> Edit Shot {editingClip.clip.order}
              </h3>
              <button onClick={() => setEditingClip(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                handleSaveClipEdit(
                  form.scriptText.value,
                  form.visualIntent.value,
                  parseFloat(form.durationSec.value) || 5.5
                );
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div className="space-y-1.5">
                <label className="text-zinc-400">Spoken Dialogue / Script Beat</label>
                <textarea
                  name="scriptText"
                  defaultValue={editingClip.clip.scriptText || ""}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-teal-500 focus:outline-none text-base md:text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400">Visual Intent & Director Notes</label>
                <textarea
                  name="visualIntent"
                  defaultValue={editingClip.clip.visualIntent || ""}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-teal-500 focus:outline-none text-base md:text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400">Duration (seconds)</label>
                <input
                  name="durationSec"
                  type="number"
                  step="0.1"
                  defaultValue={editingClip.clip.durationSec}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-zinc-100 focus:border-teal-500 focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingClip(null)}
                  className="rounded-xl px-4 py-2 text-zinc-400 hover:text-white min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 px-5 py-2 font-bold text-black hover:bg-teal-400 transition min-h-[44px]"
                >
                  Update Shot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0E131F] border border-rose-900/60 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-rose-300 font-mono">"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-permanently-btn"
                onClick={() => {
                  if (deleteConfirm.type === "reel") confirmDeleteReel();
                  else confirmDeleteClip();
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-mono font-bold text-white transition min-h-[44px]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-zinc-900 border border-emerald-500/60 px-4 py-3 text-xs font-mono text-emerald-300 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
