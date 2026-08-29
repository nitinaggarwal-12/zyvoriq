"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowUpRight, Menu, X, Terminal, Layers, Lock, BarChart3, Key } from "lucide-react";
import { ApiKeyModal } from "@/components/ApiKeyModal";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-obsidian-950/85 backdrop-blur-2xl transition-all duration-200">
      <div className="mx-auto flex h-20 w-full max-w-[1720px] items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          href="/"
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
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-4 text-sm font-medium text-slate-300 lg:flex" aria-label="Primary navigation">
          <Link
            href="/director"
            className="flex items-center gap-2 rounded-xl px-4 py-2 hover:text-teal-300 hover:bg-slate-800/40 transition-all font-semibold"
          >
            <Terminal className="h-4 w-4 text-teal-400/80" />
            <span>Director Console</span>
          </Link>
          <Link
            href="/veritas"
            className="flex items-center gap-2 rounded-xl px-4 py-2 hover:text-emerald-300 hover:bg-slate-800/40 transition-all font-semibold"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
            <span>Veritas QA</span>
          </Link>
          <Link
            href="/studio"
            className="flex items-center gap-2 rounded-xl px-4 py-2 hover:text-indigo-300 hover:bg-slate-800/40 transition-all font-semibold"
          >
            <Layers className="h-4 w-4 text-indigo-400/80" />
            <span>Multimodal Studio</span>
          </Link>
          <Link
            href="/governance"
            className="flex items-center gap-2 rounded-xl px-4 py-2 hover:text-amber-300 hover:bg-slate-800/40 transition-all font-semibold"
          >
            <Lock className="h-4 w-4 text-amber-400/80" />
            <span>Governance</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-4 py-2 hover:text-teal-300 hover:bg-slate-800/40 transition-all font-semibold"
          >
            <BarChart3 className="h-4 w-4 text-teal-400/80" />
            <span>Analytics</span>
          </Link>
        </nav>

        {/* Action Controls & Live Status */}
        <div className="hidden items-center gap-4 sm:flex">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs">VQC Governed</span>
          </div>

          {/* API Key Manager Button */}
          <button
            type="button"
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 px-3.5 py-2 text-xs font-bold text-amber-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Google Gemini & Veo Multi-Key Pool Manager"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs hidden sm:inline">API Keys</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <Link
            href="/studio"
            className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur transition-all duration-200 hover:border-slate-600 hover:bg-slate-800"
          >
            Studio
          </Link>

          <Link
            href="/studio"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-teal-500/30 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch Cinema Studio</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-obsidian-950/98 px-6 py-6 backdrop-blur-2xl lg:hidden" id="mobile-menu">
          <div className="space-y-4">
            <Link
              href="/director"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-teal-300"
            >
              <Terminal className="h-5 w-5 text-teal-400" />
              Director Console
            </Link>
            <Link
              href="/veritas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-emerald-300"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Veritas QA Inspector
            </Link>
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-indigo-300"
            >
              <Layers className="h-5 w-5 text-indigo-400" />
              Multimodal Studio
            </Link>
            <Link
              href="/governance"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-amber-300"
            >
              <Lock className="h-5 w-5 text-amber-400" />
              Governance &amp; C2PA
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-base font-semibold text-slate-200 hover:bg-slate-800/80 hover:text-teal-300"
            >
              <BarChart3 className="h-5 w-5 text-teal-400" />
              Analytics Dashboard
            </Link>
            <div className="pt-4">
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 py-3 text-center text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Cinema Studio</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Google Gemini & Veo Multi-Key Load Balancer Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </header>
  );
}
