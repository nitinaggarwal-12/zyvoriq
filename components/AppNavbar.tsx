"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  ShieldCheck, 
  Layers, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Lock, 
  Sliders, 
  ChevronDown, 
  Activity, 
  Zap, 
  ArrowUpRight,
  RefreshCw
} from "lucide-react";

export function AppNavbar() {
  const pathname = usePathname();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Enterprise Core (US-East)");

  const navItems = [
    { name: "Director Mission Control", href: "/director", icon: Terminal, badge: "Live Swarm" },
    { name: "Veritas QA Radar", href: "/veritas", icon: ShieldCheck, badge: "VQS 94.6" },
    { name: "Multimodal Studio", href: "/studio", icon: Layers, badge: "4-Pane" },
    { name: "Governance & Provenance", href: "/governance", icon: Lock, badge: "C2PA" },
    { name: "Analytics Dashboard", href: "/dashboard", icon: BarChart3, badge: "99.4%" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-obsidian-950/90 backdrop-blur-2xl transition-all duration-200">
      <div className="mx-auto flex h-20 max-w-8xl items-center justify-between px-6 md:px-12 lg:px-16">
        
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3.5" aria-label="Zyvoriq Home">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-obsidian-950 font-mono text-lg font-black text-teal-300">
                Z
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                ZYVORIQ<span className="text-teal-400">.</span>
                <span className="rounded bg-teal-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-400 border border-teal-800/50">
                  Engine
                </span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Autonomous Intelligence
              </span>
            </div>
          </Link>

          {/* Workspace Dropdown */}
          <div className="relative hidden xl:block">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-teal-500/50 hover:text-white transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeWorkspace}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-800 bg-obsidian-900 p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Workspace
                </div>
                {["Enterprise Core (US-East)", "Media Studio Labs (EU-West)", "FinTech Alpha Persona (Asia-South)"].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      activeWorkspace === ws
                        ? "bg-teal-500/10 text-teal-300 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Route Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                    isActive ? "bg-teal-400/20 text-teal-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Status Badges & Quick Action */}
        <div className="flex items-center gap-3.5">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-mono text-[11px] font-bold">9 Swarm Agents Online</span>
          </div>

          <Link
            href="/director"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-teal-500/20 hover:opacity-95 transition-opacity"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>New Brief</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
