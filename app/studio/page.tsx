"use client";

import React from "react";
import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReelStudio } from "./ReelStudio";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <div className="relative">
        <Link href="/studio/inspector" className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-2xl border border-pink-300/25 bg-[#11151c]/95 px-4 py-3 text-xs font-black text-pink-100 shadow-2xl backdrop-blur-xl transition hover:border-pink-300/50 hover:bg-[#171c25]">
          <ScanSearch className="h-4 w-4" /> Evidence Inspector
        </Link>
        <ReelStudio />
      </div>
    </ErrorBoundary>
  );
}
