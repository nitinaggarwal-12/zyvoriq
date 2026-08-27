"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type FullBodyCameraAngle = "full_stage" | "close_up" | "hero_low" | "screen_focus" | "free_orbit";

interface FullBody3DStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const FullBody3DStage: React.FC<FullBody3DStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  selectedPersonaAvatar,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraAngle, setCameraAngle] = useState<FullBodyCameraAngle>("full_stage");
  const [activeNode, setActiveNode] = useState<string>("Zero-Trust Ingress");
  const fpsRef = useRef<HTMLSpanElement>(null);

  const personaSlug = selectedPersonaName.toLowerCase().split(" ")[0] || "priya";
  const videoSrc = `/assets/video/${personaSlug}_master.mp4`;

  // Synchronize Mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Synchronize Play/Pause with Video Element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, videoSrc]);

  // Architecture Topology Nodes for curved backdrop display
  const TOPOLOGY_NODES = [
    { label: "Cloud Armor Edge", x: 180, y: 180, color: "#06b6d4", metrics: "1.4M req/s" },
    { label: "Zero-Trust Ingress", x: 380, y: 180, color: "#3b82f6", metrics: "mTLS Verified" },
    { label: "Sovereign Swarm", x: 620, y: 180, color: "#8b5cf6", metrics: "Gemini 3.1 Clustered" },
    { label: "Global Mesh Sync", x: 860, y: 180, color: "#10b981", metrics: "4-Region Active" },
    { label: "Spanner Active", x: 380, y: 340, color: "#ec4899", metrics: "99.999% SLA" },
    { label: "zk-SNARK Ledger", x: 620, y: 340, color: "#f59e0b", metrics: "Ed25519 Finality" }
  ];

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // 1. Three.js Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.06);

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.25, 3.8);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const mainSpotlight = new THREE.SpotLight(0x00f0ff, 5.0, 30, Math.PI / 4, 0.35, 1.2);
    mainSpotlight.position.set(0, 6, 4);
    mainSpotlight.castShadow = true;
    scene.add(mainSpotlight);

    const rimLight = new THREE.PointLight(0x6366f1, 4.0, 20);
    rimLight.position.set(0, 2.5, -2.5);
    scene.add(rimLight);

    const floorGlow = new THREE.PointLight(0x00f0ff, 3.0, 12);
    floorGlow.position.set(0, 0.2, 0);
    scene.add(floorGlow);

    // 5. Circular Reflective Stage Podium Floor
    const stageGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.2, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x060913,
      roughness: 0.1,
      metalness: 0.95
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.1;
    stage.receiveShadow = true;
    scene.add(stage);

    // Glowing Neon Torus Rim
    const rimGeo = new THREE.TorusGeometry(3.65, 0.035, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Outer Concentric Ring
    const outerRingGeo = new THREE.TorusGeometry(4.4, 0.015, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // Grid Floor
    const grid = new THREE.GridHelper(16, 32, 0x1e293b, 0x080f1d);
    grid.position.y = -0.105;
    scene.add(grid);

    // 6. Curved LED Stage Screen (Draw.io Topology Canvas)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const ctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.RepeatWrapping;
    screenTexture.repeat.x = -1;
    const screenGeo = new THREE.CylinderGeometry(4.8, 4.8, 2.5, 64, 1, true, Math.PI * 0.68, Math.PI * 0.64);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.25, 0);
    scene.add(stageScreen);

    let pulse = 0;
    const updateBackdropScreen = (vol: number) => {
      if (!ctx) return;
      pulse += 0.035;
      ctx.fillStyle = "#040711";
      ctx.fillRect(0, 0, 1024, 512);

      // Cyber Grid
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

      // Title & Telemetry Header
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px monospace";
      ctx.fillText("⚡ MULTI-REGION SOVEREIGN ARCHITECTURE", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.fillText(`LIVE DRAW.IO STAGE SCREEN • ED25519 PROVENANCE • ACOUSTIC FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

      // Connection Lines
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
      const packetPos = (pulse * 90) % 680;
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(180 + packetPos, 180, 4.5 + vol * 4, 0, Math.PI * 2);
      ctx.fill();

      // Nodes
      const activeIdx = Math.floor((pulse * 0.5) % TOPOLOGY_NODES.length);
      TOPOLOGY_NODES.forEach((n, idx) => {
        const isActive = activeIdx === idx;
        const radius = isActive ? 28 + Math.sin(pulse * 3) * 3 + vol * 8 : 22;

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
        ctx.fillText(n.metrics, n.x, n.y + 54);
      });

      setActiveNode(TOPOLOGY_NODES[activeIdx].label);
      screenTexture.needsUpdate = true;
    };

    // 7. Live 3D Presenter Mesh with VideoTexture & Avatar Fallback
    const texLoader = new THREE.TextureLoader();
    const avatarTexture = texLoader.load(selectedPersonaAvatar);
    avatarTexture.minFilter = THREE.LinearFilter;
    avatarTexture.magFilter = THREE.LinearFilter;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    const presenterGeo = new THREE.PlaneGeometry(2.4, 1.45, 32, 32);
    const presenterMat = new THREE.MeshBasicMaterial({
      map: avatarTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const presenter = new THREE.Mesh(presenterGeo, presenterMat);
    presenter.position.set(0, 0.73, 0.3);
    scene.add(presenter);

    // Presenter Stage Frame / Bezel
    const frameGeo = new THREE.PlaneGeometry(2.44, 1.49);
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      wireframe: false,
      side: THREE.BackSide
    });
    const presenterFrame = new THREE.Mesh(frameGeo, frameMat);
    presenterFrame.position.set(0, 0.73, 0.29);
    scene.add(presenterFrame);

    // 8. Floating Ambient Cyber Dust
    const dustCount = 120;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 10;
      dustPos[i + 1] = Math.random() * 4;
      dustPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.035,
      transparent: true,
      opacity: 0.6
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // 9. Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAngleX = 0;
    let orbitAngleY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      if (cameraAngle !== "free_orbit") {
        setCameraAngle("free_orbit");
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      orbitAngleX -= dx * 0.005;
      orbitAngleY = Math.max(-0.6, Math.min(0.6, orbitAngleY + dy * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 10. 60 FPS Real-Time Render & Kinematics Loop
    let frameCount = 0;
    let lastFps = performance.now();
    let animId: number;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      // Smooth FPS calculation via direct DOM ref
      frameCount++;
      if (time - lastFps >= 1000) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `${frameCount} FPS`;
        }
        frameCount = 0;
        lastFps = time;
      }

      const t = time * 0.001;

      // Audio Flux Simulation
      const vol = isPlaying
        ? (Math.sin(t * 7.5) * 0.35 + Math.cos(t * 13.0) * 0.25 + 0.45)
        : (Math.sin(t * 1.5) * 0.05 + 0.05);

      updateBackdropScreen(vol);

      // Dust Drift
      const dPos = dustGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < dustCount * 3; i += 3) {
        dPos[i] -= 0.003;
        if (dPos[i] < 0) dPos[i] = 4;
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Floor Glow
      floorGlow.intensity = 2.0 + vol * 1.8;

      // Camera Lerp Targets
      let tx = 0;
      let ty = 1.25;
      let tz = 3.8;

      if (cameraAngle === "close_up") {
        tx = 0;
        ty = 1.25;
        tz = 2.1;
      } else if (cameraAngle === "hero_low") {
        tx = 0;
        ty = 0.45;
        tz = 2.8;
      } else if (cameraAngle === "screen_focus") {
        tx = 1.2;
        ty = 1.35;
        tz = 2.9;
      } else if (cameraAngle === "free_orbit") {
        tz = 3.8;
      }

      // Sway & Breathing
      const sway = Math.sin(t * 1.8) * (0.015 + vol * 0.02);
      if (cameraAngle === "free_orbit") {
        camera.position.x += (Math.sin(orbitAngleX) * tz - camera.position.x) * 0.08;
        camera.position.y += (ty + sway + orbitAngleY - camera.position.y) * 0.08;
        camera.position.z += (Math.cos(orbitAngleX) * tz - camera.position.z) * 0.08;
      } else {
        camera.position.x += (tx - camera.position.x) * 0.06;
        camera.position.y += (ty + sway - camera.position.y) * 0.06;
        camera.position.z += (tz - camera.position.z) * 0.06;
      }

      if (cameraAngle === "screen_focus") {
        camera.lookAt(0.6, 1.25, 0.2);
      } else {
        camera.lookAt(0, ty, 0.4);
      }

      // Dynamic Presenter Texture & Kinematics in 3D Space
      if (isPlaying || (!video.paused && video.currentTime > 0)) {
        presenterMat.map = videoTexture;
        videoTexture.needsUpdate = true;
        presenter.rotation.z = Math.sin(t * 2.5) * 0.015 + vol * 0.01;
        presenter.rotation.y = Math.cos(t * 1.8) * 0.02;
        presenter.position.y = 0.73 + Math.sin(t * 3.0) * 0.008;
      } else {
        presenterMat.map = avatarTexture;
        presenter.rotation.z = Math.sin(t * 1.2) * 0.005;
        presenter.rotation.y = Math.cos(t * 0.9) * 0.008;
        presenter.position.y = 0.73 + Math.sin(t * 1.5) * 0.004;
      }
      presenterFrame.position.y = presenter.position.y;
      presenterFrame.rotation.z = presenter.rotation.z;
      presenterFrame.rotation.y = presenter.rotation.y;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedPersonaAvatar, videoSrc, cameraAngle]);

  // Seamless Timecode Sync
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime);
    }

    if (video.duration > 0 && video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0.01;
      video.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl">
      {/* Master Video Element with active DOM decoding for Three.js VideoTexture */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={selectedPersonaAvatar}
        onTimeUpdate={handleTimeUpdate}
        playsInline
        preload="auto"
        muted={isMuted}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "16px",
          height: "9px",
          opacity: 0.01,
          pointerEvents: "none",
          zIndex: -1
        }}
      />

      {/* Three.js 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>3D FULL-BODY STAGE • </span>
          <span ref={fpsRef} className="font-bold">60 FPS</span>
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
          {isPlaying ? "Live Motion & Speech Diffusion" : "Idle Breathing & Lighting"}
        </div>
      </div>

      {/* Provenance Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Bottom Director Camera Controls */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2">
        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
          <span className="text-cyan-400">⚡ Active Node:</span>
          <span className="font-bold text-white bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">{activeNode}</span>
        </div>

        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
            🎥 DIRECTOR CAM:
          </span>
          {[
            { id: "full_stage", label: "💃 3D Full-Body Stage" },
            { id: "close_up", label: "🎥 70mm Close-Up" },
            { id: "hero_low", label: "📐 24mm Hero" },
            { id: "screen_focus", label: "📊 Draw.io Screen" },
            { id: "free_orbit", label: "🔄 3D Orbit" }
          ].map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCameraAngle(cam.id as FullBodyCameraAngle)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                cameraAngle === cam.id
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
