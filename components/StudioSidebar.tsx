"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Sparkles,
  TrendingUp,
  BookOpen,
  Users,
  Film,
  Trophy,
  Smile,
  Zap,
  Flame,
  ShoppingBag,
  Compass,
  Briefcase,
  Dumbbell,
  Building2,
  Plane,
  GraduationCap,
  Stethoscope,
  Moon,
  Key,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Grid3X3,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Clapperboard
} from "lucide-react";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { useTheme } from "@/components/ThemeProvider";

interface StudioSidebarProps {
  children?: React.ReactNode;
  currentPath?: string;
}

export function StudioSidebar({ children, currentPath }: StudioSidebarProps) {
  const routerPath = usePathname();
  const pathname = currentPath || routerPath;
  const { resolvedTheme, toggleTheme } = useTheme();

  // Desktop collapsed state initialized from localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile Bottom Sheet state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zyvoriq_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileSheetOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("zyvoriq_sidebar_collapsed", String(nextState));
  };

  const CORE_STUDIO_LINKS = [
    { name: "Cinema Originals", href: "/studio/cinema", icon: Clapperboard, badge: "Originals" },
    { name: "Quality Audit", href: "/studio/cinema/audit", icon: ShieldCheck, badge: "Triage" },
    { name: "Cinema Timeline", href: "/studio", icon: Layers, badge: "Editor" },
    { name: "Content Inspector", href: "/studio/inspector", icon: Film, badge: "QA" },
    { name: "Creation Hub", href: "/studio/create", icon: Sparkles, badge: "14 Suites" },
    { name: "Director Swarm", href: "/director", icon: Terminal, badge: "DAG" },
    { name: "Avatars & 3D Cast", href: "/studio/avatars", icon: Users },
    { name: "Original Books", href: "/studio/books", icon: BookOpen },
    { name: "7-Day Trend Radar", href: "/studio/trend-radar", icon: TrendingUp },
    { name: "Media Library", href: "/studio/library", icon: Film },
    { name: "Creator Analytics", href: "/creator/analytics", icon: Trophy }
  ];

  const isLinkActive = (href: string) => {
    if (href === "/studio") {
      return pathname === "/studio" || pathname.startsWith("/studio/production");
    }
    if (href === "/studio/cinema") {
      return pathname === "/studio/cinema";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentSectionTitle = () => {
    if (pathname.includes("/studio/cinema/audit")) return "Director's Quality Audit";
    if (pathname.includes("/studio/cinema")) return "Cinema Originals";
    if (pathname.includes("/director")) return "Director Swarm";
    if (pathname.includes("/trend-radar")) return "7-Day Trend Radar";
    if (pathname.includes("/creator/analytics")) return "Creator Growth";
    if (pathname.includes("/create/carousel")) return "B2B Carousels";
    if (pathname.includes("/create/ugc")) return "E-Com UGC Ads";
    if (pathname.includes("/create/animation")) return "Kids & Animation";
    if (pathname.includes("/create/comics")) return "Anime & Manga";
    if (pathname.includes("/create/reel")) return "Viral Reels";
    if (pathname === "/studio/create") return "Creation Hub";
    if (pathname === "/studio") return "Studio Cinema";
    if (pathname.includes("/studio/avatars")) return "Avatars & Cast";
    if (pathname.includes("/studio/library")) return "Media Library";
    return "Studio Hub";
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-obsidian-950 text-slate-100 selection:bg-teal-500/30 w-full overflow-x-hidden pb-20 md:pb-0">
      {/* 1. DESKTOP / TABLET COLLAPSIBLE SIDEBAR (Hidden on Mobile) */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-slate-800/80 bg-obsidian-950/95 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Top Brand Header */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-800/70">
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-mono text-xs font-black text-obsidian-950 shadow-md shadow-teal-500/20">
                Z
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-sm font-extrabold tracking-tight text-white truncate">
                  ZYVORIQ<span className="text-teal-400">.</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                  Studio Matrix
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-mono text-xs font-black text-obsidian-950 shadow-md">
              Z
            </Link>
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Sidebar (Cmd+B)" : "Collapse Sidebar (Cmd+B)"}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white transition ${
              isCollapsed ? "mx-auto mt-1" : ""
            }`}
          >
            {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 custom-scrollbar">
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                Studio Engines
              </div>
            )}
            {CORE_STUDIO_LINKS.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "border border-teal-500/30 bg-teal-500/15 text-teal-300 shadow-sm"
                      : "text-slate-400 hover:border-white/5 hover:bg-white/[0.04] hover:text-slate-200"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-teal-400" : "text-slate-400"}`} />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Status & Settings Dock */}
        <div className="border-t border-slate-800/70 p-2 space-y-1 bg-black/40">
          <button
            type="button"
            onClick={() => setApiKeyModalOpen(true)}
            title={isCollapsed ? "API Keys" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <Key className="h-4 w-4 shrink-0 text-amber-400" />
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span className="font-mono text-[11px]">API Keys Pool</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={isCollapsed ? "Toggle Theme" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] transition ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-indigo-400" />
            )}
            {!isCollapsed && <span className="text-[11px]">Theme: {resolvedTheme === "dark" ? "Cinema" : "Daylight"}</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT (Full Width on Mobile, Padded on Desktop) */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${
          isCollapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {/* CLEAN MINIMAL STUDIO APP HEADER */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-obsidian-950/90 px-4 sm:px-6 lg:px-8 backdrop-blur-2xl transition-all">
          {/* Left: Section Title & Cluster Status */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex md:hidden items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 font-mono text-xs font-black text-obsidian-950 shadow-md">
                Z
              </div>
            </Link>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm font-extrabold text-white font-mono uppercase tracking-tight truncate">
                {currentSectionTitle()}
              </span>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise Core · 9 Swarms</span>
              </div>
            </div>
          </div>

          {/* Right: Clean Minimal Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-mono font-bold text-amber-300 hover:bg-amber-500/20 transition"
              title="API Keys Vault"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Keys</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-mono font-bold text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span>SSO: Nitin (21+ Verified)</span>
            </div>

            <Link
              href="/director"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-300 hover:to-emerald-400 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LAUNCH SWARM</span>
              <span className="sm:hidden">Swarm</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 w-full max-w-full">{children}</div>
      </div>

      {/* 3. NATIVE MOBILE BOTTOM TAB BAR (iOS / Android Navigation) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-800/90 bg-obsidian-950/95 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Tab 1: Cinema */}
          <Link
            href="/studio"
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-all ${
              pathname === "/studio" ? "text-teal-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Cinema</span>
          </Link>

          {/* Tab 2: Create (Hero Tab) */}
          <Link
            href="/studio/create"
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-all ${
              pathname === "/studio/create" ? "text-teal-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${pathname === "/studio/create" ? "bg-teal-500/20 text-teal-300" : ""}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Create</span>
          </Link>

          {/* Tab 3: Avatars & 3D Cast */}
          <Link
            href="/studio/avatars"
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-all ${
              pathname.includes("/avatars") ? "text-teal-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Avatars</span>
          </Link>

          {/* Tab 4: Media Library */}
          <Link
            href="/studio/library"
            className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-all ${
              pathname.includes("/library") ? "text-teal-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Film className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Library</span>
          </Link>

          {/* Tab 5: 14-Persona Sheet Trigger */}
          <button
            type="button"
            onClick={() => setMobileSheetOpen(true)}
            className="flex flex-col items-center justify-center gap-1 h-full py-1 text-center text-amber-400 hover:text-amber-300 transition-all"
          >
            <Grid3X3 className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight">14 Personas</span>
          </button>
        </div>
      </nav>

      {/* 4. NATIVE iOS/ANDROID ACTION BOTTOM SHEET */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileSheetOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Sheet Container with iOS rounded grabber handle */}
          <div className="relative w-full max-h-[85vh] bg-obsidian-950 border-t border-slate-800 rounded-t-3xl p-5 flex flex-col z-50 shadow-2xl overflow-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {/* Grabber Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300">
                  <Grid3X3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                  14-Persona Studio Suite
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="p-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Personas List Grid */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CORE_STUDIO_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSheetOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        active
                          ? "border-teal-500 bg-teal-500/20 text-white shadow-md"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-none">{item.name}</div>
                          {item.badge && <div className="text-[10px] text-teal-400 mt-1 font-mono">{item.badge}</div>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  );
                })}
              </div>

              {/* Additional Studio Actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <Link
                  href="/studio/books"
                  onClick={() => setMobileSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Original Book Studio</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/studio/trend-radar"
                  onClick={() => setMobileSheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span>7-Day Trend Radar</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <ApiKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  );
}
