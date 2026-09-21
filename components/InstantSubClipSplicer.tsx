"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface SplicerSourceItem {
  clipId: string;
  label: string;
  src: string;
  maxDurationSec: number;
  defaultStartSec?: number;
  defaultEndSec?: number;
}

export interface QueuedSpliceSegment {
  uid: string;
  clipId: string;
  label: string;
  src: string;
  startSec: number;
  endSec: number;
  speed: number;
}

export interface SplicedResult {
  entityId: string;
  canonicalUrl: string;
  src: string;
  durationSec: number;
  summary: string;
  segmentCount: number;
}

/**
 * Inline Sub-Clip Trimmer & Instant Exporter for any single Reel or Child Clip (CLP-...-ACT01..ACT06)
 */
export function InlineClipTrimmer({
  clipId,
  label,
  src,
  maxDurationSec,
  onAddToQueue,
}: {
  clipId: string;
  label: string;
  src: string;
  maxDurationSec: number;
  onAddToQueue?: (seg: QueuedSpliceSegment) => void;
}) {
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(Math.min(maxDurationSec, 10));
  const [speed, setSpeed] = useState<number>(1.0);
  const [isCutting, setIsCutting] = useState<boolean>(false);
  const [result, setResult] = useState<SplicedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validStart = Math.max(0, Math.min(startSec, maxDurationSec - 0.5));
  const validEnd = Math.max(validStart + 0.5, Math.min(endSec, maxDurationSec));
  const cutDuration = ((validEnd - validStart) / speed).toFixed(2);

  async function handleInstantCut() {
    setIsCutting(true);
    setError(null);
    try {
      const res = await fetch("/api/swarm/splice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId,
          label,
          src,
          startSec: validStart,
          endSec: validEnd,
          speed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cut sub-clip");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Splice error");
    } finally {
      setIsCutting(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl bg-black/70 border border-white/10 p-2.5 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono">
        <span className="text-amber-300 font-bold">
          ✂️ Instant Sub-Clip Splicer • {clipId}
        </span>
        <span className="text-slate-400">
          Cut Length: <b className="text-emerald-300">{cutDuration}s</b> ({speed.toFixed(2)}x)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <label className="flex items-center gap-1 text-slate-300">
          <span>Start(s):</span>
          <input
            type="number"
            min={0}
            max={maxDurationSec - 0.5}
            step={0.5}
            value={startSec}
            onChange={(e) => setStartSec(Number(e.target.value))}
            className="w-14 px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-300 font-bold text-center"
          />
        </label>

        <label className="flex items-center gap-1 text-slate-300">
          <span>End(s):</span>
          <input
            type="number"
            min={validStart + 0.5}
            max={maxDurationSec}
            step={0.5}
            value={endSec}
            onChange={(e) => setEndSec(Number(e.target.value))}
            className="w-14 px-1.5 py-0.5 rounded bg-black border border-white/20 text-emerald-300 font-bold text-center"
          />
        </label>

        <label className="flex items-center gap-1 text-slate-300">
          <span>Speed:</span>
          <input
            type="number"
            min={0.5}
            max={2.0}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-14 px-1.5 py-0.5 rounded bg-black border border-white/20 text-white text-center"
          />
        </label>

        <button
          type="button"
          onClick={handleInstantCut}
          disabled={isCutting}
          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-[11px] shadow transition"
        >
          {isCutting ? "✂️ Cutting..." : "✂️ Instant Cut & Export MP4"}
        </button>

        {onAddToQueue && (
          <button
            type="button"
            onClick={() =>
              onAddToQueue({
                uid: `${clipId}_${Date.now()}`,
                clipId,
                label,
                src,
                startSec: validStart,
                endSec: validEnd,
                speed,
              })
            }
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-bold text-[11px] transition"
          >
            ➕ Add to Multi-Clip Splicer
          </button>
        )}
      </div>

      {error && <div className="text-[11px] font-mono text-rose-400">{error}</div>}

      {result && (
        <div className="pt-2 border-t border-emerald-400/30 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-emerald-300 font-bold">
              ✅ Ready: {result.entityId} ({result.durationSec}s)
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={result.canonicalUrl}
                className="text-amber-300 hover:underline font-bold"
              >
                {result.canonicalUrl}
              </Link>
              <a
                href={result.src}
                download={`${result.entityId}.mp4`}
                className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold"
              >
                ⬇ Download Cut MP4
              </a>
            </div>
          </div>
          <video
            src={result.src}
            controls
            playsInline
            className="w-full max-h-48 rounded-lg bg-black border border-emerald-400/40 object-contain"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Multi-Clip Custom Reel Splicer Workbench:
 * Pick any start/end second across any child clip (CLP-...-ACT01..ACT06) or Combined Reel
 * and export a custom-spliced reel instantly.
 */
export function MultiClipSplicerWorkbench({
  availableSources,
  queue,
  setQueue,
}: {
  availableSources: SplicerSourceItem[];
  queue: QueuedSpliceSegment[];
  setQueue: React.Dispatch<React.SetStateAction<QueuedSpliceSegment[]>>;
}) {
  const [selectedSourceIdx, setSelectedSourceIdx] = useState<number>(0);
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(5);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isSplicing, setIsSplicing] = useState<boolean>(false);
  const [masterResult, setMasterResult] = useState<SplicedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeSource = availableSources[selectedSourceIdx] || availableSources[0];

  function handleAddQuickSegment() {
    if (!activeSource) return;
    const s = Math.max(0, Math.min(startSec, activeSource.maxDurationSec - 0.5));
    const e = Math.max(s + 0.5, Math.min(endSec, activeSource.maxDurationSec));
    setQueue((prev) => [
      ...prev,
      {
        uid: `${activeSource.clipId}_${Date.now()}`,
        clipId: activeSource.clipId,
        label: activeSource.label,
        src: activeSource.src,
        startSec: s,
        endSec: e,
        speed,
      },
    ]);
  }

  async function handleExportCombinedSplice() {
    if (!queue.length) return;
    setIsSplicing(true);
    setError(null);
    try {
      const res = await fetch("/api/swarm/splice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: queue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Multi-clip splice failed");
      setMasterResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Splice error");
    } finally {
      setIsSplicing(false);
    }
  }

  const totalQueuedDuration = queue.reduce(
    (sum, item) => sum + (item.endSec - item.startSec) / item.speed,
    0
  );

  return (
    <div className="rounded-2xl bg-[#0B0F19] border border-amber-400/35 p-4 space-y-3 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-extrabold">
            ✂️ INSTANT CHILD-CLIP & REEL SUB-CLIP SPLICER
          </span>
          <span className="text-xs text-slate-300">
            Pick any Start/End second on any Child Clip (<code className="text-amber-300">CLP-...-ACT01..ACT06</code>) or Combined Reel & export instantly
          </span>
        </div>
        {queue.length > 0 && (
          <span className="font-mono text-xs text-emerald-300 font-bold">
            Timeline: {queue.length} Sub-Clips • Total {totalQueuedDuration.toFixed(2)}s
          </span>
        )}
      </div>

      {/* Quick Selector Row */}
      <div className="flex flex-wrap items-end gap-2 bg-black/60 p-3 rounded-xl border border-white/10">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Source Reel / Child Clip (CLP-...-ACT01..ACT06)
          </label>
          <select
            value={selectedSourceIdx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedSourceIdx(idx);
              const target = availableSources[idx];
              if (target) {
                setStartSec(0);
                setEndSec(Math.min(target.maxDurationSec, 5));
              }
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D111A] border border-white/15 text-xs font-mono text-white"
          >
            {availableSources.map((s, idx) => (
              <option key={`${s.clipId}_${idx}`} value={idx}>
                {s.clipId} — {s.label} (0.0s – {s.maxDurationSec.toFixed(1)}s)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Start (s)
          </label>
          <input
            type="number"
            min={0}
            max={(activeSource?.maxDurationSec || 60) - 0.5}
            step={0.5}
            value={startSec}
            onChange={(e) => setStartSec(Number(e.target.value))}
            className="w-20 px-2 py-1.5 rounded-lg bg-[#0D111A] border border-white/15 text-xs font-mono text-amber-300 font-bold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            End (s)
          </label>
          <input
            type="number"
            min={startSec + 0.5}
            max={activeSource?.maxDurationSec || 60}
            step={0.5}
            value={endSec}
            onChange={(e) => setEndSec(Number(e.target.value))}
            className="w-20 px-2 py-1.5 rounded-lg bg-[#0D111A] border border-white/15 text-xs font-mono text-emerald-300 font-bold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Speed
          </label>
          <input
            type="number"
            min={0.5}
            max={2.0}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 px-2 py-1.5 rounded-lg bg-[#0D111A] border border-white/15 text-xs font-mono text-white"
          />
        </div>

        <button
          type="button"
          onClick={handleAddQuickSegment}
          className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow transition"
        >
          ➕ Add Sub-Clip to Timeline
        </button>

        {queue.length > 0 && (
          <button
            type="button"
            onClick={handleExportCombinedSplice}
            disabled={isSplicing}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow transition"
          >
            {isSplicing
              ? "🎬 Splicing Custom Reel..."
              : `🎬 Instant Export Custom Reel (${queue.length} Cuts)`}
          </button>
        )}
      </div>

      {/* Queued Sub-Clips Sequence Pills */}
      {queue.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {queue.map((seg, i) => (
            <div
              key={seg.uid}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-xs font-mono text-emerald-200"
            >
              <span className="font-bold text-amber-300">#{i + 1}</span>
              <span>
                {seg.clipId} [{seg.startSec.toFixed(1)}s → {seg.endSec.toFixed(1)}s @{" "}
                {seg.speed.toFixed(2)}x]
              </span>
              <button
                type="button"
                onClick={() => setQueue((prev) => prev.filter((x) => x.uid !== seg.uid))}
                className="text-rose-400 hover:text-rose-300 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQueue([])}
            className="text-[11px] font-mono text-slate-400 hover:text-white underline ml-2"
          >
            Clear Timeline
          </button>
        </div>
      )}

      {error && <div className="text-xs font-mono text-rose-400">{error}</div>}

      {/* Instant Custom Spliced Reel Output Preview & Download */}
      {masterResult && (
        <div className="rounded-xl bg-black/80 border border-emerald-400/50 p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-extrabold">
                {masterResult.entityId}
              </span>
              <span className="text-emerald-300 font-bold">
                Custom Spliced Reel Ready • {masterResult.durationSec}s ({masterResult.summary})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={masterResult.canonicalUrl}
                className="text-amber-300 hover:underline font-bold"
              >
                {masterResult.canonicalUrl}
              </Link>
              <a
                href={masterResult.src}
                download={`${masterResult.entityId}.mp4`}
                className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
              >
                ⬇ Download Custom Reel MP4
              </a>
            </div>
          </div>
          <video
            src={masterResult.src}
            controls
            playsInline
            className="w-full max-h-72 rounded-xl bg-black border border-white/15 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}
