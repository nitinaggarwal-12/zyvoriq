"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type StudioWorkflowMode = "create" | "published" | "wip";

export function LeftIconRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<StudioWorkflowMode>("create");

  useEffect(() => {
    const widthPx = collapsed ? "56px" : "216px";
    document.documentElement.style.setProperty("--left-nav-width", widthPx);
  }, [collapsed]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ mode: StudioWorkflowMode }>;
      if (ce.detail?.mode) setActiveMode(ce.detail.mode);
    };
    window.addEventListener("zyvoriq-workflow-changed", handleSync);
    return () => window.removeEventListener("zyvoriq-workflow-changed", handleSync);
  }, []);

  const triggerWorkflow = (mode: StudioWorkflowMode) => {
    setActiveMode(mode);
    if (pathname !== "/" && pathname !== "/swarm-MUI") {
      router.push(`/?workflow=${mode}`);
    } else {
      window.dispatchEvent(
        new CustomEvent("zyvoriq-set-workflow", { detail: { mode } })
      );
    }
  };

  const isPersonasPage = pathname?.startsWith("/personas");

  const studioItems: {
    id: StudioWorkflowMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "create", label: "4-Step Studio", icon: PlusCircle },
    { id: "published", label: "Published Reels", icon: CheckCircle2 },
    { id: "wip", label: "Drafts & Render Jobs", icon: Clock },
  ];

  return (
    <aside
      style={{ width: collapsed ? "56px" : "216px" }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-[#09090b] border-r border-white/[0.07] flex flex-col justify-between py-3.5 px-2 select-none transition-all duration-200"
    >
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => triggerWorkflow("create")}
            className="flex items-center gap-2.5 text-left cursor-pointer overflow-hidden"
          >
            <div className="w-7 h-7 rounded-lg bg-white text-zinc-950 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight text-white truncate">
                Zyvoriq Studio
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="w-6 h-6 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Section 1: Core Studio & Persistent Library */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Production &amp; Library
            </div>
          )}
          {studioItems.map((item) => {
            const Icon = item.icon;
            const active = !isPersonasPage && activeMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => triggerWorkflow(item.id)}
                title={item.label}
                className={`w-full rounded-lg transition-all cursor-pointer flex items-center ${
                  collapsed ? "h-9 justify-center" : "px-2.5 py-2 gap-2.5 text-left"
                } ${
                  active
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] font-medium"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="text-xs tracking-tight truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Dedicated Personas & Wardrobe Library Page */}
        <div className="pt-2 border-t border-white/[0.07] space-y-1">
          {!collapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Cast &amp; Wardrobe
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push("/personas")}
            title="Personas & Wardrobe Library (Male, Female, Supporting, Background, Audience)"
            className={`w-full rounded-lg transition-all cursor-pointer flex items-center ${
              collapsed ? "h-9 justify-center" : "px-2.5 py-2 gap-2.5 text-left"
            } ${
              isPersonasPage
                ? "bg-white text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-300 hover:text-white hover:bg-white/[0.06] font-medium"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="text-xs tracking-tight truncate">
                Personas &amp; Wardrobe
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Collapse Button */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}
