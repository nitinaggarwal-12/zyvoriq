"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Film,
  FolderOpen,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

interface CharacterOption {
  id: string;
  displayName: string;
  archetype: string;
}

interface LocationOption {
  id: string;
  displayName: string;
}

interface Idea {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  tagline: string;
  act1Prompt: string;
  act2Prompt: string;
}

interface Job {
  id: string;
  title: string;
  genre?: string;
  bpm?: number;
  act1Prompt?: string;
  act2Prompt?: string;
  selectedCharacterId?: string;
  selectedCharacterName?: string;
  selectedLocationId?: string;
  selectedLocationName?: string;
  status: "queued" | "running" | "completed" | "error";
  progress: number;
  stageLabel: string;
  combinedSrc?: string;
  part1Src?: string;
  part2Src?: string;
  act1Src?: string;
  act2Src?: string;
  errorMsg?: string;
}

const COUNTRIES = ["India", "United States", "United Kingdom", "South Korea", "Spain", "Brazil", "Japan", "Nigeria", "France", "Australia"];
const LANGUAGES = ["Hindi", "English", "Punjabi", "Spanish", "Korean (K-Pop)", "Tamil", "Telugu", "French", "Portuguese"];
const PLATFORMS = [
  "Instagram Reels (9:16 Viral)",
  "YouTube Shorts",
  "TikTok",
  "Facebook Reels",
  "YouTube Music Video",
];

