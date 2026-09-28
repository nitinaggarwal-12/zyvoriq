"use client";

import React from "react";
import Link from "next/link";
import { Film } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 text-slate-600">
      <div className="max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">Zyvoriq Video Studio</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">
            Create 60-second HD music videos & reels
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
          <Link href="/swarm-MUI" className="hover:text-slate-900 transition-colors">
            Create Video
          </Link>
          <Link href="/my-reels" className="hover:text-slate-900 transition-colors">
            My Reels
          </Link>
          <Link href="/library" className="hover:text-slate-900 transition-colors">
            Media Library
          </Link>
          <span className="text-slate-400">© {new Date().getFullYear()} Zyvoriq</span>
        </div>
      </div>
    </footer>
  );
}
