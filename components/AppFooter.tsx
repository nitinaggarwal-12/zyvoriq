"use client";

import React from "react";
import Link from "next/link";
import { Film, Lock, ShieldCheck } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="w-full border-t border-white/[0.07] bg-[#09090B] text-slate-400">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-7 px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-violet-400/25 bg-violet-500/10 text-violet-300">
                <Film className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold tracking-[0.14em] text-white">ZYVORIQ</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              One creative workspace for generating, refining, organizing, and publishing AI video.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Create</p>
              <Link href="/reels" className="block hover:text-white">Social video</Link>
              <Link href="/yt" className="block hover:text-white">Music video</Link>
              <Link href="/feature-films" className="block hover:text-white">Film</Link>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspace</p>
              <Link href="/my-reels" className="block hover:text-white">Projects</Link>
              <Link href="/characters" className="block hover:text-white">Characters</Link>
              <Link href="/locations" className="block hover:text-white">Locations</Link>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Support</p>
              <Link href="/contact" className="block hover:text-white">Contact</Link>
              <Link href="/privacy" className="block hover:text-white">Privacy</Link>
              <Link href="/terms" className="block hover:text-white">Terms</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Zyvoriq. AI-generated outputs remain subject to creator review.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Provenance aware
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Creator controls
            </span>
            <Link href="/dmca" className="hover:text-slate-300">DMCA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
