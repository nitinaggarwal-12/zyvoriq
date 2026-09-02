"use client";

import React, { useState, useEffect, useRef } from "react";
import { ZoomKeyframe } from "@/lib/reel/autoZoom";
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Sliders } from "lucide-react";

interface DynamicZoomVideoPlayerProps {
  videoUrl: string;
  keyframes: ZoomKeyframe[];
  subtitleText?: string;
  subtitleStyle?: string;
}

export function DynamicZoomVideoPlayer({
  videoUrl,
  keyframes,
  subtitleText,
  subtitleStyle = "karaoke-gold"
}: DynamicZoomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [currentLabel, setCurrentLabel] = useState<string>("1.0x Wide");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (!keyframes || keyframes.length === 0) {
      setCurrentZoom(1.0);
      setCurrentLabel("1.0x Wide");
      return;
    }

    const activeKeyframe = keyframes.find(k => t >= k.startSec && t <= k.endSec);
    if (activeKeyframe) {
      setCurrentZoom(activeKeyframe.scale);
      setCurrentLabel(activeKeyframe.label);
    } else {
      setCurrentZoom(1.0);
      setCurrentLabel("1.0x Wide");
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[24px] bg-black shadow-2xl">
      {/* Zoomed Video Layer with CSS Matrix transition */}
      <div
        className="h-full w-full overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${currentZoom})`,
          transformOrigin: "center 38%"
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          controls
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Auto-Zoom Indicator HUD */}
      {currentZoom > 1.0 && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-pink-300 backdrop-blur-md animate-pulse">
          <Sparkles className="h-3 w-3" />
          <span>{currentLabel}</span>
        </div>
      )}
    </div>
  );
}
