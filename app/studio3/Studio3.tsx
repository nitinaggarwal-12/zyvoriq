"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, Film, FlaskConical, Loader2, PlayCircle, RefreshCw, Scissors, Sparkles, UserRoundCheck, WandSparkles } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";

type StoredProduction = { id: string; revision: number; manifest: ReelProductionManifest; createdAt: string; updatedAt: string };
type DurableOperation = { id: string; status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };
type OmniMode = "EDIT" | "REPAIR" | "EXTEND";
type OmniOption = { id: string; mode: OmniMode; videoUrl: string; model: string; createdAt: string; expiresAt: string; prompt: string };
type Studio3Meta = {
  presenterContinuity: boolean; environmentContinuity: boolean; generationRound: number;
  omniModel: string; omniOptions: Record<string, OmniOption[]>; selectedOmniOptionIds: Record<string, string | undefined>;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const durationNumber = (value: string) => Number.parseInt(value, 10) || 30;

export function Studio3() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [omniPrompt, setOmniPrompt] = useState("Fix the background so it matches the surrounding clips. Preserve the presenter and everything else.");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const manifest = production?.manifest || null;
  const meta = ((manifest as any)?.studio3 || null) as Studio3Meta | null;
  const shots = manifest?.shots || [];
  const generated = shots.filter(shot => Boolean(shot.asset?.videoUrl));
  const roughCut = manifest?.outputs?.narratedRoughCut;
  const selectedShot = selectedShotId ? shots.find(shot => shot.id === selectedShotId) : null;
  const selectedOmniId = selectedShotId ? meta?.selectedOmniOptionIds?.[selectedShotId] : undefined;
  const selectedOmni = selectedShotId ? (meta?.omniOptions?.[selectedShotId] || []).find(option => option.id === selectedOmniId) : undefined;
  const previewUrl = selectedOmni?.videoUrl || selectedShot?.asset?.videoUrl || roughCut?.videoUrl || generated[0]?.asset?.videoUrl || null;
  const previewLabel = selectedOmni ? `Omni ${selectedOmni.mode}` : selectedShot ? `Clip ${shots.findIndex(s => s.id === selectedShot.id) + 1}` : roughCut ? "Full Reel" : "Preview";
  const fullReelStale = Boolean(manifest && !roughCut && shots.length > 0 && generated.length === shots.length && manifest.status === "ROUGH_CUT_READY");
  const script = useMemo(() => manifest?.masterScript || "", [manifest]);

  async function refresh(id: string) {
    const response = await fetch(`/api/studio3/productions/${encodeURIComponent(id)}`, { cache: "no-store" }); const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Failed to refresh Studio3"); setProduction(data.production); return data.production as StoredProduction;
  }
  async function waitForOperation(operationId: string, productionId: string) {
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      const response = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" }); const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to read durable operation"); const op = data.operation as DurableOperation;
      if (op.status === "SUCCEEDED") return refresh(productionId); if (op.status === "FAILED") throw new Error(op.lastError || "Generation failed"); await sleep(1500);
    }
    throw new Error("Generation is still running. Refresh later.");
  }
  async function dispatch(current: StoredProduction, action: string, extra: Record<string, unknown> = {}) {
    const response = await fetch(`/api/studio3/productions/${encodeURIComponent(current.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, expectedRevision: current.revision, ...extra }) });
    const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || `${action} failed`); setProduction(data.production);
    return data.queued && data.operation?.id ? waitForOperation(String(data.operation.id), current.id) : data.production as StoredProduction;
  }
  async function buildPlan() {
    setBusy("plan"); setError(""); try {
      const response = await fetch("/api/studio3/productions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, tone, platform, requestedDurationSec: durationNumber(duration) }) });
      const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || "Failed to build Studio3 plan"); setProduction(data.production); setSelectedShotId(null);
    } catch (e: any) { setError(e?.message || "Failed to build plan"); } finally { setBusy(null); }
  }
  async function generateAll(fresh = false) {
    if (!production) return; setBusy(fresh ? "fresh" : "all"); setError(""); setSelectedShotId(null);
    try {
      let current = await refresh(production.id); if (current.manifest.status === "SCRIPT_READY") current = await dispatch(current, "generateNarration");
      if (fresh && current.manifest.shots.some(s => s.asset?.videoUrl)) current = await dispatch(current, "generateAllFresh");
      while (current.manifest.shots.some(s => !s.asset?.videoUrl)) current = await dispatch(current, "generateNextShot", { modelTier: "fast" });
      current = await refresh(current.id); if (current.manifest.status === "ROUGH_CUT_READY" && !current.manifest.outputs?.narratedRoughCut) current = await dispatch(current, "renderNarratedRoughCut"); setProduction(current);
    } catch (e: any) { setError(e?.message || "Generation failed"); await refresh(production.id).catch(() => undefined); } finally { setBusy(null); }
  }
  async function rebuildFullReel() {
    if (!production) return; setBusy("rough"); setError(""); try { const current = await dispatch(production, "renderNarratedRoughCut"); setProduction(current); setSelectedShotId(null); } catch (e: any) { setError(e?.message || "Full reel rebuild failed"); } finally { setBusy(null); }
  }
  async function regenerate(shotId: string) {
    if (!production) return; setBusy(`regen:${shotId}`); setError(""); try { setProduction(await dispatch(production, "regenerateShot", { shotId, modelTier: "fast" })); setSelectedShotId(shotId); } catch (e: any) { setError(e?.message || "Regeneration failed"); } finally { setBusy(null); }
  }
  async function omni(mode: OmniMode) {
    if (!production || !selectedShotId) return; setBusy(`omni:${mode}`); setError("");
    try {
      const response = await fetch(`/api/studio3/omni/${encodeURIComponent(production.id)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: production.revision, shotId: selectedShotId, mode, prompt: omniPrompt }) });
      const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || `Omni ${mode.toLowerCase()} failed`); setProduction(data.production);
    } catch (e: any) { setError(e?.message || "Omni operation failed"); } finally { setBusy(null); }
  }
  async function selectOmni(shotId: string, optionId?: string) {
    if (!production) return; setError(""); try { setProduction(await dispatch(production, "selectOmniOption", { shotId, optionId })); setSelectedShotId(shotId); } catch (e: any) { setError(e?.message || "Failed to select Omni option"); }
  }

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
      <div className="flex items-center gap-4"><Link href="/" className="rounded-xl p-2 text-slate-500 hover:text-white"><ArrowLeft className="h-5 w-5" /></Link><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-300 via-white to-cyan-300 font-black text-slate-950">3</div><div><div className="font-black text-white">Studio 3 · Omni Repair Lab</div><div className="text-[11px] text-slate-600">Clone of Studio2 + Gemini Omni editing, repair and extension</div></div></div>
      <div className="flex gap-2"><Link href="/studio2" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 hover:text-white">Studio2</Link><Link href="/studio" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-400 hover:text-white">Studio</Link></div>
    </div></header>

    <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[350px_1fr_380px]">
      <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-300"><FlaskConical className="h-4 w-4" /> Studio3 creative brief</div>
        <h1 className="mt-2 text-2xl font-black">Generate with Veo. Repair with Omni.</h1>
        <label className="mt-5 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label><textarea value={topic} onChange={e => setTopic(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm outline-none" />
        <Select label="Tone" value={tone} setValue={setTone} values={["Confident & conversational","Warm & relatable","Fast & energetic","Expert & credible","Playful & witty"]} />
        <Select label="Length" value={duration} setValue={setDuration} values={["15 sec","30 sec","45 sec","60 sec"]} />
        <Select label="Platform" value={platform} setValue={setPlatform} values={["Instagram Reels","YouTube Shorts","TikTok"]} />
        <Button active={busy === "plan"} disabled={Boolean(busy) || !topic.trim()} onClick={buildPlan} icon={Sparkles} text={production ? "Create new Studio3 plan" : "Build Studio3 plan"} primary />
        {production && <Button active={busy === "all"} disabled={Boolean(busy)} onClick={() => generateAll(false)} icon={Film} text={generated.length ? `Generate remaining + MP4 (${generated.length}/${shots.length})` : "Generate all clips + MP4"} primary />}
        {production && generated.length > 0 && <Button active={busy === "fresh"} disabled={Boolean(busy)} onClick={() => generateAll(true)} icon={RefreshCw} text="Generate ALL clips fresh" />}
        {fullReelStale && <Button active={busy === "rough"} disabled={Boolean(busy)} onClick={rebuildFullReel} icon={Film} text="Rebuild Full Reel" primary />}
        {roughCut?.videoUrl && <button onClick={() => setSelectedShotId(null)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/[0.08] py-3 text-sm font-black"><PlayCircle className="h-4 w-4" />Play Full Reel · {roughCut.actualDurationSec.toFixed(1)}s</button>}
        {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-200"><CircleAlert className="h-4 w-4 shrink-0" />{error}</div>}
      </aside>

      <section className="rounded-[26px] border border-white/10 bg-[#0a0d12] p-6">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">CLIPS + OMNI OPTIONS</div><h2 className="mt-2 text-3xl font-black">{manifest ? `${generated.length}/${shots.length} clips · round ${meta?.generationRound || 1}` : "Build a Studio3 plan"}</h2>
        {manifest && <div className="mt-7 space-y-4">{shots.map((shot, index) => {
          const omniOptions = meta?.omniOptions?.[shot.id] || []; const selected = meta?.selectedOmniOptionIds?.[shot.id];
          return <div key={shot.id} className={`rounded-2xl border p-4 ${selectedShotId === shot.id ? "border-violet-300/35 bg-violet-300/[0.04]" : "border-white/10"}`}>
            <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-black">{index + 1}</div><div className="min-w-0 flex-1"><div className="text-sm leading-6 text-slate-300">{shot.visualIntent}</div><div className="mt-1 text-xs text-slate-600">{shot.asset?.videoUrl ? `${shot.asset.actualDurationSec?.toFixed(2) || "?"}s · ${shot.asset.model || "Veo"}` : "Pending"}</div>
              <div className="mt-3 flex flex-wrap gap-2">{shot.asset?.videoUrl && <button onClick={() => { setSelectedShotId(shot.id); selectOmni(shot.id, undefined); }} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black">Original</button>}{shot.asset?.videoUrl && <button onClick={() => setSelectedShotId(shot.id)} className="rounded-xl border border-violet-300/20 bg-violet-300/[0.05] px-3 py-2 text-xs font-black text-violet-100"><WandSparkles className="mr-1 inline h-3.5 w-3.5" />Omni tools</button>}{manifest.audio?.narrationUrl && <button onClick={() => regenerate(shot.id)} disabled={Boolean(busy)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black disabled:opacity-50">Regenerate Veo</button>}</div>
              {omniOptions.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{omniOptions.map(option => <button key={option.id} onClick={() => selectOmni(shot.id, option.id)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${selected === option.id ? "border-violet-300/40 text-violet-100" : "border-white/10 text-slate-400"}`}>Omni {option.mode} · expires {new Date(option.expiresAt).toLocaleDateString()}</button>)}</div>}
            </div></div>
          </div>;
        })}</div>}
        {manifest && <details className="mt-6 rounded-xl border border-white/10 p-4"><summary className="cursor-pointer text-xs font-black text-slate-400">Master Script</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">{script}</p></details>}
      </section>

      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">{previewUrl ? <><div className="mb-2 flex items-center justify-between px-2 text-xs font-black text-slate-500"><span>{previewLabel}</span>{selectedOmni && <span className="text-violet-300">{selectedOmni.model}</span>}</div><video key={previewUrl} src={previewUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-[24px] bg-black object-cover" /></> : <div className="flex aspect-[9/16] items-center justify-center rounded-[24px] bg-black/25 text-sm text-slate-600">Preview</div>}</div>
        {selectedShot && <div className="mt-4 rounded-[24px] border border-violet-300/20 bg-violet-300/[0.035] p-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-violet-300"><Scissors className="h-4 w-4" /> Gemini Omni 1.1 Flash</div><p className="mt-2 text-xs leading-5 text-slate-500">Edit or repair the selected generated clip without regenerating it in Veo. Extension appends to the end and is limited by Omni's uploaded-video constraints.</p><textarea value={omniPrompt} onChange={e => setOmniPrompt(e.target.value)} rows={5} className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none" />
          <div className="mt-3 grid grid-cols-3 gap-2"><MiniButton active={busy === "omni:REPAIR"} disabled={Boolean(busy)} onClick={() => omni("REPAIR")} text="Repair" /><MiniButton active={busy === "omni:EDIT"} disabled={Boolean(busy)} onClick={() => omni("EDIT")} text="Edit" /><MiniButton active={busy === "omni:EXTEND"} disabled={Boolean(busy)} onClick={() => omni("EXTEND")} text="Extend" /></div>
          <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-[11px] leading-5 text-amber-100/70">Studio3 Omni outputs use Gemini Files URI delivery and are temporary for up to 48 hours. They are review options and do not replace the durable Veo source used by the current full-reel renderer.</div>
        </div>}
        {manifest && <div className="mt-4 rounded-[24px] border border-white/10 p-5 text-sm"><div className="flex items-center gap-2 font-black"><UserRoundCheck className="h-4 w-4 text-cyan-300" />Continuity</div><div className="mt-3 space-y-2 text-xs text-slate-500"><div>Presenter: {meta?.presenterContinuity ? "ON" : "OFF"}</div><div>Environment: {meta?.environmentContinuity ? "ON" : "OFF"}</div><div>Omni: {meta?.omniModel || "—"}</div></div></div>}
      </aside>
    </main>
  </div>;
}

function Select({ label, value, setValue, values }: { label: string; value: string; setValue: (v: string) => void; values: string[] }) { return <label className="mt-3 block"><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><select value={value} onChange={e => setValue(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm">{values.map(v => <option key={v}>{v}</option>)}</select></label>; }
function Button({ active, disabled, onClick, icon: Icon, text, primary = false }: { active: boolean; disabled: boolean; onClick: () => void; icon: React.ComponentType<{className?: string}>; text: string; primary?: boolean }) { return <button disabled={disabled} onClick={onClick} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black disabled:opacity-50 ${primary ? "bg-white text-slate-950" : "border border-white/10 bg-white/[0.035]"}`}>{active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{text}</button>; }
function MiniButton({ active, disabled, onClick, text }: { active: boolean; disabled: boolean; onClick: () => void; text: string }) { return <button disabled={disabled} onClick={onClick} className="rounded-xl border border-violet-300/20 bg-violet-300/[0.06] px-3 py-2 text-xs font-black text-violet-100 disabled:opacity-50">{active ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : text}</button>; }
