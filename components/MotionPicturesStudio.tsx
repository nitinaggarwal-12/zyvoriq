"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Film,
  Sparkles,
  Layers,
  Sliders,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Scissors,
  Cpu,
  Glasses,
  Sparkle,
  Upload,
  Search,
  FolderInput,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import ReelTimelineEditor, { SavedVersionItem } from "@/components/ReelTimelineEditor";

export interface EditableReelItem {
  id: string;
  title: string;
  genre: string;
  videoUrl: string;
  durationSec: number;
  shots: Array<{ id: string; title: string; videoUrl: string; durationSec: number }>;
  versions: SavedVersionItem[];
}

export const DEFAULT_EDITABLE_REELS: EditableReelItem[] = [
  {
    id: "yt_spain_pool_party_master",
    title: "Mediterranean Coastal Sunlit Dance (4-Shot Master)",
    genre: "Coastal Synth-Pop • 9:16 Biometric Lock Canvas",
    videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/master_hybrid.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Coastal Terrace Spin (0–6s)", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_1.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Sunlit Step Choreography (6–12s)", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_2.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Sea Breeze Turn & Flare (12–18s)", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_3.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Golden Horizon Climax (18–24s)", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_4.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/renders/yt/yt_spain_pool_party_omni_hybrid/master_hybrid.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "mv_01_summer_asia_master",
    title: "Neon Horizon: Tokyo Skyline Rooftop (4-Shot Master)",
    genre: "J-Pop / Electronic Pop • 9:16 Social Canvas",
    videoUrl: "/assets/video/mv_01_summer_asia_master.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Shibuya Rooftop Horizon", videoUrl: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Neon Core Choreography", videoUrl: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Tokyo Tower Panorama", videoUrl: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Strobe Finale", videoUrl: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "yt_chandigarh_club_master",
    title: "Chandigarh Club Night: Neon Dhol & Bass (4-Shot Master)",
    genre: "Bhangra / Punjabi Pop • 9:16 Social Canvas",
    videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/master_hybrid.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • VIP Lounge Opening", videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/shot_1.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Strobe Dancefloor Drop", videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/shot_2.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Synchronized Hook Step", videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/shot_3.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Confetti Climax", videoUrl: "/renders/yt/yt_chandigarh_club_omni_hybrid/shot_4.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/renders/yt/yt_chandigarh_club_omni_hybrid/master_hybrid.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "yt_punjabi_stage_master",
    title: "Punjabi Mela Stage: Royal Folk Performance",
    genre: "Desi Folk / Stage Live • 9:16 Social Canvas",
    videoUrl: "/renders/yt/yt_punjabi_stage_omni_hybrid/master_hybrid.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Golden Stage Entrance", videoUrl: "/renders/yt/yt_punjabi_stage_omni_hybrid/shot_1.mp4", durationSec: 8.0 },
      { id: "shot_2", title: "Shot 2 • High-Energy Boliyan", videoUrl: "/renders/yt/yt_punjabi_stage_omni_hybrid/shot_2.mp4", durationSec: 8.0 },
      { id: "shot_3", title: "Shot 3 • Royal Finale", videoUrl: "/renders/yt/yt_punjabi_stage_omni_hybrid/shot_3.mp4", durationSec: 8.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/renders/yt/yt_punjabi_stage_omni_hybrid/master_hybrid.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "napoleon_180s_master",
    title: "Waterloo 1815: The Fog of War (Theatrical Scope)",
    genre: "Historical Epic • 2.39:1 Scope",
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    durationSec: 30.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Heavy Cavalry Charge Formations", videoUrl: "/assets/video/napoleon_30s_cut.mp4", durationSec: 7.5 },
      { id: "shot_2", title: "Shot 2 • Volumetric Cannon & Gunpowder Smoke", videoUrl: "/assets/video/napoleon_preview.mp4", durationSec: 7.5 },
      { id: "shot_3", title: "Shot 3 • The Emperor's Command Tent Close-Up", videoUrl: "/assets/video/napoleon_30s_cut.mp4", durationSec: 7.5 },
      { id: "shot_4", title: "Shot 4 • Muddy Rainfield Decisive Turn", videoUrl: "/assets/video/napoleon_preview.mp4", durationSec: 7.5 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/napoleon_180s_master.mp4", durationSec: 30.0 },
    ],
  },
  {
    id: "coronation_30s_cut",
    title: "Imperial Coronation: Hall of Mirrors",
    genre: "Historical Drama • 2.39:1 Scope",
    videoUrl: "/assets/video/coronation_30s_cut.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Royal Procession Down the Nave", videoUrl: "/assets/video/coronation_preview.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Anointing of the Golden Diadem", videoUrl: "/assets/video/coronation_30s_cut.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • The Grand Banquet & Candlelit Gold", videoUrl: "/assets/video/coronation_preview.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Hall of Mirrors Velvet Waltz", videoUrl: "/assets/video/coronation_30s_cut.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/coronation_30s_cut.mp4", durationSec: 24.0 },
    ],
  },
];

