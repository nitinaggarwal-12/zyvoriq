"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Check, Sparkles, Smartphone, HardDrive, Zap } from "lucide-react";
import {
  RESOLUTION_PRESETS,
  VideoResolutionId,
  estimateFileSizeMb,
  triggerResolutionDownload
} from "@/lib/reel/videoExporter";

interface ResolutionDownloadDropdownProps {
  videoUrl: string;
  durationSec?: number;
  filenameBase?: string;
}

export function ResolutionDownloadDropdown({
  videoUrl,
  durationSec = 30,
  filenameBase = "zyvoriq_reel"
}: ResolutionDownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<VideoResolutionId>("1080p");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = (resId: VideoResolutionId) => {
    setSelectedRes(resId);
    triggerResolutionDownload(videoUrl, resId, filenameBase);
    setIsOpen(false);
  };

  const currentPreset = RESOLUTION_PRESETS.find(p => p.id === selectedRes) || RESOLUTION_PRESETS[0];

  const getResIcon = (id: VideoResolutionId) => {
    switch (id) {
      case "1080p": return <Sparkles className="h-4 w-4 text-emerald-400" />;
      case "720p": return <Zap className="h-4 w-4 text-teal-400" />;
      case "480p": return <Smartphone className="h-4 w-4 text-sky-400" />;
      case "360p": return <HardDrive className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative mt-3 w-full" ref={dropdownRef}>
      <div className="flex rounded-2xl border border-emerald-300/30 bg-emerald-300/[0.08] shadow-lg shadow-emerald-500/10">
        <button
          onClick={() => handleDownload(selectedRes)}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 pl-4 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/[0.14]"
        >
          <Download className="h-4 w-4" />
          <span>Download Combined MP4 ({selectedRes})</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center border-l border-emerald-300/20 px-3.5 text-emerald-200 transition hover:bg-emerald-300/[0.14]"
          aria-label="Select download resolution"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-white/10 bg-[#0d121a] p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Instant Export Resolution (0 AI Compute)
          </div>
          {RESOLUTION_PRESETS.map((preset) => {
            const size = estimateFileSizeMb(durationSec, preset.id);
            const isSelected = selectedRes === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleDownload(preset.id)}
                className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${isSelected ? "border border-emerald-500/40 bg-emerald-500/10 text-white" : "border border-transparent hover:bg-white/5 text-slate-300"}`}
              >
                <div className="flex items-center gap-2.5">
                  {getResIcon(preset.id)}
                  <div>
                    <div className="font-black text-white flex items-center gap-1.5">
                      {preset.label}
                      <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-normal text-slate-400">
                        {preset.width}×{preset.height}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{preset.description}</div>
                  </div>
                </div>
                <div className="text-right pl-2 shrink-0">
                  <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ~{size} MB
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
