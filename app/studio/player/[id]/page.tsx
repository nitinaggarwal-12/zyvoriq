"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { ArrowLeft, Captions, ChevronLeft, ChevronRight, Copy, Film, Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";

type Graph = any;

type ToggleProps = { label: string; enabled: boolean; onChange: (next: boolean) => void };

export default function ComposableMediaPlayerPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const productionId = decodeURIComponent(String(params.id || ""));
  const requestedObjectId = search.get("object") || "";
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState("");
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [clipIndex, setClipIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [speechOn, setSpeechOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [speechTrackId, setSpeechTrackId] = useState("");
  const [musicTrackId, setMusicTrackId] = useState("");
  const [captionTrackId, setCaptionTrackId] = useState("");
  const [timeSec, setTimeSec] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const speechRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!productionId) return;
    fetch(`/api/reels/productions/${encodeURIComponent(productionId)}/media-graph`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || "Failed to load media graph");
        setGraph(d.graph);
        const enabled = (d.graph.clips || []).filter((c: any) => c.videoUrl).map((c: any) => c.id);
        setSelectedClipIds(enabled);
        setSpeechTrackId(d.graph.tracks?.speech?.find((t: any) => t.available)?.id || "");
        setMusicTrackId(d.graph.tracks?.music?.find((t: any) => t.available)?.id || "");
        setCaptionTrackId(d.graph.tracks?.captions?.find((t: any) => t.available)?.id || "");
        if (requestedObjectId) {
          const target = (d.graph.clips || []).find((c: any) => c.objectId === requestedObjectId);
          if (target) {
            const idx = enabled.indexOf(target.id);
            if (idx >= 0) setClipIndex(idx);
          }
        }
      })
      .catch(e => setError(e?.message || String(e)));
  }, [productionId, requestedObjectId]);

  const activeClips = useMemo(() => {
    if (!graph) return [];
    return graph.clips.filter((c: any) => selectedClipIds.includes(c.id) && c.videoUrl).sort((a: any, b: any) => a.order - b.order);
  }, [graph, selectedClipIds]);

  useEffect(() => {
    if (clipIndex >= activeClips.length) setClipIndex(Math.max(0, activeClips.length - 1));
  }, [activeClips.length, clipIndex]);

  const clip = activeClips[clipIndex] || null;
  const speech = graph?.tracks?.speech?.find((t: any) => t.id === speechTrackId && t.available);
  const music = graph?.tracks?.music?.find((t: any) => t.id === musicTrackId && t.available);
  const captionObject = graph?.objects?.find((o: any) => o.id === graph?.tracks?.captions?.find((t: any) => t.id === captionTrackId)?.objectId);
  const captionCues = (captionObject?.metadata?.cues || []) as any[];
  const caption = captionsOn ? captionCues.find(c => timeSec >= Number(c.startSec || 0) && timeSec <= Number(c.endSec || 0))?.text || "" : "";

  const syncLayers = (globalTime: number, shouldPlay: boolean) => {
    const speechAudio = speechRef.current;
    const musicAudio = musicRef.current;
    for (const audio of [speechAudio, musicAudio]) {
      if (!audio) continue;
      if (Math.abs(audio.currentTime - globalTime) > 0.18) audio.currentTime = Math.max(0, globalTime);
    }
    if (speechAudio) {
      speechAudio.muted = !speechOn;
      if (shouldPlay && speechOn) void speechAudio.play().catch(() => {}); else speechAudio.pause();
    }
    if (musicAudio) {
      musicAudio.muted = !musicOn;
      if (shouldPlay && musicOn) void musicAudio.play().catch(() => {}); else musicAudio.pause();
    }
  };

  const playClip = async () => {
    const v = videoRef.current;
    if (!v || !clip) return;
    const global = clip.startSec + Math.max(0, v.currentTime - clip.trimInSec);
    syncLayers(global, true);
    setPlaying(true);
    await v.play().catch(() => setPlaying(false));
  };

  const pauseAll = () => {
    videoRef.current?.pause();
    speechRef.current?.pause();
    musicRef.current?.pause();
    setPlaying(false);
  };

  const go = (delta: number) => {
    if (!activeClips.length) return;
    pauseAll();
    setClipIndex(i => Math.max(0, Math.min(activeClips.length - 1, i + delta)));
  };

  const onLoaded = () => {
    const v = videoRef.current;
    if (!v || !clip) return;
    v.currentTime = Math.max(0, clip.trimInSec || 0);
    setTimeSec(clip.startSec);
    syncLayers(clip.startSec, false);
  };

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !clip) return;
    const relative = Math.max(0, v.currentTime - clip.trimInSec);
    const global = clip.startSec + relative;
    setTimeSec(global);
    syncLayers(global, !v.paused);
    if (v.currentTime >= clip.trimOutSec - 0.03) {
      if (autoAdvance && clipIndex < activeClips.length - 1) {
        pauseAll();
        setClipIndex(i => i + 1);
        setTimeout(() => void playClip(), 30);
      } else pauseAll();
    }
  };

  const copyRef = async (value: string) => navigator.clipboard?.writeText(value).catch(() => {});
  const toggleClip = (id: string) => setSelectedClipIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <AppNavbar />
    <main className="mx-auto max-w-[1720px] px-5 py-7 md:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Link href="/studio/library" className="rounded-xl border border-white/10 p-2 hover:bg-white/5"><ArrowLeft className="h-4 w-4"/></Link><div><div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Composable Media Player</div><h1 className="text-2xl font-black">{graph?.objects?.find((o:any)=>o.id===graph.rootObjectId)?.label || productionId}</h1></div></div>
        {graph && <button onClick={() => copyRef(graph.rootObjectId)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold"><Copy className="h-4 w-4"/>Copy production object ID</button>}
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</div>}
      {!graph ? <div className="rounded-2xl border border-white/10 p-10 text-slate-500">Loading media object graph…</div> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="rounded-3xl border border-white/10 bg-[#0b0e13] p-4 md:p-5">
          <div className="relative mx-auto max-w-[520px] overflow-hidden rounded-3xl bg-black">
            {clip?.videoUrl ? <video key={clip.id} ref={videoRef} src={clip.videoUrl} muted playsInline preload="metadata" className="aspect-[9/16] w-full object-cover" onLoadedMetadata={onLoaded} onTimeUpdate={onTime} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /> : <div className="aspect-[9/16]"/>}
            {caption && <div className="pointer-events-none absolute inset-x-5 bottom-14 rounded-xl bg-black/65 px-4 py-2 text-center text-lg font-black text-white backdrop-blur">{caption}</div>}
          </div>
          <div className="mx-auto mt-4 flex max-w-[520px] items-center justify-center gap-3">
            <button onClick={() => go(-1)} disabled={clipIndex <= 0} className="rounded-xl border border-white/10 p-3 disabled:opacity-30" aria-label="Previous clip"><ChevronLeft className="h-5 w-5"/></button>
            <button onClick={() => playing ? pauseAll() : void playClip()} disabled={!clip} className="rounded-full bg-white p-4 text-black disabled:opacity-30">{playing ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5 fill-current"/>}</button>
            <button onClick={() => go(1)} disabled={clipIndex >= activeClips.length - 1} className="rounded-xl border border-white/10 p-3 disabled:opacity-30" aria-label="Next clip"><ChevronRight className="h-5 w-5"/></button>
          </div>
          <div className="mx-auto mt-3 flex max-w-[520px] items-center justify-between text-xs text-slate-500"><span>{clip ? `${clip.label} · ${clipIndex + 1}/${activeClips.length}` : "No selected clips"}</span><span>{timeSec.toFixed(2)}s</span></div>
          <audio ref={speechRef} src={speech?.url || undefined} preload="metadata" />
          <audio ref={musicRef} src={music?.url || undefined} preload="metadata" />
        </section>

        <aside className="space-y-4">
          <Panel title="Playback sequence" icon={Film}>
            <Toggle label="Auto-play next selected clip" enabled={autoAdvance} onChange={setAutoAdvance}/>
            <div className="mt-3 space-y-2">{graph.clips.map((c:any, i:number) => <label key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><span className="min-w-0"><span className="block text-sm font-bold">Clip {i+1}</span><span className="block truncate text-xs text-slate-500">{c.videoUrl ? `${c.durationSec.toFixed(2)}s` : "Not generated"}</span></span><input type="checkbox" checked={selectedClipIds.includes(c.id)} disabled={!c.videoUrl} onChange={() => toggleClip(c.id)} /></label>)}</div>
          </Panel>

          <Panel title="Audio layers" icon={Music2}>
            <Toggle label="Speech / narration" enabled={speechOn} onChange={setSpeechOn}/>
            <TrackSelect label="Speech language / voice" value={speechTrackId} onChange={setSpeechTrackId} tracks={graph.tracks.speech}/>
            <div className="mt-3"><Toggle label="Music" enabled={musicOn} onChange={setMusicOn}/></div>
            <TrackSelect label="Music style" value={musicTrackId} onChange={setMusicTrackId} tracks={graph.tracks.music}/>
            <div className="mt-3 text-[11px] leading-5 text-slate-500">Only independently persisted variants are selectable. The player never plays embedded clip audio plus a selected stem at the same time: video is always muted and selected audio stems are synchronized to the canonical timeline.</div>
          </Panel>

          <Panel title="Captions" icon={Captions}>
            <Toggle label="Show captions" enabled={captionsOn} onChange={setCaptionsOn}/>
            <TrackSelect label="Caption language" value={captionTrackId} onChange={setCaptionTrackId} tracks={graph.tracks.captions}/>
          </Panel>

          {clip && <Panel title="Current object reference" icon={Copy}><ObjectRef id={clip.objectId} url={`/studio/player/${encodeURIComponent(productionId)}?object=${encodeURIComponent(clip.objectId)}`} onCopy={copyRef}/></Panel>}
        </aside>
      </div>}
    </main>
  </div>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-teal-300"><Icon className="h-4 w-4"/>{title}</div>{children}</section>; }
function Toggle({ label, enabled, onChange }: ToggleProps) { return <label className="flex items-center justify-between gap-4"><span className="text-sm font-semibold text-slate-300">{label}</span><button type="button" onClick={() => onChange(!enabled)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${enabled ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-slate-500"}`}>{enabled ? <Volume2 className="h-3.5 w-3.5"/> : <VolumeX className="h-3.5 w-3.5"/>}{enabled ? "ON" : "OFF"}</button></label>; }
function TrackSelect({ label, value, onChange, tracks }: { label: string; value: string; onChange: (v:string)=>void; tracks: any[] }) { return <label className="mt-3 block"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</span><select value={value} onChange={e => onChange(e.target.value)} disabled={!tracks?.some(t => t.available)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"><option value="">None</option>{(tracks || []).map(t => <option key={t.id} value={t.id} disabled={!t.available}>{t.label}{t.available ? "" : " (not generated)"}</option>)}</select></label>; }
function ObjectRef({ id, url, onCopy }: { id: string; url: string; onCopy: (v:string)=>void }) { return <div className="space-y-2"><button onClick={() => onCopy(id)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-black/20 p-3 text-left"><span className="break-all text-[11px] text-slate-400">{id}</span><Copy className="h-3.5 w-3.5 shrink-0"/></button><Link href={url} className="block break-all rounded-xl border border-white/10 p-3 text-[11px] text-teal-300">{url}</Link></div>; }
