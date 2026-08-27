"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type Avatar3DCameraAngle = "full_body" | "close_up" | "hero_low" | "screen_focus" | "free_orbit";

interface Avatar3DStageProps {
  isPlaying: boolean;
  isMuted?: boolean;
  selectedPersonaName: string;
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const Avatar3DStage: React.FC<Avatar3DStageProps> = ({
  isPlaying,
  isMuted = false,
  selectedPersonaName,
  audioUrl,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cameraAngle, setCameraAngle] = useState<Avatar3DCameraAngle>("full_body");
  const [activeNode, setActiveNode] = useState<string>("Zero-Trust Ingress");
  const fpsRef = useRef<HTMLSpanElement>(null);

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
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Stage Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.SpotLight(0x38bdf8, 6.0, 30, Math.PI / 4, 0.4, 1.2);
    keyLight.position.set(0, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xa855f7, 5.0, 20);
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

    // 5. Build Procedural 3D Rigged Humanoid Presenter
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0, 0.2);
    scene.add(avatarGroup);

    // Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.2
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xe0a98b,
      roughness: 0.55,
      metalness: 0.05
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85
    });
    const cyberGlowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    // Legs & Shoes (Ground to y = 0.8)
    const leftLegGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.75, 16);
    const leftLeg = new THREE.Mesh(leftLegGeo, suitMat);
    leftLeg.position.set(-0.16, 0.38, 0);
    avatarGroup.add(leftLeg);

    const rightLegGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.75, 16);
    const rightLeg = new THREE.Mesh(rightLegGeo, suitMat);
    rightLeg.position.set(0.16, 0.38, 0);
    avatarGroup.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.24);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.16, 0.04, 0.04);
    avatarGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.16, 0.04, 0.04);
    avatarGroup.add(rightShoe);

    // Torso / Blazer Spine Group
    const spineGroup = new THREE.Group();
    spineGroup.position.set(0, 0.76, 0);
    avatarGroup.add(spineGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.65, 16);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 0.32;
    spineGroup.add(torso);

    // Inner Shirt & Tie/Accent
    const shirtGeo = new THREE.PlaneGeometry(0.16, 0.3);
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.set(0, 0.38, 0.22);
    spineGroup.add(shirt);

    // Head Group (Neck + Head + Jaw + Eyes + Hair)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.72, 0);
    spineGroup.add(headGroup);

    const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.14, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.04;
    headGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.16, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.22;
    headGroup.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.175, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.24, -0.02);
    headGroup.add(hair);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.06, 0.24, 0.14);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.06, 0.24, 0.14);
    headGroup.add(rightEye);

    // Articulated 3D Jaw / Mouth Viseme Mesh
    const jawGeo = new THREE.BoxGeometry(0.08, 0.035, 0.04);
    const jawMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.position.set(0, 0.14, 0.15);
    headGroup.add(jaw);

    // Headset Mic
    const micArmGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.18);
    const micArm = new THREE.Mesh(micArmGeo, cyberGlowMat);
    micArm.rotation.z = Math.PI / 3;
    micArm.position.set(-0.12, 0.18, 0.08);
    headGroup.add(micArm);

    // Left Arm Hierarchy (Shoulder -> Upper Arm -> Forearm)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 0.54, 0);
    spineGroup.add(leftArmGroup);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.32, 16);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, suitMat);
    leftUpperArm.position.y = -0.16;
    leftArmGroup.add(leftUpperArm);

    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0, -0.32, 0);
    leftArmGroup.add(leftForearmGroup);

    const leftForearmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.3, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
    leftForearm.position.y = -0.15;
    leftForearmGroup.add(leftForearm);

    // Right Arm Hierarchy (Keynote Gesturing Arm)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 0.54, 0);
    spineGroup.add(rightArmGroup);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.32, 16);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, suitMat);
    rightUpperArm.position.y = -0.16;
    rightArmGroup.add(rightUpperArm);

    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(0, -0.32, 0);
    rightArmGroup.add(rightForearmGroup);

    const rightForearmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.3, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeo, skinMat);
    rightForearm.position.y = -0.15;
    rightForearmGroup.add(rightForearm);

    // 6. Cyber Dust
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
      ctx.fillText("⚡ 3D RIGGED SOVEREIGN ARCHITECTURE", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.fillText(`60 FPS PROCEDURAL KINEMATICS • ED25519 PROVENANCE • ACOUSTIC FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

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

      // Procedural Skeletal Kinematics
      if (isPlaying) {
        // Spine breathing & speech sway
        spineGroup.rotation.z = Math.sin(t * 2.0) * 0.035;
        spineGroup.rotation.y = Math.cos(t * 1.5) * 0.05;
        spineGroup.position.y = 0.76 + Math.sin(t * 3.5) * 0.012;

        // Head tracking & nodding
        headGroup.rotation.x = Math.sin(t * 3.0) * 0.06;
        headGroup.rotation.y = Math.sin(t * 1.8) * 0.08;

        // Active Viseme Lip-Sync (Jaw morphing open/close with speech volume)
        const mouthOpen = Math.max(0.01, vol * 0.08);
        jaw.scale.set(1.0 + vol * 0.3, 1.0 + mouthOpen * 40, 1.0);
        jaw.position.y = 0.14 - mouthOpen * 0.5;

        // Right Arm Keynote Gesturing (Pointing to Draw.io screen, opening palm)
        rightArmGroup.rotation.z = -Math.PI / 4 + Math.sin(t * 2.2) * 0.25;
        rightArmGroup.rotation.x = Math.cos(t * 1.8) * 0.35;
        rightForearmGroup.rotation.z = -Math.PI / 6 + Math.sin(t * 2.8) * 0.3;

        // Left Arm Balanced Keynote Sway
        leftArmGroup.rotation.z = Math.PI / 6 + Math.sin(t * 1.6) * 0.15;
        leftArmGroup.rotation.x = Math.cos(t * 2.0) * 0.2;
        leftForearmGroup.rotation.z = Math.PI / 8 + Math.sin(t * 2.4) * 0.2;
      } else {
        // Idle state: Subtle breathing
        spineGroup.rotation.z = Math.sin(t * 1.2) * 0.01;
        spineGroup.rotation.y = Math.cos(t * 0.8) * 0.02;
        spineGroup.position.y = 0.76 + Math.sin(t * 1.5) * 0.005;

        headGroup.rotation.x = Math.sin(t * 1.0) * 0.02;
        headGroup.rotation.y = Math.sin(t * 0.7) * 0.03;

        jaw.scale.set(1.0, 1.0, 1.0);
        jaw.position.y = 0.14;

        rightArmGroup.rotation.z = -Math.PI / 10 + Math.sin(t * 1.2) * 0.05;
        rightArmGroup.rotation.x = 0;
        rightForearmGroup.rotation.z = 0;

        leftArmGroup.rotation.z = Math.PI / 10 - Math.sin(t * 1.2) * 0.05;
        leftArmGroup.rotation.x = 0;
        leftForearmGroup.rotation.z = 0;
      }

      // Camera Lerp Targets
      let tx = 0;
      let ty = 1.35;
      let tz = 4.2;

      if (cameraAngle === "close_up") {
        tx = 0;
        ty = 1.5;
        tz = 2.0;
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
          <span>3D RIGGED AVATAR • </span>
          <span ref={fpsRef} className="font-bold">60 FPS</span>
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-[11px] pointer-events-auto">
          {isPlaying ? "Skeletal Kinematics & Viseme Sync" : "Idle Breathing & Stage Glow"}
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
              onClick={() => setCameraAngle(cam.id as Avatar3DCameraAngle)}
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
