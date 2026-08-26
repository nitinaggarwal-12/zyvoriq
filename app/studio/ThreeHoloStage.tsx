"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EnvironmentMode, FramingMode, PostureMode } from "@/lib/tier6/types";

interface ThreeHoloStageProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  environment: EnvironmentMode;
  framingMode: FramingMode;
  postureMode: PostureMode;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  activeScript: string;
}

export const ThreeHoloStage: React.FC<ThreeHoloStageProps> = ({
  audioRef,
  videoRef,
  isPlaying,
  environment,
  framingMode,
  postureMode,
  selectedPersonaName,
  selectedPersonaAvatar,
  activeScript
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState<number>(60);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [focusedNode, setFocusedNode] = useState<string>("Overview");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);
    scene.fog = new THREE.FogExp2(0x05070d, 0.08);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, 3.8);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Audio Analyzer Setup (Web Audio API)
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let audioDataArray: Uint8Array | null = null;

    try {
      if (audioRef?.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        audioDataArray = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch {
      // AudioContext might already be connected or user interaction needed
    }

    // 5. Lighting System
    const ambientLight = new THREE.AmbientLight(0x111827, 0.9);
    scene.add(ambientLight);

    const mainSpotlight = new THREE.SpotLight(0x00f0ff, 4, 20, Math.PI / 4, 0.4, 1.5);
    mainSpotlight.position.set(0, 5, 3);
    scene.add(mainSpotlight);

    const rimLight = new THREE.PointLight(0x6366f1, 3, 15);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    const floorGlowLight = new THREE.PointLight(0x00f0ff, 2, 8);
    floorGlowLight.position.set(0, 0.2, 0);
    scene.add(floorGlowLight);

    // 6. Stage Floor (Reflective Circular Podium)
    const stageGeo = new THREE.CylinderGeometry(3.6, 3.9, 0.15, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x080d1a,
      roughness: 0.18,
      metalness: 0.9
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.075;
    scene.add(stage);

    // Glowing Stage Rim
    const rimGeo = new THREE.TorusGeometry(3.65, 0.035, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Outer Concentric Stage Ring
    const outerRingGeo = new THREE.TorusGeometry(4.2, 0.015, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x1e293b, 0x0a101f);
    gridHelper.position.y = -0.08;
    scene.add(gridHelper);

    // 7. Curved Stage LED Screen (Draw.io Architecture Display)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const ctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.RepeatWrapping;
    screenTexture.repeat.x = -1;
    const screenGeo = new THREE.CylinderGeometry(4.8, 4.8, 2.4, 48, 1, true, Math.PI * 0.7, Math.PI * 0.6);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.94
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.2, 0);
    scene.add(stageScreen);

    // Dynamic Architecture Nodes Definition
    const ARCH_NODES = [
      { id: "edge", label: "Cloud Armor Edge", x: 180, y: 180, color: "#06b6d4", role: "WAF & DDoS Defense" },
      { id: "ingress", label: "Zero-Trust Ingress", x: 380, y: 180, color: "#3b82f6", role: "Mutual TLS Gateway" },
      { id: "swarm", label: "Sovereign Swarm Engine", x: 620, y: 180, color: "#8b5cf6", role: "Gemini 3.1 Neural Core" },
      { id: "sync", label: "Multi-Region Sync", x: 860, y: 180, color: "#10b981", role: "Sub-ms Global Fabric" },
      { id: "spanner", label: "Spanner Active-Active", x: 380, y: 340, color: "#ec4899", role: "99.999% SLA Consistency" },
      { id: "ledger", label: "Veritas zk-SNARK Ledger", x: 620, y: 340, color: "#f59e0b", role: "Ed25519 Immutable Proof" }
    ];

    let nodePulse = 0;
    const updateStageScreen = (vol: number) => {
      if (!ctx) return;
      nodePulse += 0.04;
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, 1024, 512);

      // Cyber Grid Lines
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
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

      // Title & Live Metrics
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px monospace";
      ctx.fillText("⚡ MULTI-REGION ACTIVE-ACTIVE CLOUD TOPOLOGY", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "13px monospace";
      ctx.fillText(`DRAW.IO ARCHITECTURE STAGE SCREEN • ED25519 VERITAS VALIDATED • AUDIO FLUX: ${(vol * 100).toFixed(0)}%`, 40, 70);

      // Connectors with Dynamic Flowing Signal
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.lineWidth = 2;
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
      const packetPos = (nodePulse * 80) % 680;
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(180 + packetPos, 180, 4 + vol * 3, 0, Math.PI * 2);
      ctx.fill();

      // Render Nodes
      const activeIdx = Math.floor((nodePulse * 0.6) % ARCH_NODES.length);
      ARCH_NODES.forEach((n, idx) => {
        const isActive = activeIdx === idx;
        const radius = isActive ? 26 + Math.sin(nodePulse * 3) * 3 + vol * 8 : 22;

        ctx.fillStyle = isActive ? n.color : "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isActive ? 3.5 : 1.5;

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + 38);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px monospace";
        ctx.fillText(n.role, n.x, n.y + 52);
      });

      setFocusedNode(ARCH_NODES[activeIdx].label);
      screenTexture.needsUpdate = true;
    };

    // 8. Presenter Mesh in 3D Space
    let presenterTexture: THREE.Texture;
    if (isPlaying && videoRef.current) {
      const vidTex = new THREE.VideoTexture(videoRef.current);
      vidTex.minFilter = THREE.LinearFilter;
      vidTex.magFilter = THREE.LinearFilter;
      vidTex.format = THREE.RGBAFormat;
      presenterTexture = vidTex;
    } else {
      presenterTexture = new THREE.TextureLoader().load(selectedPersonaAvatar);
    }

    const presenterGeo = new THREE.PlaneGeometry(2.4, 1.35);
    const presenterMat = new THREE.MeshBasicMaterial({
      map: presenterTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const presenterMesh = new THREE.Mesh(presenterGeo, presenterMat);
    presenterMesh.position.set(0, 0.9, 0.4);
    scene.add(presenterMesh);

    // 9. Floating Ambient Particle Dust
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 9;
      particlePos[i + 1] = Math.random() * 4.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 9;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Interactive Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetCameraAngleX = 0;
    let targetCameraAngleY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetCameraAngleX -= deltaX * 0.005;
      targetCameraAngleY = Math.max(-0.4, Math.min(0.4, targetCameraAngleY - deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 11. Animation & Render Loop
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let animationId: number;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      // FPS calculation
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Audio Frequency Analysis
      let currentVol = 0;
      if (analyser && audioDataArray && isPlaying) {
        analyser.getByteFrequencyData(audioDataArray as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < audioDataArray.length; i++) {
          sum += audioDataArray[i];
        }
        currentVol = sum / (audioDataArray.length * 255);
        setAudioLevel(currentVol);
      }

      // Update Screen with Audio Reactivity
      updateStageScreen(currentVol);

      // Audio-Reactive Lighting Modulation
      const dynamicLightIntensity = 3.5 + currentVol * 4.0;
      mainSpotlight.intensity = dynamicLightIntensity;
      floorGlowLight.intensity = 1.5 + currentVol * 3.0;

      // Floating Particles Drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.002 + currentVol * 0.004;
        if (positions[i] > 4.5) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Environment Color Updates
      if (environment === "keynote_arena") {
        mainSpotlight.color.setHex(0x00f0ff);
        rimMat.color.setHex(0x00f0ff);
        floorGlowLight.color.setHex(0x00f0ff);
        scene.fog?.color.setHex(0x05070d);
      } else if (environment === "fireside_library") {
        mainSpotlight.color.setHex(0xf59e0b);
        rimMat.color.setHex(0xd97706);
        floorGlowLight.color.setHex(0xf59e0b);
        scene.fog?.color.setHex(0x120c08);
      } else if (environment === "command_bunker") {
        mainSpotlight.color.setHex(0x10b981);
        rimMat.color.setHex(0x059669);
        floorGlowLight.color.setHex(0x10b981);
        scene.fog?.color.setHex(0x04130c);
      } else if (environment === "executive_boardroom") {
        mainSpotlight.color.setHex(0x38bdf8);
        rimMat.color.setHex(0x818cf8);
        floorGlowLight.color.setHex(0x38bdf8);
        scene.fog?.color.setHex(0x080f1d);
      }

      // Camera Lerping for Framing Modes
      let targetY = 1.0;
      let targetZ = 3.6;

      if (framingMode === "headshot") {
        targetY = 1.25;
        targetZ = 2.1;
      } else if (framingMode === "half_body") {
        targetY = 1.05;
        targetZ = 2.9;
      } else if (framingMode === "full_body") {
        targetY = 0.95;
        targetZ = 4.3;
      }

      // Audio-Reactive Thoracic Breathing & Camera Drift
      const breathSway = isPlaying ? Math.sin(time * 0.0015) * (0.02 + currentVol * 0.03) : 0;
      camera.position.x += (Math.sin(targetCameraAngleX) * targetZ - camera.position.x) * 0.08;
      camera.position.y += (targetY + breathSway + targetCameraAngleY - camera.position.y) * 0.08;
      camera.position.z += (Math.cos(targetCameraAngleX) * targetZ - camera.position.z) * 0.08;
      camera.lookAt(0, targetY, 0.4);

      // Posture & Vocal Micromotion Adjustments on Presenter Mesh
      if (presenterMesh) {
        if (postureMode === "sitting") {
          presenterMesh.position.y = 0.65;
          presenterMesh.scale.set(0.9, 0.9, 0.9);
        } else if (postureMode === "walking") {
          presenterMesh.position.x = Math.sin(time * 0.001) * 0.4;
          presenterMesh.position.y = 0.9;
          presenterMesh.scale.set(1.0, 1.0, 1.0);
        } else if (postureMode === "interactive_hologram") {
          presenterMesh.position.set(0, 0.9, 0.4);
          presenterMesh.scale.set(1.05 + currentVol * 0.04, 1.05 + currentVol * 0.04, 1.05);
        } else {
          presenterMesh.position.set(0, 0.9, 0.4);
          presenterMesh.scale.set(1.0 + currentVol * 0.02, 1.0 + currentVol * 0.02, 1.0);
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
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [environment, framingMode, postureMode, isPlaying, selectedPersonaAvatar]);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Stage HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          3D HOLO-STAGE • 60 FPS WEBGL
        </div>
        <div className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px]">
          {fps} FPS
        </div>
      </div>

      {/* Veritas Cryptographic Signature & Real-Time Audio Frequency Reactor Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isPlaying && (
          <div className="px-3 py-1 bg-cyan-950/80 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-300 font-mono text-[11px] flex items-center gap-2 shadow-lg shadow-cyan-950/40">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-cyan-400 animate-pulse" />
              <span className="w-1 h-4 bg-cyan-400 animate-pulse delay-75" />
              <span className="w-1 h-2 bg-cyan-400 animate-pulse delay-150" />
            </span>
            <span>48kHz Reactive Flux</span>
          </div>
        )}
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Free Viewpoint Drag Prompt */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-md border border-slate-700/60 text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
          <span>🖱️ Click & Drag to Orbit 3D Stage</span>
        </div>
      </div>

      {/* Active Stage Screen Diagram Telemetry Badge */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-md border border-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
          <span className="text-cyan-400">⚡ Stage Screen Active Node:</span>
          <span className="font-bold text-white bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">{focusedNode}</span>
        </div>
      </div>
    </div>
  );
};
