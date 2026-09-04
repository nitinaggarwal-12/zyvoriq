"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Maximize2 
} from "lucide-react";

interface AudioDuckingMixerProps {
  activeVideoUrlA: string;
  activeVideoUrlB: string;
  audioVoiceUrl?: string;
  audioMusicUrl?: string;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  duckingEnabled?: boolean;
}

export const AudioDuckingMixer: React.FC<AudioDuckingMixerProps> = ({
  activeVideoUrlA,
  activeVideoUrlB,
  audioVoiceUrl,
  audioMusicUrl,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onEnded,
  aspectRatio = "9:16",
  duckingEnabled = true
}) => {
  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeBuffer, setActiveBuffer] = useState<"A" | "B">("A");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [musicVolume, setMusicVolume] = useState<number>(0.7);
  const [isDuckingActive, setIsDuckingActive] = useState<boolean>(false);

  // Sync play/pause state across video buffers and audio stems
  useEffect(() => {
    const currentVideo = activeBuffer === "A" ? videoRefA.current : videoRefB.current;
    if (isPlaying) {
      currentVideo?.play().catch(() => {});
      voiceAudioRef.current?.play().catch(() => {});
      musicAudioRef.current?.play().catch(() => {});
    } else {
      videoRefA.current?.pause();
      videoRefB.current?.pause();
      voiceAudioRef.current?.pause();
      musicAudioRef.current?.pause();
    }
  }, [isPlaying, activeBuffer]);

  // Automated Web Audio -12dB Ducking Simulation
  useEffect(() => {
    if (!duckingEnabled || !musicAudioRef.current) return;
    
    // If voice stem is playing, smoothly attenuate background music by -12dB (~0.25 gain)
    if (isPlaying && audioVoiceUrl && voiceVolume > 0) {
      setIsDuckingActive(true);
      musicAudioRef.current.volume = musicVolume * 0.25; // -12dB ducking
    } else {
      setIsDuckingActive(false);
      musicAudioRef.current.volume = musicVolume;
    }
  }, [isPlaying, audioVoiceUrl, voiceVolume, musicVolume, duckingEnabled]);

  // Aspect ratio container classes
  const aspectClass = 
    aspectRatio === "16:9" ? "aspect-video max-w-[850px]" :
    aspectRatio === "1:1" ? "aspect-square max-w-[500px]" :
    "aspect-[9/16] max-w-[380px]";

  return (
    <div className="w-full flex flex-col items-center gap-4 text-white">
      {/* 1. Dual-Buffer Seamless Video Viewport */}
      <div className={`w-full ${aspectClass} bg-black rounded-2xl border border-[#232a3b] shadow-2xl relative overflow-hidden group transition-all duration-500`}>
        {/* Buffer A */}
        <video
          ref={videoRefA}
          src={activeVideoUrlA}
          playsInline
          muted={isMuted}
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            activeBuffer === "A" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
          onEnded={onEnded}
        />

        {/* Buffer B (Seamless Preload) */}
        <video
          ref={videoRefB}
          src={activeVideoUrlB || activeVideoUrlA}
          playsInline
          muted={isMuted}
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            activeBuffer === "B" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
          onEnded={onEnded}
        />

        {/* Hidden Audio Elements for Multimodal Sync */}
        {audioVoiceUrl && (
          <audio ref={voiceAudioRef} src={audioVoiceUrl} muted={isMuted} preload="auto" />
        )}
        {audioMusicUrl && (
          <audio ref={musicAudioRef} src={audioMusicUrl} muted={isMuted} preload="auto" loop />
        )}

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Buffer {activeBuffer} Active · Seamless Switch
          </span>
          {isDuckingActive && (
            <span className="text-[10px] font-bold bg-purple-500/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-purple-400/30 text-white shadow-lg animate-fade-in">
              -12dB Auto-Ducking
            </span>
          )}
        </div>

        {/* Master Resolution Pill */}
        <div className="absolute top-3 right-3 z-20">
          <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-slate-300">
            1080p · {aspectRatio}
          </span>
        </div>
      </div>

      {/* 2. Live Audio Stems & Ducking Controller */}
      <div className="w-full max-w-[500px] bg-[#10141f] border border-[#212738] rounded-xl p-3.5 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-300 border-b border-[#1c2230] pb-2">
          <span className="font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Multimodal Stem Mixer & Ducking
          </span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Voice Stem Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Gemini 3.1 TTS Voice</span>
              <span className="font-mono text-emerald-300">{Math.round(voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#1a2030] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Lyria Music Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Lyria 3.0 Music Bed</span>
              <span className="font-mono text-purple-300">
                {isDuckingActive ? `${Math.round(musicVolume * 25)}% (-12dB)` : `${Math.round(musicVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#1a2030] rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AudioDuckingMixer;
