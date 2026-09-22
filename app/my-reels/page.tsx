"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  InlineClipTrimmer,
  MultiClipSplicerWorkbench,
  QueuedSpliceSegment,
} from "@/components/InstantSubClipSplicer";

interface LibraryAssetItem {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  assetType:
    | "combined_master"
    | "act_master"
    | "turn_segment"
    | "baked_custom"
    | "face_anchor";
  genre: string;
  durationSec: number;
  frames: number;
  fps: string;
  audioSpec: string;
  partIndex?: 1 | 2;
  speedMultiplier?: number;
  wardrobe: string;
  location: string;
  promptSummary: string;
  src: string;
  createdAt: string;
}

interface ParentProjectGroup {
  projectId: string;
  mainReel: LibraryAssetItem;
  childActReels: LibraryAssetItem[];
  childClips: LibraryAssetItem[];
  allChildren: LibraryAssetItem[];
}

function mapAssetToEntityId(assetId: string): string {
  const map: Record<string, string> = {
    masterB_v2_combined_60s: "ZYV-REEL-MBV260S1",
    masterB_v2_act1_30s: "ZYV-CLIP-ACT130S1",
    masterB_v2_act2_30s: "ZYV-CLIP-ACT230S2",
    masterB_v2_act1_turnA_10s: "ZYV-CLIP-TRN1A10S",
    masterB_v2_act1_turnB_20s: "ZYV-CLIP-TRN1B20S",
    masterB_v2_act2_turnA_10s: "ZYV-CLIP-TRN2A10S",
    masterB_v2_act2_turnB_20s: "ZYV-CLIP-TRN2B20s",
    masterB_v2_face_identity_anchor: "ZYV-CAST-HEROFACE",
  };
  if (map[assetId]) return map[assetId];
  const clean = assetId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let hash = 0;
  for (let i = 0; i < assetId.length; i++) {
    hash = (hash * 31 + assetId.charCodeAt(i)) >>> 0;
  }
  const tag = hash.toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `ZYV-CLIP-${clean.slice(0, 4)}${tag}`;
}

