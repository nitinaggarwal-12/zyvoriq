"use client";

import React, { useState, useEffect } from "react";
import ReelTimelineEditor, { SavedVersionItem } from "./ReelTimelineEditor";

export interface DirectorVersion {
  id: string;
  label: string;
  videoUrl: string;
  createdAt: string;
  durationSec: number;
}

export interface DirectorReelData {
  id: string;
  title: string;
  subtitle?: string;
  prompt?: string;
  videoUrl: string | null;
  posterUrl?: string | null;
  durationSec: number;
  aspectRatio?: string;
  genre?: string;
  tone?: string;
  audioClock?: string;
  shots?: Array<{
    id: string;
    order: number;
    title: string;
    videoUrl: string | null;
    posterUrl?: string | null;
    durationSec: number;
    scriptText?: string | null;
    visualIntent?: string | null;
    camera?: string;
    lighting?: string;
    character?: string;
    environment?: string;
  }>;
  manifest?: any;
}

interface WorldClassDirectorSuiteProps {
  reel: DirectorReelData;
  onBack: () => void;
  onDirectPart2?: () => void;
}

const CASTING_PRESETS = [
  {
    id: "punjabi_diva",
    name: "Simran Kaur — 21yo Punjabi College Fashion Diva",
    ethnicity: "North Indian / Punjabi Supermodel",
    styling: "Sleek jet-black waist-length hair, glowing golden skin, kohl-rimmed expressive eyes",
    gender: "Female",
  },
  {
    id: "spanish_model",
    name: "Elena Vance — Spanish Mediterranean Runway Model",
    ethnicity: "Spanish / Mediterranean",
    styling: "Sun-kissed bronze complexion, wavy chestnut hair, high-fashion editorial cheekbones",
    gender: "Female",
  },
  {
    id: "tokyo_cyber",
    name: "Airi Sato — Tokyo Shibuya Mode Lead",
    ethnicity: "Japanese / East Asian",
    styling: "Sharp bob cut with electric cyan highlights, luminous glass skin, futuristic visor",
    gender: "Female",
  },
  {
    id: "bollywood_royal",
    name: "Priya Sharma — Royal Kathak & Cinema Lead",
    ethnicity: "Indian / Classical",
    styling: "Ornate maang tikka, intricate bridal/royal jewelry, expressive classical dancer grace",
    gender: "Female",
  },
];

const WARDROBE_PRESETS = [
  {
    id: "summer_pool_swimwear",
    label: "🩱 Summer Poolside Designer Swimwear & Silk Sarong",
    description: "Turquoise & gold metallic designer bikini swimsuit with sheer flowing silk poolside sarong and gold body chain",
  },
  {
    id: "chandigarh_club_glam",
    label: "✨ Chandigarh Club Sequined Mini Skirt & Velvet Crop Top",
    description: "Holographic silver sequined mini skirt, emerald velvet crop top, statement chandelier earrings, high heels",
  },
  {
    id: "haute_couture_gown",
    label: "👗 Milan Haute Couture Emerald Silk Evening Gown",
    description: "Floor-length draped emerald satin haute couture gown with architectural shoulder silhouette",
  },
  {
    id: "cyberpunk_neon_jacket",
    label: "⚡ Neo-Tokyo Cyberpunk LED Leather Jacket & Techwear",
    description: "Matte black cropped cyber-leather jacket with illuminated cyan EL-wire trim and cargo streetwear",
  },
  {
    id: "royal_lehenga",
    label: "👑 Royal Zari Embroidered Crimson Banarasi Lehenga",
    description: "Handwoven crimson and gold zari embroidered lehenga choli with sheer organza dupatta",
  },
];

