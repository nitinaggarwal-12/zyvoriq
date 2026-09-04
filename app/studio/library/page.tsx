"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AudioLines,
  Captions,
  Copy,
  Download,
  FileJson,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  ScanSearch,
  Search,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
import { StudioSidebar } from "@/components/StudioSidebar";

type Production = { id: string; revision: number; manifest: any; createdAt?: string; updatedAt?: string };
type LegacyTrack = { id: string; title?: string; subtitle?: string; category?: string; character?: string; videoSrc?: string; duration?: number; createdAt?: string; acts?: any[] };
type AssetKind = "Final" | "Video" | "Audio" | "Image" | "Text" | "Evidence" | "Legacy";
type LibraryAsset = {
  id: string;
  productionId?: string;
  title: string;
  subtitle?: string;
  kind: AssetKind;
  url?: string;
  duration?: number;
  model?: string;
  createdAt?: string;
  payload?: unknown;
};

type DirectClip = { id: string; url: string; duration?: number; model?: string };

const tabs: Array<"All" | AssetKind> = ["All", "Final", "Video", "Audio", "Image", "Text", "Evidence", "Legacy"];

function collectProductionAssets(p: Production): LibraryAsset[] {
  const m = p.manifest || {};
  const out: LibraryAsset[] = [];
  const createdAt = p.updatedAt || p.createdAt || m.createdAt;
  const push = (asset: Omit<LibraryAsset, "productionId" | "createdAt">) => out.push({ ...asset, productionId: p.id, createdAt });

  if (m.outputs?.master?.videoUrl) push({ id: `${p.id}:master`, title: m.topic || "Final master", subtitle: "Final master MP4", kind: "Final", url: m.outputs.master.videoUrl, duration: m.outputs.master.actualDurationSec });
  if (m.outputs?.narratedRoughCut?.videoUrl) push({ id: `${p.id}:rough`, title: m.topic || "Narrated Reel", subtitle: "Combined narrated MP4", kind: "Final", url: m.outputs.narratedRoughCut.videoUrl, duration: m.outputs.narratedRoughCut.actualDurationSec });

  for (const [i, s] of (m.shots || []).entries()) {
    if (s.asset?.videoUrl) push({ id: `${p.id}:shot:${s.id}`, title: `Shot ${i + 1}`, subtitle: s.visualIntent || s.scriptText, kind: "Video", url: s.asset.videoUrl, duration: s.asset.actualDurationSec || s.editorialDurationSec, model: s.asset.model });
    if (s.continuityIn?.referenceFrameUrl) push({ id: `${p.id}:ref:${s.id}`, title: `Shot ${i + 1} continuity frame`, subtitle: "Persisted predecessor reference frame", kind: "Image", url: s.continuityIn.referenceFrameUrl });
  }

  if (m.audio?.narrationUrl) push({ id: `${p.id}:narration`, title: "Narration", subtitle: `${m.audio.voice || "Voice"} · ${m.audio.model || "provider"}`, kind: "Audio", url: m.audio.narrationUrl, duration: m.audio.actualDurationSec, model: m.audio.model });
  if (m.audio?.musicUrl) push({ id: `${p.id}:music`, title: "Music", subtitle: "Production music stem", kind: "Audio", url: m.audio.musicUrl, duration: m.musicPlan?.durationSec });

  if (m.masterScript) push({ id: `${p.id}:script`, title: "Master script", subtitle: `${String(m.masterScript).length} characters`, kind: "Text", payload: m.masterScript });
  if (m.captions?.cues?.length) push({ id: `${p.id}:captions`, title: "Captions", subtitle: `${m.captions.cues.length} timed cues`, kind: "Text", payload: m.captions });
  if (m.audio?.wordTimings?.length) push({ id: `${p.id}:words`, title: "Word alignment", subtitle: `${m.audio.wordTimings.length} timed words`, kind: "Evidence", payload: m.audio.wordTimings });
  if (m.continuity) push({ id: `${p.id}:continuity`, title: "Continuity package", subtitle: "Characters, environments, performance, boundaries and object state", kind: "Evidence", payload: m.continuity });
  if (m.qa) push({ id: `${p.id}:qa`, title: "QA evidence", subtitle: m.qa.passed ? "Passed" : "Inspection / repair evidence", kind: "Evidence", payload: m.qa });
  push({ id: `${p.id}:manifest`, title: "Production manifest", subtitle: `Revision ${p.revision} · ${m.status || "UNKNOWN"}`, kind: "Evidence", payload: m });
  return out;
}

