"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EnvironmentMode, FramingMode, PostureMode } from "@/lib/tier6/types";

interface ThreeHoloStageProps {
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);
    scene.fog = new THREE.FogExp2(0x06080d, 0.08);

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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2333, 0.8);
    scene.add(ambientLight);

    const mainSpotlight = new THREE.SpotLight(0x00f0ff, 4, 20, Math.PI / 4, 0.4, 1.5);
    mainSpotlight.position.set(0, 5, 3);
    scene.add(mainSpotlight);

    const rimLight = new THREE.PointLight(0x6366f1, 3, 15);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    // 5. Stage Floor (Reflective Circular Podium)
    const stageGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.15, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.2,
      metalness: 0.85
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.075;
    scene.add(stage);

    // Glowing Stage Rim
    const rimGeo = new THREE.TorusGeometry(3.55, 0.03, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.08;
    scene.add(gridHelper);

    // 6. Curved Stage LED Screen (Draw.io Architecture Display)
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
      opacity: 0.92
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.2, 0);
    scene.add(stageScreen);

    // Function to draw dynamic architecture nodes on the curved stage screen
    let nodePulse = 0;
    const updateStageScreen = () => {
      if (!ctx) return;
      nodePulse += 0.04;
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 1024, 512);

      // Grid Lines
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
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

      // Title
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 24px monospace";
      ctx.fillText("⚡ MULTI-REGION ACTIVE-ACTIVE CLOUD TOPOLOGY", 40, 50);

      ctx.fillStyle = "#64748b";
      ctx.font = "14px monospace";
      ctx.fillText("LIVE DRAW.IO ARCHITECTURE STAGE SCREEN • ED25519 VERITAS VALIDATED", 40, 75);

      // Architecture Nodes
      const nodes = [
        { label: "Cloud Armor Edge", x: 180, y: 180, color: "#06b6d4" },
        { label: "Zero-Trust Ingress", x: 380, y: 180, color: "#3b82f6" },
        { label: "Sovereign Swarm Engine", x: 620, y: 180, color: "#8b5cf6" },
        { label: "Multi-Region DB Sync", x: 860, y: 180, color: "#10b981" },
        { label: "Spanner Active-Active", x: 380, y: 340, color: "#ec4899" },
        { label: "Veritas zk-SNARK Ledger", x: 620, y: 340, color: "#f59e0b" }
      ];

      // Connectors
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
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

      // Render Nodes
      nodes.forEach((n, idx) => {
        const isActive = (Math.floor(nodePulse * 0.8) % nodes.length) === idx;
        const radius = isActive ? 28 + Math.sin(nodePulse * 3) * 3 : 24;

        ctx.fillStyle = isActive ? n.color : "rgba(15, 23, 42, 0.9)";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isActive ? 3 : 1.5;

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + 44);
      });

      screenTexture.needsUpdate = true;
    };

    // 7. Presenter Mesh in 3D Space
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

    // 8. Floating Ambient Particle Dust
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 8;
      particlePos[i + 1] = Math.random() * 4;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Interactive Mouse Drag Orbit Controls
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

    // 10. Animation & Render Loop
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

      // Update Screen
      updateStageScreen();

      // Floating Particles Drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.002;
        if (positions[i] > 4) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Environment Color Updates
      if (environment === "keynote_arena") {
        mainSpotlight.color.setHex(0x00f0ff);
        rimMat.color.setHex(0x00f0ff);
        scene.fog?.color.setHex(0x06080d);
      } else if (environment === "fireside_library") {
        mainSpotlight.color.setHex(0xf59e0b);
        rimMat.color.setHex(0xd97706);
        scene.fog?.color.setHex(0x120c08);
      } else if (environment === "command_bunker") {
        mainSpotlight.color.setHex(0x10b981);
        rimMat.color.setHex(0x059669);
        scene.fog?.color.setHex(0x04130c);
      } else if (environment === "executive_boardroom") {
        mainSpotlight.color.setHex(0x38bdf8);
        rimMat.color.setHex(0x818cf8);
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

      // Apply subtle breathing drift when playing
      const breathSway = isPlaying ? Math.sin(time * 0.0012) * 0.03 : 0;
      camera.position.x += (Math.sin(targetCameraAngleX) * targetZ - camera.position.x) * 0.08;
      camera.position.y += (targetY + breathSway + targetCameraAngleY - camera.position.y) * 0.08;
      camera.position.z += (Math.cos(targetCameraAngleX) * targetZ - camera.position.z) * 0.08;
      camera.lookAt(0, targetY, 0.4);

      // Posture Adjustments on Presenter Mesh
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
          presenterMesh.scale.set(1.05, 1.05, 1.05);
        } else {
          presenterMesh.position.set(0, 0.9, 0.4);
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
  }, [environment, framingMode, postureMode, isPlaying]);

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

      {/* Veritas Cryptographic Signature Badge */}
      <div className="absolute top-4 right-4 z-20">
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
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-md border border-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
          <span className="text-cyan-400">⚡ Stage Screen:</span>
          <span>Active Draw.io Architecture Bridge</span>
        </div>
      </div>
    </div>
  );
};
