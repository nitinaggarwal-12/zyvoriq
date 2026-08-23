"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck, ArrowUpRight, Menu, X, Terminal, BookOpen } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-obsidian-950/85 backdrop-blur-2xl transition-all duration-200">
      <div className="mx-auto flex h-20 max-w-8xl items-center justify-between px-6 md:px-12 lg:px-16">
        {/* Brand */}
        <a
          href="#top"
          className="group flex items-center gap-3.5 text-slate-100 transition-opacity hover:opacity-90"
          aria-label="Zyvoriq home"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-obsidian-950 font-mono text-lg font-black text-teal-300">
              Z
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xl font-extrabold tracking-tight text-white">
              ZYVORIQ<span className="text-teal-400">.</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Autonomous Intelligence
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex" aria-label="Primary navigation">
          <a
            href="#director"
            className="flex items-center gap-1.5 transition-colors hover:text-teal-300"
          >
            <Terminal className="h-4 w-4 text-teal-400/80" />
            Director Console
          </a>
          <a
            href="#lifecycle"
            className="transition-colors hover:text-teal-300"
          >
            Lifecycle Architecture
          </a>
          <a
            href="#veritas"
            className="flex items-center gap-1.5 transition-colors hover:text-teal-300"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
            Veritas QA
          </a>
          <a
            href="#multimodal"
            className="transition-colors hover:text-teal-300"
          >
            Multimodal Studio
          </a>
          <a
            href="#autonomy"
            className="transition-colors hover:text-teal-300"
          >
            Autonomy Policy
          </a>
          <a
            href="#use-cases"
            className="transition-colors hover:text-teal-300"
          >
            Solutions
          </a>
        </nav>

        {/* Action Controls & Live Status */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>QGV-001 Governed</span>
          </div>

          <a
            href="#waitlist"
            className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur transition-all duration-200 hover:border-slate-600 hover:bg-slate-800"
          >
            Join Early Access
          </a>

          <a
            href="#director"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-teal-500/30 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch Director</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-obsidian-950/95 px-6 py-6 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-col gap-4 text-base font-semibold text-slate-200">
            <a
              href="#director"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-teal-300"
            >
              <Terminal className="h-4 w-4" /> Director Console
            </a>
            <a
              href="#lifecycle"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-teal-300"
            >
              Lifecycle Architecture
            </a>
            <a
              href="#veritas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 hover:text-teal-300"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Veritas QA Gate
            </a>
            <a
              href="#multimodal"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-teal-300"
            >
              Multimodal Studio
            </a>
            <a
              href="#autonomy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-teal-300"
            >
              Autonomy Policy
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-teal-300"
            >
              Solutions
            </a>
            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-800">
              <a
                href="#director"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 py-3 text-center text-xs font-black uppercase text-slate-950"
              >
                Launch Director Console
              </a>
              <a
                href="#waitlist"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-900 py-3 text-center text-xs font-bold uppercase text-slate-200"
              >
                Request Early Access
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
