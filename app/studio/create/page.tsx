"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Film,
  Sparkles,
  Zap,
  Mic,
  Layers,
  Music,
  BookOpen,
  ArrowRight,
  Tv,
  Flame,
  Lightbulb,
  Radio,
  Feather,
  Wand2,
  ShoppingBag,
  Split,
  BarChart3,
  HelpCircle,
  Smile,
  ShieldAlert,
  Compass,
  Palette,
  Eye,
  CheckCircle2,
  Users,
  Grid3X3,
  Table,
  Briefcase,
  Dumbbell,
  Building2,
  TrendingUp,
  Plane,
  GraduationCap,
  Stethoscope,
  Moon
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

type PersonaId =
  | "all"
  | "kids"
  | "youth"
  | "influencer"
  | "ugc"
  | "mature"
  | "heritage"
  | "b2b"
  | "fitness"
  | "realestate"
  | "finance"
  | "travel"
  | "edtech"
  | "medical"
  | "spiritual";

interface PersonaConfig {
  id: PersonaId;
  index: number;
  title: string;
  subtitle: string;
  audience: string;
  icon: any;
  badge: string;
  badgeColor: string;
  styleDNA: string;
  coreDeliverables: string[];
  samplePrompts: string[];
  primaryRoute: string;
}

const PERSONAS_14: PersonaConfig[] = [
  {
    id: "kids",
    index: 1,
    title: "Kids, Parents & Family",
    subtitle: "Disney, Pixar & Ghibli Universe",
    audience: "Children (Ages 3-12), Parents, Kindergarten & Primary Educators",
    icon: Smile,
    badge: "Persona #1: Pixar & Disney",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    styleDNA: "Tactile 3D CGI, Soft Rim Lighting, Pastoral Watercolors, 100% Kid-Safe Guardrails",
    coreDeliverables: [
      "Pixar-Grade 3D CGI Animated Stories",
      "Hand-Painted Watercolor Fairytale Books",
      "Nursery Rhymes & Lyria Sing-Along Tracks",
      "Educational Moral Lesson Dialogues"
    ],
    samplePrompts: [
      "Pixar 3D bedtime story about a curious little robot who wanted to plant a flower on the moon",
      "Gentle Ghibli-style watercolor tale of a lost puppy finding a cozy bakery in rainy Kyoto",
      "Fun catchy nursery rhyme song with dancing animal characters teaching the ABCs"
    ],
    primaryRoute: "/studio/create/animation"
  },
  {
    id: "youth",
    index: 2,
    title: "Teens, Anime & Manga",
    subtitle: "Marvel, Shōnen & Ufotable",
    audience: "Gen-Z, Anime Fans, Manga Artists, Gaming Streamers",
    icon: Zap,
    badge: "Persona #2: Shōnen Action",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    styleDNA: "24fps Kinetic Combat, Lightning Particle Sparks, High-Contrast Comic Splash Art",
    coreDeliverables: [
      "High-Octane Shōnen Battle Sequences",
      "4-Panel Manga & Webtoon Vertical Strips",
      "Marvel/DC Superhero Splash Double Pages",
      "S-to-F Gaming Character Tier Lists"
    ],
    samplePrompts: [
      "Epic Ufotable-style lightning katana duel on a rainy neon rooftop",
      "4-panel comedic manga strip about a demon king working part-time at a convenience store"
    ],
    primaryRoute: "/studio/create/comics"
  },
  {
    id: "influencer",
    index: 3,
    title: "Viral Influencers & Shorts",
    subtitle: "Faceless & Retention Reels",
    audience: "TikTokers, YouTube Shorts Creators, Cash-Cow Channel Automators",
    icon: Flame,
    badge: "Persona #3: Viral Retention",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    styleDNA: "Dual Split-Screen, Satisfying ASMR/Parkour Inset, Bouncing Gold Subtitles",
    coreDeliverables: [
      "Split-Screen Brainrot/ASMR Confession Reels",
      "Viral Reddit Stories with Kinetic Subtitles",
      "Interactive 5s Ticking Timer Quizzes",
      "Would You Rather Community Poll Reels"
    ],
    samplePrompts: [
      "Scary true crime Reddit confession with satisfying kinetic sand cutting on bottom",
      "5-question Marvel vs DC trivia countdown quiz with ticking timer and buzzer sounds"
    ],
    primaryRoute: "/studio/create/reel?mode=faceless"
  },
  {
    id: "ugc",
    index: 4,
    title: "E-Commerce & DTC Brands",
    subtitle: "High-Converting UGC Ads",
    audience: "Shopify Merchants, Dropshippers, Amazon Sellers, DTC Marketers",
    icon: ShoppingBag,
    badge: "Persona #4: TikTok & Meta Ads",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    styleDNA: "Problem-Solution Framework, AI Creator Holding Product, Star Ratings, CTA Overlays",
    coreDeliverables: [
      "AI UGC Talking-Head Product Video Ads",
      "3-Hook Video Ad Variations (A/B Testing)",
      "Before vs After Transformation Wipes",
      "TikTok Shop Link-in-Bio Callouts"
    ],
    samplePrompts: [
      "Viral UGC ad for smart self-heating coffee mug with problem hook and 50% discount badge",
      "Before/After skincare transformation review with AI dermatologist host"
    ],
    primaryRoute: "/studio/create/ugc"
  },
  {
    id: "mature",
    index: 5,
    title: "Filmmakers & Mature Drama",
    subtitle: "A24 Arthouse & Neo-Noir",
    audience: "Screenwriters, Independent Filmmakers, Investigative Journalists, Novelists",
    icon: Eye,
    badge: "Persona #5: A24 & HBO",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    styleDNA: "35mm Film Grain, Atmospheric Low-Key Chiaroscuro, Psychological Tension",
    coreDeliverables: [
      "Cinematic Neo-Noir Short Film Scenes",
      "2-Host Investigative Journalism Podcasts",
      "Multi-Chapter Psychological Novels & Lore",
      "Atmospheric Neo-Classical Cello Scores"
    ],
    samplePrompts: [
      "A24-style moody neo-noir scene of an investigator questioning an elusive suspect in foggy London",
      "2-host deep investigative podcast debating the geopolitical ethics of AI energy consumption"
    ],
    primaryRoute: "/studio/create/podcast"
  },
  {
    id: "heritage",
    index: 6,
    title: "Golden Age, Seniors & Heritage",
    subtitle: "Amar Chitra Katha & Folklore",
    audience: "Seniors, Grandparents, Classical Literature Lovers, Cultural Historians",
    icon: Compass,
    badge: "Persona #6: BBC & Heritage",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    styleDNA: "Classical Indian Ink Art, Norman Rockwell Warmth, Soothing Fireside Cadence",
    coreDeliverables: [
      "Indian Mythology Epics (Mahabharata / Ramayana)",
      "BBC 4K Nature Documentaries with Attenborough Cadence",
      "Dadi/Nani Bedtime Fireside Audio Stories",
      "60-Second Guided Breathwork & Serene Visualizers"
    ],
    samplePrompts: [
      "Amar Chitra Katha illustrated scene of Lord Krishna delivering the Gita on the battlefield of Kurukshetra",
      "Soothing grandmother bedtime story about the wise elephant in the ancient forest of Panchatantra"
    ],
    primaryRoute: "/studio/create/story"
  },
  {
    id: "b2b",
    index: 7,
    title: "B2B Founders & Solopreneurs",
    subtitle: "SaaS Launch & Thought Leadership",
    audience: "Tech Founders, Solopreneurs, VCs, Growth Agencies, Product Managers",
    icon: Briefcase,
    badge: "Persona #7: SaaS & Enterprise",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    styleDNA: "Dark-Mode Glassmorphic UI, Glowing Cursor Spotlights, Kinetic Typographic Frameworks",
    coreDeliverables: [
      "SaaS Feature Launch Video Teasers",
      "Product Hunt & Pitch Deck 60s Videos",
      "LinkedIn Thought Leadership Carousels",
      "Interactive Product Demo Walkthroughs"
    ],
    samplePrompts: [
      "High-converting Product Hunt launch video for an AI database query assistant with UI zooms",
      "10-slide LinkedIn PDF carousel breaking down 7 pricing models for early-stage SaaS"
    ],
    primaryRoute: "/studio/create/carousel"
  },
  {
    id: "fitness",
    index: 8,
    title: "Fitness Coaches & Nutrition",
    subtitle: "High-Energy Workout & Diet",
    audience: "Personal Trainers, Gym Creators, Dietitians, Yoga Instructors",
    icon: Dumbbell,
    badge: "Persona #8: Fitness & Macros",
    badgeColor: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    styleDNA: "High-Contrast Workout Lighting, Dynamic Stopwatch Overlays, Calorie Badges, Phonk Pump Beats",
    coreDeliverables: [
      "Timed Workout Split Demonstration Reels",
      "Macro & Meal Prep Split-Screen Guides",
      "30-Day Body Transformation Sliders",
      "Motivational Voiceover Pump Shorts"
    ],
    samplePrompts: [
      "High-energy 45-second HIIT workout reel with 30s countdown timer and form tips",
      "High-protein 500-calorie meal prep split screen with protein macro overlay badges"
    ],
    primaryRoute: "/studio/create/reel"
  },
  {
    id: "realestate",
    index: 9,
    title: "Real Estate & Architecture",
    subtitle: "Luxury Living & Spaces",
    audience: "Luxury Realtors, Airbnb Superhosts, Interior Architects, Property Developers",
    icon: Building2,
    badge: "Persona #9: Luxury Walkthrough",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    styleDNA: "4K Cinematic Drone Pans, Golden-Hour Lighting, Smooth Fly-Throughs, Property Badges",
    coreDeliverables: [
      "Cinematic Luxury Property Tours",
      "Before vs After Home Renovation Wipes",
      "Airbnb Listing Showcase Reels",
      "Neighborhood Lifestyle & Amenity Guides"
    ],
    samplePrompts: [
      "Cinematic walkthrough of a $4.5M modern Beverly Hills glass mansion with price and sq ft badges",
      "Before and after luxury kitchen renovation swipe with modern marble island staging"
    ],
    primaryRoute: "/studio/create/reel"
  },
  {
    id: "finance",
    index: 10,
    title: "Finance, Traders & Crypto",
    subtitle: "Market Pulse & Economic Breakdowns",
    audience: "Stock Market Analysts, Crypto Traders, Personal Finance Creators, Newsletter Editors",
    icon: TrendingUp,
    badge: "Persona #10: Wall Street & Crypto",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    styleDNA: "Live Candlestick Chart Animations, Bloomberg-Style Lower-Thirds, Authoritative Anchor Voice",
    coreDeliverables: [
      "30-Second Market Pulse News Flashes",
      "How It Happened Economic Crash Infographics",
      "Personal Finance & Compound Interest Decks",
      "Crypto Tokenomics & On-Chain Breakdowns"
    ],
    samplePrompts: [
      "Breaking market pulse reel explaining the Fed interest rate decision with green/red candlestick charts",
      "Vox-style animated infographic explaining how NVIDIA became the world's most valuable chipmaker"
    ],
    primaryRoute: "/studio/create/reel?mode=explainer"
  },
  {
    id: "travel",
    index: 11,
    title: "Travel Creators & Foodies",
    subtitle: "Globe Itineraries & ASMR Food",
    audience: "Digital Nomads, Travel Vloggers, Food Reviewers, Hospitality Brands",
    icon: Plane,
    badge: "Persona #11: 3D Flight & ASMR",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    styleDNA: "3D Globe Flight Paths, Saturated Sunsets, ASMR Food Sizzles, Chill Lofi Beats",
    coreDeliverables: [
      "3D Animated Flight Itinerary Maps",
      "Top 5 Hidden Gems in [City] Montages",
      "ASMR Food & Dish Preparation Zooms",
      "Budget Breakdown Destination Decks"
    ],
    samplePrompts: [
      "3D globe flight animation traveling from New York to Tokyo with hotel stopover pins",
      "Top 5 secret ramen spots in Tokyo with mouthwatering close-up sizzles and price tags"
    ],
    primaryRoute: "/studio/create/reel"
  },
  {
    id: "edtech",
    index: 12,
    title: "EdTech, STEM & Coding",
    subtitle: "Interactive Learning & Code",
    audience: "Coding Educators, STEM Professors, Bootcamps, Test-Prep Instructors",
    icon: GraduationCap,
    badge: "Persona #12: STEM & IDE",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    styleDNA: "Syntax-Highlighted IDE Typing, 3D Physics/Math Graph Simulators, Bite-Sized Flashcards",
    coreDeliverables: [
      "Split-Screen Live Code IDE Walkthroughs",
      "3D Animated Math & Science Concept Proofs",
      "Daily Language & Vocabulary Flashcards",
      "Interactive Step-by-Step Problem Solving"
    ],
    samplePrompts: [
      "Split-screen coding reel explaining React useEffect dependency array with live browser output",
      "3D visual explanation of how transformer attention mechanisms process text in LLMs"
    ],
    primaryRoute: "/studio/create/reel?mode=explainer"
  },
  {
    id: "medical",
    index: 13,
    title: "Doctors & Healthcare",
    subtitle: "Clinical Trust & 3D Anatomy",
    audience: "Physicians, Dentists, Dermatologists, Therapists, Health Educators",
    icon: Stethoscope,
    badge: "Persona #13: Medical Authority",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    styleDNA: "Doctor Reacts Split-Screen, 3D Body Anatomy Fly-Throughs, Empathetic Tone, Medical Disclaimers",
    coreDeliverables: [
      "Doctor Reacts / Myth-Busting Reels",
      "3D Anatomical Body Simulation Guides",
      "Empathetic Mental Health Consultation Shorts",
      "Skincare Routine Ingredient Breakdowns"
    ],
    samplePrompts: [
      "Dermatologist reacts split-screen debunking viral DIY lemon juice acne hacks with scientific explanation",
      "3D anatomical fly-through showing how chronic poor posture causes cervical spine compression"
    ],
    primaryRoute: "/studio/create/reel"
  },
  {
    id: "spiritual",
    index: 14,
    title: "Devotional & Astrology",
    subtitle: "Daily Zodiac & Sacred Mantras",
    audience: "Astrologers, Spiritual Seekers, Temple Communities, Mindfulness Practitioners",
    icon: Moon,
    badge: "Persona #14: Zodiac & Mantras",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    styleDNA: "Cosmic Nebula Shimmers, Sacred Golden Devanagari Script, Temple Bells, Binaural 432Hz Audio",
    coreDeliverables: [
      "Daily 12-Zodiac Astrological Predictions",
      "Sanskrit/Hindi Devotional Mantras & Aarti",
      "3D Tarot Card Pull & Life Readings",
      "Binaural Morning Meditation Soundscapes"
    ],
    samplePrompts: [
      "Daily Aries, Taurus, Gemini astrological prediction card with cosmic nebula background",
      "Maha Mrityunjaya Mantra chanting reel with rolling golden Sanskrit lyrics and sacred temple visuals"
    ],
    primaryRoute: "/studio/create/music"
  }
];

