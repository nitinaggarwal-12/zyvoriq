"use client";

import React, { useState } from "react";
import type { DeepResearchProductionBible } from "@/lib/swarm/deepResearchBible";
import {
  ShieldCheck,
  FileText,
  Users,
  Clapperboard,
  Sparkles,
  Sun,
  Volume2,
  BookOpen,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface DeepResearchBiblePanelProps {
  bible: DeepResearchProductionBible;
  compact?: boolean;
  onRefreshResearch?: () => void;
  isRefreshing?: boolean;
  onSelectAct?: (actNumber: number) => void;
}

type DeptTabKey =
  | "screenplay"
  | "characters"
  | "crew"
  | "vfx"
  | "lighting"
  | "sound"
  | "research";

export function DeepResearchBiblePanel({
  bible,
  compact = false,
  onRefreshResearch,
  isRefreshing = false,
  onSelectAct,
}: DeepResearchBiblePanelProps) {
  const [activeTab, setActiveTab] = useState<DeptTabKey>("screenplay");

  const sc = bible.fiveDimensionScorecard;
  const dimensions = [
    {
      key: "accuracy",
      label: "Accuracy",
      data: sc.accuracy,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "relevancy",
      label: "Relevancy",
      data: sc.relevancy,
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      key: "continuity",
      label: "Continuity",
      data: sc.continuity,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "completeness",
      label: "Completeness",
      data: sc.completeness,
      badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      key: "faithfulness",
      label: "Faithfulness",
      data: sc.faithfulness,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    },
  ];

  const tabs: Array<{
    id: DeptTabKey;
    label: string;
    shortLabel: string;
    count: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "screenplay",
      label: "Screenplay & Script",
      shortLabel: "Screenplay",
      count: `${bible.screenplay.acts.length} Acts`,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: "characters",
      label: "Leads & Characters",
      shortLabel: "Leads & Cast",
      count: `${bible.charactersAndLeads.length} Cast`,
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      id: "crew",
      label: "Production Crew",
      shortLabel: "Crew",
      count: `${bible.productionCrew.length} Depts`,
      icon: <Clapperboard className="w-3.5 h-3.5" />,
    },
    {
      id: "vfx",
      label: "Visual Effects (VFX)",
      shortLabel: "VFX",
      count: `${bible.vfxBreakdown.perActVfxSpecs.length} Shots`,
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: "lighting",
      label: "Lighting & Kelvin Plot",
      shortLabel: "Lighting",
      count: `${bible.lightingPlot.perActLightingSpecs.length} Plots`,
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      id: "sound",
      label: "Sound Effects & Foley",
      shortLabel: "SFX & Audio",
      count: "4 Stems",
      icon: <Volume2 className="w-3.5 h-3.5" />,
    },
    {
      id: "research",
      label: "Deep Research Corpus",
      shortLabel: "Research",
      count: `${bible.domainCorpus.historicalAndScientificFacts.length} Facts`,
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <section
      data-testid="deep-research-production-bible"
      className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-slate-900 flex flex-col gap-3.5"
    >
      {/* Top Header & Overall Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              {bible.researchId}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-bold">
              5D Overall: {sc.overallScore.toFixed(1)}% VERIFIED
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {bible.domainCorpus.primaryDomain}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Deep Research Pre-Production Bible — Script, Screenplay, Leads, Crew, VFX, Lighting &amp; Sound Effects
          </h3>
        </div>
        {onRefreshResearch && (
          <button
            type="button"
            onClick={onRefreshResearch}
            disabled={isRefreshing}
            data-testid="run-deep-research-bible-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-60 text-slate-800 text-xs font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Researching..." : "Re-Run Deep Research Audit"}</span>
          </button>
        )}
      </div>

      {/* 5-Dimension Audit Scorecard (Accuracy, Relevancy, Continuity, Completeness, Faithfulness) */}
      <div
        data-testid="deep-research-5d-scorecard"
        className={`grid gap-2 ${
          compact ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-1 sm:grid-cols-5"
        }`}
      >
        {dimensions.map((dim) => (
          <div
            key={dim.key}
            data-testid={`scorecard-dim-${dim.key}`}
            className="min-w-0 overflow-hidden p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-slate-800">{dim.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold ${dim.badgeClass}`}
              >
                {dim.data.score.toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-snug break-words [overflow-wrap:anywhere]">
              {dim.data.rationale}
            </p>
            <div className="flex items-start gap-1 text-[9px] font-semibold text-emerald-700 pt-0.5 leading-tight break-words [overflow-wrap:anywhere]">
              <CheckCircle2 className="w-2.5 h-2.5 shrink-0 mt-0.5" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{dim.data.checksPassed[0]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 7-Department Navigation Bar */}
      <div
        role="tablist"
        aria-label="Deep Research Production Departments"
        className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2.5"
      >
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              data-testid={`bible-dept-tab-${t.id}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t.icon}
              <span>{compact ? t.shortLabel : t.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                  active ? "bg-indigo-100 text-indigo-800" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Screenplay & Script */}
      {activeTab === "screenplay" && (
        <div data-testid="bible-panel-screenplay" className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              WGA Logline &amp; 3-Act Macro Architecture
            </div>
            <p className="text-xs font-medium text-slate-800">{bible.screenplay.logline}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong className="text-slate-900">Setup:</strong> {bible.screenplay.threeActMacroStructure.setupActs}
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong className="text-slate-900">Confrontation:</strong> {bible.screenplay.threeActMacroStructure.confrontationActs}
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <strong className="text-slate-900">Resolution:</strong> {bible.screenplay.threeActMacroStructure.resolutionActs}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {bible.screenplay.acts.map((act) => (
              <div
                key={act.canonicalActId}
                onClick={() => onSelectAct?.(act.actNumber)}
                className={`p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 transition-colors space-y-1.5 ${
                  onSelectAct ? "cursor-pointer" : ""
                }`}
                data-testid={`screenplay-act-scene-${act.actNumber}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {act.slugline}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {act.canonicalActId} • {act.timeRange}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  <strong className="not-italic text-slate-800">Objective:</strong> {act.sceneObjective}
                </p>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {act.actionLines.map((line, i) => (
                    <p key={i} className="leading-snug">
                      • {line}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {act.characterCues.map((cue, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]"
                    >
                      <div className="font-bold text-slate-900 uppercase tracking-wide">
                        {cue.character}{" "}
                        <span className="font-normal text-[10px] text-slate-500 normal-case">
                          {cue.parenthetical}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium mt-0.5">
                        &ldquo;{cue.dialogue}&rdquo;
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        {cue.visemeAndDeliverySpec}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <strong className="text-indigo-700">Continuity Lock:</strong>{" "}
                  {act.continuityHandoffLock.replace(/^Continuity Lock\s*/i, "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Characters & Principal Leads */}
      {activeTab === "characters" && (
        <div
          data-testid="bible-panel-characters"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1"
        >
          {bible.charactersAndLeads.map((char) => (
            <div
              key={char.id}
              data-testid={`character-lead-card-${char.id}`}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{char.name}</span>
                  <div className="text-[11px] font-semibold text-indigo-700">{char.archetype}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold">
                    {char.billingTier}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Screen Share: {char.screenTimeSharePct}%
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-700">
                <strong>Voice &amp; Prosody:</strong> {char.vocalRegisterAndVoiceId}
              </div>
              <div className="text-[11px] text-slate-700">
                <strong>Facial Continuity Lock:</strong> {char.physicalAndFacialLock}
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1 text-[11px]">
                <div className="font-bold text-slate-800">3-Stage Wardrobe Continuity:</div>
                <div>
                  <span className="font-semibold text-slate-700">Opening:</span>{" "}
                  {char.wardrobeContinuity.openingActs}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Midpoint:</span>{" "}
                  {char.wardrobeContinuity.midpointEvolution}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Finale:</span>{" "}
                  {char.wardrobeContinuity.finaleStateAndWeathering}
                </div>
              </div>
              <div className="text-[11px] text-slate-700">
                <strong>Signature Props:</strong> {char.signatureProps.join(" • ")}
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Motivation:</strong> {char.psychologicalMotivation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Production Crew & Department Heads */}
      {activeTab === "crew" && (
        <div
          data-testid="bible-panel-crew"
          className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1"
        >
          {bible.productionCrew.map((c, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-indigo-700">
                  {c.department}
                </span>
                <span className="text-[11px] font-semibold text-slate-600">{c.roleTitle}</span>
              </div>
              <div className="font-bold text-slate-900">{c.leadCreditName}</div>
              <div className="text-[11px] text-slate-600">
                <strong>Guild Benchmark:</strong> {c.guildStyleReference}
              </div>
              <div className="text-[11px] text-slate-700">
                <strong>Technical Mandate:</strong> {c.technicalMandate}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {c.toolsAndPipeline.map((tool, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Visual Effects (VFX) & Physics Breakdown */}
      {activeTab === "vfx" && (
        <div data-testid="bible-panel-vfx" className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">
              VFX Pipeline Standard: <span className="font-mono text-indigo-700">{bible.vfxBreakdown.pipelineStandard}</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
              {bible.vfxBreakdown.globalVfxDirectives.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {bible.vfxBreakdown.perActVfxSpecs.map((v) => (
              <div
                key={v.vfxShotId}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Act {String(v.actNumber).padStart(2, "0")} • {v.vfxShotId}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {v.motionBlurAndShutterSpec}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900">Practical Plate:</strong> {v.practicalElements}
                </div>
                <div>
                  <strong className="text-slate-900">CG &amp; Physics Sim:</strong> {v.cgAndPhysicsSimulation}
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {v.compositingPasses.map((p, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Lighting & Gaffer Kelvin Plot */}
      {activeTab === "lighting" && (
        <div data-testid="bible-panel-lighting" className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <strong className="text-slate-900">Color Science &amp; LUT:</strong>{" "}
            <span className="font-mono text-indigo-700">{bible.lightingPlot.colorScienceAndLut}</span>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {bible.lightingPlot.perActLightingSpecs.map((l) => (
              <div
                key={l.actNumber}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Act {String(l.actNumber).padStart(2, "0")} Lighting Plot
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-slate-600">
                    {l.fillAndContrastRatio}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900">Key Light &amp; Kelvin:</strong> {l.keyLightKelvinAndFixture}
                </div>
                <div>
                  <strong className="text-slate-900">Rim / Edge Separation:</strong> {l.rimAndSeparationLight}
                </div>
                <div>
                  <strong className="text-slate-900">Motivated Practicals:</strong> {l.motivatedPracticals}
                </div>
                <div>
                  <strong className="text-slate-900">Volumetric Atmosphere:</strong> {l.volumetricAtmosphere}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Sound Effects (SFX), Sync Foley & Score Mix */}
      {activeTab === "sound" && (
        <div data-testid="bible-panel-sound" className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <strong className="text-slate-900">Master Loudness &amp; Mix Spec:</strong>{" "}
            <span className="font-mono text-emerald-700">{bible.soundEffectsAndMix.masterLoudnessSpec}</span>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {bible.soundEffectsAndMix.perActSoundSpecs.map((s) => (
              <div
                key={s.actNumber}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1"
              >
                <div className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  Act {String(s.actNumber).padStart(2, "0")} 4-Stem Sound &amp; Foley Plot
                </div>
                <div>
                  <strong className="text-slate-900">Hard SFX Transients:</strong> {s.hardSfxTransients}
                </div>
                <div>
                  <strong className="text-slate-900">Sync Foley:</strong> {s.syncFoley}
                </div>
                <div>
                  <strong className="text-slate-900">Ambience &amp; Room Tone:</strong> {s.ambienceAndRoomTone}
                </div>
                <div>
                  <strong className="text-slate-900">Lyria 3 Pro Musical Stem:</strong> {s.musicalScoreStem}
                </div>
                <div className="text-[10px] font-mono text-emerald-700">
                  <strong>Mix &amp; Ducking:</strong> {s.dialogueMixAndDucking}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Deep Research Domain Corpus */}
      {activeTab === "research" && (
        <div data-testid="bible-panel-research" className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">
              Historical, Scientific &amp; Architectural Grounding Facts
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
              {bible.domainCorpus.historicalAndScientificFacts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Cinematic Guild Benchmarks</div>
            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
              {bible.domainCorpus.cinematicReferences.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bible.domainCorpus.geographicalLocations.map((loc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5"
              >
                <div className="font-mono font-bold text-indigo-700">{loc.actRange}</div>
                <div className="font-bold text-slate-900">{loc.realWorldSite}</div>
                <div className="text-slate-700">
                  <strong>Geometry:</strong> {loc.architecturalGeometry}
                </div>
                <div className="text-slate-600 font-mono text-[10px]">
                  <strong>Acoustics:</strong> {loc.acousticImpulseProfile}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