const LOCATION_PRESETS = [
  {
    id: "spain_infinity_pool",
    environment: "Sun-drenched Ibiza Cliffside Infinity Pool Villa overlooking turquoise Mediterranean sea",
    lighting: "High-noon sparkling water reflections + warm golden sun flare",
    cameraLens: "35mm Anamorphic Prime, F/2.0 shallow depth of field",
    colorGrading: "mediterranean_sunlit" as const,
  },
  {
    id: "chandigarh_stage",
    environment: "Top Chandigarh College Festival Mainstage with concert LED walls and atmospheric haze",
    lighting: "Concert stage spotlights, warm amber backlights, volumetric lasers",
    cameraLens: "50mm Cooke S4 Cinema Lens, dynamic low-angle tracking",
    colorGrading: "golden_hour_warm" as const,
  },
  {
    id: "shinjuku_rooftop",
    environment: "Rain-slicked Shinjuku Skyscraper Rooftop Terrace surrounded by towering holographic billboards",
    lighting: "Neon cyan & magenta wet pavement reflections under midnight rain",
    cameraLens: "24mm Anamorphic Wide, continuous orbital Steadicam",
    colorGrading: "cyberpunk_neon" as const,
  },
  {
    id: "royal_courtyard",
    environment: "Udaipur White Makrana Marble Palace Courtyard with rose-petal lotus fountains",
    lighting: "Golden afternoon sunlight reflecting off marble arches",
    cameraLens: "35mm Leica Summilux, sweeping crane push-in",
    colorGrading: "bollywood_royal" as const,
  },
];

