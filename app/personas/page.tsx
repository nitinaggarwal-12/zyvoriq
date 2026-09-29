"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PersonaCategory,
  PersonaDefinition,
  PERSONAS_CATALOG,
  WARDROBE_CATALOG,
  ACCESSORIES_CATALOG,
  INITIAL_REELS_REPOSITORY,
  getWardrobeForCategory,
  getById,
  dedupeById,
  dedupeSelectedPersonaIds,
} from "@/lib/studioCatalog";
import {
  Check,
  Plus,
  Sparkles,
  Upload,
  Link as LinkIcon,
  ArrowRight,
  Users,
  Trash2,
} from "lucide-react";

const CATEGORY_TABS: { id: PersonaCategory; label: string }[] = [
  { id: "female_lead", label: "Female Leads" },
  { id: "male_lead", label: "Male Leads" },
  { id: "supporting", label: "Supporting Cast" },
  { id: "background", label: "Background Dancers" },
  { id: "audience", label: "Audience & Crowd" },
];

export default function PersonasAndWardrobePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PersonaCategory>("female_lead");
  const [personas, setPersonas] = useState<PersonaDefinition[]>(PERSONAS_CATALOG);
  const [wardrobes, setWardrobes] = useState(WARDROBE_CATALOG);
  const [accessories, setAccessories] = useState(ACCESSORIES_CATALOG);

  // Selected Persona IDs per Category (Derived dynamically from INITIAL_REELS_REPOSITORY[0])
  const [selectedIds, setSelectedIds] = useState<Record<PersonaCategory, string[]>>(() => {
    const defaultReel = INITIAL_REELS_REPOSITORY[0];
    return {
      female_lead: defaultReel?.selectedPersonaIds?.female_lead || ["p_fem_elena_moretti"],
      male_lead: defaultReel?.selectedPersonaIds?.male_lead || ["p_male_matteo_conti"],
      supporting: defaultReel?.selectedPersonaIds?.supporting || ["p_sup_lorenzo_ferri"],
      background: defaultReel?.selectedPersonaIds?.background || ["p_bg_milan_neighbors"],
      audience: defaultReel?.selectedPersonaIds?.audience || ["p_aud_census_tribunal"],
    };
  });

  // Per-Persona Wardrobe & Accessory Selection by Exact Wardrobe ID
  const [wardrobeMap, setWardrobeMap] = useState<
    Record<string, { act1Id: string; act2Id: string; accessoryId: string }>
  >(() => {
    const initial: Record<
      string,
      { act1Id: string; act2Id: string; accessoryId: string }
    > = {};
    for (const p of PERSONAS_CATALOG) {
      initial[p.id] = {
        act1Id: p.defaultAct1WardrobeId,
        act2Id: p.defaultAct2WardrobeId,
        accessoryId: p.defaultAccessoryId,
      };
    }
    return initial;
  });

  // Custom Persona Builder State
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [builderMode, setBuilderMode] = useState<"prompt" | "upload" | "url">("prompt");
  const [newName, setNewName] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [newFacialSpec, setNewFacialSpec] = useState<string>("");
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");
  const [uploadedDataUri, setUploadedDataUri] = useState<string>("");
  const [isBuildingPersona, setIsBuildingPersona] = useState<boolean>(false);

  // Load saved cast state and dynamic prompt-synthesized catalog if present (timestamp-aware)
  useEffect(() => {
    try {
      const dynRaw = localStorage.getItem("zyvoriq_dynamic_catalog_v1");
      const rawMatrix = localStorage.getItem("zyvoriq_cast_matrix_v1");
      const dynParsed = dynRaw ? JSON.parse(dynRaw) : null;
      const matrixParsed = rawMatrix ? JSON.parse(rawMatrix) : null;

      if (dynParsed) {
        if (Array.isArray(dynParsed.personas) && dynParsed.personas.length > 0) {
          setPersonas((prev) => dedupeById([...dynParsed.personas, ...prev]));
          setWardrobeMap((prev) => {
            const next = { ...prev };
            for (const p of dedupeById(dynParsed.personas as PersonaDefinition[])) {
              if (!next[p.id]) {
                next[p.id] = {
                  act1Id: p.defaultAct1WardrobeId,
                  act2Id: p.defaultAct2WardrobeId,
                  accessoryId: p.defaultAccessoryId,
                };
              }
            }
            return next;
          });
        }
        if (Array.isArray(dynParsed.wardrobes) && dynParsed.wardrobes.length > 0) {
          setWardrobes((prev) => dedupeById([...dynParsed.wardrobes, ...prev]));
        }
        if (dynParsed.accessory && typeof dynParsed.accessory.id === "string") {
          setAccessories((prev) => dedupeById([dynParsed.accessory, ...prev]));
        }
      }

      if (matrixParsed && Array.isArray(matrixParsed.customPersonas) && matrixParsed.customPersonas.length > 0) {
        setPersonas((prev) => dedupeById([...matrixParsed.customPersonas, ...prev]));
      }

      const dynTime = dynParsed?.savedAt ? new Date(dynParsed.savedAt).getTime() : 0;
      const matrixTime = matrixParsed?.savedAt ? new Date(matrixParsed.savedAt).getTime() : 0;

      if (matrixParsed && matrixTime >= dynTime) {
        if (matrixParsed.selectedIds) {
          setSelectedIds((prev) => dedupeSelectedPersonaIds(matrixParsed.selectedIds, prev));
        }
        if (matrixParsed.wardrobeMap) {
          setWardrobeMap((prev) => ({ ...prev, ...matrixParsed.wardrobeMap }));
        }
      } else if (dynParsed) {
        if (dynParsed.selectedIds) {
          setSelectedIds((prev) => dedupeSelectedPersonaIds(dynParsed.selectedIds, prev));
        }
        if (dynParsed.wardrobeMap) {
          setWardrobeMap((prev) => ({ ...prev, ...dynParsed.wardrobeMap }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persistCastAndCatalogToStorage = (
    nextPersonas: PersonaDefinition[],
    nextWardrobes: typeof WARDROBE_CATALOG,
    nextSelectedIds: Record<PersonaCategory, string[]>,
    nextWardrobeMap: Record<string, { act1Id: string; act2Id: string; accessoryId: string }>
  ) => {
    try {
      const nowIso = new Date().toISOString();
      const cleanPersonas = dedupeById(nextPersonas);
      const cleanWardrobes = dedupeById(nextWardrobes);
      const cleanSelectedIds = dedupeSelectedPersonaIds(nextSelectedIds);
      const customPersonas = cleanPersonas.filter(
        (p) => !PERSONAS_CATALOG.some((base) => base.id === p.id)
      );
      localStorage.setItem(
        "zyvoriq_cast_matrix_v1",
        JSON.stringify({
          selectedIds: cleanSelectedIds,
          wardrobeMap: nextWardrobeMap,
          customPersonas,
          savedAt: nowIso,
        })
      );

      const existingDynRaw = localStorage.getItem("zyvoriq_dynamic_catalog_v1");
      const existingDyn = existingDynRaw ? JSON.parse(existingDynRaw) : {};
      localStorage.setItem(
        "zyvoriq_dynamic_catalog_v1",
        JSON.stringify({
          ...existingDyn,
          personas: cleanPersonas,
          wardrobes: cleanWardrobes,
          selectedIds: cleanSelectedIds,
          wardrobeMap: nextWardrobeMap,
          savedAt: nowIso,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  };

  const togglePersona = (cat: PersonaCategory, id: string) => {
    setSelectedIds((prev) => {
      const list = prev[cat] || [];
      const exists = list.includes(id);
      const nextList = exists
        ? list.filter((item) => item !== id)
        : Array.from(new Set([...list, id]));
      const nextSelected = { ...prev, [cat]: nextList };
      persistCastAndCatalogToStorage(personas, wardrobes, nextSelected, wardrobeMap);
      return nextSelected;
    });
  };

  const deleteCustomPersona = (cat: PersonaCategory, id: string) => {
    const nextPersonas = personas.filter((p) => p.id !== id);
    const nextSelected: Record<PersonaCategory, string[]> = {
      ...selectedIds,
      [cat]: (selectedIds[cat] || []).filter((item) => item !== id),
    };
    const nextWardrobeMap = { ...wardrobeMap };
    delete nextWardrobeMap[id];
    setPersonas(nextPersonas);
    setSelectedIds(nextSelected);
    setWardrobeMap(nextWardrobeMap);
    persistCastAndCatalogToStorage(nextPersonas, wardrobes, nextSelected, nextWardrobeMap);
  };

  const updateWardrobe = (
    personaId: string,
    field: "act1Id" | "act2Id" | "accessoryId",
    valueId: string
  ) => {
    setWardrobeMap((prev) => {
      const personaObj = personas.find((p) => p.id === personaId);
      const nextMap = {
        ...prev,
        [personaId]: {
          ...(prev[personaId] || {
            act1Id: personaObj?.defaultAct1WardrobeId || WARDROBE_CATALOG[0].id,
            act2Id: personaObj?.defaultAct2WardrobeId || WARDROBE_CATALOG[1]?.id || WARDROBE_CATALOG[0].id,
            accessoryId: personaObj?.defaultAccessoryId || ACCESSORIES_CATALOG[0].id,
          }),
          [field]: valueId,
        },
      };
      persistCastAndCatalogToStorage(personas, wardrobes, selectedIds, nextMap);
      return nextMap;
    });
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUploadedDataUri(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomPersona = async () => {
    setIsBuildingPersona(true);
    try {
      const act1Options = getWardrobeForCategory(activeTab, 1);
      const act2Options = getWardrobeForCategory(activeTab, 2);
      const defaultAct1 = act1Options[0]?.id || WARDROBE_CATALOG[0].id;
      const defaultAct2 = act2Options[0]?.id || defaultAct1;

      const res = await fetch("/api/swarm/avatar-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: builderMode,
          category: activeTab,
          gender: activeTab === "male_lead" ? "male" : "female",
          name: newName.trim(),
          role: newRole.trim(),
          prompt: newFacialSpec.trim(),
          imageBase64: uploadedDataUri,
          imageUrl: newPhotoUrl.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      const avatar = data?.avatar || {};

      const id = String(avatar.id || `p_custom_${Date.now()}`);
      const created: PersonaDefinition = {
        id,
        category: activeTab,
        name: String(avatar.name || newName.trim() || "Custom Studio Persona"),
        roleTitle: String(avatar.roleTitle || newRole.trim() || "Lead Performer"),
        ethnicity: String(avatar.ethnicity || "Global Contemporary"),
        facialSpec: String(
          avatar.facialSpec ||
            newFacialSpec.trim() ||
            "Expressive camera-ready stage persona with locked biometric identity"
        ),
        photoUrl: String(
          avatar.photoUrl ||
            (activeTab === "male_lead"
              ? "/assets/characters/aarav_kapoor_in.jpg"
              : "/assets/characters/ananya_roy_in.jpg")
        ),
        defaultAct1WardrobeId: defaultAct1,
        defaultAct2WardrobeId: defaultAct2,
        defaultAccessoryId: accessories[0]?.id || ACCESSORIES_CATALOG[0].id,
      };

      const nextPersonas = dedupeById([created, ...personas]);
      const nextWardrobeMap = {
        ...wardrobeMap,
        [id]: {
          act1Id: defaultAct1,
          act2Id: defaultAct2,
          accessoryId: accessories[0]?.id || ACCESSORIES_CATALOG[0].id,
        },
      };
      const nextSelectedIds = dedupeSelectedPersonaIds({
        ...selectedIds,
        [activeTab]: [id, ...(selectedIds[activeTab] || [])],
      });

      setPersonas(nextPersonas);
      setWardrobeMap(nextWardrobeMap);
      setSelectedIds(nextSelectedIds);
      persistCastAndCatalogToStorage(
        nextPersonas,
        wardrobes,
        nextSelectedIds,
        nextWardrobeMap
      );

      setNewName("");
      setNewRole("");
      setNewFacialSpec("");
      setNewPhotoUrl("");
      setUploadedDataUri("");
      setShowBuilder(false);
    } finally {
      setIsBuildingPersona(false);
    }
  };

  const applyToStudio = () => {
    persistCastAndCatalogToStorage(personas, wardrobes, selectedIds, wardrobeMap);
    router.push("/?workflow=create&from=personas");
  };

  const activeCategoryPersonas = dedupeById(
    personas.filter((p) => p.category === activeTab)
  );
  const act1WardrobeList = dedupeById(
    wardrobes.filter(
      (w) => w.category === activeTab && (w.act === 1 || w.act === "both")
    )
  );
  const act2WardrobeList = dedupeById(
    wardrobes.filter(
      (w) => w.category === activeTab && (w.act === 2 || w.act === "both")
    )
  );

  const allSelectedPersonas = dedupeById(
    CATEGORY_TABS.flatMap((t) =>
      (selectedIds[t.id] || [])
        .map((id) => personas.find((p) => p.id === id))
        .filter((p): p is PersonaDefinition => Boolean(p))
    )
  );

  const selectCls =
    "w-full rounded-lg bg-[#121217] border border-white/[0.08] focus:border-white/40 px-2.5 py-1.5 text-xs text-white font-medium outline-none";

  return (
    <div className="w-full max-w-none min-h-screen bg-[#09090b] text-zinc-100">
      {/* Sticky Top Subheader */}
      <div className="sticky top-0 z-40 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-4 h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-zinc-300" />
          <span className="text-sm font-semibold text-white">
            Personas &amp; Exhaustive Wardrobe Library
          </span>
          <span className="px-2 py-0.5 rounded bg-white/[0.08] text-zinc-300 text-[11px] font-medium">
            {allSelectedPersonas.length} Total Cast Selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyToStudio}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lock Cast &amp; Return to 4-Step Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="w-full max-w-none grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANE (lg:col-span-8): 5 ROLE TABS + PERSONA CARDS + EXHAUSTIVE WARDROBE SELECTORS */}
        <div className="lg:col-span-8 p-4 sm:p-5 space-y-4 border-r border-white/[0.07]">
          {/* 5 Role Category Tabs + Add Custom Persona Button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 bg-[#121217] p-1 rounded-lg border border-white/[0.06]">
              {CATEGORY_TABS.map((tab) => {
                const count = (selectedIds[tab.id] || []).length;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? "bg-white text-zinc-950 font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        active
                          ? "bg-zinc-900 text-white"
                          : "bg-white/[0.07] text-zinc-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowBuilder(!showBuilder)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Persona</span>
            </button>
          </div>

          {/* Custom Persona Creator (Prompt | Upload | URL) */}
          {showBuilder && (
            <div className="p-3.5 rounded-xl bg-[#111116] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Create Custom Persona in {CATEGORY_TABS.find((c) => c.id === activeTab)?.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: "prompt", label: "AI Prompt", icon: Sparkles },
                    { id: "upload", label: "Upload Photo", icon: Upload },
                    { id: "url", label: "Image URL", icon: LinkIcon },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setBuilderMode(m.id as "prompt" | "upload" | "url")
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                          builderMode === m.id
                            ? "bg-white text-zinc-950 font-semibold"
                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (or leave blank for AI)"
                  className="sm:col-span-3 rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Role Title"
                  className="sm:col-span-3 rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <div className="sm:col-span-4 flex items-center gap-2">
                  {builderMode === "prompt" && (
                    <input
                      type="text"
                      value={newFacialSpec}
                      onChange={(e) => setNewFacialSpec(e.target.value)}
                      placeholder="Facial structure, hair, ethnicity..."
                      className="w-full rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  )}
                  {builderMode === "upload" && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadFile}
                        className="w-full text-xs text-zinc-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-zinc-800 file:text-white"
                      />
                      {uploadedDataUri && (
                        <img
                          src={uploadedDataUri}
                          alt="Uploaded preview"
                          className="w-8 h-8 rounded object-cover border border-white/20 shrink-0"
                        />
                      )}
                    </>
                  )}
                  {builderMode === "url" && (
                    <>
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                      {newPhotoUrl.trim() && (
                        <img
                          src={newPhotoUrl.trim()}
                          alt="URL preview"
                          className="w-8 h-8 rounded object-cover border border-white/20 shrink-0"
                        />
                      )}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isBuildingPersona}
                  onClick={handleAddCustomPersona}
                  className="sm:col-span-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-1.5 px-3 cursor-pointer"
                >
                  {isBuildingPersona ? "Building..." : "Add & Select"}
                </button>
              </div>
            </div>
          )}

          {/* Persona Cards with Exhaustive Per-Character Wardrobe Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeCategoryPersonas.map((persona) => {
              const isSelected = (selectedIds[activeTab] || []).includes(
                persona.id
              );
              const isCustomPersona = !PERSONAS_CATALOG.some(
                (base) => base.id === persona.id
              );
              const wState = wardrobeMap[persona.id] || {
                act1Id: persona.defaultAct1WardrobeId,
                act2Id: persona.defaultAct2WardrobeId,
                accessoryId: persona.defaultAccessoryId,
              };

              return (
                <div
                  key={persona.id}
                  className={`rounded-xl overflow-hidden border transition-all p-3.5 space-y-3 ${
                    isSelected
                      ? "bg-[#111116] border-white ring-1 ring-white/40"
                      : "bg-[#0d0d11] border-white/[0.07] hover:border-white/20"
                  }`}
                >
                  {/* Top Row: Portrait + Identity + Select / Delete Buttons */}
                  <div className="flex items-start gap-3">
                    <img
                      src={persona.photoUrl}
                      alt={persona.name}
                      className="w-16 h-20 rounded-lg object-cover object-top shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {persona.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCustomPersona && (
                            <button
                              type="button"
                              onClick={() => deleteCustomPersona(activeTab, persona.id)}
                              title="Delete Custom Persona"
                              className="p-1.5 rounded-md bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => togglePersona(activeTab, persona.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-white text-zinc-950"
                                : "bg-white/[0.08] text-zinc-300 hover:text-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{isSelected ? "Selected" : "Select"}</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">
                        {persona.roleTitle} • {persona.ethnicity}
                      </p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                        {persona.facialSpec}
                      </p>
                    </div>
                  </div>

                  {/* Exhaustive Wardrobe Dropdowns for this Persona */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[10px] font-medium text-zinc-400 mb-0.5">
                        Act I Opening Wardrobe
                      </label>
                      <select
                        value={wState.act1Id}
                        onChange={(e) =>
                          updateWardrobe(persona.id, "act1Id", e.target.value)
                        }
                        className={selectCls}
                      >
                        {act1WardrobeList.map((w) => (
                          <option key={w.id} value={w.id}>
                            [{w.group}] {w.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {act2WardrobeList.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-400 mb-0.5">
                          Act II+ Progression / Finale Wardrobe
                        </label>
                        <select
                          value={wState.act2Id}
                          onChange={(e) =>
                            updateWardrobe(persona.id, "act2Id", e.target.value)
                          }
                          className={selectCls}
                        >
                          {act2WardrobeList.map((w) => (
                            <option key={w.id} value={w.id}>
                              [{w.group}] {w.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-medium text-zinc-400 mb-0.5">
                        Footwear, Hair &amp; Accessories
                      </label>
                      <select
                        value={wState.accessoryId}
                        onChange={(e) =>
                          updateWardrobe(persona.id, "accessoryId", e.target.value)
                        }
                        className={selectCls}
                      >
                        {dedupeById(accessories).map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE (lg:col-span-4): LIVE ENSEMBLE CALL-SHEET SUMMARY */}
        <div className="lg:col-span-4 p-4 sm:p-5 lg:sticky lg:top-13 space-y-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#0e0e12] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-xs font-semibold text-white">
                Active Ensemble Call-Sheet ({allSelectedPersonas.length})
              </span>
              <span className="text-[11px] text-zinc-400">All 5 Tiers</span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {CATEGORY_TABS.map((tier) => {
                const chosen = dedupeById(
                  (selectedIds[tier.id] || [])
                    .map((id) => personas.find((p) => p.id === id))
                    .filter((p): p is PersonaDefinition => Boolean(p))
                );

                return (
                  <div
                    key={tier.id}
                    className="p-2.5 rounded-lg bg-[#121217] border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-200">
                        {tier.label}
                      </span>
                      <span className="text-zinc-500">
                        {chosen.length} Selected
                      </span>
                    </div>

                    {chosen.length === 0 ? (
                      <div className="text-[11px] text-zinc-500">
                        None selected
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {chosen.map((p) => {
                          const w = wardrobeMap[p.id] || {
                            act1Id: p.defaultAct1WardrobeId,
                            act2Id: p.defaultAct2WardrobeId,
                            accessoryId: p.defaultAccessoryId,
                          };
                          const act1Obj = getById(wardrobes, w.act1Id);
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-2.5 p-1.5 rounded bg-zinc-950 border border-white/[0.05]"
                            >
                              <img
                                src={p.photoUrl}
                                alt={p.name}
                                className="w-9 h-11 rounded object-cover object-top shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-white truncate">
                                  {p.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate">
                                  {act1Obj?.label}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={applyToStudio}
              className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lock Cast &amp; Return to 4-Step Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