export default function StudioPage() {
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("Hindi");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [brief, setBrief] = useState("Create a cinematic, emotionally engaging short-form music video with a strong hook and a memorable visual transformation.");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [title, setTitle] = useState("Untitled creative project");
  const [genre, setGenre] = useState("Cinematic Pop");
  const [bpm, setBpm] = useState(120);
  const [act1Prompt, setAct1Prompt] = useState("");
  const [act2Prompt, setAct2Prompt] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);

  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );
  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId]
  );
  const selectedIdea = useMemo(
    () => ideas.find((i) => i.id === selectedIdeaId),
    [ideas, selectedIdeaId]
  );

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/library/characters").then((r) => r.json()),
      fetch("/api/library/locations").then((r) => r.json()),
    ])
      .then(([c, l]) => {
        if (!mounted) return;
        setCharacters(Array.isArray(c?.characters) ? c.characters : []);
        setLocations(Array.isArray(l?.locations) ? l.locations : []);
      })
      .catch(() => setError("Assets could not be loaded. You can still create using prompt-only mode."))
      .finally(() => mounted && setLoadingAssets(false));

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const characterId = params.get("character");
      const locationId = params.get("location");
      const projectId = params.get("project");
      if (characterId) setSelectedCharacterId(characterId);
      if (locationId) setSelectedLocationId(locationId);
      if (projectId) {
        fetch(`/api/swarm/jobs?id=${encodeURIComponent(projectId)}`)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            const loaded = data?.job as Job | undefined;
            if (!loaded || !mounted) return;
            setJob(loaded);
            setTitle(loaded.title || "Untitled creative project");
            if (loaded.genre) setGenre(loaded.genre);
            if (typeof loaded.bpm === "number") setBpm(loaded.bpm);
            if (loaded.act1Prompt) setAct1Prompt(loaded.act1Prompt);
            if (loaded.act2Prompt) setAct2Prompt(loaded.act2Prompt);
            if (loaded.selectedCharacterId) setSelectedCharacterId(loaded.selectedCharacterId);
            if (loaded.selectedLocationId) setSelectedLocationId(loaded.selectedLocationId);
          })
          .catch(() => setError("This project could not be reopened."));
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!job || job.status !== "running") return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/swarm/jobs?id=${encodeURIComponent(job.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.job) setJob(data.job);
      } catch {
        // keep current UI state during a transient poll failure
      }
    }, 1800);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  function applyIdea(idea: Idea) {
    setSelectedIdeaId(idea.id);
    setTitle(idea.title);
    setGenre(idea.genre);
    setBpm(idea.bpm);
    setAct1Prompt(idea.act1Prompt);
    setAct2Prompt(idea.act2Prompt);
  }

  async function generateIdeas() {
    setGeneratingIdeas(true);
    setError("");
    try {
      const res = await fetch("/api/swarm/trending-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          language,
          platform,
          socialPlatform: platform,
          durationSec: 60,
          characters: selectedCharacter
            ? selectedCharacter.displayName + " — " + selectedCharacter.archetype
            : brief,
          attire: "Style appropriate to the concept and audience",
          wardrobe: "A distinct second-look transformation that preserves identity",
          demography: "Global creator audience",
          targetAudience: brief,
        }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.ideas)) throw new Error(data?.error || "Idea generation failed");
      setIdeas(data.ideas);
      if (data.ideas[0]) applyIdea(data.ideas[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Idea generation failed.");
    } finally {
      setGeneratingIdeas(false);
    }
  }

  async function launchProject() {
    if (!act1Prompt.trim() || !act2Prompt.trim()) {
      setError("Generate or write the two scene prompts before starting production.");
      return;
    }
    setLaunching(true);
    setError("");
    try {
      const res = await fetch("/api/swarm/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          genre,
          bpm,
          durationSec: 60,
          country,
          language,
          socialPlatform: platform,
          selectedCharacterId,
          selectedLocationId,
          act1Prompt,
          act2Prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.job) throw new Error(data?.error || "Production could not start");
      setJob(data.job);
      window.history.replaceState({}, "", `/swarm?project=${encodeURIComponent(data.job.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Production could not start.");
    } finally {
      setLaunching(false);
    }
  }

  const progress = Math.max(0, Math.min(100, job?.progress || 0));
  const master = job?.combinedSrc;
  const part1 = job?.act1Src || job?.part1Src;
  const part2 = job?.act2Src || job?.part2Src;

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Zyvoriq Studio
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Create one project from idea to master</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Define the creative brief, reuse people and locations, direct the treatment, generate, review, and continue editing without leaving the project.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/my-reels" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <FolderOpen className="h-4 w-4" /> Projects
            </Link>
            <Link href="/swarm/advanced" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" /> Advanced editor
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">1</span>
                <div>
                  <h2 className="font-semibold">Creative brief</h2>
                  <p className="text-sm text-slate-500">Tell Zyvoriq what you want to make and where it will be published.</p>
                </div>
              </div>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="mt-5 min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                placeholder="Describe the story, product, mood, audience, or creative outcome..."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                  {COUNTRIES.map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                  {LANGUAGES.map((v) => <option key={v}>{v}</option>)}
                </select>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                  {PLATFORMS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">2</span>
                <div>
                  <h2 className="font-semibold">Reusable assets</h2>
                  <p className="text-sm text-slate-500">Keep cast and environments consistent across the whole project.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold"><UserRound className="h-4 w-4 text-violet-600" /> Person</span>
                    <Link href="/assets?tab=people" className="text-xs font-semibold text-violet-600">Manage</Link>
                  </div>
                  <select value={selectedCharacterId} onChange={(e) => setSelectedCharacterId(e.target.value)} disabled={loadingAssets} className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                    <option value="">Prompt-only cast</option>
                    {characters.map((c) => <option key={c.id} value={c.id}>{c.displayName} — {c.archetype}</option>)}
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-violet-600" /> Location</span>
                    <Link href="/assets?tab=locations" className="text-xs font-semibold text-violet-600">Manage</Link>
                  </div>
                  <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} disabled={loadingAssets} className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                    <option value="">Prompt-only location</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.displayName}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">3</span>
                  <div>
                    <h2 className="font-semibold">Treatment & direction</h2>
                    <p className="text-sm text-slate-500">Generate creative directions, pick one, then refine it.</p>
                  </div>
                </div>
                <button onClick={generateIdeas} disabled={generatingIdeas} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                  {generatingIdeas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generatingIdeas ? "Creating..." : "Generate ideas"}
                </button>
              </div>

              {ideas.length > 0 && (
                <div className="mt-5 grid gap-3">
                  {ideas.slice(0, 3).map((idea) => {
                    const active = selectedIdeaId === idea.id;
                    return (
                      <button key={idea.id} onClick={() => applyIdea(idea)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{idea.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{idea.genre} · {idea.bpm} BPM</div>
                          </div>
                          {active && <CheckCircle2 className="h-5 w-5 text-violet-600" />}
                        </div>
                        <p className="mt-2 text-sm leading-5 text-slate-600">{idea.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              <button onClick={() => setShowPrompts((v) => !v)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                <ChevronDown className={`h-4 w-4 transition ${showPrompts ? "rotate-180" : ""}`} />
                {showPrompts ? "Hide director prompts" : "Edit director prompts"}
              </button>

              {showPrompts && (
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scene 1</label>
                    <textarea value={act1Prompt} onChange={(e) => setAct1Prompt(e.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scene 2</label>
                    <textarea value={act2Prompt} onChange={(e) => setAct2Prompt(e.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6" />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">4</span>
                  <div>
                    <h2 className="font-semibold">Generate master</h2>
                    <p className="text-sm text-slate-500">Your project is saved as soon as production starts.</p>
                  </div>
                </div>
                <button onClick={launchProject} disabled={launching || job?.status === "running"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  {launching || job?.status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                  {job?.status === "running" ? "Generating..." : "Start production"}
                  {!launching && job?.status !== "running" && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project preview</p>
                    <h2 className="mt-1 line-clamp-1 font-semibold">{job?.title || selectedIdea?.title || title}</h2>
                  </div>
                  {job?.status === "completed" && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Ready</span>}
                </div>
              </div>

              <div className="aspect-video bg-slate-950">
                {master ? (
                  <video key={master} src={master} controls playsInline className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                    <Film className="h-10 w-10" />
                    <span className="text-sm">Your generated master will appear here</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                {job ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{job.stageLabel || job.status}</span>
                      <span className="font-semibold text-slate-900">{progress}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    {job.status === "error" && (
                      <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                        {job.errorMsg || "Generation failed. Review the prompt or retry."}
                      </div>
                    )}

                    {job.status === "completed" && (
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <Link href="/my-reels" className="rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white">View projects</Link>
                        <Link href="/swarm/advanced" className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Advanced edit</Link>
                      </div>
                    )}

                    {(part1 || part2) && (
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {[part1, part2].map((src, i) => src ? (
                          <div key={src} className="overflow-hidden rounded-xl border border-slate-200">
                            <video src={src} controls playsInline className="aspect-video w-full bg-black object-contain" />
                            <div className="px-3 py-2 text-xs font-medium text-slate-600">Scene {i + 1}</div>
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 text-sm text-slate-500">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="font-semibold text-slate-700">Current setup</div>
                      <div className="mt-3 space-y-2">
                        <div>Person: <span className="font-medium text-slate-900">{selectedCharacter?.displayName || "Prompt-only"}</span></div>
                        <div>Location: <span className="font-medium text-slate-900">{selectedLocation?.displayName || "Prompt-only"}</span></div>
                        <div>Platform: <span className="font-medium text-slate-900">{platform}</span></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIdeas([]);
                        setSelectedIdeaId("");
                        setAct1Prompt("");
                        setAct2Prompt("");
                        setJob(null);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset draft
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
