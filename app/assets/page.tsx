"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

interface Wardrobe {
  id: string;
  label: string;
  sheetUris: string[];
  isDefault: boolean;
}
interface Character {
  id: string;
  displayName: string;
  archetype: string;
  description: string;
  country?: string;
  language?: string;
  defaultVoiceId?: string;
  validationStatus?: string;
  wardrobe?: Wardrobe[];
}
interface Location {
  id: string;
  displayName: string;
  environmentBlock: string;
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
}

const emptyCharacter = {
  id: "",
  displayName: "",
  archetype: "",
  description: "",
  country: "",
  language: "",
  defaultVoiceId: "Kore",
};
const emptyLocation = {
  id: "",
  displayName: "",
  environmentBlock: "",
  establishingUri: "",
  era: "",
  timeOfDay: "",
};

export default function AssetsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"people" | "locations">("people");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [characterForm, setCharacterForm] = useState({ ...emptyCharacter });
  const [locationForm, setLocationForm] = useState({ ...emptyLocation });
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [wardrobeTarget, setWardrobeTarget] = useState<Character | null>(null);
  const [wardrobeLabel, setWardrobeLabel] = useState("Default look");
  const [wardrobeImage, setWardrobeImage] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        fetch("/api/library/characters").then((r) => r.json()),
        fetch("/api/library/locations").then((r) => r.json()),
      ]);
      setCharacters(Array.isArray(c?.characters) ? c.characters : []);
      setLocations(Array.isArray(l?.locations) ? l.locations : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "locations") setTab("locations");
    load();
  }, []);

  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((item) =>
      `${item.displayName} ${item.archetype} ${item.description} ${item.country || ""} ${item.language || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [characters, query]);

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((item) =>
      `${item.displayName} ${item.environmentBlock} ${item.era || ""} ${item.timeOfDay || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [locations, query]);

  async function saveCharacter() {
    setMessage("");
    const endpoint = editingCharacter
      ? `/api/library/characters/${encodeURIComponent(editingCharacter)}`
      : "/api/library/characters";
    const res = await fetch(endpoint, {
      method: editingCharacter ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(characterForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error || "Could not save person.");
      return;
    }
    setMessage(editingCharacter ? "Person updated." : "Person created.");
    setCharacterForm({ ...emptyCharacter });
    setEditingCharacter(null);
    await load();
  }

  async function saveLocation() {
    setMessage("");
    const endpoint = editingLocation
      ? `/api/library/locations/${encodeURIComponent(editingLocation)}`
      : "/api/library/locations";
    const res = await fetch(endpoint, {
      method: editingLocation ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locationForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error || "Could not save location.");
      return;
    }
    setMessage(editingLocation ? "Location updated." : "Location created.");
    setLocationForm({ ...emptyLocation });
    setEditingLocation(null);
    await load();
  }

  async function remove(kind: "character" | "location", id: string) {
    if (!window.confirm(`Delete this ${kind}?`)) return;
    const endpoint = kind === "character"
      ? `/api/library/characters/${encodeURIComponent(id)}`
      : `/api/library/locations/${encodeURIComponent(id)}`;
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function addWardrobe() {
    if (!wardrobeTarget || !wardrobeImage) {
      setMessage("Add a reference image before saving the wardrobe.");
      return;
    }
    const res = await fetch(`/api/library/characters/${encodeURIComponent(wardrobeTarget.id)}/wardrobe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: wardrobeLabel || "Saved look",
        sheetUris: [wardrobeImage],
        isDefault: (wardrobeTarget.wardrobe?.length || 0) === 0,
        validateNow: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error || "Could not add wardrobe.");
      return;
    }
    setMessage("Wardrobe/reference added.");
    setWardrobeTarget(null);
    setWardrobeLabel("Default look");
    setWardrobeImage("");
    await load();
  }

  async function startProjectWithAsset(kind: "character" | "location", id: string) {
    setMessage("");
    try {
      const payload =
        kind === "character"
          ? { format: "reel", stage: "assets", status: "draft", selectedCharacterId: id, title: "Untitled Reel" }
          : { format: "reel", stage: "assets", status: "draft", selectedLocationId: id, selectedScene2LocationId: id, title: "Untitled Reel" };
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.project?.id) throw new Error(data?.error || "Could not create project");
      router.push(`/swarm?project=${encodeURIComponent(data.project.id)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start project.");
    }
  }

  async function readWardrobeFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Reference images are limited to 5 MB each.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    setWardrobeImage(dataUrl);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">Assets</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Reusable people and locations</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Build identity and environment assets once, then reuse them directly in every Studio project.
            </p>
          </div>
          <Link href="/my-reels" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View projects
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button onClick={() => setTab("people")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "people" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              <UsersRound className="h-4 w-4" /> People <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">{characters.length}</span>
            </button>
            <button onClick={() => setTab("locations")} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "locations" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              <MapPin className="h-4 w-4" /> Locations <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">{locations.length}</span>
            </button>
          </div>
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100" />
          </div>
        </div>

        {message && <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</div>}

        <div className="mt-7 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:self-start">
            {tab === "people" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{editingCharacter ? "Edit person" : "Add person"}</h2>
                  {editingCharacter && <button onClick={() => { setEditingCharacter(null); setCharacterForm({ ...emptyCharacter }); }} className="text-slate-400"><X className="h-4 w-4" /></button>}
                </div>
                <div className="mt-4 grid gap-3">
                  <input value={characterForm.displayName} onChange={(e) => setCharacterForm({ ...characterForm, displayName: e.target.value })} placeholder="Name" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <input value={characterForm.archetype} onChange={(e) => setCharacterForm({ ...characterForm, archetype: e.target.value })} placeholder="Role / archetype" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <textarea value={characterForm.description} onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })} placeholder="Appearance, identity, personality, voice cues…" className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm" />
                  <input value={characterForm.country} onChange={(e) => setCharacterForm({ ...characterForm, country: e.target.value })} placeholder="Country / region" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <input value={characterForm.language} onChange={(e) => setCharacterForm({ ...characterForm, language: e.target.value })} placeholder="Language" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <input value={characterForm.defaultVoiceId} onChange={(e) => setCharacterForm({ ...characterForm, defaultVoiceId: e.target.value })} placeholder="Voice profile" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <button onClick={saveCharacter} disabled={!characterForm.displayName || !characterForm.archetype || !characterForm.description} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                    {editingCharacter ? "Save changes" : "Create person"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{editingLocation ? "Edit location" : "Add location"}</h2>
                  {editingLocation && <button onClick={() => { setEditingLocation(null); setLocationForm({ ...emptyLocation }); }} className="text-slate-400"><X className="h-4 w-4" /></button>}
                </div>
                <div className="mt-4 grid gap-3">
                  <input value={locationForm.displayName} onChange={(e) => setLocationForm({ ...locationForm, displayName: e.target.value })} placeholder="Location name" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <textarea value={locationForm.environmentBlock} onChange={(e) => setLocationForm({ ...locationForm, environmentBlock: e.target.value })} placeholder="Describe architecture, materials, lighting, atmosphere, geography…" className="min-h-36 rounded-xl border border-slate-200 p-3 text-sm" />
                  <input value={locationForm.establishingUri} onChange={(e) => setLocationForm({ ...locationForm, establishingUri: e.target.value })} placeholder="Reference image URL (optional)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <input value={locationForm.era} onChange={(e) => setLocationForm({ ...locationForm, era: e.target.value })} placeholder="Era (optional)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <input value={locationForm.timeOfDay} onChange={(e) => setLocationForm({ ...locationForm, timeOfDay: e.target.value })} placeholder="Time of day (optional)" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
                  <button onClick={saveLocation} disabled={!locationForm.displayName || !locationForm.environmentBlock} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                    {editingLocation ? "Save changes" : "Create location"}
                  </button>
                </div>
              </>
            )}
          </aside>

          <section>
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0,1,2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
              </div>
            ) : tab === "people" ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCharacters.map((character) => {
                  const defaultWardrobe = character.wardrobe?.find((item) => item.isDefault) || character.wardrobe?.[0];
                  const image = defaultWardrobe?.sheetUris?.[0];
                  return (
                    <article key={character.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="aspect-[4/3] bg-slate-100">
                        {image ? <img src={image} alt={character.displayName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><UserRound className="h-10 w-10" /></div>}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div><h2 className="font-semibold">{character.displayName}</h2><p className="mt-0.5 text-sm text-slate-500">{character.archetype}</p></div>
                          {character.validationStatus === "VALIDATED" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{character.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button onClick={() => startProjectWithAsset("character", character.id)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white">Start project</button>
                          <button onClick={() => { setEditingCharacter(character.id); setCharacterForm({ ...emptyCharacter, ...character }); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Edit</button>
                          <button onClick={() => setWardrobeTarget(character)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Upload className="mr-1 inline h-3.5 w-3.5" />Wardrobe</button>
                          <button onClick={() => remove("character", character.id)} className="rounded-xl border border-slate-200 px-2.5 py-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLocations.map((location) => (
                  <article key={location.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="aspect-[4/3] bg-slate-100">
                      {location.establishingUri ? <img src={location.establishingUri} alt={location.displayName} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><MapPin className="h-10 w-10" /></div>}
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold">{location.displayName}</h2>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{location.environmentBlock}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => startProjectWithAsset("location", location.id)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white">Start project</button>
                        <button onClick={() => { setEditingLocation(location.id); setLocationForm({ ...emptyLocation, ...location }); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Edit</button>
                        <button onClick={() => remove("location", location.id)} className="rounded-xl border border-slate-200 px-2.5 py-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {wardrobeTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase text-violet-600">Wardrobe / reference</p><h2 className="mt-1 text-xl font-semibold">{wardrobeTarget.displayName}</h2></div><button onClick={() => setWardrobeTarget(null)}><X className="h-5 w-5 text-slate-400" /></button></div>
            <input value={wardrobeLabel} onChange={(e) => setWardrobeLabel(e.target.value)} className="mt-5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Look name" />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readWardrobeFile(file).catch(() => setMessage("Could not read image.")); }} />
            <button onClick={() => fileRef.current?.click()} className="mt-3 flex h-28 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600">
              {wardrobeImage ? "Reference image attached" : <><Upload className="mr-2 h-4 w-4" />Upload reference image</>}
            </button>
            <button onClick={addWardrobe} className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Save wardrobe/reference</button>
          </div>
        </div>
      )}
    </main>
  );
}
