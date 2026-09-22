"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";

interface Character {
  id: string;
  displayName: string;
  archetype: string;
  description: string;
  country?: string;
  language?: string;
  validationStatus?: string;
  wardrobe?: Array<{ sheetUris?: string[]; isDefault?: boolean }>;
}

interface Location {
  id: string;
  displayName: string;
  environmentBlock: string;
  establishingUri?: string;
  era?: string;
  timeOfDay?: string;
}

export default function AssetsPage() {
  const [tab, setTab] = useState<"people" | "locations">("people");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const requested = new URLSearchParams(window.location.search).get("tab");
      if (requested === "locations") setTab("locations");
    }
    Promise.all([
      fetch("/api/library/characters").then((r) => r.json()),
      fetch("/api/library/locations").then((r) => r.json()),
    ])
      .then(([c, l]) => {
        setCharacters(Array.isArray(c?.characters) ? c.characters : []);
        setLocations(Array.isArray(l?.locations) ? l.locations : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCharacters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter((c) =>
      `${c.displayName} ${c.archetype} ${c.description} ${c.country || ""} ${c.language || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [characters, query]);

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) =>
      `${l.displayName} ${l.environmentBlock} ${l.era || ""} ${l.timeOfDay || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [locations, query]);

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="border-b border-slate-200 pb-7">
          <p className="text-sm font-semibold text-violet-600">Assets</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Your reusable creative library</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            Save people and locations once, then reuse them directly inside Studio for consistent generations.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("people")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "people" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <UsersRound className="h-4 w-4" />
              People
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "people" ? "bg-white/15" : "bg-slate-100"}`}>{characters.length}</span>
            </button>
            <button
              onClick={() => setTab("locations")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "locations" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <MapPin className="h-4 w-4" />
              Locations
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "locations" ? "bg-white/15" : "bg-slate-100"}`}>{locations.length}</span>
            </button>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "people" ? "Search people, country, language..." : "Search locations, era, time..."}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
          </div>
        ) : tab === "people" ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCharacters.map((character) => {
              const wardrobe = character.wardrobe?.find((w) => w.isDefault) || character.wardrobe?.[0];
              const image = wardrobe?.sheetUris?.[0];
              return (
                <article key={character.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100">
                    {image ? <img src={image} alt={character.displayName} className="h-full w-full object-cover" /> : (
                      <div className="flex h-full items-center justify-center text-slate-400"><UserRound className="h-10 w-10" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">{character.displayName}</h2>
                        <p className="mt-0.5 text-sm text-slate-500">{character.archetype}</p>
                      </div>
                      {character.validationStatus === "VALIDATED" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{character.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {character.country && <span className="rounded-full bg-slate-100 px-2.5 py-1">{character.country}</span>}
                      {character.language && <span className="rounded-full bg-slate-100 px-2.5 py-1">{character.language}</span>}
                    </div>
                    <a href={`/swarm?character=${encodeURIComponent(character.id)}`} className="mt-4 block rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700">
                      Use in Studio
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLocations.map((location) => (
              <article key={location.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-100">
                  {location.establishingUri ? <img src={location.establishingUri} alt={location.displayName} className="h-full w-full object-cover" /> : (
                    <div className="flex h-full items-center justify-center text-slate-400"><MapPin className="h-10 w-10" /></div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-slate-900">{location.displayName}</h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{location.environmentBlock}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    {location.era && <span className="rounded-full bg-slate-100 px-2.5 py-1">{location.era}</span>}
                    {location.timeOfDay && <span className="rounded-full bg-slate-100 px-2.5 py-1">{location.timeOfDay}</span>}
                  </div>
                  <a href={`/swarm?location=${encodeURIComponent(location.id)}`} className="mt-4 block rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700">
                    Use in Studio
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
