"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type CameraPreset = "70mm_close" | "35mm_wide" | "24mm_hero" | "stage_screen_focus" | "free_orbit";

interface ThreeHoloStageProps {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  selectedPersonaName: string;
  selectedPersonaAvatar: string;
  activeScript: string;
}

export const ThreeHoloStage: React.FC<ThreeHoloStageProps> = ({
  audioRef,
  isPlaying,
  selectedPersonaName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState<number>(60);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("35mm_wide");
  const [focusedNode, setFocusedNode] = useState<string>("Overview");
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);

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
    scene.background = new THREE.Color(0x03060f);
    scene.fog = new THREE.FogExp2(0x03060f, 0.05);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.25, 2.4);

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false
      });
    } catch {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        failIfMajorPerformanceCaveat: false
      });
    }
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
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
        analyser.smoothingTimeConstant = 0.8;
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        audioDataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      }
    } catch {
      // AudioContext fallback
    }

    // 5. Cinematic Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(1.5, 3.5, 3.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-2.0, 2.0, 2.5);
    scene.add(fillLight);

    const mainSpotlight = new THREE.SpotLight(0x00f0ff, 3.8, 20, Math.PI / 4, 0.3, 1.2);
    mainSpotlight.position.set(0, 5.0, 2.5);
    mainSpotlight.target.position.set(0, 1.0, 0);
    scene.add(mainSpotlight);
    scene.add(mainSpotlight.target);

    const rimLight = new THREE.PointLight(0x818cf8, 2.8, 12);
    rimLight.position.set(0, 2.2, -1.8);
    scene.add(rimLight);

    const stageGlow = new THREE.PointLight(0x00f0ff, 2.0, 8);
    stageGlow.position.set(0, 0.2, 0);
    scene.add(stageGlow);

    // 6. Stage Floor & Holographic Emitter Pedestal
    const stageGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.16, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x070d1a,
      roughness: 0.15,
      metalness: 0.9
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.08;
    scene.add(stage);

    const rimGeo = new THREE.TorusGeometry(3.55, 0.035, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // Grid Base
    const gridHelper = new THREE.GridHelper(14, 28, 0x1e293b, 0x09101f);
    gridHelper.position.y = -0.085;
    scene.add(gridHelper);

    // 7. Curved Stage LED Screen (Draw.io Cloud Architecture Backdrop at Z = -1.4)
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 512;
    const ctx = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.RepeatWrapping;
    screenTexture.repeat.x = -1;
    const screenGeo = new THREE.CylinderGeometry(4.8, 4.8, 2.4, 64, 1, true, Math.PI * 0.70, Math.PI * 0.60);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.92
    });
    const stageScreen = new THREE.Mesh(screenGeo, screenMat);
    stageScreen.position.set(0, 1.45, -1.4);
    scene.add(stageScreen);

    let nodePulse = 0;
    const updateStageScreen = (vol: number) => {
      if (!ctx) return;
      nodePulse += 0.025;
      ctx.fillStyle = "#050814";
      ctx.fillRect(0, 0, 1024, 512);

      // Cyber Grid Lines
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

      // Title & Live Telemetry
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px monospace";
      ctx.fillText("⚡ MULTI-REGION ACTIVE-ACTIVE CLOUD TOPOLOGY", 40, 45);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px monospace";
      ctx.fillText(`DRAW.IO ARCHITECTURE STAGE SCREEN • ED25519 VERITAS VALIDATED • FLUX: ${(vol * 100).toFixed(0)}%`, 40, 68);

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
      const packetPos = (nodePulse * 75) % 680;
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.arc(180 + packetPos, 180, 4.5 + vol * 3, 0, Math.PI * 2);
      ctx.fill();

      // Render Nodes
      const activeIdx = Math.floor((nodePulse * 0.4) % ARCH_NODES.length);
      ARCH_NODES.forEach((n, idx) => {
        const isActive = activeIdx === idx;
        const radius = isActive ? 26 + Math.sin(nodePulse * 2) * 2 + vol * 4 : 22;

        ctx.fillStyle = isActive ? n.color : "rgba(15, 23, 42, 0.94)";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = isActive ? 3.5 : 1.5;

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

    // 8. 3D GLTF HUMANOID AVATAR LOADER (Pure 3D Rigged Character)
    let mixer: THREE.AnimationMixer | null = null;
    let characterModel: THREE.Group | null = null;
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      "/assets/models/michelle.glb",
      (gltf) => {
        characterModel = gltf.scene;
        characterModel.position.set(0, 0, 0);
        characterModel.scale.set(0.011, 0.011, 0.011); // Michelle scale normalization
        
        characterModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(characterModel);
        setIsModelLoaded(true);

        // Setup Skeletal Animation
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(characterModel);
          const clip = gltf.animations[0];
          const action = mixer.clipAction(clip);
          action.play();
        }
      },
      undefined,
      (err) => {
        console.warn("GLTF Load error, trying xbot.glb fallback", err);
        // Fallback to xbot.glb
        gltfLoader.load("/assets/models/xbot.glb", (fallbackGltf) => {
          characterModel = fallbackGltf.scene;
          characterModel.position.set(0, 0, 0);
          characterModel.scale.set(1.0, 1.0, 1.0);
          scene.add(characterModel);
          setIsModelLoaded(true);
          if (fallbackGltf.animations && fallbackGltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(characterModel);
            const action = mixer.clipAction(fallbackGltf.animations[0]);
            action.play();
          }
        });
      }
    );

    // 9. Floating Holographic Cyber Dust Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 8.0;
      particlePos[i + 1] = Math.random() * 4.0;
      particlePos[i + 2] = (Math.random() - 0.5) * 8.0;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55
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
      targetCameraAngleY = Math.max(-0.35, Math.min(0.35, targetCameraAngleY - deltaY * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 11. 60 FPS Animation & Skeletal Playback Loop
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let smoothAudioFlux = 0;
    let lastClockTime = performance.now();
    let animationId: number;

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      // Delta time for Three.js AnimationMixer
      const delta = (time - lastClockTime) * 0.001;
      lastClockTime = time;

      if (mixer && isPlaying) {
        mixer.update(delta);
      }

      // FPS tracking
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Audio Frequency Processing
      let rawVol = 0;
      if (analyser && audioDataArray && isPlaying) {
        analyser.getByteFrequencyData(audioDataArray as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < audioDataArray.length; i++) {
          sum += audioDataArray[i];
        }
        rawVol = sum / (audioDataArray.length * 255);
      } else if (isPlaying) {
        rawVol = 0.25;
      }

      smoothAudioFlux += (rawVol - smoothAudioFlux) * 0.2;
      setAudioLevel(smoothAudioFlux);

      // Subtle Keynote Head Swivel towards audience on audio
      if (characterModel) {
        characterModel.rotation.y = Math.sin(time * 0.0008) * 0.06;
      }

      // Particle Drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.003;
        if (positions[i] > 4.0) positions[i] = 0.0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update 3D Stage Screen with Audio Flux
      updateStageScreen(smoothAudioFlux);

      // Responsive Stage Lights
      mainSpotlight.intensity = 3.5 + smoothAudioFlux * 1.8;
      stageGlow.intensity = 1.8 + smoothAudioFlux * 1.2;

      // --- Camera Director Presets with Cinematic Framing ---
      let lookTarget = new THREE.Vector3(0, 1.1, 0);

      if (cameraPreset === "70mm_close") {
        camera.position.lerp(new THREE.Vector3(0, 1.45, 1.05), 0.08);
        lookTarget = new THREE.Vector3(0, 1.4, 0);
      } else if (cameraPreset === "35mm_wide") {
        camera.position.lerp(new THREE.Vector3(0, 1.15, 2.3), 0.08);
        lookTarget = new THREE.Vector3(0, 1.0, 0);
      } else if (cameraPreset === "24mm_hero") {
        camera.position.lerp(new THREE.Vector3(0, 0.55, 1.8), 0.08);
        lookTarget = new THREE.Vector3(0, 1.15, 0);
      } else if (cameraPreset === "stage_screen_focus") {
        camera.position.lerp(new THREE.Vector3(1.1, 1.35, 2.1), 0.08);
        lookTarget = new THREE.Vector3(0.3, 1.3, -0.8);
      } else if (cameraPreset === "free_orbit") {
        const radius = 2.0;
        const camX = Math.sin(targetCameraAngleX) * radius;
        const camZ = Math.cos(targetCameraAngleX) * radius;
        const camY = 1.25 + targetCameraAngleY * 1.2;
        camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        lookTarget = new THREE.Vector3(0, 1.0, 0);
      }

      camera.lookAt(lookTarget);
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
  }, [isPlaying, selectedPersonaName, cameraPreset]);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/20 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top 3D Stage HUD Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20 flex-wrap">
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          3D GLTF HOLO-STAGE • {fps} FPS
        </div>
        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-slate-700 text-slate-300 font-mono text-xs">
          {isModelLoaded ? "Rigged GLTF Avatar Active" : "Loading 3D Mesh..."}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          zk-SNARK Provenance Active
        </div>
      </div>

      {/* Bottom Stage Screen Node Indicator & Camera Director Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/70 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-cyan-400">⚡ Stage Screen Active Node:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            {focusedNode}
          </span>
        </div>

        {/* Camera Director Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400 px-1.5 flex items-center gap-1">🎥 DIRECTOR CAM:</span>
          {(
            [
              { id: "35mm_wide", label: "35mm Wide Stage" },
              { id: "70mm_close", label: "70mm Close-Up" },
              { id: "24mm_hero", label: "24mm Hero Angle" },
              { id: "stage_screen_focus", label: "Draw.io Zoom" },
              { id: "free_orbit", label: "3D Orbit 🔄" }
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCameraPreset(preset.id)}
              className={`px-2 py-1 rounded transition-all ${
                cameraPreset === preset.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
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
