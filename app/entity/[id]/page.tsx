'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Film,
  Layers,
  Cpu,
  Clock,
  ExternalLink,
  ShieldCheck,
  Camera,
  Wand2,
} from 'lucide-react';
import { FeedbackHeaderEmailButton } from '@/components/UniversalFeedbackSystem';
import { DeepResearchBiblePanel } from '@/components/DeepResearchBiblePanel';
import type { DeepResearchProductionBible } from '@/lib/swarm/deepResearchBible';

interface EntitySegment {
  act: number;
  actId: string;
  canonicalUrl: string;
  studioUrl: string;
  timeRange: string;
  durationSec: number;
  label: string;
  videoSrc: string;
  cameraPreset?: string;
  lensPreset?: string;
  slugline?: string;
  speaker?: string;
  dialogue?: string;
  vfxCue?: string;
  lightingCue?: string;
  sfxAndFoleyCue?: string;
}

interface EntityRecord {
  id: string;
  canonicalId: string;
  entityType: 'REEL' | 'ACT';
  parentReelId?: string;
  actNumber?: number;
  title: string;
  category?: string;
  durationSeconds: number;
  durationLabel?: string;
  aspectRatio?: string;
  resolution?: string;
  fps?: number;
  videoSrc: string;
  posterSrc?: string;
  canonicalUrl: string;
  studioUrl: string;
  prompt?: string;
  actsCount?: number;
  parallelWorkers?: {
    totalWorkers: number;
    mode: string;
    engineLabel?: string;
    veoWorkers: number;
    lyriaWorkers: number;
    chirpWorkers: number;
    muxWorker: number;
  };
  segments?: EntitySegment[];
  deepResearchBible?: DeepResearchProductionBible;
}

