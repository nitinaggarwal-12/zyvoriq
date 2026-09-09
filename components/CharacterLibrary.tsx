"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Volume2,
  Search,
  RefreshCw,
  Eye,
  X,
  Globe
} from "lucide-react";
import type { LibraryCharacter, WardrobeVariant } from "@/lib/library/characterLibrary";

export const COUNTRY_OPTIONS = [
  { id: "all", label: "All Countries", flag: "🌐" },
  { id: "Denmark", label: "Denmark", flag: "🇩🇰" },
  { id: "United States", label: "United States", flag: "🇺🇸" },
  { id: "United Kingdom", label: "United Kingdom", flag: "🇬🇧" },
  { id: "France", label: "France", flag: "🇫🇷" },
  { id: "Germany", label: "Germany", flag: "🇩🇪" },
  { id: "Italy", label: "Italy", flag: "🇮🇹" },
  { id: "Spain", label: "Spain", flag: "🇪🇸" },
  { id: "Switzerland", label: "Switzerland", flag: "🇨🇭" },
  { id: "India", label: "India", flag: "🇮🇳" },
  { id: "Japan", label: "Japan", flag: "🇯🇵" },
  { id: "South Korea", label: "South Korea", flag: "🇰🇷" },
  { id: "China", label: "China", flag: "🇨🇳" },
  { id: "Australia", label: "Australia", flag: "🇦🇺" },
  { id: "Brazil", label: "Brazil", flag: "🇧🇷" },
  { id: "Argentina", label: "Argentina", flag: "🇦🇷" },
  { id: "Peru", label: "Peru", flag: "🇵🇪" },
  { id: "Nigeria", label: "Nigeria", flag: "🇳🇬" },
  { id: "Philippines", label: "Philippines", flag: "🇵🇭" },
  { id: "Indonesia", label: "Indonesia", flag: "🇮🇩" },
  { id: "Mexico", label: "Mexico", flag: "🇲🇽" },
  { id: "Turkey", label: "Turkey", flag: "🇹🇷" },
  { id: "Romania", label: "Romania", flag: "🇷🇴" },
  { id: "Russia", label: "Russia", flag: "🇷🇺" },
];

export const TASTE_CATEGORIES = [
  { id: "all", label: "All Creations", icon: "🌐", desc: "Complete global pre-validated cast" },
  { id: "cinema", label: "Cinema Leads", icon: "🎬", desc: "Blockbuster archetypes & dramatic leads" },
  { id: "fashion", label: "Haute Couture", icon: "💎", desc: "Paris, Milan & Tokyo runway muses" },
  { id: "creator", label: "Digital Creators", icon: "📱", desc: "Authentic vloggers & lifestyle creators" },
  { id: "denmark", label: "Denmark Personas", icon: "🇩🇰", desc: "Copenhagen cinema leads & creators (all outfits)" },
  { id: "india_regional", label: "Indian Regional", icon: "🇮🇳", desc: "Punjab, Maharashtra, Bengal, Tamil Nadu, Kerala" },
];

export function getCountryFlag(codeOrName?: string): string {
  if (!codeOrName) return "🌐";
  const map: Record<string, string> = {
    DK: "🇩🇰", Denmark: "🇩🇰",
    PH: "🇵🇭", Philippines: "🇵🇭",
    BR: "🇧🇷", Brazil: "🇧🇷",
    NG: "🇳🇬", Nigeria: "🇳🇬",
    IN: "🇮🇳", India: "🇮🇳",
    ID: "🇮🇩", Indonesia: "🇮🇩",
    MX: "🇲🇽", Mexico: "🇲🇽",
    KR: "🇰🇷", "South Korea": "🇰🇷",
    US: "🇺🇸", "United States": "🇺🇸",
    JP: "🇯🇵", Japan: "🇯🇵",
    FR: "🇫🇷", France: "🇫🇷",
    GB: "🇬🇧", "United Kingdom": "🇬🇧", UK: "🇬🇧",
    DE: "🇩🇪", Germany: "🇩🇪",
    CH: "🇨🇭", Switzerland: "🇨🇭",
    ES: "🇪🇸", Spain: "🇪🇸",
    AR: "🇦🇷", Argentina: "🇦🇷",
    PE: "🇵🇪", Peru: "🇵🇪",
    IT: "🇮🇹", Italy: "🇮🇹",
    TR: "🇹🇷", Turkey: "🇹🇷",
    RO: "🇷🇴", Romania: "🇷🇴",
    RU: "🇷🇺", Russia: "🇷🇺",
    CN: "🇨🇳", China: "🇨🇳",
    AU: "🇦🇺", Australia: "🇦🇺",
  };
  return map[codeOrName] || "🌐";
}

