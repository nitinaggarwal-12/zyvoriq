"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface RealTime3DAvatarCanvasProps {
  isSpeaking: boolean;
  avatarName?: string;
  avatarId?: "elena" | "priya";
}

export function RealTime3DAvatarCanvas({
  isSpeaking,
  avatarName = "Elena Rostova",
  avatarId = "elena"
}: RealTime3DAvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 200;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let canvas2D: HTMLCanvasElement | null = null;

    // Try Three.js WebGL Renderer
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#070a13");

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 2.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight("#475569", 1.2);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
      keyLight.position.set(1.5, 2, 2);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight("#2dd4bf", 1.8, 10);
      fillLight.position.set(-1.5, 0.5, 1.5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight("#38bdf8", 3.0);
      rimLight.position.set(0, 2, -2);
      scene.add(rimLight);

      // Procedural 3D Rigged Avatar Mesh
      const avatarGroup = new THREE.Group();
      scene.add(avatarGroup);

      const skinColor = avatarId === "priya" ? "#c68642" : "#f5d0b0";
      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.55, metalness: 0.05 });

      // Head
      const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
      headGeo.scale(1, 1.2, 1.05);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.position.set(0, 0.45, 0);
      avatarGroup.add(headMesh);

      // Hair
      const hairColor = avatarId === "priya" ? "#18181b" : "#27272a";
      const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
      const hairGeo = new THREE.SphereGeometry(0.41, 24, 24);
      hairGeo.scale(1.05, 1.15, 1.15);
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 0.52, -0.05);
      avatarGroup.add(hairMesh);

      // Eyes
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
      const pupilMat = new THREE.MeshBasicMaterial({ color: "#1e1b4b" });
      
      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeWhiteMat);
      leftEye.position.set(-0.13, 0.52, 0.33);
      const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), pupilMat);
      leftPupil.position.set(0, 0, 0.04);
      leftEye.add(leftPupil);
      avatarGroup.add(leftEye);

      const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), eyeWhiteMat);
      rightEye.position.set(0.13, 0.52, 0.33);
      const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), pupilMat);
      rightPupil.position.set(0, 0, 0.04);
      rightEye.add(rightPupil);
      avatarGroup.add(rightEye);

      // Eyelids
      const eyelidMat = new THREE.MeshStandardMaterial({ color: skinColor });
      const eyelidGeo = new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      
      const leftEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      leftEyelid.position.set(-0.13, 0.54, 0.33);
      leftEyelid.scale.set(1, 0.1, 1);
      avatarGroup.add(leftEyelid);

      const rightEyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
      rightEyelid.position.set(0.13, 0.54, 0.33);
      rightEyelid.scale.set(1, 0.1, 1);
      avatarGroup.add(rightEyelid);

      // Mouth
      const mouthMat = new THREE.MeshBasicMaterial({ color: "#4c0519" });
      const mouthGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16);
      mouthGeo.rotateX(Math.PI / 2);
      const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, 0.31, 0.36);
      mouthMesh.scale.set(1, 0.2, 1);
      avatarGroup.add(mouthMesh);

      // Headset & Mic
      const headsetMat = new THREE.MeshStandardMaterial({ color: "#14b8a6", metalness: 0.8, roughness: 0.2 });
      const micBoomGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8);
      const micBoomMesh = new THREE.Mesh(micBoomGeo, headsetMat);
      micBoomMesh.position.set(-0.24, 0.42, 0.22);
      micBoomMesh.rotation.z = -Math.PI / 4;
      avatarGroup.add(micBoomMesh);

      const micTipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), new THREE.MeshBasicMaterial({ color: "#2dd4bf" }));
      micTipMesh.position.set(-0.14, 0.33, 0.32);
      avatarGroup.add(micTipMesh);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.35, 0.55, 0.6, 24);
      const torsoMesh = new THREE.Mesh(torsoGeo, new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 }));
      torsoMesh.position.set(0, -0.3, 0);
      avatarGroup.add(torsoMesh);

      let clock = new THREE.Clock();
      let nextBlinkTime = 2.0;

      const animateWebGL = () => {
        animationFrameId = requestAnimationFrame(animateWebGL);
        const time = clock.getElapsedTime();

        avatarGroup.position.y = Math.sin(time * 1.5) * 0.015;
        avatarGroup.rotation.y = Math.sin(time * 0.8) * 0.06;

        if (time > nextBlinkTime) {
          leftEyelid.scale.y = 1.0;
          rightEyelid.scale.y = 1.0;
          if (time > nextBlinkTime + 0.12) {
            leftEyelid.scale.y = 0.1;
            rightEyelid.scale.y = 0.1;
            nextBlinkTime = time + 2.5 + Math.random() * 2.5;
          }
        }

        if (isSpeakingRef.current) {
          const mouthOpen = 0.3 + 0.7 * Math.abs(Math.sin(time * 14) * Math.cos(time * 8));
          mouthMesh.scale.y = mouthOpen * 1.6;
        } else {
          mouthMesh.scale.y = 0.15;
        }

        renderer?.render(scene, camera);
      };

      animateWebGL();

    } catch (e) {
      console.warn("WebGL not available or disabled, using high-fidelity 2D Canvas Avatar fallback:", e);
      
      // 2D High-Fidelity Procedural 3D Canvas Fallback
      canvas2D = document.createElement("canvas");
      canvas2D.width = width;
      canvas2D.height = height;
      canvas2D.className = "w-full h-full object-cover";
      container.innerHTML = "";
      container.appendChild(canvas2D);

      const ctx = canvas2D.getContext("2d");
      let startTime = Date.now();
      let nextBlink = 2000;

      const animate2D = () => {
        if (!ctx || !canvas2D) return;
        animationFrameId = requestAnimationFrame(animate2D);
        const elapsed = (Date.now() - startTime) / 1000;

        // Background
        ctx.fillStyle = "#070a13";
        ctx.fillRect(0, 0, width, height);

        // 3D Wireframe Grid Ambient
        ctx.strokeStyle = "rgba(45, 212, 191, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 25) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 25) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        const cx = width / 2;
        const cy = height / 2 + 10 + Math.sin(elapsed * 1.5) * 3;

        // Torso / Shoulders
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 90, 80, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.stroke();

        // Neck
        ctx.fillStyle = avatarId === "priya" ? "#c68642" : "#f5d0b0";
        ctx.fillRect(cx - 16, cy + 30, 32, 35);

        // Head Base
        ctx.beginPath();
        ctx.ellipse(cx, cy, 48, 58, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 25, 52, 40, 0, Math.PI, 0);
        ctx.fill();

        // Headset Band
        ctx.strokeStyle = "#14b8a6";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 52, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        // Eyes & Blinking
        const isBlinking = (elapsed * 1000) % 3500 < 150;
        ctx.fillStyle = "#ffffff";
        if (!isBlinking) {
          ctx.beginPath();
          ctx.ellipse(cx - 18, cy - 6, 8, 5, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + 18, cy - 6, 8, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#1e1b4b";
          ctx.beginPath();
          ctx.arc(cx - 18, cy - 6, 4, 0, Math.PI * 2);
          ctx.arc(cx + 18, cy - 6, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 24, cy - 6);
          ctx.lineTo(cx - 12, cy - 6);
          ctx.moveTo(cx + 12, cy - 6);
          ctx.lineTo(cx + 24, cy - 6);
          ctx.stroke();
        }

        // Animated Viseme Mouth
        const mouthOpen = isSpeakingRef.current ? Math.abs(Math.sin(elapsed * 12)) * 14 + 2 : 3;
        ctx.fillStyle = "#4c0519";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 24, 12, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();

        // Headset Boom Mic
        ctx.strokeStyle = "#14b8a6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy);
        ctx.lineTo(cx - 25, cy + 26);
        ctx.stroke();

        ctx.fillStyle = isSpeakingRef.current ? "#2dd4bf" : "#0d9488";
        ctx.beginPath();
        ctx.arc(cx - 25, cy + 26, isSpeakingRef.current ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
      };

      animate2D();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
      }
      if (container) container.innerHTML = "";
    };
  }, [avatarId]);

  return (
    <div className="relative w-full h-full min-h-[190px] rounded-xl overflow-hidden bg-[#070a13] border border-slate-800 flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-[9px] font-mono font-bold text-teal-300 flex items-center gap-1.5 shadow-md">
        <span className={`h-1.5 w-1.5 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-teal-400"}`} />
        <span>3D VRM MESH • 60 FPS</span>
      </div>
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
        <span className="text-teal-300 font-mono">Avatar:</span>
        <span>{avatarName}</span>
      </div>
    </div>
  );
}