export default function CanonicalEntityInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = typeof params?.id === 'string' ? decodeURIComponent(params.id) : '';

  const [entity, setEntity] = useState<EntityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>('');
  const [activeActLabel, setActiveActLabel] = useState<string>('Full Master Reel');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rawId) return;
    setLoading(true);
    fetch(`/api/entity/${encodeURIComponent(rawId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.entity) {
          throw new Error(data?.error || `Entity ${rawId} not found`);
        }
        setEntity(data.entity);
        setActiveVideoSrc(data.entity.videoSrc);
        setActiveActLabel(
          data.entity.entityType === 'ACT'
            ? `Act ${data.entity.actNumber}: ${data.entity.title}`
            : `Full ${data.entity.durationSeconds}s Master Reel`
        );
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawId]);

  const handleCopy = (value: string, key: string) => {
    if (typeof window !== 'undefined') {
      const full = value.startsWith('http') ? value : `${window.location.origin}${value}`;
      navigator.clipboard?.writeText(full).catch(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const toggleFullscreen = async () => {
    const el = stageContainerRef.current || videoRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
    } catch {
      // Fallback ignored
    }
  };

  return (
    <div
      data-testid="canonical-entity-inspector-page"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans"
    >
      {/* Top Header Bar (Executive Light Theme - Rule 54 & Rule 58) */}
      <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={entity?.studioUrl || '/swarm-MUI'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            data-testid="entity-back-to-studio-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open in Super-Studio</span>
          </Link>
          <Link
            href="/library"
            data-testid="entity-open-library-vault-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <span>Library Vault</span>
            <ExternalLink className="w-3 h-3 text-indigo-600" />
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[11px] font-bold">
              {entity?.canonicalId || rawId}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Canonical Object Registry &amp; Uncropped Master Player
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {entity && (
            <>
              <button
                type="button"
                onClick={() => handleCopy(entity.canonicalUrl, 'canonical')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                data-testid="entity-copy-permalink-btn"
              >
                {copiedKey === 'canonical' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === 'canonical' ? 'Copied Permalink!' : 'Copy Canonical URL'}</span>
              </button>
              <a
                href={activeVideoSrc || entity.videoSrc}
                download={`${entity.canonicalId}.mp4`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                data-testid="entity-download-mp4-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master MP4</span>
              </a>
            </>
          )}
          <FeedbackHeaderEmailButton
            appId="zyvoriq"
            appName="Zyvoriq Canonical Inspector"
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-none px-[clamp(16px,1.8vw,28px)] py-5">
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Resolving Canonical Object <span className="font-mono text-indigo-600">{rawId}</span>...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs">
            <p className="text-base font-bold text-rose-700 mb-2">Object Not Found: {rawId}</p>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <Link
              href="/swarm-MUI"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Return to Zyvoriq Super-Studio
            </Link>
          </div>
        )}

        {!loading && entity && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Center 7 Columns: Uncropped Master Video Stage */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        ● VERIFIED MASTER
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        ID: {entity.canonicalId}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {entity.durationLabel || `${entity.durationSeconds}.0s`}
                      </span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mt-1" data-testid="entity-title">
                      {entity.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                      data-testid="entity-fullscreen-uncropped-btn"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Full Screen (Uncropped 100% Fit)</span>
                    </button>
                  </div>
                </div>

                {/* Uncropped Video Viewport */}
                <div
                  ref={stageContainerRef}
                  className="relative w-full h-[540px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200"
                >
                  <video
                    ref={videoRef}
                    key={activeVideoSrc}
                    src={activeVideoSrc}
                    poster={entity.posterSrc}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: '#000000',
                    }}
                    data-testid="entity-master-video-player"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs pointer-events-none">
                    <Film className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[11px] font-bold text-slate-800">{activeActLabel}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      object-fit: contain (0% Crop)
                    </span>
                  </div>
                </div>

                {/* Stage Controls Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!videoRef.current) return;
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMuted((prev) => !prev);
                        if (videoRef.current) videoRef.current.muted = !isMuted;
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
                    </button>
                    {activeVideoSrc !== entity.videoSrc && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVideoSrc(entity.videoSrc);
                          setActiveActLabel(`Full ${entity.durationSeconds}s Master Reel`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                      >
                        Return to Full {entity.durationSeconds}s Master
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>Aspect: {entity.aspectRatio || '9:16'}</span>
                    <span>•</span>
                    <span>Res: {entity.resolution || '720x1280'}</span>
                    <span>•</span>
                    <span>FPS: {entity.fps || 24} CFR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Canonical Object Metadata, Parallel Workers & N-Act Storyboard */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Canonical Identity Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Canonical Object Identity &amp; Deep-Links
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    {entity.entityType}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Unique Object ID
                      </div>
                      <div className="font-mono font-bold text-slate-900" data-testid="entity-canonical-id">
                        {entity.canonicalId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(entity.canonicalId, 'id')}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {copiedKey === 'id' ? 'Copied' : 'Copy ID'}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {entity.entityType === 'ACT' && entity.parentReelId
                          ? 'Parent Master Reel'
                          : 'Canonical Entity Permalink'}
                      </div>
                      <div className="font-mono font-semibold text-indigo-700 truncate">
                        {entity.entityType === 'ACT' && entity.parentReelId
                          ? `/entity/${entity.parentReelId}`
                          : entity.canonicalUrl}
                      </div>
                    </div>
                    {entity.entityType === 'ACT' && entity.parentReelId ? (
                      <Link
                        href={`/entity/${entity.parentReelId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-indigo-700 hover:bg-slate-100 shrink-0"
                      >
                        <span>Parent Reel</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        href="/library"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
                      >
                        <span>All Vault Reels</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Super-Studio Editor Deep-Link
                      </div>
                      <div className="font-mono font-semibold text-slate-700 truncate">
                        {entity.studioUrl}
                      </div>
                    </div>
                    <Link
                      href={entity.studioUrl}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 shrink-0"
                    >
                      <span>Edit in Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {entity.parallelWorkers && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        Parallel Swarm Execution Provenance
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {entity.parallelWorkers.totalWorkers} Concurrent Workers
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Mode: <span className="font-mono font-semibold">{entity.parallelWorkers.mode}</span> ({entity.parallelWorkers.veoWorkers} {entity.parallelWorkers.engineLabel || "Omni 1.1"} Act Workers + {entity.parallelWorkers.lyriaWorkers} Lyria 3 Pro Score Worker + {entity.parallelWorkers.chirpWorkers} Chirp 3 HD Voice Worker)
                    </p>
                  </div>
                )}
              </div>

              {/* N-Act Storyboard & Per-Act Canonical Links */}
              {entity.segments && entity.segments.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-bold text-slate-900">
                        {entity.segments.length}-Act Master Storyboard ({entity.durationSeconds}s Total)
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Click any Act to inspect or deep-link
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {entity.segments.map((seg) => {
                      const isSelected = activeVideoSrc === seg.videoSrc;
                      return (
                        <div
                          key={seg.actId}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                          data-testid={`entity-act-card-${seg.act}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-indigo-700 shrink-0">
                                {seg.actId}
                              </span>
                              <span className="text-[11px] font-mono font-semibold text-slate-500 shrink-0">
                                {seg.timeRange}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveVideoSrc(seg.videoSrc);
                                  setActiveActLabel(`Act ${seg.act} (${seg.timeRange}): ${seg.label}`);
                                }}
                                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold"
                              >
                                Play Act {seg.act}
                              </button>
                              <Link
                                href={seg.canonicalUrl}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold"
                              >
                                Permalink ↗
                              </Link>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 mt-1.5">
                            {seg.label}
                          </div>
                          {(seg.cameraPreset || seg.lensPreset) && (
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                              {seg.cameraPreset && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200">
                                  <Camera className="w-3 h-3 text-indigo-600" />
                                  {seg.cameraPreset}
                                </span>
                              )}
                              {seg.lensPreset && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200">
                                  <Wand2 className="w-3 h-3 text-amber-600" />
                                  {seg.lensPreset}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {entity.deepResearchBible && (
              <div className="lg:col-span-12">
                <DeepResearchBiblePanel
                  bible={entity.deepResearchBible}
                  onSelectAct={(actNum) => {
                    const seg = entity.segments?.find((s) => s.act === actNum);
                    if (seg) {
                      setActiveVideoSrc(seg.videoSrc);
                      setActiveActLabel(`Act ${seg.act} (${seg.timeRange}): ${seg.label}`);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