export function getWardrobeIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("gym") || l.includes("fitness") || l.includes("athletic") || l.includes("workout")) return "🏃";
  if (l.includes("street") || l.includes("default") || l.includes("urban") || l.includes("freestyle")) return "👟";
  if (l.includes("market") || l.includes("grocer") || l.includes("bazaar") || l.includes("basket") || l.includes("tote")) return "🛒";
  if (l.includes("pool") || l.includes("beach") || l.includes("swim") || l.includes("resort")) return "🏊";
  if (l.includes("office") || l.includes("business") || l.includes("suit") || l.includes("blazer") || l.includes("corporate") || l.includes("boardroom") || /\bwork\b/.test(l) || l.includes("/work")) return "👔";
  if (l.includes("party") || l.includes("gala") || l.includes("evening") || l.includes("dinner") || l.includes("cocktail")) return "🍸";
  if (l.includes("home") || l.includes("hygge") || l.includes("lounge") || l.includes("casual") || l.includes("knit") || l.includes("kurta")) return "☕";
  return "👟";
}

export function getWardrobeShortLabel(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("gym") || l.includes("fitness") || l.includes("athletic") || l.includes("workout")) return "Gym";
  if (l.includes("street") || l.includes("default") || l.includes("urban") || l.includes("freestyle")) return "Street";
  if (l.includes("market") || l.includes("grocer") || l.includes("bazaar") || l.includes("basket") || l.includes("tote")) return "Market";
  if (l.includes("pool") || l.includes("beach") || l.includes("swim") || l.includes("resort")) return "Pool";
  if (l.includes("office") || l.includes("business") || l.includes("suit") || l.includes("blazer") || l.includes("corporate") || l.includes("boardroom") || /\bwork\b/.test(l) || l.includes("/work")) return "Office";
  if (l.includes("party") || l.includes("gala") || l.includes("evening") || l.includes("dinner") || l.includes("cocktail")) return "Party";
  if (l.includes("home") || l.includes("hygge") || l.includes("lounge") || l.includes("casual") || l.includes("knit") || l.includes("kurta")) return "Home";
  return "Default";
}

interface CharacterLibraryProps {
  onSelectCharacter?: (character: LibraryCharacter, role: "lead" | "supporting") => void;
  selectedLeadId?: string;
  selectedSupportingId?: string;
  isSelectionMode?: boolean;
}

