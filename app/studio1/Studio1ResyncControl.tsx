"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Film, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

type TimelineQa = {
  version?: number;
  timingContract?: string;
  passed?: boolean;
  maxBoundaryDriftMs?: number;
  maxAllowedBoundaryDriftMs?: number;
};

type Production = {
  id: string;
  revision: number;
  manifest: {
    shots?: Array<{ asset?: { videoUrl?: string } }>;
    outputs?: { narratedRoughCut?: { videoUrl?: string; timelineQa?: TimelineQa } };
    audio?: { narrationUrl?: string; alignmentValidation?: { passed?: boolean } };
    studio1?: { timelineSync?: { version?: number; source?: string; syncedAt?: string; renderQa?: TimelineQa } };
  };
};

type Operation = { status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"; lastError?: string };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function certifiedRoughCut(production: Production | null) {
  const qa = production?.manifest?.outputs?.narratedRoughCut?.timelineQa;
  const allowed = Number(qa?.maxAllowedBoundaryDriftMs ?? 50);
  const drift = Number(qa?.maxBoundaryDriftMs ?? Number.POSITIVE_INFINITY);
  return Boolean(
    production?.manifest?.outputs?.narratedRoughCut?.videoUrl &&
    Number(production?.manifest?.studio1?.timelineSync?.version || 0) >= 2 &&
    qa?.timingContract === "narration-master-clock" &&
    qa?.passed === true &&
    Number.isFinite(drift) &&
    drift <= allowed
  );
}

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

  const hasPrerequisites = Boolean(
    production?.manifest?.audio?.narrationUrl &&
    production?.manifest?.audio?.alignmentValidation?.passed &&
    production?.manifest?.shots?.length &&
    production.manifest.shots.every(shot => Boolean(shot.asset?.videoUrl))
  );
  if (!hasPrerequisites) return null;

  const certified = certifiedRoughCut(production);
  const hasLegacyOutput = Boolean(production?.manifest?.outputs?.narratedRoughCut?.videoUrl) && !certified;

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
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to start exact synchronized rebuild");
      const operationId = String(data.operation?.id || "");
      if (!operationId) throw new Error("Exact synchronized rebuild did not return an operation ID");

      for (let attempt = 0; attempt < 240; attempt++) {
        await sleep(1500);
        const poll = await fetch(`/api/reels/operations/${encodeURIComponent(operationId)}`, { cache: "no-store" });
        const pollData = await poll.json();
        if (!poll.ok || !pollData.success) throw new Error(pollData.error || "Failed to read synchronized rebuild");
        const operation = pollData.operation as Operation;
        if (operation.status === "SUCCEEDED") {
          const verify = await fetch(`/api/studio1/productions/${encodeURIComponent(production.id)}`, { cache: "no-store" });
          const verifyData = await verify.json();
          if (!verify.ok || !verifyData.success) throw new Error(verifyData.error || "Rebuild completed but certification could not be verified");
          const rebuilt = verifyData.production as Production;
          if (!certifiedRoughCut(rebuilt)) {
            throw new Error("Rebuild completed without passing narration-master-clock timeline certification. The stale Full Reel was not accepted.");
          }
          setProduction(rebuilt);
          window.location.reload();
          return;
        }
        if (operation.status === "FAILED") throw new Error(operation.lastError || "Exact synchronized rebuild failed");
      }
      throw new Error("Exact synchronized rebuild is still running. Refresh Studio1 to check the durable result.");
    } catch (err: any) {
      setError(err?.message || "Failed to rebuild synchronized Full Reel");
      setBusy(false);
    }
  };

  if (certified) {
    const qa = production?.manifest?.outputs?.narratedRoughCut?.timelineQa;
    return <div className="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-2.5rem))] rounded-2xl border border-emerald-300/20 bg-[#0b0e13]/95 p-4 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-emerald-300/10 p-2 text-emerald-200"><CheckCircle2 className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="text-sm font-black text-white">Full Reel sync certified</div><div className="mt-1 text-[11px] leading-5 text-slate-400">Narration-master-clock QA passed · max boundary drift {Number(qa?.maxBoundaryDriftMs || 0).toFixed(1)} ms.</div></div></div>
    </div>;
  }

  return <div className="fixed bottom-5 right-5 z-[80] w-[min(390px,calc(100vw-2.5rem))] rounded-2xl border border-amber-300/30 bg-[#0b0e13]/98 p-4 text-slate-100 shadow-2xl backdrop-blur-xl">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-amber-300/10 p-2 text-amber-200">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="text-sm font-black text-white">{hasLegacyOutput ? "Legacy Full Reel detected" : "Full Reel requires sync certification"}</div><div className="mt-1 text-[11px] leading-5 text-slate-400">{hasLegacyOutput ? "This MP4 predates the exact-sync render contract. Deploying new code cannot rewrite an already encoded Reel; it must be rebuilt and certified before it is treated as fixed." : "All clips and validated narration are ready. Build the Full Reel using exact transcript-aligned scene timing."}</div></div></div>
    <button onClick={resync} disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-slate-950 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{busy ? "Rebuilding + certifying…" : "Rebuild + Certify Full Reel"}</button>
    <div className="mt-2 flex items-center gap-1.5 text-[10px] leading-4 text-slate-500"><Film className="h-3 w-3" />Existing scene clips are reused only within safe local adaptation limits; unsafe scenes fail for selective regeneration.</div>
    {error && <div className="mt-2 text-[11px] leading-5 text-red-300">{error}</div>}
  </div>;
}
