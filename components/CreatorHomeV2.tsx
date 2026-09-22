"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart3, Clapperboard, FolderOpen, ImageIcon, Layers3,
  Mic2, Music2, Plus, Search, Sparkles, Upload, Users2, Video, Wand2
} from "lucide-react";

const formats = [
  { label: "Reel", href: "/reels", icon: Video, hint: "Short-form" },
  { label: "Video", href: "/studio", icon: Clapperboard, hint: "Cinematic" },
  { label: "Carousel", href: "/studio/create/carousel", icon: Layers3, hint: "Multi-slide" },
  { label: "Podcast", href: "/studio/create", icon: Mic2, hint: "Audio + video" },
  { label: "Music video", href: "/music-video", icon: Music2, hint: "Music-led" },
  { label: "Film", href: "/feature-films", icon: ImageIcon, hint: "Long-form" },
];

const templates = [
  { title: "Product Ad", subtitle: "Launch a product in seconds", href: "/reels" },
  { title: "Talking Avatar", subtitle: "Presenter-led social content", href: "/studio/avatars" },
  { title: "Explainer", subtitle: "Teach a concept clearly", href: "/studio/create" },
  { title: "Story", subtitle: "Narrative short video", href: "/motion-pictures" },
];

export function CreatorHomeV2() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-[#17181c]">
      <section className="mx-auto max-w-[1500px] px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-violet-600">Creator workspace</p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[#121319] sm:text-5xl">
              What do you want to create?
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              Turn an idea into video, audio, images, stories and social content with Zyvoriq.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <FolderOpen className="h-4 w-4" />
            Projects
          </Link>
        </div>

        <div className="rounded-[28px] border border-violet-100 bg-white p-3 shadow-[0_22px_70px_-35px_rgba(76,29,149,.28)] sm:p-4">
          <div className="rounded-[22px] border border-slate-200 bg-[#fbfbfd] p-4 sm:p-5">
            <textarea
              aria-label="Describe what you want to create"
              placeholder="Describe your idea… e.g. Create a cinematic 30-second launch reel for a luxury perfume in Santorini"
              className="min-h-28 w-full resize-none border-0 bg-transparent text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400"
            />
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Plus className="h-4 w-4" /> Add reference
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Upload className="h-4 w-4" /> Upload media
                </button>
              </div>
              <Link
                href="/reels"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                Generate <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {formats.map(({ label, href, icon: Icon, hint }) => (
            <Link
              key={label}
              href={href}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-slate-900">{label}</div>
              <div className="mt-1 text-xs text-slate-400">{hint}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Continue creating</h2>
            <p className="mt-1 text-sm text-slate-500">Pick up where you left off.</p>
          </div>
          <Link href="/my-reels" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Summer Campaign", "Reel · Draft", "from-amber-100 via-orange-50 to-white"],
            ["AI Explained", "Video · Rendering", "from-violet-100 via-indigo-50 to-white"],
            ["Jaipur Story", "Story · Draft", "from-rose-100 via-orange-50 to-white"],
            ["Product Launch", "Ad · Ready", "from-cyan-100 via-sky-50 to-white"],
          ].map(([title, meta, gradient], index) => (
            <Link key={title} href={index === 0 ? "/my-reels" : "/studio"} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`aspect-[16/9] bg-gradient-to-br ${gradient} p-5`}>
                <div className="flex h-full items-end justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-violet-600 shadow-sm backdrop-blur">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-600 backdrop-blur">00:{30 + index * 5}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-slate-900">{title}</div>
                <div className="mt-1 text-sm text-slate-500">{meta}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Start with a template</h2>
              <p className="mt-1 text-sm text-slate-500">Use a proven structure and make it yours.</p>
            </div>
            <Link href="/studio/create" className="text-sm font-semibold text-violet-600">Browse templates</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((item, i) => (
              <Link key={item.title} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {[Wand2, Users2, BarChart3, Clapperboard][i]({ className: "h-5 w-5" })}
                </div>
                <div className="font-semibold text-slate-900">{item.title}</div>
                <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
