"use client";

import React, { useState } from "react";
import { Plus, Check, Upload, Link as LinkIcon, Sparkles } from "lucide-react";

export interface AvatarItem {
  id: string;
  name: string;
  gender: "female" | "male";
  role: string;
  face: string;
  outfit1: string;
  outfit2: string;
  seed: string;
  sourceMode: "prompt" | "upload" | "url";
  photoUrl: string;
}

interface MultiAvatarSelectorProps {
  onSelectAvatars: (
    avatars: AvatarItem[],
    summaryText: string,
    combinedFaces: string
  ) => void;
}

const INITIAL_ROSTER: AvatarItem[] = [
  {
    id: "av_ananya",
    name: "Ananya",
    gender: "female",
    role: "Lead Vocalist",
    face: "South Asian model, expressive hazel eyes, glossy jet-black waves",
    outfit1: "Royal Crimson & Gold Zardosi Lehenga",
    outfit2: "Liquid-Gold Chainmail Evening Gown",
    seed: "seed_ananya",
    sourceMode: "prompt",
    photoUrl: "/assets/characters/ananya_roy_in.jpg",
  },
  {
    id: "av_aarav",
    name: "Aarav",
    gender: "male",
    role: "Co-Lead",
    face: "Sharp jawline, warm olive skin, tailored dark hair",
    outfit1: "Ivory & Gold Bandhgala Suit",
    outfit2: "Midnight Velvet Crystal Tuxedo",
    seed: "seed_aarav",
    sourceMode: "prompt",
    photoUrl: "/assets/characters/aarav_kapoor_in.jpg",
  },
  {
    id: "av_elena",
    name: "Elena",
    gender: "female",
    role: "Soprano",
    face: "Mediterranean olive skin, amber eyes, dark espresso curls",
    outfit1: "Ruby Sequin Resort Mini-Dress",
    outfit2: "Emerald Silk Couture Ballgown",
    seed: "seed_elena",
    sourceMode: "prompt",
    photoUrl: "/assets/avatars/elena.jpg",
  },
  {
    id: "av_julian",
    name: "Julian",
    gender: "male",
    role: "Lead / Rap",
    face: "Sculpted cheekbones, bronze skin, wavy dark hair",
    outfit1: "Sky-Blue Open Linen Resort Shirt",
    outfit2: "All-White Monaco Dinner Tuxedo",
    seed: "seed_julian",
    sourceMode: "prompt",
    photoUrl: "/assets/avatars/david.jpg",
  },
  {
    id: "av_amara",
    name: "Amara",
    gender: "female",
    role: "Choreographer",
    face: "Radiant deep ebony skin, high cheekbones, sculpted braids",
    outfit1: "Coral-Beaded Lace Couture Gown",
    outfit2: "Sapphire Swarovski Bodysuit",
    seed: "seed_amara",
    sourceMode: "prompt",
    photoUrl: "/assets/characters/amara_okonjo_ng.jpg",
  },
  {
    id: "av_aoi",
    name: "Aoi",
    gender: "female",
    role: "Visual Lead",
    face: "East Asian glass skin, almond dark eyes, sleek raven hair",
    outfit1: "Holographic Cropped Jacket & Skirt",
    outfit2: "Cyber Fiber-Optic Couture Gown",
    seed: "seed_aoi",
    sourceMode: "prompt",
    photoUrl: "/assets/characters/aoi_takahashi_jp.jpg",
  },
];

