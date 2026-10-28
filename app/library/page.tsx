"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Film,
  FolderOpen,
  Play,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { FeedbackHeaderEmailButton } from "@/components/UniversalFeedbackSystem";

interface LibraryItem {
  id: string;
  canonicalId: string;
  canonicalUrl: string;
  studioUrl: string;
  title: string;
  subtitle?: string;
  genre?: string;
  durationSec?: number;
  durationSeconds?: number;
  durationLabel?: string;
  aspectRatio?: string;
  fps?: string;
  audioSpec?: string;
  src?: string;
  videoUrl?: string;
  posterSrc?: string;
  promptSummary?: string;
  createdAt?: string;
}

export default function CanonicalLibraryVaultPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState<"all" | "300" | "60">("all");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/library")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const raw: Array<LibraryItem & { assetType?: string }> = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.assets)
          ? data.assets
          : [];
        const reelMastersOnly = raw.filter((it) => {
          const cid = String(it.canonicalId || it.id || "").toUpperCase();
          return (
            !cid.startsWith("ZYV-ACT-") &&
            it.assetType !== "act_master" &&
            it.assetType !== "turn_segment"
          );
        });
        setItems(reelMastersOnly);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const dur = Number(item.durationSec || item.durationSeconds || 60);
      if (durationFilter === "300" && dur < 180) return false;
      if (durationFilter === "60" && dur >= 180) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const hay = `${item.canonicalId || ""} ${item.title || ""} ${item.subtitle || ""} ${item.genre || ""} ${item.promptSummary || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, durationFilter]);

  return (
    <div
      data-testid="canonical-library-vault-page"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col w-full max-w-none"
    >
      {/* Sticky Executive Light Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 w-full px-[clamp(16px,1.8vw,28px)] py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/swarm-MUI"
            data-testid="library-back-to-studio-link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Google Stitch Studio</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs font-bold">
              <FolderOpen className="w-3.5 h-3.5" />
              CANONICAL VAULT
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Zyvoriq Canonical Production Library ({filteredItems.length} Masters)
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/personas"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Personas &amp; Wardrobe</span>
          </Link>
          <Link
            href="/swarm-MUI"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Synthesize New Reel</span>
          </Link>
          <FeedbackHeaderEmailButton
            appId="zyvoriq"
            appName="Zyvoriq Canonical Library Vault"
            currentRoute="/library"
          />
        </div>
      </header>

      {/* Main 100% Fluid Content Area (Rule 25G) */}
      <main className="flex-1 w-full max-w-none px-[clamp(16px,1.8vw,28px)] py-5 space-y-5">
        {/* 1-Row Search & Duration Filter Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="library-page-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Canonical ID (ZYV-REEL-...), title, cast, or genre…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-2 focus:outline-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: `All Masters (${items.length})` },
              { id: "300", label: "5-Min (300s · 10 Acts)" },
              { id: "60", label: "60s Reels (6 Acts)" },
            ].map((tab) => {
              const active = durationFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDurationFilter(tab.id as "all" | "300" | "60")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
            Loading Canonical Production Library…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              No canonical productions match &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDurationFilter("all");
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            data-testid="library-page-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredItems.map((item) => {
              const cid = item.canonicalId || item.id;
              const dur = Number(item.durationSec || item.durationSeconds || 60);
              const videoSrc = item.src || item.videoUrl || "";
              const entityHref = item.canonicalUrl || `/entity/${cid}`;
              const studioHref = item.studioUrl || `/swarm-MUI?reel=${encodeURIComponent(cid)}`;
              return (
                <article
                  key={cid}
                  data-testid={`library-vault-card-${cid}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div>
                    <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex items-center justify-center">
                      {videoSrc ? (
                        <video
                          src={`${videoSrc}#t=2`}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Film className="w-8 h-8 text-slate-600" />
                      )}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white font-mono text-[11px] font-bold border border-slate-700">
                          {cid}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-600/95 text-white font-mono text-[11px] font-bold">
                          {dur >= 300 ? "300.0s (5-Min · 10 Acts)" : `${dur}.0s Master`}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-indigo-700">
                        <span>{item.genre || "35mm Cinema Master"}</span>
                        <span className="font-mono text-slate-500">
                          {item.fps || "24/1 CFR"} · {item.aspectRatio || "9:16 & 16:9"}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h2>
                      {item.subtitle && (
                        <p className="text-xs font-medium text-slate-600 leading-snug">
                          {item.subtitle}
                        </p>
                      )}
                      {item.promptSummary && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.promptSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                    <Link
                      href={studioHref}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Open in Studio</span>
                    </Link>
                    <Link
                      href={entityHref}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-mono font-semibold transition-colors"
                    >
                      <span>{entityHref}</span>
                      <ExternalLink className="w-3 h-3 text-indigo-600" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