interface VFXLayer {
  id: string;
  number: number;
  name: string;
  tagline: string;
  role: string;
  technicalMechanism: string;
  reRenderCost: string;
  activeByDefault: boolean;
}

const MODULAR_VFX_STACK: VFXLayer[] = [
  {
    id: "layer-1-base",
    number: 1,
    name: "Generative Master Base Layer",
    tagline: "High-Entropy Photoreal Canvas",
    role: "Provides master lighting, skin pores, atmospheric depth, and actor performance.",
    technicalMechanism: "Google Veo 3.1 4K Theatrical Anamorphic 2.39:1 generation with locked 24fps 180° shutter blur.",
    reRenderCost: "Generated Once (Fixed Anchor Plate)",
    activeByDefault: true,
  },
  {
    id: "layer-2-geometry",
    number: 2,
    name: "Geometric Computer Vision Decomposition",
    tagline: "SAM-2 Mattes + DensePose 3D UVs + Depth Normals",
    role: "Tears the 2D video into mathematically editable 3D surfaces and isolated alpha mattes.",
    technicalMechanism: "SAM-2 temporal object tracking + DensePose IUV body coordinate mapping + Depth-Anything-V2 surface normal extraction.",
    reRenderCost: "0% Video Re-render (Local CV extraction in ~40ms/frame)",
    activeByDefault: true,
  },
  {
    id: "layer-3-surgical",
    number: 3,
    name: "Modular Surgical Edits",
    tagline: "Beards, Hair, Wardrobe, Tattoos & Vocal Visemes",
    role: "Injects or restyles character attributes without mutating the underlying performance.",
    technicalMechanism: "FLUX / SDXL Latent Inpainting guided strictly by DensePose UV boundaries and phoneme acoustic clocks.",
    reRenderCost: "0% Video Re-render (Isolated 512x512 patch inpainting)",
    activeByDefault: true,
  },
  {
    id: "layer-4-temporal",
    number: 4,
    name: "Temporal Optical Flow Stabilization",
    tagline: "RAFT Motion Vector Lock (Anti-Swimming)",
    role: "Eliminates flickering, swimming, and edge jitter across 5-10 second shots.",
    technicalMechanism: "RAFT bidirectional optical flow calculation; projects edits forward and backward along motion vectors with occlusion masking.",
    reRenderCost: "0% Video Re-render (Deterministic motion warp)",
    activeByDefault: true,
  },
  {
    id: "layer-5-lighting",
    number: 5,
    name: "Contact & Lighting Reconstruction",
    tagline: "Ambient Occlusion, Fresnel Rim Light & SSS Bleed",
    role: "Ensures newly added elements (beards, clothing, decals) cast physical contact shadows onto skin.",
    technicalMechanism: "Estimated normal map dot-product lighting passes + high-pass specular shadow catchers.",
    reRenderCost: "0% Video Re-render (Compositor shader operation)",
    activeByDefault: true,
  },
  {
    id: "layer-6-composite",
    number: 6,
    name: "Theatrical Master Composite & Acoustics",
    tagline: "Cooke Anamorphic Flare, 35mm Grain & -24.0 LUFS Score",
    role: "Binds all layers into a unified theatrical master matching Hollywood cinema exhibition standards.",
    technicalMechanism: "ACEScc 1.3 color space transform + anamorphic lens distortion + 35mm photochemical grain emulation + EBU R128 audio mastering.",
    reRenderCost: "0% Video Re-render (GPU hardware encode)",
    activeByDefault: true,
  },
];

