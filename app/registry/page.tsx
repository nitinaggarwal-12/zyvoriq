"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface StudioEntityRecord {
  id: string;
  entity_type: string;
  slug: string;
  canonical_url: string;
  title: string;
  subtitle: string;
  parent_id: string | null;
  media_src: string | null;
  metadata_json: string;
  created_at: string;
}

const ENTITY_TYPES = [
  { key: "all", label: "All Objects" },
  { key: "page", label: "Pages" },
  { key: "reel", label: "Reels" },
  { key: "clip", label: "Clips" },
  { key: "cast", label: "Cast & Characters" },
  { key: "wardrobe", label: "Wardrobes & Attires" },
  { key: "location", label: "Locations" },
  { key: "set", label: "Sets" },
  { key: "direction_style", label: "Direction Styles" },
];

export default function EntityRegistryDatabasePage() {
  const [items, setItems] = useState<StudioEntityRecord[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Add New Entity Form
  const [newType, setNewType] = useState<string>("clip");
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSubtitle, setNewSubtitle] = useState<string>("");

  const fetchEntities = async (type = selectedType, q = searchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/registry?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (data?.ok) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities(selectedType, searchQuery);
  }, [selectedType, searchQuery]);

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity_type: newType,
        title: newTitle,
        subtitle: newSubtitle,
      }),
    });
    setNewTitle("");
    setNewSubtitle("");
    fetchEntities(selectedType, searchQuery);
  };

  return (
    <main className="min-h-screen bg-[#06080D] text-slate-100 w-full px-4 md:px-6 py-5">
      <div className="w-full space-y-5">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/40 font-mono text-xs font-bold text-emerald-300">
                ZYV-PAGE-REGDB003
              </span>
              <span className="text-xs font-mono text-amber-300">
                SQLITE TABLE: data/studio_entities.db (studio_entities)
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1">
              Master Entity & Unique URL Database Registry ({items.length} Records)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Every Page, Reel, Clip, Cast, Wardrobe, Location, Set, and Direction Style is assigned a unique alphanumeric ID and unique canonical URL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/library"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white"
            >
              📚 Asset Vault (/library)
            </Link>
            <Link
              href="/swarm"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
            >
              🎬 Director Studio (/swarm)
            </Link>
          </div>
        </header>

        {/* Quick Register New Database Entity Bar */}
        <form
          onSubmit={handleCreateEntity}
          className="rounded-2xl bg-[#0D111A] border border-white/10 p-3.5 flex flex-wrap items-end gap-2.5"
        >
          <div className="w-40">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Object Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/15 text-xs text-white"
            >
              {ENTITY_TYPES.filter((t) => t.key !== "all").map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Entity Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Zermatt Glacier Sunset Stage Set"
              className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-xs text-white"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Subtitle / Description
            </label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Optional description or technical spec"
              className="w-full px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs"
          >
            ＋ Mint Alphanumeric ID & URL
          </button>
        </form>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {ENTITY_TYPES.map((t) => {
              const active = selectedType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    active
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                      : "bg-[#0D111A] border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Filter by ID (ZYV-...), URL, or Title..."
            className="w-72 px-3 py-1.5 rounded-xl bg-[#0D111A] border border-white/15 text-xs text-white font-mono"
          />
        </div>

        {/* Relational SQLite Table */}
        <div className="rounded-2xl bg-[#0D111A] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-black/60 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase">
                  <th className="py-3 px-4">Alphanumeric ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Title & Subtitle</th>
                  <th className="py-3 px-4">Unique Canonical URL</th>
                  <th className="py-3 px-4">Parent ID</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                      Loading SQLite database rows...
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-300 whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-amber-300 whitespace-nowrap">
                        {row.entity_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{row.title}</div>
                        <div className="text-[11px] text-slate-400">{row.subtitle}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sky-300 whitespace-nowrap">
                        <Link href={row.canonical_url} className="hover:underline">
                          {row.canonical_url}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {row.parent_id ? (
                          <Link
                            href={`/entity/${row.parent_id}`}
                            className="text-emerald-400 hover:underline"
                          >
                            {row.parent_id}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={row.canonical_url}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold"
                        >
                          Open URL →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
