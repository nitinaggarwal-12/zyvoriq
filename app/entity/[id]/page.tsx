"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function UniversalEntityInspectorPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [item, setItem] = useState<StudioEntityRecord | null>(null);
  const [children, setChildren] = useState<StudioEntityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/registry?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.item) {
          setItem(data.item);
          setChildren(data.children || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const copyCanonicalUrl = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#06080D] text-slate-100 p-8 text-center font-mono text-sm">
        Resolving Entity ID <b className="text-emerald-300">{id}</b> from SQLite database...
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#06080D] text-slate-100 p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-white">Entity {id} Not Found in Database</h1>
        <Link
          href="/registry"
          className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Open Master Entity Registry (/registry) →
        </Link>
      </main>
    );
  }

  let parsedMeta: Record<string, unknown> = {};
  try {
    parsedMeta = JSON.parse(item.metadata_json || "{}");
  } catch {
    parsedMeta = {};
  }

  const isVideo = Boolean(item.media_src && item.media_src.endsWith(".mp4"));
  const isImage = Boolean(item.media_src && item.media_src.endsWith(".jpg"));

  return (
    <main className="min-h-screen bg-[#06080D] text-slate-100 w-full px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/40 font-mono text-xs font-bold text-emerald-300">
                {item.id}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 font-mono text-xs uppercase text-amber-300">
                TYPE: {item.entity_type}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5">
              {item.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyCanonicalUrl}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 font-mono text-xs text-emerald-300 font-semibold"
            >
              {copied ? "✅ Copied Unique URL!" : `🔗 Copy URL (${item.canonical_url})`}
            </button>
            <Link
              href="/registry"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white"
            >
              🗄️ Full Database Table (/registry)
            </Link>
            <Link
              href="/swarm"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
            >
              🎬 Open in Director Studio (/swarm)
            </Link>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Media Preview if available */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0D111A] border border-white/10 p-4 flex flex-col items-center justify-center">
            {isVideo && item.media_src ? (
              <video
                src={item.media_src}
                controls
                playsInline
                className="w-full max-h-[480px] rounded-xl object-contain bg-black"
              />
            ) : isImage && item.media_src ? (
              <img
                src={item.media_src}
                alt={item.title}
                className="w-full max-h-[480px] rounded-xl object-contain bg-black"
              />
            ) : (
              <div className="py-20 text-center space-y-2">
                <div className="font-mono text-2xl font-bold text-amber-300">
                  {item.id}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  Relational {item.entity_type} Record
                </div>
              </div>
            )}
          </div>

          {/* Right: SQLite Database Row & Metadata */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-[#0D111A] border border-white/10 p-5 space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                SQLite Database Record (Table: studio_entities)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                  <div className="text-slate-500">PRIMARY KEY (id)</div>
                  <div className="text-emerald-300 font-bold mt-0.5">{item.id}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                  <div className="text-slate-500">CANONICAL URL</div>
                  <div className="text-amber-300 font-bold mt-0.5">
                    {item.canonical_url}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                  <div className="text-slate-500">SLUG</div>
                  <div className="text-white mt-0.5">{item.slug}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
                  <div className="text-slate-500">PARENT ENTITY ID</div>
                  <div className="text-white mt-0.5">
                    {item.parent_id ? (
                      <Link
                        href={`/entity/${item.parent_id}`}
                        className="text-emerald-400 underline"
                      >
                        {item.parent_id}
                      </Link>
                    ) : (
                      "ROOT ENTITY"
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-1">
                  STRUCTURED METADATA JSON
                </div>
                <pre className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-emerald-200 overflow-x-auto">
                  {JSON.stringify(parsedMeta, null, 2)}
                </pre>
              </div>
            </div>

            {/* Linked Child Entities */}
            {children.length > 0 && (
              <div className="rounded-2xl bg-[#0D111A] border border-white/10 p-5 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  Linked Child Entities ({children.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.canonical_url}
                      className="p-3 rounded-xl bg-black/50 hover:bg-white/5 border border-white/10 transition block"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-emerald-300 font-bold">{child.id}</span>
                        <span className="text-amber-300 uppercase">
                          {child.entity_type}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1 truncate">
                        {child.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
