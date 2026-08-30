"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, Download, Film, Music2, Mic2, ScanSearch } from "lucide-react";

type Production = { id: string; manifest: any; updatedAt: string };
type Inspection = any;

export default function ReelInspectorPage() {
  const search = useSearchParams();
  const requestedProductionId = search.get("productionId") || "";
  const requestedFrame = Math.max(0, Number(search.get("frame") || 0));
  const [productions, setProductions] = useState<Production[]>([]);
  const [productionId, setProductionId] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [frame, setFrame] = useState(requestedFrame);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch("/api/reels/productions?limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const p = d.productions || [];
        setProductions(p);
        const requestedExists = requestedProductionId && p.some((x: Production) => x.id === requestedProductionId);
        if (requestedExists) setProductionId(requestedProductionId);
        else if (p[0]?.id) setProductionId(p[0].id);
      })
      .catch(e => setError(String(e)));
  }, [requestedProductionId]);

  useEffect(() => {
    if (!productionId) return;
    setInspection(null);
    fetch(`/api/reels/productions/${encodeURIComponent(productionId)}/inspection`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error);
        setInspection(d.inspection);
        const target = productionId === requestedProductionId ? requestedFrame : 0;
        setFrame(Math.min(Math.max(0, target), Math.max(0, (d.inspection?.frameCount || 1) - 1)));
      })
      .catch(e => setError(e?.message || String(e)));
  }, [productionId, requestedFrame, requestedProductionId]);

  const current = inspection?.frames?.[Math.min(frame, Math.max(0, (inspection?.frameCount || 1) - 1))] || null;
  const selectedShot = useMemo(() => inspection?.pieces?.shots?.find((s: any) => s.id === current?.shotId), [inspection, current]);
  const videoUrl = inspection?.pieces?.finalMp4 || selectedShot?.videoUrl || null;
  const seek = (next: number) => { setFrame(next); if (videoRef.current && inspection) videoRef.current.currentTime = next / inspection.fps; };
  const downloadJson = () => { if (!inspection) return; const blob = new Blob([JSON.stringify(inspection, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${inspection.productionId}-inspection.json`; a.click(); URL.revokeObjectURL(a.href); };
  const captureFrame = () => { const v = videoRef.current; if (!v || !v.videoWidth) return; const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d")?.drawImage(v, 0, 0); c.toBlob(blob => { if (!blob) return; const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `frame-${String(frame).padStart(6,"0")}.png`; a.click(); URL.revokeObjectURL(a.href); }, "image/png"); };
  const copy = (value: string) => navigator.clipboard?.writeText(value).catch(() => {});

  useEffect(() => {
    if (!inspection || !videoRef.current) return;
    videoRef.current.currentTime = frame / inspection.fps;
  }, [inspection, frame]);

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <header className="border-b border-white/10 px-6 py-4"><div className="mx-auto flex max-w-[1600px] items-center justify-between"><div className="flex items-center gap-3"><Link href="/studio/library" className="rounded-xl p-2 hover:bg-white/5"><ArrowLeft className="h-5 w-5" /></Link><ScanSearch className="h-5 w-5 text-pink-300"/><div><div className="font-black">Reel Evidence Inspector</div><div className="text-xs text-slate-500">Frame-level expected-vs-observed production evidence</div></div></div><button onClick={downloadJson} disabled={!inspection} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"><Download className="h-4 w-4"/>Inspection JSON</button></div></header>
    <main className="mx-auto max-w-[1600px] p-6">
      <div className="mb-5 flex flex-wrap gap-3"><select value={productionId} onChange={e => setProductionId(e.target.value)} className="min-w-[360px] rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2 text-sm">{productions.map(p => <option key={p.id} value={p.id}>{p.manifest?.topic || p.id} · {p.manifest?.status}</option>)}</select>{inspection && <div className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400">{inspection.frameCount} frames · {inspection.fps} fps · {inspection.durationSec.toFixed(2)}s</div>}</div>
      {error && <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</div>}
      {!inspection ? <div className="rounded-2xl border border-white/10 p-8 text-slate-500">Loading inspection evidence…</div> : <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <section className="rounded-3xl border border-white/10 bg-[#0b0e13] p-4">
          {videoUrl ? <video ref={videoRef} src={videoUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-2xl bg-black object-cover" onTimeUpdate={e => setFrame(Math.min(inspection.frameCount - 1, Math.max(0, Math.floor(e.currentTarget.currentTime * inspection.fps))))}/> : <div className="aspect-[9/16] rounded-2xl bg-black/40"/>}
          <input type="range" min={0} max={Math.max(0, inspection.frameCount - 1)} value={frame} onChange={e => seek(Number(e.target.value))} className="mt-4 w-full"/>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>Frame {frame}</span><span>{(frame / inspection.fps).toFixed(3)}s</span></div>
          <button onClick={captureFrame} className="mt-3 w-full rounded-xl border border-white/10 py-2 text-xs font-bold">Export current frame PNG</button>
          {current?.objectId && <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Frame object</div><button onClick={() => copy(current.objectId)} className="mt-1 flex w-full items-start justify-between gap-2 text-left"><span className="break-all text-[10px] leading-4 text-slate-400">{current.objectId}</span><Copy className="h-3 w-3 shrink-0 text-slate-600"/></button><Link href={current.canonicalUrl} className="mt-2 block break-all text-[10px] text-pink-300">{current.canonicalUrl}</Link></div>}
        </section>
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4"><Piece icon={Film} label="Combined MP4" value={inspection.pieces.finalMp4 ? "Available" : "Pending"} href={inspection.pieces.finalMp4}/><Piece icon={Mic2} label="Narration" value={inspection.pieces.narration ? "Available" : "Pending"} href={inspection.pieces.narration}/><Piece icon={Music2} label="Music" value={inspection.pieces.music ? "Available" : "Not rendered"} href={inspection.pieces.music}/><Piece icon={Film} label="Source clips" value={`${inspection.pieces.shots.filter((s:any)=>s.videoUrl).length}/${inspection.pieces.shots.length}`} /></div>
          <Panel title="Frame truth"><Rows data={{ frame: current?.frame, objectId: current?.objectId, canonicalUrl: current?.canonicalUrl, timeSec: current?.timeSec, shotId: current?.shotId, shotFrame: current?.shotFrame, boundary: current?.boundary?.strategy || null }}/></Panel>
          <Panel title="Expected visual state"><Rows data={current?.expected || {}} /></Panel>
          <Panel title="Audio + text"><Rows data={{ spokenWords: current?.expected?.spokenWords, caption: current?.expected?.caption, narrationActive: current?.audio?.narrationActive, musicActive: current?.audio?.musicActive, sfxActive: current?.audio?.sfxActive, ambienceActive: current?.audio?.ambienceActive }}/></Panel>
          <Panel title="Observed QA evidence"><div className="mb-3 text-xs leading-5 text-amber-200/70">Null means no real evaluator evidence exists. Zyvoriq does not convert expected state into a fake observed score.</div><Rows data={current?.observed || {}} /></Panel>
          <Panel title="Separate source clips"><div className="grid gap-2 md:grid-cols-2">{inspection.pieces.shots.map((s:any, i:number) => <a key={s.id} href={s.videoUrl || undefined} target="_blank" className={`rounded-xl border p-3 text-xs ${s.videoUrl ? "border-white/10 hover:bg-white/5" : "border-white/5 text-slate-600"}`}>Shot {i+1} · {s.startSec.toFixed(2)}s · {s.durationSec.toFixed(2)}s<br/><span className="text-slate-500">{s.model || "pending"}</span></a>)}</div></Panel>
        </section>
      </div>}
    </main>
  </div>;
}

function Piece({ icon: Icon, label, value, href }: any) { const body = <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><Icon className="h-4 w-4 text-pink-300"/><div className="mt-3 text-xs text-slate-500">{label}</div><div className="mt-1 text-sm font-bold">{value}</div></div>; return href ? <a href={href} target="_blank">{body}</a> : body; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-pink-300">{title}</div>{children}</div>; }
function Rows({ data }: { data: Record<string, any> }) { return <div className="grid gap-2 md:grid-cols-2">{Object.entries(data).map(([k,v]) => <div key={k} className="rounded-xl bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{k}</div><div className="mt-1 break-words text-xs leading-5 text-slate-300">{v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}</div></div>)}</div>; }
