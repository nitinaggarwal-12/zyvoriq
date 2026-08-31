"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, ChevronDown, CircleAlert, Copy, Download, Film, FlaskConical, FolderOpen, Loader2, PlayCircle, RefreshCw, Sparkles, UserRoundCheck, Video } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";

type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type Studio1Operation = "plan" | "all" | "fresh" | "rough" | `regen:${string}` | null;
type SubjectMode = "PRESENTER" | "NO_PERSON";
type Studio1Meta = {
  projectTitle?: string;
  presenterContinuity: boolean;
  environmentContinuity: boolean;
  generationRound: number;
  subjectModes: Record<string, SubjectMode>;
  clipOptions: Record<string, Array<{ id: string; label: string; asset: { videoUrl: string; actualDurationSec: number; model?: string }; createdAt: string }>>;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function durationNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

export function Studio1() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [activeTab, setActiveTab] = useState("Scenes");
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [operation, setOperation] = useState<Studio1Operation>(null);
  const [error, setError] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const productionId = new URLSearchParams(window.location.search).get("productionId");
    if (!productionId) {
      setHydrating(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(`/api/studio1/productions/${encodeURIComponent(productionId)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Failed to restore Studio1 project");
        if (cancelled) return;
        const restored = data.production as StoredProduction;
        setProduction(restored);
        setTopic(restored.manifest.topic || "");
        setTone(restored.manifest.tone || "Confident & conversational");
        setDuration(`${restored.manifest.requestedDurationSec || 30} sec`);
        setPlatform(restored.manifest.platform || "Instagram Reels");
        setSelectedShotId(null);
        setActiveTab("Scenes");
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to restore Studio1 project");
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const manifest = production?.manifest || null;
  const meta = ((manifest as any)?.studio1 || null) as Studio1Meta | null;
  const projectTitle = meta?.projectTitle || manifest?.topic || "New Studio1 project";
  const generatedShots = manifest?.shots.filter(shot => Boolean(shot.asset?.videoUrl)) || [];
  const generatedShotCount = generatedShots.length;
  const totalShotCount = manifest?.shots.length || 0;
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const selectedShot = selectedShotId ? manifest?.shots.find(shot => shot.id === selectedShotId) : null;
  const previewUrl = selectedShot?.asset?.videoUrl || roughCut?.videoUrl || generatedShots[0]?.asset?.videoUrl || null;
  const previewLabel = selectedShot ? `Clip ${Math.max(1, (manifest?.shots.findIndex(shot => shot.id === selectedShot.id) ?? 0) + 1)}` : roughCut ? "Full Reel" : generatedShots.length ? "First generated clip" : "Preview";
  const script = useMemo(() => manifest ? (manifest.masterScript.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [manifest.masterScript]).map(line => line.trim()).filter(Boolean) : [], [manifest]);
  const busy = operation !== null;
  const fullReelStale = Boolean(manifest && !roughCut && generatedShotCount === totalShotCount && totalShotCount > 0 && manifest.status === "ROUGH_CUT_READY");

  const refresh = async (id: string) => {
    const response = await fetch(`/api/studio1/productions/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to refresh Studio1 production");
    setProduction(data.production);
    return data.production as StoredProduction;
  };

  const waitForOperation = async (operationId: string, productionId: string) => {
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to read durable operation");
      const current = data.operation as DurableOperation;
      if (current.status === "SUCCEEDED") return refresh(productionId);
      if (current.status === "FAILED") {
        await refresh(productionId).catch(() => undefined);
        throw new Error(current.lastError || "Studio1 generation failed");
      }
      await sleep(1500);
    }
    throw new Error("Studio1 generation is still running. Refresh later to continue from durable state.");
  };

  const dispatch = async (current: StoredProduction, action: string, extra: Record<string, unknown> = {}) => {
    const response = await fetch(`/api/studio1/productions/${encodeURIComponent(current.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, expectedRevision: current.revision, ...extra }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || `${action} failed`);
    setProduction(data.production);
    if (data.queued && data.operation?.id) return waitForOperation(String(data.operation.id), current.id);
    return data.production as StoredProduction;
  };

  const buildPlan = async () => {
    setOperation("plan"); setError("");
    try {
      const response = await fetch("/api/studio1/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform, requestedDurationSec: durationNumber(duration) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create Studio1 plan");
      setProduction(data.production);
      window.history.replaceState(null, "", `/studio1?productionId=${encodeURIComponent(data.production.id)}`);
      setSelectedShotId(null);
      setActiveTab("Scenes");
    } catch (err: any) { setError(err?.message || "Failed to create Studio1 plan"); }
    finally { setOperation(null); }
  };

  const generateThroughRoughCut = async (fresh: boolean) => {
    if (!production) return;
    setOperation(fresh ? "fresh" : "all"); setError(""); setActiveTab("Scenes"); setSelectedShotId(null);
    try {
      let current = await refresh(production.id);
      if (current.manifest.status === "SCRIPT_READY") current = await dispatch(current, "generateNarration");
      if (fresh && current.manifest.shots.some(shot => Boolean(shot.asset?.videoUrl))) current = await dispatch(current, "generateAllFresh");
      for (;;) {
        const remaining = current.manifest.shots.filter(shot => !shot.asset?.videoUrl);
        if (!remaining.length) break;
        current = await dispatch(current, "generateNextShot", { modelTier: "fast" });
      }
      current = await refresh(current.id);
      if (current.manifest.status === "ROUGH_CUT_READY" && !current.manifest.outputs?.narratedRoughCut) current = await dispatch(current, "renderNarratedRoughCut");
      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) { setError(err?.message || "Studio1 generation failed"); await refresh(production.id).catch(() => undefined); }
    finally { setOperation(null); }
  };

  const rebuildFullReel = async () => {
    if (!production) return;
    setOperation("rough"); setError("");
    try {
      const current = await dispatch(production, "renderNarratedRoughCut");
      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) { setError(err?.message || "Failed to rebuild full reel"); }
    finally { setOperation(null); }
  };

  const regenerateShot = async (shotId: string) => {
    if (!production) return;
    setOperation(`regen:${shotId}`); setError(""); setSelectedShotId(shotId);
    try { setProduction(await dispatch(production, "regenerateShot", { shotId, modelTier: "fast" })); }
    catch (err: any) { setError(err?.message || `Failed to regenerate ${shotId}`); }
    finally { setOperation(null); }
  };

  const setToggle = async (action: "setPresenterContinuity" | "setEnvironmentContinuity", enabled: boolean) => {
    if (!production) return;
    setError("");
    try { setProduction(await dispatch(production, action, { enabled })); }
    catch (err: any) { setError(err?.message || "Failed to update continuity setting"); }
  };

  const setSubjectMode = async (shotId: string, mode: SubjectMode) => {
    if (!production) return;
    setError("");
    try { setProduction(await dispatch(production, "setSubjectMode", { shotId, mode })); }
    catch (err: any) { setError(err?.message || "Failed to update shot subject mode"); }
  };

  const selectOption = async (shotId: string, optionId: string) => {
    if (!production) return;
    setError("");
    try { setProduction(await dispatch(production, "selectOption", { shotId, optionId })); setSelectedShotId(shotId); }
    catch (err: any) { setError(err?.message || "Failed to select clip option"); }
  };

  const copyScript = async () => {
    try { await navigator.clipboard.writeText(manifest?.masterScript || ""); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

  if (hydrating) {
    return <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-slate-100"><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-bold text-slate-300"><Loader2 className="h-5 w-5 animate-spin text-violet-300" />Restoring your Studio1 project…</div></div>;
  }

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/92 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-300 via-white to-cyan-300 font-black text-slate-950">1</div>
          <div className="min-w-0"><div className="truncate font-black text-white">{production ? projectTitle : "Studio 1 · Isolated Clone Lab"}</div><div className="text-[11px] text-slate-600">{production ? `Saved · revision ${production.revision} · ${manifest?.status}` : "New project · durable state begins when you build the plan"}</div></div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/studio/library" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 hover:text-white"><FolderOpen className="h-4 w-4" />Library</Link>
          <a href="/studio1" className="rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-3 py-2 text-xs font-black text-violet-100">New project</a>
          <Link href="/studio2" className="hidden rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 hover:text-white xl:block">Open Studio2 baseline</Link>
        </div>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[360px_1fr_360px]">
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-300"><FlaskConical className="h-4 w-4" /> Studio1 project</div>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">{production ? projectTitle : "Start a durable creation workspace."}</h1>
        <label className="mt-6 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label>
        <textarea value={topic} onChange={event => setTopic(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-violet-300/35" />
        <div className="mt-5 grid gap-3">
          <Field label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
          <Field label="Length" value={duration} onChange={setDuration} options={["15 sec", "30 sec", "45 sec", "60 sec"]} />
          <Field label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
        </div>

        {manifest && <div className="mt-5 space-y-3">
          <Toggle label="Presenter continuity" note="Same canonical presenter in every PRESENTER clip." checked={Boolean(meta?.presenterContinuity)} onChange={enabled => setToggle("setPresenterContinuity", enabled)} />
          <Toggle label="Environment continuity" note="Locks location, background, lighting and major props." checked={meta?.environmentContinuity !== false} onChange={enabled => setToggle("setEnvironmentContinuity", enabled)} />
        </div>}

        <ActionButton onClick={buildPlan} disabled={busy || !topic.trim()} active={operation === "plan"} icon={Sparkles} idle={production ? "Create new project from these settings" : "Build Studio1 plan"} busyLabel="Building…" primary />
        {production && <ActionButton onClick={() => generateThroughRoughCut(false)} disabled={busy} active={operation === "all"} icon={Film} idle={generatedShotCount ? `Generate remaining + MP4 (${generatedShotCount}/${totalShotCount})` : "Generate all clips + MP4"} busyLabel="Generating…" primary />}
        {production && generatedShotCount > 0 && <ActionButton onClick={() => generateThroughRoughCut(true)} disabled={busy} active={operation === "fresh"} icon={RefreshCw} idle="Generate ALL clips fresh" busyLabel="Fresh generation…" />}
        {fullReelStale && <ActionButton onClick={rebuildFullReel} disabled={busy} active={operation === "rough"} icon={Film} idle="Rebuild Full Reel" busyLabel="Rebuilding…" primary />}
        {roughCut?.videoUrl && <button onClick={() => setSelectedShotId(null)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/30 bg-violet-300/[0.09] py-3.5 text-sm font-black text-violet-50"><PlayCircle className="h-4 w-4" />Play Full Reel · {roughCut.actualDurationSec.toFixed(1)}s</button>}
        {roughCut?.videoUrl && <a href={roughCut.videoUrl} download className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.07] py-3.5 text-sm font-black text-emerald-100"><Download className="h-4 w-4" />Download Full Reel</a>}
        {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <p className="mt-4 text-[11px] leading-5 text-slate-600">Every Studio1 project now has a durable URL. Refreshing or reopening from Library restores the server-side production revision before the editor is shown.</p>
      </aside>

      <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]">
        <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-3">{["Scenes", "Script", "Captions"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>{tab}</button>)}</div>
        <div className="p-5 sm:p-8">
          {activeTab === "Scenes" && <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">ISOLATED TEST CLIPS</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{manifest ? `${generatedShotCount}/${totalShotCount} clips generated · round ${meta?.generationRound || 1}` : "Build a Studio1 plan"}</h2>
            {!manifest ? <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-600">Create a project here or open an existing Studio1 project from Library.</div> : <div className="mt-8 space-y-4">{manifest.shots.map((shot, index) => {
              const options = meta?.clipOptions?.[shot.id] || [];
              const mode = meta?.subjectModes?.[shot.id] || "PRESENTER";
              const regenerating = operation === `regen:${shot.id}`;
              return <div key={shot.id} className={`rounded-2xl border p-4 ${selectedShotId === shot.id ? "border-violet-300/35 bg-violet-300/[0.05]" : "border-white/10 bg-white/[0.025]"}`}>
                <div className="flex items-start gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{index + 1}</div><div className="min-w-0 flex-1">
                  <div className="text-sm leading-6 text-slate-300">{shot.visualIntent}</div>
                  <div className="mt-1 text-xs text-slate-600">{shot.asset?.videoUrl ? `Current · ${shot.asset.actualDurationSec?.toFixed(2) || "?"}s · ${shot.asset.model || "provider"}` : `Pending · needs ${shot.generationDurationSec}s source`}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select value={mode} onChange={event => setSubjectMode(shot.id, event.target.value as SubjectMode)} disabled={busy} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-300"><option value="PRESENTER">PRESENTER · canonical identity</option><option value="NO_PERSON">NO PERSON · strict B-roll</option></select>
                    {shot.asset?.videoUrl && <button onClick={() => setSelectedShotId(shot.id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:text-white"><Video className="mr-1 inline h-3.5 w-3.5" />Review</button>}
                    {manifest.audio?.narrationUrl && <button onClick={() => regenerateShot(shot.id)} disabled={busy} className="rounded-xl border border-pink-300/20 bg-pink-300/[0.05] px-3 py-2 text-xs font-black text-pink-100 disabled:opacity-50">{regenerating ? <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 inline h-3.5 w-3.5" />}Regenerate clip</button>}
                  </div>
                  {options.length > 0 && <div className="mt-3 rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">Previous immutable options</div><div className="mt-2 flex flex-wrap gap-2">{options.map(option => <button key={option.id} onClick={() => selectOption(shot.id, option.id)} disabled={busy} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white">{option.label} · {option.asset.actualDurationSec?.toFixed(2) || "?"}s</button>)}</div></div>}
                </div></div>
              </div>;
            })}</div>}
          </div>}
          {activeTab === "Script" && <div><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">MASTER SCRIPT</div><h2 className="mt-2 text-3xl font-black text-white">Same baseline script behavior as Studio2.</h2></div><button onClick={copyScript} disabled={!manifest} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-400"><Copy className="mr-1 inline h-4 w-4" />{copied ? "Copied" : "Copy"}</button></div><div className="mt-8 space-y-3">{script.length ? script.map((line, index) => <div key={`${index}-${line.slice(0, 18)}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300">{line}</div>) : <div className="text-sm text-slate-600">Build a plan first.</div>}</div></div>}
          {activeTab === "Captions" && <div><Captions className="h-8 w-8 text-violet-300" /><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-violet-300">CAPTION SOURCE</div><h2 className="mt-2 text-3xl font-black text-white">{manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned` : "Waiting for real narration alignment"}</h2></div>}
        </div>
      </section>

      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">
          {previewUrl ? <video key={previewUrl} src={previewUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" /> : <div className="flex aspect-[9/16] items-center justify-center rounded-[24px] bg-black/25 p-6 text-center text-sm text-slate-600">Generated Studio1 clip or full reel appears here.</div>}
          <div className="px-2 pb-1 pt-3 text-xs font-black text-slate-500">{previewLabel}</div>
          {roughCut?.videoUrl && <div className="flex flex-wrap gap-2 px-2 pb-2"><button onClick={() => setSelectedShotId(null)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black ${!selectedShotId ? "bg-white text-slate-950" : "border border-white/10 text-slate-400"}`}>FULL REEL</button>{manifest?.shots.filter(shot => shot.asset?.videoUrl).map((shot, index) => <button key={shot.id} onClick={() => setSelectedShotId(shot.id)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black ${selectedShotId === shot.id ? "bg-white text-slate-950" : "border border-white/10 text-slate-400"}`}>CLIP {index + 1}</button>)}</div>}
        </div>
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
          <div className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Studio1 truth</div>
          <div className="mt-4 space-y-3 text-sm"><Truth label="Project" value={projectTitle} /><Truth label="Production" value={production?.id || "Not created"} /><Truth label="Revision" value={production ? `r${production.revision}` : "—"} /><Truth label="State" value={manifest?.status || "DRAFT"} /><Truth label="Identity" value={meta?.presenterContinuity ? "Canonical anchor ON" : "Anchor OFF"} /><Truth label="Environment" value={meta?.environmentContinuity !== false ? "Continuity ON" : "Continuity OFF"} /><Truth label="Generation round" value={String(meta?.generationRound || 0)} /><Truth label="Clips" value={manifest ? `${generatedShotCount}/${totalShotCount}` : "0"} /><Truth label="Combined MP4" value={roughCut ? "Ready" : "Pending"} /></div>
        </div>
      </aside>
    </main>
  </div>;
}

function ActionButton({ onClick, disabled, active, icon: Icon, idle, busyLabel, primary = false }: { onClick: () => void; disabled: boolean; active: boolean; icon: React.ComponentType<{ className?: string }>; idle: string; busyLabel: string; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black disabled:opacity-50 ${primary ? "bg-white text-slate-950" : "border border-violet-300/20 bg-white/[0.04] text-white"}`}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{active ? busyLabel : idle}</button>;
}
function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><div className="relative mt-2"><select value={value} onChange={event => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 pr-9 text-sm text-slate-200 outline-none">{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-600" /></div></label>; }
function Toggle({ label, note, checked, onChange }: { label: string; note: string; checked: boolean; onChange: (enabled: boolean) => void }) { return <label className="flex items-center justify-between rounded-2xl border border-violet-300/15 bg-violet-300/[0.05] p-4"><div><div className="flex items-center gap-2 text-sm font-black text-white"><UserRoundCheck className="h-4 w-4 text-violet-300" />{label}</div><div className="mt-1 text-[11px] leading-5 text-slate-500">{note}</div></div><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-5 w-5 accent-violet-300" /></label>; }
function Truth({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><span className="text-slate-400">{label}</span><span className="max-w-[190px] truncate text-xs font-semibold text-slate-500">{value}</span></div>; }