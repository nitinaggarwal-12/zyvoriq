"use client";

import React from "react";
import { Terminal, Cpu, GitPullRequest, ShieldCheck, ArrowUpRight, Sparkles, Building2, Users } from "lucide-react";

interface SolutionPath {
  id: string;
  badge: string;
  icon: any;
  title: string;
  description: string;
  deliverables: string[];
  cta: string;
}

const SOLUTIONS: SolutionPath[] = [
  {
    id: "architects",
    badge: "For Technical Leaders",
    icon: Terminal,
    title: "Engineering Thought Leadership & RFCs",
    description:
      "Transform complex distributed systems architectures, post-mortems, and Git pull requests into authoritative, evidence-backed whitepapers and diagrams.",
    deliverables: [
      "Zero-fluff technical deep dives",
      "Interactive SVG & Draw.io system topologies",
      "P99 latency & benchmark citations",
    ],
    cta: "Explore Architect Workflow",
  },
  {
    id: "founders",
    badge: "For Founders & Product Teams",
    icon: Cpu,
    title: "Zero-to-One Product Launches",
    description:
      "Convert PRD-000 blueprints, sprint release notes, and product roadmaps into high-impact executive announcements, video keynotes, and investor updates.",
    deliverables: [
      "Master product narrative",
      "Native Substack, LinkedIn & X campaigns",
      "Executive video storyboards & voice narration",
    ],
    cta: "Explore Founder Workflow",
  },
  {
    id: "devrel",
    badge: "For Developer Relations",
    icon: GitPullRequest,
    title: "API & Developer Education",
    description:
      "Turn code repositories and API references into verified code walkthroughs, tutorial series, and visual architectural cheat sheets.",
    deliverables: [
      "Syntax-verified code snippets",
      "Interactive multi-slide carousel guides",
      "Podcasts with procedural voice dubbing",
    ],
    cta: "Explore DevRel Workflow",
  },
  {
    id: "enterprise",
    badge: "For Enterprise Organizations",
    icon: Building2,
    title: "Governed Brand & Provenance Publishing",
    description:
      "Enforce QGV-001 quality gates across thousands of organizational artifacts with automated claim verification, RBAC, and cryptographic proof.",
    deliverables: [
      "100% Veritas factual auto-repair",
      "Strict TRU-001 provenance tracking",
      "Emergency kill-switch & policy governance",
    ],
    cta: "Explore Enterprise Workflow",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative mx-auto max-w-8xl px-6 md:px-12 lg:px-16 py-16 lg:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-300 border border-teal-500/20">
            <Users className="h-3.5 w-3.5" />
            <span>SOLUTIONS & DOMAIN PATHS</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Engineered for High-Stakes Creators
          </h2>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            One underlying intelligence engine. Tailored workflows for technical leaders, founders, developer advocates, and enterprise organizations.
          </p>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {SOLUTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between transition-all duration-300 hover:border-teal-500/40 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                    {item.badge}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white leading-snug">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.description}</p>

                <div className="mt-6 space-y-2 border-t border-slate-800/60 pt-4">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Core Outputs:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {item.deliverables.map((del, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-teal-400" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/60">
                <a
                  href="#director"
                  className="flex items-center justify-between text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors"
                >
                  <span>{item.cta}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