export default function MotionPicturesStudio() {
  const [activeVfxView, setActiveVfxView] = useState<
    "composite" | "matte" | "densepose" | "depth" | "inpaint"
  >("composite");
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    "layer-1-base": true,
    "layer-2-geometry": true,
    "layer-3-surgical": true,
    "layer-4-temporal": true,
    "layer-5-lighting": true,
    "layer-6-composite": true,
  });

  // Project Director Console States
  const [projectTitle, setProjectTitle] = useState("CHRONOS: ASHES OF OLYMPUS");
  const [logline, setLogline] = useState(
    "In a fractured geothermal caldera, a cybernetically enhanced hoplite confronts an immortal titan amidst billowing volcanic ash."
  );
  const [aspectRatio, setAspectRatio] = useState("2.39:1 Scope");
  const [lensPackage, setLensPackage] = useState("Cooke Anamorphic /i T2.3");
  const [colorGrade, setColorGrade] = useState("ACEScc 1.3 / Kodak 2383 Print");
  const [audioStandard, setAudioStandard] = useState("-24.0 LUFS EBU R128 Symphonic");
  const [beardToggle, setBeardToggle] = useState(true);
  const [wardrobeRetexture, setWardrobeRetexture] = useState(true);
  const [temporalStabilizer, setTemporalStabilizer] = useState(true);
  const [anamorphicBokeh, setAnamorphicBokeh] = useState(true);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Post-Generation Component Master Studio State
  const [editableReels, setEditableReels] = useState<EditableReelItem[]>(DEFAULT_EDITABLE_REELS);
  const [selectedReelId, setSelectedReelId] = useState<string>("yt_spain_pool_party_master");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<"library" | "url" | "upload">("library");
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [importedReelIdInput, setImportedReelIdInput] = useState("");
  const [importedVideoUrlInput, setImportedVideoUrlInput] = useState("");
  const [importedReelTitleInput, setImportedReelTitleInput] = useState("");
  const [importedNumShots, setImportedNumShots] = useState(4);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [allAvailableProductions, setAllAvailableProductions] = useState<any[]>([]);

  // Load existing productions from both /api/reels/productions and /api/yt/productions
  useEffect(() => {
    async function loadProductions() {
      try {
        const [reelsRes, ytRes] = await Promise.all([
          fetch("/api/reels/productions?limit=100").catch(() => null),
          fetch("/api/yt/productions?limit=100").catch(() => null),
        ]);
        const reelsData = reelsRes ? await reelsRes.json().catch(() => []) : [];
        const ytData = ytRes ? await ytRes.json().catch(() => []) : [];
        const combined = [
          ...(Array.isArray(reelsData) ? reelsData : reelsData?.productions || []),
          ...(Array.isArray(ytData) ? ytData : ytData?.productions || []),
        ];
        if (combined.length > 0) {
          setAllAvailableProductions(combined);
          const mapped: EditableReelItem[] = combined
            .filter((p: any) => {
              if (!p || !p.id) return false;
              if (p.id.startsWith("studio1_") && !p.qa?.passed && p.status !== "READY") return false;
              if (p.qa && p.qa.passed === false) return false;
              const hasVideo = Boolean(p.videoUrl || p.manifest?.outputVideoUrl);
              const title = p.topic || p.title;
              if (!title || title.startsWith("Production #studio1_") || title.startsWith("Production #")) return false;
              return hasVideo;
            })
            .map((p: any) => {
              const masterUrl = p.videoUrl || p.manifest?.outputVideoUrl;
              const shots = (p.manifest?.shots || []).map((s: any, idx: number) => ({
                id: s.id || `shot_${idx + 1}`,
                title: s.title || `Shot #${idx + 1}`,
                videoUrl: s.videoUrl || s.url || masterUrl,
                durationSec: Number(s.durationSec || 6.0),
              }));
              return {
                id: p.id,
                title: p.topic || p.title,
                genre: p.genre || "Music Video • Social Canvas",
                videoUrl: masterUrl,
                durationSec: Number(p.manifest?.durationSec || 24.0),
                shots: shots.length > 0 ? shots : [0, 1, 2, 3].map((i) => ({
                  id: `shot_${i + 1}`,
                  title: `Shot #${i + 1} (${i * 6}s–${(i + 1) * 6}s)`,
                  videoUrl: masterUrl,
                  durationSec: 6.0,
                })),
                versions: p.manifest?.versions || [
                  { versionNumber: 1, label: "v1 • Master Cut", url: masterUrl, durationSec: 24.0 },
                ],
              };
            });
          if (mapped.length > 0) {
            setEditableReels((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const newItems = mapped.filter((m) => !existingIds.has(m.id));
              return [...prev, ...newItems];
            });
          }
        }
      } catch (e) {
        // Fallback to default presets
      }
    }
    loadProductions();
  }, []);

  // Support deep linking via URL query params (?reelId=... or ?id=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetReelId = params.get("reelId") || params.get("id");
      if (targetReelId) {
        setSelectedReelId(targetReelId);
        const elem = document.getElementById("post-generation-studio");
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [editableReels.length]);

  const activeSelectedReel =
    editableReels.find((r) => r.id === selectedReelId) || editableReels[0];

  const handleImportProduction = (prod: any) => {
    const masterUrl =
      prod.videoUrl ||
      prod.manifest?.outputVideoUrl ||
      prod.manifest?.roughCutUrl ||
      "/assets/video/mv_01_summer_asia_master.mp4";
    const rawShots = prod.manifest?.shots || [];
    const shots =
      rawShots.length > 0
        ? rawShots.map((s: any, idx: number) => ({
            id: s.id || `shot_${idx + 1}`,
            title: s.title || `Shot #${idx + 1}`,
            videoUrl: s.videoUrl || s.url || masterUrl,
            durationSec: Number(s.durationSec || 6.0),
          }))
        : [0, 1, 2, 3].map((i: number) => ({
            id: `shot_${i + 1}`,
            title: `Shot #${i + 1} (${i * 6}s–${(i + 1) * 6}s)`,
            videoUrl: masterUrl,
            durationSec: 6.0,
          }));

    const newReel: EditableReelItem = {
      id: prod.id,
      title: prod.topic || prod.title || `Production #${prod.id.slice(0, 8)}`,
      genre: prod.genre || "Music Video • Social Canvas",
      videoUrl: masterUrl,
      durationSec: Number(prod.manifest?.durationSec || 24.0),
      shots,
      versions: prod.manifest?.versions || [
        { versionNumber: 1, label: "v1 • Master Cut", url: masterUrl, durationSec: 24.0 },
      ],
    };

    setEditableReels((prev) => [newReel, ...prev.filter((r) => r.id !== newReel.id)]);
    setSelectedReelId(newReel.id);
    setIsImportModalOpen(false);
  };

  const handleImportByUrlOrId = async () => {
    setImportLoading(true);
    setImportError(null);
    try {
      if (importedReelIdInput.trim()) {
        const id = importedReelIdInput.trim();
        const found = allAvailableProductions.find((p) => p.id === id);
        if (found) {
          handleImportProduction(found);
          return;
        }
        const res = await fetch(`/api/reels/productions/${encodeURIComponent(id)}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.id) {
            handleImportProduction(data);
            return;
          }
        }
      }

      if (importedVideoUrlInput.trim()) {
        const url = importedVideoUrlInput.trim();
        const cutsCount = Math.max(1, Math.min(8, importedNumShots || 4));
        const estimatedDuration = 24.0;
        const sliceDuration = estimatedDuration / cutsCount;
        const newReel: EditableReelItem = {
          id: `custom_reel_${Date.now()}`,
          title: importedReelTitleInput.trim() || `Custom Master (${url.split("/").pop() || "Video"})`,
          genre: "Custom Theatrical Cut • Multi-Track NLE",
          videoUrl: url,
          durationSec: estimatedDuration,
          shots: Array.from({ length: cutsCount }).map((_, idx) => ({
            id: `shot_${idx + 1}`,
            title: `Shot #${idx + 1} (${(idx * sliceDuration).toFixed(1)}s–${((idx + 1) * sliceDuration).toFixed(1)}s)`,
            videoUrl: url,
            durationSec: sliceDuration,
          })),
          versions: [
            { versionNumber: 1, label: "v1 • Original Imported Cut", url, durationSec: estimatedDuration },
          ],
        };
        setEditableReels((prev) => [newReel, ...prev]);
        setSelectedReelId(newReel.id);
        setIsImportModalOpen(false);
        setImportedReelIdInput("");
        setImportedVideoUrlInput("");
        setImportedReelTitleInput("");
        return;
      }

      throw new Error("Please enter a Reel ID or a valid Video URL.");
    } catch (err: any) {
      setImportError(err?.message || "Failed to import reel.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleUploadLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    const cutsCount = 4;
    const sliceDur = 6.0;
    const newReel: EditableReelItem = {
      id: `local_upload_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, "") || "Uploaded Video Master",
      genre: "Uploaded Media • Master Sequence",
      videoUrl: blobUrl,
      durationSec: 24.0,
      shots: Array.from({ length: cutsCount }).map((_, idx) => ({
        id: `shot_${idx + 1}`,
        title: `Shot #${idx + 1} (Cut ${idx + 1})`,
        videoUrl: blobUrl,
        durationSec: sliceDur,
      })),
      versions: [
        { versionNumber: 1, label: "v1 • Original Local File", url: blobUrl, durationSec: 24.0 },
      ],
    };
    setEditableReels((prev) => [newReel, ...prev]);
    setSelectedReelId(newReel.id);
    setIsImportModalOpen(false);
  };

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* ── COMPACT WORKSTATION CONTROL BAR (DROPDOWN-FIRST, ZERO FLUFF) ── */}
      <section id="post-generation-studio" className="w-full py-4 border-b border-white/10 bg-[#0B111E] sticky top-0 z-40 shadow-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  NLE Timeline &amp; Multi-Stem Workstation
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                  ZERO RE-RENDER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Sub-frame deterministic trim • 0.25x–4.0x speed • Tri-stem acoustic DSP • 35mm LUTs
              </p>
            </div>
          </div>

          {/* Active Reel Dropdown & Import Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase whitespace-nowrap">
                Active Reel:
              </label>
              <select
                value={activeSelectedReel.id}
                onChange={(e) => {
                  if (e.target.value === "__IMPORT_NEW__") {
                    setIsImportModalOpen(true);
                  } else {
                    setSelectedReelId(e.target.value);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-teal-500/40 text-xs font-bold text-white focus:outline-none focus:border-teal-400 cursor-pointer min-w-[260px] sm:min-w-[340px] shadow-inner"
              >
                {editableReels.map((reel) => (
                  <option key={reel.id} value={reel.id}>
                    {reel.title} ({reel.shots.length} shots • {reel.durationSec.toFixed(1)}s)
                  </option>
                ))}
                <option value="__IMPORT_NEW__">➕ Import / Load Another Reel...</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>+ Import Reel</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN NLE TIMELINE & MULTI-STEM WORKSTATION ── */}
      <section className="w-full py-6 bg-[#06080E]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          <ReelTimelineEditor
            key={activeSelectedReel.id}
            reelId={activeSelectedReel.id}
            reelTitle={activeSelectedReel.title}
            masterVideoUrl={activeSelectedReel.videoUrl}
            initialShots={activeSelectedReel.shots}
            initialVersions={activeSelectedReel.versions}
            onVersionSaved={(newVer, allVers) => {
              setEditableReels((prev) =>
                prev.map((r) =>
                  r.id === activeSelectedReel.id
                    ? { ...r, versions: allVers, videoUrl: newVer.url }
                    : r
                )
              );
            }}
          />
        </div>
      </section>

      {/* ── IMPORT ANY REEL MODAL (LIBRARY, REEL ID, VIDEO URL, OR UPLOAD) ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0B111E] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <FolderInput className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Import Any Reel into Motion Pictures Studio</h3>
                  <p className="text-xs text-slate-400">
                    Load any previously generated production, external MP4 URL, or upload a video file for component editing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setImportTab("library")}
                className={`pb-3 px-3 text-xs font-bold font-mono transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  importTab === "library"
                    ? "border-teal-500 text-teal-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. Select from My Reels &amp; Archive ({allAvailableProductions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setImportTab("url")}
                className={`pb-3 px-3 text-xs font-bold font-mono transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  importTab === "url"
                    ? "border-teal-500 text-teal-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>2. Import by Reel ID or MP4 URL</span>
              </button>
              <button
                type="button"
                onClick={() => setImportTab("upload")}
                className={`pb-3 px-3 text-xs font-bold font-mono transition cursor-pointer border-b-2 flex items-center gap-2 ${
                  importTab === "upload"
                    ? "border-teal-500 text-teal-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>3. Upload Local Video File</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {/* TAB 1: LIBRARY BROWSER */}
              {importTab === "library" && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={librarySearchQuery}
                      onChange={(e) => setLibrarySearchQuery(e.target.value)}
                      placeholder="Search reels by title, topic, or Reel ID..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {allAvailableProductions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <Layers className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">No user-generated productions found in database yet.</p>
                      <p className="text-[11px] text-slate-600">
                        You can import via Reel ID, MP4 URL, or upload a video file.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allAvailableProductions
                        .filter((p) => {
                          if (!librarySearchQuery) return true;
                          const q = librarySearchQuery.toLowerCase();
                          return (
                            (p.id || "").toLowerCase().includes(q) ||
                            (p.topic || "").toLowerCase().includes(q) ||
                            (p.title || "").toLowerCase().includes(q) ||
                            (p.genre || "").toLowerCase().includes(q)
                          );
                        })
                        .map((p) => {
                          const numShots = p.manifest?.shots?.length || 4;
                          return (
                            <div
                              key={p.id}
                              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition flex flex-col justify-between space-y-3 group"
                            >
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                  <span className="text-teal-400 font-semibold">{p.genre || "Music Video"}</span>
                                  <span className="text-slate-500">{numShots} shots</span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                                  {p.topic || p.title || `Production #${p.id.slice(0, 8)}`}
                                </h4>
                                <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                                  ID: {p.id}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                <span className="text-[11px] font-mono text-slate-400">
                                  Duration: {Number(p.manifest?.durationSec || 24.0).toFixed(1)}s
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleImportProduction(p)}
                                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <span>Load into Studio</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: IMPORT BY REEL ID OR MP4 URL */}
              {importTab === "url" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-teal-400">
                      Option A: Paste Existing Reel ID
                    </label>
                    <input
                      type="text"
                      value={importedReelIdInput}
                      onChange={(e) => setImportedReelIdInput(e.target.value)}
                      placeholder="e.g. yt_a8d79bfc-20a4-4bc6-85f9-495b858c5603 or studio1_..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Fetches the production manifest, Lyria stems, character locks, and all constituent shots.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">
                      Option B: Paste Video URL or Local Path
                    </label>
                    <input
                      type="text"
                      value={importedVideoUrlInput}
                      onChange={(e) => setImportedVideoUrlInput(e.target.value)}
                      placeholder="e.g. /assets/video/mv_01_summer_asia_master.mp4 or https://..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Custom Title (Optional):</label>
                        <input
                          type="text"
                          value={importedReelTitleInput}
                          onChange={(e) => setImportedReelTitleInput(e.target.value)}
                          placeholder="e.g. Custom Theatrical Master Cut"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Constituent Shot Slices:</label>
                        <select
                          value={importedNumShots}
                          onChange={(e) => setImportedNumShots(parseInt(e.target.value, 10))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value={2}>2 Shots (Two 12s cuts)</option>
                          <option value={3}>3 Shots (Three 8s cuts)</option>
                          <option value={4}>4 Shots (Four 6s cuts - Standard)</option>
                          <option value={6}>6 Shots (Six 4s cuts - Rapid)</option>
                          <option value={8}>8 Shots (Eight 3s cuts - High Octane)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {importError && (
                    <div className="p-3 rounded-xl bg-red-950/70 border border-red-700 text-red-200 text-xs">
                      {importError}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={importLoading || (!importedReelIdInput.trim() && !importedVideoUrlInput.trim())}
                      onClick={handleImportByUrlOrId}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-950/50 cursor-pointer"
                    >
                      {importLoading ? "Fetching Reel..." : "Import into Studio →"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: UPLOAD LOCAL FILE */}
              {importTab === "upload" && (
                <div className="space-y-4">
                  <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-teal-500/60 bg-slate-950/60 text-center flex flex-col items-center justify-center space-y-3 transition">
                    <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Select Any MP4 / MOV Video from Computer</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Instant browser blob ingest with zero network latency. Auto-partitions into 4 editable constituent shots.
                      </p>
                    </div>
                    <label className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-teal-950/50 transition">
                      <span>Browse Video File...</span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleUploadLocalFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
