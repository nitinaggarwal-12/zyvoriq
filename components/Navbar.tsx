"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderOpen, Home, Layers3, Menu, Moon, Plus, Send, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Projects", href: "/my-reels", icon: FolderOpen },
  { label: "Assets", href: "/characters", icon: Layers3 },
  { label: "Publish", href: "/studio", icon: Send },
  { label: "Analytics", href: "/creator/analytics", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0d10]/92 dark:text-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-5 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="mr-2 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white shadow-sm">Z</div>
          <span className="text-[17px] font-bold tracking-[-0.03em]">Zyvoriq</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active(href)
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {resolvedTheme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Link
            href="/reels"
            className="hidden items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 sm:flex"
          >
            <Plus className="h-4 w-4" />
            Create
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden dark:border-white/10"
            aria-label="Open navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-white/10 dark:bg-[#0b0d10]">
          <nav className="space-y-1">
            {items.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Link href="/reels" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Create
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
