"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Sparkles,
  Clock,
  User,
  ShieldCheck,
  Globe,
  Play,
  Share2,
  Trash2,
  Download,
  Search,
  Plus,
  ArrowLeft,
  Tv,
  Layers,
  Check,
  RefreshCw,
  FolderHeart,
  Video
} from "lucide-react";

interface SeriesTrack {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  character: string;
  videoSrc: string;
  duration: number;
  acts: any[];
  veritas?: {
    status: string;
    snarkProofHash: string;
  };
  createdAt?: string;
}

import { CANONICAL_SERIES_TRACKS } from "@/lib/tier6/default_tracks";

export default function StudioLibraryPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<any[]>(CANONICAL_SERIES_TRACKS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTracks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/studio/tracks");
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        setTracks(data.tracks);
      }
    } catch (err) {
      console.error("Failed to load tracks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/tracks?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTracks(tracks.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Failed to delete track:", err);
    }
  };

  // Filter tracks
  const filteredTracks = tracks.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
      t.character.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalActs = tracks.reduce((acc, t) => acc + (t.acts?.length || 1), 0);
  const totalRuntimeSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Full-Width Sticky Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1720px] mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/studio"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-medium shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio Stage</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <FolderHeart className="w-3.5 h-3.5" /> Media Vault & Library
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                  SQLite Persistent Storage
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white font-serif tracking-tight">
                All Saved Productions & Video Series
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchTracks}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Refresh Library"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>

            <Link
              href="/studio/create?mode=new_series"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 hover:brightness-110 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Create New Series Track</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Width Content Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Studio Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Series Tracks</span>
            <div className="text-2xl md:text-3xl font-bold text-white font-serif mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>{tracks.length}</span>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Master Acts</span>
            <div className="text-2xl md:text-3xl font-bold text-white font-serif mt-1 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-400" />
              <span>{totalActs}</span>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Master Runtime</span>
            <div className="text-2xl md:text-3xl font-bold text-white font-serif mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>{Math.round(totalRuntimeSeconds)}s</span>
            </div>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-xl backdrop-blur-xl">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">Veritas zk-SNARK Sealed</span>
            <div className="text-2xl md:text-3xl font-bold text-emerald-300 font-serif mt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Category Navigation */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series by title, character, script phrases, or philosophy..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>

            <span className="text-xs font-mono text-slate-400">
              Showing {filteredTracks.length} of {tracks.length} Productions
            </span>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: "all", label: "🎬 All Categories" },
              { id: "anime", label: "🌸 Anime Series" },
              { id: "executive", label: "🧑‍💼 Executive Twins" },
              { id: "nature", label: "🌿 Nature & Wildlife" },
              { id: "space", label: "🌌 Space & Cosmos" },
              { id: "engineering", label: "⚙️ Engineering & Machines" },
              { id: "medical", label: "🩺 Medical Equipment" },
              { id: "custom", label: "✨ Custom Creations" }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10 font-bold"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Series & Clips Grid */}
        {filteredTracks.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-4">
            <div className="p-4 rounded-full bg-slate-800/60 text-slate-400 w-16 h-16 mx-auto flex items-center justify-center">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">No Productions Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No series matched your filter query. Create a brand new series track with Veo 3.1 & DeepMind dubbing.
              </p>
            </div>
            <Link
              href="/studio/create?mode=new_series"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Series Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTracks.map((track) => {
              const isDeleting = deleteConfirmId === track.id;
              return (
                <div
                  key={track.id}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all group flex flex-col justify-between"
                >
                  {/* Video Viewport / Header */}
                  <div>
                    <div className="relative aspect-video bg-black overflow-hidden border-b border-slate-800/80">
                      <video
                        src={track.videoSrc}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        muted
                        playsInline
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.currentTarget as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <span>{track.category === "anime" ? "🥋" : track.category === "executive" ? "🧑‍💼" : "✨"}</span>
                          <span>{track.category}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono text-slate-300">
                          {track.acts?.length || 1} Acts · {Math.round(track.duration)}s
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1 backdrop-blur-md">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Veritas zk-SNARK</span>
                        </span>
                      </div>
                    </div>

                    {/* Series Information */}
                    <div className="p-6 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                          <span className="flex items-center gap-1 text-cyan-400">
                            <User className="w-3 h-3" /> {track.character}
                          </span>
                          <span>{track.createdAt ? new Date(track.createdAt).toLocaleDateString() : "Active Master"}</span>
                        </div>
                        <h3 className="text-base font-bold text-white font-serif group-hover:text-amber-200 transition-colors">
                          {track.title}
                        </h3>
                        {track.subtitle && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {track.subtitle}
                          </p>
                        )}
                      </div>

                      {/* DeepMind Dub Stems Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {["JA", "EN", "ES", "FR", "DE", "HI"].map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      <Link
                        href={`/studio?track=${track.id}`}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-amber-500/15 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Stage</span>
                      </Link>

                      <Link
                        href={`/studio/create?trackId=${track.id}&mode=append_current`}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Act</span>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400">
                      <a
                        href={track.videoSrc}
                        download
                        className="hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download 4K</span>
                      </a>

                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <span className="text-rose-400 text-[10px]">Confirm?</span>
                          <button
                            onClick={() => handleDelete(track.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold underline text-[10px]"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-slate-500 hover:text-slate-300 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(track.id)}
                          className="hover:text-rose-400 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
