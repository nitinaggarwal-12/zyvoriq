"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clapperboard,
  ImageIcon,
  Layers3,
  Loader2,
  Mic2,
  Music2,
  Sparkles,
  Upload,
  Users2,
  Video,
} from "lucide-react";

const formats = [
  { id: "reel", title: "Reel", desc: "60-second vertical social video", icon: Video, supported: true },
  { id: "music-video", title: "Music Video", desc: "60-second cinematic music-led master", icon: Music2, supported: true },
  { id: "story-video", title: "Story Video", desc: "60-second narrative visual story", icon: ImageIcon, supported: true },
  { id: "short-video", title: "Short Video", desc: "Variable-duration social video", icon: Clapperboard, supported: false },
  { id: "carousel", title: "Carousel", desc: "Multi-page social story", icon: Layers3, supported: false },
  { id: "talking-ai", title: "Talking AI", desc: "Avatar-led video", icon: Users2, supported: false },
  { id: "podcast", title: "Podcast", desc: "Audio or video podcast", icon: Mic2, supported: false },
  { id: "film", title: "Film", desc: "Long-form cinematic project", icon: Sparkles, supported: false },
];

interface ReferenceMedia {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export default function CreatePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [format, setFormat] = useState("reel");
  const [brief, setBrief] = useState("");
  const [referenceMedia, setReferenceMedia] = useState<ReferenceMedia[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function addReference(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("Reference files are limited to 5 MB each in the current workspace.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read reference file"));
      reader.readAsDataURL(file);
    });
    setReferenceMedia((current) => [
      ...current,
      { name: file.name, type: file.type, size: file.size, dataUrl },
    ].slice(0, 4));
  }

  async function continueToStudio() {
    setCreating(true);
    setError("");
    try {
      const selected = formats.find((item) => item.id === format);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: brief.trim() ? brief.trim().slice(0, 72) : `Untitled ${selected?.title || "project"}`,
          format,
          stage: "brief",
          status: "draft",
          brief,
          referenceMedia,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.project?.id) {
        throw new Error(data?.error || "Could not create project");
      }
      router.push(`/swarm?project=${encodeURIComponent(data.project.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create project.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-5 py-10 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-violet-600">Create</p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em]">What do you want to make?</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-500">
          Choose an output, describe the outcome, and add references. Zyvoriq keeps this as one project from brief through publishing.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map(({ id, title, desc, icon: Icon, supported }) => {
            const active = format === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!supported}
                onClick={() => supported && setFormat(id)}
                className={`group relative rounded-2xl border p-5 text-left shadow-sm transition ${
                  supported ? "hover:-translate-y-0.5 hover:shadow-lg" : "cursor-not-allowed opacity-55"
                } ${
                  active ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-violet-200"
                }`}
              >
                {!supported && <span className="absolute right-3 top-3 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Coming next</span>}
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  active ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 font-semibold">{title}</div>
                <div className="mt-1 text-sm text-slate-500">{desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <label className="text-sm font-semibold text-slate-700">Creative brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfbfd] p-4 text-base outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            placeholder="A 30-second cinematic Instagram reel for a luxury perfume brand in Santorini…"
          />

          {referenceMedia.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {referenceMedia.map((item, index) => (
                <div key={item.name + index} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="truncate text-slate-700">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => setReferenceMedia((current) => current.filter((_, i) => i !== index))}
                    className="ml-3 text-xs font-semibold text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addReference(file).catch(() => setError("Could not attach the reference file."));
              e.currentTarget.value = "";
            }}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" /> Add reference
              </button>
              <button
                type="button"
                onClick={() => router.push("/assets?tab=people")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Users2 className="h-4 w-4" /> Manage people
              </button>
            </div>
            <button
              type="button"
              onClick={continueToStudio}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue to Studio <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        </div>
      </div>
    </main>
  );
}
