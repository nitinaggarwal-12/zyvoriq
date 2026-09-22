"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Film,
  FolderOpen,
  Loader2,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

type Stage = "brief" | "format" | "assets" | "treatment" | "generate" | "edit" | "review" | "publish";

interface Wardrobe {
  id: string;
  label: string;
  sheetUris: string[];
  isDefault: boolean;
}
interface CharacterOption {
  id: string;
  displayName: string;
  archetype: string;
  wardrobe?: Wardrobe[];
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
interface Project {
  id: string;
  title?: string;
  titleDraft?: string;
  format?: string;
  stage?: Stage;
  status?: string;
  brief?: string;
  country?: string;
  language?: string;
  platform?: string;
  referenceMedia?: Array<{ name: string; type: string; size: number; dataUrl?: string }>;
  selectedCharacterId?: string;
  selectedWardrobeId?: string;
  selectedLocationId?: string;
  selectedScene2LocationId?: string;
  genre?: string;
  bpm?: number;
  act1Prompt?: string;
  act2Prompt?: string;
  review?: Record<string, boolean>;
  publish?: Record<string, unknown>;
  progress?: number;
  stageLabel?: string;
  combinedSrc?: string;
  part1Src?: string;
  part2Src?: string;
  errorMsg?: string;
}
interface PublishConnections {
  linkedin: boolean;
  youtube: boolean;
  x: boolean;
}

const STAGES: Array<{ id: Stage; label: string }> = [
  { id: "brief", label: "Brief" },
  { id: "format", label: "Format" },
  { id: "assets", label: "Assets" },
  { id: "treatment", label: "Treatment" },
  { id: "generate", label: "Generate" },
  { id: "edit", label: "Edit" },
  { id: "review", label: "Review" },
  { id: "publish", label: "Publish" },
];

const FORMAT_CONFIG: Record<string, { name: string; description: string; platform: string }> = {
  reel: { name: "Reel", description: "60-second vertical social video", platform: "Instagram Reels" },
  "music-video": { name: "Music Video", description: "60-second cinematic music-led master", platform: "YouTube Music Video" },
  "story-video": { name: "Story Video", description: "60-second narrative visual story", platform: "YouTube Shorts" },
};

const COUNTRIES = ["United States", "India", "United Kingdom", "South Korea", "Japan", "Brazil", "France", "Australia"];
const LANGUAGES = ["English", "Hindi", "Spanish", "Korean", "Japanese", "Portuguese", "French", "Tamil"];

export default function StudioPage() {
  const [projectId, setProjectId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<Stage>("brief");
  const [format, setFormat] = useState("reel");
  const [brief, setBrief] = useState("");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [platform, setPlatform] = useState(FORMAT_CONFIG.reel.platform);
  const [title, setTitle] = useState("Untitled project");
  const [genre, setGenre] = useState("Cinematic Pop");
  const [bpm, setBpm] = useState(120);
  const [act1Prompt, setAct1Prompt] = useState("");
  const [act2Prompt, setAct2Prompt] = useState("");
  const [referenceMedia, setReferenceMedia] = useState<Project["referenceMedia"]>([]);
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [selectedWardrobeId, setSelectedWardrobeId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedScene2LocationId, setSelectedScene2LocationId] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [job, setJob] = useState<Project | null>(null);
  const [review, setReview] = useState<Record<string, boolean>>({
    story: false,
    continuity: false,
    visual: false,
    audio: false,
    rights: false,
  });
  const [publishConnections, setPublishConnections] = useState<PublishConnections>({
    linkedin: false,
    youtube: false,
    x: false,
  });
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [message, setMessage] = useState("");

  const selectedCharacter = useMemo(
    () => characters.find((item) => item.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );
  const wardrobes = selectedCharacter?.wardrobe || [];
  const masterSrc = job?.combinedSrc;
  const allReviewed = Object.values(review).every(Boolean);
  const currentStageIndex = STAGES.findIndex((item) => item.id === stage);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("project") || "";
    if (!id) {
      window.location.replace("/create");
      return;
    }
    setProjectId(id);

    Promise.all([
      fetch(`/api/projects/${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch("/api/library/characters").then((r) => r.json()),
      fetch("/api/library/locations").then((r) => r.json()),
      fetch("/api/publish/dispatch").then((r) => r.json()),
    ]).then(([projectData, characterData, locationData, publishData]) => {
      if (!alive) return;
      const project = projectData?.project as Project | undefined;
      if (project) {
        setFormat(project.format || "reel");
        setStage((project.stage as Stage) || "brief");
        setBrief(project.brief || "");
        setCountry(project.country || "United States");
        setLanguage(project.language || "English");
        setPlatform(project.platform || FORMAT_CONFIG[project.format || "reel"]?.platform || "Instagram Reels");
        setTitle(project.titleDraft || project.title || "Untitled project");
        setGenre(project.genre || "Cinematic Pop");
        setBpm(Number(project.bpm || 120));
        setAct1Prompt(project.act1Prompt || "");
        setAct2Prompt(project.act2Prompt || "");
        setReferenceMedia(project.referenceMedia || []);
        setSelectedCharacterId(project.selectedCharacterId || "");
        setSelectedWardrobeId(project.selectedWardrobeId || "");
        setSelectedLocationId(project.selectedLocationId || "");
        setSelectedScene2LocationId(project.selectedScene2LocationId || project.selectedLocationId || "");
        if (project.review) setReview({ ...review, ...project.review });
        if (project.status === "running" || project.combinedSrc) setJob(project);
      }
      setCharacters(Array.isArray(characterData?.characters) ? characterData.characters : []);
      setLocations(Array.isArray(locationData?.locations) ? locationData.locations : []);
      if (publishData?.connections) setPublishConnections(publishData.connections);
      setLoaded(true);
    }).catch(() => {
      setMessage("The project could not be loaded.");
      setLoaded(true);
    });

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded || !projectId) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            titleDraft: title,
            format,
            stage,
            status: job?.status || "draft",
            brief,
            country,
            language,
            platform,
            referenceMedia,
            selectedCharacterId,
            selectedWardrobeId,
            selectedLocationId,
            selectedScene2LocationId,
            genre,
            bpm,
            act1Prompt,
            act2Prompt,
            review,
          }),
        });
        if (!response.ok) throw new Error("Autosave failed");
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [
    loaded, projectId, title, format, stage, brief, country, language, platform,
    referenceMedia, selectedCharacterId, selectedWardrobeId, selectedLocationId,
    selectedScene2LocationId, genre, bpm, act1Prompt, act2Prompt, review, job?.status
  ]);

  useEffect(() => {
    if (!job || job.status !== "running" || !projectId) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/swarm/jobs?id=${encodeURIComponent(projectId)}`);
      if (!response.ok) return;
      const data = await response.json();
      if (!data?.job) return;
      setJob(data.job);
      if (data.job.status === "completed") {
        setStage("edit");
        setMessage("Generation complete. Review the master and continue editing.");
      }
      if (data.job.status === "error") {
        setMessage(data.job.errorMsg || "Generation failed.");
      }
    }, 1800);
    return () => window.clearInterval(timer);
  }, [job?.status, projectId]);

  useEffect(() => {
    if (!selectedCharacterId || selectedWardrobeId) return;
    const first = wardrobes.find((item) => item.isDefault) || wardrobes[0];
    if (first) setSelectedWardrobeId(first.id);
  }, [selectedCharacterId, selectedWardrobeId, wardrobes]);

  function go(next: Stage) {
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
    setMessage("");
    try {
      const response = await fetch("/api/swarm/trending-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          language,
          socialPlatform: platform,
          durationSec: 60,
          characters: selectedCharacter ? `${selectedCharacter.displayName} — ${selectedCharacter.archetype}` : brief,
          attire: wardrobes.find((w) => w.id === selectedWardrobeId)?.label || "Concept-appropriate wardrobe",
          wardrobe: wardrobes.find((w) => w.id === selectedWardrobeId)?.label || "Identity-consistent second look",
          demography: "Global creator audience",
          targetAudience: brief,
        }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data?.ideas)) throw new Error(data?.error || "Treatment generation failed");
      setIdeas(data.ideas);
      if (data.ideas[0]) applyIdea(data.ideas[0]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Treatment generation failed.");
    } finally {
      setGeneratingIdeas(false);
    }
  }

