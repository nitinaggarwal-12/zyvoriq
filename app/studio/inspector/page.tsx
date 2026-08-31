"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Captions,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Film,
  Mic2,
  Music2,
  ScanSearch,
} from "lucide-react";

type Production = { id: string; manifest: any; updatedAt: string };
type Inspection = any;

function formatTime(seconds: number) {
  const safe = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const remaining = safe - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remaining.toFixed(3).padStart(6, "0")}`;
}

function displayValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function ReelInspectorPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#07090d] p-8 text-slate-500">Loading Reel inspection…</div>}><ReelInspectorContent /></Suspense>;
}

function ReelInspectorContent() {
  const search = useSearchParams();
  const requestedProductionId = search.get("productionId") || "";
  const requestedFrame = Math.max(0, Number(search.get("frame") || 0));
  const [productions, setProductions] = useState<Production[]>([]);
  const [productionId, setProductionId] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [frame, setFrame] = useState(requestedFrame);
  const [error, setError] = useState("");
  const [switchOpen, setSwitchOpen] = useState(!requestedProductionId);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch("/api/reels/productions?limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || "Failed to load Reel productions");
        const p = Array.isArray(d.productions) ? d.productions : [];
        setProductions(p);
        const requestedExists = requestedProductionId && p.some((x: Production) => x.id === requestedProductionId);
        if (requestedExists) setProductionId(requestedProductionId);
        else if (p[0]?.id) setProductionId(p[0].id);
      })
      .catch(e => setError(e?.message || String(e)));
  }, [requestedProductionId]);

  useEffect(() => {
    if (!productionId) return;
    setInspection(null);
    setError("");
    fetch(`/api/reels/productions/${encodeURIComponent(productionId)}/inspection`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || "Failed to load Reel inspection");
        setInspection(d.inspection);
        const target = productionId === requestedProductionId ? requestedFrame : 0;
        setFrame(Math.min(Math.max(0, target), Math.max(0, (d.inspection?.frameCount || 1) - 1)));
      })
      .catch(e => setError(e?.message || String(e)));
  }, [productionId, requestedFrame, requestedProductionId]);

  const currentProduction = useMemo(() => productions.find(p => p.id === productionId) || null, [productions, productionId]);
  const current = inspection?.frames?.[Math.min(frame, Math.max(0, (inspection?.frameCount || 1) - 1))] || null;
  const selectedShotIndex = useMemo(() => inspection?.pieces?.shots?.findIndex((s: any) => s.id === current?.shotId) ?? -1, [inspection, current]);
  const selectedShot = selectedShotIndex >= 0 ? inspection?.pieces?.shots?.[selectedShotIndex] : null;
  const combinedVideoUrl = inspection?.pieces?.finalMp4 || null;
  const videoUrl = combinedVideoUrl || selectedShot?.videoUrl || null;
  const currentTimeSec = inspection ? frame / inspection.fps : 0;
  const hasAnyObservedEvidence = useMemo(() => Boolean(inspection?.frames?.some((item: any) => Object.values(item?.observed || {}).some(value => value !== null && value !== undefined))), [inspection]);
  const currentObserved = useMemo(() => Object.fromEntries(Object.entries(current?.observed || {}).filter(([, value]) => value !== null && value !== undefined)), [current]);
  const storedQa = inspection?.pieces?.qa;
  const storedQaLabel = storedQa?.passed === true ? "Persisted QA passed" : storedQa?.passed === false ? "Persisted QA needs attention" : "No persisted QA verdict";

  const playbackTimeForFrame = (nextFrame: number) => {
    const globalSec = inspection ? nextFrame / inspection.fps : 0;
    if (combinedVideoUrl) return globalSec;
    return Math.max(0, globalSec - Number(selectedShot?.startSec || 0));
  };

  const seek = (next: number) => {
    setFrame(next);
    if (videoRef.current && inspection) videoRef.current.currentTime = playbackTimeForFrame(next);
  };

  const downloadJson = () => {
    if (!inspection) return;
    const blob = new Blob([JSON.stringify(inspection, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${inspection.productionId}-inspection.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const captureFrame = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `reel-${formatTime(currentTimeSec).replace(/[:.]/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };

  const copy = (value: string) => navigator.clipboard?.writeText(value).catch(() => {});

  useEffect(() => {
    if (!inspection || !videoRef.current) return;
    videoRef.current.currentTime = playbackTimeForFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection, frame, combinedVideoUrl, selectedShot?.id]);

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="border-b border-white/10 px-6 py-4">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/studio/library" className="rounded-xl p-2 hover:bg-white/5" aria-label="Back to Library"><ArrowLeft className="h-5 w-5" /></Link>
          <ScanSearch className="h-5 w-5 text-pink-300"/>
          <div>
            <div className="font-black">Reel Inspector</div>
            <div className="text-xs text-slate-500">Review the combined Reel, scene timing, narration, captions and available quality evidence.</div>
          </div>
        </div>
        <button onClick={() => setSwitchOpen(value => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5">
          Switch Reel <ChevronDown className={`h-4 w-4 transition-transform ${switchOpen ? "rotate-180" : ""}`}/>
        </button>
      </div>
    </header>

    <main className="mx-auto max-w-[1600px] p-6">
      {switchOpen && <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Switch Reel</div>
        <select value={productionId} onChange={e => { setProductionId(e.target.value); setSwitchOpen(false); }} className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2 text-sm md:max-w-xl">
          {productions.map(p => <option key={p.id} value={p.id}>{p.manifest?.studio1?.projectTitle || p.manifest?.topic || p.id} · {p.manifest?.status}</option>)}
        </select>
      </div>}

      {error && <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</div>}

      {!inspection ? <div className="rounded-2xl border border-white/10 p-8 text-slate-500">Loading Reel inspection…</div> : <>
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="truncate text-lg font-black text-white">{currentProduction?.manifest?.studio1?.projectTitle || currentProduction?.manifest?.topic || inspection.productionId}</div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{inspection.durationSec.toFixed(2)}s</span>
              <span>{inspection.pieces.shots.length} scenes</span>
              <span>{storedQaLabel}</span>
              <span>{combinedVideoUrl ? "Combined Reel available" : "Combined Reel not available"}</span>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-2xl font-black tabular-nums text-white">{formatTime(currentTimeSec)}</div>
            <div className="mt-1 text-xs text-slate-500">{selectedShotIndex >= 0 ? `Scene ${selectedShotIndex + 1} of ${inspection.pieces.shots.length}` : "Between planned scenes"}</div>
          </div>
        </div>

        {!combinedVideoUrl && <div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100/80">The combined Reel is not available for this production. Inspector is previewing the current source scene instead; scene seeking uses clip-local time.</div>}

        <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
          <section className="self-start rounded-3xl border border-white/10 bg-[#0b0e13] p-4 xl:sticky xl:top-5">
            {videoUrl ? <video
              ref={videoRef}
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full rounded-2xl bg-black object-cover"
              onTimeUpdate={e => {
                const localSec = e.currentTarget.currentTime;
                const globalSec = combinedVideoUrl ? localSec : Number(selectedShot?.startSec || 0) + localSec;
                setFrame(Math.min(inspection.frameCount - 1, Math.max(0, Math.floor(globalSec * inspection.fps))));
              }}
            /> : <div className="flex aspect-[9/16] items-center justify-center rounded-2xl bg-black/40 text-sm text-slate-600">No playable Reel or source clip</div>}
            <input type="range" min={0} max={Math.max(0, inspection.frameCount - 1)} value={frame} onChange={e => seek(Number(e.target.value))} className="mt-4 w-full" aria-label="Reel timeline"/>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{selectedShotIndex >= 0 ? `Scene ${selectedShotIndex + 1}` : "Timeline"}</span><span className="tabular-nums">{formatTime(currentTimeSec)}</span></div>
          </section>

          <section className="space-y-4">
            <Panel title="Current moment">
              <div className="grid gap-3 md:grid-cols-[150px_1fr]">
                <div className="rounded-xl bg-black/20 p-4"><Clock3 className="h-4 w-4 text-pink-300"/><div className="mt-3 text-2xl font-black tabular-nums">{formatTime(currentTimeSec)}</div><div className="mt-1 text-xs text-slate-500">{selectedShotIndex >= 0 ? `Scene ${selectedShotIndex + 1}` : "No active scene"}</div></div>
                <div className="rounded-xl bg-black/20 p-4"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Narrative beat</div><div className="mt-2 text-sm leading-6 text-slate-200">{current?.expected?.scriptText || "No script is assigned at this moment."}</div></div>
              </div>
              {!hasAnyObservedEvidence && <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-5 text-slate-500">This production currently has timeline, narration, caption and persisted QA evidence. Pixel/audio evaluator scores have not been generated, so the Inspector does not display synthetic quality scores.</div>}
            </Panel>

            <Panel title="Planned scene state">
              <CreatorRows data={{
                Character: current?.expected?.characterIds,
                Environment: current?.expected?.environmentId,
                Wardrobe: current?.expected?.wardrobe,
                Action: current?.expected?.action,
                Pose: current?.expected?.pose,
                Camera: current?.expected?.camera,
                "Camera motion": current?.expected?.cameraMotion,
                "Subject motion": current?.expected?.subjectMotion,
                Emotion: current?.expected?.emotion,
              }}/>
            </Panel>

            <Panel title="Narration & captions">
              <div className="grid gap-3 md:grid-cols-2">
                <MomentCard icon={Mic2} label="Spoken now" value={(current?.expected?.spokenWords || []).join(" ") || "No spoken word at this instant"}/>
                <MomentCard icon={Captions} label="Caption now" value={current?.expected?.caption || "No caption at this instant"}/>
                <MomentCard icon={Mic2} label="Narration" value={current?.audio?.narrationActive ? "Active" : "Between spoken words"}/>
                <MomentCard icon={Music2} label="Music" value={current?.audio?.musicActive ? "Active" : "Not active"}/>
              </div>
            </Panel>

            {hasAnyObservedEvidence && <Panel title="Detected quality evidence">
              {Object.keys(currentObserved).length ? <CreatorRows data={currentObserved}/> : <div className="text-xs leading-5 text-slate-500">No evaluator finding is attached to this exact moment. Move along the timeline to inspect measured evidence.</div>}
            </Panel>}

            <Panel title="Scene timeline">
              <div className="grid gap-2 md:grid-cols-2">
                {inspection.pieces.shots.map((shot: any, index: number) => {
                  const active = shot.id === current?.shotId;
                  const end = Number(shot.startSec || 0) + Number(shot.durationSec || 0);
                  return <button key={shot.id} onClick={() => seek(Math.min(inspection.frameCount - 1, Math.max(0, Math.round(Number(shot.startSec || 0) * inspection.fps))))} className={`rounded-xl border p-3 text-left transition ${active ? "border-pink-300/40 bg-pink-300/[0.06]" : "border-white/10 hover:bg-white/[0.03]"}`}>
                    <div className="flex items-center justify-between gap-3"><span className="text-xs font-black text-white">Scene {index + 1}</span>{active && <CheckCircle2 className="h-4 w-4 text-pink-300"/>}</div>
                    <div className="mt-1 text-[11px] tabular-nums text-slate-500">{formatTime(Number(shot.startSec || 0))} → {formatTime(end)}</div>
                  </button>;
                })}
              </div>
            </Panel>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4"><div><div className="text-xs font-black uppercase tracking-[0.15em] text-slate-300">Advanced Evidence</div><div className="mt-1 text-xs text-slate-600">Technical IDs, frame metadata, raw assets and diagnostic exports.</div></div><ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"/></summary>
              <div className="space-y-4 border-t border-white/10 p-4">
                <div className="flex flex-wrap gap-2">
                  <button onClick={downloadJson} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"><Download className="h-4 w-4"/>Export diagnostic report</button>
                  <button onClick={captureFrame} disabled={!videoUrl} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5 disabled:opacity-40"><Camera className="h-4 w-4"/>Capture current frame</button>
                </div>

                <AdvancedPanel title="Technical timeline data">
                  <CreatorRows data={{
                    Frame: current?.frame,
                    "Frame in scene": current?.shotFrame,
                    "Scene ID": current?.shotId,
                    "Boundary strategy": current?.boundary?.strategy,
                    FPS: inspection.fps,
                    "Frame count": inspection.frameCount,
                  }}/>
                  {current?.objectId && <div className="mt-3 rounded-xl bg-black/20 p-3"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">Frame object ID</div><button onClick={() => copy(current.objectId)} className="mt-2 flex w-full items-start justify-between gap-3 text-left"><span className="break-all text-[11px] leading-5 text-slate-400">{current.objectId}</span><Copy className="h-3.5 w-3.5 shrink-0 text-slate-600"/></button></div>}
                  {current?.canonicalUrl && <Link href={current.canonicalUrl} className="mt-3 inline-flex items-center gap-2 text-xs text-pink-300"><ExternalLink className="h-3.5 w-3.5"/>Open canonical frame link</Link>}
                </AdvancedPanel>

                <AdvancedPanel title="Persisted assets">
                  <div className="grid gap-2 md:grid-cols-3">
                    <AssetLink icon={Film} label="Combined Reel" href={inspection.pieces.finalMp4}/>
                    <AssetLink icon={Mic2} label="Narration" href={inspection.pieces.narration}/>
                    <AssetLink icon={Music2} label="Music" href={inspection.pieces.music}/>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {inspection.pieces.shots.map((shot: any, index: number) => <a key={shot.id} href={shot.videoUrl || undefined} target="_blank" rel="noreferrer" className={`rounded-xl border p-3 text-xs ${shot.videoUrl ? "border-white/10 hover:bg-white/5" : "pointer-events-none border-white/5 text-slate-600"}`}>
                      <div className="font-bold text-slate-300">Scene {index + 1} source clip</div>
                      <div className="mt-1 text-slate-600">{shot.startSec.toFixed(2)}s · {shot.durationSec.toFixed(2)}s · {shot.model || "pending"}</div>
                    </a>)}
                  </div>
                </AdvancedPanel>

                {storedQa !== undefined && <AdvancedPanel title="Raw persisted QA"><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/20 p-3 text-[11px] leading-5 text-slate-400">{JSON.stringify(storedQa, null, 2)}</pre></AdvancedPanel>}
                <AdvancedPanel title="Raw frame evidence"><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/20 p-3 text-[11px] leading-5 text-slate-400">{JSON.stringify({ expected: current?.expected, observed: current?.observed, audio: current?.audio, boundary: current?.boundary }, null, 2)}</pre></AdvancedPanel>
              </div>
            </details>
          </section>
        </div>
      </>}
    </main>
  </div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-pink-300">{title}</div>{children}</div>;
}

function AdvancedPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-[#0b0e13] p-4"><div className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{title}</div>{children}</div>;
}

function CreatorRows({ data }: { data: Record<string, any> }) {
  return <div className="grid gap-2 md:grid-cols-2">{Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)).map(([key, value]) => <div key={key} className="rounded-xl bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{key}</div><div className="mt-1 break-words text-xs leading-5 text-slate-300">{displayValue(value)}</div></div>)}</div>;
}

function MomentCard({ icon: Icon, label, value }: any) {
  return <div className="rounded-xl bg-black/20 p-3"><Icon className="h-4 w-4 text-pink-300"/><div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{label}</div><div className="mt-1 text-xs leading-5 text-slate-300">{value}</div></div>;
}

function AssetLink({ icon: Icon, label, href }: any) {
  const body = <div className={`rounded-xl border p-3 ${href ? "border-white/10 hover:bg-white/5" : "border-white/5 opacity-50"}`}><Icon className="h-4 w-4 text-slate-500"/><div className="mt-2 text-xs font-bold text-slate-300">{label}</div><div className="mt-1 text-[10px] text-slate-600">{href ? "Open persisted asset" : "Not available"}</div></div>;
  return href ? <a href={href} target="_blank" rel="noreferrer">{body}</a> : body;
}
