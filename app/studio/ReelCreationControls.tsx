"use client";

import React, { useMemo } from "react";
import { ChevronDown, Layers3, SlidersHorizontal, WandSparkles } from "lucide-react";
import { GENRE_CATEGORIES, GENRE_CLUSTERS, GENRE_CONCEPTS, type GenreConcept } from "@/lib/tier6/genre_concepts";
import { GLOBAL_CHARACTERS, VISUAL_AESTHETICS } from "@/lib/tier6/characters";

export type ReelCreationDraft = {
  mode: "quick-brief" | "category";
  clusterId: string;
  categoryId: string;
  conceptId: string;
  characterId: string;
  visualStyleId: string;
  musicPreset: string;
};

type Props = {
  value: ReelCreationDraft;
  onChange: (next: ReelCreationDraft) => void;
  onApplyConcept: (concept: GenreConcept) => void;
};

const musicPresets = Array.from(new Set(GENRE_CONCEPTS.map(item => item.musicPreset).filter((value): value is string => Boolean(value))));

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="block">
    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">{label}</span>
    <div className="relative mt-1.5">
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 pr-9 text-xs font-semibold text-slate-300 outline-none focus:border-pink-300/30">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-600" />
    </div>
  </label>;
}

export function ReelCreationControls({ value, onChange, onApplyConcept }: Props) {
  const categories = useMemo(() => GENRE_CATEGORIES.filter(category => category.id !== "all" && (value.clusterId === "all" || category.cluster === value.clusterId)), [value.clusterId]);
  const concepts = useMemo(() => GENRE_CONCEPTS.filter(concept => value.categoryId === "all" || concept.genre === value.categoryId), [value.categoryId]);
  const selectedConcept = GENRE_CONCEPTS.find(concept => concept.id === value.conceptId);

  const setMode = (mode: ReelCreationDraft["mode"]) => onChange({ ...value, mode });
  const chooseConcept = (concept: GenreConcept) => {
    onChange({
      mode: "category",
      clusterId: concept.cluster,
      categoryId: concept.genre,
      conceptId: concept.id,
      characterId: concept.characterLock || "auto",
      visualStyleId: concept.visualStyle || "auto",
      musicPreset: concept.musicPreset || "auto",
    });
    onApplyConcept(concept);
  };

  return <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-3">
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => setMode("quick-brief")} className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${value.mode === "quick-brief" ? "bg-white text-slate-950" : "bg-white/[0.04] text-slate-400 hover:text-white"}`}>
        <WandSparkles className="mr-1.5 inline h-3.5 w-3.5" /> Quick Brief
      </button>
      <button type="button" onClick={() => setMode("category")} className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${value.mode === "category" ? "bg-white text-slate-950" : "bg-white/[0.04] text-slate-400 hover:text-white"}`}>
        <Layers3 className="mr-1.5 inline h-3.5 w-3.5" /> 24 Categories
      </button>
    </div>

    {value.mode === "category" && <div className="mt-3 space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <Select label="Cluster" value={value.clusterId} onChange={clusterId => onChange({ ...value, clusterId, categoryId: "all", conceptId: "" })}>
          {GENRE_CLUSTERS.map(cluster => <option key={cluster.id} value={cluster.id}>{cluster.name}</option>)}
        </Select>
        <Select label="Category" value={value.categoryId} onChange={categoryId => onChange({ ...value, categoryId, conceptId: "" })}>
          <option value="all">🌐 All categories</option>
          {categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600">Concepts & templates</span>
          <span className="text-[10px] font-bold text-slate-700">{concepts.length} shown</span>
        </div>
        <div className="mt-2 max-h-60 space-y-2 overflow-y-auto pr-1.5 scrollbar-thin">
          {concepts.map(concept => {
            const active = value.conceptId === concept.id;
            return <button key={concept.id} type="button" onClick={() => chooseConcept(concept)} className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-pink-300/35 bg-pink-300/[0.08]" : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"}`}>
              <div className="text-xs font-black text-white">{concept.title}</div>
              <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{concept.hook}</div>
            </button>;
          })}
        </div>
      </div>

      {selectedConcept && <div className="rounded-xl border border-teal-300/15 bg-teal-300/[0.04] p-3 text-[11px] leading-5 text-teal-100/70">
        Selected: <span className="font-black text-teal-100">{selectedConcept.title}</span>. Its category, performer, visual direction and music direction feed the same current Production Manifest pipeline.
      </div>}
    </div>}

    <details className="mt-3 group">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl bg-white/[0.025] px-3 py-2.5 text-xs font-black text-slate-400 hover:text-white">
        <span><SlidersHorizontal className="mr-1.5 inline h-3.5 w-3.5" /> Advanced creative controls</span>
        <span className="text-[10px] text-slate-700 group-open:hidden">OPEN</span>
      </summary>
      <div className="mt-2 space-y-2 rounded-xl border border-white/8 p-3">
        <Select label="Persona / cast" value={value.characterId} onChange={characterId => onChange({ ...value, characterId })}>
          <option value="auto">Auto from brief / concept</option>
          {GLOBAL_CHARACTERS.map(character => <option key={character.id} value={character.id}>{character.avatarEmoji} {character.name} — {character.role}</option>)}
        </Select>
        <Select label="Visual aesthetic" value={value.visualStyleId} onChange={visualStyleId => onChange({ ...value, visualStyleId })}>
          <option value="auto">Auto from brief / concept</option>
          {VISUAL_AESTHETICS.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}
        </Select>
        <Select label="Music direction" value={value.musicPreset} onChange={musicPreset => onChange({ ...value, musicPreset })}>
          <option value="auto">Auto / supportive underscore</option>
          {musicPresets.map(preset => <option key={preset} value={preset}>{preset.replace(/_/g, " ")}</option>)}
        </Select>
        <div className="rounded-lg bg-white/[0.025] p-2.5 text-[10px] leading-4 text-slate-600">
          Current Reel production remains 9:16 and uses the verified narration pipeline. Music selection is persisted as production direction; it does not claim a generated music stem until that provider stage exists.
        </div>
      </div>
    </details>
  </div>;
}
