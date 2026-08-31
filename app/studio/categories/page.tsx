"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AudioLines, CircleAlert, Film, FolderOpen, Loader2, Sparkles, Video } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";
import type { GenreConcept } from "@/lib/tier6/genre_concepts";
import { ReelCreationControls, type ReelCreationDraft } from "../ReelCreationControls";

type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type BusyState = "plan" | "all" | null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const seconds = (value: string) => Number.parseInt(value, 10) || 30;

export default function CategoryReelCreatorPage() {
  const [draft, setDraft] = useState<ReelCreationDraft>({ mode: "category", clusterId: "all", categoryId: "all", conceptId: "", characterId: "auto", visualStyleId: "auto", musicPreset: "auto" });
  const [topic, setTopic] = useState("Choose a category or concept, then refine the idea here");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const [error, setError] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  const manifest = production?.manifest;
  const generatedShots = manifest?.shots.filter(shot => Boolean(shot.asset?.videoUrl)) || [];
  const selectedShot = selectedShotId ? generatedShots.find(shot => shot.id === selectedShotId) : undefined;
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const previewUrl = selectedShot?.asset?.videoUrl || roughCut?.videoUrl || generatedShots[0]?.asset?.videoUrl || null;

  const applyConcept = (concept: GenreConcept) => {
    setTopic(concept.title);
    setDuration(`${concept.recommendedDuration} sec`);
  };

  const refreshProduction = async (id: string) => {
    const response = await fetch(`/api/reels/productions/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to refresh production");
    setProduction(data.production);
    return data.production as StoredProduction;
  };

  const waitForOperation = async (operationId: string, productionId: string) => {
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to read operation status");
      const operation = data.operation as DurableOperation;
      if (operation.status === "SUCCEEDED") return refreshProduction(productionId);
      if (operation.status === "FAILED") {
        await refreshProduction(productionId).catch(() => undefined);
        throw new Error(operation.lastError || "Production operation failed");
      }
      await sleep(1500);
    }
    throw new Error("The durable production is still running. Refresh later to continue from persisted state.");
  };

  const dispatch = async (current: StoredProduction, action: string, extra: Record<string, unknown> = {}) => {
    const response = await fetch(`/api/reels/productions/${encodeURIComponent(current.id)}`, {
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
    setBusy("plan");
    setError("");
    try {
      const response = await fetch("/api/reels/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          requestedDurationSec: seconds(duration),
          creationIntent: {
            mode: draft.mode,
            categoryId: draft.categoryId,
            conceptId: draft.conceptId,
            characterId: draft.characterId,
            visualStyleId: draft.visualStyleId,
            musicPreset: draft.musicPreset,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create category production");
      setProduction(data.production);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to create category production");
    } finally {
      setBusy(null);
    }
  };

  const generateAll = async () => {
    if (!production) return;
    setBusy("all");
    setError("");
    const productionId = production.id;
    try {
      let current = await refreshProduction(productionId);
      if (current.manifest.status === "SCRIPT_READY") current = await dispatch(current, "generateNarration");
      for (;;) {
        const remaining = current.manifest.shots.filter(shot => !shot.asset?.videoUrl);
        if (!remaining.length) break;
        if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) throw new Error(`Cannot continue generation while production is ${current.manifest.status}`);
        current = await dispatch(current, "generateNextShot", { modelTier: "fast" });
      }
      if (!current.manifest.outputs?.narratedRoughCut) {
        current = await refreshProduction(productionId);
        if (current.manifest.status === "ROUGH_CUT_READY") current = await dispatch(current, "renderNarratedRoughCut");
      }
      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Generate all failed");
      await refreshProduction(productionId).catch(() => undefined);
    } finally {
      setBusy(null);
    }
  };

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07090d]/95 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-5 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/studio" className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white" aria-label="Back to Quick Brief"><ArrowLeft className="h-5 w-5" /></Link>
          <div><div className="font-black text-white">24-Category Reel Creator</div><div className="text-[11px] text-slate-600">Same durable Production Manifest pipeline as Quick Brief</div></div>
        </div>
        <Link href="/studio/library" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-300 hover:text-white"><FolderOpen className="h-4 w-4" /> Library</Link>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[430px_1fr]">
      <section className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-pink-300">Browse & direct</div>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.035em] text-white">Choose the category, then keep full creative control.</h1>
        <ReelCreationControls value={draft} onChange={setDraft} onApplyConcept={applyConcept} />

        <label className="mt-5 block text-xs font-bold text-slate-500">IDEA / TITLE</label>
        <textarea value={topic} onChange={event => setTopic(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-pink-300/35" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Control label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
          <Control label="Length" value={duration} onChange={setDuration} options={Array.from(new Set([duration, "15 sec", "30 sec", "45 sec", "60 sec"]))} />
          <Control label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
        </div>

        <button onClick={buildPlan} disabled={busy !== null || !topic.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 disabled:opacity-50">
          {busy === "plan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {busy === "plan" ? "Building…" : production ? "Create new category plan" : "Build category reel plan"}
        </button>
        {production && <button onClick={generateAll} disabled={busy !== null} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-300/20 bg-pink-300/[0.06] py-3.5 text-sm font-black text-pink-100 disabled:opacity-50">
          {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />} {busy === "all" ? "Generating through durable worker…" : "Generate all clips + MP4"}
        </button>}
        {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      </section>

      <section className="min-w-0 space-y-5">
        <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Production manifest</div><h2 className="mt-2 text-2xl font-black text-white">{manifest?.topic || "Choose a concept and build a plan"}</h2></div>
            {manifest && <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400">{manifest.status} · r{production?.revision}</div>}
          </div>

          {manifest ? <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Fact label="Category" value={manifest.creationIntent?.categoryLabel || "Custom"} />
            <Fact label="Concept" value={manifest.creationIntent?.conceptTitle || "Custom brief"} />
            <Fact label="Persona" value={manifest.creationIntent?.characterName || "Auto"} />
            <Fact label="Visual" value={manifest.creationIntent?.visualStyleLabel || "Auto"} />
          </div> : <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-sm leading-7 text-slate-600">All 24 category pillars are available on the left. Selecting a concept feeds its canonical category, character, visual direction, hook and music direction into the current Reel Production Manifest instead of the older Tier 6 generation path.</div>}

          {manifest && <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Master script</div>
            <div className="mt-3 text-sm leading-7 text-slate-300">{manifest.masterScript}</div>
          </div>}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-pink-300"><Video className="h-4 w-4" /> Generated pieces</div>
            <div className="mt-4 space-y-2">
              {manifest?.shots.map((shot, index) => <button key={shot.id} type="button" disabled={!shot.asset?.videoUrl} onClick={() => setSelectedShotId(shot.id)} className={`w-full rounded-xl border p-3 text-left text-xs transition ${shot.asset?.videoUrl ? "border-white/10 bg-white/[0.03] text-slate-300 hover:border-pink-300/30" : "border-white/5 bg-black/10 text-slate-700"}`}>
                <span className="font-black">Shot {index + 1}</span> · {shot.visualIntent}<span className="ml-2 text-[10px]">{shot.asset?.videoUrl ? "GENERATED" : "PENDING"}</span>
              </button>)}
              {!manifest && <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-600">No production yet.</div>}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-3">
            {previewUrl ? <video key={previewUrl} src={previewUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-[22px] bg-black object-cover" /> : <div className="flex aspect-[9/16] items-center justify-center rounded-[22px] bg-black/30 p-6 text-center text-xs leading-5 text-slate-600">Generated shot or combined MP4 preview appears here.</div>}
            {manifest && <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
              <div className="rounded-lg bg-white/[0.025] p-2"><AudioLines className="mb-1 h-3.5 w-3.5" />Narration: {manifest.audio.narrationUrl ? "ready" : "pending"}</div>
              <div className="rounded-lg bg-white/[0.025] p-2"><Film className="mb-1 h-3.5 w-3.5" />MP4: {roughCut ? "ready" : "pending"}</div>
            </div>}
          </div>
        </div>
      </section>
    </main>
  </div>;
}

function Control({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none">{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">{label}</div><div className="mt-1 truncate text-xs font-bold text-slate-300" title={value}>{value}</div></div>;
}
