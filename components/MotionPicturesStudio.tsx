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
  Award,
  Cpu,
  Flame,
  Glasses,
  Sparkle,
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
    genre: "Music Video • 9:16 Social Canvas",
    videoUrl: "/assets/video/mv_01_summer_asia_master.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Poolside Lounge & Palm Shadows", videoUrl: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Sunlit Choreography & Water Ripples", videoUrl: "/assets/video/studio1_e2e00945.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Floating Glamour & Turquoise Reflections", videoUrl: "/assets/video/mv_02_summer_europe_master.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Beachside Sunset Finale", videoUrl: "/assets/video/mv_03_summer_usa_master.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/mv_01_summer_asia_master.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "napoleon_180s_master",
    title: "Waterloo 1815: The Fog of War (Theatrical Scope)",
    genre: "Historical Epic • 2.39:1 Scope",
    videoUrl: "/assets/video/napoleon_180s_master.mp4",
    durationSec: 30.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Heavy Cavalry Charge Formations", videoUrl: "/assets/video/napoleon_180s_master.mp4", durationSec: 7.5 },
      { id: "shot_2", title: "Shot 2 • Volumetric Cannon & Gunpowder Smoke", videoUrl: "/assets/video/napoleon_30s_cut.mp4", durationSec: 7.5 },
      { id: "shot_3", title: "Shot 3 • The Emperor's Command Tent Close-Up", videoUrl: "/assets/video/napoleon_preview.mp4", durationSec: 7.5 },
      { id: "shot_4", title: "Shot 4 • Muddy Rainfield Decisive Turn", videoUrl: "/assets/video/napoleon_180s_master.mp4", durationSec: 7.5 },
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
      { id: "shot_1", title: "Shot 1 • Neon Rooftop Atmospheric Descent", videoUrl: "/assets/video/neotokyo_180s_master.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Shinjuku Back-Alley Rain Puddles", videoUrl: "/assets/video/neotokyo_30s_cut.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • Cybernetic Contact & Lens Flares", videoUrl: "/assets/video/neotokyo_preview.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Holographic Megastructure Skyline", videoUrl: "/assets/video/neotokyo_180s_master.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/neotokyo_180s_master.mp4", durationSec: 24.0 },
    ],
  },
  {
    id: "coronation_180s_master",
    title: "Imperial Coronation: Hall of Mirrors",
    genre: "Historical Drama • 2.39:1 Scope",
    videoUrl: "/assets/video/coronation_180s_master.mp4",
    durationSec: 24.0,
    shots: [
      { id: "shot_1", title: "Shot 1 • Royal Procession Down the Nave", videoUrl: "/assets/video/coronation_180s_master.mp4", durationSec: 6.0 },
      { id: "shot_2", title: "Shot 2 • Anointing of the Golden Diadem", videoUrl: "/assets/video/coronation_30s_cut.mp4", durationSec: 6.0 },
      { id: "shot_3", title: "Shot 3 • The Grand Banquet & Candlelit Gold", videoUrl: "/assets/video/coronation_preview.mp4", durationSec: 6.0 },
      { id: "shot_4", title: "Shot 4 • Hall of Mirrors Velvet Waltz", videoUrl: "/assets/video/coronation_180s_master.mp4", durationSec: 6.0 },
    ],
    versions: [
      { versionNumber: 1, label: "v1 • Original Master", url: "/assets/video/coronation_180s_master.mp4", durationSec: 24.0 },
    ],
  },
];

interface BlockbusterBenchmark {
  rank: number;
  title: string;
  gross: string;
  studio: string;
  director: string;
  vfxBreakthrough: string;
  physicsChallenge: string;
  aiEquivalence: string;
  feasibilityTier: "ready" | "hybrid" | "moat";
  accent: string;
  badge: string;
  sampleVideo: string;
}