export function CharacterLibrary({
  onSelectCharacter,
  selectedLeadId,
  selectedSupportingId,
  isSelectionMode = false,
}: CharacterLibraryProps) {
  const [characters, setCharacters] = useState<LibraryCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaste, setSelectedTaste] = useState<string>("all");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [validatedOnly, setValidatedOnly] = useState(false);
  const [inspectingCharacter, setInspectingCharacter] = useState<LibraryCharacter | null>(null);
  const [modalWardrobeId, setModalWardrobeId] = useState<string | null>(null);
  const [activeWardrobes, setActiveWardrobes] = useState<Record<string, string>>({});

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEra !== "all") params.set("era", selectedEra);
      if (selectedGender !== "all") params.set("gender", selectedGender);
      if (selectedCountry !== "all") params.set("country", selectedCountry);
      if (validatedOnly) params.set("validated", "true");

      const res = await fetch(`/api/library/characters?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCharacters(data.characters || []);
      }
    } catch (e) {
      console.error("Failed to load characters:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [selectedCountry, selectedEra, selectedGender, validatedOnly]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInspectingCharacter(null);
        setModalWardrobeId(null);
      }
    };
    if (inspectingCharacter) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [inspectingCharacter]);

  const filteredCharacters = characters.filter(c => {
    // Taste filtering
    if (selectedTaste === "cinema" && c.category !== "cinema") return false;
    if (selectedTaste === "fashion" && c.category !== "fashion") return false;
    if (selectedTaste === "creator" && c.category !== "creator") return false;
    if (selectedTaste === "denmark" && c.country !== "Denmark") return false;
    if (selectedTaste === "india_regional" && !(c.country === "India" && c.region)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = (
        c.displayName.toLowerCase().includes(q) ||
        c.archetype.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.countryCode && c.countryCode.toLowerCase().includes(q)) ||
        (c.region && c.region.toLowerCase().includes(q)) ||
        (c.language && c.language.toLowerCase().includes(q)) ||
        (c.wardrobe && c.wardrobe.some(w => w.label.toLowerCase().includes(q)))
      );
      if (!matches) return false;
    }

    return true;
  });

  const handleCast = (char: LibraryCharacter, role: "lead" | "supporting", overrideWardrobeId?: string) => {
    if (!onSelectCharacter) return;
    const currentWardrobeId = overrideWardrobeId || activeWardrobes[char.id] || char.wardrobe.find(w => w.isDefault)?.id || char.wardrobe[0]?.id;
    const currentWardrobe = char.wardrobe.find(w => w.id === currentWardrobeId) || char.wardrobe[0];
    const customizedChar: LibraryCharacter = {
      ...char,
      wardrobe: char.wardrobe.map(w => ({
        ...w,
        isDefault: w.id === currentWardrobe?.id
      }))
    };
    onSelectCharacter(customizedChar, role);
  };

  return (
    <div className="w-full bg-[#07090E] text-white">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Character Library
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
              {characters.length} Pre-Validated Personas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global talent with multi-location wardrobes (Gym, Pool, Office, Home, Market). Pre-flight verified to eliminate Veo likeness blocks.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, archetype, country, outfit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0E121B] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <button
            type="button"
            onClick={() => setValidatedOnly(!validatedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px] ${
              validatedOnly
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validated Only</span>
          </button>
        </div>
      </div>

      {/* Taste-Driven Category Navigation Tabs */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
            <span>✨</span> Curated Taste & Industry Categories:
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {TASTE_CATEGORIES.map(t => {
            const isCurrent = selectedTaste === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTaste(t.id);
                  if (t.id === "denmark") {
                    setSelectedCountry("all");
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 min-h-[40px] shrink-0 border ${
                  isCurrent
                    ? "bg-teal-500 text-[#07090E] border-teal-400 font-bold shadow-lg shadow-teal-500/20"
                    : "bg-[#0E121B] text-slate-300 hover:text-white hover:bg-white/10 border-white/10"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span className="tracking-tight">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Filter Pills */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Country / Origin:
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          {COUNTRY_OPTIONS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCountry(c.id);
                if (c.id === "Denmark") setSelectedTaste("all");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[36px] shrink-0 ${
                selectedCountry === c.id
                  ? "bg-teal-500 text-[#07090E] font-bold shadow-md shadow-teal-500/20"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs: Era & Gender */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase text-slate-500 mr-2">Era:</span>
        {["all", "contemporary", "cyberpunk", "sci-fi", "historical"].map(era => (
          <button
            key={era}
            type="button"
            onClick={() => setSelectedEra(era)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all min-h-[32px] ${
              selectedEra === era
                ? "bg-teal-500 text-[#07090E] font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {era}
          </button>
        ))}

        <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />

        <span className="text-xs font-semibold uppercase text-slate-500 mr-2">Gender:</span>
        {["all", "female", "male"].map(gender => (
          <button
            key={gender}
            type="button"
            onClick={() => setSelectedGender(gender)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all min-h-[32px] ${
              selectedGender === gender
                ? "bg-teal-500 text-[#07090E] font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {gender}
          </button>
        ))}
      </div>

      {/* Grid of Characters */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
          <p className="text-xs">Loading pre-validated cast...</p>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold">No characters found matching your filters</p>
          <p className="text-xs text-slate-600 mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCharacters.map(char => {
            const isLead = selectedLeadId === char.id;
            const isSupporting = selectedSupportingId === char.id;
            const isSelected = isLead || isSupporting;
            
            const defaultWardrobe = char.wardrobe.find(w => w.isDefault) || char.wardrobe[0];
            const activeWardrobeId = activeWardrobes[char.id] || defaultWardrobe?.id;
            const currentWardrobe = char.wardrobe.find(w => w.id === activeWardrobeId) || defaultWardrobe;
            const stillUri = currentWardrobe?.sheetUris?.[0] || defaultWardrobe?.sheetUris?.[0] || "/assets/stills/dubai_dance.jpg";

            return (
              <div
                key={char.id}
                className={`group relative bg-[#0C1019] border rounded-2xl overflow-hidden transition-all flex flex-col ${
                  isSelected
                    ? "border-teal-500 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/30"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Poster / Character Still */}
                <div className="relative aspect-[9/14] sm:aspect-[4/5] w-full bg-[#07090E] overflow-hidden">
                  <img
                    src={stillUri}
                    alt={char.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1019] via-transparent to-black/50" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                    {/* Validation Status Badge */}
                    {char.validationStatus === "VALIDATED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/90 text-[#07090E] shadow-md shadow-emerald-500/30 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : char.validationStatus === "RAI_BLOCKED" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/80 text-white shadow-md uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3" />
                        RAI Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/80 text-[#07090E] shadow-md uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Unverified
                      </span>
                    )}

                    {/* Category or Voice Badge */}
                    <div className="flex items-center gap-1">
                      {char.category === "cinema" && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          🎬 Cinema
                        </span>
                      )}
                      {char.category === "fashion" && (
                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                          💎 Runway
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        {char.defaultVoiceId || "Kore"}
                      </span>
                    </div>
                  </div>

                  {/* Active Wardrobe Overlay Pill (Bottom Left of Poster) */}
                  <div className="absolute bottom-2 left-2.5 z-10 flex flex-col gap-1">
                    {isLead && (
                      <span className="px-2 py-0.5 rounded bg-teal-500 text-[#07090E] text-[10px] font-black uppercase tracking-wider w-fit">
                        ★ Lead Actor
                      </span>
                    )}
                    {isSupporting && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500 text-[#07090E] text-[10px] font-black uppercase tracking-wider w-fit">
                        Co-Star (Actor 2)
                      </span>
                    )}
                    {currentWardrobe && char.wardrobe.length > 1 && (
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-medium border border-white/20 flex items-center gap-1 w-fit">
                        <span>{getWardrobeIcon(currentWardrobe.label)}</span>
                        <span className="truncate max-w-[140px]">{getWardrobeShortLabel(currentWardrobe.label)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Wardrobe Quick Selector (if character has multiple outfits) */}
                {char.wardrobe.length > 1 && (
                  <div className="px-3 pt-2.5 pb-1 bg-[#090D15] border-b border-white/5">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <span>Wardrobe:</span>
                      </span>
                      <span className="text-[10px] text-teal-400 font-semibold">
                        {char.wardrobe.length} Outfits
                      </span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                      {char.wardrobe.map(w => {
                        const isOutfitActive = currentWardrobe?.id === w.id;
                        const icon = getWardrobeIcon(w.label);
                        const shortLabel = getWardrobeShortLabel(w.label);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveWardrobes(prev => ({ ...prev, [char.id]: w.id }));
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                              isOutfitActive
                                ? "bg-teal-500 text-[#07090E] font-bold shadow-sm shadow-teal-500/20 ring-1 ring-teal-300"
                                : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
                            }`}
                            title={w.label}
                          >
                            <span>{icon}</span>
                            <span>{shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors truncate">
                        {char.displayName}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {char.country && (
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-200 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                            <span>{getCountryFlag(char.countryCode || char.country)}</span>
                            <span>{char.country}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Archetype pill (the prompt-safe anchor) */}
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-medium leading-snug">
                        {char.archetype}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {char.description}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingCharacter(char);
                        setModalWardrobeId(activeWardrobeId || null);
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details ({char.wardrobe.length})</span>
                    </button>

                    {isSelectionMode && onSelectCharacter && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCast(char, "lead")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isLead
                              ? "bg-teal-500 text-[#07090E]"
                              : "bg-white/10 hover:bg-teal-500/20 text-slate-300 hover:text-teal-300"
                          }`}
                        >
                          {isLead ? "Lead ✓" : "Cast Lead"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCast(char, "supporting")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSupporting
                              ? "bg-cyan-500 text-[#07090E]"
                              : "bg-white/10 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300"
                          }`}
                        >
                          {isSupporting ? "Co-Star ✓" : "+ Co-Star"}
                        </button>
                      </div>
                    )}

                    {!isSelectionMode && (
                      <Link
                        href={`/?lead=${char.id}&wardrobe=${currentWardrobe?.id || ""}&outfit=${encodeURIComponent(currentWardrobe?.label || "")}#prompt-bar`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        <span>Cast in Reel</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Inspect Modal */}
      {inspectingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0C1019] border border-white/20 rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setInspectingCharacter(null);
                setModalWardrobeId(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {(() => {
              const activeModalW = inspectingCharacter.wardrobe.find(w => w.id === modalWardrobeId) ||
                inspectingCharacter.wardrobe.find(w => w.isDefault) ||
                inspectingCharacter.wardrobe[0];
              const modalImg = activeModalW?.sheetUris?.[0] || inspectingCharacter.wardrobe[0]?.sheetUris[0] || "/assets/stills/dubai_dance.jpg";

              return (
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left Column: Portrait */}
                  <div className="w-full sm:w-64 shrink-0 flex flex-col items-center">
                    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
                      <img
                        src={modalImg}
                        alt={inspectingCharacter.displayName}
                        className="w-full h-full object-cover"
                      />
                      {activeModalW && (
                        <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-center">
                          <span className="text-[11px] font-bold text-teal-300 flex items-center justify-center gap-1">
                            <span>{getWardrobeIcon(activeModalW.label)}</span>
                            <span>{activeModalW.label}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Details & Wardrobe Selector */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-black text-white">{inspectingCharacter.displayName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                          {inspectingCharacter.validationStatus}
                        </span>
                      </div>

                      <div className="mb-3">
                        <span className="text-xs text-teal-300 font-semibold px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 inline-block">
                          Archetype: {inspectingCharacter.archetype}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        {inspectingCharacter.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 bg-white/5 p-3 rounded-xl">
                        {inspectingCharacter.country && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Origin: <strong className="text-white">{getCountryFlag(inspectingCharacter.countryCode || inspectingCharacter.country)} {inspectingCharacter.country}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Voice: <strong className="text-white">{inspectingCharacter.defaultVoiceId || "Kore"}</strong></span>
                        </div>
                        {inspectingCharacter.era && (
                          <div>
                            Era: <strong className="text-white capitalize">{inspectingCharacter.era}</strong>
                          </div>
                        )}
                        {inspectingCharacter.gender && (
                          <div>
                            Gender: <strong className="text-white capitalize">{inspectingCharacter.gender}</strong>
                          </div>
                        )}
                      </div>

                      {/* Wardrobe Variants Interactive List */}
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Location Wardrobe Variants ({inspectingCharacter.wardrobe.length})
                          </h4>
                          <span className="text-[11px] text-teal-400">Click to preview</span>
                        </div>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {inspectingCharacter.wardrobe.map(w => {
                            const isCurrent = (activeModalW?.id === w.id);
                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => setModalWardrobeId(w.id)}
                                className={`w-full text-left flex items-center justify-between text-xs p-2.5 rounded-xl border transition-all ${
                                  isCurrent
                                    ? "bg-teal-500/20 border-teal-500/40 text-teal-200 font-bold"
                                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{getWardrobeIcon(w.label)}</span>
                                  <span>{w.label}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {w.sheetUris.length} sheet(s) {isCurrent ? "✓ Active" : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {isSelectionMode && onSelectCharacter && (
                      <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            handleCast(inspectingCharacter, "lead", modalWardrobeId || undefined);
                            setInspectingCharacter(null);
                            setModalWardrobeId(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-teal-500 text-[#07090E] font-bold text-xs sm:text-sm hover:bg-teal-400 transition-all"
                        >
                          Cast as Lead Actor ({getWardrobeShortLabel(activeModalW?.label || "Default")})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleCast(inspectingCharacter, "supporting", modalWardrobeId || undefined);
                            setInspectingCharacter(null);
                            setModalWardrobeId(null);
                          }}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 text-[#07090E] font-bold text-xs sm:text-sm hover:bg-cyan-400 transition-all"
                        >
                          Cast as Co-Star
                        </button>
                      </div>
                    )}

                    {!isSelectionMode && (
                      <div className="pt-4 border-t border-white/10 mt-4">
                        <Link
                          href={`/?lead=${inspectingCharacter.id}&wardrobe=${activeModalW?.id || ""}&outfit=${encodeURIComponent(activeModalW?.label || "")}#prompt-bar`}
                          className="w-full py-2.5 px-4 rounded-xl bg-teal-500 text-[#07090E] font-bold text-xs sm:text-sm hover:bg-teal-400 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-[#07090E]" />
                          <span>Cast as Lead Actor in Reel ({getWardrobeShortLabel(activeModalW?.label || "Default")})</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
