"use client";

import React, { useEffect, useRef, useState } from "react";

export type CameraPreset = "fullbody_stage" | "35mm_wide" | "70mm_close" | "pip_split";

interface ThreeHoloStageProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  activeScript: string;
}

export const ThreeHoloStage: React.FC<ThreeHoloStageProps> = ({
  isPlaying,
  selectedPersonaName,
  selectedPersonaAvatar,
}) => {
  const stageVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("fullbody_stage");
  const [audioFlux, setAudioFlux] = useState<number>(0);
  const [focusedNode, setFocusedNode] = useState<string>("Zero-Trust Ingress");
  const [fps, setFps] = useState<number>(60);

  const personaSlug = selectedPersonaName.toLowerCase().split(" ")[0] || "priya";
  const videoSrc = cameraPreset === "fullbody_stage" && personaSlug === "priya"
    ? `/assets/video/priya_fullbody_master.mp4`
    : `/assets/video/${personaSlug}_master.mp4`;

  // Architecture Nodes Definition for PiP Architecture Screen
  const ARCH_NODES = [
    { id: "edge", label: "Cloud Armor Edge", x: 120, y: 130, color: "#06b6d4", role: "WAF & DDoS Defense", metrics: "1.4M req/s" },
    { id: "ingress", label: "Zero-Trust Ingress", x: 260, y: 130, color: "#3b82f6", role: "Mutual TLS Gateway", metrics: "100% Validated" },
    { id: "swarm", label: "Sovereign Swarm", x: 400, y: 130, color: "#8b5cf6", role: "Gemini 3.1 Neural Core", metrics: "64-Core Clustered" },
    { id: "spanner", label: "Spanner Active", x: 260, y: 240, color: "#ec4899", role: "99.999% SLA", metrics: "Zero Data Drift" },
    { id: "ledger", label: "zk-SNARK Ledger", x: 400, y: 240, color: "#f59e0b", role: "Ed25519 Immutable", metrics: "Sub-ms Finality" }
  ];

  // Synchronize Play/Pause with Master Studio Controller
  useEffect(() => {
    const video = stageVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, videoSrc]);

  // Real-time Audio Spectrum & Draw.io Node Simulation Loop
  useEffect(() => {
    let animationId: number;
    let nodePulse = 0;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const renderLoop = (time: number) => {
      animationId = requestAnimationFrame(renderLoop);

      // FPS tracking
      frameCount++;
      if (time - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = time;
      }

      // Simulated acoustic flux synchronized with speech
      if (isPlaying) {
        const flux = (Math.sin(time * 0.008) * 0.35 + Math.cos(time * 0.015) * 0.25 + 0.5);
        setAudioFlux(Math.max(0.1, Math.min(1.0, flux)));
      } else {
        setAudioFlux(0);
      }

      // Draw Architecture Canvas if in PiP mode
      const canvas = canvasRef.current;
      if (canvas && cameraPreset === "pip_split") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          nodePulse += 0.03;
          ctx.fillStyle = "#030712";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid Lines
          ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Header
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 14px monospace";
          ctx.fillText("⚡ MULTI-REGION TOPOLOGY", 20, 30);

          ctx.fillStyle = "#64748b";
          ctx.font = "10px monospace";
          ctx.fillText(`VERITAS VALIDATED • FLUX: ${(audioFlux * 100).toFixed(0)}%`, 20, 48);

          // Connection Lines
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(120, 130);
          ctx.lineTo(260, 130);
          ctx.lineTo(400, 130);
          ctx.moveTo(260, 130);
          ctx.lineTo(260, 240);
          ctx.lineTo(400, 240);
          ctx.lineTo(400, 130);
          ctx.stroke();

          // Flowing Signal Packets
          const packetPos = (nodePulse * 50) % 280;
          ctx.fillStyle = "#00f0ff";
          ctx.beginPath();
          ctx.arc(120 + packetPos, 130, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Draw Nodes
          const activeIdx = Math.floor((nodePulse * 0.35) % ARCH_NODES.length);
          ARCH_NODES.forEach((n, idx) => {
            const isActive = activeIdx === idx;
            const radius = isActive ? 18 : 14;

            ctx.fillStyle = isActive ? n.color : "rgba(15, 23, 42, 0.9)";
            ctx.strokeStyle = n.color;
            ctx.lineWidth = isActive ? 2.5 : 1.5;

            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(n.label, n.x, n.y + 28);
          });

          setFocusedNode(ARCH_NODES[activeIdx].label);
        }
      }
    };

    animationId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, cameraPreset, audioFlux]);

  // Seamless Video Loop Handler
  const handleTimeUpdate = () => {
    const video = stageVideoRef.current;
    if (video && video.duration > 0 && video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0.01;
      video.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-2xl flex flex-col justify-between">
      {/* Top Multi-Cam Stage HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            DIRECTOR MULTI-CAM • {fps} FPS
          </div>
          <div className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5">
            <span className="text-slate-400">Acoustic Flux:</span>
            <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75 rounded-full"
                style={{ width: `${(audioFlux * 100).toFixed(0)}%` }}
              />
            </div>
            <span className="text-cyan-300">{(audioFlux * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Main Multi-Angle Video Stage Viewport */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background Stage Cyber Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-black pointer-events-none" />

        {/* Dynamic Framing Container based on Director Preset */}
        <div className={`relative transition-all duration-700 ease-out flex items-center justify-center ${
          cameraPreset === "70mm_close"
            ? "scale-125 translate-y-4 w-full h-full"
            : cameraPreset === "24mm_hero"
            ? "scale-110 -translate-y-2 w-full h-full"
            : cameraPreset === "pip_split"
            ? "w-full h-full grid grid-cols-1 md:grid-cols-2 p-6 gap-4"
            : "scale-100 w-full h-full" // fullbody_stage
        }`}>
          {/* PiP Mode: Live Architecture Board */}
          {cameraPreset === "pip_split" && (
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/90 shadow-xl flex flex-col justify-between p-3">
              <canvas ref={canvasRef} width={520} height={320} className="w-full h-full rounded-lg" />
              <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-800">
                <span>Active Node: <strong className="text-cyan-400">{focusedNode}</strong></span>
                <span>Latency: <strong className="text-emerald-400">0.2ms</strong></span>
              </div>
            </div>
          )}

          {/* Master Video Stream */}
          <div className={`relative rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center ${
            cameraPreset === "pip_split" ? "w-full h-full max-h-[420px]" : "w-full h-full"
          }`}>
            <video
              ref={stageVideoRef}
              src={videoSrc}
              poster={selectedPersonaAvatar}
              onTimeUpdate={handleTimeUpdate}
              playsInline
              className={`w-full h-full object-cover transition-transform duration-700 ${
                cameraPreset === "70mm_close"
                  ? "scale-115 object-top"
                  : cameraPreset === "24mm_hero"
                  ? "scale-105"
                  : "scale-100"
              }`}
            />
            {/* Cinematic Stage Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom Director Controls */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/80 backdrop-blur-md p-3 rounded-b-2xl border-t border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-cyan-400">⚡ Active Camera Angle:</span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
            {cameraPreset.replace("_", " ")}
          </span>
        </div>

        {/* Camera Director Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400 px-1.5 flex items-center gap-1">🎥 DIRECTOR CAM:</span>
          {(
            [
              { id: "fullbody_stage", label: "💃 Full-Body Stage" },
              { id: "35mm_wide", label: "🌐 35mm Keynote Wide" },
              { id: "70mm_close", label: "🎥 70mm Close-Up" },
              { id: "pip_split", label: "📊 Draw.io PiP Split" }
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraPreset(preset.id)}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                cameraPreset === preset.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
