"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { Film, Loader2, Play, RefreshCw } from "lucide-react";

type Production = { id: string; revision: number; manifest: any; updatedAt?: string };

export default function PlayerIndexPage() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/reels/productions?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load productions");
      setProductions(Array.isArray(data.productions) ? data.productions : []);
    } catch (e: any) { setError(e?.message || String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return <div className="min-h-screen bg-[#07090d] text-slate-100">
    <AppNavbar />
    <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div><div className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Composable Player</div><h1 className="mt-2 text-3xl font-black">Choose a persisted production</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Play any selected subset of clips as a sequence and independently control speech, music and captions.</p></div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Refresh</button>
      </div>
      {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-2 py-24 text-slate-500"><Loader2 className="h-5 w-5 animate-spin"/>Loading…</div> : <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{productions.map(p => {
        const m = p.manifest || {};
        const generated = (m.shots || []).filter((s:any) => s.asset?.videoUrl).length;
        return <Link key={p.id} href={`/studio/player/${encodeURIComponent(p.id)}`} className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-teal-300/30 hover:bg-white/[0.04]">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-lg font-black">{m.topic || p.id}</div><div className="mt-1 text-xs text-slate-500">{m.status} · rev {p.revision}</div></div><div className="rounded-xl bg-teal-300/10 p-2 text-teal-300"><Play className="h-4 w-4 fill-current"/></div></div>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Film className="h-4 w-4"/>{generated}/{(m.shots || []).length} clips · {m.audio?.narrationUrl ? "speech ready" : "speech pending"} · {m.audio?.musicUrl ? "music ready" : "music pending"}</div>
        </Link>;
      })}</div>}
    </main>
  </div>;
}
