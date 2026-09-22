"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Film,
  FolderOpen,
  Layers3,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";

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

export function CreatorHomeV2() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [locationCount, setLocationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects?limit=8").then((r) => r.json()),
      fetch("/api/library/characters").then((r) => r.json()),
      fetch("/api/library/locations").then((r) => r.json()),
    ])
      .then(([projectData, peopleData, locationData]) => {
        setProjects(Array.isArray(projectData?.projects) ? projectData.projects : []);
        setPeopleCount(Array.isArray(peopleData?.characters) ? peopleData.characters.length : 0);
        setLocationCount(Array.isArray(locationData?.locations) ? locationData.locations.length : 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const recent = useMemo(
    () =>
      [...projects]
        .sort(
          (a, b) =>
            Date.parse(b.updatedAt || b.createdAt || "0") -
            Date.parse(a.updatedAt || a.createdAt || "0")
        )
        .slice(0, 4),
    [projects]
  );

  const running = projects.filter((project) => project.status === "running").length;
  const ready = projects.filter(
    (project) => project.status === "completed" || project.status === "published"
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <section className="mx-auto max-w-[1500px] px-5 pb-16 pt-9 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">Home</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Your creative workspace
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Continue active work, manage reusable assets, or start a new project.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Projects", value: projects.length, icon: FolderOpen, href: "/my-reels" },
            { label: "In production", value: running, icon: Sparkles, href: "/my-reels" },
            { label: "Ready", value: ready, icon: Film, href: "/my-reels" },
            { label: "Reusable assets", value: peopleCount + locationCount, icon: Layers3, href: "/assets" },
          ].map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight">
                {loading ? "—" : value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Continue working</h2>
            <p className="mt-1 text-sm text-slate-500">
              Reopen exactly where you left off.
            </p>
          </div>
          <Link
            href="/my-reels"
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            All projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-violet-500" />
            <h3 className="mt-4 font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start a project and it will appear here automatically.
            </p>
            <Link href="/create" className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              Create first project
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recent.map((project) => (
              <Link
                key={project.id}
                href={`/swarm?project=${encodeURIComponent(project.id)}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-video bg-slate-950">
                  {project.combinedSrc ? (
                    <video
                      src={project.combinedSrc}
                      preload="metadata"
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      <Film className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="truncate font-semibold">
                    {project.titleDraft || project.title || "Untitled project"}
                  </div>
                  <div className="mt-1 text-sm capitalize text-slate-500">
                    {project.format || "reel"} · {project.stage || "brief"}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleString()
                      : "Saved project"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Link
            href="/assets?tab=people"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <UserRound className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">People</h3>
            <p className="mt-1 text-sm text-slate-500">
              {peopleCount} reusable cast {peopleCount === 1 ? "asset" : "assets"} with wardrobe and references.
            </p>
          </Link>

          <Link
            href="/assets?tab=locations"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <MapPin className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-600" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Locations</h3>
            <p className="mt-1 text-sm text-slate-500">
              {locationCount} reusable {locationCount === 1 ? "environment" : "environments"} ready for scenes.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
