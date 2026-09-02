"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, PlayCircle, Library } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    ["Reel Studio", "/studio"],
    ["Creator Growth", "/creator/analytics"],
    ["Library", "/studio/library"],
    ["How it works", "#multimodal"],
    ["Trust", "/veritas"],
    ["For teams", "/governance"],
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-obsidian-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Zyvoriq home">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-300 via-orange-200 to-teal-300 shadow-lg shadow-pink-500/10">
            <span className="text-lg font-black text-slate-950">Z</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-[-0.03em] text-white">Zyvoriq</div>
            <div className="text-[11px] font-medium tracking-wide text-slate-500">AI Reel Studio</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/studio/library" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white md:flex">
            <Library className="h-4 w-4" /> Library
          </Link>
          <a href="#reel-demo" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white xl:flex">
            <PlayCircle className="h-4 w-4" /> See demo
          </a>
          <Link href="/studio" className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-950 transition hover:scale-[1.02] active:scale-[0.98]">
            <Sparkles className="h-4 w-4" /> Create a Reel
          </Link>
        </div>

        <button type="button" className="rounded-xl p-2.5 text-slate-300 hover:bg-white/5 lg:hidden" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 bg-obsidian-950 px-6 py-5 lg:hidden">
          <div className="space-y-2">
            {nav.map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-200 hover:bg-white/5">
                {label}
              </Link>
            ))}
            <Link href="/studio" onClick={() => setMobileMenuOpen(false)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black text-slate-950">
              <Sparkles className="h-4 w-4" /> Create a Reel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
