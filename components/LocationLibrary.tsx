"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Clock,
  Sun,
  Moon,
  Sparkles,
  Search,
  Check,
  Eye,
  X,
  Copy,
  Layers,
  ChevronRight
} from "lucide-react";
import type { LibraryLocation } from "@/lib/library/locationLibrary";

interface LocationLibraryProps {
  onSelectLocation?: (location: LibraryLocation) => void;
  selectedLocationId?: string;
  isSelectionMode?: boolean;
}

export function LocationLibrary({
  onSelectLocation,
  selectedLocationId,
  isSelectionMode = false,
}: LocationLibraryProps) {
  const [locations, setLocations] = useState<LibraryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("all");
  const [inspectingLocation, setInspectingLocation] = useState<LibraryLocation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEra !== "all") params.set("era", selectedEra);
      if (selectedTimeOfDay !== "all") params.set("timeOfDay", selectedTimeOfDay);

      const res = await fetch(`/api/library/locations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (e) {
      console.error("Failed to load locations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedEra, selectedTimeOfDay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectingLocation(null);
    };
    if (inspectingLocation) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [inspectingLocation]);

  const handleCopy = (loc: LibraryLocation) => {
    navigator.clipboard.writeText(loc.environmentBlock);
    setCopiedId(loc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLocations = locations.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.displayName.toLowerCase().includes(q) ||
      l.environmentBlock.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full bg-[#07090E] text-white">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Location Library
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {locations.length} Established Sets
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Byte-identical verbatim environment blocks. Eliminates physical set drift across cuts without re-invention.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search environments, lighting..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#0E121B] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase text-slate-500 mr-2">Era:</span>
        {["all", "contemporary", "cyberpunk", "sci-fi"].map(era => (
          <button
            key={era}
            type="button"
            onClick={() => setSelectedEra(era)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
              selectedEra === era
                ? "bg-amber-500 text-[#07090E] font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {era}
          </button>
        ))}

        <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />

        <span className="text-xs font-semibold uppercase text-slate-500 mr-2">Lighting / Time:</span>
        {["all", "night", "golden_hour", "sunset", "dusk", "cosmic"].map(tod => (
          <button
            key={tod}
            type="button"
            onClick={() => setSelectedTimeOfDay(tod)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
              selectedTimeOfDay === tod
                ? "bg-amber-500 text-[#07090E] font-bold"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {tod.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid of Locations */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
          <p className="text-xs">Loading established sets...</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-semibold">No locations found</p>
          <p className="text-xs text-slate-600 mt-1">Try broadening your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map(loc => {
            const isSelected = selectedLocationId === loc.id;
            const still = loc.establishingUri || "/assets/stills/dubai_dance.jpg";

            return (
              <div
                key={loc.id}
                className={`group relative bg-[#0C1019] border rounded-2xl overflow-hidden transition-all flex flex-col ${
                  isSelected
                    ? "border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Establishing Still */}
                <div className="relative aspect-[16/9] w-full bg-[#07090E] overflow-hidden">
                  <img
                    src={still}
                    alt={loc.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1019] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/20 uppercase tracking-wider">
                      <MapPin className="w-3 h-3" />
                      Set Lock
                    </span>

                    {loc.timeOfDay && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10 capitalize">
                        {loc.timeOfDay.includes("night") || loc.timeOfDay.includes("dusk") ? (
                          <Moon className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <Sun className="w-3 h-3 text-amber-400" />
                        )}
                        {loc.timeOfDay.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-[#07090E] text-[10px] font-black uppercase tracking-wider">
                      ✓ Active Set
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                        {loc.displayName}
                      </h3>
                      {loc.era && (
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          {loc.era}
                        </span>
                      )}
                    </div>

                    {/* Verbatim Environment Block Snippet */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/80">
                          Verbatim Environment Block
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(loc)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === loc.id ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed">
                        "{loc.environmentBlock}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingLocation(loc)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Set Specs</span>
                    </button>

                    {isSelectionMode && onSelectLocation && (
                      <button
                        type="button"
                        onClick={() => onSelectLocation(loc)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-amber-500 text-[#07090E]"
                            : "bg-white/10 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300"
                        }`}
                      >
                        {isSelected ? "Set Selected ✓" : "Use Location"}
                      </button>
                    )}

                    {!isSelectionMode && (
                      <Link
                        href={`/?location=${loc.id}#prompt-bar`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Set in Reel</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Location Modal */}
      {inspectingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0C1019] border border-white/20 rounded-3xl max-w-xl w-full p-6 relative shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setInspectingLocation(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-black text-white mb-2">{inspectingLocation.displayName}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold uppercase">
                {inspectingLocation.era || "contemporary"}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 capitalize">
                {inspectingLocation.timeOfDay?.replace("_", " ") || "ambient"}
              </span>
            </div>

            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
              <img
                src={inspectingLocation.establishingUri || "/assets/stills/dubai_dance.jpg"}
                alt={inspectingLocation.displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center justify-between">
                <span>Verbatim Physical Set Contract</span>
                <button
                  type="button"
                  onClick={() => handleCopy(inspectingLocation)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-normal"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === inspectingLocation.id ? "Copied!" : "Copy"}</span>
                </button>
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                {inspectingLocation.environmentBlock}
              </p>
            </div>

            {isSelectionMode && onSelectLocation && (
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(inspectingLocation);
                  setInspectingLocation(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 text-[#07090E] font-black text-sm hover:bg-amber-400 transition-all"
              >
                Set as Active Location for Production
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
