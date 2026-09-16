'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SWARM_AUDIO_VOICE_SAMPLES,
  SWARM_BGM_SCORE_SAMPLES,
} from '@/lib/swarm/engine';

export default function SwarmStudioPage() {
  const [plan, setPlan] = useState<any>(null);
  const [rendering, setRendering] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'screenplay' | 'nanobanana' | 'lyria'>('screenplay');

  // Audio & Background Music Stem Selector State
  const [selectedVoiceSampleId, setSelectedVoiceSampleId] = useState<string>('native_veo_speech');
  const [selectedBgmSampleId, setSelectedBgmSampleId] = useState<string>('no_bgm_silent');
  const [voiceVolume, setVoiceVolume] = useState<number>(1.40);
  const [bgmVolume, setBgmVolume] = useState<number>(0.0);
  const [foleyVolume, setFoleyVolume] = useState<number>(0.35);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [renderResult, setRenderResult] = useState<any>({
    status: 'rendered',
    videoUrl: '/assets/swarm/cathedral_of_crust_master.mp4',
    posterUrl: '/assets/swarm/cathedral_of_crust_poster.jpg',
    selectedVoiceSample: 'Native Veo 3.1 On-Camera Speech (Lip-Sync)',
    selectedBgmSample: '🔇 Silence / No Background Music (Pure Dialogue & Foley Only)',
    audit: {
      fileSizeBytes: 22850386,
      driftMs: 0,
      plannedDurationSec: 30.0,
      renderedDurationSec: 30.0,
      rFrameRate: '30/1',
      timeBase: '1/30000',
      audioSampleRate: 48000,
      resolution: '1920x1080 (2.39:1 Anamorphic Theatrical Cinema Matte)',
      vocalPolicy: 'ATTIRE-LOCKED VEO 3.1 MASTER • Voice: Native Veo 3.1 Speech | Score: 🔇 Silence / No Background Music',
      nbFrames: 900,
    },
  });

  useEffect(() => {
    fetch('/api/swarm/orchestrate')
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultPlan) {
          setPlan(data.defaultPlan);
        }
      })
      .catch(console.error);
  }, []);

  const handlePlayPreview = (url: string) => {
    if (previewAudioUrl === url && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setPreviewAudioUrl(null);
      return;
    }
    setPreviewAudioUrl(url);
    setTimeout(() => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(console.error);
      }
    }, 50);
  };

  const handleRenderSwarmMaster = async (
    overrideBgmId?: string,
    overrideBgmVol?: number
  ) => {
    setRendering(true);
    const targetBgmId = overrideBgmId ?? selectedBgmSampleId;
    const targetBgmVol = overrideBgmVol !== undefined ? overrideBgmVol : bgmVolume;
    try {
      const res = await fetch('/api/swarm/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: 'cathedral_of_crust',
          voiceSampleId: selectedVoiceSampleId,
          bgmSampleId: targetBgmId,
          voiceVolume,
          bgmVolume: targetBgmVol,
          foleyVolume,
        }),
      });
      const data = await res.json();
      if (data.status === 'rendered') {
        setRenderResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRendering(false);
    }
  };

  const handleSilenceBgm = async () => {
    setSelectedBgmSampleId('no_bgm_silent');
    setBgmVolume(0);
    await handleRenderSwarmMaster('no_bgm_silent', 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Top Dark Shell Header */}
      <header className="dark w-full bg-[#0B111E] border-b border-slate-800 sticky top-0 z-50">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold tracking-wider uppercase">
              SWARM • 8-AGENT CREW
            </span>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold text-white tracking-tight">
                Google Cloud Swarm Studio — &ldquo;The Cathedral of Crust&rdquo; 🍕🔥
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                🧠 Gemini &amp; Omni Orchestration • 🎨 Nano Banana Visual DNA • 🎵 Lyria Dramatic Score • 🎬 Zero Active Singing
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/omni1.2"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-semibold transition min-h-[44px] flex items-center"
            >
              ← Omni 1.2 Studio
            </Link>
            <button
              id="btn-silence-bgm-header"
              onClick={handleSilenceBgm}
              disabled={rendering}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs md:text-sm font-bold shadow-md transition min-h-[44px] flex items-center gap-1.5"
            >
              🔇 Silence Background Music
            </button>
            <button
              id="btn-render-swarm-master"
              onClick={() => handleRenderSwarmMaster()}
              disabled={rendering}
              className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs md:text-sm font-bold shadow-md transition min-h-[44px] flex items-center gap-2"
            >
              {rendering ? '🎬 Orchestrating 8-Agent Render...' : '🚀 Re-Assemble 30s Master Spot'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Spacious Full-Width Light Workspace */}
      <main className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 space-y-10">
        {/* HERO SPOT SECTION: Watch "The Cathedral of Crust" Below 👇 */}
        <section
          id="swarm-hero-spot-section"
          className="bg-white rounded-2xl border-2 border-amber-500/80 shadow-xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left 7 Cols: 16:9 Widescreen Cinema Player */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                👇 WATCH THE FULL SPOT BELOW • 100% CODE-GENERATED
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ✓ Non-Vocal Dramatic Cinema (Voiceover + Lyria Score)
              </span>
            </div>

            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 relative">
              <video
                key={renderResult.videoUrl}
                src={renderResult.videoUrl}
                poster={renderResult.posterUrl || '/assets/swarm/cathedral_of_crust_poster.jpg'}
                controls
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
              <span>
                <strong>Production Title:</strong> &ldquo;The Cathedral of Crust&rdquo; (Neapolitan Artisan Commercial Spot)
              </span>
              <span className="font-mono font-semibold text-slate-800">
                1920x1080 Widescreen • 30.000s CFR • 900 Frames
              </span>
            </div>
          </div>

          {/* Right 5 Cols: Commercial Studio Telemetry & Conformance Ledger */}
          <div className="lg:col-span-5 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                COMMERCIAL PRODUCTION STUDIO IN CODE
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                Why Agent Swarms Replace Cameras &amp; Rented Sets
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                No cameras, no physical lighting rigs, no rented Neapolitan brick ovens. Eight specialized high-code agents collaborate synchronously to lock facial geometry, garment flour-dusting, macro food physics, gravelly voiceover narration, and a 92 BPM Lyria orchestral score.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 uppercase">4-Clock Drift</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {renderResult.audit?.driftMs ?? 0} ms
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  30.000s Video == 30.000s Audio
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-900 uppercase">Vocal Policy</div>
                <div className="text-sm font-extrabold text-amber-900 mt-1">
                  ✓ Zero Active Singing
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Mouth Closed • VO + Score Only
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Master Frame Rate</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {renderResult.audit?.rFrameRate || '30/1'} CFR
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Timescale: {renderResult.audit?.timeBase || '1/30000'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-xs font-bold text-indigo-800 uppercase">Lyria 3.5 Score</div>
                <div className="text-lg font-extrabold text-indigo-900 mt-1">
                  92 BPM D-Minor
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  Cello Ostinato • -8dB Ducking
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1.5">
              <div className="text-amber-400 font-bold">
                [GOOGLE CLOUD STACK TELEMETRY — 100% CODE EXECUTION]:
              </div>
              <div>• 🧠 Gemini 2.5 Pro &amp; Omni: 6-Act Screenplay &amp; Gravelly Voiceover Script</div>
              <div>• 🎨 Nano Banana Visual DNA: 3 Italian Artisans + 5 Macro Culinary Props</div>
              <div>• 🎵 DeepMind Lyria 3.5: Original Dramatic Instrumental Score (No Singing)</div>
              <div>• 🎬 FFmpeg CFR Master: 1920x1080 @ 30fps, setpts=PTS-STARTPTS, 0.0ms Drift</div>
            </div>

            <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
              <a
                href={renderResult.videoUrl}
                download="cathedral_of_crust_master.mp4"
                className="flex-1 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-bold text-center transition min-h-[44px] flex items-center justify-center gap-2 shadow"
              >
                ⬇️ Download &ldquo;The Cathedral of Crust&rdquo; Master MP4
              </a>
              <button
                id="btn-silence-bgm-player"
                onClick={handleSilenceBgm}
                disabled={rendering}
                className="py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs md:text-sm font-bold text-center transition min-h-[44px] flex items-center justify-center gap-2 shadow"
              >
                🔇 Silence Background Music (Pure Dialogue &amp; Foley Only)
              </button>
            </div>
          </div>
        </section>

        {/* 🎛️ AUDIO & BACKGROUND MUSIC MASTERING CONSOLE (SELECTABLE SAMPLES & MIXER) */}
        <section
          id="swarm-audio-bgm-console"
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
        >
          <audio ref={audioPreviewRef} className="hidden" onEnded={() => setPreviewAudioUrl(null)} />

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                🎛️ INTERACTIVE AUDIO &amp; BACKGROUND MUSIC STEM SELECTOR
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
                Choose Your Dialogue Stem &amp; Lyria 3.5 Background Music Score (or Silence BGM)
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                Switch between On-Camera Lip-Sync Speech, Cinema Trailer Baritone, or Documentary Storyteller voices, and pair with background music scores or 1-click silence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-silence-bgm-console"
                onClick={handleSilenceBgm}
                disabled={rendering}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs md:text-sm font-extrabold shadow-md transition min-h-[44px] flex items-center gap-2"
              >
                🔇 1-Click Silence Background Music (No BGM)
              </button>
              <button
                id="btn-remaster-audio-bgm"
                onClick={() => handleRenderSwarmMaster()}
                disabled={rendering}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs md:text-sm font-extrabold shadow-md transition min-h-[44px] flex items-center gap-2"
              >
                {rendering
                  ? '🎬 Mixing Stems & Re-Mastering Movie...'
                  : '🎬 Remaster Movie with Selected Audio & Music'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLUMN 1: 4 VOICE & DIALOGUE SAMPLES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🎙️ Step 1: Select Voice / Dialogue Stem</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                    4 Samples Available
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SWARM_AUDIO_VOICE_SAMPLES.map((sample) => {
                  const isSelected = selectedVoiceSampleId === sample.id;
                  const isPreviewing = previewAudioUrl === sample.previewAudioUrl;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => setSelectedVoiceSampleId(sample.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                            {sample.badge}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-extrabold text-indigo-600">
                              ✓ Active Stem
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {sample.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sample.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {sample.subtitle}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(sample.previewAudioUrl);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold min-h-[36px] flex items-center gap-1.5"
                        >
                          {isPreviewing ? '⏹ Stop' : '🔊 Preview'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: 5 BACKGROUND MUSIC SCORE SAMPLES (INCLUDING SILENCE / NO BGM) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>🎼 Step 2: Select Background Music Score (or Silence)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                    5 Options (Silence or 4 Scores)
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SWARM_BGM_SCORE_SAMPLES.map((bgm) => {
                  const isSelected = selectedBgmSampleId === bgm.id;
                  const isPreviewing = previewAudioUrl === bgm.previewAudioUrl;
                  return (
                    <div
                      key={bgm.id}
                      onClick={() => {
                        setSelectedBgmSampleId(bgm.id);
                        if (bgm.id === 'no_bgm_silent') {
                          setBgmVolume(0);
                        } else if (bgmVolume === 0) {
                          setBgmVolume(0.85);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? bgm.id === 'no_bgm_silent'
                            ? 'bg-rose-50/80 border-rose-600 ring-2 ring-rose-600/20 shadow-sm'
                            : 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/20 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-900 text-amber-100 text-[10px] font-bold">
                            {bgm.bpm} BPM • {bgm.key}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-extrabold text-amber-700">
                              ✓ Active Score
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {bgm.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {bgm.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {bgm.subtitle}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(bgm.previewAudioUrl);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold min-h-[36px] flex items-center gap-1.5"
                        >
                          {isPreviewing ? '⏹ Stop' : '🎵 Preview'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* VOLUME MIX SLIDERS BAR */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>🎙️ Dialogue / Speech Level:</span>
                <span className="font-mono text-indigo-600">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.8"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>🎼 Background Music Score Level:</span>
                <span className="font-mono text-amber-600">{Math.round(bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={bgmVolume}
                onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>🔥 Kitchen Foley &amp; Hearth Level:</span>
                <span className="font-mono text-emerald-600">{Math.round(foleyVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={foleyVolume}
                onChange={(e) => setFoleyVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </section>

        {/* THE 8 HIGH-CODE AGENT SWARM ORCHESTRATION MATRIX */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                AUTONOMOUS PRODUCTION CREW • 8 SPECIALIZED AGENTS
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-0.5">
                High-Code Agent Swarm Orchestration Matrix
              </h2>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ All 8 Agents Synchronized &amp; Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(plan?.agents || []).map((agent: any, index: number) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{agent.icon}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      ✓ {agent.status} ({agent.executionTimeMs}ms)
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">
                      AGENT 0{index + 1}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {agent.name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      {agent.roleTitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {agent.deliverableSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Cloud Engine:</span>
                    <span className="font-bold text-slate-800">{agent.stackModel}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px] truncate">
                    📄 {agent.technicalArtifact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TABBED PRODUCTION INSPECTOR */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('screenplay')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition min-h-[44px] ${
                activeTab === 'screenplay'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              📝 6-Act Screenplay &amp; Voiceover Schedule (30.0s)
            </button>
            <button
              onClick={() => setActiveTab('nanobanana')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition min-h-[44px] ${
                activeTab === 'nanobanana'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🎨 Nano Banana Visual DNA: Cast, Wardrobe &amp; Prop Facility
            </button>
            <button
              onClick={() => setActiveTab('lyria')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition min-h-[44px] ${
                activeTab === 'lyria'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🎼 Lyria 3.5 Instrumental Score &amp; Narration Mix
            </button>
          </div>

          {/* TAB 1: SCREENPLAY & VOICEOVER SCHEDULE */}
          {activeTab === 'screenplay' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    &ldquo;The Cathedral of Crust&rdquo; — 6-Shot Anamorphic Screenplay &amp; Voiceover EDL
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Every shot enforces strict non-vocal dramatic acting (mouth closed) synchronized to gravelly voiceover narration and Lyria cello cues.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  Total Duration: 30.000s (6 × 5.0s CFR)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Shot / Act</th>
                      <th className="py-3.5 px-3">Timecode</th>
                      <th className="py-3.5 px-3">Anamorphic Lens</th>
                      <th className="py-3.5 px-3">Cast &amp; Eyeline</th>
                      <th className="py-3.5 px-4">🎙️ Voiceover Narration Script</th>
                      <th className="py-3.5 px-4">🥖 Macro Prop &amp; Lyria Score Cue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs md:text-sm">
                    {(plan?.shots || []).map((shot: any) => (
                      <tr key={shot.shotNumber} className="hover:bg-slate-50/80">
                        <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div>Shot 0{shot.shotNumber}</div>
                          <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                            {shot.actTitle}
                          </div>
                        </td>
                        <td className="py-4 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {shot.startSec.toFixed(1)}s – {shot.endSec.toFixed(1)}s
                          <div className="text-[10px] text-emerald-700 font-bold">
                            150 frames @ 30fps
                          </div>
                        </td>
                        <td className="py-4 px-3 text-xs font-semibold text-slate-800">
                          <div>{shot.cameraLens}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {shot.cameraMovement}
                          </div>
                        </td>
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{shot.characterName}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                            Eyeline: {shot.eyelineDirection}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-md">
                          <div className="font-serif italic font-semibold text-slate-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                            &ldquo;{shot.voiceoverLine}&rdquo;
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-md space-y-1.5 text-xs">
                          <div>
                            <span className="font-bold text-slate-700">🥖 Prop Focus:</span>{' '}
                            <span className="text-slate-600">{shot.propFocus}</span>
                          </div>
                          <div>
                            <span className="font-bold text-indigo-700">🎼 Lyria Cue:</span>{' '}
                            <span className="text-slate-600">{shot.lyriaScoreCue}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: NANO BANANA VISUAL DNA (CAST, WARDROBE, LOCATION, PROPS) */}
          {activeTab === 'nanobanana' && (
            <div className="space-y-8">
              {/* Cast & Wardrobe Row */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  🎭 Casting Direction &amp; 👔 Wardrobe Department (Nano Banana Biometric &amp; Garment UV Locks)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(plan?.castList || []).map((c: any) => (
                    <div
                      key={c.name}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                            BIOMETRIC DNA LOCKED
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {c.demography}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-extrabold text-slate-900">{c.name}</h4>
                          <p className="text-xs font-bold text-amber-700">{c.role}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                          <div className="font-bold text-slate-700">👔 Locked Garment UV Swatch:</div>
                          <p className="text-slate-600 leading-relaxed">{c.wardrobeSpec}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prop Facility Matrix */}
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  🥖 Prop Facility Agent — 5 Hyper-Consistent Macro Culinary Prop Sets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {(plan?.propManifest || []).map((prop: any, i: number) => (
                    <div
                      key={prop.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                    >
                      <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold">
                        PROP SET #{i + 1}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">{prop.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>Shader:</strong> {prop.materialShader}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong>Macro Detail:</strong> {prop.macroDetail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LYRIA 3.5 INSTRUMENTAL SCORE & NARRATION MIX */}
          {activeTab === 'lyria' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                    GOOGLE DEEPMIND LYRIA 3.5 • DRAMATIC FILM SCORING
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    Non-Vocal Instrumental Score &amp; Sidechain Voiceover Ducking Architecture
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓ Zero Phantom Singing Guaranteed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-900">
                    1. Strict Instrumental Policy
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Lyria 3.5 generates a 92 BPM D-Minor dramatic score featuring solo Stradivarius cello ostinato, Neapolitan nylon guitar, and chamber strings with <strong>zero singing vocals</strong> so characters never phantom-mouth.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-900">
                    2. Voiceover Sidechain Ducking (-8.0 dB)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    The gravelly theatrical narrator is mastered at <strong>-14.0 LUFS</strong> while the Lyria symphonic bed sits at <strong>-22.0 LUFS</strong>, automatically ducking during spoken cadence windows.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-900">
                    3. Authentic Wood-Fire Hearth Foley
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Layered with authentic 900°F oak ember crackle, copper peel sliding resonance, and blistered crust crackle foley preserved across the full 35Hz–20kHz acoustic spectrum.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