function normalizePersonaParam(param: string | null): PersonaId {
  if (!param) return "kids";
  const p = param.toLowerCase().trim();
  if (p === "all") return "all";
  if (p.startsWith("kid")) return "kids";
  if (p.startsWith("youth") || p.includes("anime") || p.includes("manga")) return "youth";
  if (p.startsWith("influencer") || p.includes("faceless")) return "influencer";
  if (p.startsWith("ugc") || p.includes("ecommerce") || p.includes("dtc")) return "ugc";
  if (p.startsWith("mature") || p.includes("documentary")) return "mature";
  if (p.startsWith("heritage") || p.includes("lore") || p.includes("history")) return "heritage";
  if (p.startsWith("b2b") || p.includes("corporate") || p.includes("saas")) return "b2b";
  if (p.startsWith("fitness") || p.includes("gym")) return "fitness";
  if (p.startsWith("realestate") || p.includes("luxury")) return "realestate";
  if (p.startsWith("finance") || p.includes("wealth") || p.includes("crypto")) return "finance";
  if (p.startsWith("travel") || p.includes("hospitality")) return "travel";
  if (p.startsWith("edtech") || p.includes("academy") || p.includes("course")) return "edtech";
  if (p.startsWith("medical") || p.includes("health") || p.includes("doctor")) return "medical";
  if (p.startsWith("spiritual") || p.includes("astrology") || p.includes("mantra")) return "spiritual";
  return "kids";
}

function CreateHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const queryParam = searchParams.get("q") || searchParams.get("topic") || searchParams.get("prompt");

  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(() => normalizePersonaParam(personaParam));
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");
  const [quickPrompt, setQuickPrompt] = useState(() => queryParam || "");

  useEffect(() => {
    if (personaParam) {
      setSelectedPersona(normalizePersonaParam(personaParam));
    }
  }, [personaParam]);

  useEffect(() => {
    if (queryParam && !quickPrompt) {
      setQuickPrompt(queryParam);
    }
  }, [queryParam]);

  const handleSelectPersona = (id: PersonaId) => {
    setSelectedPersona(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("persona", id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const activePersonaConfig = useMemo(() => {
    return PERSONAS_14.find((p) => p.id === selectedPersona) || PERSONAS_14[0];
  }, [selectedPersona]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    const lower = quickPrompt.toLowerCase();
    if (lower.includes("ugc") || lower.includes("product") || lower.includes("amazon") || lower.includes("review")) {
      router.push(`/studio/create/reel?mode=ugc&q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("split") || lower.includes("brainrot") || lower.includes("asmr") || lower.includes("reddit")) {
      router.push(`/studio/create/reel?mode=faceless&q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("infographic") || lower.includes("vox") || lower.includes("chart") || lower.includes("economy")) {
      router.push(`/studio/create/reel?mode=explainer&q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("quiz") || lower.includes("tier list") || lower.includes("trivia") || lower.includes("would you rather")) {
      router.push(`/studio/create/reel?mode=interactive&q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("podcast") || lower.includes("debate") || lower.includes("interview")) {
      router.push(`/studio/create/podcast?q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("anime") || lower.includes("animation") || lower.includes("shonen") || lower.includes("ghibli") || lower.includes("pixar")) {
      router.push(`/studio/create/animation?q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("comic") || lower.includes("manga") || lower.includes("strip") || lower.includes("marvel")) {
      router.push(`/studio/create/comics?q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("carousel") || lower.includes("slide") || lower.includes("deck") || lower.includes("pdf")) {
      router.push(`/studio/create/carousel?q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("song") || lower.includes("music") || lower.includes("beat") || lower.includes("lyric") || lower.includes("mantra")) {
      router.push(`/studio/create/music?q=${encodeURIComponent(quickPrompt)}`);
    } else if (lower.includes("novel") || lower.includes("chapter") || lower.includes("book") || lower.includes("lore") || lower.includes("story")) {
      router.push(`/studio/create/story?q=${encodeURIComponent(quickPrompt)}`);
    } else {
      router.push(`${activePersonaConfig.primaryRoute}?q=${encodeURIComponent(quickPrompt)}`);
    }
  };

  return (
    <StudioSidebar>
      <main className="flex-1 max-w-8xl w-full mx-auto px-5 py-8 md:px-10 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-4xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs font-bold text-teal-300 font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> Google Omni · 14 Production Suites
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
            Omni Creation Matrix
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto">
            Direct Veo 3.1 4K diffusion plates, character facial DNA, and acoustic soundstages across 14 specialized production pipelines.
          </p>
        </div>

        {/* Universal Magic Prompt Bar */}
        <form onSubmit={handleQuickSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center rounded-3xl border border-teal-500/40 bg-gradient-to-r from-slate-900/90 via-obsidian-950/95 to-slate-900/90 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={`Describe your idea for ${activePersonaConfig.title} (e.g. '${activePersonaConfig.samplePrompts[0].slice(0, 48)}...')...`}
              className="w-full bg-transparent py-3.5 pl-4 pr-36 text-sm sm:text-base text-white placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              className="absolute right-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-5 py-3 text-xs sm:text-sm font-black text-obsidian-950 shadow-lg shadow-teal-500/25 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Studio</span>
            </button>
          </div>
        </form>

        {/* Persona Selectors Bar (14 Personas Grid) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                Step 1: Select Your Industry Persona (14 Specialized Profiles)
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-900/80 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === "cards" ? "bg-teal-500 text-obsidian-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Persona Focus View</span>
              </button>
              <button
                onClick={() => setViewMode("matrix")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === "matrix" ? "bg-teal-500 text-obsidian-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>14-Persona Master Matrix</span>
              </button>
            </div>
          </div>

          {/* 14 Persona Horizontal Scrollable / Grid Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {PERSONAS_14.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-teal-500/25 to-slate-900 border-teal-400 ring-2 ring-teal-400/30 shadow-lg scale-[1.02]"
                      : "bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${isSelected ? "text-teal-300" : "text-slate-400"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400">
                      #{p.index}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-white line-clamp-1">{p.title}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE PERSONA SPOTLIGHT & STUDIO LAUNCH CARD */}
        {viewMode === "cards" && (
          <div className="rounded-3xl border border-teal-500/40 bg-gradient-to-br from-slate-900/90 via-obsidian-950 to-slate-900/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase font-mono ${activePersonaConfig.badgeColor}`}>
                    {activePersonaConfig.badge}
                  </span>
                  <span className="text-xs text-slate-400">Target Audience: {activePersonaConfig.audience}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  {activePersonaConfig.title}
                  <span className="text-lg text-slate-400 font-normal">({activePersonaConfig.subtitle})</span>
                </h2>
                <p className="text-sm text-slate-300 max-w-3xl">
                  <strong className="text-teal-300 font-mono">Aesthetic & Render DNA:</strong> {activePersonaConfig.styleDNA}
                </p>
              </div>

              <Link
                href={`${activePersonaConfig.primaryRoute}${activePersonaConfig.primaryRoute.includes("?") ? "&" : "?"}q=${encodeURIComponent(quickPrompt || activePersonaConfig.samplePrompts[0])}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-6 py-4 text-sm font-black text-obsidian-950 shadow-xl shadow-teal-500/25 hover:from-teal-300 hover:to-cyan-300 active:scale-[0.98] transition cursor-pointer whitespace-nowrap"
              >
                <span>Enter Dedicated Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Deliverables & Sample Prompts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Deliverables */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Guaranteed Production Deliverables
                </h3>
                <div className="space-y-2">
                  {activePersonaConfig.coreDeliverables.map((deliv, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/5 p-3 text-xs text-slate-200">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Prompt Inspirations */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Prompt Templates
                </h3>
                <div className="space-y-2">
                  {activePersonaConfig.samplePrompts.map((prompt, idx) => {
                    const isSelected = quickPrompt === prompt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuickPrompt(prompt);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className={`w-full text-left flex items-start justify-between gap-2 rounded-xl p-3 text-xs transition cursor-pointer group border ${
                          isSelected
                            ? "bg-teal-500/15 border-teal-400/80 text-white shadow-md shadow-teal-500/10 ring-1 ring-teal-400/30"
                            : "bg-slate-900/80 border-white/10 hover:border-teal-500/40 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Wand2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${isSelected ? "text-teal-300" : "text-teal-400 group-hover:scale-110"}`} />
                          <span className={isSelected ? "font-bold text-teal-100" : "group-hover:text-white transition-colors"}>"{prompt}"</span>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 text-[10px] font-black font-mono">
                            ✓ ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: MASTER 14-PERSONA MATRIX TABLE */}
        {viewMode === "matrix" && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Full 14-Persona Master Capabilities Matrix</h2>
                <p className="text-xs text-slate-400">Complete breakdown of all 14 creative personas, target audiences, render styles, and direct routes.</p>
              </div>
              <span className="rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 text-xs font-mono font-bold">
                14 Production Profiles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-mono uppercase text-[11px] text-slate-300">
                    <th className="p-4">#</th>
                    <th className="p-4">Persona Profile</th>
                    <th className="p-4">Target Audience</th>
                    <th className="p-4">Aesthetic & Render DNA</th>
                    <th className="p-4">Core Production Deliverables</th>
                    <th className="p-4">Studio Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PERSONAS_14.map((p) => {
                    const isSelected = selectedPersona === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          handleSelectPersona(p.id);
                          setViewMode("cards");
                        }}
                        className={`hover:bg-white/5 transition cursor-pointer ${isSelected ? "bg-teal-500/10" : ""}`}
                      >
                        <td className="p-4 font-mono font-bold text-teal-400">#{p.index}</td>
                        <td className="p-4 font-bold text-white whitespace-nowrap">{p.title}</td>
                        <td className="p-4 text-slate-400 max-w-xs">{p.audience}</td>
                        <td className="p-4 text-slate-300 max-w-sm">{p.styleDNA}</td>
                        <td className="p-4 text-slate-300 max-w-sm">
                          <ul className="list-disc list-inside space-y-0.5">
                            {p.coreDeliverables.slice(0, 2).map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4">
                          <Link href={p.primaryRoute} className="text-teal-400 font-bold hover:underline whitespace-nowrap">
                            Launch →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </StudioSidebar>
  );
}

export default function CreateHubPage() {
  return (
    <Suspense
      fallback={
        <StudioSidebar>
          <main className="flex-1 max-w-8xl w-full mx-auto px-5 py-8 md:px-10 space-y-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-teal-400 font-mono text-sm animate-pulse">Loading Creative Studio Hub...</div>
          </main>
        </StudioSidebar>
      }
    >
      <CreateHubContent />
    </Suspense>
  );
}


