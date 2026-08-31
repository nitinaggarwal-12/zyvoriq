"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, ChevronDown, CircleAlert, Copy, Download, Film, FlaskConical, Loader2, PlayCircle, RefreshCw, Sparkles, UserRoundCheck, Video } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";

type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type Studio2Operation = "plan" | "narration" | "shot" | "all" | "fresh" | "rough" | `regen:${string}` | null;
type SubjectMode = "PRESENTER" | "NO_PERSON";
type Studio2Meta = {
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

export function Studio2() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [activeTab, setActiveTab] = useState("Scenes");
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [operation, setOperation] = useState<Studio2Operation>(null);
  const [error, setError] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const manifest = production?.manifest || null;
  const meta = ((manifest as any)?.studio2 || null) as Studio2Meta | null;
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
    const response = await fetch(`/api/studio2/productions/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to refresh Studio2 production");
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
        throw new Error(current.lastError || "Studio2 generation failed");
      }
      await sleep(1500);
    }
    throw new Error("Studio2 generation is still running. Refresh later to continue from durable state.");
  };

  const dispatch = async (current: StoredProduction, action: string, extra: Record<string, unknown> = {}) => {
    const response = await fetch(`/api/studio2/productions/${encodeURIComponent(current.id)}`, {
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
      const response = await fetch("/api/studio2/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform, requestedDurationSec: durationNumber(duration) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create Studio2 plan");
      setProduction(data.production);
      setSelectedShotId(null);
      setActiveTab("Scenes");
    } catch (err: any) { setError(err?.message || "Failed to create Studio2 plan"); }
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
    } catch (err: any) { setError(err?.message || "Studio2 generation failed"); await refresh(production.id).catch(() => undefined); }
    finally { setOperation(null); }
  };

  const rebuildFullReel = async () => {
    if (!production) return;
    setOperation("rough"); setError("");
    try {
      const current = await dispatch(production, "renderNarratedRoughCut");
      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to rebuild full reel");
      await refresh(production.id).catch(() => undefined);
    } finally {
      setOperation(null);
    }
  };

  const regenerateShot = async (shotId: string) => {
    if (!production) return;
    setOperation(`regen:${shotId}`); setError(""); setActiveTab("Scenes"); setSelectedShotId(shotId);
    try { const current = await dispatch(production, "regenerateShot", { shotId, modelTier: "fast" }); setProduction(current); }
    catch (err: any) { setError(err?.message || `Failed to regenerate ${shotId}`); await refresh(production.id).catch(() => undefined); }
    finally { setOperation(null); }
  };

  const setContinuity = async (enabled: boolean) => {
    if (!production) return;
    setError("");
    try { setProduction(await dispatch(production, "setPresenterContinuity", { enabled })); }
    catch (err: any) { setError(err?.message || "Failed to update continuity mode"); }
  };

  const setEnvironmentContinuity = async (enabled: boolean) => {
    if (!production) return;
    setError("");
    try { setProduction(await dispatch(production, "setEnvironmentContinuity", { enabled })); }
    catch (err: any) { setError(err?.message || "Failed to update environment continuity"); }
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

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/92 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 via-white to-pink-300 font-black text-slate-950">2</div>
          <div><div className="font-black text-white">Studio 2 · Continuity Lab</div><div className="text-[11px] text-slate-600">Isolated clone of Creative Brief · /studio remains untouched</div></div>
        </div>
        <Link href="/studio" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 hover:text-white">Open original Studio</Link>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[360px_1fr_360px]">
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-teal-300"><FlaskConical className="h-4 w-4" /> Studio2 creative brief</div>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">Test clips without risking Studio.</h1>
        <label className="mt-6 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label>
        <textarea value={topic} onChange={event => setTopic(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-teal-300/35" />
        <div className="mt-5 grid gap-3">
          <Field label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
          <Field label="Length" value={duration} onChange={setDuration} options={["15 sec", "30 sec", "45 sec", "60 sec"]} />
          <Field label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
        </div>

        {manifest && <div className="mt-5 space-y-3">
          <label className="flex items-center justify-between rounded-2xl border border-teal-300/15 bg-teal-300/[0.05] p-4">
            <div><div className="flex items-center gap-2 text-sm font-black text-white"><UserRoundCheck className="h-4 w-4 text-teal-300" /> Presenter continuity</div><div className="mt-1 text-[11px] leading-5 text-slate-500">Same canonical presenter in every PRESENTER clip.</div></div>
            <input type="checkbox" checked={Boolean(meta?.presenterContinuity)} onChange={event => setContinuity(event.target.checked)} className="h-5 w-5 accent-teal-300" />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-teal-300/15 bg-teal-300/[0.05] p-4">
            <div><div className="text-sm font-black text-white">Environment continuity</div><div className="mt-1 text-[11px] leading-5 text-slate-500">Locks the location, background, lighting and major props for the next generation.</div></div>
            <input type="checkbox" checked={meta?.environmentContinuity !== false} onChange={event => setEnvironmentContinuity(event.target.checked)} className="h-5 w-5 accent-teal-300" />
          </label>
        </div>}

        <ActionButton onClick={buildPlan} disabled={busy || !topic.trim()} active={operation === "plan"} icon={Sparkles} idle={production ? "Create new Studio2 plan" : "Build Studio2 plan"} busyLabel="Building…" primary />
        {production && <ActionButton onClick={() => generateThroughRoughCut(false)} disabled={busy} active={operation === "all"} icon={Film} idle={generatedShotCount ? `Generate remaining + MP4 (${generatedShotCount}/${totalShotCount})` : "Generate all clips + MP4"} busyLabel="Generating…" primary />}
        {production && generatedShotCount > 0 && <ActionButton onClick={() => generateThroughRoughCut(true)} disabled={busy} active={operation === "fresh"} icon={RefreshCw} idle="Generate ALL clips fresh" busyLabel="Fresh generation…" />}
        {fullReelStale && <ActionButton onClick={rebuildFullReel} disabled={busy} active={operation === "rough"} icon={Film} idle="Rebuild Full Reel" busyLabel="Rebuilding full reel…" primary />}
        {roughCut?.videoUrl && <button onClick={() => setSelectedShotId(null)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/30 bg-teal-300/[0.09] py-3.5 text-sm font-black text-teal-50"><PlayCircle className="h-4 w-4" />Play Full Reel · {roughCut.actualDurationSec.toFixed(1)}s</button>}
        {roughCut?.videoUrl && <a href={roughCut.videoUrl} download className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.07] py-3.5 text-sm font-black text-emerald-100"><Download className="h-4 w-4" />Download selected-options MP4</a>}
        {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <p className="mt-4 text-[11px] leading-5 text-slate-600">Studio2 uses its own route/API namespace and studio2_-prefixed productions. It reuses the durable worker only for paid media generation.</p>
      </aside>

      <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]">
        <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-3">{["Scenes", "Script", "Captions"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>{tab}</button>)}</div>
        <div className="p-5 sm:p-8">
          {activeTab === "Scenes" && <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">CONTINUITY TEST CLIPS</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{manifest ? `${generatedShotCount}/${totalShotCount} clips generated · round ${meta?.generationRound || 1}` : "Build a Studio2 plan"}</h2>
            {roughCut && <button onClick={() => setSelectedShotId(null)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-teal-300/25 bg-teal-300/[0.07] px-4 py-2.5 text-sm font-black text-teal-100"><PlayCircle className="h-4 w-4" />Play full {roughCut.actualDurationSec.toFixed(1)}s reel</button>}
            {fullReelStale && <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-3 text-xs leading-5 text-amber-100/80">Clip selection changed after the previous combined render. Rebuild the Full Reel to review the currently selected clip options as one continuous video.</div>}
            {!manifest ? <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-600">Studio2 starts as a copy of the Creative Brief workflow, then adds isolated continuity and clip-variant controls.</div> : <div className="mt-8 space-y-4">{manifest.shots.map((shot, index) => {
              const options = meta?.clipOptions?.[shot.id] || [];
              const mode = meta?.subjectModes?.[shot.id] || "PRESENTER";
              const regenerating = operation === `regen:${shot.id}`;
              return <div key={shot.id} className={`rounded-2xl border p-4 ${selectedShotId === shot.id ? "border-teal-300/35 bg-teal-300/[0.05]" : "border-white/10 bg-white/[0.025]"}`}>
                <div className="flex items-start gap-4"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{index + 1}</div><div className="min-w-0 flex-1">
                  <div className="text-sm leading-6 text-slate-300">{shot.visualIntent}</div>
                  <div className="mt-1 text-xs text-slate-600">{shot.asset?.videoUrl ? `Current · ${shot.asset.actualDurationSec?.toFixed(2) || "?"}s · ${shot.asset.model || "provider"}` : `Pending · needs ${shot.generationDurationSec}s source`}</div>
                  <div className="mt-1 text-[11px] text-slate-700">Environment chain: {shot.dependsOnShotIds.length ? `continues from ${shot.dependsOnShotIds.join(", ")}` : "root shot"}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select value={mode} onChange={event => setSubjectMode(shot.id, event.target.value as SubjectMode)} disabled={busy} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-300">
                      <option value="PRESENTER">PRESENTER · canonical identity</option><option value="NO_PERSON">NO PERSON · strict B-roll</option>
                    </select>
                    {shot.asset?.videoUrl && <button onClick={() => setSelectedShotId(shot.id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:text-white"><Video className="mr-1 inline h-3.5 w-3.5" />Review clip</button>}
                    {manifest.audio?.narrationUrl && <button onClick={() => regenerateShot(shot.id)} disabled={busy} className="rounded-xl border border-pink-300/20 bg-pink-300/[0.05] px-3 py-2 text-xs font-black text-pink-100 disabled:opacity-50">{regenerating ? <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 inline h-3.5 w-3.5" />}Regenerate clip</button>}
                  </div>
                  {options.length > 0 && <div className="mt-3 rounded-xl border border-white/5 bg-black/15 p-3"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">Previous immutable options</div><div className="mt-2 flex flex-wrap gap-2">{options.map(option => <button key={option.id} onClick={() => selectOption(shot.id, option.id)} disabled={busy} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white">{option.label} · {option.asset.actualDurationSec?.toFixed(2) || "?"}s</button>)}</div></div>}
                </div></div>
              </div>;
            })}</div>}
          </div>}

          {activeTab === "Script" && <div><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">MASTER SCRIPT</div><h2 className="mt-2 text-3xl font-black text-white">Studio2 keeps the Creative Brief script behavior for controlled pipeline testing.</h2></div><button onClick={copyScript} disabled={!manifest} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-400"><Copy className="mr-1 inline h-4 w-4" />{copied ? "Copied" : "Copy"}</button></div><div className="mt-8 space-y-3">{script.length ? script.map((line, index) => <div key={`${index}-${line.slice(0, 18)}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300">{line}</div>) : <div className="text-sm text-slate-600">Build a plan first.</div>}</div></div>}
          {activeTab === "Captions" && <div><Captions className="h-8 w-8 text-teal-300" /><div className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-teal-300">CAPTION SOURCE</div><h2 className="mt-2 text-3xl font-black text-white">{manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned` : "Waiting for real narration alignment"}</h2></div>}
        </div>
      </section>

      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">
          {(roughCut || generatedShots.length > 0) && <div className="mb-3 flex flex-wrap gap-2 px-1">
            {roughCut && <button onClick={() => setSelectedShotId(null)} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-black ${!selectedShotId ? "border-teal-300/40 bg-teal-300/[0.08] text-teal-100" : "border-white/10 text-slate-500"}`}>FULL REEL</button>}
            {manifest?.shots.map((shot, index) => shot.asset?.videoUrl ? <button key={shot.id} onClick={() => setSelectedShotId(shot.id)} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-black ${selectedShotId === shot.id ? "border-pink-300/40 bg-pink-300/[0.08] text-pink-100" : "border-white/10 text-slate-500"}`}>CLIP {index + 1}</button> : null)}
          </div>}
          <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">{previewLabel}</div>
          {previewUrl ? <video key={previewUrl} src={previewUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" /> : <div className="flex aspect-[9/16] items-center justify-center rounded-[24px] bg-black/25 p-6 text-center text-sm text-slate-600">Generated Studio2 clip or combined MP4 appears here.</div>}
        </div>
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
          <div className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">Studio2 truth</div>
          <div className="mt-4 space-y-3 text-sm"><Truth label="Production" value={production?.id || "Not created"} /><Truth label="Revision" value={production ? `r${production.revision}` : "—"} /><Truth label="State" value={manifest?.status || "DRAFT"} /><Truth label="Presenter" value={meta?.presenterContinuity ? "Canonical anchor ON" : "Anchor OFF"} /><Truth label="Environment" value={meta?.environmentContinuity !== false ? "Continuity ON" : "Continuity OFF"} /><Truth label="Generation round" value={String(meta?.generationRound || 0)} /><Truth label="Clips" value={manifest ? `${generatedShotCount}/${totalShotCount}` : "0"} /><Truth label="Combined MP4" value={roughCut ? `${roughCut.actualDurationSec.toFixed(1)}s ready` : fullReelStale ? "Needs rebuild" : "Pending"} /></div>
          <div className="mt-5 rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-3 text-[11px] leading-5 text-teal-100/70">Regeneration never intentionally deletes the prior video. The old asset is archived as a selectable clip option before a new paid generation is queued.</div>
        </div>
      </aside>
    </main>
  </div>;
}

function ActionButton({ onClick, disabled, active, icon: Icon, idle, busyLabel, primary = false }: { onClick: () => void; disabled: boolean; active: boolean; icon: React.ComponentType<{ className?: string }>; idle: string; busyLabel: string; primary?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black disabled:opacity-50 ${primary ? "bg-white text-slate-950" : "border border-teal-300/20 bg-white/[0.04] text-white"}`}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{active ? busyLabel : idle}</button>;
}
function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><div className="relative mt-2"><select value={value} onChange={event => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 pr-9 text-sm text-slate-200 outline-none">{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-600" /></div></label>; }
function Truth({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><span className="text-slate-400">{label}</span><span className="max-w-[190px] truncate text-xs font-semibold text-slate-500">{value}</span></div>; }
