"use client";

import { useEffect, useState } from "react";
import { Film, Loader2, RefreshCw } from "lucide-react";

type Production = {
  id: string;
  revision: number;
  manifest: {
    shots?: Array<{ asset?: { videoUrl?: string } }>;
    outputs?: { narratedRoughCut?: { videoUrl?: string } };
    audio?: { narrationUrl?: string; alignmentValidation?: { passed?: boolean } };
    studio1?: { timelineSync?: { source?: string; syncedAt?: string } };
  };
};

type Operation = { status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function Studio1ResyncControl() {
  const [production, setProduction] = useState<Production | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("productionId");
    if (!id) return;
    fetch(`/api/studio1/productions/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(response => response.json().then(data => ({ response, data })))
      .then(({ response, data }) => { if (response.ok && data.success) setProduction(data.production); })
      .catch(() => undefined);
  }, []);

  const canResync = Boolean(
    production?.manifest?.outputs?.narratedRoughCut?.videoUrl &&
    production?.manifest?.audio?.narrationUrl &&
    production?.manifest?.audio?.alignmentValidation?.passed &&
    production?.manifest?.shots?.length &&
    production.manifest.shots.every(shot => Boolean(shot.asset?.videoUrl))
  );
  if (!canResync) return null;

  const resync = async () => {
    if (!production || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/studio1/productions/${encodeURIComponent(production.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renderNarratedRoughCut", expectedRevision: production.revision }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to start synchronized rebuild");
      const operationId = String(data.operation?.id || "");
      if (!operationId) throw new Error("Synchronized rebuild did not return an operation ID");

      for (let attempt = 0; attempt < 240; attempt++) {
        await sleep(1500);
        const poll = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" });
        const pollData = await poll.json();
        if (!poll.ok || !pollData.success) throw new Error(pollData.error || "Failed to read synchronized rebuild");
        const operation = pollData.operation as Operation;
        if (operation.status === "SUCCEEDED") {
          window.location.reload();
          return;
        }
        if (operation.status === "FAILED") throw new Error(operation.lastError || "Synchronized rebuild failed");
      }
      throw new Error("Synchronized rebuild is still running. Refresh Studio1 to check the durable result.");
    } catch (err: any) {
      setError(err?.message || "Failed to resync full Reel");
      setBusy(false);
    }
  };

  const alreadySynced = production?.manifest?.studio1?.timelineSync?.source === "actual-narration-word-timings";
  return <div className="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-violet-300/25 bg-[#0b0e13]/95 p-4 text-slate-100 shadow-2xl backdrop-blur-xl">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-violet-300/10 p-2 text-violet-200">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Film className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="text-sm font-black text-white">{alreadySynced ? "Rebuild synchronized Reel" : "Fix full-Reel synchronization"}</div><div className="mt-1 text-[11px] leading-5 text-slate-400">Uses the existing clips and actual narration word timestamps. No clip regeneration.</div></div></div>
    <button onClick={resync} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-slate-950 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{busy ? "Resyncing + rebuilding…" : "Resync + Rebuild Full Reel"}</button>
    {error && <div className="mt-2 text-[11px] leading-5 text-red-300">{error}</div>}
  </div>;
}
