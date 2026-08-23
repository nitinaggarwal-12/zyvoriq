"use client";

import React from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";

export default function DashboardPage() {
  const metrics = [
    {
      title: "Average Production Cycle Time",
      value: "84 sec",
      baseline: "72–120 hours (Legacy)",
      improvement: "99.2% Faster",
      icon: Clock,
      color: "text-teal-400",
    },
    {
      title: "First-Pass Veritas Quality Yield",
      value: "99.4%",
      baseline: "Manual revisions required",
      improvement: "VQS >= 90 Guaranteed",
      icon: ShieldCheck,
      color: "text-emerald-400",
    },
    {
      title: "Unit Cost per Campaign Package",
      value: "$0.82",
      baseline: "$150–$350 (Agency / Manual)",
      improvement: "99.5% Cost Reduction",
      icon: Zap,
      color: "text-indigo-400",
    },
    {
      title: "Total C2PA Verified Assets",
      value: "1,420",
      baseline: "0% Provenance Coverage",
      improvement: "100% Signed Ed25519",
      icon: Layers,
      color: "text-amber-400",
    },
  ];

  const recentCampaigns = [
    {
      id: "CMP-8492",
      title: "PostgreSQL 16 Quantum Engine Launch",
      modalities: ["Shorts (9:16)", "LinkedIn PDF", "X Thread", "Draw.io SVG"],
      vqs: 94.6,
      status: "Published & Verified",
      timestamp: "12 mins ago",
    },
    {
      id: "CMP-8491",
      title: "pgvector 1536-dim High-Scale Architecture",
      modalities: ["YouTube 1080p", "Podcast WAV", "Substack Article"],
      vqs: 96.2,
      status: "Published & Verified",
      timestamp: "2 hours ago",
    },
    {
      id: "CMP-8490",
      title: "Enterprise Multi-Tenant RLS Deep-Dive",
      modalities: ["Draw.io Diagram", "X Thread", "Video Storyboard"],
      vqs: 92.8,
      status: "Auto-Repaired (Loop 1)",
      timestamp: "5 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      <AppNavbar />

      <main className="mx-auto max-w-8xl px-6 py-8 md:px-12 md:py-10 lg:px-16">
        
        {/* Header Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
                Workspace Analytics &amp; Yield Intelligence
              </h1>
            </div>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-3xl">
              Real-time monitoring of multimodal campaign cycle times, first-pass Veritas quality pass rates, token burn rates, and model router unit economics.
            </p>
          </div>

          <Link
            href="/director"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:opacity-95"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>Launch New Swarm DAG</span>
          </Link>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                    <Icon className={`h-5 w-5 ${m.color}`} />
                  </div>
                  <div className="mt-4 font-mono text-3xl font-black text-white">{m.value}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{m.baseline}</span>
                  <span className="font-mono font-bold text-emerald-400">{m.improvement}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Campaigns Table */}
        <div className="mt-8 rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Layers className="h-4 w-4" />
              <span>Recent Multimodal Campaigns &amp; Provenance Records</span>
            </div>
            <span className="text-xs text-slate-400">Showing last 3 runs</span>
          </div>

          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="pb-3 font-mono">Campaign ID</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Synchronized Stems</th>
                  <th className="pb-3 font-mono">Veritas Score</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 font-mono font-bold text-teal-400">{camp.id}</td>
                    <td className="py-4 font-semibold text-white">{camp.title}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {camp.modalities.map((mod) => (
                          <span key={mod} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 font-mono font-bold text-emerald-300">{camp.vqs} / 100</td>
                    <td className="py-4">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono text-[11px]">{camp.timestamp}</td>
                    <td className="py-4 text-right">
                      <Link
                        href="/veritas"
                        className="inline-flex items-center gap-1 font-mono text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        <span>Audit</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
