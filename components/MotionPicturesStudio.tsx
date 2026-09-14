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
    title: "Spanish Pool Party: Sunlit Reggaeton (4-Shot Master)",
    genre: "Reggaeton / Latin Pop • 9:16 Social Canvas",
    videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/master_hybrid.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Poolside Golden Sun", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_1.mp4", durationSec: 6.3 },
      { id: "shot_2", title: "Shot 2 • Sunlit Choreography & Splash", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_2.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Turquoise Water Reflections", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_3.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Sunset Fiesta Climax", videoUrl: "/renders/yt/yt_spain_pool_party_omni_hybrid/shot_4.mp4", durationSec: 5.8 },
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
    id: "neotokyo_180s_master",
    title: "Neo-Tokyo 2088: Chiaroscuro Rain",
    genre: "Cyberpunk Noir • 2.39:1 Scope",
    videoUrl: "/assets/video/neotokyo_180s_master.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Neon Rooftop Atmospheric Descent", videoUrl: "/assets/video/neotokyo_30s_cut.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Shinjuku Back-Alley Rain Puddles", videoUrl: "/assets/video/neotokyo_preview.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Cybernetic Contact & Lens Flares", videoUrl: "/assets/video/neotokyo_30s_cut.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Holographic Megastructure Skyline", videoUrl: "/assets/video/neotokyo_preview.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/neotokyo_180s_master.mp4", durationSec: 24.0 },
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
      {/* ── TOP TECHNICAL WORKSTATION MASTHEAD (ZERO MARKETING FLUFF) ── */}
      <section className="relative w-full border-b border-white/10 bg-gradient-to-b from-[#0B111E] via-[#07090E] to-[#07090E] pt-8 pb-10 md:pb-12 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[250px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 relative z-10">
          {/* Engineering Tech Spec Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              POST-GENERATION COMPONENT MASTER STUDIO
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ZERO FULL RE-RENDER PIPELINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              NON-DESTRUCTIVE MULTI-STEM DSP
            </span>
          </div>

          {/* Main Title & Technical Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.08]">
                MOTION PICTURES <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400">ENGINEERING STUDIO</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-4xl leading-relaxed font-normal">
                Sub-frame deterministic post-generation workstation. Edit constituent clips with 100% component independence: frame-accurate in/out trims, dynamic speed scaling (0.25x–4.00x), tri-stem acoustic balancing (-24.0 LUFS EBU R128), and 6-layer modular VFX compositing with zero full-video re-rendering.
              </p>
            </div>

            {/* Technical Wins HUD */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Render Latency</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">In-Place</div>
                <span className="text-[11px] text-slate-400 block truncate">PTS Re-clocking (&lt;4s)</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Modular Stack</span>
                <div className="text-2xl sm:text-3xl font-black text-teal-400">6 Layers</div>
                <span className="text-[11px] text-slate-400 block truncate">DensePose UV + SAM-2</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Aspect Standard</span>
                <div className="text-2xl sm:text-3xl font-black text-white">2.39:1</div>
                <span className="text-[11px] text-slate-400 block truncate">Theatrical Scope</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Acoustic Spec</span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400">-24.0</div>
                <span className="text-[11px] text-slate-400 block truncate">LUFS EBU R128 Tri-Stem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 0: POST-GENERATION COMPONENT MASTER STUDIO (INDEPENDENT VISUAL, AUDIO & MOTIONAL CONTROL) ── */}
      <section id="post-generation-studio" className="w-full py-10 md:py-14 border-b border-white/10 bg-[#06080E] scroll-mt-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sliders className="w-4 h-4" />
                POST-GENERATION COMPONENT MASTER STUDIO
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Independent Component Control (Visual, Audio &amp; Motional)
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-4xl leading-relaxed">
                Edit any generated reel or constituent clip post-generation with 100% component independence. Adjust individual shot visual speeds (0.25x–4.00x), frame-accurate trim bounds, vocal stem gain (0–150%), continuous unaltered music beds, environmental foley SFX, and 35mm theatrical LUTs with instant real-time visual and audible feedback.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-teal-950/50 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>+ Import Any Reel</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <span>Library:</span>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold">
                  {editableReels.length} Ready
                </span>
              </div>
            </div>
          </div>

          {/* Reel Selector Strip with Import Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {editableReels.map((reel) => {
              const isSelected = reel.id === activeSelectedReel.id;
              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => setSelectedReelId(reel.id)}
                  className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-950/50 ring-1 ring-teal-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono mb-1">
                      <span className="text-teal-400 font-semibold truncate">{reel.genre}</span>
                      <span className="text-slate-400">{reel.shots.length} shots</span>
                    </div>
                    <div className="font-bold text-sm text-white line-clamp-1">{reel.title}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Duration: {reel.durationSec.toFixed(1)}s</span>
                    <span className={isSelected ? "text-teal-300 font-bold" : "text-slate-500"}>
                      {isSelected ? "Active in Editor ✓" : "Load Reel →"}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Direct Import Action Card */}
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="p-3.5 rounded-xl text-left border border-dashed border-teal-500/50 hover:border-teal-400 bg-teal-500/5 hover:bg-teal-500/15 transition cursor-pointer flex flex-col justify-between group min-h-[96px]"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-400 font-bold mb-1">
                  <Plus className="w-3.5 h-3.5 text-teal-300 group-hover:scale-125 transition-transform" />
                  <span>IMPORT ANY REEL</span>
                </div>
                <div className="font-bold text-sm text-white">Load from Library or URL</div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>My Reels • URL • Upload</span>
                <span className="text-teal-300 font-bold group-hover:translate-x-0.5 transition-transform">Add Reel +</span>
              </div>
            </button>
          </div>

          {/* Embedded Upgraded ReelTimelineEditor with Real-Time Reactive Engine */}
          <div className="mt-4">
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
                      placeholder="e.g. /assets/video/titanic_180s_master.mp4 or https://..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Custom Title (Optional):</label>
                        <input
                          type="text"
                          value={importedReelTitleInput}
                          onChange={(e) => setImportedReelTitleInput(e.target.value)}
                          placeholder="e.g. Titanic 180s Theatrical Cut"
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

      {/* ── SECTION 1: INTERACTIVE 6-LAYER MODULAR VFX STACK SIMULATOR (ZERO FULL RE-RENDER) ── */}
      <section className="w-full py-12 md:py-16 border-b border-white/10 bg-[#07090E]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              NON-DESTRUCTIVE ARCHITECTURE
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              The 6-Layer Modular Stack (Zero Full Re-render)
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              How surgical alterations (beards, hairstyles, wardrobe fabrics, skin decals, and vocal visemes) are executed in post-production without regenerating the underlying video.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Video Viewport & Filter Switcher */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[2.39/1] w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl group">
                {/* Embedded High-Fidelity Video */}
                <video
                  ref={videoRef}
                  src="/assets/video/neotokyo_180s_master.mp4"
                  poster="/assets/stills/mv_01_summer_asia_poster.jpg"
                  playsInline
                  muted={isMuted}
                  autoPlay
                  loop
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    activeVfxView === "matte"
                      ? "grayscale contrast-200 invert"
                      : activeVfxView === "densepose"
                      ? "hue-rotate-180 saturate-200 contrast-150"
                      : activeVfxView === "depth"
                      ? "grayscale brightness-125 contrast-125"
                      : ""
                  }`}
                />

                {/* Live Simulation Overlay Indicators */}
                {activeVfxView === "matte" && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-black/80 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-xl">
                      [SAM-2 ALPHA ISOLATION MATTE: ZERO EDGE SWIMMING]
                    </div>
                  </div>
                )}

                {activeVfxView === "densepose" && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/50 bg-cyan-500/10 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-black/80 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-bold shadow-xl">
                      [DENSEPOSE IUV BODY COORDINATE MESH: SKIN STRETCH LOCKED]
                    </div>
                  </div>
                )}

                {activeVfxView === "depth" && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-purple-400/50 bg-purple-500/10 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-black/80 border border-purple-500/60 text-purple-300 font-mono text-xs font-bold shadow-xl">
                      [DEPTH-ANYTHING-V2 SURFACE NORMALS: CONTACT AO ACTIVE]
                    </div>
                  </div>
                )}

                {activeVfxView === "inpaint" && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/50 bg-amber-500/10 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-xl bg-black/80 border border-amber-500/60 text-amber-300 font-mono text-xs font-bold shadow-xl">
                      [SURGICAL INPAINTING PASS: WARDROBE RETEXTURED + BEARD INJECTED]
                    </div>
                  </div>
                )}

                {/* Player HUD Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-[11px] font-mono font-bold text-amber-400 backdrop-blur-md">
                    2.39:1 COOKE SCOPE
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/70 border border-white/10 text-[11px] font-mono text-teal-300 backdrop-blur-md">
                    24.000 FPS LOCKED
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-black/70 border border-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                    aria-label="Toggle mute"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-black/70 border border-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                    aria-label="Toggle play pause"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Viewport Channel Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: "composite", label: "Master Cut", icon: Film, color: "text-white" },
                  { key: "matte", label: "SAM-2 Matte", icon: Eye, color: "text-emerald-400" },
                  { key: "densepose", label: "DensePose UV", icon: Cpu, color: "text-cyan-400" },
                  { key: "depth", label: "Depth Normals", icon: Glasses, color: "text-purple-400" },
                  { key: "inpaint", label: "Surgical Diff", icon: Scissors, color: "text-amber-400" },
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isActive = activeVfxView === channel.key;
                  return (
                    <button
                      key={channel.key}
                      onClick={() => setActiveVfxView(channel.key as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center gap-1.5 min-h-[44px] ${
                        isActive
                          ? "bg-white/15 border-white/30 text-white ring-1 ring-white/20 shadow-md"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${channel.color}`} />
                      <span>{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: The 6 Stack Layers Detailed Breakdown */}
            <div className="lg:col-span-5 space-y-3">
              {MODULAR_VFX_STACK.map((layer) => {
                const isActive = activeLayers[layer.id];
                return (
                  <div
                    key={layer.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-white/5 border-white/20"
                        : "bg-white/[0.02] border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-[11px] font-black flex items-center justify-center">
                          {layer.number}
                        </span>
                        <h4 className="font-bold text-sm text-white">{layer.name}</h4>
                      </div>
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${
                          isActive
                            ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isActive ? "ENABLED" : "BYPASSED"}
                      </button>
                    </div>

                    <div className="text-xs text-amber-300/90 font-mono mb-1">
                      {layer.tagline}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {layer.role}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[280px]">Engine: {layer.technicalMechanism}</span>
                      <span className="text-emerald-400 font-bold">{layer.reRenderCost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE "WHAT'S POSSIBLE" REALITY MATRIX (3 TIERS) ── */}
      <section className="w-full py-12 md:py-16 border-b border-white/10 bg-[#080B14]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              FEASIBILITY BOUNDARY
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              The "What's Possible" Truth Matrix
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              An unvarnished engineering audit of what can be deployed in commercial production today, what requires hybrid algorithmic scaffolding, and where physical Hollywood cameras still reign supreme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: 100% Production Ready Today */}
            <div className="bg-gradient-to-b from-emerald-950/20 to-transparent border border-emerald-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-emerald-300">
                  1. 100% Production-Ready Today
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Deterministic, frame-accurate modifications with zero background corruption and zero full-video re-rendering.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  {
                    title: "Beards & Facial Hair Injection",
                    desc: "DensePose face UVs + ControlNet inpainting. Matches facial muscle deformation perfectly across talking heads.",
                  },
                  {
                    title: "Tattoos, Scars & Skin Decals",
                    desc: "Fixed UV surface mapping with normal displacement. Stretches with skin; zero jitter.",
                  },
                  {
                    title: "Wardrobe Fabric & Color Retexturing",
                    desc: "SAM-2 clothing segmentation + depth preservation. Turn denim into velvet or leather with zero edge bleeding.",
                  },
                  {
                    title: "Acoustic Viseme & Singing Sync",
                    desc: "Latent mouth inpainting driven by phoneme timestamps. Character lips lock to the audio clock without altering the head pose.",
                  },
                  {
                    title: "Post-Hoc Lighting Passes",
                    desc: "Estimated surface normals + digital HDRI dot-products. Transform midday sun to moody amber neon.",
                  },
                ].map((item, i) => (
                  <li key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Solved via Hybrid Scaffolding */}
            <div className="bg-gradient-to-b from-amber-950/20 to-transparent border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h3 className="text-lg font-bold text-amber-300">
                  2. Solved via Hybrid Scaffolding
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Tasks that fail in raw text-to-video, but succeed when paired with multi-step computer vision clean-plates.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  {
                    title: "Volumetric Hairstyle Shifts",
                    desc: "Short hair to long braids requires inpainting a background clean-plate first, then draping synthesized strands over the clean plate.",
                  },
                  {
                    title: "±15% Muscle Mass & Body Morphing",
                    desc: "Expanding silhouettes cuts into background walls. Requires background hole dilation + mesh-flow deformation outward.",
                  },
                  {
                    title: "The 'Vampire Bug' (Mirror Consistency)",
                    desc: "Generative models forget reflections. Solved by homography perspective transforms that mirror the actor's edits into glass surfaces.",
                  },
                  {
                    title: "Contact Shadow Ambient Occlusion",
                    desc: "Added objects float in space. Solved by rendering an alpha shadow-catcher pass beneath the newly inserted object.",
                  },
                ].map((item, i) => (
                  <li key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <Sparkle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: The Hollywood Physical Moat */}
            <div className="bg-gradient-to-b from-rose-950/20 to-transparent border border-rose-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <h3 className="text-lg font-bold text-rose-300">
                  3. The Hollywood Physical Moat
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Boundaries that pure neural models cannot bridge. Requires physical location rigs or multi-million-dollar 3D geometry.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  {
                    title: "Native High-G Aerodynamics (F1)",
                    desc: "180+ mph wind shear physically deforming human cheeks and real optical camera vibration cannot be faked with synthetic blur.",
                  },
                  {
                    title: "Multi-Layer Clothing Stripping",
                    desc: "Unbuttoning shirts or wrestling creates complex topological boundary crossing. Pure neural pixels merge into liquid skin blobs.",
                  },
                  {
                    title: "360° Metric Parallax Across 50 Cuts",
                    desc: "Neural models have no 3D memory bank. Maintaining exact room geometry across dozens of setups requires 3D Gaussian Splats or USD sets.",
                  },
                  {
                    title: "Extreme Underwater Buoyancy Dynamics",
                    desc: "Avatar-grade hydrodynamics with surface tension, hair drag, and wet-to-dry transitions requires continuous Navier-Stokes fluid solvers.",
                  },
                ].map((item, i) => (
                  <li key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: THEATRICAL PROJECT BUILDER & DIRECTOR CONSOLE ── */}
      <section className="w-full py-12 md:py-16 border-b border-white/10 bg-[#07090E]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sliders className="w-4 h-4" />
                PRODUCTION COMMISSIONING
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Direct a Motion Picture Master
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
                Configure your theatrical production parameters. All projects generate 2.39:1 widescreen masters with active non-destructive VFX passes and -24.0 LUFS symphonic acoustics.
              </p>
            </div>
            <Link
              href="/feature-films"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-transform hover:scale-105 min-h-[44px]"
            >
              <Clapperboard className="w-4 h-4 text-slate-950" />
              <span>Launch Feature Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
              {/* Project Title & Logline */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Production Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-base text-white font-bold focus:outline-none focus:border-amber-500 min-h-[44px]"
                    placeholder="Enter theatrical title..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Directorial Logline & Screenplay Core
                  </label>
                  <textarea
                    value={logline}
                    onChange={(e) => setLogline(e.target.value)}
                    rows={3}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Describe character arc, optical lighting, and dramatic midpoint..."
                  />
                </div>
              </div>

              {/* Technical Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Theatrical Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="2.39:1 Scope">2.39:1 Cooke Anamorphic Scope (Theatrical Standard)</option>
                    <option value="1.85:1 Flat">1.85:1 Academy Flat Widescreen</option>
                    <option value="1.43:1 IMAX">1.43:1 Full Height IMAX 70mm</option>
                    <option value="16:9 Broadcast">16:9 4K Broadcast Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Cinematic Lens Package
                  </label>
                  <select
                    value={lensPackage}
                    onChange={(e) => setLensPackage(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="Cooke Anamorphic /i T2.3">Cooke Anamorphic /i T2.3 (Warm Flare & Oval Bokeh)</option>
                    <option value="Arri Master Anamorphic">Arri Master Anamorphic (Zero Distortion 4K Edge)</option>
                    <option value="Panavision C-Series Vintage">Panavision C-Series (1970s Organic Flaring)</option>
                    <option value="Zeiss Supreme Prime 24mm">Zeiss Supreme Prime (Crisp Low-Light Contrast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Color Science & Print Emulation
                  </label>
                  <select
                    value={colorGrade}
                    onChange={(e) => setColorGrade(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="ACEScc 1.3 / Kodak 2383 Print">ACEScc 1.3 / Kodak 2383 35mm Film Print</option>
                    <option value="Technicolor 3-Strip Vintage">Technicolor 3-Strip Golden Age Saturation</option>
                    <option value="Bleach Bypass Fincher Contrast">Bleach Bypass (High Contrast Silvers)</option>
                    <option value="Monochrome Nitrate">Monochrome Nitrate (Deep High-Density Blacks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Acoustic Loudness Spec
                  </label>
                  <select
                    value={audioStandard}
                    onChange={(e) => setAudioStandard(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-amber-500 min-h-[44px]"
                  >
                    <option value="-24.0 LUFS EBU R128 Symphonic">-24.0 LUFS EBU R128 Symphonic Theatrical Master</option>
                    <option value="Dolby Atmos 5.1 Stems">Dolby Atmos Theatrical Stems (-23.0 LKFS)</option>
                    <option value="-14.0 LUFS Streaming Cut">-14.0 LUFS High-Impact Streaming Master</option>
                  </select>
                </div>
              </div>

              {/* Active Modular VFX Pass Toggles */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Pre-Configured Non-Destructive VFX Passes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={beardToggle}
                      onChange={(e) => setBeardToggle(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded bg-black border-white/20 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">DensePose Facial Hair Inpaint</div>
                      <div className="text-[10px] text-slate-400">Zero re-render facial grooming</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={wardrobeRetexture}
                      onChange={(e) => setWardrobeRetexture(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded bg-black border-white/20 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">SAM-2 Wardrobe Fabric Retexture</div>
                      <div className="text-[10px] text-slate-400">Cotton to velvet / armor swap</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={temporalStabilizer}
                      onChange={(e) => setTemporalStabilizer(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded bg-black border-white/20 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">RAFT Optical Flow Stabilization</div>
                      <div className="text-[10px] text-slate-400">Anti-swimming vector lock</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={anamorphicBokeh}
                      onChange={(e) => setAnamorphicBokeh(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded bg-black border-white/20 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Anamorphic Bokeh Flare &amp; Grain</div>
                      <div className="text-[10px] text-slate-400">35mm photochemical composite</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Directorial Preflight Review & Dispatch */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gradient-to-b from-[#0F172A] to-[#07090E] border border-white/15 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">
                    Preflight Certification
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    100% READY
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Theatrical Scope</span>
                    <div className="text-sm font-bold text-white">{aspectRatio}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Lens Simulation</span>
                    <div className="text-sm font-bold text-white">{lensPackage}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Color Transform</span>
                    <div className="text-sm font-bold text-white">{colorGrade}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Acoustic Loudness</span>
                    <div className="text-sm font-bold text-emerald-400">{audioStandard}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Re-render Overhead:</span>
                    <span className="text-emerald-400 font-bold">0.0% (Zero Re-render)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>C2PA Provenance:</span>
                    <span className="text-teal-300 font-bold">SynthID Verified</span>
                  </div>
                </div>

                <Link
                  href={`/feature-films?title=${encodeURIComponent(projectTitle)}&aspect=${encodeURIComponent(aspectRatio)}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-center text-sm uppercase tracking-wider transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 min-h-[44px]"
                >
                  <Clapperboard className="w-4 h-4 text-slate-950" />
                  <span>Execute Theatrical Master Cut</span>
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-white font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Directorial Guarantee
                </div>
                <p className="leading-relaxed">
                  Every motion picture master generated in Zyvoriq adheres to 16/16 Omni Director quality gates, eliminating lip-sync lag, dialog bleed, and floating objects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: MASTER THEATRICAL WIDESCREEN SHOWCASE ── */}
      <section className="w-full py-12 md:py-16 bg-[#07090E]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Film className="w-4 h-4" />
                THEATRICAL EXHIBITION
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Verified Theatrical Masters
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
                Inspect 2.39:1 widescreen narrative masters generated across classical drama, neo-noir, and epic historical productions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Neo-Tokyo 2088: Chiaroscuro Rain",
                genre: "Cyberpunk Noir • 2.39:1 Scope",
                specs: "Cooke Anamorphic 50mm • -24.0 LUFS",
                video: "/assets/video/neotokyo_180s_master.mp4",
                duration: "180s Master",
              },
              {
                title: "Imperial Coronation: Hall of Mirrors",
                genre: "Historical Epic • 2.39:1 Scope",
                specs: "Arri Master Anamorphic • 35mm Grain",
                video: "/assets/video/coronation_30s_cut.mp4",
                duration: "30s Master",
              },
              {
                title: "Waterloo 1815: The Fog of War",
                genre: "Military Cinema • 2.39:1 Scope",
                specs: "Panavision C-Series • Volumetric Smoke",
                video: "/assets/video/napoleon_180s_master.mp4",
                duration: "180s Master",
              },
            ].map((film, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[2.39/1] w-full bg-black overflow-hidden">
                  <video
                    src={film.video}
                    playsInline
                    muted
                    autoPlay
                    loop
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md">
                    {film.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-mono text-teal-300 font-bold">
                    {film.genre}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {film.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {film.specs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
