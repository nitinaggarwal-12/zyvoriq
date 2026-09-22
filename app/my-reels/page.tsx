"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Film, FolderOpen, Play, Plus, Search, SlidersHorizontal } from "lucide-react";

interface LibraryAssetItem {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  subtitle: string;
  assetType: "combined_master" | "act_master" | "turn_segment" | "baked_custom" | "face_anchor";
  genre: string;
  durationSec: number;
  src: string;
  createdAt: string;
}

interface ProjectCard {
  id: string;
  title: string;
  genre: string;
  createdAt: string;
  master?: LibraryAssetItem;
  assets: LibraryAssetItem[];
}

export default function ProjectsPage() {
  const [items, setItems] = useState<LibraryAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/swarm/library")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const projects = useMemo<ProjectCard[]>(() => {
    const grouped = new Map<string, LibraryAssetItem[]>();
    items.forEach((item) => {
      const id = item.projectId || "untitled";
      grouped.set(id, [...(grouped.get(id) || []), item]);
    });

    return Array.from(grouped.entries())
      .map(([id, assets]) => {
        const master = assets.find((a) => a.assetType === "combined_master") || assets[0];
        return {
          id,
          title: master?.projectTitle || master?.title || "Untitled project",
          genre: master?.genre || "Video",
          createdAt: master?.createdAt || "",
          master,
          assets,
        };
      })
      .filter((project) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return `${project.title} ${project.genre}`.toLowerCase().includes(q);
      })
      .sort((a, b) => Date.parse(b.createdAt || "0") - Date.parse(a.createdAt || "0"));
  }, [items, query]);

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">Projects</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Your creative work</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Pick up where you left off, review finished videos, or start something new.
            </p>
          </div>
          <Link
            href="/swarm"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No projects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first video and it will appear here automatically.
            </p>
            <Link href="/swarm" className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              Create a project
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative aspect-video bg-slate-950">
                  {project.master?.src ? (
                    <video src={project.master.src} preload="metadata" className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400"><Film className="h-8 w-8" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <Link
                    href={project.master?.src || "/swarm"}
                    className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </Link>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-slate-900">{project.title}</h2>
                      <p className="mt-1 truncate text-sm text-slate-500">{project.genre}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Ready</span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Film className="h-3.5 w-3.5" />{project.assets.length} assets</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{project.master?.durationSec || 60}s</span>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/swarm?project=${encodeURIComponent(project.id)}`}
                      className="flex-1 rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Open studio
                    </Link>
                    {project.master?.src && (
                      <a
                        href={project.master.src}
                        className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
