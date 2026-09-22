"use client";

import Link from "next/link";
import { ArrowRight, Clapperboard, ImageIcon, Layers3, Mic2, Music2, Sparkles, Upload, Users2, Video } from "lucide-react";

const formats = [
  { title: "Reel", desc: "Short-form vertical video", href: "/reels", icon: Video },
  { title: "Short Video", desc: "Social-first video", href: "/reels", icon: Clapperboard },
  { title: "Carousel", desc: "Multi-page social story", href: "/studio/create/carousel", icon: Layers3 },
  { title: "Talking AI", desc: "Avatar-led video", href: "/studio/avatars", icon: Users2 },
  { title: "Podcast", desc: "Audio or video podcast", href: "/studio/create", icon: Mic2 },
  { title: "Music Video", desc: "Music-led cinematic video", href: "/music-video", icon: Music2 },
  { title: "Story", desc: "Narrative visual storytelling", href: "/motion-pictures", icon: ImageIcon },
  { title: "Film", desc: "Long-form cinematic project", href: "/feature-films", icon: Sparkles },
];

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-10 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-violet-600">Create</p>
        <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em]">Create something new</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-500">
          Start with the outcome you want. Zyvoriq will handle the underlying models, routing and generation pipeline.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map(({ title, desc, href, icon: Icon }) => (
            <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 font-semibold">{title}</div>
              <div className="mt-1 text-sm text-slate-500">{desc}</div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <label className="text-sm font-semibold text-slate-700">Describe your idea</label>
          <textarea
            className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-[#fbfbfd] p-4 text-base outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            placeholder="A 30-second cinematic Instagram reel for a luxury perfume brand in Santorini…"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Upload className="h-4 w-4" /> Upload media
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Users2 className="h-4 w-4" /> Add person
              </button>
            </div>
            <Link href="/reels" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              Continue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
