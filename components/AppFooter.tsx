"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  BookOpen,
  Users,
  BarChart3,
  Film,
  Award,
  Globe,
  CheckCircle2,
  FileText
} from "lucide-react";

export function AppFooter() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-obsidian-950/90 text-slate-400 text-xs backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-8 lg:px-12 py-12 space-y-10">
        
        {/* Top 4-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & C2PA Provenance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 font-mono font-black text-obsidian-950 text-base">
                Z
              </div>
              <span className="font-mono text-lg font-extrabold text-white tracking-tight">
                ZYVORIQ<span className="text-teal-400">.</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Next-generation autonomous omni-modal creation suite. Native Veo 3.1 video, DeepMind neural voiceover, 7-Day Trend Radar & Original Book Authoring.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              C2PA PROVENANCE & SYNTHID VERIFIED
            </div>
          </div>

          {/* Col 2: Studio Creation Engines */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              Creation Studios
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/studio" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Studio Cinema Stage
                </Link>
              </li>
              <li>
                <Link href="/studio/trend-radar" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> 7-Day Predictive Trend Radar
                </Link>
              </li>
              <li>
                <Link href="/studio/books" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Original Book & Transmedia Studio
                </Link>
              </li>
              <li>
                <Link href="/studio/avatars" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Avatars, 3D Cast & Dubbing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quality, Trust & Governance */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              Trust & Quality Assurance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/governance/benchmarks" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> 40-Point App Benchmark Matrix
                </Link>
              </li>
              <li>
                <Link href="/veritas" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Veritas zk-SNARK QA Certificates
                </Link>
              </li>
              <li>
                <Link href="/governance" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Enterprise Governance & Audits
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Executive Telemetry & SLAs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal, Compliance & Regional Shield */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200">
              Legal & Compliance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Terms of Service & Commercial Rights
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Privacy Policy (GDPR, CCPA, BIPA)
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> DMCA & Copyright Safe Harbor
                </Link>
              </li>
              <li>
                <Link href="/veritas" className="hover:text-teal-300 transition-colors flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> EU AI Act & Watermarking Disclosure
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Disclaimer & Copyright Line */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p>© 2026 Zyvoriq Engine. All rights reserved. Built with C2PA open metadata provenance standards.</p>
            <p className="mt-1 text-[10px] text-slate-400">
              Disclaimer: Synthetic video and neural audio outputs are generated using artificial intelligence and are subject to human editorial review.
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/dmca" className="hover:underline">DMCA</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
