"use client";

import React from "react";
import { ShieldCheck, GitBranch, Terminal, ArrowUpRight, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-obsidian-950/95 py-14 text-slate-400">
      <div className="mx-auto max-w-8xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#top" className="flex items-center gap-3 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-mono text-base font-black text-slate-950">
                Z
              </div>
              <span className="font-mono text-xl font-extrabold tracking-tight">
                ZYVORIQ<span className="text-teal-400">.</span>
              </span>
            </a>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              The AI-native idea-to-impact platform for creating, assuring, adapting, publishing, and continuously improving high-quality humanized content across channels.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-emerald-300">All 19 P0 Quality Gates Operational</span>
            </div>
          </div>

          {/* Col 2: Documentation Blueprint */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Controlled Blueprint
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#lifecycle" className="hover:text-teal-300 transition-colors">
                  QGV-001 Quality Governance
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-teal-300 transition-colors">
                  STR-001 Product Vision
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-teal-300 transition-colors">
                  BUS-001 Business Requirements
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-teal-300 transition-colors">
                  PRD-000 Master PRD
                </a>
              </li>
              <li>
                <a href="#lifecycle" className="hover:text-teal-300 transition-colors">
                  ARC-001 High-Level Design
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform & Core Engines */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Core Architecture
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#director" className="hover:text-teal-300 transition-colors">
                  PRD-101 Universal Director
                </a>
              </li>
              <li>
                <a href="#director" className="hover:text-teal-300 transition-colors">
                  PRD-102 Persona & Memory
                </a>
              </li>
              <li>
                <a href="#veritas" className="hover:text-teal-300 transition-colors">
                  PRD-108 Veritas Auto-Repair
                </a>
              </li>
              <li>
                <a href="#multimodal" className="hover:text-teal-300 transition-colors">
                  PRD-104-107 Multimodal Suite
                </a>
              </li>
              <li>
                <a href="#autonomy" className="hover:text-teal-300 transition-colors">
                  AUT-001 Policy Controls
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Repository & Legal */}
          <div className="space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Repository & Trust
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/nitinaggarwal-12/zyvoriq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-teal-300 transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="#veritas" className="hover:text-teal-300 transition-colors">
                  TRU-001 Provenance & Rights
                </a>
              </li>
              <li>
                <a href="#waitlist" className="hover:text-teal-300 transition-colors">
                  Early Cohort Access
                </a>
              </li>
              <li>
                <a href="#top" className="hover:text-teal-300 transition-colors">
                  System Architecture v1.0
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>© 2026 Zyvoriq Platform Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Vision → Requirement → Design → Evidence → Impact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
