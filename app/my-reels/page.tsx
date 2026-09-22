"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Film, FolderOpen, Plus, Search, Trash2 } from "lucide-react";

interface Project {
  id: string;
  title?: string;
  titleDraft?: string;
  format?: string;
  stage?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  combinedSrc?: string;
  progress?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects?limit=200");
      const data = await res.json();
      setProjects(Array.isArray(data?.projects) ? data.projects : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((project) => {
        if (!q) return true;
        return `${project.title || project.titleDraft || ""} ${project.format || ""} ${project.stage || ""} ${project.status || ""}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => Date.parse(b.updatedAt || b.createdAt || "0") - Date.parse(a.updatedAt || a.createdAt || "0"));
  }, [projects, query]);

  async function removeProject(id: string) {
    if (!window.confirm("Delete this project and its saved versions?")) return;
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) setProjects((current) => current.filter((project) => project.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">Projects</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Your creative work</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Every draft, generation, review, and published project in one place.
            </p>
          </div>
          <Link href="/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            <Plus className="h-4 w-4" /> New project
          </Link>
        </div>

        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0,1,2].map((i) => <div key={i} className="h-[330px] animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FolderOpen className="mx-auto h-9 w-9 text-violet-500" />
            <h2 className="mt-4 text-lg font-semibold">No projects yet</h2>
            <p className="mt-2 text-sm text-slate-500">Start with a brief and Zyvoriq will save the project immediately.</p>
            <Link href="/create" className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Create a project</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => {
              const name = project.titleDraft || project.title || "Untitled project";
              const ready = project.status === "completed" || project.status === "published";
              return (
                <article key={project.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="aspect-video bg-slate-950">
                    {project.combinedSrc ? (
                      <video src={project.combinedSrc} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500"><Film className="h-9 w-9" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{name}</h2>
                        <p className="mt-1 text-sm capitalize text-slate-500">{project.format || "reel"} · {project.stage || "brief"}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ready ? "bg-emerald-50 text-emerald-700" : project.status === "running" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {project.status || "draft"}
                      </span>
                    </div>
                    {project.status === "running" && (
                      <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-600" style={{ width: `${Math.max(4, project.progress || 0)}%` }} /></div>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : "Saved project"}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Link href={`/swarm?project=${encodeURIComponent(project.id)}`} className="flex-1 rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700">
                        Continue
                      </Link>
                      <button onClick={() => removeProject(project.id)} className="rounded-xl border border-slate-200 px-3.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Delete project">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
