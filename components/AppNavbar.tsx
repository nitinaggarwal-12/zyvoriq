"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  Sparkles, 
  Lock, 
  ChevronDown, 
  Menu,
  X,
  ChevronRight
} from "lucide-react";

export function AppNavbar() {
  const pathname = usePathname();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Enterprise Core (US-East)");

  const navItems = [
    { name: "Director", href: "/director", icon: Terminal },
    { name: "Veritas QA", href: "/veritas", icon: ShieldCheck },
    { name: "Studio", href: "/studio", icon: Layers },
    { name: "Governance", href: "/governance", icon: Lock },
    { name: "Analytics", href: "/dashboard", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-obsidian-950/85 backdrop-blur-2xl transition-all duration-200">
      <div className="mx-auto flex h-20 w-full max-w-[1720px] items-center justify-between px-6 sm:px-8 lg:px-12">
        
        {/* LEFT: Brand & Workspace Switcher */}
        <div className="flex items-center gap-5 sm:gap-8">
          <Link href="/" className="group flex items-center gap-3.5" aria-label="Zyvoriq Home">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-obsidian-950 font-mono text-lg font-black text-teal-300">
                Z
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ZYVORIQ<span className="text-teal-400">.</span>
                <span className="rounded bg-teal-950/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 border border-teal-800/50">
                  Engine
                </span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Autonomous Intelligence
              </span>
            </div>
          </Link>

          {/* Workspace Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs">{activeWorkspace}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-slate-800 bg-obsidian-900/95 p-2.5 shadow-2xl backdrop-blur-2xl z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Active Workspace
                </div>
                {["Enterprise Core (US-East)", "Media Studio Labs (EU-West)", "FinTech Alpha Persona (Asia-South)"].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-colors ${
                      activeWorkspace === ws
                        ? "bg-teal-500/15 text-teal-300 font-bold"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
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

        {/* CENTER: Clean Spacious Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-1.5 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/40 shadow-sm font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Live Swarm Badge & Primary Action CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold">9 Swarms Active</span>
          </div>

          <Link
            href="/director"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>Launch Swarm</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-obsidian-950/98 px-6 py-6 backdrop-blur-2xl">
          <div className="flex flex-col gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
