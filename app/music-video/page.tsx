import React from "react";
import { YTStudio } from "@/components/YTStudio";

export const metadata = {
  title: "Zyvoriq Music Video Studio | Omni 1.1 Hybrid Master & Lyria 3.5",
  description:
    "Autonomous AI Music Video Production Studio powered by Google Omni 1.1 Flash Hybrid Mastering and DeepMind Lyria 3.5.",
};

export default function MusicVideoPage() {
  return <YTStudio embedded={false} />;
}

