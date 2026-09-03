"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen, Layers3, ScanSearch } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReelStudio } from "./ReelStudio";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#07090d]">
        <ReelStudio />
      </div>
    </ErrorBoundary>
  );
}