export default function UnifiedSwarmLibraryPage() {
  const [items, setItems] = useState<LibraryAssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});
  const [spliceQueue, setSpliceQueue] = useState<QueuedSpliceSegment[]>([]);

  useEffect(() => {
    fetch("/api/swarm/library")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group all assets under their parent Combined Reel
  const groupedProjects = useMemo<ParentProjectGroup[]>(() => {
    const groupsMap = new Map<string, LibraryAssetItem[]>();
    for (const item of items) {
      const pid = item.projectId || "proj_master_b_v2";
      if (!groupsMap.has(pid)) groupsMap.set(pid, []);
      groupsMap.get(pid)!.push(item);
    }

    const result: ParentProjectGroup[] = [];
    for (const [projectId, list] of groupsMap.entries()) {
      const mainReel =
        list.find((a) => a.assetType === "combined_master") || list[0];
      const children = list.filter((a) => a.id !== mainReel.id);
      const childActReels = children.filter((a) => a.assetType === "act_master");
      const childClips = children.filter((a) => a.assetType !== "act_master");

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const combinedText = list
          .map((x) => `${x.title} ${x.promptSummary} ${x.wardrobe} ${x.location} ${mapAssetToEntityId(x.id)}`)
          .join(" ")
          .toLowerCase();
        if (!combinedText.includes(q)) continue;
      }

      result.push({
        projectId,
        mainReel,
        childActReels,
        childClips,
        allChildren: children,
      });
    }
    return result;
  }, [items, searchQuery]);

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjectIds((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900 w-full px-4 md:px-6 py-6">
      <div className="w-full space-y-5">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/40 font-mono text-xs font-bold text-emerald-300">
                ZYV-PAGE-LIBRY002
              </span>
              <span className="text-xs font-mono text-amber-300">
                HIERARCHICAL REEL LIBRARY • CLICK MAIN REEL TO EXPAND CHILD REELS & CLIPS
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              My Swarm Reels Library ({groupedProjects.length} Main Reels • {items.length} Total Objects)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              By default only the Main Combined Reel + Prompt & Inputs are shown. Click any Combined Reel card to expand all its child Act Reels & Clips.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search ID, prompt, wardrobe, location..."
              className="w-64 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono"
            />
            <Link
              href="/registry"
              className="px-3.5 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 font-mono text-xs font-bold text-amber-200"
            >
              🗄️ SQLite DB Registry (/registry)
            </Link>
            <Link
              href="/swarm"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
            >
              🎬 Open Director Studio (/swarm)
            </Link>
          </div>
        </header>

        {/* Hierarchical Parent Combined Reels List */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm text-slate-500">
            Loading Hierarchical Swarm Reels...
          </div>
        ) : (
          <div className="space-y-6">
            {groupedProjects.map((group) => {
              const { mainReel, allChildren } = group;
              const isExpanded = Boolean(expandedProjectIds[group.projectId]);
              const mainEntityId = mapAssetToEntityId(mainReel.id);
              const mainCanonicalUrl = `/entity/${mainEntityId}`;

              return (
                <section
                  key={group.projectId}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xl transition"
                >
                  {/* =========================================================
                      DEFAULT VISIBLE CARD: MAIN COMBINED REEL + PROMPT & INPUTS
                     ========================================================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 items-start">
                    {/* Left Column (4 cols): Main Combined Reel Player */}
                    <div className="lg:col-span-4">
                      <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200 aspect-[9/16] max-h-[440px] w-full flex items-center justify-center">
                        <video
                          src={mainReel.src}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                        <Link
                          href={mainCanonicalUrl}
                          className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 border border-emerald-400/50 font-mono text-[10px] font-bold text-emerald-300"
                        >
                          {mainEntityId}
                        </Link>
                        <span className="pointer-events-none absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/85 border border-slate-200 font-mono text-[10px] text-amber-300">
                          {mainReel.durationSec.toFixed(1)}s • {mainReel.frames}f
                        </span>
                      </div>
                    </div>

                    {/* Right Column (8 cols): Prompt, Inputs, Metadata & Expand Trigger */}
                    <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 font-mono text-xs font-bold text-amber-300">
                              MAIN COMBINED REEL
                            </span>
                            <span className="font-mono text-xs text-emerald-300">
                              {mainReel.genre} • {mainReel.fps} • {mainReel.audioSpec}
                            </span>
                          </div>
                          <Link
                            href={mainCanonicalUrl}
                            className="font-mono text-xs text-sky-300 hover:underline"
                          >
                            Unique URL: {mainCanonicalUrl} →
                          </Link>
                        </div>

                        <h2 className="text-lg md:text-xl font-bold text-slate-900">
                          {mainReel.title}
                        </h2>
                        <p className="text-xs text-slate-700">{mainReel.subtitle}</p>

                        {/* Prompt & Input Parameters Card */}
                        <div className="rounded-xl bg-black/55 border border-slate-200 p-4 space-y-2.5 text-xs">
                          <div className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                            Prompt & Input Parameters
                          </div>
                          <p className="text-slate-800 leading-relaxed">
                            {mainReel.promptSummary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                            <div>
                              <span className="text-slate-500">Wardrobe / Attire: </span>
                              <span className="text-amber-200 font-medium">
                                {mainReel.wardrobe}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Shooting Locations: </span>
                              <span className="text-emerald-200 font-medium">
                                {mainReel.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Bar + CLICK TO EXPAND CHILD REELS & CLIPS */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => toggleProjectExpand(group.projectId)}
                          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 border ${
                            isExpanded
                              ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg"
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/50 text-emerald-200"
                          }`}
                        >
                          <span>
                            {isExpanded
                              ? `▲ Hide Child Reels & Clips (${allChildren.length})`
                              : `▼ Click to Expand Child Reels & Clips (${allChildren.length} items)`}
                          </span>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/swarm?edit=${mainEntityId}`}
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-900"
                          >
                            🎬 Edit in Studio (/swarm)
                          </Link>
                          <Link
                            href={`/swarm-MUI?edit=${mainEntityId}`}
                            className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-semibold text-sky-200"
                          >
                            🎨 Edit in M3 Studio (/swarm-MUI)
                          </Link>
                          <a
                            href={mainReel.src}
                            download={`${mainEntityId}.mp4`}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
                          >
                            ⬇ Download Main MP4
                          </a>
                        </div>
                      </div>

                      {/* INSTANT SUB-CLIP TRIMMER FOR MAIN COMBINED REEL */}
                      <InlineClipTrimmer
                        clipId={mainEntityId}
                        label={mainReel.title}
                        src={mainReel.src}
                        maxDurationSec={mainReel.durationSec || 60}
                        onAddToQueue={(seg) => setSpliceQueue((prev) => [...prev, seg])}
                      />
                    </div>
                  </div>

                  {/* MULTI-CLIP & CHILD-CLIP CUSTOM REEL SPLICER WORKBENCH */}
                  <div className="px-5 pb-4">
                    <MultiClipSplicerWorkbench
                      availableSources={[
                        {
                          clipId: mainEntityId,
                          label: mainReel.title,
                          src: mainReel.src,
                          maxDurationSec: mainReel.durationSec || 60,
                        },
                        ...allChildren
                          .filter(
                            (c) =>
                              c.assetType !== "face_anchor" && !c.src.endsWith(".jpg")
                          )
                          .map((c) => ({
                            clipId: mapAssetToEntityId(c.id),
                            label: c.title,
                            src: c.src,
                            maxDurationSec: c.durationSec || 10,
                          })),
                      ]}
                      queue={spliceQueue}
                      setQueue={setSpliceQueue}
                    />
                  </div>

                  {/* =========================================================
                      EXPANDABLE DRAWER: ALL CHILD REELS (30s) & CLIPS (10s/20s)
                     ========================================================= */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-black/50 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-bold">
                          ↳ Constituent Child Act Reels & Clips ({allChildren.length} Objects under {mainEntityId})
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Every child clip has its own unique Alphanumeric ID, Canonical URL & Instant Sub-Clip Splicer
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {allChildren.map((child) => {
                          const childEntityId = mapAssetToEntityId(child.id);
                          const childUrl = `/entity/${childEntityId}`;
                          const isImg =
                            child.assetType === "face_anchor" ||
                            child.src.endsWith(".jpg");

                          return (
                            <article
                              key={child.id}
                              className="rounded-xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between"
                            >
                              <div>
                                <div className="relative aspect-[9/14] max-h-[290px] bg-black flex items-center justify-center">
                                  {isImg ? (
                                    <img
                                      src={child.src}
                                      alt={child.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={child.src}
                                      controls
                                      playsInline
                                      preload="metadata"
                                      className="w-full h-full object-contain"
                                    />
                                  )}
                                  <Link
                                    href={childUrl}
                                    className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-emerald-400/40 font-mono text-[10px] font-bold text-emerald-300"
                                  >
                                    {childEntityId}
                                  </Link>
                                  <span className="pointer-events-none absolute top-2 right-2 px-2 py-0.5 rounded bg-black/85 border border-slate-200 font-mono text-[10px] text-amber-300">
                                    {child.durationSec > 0
                                      ? `${child.durationSec.toFixed(1)}s • ${child.frames}f`
                                      : "Keyframe"}
                                  </span>
                                </div>

                                <div className="p-3 space-y-1">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {child.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 line-clamp-2">
                                    {child.subtitle}
                                  </div>
                                  <div className="pt-1 font-mono text-[10px] text-sky-300 truncate">
                                    <Link href={childUrl} className="hover:underline">
                                      {childUrl}
                                    </Link>
                                  </div>
                                </div>
                              </div>

                              <div className="px-3 pb-3 pt-1 space-y-2">
                                {!isImg && (
                                  <InlineClipTrimmer
                                    clipId={childEntityId}
                                    label={child.title}
                                    src={child.src}
                                    maxDurationSec={child.durationSec || 10}
                                    onAddToQueue={(seg) =>
                                      setSpliceQueue((prev) => [...prev, seg])
                                    }
                                  />
                                )}
                                <div className="flex items-center justify-between gap-2">
                                  <Link
                                    href={childUrl}
                                    className="flex-1 text-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 font-mono text-[11px] text-emerald-300"
                                  >
                                    Inspect ID →
                                  </Link>
                                  <a
                                    href={child.src}
                                    download={`${childEntityId}${isImg ? ".jpg" : ".mp4"}`}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-900"
                                  >
                                    ⬇
                                  </a>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
