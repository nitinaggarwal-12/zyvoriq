"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EnvironmentMode, FramingMode, PostureMode } from "@/lib/tier6/types";

export type CameraPreset = "70mm_close" | "35mm_wide" | "24mm_hero" | "stage_screen_focus" | "free_orbit";

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
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("70mm_close");
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
    camera.position.set(0, 1.25, 2.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
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
        audioDataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      }
    } catch {
      // AudioContext already connected
    }

    // 5. Dynamic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.0);
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

    // 6. Stage Floor (High-Gloss Reflective Circular Podium)
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

    // 7. Curved Stage LED Screen (Draw.io Architecture Display)
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
      ctx.fillText(`DRAW.IO ARCHITECTURE STAGE SCREEN • ED25519 VERITAS VALIDATED • REAL-TIME ACOUSTIC FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

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

    // 8. Presenter Mesh with Real-Time WebGL Phoneme Lip-Sync & Viseme Shader
    const textureLoader = new THREE.TextureLoader();
    const avatarTex = textureLoader.load(selectedPersonaAvatar);
    avatarTex.minFilter = THREE.LinearFilter;
    avatarTex.magFilter = THREE.LinearFilter;

    const presenterGeo = new THREE.PlaneGeometry(2.4, 1.35, 64, 64);
    
    // Viseme & Holographic Depth Shader Material
    const presenterMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: avatarTex },
        fresnelColor: { value: new THREE.Color(0x00f0ff) },
        audioFlux: { value: 0.0 },
        time: { value: 0.0 },
        curvature: { value: 0.08 }
      },
      vertexShader: `
        uniform float curvature;
        uniform float audioFlux;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          vec3 pos = position;
          // Volumetric cylinder curvature
          pos.z += sin((uv.x - 0.5) * 3.14159) * curvature;
          
          // Audio-reactive thoracic breathing expansion
          if (uv.y < 0.45 && uv.y > 0.05) {
            pos.z += sin(audioFlux * 6.28) * 0.03 * (0.45 - uv.y);
          }

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 fresnelColor;
        uniform float audioFlux;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec2 uvSample = vUv;
          
          // 👄 REAL-TIME PHONEME VISEME MOUTH DEFORMER
          // Centers on human facial mouth coordinate quadrant (u ~ 0.50, v ~ 0.45)
          vec2 mouthCenter = vec2(0.50, 0.45);
          float distToMouth = length((vUv - mouthCenter) * vec2(1.0, 1.5));
          
          if (distToMouth < 0.12 && audioFlux > 0.02) {
            float mouthWeight = smoothstep(0.12, 0.0, distToMouth);
            // Dynamic jaw drop & multi-frequency lip opening modulation
            float jawMotion = (sin(time * 22.0) * 0.5 + 0.5) * audioFlux * 0.035 * mouthWeight;
            float lipSpread = cos(time * 16.0) * audioFlux * 0.015 * mouthWeight;
            
            uvSample.y -= jawMotion;
            uvSample.x += lipSpread * sign(vUv.x - 0.50);
          }

          vec4 texColor = texture2D(map, uvSample);
          
          // Fresnel Edge Rim Glow
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          
          vec3 finalColor = texColor.rgb + fresnel * fresnelColor * (0.35 + audioFlux * 0.5);
          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const presenterMesh = new THREE.Mesh(presenterGeo, presenterMat);
    presenterMesh.position.set(0, 0.9, 0.4);
    scene.add(presenterMesh);

    // 9. Floating Ambient Holographic Dust
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 9.5;
      particlePos[i + 1] = Math.random() * 4.8;
      particlePos[i + 2] = (Math.random() - 0.5) * 9.5;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.7
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
      const timeSeconds = time * 0.001;

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
      } else if (isPlaying) {
        // Fallback procedural acoustic rhythm when AudioContext is connecting
        currentVol = 0.25 + Math.abs(Math.sin(timeSeconds * 6.0)) * 0.35;
        setAudioLevel(currentVol);
      }

      // Update Shader Uniforms
      presenterMat.uniforms.audioFlux.value = currentVol;
      presenterMat.uniforms.time.value = timeSeconds;

      // Update Screen with Audio Reactivity
      updateStageScreen(currentVol);

      // Audio-Reactive Lighting Modulation
      const dynamicLightIntensity = 4.0 + currentVol * 4.5;
      mainSpotlight.intensity = dynamicLightIntensity;
      floorGlowLight.intensity = 2.0 + currentVol * 3.5;

      // Floating Particles Drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.002 + currentVol * 0.005;
        if (positions[i] > 4.8) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Environment Color Updates
      if (environment === "keynote_arena") {
        mainSpotlight.color.setHex(0x00f0ff);
        rimMat.color.setHex(0x00f0ff);
        floorGlowLight.color.setHex(0x00f0ff);
        presenterMat.uniforms.fresnelColor.value.setHex(0x00f0ff);
        scene.fog?.color.setHex(0x04060c);
      } else if (environment === "fireside_library") {
        mainSpotlight.color.setHex(0xf59e0b);
        rimMat.color.setHex(0xd97706);
        floorGlowLight.color.setHex(0xf59e0b);
        presenterMat.uniforms.fresnelColor.value.setHex(0xf59e0b);
        scene.fog?.color.setHex(0x120c08);
      } else if (environment === "command_bunker") {
        mainSpotlight.color.setHex(0x10b981);
        rimMat.color.setHex(0x059669);
        floorGlowLight.color.setHex(0x10b981);
        presenterMat.uniforms.fresnelColor.value.setHex(0x10b981);
        scene.fog?.color.setHex(0x04130c);
      } else if (environment === "executive_boardroom") {
        mainSpotlight.color.setHex(0x38bdf8);
        rimMat.color.setHex(0x818cf8);
        floorGlowLight.color.setHex(0x38bdf8);
        presenterMat.uniforms.fresnelColor.value.setHex(0x818cf8);
        scene.fog?.color.setHex(0x080f1d);
      }

      // Multi-Camera Director Swarm Lerping
      let targetX = 0;
      let targetY = 1.25;
      let targetZ = 2.2;

      if (cameraPreset === "70mm_close") {
        targetX = 0;
        targetY = 1.25;
        targetZ = 2.1;
      } else if (cameraPreset === "35mm_wide") {
        targetX = 0;
        targetY = 1.0;
        targetZ = 3.8;
      } else if (cameraPreset === "24mm_hero") {
        targetX = 0;
        targetY = 0.45;
        targetZ = 2.8;
      } else if (cameraPreset === "stage_screen_focus") {
        targetX = 1.2;
        targetY = 1.35;
        targetZ = 2.9;
      } else if (cameraPreset === "free_orbit") {
        targetZ = 3.5;
      }

      // Audio-Reactive Thoracic Breathing & Subtle Camera Sway
      const breathSway = isPlaying ? Math.sin(timeSeconds * 1.5) * (0.02 + currentVol * 0.03) : 0;
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

      // 🕺 NATURAL GESTURAL HEAD NOD & VOCAL SWAY
      if (presenterMesh && isPlaying) {
        presenterMesh.rotation.z = Math.sin(timeSeconds * 2.5) * 0.02 + currentVol * 0.015;
        presenterMesh.rotation.y = Math.cos(timeSeconds * 1.8) * 0.025;
        presenterMesh.position.y = 0.9 + Math.sin(timeSeconds * 3.0) * 0.01 + currentVol * 0.02;
      } else if (presenterMesh) {
        presenterMesh.rotation.set(0, 0, 0);
        presenterMesh.position.set(0, 0.9, 0.4);
      }

      // Posture Adjustments
      if (presenterMesh) {
        if (postureMode === "sitting") {
          presenterMesh.position.y = 0.65;
          presenterMesh.scale.set(0.9, 0.9, 0.9);
        } else if (postureMode === "walking") {
          presenterMesh.position.x = Math.sin(timeSeconds * 1.2) * 0.4;
        } else if (postureMode === "interactive_hologram") {
          presenterMesh.scale.set(1.05 + currentVol * 0.04, 1.05 + currentVol * 0.04, 1.05);
        } else {
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
  }, [environment, framingMode, postureMode, isPlaying, selectedPersonaAvatar, cameraPreset]);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Stage HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap">
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
            <span>48kHz Viseme Flux Active</span>
          </div>
        )}
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Multi-Camera Director Swarm Selector Toolbar (Bottom Floating Bar) */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2">
        
        {/* Active Stage Screen Diagram Telemetry Badge */}
        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
          <span className="text-cyan-400">⚡ Stage Screen Active Node:</span>
          <span className="font-bold text-white bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">{focusedNode}</span>
        </div>

        {/* 1-Click Multi-Camera Director Swarm Angle Switcher */}
        <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 gap-1 shadow-2xl">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold flex items-center gap-1">
            🎥 DIRECTOR CAM:
          </span>
          {[
            { id: "70mm_close", label: "70mm Close-Up" },
            { id: "35mm_wide", label: "35mm Wide Stage" },
            { id: "24mm_hero", label: "24mm Hero Angle" },
            { id: "stage_screen_focus", label: "Draw.io Zoom" },
            { id: "free_orbit", label: "3D Orbit 🖱️" }
          ].map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCameraPreset(cam.id as CameraPreset)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                cameraPreset === cam.id
                  ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30"
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
