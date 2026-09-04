"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { FolderOpen, Layers3, ScanSearch, Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReelStudio } from "./ReelStudio";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#07090d]">
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#07090d] text-teal-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
          <ReelStudio />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
