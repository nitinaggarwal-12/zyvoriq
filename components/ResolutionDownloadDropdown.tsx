"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Sparkles, Film } from "lucide-react";
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

  const estimatedSize = estimateFileSizeMb(durationSec, selectedRes);

  return (
    <div className="relative mt-3 w-full" ref={dropdownRef}>
      <div className="flex rounded-2xl border border-emerald-300/30 bg-emerald-300/[0.08] shadow-lg shadow-emerald-500/10">
        <button
          onClick={() => handleDownload(selectedRes)}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 pl-4 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/[0.14]"
        >
          <Download className="h-4 w-4" />
          <span>Download Master Video (1080p MP4 · ~{estimatedSize} MB)</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center border-l border-emerald-300/20 px-3.5 text-emerald-200 transition hover:bg-emerald-300/[0.14]"
          aria-label="Select export format"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-white/10 bg-[#0d121a] p-2.5 shadow-2xl backdrop-blur-xl z-50 space-y-1.5">
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Export Package Options
          </div>
          {RESOLUTION_PRESETS.map((preset) => {
            const size = estimateFileSizeMb(durationSec, preset.id);
            const isSelected = selectedRes === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleDownload(preset.id)}
                className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                  isSelected
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-white"
                    : "border border-transparent hover:bg-white/5 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Film className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {preset.label}
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-normal text-slate-400">
                        {preset.badge}
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
          <div className="pt-1 px-2 text-[10px] text-slate-500 border-t border-white/5">
            ℹ️ All productions are mastered in native 1080p. Social platforms optimize bitrates automatically upon upload.
          </div>
        </div>
      )}
    </div>
  );
}