export default function WorldClassDirectorSuite({
  reel,
  onBack,
  onDirectPart2,
}: WorldClassDirectorSuiteProps) {
  const [activeTab, setActiveTab] = useState<
    "direction" | "lyria" | "dialogue" | "choreography" | "sfx" | "nle"
  >("direction");

  // Video playback state
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
    reel.videoUrl || `/renders/yt/${reel.id}/master_hybrid.mp4`
  );
  const [activeShotIdx, setActiveShotIdx] = useState<number>(0);

  // Versions list
  const initialVersions: DirectorVersion[] = [
    {
      id: "v1_original",
      label: "v1 • Original Master (24.0s)",
      videoUrl: reel.videoUrl || `/renders/yt/${reel.id}/master_hybrid.mp4`,
      createdAt: new Date().toISOString(),
      durationSec: reel.durationSec || 24,
    },
    ...(Array.isArray(reel.manifest?.versions) ? reel.manifest.versions : []),
  ];
  const [versions, setVersions] = useState<DirectorVersion[]>(initialVersions);
  const [activeVersionId, setActiveVersionId] = useState<string>("v1_original");

  // Directorial DNA State
  const [characterName, setCharacterName] = useState<string>(
    reel.shots?.[0]?.character || "Simran Kaur — 21yo Punjabi College Fashion Diva"
  );
  const [characterEthnicity, setCharacterEthnicity] = useState<string>("North Indian / Punjabi Supermodel");
  const [characterStyling, setCharacterStyling] = useState<string>(
    "Sleek waist-length dark hair, luminous golden skin, expressive kohl-rimmed eyes"
  );
  const [characterGender, setCharacterGender] = useState<string>("Female");

  // Wardrobe State
  const [wardrobePreset, setWardrobePreset] = useState<string>("summer_pool_swimwear");
  const [wardrobeDescription, setWardrobeDescription] = useState<string>(
    reel.id.includes("spain") || reel.prompt?.toLowerCase().includes("pool")
      ? WARDROBE_PRESETS[0].description
      : WARDROBE_PRESETS[1].description
  );

  // Location & Color Grading State
  const [locationEnv, setLocationEnv] = useState<string>(
    reel.shots?.[0]?.environment || reel.prompt || "Sun-drenched Ibiza Cliffside Infinity Pool Villa"
  );
  const [locationLighting, setLocationLighting] = useState<string>(
    reel.shots?.[0]?.lighting || "Sparkling sunlight & golden hour rim lighting"
  );
  const [cameraLens, setCameraLens] = useState<string>(
    reel.shots?.[0]?.camera || "35mm Anamorphic Prime, F/2.0"
  );
  const [colorGrading, setColorGrading] = useState<
    "none" | "cyberpunk_neon" | "golden_hour_warm" | "mediterranean_sunlit" | "bollywood_royal" | "vintage_film"
  >("none");

  // Lyria 3.5 Music & Lyrics State
  const defaultLyrics =
    (reel.shots || [])
      .map((s, i) => s.scriptText || `Shot ${i + 1}: Golden summer vibes shining under the neon sky`)
      .join("\n") ||
    "Sun-drenched terrace, rhythm in the air\nGolden summer magic, dancing without a care\nSplash of crystal water underneath the Spanish sun\nTurn the music louder, the party has just begun";
  const [lyricsText, setLyricsText] = useState<string>(defaultLyrics);
  const [tempoBpm, setTempoBpm] = useState<number>(122);
  const [musicTrackUrl, setMusicTrackUrl] = useState<string>(
    `/renders/yt/${reel.id}/song.mp3`
  );
  const [musicVolume, setMusicVolume] = useState<number>(1.0);
  const [musicSpeed, setMusicSpeed] = useState<number>(1.0);

  // Dialogue & Voice State
  const [vocalTimbre, setVocalTimbre] = useState<string>("Soprano Pop Female Lead (Lyria + Demucs Locked)");
  const [vocalVolume, setVocalVolume] = useState<number>(1.0);
  const [vocalSpeed, setVocalSpeed] = useState<number>(1.0);

  // Choreography & Dance State
  const [danceStyle, setDanceStyle] = useState<string>(
    "High-energy synchronized summer dance choreography with expressive eye contact and fluid turns"
  );
  const [cameraMotion, setCameraMotion] = useState<string>(
    "Continuous 360 orbital Steadicam tracking shot with beat-locked whip cuts"
  );

  // Background SFX & Foley State
  const [sfxPreset, setSfxPreset] = useState<string>(
    reel.id.includes("spain") || reel.prompt?.toLowerCase().includes("pool") ? "pool_splash" : "crowd_cheer"
  );
  const [sfxVolume, setSfxVolume] = useState<number>(0.45);
  const [sfxSpeed, setSfxSpeed] = useState<number>(1.0);

  // Re-Generation Execution State
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Convert shots for Studio NLE tab
  const nleShots = (reel.shots && reel.shots.length > 0
    ? reel.shots
    : [1, 2, 3, 4].map((n) => ({
        id: `shot_${n}`,
        order: n,
        title: `Shot 0${n}`,
        videoUrl: `/renders/yt/${reel.id}/shot_${n}.mp4`,
        durationSec: 6.0,
        scriptText: `Shot 0${n} Beat Performance`,
        visualIntent: `Shot 0${n} Beat Performance`,
      }))
  ).map((s: any, idx: number) => ({
    id: s.id || `shot_${idx + 1}`,
    index: idx + 1,
    title: s.title || `Shot 0${idx + 1}`,
    lyric: s.scriptText || s.visualIntent || `Beat Segment ${idx + 1}`,
    videoUrl: s.videoUrl || `/renders/yt/${reel.id}/shot_${idx + 1}.mp4`,
    durationSec: Number(s.durationSec || 6),
    originalDurationSec: Number(s.durationSec || 6),
  }));

  const handleTriggerRegenerate = async (mode: "instant_remaster" | "full_ai_pipeline") => {
    setIsRegenerating(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const nextVerNum = versions.length + 1;
      const versionLabel =
        mode === "instant_remaster"
          ? `v${nextVerNum} • Director Cut (${colorGrading !== "none" ? colorGrading.replace(/_/g, " ") : "Custom Mix"})`
          : `v${nextVerNum} • Full AI Re-Production`;

      const res = await fetch("/api/reels/director/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reelId: reel.id,
          sourceVideoUrl: currentVideoUrl,
          versionLabel,
          mode,
          direction: {
            character: {
              name: characterName,
              ethnicity: characterEthnicity,
              styling: characterStyling,
              gender: characterGender,
            },
            wardrobe: {
              preset: wardrobePreset,
              description: wardrobeDescription,
            },
            location: {
              environment: locationEnv,
              lighting: locationLighting,
              cameraLens,
              colorGrading,
            },
            lyrics: {
              text: lyricsText,
              tempoBpm,
            },
            dialogue: {
              vocalTimbre,
              vocalVolume,
              vocalSpeed,
            },
            choreography: {
              danceStyle,
              cameraMotion,
            },
            audio: {
              musicTrackUrl,
              musicVolume,
              musicSpeed,
              sfxPreset,
              sfxVolume,
              sfxSpeed,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to execute Director re-generation");
      }

      if (mode === "instant_remaster" && data.version) {
        const newVer: DirectorVersion = data.version;
        setVersions((prev) => [...prev, newVer]);
        setActiveVersionId(newVer.id);
        setCurrentVideoUrl(`${newVer.videoUrl}?t=${Date.now()}`);
        setStatusMessage(data.message || `✓ Saved new version "${newVer.label}"!`);
      } else if (mode === "full_ai_pipeline" && data.newProductionId) {
        setStatusMessage(
          `🚀 Launched Full AI Re-Production Pipeline! New Reel ID: ${data.newProductionId}. Redirecting to live pipeline monitor...`
        );
        setTimeout(() => {
          window.location.href = `/yt?reel=${data.newProductionId}`;
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Regeneration failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-slate-100 pb-24">
      {/* Sticky Full-Width Top Director Header Bar */}
      <div className="sticky top-0 z-40 w-full bg-[#0B101D]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Back button + Title + Full Reel ID */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>←</span> Back to Library
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/40 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Omni 1.1 Director Suite
                </span>
                <h1 className="text-lg md:text-xl font-black text-white truncate max-w-xl">
                  {reel.title}
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reel.id);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  className="font-mono text-[11px] text-amber-300/90 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded flex items-center gap-1.5 cursor-pointer"
                  title="Click to copy full untruncated Reel ID"
                >
                  <span>ID: {reel.id}</span>
                  <span>{copiedId ? "✓ Copied" : "📋"}</span>
                </button>
                <span>•</span>
                <span>{reel.durationSec || 24}s Master</span>
                <span>•</span>
                <span>{reel.aspectRatio || "9:16 Vertical"}</span>
              </div>
            </div>
          </div>

          {/* Right: 1-Click Regenerate & Export Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleTriggerRegenerate("instant_remaster")}
              disabled={isRegenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isRegenerating ? (
                <>
                  <span className="animate-spin">⏳</span> Rendering Director Cut...
                </>
              ) : (
                <>
                  <span>🔄</span> Regenerate & Save New Version (v{versions.length + 1})
                </>
              )}
            </button>

            <button
              onClick={() => handleTriggerRegenerate("full_ai_pipeline")}
              disabled={isRegenerating}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              title="Launch a brand-new Google Omni 1.1 + Veo 3.1 + Lyria 3.5 AI generation pipeline using your customized Character, Wardrobe, Location & Lyrics"
            >
              <span>🚀</span> Full AI Re-Generate (New Pipeline)
            </button>

            {onDirectPart2 && (
              <button
                onClick={onDirectPart2}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✨</span> Direct Part 2
              </button>
            )}

            <a
              href={currentVideoUrl}
              download={`${reel.id}_master.mp4`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span>⬇️</span> Download MP4
            </a>
          </div>
        </div>
      </div>

      {/* Status & Error Notifications */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-5">
        {statusMessage && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">✨</span>
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-sm font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main 12-Column Ultra-Wide Studio Workspace */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (5 Cols): Master Cinema Monitor, Versions Switcher & Storyboard */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Master Video Monitor Card */}
          <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Live Master Monitor
              </span>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 border border-teal-500/30 px-2.5 py-0.5 rounded-md">
                {versions.find((v) => v.id === activeVersionId)?.label || "v1 • Original Master"}
              </span>
            </div>

            {/* Video Canvas Container */}
            <div className="relative w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center aspect-[9/16] max-h-[620px] mx-auto">
              <video
                key={currentVideoUrl}
                src={currentVideoUrl}
                poster={reel.posterUrl || undefined}
                controls
                playsInline
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            </div>

            {/* Saved Versions Switcher Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Saved Versions History ({versions.length})
                </span>
                <span className="text-[10px] text-slate-500">Non-destructive versioning</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {versions.map((ver) => {
                  const active = ver.id === activeVersionId;
                  return (
                    <button
                      key={ver.id}
                      onClick={() => {
                        setActiveVersionId(ver.id);
                        setCurrentVideoUrl(ver.videoUrl);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/70"
                      }`}
                    >
                      <span>{active ? "●" : "○"}</span>
                      <span>{ver.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Shot-by-Shot Storyboard Filmstrip */}
          <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                🎞️ Shot-by-Shot Storyboard ({nleShots.length} Shots)
              </span>
              <span className="text-[11px] text-slate-400">
                Click any shot to inspect or preview
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {nleShots.map((shot, idx) => {
                const isSelected = idx === activeShotIdx;
                return (
                  <button
                    key={shot.id}
                    onClick={() => {
                      setActiveShotIdx(idx);
                      if (shot.videoUrl) setCurrentVideoUrl(shot.videoUrl);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-500/15 border-teal-500/80 ring-1 ring-teal-500/50"
                        : "bg-slate-900/70 hover:bg-slate-900 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-teal-400 mb-1">
                      <span>SHOT 0{idx + 1}</span>
                      <span>{shot.originalDurationSec}s</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {shot.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {shot.lyric}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between">
              <button
                onClick={() => {
                  const orig = versions.find((v) => v.id === activeVersionId);
                  if (orig) setCurrentVideoUrl(orig.videoUrl);
                }}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer"
              >
                ▶ Return to Full Combined Master ({reel.durationSec || 24}s)
              </button>
              <span className="text-[11px] text-slate-500">
                Tail-frame PSNR &lt; 25dB Locked
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): World-Class Director Customization Studio */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 6-Tab Navigation Switcher */}
          <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-2 flex flex-wrap gap-1.5">
            {[
              { id: "direction", label: "🎬 1. Cast, Wardrobe & Location" },
              { id: "lyria", label: "🎼 2. Lyria 3.5 Music & Lyrics" },
              { id: "dialogue", label: "🎙️ 3. Dialogue & Voice" },
              { id: "choreography", label: "💃 4. Dance & Camera Motion" },
              { id: "sfx", label: "🔊 5. Background SFX & Foley" },
              { id: "nle", label: "✂️ 6. Multi-Track NLE Frame Editor" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex-1 min-w-[160px] text-center ${
                    active
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-900/70 hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CAST, WARDROBE & LOCATION (DIRECTORIAL DNA) */}
          {activeTab === "direction" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-6 flex flex-col gap-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🎭</span> Character Casting, Wardrobe & Environmental Set Direction
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize biometric lead casting, scene-grounded wardrobe, architectural location, and color grading LUTs.
                </p>
              </div>

              {/* Section A: Character Casting & Biometrics */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
                    👤 Lead Artist Biometric Casting
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CASTING_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setCharacterName(preset.name);
                          setCharacterEthnicity(preset.ethnicity);
                          setCharacterStyling(preset.styling);
                          setCharacterGender(preset.gender);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-teal-500/20 hover:border-teal-500/40 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-all cursor-pointer"
                      >
                        {preset.name.split("—")[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Lead Artist / Character Name & Persona
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Ethnicity & Facial Biometrics
                    </label>
                    <input
                      type="text"
                      value={characterEthnicity}
                      onChange={(e) => setCharacterEthnicity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Hair, Makeup & Biometric Continuity Styling
                  </label>
                  <input
                    type="text"
                    value={characterStyling}
                    onChange={(e) => setCharacterStyling(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section B: Wardrobe & Styling Editor */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  👗 Scene-Context Wardrobe & Costume Design
                </span>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Wardrobe Preset
                  </label>
                  <select
                    value={wardrobePreset}
                    onChange={(e) => {
                      setWardrobePreset(e.target.value);
                      const found = WARDROBE_PRESETS.find((w) => w.id === e.target.value);
                      if (found) setWardrobeDescription(found.description);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                  >
                    {WARDROBE_PRESETS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Detailed Costume / Fabric / Accessories Specification
                  </label>
                  <textarea
                    rows={2}
                    value={wardrobeDescription}
                    onChange={(e) => setWardrobeDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section C: Location, Lighting & Color Grading LUT */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                    🏛️ Set Location, Optics & Color Grading LUT
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {LOCATION_PRESETS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setLocationEnv(loc.environment);
                          setLocationLighting(loc.lighting);
                          setCameraLens(loc.cameraLens);
                          setColorGrading(loc.colorGrading);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-500/20 border border-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
                      >
                        {loc.id.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Environment & Architectural Set Description
                  </label>
                  <input
                    type="text"
                    value={locationEnv}
                    onChange={(e) => setLocationEnv(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Cinema Lighting & Atmosphere
                    </label>
                    <input
                      type="text"
                      value={locationLighting}
                      onChange={(e) => setLocationLighting(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Master Color Grading LUT (Instant FFmpeg Look)
                    </label>
                    <select
                      value={colorGrading}
                      onChange={(e) => setColorGrading(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-teal-400 focus:outline-none"
                    >
                      <option value="none">Original True-Color Master (No LUT)</option>
                      <option value="mediterranean_sunlit">☀️ Mediterranean Sunlit Vivid (Warm Turquoise/Gold)</option>
                      <option value="golden_hour_warm">🌅 Golden Hour 3200K Warm Sunset</option>
                      <option value="cyberpunk_neon">⚡ Cyberpunk Neon Cyan & Magenta Contrast</option>
                      <option value="bollywood_royal">👑 Royal Bollywood Festive Saturation</option>
                      <option value="vintage_film">🎞️ 35mm Kodak 2383 Vintage Film Print</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => handleTriggerRegenerate("instant_remaster")}
                  disabled={isRegenerating}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isRegenerating ? "⏳ Rendering New Director Version..." : "✓ Apply Look & Audio Mix to New Version (Instant ~3s)"}
                </button>
                <button
                  onClick={() => handleTriggerRegenerate("full_ai_pipeline")}
                  disabled={isRegenerating}
                  className="py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  🚀 Re-Generate Full Video via AI Pipeline
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LYRIA 3.5 MUSIC, SONG & LYRICS STUDIO */}
          {activeTab === "lyria" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-6 flex flex-col gap-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🎼</span> Google DeepMind Lyria 3.5 Soundtrack & Lyrics Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect or swap the continuous master soundtrack (`song.mp3`), edit beat-synchronized song lyrics, and adjust musical tempo.
                </p>
              </div>

              {/* Original Lyria Audio Player Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
                    🎵 Isolated Master Soundtrack Stem (Lyria 3.5 Polyphonic Stereo)
                  </span>
                  <a
                    href={musicTrackUrl}
                    download={`${reel.id}_song.mp3`}
                    className="text-xs font-bold text-teal-300 hover:text-white bg-teal-500/15 border border-teal-500/30 px-3 py-1 rounded-lg"
                  >
                    ⬇️ Download MP3 Stem
                  </a>
                </div>
                <audio controls src={musicTrackUrl} className="w-full h-10 mt-1" />
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Measured Tempo</div>
                    <div className="text-sm font-black text-white mt-0.5">{tempoBpm} BPM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Integrated Loudness</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">-14.0 LUFS</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sub-Bass Spectrum</div>
                    <div className="text-sm font-black text-teal-300 mt-0.5">35Hz – 20kHz Intact</div>
                  </div>
                </div>
              </div>

              {/* Swap or Re-Balance Music Bed */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Master Music Bed Track
                  </label>
                  <select
                    value={musicTrackUrl}
                    onChange={(e) => setMusicTrackUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    <option value={`/renders/yt/${reel.id}/song.mp3`}>Original Lyria 3.5 Master Soundtrack</option>
                    <option value="/renders/yt/yt_spain_pool_party_omni_hybrid/song.mp3">Ibiza Pool Party Synth-Pop (122 BPM)</option>
                    <option value="/renders/yt/yt_chandigarh_club_omni_hybrid/song.mp3">Chandigarh Club Dhol & Pop Groove (126 BPM)</option>
                    <option value="/renders/yt/yt_summer_roadtrip_omni_hybrid/song.mp3">Sunset Coastal Deep House (118 BPM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Music Tempo Speed ({musicSpeed.toFixed(2)}x) & Gain ({Math.round(musicVolume * 100)}%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      value={musicSpeed}
                      onChange={(e) => setMusicSpeed(parseFloat(e.target.value))}
                      className="flex-1 accent-teal-400"
                    />
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="flex-1 accent-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Song Lyrics Editor */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  📝 Beat-Synced Song Lyrics & Vocal Phrasing Editor
                </label>
                <textarea
                  rows={5}
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:border-teal-400 focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleTriggerRegenerate("instant_remaster")}
                disabled={isRegenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                ✓ Render New Version with Updated Music & Tempo Mix
              </button>
            </div>
          )}

          {/* TAB 3: DIALOGUE, VOICE & LIP-SYNC STUDIO */}
          {activeTab === "dialogue" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-6 flex flex-col gap-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🎙️</span> Vocal Timbre, Dialogue Gain Staging & Lip-Sync Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Control lead vocal stem gain, pitch-preserved singing/dialogue speed (`0.25x - 4.0x`), and phonetic viseme alignment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Vocal Artist Timbre & Performance Mode
                  </label>
                  <select
                    value={vocalTimbre}
                    onChange={(e) => setVocalTimbre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    <option value="Soprano Pop Female Lead">Soprano Pop Female Lead (Native + Lyria Locked)</option>
                    <option value="Husky Punjabi Female Lead">Husky Punjabi Female Lead (Stage Performance)</option>
                    <option value="Duet Male + Female Chorus">Duet Male Rap + Female Chorus Lead</option>
                    <option value="Instrumental Dance Only">Pure Instrumental Dance (Mute Vocals / Mouth Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Vocal Stem Volume ({Math.round(vocalVolume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={vocalVolume}
                    onChange={(e) => setVocalVolume(parseFloat(e.target.value))}
                    className="w-full accent-teal-400 mt-2"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Independent Dialogue / Singing Playback Speed ({vocalSpeed.toFixed(2)}x Pitch-Preserved `atempo`)
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={vocalSpeed}
                  onChange={(e) => setVocalSpeed(parseFloat(e.target.value))}
                  className="w-full accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0.50x Slow-Mo Vocal</span>
                  <span>1.00x Original Sync</span>
                  <span>2.00x Double Speed</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerRegenerate("instant_remaster")}
                disabled={isRegenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                ✓ Render New Version with Updated Vocal & Dialogue Settings
              </button>
            </div>
          )}

          {/* TAB 4: CHOREOGRAPHY, DANCE & CAMERA MOTION */}
          {activeTab === "choreography" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-6 flex flex-col gap-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>💃</span> Choreography, Dance Movement & Camera Vectors
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Direct character dance choreography, fashion runway pacing, and continuous camera motion vectors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Dance & Movement Choreography Direction
                  </label>
                  <textarea
                    rows={3}
                    value={danceStyle}
                    onChange={(e) => setDanceStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Camera Motion Vectors & Lens Tracking
                  </label>
                  <textarea
                    rows={2}
                    value={cameraMotion}
                    onChange={(e) => setCameraMotion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => handleTriggerRegenerate("full_ai_pipeline")}
                disabled={isRegenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                🚀 Re-Generate Video with New Choreography & Camera Vectors
              </button>
            </div>
          )}

          {/* TAB 5: BACKGROUND SOUND EFFECTS (SFX) & FOLEY MIXER */}
          {activeTab === "sfx" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-6 flex flex-col gap-6 shadow-xl">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🔊</span> Background Sound Effects (SFX) & Ambient Foley Layer
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Layer real stereo ambient foley underneath your music video and adjust SFX volume independently.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Stereo Ambient SFX Preset
                  </label>
                  <select
                    value={sfxPreset}
                    onChange={(e) => setSfxPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    <option value="none">No Additional Ambient SFX</option>
                    <option value="pool_splash">💦 Pool Party Water Splashes & Summer Laughs</option>
                    <option value="crowd_cheer">🎉 Concert & Nightclub Crowd Cheer</option>
                    <option value="ocean_waves">🌊 Coastal Ocean Breeze & Gentle Waves</option>
                    <option value="vinyl_rain">🌧️ Midnight Vinyl Crackle & Neon Rain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Ambient SFX Gain ({Math.round(sfxVolume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1.0}
                    step={0.05}
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className="w-full accent-teal-400 mt-2"
                  />
                </div>
              </div>

              <button
                onClick={() => handleTriggerRegenerate("instant_remaster")}
                disabled={isRegenerating}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                ✓ Mix Ambient Foley & Save New Version (v{versions.length + 1})
              </button>
            </div>
          )}

          {/* TAB 6: MULTI-TRACK NON-LINEAR VIDEO & FRAME EDITOR (STUDIO NLE) */}
          {activeTab === "nle" && (
            <div className="rounded-2xl bg-[#0D1322] border border-slate-800/90 p-4 shadow-xl">
              <ReelTimelineEditor
                reelId={reel.id}
                reelTitle={reel.title}
                masterVideoUrl={currentVideoUrl}
                initialShots={nleShots}
                initialVersions={versions.map((v, i) => ({
                  versionNumber: i + 1,
                  label: v.label,
                  url: v.videoUrl,
                  durationSec: v.durationSec,
                  createdAt: v.createdAt,
                }))}
                onVersionSaved={(newVer: SavedVersionItem) => {
                  const dirVer: DirectorVersion = {
                    id: `v_${newVer.versionNumber}_${Date.now()}`,
                    label: newVer.label,
                    videoUrl: newVer.url,
                    createdAt: newVer.createdAt || new Date().toISOString(),
                    durationSec: newVer.durationSec,
                  };
                  setVersions((prev) => [...prev, dirVer]);
                  setActiveVersionId(dirVer.id);
                  setCurrentVideoUrl(`${dirVer.videoUrl}?t=${Date.now()}`);
                  setStatusMessage(`✓ Studio NLE rendered and saved "${newVer.label}"!`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
