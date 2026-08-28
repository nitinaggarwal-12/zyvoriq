"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimeCinemaStage } from "./AnimeCinemaStage";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        <AnimeCinemaStage />
      </div>
    </ErrorBoundary>
  );
}
