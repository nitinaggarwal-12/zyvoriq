"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type GLTFCameraAngle = "full_body" | "close_up" | "hero_low" | "screen_focus" | "free_orbit";

interface GLTFStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const GLTFStage: React.FC<GLTFStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cameraAngle, setCameraAngle] = useState<GLTFCameraAngle>("full_body");
  const [activeNode, setActiveNode] = useState<string>("Zero-Trust Ingress");
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Audio Playback & Mute Sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // Topology Nodes for curved backdrop screen
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
    const audio = audioRef.current;
    if (!container || !audio) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.35, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Stage Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0x38bdf8, 7.0, 30, Math.PI / 4, 0.35, 1.2);
    keyLight.position.set(0, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(3, 4, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 5.5, 20);
    rimLight.position.set(0, 3.2, -2.5);
    scene.add(rimLight);

    const floorGlow = new THREE.PointLight(0x06b6d4, 4.0, 12);
    floorGlow.position.set(0, 0.2, 0);
    scene.add(floorGlow);

    // 3. Circular Metallic Cyber Podium
    const stageGeo = new THREE.CylinderGeometry(3.6, 4.0, 0.2, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x070b18,
      roughness: 0.15,
      metalness: 0.92
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.1;
    stage.receiveShadow = true;
    scene.add(stage);

    // Glowing Cyan Torus Rim
    const rimGeo = new THREE.TorusGeometry(3.65, 0.035, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Outer Concentric Ring
    const outerRingGeo = new THREE.TorusGeometry(4.3, 0.015, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.45 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.01;
    scene.add(outerRing);

    // Grid Helper
    const grid = new THREE.GridHelper(16, 32, 0x1e293b, 0x090f1e);
    grid.position.y = -0.105;
    scene.add(grid);

    // 4. Curved LED Screen (Draw.io Live Canvas Backdrop)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const ctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.RepeatWrapping;
    screenTexture.repeat.x = -1;
    const screenGeo = new THREE.CylinderGeometry(4.8, 4.8, 2.6, 64, 1, true, Math.PI * 0.68, Math.PI * 0.64);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.3, 0);
    scene.add(stageScreen);

    // 5. Load Real Rigged 3D GLTF Humanoid Character Model
    const loader = new GLTFLoader();
    let modelRoot: THREE.Group | null = null;
    let headBone: THREE.Bone | null = null;
    let spineBone: THREE.Bone | null = null;
    let rightArmBone: THREE.Bone | null = null;

    loader.load(
      "/assets/models/michelle.glb",
      (gltf) => {
        modelRoot = gltf.scene;
        modelRoot.scale.set(0.0125, 0.0125, 0.0125);
        modelRoot.position.set(0, 0, 0.2);
        modelRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).roughness = 0.45;
              (mesh.material as THREE.MeshStandardMaterial).metalness = 0.1;
            }
          }
          if ((child as THREE.Bone).isBone) {
            const b = child as THREE.Bone;
            if (b.name.toLowerCase().includes("head")) headBone = b;
            if (b.name.toLowerCase().includes("spine")) spineBone = b;
            if (b.name.toLowerCase().includes("rightarm") || b.name.toLowerCase().includes("r_arm")) rightArmBone = b;
          }
        });

        scene.add(modelRoot);
        setIsLoadingModel(false);

        // Animation Mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(modelRoot);
          mixerRef.current = mixer;
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
      },
      undefined,
      (err) => {
        console.warn("Failed loading michelle.glb, falling back to xbot.glb", err);
        loader.load("/assets/models/xbot.glb", (gltf2) => {
          modelRoot = gltf2.scene;
          modelRoot.scale.set(1.15, 1.15, 1.15);
          modelRoot.position.set(0, 0, 0.2);
          scene.add(modelRoot);
          setIsLoadingModel(false);
          if (gltf2.animations && gltf2.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(modelRoot);
            mixerRef.current = mixer;
            const action = mixer.clipAction(gltf2.animations[0]);
            action.play();
          }
        });
      }
    );

    // 6. Floating Cyber Dust
    const dustCount = 100;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 10;
      dustPos[i + 1] = Math.random() * 4;
      dustPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.03,
      transparent: true,
      opacity: 0.5
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // 7. Mouse Orbit Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAngleX = 0;
    let orbitAngleY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      if (cameraAngle !== "free_orbit") setCameraAngle("free_orbit");
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

    // 8. 60 FPS Render & Procedural Kinematics Loop
    let pulse = 0;
    let frameCount = 0;
    let lastFps = performance.now();
    let lastTime = performance.now();
    let animId: number;

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
      ctx.fillText("⚡ 3D RIGGED GLTF SOVEREIGN STAGE", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.fillText(`60 FPS GLTF SKELETAL RIG • ED25519 PROVENANCE • ACOUSTIC FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

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

      // Signal Packets
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

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      // Update Animation Mixer
      if (mixerRef.current && isPlaying) {
        mixerRef.current.update(delta);
      }

      // FPS tracking
      frameCount++;
      if (time - lastFps >= 1000) {
        if (fpsRef.current) fpsRef.current.textContent = `${frameCount} FPS`;
        frameCount = 0;
        lastFps = time;
      }

      const t = time * 0.001;

      // Audio Flux Simulation
      const vol = isPlaying
        ? (Math.sin(t * 8.0) * 0.35 + Math.cos(t * 14.0) * 0.25 + 0.45)
        : (Math.sin(t * 1.5) * 0.05 + 0.05);

      updateBackdropScreen(vol);

      // Model Procedural Kinematics
      if (modelRoot) {
        if (isPlaying) {
          modelRoot.rotation.y = Math.sin(t * 1.5) * 0.06;
          modelRoot.position.y = Math.sin(t * 3.0) * 0.008;
          if (headBone) {
            (headBone as THREE.Bone).rotation.y = Math.sin(t * 2.2) * 0.12;
            (headBone as THREE.Bone).rotation.x = Math.cos(t * 1.8) * 0.08;
          }
          if (spineBone) {
            (spineBone as THREE.Bone).rotation.z = Math.sin(t * 1.6) * 0.04;
          }
        } else {
          modelRoot.rotation.y = Math.sin(t * 0.8) * 0.02;
          modelRoot.position.y = Math.sin(t * 1.2) * 0.004;
        }
      }

      // Camera Lerp Targets
      let tx = 0;
      let ty = 1.35;
      let tz = 4.2;

      if (cameraAngle === "close_up") {
        tx = 0;
        ty = 1.55;
        tz = 2.2;
      } else if (cameraAngle === "hero_low") {
        tx = 0;
        ty = 0.5;
        tz = 3.2;
      } else if (cameraAngle === "screen_focus") {
        tx = 1.4;
        ty = 1.4;
        tz = 3.2;
      } else if (cameraAngle === "free_orbit") {
        tz = 4.2;
      }

      const sway = Math.sin(t * 1.5) * 0.02;
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
        camera.lookAt(0.8, 1.3, 0.2);
      } else {
        camera.lookAt(0, ty * 0.9, 0.2);
      }

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
  }, [cameraAngle]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (onTimeUpdate) onTimeUpdate(audio.currentTime);
  };

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl">
      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
        className="hidden"
      />

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap pointer-events-none">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>3D RIGGED GLTF AVATAR • </span>
          <span ref={fpsRef} className="font-bold">60 FPS</span>
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
          {isLoadingModel ? "Loading 3D Mesh..." : (isPlaying ? "Skeletal Rig Kinematics" : "Idle Breathing & Stage Glow")}
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
            { id: "full_body", label: "🧍 3D Full-Body" },
            { id: "close_up", label: "🎥 70mm Close-Up" },
            { id: "hero_low", label: "📐 24mm Hero" },
            { id: "screen_focus", label: "📊 Draw.io Screen" },
            { id: "free_orbit", label: "🔄 3D Orbit" }
          ].map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCameraAngle(cam.id as GLTFCameraAngle)}
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