  async function startGeneration() {
    if (!act1Prompt.trim() || !act2Prompt.trim()) {
      setMessage("Create or edit the treatment before generation.");
      go("treatment");
      return;
    }
    setGenerating(true);
    setMessage("");
    try {
      const response = await fetch("/api/swarm/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          format,
          brief,
          genre,
          bpm,
          country,
          language,
          socialPlatform: platform,
          referenceMedia,
          selectedCharacterId,
          selectedWardrobeId,
          selectedLocationId,
          selectedScene2LocationId,
          act1Prompt,
          act2Prompt,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.job) throw new Error(data?.error || "Generation could not start");
      setJob(data.job);
      go("generate");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Generation could not start.");
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!masterSrc) return;
    if (selectedChannels.length === 0) {
      setMessage("Choose a connected publishing channel or download the master.");
      return;
    }
    setPublishing(true);
    setMessage("");
    try {
      const response = await fetch("/api/publish/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: projectId,
          title,
          caption,
          narrationScript: caption,
          channels: selectedChannels,
          videoS3Url: new URL(masterSrc, window.location.origin).toString(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || "Publishing failed");
      await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "publish",
          status: "published",
          publish: data,
          createVersion: true,
        }),
      });
      setMessage("Published successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-[70vh] bg-[#F7F8FC] grid place-items-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-violet-600" /> Loading project…
        </div>
      </main>
    );
  }

  const card = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
  const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50";

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <Link href="/my-reels" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-3.5 w-3.5" /> Projects
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-violet-600">{FORMAT_CONFIG[format]?.name || "Project"}</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em]">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {saveState === "saving" ? "Saving…" : saveState === "error" ? "Autosave needs retry" : "Saved automatically"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/assets" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Assets</Link>
          </div>
        </header>

        <nav className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
            {STAGES.map((item, index) => {
              const active = item.id === stage;
              const complete = index < currentStageIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    active ? "bg-violet-600 text-white" : complete ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {complete ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{index + 1}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {message && <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</div>}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)]">
          <section>
            {stage === "brief" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">1 · Brief</p>
                <h2 className="mt-2 text-xl font-semibold">Define the outcome</h2>
                <textarea value={brief} onChange={(e) => setBrief(e.target.value)} className="mt-5 min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
                {referenceMedia && referenceMedia.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">References from Create</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {referenceMedia.map((item, i) => <span key={item.name + i} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item.name}</span>)}
                    </div>
                  </div>
                )}
                <div className="mt-5 flex justify-end"><button onClick={() => go("format")} className={primary}>Continue <ChevronRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {stage === "format" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">2 · Format</p>
                <h2 className="mt-2 text-xl font-semibold">Set the production format</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {Object.entries(FORMAT_CONFIG).map(([id, item]) => (
                    <button key={id} onClick={() => { setFormat(id); setPlatform(item.platform); }} className={`rounded-2xl border p-4 text-left ${format === id ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200"}`}>
                      <div className="font-semibold">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">{COUNTRIES.map((v) => <option key={v}>{v}</option>)}</select>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">{LANGUAGES.map((v) => <option key={v}>{v}</option>)}</select>
                  <input value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" />
                </div>
                <div className="mt-5 flex justify-end"><button onClick={() => go("assets")} className={primary}>Continue <ChevronRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {stage === "assets" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">3 · Assets</p>
                <h2 className="mt-2 text-xl font-semibold">Cast and environments</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="rounded-2xl border border-slate-200 p-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold"><UserRound className="h-4 w-4 text-violet-600" /> Person</span>
                    <select value={selectedCharacterId} onChange={(e) => { setSelectedCharacterId(e.target.value); setSelectedWardrobeId(""); }} className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                      <option value="">Prompt-only cast</option>
                      {characters.map((item) => <option key={item.id} value={item.id}>{item.displayName} — {item.archetype}</option>)}
                    </select>
                    {wardrobes.length > 0 && (
                      <select value={selectedWardrobeId} onChange={(e) => setSelectedWardrobeId(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                        {wardrobes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    )}
                    <Link href="/assets?tab=people" className="mt-3 inline-block text-xs font-semibold text-violet-600">Manage people & wardrobe</Link>
                  </label>

                  <label className="rounded-2xl border border-slate-200 p-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-violet-600" /> Scene 1 location</span>
                    <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                      <option value="">Prompt-only location</option>
                      {locations.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
                    </select>
                  </label>

                  <label className="rounded-2xl border border-slate-200 p-4 sm:col-start-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-violet-600" /> Scene 2 location</span>
                    <select value={selectedScene2LocationId} onChange={(e) => setSelectedScene2LocationId(e.target.value)} className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">
                      <option value="">Same as Scene 1</option>
                      {locations.map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
                    </select>
                    <Link href="/assets?tab=locations" className="mt-3 inline-block text-xs font-semibold text-violet-600">Manage locations</Link>
                  </label>
                </div>
                <div className="mt-5 flex justify-end"><button onClick={() => go("treatment")} className={primary}>Continue <ChevronRight className="h-4 w-4" /></button></div>
              </div>
            )}

            {stage === "treatment" && (
              <div className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">4 · Treatment</p>
                    <h2 className="mt-2 text-xl font-semibold">Choose the creative direction</h2>
                  </div>
                  <button onClick={generateIdeas} disabled={generatingIdeas} className={primary}>
                    {generatingIdeas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate treatments
                  </button>
                </div>
                {ideas.length > 0 && (
                  <div className="mt-5 grid gap-3">
                    {ideas.slice(0, 3).map((idea) => (
                      <button key={idea.id} onClick={() => applyIdea(idea)} className={`rounded-2xl border p-4 text-left ${selectedIdeaId === idea.id ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200"}`}>
                        <div className="font-semibold">{idea.title}</div>
                        <p className="mt-1 text-sm text-slate-500">{idea.tagline}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-5 grid gap-4">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium" placeholder="Project title" />
                  <textarea value={act1Prompt} onChange={(e) => setAct1Prompt(e.target.value)} className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm leading-6" placeholder="Scene 1 direction" />
                  <textarea value={act2Prompt} onChange={(e) => setAct2Prompt(e.target.value)} className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm leading-6" placeholder="Scene 2 direction" />
                </div>
                <div className="mt-5 flex justify-end"><button onClick={startGeneration} disabled={generating} className={primary}>{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />} Start production</button></div>
              </div>
            )}

            {stage === "generate" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">5 · Generate</p>
                <h2 className="mt-2 text-xl font-semibold">Production is running</h2>
                <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-600">{job?.stageLabel || "Preparing production…"}</span><strong>{Math.round(job?.progress || 0)}%</strong></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${Math.max(4, job?.progress || 0)}%` }} /></div>
                {job?.status === "error" && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{job.errorMsg || "Generation failed."}</div>}
              </div>
            )}

            {stage === "edit" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">6 · Edit</p>
                <h2 className="mt-2 text-xl font-semibold">Refine the master</h2>
                <p className="mt-2 text-sm text-slate-500">Review the output, regenerate a new version from the treatment, or open precision controls.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => go("treatment")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><RefreshCw className="h-4 w-4" /> New version</button>
                  <button onClick={() => go("review")} className={primary}>Review <ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {stage === "review" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">7 · Review</p>
                <h2 className="mt-2 text-xl font-semibold">Quality & rights check</h2>
                <div className="mt-5 grid gap-2">
                  {[
                    ["story", "Story and message are correct"],
                    ["continuity", "Character and location continuity look right"],
                    ["visual", "Visual quality is ready to share"],
                    ["audio", "Audio, dialogue, and music are acceptable"],
                    ["rights", "I have rights/consent for uploaded and selected assets"],
                  ].map(([id, label]) => (
                    <label key={id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                      <input type="checkbox" checked={Boolean(review[id])} onChange={(e) => setReview((current) => ({ ...current, [id]: e.target.checked }))} className="h-4 w-4 accent-violet-600" />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-5 flex justify-end"><button onClick={() => go("publish")} disabled={!allReviewed} className={primary}>Approve & continue <CheckCircle2 className="h-4 w-4" /></button></div>
              </div>
            )}

            {stage === "publish" && (
              <div className={card}>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">8 · Publish</p>
                <h2 className="mt-2 text-xl font-semibold">Export or publish</h2>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-5 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Caption or post copy…" />
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {(Object.keys(publishConnections) as Array<keyof PublishConnections>).map((channel) => {
                    const connected = publishConnections[channel];
                    const selected = selectedChannels.includes(channel);
                    return (
                      <button key={channel} disabled={!connected} onClick={() => setSelectedChannels((current) => selected ? current.filter((x) => x !== channel) : [...current, channel])} className={`rounded-xl border p-3 text-left text-sm font-semibold capitalize ${selected ? "border-violet-300 bg-violet-50" : "border-slate-200"} disabled:bg-slate-50 disabled:text-slate-400`}>
                        {channel}<div className="mt-1 text-xs font-normal">{connected ? "Connected" : "Connection required"}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {masterSrc && <a href={masterSrc} download className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><Download className="h-4 w-4" /> Download master</a>}
                  <button onClick={publish} disabled={publishing || selectedChannels.length === 0} className={primary}>{publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish</button>
                </div>
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Master preview</div>
                <div className="mt-1 truncate font-semibold">{title}</div>
              </div>
              <div className="aspect-video bg-slate-950">
                {masterSrc ? <video src={masterSrc} controls playsInline className="h-full w-full object-contain" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><Film className="h-9 w-9" /><span className="text-sm">Preview appears after generation</span></div>}
              </div>
              <div className="p-4 text-sm text-slate-500">
                <div className="flex justify-between"><span>Format</span><strong className="text-slate-800">{FORMAT_CONFIG[format]?.name || format}</strong></div>
                <div className="mt-2 flex justify-between"><span>Stage</span><strong className="capitalize text-slate-800">{stage}</strong></div>
                <div className="mt-2 flex justify-between"><span>Status</span><strong className="capitalize text-slate-800">{job?.status || "draft"}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
