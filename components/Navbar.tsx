"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, PlayCircle, Layers, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    ["Omni Director", "/#hero-director"],
    ["180s Master Film", "/#master-showcase"],
    ["Architecture", "/#architecture"],
    ["Genres", "/#genres"],
    ["Provenance", "/#architecture"],
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-obsidian-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1760px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5">
        <Link href="/" className="flex items-center gap-3" aria-label="Zyvoriq home">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-orange-300 to-teal-300 shadow-lg shadow-pink-500/10">
            <span className="text-lg font-black text-slate-950">Z</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-[-0.03em] text-white">Zyvoriq</div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-teal-400 font-mono">Autonomous Intelligence</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <a key={label} href={href} className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <a href="/#master-showcase" className="hidden items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-300 transition hover:text-white xl:flex">
            <PlayCircle className="h-4 w-4 text-teal-300" /> Watch 180s Master
          </a>
          <a href="/#hero-director" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-black text-obsidian-950 transition hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-teal-500/20">
            <Sparkles className="h-4 w-4 fill-current" /> Direct Cinema Master
          </a>
        </div>

        <button type="button" className="rounded-xl p-2.5 text-slate-300 hover:bg-white/5 lg:hidden" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-obsidian-950 px-6 py-5 lg:hidden">
          <div className="space-y-2">
            {nav.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-200 hover:bg-white/5">
                {label}
              </a>
            ))}
            <a href="/#master-showcase" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-semibold text-teal-300 hover:bg-white/5">
              <PlayCircle className="h-5 w-5" /> Watch 180s Master
            </a>
            <a href="/#hero-director" onClick={() => setMobileMenuOpen(false)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 py-3.5 text-sm font-black text-obsidian-950 shadow-md shadow-teal-500/20">
              <Sparkles className="h-4 w-4 fill-current" /> Direct Cinema Master
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