const BLOCKBUSTER_2025_BENCHMARKS: BlockbusterBenchmark[] = [
  {
    rank: 1,
    title: "Ne Zha 2",
    gross: "$2,215,690,000",
    studio: "Beijing Enlight",
    director: "Jiaozi",
    vfxBreakthrough: "Volumetric Fluid/Ink & Mythological Particle Collisions",
    physicsChallenge: "Hundreds of thousands of rigged soldiers colliding with procedural water/fire dragons at macro scales without mesh clipping.",
    aiEquivalence: "Instanced latent particle generation with GPU-accelerated collision bounds. Can synthesize massive crowd dynamics, but requires strict bounding boxes to prevent character merging.",
    feasibilityTier: "hybrid",
    accent: "from-red-500 to-amber-500",
    badge: "#1 All-Time Animated Film",
    sampleVideo: "/assets/video/coronation_180s_master.mp4",
  },
  {
    rank: 2,
    title: "Zootopia 2",
    gross: "$1,870,309,291",
    studio: "Walt Disney Pictures",
    director: "Byron Howard",
    vfxBreakthrough: "Micro-Strand Species Grooming & Non-Human Cloth Solvers",
    physicsChallenge: "Multi-million-strand hair shading across diverse mammalian species; tailoring cloth dynamics across non-human skeletal proportions.",
    aiEquivalence: "SAM-2 edge matting + DensePose UV wrapping. Achievable for short-haired/medium-furred characters; extreme translucent long fur requires clean-plate inpainting behind fur volumes.",
    feasibilityTier: "ready",
    accent: "from-cyan-500 to-blue-500",
    badge: "Disney's Highest-Grossing Animated Film",
    sampleVideo: "/assets/video/studio1_e2e00945.mp4",
  },
  {
    rank: 3,
    title: "Avatar: Fire and Ash",
    gross: "$1,490,386,712",
    studio: "20th Century / Lightstorm",
    director: "James Cameron",
    vfxBreakthrough: "Ash Volumetrics & Melanistic Skin Subsurface Scattering",
    physicsChallenge: "Dense airborne particulate ash illuminating Na'vi facial pores with bidirectional path tracing; ash clan cracked dermal textures.",
    aiEquivalence: "Depth-guided volumetric ash particle overlays combined with estimated surface normal relighting. Replicates 90% of theatrical depth without multi-day render farms.",
    feasibilityTier: "hybrid",
    accent: "from-amber-600 to-orange-500",
    badge: "$1.4B+ Global IMAX Titan",
    sampleVideo: "/assets/video/napoleon_180s_master.mp4",
  },
  {
    rank: 4,
    title: "Lilo & Stitch",
    gross: "$1,038,027,526",
    studio: "Walt Disney Pictures",
    director: "Dean Fleischer Camp",
    vfxBreakthrough: "Tactile Live-Action Contact & Dynamic Fabric Tugging",
    physicsChallenge: "3D digital character physically interacting with live human actors, casting realistic ambient occlusion and compressing human skin/fabric.",
    aiEquivalence: "Latent inpainting with shadow-catcher composite layers. Direct physical contact (hugging, clothing tugs) requires multi-pass depth matte blending to prevent pixel smear.",
    feasibilityTier: "hybrid",
    accent: "from-teal-400 to-cyan-500",
    badge: "1st Live-Action Hybrid to Cross $1B",
    sampleVideo: "/assets/video/mv_01_summer_asia_master.mp4",
  },
  {
    rank: 5,
    title: "A Minecraft Movie",
    gross: "$961,287,780",
    studio: "Warner Bros. / Legendary",
    director: "Jared Hess",
    vfxBreakthrough: "Photorealistic Voxel Texturing & Procedural World Geometry",
    physicsChallenge: "Projecting high-fidelity organic textures (animal fur, wool, rock strata) onto rigid cubical voxel geometry with natural lighting.",
    aiEquivalence: "100% solvable with generative depth conditioning (ControlNet Depth + Normal). Rigid geometric structures are ideal for neural texture projection.",
    feasibilityTier: "ready",
    accent: "from-emerald-500 to-teal-600",
    badge: "$960M+ Global Gaming Phenomenon",
    sampleVideo: "/assets/video/neotokyo_180s_master.mp4",
  },
  {
    rank: 6,
    title: "Jurassic World Rebirth",
    gross: "$872,428,220",
    studio: "Universal Pictures",
    director: "Gareth Edwards",
    vfxBreakthrough: "Soft-Body Muscle & Skin Sliding over Skeletal Rigs",
    physicsChallenge: "Dinosaur epidermal skin sliding over contracting muscle groups during rapid predatory locomotion, combined with practical animatronic hand-offs.",
    aiEquivalence: "DensePose-guided anatomical deformation. Excellent for visual skin texture and muscle definition; extreme fast-twitch biting collisions still benefit from 3D physics anchors.",
    feasibilityTier: "hybrid",
    accent: "from-lime-500 to-emerald-600",
    badge: "Gareth Edwards Franchise Reinvigoration",
    sampleVideo: "/assets/video/titanic_180s_master.mp4",
  },
  {
    rank: 7,
    title: "Demon Slayer: Infinity Castle",
    gross: "$793,491,854",
    studio: "Toho / Aniplex / Crunchyroll",
    director: "Haruo Sotozaki",
    vfxBreakthrough: "3D Infinite Shifting Architecture with 2D Hand-Drawn Flow",
    physicsChallenge: "Constantly rotating 3D architectural rooms (sliding shoji doors, inverted gravity) interacting seamlessly with 24fps cel-shaded sword combat.",
    aiEquivalence: "Hybrid 3D camera projection + temporal optical flow tracking. Generates flawless stylized cel-shading over structured 3D spatial geometry.",
    feasibilityTier: "ready",
    accent: "from-purple-500 to-indigo-600",
    badge: "Highest-Grossing Anime in Cinema History",
    sampleVideo: "/assets/video/studio1_01bd8d8d.mp4",
  },
  {
    rank: 8,
    title: "How to Train Your Dragon",
    gross: "$639,866,451",
    studio: "Universal Pictures",
    director: "Dean DeBlois",
    vfxBreakthrough: "Aerodynamic Membrane Wing Physics & High-Altitude Lighting",
    physicsChallenge: "Simulating wind pressure deforming thin leather dragon wings during cloud bank dives, matched to real Scottish highland lighting plates.",
    aiEquivalence: "Optical flow velocity warping + volumetric cloud scattering. Generative base handles cloud density; wing flutter locked via RAFT motion vectors.",
    feasibilityTier: "hybrid",
    accent: "from-sky-500 to-blue-600",
    badge: "Live-Action Flying Masterclass",
    sampleVideo: "/assets/video/studio1_37f1f557.mp4",
  },
  {
    rank: 9,
    title: "F1",
    gross: "$634,142,436",
    studio: "Warner Bros. / Apple Original",
    director: "Joseph Kosinski",
    vfxBreakthrough: "Real-G High-Velocity Native Cockpit Cinematography",
    physicsChallenge: "Bolting custom 6K IMAX cameras into genuine F1 race cars at 180+ mph; real G-force pulling actor facial muscles, real cockpit vibrations.",
    aiEquivalence: "The Hollywood Physical Moat: Generative AI can simulate motion blur and camera shake, but cannot replicate true centrifugal gravitational force pulling on live human tissue.",
    feasibilityTier: "moat",
    accent: "from-rose-500 to-red-600",
    badge: "Kosinski & Pitt Live Racing Record",
    sampleVideo: "/assets/video/studio1_5bfb958d.mp4",
  },
  {
    rank: 10,
    title: "Superman",
    gross: "$618,723,803",
    studio: "Warner Bros. / DC Studios",
    director: "James Gunn",
    vfxBreakthrough: "Tactile Practical Suit Integration & High-Velocity Flight Dynamics",
    physicsChallenge: "Transitioning David Corenswet's textured physical costume into digital doubles during sonic booms and supersonic atmospheric re-entry.",
    aiEquivalence: "DensePose costume tracking + high-pass texture retention. Flawlessly preserves fabric weave across digital take transitions with zero texture swim.",
    feasibilityTier: "ready",
    accent: "from-blue-600 to-red-500",
    badge: "James Gunn's DCU Launch Epic",
    sampleVideo: "/assets/video/studio1_417f1625_rough_cut.mp4",
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
  const [selectedBenchmark, setSelectedBenchmark] = useState<BlockbusterBenchmark>(
    BLOCKBUSTER_2025_BENCHMARKS[0]
  );
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

  useEffect(() => {
    async function loadProductions() {
      try {
        const res = await fetch("/api/reels/productions");
        const data = await res.json();
        const productions = Array.isArray(data) ? data : data?.productions || [];
        if (productions.length > 0) {
          const mapped: EditableReelItem[] = productions
            .filter((p: any) => p && p.id && (p.videoUrl || p.manifest?.outputVideoUrl || p.manifest?.roughCutUrl))
            .map((p: any) => {
              const shots = (p.manifest?.shots || []).map((s: any, idx: number) => ({
                id: s.id || `shot_${idx + 1}`,
                title: s.title || `Shot #${idx + 1}`,
                videoUrl: s.videoUrl || s.url || p.videoUrl || p.manifest?.outputVideoUrl,
                durationSec: Number(s.durationSec || 6.0),
              }));
              return {
                id: p.id,
                title: p.topic || p.title || `Production #${p.id.slice(0, 8)}`,
                genre: p.genre || "Music Video • Social Canvas",
                videoUrl: p.videoUrl || p.manifest?.outputVideoUrl || p.manifest?.roughCutUrl,
                durationSec: Number(p.manifest?.durationSec || 24.0),
                shots: shots.length > 0 ? shots : [
                  { id: "shot_1", title: "Shot 1", videoUrl: p.videoUrl || p.manifest?.outputVideoUrl, durationSec: 6.0 },
                  { id: "shot_2", title: "Shot 2", videoUrl: p.videoUrl || p.manifest?.outputVideoUrl, durationSec: 6.0 },
                  { id: "shot_3", title: "Shot 3", videoUrl: p.videoUrl || p.manifest?.outputVideoUrl, durationSec: 6.0 },
                  { id: "shot_4", title: "Shot 4", videoUrl: p.videoUrl || p.manifest?.outputVideoUrl, durationSec: 6.0 },
                ],
                versions: p.manifest?.versions || [
                  { versionNumber: 1, label: "v1 • Master Cut", url: p.videoUrl || p.manifest?.outputVideoUrl, durationSec: 24.0 },
                ],
              };
            });
          if (mapped.length > 0) {
            setEditableReels((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const newItems = mapped.filter((m) => !existingIds.has(m.id));
              return [...newItems, ...prev];
            });
            setSelectedReelId(mapped[0].id);
          }
        }
      } catch (e) {
        // Fallback to default presets
      }
    }
    loadProductions();
  }, []);

  const activeSelectedReel =
    editableReels.find((r) => r.id === selectedReelId) || editableReels[0];

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
      {/* ── TOP HERO DIRECTORIAL MASTHEAD ── */}
      <section className="relative w-full border-b border-white/10 bg-gradient-to-b from-[#0B111E] via-[#07090E] to-[#07090E] pt-8 pb-12 md:pb-16 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 relative z-10">
          {/* Breadcrumb & Pill */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              THEATRICAL CINEMA PIPELINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              2025 BOX OFFICE BENCHMARKS
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              NON-DESTRUCTIVE 6-LAYER MODULAR STACK
            </span>
          </div>

          {/* Main Title & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
                MOTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-teal-400">PICTURES</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-4xl leading-relaxed font-normal">
                Where classical Hollywood VFX engineering meets generative neural synthesis. Discover what is mathematically possible today: analyze the highest-grossing films since 2025, deconstruct the 6-layer modular VFX stack, and direct 2.39:1 widescreen masters with zero video re-rendering.
              </p>
            </div>

            {/* Metrics HUD */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">#1 2025 Benchmark</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">$2.22B</div>
                <span className="text-[11px] text-slate-400 block truncate">Ne Zha 2 (All-Time High)</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">VFX Architecture</span>
                <div className="text-2xl sm:text-3xl font-black text-teal-400">6 Layers</div>
                <span className="text-[11px] text-slate-400 block truncate">Modular Non-Destructive</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Aspect Standard</span>
                <div className="text-2xl sm:text-3xl font-black text-white">2.39:1</div>
                <span className="text-[11px] text-slate-400 block truncate">Cooke Anamorphic Scope</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Acoustic Spec</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">-24.0</div>
                <span className="text-[11px] text-slate-400 block truncate">LUFS EBU R128 Symphonic</span>
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

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">Master Reel Library:</span>
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold">
                {editableReels.length} Reels Ready to Edit
              </span>
            </div>
          </div>

          {/* Reel Selector Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* ── SECTION 1: 2025 BLOCKBUSTER BOX OFFICE & VFX OBSERVATORY ── */}
      <section className="w-full py-12 md:py-16 border-b border-white/10 bg-[#080B14]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                GLOBAL CINEMA INTELLIGENCE
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Top Money-Making Movies Released Since 2025
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
                The commercial titans of 2025 and their core visual breakthroughs. Click any film to audit the VFX physics challenge and how the hybrid neural studio approaches it.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">Feasibility Index:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Ready
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Hybrid Solved
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                Hollywood Moat
              </span>
            </div>
          </div>

          {/* Film Selector Horizontal Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {BLOCKBUSTER_2025_BENCHMARKS.map((film) => {
              const isSelected = selectedBenchmark.rank === film.rank;
              return (
                <button
                  key={film.rank}
                  onClick={() => setSelectedBenchmark(film)}
                  className={`p-3 sm:p-4 rounded-xl text-left transition-all border min-h-[44px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-white/10 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[11px] font-mono font-black text-amber-400">
                        #{film.rank}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          film.feasibilityTier === "ready"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : film.feasibilityTier === "hybrid"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-red-500/20 text-red-300 border border-red-500/40"
                        }`}
                      >
                        {film.feasibilityTier === "ready"
                          ? "READY"
                          : film.feasibilityTier === "hybrid"
                          ? "HYBRID"
                          : "MOAT"}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white truncate">{film.title}</div>
                    <div className="text-xs font-mono font-black text-slate-300 mt-1">
                      {film.gross}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 truncate font-sans">
                    {film.studio}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Film Forensic Deep-Dive Card */}
          <div className="bg-gradient-to-r from-[#0C1222] to-[#0A0E1A] border border-white/15 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    RANK #{selectedBenchmark.rank} AT 2025 BOX OFFICE
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/10 text-slate-300">
                    {selectedBenchmark.badge}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/10 text-slate-400">
                    Directed by {selectedBenchmark.director} • {selectedBenchmark.studio}
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white">
                  {selectedBenchmark.title}{" "}
                  <span className="text-amber-400 font-mono text-2xl sm:text-3xl ml-2">
                    {selectedBenchmark.gross}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono text-slate-400 block">Feasibility Category</span>
                  <span className="text-sm font-bold text-white capitalize">
                    {selectedBenchmark.feasibilityTier === "ready"
                      ? "Deterministic Neural Inpaint (100% Ready)"
                      : selectedBenchmark.feasibilityTier === "hybrid"
                      ? "Hybrid Scaffolding Required (Solved)"
                      : "Classical Hollywood Physical Moat"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Column Engineering Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Primary VFX Breakthrough
                </div>
                <h4 className="text-base font-bold text-white">
                  {selectedBenchmark.vfxBreakthrough}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  The primary technical achievement that made audiences pay for IMAX/theatrical tickets.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  The Classical Physics Problem
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {selectedBenchmark.physicsChallenge}
                </p>
              </div>

              <div className="bg-white/5 border border-teal-500/30 rounded-xl p-5 space-y-2.5 bg-teal-500/5">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-mono font-bold uppercase">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  Zyvoriq / Neural Equivalence
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {selectedBenchmark.aiEquivalence}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE 6-LAYER MODULAR VFX STACK SIMULATOR ── */}
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
                  poster="/samples/yt_spain_pool_party_poster.jpg"
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
                video: "/assets/video/coronation_180s_master.mp4",
                duration: "180s Master",
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
