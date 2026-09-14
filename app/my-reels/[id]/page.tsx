"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorldClassDirectorSuite, { DirectorReelData } from "@/components/WorldClassDirectorSuite";

export default function ReelDirectorDedicatedPage() {
  const params = useParams();
  const router = useRouter();
  const reelId = typeof params?.id === "string" ? decodeURIComponent(params.id) : "";

  const [reel, setReel] = useState<DirectorReelData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!reelId) return;
    let cancelled = false;
    async function loadReelData() {
      setLoading(true);
      try {
        // 1. Check YT Productions
        const ytRes = await fetch("/api/yt/productions", { cache: "no-store" });
        if (ytRes.ok) {
          const ytJson = await ytRes.json();
          const foundYt = (ytJson.productions || []).find((p: any) => p.id === reelId);
          if (foundYt && !cancelled) {
            const m = foundYt.manifest || {};
            const assets = m.assets || {};
            setReel({
              id: foundYt.id,
              title: foundYt.topic || "Music Video Production",
              subtitle: `Omni 1.1 Hybrid Master • ID: ${foundYt.id}`,
              prompt: foundYt.topic,
              videoUrl: assets.masterHybridUrl || `/renders/yt/${foundYt.id}/master_hybrid.mp4`,
              posterUrl: assets.anchorUrl || `/renders/yt/${foundYt.id}/anchor.png`,
              durationSec: Number(foundYt.durationSec || 24),
              aspectRatio: "9:16 Vertical",
              genre: foundYt.genre || "MUSIC_VIDEO",
              shots: (assets.shots || []).map((s: any, idx: number) => ({
                id: s.id || `shot_${idx + 1}`,
                order: idx + 1,
                title: `Shot 0${idx + 1}`,
                videoUrl: s.videoUrl || `/renders/yt/${foundYt.id}/shot_${idx + 1}.mp4`,
                durationSec: Number(s.durationSec || 6),
                scriptText: s.lyric || "",
                visualIntent: s.visual_direction || "",
              })),
              manifest: m,
            });
            setLoading(false);
            return;
          }
        }

        // 2. Check Studio 1 Reels
        const rRes = await fetch("/api/reels/productions", { cache: "no-store" });
        if (rRes.ok) {
          const rJson = await rRes.json();
          const foundReel = (rJson.productions || []).find((p: any) => p.id === reelId);
          if (foundReel && !cancelled) {
            const m = foundReel.manifest || {};
            setReel({
              id: foundReel.id,
              title: m.title || foundReel.topic || "Cinema Reel Production",
              subtitle: m.subtitle || "Continuous Sequence",
              prompt: foundReel.topic || m.masterScript || "",
              videoUrl: m.outputs?.narratedRoughCut?.videoUrl || m.outputs?.master?.videoUrl || null,
              posterUrl: m.theatricalPosterUrl || null,
              durationSec: Number(m.plannedDurationSec || 24),
              aspectRatio: m.aspectRatio || "9:16 Vertical",
              genre: foundReel.genre || "Cinema Reel",
              shots: (m.shots || []).map((s: any, idx: number) => ({
                id: s.id || `shot_${idx + 1}`,
                order: idx + 1,
                title: `Shot 0${idx + 1}`,
                videoUrl: s.asset?.videoUrl || null,
                durationSec: Number(s.editorialDurationSec || 6),
                scriptText: s.scriptText || "",
                visualIntent: s.visualIntent || "",
              })),
              manifest: m,
            });
            setLoading(false);
            return;
          }
        }

        // 3. Fallback static/curated ID
        if (!cancelled) {
          setReel({
            id: reelId,
            title: reelId.replace(/_/g, " ").toUpperCase(),
            subtitle: `Master Production • ID: ${reelId}`,
            prompt: reelId,
            videoUrl: reelId.startsWith("yt_")
              ? `/renders/yt/${reelId}/master_hybrid.mp4`
              : `/assets/video/${reelId}.mp4`,
            posterUrl: null,
            durationSec: 24,
            aspectRatio: "9:16 Vertical",
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) setLoading(false);
      }
    }
    loadReelData();
    return () => {
      cancelled = true;
    };
  }, [reelId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#070A12] flex items-center justify-center text-slate-300 font-bold text-sm">
        Loading Omni 1.1 Director Suite for {reelId}...
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="min-h-screen w-full bg-[#070A12] flex flex-col items-center justify-center gap-4 text-slate-300">
        <div>Production not found: {reelId}</div>
        <button
          onClick={() => router.push("/my-reels")}
          className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <WorldClassDirectorSuite
      reel={reel}
      onBack={() => router.push("/my-reels")}
    />
  );
}