export function MultiAvatarSelector({ onSelectAvatars }: MultiAvatarSelectorProps) {
  const [roster, setRoster] = useState<AvatarItem[]>(INITIAL_ROSTER);
  const [selectedIds, setSelectedIds] = useState<string[]>(["av_ananya", "av_aarav"]);
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [builderMode, setBuilderMode] = useState<"prompt" | "upload" | "url">("prompt");
  const [newName, setNewName] = useState<string>("");
  const [newGender, setNewGender] = useState<"female" | "male">("female");
  const [newPrompt, setNewPrompt] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");
  const [uploadedBase64, setUploadedBase64] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const notify = (nextRoster: AvatarItem[], nextIds: string[]) => {
    const chosen = nextRoster.filter((a) => nextIds.includes(a.id));
    const summary = `${chosen.length} Cast (${chosen.map((c) => c.name).join(", ")})`;
    const faces = chosen.map((c) => `${c.name}: ${c.face}`).join(" | ");
    onSelectAvatars(chosen, summary, faces);
  };

  const toggleAvatar = (id: string) => {
    const exists = selectedIds.includes(id);
    const nextIds = exists
      ? selectedIds.length > 1
        ? selectedIds.filter((x) => x !== id)
        : selectedIds
      : [...selectedIds, id];
    setSelectedIds(nextIds);
    notify(roster, nextIds);
  };

  const selectPresetCount = (count: number) => {
    const nextIds = roster.slice(0, count).map((a) => a.id);
    setSelectedIds(nextIds);
    notify(roster, nextIds);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUploadedBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAvatar = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/swarm/avatar-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: builderMode,
          name: newName.trim() || `Avatar ${roster.length + 1}`,
          gender: newGender,
          role: "Lead",
          prompt: newPrompt,
          imageBase64: uploadedBase64,
          imageUrl: newUrl,
        }),
      });
      const data = await res.json();
      const fallbackPhoto =
        newGender === "female"
          ? "/assets/avatars/maya.jpg"
          : "/assets/avatars/jonathan.jpg";

      const created: AvatarItem = {
        id: `av_${Date.now()}`,
        name: newName.trim() || `Avatar ${roster.length + 1}`,
        gender: newGender,
        role: "Custom",
        face: newPrompt || "Custom facial identity",
        outfit1: "Scene 1 Couture",
        outfit2: "Scene 2 Finale",
        seed: `seed_${Date.now()}`,
        sourceMode: builderMode,
        photoUrl:
          builderMode === "upload" && uploadedBase64
            ? uploadedBase64
            : builderMode === "url" && newUrl
            ? newUrl
            : data?.avatar?.photoUrl && !data.avatar.photoUrl.includes("/api/")
            ? data.avatar.photoUrl
            : fallbackPhoto,
      };
      const nextRoster = [created, ...roster];
      const nextIds = [created.id, ...selectedIds];
      setRoster(nextRoster);
      setSelectedIds(nextIds);
      notify(nextRoster, nextIds);
      setNewName("");
      setNewPrompt("");
      setNewUrl("");
      setUploadedBase64("");
      setShowBuilder(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111115] p-3.5 space-y-3">
      {/* Top Bar: Cast Counter + Preset Pills + Add Avatar Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">Cast Selection</span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-zinc-300 text-[11px] font-medium">
            {selectedIds.length} Selected
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { label: "Solo", count: 1 },
            { label: "Duet", count: 2 },
            { label: "Trio", count: 3 },
            { label: "Quartet", count: 4 },
          ].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => selectPresetCount(p.count)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                selectedIds.length === p.count
                  ? "bg-white text-zinc-950 font-semibold"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {p.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Avatar</span>
          </button>
        </div>
      </div>

      {/* Collapsible 3-Mode Avatar Creator (Prompt | Upload | URL) */}
      {showBuilder && (
        <div className="p-3 rounded-lg bg-zinc-950 border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[
                { id: "prompt", label: "Prompt", icon: Sparkles },
                { id: "upload", label: "Upload", icon: Upload },
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

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="sm:col-span-3 rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
            />
            <select
              value={newGender}
              onChange={(e) =>
                setNewGender(e.target.value as "female" | "male")
              }
              className="sm:col-span-2 rounded-lg bg-zinc-900 border border-white/[0.08] px-2 py-1.5 text-xs text-white outline-none"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>

            <div className="sm:col-span-5">
              {builderMode === "prompt" && (
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Describe face, hair, ethnicity..."
                  className="w-full rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                />
              )}
              {builderMode === "upload" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-zinc-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white"
                />
              )}
              {builderMode === "url" && (
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/portrait.jpg"
                  className="w-full rounded-lg bg-zinc-900 border border-white/[0.08] px-2.5 py-1.5 text-xs text-white outline-none"
                />
              )}
            </div>

            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateAvatar}
              className="sm:col-span-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-1.5 px-3 cursor-pointer"
            >
              {isCreating ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Clean Photographic Avatar Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {roster.map((av) => {
          const isSelected = selectedIds.includes(av.id);
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => toggleAvatar(av.id)}
              className={`group relative rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-white ring-1 ring-white"
                  : "border-white/[0.08] opacity-60 hover:opacity-100"
              }`}
            >
              <div className="relative h-24 w-full bg-zinc-900">
                <img
                  src={av.photoUrl}
                  alt={av.name}
                  className="w-full h-full object-cover object-top"
                />
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="px-2 py-1.5 bg-zinc-950 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white truncate">
                  {av.name}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase">
                  {av.gender === "female" ? "F" : "M"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
