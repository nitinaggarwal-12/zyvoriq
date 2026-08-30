"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReelStudio } from "./ReelStudio";

export default function StudioPage() {
  return (
    <ErrorBoundary>
      <ReelStudio />
    </ErrorBoundary>
  );
}
