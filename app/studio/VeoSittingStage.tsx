"use client";

import React, { useRef, useEffect } from "react";

interface VeoSittingStageProps {
  isPlaying: boolean;
  currentTime?: number;
  restartTrigger?: number;
  onTogglePlay?: () => void;
}

export const VeoSittingStage: React.FC<VeoSittingStageProps> = ({
  isPlaying,
  currentTime = 0,
  restartTrigger = 0,
  onTogglePlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.4) {
      video.currentTime = currentTime % (video.duration || 6);
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || restartTrigger === 0) return;
    video.currentTime = 0;
    if (isPlaying) {
      video.play().catch(() => {});
    }
  }, [restartTrigger]);

  return (
    <div 
      onClick={onTogglePlay}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group flex items-center justify-center cursor-pointer"
    >
      <video
        ref={videoRef}
        src="/assets/video/veo_priya_sitting.mp4"
        playsInline
        muted
        loop
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};