function projectTitle(p: Production) {
  return p.manifest?.studio1?.projectTitle || p.manifest?.topic || p.id;
}

function downloadPayload(asset: LibraryAsset) {
  const body = typeof asset.payload === "string" ? asset.payload : JSON.stringify(asset.payload, null, 2);
  const blob = new Blob([body || ""], { type: typeof asset.payload === "string" ? "text/plain" : "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${asset.id.replace(/[^a-z0-9-_]+/gi, "-")}.${typeof asset.payload === "string" ? "txt" : "json"}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function absoluteMediaUrl(url: string) {
  try { return new URL(url, window.location.origin).toString(); }
  catch { return url; }
}

async function copyMediaUrl(url: string) {
  const absolute = absoluteMediaUrl(url);
  try {
    await navigator.clipboard.writeText(absolute);
  } catch {
    window.prompt("Copy media link", absolute);
  }
}

function DirectMediaActions({ url, label, compact = false }: { url: string; label: string; compact?: boolean }) {
  const classes = compact
    ? "inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] font-bold hover:bg-white/5"
    : "inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-[11px] font-bold text-slate-200 hover:bg-white/5";
  return <div className="flex flex-wrap gap-2">
    <a href={url} target="_blank" rel="noreferrer" className={classes}><Play className="h-3 w-3"/>Play {label}</a>
    <button type="button" onClick={() => copyMediaUrl(url)} className={classes}><Copy className="h-3 w-3"/>Copy {label} Link</button>
    <a href={url} download className={classes}><Download className="h-3 w-3"/>Download</a>
  </div>;
}

export default function StudioLibraryPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [studio1Projects, setStudio1Projects] = useState<Production[]>([]);
  const [legacy, setLegacy] = useState<LegacyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [openProduction, setOpenProduction] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [prodRes, studio1Res, trackRes] = await Promise.all([
        fetch("/api/reels/productions?limit=100", { cache: "no-store" }),
        fetch("/api/studio1/productions?limit=100", { cache: "no-store" }),
        fetch("/api/studio/tracks", { cache: "no-store" }).catch(() => null),
      ]);
      const [prodData, studio1Data] = await Promise.all([prodRes.json(), studio1Res.json()]);
      if (!prodRes.ok || !prodData.success) throw new Error(prodData.error || "Failed to load Reel productions");
      if (!studio1Res.ok || !studio1Data.success) throw new Error(studio1Data.error || "Failed to load Studio1 projects");
      setProductions(Array.isArray(prodData.productions) ? prodData.productions : []);
      setStudio1Projects(Array.isArray(studio1Data.productions) ? studio1Data.productions : []);

      const serverTracks = trackRes?.ok ? (await trackRes.json()).tracks || [] : [];
      let localTracks: LegacyTrack[] = [];
      try {
        const saved = localStorage.getItem("zyvoriq_custom_production_tracks");
        if (saved) localTracks = JSON.parse(saved) || [];
      } catch {}
      const byId = new Map<string, LegacyTrack>();
      [...localTracks, ...(Array.isArray(serverTracks) ? serverTracks : [])].forEach((t: LegacyTrack) => t?.id && byId.set(t.id, t));
      setLegacy(Array.from(byId.values()));
    } catch (e: any) { setError(e?.message || String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const renameProject = async (project: Production) => {
    const nextTitle = window.prompt("Rename Studio1 project", projectTitle(project));
    if (!nextTitle?.trim() || nextTitle.trim() === projectTitle(project)) return;
    setManaging(project.id); setError("");
    try {
      const response = await fetch(`/api/studio1/productions/${encodeURIComponent(project.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renameProject", projectTitle: nextTitle.trim(), expectedRevision: project.revision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to rename project");
      setStudio1Projects(items => items.map(item => item.id === project.id ? data.production : item));
      setProductions(items => items.map(item => item.id === project.id ? data.production : item));
    } catch (e: any) { setError(e?.message || "Failed to rename Studio1 project"); }
    finally { setManaging(null); }
  };

  const duplicateProject = async (project: Production) => {
    setManaging(project.id); setError("");
    try {
      const response = await fetch(`/api/studio1/productions/${encodeURIComponent(project.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicateProject", expectedRevision: project.revision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to duplicate project");
      window.location.href = `/studio1?productionId=${encodeURIComponent(data.production.id)}`;
    } catch (e: any) { setError(e?.message || "Failed to duplicate Studio1 project"); setManaging(null); }
  };

  const deleteProject = async (project: Production) => {
    if (!window.confirm(`Delete “${projectTitle(project)}”? This removes the project record from Library.`)) return;
    setManaging(project.id); setError("");
    try {
      const response = await fetch(`/api/studio1/productions/${encodeURIComponent(project.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedRevision: project.revision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete project");
      setStudio1Projects(items => items.filter(item => item.id !== project.id));
      setProductions(items => items.filter(item => item.id !== project.id));
    } catch (e: any) { setError(e?.message || "Failed to delete Studio1 project"); }
    finally { setManaging(null); }
  };

  const clearAllLibrary = async () => {
    if (!window.confirm("Are you sure you want to delete all existing projects and wipe the library clean? This cannot be undone.")) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/studio/library/clear", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to clear library");
      try { localStorage.removeItem("zyvoriq_custom_production_tracks"); } catch {}
      setProductions([]);
      setStudio1Projects([]);
      setLegacy([]);
    } catch (err: any) {
      setError(err?.message || "Failed to clear library");
    } finally {
      setLoading(false);
    }
  };

  const productionAssets = useMemo(() => productions.flatMap(collectProductionAssets), [productions]);
  const legacyAssets = useMemo<LibraryAsset[]>(() => legacy.map(t => ({
    id: `legacy:${t.id}`,
    title: t.title || t.id,
    subtitle: [t.category, t.character, t.subtitle].filter(Boolean).join(" · "),
    kind: "Legacy",
    url: t.videoSrc,
    duration: t.duration,
    createdAt: t.createdAt,
    payload: t,
  })), [legacy]);
  const assets = useMemo(() => [...productionAssets, ...legacyAssets], [productionAssets, legacyAssets]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter(a => (tab === "All" || a.kind === tab) && (!q || `${a.title} ${a.subtitle || ""} ${a.kind} ${a.model || ""}`.toLowerCase().includes(q)));
  }, [assets, tab, query]);

  const counts = useMemo(() => Object.fromEntries(tabs.map(t => [t, t === "All" ? assets.length : assets.filter(a => a.kind === t).length])), [assets]);

  return (
    <StudioSidebar>
      <main className="mx-auto max-w-8xl px-5 py-8 md:px-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300"><FolderOpen className="h-4 w-4"/> Content Library</div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">Projects you can reopen, plus every persisted asset.</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Active workspaces are fully editable project environments. Final Reels, clips, narration, continuity frames, scripts, captions and evidence remain browsable as assets underneath.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Refresh</button>
          <button onClick={clearAllLibrary} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50 cursor-pointer"><Trash2 className="h-4 w-4 text-red-400"/>Clear Entire Library</button>
          <Link href="/studio/create" className="inline-flex items-center gap-2 rounded-xl bg-violet-200 px-4 py-2.5 text-xs font-black text-slate-950"><Plus className="h-4 w-4"/>New Project</Link>
          <Link href="/studio" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-white"><Sparkles className="h-4 w-4"/>Studio Cinema</Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="Productions" value={productions.length}/><Metric label="Final MP4s" value={counts.Final || 0}/><Metric label="Video clips" value={counts.Video || 0}/><Metric label="Audio assets" value={counts.Audio || 0}/><Metric label="Images" value={counts.Image || 0}/><Metric label="Evidence/Text" value={(counts.Evidence || 0) + (counts.Text || 0)}/>
      </div>

      <section className="mt-7 rounded-3xl border border-violet-300/15 bg-violet-300/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><div className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">Active Workspaces</div><h2 className="mt-1 text-2xl font-black text-white">Editable workspaces · {studio1Projects.length}</h2><p className="mt-1 text-xs text-slate-500">Open/Edit restores the exact production revision. Certified Full Reel and generated clip media remain directly accessible here.</p></div>
          <Link href="/studio/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950"><Plus className="h-4 w-4"/>Create project</Link>
        </div>
        {loading ? <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Loading workspaces…</div> : studio1Projects.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No active workspaces yet. Create one and it will remain editable here.</div> : <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">{studio1Projects.map(project => {
          const m = project.manifest || {};
          const busy = managing === project.id;
          const generated = (m.shots || []).filter((shot: any) => shot.asset?.videoUrl).length;
          const fullReelUrl = m.outputs?.master?.videoUrl || m.outputs?.narratedRoughCut?.videoUrl || null;
          const fullReelDuration = m.outputs?.master?.videoUrl ? m.outputs?.master?.actualDurationSec : m.outputs?.narratedRoughCut?.actualDurationSec;
          const directClips: DirectClip[] = (m.shots || []).flatMap((shot: any) => shot.asset?.videoUrl ? [{ id: String(shot.id), url: String(shot.asset.videoUrl), duration: shot.asset.actualDurationSec, model: shot.asset.model }] : []);
          return <article key={project.id} className="rounded-2xl border border-white/10 bg-[#0b0e13] p-4">
            <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate text-base font-black text-white">{projectTitle(project)}</h3><div className="mt-1 text-xs text-slate-500">{m.status || "DRAFT"} · {generated}/{m.shots?.length || 0} clips · revision {project.revision}</div><div className="mt-2 truncate font-mono text-[10px] text-slate-700">{project.id}</div></div>{busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-300"/>}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/studio?productionId=${encodeURIComponent(project.id)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-black text-slate-950"><Pencil className="h-3.5 w-3.5"/>Open / Edit</Link>
              <button onClick={() => renameProject(project)} disabled={Boolean(managing)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300 hover:bg-white/5 disabled:opacity-40"><Pencil className="h-3.5 w-3.5"/>Rename</button>
              <button onClick={() => duplicateProject(project)} disabled={Boolean(managing)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300 hover:bg-white/5 disabled:opacity-40"><Copy className="h-3.5 w-3.5"/>Duplicate</button>
              <button onClick={() => deleteProject(project)} disabled={Boolean(managing)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-2 text-[11px] font-bold text-red-200 hover:bg-red-400/5 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5"/>Delete</button>
            </div>

            {(fullReelUrl || directClips.length > 0) && <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">Direct media</div>
              {fullReelUrl && <div className="mt-2 rounded-xl border border-teal-300/15 bg-teal-300/[0.035] p-3">
                <div className="mb-2 flex items-center justify-between gap-3"><div className="text-xs font-black text-white">Full Reel</div>{Number(fullReelDuration) > 0 && <div className="text-[10px] text-slate-500">{Number(fullReelDuration).toFixed(2)}s</div>}</div>
                <DirectMediaActions url={fullReelUrl} label="Reel" />
              </div>}
              {directClips.length > 0 && <details className="mt-2 rounded-xl border border-white/10 bg-black/15 p-3">
                <summary className="cursor-pointer text-xs font-black text-slate-300">Generated clips · {directClips.length}</summary>
                <div className="mt-3 space-y-2">{directClips.map((clip, index) => <div key={clip.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-3"><div className="text-[11px] font-bold text-slate-300">Clip {index + 1}</div><div className="text-[10px] text-slate-600">{clip.duration ? `${Number(clip.duration).toFixed(2)}s` : ""}{clip.model ? ` · ${clip.model}` : ""}</div></div>
                  <DirectMediaActions url={clip.url} label={`Clip ${index + 1}`} compact />
                </div>)}</div>
              </details>}
            </div>}
          </article>;
        })}</div>}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-3.5 py-2 text-xs font-bold ${tab === t ? "bg-white text-slate-950" : "border border-white/10 text-slate-400 hover:text-white"}`}>{t} <span className="ml-1 opacity-60">{counts[t] || 0}</span></button>)}</div>
          <label className="relative block min-w-[260px]"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-600"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search content, model, type…" className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-300/30"/></label>
        </div>
      </section>

      {error && <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-3 py-24 text-slate-500"><Loader2 className="h-5 w-5 animate-spin"/>Loading persisted content…</div> : visible.length === 0 ? <div className="mt-6 rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500">No persisted assets match this view.</div> : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map(asset => <AssetCard key={asset.id} asset={asset}/>)}</div>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-black uppercase tracking-[0.16em] text-pink-300">Production groups</div><h2 className="mt-1 text-2xl font-black">Browse each Reel and every piece inside it</h2></div><Link href="/studio/inspector" className="inline-flex items-center gap-2 rounded-xl border border-pink-300/20 px-3 py-2 text-xs font-bold text-pink-100"><ScanSearch className="h-4 w-4"/>Evidence Inspector</Link></div>
        <div className="space-y-3">{productions.map(p => { const m = p.manifest || {}; const pa = collectProductionAssets(p); const expanded = openProduction === p.id; return <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
          <button onClick={() => setOpenProduction(expanded ? null : p.id)} className="flex w-full items-center justify-between gap-4 p-4 text-left"><div className="min-w-0"><div className="truncate font-black text-white">{m.studio1?.projectTitle || m.topic || p.id}</div><div className="mt-1 text-xs text-slate-500">{m.status} · {m.plannedDurationSec || m.requestedDurationSec || 0}s · {pa.length} persisted pieces · rev {p.revision}</div></div><span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-400">{expanded ? "HIDE" : "SHOW ALL"}</span></button>
          {expanded && <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-2 xl:grid-cols-4">{pa.map(a => <AssetCard key={a.id} asset={a} compact/>)}</div>}
        </div>; })}</div>
      </section>
      </main>
    </StudioSidebar>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>; }

function kindIcon(kind: AssetKind) {
  if (kind === "Final") return Film; if (kind === "Video" || kind === "Legacy") return Video; if (kind === "Audio") return AudioLines; if (kind === "Image") return ImageIcon; if (kind === "Text") return Captions; return FileJson;
}

function AssetCard({ asset, compact = false }: { asset: LibraryAsset; compact?: boolean }) {
  const Icon = kindIcon(asset.kind);
  const isVideo = Boolean(asset.url && (asset.kind === "Final" || asset.kind === "Video" || asset.kind === "Legacy"));
  const isAudio = Boolean(asset.url && asset.kind === "Audio");
  const isImage = Boolean(asset.url && asset.kind === "Image");
  return <article className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13] ${compact ? "p-3" : ""}`}>
    {!compact && <div className="aspect-video bg-black/30">{isVideo ? <video src={asset.url} controls preload="metadata" playsInline className="h-full w-full object-cover"/> : isAudio ? <div className="flex h-full items-center justify-center p-4"><audio src={asset.url} controls preload="metadata" className="w-full"/></div> : isImage ? <img src={asset.url} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-slate-700"/></div>}</div>}
    <div className={compact ? "" : "p-4"}>
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">{asset.kind}</div><h3 className="mt-1 truncate text-sm font-black text-white">{asset.title}</h3>{asset.subtitle && <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{asset.subtitle}</div>}</div><Icon className="h-4 w-4 shrink-0 text-slate-500"/></div>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-600">{asset.duration ? <span>{asset.duration.toFixed(2)}s</span> : null}{asset.model ? <span>{asset.model}</span> : null}{asset.productionId ? <span className="truncate">{asset.productionId.slice(0, 14)}…</span> : null}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {asset.url && <a href={asset.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold hover:bg-white/5"><Play className="h-3 w-3"/>Open</a>}
        {asset.url && <button type="button" onClick={() => copyMediaUrl(asset.url!)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold hover:bg-white/5"><Copy className="h-3 w-3"/>Copy link</button>}
        {asset.url && <a href={asset.url} download className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold hover:bg-white/5"><Download className="h-3 w-3"/>Download</a>}
        {asset.payload !== undefined && <button onClick={() => downloadPayload(asset)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold hover:bg-white/5"><Download className="h-3 w-3"/>Export</button>}
        {asset.productionId && <Link href={`/studio/inspector?productionId=${encodeURIComponent(asset.productionId)}`} className="inline-flex items-center gap-1 rounded-lg border border-pink-300/20 px-2.5 py-1.5 text-[10px] font-bold text-pink-100"><ScanSearch className="h-3 w-3"/>Inspect</Link>}
      </div>
    </div>
  </article>;
}
