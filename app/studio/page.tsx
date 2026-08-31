"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, Layers3, ScanSearch } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReelStudio } from "./ReelStudio";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <div className="relative">
        <Link
          href="/studio/categories"
          className="fixed right-[108px] top-[13px] z-[80] inline-flex items-center gap-2 rounded-xl border border-pink-300/20 bg-[#11151c]/95 px-3 py-2.5 text-xs font-black text-pink-100 shadow-xl backdrop-blur-xl transition hover:border-pink-300/45 hover:bg-[#171c25] sm:right-[292px]"
          aria-label="Browse 24 creation categories"
        >
          <Layers3 className="h-4 w-4 text-pink-300" /> <span className="hidden min-[430px]:inline">24 Categories</span><span className="min-[430px]:hidden">24</span>
        </Link>
        <Link
          href="/studio/library"
          className="fixed right-5 top-[13px] z-[80] inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#11151c]/95 px-3.5 py-2.5 text-xs font-black text-white shadow-xl backdrop-blur-xl transition hover:border-teal-300/30 hover:bg-[#171c25] sm:right-44"
          aria-label="Open Library"
        >
          <FolderOpen className="h-4 w-4 text-teal-300" /> Library
        </Link>
        <Link href="/studio/inspector" className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-2xl border border-pink-300/25 bg-[#11151c]/95 px-4 py-3 text-xs font-black text-pink-100 shadow-2xl backdrop-blur-xl transition hover:border-pink-300/50 hover:bg-[#171c25]">
          <ScanSearch className="h-4 w-4" /> Evidence Inspector
        </Link>
        <ReelStudio />
      </div>
    </ErrorBoundary>
  );
}
