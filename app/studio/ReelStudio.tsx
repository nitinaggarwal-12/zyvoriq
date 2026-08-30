"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Clapperboard, Captions, Mic2, Image as ImageIcon, Copy, Check, Instagram, Youtube, ChevronDown, Loader2, CircleAlert, Database, Film, AudioLines } from "lucide-react";
import type { ReelProductionManifest } from "@/lib/reel/types";

type StoredProduction = {
  id: string;
  revision: number;
  manifest: ReelProductionManifest;
  createdAt: string;
  updatedAt: string;
};

function durationNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 30;
}

function scriptLines(manifest: ReelProductionManifest | null, topic: string) {
  if (!manifest) return [`Enter a brief for ${topic || "your topic"}, then build a persisted production plan.`];
  const sentences = manifest.masterScript.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [manifest.masterScript];
  return sentences.map(s => s.trim()).filter(Boolean);
}

export function ReelStudio() {
  const [topic, setTopic] = useState("3 habits quietly killing your focus");
  const [tone, setTone] = useState("Confident & conversational");
  const [duration, setDuration] = useState("30 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [activeTab, setActiveTab] = useState("Script");
  const [copied, setCopied] = useState(false);
  const [production, setProduction] = useState<StoredProduction | null>(null);
  const [building, setBuilding] = useState(false);
  const [generatingNarration, setGeneratingNarration] = useState(false);
  const [error, setError] = useState("");

  const manifest = production?.manifest || null;
  const script = useMemo(() => scriptLines(manifest, topic), [manifest, topic]);
  const scenes = useMemo(() => manifest?.shots.map((shot) => {
    const end = shot.editorialStartSec + shot.editorialDurationSec;
    return `${shot.editorialStartSec.toFixed(1)}–${end.toFixed(1)}s · ${shot.visualIntent} · source ${shot.generationDurationSec}s`;
  }) || [], [manifest]);
  const captions = useMemo(() => manifest?.shots
    .filter(s => s.scriptText.trim())
    .map(s => s.scriptText.trim().toUpperCase()) || [], [manifest]);

  const buildProduction = async () => {
    setBuilding(true);
    setError("");
    try {
      const response = await fetch("/api/reels/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          requestedDurationSec: durationNumber(duration),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to create production");
      setProduction(data.production);
      setActiveTab("Script");
    } catch (err: any) {
      setError(err?.message || "Failed to create production");
    } finally {
      setBuilding(false);
    }
  };

  const generateNarration = async () => {
    if (!production) return;
    setGeneratingNarration(true);
    setError("");
    try {
      const response = await fetch(`/api/reels/productions/${encodeURIComponent(production.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateNarration", expectedRevision: production.revision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Narration generation failed");
      setProduction(data.production);
      setActiveTab("Scenes");
    } catch (err: any) {
      setError(err?.message || "Narration generation failed");
      try {
        const refresh = await fetch(`/api/reels/productions/${encodeURIComponent(production.id)}`, { cache: "no-store" });
        const refreshed = await refresh.json();
        if (refresh.ok && refreshed.success) setProduction(refreshed.production);
      } catch {}
    } finally {
      setGeneratingNarration(false);
    }
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(script.join("\n")); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07090d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white" aria-label="Back home"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 font-black text-slate-950">Z</div>
              <div><div className="font-black tracking-[-0.02em] text-white">Reel Studio</div><div className="text-[11px] text-slate-600">Production-manifest workspace</div></div>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
            <span className={`h-2 w-2 rounded-full ${production ? "bg-emerald-400" : "bg-slate-700"}`} />
            {production ? `Persisted · rev ${production.revision}` : "Not yet persisted"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 md:px-8 lg:grid-cols-[360px_1fr_360px]">
        <aside className="h-fit rounded-[26px] border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">Creative brief</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">What do you want to post?</h1>

          <label className="mt-6 block text-xs font-bold text-slate-500">IDEA OR TOPIC</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-pink-300/35" placeholder="e.g. 3 things nobody tells you about starting a business" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Tone" value={tone} onChange={setTone} options={["Confident & conversational", "Warm & relatable", "Fast & energetic", "Expert & credible", "Playful & witty"]} />
            <Field label="Length" value={duration} onChange={setDuration} options={["15 sec", "30 sec", "45 sec", "60 sec"]} />
            <Field label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "YouTube Shorts", "TikTok"]} />
          </div>

          <button onClick={buildProduction} disabled={building || generatingNarration || !topic.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
            {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {building ? "Building…" : production ? "Create new plan" : "Build reel plan"}
          </button>

          {production?.manifest.status === "SCRIPT_READY" && (
            <button onClick={generateNarration} disabled={generatingNarration} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-300/25 bg-pink-300/10 py-3.5 text-sm font-black text-pink-100 transition hover:bg-pink-300/15 disabled:cursor-not-allowed disabled:opacity-50">
              {generatingNarration ? <Loader2 className="h-4 w-4 animate-spin" /> : <AudioLines className="h-4 w-4" />}
              {generatingNarration ? "Generating + aligning…" : "Generate real narration"}
            </button>
          )}

          <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">The manifest is persisted first. Audio/video states advance only when real artifacts and timing evidence exist.</p>
          {error && <div className="mt-4 flex gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-5 text-red-200"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </aside>

        <section className="min-w-0 rounded-[26px] border border-white/10 bg-[#0a0d12]">
          <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-3">
            {["Script", "Scenes", "Captions", "Cover"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-white text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>{tab}</button>
            ))}
          </div>

          <div className="p-5 sm:p-8">
            {activeTab === "Script" && <ScriptPanel script={script} copied={copied} onCopy={copyText} />}
            {activeTab === "Scenes" && <ListPanel icon={Clapperboard} eyebrow="CANONICAL SHOT PLAN" title={manifest ? `${manifest.shots.length} editorial shots` : "Build a plan to create shots"} items={scenes.length ? scenes : ["No persisted shot plan yet."]} />}
            {activeTab === "Captions" && <ListPanel icon={Captions} eyebrow={manifest?.audio.timingSource === "actual-alignment" ? "ALIGNED NARRATION SOURCE" : "DRAFT CAPTION SOURCE"} title={manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned to the waveform` : "Final timing waits for real narration"} items={captions.length ? captions : ["Captions are not marked synchronized until real audio alignment exists."]} />}
            {activeTab === "Cover" && <CoverPanel topic={topic} />}
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-[30px] border border-white/10 bg-[#0a0d12] p-3">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.32),transparent_28%),radial-gradient(circle_at_30%_75%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(160deg,#19111d,#0b1016_58%,#0a1515)]">
              <div className="absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50"><span>Plan preview</span><span>{manifest ? `${manifest.plannedDurationSec}s` : duration}</span></div>
              <div className="absolute inset-x-5 top-[26%] text-center">
                <div className="text-3xl font-black leading-none tracking-[-0.05em] text-white">{topic || "Your Reel hook"}</div>
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-pink-300" />
              </div>
              <div className="absolute inset-x-5 bottom-20 rounded-2xl bg-black/35 p-4 backdrop-blur-md">
                <div className="text-sm font-bold text-white">{manifest ? manifest.shots[0]?.scriptText || "Visual hook" : "Build the production plan first."}</div>
                <div className="mt-2 text-[10px] text-white/50">Editor-rendered caption safe zone</div>
              </div>
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[10px] text-white/40"><span>{manifest?.status || "DRAFT"}</span><span>9:16</span></div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Production truth</div>
            <div className="mt-4 space-y-3 text-sm">
              <Status icon={Database} label="Manifest" value={production ? `Persisted r${production.revision}` : "Not created"} />
              <Status icon={Film} label="State" value={manifest?.status || "DRAFT"} />
              <Status icon={Mic2} label="Narration" value={manifest?.audio.narrationUrl ? `${manifest.audio.actualDurationSec?.toFixed(2)}s` : "Pending"} />
              <Status icon={Captions} label="Timing" value={manifest?.audio.timingSource === "actual-alignment" ? `${manifest.audio.wordTimings?.length || 0} words aligned` : "Pending"} />
              <Status icon={AudioLines} label="Voice model" value={manifest?.audio.model || "Pending"} />
              <Status icon={Instagram} label="Primary" value={manifest?.platform || platform} />
              <Status icon={Youtube} label="Shorts variant" value="Not generated" />
            </div>
            {production && manifest?.status === "SCRIPT_READY" && <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-[11px] leading-5 text-amber-100/70">Next required step: synthesize a real narration waveform and transcribe it for word-level timing.</div>}
            {production && manifest?.status === "SHOTS_PLANNED" && <div className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/5 p-3 text-[11px] leading-5 text-emerald-100/70">Narration is real and aligned. The shot timeline was rebuilt against its actual duration. Video assets are still pending.</div>}
            {production && manifest?.status === "FAILED" && <div className="mt-5 rounded-xl border border-red-300/15 bg-red-300/5 p-3 text-[11px] leading-5 text-red-100/70">The last production step failed. No downstream stage has been marked complete.</div>}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="block"><span className="text-xs font-bold text-slate-500">{label.toUpperCase()}</span><div className="relative mt-2"><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 pr-9 text-sm text-slate-200 outline-none focus:border-pink-300/30">{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-600" /></div></label>;
}

function ScriptPanel({ script, copied, onCopy }: { script: string[]; copied: boolean; onCopy: () => void }) {
  return <div><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[0.16em] text-pink-300">MASTER SCRIPT</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">The script is part of the production manifest.</h2></div><button onClick={onCopy} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-400 hover:text-white">{copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button></div><div className="mt-8 space-y-3">{script.map((line, i) => <div key={`${i}-${line.slice(0, 20)}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-7 text-slate-300"><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] font-black text-slate-500">{i + 1}</span>{line}</div>)}</div></div>;
}

function ListPanel({ icon: Icon, eyebrow, title, items }: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; items: string[] }) {
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><Icon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">{eyebrow}</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">{title}</h2><div className="mt-8 space-y-3">{items.map((item, i) => <div key={`${i}-${item.slice(0, 24)}`} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black text-slate-500">{i + 1}</div><div className="text-sm leading-7 text-slate-300">{item}</div></div>)}</div></div>;
}

function CoverPanel({ topic }: { topic: string }) {
  const base = topic.trim() || "YOUR NEXT REEL";
  const options = [base.toUpperCase(), `WHY ${base.toUpperCase()}`, "STOP IGNORING THIS"];
  return <div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-pink-200"><ImageIcon className="h-5 w-5" /></div><div className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-pink-300">COVER DIRECTIONS</div><h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white">Creative options, not generated assets yet.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{options.map((title, i) => <div key={`${i}-${title}`} className="aspect-[4/5] rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_70%_20%,rgba(244,114,182,0.24),transparent_25%),linear-gradient(150deg,#17111b,#0b1015)] p-5"><div className="text-xs font-bold text-slate-500">OPTION {i + 1}</div><div className="mt-20 text-xl font-black leading-tight tracking-[-0.035em] text-white">{title}</div></div>)}</div></div>;
}

function Status({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" /><span>{label}</span></div><span className="max-w-[155px] truncate text-xs font-semibold text-slate-500">{value}</span></div>;
}
