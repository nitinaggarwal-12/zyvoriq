"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Clapperboard, Captions, Mic2, Image as ImageIcon, Copy, Check, Instagram, Youtube, ChevronDown, Loader2, CircleAlert, Database, Film, AudioLines, Video, Download } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";

type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type StudioOperation = "plan" | "narration" | "shot" | "rough" | "all" | null;

function durationNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function scriptLines(manifest: ReelProductionManifest | null, topic: string) {
  if (!manifest) return [`Enter a brief for ${topic || "your topic"}, then build a persisted production plan.`];
  return (manifest.masterScript.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [manifest.masterScript]).map(s => s.trim()).filter(Boolean);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ReelStudio() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [activeTab, setActiveTab] = useState("Script");
  const [copied, setCopied] = useState(false);
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [operation, setOperation] = useState<StudioOperation>(null);
  const [error, setError] = useState("");
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  const manifest = production?.manifest || null;
  const generatedShotCount = manifest?.shots.filter(s => Boolean(s.asset?.videoUrl)).length || 0;
  const totalShotCount = manifest?.shots.length || 0;
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const generatedShots = manifest?.shots.filter(s => Boolean(s.asset?.videoUrl)) || [];
  const selectedShot = (selectedShotId ? manifest?.shots.find(s => s.id === selectedShotId && s.asset?.videoUrl) : undefined) || (!roughCut ? generatedShots[0] : undefined);
  const previewVideoUrl = selectedShot?.asset?.videoUrl || roughCut?.videoUrl || null;
  const canGenerateShot = Boolean(manifest && ["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(manifest.status) && generatedShotCount < totalShotCount);
  const canGenerateAll = Boolean(manifest && !roughCut && ["SCRIPT_READY", "SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING", "ROUGH_CUT_READY"].includes(manifest.status));
  const script = useMemo(() => scriptLines(manifest, topic), [manifest, topic]);
  const scenes = useMemo(() => manifest?.shots.map((shot) => {
    const end = shot.editorialStartSec + shot.editorialDurationSec;
    const evidence = shot.asset?.actualDurationSec ? `generated ${shot.asset.actualDurationSec.toFixed(2)}s · ${shot.asset.model || "provider"}` : `needs ${shot.generationDurationSec}s source`;
    return `${shot.editorialStartSec.toFixed(1)}–${end.toFixed(1)}s · ${shot.visualIntent} · ${evidence}`;
  }) || [], [manifest]);
  const captions = useMemo(() => manifest?.shots.filter(s => s.scriptText.trim()).map(s => s.scriptText.trim().toUpperCase()) || [], [manifest]);

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
      const queued = data.operation as DurableOperation;
      if (queued.status === "SUCCEEDED") return refreshProduction(productionId);
      if (queued.status === "FAILED") {
        await refreshProduction(productionId).catch(() => undefined);
        throw new Error(queued.lastError || "Production operation failed");
      }
      await sleep(1500);
    }
    await refreshProduction(productionId).catch(() => undefined);
    throw new Error("The production is still running. Its durable job will continue even if this page stops polling.");
  };

  const dispatchAction = async (current: StoredProduction, action: string, extra: Record<string, unknown> = {}) => {
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

  const runAction = async (action: string, op: StudioOperation, extra: Record<string, unknown> = {}) => {
    if (!production) return;
    setOperation(op);
    setError("");
    try {
      if (action === "generateNarration" || action === "generateNextShot") setActiveTab("Scenes");
      await dispatchAction(production, action, extra);
    } catch (err: any) {
      setError(err?.message || `${action} failed`);
      try { await refreshProduction(production.id); } catch {}
    } finally {
      setOperation(null);
    }
  };

  const generateAllMp4 = async () => {
    if (!production) return;
    const productionId = production.id;
    setOperation("all");
    setError("");
    setActiveTab("Scenes");
    setSelectedShotId(null);
    try {
      let current = await refreshProduction(productionId);

      // A single Studio action orchestrates the existing durable operations. Each paid
      // generation remains independently persisted/idempotent, and shots stay sequential
      // so predecessor-frame continuity is never bypassed.
      if (current.manifest.status === "SCRIPT_READY") {
        current = await dispatchAction(current, "generateNarration");
      }

      for (;;) {
        const remaining = current.manifest.shots.filter(s => !s.asset?.videoUrl);
        if (!remaining.length) break;
        if (!["SHOTS_PLANNED", "VIDEO_GENERATING", "REPAIRING"].includes(current.manifest.status)) {
          throw new Error(`Cannot continue all-clips generation while production is ${current.manifest.status}`);
        }
        current = await dispatchAction(current, "generateNextShot", { modelTier: "fast" });
      }

      if (!current.manifest.outputs?.narratedRoughCut) {
        if (current.manifest.status !== "ROUGH_CUT_READY") {
          current = await refreshProduction(productionId);
        }
        if (current.manifest.status === "ROUGH_CUT_READY") {
          current = await dispatchAction(current, "renderNarratedRoughCut");
        }
      }

      setProduction(current);
      setSelectedShotId(null);
    } catch (err: any) {
      setError(err?.message || "Generate all clips + MP4 failed");
      try { await refreshProduction(productionId); } catch {}
    } finally {
      setOperation(null);
    }
  };

  const buildProduction = async () => {
    setOperation("plan");
    setError("");
    try {
      const response = await fetch("/api/reels/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform, requestedDurationSec: durationNumber(duration) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create production");
      setProduction(data.production);
      setActiveTab("Script");
    } catch (err: any) {
      setError(err?.message || "Failed to create production");
    } finally {
      setOperation(null);
    }
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(script.join("\n")); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const busy = operation !== null;
  const generateAllBusyLabel = manifest?.status === "SCRIPT_READY"
    ? "Generating narration…"
    : generatedShotCount < totalShotCount
      ? `Generating all · ${generatedShotCount}/${totalShotCount}`
      : "Combining one MP4…";

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 font-black text-slate-950">Z</div><div><div className="font-black tracking-[-0.02em] text-white">Reel Studio</div><div className="text-[11px] text-slate-600">Production-manifest workspace</div></div></div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex"><span className={`h-2 w-2 rounded-full ${production ? "bg-emerald-400" : "bg-slate-700"}`} />{production ? `Persisted · rev ${production.revision}` : "Not yet persisted"}</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[360px_1fr_360px]">
        <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Creative brief</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">What do you want to post?</h1>
          <label className="mt-6 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-pink-300/35" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
            <Field label="Length" value={duration} onChange={setDuration} options={["15 sec", "30 sec", "45 sec", "60 sec"]} />
            <Field label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
          </div>

          <ActionButton onClick={buildProduction} disabled={busy || !topic.trim()} active={operation === "plan"} icon={Sparkles} idle={production ? "Create new plan" : "Build reel plan"} busyLabel="Building…" primary />
          {canGenerateAll && <ActionButton onClick={generateAllMp4} disabled={busy} active={operation === "all"} icon={Film} idle={generatedShotCount ? `Generate remaining + MP4 (${generatedShotCount}/${totalShotCount})` : "Generate all clips + MP4"} busyLabel={generateAllBusyLabel} primary />}
          {roughCut?.videoUrl && <a href={roughCut.videoUrl} download className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.07] py-3.5 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/[0.12]"><Download className="h-4 w-4" />Download combined MP4</a>}
          {manifest?.status === "SCRIPT_READY" && <ActionButton onClick={() => runAction("generateNarration", "narration")} disabled={busy} active={operation === "narration"} icon={AudioLines} idle="Generate real narration" busyLabel="Generating + aligning…" />}
          {canGenerateShot && <ActionButton onClick={() => runAction("generateNextShot", "shot", { modelTier: "fast" })} disabled={busy} active={operation === "shot"} icon={Video} idle={`Generate next shot (${generatedShotCount}/${totalShotCount})`} busyLabel="Generating + probing…" />}
          {manifest?.status === "ROUGH_CUT_READY" && <ActionButton onClick={() => runAction("renderNarratedRoughCut", "rough")} disabled={busy} active={operation === "rough"} icon={Film} idle="Render narrated rough cut" busyLabel="Rendering + probing…" />}

          {canGenerateAll && <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">Generate all runs clips sequentially for continuity, reuses completed clips, then renders one narrated MP4.</p>}
          <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">States advance only when persisted artifacts and measurable media evidence exist.</p>
          {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </aside>

        <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]">
          <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-3">{["Script", "Scenes", "Captions", "Cover"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>{tab}</button>)}</div>
          <div className="p-5 sm:p-8">
            {activeTab === "Script" && <ScriptPanel script={script} copied={copied} onCopy={copyText} />}
            {activeTab === "Scenes" && <ScenesPanel manifest={manifest} title={manifest ? `${generatedShotCount}/${totalShotCount} real source clips generated` : "Build a plan to create shots"} selectedShotId={selectedShot?.id || null} onReview={id => setSelectedShotId(id)} fallbackItems={scenes.length ? scenes : ["No persisted shot plan yet."]} />}
            {activeTab === "Captions" && <ListPanel icon={Captions} eyebrow={manifest?.audio.timingSource === "actual-alignment" ? "ALIGNED NARRATION SOURCE" : "DRAFT CAPTION SOURCE"} title={manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned to the waveform` : "Final timing waits for real narration"} items={captions.length ? captions : ["Captions are not marked synchronized until real audio alignment exists."]} />}
            {activeTab === "Cover" && <CoverPanel topic={topic} />}
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">
            {previewVideoUrl ? (
              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">{selectedShot ? `Shot ${Math.max(1, (manifest?.shots.findIndex(s => s.id === selectedShot.id) ?? 0) + 1)} review` : "Narrated rough cut"}</div><div className="mt-1 text-xs text-slate-500">{selectedShot ? `${selectedShot.editorialStartSec.toFixed(1)}–${(selectedShot.editorialStartSec + selectedShot.editorialDurationSec).toFixed(1)}s · ${selectedShot.asset?.model || "generated source"}` : "Full production preview"}</div></div>
                  {selectedShot && roughCut?.videoUrl && <button onClick={() => setSelectedShotId(null)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white">ROUGH CUT</button>}
                </div>
                <video key={previewVideoUrl} className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" src={previewVideoUrl} controls playsInline preload="metadata" />
              </div>
            ) : (
              <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.32),transparent_28%),radial-gradient(circle_at_30%_75%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(160deg,#19111d,#0b1016_58%,#0a1515)]">
                <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50"><span>Plan preview</span><span>{manifest ? `${manifest.plannedDurationSec}s` : duration}</span></div>
                <div className="absolute inset-x-5 top-[26%] text-center"><div className="text-3xl font-black leading-none tracking-[-0.05em] text-white">{topic || "Your Reel hook"}</div><div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-pink-300" /></div>
                <div className="absolute inset-x-5 bottom-20 rounded-2xl bg-black/35 p-4 backdrop-blur-md"><div className="text-sm font-bold text-white">{manifest ? manifest.shots[0]?.scriptText || "Visual hook" : "Build the production plan first."}</div><div className="mt-2 text-[10px] text-white/50">Planning preview only</div></div>
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[10px] text-white/40"><span>{manifest?.status || "DRAFT"}</span><span>9:16</span></div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Production truth</div>
            <div className="mt-4 space-y-3 text-sm">
              <Status icon={Database} label="Manifest" value={production ? `Persisted r${production.revision}` : "Not created"} />
              <Status icon={Film} label="State" value={manifest?.status || "DRAFT"} />
              <Status icon={Mic2} label="Narration" value={manifest?.audio.narrationUrl ? `${manifest.audio.actualDurationSec?.toFixed(2)}s` : "Pending"} />
              <Status icon={Captions} label="Timing" value={manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned` : "Pending"} />
              <Status icon={Video} label="Video sources" value={manifest ? `${generatedShotCount}/${totalShotCount}` : "Pending"} />
              <Status icon={Film} label="Combined MP4" value={roughCut ? `${roughCut.actualDurationSec.toFixed(2)}s` : "Pending"} />
              <Status icon={Instagram} label="Primary" value={manifest?.platform || platform} />
              <Status icon={Youtube} label="Final variant" value="Not generated" />
            </div>
            {manifest?.status === "SCRIPT_READY" && <TruthNote tone="amber">Next: create real narration and word-level alignment.</TruthNote>}
            {manifest?.status === "AUDIO_GENERATING" && <TruthNote tone="amber">Narration is running in the durable production worker. This page may disconnect without cancelling the job.</TruthNote>}
            {manifest?.status === "SHOTS_PLANNED" && <TruthNote tone="green">Narration is aligned. Generate the first dependency-eligible Veo source clip.</TruthNote>}
            {manifest?.status === "VIDEO_GENERATING" && <TruthNote tone="green">{generatedShotCount}/{totalShotCount} source clips are persisted and probed.</TruthNote>}
            {manifest?.status === "ROUGH_CUT_READY" && <TruthNote tone="green">All source clips exist. Render the exact-duration combined MP4.</TruthNote>}
            {manifest?.status === "MIXING" && <TruthNote tone="amber">Combined narrated MP4 exists. Captions, music/SFX mix, master render and QA are still pending.</TruthNote>}
            {manifest?.status === "FAILED" && <TruthNote tone="red">The last production step failed. No downstream stage has been marked complete.</TruthNote>}
          </div>
        </aside>
      </main>
    </div>
  );
}

function ActionButton({ onClick, disabled, active, icon: Icon, idle, busyLabel, primary = false }: { onClick: () => void; disabled: boolean; active: boolean; icon: React.ComponentType<{ className?: string }>; idle: string; busyLabel: string; primary?: boolean }) {
  const style = primary ? "bg-white text-slate-950" : "border border-pink-300/20 bg-white/[0.04] text-white";
  return <button onClick={onClick} disabled={disabled} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{active ? busyLabel : idle}</button>;
}

function TruthNote({ tone, children }: { tone: "amber" | "green" | "red"; children: React.ReactNode }) {
  const cls = tone === "green" ? "border-emerald-300/15 bg-emerald-300/5 text-emerald-100/70" : tone === "red" ? "border-red-300/15 bg-red-300/5 text-red-100/70" : "border-amber-300/15 bg-amber-300/5 text-amber-100/70";
  return <div className={`mt-5 rounded-xl border p-3 text-[11px] leading-5 ${cls}`}>{children}</div>;
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="block"><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><div className="relative mt-2"><select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 pr-9 text-sm text-slate-200 outline-none">{options.map(o => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-600" /></div></label>;
}

function ScriptPanel({ script, copied, onCopy }: { script: string[]; copied: boolean; onCopy: () => void }) {
  return <div><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">MASTER SCRIPT</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">The script is part of the production manifest.</h2></div><button onClick={onCopy} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">{copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button></div><div className="mt-8 space-y-3">{script.map((line, i) => <div key={`${i}-${line.slice(0, 20)}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300"><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] font-black text-slate-500">{i + 1}</span>{line}</div>)}</div></div>;
}

function ListPanel({ icon: Icon, eyebrow, title, items }: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; items: string[] }) {
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><Icon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">{eyebrow}</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{title}</h2><div className="mt-8 space-y-3">{items.map((item, i) => <div key={`${i}-${item.slice(0, 24)}`} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{i + 1}</div><div className="text-sm leading-7 text-slate-300">{item}</div></div>)}</div></div>;
}

function ScenesPanel({ manifest, title, selectedShotId, onReview, fallbackItems }: { manifest: ReelProductionManifest | null; title: string; selectedShotId: string | null; onReview: (id: string) => void; fallbackItems: string[] }) {
  return <div>
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><Clapperboard className="h-5 w-5" /></div>
    <div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">CANONICAL SHOT PLAN</div>
    <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{title}</h2>
    {!manifest ? <div className="mt-8"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-slate-300">{fallbackItems[0]}</div></div> : (
      <div className="mt-8 space-y-3">{manifest.shots.map((shot, i) => {
        const end = shot.editorialStartSec + shot.editorialDurationSec;
        const generated = Boolean(shot.asset?.videoUrl);
        const selected = selectedShotId === shot.id;
        return <div key={shot.id} className={`rounded-2xl border p-4 transition ${selected ? "border-pink-300/40 bg-pink-300/[0.06]" : "border-white/10 bg-white/[0.025]"}`}>
          <div className="flex gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{i + 1}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-7 text-slate-300">{shot.editorialStartSec.toFixed(1)}–{end.toFixed(1)}s · {shot.visualIntent}</div>
              <div className={`mt-1 text-xs font-semibold ${generated ? "text-emerald-300/80" : "text-slate-600"}`}>{generated ? `Generated ${shot.asset?.actualDurationSec?.toFixed(2) || "?"}s · ${shot.asset?.model || "provider"}` : `Needs ${shot.generationDurationSec}s source`}</div>
              {generated && <button onClick={() => onReview(shot.id)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-pink-300/25 bg-pink-300/[0.06] px-3 py-2 text-xs font-black text-pink-100 transition hover:border-pink-300/50 hover:bg-pink-300/[0.1]" aria-label={`Review shot ${i + 1}`}><Video className="h-4 w-4" />{selected ? "Reviewing shot" : `Review shot ${i + 1}`}</button>}
            </div>
          </div>
        </div>;
      })}</div>
    )}
    {manifest && manifest.shots.some(s => s.asset?.videoUrl) && <div className="mt-4 text-xs leading-5 text-slate-600">Select <span className="font-bold text-slate-400">Review shot</span> to play the real generated source in the preview panel. Browser video controls support play, pause, seek, volume and full-screen review.</div>}
  </div>;
}

function CoverPanel({ topic }: { topic: string }) {
  const base = topic.trim() || "YOUR NEXT REEL";
  const options = [base.toUpperCase(), `WHY ${base.toUpperCase()}`, "STOP IGNORING THIS"];
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><ImageIcon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">COVER DIRECTIONS</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">Creative options, not generated assets yet.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{options.map((title, i) => <div key={`${i}-${title}`} className="aspect-[4/5] rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.24),transparent_25%),linear-gradient(150deg,#17111b,#0b1015)] p-5"><div className="text-xs font-bold text-slate-500">OPTION {i + 1}</div><div className="mt-20 text-xl font-black leading-tight tracking-[-0.035em] text-white">{title}</div></div>)}</div></div>;
}

function Status({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" /><span>{label}</span></div><span className="max-w-[155px] truncate text-xs font-semibold text-slate-500">{value}</span></div>;
}
