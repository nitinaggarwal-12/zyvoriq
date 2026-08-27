"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VeoVideoStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  restartTrigger?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VeoVideoStage: React.FC<VeoVideoStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  restartTrigger = 0,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localPlaying, setLocalPlaying] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    } else {
      video.pause();
      setLocalPlaying(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || restartTrigger === 0) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    }
  }, [restartTrigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (onTimeUpdate) onTimeUpdate(video.currentTime);
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setLocalPlaying(true);
    } else {
      video.pause();
      setLocalPlaying(false);
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group flex items-center justify-center">
      <video
        ref={videoRef}
        src="/assets/video/veo_priya_master.mp4"
        playsInline
        muted
        loop
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setLocalPlaying(true)}
        onPause={() => setLocalPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Clean Hover Play/Pause Overlay */}
      <button
        onClick={handleTogglePlay}
        className="absolute z-30 p-4 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-black/80"
      >
        {localPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
      </button>
    </div>
  );
};
