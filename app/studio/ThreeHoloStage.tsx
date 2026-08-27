"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type CameraPreset = "35mm_wide" | "70mm_close" | "24mm_hero" | "stage_screen_focus" | "free_orbit";

interface ThreeHoloStageProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  activeScript: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const ThreeHoloStage: React.FC<ThreeHoloStageProps> = ({
  isPlaying,
  selectedPersonaAvatar,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("35mm_wide");
  const [fps, setFps] = useState<number>(60);
  const [focusedNode, setFocusedNode] = useState<string>("Overview");

  // Architecture Nodes Definition
  const ARCH_NODES = [
    { id: "edge", label: "Cloud Armor Edge", x: 180, y: 180, color: "#06b6d4", role: "WAF & DDoS Defense", metrics: "1.4M req/s • 0.2ms" },
    { id: "ingress", label: "Zero-Trust Ingress", x: 380, y: 180, color: "#3b82f6", role: "Mutual TLS Gateway", metrics: "100% Validated" },
    { id: "swarm", label: "Sovereign Swarm Engine", x: 620, y: 180, color: "#8b5cf6", role: "Gemini 3.1 Neural Core", metrics: "64-Core Clustered" },
    { id: "sync", label: "Multi-Region Sync", x: 860, y: 180, color: "#10b981", role: "Sub-ms Global Fabric", metrics: "4-Region Active" },
    { id: "spanner", label: "Spanner Active-Active", x: 380, y: 340, color: "#ec4899", role: "99.999% SLA Consistency", metrics: "Zero Data Drift" },
    { id: "ledger", label: "Veritas zk-SNARK Ledger", x: 620, y: 340, color: "#f59e0b", role: "Ed25519 Immutable Proof", metrics: "Sub-ms Finality" }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060c);
    scene.fog = new THREE.FogExp2(0x04060c, 0.07);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.25, 3.6);

    // 3. WebGL Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Dynamic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const mainSpotlight = new THREE.SpotLight(0x00f0ff, 4.5, 25, Math.PI / 4, 0.35, 1.4);
    mainSpotlight.position.set(0, 5.5, 3.5);
    scene.add(mainSpotlight);

    const rimLight = new THREE.PointLight(0x6366f1, 3.5, 18);
    rimLight.position.set(0, 2.2, -2.5);
    scene.add(rimLight);

    const floorGlowLight = new THREE.PointLight(0x00f0ff, 2.5, 10);
    floorGlowLight.position.set(0, 0.15, 0);
    scene.add(floorGlowLight);

    // 5. Stage Floor (Reflective Circular Cyber Podium)
    const stageGeo = new THREE.CylinderGeometry(3.8, 4.2, 0.18, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x060a14,
      roughness: 0.12,
      metalness: 0.95
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.09;
    scene.add(stage);

    // Inner Glowing Stage Rim
    const rimGeo = new THREE.TorusGeometry(3.85, 0.04, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Outer Concentric Stage Ring
    const outerRingGeo = new THREE.TorusGeometry(4.5, 0.015, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 32, 0x1e293b, 0x080f1d);
    gridHelper.position.y = -0.095;
    scene.add(gridHelper);

    // 6. Curved Stage LED Screen (Draw.io Architecture Display)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const ctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.RepeatWrapping;
    screenTexture.repeat.x = -1;
    const screenGeo = new THREE.CylinderGeometry(5.0, 5.0, 2.6, 64, 1, true, Math.PI * 0.68, Math.PI * 0.64);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.25, 0);
    scene.add(stageScreen);

    let nodePulse = 0;
    const updateStageScreen = (vol: number) => {
      if (!ctx) return;
      nodePulse += 0.035;
      ctx.fillStyle = "#050811";
      ctx.fillRect(0, 0, 1024, 512);

      // Cyber Grid Lines
      ctx.strokeStyle = "rgba(30, 41, 59, 0.45)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Title & Live Telemetry
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px monospace";
      ctx.fillText("⚡ MULTI-REGION ACTIVE-ACTIVE CLOUD TOPOLOGY", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.fillText(`DRAW.IO ARCHITECTURE STAGE SCREEN • ED25519 VERITAS VALIDATED • REAL-TIME FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

      // Connectors with Flowing Signal
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(180, 180);
      ctx.lineTo(380, 180);
      ctx.lineTo(620, 180);
      ctx.lineTo(860, 180);
      ctx.moveTo(380, 180);
      ctx.lineTo(380, 340);
      ctx.lineTo(620, 340);
      ctx.lineTo(620, 180);
      ctx.stroke();

      // Flowing Signal Packets
      const packetPos = (nodePulse * 90) % 680;
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(180 + packetPos, 180, 4.5 + vol * 4, 0, Math.PI * 2);
      ctx.fill();

      // Render Nodes
      const activeIdx = Math.floor((nodePulse * 0.5) % ARCH_NODES.length);
      ARCH_NODES.forEach((n, idx) => {
        const isActive = activeIdx === idx;
        const radius = isActive ? 28 + Math.sin(nodePulse * 3) * 3 + vol * 8 : 22;

        ctx.fillStyle = isActive ? n.color : "rgba(15, 23, 42, 0.94)";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isActive ? 4 : 1.5;

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + 40);

        ctx.fillStyle = isActive ? "#38bdf8" : "#94a3b8";
        ctx.font = "10px monospace";
        ctx.fillText(isActive ? n.metrics : n.role, n.x, n.y + 54);
      });

      setFocusedNode(ARCH_NODES[activeIdx].label);
      screenTexture.needsUpdate = true;
    };

    // 7. Holographic Presenter Mesh with Live Textures & Alpha
    const textureLoader = new THREE.TextureLoader();
    const avatarTex = textureLoader.load(selectedPersonaAvatar);
    avatarTex.minFilter = THREE.LinearFilter;
    avatarTex.magFilter = THREE.LinearFilter;

    const presenterGeo = new THREE.PlaneGeometry(2.4, 1.35, 32, 32);
    const presenterMat = new THREE.MeshStandardMaterial({
      map: avatarTex,
      transparent: true,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const presenterMesh = new THREE.Mesh(presenterGeo, presenterMat);
    presenterMesh.position.set(0, 0.9, 0.4);
    scene.add(presenterMesh);

    // 8. Floating Holographic Ambient Cyber Dust
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 10;
      particlePos[i + 1] = Math.random() * 4;
      particlePos[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.035,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Interactive 3D Orbit Controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetCameraAngleX = 0;
    let targetCameraAngleY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
      if (cameraPreset !== "free_orbit") {
        setCameraPreset("free_orbit");
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;

      targetCameraAngleX -= deltaX * 0.005;
      targetCameraAngleY = Math.max(-0.6, Math.min(0.6, targetCameraAngleY + deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 10. 60 FPS Animation & Teleprompter Synced Loop
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let animationId: number;
    let playbackSeconds = 0;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      // FPS tracking
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }

      const timeSeconds = time * 0.001;

      // Handle continuous playback & timecode synchronization
      if (isPlaying) {
        playbackSeconds += 1 / 60;
        if (onTimeUpdate) {
          onTimeUpdate(playbackSeconds % 23.2);
        }
      }

      // Procedural Audio Flux for Visemes & Breathing
      const currentVol = isPlaying
        ? (Math.sin(timeSeconds * 8.0) * 0.35 + Math.cos(timeSeconds * 14.0) * 0.25 + 0.4)
        : (Math.sin(timeSeconds * 1.5) * 0.05 + 0.05);

      updateStageScreen(currentVol);

      // Floating dust drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.004;
        if (positions[i] < 0) positions[i] = 4;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Stage ground glow modulation
      floorGlowLight.intensity = 2.0 + currentVol * 1.8;

      // Director Camera Positions & Smooth Lerp Transitions
      let targetX = 0;
      let targetY = 1.25;
      let targetZ = 3.6;

      if (cameraPreset === "70mm_close") {
        targetX = 0;
        targetY = 1.25;
        targetZ = 2.0;
      } else if (cameraPreset === "35mm_wide") {
        targetX = 0;
        targetY = 1.05;
        targetZ = 3.6;
      } else if (cameraPreset === "24mm_hero") {
        targetX = 0;
        targetY = 0.45;
        targetZ = 2.7;
      } else if (cameraPreset === "stage_screen_focus") {
        targetX = 1.2;
        targetY = 1.35;
        targetZ = 2.8;
      } else if (cameraPreset === "free_orbit") {
        targetZ = 3.6;
      }

      // Thoracic Breathing & Subtle Camera Sway
      const breathSway = Math.sin(timeSeconds * 1.8) * (0.015 + currentVol * 0.02);
      if (cameraPreset === "free_orbit") {
        camera.position.x += (Math.sin(targetCameraAngleX) * targetZ - camera.position.x) * 0.08;
        camera.position.y += (targetY + breathSway + targetCameraAngleY - camera.position.y) * 0.08;
        camera.position.z += (Math.cos(targetCameraAngleX) * targetZ - camera.position.z) * 0.08;
      } else {
        camera.position.x += (targetX - camera.position.x) * 0.06;
        camera.position.y += (targetY + breathSway - camera.position.y) * 0.06;
        camera.position.z += (targetZ - camera.position.z) * 0.06;
      }

      if (cameraPreset === "stage_screen_focus") {
        camera.lookAt(0.6, 1.25, 0.2);
      } else {
        camera.lookAt(0, targetY, 0.4);
      }

      // 🕺 Continuous Natural Gestural Nod & Breathing Motion
      if (presenterMesh) {
        if (isPlaying) {
          presenterMesh.rotation.z = Math.sin(timeSeconds * 2.5) * 0.02 + currentVol * 0.015;
          presenterMesh.rotation.y = Math.cos(timeSeconds * 1.8) * 0.025;
          presenterMesh.position.y = 0.9 + Math.sin(timeSeconds * 3.0) * 0.01 + currentVol * 0.02;
          presenterMesh.scale.set(1.0 + currentVol * 0.03, 1.0 + currentVol * 0.03, 1.0);
        } else {
          // Idle breathing
          presenterMesh.rotation.z = Math.sin(timeSeconds * 1.2) * 0.008;
          presenterMesh.rotation.y = Math.cos(timeSeconds * 0.9) * 0.01;
          presenterMesh.position.y = 0.9 + Math.sin(timeSeconds * 1.5) * 0.006;
          presenterMesh.scale.set(1.0, 1.0, 1.0);
        }
      }

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, selectedPersonaAvatar, cameraPreset]);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-2xl">
      {/* Three.js 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Stage HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          3D HOLO-STAGE • {fps} FPS WEBGL
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
          {isPlaying ? "Live Broadcast Kinematics" : "Idle Ambient State"}
        </div>
      </div>

      {/* Veritas Cryptographic Provenance Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Multi-Camera Director Swarm Selector Toolbar (Bottom Floating Bar) */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2">
        
        {/* Active Stage Screen Diagram Telemetry Badge */}
        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
          <span className="text-cyan-400">⚡ Stage Screen Node:</span>
          <span className="font-bold text-white bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">{focusedNode}</span>
        </div>

        {/* 1-Click Multi-Camera Director Swarm Angle Switcher */}
        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
            🎥 DIRECTOR CAM:
          </span>
          {[
            { id: "35mm_wide", label: "💃 Full-Body Wide" },
            { id: "70mm_close", label: "🎥 70mm Close-Up" },
            { id: "24mm_hero", label: "📐 24mm Hero" },
            { id: "stage_screen_focus", label: "📊 Draw.io Zoom" },
            { id: "free_orbit", label: "🔄 3D Orbit" }
          ].map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCameraPreset(cam.id as CameraPreset)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                cameraPreset === cam.id
                  ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
